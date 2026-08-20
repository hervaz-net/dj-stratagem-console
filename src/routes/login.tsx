import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { Wordmark } from "@/components/logo";
import { SignInButtons } from "@/components/sign-in-buttons";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (!isPending && user) return <Navigate to="/admin" />;

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg p-6">
      <div className="pointer-events-none absolute inset-0 grid-construct opacity-60" />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 sm:p-8">
        <Wordmark />
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
          Sign in to operations
        </h1>
        <p className="mt-2 text-sm text-muted">
          Staff access for bidding, companies, pipeline, and the supply exchange.
        </p>
        <div className="mt-6">
          <SignInButtons />
        </div>
        <p className="mt-6 text-center text-xs text-subtle">
          <Link to="/" className="hover:text-fg">
            Back to D&J Stratagem
          </Link>
        </p>
      </div>
    </main>
  );
}
