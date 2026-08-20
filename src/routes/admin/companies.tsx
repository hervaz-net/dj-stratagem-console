import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { CompanyStatusBadge, CompanyTypeBadge } from "@/components/status-badge";
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
import { listCompanies, setCompanyStatus, upsertCompany } from "@/lib/server/admin";
import type { Company, CompanyStatus, CompanyType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/companies")({ component: CompaniesPage });

const emptyForm = {
  name: "",
  type: "sub" as CompanyType,
  trade: "",
  city: "Los Angeles",
  region: "LA County",
  status: "pending" as CompanyStatus,
  match_score: 70,
  years: 5,
  contact_name: "",
  contact_email: "",
  notes: "",
};

type FormState = typeof emptyForm & { id?: number };

function CompaniesPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["companies"], queryFn: () => listCompanies() });
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | CompanyType>("all");
  const [status, setStatus] = useState<"all" | CompanyStatus>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const save = useMutation({
    mutationFn: (data: FormState) => upsertCompany({ data }),
    onSuccess: () => {
      toast.success("Company saved");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["companies"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMut = useMutation({
    mutationFn: (data: { id: number; status: CompanyStatus }) => setCompanyStatus({ data }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["companies"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const list = q.data ?? [];
    const qn = query.trim().toLowerCase();
    return list.filter((c) => {
      if (type !== "all" && c.type !== type) return false;
      if (status !== "all" && c.status !== status) return false;
      if (!qn) return true;
      return `${c.name} ${c.trade} ${c.city} ${c.contact_name}`.toLowerCase().includes(qn);
    });
  }, [q.data, query, type, status]);

  function edit(c: Company) {
    setForm({
      id: c.id,
      name: c.name,
      type: c.type,
      trade: c.trade,
      city: c.city,
      region: c.region,
      status: c.status,
      match_score: c.match_score,
      years: c.years,
      contact_name: c.contact_name,
      contact_email: c.contact_email,
      notes: c.notes,
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        kicker="Directory"
        title="Companies"
        description="General contractors, subcontractors, and suppliers — verify once, carry it on every bid."
        action={
          <Button
            onClick={() => {
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add company
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, trade, city"
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "gc", "sub", "supplier"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "h-9 rounded-full px-3 text-xs font-medium capitalize",
                type === t ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted",
              )}
            >
              {t === "all" ? "All types" : t === "gc" ? "General" : t}
            </button>
          ))}
        </div>
        <NativeSelect
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="sm:w-40"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="suspended">Suspended</option>
        </NativeSelect>
      </div>

      {q.isLoading ? (
        <Skeleton className="h-80 rounded-lg" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-surface-2 text-xs tracking-wider text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Trade</th>
                <th className="px-4 py-3 font-medium">Area</th>
                <th className="px-4 py-3 font-medium">Match</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted">
                    No companies match those filters.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-surface-2/40">
                    <td className="px-4 py-3">
                      <button type="button" className="text-left" onClick={() => edit(c)}>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted">
                          {c.contact_name} · {c.years} yrs
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <CompanyTypeBadge type={c.type} />
                    </td>
                    <td className="px-4 py-3 text-muted">{c.trade}</td>
                    <td className="px-4 py-3 text-muted">
                      {c.city}
                      <span className="block text-xs text-subtle">{c.region}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium">{c.match_score}%</td>
                    <td className="px-4 py-3">
                      <CompanyStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.status === "pending" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => statusMut.mutate({ id: c.id, status: "verified" })}
                        >
                          Verify
                        </Button>
                      ) : c.status === "verified" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => statusMut.mutate({ id: c.id, status: "suspended" })}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => statusMut.mutate({ id: c.id, status: "verified" })}
                        >
                          Reinstate
                        </Button>
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
            <DialogTitle>{form.id ? "Edit company" : "Add company"}</DialogTitle>
            <DialogDescription>
              Profile travels with every bid this company submits.
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
              <Field label="Type">
                <NativeSelect
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as CompanyType })}
                >
                  <option value="gc">General contractor</option>
                  <option value="sub">Subcontractor</option>
                  <option value="supplier">Supplier</option>
                </NativeSelect>
              </Field>
              <Field label="Trade">
                <Input
                  required
                  value={form.trade}
                  onChange={(e) => setForm({ ...form, trade: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="City">
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>
              <Field label="Region">
                <Input
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Status">
                <NativeSelect
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as CompanyStatus })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="suspended">Suspended</option>
                </NativeSelect>
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
              <Field label="Years">
                <Input
                  type="number"
                  min={0}
                  value={form.years}
                  onChange={(e) => setForm({ ...form, years: Number(e.target.value) })}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Contact">
                <Input
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
