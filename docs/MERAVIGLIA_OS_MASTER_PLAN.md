# Meraviglia OS — Master Plan

## Executive Vision
Meraviglia OS is the strategic operating system for growth design, orchestration, and governance. It exists to transform fragmented strategic decisions into a continuous, auditable, and adaptive operating cycle across planning, execution, and performance learning.

Meraviglia OS is designed to become the decision and orchestration brain that sits above operational systems, ensuring that every commercial initiative is:
- Intentionally designed
- Explicitly modeled
- Operationally executable
- Continuously improved through feedback

## Platform Core — Brand-Agnostic Architecture
Meraviglia OS platform foundation is explicitly **brand-agnostic** and **white-label ready**.

Final architecture hardening decision:
- Platform tenancy model is organization-based.
- User membership is single-organization.
- Core identity split is `auth.users` (authentication) + `public.users` (application identity).
- Access control is RBAC with global permission catalog and organization-scoped role modeling.
- Strict isolation is enforced at database level through RLS and tenant-constrained relations.

This establishes a SaaS-ready platform core without introducing a network/super-admin layer in this milestone.

## Positioning vs Relatia
Meraviglia OS and Relatia CRM are complementary but distinct products:

- **Relatia CRM**: core business platform for relationship and commercial process management.
- **Meraviglia OS**: strategic and orchestration layer that governs *what should be done, why, when, and with which expected impact*.

Meraviglia OS must never be positioned as a CRM replacement. Instead, it defines and governs strategic intent while interoperating with systems like Relatia that execute and record transactional interactions.

## System of Design vs System of Record
### System of Design (Meraviglia OS)
A System of Design is where strategic models are created and refined:
- Strategic objectives and hypotheses
- Intervention blueprints
- Scenario simulation and optimization
- Orchestration directives and decision logic

### System of Record (Relatia CRM and similar systems)
A System of Record is where operational facts are stored:
- Contacts and accounts
- Activities, deals, and communications
- Execution logs and transactional history

### Relationship
Meraviglia OS (System of Design) informs and orchestrates Systems of Record; Systems of Record feed execution outcomes back to Meraviglia OS for learning and strategic adjustment.

## OS as Strategic Orchestration Engine
Meraviglia OS is the coordination engine that:
- Converts strategic intent into execution-ready blueprints
- Controls sequencing and priority of initiatives
- Tracks strategic assumptions against real outcomes
- Triggers recalibration when deviations emerge

It is intentionally modular, enabling future intelligence components (e.g., ROI engine, recommendation layers, adaptive planning automation) without collapsing architecture boundaries.


## Strategic Context Kernel
Meraviglia OS is organized around a **Strategic Context Kernel** where:

- **Workspace = Strategic Context Kernel**
- Workspace is the canonical container of strategic context across planning, relationship continuity, interaction history, memory, and strategic decisions.

System layers around the workspace kernel:
- **Relationship layer**: Contacts
- **Interaction layer**: Scheduling / meetings / calls
- **Memory layer**: Notes / documents / artifacts
- **Decision layer**: Blueprint + simulation engines
- **Augmentation layer**: AI ingestion + AI operator assistance
- **Integration layer**: Google ecosystem + external systems

## Strategic Modeling Positioning
Blueprint is the core strategic modeling aggregate of Meraviglia OS. The platform treats Blueprint modeling as the center of design-to-execution continuity, with objectives, hypotheses, actions, indicators, and simulations maintained as governed strategic components.

The **Blueprint engine** is therefore positioned as the core strategic modeling engine for orchestration decisions.

To accelerate consistent design quality, Meraviglia OS introduces **Strategy Templates** as Knowledge Layer assets: reusable strategic modeling patterns that seed Blueprint structures with governance-ready defaults and measurable logic.

Architectural dependency direction for executable workflows is standardized as:
`ui → application → domain → repository → infra`


## Strategic Cycle Diagram
```text
[Design]
  Define objectives, constraints, hypotheses
      ↓
[Blueprint]
  Translate strategy into structured initiatives,
  dependencies, owners, and expected ROI
      ↓
[Execution]
  Activate via connected operational systems
  (CRM, automation, task systems)
      ↓
[Feedback]
  Collect outcomes, compare with assumptions,
  measure variance, trigger redesign
      ↺
```

**Cycle principle:** Design → Blueprint → Execution → Feedback is a continuous loop, not a linear project lifecycle.

## Intake as Formal Entry Boundary of Strategic Cycle
Intake is now the formal entry boundary of the Meraviglia strategic cycle.

- No strategic workflow should start directly from workspace creation.
- Strategic assumptions are captured first in intake and then converted into workspace context.
- Conversion from intake to workspace is the traceability bridge between design intent and orchestration execution.


## First Operational Workflow
The first operational workflow now implemented in UI is:

`Intake creation → Intake listing/monitoring → Intake-to-Workspace conversion`

This workflow formalizes the minimum executable strategic path and preserves traceability from first assumptions (intake) to operational container activation (workspace).

Governance constraint:
- UI interaction remains bound to application services, preserving architectural boundaries and keeping infra details outside presentation modules.

## Contacts Foundation v1
The first workspace-scoped relationship slice is now active as a strategic continuity layer:

`Workspace view → list contacts by workspace → manual contact creation`

Governance constraints for this slice:
- Contacts remain workspace-scoped and tenant-safe.
- Provenance is explicit (`manual`, `from_intake`, `from_ai_review`) even when only manual creation is active.
- The feature is not a CRM pipeline and does not introduce deals/activities abstractions.

## Long-Term SaaS Evolution Vision
Meraviglia OS evolves in staged maturity:
1. **Foundation**: multi-user architecture, shared governance standards, modular domain boundaries.
2. **Operational orchestration**: workspace-centric planning, Domain Layer introduction, and intake standardization.
3. **Strategic intelligence**: ROI modeling, recommendation capabilities, and adaptive execution guidance.
4. **Platform readiness**: tenant-aware SaaS architecture, policy controls, compliance posture, and extensible integration contracts.

Target end-state: a scalable B2B SaaS operating system where organizations can design strategy, orchestrate execution, and compound learning across teams and portfolios.

## Core Differentiators
- **Strategic-first architecture** instead of workflow-first CRM structure.
- **Explicit Design-to-Execution loop** with measurable feedback integration.
- **Modular orchestration core** able to coordinate multiple external systems.
- **Decision-grade modeling** (scenario, blueprint, ROI) as first-class capabilities.
- **Governance-native foundation** with architectural boundaries and auditability from early stages.
- **Tenant isolation by default** for multi-organization SaaS durability.

## Governance Principles
1. **Strategic supremacy**: architecture decisions must preserve Meraviglia OS as a strategic system, not a transactional CRM clone.
2. **Boundary integrity**: domain and orchestration logic remain isolated from infrastructure and UI concerns.
3. **Composable modularity**: every new module must be independently evolvable behind explicit contracts.
4. **Interoperability by contract**: external platforms are integrated through adapters, never embedded assumptions.
5. **Evidence-driven evolution**: roadmap progression depends on measurable architectural and product completion criteria.
6. **Documentation-before-implementation**: all major architectural shifts must be codified before code expansion.
7. **Security as baseline**: identity, access, and audit concerns are treated as core architecture, not post-hoc additions.
8. **Brand neutrality**: platform core naming, models, and governance remain white-label compatible.
