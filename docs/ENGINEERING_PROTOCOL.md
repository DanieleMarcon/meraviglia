# Meraviglia OS — Engineering Protocol

## 1. Purpose of this Protocol

This document defines the engineering standards for the Meraviglia OS codebase after Architecture Freeze v1. It is the technical constitution of the project and governs how code is written, structured, reviewed, and extended.

The goals of this protocol are to:

- maintain architectural integrity
- ensure predictable code structure
- support long-term maintainability
- support AI-assisted development
- prevent architecture drift

All new code must comply with this protocol.

## 2. Architecture Invariants

Meraviglia OS follows the Architecture Freeze v1 dependency contract.

Canonical allowed dependencies (authority: `docs/ARCHITECTURE_FREEZE_v1.md`):

- `ui → application`
- `application → domain`
- `application → repository`
- `application → engine`
- `infra → repository`
- `engine → domain`
- `state → ui | application`
- `auth → application | repository`
- `assets → ui`

Canonical forbidden dependencies:

- `domain → repository`
- `domain → infra`
- `domain → ui`
- `ui → domain`
- `ui → repository`
- `engine → infra`
- `state → domain | repository | infra`
- `auth → domain | infra`
- `assets → domain | application | repository | infra | engine`

These rules are architecture invariants and must never be violated.

## Governance Enforcement Baseline

Architecture invariants are non-negotiable constraints and must be protected by mandatory, pre-merge controls.

Minimum required enforcement classes:

1. **Dependency and layer-boundary verification**: forbidden imports and forbidden dependency directions must be detectable before merge.
2. **Deterministic simulation verification**: simulation-critical changes must validate deterministic behavior before merge.
3. **Domain and invariant protection**: domain invariants and architecture contracts must be validated through required review and tests.
4. **Static and structural validation**: linting, static validation, and structural checks must prevent silent rule regressions.
5. **Merge policy**: violations of architecture invariants are merge-blocking, never advisory.

Review-only acceptance is prohibited for architecture governance.

Temporary patterns or exceptions require explicit justification, must preserve all invariants, are migration-only, and must not be treated as precedent for future architecture decisions.

## 3. Project Structure Rules

The repository structure is an official part of the engineering contract and must remain stable to preserve maintainability and support AI-assisted development.

Expected architecture structure inside `meraviglia-cashflow/src`:

```text
src/
├── ui
├── application
├── domain
├── engine
├── repository
├── infra
├── state
├── auth
├── assets
```

Structure governance rules:

- new folders must not be introduced arbitrarily
- structural changes must be explicitly documented
- the architecture layering defined in Architecture Freeze v1 must always be preserved


## 3.1 Canonical Dependency Matrix

| From \ To | UI | Application | Domain | Repository | Infra | Engine | State | Auth | Assets |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UI | — | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Application | ❌ | — | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Domain | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Repository | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ |
| Infra | ❌ | ❌ | ❌ | ✅ | — | ❌ | ❌ | ❌ | ❌ |
| Engine | ❌ | ❌ | ✅ | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| State | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ |
| Auth | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | — | ❌ |
| Assets | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — |

Notes:

- This matrix is a direct rendering of the freeze contract; undefined paths are treated as forbidden until explicitly governed.
- `repository` is a contract module (ports), not an implementation module.
- Infra may depend on repository contracts to implement adapters.
- Composition root wiring stays in application composition, outside domain logic.

## 4. Layer Responsibilities

### UI layer

Responsibilities:

- rendering
- user interaction
- state management
- calling application services

The UI layer must never implement business logic.

UI must access business capabilities through application, not domain directly.

### Application layer

Responsibilities:

- orchestrating use cases
- DTO transformations
- coordinating repositories and engines

The application layer must not contain domain rules.

### Domain layer

Responsibilities:

- business rules
- invariants
- entities and value objects

The domain layer must remain framework-independent.

### Engine layer

Responsibilities:

- deterministic computation
- simulation models
- domain-level calculations

The engine layer must depend only on domain.

### Repository layer

Responsibilities:

- persistence contracts only
- persistence-facing record/input shapes only (no application DTO ownership)

Repository contract naming guidance:

- repository payloads should be named as persistence records/contracts (for example `*Record`, `*RecordInput`)
- application-facing DTO/input/output contracts must live under `src/application` (for example `src/application/dto`)

### Infrastructure layer

Responsibilities:

- external system adapters
- database implementations
- repository contract implementations

## 5. Code Ownership and Layer Responsibility

Ownership boundaries between layers are mandatory.

### UI layer ownership rules

- may not modify domain models
- may not implement business rules
- may transport user-selected identity references (for example selected catalog service IDs) as DTO fields only
- should emit narrow edit intents for proposal mutations (for example payment strategy updates by `serviceId` + changed fields) rather than reconstructing nested proposal/service/payment object graphs directly
- must not originate identity enrichment, identity reconciliation, or business normalization logic

### Application layer ownership rules

- orchestrates use cases
- must not implement domain invariants
- owns identity propagation/orchestration across UI, repository, and domain boundaries
- when boundary payloads need runtime compatibility keys, application mappers should still emit stable business identity explicitly (for example `catalogServiceId`) instead of relying on shape/key inference
- when application DTO contracts and domain models are shape-compatible, strategic-planning services must still use explicit application-owned mappers for domain ingress/egress to preserve semantic ownership and contract evolution safety
- compare/document orchestration must expose application-owned projection mappers at service boundaries (for example proposal-service → compare-series/export payloads) instead of relying on implicit DTO shape compatibility
- proposal-document orchestration must prepare high-value section payloads (at minimum `ACTIVATED_SERVICES`, `STRATEGIC_PLAN`, `FINANCIAL_PROPOSAL`, and `COMPARISON`) through application-owned mappers/projections before engine emission, preserving explicit contract ownership and reducing shape coupling
- import/repository adapters that ingest legacy payloads may accept legacy alias keys only as narrow compatibility bridges (for example `catalog_service_id`) but must normalize them immediately to canonical application fields (`catalogServiceId`) before business orchestration
- local persistence bootstrap ingress must pass through an explicit decode/compatibility adapter boundary (parse → shape guard → legacy alias canonicalization) before application orchestration; bootstrap adapters may not rely on broad cast-based acceptance

### Domain layer ownership rules

- owns business logic
- must remain framework independent

### Engine layer ownership rules

- performs deterministic computation
- must not depend on infrastructure

### Infrastructure layer ownership rules

- may depend on external systems
- must not contain business rules
- repository/infra ingress adapters must decode/adapt external persistence rows at runtime before returning repository records to application flow
- decode adapters at infra ingress may perform structural/compatibility normalization only (shape guards, legacy key aliases, nullability coercion) and must not perform business/domain normalization

## 6. Naming Conventions

Use explicit, role-based naming to make boundaries and intent obvious.

Required suffix conventions:

- `DTO` suffix for application boundary types
- `Service` suffix for application services
- `Engine` suffix for computation modules
- `Model` suffix for simulation models
- `Context` suffix for deterministic execution metadata

Additional naming rules:

- avoid mixing languages in domain models
- prefer English naming for all future code

## 7. File Size and Complexity Limits

Maintainability requires small, focused modules.

Recommended limits:

- preferred file size: `<200` lines
- warning threshold: `300` lines
- hard review threshold: `500` lines

Large files must be split by responsibility. Functions should ideally be `<40` lines.

## 8. Commenting Standards

Comments must follow an engineering-documentation style.

Comments should explain:

- why something exists
- architectural constraints
- important invariants
- non-obvious design decisions

Avoid comments that simply repeat what the code already says.

Example of a good comment:

> This validation is enforced in the domain layer to preserve the aggregate invariant and prevent UI-specific assumptions from leaking into core business behavior.

## 9. Domain Modeling Rules

Domain modeling must prioritize correctness and explicit business intent.

Rules:

- entities must enforce invariants
- value objects must be immutable
- avoid primitive obsession
- business logic must live in domain or engine, never in UI

## 10. DTO Contract Rules

DTOs define the boundary between layers and must be treated as explicit contracts.

Rules:

- UI must communicate through DTOs
- domain entities must not cross the UI boundary
- DTOs must remain simple and explicit
- DTO naming must clearly indicate boundary usage

## 11. Deterministic Engine Rules

Primary authority for simulation determinism rules is `docs/SIMULATION_ENGINE.md`; this section is enforceable protocol-level restatement for implementation and review.

Simulation behavior must be deterministic and reproducible.

Hard rules:

- simulation models must not access system time
- simulation models must not access randomness unless explicitly injected through governed context input
- simulation models must not pull external state during execution
- execution metadata must enter through `SimulationContext` only
- canonical numeric baseline: fixed-scale decimal semantics (`scale=6`) with `half-even` rounding for normalized values used in branching, comparisons, and emitted simulation outputs
- canonical timezone/locale baseline: `SimulationContext` time is UTC and simulation execution is locale-neutral independent of process/user/device/server locale
- collection traversal and evaluation order must be explicit and deterministic
- side effects are forbidden inside simulation models
- external data must be injected as governed input, never fetched ad hoc from inside the model
- deviations from the canonical numeric/time baselines require explicit governance approval in architecture/protocol documentation before implementation

Enforcement expectations:

- pull request review must verify deterministic invariants
- deterministic engine behavior must be protected by tests and conventions
- violations are architecture governance failures

## 12. Testing Principles

Testing must support reproducibility and architectural stability.

Rules:

- domain logic must be unit-testable
- engine modules must support deterministic tests
- application services should be tested through use cases
- UI tests must not contain business logic

## 13. Dependency Governance

Dependencies must be introduced conservatively and intentionally.

Rules:

- prefer minimal dependencies
- avoid heavy libraries unless justified
- remove unused dependencies
- prefer native language features when possible

All dependencies must be reviewed before introduction.

## 14. Pull Request Governance

Every pull request must verify that:

- architecture boundaries are respected
- file size limits are respected
- DTO boundaries are respected
- deterministic simulation rules are respected
- dependencies introduced are justified

Large architectural changes must reference architecture documentation updates.

## 15. AI-Assisted Development Rules

Meraviglia OS supports AI-assisted development. To keep AI output reliable, the codebase must remain predictable.

Rules:

- small modules
- explicit contracts
- clear naming
- stable architecture
- AI implementation must stay within approved layer boundaries
- AI features must not bypass `ui → application → (domain | engine)` flow
- AI code must not mutate domain rules outside normal domain governance
- AI-assisted workflows adjacent to simulation must preserve deterministic simulation invariants

AI-generated code must be reviewed against this protocol before merge.
Human review is mandatory for all AI-generated or AI-assisted changes.


## 15.1 AI Architecture Constraints

AI capabilities are subject to the Architecture Freeze dependency contract.

Rules:

- AI orchestration belongs in `application` unless a new module is explicitly approved
- AI must not introduce direct `ui → domain`, `ui → repository`, or `engine → infra` bypass paths
- AI adapters to external providers belong in `infra` and must be consumed through approved application/repository boundaries
- AI components must not write directly into forbidden layers or bypass domain invariants
- AI-related engine logic must preserve deterministic simulation boundaries defined in `docs/SIMULATION_ENGINE.md`

## 16. Future Module Governance

Future modules (for example `ai`, `knowledge`, `integration`, `analytics`) must not be added without:

- explicit placement in `src/` structure
- an explicit dependency contract (allowed + forbidden dependencies)
- alignment with Architecture Freeze v1 and this protocol

No new module is implicitly allowed by naming it in planning documents.

## 17. Evolution of the Protocol

This protocol may evolve as the codebase grows.

Changes must be deliberate, reviewed, and documented. Major changes require corresponding updates to architecture documentation.
