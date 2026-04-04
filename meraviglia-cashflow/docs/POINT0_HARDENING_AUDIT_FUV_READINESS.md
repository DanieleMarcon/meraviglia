# Point 0 Hardening Audit — FUV Readiness (Focused)

Date: 2026-04-04  
Scope: Focused Point 0 operational readiness audit (error boundary, state boundary, prompt governance entry points, UX-state coverage)

## 1) Point 0 readiness verdict

**CLOSED / FUV READY WITH CONSTRAINTS**

Rationale: the operational baseline is stable and check-gated (`npm run check` green), and the previously identified governance-critical seam is now resolved through deterministic sanitized error mapping across repository/application/UI pathways.

---

## 2) Findings by audit area

### Area 1 — Error boundary audit

#### What is strong
- Infra-origin errors are funneled through a common mapper (`toRepositoryError`) before repository methods throw, giving a single chokepoint for auth/authorization-class translation.
- Deterministic handling exists for key auth/authorization cases (`PGRST301`, `42501`, row-level-security/permission patterns), mapped to stable user-facing messages.
- Governance script blocks direct JSX rendering of `error.message`/`error.stack` object properties, reducing one class of raw-leak regressions.

#### What is weak
- No remaining Point 0 blocker is open in this area after sanitized deterministic mapping closure.
- Error propagation to UI now follows mapped user-safe messages for repository/application failure paths.

#### Point 0 implication
- Resolved for Point 0 closure; continue enforcing mapped user-safe messages during FUV changes.

---

### Area 2 — State/application boundary audit

#### What is strong
- Enforced dependency matrix still blocks state from infra/repository/domain and only allows `state -> ui | application`.
- Runtime state remains largely UI infrastructure for local persistence/store wiring.

#### What is weak
- `state` currently contains business-adjacent orchestration behaviors (intent application, proposal mutation orchestration, normalization routing), not just passive UI state transport.
- Governance matrix leaves a practical shortcut path by permitting `state -> application` while also allowing state to own complex mutation orchestration, increasing long-term ownership blur risk under FUV pressure.

#### Point 0 implication
- Not an immediate blocker, but this is a real review-enforced drift surface that can grow quickly during UX hardening if not constrained.

---

### Area 3 — Prompt surface / governance entry-point audit

#### What is strong
- Prompt protocol and task template now explicitly encode Point 0 governance constraints and validation expectations.
- Feature-delivery protocol points back to prompt protocol, giving a documented primary entry path.

#### What is weak
- A still-active legacy prompt artifact (`meraviglia-cashflow/CODEX_SYSTEM_PROMPT.md`) uses outdated layer model/paths that no longer match current architecture contracts.
- Coexisting modern + legacy prompt artifacts create practical prompt-entry ambiguity, which can reintroduce old shortcuts in AI-assisted task setup.

#### Point 0 implication
- This is governance drift risk, but not currently a runtime blocker if review enforces current protocol documents.

---

### Area 4 — UX-state coverage audit (loading / empty / blocked / error)

#### What is strong
- Core operational views and panels consistently render explicit loading states.
- Empty states are present in primary list flows (workspaces, contacts, interactions).
- Blocked-state messaging exists in key constrained flows (e.g., no contacts for interaction creation, participant immutability messaging).
- Error states are rendered textually in primary flows rather than hidden-only side effects.

#### What is weak
- Error message determinism is now governed by sanitized mapped errors for UI-facing flows.
- Some “blocked” outcomes are represented mostly by disabled controls with minimal recovery guidance depth (adequate for Point 0, but still review-enforced quality).

#### Point 0 implication
- UX-state coverage is sufficiently present for hardening under the defined operational constraints.

---

## 3) Point 0 baseline confirmation

- **stable**
  - Layer dependency governance gate exists and is actively passing.
  - Core operational UI has explicit loading/empty/error state rendering.

- **enforced**
  - `npm run check:governance` dependency/surface/security/accessibility heuristics.
  - Supabase client import/use restrictions outside `infra`.

- **review-enforced only**
  - Full error catalog completeness and sanitization consistency across all repository/application paths.
  - State-layer ownership discipline (preventing orchestration creep).
  - Blocked-state recovery depth and focus/interaction coherence nuances.
  - Prompt entry-point consistency when legacy artifacts remain present.

- **intentionally deferred**
  - Stricter state-boundary tightening (e.g., reducing practical shortcut opportunity) can be deferred if FUV is executed with explicit guardrails.

- **resolved**
  - Error-boundary blocker closed via sanitized deterministic mapping; raw backend/internal message passthrough is no longer a Point 0 blocker.

---

## 4) Operational guardrails for FUV

1. No new business logic in `state`.
2. No UI → infra shortcuts.
3. Only sanitized mapped errors in UI.
4. Prompting Protocol V2 is the only valid entry point.

Deferred-but-active review risks:
- State-layer orchestration drift remains review-controlled (not a blocker).
- Prompt surface legacy artifacts remain review-controlled (not a blocker).

---

## 5) Final recommendation

**Point 0 is closed. FUV / UX Hardening is ready to start with constraints.**

## Point 0 — Final Status

- Status: CLOSED
- Blockers: none
- Known risks:
  - state-layer orchestration drift (review-controlled)
  - prompt surface legacy artifacts (review-controlled)

**FUV can start immediately under the following constraints:**
- no new business logic in `state`
- no UI → infra shortcuts
- only sanitized mapped errors in UI
- Prompting Protocol V2 is the only valid entry point
