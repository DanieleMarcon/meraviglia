# Codex Task Template — Governance Baseline V2

Use this template for implementation tasks.

## Task
- [Single concrete outcome]

## Context
- Current phase: [Point 0 / FUV / UX hardening]
- Existing behavior:
- Problem to solve now:

## Scope
- In scope:
  - [...]
- Out of scope:
  - [...]

## Affected layers
- [ui]
- [application]
- [repository/infra]

## Governance constraints (mandatory)
- Keep architecture path: `ui -> application -> repository/infra`.
- No direct UI -> Supabase access.
- Keep DTO/mappers as anti-leak boundary.
- Keep validation/lifecycle rules in application services.
- Keep errors deterministic and sanitized for user-facing UI.
- Preserve accessibility (labels, keyboard operability, explicit blocked/error/loading states).
- No new architecture layers.

## Functional requirements
- [Behavior 1]
- [Behavior 2]

## Non-functional requirements
- Strict typing.
- No dead code / unused imports.
- Maintain readability and small, targeted changes.

## Validation
- `npm run check`
- [Task-specific tests]

## Expected output
1. Summary
2. Files modified
3. Governance impact notes (security/privacy/accessibility/architecture)
4. Validation results
5. Known limitations / deferrals
