# Meraviglia OS — Product Milestone Coordination (M1 → M2)

## 1. Current Product Maturity Assessment

Meraviglia OS is currently in a **secure foundation / incomplete collaboration** state.

- The system is beyond prototype-level security and tenancy: organization-scoped RLS and minimal deterministic RBAC are active.
- The app supports a coherent founder loop (`login → intake → workspace → contacts → interactions`) and now reads minimal RBAC state (`isAdmin`, `canManageRbac`) with admin gating primitives.
- Product maturity is still **single-operator-first**, not yet true collaborative multi-user.
- Practical maturity label for planning: **M2-entry foundation complete, M2 product workflows incomplete**.

This means the platform can safely continue building, but cannot yet be treated as externally collaboration-ready.

## 2. What Is Actually Complete

### Technical foundation completed (and should be treated as done for this slice)

- Multi-tenant org-scoped Supabase architecture active.
- Auth bootstrap active (`auth.users` to `public.users`).
- Core helper functions active (`current_user_organization_id`, `has_role`, `has_permission`).
- Auto-RLS enable trigger active.
- DB-level RBAC activation complete for minimal deterministic model (`admin`, `member`).
- Canonical permission vocabulary active:
  - `organization.read`
  - `workspace.manage`
  - `intake.manage`
  - `contact.manage`
  - `interaction.manage`
  - `rbac.manage`
- Publishable key migration complete; legacy JWT key path disabled.
- App-level minimal RBAC alignment complete (read seam + auth flags + admin gating primitive + normalized denial UX).
- Documentation-first governance and cross-chat prompt protocol already active.

### Delivery/governance baseline completed

- Architecture freeze remains authoritative.
- Stream-based execution model already established (DB / APP / PRODUCT).
- Milestone progression model already established (M1 → M2 → M3).

## 3. What Is Still Missing Before Real Multi-User Usage

The missing layer is now mostly product workflow, not low-level security.

### Organization access workflow gaps

- Invite-based onboarding flow.
- Membership acceptance/activation flow.
- Organization/member administration UI baseline.
- Deterministic role assignment UX for admins.
- Basic org access lifecycle states (`invited`, `active`, `removed`) at product level.

### Collaboration usability gaps

- In-app pathways for adding collaborators without manual DB intervention.
- Clear multi-user responsibility boundaries in UX (who can manage access vs who can operate workspace data).
- Consistent admin/non-admin affordances across all relevant screens.

### Multi-org product gaps

- Organization switching UX and session behavior.
- Product-level handling for users with future multi-org membership (even if deferred to a later milestone, boundary must be explicit now).

### Sellability/readiness gaps

- Product cannot yet be sold as a collaborative operating system because team onboarding and access governance are incomplete.
- Current state is founder-usable and internally operable, but not collaboration-complete.

## 4. Recommended Milestone Structure

Use a minimal four-step execution structure inside the current M1→M2 transition to avoid drift and overengineering.

### M2-A — Security & RBAC Foundation Closure (**completed**)

Scope:
- DB hardening + RLS hardening + minimal RBAC activation + app minimal RBAC coherence.

Exit condition:
- Already satisfied.

### M2-B — Organization Access Foundation (**foundation completed**)

> Current focus: **post-M2-B consolidation and system alignment**.

Scope:
- Invite + membership activation + admin-managed membership baseline + role assignment baseline.
- No custom role engine expansion.

Exit condition:
- A real admin can invite and activate at least one collaborator, collaborator can access org-scoped operational loop with correct permissions.

### M2-C — Collaboration UX Reliability

Scope:
- Consistent guardrails/affordances for admin-only actions.
- Denial/recovery UX stabilization for access edges.
- Minimal auditability surface for access mutations (at least operational traceability).

Exit condition:
- Day-to-day two-user collaboration is operational without manual backend intervention.

### M2-D — Multi-Org Product Readiness Gate

Scope:
- Decide and implement minimal organization switching boundary (if enabled in this phase), or explicitly defer with documented product constraint.
- Finalize M2 truth statement: what is and is not supported for external collaborative usage.

Exit condition:
- M2 can be described externally without ambiguity and without hiding critical limitations.

## 5. Per-Stream Priorities (DB / APP / PRODUCT)

### DB Stream

Primary objective: support M2-B/M2-C product flows without RBAC redesign.

Next priorities:
1. Add only the schema/policy support strictly required for invite and membership lifecycle.
2. Keep existing RBAC model (`admin`/`member`) as canonical in this phase.
3. Add narrow observability/traceability for privileged access mutations if needed for product operations.
4. Maintain strict RLS and avoid introducing service-role runtime coupling.

### APP Stream

Primary objective: make organization access workflows usable and consistent with active DB enforcement.

Next priorities:
1. Implement invite + activation + membership management baseline UI/app flow.
2. Extend current RBAC gating from primitive to consistent screen-level behavior for admin surfaces.
3. Preserve existing operational loop behavior for both `admin` and `member`.
4. Keep unauthorized states deterministic and user-safe.

### PRODUCT Stream

Primary objective: define and govern the collaboration contract for M2.

Next priorities:
1. Define canonical user journey for: admin setup, invite collaborator, collaborator activation, first shared workspace collaboration.
2. Define role responsibility matrix for current phase (`admin` vs `member`) in product language.
3. Define acceptance criteria for “collaboration-ready M2” that can be validated cross-chat.
4. Keep roadmap language honest: infrastructure-ready vs workflow-ready distinctions must remain explicit.

## 6. What Must Wait

Explicitly defer until after M2-B/M2-C stabilization:

- Custom role builders and permission-template systems.
- Fine-grained permission explosion (`read/create/update/delete` per entity).
- Parent/child org governance and “mother org sees children” model.
- Cross-org super-admin/network layer.
- Enterprise IAM features (SSO, SCIM, policy engines).
- Full audit/compliance subsystem beyond minimal operational traceability.
- AI-assisted access governance or automation around permissions.

## 7. Architectural Notes

- Keep the current rule: **RBAC activated, not redesigned**.
- Preserve dependency direction and architecture freeze boundaries.
- Keep DB as enforcement source of truth; APP handles experience and guardrails.
- Do not collapse PRODUCT stream into implementation tickets only; PRODUCT must own milestone definitions, acceptance criteria, and external truth framing.
- Multi-org remains infrastructure-capable but product-incomplete until org access workflows are delivered.

## 8. Documentation Impact Check

To keep cross-chat continuity deterministic, align these documents after milestone adoption:

1. `docs/DELIVERY_EXECUTION_SYSTEM.md`
   - Update current active priority from APP RBAC alignment to M2-B organization access foundation.
2. `docs/ROADMAP_PHASES.md`
   - Mark M2-A closure explicitly and introduce M2-B/M2-C/M2-D boundaries as the active next layer.
3. `docs/MERAVIGLIA_OS_MASTER_PLAN.md`
   - Keep maturity truth synchronized (infrastructure-ready vs product-incomplete) and reference current milestone boundary.
4. `docs/SUPABASE_RBAC_ACTIVATION_M2_PLAN.md`
   - Keep this as closed activation baseline; avoid mixing it with invite/IAM redesign scope.
5. `docs/APP_RBAC_ALIGNMENT_M2_AUDIT.md`
   - Mark minimal alignment as completed baseline and point to collaboration workflow phase.

## 9. Known Risks / Tradeoffs

- Keeping `member` broad on operational data accelerates delivery but limits immediate granularity.
- Deferring multi-org switching may simplify near-term delivery but can confuse users unless explicitly communicated.
- If invite and activation UX ship without strong state clarity, support burden increases despite secure backend enforcement.
- If PRODUCT stream does not enforce milestone truth statements, parallel chats may drift back into technical-only execution.
- Expanding scope into enterprise IAM now would delay collaboration-ready baseline and break the non-overengineered milestone intent.

## 10. Recommended Next Chat Order

1. **PRODUCT chat** — finalize M2-B product contract:
   - invite/activation lifecycle,
   - role responsibility matrix,
   - collaboration-ready acceptance criteria.
2. **DB chat** — implement minimal invite/membership schema and policy support for the approved product contract.
3. **APP chat** — implement invite/activation/admin membership UX + RBAC-consistent guards.
4. **PRODUCT chat** — run milestone validation pass and declare M2-B completion or corrective deltas.
5. **APP + DB follow-up chats** — execute only the deltas required for M2-C collaboration reliability.

This sequence preserves stream separation while keeping milestone truth synchronized across chats.

## 11. M2-B Product Contract — Organization Access Foundation (Ratified)

### 11.1 Contract Goal
Deliver the smallest collaboration-ready access workflow on top of the active RBAC foundation, without redesigning roles or introducing multi-org switching.

### 11.2 Minimal User Journey (M2-B)
1. Admin opens **Organization Access** from settings/admin area.
2. Admin sends invite by entering collaborator email and selecting role (`member` default, `admin` optional).
3. Collaborator receives invite link.
4. Collaborator authenticates (new signup or existing login) and lands on invite activation screen.
5. Collaborator accepts invite; membership transitions to active for that organization.
6. Collaborator enters the standard organization-scoped app shell (same operational loop as founder).
7. Collaborator operates with `member` permissions and sees admin-only actions gated.

### 11.3 Role Responsibilities (M2-B)
- `admin`
  - invite users
  - remove membership via membership management baseline
  - assign role only between existing roles (`admin`/`member`)
  - manage access governance surfaces protected by `rbac.manage`
- `member`
  - use organization operational surfaces permitted by canonical permissions
  - cannot invite/remove users or modify roles
  - cannot access admin-only governance controls

Activation ownership note: membership activation is collaborator-driven through invite acceptance after authentication; admin does not directly activate collaborators in the standard M2-B contract.

### 11.4 Minimal Membership Lifecycle (M2-B)
Canonical product states:
- `invited` — invite issued, not yet activated
- `active` — invite accepted and app access enabled
- `removed` — membership revoked; organization access denied

No additional lifecycle states are introduced in M2-B.

### 11.5 Minimum Required Screens/Flows
1. Admin: **Invite collaborator** flow.
2. Collaborator: **Invite activation** flow after authentication.
3. Admin: **Membership list baseline** (email, role, state, remove action).
4. Shared: **Access denial fallback** for non-admin attempts on governance actions.

### 11.6 Explicit Deferrals
Deferred beyond M2-B:
- custom roles/permission editors
- org switching and multi-org membership UX
- enterprise IAM (SSO/SCIM/policy engine)
- parent/child org governance and super-admin network views
- compliance-grade audit suite

### 11.7 M2-B Completion Gate
M2-B is complete only when all are true:
1. Admin can invite collaborator from app UI without manual DB operations.
2. Collaborator can activate invite and enter organization-scoped app.
3. Collaborator with `member` role can run core loop and is blocked from admin governance actions.
4. Admin can view and remove memberships via baseline admin surface.
5. Scope constraints remain intact (no RBAC redesign, no org switching, no enterprise IAM expansion).

### 11.9 APP Stream Status Update (2026-04-02)
- APP now exposes an admin-only **Organization Access** baseline surface for invite creation (email + `member`/`admin`) and membership listing/removal.
- Authenticated users in `membership_status='invited'` are now routed to deterministic invite activation UX and can activate via `activate_invite(invite_token)`.
- Authenticated users in `membership_status='removed'` now receive deterministic denied access fallback instead of entering normal organization shell.
- Scope remains aligned with M2-B guardrails (single-org model, no IAM redesign, no role-system expansion).

### 11.8 Terminology Freeze for M2-B
Freeze these terms for documentation and implementation consistency:
- **Organization Access Foundation** (milestone boundary)
- **Invite activation** (post-auth acceptance step)
- **Membership lifecycle: invited → active → removed**
- **Role baseline: admin/member**
