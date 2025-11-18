from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas import ApiResponse, SummaryData
from app.services.pdf_parser import PdfExtractionError, extract_text
from app.services.summarizer import SummarisationError, summarise

router = APIRouter(prefix="/api", tags=["summarise"])


@router.post("/summarize", response_model=ApiResponse)
async def summarize_document(
    file: UploadFile = File(...),
    doc_type: str = Form(default="auto"),
) -> JSONResponse:
    # --- Validation ---
    if file.content_type != "application/pdf" and not (
        file.filename or ""
    ).lower().endswith(".pdf"):
        return JSONResponse(
            status_code=400,
            content=ApiResponse(
                success=False, message="Only PDF files are supported."
            ).model_dump(),
        )

    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        return JSONResponse(
            status_code=413,
            content=ApiResponse(
                success=False,
                message=f"File exceeds the {settings.MAX_UPLOAD_MB} MB upload limit.",
            ).model_dump(),
        )

    # --- Extraction ---
    try:
        text, page_count = extract_text(file_bytes)
    except PdfExtractionError as exc:
        return JSONResponse(
            status_code=422,
            content=ApiResponse(success=False, message=str(exc)).model_dump(),
        )

    # --- Summarisation ---
    try:
        result = summarise(text, doc_type_hint=doc_type)
    except SummarisationError as exc:
        return JSONResponse(
            status_code=502,
            content=ApiResponse(success=False, message=str(exc)).model_dump(),
        )

    data = SummaryData(
        document_type=result.get("document_type", "Other"),
        title=result.get("title", file.filename or "Untitled document"),
        page_count=page_count,
        word_count=len(text.split()),
        summary=result.get("summary", ""),
        key_points=result.get("key_points", []),
        action_items=result.get("action_items", []),
        compliance_flags=result.get("compliance_flags", []),
        chunked=result.get("chunked", False),
    )

    return JSONResponse(
        status_code=200,
        content=ApiResponse(
            success=True, data=data, message="Document summarised successfully."
        ).model_dump(),
    )
