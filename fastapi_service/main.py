"""
main.py — LeadFlow FastAPI Analytics Microservice
---------------------------------------------------
This is a SEPARATE Python microservice that runs alongside the Express backend.

Architecture:
  Express  (Node.js) → port 5001  — Auth, CRUD, MongoDB writes
  FastAPI  (Python)  → port 8001  — Analytics, ML scoring, CSV analysis, Forecasting
  React    (Vite)    → port 5173  — Frontend

All routers are mounted here. CORS is configured to allow the frontend and
the Express backend to call this service.

Run with:
  uvicorn main:app --reload --port 8001
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import health, leads, csv_pipeline, forecasting

# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="LeadFlow Analytics API",
    description=(
        "Python microservice for LeadFlow CRM. "
        "Provides lead scoring, CSV analysis, duplicate detection, "
        "and ML-based lead forecasting."
    ),
    version="1.0.0",
    docs_url="/docs",       # Swagger UI at http://localhost:8001/docs
    redoc_url="/redoc",     # ReDoc at http://localhost:8001/redoc
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the React frontend and Express backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # React/Vite frontend
        "http://localhost:5001",   # Express backend (for server-side calls)
        "http://localhost:3000",   # fallback React port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(leads.router)
app.include_router(csv_pipeline.router)
app.include_router(forecasting.router)


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "LeadFlow Analytics API is running 🚀",
        "docs":    "http://localhost:8001/docs",
        "endpoints": {
            "health":        "GET  /health",
            "analytics":     "GET  /leads/analytics",
            "score_lead":    "POST /leads/score",
            "check_dupes":   "POST /leads/duplicates",
            "score_all":     "GET  /leads/scores/all",
            "csv_preview":   "POST /csv/preview",
            "csv_validate":  "POST /csv/validate",
            "forecast":      "GET  /forecast/leads?days=7",
            "forecast_summary": "GET /forecast/summary",
        },
    }

