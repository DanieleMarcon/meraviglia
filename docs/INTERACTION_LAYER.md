# Meraviglia OS — Interaction Layer

## Purpose
Define the canonical Interaction Layer so Scheduling Foundation can be implemented as a narrow first slice without shifting Meraviglia OS toward calendar-first, CRM-first, or unconstrained AI artifact semantics.

## Architectural Position
- **Workspace = Strategic Context Kernel** remains the center.
- Interaction is a **workspace-scoped operational contact artifact**.
- Interaction depends on workspace context and relationship continuity (contacts/participants).
- Interaction is future-compatible with memory artifacts, AI review/ingestion, and external calendar integrations through governed contracts.

Operational framing sequence (authoritative):
`entry → qualification → workspace context → relationships → interactions/history`

Interaction starts only after workspace exists; it is never an entry-stage concept.

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
- Contacts are relationship records in workspace scope and can be created with partial data, then enriched later.
- Interaction must always include at least one participant.
- Outcome and memory linkage are optional and can remain deferred in early slices.
- External calendars, AI generation, recurrence logic, and workflow automation are integration concerns, not foundational interaction ownership.

## Contact Lifecycle Policy (Authoritative)
- A contact can be deleted only when it is not referenced by any interaction.
- A contact referenced by one or more interactions cannot be deleted.
- Interaction participants can be modified only while interaction status is `planned`.
- Interactions in `completed` or `canceled` status are historical records; participants are immutable.
- If an interaction is reopened to `planned`, participant membership becomes editable again under the same rules.
- If a contact was previously blocked from deletion due to interaction references, it becomes deletable again only after all such references are removed.

## Interaction Semantics (Historical Record)
Interactions are workspace history artifacts, not just scheduling containers.

- `planned`: mutable operational state (including participant updates under lifecycle rules).
- `completed` / `canceled`: immutable historical state for participant composition.

This immutability boundary is intentional and preserves workspace historical integrity.

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

## Future evolution — history fidelity
Potential history-fidelity extensions are intentionally scoped to record quality:

- audit trail support to track interaction-level changes over time,
- participant replacement history (who was replaced and when),
- participant revisions via versioned participant snapshots.

These are architectural continuity directions for stronger historical traceability, not a delivery roadmap.
