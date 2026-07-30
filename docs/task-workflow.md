# Task Workflow — Double-Loop TDD (mandatory)

Every task follows this workflow, in this order. The summary lives in
`CLAUDE.md`; this is the full checklist. The end product of a task is a PR
whose history and description show that this process was followed.

This checklist is stages 4–5 of the feature workflow (`docs/workflow.md`):
a task enters it from a human-approved project task list
(`docs/projects/`), and its acceptance tests transcribe the human-defined
test contracts — see the division of labor there for what stays with the
human (test contracts, complex systems logic, branch history, the merge).

Double-loop TDD means two nested red→green cycles:

```
┌─ OUTER LOOP (acceptance) ───────────────────────────────────────┐
│  Write ONE failing acceptance test that describes the           │
│  user-visible behavior. It stays red while you work.            │
│                                                                 │
│   ┌─ INNER LOOP (unit) ────────────────────────────┐            │
│   │  red → green → refactor, in small steps:       │  repeat    │
│   │  component tests, stories, contract tests,     │  until the │
│   │  backend units — one behavior at a time        │  outer     │
│   └────────────────────────────────────────────────┘  test can  │
│                                                        go green │
│  The outer test going green is the definition of done.          │
└─────────────────────────────────────────────────────────────────┘
```

The outer test keeps you honest about the goal; the inner loop keeps every
piece of logic pinned against regressions. Neither loop is optional.

## 1. Understand & plan (no implementation code yet)

- Read the issue in full. For non-trivial work, read `docs/prd.md` (scope
  lock) and `docs/design.md` (decided UX + component map).
- Explore the code the task touches before deciding anything: the relevant
  routes, components, hooks, schemas, backend routes and models, and the
  existing tests for those paths. Note which existing helpers, fixtures,
  components, and patterns the change should reuse — prefer extending what
  exists over writing parallel versions.
- Resolve ambiguities now, not mid-implementation: check whether the PRD,
  design doc, or existing code answers it; ask only if it's genuinely a
  product decision; if minor, make the most consistent assumption and state
  it explicitly in the PR description.
- Write down the plan before coding: the files you expect to touch, the
  tests you will write (by name), and the patterns you are reusing. This
  plan becomes the top of the PR description.

## 2. Outer loop — write the failing acceptance test

Write it **before** any implementation code, run it, and confirm it fails
**because the behavior doesn't exist yet** — not because of a typo, bad
import, or broken fixture. A test that fails for the wrong reason proves
nothing.

The acceptance test transcribes the human-defined test contract for the
flow (`docs/workflow.md`, stage 4) faithfully. If the contract seems wrong
or untestable, stop and raise it; if none was given, propose one and get
it approved before implementing — never invent or reshape a contract.

- **Every new or changed user flow gets an e2e test** — required, not
  optional. They live in `frontend/tests/e2e/` and drive the app exactly as
  a real user would:
  - Navigate, click, type, and select — never call APIs directly or reach
    into app internals.
  - Locate elements the way a user perceives them: `getByRole`, `getByLabel`,
    `getByText`. Fall back to test ids only when no accessible locator
    exists (and consider that an accessibility gap to fix).
  - Assert on what the user can see, not on network calls or store state.
  - Run against the real stack: `pnpm e2e` boots the actual backend and dev
    server via Playwright's `webServer` config. Never mock the backend in
    e2e. (Fake provider adapters behind the backend's own interfaces are
    backend configuration, not mocking — "mocking the backend" means
    intercepting HTTP between frontend and backend, and that stays
    forbidden.)
- **Backend-only work** (no UI change) uses a backend integration test as
  the outer test: pytest under `backend/tests/integration/`, marked
  `pytestmark = pytest.mark.integration`, using the `api` httpx fixture
  (real uvicorn server, real HTTP — no `TestClient` shortcut).
- **Every bug fix starts with a test that reproduces the bug**, written at
  the lowest level that captures it — a unit test for a logic bug, e2e only
  when the bug lives in the flow itself. It must be red before the fix and
  green after, and it stays in the suite permanently as the regression
  guard. A bug fixed without a reproducing test is not fixed; it is dormant.
- **Behavior-preserving work** (refactors, chores, dependency bumps) writes
  no new red — its outer loop is the existing suite staying green
  throughout.

Commit the failing acceptance test separately when practical, so the PR
history shows red → green.

## 3. Inner loop — unit red → green → refactor, in small cycles

Work toward the outer test one small behavior at a time. For each behavior:
write a failing unit test, make it pass with the smallest change, refactor,
repeat. Coverage expected from the inner loop:

- **Component tests + stories**, co-located per `docs/components.md`: a test
  per behavior and edge case, a story per visual state. Tests compose their
  starting state from stories (`composeStories`) — setup is defined once, in
  the story; assertions live only in tests. A new or changed component
  without both fails review.
- **Contract tests**: golden fixtures in `contracts/` pin the Zod ↔ Pydantic
  contract from both sides — a backend test asserts the real endpoint
  response equals the fixture, and a frontend test parses the same fixture
  with the Zod schema. Never pin a contract with hand-copied payloads that
  only one side reads.
- **Backend unit tests**: pytest under `backend/tests/unit/`, mirroring
  `src/app/`. All deterministic domain logic is pinned here.

Implementation rules while in the loop:

- Write the smallest implementation that makes the current failing test
  pass, following `CLAUDE.md` conventions: HTTP layer stays thin, logic
  lives in dedicated modules, server state goes through query hooks,
  frontend Zod schemas mirror backend Pydantic models.
- Reuse before you write: existing fixtures, components, hooks, and utility
  code. New abstractions need a second caller or a named reason; new
  dependencies need a named justification.
- Refactor only on green, and keep the tests green through the refactor.

## 4. Outer loop green — verify everything before the PR

Run the full gate locally and confirm every command passes:

```sh
# backend (from backend/)
uv run pytest
uv run ruff check . && uv run ruff format --check .

# frontend (from frontend/)
pnpm build            # prod build + tsc --noEmit (use pnpm typecheck for tsc alone)
pnpm lint             # Biome lint + format check (pnpm lint:fix applies safe fixes)
pnpm test
pnpm depcruise        # import-boundary fence — the tier rules from docs/components.md
pnpm build-storybook  # broken stories fail
pnpm e2e              # boots backend + frontend; run `uv sync` in backend/ first if deps changed
                      # (CI runs e2e against the production bundle via vite preview)
```

- The e2e run is the most important gate: it proves the change works
  end-to-end the way a user will experience it. Do not open a PR with
  failing or skipped e2e.
- Never weaken, skip, delete, or `xfail` a test to get to green. If an
  existing test is genuinely wrong, fix it and explain why in the PR
  description.
- If you wrote UI, also load it yourself (dev servers per `README.md`) and
  confirm it behaves sanely beyond what the tests assert.
- Once the gate is green, the diff gets an adversarial review from a
  session that did **not** write it (`docs/workflow.md`, stage 5): bugs,
  weakened or missing assertions, contract mismatches, boundary
  violations, leaked test state. Findings are fixed or explicitly noted
  in the PR before the human audit.

## 5. Docs pass — after the solution verifies

Re-read every doc, story, and README section the change touches — including
the component map in `docs/design.md` and the layout rules in
`docs/architecture.md` — and fix anything stale in the same PR. Stale
documentation is a failing test. Prefer regenerating docs from code over
hand-editing where a generated form exists.

If the change revealed that an upstream artifact (PRD, design doc, project
doc) is wrong, propose the amendment explicitly and get the human's call
(`docs/workflow.md` — gates face both ways). Never leave the code silently
diverging from an approved doc.

## 6. PR

- Branch off `main`; never commit to `main` directly. One task per PR —
  unrelated improvements go to a new issue.
- The PR description must include:
  1. A link to the issue.
  2. The plan from step 1 (approach, ambiguities resolved and how).
  3. Test evidence: the acceptance test written first, the inner-loop tests
     added, and confirmation the full gate (including e2e) passes.
- Fill in the checklist in the PR template honestly — it mirrors this
  document.
- Commits, PR titles, and PR bodies follow the attribution rule in
  `CLAUDE.md`: plain descriptions of the change only.
- CI runs the same gate (`.github/workflows/ci.yml`); a PR is not done until
  CI is green.

## Anti-patterns (automatic rework)

- Implementation written before tests, with tests back-filled to match it.
- Tests that never failed — if it can't fail, it can't catch a regression.
- Skipping the outer loop: shipping a user flow with only unit tests, or an
  API change with only `TestClient`-style shortcuts.
- Skipping the inner loop: one giant e2e standing in for unit coverage.
- E2e specs that bypass the UI (direct `fetch`/API calls, injected state).
- Assertions on implementation details instead of user-visible behavior.
- Getting to green by loosening assertions, skipping tests, or mocking the
  backend in e2e.
- A component merged without co-located comprehensive tests and stories.
- Unrealistic test data, or prop cross-products instead of curated cases.
- Stale docs, stories, or README after a verified change.
- Drive-by changes bundled into an unrelated PR.
- Duplicating an existing helper/component/fixture instead of reusing it.
