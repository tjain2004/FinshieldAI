/* ================================================================
   FinShield AI — new1.js
   ----------------------------------------------------------------
   New navigation shell, loaded after static/dashboard.js and new.js.
   It never rewrites a page: it hides the old sidebar, adds a header
   with four main tabs and drives the dashboard's own router
   (showPage / .nav-item clicks), so every loader keeps working.

     Main tabs     Overview · User Portal · Investigation Workbench ·
                   Live Prediction
     Sub-tabs      under Overview: Summary + notebooks 01–10
     Palette       ⌘K / Ctrl+K — jump to any page, or look up
                   TX-…, AML-…, ACC-… directly
     Shortcuts     Alt+1…4 main tabs · [ / ] previous / next notebook
     Deep links    #/overview/eda · #/workbench · #/portal · #/live
   ================================================================ */
(function () {
  'use strict';
  const $id = id => document.getElementById(id);
  const shell = $id('fs1-shell');
  if (!shell || typeof showPage !== 'function') {
    console.error('new1.js: shell markup or dashboard router missing — keeping the original layout.');
    return;
  }

  /* ---------- information architecture ---------- */
  const SUBS = [
    ['overview', 'Summary', '◎'],
    ['cleaning', 'Cleaning', '01'],
    ['eda', 'EDA', '02'],
    ['features', 'Features', '03'],
    ['preprocessing', 'Preprocessing', '04'],
    ['mlmodels', 'ML Models', '05'],
    ['cnn', 'CNN-1D', '06'],
    ['lstm', 'LSTM', '07'],
    ['graph', 'Graph', '08'],
    ['shap', 'SHAP', '09'],
    ['risk', 'Risk Engine', '10'],
  ];
  const FULL = {
    cleaning: 'Data Cleaning', eda: 'Exploratory Data Analysis', features: 'Feature Engineering',
    preprocessing: 'Preprocessing', mlmodels: 'ML Model Comparison', cnn: 'CNN-1D Deep Learning',
    lstm: 'LSTM Deep Learning', graph: 'Graph Network Analysis', shap: 'SHAP Explainability',
    risk: 'Risk Scoring Engine',
  };
  const GROUPS = {
    overview: { label: 'Overview', pages: SUBS.map(s => s[0]) },
    portal: { label: 'User Portal', pages: ['portal'] },
    workbench: { label: 'Investigation Workbench', pages: ['workbench'] },
    live: { label: 'Live Prediction', pages: ['live'] },
  };
  const ORDER = ['overview', 'portal', 'workbench', 'live'];
  const groupOf = page => ORDER.find(g => GROUPS[g].pages.includes(page)) || 'overview';
  const lastSub = { overview: 'overview' };
  let current = null;

  /* ---------- mount the shell ---------- */
  const main = document.querySelector('.main');
  const content = $id('content');
  const head = $id('fs1-head');
  main.insertBefore(head, main.firstChild);
  const subWrap = $id('fs1-sub-wrap');
  content.insertBefore(subWrap, content.firstChild);
  document.body.appendChild($id('fs1-pal'));
  document.body.appendChild($id('fs1-toast'));
  // keep the dashboard's own live chips (they are updated by dashboard.js)
  const right = $id('fs1-right');
  document.querySelectorAll('.topbar-right .chip').forEach(c => right.appendChild(c));
  shell.remove();
  document.body.classList.add('fs1');

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
  $id('fs1-kbd').textContent = isMac ? '⌘ K' : 'Ctrl K';

  /* ---------- sub-tabs (pipeline stepper) ---------- */
  const sub = $id('fs1-sub');
  sub.innerHTML = SUBS.map(([p, label, n]) =>
    `<button class="fs1-step" data-page="${p}" role="tab"><span class="n">${n}</span>${label}</button>`).join('');
  sub.addEventListener('click', e => {
    const b = e.target.closest('.fs1-step');
    if (b) go(b.dataset.page);
  });
  $id('fs1-prev').addEventListener('click', () => step(-1));
  $id('fs1-next').addEventListener('click', () => step(1));

  /* ---------- main tabs ---------- */
  const tabs = $id('fs1-tabs');
  const ind = tabs.querySelector('.fs1-ind');
  tabs.addEventListener('click', e => {
    const t = e.target.closest('.fs1-tab');
    if (t) openGroup(t.dataset.group);
  });
  head.querySelector('.fs1-brand').addEventListener('click', () => go('overview'));

  function moveIndicator() {
    const on = tabs.querySelector('.fs1-tab.on');
    if (!on) return;
    ind.style.left = on.offsetLeft + 'px';
    ind.style.width = on.offsetWidth + 'px';
  }
  window.addEventListener('resize', moveIndicator);

  /* ---------- routing ---------- */
  function go(page) {
    const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (nav) nav.click();          // also fires new.js's own nav listeners
    else showPage(page);
  }
  function openGroup(g) {
    go(g === 'overview' ? (lastSub.overview || 'overview') : GROUPS[g].pages[0]);
  }
  function step(d) {
    if (groupOf(current) !== 'overview') return;
    const i = SUBS.findIndex(s => s[0] === current);
    const j = i + d;
    if (j >= 0 && j < SUBS.length) go(SUBS[j][0]);
  }

  const origShowPage = window.showPage;
  window.showPage = function (name) {
    origShowPage(name);
    sync(name);
  };

  function sync(name) {
    const prev = current;
    current = name;
    const g = groupOf(name);
    if (g === 'overview') lastSub.overview = name;

    tabs.querySelectorAll('.fs1-tab').forEach(t => t.classList.toggle('on', t.dataset.group === g));
    moveIndicator();

    subWrap.hidden = g !== 'overview';
    if (g === 'overview') {
      const idx = SUBS.findIndex(s => s[0] === name);
      sub.querySelectorAll('.fs1-step').forEach((b, i) => {
        b.classList.toggle('on', i === idx);
        b.classList.toggle('done', i < idx);
      });
      const on = sub.querySelector('.fs1-step.on');
      if (on) sub.scrollTo({ left: on.offsetLeft - sub.clientWidth / 2 + on.offsetWidth / 2, behavior: prev ? 'smooth' : 'auto' });
      $id('fs1-bar').style.width = (idx / (SUBS.length - 1) * 100) + '%';
      $id('fs1-prev').disabled = idx <= 0;
      $id('fs1-next').disabled = idx >= SUBS.length - 1;
      const s = SUBS[idx];
      $id('fs1-sub-title').innerHTML = idx === 0
        ? 'Overview · <b>Executive summary</b> — the pipeline, notebook by notebook →'
        : `Notebook <b>${s[2]}</b> of 10 · <b>${FULL[s[0]] || s[1]}</b>`;
    }

    const hash = '#/' + g + (g === 'overview' && name !== 'overview' ? '/' + name : '');
    if (location.hash !== hash) history.replaceState(null, '', hash);
    const title = g === 'overview' && name !== 'overview'
      ? (FULL[name] || name) : GROUPS[g].label;
    document.title = `${title} · FinShield AI`;
    if (prev !== name) countUpPage(name);
  }

  /* ---------- prev / next pager on notebook pages ---------- */
  SUBS.forEach(([p], i) => {
    if (i === 0) return;
    const pg = $id('pg-' + p);
    if (!pg) return;
    const prev = SUBS[i - 1], next = SUBS[i + 1];
    const el = document.createElement('div');
    el.className = 'fs1-pager';
    el.innerHTML =
      `<button class="fs1-pg prev" data-to="${prev[0]}"><small>← Previous</small>${prev[2] === '◎' ? 'Summary' : prev[2] + ' · ' + (FULL[prev[0]] || prev[1])}</button>` +
      (next ? `<button class="fs1-pg next" data-to="${next[0]}"><small>Next →</small>${next[2]} · ${FULL[next[0]] || next[1]}</button>`
            : `<button class="fs1-pg next" data-group="live"><small>Next →</small>Live Prediction</button>`);
    el.addEventListener('click', e => {
      const b = e.target.closest('.fs1-pg');
      if (!b) return;
      if (b.dataset.to) go(b.dataset.to); else openGroup(b.dataset.group);
    });
    pg.appendChild(el);
  });

  /* ---------- scroll progress ---------- */
  content.addEventListener('scroll', () => {
    const max = content.scrollHeight - content.clientHeight;
    $id('fs1-progress').style.width = (max > 0 ? content.scrollTop / max * 100 : 0) + '%';
  }, { passive: true });

  /* ---------- alert badge on the Workbench tab ---------- */
  const chip = $id('chip-alerts');
  const badge = $id('fs1-badge-wb');
  function syncBadge() {
    const m = chip && chip.textContent.match(/[\d,]+/);
    if (m) {
      const n = Number(m[0].replace(/,/g, ''));
      badge.textContent = n >= 1000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1) + 'K' : String(n);
      badge.hidden = false;
      badge.title = `${m[0]} alerts in the queue`;
      moveIndicator();
    }
  }
  if (chip) { new MutationObserver(syncBadge).observe(chip, { childList: true, characterData: true, subtree: true }); syncBadge(); }

  /* ---------- count-up for headline stats ---------- */
  const NUM = /^(\D{0,2}?)(-?\d{1,3}(?:,\d{3})+|-?\d+)(\.\d+)?(\s?%|\s?[x×])?$/;
  const counted = new WeakSet();
  function countUp(el) {
    if (counted.has(el)) return;
    const txt = el.textContent.trim();
    const m = txt.match(NUM);
    if (!m) return;
    counted.add(el);
    const [, pre, intPart, dec = '', suf = ''] = m;
    const target = Number((intPart + dec).replace(/,/g, ''));
    if (!isFinite(target) || target === 0) return;
    const decimals = dec ? dec.length - 1 : 0;
    const commas = intPart.includes(',');
    const fmt = v => pre + (commas
      ? v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : v.toFixed(decimals)) + suf;
    const t0 = performance.now(), dur = 900;
    let written = fmt(0);
    el.textContent = written;
    el.classList.add('fs1-counting');
    const tick = now => {
      if (el.textContent !== written) { el.classList.remove('fs1-counting'); return; } // app changed it — stop
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      written = p < 1 ? fmt(target * e) : txt;
      el.textContent = written;
      if (p < 1) requestAnimationFrame(tick); else el.classList.remove('fs1-counting');
    };
    requestAnimationFrame(tick);
  }
  function countUpPage(name) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pg = $id('pg-' + name);
    if (!pg || !GROUPS.overview.pages.includes(name) && name !== 'live') return;
    setTimeout(() => pg.querySelectorAll('.stat-val').forEach(countUp), 120);
  }

  /* ---------- command palette ---------- */
  const pal = $id('fs1-pal'), q = $id('fs1-pal-q'), list = $id('fs1-pal-list');
  const ICON = {
    tx: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>',
    acc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M8 7l8 0M7 8l4 8M17 8l-4 8"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 2 21h20Z"/><path d="M12 10v5M12 18v.5"/></svg>',
  };
  const PAGES = [
    { kind: 'Main', label: 'Overview', hint: 'Executive summary · transaction search · linked account network', run: () => go('overview'), ic: '◎' },
    { kind: 'Main', label: 'User Portal', hint: 'Screen a payment · phishing-link check', run: () => openGroup('portal'), ic: 'UP' },
    { kind: 'Main', label: 'Investigation Workbench', hint: 'Alert queue · why flagged · linked accounts · SAR', run: () => openGroup('workbench'), ic: 'WB' },
    { kind: 'Main', label: 'Live Prediction', hint: 'Real-time scoring console + alert queue', run: () => openGroup('live'), ic: 'LP' },
    ...SUBS.slice(1).map(([p, label, n]) => ({ kind: 'Notebooks', label: FULL[p] || label, hint: `Notebook ${n} · ${label}`, run: () => go(p), ic: n })),
  ];

  function idActions(raw) {
    const s = raw.trim().toUpperCase().replace(/\s+/g, '');
    const m = s.match(/^(TX|AML|ACC)?-?#?(\d{1,7})$/);
    if (!m) return [];
    const d = m[2], pre = m[1];
    const out = [];
    const wb = (mode, val) => () => {
      openGroup('workbench');
      setTimeout(() => {
        const sel = $id('wb-search-mode'), inp = $id('wb-search-input');
        if (!sel || !inp || typeof wbSearch !== 'function') return;
        sel.value = mode; inp.value = val; wbSearch();
      }, 60);
    };
    if (!pre || pre === 'TX') out.push({ kind: 'Look up', label: `Transaction TX-${d}`, hint: 'Open the case in the Investigation Workbench', run: wb('txn', 'TX-' + d), ic: ICON.tx });
    if (!pre || pre === 'AML') { const a = 'AML-' + d.padStart(6, '0'); out.push({ kind: 'Look up', label: `Alert ${a}`, hint: 'Open the alert in the Investigation Workbench', run: wb('alert', a), ic: ICON.alert }); }
    if (!pre || pre === 'ACC') {
      out.push({ kind: 'Look up', label: `Account ACC-${d}`, hint: 'Account history + linked accounts in the Workbench', run: wb('account', 'ACC-' + d), ic: ICON.acc });
      out.push({ kind: 'Look up', label: `Linked Account Network · ACC-${d}`, hint: 'Mule / suspicious-community map on the Overview', ic: ICON.acc, run: () => {
        go('overview');
        setTimeout(() => {
          const inp = $id('net-account-input'), btn = $id('btn-net-search');
          if (!inp || !btn) return;
          inp.value = d; btn.click();
          const card = $id('network-card');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      } });
    }
    return out;
  }

  let items = [], sel = 0;
  function render() {
    const raw = q.value;
    const needle = raw.trim().toLowerCase();
    const pages = PAGES.filter(p => !needle || (p.label + ' ' + p.hint + ' ' + p.kind).toLowerCase().includes(needle));
    items = [...idActions(raw), ...pages];
    sel = Math.min(sel, Math.max(items.length - 1, 0));
    if (!items.length) { list.innerHTML = '<div class="fs1-pal-empty">No match. Try a page name, or an ID like TX-2132660, AML-000001, ACC-448952.</div>'; return; }
    let html = '', last = '';
    items.forEach((it, i) => {
      if (it.kind !== last) { html += `<div class="fs1-pal-sec">${it.kind}</div>`; last = it.kind; }
      html += `<div class="fs1-pal-item${i === sel ? ' sel' : ''}" data-i="${i}"><span class="ic">${it.ic}</span>` +
        `<span class="tx"><b>${it.label}</b><span>${it.hint}</span></span><span class="go">↵</span></div>`;
    });
    list.innerHTML = html;
    const s = list.querySelector('.sel');
    if (s) s.scrollIntoView({ block: 'nearest' });
  }
  function openPal() { pal.hidden = false; q.value = ''; sel = 0; render(); setTimeout(() => q.focus(), 10); }
  function closePal() { pal.hidden = true; }
  function runSel(i) { const it = items[i]; if (!it) return; closePal(); it.run(); }
  $id('fs1-open-pal').addEventListener('click', openPal);
  q.addEventListener('input', () => { sel = 0; render(); });
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); runSel(sel); }
    else if (e.key === 'Escape') { e.preventDefault(); closePal(); }
  });
  list.addEventListener('mousemove', e => {
    const it = e.target.closest('.fs1-pal-item');
    if (it && Number(it.dataset.i) !== sel) { sel = Number(it.dataset.i); list.querySelectorAll('.fs1-pal-item').forEach(x => x.classList.toggle('sel', Number(x.dataset.i) === sel)); }
  });
  list.addEventListener('click', e => { const it = e.target.closest('.fs1-pal-item'); if (it) runSel(Number(it.dataset.i)); });
  pal.addEventListener('mousedown', e => { if (e.target === pal) closePal(); });

  /* ---------- keyboard shortcuts ---------- */
  const typing = el => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closePal(); return; }
    if (!pal.hidden) return;
    if (e.altKey && /^[1-4]$/.test(e.key)) { e.preventDefault(); openGroup(ORDER[Number(e.key) - 1]); return; }
    if (typing(document.activeElement) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '[') step(-1);
    else if (e.key === ']') step(1);
    else if (e.key === '/') { e.preventDefault(); openPal(); }
  });

  /* ---------- toast ---------- */
  function toast(html, ms = 4200) {
    const t = $id('fs1-toast');
    t.innerHTML = html; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms);
  }

  /* ---------- start ---------- */
  function fromHash() {
    const m = location.hash.match(/^#\/(overview|portal|workbench|live)(?:\/([a-z]+))?$/);
    if (!m) return null;
    if (m[1] === 'overview') return m[2] && SUBS.some(s => s[0] === m[2]) ? m[2] : 'overview';
    return GROUPS[m[1]].pages[0];
  }
  window.addEventListener('hashchange', () => { const p = fromHash(); if (p && p !== current) go(p); });

  const start = fromHash();
  const active = document.querySelector('.page.active');
  const activeName = active ? active.id.replace(/^pg-/, '') : 'overview';
  if (start && start !== activeName) go(start); else sync(activeName);
  requestAnimationFrame(moveIndicator);
  setTimeout(moveIndicator, 400);   // after web fonts settle

  try {
    if (!localStorage.getItem('fs1-hint')) {
      setTimeout(() => toast(`Tip: press <kbd class="fs1-kbd">${isMac ? '⌘' : 'Ctrl'}</kbd>+<kbd class="fs1-kbd">K</kbd> to jump anywhere or look up a TX / AML / ACC ID`), 1200);
      localStorage.setItem('fs1-hint', '1');
    }
  } catch (e) { /* storage unavailable — skip the hint */ }
})();
