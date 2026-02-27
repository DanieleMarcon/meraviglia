# Architecture – Meraviglia Engine

## System Overview

The current implementation represents the **kernel of Meraviglia OS**.

It is an internal strategic infrastructure component and **not a standalone SaaS tool**.

Meraviglia is structured as a layered configuration engine so that strategic logic remains stable while interaction surfaces can evolve.

---

## Kernel Concept

In Meraviglia OS, the kernel is defined as:

**Domain models + Engine + Validation = OS Kernel**

- **Domain models** (`src/models`) define strategic and commercial entities.
- **Engine** (`src/engine`) executes deterministic financial and planning logic.
- **Validation** (`src/utils/domainValidation.ts`) enforces domain constraints and consistency rules.

UI layers (`src/views`, `src/components`) are adapters over the kernel: they expose and manipulate kernel capabilities, but they do not define business logic.

---

# Layered Architecture

## 1. Domain Layer

Located in:
src/models

Core entities:

- ServiceDefinition
- Service (proposal instance)
- StrategiaPagamento
- Proposta
- PianoStrategico
- Modulo

This layer must remain UI-agnostic.

---

## 2. State Layer

Located in:

src/hooks
src/utils


Responsibilities:

- Service catalog persistence
- Proposal persistence
- Local storage synchronization

Currently using localStorage.

Future:

- Replaceable with cloud persistence.

---

## 3. Engine Layer

Located in:

src/engine


Contains:

- cashflowEngine.ts

Responsibilities:

- Payment simulation
- Installment calculation
- Heatmap data generation
- Financial aggregation

Pure functions only.

No UI dependencies.

---

## 4. Rendering Layer

Located in:

src/views
src/components


Responsibilities:

- Timeline rendering
- Grid alignment
- Drag & drop
- Charts
- Editors

Strict separation from engine logic.

---

# Rendering Philosophy

Timeline is built using:


display: grid;
grid-template-columns: repeat(durataTotale, 1fr);


This ensures structural consistency across:

- Months
- Modules
- Services
- Overlays

---

## Phase-Based Evolution Strategy

Architecture evolution follows the product vision roadmap:

- **Phase 1: Sales Core stabilization**  
  Consolidate planning, service orchestration, cashflow, and proposal generation into a robust operational baseline.

- **Phase 2: Financial Intelligence**  
  Extend kernel capabilities with deeper financial modeling, control logic, and scenario intelligence.

- **Phase 3: Modular Governance expansion**  
  Expand from Sales Core into a broader modular governance OS spanning additional strategic engines.

---

# Future Architecture Direction

Planned evolution:

- API abstraction layer
- Workspace context
- Multi-client management
- Modular plugin architecture
- Financial simulation engine expansion
