import { createFileRoute } from "@tanstack/react-router";

import { BackendStatus } from "@/components/BackendStatus";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// Routes are thin screens: compose components, no business logic.
function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-5xl font-bold tracking-tight">Hello, World</h1>
      <p className="text-app-ink/50">Template starter — replace this screen.</p>
      <BackendStatus />
    </main>
  );
}
