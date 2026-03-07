# Meraviglia OS — Target Architecture

## Platform Core — Brand-Agnostic Architecture
Meraviglia OS platform core is defined as **brand-agnostic, white-label ready, and tenant-isolated by design**.

Final decision for architecture hardening step 1:
- Multi-organization model is the tenancy baseline.
- Each user belongs to exactly one organization.
- Identity source remains `auth.users`; application identity is `public.users`.
- RBAC is structured as global permission catalog + organization-local roles + mapping tables.
- Tenant isolation is enforced by schema constraints and RLS.
- No self-signup organization provisioning and no cross-organization super-admin layer in this step.

## Target Layered Architecture
Meraviglia OS target architecture is organized into explicit layers, with the Domain Layer now formalized as the strategic semantic core:

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

## Application Layer Introduction (Step 2)
The application layer is now introduced as the minimal use-case coordination boundary between UI and persistence.

Purpose:
- Keep UI focused on presentation and interaction only.
- Centralize basic use-case validation and orchestration in one place.
- Prepare the codebase for incremental migration of workflows without touching domain/engine purity.

Boundary clarification:
- UI should no longer access database clients directly.
- Application services call repository contracts for persistence operations.
- Repository interfaces define the persistence boundary; infra adapters implement those interfaces with Supabase.
- Domain and engine remain pure and framework-agnostic, with no Supabase dependencies.

This baseline structure establishes the dependency flow `ui → application → domain → repository → infra` for workspace operations, with infrastructure adapters owning Supabase client usage.

## Application Composition Root Pattern
The application layer now owns the system composition root and is responsible for wiring concrete runtime dependencies.

Composition root location:
- `src/application/composition/applicationComposition.ts`

Composition root responsibilities:
- instantiate infrastructure adapters,
- instantiate application services,
- wire dependencies between services and repositories,
- register services for UI access.

Current transitional pattern:
- the system uses a temporary service locator pattern via application-level setters such as `setWorkspaceService` and `setIntakeService`.

Planned evolution:
- this service locator pattern is temporary and will be replaced by a service factory or dependency injection container as the application grows.

## Operational UI Layer Introduction
The first operational UI module (Intake interface) establishes the UI baseline for executable workflows.

Principles:
- UI modules call application services only (`createIntake`, `listIntakes`, `convertIntakeToWorkspace`).
- UI modules must not import Supabase clients or infra adapters directly.
- Application services remain the orchestration boundary for persistence and workflow transitions.

Operational flow remains strictly aligned to the dependency chain:
`ui → application → domain → repository → infra`

## Workspace Operational UI
The Workspace Operational UI represents the execution container for strategic planning.

Positioning:
- Workspaces expose the operational surface where strategic plans are organized and executed.
- The UI presents workspace identity and lifecycle context (`workspace_name`, `workspace_slug`, `created_at`) for planning continuity.

Architecture constraints:
- Workspace UI consumes application services only.
- No direct infra or Supabase imports are allowed in workspace presentation modules.
- Dependency chain remains enforced as `ui → application → domain → repository → infra`.

## Strategic Modeling Core
The strategic modeling core is centered on **Blueprint** as the primary aggregate root for strategic design and orchestration continuity.

Blueprint aggregate composition:
- **Objectives**: explicit strategic outcomes to be achieved and governed over time.
- **Hypotheses**: assumptions that connect intended actions to expected outcomes and must be validated through feedback.
- **Actions**: executable intervention units sequenced for operational activation.
- **Indicators**: measurable signals used to evaluate effectiveness, variance, and progress against objectives.
- **Scenarios**: alternative strategic configurations that select active actions and declare assumption variables for simulation.
- **Simulation Results**: outputs generated per scenario with projected indicators and risk level for comparison.

Strategic implications:
- The Blueprint engine is treated as the core strategic modeling aggregate for decision orchestration.
- Strategy Templates are the reusable blueprint design patterns provided by the Knowledge Layer for accelerated and consistent modeling.
- Application workflows must preserve Blueprint traceability from intake assumptions through scenario simulation and execution feedback.

Scenario-based structure:
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

Each scenario is simulated independently, enabling direct strategic comparison across alternative action/assumption configurations while preserving blueprint traceability.

## Multi-Tenant Core Data Architecture
Primary platform entities:
- `organizations`
- `users` (application identity, linked to `auth.users`)
- `permissions` (global)
- `roles` (organization-scoped)
- `role_permissions`
- `user_roles`
- `workspaces`

Isolation principle:
- Organization is the hard tenant boundary.
- Shared/global semantics are limited to permission catalog.
- Strategic data and access controls are organization-scoped.

## RBAC Structured Model
Authorization model uses four explicit layers:
1. Global permission catalog (`permissions`).
2. Roles defined per organization (`roles`).
3. Role-to-permission assignment (`role_permissions`).
4. User-to-role assignment (`user_roles`).

This model keeps permission language stable while enabling organization autonomy for role composition.

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

## Intake as Strategic Entry Aggregate
Intake is the **strategic entry aggregate** for all new strategic flows.

Rules:
- Every strategic flow starts from an intake record.
- Workspace creation is a conversion step from intake (`draft/validated` → `converted`).
- Intake keeps the first strategic assumptions traceable before workspace planning expands.

This keeps the platform intake-first while preserving workspace as the execution-oriented strategic container.

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

## Tenant Isolation Guarantees
Isolation is implemented by:
- Foreign keys anchored to `organization_id` boundaries.
- Organization-scoped uniqueness constraints.
- Row Level Security policies on tenant-sensitive tables.
- Helper function that resolves current user organization from authenticated identity.

Guarantee statement:
- Authenticated users can access and mutate only rows belonging to their own organization context, with no cross-tenant visibility via normal application roles.

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
`ui → application → domain → repository → infra`

`application → engine (deterministic strategic orchestration only)`

`application → repository (interfaces)`

`infra → repository (implementations/contracts)`

### Forbidden dependencies
- domain → application/ui/infra
- engine → ui/infra/vendor SDKs
- application → concrete infra details
- ui → engine (future-state strict rule: via application only)
- repository interfaces → vendor-specific models

These rules are mandatory to preserve modularity, replaceability, and long-term SaaS evolution.

## Simulation Engine Layer
The Simulation Engine layer is responsible for deterministic evaluation of blueprint scenarios.

## DTO Transitional Model
Current DTO structures are intentionally simplified transitional contracts used to stabilize UI boundaries while architecture layering is hardened.

Transitional examples:
- `BlueprintDTO` currently represents complex domain entities as primitive arrays (e.g., `objectives: string[]`, `hypotheses: string[]`, `actions: string[]`, `indicators: string[]`).
- `ScenarioDTO` currently exposes `assumptions: string[]` even though the domain model uses `Assumption[]` value objects.

Planned evolution:
- `objectives: ObjectiveDTO[]`
- `actions: ActionDTO[]`
- `indicators: IndicatorDTO[]`
- `assumptions: AssumptionDTO[]`

These changes are intentionally deferred to a later phase to avoid coupling UI transition work with full DTO hierarchy rollout.

It consumes only domain entities and enforces simulation-specific validation before producing a `SimulationResult`.

Boundary constraints:
- no Supabase imports,
- no repository usage,
- no UI logic,
- domain-only dependencies.
