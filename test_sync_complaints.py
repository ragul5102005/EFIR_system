import sys
from pathlib import Path
sys.path.insert(0, str(Path("backend").resolve()))

from utils.json_storage import load_json, save_json
from services.classifier import predict
from services.ai_service import analyze_complaint
from services.retrieval_service import similar_cases, legal_references

complaints = load_json("complaints", default=[])
cases = load_json("cases", default=[])
docs = load_json("legal_documents", default=[])

print(f"Refreshing {len(complaints)} complaints with latest FAISS & RAG...")
for c in complaints:
    text = f"{c.get('title', '')} {c.get('description', '')}"
    full_text = f"{text} {c.get('incident_type', '')}"
    
    # 1. AI Analysis
    c["ai_analysis"] = analyze_complaint(
        c.get("title", ""),
        c.get("description", ""),
        c.get("incident_type", "")
    )
    # 2. Prediction
    c["crime_prediction"] = predict(full_text)
    # 3. FAISS Similar Cases
    c["similar_cases"] = similar_cases(text, cases, limit=3)
    # 4. Legal RAG
    c["legal_references"] = legal_references(full_text, docs, limit=3)

save_json("complaints", complaints)
print("All existing complaints successfully synchronized with rich FAISS and RAG data!")
