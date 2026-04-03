# Meraviglia OS — Cashflow Module (Strategic Core)

## High-Level System Description
Meraviglia OS is evolving from the original Preventivatore tool into a modular strategic operating system.

This repository (`meraviglia-cashflow`) currently represents the cashflow/planning core of that evolution. Its role is to support strategic design workflows (timeline planning, proposal structuring, and financial simulation) while the broader Meraviglia OS architecture expands toward orchestration, governance, and cross-system integration.

## Platform Core — Brand-Agnostic Architecture
Meraviglia OS platform core is formally defined as **brand-agnostic** and **white-label ready**.

Architecture hardening step 1 establishes:
- Multi-tenant model based on `organizations`.
- User model split between `auth.users` and `public.users`.
- Structured RBAC (`permissions`, `roles`, `role_permissions`, `user_roles`).
- Organization-scoped `workspaces` as strategic containers.
- Database-level tenant isolation via RLS on tenant-sensitive tables.

Explicitly not included in this milestone:
- Self-signup organization creation.
- Cross-organization super-admin/network governance.

### Strategic Positioning
- **Meraviglia OS is not a CRM.**
- **Relatia CRM remains the core business CRM platform.**
- Meraviglia OS is the strategic/orchestration brain that designs and governs initiatives above operational systems of record.

## Governance Documentation
The formal governance foundation for Phase 2+ is documented here:

- Master Plan: [`../docs/MERAVIGLIA_OS_MASTER_PLAN.md`](../docs/MERAVIGLIA_OS_MASTER_PLAN.md)
- Target Architecture: [`../docs/ARCHITECTURE_TARGET.md`](../docs/ARCHITECTURE_TARGET.md)
- Platform Data Model: [`../docs/PLATFORM_DATA_MODEL.md`](../docs/PLATFORM_DATA_MODEL.md)
- SQL Baseline (Step 1): [`../docs/SUPABASE_PLATFORM_CORE_STEP1.sql`](../docs/SUPABASE_PLATFORM_CORE_STEP1.sql)
- Roadmap Phases: [`../docs/ROADMAP_PHASES.md`](../docs/ROADMAP_PHASES.md)
- Development Standard: [`../docs/DEVELOPMENT_STANDARD.md`](../docs/DEVELOPMENT_STANDARD.md)

## Current System Status
Current status of the codebase in relation to the target architecture:

- ✅ Supabase authentication introduced
- ✅ Multi-user foundation established
- ✅ Governance baseline for multi-tenant RBAC and isolation formalized
- ✅ Intake baseline implemented
- ✅ Operational UI baseline available for Intake and Workspace workflows
- ✅ M3 Interactions foundation completed and merged
- ✅ Workspace contacts/interactions runtime stabilization completed
- ✅ M3.x extension: historical interaction log ordering + contact edit workflow

This means the repository is in a transition stage between MVP cashflow tooling and full Meraviglia OS modular architecture.

## Current Development Context
This module still delivers the sales/financial planning experience while architectural governance is being formalized for subsequent implementation phases.

Current capabilities include:
- Strategic timeline planning (3–24 months)
- Modular phase configuration
- Proposal composition with payment logic
- Cashflow simulation
- Parallel scenario comparison
- PNG/SVG visual export
- Local service catalog persistence

## Tech Stack
- React (Vite)
- TypeScript (strict mode)
- Supabase (Postgres + PostgREST)
- Repository pattern with DTO mappers
- Local lifted state (no global state manager)
- Docker (local development)
- Vercel (deployment)

## M3 Closeout Reference
Authoritative M3 closure and implementation-aligned runtime notes are documented in:

- [`docs/M3_CLOSEOUT.md`](docs/M3_CLOSEOUT.md)

## Clean Project Tree (Current)
```text
meraviglia-cashflow/
├── docs/
├── public/
├── src/
│   ├── application/
│   ├── assets/
│   ├── auth/
│   ├── domain/
│   ├── engine/
│   ├── infra/
│   ├── lib/
│   ├── repository/
│   ├── shared/
│   ├── state/
│   └── ui/
├── CODEX_SYSTEM_PROMPT.md
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

## Development
### Install
```bash
npm install
```

### Run
```bash
npm run dev
```

### Build
```bash
npm run build
```

## License
Private – Internal Strategic Tool
