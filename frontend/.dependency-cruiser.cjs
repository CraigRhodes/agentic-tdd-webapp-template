/**
 * Import-boundary fence — machine-enforces the arrows in docs/components.md.
 * A rule changes here only in the same PR that changes it in the docs.
 *
 * `typescript` is pinned to the 6.x line in package.json for this fence's
 * sake: with typescript@7 installed, dependency-cruiser (as of v18) can't
 * parse TS sources, cruises 0 modules, and exits 0 — a dead fence reporting
 * a pass. `scripts/depcruise.mjs` turns that vacuous pass into a hard
 * failure; unpin typescript when dependency-cruiser supports the TS7 API.
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies are a design smell at any tier",
      from: {},
      to: { circular: true },
    },
    {
      name: "ui-never-imports-domain",
      severity: "error",
      comment:
        "Primitives are domain-blind: src/components/ui/ must not import from the domain tier",
      from: { path: "^src/components/ui/" },
      to: { path: "^src/components/", pathNot: "^src/components/ui/" },
    },
    {
      name: "components-via-barrel-only",
      severity: "error",
      comment:
        "A component imports another component's barrel, never its internals (same-folder imports are fine)",
      from: { path: "^(src/components/(?:ui/)?[^/]+)/" },
      to: {
        path: "^src/components/(?:ui/)?[^/]+/",
        pathNot: ["^$1/", "/index\\.ts$"],
      },
    },
    {
      name: "no-reaching-into-components",
      severity: "error",
      comment:
        "Code outside src/components/ imports a component's barrel (index.ts), never files inside its folder",
      from: { pathNot: "^src/components/" },
      to: { path: "^src/components/(?:ui/)?[^/]+/", pathNot: "/index\\.ts$" },
    },
    {
      name: "nothing-imports-routes",
      severity: "error",
      comment:
        "Routes are composition roots; only the generated route tree may import them",
      from: { pathNot: ["^src/routes/", "^src/routeTree\\.gen\\.ts$"] },
      to: { path: "^src/routes/" },
    },
    {
      name: "components-stay-presentational",
      severity: "error",
      comment:
        "Server state flows route → hook → props; components never import hooks or the api-client. BackendStatus is the one blessed connected exception (docs/components.md)",
      from: {
        path: "^src/components/",
        pathNot: "^src/components/BackendStatus/",
      },
      to: { path: "^src/(hooks/|lib/api-client)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
  },
};
