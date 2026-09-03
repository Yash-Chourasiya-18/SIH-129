"""
Simple in-memory sliding window rate limiter.
Keyed by user_id or IP address.
"""
import time
from collections import defaultdict, deque
from fastapi import HTTPException, status
from app.core.config import settings

# { key -> deque of timestamps }
_request_log: dict[str, deque] = defaultdict(deque)


def check_rate_limit(key: str, limit: int = None, window_seconds: int = 60):
    """Raise 429 if the key has exceeded `limit` requests in the last `window_seconds`."""
    if limit is None:
        limit = settings.RATE_LIMIT_PER_MINUTE

    now = time.time()
    window_start = now - window_seconds
    dq = _request_log[key]

    # Remove timestamps outside the window
    while dq and dq[0] < window_start:
        dq.popleft()

    if len(dq) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Max {limit} requests per {window_seconds}s.",
        )

    dq.append(now)
