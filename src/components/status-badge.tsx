import { Badge } from "@/components/ui/badge";
import type {
  BidStatus,
  CompanyStatus,
  CompanyType,
  ProjectStatus,
  SupplyStatus,
} from "@/lib/types";

const companyTone = {
  pending: "warn",
  verified: "ok",
  suspended: "danger",
} as const;

const projectTone = {
  open: "info",
  bidding: "warn",
  awarded: "ok",
  closed: "neutral",
} as const;

const bidTone = {
  submitted: "info",
  shortlisted: "warn",
  awarded: "ok",
  declined: "danger",
} as const;

const supplyTone = {
  quoted: "info",
  awarded: "warn",
  shipped: "info",
  delivered: "ok",
} as const;

const typeLabel: Record<CompanyType, string> = {
  gc: "General",
  sub: "Subcontractor",
  supplier: "Supplier",
};

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return <Badge tone={companyTone[status]}>{status}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={projectTone[status]}>{status}</Badge>;
}

export function BidStatusBadge({ status }: { status: BidStatus }) {
  return <Badge tone={bidTone[status]}>{status}</Badge>;
}

export function SupplyStatusBadge({ status }: { status: SupplyStatus }) {
  return <Badge tone={supplyTone[status]}>{status}</Badge>;
}

export function CompanyTypeBadge({ type }: { type: CompanyType }) {
  return <Badge tone="neutral">{typeLabel[type]}</Badge>;
}
