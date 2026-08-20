import type { Sql } from "@/lib/db";

type CompanySeed = {
  name: string;
  type: "gc" | "sub" | "supplier";
  trade: string;
  city: string;
  region: string;
  status: "pending" | "verified" | "suspended";
  match_score: number;
  years: number;
  contact_name: string;
  contact_email: string;
  notes: string;
};

const COMPANIES: CompanySeed[] = [
  {
    name: "Westside General Contractors",
    type: "gc",
    trade: "General contracting",
    city: "Santa Monica",
    region: "West LA",
    status: "verified",
    match_score: 91,
    years: 18,
    contact_name: "Elena Voss",
    contact_email: "elena@westsidegc.com",
    notes: "Preferred GC for coastal multifamily. Bonded to $40M.",
  },
  {
    name: "Harbor Frame Co.",
    type: "sub",
    trade: "Framing",
    city: "Long Beach",
    region: "South Bay",
    status: "verified",
    match_score: 88,
    years: 12,
    contact_name: "Marcus Hale",
    contact_email: "marcus@harborframe.com",
    notes: "High-rise wood and cold-formed steel. Crew of 40.",
  },
  {
    name: "Apex Electrical",
    type: "sub",
    trade: "Electrical",
    city: "Riverside",
    region: "Inland Empire",
    status: "verified",
    match_score: 94,
    years: 22,
    contact_name: "Priya Shah",
    contact_email: "priya@apexelectrical.com",
    notes: "Medical and lab work. Strong bid history on healthcare.",
  },
  {
    name: "Pacific HVAC Partners",
    type: "sub",
    trade: "HVAC",
    city: "Pasadena",
    region: "San Gabriel",
    status: "pending",
    match_score: 76,
    years: 7,
    contact_name: "Jonah Reed",
    contact_email: "jonah@pacifichvac.com",
    notes: "Awaiting insurance cert. Strong residential retrofit book.",
  },
  {
    name: "Metro Glass & Wall",
    type: "sub",
    trade: "Window wall",
    city: "Los Angeles",
    region: "DTLA",
    status: "verified",
    match_score: 96,
    years: 15,
    contact_name: "Sofia Nguyen",
    contact_email: "sofia@metroglasswall.com",
    notes: "Unitized curtain wall and structural glazing. In-house engineering.",
  },
  {
    name: "SoCal Concrete",
    type: "sub",
    trade: "Concrete",
    city: "Vernon",
    region: "Central",
    status: "verified",
    match_score: 85,
    years: 30,
    contact_name: "Andre Castillo",
    contact_email: "andre@socalconcrete.com",
    notes: "Foundations, decks, and tilt-up. Union shop.",
  },
  {
    name: "Inland Mechanical",
    type: "sub",
    trade: "Plumbing",
    city: "Ontario",
    region: "Inland Empire",
    status: "verified",
    match_score: 82,
    years: 11,
    contact_name: "Keisha Brown",
    contact_email: "keisha@inlandmech.com",
    notes: "Medical gas and commercial plumbing. Available Q4.",
  },
  {
    name: "Ridge Line Roofing",
    type: "sub",
    trade: "Roofing",
    city: "Glendale",
    region: "North LA",
    status: "pending",
    match_score: 71,
    years: 9,
    contact_name: "Tom Alvarez",
    contact_email: "tom@ridgelineroof.com",
    notes: "TPO and standing seam. Documents incomplete.",
  },
  {
    name: "Cascade Drywall",
    type: "sub",
    trade: "Drywall",
    city: "Burbank",
    region: "North LA",
    status: "verified",
    match_score: 80,
    years: 14,
    contact_name: "Mina Park",
    contact_email: "mina@cascadedrywall.com",
    notes: "Soundstage and commercial interiors.",
  },
  {
    name: "FastTrack Supply",
    type: "supplier",
    trade: "Materials",
    city: "Commerce",
    region: "Central",
    status: "verified",
    match_score: 89,
    years: 20,
    contact_name: "Chris Okonkwo",
    contact_email: "chris@fasttracksupply.com",
    notes: "Same-week fasteners, conduit, and lumber. Sealed bids.",
  },
  {
    name: "Summit Structural",
    type: "sub",
    trade: "Structural steel",
    city: "Compton",
    region: "South LA",
    status: "verified",
    match_score: 90,
    years: 16,
    contact_name: "Hannah Briggs",
    contact_email: "hannah@summitstructural.com",
    notes: "Fabrication yard on-site. AISC certified.",
  },
  {
    name: "Eastside Earthworks",
    type: "sub",
    trade: "Grading",
    city: "El Monte",
    region: "San Gabriel",
    status: "suspended",
    match_score: 54,
    years: 8,
    contact_name: "Luis Ortega",
    contact_email: "luis@eastsideearth.com",
    notes: "Suspended pending safety review from June incident.",
  },
];

type ProjectSeed = {
  name: string;
  client: string;
  city: string;
  kind: "commercial" | "residential" | "industrial" | "education" | "infrastructure";
  value_usd: number;
  status: "open" | "bidding" | "awarded" | "closed";
  trade_focus: string;
  deadline: string;
  match_score: number;
  description: string;
};

const PROJECTS: ProjectSeed[] = [
  {
    name: "Riverside Medical Office",
    client: "Inland Health Group",
    city: "Riverside",
    kind: "commercial",
    value_usd: 4_200_000,
    status: "bidding",
    trade_focus: "Electrical",
    deadline: "2026-09-04",
    match_score: 94,
    description: "Two-story outpatient clinic. Electrical, HVAC, and interiors packages open.",
  },
  {
    name: "DTLA Mixed-Use Tower",
    client: "Spring Street Partners",
    city: "Los Angeles",
    kind: "commercial",
    value_usd: 28_400_000,
    status: "open",
    trade_focus: "Window wall",
    deadline: "2026-10-16",
    match_score: 97,
    description: "28-story mixed-use. Unitized curtain wall and structural steel still unawarded.",
  },
  {
    name: "Long Beach Warehouse Retrofit",
    client: "Pacific Logistics",
    city: "Long Beach",
    kind: "industrial",
    value_usd: 6_800_000,
    status: "awarded",
    trade_focus: "Concrete",
    deadline: "2026-08-12",
    match_score: 81,
    description: "Seismic upgrade and dock expansion. Concrete package awarded.",
  },
  {
    name: "Pasadena School Modernization",
    client: "PUSD",
    city: "Pasadena",
    kind: "education",
    value_usd: 12_100_000,
    status: "bidding",
    trade_focus: "HVAC",
    deadline: "2026-09-18",
    match_score: 86,
    description: "Three campus buildings. DSA review complete. HVAC and electrical out to bid.",
  },
  {
    name: "Santa Monica Coastal Residences",
    client: "Tideform Development",
    city: "Santa Monica",
    kind: "residential",
    value_usd: 9_400_000,
    status: "open",
    trade_focus: "Framing",
    deadline: "2026-11-02",
    match_score: 78,
    description: "14-unit coastal condominium. Framing and glazing invitations opening next week.",
  },
  {
    name: "LAX Terminal Support Building",
    client: "LAWA",
    city: "Los Angeles",
    kind: "infrastructure",
    value_usd: 18_500_000,
    status: "bidding",
    trade_focus: "Structural steel",
    deadline: "2026-09-28",
    match_score: 92,
    description: "Airside support building. Steel, electrical, and mechanical packages live.",
  },
  {
    name: "Hollywood Soundstage Expansion",
    client: "Lot 12 Studios",
    city: "Burbank",
    kind: "commercial",
    value_usd: 7_200_000,
    status: "closed",
    trade_focus: "Drywall",
    deadline: "2026-07-30",
    match_score: 74,
    description: "Stage 4 expansion. Work complete, final invoice pending.",
  },
  {
    name: "Commercial HVAC Upgrade",
    client: "Wilshire Office REIT",
    city: "Los Angeles",
    kind: "commercial",
    value_usd: 1_850_000,
    status: "bidding",
    trade_focus: "HVAC",
    deadline: "2026-08-28",
    match_score: 94,
    description: "Chiller replacement and VAV retrofit across four floors.",
  },
];

type BidSeed = {
  project: string;
  company: string;
  amount_usd: number;
  schedule_weeks: number;
  past_score: number;
  price_score: number;
  overall_score: number;
  status: "submitted" | "shortlisted" | "awarded" | "declined";
  submitted_at: string;
};

const BIDS: BidSeed[] = [
  {
    project: "Riverside Medical Office",
    company: "Apex Electrical",
    amount_usd: 1_120_000,
    schedule_weeks: 18,
    past_score: 96,
    price_score: 88,
    overall_score: 93,
    status: "shortlisted",
    submitted_at: "2026-08-08T16:00:00Z",
  },
  {
    project: "Riverside Medical Office",
    company: "Inland Mechanical",
    amount_usd: 980_000,
    schedule_weeks: 20,
    past_score: 84,
    price_score: 91,
    overall_score: 87,
    status: "submitted",
    submitted_at: "2026-08-11T18:20:00Z",
  },
  {
    project: "Riverside Medical Office",
    company: "Pacific HVAC Partners",
    amount_usd: 1_240_000,
    schedule_weeks: 16,
    past_score: 79,
    price_score: 72,
    overall_score: 76,
    status: "submitted",
    submitted_at: "2026-08-12T14:10:00Z",
  },
  {
    project: "Pasadena School Modernization",
    company: "Pacific HVAC Partners",
    amount_usd: 3_450_000,
    schedule_weeks: 28,
    past_score: 78,
    price_score: 85,
    overall_score: 81,
    status: "submitted",
    submitted_at: "2026-08-04T15:00:00Z",
  },
  {
    project: "Pasadena School Modernization",
    company: "Apex Electrical",
    amount_usd: 2_890_000,
    schedule_weeks: 26,
    past_score: 94,
    price_score: 80,
    overall_score: 88,
    status: "shortlisted",
    submitted_at: "2026-07-28T19:40:00Z",
  },
  {
    project: "LAX Terminal Support Building",
    company: "Summit Structural",
    amount_usd: 6_200_000,
    schedule_weeks: 34,
    past_score: 92,
    price_score: 83,
    overall_score: 89,
    status: "shortlisted",
    submitted_at: "2026-08-01T17:30:00Z",
  },
  {
    project: "LAX Terminal Support Building",
    company: "Westside General Contractors",
    amount_usd: 7_100_000,
    schedule_weeks: 32,
    past_score: 90,
    price_score: 70,
    overall_score: 82,
    status: "submitted",
    submitted_at: "2026-08-06T13:15:00Z",
  },
  {
    project: "LAX Terminal Support Building",
    company: "SoCal Concrete",
    amount_usd: 4_750_000,
    schedule_weeks: 30,
    past_score: 86,
    price_score: 88,
    overall_score: 86,
    status: "submitted",
    submitted_at: "2026-07-22T20:00:00Z",
  },
  {
    project: "Long Beach Warehouse Retrofit",
    company: "SoCal Concrete",
    amount_usd: 2_150_000,
    schedule_weeks: 22,
    past_score: 91,
    price_score: 90,
    overall_score: 91,
    status: "awarded",
    submitted_at: "2026-07-08T16:45:00Z",
  },
  {
    project: "Long Beach Warehouse Retrofit",
    company: "Harbor Frame Co.",
    amount_usd: 2_410_000,
    schedule_weeks: 24,
    past_score: 80,
    price_score: 74,
    overall_score: 77,
    status: "declined",
    submitted_at: "2026-07-06T15:10:00Z",
  },
  {
    project: "Commercial HVAC Upgrade",
    company: "Pacific HVAC Partners",
    amount_usd: 1_620_000,
    schedule_weeks: 14,
    past_score: 77,
    price_score: 86,
    overall_score: 82,
    status: "submitted",
    submitted_at: "2026-08-14T21:00:00Z",
  },
  {
    project: "Commercial HVAC Upgrade",
    company: "Apex Electrical",
    amount_usd: 410_000,
    schedule_weeks: 12,
    past_score: 95,
    price_score: 84,
    overall_score: 90,
    status: "shortlisted",
    submitted_at: "2026-08-15T18:30:00Z",
  },
  {
    project: "Hollywood Soundstage Expansion",
    company: "Cascade Drywall",
    amount_usd: 1_980_000,
    schedule_weeks: 20,
    past_score: 88,
    price_score: 87,
    overall_score: 88,
    status: "awarded",
    submitted_at: "2026-06-18T16:00:00Z",
  },
  {
    project: "DTLA Mixed-Use Tower",
    company: "Metro Glass & Wall",
    amount_usd: 8_900_000,
    schedule_weeks: 42,
    past_score: 97,
    price_score: 81,
    overall_score: 91,
    status: "submitted",
    submitted_at: "2026-08-18T14:50:00Z",
  },
];

type SupplySeed = {
  sku: string;
  material: string;
  category: string;
  qty: number;
  unit: string;
  unit_price_cents: number;
  vendor: string;
  status: "quoted" | "awarded" | "shipped" | "delivered";
};

const SUPPLY: SupplySeed[] = [
  {
    sku: "FST-1044",
    material: "Structural screws, 4 in.",
    category: "Fasteners",
    qty: 12000,
    unit: "box",
    unit_price_cents: 1850,
    vendor: "FastTrack Supply",
    status: "awarded",
  },
  {
    sku: "LMB-2X10",
    material: "Douglas fir 2x10, 16 ft",
    category: "Lumber",
    qty: 840,
    unit: "pc",
    unit_price_cents: 2490,
    vendor: "FastTrack Supply",
    status: "shipped",
  },
  {
    sku: "CND-EMT1",
    material: "EMT conduit 1 in.",
    category: "Conduit",
    qty: 2600,
    unit: "stick",
    unit_price_cents: 420,
    vendor: "Apex Electrical",
    status: "quoted",
  },
  {
    sku: "PVC-SCH40",
    material: "PVC schedule 40, 4 in.",
    category: "PVC",
    qty: 480,
    unit: "stick",
    unit_price_cents: 1860,
    vendor: "Inland Mechanical",
    status: "quoted",
  },
  {
    sku: "PLT-A36",
    material: "A36 plate, 1/2 in.",
    category: "Plate",
    qty: 36,
    unit: "sheet",
    unit_price_cents: 21400,
    vendor: "Summit Structural",
    status: "awarded",
  },
  {
    sku: "TLS-IMPACT",
    material: "18V impact driver kit",
    category: "Power tools",
    qty: 24,
    unit: "kit",
    unit_price_cents: 18900,
    vendor: "FastTrack Supply",
    status: "delivered",
  },
  {
    sku: "FST-WEDGE",
    material: "Wedge anchors 5/8 in.",
    category: "Fasteners",
    qty: 4000,
    unit: "box",
    unit_price_cents: 3200,
    vendor: "FastTrack Supply",
    status: "quoted",
  },
  {
    sku: "LMB-LVL",
    material: "2.0E LVL beams, 24 ft",
    category: "Lumber",
    qty: 64,
    unit: "pc",
    unit_price_cents: 18600,
    vendor: "Harbor Frame Co.",
    status: "shipped",
  },
];

const ACTIVITIES: { kind: string; title: string; detail: string }[] = [
  {
    kind: "bid",
    title: "Metro Glass & Wall submitted on DTLA Mixed-Use Tower",
    detail: "$8.9M · 42 weeks · overall 91",
  },
  {
    kind: "company",
    title: "Pacific HVAC Partners verification pending",
    detail: "Insurance certificate still outstanding",
  },
  {
    kind: "award",
    title: "SoCal Concrete awarded Long Beach Warehouse Retrofit",
    detail: "Concrete package · $2.15M",
  },
  {
    kind: "project",
    title: "Commercial HVAC Upgrade opened to bid",
    detail: "Wilshire Office REIT · deadline Aug 28",
  },
  {
    kind: "supply",
    title: "Douglas fir 2x10 shipment left Commerce",
    detail: "840 pieces · FastTrack Supply",
  },
  {
    kind: "bid",
    title: "Apex Electrical shortlisted on Riverside Medical Office",
    detail: "Price 88 · schedule 18 wks · past 96",
  },
];

export async function seedIfEmpty(sql: Sql, userId: string): Promise<void> {
  const existing = await sql<{ n: number }>`
    select count(*)::int as n from companies where user_id = ${userId}
  `;
  if ((existing[0]?.n ?? 0) > 0) return;

  const companyIds: Record<string, number> = {};
  for (const c of COMPANIES) {
    const [row] = await sql<{ id: number }>`
      insert into companies (
        user_id, name, type, trade, city, region, status, match_score, years,
        contact_name, contact_email, notes
      ) values (
        ${userId}, ${c.name}, ${c.type}, ${c.trade}, ${c.city}, ${c.region},
        ${c.status}, ${c.match_score}, ${c.years}, ${c.contact_name},
        ${c.contact_email}, ${c.notes}
      ) returning id
    `;
    companyIds[c.name] = row.id;
  }

  const projectIds: Record<string, number> = {};
  for (const p of PROJECTS) {
    const [row] = await sql<{ id: number }>`
      insert into projects (
        user_id, name, client, city, kind, value_usd, status, trade_focus,
        deadline, match_score, description
      ) values (
        ${userId}, ${p.name}, ${p.client}, ${p.city}, ${p.kind}, ${p.value_usd},
        ${p.status}, ${p.trade_focus}, ${p.deadline}, ${p.match_score},
        ${p.description}
      ) returning id
    `;
    projectIds[p.name] = row.id;
  }

  for (const b of BIDS) {
    const projectId = projectIds[b.project];
    const companyId = companyIds[b.company];
    if (!projectId || !companyId) continue;
    await sql`
      insert into bids (
        user_id, project_id, company_id, amount_usd, schedule_weeks,
        past_score, price_score, overall_score, status, submitted_at
      ) values (
        ${userId}, ${projectId}, ${companyId}, ${b.amount_usd}, ${b.schedule_weeks},
        ${b.past_score}, ${b.price_score}, ${b.overall_score}, ${b.status},
        ${b.submitted_at}
      )
    `;
  }

  for (const s of SUPPLY) {
    await sql`
      insert into supply_orders (
        user_id, sku, material, category, qty, unit, unit_price_cents, vendor, status
      ) values (
        ${userId}, ${s.sku}, ${s.material}, ${s.category}, ${s.qty}, ${s.unit},
        ${s.unit_price_cents}, ${s.vendor}, ${s.status}
      )
    `;
  }

  for (const a of ACTIVITIES) {
    await sql`
      insert into activities (user_id, kind, title, detail)
      values (${userId}, ${a.kind}, ${a.title}, ${a.detail})
    `;
  }

  await sql`
    insert into workspace_settings (user_id, org_name, contact_email, phone, city)
    values (
      ${userId},
      ${"D&J Stratagem, Inc."},
      ${"hello@djstratageminc.com"},
      ${"(562) 375-7470"},
      ${"Los Angeles, CA"}
    )
    on conflict (user_id) do nothing
  `;
}

export async function logActivity(
  sql: Sql,
  userId: string,
  kind: string,
  title: string,
  detail = "",
): Promise<void> {
  await sql`
    insert into activities (user_id, kind, title, detail)
    values (${userId}, ${kind}, ${title}, ${detail})
  `;
}
