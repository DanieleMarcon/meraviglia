# Governance Alignment Audit — Point 0 (Post-M3.x)

Date: 2026-04-04

## 1) Executive summary

The system is **structurally solid but not fully governance-complete**.

What is strong right now:
- Architecture boundaries are codified and automatically checked (`ui -> application -> repository/infra`) through a strict dependency matrix. 
- Supabase client usage is centralized in `infra` and blocked elsewhere by automation.
- Core lifecycle policies for contacts/interactions are implemented in application services and covered by tests.
- Governance docs are explicit about their enforcement map and explicitly state automation limits.

What is still weak:
- UI-facing error propagation now uses sanitized deterministic mapping; raw backend/internal message passthrough is closed for Point 0.
- Privacy/GDPR documentation declares retention/deletion handling requirements, but runtime currently enforces only delete-block semantics for referenced contacts.
- Accessibility automation is intentionally shallow (correct choice), but several expectations remain review-only and therefore fragile under delivery pressure.

Bottom line:
- **No architecture reset needed.**
- The previously must-fix sanitized error mapping gap has been resolved.
- Everything else can proceed under controlled deferral.

---

## 2) Governance alignment audit

## 2.1 Code vs policy alignment

### Security by design

#### Fully aligned and code-enforced
- Layer boundary governance is enforced by `scripts/check-governance.mjs` dependency matrix + exceptions model.
- Direct Supabase client dependency is blocked outside `src/infra`.
- Composition-root-only exception is explicit and narrow (`src/application/composition`).
- Determinism bans for engine source (`Date.now`, `Math.random`, etc.) are enforced.

#### Enforced in code, but partially policy-aligned
- Application services validate non-empty fields and lifecycle constraints (participants required, status transitions, immutability conditions).
- Repositories use typed row decoders and write payload adapters.

Gap inside this area:
- No open Point 0 blocker remains in this area after sanitized deterministic mapping closure.

#### Policy/review-only
- Validation completeness for all mutation paths remains partially review-dependent (the script does not inspect semantic validation coverage).
- Secret hygiene is mostly process/review controlled (expected for this stage).

### Privacy / GDPR by design

#### Fully aligned and code-enforced
- DTO + mapper boundary exists and is used across contact/interaction flows.
- Contact delete-block behavior when referenced by interactions is implemented.

#### Enforced in code, but partially policy-aligned
- Data minimization discipline exists in DTO contracts and repository select lists.
- Interaction historical integrity is protected by participant immutability rules outside planned state.

Gap inside this area:
- Retention semantics are documented but not operationalized in runtime workflows.

#### Policy/review-only
- Purpose/retention annotations for new personal fields rely on PR checklist discipline, not code-level gates.
- DSAR/export/deletion operational procedures are not implemented as system capabilities yet.

### Accessibility by design

#### Fully aligned and code-enforced
- Governance script blocks `<img>` without `alt` and forbids `autoFocus`.

#### Enforced in code, but partially policy-aligned
- UI generally renders deterministic textual loading/empty/error states.

#### Policy/review-only
- Keyboard reachability correctness, label quality, focus continuity, and blocked-action recovery messaging remain mostly review-enforced.

---

## 2.2 Architecture integrity

### Current integrity status
- The dependency matrix and import resolution checks provide high confidence that accidental layer inversion is currently controlled.
- Supabase access remains infra-only in source imports.
- DTO isolation is present via application DTOs + mappers.

### Hidden/potential violation vectors (future risk, not current breach)
1. **Composition-root exception creep**: if infra wiring starts appearing outside `application/composition`, architecture will erode quickly.
2. **State layer policy ambiguity**: `state` is allowed to depend on both `ui` and `application` in governance rules; this is currently not abused, but it is a latent shortcut path.
3. **Raw-error propagation drift**: because message mapping is not centralized at one boundary, future features may leak internal errors inconsistently.
4. **Regex-governed imports limitations**: unusual syntax patterns could evade checks if code style evolves.

---

## 2.3 Governance automation quality

### Strong / high-signal
- Layer dependency enforcement with explicit matrix and exceptions.
- Supabase boundary protection (`@supabase/supabase-js` + `supabaseClient` constraints).
- Sensitive console pattern guardrails.
- Minimal accessibility protections (`img alt`, `autoFocus`).
- Fast execution and mandatory inclusion in `npm run check`.

### Weak / bypassable by design
- Regex parsing of imports/JSX/logging patterns is heuristic, not semantic.
- Sensitive log detector catches obvious strings but not all leaked data patterns.
- Raw UI error render check only catches direct `error.message/stack` render shape.

### False-positive risk areas
- String literals or comments resembling forbidden patterns.
- Edge JSX formatting cases around `img`/`autoFocus`.
- Non-standard import formatting.

### Where automation should NOT be extended
- Do **not** grow into dense regex rule sets for semantic validation.
- Do **not** replace human review for accessibility quality or privacy intent.
- Do **not** attempt full legal/privacy interpretation in static checks.

Correct direction: keep this gate lightweight + high-signal, and enforce deeper controls in PR review and targeted tests.

---

## 2.4 Documentation consistency

### Aligned with runtime reality
- Governance docs now separate code-level enforcement vs PR/review-level expectations.
- Accessibility doc explicitly acknowledges heuristic automation limits.
- M3 closeout semantics align with interaction/contact lifecycle behavior.

### Contradictions / overstatements
1. **Legacy prompt docs drift**: root prompt protocol and task template still reference obsolete milestone framing and outdated layer naming, which can generate governance-misaligned prompts.

---

## 2.5 Critical gaps (actionable only)

### Resolved
1. **Sanitized error mapping gap (security + accessibility coherence)**
   - Deterministic user-safe mapping is now enforced for UI-facing error propagation paths.

### Safe to defer
1. **Retention/DSAR operationalization**
   - Define owner + implementation window; keep current documented deferral explicit.
2. **State layer dependency tightening**
   - Narrow `state` dependency policy once current product flows stabilize.
3. **Prompt docs consolidation cleanup**
   - Migrate all prompt entry points to a single governance-aligned protocol to avoid accidental old-template reuse.

---

## 3) Defined Point 0 baseline (authoritative)

This is the baseline state for all next phases:

### Stable
- Domain model and lifecycle semantics for workspaces/contacts/interactions.
- Layered architecture + repository/infra wiring model.
- Supabase boundary model and explicit FK embed pattern for interaction participants.

### Enforced
- Governance script for dependency direction, Supabase access, deterministic engine APIs, sensitive logs (heuristic), and minimal JSX a11y checks.
- Mandatory `npm run check` gate in contribution policy.
- PR template governance checklist.

### Reliable (with known limits)
- Lifecycle integrity rules in application services (participant immutability, delete-block for referenced contacts, stale update handling).
- DTO mapping boundary as anti-leak mechanism.
- Governance docs accurately describe where controls are code-enforced vs review-only.

### Explicitly not guaranteed by automation
- Complete semantic validation coverage.
- Full accessibility conformance.
- Legal GDPR completeness / DSAR execution workflows.

---

## 4) Go / No-Go for First Usable Version + UX Hardening

Status: **GO (constrained)**.

Ready means:
1. Architecture boundaries remain unchanged and check-governance stays mandatory.
2. UX hardening work does not bypass application services or DTO boundaries.
3. Sanitized deterministic error mapping remains mandatory and already implemented.

FUV can proceed under explicit operational constraints.

---

## 5) Recommended next step (minimal)

Start First Usable Version / UX Hardening under constrained execution:
1. No new business logic in `state`.
2. No UI → infra shortcuts.
3. Only sanitized mapped errors in UI.
4. Prompting Protocol V2 as the sole valid entry point.

## Point 0 — Final Status

- Status: CLOSED
- Blockers: none
- Known risks:
  - state-layer orchestration drift (review-controlled)
  - prompt surface legacy artifacts (review-controlled)
