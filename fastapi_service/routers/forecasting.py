"""
routers/forecasting.py
-----------------------
Lead volume forecasting endpoints using LinearRegression.

  GET /forecast/leads?days=7   — Forecast next N days of lead creation
  GET /forecast/summary        — Short human-readable summary of the forecast
"""

from fastapi import APIRouter, Query
from db import get_db
from pipelines.forecaster import forecast_leads

router = APIRouter(prefix="/forecast", tags=["Forecasting"])


@router.get("/leads")
def forecast_lead_volume(days: int = Query(default=7, ge=1, le=30)):
    """
    Fetch all leads from MongoDB, train a LinearRegression model on the
    daily creation counts, and return predictions for the next `days` days.
    """
    db    = get_db()
    leads = list(db["leads"].find({}, {"createdAt": 1}))
    result = forecast_leads(leads, days_ahead=days)
    return result


@router.get("/summary")
def forecast_summary():
    """
    Returns a plain-language summary of the 7-day forecast.
    Great for a dashboard 'Insight' card.
    """
    db    = get_db()
    leads = list(db["leads"].find({}, {"createdAt": 1}))
    data  = forecast_leads(leads, days_ahead=7)

    if "error" in data:
        return {"summary": data["error"], "trend": "unknown"}

    forecast   = data["forecast"]
    total_pred = sum(f["predicted_count"] for f in forecast)
    slope      = data["model_info"]["slope"]
    r2         = data["model_info"]["r2_score"]

    if slope > 0.1:
        trend = "upward 📈"
    elif slope < -0.1:
        trend = "downward 📉"
    else:
        trend = "flat ➡️"

    summary = (
        f"Based on historical data, the model predicts approximately "
        f"{round(total_pred)} new leads over the next 7 days. "
        f"The trend is {trend} (slope={slope}, R²={r2})."
    )

    return {
        "summary":       summary,
        "trend":         trend,
        "predicted_7day_total": round(total_pred, 1),
        "r2_score":      r2,
        "forecast":      forecast,
    }

