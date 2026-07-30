import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect } from "react";

import { BackendStatus } from "./BackendStatus";

// Stories are the single source of state setup (docs/components.md): the
// unit tests compose these via `composeStories`, so every tested state is
// visible in the catalog. Connected-component stories stub fetch per story.
// Each story gets a fresh client; `retry: false` overrides the app default
// (main.tsx) so error states render immediately instead of after a backoff.
const withQueryClient: Decorator = (Story) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    <Story />
  </QueryClientProvider>
);

// Self-contained stubbing (CLAUDE.md: tests never leak global state): the
// stub installs on mount and restores the real fetch on unmount, so it can't
// outlive its story — in the Storybook UI or between tests. Rendered before
// <Story /> so its layout effect runs ahead of the query's first fetch.
function stubFetch(impl: () => Promise<Response>): Decorator {
  const StubFetch = () => {
    useLayoutEffect(() => {
      const original = window.fetch;
      window.fetch = (() => impl()) as typeof fetch;
      return () => {
        window.fetch = original;
      };
    }, []);
    return null;
  };
  return (Story) => (
    <>
      <StubFetch />
      <Story />
    </>
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const meta = {
  title: "components/BackendStatus",
  component: BackendStatus,
  decorators: [withQueryClient],
} satisfies Meta<typeof BackendStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  decorators: [
    stubFetch(async () =>
      jsonResponse({ status: "ok", message: "Hello from the backend" }),
    ),
  ],
};

export const Checking: Story = {
  decorators: [stubFetch(() => new Promise<Response>(() => {}))],
};

export const Offline: Story = {
  decorators: [
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    }),
  ],
};

// The backend answered but with an error status — a different failure than
// being unreachable, so the guidance names the status instead of telling
// the user to start a server that is already running.
export const ServerError: Story = {
  decorators: [stubFetch(async () => jsonResponse({ detail: "boom" }, 500))],
};

// A dead backend behind the dev proxy: the browser never sees a network
// failure because Vite answers with a gateway status (502) itself — the
// common "only ran pnpm dev" case. The guidance must say to start the
// backend, not to check the logs of a server that isn't running.
export const ProxyUnreachable: Story = {
  decorators: [
    stubFetch(async () => jsonResponse({ error: "connection refused" }, 502)),
  ],
};

// A payload that violates the schema must present as an error, never as
// data — and it names contract drift as the cause, not the backend being
// down, so the guidance is actionable.
export const MalformedPayload: Story = {
  decorators: [
    stubFetch(async () => jsonResponse({ status: "down", message: "?" })),
  ],
};
