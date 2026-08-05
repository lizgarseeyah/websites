# lizgarseeyah.com — Portfolio + Secret-Door Dashboard

One deployable site that contains:

- a quiet **front door** (`index.html`) at the root,
- **8 fully independent websites**, each with its own design, content, and branding,
- a private **Cloud9 Ops dashboard**,

…all connected only by a hidden, PIN-gated **"secret door"** in the bottom-right corner of
every page. There is no visible navigation between the sites — the door is the only link.

---

## Quick facts

| | |
|---|---|
| **Portfolio PIN** | `3318` — reveals the 7 public sites |
| **Dashboard PIN** | `3318` — reveals the 7 sites **plus** the private dashboard |
| **Stay-unlocked** | Yes — enter the PIN once; it's remembered for the rest of the browser session (across all pages). Closing the browser, or clicking **Lock**, re-locks it. |
| **Hosting** | Static — deploy the repo root to Cloudflare Pages (or any static host) |
| **Domain** | `lizgarseeyah.com` (registered at GoDaddy, DNS on Cloudflare) |

> Both PINs are currently the same (`3318`), so entering it always reveals the dashboard
> too. If you later want the dashboard hidden from people you share the portfolio PIN with,
> set them to two different values (see "Changing the PINs").

---

## Folder structure

```
/                         repo root = what your domain serves
├── index.html            the front door (hosts the secret door)
├── shared/door-lock.js   the secret door — shared by every page
├── 01-ai-startup/        Nyra AI            (About, Contact · no socials)
├── 02-creative-agency/   Lumen & Co.        (About, Services, Work, Contact · @liriathome)
├── 03-sports-agency/     Baseline Group     (About, Services, Work, Contact · no socials)
├── 04-personal/          Liri               (About, Services, Work, Contact · @lirionthecourt)
├── 05-dj/                LIRI Sound         (About, Services, Work, Contact · @lirionthecourt)
├── 06-tech-consultant/   HarveStax          (Websites, Cloud, AI agents, dashboards · Contact form)
├── 07-real-estate/       Meridian Realty    (About, Contact · @liriathome, IG/TikTok)
├── 08-apparel/           Liri Co.           (Lines, Shop preview, Lookbook, Story, Signup · @liriathome)
├── dashboard/            Cloud9 Ops dashboard (static frontend)
│   ├── index.html
│   └── assets/           scripts + styles
├── _backend/             dashboard's Node API — LOCAL ONLY (see "Dashboard data")
│   ├── server.js, routes/, services/
│   └── .env.example      copy to .env and fill in for local use
├── CNAME                 lizgarseeyah.com
├── .nojekyll             serve files as-is on GitHub/Cloudflare Pages
├── .gitignore            keeps secrets + node_modules out of git
├── README.md            (this file)
└── INTEGRATION.md        deeper deployment notes + alternatives
```

Each site folder is standalone: its own `index.html`, `styles.css`, `app.js`, and a branded
`og.svg` social-share image. Every page has a skippable intro that respects
`prefers-reduced-motion`, a skip-link, semantic HTML, and Open Graph/meta tags.

---

## How the secret door works

A subtle lock icon sits at the bottom-right of every page. Click it → four digit inputs
appear. Enter a valid PIN:

- **Portfolio PIN** → dropdown of the 7 public sites (current page marked "you are here").
- **Dashboard PIN** → the same 7 plus a highlighted **Cloud9 Ops Dashboard** link.
- Wrong code → the panel shakes and clears.

Once unlocked, the state is saved for the **browser session**: move between any pages without
re-entering the PIN. A **Lock** button in the unlocked panel clears it immediately; otherwise
it clears when you close the browser. (Stored in `sessionStorage`, so an unlocked state never
outlives the session.)

The door respects `prefers-reduced-motion`, closes on outside-click or Escape, supports paste
of a 4-digit code, and is fully keyboard-navigable.

### Changing the PINs
Edit the two constants near the top of `shared/door-lock.js`:
```js
var DEFAULT_PIN   = '3318'; // portfolio (public sites)
var DASHBOARD_PIN = '3318'; // private — also reveals the dashboard
```
Per-page overrides are available via `data-pin="…"` and `data-dashboard-pin="…"` on the
`<script>` tag.

> **Security note.** This is *client-side obfuscation, not authentication.* Anyone who views
> the page source can read both PINs and the dashboard URL. It keeps the dashboard out of
> sight for casual visitors and search engines (the dashboard page is also `noindex`), but it
> does not protect sensitive data. If the dashboard ever shows private information, put it
> behind real auth.

---

## Deploying (Cloudflare Pages — your setup)

Your domain's DNS runs through **Cloudflare**, and the apex already serves a Cloudflare Pages
project. The cleanest path is to deploy this repo to Cloudflare Pages and let it own the apex.

1. **Push to GitHub** from the repo root:
   ```bash
   git init
   git add -A
   git commit -m "Merged portfolio + secret-door dashboard"
   git branch -M main
   git remote add origin https://github.com/lizgarseeyah/<repo>.git
   git push -u origin main
   ```
   (Reuse the repo your current Cloudflare Pages project builds from to update in place, or
   create a new repo and a new Pages project.)

2. **Cloudflare → Workers & Pages.** Either let your existing project rebuild from the pushed
   repo, or **Create application → Pages → Connect to Git**, pick the repo, and set:
   - Framework preset: **None**
   - Build command: *(blank)*
   - Build output directory: `/`

3. **Custom domains → Set up a custom domain →** `lizgarseeyah.com`. Cloudflare updates the
   apex DNS for you (no manual record editing). HTTPS is automatic.

Full step-by-step, plus the GitHub-Pages-on-a-subdomain alternative and the apex A-record
variant, are in **INTEGRATION.md**.

### Local preview
```bash
python3 -m http.server 8000
# http://localhost:8000/            front door (try the secret door)
# http://localhost:8000/dashboard/  dashboard
```
Serve from the repo root so the door-lock's relative links resolve.

---

## Dashboard data (important)

The dashboard *renders* as static files, but its interactive features — to-do Kanban, stocks
portfolio/screener, prayer wall, sins log, job-prep links — fetch from a local Node API at
`localhost:5001` / `127.0.0.1:5000`. **Static hosting (Cloudflare/GitHub Pages) cannot run
that backend**, so online those buttons won't return data unless you:

1. **Run it locally** (simplest, private to you):
   ```bash
   cd _backend
   cp .env.example .env     # fill in the values
   npm install
   node server.js
   ```
2. **Host the backend** on something that runs Node (Render, Railway, Fly, a VM), then change
   the `localhost` URLs in `dashboard/assets/scripts/Modules/*.js` and
   `dashboard/assets/scripts/scripts.js` to that host (and enable CORS for your domain).
3. **Leave it static** — the layout works; the live data simply won't load.

---

## Security fixes already applied
- The dashboard's original repo committed `backend/.env` and the whole `backend/node_modules/`.
  This repo ships **no `.env`** (only `_backend/.env.example` with empty keys) and a
  `.gitignore` that blocks `.env`, `*.env`, and `node_modules/`.
- Your `.env` was empty, so nothing leaked. If you ever committed real values to a public
  repo, rotate them (Google service-account key, `X_BEARER_TOKEN`) — treat them as exposed.
- The dashboard page is marked `noindex, nofollow`; the front door is `noindex`.

---

## Things you may still want to personalize
- Contact forms are client-side demos (validate + show a message; no email is sent). Wire to
  Formspree / Cloudflare / your own endpoint when ready.
- Real email addresses (currently placeholders).
- Real-estate: CA DRE license number (footer placeholder) and listing layout.
- If you host the dashboard backend, swap the `localhost` URLs as noted above.
