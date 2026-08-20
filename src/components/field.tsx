import { type ReactNode } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
