# Meraviglia OS — Roadmap Phases

## Phase 2A — Auth + DB + Intake
### Status Update
- Intake module — baseline implemented (table, RLS isolation, repository/infra/application flow, conversion to workspace).
- Phase 2A Intake module operational UI baseline implemented (create, list, convert workflow through application layer).
- Phase 2A Workspace operational UI baseline implemented (workspace list and empty state via application layer).

### Codebase Cleanup Phase — Completion Update
Codebase Cleanup Phase is now completed.
- Architecture freeze enforced.
- Deterministic simulation contract implemented.
- Persistence/import hardening completed.
- Governance automation implemented.
- Documentation alignment completed.
- Feature delivery protocol defined.

### Positioning Continuity Baseline (Active)
Roadmap prioritization must preserve category and architecture framing:
- Meraviglia OS remains a Strategic Modeling and Decision Orchestration Platform and Strategic Context Operating System.
- Delivery slices must reinforce layered continuity: `context → relationship → interaction → memory → decision → augmentation → integration`.
- Future modules are layer-governed capabilities around workspace kernel ownership, not disconnected feature plugins.
- Category drift to CRM/calendar/notes/AI-wrapper semantics is explicitly out of scope for roadmap planning.

### Objective
Establish production-oriented identity and persistence baseline, and introduce the strategic Intake module as the formal entry point for workspace-level planning.

### Completion Criteria
- Auth flow operational for multi-user access.
- Persistent data model in place for foundational strategic artifacts.
- Intake module implemented with validated input structure and storage.
- Intake artifacts linked to workspace/project context.
- Basic auditability for intake creation/update events.

### Architecture Hardening — Step 1 (Completed Governance Milestone)
- Platform Core — Brand-Agnostic Architecture formalized.
- Multi-tenant schema established with `organizations`, `users`, `permissions`, `roles`, `role_permissions`, `user_roles`, `workspaces`.
- Supabase identity split confirmed: `auth.users` + `public.users`.
- Organization-scoped RBAC model defined and seeded with global permissions.
- RLS policies defined for strict organization isolation.
- DB hardening follow-up completed: `organizations` / `permissions` / `role_permissions` / `intake_leads` secured, `set_updated_at` hardened, and auto-enable-RLS trigger enabled.
- RBAC activation follow-up completed at DB level: minimal deterministic enforcement now active on administrative surfaces with active `admin`/`member` role model.
- Supabase key posture aligned: publishable key migration completed, legacy JWT-based key usage disabled in current app path.
- Explicitly out of scope in this step: self-signup organization creation, cross-organization super-admin/network layer.

### Multi-Organization Maturity Note (Current)
- Current state is backend-ready / product-incomplete.
- Implemented now: organization-scoped data model, user ↔ organization linkage, tenant RLS isolation, DB-enforced RBAC baseline (`admin`/`member` with minimal canonical permissions), authenticated runtime with logout, and operational loop (`intake → workspace → contacts → interactions`).
- Not yet implemented: invite-based onboarding, approval/activation workflow, organization management UI, organization switching, parent/child org visibility, and "mother organization sees all children" behavior.

### M2-B Product Contract Freeze (Current)
M2-B is now defined as the minimal Organization Access Foundation product slice.

In-scope contract:
- admin invite collaborator,
- collaborator invite activation after auth,
- baseline membership lifecycle (`invited` → `active` → `removed`),
- role responsibility boundary remains `admin` / `member` only,
- collaborator entry into existing org-scoped operational loop.

Explicitly deferred:
- org switching,
- multi-org membership UX,
- RBAC redesign/custom role systems,
- enterprise IAM (SSO/SCIM).

### Forward Slice — Organization & Access Management Foundation (Planned)
Objective for a future roadmap slice:
- Introduce product-complete organization and access management workflows on top of existing tenant/security foundations.

Expected scope:
- Invite-based user onboarding and membership lifecycle,
- approval/activation flow,
- organization management UI baseline,
- organization switcher UX/application flow.

Explicitly out of scope for this forward slice unless separately approved:
- parent/child network governance and cross-org global visibility models.

### Architectural Risk
- Early coupling of intake logic to UI forms.
- Leakage of Supabase-specific assumptions into domain/application layers.
- Incomplete access control boundaries causing future rework.

### Dependencies
- Existing Supabase auth bootstrap.
- Initial multi-user scaffolding.
- Domain definitions for workspace and intake concepts.
- Enforced dependency direction baseline: `ui → application`, `application → domain + repository contracts`, `infra → repository contracts`.

---

## Phase 2A.5 — Architecture Hardening
### Objective
Consolidate strategic architecture decisions into enforceable documentation and prepare the modeling stack for simulation-ready execution.

### Completion Criteria
- Domain Layer introduction codified and adopted as mandatory architecture baseline.
- Blueprint Domain Model defined with explicit aggregate boundaries and invariants.
- Strategy Template system design documented and linked to the Knowledge Layer for reusable strategic patterns.
- Documentation consolidation completed across architecture, roadmap, master plan, and development standards.
- Preparation baseline for Simulation Engine established (model contracts, data expectations, integration boundaries).

### Architectural Risk
- Fragmented architectural guidance causing inconsistent implementation choices.
- Premature simulation implementation without stabilized strategic model semantics.
- Drift between documented strategy and executable orchestration behavior.

### Dependencies
- Phase 2A foundational persistence and intake baseline.
- Alignment on target dependency direction baseline: `ui → application`, `application → domain + repository contracts`, `infra → repository contracts`.
- Governance commitment to documentation-first architecture hardening.

---

## Phase 2B — Workspace Refactor
### Objective
Refactor current structural model into a project-centric workspace architecture that cleanly separates strategic context from CRM references.

### Completion Criteria
- Workspace becomes the primary strategic aggregate boundary.
- CRM references represented as external links, not internal governing entities.
- Existing planning artifacts migrated to workspace-centric structures.
- Backward compatibility/migration path documented and validated.

### Architectural Risk
- Data migration complexity and mapping ambiguity.
- Temporary duplication of old/new models creating drift.
- Inadequate boundary enforcement between workspace and CRM semantics.

### Dependencies
- Phase 2A persistence baseline.
- Intake artifacts available for mapping into workspace structures.
- Repository abstraction sufficient to support model transition.

---

## Phase 2C — Application Layer Introduction
### Status Update
- Application Layer Introduction — baseline structure implemented (partial completion).
- Follow-up confirmed: remaining direct `supabaseClient` usage outside the auth-adapter pattern should be standardized behind explicit infra/repository adapters in a dedicated cleanup step.
- Follow-up confirmed: as repository/application DTO ownership is clarified, shared primitive unions (for example status enums) should be promoted to explicit cross-layer contract modules only when domain ownership is defined, to avoid duplicated literals and boundary drift.
- Follow-up update: orchestration regression coverage now includes state-level `useAppState` compare/proposal coordination (proposal A/B sanitize-on-write behavior, persistence payload integrity, and section-toggle transitions including mandatory section enforcement).
- Follow-up update: state-level `useAppState` orchestration coverage now also hardens `setPiano`, `addService`, and `removeService` branches with persistence assertions and dual-proposal re-sanitization checks; no additional high-value untested branch is currently flagged for this orchestration surface.
- Follow-up confirmed: continue coupling-by-shape cleanup beyond intake/workspace by adding explicit application mappers where repository records are still returned as DTO-shaped objects implicitly.
- Follow-up confirmed: `src/App.tsx` composition remains intentionally transitional but still dense; plan extraction into smaller composition-oriented UI containers once current application-layer cleanup sequence stabilizes.
- Follow-up confirmed: domain aggregate hardening still required for strategic planning entities (`Proposta`, `PianoStrategico`, `Service`) so invariants are progressively enforced by aggregate construction rather than relying only on sanitize/validation functions.
- Follow-up update: first strategic-planning aggregate hardening slice delivered with domain normalizers for `Service`, `PianoStrategico`, and `Proposta`; boundary sanitization remains as a transitional compatibility layer and must be reduced once constructor-owned invariants are adopted at all write paths.
- Follow-up update: payment-strategy hardening slice delivered by moving proposal-service payment normalization into domain-owned constructors (`StrategiaPagamento`/`PropostaService` normalization); further cleanup remains to remove transitional boundary sanitize ownership and replace shape-based catalog matching with stronger identity-based matching.
- Follow-up update: one high-traffic proposal write path (`setPropostaA` state updates) now routes through application-orchestrated domain normalization (`normalizeProposalForWrite`) directly; remaining high-traffic writes (`setPropostaB`, `setPiano`, and catalog-driven re-normalization) are still queued to further narrow `sanitizePropostaAtBoundary`.
- Follow-up update: `setPropostaB` state updates now also route through application-orchestrated domain normalization (`normalizeProposalForWrite`) directly; remaining transitional-sanitizer-owned high-traffic writes are `setPiano` and catalog-driven dual-proposal re-normalization (`addService`/`removeService`).
- Follow-up update: `setPiano` orchestration now also routes both proposal branches through application-orchestrated domain normalization (`normalizeProposalForWrite`) directly; remaining transitional-sanitizer-owned write flows are catalog-driven dual-proposal re-normalization (`addService`/`removeService`) and persisted bootstrap compatibility normalization.
- Follow-up update: `addService` and `removeService` catalog mutations now also route both proposal branches through application-orchestrated domain normalization (`normalizeProposalForWrite`) directly; persisted bootstrap compatibility normalization remains the primary transitional-sanitizer-owned path pending handoff.
- Follow-up update: persisted bootstrap proposal normalization now also routes through application-orchestrated domain normalization (`normalizeProposalForWrite`) directly; transitional `sanitizePropostaAtBoundary` ownership is reduced to compatibility aliasing only for this strategic-planning flow.
- Follow-up update: import/legacy bootstrap adaptation now persists normalized proposals after deterministic `catalogServiceId` recovery, reducing repeated shape-based fallback on reloads; remaining identity propagation gaps stay tracked for explicit import/export and mapper boundaries.
- Follow-up update: proposal-document export adaptation (`ACTIVATED_SERVICES` payload) now emits `catalogServiceId` explicitly while preserving runtime `service.id` for compatibility, reducing downstream need for shape-based service matching in document/export consumers.
- Follow-up confirmed: remaining identity propagation gaps are still open for other import/export contracts and repository/application mapping paths that can ingest service payloads without `catalogServiceId`.
- Follow-up update: compare-chart application mapper now emits both `runtimeServiceId` and `catalogServiceId` per service series (with narrow fallback only when catalog identity is missing), reducing one remaining weak identity boundary while preserving existing chart key behavior.
- Follow-up update: persisted cashflow import adaptation now consumes legacy `catalog_service_id` and normalizes it to canonical `catalogServiceId` before domain write normalization, reducing one remaining explicit repository/import identity-loss boundary without widening fallback behavior.
- Follow-up update: cashflow bootstrap ingress now also routes strategic-plan (`piano`) payloads through an explicit runtime decoder/adaptation seam, reducing structural trust of imported plan shape while preserving existing versioned-envelope dispatch and legacy unversioned compatibility fallback.
- Follow-up update: service-catalog local persistence ingress now passes through an explicit decode adapter (`serviceCatalogBootstrapDecoder`) with per-item acceptance/fallback, reducing shallow array-level bootstrap acceptance while preserving runtime behavior.
- Follow-up update: strategic-planning application orchestration now uses explicit mapper boundaries for `strategicPlanningService` domain ingress/egress (`calculateCashflow`, `normalizeProposalForWrite`, `resolvePaymentConstraints`) via dedicated application mappers instead of implicit DTO/domain shape compatibility.
- Follow-up clarification: this slice intentionally remains local to one high-leverage service seam and does not yet migrate all strategic-planning consumers (for example compare/document/state flows) to explicit domain mapper contracts.
- Follow-up confirmed: remaining strategic-planning DTO/domain mapper gaps are still open for adjacent services and orchestrators that continue to rely on shape-compatible contracts outside this service slice.
- Follow-up confirmed: remaining UI deep-shape mutation cleanup is still required where components/state paths continue constructing rich proposal-service payloads or mutating nested DTO shapes beyond pure intent transport.
- Follow-up confirmed: remaining shape-based compatibility fallback is still retained in domain validation (`resolveCatalogDefinition` unique-shape matching bridge) and should be removed once identity propagation/backfill coverage is complete.
- Follow-up confirmed: persistence/import contract hardening is still required beyond current slices (explicit mapper boundaries and canonical identity normalization/backfill for non-bootstrap import/export/repository paths).
- Follow-up confirmed: `src/App.tsx` composition density reduction remains open as a dedicated composition extraction task after mapper/identity stabilization.
- Follow-up confirmed: further identity propagation and boundary tightening remain open for service payloads that still cross boundaries without guaranteed `catalogServiceId` continuity.
- Follow-up update: compare/document-adjacent orchestration now includes an explicit application-owned mapper seam in `proposteCompareService` (`proposteCompareMappers`) so proposal-service DTOs are projected intentionally before compare series DTO emission.
- Follow-up clarification: this mapper slice is intentionally narrow; proposal-document section payload composition still requires its own explicit application mapping boundary in a future step.
- Follow-up confirmed: remaining UI deep-shape mutation cleanup, shape-based compatibility fallback retirement, persistence/import contract hardening, `src/App.tsx` composition density reduction, and broader identity-propagation tightening remain active follow-ups.

### Objective
Introduce explicit application/use-case layer to orchestrate workflows and enforce future dependency boundaries.

### Completion Criteria
- Defined application services/use-cases for key flows (intake, workspace management, blueprint preparation).
- UI interactions routed through application layer entry points.
- Domain/engine logic no longer directly invoked by UI in new/updated flows.
- Repository interfaces consumed only by application layer.

### Architectural Risk
- Partial adoption creating inconsistent architecture.
- Increased complexity if use-case boundaries are poorly designed.
- Regressions in velocity if conventions are not documented and enforced.

### Dependencies
- Workspace model stabilization from Phase 2B.
- Clear repository contracts.
- Team alignment on layer responsibilities.

---

## Phase 2C.5 — Interaction Layer Definition + Scheduling Foundation (Planned)
### Objective
Define the canonical Interaction Layer architecture after Contacts Foundation and implement Scheduling Foundation as its first narrow product slice.

### Completion Criteria
- Interaction Layer definition codified across architecture/master-plan/positioning/project-structure/data-model docs.
- Canonical interaction model established (`id`, `workspaceId`, `type`, `scheduledAt`, `status`, `provenance`, participant linkage, optional notes/outcome linkage).
- Scheduling Foundation framed explicitly as first slice of Interaction Layer (not full layer scope).
- Out-of-scope boundaries documented (no external sync, no AI generation, no analytics/recurrence/automation/CRM semantics).

### Architectural Risk
- Calendar-first implementation drift.
- CRM activity-feed semantics leaking into workspace strategic model.
- Premature commitments to integrations/AI artifacts before baseline interaction ownership is stable.

### Dependencies
- Contacts Foundation v1 active.
- Workspace kernel and relationship layer boundaries preserved.
- Documentation-first architecture alignment completed before runtime implementation.

---

## Phase 2D — ROI Engine
### Objective
Add deterministic ROI and strategic impact engine to quantify blueprint viability and improve decision quality.

### Completion Criteria
- ROI engine implemented as isolated engine-layer module.
- Inputs/outputs explicitly typed and versioned.
- ROI results integrated into blueprint evaluation workflows.
- Testing baseline covers deterministic calculation paths and scenario variance behavior.

### Architectural Risk
- Embedding financial logic in UI/application instead of engine.
- Hidden assumptions reducing interpretability of outputs.
- Premature optimization before data quality is stable.

### Dependencies
- Application layer in place (Phase 2C).
- Sufficient intake/workspace data structures.
- Agreed ROI modeling rules and governance sign-off.

---

## Phase 3 — Relatia Integration
### Objective
Integrate Meraviglia OS with Relatia CRM through contract-based adapters while preserving strategic/operational separation.

Architecture Ecosystem alignment note:
- Meraviglia OS operationalizes strategic methodology continuity in software, while Architecture Ecosystem remains the methodology/consulting framework itself.

### Completion Criteria
- CRMAdapter contract finalized and versioned.
- Relatia adapter implemented in infra layer.
- Core synchronization flows defined (reference retrieval, execution feedback ingestion).
- Integration observability and failure-handling policies documented.

### Architectural Risk
- Over-coupling Meraviglia roadmap to Relatia implementation details.
- Contract instability causing integration churn.
- Confusion between orchestration ownership and CRM process ownership.

### Dependencies
- Stable internal architecture from Phase 2A–2D.
- Repository/integration contract maturity.
- Joint alignment on data mapping and identity resolution.

---

## Phase 4 — SaaS Readiness
### Objective
Prepare Meraviglia OS for scalable multi-tenant SaaS operation with governance, security, and operational reliability.

### Completion Criteria
- Tenant-aware data and authorization strategy defined and validated.
- Operational controls for auditing, monitoring, and incident response established.
- Versioning/migration process formalized for modules and contracts.
- Deployment and environment strategy documented for staging/production maturity.

### Architectural Risk
- Retrofitting tenancy late with high migration cost.
- Security controls fragmented across layers.
- Operational debt due to missing observability and policy enforcement.

### Dependencies
- Completion of integration-ready architecture.
- Stable module boundaries and version contracts.
- Security and governance policy maturity from prior phases.
- Follow-up update: proposal-document orchestration now includes an explicit application-owned mapper seam for `ACTIVATED_SERVICES` payload preparation (`proposalDocumentService` + `proposalDocumentMappers`), while additional section payload mappers remain open for future slices.
- Follow-up update: proposal-document orchestration now also prepares `STRATEGIC_PLAN`, `FINANCIAL_PROPOSAL`, and `COMPARISON` through application-owned mappers/projections before engine section emission; remaining placeholder/auxiliary section payload mapper gaps are still tracked as incremental follow-ups.
- Follow-up update: timeline month-move UI handling now uses narrow app-state intents (`serviceId` + `month`) instead of deep nested proposal-service mutation in `App.tsx`; richer update assembly/normalization now runs inside app-state orchestration.
- Follow-up confirmed: remaining UI deep-shape mutation cleanup, retained shape-based compatibility bridges, persistence/import contract hardening, `src/App.tsx` composition density reduction, and broader identity propagation/boundary tightening remain active and explicitly tracked for subsequent cleanup slices.
- Follow-up update: service-catalog local persistence now matches cashflow bootstrap hardening with a `version: 1` envelope/decoder-dispatch ingress seam; legacy unversioned catalog arrays remain compatibility-only fallback and unknown envelope versions now fail closed.
- Follow-up confirmed: remaining envelope/decoder-dispatch rollout is still required for non-local import/export payloads and remaining external repository ingress seams, plus migration/backfill strategy for legacy unversioned persisted/imported records.
- Follow-up update: non-local intake persistence writes now use an explicit infra runtime adaptation seam (`intakeWritePayloadAdapter`) before Supabase create/update calls, reducing structural trust at an external payload boundary while preserving canonical write behavior.
- Follow-up confirmed: remaining non-local import/export ingress decoders, version-aware dispatch where applicable, identity continuity tightening (`catalogServiceId`), retained compatibility fallback retirement, and `src/App.tsx` composition-density reduction remain active cleanup targets.
- Follow-up update: non-local workspace persistence writes now route through explicit infra runtime adaptation (`workspaceWritePayloadAdapter`) for create/update payloads before Supabase SDK calls, further reducing structural trust at external write boundaries while preserving canonical behavior.
- Follow-up confirmed: remaining non-local import/export ingress decode seams, version-aware dispatch rollout for external payload families, `catalogServiceId` continuity hardening across import/export contracts, compatibility fallback sunset planning, and `src/App.tsx` composition-density reduction remain active cleanup targets.
- Follow-up update: proposal-document `ACTIVATED_SERVICES` roundtrip payload re-entry now uses an explicit runtime decode/adaptation seam with version-aware envelope dispatch (`v1` + legacy unversioned compatibility) before downstream proposal-document orchestration.
- Follow-up update: document-facing service identity continuity improved in this slice by canonicalizing legacy `catalog_service_id` to `catalogServiceId` at the decoder boundary.
- Follow-up confirmed: remaining proposal-document section roundtrip families, additional non-local import/export decode seams, compatibility-fallback sunset planning, and `src/App.tsx` composition-density reduction remain active cleanup targets.
- Follow-up update: cashflow local persistence compatibility lifecycle governance now mirrors service-catalog with explicit decoder metadata (`compatibilityState`, `shouldWriteBackCanonicalEnvelope`), opportunistic canonical writeback for legacy unversioned reads, and an explicit legacy sunset target gate (`2026-06-30`) while preserving current runtime behavior.
- Follow-up update: explicit dependency-governance automation is now operationalized as a visible gate command (`npm run check:governance`) that enforces canonical forbidden dependency directions, blocks non-infra access to `src/lib` import surface, and guards non-test engine sources against direct time/random runtime APIs.
- Durable architectural clarification: architecture dependency policy is no longer review-only prose; it must be executable as a pre-merge gate with deterministic pass/fail behavior and auditable command surface.
- Follow-up confirmed: remaining governance automation gaps still include CI pipeline wiring/required-status enforcement, richer path-alias/import-style coverage, and optional matrix-aware diagnostics for large-scale module migration.
- Follow-up confirmed: remaining determinism enforcement automation gaps still include extending forbidden API guards from current engine scope to any future simulation-adjacent modules outside `src/engine`, plus optional AST-level checks for stricter false-positive resistance.
- Follow-up confirmed: remaining migration/backfill/sunset strategy gaps remain active for retained legacy unversioned/alias compatibility bridges across non-local import/export families.
- Follow-up confirmed: remaining non-local import/export hardening gaps remain active for external payload families still missing canonical version-aware decode/adaptation seams.
- Follow-up confirmed: `src/App.tsx` composition density reduction remains open and intentionally sequenced after current governance/contract hardening slices.
- Follow-up confirmed: remaining domain aggregate hardening remains open for strategic-planning aggregates where constructor-owned invariants are not yet end-to-end enforced.


## Phase 2D.5 — Memory Foundation Definition
### Status Update
- Canonical Memory Layer definition documented as workspace-scoped strategic memory.
- Memory Foundation framed as first narrow slice (manual artifact creation with optional contact/interaction linkage).

### Objective
Formally define the Memory Layer before runtime implementation to preserve architecture/governance continuity and prevent generic storage drift.

### Completion Criteria
- Canonical Memory Layer model documented (artifact type, provenance, linkage semantics).
- Memory Foundation scope and out-of-scope boundaries documented.
- Prompt/governance documentation aligned for future implementation prompts.

### Architectural Risk
- Memory interpreted as generic storage instead of governed strategic continuity layer.
- Premature expansion into document management, search, or AI automation without baseline governance.

### Dependencies
- Workspace as Strategic Context Kernel.
- Interaction and Relationship layer definitions in place.
- Prompt and feature delivery governance active.
