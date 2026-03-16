# Meraviglia OS — Domain Architecture

## Purpose
Describe the domain architecture that encodes Meraviglia's strategic semantics independently from transport, UI, and infrastructure concerns.

This document is authoritative for bounded contexts, core entities, and domain invariants. Dependency contracts remain authoritative in `docs/ARCHITECTURE_FREEZE_v1.md`.

## Conceptual Architecture
The domain architecture is centered on bounded contexts aligned to the consultant workflow:

Note: the bounded-context term in this document is a domain-modeling concept and is distinct from the runtime `SimulationContext` execution structure defined in `docs/SIMULATION_ENGINE.md`.

1. **Tenant & Access Context**
   - Organization, user membership, and permission semantics.
   - Provides identity and authorization constraints for strategic operations.
   - Current maturity: infrastructure/security baseline is implemented (tenant model + RLS + org-scoped RBAC), while product-level organization and access workflows (invite onboarding, activation, organization switching/management) are pending.

2. **Intake Context**
   - Strategic entry aggregate for new initiatives.
   - Captures initial assumptions, constraints, and desired outcomes.

3. **Workspace Context**
   - Operational strategic container bound to one organization.
   - Coordinates lifecycle state and ownership of strategic artifacts.

4. **Relationship Context**
   - Workspace-scoped strategic relationship layer for key contacts.
   - Tracks contact provenance to preserve modeling traceability across manual and future ingestion paths.

5. **Blueprint Context**
   - Core strategic modeling aggregate.
   - Encodes objectives, hypotheses, actions, indicators, constraints, and scenarios.

6. **Knowledge Context**
   - Strategy templates, modeling heuristics, and reusable advisory patterns.
   - Supplies structured guidance for blueprint composition.

7. **Strategic Simulation Domain**
   - Defines simulation concepts and their relationship to strategic domain entities.
   - Operational simulation execution governance is defined in `docs/SIMULATION_ENGINE.md` and is not redefined in this domain document.

## Strategic Context Kernel Model
Meraviglia OS is organized around a **Strategic Context Kernel** and category framing that must remain explicit in domain decisions.

Authoritative category framing:
- Meraviglia OS is a **Strategic Modeling and Decision Orchestration Platform**.
- Meraviglia OS is a **Strategic Context Operating System**.

Negative-category guardrails:
- not a CRM domain model,
- not a calendar-first scheduling product model,
- not a generic notes/storage model,
- not an AI-wrapper interaction model.

Kernel definition:
- **Workspace = Strategic Context Kernel**.
- Workspace is the canonical container of strategic context and the anchor for lifecycle continuity, ownership, and governance.

Layers around the workspace kernel:
- **Relationship layer**: Contacts.
- **Interaction layer**: Workspace-scoped interactions that connect participants, operational timing, and decision-relevant continuity (Scheduling Foundation is the first slice).
- **Memory layer**: Workspace-scoped strategic memory artifacts (notes, documents, summaries, observations) governed by context and provenance; see `docs/MEMORY_LAYER.md`.
- **Decision layer**: Blueprint and simulation engines.
- **Augmentation layer**: AI ingestion and AI operator assistance.
- **Integration layer**: Google ecosystem and external systems.

Layered continuity logic:
`context → relationship → interaction → memory → decision → augmentation → integration`

Domain expansion rule: new bounded capabilities must strengthen this continuity chain around workspace ownership, not introduce disconnected feature islands.

## Core Entities and Invariants
- **Organization** is the hard tenant boundary.
- **Workspace** belongs to exactly one organization and is created from intake conversion.
- **Contact** belongs to exactly one workspace and one organization-scoped boundary.
- **Intake** is the required starting artifact for each strategic lifecycle.
- **Blueprint** is versioned and linked to a workspace for full traceability.
- **Scenario** belongs to exactly one blueprint and defines active action IDs plus assumption variables.
- **SimulationResult** belongs to one scenario and stores projected indicators and risk level.
- **Knowledge templates** are reusable and versioned; application of a template is always explicit and auditable.

Key invariants:
- No cross-tenant access to strategic entities.
- No blueprint without workspace context.
- No workspace lifecycle without intake lineage.
- No contact without workspace ownership and explicit provenance.
- No interaction without workspace ownership, explicit type/status/provenance semantics, and participant linkage scoped to workspace context.
- No simulation output without declared scenario assumptions.

## Composition Root and Application Wiring
System composition is owned by the application layer through a dedicated composition root.

Composition root location:
- `src/application/composition/applicationComposition.ts`

Composition responsibilities:
- instantiate infrastructure adapters,
- instantiate application services,
- wire dependencies between repositories and services,
- register services for UI access.

Current transitional implementation:
- service registration currently follows a temporary service locator pattern,
- active examples include `setWorkspaceService`, `setIntakeService`, and `setContactService`.

Transitional architecture rule:
- transitional patterns are allowed only as temporary refactor bridges,
- they do not redefine the target architecture and must not become steady-state architecture,
- usage must be explicitly scoped, time-bounded, and removed or replaced before the migration/refactor is considered complete,
- transitional patterns are migration-only and must not survive into the stabilized target architecture baseline or serve as precedent for future architecture decisions,
- they remain subject to architecture review plus all non-negotiable invariants defined in architecture/protocol governance.

Evolution plan:
- this temporary service locator will be replaced by a service factory or dependency injection container as system complexity grows.

## Blueprint Simulation Structure
```text
Blueprint
   ├ Objectives
   ├ Hypotheses
   ├ Actions
   ├ Indicators
   ├ Constraints
   └ Scenarios
        ↓
     SimulationEngine
        ↓
     SimulationContext
        ↓
     SimulationModel
        ↓
     SimulationResult
```

## Simulation and Domain Boundary
The domain architecture defines simulation-related concepts (`Scenario`, `SimulationResult`, assumptions, constraints) and their invariants.

Operational determinism, execution constraints, and simulation engine enforcement rules are governed by `docs/SIMULATION_ENGINE.md`, including canonical numeric/temporal baselines.

Application orchestration remains responsible for invoking engine workflows; domain and engine layers do not own repository or infrastructure persistence logic.

Boundary constraints remain:
- no Supabase imports,
- no repository usage,
- no UI logic,
- domain-only dependencies for simulation engine logic.

## Scenario-Based Strategic Modeling
Blueprint supports multiple scenarios to represent alternative strategic configurations.

Each scenario can be simulated independently, allowing side-by-side strategic comparison based on:
- projected indicator movement,
- risk classification (`low`, `medium`, `high`),
- and scenario-specific assumptions.

## Future Extensibility Considerations
- Add domain events for lifecycle transitions to support asynchronous intelligence workflows.
- Introduce domain policy modules for sector-specific governance rules.
- Support composite workspaces for multi-initiative programs while preserving aggregate boundaries.
- Add explainability metadata to all model transformations for audit and training use cases.

## Domain Value Objects
Meraviglia OS uses immutable value object classes to enforce domain invariants and avoid primitive obsession.

Current value objects:
- `Assumption`: validates that `key` is not empty.
- `IndicatorValue`: validates that `name` is not empty and `value` is a valid number.
- `ConstraintValue`: validates that `type` is not empty and `value` is defined.

### Constraint Type Invariant
ConstraintValue and Constraint now share the same `ConstraintType` union.

This eliminates domain type drift where constraint values previously accepted arbitrary strings.

Constraint categories are now restricted to:

- budget_limit
- time_limit
- resource_limit

This guarantees that simulation models and blueprint constraints operate on a controlled vocabulary, preventing invalid constraint categories from entering the strategic domain model.

All value object properties are `readonly`, ensuring immutability once created. This keeps invalid primitive payloads from leaking into core entities such as `Scenario`, `SimulationResult`, and `Constraint`, while keeping domain rules independent from UI, repositories, and infrastructure adapters.

## DTO Transitional Model
The current DTO layer is intentionally simplified as a transitional contract while UI/application boundaries are stabilized.

Current simplifications:
- `BlueprintDTO` models strategic collections as primitive arrays, for example `objectives: string[]` (and currently `hypotheses`, `actions`, `indicators`, `constraints`, `scenarios` as string arrays).
- `ScenarioDTO` exposes `assumptions: string[]` even though the domain model uses `Assumption[]`.

Future DTO hierarchy (planned):
- `ObjectiveDTO[]`
- `ActionDTO[]`
- `IndicatorDTO[]`
- `AssumptionDTO[]`

These flattened DTOs are deliberate in early architecture stages to reduce migration risk and keep boundary contracts stable before introducing full nested DTO structures.

Identity ownership clarification (governance rule): UI/state may transport user-selected identity references (for example catalog IDs) in DTO payloads, but identity enrichment/reconciliation/normalization must originate in approved application/domain boundaries, never in UI components.

Persistence ingress clarification (governance rule): local/import/repository payload reads must pass through explicit decode/adaptation seams that isolate parse/shape/compatibility handling before application/domain orchestration consumes the data.

They are migration-only simplifications and are not precedent for long-term architecture direction.
