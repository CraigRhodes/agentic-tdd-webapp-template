from app.health.service import current_health


def test_current_health_reports_ok() -> None:
    health = current_health()
    assert health.status == "ok"
    assert health.message == "Hello from the backend"
