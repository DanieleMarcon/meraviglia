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
