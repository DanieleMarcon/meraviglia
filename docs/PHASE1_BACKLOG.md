# PHASE 1 BACKLOG — Meraviglia Preventivatore MVP

Roadmap to bring the MVP to **architectural integrity 10/10**, with explicit sequencing and dependency control.

---

## MILESTONE 1 — Structural Integrity

### Objective
Create a stable, predictable technical foundation so every subsequent engine/UI/PDF feature can evolve without regressions.

### Backlog Scope
- Folder architecture stabilization
- Strict type enforcement
- Remove implicit any
- Add engine test scaffolding
- Introduce schema versioning for storage

### Why it matters architecturally
Without hard boundaries in folders, strict typing, and versioned persistence contracts, feature velocity creates hidden coupling and data drift. This milestone reduces entropy and establishes enforceable contracts for all runtime and storage layers.

### Dependencies
- **No upstream dependency** (foundation milestone).
- **Blocks** Milestones 2, 3, 4, and 5 because they require stable contracts, testability, and schema lifecycle management.

---

## MILESTONE 2 — Proposal Engine Completion

### Objective
Finalize the proposal domain engine so all sections are generated from deterministic, typed, and normalized payloads.

### Backlog Scope
- Typed payload for each ProposalSection
- Comparison section full payload
- Section enable/disable logic
- Payload normalization rules
- ProposalDocumentBuilder finalization

### Why it matters architecturally
The proposal engine is the core domain boundary between input state and output artifacts (UI previews, PDF rendering, future analytics). Completing this layer with strict payload contracts prevents downstream branching logic and duplicated transformation code.

### Dependencies
- **Depends on Milestone 1** for strict typing, test scaffolding, and storage schema versioning.
- **Enables Milestone 3** (UI can bind to complete section payloads) and **Milestone 4** (PDF can render finalized document payloads).

---

## MILESTONE 3 — UI/UX Refinement

### Objective
Align interaction quality with domain model precision, ensuring UI behavior is predictable, legible, and state-consistent.

### Backlog Scope
- Grid-aligned drag logic
- Timeline visual precision
- Service color consistency
- Section toggles for PDF inclusion
- Improved PaymentEditor validation UX

### Why it matters architecturally
A refined interface is not only aesthetic: it is a state correctness layer. Clear interaction constraints and validation feedback reduce invalid configurations before they reach the engine/PDF pipelines, lowering error handling complexity across the stack.

### Dependencies
- **Depends on Milestone 1** for consistent module boundaries and type-safe UI state.
- **Strongly depends on Milestone 2** for complete section payloads and enable/disable semantics.
- **Feeds Milestone 4** by providing precise inclusion toggles and visual-state parity with rendered output.

---

## MILESTONE 4 — PDF Layer (Digital First)

### Objective
Ship a production-ready digital PDF generation layer that faithfully mirrors proposal semantics and supports structured navigation.

### Backlog Scope
- HTML renderer
- Digital-optimized layout
- Service intro black pages
- Index auto-generation
- Cashflow & heatmap embed
- Comparison layout duplication logic

### Why it matters architecturally
The PDF layer is a terminal projection of the domain model. If it is built on typed, normalized proposal data and explicit inclusion logic, document generation becomes deterministic and maintainable rather than a template patchwork.

### Dependencies
- **Depends on Milestone 1** for stable file structure/testability and version-aware storage inputs.
- **Depends on Milestone 2** for finalized document builder output and complete comparison payloads.
- **Depends on Milestone 3** for user-controlled section inclusion and UX-state consistency.
- **Prepares Milestone 5** by establishing render abstraction reusable for multi-template scenarios.

---

## MILESTONE 5 — Phase 2 Hooks

### Objective
Introduce forward-compatible extension points for advanced financial intelligence and multi-scenario orchestration without refactoring Phase 1 core.

### Backlog Scope
- ROI Engine placeholder
- Marginality hooks
- Multi-template support
- Multi-proposal scenario persistence
- Workspace-ready state model

### Why it matters architecturally
Phase 2 features require stable contracts, composable state, and pluggable render/engine boundaries. Defining hooks now avoids hard forks in business logic and protects long-term maintainability as analytical complexity grows.

### Dependencies
- **Depends on Milestone 1** for stable architecture and versioned persistence.
- **Depends on Milestone 2** for reliable proposal domain outputs.
- **Depends on Milestone 4** for template/render abstraction groundwork.
- **Optionally leverages Milestone 3** UX patterns for multi-scenario workspace ergonomics.

---

## Dependency Map (Summary)

- **M1 → M2 → (M3 + M4) → M5**
- **M3 → M4** (section toggles and UI-state parity inform final PDF composition)
- **M4 → M5** (multi-template and scenario-ready rendering path)

This sequence maximizes architectural coherence: foundation first, domain completion second, interface and output layers third, extensibility last.

## Structural Hardening Notes

- **Separate state core from React hooks (introduce framework-agnostic state layer in future refactor)**  
  This matters architecturally because it isolates domain/state behavior from view concerns, making the engine portable, easier to test, and safer to evolve if UI frameworks change. This is a **Phase 1 hardening task before SaaS transition** to reduce coupling risk early.

- **Introduce persistence abstraction boundary (prepare for backend storage replacement)**  
  This matters architecturally because a storage boundary prevents persistence mechanics from leaking into business logic, enabling future backend swaps (or mixed storage strategies) without destabilizing core flows. This is a **Phase 1 hardening task before SaaS transition** to keep migration paths controlled.

- **Add engine-level test harness independent from UI**  
  This matters architecturally because core proposal/domain validation should run without UI runtime dependencies, improving regression detection speed and confidence for engine refactors. This is a **Phase 1 hardening task before SaaS transition** to harden correctness guarantees.

- **Formalize state schema version migration policy**  
  This matters architecturally because explicit migration rules protect persisted data integrity across releases and avoid ad hoc conversion logic spread through feature code. This is a **Phase 1 hardening task before SaaS transition** to support safe evolution of customer/workspace data.

- **Ensure no UI-layer dependency leaks into domain/engine**  
  This matters architecturally because keeping domain/engine pure preserves clear boundaries, avoids circular dependencies, and maintains deterministic behavior across rendering surfaces (UI, PDF, APIs). This is a **Phase 1 hardening task before SaaS transition** to preserve long-term maintainability.

- **Add SimulationContext normalization/validation utility at engine boundary**  
  This matters architecturally because canonical UTC ISO-8601 timestamp shape and deterministic execution metadata validation should be enforced before model execution to prevent environment drift and hidden non-determinism. This is a **Phase 1 hardening follow-up** to strengthen reproducibility guarantees without spreading validation into UI/application call sites.


### Post-UI Precision Micro Observations — Phase 1

- HTML5 drag and drop is not mobile-ready (future touch abstraction needed).
- Timeline currently does not enforce module-bound drop constraints.
- No dragover visual preview feedback yet (future UX improvement).
- ProposalDocumentEngine currently recalculates cashflow multiple times per build (micro-optimization candidate).
- Service-to-module mapping currently uses placeholder (service.nome), future structural alignment needed.
- PaymentEditor UX now hardened but still relies on domain layer for final validation (correct separation).

### Post-Section Toggle Architectural Observations — Phase 1

- Section toggles are currently stored in application state only. In future, toggle configuration should become part of ProposalDocument meta to allow deterministic document reconstruction independent of UI state.
- Section toggles are currently global for propostaA only. Future multi-scenario support will require toggle state to be per-proposal to avoid cross-proposal configuration leakage.

### Post-Service Visual Identity Observations — Phase 1

- Hash-based color generation could theoretically cause color similarity collisions.
- Future optional manual override for service color may be needed for branding.
- Stacked cashflow visualization may require grouping/filtering if service count grows significantly.

### Post-Cashflow Engine Optimization — Phase 1

- ProposalDocumentEngine now computes cashflow once per proposal build to eliminate redundant deterministic recomputation.
- Peak month detection currently highlights first occurrence if multiple equal peaks exist (acceptable for Phase 1).

### Post-Engine Test Harness — Phase 1

- Engine-level deterministic test suite introduced for cashflow, validation, and proposal aggregation.
- UI layer intentionally excluded from Phase 1 automated testing.

### Post-Domain Aggregate Hardening (Step 13)

- Step 13 hardened aggregate construction/normalization for the strategic planning slice by introducing domain-owned normalizers for `Service`, `PianoStrategico`, and `Proposta` and wiring boundary sanitize flows to those constructors.
- Remaining aggregate hardening is still required for deeper invariants (for example richer payment-strategy invariants and stronger identity/catalog matching semantics) so external sanitize flows can be reduced over time.
- Coupling-by-shape cleanup remains open where UI/application still share DTO-like shapes directly and should continue via explicit mapper introduction.
- `src/App.tsx` composition density remains a planned cleanup target after this hardening sequence stabilizes.
- Transitional compatibility layer remains in place: boundary-level `sanitizePropostaAtBoundary` orchestration still adapts legacy call sites and should be reduced/removed once construction-time invariants are consistently enforced at write boundaries.

### Post-Domain Aggregate Hardening (Step 14 — Payment Strategy Slice)

- Payment-strategy normalization has been moved closer to the strategic-planning domain aggregate by introducing domain-owned `normalizeStrategiaPagamento` and `normalizePropostaService`, then delegating boundary sanitize flow to these domain constructors.
- Remaining aggregate hardening is still required after this slice (for example stronger constructor-time invariants across additional proposal/service semantics) so the model remains harder to place in invalid states without transitional boundary adaptation.
- Transitional compatibility layer reduction is still pending: `sanitizePropostaAtBoundary` remains active as migration bridge and should be narrowed/removed once all write paths use aggregate-owned constructors directly.
- Coupling-by-shape cleanup remains open where UI/application still share DTO-like shapes directly and should continue via explicit mapper introduction.
- `src/App.tsx` composition density remains a planned cleanup target after this hardening sequence stabilizes.
- Identity-hardening follow-up remains open for service catalog matching: current fallback catalog resolution still contains shape-based matching (`nome` + `prezzoPieno` + `prezzoScontato`) and should migrate to stronger identity-based matching semantics.

### Post-Domain Aggregate Hardening (Step 15 — High-Traffic Proposal A Write Path)

- High-traffic state write path `setPropostaA` now uses domain-owned proposal-write normalization directly via application orchestration (`normalizeProposalForWrite`) instead of routing through transitional `sanitizePropostaAtBoundary`.
- Transitional compatibility narrowing is now concrete but incomplete: `sanitizePropostaAtBoundary` remains active for persisted-state bootstrap, `setPropostaB`, `setPiano`, and catalog mutation re-normalization flows, which remain pending migration slices.
- Remaining domain aggregate hardening is still required so additional proposal/service invariants can move to constructor-owned enforcement and reduce boundary adaptation further.
- Coupling-by-shape cleanup remains open where UI/state/application still share DTO-like structures directly; explicit mapper-based boundaries are still planned.
- `src/App.tsx` composition density remains a planned cleanup target after this write-path migration sequence stabilizes.
- Identity-hardening remains open for catalog matching semantics: fallback matching is still shape-based and should migrate to stronger identity-oriented matching.
- Next high-traffic write-path candidates for direct domain-owned normalization are `setPropostaB` updates and dual-proposal re-normalization triggered by `setPiano`/catalog mutations (`addService`/`removeService`).


### Post-Domain Aggregate Hardening (Step 16 — High-Traffic Proposal B Write Path)

- High-traffic state write path `setPropostaB` now uses domain-owned proposal-write normalization directly via application orchestration (`normalizeProposalForWrite`) instead of routing through transitional `sanitizePropostaAtBoundary`.
- Transitional compatibility narrowing is now advanced again but incomplete: `sanitizePropostaAtBoundary` remains active for persisted-state bootstrap, `setPiano`, and catalog mutation re-normalization flows (`addService`/`removeService`), which remain pending migration slices.
- Remaining domain aggregate hardening is still required after this slice so constructor-owned invariants can continue to replace boundary adaptation across proposal/service semantics.
- Coupling-by-shape cleanup remains open where UI/state/application still share DTO-like structures directly; explicit mapper-based boundaries are still planned.
- `src/App.tsx` composition density remains a planned cleanup target after this write-path migration sequence stabilizes.
- Identity-hardening remains open for catalog matching semantics: fallback matching is still shape-based and should migrate to stronger identity-oriented matching.
- Next best high-traffic write-path target for direct domain-owned normalization is dual-proposal re-normalization triggered by `setPiano`, then catalog-driven re-normalization (`addService`/`removeService`).

### Post-Domain Aggregate Hardening (Step 17 — High-Traffic setPiano Write Path)

- High-traffic state write path `setPiano` now uses domain-owned proposal-write normalization directly via application orchestration (`normalizeProposalForWrite`) for both proposal branches instead of routing through transitional `sanitizePropostaAtBoundary`.
- Transitional compatibility narrowing is now advanced again but incomplete: `sanitizePropostaAtBoundary` remains active for persisted-state bootstrap and catalog mutation re-normalization flows (`addService`/`removeService`), which remain pending migration slices.
- Remaining domain aggregate hardening is still required after this slice so constructor-owned invariants can continue to replace boundary adaptation across proposal/service semantics.
- Coupling-by-shape cleanup remains open where UI/state/application still share DTO-like structures directly; explicit mapper-based boundaries are still planned.
- `src/App.tsx` composition density remains a planned cleanup target after this write-path migration sequence stabilizes.
- Identity-hardening remains open for catalog matching semantics: fallback matching is still shape-based and should migrate to stronger identity-oriented matching.
- Next best high-traffic write-path target for direct domain-owned normalization is catalog-driven dual-proposal re-normalization (`addService`/`removeService`), followed by persisted bootstrap normalization handoff.

### Post-Domain Aggregate Hardening (Step 18 — Catalog Mutation Write Paths)

- High-traffic catalog mutation write paths `addService` and `removeService` now route both proposal branches through domain-owned proposal-write normalization via application orchestration (`normalizeProposalForWrite`) instead of transitional `sanitizePropostaAtBoundary`.
- Transitional compatibility narrowing is now advanced again but incomplete: persisted bootstrap normalization remains the last meaningful sanitizer-owned compatibility path and is the next targeted handoff slice.
- Remaining domain aggregate hardening is still required after this slice so constructor-owned invariants can continue replacing boundary adaptation across proposal/service semantics.
- Coupling-by-shape cleanup remains open where UI/state/application still share DTO-like structures directly; explicit mapper-based boundaries are still planned.
- `src/App.tsx` composition density remains a planned cleanup target after this write-path migration sequence stabilizes.
- Identity-hardening remains open for catalog matching semantics: fallback matching is still shape-based and should migrate to stronger identity-oriented matching.
- Next best cleanup target is persisted bootstrap normalization handoff so transitional `sanitizePropostaAtBoundary` runtime ownership can be narrowed to compatibility fallback only (or removed if coverage allows).

### Post-Domain Aggregate Hardening (Step 19 — Persisted Bootstrap Normalization Handoff)

- Persisted bootstrap normalization in `useAppState` now routes both proposal branches through the same domain-owned write-normalization orchestration (`normalizeProposalForWrite`) already used by runtime proposal updates.
- Transitional sanitizer runtime ownership is now effectively closed for strategic-planning proposal flows: `sanitizePropostaAtBoundary` remains only as compatibility naming/alias wrapper and no longer owns distinct runtime normalization logic.
- Remaining domain aggregate hardening is still required so constructor-owned invariants continue to replace compatibility adaptation across proposal/service semantics.
- Identity-hardening follow-up remains open for catalog matching semantics: fallback catalog resolution is still shape-based and should migrate to stronger identity-oriented matching.
- Coupling-by-shape cleanup remains open where UI/state/application still share DTO-like structures directly; explicit mapper-based boundaries remain planned.
- `src/App.tsx` composition density remains a planned cleanup target once this normalization handoff sequence is stabilized.

### Post-Domain Aggregate Hardening (Step 20 — Catalog/Service Identity-First Matching)

- Catalog/service matching in domain validation now resolves catalog definitions identity-first (`service.id` ⇢ `definition.id`) and only uses shape-based fallback when exactly one unique shape match exists.
- Ambiguous shape-based fallback (`nome` + `prezzoPieno` + `prezzoScontato` collisions) is now intentionally disabled and falls back to deterministic defaults instead of selecting an arbitrary catalog entry.
- Remaining shape-based compatibility is intentionally narrow (unique-shape fallback only) and should be removed once stable catalog identity propagation is complete across legacy payloads.
- Remaining domain aggregate hardening is still required (constructor-time invariants across additional proposal/service semantics remain open).
- Coupling-by-shape cleanup remains open where UI/state/application still exchange DTO-like structures directly; mapper-based boundaries remain planned.
- `src/App.tsx` composition density reduction remains planned after current domain hardening slices.
- Migration follow-up remains required to propagate and preserve stable catalog/service identities consistently across repository/application/UI persistence and import flows so fallback matching can be fully retired.

### Post-Domain Aggregate Hardening (Step 21 — Runtime Service Instance → Catalog Identity Bridge)

- Proposal services created from catalog selections now persist explicit `catalogServiceId` identity while preserving unique runtime `service.id`, allowing identity-first catalog resolution without relying on shape matching for this high-traffic UI write path.
- Domain catalog resolution now checks `service.catalogServiceId` before `service.id`, reducing shape-based fallback reliance for persisted/application/UI flows where runtime instance IDs intentionally differ from catalog IDs.
- Remaining service-ID propagation gaps are still open and explicitly tracked for legacy payload ingestion, repository/application DTO mapping, and import/export payloads that do not yet emit or preserve `catalogServiceId`.
- Remaining shape-based compatibility fallback is intentionally retained only as a narrow compatibility bridge (unique-shape fallback) and should be removed after catalog identity propagation is complete for legacy persisted/import data.
- Remaining coupling-by-shape cleanup is still required where UI/state/application exchange DTO-like service shapes without explicit mapper boundaries.
- `src/App.tsx` composition density reduction remains a planned cleanup target once identity propagation and mapper-boundary slices stabilize.
- Migration/backfill follow-up remains required for legacy persisted cashflow payloads and imported proposals/services so `catalogServiceId` can be populated deterministically where catalog linkage is known.

### Post-Domain Aggregate Hardening (Step 22 — Persisted Bootstrap `catalogServiceId` Backfill)

- Persisted proposal bootstrap normalization now backfills `service.catalogServiceId` when a legacy service payload lacks it but a deterministic catalog match exists (identity-first via `service.id`, then unique-shape compatibility fallback).
- This reduces repeated reliance on shape-based matching within the persisted bootstrap slice because once loaded, normalized proposal services carry explicit catalog linkage through subsequent in-memory write normalization.
- Remaining service-ID propagation gaps are still open for non-bootstrap legacy paths (notably explicit import adapters and any repository/application DTO boundaries that can ingest service payloads without `catalogServiceId`).
- Remaining shape-based compatibility fallback is still intentionally retained only for unique-shape legacy matches and should be removed after full identity propagation/backfill coverage is in place.
- Remaining coupling-by-shape cleanup is still required where UI/state/application exchange DTO-like service payloads directly without explicit mapper boundaries.
- `src/App.tsx` composition density reduction remains planned after identity/backfill and mapper-boundary cleanup slices stabilize.
- Additional migration follow-up is required to decide whether bootstrap backfilled identities should be eagerly re-persisted and to align import/export contracts so UI no longer needs to construct even partial service identity metadata directly.


### Post-Domain Aggregate Hardening (Step 23 — Import/Legacy Bootstrap Identity Persistence)

- Persisted bootstrap import/legacy adaptation now re-persists normalized proposal payloads when legacy services are backfilled with deterministic `catalogServiceId`, reducing repeated shape-based matching on subsequent reloads.
- This slice keeps shape fallback only as a narrow compatibility bridge (unique-shape match) for legacy services that still lack stable identity metadata.
- Governance clarified: UI may transport selected catalog identifiers but must not originate identity enrichment/reconciliation/normalization; this remains application/domain-owned.
- Remaining service-ID propagation gaps are still open for explicit import/export payload contracts and any repository/application mapping paths that can still ingest services without `catalogServiceId`.
- Remaining coupling-by-shape cleanup is still required where UI/state/application exchange DTO-like service payloads directly without explicit mappers.
- `App.tsx` composition density reduction remains open and should be addressed in a focused composition extraction step.
- Migration/backfill follow-up remains: decide whether additional persisted/imported legacy paths should be eagerly rewritten once deterministic identity recovery is possible.
- If still relevant after identity propagation hardening, follow-up should reduce UI responsibility further so UI sends intent/selection while application/state constructs service payload identity consistently.

### Post-Domain Aggregate Hardening (Step 24 — Proposal Export Payload Identity Hardening)

- Proposal-document export adaptation now emits `catalogServiceId` in `ACTIVATED_SERVICES` payload entries while preserving runtime `service.id`, improving identity continuity across proposal-service → export boundaries with minimal compatibility risk.
- Remaining service-ID propagation gaps are still open for other import/export slices and repository/application mapper boundaries that can still accept service payloads without `catalogServiceId`.
- Remaining shape-based compatibility fallback stays intentionally narrow (unique-shape legacy match only) and should be removed after full identity propagation/backfill coverage is complete across non-bootstrap paths.
- Remaining coupling-by-shape cleanup is still required where UI/state/application exchange DTO-like service payloads directly without explicit mapper boundaries.
- `App.tsx` composition density reduction remains an explicit follow-up once identity-propagation and mapper-boundary slices stabilize.
- Migration/backfill follow-up remains open for legacy imported/persisted payload paths beyond bootstrap so deterministic `catalogServiceId` recovery can be eagerly persisted where appropriate.
- UI-responsibility reduction follow-up remains open (if still relevant after identity slices): UI should continue sending user intent/selection while application/domain owns identity enrichment and normalized payload construction.


### Post-Domain Aggregate Hardening (Step 25 — Compare Mapper Identity Continuity Hardening)

- Application compare-chart mapper (`buildCashflowData`) now emits explicit dual identity per service series: `runtimeServiceId` (chart/data key compatibility) and `catalogServiceId` (stable cross-boundary identity), with deterministic fallback `catalogServiceId := runtimeServiceId` only when catalog identity is absent.
- This hardens one remaining application-mapper boundary where service identity had been weak/implicit (`key` only), improving export/import/mapper continuity without changing chart runtime behavior.
- Remaining service-ID propagation gaps are still open for other import/export and repository/application mapping paths that can ingest or emit service payloads without explicit `catalogServiceId`.
- Remaining shape-based compatibility fallback is intentionally retained only as a narrow legacy bridge (unique-shape match) and should be removed after full identity propagation/backfill coverage across non-bootstrap legacy paths.
- Remaining coupling-by-shape cleanup is still required where UI/state/application continue exchanging DTO-like service payloads directly without explicit mapper contracts.
- `src/App.tsx` composition density reduction remains open and should be handled in a focused composition-extraction step after mapper/identity slices stabilize.
- Additional migration/backfill follow-up remains open for legacy imported/persisted payloads and any downstream consumers of compare/export payloads so `catalogServiceId` is eagerly persisted/emitted when deterministic linkage exists.
- UI-responsibility reduction follow-up remains open (if still relevant): UI should transport user intent/selection and display keys, while application/domain continue owning identity enrichment/reconciliation and normalized identity emission.

### Post-Domain Aggregate Hardening (Step 26 — Persisted Import Adapter Canonical Identity Ingestion)

- The persisted cashflow import adapter boundary in `useAppState` now consumes legacy `catalog_service_id` service payload keys and normalizes them into canonical `catalogServiceId` before application/domain write normalization runs.
- This hardens one remaining explicit repository/import boundary where stable service identity could still be dropped despite being present under a legacy key, while preserving runtime `service.id` behavior.
- Governance clarification now captured in protocol docs: legacy alias ingestion is allowed only as a narrow compatibility bridge and must normalize immediately to canonical identity fields at boundary entry.
- Remaining service-ID propagation gaps after this slice are still open for other explicit import/export contracts and repository/application mapper paths that can still ingest or emit service payloads without explicit `catalogServiceId`.
- Remaining shape-based compatibility fallback still retained: unique-shape catalog matching remains a temporary legacy bridge and should be removed after full identity propagation/backfill coverage.
- Remaining coupling-by-shape cleanup still required where UI/state/application exchange DTO-like service shapes directly without explicit mapper boundaries.
- `src/App.tsx` composition density reduction remains an explicit follow-up and should be handled in a dedicated composition extraction slice.
- Additional migration/backfill follow-up remains open for legacy imported/persisted paths beyond this adapter key-alias bridge so deterministic `catalogServiceId` recovery can be eagerly persisted where possible.
- UI-responsibility reduction follow-up remains open (if still relevant): UI should transport intent/selection while application/domain own identity enrichment/reconciliation and canonical identity emission.

### Post-Domain Aggregate Hardening (Step 27 — Add-from-Catalog UI Identity Ownership Boundary)

- Add-from-catalog UI path (`AddServiceToProposal`) now transports only user intent/selection (`catalogServiceId`) and proposal display name; rich proposal-service payload assembly moved into app-state orchestration (`useAppState`) to align with UI boundary ownership.
- Runtime behavior is preserved: app-state orchestration still creates runtime `service.id`, applies catalog-linked defaults, and immediately routes the result through domain/application write normalization.
- Remaining service-ID propagation gaps after this local fix remain open for other import/export and repository/application mapper boundaries that can still ingest or emit service payloads without explicit `catalogServiceId` continuity.
- Remaining shape-based compatibility fallback is still retained (unique-shape catalog matching bridge in domain validation) and should be removed once identity propagation/backfill coverage is complete across legacy paths.
- Remaining coupling-by-shape cleanup is still required where UI/state/application exchange DTO-like service shapes directly without explicit mapper contracts.
- `src/App.tsx` composition density reduction remains open and should be handled in a dedicated composition extraction slice after identity-boundary hardening stabilizes.
- Additional migration/backfill remains open for other import/export/repository/persisted paths so deterministic `catalogServiceId` recovery is eagerly normalized and persisted where possible.
- Further UI-responsibility reduction is still desirable after this slice: continue shifting non-interaction payload-shaping responsibilities out of UI components and into application/state orchestration boundaries.

### Post-Domain Aggregate Hardening (Step 28 — Strategic Planning Explicit Application Mapper Boundary)

- `strategicPlanningService` now routes one coherent strategic-planning slice through explicit application-owned mappers for DTO→domain ingress and domain→DTO egress (`calculateCashflow`, `normalizeProposalForWrite`, `resolvePaymentConstraints`) instead of relying on structural compatibility.
- This local slice clarifies semantic ownership (application contract mapping vs domain normalization) while preserving current runtime behavior and avoiding broad DTO redesign.
- Remaining strategic-planning DTO/domain mapper gaps are still open for adjacent services/orchestrators that continue exchanging shape-compatible contracts without explicit mapper seams.
- Remaining UI deep-shape mutation cleanup is still required where UI/state paths construct or mutate nested proposal-service payloads instead of transporting user intent only.
- Remaining shape-based compatibility fallback is still retained as a narrow legacy bridge (domain `resolveCatalogDefinition` unique-shape match) and should be retired after identity propagation/backfill coverage is complete.
- Persistence/import contract hardening remains open for non-bootstrap import/export/repository boundaries so canonical identity and explicit mapper adaptation are enforced consistently.
- `src/App.tsx` composition density reduction remains open and should be addressed in a dedicated composition-extraction slice after mapper boundary stabilization.
- Further identity propagation and boundary tightening remain open where service payloads can still cross boundaries without deterministic `catalogServiceId` continuity.

### Post-Domain Aggregate Hardening (Step 29 — Compare Orchestration Explicit Mapper Boundary)

- `proposteCompareService` now routes compare/document-adjacent orchestration through explicit application-owned mappers (`proposteCompareMappers`) that project proposal-service DTOs into compare-specific service projections before chart/export DTO emission.
- This slice reduces coupling-by-shape by making identity, pricing, and timeline projection intent explicit (`runtimeServiceId`, `catalogServiceId`, `effectivePrice`, `startMonth`) while preserving current compare runtime behavior.
- Remaining strategic-planning mapper gaps still open after this slice: proposal-document orchestration still builds section payloads directly from domain-shaped structures without a dedicated application mapper boundary.
- Remaining UI deep-shape mutation cleanup still required in compare/proposal editing paths where nested proposal-service DTO updates are authored directly in UI composition handlers.
- Remaining shape-based compatibility fallback still retained: catalog identity fallback (`catalogServiceId := runtimeServiceId`) remains as a narrow compatibility bridge and should be retired after deterministic identity backfill.
- Persistence/import contract hardening still needed for non-bootstrap import/export/repository paths so compare/document contracts always receive canonical identities through explicit mapper adaptation.
- `src/App.tsx` composition density reduction remains open and should be addressed as a dedicated extraction slice after current mapper-boundary cleanup stabilizes.
- Further identity propagation/boundary tightening still needed for legacy/persisted service payloads and downstream consumers that may still cross boundaries without guaranteed `catalogServiceId` continuity.


### Post-Domain Aggregate Hardening (Step 30 — Proposal-Document Activated-Services Mapper Boundary)

- Proposal-document orchestration now includes an explicit application-owned mapper seam for `ACTIVATED_SERVICES` payload preparation: `proposalDocumentService` maps proposal DTOs into a document payload projection before engine section emission.
- Runtime behavior is preserved for this slice: payload keys and section ordering remain unchanged while payload ownership becomes explicit at the application boundary.
- Remaining proposal-document/strategic-planning mapper gaps still open after this slice: other proposal-document sections (strategic plan, financial, comparison, and placeholder sections) still rely on engine-local raw shape assembly without dedicated application mapper projections.
- Remaining UI deep-shape mutation cleanup still required where UI/state handlers continue authoring nested proposal/service DTO updates directly instead of transporting narrow user intent.
- Remaining shape-based compatibility fallback still retained: catalog identity fallback (`catalogServiceId := runtimeServiceId`) and unique-shape legacy matching remain as compatibility bridges pending full identity propagation/backfill.
- Persistence/import contract hardening still needed for non-bootstrap import/export/repository boundaries so canonical identity and mapper adaptation are guaranteed before application/document orchestration.
- `src/App.tsx` composition density reduction remains open and should be addressed in a dedicated composition extraction slice after mapper-boundary stabilization.
- Further identity propagation and boundary tightening remain open for legacy/persisted/imported service payloads and downstream consumers that can still cross boundaries without deterministic `catalogServiceId` continuity.


### Post-Domain Aggregate Hardening (Step 31 — Proposal-Document Financial/Comparison Mapper Boundary)

- Proposal-document orchestration now routes `FINANCIAL_PROPOSAL` and `COMPARISON` through explicit application-owned mappers (`proposalDocumentService` + `proposalDocumentMappers`) before engine section emission, reducing coupling-by-shape for one high-value section slice while preserving section payload behavior.
- Durable clarification captured: proposal-document high-value section payloads are application contract projections first and engine-emission payloads second; the engine may retain local fallback builders only as compatibility bridges when prepared payloads are not supplied.
- Remaining proposal-document mapper gaps still open after this slice: strategic-plan and remaining placeholder/auxiliary section payloads are still assembled engine-locally without dedicated application-owned projection mappers.
- Remaining UI deep-shape mutation cleanup still required where UI/state handlers continue authoring nested proposal/service DTO updates directly instead of transporting narrow user intent.
- Remaining shape-based compatibility fallback still retained: catalog identity fallback (`catalogServiceId := runtimeServiceId`) and unique-shape legacy catalog matching remain as temporary bridges pending full identity propagation/backfill completion.
- Persistence/import contract hardening still needed for non-bootstrap import/export/repository boundaries so canonical identity and explicit mapper adaptation are guaranteed before application/document orchestration.
- `src/App.tsx` composition density reduction remains open and should be addressed in a dedicated composition extraction slice after current mapper-boundary cleanup stabilizes.
- Further identity propagation and boundary tightening still needed for legacy/persisted/imported service payloads and downstream consumers that can still cross boundaries without deterministic `catalogServiceId` continuity.


### Post-Domain Aggregate Hardening (Step 32 — Proposal-Document Strategic-Plan Mapper Boundary)

- Proposal-document orchestration now routes `STRATEGIC_PLAN` through an explicit application-owned mapper (`proposalDocumentService` + `proposalDocumentMappers`) before engine section emission, reducing coupling-by-shape for this strategic-planning section while preserving payload semantics.
- Durable clarification captured: proposal-document strategic-planning data exposed to document/export flows is an application-owned projection contract; engine-local section builders remain compatibility fallbacks only when prepared payloads are not provided.
- Remaining proposal-document mapper gaps still open after this slice: placeholder/auxiliary sections are still assembled engine-locally without dedicated application-owned projection mappers.
- Remaining UI deep-shape mutation cleanup still required where UI/state handlers continue authoring nested proposal/service DTO updates directly instead of transporting narrow user intent.
- Remaining shape-based compatibility fallback still retained: catalog identity fallback (`catalogServiceId := runtimeServiceId`) and unique-shape legacy catalog matching remain as temporary bridges pending full identity propagation/backfill completion.
- Persistence/import contract hardening still needed for non-bootstrap import/export/repository boundaries so canonical identity and explicit mapper adaptation are guaranteed before application/document orchestration.
- `src/App.tsx` composition density reduction remains open and should be addressed in a dedicated composition extraction slice after current mapper-boundary cleanup stabilizes.
- Further identity propagation and boundary tightening still needed for legacy/persisted/imported service payloads and downstream consumers that can still cross boundaries without deterministic `catalogServiceId` continuity.

### Post-Domain Aggregate Hardening (Step 33 — Payment Strategy Intent Boundary in UI)

- Payment-strategy editing in `PaymentEditor` no longer reconstructs full nested `proposta.servizi[*].strategiaPagamento` graphs in UI; UI now emits narrow payment intents (`serviceId` + changed payment fields), and app-state orchestration applies/normalizes the rich update.
- Durable clarification: proposal-editing UI surfaces should prefer intent payloads over deep DTO mutation, while state/application boundaries remain responsible for assembling nested proposal/service/payment update shapes before normalization.
- Remaining UI deep-shape mutation cleanup still required after this slice:
  - timeline drag/move update path in `src/App.tsx` still reconstructs nested service shape for month changes.
  - plan/module editing in `PianoEditor` still emits full `PianoStrategico` objects instead of narrower edit intents.
  - additional proposal/service mutation handlers in UI/state still operate on DTO-like nested structures directly.
- Remaining proposal-document mapper gaps: placeholder/auxiliary proposal-document sections are still engine-local shape assembly paths without dedicated application-owned projection mappers.
- Remaining shape-based compatibility fallback retained: catalog identity fallback (`catalogServiceId := runtimeServiceId`) and unique-shape legacy catalog matching are still active compatibility bridges.
- Persistence/import contract hardening still needed for non-bootstrap import/export/repository boundaries to guarantee canonical identity propagation and mapper adaptation before orchestration.
- `src/App.tsx` composition density reduction remains open and should be handled in a focused composition-extraction slice after current UI intent-boundary cleanup stabilizes.
- Further identity propagation and boundary tightening still needed for legacy/persisted/imported service payloads and downstream consumers where deterministic `catalogServiceId` continuity is not yet guaranteed.

### Post-Domain Aggregate Hardening (Step 34 — Timeline Month-Move Intent Boundary in UI)

- Timeline drag/move handling in `src/App.tsx` no longer reconstructs nested `proposta.servizi[*].service` objects directly; UI now emits narrow month-move intents (`serviceId` + `month`) to app-state orchestration.
- App-state orchestration (`useAppState`) now owns the richer proposal update assembly for timeline moves through dedicated intent handlers (`updatePropostaAServiceStartMonth`, `updatePropostaBServiceStartMonth`) that apply the nested update and then run canonical proposal normalization/persistence.
- Durable clarification: timeline/editor UI interactions should transport schedule-change intent only, while state/application boundaries own nested proposal/service graph assembly and normalization before persistence.
- Remaining UI deep-shape mutation cleanup still required after this slice:
  - plan/module editing in `PianoEditor` still emits full `PianoStrategico` payloads rather than narrower edit intents.
  - additional proposal/service mutation handlers in UI/state still operate on DTO-like nested structures directly.
- Remaining proposal-document mapper gaps: placeholder/auxiliary proposal-document sections are still engine-local shape assembly paths without dedicated application-owned projection mappers.
- Remaining shape-based compatibility fallback retained: catalog identity fallback (`catalogServiceId := runtimeServiceId`) and unique-shape legacy catalog matching are still active compatibility bridges.
- Persistence/import contract hardening still needed for non-bootstrap import/export/repository boundaries to guarantee canonical identity propagation and mapper adaptation before orchestration.
- `src/App.tsx` composition density reduction remains open and should be handled in a focused composition-extraction slice after current UI intent-boundary cleanup stabilizes.
- Further identity propagation and boundary tightening still needed for legacy/persisted/imported service payloads and downstream consumers where deterministic `catalogServiceId` continuity is not yet guaranteed.

### Post-Domain Aggregate Hardening (Step 35 — Local Persistence Bootstrap Contract Hardening)

- Local cashflow bootstrap ingress now uses an explicit persistence decode boundary (`cashflowBootstrapDecoder`) that isolates parse/shape-gate/legacy-alias canonicalization before proposal normalization orchestration.
- Durable clarification: local persisted payload ingestion follows the same boundary rule as import/repository adapters—compatibility alias handling belongs inside narrow decode adapters, while business normalization remains in application/domain orchestration.
- Remaining persistence/import contract hardening gaps after this slice:
  - service-catalog local payloads still rely on shallow array-shape acceptance and need explicit element-level decoding.
  - import/export payload ingress still needs equivalent decode adapters and explicit schema/version-aware dispatch.
  - repository/infrastructure runtime decode boundaries still need explicit adapter enforcement at non-local persistence edges.
- Remaining identity continuity gaps at persistence/import boundaries:
  - legacy/externally-ingested payloads can still arrive without deterministic `catalogServiceId` propagation.
  - stable identity backfill/migration coverage remains incomplete for existing persisted/imported records.
- Remaining shape-based compatibility fallback retained:
  - unique-shape catalog matching fallback remains active as a temporary bridge for legacy records.
  - compatibility acceptance still exists for non-cashflow persisted payloads pending targeted decoder slices.
- Remaining repository/infra runtime decode hardening still needed:
  - infrastructure adapters still require explicit runtime decoders and rejection/fallback semantics instead of implicit structural acceptance.
- `src/App.tsx` composition density reduction remains an open cleanup target and should stay scoped as a dedicated composition extraction slice.
- Persisted payload migration/versioning/backfill follow-up still needed:
  - introduce a minimal versioned envelope/decoder dispatch for local persisted contracts once adjacent slices are hardened.
  - define deterministic migration/backfill for legacy alias keys and identity continuity fields across local/import/repository ingress.

### Post-Domain Aggregate Hardening (Step 36 — Service Catalog Local Persistence Decoder Hardening)

- Service catalog local persistence ingress now uses an explicit decode/adaptation boundary (`serviceCatalogBootstrapDecoder`) that isolates raw payload read, array-level gating, and per-entry decode before app-state orchestration uses the catalog.
- Runtime behavior remains coherent and incremental: valid persisted catalog entries continue loading, invalid entries now fall back safely by being dropped, and non-array payloads resolve deterministically to an empty catalog.
- Durable clarification: persistence ingress adapters own compatibility and structural acceptance concerns; application/domain normalization continues owning business invariants and catalog/proposal semantic reconciliation.
- Remaining persistence/import contract hardening gaps after this slice:
  - non-local import/export payload ingestion still needs explicit decode adapters with schema/version-aware dispatch.
  - repository/infrastructure runtime ingress still needs explicit decoder enforcement instead of structural acceptance.
- Remaining identity continuity gaps at persistence/import boundaries:
  - non-local service payloads can still cross boundaries without guaranteed `catalogServiceId` continuity.
  - deterministic identity backfill/migration is still required for already persisted/imported legacy records.
- Remaining shape-based compatibility fallback still retained:
  - unique-shape catalog matching fallback remains active in domain validation as a temporary legacy bridge.
  - compatibility fallback remains on adjacent import/export/repository seams pending targeted decoder slices.
- Remaining repository/infra runtime decode hardening still needed:
  - repository adapter ingress should adopt explicit per-record decode/fallback behavior aligned with local persistence decoders.
- `src/App.tsx` composition density reduction remains open and should stay a dedicated follow-up slice after persistence/import boundary hardening stabilizes.
- Persisted payload migration/versioning/backfill follow-up still needed:
  - introduce minimal persisted-envelope versioning/decoder dispatch across local/import/repository contracts.
  - define deterministic backfill for legacy service identity fields and compatibility aliases during ingestion.

### Post-Domain Aggregate Hardening (Step 37 — Intake Repository/Infra Runtime Decode Hardening)

- Supabase intake repository ingress now uses an explicit runtime decode/adaptation boundary (`intakeRowDecoder`) that isolates raw persistence row shape from canonical `IntakeRecord` emission before repository data re-enters application flow.
- Runtime behavior remains coherent and incremental: valid intake rows are accepted and returned unchanged semantically, while malformed row shapes now fail fast with explicit decode errors instead of relying on static typing assumptions.
- Durable clarification: repository/infra adapters must own external row decoding and compatibility normalization at ingress; business normalization remains outside infra in application/domain orchestration.
- Remaining persistence/import contract hardening gaps after this slice:
  - workspace repository ingress still relies on structural trust and needs an equivalent runtime row decoder.
  - additional repository/infra adapters (auth and any future external adapters) still need explicit decode boundaries where external payloads enter the app.
  - non-local import/export payload ingress still needs explicit decoder dispatch and schema/version-aware adaptation.
- Remaining identity continuity gaps at persistence/import boundaries:
  - non-intake payload seams still have incomplete deterministic identity propagation/backfill (for example catalog-linked IDs across import/export and repository boundaries).
  - historical persisted/imported records still need deterministic identity backfill strategy where canonical IDs are missing.
- Remaining shape-based compatibility fallback still retained:
  - unique-shape catalog matching fallback in domain validation remains a temporary bridge for legacy payloads.
  - compatibility acceptance fallback is still present in non-intake repository/import seams until targeted decoders are added.
- Remaining repository/infra runtime decode hardening still needed in other slices:
  - workspace repository is the next high-leverage ingress candidate for explicit runtime decode/adaptation.
- `src/App.tsx` composition density reduction remains open and should stay scoped as a dedicated composition extraction step after persistence/repository ingress hardening stabilizes.
- Migration/versioning/backfill follow-up still needed for persisted/imported payloads:
  - define a minimal versioned envelope and decoder dispatch strategy across local persistence, import/export payloads, and repository ingress contracts.
  - define deterministic migration/backfill for legacy compatibility keys and identity continuity fields during ingestion.

### Post-Domain Aggregate Hardening (Step 38 — Workspace Repository/Infra Runtime Decode Hardening)

- Supabase workspace repository ingress now uses an explicit runtime decode/adaptation boundary (`workspaceRowDecoder`) that isolates raw persistence row shape from canonical `WorkspaceRecord` emission before repository data re-enters application flow.
- Runtime behavior remains coherent and incremental: valid workspace rows are accepted with the same canonical fields, while malformed row shapes now fail fast with explicit decode errors instead of relying on static typing assumptions.
- Durable clarification: every external repository/infra ingress must expose a local runtime decode seam (raw row shape → structural guard/decode → canonical repository record) and keep business normalization out of infra adapters.
- Remaining persistence/import contract hardening gaps after this slice:
  - auth/external repository adapters still need explicit runtime decode/adaptation where external payloads enter app flow.
  - non-local import/export ingress still needs explicit decode adapters with schema/version-aware dispatch.
- Remaining identity continuity gaps at persistence/import boundaries:
  - non-workspace/intake payload seams still have incomplete deterministic identity propagation/backfill (for example catalog-linked IDs across import/export and repository boundaries).
  - historical persisted/imported records still need deterministic identity backfill strategy where canonical IDs are missing.
- Remaining shape-based compatibility fallback still retained:
  - unique-shape catalog matching fallback in domain validation remains a temporary bridge for legacy payloads.
  - compatibility acceptance fallback remains in non-hardened import/export and repository seams pending targeted decoders.
- Remaining repository/infra runtime decode hardening still needed in other slices:
  - auth repository ingress and future external adapters remain pending explicit runtime row decoders.
- `src/App.tsx` composition density reduction remains open and should stay scoped as a dedicated composition extraction step after persistence/repository ingress hardening stabilizes.
- Migration/versioning/backfill follow-up still needed for persisted/imported payloads:
  - define a minimal versioned envelope and decoder dispatch strategy across local persistence, import/export payloads, and repository ingress contracts.
  - define deterministic migration/backfill for legacy compatibility keys and identity continuity fields during ingestion.

### Post-Domain Aggregate Hardening (Step 39 — Cashflow Bootstrap Versioned Envelope / Decoder Dispatch)

- Cashflow local persistence bootstrap ingress now uses an explicit version-aware decode boundary (`cashflowBootstrapDecoder`) with envelope/version detection and dispatch (`version: 1` envelope) before existing compatibility canonicalization and application/state normalization handoff.
- Runtime behavior remains coherent and incremental: legacy unversioned persisted cashflow payloads continue to load through the legacy decode path, current writes are now persisted in a `version: 1` envelope, and unsupported/unknown versioned envelopes fail closed to safe defaults.
- Durable clarification: persistence compatibility must be governed at ingress by explicit version-aware decoder dispatch; seam-local shape compatibility fallback is legacy-only and should not be the forward evolution mechanism.
- Remaining persistence/import contract hardening gaps after this slice:
  - service-catalog local persistence still lacks a versioned envelope/dispatch contract (it has decode guards but no explicit envelope version strategy).
  - non-local import/export payload ingress still lacks explicit version-aware decoder dispatch and compatibility adaptation.
  - auth/external repository ingress still needs runtime decoder hardening where external payloads enter app flow.
- Remaining identity continuity gaps at persistence/import boundaries:
  - non-cashflow payload seams still allow records/imports without deterministic identity continuity (`catalogServiceId`) across all boundaries.
  - deterministic migration/backfill strategy for already persisted/imported legacy identity gaps remains pending.
- Remaining shape-based compatibility fallback still retained:
  - cashflow unversioned payload-shape fallback remains intentionally retained as a temporary compatibility bridge for already persisted legacy local data.
  - unique-shape catalog matching fallback remains active in domain validation as a temporary bridge for legacy records.
  - non-hardened import/export and repository seams still retain shape-based acceptance fallback pending targeted decoder slices.
- Remaining repository/infra runtime decode hardening still needed:
  - auth repository ingress and future external adapters remain pending explicit runtime row decoders.
- `src/App.tsx` composition density reduction remains open and should stay a dedicated composition extraction step after persistence/import/ingress hardening stabilizes.
- Migration/versioning/backfill follow-up still needed for persisted/imported payloads:
  - define rollout strategy for adding versioned envelopes/decoder dispatch to remaining local persisted families (starting with service catalog).
  - define import/export versioned envelope contracts and migration/backfill policy for legacy payloads.
  - define deterministic backfill/rewrite policy for legacy persisted cashflow entries currently accepted via unversioned fallback (including any eventual sunset of shape-based fallback).

### Post-Domain Aggregate Hardening (Step 40 — Service Catalog Versioned Envelope / Decoder Dispatch)

- Service catalog local persistence now uses an explicit version-aware ingress seam (`serviceCatalogBootstrapDecoder`) with envelope/version detection and version-specific dispatch (`version: 1`) before per-item decode/canonicalization enters app-state orchestration.
- Runtime behavior remains incremental and coherent: legacy unversioned array payloads continue to decode, new service-catalog writes persist in a `version: 1` envelope, and unsupported/unknown versioned envelopes fail closed to an empty-catalog fallback.
- Durable clarification: local persisted payload families should evolve via explicit envelope/version dispatch at ingress; retained shape-based fallback is compatibility-only for legacy data and not the forward contract.
- Remaining persisted/import families still lacking versioned envelope or decoder dispatch:
  - non-local import/export payload ingress contracts.
  - remaining external repository ingress contracts beyond currently hardened slices.
- Remaining persistence/import contract hardening gaps after this slice:
  - import/export boundaries still need explicit runtime decoders and schema/version-aware dispatch.
  - cross-boundary mapper contracts still need tighter canonical identity guarantees before orchestration.
- Remaining identity continuity gaps at persistence/import boundaries:
  - non-local payload seams can still ingest/emit service payloads without deterministic `catalogServiceId` continuity.
  - deterministic legacy identity backfill policy across persisted/imported records remains open.
- Remaining shape-based compatibility fallback still retained:
  - service-catalog legacy unversioned array acceptance remains as a compatibility bridge.
  - unique-shape catalog matching fallback in domain validation remains active for legacy records.
  - non-hardened import/export and repository seams still retain structural fallback pending targeted decoders.
- Remaining repository/infra runtime decode hardening still needed:
  - auth/external adapter ingress paths still need explicit runtime decode/adaptation seams.
- `src/App.tsx` composition density reduction remains open and should remain a dedicated follow-up after persistence/import boundary hardening stabilizes.
- Migration/backfill strategy still needed for legacy persisted payloads:
  - define staged rewrite/backfill policy for legacy unversioned service-catalog entries once read and decoded safely.
  - define sunset criteria for legacy shape-based fallback acceptance after migration coverage is validated.

### Post-Domain Aggregate Hardening (Step 41 — Auth/External Adapter Runtime Decode Hardening)

- Supabase auth/external adapter ingress now uses an explicit runtime decode/adaptation seam (`authSessionDecoder`) that isolates raw external session payload shape from canonical `AuthSession` emission before repository/application-facing auth flow.
- Runtime behavior remains coherent and incremental: valid sessions are accepted with canonical user projection, null/unauthenticated sessions remain accepted as `null`, and malformed external auth payload shapes now fail fast with explicit decode errors instead of static SDK-shape trust.
- Durable clarification: external auth/session ingress follows the same boundary rule as other repository/infra seams (raw external payload -> runtime decode/guard -> canonical repository contract) while keeping business normalization outside infra adapters.
- Remaining persistence/import contract hardening gaps after this slice:
  - non-local import/export payload ingress still needs explicit runtime decoders with schema/version-aware dispatch.
  - cross-boundary mapper contracts still need stronger canonical identity continuity guarantees before orchestration.
- Remaining identity continuity gaps at persistence/import boundaries:
  - non-local import/export payload seams can still ingest/emit service payloads without deterministic `catalogServiceId` continuity.
  - deterministic legacy identity backfill policy across persisted/imported records remains pending.
- Remaining shape-based compatibility fallback still retained:
  - legacy unversioned local-persistence fallback remains active for cashflow/service-catalog payload compatibility.
  - unique-shape catalog matching fallback in domain validation remains active as a temporary bridge for legacy records.
  - non-hardened import/export seams still retain structural fallback pending targeted decoder slices.
- Remaining repository/infra runtime decode hardening still needed in other slices:
  - future external repository adapters beyond intake/workspace/auth still require explicit ingress decoder seams when introduced.
  - any remaining direct external SDK ingress outside adapter decode seams should be migrated to runtime-decoded adapter contracts.
- `src/App.tsx` composition density reduction remains open and should stay scoped as a dedicated composition extraction slice after boundary hardening stabilizes.
- Migration/versioning/backfill follow-up still needed for persisted/imported payloads:
  - define import/export versioned envelope contracts and decoder dispatch policy.
  - define staged migration/backfill and sunset criteria for retained legacy shape-based compatibility paths.
- Remaining non-local import/export payload hardening still needed:
  - add explicit import/export decode adapters that enforce canonical contracts before payloads enter application orchestration.

### Post-Domain Aggregate Hardening (Step 42 — Non-Local Intake Write Payload Decode/Adaptation Boundary)

- Non-local intake persistence write ingress (`supabaseIntakeRepository` create/update paths) now routes through an explicit runtime decode/adaptation seam (`intakeWritePayloadAdapter`) before Supabase SDK calls, isolating raw repository input shape from canonical external write payloads.
- Runtime behavior remains coherent and low-risk: valid create/update payloads are forwarded with the same canonical field names, while malformed write payloads now fail fast at the infra boundary instead of entering external orchestration/storage by structural trust alone.
- Durable clarification captured: non-local repository/infra boundaries must apply runtime adaptation on both ingress reads and egress writes when crossing into external SDK/database payload contracts.
- Remaining persistence/import contract hardening gaps after this slice:
  - non-local import/export payload ingress still needs explicit runtime decoders and, where applicable, version-aware dispatch.
  - additional non-local write boundaries (beyond intake) still need explicit external write payload adapters where structural forwarding remains.
- Remaining identity continuity gaps at persistence/import boundaries:
  - non-local import/export seams can still ingest/emit service payloads without deterministic `catalogServiceId` continuity.
  - deterministic identity continuity policy for imported/exported proposal/service payloads remains pending.
- Remaining shape-based compatibility fallback still retained:
  - legacy unversioned local persistence fallback remains active for cashflow and service-catalog compatibility.
  - unique-shape catalog matching fallback remains active in domain validation for legacy records.
  - non-hardened import/export seams still retain structural fallback pending targeted decoder/adaptation slices.
- Remaining repository/infra runtime decode hardening still needed in other slices:
  - future external repository adapters must introduce explicit row decoders and write adapters at their external boundaries.
  - existing non-intake write paths should be reviewed for direct pass-through external payload writes.
- `src/App.tsx` composition density reduction remains open and should continue as a dedicated follow-up after persistence/import boundary hardening stabilizes.
- Migration/versioning/backfill follow-up still needed for persisted/imported payloads:
  - define import/export versioned envelope contracts and decoder-dispatch strategy.
  - define staged migration/backfill and sunset criteria for retained shape-based compatibility bridges.
- Remaining non-local import/export payload hardening still needed after this slice:
  - add explicit decode/adaptation boundaries for non-local import/export payload ingestion before application orchestration.

### Post-Domain Aggregate Hardening (Step 43 — Non-Local Workspace Write Payload Decode/Adaptation Boundary)

- Non-local workspace persistence write egress (`supabaseWorkspaceRepository` create/update paths) now passes through an explicit runtime decode/adaptation seam (`workspaceWritePayloadAdapter`) before Supabase SDK calls, reducing structural trust of external write payload contracts.
- Runtime behavior remains coherent and incremental: valid workspace create/update payloads preserve existing canonical field emission (`workspace_name`, `workspace_slug`), while malformed shapes now fail fast at the infra boundary with explicit adapter errors.
- Durable clarification: the protocol rule for external write boundaries is now concretely applied to both high-traffic repository families (`intake` and `workspace`), reinforcing that repository input contracts must be runtime-adapted before external orchestration/storage.
- Remaining non-local import/export payload hardening gaps after this slice:
  - non-local import/export ingress boundaries outside current repository seams still need explicit decode/adaptation before application orchestration.
  - external payload families beyond intake/workspace/auth remain to be hardened with targeted runtime boundary adapters as they are introduced or discovered.
- Remaining identity continuity gaps at import/export boundaries:
  - import/export proposal/service payload seams still lack guaranteed end-to-end `catalogServiceId` continuity.
  - deterministic backfill policy for legacy payloads lacking explicit catalog identity is still required.
- Remaining shape-based compatibility fallback still retained:
  - legacy unversioned local bootstrap fallback remains active for cashflow/service-catalog compatibility.
  - unique-shape catalog matching fallback remains active in domain validation as a temporary bridge.
- Remaining repository/infra runtime decode hardening still needed:
  - direct non-local import/export ingestion paths still require explicit runtime decoders and compatibility narrowing.
  - any future repository adapter must include ingress decode + egress adaptation seams as baseline contract hardening.
- `src/App.tsx` composition density reduction remains explicitly open and should remain a separate focused cleanup slice.
- Migration/versioning/backfill/sunset follow-up still needed for legacy payload compatibility:
  - define version-aware envelopes and decoder dispatch for remaining non-local import/export families.
  - define staged migration/backfill and explicit sunset criteria for remaining shape-based compatibility bridges.
- Remaining external payload families still lacking canonical version-aware decode/adaptation:
  - proposal/strategic-planning import-export payload families still need explicit canonical runtime boundary modules with version-aware compatibility handling where applicable.


### Post-Domain Aggregate Hardening (Step 44 — Proposal Import Payload Decode/Adaptation Seam)

- Strategic-planning proposal non-local payload family is now explicitly hardened at runtime via `proposalImportPayloadDecoder`, which isolates raw proposal payload shape/legacy alias handling from canonical `Proposta` emission before orchestration-normalization paths consume imported payloads.
- Cashflow bootstrap decode now delegates proposal ingress decoding to that explicit seam, reducing structural trust of incoming proposal payloads and failing closed when a proposal/service/payment subtree is malformed.
- Identity continuity improved in this slice: legacy `catalog_service_id` compatibility is adapted immediately to canonical `catalogServiceId` in the proposal decoder so downstream orchestration no longer relies on ad hoc alias trust.
- Version-aware behavior remains explicit and coherent: existing cashflow envelope dispatch (`version: 1`) is preserved, legacy unversioned fallback remains compatibility-only, and malformed proposal payloads now fail closed instead of entering orchestration.
- Durable clarification reinforced: proposal/strategic-planning external payloads should pass through dedicated decode/adaptation seams that separate compatibility parsing from business normalization; domain/application normalization remains downstream.
- Remaining non-local import/export payload hardening gaps after this slice:
  - strategic plan (`piano`) import payload still relies on structural trust and needs its own explicit decoder/adaptation seam.
  - proposal-document roundtrip import payload boundaries still need explicit runtime decode/adaptation modules.
  - additional non-local strategic-planning import/export families still lacking canonical version-aware decode/adaptation remain pending.
- Remaining identity continuity gaps at import/export boundaries:
  - not all external strategic-planning payload families guarantee deterministic `catalogServiceId` continuity.
  - legacy payload backfill/rewrite policy for missing catalog identity remains to be defined.
- Remaining shape-based compatibility fallback still retained:
  - legacy unversioned cashflow/service-catalog payload acceptance remains a temporary compatibility bridge.
  - unique-shape catalog resolution fallback in domain validation is still retained for legacy records.
- Remaining repository/infra runtime decode hardening still needed:
  - future non-local adapters and external ingress boundaries must keep adding explicit decode/adaptation seams (read ingress and write egress).
- `src/App.tsx` composition density reduction remains open as a dedicated follow-up and is intentionally not expanded in this slice.
- Migration/versioning/backfill/sunset follow-up still needed for legacy payloads:
  - define versioned envelope + dispatch strategy for remaining strategic-planning import/export families.
  - define staged migration/backfill and explicit sunset criteria for legacy alias/unversioned compatibility acceptance.

### Post-Domain Aggregate Hardening (Step 45 — Strategic Plan (`piano`) Import Payload Decode/Adaptation Seam)

- Strategic-plan import payload family is now explicitly runtime-decoded via `pianoImportPayloadDecoder` before cashflow bootstrap orchestration consumes `PianoStrategico`, reducing direct structural trust on `piano` payloads.
- Cashflow bootstrap ingress now requires both proposal and strategic-plan subtrees to decode successfully before payload acceptance; malformed `piano` payloads fail closed while version-dispatch behavior remains unchanged (`version: 1` envelope accepted, unsupported versions rejected, legacy unversioned fallback retained for compatibility).
- Canonical output is now explicit at the boundary: strategic-plan compatibility aliases are adapted to canonical DTO fields (`durataTotale`, `moduli[].meseInizio`) in the decoder seam, while business/domain normalization remains downstream.
- Durable architectural clarification: strategic-planning import payload families should be hardened per-subtree (proposal and piano) with dedicated decode/adaptation modules at ingress boundaries, keeping compatibility parsing separate from orchestration and domain normalization concerns.
- Remaining non-local import/export hardening gaps after this slice:
  - proposal-document import roundtrip payload families still need explicit runtime decode/adaptation seams.
  - additional external strategic-planning import/export payload families still need canonical version-aware decode/adaptation modules.
  - non-local import/export seams outside current bootstrap/repository hardening slices still require explicit runtime decoder/adapters before orchestration.
- Remaining identity continuity gaps at import/export boundaries:
  - deterministic `catalogServiceId` continuity is still not guaranteed across every external strategic-planning import/export family.
  - migration/backfill policy for legacy payloads missing canonical catalog identity is still required.
- Remaining shape-based compatibility fallback still retained:
  - legacy unversioned cashflow/service-catalog bootstrap acceptance remains active as a temporary compatibility bridge.
  - unique-shape catalog matching fallback in domain validation remains active pending full identity propagation and backfill.
- Remaining repository/infra runtime decode hardening still needed:
  - future external repository/import adapters must keep adding explicit runtime ingress decoders and egress adapters.
  - any direct external SDK ingress/egress that still bypasses decode/adaptation seams remains to be tightened.
- `src/App.tsx` composition density reduction remains open and intentionally out of scope for this payload-hardening slice.
- Migration/versioning/backfill/sunset follow-up still needed for legacy payloads:
  - define explicit versioned envelope and decoder dispatch strategy for remaining strategic-planning import/export payload families.
  - define staged legacy compatibility migration/backfill plan and explicit sunset criteria for unversioned/alias compatibility bridges.
- Remaining external payload families still lacking canonical version-aware decode/adaptation:
  - proposal-document payload families.
  - remaining strategic-planning import/export payload families outside the cashflow bootstrap `piano` + proposal seams.

### Post-Domain Aggregate Hardening (Step 46 — Proposal-Document ACTIVATED_SERVICES Roundtrip Decode/Adaptation Seam)

- Proposal-document `ACTIVATED_SERVICES` roundtrip payload family now has an explicit runtime decode/adaptation seam via `proposalDocumentRoundtripPayloadDecoder` before prepared payloads can re-enter proposal-document orchestration.
- Version-aware behavior is now explicit for this family: `version: 1` envelopes are accepted, legacy unversioned payloads remain compatibility-supported, and unsupported envelope versions fail closed.
- Canonical boundary output is now explicit for this slice: legacy `catalog_service_id` aliases are adapted to canonical `catalogServiceId` at decode time, improving service identity continuity for document-facing payload re-entry.
- Structural trust is reduced with low blast radius: malformed prepared roundtrip payloads no longer flow through by shape trust and instead safely fall back to computed `ACTIVATED_SERVICES` payload generation.
- Durable architectural clarification: proposal-document roundtrip payload families should be hardened section-by-section with narrow decode/adaptation seams, keeping compatibility parsing/version dispatch separate from orchestration and business normalization.
- Remaining non-local import/export hardening gaps after this slice:
  - proposal-document roundtrip families beyond `ACTIVATED_SERVICES` (for example `STRATEGIC_PLAN`, `FINANCIAL_PROPOSAL`, and `COMPARISON` payload re-entry) still need explicit decode/adaptation seams.
  - additional non-local strategic-planning and document-derived import/export families still lacking canonical version-aware decode/adaptation remain pending.
  - non-local import/export seams outside current bootstrap/repository/document slices still require explicit runtime decoder/adapters.
- Remaining identity continuity gaps at import/export boundaries:
  - deterministic `catalogServiceId` continuity is still not guaranteed across all proposal-document section payload families and adjacent import/export contracts.
  - legacy payload backfill policy for records missing canonical catalog identity remains required.
- Remaining shape-based compatibility fallback still retained:
  - legacy unversioned acceptance for multiple bootstrap/import/export payload families remains active as a temporary compatibility bridge.
  - legacy alias compatibility (including snake_case variants) remains in place pending migration and sunset.
- Remaining repository/infra runtime decode hardening still needed:
  - direct external SDK ingress/egress seams outside currently hardened adapters still need explicit decode/adaptation boundaries.
  - future repository/infra adapters must continue adding fail-closed runtime ingress decoders and explicit write adapters.
- `src/App.tsx` composition density reduction remains open and intentionally out of scope for this payload-hardening slice.
- Migration/versioning/backfill/sunset follow-up still needed for legacy payloads:
  - define versioned envelope + decoder-dispatch strategy for remaining proposal-document and strategic-planning import/export families.
  - define staged migration/backfill and explicit sunset criteria for unversioned/alias compatibility bridges.
- Remaining external payload families still lacking canonical version-aware decode/adaptation:
  - proposal-document section payload families beyond `ACTIVATED_SERVICES`.
  - document-derived strategic planning re-entry payload families not yet covered by explicit decoders.
  - remaining non-local strategic-planning import/export families outside current bootstrap and this proposal-document seam.

### Post-Domain Aggregate Hardening (Step 47 — Service-Catalog Local Persistence Compatibility Lifecycle Governance)

- Service-catalog local persistence now has explicit compatibility lifecycle governance encoded at the decoder seam: canonical contract remains `{ version: 1, payload }`, retained legacy form is unversioned array payload, unsupported envelope versions fail closed, and legacy reads now emit migration metadata (`shouldWriteBackCanonicalEnvelope`) for opportunistic canonical writeback at bootstrap.
- Runtime behavior remains coherent and low-risk: legacy unversioned catalogs are still accepted, decoded with existing per-item guards, and now canonicalized on the next bootstrap write so compatibility debt becomes time-bounded instead of open-ended.
- Durable architectural clarification: retained compatibility bridges are governed boundary artifacts, not indefinite behavior—decode/adaptation seams must declare canonical version, accepted legacy forms, migration/backfill behavior, and explicit sunset gate criteria in code and governance docs.
- Sunset strategy is now explicit for this family: remove legacy unversioned acceptance only after observed legacy reads reach zero for a full release cycle, with a non-before target date gate of `2026-06-30` to avoid abrupt compatibility breakage.
- Remaining migration/backfill/sunset gaps after this slice:
  - cashflow bootstrap legacy unversioned acceptance still lacks equivalent explicit migration metadata + sunset gate constants.
  - proposal/piano/proposal-document import families that still accept aliases/unversioned forms need the same explicit lifecycle metadata and staged sunset criteria.
  - compatibility telemetry/observability for legacy-read usage is still missing, so release-gate validation is currently process-driven rather than instrumented.
- Remaining non-local import/export hardening gaps:
  - proposal-document roundtrip families beyond `ACTIVATED_SERVICES` still need dedicated decode/adaptation seams.
  - remaining strategic-planning external import/export families still need canonical version-aware decode/adaptation boundaries.
  - direct external SDK ingress/egress seams not yet covered by repository adapters still require explicit runtime decode/adaptation enforcement.
- Remaining identity continuity gaps:
  - deterministic `catalogServiceId` continuity is still not guaranteed across every external payload family.
  - explicit migration/backfill for legacy records missing canonical catalog identity remains pending outside this local service-catalog bootstrap slice.
- Remaining shape-based compatibility fallback still retained:
  - unique-shape catalog matching fallback in domain validation remains active.
  - cashflow bootstrap and several non-local import/export families still retain legacy unversioned/alias compatibility bridges.
- `src/App.tsx` composition density reduction remains open and intentionally out of scope for this persistence compatibility lifecycle slice.
- Remaining external payload families still lacking canonical version-aware decode/adaptation:
  - proposal-document section payload families beyond `ACTIVATED_SERVICES`.
  - non-local strategic-planning import/export families not yet covered by existing proposal/piano decoders.
  - additional cross-boundary payload families outside currently hardened repository/bootstrap seams.
- Removal criteria/preconditions for retiring currently retained legacy bridges:
  - compatibility family must have canonical envelope read/write in active use.
  - migration/backfill writeback path must be in place (or one-time migration executed) for legacy records.
  - at least one release cycle of zero observed legacy-read usage should be confirmed before bridge removal.
  - fail-closed behavior for unsupported versions must already be validated by tests before compatibility fallback deletion.


### Post-Domain Aggregate Hardening (Step 48 — Cashflow Local Persistence Compatibility Lifecycle Governance Parity)

- Cashflow local persistence compatibility lifecycle governance now reaches parity with service-catalog: canonical contract is explicit (`{ version: 1, payload }`), retained legacy form is explicit (unversioned persisted cashflow object), unsupported envelope versions fail closed, and invalid non-object payload shapes now fail closed before legacy adaptation.
- Decoder lifecycle metadata is now explicit and operational for this family: cashflow bootstrap decode emits `compatibilityState` and `shouldWriteBackCanonicalEnvelope`, allowing orchestration to distinguish canonical vs legacy vs unsupported/invalid reads.
- Backfill behavior is now explicit and bounded: app-state bootstrap opportunistically writes canonical v1 envelope when a valid legacy-unversioned cashflow payload is decoded, without widening acceptance or moving business normalization into migration code.
- Sunset strategy is now explicit for this family: remove legacy unversioned cashflow fallback only after observed legacy reads reach zero for a full release cycle, with a non-before target date gate of `2026-06-30`.
- Durable architectural clarification: compatibility lifecycle metadata belongs at decoder seams, while canonical writeback policy remains orchestration-owned and gated by successful structural decode; this separation keeps migration/backfill mechanics explicit without coupling compatibility parsing to business normalization.
- Remaining migration/backfill/sunset gaps after this slice:
  - proposal/piano/proposal-document import families that still accept aliases/unversioned forms still need equivalent explicit migration metadata + sunset gate constants.
  - compatibility telemetry/observability for legacy-read usage remains missing, so release-gate sunset decisions are still process-driven.
  - a consolidated compatibility lifecycle checklist/tooling guard for all decoder seams remains pending.
- Remaining non-local import/export hardening gaps:
  - proposal-document roundtrip families beyond currently hardened sections still need dedicated decode/adaptation seams.
  - remaining strategic-planning external import/export families still need canonical version-aware decode/adaptation boundaries.
  - direct external SDK ingress/egress seams not yet covered by repository adapters still require explicit runtime decode/adaptation enforcement.
- Remaining identity continuity gaps:
  - deterministic `catalogServiceId` continuity is still not guaranteed across every external payload family.
  - explicit migration/backfill for legacy records missing canonical catalog identity remains pending outside local bootstrap slices.
- Remaining shape-based compatibility fallback still retained:
  - unique-shape catalog matching fallback in domain validation remains active.
  - multiple non-local import/export families still retain legacy unversioned/alias compatibility bridges pending lifecycle governance parity.
- `src/App.tsx` composition density reduction remains open and intentionally out of scope for this persistence compatibility lifecycle slice.
- Remaining external payload families still lacking canonical version-aware decode/adaptation:
  - proposal-document section payload families beyond currently hardened scope.
  - non-local strategic-planning import/export families not yet covered by existing proposal/piano decoders.
  - additional cross-boundary payload families outside currently hardened repository/bootstrap seams.
- Removal criteria/preconditions for retiring currently retained legacy bridges:
  - canonical envelope read/write must be in active use for the targeted family.
  - migration/backfill writeback path must be in place (or one-time migration completed) for legacy records.
  - at least one release cycle of zero observed legacy-read usage should be confirmed before bridge removal.
  - fail-closed behavior for unsupported versions/invalid shapes must be validated by automated tests before compatibility fallback deletion.

### Post-Domain Aggregate Hardening (Step 49 — Simulation Determinism Runtime Contract Parity)

- Simulation runtime contract parity is now strengthened at engine boundary: `SimulationContext` must include canonical deterministic metadata (`timestampProvenance`, UTC timezone, locale-neutral execution marker, and numeric policy baseline `scale=6` + `half-even`) in addition to canonical UTC ISO-8601 timestamp.
- Engine validation is now explicit and fail-fast: simulation execution is rejected before model evaluation when deterministic metadata is absent or invalid, preventing silent environment drift relative to documented determinism invariants.
- Durable architectural clarification: deterministic governance baselines (time provenance, timezone/locale neutrality, numeric normalization policy) must be represented as explicit runtime contract fields validated at orchestration boundary, not left as implicit documentation-only assumptions.
- Remaining simulation determinism hardening gaps after this slice:
  - Add shared utility coverage for deterministic collection-order guarantees in future model variants where ordering semantics become non-trivial.
  - Add explicit deterministic execution-id/run-id schema in `SimulationContext` when multi-run audit logging is introduced.
- Remaining legacy compatibility bridges still open:
  - legacy unversioned/alias import-export payload compatibility bridges outside simulation context remain active pending lifecycle sunset criteria.
- Remaining import/export hardening gaps:
  - proposal-document payload families and remaining strategic-planning external families still need canonical version-aware decode/adaptation seams.
- `src/App.tsx` composition density reduction remains open and intentionally out of scope for this determinism contract slice.
- Remaining domain aggregate hardening follow-ups:
  - constructor-owned invariants and shape-coupling cleanup remain pending in non-simulation strategic-planning aggregates.
- Remaining dependency-governance automation follow-up:
  - add lint/CI guardrails to automatically block non-governed time/random access inside simulation model modules.
