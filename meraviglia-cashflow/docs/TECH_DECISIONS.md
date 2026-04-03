# Technical Decisions Log

## Frontend Foundation
### Why React + Vite?
- Fast iteration for operational UI flows.
- Clear component boundaries for layered architecture.

### Why TypeScript strict mode?
- Prevents silent contract drift across domain/application/infra/ui.
- Enforces safer DTO and mapper boundaries.

## Backend and Data Access
### Why Supabase (Postgres + PostgREST)?
- Managed Postgres with RLS support for org isolation.
- PostgREST enables typed repository adapters with explicit query contracts.

### Why repository pattern?
- Keeps application services storage-agnostic.
- Centralizes Supabase-specific behavior inside `infra` adapters.

### Why DTO + mapper separation?
- Stabilizes UI-facing contracts.
- Isolates decode/normalization and persistence shape concerns.

## State and Runtime
### Why local lifted state (no global state manager)?
- Current interaction/contacts scope is workspace-local and manageable without global stores.
- Keeps runtime behavior explicit (readiness gating + reload orchestration).

## Infrastructure
### Why Docker for local and Vercel for deploy?
- Docker standardizes local service workflows.
- Vercel provides predictable frontend deployment for current app shape.

## Development Governance Baseline
### Why dedicated by-design policy docs?
- Keep security, privacy/GDPR, and accessibility constraints implementation-oriented and reviewable during normal delivery.
- Avoid fragmented guidance by centralizing practical guardrails and PR checklists in:
  - `SECURITY_BY_DESIGN.md`
  - `PRIVACY_GDPR_BY_DESIGN.md`
  - `ACCESSIBILITY_BY_DESIGN.md`
