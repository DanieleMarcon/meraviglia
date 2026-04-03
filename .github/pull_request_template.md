## Summary
- What changed?
- Why now?

## Governance enforcement checklist (required)

### Security
- [ ] Inputs are validated before persistence (application/repository guardrails).
- [ ] Error handling remains deterministic and sanitized for UI output.
- [ ] UI does not bypass application/repository boundaries for privileged access.

### Privacy / GDPR
- [ ] New/changed fields are necessary for current product behavior (no speculative personal data).
- [ ] DTO and mapping boundaries prevent raw persistence model leakage.
- [ ] Retention/deletion implications are explicit (`defined now` or `deferred with owner`).

### Accessibility
- [ ] Interactive elements are keyboard operable and visibly labeled.
- [ ] Validation/blocked/error states are understandable without color-only signals.
- [ ] Loading/empty/error states remain explicit and predictable.

## Validation
- [ ] `npm run check`
