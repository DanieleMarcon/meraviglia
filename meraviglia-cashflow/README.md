# Meraviglia OS — Cashflow Module (Strategic Core)

## High-Level System Description
Meraviglia OS is evolving from the original Preventivatore tool into a modular strategic operating system.

This repository (`meraviglia-cashflow`) currently represents the cashflow/planning core of that evolution. Its role is to support strategic design workflows (timeline planning, proposal structuring, and financial simulation) while the broader Meraviglia OS architecture expands toward orchestration, governance, and cross-system integration.

### Strategic Positioning
- **Meraviglia OS is not a CRM.**
- **Relatia CRM remains the core business CRM platform.**
- Meraviglia OS is the strategic/orchestration brain that designs and governs initiatives above operational systems of record.

## Governance Documentation
The formal governance foundation for Phase 2+ is documented here:

- Master Plan: [`../docs/MERAVIGLIA_OS_MASTER_PLAN.md`](../docs/MERAVIGLIA_OS_MASTER_PLAN.md)
- Target Architecture: [`../docs/ARCHITECTURE_TARGET.md`](../docs/ARCHITECTURE_TARGET.md)
- Roadmap Phases: [`../docs/ROADMAP_PHASES.md`](../docs/ROADMAP_PHASES.md)
- Development Standard: [`../docs/DEVELOPMENT_STANDARD.md`](../docs/DEVELOPMENT_STANDARD.md)

## Current System Status
Current status of the codebase in relation to the target architecture:

- ✅ Supabase authentication introduced
- ✅ Multi-user foundation established
- ⏳ Workspace refactor not yet implemented
- ⏳ Intake module not yet implemented
- ⏳ Application-layer-first architecture transition in progress

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
- React + Vite
- TypeScript (strict mode)
- dnd-kit
- Recharts
- html-to-image
- UUID
- Supabase (auth foundation)

## Clean Project Tree (Current)
```text
meraviglia-cashflow/
├── docs/
├── public/
├── src/
│   ├── assets/
│   ├── auth/
│   ├── domain/
│   ├── engine/
│   ├── lib/
│   ├── state/
│   └── ui/
├── CODEX_SYSTEM_PROMPT.md
├── README.md
├── eslint.config.js
├── index.html
├── middleware.ts
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
