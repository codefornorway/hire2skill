# Hire2Skill Production Checklist

Use this before go-live. Mark each item with:
- `[x]` done
- `[ ]` pending

Suggested owner tags: `@dev`, `@ops`, `@product`.

---

## 1) Build, Type, Lint, Test (Release Gate)

- [x] `npm run build` passes. (`@dev`)
- [x] `npx tsc --noEmit` passes. (`@dev`)
- [x] `npm run lint` passes. (`@dev`)
- [x] E2E smoke tests pass. (`@dev`)
- [ ] CI required checks enforced in repo settings (block merge on failure). (`@ops`)

Notes:
- CI workflow is configured with `quality` and `e2e` jobs.

---

## 2) Environment & Secrets

- [ ] Production env vars configured in hosting platform. (`@ops`)
- [ ] Supabase project env/secrets configured for production. (`@ops`)
- [ ] `NEXT_PUBLIC_APP_URL` set to `https://hire2skill.com`. (`@ops`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` verified. (`@ops`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` present only server-side. (`@ops`)
- [ ] `RESEND_API_KEY` configured and validated. (`@ops`)
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` configured. (`@ops`)

Notes:
- `/api/health/env` exists for admin-only env readiness checks.

---

## 3) Security Hardening

- [x] Security headers set in `next.config.ts`. (`@dev`)
- [x] `X-Frame-Options`, `HSTS`, `Referrer-Policy`, CSP configured. (`@dev`)
- [x] Rate limits enabled for contact/notify/push APIs. (`@dev`)
- [ ] Supabase RLS policy audit completed for `profiles`, `posts`, `bookings`, `messages`, `reviews`, `push_subscriptions`. (`@ops`)
- [ ] Pen-test style auth/ownership checks completed on write APIs. (`@dev`)

Notes:
- Geolocation is allowed by policy because map/distance features require it.

---

## 4) Domain, Branding, and Links

- [x] App branding switched to `Hire2Skill`. (`@dev`)
- [x] Public domain references switched to `hire2skill.com`. (`@dev`)
- [ ] DNS records verified (A/AAAA/CNAME as needed). (`@ops`)
- [ ] SSL certificate active and auto-renewing. (`@ops`)
- [ ] Email sender domain for Resend verified (SPF/DKIM/DMARC). (`@ops`)

---

## 5) Core Functional Flows (Manual QA)

- [ ] Sign up / login / logout works on production URL. (`@qa`)
- [ ] Post task flow works end-to-end. (`@qa`)
- [ ] Tasker browse + filters + profile open works. (`@qa`)
- [ ] Booking request create / accept / decline / cancel works. (`@qa`)
- [ ] Chat thread and message notifications work. (`@qa`)
- [ ] Review flow works after completion. (`@qa`)
- [ ] Dashboard actions (reschedule, status updates, directions) work. (`@qa`)
- [ ] Location search resolves real street inputs (e.g. Karihaugen, Ekebergveien 5B). (`@qa`)
- [ ] Directions open correctly (Apple Maps on Apple devices, Google Maps otherwise). (`@qa`)

---

## 6) i18n & UX Quality

- [x] Major pages localized for `en/no/da/sv`. (`@dev`)
- [ ] Manual language switch QA on key pages (`/`, `/taskers`, `/services/[slug]`, `/post`, `/dashboard`, `/profile`). (`@qa`)
- [ ] Verify no hardcoded English remains in critical user flows. (`@qa`)
- [ ] Confirm legal page labels and links are correct in all locales. (`@qa`)

---

## 7) Performance & SEO

- [ ] Lighthouse (mobile + desktop) run on production URL. (`@qa`)
- [ ] Largest contentful elements optimized if score is low. (`@dev`)
- [x] Metadata and sitemap routes exist and build successfully. (`@dev`)
- [ ] Search Console + analytics properties connected to production domain. (`@ops`)

---

## 8) Monitoring & Incident Readiness

- [ ] Error/alert monitoring enabled (API 5xx, notify failures, auth failures). (`@ops`)
- [ ] Log retention and access policy confirmed. (`@ops`)
- [ ] On-call contact and escalation path documented. (`@ops`)
- [ ] Rollback plan tested (previous deploy restore). (`@ops`)
- [ ] Backup/restore plan validated for Supabase data. (`@ops`)

---

## 9) Launch Approval

- [ ] Product owner sign-off. (`@product`)
- [ ] Engineering sign-off. (`@dev`)
- [ ] Operations sign-off. (`@ops`)
- [ ] Go-live window and communication prepared. (`@product`)

---

## Quick Commands

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
```

---

## Current Status Snapshot (from latest run)

- Build: PASS
- Typecheck: PASS
- E2E smoke: PASS
- API rate limiting: PRESENT
- Security headers: PRESENT
- Remaining work: deployment/env/DNS/RLS/monitoring/manual QA

