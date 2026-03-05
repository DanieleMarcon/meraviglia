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
   - Encodes objectives, hypotheses, actions, indicators, and simulation references.

5. **Knowledge Context**
   - Strategy templates, modeling heuristics, and reusable advisory patterns.
   - Supplies structured guidance for blueprint composition.

6. **Simulation Context**
   - Scenario definitions, assumptions, parameters, and expected impact outputs.
   - Provides deterministic evaluation of strategic alternatives.

## Core Entities and Invariants
- **Organization** is the hard tenant boundary.
- **Workspace** belongs to exactly one organization and is created from intake conversion.
- **Intake** is the required starting artifact for each strategic lifecycle.
- **Blueprint** is versioned and linked to a workspace for full traceability.
- **Simulation** references blueprint state and explicit assumption sets.
- **Knowledge templates** are reusable and versioned; application of a template is always explicit and auditable.

Key invariants:
- No cross-tenant access to strategic entities.
- No blueprint without workspace context.
- No workspace lifecycle without intake lineage.
- No simulation output without declared assumptions.

## Future Extensibility Considerations
- Add domain events for lifecycle transitions to support asynchronous intelligence workflows.
- Introduce domain policy modules for sector-specific governance rules.
- Support composite workspaces for multi-initiative programs while preserving aggregate boundaries.
- Add explainability metadata to all model transformations for audit and training use cases.
