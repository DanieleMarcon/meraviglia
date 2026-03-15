# Platform Core — Brand-Agnostic Architecture

## Scope
This document defines the **ARCHITECTURE HARDENING — STEP 1** data model for a white-label, multi-tenant SaaS core on Supabase.

Design constraints implemented:
- One user belongs to exactly one organization.
- Organizations are manually provisioned (no self-signup provisioning flow).
- `auth.users` remains authentication source.
- `public.users` is application-level identity.
- RBAC is organization-scoped with global permission catalog.
- Tenant isolation is enforced with PostgreSQL Row Level Security.

## ER Diagram (Textual)
```text
auth.users (Supabase Auth)
  1 ─── 1 public.users

public.organizations
  1 ─── * public.users
  1 ─── * public.roles
  1 ─── * public.workspaces
  1 ─── * public.intakes
  1 ─── * public.contacts
  1 ─── * public.interactions
  1 ─── * public.memory_artifacts

public.permissions (global catalog)
  1 ─── * public.role_permissions

public.roles
  1 ─── * public.role_permissions
  1 ─── * public.user_roles

public.users
  1 ─── * public.user_roles
  1 ─── * public.workspaces (created_by_user_id optional reference)

public.intakes
  * ─── 0..1 public.workspaces (workspace_id set on conversion)

public.workspaces
  1 ─── * public.contacts
  1 ─── * public.interactions
  1 ─── * public.memory_artifacts

public.contacts
  * ─── * public.interactions (through participant linkage table in future implementation slices)
  * ─── * public.memory_artifacts (optional linkage; join table or controlled reference model in future slices)
```

## Table Responsibilities

### `public.organizations`
Tenant root entity. Stores organization identity and lifecycle metadata.

### `public.users`
Application identity linked 1:1 to `auth.users`. Stores tenant membership (`organization_id`) and app profile metadata.

### `public.permissions`
Global catalog of permission keys (platform-wide vocabulary).

### `public.roles`
Organization-local role definitions. Same role name can exist in different organizations; uniqueness is per organization.

### `public.role_permissions`
Many-to-many mapping between organization roles and global permissions.

### `public.user_roles`
Many-to-many mapping between users and roles, within tenant boundaries.

### `public.workspaces`
Organization-scoped strategic containers for planning/orchestration initiatives.

### `public.intakes`
Organization-scoped strategic entry records. Stores initial strategic inputs (`draft`/`validated`) and links to workspace once converted (`converted`).

### `public.contacts`
Organization-scoped, workspace-linked strategic relationship records. Contacts carry explicit provenance metadata (`manual`, `from_intake`, `from_ai_review`) to support lifecycle traceability.

### `public.interactions` (canonical model target)
Workspace-scoped operational interaction records linking participants and timing to strategic continuity.

Conceptual fields (v1 target):
- `id`
- `workspace_id`
- `type`
- `scheduled_at`
- `status`
- `provenance`
- optional notes/outcome linkage metadata

Interaction participant linkage remains explicit and workspace-compatible (likely via join table in implementation).

Scheduling Foundation will implement the first narrow subset of this model and must not be interpreted as the full Interaction Layer scope.


### `public.memory_artifacts` (canonical model target)
Workspace-scoped strategic memory records preserving continuity across notes, documents, and strategic observations.

Conceptual fields (v1 target):
- `id`
- `workspace_id`
- `type`
- `provenance`
- `created_at`
- optional linked contacts (`linked_contact_ids` or join table approach)
- optional `linked_interaction_id`
- optional content fields (`content`, `summary`, `reference`)
- optional `review_state` for future AI-assisted governance compatibility

Memory Foundation will implement only the first narrow subset (manual workspace-linked artifacts with optional contact/interaction linkage).


## RBAC Flow
1. Platform defines global permissions in `public.permissions`.
2. Each organization defines custom roles in `public.roles`.
3. Roles receive capabilities through `public.role_permissions`.
4. Users receive one or more roles through `public.user_roles`.
5. Application authorization checks resolve: user → roles → permissions.

This keeps permission semantics globally consistent while allowing per-tenant role modeling.

## Tenant Isolation Model
Isolation boundary is `organization_id`.

- `public.users`, `public.roles`, `public.workspaces`, `public.intakes`, `public.contacts`, and future `public.interactions`/`public.memory_artifacts` include explicit `organization_id`.
- `public.user_roles` is constrained transitively by requiring both linked user and role to be in current user organization.
- Foreign keys + RLS prevent cross-tenant traversal.

## RLS Enforcement
RLS is enabled and forced on:
- `public.users`
- `public.roles`
- `public.user_roles`
- `public.workspaces`
- `public.intakes`
- `public.contacts`
- future `public.interactions`
- future `public.memory_artifacts`

A helper function `public.current_user_organization_id()` resolves tenant context from `auth.uid()` via `public.users`.

Policies ensure:
- SELECT only rows of caller organization.
- INSERT/UPDATE/DELETE only rows of caller organization.
- `user_roles` operations are valid only when both endpoints (user and role) belong to caller organization.

## Identity Bootstrap Trigger
`public.handle_auth_user_created()` runs after `auth.users` insert and auto-creates `public.users`.

- Reads `organization_id` from `auth.users.raw_user_meta_data`.
- Rejects inserts without organization context.
- Preserves controlled onboarding path (manual organization provisioning).

## Future Extensibility Notes
- Add audit tables (`audit_log`) for privileged mutations.
- Add `network_id` and network-level governance later without breaking org boundaries.
- Add policy-helper functions for permission checks (`has_permission(permission_key)`).
- Add soft-delete/versioning patterns for strategic artifacts.
- Add optional custom role templates per tenant onboarding workflow.

## Intake Conversion Lifecycle
1. Intake is created with status `draft`.
2. Intake can be updated and moved to `validated`.
3. Conversion creates a workspace and updates intake to `converted`.
4. Converted intake stores `workspace_id` for strategic traceability.

## Atomic Conversion Requirement (Future Hardening)
`convertIntakeToWorkspace` currently performs multiple operations (workspace create + intake update) at application level, so the conversion is not atomic.

For production hardening, this flow should move to a single database function/RPC to guarantee transactional consistency under concurrency and failure conditions.

Current implementation remains acceptable for internal MVP usage given existing RLS boundaries and controlled operational scope.
