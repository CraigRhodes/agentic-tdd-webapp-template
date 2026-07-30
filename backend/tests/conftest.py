import json
from collections.abc import Callable, Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

CONTRACTS = Path(__file__).resolve().parents[2] / "contracts"


@pytest.fixture
def client() -> Iterator[TestClient]:
    # Context-managed so lifespan events run — the day the app gains startup
    # wiring, these tests exercise it instead of silently skipping it.
    with TestClient(app) as client:
        yield client


@pytest.fixture
def load_fixture() -> Callable[[str], object]:
    """Load a golden contract fixture from `contracts/` (shared with the frontend)."""

    def load(name: str) -> object:
        return json.loads((CONTRACTS / name).read_text())

    return load
