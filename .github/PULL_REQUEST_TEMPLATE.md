## Issue

<!-- Link the issue this PR implements. One task per PR. -->

## Plan

<!-- Approach, files touched, patterns reused, and any ambiguities you resolved
     (and how). Written BEFORE implementation — see docs/task-workflow.md. -->

## Tests (double-loop TDD, per docs/task-workflow.md)

<!-- Name the outer-loop acceptance test and the inner-loop tests, and what each pins down. -->

- [ ] Outer loop: a failing acceptance test (e2e for user flows; backend integration test for API-only work; a reproducing test for bug fixes) was written **before** implementation and failed for the right reason (missing behavior)
- [ ] The acceptance tests transcribe the approved test contracts faithfully (docs/workflow.md, stage 4) — none were invented or reshaped to pass
- [ ] Inner loop: unit coverage added for every piece of new or changed logic (component tests + stories per docs/components.md, contract fixtures, backend units)
- [ ] Every new or changed component has comprehensive co-located tests **and** a story per visual state, with realistic data and no prop cross-products
- [ ] E2e drives the UI like a real user (no API shortcuts, no mocked backend)
- [ ] No test was skipped, weakened, or deleted to get to green (if one was fixed, why is explained above)

## Docs pass

- [ ] Every doc, story, and README section this change touches was re-read and updated (stale docs are a failing test)

## Verification

- [ ] Backend: `uv run pytest` and `uv run ruff check . && uv run ruff format --check .` pass
- [ ] Frontend: `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm depcruise`, and `pnpm build-storybook` pass
- [ ] E2e: `pnpm e2e` passes against the real backend + frontend
- [ ] Adversarial review: a session that did not write the change reviewed the diff (docs/workflow.md, stage 5); findings are fixed or noted above
- [ ] Any upstream doc this change invalidated has a proposed amendment (gates face both ways) — none left silently diverged
