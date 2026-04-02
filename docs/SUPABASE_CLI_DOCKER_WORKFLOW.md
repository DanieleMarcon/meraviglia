# Supabase CLI Workflow Normalization (Clean Bootstrap Pending)

## Purpose

This runbook defines the **current canonical operational DB workflow** for Meraviglia.

- Canonical executable DB artifacts live in `supabase/migrations/*.sql`.
- `docs/*.sql` files are documentation/reference artifacts, not execution entrypoints.
- DB changes are applied via Supabase CLI commands.
- Docker remains a requirement for local Supabase services, but **clean local bootstrap is not yet supported** (see support boundary below).

## Contract Alignment Note (M3 interactions status)

- Canonical DB status value is **`canceled`**.
- Legacy value **`cancelled`** is migration/backfill compatibility only.
- During transition, app/repository decode paths must remain tolerant of legacy `cancelled` reads where still encountered.
- All new writes must converge to canonical **`canceled`**.

## Prerequisites

1. Install Docker Desktop (or Docker Engine + Compose).
2. Install Supabase CLI.
3. Authenticate CLI:

```bash
supabase login
```

## Repository DB Structure

- `supabase/config.toml` — local Supabase project config.
- `supabase/migrations/*.sql` — ordered migration files.

Current M3 interactions slice is canonicalized as:

- `supabase/migrations/20260402100000_m3_interactions_foundation.sql`

## Current Support Boundary (Important)

The current migration set is valid for an **already-provisioned Supabase project** (remote or previously prepared environment).

- ✅ Supported now: link project, reconcile migration state, push new migrations.
- ❌ Not yet supported: `supabase db reset` against a clean empty local DB as a guaranteed path.

Reason: full baseline migration-history backfill for pre-existing platform objects has not yet been completed.

## Recommended Operational Commands (Current)

After pulling latest main:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase migration repair --status applied <version_if_needed>
supabase db push
```

Notes:

- Use `supabase migration repair` only when migration history must be reconciled with already-applied schema state.
- `supabase db push` is the canonical apply command for pending migrations in linked projects.

## Future Change Flow (Until Baseline Backfill Milestone)

1. Create migration:

   ```bash
   supabase migration new <descriptive_name>
   ```

2. Implement SQL in the generated file under `supabase/migrations/`.
3. Open PR with migration rationale and compatibility notes.
4. Merge PR.
5. Locally run explicit operational commands (`link` / optional `repair` / `db push`).
6. Verify schema + app behavior.
7. Proceed with app deploy (e.g., Vercel) when relevant.

## Deferred Follow-up (Explicit)

A dedicated milestone will backfill full baseline migration history so `supabase db reset` on clean local DB is reliable and officially supported.

Until then, treat this repo as **CLI workflow normalized** for already-provisioned projects, not yet clean-bootstrap complete.

## Guardrails

- Do not execute SQL in docs as operational migration path.
- Keep migrations append-only; avoid mutating old migration files after merge.
- Prefer explicit CLI commands over hidden automation.
- Keep docs SQL files for traceability/handoff, but mark non-canonical for execution.
