# Supabase Database Architecture & Status

**Project:** Meraviglia OS
**Last updated:** 2026-03-31
**Scope:** Database structure, security model, current state, configuration decisions, and evolution roadmap

---

# 1. Overview

The Supabase database is the core persistence layer of Meraviglia OS.
It is designed around a **multi-tenant architecture** where each organization operates in strict isolation using **Row Level Security (RLS)**.

---

# 2. Architectural Principles

## 2.1 Multi-Tenancy (Organization-Centric)

All core entities are scoped by `organization_id`.

---

## 2.2 Row Level Security First

RLS is the primary security layer.

* Enabled on all critical tables
* Forced where required
* Supported by helper function:

```sql id="m5xq4a"
public.current_user_organization_id()
```

---

## 2.3 Client-Only Access Pattern

* Supabase accessed only from browser
* Using publishable key
* No service_role usage

---

# 3. Core Data Model

(unchanged — same as previous version)

---

# 4. Security Model

## 4.1 RLS Status (Current)

| Table         | RLS | Forced |
| ------------- | --- | ------ |
| contacts      | ✅   | ✅      |
| intake_leads  | ✅   | ✅      |
| intakes       | ✅   | ✅      |
| interactions  | ✅   | ✅      |
| organizations | ✅   | ✅      |
| roles         | ✅   | ✅      |
| user_roles    | ✅   | ✅      |
| users         | ✅   | ✅      |
| workspaces    | ✅   | ✅      |

---

## 4.2 Helper Functions (Active)

### current_user_organization_id()

* SECURITY DEFINER
* Resolves org context from `auth.uid()`

### has_role(role_name)

* SECURITY DEFINER
* Resolves role assignment through `user_roles` in caller organization context

### has_permission(permission_key)

* SECURITY DEFINER
* Resolves effective permission through `roles` + `role_permissions`

---

## 4.3 Auth Trigger

### handle_auth_user_created()

* Trigger: `auth.users AFTER INSERT`
* Creates corresponding `public.users`
* Enforces presence of `organization_id`

---

## 4.4 Auto RLS Enforcement

### ensure_rls_trigger

A database-level trigger has been created to:

👉 automatically enable RLS on every new table

### Purpose

* Prevent accidental exposure of new tables
* Enforce security-by-default
* Reduce human error during schema evolution

### Important Note

This trigger:

* ✅ enables RLS
* ❌ does NOT create policies

Policies must still be explicitly defined.

---

## 4.5 RBAC Enforcement State

RBAC is now **actively enforced at DB level** with minimal deterministic scope.

Active role model:

* `admin`
* `member`

Canonical permission set currently enforced:

* `organization.read`
* `workspace.manage`
* `intake.manage`
* `contact.manage`
* `interaction.manage`
* `rbac.manage`

DB-level role-aware enforcement is active on administrative surfaces:

* `roles` writes
* `role_permissions` writes
* `user_roles` writes
* `permissions` writes
* `users` cross-user mutation
* `organizations` update

Operational entities remain organization-scoped in this milestone:

* `workspaces`
* `intakes`
* `contacts`
* `interactions`
* `intake_leads`

## 4.6 Password & Auth Security Configuration

### Current Settings

| Setting                    | Status       | Decision                    |
| -------------------------- | ------------ | --------------------------- |
| Email provider             | ✅ enabled    | required for auth           |
| Secure email change        | ✅ enabled    | prevents takeover           |
| Secure password change     | ✅ enabled    | protects sessions           |
| Minimum password length    | 6 (default)  | ⚠ to be increased           |
| Password requirements      | not enforced | ⚠ to be configured          |
| CAPTCHA                    | ❌ disabled   | postponed                   |
| Leaked password protection | ❌ disabled   | postponed (plan limitation) |

---

### Leaked Password Protection

* Not enabled
* Requires Supabase Pro plan

#### Decision

👉 Explicitly postponed

#### Rationale

* Early-stage product
* Low user volume
* Cost/benefit not justified yet

#### Future Plan

* Enable when:

  * product reaches production scale
  * or security requirements increase

---

### CAPTCHA Protection

* Temporarily disabled

#### Rationale

* Not configured with provider secret
* Would introduce friction without benefit
* No current abuse risk

---

# 5. Current Data State (Snapshot)

| Entity        | Count |
| ------------- | ----- |
| organizations | 2     |
| users         | 1     |
| roles         | 1     |
| user_roles    | 1     |
| workspaces    | 2     |
| intakes       | 2     |
| contacts      | 2     |
| interactions  | 4     |
| intake_leads  | 0     |

---

# 6. Key Management & Access

## Current Setup

* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_PUBLISHABLE_KEY`

## Not in use

* service_role ❌
* secret key ❌
* server-side Supabase ❌

---

# 7. Configuration Decisions (CRITICAL)

This section documents **intentional choices**, not just state.

---

## 7.1 No Server-Side Supabase Access

**Decision:**
Do not use service_role or backend access (for now)

**Why:**

* Reduce attack surface
* Keep architecture simple
* Force correct RLS design

---

## 7.2 Publishable Key Migration

**Decision:**
Migration from anon key → publishable key is completed

**Why:**

* Align with Supabase best practices
* Future-proof API key model

---

## 7.3 RLS-First Security Model

**Decision:**
All access must pass through RLS

**Why:**

* Single source of truth for permissions
* Works with client-only architecture

---

## 7.4 Auto RLS Trigger Enabled

**Decision:**
Enable automatic RLS activation on new tables

**Why:**

* Prevent silent security failures
* Enforce safe defaults

---

## 7.5 Leaked Password Protection Postponed

**Decision:**
Not enabled

**Why:**

* Requires paid plan
* Not critical at current stage

---

## 7.6 CAPTCHA Postponed

**Decision:**
Disabled

**Why:**

* No current abuse risk
* Would degrade UX

---

# 8. Strengths

* Strong multi-tenant isolation model
* RLS-first architecture
* No privileged key exposure
* Safe defaults (auto RLS)
* Clean auth → user sync

---

# 9. Known Risks & Gaps

* APP-side RBAC alignment is still pending (UI and workflow-level permission UX).
* Organization/access product workflows are still incomplete (invite flow, org switching, org management UI).
* No audit log yet for privileged mutations.
* No backend layer (intentional in current client-only path).

---

# 10. Recommended Improvements

## Priority 1 — APP-Side RBAC Alignment

* Align application checks and UI affordances with DB-enforced role/permission model
* Prevent stale UI assumptions that predate RBAC activation

---

## Priority 2 — Multi-User System

* Invitations
* Role assignment
* Membership lifecycle

---

## Priority 3 — Backend Layer

* Introduce controlled service_role usage
* Move sensitive logic server-side

---

## Priority 4 — Observability

* Audit logs
* Monitoring

---

# 11. Conclusion

The current database setup is:

👉 **secure, intentional, and well-structured for early-stage production**

Current milestone state is:

👉 **M1 completed at DB/security baseline, transitioning to M2**

Immediate next evolution step is:

👉 **APP-side RBAC alignment plus organization/access product workflows**
