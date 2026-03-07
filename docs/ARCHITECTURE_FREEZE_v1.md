# Meraviglia OS — Architecture Freeze v1

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
SimulationModel
     ↓
SimulationContext
     ↓
SimulationResult
```

Rules:

- SimulationEngine orchestrates simulation.
- SimulationModel implements strategy evaluation logic.
- SimulationContext provides deterministic execution metadata.
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

## Dependency Rules

Allowed flow:

```text
ui → application → domain
application → repository
infra → repository
engine → domain
```

Forbidden:

```text
domain → ui
domain → infra
engine → infra
ui → repository
ui → domain
```

## Deterministic Simulation Rule

Rules:

- simulation models must not access system time directly
- all temporal values must come from SimulationContext
- simulation must be reproducible

## Architecture Freeze

The architecture defined in this document represents the frozen architectural baseline of Meraviglia OS.

Future changes that affect architectural boundaries must be reviewed explicitly and documented as a new architecture version.

### Repository Interface Ownership

Repository interfaces are owned by the application layer as persistence ports.

Application services depend on these abstractions to satisfy use-case persistence needs without coupling to infrastructure details.

Infrastructure adapters implement the repository interfaces and can be replaced without changing application orchestration.

This applies the Dependency Inversion Principle: high-level policy (application orchestration) depends on abstractions, while low-level details (infra adapters) depend on the same abstractions.
