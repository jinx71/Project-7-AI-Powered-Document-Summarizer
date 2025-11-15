from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import summarize

app = FastAPI(
    title="AI Document Summariser API",
    description="Upload a PDF (SOP, validation protocol, audit report, manual) "
    "and receive a structured AI-generated summary.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(summarize.router)


@app.get("/api/health")
async def health() -> dict:
    return {"success": True, "data": {"status": "ok"}, "message": "API is running."}
