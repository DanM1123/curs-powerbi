/* ==========================================================================
   Atelier de raport · motorul de date
   Citește fișierele (xlsx / csv), recunoaște tipurile, tabelele și relațiile,
   construiește un model stea „aplatizat” și calculează măsuri cu filtre.
   Totul rulează în browser: nimic nu pleacă spre un server.
   ========================================================================== */
(function () {
  'use strict';

  const A = (window.Atelier = window.Atelier || {});

  /* ---------- utilitare text ---------- */
  const stripDia = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '');
  const norm = (s) => stripDia(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const tokens = (s) => stripDia(s)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const collator = new Intl.Collator('ro', { numeric: true, sensitivity: 'base' });

  const MONTHS = [
    ['ianuarie', 'ian', 'january', 'jan'], ['februarie', 'feb', 'february'], ['martie', 'mar', 'march'],
    ['aprilie', 'apr', 'april'], ['mai', 'may'], ['iunie', 'iun', 'june', 'jun'], ['iulie', 'iul', 'july', 'jul'],
    ['august', 'aug'], ['septembrie', 'sep', 'sept', 'september'], ['octombrie', 'oct', 'october'],
    ['noiembrie', 'noi', 'nov', 'november'], ['decembrie', 'dec', 'december']
  ];
  const MONTH_NAMES = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
  const MONTH_SHORT = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
  const WEEKDAYS = [
    ['luni', 'monday', 'mon'], ['marti', 'tuesday', 'tue'], ['miercuri', 'wednesday', 'wed'], ['joi', 'thursday', 'thu'],
    ['vineri', 'friday', 'fri'], ['sambata', 'saturday', 'sat'], ['duminica', 'sunday', 'sun']
  ];
  const WEEKDAY_NAMES = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata', 'Duminica'];
  const monthIndex = (v) => { const n = norm(v); for (let i = 0; i < 12; i++) if (MONTHS[i].includes(n)) return i; return -1; };
  const weekdayIndex = (v) => { const n = norm(v); for (let i = 0; i < 7; i++) if (WEEKDAYS[i].includes(n)) return i; return -1; };

  /* ---------- conversii de valori ---------- */
  const DMY = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/;
  const YMD = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?Z?)?$/;
  const NUM = /^[-+]?\d+(?:[.,]\d+)?$/;

  function asDate(v) {
    if (v instanceof Date && !isNaN(v)) {
      const d = new Date(v.getTime() + 60000); // SheetJS poate da 23:59:59 din ziua precedentă
      return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    }
    if (typeof v === 'string') {
      const s = v.trim();
      let m = s.match(DMY);
      if (m) {
        const d = +m[1], mo = +m[2], y = +m[3];
        if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return Date.UTC(y, mo - 1, d);
      }
      m = s.match(YMD);
      if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    }
    return null;
  }
  function asNum(v) {
    if (typeof v === 'number' && isFinite(v)) return v;
    if (typeof v === 'string') {
      const s = v.trim().replace(/\s/g, '');
      if (NUM.test(s)) return parseFloat(s.replace(',', '.'));
    }
    return null;
  }
  const isBlank = (v) => v == null || (typeof v === 'string' && v.trim() === '');
  const pad2 = (n) => String(n).padStart(2, '0');
  const fmtDate = (t) => { const d = new Date(t); return pad2(d.getUTCDate()) + '.' + pad2(d.getUTCMonth() + 1) + '.' + d.getUTCFullYear(); };

  /* ---------- citirea fișierelor ---------- */
  const cleanTableName = (s) => String(s || 'Tabel')
    .replace(/\.(xlsx|xlsm|xls|csv|txt)$/i, '')
    .replace(/[_\s-]*(curat|curata|clean|final|murdar|brut|v\d+)$/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_') || 'Tabel';

  function findHeader(aoa) {
    const head = aoa.slice(0, 30);
    const width = Math.max(1, ...head.map((r) => r.filter((v) => !isBlank(v)).length));
    for (let i = 0; i < Math.min(aoa.length, 15); i++) {
      const nn = aoa[i].filter((v) => !isBlank(v));
      if (nn.length >= Math.max(2, Math.ceil(width * 0.8)) && nn.every((v) => typeof v === 'string')) return i;
    }
    return 0;
  }

  function tableFromAoa(name, aoa, source) {
    aoa = aoa.filter((r) => r && r.some((v) => !isBlank(v)));
    if (!aoa.length) return null;
    const h = findHeader(aoa);
    const headerRow = aoa[h];
    const width = Math.max(...aoa.map((r) => r.length));
    const names = [];
    const used = {};
    for (let c = 0; c < width; c++) {
      let n = isBlank(headerRow[c]) ? 'Coloana' + (c + 1) : String(headerRow[c]).trim();
      if (used[n]) n = n + '_' + (++used[n]); else used[n] = 1;
      names.push(n);
    }
    const body = aoa.slice(h + 1);
    // scoatem coloanele complet goale fără antet
    const keep = names.map((n, c) => !(/^Coloana\d+$/.test(n) && body.every((r) => isBlank(r[c]))));
    const columns = [];
    names.forEach((n, c) => { if (keep[c]) columns.push({ name: n, raw: body.map((r) => (r[c] === undefined ? null : r[c])) }); });
    return { name: cleanTableName(name), source, skipped: h, columns: columns.map((c) => typeColumn(c.name, c.raw)), rowCount: body.length };
  }

  function typeColumn(name, raw) {
    let nn = 0, nd = 0, nnum = 0;
    raw.forEach((v) => {
      if (isBlank(v)) return;
      nn++;
      if (asDate(v) != null) nd++;
      else if (asNum(v) != null) nnum++;
    });
    let type = 'text';
    if (nn && nd / nn >= 0.9) type = 'date';
    else if (nn && nnum / nn >= 0.9) {
      type = 'number';
      // număr serial Excel într-o coloană „Data…”
      const t = tokens(name);
      if (t.some((x) => ['data', 'date', 'ziua'].includes(x))) {
        const nums = raw.map(asNum).filter((x) => x != null);
        if (nums.length && nums.every((x) => x > 20000 && x < 80000 && Math.floor(x) === x)) type = 'serial';
      }
    }
    let bad = 0;
    const values = raw.map((v) => {
      if (isBlank(v)) return null;
      if (type === 'date') { const d = asDate(v); if (d == null) bad++; return d; }
      if (type === 'serial') { const x = asNum(v); return Date.UTC(1899, 11, 30) + x * 86400000; }
      if (type === 'number') { const x = asNum(v); if (x == null) bad++; return x; }
      return (v instanceof Date) ? fmtDate(asDate(v)) : String(v).trim();
    });
    return { name, type: type === 'serial' ? 'date' : type, values, bad };
  }

  function detectSep(text) {
    const line = text.split(/\r?\n/).find((l) => l.trim()) || '';
    const counts = { ';': (line.match(/;/g) || []).length, ',': (line.match(/,/g) || []).length, '\t': (line.match(/\t/g) || []).length };
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  }

  async function readFile(file) {
    if (!window.XLSX) throw new Error('Biblioteca de citire Excel nu s-a încărcat. Verifică conexiunea la internet.');
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const buf = await file.arrayBuffer();
    const out = [];
    if (ext === 'csv' || ext === 'txt') {
      let text = new TextDecoder('utf-8').decode(buf);
      if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
      const wb = XLSX.read(text, { type: 'string', FS: detectSep(text), raw: true });
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: null, blankrows: false });
      const t = tableFromAoa(file.name, aoa, file.name);
      if (t) out.push(t);
      return out;
    }
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });
    const generic = (s) => /^(sheet|foaie|foaia|tabel)\s*\d*$/i.test(s.trim());
    wb.SheetNames.forEach((sn) => {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: true, defval: null, blankrows: false });
      const name = wb.SheetNames.length === 1 && generic(sn) ? file.name : (generic(sn) ? file.name + '_' + sn : sn);
      const t = tableFromAoa(name, aoa, file.name + (wb.SheetNames.length > 1 ? ' · ' + sn : ''));
      if (t && t.columns.length) out.push(t);
    });
    return out;
  }

  /* ---------- profilul coloanelor ---------- */
  function profile(table) {
    const n = table.rowCount;
    table.columns.forEach((col) => {
      const counts = new Map();
      let nulls = 0, min = Infinity, max = -Infinity;
      col.values.forEach((v) => {
        if (v == null) { nulls++; return; }
        counts.set(v, (counts.get(v) || 0) + 1);
        if (typeof v === 'number') { if (v < min) min = v; if (v > max) max = v; }
      });
      col.nulls = nulls;
      col.distinct = counts.size;
      col.unique = nulls === 0 && counts.size === n && n > 0;
      col.min = min === Infinity ? null : min;
      col.max = max === -Infinity ? null : max;
      col.top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
      col.role = columnRole(col, n);
    });
    return table;
  }

  const ORDINAL = /^(an|anul|year|luna|month|lunanr|nrluna|trimestru|quarter|nrtrimestru|nrzi|zi|ziua|day|dayofweek|nrzisapt|nrzisaptamana|nrsaptamana\w*|saptamana\w*|week\w*|ziluna|zian)$/;
  function columnRole(col, rows) {
    const n = norm(col.name);
    const t = tokens(col.name);
    if (col.nulls === rows) return 'ignore';
    if (/^(lat|latitudine|latitude)$/.test(n)) return 'lat';
    if (/^(long|lon|lng|longitudine|longitude)$/.test(n)) return 'lon';
    if (/(email|mail|telefon|phone|nota|notes|comentariu|observatii|adresa|website|url)/.test(n)) return 'ignore';
    const keyTok = ['id', 'cod', 'key', 'sku', 'fk', 'pk'];
    if (keyTok.includes(t[0]) || keyTok.includes(t[t.length - 1])) return 'key';
    if (col.type === 'date') return 'date';
    if (col.type === 'number') {
      if (ORDINAL.test(n)) return 'ordinal';
      return 'measure';
    }
    if (col.distinct <= 1) return 'ignore';
    const nameTok = ['nume', 'denumire', 'name', 'titlu', 'produs', 'client'];
    if (col.distinct > 0.8 * (rows - col.nulls) && col.distinct > 12) {
      return t.some((x) => nameTok.includes(x)) ? 'name' : 'label';
    }
    if (col.distinct > 60) return 'label';
    return 'category';
  }

  /* ---------- relații ---------- */
  const DROP_TABLE_TOK = ['dim', 'dimensiune', 'tbl', 'tabel', 'd', 'fact', 'f', 'fct', 'lookup', 'curat', 'clean', 'final'];
  const stemTable = (name) => tokens(name).filter((x) => !DROP_TABLE_TOK.includes(x)).join('');
  const stemFk = (col) => tokens(col).filter((x) => !['id', 'cod', 'key', 'fk', 'pk', 'nr'].includes(x)).join('');
  function prefixMatch(a, b) {
    if (!a || !b) return false;
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i >= 3 && i >= Math.min(4, Math.min(a.length, b.length) - 1);
  }

  function detectRelationships(tables) {
    const cands = [];
    tables.forEach((T) => {
      T.columns.forEach((c) => {
        if (c.role === 'ignore' || c.role === 'measure' || c.role === 'lat' || c.role === 'lon') return;
        tables.forEach((D) => {
          if (D === T) return;
          D.columns.forEach((k) => {
            if (!k.unique || k.type !== c.type) return;
            let score = 0;
            const kt = tokens(k.name);
            if (norm(c.name) === norm(k.name) && (c.role === 'key' || c.type === 'date')) score = 3;
            else if (c.role === 'key' && kt.length === 1 && ['id', 'cod', 'key'].includes(kt[0]) && prefixMatch(stemFk(c.name), stemTable(D.name))) score = 3;
            else if (c.type === 'date' && k.type === 'date') score = 2;
            if (!score) return;
            if (c.unique && T.rowCount > D.rowCount) return; // când ambele chei sunt unice, partea „1” e tabelul mai mare (ex. calendarul)
            const set = new Set(k.values.map(String));
            const vals = [...new Set(c.values.filter((v) => v != null).map(String))];
            if (!vals.length) return;
            const cover = vals.filter((v) => set.has(v)).length / vals.length;
            if (cover < 0.6) return;
            cands.push({ from: { table: T.name, col: c.name }, to: { table: D.name, col: k.name }, score: score + cover, kind: c.type === 'date' ? 'date' : 'key', cover });
          });
        });
      });
    });
    // o singură relație între două tabele (cea mai bună)
    const best = new Map();
    cands.forEach((r) => {
      const key = r.from.table + '→' + r.to.table;
      const cur = best.get(key);
      if (!cur || r.score > cur.score) best.set(key, r);
    });
    return [...best.values()];
  }

  /* ---------- lexic: etichete și substantive ---------- */
  const DIA = {
    vanzare: 'vânzare', vanzari: 'vânzări', incasari: 'încasări', incasare: 'încasare', rezervari: 'rezervări', rezervare: 'rezervare',
    tara: 'țară', oras: 'oraș', judet: 'județ', plata: 'plată', inscriere: 'înscriere', inregistrare: 'înregistrare',
    saptamana: 'săptămână', sala: 'sală', sali: 'săli', agentie: 'agenție', agentii: 'agenții', pret: 'preț', suprafata: 'suprafață',
    luna: 'lună', zi: 'zi', marime: 'mărime', tranzactie: 'tranzacție', tranzactii: 'tranzacții', fara: 'fără', numar: 'număr',
    medie: 'medie', lucratoare: 'lucrătoare', clienti: 'clienți', membri: 'membri', persoana: 'persoană', persoane: 'persoane',
    cantitate: 'cantitate', valoare: 'valoare', totala: 'totală', neta: 'netă', categorie: 'categorie', subcategorie: 'subcategorie',
    perioada: 'perioadă', fiscala: 'fiscală', activ: 'activ', proiectii: 'proiecții', proiectie: 'proiecție', vacante: 'vacanțe', calatori: 'călători', destinatii: 'destinații', calator: 'călător', destinatie: 'destinație'
  };
  const SINGULAR = {
    clienti: 'client', produse: 'produs', magazine: 'magazin', cafenele: 'cafenea', membri: 'membru', servicii: 'serviciu',
    sali: 'sală', pachete: 'pachet', calatori: 'călător', calator: 'călător', filme: 'film', actori: 'actor', cinematografe: 'cinematograf', proiectii: 'proiecție', destinatii: 'destinație', destinatie: 'destinație', vacante: 'vacanță', vacanta: 'vacanță', agentii: 'agenție', date: 'dată', calendar: 'calendar', angajati: 'angajat',
    vanzari: 'vânzare', incasari: 'încasare', rezervari: 'rezervare', comenzi: 'comandă', facturi: 'factură', locatii: 'locație'
  };
  const words = (s) => tokens(s).map((w) => DIA[w] || w);
  const human = (s) => words(s).join(' ');
  const PLURAL = {
    'călător': 'călători', 'destinație': 'destinații', client: 'clienți', produs: 'produse', magazin: 'magazine', membru: 'membri',
    serviciu: 'servicii', pachet: 'pachete', 'agenție': 'agenții', 'sală': 'săli', cafenea: 'cafenele', 'vacanță': 'vacanțe',
    transport: 'transporturi', film: 'filme', actor: 'actori', cinematograf: 'cinematografe', 'locație': 'locații', angajat: 'angajați', pacient: 'pacienți', student: 'studenți', turist: 'turiști'
  };
  const plural = (table) => { const h = human(table.replace(/^dim_?/i, '')); return PLURAL[h] || h; };
  const singular = (table) => { const t = tokens(table).filter((x) => !DROP_TABLE_TOK.includes(x)).join(' '); return SINGULAR[t.replace(/\s/g, '')] || human(t); };

  /* ---------- modelul ---------- */
  function buildModel(rawTables, overrides) {
    overrides = overrides || {};
    const tables = rawTables.map((t) => profile(t));
    const warnings = [];
    tables.forEach((t) => {
      if (t.skipped) warnings.push({ level: 'warn', text: `În „${t.name}” am sărit ${t.skipped} rând(uri) de deasupra antetului. Datele par necurățate: curăță-le în Power Query și încarcă varianta curată.` });
      t.columns.forEach((c) => { if (c.bad) warnings.push({ level: 'warn', text: `${t.name}[${c.name}] are ${c.bad} valori care nu se potrivesc cu tipul ${c.type === 'number' ? 'număr' : 'dată'}.` }); });
    });

    let rels = detectRelationships(tables);
    // fact = tabelul cu cele mai multe relații spre alte tabele
    const outCount = {};
    rels.forEach((r) => { outCount[r.from.table] = (outCount[r.from.table] || 0) + 1; });
    let fact = overrides.fact && tables.find((t) => t.name === overrides.fact);
    if (!fact) {
      fact = tables.slice().sort((a, b) => (outCount[b.name] || 0) - (outCount[a.name] || 0) || b.rowCount - a.rowCount)[0];
    }
    if (!fact) return null;

    // relațiile suprascrise manual
    if (overrides.rels) {
      Object.keys(overrides.rels).forEach((dim) => {
        const o = overrides.rels[dim];
        rels = rels.filter((r) => !(r.from.table === fact.name && r.to.table === dim));
        if (o && o.from && o.to) {
          const T = tables.find((t) => t.name === fact.name);
          const D = tables.find((t) => t.name === dim);
          const c = T && T.columns.find((x) => x.name === o.from);
          if (c && D && D.columns.find((x) => x.name === o.to)) rels.push({ from: { table: fact.name, col: o.from }, to: { table: dim, col: o.to }, kind: c.type === 'date' ? 'date' : 'key', score: 9, manual: true });
        }
      });
    }

    // păstrăm doar relațiile accesibile din fact (stea, cel mult fulg de nea)
    const used = [];
    const reached = new Set([fact.name]);
    let frontier = [fact.name];
    while (frontier.length) {
      const next = [];
      frontier.forEach((tn) => {
        rels.filter((r) => r.from.table === tn && !reached.has(r.to.table)).forEach((r) => {
          // din fact păstrăm câte o relație per dimensiune
          if (used.some((u) => u.to.table === r.to.table)) return;
          used.push(r);
          reached.add(r.to.table);
          next.push(r.to.table);
        });
      });
      frontier = next;
    }
    tables.forEach((t) => {
      if (!reached.has(t.name)) warnings.push({ level: 'info', text: `Tabelul „${t.name}” nu se leagă de „${fact.name}”. Nu va apărea în vizuale până nu îi găsești o cheie comună.` });
    });

    // calendar: o dimensiune legată printr-o dată sau care are o coloană dată unică
    let calendar = null;
    used.forEach((r) => {
      const D = tables.find((t) => t.name === r.to.table);
      if (!calendar && D.columns.some((c) => c.type === 'date' && c.unique)) calendar = D;
    });

    // calendar virtual dacă fact-ul are o dată, dar nu există tabel de date
    let virtualCalendar = false;
    if (!calendar) {
      const dc = fact.columns.find((c) => c.type === 'date' && c.role !== 'ignore');
      if (dc) {
        const vals = dc.values.filter((v) => v != null);
        const min = Math.min(...vals), max = Math.max(...vals);
        const days = [];
        for (let t = min; t <= max && days.length < 4000; t += 86400000) days.push(t);
        const cal = {
          name: 'Calendar', source: 'creat de tine în Power BI', virtual: true, skipped: 0, rowCount: days.length,
          columns: [
            { name: 'Data', type: 'date', values: days },
            { name: 'An', type: 'number', values: days.map((t) => new Date(t).getUTCFullYear()) },
            { name: 'Luna', type: 'number', values: days.map((t) => new Date(t).getUTCMonth() + 1) },
            { name: 'Luna_Nume', type: 'text', values: days.map((t) => MONTH_NAMES[new Date(t).getUTCMonth()]) },
            { name: 'Trimestru', type: 'text', values: days.map((t) => 'T' + (Math.floor(new Date(t).getUTCMonth() / 3) + 1)) },
            { name: 'Zi_Saptamana', type: 'text', values: days.map((t) => WEEKDAY_NAMES[(new Date(t).getUTCDay() + 6) % 7]) }
          ]
        };
        profile(cal);
        tables.push(cal);
        calendar = cal;
        virtualCalendar = true;
        used.push({ from: { table: fact.name, col: dc.name }, to: { table: 'Calendar', col: 'Data' }, kind: 'date', score: 9, virtual: true });
        reached.add('Calendar');
      }
    }

    const tableByName = Object.fromEntries(tables.map((t) => [t.name, t]));
    const roleOf = (t) => (t === fact ? 'fact' : t === calendar ? 'calendar' : reached.has(t.name) ? 'dim' : 'other');
    tables.forEach((t) => { t.modelRole = roleOf(t); });

    /* --- câmpurile --- */
    const fields = new Map();
    const fieldId = (t, c) => `${t}[${c}]`;
    const dupNames = {};
    tables.filter((t) => reached.has(t.name)).forEach((t) => t.columns.forEach((c) => { dupNames[c.name] = (dupNames[c.name] || 0) + 1; }));

    tables.filter((t) => reached.has(t.name)).forEach((t) => {
      t.columns.forEach((c) => {
        if (c.role === 'ignore') return;
        const id = fieldId(t.name, c.name);
        const f = {
          id, table: t.name, col: c.name, type: c.type, role: c.role, card: c.distinct,
          label: human(c.name), ambiguous: dupNames[c.name] > 1 && c.role !== 'key',
          inCalendar: t === calendar, inFact: t === fact
        };
        f.qlabel = f.ambiguous ? `${f.label} (${singular(t.name)})` : f.label;
        // ordinea naturală
        const sample = c.top.map((x) => x[0]);
        if (c.type === 'text' && sample.length && sample.every((v) => monthIndex(v) >= 0)) { f.order = 'month'; f.sortKey = monthIndex; }
        else if (c.type === 'text' && sample.length && sample.every((v) => weekdayIndex(v) >= 0)) { f.order = 'weekday'; f.sortKey = weekdayIndex; }
        else if (c.type === 'number' || c.type === 'date') { f.order = 'numeric'; }
        else if (/^(trimestru|quarter|perioada)/.test(norm(c.name))) { f.order = 'natural'; }
        fields.set(id, f);
      });
    });

    /* --- aplatizarea: fiecare rând din fact primește atributele dimensiunilor --- */
    const lookups = used.map((r) => {
      const D = tableByName[r.to.table];
      const kc = D.columns.find((c) => c.name === r.to.col);
      const map = new Map();
      kc.values.forEach((v, i) => map.set(String(v), i));
      return { r, D, map };
    });
    const flat = [];
    let orphans = {};
    for (let i = 0; i < fact.rowCount; i++) {
      const row = {};
      fact.columns.forEach((c) => { if (c.role !== 'ignore') row[fieldId(fact.name, c.name)] = c.values[i]; });
      // relațiile în ordinea BFS: fiecare cheie se caută în rândul deja completat
      const idx = {};
      idx[fact.name] = i;
      lookups.forEach(({ r, D, map }) => {
        const src = tableByName[r.from.table];
        const si = idx[r.from.table];
        if (si == null) return;
        const kv = src.columns.find((c) => c.name === r.from.col).values[si];
        const j = kv == null ? undefined : map.get(String(kv));
        if (j === undefined) { if (kv != null) orphans[D.name] = (orphans[D.name] || 0) + 1; return; }
        idx[D.name] = j;
        D.columns.forEach((c) => { if (c.role !== 'ignore') row[fieldId(D.name, c.name)] = c.values[j]; });
      });
      flat.push(row);
    }
    Object.keys(orphans).forEach((d) => warnings.push({ level: 'warn', text: `${orphans[d]} rânduri din „${fact.name}” nu își găsesc perechea în „${d}” (apar ca „(Gol)” în vizuale).` }));

    const model = {
      tables, fact, calendar, virtualCalendar, rels: used, allRels: rels, fields, flat, warnings,
      fieldId, tableByName, calcCols: [], measures: new Map()
    };
    resolveTime(model);
    resolveRoles(model);
    buildCalcCols(model);
    buildMeasures(model);
    return model;
  }

  /* ---------- timp ---------- */
  function resolveTime(m) {
    const time = {};
    if (!m.calendar) { m.time = null; m.years = []; return; }
    const cal = m.calendar;
    const fid = (c) => m.fieldId(cal.name, c);
    const find = (re, type) => cal.columns.find((c) => re.test(norm(c.name)) && (!type || c.type === type) && c.role !== 'ignore');
    const dateCol = cal.columns.find((c) => c.type === 'date' && c.unique);
    time.date = dateCol ? fid(dateCol.name) : null;
    const add = (key, col) => { if (col) time[key] = fid(col.name); };
    add('year', find(/^(an|anul|year)$/, 'number'));
    add('monthNum', find(/^(luna|month|lunanr|nrluna)$/, 'number'));
    const mn = cal.columns.find((c) => c.type === 'text' && c.top.length && c.top.every((x) => monthIndex(x[0]) >= 0));
    add('month', mn);
    add('quarter', find(/^(trimestru|quarter|trim)$/));
    const wd = cal.columns.find((c) => c.type === 'text' && c.top.length && c.top.every((x) => weekdayIndex(x[0]) >= 0));
    add('weekday', wd);
    const workday = cal.columns.find((c) => /lucratoare|weekend|workday/.test(norm(c.name)) && c.type === 'text');
    add('workday', workday);
    time.missing = [];
    // coloanele lipsă devin coloane calculate pe care le derivăm din dată
    const dateId = time.date;
    const derive = (key, colName, fn, dax, type) => {
      if (time[key] || !dateId) return;
      const id = m.fieldId(cal.name, colName);
      m.flat.forEach((r) => { r[id] = r[dateId] == null ? null : fn(new Date(r[dateId])); });
      m.fields.set(id, { id, table: cal.name, col: colName, type: type || 'text', role: type === 'number' ? 'ordinal' : 'category', label: human(colName), qlabel: human(colName), calc: true, inCalendar: true });
      m.calcCols.push({ id, table: cal.name, name: colName, dax: `${colName} = ${dax}`, plain: `Extrage din dată ${human(colName)}.`, hint: 'Folosește o funcție de dată: YEAR, MONTH, FORMAT, QUARTER.', level: 1, kind: 'calendar' });
      time[key] = id;
    };
    derive('year', 'An', (d) => d.getUTCFullYear(), `YEAR(${cal.name}[${m.fields.get(dateId).col}])`, 'number');
    derive('monthNum', 'Luna', (d) => d.getUTCMonth() + 1, `MONTH(${cal.name}[${m.fields.get(dateId).col}])`, 'number');
    derive('month', 'Luna_Nume', (d) => MONTH_NAMES[d.getUTCMonth()], `FORMAT(${cal.name}[${m.fields.get(dateId).col}], "MMMM")`);
    derive('quarter', 'Trimestru', (d) => 'T' + (Math.floor(d.getUTCMonth() / 3) + 1), `"T" & QUARTER(${cal.name}[${m.fields.get(dateId).col}])`);
    if (time.month) { const f = m.fields.get(time.month); f.order = 'month'; f.sortKey = monthIndex; f.sortByCol = time.monthNum ? m.fields.get(time.monthNum).col : null; }
    if (time.weekday) { const f = m.fields.get(time.weekday); f.order = 'weekday'; f.sortKey = weekdayIndex; }
    if (time.year) m.fields.get(time.year).order = 'numeric';
    m.years = time.year ? [...new Set(m.flat.map((r) => r[time.year]).filter((v) => v != null))].sort() : [];
    m.time = time;
  }

  /* ---------- roluri de business ---------- */
  function resolveRoles(m) {
    const F = m.fact;
    const R = {};
    const fcols = F.columns;
    const score = (c) => {
      const n = norm(c.name);
      if (c.role !== 'measure') return -1;
      if (/total/.test(n) && /valoare|suma|pret|incasari/.test(n)) return 10;
      if (/^(valoare|suma|incasat|incasare|incasari|venit|amount|sales|revenue|vanzari|total)/.test(n)) return 8;
      if (/neta|net/.test(n)) return 7;
      if (/valoare|suma/.test(n)) return 6;
      if (/tva|discount|pct|procent|cota|pret|cantitate|qty|nr/.test(n)) return 0;
      return 3;
    };
    const sorted = fcols.filter((c) => c.role === 'measure').sort((a, b) => score(b) - score(a) || (b.max || 0) - (a.max || 0));
    R.value = sorted[0] || null;
    R.net = fcols.find((c) => c.role === 'measure' && /neta|net$|incasaribilete/.test(norm(c.name)) && c !== R.value) || null;
    R.qty = fcols.find((c) => c.role === 'measure' && /cantitate|qty|quantity|nrpersoane|bucati|nrbucati|persoane|biletevandute|nrbilete/.test(norm(c.name))) || null;
    R.price = fcols.find((c) => c.role === 'measure' && /^pret|price/.test(norm(c.name))) || null;
    R.discount = fcols.find((c) => c.role === 'measure' && /discount|reducere/.test(norm(c.name))) || null;
    // status cu valori „rele”
    const BAD = /anulat|retur|storn|refuz|respins|cancel/i;
    R.status = null;
    fcols.forEach((c) => {
      if (R.status || c.role !== 'category') return;
      const bad = c.top.map((x) => x[0]).filter((v) => BAD.test(stripDia(v)));
      if (bad.length && bad.length < c.distinct) R.status = { col: c, bad, good: c.top.map((x) => x[0]).filter((v) => !BAD.test(stripDia(v))) };
    });
    R.channel = fcols.find((c) => c.role === 'category' && /canal|channel|sursa/.test(norm(c.name))) || null;

    // dimensiuni
    const dims = m.rels.filter((r) => r.from.table === F.name && !r.virtual).map((r) => ({ rel: r, t: m.tableByName[r.to.table] })).filter((d) => d.t !== m.calendar);
    const pick = (re) => dims.find((d) => re.test(norm(d.t.name)) || re.test(norm(d.rel.from.col)));
    R.customer = pick(/client|membr|customer|cumparator|pacient|abonat|student|calator|turist|pasager|participant|oaspete|actor|artist/);
    R.product = pick(/produs|serviciu|pachet|articol|item|product|meniu|curs|film|spectacol/);
    R.location = pick(/magazin|cafenea|sala|sali|agenti|locatie|store|filiala|punct|clinica|hotel|sucursala|destinati|cinema|cinematograf/);
    const nameOf = (d) => {
      if (!d) return null;
      const c = d.t.columns.find((x) => x.role === 'name')
        || d.t.columns.find((x) => x.type === 'text' && x.role !== 'ignore' && x.role !== 'key' && tokens(x.name).some((w) => ['nume', 'denumire', 'name'].includes(w)))
        || d.t.columns.find((x) => x.role === 'label' && !/cod|sku/.test(norm(x.name)));
      return c ? m.fieldId(d.t.name, c.name) : null;
    };
    R.productName = nameOf(R.product);
    R.customerName = nameOf(R.customer);
    R.locationName = nameOf(R.location);
    if (R.location) {
      const lat = R.location.t.columns.find((c) => c.role === 'lat');
      const lon = R.location.t.columns.find((c) => c.role === 'lon');
      if (lat && lon) R.geo = { lat: m.fieldId(R.location.t.name, lat.name), lon: m.fieldId(R.location.t.name, lon.name) };
    }
    // atribute numerice ale locației (suprafață etc.)
    R.locationNum = R.location ? (R.location.t.columns.find((c) => c.role === 'measure' && !/lat|lon/.test(norm(c.name))) || null) : null;
    R.productPrice = R.product ? (R.product.t.columns.find((c) => c.role === 'measure' && /pret|price/.test(norm(c.name))) || null) : null;

    // substantive pentru întrebări
    const factWords = tokens(F.name).filter((x) => !DROP_TABLE_TOK.includes(x)).join('') || norm(F.name);
    R.noun = DIA[factWords] || human(factWords).toLowerCase();
    R.unit = SINGULAR[factWords] || R.noun;
    // ce se adună poate avea alt nume decât ce se numără: proiecții → încasări
    R.valueNoun = R.value && /^incasar/.test(norm(R.value.name)) ? 'încasări' : R.noun;
    R.customerNoun = R.customer ? plural(R.customer.t.name).toLowerCase() : 'clienți';
    R.productNoun = R.product ? plural(R.product.t.name).toLowerCase() : 'produse';
    R.locationNoun = R.location ? plural(R.location.t.name).toLowerCase() : 'locații';
    m.R = R;

    // categoriile, în ordinea „interesului”
    const catScore = (f) => {
      let s = 0;
      const c = f.card;
      if (c >= 3 && c <= 8) s += 10; else if (c === 2) s += 5; else if (c <= 12) s += 7; else if (c <= 30) s += 3; else s -= 10;
      const n = norm(f.col);
      if (/^categorie|category/.test(n)) s += 5;
      if (R.product && f.table === R.product.t.name) s += 4; // întâi atributele a ceea ce se vinde
      if (R.customer && f.table === R.customer.t.name && /actor/.test(norm(f.table))) s -= 3;
      if (/canal|channel/.test(n)) s += 4;
      if (/segment/.test(n)) s += 3;
      if (/regiune|region/.test(n)) s += 2;
      if (/format|tip|brand|subcategorie|tara|animal|zona/.test(n)) s += 2;
      if (R.status && f.id === m.fieldId(F.name, R.status.col.name)) s -= 6;
      if (/oras|judet|city/.test(n)) s -= 1;
      if (/activ|lucratoare/.test(n)) s -= 4;
      return s;
    };
    m.cats = [...m.fields.values()].filter((f) => f.role === 'category' && !f.inCalendar && f.card >= 2 && f.card <= 30)
      .map((f) => ({ f, s: catScore(f) })).sort((a, b) => b.s - a.s).map((x) => x.f.id);
    m.names = [R.productName, R.customerName, R.locationName].filter(Boolean);
    // numere cu ordine (ex. săptămâna de rulare), bune ca axă pentru coloane
    m.ords = [...m.fields.values()].filter((f) => f.role === 'ordinal' && f.inFact && f.card >= 2 && f.card <= 15).map((f) => f.id);
  }

  /* ---------- coloane calculate propuse ---------- */
  function niceRound(x) {
    if (!x) return 0;
    const p = Math.pow(10, Math.floor(Math.log10(x)));
    const n = x / p;
    return (n < 1.5 ? 1 : n < 3.5 ? 2.5 : n < 7.5 ? 5 : 10) * p;
  }
  function buildCalcCols(m) {
    const F = m.fact.name;
    const R = m.R;
    if (R.value) {
      const vals = m.flat.map((r) => r[m.fieldId(F, R.value.name)]).filter((v) => v != null).sort((a, b) => a - b);
      const med = vals[Math.floor(vals.length / 2)] || 0;
      const th = niceRound(med);
      const id = m.fieldId(F, 'Marime_Tranzactie');
      const vid = m.fieldId(F, R.value.name);
      m.flat.forEach((r) => { r[id] = r[vid] == null ? null : (r[vid] >= th ? 'Mare' : 'Mica'); });
      m.fields.set(id, { id, table: F, col: 'Marime_Tranzactie', type: 'text', role: 'category', card: 2, label: 'mărime tranzacție', qlabel: 'mărime tranzacție', calc: true, inFact: true });
      m.calcCols.push({ id, table: F, name: 'Marime_Tranzactie', level: 2, kind: 'if',
        dax: `Marime_Tranzactie =\nIF ( ${F}[${R.value.name}] >= ${th}, "Mare", "Mica" )`,
        plain: `Etichetează fiecare rând: „Mare” dacă ${R.value.name} este cel puțin ${th.toLocaleString('ro-RO')}, altfel „Mica”.`,
        hint: 'O coloană calculată se scrie în tabelul de fapte (Table tools → New column) și se calculează rând cu rând. Ai nevoie de IF.' });
    }
    if (R.discount) {
      const id = m.fieldId(F, 'Interval_Discount');
      const did = m.fieldId(F, R.discount.name);
      const big = (R.discount.max || 0) <= 1 ? 0.1 : 10;
      const lbl = big === 10 ? '10%' : '10%';
      m.flat.forEach((r) => { const d = r[did]; r[id] = d == null ? null : d === 0 ? 'Fara discount' : d <= big ? 'Pana la ' + lbl : 'Peste ' + lbl; });
      m.fields.set(id, { id, table: F, col: 'Interval_Discount', type: 'text', role: 'category', card: 3, label: 'interval discount', qlabel: 'interval discount', calc: true, inFact: true, order: 'list', orderList: ['Fara discount', 'Pana la 10%', 'Peste 10%'] });
      m.calcCols.push({ id, table: F, name: 'Interval_Discount', level: 2, kind: 'switch',
        dax: `Interval_Discount =\nSWITCH (\n    TRUE (),\n    ${F}[${R.discount.name}] = 0, "Fara discount",\n    ${F}[${R.discount.name}] <= ${big}, "Pana la 10%",\n    "Peste 10%"\n)`,
        plain: `Grupează rândurile după cât discount au primit: fără, până la 10%, peste 10%.`,
        hint: 'Când ai mai mult de două variante, SWITCH(TRUE(), …) e mai ușor de citit decât IF-uri unul în altul.' });
    }
    if (m.time && m.time.weekday && !m.time.workday && m.time.date) {
      const cal = m.calendar.name;
      const id = m.fieldId(cal, 'Tip_Zi');
      const wd = m.time.weekday;
      m.flat.forEach((r) => { const i = weekdayIndex(r[wd]); r[id] = i < 0 ? null : (i >= 5 ? 'Weekend' : 'Zi lucratoare'); });
      m.fields.set(id, { id, table: cal, col: 'Tip_Zi', type: 'text', role: 'category', card: 2, label: 'tip zi', qlabel: 'tip zi', calc: true, inCalendar: true });
      m.calcCols.push({ id, table: cal, name: 'Tip_Zi', level: 2, kind: 'if',
        dax: `Tip_Zi =\nIF ( WEEKDAY ( ${cal}[${m.fields.get(m.time.date).col}], 2 ) >= 6, "Weekend", "Zi lucratoare" )`,
        plain: 'Marchează fiecare zi din calendar ca weekend sau zi lucrătoare.',
        hint: 'WEEKDAY(data, 2) întoarce 1 pentru luni și 7 pentru duminică.' });
      m.time.workday = id;
    }
    if (m.time && m.time.weekday && m.time.date) {
      const cal = m.calendar.name;
      const has = m.calendar.columns.find((c) => /nrzisapt|ziuasaptamanii|weekdaynum|nrzisaptamana/.test(norm(c.name)));
      if (!has) {
        m.calcCols.push({ id: m.fieldId(cal, 'Nr_Zi_Sapt'), table: cal, name: 'Nr_Zi_Sapt', level: 1, kind: 'sort', sortHelper: true,
          dax: `Nr_Zi_Sapt = WEEKDAY ( ${cal}[${m.fields.get(m.time.date).col}], 2 )`,
          plain: `Numărul zilei (1 = luni … 7 = duminică), ca să poți sorta ${m.fields.get(m.time.weekday).col} în ordinea corectă.`,
          hint: 'Fără o coloană numerică, Power BI sortează zilele alfabetic: Duminica, Joi, Luni…' });
      }
    }
  }

  /* ---------- măsuri ---------- */
  function buildMeasures(m) {
    const F = m.fact.name;
    const R = m.R;
    const M = m.measures;
    const col = (c) => `${F}[${c.name}]`;
    const fid = (c) => m.fieldId(F, c.name);
    const sumOf = (id) => (rows) => { let s = 0; for (const r of rows) { const v = r[id]; if (typeof v === 'number') s += v; } return s; };
    const add = (o) => { M.set(o.id, Object.assign({ fmt: 'number', level: 1, deps: [] }, o)); return o; };
    const factLabel = human(F);
    // numele măsurii de total: „Total Incasari”, nu „Total Proiectii”, când valoarea are alt nume decât faptele
    const TN = R.valueNoun && R.valueNoun !== R.noun ? 'Total ' + stripDia(R.valueNoun).replace(/^./, (c) => c.toUpperCase()) : `Total ${F}`;

    if (R.value) {
      add({ id: 'total', name: `${TN}`, fn: sumOf(fid(R.value)), additive: true, fmt: 'number',
        dax: `${TN} = SUM ( ${col(R.value)} )`,
        plain: `Adună ${R.value.name} pe toate rândurile vizibile.`, hint: 'O singură funcție de agregare, pe coloana cu valoarea.' });
    } else {
      add({ id: 'total', name: `Numar ${F}`, fn: (rows) => rows.length, additive: true, dax: `Numar ${F} = COUNTROWS ( ${F} )`, plain: `Numără rândurile din ${F}.`, hint: 'COUNTROWS numără rândurile unui tabel.' });
    }
    add({ id: 'count', name: `Numar ${F}`, fn: (rows) => rows.length, additive: true,
      dax: `Numar ${F} = COUNTROWS ( ${F} )`, plain: `Numără câte ${R.noun} (rânduri) intră în calcul.`, hint: 'Nu ai nevoie de o coloană: numeri rândurile tabelului.' });
    if (R.qty) add({ id: 'qty', name: `Total ${R.qty.name}`, fn: sumOf(fid(R.qty)), additive: true,
      dax: `Total ${R.qty.name} = SUM ( ${col(R.qty)} )`, plain: `Adună ${R.qty.name}.`, hint: 'La fel ca totalul valoric, dar pe altă coloană.' });
    if (R.customer) {
      const fk = m.fieldId(F, R.customer.rel.from.col);
      const nm = plural(R.customer.t.name).split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
      add({ id: 'cust', name: `Numar ${stripDia(nm)}`, fn: (rows) => { const s = new Set(); rows.forEach((r) => { if (r[fk] != null) s.add(r[fk]); }); return s.size; }, additive: false,
        dax: `Numar ${stripDia(nm)} = DISTINCTCOUNT ( ${F}[${R.customer.rel.from.col}] )`,
        plain: `Câți ${R.customerNoun} diferiți apar în rândurile vizibile (un ${singular(R.customer.t.name)} cu 5 ${R.noun} se numără o dată).`,
        hint: 'COUNTROWS ar număra rândurile, nu persoanele. Caută funcția care numără valori unice.' });
    }
    if (R.value) add({ id: 'avg', name: 'Valoare medie', fn: (rows) => { const n = rows.length; return n ? sumOf(fid(R.value))(rows) / n : null; }, additive: false, level: 2, deps: ['total', 'count'],
      dax: `Valoare medie = DIVIDE ( [${TN}], [Numar ${F}] )`,
      plain: `Valoarea medie a unei ${R.unit}: totalul împărțit la numărul de rânduri.`,
      hint: 'Construiește măsura din alte două măsuri. DIVIDE e mai sigur decât „/” când numitorul e 0.' });
    if (R.status && R.value) {
      const sid = fid(R.status.col);
      const bad = new Set(R.status.bad);
      const cond = R.status.bad.length === 1 ? `${col(R.status.col)} <> "${R.status.bad[0]}"` : `NOT ( ${col(R.status.col)} IN { ${R.status.bad.map((b) => `"${b}"`).join(', ')} } )`;
      const condBad = R.status.bad.length === 1 ? `${col(R.status.col)} = "${R.status.bad[0]}"` : `${col(R.status.col)} IN { ${R.status.bad.map((b) => `"${b}"`).join(', ')} }`;
      const badLbl = stripDia(R.status.bad[0]);
      add({ id: 'valid', name: `Total fara ${badLbl}`, fn: (rows) => sumOf(fid(R.value))(rows.filter((r) => !bad.has(r[sid]))), additive: true, level: 2, deps: ['total'],
        dax: `Total fara ${badLbl} =\nCALCULATE ( [${TN}], ${cond} )`,
        plain: `Același total, dar fără rândurile cu ${R.status.col.name} = ${R.status.bad.join(' / ')}.`,
        hint: 'Pornești de la măsura de total și schimbi rândurile care intră în calcul. Funcția care face asta e CALCULATE.' });
      add({ id: 'rate', name: `Rata ${badLbl}`, fn: (rows) => rows.length ? rows.filter((r) => bad.has(r[sid])).length / rows.length : null, additive: false, fmt: 'pct', level: 2, deps: ['count'],
        dax: `Rata ${badLbl} =\nDIVIDE (\n    CALCULATE ( [Numar ${F}], ${condBad} ),\n    [Numar ${F}]\n)`,
        plain: `Ce procent din ${R.noun} au statusul ${R.status.bad.join(' / ')}.`,
        hint: 'Numărătorul e un CALCULATE pe numărul de rânduri; numitorul e numărul total. Formatează măsura ca procent (Measure tools → %).' });
    }
    if (R.qty && R.price && R.value) {
      const q = fid(R.qty), p = fid(R.price);
      add({ id: 'list', name: 'Valoare la pret lista', fn: (rows) => { let s = 0; rows.forEach((r) => { if (r[q] != null && r[p] != null) s += r[q] * r[p]; }); return s; }, additive: true, level: 2,
        dax: `Valoare la pret lista =\nSUMX ( ${F}, ${col(R.qty)} * ${col(R.price)} )`,
        plain: `Cât ar fi valorat ${R.noun} fără discount: ${R.qty.name} × ${R.price.name}, rând cu rând, apoi adunat.`,
        hint: 'Înmulțirea trebuie făcută pe fiecare rând înainte de adunare. SUM(…) * SUM(…) dă alt rezultat. Caută varianta „X” a lui SUM.' });
      const netId = R.net ? fid(R.net) : fid(R.value);
      add({ id: 'disc', name: 'Valoare discount', fn: (rows) => M.get('list').fn(rows) - sumOf(netId)(rows), additive: true, level: 2, deps: ['list'],
        dax: R.net ? `Valoare discount = [Valoare la pret lista] - SUM ( ${col(R.net)} )` : `Valoare discount = [Valoare la pret lista] - [${TN}]`,
        plain: 'Diferența dintre valoarea la preț de listă și valoarea efectiv facturată.', hint: 'O scădere între două măsuri.' });
    }
    // alte coloane numerice din fapte: suma lor, plus rapoarte utile (grad de ocupare, „pe bucată”, „pe rând”)
    const used = [R.value, R.qty, R.price, R.discount, R.net].filter(Boolean);
    const skip = /pct|procent|cota|pret|price|lat|lon|tva|^id|nr$/;
    const extras = m.fact.columns.filter((c) => c.role === 'measure' && !used.includes(c) && !skip.test(norm(c.name)));
    if (R.net && R.net !== R.value) extras.unshift(R.net);
    const capacity = extras.find((c) => /locuri|capacitate|capacity|disponibil/.test(norm(c.name)));
    extras.forEach((c) => {
      const id = 'sum_' + norm(c.name);
      add({ id, name: `Total ${c.name}`, extra: true, fn: sumOf(fid(c)), additive: true,
        dax: `Total ${c.name} = SUM ( ${col(c)} )`, plain: `Adună ${c.name}.`, hint: 'O singură funcție de agregare, pe coloana respectivă.' });
    });
    if (R.qty) {
      const qid = fid(R.qty);
      add({ id: 'qtyPer', name: `${R.qty.name} pe ${R.unit}`, extra: true, level: 2, deps: ['qty', 'count'],
        fn: (rows) => (rows.length ? sumOf(qid)(rows) / rows.length : null),
        dax: `${R.qty.name} pe ${R.unit} = DIVIDE ( [Total ${R.qty.name}], [Numar ${F}] )`,
        plain: `Media ${R.qty.name} pe ${R.unit}: totalul împărțit la numărul de rânduri.`, hint: 'DIVIDE între două măsuri.' });
      if (capacity) {
        const cid = fid(capacity);
        const ok = R.status ? (r) => !R.status.bad.includes(r[fid(R.status.col)]) : () => true;
        const cond = R.status ? `, ${col(R.status.col)} <> "${R.status.bad[0]}"` : '';
        add({ id: 'occ', name: 'Grad de ocupare', extra: true, fmt: 'pct', level: 2, deps: ['qty'],
          fn: (rows) => { const cap = sumOf(cid)(rows.filter(ok)); return cap ? sumOf(qid)(rows) / cap : null; },
          dax: `Grad de ocupare =\nDIVIDE (\n    [Total ${R.qty.name}],\n    CALCULATE ( SUM ( ${col(capacity)} )${cond} )\n)`,
          plain: `Cât din ${capacity.name} s-a ocupat: ${R.qty.name} împărțit la ${capacity.name}${R.status ? `, fără rândurile ${R.status.bad.join(' / ')}` : ''}.`,
          hint: 'Formatează măsura ca procent (Measure tools → %).' });
      }
      extras.filter((c) => c !== capacity).forEach((c) => {
        add({ id: 'per_' + norm(c.name), name: `${c.name} per ${R.qty.name}`, extra: true, level: 2, deps: ['qty'],
          fn: (rows) => { const q = sumOf(qid)(rows); return q ? sumOf(fid(c))(rows) / q : null; },
          dax: `${c.name} per ${R.qty.name} = DIVIDE ( [Total ${c.name}], [Total ${R.qty.name}] )`,
          plain: `${c.name} împărțit la ${R.qty.name}: cât revine, în medie, pe o unitate.`, hint: 'DIVIDE între două măsuri.' });
      });
    }
    if (m.time && m.time.year && m.time.date) {
      const yid = m.time.year;
      const dcol = m.fields.get(m.time.date);
      const totalFn = M.get('total').fn;
      add({ id: 'py', name: `${TN} an anterior`, additive: false, level: 3, deps: ['total'], timeShift: true,
        fn: (rows, ctx, g) => {
          if (!ctx || !g || g[yid] == null) return null;
          const keep = Object.keys(g).filter((k) => k !== yid);
          const base = ctx.rowsIgnoring([yid]).filter((r) => r[yid] === g[yid] - 1 && keep.every((k) => String(r[k]) === String(g[k])));
          return base.length ? totalFn(base) : null;
        },
        dax: `${TN} an anterior =\nCALCULATE ( [${TN}], SAMEPERIODLASTYEAR ( ${dcol.table}[${dcol.col}] ) )`,
        plain: 'Totalul pentru aceeași perioadă, cu un an în urmă.',
        hint: `Funcțiile de time intelligence cer un tabel de date marcat: Table tools → Mark as date table → ${dcol.table}[${dcol.col}].` });
      add({ id: 'target', name: 'Obiectiv', additive: false, level: 3, deps: ['py'],
        fn: (rows, ctx, g) => { const v = M.get('py').fn(rows, ctx, g); return v == null ? null : v * 1.1; },
        dax: `Obiectiv = [${TN} an anterior] * 1.1`, plain: 'Ținta: cu 10% peste anul anterior (o presupunere a ta, schimb-o dacă firma are altă țintă).', hint: 'O măsură poate înmulți o altă măsură cu un număr.' });
    }
  }

  /* ---------- interogări ---------- */
  const keyOf = (v) => (v == null ? '∅' : String(v));
  function applyFilters(rows, filters) {
    if (!filters || !filters.length) return rows;
    const fs = filters.filter((f) => f && f.field).map((f) => ({ id: f.field, op: f.op || 'in', set: new Set((f.values || []).map(keyOf)), min: f.min, max: f.max }));
    if (!fs.length) return rows;
    return rows.filter((r) => fs.every((f) => {
      const v = r[f.id];
      if (f.op === 'in') return f.set.has(keyOf(v));
      if (f.op === 'notin') return !f.set.has(keyOf(v));
      if (f.op === 'between') return v != null && (f.min == null || v >= f.min) && (f.max == null || v <= f.max);
      return true;
    }));
  }

  function makeCtx(m, filters) {
    const cache = new Map();
    return {
      model: m,
      filters: filters || [],
      rowsIgnoring(ids) {
        const k = ids.slice().sort().join('|');
        if (!cache.has(k)) cache.set(k, applyFilters(m.flat, (filters || []).filter((f) => !ids.includes(f.field))));
        return cache.get(k);
      }
    };
  }

  function compareValues(f, a, b) {
    if (f && f.sortKey) return f.sortKey(a) - f.sortKey(b);
    if (f && f.orderList) return f.orderList.indexOf(a) - f.orderList.indexOf(b);
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (a == null) return 1;
    if (b == null) return -1;
    return collator.compare(String(a), String(b));
  }
  const hasNaturalOrder = (f) => !!(f && (f.order === 'month' || f.order === 'weekday' || f.order === 'numeric' || f.order === 'natural' || f.order === 'list'));

  /** query: grupează rândurile filtrate după câmpuri și calculează măsuri */
  function query(m, q) {
    const by = q.by || [];
    const ctx = makeCtx(m, q.filters);
    const rows = applyFilters(m.flat, q.filters);
    const groups = new Map();
    rows.forEach((r) => {
      const keys = by.map((id) => r[id]);
      const k = keys.map(keyOf).join('§');
      let g = groups.get(k);
      if (!g) { g = { keys, rows: [] }; groups.set(k, g); }
      g.rows.push(r);
    });
    const meas = (q.measures || []).map((id) => m.measures.get(id)).filter(Boolean);
    const out = [...groups.values()].map((g) => {
      const gmap = {};
      by.forEach((id, i) => { gmap[id] = g.keys[i]; });
      const vals = {};
      meas.forEach((ms) => { vals[ms.id] = ms.fn(g.rows, ctx, gmap); });
      return { keys: g.keys, vals, n: g.rows.length };
    });
    const total = {};
    meas.forEach((ms) => { total[ms.id] = ms.fn(rows, ctx, {}); });
    return { groups: out, total, rows, ctx };
  }

  const distinctValues = (m, id) => {
    const f = m.fields.get(id);
    const set = new Set();
    m.flat.forEach((r) => set.add(r[id]));
    return [...set].sort((a, b) => compareValues(f, a, b));
  };

  const displayValue = (m, id, v) => {
    if (v == null) return '(Gol)';
    const f = m.fields.get(id);
    if (f && f.type === 'date') return fmtDate(v);
    return String(v);
  };

  /* ---------- formatare numere ---------- */
  const nf = (d) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: d, minimumFractionDigits: 0 });
  function fmtShort(v, fmt) {
    if (v == null || isNaN(v)) return '(Gol)';
    if (fmt === 'pct') return nf(1).format(v * 100) + '%';
    const a = Math.abs(v);
    if (a >= 1e9) return nf(2).format(v / 1e9) + ' mld.';
    if (a >= 1e6) return nf(2).format(v / 1e6) + 'M';
    if (a >= 1e4) return nf(1).format(v / 1e3) + 'K';
    if (a >= 100) return nf(0).format(v);
    return nf(2).format(v);
  }
  function fmtFull(v, fmt) {
    if (v == null || isNaN(v)) return '(Gol)';
    if (fmt === 'pct') return nf(1).format(v * 100) + '%';
    return nf(Math.abs(v) >= 1000 ? 0 : 2).format(v);
  }

  /* ---------- serializare compactă (pentru salvare) ---------- */
  const pack = (t) => ({ name: t.name, source: t.source, skipped: t.skipped, rowCount: t.rowCount, columns: t.columns.map((c) => ({ name: c.name, type: c.type, values: c.values, bad: c.bad || 0 })) });
  const unpack = (p) => ({ name: p.name, source: p.source, skipped: p.skipped || 0, rowCount: p.rowCount, columns: p.columns.map((c) => ({ name: c.name, type: c.type, values: c.values, bad: c.bad || 0 })) });

  A.Data = {
    readFile, buildModel, query, applyFilters, makeCtx, distinctValues, displayValue, compareValues, hasNaturalOrder,
    fmtShort, fmtFull, fmtDate, pack, unpack, norm, tokens, human, singular, plural, stripDia, keyOf,
    MONTH_SHORT, monthIndex, weekdayIndex
  };
})();
