"""
pipelines/duplicate_detector.py
--------------------------------
Fuzzy-match incoming lead against existing leads in MongoDB to flag
potential duplicates before insertion.

Uses fuzzywuzzy (Levenshtein distance) on:
  - Full name         (weight 50 %)
  - Email             (weight 50 %)

Interview talking points:
  - Prevents polluting CRM with duplicate records
  - Threshold of 85 is conservative — can be tuned
  - In production, you'd also match phone numbers
"""

from typing import List, Dict, Any
from fuzzywuzzy import fuzz


def find_duplicates(
    new_name: str,
    new_email: str,
    existing_leads: List[Dict[str, Any]],
    threshold: int = 85,
) -> List[Dict[str, Any]]:
    """
    Compare `new_name` / `new_email` against every lead in `existing_leads`.
    Returns a list of matches that exceed `threshold` similarity score.

    Each match dict contains:
      { id, name, email, similarity_score, match_reason }
    """
    new_name_clean  = (new_name  or "").strip().lower()
    new_email_clean = (new_email or "").strip().lower()

    matches = []

    for lead in existing_leads:
        existing_name  = (lead.get("name",  "") or "").strip().lower()
        existing_email = (lead.get("email", "") or "").strip().lower()

        # Email exact match — instant duplicate
        if new_email_clean and existing_email == new_email_clean:
            matches.append({
                "id":               str(lead.get("_id", "")),
                "name":             lead.get("name", ""),
                "email":            lead.get("email", ""),
                "similarity_score": 100,
                "match_reason":     "Exact email match",
            })
            continue

        # Fuzzy name score
        name_score  = fuzz.token_sort_ratio(new_name_clean,  existing_name)

        # Fuzzy email score (catches typos like gmial vs gmail)
        email_score = fuzz.ratio(new_email_clean, existing_email)

        # Weighted composite
        composite = int(name_score * 0.5 + email_score * 0.5)

        if composite >= threshold:
            reason_parts = []
            if name_score  >= threshold:
                reason_parts.append(f"Name similarity {name_score}%")
            if email_score >= threshold:
                reason_parts.append(f"Email similarity {email_score}%")

            matches.append({
                "id":               str(lead.get("_id", "")),
                "name":             lead.get("name", ""),
                "email":            lead.get("email", ""),
                "similarity_score": composite,
                "match_reason":     " | ".join(reason_parts) or f"Composite {composite}%",
            })

    # Sort best matches first
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    return matches

