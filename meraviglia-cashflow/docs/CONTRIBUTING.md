# Contributing Guide

## Philosophy

Meraviglia is built with:

- Strict TypeScript typing
- Clear separation of concerns
- Modular components
- Pure engine logic

---

## Code Rules

1. No business logic inside UI components.
2. Engine functions must remain pure.
3. All domain entities must be typed.
4. Avoid implicit `any`.
5. Use strict TypeScript configuration.

---

## Commit Structure

Use semantic commits:

- feat:
- fix:
- refactor:
- docs:
- chore:

Example:

feat: add dynamic module editor

---

## Branching

main → stable
feature/* → development branches

---

## Code Review Principles

- Domain logic clarity
- Engine isolation
- UI separation
- Type safety

---

## Governance enforcement (required)

Every PR must satisfy security, privacy, and accessibility by-design controls:

1. Keep architecture boundaries intact (`ui -> application -> repository/infra`).
2. Preserve deterministic, sanitized error handling.
3. Apply data minimization for DTO/schema changes.
4. Keep keyboard/label/error-state accessibility behavior intact for UI changes.

Required local check before push:

```bash
npm run check
```

Use the repository PR template and complete all governance checklist items.
