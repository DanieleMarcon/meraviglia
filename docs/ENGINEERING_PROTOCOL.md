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

### Application layer ownership rules

- orchestrates use cases
- must not implement domain invariants

### Domain layer ownership rules

- owns business logic
- must remain framework independent

### Engine layer ownership rules

- performs deterministic computation
- must not depend on infrastructure

### Infrastructure layer ownership rules

- may depend on external systems
- must not contain business rules

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
- numeric precision and rounding policy must be explicit and consistently applied
- timezone and locale effects must be normalized and must not alter computation behavior
- collection traversal and evaluation order must be explicit and deterministic
- side effects are forbidden inside simulation models
- external data must be injected as governed input, never fetched ad hoc from inside the model

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
