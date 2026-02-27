# Meraviglia OS – Sales & Strategic Core

## Overview

Meraviglia OS is the Sales & Strategic Core of the broader Meraviglia operating model.

It supports consultants and strategic teams in designing, structuring, and governing commercial growth trajectories through a unified planning and financial configuration environment.

Current capabilities include:

- Strategic development planning over time (3–24 months)
- Modular growth phase configuration
- Dynamic commercial proposal composition
- Cashflow simulation and payment-logic configuration
- Parallel scenario comparison
- Professional visual exports (PNG / SVG)
- Persistent local service catalog management

---

## Product Vision

For the complete strategic product direction, see: [`docs/PRODUCT_VISION.md`](../docs/PRODUCT_VISION.md).

---

## Current Development Phase

We are currently in **Phase 1 – MVP Integrity & Sales Core Stabilization**.

---

## Roadmap Overview

- **Phase 1 – MVP Integrity & Sales Core Stabilization**  
  Stabilize the Sales Core baseline across planning, orchestration, cashflow, and proposal workflows.

- **Phase 2 – Financial Intelligence Layer**  
  Add deeper financial modeling, control logic, and scenario intelligence.

- **Phase 3 – Modular Governance OS**  
  Evolve into a modular operating system governing cross-functional growth operations.

---

# Core Concept

Meraviglia is built around 4 conceptual layers:

## 1. Service Catalog (Local Backend Layer)

A persistent catalog of services including:

- Name
- Category
- Full price
- Discounted price
- Standard duration
- Color
- Installment constraints
- Down payment permissions

Stored in localStorage.

---

## 2. Strategic Plan

A configurable timeline including:

- Total duration (months)
- Modular phases
  - Name
  - Duration
  - Validation (sum must match total duration)

Rendered using CSS Grid to ensure perfect alignment between:

- Months
- Modules
- Services
- Financial overlays

---

## 3. Proposal Engine

Each proposal includes:

- Selected services from the catalog
- Payment strategy per service:
  - One-shot
  - Installments
  - Subscription
  - Down payment + installments
- Service positioning in time
- Financial heatmap overlay

Multiple proposals can be compared in parallel.

---

## 4. Rendering Engine

Timeline uses a unified CSS Grid structure:
Row 1: Months
Row 2: Strategic Modules
Row 3+: Services
Overlay: Payment intensity heatmap

Cashflow chart built with Recharts.

Drag & Drop powered by dnd-kit.

---

# Tech Stack

- React + Vite
- TypeScript (strict mode)
- dnd-kit
- Recharts
- html-to-image
- UUID
- localStorage persistence

---

# Current Features

✔ Service catalog with persistence  
✔ Add services to proposal  
✔ Custom strategic plan editor  
✔ Drag & drop service positioning  
✔ Payment configuration editor  
✔ Financial heatmap overlay  
✔ Parallel proposal comparison  
✔ PNG & SVG export  
✔ Local persistence  

---

# Architectural Principles

- Separation of concerns (Catalog / Plan / Proposal / Rendering)
- Stateless rendering logic
- Persistent local data layer
- Type-safe domain models
- Modular components
- Scalable grid-based timeline

---

# Known Limitations

1. Timeline drag calculation still assumes fixed pixel width per month.
2. Module start month is implicit (derived from order).
3. No ROI / margin simulation yet.
4. No PDF generation.
5. No cloud persistence.
6. No user authentication.
7. No theming system.
8. No service category filtering.
9. No multi-proposal management system.
10. No scenario versioning.

---

# Development

## Install
npm install

## Run
npm run dev

## Build
npm run build

---

# License

Private – Internal Strategic Tool

## AI Development

This project uses a strict AI development protocol to maintain architectural integrity.

All AI-generated code must comply with the rules defined in:

`CODEX_SYSTEM_PROMPT.md`

The system enforces:

- Layer separation (Domain / Engine / State / Rendering)
- Strict TypeScript typing
- Pure financial engine logic
- CSS Grid-based timeline structure
- No business logic inside UI components

AI contributions must align with the long-term strategic direction of the Meraviglia Engine.
