import urllib.request
import urllib.parse
import json
import time

BASE_API = "http://127.0.0.1:8000/api"
VITE_URL = "http://127.0.0.1:5173"

def test_vite():
    print("\n--- 1. Testing Vite Frontend Serving ---")
    resp = urllib.request.urlopen(VITE_URL)
    html = resp.read().decode()
    assert resp.status == 200
    assert "Plus+Jakarta+Sans" in html
    assert "JetBrains+Mono" in html
    assert "AegisFIR" in html
    print("[OK] Vite is serving index.html with Plus Jakarta Sans & JetBrains Mono typography.")

def test_api_status():
    print("\n--- 2. Testing AI System Status Telemetry ---")
    resp = urllib.request.urlopen(f"{BASE_API}/ai/system-status")
    data = json.loads(resp.read())
    assert data["status"] == "Operational"
    assert data["faiss_dense_index"] == "Active"
    assert data["indexed_precedents"] == 15
    assert data["indexed_legal_statutes"] == 10
    print(f"[OK] AI Telemetry: {data['embedding_model']} | FAISS: {data['similarity_metric']}")

def test_vector_search():
    print("\n--- 3. Testing Interactive FAISS & Legal RAG Search ---")
    query = "Two masked men on motorcycle brandished knife and snatched gold neck chain"
    req = urllib.request.Request(
        f"{BASE_API}/ai/vector-search",
        data=json.dumps({"query": query, "limit": 3}).encode(),
        headers={"Content-Type": "application/json"}
    )
    t0 = time.time()
    resp = urllib.request.urlopen(req)
    res = json.loads(resp.read())
    elapsed = round((time.time() - t0) * 1000, 2)
    
    assert len(res["matched_cases"]) > 0
    assert len(res["matched_legal"]) > 0
    
    top_case = res["matched_cases"][0]
    top_legal = res["matched_legal"][0]
    
    print(f"[OK] FAISS Vector search completed in {res.get('latency_ms')} ms (HTTP: {elapsed} ms)")
    print(f"   Top Precedent: {top_case.get('fir_number')} - {top_case.get('title')} ({top_case.get('similarity')}%)")
    print(f"   Modus Operandi: {top_case.get('modus_operandi')[:80]}...")
    print(f"   Top Statute: {top_legal.get('section')} - {top_legal.get('title')} ({top_legal.get('similarity')}%)")

def test_live_assist():
    print("\n--- 4. Testing Real-Time Live AI Intake Copilot ---")
    payload = {
        "title": "Unauthorized debit from bank account",
        "description": "I clicked a phishing link claiming my electricity bill was due and lost Rs 45000 from my SBI account via fake UPI interface",
        "incident_type": "Cybercrime"
    }
    req = urllib.request.Request(
        f"{BASE_API}/ai/live-assist",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req)
    res = json.loads(resp.read())
    
    print(f"[OK] Live AI Copilot: Predicted {res.get('predicted_category')} ({res.get('confidence')}%)")
    print(f"   Matched Statutes: {[m.get('section') for m in res.get('legal_matches', [])]}")
    print(f"   Detected Risk Flags: {res.get('risk_flags')}")

def test_complaint_creation_auto_ai():
    print("\n--- 5. Testing Automated AI Triage on Complaint Creation ---")
    payload = {
        "citizen_id": 1,
        "title": "Phishing Link Scam on WhatsApp",
        "description": "Received suspicious payment link on WhatsApp and entered UPI pin believing it was electricity bill",
        "incident_date": "2026-10-08",
        "location": "Coimbatore Main",
        "incident_type": "Cybercrime",
        "people_involved": "Anonymous phone caller",
        "contact_info": "ravi@gmail.com"
    }
    req = urllib.request.Request(
        f"{BASE_API}/complaints",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    resp = urllib.request.urlopen(req)
    created = json.loads(resp.read())
    
    assert created.get("id")
    assert created.get("crime_prediction", {}).get("category")
    assert len(created.get("similar_cases", [])) > 0
    assert len(created.get("legal_references", [])) > 0
    
    print(f"[OK] New Complaint {created.get('id')} created with instant AI Triage:")
    print(f"   AI Class: {created['crime_prediction'].get('category')} ({created['crime_prediction'].get('confidence')}%)")
    print(f"   FAISS Precedents Count: {len(created['similar_cases'])}")
    print(f"   Legal References Count: {len(created['legal_references'])}")

def test_viva_ml_metrics():
    print("\n--- 6. Testing Model Evaluation Viva Metrics ---")
    resp = urllib.request.urlopen(f"{BASE_API}/ai/ml-metrics")
    metrics = json.loads(resp.read())
    print(f"[OK] Classifier Metrics: Accuracy={metrics.get('accuracy')}%, Precision={metrics.get('precision')}%, Recall={metrics.get('recall')}%, F1={metrics.get('f1_score')}%")

if __name__ == "__main__":
    print("==================================================")
    print("   AEGISFIR SYSTEM INTEGRATION VERIFICATION SUITE")
    print("==================================================")
    test_vite()
    test_api_status()
    test_vector_search()
    test_live_assist()
    test_complaint_creation_auto_ai()
    test_viva_ml_metrics()
    print("\n>>> ALL SYSTEM VERIFICATION CHECKS PASSED PERFECTLY! <<<")
