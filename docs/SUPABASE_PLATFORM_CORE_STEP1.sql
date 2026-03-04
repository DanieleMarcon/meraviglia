-- Platform Core — Brand-Agnostic Architecture
-- ARCHITECTURE HARDENING — STEP 1

begin;

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role_name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, role_name)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_name text not null,
  workspace_slug text not null,
  created_by_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, workspace_slug)
);

create index if not exists idx_users_organization_id on public.users (organization_id);
create index if not exists idx_roles_organization_id on public.roles (organization_id);
create index if not exists idx_user_roles_role_id on public.user_roles (role_id);
create index if not exists idx_workspaces_organization_id on public.workspaces (organization_id);
create index if not exists idx_workspaces_created_by_user_id on public.workspaces (created_by_user_id);

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organization_id uuid;
begin
  v_organization_id := nullif(new.raw_user_meta_data ->> 'organization_id', '')::uuid;

  if v_organization_id is null then
    raise exception 'organization_id is required in auth.users metadata for platform onboarding';
  end if;

  insert into public.users (id, organization_id, email, full_name)
  values (
    new.id,
    v_organization_id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

create or replace function public.current_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.organization_id
  from public.users u
  where u.id = auth.uid()
  limit 1;
$$;

alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.workspaces enable row level security;

alter table public.users force row level security;
alter table public.roles force row level security;
alter table public.user_roles force row level security;
alter table public.workspaces force row level security;

create policy users_org_isolation_select
  on public.users
  for select
  using (organization_id = public.current_user_organization_id());

create policy users_org_isolation_insert
  on public.users
  for insert
  with check (organization_id = public.current_user_organization_id());

create policy users_org_isolation_update
  on public.users
  for update
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

create policy users_org_isolation_delete
  on public.users
  for delete
  using (organization_id = public.current_user_organization_id());

create policy roles_org_isolation_select
  on public.roles
  for select
  using (organization_id = public.current_user_organization_id());

create policy roles_org_isolation_insert
  on public.roles
  for insert
  with check (organization_id = public.current_user_organization_id());

create policy roles_org_isolation_update
  on public.roles
  for update
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

create policy roles_org_isolation_delete
  on public.roles
  for delete
  using (organization_id = public.current_user_organization_id());

create policy user_roles_org_isolation_select
  on public.user_roles
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = user_roles.user_id
        and u.organization_id = public.current_user_organization_id()
    )
    and exists (
      select 1
      from public.roles r
      where r.id = user_roles.role_id
        and r.organization_id = public.current_user_organization_id()
    )
  );

create policy user_roles_org_isolation_insert
  on public.user_roles
  for insert
  with check (
    exists (
      select 1
      from public.users u
      where u.id = user_roles.user_id
        and u.organization_id = public.current_user_organization_id()
    )
    and exists (
      select 1
      from public.roles r
      where r.id = user_roles.role_id
        and r.organization_id = public.current_user_organization_id()
    )
  );

create policy user_roles_org_isolation_delete
  on public.user_roles
  for delete
  using (
    exists (
      select 1
      from public.users u
      where u.id = user_roles.user_id
        and u.organization_id = public.current_user_organization_id()
    )
    and exists (
      select 1
      from public.roles r
      where r.id = user_roles.role_id
        and r.organization_id = public.current_user_organization_id()
    )
  );

create policy workspaces_org_isolation_select
  on public.workspaces
  for select
  using (organization_id = public.current_user_organization_id());

create policy workspaces_org_isolation_insert
  on public.workspaces
  for insert
  with check (organization_id = public.current_user_organization_id());

create policy workspaces_org_isolation_update
  on public.workspaces
  for update
  using (organization_id = public.current_user_organization_id())
  with check (organization_id = public.current_user_organization_id());

create policy workspaces_org_isolation_delete
  on public.workspaces
  for delete
  using (organization_id = public.current_user_organization_id());

insert into public.permissions (permission_key, description)
values
  ('workspace.create', 'Create workspaces'),
  ('workspace.read', 'Read workspaces'),
  ('workspace.update', 'Update workspaces'),
  ('workspace.delete', 'Delete workspaces'),
  ('intake.create', 'Create intake records'),
  ('intake.read', 'Read intake records'),
  ('intake.update', 'Update intake records'),
  ('blueprint.create', 'Create strategic blueprints'),
  ('blueprint.update', 'Update strategic blueprints'),
  ('roi.view', 'View ROI outputs')
on conflict (permission_key) do nothing;

commit;
