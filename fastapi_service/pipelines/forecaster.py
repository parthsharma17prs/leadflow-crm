"""
pipelines/forecaster.py
------------------------
Uses scikit-learn LinearRegression to forecast lead creation for the
next N days based on the historical daily creation rate stored in MongoDB.

Interview talking points:
  - sklearn is the go-to ML library for simple models
  - LinearRegression is interpretable — great for demos
  - In production you'd use Prophet or ARIMA for time-series
  - Ordinal encoding of dates (day index) is the standard approach for LR
"""

from typing import List, Dict, Any
import numpy as np
from datetime import datetime, timedelta, timezone
from sklearn.linear_model import LinearRegression


def _group_by_day(leads: List[Dict[str, Any]]) -> Dict[str, int]:
    """Count leads created per calendar day (YYYY-MM-DD)."""
    counts: dict[str, int] = {}
    for lead in leads:
        created = lead.get("createdAt")
        if not created:
            continue
        # MongoDB returns datetime objects via PyMongo
        if isinstance(created, datetime):
            day = created.strftime("%Y-%m-%d")
        else:
            day = str(created)[:10]
        counts[day] = counts.get(day, 0) + 1
    return counts


def forecast_leads(leads: List[Dict[str, Any]], days_ahead: int = 7) -> dict:
    """
    Train a LinearRegression model on historical daily lead counts and
    predict the number of leads for each of the next `days_ahead` days.

    Returns:
      {
        "historical":  [ { date, count } … ],
        "forecast":    [ { date, predicted_count } … ],
        "model_info":  { r2_score, slope, intercept, training_days }
      }
    """
    day_counts = _group_by_day(leads)

    if len(day_counts) < 3:
        return {
            "error": "Not enough historical data (need at least 3 days of leads).",
            "historical": [],
            "forecast":   [],
        }

    # Sort days chronologically
    sorted_days = sorted(day_counts.keys())
    counts      = [day_counts[d] for d in sorted_days]

    # X = day index (0, 1, 2 …), Y = lead count
    X = np.array(range(len(sorted_days))).reshape(-1, 1)
    y = np.array(counts, dtype=float)

    model = LinearRegression()
    model.fit(X, y)
    r2 = float(model.score(X, y))

    # Build historical list
    historical = [
        {"date": day, "count": cnt}
        for day, cnt in zip(sorted_days, counts)
    ]

    # Forecast next N days
    last_date   = datetime.strptime(sorted_days[-1], "%Y-%m-%d")
    n_trained   = len(sorted_days)
    forecast    = []

    for i in range(1, days_ahead + 1):
        future_date      = last_date + timedelta(days=i)
        future_idx       = np.array([[n_trained - 1 + i]])
        predicted_raw    = float(model.predict(future_idx)[0])
        predicted_count  = max(0, round(predicted_raw, 1))   # never negative
        forecast.append({
            "date":            future_date.strftime("%Y-%m-%d"),
            "predicted_count": predicted_count,
        })

    return {
        "historical": historical,
        "forecast":   forecast,
        "model_info": {
            "r2_score":     round(r2, 4),
            "slope":        round(float(model.coef_[0]), 4),
            "intercept":    round(float(model.intercept_), 4),
            "training_days": n_trained,
        },
    }

