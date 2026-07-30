# Feature Workflow — PRD to Merged PR (mandatory)

Every feature moves through five stages, in order. Each stage has a human
owner and an agent role, and ends at an **approval gate**: the agent's work
product is a draft for the human to edit, approve, or reject, and the
human's approval is the binding input to the next stage.

`docs/task-workflow.md` is the zoomed-in checklist for stages 4–5 (one
implementation task at a time); this document is the map around it.

## Routing: what to do with a task

Given a task, first place it in a stage:

| The task sounds like… | Stage |
|---|---|
| "Here's the problem / here's what I want to build" | 1 — PRD & concept |
| "Mock up / prototype this screen or flow" | 2 — Mockups & UI |
| "Break this down / plan the project / draft the design doc" | 3 — Breakdown |
| "Build / implement / fix X" (a task from an approved list) | 4 — Implementation |
| "Verify / prep the PR / update the docs" | 5 — Verification & docs |

Do that stage's agent work, then **stop at the gate**. Never run ahead:
drafting a design doc is not a license to implement it; a prototype never
becomes production code by promotion. If a stage-4 task arrives and its
upstream artifacts (PRD coverage, approved layouts, an approved task list)
are missing or don't cover it, say so and ask — implementing from an
unapproved plan is scope invention.

## Weight classes: match ceremony to stakes

Not everything traverses five stages. The gates exist to catch expensive
mistakes early, not to ceremonialize small ones — the human's attention is
the scarcest resource in this system, and every gate spends it.

- **Full pipeline** — work that changes scope, screens, the API shape, or
  the architecture: new features, new flows, new projects.
- **Straight to stage 4** — work already covered by approved artifacts: a
  task on an approved list, a bug fix (entering with its reproducing test,
  per `docs/task-workflow.md`), a behavior-preserving refactor or chore
  (the existing suite is its contract), a docs fix.

Don't route a bug fix through PRD ceremony — and don't smuggle a scope
change in dressed as a small fix. When the weight class is genuinely
unclear, that's a question for the human, and a cheap one.

## Gates face both ways

Implementation reliably surfaces facts that invalidate upstream documents
— an API shape that doesn't survive contact, a flow the PRD didn't
foresee. When that happens, never silently diverge from the approved doc
and never plow ahead on a plan now known to be wrong: propose the
amendment explicitly (the doc edit itself, in the PR or as its own small
change), name what it invalidates, and get the human's call. An approved
doc is binding until amended — but amending is cheap and expected, not a
failure of planning.

## The stages

### 1. PRD & concept → `docs/prd.md`

- **Human**: defines the core problem, the business logic, and the expected
  end results.
- **Agent**: formats that intent into the executable spec (the `docs/prd.md`
  template), scans it for contradictions, flags edge cases and missing
  failure states the UX will have to handle, and red-teams it: what will
  users assume is in scope that the non-goals don't exclude? How does each
  flow fail, and what does the user see then?
- The agent never invents scope or resolves a product question by
  assumption here — a gap or contradiction is a question for the human, and
  surfacing it is the job.
- **Gate**: the human approves the PRD. From then on it is the scope lock.

### 2. Mockups & UI → `docs/mockups/` + decisions in `docs/design.md`

- **Human**: dictates the user flow, guides the aesthetics, approves
  layouts.
- **Agent**: generates the functional DOM structures, CSS, and interactive
  prototypes for the human to react to.
- Prototypes are **disposable**: self-contained HTML files in
  `docs/mockups/` (created on first use), viewable by opening the file —
  never inside `frontend/src/`, never tested, never imported. Production
  UI is rebuilt test-first in stage 4; referencing a prototype's markup is
  fine, promoting it wholesale is the anti-pattern.
- What the human approves lands in `docs/design.md`: the decisions list,
  screen inventory, and visual tokens.
- **Gate**: the human approves the layouts.

### 3. Breakdown into projects → `docs/projects/<name>.md`

- **Human**: owns the systems architecture, rigorously edits the task list,
  and enforces boundaries.
- **Agent**: proposes how the design splits into projects, then drafts one
  design doc per project (`docs/projects/`, created on first use):
  - the PRD slice it delivers, and the user flows covered — each flow named
    here gets an e2e test in stage 4;
  - the proposed component breakdown (tiers per `docs/components.md`; rows
    proposed for the component map in `docs/design.md`);
  - the API shape (resources and lifecycle, recorded per
    `docs/architecture.md`, with the contracts to pin);
  - requirements, and a draft task list — small, ordered, each task
    shippable as a single PR.
- **Gate**: the human-edited task list is approved. That list **is** the
  scope: the agent doesn't add, merge, or reorder tasks silently.

### 4. Implementation — per `docs/task-workflow.md`, one task at a time

- **Human**: defines the test contracts (what each acceptance test must
  prove — the given/when/then per flow) and owns branch history (rebases,
  squashes, force-pushes).
- **Agent**: everything else — transcribes the contracts into failing
  outer-loop tests, generates the application code, and autonomously
  iterates on failures until the tests pass, following the double-loop:
  e2e per user flow, component tests + stories as the project proceeds,
  and integration tests where components interact, as applicable.
- Test contracts are the one artifact the agent has **no license to
  adjust**: transcribe them faithfully, and if one seems wrong or
  untestable, stop and say so — never reshape a contract to make it pass.
  If no contract was given for a flow, propose one and get it approved
  before implementing.
- The human writes code when writing is the best way to think a problem
  through, or to stay sharp enough to audit — a per-task choice, not a
  standing split by difficulty. The default, even for hard logic, is:
  the human specifies and verifies, the agent generates. Human-written
  code gets no exemption — the agent surrounds it with the same pinning
  tests, and it goes through the same stage-5 adversarial review;
  otherwise it is the least-reviewed code in the repo, because nobody
  reviews the reviewer.
- The agent commits small and linear on the task branch; history rewriting
  is the human's.

### 5. Verification & docs → PR

- **Agent**: runs the full gate locally, executes and monitors the CI
  checks, does the docs pass (every touched doc, story, and README section
  — stale docs are a failing test), loads the UI on the dev servers and
  reports what it saw, and prepares the PR per the template with red→green
  evidence.
- **Agent — adversarial pass**: before the human audit, a session that did
  **not** write the change reviews the diff adversarially: bugs, weakened
  or missing assertions, contract mismatches, boundary violations, leaked
  test state, and divergence from the approved docs. Findings are fixed or
  explicitly noted in the PR. This is a filter, not a substitute —
  wherever human judgment is the bottleneck, a cheap agent filter goes in
  front of it, never in place of it.
- **Human**: audits on top of the filtered result — spending attention on
  what only they can catch: maintainability, product fit, systemic drift —
  does their own manual pass, and merges.
- The agent **never merges a PR** — its own or anyone else's.

## Operating model: a one-person engineering org

This pipeline is shaped like a tech lead running an agent team, and it is
meant to run **concurrently**: several stage-4 tasks in flight on separate
branches while the human edits the next project's task list or reviews a
finished PR. The gates, the one-task-per-PR rule, and the unweakenable
test contracts are what make that safe. Under concurrency the agent's
obligations tighten:

- Scope stays airtight — a drive-by improvement inside a parallel task is
  a merge conflict wearing a halo; it goes to a new issue.
- Assumptions made mid-task are stated in the PR, not left implicit.
- Merge order, and any cross-task conflict, is the human's call.

## Division of labor (the standing contract)

| Workflow step | Human's role | Agent's role |
|---|---|---|
| 1. PRD & concept | Define the core problem, business logic, and expected end results. | Scan for contradictions, flag edge cases, red-team the scope, and format the intent into an executable spec. |
| 2. Mockups & UI | Dictate the user flow, guide the aesthetics, and approve layouts. | Generate the functional DOM structures, CSS, and interactive frontend prototypes. |
| 3. Task breakdown | Own the systems architecture and rigorously edit the task list to enforce boundaries. | Propose the initial component breakdown and draft the project design documents. |
| 4. Implementation (TDD) | Define the test contracts, own branch history, and write code where writing is the best way to think it through. | Generate application code, autonomously iterate on failures until tests pass, and surround human-written code with the same tests. |
| 5. Verification & docs | Audit for maintainability and product fit, catch systemic blind spots, and merge the PR. | Run the gates and CI, deliver an adversarial first-pass review from a fresh session, and synchronize the documentation. |
