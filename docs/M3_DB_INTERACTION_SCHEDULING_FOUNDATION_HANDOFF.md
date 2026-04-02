# M3 / DB — Interaction Layer Scheduling Foundation Persistence Baseline

## 1) Executive summary

This DB slice implements the minimal persistence and enforcement layer required by the ratified M3 PRODUCT contract for workspace-scoped interactions.

It provides:
- canonical interaction storage with M3-only values,
- participant linkage to existing workspace contacts,
- workspace/organization integrity enforcement at DB level,
- RLS aligned with the existing organization-scoped model,
- minimal indexes for list-by-workspace workflows,
- migration-safe SQL compatible with both fresh and previously provisioned schemas.

No calendar sync, recurrence, automation, reminders, CRM semantics, AI provenance, RBAC redesign, or infra expansion were introduced.

---

## 2) Proposed schema

### `public.interactions`
- `id uuid pk`
- `organization_id uuid not null`
- `workspace_id uuid not null`
- `type text not null` (`meeting`, `call`, `follow_up`)
- `scheduled_at timestamptz not null`
- `status text not null default 'planned'` (`planned`, `completed`, `canceled`)
- `provenance text not null default 'manual'` (M3-only)
- `notes text null`
- `status_changed_at timestamptz not null default now()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `public.interaction_participants`
- `interaction_id uuid not null`
- `contact_id uuid not null`
- `organization_id uuid not null`
- `workspace_id uuid not null`
- `created_at timestamptz not null default now()`
- `primary key (interaction_id, contact_id)`

This participant table remains narrow but includes org/workspace columns to make tenant/workspace safety explicit and enforceable across joins.

---

## 3) Constraints and invariants

### Value strategy (enum vs check)
For migration safety and operational flexibility, this slice uses **CHECK constraints** (not PostgreSQL enums):
- easier incremental evolution,
- lower risk for live environments,
- explicit contract enforcement in-table.

### Canonical value constraints
- `type in ('meeting', 'call', 'follow_up')`
- `status in ('planned', 'completed', 'canceled')`
- `provenance = 'manual'`

### Organization/workspace safety invariants
- Interaction workspace must belong to interaction organization:
  - FK `(workspace_id, organization_id) -> workspaces(id, organization_id)`
- Participant row must match both interaction and contact in same workspace/org:
  - FK `(interaction_id, workspace_id, organization_id) -> interactions(id, workspace_id, organization_id)`
  - FK `(contact_id, workspace_id, organization_id) -> contacts(id, workspace_id, organization_id)`

### Status lifecycle invariants (DB-enforced)
Trigger-enforced transitions:
- insert: only `planned`
- `planned -> completed|canceled`
- `completed|canceled -> planned`
- all other transitions rejected

This exactly matches the M3 contract minimal lifecycle.

---

## 4) RLS policy design

### Interactions
- `SELECT/UPDATE/DELETE`: organization isolation via `current_user_organization_id()`
- `INSERT/UPDATE with check`: organization isolation + workspace/org consistency existence check

### Interaction participants
- `SELECT/UPDATE/DELETE`: organization isolation on participant row
- `INSERT/UPDATE with check`:
  - org match current user org,
  - referenced interaction exists in same workspace/org,
  - referenced contact exists in same workspace/org.

This preserves tenant safety even when consumers issue direct SQL joins.

---

## 5) SQL migration(s)

Implemented in:
- `docs/SUPABASE_PLATFORM_CORE_STEP8_M3_INTERACTIONS_DB.sql`

Migration characteristics:
- `create table if not exists` and `add column if not exists`
- data normalization for legacy values (`cancelled -> canceled`, provenance reduction to `manual`)
- idempotent policy/trigger recreation (`drop ... if exists` + recreate)
- minimal indexes aligned with workspace list queries

Workspace list efficiency support:
- `idx_interactions_workspace_status_scheduled_at`
- `idx_interactions_workspace_status_changed_desc` (partial for closed statuses)
- participant-side lookup indexes for interaction/contact linkage

---

## 6) Notes for APP handoff

1. Canonical DB values are lower-case contract values:
   - type: `meeting|call|follow_up`
   - status: `planned|completed|canceled`
   - provenance: `manual`
2. Legacy spelling compatibility: DB canonical status is only `canceled`; migration backfills historical `cancelled` values to `canceled`. APP decode paths should remain temporarily tolerant of incoming historical `cancelled` values until all deployed clients and caches converge.
3. System writes must converge to `canceled` only; no long-term dual canonical status values.
4. User-facing label casing remains APP concern (`Canceled` display, etc.).
5. On create, APP must send `status='planned'` (or omit and rely on default).
6. Participant writes can remain minimal (`interaction_id`, `contact_id`). DB derives and enforces `organization_id` and `workspace_id` via trigger.
7. Editing supports core fields (`type`, `scheduled_at`, `notes`, participants) and status transitions per lifecycle.
8. For sorting closed sections, APP can use `status_changed_at desc`, fallback `scheduled_at desc` if needed.

### Ratification checks completed

1. **Composite FK target viability**
   - verified and enforced by explicit unique indexes in this slice:
     - `workspaces (id, organization_id)`
     - `contacts (id, workspace_id, organization_id)`
     - `interactions (id, workspace_id, organization_id)`
   - these indexes make composite FK targets valid and stable for migration execution.

2. **Neutral status updates**
   - status trigger explicitly allows `OLD.status = NEW.status`.
   - non-status edits (notes/scheduled_at/etc.) are therefore not blocked when status is unchanged.

---

## 7) Explicitly deferred items

- calendar provider sync/import/export
- recurrence and availability semantics
- reminders and automations
- CRM stages/opportunity semantics
- AI ingestion/generation/enrichment provenance
- RBAC model redesign
- infra/services beyond this SQL slice
