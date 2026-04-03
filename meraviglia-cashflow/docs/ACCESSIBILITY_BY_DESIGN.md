# Accessibility by Design

This document defines practical accessibility guardrails for current Meraviglia Cashflow UI work. It is intended for day-to-day implementation and review, not as a broad WCAG reference.

## Core principles
- **Semantic structure:** UI should expose meaningful headings, lists, controls, and regions.
- **Keyboard accessibility:** all critical flows must be operable without a mouse.
- **Visible labels:** controls require clear, persistent labels.
- **Understandable errors:** validation and runtime errors must be clear and specific.
- **Sufficient contrast:** text and controls must remain readable in normal use.
- **Predictable interactions:** user actions should produce consistent, explainable outcomes.

## Current UI implications
These rules apply directly to current app patterns:
- Forms for workspace, contact, and interaction workflows.
- Lists and detail panels.
- Status actions (including blocked/canceled or constrained transitions).
- Loading, empty, and blocked states.
- Deterministic user-facing error messaging.

## Development guidance
- Buttons and inputs must have explicit labels (placeholders are not labels).
- Validation and status messaging must not rely on color alone.
- If an action is blocked, the UI must explain why and what can be done next.
- Focus behavior should remain coherent after save, edit, cancel, and error outcomes.
- Dynamic updates (state transitions, list refreshes, error banners) should be understandable without guesswork.

## PR accessibility checklist (required)
- [ ] Are all interactive elements keyboard reachable and operable?
- [ ] Do controls expose clear visible labels?
- [ ] Are validation/status states understandable without color-only cues?
- [ ] Do blocked actions explain reason and recovery path?
- [ ] Is focus behavior coherent after mutation and error states?
- [ ] Are loading/empty/error states explicit and predictable?

## Enforcement map (M3.x post-consolidation)
### Code level (must enforce)
- **UI component rules:** interactive components must use semantic elements (`button`, `input`, `label`) or equivalent ARIA semantics when native elements are impossible.
- **Error/blocked states:** mutation failures and blocked actions must render deterministic explanatory text, not generic toasts only.
- **Minimal reusable patterns:** shared form-field and state-message patterns should be reused to keep labeling/error behavior consistent.

### PR review level (must enforce)
- PRs touching forms/actions must confirm keyboard operability and visible labeling.
- PRs introducing blocked states must include reason + recovery message.
- PR reviewer verifies that accessibility regressions are not introduced in loading/empty/error states.

### Architecture level (must enforce)
- Accessibility behavior is part of UI acceptance criteria, not post-hoc polish.
- Deterministic application error mapping is preserved so UI messages stay understandable.
- Reusable UI primitives are preferred over ad-hoc per-screen implementations when available.

### Guideline-only (for now)
- Automated a11y testing in CI (deferred until lightweight tooling is selected).
- Formal WCAG conformance scoring workflow.
