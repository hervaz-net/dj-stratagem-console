import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { logActivity, seedIfEmpty } from "@/lib/server/seed";
import type {
  Activity,
  Bid,
  BidStatus,
  Company,
  CompanyStatus,
  CompanyType,
  DashboardPayload,
  PipelinePoint,
  Project,
  ProjectKind,
  ProjectStatus,
  SupplyOrder,
  SupplyStatus,
  TradeMix,
  WeeklyBid,
  WorkspaceSettings,
} from "@/lib/types";

async function ready(userId: string) {
  const sql = await getSql();
  await seedIfEmpty(sql, userId);
  return sql;
}

const PROJECT_SELECT = `
  p.id, p.name, p.client, p.city, p.kind, p.value_usd, p.status, p.trade_focus,
  p.deadline::text as deadline, p.match_score, p.description,
  p.created_at::text as created_at,
  coalesce(b.n, 0)::int as bid_count
`;

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DashboardPayload> => {
    const sql = await ready(context.userId);
    const uid = context.userId;

    const [companyRow] = await sql<{ n: number; pending: number }>`
      select count(*)::int as n,
             count(*) filter (where status = 'pending')::int as pending
      from companies where user_id = ${uid}
    `;
    const [projectRow] = await sql<{ open: number; pipeline: number }>`
      select
        count(*) filter (where status in ('open','bidding'))::int as open,
        coalesce(sum(value_usd) filter (where status in ('open','bidding')), 0)::int as pipeline
      from projects where user_id = ${uid}
    `;
    const [bidRow] = await sql<{ open: number; awarded: number; total: number }>`
      select
        count(*) filter (where status in ('submitted','shortlisted'))::int as open,
        count(*) filter (where status = 'awarded')::int as awarded,
        count(*)::int as total
      from bids where user_id = ${uid}
    `;
    const [supplyRow] = await sql<{ open: number; usd: number }>`
      select
        count(*) filter (where status in ('quoted','awarded','shipped'))::int as open,
        coalesce(sum((qty * unit_price_cents) / 100) filter (where status <> 'delivered'), 0)::int as usd
      from supply_orders where user_id = ${uid}
    `;

    const pipeline = await sql<PipelinePoint>`
      select status, count(*)::int as count, coalesce(sum(value_usd),0)::int as value_usd
      from projects where user_id = ${uid}
      group by status
    `;

    const trades = await sql<TradeMix>`
      select trade, count(*)::int as count
      from companies where user_id = ${uid}
      group by trade
      order by count desc
    `;

    const weekly = await sql<WeeklyBid>`
      select to_char(date_trunc('week', submitted_at), 'YYYY-MM-DD') as week,
             count(*)::int as count,
             coalesce(sum(amount_usd),0)::int as value_usd
      from bids where user_id = ${uid}
      group by 1
      order by 1
    `;

    const activities = await sql<Activity>`
      select id, kind, title, detail, created_at::text as created_at
      from activities where user_id = ${uid}
      order by id desc
      limit 8
    `;

    const deadlineRows = await sql.query<Project>(
      `select ${PROJECT_SELECT}
       from projects p
       left join (
         select project_id, count(*)::int as n from bids where user_id = $1 group by project_id
       ) b on b.project_id = p.id
       where p.user_id = $1 and p.status in ('open','bidding')
       order by p.deadline asc
       limit 5`,
      [uid],
    );

    const total = bidRow?.total ?? 0;
    const awarded = bidRow?.awarded ?? 0;

    return {
      stats: {
        companies: companyRow?.n ?? 0,
        pending_companies: companyRow?.pending ?? 0,
        open_projects: projectRow?.open ?? 0,
        pipeline_usd: projectRow?.pipeline ?? 0,
        bids_open: bidRow?.open ?? 0,
        award_rate: total === 0 ? 0 : Math.round((awarded / total) * 100),
        supply_open: supplyRow?.open ?? 0,
        supply_usd: supplyRow?.usd ?? 0,
      },
      pipeline,
      trades,
      weekly,
      activities,
      deadlines: deadlineRows,
    };
  });

export const listCompanies = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready(context.userId);
    return sql<Company>`
      select id, name, type, trade, city, region, status, match_score, years,
             contact_name, contact_email, notes, created_at::text as created_at
      from companies
      where user_id = ${context.userId}
      order by match_score desc, name asc
    `;
  });

export const upsertCompany = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: {
    id?: number;
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
  }) => {
    if (!d.name.trim()) throw new Error("Company name is required");
    return { ...d, name: d.name.trim() };
  })
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    const uid = context.userId;
    if (data.id) {
      await sql`
        update companies set
          name = ${data.name}, type = ${data.type}, trade = ${data.trade},
          city = ${data.city}, region = ${data.region}, status = ${data.status},
          match_score = ${data.match_score}, years = ${data.years},
          contact_name = ${data.contact_name}, contact_email = ${data.contact_email},
          notes = ${data.notes}
        where id = ${data.id} and user_id = ${uid}
      `;
      await logActivity(sql, uid, "company", `Updated ${data.name}`, data.status);
    } else {
      await sql`
        insert into companies (
          user_id, name, type, trade, city, region, status, match_score, years,
          contact_name, contact_email, notes
        ) values (
          ${uid}, ${data.name}, ${data.type}, ${data.trade}, ${data.city},
          ${data.region}, ${data.status}, ${data.match_score}, ${data.years},
          ${data.contact_name}, ${data.contact_email}, ${data.notes}
        )
      `;
      await logActivity(sql, uid, "company", `Added ${data.name}`, data.trade);
    }
  });

export const setCompanyStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; status: CompanyStatus }) => d)
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    const [row] = await sql<{ name: string }>`
      update companies set status = ${data.status}
      where id = ${data.id} and user_id = ${context.userId}
      returning name
    `;
    if (row) {
      await logActivity(
        sql,
        context.userId,
        "company",
        `${row.name} marked ${data.status}`,
      );
    }
  });

export const listProjects = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready(context.userId);
    return sql.query<Project>(
      `select ${PROJECT_SELECT}
       from projects p
       left join (
         select project_id, count(*)::int as n from bids where user_id = $1 group by project_id
       ) b on b.project_id = p.id
       where p.user_id = $1
       order by p.deadline asc`,
      [context.userId],
    );
  });

export const upsertProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: {
    id?: number;
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
  }) => {
    if (!d.name.trim()) throw new Error("Project name is required");
    return { ...d, name: d.name.trim(), value_usd: Math.max(0, Math.round(d.value_usd)) };
  })
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    const uid = context.userId;
    if (data.id) {
      await sql`
        update projects set
          name = ${data.name}, client = ${data.client}, city = ${data.city},
          kind = ${data.kind}, value_usd = ${data.value_usd}, status = ${data.status},
          trade_focus = ${data.trade_focus}, deadline = ${data.deadline},
          match_score = ${data.match_score}, description = ${data.description}
        where id = ${data.id} and user_id = ${uid}
      `;
      await logActivity(sql, uid, "project", `Updated ${data.name}`, data.status);
    } else {
      await sql`
        insert into projects (
          user_id, name, client, city, kind, value_usd, status, trade_focus,
          deadline, match_score, description
        ) values (
          ${uid}, ${data.name}, ${data.client}, ${data.city}, ${data.kind},
          ${data.value_usd}, ${data.status}, ${data.trade_focus}, ${data.deadline},
          ${data.match_score}, ${data.description}
        )
      `;
      await logActivity(sql, uid, "project", `Opened ${data.name}`, data.city);
    }
  });

export const setProjectStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; status: ProjectStatus }) => d)
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    const [row] = await sql<{ name: string }>`
      update projects set status = ${data.status}
      where id = ${data.id} and user_id = ${context.userId}
      returning name
    `;
    if (row) {
      await logActivity(sql, context.userId, "project", `${row.name} → ${data.status}`);
    }
  });

export const listBids = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready(context.userId);
    return sql<Bid>`
      select
        b.id, b.project_id, b.company_id, p.name as project_name,
        c.name as company_name, c.trade as company_trade,
        b.amount_usd, b.schedule_weeks, b.past_score, b.price_score,
        b.overall_score, b.status, b.submitted_at::text as submitted_at
      from bids b
      join projects p on p.id = b.project_id
      join companies c on c.id = b.company_id
      where b.user_id = ${context.userId}
      order by b.overall_score desc, b.submitted_at desc
    `;
  });

export const upsertBid = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: {
    project_id: number;
    company_id: number;
    amount_usd: number;
    schedule_weeks: number;
    past_score: number;
    price_score: number;
    overall_score: number;
    status: BidStatus;
  }) => d)
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    const uid = context.userId;
    const [project] = await sql<{ id: number; name: string }>`
      select id, name from projects where id = ${data.project_id} and user_id = ${uid}
    `;
    const [company] = await sql<{ id: number; name: string }>`
      select id, name from companies where id = ${data.company_id} and user_id = ${uid}
    `;
    if (!project || !company) throw new Error("Project or company not found");
    await sql`
      insert into bids (
        user_id, project_id, company_id, amount_usd, schedule_weeks,
        past_score, price_score, overall_score, status
      ) values (
        ${uid}, ${data.project_id}, ${data.company_id}, ${data.amount_usd},
        ${data.schedule_weeks}, ${data.past_score}, ${data.price_score},
        ${data.overall_score}, ${data.status}
      )
    `;
    await logActivity(
      sql,
      uid,
      "bid",
      `${company.name} bid on ${project.name}`,
      `$${data.amount_usd.toLocaleString()}`,
    );
  });

export const awardBid = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    const uid = context.userId;
    const [bid] = await sql<{ id: number; project_id: number; company_id: number }>`
      select id, project_id, company_id from bids
      where id = ${data.id} and user_id = ${uid}
    `;
    if (!bid) throw new Error("Bid not found");
    await sql`
      update bids set status = 'declined'
      where project_id = ${bid.project_id} and user_id = ${uid} and id <> ${bid.id}
        and status <> 'declined'
    `;
    await sql`
      update bids set status = 'awarded'
      where id = ${bid.id} and user_id = ${uid}
    `;
    await sql`
      update projects set status = 'awarded'
      where id = ${bid.project_id} and user_id = ${uid}
    `;
    const [names] = await sql<{ project: string; company: string }>`
      select p.name as project, c.name as company
      from projects p, companies c
      where p.id = ${bid.project_id} and c.id = ${bid.company_id}
    `;
    await logActivity(
      sql,
      uid,
      "award",
      `Awarded ${names?.project ?? "project"} to ${names?.company ?? "company"}`,
    );
  });

export const setBidStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; status: BidStatus }) => d)
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    if (data.status === "awarded") {
      // go through award path
      return;
    }
    await sql`
      update bids set status = ${data.status}
      where id = ${data.id} and user_id = ${context.userId}
    `;
  });

export const listSupply = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready(context.userId);
    return sql<SupplyOrder>`
      select id, sku, material, category, qty, unit, unit_price_cents, vendor,
             status, created_at::text as created_at
      from supply_orders
      where user_id = ${context.userId}
      order by id desc
    `;
  });

export const upsertSupply = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: {
    sku: string;
    material: string;
    category: string;
    qty: number;
    unit: string;
    unit_price_cents: number;
    vendor: string;
    status: SupplyStatus;
  }) => {
    if (!d.material.trim()) throw new Error("Material is required");
    return { ...d, material: d.material.trim(), sku: d.sku.trim() || "NEW" };
  })
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    await sql`
      insert into supply_orders (
        user_id, sku, material, category, qty, unit, unit_price_cents, vendor, status
      ) values (
        ${context.userId}, ${data.sku}, ${data.material}, ${data.category},
        ${data.qty}, ${data.unit}, ${data.unit_price_cents}, ${data.vendor}, ${data.status}
      )
    `;
    await logActivity(
      sql,
      context.userId,
      "supply",
      `New ${data.category.toLowerCase()} order · ${data.material}`,
      data.vendor,
    );
  });

export const setSupplyStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: number; status: SupplyStatus }) => d)
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    const [row] = await sql<{ material: string }>`
      update supply_orders set status = ${data.status}
      where id = ${data.id} and user_id = ${context.userId}
      returning material
    `;
    if (row) {
      await logActivity(
        sql,
        context.userId,
        "supply",
        `${row.material} → ${data.status}`,
      );
    }
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready(context.userId);
    const [row] = await sql<WorkspaceSettings>`
      select org_name, contact_email, phone, city
      from workspace_settings where user_id = ${context.userId}
    `;
    return (
      row ?? {
        org_name: "D&J Stratagem, Inc.",
        contact_email: "hello@djstratageminc.com",
        phone: "(562) 375-7470",
        city: "Los Angeles, CA",
      }
    );
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: WorkspaceSettings) => {
    if (!d.org_name.trim()) throw new Error("Organization name is required");
    return d;
  })
  .handler(async ({ context, data }) => {
    const sql = await ready(context.userId);
    await sql`
      insert into workspace_settings (user_id, org_name, contact_email, phone, city)
      values (${context.userId}, ${data.org_name}, ${data.contact_email}, ${data.phone}, ${data.city})
      on conflict (user_id) do update set
        org_name = excluded.org_name,
        contact_email = excluded.contact_email,
        phone = excluded.phone,
        city = excluded.city
    `;
  });
