# Point 0 Hardening Audit — FUV Readiness (Focused)

Date: 2026-04-04  
Scope: Focused Point 0 operational readiness audit (error boundary, state boundary, prompt governance entry points, UX-state coverage)

## 1) Point 0 readiness verdict

**READY WITH NARROW CONDITIONS**

Rationale: the operational baseline is largely stable and check-gated (`npm run check` green), but one governance-critical seam remains too permissive for FUV: repository error fallback still allows raw backend/internal messages to reach user-facing UI render paths.

---

## 2) Findings by audit area

### Area 1 — Error boundary audit

#### What is strong
- Infra-origin errors are funneled through a common mapper (`toRepositoryError`) before repository methods throw, giving a single chokepoint for auth/authorization-class translation.
- Deterministic handling exists for key auth/authorization cases (`PGRST301`, `42501`, row-level-security/permission patterns), mapped to stable user-facing messages.
- Governance script blocks direct JSX rendering of `error.message`/`error.stack` object properties, reducing one class of raw-leak regressions.

#### What is weak
- `toRepositoryError` still falls back to `error?.message` for non-mapped cases. This can propagate raw backend/provider/internal text (including implementation details) to upstream callers.
- UI paths widely render caught `Error.message` directly (`error instanceof Error ? error.message : fallback`), so any raw message escaping the mapper remains user-visible.
- Sanitization is deterministic only for selected classes (authz/authn), not for the full repository/application error surface.

#### Point 0 implication
- This is the primary drift vector still capable of violating the stated deterministic sanitized-error policy during UX hardening.

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
- Error message determinism is not guaranteed end-to-end because UI relies on thrown message text.
- Some “blocked” outcomes are represented mostly by disabled controls with minimal recovery guidance depth (adequate for Point 0, but still review-enforced quality).

#### Point 0 implication
- UX-state coverage is sufficiently present for hardening, provided the error-sanitization seam is tightened first.

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

- **still blocking (for unconstrained FUV)**
  - Repository error fallback can still expose raw backend/internal messages to user-facing render paths.

---

## 4) Required actions before FUV

### Must fix now
1. **Close the remaining raw-message leak seam at repository/application boundary**
   - Remove `error?.message` passthrough fallback behavior for user-facing propagation paths.
   - Enforce deterministic sanitized mapping for all non-explicitly classified backend failures.
   - Keep developer diagnostics out of UI message channel.

### Safe to defer
1. **State-boundary hardening refinement**
   - Keep current matrix for now, but define a narrow review rule that new business/lifecycle logic must not be added to `state` modules.
2. **Prompt surface consolidation cleanup**
   - Retire or clearly mark legacy prompt artifact(s) to reduce accidental old-template reuse.
3. **Blocked-state UX depth improvements**
   - Expand recovery guidance quality as part of FUV polish, after error seam closure.

---

## 5) Final recommendation

**FUV / UX Hardening should start with constraints, not unconstrained rollout.**

Execution condition:
- First merge one narrow fix to guarantee deterministic sanitized error mapping for all repository-origin failures.
- Then proceed with UX hardening while maintaining a review checklist that blocks additional state-orchestration drift and legacy prompt reuse.

This keeps Point 0 governance intact while avoiding overengineering or architecture reshuffle.
