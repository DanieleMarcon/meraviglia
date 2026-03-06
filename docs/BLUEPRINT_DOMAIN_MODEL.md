# Meraviglia OS — Blueprint Domain Model

## Purpose
Specify the conceptual model of Blueprint as the primary strategic aggregate used to design, compare, and govern strategic trajectories.

## Conceptual Architecture
Blueprint is the central aggregate inside a workspace and is composed of tightly related subdomains:

1. **Objective Structure**
   - Defines strategic outcomes, priority levels, and expected horizon.

2. **Hypothesis Structure**
   - Captures assumptions linking actions to expected objective movement.

3. **Action Structure**
   - Defines intervention units, sequencing, dependencies, and execution intent.

4. **Indicator Structure**
   - Specifies measurable signals, thresholds, and evaluation windows.

5. **Constraint Structure**
   - Represents limitations or boundaries affecting strategic actions.
   - Includes budget constraints, time constraints, resource constraints, and market constraints.

6. **Scenario Structure**
   - Represents alternative strategic configurations of a blueprint.
   - Each scenario activates a subset of actions and declares an explicit assumption set.

7. **Simulation Result Structure**
   - Represents simulation outputs generated from a single scenario.
   - Captures projected indicators and simplified risk classification for strategic comparison.

## Blueprint Composition
The Blueprint aggregate includes:
- Objectives
- Hypotheses
- Actions
- Indicators
- Constraints
- Scenarios

Each Scenario can produce one or more Simulation Results through independent simulation runs.

## Core Entities
- **Blueprint**: aggregate root with identity, version, and lifecycle status.
- **Objective**: target state with measurable intent.
- **Hypothesis**: causal proposition to validate.
- **Action**: strategic intervention element.
- **Indicator**: measurement contract for effectiveness.
- **Constraint**: limitation or boundary condition that affects scenario feasibility and simulation results (e.g., `budget_limit`, `resource_capacity`, `time_window`, `market_conditions`).
- **Scenario**: coherent strategic configuration with `actionIds` and `assumptionSet` (`Record<string, number | string>`), scoped to a blueprint.
- **Simulation Result**: scenario output containing `projectedIndicators` (`Record<string, number>`), `riskLevel` (`low | medium | high`), optional notes, and creation timestamp.

## Scenario-Based Strategic Modeling
Blueprint now supports multiple scenarios representing alternative strategic configurations.

This enables:
- Parallel strategic exploration under different assumptions (e.g., conversion rate, traffic growth, budget).
- Independent simulation of each scenario with comparable indicator outputs.
- Decision framing through direct comparison of risk and projected outcomes across scenarios.

## Simulation Governance Rule
Constraints and scenario assumptions must be explicitly declared before simulation runs so scenario feasibility and simulation outputs can be evaluated against known operating boundaries.

## Structural Diagram
```text
Blueprint
   ├ Objectives
   ├ Hypotheses
   ├ Actions
   ├ Indicators
   ├ Constraints
   └ Scenarios
        └ SimulationResult
```

## Modeling Principles
- **Explicit causality**: actions should reference hypotheses and intended objective effects.
- **Versioned evolution**: blueprint changes create meaningful version lineage.
- **Measurable governance**: each objective is paired with indicators and review cadence.
- **Constraint-aware realism**: scenarios and simulations must respect declared constraint structures.
- **Scenario comparability**: alternatives must use comparable structures for decision quality.
- **Traceability continuity**: blueprint elements retain links to originating intake assumptions.

## Future Extensibility Considerations
- Introduce dependency impact graphs for complex multi-action strategies.
- Enable recommendation overlays from the knowledge layer without mutating core blueprint facts.
- Support cross-blueprint pattern extraction for strategic learning at portfolio level.
