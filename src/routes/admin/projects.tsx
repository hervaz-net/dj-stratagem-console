import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { ProjectStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatUsd } from "@/lib/format";
import { listProjects, upsertProject } from "@/lib/server/admin";
import type { Project, ProjectKind, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/projects")({ component: ProjectsPage });

const emptyForm = {
  name: "",
  client: "",
  city: "Los Angeles",
  kind: "commercial" as ProjectKind,
  value_usd: 1_000_000,
  status: "open" as ProjectStatus,
  trade_focus: "",
  deadline: "2026-09-30",
  match_score: 80,
  description: "",
};

type FormState = typeof emptyForm & { id?: number };

function ProjectsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["projects"], queryFn: () => listProjects() });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const save = useMutation({
    mutationFn: (data: FormState) => upsertProject({ data }),
    onSuccess: () => {
      toast.success("Project saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["projects"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const list = q.data ?? [];
    const qn = query.trim().toLowerCase();
    return list.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!qn) return true;
      return `${p.name} ${p.client} ${p.city} ${p.trade_focus}`.toLowerCase().includes(qn);
    });
  }, [q.data, query, status]);

  function edit(p: Project) {
    setForm({
      id: p.id,
      name: p.name,
      client: p.client,
      city: p.city,
      kind: p.kind,
      value_usd: p.value_usd,
      status: p.status,
      trade_focus: p.trade_focus,
      deadline: p.deadline.slice(0, 10),
      match_score: p.match_score,
      description: p.description,
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        kicker="Work"
        title="Projects"
        description="Matched construction opportunities — scored against trade, service area, and past work."
        action={
          <Button
            onClick={() => {
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            New project
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search project, client, city"
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "open", "bidding", "awarded", "closed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "h-9 rounded-full px-3 text-xs font-medium capitalize",
                status === s ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted",
              )}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {q.isLoading ? (
        <Skeleton className="h-80 rounded-lg" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-surface-2 text-xs tracking-wider text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Kind</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Match</th>
                <th className="px-4 py-3 font-medium">Bids</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted">
                    No projects match those filters.
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-surface-2/40">
                    <td className="px-4 py-3">
                      <button type="button" className="text-left" onClick={() => edit(p)}>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted">
                          {p.client} · {p.city} · {p.trade_focus}
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">{p.kind}</td>
                    <td className="px-4 py-3 tabular-nums">{formatUsd(p.value_usd)}</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{formatDate(p.deadline)}</td>
                    <td className="px-4 py-3 tabular-nums font-medium">{p.match_score}%</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{p.bid_count}</td>
                    <td className="px-4 py-3">
                      <ProjectStatusBadge status={p.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit project" : "New project"}</DialogTitle>
            <DialogDescription>
              Opportunities are scored against company profiles before they hit the firehose.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(form);
            }}
          >
            <Field label="Name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Client">
                <Input
                  required
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                />
              </Field>
              <Field label="City">
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Kind">
                <NativeSelect
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value as ProjectKind })}
                >
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                  <option value="industrial">Industrial</option>
                  <option value="education">Education</option>
                  <option value="infrastructure">Infrastructure</option>
                </NativeSelect>
              </Field>
              <Field label="Trade focus">
                <Input
                  required
                  value={form.trade_focus}
                  onChange={(e) => setForm({ ...form, trade_focus: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Value (USD)">
                <Input
                  type="number"
                  min={0}
                  value={form.value_usd}
                  onChange={(e) =>
                    setForm({ ...form, value_usd: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Deadline">
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </Field>
              <Field label="Match">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.match_score}
                  onChange={(e) =>
                    setForm({ ...form, match_score: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <Field label="Status">
              <NativeSelect
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ProjectStatus })
                }
              >
                <option value="open">Open</option>
                <option value="bidding">Bidding</option>
                <option value="awarded">Awarded</option>
                <option value="closed">Closed</option>
              </NativeSelect>
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
