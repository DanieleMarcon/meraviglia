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
