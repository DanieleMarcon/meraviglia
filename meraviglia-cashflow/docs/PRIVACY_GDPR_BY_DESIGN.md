# Privacy / GDPR by Design

This document defines development-time privacy guardrails for the current Meraviglia Cashflow system. It is a practical policy baseline, not a legal certification of GDPR completeness.

## Core principles
- **Data minimization:** collect only data needed for current product value.
- **Purpose limitation:** use data only for explicit, product-defined purposes.
- **Storage limitation:** retention cannot be open-ended by default.
- **Integrity and confidentiality:** protect data from unauthorized access or accidental exposure.
- **Privacy by default:** default behavior should avoid unnecessary collection, visibility, or persistence.

## Current model implications
These guardrails apply to current core entities and their relationships:
- `workspaces`
- `contacts`
- `interactions`
- `interaction_participants`

Practical implications:
- New fields on these entities require explicit justification tied to active product behavior.
- Interaction history integrity must be preserved when evaluating edits/deletions involving related contacts.
- Lifecycle constraints (for example, contact deletion when interactions reference that contact) are privacy and integrity concerns, not only UX concerns.

## Development guidance
- Do not add speculative or “maybe useful later” personal fields.
- Keep collection proportional to current workflow outcomes.
- When retention is introduced, define it explicitly (scope, duration, and enforcement owner).
- Data export and deletion workflows must be intentionally designed; they must not be improvised late in delivery.
- Requests to delete personal data must be evaluated against historical integrity constraints and legal/operational requirements.

## Legal-role awareness (pre-production requirement)
Before broad production/commercial rollout, the following must be explicitly defined:
- Controller vs processor roles across involved parties.
- Lawful basis per major processing purpose.
- Retention policy and operational handling of data-subject requests.
- Whether a DPIA is required based on processing scale, sensitivity, and risk.

This section is a planning obligation and does **not** claim these items are already complete.

## PR privacy checklist (required)
- [ ] Is each new data field necessary for current product value?
- [ ] Is purpose of collection explicit and documented in implementation context?
- [ ] Does the change avoid speculative personal-data capture?
- [ ] Are retention implications explicit (or intentionally deferred with owner noted)?
- [ ] Does the workflow consider export/deletion implications?
- [ ] Are contact/interaction history integrity constraints preserved?
