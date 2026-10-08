/* Sesiunea 6 · DAX
   - tabelul de exemplu (8 rânduri inventate, valori 1–10)
   - laborator de filter context: slicere + card, ce rânduri intră în calcul
   - demo slicer pe Categorie: filtru din CALCULATE vs ALL, pe același exemplu
   - „Ce număr apare?”: întrebări pe categorii de funcții, pe Vanzari_demo_curat.xlsx
   - pagina de exerciții, cu grupe
   - iterator SUMX pas cu pas
   - % din total pe categorii, cu / fără ALL */
(function () {
  'use strict';

  const fmt = (n) => Number(n).toLocaleString('ro-RO', Number.isInteger(n)
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (n) => (n * 100).toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

  /* ---------- Tabelul de exemplu ---------- */
  const ROWS = [
    { id: 1, client: 1, regiune: 'Nord-Vest', categorie: 'Electronice', status: 'Platit', valoare: 5 },
    { id: 2, client: 2, regiune: 'Nord-Vest', categorie: 'Alimente', status: 'Platit', valoare: 2 },
    { id: 3, client: 1, regiune: 'Nord-Vest', categorie: 'Electronice', status: 'Anulat', valoare: 3 },
    { id: 4, client: 3, regiune: 'Sud-Est', categorie: 'Electronice', status: 'Platit', valoare: 4 },
    { id: 5, client: 2, regiune: 'Sud-Est', categorie: 'Alimente', status: 'Partial', valoare: 1 },
    { id: 6, client: 4, regiune: 'Sud-Est', categorie: 'Alimente', status: 'Anulat', valoare: 2 },
    { id: 7, client: 1, regiune: 'Bucuresti-Ilfov', categorie: 'Electronice', status: 'Platit', valoare: 6 },
    { id: 8, client: 3, regiune: 'Bucuresti-Ilfov', categorie: 'Alimente', status: 'Platit', valoare: 3 }
  ];
  const REGIUNI = ['Nord-Vest', 'Sud-Est', 'Bucuresti-Ilfov'];
  const CATEGORII = ['Electronice', 'Alimente'];
  const sumOf = (rows) => rows.reduce((a, r) => a + r.valoare, 0);

  const TOTAL_CODE = '<span class="m">Total Vanzari</span> =\n<span class="f">SUM</span> ( <span class="t">Vanzari[Valoare_Totala]</span> )';

  const slicerHtml = (dim, label, values) =>
    `<div class="s6-slicer"><span class="s6-slicer-lbl">Slicer · ${label}</span><div class="s6-slicer-opts" data-dim="${dim}">` +
    ['Toate'].concat(values).map((v) => `<button type="button" data-v="${v}">${v}</button>`).join('') +
    '</div></div>';

  function bindSlicers(root, state, render) {
    root.querySelectorAll('.s6-slicer-opts').forEach((g) => {
      g.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        state[g.dataset.dim] = b.dataset.v === 'Toate' ? null : b.dataset.v;
        render();
        b.blur();
      });
    });
  }
  function markSlicers(root, state) {
    root.querySelectorAll('.s6-slicer-opts').forEach((g) => {
      const cur = state[g.dataset.dim];
      g.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', (cur || 'Toate') === b.dataset.v));
    });
  }

  /* ---------- Tabelul static (pentru slide-uri) ---------- */
  function initRowsTable(root) {
    root.innerHTML = '<thead><tr><th>#</th><th>ID_Client</th><th>Regiune</th><th>Categorie</th><th>Status_Plata</th><th>Valoare_Totala</th></tr></thead><tbody>' +
      ROWS.map((r) => `<tr><td>${r.id}</td><td>${r.client}</td><td>${r.regiune}</td><td>${r.categorie}</td><td>${r.status}</td><td>${fmt(r.valoare)}</td></tr>`).join('') +
      '</tbody>';
  }

  /* ---------- Filter context: slicere + card ---------- */
  function initCtxLab(root) {
    const state = { regiune: null, categorie: null };
    root.innerHTML = `
      <div class="s6-lab-grid">
        <div class="s6-lab-visual">
          ${slicerHtml('regiune', 'Regiune', REGIUNI)}
          ${slicerHtml('categorie', 'Categorie', CATEGORII)}
          <div class="s6-lab-card"><span class="s6-lab-card-name">[Total Vanzari]</span><strong data-value></strong></div>
          <pre class="s06-dax-code s6-lab-code">${TOTAL_CODE}</pre>
        </div>
        <div class="s6-lab-rows">
          <table class="s6-lab-tbl">
            <thead><tr><th>#</th><th>Regiune</th><th>Categorie</th><th>Valoare_Totala</th></tr></thead>
            <tbody data-rows></tbody>
          </table>
          <p class="s6-lab-sum" data-sum></p>
          <div class="s6-lab-legend"><span><i class="is-in"></i>intră în calcul</span><span><i class="is-out"></i>scos de un filtru</span></div>
        </div>
      </div>`;
    const tbody = root.querySelector('[data-rows]');
    const sumEl = root.querySelector('[data-sum]');
    const valEl = root.querySelector('[data-value]');

    function render() {
      const keep = ROWS.filter((r) => (!state.regiune || r.regiune === state.regiune) && (!state.categorie || r.categorie === state.categorie));
      tbody.innerHTML = ROWS.map((r) => `<tr class="${keep.includes(r) ? 'is-in' : 'is-out'}"><td>${r.id}</td><td>${r.regiune}</td><td>${r.categorie}</td><td>${fmt(r.valoare)}</td></tr>`).join('');
      const filt = [state.regiune && 'Regiune = ' + state.regiune, state.categorie && 'Categorie = ' + state.categorie].filter(Boolean);
      sumEl.innerHTML = `<b>Filtre:</b> ${filt.length ? filt.join(' · ') : 'niciunul'} → <b>${keep.length}</b> rânduri. ` +
        `<b>SUM</b> = ${keep.length ? keep.map((r) => r.valoare).join(' + ') : '0'} = <b>${fmt(sumOf(keep))}</b>`;
      valEl.textContent = fmt(sumOf(keep));
      markSlicers(root, state);
    }
    bindSlicers(root, state, render);
    render();
  }

  /* ---------- Laborator CALCULATE / ALL: aceleași 8 rânduri, slicere pe Regiune și Categorie ----------
     Fiecare măsură spune ce face cu filtrul pe Categorie; Regiune vine mereu din slicer. */
  const CAT_MEASURES = {
    total: {
      name: 'Total Vanzari',
      code: TOTAL_CODE,
      cat: (sl) => sl,
      how: (sl) => sl ? 'din slicer' : 'fără filtru'
    },
    electronice: {
      name: 'Vanzari Electronice',
      code: '<span class="m">Vanzari Electronice</span> =\n<span class="f">CALCULATE</span> (\n    <span class="m">[Total Vanzari]</span>,\n    <span class="t">Dim_Produse[Categorie]</span> = <span class="s">"Electronice"</span>\n)',
      cat: () => 'Electronice',
      how: (sl) => !sl
        ? '<i class="is-calc">adăugat de CALCULATE</i>'
        : sl === 'Electronice'
          ? 'slicerul și CALCULATE cer același lucru'
          : `<i class="is-calc">înlocuit de CALCULATE</i> (slicerul cerea ${sl})`
    },
    toate: {
      name: 'Total toate categoriile',
      code: '<span class="m">Total toate categoriile</span> =\n<span class="f">CALCULATE</span> (\n    <span class="m">[Total Vanzari]</span>,\n    <span class="f">ALL</span> ( <span class="t">Dim_Produse[Categorie]</span> )\n)',
      cat: () => null,
      how: (sl) => sl
        ? `<i class="is-calc">șters de ALL</i> (slicerul cerea ${sl})`
        : 'fără filtru; ALL nu are ce șterge'
    }
  };

  function initCatDemo(root) {
    const keys = (root.getAttribute('data-measures') || 'total,electronice').split(',').map((s) => s.trim());
    const state = { regiune: null, categorie: 'Alimente', measure: keys[keys.length - 1] };
    root.innerHTML = `
      <div class="s6-lab-measures" role="tablist">${keys.map((k) => `<button type="button" data-k="${k}">[${CAT_MEASURES[k].name}]</button>`).join('')}</div>
      <div class="s6-lab-grid">
        <div class="s6-lab-visual">
          ${slicerHtml('regiune', 'Regiune', REGIUNI)}
          ${slicerHtml('categorie', 'Categorie', CATEGORII)}
          <div class="s6-lab-card"><span class="s6-lab-card-name" data-name></span><strong data-value></strong></div>
          <pre class="s06-dax-code s6-lab-code" data-code></pre>
        </div>
        <div class="s6-lab-rows">
          <table class="s6-lab-tbl">
            <thead><tr><th>#</th><th>Regiune</th><th>Categorie</th><th>Valoare_Totala</th></tr></thead>
            <tbody data-rows></tbody>
          </table>
          <div class="s6-lab-final" data-final></div>
        </div>
      </div>`;
    const tbody = root.querySelector('[data-rows]');

    function render() {
      const m = CAT_MEASURES[state.measure];
      const cat = m.cat(state.categorie);
      const keep = ROWS.filter((r) => (!state.regiune || r.regiune === state.regiune) && (!cat || r.categorie === cat));
      tbody.innerHTML = ROWS.map((r) => `<tr class="${keep.includes(r) ? 'is-in' : 'is-out'}"><td>${r.id}</td><td>${r.regiune}</td><td>${r.categorie}</td><td>${fmt(r.valoare)}</td></tr>`).join('');
      root.querySelector('[data-name]').textContent = '[' + m.name + ']';
      root.querySelector('[data-value]').textContent = fmt(sumOf(keep));
      root.querySelector('[data-code]').innerHTML = m.code;
      root.querySelector('[data-final]').innerHTML =
        '<span class="s6-lab-final-t">Filtrele folosite de măsură</span><ul>' +
        `<li><b>Regiune</b>: ${state.regiune || 'toate'} · ${state.regiune ? 'din slicer' : 'fără filtru'}</li>` +
        `<li><b>Categorie</b>: ${cat || 'toate'} · ${m.how(state.categorie)}</li>` +
        `</ul><p><b>SUM</b> = ${keep.length ? keep.map((r) => r.valoare).join(' + ') : '0'} = <b>${fmt(sumOf(keep))}</b></p>`;
      root.querySelectorAll('.s6-lab-measures button').forEach((b) => b.classList.toggle('is-on', b.dataset.k === state.measure));
      markSlicers(root, state);
    }
    bindSlicers(root, state, render);
    root.querySelectorAll('.s6-lab-measures button').forEach((b) => b.addEventListener('click', () => { state.measure = b.dataset.k; render(); b.blur(); }));
    render();
  }

  /* ---------- „Ce număr apare?” ----------
     real: funcții de agregare și măsuri din măsuri; calc: CALCULATE și ALL cu slicere.
     Ambele pe Vanzari_demo_curat.xlsx: participanții creează măsura în Power BI. */
  const M = (n) => `<span class="m">${n}</span>`;
  const F = (n) => `<span class="f">${n}</span>`;
  const T = (n) => `<span class="t">${n}</span>`;
  const R = (n) => `<span class="m">[${n}]</span>`;
  const S = (n) => `<span class="s">"${n}"</span>`;
  const K = (n) => `<span class="k">${n}</span>`;
  const V = (n) => `<span class="v">${n}</span>`;
  const QUIZ = {
    real: {
      SUM: [
        { q: 'Cât am vândut în total, cu TVA?', m: 'Total Vanzari', code: `${M('Total Vanzari')} = ${F('SUM')} ( ${T('Vanzari[Valoare_Totala]')} )`, a: '560.544,56' },
        { q: 'Câte bucăți am vândut în total?', m: 'Total Cantitate', code: `${M('Total Cantitate')} = ${F('SUM')} ( ${T('Vanzari[Cantitate]')} )`, a: '811' },
        { q: 'Cât TVA am facturat?', m: 'Total TVA', code: `${M('Total TVA')} = ${F('SUM')} ( ${T('Vanzari[Valoare_TVA]')} )`, a: '95.419,10' }
      ],
      COUNTROWS: [
        { q: 'Câte linii de vânzare avem?', m: 'Numar linii', code: `${M('Numar linii')} = ${F('COUNTROWS')} ( ${T('Vanzari')} )`, a: '132' },
        { q: 'Câți clienți avem în total, inclusiv cei care nu au cumpărat încă?', m: 'Total clienti', code: `${M('Total clienti')} = ${F('COUNTROWS')} ( ${T('Dim_Clienti')} )`, a: '35' },
        { q: 'Câte produse diferite vindem?', m: 'Total produse', code: `${M('Total produse')} = ${F('COUNTROWS')} ( ${T('Dim_Produse')} )`, a: '24' }
      ],
      DISTINCTCOUNT: [
        { q: 'Câți clienți diferiți au cumpărat?', m: 'Numar clienti', code: `${M('Numar clienti')} = ${F('DISTINCTCOUNT')} ( ${T('Vanzari[ID_Client]')} )`, a: '33', note: 'Avem 35 de clienți în total: doi nu au cumpărat nimic.' },
        { q: 'În câte zile diferite am facturat?', m: 'Zile cu facturi', code: `${M('Zile cu facturi')} = ${F('DISTINCTCOUNT')} ( ${T('Vanzari[Data_Facturare]')} )`, a: '125', note: 'Mai puțin decât 132 de linii: în unele zile au fost mai multe facturi.' },
        { q: 'Pe câte canale am vândut?', m: 'Numar canale', code: `${M('Numar canale')} = ${F('DISTINCTCOUNT')} ( ${T('Vanzari[Canal_Vanzare]')} )`, a: '4', note: 'Magazin fizic, Online, Partener B2B, Telefon.' }
      ],
      AVERAGE: [
        { q: 'Cât valorează, în medie, o linie de vânzare?', m: 'Medie linie', code: `${M('Medie linie')} = ${F('AVERAGE')} ( ${T('Vanzari[Valoare_Totala]')} )`, a: '4.246,55' },
        { q: 'Câte bucăți are, în medie, o linie?', m: 'Cantitate medie', code: `${M('Cantitate medie')} = ${F('AVERAGE')} ( ${T('Vanzari[Cantitate]')} )`, a: '6,14' },
        { q: 'Ce discount (%) acordăm, în medie, pe o linie?', m: 'Discount mediu', code: `${M('Discount mediu')} = ${F('AVERAGE')} ( ${T('Vanzari[Discount_Pct]')} )`, a: '8,41' }
      ],
      'Măsuri din măsuri': [
        { q: 'Cât fac împreună valoarea netă și TVA-ul?', m: 'Neta plus TVA', code: `${M('Total Valoare Neta')} = ${F('SUM')} ( ${T('Vanzari[Valoare_Neta]')} )\n${M('Neta plus TVA')} = ${R('Total Valoare Neta')} + ${R('Total TVA')}`, a: '570.077,85', note: 'Nu e egal cu [Total Vanzari]: liniile anulate au valoarea 0, dar TVA-ul lor a rămas completat.' },
        { q: 'Cât cumpără, în medie, un client?', m: 'Valoare per client', code: `${M('Valoare per client')} = ${R('Total Vanzari')} / ${R('Numar clienti')}`, a: '16.986,20' },
        { q: 'Afișează într-un singur card numărul de linii și numărul de clienți.', m: 'Linii si clienti', code: `${M('Linii si clienti')} = ${R('Numar linii')} &amp; ${S(' linii · ')} &amp; ${R('Numar clienti')} &amp; ${S(' clienti')}`, a: '132 linii · 33 clienti', note: 'Rezultatul e un text: îl pui într-un card, nu într-un grafic.' }
      ]
    },
    calc: {
      CALCULATE: [
        { q: 'Cât am vândut din categoria Electronice?', code: `${M('Vanzari Electronice')} =\n${F('CALCULATE')} ( ${R('Total Vanzari')}, ${T('Dim_Produse[Categorie]')} = ${S('Electronice')} )`, a: '415.101,05' },
        { q: 'Cât valorează vânzările plătite?', code: `${M('Vanzari platite')} =\n${F('CALCULATE')} ( ${R('Total Vanzari')}, ${T('Vanzari[Status_Plata]')} = ${S('Platit')} )`, a: '151.841,87' },
        { q: 'Cât am vândut online?', code: `${M('Vanzari Online')} =\n${F('CALCULATE')} ( ${R('Total Vanzari')}, ${T('Vanzari[Canal_Vanzare]')} = ${S('Online')} )`, a: '66.935,58' },
        { q: 'Cât am vândut din Electronice, fără liniile anulate?', code: `${M('Electronice fara anulate')} =\n${F('CALCULATE')} (\n    ${R('Total Vanzari')},\n    ${T('Dim_Produse[Categorie]')} = ${S('Electronice')},\n    ${T('Vanzari[Status_Plata]')} &lt;&gt; ${S('Anulat')}\n)`, a: '325.280,36' }
      ],
      ALL: [
        { q: 'Care este totalul vânzărilor pe toate categoriile, orice categorie ar fi selectată în raport?', code: `${M('Total toate categoriile')} =\n${F('CALCULATE')} ( ${R('Total Vanzari')}, ${F('ALL')} ( ${T('Dim_Produse[Categorie]')} ) )`, a: '560.544,56' },
        { q: 'Cât am vândut fără anulate, pe toate categoriile, orice categorie ar fi selectată?', code: `${M('Fara anulate toate categoriile')} =\n${F('CALCULATE')} (\n    ${R('Total Vanzari')},\n    ${F('ALL')} ( ${T('Dim_Produse[Categorie]')} ),\n    ${T('Vanzari[Status_Plata]')} &lt;&gt; ${S('Anulat')}\n)`, a: '445.974,08' },
        { q: 'Cât am vândut online în toate regiunile, orice regiune ar fi selectată?', code: `${M('Online toate regiunile')} =\n${F('CALCULATE')} (\n    ${R('Total Vanzari')},\n    ${F('ALL')} ( ${T('Dim_Magazine[Regiune]')} ),\n    ${T('Vanzari[Canal_Vanzare]')} = ${S('Online')}\n)`, a: '66.935,58' }
      ]
    },
    div: {
      DIVIDE: [
        { q: 'Cât valorează, în medie, o linie de vânzare?', code: `${M('Valoare medie linie')} =\n${F('DIVIDE')} ( ${R('Total Vanzari')}, ${R('Numar linii')} )`, a: '4.246,55' },
        { q: 'Cât cumpără, în medie, un client?', code: `${M('Valoare per client')} =\n${F('DIVIDE')} ( ${R('Total Vanzari')}, ${R('Numar clienti')} )`, a: '16.986,20' },
        { q: 'Cât costă, în medie, o bucată vândută?', code: `${M('Pret mediu per bucata')} =\n${F('DIVIDE')} ( ${R('Total Vanzari')}, ${R('Total Cantitate')} )`, a: '691,18' },
        { q: 'Câte bucăți are, în medie, o linie?', code: `${M('Bucati per linie')} =\n${F('DIVIDE')} ( ${R('Total Cantitate')}, ${R('Numar linii')} )`, a: '6,14' }
      ]
    },
    sumx: {
      SUMX: [
        { q: 'Cât ar fi valorat vânzările la preț de listă?', code: `${M('Valoare la pret lista')} =\n${F('SUMX')} ( ${T('Vanzari')}, ${T('Vanzari[Cantitate]')} * ${T('Vanzari[Pret_Lista]')} )`, a: '564.145' },
        { q: 'Câți lei discount am acordat?', code: `${M('Discount acordat')} =\n${F('SUMX')} (\n    ${T('Vanzari')},\n    ${T('Vanzari[Cantitate]')} * ${T('Vanzari[Pret_Lista]')} * ${T('Vanzari[Discount_Pct]')} / <span class="n">100</span>\n)`, a: '39.311,05' },
        { q: 'Cât TVA ar trebui să fie, calculat după cota de pe fiecare linie?', code: `${M('TVA recalculat')} =\n${F('SUMX')} ( ${T('Vanzari')}, ${T('Vanzari[Valoare_Neta]')} * ${T('Vanzari[Cota_TVA]')} / <span class="n">100</span> )`, a: '85.885,81', note: 'Diferit de [Total TVA] (95.419,10): pe liniile anulate valoarea netă e 0, dar TVA-ul a rămas completat.' }
      ]
    },
    var: {
      'VAR · RETURN': [
        { q: 'Valoarea medie a unei linii, scrisă pas cu pas.', code: `${M('Medie linie (VAR)')} =\n${K('VAR')} ${V('Vanzari')} = ${R('Total Vanzari')}\n${K('VAR')} ${V('Linii')} = ${R('Numar linii')}\n${K('RETURN')} ${F('DIVIDE')} ( ${V('Vanzari')}, ${V('Linii')} )`, a: '4.246,55' },
        { q: 'Cu cât diferă Neta + TVA de Total Vanzari?', code: `${M('Diferenta facturare')} =\n${K('VAR')} ${V('Calculat')} = ${R('Total Valoare Neta')} + ${R('Total TVA')}\n${K('VAR')} ${V('Raportat')} = ${R('Total Vanzari')}\n${K('RETURN')} ${V('Calculat')} - ${V('Raportat')}`, a: '9.533,29', note: 'Liniile anulate au valoarea 0, dar TVA-ul lor a rămas completat.' },
        { q: 'Ce parte din vânzări este anulată?', code: `${M('Pondere anulate')} =\n${K('VAR')} ${V('Anulate')} =\n    ${F('CALCULATE')} ( ${R('Total Vanzari')}, ${T('Vanzari[Status_Plata]')} = ${S('Anulat')} )\n${K('VAR')} ${V('Total')} = ${R('Total Vanzari')}\n${K('RETURN')} ${F('DIVIDE')} ( ${V('Anulate')}, ${V('Total')} )`, a: '20,4%', note: 'Format: Percentage.' }
      ]
    },
    cols: {
      'Coloane calculate': [
        { q: 'Care este valoarea de listă a fiecărei linii?', kind: 'Coloană calculată', code: `${M('Valoare_Lista')} =\n${T('Vanzari[Cantitate]')} * ${T('Vanzari[Pret_Lista]')}`, a: 'Primul rând: 1.995', note: '5 bucăți × 399.' },
        { q: 'Care linii sunt comenzi mari (peste 5 bucăți) și care mici?', kind: 'Coloană calculată', code: `${M('Marime_Comanda')} =\n${F('IF')} ( ${T('Vanzari[Cantitate]')} &gt; <span class="n">5</span>, ${S('Mare')}, ${S('Mica')} )`, a: 'Mare 70 · Mica 62', note: 'Pune coloana într-un tabel cu [Numar linii].' },
        { q: 'Care linii au primit discount?', kind: 'Coloană calculată', code: `${M('Are_Discount')} =\n${F('IF')} ( ${T('Vanzari[Discount_Pct]')} &gt; <span class="n">0</span>, ${S('Da')}, ${S('Nu')} )`, a: 'Da 85 · Nu 47', note: 'Într-un tabel cu [Numar linii].' }
      ]
    },
    ex: {
      'Măsuri': {
        SUM: [
          { q: 'Care este valoarea netă totală (fără TVA)?', code: `${M('Total Valoare Neta')} = ${F('SUM')} ( ${T('Vanzari[Valoare_Neta]')} )`, a: '474.658,75' },
          { q: 'Câte bucăți am vândut în total?', code: `${M('Total Cantitate')} = ${F('SUM')} ( ${T('Vanzari[Cantitate]')} )`, a: '811' },
          { q: 'Cât TVA am facturat?', code: `${M('Total TVA')} = ${F('SUM')} ( ${T('Vanzari[Valoare_TVA]')} )`, a: '95.419,10' }
        ],
        COUNTROWS: [
          { q: 'Câte magazine avem?', code: `${M('Numar magazine')} = ${F('COUNTROWS')} ( ${T('Dim_Magazine')} )`, a: '10' },
          { q: 'Câte zile are calendarul din model?', code: `${M('Zile in calendar')} = ${F('COUNTROWS')} ( ${T('Dim_Date')} )`, a: '1.461' },
          { q: 'Câți clienți avem în total?', code: `${M('Total clienti')} = ${F('COUNTROWS')} ( ${T('Dim_Clienti')} )`, a: '35' }
        ],
        DISTINCTCOUNT: [
          { q: 'Câte produse diferite s-au vândut?', code: `${M('Produse vandute')} = ${F('DISTINCTCOUNT')} ( ${T('Vanzari[ID_Produs]')} )`, a: '24' },
          { q: 'În câte magazine diferite s-a vândut?', code: `${M('Magazine cu vanzari')} = ${F('DISTINCTCOUNT')} ( ${T('Vanzari[ID_Magazin]')} )`, a: '10' },
          { q: 'Câte statusuri de plată diferite apar?', code: `${M('Numar statusuri')} = ${F('DISTINCTCOUNT')} ( ${T('Vanzari[Status_Plata]')} )`, a: '4' }
        ],
        AVERAGE: [
          { q: 'Care este prețul de listă mediu pe o linie?', code: `${M('Pret lista mediu')} = ${F('AVERAGE')} ( ${T('Vanzari[Pret_Lista]')} )`, a: '688,14' },
          { q: 'Care este valoarea netă medie pe o linie?', code: `${M('Neta medie')} = ${F('AVERAGE')} ( ${T('Vanzari[Valoare_Neta]')} )`, a: '3.595,90' },
          { q: 'Ce discount (%) acordăm, în medie, pe o linie?', code: `${M('Discount mediu')} = ${F('AVERAGE')} ( ${T('Vanzari[Discount_Pct]')} )`, a: '8,41' }
        ],
        CALCULATE: [
          { q: 'Cât am vândut prin telefon?', code: `${M('Vanzari Telefon')} =\n${F('CALCULATE')} ( ${R('Total Vanzari')}, ${T('Vanzari[Canal_Vanzare]')} = ${S('Telefon')} )`, a: '185.644,47' },
          { q: 'Cât am vândut prin parteneri B2B?', code: `${M('Vanzari B2B')} =\n${F('CALCULATE')} ( ${R('Total Vanzari')}, ${T('Vanzari[Canal_Vanzare]')} = ${S('Partener B2B')} )`, a: '184.851,94' },
          { q: 'Cât avem de încasat din vânzările neplătite?', code: `${M('Vanzari neplatite')} =\n${F('CALCULATE')} ( ${R('Total Vanzari')}, ${T('Vanzari[Status_Plata]')} = ${S('Neplatit')} )`, a: '171.531,52' }
        ],
        ALL: [
          { q: 'Totalul vânzărilor pe toate canalele, orice canal ar fi selectat.', code: `${M('Total toate canalele')} =\n${F('CALCULATE')} ( ${R('Total Vanzari')}, ${F('ALL')} ( ${T('Vanzari[Canal_Vanzare]')} ) )`, a: '560.544,56' },
          { q: 'Numărul de linii pe toate categoriile, orice categorie ar fi selectată.', code: `${M('Linii toate categoriile')} =\n${F('CALCULATE')} ( ${R('Numar linii')}, ${F('ALL')} ( ${T('Dim_Produse[Categorie]')} ) )`, a: '132' },
          { q: 'Numărul de clienți pe toate regiunile, orice regiune ar fi selectată.', code: `${M('Clienti toate regiunile')} =\n${F('CALCULATE')} ( ${R('Numar clienti')}, ${F('ALL')} ( ${T('Dim_Magazine[Regiune]')} ) )`, a: '33' }
        ],
        DIVIDE: [
          { q: 'Câte linii are, în medie, un client?', code: `${M('Linii per client')} =\n${F('DIVIDE')} ( ${R('Numar linii')}, ${R('Numar clienti')} )`, a: '4' },
          { q: 'Cât TVA reprezintă din valoarea netă?', code: `${M('TVA din neta')} =\n${F('DIVIDE')} ( ${R('Total TVA')}, ${R('Total Valoare Neta')} )`, a: '20,1%', note: 'Format: Percentage.' },
          { q: 'Ce procent din total are fiecare categorie?', code: `${M('% din total categorii')} =\n${F('DIVIDE')} ( ${R('Total Vanzari')}, ${R('Total toate categoriile')} )`, a: 'Electronice 74,1%', note: 'Tabel pe Categorie, format Percentage.' }
        ],
        SUMX: [
          { q: 'Cât face Neta + TVA, adunat linie cu linie?', code: `${M('Neta plus TVA pe linii')} =\n${F('SUMX')} ( ${T('Vanzari')}, ${T('Vanzari[Valoare_Neta]')} + ${T('Vanzari[Valoare_TVA]')} )`, a: '570.077,85' },
          { q: 'Cât e diferența dintre valoarea de listă și valoarea netă?', code: `${M('Diferenta lista neta')} =\n${F('SUMX')} (\n    ${T('Vanzari')},\n    ${T('Vanzari[Cantitate]')} * ${T('Vanzari[Pret_Lista]')} - ${T('Vanzari[Valoare_Neta]')}\n)`, a: '89.486,25' },
          { q: 'Cât e Totalul fără TVA, linie cu linie?', code: `${M('Total fara TVA')} =\n${F('SUMX')} ( ${T('Vanzari')}, ${T('Vanzari[Valoare_Totala]')} - ${T('Vanzari[Valoare_TVA]')} )`, a: '465.125,46' }
        ],
        VAR: [
          { q: 'Cât cumpără, în medie, un client? Scrie pașii cu VAR.', code: `${M('Valoare per client (VAR)')} =\n${K('VAR')} ${V('Vanzari')} = ${R('Total Vanzari')}\n${K('VAR')} ${V('Clienti')} = ${R('Numar clienti')}\n${K('RETURN')} ${F('DIVIDE')} ( ${V('Vanzari')}, ${V('Clienti')} )`, a: '16.986,20' },
          { q: 'Ce pondere au Electronicele în total?', code: `${M('Pondere Electronice')} =\n${K('VAR')} ${V('Elec')} =\n    ${F('CALCULATE')} ( ${R('Total Vanzari')}, ${T('Dim_Produse[Categorie]')} = ${S('Electronice')} )\n${K('VAR')} ${V('Total')} = ${R('Total Vanzari')}\n${K('RETURN')} ${F('DIVIDE')} ( ${V('Elec')}, ${V('Total')} )`, a: '74,1%' },
          { q: 'Ce pondere au vânzările online în total?', code: `${M('Pondere Online')} =\n${K('VAR')} ${V('Online')} =\n    ${F('CALCULATE')} ( ${R('Total Vanzari')}, ${T('Vanzari[Canal_Vanzare]')} = ${S('Online')} )\n${K('VAR')} ${V('Total')} = ${R('Total Vanzari')}\n${K('RETURN')} ${F('DIVIDE')} ( ${V('Online')}, ${V('Total')} )`, a: '11,9%' }
        ]
      },
      'Coloane calculate': {
        'Calcul pe rând': [
          { q: 'Care este valoarea de listă a fiecărei linii?', kind: 'Coloană calculată', code: `${M('Valoare_Lista')} = ${T('Vanzari[Cantitate]')} * ${T('Vanzari[Pret_Lista]')}`, a: 'Primul rând: 1.995' },
          { q: 'Câți lei discount are fiecare linie?', kind: 'Coloană calculată', code: `${M('Discount_Lei')} =\n${T('Vanzari[Cantitate]')} * ${T('Vanzari[Pret_Lista]')} * ${T('Vanzari[Discount_Pct]')} / <span class="n">100</span>`, a: 'Rândul 2: 32,40', note: '12 × 54 × 5%. Primul rând nu are discount.' },
          { q: 'Cât face Neta + TVA pe fiecare linie?', kind: 'Coloană calculată', code: `${M('Neta_plus_TVA')} = ${T('Vanzari[Valoare_Neta]')} + ${T('Vanzari[Valoare_TVA]')}`, a: 'Primul rând: 2.374,05' }
        ],
        IF: [
          { q: 'Care linii sunt comenzi mari (peste 5 bucăți)?', kind: 'Coloană calculată', code: `${M('Marime_Comanda')} =\n${F('IF')} ( ${T('Vanzari[Cantitate]')} &gt; <span class="n">5</span>, ${S('Mare')}, ${S('Mica')} )`, a: 'Mare 70 · Mica 62', note: 'Într-un tabel cu [Numar linii].' },
          { q: 'Care linii au primit discount?', kind: 'Coloană calculată', code: `${M('Are_Discount')} =\n${F('IF')} ( ${T('Vanzari[Discount_Pct]')} &gt; <span class="n">0</span>, ${S('Da')}, ${S('Nu')} )`, a: 'Da 85 · Nu 47', note: 'Într-un tabel cu [Numar linii].' },
          { q: 'Care linii sunt anulate?', kind: 'Coloană calculată', code: `${M('Este_Anulat')} =\n${F('IF')} ( ${T('Vanzari[Status_Plata]')} = ${S('Anulat')}, ${S('Da')}, ${S('Nu')} )`, a: 'Da 27 · Nu 105', note: 'Într-un tabel cu [Numar linii].' }
        ]
      }
    }
  };

  function initQuiz(root) {
    const set = QUIZ[root.getAttribute('data-s6-quiz')] || QUIZ.real;
    const nested = !Array.isArray(set[Object.keys(set)[0]]);
    const groups = nested ? set : { '': set };
    let g = Object.keys(groups)[0];
    let cur = Object.keys(groups[g])[0];
    root.innerHTML = `
      ${nested ? `<div class="s6-quiz-tabs is-main" data-main>${Object.keys(groups).map((k) => `<button type="button" data-g="${k}">${k}</button>`).join('')}</div>` : ''}
      <div class="s6-quiz-tabs" data-sub></div>
      <div class="s6-quiz-grid" data-grid></div>`;
    const grid = root.querySelector('[data-grid]');
    const sub = root.querySelector('[data-sub]');
    const nameOf = (code) => (code.match(/<span class="m">([^<]+)<\/span> =/g) || []).map((x) => x.replace(/<[^>]+>/g, '').replace(' =', '')).pop();

    function render() {
      const cats = Object.keys(groups[g]);
      root.querySelectorAll('[data-g]').forEach((b) => b.classList.toggle('is-on', b.dataset.g === g));
      sub.hidden = cats.length < 2;
      sub.innerHTML = cats.map((c) => `<button type="button" data-c="${c}" class="${c === cur ? 'is-on' : ''}">${c}</button>`).join('');
      sub.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { cur = b.dataset.c; render(); }));
      const items = groups[g][cur];
      grid.style.setProperty('--n', Math.min(items.length, 4));
      grid.innerHTML = items.map((x, i) => `
        <article class="s6-quiz-card" data-step="0">
          <span class="s6-quiz-n">${String(i + 1).padStart(2, '0')}</span>
          <p class="s6-quiz-q">${x.q}</p>
          <div class="s6-quiz-ans">
            <div class="s6-quiz-m"><span>${x.kind || 'Măsura'}</span><b>[${nameOf(x.code)}]</b></div>
            <pre class="s06-dax-code s6-quiz-code">${x.code}</pre>
            <div class="s6-quiz-a"><span>Rezultat</span><strong>${x.a}</strong>${x.note ? `<em>${x.note}</em>` : ''}</div>
          </div>
          <div class="s6-quiz-btns"><button type="button" class="s3-btn is-primary" data-show>Arată măsura și rezultatul</button></div>
        </article>`).join('');
      grid.querySelectorAll('.s6-quiz-card').forEach((card) => {
        card.querySelector('[data-show]').addEventListener('click', () => { card.dataset.step = '2'; });
      });
    }
    root.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => { g = b.dataset.g; cur = Object.keys(groups[g])[0]; render(); b.blur(); }));
    render();
  }

  /* ---------- DIVIDE: aceleași 8 rânduri, medie pe linie cu DIVIDE ----------
     Regiunea Centru nu are niciun rând: numitorul e gol și DIVIDE lasă cardul gol. */
  function initDivLab(root) {
    const state = { regiune: null, categorie: null };
    root.innerHTML = `
      <pre class="s06-dax-code s6-lab-code"><span class="m">Valoare medie linie</span> = <span class="f">DIVIDE</span> ( <span class="m">[Total Vanzari]</span>, <span class="m">[Numar linii]</span> )</pre>
      <div class="s6-lab-grid">
        <div class="s6-lab-visual">
          ${slicerHtml('regiune', 'Regiune', REGIUNI.concat('Centru'))}
          ${slicerHtml('categorie', 'Categorie', CATEGORII)}
          <div class="s6-div-cards">
            <div class="s6-lab-card"><span class="s6-lab-card-name">[Total Vanzari]</span><strong data-num></strong></div>
            <div class="s6-lab-card"><span class="s6-lab-card-name">[Numar linii]</span><strong data-den></strong></div>
            <div class="s6-lab-card is-res"><span class="s6-lab-card-name">[Valoare medie linie]</span><strong data-res></strong></div>
            <div class="s6-lab-card is-res"><span class="s6-lab-card-name">[Valoare medie linie (0)]</span><strong data-alt></strong></div>
          </div>
        </div>
        <div class="s6-lab-rows">
          <table class="s6-lab-tbl">
            <thead><tr><th>#</th><th>Regiune</th><th>Categorie</th><th>Valoare_Totala</th></tr></thead>
            <tbody data-rows></tbody>
          </table>
          <div class="s6-lab-final" data-final></div>
        </div>
      </div>`;
    const tbody = root.querySelector('[data-rows]');
    const nr = (n) => n.toLocaleString('ro-RO', { maximumFractionDigits: 2 });

    function render() {
      const keep = ROWS.filter((r) => (!state.regiune || r.regiune === state.regiune) && (!state.categorie || r.categorie === state.categorie));
      tbody.innerHTML = ROWS.map((r) => `<tr class="${keep.includes(r) ? 'is-in' : 'is-out'}"><td>${r.id}</td><td>${r.regiune}</td><td>${r.categorie}</td><td>${fmt(r.valoare)}</td></tr>`).join('');
      const num = sumOf(keep);
      const den = keep.length;
      root.querySelector('[data-num]').textContent = den ? fmt(num) : '(gol)';
      root.querySelector('[data-den]').textContent = den ? den : '(gol)';
      root.querySelector('[data-res]').textContent = den ? nr(num / den) : '(gol)';
      root.querySelector('[data-alt]').textContent = den ? nr(num / den) : '0';
      root.querySelector('[data-final]').innerHTML = den
        ? `<span class="s6-lab-final-t">Calculul</span><p><b>DIVIDE ( ${fmt(num)} , ${den} )</b> = ${fmt(num)} ÷ ${den} = <b>${nr(num / den)}</b></p>`
        : '<span class="s6-lab-final-t">Calculul</span><p>Nu există nicio linie, deci <b>nu avem la ce împărți</b>. DIVIDE lasă cardul <b>gol</b>; cu rezultatul alternativ <code>0</code> (al treilea argument), cardul arată <b>0</b>.</p>';
      markSlicers(root, state);
    }
    bindSlicers(root, state, render);
    render();
  }

  /* ---------- SUMX pas cu pas ---------- */
  function initIterator(root) {
    const rows = [
      { p: 'Mouse', q: 3, pr: 5 },
      { p: 'Monitor', q: 1, pr: 9 },
      { p: 'Căști', q: 2, pr: 4 },
      { p: 'Cablu', q: 10, pr: 1 }
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
      if (i === 0) note.innerHTML = 'Apasă <b>Rândul următor</b>. SUMX ia pe rând fiecare linie din tabel.';
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

  /* ---------- % din total pe categorii · Vanzari_demo_curat.xlsx, cu / fără ALL ---------- */
  function initPct(root) {
    const data = [
      ['Electronice', 415101.05],
      ['Servicii', 63355.01],
      ['Casa & Gradina', 37028.93],
      ['Imbracaminte', 34192.80],
      ['Alimente', 10866.77]
    ];
    const grand = data.reduce((a, d) => a + d[1], 0);
    const tbody = root.querySelector('[data-pct-rows]');
    const note = root.querySelector('[data-pct-note]');
    const btns = root.querySelectorAll('[data-pct-mode]');

    const draw = (mode) => {
      const withAll = mode === 'all';
      tbody.innerHTML = data.map(([cat, v]) => {
        const den = withAll ? grand : v;
        return `<tr><td>${cat}</td><td>${fmt(v)}</td><td class="is-den">${fmt(den)}</td><td class="is-pct"><span class="s6-pct-bar" style="--w:${(v / den) * 100}%"></span>${pct(v / den)}</td></tr>`;
      }).join('') +
        `<tr class="is-total"><td>Total</td><td>${fmt(grand)}</td><td class="is-den">${fmt(grand)}</td><td class="is-pct">${pct(1)}</td></tr>`;
      btns.forEach((b) => b.classList.toggle('is-on', b.dataset.pctMode === mode));
      note.innerHTML = withAll
        ? '<b>Cu ALL:</b> numitorul e același pe fiecare rând (560.544,56). Fiecare categorie primește ponderea ei, iar ponderile însumează 100%.'
        : '<b>Fără ALL:</b> numitorul e calculat cu același filtru ca numărătorul, deci e același număr. Rezultatul e 100% peste tot.';
    };
    btns.forEach((b) => b.addEventListener('click', () => draw(b.dataset.pctMode)));
    draw('all');
  }

  /* ---------- Recapitulare: carduri care se întorc ---------- */
  function initFlip(card) {
    card.addEventListener('click', () => {
      const on = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function init() {
    document.querySelectorAll('[data-s6-flip]').forEach(initFlip);
    document.querySelectorAll('[data-s6-rows]').forEach(initRowsTable);
    document.querySelectorAll('[data-s6-ctx]').forEach(initCtxLab);
    document.querySelectorAll('[data-s6-cat]').forEach(initCatDemo);
    document.querySelectorAll('[data-s6-quiz]').forEach(initQuiz);
    document.querySelectorAll('[data-s6-div]').forEach(initDivLab);
    document.querySelectorAll('[data-s6-iter]').forEach(initIterator);
    document.querySelectorAll('[data-s6-pct]').forEach(initPct);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
