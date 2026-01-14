# DocBrief — AI Document Summariser

> **Project 07 of 12** — [Full-stack portfolio roadmap](https://github.com/jinx71)

Upload a PDF — an SOP, validation protocol, audit report, or technical manual — and receive a structured, AI-generated analysis: executive summary, key points, prioritised action items, and flagged compliance concerns. Built to connect 8+ years of pharmaceutical GMP documentation experience with modern AI engineering.

**Live demo:** _coming soon_

![Screenshot placeholder](./docs/screenshot.png)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Axios, Vite |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| AI | Open-source LLM via OpenAI-compatible API — Groq by default (`openai/gpt-oss-20b`), provider-swappable |
| PDF parsing | PyMuPDF |

## Features

- Drag-and-drop PDF upload with type hinting (SOP / Validation Protocol / Audit Report / auto-detect)
- PyMuPDF text extraction with clear errors for scanned (image-only) PDFs
- **Chunked map-reduce summarisation** — documents beyond a single context budget are split into overlapping chunks, summarised in parallel passes, then synthesised into one coherent analysis
- Structured output: summary, key points, prioritised action items with owner hints, and GMP/regulatory compliance flags
- Consistent `{ success, data, message }` API envelope on every response, including errors
- One-click copy of the full summary

## Project Structure

```
backend/
  app/
    main.py               # FastAPI app, CORS, routing
    config.py             # env-driven settings
    schemas.py            # Pydantic response models
    routers/summarize.py  # POST /api/summarize
    services/
      pdf_parser.py       # PyMuPDF extraction
      summarizer.py       # OpenAI-compatible LLM calls + chunking strategy
frontend/
  src/
    App.tsx
    api/client.ts         # typed Axios client
    components/           # UploadZone, SummaryResult
    types.ts              # mirrors backend schemas
```

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # add your LLM_API_KEY (Groq key by default)
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env            # points at http://localhost:8000 by default
npm run dev
```

Open `http://localhost:5173`.

## API

### `POST /api/summarize`

Multipart form fields:

| Field | Type | Notes |
|---|---|---|
| `file` | PDF | max 20 MB (configurable) |
| `doc_type` | string | `auto` (default) or a specific type hint |

Response:

```json
{
  "success": true,
  "data": {
    "document_type": "SOP",
    "title": "Cleaning Validation of WFI Distribution Loop",
    "page_count": 14,
    "word_count": 4820,
    "summary": "...",
    "key_points": ["..."],
    "action_items": [{ "item": "...", "priority": "high", "owner_hint": "QA" }],
    "compliance_flags": ["..."],
    "chunked": false
  },
  "message": "Document summarised successfully."
}
```

## Deployment

- **Frontend:** Vercel (set `VITE_API_URL` to the deployed backend URL)
- **Backend:** Railway or Render (set `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`, and `CORS_ORIGINS` to the Vercel domain)

## LLM Provider

Any OpenAI-compatible API works — set three env vars and nothing else changes:

| Provider | `LLM_BASE_URL` | Example `LLM_MODEL` | Notes |
|---|---|---|---|
| **Groq** (default) | `https://api.groq.com/openai/v1` | `openai/gpt-oss-20b` | Free, no credit card, very fast |
| OpenRouter | `https://openrouter.ai/api/v1` | `meta-llama/llama-3.3-70b-instruct:free` | Many free model slots |
| Ollama (local) | `http://localhost:11434/v1` | `llama3.1` | Fully offline, zero cost, local dev only |

If a model doesn't support JSON mode, set `LLM_JSON_MODE=false` — the strict prompt and defensive parser still handle output.

## Roadmap Ideas

- Streaming responses for live summary rendering
- OCR fallback for scanned PDFs (Tesseract)
- Summary history with PostgreSQL persistence
- Export summary as PDF report

---

Md. Sazed Ul Karim · [github.com/jinx71](https://github.com/jinx71) · [linkedin.com/in/sazed-ul-karim](https://linkedin.com/in/sazed-ul-karim)
