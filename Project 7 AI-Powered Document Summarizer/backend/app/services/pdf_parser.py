"""PDF text extraction using PyMuPDF (fitz)."""

import fitz  # PyMuPDF


class PdfExtractionError(Exception):
    """Raised when a PDF cannot be opened or contains no extractable text."""


def extract_text(file_bytes: bytes) -> tuple[str, int]:
    """Extract plain text from a PDF.

    Returns:
        (full_text, page_count)

    Raises:
        PdfExtractionError: if the file is not a valid PDF or has no text layer.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise PdfExtractionError("File could not be opened as a PDF.") from exc

    try:
        pages: list[str] = []
        for page in doc:
            # "text" mode preserves reading order better than raw extraction
            pages.append(page.get_text("text"))
        page_count = doc.page_count
    finally:
        doc.close()

    full_text = "\n\n".join(pages).strip()

    if not full_text:
        raise PdfExtractionError(
            "No extractable text found. This PDF may be a scanned image — "
            "run OCR on it first, then re-upload."
        )

    return full_text, page_count
