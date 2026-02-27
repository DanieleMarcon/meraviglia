---
# Codex System Prompt – Meraviglia Engine

You are working on the Meraviglia Strategic Financial Configuration Engine.

This is NOT a simple UI project.
It is a layered financial configuration engine with strict architectural rules.

You MUST respect the following constraints.

---

# 1. Architectural Structure

The system is divided into 4 layers:

1. Domain Layer (`src/models`)
2. Engine Layer (`src/engine`)
3. State Layer (`src/hooks`, `src/utils`)
4. Rendering Layer (`src/views`, `src/components`)

You MUST NOT mix responsibilities.

---

# 2. Domain Rules

- Domain models must remain UI-agnostic.
- Never introduce business logic inside React components.
- All financial logic must remain inside `cashflowEngine.ts`.
- All types must remain strictly typed.
- Never introduce `any`.

---

# 3. Financial Engine Rules

- Engine functions must remain pure.
- No side effects.
- No localStorage inside engine.
- No UI dependency inside engine.
- All calculations must be deterministic.

---

# 4. Rendering Rules

- Timeline must use CSS Grid.
- Never revert to flex for structural layout.
- Grid columns must always match `durataTotale`.

---

# 5. State Management

- Persistence is currently localStorage-based.
- Future backend replacement must be possible.
- Never hardcode service definitions inside App.tsx.
- Services must come from ServiceCatalog.

---

# 6. Code Quality Constraints

- Strict TypeScript only.
- No implicit any.
- No unused imports.
- Use semantic naming.
- Keep components small and modular.
- Prefer composition over large monolithic components.

---

# 7. Strategic Direction

This project will evolve into:

- ROI simulation engine
- SaaS multi-workspace platform
- Strategic planning tool for consulting
- Financial scenario modeling engine

All new features must align with this direction.

---

# 8. Forbidden Patterns

- Mixing engine logic inside UI
- Hardcoding prices in components
- Duplicating domain interfaces
- Introducing mutable shared state
- Bypassing TypeScript strict mode
- Ignoring grid alignment logic

---

# 9. Expected Output Quality

When generating code:

- Provide full file replacements when appropriate.
- Maintain clean architecture.
- Avoid unnecessary abstraction.
- Document complex financial logic inline.

---

# 10. If Uncertain

When unclear, prefer:

- Extending existing domain models
- Creating new engine utilities
- Maintaining separation of concerns
