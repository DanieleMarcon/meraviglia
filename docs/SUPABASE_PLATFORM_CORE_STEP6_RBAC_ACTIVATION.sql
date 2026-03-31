-- Platform Core — RBAC Activation (M1 -> M2)
-- Scope: activate existing org-scoped RBAC with minimal deterministic enforcement.
-- Principle: keep RLS primary, keep business tables org-scoped, make access-control mutations admin-gated.

begin;

-- 1) Minimal helper functions for RBAC checks.
create or replace function public.has_role(target_role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.organization_id = public.current_user_organization_id()
      and r.role_name = target_role_name
  );
$$;

create or replace function public.has_permission(target_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid()
      and r.organization_id = public.current_user_organization_id()
      and p.permission_key = target_permission_key
  );
$$;

-- 2) Seed minimal permission vocabulary (milestone-safe, explicit, non-inflated).
insert into public.permissions (permission_key, description)
values
  ('organization.read', 'Read current organization metadata'),
  ('workspace.manage', 'Create/update/delete workspaces inside organization'),
  ('intake.manage', 'Create/update/delete intakes inside organization'),
  ('contact.manage', 'Create/update/delete contacts inside organization'),
  ('interaction.manage', 'Create/update/delete interactions inside organization'),
  ('rbac.manage', 'Manage roles, role-permissions, and role assignments inside organization')
on conflict (permission_key) do nothing;

-- 3) Ensure minimal role model is present per organization: admin + member.
insert into public.roles (organization_id, role_name, description)
select o.id, 'member', 'Default non-admin role for operational collaboration'
from public.organizations o
on conflict (organization_id, role_name) do nothing;

-- 4) Bind permissions to admin/member roles.
-- Admin: all current milestone permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'organization.read',
  'workspace.manage',
  'intake.manage',
  'contact.manage',
  'interaction.manage',
  'rbac.manage'
)
where r.role_name = 'admin'
on conflict (role_id, permission_id) do nothing;

-- Member: operational permissions only (no RBAC management).
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.permission_key in (
  'organization.read',
  'workspace.manage',
  'intake.manage',
  'contact.manage',
  'interaction.manage'
)
where r.role_name = 'member'
on conflict (role_id, permission_id) do nothing;

-- 5) RBAC enforcement on access-control tables.
-- Roles: read org-scoped; write admin only.
drop policy if exists roles_org_isolation_insert on public.roles;
drop policy if exists roles_org_isolation_update on public.roles;
drop policy if exists roles_org_isolation_delete on public.roles;

create policy roles_admin_insert
  on public.roles
  for insert
  with check (
    organization_id = public.current_user_organization_id()
    and public.has_permission('rbac.manage')
  );

create policy roles_admin_update
  on public.roles
  for update
  using (
    organization_id = public.current_user_organization_id()
    and public.has_permission('rbac.manage')
  )
  with check (
    organization_id = public.current_user_organization_id()
    and public.has_permission('rbac.manage')
  );

create policy roles_admin_delete
  on public.roles
  for delete
  using (
    organization_id = public.current_user_organization_id()
    and public.has_permission('rbac.manage')
  );

-- Permissions catalog: read allowed for authenticated app users, writes admin only.
alter table public.permissions enable row level security;
alter table public.permissions force row level security;

drop policy if exists permissions_read_authenticated on public.permissions;
drop policy if exists permissions_admin_insert on public.permissions;
drop policy if exists permissions_admin_update on public.permissions;
drop policy if exists permissions_admin_delete on public.permissions;

create policy permissions_read_authenticated
  on public.permissions
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid()
        and u.organization_id = public.current_user_organization_id()
    )
  );

create policy permissions_admin_insert
  on public.permissions
  for insert
  with check (public.has_permission('rbac.manage'));

create policy permissions_admin_update
  on public.permissions
  for update
  using (public.has_permission('rbac.manage'))
  with check (public.has_permission('rbac.manage'));

create policy permissions_admin_delete
  on public.permissions
  for delete
  using (public.has_permission('rbac.manage'));

-- Role-permission links: read org-scoped; writes admin only.
alter table public.role_permissions enable row level security;
alter table public.role_permissions force row level security;

drop policy if exists role_permissions_org_isolation_select on public.role_permissions;
drop policy if exists role_permissions_org_isolation_insert on public.role_permissions;
drop policy if exists role_permissions_org_isolation_delete on public.role_permissions;

create policy role_permissions_org_read
  on public.role_permissions
  for select
  using (
    exists (
      select 1
      from public.roles r
      where r.id = role_permissions.role_id
        and r.organization_id = public.current_user_organization_id()
    )
  );

create policy role_permissions_admin_insert
  on public.role_permissions
  for insert
  with check (
    public.has_permission('rbac.manage')
    and exists (
      select 1
      from public.roles r
      where r.id = role_permissions.role_id
        and r.organization_id = public.current_user_organization_id()
    )
  );

create policy role_permissions_admin_delete
  on public.role_permissions
  for delete
  using (
    public.has_permission('rbac.manage')
    and exists (
      select 1
      from public.roles r
      where r.id = role_permissions.role_id
        and r.organization_id = public.current_user_organization_id()
    )
  );

-- User-role links: read org-scoped; writes admin only.
drop policy if exists user_roles_org_isolation_insert on public.user_roles;
drop policy if exists user_roles_org_isolation_delete on public.user_roles;

create policy user_roles_admin_insert
  on public.user_roles
  for insert
  with check (
    public.has_permission('rbac.manage')
    and exists (
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

create policy user_roles_admin_delete
  on public.user_roles
  for delete
  using (
    public.has_permission('rbac.manage')
    and exists (
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

-- Users table hardening for single-org client runtime:
-- - org users remain visible inside org
-- - self profile update remains allowed
-- - cross-user mutation becomes admin-gated
-- - direct inserts are disabled (auth trigger remains source of truth)
drop policy if exists users_org_isolation_insert on public.users;
drop policy if exists users_org_isolation_update on public.users;
drop policy if exists users_org_isolation_delete on public.users;

create policy users_no_direct_insert
  on public.users
  for insert
  with check (false);

create policy users_self_or_admin_update
  on public.users
  for update
  using (
    organization_id = public.current_user_organization_id()
    and (id = auth.uid() or public.has_permission('rbac.manage'))
  )
  with check (
    organization_id = public.current_user_organization_id()
    and (id = auth.uid() or public.has_permission('rbac.manage'))
  );

create policy users_admin_delete
  on public.users
  for delete
  using (
    organization_id = public.current_user_organization_id()
    and public.has_permission('rbac.manage')
  );

-- Organizations table: keep org-scoped read; admin-only update; no client insert/delete.
alter table public.organizations enable row level security;
alter table public.organizations force row level security;

drop policy if exists organizations_org_isolation_select on public.organizations;
drop policy if exists organizations_org_isolation_insert on public.organizations;
drop policy if exists organizations_org_isolation_update on public.organizations;
drop policy if exists organizations_org_isolation_delete on public.organizations;

create policy organizations_org_read
  on public.organizations
  for select
  using (id = public.current_user_organization_id());

create policy organizations_admin_update
  on public.organizations
  for update
  using (
    id = public.current_user_organization_id()
    and public.has_permission('rbac.manage')
  )
  with check (
    id = public.current_user_organization_id()
    and public.has_permission('rbac.manage')
  );

create policy organizations_no_client_insert
  on public.organizations
  for insert
  with check (false);

create policy organizations_no_client_delete
  on public.organizations
  for delete
  using (false);

commit;
