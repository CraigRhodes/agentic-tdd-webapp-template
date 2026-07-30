# Component Structure & Testing Rules (mandatory)

Every reusable piece of UI is a **component in its own folder** with
**comprehensive co-located unit tests and stories**. This is not a
suggestion; a component without them fails review (see anti-patterns in
`docs/task-workflow.md`). The concrete inventory mapping designs → components
is the component map in `docs/design.md`.

## Tiers & dependency direction

Two tiers of components, and imports flow strictly downward:

```
routes → src/components/<Name>/ (domain) → src/components/ui/<Name>/ (primitives) → nothing
```

- **Primitives** (`src/components/ui/`) have zero domain knowledge — generic
  props only.
- **Domain components** (`src/components/`) speak the types inferred from
  `src/lib/schemas.ts` — never ad-hoc prop bags. The API contract and the
  component contract are the same thing, pinned by the same schema tests.
- **Composition within a tier is allowed and expected** — but always through
  the other component's barrel. What the arrow forbids is pointing *up*: a
  primitive never imports a domain component, and no component imports from
  `src/routes/`. Deep imports past a barrel are forbidden in every direction.

These rules are **machine-enforced**: `frontend/.dependency-cruiser.cjs`
mirrors them one-for-one and `pnpm depcruise` runs in the full gate and CI.
Any blessed exception is encoded there explicitly — adding one means editing
that config, this document, and the component map in the same PR, which is
exactly the friction intended.

Three more rules that keep components simple:

- **Components are presentational.** They never fetch, never navigate, never
  own app state beyond their own micro-interactions. Server state flows
  route → hook (`src/hooks/`) → props. `BackendStatus` is the documented
  exception (it consumes a hook) and exists as the testing exemplar for that
  shape — it is not the default. Two fences enforce this: the
  dependency-cruiser rule blocks components from importing hooks or the
  api-client, and a Biome `noRestrictedGlobals` override (`biome.jsonc`)
  bans the `fetch` global inside `src/components/` implementation files.
  The Biome fence is a tripwire, not a wall — it catches only the bare
  `fetch` identifier, so `window.fetch(...)` would slip past it. The import
  fence is the primary enforcement; spelling a fetch call to dodge the
  tripwire is a rule violation all the same and fails review.
- **Theming is CSS, never props.** Components use the semantic tokens from
  `src/styles/index.css`; an alternate theme is a token swap on the root
  element.
- **Pure logic lives in `src/lib/`**, not inside components. Components
  render; lib functions compute; each is tested on its own terms.

## The folder pattern

```
src/components/<ComponentName>/
  <ComponentName>.tsx          the public component (named export)
  <ComponentName>.test.tsx     comprehensive unit tests, co-located
  <ComponentName>.stories.tsx  a story per visual state, co-located
  index.ts                     barrel — re-exports ONLY the public surface
  <anything else>.tsx          private subcomponents/helpers — NOT exported
```

- `<ComponentName>` is PascalCase and matches the exported component name.
- `index.ts` is the **only** import path other code may use.
- **Hiding complexity is the point of the barrel.** A component may contain
  as many private subcomponents, hooks, and helpers as it needs inside its
  folder; none are exported unless another feature genuinely needs them —
  and then they usually deserve promotion to their own folder instead.

## When to make a component

A component earns existence one of three ways:

1. **Reuse** — the same visual pattern appears in 2+ places (second use is
   the trigger; don't speculatively componentize).
2. **Hidden complexity** — it encapsulates something genuinely hard (a heavy
   visualization library, a ticking clock).
3. **An enforced boundary** — it makes a product rule structurally hard to
   break by being the only way to render the thing the rule governs.

Also: a design-doc component-map item (`docs/design.md`) is being built → it
is a component from day one, since it already passed this test on paper.

Everything else is markup in a screen — and markup in a screen is fine.
Explicitly **not** components:

- Text styles — those are CSS utility classes.
- Generic `Card`/`Section`/`Stack`/slot containers — layout is Tailwind in
  screens; generic containers are where component libraries go to die.
- Single-screen furniture — it lives in its route until a second screen
  wants it.

## The test bar: "comprehensive" means

Written test-first, in the inner loop of `docs/task-workflow.md`. Unit tests
and stories **together** must fully document the component — reading the
tests and flipping through the stories gives a complete picture, including
every error case. The two are linked mechanically by **portable stories**:
stories are the only place component state setup is defined, and tests import
that setup with `composeStories` — a test cannot start from a state the
catalog doesn't picture.

1. **Stories own setup; tests own assertions.** A story per visual state
   (every variant a prop can produce, plus loading/error/empty), and one per
   distinct input condition a test needs even when it looks identical (same
   pixels, different cause — name it for the cause and say so in a comment).
   Args, decorators, and stubs live in the story file. Assertions never live
   in `play` functions — the story catalog stays a state exhibit, not a test
   suite.
2. **A test per behavior and edge, composed from a story.**
   `const { Connected } = composeStories(stories)`, then render, interact
   (`user-event`), and assert what the user sees or a callback spy. Cover
   every interaction and edge case (empty lists, missing optional props,
   malformed/boundary data).
3. **Every story smoke-renders** in `tests/unit/stories.test.tsx` — the
   all-stories loop fails the gate on any story that crashes at render, even
   before it has a behavioral test. (`pnpm build-storybook` additionally
   fails CI on stories that don't compile.)
4. **Tame combinatorics.** Vary one input at a time; add only the
   combinations that are meaningful in the product — never a cross-product.
5. **Realistic data only.** Plausible domain values in every test, story,
   and fixture — no foo/bar, no lorem ipsum, no impossible states.
6. **Accessible queries only.** `getByRole`, `getByLabelText`, `getByText` —
   the same way a user (and the e2e suite) finds things. Reaching for a test
   id is a hint the component has an accessibility gap; fix the component.
   The Storybook a11y addon (`.storybook/main.ts`) runs axe against every
   story, so the catalog surfaces violations alongside the visual states.
7. **No implementation-detail assertions.** No snapshot-everything, no class
   name or internal-state assertions — behavior only, so refactors stay
   cheap.
8. **Self-contained: leave no trace.** Any shared state a story or test
   touches (globals like `window.fetch`, timers, env vars) is set up on
   mount and restored on unmount — a story must render correctly in any
   order, and a stub must never outlive its story, in the Storybook UI or
   between tests. `BackendStatus.stories.tsx` shows the pattern (stub via
   effect with cleanup), and its tests pin the restore behavior.

Testing patterns by component shape (in every case, the setup lives in the
story and the test composes it):

- **Presentational**: story sets args; test renders and asserts DOM.
- **Controlled**: story sets args (callbacks as spies where useful); test
  simulates with `user-event` and asserts the spy and the visible result.
- **Time-dependent**: fake timers in the test around the composed story; no
  real waiting.
- **Connected** (the rare exception, e.g. `BackendStatus`): the story's
  decorators provide the `QueryClientProvider` and stub `fetch` — never mock
  the hook module itself.

## The living exemplars

- **`src/components/ui/Badge/` — the default shape.** Presentational and
  domain-blind: args-only stories (one per tone), thin composed tests that
  assert the label renders, no providers, no stubs. This is the shape the
  vast majority of components should copy.
- **`src/components/BackendStatus/` — the connected exception.** Stories own
  all state setup via decorators (provider + fetch stubs, with a story per
  distinct failure cause — unreachable, unreachable behind the dev proxy
  (a gateway 502, since the proxy answers even when the backend is down),
  HTTP error, contract drift — each rendering its own guidance); tests
  compose those stories with one test per behavior. Copy this shape only for a
  component blessed as a connected exception in the dependency-cruiser
  config.
