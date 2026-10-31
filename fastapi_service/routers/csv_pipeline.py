"""
routers/csv_pipeline.py
------------------------
CSV analysis endpoints — lets the frontend upload a CSV and get a full
statistical preview BEFORE the data is sent to the Express backend for import.

  POST /csv/preview    — Upload CSV, returns stats + validation warnings
  POST /csv/validate   — Same but returns only pass/fail + error list
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pipelines.csv_analyzer import analyze_csv

router = APIRouter(prefix="/csv", tags=["CSV Pipeline"])


@router.post("/preview")
async def preview_csv(file: UploadFile = File(...)):
    """
    Accept a CSV file upload and return full statistical analysis.
    
    The frontend can show this as a 'Preview' dialog before the user
    confirms importing leads into the CRM.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    result = analyze_csv(contents, filename=file.filename)

    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    return result


@router.post("/validate")
async def validate_csv(file: UploadFile = File(...)):
    """
    Quick validation check — returns only pass/fail and the list of warnings.
    Lighter than /csv/preview, ideal for a quick pre-flight check.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()
    result   = analyze_csv(contents, filename=file.filename)

    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    return {
        "filename":            file.filename,
        "row_count":           result["row_count"],
        "is_valid":            result["is_valid"],
        "validation_warnings": result["validation_warnings"],
        "missing_columns":     result["missing_columns"],
        "invalid_stages":      result["invalid_stages"],
    }

