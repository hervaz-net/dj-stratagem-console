import { type ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {kicker ? (
          <p className="mb-1 text-xs font-medium tracking-[0.2em] text-subtle uppercase">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
