"""
Pydantic models for FinFlow AI backend.
"""
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field, field_validator
import uuid


class ChatRequest(BaseModel):
    """Request body for POST /api/ai/chat"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message to the AI")
    conversation_id: Optional[str] = Field(None, description="Existing conversation UUID (optional)")

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be blank or whitespace only.")
        return stripped

    @field_validator("conversation_id")
    @classmethod
    def validate_uuid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        try:
            uuid.UUID(v)
            return v
        except ValueError:
            raise ValueError("conversation_id must be a valid UUID.")


class ChatResponse(BaseModel):
    """Response from POST /api/ai/chat"""
    reply: str
    conversation_id: str
    suggestions: list[str] = []


class ConversationSummary(BaseModel):
    """One item in GET /api/ai/conversations response"""
    id: str
    created_at: str
    updated_at: str
    message_count: Optional[int] = 0


class MessageRecord(BaseModel):
    """One message in GET /api/ai/conversations/{id} response"""
    id: str
    role: str  # "user" | "assistant"
    content: str
    created_at: str


class ConversationDetail(BaseModel):
    """Full conversation with messages"""
    id: str
    created_at: str
    messages: list[MessageRecord]
