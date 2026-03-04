# Meraviglia OS — Development Standard

## Development Methodology
Meraviglia OS follows an architecture-first, governance-driven methodology:

1. **Document intent first** (vision, boundaries, contracts).
2. **Design for layer integrity** before feature speed.
3. **Implement in modular increments** with explicit completion criteria.
4. **Validate deterministic behavior** for engine/domain logic.
5. **Audit architecture impact** before introducing any new module.

Delivery principle: no major implementation step should proceed without corresponding documentation and boundary validation.

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
- Strategic identity/positioning changes require updates in `MERAVIGLIA_OS_MASTER_PLAN.md`.
- Documentation updates must be atomic with the decision they represent.

## Layer Boundary Rules
- Domain contains strategic semantics only; no transport/infrastructure concerns.
- Engine contains deterministic transformation/orchestration logic; no UI coupling.
- Application orchestrates use-cases and coordinates repositories.
- Repository defines contracts only, no business decisions.
- Infra implements contracts and external integrations.
- UI focuses on presentation and interaction through application entry points.

Boundary violations are treated as architectural defects.

## Repository Isolation Rule
Repository interfaces must remain infrastructure-agnostic.

Required:
- Define ports in repository layer.
- Keep external SDK/database details in infra implementations.
- Prevent leakage of vendor-specific models into domain/application.

This ensures replaceability of Supabase and future backends without strategic logic rewrites.

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

## Audit Policy Before Each New Module
Before creating a new module, complete a pre-module audit:

- **Purpose audit**: why module exists and which phase objective it serves.
- **Boundary audit**: exact layer placement and dependency directions.
- **Contract audit**: interfaces and integration points defined.
- **Data audit**: persistence and migration impact identified.
- **Security audit**: identity/access implications mapped.
- **Governance audit**: docs updated and coherence with master plan confirmed.

A module cannot enter implementation until this audit is documented and approved in the project governance record.
