# Hire2Skill Launch Day Runbook

This is the exact deployment-day order. Keep this checklist open during release.

Use:
- `[ ]` pending
- `[x]` done

---

## 1) Freeze & Branch Protection
- [ ] Announce release window to team/support.
- [ ] Pause non-release merges to `main`.
- [ ] Confirm required CI checks are enabled in repository settings.

## 2) Final Local Verification
- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `npm run test:e2e`

## 3) Production Environment Verification
- [ ] Confirm hosting env vars are set:
  - `NEXT_PUBLIC_APP_URL=https://hire2skill.com`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
- [ ] Confirm no placeholder values (`your_*`) remain.

## 4) Domain & TLS
- [ ] DNS points to production hosting.
- [ ] SSL certificate is active for `hire2skill.com` and `www` (if used).
- [ ] Redirect policy (`www`/apex) is configured as intended.

## 5) Database & Access Safety
- [ ] Run/verify all required migrations in production.
- [ ] Validate Supabase RLS policies on core tables:
  - `profiles`, `posts`, `bookings`, `messages`, `reviews`, `push_subscriptions`
- [ ] Confirm service role key is server-only and never exposed client-side.

## 6) Deploy
- [ ] Deploy current release commit to production.
- [ ] Confirm deployment health check is green.

## 7) Smoke Test on Production URL
- [ ] Homepage loads and branding is correct (`Hire2Skill`).
- [ ] Taskers page loads; filters and cards work.
- [ ] Services page and service detail pages load.
- [ ] Post flow works (including location suggestions).
- [ ] Booking flow works (create + helper accept/decline).
- [ ] Chat works (send message + warning UX is clean).
- [ ] Dashboard actions work (directions + distance).

## 8) Notifications & Email
- [ ] Contact form sends successfully.
- [ ] Booking notification emails send.
- [ ] Chat/new-message notification flow works.
- [ ] Push subscription and push delivery tested on one device.

## 9) Monitoring & Alerts
- [ ] Confirm logs are visible in production.
- [ ] Enable/verify alerts:
  - API 5xx spikes
  - auth failures
  - notify/contact failures
- [ ] Confirm incident owner/on-call for launch day.

## 10) Performance & SEO Sanity
- [ ] Run quick Lighthouse check on production (`/`, `/taskers`, `/services/[slug]`).
- [ ] Verify sitemap and metadata resolve correctly.
- [ ] Verify favicon/app icons show new symbol-only icon.

## 11) Rollback Readiness
- [ ] Identify rollback target (previous stable deploy).
- [ ] Confirm rollback command/process is tested and documented.
- [ ] Confirm DB rollback/backups strategy for critical migrations.

## 12) Go-Live Signoff
- [ ] Product signoff
- [ ] Engineering signoff
- [ ] Ops signoff
- [ ] Public launch announcement

---

## Post-Launch (First 2 Hours)
- [ ] Watch error logs and performance dashboard continuously.
- [ ] Re-test booking/chat from a fresh user account.
- [ ] Check conversion funnel events are arriving.
- [ ] Capture any hotfixes in a launch notes doc.

---

## 5-Minute Emergency Rollback Checklist

Use this only if critical production issues are confirmed (e.g. auth broken, bookings blocked, severe 5xx spike).

1. **Declare incident**
   - [ ] Post in team channel: "Rollback in progress", assign incident owner.
2. **Stop exposure**
   - [ ] Pause active deploy pipeline / disable auto-promote.
3. **Rollback app**
   - [ ] Re-deploy last known good release from hosting dashboard/CLI.
4. **Verify core health**
   - [ ] Confirm `/`, `/taskers`, `/post`, `/chat`, `/dashboard` open.
   - [ ] Confirm API error rate drops.
5. **Database safety check**
   - [ ] If migration-related breakage: stop writes if needed and evaluate DB rollback plan.
   - [ ] Do **not** run destructive DB rollback without owner approval.
6. **Comms**
   - [ ] Update team/support with status and ETA.
   - [ ] Log exact rollback time and release IDs (bad -> restored).
7. **Stabilize**
   - [ ] Keep monitoring for 30–60 min.
   - [ ] Open hotfix task with root cause and prevention actions.

