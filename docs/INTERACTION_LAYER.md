# Meraviglia OS — Interaction Layer

## Purpose
Define the canonical Interaction Layer so Scheduling Foundation can be implemented as a narrow first slice without shifting Meraviglia OS toward calendar-first, CRM-first, or unconstrained AI artifact semantics.

## Architectural Position
- **Workspace = Strategic Context Kernel** remains the center.
- Interaction is a **workspace-scoped operational contact artifact**.
- Interaction depends on workspace context and relationship continuity (contacts/participants).
- Interaction is future-compatible with memory artifacts, AI review/ingestion, and external calendar integrations through governed contracts.

Interaction is therefore:
- **not** a CRM activity stream,
- **not** merely a calendar event,
- **not** an AI-generated artifact by default.

## Canonical Interaction Model (v1)
`Interaction` represents a strategic-operational event tied to workspace continuity.

Minimum conceptual shape:

- `id`
- `workspaceId`
- `type`
- `scheduledAt`
- `status`
- `provenance`
- `participants` (linked contacts)
- optional `notes`
- optional `outcomeLinkage` (future memory/decision linkage)

v1 is intentionally minimal: enforce canonical identity, context ownership, and lifecycle semantics first.

## Supporting Concepts

### InteractionType
Controlled vocabulary describing operational intent.

Examples:
- `meeting`
- `call`
- `follow_up`

### InteractionStatus
Lifecycle state for operational execution continuity.

Examples:
- `planned`
- `completed`
- `canceled`

### InteractionProvenance
Traceability of origin.

Current implementation:
- `manual`

Other provenance origins are not part of the current implemented runtime.

## Boundary Rules
- Interaction records are always workspace-owned.
- Participant linkage must resolve to workspace-compatible contact references.
- Outcome and memory linkage are optional and can remain deferred in early slices.
- External calendars, AI generation, recurrence logic, and workflow automation are integration concerns, not foundational interaction ownership.

## Scheduling Foundation Framing
Scheduling Foundation is the **first implementation slice of the Interaction Layer**, not the full layer.

Implemented M3 scope:
- create a workspace-linked interaction,
- associate one or more contacts/participants,
- display planned interactions in workspace context,
- update basic status lifecycle.

Explicitly out of scope for this slice:
- external calendar sync,
- AI-generated interactions,
- interaction analytics,
- advanced recurrence,
- task automation,
- CRM pipeline semantics.

## Evolution Notes
Future slices may add:
- memory attachment/outcome traces,
- decision-loop linkage with strategic hypotheses/actions,
- governed ingestion from integrated calendars,
- AI-assisted review under augmentation-layer controls.

These extensions must preserve strategic ownership in workspace context and must not redefine Meraviglia OS as a calendar or CRM system.
