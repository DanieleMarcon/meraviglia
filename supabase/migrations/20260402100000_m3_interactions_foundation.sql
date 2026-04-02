-- M3 interactions scheduling foundation (canonical operational migration)
-- Source contract: docs/PRODUCT_M3_INTERACTION_SCHEDULING_FOUNDATION_CONTRACT.md
-- This file is the canonical executable artifact for Supabase CLI workflows.

begin;

-- 1) Interactions table (create-if-missing + normalize-if-existing)

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null,
  scheduled_at timestamptz not null,
  status text not null default 'planned',
  provenance text not null default 'manual',
  notes text,
  status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.interactions
  add column if not exists notes text;

alter table public.interactions
  add column if not exists status_changed_at timestamptz not null default now();

-- Migration/backfill compatibility only: converge legacy spelling to canonical M3 `canceled`.
-- App/repository decode paths may temporarily tolerate legacy `cancelled` reads during rollout.
update public.interactions
set status = 'canceled'
where status = 'cancelled';

update public.interactions
set provenance = 'manual'
where provenance <> 'manual';

alter table public.interactions drop constraint if exists interactions_type_check;
alter table public.interactions drop constraint if exists interactions_status_check;
alter table public.interactions drop constraint if exists interactions_provenance_check;
alter table public.interactions drop constraint if exists interactions_type_m3_check;
alter table public.interactions drop constraint if exists interactions_status_m3_check;
alter table public.interactions drop constraint if exists interactions_provenance_m3_check;

alter table public.interactions
  alter column status set default 'planned';

alter table public.interactions
  alter column provenance set default 'manual';

alter table public.interactions
  add constraint interactions_type_m3_check
  check (type in ('meeting', 'call', 'follow_up'));

alter table public.interactions
  add constraint interactions_status_m3_check
  check (status in ('planned', 'completed', 'canceled'));

alter table public.interactions
  add constraint interactions_provenance_m3_check
  check (provenance = 'manual');

create unique index if not exists uq_interactions_id_workspace_org
  on public.interactions (id, workspace_id, organization_id);

create unique index if not exists uq_workspaces_id_org
  on public.workspaces (id, organization_id);

alter table public.interactions drop constraint if exists interactions_workspace_org_fk;
alter table public.interactions
  add constraint interactions_workspace_org_fk
  foreign key (workspace_id, organization_id)
  references public.workspaces (id, organization_id)
  on delete cascade;

-- 2) Participant linkage table (contact-linked, workspace-safe)

create table if not exists public.interaction_participants (
  interaction_id uuid not null references public.interactions(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  organization_id uuid,
  workspace_id uuid,
  created_at timestamptz not null default now(),
  primary key (interaction_id, contact_id)
);

alter table public.interaction_participants
  add column if not exists organization_id uuid;

alter table public.interaction_participants
  add column if not exists workspace_id uuid;

update public.interaction_participants ip
set
  organization_id = i.organization_id,
  workspace_id = i.workspace_id
from public.interactions i
where i.id = ip.interaction_id
  and (ip.organization_id is null or ip.workspace_id is null);

alter table public.interaction_participants
  alter column organization_id set not null;

alter table public.interaction_participants
  alter column workspace_id set not null;

create or replace function public.sync_interaction_participant_scope()
returns trigger
language plpgsql
as $$
declare
  v_organization_id uuid;
  v_workspace_id uuid;
begin
  select i.organization_id, i.workspace_id
    into v_organization_id, v_workspace_id
  from public.interactions i
  where i.id = new.interaction_id;

  if v_organization_id is null or v_workspace_id is null then
    raise exception 'interaction % not found for participant linkage', new.interaction_id;
  end if;

  new.organization_id := v_organization_id;
  new.workspace_id := v_workspace_id;

  if not exists (
    select 1
    from public.contacts c
    where c.id = new.contact_id
      and c.organization_id = new.organization_id
      and c.workspace_id = new.workspace_id
  ) then
    raise exception
      'contact % must belong to the same workspace/org as interaction %',
      new.contact_id,
      new.interaction_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_interaction_participants_sync_scope on public.interaction_participants;
create trigger trg_interaction_participants_sync_scope
before insert or update of interaction_id, contact_id
on public.interaction_participants
for each row
execute function public.sync_interaction_participant_scope();

create unique index if not exists uq_contacts_id_workspace_org
  on public.contacts (id, workspace_id, organization_id);

alter table public.interaction_participants drop constraint if exists interaction_participants_interaction_workspace_org_fk;
alter table public.interaction_participants
  add constraint interaction_participants_interaction_workspace_org_fk
  foreign key (interaction_id, workspace_id, organization_id)
  references public.interactions (id, workspace_id, organization_id)
  on delete cascade;

alter table public.interaction_participants drop constraint if exists interaction_participants_contact_workspace_org_fk;
alter table public.interaction_participants
  add constraint interaction_participants_contact_workspace_org_fk
  foreign key (contact_id, workspace_id, organization_id)
  references public.contacts (id, workspace_id, organization_id)
  on delete cascade;

-- 3) Status transition correctness (M3 minimal lifecycle)

create or replace function public.enforce_interaction_status_transition()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'planned' then
      raise exception 'M3 interactions must be created with status planned';
    end if;

    new.status_changed_at := coalesce(new.status_changed_at, now());
    return new;
  end if;

  if new.status = old.status then
    return new;
  end if;

  if old.status = 'planned' and new.status in ('completed', 'canceled') then
    new.status_changed_at := now();
    return new;
  end if;

  if old.status in ('completed', 'canceled') and new.status = 'planned' then
    new.status_changed_at := now();
    return new;
  end if;

  raise exception 'Invalid interaction status transition from % to %', old.status, new.status;
end;
$$;

drop trigger if exists trg_interactions_enforce_status_transition on public.interactions;
create trigger trg_interactions_enforce_status_transition
before insert or update of status on public.interactions
for each row
execute function public.enforce_interaction_status_transition();

-- 4) Indexes (minimal + list-by-workspace)

create index if not exists idx_interactions_workspace_status_scheduled_at
  on public.interactions (workspace_id, status, scheduled_at, id);

create index if not exists idx_interactions_workspace_status_changed_desc
  on public.interactions (workspace_id, status, status_changed_at desc, scheduled_at desc, id)
  where status in ('completed', 'canceled');

create index if not exists idx_interaction_participants_workspace_interaction
  on public.interaction_participants (workspace_id, interaction_id);

create index if not exists idx_interaction_participants_contact
  on public.interaction_participants (contact_id);

-- 5) RLS (organization-isolated, workspace-safe linkage)

alter table public.interactions enable row level security;
alter table public.interactions force row level security;

drop policy if exists interactions_org_isolation_select on public.interactions;
drop policy if exists interactions_org_isolation_insert on public.interactions;
drop policy if exists interactions_org_isolation_update on public.interactions;
drop policy if exists interactions_org_isolation_delete on public.interactions;

create policy interactions_org_isolation_select
  on public.interactions
  for select
  using (organization_id = public.current_user_organization_id());

create policy interactions_org_isolation_insert
  on public.interactions
  for insert
  with check (
    organization_id = public.current_user_organization_id()
    and exists (
      select 1
      from public.workspaces w
      where w.id = interactions.workspace_id
        and w.organization_id = interactions.organization_id
    )
  );

create policy interactions_org_isolation_update
  on public.interactions
  for update
  using (organization_id = public.current_user_organization_id())
  with check (
    organization_id = public.current_user_organization_id()
    and exists (
      select 1
      from public.workspaces w
      where w.id = interactions.workspace_id
        and w.organization_id = interactions.organization_id
    )
  );

create policy interactions_org_isolation_delete
  on public.interactions
  for delete
  using (organization_id = public.current_user_organization_id());

alter table public.interaction_participants enable row level security;
alter table public.interaction_participants force row level security;

drop policy if exists interaction_participants_org_isolation_select on public.interaction_participants;
drop policy if exists interaction_participants_org_isolation_insert on public.interaction_participants;
drop policy if exists interaction_participants_org_isolation_delete on public.interaction_participants;
drop policy if exists interaction_participants_org_isolation_update on public.interaction_participants;

create policy interaction_participants_org_isolation_select
  on public.interaction_participants
  for select
  using (organization_id = public.current_user_organization_id());

create policy interaction_participants_org_isolation_insert
  on public.interaction_participants
  for insert
  with check (
    organization_id = public.current_user_organization_id()
  );

create policy interaction_participants_org_isolation_update
  on public.interaction_participants
  for update
  using (organization_id = public.current_user_organization_id())
  with check (
    organization_id = public.current_user_organization_id()
    and exists (
      select 1
      from public.interactions i
      where i.id = interaction_participants.interaction_id
        and i.workspace_id = interaction_participants.workspace_id
        and i.organization_id = interaction_participants.organization_id
    )
    and exists (
      select 1
      from public.contacts c
      where c.id = interaction_participants.contact_id
        and c.workspace_id = interaction_participants.workspace_id
        and c.organization_id = interaction_participants.organization_id
    )
  );

create policy interaction_participants_org_isolation_delete
  on public.interaction_participants
  for delete
  using (organization_id = public.current_user_organization_id());

commit;

-- Standard updated_at trigger alignment

drop trigger if exists trg_interactions_set_updated_at on public.interactions;
create trigger trg_interactions_set_updated_at
before update on public.interactions
for each row
execute function public.set_updated_at();
