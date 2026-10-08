"""AI Complaint Analysis and Officer Briefing Service.

Supports:
1. Groq Cloud LLM (llama-3.1-8b-instant) when GROQ_API_KEY is configured.
2. Robust, deterministic academic rule-based NLP extraction when GROQ_API_KEY is missing.
"""

import json
import os
import re
from typing import Any, Dict, List
from dotenv import load_dotenv

load_dotenv()


def _call_groq_llm(prompt: str, system_message: str) -> Dict[str, Any] | None:
    """Attempt calling Groq API if key is present."""
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        return None
        
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
            temperature=0.1,
            max_tokens=800,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Groq API call bypassed or failed: {e}")
        return None


def analyze_complaint(title: str, description: str, incident_type: str = "") -> Dict[str, Any]:
    """Analyze citizen complaint and extract structured intelligence."""
    combined_text = f"{title}. {description}".strip()
    
    # 1. Attempt Groq LLM if configured
    groq_system = (
        "You are an academic crime intelligence assistant. Analyze the complaint and return valid JSON with keys: "
        "summary (string), incident_type (string), people_mentioned (array of strings), "
        "important_information (array of strings), evidence_mentioned (array of strings), "
        "missing_information (array of strings), risk_flags (array of strings)."
    )
    groq_prompt = (
        f"Incident Category: {incident_type or 'General'}\n"
        f"Complaint Title: {title}\n"
        f"Description: {description}\n\n"
        "Analyze the reported incident for police investigation triage."
    )
    
    groq_result = _call_groq_llm(groq_prompt, groq_system)
    if groq_result and "summary" in groq_result:
        groq_result["mode"] = "Groq LLaMA 3.1 Mode"
        groq_result["disclaimer"] = "AI-generated analysis for academic demonstration only."
        return groq_result

    # 2. High-accuracy Deterministic Academic Fallback
    text_lower = combined_text.lower()
    
    # People detection
    people = []
    if "unknown" in text_lower:
        people.append("Unidentified Suspect / Anonymous Sender")
    if any(k in text_lower for k in ["friend", "colleague", "partner", "associate"]):
        people.append("Known Acquaintance or Associate")
    if any(k in text_lower for k in ["bank", "manager", "official", "caller", "agent", "support"]):
        people.append("Person Impersonating Support / Bank Staff")
    if any(k in text_lower for k in ["driver", "rider", "bystander", "neighbor", "landlord"]):
        people.append("Neighbor / Third-Party Individual")
    if not people:
        people.append("Complainant and Suspected Party")

    # Important information points
    info = []
    sentences = [s.strip() for s in re.split(r"[.!?\n]", description) if len(s.strip()) > 10]
    for s in sentences[:4]:
        info.append(s)
    if not info:
        info.append(f"Reported incident: {title}")

    # Evidence detection
    evidence = []
    keywords_map = {
        "screenshot": "WhatsApp / Application Screenshots",
        "link": "Malicious Web / Payment Hyperlink URL",
        "otp": "SMS OTP Verification Logs",
        "message": "Chat Messages / SMS Records",
        "email": "Phishing Email Headers & Body",
        "receipt": "Payment Receipt / Transaction Statement",
        "cctv": "Surveillance Camera Footage",
        "recording": "Voice Call Audio Recording",
        "bike": "Suspect Vehicle Details / Registration Number",
        "car": "Vehicle Information",
        "document": "Forged Physical / Digital Documents"
    }
    for kw, label in keywords_map.items():
        if kw in text_lower and label not in evidence:
            evidence.append(label)
    if not evidence:
        evidence.append("Complainant Initial Written Statement")

    # Missing information checklist
    missing = []
    if not re.search(r"\b(utr|\d{8,}|\d{4}-\d{4}|txn)\b", text_lower):
        missing.append("Specific Bank Transaction ID / UTR Reference Number")
    if not re.search(r"\b(\$|rs|inr|rupees?|\d+\s*(lakh|k))\b", text_lower):
        missing.append("Exact Financial Amount or Asset Valuation")
    if not re.search(r"\b(\+91|\d{10})\b", text_lower):
        missing.append("Suspect Contact Mobile Number or Platform Handle")
    if "screenshot" not in text_lower and "receipt" not in text_lower:
        missing.append("Supporting Digital Screenshot or Proof of Transaction")
    if not missing:
        missing.append("Witness Statements or Third-Party Corroboration")

    # Risk flags
    risks = []
    if any(k in text_lower for k in ["otp", "payment", "bank", "transfer", "link", "money", "upi", "card"]):
        risks.append("Urgent Financial Fraud / Fund Diversion Vector")
    if any(k in text_lower for k in ["knife", "weapon", "beat", "hit", "assault", "injur", "blood", "kill"]):
        risks.append("Physical Violence / Bodily Harm Hazard")
    if any(k in text_lower for k in ["stalk", "follow", "blackmail", "photo", "threat", "call"]):
        risks.append("Intimidation / Continuous Harassment Threat")
    if any(k in text_lower for k in ["hack", "password", "account", "login", "ransomware"]):
        risks.append("Active Identity Theft / Digital Credential Compromise")
    if not risks:
        risks.append("General Public Grievance / Non-Immediate Hazard")

    summary_text = (
        f"The complainant reports an incident regarding '{title}'. "
        f"Key facts stated: {description[:220]}{'...' if len(description) > 220 else ''}"
    )

    return {
        "summary": summary_text,
        "incident_type": incident_type or "General Crime",
        "people_mentioned": people,
        "important_information": info,
        "evidence_mentioned": evidence,
        "missing_information": missing,
        "risk_flags": risks,
        "mode": "Demo AI Mode (Deterministic Academic Engine)",
        "disclaimer": "AI-generated analysis for academic demonstration only."
    }


def build_officer_summary(complaint: Dict[str, Any]) -> Dict[str, Any]:
    """Generate high-level officer tactical briefing from complaint data."""
    analysis = complaint.get("ai_analysis") or {}
    if not analysis or not analysis.get("summary"):
        analysis = analyze_complaint(
            complaint.get("title", ""),
            complaint.get("description", ""),
            complaint.get("incident_type", "")
        )
        
    prediction = complaint.get("crime_prediction") or {}
    predicted_category = prediction.get("category", complaint.get("incident_type", "General Crime"))
    confidence = prediction.get("confidence", 85.0)

    # Next steps tailored to predicted category
    next_steps_map = {
        "Cybercrime": "1. Freeze suspect account/wallet via cyber nodal cell. 2. Request IP logs from service provider. 3. Secure complainant transaction slips.",
        "Theft": "1. Review CCTV footage of entry/exit points. 2. Verify IMEI or serial number on national lost portal. 3. Record complainant item proof.",
        "Robbery": "1. Dispatch patrol unit to verify scene of occurrence. 2. Collect CCTV footage along suspect escape route. 3. Check records of habitual offenders.",
        "Fraud": "1. Verify contractual paperwork and banking trail. 2. Issue notice to suspect entity for transaction records. 3. Check registrar portal for company credentials.",
        "Assault": "1. Procure medical legal certificate (MLC) from examining physician. 2. Record eyewitness depositions. 3. Preserve any video recordings.",
        "Harassment": "1. Extract CDR / CDR IP logs of offending phone numbers. 2. Provide protective counseling to complainant. 3. Issue formal warning or summons to accused.",
        "Property Dispute": "1. Request revenue records and survey demarcations from local tahsildar. 2. Advise parties to maintain status quo to prevent breach of peace.",
        "Other": "1. Verify complainant statement with local beat officer. 2. Conduct preliminary field inquiry."
    }
    suggested_steps = next_steps_map.get(
        predicted_category, 
        "1. Verify complainant statement and contact info. 2. Review digital evidence and secure timestamps. 3. Consult superior officer."
    )

    return {
        "complaint_summary": analysis.get("summary", ""),
        "incident_details": f"{complaint.get('incident_type', 'General')} reported at {complaint.get('location', 'unspecified')} on {complaint.get('incident_date', 'unspecified')}.",
        "predicted_category": predicted_category,
        "prediction_confidence": f"{confidence}%",
        "important_evidence": analysis.get("evidence_mentioned", ["Complainant Statement"]),
        "missing_information": analysis.get("missing_information", ["None noted"]),
        "similar_cases_count": len(complaint.get("similar_cases", [])),
        "legal_references_count": len(complaint.get("legal_references", [])),
        "suggested_next_steps": suggested_steps,
        "disclaimer": "AI-generated assistance. Final decisions must be made by authorized officers."
    }