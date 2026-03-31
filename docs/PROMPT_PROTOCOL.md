# Meraviglia OS Prompt Protocol

## 1. Purpose

Meraviglia OS is built with AI-assisted development workflows, so prompts must follow a standardized structure to keep delivery consistent, auditable, and repeatable.

This protocol defines how implementation prompts are written and consumed. Prompts must reference authoritative project documentation instead of embedding all rules inline.

The protocol is tool-independent and must be usable with:

- Codex
- ChatGPT
- Claude
- Emergent
- future AI tooling

---

## 2. Prompt Architecture

Every implementation prompt must follow this canonical structure.

### Context

Provide the current product and engineering context relevant to the task.

### Authoritative Constraints

List the governing documentation and non-negotiable constraints that apply.

### Task Description

Describe the exact change requested and expected outcome.

### Architectural Constraints

State architecture-layer and boundary constraints that must be preserved.

### Scope

Define what is included in this implementation slice.

### Out of Scope

Define what must not be implemented in this slice.

### Implementation Guidance

Provide practical guidance (sequence, priorities, conventions) without redefining authoritative rules.

### Documentation Requirements

Specify documentation checks/updates required for this change.

### Validation Requirements

List mandatory checks and tests to run before completion.

### Deliverables Expected

Define the exact response artifacts expected from the AI implementation output.

### Quality Bar

State quality expectations (clarity, determinism, architectural compliance, completeness).

---

## 2.1 Prompt Modes

Meraviglia Prompt Protocol supports two compliant prompt modes:

- **FULL PROMPT**
- **COMPACT PROMPT**

Both modes are governance-compliant. The difference is verbosity and reuse strategy, not rigor.

### FULL PROMPT

Use FULL prompts when:

- introducing a new canonical layer,
- architecture is changing or being clarified,
- task complexity is high,
- onboarding a new contributor or tool,
- ambiguity risk is high.

FULL prompts should include the complete canonical protocol structure and explicit restatement of critical constraints.

### COMPACT PROMPT

Use COMPACT prompts when:

- the task is narrow and well-bounded,
- authoritative documentation is already mature for the area,
- the AI/tool is already operating within established governance,
- constraints can be safely referenced from docs instead of fully restated.

COMPACT prompts should still be explicit and testable, but can use a shorter canonical structure:

1. **TASK**
2. **CONTEXT**
3. **CONSTRAINTS**
4. **SCOPE**
5. **OUT OF SCOPE**
6. **REQUIRED OUTPUT**
7. **VALIDATION**
8. **DELIVERABLE FORMAT**

COMPACT prompts must still reference authoritative documents and must never bypass frozen architecture or engineering protocol constraints.

---

## 3. Authoritative Documentation References

Prompts must reference the canonical documentation set below rather than duplicating governance rules.

- `docs/ARCHITECTURE_FREEZE_v1.md`
- `docs/ENGINEERING_PROTOCOL.md`
- `docs/FEATURE_DELIVERY_PROTOCOL.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/DOMAIN_ARCHITECTURE.md`
- `docs/MERAVIGLIA_OS_MASTER_PLAN.md`
- `docs/MERAVIGLIA_POSITIONING.md`
- `docs/AI_STRATEGY.md`
- `docs/AI_TOOLING_ADOPTION_PLAN.md`

This creates a documentation-driven prompt model: prompts compose and reference authoritative sources, similar to how web pages reference CSS instead of repeating style definitions inline.

---

## 4. Prompt Writing Rules

All prompts must follow these writing rules:

- constraints must be explicit and testable
- scope and out-of-scope items must be clearly separated
- prompts must not introduce architectural ambiguity
- frozen architecture must not be modified unless explicitly authorized
- prompts should minimize speculative future implementation and focus on the requested slice

---

## 5. Prompt Output Contract

Every feature implementation response must include:

- **Implementation Summary**
- **Files Modified**
- **Architectural Notes**
- **Documentation Impact Check result**
- **Comment Impact Check result**
- **Validation Results**
- **Known Limitations / Out of Scope**

This output contract guarantees traceability, governance visibility, and consistent review quality across implementations.

---

## 6. Chat Continuity Protocol

To continue delivery across conversations and tools, each new conversation should include:

- project context
- current architecture state
- last executed task
- next objective
- reference to authoritative documentation

This continuity packet prevents context loss when switching chats, contributors, or AI tools.

---

## 7. Tool Independence

This Prompt Protocol is intentionally tool-agnostic.

It governs prompt structure and output expectations, not a specific AI implementation.

The same protocol must remain valid for:

- Codex
- ChatGPT
- Claude
- Emergent
- future AI tools

## 🔁 Cross-Chat Continuity Protocol (NEW)

### Purpose

Ensure continuity, alignment, and controlled progress across multiple parallel development streams (DB, App, Product).

---

## 1. Mandatory Context Header

Every new chat MUST start with:

```
Current milestone: [M1 / M2 / M3]
Current stream: [DB / APP / PRODUCT]
Current focus: [specific task]
Last completed step: [short summary]
Blocked by: [if any]
```

---

## 2. Chat Transition Rule

When switching to a new chat:

The assistant MUST generate a **Transition Prompt** containing:

* Current milestone
* Current system state
* Completed work
* Next step
* Constraints / decisions already taken

---

## 3. No Context Assumption Rule

Each chat must be:

* Self-contained
* Explicit about assumptions
* Based ONLY on provided context

---

## 4. Decision Persistence Rule

Every architectural or security decision MUST be:

* Explicitly stated
* Stored in documentation
* Referenced in future steps

---

## 5. Scope Control Rule

Each interaction must:

* Focus on ONE problem
* Avoid expanding scope unless requested
* Respect current milestone boundaries

---

## 6. Output Discipline

When requested, the assistant must:

* Provide ready-to-use prompts
* Provide production-grade documentation
* Avoid partial or exploratory outputs

---

## 7. Milestone Awareness Rule

All decisions must be evaluated against:

* Current milestone
* Project maturity
* Avoid overengineering early-stage features
