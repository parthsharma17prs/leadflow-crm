"""
routers/leads.py
-----------------
All lead-related analytics endpoints:

  GET  /leads/analytics   — Aggregated stats from MongoDB
  POST /leads/score       — Score a single lead (no DB needed)
  POST /leads/duplicates  — Check if a new lead duplicates existing ones
  GET  /leads/scores/all  — Score every lead in the DB and return ranked list
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db
from pipelines.lead_scorer import score_lead
from pipelines.duplicate_detector import find_duplicates

router = APIRouter(prefix="/leads", tags=["Leads"])


# ── Request / Response models ────────────────────────────────────────────────

class ScoreRequest(BaseModel):
    name:         str
    stage:        str
    budget:       float
    source:       str
    company_size: Optional[str] = None


class DuplicateCheckRequest(BaseModel):
    name:  str
    email: str


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/analytics")
def get_analytics():
    """
    Return aggregated lead statistics directly from MongoDB:
      - Total leads
      - Stage distribution (count per stage)
      - Source distribution
      - Budget stats (min / max / avg / total)
      - Won vs Lost vs Active counts
      - Average budget per stage
    """
    db    = get_db()
    leads = list(db["leads"].find({}, {
        "stage": 1, "source": 1, "budget": 1,
        "name": 1, "email": 1, "createdAt": 1
    }))

    if not leads:
        return {
            "total_leads":      0,
            "stage_distribution": {},
            "source_distribution": {},
            "budget_stats":     {},
            "won_lost_active":  {},
            "avg_budget_by_stage": {},
        }

    # Stage distribution
    stage_dist: dict[str, int] = {}
    for lead in leads:
        s = lead.get("stage", "Unknown")
        stage_dist[s] = stage_dist.get(s, 0) + 1

    # Source distribution
    source_dist: dict[str, int] = {}
    for lead in leads:
        src = lead.get("source", "Unknown")
        source_dist[src] = source_dist.get(src, 0) + 1

    # Budget stats
    budgets = [float(l["budget"]) for l in leads if l.get("budget") is not None]
    budget_stats = {}
    if budgets:
        budget_stats = {
            "min":   round(min(budgets), 2),
            "max":   round(max(budgets), 2),
            "avg":   round(sum(budgets) / len(budgets), 2),
            "total": round(sum(budgets), 2),
        }

    # Won / Lost / Active
    won   = sum(1 for l in leads if l.get("stage") == "Won")
    lost  = sum(1 for l in leads if l.get("stage") == "Lost")
    active = len(leads) - won - lost
    won_lost_active = {"Won": won, "Lost": lost, "Active": active}

    # Avg budget per stage
    stage_budget: dict[str, list] = {}
    for lead in leads:
        if lead.get("budget") is not None:
            s = lead.get("stage", "Unknown")
            stage_budget.setdefault(s, []).append(float(lead["budget"]))
    avg_budget_by_stage = {
        s: round(sum(vals) / len(vals), 2)
        for s, vals in stage_budget.items()
    }

    return {
        "total_leads":         len(leads),
        "stage_distribution":  stage_dist,
        "source_distribution": source_dist,
        "budget_stats":        budget_stats,
        "won_lost_active":     won_lost_active,
        "avg_budget_by_stage": avg_budget_by_stage,
    }


@router.post("/score")
def score_single_lead(body: ScoreRequest):
    """
    Score a single lead without touching the database.
    Great for real-time scoring as sales reps fill in a form.
    """
    result = score_lead(
        stage=body.stage,
        budget=body.budget,
        source=body.source,
        company_size=body.company_size,
    )
    return {"lead_name": body.name, **result}


@router.post("/duplicates")
def check_duplicates(body: DuplicateCheckRequest):
    """
    Fuzzy-match the submitted name + email against ALL existing leads in
    MongoDB. Returns potential duplicates sorted by similarity score.
    """
    db     = get_db()
    leads  = list(db["leads"].find({}, {"name": 1, "email": 1}))
    matches = find_duplicates(body.name, body.email, leads)
    return {
        "checked_name":      body.name,
        "checked_email":     body.email,
        "potential_duplicates": matches,
        "count":             len(matches),
    }


@router.get("/scores/all")
def score_all_leads():
    """
    Score EVERY lead in the database and return them ranked highest to lowest.
    Useful for a 'Lead Priority' view in the dashboard.
    """
    db    = get_db()
    leads = list(db["leads"].find({}, {
        "name": 1, "stage": 1, "budget": 1,
        "source": 1, "company": 1, "email": 1,
    }))

    scored = []
    for lead in leads:
        result = score_lead(
            stage=lead.get("stage", "New"),
            budget=float(lead.get("budget") or 0),
            source=lead.get("source", "Other"),
            company_size=lead.get("company"),
        )
        scored.append({
            "id":     str(lead["_id"]),
            "name":   lead.get("name", ""),
            "email":  lead.get("email", ""),
            "stage":  lead.get("stage", ""),
            "source": lead.get("source", ""),
            "budget": lead.get("budget", 0),
            **result,
        })

    # Sort best score first
    scored.sort(key=lambda x: x["score"], reverse=True)
    return {"leads": scored, "total": len(scored)}

