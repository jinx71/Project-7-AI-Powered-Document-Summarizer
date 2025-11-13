import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Central place for all environment-driven configuration."""

    # OpenAI-compatible LLM provider (Groq by default — see .env.example
    # for OpenRouter / local Ollama alternatives).
    LLM_BASE_URL: str = os.environ.get(
        "LLM_BASE_URL", "https://api.groq.com/openai/v1"
    )
    LLM_API_KEY: str = os.environ.get("LLM_API_KEY", "")
    LLM_MODEL: str = os.environ.get("LLM_MODEL", "openai/gpt-oss-20b")
    LLM_JSON_MODE: bool = os.environ.get("LLM_JSON_MODE", "true").lower() == "true"

    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]
    MAX_UPLOAD_MB: int = int(os.environ.get("MAX_UPLOAD_MB", "20"))

    # Chunking thresholds (characters). Open models vary in context size;
    # ~24k chars (~6k tokens) is a safe single-pass budget for an 8k-context
    # model and leaves room for the prompt and response. Larger documents
    # are handled with map-reduce.
    SINGLE_PASS_CHAR_LIMIT: int = 24_000
    CHUNK_SIZE_CHARS: int = 20_000
    CHUNK_OVERLAP_CHARS: int = 1_500


settings = Settings()
