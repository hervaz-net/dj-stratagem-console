-- D&J Stratagem operations console
create table if not exists companies (
  id            serial primary key,
  user_id       text not null,
  name          text not null,
  type          text not null,
  trade         text not null,
  city          text not null,
  region        text not null,
  status        text not null,
  match_score   int not null default 0,
  years         int not null default 0,
  contact_name  text not null,
  contact_email text not null,
  notes         text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists companies_user_id_idx on companies (user_id);

create table if not exists projects (
  id            serial primary key,
  user_id       text not null,
  name          text not null,
  client        text not null,
  city          text not null,
  kind          text not null,
  value_usd     int not null,
  status        text not null,
  trade_focus   text not null,
  deadline      date not null,
  match_score   int not null default 0,
  description   text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists projects_user_id_idx on projects (user_id);

create table if not exists bids (
  id             serial primary key,
  user_id        text not null,
  project_id     int not null,
  company_id     int not null,
  amount_usd     int not null,
  schedule_weeks int not null,
  past_score     int not null,
  price_score    int not null,
  overall_score  int not null,
  status         text not null,
  submitted_at   timestamptz not null default now()
);
create index if not exists bids_user_id_idx on bids (user_id);
create index if not exists bids_project_id_idx on bids (project_id);

create table if not exists supply_orders (
  id                serial primary key,
  user_id           text not null,
  sku               text not null,
  material          text not null,
  category          text not null,
  qty               int not null,
  unit              text not null,
  unit_price_cents  int not null,
  vendor            text not null,
  status            text not null,
  created_at        timestamptz not null default now()
);
create index if not exists supply_orders_user_id_idx on supply_orders (user_id);

create table if not exists activities (
  id         serial primary key,
  user_id    text not null,
  kind       text not null,
  title      text not null,
  detail     text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists activities_user_id_idx on activities (user_id);

create table if not exists workspace_settings (
  user_id       text primary key,
  org_name      text not null,
  contact_email text not null,
  phone         text not null,
  city          text not null
);
