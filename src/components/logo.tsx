import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="7" className="fill-surface-2" />
      <rect x="6" y="7" width="20" height="3.2" className="fill-accent" />
      <rect x="6" y="21.8" width="20" height="3.2" className="fill-accent" />
      <rect x="8.2" y="7" width="3.4" height="18" className="fill-muted" />
      <rect x="20.4" y="7" width="3.4" height="18" className="fill-accent" />
    </svg>
  );
}

export function Wordmark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Mark />
      <div className="min-w-0 leading-tight">
        <div className="font-display text-[13px] font-semibold tracking-[0.14em] text-fg uppercase">
          D&J Stratagem
        </div>
        {!compact && (
          <div className="text-[10px] tracking-[0.18em] text-subtle uppercase">
            Operations
          </div>
        )}
      </div>
    </div>
  );
}
