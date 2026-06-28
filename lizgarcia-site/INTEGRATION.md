# Integration & Deployment Guide

This repo merges two things into one deployable site:

1. **The portfolio** — a root landing page plus 7 independent sites, linked only by the
   hidden PIN-gated "secret door" (bottom-right corner of every page).
2. **The Cloud9 Ops dashboard** — your private workflow dashboard, reachable only through
   the secret door's *second* PIN.

Everything is static and deploys to GitHub Pages on your custom subdomain. The dashboard's
optional Node backend lives in `_backend/` for local use (see the important caveat below).

---

## Repo structure

```
/                         <- repo root = what your subdomain serves
├── index.html            front door (the "LG" landing page; hosts the secret door)
├── shared/door-lock.js   the secret door (shared by every page)
├── 01-ai-startup/        Nyra AI
├── 02-creative-agency/   Lumen & Co.
├── 03-sports-agency/     Baseline Group
├── 04-personal/          Liri
├── 05-dj/                LIRI Sound
├── 06-tech-consultant/   Aegis Advisory
├── 07-real-estate/       Meridian Realty
├── dashboard/            Cloud9 Ops dashboard (static frontend)
│   ├── index.html
│   └── assets/ (scripts, styles)
├── _backend/             dashboard's Node/Express API — LOCAL ONLY, not served by Pages
│   ├── server.js, routes/, services/
│   └── .env.example      copy to .env and fill in for local use
├── CNAME                 your custom subdomain (one line)
├── .nojekyll             tells GitHub Pages to serve files as-is
└── .gitignore            keeps secrets and node_modules out of git
```

The leading-underscore `_backend/` is a convention for "not part of the published site."
With `.nojekyll` present, GitHub Pages still uploads it, but nothing links to it, so it's
effectively dormant online. If you'd rather it not ship at all, delete the folder before
pushing — the static dashboard doesn't need it to render.

---

## The two PINs (the secret door)

The door lives in `shared/door-lock.js`. There are two codes:

- **Portfolio PIN** (`DEFAULT_PIN`, currently `3318`) — reveals the 7 public sites.
- **Dashboard PIN** (`DASHBOARD_PIN`, currently `3318`) — reveals the 7 sites **plus** a
  private "Cloud9 Ops Dashboard" link.

Both are currently set to the same value (`3318`), so entering it always reveals the
dashboard too. To hide the dashboard from people you share the portfolio PIN with, set the
two constants to different values.

**Stay-unlocked:** once you enter a valid PIN, the door stays unlocked for the rest of the
browser session — navigate between any pages without re-entering it. A **Lock** button in the
unlocked panel re-locks immediately; otherwise it clears when you close the browser. (State
is kept in `sessionStorage`, so it never outlives the session.)

**To change either PIN:** edit the two constants near the top of `shared/door-lock.js`:

```js
var DEFAULT_PIN   = '3318'; // public sites
var DASHBOARD_PIN = '3318'; // private — also reveals the dashboard
```

Per-page overrides are supported via attributes on the script tag:
`data-pin="…"` and `data-dashboard-pin="…"`.

> **Security reality check.** This is *client-side obfuscation, not authentication.*
> Anyone who opens the page source can read both PINs and the dashboard URL. It keeps the
> dashboard out of sight for normal visitors and search engines, but it does **not** protect
> sensitive data. The dashboard page also carries `<meta name="robots" content="noindex">`
> equivalents only if you add them — see "Hardening" below. If the dashboard ever shows
> private information, gate it with real auth (the Node backend + a login, or host the
> dashboard behind an authenticated service), not the PIN.

---

## Deploying to GitHub Pages on a custom subdomain

You chose a **subdomain** (e.g. `app.lizgarseeyah.com` or `www.lizgarseeyah.com`).
Subdomains use a **CNAME DNS record**, which is the clean, recommended setup for Pages.

### 1. Put the repo on GitHub
Create a repo (e.g. `lizgarseeyah/site`), then from this folder:
```bash
git init
git add -A
git commit -m "Portfolio + secret-door dashboard"
git branch -M main
git remote add origin https://github.com/lizgarseeyah/site.git
git push -u origin main
```

### 2. Turn on Pages
Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.

### 3. Set the custom domain
- In **Settings → Pages → Custom domain**, enter your subdomain (e.g. `app.lizgarseeyah.com`)
  and Save. GitHub writes/expects a `CNAME` file at the repo root — this repo already
  includes one (edit it to your exact subdomain if it differs).
- Tick **Enforce HTTPS** once the certificate is issued (can take a few minutes to an hour).

### 4. Add the DNS record at your domain host
At wherever `lizgarseeyah.com`'s DNS is managed, add **one CNAME record**:

| Type  | Name / Host           | Value (points to)            | TTL     |
|-------|-----------------------|------------------------------|---------|
| CNAME | `app` (the subdomain) | `lizgarseeyah.github.io.`    | default |

- "Name/Host" is just the subdomain label (`app`, `www`, etc.), not the full domain.
- "Value" is **`<your-github-username>.github.io`** — note: the *username*, not the repo.
- Do **not** use an A record for a subdomain; CNAME is correct here. (A records with
  GitHub's IPs are only for an apex/root domain like `lizgarseeyah.com` with no subdomain.)

DNS can take anywhere from a few minutes to ~24 hours to propagate. Once it resolves and
the cert is issued, your subdomain serves the front door, and the secret door works from
there into the 7 sites and (with the dashboard PIN) the dashboard.

### About changing your domain
You mentioned wanting to change the domain in GoDaddy. Two separate things:
- **Where DNS is hosted** (the nameservers) vs. **the records** (the CNAME above). You only
  need to add the CNAME wherever the domain's DNS currently lives. You don't have to move
  the registrar to use it with Pages.
- If you point an **apex** domain (`lizgarseeyah.com` with no subdomain) at Pages later,
  that needs four `A` records (and/or `AAAA`) to GitHub's IPs instead of a CNAME, plus the
  apex in the `CNAME` file. Ask me and I'll lay out that variant.

---

## The dashboard backend — important caveat

The dashboard frontend renders fine as static files, but its **interactive features**
(to-do Kanban, stocks portfolio/screener, prayer wall, sins log, job prep links) fetch from
a local Node API:

```
http://localhost:5001/...     (todo, stocks, spirituality, OE)
http://127.0.0.1:5000/...     (python trader)
```

**GitHub Pages cannot run that backend** — it only serves static files. So on the live
subdomain those buttons will fail quietly for anyone who isn't also running the backend on
their own machine. Given the dashboard is private to you, that may be fine: run the backend
locally and use the dashboard locally. Three options:

1. **Local only (simplest).** Run the backend on your machine; use the live site for the
   portfolio and the *static shell* of the dashboard, and use `localhost` when you want the
   live data. To run it:
   ```bash
   cd _backend
   cp .env.example .env      # then fill in the values
   npm install
   node server.js            # serves the API on its configured port
   ```
2. **Host the backend somewhere** that runs Node (Render, Railway, Fly, a small VM), then
   change the hardcoded `localhost` URLs in `dashboard/assets/scripts/Modules/*.js` and
   `dashboard/assets/scripts/scripts.js` to that host's HTTPS URL. (Search for `localhost`
   and `127.0.0.1` — there are a handful.) Add CORS for your subdomain on the backend.
3. **Drop the dynamic features online** and keep the dashboard as a static layout. No action
   needed; just know the fetches won't resolve.

If you want option 2, tell me where you'll host it and I'll do the URL swap and CORS wiring.

---

## Security fixes already applied

- The original `Cloud9Ops-Dashboard` repo **tracked `backend/.env` in git** and committed
  the entire `backend/node_modules/`. In this merged repo:
  - `.env` is **not** included — only `_backend/.env.example` with empty keys.
  - `.gitignore` now excludes `.env`, `*.env`, and `node_modules/` so you won't commit
    secrets or huge dependency trees by accident.
  - The `.env` you had was empty, so nothing leaked — but if you ever filled the real one in
    that public repo, **rotate those credentials** (Google service-account key, `X_BEARER_TOKEN`):
    treat them as exposed once they've been in a public repo's history.

## Optional hardening
- Add `<meta name="robots" content="noindex">` to `dashboard/index.html` so search engines
  don't index the dashboard even if someone links it. (The root front door already has it.)
- Consider moving the dashboard behind real auth if it will ever display private data.

---

## Local preview of the whole site
From the repo root:
```bash
python3 -m http.server 8000
# http://localhost:8000/                -> front door (try the secret door)
# http://localhost:8000/dashboard/      -> dashboard
```
Serving from the root makes the door-lock's relative links resolve correctly.
