# Meraviglia OS — Project Structure

## 1. Purpose

This document defines the official folder structure of the Meraviglia OS repository.

Goals:

* maintain predictable architecture
* keep modules discoverable
* support AI-assisted development
* prevent structural drift in the codebase

All new code must follow this structure.

---

## 2. Root Repository Structure

Expected repository layout:

```
root
 ├── docs
 ├── meraviglia-cashflow
 ├── CODEX_TASK_TEMPLATE.md
```

### docs/

Contains architecture documentation and system design documents.

Examples:

* architecture freeze
* engineering protocol
* simulation architecture
* roadmap
* security policies

### meraviglia-cashflow/

Main application codebase.

Contains all runtime code for the Meraviglia OS platform.

---

## 3. Application Code Structure

Inside `meraviglia-cashflow/src` the structure must follow the architectural layers.

```
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

Each folder has a strict responsibility.

### ui/

Contains React components and views.

Responsibilities:

* rendering
* user interaction
* calling application services

Must not contain business logic.

---

### application/

Use-case orchestration layer.

Contains:

* services
* DTOs
* composition root

Responsibilities:

* coordinate repositories
* call engines
* orchestrate workflows

---

### domain/

Core business semantics.

Contains:

* entities
* value objects
* domain rules
* invariants

Must remain framework-independent.

---

### engine/

Deterministic computation modules.

Examples:

* simulation engine
* cashflow engine
* proposal document engine

Rules:

* must be deterministic
* must depend only on domain

---

### repository/

Persistence contracts.

Contains repository interfaces used by the application layer.

---

### infra/

Infrastructure adapters.

Examples:

* database adapters
* API clients
* Supabase implementations

---

### state/

UI state management.

The state layer is considered **UI infrastructure**, not a business layer.

Responsibilities:

* client-side state
* persistence helpers
* UI state
* caching
* client persistence
* local storage interactions

It must NOT contain:

* domain rules
* business calculations
* domain entity mutations

State logic must remain presentation-oriented.

Must not implement business rules.

Dependency rules:

* may depend on `ui` and `application`
* must not depend on `domain`, `repository`, or `infra`

---

### auth/

Authentication boundary.

Handles login flows and session state.

Dependency rules:

* may depend on `application` for use-case level authentication flows
* may depend on `repository` contracts when persistence/session ports are required
* must not depend on `domain` or `infra` directly

---

### assets/

Static resources used by the UI.

Examples:

* images
* icons
* static files

Dependency rules:

* may be consumed by `ui` and `state`
* must not introduce runtime coupling to business layers

---

## 4. Layer Dependency Rules

Allowed dependency flow:

* `ui → application`
* `application → domain`
* `application → repository`
* `infra → repository`
* `engine → domain`
* `state → ui | application`
* `auth → application | repository`
* `assets → ui`

Forbidden dependencies:

* `domain → repository`
* `domain → ui`
* `domain → infra`
* `engine → infra`
* `ui → domain`
* `ui → repository`
* `state → domain | repository | infra`
* `auth → domain | infra`
* `assets → domain | application | repository | infra | engine`

These dependency rules are defined by the Architecture Freeze and must always be respected.

---

## 5. DTO Structure

DTOs live in:

```
src/application/dto
```

DTOs represent contracts between layers.

Rules:

* UI communicates using DTOs
* domain entities must never cross the UI boundary

---

## 6. Composition Root

Location:

```
src/application/composition/applicationComposition.ts
```

Responsibilities:

* wiring services
* wiring repositories
* building the runtime dependency graph

---

## 7. Engine Structure

Inside engine:

```
engine/
 ├── simulation
 ├── cashflow
 └── proposalDocument
```

Each engine module must be deterministic.

Simulation engines must follow:

```
SimulationEngine
    ↓
SimulationModel
    ↓
SimulationContext
    ↓
SimulationResult
```

---

## 8. Test Structure

Tests should live close to the modules they validate.

Preferred structure example:

```
engine/
simulation/
SimulationEngine.ts
SimulationEngine.test.ts
```

Alternatively, modules may contain a dedicated `__tests__` directory.

Tests must remain deterministic and aligned with the engineering protocol testing principles.

---

## 9. Documentation Structure

All system documentation lives under:

```
docs/
```

Key documentation includes:

* Architecture Freeze
* Engineering Protocol
* Simulation Architecture
* Security and Privacy
* Product strategy

---

## 10. Module Boundaries

Each module must have a clear and focused responsibility.

Modules should remain small and cohesive.

Large modules combining multiple responsibilities must be avoided.

Example module structure:

```
simulation/
SimulationEngine
SimulationModel
SimulationContext
```

The goal is to maintain high readability and predictable architecture.

Modules should favor composition over large monolithic files.

---

## 11. Future Modules

Potential future modules may include:

```
knowledge/
ai/
integration/
analytics/
```

These names are not an authorization to add folders. A future module may be introduced only when all of the following are documented and approved:

* exact placement in the project structure
* explicit responsibility scope
* explicit dependency contract (allowed and forbidden dependencies)
* alignment with Architecture Freeze v1 and Engineering Protocol

---

## 12. Structural Governance

New folders must not be introduced arbitrarily.

Structural changes must be:

* documented
* reviewed
* approved before merge
