/* Sesiunea 12 · Imagini în Power BI
   - data-s12-cinema          pagina despre filme: afișe, carduri, grafic evidențiat
   - data-s12-posters         rândul de afișe din tabelul Dim_Filme
   - data-s12-drill           drillthrough: graficul festivalului → Fișa filmului
   Recapitularea e în s12-recap.js. */
(function () {
  /* ---------- filmele ---------- */
  const D = window.S12_DATE;
  if (!D) return;
  const F = D.filme;
  const byId = Object.fromEntries(F.map((f) => [f.ID_Film, f]));
  const fest = {};
  D.proiectii.forEach(([id, , , loc, bil, pret]) => {
    const x = fest[id] || (fest[id] = { n: 0, loc: 0, bil: 0, ron: 0 });
    x.n += 1; x.loc += loc; x.bil += bil; x.ron += bil * pret;
  });
  const nf = (v, d) => v.toLocaleString('ro-RO', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const money = (m) => m >= 1000 ? nf(m / 1000, 2) + ' mld $' : nf(m, m < 20 ? 1 : 0) + ' mil $';

  // rândul de afișe din slide-ul cu tabelul
  document.querySelectorAll('[data-s12-posters]').forEach((root) => {
    const ids = root.dataset.s12Posters.split(',');
    root.innerHTML = '<table class="s12-tbl"><thead><tr><th>ID_Film</th><th>Titlu</th><th>An</th><th>Poster_URL</th><th>Afiș (Image URL)</th></tr></thead><tbody>' +
      ids.map((id) => { const f = byId[id]; return '<tr><td>' + f.ID_Film + '</td><td>' + f.Titlu + '</td><td>' + f.An + '</td><td class="s12-url">' + f.Poster_URL.replace('https://', '') + '</td><td><img src="' + f.Poster_URL + '" alt="Afișul filmului ' + f.Titlu + '" loading="lazy"></td></tr>'; }).join('') +
      '</tbody></table>';
  });

  // pagina „Filmul zilei”
  document.querySelectorAll('[data-s12-cinema]').forEach((root) => {
    let sel = 'F06';
    const sorted = F.slice().sort((a, b) => b.Incasari_Mil_USD - a.Incasari_Mil_USD);
    const max = sorted[0].Incasari_Mil_USD;
    root.innerHTML =
      '<div class="s12-pbi">' +
        '<div class="s12-pbi-bar"><span></span><b>Festivalul Retro &amp; Blockbuster · Filmul ales</b><small>Cinema Lumière</small></div>' +
        '<div class="s12-pbi-grid">' +
          '<div class="s12-pane s12-strip"><small>Tabel cu Poster_URL · click pe afiș = filtru</small><div class="s12-strip-in" data-strip></div></div>' +
          '<div class="s12-pane s12-hero"><small>Tabel cu măsura [Afis selectat]</small><img data-poster alt=""></div>' +
          '<div class="s12-side">' +
            '<div class="s12-pane s12-info" data-info></div>' +
            '<div class="s12-kpis" data-kpis></div>' +
          '</div>' +
          '<div class="s12-pane s12-chart"><small>Încasări mondiale pe filme · bar chart, evidențiat de click</small><div data-bars></div></div>' +
        '</div>' +
      '</div>';
    const strip = root.querySelector('[data-strip]');
    strip.innerHTML = F.map((f) => '<button type="button" data-id="' + f.ID_Film + '" title="' + f.Titlu + '"><img src="' + f.Poster_URL + '" alt="' + f.Titlu + '"></button>').join('');
    const bars = root.querySelector('[data-bars]');
    bars.innerHTML = sorted.map((f) => '<div class="s12-bar" data-id="' + f.ID_Film + '"><span>' + f.Titlu_RO + '</span><i style="width:' + (f.Incasari_Mil_USD / max * 100).toFixed(1) + '%"></i><b>' + money(f.Incasari_Mil_USD) + '</b></div>').join('');

    function render() {
      const f = byId[sel];
      const x = fest[sel] || { n: 0, loc: 0, bil: 0, ron: 0 };
      strip.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', b.dataset.id === sel));
      bars.querySelectorAll('.s12-bar').forEach((b) => b.classList.toggle('is-on', b.dataset.id === sel));
      const img = root.querySelector('[data-poster]');
      img.src = f.Poster_URL;
      img.alt = 'Afișul filmului ' + f.Titlu;
      root.querySelector('[data-info]').innerHTML =
        '<small>Card cu detaliile filmului</small><h3>' + f.Titlu_RO + '</h3><p class="s12-orig">' + f.Titlu + ' · ' + f.An + ' · ' + f.Gen + ' · ' + f.Durata_Min + ' min</p>' +
        '<p class="s12-dir">Regia: <strong>' + f.Regizor + '</strong></p><p>' + f.Descriere + '</p>';
      const roi = f.Incasari_Mil_USD / f.Buget_Mil_USD;
      root.querySelector('[data-kpis]').innerHTML = [
        ['Buget', money(f.Buget_Mil_USD), ''],
        ['Încasări mondiale', money(f.Incasari_Mil_USD), 'de ' + nf(roi, 1) + ' ori bugetul'],
        ['Nota IMDb', nf(f.Nota_IMDb, 1), f.Oscaruri ? f.Oscaruri + (f.Oscaruri === 1 ? ' Oscar' : ' Oscaruri') : 'fără Oscar'],
        ['Bilete la festival', nf(x.bil), x.n + (x.n === 1 ? ' proiecție' : ' proiecții') + ' · ' + nf(x.loc ? x.bil / x.loc * 100 : 0) + '% ocupare']
      ].map((k) => '<div class="s12-pane s12-kpi"><small>' + k[0] + '</small><b>' + k[1] + '</b><em>' + k[2] + '</em></div>').join('');
    }
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-id]');
      if (!b) return;
      sel = b.dataset.id;
      render();
    });
    render();
  });

  // drillthrough: pagina festivalului → Fișa filmului
  document.querySelectorAll('[data-s12-drill]').forEach((root) => {
    const sorted = F.filter((f) => fest[f.ID_Film]).sort((a, b) => fest[b.ID_Film].bil - fest[a.ID_Film].bil);
    const max = fest[sorted[0].ID_Film].bil;
    const zi = (d) => d.slice(8, 10) + '.' + d.slice(5, 7);
    root.innerHTML =
      '<div class="s12-pbi s12-drill">' +
        '<div class="s12-pbi-bar"><span></span><b data-title>Festivalul Retro &amp; Blockbuster · Program</b><small>Cinema Lumière</small></div>' +
        '<div class="s12-drill-list" data-list><div class="s12-pane"><small>Bar chart · Titlu_RO pe axă, suma Bilete_Vandute · click dreapta pe o bară</small><div class="s12-drill-bars">' +
          sorted.map((f) => '<button type="button" class="s12-dbar" data-id="' + f.ID_Film + '"><span>' + f.Titlu_RO + '</span><i style="width:' + (fest[f.ID_Film].bil / max * 100).toFixed(1) + '%"></i><b>' + nf(fest[f.ID_Film].bil) + '</b></button>').join('') +
        '</div></div></div>' +
        '<div class="s12-drill-page" data-page hidden></div>' +
        '<div class="s12-drill-menu" data-menu hidden><span>Include</span><span>Exclude</span><button type="button" data-go>Drill through <em>›</em> <b>Fișa filmului</b></button></div>' +
      '</div>';
    const list = root.querySelector('[data-list]'), page = root.querySelector('[data-page]'), menu = root.querySelector('[data-menu]');
    const box = root.querySelector('.s12-drill');
    let sel = null;

    function openMenu(e, id) {
      e.preventDefault();
      sel = id;
      const r = box.getBoundingClientRect();
      menu.hidden = false;
      menu.style.left = Math.min(e.clientX - r.left, r.width - menu.offsetWidth - 8) + 'px';
      menu.style.top = (e.clientY - r.top) + 'px';
    }
    function showPage() {
      const f = byId[sel], x = fest[sel];
      const rows = D.proiectii.filter((p) => p[0] === sel).sort((a, b) => a[1].localeCompare(b[1]));
      root.querySelector('[data-title]').textContent = 'Fișa filmului';
      page.innerHTML =
        '<div class="s12-drill-top"><button type="button" class="s12-drill-back" data-back title="Back">←</button><span class="s12-drill-chip">Drill through · Titlu_RO este <b>' + f.Titlu_RO + '</b></span></div>' +
        '<div class="s12-drill-grid">' +
          '<div class="s12-pane s12-drill-poster"><small>[Afis selectat]</small><img src="' + f.Poster_URL + '" alt="Afișul filmului ' + f.Titlu + '"></div>' +
          '<div class="s12-drill-right">' +
            '<div class="s12-kpis s12-drill-kpis">' + [
              ['Bilete vândute', nf(x.bil), x.n + (x.n === 1 ? ' proiecție' : ' proiecții')],
              ['Ocupare', nf(x.bil / x.loc * 100) + '%', nf(x.loc - x.bil) + ' locuri goale'],
              ['Încasări festival', nf(x.ron) + ' RON', 'bilete × preț']
            ].map((k) => '<div class="s12-pane s12-kpi"><small>' + k[0] + '</small><b>' + k[1] + '</b><em>' + k[2] + '</em></div>').join('') + '</div>' +
            '<div class="s12-pane"><small>Table din Fact_Proiectii</small><table class="s12-tbl"><thead><tr><th>Data</th><th>Sala</th><th>Locuri</th><th>Bilete</th><th>Ocupare</th></tr></thead><tbody>' +
              rows.map((p) => '<tr><td>' + zi(p[1]) + '</td><td>' + p[2] + '</td><td>' + p[3] + '</td><td>' + p[4] + '</td><td>' + nf(p[4] / p[3] * 100) + '%</td></tr>').join('') +
            '</tbody></table></div>' +
          '</div>' +
        '</div>';
      list.hidden = true; page.hidden = false; menu.hidden = true;
    }
    function back() {
      root.querySelector('[data-title]').textContent = 'Festivalul Retro & Blockbuster · Program';
      page.hidden = true; list.hidden = false;
    }
    root.addEventListener('contextmenu', (e) => { const b = e.target.closest('.s12-dbar'); if (b) openMenu(e, b.dataset.id); });
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-go]')) { showPage(); return; }
      if (e.target.closest('[data-back]')) { back(); return; }
      const b = e.target.closest('.s12-dbar');
      if (b) { openMenu(e, b.dataset.id); return; }
      menu.hidden = true;
    });
  });
})();
