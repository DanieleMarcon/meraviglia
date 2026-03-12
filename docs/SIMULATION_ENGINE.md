# Meraviglia OS — Simulation Engine

## Purpose
Define the simulation engine as the deterministic evaluation subsystem used to test blueprint scenarios before operational execution.

This document is the primary governance authority for simulation execution behavior and determinism rules.

## Conceptual Architecture
The simulation engine follows a staged pipeline:

1. **Scenario Ingestion**
   - Accepts blueprint-derived scenarios with explicit assumptions, active action sets, and constraints.

2. **Normalization & Validation**
   - Validates scenario completeness and structural consistency.
   - Rejects simulations with missing assumptions, invalid parameter ranges, or empty scenario action sets.

3. **Deterministic Evaluation**
   - Applies strategy rules and impact functions to estimate scenario outcomes.
   - Generates comparable results across alternative strategic paths.

4. **Result Packaging**
   - Returns projected indicators, risk level, and optional notes.
   - Persists outputs with linkage to scenario and blueprint context.

## Scenario-Based Simulation Model
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
     SimulationResult
```

## Simulation Model Architecture
The simulation engine delegates deterministic scenario evaluation to a pluggable `SimulationModel` implementation.

```text
SimulationEngine
   ↓
SimulationModel
   ↓
SimulationResult
```

This architecture keeps the orchestration and validation responsibilities in `SimulationEngine` while enabling specialized evaluation models over time.

It allows future expansion to:
- sector-specific simulation models,
- strategy pack simulation logic,
- future AI-assisted evaluation.

## Simulation Engine Layer
The Simulation Engine layer is responsible for deterministic evaluation of blueprint scenarios.

Its responsibilities are intentionally narrow:
- validate that the blueprint is simulation-ready,
- validate scenario structural completeness,
- execute deterministic scenario evaluation logic,
- emit comparable `SimulationResult` artifacts.

The engine must only depend on domain entities and remain free from repository, UI, and infrastructure coupling.

Blueprint now supports multiple scenarios representing alternative strategic configurations.
Each Scenario is simulated independently and produces SimulationResult outputs used for strategic comparison.

## Deterministic Execution Invariants (Hard Rules)
These invariants are mandatory for every `SimulationModel` implementation.

1. **Reproducibility is non-negotiable**
   - Given the same scenario input and `SimulationContext`, the model must produce the same `SimulationResult`.

2. **No direct system time access**
   - Simulation models must never call system clock APIs directly.
   - Temporal metadata must enter only through `SimulationContext`.

3. **No unmanaged randomness**
   - Simulation models must not call random generators directly.
   - Any stochastic behavior must be explicitly injected via governed context inputs.

4. **Execution metadata enters through context only**
   - Time, execution identifiers, and run metadata are context responsibilities.
   - Models must not pull execution metadata from global/system sources.

5. **Numeric precision policy**
   - Simulation calculations must use explicit numeric precision strategy.
   - Rounding mode and precision scale must be defined and applied consistently across models.
   - Silent/implicit rounding differences between paths are forbidden.

6. **Timezone and locale normalization policy**
   - Temporal interpretation must use a normalized timezone baseline defined by context.
   - Locale-sensitive parsing/formatting must not affect simulation math or branching behavior.

7. **Deterministic ordering policy**
   - Collection traversal and rule evaluation order must be explicit and stable.
   - Model results must not depend on non-deterministic iteration behavior.

8. **No side effects inside models**
   - Simulation models are pure evaluators.
   - They must not perform I/O, persistence, network calls, logging with mutable outputs, or shared mutable state mutation.

9. **External data injection only**
   - Any external signal used during simulation must be injected as an explicit governed input.
   - Ad hoc data pulls during model execution are forbidden.

## Determinism Enforcement Expectations
Determinism invariants must be enforced through all of the following:

- architecture/code review checks,
- deterministic test coverage,
- coding conventions that prohibit non-governed time/random/external access inside simulation models.

Any change that weakens these invariants is an architecture governance violation.

## Core Entities and Principles
- **Scenario**: immutable simulation input profile with `actionIds` and `assumptionSet`.
- **Assumption Set**: explicit variables and baseline conditions (e.g., `conversion_rate`, `traffic_growth`, `budget`).
- **Constraint Set**: boundaries such as budget, time, and execution capacity.
- **Impact Model**: deterministic transformation logic from actions to projected outcomes.
- **SimulationResult**: structured output with `projectedIndicators`, `riskLevel`, optional `notes`, and timestamp.

Principles:
- Determinism and reproducibility over opaque prediction.
- Assumption transparency as mandatory for trust.
- Scenario comparability through shared measurement contracts.
- Human review remains authoritative for strategy approval.

## Future Extensibility Considerations
- Add probabilistic and sensitivity analysis modes alongside deterministic core.
- Introduce calibration workflows using observed execution feedback.
- Support domain-specific simulation plugins with shared validation contracts.
- Provide portfolio-level simulation orchestration for cross-workspace planning.

## Domain Value Objects
Domain Value Objects strengthen the Meraviglia OS domain model by replacing weak primitive collections with explicit semantic structures.

By introducing `Assumption`, `IndicatorValue`, and `ConstraintValue`, the domain gains:
- clearer ubiquitous language in code (`assumptions` instead of generic key/value bags),
- stronger type safety for simulation contracts,
- reduced primitive obsession and lower risk of invalid shape propagation across domain boundaries,
- better extensibility for future invariant validation directly at value object level.

These value objects remain pure domain constructs and preserve architectural boundaries by avoiding repository, database, and UI concerns.

## Deterministic Simulation Context
The simulation engine now executes models using an explicit `SimulationContext`.

```text
SimulationEngine
   ↓
SimulationModel
   ↓
SimulationContext
   ↓
SimulationResult
```

The context contains deterministic metadata such as timestamps and normalized execution parameters.

This ensures:

* reproducible simulation runs
* scenario replay
* future calibration using real-world execution feedback
* compatibility with AI-assisted evaluation models.

Simulation models must never directly call system time or external randomness.

All temporal values and execution metadata must come from the provided context.
