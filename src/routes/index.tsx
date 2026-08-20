import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { SignInButtons } from "@/components/sign-in-buttons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <main className="min-h-dvh bg-bg p-6">
        <Wordmark />
        <p className="mt-16 font-display text-2xl font-medium">D&J Stratagem</p>
        <p className="mt-2 text-sm text-muted">Loading operations console…</p>
        <Skeleton className="mt-8 h-12 w-80" />
        <Skeleton className="mt-4 h-20 w-full max-w-xl" />
      </main>
    );
  }

  if (user) return <Navigate to="/admin" />;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg text-fg">
      <div className="pointer-events-none absolute inset-0 grid-construct opacity-50" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Wordmark />
        <Button asChild variant="outline" size="sm">
          <Link to="/login">Sign in</Link>
        </Button>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-5 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-16">
        <section>
          <p className="text-xs font-medium tracking-[0.22em] text-subtle uppercase">
            D&J Stratagem, Inc. · Los Angeles
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Operations console for construction growth.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            The operating system where contractors win work, market the business,
            manage relationships, and grow revenue — bidding, companies, pipeline,
            and supply in one place.
          </p>
          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {[
              { k: "Suites", v: "Bidding · CRM · Supply" },
              { k: "Built for", v: "GCs, subs, suppliers" },
              { k: "Base", v: "Los Angeles, CA" },
            ].map((item) => (
              <div
                key={item.k}
                className="rounded-md border border-border bg-surface/80 p-3"
              >
                <dt className="text-xs tracking-[0.16em] text-subtle uppercase">
                  {item.k}
                </dt>
                <dd className="mt-1 text-xs text-fg">{item.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted">
            Staff sign-in required
            <ArrowRight className="size-3.5" />
            live workspace after auth
          </p>
        </section>

        <aside className="rounded-xl border border-border bg-surface p-6 sm:p-8">
          <p className="text-xs tracking-[0.18em] text-subtle uppercase">Staff access</p>
          <h2 className="mt-2 font-display text-xl font-medium">Open the console</h2>
          <p className="mt-2 text-sm text-muted">
            Sign in to manage companies, score bids, move pipeline, and run the
            supply exchange.
          </p>
          <div className="mt-6">
            <SignInButtons />
          </div>
          <p className="mt-5 text-xs text-subtle">
            hello@djstratageminc.com · (562) 375-7470
          </p>
        </aside>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl border-t border-border px-5 py-6 text-xs text-subtle">
        D&J Stratagem, Inc. · 506 S Spring St, Los Angeles · Win more projects.
      </footer>
    </div>
  );
}
