# AegisFIR — AI-Assisted Smart Complaint Management & Crime Intelligence System

> **Academic Final-Year CSE(AIML) Capstone Project**  
> A simple, database-free, AI-assisted crime intelligence & citizen grievance management platform powered by **FastAPI**, **React (Vite + Tailwind CSS)**, **scikit-learn**, **SentenceTransformers**, **FAISS**, and **ReportLab**.

---

## 1. Project Overview

**AegisFIR** demonstrates how modern Artificial Intelligence and Machine Learning techniques can assist both citizens and law enforcement officers during the initial complaint lodging and triage process:
- **For Citizens:** Simple filing with 1-click test scenarios, cryptographic SHA-256 evidence hashing, instant AI analysis, and real-time status tracking.
- **For Police Officers:** Automated crime classification, top probability breakdowns, statutory legal RAG retrieval, historical case precedent detection, and tactical investigation briefings.
- **Academic Focus:** Designed with zero complex enterprise dependencies (No SQL/NoSQL databases, No Redis/Celery, No Docker/Kubernetes). All state is stored in human-readable JSON files (`backend/data/`).

---

## 2. Key Features

- 🧠 **Machine Learning Crime Classification:** TF-IDF + Logistic Regression trained on 960 synthetic complaints across 8 categories (Cybercrime, Theft, Robbery, Fraud, Assault, Harassment, Property Dispute, Other) with 98%+ accuracy, F1-scores, and top probability distributions.
- ✨ **AI Complaint Analysis:** Structured extraction of Executive Summary, Risk Flags, People Involved, and Missing Investigation Facts (supports Groq LLaMA 3.1 Cloud LLM or deterministic local academic NLP engine).
- ⚖️ **Statutory Legal RAG:** Dense 384-dimensional vector retrieval using SentenceTransformers (`all-MiniLM-L6-v2`) and FAISS (`IndexFlatIP`), providing plain-English statutory explanations with academic disclaimers.
- 🔍 **Historical Precedent Matching:** Vector similarity search ranking past resolved complaints with similarity percentages.
- 🛡️ **Forensic Evidence Vault:** Automatically calculates SHA-256 cryptographic checksums, image dimensions (PIL), and PDF page counts (PyPDF2) with one-click copy.
- 📄 **ReportLab PDF Generator:** One-click generation of structured A4 academic complaint dossiers with disclaimers.
- ⚡ **1-Click Demo Scenarios:** Instant pre-fill buttons for Cybercrime (WhatsApp Payment Scam), Theft (Metro Mobile Snatching), and Harassment for viva presentations.
- 📊 **Viva Model Inspector:** Interactive modal showing student examiners the ML training parameters, dataset distribution, and evaluation metrics.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, React Router v7, Axios |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, Uvicorn |
| **Data Storage** | Plain JSON Files (`backend/data/`) with atomic file helper (`json_storage.py`) |
| **Machine Learning** | scikit-learn (TF-IDF + Logistic Regression), joblib, NumPy, Pandas |
| **Vector Search / RAG** | SentenceTransformers (`all-MiniLM-L6-v2`), FAISS (`faiss-cpu`) |
| **LLM (Optional)** | Groq API (`llama-3.1-8b-instant`) with deterministic offline fallback |
| **Document Generation**| ReportLab (A4 PDF Engine) |

---

## 4. System Architecture

```text
React Frontend (Vite + Tailwind CSS + Lucide)
       │
       │ HTTP / JSON API (Port 8000)
       ▼
FastAPI Backend Server
       ├── Authentication & Profile (/api/auth)
       ├── Complaint Intake & Status (/api/complaints)
       ├── Forensic Evidence Hasher (SHA-256 / PIL / PyPDF2)
       │
       ├── AI Intelligence Engine (/api/ai)
       │    ├── ML Crime Classifier (TF-IDF + Logistic Regression)
       │    ├── Vector Precedent Search (SentenceTransformers + FAISS)
       │    ├── Legal RAG Assistant (FAISS 384-d Cosine Vector Space)
       │    └── NLP / Groq Analysis (Extraction + Officer Briefing)
       │
       ├── PDF Generator (ReportLab A4 Dossier)
       │
       └── JSON Data Layer (backend/data/*.json)
```

---

## 5. Folder Structure

```text
EFIR_system/
│
├── backend/
│   ├── main.py                     # FastAPI entry point & CORS
│   │
│   ├── routes/
│   │   ├── auth.py                 # Login, register, profile
│   │   ├── complaints.py           # Complaint CRUD, status, evidence, PDF
│   │   ├── ai.py                   # Single & atomic AI pipeline endpoints
│   │   └── police.py               # Officer stats & knowledge base
│   │
│   ├── services/
│   │   ├── ai_service.py           # Groq LLM + deterministic NLP analysis
│   │   ├── classifier.py           # ML inference & model evaluator
│   │   ├── retrieval_service.py    # SentenceTransformers + FAISS similarity
│   │   ├── evidence_service.py     # SHA-256 hashing & metadata extractor
│   │   └── pdf_service.py          # ReportLab A4 dossier generator
│   │
│   ├── utils/
│   │   └── json_storage.py         # JSON storage helpers (load/save/append)
│   │
│   ├── data/                       # JSON file database (No SQL)
│   │   ├── users.json              # Demo accounts
│   │   ├── complaints.json         # Complaint records
│   │   ├── evidence.json           # File metadata & hashes
│   │   ├── cases.json              # 15 historical precedents
│   │   ├── legal_documents.json    # 10 statutory reference laws
│   │   └── status_history.json     # Lifecycle audit trail
│   │
│   ├── ml/
│   │   ├── train_classifier.py     # Synthetic dataset generator & trainer
│   │   ├── build_index.py          # Pre-builds FAISS vector indices
│   │   └── model/                  # Saved .joblib model and .faiss indices
│   │
│   ├── uploads/                    # Evidence files storage
│   ├── generated_reports/          # Cached ReportLab PDFs
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/             # StatusBadge, AIIntelligenceSuite, EvidenceVault, etc.
│   │   ├── pages/                  # Login, Register, CitizenDashboard, PoliceDashboard, etc.
│   │   ├── services/               # Axios api client
│   │   ├── context/                # AuthContext
│   │   ├── App.jsx                 # Routing & shell layout
│   │   └── styles.css              # Tailwind CSS styles
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .env.example
```

---

## 6. Installation & Setup

### Prerequisites
- Python 3.10+ (Tested on 3.12)
- Node.js 18+ & npm

### Backend Setup

```bash
cd backend

# Create virtual environment (optional if using global python)
python -m venv venv
venv\Scripts\activate       # On Windows
# source venv/bin/activate  # On Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn main:app --reload --port 8000
```
Backend API docs available at: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 7. Demo Credentials

The system provides 1-click login buttons on the login page:

| Role | Email | Password |
|---|---|---|
| **Citizen Demo** | `ravi@gmail.com` | `demo123` |
| **Police Officer Demo** | `police@aegisfir.com` | `police123` |
| **Second Officer** | `meena@aegisfir.com` | `police123` |

---

## 8. How to Retrain ML Model & Rebuild FAISS Index

### Train ML Classifier (960 Samples, 8 Classes)
```bash
cd backend
python ml/train_classifier.py
```
This generates `backend/ml/model/crime_classifier.joblib` and evaluates accuracy, precision, recall, and F1 scores.

### Build Pre-Indexed FAISS Indices
```bash
cd backend
python ml/build_index.py
```
This generates `cases.faiss` and `legal.faiss` in `backend/ml/model/` for sub-millisecond retrieval.

---

## 9. Example Viva Demonstration Flow

1. **Sign In as Citizen:** Click *"Citizen Demo"* (`ravi@gmail.com`) on the Login page.
2. **File Complaint:** Click *"File New Complaint"*, click **"Scenario 1: WhatsApp Payment Link Scam"** to instantly pre-fill realistic facts, attach a file, and click *"Submit Grievance"*.
3. **Inspect AI Suite:**
   - See the **ML Crime Categorization** badge predict `Cybercrime` with probability distribution bars.
   - Click **"Model Viva Metrics"** to show the examiner the cross-validated accuracy, precision, recall, and F1-score.
   - Inspect **AI Complaint Findings** showing extracted risk flags (`⚠️ Financial Fraud Vector`) and missing investigation facts.
   - Inspect **Statutory Legal References** (e.g. IT Act 2000 Section 66D with match percentage).
   - Inspect **Historical Precedents** (e.g. `CASE001: Online Payment Fraud (89% match)`).
4. **Forensic Evidence:** Check the Evidence Vault displaying the file size, image dimensions, and SHA-256 hash. Click the copy icon to copy the hash.
5. **Download Report:** Click *"Download PDF Dossier"* to download the formatted ReportLab A4 document.
6. **Switch to Police Console:** Click the top navbar *"Persona: Citizen"* button to switch to **Police Officer**.
7. **Officer Actions:**
   - Update complaint status from `SUBMITTED` ➔ `UNDER_REVIEW`.
   - Add an internal investigation remark (e.g., *"CCTV and beneficiary UPI VPA submitted to cyber nodal cell."*).
   - Review the **AI Officer Tactical Briefing** with suggested next steps.
8. **Verify Audit Trail:** Notice the updated 5-stage lifecycle stepper reflecting the new status and timestamp.

---

## 10. Important Academic Disclaimers & Limitations

> [!IMPORTANT]
> - **Academic Prototype:** AegisFIR is an educational project built for CSE(AIML) degree evaluation. It is **NOT** a real police department portal and does not file legal FIRs.
> - **AI Predictions:** All ML predictions, legal section citations, and similarity scores are advisory recommendations for educational demonstration and must not replace human legal judgment.
> - **JSON Storage:** All records are stored in plain JSON files (`backend/data/`) to simplify viva reproduction without requiring local database servers.
