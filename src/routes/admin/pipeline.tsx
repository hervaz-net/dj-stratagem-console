import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { ProjectStatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatUsd } from "@/lib/format";
import { listProjects, setProjectStatus } from "@/lib/server/admin";
import type { Project, ProjectStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/pipeline")({ component: PipelinePage });

const COLUMNS: { status: ProjectStatus; title: string; copy: string }[] = [
  { status: "open", title: "Open", copy: "Matched, not yet bidding" },
  { status: "bidding", title: "Bidding", copy: "Live packages" },
  { status: "awarded", title: "Awarded", copy: "Won work" },
  { status: "closed", title: "Closed", copy: "Invoiced or archived" },
];

function PipelinePage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["projects"], queryFn: () => listProjects() });

  const move = useMutation({
    mutationFn: (data: { id: number; status: ProjectStatus }) => setProjectStatus({ data }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["projects"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const projects = q.data ?? [];

  return (
    <div>
      <PageHeader
        kicker="Flow"
        title="Pipeline"
        description="Opportunity through award. Move a project when the bid status changes."
      />

      {q.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const items = projects.filter((p) => p.status === col.status);
            const sum = items.reduce((n, p) => n + p.value_usd, 0);
            return (
              <section key={col.status} className="flex min-h-80 flex-col rounded-lg border border-border bg-surface p-3">
                <header className="mb-3 flex items-start justify-between gap-2 px-1">
                  <div>
                    <h2 className="font-display text-sm font-medium">{col.title}</h2>
                    <p className="text-xs text-subtle">{col.copy}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs tabular-nums text-fg">{items.length}</p>
                    <p className="text-xs tabular-nums text-muted">{formatUsd(sum)}</p>
                  </div>
                </header>
                <ul className="grid flex-1 content-start gap-2">
                  {items.length === 0 ? (
                    <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-subtle">
                      Empty stage
                    </li>
                  ) : (
                    items.map((p) => <PipelineCard key={p.id} project={p} onMove={move.mutate} />)
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PipelineCard({
  project,
  onMove,
}: {
  project: Project;
  onMove: (data: { id: number; status: ProjectStatus }) => void;
}) {
  return (
    <li>
      <Card className="rounded-md p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{project.name}</p>
          <ProjectStatusBadge status={project.status} />
        </div>
        <p className="mt-1 text-xs text-muted">
          {project.city} · {project.trade_focus}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="tabular-nums text-fg">{formatUsd(project.value_usd)}</span>
          <span className="tabular-nums text-muted">{formatDate(project.deadline)}</span>
        </div>
        <p className="mt-1 text-xs text-subtle">{project.bid_count} bids</p>
        <NativeSelect
          className="mt-3 h-9"
          value={project.status}
          onChange={(e) =>
            onMove({ id: project.id, status: e.target.value as ProjectStatus })
          }
        >
          <option value="open">Move to open</option>
          <option value="bidding">Move to bidding</option>
          <option value="awarded">Move to awarded</option>
          <option value="closed">Move to closed</option>
        </NativeSelect>
      </Card>
    </li>
  );
}
