# Meraviglia – Strategic Financial Configuration Engine

## Overview

Meraviglia is a strategic financial configuration engine designed to support high-level commercial consulting.

It allows consultants to:

- Design strategic development plans over time (3–24 months)
- Configure modular growth phases
- Build financial proposals dynamically
- Simulate cash flow impact
- Compare alternative commercial scenarios
- Export professional visual outputs (PNG / SVG)
- Manage a persistent service catalog

The goal is to evolve this tool into an internal SaaS-like strategic system for advanced consulting workflows.

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

# Roadmap – Phase 1 (Stability & Usability)

- [ ] Replace pixel-based drag shift with grid-aware positioning
- [ ] Auto-calculate module start months
- [ ] Improve timeline responsiveness
- [ ] Improve visual hierarchy
- [ ] Add service name label outside grid cell
- [ ] Add service deletion from proposal
- [ ] Add proposal renaming
- [ ] Improve heatmap logic (service-level payment overlay)

---

# Roadmap – Phase 2 (Advanced Strategy Engine)

- [ ] ROI simulation
- [ ] Margin projection
- [ ] Break-even visualization
- [ ] Revenue overlay
- [ ] Financial summary dashboard
- [ ] Proposal summary export

---

# Roadmap – Phase 3 (Productization)

- [ ] Cloud backend (Supabase / Firebase)
- [ ] Authentication layer
- [ ] Multi-client workspace
- [ ] Save multiple strategic plans
- [ ] Scenario versioning
- [ ] SaaS UI refinement

---

# Development

## Install
npm install

## Run
npm run dev

## Build
npm run build

---

# Vision

Meraviglia is intended to evolve from an internal consulting tool into a strategic configuration platform capable of:

- Structuring complex commercial architectures
- Simulating strategic financial impact
- Supporting high-level advisory workflows
- Becoming a modular SaaS system

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
