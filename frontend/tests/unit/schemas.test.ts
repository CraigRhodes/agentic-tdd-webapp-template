/**
 * Contract tests pinning the Zod ↔ Pydantic mirror from the frontend side.
 *
 * The golden fixtures in `contracts/` are asserted field-for-field against the
 * real endpoint by `backend/tests/unit/test_contracts.py`; parsing the same
 * fixture here means a backend model change (which forces a fixture change)
 * breaks this test until `src/lib/schemas.ts` catches up.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { healthResponseSchema } from "@/lib/schemas";

const contractsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../contracts",
);

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(contractsDir, name), "utf8"));
}

describe("healthResponseSchema", () => {
  it("parses the shared golden fixture the backend asserts against", () => {
    const parsed = healthResponseSchema.parse(loadFixture("health.json"));
    expect(parsed.message).toBe("Hello from the backend");
  });

  it("rejects an invalid status", () => {
    expect(() =>
      healthResponseSchema.parse({ status: "down", message: "x" }),
    ).toThrow();
  });

  it("rejects a missing message", () => {
    expect(() => healthResponseSchema.parse({ status: "ok" })).toThrow();
  });
});
