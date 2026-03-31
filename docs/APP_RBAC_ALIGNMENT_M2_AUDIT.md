# APP RBAC Alignment Audit & Minimal Implementation Plan (M1 → M2)

## 1. APP RBAC Current-State Assessment

- The current app authenticates users and gates only on session presence (`user` exists), not on role or permission claims.
- There is no application-level RBAC read model yet (no role/permission fetch, no `has_role`/`has_permission` RPC usage).
- Current UI surfaces are focused on operational entities (`intakes`, `workspaces`, `contacts`, `interactions`) and do not currently expose explicit RBAC-admin UI (roles, role-permissions, user-role assignments, permission catalog editing).
- Data writes for operational entities rely on Supabase RLS/org scoping and currently remain valid for both `admin` and `member` under the active minimal model.
- Error handling generally displays raw backend error messages, which can produce confusing UX for authorization-denied mutations as RBAC-admin surfaces get introduced.

## 2. Immediate APP Misalignment Risks

- **Risk A — hidden assumption of “authenticated = can write admin data” for future UI additions**:
  the app has no reusable permission gate primitive, so any upcoming admin surface can accidentally ship visible/interactive for `member` and then fail at DB policy level.
- **Risk B — UX incoherence on denied mutations**:
  backend denials are surfaced as generic/raw errors, so non-admin users can see hard failures rather than clear “admin required” affordances when RBAC-protected actions are attempted.
- **Risk C — no explicit role context in client state**:
  without a lightweight RBAC context, conditional rendering and disable states cannot be applied consistently.
- **Risk D — drift between DB activation and APP behavior**:
  DB-side RBAC is active now, but app conventions do not yet encode the same boundaries; this increases regression risk during normal feature work.

## 3. Minimal APP RBAC Alignment Strategy

Implement the smallest APP-side alignment in three narrow pieces:

1. **Add a minimal RBAC session context (read-only)**
   - Add a tiny application/auth seam that resolves:
     - `isAdmin` via `has_role('admin')`, and
     - optional `canManageRbac` via `has_permission('rbac.manage')`.
   - Store this in auth context next to session/user.
   - No role assignment, no permission editor, no new backend/service role.

2. **Add a tiny UI gating primitive**
   - Provide a single reusable guard helper/hook (`useRbac` or equivalent) that returns booleans for rendering and disable decisions.
   - Scope to admin/RBAC surfaces only; do not gate operational entities now.

3. **Normalize authorization-denied errors for UX clarity**
   - Add a minimal error mapper in app/infra boundary to convert RBAC denial codes/messages into a user-safe message such as “Admin privileges required for this action.”
   - Keep the mapper narrow; do not build a general exception framework.

## 4. What Must Be Hidden/Disabled for Non-Admin Users

For **current and near-term APP behavior**, enforce this rule:

- Any UI that mutates RBAC/admin surfaces must be hidden/disabled unless `isAdmin` (or `canManageRbac`) is true.

Specifically include:

- Role CRUD actions (create/update/delete role records).
- Role-permission mapping mutations.
- User-role assignment/removal actions.
- Permission catalog mutations.
- Organization settings updates (if/when exposed in UI).
- Cross-user profile/account mutation actions (if/when exposed in UI).

Also:

- If a non-admin reaches an admin route (future), redirect to existing unauthorized pattern or show inline “admin required” state.

## 5. What Can Stay Unchanged For Now

- Existing operational CRUD and orchestration for:
  - workspaces,
  - intakes,
  - contacts,
  - interactions,
  can remain unchanged in M1→M2 because they are intentionally org-scoped (not role-split) in current DB policy.
- Current client-only architecture remains unchanged (no service-role backend introduction).
- No org switching, no invite lifecycle, no access-management console in this slice.
- Existing data model and repository contracts for operational entities can remain as-is.

## 6. Recommended Implementation Slice

**Smallest correct APP slice (implementation-ready):**

1. **RBAC read seam in infra/auth**
   - Add one small method to read role/permission booleans via existing Supabase RPC helpers.
2. **Auth context extension**
   - Extend auth state with `{ isAdmin, canManageRbac, rbacLoading }`.
3. **UI guard utility**
   - Add one shared helper/hook used by any admin-capable controls.
4. **Denied-error message normalization**
   - Map RBAC/RLS denial into deterministic user message.
5. **Smoke validation**
   - Validate with two users (`admin`, `member`) that:
     - member cannot trigger RBAC/admin mutations from UI,
     - admin can access enabled controls,
     - operational flows still work for both roles.

Deliver this as a single APP PR without expanding scope into IAM UX.

## 7. Future Backlog / Explicitly Postponed

Postpone intentionally:

- Full organization access-management UI.
- Invite/member lifecycle flows.
- Role assignment screens and admin consoles beyond minimal gating readiness.
- Fine-grained permission splitting (`read/create/update/delete`).
- Multi-organization switching UX.
- Audit trail UX and privileged-operation analytics.
- Server-side privileged policy orchestration layer.

## 8. Architectural Notes

- This plan preserves Architecture Freeze v1 layering:
  - UI renders gates,
  - Application/Auth orchestrates session + RBAC read flags,
  - Infra performs Supabase RPC calls,
  - DB/RLS remains source of truth enforcement.
- It avoids architecture expansion and keeps ownership clear.
- It encodes DB-side RBAC boundaries in APP behavior without redesigning the permission system.

## 9. Documentation Impact Check

Immediate documentation actions for this APP slice:

- Update `docs/SUPABASE_RBAC_ACTIVATION_M2_PLAN.md` with an APP alignment status note once implemented.
- Update roadmap/progress docs only if milestone tracking fields change.
- No structural documentation rewrite needed if scope stays to minimal auth-context + UI gating + error normalization.

## 10. Known Risks / Tradeoffs

- Keeping operational entities role-unsplit means `member` remains broad for day-to-day data mutation by design.
- Minimal client RBAC context can become stale if roles change mid-session; acceptable for this milestone if refreshed on auth/session changes.
- Error normalization may not catch every backend denial variant initially; keep fallback raw error in dev logs while showing safe user copy.
- Hiding/disable in UI is UX coherence only; DB policies remain the real enforcement boundary (correct by design).
