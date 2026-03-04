# Meraviglia OS — Target Architecture

## Target Layered Architecture
Meraviglia OS target architecture is organized into six explicit layers:

1. **domain**
   - Core business entities, value objects, invariants, policies.
   - Pure strategic semantics, no framework or transport dependencies.

2. **engine**
   - Deterministic orchestration and decision logic.
   - Transforms domain inputs into blueprints, recommendations, and orchestration outputs.

3. **application**
   - Use-case orchestration layer.
   - Coordinates domain + engine + repositories for specific workflows (e.g., intake creation, workspace planning).

4. **repository**
   - Abstract persistence and external interface contracts.
   - Defines ports/interfaces consumed by application layer.

5. **infra**
   - Concrete adapters for databases, auth providers, message/event bridges, and external APIs.
   - Implements repository and integration contracts.

6. **ui**
   - Presentation and interaction surfaces.
   - Consumes application-level use cases only, never domain/engine internals directly in future state.

## Workspace Conceptual Model (Project-Centric, CRM-Referenced)
A **Workspace** is the top-level strategic container.

- Workspace is centered on a **Project/Initiative context**, not a CRM entity lifecycle.
- CRM entities (accounts, contacts, opportunities) are referenced as linked context, not governing primitives.
- A workspace includes:
  - Strategic objective set
  - Intake artifacts
  - Blueprint versions
  - Execution linkage metadata
  - Feedback snapshots and iteration history

This preserves Meraviglia OS as strategic orchestration while enabling CRM interoperability.

## Intake Module Positioning
The Intake module is the structured strategic entry point.

Purpose:
- Capture initial context, constraints, and hypotheses.
- Normalize strategic inputs before blueprint generation.
- Establish traceability from first assumptions to later outcomes.

Positioning:
- Intake is an **application capability** backed by domain models and repository contracts.
- Intake is not a generic form subsystem; it is a strategic data normalization boundary.

## Repository Abstraction Strategy
Repository layer must define technology-agnostic ports for:
- Workspace persistence
- Intake records
- Blueprint storage/versioning
- Auth/user context retrieval
- Integration event handoff

Rules:
- Application layer depends on repository interfaces only.
- Infra layer owns implementations (Supabase now, extensible later).
- No business logic inside repository implementations.

## Integration Contracts (CRMAdapter Concept)
External system interoperability is defined through explicit contracts, beginning with `CRMAdapter`.

### CRMAdapter Responsibilities
- Resolve external entity references (accounts/contacts/opportunities).
- Push orchestration outputs where needed.
- Pull execution outcomes for feedback ingestion.
- Normalize external data into Meraviglia-compatible structures.

### Contract Principles
- Adapter contracts are stable interfaces with versioning.
- Domain and engine never import vendor SDKs directly.
- Each external platform (Relatia, future CRMs) receives an isolated infra adapter implementation.

## Auth & Security Target Model
Target security model:
- Identity-centered multi-user architecture with workspace-scoped access control.
- Role and permission model aligned with strategic governance actions.
- Auditable mutation trails for critical strategic artifacts.
- Secure-by-default boundaries between user identity context and decision logic execution.

## Supabase Temporary Role
Supabase is currently a transitional infrastructure provider for:
- Authentication
- Initial persistence foundation
- Multi-user enablement bootstrap

Strategic constraint:
- Supabase must be accessed through infra implementations conforming to repository and auth contracts.
- Supabase-specific assumptions must not leak into domain, engine, or application decisions.

## Relatia Future Integration Strategy
Relatia integration is a roadmap objective, not a foundational coupling.

Planned approach:
1. Stabilize Meraviglia internal contracts first.
2. Introduce Relatia adapter implementation via `CRMAdapter` contract.
3. Enable bi-directional synchronization boundaries where strategically justified.
4. Keep Meraviglia decision authority internal; Relatia remains operational record and workflow execution system.

## Boundary Rules (Non-Negotiable Dependencies)
### Allowed dependency flow
`ui → application → domain/engine`

`application → repository (interfaces)`

`infra → repository (implementations/contracts)`

### Forbidden dependencies
- domain → application/ui/infra
- engine → ui/infra/vendor SDKs
- application → concrete infra details
- ui → engine (future-state strict rule: via application only)
- repository interfaces → vendor-specific models

These rules are mandatory to preserve modularity, replaceability, and long-term SaaS evolution.
