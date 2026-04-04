# Meraviglia Prompting Protocol V2 (Governance Baseline)

Date: 2026-04-04  
Scope: Post-M3.x governance baseline ("Point 0")

## 1) Purpose

This protocol defines how prompts are written for Codex/ChatGPT so delivery stays aligned with the current governance baseline:
- security by design
- privacy/GDPR by design
- accessibility by design
- architecture boundaries (`ui -> application -> repository/infra -> supabase`)

This protocol is practical and enforceable. It is not a generic AI writing guide.

---

## 2) Non-negotiable defaults (implicit in every prompt)

Every implementation prompt is assumed to require:

1. **No UI -> infra/supabase shortcut**.
2. **No persistence model leakage to UI** (DTO/mappers stay intact).
3. **Validation and lifecycle rules in application layer** (not ad-hoc in components).
4. **Deterministic, sanitized user-facing errors**.
5. **Accessible interaction behavior** (labels, keyboard operability, explicit error/blocked/loading states).
6. **No new architecture layers** and no responsibility reshuffle.
7. **Governance check remains green** (`npm run check`).

If a task needs to violate one of these, the prompt is invalid and must be rewritten.

---

## 3) Standard prompt template (Codex-ready)

Use this template for feature/refactor tasks.

```md
# Task
[One concrete outcome, not a broad initiative.]

## Context
- Current phase: [e.g., Point 0 baseline / UX hardening]
- Existing behavior: [what already exists]
- Problem to solve now: [specific gap]

## Scope
- In scope:
  - [...]
- Out of scope:
  - [...]

## Affected layers
- [ui]
- [application]
- [repository/infra]
(Only list layers that should change.)

## Governance constraints (mandatory)
- Keep architecture path: `ui -> application -> repository/infra`.
- Do not import Supabase client outside `infra`.
- Keep DTO/mappers as anti-leak boundary.
- Keep validation/lifecycle enforcement in application services.
- Keep user-facing errors deterministic and sanitized.
- Preserve accessibility: visible labels, keyboard operability, explicit blocked/error/loading states.
- No new architecture layers or cross-layer shortcuts.

## Implementation requirements
- [Precise behavioral requirements]
- [Data/lifecycle constraints]
- [UI behavior constraints]

## Validation
Run and report:
- `npm run check`
- [Any task-specific tests]

## Expected output
1. Summary of changes
2. Files modified
3. Governance impact notes (security/privacy/accessibility/architecture)
4. Validation results
5. Residual risks or deferrals (if any)
```

---

## 4) Pre-flight checklist (before sending a prompt)

1. **Scope clarity**
   - Is the task single-purpose and bounded?
   - Are explicit out-of-scope items listed?

2. **Layer impact clarity**
   - Which layers are expected to change?
   - Is any forbidden boundary crossing implied?

3. **Governance implications**
   - Security: any validation/error/supabase-surface impact?
   - Privacy: any new personal fields or data exposure?
   - Accessibility: any changes to forms/actions/error states?

4. **Policy compatibility**
   - Does the prompt preserve existing lifecycle policies?
   - Does it avoid new architecture layers/shortcuts?

5. **Verification readiness**
   - Are required checks specified (`npm run check` + targeted tests)?
   - Is expected output format explicit?

If any answer is unclear, do not send the prompt yet.

---

## 5) Anti-patterns to ban (with examples)

## A) Architecture shortcut prompts (forbidden)

Bad:
- "Update the component to write directly to Supabase for faster delivery."

Why bad:
- Bypasses validation and policy control points.

---

## B) Persistence leakage prompts (forbidden)

Bad:
- "Return raw DB rows to UI so we avoid writing mappers."

Why bad:
- Breaks DTO boundary and increases privacy/security drift.

---

## C) Validation bypass prompts (forbidden)

Bad:
- "Do minimal frontend checks; backend/review can handle rules later."

Why bad:
- Reintroduces inconsistent lifecycle enforcement and regressions.

---

## D) Inaccessible UI shortcut prompts (forbidden)

Bad:
- "Add icon-only actions; we can improve labels/keyboard later."

Why bad:
- Violates accessibility-by-design and increases UX hardening debt.

---

## E) Governance-blind prompts (forbidden)

Bad:
- "Implement this quickly; skip check scripts and tests for now."

Why bad:
- Removes the only active enforcement gate and invites silent regressions.

---

## 6) Prompt Pattern Capture Rule (lightweight execution memory)

Prompting Protocol V2 remains the sole authoritative prompt entry point. This rule adds lightweight execution memory only; it does not create a second protocol.

After a **successful relevant execution prompt**, append one short reusable record to `docs/PROMPT_PATTERNS.md`.

Capture only prompts that produced reusable execution value.

Relevant prompt classes:
- feature development
- refactor / hardening
- audit / review
- documentation alignment

Do **not** capture:
- brainstorming
- exploratory chats
- discarded prompts
- trivial one-off clarifications

Operational constraints:
- Capture is append-only in `docs/PROMPT_PATTERNS.md`.
- Keep each entry short and normalized using the file template.
- Pattern capture must never block delivery; if shipping is time-critical, append right after completion.
- Review remains authoritative; this memory supports execution quality but does not override governance decisions.

---

## 7) Prompt acceptance rule

A prompt is acceptable only if:
1. it is bounded,
2. layer impacts are explicit,
3. governance constraints are explicit,
4. validation commands are explicit,
5. it does not request forbidden shortcuts.

If one condition fails, rewrite the prompt before execution.
