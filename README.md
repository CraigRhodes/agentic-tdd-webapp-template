# Web app template

[![Backend](https://github.com/CraigRhodes/agentic-tdd-webapp-template/actions/workflows/backend.yml/badge.svg?branch=main)](https://github.com/CraigRhodes/agentic-tdd-webapp-template/actions/workflows/backend.yml)
[![Frontend](https://github.com/CraigRhodes/agentic-tdd-webapp-template/actions/workflows/frontend.yml/badge.svg?branch=main)](https://github.com/CraigRhodes/agentic-tdd-webapp-template/actions/workflows/frontend.yml)
[![E2E](https://github.com/CraigRhodes/agentic-tdd-webapp-template/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/CraigRhodes/agentic-tdd-webapp-template/actions/workflows/e2e.yml)

A starter for web apps (React frontend + FastAPI backend) with the working
agreements pre-wired: double-loop TDD, tests-as-documentation, component
folders with co-located tests and stories, contract fixtures pinning the API,
and an import-boundary linter — all running in one CI gate.

## Adopting this template

1. Copy the repo (or click "Use this template"), then — templates age —
   bump dependencies first and run the full gate; the gate is what makes
   bumps safe. Use `pnpm up --latest` and `uv sync -U`: plain `pnpm up`
   respects the `^` ranges and never crosses a major, which is exactly
   where the staleness accumulates. Majors may need code changes — let the
   gate tell you. (Dependabot — `.github/dependabot.yml` — keeps a hosted
   copy current with weekly grouped PRs, but bump on adoption anyway in
   case the template sat unmaintained.)
2. Fill the `<placeholders>` in `CLAUDE.md` — project name, product paragraph,
   Boundaries.
3. Fill `docs/prd.md` (scope lock) and `docs/design.md` (decided UX +
   component map). The other docs are generic and ready to use.
4. Search for `App`/`app` naming you want to change: the backend package is
   `backend/src/app/`, the frontend title is in `frontend/index.html`.
5. Repoint the CI badges at the top of this README at your repo (swap the
   `<owner>/<repo>` segments in each URL).
6. Replace the placeholder design tokens in `frontend/src/styles/index.css`.
7. Revisit `LICENSE`: it covers this template (MIT). Keep it if your product
   is open source; replace or remove it if not — your copy of the template
   doesn't need to stay MIT.
8. Delete this section of the README and describe your product.

## Quick start

Backend (Python 3.13+, [uv](https://docs.astral.sh/uv/)):

```sh
cd backend
uv sync
uv run uvicorn app.main:app --reload   # http://localhost:8000/api/health
```

Frontend (Node 24+ — pinned in `.nvmrc`/`engines` and matched by CI — with
[pnpm](https://pnpm.io/)):

```sh
cd frontend
pnpm install
pnpm dev                                # http://localhost:5173
```

The frontend dev server proxies `/api` to the backend; run both to see the
hello page confirm the round trip.

## The gate

```sh
cd backend && uv run pytest
cd backend && uv run ruff check . && uv run ruff format --check .
cd frontend && pnpm build             # prod build + tsc --noEmit (pnpm typecheck for tsc alone)
cd frontend && pnpm lint              # Biome lint + format check
cd frontend && pnpm test
cd frontend && pnpm depcruise         # import-boundary fence (tier rules)
cd frontend && pnpm build-storybook   # broken stories fail
cd frontend && pnpm e2e               # Playwright; boots backend + frontend
```

CI (`.github/workflows/` — backend, frontend, and e2e workflows, one badge
each) runs the identical gate on every PR. All
work follows the double-loop TDD workflow in
[`docs/task-workflow.md`](docs/task-workflow.md).

## Layout

```
CLAUDE.md               agent constitution — stack, rules, boundaries
contracts/              golden JSON fixtures pinning the API contract
docs/                   workflow (feature lifecycle + who does what) · prd (stub) ·
                        design (stub) · architecture · components · task-workflow
backend/                FastAPI + Pydantic v2, uv-managed (package: app)
frontend/               Vite + React + TS strict, TanStack Router/Query, Tailwind, Storybook
.github/                workflows/: backend + frontend + e2e, the full gate on every PR ·
                        dependabot.yml: weekly grouped dependency bumps
```
