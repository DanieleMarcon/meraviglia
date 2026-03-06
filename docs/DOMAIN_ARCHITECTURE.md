# Meraviglia OS — Domain Architecture

## Purpose
Describe the domain architecture that encodes Meraviglia's strategic semantics independently from transport, UI, and infrastructure concerns.

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

6. **Simulation Context**
   - Executes scenario-based strategic simulation.
   - Produces SimulationResult outputs from each Scenario independently.

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

## Blueprint Simulation Structure
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
