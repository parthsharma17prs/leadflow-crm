"""
pipelines/lead_scorer.py
------------------------
Scores a single lead from 0–100 based on:
  - Pipeline stage  (how far along)
  - Budget          (higher = better prospect)
  - Lead source     (some sources convert better)
  - Company size    (optional bonus)

Interview talking points:
  - Weighted scoring is a classic CRM feature
  - Weights are tuneable — in production you'd train a model
  - Returns a bucket label (Hot/Warm/Cold) alongside the numeric score
"""

from typing import Optional

# ── Stage weights (0–40 points) ─────────────────────────────────────────────
STAGE_SCORES = {
    "New":         5,
    "Contacted":  10,
    "Qualified":  20,
    "Proposal":   30,
    "Negotiation":35,
    "Won":        40,
    "Lost":        0,
}

# ── Source weights (0–20 points) ────────────────────────────────────────────
SOURCE_SCORES = {
    "Referral":       20,
    "Website":        15,
    "LinkedIn":       14,
    "Cold Call":      10,
    "Email Campaign":  8,
    "Trade Show":     12,
    "Other":           5,
}

# ── Budget thresholds (0–30 points) ─────────────────────────────────────────
def _budget_score(budget: float) -> int:
    if budget >= 100_000:
        return 30
    if budget >= 50_000:
        return 25
    if budget >= 25_000:
        return 18
    if budget >= 10_000:
        return 10
    if budget >= 5_000:
        return 5
    return 2


def _company_size_bonus(size: Optional[str]) -> int:
    """Optional +10 bonus for larger companies."""
    if not size:
        return 0
    s = size.lower()
    if "enterprise" in s or "large" in s:
        return 10
    if "mid" in s or "medium" in s:
        return 5
    return 0


def score_lead(
    stage: str,
    budget: float,
    source: str,
    company_size: Optional[str] = None,
) -> dict:
    """
    Returns:
      {
        "score": 0-100,
        "bucket": "Hot" | "Warm" | "Cold",
        "breakdown": { stage_pts, budget_pts, source_pts, bonus_pts }
      }
    """
    stage_pts  = STAGE_SCORES.get(stage, 0)
    source_pts = SOURCE_SCORES.get(source, 5)
    budget_pts = _budget_score(budget)
    bonus_pts  = _company_size_bonus(company_size)

    raw = stage_pts + source_pts + budget_pts + bonus_pts
    # Clamp to 100
    score = min(raw, 100)

    if score >= 70:
        bucket = "Hot"
    elif score >= 40:
        bucket = "Warm"
    else:
        bucket = "Cold"

    return {
        "score": score,
        "bucket": bucket,
        "breakdown": {
            "stage_points":   stage_pts,
            "budget_points":  budget_pts,
            "source_points":  source_pts,
            "bonus_points":   bonus_pts,
        },
    }

