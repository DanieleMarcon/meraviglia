# Meraviglia OS — Development Standard

## Development Methodology
Meraviglia OS follows an architecture-first, governance-driven methodology:

1. **Document intent first** (vision, boundaries, contracts).
2. **Design for layer integrity** before feature speed.
3. **Implement in modular increments** with explicit completion criteria.
4. **Validate deterministic behavior** for engine/domain logic.
5. **Audit architecture impact** before introducing any new module.

Delivery principle: no major implementation step should proceed without corresponding documentation and boundary validation.

## Platform Core — Brand-Agnostic Architecture
All platform-core decisions must preserve white-label neutrality.

Mandatory rule:
- Use neutral entity naming (`organizations`, `users`, `roles`, `permissions`, `workspaces`) and avoid brand-specific persistence semantics.

Multi-tenant baseline:
- Organization is the tenant boundary.
- User identity is split between `auth.users` and `public.users`.
- RBAC model is global permission catalog + organization roles + mapping tables.

## Mandatory REQUIRED OUTPUT BLOCK Structure
Every substantial implementation or architectural task must end with a standardized output block containing:

1. Full list of files created/modified.
2. Full content of newly created governance/architecture files when applicable.
3. Full content of any top-level documentation entry point updated (e.g., README).
4. Explicit confirmation of whether source code files were modified.
5. Architectural integrity statement.
6. Strategic coherence score (0–10) with rationale.
7. Risk statement if step had been skipped.
8. Governance record summary.

This block is mandatory for governance traceability and audit readiness.

## Documentation Update Rules
- Any architecture-impacting change must update corresponding docs in `/docs` before or together with implementation.
- Roadmap phase transitions require explicit criteria updates in `ROADMAP_PHASES.md`.
- Structural boundary changes require updates in `ARCHITECTURE_TARGET.md`.
- Strategic modeling changes (Blueprint model, Strategy Templates, simulation boundaries) must update Knowledge Layer-linked documentation.
- Strategic identity/positioning changes require updates in `MERAVIGLIA_OS_MASTER_PLAN.md`.
- Documentation updates must be atomic with the decision they represent.

## Intake-First Micro Rule
All strategic flows originate from Intake.

## Layer Boundary Rules
- Domain contains strategic semantics only; no transport/infrastructure concerns.
- Engine contains deterministic transformation/orchestration logic; no UI coupling.
- Application orchestrates use-cases and coordinates repositories.
- Repository defines contracts only, no business decisions.
- Infra implements contracts and external integrations.
- UI focuses on presentation and interaction through application entry points.

Boundary violations are treated as architectural defects.

Mandatory dependency chain for feature delivery:
`ui → application → domain → repository → infra`

## Composition Root Standard
The application layer owns the system composition root and is responsible for constructing the runtime object graph.

Composition root location:
- `src/application/composition/applicationComposition.ts`

Required responsibilities:
- instantiate infrastructure adapters,
- instantiate application services,
- wire dependencies between services and repositories,
- register services for UI access.

Current temporary pattern:
- service registration currently uses a temporary service locator pattern,
- concrete examples include `setWorkspaceService` and `setIntakeService`.

Replacement policy:
- the temporary service locator pattern must be replaced by a service factory or dependency injection container as application scope increases.

## Tenant Security & Isolation Standard
Required for tenant-scoped data:
- `organization_id` enforced with foreign keys and NOT NULL where applicable.
- RLS enabled on tenant-sensitive tables.
- Policies bound to authenticated user organization context.
- Cross-organization access disallowed by default.

No implementation is production-ready without explicit isolation guarantees.

## Repository Isolation Rule
Repository interfaces must remain infrastructure-agnostic.

Required:
- Define ports in repository layer.
- Keep external SDK/database details in infra implementations.
- Prevent leakage of vendor-specific models into domain/application.

This ensures replaceability of Supabase and future backends without strategic logic rewrites.

## UI Infrastructure Client Isolation Rule
UI components must never import infrastructure clients (Supabase clients, infra adapters, SDK-bound gateways).

Required pattern:
- UI imports only application-layer use-cases/services.
- Infrastructure access remains encapsulated in infra implementations behind repository/application boundaries.

## No UI-to-Engine Rule (Future State)
Future-state rule (enforced as architecture matures):
- UI must never directly call engine logic.
- UI must interact exclusively through application use-cases.

During transition phases, any exceptions must be documented with a sunset plan and removal milestone.

## Versioning & Migration Policy
- Version strategic contracts (repositories, adapters, critical DTOs) explicitly.
- Treat schema and contract migrations as first-class deliverables.
- Require backward-compatibility strategy or intentional breaking-change rationale.
- Maintain migration notes for every phase that alters persistent or integration models.

No phase is considered complete without migration clarity where applicable.

## Code Review Criteria
Every pull request must be reviewed against:
1. Layer boundary compliance.
2. Contract clarity and isolation quality.
3. Security and authorization implications.
4. Determinism/testability of business logic.
5. Documentation consistency with implemented behavior.
6. Long-term alignment with Meraviglia OS strategic positioning (non-CRM orchestration brain).

## Architectural Risks
### Risk 1 — Weak Domain Model
If the Domain Layer is underspecified, strategic rules leak into UI/application code and become inconsistent across workflows.

Mitigation strategies:
- Define and version core domain aggregates and invariants (including Blueprint and related value objects).
- Require domain-level review for new strategic capabilities before implementation approval.
- Enforce tests around domain rules independent from infra/UI behavior.

### Risk 2 — Non-atomic operations
If strategic operations are split across non-atomic persistence steps, traceability and consistency can break under failure conditions.

Mitigation strategies:
- Design critical workflow mutations as transactional or compensatable units.
- Require explicit idempotency strategy for cross-boundary operations.
- Add failure-mode documentation and rollback policy for each high-impact use case.

### Risk 3 — Blueprint model over-flexibility
If Blueprint structure becomes excessively permissive, model quality degrades and simulation outputs lose strategic reliability.

Mitigation strategies:
- Define mandatory Blueprint structure constraints (objectives, hypotheses, actions, indicators, simulations).
- Govern Strategy Templates through Knowledge Layer curation and versioning.
- Introduce schema and validation gates before blueprint activation in operational flows.

## Audit Policy Before Each New Module
Before creating a new module, complete a pre-module audit:

- **Purpose audit**: why module exists and which phase objective it serves.
- **Boundary audit**: exact layer placement and dependency directions.
- **Contract audit**: interfaces and integration points defined.
- **Data audit**: persistence and migration impact identified.
- **Security audit**: identity/access implications mapped.
- **Governance audit**: docs updated and coherence with master plan confirmed.

A module cannot enter implementation until this audit is documented and approved in the project governance record.
