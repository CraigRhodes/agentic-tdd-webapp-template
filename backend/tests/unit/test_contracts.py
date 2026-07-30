"""Golden contract fixtures shared with the frontend.

Each fixture in `contracts/` is asserted field-for-field against the real
endpoint response here, and parsed by the mirroring Zod schema in
`frontend/tests/unit/schemas.test.ts`. Changing a backend model forces the
fixture to change, which breaks the frontend test until
`src/lib/schemas.ts` catches up.
"""

from collections.abc import Callable

from fastapi.testclient import TestClient


def test_health_response_matches_contract_fixture(
    client: TestClient, load_fixture: Callable[[str], object]
) -> None:
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == load_fixture("health.json")
