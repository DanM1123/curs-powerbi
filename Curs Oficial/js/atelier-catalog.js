/* ==========================================================================
   Atelier de raport · catalogul de vizuale
   Pentru fiecare vizual Power BI: întrebarea la care răspunde, câmpurile pe
   zone, măsurile și coloanele calculate necesare, filtrele și formatarea.
   Ghidul arată drumul, nu face raportul în locul cursantului.
   ========================================================================== */
(function () {
  'use strict';

  const A = (window.Atelier = window.Atelier || {});
  const D = () => A.Data;

  const FAMILIES = [
    { id: 'kpi', name: 'Indicatori', q: 'Cât? Suntem pe drumul bun?', color: 'var(--atl-c1)' },
    { id: 'comp', name: 'Comparație', q: 'Cine e mai mare?', color: 'var(--atl-c2)' },
    { id: 'part', name: 'Parte din întreg', q: 'Ce pondere are fiecare?', color: 'var(--atl-c3)' },
    { id: 'time', name: 'Evoluție în timp', q: 'Cum se schimbă?', color: 'var(--atl-c4)' },
    { id: 'flow', name: 'Contribuție și pași', q: 'Ce a dus la rezultat?', color: 'var(--atl-c5)' },
    { id: 'rel', name: 'Relații', q: 'Merg două măsuri împreună?', color: 'var(--atl-c6)' },
    { id: 'geo', name: 'Geografie', q: 'Unde se întâmplă?', color: 'var(--atl-c2)' },
    { id: 'detail', name: 'Detaliu', q: 'Care sunt cifrele exacte?', color: 'var(--atl-c1)' },
    { id: 'ai', name: 'Analiză asistată', q: 'De ce? Ce iese în evidență?', color: 'var(--atl-c4)' }
  ];

  const VIS = {
    card: { name: 'Card', fam: 'kpi', what: 'Un singur număr mare, cu eticheta lui. Primul lucru pe care îl vede cititorul.', avoid: 'Când cifra singură nu spune dacă e bine sau rău, pune lângă ea un KPI sau o comparație.' },
    multicard: { name: 'Multi-row card', fam: 'kpi', what: 'Mai multe cifre-cheie, una sub alta, într-un singur vizual.', avoid: 'Peste 4–5 rânduri devine un tabel greu de citit.' },
    kpi: { name: 'KPI', fam: 'kpi', what: 'Valoarea curentă, comparată cu o țintă, plus tendința în fundal.', avoid: 'Fără o țintă clară (an anterior, buget), KPI-ul e doar un card.' },
    gauge: { name: 'Gauge', fam: 'kpi', what: 'Un arc care arată cât din drum ai parcurs până la țintă.', avoid: 'Ocupă mult loc pentru o singură cifră: folosește-l o dată, pentru ținta principală.' },
    barClustered: { name: 'Clustered bar chart', fam: 'comp', what: 'Bare orizontale, una pentru fiecare categorie. Ochiul compară lungimi foarte ușor.', avoid: 'Pentru timp, folosește coloane sau linie: timpul curge de la stânga la dreapta.' },
    colClustered: { name: 'Clustered column chart', fam: 'comp', what: 'Coloane verticale, grupate. Bune pentru puține categorii sau pentru perioade.', avoid: 'Cu nume lungi pe axă, etichetele se înclină: treci pe bar chart.' },
    barStacked: { name: 'Stacked bar chart', fam: 'comp', what: 'Fiecare bară e totalul unei categorii, împărțit în segmente colorate.', avoid: 'Cu peste 5 segmente, cele din mijloc nu se mai pot compara.' },
    colStacked: { name: 'Stacked column chart', fam: 'comp', what: 'Coloane împărțite în segmente: totalul și din ce e format, pe perioade.', avoid: 'Compari ușor doar segmentul de jos; restul plutesc.' },
    pie: { name: 'Pie chart', fam: 'part', what: 'Un cerc împărțit în felii: ponderea fiecărei părți din întreg.', avoid: 'Peste 5 felii sau felii aproape egale: un bar chart sortat e mai clar.' },
    donut: { name: 'Donut chart', fam: 'part', what: 'Ca pie chart-ul, cu un gol în centru unde poți pune totalul.', avoid: 'Aceleași limite ca la pie: puține felii, diferențe vizibile.' },
    treemap: { name: 'Treemap', fam: 'part', what: 'Dreptunghiuri cu aria proporțională cu valoarea, grupate pe categorii.', avoid: 'Nu e bun pentru valori exacte; e bun pentru „ce e mare și ce e mic”.' },
    bar100: { name: '100% stacked bar chart', fam: 'part', what: 'Fiecare bară are aceeași lungime (100%); segmentele arată mixul.', avoid: 'Ascunde mărimea totalului: o categorie mică pare la fel de importantă ca una mare.' },
    col100: { name: '100% stacked column chart', fam: 'part', what: 'Mixul pe perioade: s-a schimbat proporția de la un an la altul?', avoid: 'Ca la 100% bar: nu vezi totalul, doar proporțiile.' },
    line: { name: 'Line chart', fam: 'time', what: 'O linie care leagă valorile în timp. Cel mai bun vizual pentru tendințe.', avoid: 'Nu pune categorii fără ordine pe axa X: linia sugerează o continuitate care nu există.' },
    area: { name: 'Area chart', fam: 'time', what: 'Linie cu suprafața de sub ea colorată: subliniază volumul.', avoid: 'Cu mai multe serii suprapuse, zonele se acoperă una pe alta.' },
    areaStacked: { name: 'Stacked area chart', fam: 'time', what: 'Serii puse una peste alta: evoluția totalului și a părților.', avoid: 'Doar seria de jos are o bază dreaptă; celelalte se citesc greu.' },
    comboClustered: { name: 'Line and clustered column chart', fam: 'time', what: 'Coloane pentru o măsură, linie pentru alta, pe aceeași axă X.', avoid: 'Are două axe Y: cititorul poate crede că liniile se intersectează „la fel”. Etichetează ambele axe.' },
    comboStacked: { name: 'Line and stacked column chart', fam: 'time', what: 'Coloane împărțite pe categorii, plus o linie pentru o a doua măsură.', avoid: 'Încarcă mult informația: păstrează puține segmente.' },
    waterfall: { name: 'Waterfall chart', fam: 'flow', what: 'Pași care urcă și coboară: cum ajungi de la un punct la altul.', avoid: 'Fără o ordine logică a pașilor, cascada nu spune nicio poveste.' },
    funnel: { name: 'Funnel', fam: 'flow', what: 'Bare centrate, de la cea mai mare la cea mai mică.', avoid: 'Are sens deplin când categoriile sunt etape ale unui proces. Altfel, un bar chart sortat e la fel de bun.' },
    scatter: { name: 'Scatter chart', fam: 'rel', what: 'Fiecare punct e un element (produs, client), poziționat după două măsuri.', avoid: 'Fără câmp în Values (Details), vei vedea un singur punct: totalul.' },
    map: { name: 'Map', fam: 'geo', what: 'Bule pe hartă, cu mărimea după valoare.', avoid: 'Harta e utilă doar dacă locul contează pentru decizie.' },
    table: { name: 'Table', fam: 'detail', what: 'Rânduri și coloane, cu cifrele exacte. Pentru cine vrea detaliul.', avoid: 'Nu e primul vizual de pe pagină: tabelul răspunde la „care exact?”, după ce graficul a arătat „unde”.' },
    matrix: { name: 'Matrix', fam: 'detail', what: 'Tabel cu rânduri și coloane pe categorii (ca un pivot din Excel), cu subtotaluri.', avoid: 'Cu prea multe coloane devine un perete de cifre: folosește culoarea ca să ghidezi ochiul.' },
    decomp: { name: 'Decomposition tree', fam: 'ai', what: 'Desface un total pe niveluri: de unde vine cea mai mare parte?', avoid: 'Bun pentru explorare; într-un raport final, explică cititorului cum se folosește.' },
    ribbon: { name: 'Ribbon chart', fam: 'time', what: 'Coloane stivuite în care, la fiecare perioadă, categoria cea mai mare urcă sus. Panglicile arată cine urcă și cine coboară în clasament.', avoid: 'Peste 6–7 categorii, panglicile se încurcă și nu mai urmărești nimic.' },
    area100: { name: '100% stacked area chart', fam: 'part', what: 'Suprafețe stivuite până la 100%: cum s-a schimbat ponderea fiecărei părți în timp.', avoid: 'Ascunde totalul: dacă totalul a scăzut la jumătate, graficul arată la fel.' },
    bubble: { name: 'Scatter chart cu Size (bule)', fam: 'rel', what: 'Scatter chart cu a treia măsură în Size: fiecare bulă are poziția după două măsuri și mărimea după a treia.', avoid: 'Ochiul compară greu ariile: folosește mărimea doar pentru ordinul de mărime, nu pentru valori exacte.' },
    smallMult: { name: 'Line chart · Small multiples', fam: 'time', what: 'Același grafic repetat pentru fiecare categorie, pe aceeași scară. Compari forme (tipare), nu doar valori.', avoid: 'Peste 6–9 mini-grafice devin prea mici; alege categoriile importante.' },
    tableSpark: { name: 'Table cu sparklines', fam: 'detail', what: 'Tabel cu cifrele exacte și, pe fiecare rând, o mini-linie care arată tendința.', avoid: 'Sparkline-ul arată forma, nu valorile: nu îl folosi în locul unui line chart pe pagina principală.' },
    keyInf: { name: 'Key influencers', fam: 'ai', what: 'Vizual AI: caută ce valori (canal, segment, regiune…) apar des împreună cu rezultatul care te interesează.', avoid: 'Arată corelații, nu cauze. Și are nevoie de multe rânduri: pe date puține, rezultatele se schimbă ușor.' },
    narrative: { name: 'Smart narrative', fam: 'ai', what: 'Un text generat din date, care se actualizează când filtrezi: rezumatul paginii în cuvinte.', avoid: 'Descrie, nu explică. Editează textul și adaugă tu „de ce”-ul.' }
  };

  /* ---------- ajutoare ---------- */
  const ucfirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const fld = (m, id) => m.fields.get(id);
  const word = (m, id) => {
    const f = fld(m, id);
    if (!f) return '';
    if (m.names.includes(id)) return D().singular(f.table);
    return f.qlabel.toLowerCase();
  };
  const plural = (m, id) => {
    const f = fld(m, id);
    if (m.names.includes(id)) return D().plural(f.table).toLowerCase();
    return f.qlabel.toLowerCase();
  };
  const badNoun = (m) => {
    if (!m.R.status) return '';
    const b = D().norm(m.R.status.bad[0]);
    if (/anul/.test(b)) return 'anulări';
    if (/retur/.test(b)) return 'retururi';
    return m.R.status.bad[0].toLowerCase();
  };
  const art = (noun) => (/[ie]$/.test(noun) ? noun + 'le' : noun);
  const gen = (noun) => (/i$/.test(noun) ? noun + 'lor' : 'de ' + noun);
  const MASC = /^(clienți|clienti|membri|angajați|pacienți|abonați|studenți|cumpărători|parteneri|furnizori)$/;
  const defPl = (pl) => (MASC.test(pl) ? pl + 'i' : pl + 'le');
  const firstN = (pl) => (MASC.test(pl) ? 'primii' : 'primele');
  function mphrase(m, id) {
    const R = m.R;
    const n = R.noun;
    const vn = R.valueNoun || n; // ce se adună (vânzări, încasări) poate diferi de ce se numără (proiecții)
    const qty = R.qty ? D().norm(R.qty.name) : '';
    const qtyArt = /persoane/.test(qty) ? 'numărul de persoane' : /bilet/.test(qty) ? 'numărul de bilete' : 'cantitatea';
    const qtySup = /persoane/.test(qty) ? 'cele mai multe persoane' : /bilet/.test(qty) ? 'cele mai multe bilete vândute' : 'cea mai mare cantitate';
    const map = {
      total: { sup: `cele mai mari ${vn}`, art: art(vn), by: vn === n ? `valoarea ${gen(n)}` : vn, short: ucfirst(vn), pl: true },
      count: { sup: `cele mai multe ${n} (ca număr)`, art: `numărul de ${n}`, by: `numărul de ${n}`, short: `Număr ${n}` },
      qty: { sup: qtySup, art: qtyArt, by: qtyArt, short: /persoane/.test(qty) ? 'Număr persoane' : /bilet/.test(qty) ? 'Bilete vândute' : 'Cantitate' },
      cust: { sup: `cei mai mulți ${R.customerNoun}`, art: `numărul de ${R.customerNoun}`, by: `numărul de ${R.customerNoun}`, short: `${ucfirst(R.customerNoun)} unici` },
      avg: { sup: `cea mai mare valoare medie pe ${R.unit}`, art: `valoarea medie pe ${R.unit}`, by: `valoarea medie pe ${R.unit}`, short: 'Valoare medie' },
      rate: { sup: `cea mai mare rată de ${badNoun(m)}`, art: `rata de ${badNoun(m)}`, by: `rata de ${badNoun(m)}`, short: `Rată ${badNoun(m)}` },
      valid: { sup: `cele mai mari ${n} fără ${badNoun(m)}`, art: `${art(n)} fără ${badNoun(m)}`, by: `valoarea ${gen(n)} fără ${badNoun(m)}`, short: `${ucfirst(n)} fără ${badNoun(m)}`, pl: true },
      list: { sup: 'cea mai mare valoare la preț de listă', art: 'valoarea la preț de listă', by: 'valoarea la preț de listă', short: 'Valoare la preț listă' }
    };
    return map[id] || { sup: id, art: id, by: id, short: id };
  }
  const has = (m, id) => m.measures.has(id);
  const verb = (m, id, pl, sg) => (mphrase(m, id).pl ? pl : sg);
  const mname = (m, id) => (m.measures.get(id) || {}).name || id;

  const F = (m, id, agg) => { const f = fld(m, id); return f ? { t: 'f', table: f.table, col: f.col, agg, calc: !!f.calc, id } : null; };
  const M = (m, id) => ({ t: 'm', name: mname(m, id), id });
  const well = (zone, ...items) => ({ zone, items: items.flat().filter(Boolean) });

  function opt(m, ids) { return ids.filter(Boolean).filter((id) => fld(m, id)).map((id) => ({ value: id, label: `${fld(m, id).table}[${fld(m, id).col}]` })); }
  function mopt(m, ids) { return ids.filter((id) => has(m, id)).map((id) => ({ value: id, label: `[${mname(m, id)}]` })); }
  const ADD = ['total', 'count', 'qty', 'cust', 'valid'];
  const ALLM = ['total', 'count', 'qty', 'cust', 'valid', 'avg', 'rate'];
  const lowCats = (m, max) => m.cats.filter((id) => (fld(m, id).card || 99) <= (max || 6));
  const axisCats = (m) => m.cats.concat(m.names.filter((n) => !m.cats.includes(n)));

  /* ---------- formatare și filtre comune ---------- */
  const titleStep = (t) => `General → Title → Text: „${t}”. Titlul spune răspunsul pe care îl caută cititorul, nu numele câmpurilor.`;
  const sortStep = (m, mid, axis) => `Sortare: „…” (More options) din colțul vizualului → Sort axis → ${mid ? mname(m, mid) : 'măsura'} → Sort descending${axis ? '' : ''}.`;
  function monthSort(m, axisIds) {
    const t = m.time;
    if (!t || !t.month || !axisIds.includes(t.month)) return null;
    const f = fld(m, t.month);
    const by = f.sortByCol || 'Luna';
    return `Lunile apar alfabetic (August, Aprilie…) până le sortezi: în Table view selectezi ${f.table}[${f.col}] → Column tools → Sort by column → ${by}.`;
  }
  function weekdaySort(m, axisIds) {
    const t = m.time;
    if (!t || !t.weekday || !axisIds.includes(t.weekday)) return null;
    const f = fld(m, t.weekday);
    const helper = m.calcCols.find((c) => c.sortHelper);
    return `Zilele apar alfabetic până le sortezi: ${f.table}[${f.col}] → Column tools → Sort by column → ${helper ? helper.name : 'coloana cu numărul zilei'}.`;
  }
  function statusFilter(m, level) {
    const S = m.R.status;
    if (!S) return null;
    return {
      level: level || 'Pagină', optional: true,
      text: `${S.col.name} nu este ${S.bad.join(' / ')}`,
      how: `Filters on this page → trage ${m.fact.name}[${S.col.name}] → bifează doar ${S.good.join(', ')}.`,
      why: `Decide tu: ${badNoun(m)} intră sau nu în cifrele paginii? Un filtru pe pagină le scoate din toate vizualele deodată.`,
      apply: { field: m.fieldId(m.fact.name, S.col.name), op: 'notin', values: S.bad }
    };
  }
  const topNFilter = (m, axisId, mid, n) => ({
    level: 'Vizual',
    text: `Top ${n} ${plural(m, axisId)} după [${mname(m, mid)}]`,
    how: `Filters on this visual → ${fld(m, axisId).col} → Filter type: Top N → Show items: Top ${n} → By value: trage [${mname(m, mid)}] → Apply filter.`,
    why: `Cu ${fld(m, axisId).card || 'zeci de'} valori, graficul devine o listă lungă. Arată doar ce contează.`,
    apply: { topN: n }
  });
  const lastYearFilter = (m) => {
    const y = m.years[m.years.length - 1];
    return {
      level: 'Vizual', text: `${fld(m, m.time.year).col} = ${y} (ultimul an)`,
      how: `Filters on this visual → ${fld(m, m.time.year).table}[${fld(m, m.time.year).col}] → bifează ${y}. Sau lasă-l pe seama unui slicer de an pe pagină.`,
      why: 'Fără filtru de an, valoarea adună toți anii și se compară cu o țintă greșită.',
      apply: { field: m.time.year, op: 'in', values: [y] }
    };
  };
  const ambiguityTip = (m, ids) => ids.filter(Boolean).map((id) => fld(m, id)).filter((f) => f && f.ambiguous)
    .map((f) => `Atenție: ${f.col} există în mai multe tabele. Aici e ${f.table}[${f.col}]. Ia câmpul din tabelul potrivit întrebării.`);

  /* ---------- generatoarele, pe tipuri ---------- */
  const T = {};

  // ---- Card
  T.card = {
    variants: (m) => ['total', 'count', 'cust', 'avg', 'rate', 'valid'].filter((x) => has(m, x)).map((v) => ({ value: v })),
    slots: (m) => [{ key: 'value', label: 'Fields', options: mopt(m, ALLM.concat('list')) }],
    build(m, e) {
      const p = mphrase(m, e.value);
      const q = {
        total: m.R.valueNoun && m.R.valueNoun !== m.R.noun ? (m.R.valueNoun === 'încasări' ? 'Cât am încasat în total?' : `Cât am realizat în total din ${m.R.valueNoun}?`) : `Care este valoarea totală a ${gen(m.R.noun).replace(/^de /, '')}?`,
        count: `Câte ${m.R.noun} am avut?`,
        cust: `Câți ${m.R.customerNoun} activi avem?`,
        avg: `Cât valorează, în medie, o ${m.R.unit}?`,
        rate: `Ce procent din ${m.R.noun} se pierde prin ${badNoun(m)}?`,
        valid: `Cât rămâne după ${badNoun(m)}?`,
        list: 'Cât am fi încasat la prețul de listă?'
      }[e.value] || `Cât este ${p.art}?`;
      return {
        question: q,
        spec: { chart: 'card', values: [e.value] },
        wells: [well('Fields', M(m, e.value))],
        measures: [e.value],
        format: [
          'Format visual → Visual → Callout value → Display units: Thousands (sau Auto), Value decimal places: 1.',
          `Format visual → Visual → Category label → On, cu textul „${p.short}”. Dacă pui titlu, oprește eticheta: nu spune de două ori același lucru.`,
          'Aliniază cardurile pe un rând, sus, și dă-le aceeași lățime.'
        ],
        tips: e.value === 'rate' ? ['Formatează măsura ca procent: Measure tools → Format → Percentage, 1 zecimală.'] : []
      };
    }
  };

  // ---- Multi-row card
  T.multicard = {
    variants: (m) => [{ value: ['total', 'count', 'cust', 'avg'].filter((x) => has(m, x)) }],
    slots: () => [],
    build(m, e) {
      return {
        question: `Care sunt cifrele-cheie ale activității, dintr-o privire?`,
        spec: { chart: 'multicard', values: e.value },
        wells: [well('Fields', e.value.map((x) => M(m, x)))],
        measures: e.value,
        format: [
          'Format visual → Visual → Card → Bar: On (linia colorată din stânga), culoarea principală a raportului.',
          'Callout values → Display units potrivite fiecărei măsuri (procentele nu au unități).',
          'Alternativă modernă: vizualul Card (new) acceptă mai multe măsuri și le pune pe un rând.'
        ],
        tips: ['Pune măsurile în ordinea în care vrei să fie citite: întâi totalul, apoi ce îl explică.']
      };
    }
  };

  // ---- KPI
  T.kpi = {
    available: (m) => has(m, 'py') && m.years.length >= 2,
    variants: () => [{ value: 'total' }],
    slots: () => [],
    build(m, e) {
      const y = fld(m, m.time.year);
      return {
        question: `Suntem peste sau sub anul trecut la ${m.R.valueNoun || m.R.noun}?`,
        spec: { chart: 'kpi', value: 'total', trend: m.time.year, target: 'py' },
        wells: [well('Value', M(m, 'total')), well('Trend axis', F(m, m.time.year)), well('Target', M(m, 'py'))],
        measures: ['total', 'py'],
        format: [
          'Format visual → Visual → Indicator → Display units: Thousands.',
          'Target label → On, ca să se vadă cu ce compari. Distance to goal → Percent.',
          'Trend axis → On: zona din spate arată evoluția pe ani.',
          'Culorile: Good = verde, Bad = roșu (Direction: High is good).'
        ],
        tips: [
          `KPI-ul arată valoarea ultimului an din axa de trend (${y.col}) comparată cu ținta.`,
          'Fără „Mark as date table”, SAMEPERIODLASTYEAR dă rezultate greșite sau goale.'
        ]
      };
    }
  };

  // ---- Gauge
  T.gauge = {
    available: (m) => has(m, 'target') && m.years.length >= 2,
    variants: () => [{ value: 'total' }],
    slots: () => [],
    build(m) {
      const y = m.years[m.years.length - 1];
      return {
        question: `Cât din obiectivul pe ${y} am atins până acum?`,
        spec: { chart: 'gauge', value: 'total', target: 'target', fixedFilters: [lastYearFilter(m).apply] },
        wells: [well('Value', M(m, 'total')), well('Target value', M(m, 'target'))],
        measures: ['total', 'target'],
        filters: [lastYearFilter(m)],
        format: [
          'Format visual → Visual → Gauge axis → Max: lasă gol (Power BI dublează valoarea) sau pune o măsură, ex. [Obiectiv] * 1.25.',
          'Colors → Fill: culoarea principală; Target color: un gri închis.',
          'Data labels → Display units: Thousands. Target label → On.'
        ],
        tips: ['Obiectivul e o presupunere: cu 10% peste anul anterior. Dacă firma are buget, folosește bugetul.']
      };
    }
  };

  // ---- Clustered bar
  T.barClustered = {
    variants: (m) => {
      const out = m.cats.slice(0, 3).map((c) => ({ axis: c, value: 'total' }));
      if (m.R.productName) out.push({ axis: m.R.productName, value: 'total', top: 10 });
      if (m.R.customerName && has(m, 'cust')) out.push({ axis: m.R.customerName, value: 'total', top: 10 });
      if (m.cats[1] && has(m, 'avg')) out.push({ axis: m.cats[1], value: 'avg' });
      return out;
    },
    slots: (m) => [
      { key: 'axis', label: 'Y-axis', options: opt(m, axisCats(m)) },
      { key: 'value', label: 'X-axis', options: mopt(m, ALLM) }
    ],
    build(m, e) {
      const top = e.top || ((fld(m, e.axis).card || 0) > 12 ? 10 : 0);
      const isName = m.names.includes(e.axis);
      const q = top
        ? `Care sunt ${firstN(plural(m, e.axis))} ${top} ${plural(m, e.axis)} după ${mphrase(m, e.value).by}?`
        : `Care ${word(m, e.axis)} are ${mphrase(m, e.value).sup}?`;
      const filters = [];
      if (top) filters.push(topNFilter(m, e.axis, e.value, top));
      if (e.value === 'total') filters.push(statusFilter(m));
      return {
        question: q,
        spec: { chart: 'bar', orient: 'h', mode: 'clustered', axis: [e.axis], values: [e.value], topN: top, sort: 'desc' },
        wells: [well('Y-axis', F(m, e.axis)), well('X-axis', M(m, e.value)), well('Tooltips', has(m, 'count') && e.value !== 'count' ? M(m, 'count') : null)],
        measures: [e.value].concat(e.value !== 'count' && has(m, 'count') ? ['count'] : []),
        filters,
        format: [
          sortStep(m, e.value),
          'Format visual → Visual → Data labels → On; Display units: Thousands.',
          'Bars → Color: o singură culoare. Culori diferite pe bare sugerează categorii diferite, nu valori diferite.',
          'X-axis → Off (etichetele de date spun deja valoarea) și Gridlines → Off: mai puțin zgomot.',
          titleStep(ucfirst(q.replace(/\?$/, '')))
        ],
        tips: ambiguityTip(m, [e.axis]).concat(isName ? ['Numele lungi încap mai bine pe bare orizontale decât pe coloane.'] : [])
      };
    }
  };

  // ---- Clustered column
  T.colClustered = {
    variants: (m) => {
      const out = [];
      if (m.time && m.time.year && m.years.length >= 2) lowCats(m, 6).slice(0, 2).forEach((c) => out.push({ axis: c, legend: m.time.year, value: 'total' }));
      if (m.time && m.time.weekday) out.push({ axis: m.time.weekday, value: 'count' });
      if (m.time && m.time.workday && has(m, 'avg')) out.push({ axis: m.time.workday, value: 'avg' });
      const ds = m.fields.get(m.fieldId(m.fact.name, 'Interval_Discount'));
      if (ds) out.push({ axis: ds.id, value: has(m, 'qty') ? 'qty' : 'count' });
      return out;
    },
    slots: (m) => [
      { key: 'axis', label: 'X-axis', options: opt(m, lowCats(m, 12).concat(m.time ? [m.time.weekday, m.time.quarter, m.time.month, m.time.workday] : []).concat([m.fieldId(m.fact.name, 'Interval_Discount'), m.fieldId(m.fact.name, 'Marime_Tranzactie')])) },
      { key: 'value', label: 'Y-axis', options: mopt(m, ALLM) },
      { key: 'legend', label: 'Legend', options: [{ value: '', label: '(fără)' }].concat(opt(m, (m.time ? [m.time.year] : []).concat(lowCats(m, 5)))) }
    ],
    build(m, e) {
      const ax = fld(m, e.axis);
      const lg = e.legend ? fld(m, e.legend) : null;
      let q;
      if (lg && m.time && e.legend === m.time.year) q = `Cum ${verb(m, e.value, 's-au', 's-a')} schimbat ${mphrase(m, e.value).art} pe fiecare ${word(m, e.axis)}, de la un an la altul?`;
      else if (m.time && e.axis === m.time.weekday) q = `În ce zi a săptămânii avem ${mphrase(m, e.value).sup}?`;
      else if (m.time && e.axis === m.time.workday) q = `${verb(m, e.value, 'Diferă', 'Diferă')} ${mphrase(m, e.value).art} între weekend și zilele lucrătoare?`;
      else if (lg) q = `Cum se compară ${mphrase(m, e.value).art} pe ${word(m, e.axis)}, împărțite pe ${word(m, e.legend)}?`;
      else q = `Care ${word(m, e.axis)} are ${mphrase(m, e.value).sup}?`;
      const cc = [];
      if (ax.calc) cc.push(e.axis);
      if (m.time && e.axis === m.time.workday && fld(m, e.axis).calc) cc.push(e.axis);
      const fmt = [];
      const ms = monthSort(m, [e.axis]); if (ms) fmt.push(ms);
      const ws = weekdaySort(m, [e.axis]); if (ws) fmt.push(ws);
      if (!ms && !ws && !D().hasNaturalOrder(ax)) fmt.push(sortStep(m, e.value));
      fmt.push('Format visual → Visual → Data labels → On; Display units: Thousands.');
      if (lg) fmt.push('Legend → Position: Top, Left. Culorile legendei: în Columns → Color, câte una pe serie, mereu aceleași pe tot raportul.');
      fmt.push(titleStep(ucfirst(q.replace(/\?$/, ''))));
      const tips = ambiguityTip(m, [e.axis, e.legend]);
      if (lg && m.time && e.legend === m.time.year) tips.push('Anul pe legendă: Power BI îl poate trata ca număr și îl adună. Asigură-te că An e setat „Don’t summarize” (Column tools → Summarization).');
      if (ws) cc.push(...m.calcCols.filter((c) => c.sortHelper).map((c) => c.id));
      return {
        question: q,
        spec: { chart: 'bar', orient: 'v', mode: 'clustered', axis: [e.axis], legend: e.legend || null, values: [e.value], sort: D().hasNaturalOrder(ax) ? 'axis' : 'desc' },
        wells: [well('X-axis', F(m, e.axis)), well('Y-axis', M(m, e.value)), lg ? well('Legend', F(m, e.legend)) : null].filter(Boolean),
        measures: [e.value], calcCols: cc, format: fmt, tips,
        filters: e.value === 'total' ? [statusFilter(m)] : []
      };
    }
  };

  // ---- Stacked bar / column
  const stackedBuild = (orient) => function (m, e) {
    const q = orient === 'h'
      ? `Care ${word(m, e.axis)} are ${mphrase(m, e.value).sup} și din ce ${word(m, e.legend)} vin?`
      : `Cum ${verb(m, e.value, 'se împart', 'se împarte')} ${mphrase(m, e.value).art} din fiecare ${word(m, e.axis)} pe ${word(m, e.legend)}?`;
    const ax = fld(m, e.axis);
    const fmt = [];
    const ms = monthSort(m, [e.axis]); if (ms) fmt.push(ms);
    if (!ms && !D().hasNaturalOrder(ax)) fmt.push(sortStep(m, e.value));
    fmt.push('Data labels → On doar pentru Total labels (Format visual → Visual → Total labels → On); etichetele pe fiecare segment aglomerează.');
    fmt.push('Legend → Position: Top. Ordinea culorilor rămâne aceeași în tot raportul.');
    fmt.push(titleStep(ucfirst(q.replace(/\?$/, ''))));
    return {
      question: q,
      spec: { chart: 'bar', orient, mode: 'stacked', axis: [e.axis], legend: e.legend, values: [e.value], sort: D().hasNaturalOrder(ax) ? 'axis' : 'desc' },
      wells: [well(orient === 'h' ? 'Y-axis' : 'X-axis', F(m, e.axis)), well(orient === 'h' ? 'X-axis' : 'Y-axis', M(m, e.value)), well('Legend', F(m, e.legend))],
      measures: [e.value], format: fmt,
      filters: e.value === 'total' ? [statusFilter(m)] : [],
      tips: ambiguityTip(m, [e.axis, e.legend]).concat(['Cu peste 5 valori în Legend, segmentele din mijloc devin greu de comparat.'])
    };
  };
  T.barStacked = {
    variants: (m) => {
      const out = [];
      const c = m.cats; const low = lowCats(m, 5);
      if (c[0] && low.find((x) => x !== c[0])) out.push({ axis: c[0], legend: low.find((x) => x !== c[0]), value: 'total' });
      if (m.R.productName && low[0]) out.push({ axis: m.R.productName, legend: low.find((x) => fld(m, x).table !== fld(m, m.R.productName).table) || low[0], value: 'total' });
      return out;
    },
    slots: (m) => [
      { key: 'axis', label: 'Y-axis', options: opt(m, axisCats(m)) },
      { key: 'legend', label: 'Legend', options: opt(m, lowCats(m, 6)) },
      { key: 'value', label: 'X-axis', options: mopt(m, ADD) }
    ],
    build: stackedBuild('h')
  };
  T.colStacked = {
    variants: (m) => {
      const out = [];
      const low = lowCats(m, 5);
      if (m.time && m.time.quarter && low[0]) out.push({ axis: m.time.quarter, legend: low[0], value: 'total' });
      if (m.time && m.time.year && low[1] && m.years.length >= 2) out.push({ axis: m.time.year, legend: low[1], value: 'total' });
      return out;
    },
    slots: (m) => [
      { key: 'axis', label: 'X-axis', options: opt(m, (m.time ? [m.time.year, m.time.quarter, m.time.month] : []).concat(lowCats(m, 12))) },
      { key: 'legend', label: 'Legend', options: opt(m, lowCats(m, 6)) },
      { key: 'value', label: 'Y-axis', options: mopt(m, ADD) }
    ],
    build: stackedBuild('v')
  };

  // ---- Pie / Donut
  const pieBuild = (kind) => function (m, e) {
    const f = fld(m, e.legend);
    const q = kind === 'pie'
      ? `Ce pondere are fiecare ${word(m, e.legend)} din ${mphrase(m, e.value).by}?`
      : `Cum ${verb(m, e.value, 'se împart', 'se împarte')} ${mphrase(m, e.value).art} pe ${word(m, e.legend)} și cât face totalul?`;
    const tips = ambiguityTip(m, [e.legend]);
    if ((f.card || 0) > 5) tips.push(`${f.col} are ${f.card} valori: peste 5 felii, pie-ul nu se mai citește. Grupează restul în „Altele” sau alege bar chart.`);
    return {
      question: q,
      spec: { chart: kind, legend: e.legend, values: [e.value] },
      wells: [well('Legend', F(m, e.legend)), well('Values', M(m, e.value))],
      measures: [e.value],
      format: [
        'Format visual → Visual → Detail labels → Label contents: Category, percent of total.',
        'Legend → Off când etichetele spun deja categoria (mai puțin de citit).',
        kind === 'donut' ? 'Slices → Inner radius ~ 60%. Pune peste gol un Card cu totalul (fără fundal), sau folosește titlul.' : 'Slices → Spacing: mic (2–3 px) între felii, ca să se separe vizual.',
        'Rotație (Rotation): cea mai mare felie începe de la „ora 12”.'
      ],
      tips,
      filters: e.value === 'total' ? [statusFilter(m)] : []
    };
  };
  T.pie = {
    variants: (m) => lowCats(m, 5).slice(0, 2).map((c) => ({ legend: c, value: 'total' })),
    slots: (m) => [{ key: 'legend', label: 'Legend', options: opt(m, lowCats(m, 8)) }, { key: 'value', label: 'Values', options: mopt(m, ADD) }],
    build: pieBuild('pie')
  };
  T.donut = {
    variants: (m) => {
      const l = lowCats(m, 5);
      return [l[2] || l[0], m.fieldId(m.fact.name, 'Marime_Tranzactie')].filter((x) => x && fld(m, x)).map((c, i) => ({ legend: c, value: i === 1 ? 'count' : 'total' }));
    },
    slots: (m) => [{ key: 'legend', label: 'Legend', options: opt(m, lowCats(m, 8).concat([m.fieldId(m.fact.name, 'Marime_Tranzactie'), m.fieldId(m.fact.name, 'Interval_Discount')])) }, { key: 'value', label: 'Values', options: mopt(m, ADD) }],
    build(m, e) { const s = pieBuild('donut')(m, e); if (fld(m, e.legend).calc) s.calcCols = [e.legend]; return s; }
  };

  // ---- Treemap
  T.treemap = {
    variants: (m) => {
      const out = [];
      const prodCat = m.cats.find((c) => m.R.product && fld(m, c).table === m.R.product.t.name);
      if (prodCat && m.R.productName) out.push({ group: prodCat, details: m.R.productName, value: 'total' });
      const locCat = m.cats.find((c) => m.R.location && fld(m, c).table === m.R.location.t.name);
      if (locCat && m.R.locationName) out.push({ group: locCat, details: m.R.locationName, value: 'total' });
      return out;
    },
    slots: (m) => [
      { key: 'group', label: 'Category', options: opt(m, m.cats) },
      { key: 'details', label: 'Details', options: opt(m, m.names.concat(m.cats)) },
      { key: 'value', label: 'Values', options: mopt(m, ADD) }
    ],
    build(m, e) {
      const q = `Ce ${plural(m, e.details)} cântăresc cel mai mult în fiecare ${word(m, e.group)}?`;
      return {
        question: q,
        spec: { chart: 'treemap', group: e.group, details: e.details, values: [e.value] },
        wells: [well('Category', F(m, e.group)), well('Details', F(m, e.details)), well('Values', M(m, e.value))],
        measures: [e.value],
        format: [
          'Format visual → Visual → Data labels → On; Category labels → On.',
          'Culoarea vine din Category: păstrează aceleași culori pentru aceleași categorii ca în restul raportului.',
          titleStep(ucfirst(q.replace(/\?$/, '')))
        ],
        tips: ['Dreptunghiurile mici nu au loc pentru etichete: cititorul le vede la hover (tooltip).'].concat(ambiguityTip(m, [e.group])),
        filters: e.value === 'total' ? [statusFilter(m)] : []
      };
    }
  };

  // ---- 100% stacked
  T.bar100 = {
    variants: (m) => {
      const low = lowCats(m, 5);
      const out = [];
      if (m.cats[0] && low.find((x) => x !== m.cats[0])) out.push({ axis: m.cats[0], legend: low.find((x) => x !== m.cats[0] && fld(m, x).table !== fld(m, m.cats[0]).table) || low[1], value: 'total' });
      const seg = m.cats.find((c) => /segment/.test(D().norm(fld(m, c).col)));
      if (seg && m.R.channel) out.push({ axis: seg, legend: m.fieldId(m.fact.name, m.R.channel.name), value: 'count' });
      return out.filter((x) => x.legend);
    },
    slots: (m) => [{ key: 'axis', label: 'Y-axis', options: opt(m, axisCats(m)) }, { key: 'legend', label: 'Legend', options: opt(m, lowCats(m, 6)) }, { key: 'value', label: 'X-axis', options: mopt(m, ADD) }],
    build(m, e) {
      const q = `Ce mix de ${word(m, e.legend)} are fiecare ${word(m, e.axis)}?`;
      return {
        question: q,
        spec: { chart: 'bar', orient: 'h', mode: 'percent', axis: [e.axis], legend: e.legend, values: [e.value], sort: 'desc' },
        wells: [well('Y-axis', F(m, e.axis)), well('X-axis', M(m, e.value)), well('Legend', F(m, e.legend))],
        measures: [e.value],
        format: ['Data labels → On; arată procentul, nu valoarea (în 100% stacked, etichetele sunt automat procente).', 'Sortează după segmentul cel mai important pentru întrebare.', titleStep(ucfirst(q.replace(/\?$/, '')))],
        tips: ['Graficul ascunde mărimea: o categorie cu 3 rânduri arată la fel de lungă ca una cu 300. Pune totalul în tooltip.'].concat(ambiguityTip(m, [e.axis, e.legend]))
      };
    }
  };
  T.col100 = {
    available: (m) => m.time && m.time.year && m.years.length >= 2,
    variants: (m) => lowCats(m, 5).slice(0, 2).map((c) => ({ axis: m.time.year, legend: c, value: 'total' })),
    slots: (m) => [{ key: 'axis', label: 'X-axis', options: opt(m, [m.time.year, m.time.quarter]) }, { key: 'legend', label: 'Legend', options: opt(m, lowCats(m, 6)) }, { key: 'value', label: 'Y-axis', options: mopt(m, ADD) }],
    build(m, e) {
      const q = `S-a schimbat mixul de ${word(m, e.legend)} de la un ${e.axis === m.time.year ? 'an' : 'trimestru'} la altul?`;
      return {
        question: q,
        spec: { chart: 'bar', orient: 'v', mode: 'percent', axis: [e.axis], legend: e.legend, values: [e.value], sort: 'axis' },
        wells: [well('X-axis', F(m, e.axis)), well('Y-axis', M(m, e.value)), well('Legend', F(m, e.legend))],
        measures: [e.value],
        format: ['Data labels → On (procente).', 'Legend → Top. Aceeași culoare pentru aceeași categorie ca în restul paginilor.', titleStep(ucfirst(q.replace(/\?$/, '')))],
        tips: ['Anul pe axa X trebuie tratat ca text/categorie: X-axis → Type: Categorical.'].concat(ambiguityTip(m, [e.legend]))
      };
    }
  };

  // ---- Line / area
  const timeAxis = (m, k) => {
    const t = m.time;
    if (k === 'ym') return [t.year, t.month];
    if (k === 'yq') return [t.year, t.quarter];
    if (k === 'year') return [t.year];
    if (k === 'month') return [t.month];
    return [t.year, t.month];
  };
  const timeOpts = (m) => {
    const o = [{ value: 'ym', label: 'An → Lună (ierarhie)' }];
    if (m.time.quarter) o.push({ value: 'yq', label: 'An → Trimestru (ierarhie)' });
    o.push({ value: 'year', label: 'An' });
    if (m.time.month) o.push({ value: 'month', label: 'Lună (toți anii împreună)' });
    return o;
  };
  const timeFormat = (m, k) => {
    const out = [];
    if (k === 'ym' || k === 'yq') out.push('Pe axa X pui An și apoi lângă el ' + (k === 'ym' ? 'Luna_Nume' : 'Trimestru') + ' (o ierarhie). Apasă săgeata dublă „Expand all down one level” din colțul vizualului ca să vezi toate perioadele la rând.');
    const ms = monthSort(m, timeAxis(m, k)); if (ms) out.push(ms);
    out.push('X-axis → Concatenate labels → Off, ca anul să apară o singură dată sub lunile lui.');
    return out;
  };
  const timeAvailable = (m) => !!(m.time && m.time.year && m.time.month);
  T.line = {
    available: timeAvailable,
    variants: (m) => {
      const out = [{ time: 'ym', value: 'total' }];
      if (m.years.length >= 2) out.push({ time: 'month', value: 'total', legendYear: true });
      if (has(m, 'avg')) out.push({ time: 'yq', value: 'avg' });
      if (has(m, 'rate')) out.push({ time: 'yq', value: 'rate' });
      const lc = lowCats(m, 5)[0];
      if (lc) out.push({ time: 'yq', value: 'total', legendCat: lc });
      return out;
    },
    slots: (m) => [{ key: 'time', label: 'X-axis', options: timeOpts(m) }, { key: 'value', label: 'Y-axis', options: mopt(m, ALLM) }, { key: 'legendCat', label: 'Legend', options: [{ value: '', label: '(fără)' }].concat(opt(m, lowCats(m, 6))) }],
    build(m, e) {
      const axis = timeAxis(m, e.time);
      const legendCat = !e.legendYear && e.legendCat && fld(m, e.legendCat) ? e.legendCat : null;
      const legend = e.legendYear ? m.time.year : legendCat;
      const per = e.time === 'yq' ? 'de la un trimestru la altul' : e.time === 'year' ? 'de la un an la altul' : 'lună de lună';
      const q = e.legendYear
        ? `Arată fiecare an la fel, lună de lună? Unde apar vârfurile?`
        : legendCat
          ? `Cum evoluează ${mphrase(m, e.value).art} pe fiecare ${word(m, legendCat)}, ${per}?`
          : `Cum evoluează ${mphrase(m, e.value).art} ${per}?`;
      const fmt = e.legendYear ? [monthSort(m, axis), 'Legend → Top; o culoare pe an. Anul curent cu culoarea principală, anii trecuți în nuanțe mai stinse.'].filter(Boolean) : timeFormat(m, e.time);
      if (legendCat) fmt.push('Legend → Top. Peste 5 linii devine „spaghetti”: păstrează categoriile importante sau treci pe Small multiples.');
      fmt.push('Lines → Stroke width: 2–3 px. Markers → On doar dacă ai puține puncte.');
      fmt.push('Data labels → Off (prea multe puncte); valorile exacte stau în tooltip.');
      fmt.push(titleStep(ucfirst(q.replace(/\?$/, ''))));
      const xa = e.legendYear ? [m.time.month] : axis;
      return {
        question: q,
        spec: { chart: 'line', axis: xa, legend, values: [e.value] },
        wells: [well('X-axis', xa.map((x) => F(m, x))), well('Y-axis', M(m, e.value)), legend ? well('Legend', F(m, legend)) : null].filter(Boolean),
        measures: [e.value], format: fmt,
        filters: e.value === 'total' ? [statusFilter(m)] : [],
        tips: e.legendYear ? ['Ultimul an poate fi incomplet: o linie care „cade” la final poate însemna doar că luna nu s-a terminat.'] : legendCat ? ambiguityTip(m, [legendCat]).concat(['Câmpul din Legend împarte linia în câte una pe categorie, pe aceeași axă.']) : ['Linia are sens doar pe o axă ordonată (timp). Pentru categorii fără ordine folosește bare.']
      };
    }
  };
  T.area = {
    available: timeAvailable,
    variants: () => [{ time: 'ym', value: 'total' }],
    slots: (m) => [{ key: 'time', label: 'X-axis', options: timeOpts(m) }, { key: 'value', label: 'Y-axis', options: mopt(m, ADD) }],
    build(m, e) {
      const axis = timeAxis(m, e.time);
      const q = `Cât de mare a fost volumul de ${m.R.noun} în fiecare perioadă și unde a crescut?`;
      return {
        question: q,
        spec: { chart: 'area', axis, values: [e.value], mode: 'single' },
        wells: [well('X-axis', axis.map((x) => F(m, x))), well('Y-axis', M(m, e.value))],
        measures: [e.value],
        format: timeFormat(m, e.time).concat(['Shade area → Transparency ~ 70%: zona colorată nu trebuie să fie mai puternică decât linia.', titleStep(ucfirst(q.replace(/\?$/, '')))]),
        filters: e.value === 'total' ? [statusFilter(m)] : [],
        tips: ['Area chart pornește mereu de la zero: e corect pentru volume, nu pentru procente care variază puțin.']
      };
    }
  };
  T.areaStacked = {
    available: timeAvailable,
    variants: (m) => lowCats(m, 5).slice(0, 1).map((c) => ({ time: 'yq', legend: c, value: 'total' })),
    slots: (m) => [{ key: 'time', label: 'X-axis', options: timeOpts(m) }, { key: 'legend', label: 'Legend', options: opt(m, lowCats(m, 6)) }, { key: 'value', label: 'Y-axis', options: mopt(m, ADD) }],
    build(m, e) {
      const axis = timeAxis(m, e.time);
      const q = `Cum contribuie fiecare ${word(m, e.legend)} la evoluția totalului?`;
      return {
        question: q,
        spec: { chart: 'area', axis, legend: e.legend, values: [e.value], mode: 'stacked' },
        wells: [well('X-axis', axis.map((x) => F(m, x))), well('Y-axis', M(m, e.value)), well('Legend', F(m, e.legend))],
        measures: [e.value],
        format: timeFormat(m, e.time).concat(['Legend → Top. Pune seria cea mai importantă jos (prima în legendă): doar ea are baza dreaptă.', titleStep(ucfirst(q.replace(/\?$/, '')))]),
        tips: ambiguityTip(m, [e.legend])
      };
    }
  };

  // ---- Combo
  T.comboClustered = {
    available: (m) => timeAvailable(m) && has(m, 'count'),
    variants: (m) => [{ time: 'yq', value: 'total', line: 'count' }].concat(has(m, 'avg') ? [{ time: 'ym', value: 'total', line: 'avg' }] : []),
    slots: (m) => [{ key: 'time', label: 'X-axis', options: timeOpts(m) }, { key: 'value', label: 'Column y-axis', options: mopt(m, ADD) }, { key: 'line', label: 'Line y-axis', options: mopt(m, ALLM) }],
    build(m, e) {
      const axis = timeAxis(m, e.time);
      const q = e.line === 'count'
        ? `Când cresc ${art(m.R.valueNoun || m.R.noun)}, crește și numărul de ${m.R.noun}?`
        : `Cresc ${art(m.R.valueNoun || m.R.noun)} pentru că vindem mai mult sau pentru că valoarea medie e mai mare?`;
      return {
        question: q,
        spec: { chart: 'combo', axis, values: [e.value], line: e.line, mode: 'clustered' },
        wells: [well('X-axis', axis.map((x) => F(m, x))), well('Column y-axis', M(m, e.value)), well('Line y-axis', M(m, e.line))],
        measures: [e.value, e.line],
        format: timeFormat(m, e.time).concat([
          'Secondary y-axis → On, cu titlu. Y-axis → Title → On. Cititorul trebuie să știe ce axă aparține cărei măsuri.',
          'Linia într-o culoare contrastantă (ex. portocaliu), coloanele în culoarea principală.',
          titleStep(ucfirst(q.replace(/\?$/, '')))
        ]),
        filters: [statusFilter(m)],
        tips: ['Două axe Y pot păcăli: punctul în care linia „taie” coloanele nu înseamnă nimic. Spune asta în titlu sau subtitlu dacă e cazul.']
      };
    }
  };
  T.comboStacked = {
    available: (m) => timeAvailable(m) && has(m, 'avg') && lowCats(m, 5).length,
    variants: (m) => [{ time: 'yq', value: 'total', legend: lowCats(m, 5)[0], line: 'avg' }],
    slots: (m) => [{ key: 'time', label: 'X-axis', options: timeOpts(m) }, { key: 'legend', label: 'Column legend', options: opt(m, lowCats(m, 6)) }, { key: 'value', label: 'Column y-axis', options: mopt(m, ADD) }, { key: 'line', label: 'Line y-axis', options: mopt(m, ALLM) }],
    build(m, e) {
      const axis = timeAxis(m, e.time);
      const q = `Din ce ${word(m, e.legend)} vin ${art(m.R.valueNoun || m.R.noun)} în fiecare perioadă și cum se mișcă ${mphrase(m, e.line).art}?`;
      return {
        question: q,
        spec: { chart: 'combo', axis, legend: e.legend, values: [e.value], line: e.line, mode: 'stacked' },
        wells: [well('X-axis', axis.map((x) => F(m, x))), well('Column y-axis', M(m, e.value)), well('Column legend', F(m, e.legend)), well('Line y-axis', M(m, e.line))],
        measures: [e.value, e.line],
        format: timeFormat(m, e.time).concat(['Secondary y-axis → On, cu titlu.', 'Linia: grosime 3 px, markere On, culoare care nu apare în legenda coloanelor.', titleStep(ucfirst(q.replace(/\?$/, '')))]),
        tips: ['Vizual dens: păstrează-l pentru o pagină de analiză, nu pentru prima pagină.'].concat(ambiguityTip(m, [e.legend]))
      };
    }
  };

  // ---- Waterfall
  T.waterfall = {
    available: (m) => !!(m.time && m.time.month),
    variants: (m) => {
      const out = [{ kind: 'month', value: 'total' }];
      if (m.years.length >= 2 && m.cats[0]) out.push({ kind: 'yoy', breakdown: m.cats[0], value: 'total' });
      if (has(m, 'list') && m.R.status) out.push({ kind: 'bridge', value: 'total' });
      return out;
    },
    slots: (m) => [],
    build(m, e) {
      const F_ = m.fact.name;
      if (e.kind === 'month') {
        const y = m.years[m.years.length - 1];
        const q = `Cum s-a construit totalul anului ${y}, lună cu lună?`;
        return {
          question: q,
          spec: { chart: 'waterfall', category: m.time.month, values: [e.value], fixedFilters: [lastYearFilter(m).apply] },
          wells: [well('Category', F(m, m.time.month)), well('Y-axis', M(m, e.value))],
          measures: [e.value], filters: [lastYearFilter(m)],
          format: [monthSort(m, [m.time.month]), 'Format visual → Visual → Columns → Increase / Decrease / Total: trei culori clare (verde / roșu / gri).', 'Data labels → On; Display units: Thousands.', titleStep(ucfirst(q.replace(/\?$/, '')))].filter(Boolean),
          tips: ['Fiecare coloană e contribuția lunii; ultima coloană („Total”) apare automat.']
        };
      }
      if (e.kind === 'yoy') {
        const ys = m.years.slice(-2);
        const q = `Ce ${word(m, e.breakdown)} a dus la creșterea sau scăderea din ${ys[1]} față de ${ys[0]}?`;
        return {
          question: q,
          spec: { chart: 'waterfall', category: m.time.year, breakdown: e.breakdown, values: [e.value], fixedFilters: [{ field: m.time.year, op: 'in', values: ys }] },
          wells: [well('Category', F(m, m.time.year)), well('Breakdown', F(m, e.breakdown)), well('Y-axis', M(m, e.value))],
          measures: [e.value],
          filters: [{ level: 'Vizual', text: `${fld(m, m.time.year).col} este ${ys.join(' sau ')}`, how: `Filters on this visual → ${fld(m, m.time.year).col} → bifează ${ys.join(' și ')}.`, why: 'Breakdown compară doi pași consecutivi pe axa Category. Cu doi ani, povestea e clară.', apply: { field: m.time.year, op: 'in', values: ys } }],
          format: ['Format visual → Visual → Breakdown → Max breakdowns: 5 (restul intră la „Other”).', 'Culori: Increase verde, Decrease roșu, Total gri.', titleStep(ucfirst(q.replace(/\?$/, '')))],
          tips: ambiguityTip(m, [e.breakdown]).concat(['Waterfall cu Breakdown e unul dintre puținele vizuale care explică „de ce” s-a schimbat un total. Merită pe pagina de analiză.'])
        };
      }
      // punte: de la preț de listă la total fără anulări
      const S = m.R.status;
      const steps = [{ label: 'Pret lista', kind: 'list' }, { label: 'Discount', kind: 'disc' }];
      if (m.R.net) steps.push({ label: /bilete/.test(D().norm(m.R.net.name)) ? 'Bar' : 'Taxe', kind: 'taxes' });
      steps.push({ label: S.bad[0], kind: 'bad' });
      const rowsDT = steps.map((st, i) => `{ "${st.label}", ${i + 1} }`).join(', ');
      const sw = steps.map((st) => {
        if (st.kind === 'list') return `    "${st.label}", [Valoare la pret lista]`;
        if (st.kind === 'disc') return `    "${st.label}", - [Valoare discount]`;
        if (st.kind === 'taxes') return `    "${st.label}", [${mname(m, 'total')}] - SUM ( ${F_}[${m.R.net.name}] )`;
        return `    "${st.label}", - CALCULATE ( [${mname(m, 'total')}], ${F_}[${S.col.name}] = "${S.bad[0]}" )`;
      }).join(',\n');
      return {
        question: `Cum ajungem de la valoarea la preț de listă la ce rămâne după ${badNoun(m)}?`,
        spec: { chart: 'waterfall', bridge: steps, values: ['total'] },
        wells: [well('Category', { t: 'f', table: 'Pasi_Punte', col: 'Pas', calc: true }), well('Y-axis', { t: 'm', name: 'Valoare pas', id: 'step' })],
        measures: ['list', 'disc', 'total', 'valid'],
        customMeasures: [{
          name: 'Pasi_Punte + Valoare pas', level: 3,
          plain: 'Un tabel mic cu pașii punții și o singură măsură care întoarce valoarea potrivită pentru fiecare pas.',
          hint: 'Tabelul îl creezi din Modeling → New table. Măsura întreabă „pe ce pas sunt?” cu SELECTEDVALUE și răspunde cu SWITCH.',
          dax: `Pasi_Punte =\nDATATABLE ( "Pas", STRING, "Ordine", INTEGER, { ${rowsDT} } )\n\nValoare pas =\nSWITCH (\n    SELECTEDVALUE ( Pasi_Punte[Pas] ),\n${sw}\n)`
        }],
        format: ['Sortează Pasi_Punte[Pas] după Ordine (Column tools → Sort by column → Ordine).', 'Format visual → Visual → Columns: Increase verde, Decrease roșu, Total în culoarea principală.', `Coloana „Total” de la final trebuie să fie egală cu [${mname(m, 'valid')}]: așa verifici că puntea se închide.`],
        tips: ['Nivel avansat: tabelul cu pași nu are relații cu restul modelului; măsura face toată treaba.'].concat(m.R.net ? [`Pasul „${steps.find((x) => x.kind === 'taxes').label}” e diferența dintre ${m.R.value.name} și ${m.R.net.name}. Calculat ca diferență, puntea se închide exact.`] : [])
      };
    }
  };

  // ---- Funnel
  T.funnel = {
    variants: (m) => (m.R.channel ? [{ axis: m.fieldId(m.fact.name, m.R.channel.name), value: 'count' }] : m.cats.slice(0, 1).map((c) => ({ axis: c, value: 'count' }))),
    slots: (m) => [{ key: 'axis', label: 'Category', options: opt(m, m.cats) }, { key: 'value', label: 'Values', options: mopt(m, ADD) }],
    build(m, e) {
      const q = `Prin ce ${word(m, e.axis)} vin cele mai multe ${m.R.noun} și cât de mare e diferența dintre ele?`;
      return {
        question: q,
        spec: { chart: 'funnel', axis: [e.axis], values: [e.value] },
        wells: [well('Category', F(m, e.axis)), well('Values', M(m, e.value))],
        measures: [e.value],
        format: ['Data labels → Label contents: Data value, percent of first.', 'Colors → o singură culoare: etapele nu sunt categorii diferite, sunt pași.', titleStep(ucfirst(q.replace(/\?$/, '')))],
        tips: ['Funnel-ul spune o poveste când categoriile sunt etape (vizită → coș → comandă). Aici e un clasament: gândește-te dacă un bar chart n-ar fi la fel de clar.']
      };
    }
  };

  // ---- Scatter
  T.scatter = {
    variants: (m) => {
      const out = [];
      if (m.R.productName && has(m, 'count')) out.push({ details: m.R.productName, x: has(m, 'qty') ? 'qty' : 'count', y: 'total', legend: m.cats.find((c) => m.R.product && fld(m, c).table === m.R.product.t.name) || '' });
      if (m.R.customerName && has(m, 'count')) out.push({ details: m.R.customerName, x: 'count', y: 'avg', legend: m.cats.find((c) => m.R.customer && fld(m, c).table === m.R.customer.t.name && /segment/.test(D().norm(fld(m, c).col))) || '' });
      if (m.R.locationName && m.R.locationNum) out.push({ details: m.R.locationName, x: 'f:' + m.fieldId(m.R.location.t.name, m.R.locationNum.name), y: 'total', legend: '' });
      return out;
    },
    slots: (m) => [
      { key: 'details', label: 'Values (Details)', options: opt(m, m.names) },
      { key: 'x', label: 'X-axis', options: mopt(m, ALLM).concat(m.R.locationNum && m.R.locationName ? [{ value: 'f:' + m.fieldId(m.R.location.t.name, m.R.locationNum.name), label: `${m.R.location.t.name}[${m.R.locationNum.name}] (Average)` }] : []) },
      { key: 'y', label: 'Y-axis', options: mopt(m, ALLM) }
    ],
    build(m, e) {
      e = Object.assign({}, e, { xField: e.x && e.x.indexOf('f:') === 0 ? e.x.slice(2) : null });
      if (e.xField && e.details !== m.R.locationName) e.xField = null;
      if (!e.xField && (!e.x || e.x.indexOf('f:') === 0)) e.x = 'count';
      const wxs = e.xField ? F(m, e.xField, 'Average') : M(m, e.x);
      const q = e.xField
        ? `${ucfirst(D().plural(fld(m, e.details).table).toLowerCase())} mai mari (${D().human(fld(m, e.xField).col)}) aduc mai multe ${m.R.valueNoun || m.R.noun}?`
        : e.x === 'count' && e.y === 'avg'
          ? `Care ${D().plural(fld(m, e.details).table).toLowerCase()} apar des, dar aduc puțin? Și care rar, dar mult?`
          : `Ce ${plural(m, e.details)} se vând des, dar aduc puțin, și care invers?`;
      return {
        question: q,
        spec: { chart: 'scatter', details: e.details, x: e.x, xField: e.xField, y: e.y, legend: e.legend || null },
        wells: [well('Values', F(m, e.details)), well('X-axis', wxs), well('Y-axis', M(m, e.y)), e.legend ? well('Legend', F(m, e.legend)) : null].filter(Boolean),
        measures: [e.xField ? null : e.x, e.y].filter((x) => x && has(m, x)),
        format: [
          'Format visual → Visual → Markers → Size: 8–10. Category label → On doar dacă ai sub ~15 puncte.',
          'Adaugă linii de referință: în panoul Analytics (lupa) → Average line pe X și pe Y. Cele patru cadrane spun povestea.',
          titleStep(ucfirst(q.replace(/\?$/, '')))
        ],
        tips: [e.xField ? `${fld(m, e.xField).col} vine din dimensiune: în X-axis setează agregarea „Average” sau „Don't summarize”, altfel se adună pe toate rândurile.` : 'Fără câmp în Values, Power BI desenează un singur punct (totalul).'].concat(ambiguityTip(m, [e.legend]))
      };
    }
  };

  // ---- Map
  T.map = {
    available: (m) => !!m.R.geo,
    variants: () => [{ value: 'total' }, { value: 'count' }],
    slots: (m) => [{ key: 'value', label: 'Bubble size', options: mopt(m, ADD) }],
    build(m, e) {
      const L = m.R.location.t.name;
      const q = `Unde sunt ${defPl(D().plural(L).toLowerCase())} cu ${mphrase(m, e.value).sup}?`;
      return {
        question: q,
        spec: { chart: 'map', name: m.R.locationName, lat: m.R.geo.lat, lon: m.R.geo.lon, values: [e.value] },
        wells: [well('Latitude', F(m, m.R.geo.lat)), well('Longitude', F(m, m.R.geo.lon)), well('Bubble size', M(m, e.value)), well('Tooltips', F(m, m.R.locationName))],
        measures: [e.value],
        format: [
          `În Table view, setează ${fld(m, m.R.geo.lat).col} → Column tools → Data category: Latitude, și ${fld(m, m.R.geo.lon).col} → Longitude. Summarization: Don't summarize.`,
          'Format visual → Visual → Bubbles → Size: ajustează până când bulele nu se acoperă.',
          'Map settings → Style: Grayscale sau Light: harta nu trebuie să concureze cu datele.'
        ],
        tips: ['Dacă vizualul Map nu apare sau e gri: File → Options → Security → Map and Filled Map visuals → bifat.', 'Previzualizarea de aici e fără fundal real de hartă; poziția bulelor e după coordonate.']
      };
    }
  };

  // ---- Table
  T.table = {
    variants: (m) => {
      const out = [];
      if (m.R.productName) out.push({ rows: m.R.productName, values: ['total', 'qty', 'count', 'cust'].filter((x) => has(m, x)) });
      if (m.R.customerName) out.push({ rows: m.R.customerName, values: ['total', 'count', 'avg'].filter((x) => has(m, x)) });
      return out;
    },
    slots: (m) => [{ key: 'rows', label: 'Columns (primul câmp)', options: opt(m, m.names.concat(m.cats)) }],
    build(m, e) {
      const q = `Cum stă fiecare ${word(m, e.rows)} la ${e.values.map((v) => mphrase(m, v).short.toLowerCase()).join(', ').replace(/, ([^,]+)$/, ' și $1')}?`;
      return {
        question: q,
        spec: { chart: 'table', rows: e.rows, values: e.values, sort: 'desc' },
        wells: [well('Columns', [F(m, e.rows)].concat(e.values.map((v) => M(m, v))))],
        measures: e.values,
        format: [
          `Conditional formatting: click dreapta pe [${mname(m, e.values[0])}] în Columns → Conditional formatting → Data bars. Bara arată mărimea fără să citești cifrele.`,
          'Format visual → Visual → Style presets: Minimal; Values → Alternate background: foarte discret.',
          'Totals → On. Column headers → Text wrap → On.',
          `Sortează descrescător după [${mname(m, e.values[0])}] (click pe antetul coloanei).`
        ],
        tips: ['Tabelul lung pe prima pagină obosește: pune-l pe o pagină de detaliu sau ca drillthrough.']
      };
    }
  };

  // ---- Matrix
  T.matrix = {
    available: (m) => m.time && m.time.year,
    variants: (m) => m.cats.slice(0, 2).map((c) => ({ rows: c, value: 'total' })),
    slots: (m) => [{ key: 'rows', label: 'Rows', options: opt(m, m.cats.concat(m.names)) }, { key: 'value', label: 'Values', options: mopt(m, ALLM) }],
    build(m, e) {
      const q = `Care ${word(m, e.rows)} crește și care scade de la un an la altul?`;
      return {
        question: q,
        spec: { chart: 'matrix', rows: e.rows, cols: m.time.year, values: [e.value], heat: true },
        wells: [well('Rows', F(m, e.rows)), well('Columns', F(m, m.time.year)), well('Values', M(m, e.value))],
        measures: [e.value],
        format: [
          `Conditional formatting → Background color → Format style: Gradient, de la alb la culoarea principală. Celulele mari ies singure în evidență.`,
          'Format visual → Visual → Row subtotals / Column subtotals → On.',
          'Layout → Stepped (implicit) dacă adaugi mai multe câmpuri în Rows; săgețile +/− desfac nivelurile.',
          'Values → Display units: Thousands, 1 zecimală.'
        ],
        tips: ['Pune în Rows și un al doilea câmp (ex. subcategoria) și vei avea drill-down direct în matrice.'].concat(ambiguityTip(m, [e.rows]))
      };
    }
  };

  // ---- Decomposition tree
  T.decomp = {
    variants: (m) => [{ value: 'total', by: m.cats.slice(0, 3) }],
    slots: (m) => [{ key: 'value', label: 'Analyze', options: mopt(m, ADD) }],
    build(m, e) {
      const q = `Din ce e format totalul de ${m.R.valueNoun || m.R.noun} și unde e cea mai mare parte?`;
      return {
        question: q,
        spec: { chart: 'decomp', values: [e.value], by: e.by },
        wells: [well('Analyze', M(m, e.value)), well('Explain by', e.by.map((x) => F(m, x)))],
        measures: [e.value],
        format: ['Format visual → Visual → Tree → Density: Sparse, ca nodurile să respire.', 'Data bars → culoarea principală.', 'Analysis → Enable AI splits → Off într-un raport pentru alții (rezultatul se schimbă când se schimbă datele).'],
        tips: ['Cititorul alege singur pe ce câmp să desfacă (+ de lângă nod). Explică-i asta într-un text scurt pe pagină.'].concat(ambiguityTip(m, e.by))
      };
    }
  };

  // ---- Ribbon
  const rankCat = (m, max) => m.cats.find((c) => { const n = fld(m, c).card || 0; return n >= 3 && n <= max; }) || lowCats(m, max)[0];
  T.ribbon = {
    available: (m) => timeAvailable(m) && !!rankCat(m, 7),
    variants: (m) => [{ time: 'yq', legend: rankCat(m, 7), value: 'total' }],
    slots: (m) => [{ key: 'time', label: 'X-axis', options: timeOpts(m) }, { key: 'legend', label: 'Legend', options: opt(m, lowCats(m, 8)) }, { key: 'value', label: 'Y-axis', options: mopt(m, ADD) }],
    build(m, e) {
      const axis = timeAxis(m, e.time);
      const q = `Care ${word(m, e.legend)} urcă și care coboară în clasament de la o perioadă la alta?`;
      return {
        question: q,
        spec: { chart: 'ribbon', axis, legend: e.legend, values: [e.value] },
        wells: [well('X-axis', axis.map((x) => F(m, x))), well('Y-axis', M(m, e.value)), well('Legend', F(m, e.legend))],
        measures: [e.value],
        format: timeFormat(m, e.time).concat([
          'Format visual → Visual → Ribbons → Transparency ~ 50%: panglicile nu trebuie să fie mai puternice decât coloanele.',
          'Data labels → Off (sau doar pentru valorile mari); clasamentul se citește din poziție.',
          'Legend → Top. Aceleași culori pentru aceleași categorii ca în restul raportului.',
          titleStep(ucfirst(q.replace(/\?$/, '')))
        ]),
        filters: e.value === 'total' ? [statusFilter(m)] : [],
        tips: ['Poziția arată locul în clasament (sus = primul), lățimea arată valoarea. Când o panglică trece peste alta, s-a schimbat ordinea.'].concat(ambiguityTip(m, [e.legend]))
      };
    }
  };

  // ---- 100% stacked area
  T.area100 = {
    available: (m) => timeAvailable(m) && lowCats(m, 5).length > 0,
    variants: (m) => [{ time: 'yq', legend: lowCats(m, 5)[0], value: 'total' }],
    slots: (m) => [{ key: 'time', label: 'X-axis', options: timeOpts(m) }, { key: 'legend', label: 'Legend', options: opt(m, lowCats(m, 6)) }, { key: 'value', label: 'Y-axis', options: mopt(m, ADD) }],
    build(m, e) {
      const axis = timeAxis(m, e.time);
      const q = `Cum s-a schimbat, în timp, mixul de ${word(m, e.legend)}?`;
      return {
        question: q,
        spec: { chart: 'area', axis, legend: e.legend, values: [e.value], mode: 'percent' },
        wells: [well('X-axis', axis.map((x) => F(m, x))), well('Y-axis', M(m, e.value)), well('Legend', F(m, e.legend))],
        measures: [e.value],
        format: timeFormat(m, e.time).concat(['Data labels → Off: axa Y arată deja 0–100%.', 'Legend → Top. Pune categoria urmărită jos: doar ea are baza dreaptă.', titleStep(ucfirst(q.replace(/\?$/, '')))]),
        filters: e.value === 'total' ? [statusFilter(m)] : [],
        tips: ['Totalul dispare: pune lângă el un line chart sau un card cu totalul, ca cititorul să știe dacă „mai mult procent” înseamnă și „mai mult”.'].concat(ambiguityTip(m, [e.legend]))
      };
    }
  };

  // ---- Bubble (Scatter + Size)
  T.bubble = {
    available: (m) => has(m, 'count') && m.names.length > 0,
    variants: (m) => {
      const out = [];
      const size = has(m, 'cust') ? 'cust' : has(m, 'avg') ? 'avg' : null;
      if (!size) return out;
      if (m.R.productName) out.push({ details: m.R.productName, x: has(m, 'qty') ? 'qty' : 'count', y: 'total', size });
      if (m.R.locationName) out.push({ details: m.R.locationName, x: 'count', y: 'total', size });
      return out;
    },
    slots: (m) => [
      { key: 'details', label: 'Values (Details)', options: opt(m, m.names) },
      { key: 'x', label: 'X-axis', options: mopt(m, ALLM) },
      { key: 'y', label: 'Y-axis', options: mopt(m, ALLM) },
      { key: 'size', label: 'Size', options: mopt(m, ALLM) }
    ],
    build(m, e) {
      const q = `Care ${plural(m, e.details)} ies în evidență după ${mphrase(m, e.x).by}, ${mphrase(m, e.y).by} și ${mphrase(m, e.size).by}?`;
      return {
        question: q,
        spec: { chart: 'scatter', details: e.details, x: e.x, y: e.y, size: e.size },
        wells: [well('Values', F(m, e.details)), well('X-axis', M(m, e.x)), well('Y-axis', M(m, e.y)), well('Size', M(m, e.size))],
        measures: [e.x, e.y, e.size].filter((x, i, a) => a.indexOf(x) === i),
        format: [
          'Visualizations → Scatter chart, apoi trage măsura în zona Size: punctele devin bule.',
          'Format visual → Visual → Markers → Size: micșorează dacă bulele se acoperă (bulele mari ascund pe cele mici).',
          'Analytics (lupa) → Average line pe X și pe Y: cele patru cadrane spun povestea.',
          titleStep(ucfirst(q.replace(/\?$/, '')))
        ],
        tips: ['Fără câmp în Values, vezi o singură bulă (totalul).', 'Bula mare atrage ochiul: pune în Size măsura pe care vrei s-o observe cititorul.']
      };
    }
  };

  // ---- Small multiples
  const splitCat = (m) => m.cats.find((c) => { const n = fld(m, c).card || 0; return n >= 3 && n <= 9; }) || lowCats(m, 9)[0];
  T.smallMult = {
    available: (m) => timeAvailable(m) && !!splitCat(m),
    variants: (m) => [{ time: m.years.length >= 2 ? 'yq' : 'ym', split: splitCat(m), value: 'total' }],
    slots: (m) => [{ key: 'time', label: 'X-axis', options: timeOpts(m) }, { key: 'split', label: 'Small multiples', options: opt(m, lowCats(m, 12)) }, { key: 'value', label: 'Y-axis', options: mopt(m, ALLM) }],
    build(m, e) {
      const axis = timeAxis(m, e.time);
      const q = `Are fiecare ${word(m, e.split)} aceeași evoluție, sau are tiparul ei?`;
      return {
        question: q,
        spec: { chart: 'smallmult', axis, split: e.split, values: [e.value] },
        wells: [well('X-axis', axis.map((x) => F(m, x))), well('Y-axis', M(m, e.value)), well('Small multiples', F(m, e.split))],
        measures: [e.value],
        format: timeFormat(m, e.time).concat([
          'Format visual → Visual → Small multiples → Layout: Rows 2, Columns 3 (sau cât încape).',
          'Y-axis → Range: Shared (implicit). Așa compari corect mărimile; „Independent” arată doar forma.',
          'Small multiple title → Position: Top, Alignment: Left.',
          titleStep(ucfirst(q.replace(/\?$/, '')))
        ]),
        filters: e.value === 'total' ? [statusFilter(m)] : [],
        tips: ['Zona „Small multiples” există pe Line, Area, Bar și Column chart: câmpul pus acolo împarte vizualul în mini-grafice.'].concat(ambiguityTip(m, [e.split]))
      };
    }
  };

  // ---- Table cu sparklines
  T.tableSpark = {
    available: (m) => timeAvailable(m) && m.names.length > 0,
    variants: (m) => [{ rows: m.R.productName || m.names[0], values: ['total', 'qty', 'count'].filter((x) => has(m, x)).slice(0, 2) }],
    slots: (m) => [{ key: 'rows', label: 'Columns (primul câmp)', options: opt(m, m.names.concat(m.cats)) }],
    build(m, e) {
      const sparkX = m.years.length >= 2 ? [m.time.year, m.time.month] : [m.time.month];
      const mf = fld(m, m.time.month);
      const q = `Cum stă fiecare ${word(m, e.rows)} și încotro merge?`;
      return {
        question: q,
        spec: { chart: 'tablespark', rows: e.rows, values: e.values, spark: sparkX },
        wells: [well('Columns', [F(m, e.rows)].concat(e.values.map((v) => M(m, v)))), well('Sparkline', M(m, e.values[0]), F(m, m.time.month))],
        measures: e.values,
        format: [
          `În Columns, click pe săgeata de lângă [${mname(m, e.values[0])}] → Add a sparkline → Y-axis: [${mname(m, e.values[0])}], X-axis: ${mf.table}[${mf.col}] → Create.`,
          'Format visual → Visual → Sparklines → Line width 1,5; Markers: Highest și Lowest.',
          `Sortează descrescător după [${mname(m, e.values[0])}] (click pe antetul coloanei).`,
          'Style presets: Minimal. Sparkline-ul trebuie să fie discret, nu un grafic în sine.'
        ],
        tips: ['Cu mai mulți ani, pune în X-axis o coloană An-Lună (ex. FORMAT(Data, "yyyy-MM")): altfel lunile din ani diferiți se adună.', `Sparkline-ul folosește tabelul Calendar: ${monthSort(m, [m.time.month]) ? 'sortează lunile după numărul lunii.' : 'verifică ordinea lunilor.'}`]
      };
    }
  };

  // ---- Key influencers
  T.keyInf = {
    available: (m) => (!!m.R.status || !!m.R.value) && m.cats.length >= 2,
    variants: (m) => {
      const out = [];
      if (m.R.status) out.push({ target: 'status' });
      if (m.R.value) out.push({ target: 'value' });
      return out;
    },
    slots: () => [],
    build(m, e) {
      const F_ = m.fact.name;
      const S = m.R.status;
      const sid = S ? m.fieldId(F_, S.col.name) : null;
      const by = m.cats.filter((c) => c !== sid).slice(0, 5);
      if (e.target === 'status' && S) {
        const q = `Ce face ca o ${m.R.unit} să ajungă la statusul „${S.bad.join(' / ')}”?`;
        return {
          question: q,
          spec: { chart: 'keyinf', statusField: sid, bad: S.bad, by },
          wells: [well('Analyze', F(m, sid)), well('Explain by', by.map((x) => F(m, x)))],
          measures: [],
          format: [
            `În capul vizualului alege valoarea urmărită: „What influences ${S.col.name} to be ${S.bad[0]}”.`,
            'Format visual → Analysis → Type: Categorical (pentru un status).',
            'Pune vizualul pe o pagină de analiză, cu un text scurt care explică cum se citește.'
          ],
          tips: ['Key influencers arată ce apare des împreună cu rezultatul, nu ce îl provoacă. Formulează titlul cu grijă.', 'Are nevoie de rânduri multe; cu sub ~100 de rânduri, interpretează rezultatele ca indicii.']
        };
      }
      const vid = m.fieldId(F_, m.R.value.name);
      const q = `Ce face ca o ${m.R.unit} să aibă o valoare mai mare?`;
      return {
        question: q,
        spec: { chart: 'keyinf', valueField: vid, by },
        wells: [well('Analyze', F(m, vid, "Don't summarize")), well('Explain by', by.map((x) => F(m, x)))],
        measures: [],
        format: ['Format visual → Analysis → Type: Continuous (pentru o valoare numerică).', 'În Analyze, câmpul numeric trebuie să fie „Don’t summarize”: analiza se face rând cu rând.', 'Tab-ul „Top segments” găsește combinații (ex. Online + B2B); merită arătat la prezentare.'],
        tips: ['Rezultatul spune „în medie cu X mai mult”, comparat cu restul rândurilor.']
      };
    }
  };

  // ---- Smart narrative
  T.narrative = {
    variants: () => [{ kind: 'auto' }],
    slots: () => [],
    build(m) {
      return {
        question: 'Ce spun cifrele, în cuvinte?',
        spec: { chart: 'narrative' },
        wells: [well('Unde îl găsești', { t: 'f', table: 'Insert', col: 'Narrative → Smart narrative', menu: true })],
        measures: ['total', 'count'].filter((x) => has(m, x)),
        format: [
          'Insert → Narrative → Smart narrative (sau click dreapta pe un vizual → Summarize).',
          'Editează textul: păstrează 2–4 propoziții, scrie-le în română, cu termenii raportului tău.',
          'Pentru o cifră care se actualizează: + Value → scrie în limbaj natural sau alege o măsură.',
          'Pune-l lângă vizualul pe care îl rezumă, nu singur pe pagină.'
        ],
        tips: ['Textul se schimbă când filtrezi pagina: verifică-l cu slicerele aplicate.', 'Smart narrative descrie ce s-a întâmplat. „De ce” îl adaugi tu.']
      };
    }
  };

  /* ---------- nivel de dificultate ---------- */
  function levelOf(m, s) {
    let lv = 1;
    const seen = new Set();
    const visit = (id) => {
      if (seen.has(id)) return;
      seen.add(id);
      const ms = m.measures.get(id);
      if (!ms) return;
      lv = Math.max(lv, ms.level || 1);
      (ms.deps || []).forEach(visit);
    };
    (s.measures || []).forEach(visit);
    (s.calcCols || []).forEach((id) => { const c = m.calcCols.find((x) => x.id === id); if (c) lv = Math.max(lv, c.level || 1); });
    (s.customMeasures || []).forEach((c) => { lv = Math.max(lv, c.level || 3); });
    (s.filters || []).forEach((f) => { if (f && f.apply && f.apply.topN) lv = Math.max(lv, 2); });
    return lv;
  }

  /** toate măsurile necesare, cu dependențele, în ordinea în care se scriu */
  function measureChain(m, ids) {
    const out = [];
    const visit = (id) => {
      const ms = m.measures.get(id);
      if (!ms || out.includes(id)) return;
      (ms.deps || []).forEach(visit);
      out.push(id);
    };
    (ids || []).forEach(visit);
    return out;
  }

  const keyOf = (type, enc) => type + ':' + JSON.stringify(enc);

  function make(m, type, enc) {
    const def = T[type];
    if (!def) return null;
    let s;
    try { s = def.build(m, enc); } catch (err) { console.warn('[atelier] nu pot construi', type, err); return null; }
    if (!s) return null;
    s.filters = (s.filters || []).filter(Boolean);
    s.calcCols = [...new Set(s.calcCols || [])];
    s.type = type;
    s.enc = enc;
    s.key = keyOf(type, enc);
    s.visual = VIS[type].name;
    s.family = VIS[type].fam;
    s.what = VIS[type].what;
    s.avoid = VIS[type].avoid;
    s.level = levelOf(m, s);
    s.slots = def.slots ? def.slots(m).filter((sl) => sl.options && sl.options.length > 1) : [];
    return s;
  }

  function generate(m) {
    const out = [];
    const seen = new Set();
    Object.keys(T).forEach((type) => {
      const def = T[type];
      if (def.available && !def.available(m)) return;
      (def.variants(m) || []).forEach((enc) => {
        const s = make(m, type, enc);
        if (!s || seen.has(s.key)) return;
        seen.add(s.key);
        out.push(s);
      });
    });
    return out;
  }

  A.Catalog = { FAMILIES, VIS, generate, make, measureChain, keyOf };
})();
