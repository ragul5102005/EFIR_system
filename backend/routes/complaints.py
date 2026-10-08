"""Complaint Management and Evidence Routes."""

from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from services.evidence_service import is_allowed, metadata
from services.pdf_service import create_report
from utils.json_storage import append_json, load_json, save_json

router = APIRouter(prefix="", tags=["Complaints"])

ROOT = Path(__file__).resolve().parent.parent
UPLOAD_DIR = ROOT / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
REPORT_DIR = ROOT / "generated_reports"
REPORT_DIR.mkdir(exist_ok=True)

ALLOWED_STATUSES = {"SUBMITTED", "UNDER_REVIEW", "INVESTIGATION", "ACTION_TAKEN", "CLOSED"}


class ComplaintCreate(BaseModel):
    citizen_id: int
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    incident_date: str
    location: str = Field(min_length=2, max_length=200)
    incident_type: str = Field(default="Cybercrime", min_length=2, max_length=100)
    people_involved: str = "Unknown"
    contact_info: str = Field(min_length=3, max_length=200)


class StatusUpdate(BaseModel):
    status: str = Field(min_length=2, max_length=40)
    updated_by: str = Field(default="Investigating Officer", min_length=2, max_length=200)
    note: str = Field(default="Status updated in police command console.", max_length=1000)


class NoteCreate(BaseModel):
    note: str = Field(min_length=3, max_length=1000)
    updated_by: str = Field(default="Officer", min_length=2, max_length=100)


def _next_complaint_id(complaints: List[Dict[str, Any]]) -> str:
    year = date.today().year
    sequence = 0
    for item in complaints:
        complaint_id = str(item.get("id", ""))
        if complaint_id.startswith(f"AFR-{year}-"):
            try:
                seq_num = int(complaint_id.rsplit("-", 1)[-1])
                sequence = max(sequence, seq_num)
            except ValueError:
                pass
    return f"AFR-{year}-{sequence + 1:04d}"


def _find_complaint(complaint_id: str) -> Dict[str, Any]:
    complaints = load_json("complaints", default=[])
    complaint = next((item for item in complaints if item.get("id") == complaint_id), None)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint record not found.")
    return complaint


def _save_complaint(updated: Dict[str, Any]) -> Dict[str, Any]:
    complaints = load_json("complaints", default=[])
    for index, item in enumerate(complaints):
        if item.get("id") == updated.get("id"):
            complaints[index] = updated
            save_json("complaints", complaints)
            return updated
    raise HTTPException(status_code=404, detail="Complaint record not found.")


@router.get("/complaints")
@router.get("/api/complaints")
def list_complaints(
    citizen_id: Optional[int] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    search: Optional[str] = Query(default=None)
) -> List[Dict[str, Any]]:
    complaints = load_json("complaints", default=[])
    
    if citizen_id is not None:
        complaints = [item for item in complaints if item.get("citizen_id") == citizen_id]
        
    if status_filter:
        complaints = [item for item in complaints if item.get("status") == status_filter]
        
    if search and search.strip():
        term = search.casefold().strip()
        complaints = [
            item for item in complaints
            if term in item.get("title", "").casefold()
            or term in item.get("description", "").casefold()
            or term in item.get("id", "").casefold()
            or term in item.get("location", "").casefold()
            or term in item.get("incident_type", "").casefold()
        ]
        
    return complaints


@router.get("/complaints/{complaint_id}")
@router.get("/api/complaints/{complaint_id}")
def get_complaint(complaint_id: str) -> Dict[str, Any]:
    complaint = _find_complaint(complaint_id)
    history = [item for item in load_json("status_history", default=[]) if item.get("complaint_id") == complaint_id]
    all_evidence = [item for item in load_json("evidence", default=[]) if item.get("complaint_id") == complaint_id]
    
    # Merge existing in-complaint evidence with any global records
    existing_evidence = complaint.get("evidence", [])
    merged_evidence = {e.get("id"): e for e in existing_evidence + all_evidence if e.get("id")}
    
    return {
        **complaint,
        "status_history": history,
        "evidence": list(merged_evidence.values())
    }


from services.ai_service import analyze_complaint
from services.classifier import predict
from services.retrieval_service import legal_references, similar_cases

@router.post("/complaints", status_code=status.HTTP_201_CREATED)
@router.post("/api/complaints", status_code=status.HTTP_201_CREATED)
def create_complaint(payload: ComplaintCreate) -> Dict[str, Any]:
    users = load_json("users", default=[])
    citizen = next((u for u in users if u.get("id") == payload.citizen_id), None)
    if not citizen:
        raise HTTPException(status_code=400, detail="Complainant citizen account not found.")

    complaints = load_json("complaints", default=[])
    complaint_id = _next_complaint_id(complaints)
    
    text = f"{payload.title} {payload.description} {payload.incident_type}"
    
    # Run immediate AI Triage
    try:
        ai_analysis = analyze_complaint(payload.title, payload.description, payload.incident_type)
    except Exception as e:
        ai_analysis = {"error": str(e), "summary": f"Reported incident: {payload.title}"}
        
    try:
        crime_prediction = predict(text)
    except Exception as e:
        crime_prediction = {"category": payload.incident_type, "confidence": 85.0}
        
    try:
        cases = load_json("cases", default=[])
        sim_cases = similar_cases(f"{payload.title} {payload.description}", cases, limit=3)
    except Exception as e:
        sim_cases = []
        
    try:
        docs = load_json("legal_documents", default=[])
        leg_refs = legal_references(text, docs, limit=3)
    except Exception as e:
        leg_refs = []
    
    new_complaint = {
        "id": complaint_id,
        "citizen_id": payload.citizen_id,
        "citizen_name": citizen.get("name", "Citizen"),
        "title": payload.title,
        "description": payload.description,
        "incident_date": payload.incident_date,
        "location": payload.location,
        "incident_type": payload.incident_type,
        "people_involved": payload.people_involved,
        "contact_info": payload.contact_info,
        "status": "SUBMITTED",
        "created_at": date.today().isoformat(),
        "ai_analysis": ai_analysis,
        "crime_prediction": crime_prediction,
        "legal_references": leg_refs,
        "similar_cases": sim_cases,
        "evidence": [],
        "investigation_notes": []
    }
    
    append_json("complaints", new_complaint)
    
    history_entry = {
        "complaint_id": complaint_id,
        "status": "SUBMITTED",
        "updated_at": date.today().isoformat(),
        "updated_by": citizen.get("name", "Citizen"),
        "note": "Complaint lodged by citizen via citizen portal with automated AI triage & FAISS indexing."
    }
    append_json("status_history", history_entry)
    
    return new_complaint


@router.patch("/complaints/{complaint_id}/status")
@router.patch("/api/complaints/{complaint_id}/status")
@router.put("/complaints/{complaint_id}/status")
@router.put("/api/complaints/{complaint_id}/status")
def update_status(complaint_id: str, payload: StatusUpdate) -> Dict[str, Any]:
    if payload.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Allowed: {', '.join(sorted(ALLOWED_STATUSES))}"
        )
        
    complaint = _find_complaint(complaint_id)
    complaint["status"] = payload.status
    _save_complaint(complaint)
    
    history_entry = {
        "complaint_id": complaint_id,
        "status": payload.status,
        "updated_at": date.today().isoformat(),
        "updated_by": payload.updated_by,
        "note": payload.note
    }
    append_json("status_history", history_entry)
    
    return {"complaint": complaint, "history_entry": history_entry}


@router.post("/complaints/{complaint_id}/notes")
@router.post("/api/complaints/{complaint_id}/notes")
def add_investigation_note(complaint_id: str, payload: NoteCreate) -> Dict[str, Any]:
    complaint = _find_complaint(complaint_id)
    note_entry = {
        "note": payload.note,
        "updated_by": payload.updated_by,
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    complaint.setdefault("investigation_notes", []).append(note_entry)
    _save_complaint(complaint)
    return complaint


@router.post("/complaints/{complaint_id}/evidence")
@router.post("/api/complaints/{complaint_id}/evidence")
async def upload_evidence(complaint_id: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    complaint = _find_complaint(complaint_id)
    if not file.filename or not is_allowed(file.filename):
        raise HTTPException(status_code=400, detail="Allowed file types: jpg, jpeg, png, pdf, txt.")
        
    safe_name = Path(file.filename).name
    target_path = UPLOAD_DIR / f"{complaint_id}_{safe_name}"
    content = await file.read()
    target_path.write_bytes(content)
    
    all_evidence = load_json("evidence", default=[])
    item_id = f"EVD-{len(all_evidence) + 1:04d}"
    
    item = {
        "id": item_id,
        "complaint_id": complaint_id,
        "stored_path": str(target_path),
        **metadata(str(target_path), safe_name)
    }
    
    append_json("evidence", item)
    complaint.setdefault("evidence", []).append(item)
    _save_complaint(complaint)
    
    return item


@router.get("/complaints/{complaint_id}/pdf")
@router.get("/api/complaints/{complaint_id}/pdf")
def generate_pdf(complaint_id: str) -> StreamingResponse:
    complaint = _find_complaint(complaint_id)
    users = load_json("users", default=[])
    citizen = next((u.get("name") for u in users if u.get("id") == complaint.get("citizen_id")), "Citizen")
    
    pdf_buffer = create_report(complaint, citizen_name=citizen)
    
    # Save a cached copy on disk
    cache_path = REPORT_DIR / f"{complaint_id}.pdf"
    cache_path.write_bytes(pdf_buffer.getvalue())
    pdf_buffer.seek(0)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={complaint_id}_Report.pdf"}
    )
