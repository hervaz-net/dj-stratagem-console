import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  Building2,
  Columns3,
  HardHat,
  LayoutDashboard,
  LogOut,
  Menu,
  Scale,
  Settings,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Wordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/lib/auth/client";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/companies", label: "Companies", icon: Building2 },
  { to: "/admin/projects", label: "Projects", icon: HardHat },
  { to: "/admin/bids", label: "Bids", icon: Scale },
  { to: "/admin/pipeline", label: "Pipeline", icon: Columns3 },
  { to: "/admin/supply", label: "Supply", icon: Boxes },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, to: string, exact?: boolean) {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="grid gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.to, "exact" in item && item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex h-10 items-center gap-2.5 rounded-sm px-3 text-sm transition-colors duration-150",
              active
                ? "bg-surface-2 text-fg"
                : "text-muted hover:bg-surface-2/70 hover:text-fg",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserChip() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <Skeleton className="h-10 w-full" />;
  if (!user) return null;
  const label = user.displayName ?? user.primaryEmail ?? "Account";
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border bg-surface-2/50 p-2">
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt=""
          className="size-8 rounded-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-surface-2 text-xs font-medium">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-fg">{label}</div>
        <div className="truncate text-xs text-subtle">{user.primaryEmail}</div>
      </div>
      <button
        type="button"
        onClick={() => void signOut("/")}
        className="grid size-9 place-items-center rounded-sm text-muted hover:bg-surface hover:text-fg"
        aria-label="Sign out"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

function Sidebar({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5 pb-6">
        <Link to="/" onClick={onNavigate}>
          <Wordmark />
        </Link>
        <p className="mt-4 text-xs tracking-[0.18em] text-subtle uppercase">
          Construction OS
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        <NavLinks pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="grid gap-3 p-3">
        <UserChip />
        <p className="px-1 pb-1 text-[10px] tracking-wider text-subtle uppercase">
          Los Angeles · Console
        </p>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children?: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-dvh bg-bg">
        <aside className="hidden w-60 shrink-0 border-r border-border lg:block">
          <div className="p-5">
            <Wordmark />
            <p className="mt-6 text-xs tracking-[0.18em] text-subtle uppercase">
              Loading console
            </p>
            <div className="mt-8 grid gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </aside>
        <main className="flex-1 p-6">
          <p className="font-display text-2xl font-semibold tracking-tight">Operations</p>
          <p className="mt-2 text-sm text-muted">Loading the D&J Stratagem workspace…</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) return <RedirectToSignIn />;

  return (
    <div className="flex min-h-dvh bg-bg">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-border bg-surface lg:block">
        <Sidebar pathname={pathname} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur-sm lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <Wordmark compact />
        </header>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-bg/70"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-surface">
              <button
                type="button"
                className="absolute top-3 right-3 grid size-9 place-items-center rounded-sm text-muted hover:bg-surface-2 hover:text-fg"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
              <Sidebar pathname={pathname} onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
