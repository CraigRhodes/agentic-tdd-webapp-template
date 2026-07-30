"""Pydantic models shared across the API.

Frontend mirrors these in `frontend/src/lib/schemas.ts` (Zod) — keep them in sync.
"""

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    message: str
