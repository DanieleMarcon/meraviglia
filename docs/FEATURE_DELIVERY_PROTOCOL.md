# Meraviglia OS Feature Delivery Protocol

## 1. Purpose

This protocol defines the official implementation path for all new feature slices after the Codebase Cleanup Phase.

It preserves the frozen architecture and engineering constraints by turning them into an actionable delivery workflow teams can follow every time.

This document is operational (how to ship work), while architecture and layer constraints remain authoritative in:

- `docs/ARCHITECTURE_FREEZE_v1.md`
- `docs/ENGINEERING_PROTOCOL.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/DOMAIN_ARCHITECTURE.md`
- `docs/SIMULATION_ENGINE.md`
- `docs/AI_STRATEGY.md`

### Prompt Protocol Alignment

All feature implementation prompts must follow `docs/PROMPT_PROTOCOL.md`.

This keeps AI-assisted development workflows consistent across tools without duplicating prompt governance in this document.

---

## 2. Feature Lifecycle

Every feature must follow this lifecycle in order. Do not skip phases.

### Phase 1 — Feature Definition

- Define the user/business outcome and the exact use case scope.
- List affected bounded contexts and entities.
- Classify feature type:
  - UI behavior
  - application orchestration
  - domain rule/invariant
  - deterministic simulation logic
  - persistence or import/export contract
  - AI-assisted workflow (non-deterministic helper, deterministic execution untouched)
- State what is explicitly out of scope.

**Exit criteria**

- A written feature brief exists in the implementation task/issue.
- The target layer(s) are identified before coding starts.

### Phase 2 — Boundary Identification

- Identify every boundary crossing the feature introduces or changes:
  - UI ↔ Application DTO boundaries
  - Application ↔ Domain boundaries
  - Application ↔ Repository contract boundaries
  - Application/Domain ↔ Engine inputs and outputs
  - Infra adapter boundaries (external provider, storage, transport)
- Decide whether each crossing needs:
  - mapper
  - decoder/validator
  - adapter
  - service orchestration
  - compatibility bridge

**Exit criteria**

- Boundary list is explicit and reviewed in the task description or PR notes.

### Phase 3 — Layer Ownership Decision

- Assign each new behavior to exactly one owning layer.
- Reject mixed ownership (for example, domain rules in UI, persistence logic in domain).
- If ownership is unclear, stop implementation and resolve before coding.

**Exit criteria**

- Each unit of logic has one owner layer and one reason for that placement.

### Phase 4 — Implementation

- Implement in dependency-contract order:
  1. domain semantics/invariants (if needed)
  2. engine updates for deterministic behavior (if needed)
  3. application orchestration and contracts
  4. repository interfaces and infra adapters
  5. UI integration through application DTOs
- Keep domain pure.
- Keep simulation deterministic (`SimulationContext` contract, canonical numeric/time rules).
- Use explicit mappers/decoders at boundaries; do not bypass with ad hoc object spreading.

**Exit criteria**

- Code compiles and local tests/checks pass for changed scope.

### Phase 5 — Governance Validation

Run the mandatory checks before merge:

- `npm run check:governance`
- `npm test`
- `npm run build`

If any check fails, feature is not merge-ready.

**Exit criteria**

- All mandatory checks pass.
- No freeze-level dependency violations or deterministic-governance violations remain.

### Phase 6 — Documentation Update

- Update docs affected by new behavior, boundaries, or contracts.
- Add migration notes when compatibility bridges or aliases are introduced.
- Ensure implementation language and docs use the same terms.

**Exit criteria**

- Documentation deltas are included in the same PR when behavior/contracts changed.

---


### Documentation Impact Check

Every feature implementation task must explicitly evaluate whether project documentation requires updates.

Feature tasks must include a final step that reviews at least the following documentation surfaces:

- `docs/ROADMAP_PHASES.md`
- `docs/PROJECT_STRUCTURE.md`
- `meraviglia-cashflow/README.md`
- any feature-specific documentation relevant to the change

The task completion summary must explicitly state one of the following:

- Documentation updated (list files modified), or
- Documentation confirmed unchanged.

Purpose: prevent documentation drift and ensure architecture documentation remains authoritative.


## 3. Layer Ownership Rules

Use these rules as strict placement guidance.

### UI Layer

Owns:

- presentation state
- interaction flow and rendering
- view-specific formatting
- calling application services with DTOs

Does not own:

- business invariants
- persistence policy
- deterministic simulation rules

### Application Layer

Owns:

- use-case orchestration
- transaction/use-case sequencing
- repository interface usage
- engine invocation coordination
- AI orchestration placement (unless governance explicitly defines a separate module)

Does not own:

- core domain invariants
- infrastructure implementation details
- framework-specific UI concerns

### Domain Layer

Owns:

- entities, value objects, domain services
- invariants and business semantics
- pure rule enforcement independent from frameworks/storage

Does not own:

- database adapters
- transport models
- UI presentation logic

### Engine Layer

Owns:

- deterministic simulation execution flow
- simulation model evaluation using provided `SimulationContext`
- deterministic numeric/time/order guarantees

Does not own:

- infra side effects
- ad hoc data fetching
- nondeterministic sources (clock/randomness) outside governed context

### Repository Layer (Interfaces / Ports)

Owns:

- persistence contracts consumed by application use cases
- storage-agnostic repository method signatures

Does not own:

- concrete storage code (infra responsibility)
- domain invariants

### Infra Layer

Owns:

- concrete adapters for persistence, providers, external APIs
- serialization/deserialization at transport/storage edge
- implementation of repository ports

Does not own:

- application orchestration policy
- domain business rule ownership

---

## 4. Boundary Patterns

Use the following pattern rules whenever data or behavior crosses layers.

### Mappers

Introduce a mapper when:

- translating DTOs to domain objects or domain objects to DTOs
- converting persistence records to domain-friendly structures
- isolating model shape differences between layers

Rule: mapping logic is explicit and named; avoid hidden implicit mapping.

### Decoders / Validators

Introduce decoders when:

- ingesting external/untrusted payloads (import, API, storage recovery)
- shape coercion or schema validation is required before domain/application usage

Rule: invalid payloads fail fast at boundary; never leak malformed data inward.

### Adapters

Introduce adapters when:

- binding repository interfaces to concrete infrastructure
- integrating external providers/tools/services

Rule: adapters translate from external contracts to internal contracts; they do not define core domain policy.

### Services

Introduce services when:

- orchestration spans multiple repositories or engine calls
- application-level policy sequencing is required

Rule: application services coordinate; domain services enforce domain semantics.

### Compatibility Bridges

Introduce compatibility bridges when:

- legacy shape or identifier support is required during staged migration
- old contract reads must coexist with new canonical writes

Rule: bridges are explicit, documented, and time-bounded with a sunset plan.

---

## 5. Compatibility & Migration Rules

When evolving contracts or architecture slices, use controlled migration patterns.

### Aliases

- Use aliases for renamed fields/entities only when immediate consumer migration is not possible.
- Canonical internal representation must remain singular.
- Alias behavior must be documented and covered by tests.

### Legacy Compatibility Bridges

- Place bridge logic at boundary edges (decoder/mapper/adapter), not deep in domain core.
- Bridge reads may accept old and new shapes.
- Bridge writes should converge toward canonical format.

### Migration Writeback

- If legacy data is read, prefer writeback in canonical format during safe update opportunities.
- Writeback logic must be deterministic and idempotent.
- Never mutate unrelated fields during migration writeback.

### Sunset Strategy

Every compatibility mechanism must define:

- activation reason
- target removal milestone/release window
- success criteria for removal
- cleanup owner

No permanent compatibility bridge is allowed without explicit governance approval.

---

## 6. Governance Checks

The following checks are mandatory for merge readiness.

### `npm run check:governance`

Protects:

- frozen dependency contract adherence
- import/path governance
- architectural boundary enforcement

Usage rule: run for every feature PR; failure blocks merge.

### `npm test`

Protects:

- behavioral correctness
- regression detection for domain/application/engine/persistence behavior
- migration compatibility expectations

Usage rule: run full test suite before merge.

### `npm run build`

Protects:

- compile-time integrity
- type/build pipeline health
- release readiness at artifact level

Usage rule: must pass on final PR state.

---

## 7. Documentation Rules

Documentation updates are mandatory in the same PR when a feature changes any of the following:

- architectural boundaries, allowed dependencies, or layer placement
- new boundary pattern type or materially new mapper/decoder/adapter protocol
- persistence contract or import/export format behavior
- deterministic simulation rules, numeric policy, time policy, or execution order guarantees
- AI orchestration placement or AI governance behavior

Minimum documentation behavior:

- update authoritative docs, not only inline comments
- include migration notes for compatibility bridges and aliases
- keep examples aligned with shipped behavior

If no documentation update is required, state the reason explicitly in the PR description.

---

## 8. AI-Assisted Development Guidelines

AI-assisted implementation is allowed, but governance remains mandatory.

### Prompt Structure for Feature Work

Every AI coding prompt should include:

1. target layer(s) and forbidden layers for the task
2. required boundaries (mapper/decoder/adapter/service expectations)
3. deterministic constraints (if engine/simulation is involved)
4. dependency constraints from Architecture Freeze v1
5. required checks before completion (`check:governance`, `test`, `build`)
6. documentation update expectations

### AI Guardrails

- Do not request or accept architecture bypasses.
- Do not allow AI-generated code to place domain rules in UI/infra.
- Do not allow AI-generated simulation code to use uncontrolled randomness/time.
- Require explicit human review for all AI-generated diffs before merge.
- Treat AI output as draft implementation subject to governance checks.

### Recommended Prompt Footer

Use this footer in implementation prompts:

> “Preserve Meraviglia Architecture Freeze v1 boundaries. Keep domain pure, keep simulation deterministic via SimulationContext, and avoid layer bypasses. Add/update mappers/decoders/adapters explicitly at boundaries. Validate with `npm run check:governance`, `npm test`, and `npm run build`. Update documentation when contracts or boundaries change.”

---

## 9. Summary Principles

- **One feature, one governed lifecycle.**
- **One behavior, one owning layer.**
- **Every boundary is explicit.**
- **Deterministic simulation is non-negotiable.**
- **Compatibility is temporary and sunset-driven.**
- **Governance checks are merge gates, not suggestions.**
- **Documentation is part of the feature, not an afterthought.**
