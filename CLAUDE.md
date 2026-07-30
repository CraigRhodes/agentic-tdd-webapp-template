<!--
  This repository IS the starter template. When cloning it for a new product:
  replace the <placeholders> below, fill docs/prd.md and docs/design.md, and
  follow the adoption checklist in README.md. Every rule here is either
  summarized in this file or enforced mechanically — keep it that way: this
  file must never describe machinery that doesn't exist.
-->

# <Project name> — Agent Constitution

<One paragraph: what the product is; its one or two flagship ideas.>

Read before non-trivial work, in order:

1. `docs/workflow.md` — the five-stage feature lifecycle: which stage this
   task is in, your role there, and the approval gate that ends it
2. `docs/prd.md` — scope lock
3. `docs/design.md` — decided UX + binding component map
4. `docs/architecture.md` — repo layout; where every kind of code goes
5. `docs/components.md` — component folder + test rules
6. `docs/task-workflow.md` — full double-loop TDD checklist (stages 4–5)

## Stack

- **Frontend** (`frontend/`): Vite + React 19 + TypeScript (strict) · TanStack Router (file-based) + TanStack Query · Tailwind CSS v4 · Zod · Vitest + Testing Library · Storybook · Playwright · Biome · pnpm
- **Backend** (`backend/`): Python 3.13+ managed by `uv` · FastAPI + Pydantic v2 · Ruff · pytest
- **Infra**: GitHub Actions runs the identical full gate on every PR

## Commands

Backend (from `backend/`):

- `uv sync` — install deps
- `uv run uvicorn app.main:app --reload` — dev server on :8000
- `uv run pytest` — tests
- `uv run ruff check . && uv run ruff format --check .` — lint + format check

Frontend (from `frontend/`):

- `pnpm install` — install deps
- `pnpm dev` — dev server on :5173 (proxies `/api` → :8000)
- `pnpm test` — Vitest (component + unit tests)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` — Biome lint + format check (`pnpm lint:fix` applies safe fixes)
- `pnpm depcruise` — import-boundary fence (enforces the tier rules)
- `pnpm storybook` — Storybook on :6006
- `pnpm build-storybook` — story build (runs in CI; broken stories fail)
- `pnpm e2e` — Playwright (boots real backend + frontend)
- `pnpm build` — production build + `tsc --noEmit` (regenerates `routeTree.gen.ts`, which is committed — CI fails if it drifts from the routes)

## Workflow & division of labor

Features move PRD → mockups → project breakdown → implementation →
verification, with a human approval gate after every stage; small work
covered by approved artifacts (a listed task, a bug fix, a chore) enters
at stage 4 directly (`docs/workflow.md` — weight classes). The human owns
the decisions: PRD content, layout approval, systems architecture, the
task list, test contracts, branch history, and the merge. The agent
drafts and executes: spec formatting, prototypes, proposed breakdowns
and design docs, test-first implementation iterated to green, an
adversarial review pass from a session that didn't write the change,
docs sync, PR prep. Work only inside the task's stage; a missing
upstream artifact (PRD coverage, approved layout, approved task list)
means ask, not improvise; when implementation invalidates an upstream
doc, propose the amendment explicitly — never silently diverge from an
approved doc. Test contracts defined by the human are transcribed
faithfully, never reshaped to pass. Never rewrite branch history; never
merge a PR.

## Double-loop TDD (workflow stage 4 — every implementation task)

1. **Plan before code:** read the issue + docs, explore the code the task
   touches, note patterns to reuse. Resolve ambiguities up front: check the
   docs and code first; ask only if it's genuinely a product decision; if
   minor, take the most consistent assumption and state it in the PR.
2. **Outer loop red:** a failing acceptance test first — e2e for any new or
   changed user flow (real UI, real backend, never mocked); integration test
   for API-only work. It must fail because the behavior is missing, not from
   a typo. Every bug fix starts with a test that reproduces the bug at the
   lowest level that captures it — red before the fix, green after, kept in
   the suite as the regression guard. Behavior-preserving work (refactors,
   chores) writes no new red — its outer loop is the existing suite staying
   green throughout.
3. **Inner loop:** unit-level red → green → refactor in small cycles
   (component tests, stories, contract tests, backend units) until the outer
   test can pass.
4. **Full gate green:** every test, lint, typecheck, boundary, story build,
   and e2e command. Never skip, weaken, or delete a test to pass.
5. **Docs pass:** re-read every doc, story, and README section the change
   touches; fix staleness in the same PR. Stale docs are a failing test.
6. **PR** from a branch off `main` (never commit to `main` directly), scoped
   to one task — unrelated improvements go to a new issue. Include the plan
   and red→green evidence; CI must pass.

## Components

- One folder per reusable piece: `src/components/<Name>/` holding
  `<Name>.tsx`, comprehensive `<Name>.test.tsx`, `<Name>.stories.tsx`, and an
  `index.ts` barrel — the only permitted import path. Internals stay
  unexported; the barrel is how complexity hides.
- Two tiers: routes → domain components (schema-typed props) → `ui/`
  primitives (domain-blind). Compose within a tier via barrels; ui never
  imports domain; nothing imports routes. Enforced by
  `frontend/.dependency-cruiser.cjs` in the gate; a linter rule changes only
  in the same PR as its doc rule.
- Presentational only: server state flows route → hook → props; components
  never fetch. Theming is CSS tokens, never props.
- A component must earn existence: reuse (2+ call sites), hidden complexity,
  or enforcing a product rule. Otherwise it's markup in a screen. No
  speculative components; no generic Card/Stack/slot containers; text styles
  are CSS classes.
- Routes/screens are thin composition roots: local UI state and wiring are
  fine; business logic and reusable markup are not.
- Living exemplars: `src/components/ui/Badge/` for the default
  presentational shape; `src/components/BackendStatus/` for the rare
  connected exception.

## Tests are the documentation

The app must be legible from its tests; prose covers only what tests can't.

- E2e covers **all primary user flows** — each flow lands with its e2e, so
  the suite enumerates what the app does. Accessible locators; assert what
  the user sees.
- Unit tests + stories together fully document each component, including
  every error case: a story per visual state, a test per behavior and edge.
  Stories own state setup; tests import it via portable stories
  (`composeStories`) and own all assertions — never in `play` functions.
- Tame combinatorics: vary one input at a time; add only combinations that
  are meaningful in the product — never a cross-product.
- Realistic data only: plausible domain values in every test and fixture —
  no foo/bar, no lorem ipsum, no impossible states.
- Tests and stories are self-contained: any shared state they touch (globals
  like `window.fetch`, timers, env vars, the DOM outside the component) is
  restored when they finish — set up on mount, undo on unmount/teardown, so
  nothing leaks into the next test or story. If setup can't be undone, it
  doesn't belong in a test.
- Generate reference docs from code (OpenAPI, story autodocs) so they can't
  drift; handwritten docs carry only the why, decisions, setup, and
  boundaries. Code is the source of truth.

## Conventions

- The API contract is pinned by golden fixtures in `contracts/`: backend
  tests assert real responses equal the fixture; frontend tests parse the
  same file. Neither side can drift silently.
- Shared API types: Pydantic models in `backend/src/app/models/` mirrored by
  Zod schemas in `frontend/src/lib/schemas.ts`, pinned by those fixtures.
- HTTP layers stay thin — parse, delegate, shape. Logic lives in plain
  unit-tested modules. Deterministic logic (money, time, scoring,
  feasibility) is never LLM-decided at runtime.
- A new dependency needs a named justification — prefer the platform and
  what's already installed.
- Never commit secrets: `.env*` stays out of git; a checked-in
  `.env.example` documents the shape.
- **Attribution:** commits, PRs, code, comments, and docs never mention AI,
  agents, or tools used to produce them — no co-author tags, no "generated
  with" footers.

## Boundaries (do not cross)

<Absolute product rules: safety, money, privacy, scope locks. Where a rule is
checkable, name the fence that checks it.>

## Anti-patterns (automatic rework)

- Tests written after the implementation, or tests that never failed.
- Passing by weakening: loosened assertions, skipped tests, a mocked backend
  in e2e, e2e bypassing the UI.
- Asserting implementation details instead of behavior.
- Components without co-located tests + stories; unrealistic data; prop
  cross-products.
- Tests or stories that mutate global/external state without restoring it
  (a leaked stub, timer, or env var breaks whatever runs next).
- Stale docs, stories, or README after a verified change.
- Drive-by changes bundled into an unrelated PR.
- Duplicating an existing helper/component/fixture instead of reusing it.
