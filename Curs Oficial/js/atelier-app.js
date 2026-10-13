/* ==========================================================================
   Atelier de raport · aplicația
   Landing → Date → Bibliotecă (coșuri pe pagini) → Construiește (canvas) → Plan
   ========================================================================== */
(function () {
  'use strict';

  const A = window.Atelier;
  const D = A.Data, C = A.Catalog, Ch = A.Charts;
  const esc = Ch.esc;
  const KEY = 'atelier-raport-v2';
  try { localStorage.removeItem('atelier-raport-v1'); } catch (e) { /* fără acces la stocare */ }
  const THEME_KEY = 'curs-oficial-theme';
  const CW = 1280, CH = 720, GRID = 8;
  const DEMOS = {
    s5: { url: '../sesiuni/s05/date_curat/Vanzari_s5_curat.xlsx', name: 'Vanzari_s5_curat.xlsx' },
    cinema: { url: '../sesiuni/s08/date/Cinema_curat.xlsx', name: 'Cinema_curat.xlsx' }
  };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const app = $('#atl-app');
  const drawer = $('#atl-drawer');
  const uid = () => Math.random().toString(36).slice(2, 9);
  const LEVELS = ['', 'Ușor', 'Mediu', 'Avansat'];
  const lvlDots = (n) => `<span class="atl-lvl" title="Nivel: ${LEVELS[n]}">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

  /* ---------- iconițe ---------- */
  const I = (p, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra || ''}>${p}</svg>`;
  const ICON = {
    card: I('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 13h4M7 10h8"/>'),
    multicard: I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h6M7 13h8M7 17h4"/>'),
    kpi: I('<path d="M3 17l5-5 4 3 6-7"/><path d="M14 8h4v4"/>'),
    gauge: I('<path d="M4 17a8 8 0 0 1 16 0"/><path d="M12 17l4-5"/>'),
    barClustered: I('<path d="M4 6h12M4 12h16M4 18h8" stroke-width="3"/>'),
    colClustered: I('<path d="M6 20V10M12 20V4M18 20v-7" stroke-width="3"/>'),
    barStacked: I('<path d="M4 6h7M4 12h10M4 18h5" stroke-width="3"/><path d="M11 6h6M14 12h6M9 18h4" stroke-width="3" opacity=".45"/>'),
    colStacked: I('<path d="M6 20v-6M12 20v-9M18 20v-5" stroke-width="3"/><path d="M6 14v-4M12 11V5M18 15v-4" stroke-width="3" opacity=".45"/>'),
    pie: I('<circle cx="12" cy="12" r="8"/><path d="M12 4v8h8"/>'),
    donut: I('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>'),
    treemap: I('<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M12 4v16M12 11h9M3 14h9"/>'),
    bar100: I('<path d="M4 7h16M4 12h16M4 17h16" stroke-width="3" opacity=".45"/><path d="M4 7h9M4 12h6M4 17h11" stroke-width="3"/>'),
    col100: I('<path d="M7 20V4M12 20V4M17 20V4" stroke-width="3" opacity=".45"/><path d="M7 20v-9M12 20v-6M17 20v-11" stroke-width="3"/>'),
    line: I('<path d="M3 17l5-6 4 3 8-8"/>'),
    area: I('<path d="M3 19l5-8 4 3 8-8v13z" fill="currentColor" opacity=".25" stroke="none"/><path d="M3 19l5-8 4 3 8-8"/>'),
    areaStacked: I('<path d="M3 19l5-5 4 2 8-5v8z" fill="currentColor" opacity=".25" stroke="none"/><path d="M3 14l5-5 4 2 8-6"/><path d="M3 19l5-5 4 2 8-5"/>'),
    comboClustered: I('<path d="M6 20v-6M12 20v-9M18 20v-4" stroke-width="3" opacity=".5"/><path d="M3 10l6-3 6 4 6-6"/>'),
    comboStacked: I('<path d="M6 20v-6M12 20v-9M18 20v-4" stroke-width="3" opacity=".5"/><path d="M3 10l6-3 6 4 6-6"/>'),
    waterfall: I('<path d="M5 20v-9M10 11V6M15 6v5M20 11v9" stroke-width="3"/>'),
    funnel: I('<path d="M3 5h18M6 10h12M9 15h6M11 20h2" stroke-width="3"/>'),
    scatter: I('<circle cx="7" cy="16" r="1.6"/><circle cx="11" cy="10" r="1.6"/><circle cx="16" cy="13" r="1.6"/><circle cx="18" cy="6" r="1.6"/><path d="M3 3v18h18"/>'),
    map: I('<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>'),
    table: I('<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M3 14h18M9 9v11"/>'),
    matrix: I('<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M3 14h18M9 4v16M15 4v16"/>'),
    decomp: I('<rect x="2" y="10" width="5" height="4" rx="1"/><rect x="10" y="4" width="5" height="4" rx="1"/><rect x="10" y="16" width="5" height="4" rx="1"/><rect x="17" y="10" width="5" height="4" rx="1"/><path d="M7 12h1.5v-6H10M8.5 12v6H10M15 18h1v-6h1"/>'),
    slicer: I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h1M11 9h6M7 13h1M11 13h6M7 17h1M11 17h4"/>'),
    text: I('<path d="M5 6h14M12 6v13"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    x: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    check: I('<path d="M5 12l5 5 9-10"/>'),
    alert: I('<path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/>'),
    upload: I('<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>'),
    lock: I('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    eye: I('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    print: I('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>'),
    download: I('<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>'),
    grid: I('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
    filter: I('<path d="M3 5h18l-7 8v6l-4 2v-8z"/>'),
    sparkle: I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>'),
    trash: I('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    drag: I('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'),
    ribbon: I('<path d="M5 20v-5M12 20v-9M19 20v-6" stroke-width="3"/><path d="M6 15c3 0 3-4 5-4M13 11c3 0 3 3 5 3" opacity=".5"/>'),
    area100: I('<rect x="3" y="4" width="18" height="16" rx="1" opacity=".35"/><path d="M3 14l6-3 6 2 6-4v11H3z" fill="currentColor" opacity=".3" stroke="none"/><path d="M3 14l6-3 6 2 6-4"/>'),
    bubble: I('<circle cx="8" cy="15" r="3"/><circle cx="15" cy="9" r="4.5"/><circle cx="18" cy="17" r="1.6"/><path d="M3 3v18h18"/>'),
    smallMult: I('<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><path d="M4.5 9l2-2 2 1 1.5-2M14.5 9l2-1 2 1 1.5-3M4.5 19l2-1 2-2 1.5 1M14.5 19l2-3 2 1 1.5-1"/>'),
    tableSpark: I('<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M3 14h18M10 9v11"/><path d="M12 12.5l2-1.5 2 1 3-2"/>'),
    keyInf: I('<circle cx="7" cy="12" r="3"/><path d="M10 12h4M14 7h6M14 12h4M14 17h5"/><path d="M14 7v10"/>'),
    narrative: I('<path d="M4 6h16M4 10h16M4 14h10M4 18h7"/><path d="M18 15l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z"/>'),
    up: I('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    down: I('<path d="M12 5v14M6 13l6 6 6-6"/>'),
    arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    link: I('<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>'),
    users: I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>'),
    box: I('<path d="M3 7.5l9-4.5 9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>'),
    pin: I('<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>'),
    calendar: I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    coins: I('<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.66 2.69 3 6 3s6-1.34 6-3V7"/><path d="M9 15v2c0 1.66 2.69 3 6 3s6-1.34 6-3v-5c0-1.66-2.69-3-6-3"/>'),
    hash: I('<path d="M5 9h14M4 15h14M10 3L8 21M16 3l-2 18"/>'),
    shuffle: I('<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
    target: I('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
    message: I('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
    bulb: I('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
    book: I('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M19 19v2H6"/>')
  };
  const icon = (t) => ICON[t] || ICON.card;

  /* ---------- starea ---------- */
  const newPage = (name) => ({ id: uid(), name, purpose: '', audience: '', action: '', exclude: '', questions: [], wantFilters: [], basket: [], items: [], filters: [] });
  const fresh = () => {
    const p = newPage('Prezentare generală');
    return normalize({ v: 1, files: [], tables: [], overrides: {}, pages: [p], active: p.id, theme: 'curs' });
  };
  /** completează câmpurile adăugate în versiuni noi (proiecte salvate mai demult) */
  function normalize(s) {
    s.model = s.model || {};
    s.model.rels = Array.isArray(s.model.rels) ? s.model.rels : [];
    s.model.pos = s.model.pos || {};
    s.story = Object.assign({ audience: '', decision: '', message: '' }, s.story || {});
    s.understand = s.understand || {};
    s.understand.quiz = s.understand.quiz || {};
    s.pages.forEach((p) => {
      ['purpose', 'audience', 'action', 'exclude'].forEach((k) => { if (typeof p[k] !== 'string') p[k] = ''; });
      ['questions', 'wantFilters', 'basket', 'items', 'filters'].forEach((k) => { if (!Array.isArray(p[k])) p[k] = []; });
    });
    return s;
  }
  function loadSaved() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return s && s.v === 1 && Array.isArray(s.pages) && s.pages.length ? normalize(s) : null;
    } catch (e) { return null; }
  }
  let S = loadSaved() || fresh();
  let M = null;
  let LIST = [];
  const specCache = new Map();
  const ui = {
    lib: { fam: 'all', lvl: 0, q: '', field: '', guess: false, revealed: new Set(), flt: {}, answer: null },
    sel: null, item: null, reader: false, dax: false, check: false, drawer: null, tab: 'fields', confirmReset: false
  };
  let Mo = null, U = null, St = null; // modulele: modelare, înțelegere, poveste

  let saveTimer = null, saveWarned = false;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(S)); }
      catch (e) { if (!saveWarned) { saveWarned = true; toast('Nu pot salva automat în browser. Folosește „Exportă proiectul” din pagina Plan.'); } }
    }, 250);
  }

  function rebuild() {
    specCache.clear();
    if (Mo) Mo.reset();
    if (U) U.reset();
    if (!S.tables.length) { M = null; LIST = []; return; }
    try {
      M = D.buildModel(S.tables.map(D.unpack), S.overrides);
      LIST = M ? C.generate(M) : [];
    } catch (err) {
      console.error('[atelier]', err);
      M = null; LIST = [];
      toast('Nu am putut înțelege datele. Verifică dacă fișierele au antetul pe primul rând.');
    }
  }
  function specOf(type, enc) {
    if (!M) return null;
    const k = C.keyOf(type, enc);
    if (!specCache.has(k)) specCache.set(k, C.make(M, type, enc));
    return specCache.get(k);
  }
  const page = (id) => S.pages.find((p) => p.id === (id || S.active)) || S.pages[0];
  const palette = () => (Ch.PALETTES[S.theme] || Ch.PALETTES.curs).colors;

  /* ---------- notificări ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#atl-toast');
    t.textContent = msg;
    t.hidden = false;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove('is-on'); setTimeout(() => { t.hidden = true; }, 250); }, 2600);
  }

  /* ---------- temă ---------- */
  function setupTheme() {
    $$('.theme-toggle').forEach((b) => b.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      try { localStorage.setItem(THEME_KEY, cur); } catch (e) { /* fără salvare */ }
    }));
  }

  /* ---------- rutare ---------- */
  const VIEWS = ['start', 'date', 'intelege', 'model', 'poveste', 'biblioteca', 'construieste', 'plan'];
  const NEED_MODEL = ['biblioteca', 'construieste', 'plan'];
  const view = () => { const h = (location.hash || '').slice(1); return VIEWS.includes(h) ? h : 'start'; };
  function go(v) { if (location.hash !== '#' + v) location.hash = v; else render(); }
  const modelDone = () => !!(M && Mo && Mo.done());

  function render(keepScroll) {
    const v = view();
    const y = window.scrollY;
    document.body.dataset.view = v;
    const done = modelDone();
    $$('.atl-steps a').forEach((a) => {
      a.classList.toggle('is-on', a.dataset.step === v);
      a.classList.toggle('is-locked', (!M && a.dataset.step !== 'date') || (NEED_MODEL.includes(a.dataset.step) && !done));
      a.classList.toggle('is-done', !!M && ((a.dataset.step === 'date') || (a.dataset.step === 'model' && done)));
    });
    if (v !== 'construieste') ro && ro.disconnect();
    if (v === 'start') app.innerHTML = viewStart();
    else if (v === 'date') app.innerHTML = viewDate();
    else if (!M) app.innerHTML = viewNeedData();
    else if (v === 'intelege') app.innerHTML = U.view();
    else if (v === 'model') { app.innerHTML = Mo.view(); }
    else if (v === 'poveste') app.innerHTML = St.view();
    else if (NEED_MODEL.includes(v) && !done) app.innerHTML = viewNeedModel();
    else if (v === 'biblioteca') { app.innerHTML = viewLibrary(); }
    else if (v === 'construieste') { app.innerHTML = viewBuilder(); afterBuilder(); }
    else if (v === 'plan') app.innerHTML = viewPlan();
    if (v === 'model' && M) Mo.after();
    if (v === 'intelege' && M) U.after();
    if (v !== 'construieste') { if (keepScroll) window.scrollTo({ top: y }); else afterGeneric(); }
  }
  function afterGeneric() { window.scrollTo({ top: 0 }); }
  /** re-desenează pagina curentă păstrând poziția de scroll (pentru module) */
  function rerender() { render(true); }

  /* ======================================================================
     LANDING
     ====================================================================== */
  function heroArt() {
    const bars = [86, 62, 44, 31, 20];
    const line = [30, 42, 36, 55, 50, 68, 62, 80];
    const pts = line.map((v, i) => `${10 + i * 26},${96 - v}`).join(' ');
    return `<div class="atl-art" aria-hidden="true">
      <div class="atl-art-frame">
        <div class="atl-art-cards"><div><b>560K</b><span>Total vânzări</span></div><div><b>132</b><span>Tranzacții</span></div><div><b>20,5%</b><span>Anulări</span></div></div>
        <div class="atl-art-row">
          <div class="atl-art-box"><span class="t">Ce categorie vinde cel mai mult?</span>${bars.map((b, i) => `<i style="width:${b}%;animation-delay:${200 + i * 80}ms"></i>`).join('')}</div>
          <div class="atl-art-box"><span class="t">Cum evoluează lunar?</span><svg viewBox="0 0 200 100"><polyline points="${pts}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        </div>
        <div class="atl-art-tabs"><span class="on">Prezentare</span><span>Vânzări</span><span>Clienți</span></div>
      </div>
    </div>`;
  }
  function viewStart() {
    const saved = S.tables.length;
    const steps = [
      ['upload', 'Date', 'Încarci fișierele curate'],
      ['book', 'Înțelege', 'Ce descrie fiecare tabel'],
      ['link', 'Modelare', 'Legi tu tabelele'],
      ['message', 'Poveste', 'Ce întrebări are cititorul'],
      ['grid', 'Bibliotecă', 'Vizualul potrivit întrebării'],
      ['slicer', 'Construiește', 'Pagini, slicere, formatare'],
      ['check', 'Plan', 'Câmpuri și DAX, în ordine']
    ];
    return `<section class="atl-hero">
      <div class="atl-hero-txt">
        <h1>Desenează raportul înainte să-l construiești.</h1>
        <p class="atl-lead">Înțelegi datele, legi tabelele, scrii povestea paginilor și abia apoi alegi vizualele. La fiecare pas primești explicații, dar deciziile sunt ale tale.</p>
        <div class="atl-cta">
          <a class="atl-btn atl-btn-primary atl-btn-lg" href="#date">Încarcă datele</a>
          <button class="atl-btn atl-btn-ghost atl-btn-lg" data-act="demo" data-demo="cinema">Încearcă cu datele Cinema (Sesiunea 8)</button>
        </div>
        ${saved ? `<a class="atl-resume" href="#${!M ? 'date' : !modelDone() ? 'model' : S.pages.some((p) => p.basket.length) ? 'biblioteca' : 'poveste'}">${icon('check')}<span>Continuă proiectul: ${S.pages.length} ${S.pages.length === 1 ? 'pagină' : 'pagini'}, ${S.pages.reduce((s, p) => s + p.basket.length, 0)} vizuale</span></a>` : ''}
      </div>
      ${heroArt()}
    </section>
    <ol class="atl-flow">${steps.map(([ic, t, d], i) => `<li><span class="atl-flow-n">${i + 1}</span><div><b>${t}</b><p>${d}</p></div></li>`).join('')}</ol>
    <p class="atl-privacy">${icon('lock')} Datele rămân în browserul tău.</p>`;
  }
  /* ======================================================================
     DATE
     ====================================================================== */
  const typeIcon = (t) => (t === 'number' ? '<i class="atl-ty n">123</i>' : t === 'date' ? '<i class="atl-ty d">31</i>' : '<i class="atl-ty t">Abc</i>');
  function relEditor() {
    const fact = M.fact;
    const dims = M.tables.filter((t) => t !== fact && !t.virtual);
    const fcols = fact.columns.filter((c) => c.role !== 'measure' && c.role !== 'ignore');
    return `<div class="atl-rel-list">${dims.map((d) => {
      const r = M.rels.find((x) => x.from.table === fact.name && x.to.table === d.name);
      const ucols = d.columns.filter((c) => c.unique);
      return `<div class="atl-rel-row"><span class="atl-rel-t">${esc(fact.name)}</span>
        <select data-rel-from="${esc(d.name)}"><option value="">(fără relație)</option>${fcols.map((c) => `<option ${r && r.from.col === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
        <span class="atl-rel-arrow">*:1 →</span><span class="atl-rel-t">${esc(d.name)}</span>
        <select data-rel-to="${esc(d.name)}">${ucols.map((c) => `<option ${r && r.to.col === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('') || '<option value="">(nicio coloană unică)</option>'}</select>
        ${r && r.manual ? '<span class="atl-tag">manual</span>' : r ? '<span class="atl-tag is-ok">recunoscută</span>' : '<span class="atl-tag is-warn">lipsă</span>'}</div>`;
    }).join('')}</div>`;
  }

  function viewDate() {
    const input = '<input type="file" id="atl-file" multiple accept=".xlsx,.xls,.xlsm,.csv,.txt" hidden />';
    if (!M) {
      return `<div class="atl-wrap atl-narrow">
        <header class="atl-head"><h2>Date</h2><p>Încarcă fișierele curate din Power Query: tabelul de fapte, dimensiunile și, dacă îl ai, calendarul.</p></header>
        ${input}
        <div class="atl-drop" data-drop tabindex="0" role="button" aria-label="Alege fișierele cu date">
          <div class="atl-drop-ic">${icon('upload')}</div>
          <b>Trage fișierele aici sau alege-le</b>
          <small>.xlsx sau .csv · un fișier cu mai multe foi sau câte unul pe tabel</small>
        </div>
        <p class="atl-alt">Nu ai datele la îndemână? Folosește <button class="atl-link" data-act="demo" data-demo="cinema">datele Cinema (Sesiunea 8)</button> sau <button class="atl-link" data-act="demo" data-demo="s5">datele de vânzări (Sesiunea 5)</button></p>
      </div>`;
    }
    const real = M.tables.filter((t) => !t.virtual);
    const nRows = real.reduce((s, t) => s + t.rowCount, 0);
    const nCols = real.reduce((s, t) => s + t.columns.length, 0);
    const stats = [
      [String(real.length), real.length === 1 ? 'tabel' : 'tabele'],
      [nRows.toLocaleString('ro-RO'), 'rânduri în total'],
      [String(nCols), 'coloane'],
      [String(S.files.length), S.files.length === 1 ? 'fișier' : 'fișiere']
    ];
    const files = S.files.map((f) => `<span class="atl-file">${esc(f)}<button data-act="rmfile" data-file="${esc(f)}" aria-label="Scoate ${esc(f)}">${icon('x')}</button></span>`).join('');
    const tables = real.map((t) => `<div class="atl-tcard">
        <div class="atl-tcard-h"><b>${esc(t.name)}</b></div>
        <ul>${t.columns.map((c) => `<li>${typeIcon(c.type)}<span>${esc(c.name)}</span></li>`).join('')}</ul>
      </div>`).join('');
    return `<div class="atl-wrap">
      <header class="atl-head atl-head-row"><div><h2>Date</h2><p>Asta ai încărcat. Dacă lipsește un tabel (clienți, produse, calendar…), adaugă fișierul acum.</p></div>
        <div class="atl-files">${files}<button class="atl-btn atl-btn-xs atl-btn-ghost" data-act="pick">${icon('plus')} Fișier</button></div></header>
      ${input}
      <div class="atl-stats">${stats.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>
      <div class="atl-tables atl-tables-date">${tables}</div>
      <div class="atl-next"><button class="atl-btn atl-btn-ghost atl-btn-sm ${ui.confirmReset ? 'is-danger' : ''}" data-act="reset">${ui.confirmReset ? 'Apasă din nou ca să ștergi tot' : 'Începe de la zero'}</button><a class="atl-btn atl-btn-primary" href="#intelege">Înțelege datele →</a></div>
    </div>`;
  }
  const viewNeedData = () => `<div class="atl-wrap atl-narrow atl-need"><h2>Întâi datele</h2><p>Toți pașii pornesc de la datele tale.</p><div class="atl-cta"><a class="atl-btn atl-btn-primary" href="#date">Încarcă datele</a><button class="atl-btn atl-btn-ghost" data-act="demo" data-demo="cinema">Datele Cinema (Sesiunea 8)</button></div></div>`;
  function viewNeedModel() {
    const ev = Mo.evalAll();
    const ok = ev.found.filter(Boolean).length;
    return `<div class="atl-wrap atl-narrow atl-need"><h2>Întâi modelul</h2><p>Vizualele au nevoie de relațiile dintre tabele. Ai ${ok} din ${ev.exp.length} relații corecte${ev.bad ? ` și ${ev.bad} ${ev.bad === 1 ? 'greșită' : 'greșite'}` : ''}.</p><div class="atl-cta"><a class="atl-btn atl-btn-primary" href="#model">Mergi la Modelare</a><a class="atl-btn atl-btn-ghost" href="#poveste">Lucrează la Poveste</a></div></div>`;
  }
  async function addFiles(fileList, replace) {
    const files = [...fileList];
    if (!files.length) return;
    const got = [];
    for (const f of files) {
      try {
        const ts = await D.readFile(f);
        if (!ts.length) toast(`În ${f.name} nu am găsit niciun tabel.`);
        got.push({ name: f.name, tables: ts.map(D.pack) });
      } catch (err) {
        console.error(err);
        toast(err.message && /bibliotec/i.test(err.message) ? err.message : `Nu am putut citi ${f.name}.`);
      }
    }
    if (!got.length) return;
    if (replace) { S.tables = []; S.files = []; S.overrides = {}; S.model = { rels: [], pos: {} }; S.understand = { quiz: {} }; }
    got.forEach((g) => {
      S.files = S.files.filter((x) => x !== g.name).concat(g.name);
      g.tables.forEach((t) => { t.file = g.name; S.tables = S.tables.filter((x) => x.name !== t.name).concat(t); });
    });
    rebuild();
    save();
    render();
    if (M) toast(`Am citit ${S.tables.length} ${S.tables.length === 1 ? 'tabel' : 'tabele'} · ${LIST.length} vizuale posibile.`);
  }
  async function loadDemo(which) {
    const DEMO = DEMOS[which] || DEMOS.cinema;
    try {
      const res = await fetch(DEMO.url);
      if (!res.ok) throw new Error('http ' + res.status);
      const buf = await res.arrayBuffer();
      const hadPages = S.pages.some((p) => p.basket.length || p.items.length);
      if (hadPages) { const p = newPage('Prezentare generală'); S.pages = [p]; S.active = p.id; }
      await addFiles([{ name: DEMO.name, arrayBuffer: async () => buf }], true);
      if (M) go('date');
    } catch (err) {
      console.error(err);
      toast('Nu am putut încărca datele demo. Deschide pagina de pe site-ul cursului.');
    }
  }

  /* ======================================================================
     BIBLIOTECĂ
     ====================================================================== */
  function pagesWith(key) { return S.pages.filter((p) => p.basket.some((b) => C.keyOf(b.type, b.enc) === key)); }
  function libFiltered() {
    const L = ui.lib;
    const q = D.norm(L.q);
    return LIST.filter((s) => (L.fam === 'all' || s.family === L.fam) && (!L.lvl || s.level === L.lvl)
      && (!L.field || JSON.stringify(s.spec).includes('"' + L.field + '"'))
      && (!q || D.norm(s.question + ' ' + s.visual).includes(q)));
  }
  function libFields() {
    const ids = [];
    if (M.time) ['year', 'quarter', 'month', 'weekday'].forEach((k) => { if (M.time[k]) ids.push(M.time[k]); });
    M.cats.forEach((c) => ids.push(c));
    M.names.forEach((n) => ids.push(n));
    return [...new Set(ids)].filter((id) => M.fields.get(id) && LIST.some((s) => JSON.stringify(s.spec).includes('"' + id + '"')));
  }
  function ingredients(s) {
    const n = C.measureChain(M, s.measures || []).length + (s.customMeasures || []).length;
    const c = (s.calcCols || []).length;
    const out = [];
    if (n) out.push(`${n} ${n === 1 ? 'măsură' : 'măsuri'}`);
    if (c) out.push(`${c} ${c === 1 ? 'coloană' : 'coloane'}`);
    return out.join(', ') || 'fără DAX';
  }
  function libFilters(s) {
    const on = ui.lib.flt[s.key] || [];
    return on.map((i) => s.filters[i] && s.filters[i].apply).filter((a) => a && a.field);
  }
  const FAM_ICON = { kpi: 'card', comp: 'barClustered', part: 'donut', time: 'line', flow: 'waterfall', rel: 'scatter', geo: 'map', detail: 'table', ai: 'sparkle' };
  function vcard(s) {
    const fam = C.FAMILIES.find((f) => f.id === s.family);
    const on = pagesWith(s.key);
    const guess = ui.lib.guess && !ui.lib.revealed.has(s.key);
    return `<article class="atl-vcard lb-card${guess ? ' is-guess' : ''}${on.length ? ' is-on' : ''}" draggable="true" data-key="${esc(s.key)}" style="--fam:${fam.color}" tabindex="0">
      <div class="lb-card-top"><span class="lb-type">${icon(s.type)}<span>${guess ? 'Ce vizual ai alege?' : esc(s.visual)}</span></span>${lvlDots(s.level)}</div>
      <h3 class="atl-vc-q">${esc(s.question)}</h3>
      <div class="atl-vc-chart lb-chart">${Ch.render(M, s.spec, { w: 300, h: 128, compact: true, palette: palette(), filters: libFilters(s) })}${guess ? '<div class="atl-guess-cover"><span>?</span></div>' : ''}</div>
      <div class="lb-card-foot">
        <span class="atl-vc-meta" title="Ce construiești în DAX">${esc(ingredients(s))}</span>
        <button class="atl-add${on.length ? ' is-on' : ''}" data-act="add" title="${on.some((p) => p.id === S.active) ? 'Scoate de pe „' + esc(page().name) + '”' : on.length ? 'Pe pagina ' + esc(on.map((p) => p.name).join(', ')) + '. Adaugă și pe „' + esc(page().name) + '”' : 'Adaugă pe „' + esc(page().name) + '”'}" aria-label="Adaugă pe pagina activă">${icon(on.length ? 'check' : 'plus')}</button>
      </div>
    </article>`;
  }
  // rezultatele: grupate pe familii când nu filtrezi nimic, altfel o singură listă
  function resultsHtml() {
    const L = ui.lib;
    const list = libFiltered();
    if (!list.length) return `<p class="atl-empty">Niciun vizual pentru filtrele alese. <button class="atl-link" data-act="lib-clear">Arată tot</button></p>`;
    const grouped = L.fam === 'all' && !L.q && !L.field && !L.lvl;
    if (!grouped) return `<div class="atl-cards lb-cards">${list.map(vcard).join('')}</div>`;
    return C.FAMILIES.map((f) => {
      const items = list.filter((x) => x.family === f.id);
      if (!items.length) return '';
      return `<section class="lb-group" style="--fam:${f.color}"><div class="lb-group-h"><i>${icon(FAM_ICON[f.id])}</i><div><h3>${esc(f.name)}</h3><p>${esc(f.q)}</p></div><span>${items.length}</span></div>
        <div class="atl-cards lb-cards">${items.map(vcard).join('')}</div></section>`;
    }).join('');
  }
  const SD = A.StoryData;
  const storyQs = (p) => (p.questions || []).filter((q) => q.text.trim());
  function pageQuestions(p) {
    const qs = storyQs(p);
    if (!qs.length) return `<a class="atl-pg-noq" href="#poveste">${icon('message')} Scrie întrebările paginii în Poveste</a>`;
    return `<div class="atl-pg-qs">${qs.map((q) => {
      const cov = p.basket.some((b) => b.q === q.id);
      return `<button class="atl-pg-q${cov ? ' is-cov' : ''}${ui.lib.answer === q.id ? ' is-on' : ''}" data-act="answer" data-page-id="${p.id}" data-q="${esc(q.id)}" title="Arată vizualele potrivite">${icon(cov ? 'check' : 'message')}<span>${esc(q.text)}</span></button>`;
    }).join('')}</div>`;
  }
  function answerBanner() {
    const p = page();
    const q = ui.lib.answer && p.questions.find((x) => x.id === ui.lib.answer);
    if (!q) return '';
    const k = SD.kindOf(q.kind);
    const fams = k.fams.map((f) => C.FAMILIES.find((x) => x.id === f)).filter(Boolean).map((f) => f.name).join(' sau ');
    return `<div class="atl-answer">${icon('message')}<div><b>„${esc(q.text)}”</b><span>Răspunsul e de tipul <i>${esc(k.label)}</i> (${esc(k.hint)}): ți-am arătat vizualele din ${esc(fams)}. Vizualul pe care îl adaugi cu + se leagă de întrebare. Poți alege și din altă familie.</span></div><button class="atl-icon-btn atl-sm" data-act="answer-off" aria-label="Renunță">${icon('x')}</button></div>`;
  }
  function pagesPanel() {
    return `<aside class="atl-pages" aria-label="Paginile raportului">
      <div class="atl-pages-h"><h3>Pagini</h3></div>
      ${S.pages.map((p) => `<div class="atl-pg${p.id === S.active ? ' is-active' : ''}" data-page="${p.id}">
          <div class="atl-pg-row"><b class="atl-pg-title">${esc(p.name)}</b><span class="atl-pg-n" title="vizuale alese">${p.basket.length}</span></div>
          ${pageQuestions(p)}
        </div>`).join('')}
      <a class="atl-btn atl-btn-primary atl-wide" href="#construieste">Construiește paginile</a>
    </aside>`;
  }
  function viewLibrary() {
    const L = ui.lib;
    const counts = {};
    LIST.forEach((s) => { counts[s.family] = (counts[s.family] || 0) + 1; });
    const fams = C.FAMILIES.filter((f) => counts[f.id]);
    const fields = libFields();
    return `<div class="atl-lib lb">
      <aside class="lb-side" aria-label="Filtre">
        <label class="atl-search lb-search">${icon('filter')}<input type="search" placeholder="Caută o întrebare" value="${esc(L.q)}" data-lib-q /></label>
        <nav class="lb-fams">
          <button class="${L.fam === 'all' ? 'on' : ''}" data-fam="all"><i>${icon('grid')}</i><span><b>Toate vizualele</b></span><em>${LIST.length}</em></button>
          ${fams.map((f) => `<button class="${L.fam === f.id ? 'on' : ''}" data-fam="${f.id}" style="--fam:${f.color}"><i>${icon(FAM_ICON[f.id])}</i><span><b>${esc(f.name)}</b><small>${esc(f.q)}</small></span><em>${counts[f.id]}</em></button>`).join('')}
        </nav>
        <div class="lb-more">
          <label><span>Pornește de la o coloană</span><select data-lib-field><option value="">Orice coloană</option>${fields.map((id) => `<option value="${esc(id)}" ${L.field === id ? 'selected' : ''}>${esc(M.fields.get(id).col)} (${esc(M.fields.get(id).table)})</option>`).join('')}</select></label>
          <label><span>Nivel DAX</span><select data-lib-lvl><option value="0">Orice nivel</option>${[1, 2, 3].map((n) => `<option value="${n}" ${L.lvl === n ? 'selected' : ''}>${LEVELS[n]}</option>`).join('')}</select></label>
          <button class="lb-toggle${L.guess ? ' is-on' : ''}" data-act="guess" aria-pressed="${L.guess}">${icon('eye')}<span><b>Mod ghicește</b><small>ascunde tipul graficului</small></span></button>
          <button class="lb-toggle" data-act="custom">${icon('sparkle')}<span><b>Vizual liber</b><small>alegi tu tipul și câmpurile</small></span></button>
        </div>
      </aside>
      <div class="atl-lib-main lb-main">
        <header class="lb-head"><h2>Bibliotecă</h2><p>${LIST.length} vizuale construite din datele tale. Pornește de la o întrebare din dreapta sau de la o familie din stânga; click pe un card ca să vezi rețeta în Power BI.</p></header>
        ${answerBanner()}
        <div class="lb-results">${resultsHtml()}</div>
      </div>
      ${pagesPanel()}
    </div>`;
  }
  function addToPage(type, enc, pid) {
    const p = page(pid);
    const key = C.keyOf(type, enc);
    if (p.basket.some((b) => C.keyOf(b.type, b.enc) === key)) { toast(`E deja pe pagina „${p.name}”.`); return false; }
    const q = ui.lib.answer && p.questions.find((x) => x.id === ui.lib.answer);
    p.basket.push({ id: uid(), type, enc: JSON.parse(JSON.stringify(enc)), q: q ? q.id : null });
    if (q) ui.lib.answer = null;
    save();
    toast(q ? `Adăugat pe „${p.name}” ca răspuns la „${q.text}”.` : `Adăugat pe „${p.name}” · ${p.basket.length} ${p.basket.length === 1 ? 'vizual' : 'vizuale'}`);
    return true;
  }
  function refreshLibrary() {
    if (view() !== 'biblioteca') return;
    const y = window.scrollY;
    app.innerHTML = viewLibrary();
    window.scrollTo({ top: y });
  }

  /* ======================================================================
     GHIDUL UNUI VIZUAL (drawer)
     ====================================================================== */
  function expected(id) {
    const ms = M.measures.get(id);
    if (!ms || ms.timeShift || (ms.deps || []).some((d) => (M.measures.get(d) || {}).timeShift)) return null;
    try { return ms.fn(M.flat, D.makeCtx(M, []), {}); } catch (e) { return null; }
  }
  const calTable = () => {
    const r = M.rels.find((x) => x.virtual);
    const fc = r ? `${r.from.table}[${r.from.col}]` : 'Fact[Data]';
    return `Calendar =\nVAR Zile = CALENDAR ( MIN ( ${fc} ), MAX ( ${fc} ) )\nRETURN\nADDCOLUMNS (\n    SELECTCOLUMNS ( Zile, "Data", [Date] ),\n    "An", YEAR ( [Data] ),\n    "Luna", MONTH ( [Data] ),\n    "Luna_Nume", FORMAT ( [Data], "MMMM" ),\n    "Trimestru", "T" & QUARTER ( [Data] ),\n    "Zi_Saptamana", FORMAT ( [Data], "dddd" )\n)`;
  };
  const usesCalendar = (s) => JSON.stringify(s.wells).includes(`"table":"${M.calendar ? M.calendar.name : '§'}"`) || (s.measures || []).includes('py');

  function daxBlock(id, dax) {
    return `<div class="atl-code"><pre><code>${esc(dax)}</code></pre><button class="atl-copy" data-act="copy" data-copy="${esc(dax)}">Copiază</button></div>`;
  }
  function wellsHtml(s) {
    const calcIds = new Set(M.calcCols.map((c) => `${c.table}[${c.name}]`));
    return `<div class="atl-wells"><div class="atl-wells-h">BUILD · ${esc(s.visual.toUpperCase())}</div>${s.wells.map((w) => `<div class="atl-well"><span class="atl-zone">${esc(w.zone)}</span><div class="atl-well-items">${w.items.map((it) => {
      if (it.t === 'm') return `<span class="atl-chip is-m" title="Măsură pe care o creezi tu">${I('<path d="M5 5h14l-7 7 7 7H5"/>')}${esc(it.name)}<em>măsură</em></span>`;
      const isCalc = it.calc || calcIds.has(`${it.table}[${it.col}]`);
      const virt = M.tableByName[it.table] && M.tableByName[it.table].virtual;
      return `<span class="atl-chip${isCalc ? ' is-c' : ''}"><small>${esc(it.table)}</small>${esc(it.col)}${it.agg ? `<em>${esc(it.agg)}</em>` : ''}${isCalc ? '<em>coloană calculată</em>' : virt ? '<em>tabel de creat</em>' : ''}</span>`;
    }).join('')}</div></div>`).join('')}</div>`;
  }
  function tabMeasures(s) {
    const chain = C.measureChain(M, s.measures || []);
    const calc = (s.calcCols || []).map((id) => M.calcCols.find((c) => c.id === id)).filter(Boolean);
    let html = '';
    if (M.virtualCalendar && usesCalendar(s)) {
      html += `<div class="atl-meas is-pre"><div class="atl-meas-h"><b>Tabelul Calendar</b><span class="atl-tag">înainte de toate</span></div><p>Nu ai tabel de date. Modeling → New table, apoi relație cu ${esc(M.rels.find((r) => r.virtual).from.table)}[${esc(M.rels.find((r) => r.virtual).from.col)}] și Mark as date table.</p>${daxBlock('cal', calTable(), 'CALENDAR(început, sfârșit) dă un tabel cu o zi pe rând. ADDCOLUMNS îi adaugă coloane calculate din dată.')}</div>`;
    }
    if (calc.length) {
      html += `<h4 class="atl-sub">Coloane calculate</h4>` + calc.map((c, i) => `<div class="atl-meas"><div class="atl-meas-h"><code>${esc(c.table)}[${esc(c.name)}]</code>${lvlDots(c.level || 1)}</div><p>${esc(c.plain)}</p><p class="atl-muted atl-small">Table tools → New column, în ${esc(c.table)}</p>${daxBlock('c' + i, c.dax, c.hint)}</div>`).join('');
    }
    if (chain.length) {
      html += `<h4 class="atl-sub">Măsuri, în ordinea scrierii</h4>` + chain.map((id, i) => {
        const ms = M.measures.get(id);
        const ex = expected(id);
        return `<div class="atl-meas"><div class="atl-meas-h"><code>[${esc(ms.name)}]</code>${lvlDots(ms.level || 1)}${(s.measures || []).includes(id) ? '' : '<span class="atl-tag">pas intermediar</span>'}</div>
          <p>${esc(ms.plain)}</p>
          ${ex != null ? `<p class="atl-exp" title="Pune măsura într-un Card, fără filtre, și compară">${icon('check')}<span>Fără filtre: <b>${esc(D.fmtFull(ex, ms.fmt))}</b></span></p>` : ''}
          ${daxBlock('m' + i, ms.dax, ms.hint)}</div>`;
      }).join('');
    }
    (s.customMeasures || []).forEach((c, i) => {
      html += `<div class="atl-meas is-adv"><div class="atl-meas-h"><b>${esc(c.name)}</b>${lvlDots(c.level || 3)}</div><p>${esc(c.plain)}</p>${daxBlock('x' + i, c.dax, c.hint)}</div>`;
    });
    return html || '<p class="atl-muted">Vizualul nu are nevoie de măsuri.</p>';
  }
  function tabFilters(s, ctx) {
    const on = ctx.kind === 'item' ? (ctx.item.vf || []) : (ui.lib.flt[s.key] || []);
    const fl = (s.filters || []).map((f, i) => {
      const can = f.apply && f.apply.field;
      const top = f.apply && f.apply.topN;
      return `<div class="atl-flt"><div class="atl-flt-h"><span class="atl-tag ${f.level === 'Pagină' ? 'is-page' : ''}">${esc(f.level === 'Pagină' ? 'pagină' : 'vizual')}</span><b>${esc(f.text)}</b></div>
        <p>${esc(f.how)}</p><p class="atl-muted">${esc(f.why)}</p>
        ${can ? `<label class="atl-switch"><input type="checkbox" data-vf="${i}" ${on.includes(i) ? 'checked' : ''}/><span></span>Aplică</label>` : top ? `<p class="atl-tag is-ok">aplicat</p>` : ''}</div>`;
    }).join('');
    const slicers = [];
    if (M.time && M.time.year && !JSON.stringify(s.spec).includes(M.time.year)) slicers.push(M.time.year);
    M.cats.slice(0, 4).forEach((c) => { if (!JSON.stringify(s.spec).includes(c)) slicers.push(c); });
    return (fl || '<p class="atl-muted">Vizualul nu cere un filtru anume.</p>') +
      `<h4 class="atl-sub">Slicere potrivite alături</h4><div class="atl-chips-s">${slicers.slice(0, 4).map((id) => `<span class="atl-chip">${icon('slicer')}<small>${esc(M.fields.get(id).table)}</small>${esc(M.fields.get(id).col)}</span>`).join('')}</div>`;
  }
  function tabFormat(s) {
    return `<ul class="atl-fmt">${(s.format || []).map((f, i) => `<li><label><input type="checkbox" data-fmt="${i}"/><span>${esc(f)}</span></label></li>`).join('')}</ul>
`;
  }
  function varyHtml(s) {
    const types = [...new Set(LIST.map((x) => x.type))];
    const typeSel = `<label class="atl-vf"><span>Vizual</span><select data-vary-type>${C.FAMILIES.map((f) => {
      const ts = types.filter((t) => C.VIS[t].fam === f.id);
      return ts.length ? `<optgroup label="${esc(f.name)}">${ts.map((t) => `<option value="${t}" ${t === s.type ? 'selected' : ''}>${esc(C.VIS[t].name)}</option>`).join('')}</optgroup>` : '';
    }).join('')}</select></label>`;
    const slots = (s.slots || []).map((sl) => `<label class="atl-vf"><span>${esc(sl.label)}</span><select data-slot="${sl.key}">${sl.options.map((o) => `<option value="${esc(o.value)}" ${String(s.enc[sl.key] == null ? '' : s.enc[sl.key]) === String(o.value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>`).join('');
    return `<div class="atl-vary" title="Schimbă tipul sau câmpurile: întrebarea și pașii se refac">${typeSel}${slots}</div>`;
  }
  function drawerSpec() {
    const d = ui.drawer;
    if (!d) return null;
    if (d.kind === 'item') { const it = findItem(d.page, d.uid); return it ? specOf(it.type, it.enc) : null; }
    return specOf(d.type, d.enc);
  }
  function openDrawer(ctx) { ui.drawer = ctx; ui.tab = ctx.tab || 'fields'; renderDrawer(); }
  function closeDrawer() { ui.drawer = null; drawer.hidden = true; drawer.innerHTML = ''; document.body.classList.remove('atl-noscroll'); }
  function renderDrawer() {
    const s = drawerSpec();
    if (!s) { closeDrawer(); return; }
    const ctx = ui.drawer;
    if (ctx.kind === 'item') ctx.item = findItem(ctx.page, ctx.uid);
    const fam = C.FAMILIES.find((f) => f.id === s.family);
    const chain = C.measureChain(M, s.measures || []);
    const nMeas = chain.length + (s.calcCols || []).length + (s.customMeasures || []).length;
    const filters = ctx.kind === 'item' ? itemFilters(page(ctx.page), ctx.item, true) : libFilters(s);
    const steps = [
      ['Alege vizualul', `<p class="dr2-p">În panoul <b>Visualizations</b> apasă pe <span class="atl-kbd">${icon(s.type)} ${esc(s.visual)}</span>. Pe pagină apare un vizual gol.</p>`],
      ['Trage câmpurile în zone', `<p class="dr2-p">Din panoul <b>Data</b>, trage fiecare câmp în zona lui din <b>Build visual</b>:</p>${wellsHtml(s)}`]
    ];
    if (nMeas) steps.push(['Scrie DAX-ul', `<p class="dr2-p">Creează-le în ordinea de mai jos (Home → New measure). Fiecare are rezultatul așteptat fără filtre, ca să te verifici.</p>${tabMeasures(s)}`]);
    if (s.filters.length) steps.push(['Pune filtrele', tabFilters(s, ctx)]);
    steps.push(['Formatează', `<p class="dr2-p">În <b>Format visual</b>. Bifează ce ai făcut.</p>${tabFormat(s)}`]);
    const scrollEl = $('.atl-dr-body', drawer);
    const y = scrollEl ? scrollEl.scrollTop : 0;
    drawer.innerHTML = `<div class="atl-dr-back" data-act="close"></div>
      <aside class="atl-dr-panel dr2" role="dialog" aria-modal="true" aria-label="Fișa vizualului" style="--fam:${fam.color}">
        <header class="dr2-head">
          <div class="dr2-crumbs"><span class="dr2-fam"><i>${icon(FAM_ICON[fam.id])}</i>${esc(fam.name)}</span><span class="dr2-type">${icon(s.type)}${esc(s.visual)}</span>${lvlDots(s.level)}</div>
          <button class="atl-icon-btn" data-act="close" aria-label="Închide">${icon('x')}</button>
          <h2>${esc(s.question)}</h2>
        </header>
        <div class="atl-dr-body dr2-body">
          <div class="dr2-top">
            <div class="dr2-preview">${Ch.render(M, s.spec, { w: 520, h: s.family === 'kpi' ? 160 : 250, palette: palette(), filters })}</div>
            <div class="dr2-side">
              <div class="dr2-facts">
                <div><span>Răspunde la</span><b>${esc(fam.q)}</b></div>
                <div><span>De construit în DAX</span><b>${esc(ingredients(s))}</b></div>
                <div><span>Nivel</span><b>${esc(LEVELS[s.level] || '')}</b></div>
              </div>
              <h5>Încearcă altă variantă</h5>
              ${varyHtml(s, ctx)}
            </div>
          </div>
          <h4 class="dr2-recipe">Rețeta în Power BI</h4>
          <ol class="dr2-steps">${steps.map(([t, body], i) => `<li><div class="dr2-step-h"><span>${i + 1}</span><b>${esc(t)}</b></div><div class="dr2-step-b">${body}</div></li>`).join('')}</ol>
        </div>
        <footer class="atl-dr-foot">${ctx.kind === 'item'
          ? `<span class="atl-muted atl-small">Schimbările se aplică pe pagină.</span><button class="atl-btn atl-btn-primary" data-act="close">Gata</button>`
          : `<select data-dr-page aria-label="Pagina">${S.pages.map((p) => `<option value="${p.id}" ${p.id === S.active ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}<option value="__new">Pagină nouă</option></select><button class="atl-btn atl-btn-primary" data-act="dr-add">${icon('plus')} Adaugă pe pagină</button>`}</footer>
      </aside>`;
    drawer.hidden = false;
    document.body.classList.add('atl-noscroll');
    const nb = $('.atl-dr-body', drawer);
    if (nb) nb.scrollTop = y;
  }
  function varyChange(target) {
    const ctx = ui.drawer;
    const s = drawerSpec();
    let type = s.type, enc = Object.assign({}, s.enc);
    if (target.hasAttribute('data-vary-type')) {
      type = target.value;
      const first = LIST.find((x) => x.type === type);
      enc = first ? JSON.parse(JSON.stringify(first.enc)) : enc;
    } else {
      const k = target.getAttribute('data-slot');
      enc[k] = target.value;
      if (k === 'legend' && !target.value) delete enc.legend;
    }
    const ns = specOf(type, enc);
    if (!ns) { toast('Combinația asta nu merge. Încearcă alt câmp.'); renderDrawer(); return; }
    if (ctx.kind === 'item') {
      const it = findItem(ctx.page, ctx.uid);
      it.type = type; it.enc = enc; it.title = ns.question; it.vf = [];
      save(); renderBuilderParts();
    } else { ctx.type = type; ctx.enc = enc; }
    ctx.vary = true;
    renderDrawer();
  }

  /* ======================================================================
     CONSTRUIEȘTE
     ====================================================================== */
  const DEF_SIZE = { card: [224, 112], multicard: [264, 176], kpi: [264, 152], gauge: [288, 200], slicer: [216, 176], text: [416, 64], table: [536, 288], matrix: [536, 288], decomp: [600, 288], map: [432, 288], tableSpark: [536, 288], smallMult: [600, 320], keyInf: [560, 288], narrative: [416, 176] };
  const sizeOf = (type) => DEF_SIZE[type] || [424, 264];
  function findItem(pid, id) { const p = page(pid); return p ? p.items.find((i) => i.uid === id) : null; }
  const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  function fitSpot(p, w, h) {
    for (const k of [1, 0.8, 0.65]) {
      const ww = snap(w * k), hh = snap(h * k);
      const s = freeSpot(p, ww, hh, true);
      if (s) return { x: s.x, y: s.y, w: ww, h: hh };
    }
    return Object.assign(freeSpot(p, w, h), { w, h });
  }
  function freeSpot(p, w, h, strict) {
    for (let y = 16; y + h <= CH - 8; y += 16) {
      for (let x = 16; x + w <= CW - 8; x += 16) {
        const r = { x, y, w, h };
        if (!p.items.some((i) => overlaps(r, { x: i.x - 8, y: i.y - 8, w: i.w + 16, h: i.h + 16 }))) return { x, y };
      }
    }
    if (strict) return null;
    return { x: 24 + (p.items.length % 8) * 24, y: 24 + (p.items.length % 8) * 24 };
  }
  const snap = (v) => Math.round(v / GRID) * GRID;
  function placeFromBasket(p, b, at) {
    const s = specOf(b.type, b.enc);
    if (!s) { toast('Vizualul nu mai e disponibil cu datele actuale.'); return; }
    let [w, h] = sizeOf(b.type);
    let pos;
    if (at) pos = { x: clampX(snap(at.x - w / 2), w), y: clampY(snap(at.y - 20), h) };
    else { pos = fitSpot(p, w, h); w = pos.w; h = pos.h; }
    const it = { uid: uid(), kind: 'visual', bid: b.id, type: b.type, enc: JSON.parse(JSON.stringify(b.enc)), x: pos.x, y: pos.y, w, h, title: s.question, showTitle: true, labels: true, interact: true, vf: [] };
    p.items.push(it);
    ui.item = it.uid;
    save();
  }
  function placeElement(p, kind, at) {
    let [w, h] = sizeOf(kind);
    let pos;
    if (at) pos = { x: clampX(snap(at.x - w / 2), w), y: clampY(snap(at.y - 20), h) };
    else { pos = fitSpot(p, w, h); w = pos.w; h = pos.h; }
    const it = { uid: uid(), kind, x: pos.x, y: pos.y, w, h };
    if (kind === 'slicer') { it.field = (M.time && M.time.year) || M.cats[0]; it.style = 'list'; it.values = []; it.title = ''; }
    if (kind === 'text') { it.text = p.purpose || p.name; it.size = 'h'; }
    p.items.push(it);
    ui.item = it.uid;
    save();
  }
  const clampX = (x, w) => Math.max(0, Math.min(CW - w, x));
  const clampY = (y, h) => Math.max(0, Math.min(CH - h, y));

  function itemFilters(p, it, forDrawer) {
    const f = [];
    p.filters.forEach((pf) => { if (pf.values && pf.values.length) f.push({ field: pf.field, op: 'in', values: pf.values }); });
    p.items.forEach((sl) => { if (sl.kind === 'slicer' && sl !== it && sl.values && sl.values.length && M.fields.get(sl.field)) f.push({ field: sl.field, op: 'in', values: sl.values }); });
    if (it && it.kind === 'visual') {
      const s = specOf(it.type, it.enc);
      if (s) (it.vf || []).forEach((i) => { const a = s.filters[i] && s.filters[i].apply; if (a && a.field) f.push(a); });
      if (!forDrawer && ui.sel && ui.sel.page === p.id && ui.sel.uid !== it.uid && it.interact !== false) ui.sel.pairs.forEach(([fld, v]) => f.push({ field: fld, op: 'in', values: [v] }));
    }
    return f.filter((x) => M.fields.get(x.field));
  }

  function itemHtml(p, it, ro) {
    const sel = !ro && ui.item === it.uid;
    let head = '', body = '';
    if (it.kind === 'visual') {
      const s = specOf(it.type, it.enc);
      const showT = it.showTitle !== false;
      const bh = it.h - (showT ? 34 : 10) - 8;
      head = showT ? `<div class="atl-item-h" title="${esc(it.title)}">${esc(it.title || (s && s.question) || '')}</div>` : '';
      body = s ? Ch.render(M, s.spec, { w: it.w - 16, h: bh, palette: palette(), filters: itemFilters(p, it, ro), sel: !ro && ui.sel && ui.sel.uid === it.uid ? ui.sel.pairs : null, labels: it.labels !== false, decompPath: it.decompPath }) : '<div class="atl-empty-vis"><span>Vizual indisponibil cu datele actuale</span></div>';
    } else if (it.kind === 'slicer') {
      body = Ch.slicer(M, it, {});
    } else if (it.kind === 'text') {
      body = `<div class="atl-textbox is-${it.size || 'h'}">${esc(it.text || '')}</div>`;
    }
    return `<div class="atl-item k-${it.kind}${sel ? ' is-selected' : ''}${ui.sel && ui.sel.uid === it.uid ? ' is-source' : ''}" data-uid="${it.uid}" style="left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px">
      ${head}<div class="atl-item-b">${body}</div>
      ${ro ? '' : `<button class="atl-item-x" data-act="item-del" aria-label="Scoate de pe pagină">${icon('x')}</button><span class="atl-item-rs" data-rs aria-hidden="true"></span>`}
    </div>`;
  }
  function canvasHtml(p, ro) {
    return `<div class="atl-canvas${ro ? ' is-ro' : ''}" data-canvas style="width:${CW}px;height:${CH}px">${p.items.map((it) => itemHtml(p, it, ro)).join('')}${!p.items.length && !ro ? `<div class="atl-canvas-empty">${icon('grid')}<b>Trage vizualele aici</b><span>sau apasă + în stânga</span></div>` : ''}</div>`;
  }

  function leftPane(p) {
    const items = p.basket.map((b) => {
      const s = specOf(b.type, b.enc);
      const placed = p.items.some((i) => i.bid === b.id);
      return `<div class="atl-bk${placed ? ' is-placed' : ''}" draggable="${placed ? 'false' : 'true'}" data-bid="${b.id}">
        <span class="atl-bk-ic">${icon(b.type)}</span>
        <span class="atl-bk-t" title="${esc(s ? s.visual : '')}">${esc(s ? s.question : 'Indisponibil')}</span>
        ${placed ? `<span class="atl-bk-ok" title="E pe pagină">${icon('check')}</span>` : `<button class="atl-icon-btn atl-sm" data-act="place" data-bid="${b.id}" title="Pune pe pagină">${icon('plus')}</button>`}
      </div>`;
    }).join('');
    return `<aside class="atl-b-left">
      <div class="atl-b-sec"><h4>Pe pagina asta</h4>
        ${items || `<a class="atl-pg-empty" href="#biblioteca">Alege vizuale din bibliotecă</a>`}
      </div>
      <div class="atl-b-sec"><h4>Adaugă</h4>
        <div class="atl-els">
          <button class="atl-el" draggable="true" data-new="slicer" data-act="place-el" title="Filtrul pus la vedere, pentru cititor">${icon('slicer')}Slicer</button>
          <button class="atl-el" draggable="true" data-new="text" data-act="place-el" title="Titlul paginii sau o explicație">${icon('text')}Text</button>
          <a class="atl-el" href="#biblioteca" title="Mai multe vizuale">${icon('grid')}Vizual</a>
        </div>
      </div>
    </aside>`;
  }

  const filterFields = () => {
    const ids = [];
    if (M.time) ['year', 'quarter', 'month'].forEach((k) => { if (M.time[k]) ids.push(M.time[k]); });
    M.cats.forEach((c) => ids.push(c));
    if (M.R.status) ids.push(M.fieldId(M.fact.name, M.R.status.col.name));
    M.names.forEach((n) => ids.push(n));
    return [...new Set(ids)].filter((id) => M.fields.get(id));
  };
  const fieldOpt = (id, cur) => `<option value="${esc(id)}" ${id === cur ? 'selected' : ''}>${esc(M.fields.get(id).table)}[${esc(M.fields.get(id).col)}]</option>`;

  function rightPane(p) {
    const it = ui.item ? p.items.find((i) => i.uid === ui.item) : null;
    let html = '';
    if (!it) {
      html = `<div class="atl-r-sec"><h4>Pagina</h4>
          <label class="atl-field"><span>Nume</span><input data-pg-name="${p.id}" value="${esc(p.name)}"/></label>
          <label class="atl-field"><span>Întrebarea paginii</span><textarea rows="2" data-pg-purpose="${p.id}" placeholder="Ce află cititorul aici?">${esc(p.purpose)}</textarea></label>
          </div>
        <div class="atl-r-sec"><h4 title="Nu se văd pe pagină; cititorul le găsește în panoul Filters">Filtre pe pagină</h4>
          ${p.filters.map((f, i) => {
            const vals = D.distinctValues(M, f.field);
            return `<div class="atl-pf"><div class="atl-pf-h"><b>${esc(M.fields.get(f.field) ? M.fields.get(f.field).col : f.field)}</b><span>${f.values.length ? f.values.length + ' alese' : 'toate'}</span><button class="atl-icon-btn atl-sm" data-act="pf-del" data-i="${i}">${icon('x')}</button></div>
              <div class="atl-pf-vals">${vals.slice(0, 40).map((v) => `<label><input type="checkbox" data-pf="${i}" data-v="${esc(JSON.stringify(v))}" ${f.values.some((x) => D.keyOf(x) === D.keyOf(v)) ? 'checked' : ''}/>${esc(D.displayValue(M, f.field, v))}</label>`).join('')}</div></div>`;
          }).join('')}
          <label class="atl-field"><span>Adaugă filtru</span><select data-pf-add><option value="">Alege câmpul…</option>${filterFields().map((id) => fieldOpt(id)).join('')}</select></label></div>
        <div class="atl-r-sec"><h4 title="În Power BI: View → Themes">Culori</h4><div class="atl-pal">${Object.keys(Ch.PALETTES).map((k) => `<button class="${S.theme === k ? 'on' : ''}" data-pal="${k}" title="${esc(Ch.PALETTES[k].name)}"><span>${Ch.PALETTES[k].colors.slice(0, 5).map((c) => `<i style="background:${c}"></i>`).join('')}</span>${esc(Ch.PALETTES[k].name)}</button>`).join('')}</div></div>`;
    } else if (it.kind === 'visual') {
      const s = specOf(it.type, it.enc);
      html = `<div class="atl-r-sec"><h4>${icon(it.type)} ${esc(s ? s.visual : 'Vizual')}</h4>
          <button class="atl-btn atl-btn-xs atl-wide" data-act="guide">Ghidul vizualului</button>
          <label class="atl-field"><span>Titlu</span><textarea rows="2" data-it="title">${esc(it.title || '')}</textarea></label>
          <label class="atl-switch"><input type="checkbox" data-it-bool="showTitle" ${it.showTitle !== false ? 'checked' : ''}/><span></span>Arată titlul</label>
          <label class="atl-switch"><input type="checkbox" data-it-bool="labels" ${it.labels !== false ? 'checked' : ''}/><span></span>Etichete de date</label></div>
        <div class="atl-r-sec"><h4 title="În Power BI: Format → Edit interactions">Interacțiuni</h4>
          <label class="atl-switch"><input type="checkbox" data-it-bool="interact" ${it.interact !== false ? 'checked' : ''}/><span></span>Răspunde la click-uri</label>
</div>
        ${s ? `<div class="atl-r-sec"><h4>Câmpuri</h4>${varyHtml(s)}</div>` : ''}
        ${s && s.filters.some((f) => f.apply && f.apply.field) ? `<div class="atl-r-sec"><h4>Filtre pe vizual</h4>${s.filters.map((f, i) => f.apply && f.apply.field ? `<label class="atl-switch"><input type="checkbox" data-it-vf="${i}" ${(it.vf || []).includes(i) ? 'checked' : ''}/><span></span>${esc(f.text)}</label>` : '').join('')}</div>` : ''}
        <div class="atl-r-sec"><button class="atl-btn atl-btn-xs atl-btn-ghost atl-wide" data-act="item-del">${icon('trash')} Scoate de pe pagină</button></div>`;
    } else if (it.kind === 'slicer') {
      html = `<div class="atl-r-sec"><h4>${icon('slicer')} Slicer</h4>
          <label class="atl-field"><span>Field</span><select data-it="field">${filterFields().map((id) => fieldOpt(id, it.field)).join('')}</select></label>
          <label class="atl-field"><span>Stil</span><select data-it="style">${[['list', 'Listă verticală (Vertical list)'], ['dropdown', 'Dropdown'], ['tile', 'Plăci (Tile)']].map(([v, l]) => `<option value="${v}" ${it.style === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
          <label class="atl-field"><span>Antet</span><input data-it="title" value="${esc(it.title || '')}" placeholder="${esc(M.fields.get(it.field) ? M.fields.get(it.field).col : '')}"/></label>
</div>
        <div class="atl-r-sec"><button class="atl-btn atl-btn-xs atl-btn-ghost atl-wide" data-act="item-del">${icon('trash')} Scoate de pe pagină</button></div>`;
    } else {
      html = `<div class="atl-r-sec"><h4>${icon('text')} Text box</h4>
          <label class="atl-field"><span>Text</span><textarea rows="3" data-it="text">${esc(it.text || '')}</textarea></label>
          <label class="atl-field"><span>Mărime</span><select data-it="size">${[['h', 'Titlu'], ['s', 'Subtitlu'], ['p', 'Text']].map(([v, l]) => `<option value="${v}" ${it.size === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
        <div class="atl-r-sec"><button class="atl-btn atl-btn-xs atl-btn-ghost atl-wide" data-act="item-del">${icon('trash')} Scoate de pe pagină</button></div>`;
    }
    return `<aside class="atl-b-right"><div class="atl-r-tabs"><span>${it ? 'Format' : 'Pagină'}</span>${it ? `<button class="atl-link" data-act="deselect">← pagina</button>` : ''}</div>${html}</aside>`;
  }

  /* ---------- verificarea paginii ---------- */
  function checkPage(p) {
    const res = [];
    const vis = p.items.filter((i) => i.kind === 'visual');
    const spec = (i) => specOf(i.type, i.enc);
    const ok = (t) => res.push({ ok: true, t });
    const no = (t) => res.push({ ok: false, t });
    if (!p.items.length) { no('Pagina e goală. Trage vizualele din stânga.'); return res; }
    if (p.purpose.trim().length > 5) ok('Pagina are o întrebare.'); else no('Scrie întrebarea paginii: decide ce intră și ce nu.');
    if (vis.length > 8) no(`${vis.length} vizuale: prea multe. Țintește 4–8.`); else if (vis.length) ok(`${vis.length} vizuale, ușor de citit.`);
    const cards = vis.filter((i) => ['card', 'multicard', 'kpi', 'gauge'].includes(i.type));
    const others = vis.filter((i) => !cards.includes(i));
    if (vis.length >= 3 && !cards.length) no('Lipsește o cifră-cheie (card sau KPI) sus.');
    if (cards.length && others.length) {
      const cy = Math.min(...cards.map((i) => i.y)), oy = Math.min(...others.map((i) => i.y));
      if (cy > oy + 16) no('Mută cardurile sus: ochiul începe din stânga-sus.'); else ok('Cifrele-cheie sunt sus.');
    }
    const pies = vis.filter((i) => i.type === 'pie' || i.type === 'donut');
    if (pies.length >= 2) no(`${pies.length} grafice circulare: păstrează unul.`);
    pies.forEach((i) => { const s = spec(i); const f = s && M.fields.get(s.spec.legend); if (f && f.card > 5) no(`„${i.title}”: ${f.card} felii. Peste 5, folosește bare.`); });
    let ov = 0;
    p.items.forEach((a, i) => p.items.slice(i + 1).forEach((b) => { if (overlaps(a, b)) ov++; }));
    if (ov) no(`${ov} ${ov === 1 ? 'suprapunere' : 'suprapuneri'} între elemente.`); else ok('Nimic nu se suprapune.');
    const lefts = p.items.map((i) => i.x);
    const near = lefts.some((x, i) => lefts.some((y, j) => i !== j && Math.abs(x - y) > 0 && Math.abs(x - y) < 16));
    if (near) no('Margini aproape aliniate: Format → Align în Power BI.');
    const timeVis = vis.filter((i) => { const s = spec(i); return s && s.family === 'time'; });
    const hasYear = M.time && M.time.year && (p.items.some((i) => i.kind === 'slicer' && i.field === M.time.year) || p.filters.some((f) => f.field === M.time.year));
    if (M.years.length > 1 && vis.length && !hasYear) no('Mai mulți ani în date: adaugă un slicer de An.');
    else if (hasYear) ok('Cititorul poate alege anul.');
    if (M.R.status) {
      const sid = M.fieldId(M.fact.name, M.R.status.col.name);
      const decided = p.filters.some((f) => f.field === sid) || p.items.some((i) => (i.kind === 'slicer' && i.field === sid) || ((i.vf || []).length));
      if (!decided && vis.some((i) => { const s = spec(i); return s && (s.measures || []).includes('total'); })) no(`${M.R.status.bad.join(' / ')} intră în cifre? Decide cu un filtru pe ${M.R.status.col.name}.`);
    }
    const first = [...vis].sort((a, b) => a.y - b.y || a.x - b.x)[0];
    if (first && first.type === 'table' && vis.length > 1) no('Tabelul e primul pe pagină: mută-l jos.');
    const noTitle = vis.filter((i) => i.showTitle === false);
    if (noTitle.length) no(`${noTitle.length} ${noTitle.length === 1 ? 'vizual fără' : 'vizuale fără'} titlu.`);
    const qs = vis.map((i) => i.title);
    if (new Set(qs).size < qs.length) no('Două vizuale au același titlu.');
    const outside = p.items.filter((i) => i.x + i.w > CW || i.y + i.h > CH);
    if (outside.length) no('Un element iese din pagină.');
    return res;
  }

  function viewBuilder() {
    const p = page();
    if (!p.items.some((i) => i.uid === ui.item)) ui.item = null;
    const checks = ui.check ? checkPage(p) : null;
    return `<div class="atl-builder${ui.reader ? ' is-reader' : ''}">
      ${leftPane(p)}
      <section class="atl-b-center">
        <div class="atl-b-toolbar">
          <div class="atl-b-title"><b>${esc(p.name)}</b>${p.purpose ? `<span>${esc(p.purpose)}</span>` : ''}</div>
          <div class="atl-b-actions">
            ${ui.sel ? `<button class="atl-btn atl-btn-xs" data-act="clear-sel">${icon('x')} Șterge selecția</button>` : ''}
            <button class="atl-btn atl-btn-xs${ui.check ? ' is-on' : ''}" data-act="check">${icon('check')} Verifică pagina</button>
            <button class="atl-btn atl-btn-xs${ui.reader ? ' is-on' : ''}" data-act="reader">${icon('eye')} ${ui.reader ? 'Editează' : 'Previzualizare'}</button>
          </div>
        </div>
        ${checks ? `<div class="atl-check"><div class="atl-check-h"><b>${checks.filter((c) => c.ok).length} din ${checks.length} în regulă</b><button class="atl-icon-btn atl-sm" data-act="check" aria-label="Închide">${icon('x')}</button></div><ul>${checks.map((c) => `<li class="${c.ok ? 'is-ok' : 'is-no'}">${icon(c.ok ? 'check' : 'alert')}<span>${esc(c.t)}</span></li>`).join('')}</ul></div>` : ''}
        <div class="atl-canvas-wrap" data-wrap>${canvasHtml(p, ui.reader)}</div>
        <div class="atl-b-tabs" role="tablist">${S.pages.map((x) => `<button class="${x.id === p.id ? 'on' : ''}" data-act="page" data-page-id="${x.id}">${esc(x.name)}<span>${x.items.length}</span></button>`).join('')}<button class="atl-b-addtab" data-act="newpage" aria-label="Pagină nouă">${icon('plus')}</button></div>
        <p class="atl-narrow-note">Pe ecran lat se lucrează mai ușor.</p>
      </section>
      ${ui.reader ? '' : rightPane(p)}
    </div>`;
  }

  let ro = null;
  function fitCanvas() {
    const wrap = $('[data-wrap]');
    const cv = $('[data-canvas]');
    if (!wrap || !cv) return;
    const k = Math.min(1.25, wrap.clientWidth / CW);
    cv.style.transform = `scale(${k})`;
    wrap.style.height = CH * k + 'px';
    wrap.dataset.k = k;
  }
  function afterBuilder() {
    fitCanvas();
    if (!ro && window.ResizeObserver) ro = new ResizeObserver(() => fitCanvas());
    const wrap = $('[data-wrap]');
    if (ro && wrap) ro.observe(wrap);
  }
  function renderBuilderParts() {
    if (view() !== 'construieste') return;
    const y = window.scrollY;
    app.innerHTML = viewBuilder();
    afterBuilder();
    window.scrollTo({ top: y });
  }

  /* ---------- tragere și redimensionare pe canvas ---------- */
  let drag = null;
  function canvasPoint(e) {
    const cv = $('[data-canvas]');
    const r = cv.getBoundingClientRect();
    const k = r.width / CW;
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k, k };
  }
  function onPointerDown(e) {
    if (view() === 'model') { if (M) Mo.onPointerDown(e); return; }
    if (view() !== 'construieste' || e.button !== 0) return;
    const itEl = e.target.closest('.atl-item');
    const cv = e.target.closest('[data-canvas]');
    if (!cv) return;
    if (!itEl) {
      if (!ui.reader && (ui.item || ui.sel)) { ui.item = null; ui.sel = null; renderBuilderParts(); }
      return;
    }
    if (e.target.closest('.atl-item-x, input, select, textarea, label, summary, button, details, [data-decomp]')) return;
    const p = page();
    const it = p.items.find((i) => i.uid === itEl.dataset.uid);
    if (!it) return;
    const pt = canvasPoint(e);
    drag = { it, el: itEl, start: pt, ox: it.x, oy: it.y, ow: it.w, oh: it.h, rs: !!e.target.closest('[data-rs]'), moved: false, target: e.target };
    if (ui.reader) drag.readonly = true;
    itEl.setPointerCapture && itEl.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (view() === 'model') { if (M) Mo.onPointerMove(e); return; }
    if (!drag || drag.readonly) return;
    const pt = canvasPoint(e);
    const dx = pt.x - drag.start.x, dy = pt.y - drag.start.y;
    if (!drag.moved && Math.hypot(dx, dy) * pt.k < 4) return;
    drag.moved = true;
    drag.el.classList.add('is-dragging');
    if (drag.rs) {
      drag.it.w = Math.max(120, Math.min(CW - drag.it.x, snap(drag.ow + dx)));
      drag.it.h = Math.max(56, Math.min(CH - drag.it.y, snap(drag.oh + dy)));
      drag.el.style.width = drag.it.w + 'px';
      drag.el.style.height = drag.it.h + 'px';
    } else {
      drag.it.x = clampX(snap(drag.ox + dx), drag.it.w);
      drag.it.y = clampY(snap(drag.oy + dy), drag.it.h);
      drag.el.style.left = drag.it.x + 'px';
      drag.el.style.top = drag.it.y + 'px';
    }
  }
  function onPointerUp(e) {
    if (view() === 'model') { if (M) Mo.onPointerUp(e); return; }
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.moved) { ui.item = d.it.uid; save(); renderBuilderParts(); return; }
    // click: filtrare încrucișată și selecție
    const selEl = d.target.closest('[data-sel]');
    const p = page();
    if (selEl && d.it.kind === 'visual') {
      let pairs = [];
      try { pairs = JSON.parse(selEl.getAttribute('data-sel')); } catch (err) { pairs = []; }
      const same = ui.sel && ui.sel.uid === d.it.uid && JSON.stringify(ui.sel.pairs) === JSON.stringify(pairs);
      ui.sel = same || !pairs.length ? null : { page: p.id, uid: d.it.uid, pairs };
    }
    if (!d.readonly) ui.item = d.it.uid;
    renderBuilderParts();
  }

  /* ======================================================================
     PLAN
     ====================================================================== */
  function usedSpecs() {
    const out = [];
    S.pages.forEach((p) => {
      const seen = new Set();
      p.items.filter((i) => i.kind === 'visual').forEach((i) => { const s = specOf(i.type, i.enc); if (s) { out.push({ p, s, it: i }); seen.add(i.bid); } });
      p.basket.filter((b) => !seen.has(b.id)).forEach((b) => { const s = specOf(b.type, b.enc); if (s) out.push({ p, s, it: null }); });
    });
    return out;
  }
  function viewPlan() {
    const used = usedSpecs();
    const allMeasures = C.measureChain(M, [].concat(...used.map((u) => u.s.measures || [])));
    const useCount = (id) => used.filter((u) => C.measureChain(M, u.s.measures || []).includes(id)).length;
    const calcIds = [...new Set([].concat(...used.map((u) => u.s.calcCols || [])))];
    const calc = calcIds.map((id) => M.calcCols.find((c) => c.id === id)).filter(Boolean);
    const custom = [].concat(...used.map((u) => u.s.customMeasures || []));
    const needCal = M.virtualCalendar && used.some((u) => usesCalendar(u.s));
    const monthUsed = M.time && M.time.month && used.some((u) => JSON.stringify(u.s.spec).includes(M.time.month));
    const showDax = ui.dax;
    const daxPre = (t) => (showDax ? `<pre class="atl-plan-dax"><code>${esc(t)}</code></pre>` : '');
    const modelSteps = [];
    M.rels.filter((r) => !r.virtual).forEach((r) => modelSteps.push(`Relație ${r.from.table}[${r.from.col}] → ${r.to.table}[${r.to.col}] · Many to one (*:1) · Single.`));
    if (needCal) modelSteps.push(`Creează tabelul Calendar (Modeling → New table) și leagă-l: ${M.rels.find((r) => r.virtual).from.table}[${M.rels.find((r) => r.virtual).from.col}] → Calendar[Data].`);
    if (M.calendar && M.time && M.time.date) modelSteps.push(`Table tools → Mark as date table → ${M.fields.get(M.time.date).table}[${M.fields.get(M.time.date).col}].`);
    if (monthUsed) { const f = M.fields.get(M.time.month); modelSteps.push(`Sortează ${f.table}[${f.col}] după ${f.sortByCol || 'Luna'} (Column tools → Sort by column).`); }
    if (M.time && M.time.year) modelSteps.push(`${M.fields.get(M.time.year).table}[${M.fields.get(M.time.year).col}] → Column tools → Summarization: Don't summarize.`);

    const pagesHtml = S.pages.map((p, pi) => {
      const vis = p.items.filter((i) => i.kind !== 'text').sort((a, b) => a.y - b.y || a.x - b.x);
      const unplaced = p.basket.filter((b) => !p.items.some((i) => i.bid === b.id));
      const k = 0.5;
      const thumb = p.items.length ? `<div class="atl-thumb" style="width:${CW * k}px;height:${CH * k}px"><div style="transform:scale(${k});transform-origin:0 0">${canvasHtml(p, true)}</div></div>` : '';
      const rowFor = (s, it) => `<li class="atl-plan-vis"><div class="atl-plan-vis-h">${icon(s.type)}<b>${esc(it && it.title ? it.title : s.question)}</b><span>${esc(s.visual)}</span>${lvlDots(s.level)}</div>
          <div class="atl-plan-wells">${s.wells.map((w) => `<span><em>${esc(w.zone)}:</em> ${w.items.map((x) => (x.t === 'm' ? `[${esc(x.name)}]` : x.menu ? `${esc(x.table)} → ${esc(x.col)}` : `${esc(x.table)}[${esc(x.col)}]${x.agg ? ' (' + esc(x.agg) + ')' : ''}`)).join(', ')}</span>`).join('')}</div>
          ${s.filters.length ? `<div class="atl-plan-f">${icon('filter')} ${s.filters.map((f) => esc(f.text) + ((it && (it.vf || []).includes(s.filters.indexOf(f))) || (f.apply && f.apply.topN) ? ' ✓' : ' (opțional)')).join(' · ')}</div>` : ''}
          <details class="atl-plan-fmt"><summary>Formatare</summary><ul>${s.format.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></details></li>`;
      const slicers = p.items.filter((i) => i.kind === 'slicer');
      const qs = storyQs(p);
      const qHtml = qs.length ? `<ul class="atl-plan-qs">${qs.map((q) => {
        const bs = p.basket.filter((b) => b.q === q.id).map((b) => specOf(b.type, b.enc)).filter(Boolean);
        return `<li class="${bs.length ? 'is-ok' : 'is-no'}">${icon(bs.length ? 'check' : 'alert')}<span><b>${esc(q.text)}</b> <em>${esc(SD.kindOf(q.kind).label)}</em> → ${bs.length ? bs.map((s) => esc(s.visual)).join(', ') : 'încă fără vizual'}</span></li>`;
      }).join('')}</ul>` : '';
      const meta = [p.audience ? `Pentru: ${p.audience}` : '', (p.wantFilters || []).filter((id) => M.fields.get(id)).length ? `Vrea să filtreze după: ${p.wantFilters.filter((id) => M.fields.get(id)).map((id) => M.fields.get(id).col).join(', ')}` : ''].filter(Boolean);
      return `<section class="atl-plan-page"><div class="atl-plan-ph"><span class="atl-plan-n">Pagina ${pi + 1}</span><h3>${esc(p.name)}</h3>${p.purpose ? `<p class="atl-plan-purpose">„${esc(p.purpose)}”</p>` : '<p class="atl-muted">Pagina nu are încă o întrebare.</p>'}${meta.length ? `<p class="atl-plan-meta">${meta.map(esc).join(' · ')}</p>` : ''}${qHtml}</div>
        ${thumb}
        ${slicers.length || p.filters.length ? `<p class="atl-plan-f">${slicers.map((sl) => `${icon('slicer')} Slicer ${esc(M.fields.get(sl.field) ? M.fields.get(sl.field).col : '')} (${sl.style === 'tile' ? 'Tile' : sl.style === 'dropdown' ? 'Dropdown' : 'Vertical list'})`).join(' · ')}${p.filters.length ? ` ${icon('filter')} Pe pagină: ${p.filters.map((f) => `${esc(M.fields.get(f.field) ? M.fields.get(f.field).col : f.field)} = ${f.values.length ? f.values.map((v) => esc(D.displayValue(M, f.field, v))).join(', ') : 'toate'}`).join('; ')}` : ''}</p>` : ''}
        <ol class="atl-plan-list">${vis.filter((i) => i.kind === 'visual').map((i) => { const s = specOf(i.type, i.enc); return s ? rowFor(s, i) : ''; }).join('')}${unplaced.map((b) => { const s = specOf(b.type, b.enc); return s ? rowFor(s, null) : ''; }).join('')}</ol>
        ${unplaced.length ? `<p class="atl-muted atl-small">${unplaced.length} ${unplaced.length === 1 ? 'vizual ales nu e' : 'vizuale alese nu sunt'} încă pe canvas.</p>` : ''}
      </section>`;
    }).join('');

    return `<div class="atl-wrap atl-plan">
      <header class="atl-head atl-head-row"><div><h2>Plan</h2><p>În ordinea în care lucrezi în Power BI Desktop. Bifează pe măsură ce avansezi.</p></div>
        <div class="atl-plan-actions">
          <label class="atl-switch"><input type="checkbox" data-act-change="dax" ${showDax ? 'checked' : ''}/><span></span>Formulele DAX</label>
          <button class="atl-btn atl-btn-sm" data-act="print">${icon('print')} PDF</button>
          <button class="atl-btn atl-btn-sm atl-btn-ghost" data-act="export">${icon('download')} Exportă</button>
          <button class="atl-btn atl-btn-sm atl-btn-ghost" data-act="import">Importă</button>
          <input type="file" id="atl-import" accept=".json,application/json" hidden />
        </div></header>
      ${S.story.audience || S.story.decision ? `<section class="atl-plan-story">${[['users', 'Cititorul', S.story.audience], ['target', 'Decizia', S.story.decision]].filter((x) => x[2]).map(([ic, l, v]) => `<div>${icon(ic)}<span>${l}</span><b>${esc(v)}</b></div>`).join('')}</section>` : ''}
      ${!used.length ? `<div class="atl-need"><p>Nu ai ales încă niciun vizual. <a href="#biblioteca">Mergi la bibliotecă →</a></p></div>` : `
      <section class="atl-plan-sec"><h3><span>1</span> Modelul</h3><ul class="atl-plan-checks">${modelSteps.map((t) => `<li><label><input type="checkbox"/><span>${esc(t)}</span></label></li>`).join('')}</ul>${needCal ? daxPre(calTable()) : ''}</section>
      ${calc.length ? `<section class="atl-plan-sec"><h3><span>2</span> Coloane calculate</h3><ul class="atl-plan-checks">${calc.map((c) => `<li><label><input type="checkbox"/><span><code>${esc(c.table)}[${esc(c.name)}]</code> ${esc(c.plain)}<br/><small class="atl-muted">Indiciu: ${esc(c.hint)}</small></span></label>${daxPre(c.dax)}</li>`).join('')}</ul></section>` : ''}
      <section class="atl-plan-sec"><h3 title="Ține-le într-un tabel separat de măsuri (Home → Enter data)"><span>${calc.length ? 3 : 2}</span> Măsuri</h3>
        <ul class="atl-plan-checks">${allMeasures.map((id) => { const ms = M.measures.get(id); const ex = expected(id); return `<li><label><input type="checkbox"/><span><code>[${esc(ms.name)}]</code> ${lvlDots(ms.level || 1)} <small class="atl-muted">· folosită de ${useCount(id)} ${useCount(id) === 1 ? 'vizual' : 'vizuale'}</small><br/>${esc(ms.plain)}${ex != null ? ` <b class="atl-exp-in">Rezultat fără filtre: ${esc(D.fmtFull(ex, ms.fmt))}</b>` : ''}<br/><small class="atl-muted">Indiciu: ${esc(ms.hint)}</small></span></label>${daxPre(ms.dax)}</li>`; }).join('')}
        ${custom.map((c) => `<li><label><input type="checkbox"/><span><b>${esc(c.name)}</b> ${lvlDots(c.level || 3)}<br/>${esc(c.plain)}<br/><small class="atl-muted">Indiciu: ${esc(c.hint)}</small></span></label>${daxPre(c.dax)}</li>`).join('')}</ul></section>
      <section class="atl-plan-sec"><h3><span>${calc.length ? 4 : 3}</span> Paginile</h3>${pagesHtml}</section>
      <section class="atl-plan-sec atl-plan-final"><h3>${icon('check')} Înainte să predai</h3><ul class="atl-plan-checks">${[
        'Fiecare pagină are un titlu care spune ce afli de pe ea.',
        'Aceleași culori pentru aceleași categorii, pe toate paginile.',
        'Cardurile sunt sus, tabelele de detaliu jos.',
        'Fiecare măsură dă rezultatul de mai sus pe datele nefiltrate.',
        'Slicerele și filtrele de pagină fac ce te aștepți (încearcă-le ca un cititor).',
        'Ai ascuns din Report view tabelele și coloanele de care cititorul nu are nevoie (cheile).'
      ].map((t) => `<li><label><input type="checkbox"/><span>${esc(t)}</span></label></li>`).join('')}</ul></section>`}
    </div>`;
  }

  function exportProject() {
    const blob = new Blob([JSON.stringify(S)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'atelier-raport-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  async function importProject(file) {
    try {
      const obj = JSON.parse(await file.text());
      if (!obj || obj.v !== 1 || !Array.isArray(obj.tables) || !Array.isArray(obj.pages)) throw new Error('format');
      if (!obj.pages.length) { const p = newPage('Prezentare generală'); obj.pages = [p]; obj.active = p.id; }
      S = normalize(obj);
      rebuild(); save(); ui.item = null; ui.sel = null;
      toast('Proiect importat.');
      go('biblioteca');
    } catch (e) { toast('Fișierul nu e un proiect de atelier valid.'); }
  }

  /* ======================================================================
     EVENIMENTE
     ====================================================================== */
  function addPage(name) {
    const base = name || 'Pagina ' + (S.pages.length + 1);
    const p = newPage(base);
    S.pages.push(p);
    S.active = p.id;
    ui.item = null; ui.sel = null;
    save();
    return p;
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    // paginile noi își tratează singure click-urile
    const v = view();
    if (M && v === 'model' && Mo.onClick(e)) return;
    if (M && v === 'intelege' && U.onClick(e)) return;
    if (M && v === 'poveste' && St.onClick(e)) return;
    const actEl = t.closest('[data-act]');
    const act = actEl && actEl.getAttribute('data-act');

    // bibliotecă: familii
    const famBtn = t.closest('[data-fam]');
    if (famBtn) { ui.lib.fam = famBtn.dataset.fam; refreshLibrary(); return; }
    const tabBtn = t.closest('[data-tab]');
    if (tabBtn && drawer.contains(tabBtn)) { ui.tab = tabBtn.dataset.tab; renderDrawer(); return; }
    const palBtn = t.closest('[data-pal]');
    if (palBtn) { S.theme = palBtn.dataset.pal; save(); renderBuilderParts(); return; }
    const pgEl = t.closest('.atl-pg');
    if (pgEl && !act && !t.closest('input')) { S.active = pgEl.dataset.page; save(); refreshLibrary(); return; }
    if (pgEl && t.closest('input')) { if (S.active !== pgEl.dataset.page) { S.active = pgEl.dataset.page; save(); $$('.atl-pg').forEach((x) => x.classList.toggle('is-active', x === pgEl)); } }

    // slicer pe canvas
    const slBtn = t.closest('[data-sl-v]');
    if (slBtn && slBtn.tagName === 'BUTTON') { slicerToggle(slBtn); return; }
    if (t.closest('[data-sl-clear]')) { const it = itemOf(t); if (it) { it.values = []; save(); renderBuilderParts(); } return; }
    const dc = t.closest('[data-decomp]');
    if (dc && view() === 'construieste') {
      const it = itemOf(dc);
      if (it) { const lv = +dc.dataset.decomp; it.decompPath = (it.decompPath || []).slice(0, lv).concat([JSON.parse(dc.dataset.dv)]); save(); renderBuilderParts(); }
      return;
    }

    // card din bibliotecă
    const vc = t.closest('.atl-vcard');
    if (vc && !act) {
      const key = vc.dataset.key;
      if (ui.lib.guess && !ui.lib.revealed.has(key)) { ui.lib.revealed.add(key); refreshLibrary(); return; }
      const s = LIST.find((x) => x.key === key);
      if (s) openDrawer({ kind: 'lib', type: s.type, enc: JSON.parse(JSON.stringify(s.enc)) });
      return;
    }
    if (!act) return;
    switch (act) {
      case 'demo': loadDemo(actEl.dataset.demo); break;
      case 'answer': {
        const qid = actEl.dataset.q;
        if (actEl.dataset.pageId) S.active = actEl.dataset.pageId;
        const q = page().questions.find((x) => x.id === qid);
        if (!q || ui.lib.answer === qid) { ui.lib.answer = null; refreshLibrary(); break; }
        ui.lib.answer = qid;
        const counts = {};
        LIST.forEach((s) => { counts[s.family] = (counts[s.family] || 0) + 1; });
        ui.lib = Object.assign(ui.lib, { fam: SD.kindOf(q.kind).fams.find((f) => counts[f]) || 'all', q: '', field: '', lvl: 0 });
        refreshLibrary();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }
      case 'answer-off': ui.lib.answer = null; refreshLibrary(); break;
      case 'guess': ui.lib.guess = !ui.lib.guess; ui.lib.revealed.clear(); refreshLibrary(); break;
      case 'lib-clear': ui.lib = Object.assign(ui.lib, { fam: 'all', lvl: 0, q: '', field: '' }); refreshLibrary(); break;
      case 'pick': { const f = $('#atl-file'); if (f) f.click(); break; }
      case 'rmfile': {
        const name = actEl.dataset.file;
        S.tables = S.tables.filter((x) => x.file !== name);
        S.files = S.files.filter((x) => x !== name);
        rebuild(); save(); render(); break;
      }
      case 'reset':
        if (!ui.confirmReset) { ui.confirmReset = true; render(); setTimeout(() => { ui.confirmReset = false; }, 4000); break; }
        ui.confirmReset = false; S = fresh(); rebuild(); save(); ui.item = null; ui.sel = null; render(); toast('Am șters tot. Poți începe din nou.'); break;
      case 'add': {
        const card = actEl.closest('.atl-vcard');
        const s = LIST.find((x) => x.key === card.dataset.key);
        const p = page();
        const b = s && p.basket.find((x) => C.keyOf(x.type, x.enc) === s.key);
        if (b) { p.basket = p.basket.filter((x) => x !== b); p.items = p.items.filter((i) => i.bid !== b.id); save(); toast(`Scos de pe „${p.name}”.`); refreshLibrary(); break; }
        if (s && addToPage(s.type, s.enc)) refreshLibrary();
        break;
      }
      case 'custom': {
        const s = LIST.find((x) => x.type === 'barClustered') || LIST[0];
        if (s) openDrawer({ kind: 'lib', type: s.type, enc: JSON.parse(JSON.stringify(s.enc)), vary: true });
        break;
      }
      case 'newpage': { addPage(actEl.dataset.name); if (view() === 'construieste') renderBuilderParts(); else refreshLibrary(); break; }
      case 'delpage': {
        const id = actEl.dataset.pageId;
        S.pages = S.pages.filter((p) => p.id !== id);
        if (S.active === id) S.active = S.pages[0].id;
        save(); refreshLibrary(); break;
      }
      case 'unbasket': {
        const p = page(actEl.dataset.pageId);
        const bid = actEl.dataset.bid;
        p.basket = p.basket.filter((b) => b.id !== bid);
        p.items = p.items.filter((i) => i.bid !== bid);
        save(); refreshLibrary(); break;
      }
      case 'close': closeDrawer(); if (view() === 'biblioteca') refreshLibrary(); break;
      case 'hint': { const h = $(`[data-hint="${actEl.dataset.r}"]`, drawer); if (h) { h.hidden = false; actEl.hidden = true; } break; }
      case 'dax': { const c = $(`[data-dax="${actEl.dataset.r}"]`, drawer); if (c) { c.hidden = !c.hidden; actEl.textContent = c.hidden ? 'Arată formula' : 'Ascunde formula'; } break; }
      case 'copy': {
        const txt = actEl.dataset.copy;
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast('Formula e în clipboard.'), () => toast('Nu am putut copia. Selectează textul manual.'));
        break;
      }
      case 'dr-add': {
        const sel = $('[data-dr-page]', drawer);
        let pid = sel ? sel.value : S.active;
        if (pid === '__new') pid = addPage().id;
        const d = ui.drawer;
        if (addToPage(d.type, d.enc, pid)) { S.active = pid; save(); closeDrawer(); refreshLibrary(); }
        break;
      }
      case 'place': { const p = page(); const b = p.basket.find((x) => x.id === actEl.dataset.bid); if (b) { placeFromBasket(p, b); renderBuilderParts(); } break; }
      case 'place-el': { placeElement(page(), actEl.dataset.new); renderBuilderParts(); break; }
      case 'item-del': {
        const p = page();
        const id = actEl.closest('.atl-item') ? actEl.closest('.atl-item').dataset.uid : ui.item;
        p.items = p.items.filter((i) => i.uid !== id);
        if (ui.sel && ui.sel.uid === id) ui.sel = null;
        ui.item = null; save(); renderBuilderParts(); break;
      }
      case 'deselect': ui.item = null; renderBuilderParts(); break;
      case 'clear-sel': ui.sel = null; renderBuilderParts(); break;
      case 'check': ui.check = !ui.check; renderBuilderParts(); break;
      case 'reader': ui.reader = !ui.reader; ui.item = null; renderBuilderParts(); break;
      case 'page': S.active = actEl.dataset.pageId; ui.item = null; ui.sel = null; save(); renderBuilderParts(); break;
      case 'guide': { const it = page().items.find((i) => i.uid === ui.item); if (it) openDrawer({ kind: 'item', page: S.active, uid: it.uid }); break; }
      case 'print': $$('details').forEach((d) => { d.open = true; }); window.print(); break;
      case 'export': exportProject(); break;
      case 'import': { const f = $('#atl-import'); if (f) f.click(); break; }
      default: break;
    }
  });

  function itemOf(el) { const n = el.closest('.atl-item'); return n ? page().items.find((i) => i.uid === n.dataset.uid) : null; }
  function slicerToggle(el) {
    const it = itemOf(el);
    if (!it) return;
    const v = JSON.parse(el.getAttribute('data-sl-v'));
    const k = D.keyOf(v);
    const has = (it.values || []).some((x) => D.keyOf(x) === k);
    it.values = has ? it.values.filter((x) => D.keyOf(x) !== k) : (it.values || []).concat([v]);
    save();
    renderBuilderParts();
  }

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (M && view() === 'model' && Mo.onChange(e)) return;
    if (M && view() === 'poveste' && St.onChange(e)) return;
    if (t.id === 'atl-file') { addFiles(t.files, false); t.value = ''; return; }
    if (t.id === 'atl-import') { if (t.files[0]) importProject(t.files[0]); t.value = ''; return; }
    if (t.matches('[data-act-change="fact"]')) { S.overrides = { fact: t.value }; rebuild(); save(); render(); return; }
    if (t.matches('[data-act-change="dax"]')) { ui.dax = t.checked; render(); return; }
    if (t.matches('[data-rel-from], [data-rel-to]')) {
      const dim = t.getAttribute('data-rel-from') || t.getAttribute('data-rel-to');
      const from = $(`[data-rel-from="${CSS.escape(dim)}"]`).value;
      const to = $(`[data-rel-to="${CSS.escape(dim)}"]`).value;
      S.overrides = Object.assign({}, S.overrides, { fact: M.fact.name, rels: Object.assign({}, (S.overrides || {}).rels, { [dim]: from ? { from, to } : null }) });
      rebuild(); save(); render(); return;
    }
    if (t.matches('[data-lib-lvl]')) { ui.lib.lvl = +t.value; refreshLibrary(); return; }
    if (t.matches('[data-lib-field]')) { ui.lib.field = t.value; refreshLibrary(); return; }
    if (t.matches('[data-lib-guess]')) { ui.lib.guess = t.checked; ui.lib.revealed.clear(); refreshLibrary(); return; }
    if (t.matches('[data-vary-type], [data-slot]')) {
      if (drawer.contains(t)) { varyChange(t); return; }
      // din panoul Format al builder-ului
      const it = page().items.find((i) => i.uid === ui.item);
      if (it) { ui.drawer = { kind: 'item', page: S.active, uid: it.uid }; varyChange(t); closeDrawer(); renderBuilderParts(); }
      return;
    }
    if (t.matches('[data-vf]') && ui.drawer) {
      const s = drawerSpec();
      const i = +t.dataset.vf;
      if (ui.drawer.kind === 'item') {
        const it = findItem(ui.drawer.page, ui.drawer.uid);
        it.vf = t.checked ? [...new Set((it.vf || []).concat(i))] : (it.vf || []).filter((x) => x !== i);
        save(); renderBuilderParts();
      } else {
        const cur = ui.lib.flt[s.key] || [];
        ui.lib.flt[s.key] = t.checked ? [...new Set(cur.concat(i))] : cur.filter((x) => x !== i);
      }
      renderDrawer(); return;
    }
    if (t.matches('[data-dr-page]') && t.value === '__new') return;
    if (t.matches('[data-it-bool]')) { const it = page().items.find((i) => i.uid === ui.item); if (it) { it[t.dataset.itBool] = t.checked; save(); renderBuilderParts(); } return; }
    if (t.matches('[data-it-vf]')) {
      const it = page().items.find((i) => i.uid === ui.item);
      const i = +t.dataset.itVf;
      if (it) { it.vf = t.checked ? [...new Set((it.vf || []).concat(i))] : (it.vf || []).filter((x) => x !== i); save(); renderBuilderParts(); }
      return;
    }
    if (t.matches('select[data-it]')) {
      const it = page().items.find((i) => i.uid === ui.item);
      if (it) { it[t.dataset.it] = t.value; if (t.dataset.it === 'field') it.values = []; save(); renderBuilderParts(); }
      return;
    }
    if (t.matches('[data-sl-v]') && t.type === 'checkbox') { slicerToggle(t); return; }
    if (t.matches('[data-pf]')) {
      const f = page().filters[+t.dataset.pf];
      const v = JSON.parse(t.dataset.v);
      f.values = t.checked ? f.values.concat([v]) : f.values.filter((x) => D.keyOf(x) !== D.keyOf(v));
      save(); renderBuilderParts(); return;
    }
    if (t.matches('[data-pf-add]') && t.value) {
      const p = page();
      if (!p.filters.some((f) => f.field === t.value)) {
        const nf = { field: t.value, values: [] };
        if (M.R.status && t.value === M.fieldId(M.fact.name, M.R.status.col.name)) nf.values = M.R.status.good.slice();
        p.filters.push(nf);
      }
      save(); renderBuilderParts(); return;
    }
    if (t.matches('[data-pg-name], [data-pg-purpose]')) { if (view() === 'biblioteca') refreshLibrary(); else renderBuilderParts(); }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (M && view() === 'poveste' && St.onInput(e)) return;
    if (t.matches('[data-lib-q]')) {
      ui.lib.q = t.value;
      clearTimeout(t._tm);
      t._tm = setTimeout(() => {
        const box = $('.lb-results');
        if (box) box.innerHTML = resultsHtml();
      }, 180);
      return;
    }
    if (t.matches('[data-pg-name]')) { const p = page(t.dataset.pgName); if (p) { p.name = t.value || 'Pagină'; save(); const tb = $(`.atl-b-tabs [data-page-id="${p.id}"]`); if (tb) tb.firstChild.textContent = p.name; } return; }
    if (t.matches('[data-pg-purpose]')) { const p = page(t.dataset.pgPurpose); if (p) { p.purpose = t.value; save(); } return; }
    if (t.matches('textarea[data-it], input[data-it]')) {
      const it = page().items.find((i) => i.uid === ui.item);
      if (!it) return;
      it[t.dataset.it] = t.value;
      save();
      const el = $(`.atl-item[data-uid="${it.uid}"]`);
      if (el && it.kind === 'visual') { const h = $('.atl-item-h', el); if (h) h.textContent = it.title; }
      else if (el && it.kind === 'text') { const b = $('.atl-textbox', el); if (b) b.textContent = it.text; }
      else if (el && it.kind === 'slicer') { const b = $('.atl-item-b', el); if (b) b.innerHTML = Ch.slicer(M, it, {}); }
    }
  });

  // tragere fișiere pe zona de încărcare
  document.addEventListener('dragover', (e) => {
    const dz = e.target.closest('[data-drop]');
    if (dz && e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); dz.classList.add('is-over'); }
    const pg = e.target.closest('.atl-pg');
    if (pg && dragKey) { e.preventDefault(); pg.classList.add('is-over'); }
    const cv = e.target.closest('[data-wrap]');
    if (cv && dragNew) { e.preventDefault(); cv.classList.add('is-over'); }
  });
  document.addEventListener('dragleave', (e) => {
    const el = e.target.closest('[data-drop], .atl-pg, [data-wrap]');
    if (el && !el.contains(e.relatedTarget)) el.classList.remove('is-over');
  });
  document.addEventListener('click', (e) => { const dz = e.target.closest('[data-drop]'); if (dz) { const f = $('#atl-file'); if (f) f.click(); } });
  document.addEventListener('toggle', (e) => { if (M && view() === 'model') Mo.onToggle(e); }, true);
  document.addEventListener('keydown', (e) => {
    if (M && view() === 'model' && Mo.onKey(e)) return;
    if (M && view() === 'poveste' && St.onKey(e)) return;
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-drop]')) { e.preventDefault(); $('#atl-file').click(); return; }
    if (e.key === 'Escape') { if (ui.drawer) { closeDrawer(); if (view() === 'biblioteca') refreshLibrary(); } else if (view() === 'construieste' && (ui.item || ui.sel)) { ui.item = null; ui.sel = null; renderBuilderParts(); } return; }
    if (e.key === 'Enter' && e.target.matches('.atl-vcard')) { e.target.click(); return; }
    if (view() !== 'construieste' || !ui.item || ui.drawer || e.target.closest('input, textarea, select')) return;
    const p = page();
    const it = p.items.find((i) => i.uid === ui.item);
    if (!it) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { p.items = p.items.filter((i) => i !== it); ui.item = null; save(); renderBuilderParts(); e.preventDefault(); return; }
    const step = e.shiftKey ? 32 : GRID;
    const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (mv) { e.preventDefault(); it.x = clampX(it.x + mv[0], it.w); it.y = clampY(it.y + mv[1], it.h); save(); renderBuilderParts(); }
  });

  // tragere HTML5: carduri spre pagini, coș spre canvas
  let dragKey = null, dragNew = null;
  document.addEventListener('dragstart', (e) => {
    const vc = e.target.closest && e.target.closest('.atl-vcard');
    if (vc) { dragKey = vc.dataset.key; e.dataTransfer.setData('text/plain', dragKey); e.dataTransfer.effectAllowed = 'copy'; document.body.classList.add('atl-dragging'); return; }
    const bk = e.target.closest && e.target.closest('.atl-bk, .atl-el[data-new]');
    if (bk) { dragNew = bk.dataset.bid ? { bid: bk.dataset.bid } : { el: bk.dataset.new }; e.dataTransfer.setData('text/plain', 'atl'); e.dataTransfer.effectAllowed = 'copy'; }
  });
  document.addEventListener('dragend', () => { dragKey = null; dragNew = null; document.body.classList.remove('atl-dragging'); $$('.is-over').forEach((x) => x.classList.remove('is-over')); });
  document.addEventListener('drop', (e) => {
    const dz = e.target.closest('[data-drop]');
    if (dz && e.dataTransfer.files && e.dataTransfer.files.length) { e.preventDefault(); dz.classList.remove('is-over'); addFiles(e.dataTransfer.files, false); return; }
    const pg = e.target.closest('.atl-pg');
    if (pg && dragKey) {
      e.preventDefault();
      const s = LIST.find((x) => x.key === dragKey);
      dragKey = null;
      if (s && addToPage(s.type, s.enc, pg.dataset.page)) { S.active = pg.dataset.page; save(); refreshLibrary(); }
      return;
    }
    const wrap = e.target.closest('[data-wrap]');
    if (wrap && dragNew) {
      e.preventDefault();
      const p = page();
      const pt = canvasPoint(e);
      if (dragNew.bid) { const b = p.basket.find((x) => x.id === dragNew.bid); if (b && !p.items.some((i) => i.bid === b.id)) placeFromBasket(p, b, pt); }
      else placeElement(p, dragNew.el, pt);
      dragNew = null;
      renderBuilderParts();
    }
  });

  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', () => { drag = null; });

  window.addEventListener('hashchange', () => { closeDrawer(); ui.check = false; render(); });

  /* ---------- modulele noi, cu ce au nevoie din aplicație ---------- */
  const ctx = {
    get S() { return S; },
    get M() { return M; },
    esc, icon, uid, save, toast, rerender, go,
    page: () => page(),
    addPage: (name) => addPage(name),
    filterFields: () => filterFields(),
    relEditor: () => relEditor()
  };
  Mo = A.Modeler(ctx);
  U = A.Understand(ctx);
  St = A.Story(ctx);

  /* ---------- pornire ---------- */
  setupTheme();
  if (!window.XLSX) console.warn('[atelier] SheetJS nu s-a încărcat');
  rebuild();
  render();
})();
