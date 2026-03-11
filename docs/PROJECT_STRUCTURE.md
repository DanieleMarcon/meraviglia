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

Responsibilities:

* client-side state
* persistence helpers

Must not implement business rules.

---

### auth/

Authentication boundary.

Handles login flows and session state.

---

### assets/

Static resources used by the UI.

Examples:

* images
* icons
* static files

---

## 4. DTO Structure

DTOs live in:

```
src/application/dto
```

DTOs represent contracts between layers.

Rules:

* UI communicates using DTOs
* domain entities must never cross the UI boundary

---

## 5. Composition Root

Location:

```
src/application/composition/applicationComposition.ts
```

Responsibilities:

* wiring services
* wiring repositories
* building the runtime dependency graph

---

## 6. Engine Structure

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

## 7. Documentation Structure

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

## 8. Future Modules

The architecture allows future modules such as:

```
knowledge/
ai/
integration/
analytics/
```

These modules must still respect the architecture layering.

---

## 9. Structural Governance

New folders must not be introduced arbitrarily.

Structural changes must be:

* documented
* reviewed
* approved before merge
