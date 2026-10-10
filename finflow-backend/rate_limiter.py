"""
Sliding-window rate limiter.

Limits AI chat requests per authenticated user to prevent abuse.
Uses an in-memory store (adequate for a single-process server).
For multi-process deployments, replace with Redis.

Default: 20 requests per user per hour.
"""
from __future__ import annotations
import time
from collections import defaultdict, deque
from threading import Lock

from config import settings


class RateLimiter:
    def __init__(
        self,
        max_requests: int = settings.RATE_LIMIT_REQUESTS,
        window_seconds: int = settings.RATE_LIMIT_WINDOW_SECONDS,
    ):
        self._max = max_requests
        self._window = window_seconds
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def is_allowed(self, user_id: str) -> tuple[bool, int]:
        """
        Check if the user is within their rate limit.

        Returns:
            (allowed: bool, retry_after: int)  — retry_after is seconds to wait when denied.
        """
        now = time.time()
        cutoff = now - self._window

        with self._lock:
            q = self._requests[user_id]

            # Remove timestamps outside the current window
            while q and q[0] < cutoff:
                q.popleft()

            if len(q) >= self._max:
                # How many seconds until the oldest request expires
                retry_after = max(0, int(q[0] + self._window - now)) + 1
                return False, retry_after

            q.append(now)
            return True, 0


# Singleton instance used across the application
rate_limiter = RateLimiter()
