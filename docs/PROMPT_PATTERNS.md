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
