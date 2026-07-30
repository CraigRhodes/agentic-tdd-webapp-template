"""Integration fixtures: a real uvicorn server on an ephemeral port.

Later this is where external-provider fakes and database fixtures live.
"""

import socket
import threading
import time
from collections.abc import Iterator

import httpx
import pytest
import uvicorn

from app.main import app


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="session")
def server_url() -> Iterator[str]:
    port = _free_port()
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    deadline = time.monotonic() + 10
    while not server.started:
        if time.monotonic() > deadline:
            raise RuntimeError("uvicorn did not start within 10s")
        time.sleep(0.05)

    yield f"http://127.0.0.1:{port}"

    server.should_exit = True
    thread.join(timeout=5)


@pytest.fixture(scope="session")
def api(server_url: str) -> Iterator[httpx.Client]:
    # trust_env=False: never route localhost tests through HTTP(S)_PROXY/ALL_PROXY
    with httpx.Client(base_url=server_url, timeout=5, trust_env=False) as client:
        yield client
