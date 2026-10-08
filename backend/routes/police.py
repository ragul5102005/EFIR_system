"""Police Console & Knowledge Base Routes."""

from collections import Counter
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query
from utils.json_storage import load_json

router = APIRouter(prefix="", tags=["Police Console"])


@router.get("/police/stats")
@router.get("/api/police/stats")
def get_police_dashboard_stats() -> Dict[str, Any]:
    """Provide comprehensive aggregated metrics for police command console."""
    complaints = load_json("complaints", default=[])
    
    status_counts = Counter(c.get("status", "SUBMITTED") for c in complaints)
    category_counts = Counter(c.get("incident_type", "Other") for c in complaints)
    
    # Identify complaints with high risk flags
    high_risk_cases = []
    for c in complaints:
        ai_data = c.get("ai_analysis") or {}
        risks = ai_data.get("risk_flags", [])
        if risks and any("fraud" in r.lower() or "violence" in r.lower() or "threat" in r.lower() for r in risks):
            high_risk_cases.append({
                "id": c.get("id"),
                "title": c.get("title"),
                "incident_type": c.get("incident_type"),
                "status": c.get("status"),
                "risks": risks
            })
            
    return {
        "total_complaints": len(complaints),
        "submitted": status_counts.get("SUBMITTED", 0),
        "under_review": status_counts.get("UNDER_REVIEW", 0),
        "investigation": status_counts.get("INVESTIGATION", 0),
        "action_taken": status_counts.get("ACTION_TAKEN", 0),
        "closed": status_counts.get("CLOSED", 0),
        "category_distribution": dict(category_counts),
        "high_risk_count": len(high_risk_cases),
        "high_risk_alerts": high_risk_cases[:5]
    }


@router.get("/cases")
@router.get("/api/cases")
def list_cases(search: Optional[str] = Query(default=None)) -> List[Dict[str, Any]]:
    cases = load_json("cases", default=[])
    if not search or not search.strip():
        return cases
    term = search.casefold().strip()
    return [
        c for c in cases
        if term in c.get("title", "").casefold() or term in c.get("description", "").casefold() or term in c.get("id", "").casefold()
    ]


@router.get("/legal-documents")
@router.get("/api/legal-documents")
def list_legal_documents(search: Optional[str] = Query(default=None)) -> List[Dict[str, Any]]:
    docs = load_json("legal_documents", default=[])
    if not search or not search.strip():
        return docs
    term = search.casefold().strip()
    return [
        d for d in docs
        if term in d.get("title", "").casefold() or term in d.get("content", "").casefold() or term in d.get("id", "").casefold()
    ]
