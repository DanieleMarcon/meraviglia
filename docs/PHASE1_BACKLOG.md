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
