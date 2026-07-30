import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  // addon-docs powers the autodocs pages: generated per-component reference
  // docs derived from the stories themselves (CLAUDE.md: reference docs are
  // generated from code so they can't drift). addon-a11y runs axe against
  // every story — the same accessibility the test suite leans on for its
  // locators (getByRole/getByLabelText), surfaced in the catalog.
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
};

export default config;
