"""
FinFlow AI Backend — FastAPI Application

Security architecture:
  1. Every AI request requires a valid Supabase JWT (Authorization: Bearer <token>).
  2. User identity is extracted from the verified JWT — never trusted from request body.
  3. All DB operations filter by the authenticated user_id.
  4. OpenAI API key is server-side only.
  5. Rate limiting: 20 AI requests per user per hour.
  6. Input validation: 1-2000 chars, non-blank, valid UUID for conversation_id.
  7. Errors are caught and generic messages returned — no internal details exposed.

Start:
    uvicorn main:app --reload --port 8000
"""
from __future__ import annotations
import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from auth import get_current_user_id
from config import settings
from database import (
    append_message,
    create_conversation,
    delete_conversation,
    get_conversation,
    get_conversation_messages,
    get_recent_messages_for_ai,
    list_conversations,
    touch_conversation,
)
from models import (
    ChatRequest,
    ChatResponse,
    ConversationDetail,
    ConversationSummary,
    MessageRecord,
)
from ai_service import generate_ai_reply
from rate_limiter import rate_limiter

# ── Logging ──────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("finflow.api")


# ── Application ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FinFlow AI Backend starting up.")
    yield
    logger.info("FinFlow AI Backend shutting down.")


app = FastAPI(
    title="FinFlow AI Backend",
    version="1.0.0",
    description="Secure AI assistant backend for FinFlow Personal Finance App",
    docs_url="/docs",       # Disable in production: docs_url=None
    redoc_url=None,
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# ── Global exception handler — never expose internals ─────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Unable to process your request right now. Please try again later."},
    )


# ── Health check ─────────────────────────────────────────────────────
@app.get("/health", include_in_schema=False)
async def health_check():
    return {"status": "ok", "service": "FinFlow AI Backend"}


# /api/health — frontend proxy sends GET /api/health → this hits /api/health on the backend
@app.get("/api/health", include_in_schema=False)
async def api_health_check():
    return {"status": "ok", "service": "FinFlow AI Backend"}


# ─────────────────────────────────────────────────────────────────────
# POST /api/ai/chat
# Send a message and get an AI response.
# ─────────────────────────────────────────────────────────────────────
@app.post("/api/ai/chat", response_model=ChatResponse)
async def ai_chat(
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Authenticated endpoint to send a message to the AI.

    - Validates the Supabase JWT and extracts the real user_id.
    - Enforces per-user rate limiting.
    - Creates or retrieves a conversation.
    - Builds context from conversation history.
    - Calls AI service and stores the exchange.
    - Returns the AI reply and follow-up suggestions.
    """
    # ── Rate limit check ────────────────────────────────────────────
    allowed, retry_after = rate_limiter.is_allowed(user_id)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. You can send {settings.RATE_LIMIT_REQUESTS} messages per hour. "
                   f"Please wait {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )

    # ── Resolve or create conversation ──────────────────────────────
    conversation_id: str | None = body.conversation_id
    history: list[dict] = []

    try:
        if conversation_id:
            # Verify the conversation belongs to this user
            conversation = get_conversation(conversation_id, user_id)
            if not conversation:
                # If requested conversation is missing or not owned, start fresh
                logger.warning("Conversation %s not found for user=%s; starting new conversation", conversation_id, user_id[:8])
                conversation_id = None

        if not conversation_id:
            # Start a new conversation
            conversation = create_conversation(user_id)
            conversation_id = conversation["id"]
            logger.info("user=%s created new conversation=%s", user_id[:8], conversation_id[:8])

        # ── Build AI context (recent history only) ──────────────────────
        history = get_recent_messages_for_ai(conversation_id, user_id, limit=10)
    except Exception as exc:
        logger.error("Database interaction failed for user=%s: %s", user_id[:8], exc, exc_info=True)
        # Fallback conversation_id if database creation fails
        if not conversation_id:
            conversation_id = str(uuid.uuid4())

    # ── Call AI service ─────────────────────────────────────────────
    try:
        reply_text, suggestions = generate_ai_reply(
            user_message=body.message,
            conversation_history=history,
        )
    except RuntimeError as exc:
        # Already logged in ai_service.py — return safe message
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        )

    # ── Persist messages ─────────────────────────────────────────────
    try:
        append_message(conversation_id, user_id, "user", body.message)
        append_message(conversation_id, user_id, "assistant", reply_text)
        touch_conversation(conversation_id)
    except Exception as exc:
        logger.error("Failed to persist messages for conversation=%s: %s", conversation_id, exc)
        # Still return the AI reply — persistence failure shouldn't break the UX

    logger.info(
        "user=%s conversation=%s — responded (%d chars)",
        user_id[:8], conversation_id[:8], len(reply_text),
    )

    return ChatResponse(
        reply=reply_text,
        conversation_id=conversation_id,
        suggestions=suggestions,
    )


# ─────────────────────────────────────────────────────────────────────
# GET /api/ai/conversations
# List all conversations for the authenticated user.
# ─────────────────────────────────────────────────────────────────────
@app.get("/api/ai/conversations", response_model=list[ConversationSummary])
async def list_user_conversations(
    user_id: str = Depends(get_current_user_id),
):
    """List all conversations belonging to the authenticated user."""
    conversations = list_conversations(user_id)
    return [
        ConversationSummary(
            id=c["id"],
            created_at=c["created_at"],
            updated_at=c["updated_at"],
            message_count=c.get("message_count", 0),
        )
        for c in conversations
    ]


# ─────────────────────────────────────────────────────────────────────
# GET /api/ai/conversations/{conversation_id}
# Retrieve a specific conversation and its messages.
# ─────────────────────────────────────────────────────────────────────
@app.get("/api/ai/conversations/{conversation_id}", response_model=ConversationDetail)
async def get_conversation_detail(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Retrieve a conversation's messages.
    Returns 403 if the conversation does not belong to the authenticated user.
    """
    # Validate UUID format
    try:
        uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid conversation ID format.",
        )

    # Ownership check happens inside get_conversation_messages
    conversation = get_conversation(conversation_id, user_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conversation not found or access denied.",
        )

    raw_messages = get_conversation_messages(conversation_id, user_id)
    messages = [
        MessageRecord(
            id=m["id"],
            role=m["role"],
            content=m["content"],
            created_at=m["created_at"],
        )
        for m in raw_messages
    ]

    return ConversationDetail(
        id=conversation["id"],
        created_at=conversation["created_at"],
        messages=messages,
    )


# ─────────────────────────────────────────────────────────────────────
# DELETE /api/ai/conversations/{conversation_id}
# Delete a conversation (and cascade-delete its messages).
# ─────────────────────────────────────────────────────────────────────
@app.delete("/api/ai/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Delete a conversation and all its messages.
    Returns 403 if the conversation does not belong to the authenticated user.
    """
    try:
        uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid conversation ID format.",
        )

    deleted = delete_conversation(conversation_id, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conversation not found or access denied.",
        )

    logger.info("user=%s deleted conversation=%s", user_id[:8], conversation_id[:8])
