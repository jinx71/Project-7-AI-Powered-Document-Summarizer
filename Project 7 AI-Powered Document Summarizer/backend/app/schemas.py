from typing import Optional

from pydantic import BaseModel, Field


class ActionItem(BaseModel):
    item: str = Field(description="The action to be taken")
    priority: str = Field(description="high | medium | low")
    owner_hint: Optional[str] = Field(
        default=None, description="Suggested role responsible, e.g. 'QA', 'Engineering'"
    )


class SummaryData(BaseModel):
    document_type: str
    title: str
    page_count: int
    word_count: int
    summary: str
    key_points: list[str]
    action_items: list[ActionItem]
    compliance_flags: list[str] = Field(
        default_factory=list,
        description="Potential regulatory / GMP concerns detected in the document",
    )
    chunked: bool = Field(
        default=False, description="True if the document required multi-pass summarisation"
    )


class ApiResponse(BaseModel):
    """Consistent envelope used by every endpoint."""

    success: bool
    data: Optional[SummaryData] = None
    message: str
