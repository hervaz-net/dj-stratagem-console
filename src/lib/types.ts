export type CompanyType = "gc" | "sub" | "supplier";
export type CompanyStatus = "pending" | "verified" | "suspended";
export type ProjectStatus = "open" | "bidding" | "awarded" | "closed";
export type ProjectKind =
  | "commercial"
  | "residential"
  | "industrial"
  | "education"
  | "infrastructure";
export type BidStatus = "submitted" | "shortlisted" | "awarded" | "declined";
export type SupplyStatus = "quoted" | "awarded" | "shipped" | "delivered";

export type Company = {
  id: number;
  name: string;
  type: CompanyType;
  trade: string;
  city: string;
  region: string;
  status: CompanyStatus;
  match_score: number;
  years: number;
  contact_name: string;
  contact_email: string;
  notes: string;
  created_at: string;
};

export type Project = {
  id: number;
  name: string;
  client: string;
  city: string;
  kind: ProjectKind;
  value_usd: number;
  status: ProjectStatus;
  trade_focus: string;
  deadline: string;
  match_score: number;
  description: string;
  bid_count: number;
  created_at: string;
};

export type Bid = {
  id: number;
  project_id: number;
  company_id: number;
  project_name: string;
  company_name: string;
  company_trade: string;
  amount_usd: number;
  schedule_weeks: number;
  past_score: number;
  price_score: number;
  overall_score: number;
  status: BidStatus;
  submitted_at: string;
};

export type SupplyOrder = {
  id: number;
  sku: string;
  material: string;
  category: string;
  qty: number;
  unit: string;
  unit_price_cents: number;
  vendor: string;
  status: SupplyStatus;
  created_at: string;
};

export type Activity = {
  id: number;
  kind: string;
  title: string;
  detail: string;
  created_at: string;
};

export type DashboardStats = {
  companies: number;
  pending_companies: number;
  open_projects: number;
  pipeline_usd: number;
  bids_open: number;
  award_rate: number;
  supply_open: number;
  supply_usd: number;
};

export type PipelinePoint = {
  status: ProjectStatus;
  count: number;
  value_usd: number;
};

export type TradeMix = {
  trade: string;
  count: number;
};

export type WeeklyBid = {
  week: string;
  count: number;
  value_usd: number;
};

export type WorkspaceSettings = {
  org_name: string;
  contact_email: string;
  phone: string;
  city: string;
};

export type DashboardPayload = {
  stats: DashboardStats;
  pipeline: PipelinePoint[];
  trades: TradeMix[];
  weekly: WeeklyBid[];
  activities: Activity[];
  deadlines: Project[];
};
