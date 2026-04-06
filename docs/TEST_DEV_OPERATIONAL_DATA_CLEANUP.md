# Test/Dev Operational Data Cleanup (Safe Access-Preserving Reset)

## 1) Summary
This cleanup removes **operational test/demo records** (entries/intakes, workspaces, contacts, interactions, and interaction participants) while preserving the **authentication and organization access backbone** required for users to sign in and open the app.

This is intentionally a **data cleanup only** operation:
- no schema changes
- no migration changes
- no auth reset
- no user deletion

## 2) Table analysis

### Preserved (login/access backbone)
- `auth.users` (Supabase auth identities)
- `public.users` (app profile + membership state)
- `public.organizations` (tenant root)
- `public.roles` (org roles)
- `public.user_roles` (user-role linkage)
- `public.permissions` and `public.role_permissions` (RBAC capability graph)
- `public.invites` (kept to avoid disrupting pending invite activation paths)

### Cleared (operational test/demo data)
- `public.interaction_participants`
- `public.interactions`
- `public.contacts`
- `public.intakes`
- `public.workspaces`

### Dependency notes (why this delete order)
- `interaction_participants` depends on both `interactions` and `contacts` (`ON DELETE CASCADE` exists, but we still delete explicitly for deterministic review).
- `interactions` depends on `workspaces` and `organizations`.
- `contacts` depends on `workspaces` and `organizations`.
- `intakes` depends on `organizations` and optionally references `workspaces` (`ON DELETE SET NULL`), so deleting `intakes` explicitly prevents orphaned historical intake rows.
- `workspaces` can be removed only after workspace-scoped artifacts are removed.

## 3) Exact SQL cleanup script
Use:
- `docs/TEST_DEV_OPERATIONAL_DATA_CLEANUP.sql`

The script includes:
- explicit safety guard requiring a concrete target org UUID
- pre-check row counts
- ordered deletes
- post-check row counts
- access-backbone integrity checks
- optional local-only full reset variant

## 4) Verification queries
The SQL file already includes verification blocks; if you want standalone checks:

```sql
-- A) Operational tables must be empty for target org
with target_org as (select '<ORG_UUID>'::uuid as organization_id)
select 'workspaces' table_name, count(*) row_count from public.workspaces w join target_org t on t.organization_id = w.organization_id
union all
select 'intakes', count(*) from public.intakes i join target_org t on t.organization_id = i.organization_id
union all
select 'contacts', count(*) from public.contacts c join target_org t on t.organization_id = c.organization_id
union all
select 'interactions', count(*) from public.interactions i join target_org t on t.organization_id = i.organization_id
union all
select 'interaction_participants', count(*) from public.interaction_participants ip join target_org t on t.organization_id = ip.organization_id;

-- B) Users still exist in target org
select count(*) as users_in_org
from public.users
where organization_id = '<ORG_UUID>'::uuid;

-- C) Login-supporting org structures still exist
select
  (select count(*) from public.organizations o where o.id = '<ORG_UUID>'::uuid) as organizations_present,
  (select count(*) from public.roles r where r.organization_id = '<ORG_UUID>'::uuid) as roles_present,
  (select count(*) from public.user_roles ur join public.users u on u.id = ur.user_id where u.organization_id = '<ORG_UUID>'::uuid) as user_roles_present;
```

## 5) Execution notes

### Local execution (recommended during stabilization)
1. Open `docs/TEST_DEV_OPERATIONAL_DATA_CLEANUP.sql`.
2. Replace all placeholder UUID values (`00000000-0000-0000-0000-000000000000`) with the local org UUID.
3. Execute in Supabase SQL editor (or `psql`) against local dev DB.
4. Confirm post-cleanup verification blocks return:
   - operational tables = `0`
   - users/roles/user_roles/org counts are still valid for login

If local is strictly single-tenant disposable, you may use the local-only variant at the bottom of the script.

### Remote dev/test execution (shared environment)
1. **Do not run global delete statements.**
2. Use only the target-org cleanup path with explicit org UUID.
3. Execute during a low-traffic window for the shared environment.
4. Save pre/post result snapshots from the verification blocks in deployment notes.

## 6) Dry-run reasoning note
Expected qualitative impact by table (target org):
- `interaction_participants`: all rows tied to workspace interactions removed
- `interactions`: all operational event history removed
- `contacts`: all relationship records removed
- `intakes`: all entry/intake pipeline records removed
- `workspaces`: all operational contexts removed
- access/auth tables: unchanged

## 7) Post-cleanup app sanity checks
After SQL execution, verify in app:
1. existing user can still sign in
2. organization context loads (no unauthorized membership regression)
3. user can open app shell and create fresh intake/workspace/contact/interaction records from clean state
