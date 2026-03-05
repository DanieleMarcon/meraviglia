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

This baseline structure establishes the dependency flow `ui → application → repository → infra → supabase client` for workspace operations.

## Operational UI Layer Introduction
The first operational UI module (Intake interface) establishes the UI baseline for executable workflows.

Principles:
- UI modules call application services only (`createIntake`, `listIntakes`, `convertIntakeToWorkspace`).
- UI modules must not import Supabase clients or infra adapters directly.
- Application services remain the orchestration boundary for persistence and workflow transitions.

Operational flow remains strictly aligned to the dependency chain:
`ui → application → repository → infra → supabase`

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
