# Meraviglia OS — AI Strategy

## Purpose
Define how AI capabilities are introduced to augment consultant decision quality while preserving deterministic governance and tenant-safe operation.

This document is authoritative for AI operating principles only; dependency boundaries remain authoritative in `docs/ARCHITECTURE_FREEZE_v1.md` and review/enforcement remains authoritative in `docs/ENGINEERING_PROTOCOL.md`.

## Conceptual Architecture
AI strategy is layered to avoid replacing core strategic semantics:

1. **Assistive Intelligence Layer**
   - Drafting assistance for intake normalization and blueprint composition.
   - Pattern suggestions based on knowledge templates and context constraints.

2. **Analytical Intelligence Layer**
   - Highlights indicator anomalies, scenario inconsistencies, and hypothesis gaps.
   - Supports structured quality checks before simulation and approval.

3. **Recommendation Layer**
   - Produces ranked strategy options with explainable rationale.
   - Uses domain constraints, template evidence, and simulation outputs.

4. **Governance Layer**
   - Enforces role-scoped access, audit logs, and human-in-the-loop approval.
   - Prevents autonomous action execution without explicit authorization.

## Core Principles
- **AI as augmentation**: consultants remain accountable decision owners.
- **Explainability first**: each recommendation must include rationale and assumptions.
- **Domain alignment**: AI outputs must map to intake, workspace, and blueprint entities.
- **Tenant safety**: no cross-tenant inference leakage or unauthorized context mixing.
- **Operational boundaries**: AI cannot bypass lifecycle rules or RBAC constraints.

## Future Extensibility Considerations
- Expand from assistive guidance to adaptive strategic copilots with strict policy controls.
- Add organization-specific model tuning using isolated data governance boundaries.
- Introduce learning loops that compare recommended vs. selected strategies and outcomes.
- Evolve toward strategic intelligence services that coordinate knowledge, simulation, and governance signals.


## AI Architecture Placement and Boundaries
- AI orchestration must be implemented in the application layer unless a new AI module is explicitly approved through governance docs.
- AI provider integrations and model adapters belong to infrastructure adapters behind approved contracts.
- AI features must not bypass the canonical flow: `ui → application → (domain | engine)` and must not introduce forbidden dependencies.
- AI components must not directly mutate domain invariants or write domain rules outside the domain governance process.

## AI and Deterministic Simulation Boundary
- AI may assist scenario preparation, quality checks, or recommendation framing.
- AI must not weaken deterministic simulation invariants defined in `docs/SIMULATION_ENGINE.md`, including canonical numeric (`scale=6`, `half-even`) and UTC/locale-neutral baselines.
- When simulation is executed, all deterministic rules remain mandatory regardless of AI involvement in adjacent workflow steps.

## AI Governance and Review Enforcement
- AI-generated and AI-assisted code is always subject to human review before merge.
- Any future AI module/component requires explicit placement, explicit allowed/forbidden dependencies, and Architecture Freeze alignment.
- This strategy remains subordinate to `docs/ARCHITECTURE_FREEZE_v1.md` and enforceable through `docs/ENGINEERING_PROTOCOL.md`.
