## Summary
- What problem does this PR solve?
- What changed and why?

## Checklist
- [ ] Lint passes (`npm run lint`)
- [ ] Typecheck passes (`npm run typecheck`)
- [ ] Build passes (`npm run build`)
- [ ] E2E smoke passes (`npm run test:e2e`)
- [ ] Migration reviewed (if DB schema changed)
- [ ] API/auth changes reviewed for security impact
- [ ] i18n copy updated for EN + NO where relevant
- [ ] Accessibility checks done for new UI controls

## Test plan
- [ ] Happy path tested locally
- [ ] Error path tested locally
- [ ] Mobile view checked (if UI touched)

## Risk and rollback
- Risk level: low / medium / high
- Rollback steps:
  - Revert commit(s)
  - Re-run CI
  - If migration applied, include reverse/mitigation notes

