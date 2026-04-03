# M3 Closeout — Interactions Foundation

## Final Status
**Milestone M3 is COMPLETED** (formal closeout state).

## What M3 Delivers (Implemented)
- Workspace-scoped **interaction model** with create/edit flows.
- Workspace-scoped **participant model** via `interaction_participants`.
- **Status lifecycle model**: `planned`, `completed`, `canceled`.
- Canonical relationship chain: **Workspace → Contacts → Interactions**.
- Datetime-local handling aligned with timezone-safe conversion helpers.
- Supabase persistence and repository-layer integration stabilized.

## Explicitly Not Included Yet
- Multiple-interactions UX enhancements beyond current baseline list/form flows.
- Advanced contact deletion UX beyond policy-enforcement baseline.
- Advanced filtering and timeline-specific interaction UI.

---

## Architecture Alignment (Current Implementation)

### Layered Architecture
Runtime code is organized in these layers:
- `domain`
- `application`
- `infra`
- `ui`
- `shared`

### Dependency Rules
- `infra` must not depend on `ui`.
- `shared` is dependency-neutral utility support.
- `application` orchestrates use-cases and business workflows.
- `infra` implements Supabase-backed repository adapters.

### Applied Patterns
- Repository pattern through `src/repository` contracts and `src/infra` adapters.
- DTO + mapper separation through `src/application/dto` and `src/application/mappers`.
- Shared utility helpers (including interaction datetime conversion) in `src/shared/utils`.

---

## Supabase Data Model (Current)

### Core Tables
- `workspaces`
- `contacts`
- `interactions`
- `interaction_participants`

### Relationships
- `contacts.workspace_id` → `workspaces.id`
- `interactions.workspace_id` → `workspaces.id`
- `interaction_participants.interaction_id` → `interactions.id`
- `interaction_participants.contact_id` → `contacts.id`

Composite FK safety is applied to preserve workspace/org-scoped consistency for participant linkage.

### PostgREST Embed Requirement (Important)
When querying participants with interaction joins, explicit FK embedding is required to avoid ambiguous relationship resolution. The canonical query path uses an explicit FK name in the embed clause.

---

## Runtime Behavior Guarantees
- Shared contacts state is lifted at workspace item level and reused by contacts + interactions panels.
- Interactions UI does not require manual refresh to reflect create/edit/status changes (reload orchestration handled in panel/service flows).
- Interactions list supports historical multi-entry rendering with deterministic ordering by schedule timestamp.
- Readiness gating avoids inconsistent UI rendering when contacts are not yet ready.
- Optimistic concurrency guard (`expected_updated_at`) plus stale-update handling is enforced.
- Deterministic stale-update error messaging is implemented.

---

## Stack (Authoritative)

### Frontend
- React (Vite)
- TypeScript

### Backend
- Supabase (Postgres + PostgREST)

### Patterns
- Repository pattern
- DTO mapping
- Local lifted state (no global state manager)

### Infrastructure
- Docker (local development)
- Vercel (deployment)

---

## Short Future Extensions
- UX refinements for managing larger interaction sets.
- Formal contact deletion governance.
- Advanced interaction filtering views.

---

## M3.x Consolidation Addendum — Contact Lifecycle and Historical Integrity

### Contact Lifecycle Policy (Authoritative)
- A contact can be deleted only if it is not referenced by any interaction.
- A contact referenced by at least one interaction cannot be deleted.
- Participants of an interaction can be modified only if the interaction is in `planned` state.
- Interactions in `completed` or `canceled` state are historical records and participant composition is immutable.
- An interaction must always have at least one participant.
- A contact becomes deletable again only after it is no longer referenced by any interaction.

### Interaction Semantics Clarification
Interactions are treated as workspace historical events, not only scheduling objects.

- `planned` interactions remain mutable for operational updates.
- `completed` and `canceled` interactions are immutable historical state.

This is an intentional integrity boundary to preserve trustworthy workspace history.

### Future evolution — history fidelity
Short-term architecture direction for stronger historical traceability:
- audit trail for interaction changes over time,
- participant replacement history (who was replaced and when),
- participant revisions through versioned participant snapshots.

This note defines evolution direction only; it is not a roadmap or timeline commitment.
