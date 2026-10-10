"""
Supabase database client using the service-role key.

The service-role key bypasses Row Level Security (RLS).
We enforce ownership checks in application code — every query
filters by the authenticated user_id from the verified JWT.

NEVER expose the service-role key to the frontend.
"""
from __future__ import annotations
import logging
from typing import Optional

from supabase import create_client, Client

from config import settings

logger = logging.getLogger(__name__)

# Module-level singleton
_client: Optional[Client] = None


def get_db() -> Client:
    """Return the Supabase service-role client (lazily initialized)."""
    global _client
    if _client is None:
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return _client


# ──────────────────────────────────────────────────────────────────────
# Conversation operations
# ──────────────────────────────────────────────────────────────────────

def create_conversation(user_id: str) -> dict:
    """Create a new conversation owned by user_id."""
    db = get_db()
    res = db.table("ai_conversations").insert({"user_id": user_id}).execute()
    return res.data[0]


def get_conversation(conversation_id: str, user_id: str) -> Optional[dict]:
    """
    Retrieve a conversation — only if it belongs to user_id.
    Returns None if not found or not owned by user.
    """
    db = get_db()
    res = (
        db.table("ai_conversations")
        .select("*")
        .eq("id", conversation_id)
        .eq("user_id", user_id)  # OWNERSHIP CHECK
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def list_conversations(user_id: str) -> list[dict]:
    """List all conversations belonging to user_id, newest first."""
    db = get_db()
    res = (
        db.table("ai_conversations")
        .select("id, created_at, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return res.data


def delete_conversation(conversation_id: str, user_id: str) -> bool:
    """Delete a conversation — only if it belongs to user_id."""
    db = get_db()
    existing = get_conversation(conversation_id, user_id)
    if not existing:
        return False
    db.table("ai_conversations").delete().eq("id", conversation_id).execute()
    return True


def touch_conversation(conversation_id: str) -> None:
    """Update the updated_at timestamp of a conversation."""
    from datetime import datetime, timezone
    db = get_db()
    db.table("ai_conversations").update(
        {"updated_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", conversation_id).execute()


# ──────────────────────────────────────────────────────────────────────
# Message operations
# ──────────────────────────────────────────────────────────────────────

def append_message(conversation_id: str, user_id: str, role: str, content: str) -> dict:
    """
    Append a message to a conversation.
    role must be 'user' or 'assistant' — enforced at DB level via CHECK constraint.
    """
    db = get_db()
    res = db.table("ai_messages").insert({
        "conversation_id": conversation_id,
        "user_id": user_id,
        "role": role,
        "content": content,
    }).execute()
    return res.data[0]


def get_conversation_messages(conversation_id: str, user_id: str) -> list[dict]:
    """
    Get all messages for a conversation — only if owned by user_id.
    """
    db = get_db()
    # First verify ownership
    conversation = get_conversation(conversation_id, user_id)
    if not conversation:
        return []

    res = (
        db.table("ai_messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversation_id)
        .eq("user_id", user_id)  # OWNERSHIP CHECK
        .order("created_at", desc=False)
        .execute()
    )
    return res.data


def get_recent_messages_for_ai(conversation_id: str, user_id: str, limit: int = 10) -> list[dict]:
    """
    Get the most recent messages to include in the AI context.
    Only the last `limit` messages are sent to avoid token overuse.
    """
    db = get_db()
    res = (
        db.table("ai_messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    # Return chronological order (oldest first) for AI context
    return list(reversed(res.data))
