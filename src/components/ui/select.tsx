import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const NativeSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full appearance-none rounded-sm border border-border bg-surface bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-8 text-sm text-fg",
      "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22none%22 stroke=%22%238c8f94%22 stroke-width=%221.6%22><path d=%22M2 4l4 4 4-4%22/></svg>')]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
NativeSelect.displayName = "NativeSelect";
