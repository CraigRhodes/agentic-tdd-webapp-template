"""HTTP layer only — keep this thin: parse, delegate to a domain module, shape."""

from fastapi import APIRouter

from app.health.service import current_health
from app.models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return current_health()
