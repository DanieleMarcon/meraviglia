# Architecture – Meraviglia Engine

## System Overview

Meraviglia is structured as a layered configuration engine.

The system is intentionally modular to support future SaaS evolution.

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

# Future Architecture Direction

Planned evolution:

- API abstraction layer
- Workspace context
- Multi-client management
- Modular plugin architecture
- Financial simulation engine expansion