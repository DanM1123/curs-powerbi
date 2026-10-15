/* ==========================================================================
   Atelier de raport · dosarul afacerii: rețeaua de cinematografe
   Un dosar de piață, în stilul unei analize de business: afacerea pe o pagină,
   industria, cum se împart banii, anatomia unei proiecții, indicatorii,
   rețeaua, oferta, programul, publicul și dicționarul termen ↔ coloană.
   Cifrele din date sunt doar descriptive (câte, ce, cât costă un bilet);
   concluziile despre vânzări rămân pentru Power BI. Informațiile despre
   industrie sunt generale, cu scop didactic.
   ========================================================================== */
(function () {
  'use strict';

  const A = (window.Atelier = window.Atelier || {});
  A.Briefs = A.Briefs || [];

  A.Briefs.push({
    id: 'cinema',
    match: (m, D) => m.tables.some((t) => /film/.test(D.norm(t.name))) && m.tables.some((t) => /cinema/.test(D.norm(t.name))) && !m.tables.some((t) => /spectator/.test(D.norm(t.name))),
    render(m, h) {
      const { D, esc, icon } = h;
      const nf = (n) => Number(n).toLocaleString('ro-RO');
      const lei = (v) => `${D.fmtFull(v)} lei`;
      const T = (re) => m.tables.find((t) => re.test(D.norm(t.name)));
      const C = (t, re) => (t ? t.columns.find((c) => re.test(D.norm(c.name))) : null);
      const vals = (c) => (c ? c.values : []);
      const uniq = (a) => [...new Set(a.filter((v) => v != null).map(String))];
      const F = m.fact, cin = T(/cinema/), film = T(/film/), actor = T(/actor/);

      // ---------- ce spun datele, descriptiv ----------
      const cinName = vals(C(cin, /^nume/)), cinCity = vals(C(cin, /^oras$/)), cinReg = vals(C(cin, /^regiune/)), cinType = vals(C(cin, /^tip/)), cinRooms = vals(C(cin, /sali/)), cinSeats = vals(C(cin, /locuri/));
      const brand = (cinName[0] || 'Rețeaua').split(' ')[0];
      const cities = uniq(cinCity), regions = uniq(cinReg);
      const rooms = cinRooms.reduce((s, v) => s + (+v || 0), 0);
      const seatsTot = cinSeats.reduce((s, v) => s + (+v || 0), 0);
      const types = uniq(cinType).map((x) => ({ x, n: cinType.filter((y) => y === x).length, rooms: cinRooms.filter((_, i) => cinType[i] === x).reduce((s, v) => s + (+v || 0), 0) }));
      const fGen = vals(C(film, /^gen$/)), fDist = vals(C(film, /^distribuitor/)), fCota = vals(C(film, /cota/)), fTitle = vals(C(film, /^titlu/));
      const genres = uniq(fGen).map((g) => ({ g, n: fGen.filter((x) => x === g).length })).sort((a, b) => b.n - a.n);
      const dists = uniq(fDist).map((d) => { const idx = fDist.map((x, i) => (x === d ? i : -1)).filter((i) => i >= 0); return { d, n: idx.length, cota: fCota[idx[0]], genres: uniq(idx.map((i) => fGen[i])) }; });
      const ORD = ['AG', 'AP-12', 'N-15', 'IM-18'];
      const classes = uniq(vals(C(film, /clasific/))).sort((a, b) => (ORD.indexOf(a) + 1 || 9) - (ORD.indexOf(b) + 1 || 9));
      const nFilms = film ? film.rowCount : 0, nActors = actor ? actor.rowCount : 0;
      const fc = (re) => C(F, re);
      const fmt = fc(/^format$/), price = fc(/^pret/), seats = fc(/locuri/), start = fc(/^ora/), slot = fc(/interval/), disc = fc(/discount/), week = fc(/saptamana/);
      const formats = uniq(vals(fmt)).map((f) => {
        const idx = vals(fmt).map((v, i) => (v === f ? i : -1)).filter((i) => i >= 0);
        const s = idx.map((i) => vals(seats)[i]).filter((v) => v != null);
        return { f, price: vals(price)[idx[0]], lo: Math.min(...s), hi: Math.max(...s) };
      }).sort((a, b) => a.price - b.price);
      const slots = ['Matineu', 'Dupa-amiaza', 'Seara', 'Noapte'].filter((s) => vals(slot).includes(s)).map((s) => ({ s, hours: uniq(vals(start).filter((_, i) => vals(slot)[i] === s)).sort() }));
      const discounts = uniq(vals(disc).filter((v) => v > 0));
      const weeks = uniq(vals(week)).map(Number).sort((a, b) => a - b);
      const dates = (m.time && m.time.date) ? m.flat.map((r) => r[m.time.date]).filter((v) => v != null) : [];
      const d0 = dates.length ? D.fmtDate(Math.min(...dates)) : '', d1 = dates.length ? D.fmtDate(Math.max(...dates)) : '';
      const cotaAvg = fCota.length ? Math.round(fCota.reduce((s, v) => s + (+v || 0), 0) / fCota.length) : 50;
      const midFmt = formats.find((x) => x.f === '3D') || formats[1] || formats[0] || { f: '2D', price: 30 };

      // un rând real din tabelul de proiecții, pentru „anatomia unei proiecții”
      const fcol = (re) => { const c = fc(re); return c ? m.fieldId(F.name, c.name) : null; };
      const id = { film: m.R.productName, cin: m.R.locationName, week: fcol(/saptamana/), start: fcol(/^ora/), slot: fcol(/interval/), sala: fcol(/^sala$/), fmt: fcol(/^format$/), seats: fcol(/locuri/), sold: fcol(/bilete/), price: fcol(/^pret/), inc: fcol(/incasaribilete/), bar: fcol(/incasaribar/), tot: fcol(/incasaritotale/), date: m.time && m.time.date };
      const row = m.flat.find((r) => r[id.sold] > 20 && r[id.bar] > 0 && r[id.fmt] !== '2D') || m.flat[0];
      const rv = (k) => (id[k] && row ? row[id[k]] : null);
      const occ = rv('seats') ? rv('sold') / rv('seats') : 0;

      const SLOT_TXT = { Matineu: 'Matineu', 'Dupa-amiaza': 'După-amiază', Seara: 'Seară', Noapte: 'Noapte' };
      const SLOT_WHO = { Matineu: 'familii cu copii, pensionari, școli', 'Dupa-amiaza': 'elevi, studenți, familii în weekend', Seara: 'adulți după program, cupluri, grupuri de prieteni', Noapte: 'tineri, fani de horror și thriller' };
      const FMT_TXT = { '2D': 'proiecția standard, în orice sală', '3D': 'ochelari 3D, preferat la animație și aventură', IMAX: 'ecran uriaș și sunet puternic, pentru filmele-eveniment', VIP: 'fotolii reglabile, servire la loc, săli mici' };
      const TYPE_TXT = { Multiplex: 'Multe săli într-un mall. Rulează mai multe filme deodată și are formatele premium.', Boutique: 'Puține săli, în centrul orașului. Atmosferă de cinema de cartier, public fidel.', 'Drive-in': 'Ecran în aer liber, văzut din mașină. Doar în sezonul cald, seara.' };
      const CLS_TXT = { AG: 'acord general, toată familia', 'AP-12': 'acordul părinților sub 12 ani', 'N-15': 'nerecomandat sub 15 ani', 'IM-18': 'interzis sub 18 ani' };

      // ---------- piese de interfață ----------
      const tile = (lbl, v, sub, note, tone) => `<div class="ub-tile${tone ? ' t-' + tone : ''}"><span class="ub-tile-l">${esc(lbl)}</span><b>${esc(v)}</b><span class="ub-tile-s">${esc(sub)}</span>${note ? `<small>${esc(note)}</small>` : ''}</div>`;
      const kv = (title, rows) => `<div class="ub-panel"><h4>${esc(title)}</h4>${rows.map(([k, v]) => `<div class="ub-kv"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`;
      const note = (tone, title, text) => `<div class="ub-note n-${tone}"><b>${esc(title)}</b><p>${text}</p></div>`;
      const rel = (items) => `<div class="ub-rel"><h4>${icon('target')} Relevanță pentru raportul tău</h4>${items.map((t) => `<p>${icon('check')}<span>${t}</span></p>`).join('')}</div>`;
      const table = (head, rows) => `<div class="ub-table"><table><thead><tr>${head.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="b"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      const sec = (sid, ic, num, title, lead, body, tone) => `<section class="ub-sec${tone ? ' s-' + tone : ''}" id="ub-${sid}"><div class="ub-sec-h"><span class="ub-num">${num}</span><div><h3>${icon(ic)}${esc(title)}</h3>${lead ? `<p>${lead}</p>` : ''}</div></div>${body}</section>`;
      const code = (c) => `<code>${esc(c)}</code>`;
      const TOC = [['rez', 'Afacerea pe o pagină'], ['ind', 'Indicatori-cheie'], ['ind2', 'Cum funcționează industria'], ['bani', 'Cum se împart banii'], ['anat', 'Anatomia unei proiecții'], ['kpi', 'Ce măsoară un director'], ['retea', 'Rețeaua'], ['oferta', 'Oferta: filme și formate'], ['program', 'Programul și viața unui film'], ['public', 'Publicul'], ['dict', 'Dicționar: termeni și coloane'], ['limite', 'Ce nu găsești în date']];

      // cum se împart banii dintr-un bilet: cota distribuitorului vs. ce rămâne cinematografului
      const tick = midFmt.price, toDist = tick * cotaAvg / 100, toCin = tick - toDist, barAvg = 15;
      const split = `<div class="ub-split">
          <div class="ub-split-row"><span class="ub-split-l">Un bilet ${esc(midFmt.f)} de ${lei(tick)}</span>
            <div class="ub-split-bar"><i class="is-dist" style="flex:${toDist}"><b>${lei(toDist)}</b><em>distribuitorul (~${cotaAvg}%)</em></i><i class="is-cin" style="flex:${toCin}"><b>${lei(toCin)}</b><em>cinematograful</em></i></div></div>
          <div class="ub-split-row"><span class="ub-split-l">Popcorn și băutură, ~${lei(barAvg)}</span>
            <div class="ub-split-bar" style="width:${Math.round((barAvg / tick) * 100)}%"><i class="is-cin" style="flex:1"><b>${lei(barAvg)}</b><em>rămân aproape integral cinematografului</em></i></div></div>
          <p class="ub-split-note">Din ${lei(tick + barAvg)} plătiți de un spectator, cinematograful păstrează cam ${lei(toCin + barAvg)}. Barul aduce mai puțini bani decât biletul, dar o parte mult mai mare din ce rămâne.</p>
        </div>`;

      return `<div class="atl-wrap ub">
        <header class="ub-hero">
          <span class="ub-kicker">${icon('book')} Dosarul afacerii</span>
          <h2>${esc(brand)} · analiza afacerii și a pieței</h2>
          <p>Din această săptămână conduci rețeaua de cinematografe ${esc(brand)}. Dosarul îți explică industria, cum câștigă bani un cinematograf, ce urmărește un director și ce conțin datele primite. Cifrele descriu afacerea; ce merge bine sau prost vei afla abia în Power BI.</p>
        </header>

        <nav class="ub-toc"><h4>${icon('table')} Cuprins</h4><div>${TOC.map(([sid, l], i) => `<button data-u-goto="ub-${sid}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(l)}</button>`).join('')}</div></nav>

        ${sec('rez', 'sparkle', '01', 'Afacerea pe o pagină', 'Trei idei de reținut înainte de orice altceva.', `
          <div class="ub-cols ub-cols-3">
            <div class="ub-big"><span>Ce vinde</span><b>Locuri la o proiecție</b><p>Un film, într-o sală, la o oră. Fiecare proiecție are un număr fix de locuri; ce nu se vinde e pierdut.</p></div>
            <div class="ub-big"><span>Din ce câștigă</span><b>Bilete + bar</b><p>Din bilet, o parte importantă merge la distribuitorul filmului. Barul rămâne aproape în întregime al cinematografului.</p></div>
            <div class="ub-big"><span>Ce urmărește</span><b>Spectatori și săli pline</b><p>Câți oameni intră, cât de plină e sala, cât lasă fiecare spectator la bilet și la bar.</p></div>
          </div>
        `, 'green')}

        ${sec('ind', 'coins', '02', 'Indicatori-cheie ai afacerii', 'Ce conține rețeaua și ce acoperă datele.', `
          <div class="ub-tiles">
            ${tile('Rețeaua', nf(cinName.length), 'cinematografe', `${cities.length} orașe · ${regions.length} regiuni`)}
            ${tile('Capacitate', nf(rooms), 'săli de proiecție', seatsTot ? `${nf(seatsTot)} locuri în total` : types.map((t) => t.n + ' ' + t.x.toLowerCase()).join(' · '))}
            ${tile('Program', nf(nFilms), 'filme', `${genres.length} genuri · ${dists.length} distribuitori`)}
            ${tile('Formate', nf(formats.length), 'tipuri de proiecție', formats.map((x) => x.f).join(' · '), 'violet')}
            ${tile('Activitate', nf(F.rowCount), 'proiecții înregistrate', d0 ? `${d0} – ${d1}` : '', 'violet')}
            ${tile('Distribuții', nf(nActors), 'actori principali', 'colegii tăi de curs', 'violet')}
          </div>
        `)}

        ${sec('ind2', 'link', '03', 'Cum funcționează industria', `Un film trece prin trei mâini până ajunge pe ecran. ${esc(brand)} este ultima verigă: <b>exploatantul</b>, cel care deține sălile și vinde biletele.`, `
          <div class="ub-chain">
            <div><span class="ub-chain-n">1</span><b>Producătorul</b><span>face filmul: buget, regizor, actori</span></div>
            <i>${icon('arrow')}</i>
            <div><span class="ub-chain-n">2</span><b>Distribuitorul</b><span>cumpără drepturile și închiriază filmul cinematografelor, pentru o cotă din bilete</span></div>
            <i>${icon('arrow')}</i>
            <div class="is-us"><span class="ub-chain-n">3</span><b>Cinematograful · ${esc(brand)}</b><span>programează filmul, vinde bilete și produse de la bar</span></div>
            <i>${icon('arrow')}</i>
            <div><span class="ub-chain-n">4</span><b>Spectatorul</b><span>alege filmul, ora și formatul</span></div>
          </div>
          <div class="ub-cols">
            <div class="ub-panel"><h4>Ce lucrează în favoarea unui cinematograf</h4>
              ${note('green', 'Experiența nu se poate copia acasă', 'Ecranul mare, sunetul, IMAX-ul și sălile VIP sunt motivul pentru care oamenii plătesc un bilet în loc să aștepte filmul pe streaming.')}
              ${note('green', 'Barul, a doua sursă de venit', 'Popcornul și băuturile au o marjă mult mai mare decât biletul și nu se împart cu distribuitorul.')}
            </div>
            <div class="ub-panel"><h4>La ce trebuie să fie atent</h4>
              ${note('amber', 'Depinde de filmele lansate', 'Cinematograful nu face filmele. Un an cu lansări slabe înseamnă săli goale, oricât de bine e condusă rețeaua.')}
              ${note('amber', 'Locurile goale nu se recuperează', 'Un loc nevândut la proiecția de la 11:00 e pierdut. De aceea contează programul, prețurile și reducerile.')}
            </div>
          </div>
          ${rel(['Datele tale sunt despre a treia verigă: ce s-a întâmplat în sălile ' + esc(brand) + '.', 'Întrebările bune pentru raport sunt cele pe care cinematograful le poate influența: programul, formatele, prețurile, locațiile.'])}
        `, 'blue')}

        ${sec('bani', 'coins', '04', 'Cum se împart banii', 'Încasările nu sunt toate ale cinematografului.', `
          ${split}
          <div class="ub-cols">
            <div class="ub-panel"><h4>Prețul biletului, pe format</h4>
              ${table(['Format', 'Preț de listă', 'Ce oferă'], formats.map((x) => [esc(x.f), lei(x.price), esc(FMT_TXT[x.f] || '')]))}
              ${discounts.length ? `<p class="ub-p ub-mt">Marțea, biletele au o reducere de ${esc(discounts.join('%, '))}%, ca să umple sălile într-o zi liniștită. Prețul de listă nu e mereu ce plătește spectatorul.</p>` : ''}
            </div>
            <div class="ub-panel"><h4>Distribuitorii și cota lor</h4>
              ${table(['Distribuitor', 'Genuri', 'Cotă din bilete'], dists.map((d) => [esc(d.d), esc(d.genres.join(', ')), `${esc(String(d.cota))}%`]))}
              <p class="ub-p ub-mt">Cota e procentul din încasările din bilete pe care cinematograful îl dă distribuitorului. Filmele mari cer o cotă mai mare.</p>
            </div>
          </div>
          ${rel(['Încasările au două componente. Un raport bun le arată separat: biletele spun cât de atractiv e filmul, barul cât valorează fiecare spectator.', `Cu ${code('Cota_Distribuitor_Pct')} poți calcula cât rămâne cinematografului din bilete, nu doar cât a încasat.`])}
        `, 'green')}

        ${sec('anat', 'table', '05', 'Anatomia unei proiecții', 'Un singur rând din tabelul de fapte, citit ca un manager. Fiecare câmp răspunde la o întrebare.', `
          <div class="ub-ticket">
            <div class="ub-ticket-main">
              <span class="ub-ticket-k">Proiecție · ${esc(rv('date') ? D.fmtDate(rv('date')) : '')} · ${esc(rv('start') || '')}</span>
              <b>${esc(rv('film') || '')}</b>
              <span>${esc(rv('cin') || '')} · ${esc(rv('sala') || '')} · ${esc(rv('fmt') || '')}</span>
              <div class="ub-occ"><div><i style="width:${Math.round(occ * 100)}%"></i></div><span>${nf(rv('sold') || 0)} bilete din ${nf(rv('seats') || 0)} locuri · sala plină ${Math.round(occ * 100)}%</span></div>
            </div>
            <div class="ub-ticket-side">
              <div class="ub-kv"><span>Bilete (${lei(rv('price') || 0)} / bilet)</span><b>${lei(rv('inc') || 0)}</b></div>
              <div class="ub-kv"><span>Bar</span><b>${lei(rv('bar') || 0)}</b></div>
              <div class="ub-kv is-total"><span>Total proiecție</span><b>${lei(rv('tot') || 0)}</b></div>
            </div>
          </div>
          ${table(['Întrebarea', 'Răspunsul din rând', 'De unde vine'], [
            ['Ce film?', esc(rv('film') || ''), `${code('ID_Film')} → Dim_Filme`],
            ['Unde?', esc(rv('cin') || ''), `${code('ID_Cinema')} → Dim_Cinematografe`],
            ['Când?', esc(`${rv('date') ? D.fmtDate(rv('date')) : ''}, ${SLOT_TXT[rv('slot')] || rv('slot') || ''}`), `${code('ID_Date')} → Dim_Date, ${code('Interval_Orar')}`],
            ['Cât de nou e filmul?', esc(`săptămâna ${rv('week') || '?'} de la premieră`), code('Saptamana_Rulare')],
            ['Cât de plină a fost sala?', esc(`${nf(rv('sold') || 0)} din ${nf(rv('seats') || 0)}`), `${code('Bilete_Vandute')}, ${code('Locuri_Disponibile')}`],
            ['Cât s-a încasat?', esc(lei(rv('tot') || 0)), `${code('Incasari_Bilete')} + ${code('Incasari_Bar')}`]
          ])}
          ${rel(['Un rând e un eveniment mic. Raportul adună sute de astfel de rânduri și le privește din unghiuri diferite: pe filme, pe săli, pe ore, pe săptămâni.'])}
        `, 'violet')}

        ${sec('kpi', 'target', '06', 'Ce măsoară un director de cinematograf', 'Indicatorii folosiți în industrie și coloanele din care îi calculezi în Power BI.', `
          ${table(['Indicator', 'Ce spune', 'Cum se calculează', 'Din coloanele'], [
            ['Spectatori', 'câți oameni au intrat în sală', 'suma biletelor vândute', code('Bilete_Vandute')],
            ['Grad de ocupare', 'cât de plină a fost sala', 'bilete vândute ÷ locuri disponibile', `${code('Bilete_Vandute')}, ${code('Locuri_Disponibile')}`],
            ['Preț mediu pe bilet', 'cât plătește, de fapt, un spectator', 'încasări bilete ÷ bilete vândute', `${code('Incasari_Bilete')}, ${code('Bilete_Vandute')}`],
            ['Cheltuiala la bar pe spectator', 'cât cumpără un om de la bar', 'încasări bar ÷ bilete vândute', `${code('Incasari_Bar')}, ${code('Bilete_Vandute')}`],
            ['Venit rămas din bilete', 'ce păstrează cinematograful după distribuitor', 'încasări bilete × (1 − cotă)', `${code('Incasari_Bilete')}, ${code('Cota_Distribuitor_Pct')}`],
            ['Încasări pe proiecție', 'cât aduce, în medie, o proiecție', 'încasări totale ÷ număr de proiecții', code('Incasari_Totale')],
            ['Rata de anulare', 'câte proiecții nu au mai avut loc', 'proiecții anulate ÷ toate proiecțiile', code('Status_Proiectie')]
          ])}
          ${rel(['Niciunul dintre acești indicatori nu e o coloană gata făcută: îi scrii ca măsuri DAX. Gradul de ocupare și prețul mediu sunt raporturi, deci nu se adună: se calculează din sume.'])}
        `, 'violet')}

        ${sec('retea', 'pin', '07', 'Rețeaua: unde se află sălile', `${nf(cinName.length)} cinematografe în ${nf(cities.length)} orașe, de trei tipuri diferite.`, `
          <div class="ub-cols ub-cols-3">${types.map((t) => `<div class="ub-panel ub-type"><h4>${esc(t.x)}</h4><b>${nf(t.n)} ${t.n === 1 ? 'locație' : 'locații'} · ${nf(t.rooms)} ${t.rooms === 1 ? 'ecran' : 'săli'}</b><p>${esc(TYPE_TXT[t.x] || '')}</p></div>`).join('')}</div>
          ${table(['Cinematograf', 'Oraș', 'Regiune', 'Tip', 'Săli', 'Locuri'], cinName.map((n, i) => [esc(n), esc(cinCity[i] || ''), esc(cinReg[i] || ''), esc(cinType[i] || ''), esc(String(cinRooms[i] ?? '')), cinSeats[i] != null ? nf(cinSeats[i]) : '']))}
          ${rel(['Un cinematograf cu mai multe săli are mai multe proiecții. Când compari locații, folosește indicatori „pe proiecție” sau „pe loc”, nu doar totaluri.'])}
        `)}

        ${sec('oferta', 'box', '08', 'Oferta: filme, genuri și formate', `${nf(nFilms)} filme, fiecare cu gen, clasificare, distribuitor, buget, rating și un actor principal.`, `
          <div class="ub-cols">
            <div class="ub-panel"><h4>Filmele pe genuri</h4>${genres.map((g) => `<div class="ub-kv"><span>${esc(g.g)}</span><b>${g.n} ${g.n === 1 ? 'film' : 'filme'}</b></div>`).join('')}</div>
            <div class="ub-panel"><h4>Clasificarea de vârstă</h4>${classes.map((c) => `<div class="ub-kv"><span>${esc(c)}</span><b>${esc(CLS_TXT[c] || '')}</b></div>`).join('')}</div>
          </div>
          <div class="ub-panel"><h4>Sălile, pe formate</h4>${table(['Format', 'Locuri într-o sală', 'Preț de listă'], formats.map((x) => [esc(x.f), `${nf(x.lo)} – ${nf(x.hi)}`, lei(x.price)]))}</div>
          ${rel(['Genul, clasificarea, distribuitorul și formatul sunt moduri diferite de a împărți aceleași proiecții. Alege-l pe cel care răspunde la întrebarea cititorului.'])}
        `, 'blue')}

        ${sec('program', 'calendar', '09', 'Programul și viața unui film', 'Timpul are aici mai multe niveluri: ora din zi, ziua din săptămână, săptămâna de la premieră, luna din an.', `
          ${table(['Interval', 'Ore de început', 'Cine vine de obicei'], slots.map((s) => [esc(SLOT_TXT[s.s] || s.s), esc(s.hours.join(', ')), esc(SLOT_WHO[s.s] || '')]))}
          <div class="ub-panel ub-mt"><h4>Viața unui film în cinema ${weeks.length ? `<small>(${code('Saptamana_Rulare')}: ${weeks[0]} – ${weeks[weeks.length - 1]})</small>` : ''}</h4>
            <div class="ub-life">
              <div><b>Săptămâna 1</b><span>premiera: curiozitate, fanii vin primii</span></div>
              <div><b>Săptămânile 2–3</b><span>vin cei care au auzit de la alții</span></div>
              <div><b>Săptămânile 4–6</b><span>interesul scade, mai puține proiecții</span></div>
              <div><b>Săptămâna 7+</b><span>filmul iese din program, face loc altuia</span></div>
            </div>
          </div>
          <div class="ub-cols ub-mt">
            ${kv('Ritmul săptămânii', [['Vineri – duminică', 'sălile cele mai pline'], ['Marțea', 'zi liniștită, bilete reduse'], ['Luni – joi', 'mai ales seara']])}
            ${kv('Ritmul anului', [['Vara', 'vacanțe, marile lansări'], ['Decembrie', 'sărbători, filme de familie'], ['Primăvara și toamna', 'perioade mai liniștite']])}
          </div>
        `)}

        ${sec('public', 'users', '10', 'Publicul: cine cumpără bilete', 'Datele nu conțin informații despre spectatori. Profilurile sunt tipice în industrie și te ajută să înțelegi pentru cine sunt orele și formatele.', `
          <div class="ub-cols ub-cols-3">
            <div class="ub-persona"><h4>Familia Ionescu</h4><span>2 adulți, 2 copii</span><ul><li>Weekend, la matineu</li><li>Animație și comedii (AG), adesea 3D</li><li>Cumpără mult de la bar</li></ul></div>
            <div class="ub-persona"><h4>Andrei, 23 de ani</h4><span>student</span><ul><li>Seara sau noaptea, cu prietenii</li><li>Acțiune, SF, horror; IMAX la premiere</li><li>Profită de biletele de marți</li></ul></div>
            <div class="ub-persona"><h4>Ioana și Mihai</h4><span>cuplu, 35 de ani</span><ul><li>Seara, la sfârșit de săptămână</li><li>Drame și thrillere, sala VIP</li><li>Plătesc pentru confort</li></ul></div>
          </div>
          ${rel(['Fiecare profil corespunde unei combinații de oră, format și gen din date. Dacă vrei să vorbești despre „familii”, uită-te la matineu, filmele AG și formatul 3D.'])}
        `, 'violet')}

        ${sec('dict', 'book', '11', 'Dicționar: termeni de business și coloane', 'Când managerul spune un cuvânt, tu știi unde îl găsești în date.', `
          ${table(['Termenul', 'Ce înseamnă', 'În date'], [
            ['Proiecție', 'un film, într-o sală, la o oră', `un rând din ${code(F.name)}`],
            ['Admisii / spectatori', 'oameni intrați în sală', code('Bilete_Vandute')],
            ['Capacitate', 'locurile din sală la acea proiecție', code('Locuri_Disponibile')],
            ['Box office', 'încasările din bilete', code('Incasari_Bilete')],
            ['Concesiuni', 'popcorn, băuturi, gustări', code('Incasari_Bar')],
            ['Rulaj', 'a câta săptămână de la premieră', code('Saptamana_Rulare')],
            ['Exploatant', 'cinematograful, rețeaua ta', 'Dim_Cinematografe'],
            ['Distribuitor', 'firma care închiriază filmul', `${code('Distribuitor')}, ${code('Cota_Distribuitor_Pct')}`]
          ])}
        `)}

        ${sec('limite', 'alert', '12', 'Ce nu găsești în aceste date', 'Un raport bun spune clar și ce nu poate arăta.', `
          <div class="ub-cols">
            ${note('amber', 'Costurile', 'Nu ai chiria, energia sau salariile. Poți vorbi despre încasări și ce rămâne după distribuitor, nu despre profit.')}
            ${note('amber', 'Spectatorii', 'Nu știi cine sunt oamenii din sală (vârstă, oraș, cât de des vin). Știi doar câte bilete s-au vândut.')}
            ${note('amber', 'Vânzarea biletelor', 'Nu știi unde au fost cumpărate biletele (online, aplicație, casa de bilete) sau cu cât timp înainte.')}
            ${note('amber', 'Concurența', 'Nu ai date despre alte cinematografe sau despre streaming. Raportul vorbește doar despre rețeaua ta.')}
          </div>
        `)}

        <footer class="ub-src"><b>Surse.</b> Date: ${code(fileOf(m))} (proiecții, filme, actori, cinematografe, calendar). Informațiile despre industrie, cotele și profilurile de public sunt generale, cu scop didactic.</footer>
        <div class="atl-next"><a class="atl-btn atl-btn-ghost" href="#date">← Date</a><a class="atl-btn atl-btn-primary" href="#model">Leagă tabelele →</a></div>
      </div>`;
    }
  });

  function fileOf(m) {
    const t = m.tables.find((x) => x.source);
    return t ? String(t.source).split(' · ')[0] : 'fișierul încărcat';
  }
})();
