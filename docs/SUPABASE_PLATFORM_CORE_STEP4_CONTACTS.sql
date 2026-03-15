-- Platform Core — Contacts Foundation v1
-- ARCHITECTURE HARDENING — STEP 4

begin;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  role text,
  provenance text not null default 'manual' check (provenance in ('manual', 'from_intake', 'from_ai_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contacts_organization_id on public.contacts (organization_id);
create index if not exists idx_contacts_workspace_id on public.contacts (workspace_id);

alter table public.contacts enable row level security;
alter table public.contacts force row level security;

create policy contacts_org_isolation_select
  on public.contacts
  for select
  using (organization_id = public.current_user_organization_id());

create policy contacts_org_isolation_insert
  on public.contacts
  for insert
  with check (organization_id = public.current_user_organization_id());

create policy contacts_org_isolation_update
  on public.contacts
  for update
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

create policy contacts_org_isolation_delete
  on public.contacts
  for delete
  using (organization_id = public.current_user_organization_id());

commit;

-- updated_at trigger

drop trigger if exists trg_contacts_set_updated_at on public.contacts;
create trigger trg_contacts_set_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();
