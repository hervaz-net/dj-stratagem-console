import { useState } from "react";
import { toast } from "sonner";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M21.35 11.1H12.2v2.9h5.25c-.23 1.5-1.77 4.4-5.25 4.4-3.16 0-5.74-2.6-5.74-5.8s2.58-5.8 5.74-5.8c1.8 0 3 .76 3.69 1.42l2.5-2.4C16.9 4.3 14.75 3.4 12.2 3.4 7.3 3.4 3.4 7.3 3.4 12.2s3.9 8.8 8.8 8.8c5.08 0 8.43-3.57 8.43-8.6 0-.58-.06-1-.13-1.3z"
      />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M13.4 10.7 19.6 3.5h-1.7l-5.3 6.2L8.4 3.5H3.7l6.6 9.6-6.6 7.4h1.7l5.7-6.6 4.6 6.6h4.7l-6.99-9.8zm-2 2.3-.66-.95-5.27-7.55h2.27l4.25 6.1.66.95 5.52 7.91h-2.27l-4.5-6.46z"
      />
    </svg>
  );
}

export function SignInButtons({ callbackURL = "/admin" }: { callbackURL?: string }) {
  const [busy, setBusy] = useState<string | null>(null);

  if (!authEnabled) {
    return <p className="text-sm text-muted">Sign-in is disabled.</p>;
  }

  return (
    <div className="grid gap-2">
      {GROK_PROVIDERS.map((p) => (
        <Button
          key={p.providerId}
          type="button"
          variant="secondary"
          className="h-11 w-full justify-center"
          disabled={busy !== null}
          onClick={() => {
            setBusy(p.providerId);
            void signIn(p.providerId, { callbackURL }).catch((err: unknown) => {
              toast.error(err instanceof Error ? err.message : "Sign-in failed");
              setBusy(null);
            });
          }}
        >
          {p.label === "Google" ? <GoogleMark /> : <XMark />}
          {busy === p.providerId ? "Connecting…" : `Continue with ${p.label}`}
        </Button>
      ))}
    </div>
  );
}
