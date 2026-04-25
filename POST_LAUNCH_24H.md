# Hire2Skill Post-Launch (First 24 Hours)

Use this checklist immediately after go-live to catch issues early.

Mark items as:
- `[ ]` pending
- `[x]` done

---

## 0) Launch Metadata

- Launch date/time:
- Release/commit:
- Incident owner:
- Support contact:

---

## 1) First 4 Hours (Every 30–60 Minutes)

- [ ] Homepage loads: `https://hire2skill.com`
- [ ] Taskers page loads and filters respond
- [ ] Post task flow opens and submits
- [ ] Chat sends/receives message
- [ ] Dashboard loads for logged-in users
- [ ] DigitalOcean app status is healthy (no crash/restart loop)
- [ ] CPU/memory usage within expected range

Notes:
- Keep one real account ready for quick end-to-end smoke tests.

---

## 2) Ongoing Checks (Every 2–3 Hours)

- [ ] Review app/runtime logs for repeated `500` errors
- [ ] Check `/api/notify` error rate
- [ ] Check `/api/contact` error rate
- [ ] Check auth callback/login errors
- [ ] Check unexpected `401/403` spike
- [ ] Check `429` spike (rate-limits too strict)

---

## 3) End-of-Day Validation

- [ ] Email delivery verified end-to-end (not just API accepted)
- [ ] Booking creation confirmed in DB
- [ ] Message creation confirmed in DB
- [ ] Review creation confirmed in DB
- [ ] Domain + SSL valid on:
  - [ ] `hire2skill.com`
  - [ ] `www.hire2skill.com` (if enabled)
- [ ] Redirect behavior correct (www/apex canonical)

---

## 4) Rollback Trigger Rules

Initiate rollback if any critical issue persists for ~10–15 minutes:

- [ ] Homepage/login unavailable for many users
- [ ] Booking/chat core flows broken
- [ ] Sustained high `5xx` rates
- [ ] Auth callback/login loops

If triggered:
- [ ] Execute rollback checklist from `LAUNCH_DAY_RUNBOOK.md`
- [ ] Post incident update to team
- [ ] Record bad release ID and restored release ID

---

## 5) Quick Commands (Local Verification)

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
```

---

## 6) 24h Sign-Off

- [ ] No critical incident in first 24h
- [ ] Error rates stable
- [ ] Core funnel (visit -> post/booking -> chat) healthy
- [ ] Team sign-off for “stable production”

