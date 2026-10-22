/* Sesiunea 11 · Context în rapoarte (companii aeriene)
   Widget-uri, pe agregatele din js/s11-date.js (Fact_Zboruri pe lună × companie și lună × rută, plus Tinte):
   - data-s11-hook       cardul „75,9 M” la care se adaugă pe rând câte un reper
   - data-s11-yoy        aceeași lună, 2025 față de 2024, pe companie
   - data-s11-pp         puncte procentuale față de variația relativă
   - data-s11-cmp        cele 4 repere, fiecare explicat cu o schemă
   - data-s11-qoq        același trimestru: QoQ și YoY, unul lângă altul
   - data-s11-tabs       pași cu butoane (măsurile, exercițiile)
   - data-s11-visuals    același KPI în cinci vizuale
   - data-s11-quiz       „Ce vizual alegi?”
   - data-s11-tree       arborele de întrebări → pagini (cu schița paginii)
   - data-s11-story      storyboard: ordinea paginilor (drag & drop) și titluri-concluzie
   - data-s11-declutter  același grafic, curățat pas cu pas, după ce discută clasa
   - data-s11-xmas       „brad de Crăciun” față de o singură regulă
   - data-s11-cfmap      tipuri × moduri de formatare condiționată
   - data-s11-cf         matrix rută × trimestru cu formatările pornite pe rând
   - data-s11-barfx      culoare cu fx pe un bar chart */
(function () {
  'use strict';

  const D = window.S11_DATE;
  if (!D) return;
  const V = 0, PAS = 1, LOC = 2, ZB = 3, LT = 4, AN = 6;
  const LUNI = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
  const LUNI_LUNG = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
  const NCO = D.companii.length;
  const AERO = D.companii.indexOf('AeroCarpati');

  /* ---------- formatare ---------- */
  const nf = (n, d) => n.toLocaleString('ro-RO', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fM = (v) => nf(v / 1e6, 1) + ' M';
  const fK = (v) => nf(v / 1e3, 1) + ' K';
  const fP = (p, d = 1) => (p > 0 ? '+' : p < 0 ? '−' : '') + nf(Math.abs(p * 100), d) + '%';
  const fPct = (p) => nf(p * 100, 1) + '%';
  const fPP = (p) => (p > 0 ? '+' : p < 0 ? '−' : '') + nf(Math.abs(p * 100), 1) + ' pp';
  const arrow = (p) => (p >= 0 ? '▲' : '▼');
  const cls = (good) => (good ? 's11-good' : 's11-bad');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- agregate ---------- */
  const mIx = {};
  D.months.forEach((m, i) => { mIx[m] = i; });
  const mrIx = {};
  D.monthsRute.forEach((m, i) => { mrIx[m] = i; });
  const ym = (y, mo) => y + '-' + String(mo).padStart(2, '0');
  const quarterMonths = (y, q) => [1, 2, 3].map((k) => ym(y, (q - 1) * 3 + k));
  const yearMonths = (y) => Array.from({ length: 12 }, (_, i) => ym(y, i + 1));

  // suma unui indicator pe companii (null = toate) și pe o listă de luni
  function sumCo(cos, months, k) {
    const list = cos === null ? D.co.map((_, i) => i) : [].concat(cos);
    let s = 0;
    list.forEach((c) => months.forEach((m) => { if (m in mIx) s += D.co[c][mIx[m]][k]; }));
    return s;
  }
  function sumRo(r, months, k) {
    let s = 0;
    months.forEach((m) => { if (m in mrIx) s += D.ro[r][mrIx[m]][k]; });
    return s;
  }
  const lf = (cos, ms) => sumCo(cos, ms, PAS) / sumCo(cos, ms, LOC);
  const ontime = (cos, ms) => sumCo(cos, ms, LT) / sumCo(cos, ms, ZB);
  const late = (cos, ms) => (sumCo(cos, ms, ZB) - sumCo(cos, ms, LT) - sumCo(cos, ms, AN)) / sumCo(cos, ms, ZB);
  const tinta = (cos, monthsIdx) => {
    const list = cos === null ? D.tinte.map((_, i) => i) : [].concat(cos);
    return list.reduce((a, c) => a + monthsIdx.reduce((b, i) => b + D.tinte[c][i], 0), 0);
  };
  const ALL12 = Array.from({ length: 12 }, (_, i) => i);
  const Y25 = yearMonths(2025), Y24 = yearMonths(2024);
  const V25 = sumCo(null, Y25, V), V24 = sumCo(null, Y24, V), T25 = tinta(null, ALL12);
  const others = D.co.map((_, i) => i).filter((i) => i !== AERO);

  /* ---------- SVG ---------- */
  const svg = (w, h, body, extra) => '<svg class="s11-chart" viewBox="0 0 ' + w + ' ' + h + '" ' + (extra || '') + ' role="img">' + body + '</svg>';
  const rect = (x, y, w, h, style, attrs) => '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, h).toFixed(1) + '" rx="3" style="' + style + '" ' + (attrs || '') + '/>';
  const text = (x, y, s, anchor, cl, style) => '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="' + (anchor || 'middle') + '"' + (cl ? ' class="' + cl + '"' : '') + (style ? ' style="' + style + '"' : '') + '>' + s + '</text>';
  const C = { pri: 'fill:var(--primary)', mute: 'fill:var(--s11-mute)', muteSoft: 'fill:var(--s11-mute-soft)', good: 'fill:var(--s11-good)', bad: 'fill:var(--s11-bad)', acc: 'fill:var(--s11-accent)' };

  function sparkline(vals, w, h, refVals) {
    const all = vals.concat(refVals || []);
    const max = Math.max.apply(null, all), min = Math.min.apply(null, all);
    const x = (i) => 4 + i * (w - 8) / (vals.length - 1);
    const y = (v) => h - 4 - (v - min) / (max - min || 1) * (h - 8);
    const path = (vs) => vs.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    let s = '';
    if (refVals) s += '<path d="' + path(refVals) + '" style="fill:none;stroke:var(--s11-mute);stroke-width:1.5;stroke-dasharray:3 3"/>';
    s += '<path d="' + path(vals) + '" style="fill:none;stroke:var(--primary);stroke-width:2.2"/>';
    s += '<circle cx="' + x(vals.length - 1).toFixed(1) + '" cy="' + y(vals[vals.length - 1]).toFixed(1) + '" r="3" style="fill:var(--primary)"/>';
    return '<svg class="s11-spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' + s + '</svg>';
  }

  /* ---------- pași cu butoane ---------- */
  document.querySelectorAll('[data-s11-tabs]').forEach((root) => {
    const btns = Array.from(root.querySelectorAll('[data-tab]'));
    const panes = Array.from(root.querySelectorAll('[data-pane]'));
    const show = (id) => {
      btns.forEach((b) => b.classList.toggle('is-on', b.dataset.tab === id));
      panes.forEach((p) => p.classList.toggle('is-on', p.dataset.pane === id));
    };
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
    show(btns[0].dataset.tab);
  });

  /* ---------- 1 · cârligul ---------- */
  document.querySelectorAll('[data-s11-hook]').forEach((root) => {
    const yoy = V25 / V24 - 1;
    const vsT = V25 / T25 - 1;
    const aero25 = sumCo(AERO, Y25, V), aero24 = sumCo(AERO, Y24, V);
    const oth = sumCo(others, Y25, V) / sumCo(others, Y24, V) - 1;
    const q4 = sumCo(null, quarterMonths(2025, 4), V) / sumCo(null, quarterMonths(2024, 4), V) - 1;
    const m25 = Y25.map((m) => sumCo(null, [m], V)), m24 = Y24.map((m) => sumCo(null, [m], V));
    const STEPS = [
      { btn: '+ anul trecut', line: ['2024', fM(V24) + ' · <b class="s11-good">▲ ' + fP(yoy) + '</b>'], good: true,
        say: '<strong>Bine.</strong> Am crescut cu ' + fP(yoy) + ' față de 2024, adică ' + fM(V25 - V24) + ' EUR în plus.' },
      { btn: '+ ținta', line: ['Ținta 2025', fM(T25) + ' · <b class="s11-bad">▼ ' + fP(vsT) + '</b>'], good: false,
        say: '<strong>Nu chiar.</strong> Ținta era +12%. Am crescut, dar suntem sub ea cu ' + fM(T25 - V25) + ' EUR.' },
      { btn: '+ trendul', spark: true, good: true,
        say: '<strong>Se îmbunătățește.</strong> Linia plină e 2025, cea punctată 2024. A doua jumătate a anului e peste 2024: T4 ' + fP(q4) + '.' },
      { btn: '+ companiile', line: ['AeroCarpati', fM(aero25) + ' · <b class="s11-bad">▼ ' + fP(aero25 / aero24 - 1) + '</b>'], line2: ['Celelalte 9 companii', '<b class="s11-good">▲ ' + fP(oth) + '</b>'], good: false,
        say: '<strong>Explicația.</strong> AeroCarpati aduce ' + nf(aero25 / V25 * 100, 0) + '% din venit și e singura care scade. Fără ea, creșterea ar fi ' + fP(oth) + '.' }
    ];
    let k = 0;
    const render = () => {
      let lines = '';
      let spark = '';
      STEPS.slice(0, k).forEach((s) => {
        if (s.line) lines += '<div class="s11-hook-line"><span>' + s.line[0] + '</span><span>' + s.line[1] + '</span></div>';
        if (s.line2) lines += '<div class="s11-hook-line"><span>' + s.line2[0] + '</span><span>' + s.line2[1] + '</span></div>';
        if (s.spark) spark = sparkline(m25, 300, 54, m24);
      });
      const last = STEPS[k - 1];
      root.innerHTML =
        '<div class="s11-kpi"><span>Venit zboruri · 2025</span><b>' + fM(V25) + ' EUR</b>' + spark + '<div class="s11-hook-lines">' + lines + '</div></div>' +
        '<div><div class="s11-hook-steps">' + STEPS.map((s, i) => '<button type="button" class="s11-chip' + (i < k ? ' is-on' : '') + '" data-i="' + i + '"' + (i > k ? ' disabled' : '') + '>' + s.btn + '</button>').join('') +
        '<button type="button" class="s11-chip" data-reset' + (k ? '' : ' disabled') + '>De la capăt</button></div>' +
        '<div class="s11-verdict' + (last ? (last.good ? ' is-good' : ' is-bad') : '') + '">' + (last ? last.say : '<strong>Fără reper, nu putem spune nimic.</strong> 75,9 M poate fi un record sau un dezastru. Apăsați primul buton.') + '</div></div>';
      root.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { k = Math.max(k, +b.dataset.i + 1); render(); }));
      root.querySelector('[data-reset]').addEventListener('click', () => { k = 0; render(); });
    };
    render();
  });

  /* ---------- 2 · YoY ---------- */
  document.querySelectorAll('[data-s11-yoy]').forEach((root) => {
    const st = { co: 'all', m: 6 };
    root.innerHTML =
      '<div class="s11-box"><div class="s11-btns" style="margin-bottom:8px"><select class="s11-sel" data-co><option value="all">Toate companiile</option>' +
      D.companii.map((c, i) => '<option value="' + i + '">' + esc(c) + '</option>').join('') + '</select></div><div data-chart></div>' +
      '<div class="s11-legend"><span><i style="background:var(--s11-mute)"></i>2024</span><span><i style="background:var(--primary)"></i>2025</span><span>Apăsați pe o lună.</span></div></div>' +
      '<div class="s11-box" data-out></div>';
    const chart = root.querySelector('[data-chart]');
    const out = root.querySelector('[data-out]');
    const sel = root.querySelector('[data-co]');
    const render = () => {
      const cos = st.co === 'all' ? null : +st.co;
      const a = Y25.map((m) => sumCo(cos, [m], V)), b = Y24.map((m) => sumCo(cos, [m], V));
      const max = Math.max.apply(null, a.concat(b));
      const W = 600, H = 220, top = 24, bot = 24, gw = (W - 10) / 12;
      let s = '<line class="axis" x1="0" x2="' + W + '" y1="' + (H - bot) + '" y2="' + (H - bot) + '"/>';
      for (let i = 0; i < 12; i++) {
        const x = 5 + i * gw;
        const hb = (b[i] / max) * (H - top - bot), ha = (a[i] / max) * (H - top - bot);
        const on = i === st.m;
        if (on) s += rect(x + 1, 2, gw - 2, H - 4, 'fill:var(--primary-soft)');
        s += rect(x + gw * 0.14, H - bot - hb, gw * 0.34, hb, C.mute);
        s += rect(x + gw * 0.52, H - bot - ha, gw * 0.34, ha, C.pri);
        const p = a[i] / b[i] - 1;
        s += text(x + gw / 2, H - bot - Math.max(ha, hb) - 6, fP(p, 0), 'middle', 'lbl', 'fill:var(' + (p >= 0 ? '--s11-good' : '--s11-bad') + ');font-size:10px');
        s += text(x + gw / 2, H - 8, LUNI[i], 'middle', on ? 'lbl' : '');
        s += '<rect class="hit" data-m="' + i + '" x="' + x + '" y="0" width="' + gw + '" height="' + H + '"/>';
      }
      chart.innerHTML = svg(W, H, s);
      chart.querySelectorAll('[data-m]').forEach((r) => r.addEventListener('click', () => { st.m = +r.dataset.m; render(); }));
      const va = a[st.m], vb = b[st.m], p = va / vb - 1;
      const who = st.co === 'all' ? 'toate companiile' : D.companii[+st.co];
      out.innerHTML =
        '<span class="s11-tag">' + esc(who) + ' · ' + LUNI_LUNG[st.m] + '</span>' +
        '<div class="s11-mini" style="margin-top:8px"><span>' + LUNI_LUNG[st.m] + ' 2025</span><b>' + fM(va) + '</b></div>' +
        '<div class="s11-mini"><span>' + LUNI_LUNG[st.m] + ' 2024 (anul trecut)</span><b>' + fM(vb) + '</b></div>' +
        '<div class="s11-mini"><span>Diferența</span><b class="' + cls(p >= 0) + '">' + (va >= vb ? '+' : '−') + fM(Math.abs(va - vb)) + '</b></div>' +
        '<div class="s11-mini"><span>Față de anul trecut</span><b class="' + cls(p >= 0) + '">' + arrow(p) + ' ' + fP(p) + '</b></div>';
    };
    sel.addEventListener('change', () => { st.co = sel.value; render(); });
    render();
  });

  /* ---------- 3 · puncte procentuale ---------- */
  document.querySelectorAll('[data-s11-pp]').forEach((root) => {
    const st = { a: 81, b: 83 };
    root.innerHTML =
      '<div class="s11-box">' +
      '<label class="s11-range"><span>Load factor <b>2024</b></span><output data-va></output><input type="range" min="50" max="99" step="1" data-a aria-label="Procentul din 2024"></label>' +
      '<label class="s11-range"><span>Load factor <b>2025</b></span><output data-vb></output><input type="range" min="50" max="99" step="1" data-b aria-label="Procentul din 2025"></label></div>' +
      '<div class="s11-pp-card is-main" data-out></div>';
    const ia = root.querySelector('[data-a]'), ib = root.querySelector('[data-b]');
    const out = root.querySelector('[data-out]');
    const render = () => {
      ia.value = st.a; ib.value = st.b;
      root.querySelector('[data-va]').textContent = st.a + '%';
      root.querySelector('[data-vb]').textContent = st.b + '%';
      const pp = st.b - st.a;
      out.innerHTML = '<span>Diferența</span><b class="' + cls(pp >= 0) + '">' + (pp > 0 ? '+' : pp < 0 ? '−' : '') + Math.abs(pp) + ' pp</b><code>' + st.b + '% − ' + st.a + '%</code>' +
        '<small>Scădem simplu cele două procente. Nu spunem „' + (pp >= 0 ? '+' : '−') + nf(Math.abs(pp / st.a * 100), 1) + '%”.</small>';
    };
    ia.addEventListener('input', () => { st.a = +ia.value; render(); });
    ib.addEventListener('input', () => { st.b = +ib.value; render(); });
    render();
  });

  /* ---------- banda de trimestre (2024–2025), folosită de repere și de QoQ ---------- */
  const QV = {};
  [2023, 2024, 2025].forEach((y) => [1, 2, 3, 4].forEach((q) => { QV[y + 'T' + q] = sumCo(null, quarterMonths(y, q), V); }));
  const QSTRIP = [];
  [2024, 2025].forEach((y) => [1, 2, 3, 4].forEach((q) => QSTRIP.push({ y: y, q: q, k: y + 'T' + q, v: QV[y + 'T' + q] })));
  const prevQ = (y, q) => (q === 1 ? (y - 1) + 'T4' : y + 'T' + (q - 1));
  const qName = (k) => k.replace(/(\d{4})T(\d)/, 'T$2 $1');
  // marks: { key: 'cur' | 'qoq' | 'yoy' }, arrows: [[fromKey, toKey, label, cssVar]]
  function quarterStrip(marks, arrows, clickable) {
    const W = 600, bw = W / 8, top = 58, h = 54;
    let s = '';
    arrows.forEach((a, n) => {
      const i1 = QSTRIP.findIndex((x) => x.k === a[0]), i2 = QSTRIP.findIndex((x) => x.k === a[1]);
      if (i1 < 0 || i2 < 0) return;
      const x1 = i1 * bw + bw / 2, x2 = i2 * bw + bw / 2, lift = 26 + n * 12 + Math.abs(i1 - i2) * 3;
      s += '<path d="M' + x1 + ' ' + (top - 4) + ' Q ' + ((x1 + x2) / 2) + ' ' + (top - 4 - lift * 1.6) + ' ' + x2 + ' ' + (top - 4) + '" style="fill:none;stroke:var(' + a[3] + ');stroke-width:2.2" marker-end="url(#s11-ah' + n + ')"/>';
      s += '<defs><marker id="s11-ah' + n + '" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" style="fill:var(' + a[3] + ')"/></marker></defs>';
      s += text((x1 + x2) / 2, top - 8 - lift * 0.8, a[2], 'middle', 'lbl', 'fill:var(' + a[3] + ');font-size:12px');
    });
    QSTRIP.forEach((x, i) => {
      const m = marks[x.k];
      const style = m === 'cur' ? 'fill:var(--primary);' : m === 'qoq' ? 'fill:var(--s11-accent-soft);stroke:var(--s11-accent);stroke-width:2.5;' : m === 'yoy' ? 'fill:var(--s11-good-soft);stroke:var(--s11-good);stroke-width:2.5;' : 'fill:var(--surface-2, var(--surface));stroke:var(--border);';
      s += rect(i * bw + 4, top, bw - 8, h, style);
      s += text(i * bw + bw / 2, top + 22, 'T' + x.q, 'middle', 'lbl', m === 'cur' ? 'fill:#fff' : '');
      s += text(i * bw + bw / 2, top + 40, nf(x.v / 1e6, 1) + ' M', 'middle', '', m === 'cur' ? 'fill:#fff' : '');
      if (clickable) s += '<rect class="hit" data-k="' + x.k + '" x="' + (i * bw) + '" y="0" width="' + bw + '" height="' + (top + h + 26) + '"/>';
    });
    s += text(bw * 2, top + h + 18, '2024', 'middle', 'lbl') + text(bw * 6, top + h + 18, '2025', 'middle', 'lbl');
    s += '<line x1="' + (bw * 4) + '" x2="' + (bw * 4) + '" y1="' + (top - 2) + '" y2="' + (top + h + 22) + '" style="stroke:var(--border);stroke-dasharray:3 3"/>';
    return svg(W, top + h + 26, s);
  }

  /* ---------- 4 · cele 4 repere ---------- */
  document.querySelectorAll('[data-s11-cmp]').forEach((root) => {
    const cur = QV['2025T4'], pq = QV['2025T3'], py = QV['2024T4'];
    const pQ = cur / pq - 1, pY = cur / py - 1, pT = V25 / T25 - 1;
    const aero = sumCo(AERO, Y25, V) / sumCo(AERO, Y24, V) - 1, oth = sumCo(others, Y25, V) / sumCo(others, Y24, V) - 1;
    const R = [
      { id: 'prev', tag: 'vs perioada anterioară', q: 'Cum merge acum?', big: fP(pQ), good: pQ >= 0, name: 'Perioada anterioară (MoM, QoQ)',
        what: 'T4 2025 (' + fM(cur) + ') față de trimestrul imediat dinainte, T3 2025 (' + fM(pq) + ').',
        when: 'Când vrei să vezi tendința recentă: ce s-a schimbat de luna sau trimestrul trecut, mai ales unde nu există sezon.',
        warn: 'Sezonul păcălește: după vară, toamna scade în fiecare an. Aici −33% nu înseamnă o problemă.',
        dax: 'DATEADD ( Dim_Date[Data], -1, QUARTER )  ·  -1, MONTH pentru MoM',
        draw: () => quarterStrip({ '2025T4': 'cur', '2025T3': 'qoq' }, [['2025T4', '2025T3', fP(pQ), '--s11-accent']]) },
      { id: 'py', tag: 'vs anul trecut', q: 'Creștem față de anul trecut?', big: fP(pY), good: pY >= 0, name: 'Anul trecut (YoY)',
        what: 'T4 2025 (' + fM(cur) + ') față de același trimestru de anul trecut, T4 2024 (' + fM(py) + ').',
        when: 'Aproape mereu, ca reper principal: compari toamna cu toamna, deci sezonul nu mai contează.',
        warn: 'Dacă anul trecut a fost unul slab (sau excepțional), creșterea arată mai bine (sau mai rău) decât e.',
        dax: 'SAMEPERIODLASTYEAR ( Dim_Date[Data] )',
        draw: () => quarterStrip({ '2025T4': 'cur', '2024T4': 'yoy' }, [['2025T4', '2024T4', fP(pY), '--s11-good']]) },
      { id: 'target', tag: 'vs țintă', q: 'Ne-am atins obiectivul?', big: fP(pT), good: pT >= 0, name: 'Ținta (bugetul)',
        what: 'Venitul pe 2025 (' + fM(V25) + ') față de ținta stabilită la început de an (' + fM(T25) + ', adică 2024 + 12%).',
        when: 'Când firma are un obiectiv scris. E reperul pe care directorul îl urmărește cel mai atent.',
        warn: 'Ținta nu vine din date: o încarcă cineva, de obicei dintr-un Excel. Fără ea, comparația nu există.',
        dax: 'Un tabel nou (Tinte) + DIVIDE ( [Venit Zboruri] - [Tinta Venit], [Tinta Venit] )',
        draw: () => {
          const W = 600, L = 110, max = Math.max(V25, T25) * 1.05, w = (v) => v / max * (W - L - 90);
          let s = text(L - 8, 40, 'Venit 2025', 'end', 'lbl') + rect(L, 22, w(V25), 30, C.pri) + text(L + w(V25) + 6, 42, fM(V25), 'start', 'lbl');
          s += text(L - 8, 92, 'Ținta 2025', 'end', 'lbl') + rect(L, 74, w(T25), 30, 'fill:none;stroke:var(--text-2);stroke-width:2;stroke-dasharray:5 4') + text(L + w(T25) + 6, 94, fM(T25), 'start', 'lbl');
          s += '<line x1="' + (L + w(V25)) + '" x2="' + (L + w(T25)) + '" y1="62" y2="62" style="stroke:var(--s11-bad);stroke-width:3"/>';
          s += text(L + (w(V25) + w(T25)) / 2, 128, 'lipsesc ' + fM(T25 - V25) + ' (' + fP(pT) + ')', 'middle', 'lbl', 'fill:var(--s11-bad)');
          return svg(W, 140, s);
        } },
      { id: 'bench', tag: 'vs medie / ceilalți', q: 'Cum stăm față de ceilalți?', big: fP(aero), good: aero >= 0, name: 'Media sau ceilalți (benchmark)',
        what: 'Creșterea AeroCarpati (' + fP(aero) + ') față de creșterea celorlalte 9 companii luate împreună (' + fP(oth) + ').',
        when: 'Când vrei să știi dacă o problemă e a unuia singur sau a tuturor: piața, sezonul sau compania?',
        warn: 'Alege grupul de comparație cu grijă: media tuturor include și compania analizată.',
        dax: 'CALCULATE ( [Venit YoY %], ALL ( Dim_Companii ) ) pentru media tuturor',
        draw: () => {
          const rows = D.companii.map((c, i) => ({ c: c, i: i, y: sumCo(i, Y25, V) / sumCo(i, Y24, V) - 1 })).sort((a, b) => a.y - b.y);
          const W = 600, L = 120, rh = 15, z = L + 40, sc = (W - z - 60) / 0.35;
          let s = '';
          rows.forEach((r, j) => {
            const y = 6 + j * rh, isA = r.i === AERO, x = r.y >= 0 ? z : z + r.y * sc;
            s += text(L - 6, y + 11, esc(r.c), 'end', isA ? 'lbl' : '', 'font-size:10px');
            s += rect(x, y + 2, Math.abs(r.y) * sc, rh - 4, isA ? C.bad : C.muteSoft);
            s += text((r.y >= 0 ? z + r.y * sc + 4 : x - 4), y + 11, fP(r.y, 0), r.y >= 0 ? 'start' : 'end', '', 'font-size:9.5px');
          });
          const ox = z + oth * sc;
          s += '<line x1="' + z + '" x2="' + z + '" y1="4" y2="' + (8 + rows.length * rh) + '" style="stroke:var(--border)"/>';
          s += '<line x1="' + ox + '" x2="' + ox + '" y1="2" y2="' + (8 + rows.length * rh) + '" style="stroke:var(--s11-good);stroke-width:2;stroke-dasharray:4 3"/>';
          s += text(ox, 8 + rows.length * rh + 12, 'celelalte: ' + fP(oth), 'middle', 'lbl', 'fill:var(--s11-good)');
          return svg(W, 8 + rows.length * rh + 18, s);
        } }
    ];
    let cur_ = 'prev';
    const render = () => {
      const r = R.find((x) => x.id === cur_);
      root.innerHTML = '<div class="s11-cmp-nav">' + R.map((x) => '<button type="button" data-c="' + x.id + '" class="' + (x.id === cur_ ? 'is-on' : '') + '"><span class="s11-tag">' + x.tag + '</span><b>' + x.q + '</b><em class="' + cls(x.good) + '">' + arrow(x.good ? 1 : -1) + ' ' + x.big + '</em></button>').join('') + '</div>' +
        '<div class="s11-cmp-pane"><div class="s11-cmp-draw"><h3>' + r.name + '</h3>' + r.draw() + '</div>' +
        '<dl class="s11-cmp-dl"><div><dt>Ce compară</dt><dd>' + r.what + '</dd></div><div><dt>Când îl folosești</dt><dd>' + r.when + '</dd></div><div><dt>Atenție</dt><dd>' + r.warn + '</dd></div><div><dt>În DAX</dt><dd><code>' + r.dax + '</code></dd></div></dl></div>';
      root.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => { cur_ = b.dataset.c; render(); }));
    };
    render();
  });

  /* ---------- 5 · QoQ față de YoY ---------- */
  document.querySelectorAll('[data-s11-qoq]').forEach((root) => {
    let sel = '2025T4';
    const render = () => {
      const y = +sel.slice(0, 4), q = +sel.slice(5);
      const kq = prevQ(y, q), ky = (y - 1) + 'T' + q;
      const v = QV[sel], vq = QV[kq], vy = QV[ky];
      const pq = v / vq - 1, py = v / vy - 1;
      // același QoQ, cu un an înainte: sezonul
      const lastQ = QV[(y - 1) + 'T' + q] / QV[prevQ(y - 1, q)] - 1;
      const card = (kind, title, ref, rv, p, color) => '<div class="s11-qc is-' + kind + '"><span class="s11-qc-k">' + title + '</span>' +
        '<p>' + qName(sel) + ' față de <strong>' + qName(ref) + '</strong></p>' +
        '<div class="s11-formula">(' + nf(v / 1e6, 1) + ' − ' + nf(rv / 1e6, 1) + ') / ' + nf(rv / 1e6, 1) + ' = <b class="' + cls(p >= 0) + '">' + arrow(p) + ' ' + fP(p) + '</b></div></div>';
      const same = (pq >= 0) === (py >= 0);
      root.innerHTML =
        '<div class="s11-box"><p class="s11-note" style="margin:0 0 4px">Apăsați pe un trimestru. Săgețile arată cu ce se compară.</p>' +
        quarterStrip({ [sel]: 'cur', [kq]: 'qoq', [ky]: 'yoy' }, [[sel, kq, 'QoQ ' + fP(pq, 0), '--s11-accent'], [sel, ky, 'YoY ' + fP(py, 0), '--s11-good']], true) + '</div>' +
        '<div class="s11-qoq-cards">' + card('qoq', 'QoQ · trimestrul de dinainte', kq, vq, pq) + card('yoy', 'YoY · același trimestru, anul trecut', ky, vy, py) +
        '<div class="s11-qc is-why"><span class="s11-qc-k">De ce diferă?</span><p>' + (same
          ? 'Aici ambele spun același lucru: ' + (py >= 0 ? 'creștem' : 'scădem') + ' și față de trimestrul trecut, și față de anul trecut.'
          : 'Și în ' + (y - 1) + ', ' + 'T' + q + ' a fost cu <strong>' + fP(lastQ) + '</strong> față de trimestrul dinainte. E <strong>sezonul</strong>, nu o problemă. YoY scoate sezonul din calcul: compară ' + ['iarna', 'primăvara', 'vara', 'toamna'][q - 1] + ' cu ' + ['iarna', 'primăvara', 'vara', 'toamna'][q - 1] + '.') +
        '</p><p class="s11-note"><strong>Regula:</strong> YoY ca reper principal; QoQ pentru tendința recentă, unde nu e sezon.</p></div></div>';
      root.querySelectorAll('[data-k]').forEach((r) => r.addEventListener('click', () => { sel = r.dataset.k; render(); }));
    };
    render();
  });

  /* ---------- 7 · galeria de vizuale ---------- */
  document.querySelectorAll('[data-s11-visuals]').forEach((root) => {
    const yoy = V25 / V24 - 1;
    const pas25 = sumCo(null, Y25, PAS), pas24 = sumCo(null, Y24, PAS);
    const years = [2021, 2022, 2023, 2024, 2025].map((y) => sumCo(null, yearMonths(y), V));
    const vs = (p) => '<em class="' + cls(p >= 0) + '">' + arrow(p) + ' ' + fP(p) + ' vs 2024</em>';
    const gauge1 = (val, tgt, max, cap) => {
      const cx = 130, cy = 112, r = 80, col = val >= tgt ? '#16A34A' : '#DC2626';
      const arc = (f, rr) => { const a = Math.PI * (1 - f); return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]; };
      const p = arc(Math.min(1, val / max), r), tf = tgt / max, t1 = arc(tf, r - 14), t2 = arc(tf, r + 14), tl = arc(tf, r + 22);
      return '<div class="s11-gauge">' + svg(300, 140, '<path d="M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + '" style="fill:none;stroke:var(--s11-mute-soft);stroke-width:18"/>' +
        '<path d="M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + '" style="fill:none;stroke:' + col + ';stroke-width:18"/>' +
        '<line x1="' + t1[0].toFixed(1) + '" y1="' + t1[1].toFixed(1) + '" x2="' + t2[0].toFixed(1) + '" y2="' + t2[1].toFixed(1) + '" style="stroke:var(--text);stroke-width:3"/>' +
        text(tl[0], tl[1] - 4, 'ținta ' + fM(tgt), 'start', 'lbl', 'font-size:11px') +
        text(cx, cy - 6, fM(val), 'middle', 'lbl', 'font-size:20px') + text(cx - r, cy + 16, '0', 'middle') + text(cx + r, cy + 16, fM(max), 'middle')) +
        '<small><b style="color:' + col + '">' + (val >= tgt ? 'Peste țintă' : 'Sub țintă') + '</b> · ' + cap + '</small></div>';
    };
    const gauge = () => '<div class="s11-gauges">' + gauge1(V25, T25, 90e6, 'anul 2025') + gauge1(sumCo(null, ['2025-07'], V), tinta(null, [6]), 12e6, 'iulie 2025') + '</div>';
    const kpiVisual = () => {
      const max = Math.max.apply(null, years), W = 260, H = 90;
      const pts = years.map((v, i) => [i * W / 4, H - v / max * H * 0.9]);
      const area = 'M0 ' + H + ' ' + pts.map((pt) => 'L' + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1)).join(' ') + ' L' + W + ' ' + H + ' Z';
      return '<div class="s11-kpi" style="width:100%;max-width:300px;border-color:var(--s11-good)"><span>Venit zboruri</span><b class="s11-good">' + fM(V25) + '</b>' +
        '<small>vs 2024: ' + fM(V24) + ' (' + fP(yoy) + ')</small><svg class="s11-spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="height:60px"><path d="' + area + '" style="fill:var(--s11-good-soft)"/></svg><small>Trend 2021–2025 în fundal</small></div>';
    };
    const coTop = D.companii.map((c, i) => ({ c: c, a: sumCo(i, Y25, V), y: sumCo(i, Y25, V) / sumCo(i, Y24, V) - 1 })).sort((x, z) => z.a - x.a).slice(0, 5);
    const VIS = [
      { id: 'card', label: 'Card (nou)', sub: 'implicit', verdict: 'Alegerea implicită',
        draw: () => '<div class="s11-kpi" style="width:100%;max-width:300px"><span>Venit zboruri · 2025</span><b>' + fM(V25) + '</b>' + vs(yoy) + '</div>',
        yes: ['O cifră mare, ușor de citit', 'Sub valoare, un reference label: cât a crescut față de anul trecut', 'Mai multe KPI-uri în același vizual, aliniate'],
        no: ['Când trebuie văzută evoluția în detaliu: atunci un line chart'] },
      { id: 'kpi', label: 'KPI', sub: 'valoare + reper + trend', verdict: 'Când trendul e mesajul',
        draw: kpiVisual,
        yes: ['Colorează singur valoarea: peste reper sau sub', 'Reperul (Target) poate fi anul trecut: Venit PY', 'Arată trendul pe ani în fundal'],
        no: ['Fără axă de timp nu are sens', 'Culorile implicite sunt roșu/verde: schimbați-le'] },
      { id: 'gauge', label: 'Gauge', sub: 'un cadran', verdict: 'Rar: un singur obiectiv',
        draw: gauge,
        yes: ['Un singur obiectiv clar: linia neagră e ținta', 'Culoarea arcului spune singură: roșu sub țintă, verde după ce a depășit-o', 'Arată cât mai e până la țintă'],
        no: ['Ocupă mult loc pentru o cifră', 'Mai multe gauge-uri unul lângă altul nu se pot compara', 'Nu arată anul trecut'] },
      { id: 'mrc', label: 'Multi-row card', sub: 'listă de cifre', verdict: 'Înlocuit de cardul nou',
        draw: () => '<div class="s11-mrc"><div><span>Venit zboruri</span><b>' + fM(V25) + '</b></div><div><span>Venit vs 2024</span><b class="s11-good">' + fP(yoy) + '</b></div><div><span>Pasageri</span><b>' + fK(pas25) + '</b></div><div><span>Pasageri vs 2024</span><b class="s11-good">' + fP(pas25 / pas24 - 1) + '</b></div></div>',
        yes: ['Multe cifre într-un spațiu mic'],
        no: ['Comparația e un rând separat, nu stă sub valoare', 'Toate cifrele au aceeași greutate: nu iese nimic în evidență'] },
      { id: 'table', label: 'Table', sub: 'cifre exacte', verdict: 'Pentru detaliu, nu pentru sus',
        draw: () => '<table class="s11-mtbl"><thead><tr><th>Companie</th><th>Venit 2025</th><th>vs 2024</th></tr></thead><tbody>' +
          coTop.map((r) => '<tr><td>' + esc(r.c) + '</td><td>' + fM(r.a) + '</td><td class="' + cls(r.y >= 0) + '">' + arrow(r.y) + ' ' + fP(r.y) + '</td></tr>').join('') + '</tbody></table>',
        yes: ['Cifre exacte pe multe rânduri', 'Bun pe o pagină de detaliu, cu formatare condiționată'],
        no: ['Se citește, nu se vede: directorul caută cu ochii', 'Sus pe Overview, cardurile spun mai repede'] }
    ];
    let cur = 'card';
    const render = () => {
      const v = VIS.find((x) => x.id === cur);
      root.innerHTML = '<div class="s11-gallery-nav">' + VIS.map((x) => '<button type="button" class="s11-chip' + (x.id === cur ? ' is-on' : '') + '" data-v="' + x.id + '">' + x.label + '<small>' + x.sub + '</small></button>').join('') + '</div>' +
        '<div class="s11-viz"><div class="s11-viz-stage">' + v.draw() + '</div><div><span class="s11-verdict-tag">' + v.verdict + '</span><ul class="s11-yes">' + v.yes.map((t) => '<li>' + t + '</li>').join('') + '</ul><ul class="s11-no">' + v.no.map((t) => '<li>' + t + '</li>').join('') + '</ul></div></div>';
      root.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => { cur = b.dataset.v; render(); }));
    };
    render();
  });

  /* ---------- 8 · quiz ---------- */
  document.querySelectorAll('[data-s11-quiz]').forEach((root) => {
    const OPTS = ['Card', 'KPI', 'Gauge', 'Table', 'Line chart'];
    const QS = [
      { q: 'Directorul vrea venitul anului dintr-o privire și cât e față de anul trecut.', a: 'Card', why: 'O cifră și un reper: cardul nou, cu reference label „vs 2024”.' },
      { q: 'Vrea venitul de anul acesta față de anul trecut și cum a evoluat în ultimii ani.', a: 'KPI', why: 'Reperul (anul trecut) + trendul în fundal: exact ce face vizualul KPI.' },
      { q: 'Ședința are un singur obiectiv anunțat: load factor 85% până la final de an.', a: 'Gauge', why: 'Un singur obiectiv, o singură cifră: aici gauge-ul e potrivit. Unul, nu cinci.' },
      { q: 'Managerul de rută vrea cifrele exacte pe 10 companii, 2025 față de 2024.', a: 'Table', why: 'Cifre exacte pe multe rânduri: tabel, cu iconițe pe coloana YoY.' }
    ];
    root.innerHTML = QS.map((x, i) => '<div class="s11-q" data-q="' + i + '"><p>' + (i + 1) + '. ' + x.q + '</p><div class="s11-btns">' + OPTS.map((o) => '<button type="button" class="s11-chip" data-o="' + o + '">' + o + '</button>').join('') + '</div><p class="s11-q-why" hidden></p></div>').join('');
    root.querySelectorAll('[data-q]').forEach((card) => {
      const x = QS[+card.dataset.q];
      const why = card.querySelector('.s11-q-why');
      card.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => {
        const ok = b.dataset.o === x.a;
        card.querySelectorAll('[data-o]').forEach((o) => o.classList.remove('is-right', 'is-wrong'));
        b.classList.add(ok ? 'is-right' : 'is-wrong');
        if (!ok) card.querySelector('[data-o="' + x.a + '"]').classList.add('is-right');
        why.hidden = false;
        why.innerHTML = (ok ? '<strong>Corect.</strong> ' : '<strong>Mai bine: ' + x.a + '.</strong> ') + x.why;
      }));
    });
  });

  /* ---------- 9 · arborele de întrebări ---------- */
  // schița unei pagini de raport: blocuri pe o grilă de 12 coloane
  const GLYPH = {
    kpi: (l) => '<b class="g-kpi">' + l + '</b>',
    line: () => '<svg viewBox="0 0 100 40" preserveAspectRatio="none"><polyline points="0,32 14,26 28,28 42,18 56,20 70,10 84,14 100,6" style="fill:none;stroke:var(--primary);stroke-width:2.5"/><polyline points="0,34 14,30 28,31 42,25 56,27 70,20 84,22 100,17" style="fill:none;stroke:var(--s11-mute);stroke-width:2;stroke-dasharray:4 3"/></svg>',
    bar: () => '<svg viewBox="0 0 100 40" preserveAspectRatio="none">' + [34, 26, 20, 16, 12, 9].map((w, i) => '<rect x="0" y="' + (i * 6.6 + 1) + '" width="' + (w * 2.8) + '" height="4.6" rx="1" style="fill:' + (i === 0 ? 'var(--s11-bad)' : 'var(--s11-mute)') + '"/>').join('') + '</svg>',
    col: () => '<svg viewBox="0 0 100 40" preserveAspectRatio="none">' + [18, 22, 26, 24, 30, 36, 40, 38, 28, 26, 20, 30].map((h, i) => '<rect x="' + (i * 8.3 + 1) + '" y="' + (40 - h) + '" width="6" height="' + h + '" rx="1" style="fill:var(--primary)"/>').join('') + '</svg>',
    water: () => '<svg viewBox="0 0 100 40" preserveAspectRatio="none"><rect x="2" y="12" width="16" height="28" style="fill:var(--s11-mute)"/><rect x="24" y="6" width="16" height="6" style="fill:var(--s11-good)"/><rect x="46" y="2" width="16" height="4" style="fill:var(--s11-good)"/><rect x="68" y="2" width="16" height="2" style="fill:var(--s11-bad)"/><rect x="88" y="4" width="10" height="36" style="fill:var(--primary)"/></svg>',
    map: () => '<svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M5 30 Q20 8 40 18 T75 12 T98 22" style="fill:none;stroke:var(--border);stroke-width:8"/>' + [[18, 16, 5], [44, 20, 3], [62, 12, 4], [82, 18, 6]].map((c) => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" style="fill:var(--s11-accent);opacity:0.8"/>').join('') + '</svg>',
    table: () => '<svg viewBox="0 0 100 40" preserveAspectRatio="none">' + [0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2, 3, 4].map((c) => '<rect x="' + (c * 20 + 1) + '" y="' + (r * 6.6 + 1) + '" width="18" height="5" style="fill:' + (r === 0 ? 'var(--primary-soft)' : 'color-mix(in srgb, var(--s11-accent) ' + ((r * 7 + c * 13) % 60 + 8) + '%, transparent)') + '"/>').join('')).join('') + '</svg>',
    slicer: (l) => '<span class="g-slicer">' + l + ' ▾</span>'
  };
  function wireframe(title, blocks) {
    return '<div class="s11-page-mock"><div class="s11-page-bar"><span></span><b>' + title + '</b></div><div class="s11-page-grid">' +
      blocks.map((b) => '<div class="s11-blk t-' + b.t + '" style="grid-column:span ' + b.c + ';grid-row:span ' + (b.r || 1) + '"><small>' + b.l + '</small>' + GLYPH[b.t](b.v || b.l) + '</div>').join('') + '</div></div>';
  }
  document.querySelectorAll('[data-s11-tree]').forEach((root) => {
    const ppas = (ms) => sumCo(null, ms, V) / sumCo(null, ms, PAS);
    const B = [
      { id: 'cat', k: 'Cât?', q: 'Cât am vândut și e mai bine decât anul trecut?', page: 'Overview',
        on: [['4 KPI-uri cu reper', 'Răspund la „cât?” în câteva secunde: valoarea și cât s-a schimbat față de anul trecut.'], ['Venitul pe luni, 2025 față de 2024', 'Arată când s-a câștigat și când s-a pierdut: aici, un început de an slab.'], ['Venitul față de țintă, pe companii', 'Arată unde rămânem sub obiectiv, ca să știm unde să ne uităm mai departe.']],
        blocks: [{ t: 'kpi', c: 3, l: 'Venit', v: fM(V25) }, { t: 'kpi', c: 3, l: 'Pasageri', v: fK(sumCo(null, Y25, PAS)) }, { t: 'kpi', c: 3, l: 'Load factor', v: fPct(lf(null, Y25)) }, { t: 'kpi', c: 3, l: 'La timp', v: fPct(ontime(null, Y25)) }, { t: 'line', c: 8, r: 2, l: 'Venit pe luni: 2025 vs 2024' }, { t: 'bar', c: 4, r: 2, l: 'Venit vs țintă, pe companii' }],
        ans: 'Venit ' + fM(V25) + ', ' + fP(V25 / V24 - 1) + ' față de 2024, ' + fP(V25 / T25 - 1) + ' față de țintă.', nav: 'Prima pagină. De aici, butoane către celelalte.' },
      { id: 'dece', k: 'De ce?', q: 'Creștem din mai mulți pasageri sau din preț?', page: 'Venit & preț',
        on: [['Pasageri și venit pe pasager', 'Venitul crește din mai mulți clienți sau din preț. Le separăm, pentru că deciziile sunt diferite.'], ['Waterfall de la 2024 la 2025', 'Arată cât din creștere vine din fiecare cauză.'], ['Venit pe pasager, pe luni', 'Arată dacă prețul crește tot anul sau doar în sezon.'], ['Slicer pe companie', 'Aceeași analiză, pentru fiecare companie, fără pagini în plus.']],
        blocks: [{ t: 'kpi', c: 4, l: 'Pasageri', v: fP(sumCo(null, Y25, PAS) / sumCo(null, Y24, PAS) - 1) }, { t: 'kpi', c: 4, l: 'Venit / pasager', v: fP(ppas(Y25) / ppas(Y24) - 1) }, { t: 'slicer', c: 4, l: 'Companie' }, { t: 'water', c: 6, r: 2, l: 'De la 2024 la 2025' }, { t: 'line', c: 6, r: 2, l: 'Venit pe pasager, pe luni' }],
        ans: 'Pasageri ' + fP(sumCo(null, Y25, PAS) / sumCo(null, Y24, PAS) - 1) + ', venit pe pasager ' + fP(ppas(Y25) / ppas(Y24) - 1) + '. Ambele ajută.', nav: 'Buton din Overview.' },
      { id: 'unde', k: 'Unde?', q: 'Ce companii și ce rute trag în sus sau în jos?', page: 'Rute & companii',
        on: [['Slicere: tip rută, an, companie', 'Cititorul își alege singur bucata pe care o analizează.'], ['Venit pe companii', 'Clasamentul; culoarea arată cine e sub țintă (Partea 3).'], ['YoY % pe rute, sortat', 'Rutele care cresc sau scad cel mai mult apar primele.'], ['Harta destinațiilor', 'Când locul contează: se vede dacă o regiune întreagă crește sau scade.']],
        blocks: [{ t: 'slicer', c: 4, l: 'Tip rută' }, { t: 'slicer', c: 4, l: 'An' }, { t: 'slicer', c: 4, l: 'Companie' }, { t: 'bar', c: 4, r: 2, l: 'Venit pe companii' }, { t: 'bar', c: 4, r: 2, l: 'YoY % pe rute' }, { t: 'map', c: 4, r: 2, l: 'Destinații' }],
        ans: 'AeroCarpati ' + fP(sumCo(AERO, Y25, V) / sumCo(AERO, Y24, V) - 1) + '; celelalte ' + fP(sumCo(others, Y25, V) / sumCo(others, Y24, V) - 1) + '.', nav: 'Buton din Overview; drillthrough spre Detaliu.' },
      { id: 'cost', k: 'Ce ne costă?', q: 'Operăm mai bine: zboruri pline și la timp?', page: 'Operațional',
        on: [['4 KPI-uri operaționale', 'Avioane pline, punctualitate, întârzieri și cost: sănătatea operațiunii, pe scurt.'], ['La timp % pe luni', 'Arată când apar problemele, de exemplu în vârful de vară.'], ['La timp % pe companii', 'Arată cine trage media în jos.']],
        blocks: [{ t: 'kpi', c: 3, l: 'Load factor', v: fPP(lf(null, Y25) - lf(null, Y24)) }, { t: 'kpi', c: 3, l: 'La timp', v: fPP(ontime(null, Y25) - ontime(null, Y24)) }, { t: 'kpi', c: 3, l: 'Întârziate', v: fPct(late(null, Y25)) }, { t: 'kpi', c: 3, l: 'Cost / zbor', v: '—' }, { t: 'col', c: 7, r: 2, l: 'La timp % pe luni' }, { t: 'bar', c: 5, r: 2, l: 'La timp % pe companii' }],
        ans: 'Load factor ' + fPP(lf(null, Y25) - lf(null, Y24)) + ', la timp ' + fPP(ontime(null, Y25) - ontime(null, Y24)) + '.', nav: 'Buton din Overview.' },
      { id: 'care', k: 'Care exact?', q: 'Care rute, în ce trimestru, cu ce cifre?', page: 'Detaliu',
        on: [['Slicere: companie, tip rută', 'Filtrare rapidă când cititorul caută ceva anume.'], ['Matrix rută × trimestru', 'Cifrele exacte pentru fiecare rută. Formatarea condiționată (Partea 3) scoate în evidență rutele care scad.'], ['Drillthrough', 'Pagina nu are buton în meniu: se ajunge aici din click dreapta pe o rută sau companie.']],
        blocks: [{ t: 'slicer', c: 6, l: 'Companie' }, { t: 'slicer', c: 6, l: 'Tip rută' }, { t: 'table', c: 12, r: 3, l: 'Rută × trimestru' }],
        ans: 'Lista celor ' + D.rute.length + ' de rute, cu cifre exacte.', nav: 'Drillthrough (click dreapta) din celelalte pagini.' },
    ];
    let cur = 'cat';
    const render = () => {
      const b = B.find((x) => x.id === cur);
      root.innerHTML = '<div class="s11-org"><div class="s11-org-root">E 2025 un an mai bun decât 2024? Unde intervenim?</div><div class="s11-org-row">' +
        B.map((x) => '<button type="button" data-b="' + x.id + '" class="s11-org-node' + (x.id === cur ? ' is-on' : '') + '"><i>' + x.k + '</i><span>' + x.q + '</span><b>' + x.page + '</b></button>').join('') + '</div></div>' +
        '<div class="s11-org-detail"><div class="s11-org-head"><span class="s11-tag">Pagina ' + (B.indexOf(b) + 1) + ' · ' + b.page + '</span><h3>' + b.q + '</h3><p class="s11-note">' + b.nav + '</p></div>' +
        wireframe(b.page, b.blocks) +
        '<p class="s10-cap" style="margin-top:14px">Ce punem pe pagină și de ce</p><div class="s11-why-grid">' + b.on.map((o) => '<div><b>' + o[0] + '</b><p>' + o[1] + '</p></div>').join('') + '</div>' +
        '<div class="s11-verdict is-good"><strong>Răspunsul din date:</strong> ' + b.ans + '</div></div>';
      root.querySelectorAll('[data-b]').forEach((x) => x.addEventListener('click', () => { cur = x.dataset.b; render(); }));
    };
    render();
  });

  /* ---------- 10 · storyboard și titluri ---------- */
  document.querySelectorAll('[data-s11-story]').forEach((root) => {
    const ppas = (ms) => sumCo(null, ms, V) / sumCo(null, ms, PAS);
    const down = D.rute.filter((_, r) => sumRo(r, Y25, V) < sumRo(r, Y24, V)).length;
    const P = {
      overview: { name: 'Overview', ord: 1, label: 'Venit 2025', action: 'Venitul crește cu ' + fP(V25 / V24 - 1, 0) + ', dar e cu ' + nf(Math.abs(V25 / T25 - 1) * 100, 1) + '% sub țintă' },
      venit: { name: 'Venit & preț', ord: 2, label: 'Venit, pasageri și preț', action: 'Creștem din pasageri (' + fP(sumCo(null, Y25, PAS) / sumCo(null, Y24, PAS) - 1) + ') și din venit pe pasager (' + fP(ppas(Y25) / ppas(Y24) - 1) + ')' },
      rute: { name: 'Rute & companii', ord: 3, label: 'Venit pe companii și rute', action: 'AeroCarpati scade (' + fP(sumCo(AERO, Y25, V) / sumCo(AERO, Y24, V) - 1) + '), celelalte cresc cu ' + fP(sumCo(others, Y25, V) / sumCo(others, Y24, V) - 1, 0) },
      operational: { name: 'Operațional', ord: 4, label: 'Indicatori operaționali', action: 'Zburăm mai plini (' + fPP(lf(null, Y25) - lf(null, Y24)) + ') și mai la timp (' + fPP(ontime(null, Y25) - ontime(null, Y24)) + ')' },
      detaliu: { name: 'Detaliu', ord: 5, label: 'Tabel rute × trimestre', action: down + ' din ' + D.rute.length + ' rute sunt sub 2024: aici căutăm unde intervenim' }
    };
    const START = ['rute', 'detaliu', 'overview', 'operational', 'venit'];
    const st = { order: START.slice(), action: false, checked: false };
    let dragId = null;
    const move = (id, to) => { const o = st.order.filter((x) => x !== id); o.splice(Math.max(0, Math.min(o.length, to)), 0, id); st.order = o; st.checked = false; render(); };
    const render = () => {
      const ok = st.order.every((id, i) => P[id].ord === i + 1);
      root.innerHTML = '<div class="s11-story-wrap"><ol class="s11-board">' + st.order.map((id, i) => {
        const p = P[id], right = P[id].ord === i + 1;
        return '<li draggable="true" data-id="' + id + '" class="' + (st.checked ? (right ? 'is-right' : 'is-wrong') : '') + '"><span class="h" aria-hidden="true">⋮⋮</span><span class="n">' + (i + 1) + '</span>' +
          '<span class="t"><b>' + esc(st.action ? p.action : p.label) + '</b><small>Pagina: ' + p.name + '</small></span>' +
          '<span class="mv"><button type="button" data-up="' + id + '" aria-label="Mută mai sus"' + (i === 0 ? ' disabled' : '') + '>▲</button><button type="button" data-dn="' + id + '" aria-label="Mută mai jos"' + (i === st.order.length - 1 ? ' disabled' : '') + '>▼</button></span></li>';
      }).join('') + '</ol>' +
        '<div class="s11-story-side"><div class="s11-btns"><button type="button" class="s11-chip is-on" data-check>Verifică ordinea</button><button type="button" class="s11-chip" data-shuffle>De la capăt</button></div>' +
        '<p class="s10-cap" style="margin-top:14px">Titlurile paginilor</p><div class="s11-btns"><button type="button" class="s11-chip' + (st.action ? '' : ' is-on') + '" data-t="0">Etichetă</button><button type="button" class="s11-chip' + (st.action ? ' is-on' : '') + '" data-t="1">Concluzie</button></div>' +
        (st.checked
          ? '<div class="s11-verdict ' + (ok ? 'is-good' : 'is-bad') + '">' + (ok ? '<strong>Corect:</strong> Cât? → De ce? → Unde? → Ce ne costă? → Care exact? De la ansamblu la detaliu.' : '<strong>Încă nu.</strong> Rândurile portocalii nu sunt la locul lor. Indiciu: începeți cu răspunsul pe scurt și terminați cu tabelul de detaliu.') + '</div>'
          : '<p class="s11-note">Prindeți un rând de <strong>⋮⋮</strong> și trageți-l, sau folosiți săgețile.</p>') +
        '<div class="s11-why-box"><b>Logica orizontală</b><p>Citind doar titlurile, de sus în jos, cititorul trebuie să înțeleagă toată povestea. ' + (st.action ? 'Acum citiți lista: e chiar povestea de 3 minute.' : 'Comutați pe <strong>Concluzie</strong> și citiți din nou lista.') + '</p></div></div></div>';
      root.querySelectorAll('[data-up]').forEach((b) => b.addEventListener('click', () => move(b.dataset.up, st.order.indexOf(b.dataset.up) - 1)));
      root.querySelectorAll('[data-dn]').forEach((b) => b.addEventListener('click', () => move(b.dataset.dn, st.order.indexOf(b.dataset.dn) + 1)));
      root.querySelector('[data-check]').addEventListener('click', () => { st.checked = true; render(); });
      root.querySelector('[data-shuffle]').addEventListener('click', () => { st.order = START.slice(); st.checked = false; st.action = false; render(); });
      root.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => { st.action = b.dataset.t === '1'; render(); }));
      root.querySelectorAll('.s11-board li').forEach((li) => {
        li.addEventListener('dragstart', (e) => { dragId = li.dataset.id; li.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (err) { /* IE */ } });
        li.addEventListener('dragend', () => li.classList.remove('is-drag'));
        li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('is-over'); });
        li.addEventListener('dragleave', () => li.classList.remove('is-over'));
        li.addEventListener('drop', (e) => { e.preventDefault(); if (dragId && dragId !== li.dataset.id) move(dragId, st.order.indexOf(li.dataset.id)); dragId = null; });
      });
    };
    render();
  });

  /* ---------- 11 · curățarea unui grafic ---------- */
  document.querySelectorAll('[data-s11-declutter]').forEach((root) => {
    const RAINBOW = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#a3a3a3'];
    const rows = D.companii.map((c, i) => ({ c: c, i: i, v: sumCo(i, Y25, V), y: sumCo(i, Y25, V) / sumCo(i, Y24, V) - 1 }));
    const STEPS = [
      { t: 'Graficul de pornire', d: 'Ordine alfabetică, 10 culori, grilă, chenar, legendă și cifre cu zecimale. Totul cere atenție deodată.' },
      { t: 'Scoatem chenarul și grila', d: 'Nu adaugă informație. Pe fundal liber, barele se văd mai bine.' },
      { t: 'Sortăm de la mare la mic', d: 'Poziția e primul lucru pe care îl citește ochiul: cel mai mare sus.' },
      { t: 'O singură culoare, fără legendă', d: 'Zece culori sugerează zece grupe diferite. Aici e o singură măsură: un gri.' },
      { t: 'O culoare de accent', d: 'Colorăm doar ce trebuie observat: AeroCarpati. Etichete scurte, fără zecimale.' },
      { t: 'Un titlu simplu', d: 'În cuvintele cititorului, fără „Sum of … by …”. Se înțelege din prima ce arată graficul.' }
    ];
    root.innerHTML = '<div class="s11-box"><div data-chart></div></div><div class="s11-box">' +
      '<div data-ask><h3 class="s11-h3" style="margin-top:0">Ce ați schimba la acest grafic?</h3><p class="s11-note">Uitați-vă 2 minute și spuneți ce ați scoate, ce ați muta și ce ați colora. Apoi vedem pașii.</p><button type="button" class="s10-btn" data-show style="margin-top:10px">Arată pașii</button></div>' +
      '<div data-steps hidden><input type="range" min="0" max="5" value="0" data-r aria-label="Pasul de curățare"><ul class="s11-dc-steps">' + STEPS.map((s, i) => '<li data-i="' + i + '"><strong>' + i + ' · ' + s.t + '</strong><br>' + s.d + '</li>').join('') + '</ul></div></div>';
    root.querySelector('[data-show]').addEventListener('click', () => { root.querySelector('[data-ask]').hidden = true; root.querySelector('[data-steps]').hidden = false; });
    const chart = root.querySelector('[data-chart]');
    const range = root.querySelector('[data-r]');
    const render = () => {
      const k = +range.value;
      root.querySelectorAll('.s11-dc-steps li').forEach((li) => { const i = +li.dataset.i; li.classList.toggle('is-done', i <= k); li.classList.toggle('is-now', i === k); });
      const list = k >= 2 ? rows.slice().sort((a, b) => b.v - a.v) : rows.slice().sort((a, b) => a.c.localeCompare(b.c));
      const max = Math.max.apply(null, rows.map((r) => r.v));
      const W = 560, L = 120, rh = 22, top = 30, H = top + list.length * rh + (k >= 3 ? 8 : 40);
      let s = '';
      if (k === 0) s += '<rect x="1" y="1" width="' + (W - 2) + '" height="' + (H - 2) + '" style="fill:none;stroke:var(--text-2);stroke-width:2"/>';
      s += k >= 5 ? text(8, 20, 'Venitul pe companii, 2025', 'start', 'lbl', 'font-size:14px')
        : text(8, 18, 'Sum of Venit Zboruri by Companie', 'start', 'lbl', 'font-size:12px');
      if (k === 0) for (let g = 0; g <= 5; g++) { const x = L + g * (W - L - 60) / 5; s += '<line x1="' + x + '" x2="' + x + '" y1="' + top + '" y2="' + (top + list.length * rh) + '" style="stroke:var(--border)"/>' + text(x, top + list.length * rh + 14, nf(max * g / 5, 0), 'middle', '', 'font-size:8px'); }
      list.forEach((r, j) => {
        const y = top + j * rh, w = r.v / max * (W - L - 70);
        const fill = k < 3 ? 'fill:' + RAINBOW[r.i] : k >= 4 && r.i === AERO ? C.acc : C.mute;
        s += text(L - 6, y + 15, esc(r.c), 'end', k >= 4 && r.i === AERO ? 'lbl' : '');
        s += rect(L, y + 3, w, rh - 6, fill);
        s += text(L + w + 4, y + 15, k >= 4 ? fM(r.v) : nf(r.v, 2), 'start', '', k >= 4 ? '' : 'font-size:8.5px');
      });
      if (k < 3) {
        const ly = top + list.length * rh + 24;
        list.forEach((r, j) => { const x = 8 + (j % 5) * 110, yy = ly + Math.floor(j / 5) * 12; s += rect(x, yy - 7, 8, 8, 'fill:' + RAINBOW[r.i]) + text(x + 11, yy, esc(r.c), 'start', '', 'font-size:8px'); });
      }
      chart.innerHTML = svg(W, H + (k < 3 ? 8 : 0), s);
    };
    range.addEventListener('input', render);
    render();
  });

  /* ---------- matrice comune pentru partea 3 ---------- */
  const mix = (varName, pct) => 'background:color-mix(in srgb, var(' + varName + ') ' + Math.round(pct) + '%, transparent)';
  const coRows = D.companii.map((c, i) => ({ c: c, a: sumCo(i, Y25, V), b: sumCo(i, Y24, V) })).map((r) => Object.assign(r, { y: r.a / r.b - 1 })).sort((x, y) => y.a - x.a);

  /* ---------- 12 · brad de Crăciun ---------- */
  document.querySelectorAll('[data-s11-xmas]').forEach((root) => {
    const max = Math.max.apply(null, coRows.map((r) => r.a));
    const hue = (v, h) => 'background:hsl(' + h + ',85%,' + (88 - v * 40) + '%);color:#111';
    const bad = coRows.slice(0, 6).map((r) => '<tr><td style="font-weight:800;color:#7c3aed">' + esc(r.c) + '</td><td class="cell" style="' + hue(r.a / max, 0 + r.a / max * 120) + '">' + nf(r.a, 0) + '</td><td class="cell" style="' + hue(r.b / max, 280) + ';font-style:italic">' + nf(r.b, 0) + '</td><td class="cell" style="' + hue(Math.abs(r.y) * 2, 50) + ';font-weight:800;color:' + (r.y > 0.2 ? '#16a34a' : '#dc2626') + '">' + (r.y > 0.15 ? '★ ' : r.y < 0 ? '⚠ ' : '● ') + fP(r.y) + '</td></tr>').join('');
    const good = coRows.slice(0, 6).map((r) => '<tr><td>' + esc(r.c) + '</td><td>' + fM(r.a) + '</td><td>' + fM(r.b) + '</td><td class="' + cls(r.y >= 0) + '">' + arrow(r.y) + ' ' + fP(r.y) + '</td></tr>').join('');
    const head = '<thead><tr><th>Companie</th><th>2025</th><th>2024</th><th>YoY %</th></tr></thead>';
    root.innerHTML = '<div class="s11-box"><h3>Brad de Crăciun: fiecare coloană altă regulă</h3><table class="s11-mx">' + head + '<tbody>' + bad + '</tbody></table><p class="s11-note">Ce trebuie să observ? Ochiul sare peste tot.</p></div>' +
      '<div class="s11-box"><h3>O singură regulă: YoY % albastru sau portocaliu</h3><table class="s11-mx">' + head + '<tbody>' + good + '</tbody></table><p class="s11-note">Se vede imediat: <strong>AeroCarpati</strong> e singura care scade.</p></div>';
  });

  /* ---------- 13 · harta opțiunilor ---------- */
  document.querySelectorAll('[data-s11-cfmap]').forEach((root) => {
    const R = D.rute.map((c, r) => ({ c: c, a: sumRo(r, Y25, V), b: sumRo(r, Y24, V) })).map((x) => Object.assign(x, { y: x.a / x.b - 1 })).sort((x, y) => y.a - x.a).slice(0, 6);
    const amax = Math.max.apply(null, R.map((x) => x.a)), amin = Math.min.apply(null, R.map((x) => x.a));
    const TYPES = [
      { id: 'bg', label: 'Background color', d: 'Fundalul celulei se colorează.' },
      { id: 'font', label: 'Font color', d: 'Doar textul se colorează. Mai discret decât fundalul.' },
      { id: 'bars', label: 'Data bars', d: 'O bară în celulă, proporțională cu valoarea. Ca un mic bar chart în tabel.' },
      { id: 'icons', label: 'Icons', d: 'O iconiță lângă valoare: săgeți, semafoare, steaguri.' },
      { id: 'url', label: 'Web URL', d: 'Textul devine link, din coloana cu adresa. Nu e despre culoare.' }
    ];
    const MODES = [
      { id: 'grad', label: 'Gradient', d: 'De la culoarea minimului la a maximului, pe <strong>Venit</strong>. Bun pentru „unde e mult, unde e puțin”.', set: 'Format style: <em>Gradient</em> · Lowest value → gri deschis · Highest value → culoarea de accent' },
      { id: 'rules', label: 'Rules', d: 'Praguri scrise de voi, pe <strong>YoY %</strong>. Bun când pragul are un sens („sub 0 = scădere”).', set: 'Format style: <em>Rules</em> · If value ≥ 0 Number → albastru · If value &lt; 0 Number → portocaliu' },
      { id: 'field', label: 'Field value', d: 'Culoarea vine dintr-o măsură care întoarce un cod de culoare. O regulă, refolosită în tot raportul.', set: 'Format style: <em>Field value</em> · What field should we base this on? → <code>[Culoare YoY]</code>' }
    ];
    const OK = { bg: ['grad', 'rules', 'field'], font: ['grad', 'rules', 'field'], bars: [], icons: ['rules', 'field'], url: ['field'] };
    const st = { t: 'bg', m: 'grad' };
    const render = () => {
      const allowed = OK[st.t];
      if (allowed.length && allowed.indexOf(st.m) < 0) st.m = allowed[0];
      const mode = allowed.length ? st.m : null;
      const onVenit = st.t === 'bars' || mode === 'grad';
      const body = R.map((x) => {
        const g = (x.a - amin) / (amax - amin || 1);
        let cv = '<span class="val">' + fM(x.a) + '</span>', cy = fP(x.y), sv = '', sy = '';
        const col = x.y >= 0 ? '--s11-good' : '--s11-bad';
        if (st.t === 'bars') cv = '<span class="bar" style="width:calc(' + Math.round(8 + g * 85) + '% - 8px)"></span>' + cv;
        else if (st.t === 'url') cy = '<a href="#" onclick="return false" style="color:var(--primary);text-decoration:underline">' + esc(x.c) + '</a>';
        else if (onVenit) { if (st.t === 'bg') sv = mix('--s11-accent', 10 + g * 60); else sv = 'color:color-mix(in srgb, var(--s11-accent) ' + Math.round(35 + g * 65) + '%, var(--s11-mute))'; }
        else if (st.t === 'bg') sy = mix(col, 30);
        else if (st.t === 'font') sy = 'color:var(' + col + ');font-weight:800';
        else if (st.t === 'icons') cy = '<span class="ico" style="color:var(' + col + ')">' + arrow(x.y) + '</span>' + cy;
        return '<tr><td>' + esc(x.c) + '</td><td class="cell" style="' + sv + '">' + cv + '</td><td style="' + sy + '">' + cy + '</td></tr>';
      }).join('');
      const T = TYPES.find((x) => x.id === st.t), M = mode ? MODES.find((x) => x.id === mode) : null;
      root.innerHTML = '<div class="s11-box"><p class="s11-cap">Ce se schimbă</p><div class="s11-btns">' + TYPES.map((x) => '<button type="button" class="s11-chip' + (x.id === st.t ? ' is-on' : '') + '" data-t="' + x.id + '">' + x.label + '</button>').join('') + '</div>' +
        '<p class="s11-cap">După ce regulă</p><div class="s11-btns">' + MODES.map((x) => '<button type="button" class="s11-chip' + (x.id === mode ? ' is-on' : '') + '" data-m="' + x.id + '"' + (allowed.indexOf(x.id) < 0 ? ' disabled' : '') + '>' + x.label + '</button>').join('') + '</div>' +
        '<table class="s11-mx" style="margin-top:12px"><thead><tr><th>Ruta</th><th>Venit 2025</th><th>' + (st.t === 'url' ? 'Pagina rutei' : 'YoY %') + '</th></tr></thead><tbody>' + body + '</tbody></table></div>' +
        '<div class="s11-box"><span class="s11-tag">' + T.label + '</span><p class="s11-note">' + T.d + '</p>' +
        (M ? '<h3 class="s11-h3">' + M.label + '</h3><p class="s11-note">' + M.d + '</p><div class="s10-why">' + M.set + '</div>' : '<div class="s10-why">Data bars au setările lor: minim, maxim, culoarea barei și „Show bar only”. Nu au moduri.</div>') +
        (mode === 'field' && st.t !== 'url' ? '<pre class="s10-code"><span class="m">Culoare YoY</span> =\n<span class="f">SWITCH</span> ( <span class="f">TRUE</span> (),\n    <span class="f">ISBLANK</span> ( <span class="m">[Venit YoY %]</span> ), <span class="s">"#94A3B8"</span>,\n    <span class="m">[Venit YoY %]</span> &gt;= <span class="n">0</span>, <span class="s">"#1D4ED8"</span>,\n    <span class="s">"#C2410C"</span> )</pre>' : '') +
        (mode === 'field' && st.t === 'url' ? '<pre class="s10-code"><span class="m">Link Ruta</span> = <span class="s">"https://flyable.ro/rute/"</span> &amp; <span class="f">SELECTEDVALUE</span> ( <span class="t">Dim_Rute[Cod_Ruta]</span> )</pre>' : '') +
        '<p class="s11-note">Unde: <em>Format visual → Cell elements</em>, alegeți seria (coloana), apoi comutatorul tipului și <strong>fx</strong>. Sau click dreapta pe câmp în Values → <em>Conditional formatting</em>.</p></div>';
      root.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => { st.t = b.dataset.t; render(); }));
      root.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { st.m = b.dataset.m; render(); }));
    };
    render();
  });

  /* ---------- 14 · matrix rută × trimestru ---------- */
  document.querySelectorAll('[data-s11-cf]').forEach((root) => {
    const R = D.rute.map((c, r) => ({ c: c, t: D.tipRuta[r], q: [1, 2, 3, 4].map((q) => sumRo(r, quarterMonths(2025, q), V)), a: sumRo(r, Y25, V), b: sumRo(r, Y24, V) }))
      .map((x) => Object.assign(x, { y: x.a / x.b - 1 })).sort((x, y) => y.a - x.a);
    const TOG = [
      { id: 'heat', label: 'Heatmap pe trimestre', how: '<em>Cell elements</em> → seria Venit Zboruri → <strong>Background color</strong> → fx → Gradient. Compari toate celulele între ele.' },
      { id: 'bars', label: 'Data bars pe total', how: 'Pe totalul anual: <strong>Data bars</strong>. Bun când compari pe o singură coloană.' },
      { id: 'icons', label: 'Iconițe pe YoY %', how: 'Seria Venit YoY % → <strong>Icons</strong> → fx → Rules: ≥ 0 ▲, &lt; 0 ▼.' },
      { id: 'font', label: 'Culoare din măsură', how: 'Seria Venit YoY % → <strong>Font color</strong> → fx → Field value → <code>[Culoare YoY]</code>.' },
      { id: 'tot', label: 'Heatmap și pe totaluri', how: 'În fereastra fx: <em>Apply to → Values and totals</em>. De obicei nu: totalul e mult mai mare și „arde” scala.' }
    ];
    const st = { on: { heat: true }, all: false };
    const render = () => {
      const list = st.all ? R : R.slice(0, 12);
      const qcells = list.reduce((a, x) => a.concat(x.q), []);
      const totQ = [0, 1, 2, 3].map((i) => list.reduce((a, x) => a + x.q[i], 0));
      const scale = st.on.tot ? qcells.concat(list.map((x) => x.a), totQ) : qcells;
      const mx = Math.max.apply(null, scale), mn = Math.min.apply(null, scale);
      const amax = Math.max.apply(null, list.map((x) => x.a));
      const heat = (v, isTot) => (st.on.heat && (!isTot || st.on.tot) ? mix('--s11-accent', 6 + (v - mn) / (mx - mn || 1) * 64) : '');
      const yc = (y) => (st.on.font ? 'color:var(' + (y >= 0 ? '--s11-good' : '--s11-bad') + ');font-weight:800' : '');
      const yi = (y) => (st.on.icons ? '<span class="ico" style="color:var(' + (y >= 0 ? '--s11-good' : '--s11-bad') + ')">' + arrow(y) + '</span>' : '');
      const rows = list.map((x) => '<tr><td>' + esc(x.c) + '</td>' + x.q.map((v) => '<td class="cell" style="' + heat(v) + '">' + nf(v / 1e3, 0) + '</td>').join('') +
        '<td class="cell" style="' + heat(x.a, true) + '">' + (st.on.bars ? '<span class="bar" style="width:calc(' + Math.round(x.a / amax * 92) + '% - 8px)"></span>' : '') + '<span class="val">' + nf(x.a / 1e3, 0) + '</span></td>' +
        '<td style="' + yc(x.y) + '">' + yi(x.y) + fP(x.y) + '</td></tr>').join('');
      const ta = list.reduce((a, x) => a + x.a, 0), tb = list.reduce((a, x) => a + x.b, 0);
      const foot = '<tr><td>Total</td>' + totQ.map((v) => '<td class="cell" style="' + heat(v, true) + '">' + nf(v / 1e3, 0) + '</td>').join('') + '<td class="cell" style="' + heat(ta, true) + '">' + nf(ta / 1e3, 0) + '</td><td style="' + yc(ta / tb - 1) + '">' + yi(ta / tb - 1) + fP(ta / tb - 1) + '</td></tr>';
      root.innerHTML = '<div class="s11-box"><div class="s10-scroll"><table class="s11-mx"><thead><tr><th>Ruta</th><th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>2025</th><th>YoY %</th></tr></thead><tbody>' + rows + '</tbody><tfoot>' + foot + '</tfoot></table></div>' +
        '<p class="s11-note">Venit zboruri 2025, în mii EUR. ' + (st.all ? 'Toate cele ' + R.length + ' rute.' : 'Primele 12 rute după venit.') + ' <button type="button" class="s11-chip" data-all style="padding:3px 8px;font-size:0.74rem">' + (st.all ? 'Doar primele 12' : 'Toate rutele') + '</button></p></div>' +
        '<div class="s11-box"><div class="s11-cf-tog">' + TOG.map((t) => '<label class="s11-check"><input type="checkbox" data-t="' + t.id + '"' + (st.on[t.id] ? ' checked' : '') + '><span><b>' + t.label + '</b></span></label>').join('') + '</div>' +
        '<ol class="s7-steps s11-cf-how">' + TOG.filter((t) => st.on[t.id]).map((t) => '<li>' + t.how + '</li>').join('') + '</ol>' +
        (st.on.heat && st.on.bars ? '<p class="s10-why"><strong>Când ce:</strong> heatmap-ul compară toate celulele (vezi vara pe toate rutele); data bars compară rândurile pe o coloană (care rută e mai mare pe an).</p>' : '') + '</div>';
      root.querySelectorAll('[data-t]').forEach((cb) => cb.addEventListener('change', () => { st.on[cb.dataset.t] = cb.checked; render(); }));
      root.querySelector('[data-all]').addEventListener('click', () => { st.all = !st.all; render(); });
    };
    render();
  });

  /* ---------- 15 · fx pe bar chart ---------- */
  document.querySelectorAll('[data-s11-barfx]').forEach((root) => {
    const rows = D.companii.map((c, i) => ({ c: c, i: i, a: sumCo(i, Y25, V), t: tinta(i, ALL12) })).sort((x, y) => y.a - x.a);
    const MODES = [
      { id: 'none', label: 'Fără regulă', code: '<span class="c">-- o singură culoare, din Format → Bars → Color</span>', say: 'Toate barele la fel: graficul arată clasamentul, dar nu spune ce să observi.' },
      { id: 'max', label: 'Cea mai mare', code: '<span class="m">Culoare Max</span> =\n<span class="f">IF</span> ( <span class="m">[Venit Zboruri]</span>\n        = <span class="f">MAXX</span> ( <span class="f">ALLSELECTED</span> ( <span class="t">Dim_Companii[Companie]</span> ), <span class="m">[Venit Zboruri]</span> ),\n    <span class="s">"#0E7490"</span>, <span class="s">"#CBD5E1"</span> )', say: 'Doar liderul e colorat. ALLSELECTED: maximul dintre companiile din slicer.' },
      { id: 'target', label: 'Sub țintă', code: '<span class="m">Culoare Tinta</span> =\n<span class="f">IF</span> ( <span class="m">[Venit Zboruri]</span> &lt; <span class="m">[Tinta Venit]</span>,\n    <span class="s">"#C2410C"</span>, <span class="s">"#CBD5E1"</span> )', say: '' },
      { id: 'pick', label: 'Compania aleasă', code: '<span class="c">-- tabel deconectat, pentru un slicer: Modeling → New table</span>\n<span class="t">Companie Aleasa</span> = <span class="f">DISTINCT</span> ( <span class="t">Dim_Companii[Companie]</span> )\n\n<span class="m">Culoare Aleasa</span> =\n<span class="f">IF</span> ( <span class="f">SELECTEDVALUE</span> ( <span class="t">Dim_Companii[Companie]</span> )\n        = <span class="f">SELECTEDVALUE</span> ( <span class="t">\'Companie Aleasa\'[Companie]</span> ),\n    <span class="s">"#0E7490"</span>, <span class="s">"#CBD5E1"</span> )', say: 'Cititorul alege compania din slicer; graficul nu se filtrează, doar o evidențiază printre celelalte.' }
    ];
    const st = { m: 'target', pick: AERO };
    const render = () => {
      const max = Math.max.apply(null, rows.map((r) => Math.max(r.a, r.t)));
      const W = 560, L = 120, rh = 24, H = rows.length * rh + 10;
      const under = rows.filter((r) => r.a < r.t);
      let s = '';
      rows.forEach((r, j) => {
        const y = 4 + j * rh, w = r.a / max * (W - L - 70);
        let fill = C.pri;
        if (st.m === 'max') fill = j === 0 ? C.acc : C.muteSoft;
        if (st.m === 'target') fill = r.a < r.t ? C.bad : C.muteSoft;
        if (st.m === 'pick') fill = r.i === st.pick ? C.acc : C.muteSoft;
        s += text(L - 6, y + 16, esc(r.c), 'end');
        s += rect(L, y + 3, w, rh - 7, fill);
        if (st.m === 'target') { const tx = L + r.t / max * (W - L - 70); s += '<line x1="' + tx.toFixed(1) + '" x2="' + tx.toFixed(1) + '" y1="' + (y + 1) + '" y2="' + (y + rh - 2) + '" style="stroke:var(--text);stroke-width:2"/>'; }
        s += text(L + w + 4, y + 16, fM(r.a), 'start');
      });
      const M = MODES.find((x) => x.id === st.m);
      const say = st.m === 'target' ? under.length + ' companii sunt sub țintă (linia neagră = ținta): ' + under.map((r) => r.c).join(', ') + '.' : M.say;
      root.innerHTML = '<div class="s11-box"><div class="s11-btns" style="margin-bottom:8px">' + MODES.map((x) => '<button type="button" class="s11-chip' + (x.id === st.m ? ' is-on' : '') + '" data-m="' + x.id + '">' + x.label + '</button>').join('') + '</div>' +
        (st.m === 'pick' ? '<select class="s11-sel" data-pick style="margin-bottom:8px">' + D.companii.map((c, i) => '<option value="' + i + '"' + (i === st.pick ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</select>' : '') +
        svg(W, H, s) + '</div>' +
        '<div class="s11-box"><pre class="s10-code" style="white-space:pre-wrap">' + M.code + '</pre><p class="s11-note">' + say + '</p>' +
        '<p class="s10-why"><strong>Același buton fx</strong> îl găsiți la: valoarea cardului (Callout value → Color), titlul oricărui vizual (Title → Text și Color) și fundalul formelor. O singură măsură de culoare, folosită peste tot.</p></div>';
      root.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { st.m = b.dataset.m; render(); }));
      const p = root.querySelector('[data-pick]');
      if (p) p.addEventListener('change', () => { st.pick = +p.value; render(); });
    };
    render();
  });
})();
