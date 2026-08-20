import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getSettings, saveSettings } from "@/lib/server/admin";
import type { WorkspaceSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user } = useCurrentUserState();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["settings"], queryFn: () => getSettings() });
  const [form, setForm] = useState<WorkspaceSettings | null>(null);

  useEffect(() => {
    if (q.data) setForm(q.data);
  }, [q.data]);

  const save = useMutation({
    mutationFn: (data: WorkspaceSettings) => saveSettings({ data }),
    onSuccess: () => {
      toast.success("Workspace saved");
      void qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl">
      <PageHeader
        kicker="Workspace"
        title="Settings"
        description="Organization profile for D&J Stratagem operations. Changes apply to this signed-in workspace."
      />

      {q.isLoading || !form ? (
        <Skeleton className="h-72 rounded-lg" />
      ) : (
        <Card>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(form);
            }}
          >
            <Field label="Organization">
              <Input
                required
                value={form.org_name}
                onChange={(e) => setForm({ ...form, org_name: e.target.value })}
              />
            </Field>
            <Field label="Contact email">
              <Input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="City">
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save workspace"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-4">
        <h2 className="font-display text-base font-medium">Signed in</h2>
        <p className="mt-1 text-sm text-muted">
          {user?.displayName ?? "Operator"} · {user?.primaryEmail ?? "No email on file"}
        </p>
        <Button
          className="mt-4"
          variant="outline"
          type="button"
          onClick={() => void signOut("/")}
        >
          Sign out
        </Button>
      </Card>
    </div>
  );
}
