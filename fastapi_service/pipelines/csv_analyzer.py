"""
pipelines/csv_analyzer.py
--------------------------
Reads a CSV file with pandas and returns rich statistics BEFORE the data
is imported into MongoDB. This lets the frontend show a "preview" so users
know what they're importing.

Interview talking points:
  - pandas is the industry-standard data analysis library
  - Previewing before import prevents bad data from entering the CRM
  - Returns structured JSON — easy for any frontend to consume
"""

import io
import pandas as pd


EXPECTED_COLUMNS = {"name", "email", "company", "stage", "source", "budget"}

VALID_STAGES = {
    "New", "Contacted", "Qualified",
    "Proposal", "Negotiation", "Won", "Lost",
}


def analyze_csv(file_bytes: bytes, filename: str = "upload.csv") -> dict:
    """
    Parse raw CSV bytes and return:
      - row_count
      - column_names
      - missing_columns      (expected but absent)
      - extra_columns        (present but unexpected)
      - stage_distribution   (counts per stage)
      - source_distribution  (counts per source)
      - budget_stats         (min, max, mean, total)
      - invalid_stages       (rows with unrecognised stage values)
      - empty_email_count
      - preview_rows         (first 5 rows as list of dicts)
      - validation_warnings  (list of human-readable issues)
    """
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as exc:
        return {"error": f"Could not parse CSV: {exc}"}

    df.columns = [c.strip().lower() for c in df.columns]

    warnings = []
    cols = set(df.columns)

    # ── Column checks ────────────────────────────────────────────────────────
    missing = EXPECTED_COLUMNS - cols
    extra   = cols - EXPECTED_COLUMNS

    if missing:
        warnings.append(f"Missing expected columns: {', '.join(sorted(missing))}")
    if extra:
        warnings.append(f"Extra/unknown columns (will be ignored): {', '.join(sorted(extra))}")

    # ── Stage distribution ───────────────────────────────────────────────────
    stage_dist = {}
    invalid_stages = []
    if "stage" in df.columns:
        stage_dist = df["stage"].value_counts().to_dict()
        bad_stage_mask = ~df["stage"].isin(VALID_STAGES)
        if bad_stage_mask.any():
            invalid_stages = df[bad_stage_mask]["stage"].unique().tolist()
            warnings.append(
                f"Invalid stage values found: {', '.join(str(s) for s in invalid_stages)}"
            )

    # ── Source distribution ──────────────────────────────────────────────────
    source_dist = {}
    if "source" in df.columns:
        source_dist = df["source"].value_counts().to_dict()

    # ── Budget stats ─────────────────────────────────────────────────────────
    budget_stats = {}
    if "budget" in df.columns:
        budget_col = pd.to_numeric(df["budget"], errors="coerce")
        non_null   = budget_col.dropna()
        if len(non_null) > 0:
            budget_stats = {
                "min":   round(float(non_null.min()), 2),
                "max":   round(float(non_null.max()), 2),
                "mean":  round(float(non_null.mean()), 2),
                "total": round(float(non_null.sum()), 2),
            }
        null_count = budget_col.isna().sum()
        if null_count > 0:
            warnings.append(f"{null_count} row(s) have non-numeric or missing budget.")

    # ── Empty emails ─────────────────────────────────────────────────────────
    empty_email_count = 0
    if "email" in df.columns:
        empty_email_count = int(df["email"].isna().sum() + (df["email"] == "").sum())
        if empty_email_count:
            warnings.append(f"{empty_email_count} row(s) have missing or empty email.")

    # ── Preview (first 5 rows) ───────────────────────────────────────────────
    preview_rows = df.head(5).fillna("").to_dict(orient="records")

    return {
        "row_count":           len(df),
        "column_names":        list(df.columns),
        "missing_columns":     sorted(missing),
        "extra_columns":       sorted(extra),
        "stage_distribution":  stage_dist,
        "source_distribution": source_dist,
        "budget_stats":        budget_stats,
        "invalid_stages":      invalid_stages,
        "empty_email_count":   empty_email_count,
        "preview_rows":        preview_rows,
        "validation_warnings": warnings,
        "is_valid":            len(warnings) == 0,
    }

