# Supabase CLI + Docker Workflow (Canonical DB Operations)

## Purpose

This runbook defines the **canonical operational DB workflow** for Meraviglia.

- Canonical executable DB artifacts live in `supabase/migrations/*.sql`.
- `docs/*.sql` files are documentation/reference artifacts, not execution entrypoints.
- DB changes are applied via Supabase CLI commands, with Docker-backed local services.

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

## One-time Local Setup

From repository root:

```bash
supabase start
```

This boots local Supabase services through Docker.

Link local repo with remote project (replace placeholder):

```bash
supabase link --project-ref <your-project-ref>
```

## Standard Change Flow (Future DB Work)

### 1) Create migration

```bash
supabase migration new <descriptive_name>
```

Then edit the generated file under `supabase/migrations/`.

### 2) Validate locally

```bash
supabase db reset
```

This replays migrations on local DB from scratch and helps catch ordering or dependency errors early.

### 3) Prepare PR

- Commit migration file(s) and any related docs updates.
- Open PR for review.
- Ensure migration intent and rollback posture are clearly described in PR notes.

### 4) Post-merge operational apply

After PR merge and local pull on operator machine:

```bash
supabase db push
```

This applies pending migrations from `supabase/migrations` to the linked remote project.

### 5) Verify

- Confirm schema/state in Supabase dashboard and/or SQL checks.
- Run app smoke tests for affected flows.
- If app behavior changed, continue normal deployment (e.g., Vercel deploy).

## Developer-Oriented Delivery Sequence

For single-developer workflow:

1. Codex prepares migration + docs updates in branch.
2. PR review.
3. Merge PR.
4. Developer pulls latest main locally.
5. Developer runs explicit Supabase command(s), primarily `supabase db push`.
6. Developer verifies DB + app behavior.
7. Developer proceeds with Vercel deploy when app changes are included.

## Guardrails

- Do not execute SQL in docs as operational migration path.
- Keep migrations append-only; avoid mutating old migration files after merge.
- Prefer explicit CLI commands over hidden automation.
- Keep docs SQL files for traceability/handoff, but mark non-canonical for execution.
