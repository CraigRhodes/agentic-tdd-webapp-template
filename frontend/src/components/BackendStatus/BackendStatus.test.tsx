import { composeStories } from "@storybook/react-vite";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import * as stories from "./BackendStatus.stories";

// Portable stories: each test starts from a story, so the setup for every
// tested state is pictured in the Storybook catalog (docs/components.md).
// Assertions live here, never in the stories.
const {
  Checking,
  Connected,
  Offline,
  ServerError,
  ProxyUnreachable,
  MalformedPayload,
} = composeStories(stories);

describe("BackendStatus", () => {
  it("shows a pending state while the health check is in flight", () => {
    render(<Checking />);
    expect(screen.getByRole("status")).toHaveTextContent("Checking backend…");
  });

  it("shows the backend greeting when the health check succeeds", async () => {
    render(<Connected />);
    expect(
      await screen.findByText("Hello from the backend (ok)"),
    ).toBeVisible();
  });

  it("shows offline guidance when the request fails", async () => {
    render(<Offline />);
    expect(await screen.findByText(/Backend offline/)).toBeVisible();
  });

  // A non-2xx response means the backend answered — telling the user to
  // start it would be wrong guidance. The status code is the one actionable
  // detail the response carries.
  it("reports the status code, not offline guidance, on a non-2xx response", async () => {
    render(<ServerError />);
    expect(await screen.findByText(/Backend error \(HTTP 500\)/)).toBeVisible();
    expect(screen.queryByText(/Backend offline/)).not.toBeInTheDocument();
  });

  // Regression guard: behind the dev proxy a dead backend surfaces as a
  // gateway status (Vite answers 502 itself), never as a network failure —
  // so gateway statuses must get start-the-backend guidance, not the
  // check-its-logs message for a server that answered.
  it("gives start-the-backend guidance, not check-its-logs, on a gateway status", async () => {
    render(<ProxyUnreachable />);
    expect(
      await screen.findByText(/Backend unreachable \(HTTP 502\)/),
    ).toBeVisible();
    expect(
      screen.queryByText(/it's running but the request failed/),
    ).not.toBeInTheDocument();
  });

  // Regression guard for the self-containment rule (CLAUDE.md): the story's
  // fetch stub must never outlive its story.
  it("restores the real fetch when the story unmounts", () => {
    const realFetch = window.fetch;
    const { unmount } = render(<Checking />);
    expect(window.fetch).not.toBe(realFetch);
    unmount();
    expect(window.fetch).toBe(realFetch);
  });

  // Contract drift is not the same failure as a dead backend — telling the
  // user to start the server would be wrong guidance here.
  it("reports contract drift, not offline guidance, for a schema-violating payload", async () => {
    render(<MalformedPayload />);
    expect(
      await screen.findByText(/didn't match the expected contract/),
    ).toBeVisible();
    expect(screen.queryByText(/Backend offline/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(ok\)/)).not.toBeInTheDocument();
  });
});
