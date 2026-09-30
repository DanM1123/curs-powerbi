/* Sesiunea 6 · DAX
   - laborator de context (card cu slicere / matrix): arată ce rânduri intră în calcul
   - iterator SUMX pas cu pas
   - % din total cu / fără ALL
   - demo medie simplă vs ponderată */
(function () {
  'use strict';

  const fmt = (n) => Number(n).toLocaleString('ro-RO', { maximumFractionDigits: 2 });
  const pct = (n) => (n * 100).toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

  /* ---------- Mini-Vanzari · 8 rânduri, numere rotunde ca să poată fi verificate în minte ---------- */
  const ROWS = [
    { id: 1, regiune: 'Nord-Vest', categorie: 'Electronice', status: 'Platit', valoare: 500 },
    { id: 2, regiune: 'Nord-Vest', categorie: 'Alimente', status: 'Platit', valoare: 100 },
    { id: 3, regiune: 'Nord-Vest', categorie: 'Electronice', status: 'Anulat', valoare: 300 },
    { id: 4, regiune: 'Sud-Est', categorie: 'Electronice', status: 'Platit', valoare: 400 },
    { id: 5, regiune: 'Sud-Est', categorie: 'Alimente', status: 'Partial', valoare: 50 },
    { id: 6, regiune: 'Sud-Est', categorie: 'Alimente', status: 'Anulat', valoare: 150 },
    { id: 7, regiune: 'Bucuresti', categorie: 'Electronice', status: 'Platit', valoare: 600 },
    { id: 8, regiune: 'Bucuresti', categorie: 'Alimente', status: 'Platit', valoare: 200 }
  ];
  const REGIUNI = ['Nord-Vest', 'Sud-Est', 'Bucuresti'];
  const CATEGORII = ['Electronice', 'Alimente'];
  const DIM = { regiune: 'Regiune', categorie: 'Categorie' };

  const matches = (row, ctx) =>
    Object.keys(ctx).every((k) => ctx[k] == null || row[k] === ctx[k]);

  const sumOf = (rows) => rows.reduce((a, r) => a + r.valoare, 0);

  /* Fiecare măsură primește filtrele din vizual (ctx) și întoarce:
     ctx final (după CALCULATE), un filtru suplimentar pe rând și pașii explicați. */
  const MEASURES = {
    total: {
      name: 'Total Vanzari',
      code: '<span class="m">Total Vanzari</span> =\n<span class="f">SUM</span> ( <span class="t">Vanzari[Valoare]</span> )',
      plan: (ctx) => ({ ctx, keep: () => true, steps: [] })
    },
    faraAnulate: {
      name: 'Vanzari fara anulate',
      code: '<span class="m">Vanzari fara anulate</span> =\n<span class="f">CALCULATE</span> (\n    <span class="f">SUM</span> ( <span class="t">Vanzari[Valoare]</span> ),\n    <span class="t">Vanzari[Status]</span> &lt;&gt; <span class="s">"Anulat"</span>\n)',
      plan: (ctx) => ({
        ctx,
        keep: (r) => r.status !== 'Anulat',
        steps: ['<b>CALCULATE</b> adaugă filtrul <code>Status ≠ "Anulat"</code> peste filtrele din vizual.']
      })
    },
    electronice: {
      name: 'Vanzari Electronice',
      code: '<span class="m">Vanzari Electronice</span> =\n<span class="f">CALCULATE</span> (\n    <span class="f">SUM</span> ( <span class="t">Vanzari[Valoare]</span> ),\n    <span class="t">Produse[Categorie]</span> = <span class="s">"Electronice"</span>\n)',
      plan: (ctx) => {
        const steps = [];
        if (ctx.categorie && ctx.categorie !== 'Electronice') {
          steps.push('<b>CALCULATE</b> <em>înlocuiește</em> filtrul <code>Categorie = ' + ctx.categorie + '</code> cu <code>Categorie = "Electronice"</code>. Filtrul tău pe aceeași coloană câștigă.');
        } else if (ctx.categorie === 'Electronice') {
          steps.push('<b>CALCULATE</b> pune <code>Categorie = "Electronice"</code>. Vizualul filtra deja la fel, deci nu se schimbă nimic.');
        } else {
          steps.push('<b>CALCULATE</b> adaugă filtrul <code>Categorie = "Electronice"</code>.');
        }
        return { ctx: Object.assign({}, ctx, { categorie: 'Electronice' }), keep: () => true, steps };
      }
    },
    totalAll: {
      name: 'Total toate regiunile',
      code: '<span class="m">Total toate regiunile</span> =\n<span class="f">CALCULATE</span> (\n    <span class="m">[Total Vanzari]</span>,\n    <span class="f">ALL</span> ( <span class="t">Magazine[Regiune]</span> )\n)',
      plan: (ctx) => ({
        ctx: Object.assign({}, ctx, { regiune: null }),
        keep: () => true,
        steps: [ctx.regiune
          ? '<b>ALL(Regiune)</b> șterge filtrul <code>Regiune = ' + ctx.regiune + '</code>. Celelalte filtre rămân.'
          : '<b>ALL(Regiune)</b> nu are ce șterge: nu există filtru pe Regiune.']
      })
    },
    pct: {
      name: '% din total',
      code: '<span class="m">% din total</span> =\n<span class="f">DIVIDE</span> (\n    <span class="m">[Total Vanzari]</span>,\n    <span class="m">[Total toate regiunile]</span>\n)',
      ratio: true
    }
  };

  function evaluate(key, ctx) {
    if (key === 'pct') {
      const a = evaluate('total', ctx);
      const b = evaluate('totalAll', ctx);
      return { value: b.value ? a.value / b.value : null, num: a, den: b, rows: a.rows, finalCtx: a.finalCtx, allRows: b.rows };
    }
    const m = MEASURES[key];
    const p = m.plan(ctx);
    const visual = ROWS.filter((r) => matches(r, ctx));
    const rows = ROWS.filter((r) => matches(r, p.ctx) && p.keep(r));
    return { value: sumOf(rows), rows, visual, steps: p.steps, finalCtx: p.ctx };
  }

  const randuri = (n) => (n === 1 ? '1</b> rând' : n + '</b> rânduri');

  const ctxLabel = (ctx) => {
    const parts = Object.keys(ctx).filter((k) => ctx[k]).map((k) => DIM[k] + ' = ' + ctx[k]);
    return parts.length ? parts.join(' · ') : 'niciun filtru (toate rândurile)';
  };

  function initCtxLab(root) {
    const mode = root.getAttribute('data-mode') || 'card';
    const keys = (root.getAttribute('data-measures') || 'total').split(',').map((s) => s.trim());
    const state = { ctx: { regiune: null, categorie: null }, measure: keys[0] };
    const usesCalc = keys.some((k) => k !== 'total');

    const measureBar = keys.length > 1
      ? '<div class="s6-lab-measures" role="tablist">' + keys.map((k) =>
          `<button type="button" data-k="${k}">[${MEASURES[k].name}]</button>`).join('') + '</div>'
      : '';

    const slicerHtml = (dim, values) =>
      `<div class="s6-slicer"><span class="s6-slicer-lbl">Slicer · ${DIM[dim]}</span><div class="s6-slicer-opts" data-dim="${dim}">` +
      ['Toate'].concat(values).map((v) => `<button type="button" data-v="${v}">${v}</button>`).join('') +
      '</div></div>';

    root.innerHTML = `
      ${measureBar}
      <div class="s6-lab-grid">
        <div class="s6-lab-visual">
          ${mode === 'card'
            ? slicerHtml('regiune', REGIUNI) + slicerHtml('categorie', CATEGORII) +
              '<div class="s6-lab-card"><span class="s6-lab-card-name" data-name></span><strong data-value></strong></div>'
            : '<p class="s6-lab-hint">Apasă o celulă din matrix.</p><table class="s6-lab-matrix" data-matrix></table>'}
          <pre class="s06-dax-code s6-lab-code" data-code></pre>
        </div>
        <div class="s6-lab-rows">
          <table class="s6-lab-tbl">
            <thead><tr><th>#</th><th>Regiune</th><th>Categorie</th><th>Status</th><th>Valoare</th></tr></thead>
            <tbody data-rows></tbody>
          </table>
          <ol class="s6-lab-steps" data-steps></ol>
          <div class="s6-lab-legend">
            <span><i class="is-in"></i>intră în calcul</span>
            <span><i class="is-out"></i>scos de filtrele din vizual</span>
            ${usesCalc ? '<span><i class="is-cut"></i>scos de CALCULATE</span><span><i class="is-add"></i>adus înapoi de CALCULATE</span>' : ''}
          </div>
        </div>
      </div>`;

    const tbody = root.querySelector('[data-rows]');
    const stepsEl = root.querySelector('[data-steps]');
    const codeEl = root.querySelector('[data-code]');

    function renderMatrix() {
      const mt = root.querySelector('[data-matrix]');
      if (!mt) return;
      const cell = (ctx) => {
        const r = evaluate(state.measure, ctx);
        const txt = MEASURES[state.measure].ratio ? (r.value == null ? '—' : pct(r.value)) : fmt(r.value);
        const on = state.ctx.regiune === ctx.regiune && state.ctx.categorie === ctx.categorie;
        return `<td><button type="button" class="${on ? 'is-on' : ''}" data-r="${ctx.regiune || ''}" data-c="${ctx.categorie || ''}">${txt}</button></td>`;
      };
      let html = '<thead><tr><th>Regiune</th>' + CATEGORII.map((c) => `<th>${c}</th>`).join('') + '<th>Total</th></tr></thead><tbody>';
      REGIUNI.forEach((reg) => {
        html += `<tr><th>${reg}</th>` + CATEGORII.map((c) => cell({ regiune: reg, categorie: c })).join('') + cell({ regiune: reg, categorie: null }) + '</tr>';
      });
      html += '<tr class="is-total"><th>Total</th>' + CATEGORII.map((c) => cell({ regiune: null, categorie: c })).join('') + cell({ regiune: null, categorie: null }) + '</tr></tbody>';
      mt.innerHTML = html;
      mt.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        state.ctx = { regiune: b.dataset.r || null, categorie: b.dataset.c || null };
        render();
        b.blur();
      }));
    }

    function render() {
      const m = MEASURES[state.measure];
      const r = evaluate(state.measure, state.ctx);
      const visual = ROWS.filter((x) => matches(x, state.ctx));
      const finalRows = m.ratio ? r.num.rows : r.rows;
      const denRows = m.ratio ? r.den.rows : [];

      tbody.innerHTML = ROWS.map((row) => {
        const inVisual = visual.includes(row);
        const inFinal = finalRows.includes(row);
        let cls = 'is-out';
        if (inFinal && inVisual) cls = 'is-in';
        else if (inFinal && !inVisual) cls = 'is-add';
        else if (!inFinal && inVisual) cls = 'is-cut';
        if (m.ratio && !inFinal && denRows.includes(row)) cls = 'is-add';
        return `<tr class="${cls}"><td>${row.id}</td><td>${row.regiune}</td><td>${row.categorie}</td><td>${row.status}</td><td>${fmt(row.valoare)}</td></tr>`;
      }).join('');

      const steps = ['<b>Filtrele din vizual:</b> ' + ctxLabel(state.ctx) + ` → <b>${randuri(visual.length)}.`];
      if (m.ratio) {
        steps.push(`<b>Numărător</b> [Total Vanzari] = ${r.num.rows.map((x) => fmt(x.valoare)).join(' + ') || '0'} = <b>${fmt(r.num.value)}</b>`);
        steps.push(r.den.steps[0]);
        steps.push(`<b>Numitor</b> [Total toate regiunile] = <b>${fmt(r.den.value)}</b> (rândurile verzi + albastre)`);
        steps.push(`<b>DIVIDE</b> → ${fmt(r.num.value)} ÷ ${fmt(r.den.value)} = <b>${r.value == null ? '—' : pct(r.value)}</b>`);
      } else {
        r.steps.forEach((s) => steps.push(s));
        steps.push(`<b>SUM</b> pe rândurile verzi${r.rows.length ? ': ' + r.rows.map((x) => fmt(x.valoare)).join(' + ') : ''} = <b>${fmt(r.value)}</b>`);
      }
      stepsEl.innerHTML = steps.map((s) => `<li>${s}</li>`).join('');
      codeEl.innerHTML = m.code;

      const nameEl = root.querySelector('[data-name]');
      const valEl = root.querySelector('[data-value]');
      if (nameEl) nameEl.textContent = '[' + m.name + ']';
      if (valEl) valEl.textContent = m.ratio ? (r.value == null ? '—' : pct(r.value)) : fmt(r.value);

      root.querySelectorAll('.s6-slicer-opts').forEach((g) => {
        const cur = state.ctx[g.dataset.dim];
        g.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', (cur || 'Toate') === b.dataset.v));
      });
      root.querySelectorAll('.s6-lab-measures button').forEach((b) => b.classList.toggle('is-on', b.dataset.k === state.measure));
      renderMatrix();
    }

    root.querySelectorAll('.s6-slicer-opts').forEach((g) => {
      g.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        state.ctx[g.dataset.dim] = b.dataset.v === 'Toate' ? null : b.dataset.v;
        render();
        b.blur();
      });
    });
    root.querySelectorAll('.s6-lab-measures button').forEach((b) => b.addEventListener('click', () => {
      state.measure = b.dataset.k;
      render();
      b.blur();
    }));

    render();
  }

  /* ---------- SUMX pas cu pas ---------- */
  function initIterator(root) {
    const rows = [
      { p: 'Mouse', q: 3, pr: 50 },
      { p: 'Monitor', q: 1, pr: 900 },
      { p: 'Căști', q: 2, pr: 350 },
      { p: 'Cablu', q: 10, pr: 20 }
    ];
    const tbody = root.querySelector('[data-iter-rows]');
    const acc = root.querySelector('[data-iter-acc]');
    const note = root.querySelector('[data-iter-note]');
    let i = 0;
    let total = 0;

    const draw = () => {
      tbody.innerHTML = rows.map((r, k) => {
        const done = k < i;
        const cur = k === i - 1;
        return `<tr class="${cur ? 'is-cur' : done ? 'is-done' : ''}"><td>${r.p}</td><td>${r.q}</td><td>${fmt(r.pr)}</td><td>${done ? fmt(r.q * r.pr) : '·'}</td></tr>`;
      }).join('');
      acc.textContent = fmt(total);
      if (i === 0) note.innerHTML = 'Apasă <b>Rândul următor</b>. SUMX ia pe rând fiecare linie din <code>Vanzari</code>.';
      else if (i < rows.length) {
        const r = rows[i - 1];
        note.innerHTML = `Rândul ${i}: <code>${r.q} × ${fmt(r.pr)} = ${fmt(r.q * r.pr)}</code> → adunat la total.`;
      } else note.innerHTML = `Gata: ${rows.length} rânduri parcurse. SUMX = <b>${fmt(total)}</b>.`;
    };

    root.querySelector('[data-iter-next]').addEventListener('click', () => {
      if (i >= rows.length) return;
      total += rows[i].q * rows[i].pr;
      i += 1;
      draw();
    });
    root.querySelector('[data-iter-all]').addEventListener('click', () => {
      while (i < rows.length) { total += rows[i].q * rows[i].pr; i += 1; }
      draw();
    });
    root.querySelector('[data-iter-reset]').addEventListener('click', () => { i = 0; total = 0; draw(); });
    draw();
  }

  /* ---------- % din total · date reale S5, cu / fără ALL ---------- */
  function initPct(root) {
    const data = [
      ['Nord-Vest', 167849.85],
      ['Bucuresti-Ilfov', 153424.61],
      ['Sud-Est', 147542.27],
      ['Sud', 51301.86],
      ['Centru', 40425.97]
    ];
    const grand = data.reduce((a, d) => a + d[1], 0);
    const tbody = root.querySelector('[data-pct-rows]');
    const note = root.querySelector('[data-pct-note]');
    const btns = root.querySelectorAll('[data-pct-mode]');

    const draw = (mode) => {
      const withAll = mode === 'all';
      tbody.innerHTML = data.map(([reg, v]) => {
        const den = withAll ? grand : v;
        return `<tr><td>${reg}</td><td>${fmt(v)}</td><td class="is-den">${fmt(den)}</td><td class="is-pct"><span class="s6-pct-bar" style="--w:${(v / den) * 100}%"></span>${pct(v / den)}</td></tr>`;
      }).join('') +
        `<tr class="is-total"><td>Total</td><td>${fmt(grand)}</td><td class="is-den">${fmt(grand)}</td><td class="is-pct">${pct(1)}</td></tr>`;
      btns.forEach((b) => b.classList.toggle('is-on', b.dataset.pctMode === mode));
      note.innerHTML = withAll
        ? '<b>Cu ALL:</b> numitorul e același pe fiecare rând (560.544,56). Fiecare regiune primește ponderea ei, iar ponderile însumează 100%.'
        : '<b>Fără ALL:</b> numitorul e calculat în același context ca numărătorul, deci e același număr. Rezultatul e 100% peste tot.';
    };
    btns.forEach((b) => b.addEventListener('click', () => draw(b.dataset.pctMode)));
    draw('all');
  }

  /* ---------- Medie simplă vs ponderată ---------- */
  function initWeightDemo(root) {
    const rows = [
      { label: 'Comanda A', cost: 10, sales: 20 },
      { label: 'Comanda B', cost: 25, sales: 125 }
    ];
    const tbody = root.querySelector('[data-s6-weight-body]');
    const outCol = root.querySelector('[data-s6-out-col]');
    const outMeas = root.querySelector('[data-s6-out-meas]');
    if (!tbody || !outCol || !outMeas) return;

    tbody.innerHTML = rows.map((r) =>
      `<tr><td>${r.label}</td><td>${r.cost}</td><td>${r.sales}</td><td>${pct(r.cost / r.sales)}</td></tr>`
    ).join('') + `<tr class="is-total"><td>Total</td><td>${rows.reduce((a, r) => a + r.cost, 0)}</td><td>${rows.reduce((a, r) => a + r.sales, 0)}</td><td>?</td></tr>`;

    const avgCol = rows.reduce((a, r) => a + r.cost / r.sales, 0) / rows.length;
    const sumC = rows.reduce((a, r) => a + r.cost, 0);
    const sumS = rows.reduce((a, r) => a + r.sales, 0);
    outCol.textContent = pct(avgCol);
    outMeas.textContent = pct(sumC / sumS);
  }

  function init() {
    document.querySelectorAll('[data-s6-ctx]').forEach(initCtxLab);
    document.querySelectorAll('[data-s6-iter]').forEach(initIterator);
    document.querySelectorAll('[data-s6-pct]').forEach(initPct);
    document.querySelectorAll('[data-s6-weight]').forEach(initWeightDemo);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
