# Meraviglia OS — Architecture Freeze v1

## Governance Authority Map

This document is the canonical source for:

- dependency contracts across modules
- layer boundaries and composition root ownership
- freeze-level constraints for simulation and AI placement

Authority cross-reference:

- deterministic simulation execution details: `docs/SIMULATION_ENGINE.md`
- engineering enforcement and review protocol: `docs/ENGINEERING_PROTOCOL.md`
- repository/folder layout contract: `docs/PROJECT_STRUCTURE.md`
- domain bounded contexts and invariants: `docs/DOMAIN_ARCHITECTURE.md`
- AI operating model within freeze boundaries: `docs/AI_STRATEGY.md`

Governance enforcement expectations are operationalized in the mandatory Governance Enforcement Baseline in `docs/ENGINEERING_PROTOCOL.md`.

## Layered Architecture

```text
UI
 ↓
Application
 ↓
Domain

Application → Repository Interfaces
Infrastructure → Repository Interfaces
```

Rules:

- UI may only call Application services.
- Application orchestrates use cases.
- Domain contains pure business semantics.
- Repository defines persistence contracts.
- Infrastructure implements adapters.

## Strategic Simulation Architecture

```text
SimulationEngine
     ↓
SimulationContext
     ↓
SimulationModel
     ↓
SimulationResult
```

Rules:

- SimulationEngine orchestrates simulation.
- SimulationContext provides mandatory deterministic execution metadata.
- SimulationModel implements strategy evaluation logic using SimulationContext inputs.
- SimulationResult contains simulation output.

Simulation models must be deterministic.

They must never call system time or randomness directly.

## Domain Modeling Principles

Rules:

- Domain entities enforce invariants.
- Value objects are immutable.
- Primitive obsession must be avoided.
- Domain must remain independent from frameworks and infrastructure.

## Application DTO Boundary

Rules:

- UI must communicate with the system using DTOs.
- Domain objects must never cross the UI boundary.
- DTOs may temporarily use flattened structures during migration phases.

## Composition Root

Location:

`src/application/composition/applicationComposition.ts`

Responsibilities:

- instantiate infrastructure adapters
- instantiate application services
- wire repository interfaces to implementations

## Dependency Rules (Frozen Contract)

The dependency contract below is non-negotiable for Architecture Freeze v1.

Allowed dependencies:

```text
ui → application
application → domain
application → repository
application → engine
infra → repository
engine → domain
state → ui | application
auth → application | repository
assets → ui
```

Forbidden dependencies:

```text
domain → repository
domain → infra
domain → ui
ui → domain
ui → repository
engine → infra
state → domain | repository | infra
auth → domain | infra
assets → domain | application | repository | infra | engine
```

Notes:

- Domain remains pure business semantics and must never depend on repository or infrastructure.
- Repository remains a contract boundary used by application and implemented by infrastructure.
- Composition root wiring remains outside domain logic.

## Deterministic Simulation Rule

Rules:

- simulation models must not access system time directly
- simulation models must not access randomness unless explicitly injected through governed context
- all temporal values and execution metadata must come from SimulationContext
- canonical numeric baseline: fixed-scale decimal semantics (`scale=6`) with `half-even` rounding for normalized values used in branching, comparisons, and result emission
- canonical timezone/locale baseline: UTC in `SimulationContext` and locale-neutral execution independent of process/user/device/server locale
- collection traversal and evaluation order must be deterministic
- side effects are forbidden inside simulation models
- external data used by simulation must be injected as governed input, never pulled ad hoc
- simulation must be reproducible
- deviation from canonical numeric/time baselines requires explicit governance approval in architecture/protocol docs before implementation

Authority note:
- detailed simulation execution governance is defined in `docs/SIMULATION_ENGINE.md`

## AI Architecture Constraint (Freeze Alignment)

Rules:

- AI features must respect the same frozen dependency contract as all other modules
- AI must not introduce boundary bypasses (including direct UI-to-domain or engine-to-infra shortcuts)
- AI-assisted development does not authorize architecture exceptions
- future AI modules/components require explicit placement and explicit dependency governance before implementation

## Architecture Freeze

The architecture defined in this document represents the frozen architectural baseline of Meraviglia OS.

Future changes that affect architectural boundaries must be reviewed explicitly and documented as a new architecture version.

### Repository Interface Ownership

Repository interfaces are owned by the application layer as persistence ports.

Application services depend on these abstractions to satisfy use-case persistence needs without coupling to infrastructure details.

Infrastructure adapters implement the repository interfaces and can be replaced without changing application orchestration.

This applies the Dependency Inversion Principle: high-level policy (application orchestration) depends on abstractions, while low-level details (infra adapters) depend on the same abstractions.
