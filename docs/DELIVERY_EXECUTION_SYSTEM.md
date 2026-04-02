# Meraviglia OS — Delivery Execution System

## 1. Purpose

This document defines the **operational execution system** for Meraviglia OS development.

It connects:

* Roadmap phases
* Development streams
* Milestones
* Chat-based execution

This is the **single coordination layer** across all work.

---

## 2. Core Principles

### 2.1 Milestone-Driven Development

Work is always aligned to ONE milestone:

* M1 → single-user core
* M2 → multi-user foundation
* M3 → sellable product

No parallel milestone execution allowed.

---

### 2.2 Stream Separation

Three parallel streams:

* DB → schema, RLS, RBAC
* APP → frontend, logic, enforcement
* PRODUCT → UX, flows, value

Each session must target ONE stream.

---

### 2.3 One Focus per Session

Each chat must solve ONE problem.

No multi-feature implementation.

---

### 2.4 Documentation-First Rule

Before implementation:

* architecture must be defined
* constraints must be explicit

---

## 3. Current System State

### Current milestone

👉 M1 → transitioning to M2

### Active priority

👉 PRODUCT-stream M2-B product contract ratified; execute DB/APP invite + activation + membership baseline within fixed scope

---

## 4. Execution Flow

Every feature follows:

1. Context alignment
2. Prompt generation
3. Implementation
4. Governance validation
5. Documentation update
6. Transition prompt generation

---

## 5. Chat-Based Execution Model

### 5.1 Each Chat = One Unit of Work

A chat must:

* have a clear goal
* produce a deterministic output
* end with a transition prompt

---

### 5.2 Mandatory Chat Header

Every chat MUST start with:

```
Current milestone:
Current stream:
Current focus:
Last completed step:
Blocked by:
```

---

### 5.3 Transition Protocol

At the end of each chat:

The assistant MUST generate:

* next-step prompt
* updated context
* constraints reminder

---

## 6. Governance Integration

All execution must comply with:

* Architecture Freeze
* Engineering Protocol
* Feature Delivery Protocol

No exceptions allowed.

---

## 7. RBAC Activation Strategy (CURRENT)

### Decision

RBAC implementation follows:

👉 **Minimal deterministic enforcement**

### Meaning

* use existing schema
* enforce via RLS + helper-function checks at DB level, then align application checks
* no abstraction layer
* no dynamic permission engine

---

## 8. Anti-Patterns (Forbidden)

* overengineering early-stage features
* introducing new architecture layers
* mixing streams in one session
* skipping documentation
* bypassing governance checks

---

## 9. Success Criteria

The system is working when:

* each chat is deterministic
* transitions are smooth
* no context loss
* milestones progress linearly

---

## 10. Next Step

👉 Execute M2-B Organization Access Foundation using coordinated stream priorities (PRODUCT contract → DB support → APP workflows)

APP-side RBAC alignment is now baseline-complete; the next gateway is collaboration workflow completion on top of active RBAC

---


## 11. M2-B Contract Guardrails (Active)

Execution for M2-B must remain inside:

- invite flow
- invite activation flow
- membership baseline management (list/remove + role assignment within `admin`/`member`)
- collaboration entry with existing org-scoped app shell

Explicitly forbidden in this milestone:

- RBAC redesign
- org switching
- multi-org membership productization
- enterprise IAM scope (SSO/SCIM)

### APP Execution Note (2026-04-02)

M2-B APP foundation is now wired with minimal production slice:
- admin invite flow (email + baseline role)
- collaborator invite activation flow after authentication
- admin membership baseline list (email, role, state, remove action)
- deterministic invited/removed user shell behavior

No architecture expansion was introduced; DB remains source of truth and existing RBAC baseline is reused as-is.
