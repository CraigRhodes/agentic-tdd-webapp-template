import { type HealthResponse, healthResponseSchema } from "@/lib/schemas";

/**
 * The backend answered, but the payload violates the pinned contract
 * (contracts/ + src/lib/schemas.ts). A different failure than the backend
 * being unreachable — callers may present it differently.
 */
export class ContractViolationError extends Error {}

/**
 * The backend answered with a non-2xx status — it is reachable, just failing.
 * Distinct from a network-level failure (fetch rejecting), which means the
 * backend is unreachable; callers may present the two differently.
 */
export class HttpError extends Error {
  readonly status: number;

  constructor(path: string, status: number) {
    super(`${path} responded ${status}`);
    this.status = status;
  }
}

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(path);
  if (!res.ok) throw new HttpError(path, res.status);
  return res.json();
}

export async function getHealth(): Promise<HealthResponse> {
  const parsed = healthResponseSchema.safeParse(await getJson("/api/health"));
  if (!parsed.success) {
    throw new ContractViolationError(`/api/health: ${parsed.error.message}`);
  }
  return parsed.data;
}
