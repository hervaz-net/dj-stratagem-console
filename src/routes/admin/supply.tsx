import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { SupplyStatusBadge } from "@/components/status-badge";
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
import { formatUsdFull } from "@/lib/format";
import { listSupply, setSupplyStatus, upsertSupply } from "@/lib/server/admin";
import type { SupplyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/supply")({ component: SupplyPage });

const CATEGORIES = ["Fasteners", "Lumber", "Conduit", "PVC", "Plate", "Power tools"] as const;
const NEXT: Record<SupplyStatus, SupplyStatus | null> = {
  quoted: "awarded",
  awarded: "shipped",
  shipped: "delivered",
  delivered: null,
};

function SupplyPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["supply"], queryFn: () => listSupply() });
  const [category, setCategory] = useState<"all" | string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    sku: "",
    material: "",
    category: "Fasteners",
    qty: 100,
    unit: "box",
    unit_price_cents: 1000,
    vendor: "FastTrack Supply",
    status: "quoted" as SupplyStatus,
  });

  const save = useMutation({
    mutationFn: () => upsertSupply({ data: form }),
    onSuccess: () => {
      toast.success("Order added");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["supply"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const advance = useMutation({
    mutationFn: (data: { id: number; status: SupplyStatus }) => setSupplyStatus({ data }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["supply"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const list = q.data ?? [];
    if (category === "all") return list;
    return list.filter((r) => r.category === category);
  }, [q.data, category]);

  const total = rows.reduce((n, r) => n + r.qty * r.unit_price_cents, 0);

  return (
    <div>
      <PageHeader
        kicker="Exchange"
        title="Supply"
        description="Source fasteners, lumber, conduit, PVC, plate, and tools with sealed, scored bidding."
        action={
          <Button
            onClick={() => {
              setForm({
                sku: "",
                material: "",
                category: "Fasteners",
                qty: 100,
                unit: "box",
                unit_price_cents: 1000,
                vendor: "FastTrack Supply",
                status: "quoted",
              });
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            New order
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-medium",
              category === c ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted",
            )}
          >
            {c === "all" ? "All materials" : c}
          </button>
        ))}
        <span className="ml-auto text-xs tabular-nums text-muted">
          {rows.length} orders · {formatUsdFull(Math.round(total / 100))}
        </span>
      </div>

      {q.isLoading ? (
        <Skeleton className="h-80 rounded-lg" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-surface-2 text-xs tracking-wider text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Material</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Unit price</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    No orders in this category.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const next = NEXT[r.status];
                  return (
                    <tr key={r.id} className="border-t border-border hover:bg-surface-2/40">
                      <td className="px-4 py-3 font-mono text-xs text-muted">{r.sku}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.material}</div>
                        <div className="text-xs text-subtle">{r.category}</div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted">
                        {r.qty.toLocaleString()} {r.unit}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatUsdFull(r.unit_price_cents / 100)}
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium">
                        {formatUsdFull((r.qty * r.unit_price_cents) / 100)}
                      </td>
                      <td className="px-4 py-3 text-muted">{r.vendor}</td>
                      <td className="px-4 py-3">
                        <SupplyStatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {next ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => advance.mutate({ id: r.id, status: next })}
                          >
                            Mark {next}
                          </Button>
                        ) : (
                          <span className="text-xs text-ok">Delivered</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New supply order</DialogTitle>
            <DialogDescription>
              Sealed quotes — no race to the bottom on commodity materials.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="SKU">
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="FST-1000"
                />
              </Field>
              <Field label="Category">
                <NativeSelect
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <Field label="Material">
              <Input
                required
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Qty">
                <Input
                  type="number"
                  min={1}
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                />
              </Field>
              <Field label="Unit">
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </Field>
              <Field label="Unit price (USD)">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.unit_price_cents / 100}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unit_price_cents: Math.round(Number(e.target.value) * 100),
                    })
                  }
                />
              </Field>
            </div>
            <Field label="Vendor">
              <Input
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              />
            </Field>
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Add order"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
