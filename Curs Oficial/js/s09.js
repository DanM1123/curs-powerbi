/* Sesiunea 9 · Service și time intelligence
   - laborator: ce luni intră în calcul pentru fiecare funcție de timp (încasări CineRo pe luni)
   - „Ce număr apare?”: măsuri de timp, pe Cinema_curat.xlsx */
(function () {
  'use strict';

  const fmt = (n) => Number(n).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const LUNI = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const LUNI_FULL = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];

  /* Total Incasari pe luni (Proiectii[Incasari_Totale]), 2022–2024; null = nicio proiecție în lună */
  const START_YEAR = 2022;
  const INC = [
    null, 14765.44, 2091.11, 47142.26, 3424.08, 5063.90, 9723.29, null, 20926.89, 20376.59, 6487.21, 8261.89,
    6124.81, 11702.73, 10298.51, 8410.63, null, 44289.10, 5566.17, 33299.96, 5667.94, 49108.08, 12018.81, 30153.29,
    2737.80, 13617.05, 8570.09, 6759.70, 21869.02, 13724.77, 24891.31, 6017.89, null, 6750.42, 7147.12, null
  ];

  const lbl = (i) => LUNI[i % 12] + ' ' + (START_YEAR + Math.floor(i / 12));
  const sumOf = (idx) => {
    const vals = idx.filter((i) => i >= 0 && i < INC.length && INC[i] !== null).map((i) => INC[i]);
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  };

  /* ---------- Laborator ---------- */
  const FUNCS = {
    luna: {
      def: 'Măsura se evaluează în contextul curent, adică doar pe perioada filtrată de vizual.',
      use: 'Aici: doar luna din rândul de matrix.',
      name: 'Fără funcție de timp',
      code: '<span class="m">Total Incasari</span> = <span class="f">SUM</span> ( <span class="t">Proiectii[Incasari_Totale]</span> )',
      note: 'Fără nicio funcție de timp: doar luna din rândul de matrix.',
      pick: (i) => [i]
    },
    ytd: {
      def: 'Evaluează valoarea de la începutul anului până în prezent (year-to-date) a expresiei, în contextul curent.',
      use: 'Aici: de la 1 ianuarie până la sfârșitul lunii alese.',
      name: 'TOTALYTD',
      code: '<span class="m">Incasari YTD</span> =\n<span class="f">TOTALYTD</span> ( <span class="m">[Total Incasari]</span>, <span class="t">Dim_Date[Data]</span> )',
      note: 'De la 1 ianuarie al anului până la luna aleasă.',
      pick: (i) => { const out = []; for (let k = Math.floor(i / 12) * 12; k <= i; k++) out.push(k); return out; }
    },
    ly: {
      def: 'Returnează un tabel care conține o coloană de date deplasate cu un an înapoi în timp față de datele din coloana de date specificată, în contextul curent.',
      use: 'Aici: aceeași lună, cu un an înainte.',
      name: 'SAMEPERIODLASTYEAR',
      code: '<span class="m">Incasari An Anterior</span> =\n<span class="f">CALCULATE</span> ( <span class="m">[Total Incasari]</span>,\n    <span class="f">SAMEPERIODLASTYEAR</span> ( <span class="t">Dim_Date[Data]</span> ) )',
      note: 'Aceeași lună, cu un an înapoi.',
      pick: (i) => [i - 12]
    },
    pm: {
      def: 'Returnează un tabel care conține o coloană cu toate datele din luna anterioară, pe baza primei date din coloana de date specificată, în contextul curent.',
      use: 'Aici: luna de dinaintea celei alese.',
      name: 'PREVIOUSMONTH',
      code: '<span class="m">Incasari Luna Anterioara</span> =\n<span class="f">CALCULATE</span> ( <span class="m">[Total Incasari]</span>,\n    <span class="f">PREVIOUSMONTH</span> ( <span class="t">Dim_Date[Data]</span> ) )',
      note: 'Luna de dinaintea celei alese, chiar dacă e în anul trecut.',
      pick: (i) => [i - 1]
    },
    r3: {
      def: 'Returnează un tabel care conține o coloană de date care începe de la o dată de început specificată și continuă pentru numărul specificat de intervale.',
      use: 'Aici: pornind de la ultima zi din rând, 3 luni înapoi (luna aleasă și cele două dinaintea ei).',
      name: 'DATESINPERIOD',
      code: '<span class="m">Incasari 3 Luni</span> =\n<span class="f">CALCULATE</span> ( <span class="m">[Total Incasari]</span>,\n    <span class="f">DATESINPERIOD</span> ( <span class="t">Dim_Date[Data]</span>,\n        <span class="f">MAX</span> ( <span class="t">Dim_Date[Data]</span> ), <span class="n">-3</span>, MONTH ) )',
      note: 'Luna aleasă și cele două dinaintea ei.',
      pick: (i) => [i - 2, i - 1, i]
    }
  };

  function initLab(root) {
    const state = { anchor: 21, fn: 'luna' }; /* octombrie 2023 */
    const max = Math.max.apply(null, INC.filter((v) => v !== null));
    root.innerHTML = `
      <div class="s9-lab-fns" data-fns>${Object.keys(FUNCS).map((k) => `<button type="button" data-fn="${k}">${FUNCS[k].name}</button>`).join('')}</div>
      <div class="s9-lab-def"><b data-fname></b><span class="s9-lab-res-lbl">Definiție oficială (Microsoft Learn, tradusă)</span><p data-def></p><p class="s9-lab-use" data-use></p></div>
      <div class="s9-lab-grid">
        <div class="s9-lab-chart">
          <div class="s9-bars" data-bars>${INC.map((v, i) => `
            <button type="button" class="s9-bar" data-i="${i}" title="${lbl(i)}">
              <span class="s9-bar-col"><span class="s9-bar-fill" style="height:${v === null ? 0 : Math.max(3, (v / max) * 100)}%"></span></span>
              <span class="s9-bar-m">${LUNI[i % 12].charAt(0)}</span>
              ${i % 12 === 0 ? `<span class="s9-bar-y">${START_YEAR + i / 12}</span>` : ''}
            </button>`).join('')}</div>
        </div>
        <div class="s9-lab-out">
          <pre class="s06-dax-code s9-lab-code" data-code></pre>
          <div class="s9-lab-res">
            <span class="s9-lab-res-lbl" data-ctx></span>
            <strong data-res></strong>
            <em data-note></em>
          </div>
        </div>
      </div>`;
    const bars = root.querySelectorAll('.s9-bar');

    function render() {
      const f = FUNCS[state.fn];
      const inc = f.pick(state.anchor).filter((i) => i >= 0 && i < INC.length);
      const total = sumOf(inc);
      bars.forEach((b) => {
        const i = Number(b.dataset.i);
        b.classList.toggle('is-in', inc.includes(i));
        b.classList.toggle('is-anchor', i === state.anchor);
        b.classList.toggle('is-empty', INC[i] === null);
      });
      root.querySelectorAll('[data-fn]').forEach((b) => b.classList.toggle('is-on', b.dataset.fn === state.fn));
      root.querySelector('[data-code]').innerHTML = f.code;
      root.querySelector('[data-fname]').textContent = f.name;
      root.querySelector('[data-def]').textContent = f.def;
      root.querySelector('[data-use]').textContent = f.use;
      root.querySelector('[data-ctx]').textContent = 'Rezultat pentru rândul: ' + LUNI_FULL[state.anchor % 12] + ' ' + (START_YEAR + Math.floor(state.anchor / 12));
      root.querySelector('[data-res]').textContent = total === null ? '(gol)' : fmt(total);
      let extra = f.note;
      if (!inc.length) extra = 'Perioada cade înainte de începutul calendarului (1 ian 2022): nu există zile, deci rezultatul este gol.';
      else if (total === null) extra = 'În lunile incluse nu există nicio proiecție, deci măsura este goală.';
      else if (inc.some((i) => INC[i] === null)) extra += ' Lunile fără proiecții (gri deschis) intră în fereastră, dar nu aduc nimic.';
      root.querySelector('[data-note]').textContent = extra;
    }
    root.querySelectorAll('[data-fn]').forEach((b) => b.addEventListener('click', () => { state.fn = b.dataset.fn; render(); b.blur(); }));
    bars.forEach((b) => b.addEventListener('click', () => { state.anchor = Number(b.dataset.i); render(); b.blur(); }));
    render();
  }

  /* ---------- Ce număr apare? ---------- */
  const M = (s) => `<span class="m">${s}</span>`;
  const F = (s) => `<span class="f">${s}</span>`;
  const T = (s) => `<span class="t">${s}</span>`;
  const N = (s) => `<span class="n">${s}</span>`;
  const K = (s) => `<span class="k">${s}</span>`;
  const V = (s) => `<span class="v">${s}</span>`;
  const R = (s) => `<span class="m">[${s}]</span>`;
  const D = T('Dim_Date[Data]');

  const QUIZ = {
    TOTALYTD: [
      { ctx: 'Matrix · An = 2023 · rândul Martie', q: 'Cât am încasat de la 1 ianuarie până la sfârșitul lui martie 2023?', m: 'Incasari YTD', code: `${M('Incasari YTD')} =\n${F('TOTALYTD')} ( ${R('Total Incasari')}, ${D} )`, a: '28.126,05', note: '6.124,81 + 11.702,73 + 10.298,51.' },
      { ctx: 'Card · slicer An = 2024', q: 'Cu un singur card și slicerul pe 2024, ce arată Incasari YTD?', m: 'Incasari YTD', code: `${M('Incasari YTD')} =\n${F('TOTALYTD')} ( ${R('Total Incasari')}, ${D} )`, a: '112.085,17', note: 'Ultima zi din filtru este 31 decembrie, deci YTD = totalul anului.' },
      { ctx: 'Matrix · An = 2023 · rândul Mai', q: 'În mai 2023 nu a fost nicio proiecție. Ce arată Incasari YTD în rândul Mai?', m: 'Incasari YTD', code: `${M('Incasari YTD')} =\n${F('TOTALYTD')} ( ${R('Total Incasari')}, ${D} )`, a: '36.536,68', note: 'Cumulatul până la 30 aprilie: rămâne neschimbat. De aceea luna Mai apare în matrix.' }
    ],
    SAMEPERIODLASTYEAR: [
      { ctx: 'Card · slicer An = 2023', q: 'Cât s-a încasat în anul dinaintea lui 2023?', m: 'Incasari An Anterior', code: `${M('Incasari An Anterior')} =\n${F('CALCULATE')} ( ${R('Total Incasari')},\n    ${F('SAMEPERIODLASTYEAR')} ( ${D} ) )`, a: '138.262,66' },
      { ctx: 'Card · slicer An = 2024', q: 'Cu cât s-au schimbat încasările din 2024 față de 2023, în procente?', m: 'Variatie YoY %', code: `${M('Variatie YoY %')} =\n${K('VAR')} ${V('Acum')} = ${R('Total Incasari')}\n${K('VAR')} ${V('Inainte')} = ${R('Incasari An Anterior')}\n${K('RETURN')} ${F('DIVIDE')} ( ${V('Acum')} - ${V('Inainte')}, ${V('Inainte')} )`, a: '−48,3%', note: '112.085,17 față de 216.640,03. Pentru 2023 față de 2022: +56,7%.' },
      { ctx: 'Card · slicer An = 2022', q: 'Care sunt încasările anului dinaintea lui 2022?', m: 'Incasari An Anterior', code: `${M('Incasari An Anterior')} =\n${F('CALCULATE')} ( ${R('Total Incasari')},\n    ${F('SAMEPERIODLASTYEAR')} ( ${D} ) )`, a: '(gol)', note: 'Calendarul începe pe 1 ianuarie 2022: anul 2021 nu există în el.' }
    ],
    DATEADD: [
      { ctx: 'Matrix · An = 2023 · rândul Octombrie', q: 'Cât s-a încasat în luna dinaintea lui octombrie 2023?', m: 'Incasari Luna Anterioara', code: `${M('Incasari Luna Anterioara')} =\n${F('CALCULATE')} ( ${R('Total Incasari')},\n    ${F('DATEADD')} ( ${D}, ${N('-1')}, MONTH ) )`, a: '5.667,94', note: 'Septembrie 2023.' },
      { ctx: 'Matrix · An = 2024 · rândul Ianuarie', q: 'Ce arată măsura în ianuarie 2024, cu slicerul pe 2024?', m: 'Incasari Luna Anterioara', code: `${M('Incasari Luna Anterioara')} =\n${F('CALCULATE')} ( ${R('Total Incasari')},\n    ${F('PREVIOUSMONTH')} ( ${D} ) )`, a: '30.153,29', note: 'Decembrie 2023: perioada trece peste slicerul de an, pentru că tabela este marcată ca date table.' },
      { ctx: 'Matrix · An = 2023 · rândul Iunie', q: 'Ce arată măsura în iunie 2023?', m: 'Incasari Luna Anterioara', code: `${M('Incasari Luna Anterioara')} =\n${F('CALCULATE')} ( ${R('Total Incasari')},\n    ${F('PREVIOUSMONTH')} ( ${D} ) )`, a: '(gol)', note: 'Luna dinainte este mai 2023, fără nicio proiecție.' }
    ],
    DATESINPERIOD: [
      { ctx: 'Matrix · An = 2023 · rândul Decembrie', q: 'Cât s-a încasat în ultimele 3 luni, la decembrie 2023?', m: 'Incasari 3 Luni', code: `${M('Incasari 3 Luni')} =\n${F('CALCULATE')} ( ${R('Total Incasari')},\n    ${F('DATESINPERIOD')} ( ${D},\n        ${F('MAX')} ( ${D} ), ${N('-3')}, MONTH ) )`, a: '91.280,18', note: 'Octombrie + noiembrie + decembrie = tot trimestrul 4 din 2023.' },
      { ctx: 'Matrix · An = 2023 · rândul Ianuarie', q: 'Ce arată la ianuarie 2023? Fereastra ajunge și în 2022?', m: 'Incasari 3 Luni', code: `${M('Incasari 3 Luni')} =\n${F('CALCULATE')} ( ${R('Total Incasari')},\n    ${F('DATESINPERIOD')} ( ${D},\n        ${F('MAX')} ( ${D} ), ${N('-3')}, MONTH ) )`, a: '20.873,91', note: 'Noiembrie 2022 + decembrie 2022 + ianuarie 2023.' },
      { ctx: 'Matrix · An = 2025 · rândul Octombrie', q: 'Câte încasări în ultimele 3 luni, la octombrie 2025?', m: 'Incasari 3 Luni', code: `${M('Incasari 3 Luni')} =\n${F('CALCULATE')} ( ${R('Total Incasari')},\n    ${F('DATESINPERIOD')} ( ${D},\n        ${F('MAX')} ( ${D} ), ${N('-3')}, MONTH ) )`, a: '59.603,50', note: 'August 33.000,04 + septembrie 3.324,13 + octombrie 23.279,33.' }
    ]
  };

  function initQuiz(root) {
    const groups = Object.keys(QUIZ);
    let cur = groups[0];
    root.innerHTML = `
      <div class="s6-quiz-tabs" data-sub></div>
      <div class="s6-quiz-grid" data-grid></div>`;
    const grid = root.querySelector('[data-grid]');
    const sub = root.querySelector('[data-sub]');

    function render() {
      sub.innerHTML = groups.map((c) => `<button type="button" data-c="${c}" class="${c === cur ? 'is-on' : ''}">${c}</button>`).join('');
      sub.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { cur = b.dataset.c; render(); }));
      const items = QUIZ[cur];
      grid.style.setProperty('--n', items.length);
      grid.innerHTML = items.map((x, i) => `
        <article class="s6-quiz-card" data-step="0">
          <span class="s6-quiz-n">${String(i + 1).padStart(2, '0')}</span>
          <div class="s6-quiz-ctx"><span>Context</span>${x.ctx}</div>
          <p class="s6-quiz-q">${x.q}</p>
          <div class="s6-quiz-ans">
            <div class="s6-quiz-m"><span>Măsura</span><b>[${x.m}]</b></div>
            <pre class="s06-dax-code s6-quiz-code">${x.code}</pre>
            <div class="s6-quiz-a"><span>Rezultat</span><strong>${x.a}</strong>${x.note ? `<em>${x.note}</em>` : ''}</div>
          </div>
          <div class="s6-quiz-btns"><button type="button" class="s3-btn is-primary" data-show>Arată măsura și rezultatul</button></div>
        </article>`).join('');
      grid.querySelectorAll('.s6-quiz-card').forEach((card) => {
        card.querySelector('[data-show]').addEventListener('click', () => { card.dataset.step = '2'; });
      });
    }
    render();
  }

  /* ---------- Vizual pe slide-ul fiecărei funcții: 2022–2023, luna se poate alege sau rula ---------- */
  function initViz(root) {
    const f = FUNCS[root.dataset.s9Viz];
    const N = 24;
    const state = { anchor: Number(root.dataset.anchor), timer: null };
    const max = Math.max.apply(null, INC.slice(0, N).filter((v) => v !== null));
    root.innerHTML = `
      <div class="s9-bars s9-bars-24" data-bars>${INC.slice(0, N).map((v, i) => `
        <button type="button" class="s9-bar" data-i="${i}" title="${lbl(i)}">
          <span class="s9-bar-col"><span class="s9-bar-fill" style="height:${v === null ? 0 : Math.max(3, (v / max) * 100)}%"></span></span>
          <span class="s9-bar-m">${LUNI[i % 12].charAt(0)}</span>
          ${i % 12 === 0 ? `<span class="s9-bar-y">${START_YEAR + i / 12}</span>` : ''}
        </button>`).join('')}</div>
      <div class="s9-viz-legend"><span><i class="is-anchor"></i>luna din rând</span><span><i class="is-in"></i>intră în calcul</span><span><i class="is-out"></i>nu intră</span></div>
      <div class="s9-lab-res">
        <span class="s9-lab-res-lbl" data-ctx></span>
        <strong data-res></strong>
        <em data-note></em>
      </div>
      <button type="button" class="s3-btn is-primary s9-play" data-play>▶ Rulează pe luni</button>`;
    const bars = root.querySelectorAll('.s9-bar');
    function render() {
      const inc = f.pick(state.anchor).filter((i) => i >= 0 && i < N);
      const total = sumOf(inc);
      bars.forEach((b) => {
        const i = Number(b.dataset.i);
        b.classList.toggle('is-in', inc.includes(i));
        b.classList.toggle('is-anchor', i === state.anchor);
        b.classList.toggle('is-empty', INC[i] === null);
      });
      root.querySelector('[data-ctx]').textContent = 'Rândul: ' + LUNI_FULL[state.anchor % 12] + ' ' + (START_YEAR + Math.floor(state.anchor / 12));
      root.querySelector('[data-res]').textContent = total === null ? '(gol)' : fmt(total);
      root.querySelector('[data-note]').textContent = !inc.length ? 'Perioada cade înainte de începutul calendarului: rezultat gol.'
        : total === null ? 'Luna aleasă nu are nicio încasare: rezultat gol.'
        : (inc.length === 1 ? 'Intră în calcul: ' + lbl(inc[0]) + '.' : 'Intră în calcul: ' + lbl(inc[0]) + ' → ' + lbl(inc[inc.length - 1]) + ' (' + inc.length + ' luni).');
    }
    const stop = () => { clearInterval(state.timer); state.timer = null; root.querySelector('[data-play]').textContent = '▶ Rulează pe luni'; };
    bars.forEach((b) => b.addEventListener('click', () => { stop(); state.anchor = Number(b.dataset.i); render(); b.blur(); }));
    root.querySelector('[data-play]').addEventListener('click', () => {
      if (state.timer) { stop(); return; }
      state.anchor = 11; root.querySelector('[data-play]').textContent = '❚❚ Oprește';
      state.timer = setInterval(() => { state.anchor = state.anchor >= N - 1 ? 12 : state.anchor + 1; render(); }, 700);
    });
    render();
  }

  document.querySelectorAll('[data-s9-viz]').forEach(initViz);
  document.querySelectorAll('[data-s9-lab]').forEach(initLab);
  document.querySelectorAll('[data-s9-quiz]').forEach(initQuiz);
})();
