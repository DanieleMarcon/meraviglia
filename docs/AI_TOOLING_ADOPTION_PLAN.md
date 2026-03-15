# Meraviglia OS — AI Tooling Adoption Plan

## 1. Purpose
This document defines **when** and **how** AI-related tooling should be introduced into Meraviglia OS without destabilizing architecture.

AI tooling must be introduced gradually because premature adoption can create architectural drift:
- tool-specific workflows may bypass approved layer boundaries,
- persistence or orchestration responsibilities can move into the wrong layers,
- short-term acceleration can weaken long-term system grammar and governance.

This plan intentionally does **not** activate tooling immediately. It defines adoption timing, prerequisites, and placement constraints.

### Tooling classes must remain distinct
- **Development acceleration tools**: used by engineers during implementation to accelerate delivery quality and speed.
- **Runtime AI orchestration tools**: used by the running product to route tools, coordinate agents, and govern AI operations.
- **AI inference providers**: model/data providers that execute inference (for example LLM, speech-to-text, extraction).

## 2. Tool Classification
Meraviglia OS uses three categories:

### Development acceleration tools
Example: **Emergent**.

Use scope:
- implementation support,
- scaffolding and boilerplate generation,
- productivity acceleration under protocol governance.

### Runtime AI orchestration tools
Example: **Pica OS**.

Use scope:
- agent/tool orchestration at runtime,
- workflow/tool routing,
- multi-provider runtime coordination.

### AI inference providers
Examples:
- LLM providers,
- speech-to-text providers,
- extraction/OCR/understanding providers.

Use scope:
- inference execution only.
- providers are dependencies behind governed adapters; they are not architecture owners.

## 3. Emergent Adoption Point
**Emergent must NOT be introduced yet.**

Emergent should be introduced only when all of the following are true:
- Contacts Foundation exists,
- Scheduling Foundation exists,
- at least one additional repeatable module exists (for example Notes, Interactions, or Documents).

Rationale:
Emergent is most effective when delivery patterns are already repeatable. At that point, scaffolding can accelerate implementation while preserving Meraviglia architectural grammar instead of redefining it.

Expected use once activated:
- scaffolding,
- boilerplate generation,
- feature delivery acceleration,
- protocol-compliant code generation.

## 4. Pica Adoption Point
**Pica must NOT be introduced yet.**

Pica should be introduced only after all of the following are true:
- canonical Contact model exists,
- Scheduling/Interaction layer exists,
- AI ingestion review workflow exists.

Rationale:
Pica is a runtime coordination layer and requires stable domain semantics plus review governance before orchestration can safely write or route across systems.

Expected role once activated:
- agent orchestration layer,
- tool routing layer,
- multi-provider coordination layer,
- operator assistance infrastructure.

## 5. Prerequisites Before AI Tooling Strategy Activation
Before formal AI tooling strategy activation, Meraviglia OS must have:
- stable workspace-centric domain model,
- canonical entities (`workspace`, `contact`, `interaction`),
- human-in-the-loop approval workflows,
- infra placement rules defined,
- persistence write authority rules defined.

## 6. When `AI_TOOLING_STRATEGY.md` Must Be Created
The formal strategy document `docs/AI_TOOLING_STRATEGY.md` should be created:
- after Scheduling Foundation, **or**
- immediately before implementing AI-assisted ingestion v1,

whichever comes first.

## 7. Required Contents of `AI_TOOLING_STRATEGY.md`
`AI_TOOLING_STRATEGY.md` must include:
- tool taxonomy,
- layer placement rules,
- provider boundaries,
- human-in-the-loop governance,
- persistence write authority rules,
- auditability and observability,
- cost governance,
- security and tenant isolation,
- prompt governance standards,
- rollout sequence.
