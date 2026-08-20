import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { BidStatusBadge } from "@/components/status-badge";
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
import { formatUsd, formatUsdFull } from "@/lib/format";
import {
  awardBid,
  listBids,
  listCompanies,
  listProjects,
  setBidStatus,
  upsertBid,
} from "@/lib/server/admin";
import type { BidStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/bids")({ component: BidsPage });

function scoreTone(n: number) {
  if (n >= 90) return "text-ok";
  if (n >= 75) return "text-warn";
  return "text-muted";
}

function BidsPage() {
  const qc = useQueryClient();
  const bidsQ = useQuery({ queryKey: ["bids"], queryFn: () => listBids() });
  const projectsQ = useQuery({ queryKey: ["projects"], queryFn: () => listProjects() });
  const companiesQ = useQuery({ queryKey: ["companies"], queryFn: () => listCompanies() });
  const [projectId, setProjectId] = useState<"all" | number>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    project_id: 0,
    company_id: 0,
    amount_usd: 500000,
    schedule_weeks: 16,
    past_score: 80,
    price_score: 80,
    overall_score: 80,
    status: "submitted" as BidStatus,
  });

  const save = useMutation({
    mutationFn: () => upsertBid({ data: form }),
    onSuccess: () => {
      toast.success("Bid recorded");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["bids"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
      void qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const award = useMutation({
    mutationFn: (id: number) => awardBid({ data: { id } }),
    onSuccess: () => {
      toast.success("Bid awarded");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const shortlist = useMutation({
    mutationFn: (id: number) => setBidStatus({ data: { id, status: "shortlisted" } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bids"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const rows = useMemo(() => {
    const list = bidsQ.data ?? [];
    if (projectId === "all") return list;
    return list.filter((b) => b.project_id === projectId);
  }, [bidsQ.data, projectId]);

  const projects = projectsQ.data ?? [];
  const companies = companiesQ.data ?? [];

  return (
    <div>
      <PageHeader
        kicker="Comparison"
        title="Bids"
        description="Scored on price, schedule, and past performance — award with the full picture."
        action={
          <Button
            onClick={() => {
              setForm((f) => ({
                ...f,
                project_id: projects[0]?.id ?? 0,
                company_id: companies[0]?.id ?? 0,
              }));
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Record bid
          </Button>
        }
      />

      <div className="mb-4">
        <NativeSelect
          value={projectId === "all" ? "all" : String(projectId)}
          onChange={(e) =>
            setProjectId(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="sm:max-w-sm"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      {bidsQ.isLoading ? (
        <Skeleton className="h-80 rounded-lg" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-surface-2 text-xs tracking-wider text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Weeks</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Past</th>
                <th className="px-4 py-3 font-medium">Overall</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted">
                    No bids yet for this filter.
                  </td>
                </tr>
              ) : (
                rows.map((b) => (
                  <tr key={b.id} className="border-t border-border hover:bg-surface-2/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.company_name}</div>
                      <div className="text-xs text-muted">{b.company_trade}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{b.project_name}</td>
                    <td className="px-4 py-3 tabular-nums">{formatUsdFull(b.amount_usd)}</td>
                    <td className="px-4 py-3 tabular-nums text-muted">{b.schedule_weeks}</td>
                    <td className={cn("px-4 py-3 tabular-nums", scoreTone(b.price_score))}>
                      {b.price_score}
                    </td>
                    <td className={cn("px-4 py-3 tabular-nums", scoreTone(b.past_score))}>
                      {b.past_score}
                    </td>
                    <td className={cn("px-4 py-3 tabular-nums font-medium", scoreTone(b.overall_score))}>
                      {b.overall_score}
                    </td>
                    <td className="px-4 py-3">
                      <BidStatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status === "submitted" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => shortlist.mutate(b.id)}
                        >
                          Shortlist
                        </Button>
                      ) : b.status === "shortlisted" ? (
                        <Button size="sm" onClick={() => award.mutate(b.id)}>
                          Award
                        </Button>
                      ) : b.status === "awarded" ? (
                        <span className="text-xs text-ok">Awarded</span>
                      ) : (
                        <span className="text-xs text-subtle">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record a bid</DialogTitle>
            <DialogDescription>
              Side-by-side scoring — price, schedule, and past work.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.project_id || !form.company_id) {
                toast.error("Choose a project and company");
                return;
              }
              save.mutate();
            }}
          >
            <Field label="Project">
              <NativeSelect
                value={form.project_id || ""}
                onChange={(e) => setForm({ ...form, project_id: Number(e.target.value) })}
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {formatUsd(p.value_usd)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Company">
              <NativeSelect
                value={form.company_id || ""}
                onChange={(e) => setForm({ ...form, company_id: Number(e.target.value) })}
              >
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.trade}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Amount (USD)">
                <Input
                  type="number"
                  min={0}
                  value={form.amount_usd}
                  onChange={(e) => setForm({ ...form, amount_usd: Number(e.target.value) })}
                />
              </Field>
              <Field label="Schedule (weeks)">
                <Input
                  type="number"
                  min={1}
                  value={form.schedule_weeks}
                  onChange={(e) =>
                    setForm({ ...form, schedule_weeks: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Price score">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.price_score}
                  onChange={(e) => setForm({ ...form, price_score: Number(e.target.value) })}
                />
              </Field>
              <Field label="Past score">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.past_score}
                  onChange={(e) => setForm({ ...form, past_score: Number(e.target.value) })}
                />
              </Field>
              <Field label="Overall">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.overall_score}
                  onChange={(e) =>
                    setForm({ ...form, overall_score: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save bid"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
