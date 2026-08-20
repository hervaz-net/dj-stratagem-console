import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowUpRight, Building2, Gavel, Package, Wallet } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { ProjectStatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatUsd } from "@/lib/format";
import { getDashboard } from "@/lib/server/admin";
import type { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({ component: Overview });

function ChartFrame({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <Skeleton className="h-56 w-full" />;
  return <div className="h-56 w-full">{children}</div>;
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  open: "Open",
  bidding: "Bidding",
  awarded: "Awarded",
  closed: "Closed",
};

function Overview() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });

  if (q.isLoading || !q.data) {
    return (
      <div>
        <PageHeader
          kicker="Overview"
          title="Operations"
          description="Pipeline, bids, and companies across the D&J Stratagem workspace."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, pipeline, trades, weekly, activities, deadlines } = q.data;
  const pipelineChart = (["open", "bidding", "awarded", "closed"] as ProjectStatus[]).map(
    (status) => {
      const row = pipeline.find((p) => p.status === status);
      return {
        name: STATUS_LABEL[status],
        value: row?.value_usd ?? 0,
        count: row?.count ?? 0,
      };
    },
  );
  const weeklyChart = weekly.map((w) => ({
    name: format(new Date(`${w.week}T00:00:00`), "MMM d"),
    bids: w.count,
    value: w.value_usd,
  }));
  const tradeMax = Math.max(...trades.map((t) => t.count), 1);

  const tiles = [
    {
      label: "Pipeline",
      value: formatUsd(stats.pipeline_usd),
      hint: `${stats.open_projects} live projects`,
      icon: Wallet,
      to: "/admin/pipeline",
    },
    {
      label: "Companies",
      value: String(stats.companies),
      hint: `${stats.pending_companies} awaiting verify`,
      icon: Building2,
      to: "/admin/companies",
    },
    {
      label: "Open bids",
      value: String(stats.bids_open),
      hint: `${stats.award_rate}% award rate`,
      icon: Gavel,
      to: "/admin/bids",
    },
    {
      label: "Supply in flight",
      value: formatUsd(stats.supply_usd),
      hint: `${stats.supply_open} active orders`,
      icon: Package,
      to: "/admin/supply",
    },
  ];

  return (
    <div>
      <PageHeader
        kicker="Overview"
        title="Operations"
        description="Matched opportunities, bid scoring, and supply — the construction growth OS in one console."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="group">
            <Card className="h-full transition-colors duration-150 hover:border-border-strong">
              <div className="flex items-start justify-between">
                <p className="text-xs tracking-[0.16em] text-subtle uppercase">{t.label}</p>
                <t.icon className="size-4 text-subtle" strokeWidth={1.75} />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold tabular-nums tracking-tight">
                {t.value}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                {t.hint}
                <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-4">
            <h2 className="font-display text-base font-medium">Pipeline value</h2>
            <p className="text-sm text-muted">Awarded work versus live bid volume.</p>
          </div>
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineChart} barSize={28}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => formatUsd(v)}
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-surface-2)" }}
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    color: "var(--color-fg)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [formatUsd(Number(value ?? 0)), "Value"]}
                />
                <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-display text-base font-medium">Trade mix</h2>
            <p className="text-sm text-muted">Companies on the roster.</p>
          </div>
          <ul className="grid gap-3">
            {trades.slice(0, 7).map((t) => (
              <li key={t.trade}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-fg">{t.trade}</span>
                  <span className="tabular-nums text-muted">{t.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.round((t.count / tradeMax) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-4">
            <h2 className="font-display text-base font-medium">Upcoming deadlines</h2>
            <p className="text-sm text-muted">Open and bidding work, nearest first.</p>
          </div>
          <ul className="divide-y divide-border">
            {deadlines.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.city} · {p.trade_focus}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm tabular-nums">{formatUsd(p.value_usd)}</span>
                  <span className={cn("text-xs tabular-nums text-muted")}>
                    {formatDate(p.deadline)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-display text-base font-medium">Activity</h2>
            <p className="text-sm text-muted">Latest movements in the workspace.</p>
          </div>
          <ul className="grid gap-3">
            {activities.map((a) => (
              <li key={a.id} className="border-l border-border pl-3">
                <p className="text-sm text-fg">{a.title}</p>
                {a.detail ? <p className="text-xs text-muted">{a.detail}</p> : null}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {weeklyChart.length > 0 ? (
        <Card className="mt-4">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-base font-medium">Bid intake</h2>
              <p className="text-sm text-muted">Submissions by week.</p>
            </div>
            <ProjectStatusBadge status="bidding" />
          </div>
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart} barSize={18}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-surface-2)" }}
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="bids" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Card>
      ) : null}
    </div>
  );
}
