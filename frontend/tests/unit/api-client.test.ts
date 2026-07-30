/**
 * Pins the api-client's error taxonomy: callers (and BackendStatus's
 * guidance) distinguish unreachable / reachable-but-failing / contract
 * drift, so each failure mode must map to its own error type here.
 *
 * `vi.stubGlobal` is auto-restored between tests (`unstubGlobals` in
 * vite.config.ts) — no manual teardown needed.
 */
import { describe, expect, it, vi } from "vitest";

import { ContractViolationError, getHealth, HttpError } from "@/lib/api-client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("getHealth", () => {
  it("returns the parsed payload for a contract-conforming response", async () => {
    vi.stubGlobal("fetch", async () =>
      jsonResponse({ status: "ok", message: "Hello from the backend" }),
    );
    await expect(getHealth()).resolves.toEqual({
      status: "ok",
      message: "Hello from the backend",
    });
  });

  it("throws HttpError carrying the status on a non-2xx response", async () => {
    vi.stubGlobal("fetch", async () =>
      jsonResponse({ detail: "Internal Server Error" }, 500),
    );
    const failure = getHealth();
    await expect(failure).rejects.toBeInstanceOf(HttpError);
    await expect(failure).rejects.toHaveProperty("status", 500);
  });

  it("throws ContractViolationError for a payload that violates the schema", async () => {
    vi.stubGlobal("fetch", async () =>
      jsonResponse({ status: "degraded", message: "db pool exhausted" }),
    );
    await expect(getHealth()).rejects.toBeInstanceOf(ContractViolationError);
  });

  // An unreachable backend surfaces as fetch rejecting (a TypeError in
  // browsers) — passed through untouched so callers can tell "offline"
  // apart from the two typed failures above.
  it("propagates a network-level failure unwrapped", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("Failed to fetch");
    });
    const failure = getHealth();
    await expect(failure).rejects.toBeInstanceOf(TypeError);
    await expect(failure).rejects.not.toBeInstanceOf(HttpError);
    await expect(failure).rejects.not.toBeInstanceOf(ContractViolationError);
  });
});
