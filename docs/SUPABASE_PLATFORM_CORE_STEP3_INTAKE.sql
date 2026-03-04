-- Platform Core — Intake-First Architecture
-- ARCHITECTURE HARDENING — STEP 3

begin;

create table if not exists public.intakes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  address text,
  is_online boolean not null default false,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'validated', 'converted')),
  workspace_id uuid references public.workspaces(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_intakes_organization_id on public.intakes (organization_id);
create index if not exists idx_intakes_workspace_id on public.intakes (workspace_id);

alter table public.intakes enable row level security;
alter table public.intakes force row level security;

create policy intakes_org_isolation_select
  on public.intakes
  for select
  using (organization_id = public.current_user_organization_id());

create policy intakes_org_isolation_insert
  on public.intakes
  for insert
  with check (organization_id = public.current_user_organization_id());

create policy intakes_org_isolation_update
  on public.intakes
  for update
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

create policy intakes_org_isolation_delete
  on public.intakes
  for delete
  using (organization_id = public.current_user_organization_id());

commit;
