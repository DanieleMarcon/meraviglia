-- Platform Core — Invite + Membership Lifecycle (M2-B)
-- Scope: minimal DB support for invite flow, activation, lifecycle tracking, and admin/member assignment.
-- Principle: keep single-org model, keep RLS primary, and keep activation deterministic and idempotent.

begin;

-- 1) Membership lifecycle support on public.users (single-org only).
-- invited: user exists but is not yet active in an org.
-- active: user can resolve org context and operate under existing RLS.
-- removed: user kept for history but org context resolution is disabled.
alter table public.users
  alter column organization_id drop not null;

alter table public.users
  add column if not exists membership_status text not null default 'active';

update public.users
set membership_status = case
  when membership_status in ('invited', 'active', 'removed') then membership_status
  when organization_id is null then 'invited'
  else 'active'
end;

alter table public.users
  drop constraint if exists users_membership_status_check;

alter table public.users
  add constraint users_membership_status_check
  check (membership_status in ('invited', 'active', 'removed'));

-- Enforce lifecycle/org consistency explicitly:
-- - active  => org required
-- - invited => org must be null
-- - removed => org may remain for history/traceability
alter table public.users
  drop constraint if exists users_membership_org_consistency_check;

alter table public.users
  add constraint users_membership_org_consistency_check
  check (
    (membership_status = 'active' and organization_id is not null)
    or (membership_status = 'invited' and organization_id is null)
    or (membership_status = 'removed')
  );

-- Org context must only resolve for active members.
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
    and u.membership_status = 'active'
  limit 1;
$$;

-- Users RLS compatibility note under invited/active/removed lifecycle:
-- Existing users policies from Step 6 remain valid without redesign because:
-- - invited users (organization_id null) do not satisfy org-scoped predicates;
-- - removed users are denied org context by current_user_organization_id();
-- - active users preserve existing org-scoped behavior.

-- Allow auth bootstrap without forced org assignment.
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

  insert into public.users (id, organization_id, email, full_name, membership_status)
  values (
    new.id,
    v_organization_id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when v_organization_id is null then 'invited' else 'active' end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.users.full_name);

  return new;
end;
$$;

-- 2) Invite storage model (email-bound, admin/member only).
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  invite_token uuid not null unique default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null,
  status text not null default 'invited',
  invited_by_user_id uuid not null references public.users(id) on delete restrict,
  used_by_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  constraint invites_role_check check (role in ('admin', 'member')),
  constraint invites_status_check check (status in ('invited', 'used', 'expired'))
);

create unique index if not exists ux_invites_org_email_open
  on public.invites (organization_id, lower(email))
  where status = 'invited';

create index if not exists idx_invites_org_status
  on public.invites (organization_id, status);

create index if not exists idx_invites_email_status
  on public.invites (lower(email), status);

alter table public.invites enable row level security;
alter table public.invites force row level security;

drop policy if exists invites_admin_insert on public.invites;
drop policy if exists invites_admin_read_org on public.invites;
drop policy if exists invites_invitee_read_own on public.invites;
drop policy if exists invites_admin_update_org on public.invites;
drop policy if exists invites_admin_delete_org on public.invites;

create policy invites_admin_insert
  on public.invites
  for insert
  with check (
    organization_id = public.current_user_organization_id()
    and invited_by_user_id = auth.uid()
    and public.has_role('admin')
    and role in ('admin', 'member')
    and status = 'invited'
  );

create policy invites_admin_read_org
  on public.invites
  for select
  using (
    organization_id = public.current_user_organization_id()
    and public.has_role('admin')
  );

create policy invites_invitee_read_own
  on public.invites
  for select
  using (
    status = 'invited'
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy invites_admin_update_org
  on public.invites
  for update
  using (
    organization_id = public.current_user_organization_id()
    and public.has_role('admin')
  )
  with check (
    organization_id = public.current_user_organization_id()
    and public.has_role('admin')
    and role in ('admin', 'member')
    and status in ('invited', 'used', 'expired')
  );

create policy invites_admin_delete_org
  on public.invites
  for delete
  using (
    organization_id = public.current_user_organization_id()
    and public.has_role('admin')
  );

-- 3) Activation function.
-- Validates invite token + email binding, activates membership, and assigns role.
create or replace function public.activate_invite(target_invite_token uuid)
returns public.invites
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.invites%rowtype;
  v_user public.users%rowtype;
  v_auth_email text;
  v_role_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select au.email
    into v_auth_email
  from auth.users au
  where au.id = auth.uid();

  if v_auth_email is null then
    raise exception 'authenticated user email is required';
  end if;

  select *
    into v_invite
  from public.invites i
  where i.invite_token = target_invite_token
  for update;

  if not found then
    raise exception 'invite not found';
  end if;

  if lower(v_invite.email) <> lower(v_auth_email) then
    raise exception 'invite email mismatch';
  end if;

  if v_invite.status = 'used' then
    if v_invite.used_by_user_id = auth.uid() then
      return v_invite;
    end if;

    raise exception 'invite already used';
  end if;

  if v_invite.status <> 'invited' then
    raise exception 'invite is not activatable';
  end if;

  select *
    into v_user
  from public.users u
  where u.id = auth.uid()
  for update;

  if not found then
    raise exception 'profile row not found for authenticated user';
  end if;

  if v_user.organization_id is not null and v_user.organization_id <> v_invite.organization_id then
    raise exception 'user already belongs to another organization';
  end if;

  update public.users
  set organization_id = v_invite.organization_id,
      membership_status = 'active',
      updated_at = now()
  where id = auth.uid();

  select r.id
    into v_role_id
  from public.roles r
  where r.organization_id = v_invite.organization_id
    and r.role_name = v_invite.role;

  if v_role_id is null then
    raise exception 'target role not found in organization';
  end if;

  insert into public.user_roles (user_id, role_id)
  values (auth.uid(), v_role_id)
  on conflict (user_id, role_id) do nothing;

  update public.invites
  set status = 'used',
      used_by_user_id = auth.uid(),
      used_at = now()
  where id = v_invite.id
  returning * into v_invite;

  return v_invite;
end;
$$;

grant execute on function public.activate_invite(uuid) to authenticated;

-- 4) Admin removal helper (active -> removed).
-- Keeps user row for history, removes all org roles, disables org context resolution.
create or replace function public.remove_membership(target_user_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if not public.has_role('admin') then
    raise exception 'admin role required';
  end if;

  v_org_id := public.current_user_organization_id();

  if v_org_id is null then
    raise exception 'active organization context required';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'admin self-removal is not allowed';
  end if;

  update public.users
  set membership_status = 'removed',
      updated_at = now()
  where id = target_user_id
    and organization_id = v_org_id;

  delete from public.user_roles ur
  using public.roles r
  where ur.role_id = r.id
    and ur.user_id = target_user_id
    and r.organization_id = v_org_id;
end;
$$;

grant execute on function public.remove_membership(uuid) to authenticated;

commit;
