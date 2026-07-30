import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

// Single-screen furniture stays in its route (docs/components.md) — this is
// markup, not a component. Restyle it with your product's voice.
function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-5xl font-bold tracking-tight">Page not found</h1>
      <p className="text-app-ink/50">
        The address doesn't match any screen in this app.
      </p>
      <Link to="/" className="text-app-accent underline underline-offset-4">
        Back to home
      </Link>
    </main>
  );
}

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-app-bg text-app-ink">
      <Outlet />
    </div>
  ),
  notFoundComponent: NotFound,
});
