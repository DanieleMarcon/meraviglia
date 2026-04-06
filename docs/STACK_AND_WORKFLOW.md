# Meraviglia OS — Stack & Workflow Operating System

## Purpose

This document defines:
- the full development stack
- how each component works
- how components integrate
- the correct operational workflow
- a repeatable development standard
- the foundation for future agentic automation

This is not a generic guide — this is the operating system for development.

---

# 1. Stack Overview

## Supabase
- Backend (DB + Auth)
- Local (Docker) + Remote (Cloud)
- Commands:
  - supabase start
  - supabase db reset
  - supabase db push
  - supabase db pull

## Docker
- Runs Supabase locally

## Supabase CLI
- Migration & sync tool

## Vercel
- Auto deploy frontend on git push
- DOES NOT update DB

## GitHub
- Source of truth
- Triggers Vercel

## Local App
- npm run dev

## Governance
- npm run check

---

# 2. Integration Model

UI → Application → Repository → Supabase

Rules:
- No UI → Supabase direct
- DB not auto-updated

---

# 3. Workflow

1. Create feature
2. Create migration (if needed)
3. Test locally:
   supabase db reset
   npm run dev
   npm run check
4. Push:
   git push
5. Update DB:
   supabase db push

---

# 4. 30-sec Checklist

1. DB changed? → migration
2. supabase db reset
3. npm run dev
4. npm run check
5. git push
6. supabase db push

---

# 5. Local vs Production

Local:
- App: npm run dev
- DB: Docker

Production:
- App: Vercel
- DB: Supabase Cloud

---

# 6. Future

Move toward:
- AI agents
- automation
- reusable development system
