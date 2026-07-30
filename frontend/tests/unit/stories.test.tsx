/**
 * Smoke-renders every story in the app. A story that crashes on render fails
 * the gate even before it has a dedicated behavioral test — this is the
 * render-coverage floor beneath the portable-stories pattern
 * (docs/components.md).
 */
import { composeStories } from "@storybook/react-vite";
import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";

// Same pattern as .storybook/main.ts: anything the catalog shows, this floor
// covers — a .stories.ts file must not escape it.
const storyModules = import.meta.glob("../../src/**/*.stories.{ts,tsx}", {
  eager: true,
});

describe("every story renders", () => {
  for (const [path, mod] of Object.entries(storyModules)) {
    // Glob modules are untyped; composeStories validates the CSF shape at
    // runtime, and every composed story is a renderable component.
    const composed = composeStories(
      mod as Parameters<typeof composeStories>[0],
    );
    for (const [name, Story] of Object.entries(composed) as [
      string,
      ComponentType,
    ][]) {
      it(`${path} — ${name}`, () => {
        const { container } = render(<Story />);
        expect(container.firstChild).not.toBeNull();
      });
    }
  }
});
