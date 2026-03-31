# Supabase RBAC Activation Plan (M1 → M2)

## 1. RBAC Current-State Assessment

- The database already contains the full RBAC schema (`roles`, `permissions`, `role_permissions`, `user_roles`) and organization-scoped tenant isolation via RLS.
- Current policies are mostly organization isolation policies, so RBAC is structurally present but not yet actively enforcing role-sensitive actions.
- Existing live data confirms baseline viability (2 organizations, 1 user, 1 admin role, 1 assignment), which is enough to activate deterministic enforcement without redesign.
- Current risk: any authenticated user in an organization can perform mutations on sensitive access-control data if those tables are only org-scoped.

## 2. Recommended Minimal Role Model

Use exactly two roles now:

- `admin`
  - Organization operator role with RBAC administration capability.
  - Can manage role assignments and role-permission mapping.
- `member`
  - Default non-admin collaborator.
  - Can operate product data in organization scope.
  - Cannot mutate RBAC structures.

Why this is sufficient now:

- Matches current product maturity (no invite flow, no org switching, no org access UI).
- Keeps behavior deterministic and understandable.
- Avoids role proliferation before Organization & Access Management is product-ready.

## 3. Recommended Minimal Permission Set

Activate a minimal explicit vocabulary:

- `organization.read`
- `workspace.manage`
- `intake.manage`
- `contact.manage`
- `interaction.manage`
- `rbac.manage`

Assignment model now:

- `admin`: all six permissions.
- `member`: all except `rbac.manage`.

Notes:

- Keep existing legacy permission keys for backward compatibility; do not remove in this milestone.
- Use the new set as canonical for enforcement starting now.

## 4. What Should Be Role-Enforced Now

Role-aware enforcement should start only on security-sensitive / administration surfaces:

- `roles`: INSERT/UPDATE/DELETE gated by `rbac.manage`.
- `role_permissions`: INSERT/DELETE gated by `rbac.manage`.
- `user_roles`: INSERT/DELETE gated by `rbac.manage`.
- `permissions`: INSERT/UPDATE/DELETE gated by `rbac.manage`.
- `users` mutations:
  - self-update allowed,
  - cross-user update/delete gated by `rbac.manage`.
- `organizations` mutation:
  - org-scoped UPDATE gated by `rbac.manage`,
  - client INSERT/DELETE denied.

This creates active RBAC without expanding architecture.

## 5. What Should Remain Org-Scoped Only For Now

Keep these tables organization-isolated with no role split yet:

- `workspaces`
- `intakes`
- `contacts`
- `interactions`
- `interaction_participants`
- `intake_leads` (if active in current build)

Reason:

- Current milestone needs secure tenant isolation and deterministic RBAC activation, not feature-level operation segmentation.
- Product-level separation (e.g., workspace editor vs viewer) should wait until access UX and membership lifecycle exist.

## 6. Recommended SQL Activation Plan

Apply `docs/SUPABASE_PLATFORM_CORE_STEP6_RBAC_ACTIVATION.sql` as the minimal activation patch:

1. Add narrow helper functions:
   - `public.has_role(role_name)`
   - `public.has_permission(permission_key)`
2. Seed minimal permission vocabulary (`organization.read`, `*.manage`, `rbac.manage`).
3. Ensure `member` role exists in each organization.
4. Seed `role_permissions`:
   - admin gets full set,
   - member gets operational set (no `rbac.manage`).
5. Update RLS policies to make access-control table mutations admin-gated.
6. Harden `users` and `organizations` mutation policies to avoid broad org-level write access.

Execution notes:

- Run in a transaction (`begin`/`commit`) as provided.
- Idempotent seed logic uses `on conflict do nothing`.
- Policy changes use `drop policy if exists` for deterministic re-runs.

## 7. Future Backlog / Explicitly Postponed

Postpone to Organization & Access Management slice:

- invite flow and membership lifecycle UX,
- role-assignment/admin UI,
- organization switching UX,
- custom role templates beyond admin/member,
- fine-grained operation permissions (`*.read`/`*.create`/`*.update`/`*.delete` split),
- audit subsystem for privileged operations,
- network/super-admin governance,
- server-side privileged authorization layer.

## 8. Architectural Notes

- Preserves Architecture Freeze and client-only runtime assumptions.
- Keeps RLS as primary enforcement mechanism.
- Uses existing RBAC schema; no new modules, services, or Edge Functions.
- Preserves single-organization membership model.
- Prevents overengineering while still moving RBAC from passive to active.

## 9. Documentation Impact Check

Recommended documentation actions with this activation:

- Update `docs/SUPABASE_DATABASE_ARCHITECTURE_STATUS.md`:
  - move RBAC from “schema present” to “active enforcement (admin-gated RBAC mutations)”.
- Update `docs/ROADMAP_PHASES.md`:
  - mark RBAC activation as completed milestone transition item when SQL is applied.
- Optional: add a short “RBAC enforcement now” note in `docs/PLATFORM_DATA_MODEL.md` future extensibility section.

## 10. Known Risks / Tradeoffs

- `member` is intentionally broad on operational data (`*.manage`) to keep milestone small; this is a conscious tradeoff.
- Existing legacy permission keys remain in catalog; temporary duplication is tolerated to avoid migration churn.
- `users`/`organizations` mutation tightening may require minor client adjustments if current UI assumed broad org-level writes.
- No audit log yet: privileged changes are protected but not fully auditable in this milestone.
- Helper-function-based policy checks add limited complexity, but remain narrow and milestone-safe.
