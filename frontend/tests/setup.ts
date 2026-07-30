import "@testing-library/jest-dom/vitest";
import { setProjectAnnotations } from "@storybook/react-vite";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

import * as projectAnnotations from "../.storybook/preview";

// Portable stories: apply .storybook/preview.ts (global decorators, params)
// so composed stories render exactly what the Storybook canvas renders.
const project = setProjectAnnotations([projectAnnotations]);
beforeAll(project.beforeAll);

// Vitest runs without injected globals, so Testing Library can't register its
// own auto-cleanup — unmount between tests here instead.
afterEach(() => {
  cleanup();
});
