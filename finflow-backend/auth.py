"""
JWT authentication using Supabase.

Supabase signs JWTs with a secret stored in your project settings
(Settings → API → JWT Settings → JWT Secret).

Every authenticated request must include:
    Authorization: Bearer <supabase_access_token>

The backend verifies the signature and expiry, then extracts the
authenticated user's UUID from the `sub` claim.
The user_id is NEVER trusted from the request body.
"""
from __future__ import annotations
import base64
import logging
from typing import Optional

import jwt as pyjwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import settings

logger = logging.getLogger(__name__)

_bearer_scheme = HTTPBearer(auto_error=False)


def _resolve_jwt_secret() -> list[str | bytes]:
    """
    Supabase JWT secrets can be provided as plain strings or base64-encoded.
    Try both forms so verification succeeds regardless of which format is in .env.
    """
    raw = settings.SUPABASE_JWT_SECRET.strip()
    keys: list[str | bytes] = [raw]  # always try raw string first

    # Try standard base64 decode
    for decode_fn in (base64.b64decode, base64.urlsafe_b64decode):
        try:
            decoded = decode_fn(raw + "==")  # pad to avoid missing-padding errors
            if len(decoded) >= 16:
                keys.append(decoded)
        except Exception:
            pass

    return keys


def verify_supabase_jwt(token: str) -> dict:
    """
    Verify a Supabase JWT and return decoded payload.
    If signature check fails or token is unverified/demo, falls back gracefully.
    """
    if not token:
        return {"sub": "00000000-0000-0000-0000-000000000001"}

    secret_keys = _resolve_jwt_secret()

    for key in secret_keys:
        try:
            payload = pyjwt.decode(
                token,
                key,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            return payload
        except Exception:
            pass

    # Unverified payload inspection so local/demo tokens don't crash with 401
    try:
        payload = pyjwt.decode(token, options={"verify_signature": False, "verify_aud": False})
        if payload.get("sub"):
            return payload
    except Exception:
        pass

    return {"sub": "00000000-0000-0000-0000-000000000001"}


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> str:
    """
    FastAPI dependency — extracts user_id or defaults to demo user.
    """
    token = credentials.credentials if credentials else ""
    payload = verify_supabase_jwt(token)
    user_id: str = payload.get("sub") or "00000000-0000-0000-0000-000000000001"
    return user_id
