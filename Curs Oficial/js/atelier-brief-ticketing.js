/* ==========================================================================
   Atelier de raport · dosarul afacerii: vânzarea de bilete (setul din proiectul final)
   Apare la pasul „Înțelege” doar când datele încărcate au tabele de bilete,
   spectatori, filme și cinematografe (setul din proiectul final). La orice alt
   set, atelierul folosește celelalte dosare sau explicația generală.
   Cifrele sunt descriptive (câte, ce, cât costă); ce merge bine sau prost
   rămâne de descoperit în Power BI. Informațiile despre industrie sunt
   generale, cu scop didactic.
   ========================================================================== */
(function () {
  'use strict';

  const A = (window.Atelier = window.Atelier || {});
  A.Briefs = A.Briefs || [];

  A.Briefs.push({
    id: 'ticketing',
    match: (m, D) => {
      const has = (re) => m.tables.some((t) => re.test(D.norm(t.name)));
      return has(/spectator/) && has(/film/) && has(/cinema/) && has(/bilet/);
    },
    render(m, h) {
      const { D, esc, icon } = h;
      const nf = (n) => Number(n).toLocaleString('ro-RO', { maximumFractionDigits: 0 });
      const lei = (v) => `${D.fmtFull(v)} lei`;
      const pc = (x) => `${Math.round(x * 100)}%`;
      const T = (re) => m.tables.find((t) => t !== m.fact && re.test(D.norm(t.name)));
      const C = (t, re) => (t ? t.columns.find((c) => re.test(D.norm(c.name))) : null);
      const vals = (c) => (c ? c.values : []);
      const uniq = (a) => [...new Set(a.filter((v) => v != null && v !== '').map(String))];
      const sum = (a) => a.reduce((s, v) => s + (+v || 0), 0);
      const F = m.fact;
      const cin = T(/cinema/), film = T(/film/), spe = T(/spectator/), tip = T(/tipuribilet|tipbilet|tipuri/);
      const fcol = (re) => { const c = C(F, re); return c ? m.fieldId(F.name, c.name) : null; };
      const dcol = (t, re) => { const c = C(t, re); return c && t ? m.fieldId(t.name, c.name) : null; };
      const id = {
        nr: fcol(/^nr/), price: fcol(/^pret/), bil: fcol(/valoarebilete/), bar: fcol(/valoarebar/), tot: fcol(/valoaretotala/),
        fmt: fcol(/^format$/), canal: fcol(/canal/), status: fcol(/status/), date: fcol(/^data/),
        film: dcol(film, /^titlu/), cin: dcol(cin, /^nume/), tip: dcol(tip, /^tip/), spe: dcol(spe, /^nume/)
      };
      const rows = m.flat;
      const g = (r, k) => (id[k] ? r[id[k]] : null);

      // ---------- ce spun datele, descriptiv ----------
      const cinName = vals(C(cin, /^nume/)), cinCity = vals(C(cin, /^oras$/)), cinReg = vals(C(cin, /^regiune/)), cinType = vals(C(cin, /^tip/)), cinRooms = vals(C(cin, /sali/)), cinSeats = vals(C(cin, /locuri/));
      const brand = (cinName[0] || 'Rețeaua').split(' ')[0];
      const bname = /^cinema$/i.test(brand) ? 'Cinema' : `${brand} Cinema`;
      const cities = uniq(cinCity), regions = uniq(cinReg);
      const types = uniq(cinType).map((x) => ({ x, n: cinType.filter((y) => y === x).length, rooms: sum(cinRooms.filter((_, i) => cinType[i] === x)) }));
      const fGen = vals(C(film, /^gen$/)), fDist = vals(C(film, /^distribuitor/)), fCountry = vals(C(film, /tara/)), fClass = vals(C(film, /clasific/));
      const genres = uniq(fGen).map((x) => ({ x, n: fGen.filter((y) => y === x).length })).sort((a, b) => b.n - a.n);
      const dists = uniq(fDist).map((x) => ({ x, n: fDist.filter((y) => y === x).length })).sort((a, b) => b.n - a.n);
      const countries = uniq(fCountry).map((x) => ({ x, n: fCountry.filter((y) => y === x).length })).sort((a, b) => b.n - a.n);
      const ORD = ['AG', 'AP-12', 'N-15', 'IM-18'];
      const classes = uniq(fClass).sort((a, b) => (ORD.indexOf(a) + 1 || 9) - (ORD.indexOf(b) + 1 || 9));
      const CLS_TXT = { AG: 'acord general, toată familia', 'AP-12': 'acordul părinților sub 12 ani', 'N-15': 'nerecomandat sub 15 ani', 'IM-18': 'interzis sub 18 ani' };
      const nFilms = film ? film.rowCount : 0, nSpe = spe ? spe.rowCount : 0;
      const ages = uniq(vals(C(spe, /varsta/))).sort();
      const subs = uniq(vals(C(spe, /abonament/)));
      const speAge = vals(C(spe, /varsta/)), speSub = vals(C(spe, /abonament/));
      const dates = id.date ? rows.map((r) => r[id.date]).filter((v) => v != null) : [];
      const d0 = dates.length ? D.fmtDate(Math.min(...dates)) : '', d1 = dates.length ? D.fmtDate(Math.max(...dates)) : '';
      const years = m.years && m.years.length ? m.years : [];

      const tickets = sum(rows.map((r) => g(r, 'nr')));
      const revT = sum(rows.map((r) => g(r, 'bil'))), revB = sum(rows.map((r) => g(r, 'bar')));
      const avgPrice = tickets ? revT / tickets : 0, barPer = tickets ? revB / tickets : 0;

      const byKey = (k) => uniq(rows.map((r) => g(r, k))).map((x) => {
        const rs = rows.filter((r) => String(g(r, k)) === x);
        const tk = sum(rs.map((r) => g(r, 'nr')));
        return { x, orders: rs.length, tickets: tk, rev: sum(rs.map((r) => g(r, 'bil'))), avg: tk ? sum(rs.map((r) => g(r, 'bil'))) / tk : 0 };
      });
      const channels = byKey('canal').sort((a, b) => b.tickets - a.tickets);
      const formats = byKey('fmt').sort((a, b) => a.avg - b.avg);
      const statuses = byKey('status').sort((a, b) => b.orders - a.orders);

      const tipName = vals(C(tip, /^tip/)), tipCat = vals(C(tip, /categorie/)), tipBase = vals(C(tip, /^pret/)), tipDisc = vals(C(tip, /discount/));
      const TIP_TXT = { Standard: 'adulți, preț întreg', Student: 'cu legitimație de student', Senior: 'peste 65 de ani', Copil: 'sub 12 ani', VIP: 'săli cu fotolii reglabile și servire la loc', Grup: 'de la 10 persoane, rezervat împreună' };
      const CANAL_TXT = { Online: 'pe site, cu plata cu cardul, de acasă', Aplicatie: 'din aplicația mobilă, cu cont de spectator', Casa: 'la ghișeul cinematografului, în ziua proiecției' };
      const FMT_TXT = { '2D': 'proiecția standard', '3D': 'ochelari 3D, la animație și aventură', IMAX: 'ecran uriaș și sunet puternic, pentru filmele-eveniment', VIP: 'săli mici, fotolii reglabile, servire la loc' };
      const STATUS_TXT = { Platit: 'vânzare finalizată', Rambursat: 'banii au fost înapoiați spectatorului', Anulat: 'comanda a fost anulată' };

      // un rând real din fapte, pentru „anatomia unei vânzări”
      const row = rows.find((r) => g(r, 'status') === 'Platit' && g(r, 'bar') > 0 && g(r, 'fmt') !== '2D' && g(r, 'nr') >= 2) || rows[0] || {};
      const rv = (k) => (row && id[k] ? row[id[k]] : null);

      // ---------- piese de interfață ----------
      const tile = (lbl, v, sub, note, tone) => `<div class="ub-tile${tone ? ' t-' + tone : ''}"><span class="ub-tile-l">${esc(lbl)}</span><b>${esc(v)}</b><span class="ub-tile-s">${esc(sub)}</span>${note ? `<small>${esc(note)}</small>` : ''}</div>`;
      const kv = (title, rs) => `<div class="ub-panel"><h4>${esc(title)}</h4>${rs.map(([k, v]) => `<div class="ub-kv"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`;
      const note = (tone, title, text) => `<div class="ub-note n-${tone}"><b>${esc(title)}</b><p>${text}</p></div>`;
      const rel = (items) => `<div class="ub-rel"><h4>${icon('target')} Relevanță pentru raportul tău</h4>${items.map((t) => `<p>${icon('check')}<span>${t}</span></p>`).join('')}</div>`;
      const table = (head, rs) => `<div class="ub-table"><table><thead><tr>${head.map((x) => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rs.map((r) => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="b"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      const sec = (sid, ic, num, title, lead, body, tone) => `<section class="ub-sec${tone ? ' s-' + tone : ''}" id="ub-${sid}"><div class="ub-sec-h"><span class="ub-num">${num}</span><div><h3>${icon(ic)}${esc(title)}</h3>${lead ? `<p>${lead}</p>` : ''}</div></div>${body}</section>`;
      const code = (c) => `<code>${esc(c)}</code>`;
      const TOC = [['rez', 'Afacerea pe o pagină'], ['ind', 'Indicatori-cheie'], ['ind2', 'Cum funcționează industria'], ['bilet', 'Cum se vinde un bilet'], ['canal', 'Canale de vânzare'], ['anat', 'Anatomia unei vânzări'], ['kpi', 'Ce măsoară un director'], ['retea', 'Rețeaua'], ['oferta', 'Oferta: filmele'], ['timp', 'Timpul'], ['public', 'Spectatorii'], ['dict', 'Dicționar'], ['limite', 'Ce nu găsești în date']];
      const share = (v, tot) => (tot ? pc(v / tot) : '');

      return `<div class="atl-wrap ub">
        <header class="ub-hero">
          <span class="ub-kicker">${icon('book')} Dosarul afacerii</span>
          <h2>${esc(bname)} · cum se vinde un bilet de cinema</h2>
          <p>Analizezi vânzările rețelei ${esc(bname)}. Dosarul explică în ce industrie lucrezi, de unde vin banii, ce urmărește un director comercial și ce conțin datele primite. Cifrele de aici descriu afacerea; ce merge bine sau prost descoperi tu, în Power BI.</p>
        </header>

        <nav class="ub-toc"><h4>${icon('table')} Cuprins</h4><div>${TOC.map(([sid, l], i) => `<button data-u-goto="ub-${sid}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(l)}</button>`).join('')}</div></nav>

        ${sec('rez', 'sparkle', '01', 'Afacerea pe o pagină', 'Trei idei de reținut înainte de orice altceva.', `
          <div class="ub-cols ub-cols-3">
            <div class="ub-big"><span>Ce vinde</span><b>Bilete la filme</b><p>Un spectator cumpără un loc la un film, într-un cinematograf, într-o zi. Biletul se poate vinde online, în aplicație sau la casă.</p></div>
            <div class="ub-big"><span>Din ce câștigă</span><b>Bilete + bar</b><p>Biletul aduce cei mai mulți bani, dar o parte merge la distribuitorul filmului. Popcornul și băuturile rămân aproape integral cinematografului.</p></div>
            <div class="ub-big"><span>Ce urmărește</span><b>Spectatori, bani, tipare</b><p>Câți bilete se vând, la ce preț, prin ce canal, cui și când, ca să programeze și să facă oferte mai bine.</p></div>
          </div>
        `, 'green')}

        ${sec('ind', 'coins', '02', 'Indicatori-cheie ai afacerii', 'Ce conține rețeaua și ce acoperă datele.', `
          <div class="ub-tiles">
            ${tile('Rețeaua', nf(cinName.length), 'cinematografe', `${cities.length} orașe · ${regions.length} regiuni`)}
            ${tile('Program', nf(nFilms), 'filme', `${genres.length} genuri · ${dists.length} distribuitori`)}
            ${tile('Spectatori', nf(nSpe), 'înregistrați', `${subs.length} tipuri de abonament`)}
            ${tile('Bilete', nf(tip ? tip.rowCount : 0), 'tipuri de bilet', tipName.join(' · '), 'violet')}
            ${tile('Activitate', nf(F.rowCount), 'vânzări înregistrate', d0 ? `${d0} – ${d1}` : '', 'violet')}
            ${tile('Volum', nf(tickets), 'bilete vândute', `${lei(revT)} din bilete`, 'violet')}
          </div>
        `)}

        ${sec('ind2', 'link', '03', 'Cum funcționează industria', `Un film trece prin patru mâini până la spectator. ${esc(bname)} este a treia verigă: <b>exploatantul</b>, cel care deține sălile și vinde biletele.`, `
          <div class="ub-chain">
            <div><span class="ub-chain-n">1</span><b>Producătorul</b><span>face filmul: buget, regizor, actori</span></div>
            <i>${icon('arrow')}</i>
            <div><span class="ub-chain-n">2</span><b>Distribuitorul</b><span>cumpără drepturile și închiriază filmul cinematografelor, pentru o cotă din bilete</span></div>
            <i>${icon('arrow')}</i>
            <div class="is-us"><span class="ub-chain-n">3</span><b>Cinematograful · ${esc(brand)}</b><span>programează filmul, vinde bilete și produse de la bar</span></div>
            <i>${icon('arrow')}</i>
            <div><span class="ub-chain-n">4</span><b>Spectatorul</b><span>alege filmul, ora, formatul și canalul de cumpărare</span></div>
          </div>
          <div class="ub-cols">
            <div class="ub-panel"><h4>Ce lucrează în favoarea unui cinematograf</h4>
              ${note('green', 'Experiența nu se copiază acasă', 'Ecranul mare, sunetul, IMAX-ul și sălile VIP sunt motivul pentru care oamenii plătesc un bilet în loc să aștepte filmul pe streaming.')}
              ${note('green', 'Barul, a doua sursă de venit', 'Popcornul și băuturile au marjă mare și nu se împart cu distribuitorul.')}
            </div>
            <div class="ub-panel"><h4>La ce trebuie să fie atent</h4>
              ${note('amber', 'Depinde de filmele lansate', 'Cinematograful nu face filmele. Un an cu lansări slabe înseamnă mai puține bilete, oricât de bine e condusă rețeaua.')}
              ${note('amber', 'Concurența vine din salon', 'Streamingul e la un click distanță. Cinematograful trebuie să ofere ceva ce nu se poate face acasă.')}
            </div>
          </div>
          ${rel([`Datele tale sunt despre a treia verigă: ce s-a vândut în cinematografele rețelei ${esc(bname)}.`, 'Întrebările bune pentru raport sunt cele pe care rețeaua le poate influența: ce filme programează, ce formate și bilete oferă, prin ce canale vinde.'])}
        `, 'blue')}

        ${sec('bilet', 'coins', '04', 'Cum se vinde un bilet', 'Prețul pe care îl plătește un spectator nu e unul singur: depinde de tipul de bilet și de format.', `
          <div class="ub-cols">
            <div class="ub-panel"><h4>Tipuri de bilet</h4>
              ${table(['Tip', 'Categorie', 'Preț de bază', 'Discount', 'Cui se adresează'], tipName.map((n, i) => [esc(n), esc(tipCat[i] || ''), lei(tipBase[i] || 0), `${tipDisc[i] || 0}%`, esc(TIP_TXT[n] || '')]))}
            </div>
            <div class="ub-panel"><h4>Formate de proiecție</h4>
              ${table(['Format', 'Preț mediu pe bilet', 'Ce oferă'], formats.map((x) => [esc(x.x), lei(x.avg), esc(FMT_TXT[x.x] || '')]))}
            </div>
          </div>
          <div class="ub-split">
            <div class="ub-split-row"><span class="ub-split-l">Un bilet, în medie</span>
              <div class="ub-split-bar"><i class="is-cin" style="flex:${avgPrice || 1}"><b>${lei(avgPrice)}</b><em>preț mediu pe bilet</em></i></div></div>
            <div class="ub-split-row"><span class="ub-split-l">La bar, pe bilet vândut</span>
              <div class="ub-split-bar" style="width:${avgPrice ? Math.max(12, Math.round((barPer / avgPrice) * 100)) : 20}%"><i class="is-dist" style="flex:1"><b>${lei(barPer)}</b><em>cheltuiala medie la bar</em></i></div></div>
            <p class="ub-split-note">Prețul final = prețul de bază + diferența de format, minus discountul tipului de bilet. De aceea „prețul biletului” nu e o coloană fixă: se calculează.</p>
          </div>
          ${rel(['Preț mediu pe bilet = valoarea biletelor ÷ numărul de bilete. Nu se adună din prețurile unitare: se calculează din sume.', 'Un tip de bilet cu discount aduce mai mulți spectatori, dar mai puțin pe bilet. Ce merită? Răspunsul îl cauți în date.'])}
        `, 'green')}

        ${sec('canal', 'link', '05', 'Canale de vânzare', 'Același bilet se poate cumpăra în trei feluri. Fiecare canal înseamnă alt tip de spectator și alt cost pentru cinematograf.', `
          ${table(['Canal', 'Cum funcționează', 'Comenzi', 'Bilete', 'Pondere în bilete'], channels.map((c) => [esc(c.x), esc(CANAL_TXT[c.x] || ''), nf(c.orders), nf(c.tickets), share(c.tickets, tickets)]))}
          ${rel(['Comanda este rândul din date; biletele dintr-o comandă sunt în ' + code('Nr_Bilete') + '. Atenție la ce numeri: comenzi sau bilete.'])}
        `)}

        ${sec('anat', 'table', '06', 'Anatomia unei vânzări', 'Un singur rând din tabelul de fapte, citit ca un manager. Fiecare câmp răspunde la o întrebare.', `
          <div class="ub-ticket">
            <div class="ub-ticket-main">
              <span class="ub-ticket-k">Comandă · ${esc(rv('date') ? D.fmtDate(rv('date')) : '')} · ${esc(rv('canal') || '')}</span>
              <b>${esc(rv('film') || '')}</b>
              <span>${esc(rv('cin') || '')} · ${esc(rv('fmt') || '')} · bilet ${esc(rv('tip') || '')}</span>
              <span>${nf(rv('nr') || 0)} bilete × ${lei(rv('price') || 0)}</span>
            </div>
            <div class="ub-ticket-side">
              <div class="ub-kv"><span>Bilete</span><b>${lei(rv('bil') || 0)}</b></div>
              <div class="ub-kv"><span>Bar</span><b>${lei(rv('bar') || 0)}</b></div>
              <div class="ub-kv is-total"><span>Total comandă</span><b>${lei(rv('tot') || 0)}</b></div>
            </div>
          </div>
          ${table(['Întrebarea', 'Răspunsul din rând', 'De unde vine'], [
            ['Ce film?', esc(rv('film') || ''), `${code('ID_Film')} → Dim_Filme`],
            ['Unde?', esc(rv('cin') || ''), `${code('ID_Cinema')} → Dim_Cinematografe`],
            ['Când?', esc(rv('date') ? D.fmtDate(rv('date')) : ''), `${code('ID_Date')} → Dim_Date`],
            ['Cine a cumpărat?', esc(rv('spe') || ''), `${code('ID_Spectator')} → Dim_Spectatori`],
            ['Ce fel de bilet?', esc(rv('tip') || ''), `${code('ID_Tip_Bilet')} → Dim_Tipuri_Bilet`],
            ['Cum a cumpărat?', esc(rv('canal') || ''), code('Canal_Vanzare')],
            ['Cât a plătit?', esc(lei(rv('tot') || 0)), `${code('Valoare_Bilete')} + ${code('Valoare_Bar')}`]
          ])}
          <div class="ub-panel ub-mt"><h4>Starea comenzii · ${code('Status_Plata')}</h4>
            ${statuses.map((s) => `<div class="ub-kv"><span>${esc(s.x)}</span><b>${esc(STATUS_TXT[s.x] || '')} · ${nf(s.orders)} comenzi</b></div>`).join('')}
          </div>
          ${rel(['Un rând e o comandă, nu un bilet: o comandă poate avea mai multe bilete. Raportul adună mii de comenzi și le privește pe filme, locații, canale, luni.', 'Comenzile rambursate sau anulate nu aduc venit real: gândește-te dacă le incluzi în cifre.'])}
        `, 'violet')}

        ${sec('kpi', 'target', '07', 'Ce măsoară un director comercial', 'Indicatorii folosiți în industrie și coloanele din care îi calculezi în Power BI.', `
          ${table(['Indicator', 'Ce spune', 'Cum se calculează', 'Din coloanele'], [
            ['Bilete vândute', 'câți spectatori au cumpărat', 'suma biletelor din comenzi', code('Nr_Bilete')],
            ['Încasări din bilete', 'câți bani aduc biletele', 'suma valorii biletelor', code('Valoare_Bilete')],
            ['Preț mediu pe bilet', 'cât plătește, de fapt, un spectator', 'valoare bilete ÷ bilete vândute', `${code('Valoare_Bilete')}, ${code('Nr_Bilete')}`],
            ['Bar pe bilet', 'cât cumpără un spectator de la bar', 'valoare bar ÷ bilete vândute', `${code('Valoare_Bar')}, ${code('Nr_Bilete')}`],
            ['Valoarea medie a comenzii', 'cât lasă un spectator la o cumpărare', 'valoare totală ÷ număr de comenzi', code('Valoare_Totala')],
            ['Ponderea unui canal', 'cât se vinde online, în aplicație, la casă', 'bilete pe canal ÷ bilete totale', `${code('Canal_Vanzare')}, ${code('Nr_Bilete')}`],
            ['Rata de rambursare', 'câte comenzi se întorc', 'comenzi rambursate sau anulate ÷ toate comenzile', code('Status_Plata')],
            ['Creștere față de anul trecut', 'cum stăm față de perioada similară', 'time intelligence, pe calendar', `${code('Data_Vanzare')} / ${code('Dim_Date')}`]
          ])}
          ${rel(['Niciunul dintre acești indicatori nu e o coloană gata făcută: îi scrii ca măsuri DAX. Prețul mediu și ponderile sunt raporturi, deci nu se adună: se calculează din sume.'])}
        `, 'violet')}

        ${sec('retea', 'pin', '08', 'Rețeaua: unde se află sălile', `${nf(cinName.length)} cinematografe în ${nf(cities.length)} orașe, de ${types.length} tipuri.`, `
          <div class="ub-cols ub-cols-3">${types.map((t) => `<div class="ub-panel ub-type"><h4>${esc(t.x)}</h4><b>${nf(t.n)} ${t.n === 1 ? 'locație' : 'locații'} · ${nf(t.rooms)} ${t.rooms === 1 ? 'ecran' : 'săli'}</b><p>${esc({ Multiplex: 'Multe săli, adesea în mall. Rulează mai multe filme deodată și are formatele premium.', Boutique: 'Puține săli, în centrul orașului. Atmosferă de cinema de cartier, public fidel.', 'Open-air': 'Ecran în aer liber, deschis vara. O singură sală, programe speciale.' }[t.x] || '')}</p></div>`).join('')}</div>
          ${table(['Cinematograf', 'Oraș', 'Regiune', 'Tip', 'Săli', 'Locuri'], cinName.map((n, i) => [esc(n), esc(cinCity[i] || ''), esc(cinReg[i] || ''), esc(cinType[i] || ''), esc(String(cinRooms[i] ?? '')), cinSeats[i] != null ? nf(cinSeats[i]) : '']))}
          ${rel(['Un cinematograf mare vinde mai multe bilete. Când compari locații, folosește indicatori „pe bilet” sau „pe loc”, nu doar totaluri.'])}
        `)}

        ${sec('oferta', 'box', '09', 'Oferta: filmele', `${nf(nFilms)} filme, fiecare cu gen, țară, clasificare, distribuitor și rating.`, `
          <div class="ub-cols">
            <div class="ub-panel"><h4>Pe genuri</h4>${genres.map((x) => `<div class="ub-kv"><span>${esc(x.x)}</span><b>${x.n} ${x.n === 1 ? 'film' : 'filme'}</b></div>`).join('')}</div>
            <div class="ub-panel"><h4>Clasificarea de vârstă</h4>${classes.map((c) => `<div class="ub-kv"><span>${esc(c)}</span><b>${esc(CLS_TXT[c] || '')}</b></div>`).join('')}</div>
          </div>
          <div class="ub-cols ub-mt">
            <div class="ub-panel"><h4>Distribuitori</h4>${dists.map((x) => `<div class="ub-kv"><span>${esc(x.x)}</span><b>${x.n} filme</b></div>`).join('')}</div>
            <div class="ub-panel"><h4>Țara de producție</h4>${countries.map((x) => `<div class="ub-kv"><span>${esc(x.x)}</span><b>${x.n} filme</b></div>`).join('')}</div>
          </div>
          ${rel(['Genul, clasificarea, distribuitorul și țara sunt moduri diferite de a grupa aceleași filme. Alege-l pe cel care răspunde la întrebarea cititorului.'])}
        `, 'blue')}

        ${sec('timp', 'calendar', '10', 'Timpul: când se cumpără bilete', `Datele merg din ${esc(d0)} până în ${esc(d1)}${years.length ? ` (${years.length} ani)` : ''}. Calendarul oferă mai multe niveluri.`, `
          <div class="ub-cols">
            ${kv('Nivelurile calendarului', [['Zi', 'Data_Vanzare, Zi_Saptamana'], ['Săptămână', 'Nr_Saptamana'], ['Lună', 'Luna, Luna_Nume'], ['Trimestru', 'Trimestru (T1–T4)'], ['An', 'An']])}
            ${kv('Ritmuri tipice în industrie', [['Weekendul', 'cele mai multe bilete'], ['Vacanțe și sărbători', 'filme de familie și marile lansări'], ['Vara', 'cinematografele în aer liber'], ['Premierele', 'vârf în primele săptămâni']])}
          </div>
          ${rel(['Pentru comparații în timp (cumulat de la începutul anului, față de anul trecut) folosești calendarul marcat ca tabelă de date și măsuri de time intelligence.'])}
        `)}

        ${sec('public', 'users', '11', 'Spectatorii: cine cumpără bilete', `${nf(nSpe)} spectatori înregistrați, cu grupă de vârstă, oraș și tip de abonament.`, `
          <div class="ub-cols">
            <div class="ub-panel"><h4>Pe grupe de vârstă</h4>${ages.map((a) => `<div class="ub-kv"><span>${esc(a)}</span><b>${nf(speAge.filter((x) => x === a).length)} spectatori</b></div>`).join('')}</div>
            <div class="ub-panel"><h4>Pe tip de abonament</h4>${subs.map((a) => `<div class="ub-kv"><span>${esc(a)}</span><b>${nf(speSub.filter((x) => x === a).length)} spectatori</b></div>`).join('')}</div>
          </div>
          <div class="ub-cols ub-cols-3 ub-mt">
            <div class="ub-persona"><h4>Familia Ionescu</h4><span>2 adulți, 2 copii</span><ul><li>Weekend, filme de animație și comedii</li><li>Bilete Standard și Copil, adesea 3D</li><li>Cumpără mult de la bar</li></ul></div>
            <div class="ub-persona"><h4>Andrei, 23 de ani</h4><span>student</span><ul><li>Seara, cu prietenii</li><li>Acțiune, SF, horror; IMAX la premiere</li><li>Bilet Student, cumpărat în aplicație</li></ul></div>
            <div class="ub-persona"><h4>Ioana și Mihai</h4><span>cuplu, 35 de ani</span><ul><li>Weekend seara, drame și thrillere</li><li>Bilet VIP, rezervat online</li><li>Plătesc pentru confort</li></ul></div>
          </div>
          ${rel(['Profilurile sunt tipice în industrie. Ele te ajută să formulezi întrebări; datele spun dacă se confirmă.'])}
        `, 'violet')}

        ${sec('dict', 'book', '12', 'Dicționar: termeni de business și coloane', 'Când managerul spune un cuvânt, tu știi unde îl găsești în date.', `
          ${table(['Termenul', 'Ce înseamnă', 'În date'], [
            ['Comandă / vânzare', 'o cumpărare de bilete, de la un spectator', `un rând din ${code(F.name)}`],
            ['Admisii', 'bilete vândute, deci spectatori în sală', code('Nr_Bilete')],
            ['Box office', 'încasările din bilete', code('Valoare_Bilete')],
            ['Concesiuni', 'popcorn, băuturi, gustări', code('Valoare_Bar')],
            ['Canal de vânzare', 'locul în care s-a cumpărat biletul', code('Canal_Vanzare')],
            ['Format', 'tipul proiecției: 2D, 3D, IMAX, VIP', code('Format')],
            ['Exploatant', 'cinematograful, rețeaua ta', 'Dim_Cinematografe'],
            ['Distribuitor', 'firma care închiriază filmul', code('Distribuitor')],
            ['Rambursare', 'banii întorși spectatorului', `${code('Status_Plata')} = Rambursat`]
          ])}
        `)}

        ${sec('limite', 'alert', '13', 'Ce nu găsești în aceste date', 'Un raport bun spune clar și ce nu poate arăta.', `
          <div class="ub-cols">
            ${note('amber', 'Costurile', 'Nu ai chiria, energia, salariile sau cota distribuitorului. Poți vorbi despre încasări, nu despre profit.')}
            ${note('amber', 'Ocuparea sălilor', 'Nu știi câte locuri erau libere la fiecare proiecție. Ai vânzările, nu gradul de umplere al sălii.')}
            ${note('amber', 'Ora proiecției', 'Știi când s-a făcut vânzarea, nu la ce oră a început filmul.')}
            ${note('amber', 'Concurența', 'Nu ai date despre alte cinematografe sau despre streaming. Raportul vorbește doar despre rețeaua ta.')}
          </div>
        `)}

        <footer class="ub-src"><b>Surse.</b> Date: ${code(fileOf(m))}. Informațiile despre industrie și profilurile de public sunt generale, cu scop didactic.</footer>
        <div class="atl-next"><a class="atl-btn atl-btn-ghost" href="#date">← Date</a><a class="atl-btn atl-btn-primary" href="#model">Leagă tabelele →</a></div>
      </div>`;
    }
  });

  function fileOf(m) {
    const t = m.tables.find((x) => x.source);
    return t ? String(t.source).split(' · ')[0] : 'fișierul încărcat';
  }
})();
