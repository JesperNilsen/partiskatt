# Deploy

## Netlify link (from `netlify.toml`)

`netlify.toml` already carries the build config; linking a site just points
Netlify at it.

1. In Netlify: **Add new site → Import an existing project**, connect the
   GitHub repo, pick the branch to build (usually `main`).
2. Netlify reads the settings straight from `netlify.toml` — nothing to
   type into the UI:
   - **Build command:** `npm run check` (typecheck + tests + `reconcile
     --check` + `data-status --check` + `vite build` — the whole gate runs
     on every deploy, so a red gate blocks the deploy instead of shipping a
     stale build).
   - **Publish directory:** `dist`
   - **Node version:** 24 (`build.environment.NODE_VERSION`)
   - **`REQUIRE_PARTY_TEXTS=1`** (since the 2026-09-28 rights call to ship
     the party texts): a missing party text fails the deploy, as it fails CI.
3. SPA routing (`/*` → `/index.html`, status 200) and the security headers
   (CSP with `connect-src 'none'`, `X-Frame-Options: DENY`,
   `Referrer-Policy: no-referrer`, etc.) are already in `[[redirects]]` /
   `[[headers]]` — no extra dashboard configuration needed.
4. After the first deploy, verify at 375/390 px that the beta banner,
   `/metode`, `/kilder` and `/rettelseslogg` all render, and that
   `npm run check`'s build step is what actually ran (check the deploy log's
   build command, not just that the site loaded).

**Which switches are Jesper's, not this checklist's:** making the GitHub
repo public, picking the production Netlify URL/custom domain and actually
linking it, and naming the project. This document only covers *how* to link
Netlify once those calls are made — it does not make them.

## Public-switch checklist

Run this before flipping the repo (or the Netlify site) from private to
public.

- [ ] **Rights call made.** `docs/rights.md`'s open decision (§"Open
      decision for Jesper") resolved — specifically, whether the eight party
      alternative-budget PDFs/HTML and their text extracts under
      `sources/raw/` and `sources/text/` ship in the public repo, are held
      back, or are scrubbed from history. Nothing in `sources/` has been
      removed by this lane; that call is still open. Whichever way it goes,
      the build itself does not block on it: `npm run check` (what Netlify
      runs) passes with those eight files withheld — the page-anchor checks
      that read them skip visibly instead of failing (see `docs/rights.md`
      §4). The private repo's GitHub Actions `check` job sets
      `REQUIRE_PARTY_TEXTS=1` so a file missing *there* still fails loudly;
      Netlify does not set that variable.
- [ ] **Name picked.** The project's public name (repo name, site title,
      any custom domain) — not decided by this lane.
- [ ] **Repo visibility switched deliberately**, not as a side effect of
      something else (e.g. inviting a collaborator, connecting a third-party
      integration that defaults to public).
- [ ] **CI green on the commit being published** — `npm run check` passing
      on `main` (or whichever branch becomes the public default), not just
      on a feature branch.
- [ ] **Gate-3 status note visible.** Confirm the app still says, honestly,
      that no rule is `confirmed` yet unless operatørport 3
      (`docs/gate-3.md`) has actually been run — i.e. `DATA_STATUS.md` and
      the in-app status badges reflect the real state, not an aspirational
      one. A public repo makes this claim checkable by anyone, so it has to
      be true at publish time, not just at the last time someone looked.
- [ ] **Netlify link and domain chosen** (see above) — Jesper's switch, not
      automated by CI.
