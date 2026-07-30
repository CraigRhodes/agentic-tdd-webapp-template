# Design — Decided UX & Component Map

> Fill this as design decisions land. This file records **decisions** so
> implementation never re-litigates them; the PRD (`docs/prd.md`) is the
> behavioral source of truth. Rules for the component tiers live in
> `docs/components.md`.

## Decisions (settled — do not reopen without a product call)

<Each decided UX/visual call as a short bullet: what was decided and the one
line of reasoning that prevents re-litigation.>

## Screen inventory

| Screen | Source (mockup/ticket) | What it does |
|---|---|---|
| <name> | <ref> | <one line> |

## Visual tokens

<Type scale, color tokens (must match `frontend/src/styles/index.css`), and
recurring furniture. Components consume tokens via Tailwind utilities — never
raw hex, never palette props.>

## Component map (plan of record)

Nothing here is built speculatively: each piece is born, test-first, inside
the task that builds its flow (`docs/task-workflow.md`). Rows are proposed
by project design docs (`docs/projects/`, stage 3 of `docs/workflow.md`)
and land here when the human approves the breakdown — this map stays the
single inventory across projects.

### Routes (thin screens)

| Route | Renders |
|---|---|
| `/` | <composition> |
| (no match) | not-found fallback in `__root.tsx` (template ships it; restyle to your product's voice) |

### Primitives (`src/components/ui/` — no domain knowledge)

| Primitive | Recurs in | Props sketch |
|---|---|---|
| `Badge` | (template exemplar of the presentational shape) | `tone?, children` |

### Domain components (`src/components/` — props are schema types)

| Component | Props (schema types) | Exists because |
|---|---|---|
| `BackendStatus` | — | the blessed *connected* exception; testing exemplar |

### Deliberately not components

<Single-screen markup, CSS-utility text styles, and anything else that stays
in its route until a second consumer appears.>

### Named deferrals (decided later, on purpose — not oversights)

<Behaviors intentionally left undecided, each with the task that will decide
it.>
