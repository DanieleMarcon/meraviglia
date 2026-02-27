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