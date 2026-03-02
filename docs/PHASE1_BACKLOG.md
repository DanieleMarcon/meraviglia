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
