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

Meraviglia OS follows the Architecture Freeze v1 layer model. The mandatory dependency flow is:

`ui → application → domain → repository → infrastructure`

Allowed additional dependency rule:

`engine → domain`

Forbidden dependencies:

- `domain → ui`
- `domain → infrastructure`
- `engine → infrastructure`
- `ui → domain`
- `ui → repository`

These rules are architecture invariants and must never be violated.

## 3. Layer Responsibilities

### UI layer

Responsibilities:

- rendering
- user interaction
- state management
- calling application services

The UI layer must never implement business logic.

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

## 4. Naming Conventions

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

## 5. File Size and Complexity Limits

Maintainability requires small, focused modules.

Recommended limits:

- preferred file size: `<200` lines
- warning threshold: `300` lines
- hard review threshold: `500` lines

Large files must be split by responsibility. Functions should ideally be `<40` lines.

## 6. Commenting Standards

Comments must follow an engineering-documentation style.

Comments should explain:

- why something exists
- architectural constraints
- important invariants
- non-obvious design decisions

Avoid comments that simply repeat what the code already says.

Example of a good comment:

> This validation is enforced in the domain layer to preserve the aggregate invariant and prevent UI-specific assumptions from leaking into core business behavior.

## 7. Domain Modeling Rules

Domain modeling must prioritize correctness and explicit business intent.

Rules:

- entities must enforce invariants
- value objects must be immutable
- avoid primitive obsession
- business logic must live in domain or engine, never in UI

## 8. DTO Contract Rules

DTOs define the boundary between layers and must be treated as explicit contracts.

Rules:

- UI must communicate through DTOs
- domain entities must not cross the UI boundary
- DTOs must remain simple and explicit
- DTO naming must clearly indicate boundary usage

## 9. Deterministic Engine Rules

Simulation behavior must be deterministic and reproducible.

Simulation models must not access:

- system time
- randomness
- external state

All external execution metadata must come from `SimulationContext`.

## 10. Dependency Governance

Dependencies must be introduced conservatively and intentionally.

Rules:

- prefer minimal dependencies
- avoid heavy libraries unless justified
- remove unused dependencies
- prefer native language features when possible

All dependencies must be reviewed before introduction.

## 11. AI-Assisted Development Rules

Meraviglia OS supports AI-assisted development. To keep AI output reliable, the codebase must remain predictable.

Rules:

- small modules
- explicit contracts
- clear naming
- stable architecture

AI-generated code must be reviewed against this protocol before merge.

## 12. Evolution of the Protocol

This protocol may evolve as the codebase grows.

Changes must be deliberate, reviewed, and documented. Major changes require corresponding updates to architecture documentation.

---

This change introduces only this new document: `docs/ENGINEERING_PROTOCOL.md`. No source files were modified.
