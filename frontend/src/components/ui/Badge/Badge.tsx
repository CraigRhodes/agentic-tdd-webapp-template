import type { ReactNode } from "react";

// The template's exemplar of the DEFAULT component shape: presentational,
// domain-blind, props in → DOM out (docs/components.md). BackendStatus is
// the exemplar for the rare connected exception.
const toneClasses = {
  neutral: "border-app-ink/25 text-app-ink/70",
  accent: "border-app-accent/40 text-app-accent",
  ok: "border-app-ok/40 text-app-ok",
  danger: "border-app-danger/40 text-app-danger",
} as const;

export type BadgeTone = keyof typeof toneClasses;

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
