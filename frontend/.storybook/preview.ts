import type { Preview } from "@storybook/react-vite";

import "../src/styles/index.css";

const preview: Preview = {
  // Every component gets a generated autodocs page from its stories —
  // reference docs derived from code (CLAUDE.md), never handwritten.
  tags: ["autodocs"],
};

export default preview;
