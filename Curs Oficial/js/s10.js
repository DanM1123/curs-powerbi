/* Sesiunea 10 · Surse de date și rapoarte flexibile (companii aeriene)
   Widget-uri, pe rândurile din js/s10-fisier.js (fișierul combinat Rezervari_2025):
   - data-s10-tabs     pași cu butoane (matrix dinamic, pas cu pas)
   - data-s10-combine  folderul cu fișiere lunare → un singur tabel (Combine Files) + „fișier nou”
   - data-s10-pivot    matrix cu field parameters pe fișierul combinat (rânduri / coloane / valoare) */
(function () {
  'use strict';

  const nf0 = (n) => Math.round(n).toLocaleString('ro-RO');
  const nf1 = (n) => n.toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- pași cu butoane ---------- */
  document.querySelectorAll('[data-s10-tabs]').forEach((root) => {
    const btns = Array.from(root.querySelectorAll('[data-tab]'));
    const panes = Array.from(root.querySelectorAll('[data-pane]'));
    const show = (id) => {
      btns.forEach((b) => b.classList.toggle('is-on', b.dataset.tab === id));
      panes.forEach((p) => p.classList.toggle('is-on', p.dataset.pane === id));
    };
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
    show(btns[0].dataset.tab);
  });

  /* ---------- Combine Files ---------- */
  const FILE_ROWS = [532, 802, 939]; // T1–T3 2025, din folderul exemplului
  const T4_ROWS = 677;
  document.querySelectorAll('[data-s10-combine]').forEach((root) => {
    const files = FILE_ROWS.map((rows, i) => ({ name: 'Rezervari_2025_T' + (i + 1) + '.xlsx', rows: rows }));
    const filesEl = root.querySelector('[data-files]');
    const stageEl = root.querySelector('[data-stage]');
    const totalEl = root.querySelector('[data-total]');
    const listEl = root.querySelector('[data-list]');
    const playBtn = root.querySelector('[data-play]');
    const addBtn = root.querySelector('[data-add]');
    let timer = null;
    let added = false;

    const chip = (f, cls) => '<li class="s10-file ' + (cls || '') + '"><b>' + esc(f.name.replace(/\.xlsx$/, '')) + '</b><span>' + f.rows + '</span></li>';
    const draw = (upTo) => {
      const all = added ? files.concat([{ name: 'Rezervari_2025_T4.xlsx', rows: T4_ROWS, fresh: true }]) : files;
      filesEl.innerHTML = all.map((f, i) => chip(f, (i < upTo ? 'is-done ' : '') + (f.fresh ? 'is-new' : ''))).join('');
      const sum = all.slice(0, upTo).reduce((a, f) => a + f.rows, 0);
      totalEl.textContent = nf0(sum);
      const list = all.slice(0, upTo);
      listEl.innerHTML = list.length ? list.slice(-4).map((f) => '<tr><td>' + esc(f.name.replace(/\.xlsx$/, '')) + '</td><td class="num">+' + f.rows + '</td></tr>').join('') : '<tr><td colspan="2" class="s10-muted">Tabelul combinat e gol până apăsați „Rulează”.</td></tr>';
      stageEl.textContent = !upTo ? 'Folderul are ' + all.length + ' fișiere. Power Query nu a citit încă niciunul.'
        : upTo < all.length ? 'Se aplică funcția pe fișierul ' + upTo + ' din ' + all.length + ': citește, ia antetul, adaugă coloana Source.Name.'
        : 'Gata: ' + all.length + ' fișiere → un singur tabel cu ' + nf0(sum) + ' rânduri.';
    };
    const run = () => {
      clearInterval(timer);
      let k = 0;
      const total = files.length + (added ? 1 : 0);
      draw(0);
      timer = setInterval(() => { k++; draw(k); if (k >= total) clearInterval(timer); }, 380);
    };
    playBtn.addEventListener('click', run);
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        added = true;
        addBtn.disabled = true;
        draw(files.length);
        stageEl.textContent = 'Fișier nou în folder: Rezervari_2025_T4.xlsx. Încă nu apare în tabel. Apăsați „Reîmprospătează” (Refresh).';
        playBtn.textContent = 'Reîmprospătează (Refresh)';
      });
    }
    draw(0);
  });

  /* ---------- Matrix cu field parameters (fișierul combinat, 2025) ---------- */
  const F = window.S10_FISIER;
  const KEYS = Object.keys(F.dims);
  const POS = {};
  KEYS.forEach((k, i) => { POS[k] = i; });
  const N = KEYS.length; // după indecșii dimensiunilor: [confirmata 1/0, bilete, valoare, zile_avans, bagaj]
  const PIVOT_ROWS = [
    { id: 'companie', label: 'Companie' }, { id: 'tipCompanie', label: 'Tip companie' }, { id: 'ruta', label: 'Ruta' },
    { id: 'taraSosire', label: 'Țara destinație' }, { id: 'clasa', label: 'Clasa' }, { id: 'canal', label: 'Canal' },
    { id: 'tipCanal', label: 'Tip canal' }, { id: 'grupaVarsta', label: 'Grupa de vârstă' }, { id: 'nivelLoialitate', label: 'Nivel loialitate' }
  ];
  const PIVOT_COLS = [{ id: 'trimestru', label: 'Trimestru' }, { id: 'luna', label: 'Luna' }, { id: 'tipRuta', label: 'Tip rută' }];
  const PIVOT_VALS = [
    { id: 'bilete', label: 'Bilete', f: (a) => a.b, fmt: nf0 },
    { id: 'venit', label: 'Venit Rezervari (EUR)', f: (a) => a.v, fmt: nf0 },
    { id: 'pret', label: 'Pret Mediu Bilet (EUR)', f: (a) => (a.b ? a.v / a.b : null), fmt: nf1 },
    { id: 'zile', label: 'Zile Avans Mediu', f: (a) => (a.n ? a.z / a.n : null), fmt: nf1 },
    { id: 'bagaj', label: 'Venit Bagaj (EUR)', f: (a) => a.g, fmt: nf0 },
    { id: 'anulare', label: 'Rata Anulare %', f: (a) => (a.n ? a.c / a.n * 100 : null), fmt: (n) => nf1(n) + '%' }
  ];

  document.querySelectorAll('[data-s10-pivot]').forEach((root) => {
    const sel = (name, opts) => {
      const el = root.querySelector('[data-sel="' + name + '"]');
      el.innerHTML = opts.map((o) => '<option value="' + o.id + '">' + o.label + '</option>').join('');
      return el;
    };
    const rowSel = sel('rows', PIVOT_ROWS);
    const colSel = sel('cols', PIVOT_COLS);
    const valSel = sel('vals', PIVOT_VALS);
    colSel.value = 'trimestru';
    valSel.value = 'bilete';
    const out = root.querySelector('[data-out]');
    const codeEl = root.querySelector('[data-code]');
    const noteEl = root.querySelector('[data-note]');

    const render = () => {
      const rowDim = rowSel.value;
      const colDim = colSel.value;
      const val = PIVOT_VALS.find((v) => v.id === valSel.value);
      const rowLbl = PIVOT_ROWS.find((r) => r.id === rowDim).label;
      const colLbl = PIVOT_COLS.find((c) => c.id === colDim).label;
      const acc = {};
      F.rows.forEach((row) => {
        const k = row[POS[rowDim]] + '|' + row[POS[colDim]];
        const a = (acc[k] = acc[k] || { n: 0, c: 0, b: 0, v: 0, z: 0, g: 0 });
        a.n += 1;
        a.z += row[N + 3];
        if (row[N]) { a.b += row[N + 1]; a.v += row[N + 2]; a.g += row[N + 4]; } else { a.c += 1; }
      });
      const rows = F.dims[rowDim];
      const cols = F.dims[colDim];
      let h = '<table class="s10-tbl"><thead><tr><th>' + rowLbl + ' \\ ' + colLbl + '</th>' + cols.map((c) => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>';
      rows.forEach((rl, ri) => {
        h += '<tr><th>' + esc(rl) + '</th>' + cols.map((_, ci) => {
          const a = acc[ri + '|' + ci];
          const v = a ? val.f(a) : null;
          return '<td class="num">' + (v === null || v === undefined ? '' : val.fmt(v)) + '</td>';
        }).join('') + '</tr>';
      });
      out.innerHTML = h + '</tbody></table>';
      codeEl.innerHTML = '<span class="k">Rows</span> ← <span class="t">' + esc(rowLbl) + '</span>   <span class="k">Columns</span> ← <span class="t">' + esc(colLbl) + '</span>   <span class="k">Values</span> ← <span class="t">' + esc(val.label) + '</span>';
      noteEl.textContent = rows.length + ' rânduri × ' + cols.length + ' coloane. Sursă: Rezervari_2025 (2.950 de rezervări).';
    };
    [rowSel, colSel, valSel].forEach((el) => el.addEventListener('change', render));
    render();
  });
})();
