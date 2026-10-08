"""AegisFIR Backend Server.

AI-Assisted Smart Complaint Management & Crime Intelligence System.
Academic final-year project using FastAPI and local JSON storage.
"""

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.auth import router as auth_router
from routes.complaints import router as complaints_router
from routes.ai import router as ai_router
from routes.police import router as police_router
from services.retrieval_service import warmup_retrieval

ROOT = Path(__file__).resolve().parent
UPLOAD_DIR = ROOT / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
REPORT_DIR = ROOT / "generated_reports"
REPORT_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="AegisFIR API",
    description="AI-Assisted Smart Complaint Management & Crime Intelligence System (Academic Prototype)",
    version="2.0.0"
)

@app.on_event("startup")
def on_startup():
    warmup_retrieval()

# Enable CORS for React frontend (Vite default: 5173, fallback: 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded files for direct viewing / preview in UI
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include modular API routers
app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(ai_router)
app.include_router(police_router)


@app.get("/")
@app.get("/api")
def root_info():
    return {
        "system": "AegisFIR",
        "description": "AI-Assisted Smart Complaint Management & Crime Intelligence System",
        "status": "Online",
        "version": "2.0.0",
        "academic_mode": True,
        "disclaimer": "This system is an academic research prototype and does NOT generate official police FIRs."
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AegisFIR API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)