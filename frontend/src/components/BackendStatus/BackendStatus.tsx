import { useHealth } from "@/hooks/useHealth";
import { ContractViolationError, HttpError } from "@/lib/api-client";

/**
 * Living exemplar of the component pattern (docs/components.md):
 * own folder, barrel export, comprehensive co-located tests.
 */

// Each failure cause gets its own guidance — telling the user to start a
// backend that is up-but-erroring (or drifted) would be wrong guidance.
// Gateway statuses are the inverse trap: behind the dev proxy a dead
// backend never surfaces as a network failure (Vite answers 502 itself),
// so they mean "unreachable" — telling the user to check the logs of a
// server that isn't running would be wrong guidance too.
const GATEWAY_STATUSES = new Set([502, 503, 504]);

function errorMessage(error: Error): string {
  if (error instanceof ContractViolationError) {
    return "Backend response didn't match the expected contract — realign contracts/ and src/lib/schemas.ts";
  }
  if (error instanceof HttpError && GATEWAY_STATUSES.has(error.status)) {
    return `Backend unreachable (HTTP ${error.status}) — start it with \`uv run uvicorn app.main:app --reload\``;
  }
  if (error instanceof HttpError) {
    return `Backend error (HTTP ${error.status}) — it's running but the request failed; check its logs`;
  }
  return "Backend offline — start it with `uv run uvicorn app.main:app --reload`";
}

export function BackendStatus() {
  const { data, isPending, isError, error } = useHealth();

  return (
    <p
      role="status"
      className="rounded-full border border-app-ink/20 px-4 py-1.5 text-sm"
    >
      {isPending && "Checking backend…"}
      {isError && errorMessage(error)}
      {data && (
        <span className="text-app-ok">
          {data.message} ({data.status})
        </span>
      )}
    </p>
  );
}
