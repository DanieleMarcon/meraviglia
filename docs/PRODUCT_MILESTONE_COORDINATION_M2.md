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
- Basic org access lifecycle states (pending, active, removed) at product level.

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

### M2-B — Organization Access Foundation (**next execution milestone**)

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
