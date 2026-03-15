-- Platform Core — Scheduling Foundation v1
-- ARCHITECTURE HARDENING — STEP 5

begin;

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null check (type in ('meeting', 'call', 'follow_up')),
  scheduled_at timestamptz not null,
  status text not null default 'planned' check (status in ('planned', 'completed', 'cancelled')),
  provenance text not null default 'manual' check (provenance in ('manual', 'from_calendar_sync', 'from_ai_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interaction_participants (
  interaction_id uuid not null references public.interactions(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (interaction_id, contact_id)
);

create index if not exists idx_interactions_organization_id on public.interactions (organization_id);
create index if not exists idx_interactions_workspace_id on public.interactions (workspace_id);
create index if not exists idx_interactions_scheduled_at on public.interactions (scheduled_at);
create index if not exists idx_interaction_participants_contact_id on public.interaction_participants (contact_id);

alter table public.interactions enable row level security;
alter table public.interactions force row level security;

create policy interactions_org_isolation_select
  on public.interactions
  for select
  using (organization_id = public.current_user_organization_id());

create policy interactions_org_isolation_insert
  on public.interactions
  for insert
  with check (organization_id = public.current_user_organization_id());

create policy interactions_org_isolation_update
  on public.interactions
  for update
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

create policy interactions_org_isolation_delete
  on public.interactions
  for delete
  using (organization_id = public.current_user_organization_id());

alter table public.interaction_participants enable row level security;
alter table public.interaction_participants force row level security;

create policy interaction_participants_org_isolation_select
  on public.interaction_participants
  for select
  using (
    exists (
      select 1
      from public.interactions i
      where i.id = interaction_participants.interaction_id
        and i.organization_id = public.current_user_organization_id()
    )
  );

create policy interaction_participants_org_isolation_insert
  on public.interaction_participants
  for insert
  with check (
    exists (
      select 1
      from public.interactions i
      where i.id = interaction_participants.interaction_id
        and i.organization_id = public.current_user_organization_id()
    )
    and exists (
      select 1
      from public.contacts c
      join public.interactions i on i.id = interaction_participants.interaction_id
      where c.id = interaction_participants.contact_id
        and c.workspace_id = i.workspace_id
        and c.organization_id = public.current_user_organization_id()
    )
  );

create policy interaction_participants_org_isolation_delete
  on public.interaction_participants
  for delete
  using (
    exists (
      select 1
      from public.interactions i
      where i.id = interaction_participants.interaction_id
        and i.organization_id = public.current_user_organization_id()
    )
  );

commit;

drop trigger if exists trg_interactions_set_updated_at on public.interactions;
create trigger trg_interactions_set_updated_at
before update on public.interactions
for each row
execute function public.set_updated_at();
