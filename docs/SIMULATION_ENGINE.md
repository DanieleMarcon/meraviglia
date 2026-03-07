# Meraviglia OS — Simulation Engine

## Purpose
Define the simulation engine as the deterministic evaluation subsystem used to test blueprint scenarios before operational execution.

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

The context contains deterministic metadata such as timestamps.

This ensures:

* reproducible simulation runs
* scenario replay
* future calibration using real-world execution feedback
* compatibility with AI-assisted evaluation models.

Simulation models must never directly call system time or external randomness.

All temporal values must come from the provided context.
