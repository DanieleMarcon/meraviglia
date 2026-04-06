-- TEST/DEV OPERATIONAL DATA CLEANUP (POST-FUV, PRE-USER-TESTING)
--
-- Purpose:
--   Remove operational test/demo data while preserving login and access structures.
--
-- Safety model:
--   1) Preserve auth + access backbone:
--      - auth.users (Supabase auth schema)
--      - public.users
--      - public.organizations
--      - public.roles
--      - public.user_roles
--      - public.permissions
--      - public.role_permissions
--      - public.invites (kept to avoid breaking pending invite flows)
--   2) Clear only operational records:
--      - public.interaction_participants
--      - public.interactions
--      - public.contacts
--      - public.intakes
--      - public.workspaces
--   3) Default to TARGETED org cleanup for shared dev/test.
--
-- IMPORTANT (shared env):
--   Replace the UUID in v_target_org_id and do not run with NULL in shared environments.

begin;

-- ---------------------------------------------------------------------------
-- 0) Guardrail: require explicit target organization in shared environments
-- ---------------------------------------------------------------------------
do $$
declare
  v_target_org_id uuid := '00000000-0000-0000-0000-000000000000'::uuid; -- TODO: replace before execution
begin
  if v_target_org_id = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Safety stop: set v_target_org_id before running cleanup in shared test/dev.';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 1) Pre-cleanup visibility (target org only)
-- ---------------------------------------------------------------------------
with target_org as (
  select '00000000-0000-0000-0000-000000000000'::uuid as organization_id -- TODO: same UUID as above
)
select 'workspaces' as table_name, count(*) as row_count
from public.workspaces w
join target_org t on t.organization_id = w.organization_id
union all
select 'intakes', count(*)
from public.intakes i
join target_org t on t.organization_id = i.organization_id
union all
select 'contacts', count(*)
from public.contacts c
join target_org t on t.organization_id = c.organization_id
union all
select 'interactions', count(*)
from public.interactions i
join target_org t on t.organization_id = i.organization_id
union all
select 'interaction_participants', count(*)
from public.interaction_participants ip
join target_org t on t.organization_id = ip.organization_id
order by table_name;

-- ---------------------------------------------------------------------------
-- 2) Delete workspace-scoped operational data in FK-safe order
--    Explicit ordered deletes are used for deterministic reviewability.
-- ---------------------------------------------------------------------------

-- 2.1 Participants depend on interactions + contacts
with target_org as (
  select '00000000-0000-0000-0000-000000000000'::uuid as organization_id -- TODO: same UUID
)
delete from public.interaction_participants ip
using target_org t
where ip.organization_id = t.organization_id;

-- 2.2 Interactions are workspace-scoped operational history
with target_org as (
  select '00000000-0000-0000-0000-000000000000'::uuid as organization_id -- TODO: same UUID
)
delete from public.interactions i
using target_org t
where i.organization_id = t.organization_id;

-- 2.3 Contacts are workspace-scoped operational relationships
with target_org as (
  select '00000000-0000-0000-0000-000000000000'::uuid as organization_id -- TODO: same UUID
)
delete from public.contacts c
using target_org t
where c.organization_id = t.organization_id;

-- 2.4 Intakes/entries are operational intake records
with target_org as (
  select '00000000-0000-0000-0000-000000000000'::uuid as organization_id -- TODO: same UUID
)
delete from public.intakes i
using target_org t
where i.organization_id = t.organization_id;

-- 2.5 Workspaces (after dependent workspace artifacts are removed)
with target_org as (
  select '00000000-0000-0000-0000-000000000000'::uuid as organization_id -- TODO: same UUID
)
delete from public.workspaces w
using target_org t
where w.organization_id = t.organization_id;

-- ---------------------------------------------------------------------------
-- 3) Optional legacy table cleanup
--    intake_leads is not organization-scoped; enable only if your environment
--    intentionally treats it as disposable operational test data.
-- ---------------------------------------------------------------------------
-- delete from public.intake_leads l
-- where exists (
--   select 1
--   from public.users u
--   where u.id = l.created_by
--     and u.organization_id = '00000000-0000-0000-0000-000000000000'::uuid
-- );

-- ---------------------------------------------------------------------------
-- 4) Post-cleanup verification snapshot (target org)
-- ---------------------------------------------------------------------------
with target_org as (
  select '00000000-0000-0000-0000-000000000000'::uuid as organization_id -- TODO: same UUID
)
select 'workspaces' as table_name, count(*) as row_count
from public.workspaces w
join target_org t on t.organization_id = w.organization_id
union all
select 'intakes', count(*)
from public.intakes i
join target_org t on t.organization_id = i.organization_id
union all
select 'contacts', count(*)
from public.contacts c
join target_org t on t.organization_id = c.organization_id
union all
select 'interactions', count(*)
from public.interactions i
join target_org t on t.organization_id = i.organization_id
union all
select 'interaction_participants', count(*)
from public.interaction_participants ip
join target_org t on t.organization_id = ip.organization_id
order by table_name;

-- ---------------------------------------------------------------------------
-- 5) Access backbone integrity checks (must remain > 0 where expected)
-- ---------------------------------------------------------------------------
with target_org as (
  select '00000000-0000-0000-0000-000000000000'::uuid as organization_id -- TODO: same UUID
)
select
  (select count(*) from public.users u join target_org t on t.organization_id = u.organization_id) as users_in_org,
  (select count(*) from public.roles r join target_org t on t.organization_id = r.organization_id) as roles_in_org,
  (select count(*) from public.user_roles ur join public.users u on u.id = ur.user_id join target_org t on t.organization_id = u.organization_id) as user_roles_in_org,
  (select count(*) from public.organizations o join target_org t on t.organization_id = o.id) as organizations_present;

commit;

-- ---------------------------------------------------------------------------
-- LOCAL-ONLY FULL RESET VARIANT (single-tenant local sandbox only)
-- ---------------------------------------------------------------------------
-- begin;
-- delete from public.interaction_participants;
-- delete from public.interactions;
-- delete from public.contacts;
-- delete from public.intakes;
-- delete from public.workspaces;
-- -- optionally: delete from public.intake_leads;
-- commit;
