# PROMPT_PATTERNS (Append-only Working Memory)

Date: 2026-04-04  
Scope: FUV onward

## Purpose

This file captures high-signal prompt patterns that proved useful during real execution.

It is a working pattern memory, not a second prompt protocol.

Prompting Protocol V2 (`docs/PROMPT_PROTOCOL.md`) remains the sole authoritative prompt entry point.

## Usage rule (lightweight)

Append an entry only after a successful relevant execution prompt that generated reusable value.

Relevant classes:
- feature development
- refactor / hardening
- audit / review
- documentation alignment

Do not log:
- brainstorming
- exploratory chats
- discarded prompts
- trivial one-off clarifications

Keep entries short, practical, and execution-oriented.

## Entry template

```md
## [YYYY-MM-DD] [short pattern title]
- Phase: [e.g., FUV]
- Prompt type: [feature development | refactor/hardening | audit/review | documentation alignment]
- Goal: [one concrete outcome]
- Why it worked: [1–2 short bullets]
- Guardrails that mattered: [1–3 constraints that prevented drift]
- What was corrected during execution: [if none, write "none"]
- Reusable snippet:
  ```
  [short reusable prompt block]
  ```
- Reuse conditions: [when to reuse]
- Avoid next time: [common mistake or overreach to avoid]
```

## Philosophy note

Keep this file small and useful.

It exists to extract reusable patterns from real work with minimal friction.

If an entry feels abstract or bureaucratic, do not add it.

## [2026-04-04] FUV first end-to-end continuity slice
- Phase: FUV
- Prompt type: feature development
- Goal: make Intake → Workspace → Contacts → Interactions feel like one coherent usable flow without adding features
- Why it worked:
  - focused on continuity and perceived outcome instead of isolated UI polish
  - constrained scope to existing flows and UX-state clarity
- Guardrails that mattered:
  - no UI → infra shortcuts
  - no business logic in state
  - only sanitized mapped errors in UI
- What was corrected during execution: strengthened blocked-state clarity, explicit success feedback, and visible continuity after create/convert actions
- Reusable snippet:
  ```
  Implement the first complete end-to-end user experience flow across existing entities without feature expansion. Focus on continuity, explicit system state, blocked/error guidance, and immediate perceived outcome after each action.
  ```
- Reuse conditions: use when existing features work technically but do not yet feel like one coherent product flow
- Avoid next time: do not widen scope into new product capabilities or generic visual redesign

## [2026-04-04] FUV UX orientation + value reinforcement pass
- Phase: FUV
- Prompt type: refactor/hardening
- Goal: strengthen "where am I / what changed / what next" clarity across an existing Intake → Workspace → Contacts → Interactions flow without adding features
- Why it worked:
  - constrained work to lightweight contextual copy, progress cues, and transition feedback inside existing components
  - required explicit post-action outcome messaging tied to user value, not generic success states
- Guardrails that mattered:
  - no new entities, features, or architecture changes
  - maintain terminology consistency (workspace=context, contact=relationship, interaction=event/history)
  - preserve deterministic loading/blocked/error states
- What was corrected during execution: generic success text and dead cognition zones between section boundaries
- Reusable snippet:
  ```
  Harden this existing multi-step UX flow without feature expansion. For each step, add 1–2 lines that explain purpose/value, add lightweight progress cues, and rewrite post-action feedback to explicitly answer: what changed, where to go next, and why it matters.
  ```
- Reuse conditions: use when a flow is technically complete but user confidence and perceived progress remain weak
- Avoid next time: do not introduce new navigation systems (e.g., steppers) when textual and structural cues are sufficient

## [2026-04-04] FUV trust layer reinforcement (UI-only)
- Phase: FUV
- Prompt type: refactor/hardening
- Goal: increase reliability/trust perception across Workspace, Contacts, and Interactions using existing state only
- Why it worked:
  - split scope into five concrete UX trust signals (status, confidence, continuity, temporal clarity, blocked recovery)
  - explicitly prohibited new features and backend changes, preventing drift
- Guardrails that mattered:
  - surface existing data only (counts, recency, usage) with no new domain rules
  - keep deterministic loading/blocked/error states
  - require recovery hints for blocked actions
- What was corrected during execution: continuity between contacts and interactions was made explicit at both panel and item level
- Reusable snippet:
  ```
  Implement a UI-only trust-layer pass for an existing multi-step flow. Add lightweight status signals, explicit action allow/block reasons, and cross-panel continuity cues using existing state only. Improve temporal readability and blocked-state recovery guidance without adding features or new architecture.
  ```
- Reuse conditions: use when flows are functionally complete but users still perceive low predictability or weak system state awareness
- Avoid next time: avoid introducing analytics/timeline/filter capabilities when only trust clarity is requested

## [2026-04-04] FUV decision-readiness framing (qualitative only)
- Phase: FUV
- Prompt type: refactor/hardening
- Goal: make current workspace state feel operationally meaningful by clarifying readiness for follow-up continuity without adding scoring or analytics
- Why it worked:
  - required short "why this matters now" copy tied directly to existing relationships/events state
  - forced qualitative readiness cues (thin vs forming vs usable history) instead of metrics
- Guardrails that mattered:
  - no new architecture layers, backend/schema changes, or recommendations logic
  - no faux-intelligence language ("analyzing", "recommending")
  - guidance tone without workflow enforcement
- What was corrected during execution: history sections were reframed from passive logs into continuity records that support next follow-up decisions
- Reusable snippet:
  ```
  Add a lightweight decision-readiness layer across an existing multi-step flow using only existing state. At each panel/workspace level, provide qualitative readiness cues, a short "why this matters now" summary, and gentle next-action guidance (first relationship, first event, continue history) without scores, analytics, or recommendation logic.
  ```
- Reuse conditions: use when users can see activity/history but still cannot infer whether the system is becoming operationally useful
- Avoid next time: do not introduce percentages, dashboards, or new derived business rules for readiness

## [2026-04-04] FUV friction-removal micro-simplification pass
- Phase: FUV
- Prompt type: refactor/hardening
- Goal: remove micro-friction from Entry → Workspace → Contacts → Interactions without adding features or changing architecture
- Why it worked:
  - pushed every change through a strict "remove a decision or a step" filter
  - treated copy as part of flow logic (short, direct, next-action language)
- Guardrails that mattered:
  - no new fields/features, only simplification of existing forms and feedback
  - preserve deterministic errors and explicit loading/blocked states
  - keep UI changes inside existing `ui -> application` boundaries
- What was corrected during execution: removed low-value fields, shortened verbose system text, and added in-context "add contact now" recovery from interaction blocking
- Reusable snippet:
  ```
  Execute a friction-removal slice on the existing end-to-end flow. Remove unclear or low-value fields, reduce required input to the minimum viable start, place key actions near blocking points, and rewrite feedback to short "done + next step" messages. No new features, no architecture/database changes.
  ```
- Reuse conditions: use when flow completion is possible but users still hesitate due to extra fields, verbose copy, or blocked-action dead ends
- Avoid next time: do not replace one friction point with hidden complexity or long instructional text

## [2026-04-04] FUV micro-fix: visible blocked recovery + contract-safe optional fields
- Phase: FUV
- Prompt type: refactor/hardening
- Goal: apply a narrow UX correction without reopening scope or changing domain/service contracts
- Why it worked:
  - isolated the fix to two verifiable behaviors (field handling + blocked recovery visibility)
  - required explicit visual affordance and recoverability at the exact blocked location
- Guardrails that mattered:
  - keep existing required backend/application constraints unchanged
  - avoid fake parsing tricks that hide data expectations from users
  - keep recovery action keyboard-visible and colocated with blocked reason
- What was corrected during execution: restored separate contact fields and made blocked interaction recovery prominent with scroll+focus+highlight to contact creation
- Reusable snippet:
  ```
  Apply a final micro-fix to an existing flow: restore natural field structure while preserving current service constraints, and make blocked states explicitly actionable with an adjacent recovery CTA that visibly moves the user to the next valid step.
  ```
- Reuse conditions: use when a near-merge UX pass has 1–2 concrete regressions and needs strict scope control
- Avoid next time: do not hide blocked recovery in passive text or rely on subtle links

## [2026-04-05] FUV entry-reference + blocked-CTA verifiability micro-fix
- Phase: FUV
- Prompt type: refactor/hardening
- Goal: preserve activity-first intake while allowing optional entry-stage reference person data and ensuring blocked recovery is visible in the real panel state
- Why it worked:
  - mapped optional semantics into existing contracts without schema/domain changes
  - made blocked recovery visible in the parent panel state (not only inside a form users may never open)
- Guardrails that mattered:
  - no architecture or repository/infra changes
  - documentation/copy reflects the exact implemented model boundary (entry reference vs workspace relationship contact)
  - keep explicit blocked reason + adjacent actionable CTA
- What was corrected during execution: restored optional reference-person capture in entry and surfaced the recovery CTA directly in the no-contacts interactions panel state
- Reusable snippet:
  ```
  Apply a closure micro-fix: keep the primary model unchanged, add only optional early-stage reference capture mapped safely to existing contracts, and make blocked recovery actions visible in the exact state where users get blocked.
  ```
- Reuse conditions: use when final UX polish reveals a model-expression gap plus a verifiability gap in blocked-state recovery
- Avoid next time: avoid placing the only recovery CTA inside a nested view that is inaccessible when the primary action is disabled

## [2026-04-05] FUV simplification rollback: remove low-value recovery CTA
- Phase: FUV
- Prompt type: refactor/hardening
- Goal: simplify blocked states by removing noisy shortcut mechanics while keeping clear guidance
- Why it worked:
  - removed interaction mechanics (CTA + jump/highlight/focus) that did not prove useful in real usage
  - preserved explicit blocked reason and next-step text in place
- Guardrails that mattered:
  - keep all existing architecture/contracts untouched
  - remove only CTA-related behavior, preserve prior validated improvements
  - maintain explicit blocked/empty/loading/error states
- What was corrected during execution: deleted add-contact CTA chain and retained a concise blocked explanation in interactions area
- Reusable snippet:
  ```
  Apply a simplification rollback: remove low-value recovery shortcuts and their supporting mechanics, keep one clear blocked-state message with actionable next-step guidance, and avoid replacing it with alternative shortcuts.
  ```
- Reuse conditions: use when a recently added UX recovery mechanic increases complexity more than it improves completion
- Avoid next time: do not keep “clever” assistive behavior when plain guidance is easier to understand
