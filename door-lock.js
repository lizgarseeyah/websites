/* =============================================================================
   Portfolio Door-Lock — shared hidden navigation component
   -----------------------------------------------------------------------------
   The ONLY visible connection between the 7 otherwise-independent sites.
   Renders a subtle corner door+lock icon. Click -> 4-digit PIN entry.
   Correct PIN -> dropdown linking to every other site. Wrong -> shake + locked.

   USAGE (add to every site, just before </body>):
     <script src="door-lock.js" data-site="ai-startup" defer></script>

   The data-site attribute marks the CURRENT site so it is excluded/labelled
   in the dropdown. Optional: data-pin="1234" to override the default PIN
   on a per-site basis (otherwise DEFAULT_PIN below is used everywhere).

   CHANGE THE PIN: edit DEFAULT_PIN below (single source of truth), OR set
   data-pin on the <script> tag per site. The PIN check is intentionally
   client-side only (this is obfuscation, not real security — see deploy notes).

   PRIVATE DASHBOARD: a second code, DASHBOARD_PIN, reveals an extra link to
   your Cloud9 Ops dashboard on top of the 7 public sites. The regular PIN
   never shows it. Override per-site with data-dashboard-pin on the <script>.
   (Still client-side obfuscation — see SECURITY note in INTEGRATION.md.)
   ============================================================================ */
(function () {
  'use strict';

  // --- CONFIG ---------------------------------------------------------------
  var DEFAULT_PIN   = '3318'; // <-- portfolio PIN: reveals the 7 public sites
  var DASHBOARD_PIN = '3318'; // <-- PRIVATE PIN: also reveals your Cloud9 Ops dashboard.
                              //     Keep this one to yourself. Entering it shows the 7
                              //     sites PLUS the private Dashboard link; the normal
                              //     portfolio PIN never reveals the dashboard.

  // The full portfolio map. Update href values to your deployed URLs.
  // `key` must match each site's data-site attribute.
  var SITES = [
    { key: 'ai-startup',      label: 'Nyra AI',          href: '../01-ai-startup/index.html' },
    { key: 'creative-agency', label: 'Lumen & Co.',      href: '../02-creative-agency/index.html' },
    { key: 'sports-agency',   label: 'Baseline Group',   href: '../03-sports-agency/index.html' },
    { key: 'personal',        label: 'Liri',             href: '../04-personal/index.html' },
    { key: 'dj',              label: 'LIRI Sound',       href: '../05-dj/index.html' },
    { key: 'tech-consultant', label: 'Aegis Advisory',   href: '../06-tech-consultant/index.html' },
    { key: 'real-estate',     label: 'Meridian Realty',  href: '../07-real-estate/index.html' }
  ];

  // Private destination, only revealed by DASHBOARD_PIN. `key` 'dashboard' so it
  // is marked "you are here" when the door-lock is loaded on the dashboard itself.
  var DASHBOARD = { key: 'dashboard', label: 'Cloud9 Ops Dashboard', href: '../dashboard/index.html' };

  // --- SETUP ----------------------------------------------------------------
  var script = document.currentScript;
  var CURRENT = (script && script.getAttribute('data-site')) || '';
  var PIN = (script && script.getAttribute('data-pin')) || DEFAULT_PIN;
  var DASH_PIN = (script && script.getAttribute('data-dashboard-pin')) || DASHBOARD_PIN;

  // Resolve link targets relative to the site ROOT, not the current folder, so
  // the same component works from the root landing page (home) and from any
  // sub-folder (the 7 sites + the dashboard). The hrefs in SITES/DASHBOARD are
  // written relative to root; we prefix with '../' only when we're one level deep.
  // Override with data-base on the <script> tag if you nest deeper.
  var BASE = script && script.getAttribute('data-base');
  if (BASE == null) { BASE = (CURRENT === 'home') ? './' : '../'; }
  function resolve(href) { return BASE + href.replace(/^\.\.\//, ''); }

  // --- SESSION MEMORY -------------------------------------------------------
  // Once the correct PIN is entered, remember it for the rest of the browser
  // session so navigating between pages doesn't re-prompt. Cleared when the
  // browser/tab is fully closed (sessionStorage), so an unlocked state never
  // outlives the session. Two levels: 'portfolio' (7 sites) or 'dashboard'
  // (7 sites + private dashboard link).
  var SS_KEY = 'dl-unlock';
  function saveUnlock(level) {
    try { sessionStorage.setItem(SS_KEY, level); } catch (e) {}
  }
  function readUnlock() {
    try { return sessionStorage.getItem(SS_KEY); } catch (e) { return null; }
  }
  function clearUnlock() {
    try { sessionStorage.removeItem(SS_KEY); } catch (e) {}
  }

  // --- STYLES (scoped, injected, theme-neutral, respects reduced motion) ----
  var css = '' +
  '.dl-root{position:fixed;bottom:18px;right:18px;z-index:2147483000;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
  '.dl-toggle{width:44px;height:44px;border:0;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(20,20,22,.82);color:#fff;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 4px 18px rgba(0,0,0,.28);transition:transform .18s ease,background .18s ease,opacity .18s ease;opacity:.55}' +
  '.dl-toggle:hover,.dl-toggle:focus-visible{opacity:1;transform:translateY(-2px)}' +
  '.dl-toggle:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
  '.dl-toggle svg{width:22px;height:22px;display:block}' +
  '.dl-panel{position:absolute;bottom:54px;right:0;width:248px;background:rgba(24,24,27,.96);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,.45);color:#f4f4f5;opacity:0;transform:translateY(8px) scale(.98);pointer-events:none;transition:opacity .2s ease,transform .2s ease}' +
  '.dl-panel.dl-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}' +
  '.dl-title{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#a1a1aa;margin:0 0 12px}' +
  '.dl-pinrow{display:flex;gap:8px;justify-content:space-between;margin-bottom:12px}' +
  '.dl-digit{width:48px;height:56px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);border-radius:10px;color:#fff;font-size:22px;text-align:center;font-variant-numeric:tabular-nums;-moz-appearance:textfield}' +
  '.dl-digit::-webkit-outer-spin-button,.dl-digit::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}' +
  '.dl-digit:focus{outline:none;border-color:#fff;background:rgba(255,255,255,.09)}' +
  '.dl-hint{font-size:11px;color:#71717a;margin:0;min-height:14px}' +
  '.dl-hint.dl-err{color:#f87171}' +
  '.dl-links{list-style:none;margin:0;padding:0}' +
  '.dl-links li{margin:0}' +
  '.dl-links a{display:flex;align-items:center;justify-content:space-between;padding:9px 10px;border-radius:8px;color:#e4e4e7;text-decoration:none;font-size:14px;transition:background .15s ease}' +
  '.dl-links a:hover,.dl-links a:focus-visible{background:rgba(255,255,255,.08);outline:none}' +
  '.dl-links a[aria-current="page"]{color:#71717a;pointer-events:none}' +
  '.dl-links a[aria-current="page"]::after{content:"you are here";font-size:10px;letter-spacing:.05em;color:#52525b}' +
  '.dl-links a.dl-private{color:#a5b4fc}' +
  '.dl-links a.dl-private span::before{content:"\\2022 ";color:#6366f1}' +
  '.dl-links a.dl-private:hover,.dl-links a.dl-private:focus-visible{background:rgba(99,102,241,.16)}' +
  '.dl-lock{margin-top:10px;width:100%;border:1px solid rgba(255,255,255,.14);background:transparent;color:#a1a1aa;font-size:12px;letter-spacing:.04em;padding:8px;border-radius:8px;cursor:pointer;transition:background .15s ease,color .15s ease}' +
  '.dl-lock:hover,.dl-lock:focus-visible{background:rgba(255,255,255,.06);color:#f4f4f5;outline:none}' +
  '.dl-shake{animation:dl-shake .4s}' +
  '@keyframes dl-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}' +
  '@media (prefers-reduced-motion: reduce){.dl-toggle,.dl-panel{transition:none}.dl-shake{animation:none}}';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // --- MARKUP ---------------------------------------------------------------
  var root = document.createElement('div');
  root.className = 'dl-root';

  var lockedIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var openIcon   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-1.5"/></svg>';

  root.innerHTML =
    '<button class="dl-toggle" aria-haspopup="dialog" aria-expanded="false" aria-label="Portfolio access — locked">' + lockedIcon + '</button>' +
    '<div class="dl-panel" role="dialog" aria-label="Enter portfolio PIN" aria-modal="false">' +
      '<p class="dl-title" data-stage="pin">Enter access code</p>' +
      '<div class="dl-pinrow" data-stage="pin">' +
        '<input class="dl-digit" type="text" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit 1">' +
        '<input class="dl-digit" type="text" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit 2">' +
        '<input class="dl-digit" type="text" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit 3">' +
        '<input class="dl-digit" type="text" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit 4">' +
      '</div>' +
      '<p class="dl-hint" data-stage="pin" role="status" aria-live="polite"></p>' +
    '</div>';

  document.body.appendChild(root);

  // --- BEHAVIOR -------------------------------------------------------------
  var toggle = root.querySelector('.dl-toggle');
  var panel = root.querySelector('.dl-panel');
  var digits = Array.prototype.slice.call(root.querySelectorAll('.dl-digit'));
  var hint = root.querySelector('.dl-hint');
  var unlocked = false;

  function openPanel() {
    panel.classList.add('dl-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (!unlocked && digits[0]) { digits[0].focus(); }
  }
  function closePanel() {
    panel.classList.remove('dl-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    panel.classList.contains('dl-open') ? closePanel() : openPanel();
  });

  // Close on outside click / Escape
  document.addEventListener('click', function (e) {
    if (!root.contains(e.target)) closePanel();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  function readPin() { return digits.map(function (d) { return d.value; }).join(''); }

  function fail() {
    hint.textContent = 'Wrong code. Try again.';
    hint.classList.add('dl-err');
    panel.classList.remove('dl-shake');
    void panel.offsetWidth; // reflow to restart animation
    panel.classList.add('dl-shake');
    digits.forEach(function (d) { d.value = ''; });
    if (digits[0]) digits[0].focus();
  }

  function unlock(includeDashboard, restoring) {
    unlocked = true;
    toggle.innerHTML = openIcon;
    toggle.setAttribute('aria-label', 'Portfolio access — unlocked');

    if (!restoring) { saveUnlock(includeDashboard ? 'dashboard' : 'portfolio'); }

    var list = SITES.slice();
    if (includeDashboard) list.push(DASHBOARD);

    var items = list.map(function (s) {
      var current = s.key === CURRENT;
      var cls = (s.key === 'dashboard') ? ' class="dl-private"' : '';
      return '<li><a href="' + resolve(s.href) + '"' + cls +
        (current ? ' aria-current="page"' : '') +
        '><span>' + s.label + '</span></a></li>';
    }).join('');

    panel.innerHTML =
      '<p class="dl-title">' + (includeDashboard ? 'Portfolio + private' : 'Portfolio') + '</p>' +
      '<ul class="dl-links">' + items + '</ul>' +
      '<button class="dl-lock" type="button">Lock</button>';

    var lockBtn = panel.querySelector('.dl-lock');
    if (lockBtn) {
      lockBtn.addEventListener('click', function () {
        clearUnlock();
        relock();
      });
    }
    if (!restoring) { panel.classList.add('dl-open'); }
  }

  // Return the door to its locked state (used by the Lock button).
  function relock() {
    unlocked = false;
    toggle.innerHTML = lockedIcon;
    toggle.setAttribute('aria-label', 'Portfolio access — locked');
    panel.innerHTML =
      '<p class="dl-title">Enter access code</p>' +
      '<div class="dl-pinrow">' +
        '<input class="dl-digit" type="text" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit 1">' +
        '<input class="dl-digit" type="text" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit 2">' +
        '<input class="dl-digit" type="text" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit 3">' +
        '<input class="dl-digit" type="text" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="Digit 4">' +
      '</div>' +
      '<p class="dl-hint" role="status" aria-live="polite"></p>';
    // rebind digit inputs on the fresh markup
    digits = Array.prototype.slice.call(panel.querySelectorAll('.dl-digit'));
    hint = panel.querySelector('.dl-hint');
    bindDigits();
    closePanel();
  }

  function check() {
    if (readPin().length === 4) {
      var entered = readPin();
      if (entered === DASH_PIN) { unlock(true); }
      else if (entered === PIN) { unlock(false); }
      else { fail(); }
    }
  }

  function bindDigits() {
    digits.forEach(function (input, i) {
      input.addEventListener('input', function () {
        input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
        if (hint) { hint.classList.remove('dl-err'); hint.textContent = ''; }
        if (input.value && digits[i + 1]) digits[i + 1].focus();
        check();
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !input.value && digits[i - 1]) {
          digits[i - 1].focus();
        }
      });
      input.addEventListener('paste', function (e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '').slice(0, 4);
        text.split('').forEach(function (ch, idx) { if (digits[idx]) digits[idx].value = ch; });
        check();
      });
    });
  }

  bindDigits();

  // If unlocked earlier this browser session, restore the dropdown silently
  // (no PIN re-entry) but leave the panel closed until the user clicks.
  var prior = readUnlock();
  if (prior === 'dashboard') { unlock(true, true); }
  else if (prior === 'portfolio') { unlock(false, true); }
})();
