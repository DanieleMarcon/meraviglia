# Meraviglia OS Prompt Protocol

## 1. Purpose

Meraviglia OS is built with AI-assisted development workflows, so prompts must follow a standardized structure to keep delivery consistent, auditable, and repeatable.

This protocol defines how implementation prompts are written and consumed. Prompts must reference authoritative project documentation instead of embedding all rules inline.

---

## 2. Prompt Architecture

Every implementation prompt must follow this canonical structure.

### Context

### Authoritative Constraints

### Task Description

### Architectural Constraints

### Scope

### Out of Scope

### Implementation Guidance

### Documentation Requirements

### Validation Requirements

### Deliverables Expected

### Quality Bar

---

## 2.1 Prompt Modes

### FULL PROMPT

Use when:

* introducing new architecture
* high ambiguity
* onboarding new tool

### COMPACT PROMPT

Use when:

* task is narrow
* documentation is stable
* constraints can be referenced

Structure:

1. TASK
2. CONTEXT
3. CONSTRAINTS
4. SCOPE
5. OUT OF SCOPE
6. REQUIRED OUTPUT
7. VALIDATION
8. DELIVERABLE FORMAT

---

## 3. Authoritative Documentation References

Prompts must reference:

* ARCHITECTURE_FREEZE_v1.md
* ENGINEERING_PROTOCOL.md
* FEATURE_DELIVERY_PROTOCOL.md
* PROJECT_STRUCTURE.md
* DOMAIN_ARCHITECTURE.md
* MERAVIGLIA_OS_MASTER_PLAN.md
* MERAVIGLIA_POSITIONING.md
* AI_STRATEGY.md
* AI_TOOLING_ADOPTION_PLAN.md

---

## 4. Prompt Writing Rules

* constraints must be explicit
* scope must be clear
* no architectural ambiguity
* no bypass of architecture freeze
* focus only on requested slice

---

## 5. Prompt Output Contract

Every response must include:

* Implementation Summary
* Files Modified
* Architectural Notes
* Documentation Impact Check
* Comment Impact Check
* Validation Results
* Known Limitations

---

# 🔁 6. Cross-Chat Continuity Protocol (UPDATED)

## 6.1 Mandatory Context Header

Every new chat MUST start with:

```
Current milestone: [M1 / M2 / M3]
Current stream: [DB / APP / PRODUCT]
Current focus: [task]
Last completed step: [summary]
Blocked by: [if any]
```

---

## 6.2 Transition Prompt Rule (MANDATORY)

When switching chat, the assistant MUST generate a **Transition Prompt**.

### Structure

* Current milestone
* Current system state
* Completed work
* Active constraints
* Next step
* Risks / warnings

---

## 6.3 Decision Persistence Rule

Every architectural or security decision MUST:

* be explicitly written
* be stored in docs
* be referenced in future steps

---

## 6.4 Scope Control Rule

* one problem per interaction
* no scope expansion
* respect milestone boundaries

---

## 6.5 Output Discipline

The assistant MUST:

* provide ready-to-use prompts
* produce production-grade outputs
* avoid exploratory responses

---

## 6.6 Milestone Awareness Rule

All decisions must be evaluated against:

* current milestone
* system maturity
* no overengineering

---

# 🔒 7. Delivery Discipline Layer (NEW)

This layer binds prompts to execution system (Delivery System + Roadmap).

## 7.1 Mandatory Alignment

Every prompt must align with:

* current milestone
* active stream
* delivery system priorities

---

## 7.2 No Parallel Evolution Rule

* Only ONE milestone active
* No cross-milestone implementation

---

## 7.3 Execution Integrity Rule

Prompts MUST NOT:

* introduce new architecture layers
* redefine responsibilities
* bypass governance checks

---

## 7.4 RBAC Activation Constraint (CURRENT PHASE)

Current phase: **M1 → M2 transition**

Therefore:

* RBAC must be **activated, not redesigned**
* no advanced permission engine
* no premature abstraction

---

## 8. Chat Continuity Requirement

Each new chat must be:

* self-contained
* explicit
* aligned with milestone
* consistent with previous decisions

---

## 9. Tool Independence

This protocol is tool-agnostic and valid for:

* ChatGPT
* Codex
* Claude
* Emergent
* future tools

---
