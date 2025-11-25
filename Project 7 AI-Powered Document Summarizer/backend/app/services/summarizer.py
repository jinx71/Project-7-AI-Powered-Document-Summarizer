"""LLM-powered document summarisation via any OpenAI-compatible API.

Provider-agnostic: the OpenAI SDK is pointed at LLM_BASE_URL (Groq by
default), so swapping to OpenRouter or a local model is a config change,
not a code change.

Strategy:
- Documents under SINGLE_PASS_CHAR_LIMIT are summarised in one call.
- Larger documents are split into overlapping chunks, each chunk is
  summarised (map), and the partial summaries are synthesised into one
  final structured summary (reduce). This keeps every call inside a safe
  context budget and works even on small-context open models.
"""

import json

from openai import OpenAI

from app.config import settings

client = OpenAI(api_key=settings.LLM_API_KEY, base_url=settings.LLM_BASE_URL)


class SummarisationError(Exception):
    """Raised when the model call fails or returns unparseable output."""


SYSTEM_PROMPT = """You are a document analyst specialising in pharmaceutical \
and regulated-industry documentation (SOPs, validation protocols, audit \
reports, technical manuals), but you handle any business document competently.

You respond ONLY with a valid JSON object - no markdown fences, no preamble, \
no trailing commentary. The JSON must match this exact shape:

{
  "document_type": "one of: SOP | Validation Protocol | Audit Report | Technical Manual | Report | Other",
  "title": "best-guess document title",
  "summary": "3-6 sentence executive summary in plain language",
  "key_points": ["5-10 concise key points"],
  "action_items": [
    {"item": "action description", "priority": "high|medium|low", "owner_hint": "suggested role or null"}
  ],
  "compliance_flags": ["any regulatory/GMP concerns, gaps, or risks noticed; empty array if none"]
}

Rules:
- key_points must be specific to this document, never generic filler.
- action_items: only genuine actions stated or clearly implied; empty array if none.
- compliance_flags: only flag real concerns visible in the text.
- All strings must be valid JSON (escape quotes and newlines properly)."""

CHUNK_SYSTEM_PROMPT = """You are summarising ONE SECTION of a longer document. \
Respond ONLY with a valid JSON object, no markdown fences:

{
  "section_summary": "4-8 sentence summary of this section",
  "key_points": ["specific points from this section"],
  "action_items": [{"item": "...", "priority": "high|medium|low", "owner_hint": "role or null"}],
  "compliance_flags": ["concerns in this section, if any"]
}"""


def _call_llm(system: str, user_content: str, max_tokens: int = 2000) -> dict:
    """Single chat-completion call that must return parsed JSON."""
    kwargs: dict = {
        "model": settings.LLM_MODEL,
        "max_tokens": max_tokens,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_content},
        ],
    }
    # JSON mode improves reliability on open models that tend to add
    # preamble. Not every provider/model supports it, so it's toggleable.
    if settings.LLM_JSON_MODE:
        kwargs["response_format"] = {"type": "json_object"}

    try:
        response = client.chat.completions.create(**kwargs)
    except Exception as exc:
        raise SummarisationError(f"LLM API call failed: {exc}") from exc

    text = (response.choices[0].message.content or "").strip()

    # Defensive cleanup in case the model wraps output in code fences
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise SummarisationError("Model returned invalid JSON.") from exc


def _chunk_text(text: str) -> list[str]:
    """Split text into overlapping chunks so context isn't lost at boundaries."""
    size = settings.CHUNK_SIZE_CHARS
    overlap = settings.CHUNK_OVERLAP_CHARS
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - overlap
    return chunks


def summarise(text: str, doc_type_hint: str | None = None) -> dict:
    """Summarise extracted document text. Returns a dict matching SummaryData
    (minus page/word counts, which the router adds)."""
    hint = (
        f"\n\nThe user indicated this document is a: {doc_type_hint}."
        if doc_type_hint and doc_type_hint.lower() != "auto"
        else ""
    )

    if len(text) <= settings.SINGLE_PASS_CHAR_LIMIT:
        result = _call_llm(
            SYSTEM_PROMPT,
            f"Analyse and summarise the following document.{hint}\n\n"
            f"<document>\n{text}\n</document>",
        )
        result["chunked"] = False
        return result

    # ---- Map phase: summarise each chunk independently ----
    chunks = _chunk_text(text)
    partials: list[dict] = []
    for i, chunk in enumerate(chunks, start=1):
        partial = _call_llm(
            CHUNK_SYSTEM_PROMPT,
            f"Section {i} of {len(chunks)}.{hint}\n\n"
            f"<section>\n{chunk}\n</section>",
            max_tokens=1500,
        )
        partials.append(partial)

    # ---- Reduce phase: synthesise partial summaries into the final output ----
    combined = json.dumps(partials, indent=2)
    result = _call_llm(
        SYSTEM_PROMPT,
        "The following JSON array contains section-level summaries of one long "
        f"document, in order.{hint} Synthesise them into a single coherent "
        "analysis of the whole document. Deduplicate overlapping points.\n\n"
        f"<section_summaries>\n{combined}\n</section_summaries>",
    )
    result["chunked"] = True
    return result
