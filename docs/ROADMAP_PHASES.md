# Meraviglia OS — Roadmap Phases

## Phase 2A — Auth + DB + Intake
### Objective
Establish production-oriented identity and persistence baseline, and introduce the strategic Intake module as the formal entry point for workspace-level planning.

### Completion Criteria
- Auth flow operational for multi-user access.
- Persistent data model in place for foundational strategic artifacts.
- Intake module implemented with validated input structure and storage.
- Intake artifacts linked to workspace/project context.
- Basic auditability for intake creation/update events.

### Architectural Risk
- Early coupling of intake logic to UI forms.
- Leakage of Supabase-specific assumptions into domain/application layers.
- Incomplete access control boundaries causing future rework.

### Dependencies
- Existing Supabase auth bootstrap.
- Initial multi-user scaffolding.
- Domain definitions for workspace and intake concepts.

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
