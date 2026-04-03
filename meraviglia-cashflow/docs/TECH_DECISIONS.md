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
