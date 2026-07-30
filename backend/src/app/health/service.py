"""Health domain logic — the living exemplar of the thin-route split.

The route (`api/routes.py`) only parses, delegates here, and shapes the
response; anything beyond that belongs in a domain package like this one,
with tests mirroring under `tests/unit/`. Deliberately minimal: the shape is
the exemplar, not the logic.
"""

from app.models.schemas import HealthResponse


def current_health() -> HealthResponse:
    return HealthResponse(status="ok", message="Hello from the backend")
