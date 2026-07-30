import { composeStories } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import * as stories from "./Badge.stories";

const composed = composeStories(stories);

// Badge is purely presentational, so its behavioral surface is small and the
// tests are deliberately thin: it renders its label, for every tone. Tone
// styling is a visual concern — that's what the stories picture; asserting
// class names here would be an implementation-detail assertion
// (docs/components.md rule 7).
describe("Badge", () => {
  it("renders its label with the default tone", () => {
    render(<composed.Draft />);
    expect(screen.getByText("Draft")).toBeVisible();
  });

  it("renders the label for every tone variant", () => {
    for (const Story of Object.values(composed)) {
      const { unmount } = render(<Story />);
      expect(screen.getByText(String(Story.args.children))).toBeVisible();
      unmount();
    }
  });
});
