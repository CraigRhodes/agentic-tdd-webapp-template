"""Real-HTTP smoke tests against a live uvicorn server."""

from collections.abc import Callable

import httpx
import pytest

pytestmark = pytest.mark.integration


def test_health_over_real_http(api: httpx.Client, load_fixture: Callable[[str], object]) -> None:
    res = api.get("/api/health")
    assert res.status_code == 200
    assert res.json() == load_fixture("health.json")
