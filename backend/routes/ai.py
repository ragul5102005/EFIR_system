"""AI and Machine Learning Intelligence Routes."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.ai_service import analyze_complaint, build_officer_summary
from services.classifier import predict, get_metrics
from services.retrieval_service import legal_references, similar_cases, vector_search_workbench
from utils.json_storage import load_json, save_json

router = APIRouter(prefix="", tags=["AI & ML Intelligence"])


class VectorSearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=1000)
    limit: Optional[int] = 4


class LiveAssistRequest(BaseModel):
    title: str = ""
    description: str = ""
    incident_type: Optional[str] = "Cybercrime"


def _find_complaint(complaint_id: str) -> Dict[str, Any]:
    complaints = load_json("complaints", default=[])
    complaint = next((c for c in complaints if c.get("id") == complaint_id), None)
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


@router.post("/complaints/{complaint_id}/analyze")
@router.get("/complaints/{complaint_id}/analyze")
@router.post("/api/complaints/{complaint_id}/analyze")
@router.get("/api/complaints/{complaint_id}/analyze")
def run_ai_analysis(complaint_id: str) -> Dict[str, Any]:
    complaint = _find_complaint(complaint_id)
    analysis = analyze_complaint(
        complaint.get("title", ""),
        complaint.get("description", ""),
        complaint.get("incident_type", "")
    )
    complaint["ai_analysis"] = analysis
    _save_complaint(complaint)
    return analysis


@router.post("/complaints/{complaint_id}/predict")
@router.get("/complaints/{complaint_id}/predict")
@router.post("/api/complaints/{complaint_id}/predict")
@router.get("/api/complaints/{complaint_id}/predict")
def run_crime_prediction(complaint_id: str) -> Dict[str, Any]:
    complaint = _find_complaint(complaint_id)
    text = f"{complaint.get('title', '')} {complaint.get('description', '')} {complaint.get('incident_type', '')}"
    prediction = predict(text)
    complaint["crime_prediction"] = prediction
    _save_complaint(complaint)
    return prediction


@router.post("/complaints/{complaint_id}/similar")
@router.get("/complaints/{complaint_id}/similar")
@router.post("/api/complaints/{complaint_id}/similar")
@router.get("/api/complaints/{complaint_id}/similar")
def run_similar_cases(complaint_id: str) -> List[Dict[str, Any]]:
    complaint = _find_complaint(complaint_id)
    cases = load_json("cases", default=[])
    query = f"{complaint.get('title', '')} {complaint.get('description', '')}"
    results = similar_cases(query, cases, limit=3)
    complaint["similar_cases"] = results
    _save_complaint(complaint)
    return results


@router.post("/complaints/{complaint_id}/legal")
@router.get("/complaints/{complaint_id}/legal")
@router.post("/api/complaints/{complaint_id}/legal")
@router.get("/api/complaints/{complaint_id}/legal")
def run_legal_rag(complaint_id: str) -> List[Dict[str, Any]]:
    complaint = _find_complaint(complaint_id)
    documents = load_json("legal_documents", default=[])
    query = f"{complaint.get('title', '')} {complaint.get('description', '')} {complaint.get('incident_type', '')}"
    results = legal_references(query, documents, limit=3)
    complaint["legal_references"] = results
    _save_complaint(complaint)
    return results


@router.post("/complaints/{complaint_id}/summary")
@router.get("/complaints/{complaint_id}/summary")
@router.post("/api/complaints/{complaint_id}/summary")
@router.get("/api/complaints/{complaint_id}/summary")
def get_officer_summary(complaint_id: str) -> Dict[str, Any]:
    complaint = _find_complaint(complaint_id)
    return build_officer_summary(complaint)


@router.post("/complaints/{complaint_id}/run-all-ai")
@router.post("/api/complaints/{complaint_id}/run-all-ai")
def run_all_ai_workflows(complaint_id: str) -> Dict[str, Any]:
    """Execute the entire AI suite (Analysis + ML + FAISS Similar + Legal RAG) atomically."""
    complaint = _find_complaint(complaint_id)
    
    text = f"{complaint.get('title', '')} {complaint.get('description', '')}"
    
    # 1. AI Analysis
    analysis = analyze_complaint(
        complaint.get("title", ""),
        complaint.get("description", ""),
        complaint.get("incident_type", "")
    )
    complaint["ai_analysis"] = analysis
    
    # 2. ML Prediction
    prediction = predict(f"{text} {complaint.get('incident_type', '')}")
    complaint["crime_prediction"] = prediction
    
    # 3. Similar Cases (FAISS dense vector index)
    cases = load_json("cases", default=[])
    complaint["similar_cases"] = similar_cases(text, cases, limit=3)
    
    # 4. Legal RAG (FAISS dense vector index)
    docs = load_json("legal_documents", default=[])
    complaint["legal_references"] = legal_references(f"{text} {complaint.get('incident_type', '')}", docs, limit=3)
    
    # Save everything
    _save_complaint(complaint)
    
    # Return updated complaint plus officer briefing
    officer_briefing = build_officer_summary(complaint)
    return {
        "complaint": complaint,
        "officer_summary": officer_briefing,
        "status": "All AI workflows completed successfully."
    }


@router.post("/ai/vector-search")
@router.post("/api/ai/vector-search")
def execute_vector_search(payload: VectorSearchRequest) -> Dict[str, Any]:
    """Interactive Vector Search Workbench: queries FAISS indices directly and returns similarity benchmarks."""
    cases = load_json("cases", default=[])
    documents = load_json("legal_documents", default=[])
    return vector_search_workbench(payload.query, cases, documents, limit=payload.limit or 4)


@router.post("/ai/live-assist")
@router.post("/api/ai/live-assist")
def execute_live_intake_assist(payload: LiveAssistRequest) -> Dict[str, Any]:
    """Live interactive assistant for complaint intake form."""
    text = f"{payload.title} {payload.description}".strip()
    if len(text) < 5:
        return {
            "predicted_category": payload.incident_type or "Cybercrime",
            "confidence": 0,
            "legal_matches": [],
            "risk_flags": []
        }
        
    prediction = predict(text)
    docs = load_json("legal_documents", default=[])
    top_legal = legal_references(text, docs, limit=2)
    
    # Quick risk flag extraction
    quick_analysis = analyze_complaint(payload.title, payload.description, payload.incident_type or "")
    
    return {
        "predicted_category": prediction.get("category", "General"),
        "confidence": prediction.get("confidence", 70.0),
        "top_categories": prediction.get("top_categories", []),
        "legal_matches": top_legal,
        "risk_flags": quick_analysis.get("risk_flags", [])
    }


@router.get("/ai/system-status")
@router.get("/api/ai/system-status")
def get_ai_system_telemetry() -> Dict[str, Any]:
    """Real-time engine status telemetry for AI and FAISS subsystems."""
    cases = load_json("cases", default=[])
    docs = load_json("legal_documents", default=[])
    return {
        "status": "Operational",
        "faiss_dense_index": "Active",
        "embedding_model": "all-MiniLM-L6-v2 (384-dimensional dense vectors)",
        "similarity_metric": "Cosine Similarity (Inner Product)",
        "indexed_precedents": len(cases),
        "indexed_legal_statutes": len(docs),
        "ml_classifier": "TF-IDF N-Gram + Logistic Regression (Multi-Class Softmax)",
        "rag_pipeline": "SentenceTransformer dense vector retrieval with statutory IPC/BNS/IT Act concordance"
    }


@router.get("/ai/ml-metrics")
@router.get("/api/ai/ml-metrics")
def get_model_evaluation_metrics() -> Dict[str, Any]:
    """Retrieve TF-IDF + Logistic Regression evaluation metrics for student viva presentation."""
    return get_metrics()
