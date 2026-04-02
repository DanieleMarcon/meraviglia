# Meraviglia OS — M3 Product Contract
## Interaction Layer (Scheduling Foundation)

Date: 2026-04-02  
Stream: PRODUCT  
Milestone: M3  
Status: Ratified (spec-ready)

---

## 1) Contract Intent

Define the first **operational workflow** for the Interaction Layer as a minimal, usable scheduling foundation at workspace level.

This contract intentionally excludes:
- calendar semantics (no recurrence, no availability engine, no time-zone planning UX),
- CRM pipeline semantics (no stages, deals, opportunities),
- AI behavior (no suggestions, generation, or auto-classification),
- automation (no auto-status updates, reminders, triggers).

The resulting interaction capability must remain:
- workspace-scoped,
- contact-linked,
- manually operated,
- simple enough for immediate daily use.

---

## 2) Product Surface and UI Structure (Workspace-Level)

### 2.1 Placement
Inside the Workspace view, expose an **Interactions** section as a first-class operational panel.

### 2.2 Layout (minimal)
The panel has three blocks:

1. **Header row**
   - Title: `Interactions`
   - Primary action: `New interaction`
   - Optional secondary control: status filter (default `Planned` + `Completed` visible, `Canceled` togglable)

2. **Creation zone**
   - Inline form (default collapsed), opened by `New interaction`
   - Single-step entry (no wizard)

3. **Interaction list**
   - Chronological list grouped by status sections:
     - `Planned`
     - `Completed`
     - `Canceled`
   - Default sorting rules in section 4.

### 2.3 Workspace behavior
- Interactions shown are only for the current workspace.
- Contact options shown in interaction creation are only contacts available in that workspace context.
- If workspace has no contacts, creation remains visible but guided (see edge cases).

---

## 3) Interaction Creation Flow

### 3.1 Entry points
Primary entry points:
- `New interaction` button in Interactions header.
- Empty-state CTA: `Create first interaction`.

### 3.2 Flow steps (single-screen)
1. User opens create form.
2. User fills minimal required fields:
   - Interaction type
   - Date & time
   - At least one contact (participant)
3. User optionally adds notes.
4. User clicks `Save interaction`.
5. System validates required fields and either:
   - saves interaction with status `Planned`, or
   - shows inline field errors.
6. On success:
   - form closes (or resets for rapid entry if product chooses),
   - new interaction appears immediately in `Planned` section.

### 3.3 Create UX rules
- No background enrichment.
- No inferred values from AI.
- No automatic status other than default `Planned` on creation.
- `Cancel` on form closes form and discards unsaved input.

---

## 4) Interaction List Behavior

### 4.1 Section model
List is sectioned by status:
- `Planned`
- `Completed`
- `Canceled`

### 4.2 Sorting model
- `Planned`: nearest upcoming first (ascending by scheduled date/time).
- `Completed`: most recently completed first (descending by status-change time; if unavailable, fallback scheduled date/time descending).
- `Canceled`: most recently canceled first (descending by status-change time; if unavailable, fallback scheduled date/time descending).

### 4.3 List item composition (compact card/row)
Each interaction row shows:
- Type label
- Scheduled date/time label
- Participant summary (`Primary contact +N` when multiple)
- Status badge
- Optional notes preview (first line, truncated)
- Row actions:
  - `Mark completed` (only for Planned)
  - `Cancel interaction` (only for Planned)
  - `Reopen` (for Completed/Canceled → Planned)
  - `Edit` (minimal edit: same fields as create)

### 4.4 Filtering (minimal)
- Status section collapse/expand is sufficient for v1.
- If explicit filter control is present, keep only status filtering.
- No advanced filtering/search in this slice.

### 4.5 Real-time expectations
- After any create/edit/status change, list updates immediately in current view state.
- Preserve user context (do not jump away from workspace).

---

## 5) Status Lifecycle UX

### 5.1 Canonical statuses (user-facing labels)
- `Planned`
- `Completed`
- `Canceled`

### 5.2 Allowed transitions
- On create: `Planned` only.
- From `Planned`:
  - `Planned → Completed`
  - `Planned → Canceled`
- Reopen path (manual):
  - `Completed → Planned`
  - `Canceled → Planned`

No direct `Completed ↔ Canceled` transition in one click; user reopens first, then applies target state if needed.

### 5.3 Interaction-level action language
- Planned item actions:
  - `Mark completed`
  - `Cancel interaction`
- Closed item action:
  - `Reopen`

### 5.4 Confirmation policy
- `Mark completed`: no confirmation (fast action).
- `Cancel interaction`: lightweight confirmation recommended (`Cancel this interaction?`).
- `Reopen`: no confirmation.

### 5.5 Visual feedback
- Status badge color and text must change immediately after action.
- Item relocates to target status section immediately.
- Optional transient toast:
  - `Interaction marked as completed`
  - `Interaction canceled`
  - `Interaction reopened`

---

## 6) Minimal Fields and Product Language

### 6.1 Field set (v1)

Required:
1. **Type**
   - Label: `Type`
   - Control: select
   - Options:
     - `Meeting`
     - `Call`
     - `Follow-up`

2. **Date & time**
   - Label: `Date & time`
   - Control: date-time input

3. **Participants**
   - Label: `Participants`
   - Control: multi-select contacts
   - Validation: at least 1 selected

Optional:
4. **Notes**
   - Label: `Notes`
   - Control: multiline text
   - Helper text: `Optional context for this interaction`

### 6.2 Buttons and UI copy
Create/edit form:
- Primary: `Save interaction`
- Secondary: `Cancel`

Validation messages:
- `Select an interaction type`
- `Select date and time`
- `Add at least one participant`

Empty list copy:
- Title: `No interactions yet`
- Body: `Track planned calls, meetings, and follow-ups for this workspace.`
- CTA: `Create first interaction`

### 6.3 Naming rules
- Use **interaction** as canonical artifact term (not appointment/event/activity).
- Use **participants** (not attendees/leads).
- Use **canceled** consistently (avoid mixed `cancelled`).

---

## 7) Edge Cases and Deterministic UX

### 7.1 Workspace has no contacts
Behavior:
- `New interaction` remains visible.
- On open/create attempt, show blocking guidance:
  - `You need at least one contact before creating an interaction.`
- CTA in message: `Add contact` (navigates to workspace contacts section).
- Do not allow saving interaction without participant.

### 7.2 Empty interaction state
Behavior:
- Show empty-state panel and CTA.
- Keep panel instructional; no hidden controls.

### 7.3 Required field missing
Behavior:
- Inline errors under each invalid field.
- Keep user input intact after validation failure.

### 7.4 Date/time in the past
Policy (minimal and usable):
- Allowed.
- Rationale: teams may log planned interactions retroactively.
- No warning required in v1.

### 7.5 Participant removed after interaction exists
Behavior:
- Existing interactions remain visible with preserved historical participant label if possible.
- If participant reference cannot render, show fallback label: `Removed contact`.
- Editing such interaction requires selecting currently valid participants before save.

### 7.6 Concurrent status update (stale item)
Behavior:
- If action fails due to stale state, show non-destructive message:
  - `This interaction was updated elsewhere. Reloaded latest status.`
- Refresh row and maintain workspace context.

### 7.7 Permission denial in action attempt
Behavior:
- Disable or hide write actions for non-authorized users where possible.
- If attempted via stale UI, show deterministic denial message and no silent failure.

---

## 8) Ready-to-Implement UX Contract

### 8.1 Must-have acceptance criteria
1. User can create an interaction in a workspace with `Type + Date & time + Participants` and see it in `Planned` immediately.
2. User can change status from `Planned` to `Completed` or `Canceled` from list actions.
3. User can reopen `Completed` or `Canceled` interaction back to `Planned`.
4. User can edit minimal fields of an existing interaction.
5. Empty state and no-contacts blocking state are both deterministic and actionable.
6. Terminology in UI remains consistent with section 6 (interaction/participants/canceled).

### 8.2 Explicit non-goals (M3 Scheduling Foundation)
- Calendar sync/import/export.
- Recurrence and availability planning.
- CRM stages, deal probabilities, pipeline reporting.
- AI-suggested interactions or generated notes.
- Automation rules/reminders.
- Advanced filters, analytics, or cross-workspace interaction views.

### 8.3 Out-of-scope change guard
If a proposal introduces any of the non-goals above, treat it as a post-M3 extension and reject from this contract unless milestone is explicitly reopened.

---

## 9) Implementation Handoff Notes (Product → APP/DB)

This contract is intentionally UX/product-language focused.

Handoff guidance:
- APP stream should implement exactly the flows and labels above without introducing additional conceptual entities.
- DB stream should only support required persistence for these fields and status transitions, without adding automation/calendar/CRM semantics.
- Any deviation requires PRODUCT re-ratification.
