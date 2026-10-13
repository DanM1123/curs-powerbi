/* ==========================================================================
   Atelier de raport · modelarea
   Cursantul leagă singur tabelele, ca în Model view din Power BI: trage o
   coloană peste coloana pereche. Fiecare relație e verificată: verde dacă e
   cea potrivită, roșu cu explicația „de ce nu” și relația corectă, „de ce da”.
   ========================================================================== */
(function () {
  'use strict';

  const A = (window.Atelier = window.Atelier || {});

  A.Modeler = function (ctx) {
    const D = A.Data;
    const esc = ctx.esc, icon = ctx.icon;
    const $ = (s, r) => (r || document).querySelector(s);
    const TW = 212; // lățimea unui tabel în diagramă
    const ui = { sel: null, pick: null, hint: {}, form: {}, confirmSolve: false, confirmClear: false, scrollX: 0 };

    /* ---------- acces la model ---------- */
    const S = () => ctx.S;
    const M = () => ctx.M;
    const st = () => {
      const s = S();
      if (!s.model) s.model = { rels: [], pos: {}, revealed: false };
      return s.model;
    };
    const tbl = (name) => M().tables.find((t) => t.name === name);
    const col = (end) => { const t = tbl(end.table); return t ? t.columns.find((c) => c.name === end.col) : null; };
    const same = (x, y) => x.table === y.table && x.col === y.col;
    const ref = (e) => `${e.table}[${e.col}]`;
    const pairKey = (r) => [r.a.table, r.b.table].sort().join('|');
    const typeName = (c) => (c.type === 'number' ? 'număr' : c.type === 'date' ? 'dată' : 'text');
    const nf = (n) => Number(n).toLocaleString('ro-RO');

    function rels() {
      const m = M();
      return st().rels.filter((r) => col(r.a) && col(r.b) && r.a.table !== r.b.table && m);
    }
    function expected() {
      return M().rels.map((r) => ({ a: { table: r.from.table, col: r.from.col }, b: { table: r.to.table, col: r.to.col }, virtual: !!r.virtual, kind: r.kind }));
    }
    const matchExp = (r, exp) => (exp || expected()).find((e) => (same(e.a, r.a) && same(e.b, r.b)) || (same(e.a, r.b) && same(e.b, r.a)));
    const isFact = (name) => M().fact && M().fact.name === name;

    /* ---------- potrivirea cuvintelor din nume ---------- */
    const DROP_T = ['dim', 'dimensiune', 'tbl', 'tabel', 'd', 'fact', 'f', 'fct', 'lookup', 'curat', 'clean', 'final'];
    const stemTable = (n) => D.tokens(n).filter((x) => !DROP_T.includes(x)).join('');
    const stemCol = (n) => D.tokens(n).filter((x) => !['id', 'cod', 'key', 'fk', 'pk', 'nr', 'sku'].includes(x)).join('');
    function prefixMatch(a, b) {
      if (!a || !b) return false;
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return i >= 3 && i >= Math.min(4, Math.min(a.length, b.length) - 1);
    }

    /* ---------- statistici pe coloane ---------- */
    const statCache = new Map();
    function colStats(end) {
      const k = ref(end);
      if (statCache.has(k)) return statCache.get(k);
      const c = col(end);
      const counts = new Map();
      c.values.forEach((v) => { if (v == null) return; const s = String(v); counts.set(s, (counts.get(s) || 0) + 1); });
      const out = { counts, rows: tbl(end.table).rowCount, distinct: counts.size };
      statCache.set(k, out);
      return out;
    }
    const sample = (end, n) => [...colStats(end).counts.keys()].slice(0, n || 2).map((v) => fmtVal(end, v));
    function fmtVal(end, v) {
      const c = col(end);
      if (c && c.type === 'date' && !isNaN(+v)) return D.fmtDate(+v);
      if (c && c.type === 'number' && c.role === 'measure' && !isNaN(+v)) return Number(v).toLocaleString('ro-RO');
      return String(v);
    }

    /* ---------- verificarea unei relații ---------- */
    function evalRel(r, idx, all, exp) {
      const res = evalCore(r, exp);
      const other = all.slice(0, idx).find((o) => pairKey(o) === pairKey(r));
      res.inactive = !!other;
      if (!other) return res;
      // Power BI ține activă o singură relație între două tabele: a doua devine punctată
      const note = `Între ${esc(r.a.table)} și ${esc(r.b.table)} există deja o relație. Power BI o ține activă doar pe prima, aceasta rămâne punctată.`;
      if (res.status === 'ok') { res.status = 'warn'; res.title = 'Corectă, dar inactivă'; res.short = note + ' Șterge-o pe cealaltă.'; }
      else if (res.status === 'warn') { res.title = 'Relație inactivă'; res.short = note; }
      return res;
    }
    /* ---------- exemple concrete din date ---------- */
    // coloana care „numește” un rând (titlu, nume, dată), ca să spunem „filmul «X»”, nu „rândul 4”
    function labelCol(t) {
      return t.columns.find((c) => c.role === 'name') || t.columns.find((c) => c.type === 'date' && c.unique)
        || t.columns.find((c) => c.type === 'text' && c.role !== 'key' && c.role !== 'ignore' && c.distinct > 0.6 * t.rowCount)
        || t.columns.find((c) => c.type === 'text' && c.role !== 'key' && c.role !== 'ignore');
    }
    function labelOf(table, keyCol, value) {
      const t = tbl(table);
      const k = t && t.columns.find((c) => c.name === keyCol);
      if (!k) return null;
      const i = k.values.findIndex((v) => v != null && String(v) === String(value));
      const lc = labelCol(t);
      if (i < 0 || !lc || lc === k) return null;
      return fmtVal({ table, col: lc.name }, lc.values[i]);
    }
    const q = (v) => `„${esc(v)}”`;
    const times = (n) => (n === 1 ? 'o dată' : `de ${n} ori`);
    const thing = (t) => (t.virtual || t === M().calendar ? 'ziua' : D.singular(t.name));
    const describeBy = (t) => t.columns.filter((c) => (c.role === 'category' || c.role === 'ordinal' || c.role === 'label') && c !== labelCol(t)).slice(0, 3).map((c) => D.human(c.name).toLowerCase());
    // „film” → „Filmul”, „vânzare” → „Vânzarea”, „destinație” → „Destinația”
    const the = (w) => { const x = /ie$/.test(w) ? w.slice(0, -1) + 'a' : /[ăa]$/.test(w) ? w.slice(0, -1) + 'a' : /e$/.test(w) ? w + 'a' : /u$/.test(w) ? w + 'l' : /ziua$/.test(w) ? w : w + 'ul'; return x[0].toUpperCase() + x.slice(1); };

    function evalCore(r, exp) {
      const ca = col(r.a), cb = col(r.b);
      let many = r.a, one = r.b;
      if (ca.unique && !cb.unique) { many = r.b; one = r.a; }
      const card = !ca.unique && !cb.unique ? '*:*' : ca.unique && cb.unique ? '1:1' : '*:1';
      const e = matchExp(r, exp);
      const res = { card, many, one, inactive: false, exp: e, status: 'bad', title: 'Relație greșită', short: '', example: '', fix: null };
      const oneT = tbl(one.table), manyT = tbl(many.table);
      const ms = colStats(many), os = colStats(one);
      const topMany = [...ms.counts.entries()].sort((x, y) => y[1] - x[1])[0];
      if (e) {
        res.status = 'ok';
        res.title = 'Relație corectă';
        res.short = `Fiecare ${esc(thing(oneT))} apare <b>o singură dată</b> în ${esc(one.table)} și <b>de mai multe ori</b> în ${esc(many.table)}. Prin relație, fiecare rând din ${esc(many.table)} își găsește perechea.`;
        if (topMany) {
          const lbl = labelOf(one.table, one.col, topMany[0]);
          const by = describeBy(oneT);
          res.example = `${esc(oneT.virtual || oneT === M().calendar ? 'Ziua' : the(thing(oneT)))} cu ${esc(one.col)} = ${esc(fmtVal(many, topMany[0]))}${lbl ? ` (${q(lbl)})` : ''} apare o dată în ${esc(one.table)} și ${times(topMany[1])} în ${esc(many.table)}.${by.length ? ` Acum poți împărți ${esc(many.table)} după ${esc(by.join(', '))}.` : ''}`;
        }
        if (oneT.virtual) res.example += ' Tabelul Calendar îl creezi în Power BI.';
        return res;
      }
      if (ca.type !== cb.type) {
        res.short = `Coloanele au tipuri diferite (${typeName(ca)} și ${typeName(cb)}), deci valorile nu se pot potrivi niciodată.`;
        res.example = `${esc(r.a.col)} are valori ca ${q(sample(r.a, 1)[0])}, iar ${esc(r.b.col)} ca ${q(sample(r.b, 1)[0])}.`;
      } else if (ca.role === 'measure' || cb.role === 'measure') {
        const v = ca.role === 'measure' ? r.a : r.b;
        res.short = `<b>${esc(v.col)}</b> e o valoare (o sumă, o cantitate), nu un cod. Relațiile se fac pe coduri care spun despre ce rând e vorba, de obicei ID-uri.`;
        res.example = `${esc(v.col)} = ${q(sample(v, 1)[0])} nu spune despre ce ${esc(thing(tbl(v.table === r.a.table ? r.b.table : r.a.table)))} e vorba. Că două rânduri au aceeași valoare e o coincidență.`;
      } else if (card === '*:*') {
        const sa = colStats(r.a), sb = colStats(r.b);
        const common = [...sa.counts.keys()].find((k) => sb.counts.has(k) && (sa.counts.get(k) > 1 || sb.counts.get(k) > 1));
        res.short = 'Valorile se repetă în ambele coloane, deci Power BI nu știe ce rând cu ce rând să lege, iar totalurile se pot dubla.';
        if (common) res.example = `${q(fmtVal(r.a, common))} apare ${times(sa.counts.get(common))} în ${esc(r.a.table)} și ${times(sb.counts.get(common))} în ${esc(r.b.table)}. Cu care dintre ele să se lege?`;
      } else {
        const vals = [...ms.counts.keys()];
        const cover = vals.length ? vals.filter((v) => os.counts.has(v)).length / vals.length : 0;
        const sm = stemCol(many.col), so = stemTable(one.table), soc = stemCol(one.col);
        const mismatch = sm && so && !prefixMatch(sm, so) && !(soc && prefixMatch(sm, soc));
        if (!isFact(r.a.table) && !isFact(r.b.table)) {
          res.short = `${esc(r.a.table)} și ${esc(r.b.table)} nu se leagă direct: se întâlnesc doar într-un rând din <b>${esc(M().fact.name)}</b>. De aceea fiecare se leagă de ${esc(M().fact.name)}.`;
          res.example = `Un ${esc(D.singular(r.a.table))} și un ${esc(D.singular(r.b.table))} nu „aparțin” unul altuia. Legătura dintre ei apare doar când sunt în aceeași ${esc(M().R.unit)}.`;
        } else if (card === '1:1') {
          res.short = `Ambele coloane au valori unice. În ${esc(M().fact.name)}, codul unei dimensiuni ar trebui să se repete, pentru că același ${esc(thing(oneT))} apare în mai multe rânduri.`;
        } else if (cover < 0.6) {
          const miss = vals.find((v) => !os.counts.has(v));
          res.short = `Valorile din <b>${esc(many.col)}</b> nu se regăsesc în <b>${esc(one.col)}</b>: doar ${Math.round(cover * 100)}% se potrivesc.`;
          if (miss != null) res.example = `${esc(many.col)} = ${q(fmtVal(many, miss))} nu există în ${esc(one.table)}, unde valorile arată așa: ${sample(one, 2).map(q).join(', ')}.`;
        } else if (mismatch) {
          res.short = `<b>${esc(many.col)}</b> se referă la ${esc(D.human(sm))}, nu la ${esc(D.plural(one.table).toLowerCase())}. Numerele seamănă doar din întâmplare.`;
          const right = exp.find((x) => same(x.a, many) || same(x.b, many));
          const rightOne = right ? (same(right.a, many) ? right.b : right.a) : null;
          if (topMany) {
            const wrong = labelOf(one.table, one.col, topMany[0]);
            const real = rightOne ? labelOf(rightOne.table, rightOne.col, topMany[0]) : null;
            res.example = `Rândurile cu ${esc(many.col)} = ${esc(fmtVal(many, topMany[0]))} ar fi legate de ${esc(D.singular(one.table))}${wrong ? ` ${q(wrong)}` : ` cu ID ${esc(fmtVal(many, topMany[0]))}`}${real ? `, deși e vorba de ${q(real)}` : ''}. Cifrele ar arăta bine, dar ar fi greșite.`;
          }
        } else {
          res.status = 'warn';
          res.title = 'Merge, dar nu e relația potrivită';
          const alt = exp.find((x) => pairKey(x) === pairKey(r));
          const altFact = alt ? (isFact(alt.a.table) ? alt.a : alt.b) : null;
          res.short = altFact ? `Valorile se potrivesc, dar legătura principală cu ${esc(one.table)} se face prin <b>${esc(altFact.col)}</b>.` : `Valorile se potrivesc, dar nu e coloana care spune despre ce rând din ${esc(one.table)} e vorba.`;
        }
      }
      const nonFact = [one.table, many.table].filter((t) => !isFact(t));
      const cand = exp.filter((x) => nonFact.some((t) => x.a.table === t || x.b.table === t));
      const pick = cand.find((x) => x.a.table === one.table || x.b.table === one.table) || cand[0];
      res.fix = pick ? { rel: pick } : null;
      void manyT;
      return res;
    }

    let evCache = null;
    function evalAll() {
      if (!M()) return { list: [], exp: [], found: [], done: false, bad: 0 };
      const key = JSON.stringify(st().rels) + '|' + M().fact.name + '|' + M().rels.length;
      if (evCache && evCache.key === key) return evCache.val;
      const exp = expected();
      const list = rels();
      const ev = list.map((r, i) => ({ r, e: evalRel(r, i, list, exp) }));
      const found = exp.map((x) => ev.find((v) => v.e.exp === x && v.e.status === 'ok') || null);
      const bad = ev.filter((v) => v.e.status === 'bad').length;
      const val = { list: ev, exp, found, bad, done: found.every(Boolean) && !bad };
      evCache = { key, val };
      return val;
    }
    const done = () => evalAll().done;
    function reset() { statCache.clear(); evCache = null; ui.sel = null; ui.pick = null; }

    /* ---------- așezarea tabelelor ---------- */
    const estH = (t) => 46 + t.columns.length * 24;
    function layout() {
      if (st().layoutV !== 2) { st().pos = {}; st().layoutV = 2; }
      const pos = st().pos;
      const tables = M().tables;
      if (tables.every((t) => pos[t.name])) return;
      // așezare ca în Model view: faptele la mijloc, dimensiunile în stânga și în dreapta
      const fact = M().fact;
      const dims = tables.filter((t) => t !== fact && t.modelRole !== 'other');
      const loose = tables.filter((t) => t.modelRole === 'other');
      const left = [], right = [];
      let hl = 0, hr = 0;
      dims.forEach((t) => { if (hl <= hr) { left.push(t); hl += estH(t) + 40; } else { right.push(t); hr += estH(t) + 40; } });
      const GAP = 170, colX = [24, 24 + TW + GAP, 24 + 2 * (TW + GAP)];
      const colH = Math.max(hl, hr, estH(fact));
      const stack = (arr, x) => { let y = 24 + (colH - arr.reduce((s2, t) => s2 + estH(t) + 40, 0)) / 2; arr.forEach((t) => { pos[t.name] = { x, y: Math.round(y) }; y += estH(t) + 40; }); };
      stack(left, colX[0]);
      stack(right, colX[2]);
      pos[fact.name] = { x: colX[1], y: Math.round(24 + (colH - estH(fact)) / 2) };
      loose.forEach((t, i) => { pos[t.name] = { x: 24 + i * (TW + 40), y: 24 + colH + 40 }; });
      ctx.save();
    }
    function areaSize() {
      const pos = st().pos;
      let w = 0, h = 0;
      M().tables.forEach((t) => { const p = pos[t.name]; if (!p) return; w = Math.max(w, p.x + TW + 24); h = Math.max(h, p.y + estH(t) + 32); });
      return { w, h: Math.max(h, 460) };
    }

    /* ---------- desenul ---------- */
    const typeIcon = (t) => (t === 'number' ? '<i class="atl-ty n">123</i>' : t === 'date' ? '<i class="atl-ty d">31</i>' : '<i class="atl-ty t">Abc</i>');
    function tableHtml(t, ev) {
      const p = st().pos[t.name];
      const linked = new Set();
      ev.list.forEach(({ r }) => { [r.a, r.b].forEach((e) => { if (e.table === t.name) linked.add(e.col); }); });
      return `<div class="atl-md-t${t.virtual ? ' is-virtual' : ''}" data-md-t="${esc(t.name)}" style="left:${p.x}px;top:${p.y}px;width:${TW}px">
        <div class="atl-md-th" data-md-drag title="Trage ca să muți tabelul"><b>${esc(t.name)}</b><span>${nf(t.rowCount)} rânduri${t.virtual ? ' · de creat în Power BI' : ''}</span></div>
        <ul>${t.columns.map((c) => {
          const end = { table: t.name, col: c.name };
          const s = colStats(end);
          const picked = ui.pick && same(ui.pick, end);
          return `<li class="atl-md-c${linked.has(c.name) ? ' is-linked' : ''}${picked ? ' is-pick' : ''}" data-md-c="${esc(c.name)}" title="${esc(c.name)}: ${esc(nf(s.distinct))} valori distincte în ${esc(nf(s.rows))} rânduri">${typeIcon(c.type)}<span>${esc(c.name)}</span></li>`;
        }).join('')}</ul>
      </div>`;
    }

    const CARD_TXT = { '*:1': 'Many to one (*:1)', '1:1': 'One to one (1:1)', '*:*': 'Many to many (*:*)' };
    const ST_ICON = { ok: 'check', warn: 'alert', bad: 'x' };

    function detailHtml(v) {
      const { r, e } = v;
      const ev = evalAll();
      const fixDone = e.fix && ev.found[ev.exp.indexOf(e.fix.rel)];
      return `<div class="atl-md-det is-${e.status}">
        <div class="atl-md-det-h">${icon(ST_ICON[e.status])}<b>${esc(e.title)}</b></div>
        <div class="atl-md-rn"><code>${esc(ref(e.many))}</code><span>${esc(e.card)}</span><code>${esc(ref(e.one))}</code></div>
        <p class="atl-md-short">${e.short}</p>
        ${e.example ? `<div class="atl-md-ex"><span>Exemplu din date</span><p>${e.example}</p></div>` : ''}
        ${e.fix && e.status !== 'ok' ? `<div class="atl-md-fix"><span>Corect ar fi:</span><code>${esc(ref(e.fix.rel.a))} → ${esc(ref(e.fix.rel.b))}</code>
          ${fixDone ? '<em>(o ai deja)</em>' : `<button class="atl-btn atl-btn-xs atl-btn-primary" data-md-act="fix" data-id="${esc(r.id)}">Pune relația corectă</button>`}</div>` : ''}
        <div class="atl-md-det-foot"><button class="atl-link" data-md-act="desel">← Înapoi</button><button class="atl-btn atl-btn-xs atl-btn-ghost" data-md-act="del" data-id="${esc(r.id)}">${icon('trash')} Șterge relația</button></div>
      </div>`;
    }

    function sideHtml(ev) {
      const sel = ui.sel && ev.list.find((v) => v.r.id === ui.sel);
      if (sel) return detailHtml(sel);
      const errs = ev.list.filter((v) => v.e.status !== 'ok');
      const missing = ev.exp.length - ev.found.filter(Boolean).length;
      if (errs.length) {
        return `<div class="atl-md-sec"><h4>Relații de corectat</h4><ul class="atl-md-rels">${errs.map(({ r, e }) => `<li><button class="is-${e.status}" data-md-act="sel" data-id="${esc(r.id)}"><i></i><span>${esc(ref(e.many))} → ${esc(ref(e.one))}</span></button></li>`).join('')}</ul>
          <p class="atl-muted atl-small">Click pe o relație ca să vezi de ce nu e bună.</p></div>`;
      }
      if (ev.done) return `<div class="atl-md-done">${icon('check')}<div><b>Modelul e complet.</b><p>Toate relațiile sunt corecte.</p><a class="atl-btn atl-btn-primary atl-btn-sm" href="#poveste">Mergi la Poveste →</a></div></div>`;
      return `<div class="atl-md-sec"><h4>Nicio greșeală</h4><p class="atl-muted atl-small">${ev.list.length ? `Mai ai ${missing} ${missing === 1 ? 'tabel' : 'tabele'} de legat.` : 'Trage o coloană peste coloana pereche din alt tabel. Aici apar relațiile greșite.'}</p></div>`;
    }

    function view() {
      const m = M();
      layout();
      const ev = evalAll();
      const size = areaSize();
      const tables = m.tables.map((t) => tableHtml(t, ev)).join('');
      return `<div class="atl-wrap atl-md-wrap">
        <header class="atl-head atl-head-row"><div><h2>Modelare</h2><p>Leagă tabelele ca în Model view din Power BI: <b>trage o coloană peste coloana pereche</b> din alt tabel (sau dă click pe una, apoi pe cealaltă). </p></div>
          ${rels().length ? `<button class="atl-btn atl-btn-sm ${ui.confirmClear ? 'is-danger' : ''}" data-md-act="clear">${icon('trash')} ${ui.confirmClear ? 'Sigur? Apasă din nou' : 'Șterge toate relațiile'}</button>` : ''}</header>
        <div class="atl-md">
          <div class="atl-md-stage">
            <div class="atl-md-scroll" data-md-scroll>
              <div class="atl-md-sizer" data-md-sizer>
                <div class="atl-md-area" data-md-area style="width:${size.w}px;height:${size.h}px">
                  <svg class="atl-md-svg" data-md-svg width="${size.w}" height="${size.h}"></svg>
                  ${tables}
                </div>
              </div>
            </div>
            <div class="atl-md-zoom" role="group" aria-label="Zoom">
              <button data-md-act="zoom-out" title="Micșorează" aria-label="Micșorează">−</button>
              <span data-md-zlabel>100%</span>
              <button data-md-act="zoom-in" title="Mărește" aria-label="Mărește">+</button>
              <button data-md-act="zoom-fit" title="Potrivește pe ecran">Potrivește</button>
              <button data-md-act="relayout" title="Aranjează tabelele din nou">Aranjează</button>
            </div>
          </div>
          <aside class="atl-md-side" data-md-side>${sideHtml(ev)}</aside>
        </div>
        <div class="atl-next"><a class="atl-btn atl-btn-ghost" href="#intelege">← Înțelege datele</a>${ev.done ? '<a class="atl-btn atl-btn-primary" href="#poveste">Mergi la Poveste →</a>' : `<span class="atl-muted atl-small atl-md-left">${ev.exp.length - ev.found.filter(Boolean).length} ${ev.exp.length - ev.found.filter(Boolean).length === 1 ? 'relație lipsă' : 'relații lipsă'}${ev.bad ? ` · ${ev.bad} ${ev.bad === 1 ? 'greșită' : 'greșite'}` : ''}</span>`}</div>
      </div>`;
    }

    /* ---------- liniile ---------- */
    function anchor(end) {
      const area = $('[data-md-area]');
      if (!area) return null;
      const card = area.querySelector(`[data-md-t="${CSS.escape(end.table)}"]`);
      if (!card) return null;
      const li = card.querySelector(`[data-md-c="${CSS.escape(end.col)}"]`);
      const p = st().pos[end.table];
      const y = li ? p.y + li.offsetTop + li.offsetHeight / 2 : p.y + 20;
      return { x: p.x, y, w: card.offsetWidth };
    }
    function curve(A1, B1) {
      const ca = A1.x + A1.w / 2, cb = B1.x + B1.w / 2;
      let xa, xb, da, db;
      if (Math.abs(ca - cb) < A1.w * 0.8) { xa = A1.x + A1.w; xb = B1.x + B1.w; da = 1; db = 1; }
      else if (ca < cb) { xa = A1.x + A1.w; xb = B1.x; da = 1; db = -1; }
      else { xa = A1.x; xb = B1.x + B1.w; da = -1; db = 1; }
      const k = Math.max(44, Math.abs(xb - xa) * 0.45);
      const p = [[xa, A1.y], [xa + da * k, A1.y], [xb + db * k, B1.y], [xb, B1.y]];
      return { p, da, db, d: `M${p[0][0]},${p[0][1]} C${p[1][0]},${p[1][1]} ${p[2][0]},${p[2][1]} ${p[3][0]},${p[3][1]}` };
    }
    const bez = (p, t) => [0, 1].map((k) => (1 - t) ** 3 * p[0][k] + 3 * (1 - t) ** 2 * t * p[1][k] + 3 * (1 - t) * t * t * p[2][k] + t ** 3 * p[3][k]);
    function drawLines() {
      const svg = $('[data-md-svg]');
      if (!svg) return;
      const ev = evalAll();
      let s = '';
      ev.list.forEach(({ r, e }) => {
        const a = anchor(e.many), b = anchor(e.one);
        if (!a || !b) return;
        const c = curve(a, b);
        const cls = `atl-md-l is-${e.status}${e.inactive ? ' is-inactive' : ''}${ui.sel === r.id ? ' is-sel' : ''}`;
        s += `<path d="${c.d}" class="${cls}"/>`;
        // cardinalitatea la capete
        const mk = (pt, dir, txt) => `<text x="${pt[0] + dir * 12}" y="${pt[1] - 5}" text-anchor="middle" class="atl-md-card">${txt}</text>`;
        s += mk(c.p[0], c.da, e.card === '1:1' ? '1' : '*') + mk(c.p[3], c.db, e.card === '*:*' ? '*' : '1');
        // sensul filtrului: de la 1 spre *
        const m1 = bez(c.p, 0.47), m2 = bez(c.p, 0.53);
        const ang = Math.atan2(m1[1] - m2[1], m1[0] - m2[0]) * 180 / Math.PI;
        const mid = bez(c.p, 0.5);
        s += `<path d="M-6,-5 L4,0 L-6,5 z" class="atl-md-arrow is-${e.status}" transform="translate(${mid[0]},${mid[1]}) rotate(${ang})"/>`;
        if (r.dir === 'both') s += `<path d="M-6,-5 L4,0 L-6,5 z" class="atl-md-arrow is-${e.status}" transform="translate(${bez(c.p, 0.38)[0]},${bez(c.p, 0.38)[1]}) rotate(${ang + 180})"/>`;
        s += `<path d="${c.d}" class="atl-md-hit" data-md-rel="${esc(r.id)}"><title>${esc(ref(e.many) + ' → ' + ref(e.one) + ' · ' + e.title)}</title></path>`;
      });
      if (link && link.moved) {
        const a = anchor(link.from);
        if (a) {
          const fromRight = link.pt.x > a.x + a.w / 2;
          const x0 = fromRight ? a.x + a.w : a.x;
          const k = Math.max(30, Math.abs(link.pt.x - x0) * 0.4) * (fromRight ? 1 : -1);
          s += `<path d="M${x0},${a.y} C${x0 + k},${a.y} ${link.pt.x - k},${link.pt.y} ${link.pt.x},${link.pt.y}" class="atl-md-l is-temp"/>`;
        }
      }
      svg.innerHTML = s;
    }
    function applyZoom() {
      const sc = $('[data-md-scroll]'), area = $('[data-md-area]'), sizer = $('[data-md-sizer]');
      if (!sc || !area || !sizer) return;
      const size = areaSize();
      if (ui.zoom == null && sc.clientWidth) ui.z = Math.max(0.3, Math.min(1, (sc.clientWidth - 24) / size.w, (sc.clientHeight - 24) / size.h));
      else if (ui.zoom != null) ui.z = ui.zoom;
      const z = ui.z || 1;
      area.style.transform = `scale(${z})`;
      sizer.style.width = Math.ceil(size.w * z) + 'px';
      sizer.style.height = Math.ceil(size.h * z) + 'px';
      const lbl = $('[data-md-zlabel]');
      if (lbl) lbl.textContent = Math.round(z * 100) + '%';
    }
    function setZoom(z) { ui.zoom = Math.max(0.3, Math.min(1.6, Math.round(z * 20) / 20)); applyZoom(); drawLines(); }
    function after() {
      applyZoom();
      const sc = $('[data-md-scroll]');
      if (sc) { sc.scrollLeft = ui.scrollX || 0; sc.scrollTop = ui.scrollY || 0; }
      drawLines();
      if (sc && !sc._wheel) {
        sc._wheel = true;
        sc.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); setZoom((ui.z || 1) * (e.deltaY < 0 ? 1.1 : 0.9)); }, { passive: false });
      }
    }

    /* ---------- acțiuni ---------- */
    function rerender() {
      const sc = $('[data-md-scroll]');
      if (sc) { ui.scrollX = sc.scrollLeft; ui.scrollY = sc.scrollTop; }
      ctx.rerender();
    }
    function addRel(a, b, silent) {
      if (a.table === b.table) { ctx.toast('O relație leagă două tabele diferite.'); return; }
      const list = st().rels;
      if (list.some((r) => (same(r.a, a) && same(r.b, b)) || (same(r.a, b) && same(r.b, a)))) { ctx.toast('Relația există deja.'); return; }
      const r = { id: ctx.uid(), a: { table: a.table, col: a.col }, b: { table: b.table, col: b.col }, dir: 'single' };
      list.push(r);
      evCache = null;
      ctx.save();
      if (silent) return r;
      ui.sel = r.id;
      const ev = evalAll();
      const v = ev.list.find((x) => x.r.id === r.id);
      ctx.toast(v.e.status === 'ok' ? (ev.done ? 'Corect! Modelul e complet.' : 'Relație corectă.') : v.e.status === 'warn' ? 'Relația merge, dar uită-te la explicație.' : 'Relația nu e bună: vezi explicația din dreapta.');
      rerender();
      return r;
    }
    function delRel(id) {
      st().rels = st().rels.filter((r) => r.id !== id);
      if (ui.sel === id) ui.sel = null;
      evCache = null;
      ctx.save();
    }

    function onClick(e) {
      const t = e.target;
      const hit = t.closest('[data-md-rel]');
      if (hit) { ui.sel = hit.getAttribute('data-md-rel'); rerender(); return true; }
      const el = t.closest('[data-md-act]');
      if (!el) return false;
      const act = el.getAttribute('data-md-act');
      const ev = evalAll();
      switch (act) {
        case 'sel': ui.sel = el.dataset.id; break;
        case 'desel': ui.sel = null; break;
        case 'del': delRel(el.dataset.id); ctx.toast('Relația a fost ștearsă.'); break;
        case 'zoom-in': setZoom((ui.z || 1) + 0.1); return true;
        case 'zoom-out': setZoom((ui.z || 1) - 0.1); return true;
        case 'zoom-fit': ui.zoom = null; applyZoom(); drawLines(); return true;
        case 'relayout': st().pos = {}; ui.zoom = null; ctx.save(); break;
        case 'fix': {
          const v = ev.list.find((x) => x.r.id === el.dataset.id);
          if (v && v.e.fix) { delRel(v.r.id); const nr = addRel(v.e.fix.rel.a, v.e.fix.rel.b, true); ui.sel = nr ? nr.id : null; ctx.toast('Am pus relația corectă.'); }
          break;
        }
        case 'clear':
          if (!ui.confirmClear) { ui.confirmClear = true; setTimeout(() => { ui.confirmClear = false; }, 4000); break; }
          ui.confirmClear = false; st().rels = []; ui.sel = null; evCache = null; ctx.save();
          break;
        default: return false;
      }
      rerender();
      return true;
    }
    function onChange(e) {
      const t = e.target;
      if (t.matches('[data-md-dir]')) {
        const r = st().rels.find((x) => x.id === t.getAttribute('data-md-dir'));
        if (r) { r.dir = t.value; evCache = null; ctx.save(); rerender(); }
        return true;
      }
      return false;
    }
    function onToggle(e) {
      if (e.target.matches && e.target.matches('.atl-md-form')) ui.form.open = e.target.open;
    }

    /* ---------- tragere: mutarea tabelelor și legarea coloanelor ---------- */
    let drag = null, link = null;
    function areaPoint(e) {
      const area = $('[data-md-area]');
      const r = area.getBoundingClientRect();
      const z = ui.z || 1;
      return { x: (e.clientX - r.left) / z, y: (e.clientY - r.top) / z };
    }
    function endOf(el) {
      const c = el && el.closest('[data-md-c]');
      const t = c && c.closest('[data-md-t]');
      return c && t ? { table: t.getAttribute('data-md-t'), col: c.getAttribute('data-md-c') } : null;
    }
    function onPointerDown(e) {
      if (e.button !== 0) return false;
      const head = e.target.closest('[data-md-drag]');
      if (head) {
        const name = head.closest('[data-md-t]').getAttribute('data-md-t');
        const p = st().pos[name];
        drag = { name, el: head.closest('[data-md-t]'), start: areaPoint(e), ox: p.x, oy: p.y, moved: false };
        e.preventDefault();
        return true;
      }
      const end = endOf(e.target);
      if (end) {
        link = { from: end, start: areaPoint(e), pt: areaPoint(e), moved: false, el: e.target.closest('[data-md-c]') };
        e.preventDefault();
        return true;
      }
      return false;
    }
    function onPointerMove(e) {
      if (drag) {
        const pt = areaPoint(e);
        const dx = pt.x - drag.start.x, dy = pt.y - drag.start.y;
        if (!drag.moved && Math.hypot(dx, dy) < 3) return true;
        drag.moved = true;
        const p = st().pos[drag.name];
        p.x = Math.max(4, Math.round(drag.ox + dx));
        p.y = Math.max(4, Math.round(drag.oy + dy));
        drag.el.style.left = p.x + 'px';
        drag.el.style.top = p.y + 'px';
        drag.el.classList.add('is-moving');
        const area = $('[data-md-area]');
        const size = areaSize();
        if (area) { area.style.width = size.w + 'px'; area.style.height = size.h + 'px'; const svg = $('[data-md-svg]'); svg.setAttribute('width', size.w); svg.setAttribute('height', size.h); }
        if (ui.zoom == null) ui.zoom = ui.z || 1;
        applyZoom();
        drawLines();
        return true;
      }
      if (link) {
        link.pt = areaPoint(e);
        if (!link.moved && Math.hypot(link.pt.x - link.start.x, link.pt.y - link.start.y) < 5) return true;
        link.moved = true;
        document.body.classList.add('atl-md-linking');
        document.querySelectorAll('.atl-md-c.is-target').forEach((x) => x.classList.remove('is-target'));
        const over = endOf(document.elementFromPoint(e.clientX, e.clientY));
        if (over && over.table !== link.from.table) {
          const el = document.querySelector(`[data-md-t="${CSS.escape(over.table)}"] [data-md-c="${CSS.escape(over.col)}"]`);
          if (el) el.classList.add('is-target');
        }
        link.el.classList.add('is-pick');
        drawLines();
        return true;
      }
      return false;
    }
    function onPointerUp(e) {
      if (drag) {
        const d = drag;
        drag = null;
        if (d.moved) { d.el.classList.remove('is-moving'); ctx.save(); }
        return true;
      }
      if (link) {
        const l = link;
        link = null;
        document.body.classList.remove('atl-md-linking');
        if (l.moved) {
          const to = endOf(document.elementFromPoint(e.clientX, e.clientY));
          if (to && to.table !== l.from.table) { ui.pick = null; addRel(l.from, to); }
          else { rerender(); }
          return true;
        }
        // click: primul capăt, apoi al doilea
        if (ui.pick && same(ui.pick, l.from)) ui.pick = null;
        else if (ui.pick && ui.pick.table !== l.from.table) { const a = ui.pick; ui.pick = null; addRel(a, l.from); return true; }
        else { ui.pick = l.from; ctx.toast(`Ai ales ${ref(l.from)}. Acum dă click pe coloana pereche din alt tabel.`); }
        rerender();
        return true;
      }
      return false;
    }
    function onKey(e) {
      if (e.key === 'Escape' && (ui.sel || ui.pick)) { ui.sel = null; ui.pick = null; rerender(); return true; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && ui.sel && !e.target.closest('input, textarea, select')) { delRel(ui.sel); rerender(); return true; }
      return false;
    }

    return { view, after, evalAll, done, reset, onClick, onChange, onToggle, onPointerDown, onPointerMove, onPointerUp, onKey };
  };
})();
