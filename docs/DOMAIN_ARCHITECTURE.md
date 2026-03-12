# Meraviglia OS — Domain Architecture

## Purpose
Describe the domain architecture that encodes Meraviglia's strategic semantics independently from transport, UI, and infrastructure concerns.

This document is authoritative for bounded contexts, core entities, and domain invariants. Dependency contracts remain authoritative in `docs/ARCHITECTURE_FREEZE_v1.md`.

## Conceptual Architecture
The domain architecture is centered on bounded contexts aligned to the consultant workflow:

1. **Tenant & Access Context**
   - Organization, user membership, and permission semantics.
   - Provides identity and authorization constraints for strategic operations.

2. **Intake Context**
   - Strategic entry aggregate for new initiatives.
   - Captures initial assumptions, constraints, and desired outcomes.

3. **Workspace Context**
   - Operational strategic container bound to one organization.
   - Coordinates lifecycle state and ownership of strategic artifacts.

4. **Blueprint Context**
   - Core strategic modeling aggregate.
   - Encodes objectives, hypotheses, actions, indicators, constraints, and scenarios.

5. **Knowledge Context**
   - Strategy templates, modeling heuristics, and reusable advisory patterns.
   - Supplies structured guidance for blueprint composition.

6. **Strategic Simulation Domain**
   - Defines simulation concepts and their relationship to strategic domain entities.
   - Operational simulation execution governance is defined in `docs/SIMULATION_ENGINE.md` and is not redefined in this domain document.

## Core Entities and Invariants
- **Organization** is the hard tenant boundary.
- **Workspace** belongs to exactly one organization and is created from intake conversion.
- **Intake** is the required starting artifact for each strategic lifecycle.
- **Blueprint** is versioned and linked to a workspace for full traceability.
- **Scenario** belongs to exactly one blueprint and defines active action IDs plus assumption variables.
- **SimulationResult** belongs to one scenario and stores projected indicators and risk level.
- **Knowledge templates** are reusable and versioned; application of a template is always explicit and auditable.

Key invariants:
- No cross-tenant access to strategic entities.
- No blueprint without workspace context.
- No workspace lifecycle without intake lineage.
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
- active examples include `setWorkspaceService` and `setIntakeService`.

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
