# Security by Design

This document defines mandatory development guardrails for the current Meraviglia Cashflow stack (React/Vite + TypeScript + Supabase/Postgres/PostgREST + Vercel + Docker local).

## Security principles
- **Least privilege:** grant the minimum privileges required at DB, API, and application layers.
- **Secure defaults:** default behavior must be safe even when optional controls are not configured.
- **Defense in depth:** enforce controls in multiple layers (RLS + repository/application validation + UI constraints).
- **Explicit trust boundaries:** treat browser input, URL params, and external payloads as untrusted.
- **Fail safely:** on failures, deny unsafe operations and surface sanitized errors.

## Application and platform guardrails
- **Supabase RLS is authoritative** for workspace/tenant isolation and must remain enabled for tenant-sensitive tables.
- **Privileged business logic must not run directly from UI to Supabase.** UI calls should flow through application/repository boundaries where policy and validation are enforced.
- **Repository + application layers are policy control points** for validation, permission checks, and deterministic behavior.
- **All input must be validated before persistence** (shape, required fields, enum/state constraints, and cross-entity references).
- **Error handling must be deterministic and sanitized:** UI-facing errors should be actionable but must not expose SQL, stack traces, keys, or infrastructure internals.

## Secrets and credentials
- Secrets must never be committed (including example real values in docs, fixtures, screenshots, or logs).
- Use environment variables for runtime secrets; keep `.env` local and excluded from version control.
- Keep local/dev/prod credentials separated; never reuse production secrets in local Docker or preview environments.
- Rotate and replace exposed credentials immediately if leakage is suspected.

## Dependency and runtime hygiene
- Update dependencies deliberately (review release notes and security impact before upgrade).
- Do not add new libraries without a clear implementation need.
- Prefer small, auditable changes over broad refactors when addressing security-sensitive behavior.
- Keep TypeScript strictness and linting controls intact to reduce unsafe runtime drift.

## Logging and observability
- Never log secrets, tokens, raw credentials, or unnecessary personal data.
- Prefer structured, minimal logs tied to operation context (entity IDs, workspace scope, error category).
- Developer diagnostics can be detailed in secure logs, but user-visible messages must remain sanitized.

## PR security checklist (required)
- [ ] Does this change preserve RLS-based workspace isolation?
- [ ] Is privileged logic kept out of direct UI-to-Supabase paths?
- [ ] Are all new/changed inputs validated before write operations?
- [ ] Are error messages sanitized for UI while remaining actionable for developers?
- [ ] Are secrets/credentials handled only via environment configuration?
- [ ] Are new dependencies justified and reviewed?
