/**
 * Runs the import-boundary fence (`.dependency-cruiser.cjs`) and refuses a
 * vacuous pass. dependency-cruiser exits 0 when it can't parse any sources —
 * e.g. an installed typescript major its API support lags behind — which
 * would leave CI green while the fence checks nothing. Cruising zero modules
 * is a failure here, not a pass.
 */
import { spawnSync } from "node:child_process";

const shell = process.platform === "win32";

const fence = spawnSync("depcruise", ["src"], { stdio: "inherit", shell });
if (fence.status !== 0) process.exit(fence.status ?? 1);

const report = spawnSync("depcruise", ["src", "--output-type", "json"], {
  encoding: "utf8",
  shell,
});
const { totalCruised } = JSON.parse(report.stdout).summary;
if (totalCruised === 0) {
  console.error(
    "depcruise cruised 0 modules: the import fence is dead, not passing.\n" +
      "Most likely the installed typescript major is newer than dependency-cruiser\n" +
      "supports — pin typescript back to a supported line (package.json) or bump\n" +
      "dependency-cruiser once it supports the new API.",
  );
  process.exit(1);
}
