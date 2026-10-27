/* Sesiunea 12 · Recapitulare: exerciții de tipuri diferite
   <div data-s12="tip" data-set="cheie"></div>
   - order    pune în ordine (drag sau click pe două elemente ca să le schimbi)
   - buckets  trage fiecare card în coloana potrivită
   - match    trage răspunsul lângă problema potrivită (câte unul pe rând)
   - quiz     o întrebare pe ecran, variante cu feedback; opțional cod, desene sau un mic tabel
   - tf       adevărat sau fals
   - flip     carduri de întors */
(function () {
  const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- desenele mici pentru „ce vizual alegi” ---------- */
  const VIZ = {
    line: ['Line chart', '<polyline class="ln" points="10,70 40,52 70,58 100,34 130,40 160,18 190,24"/><line class="ax" x1="8" y1="82" x2="194" y2="82"/>'],
    stacked: ['Stacked column', [[20, 40, 18], [60, 52, 22], [100, 30, 14], [140, 60, 20]].map(([x, a, b]) => '<rect class="f1" x="' + x + '" y="' + (82 - a) + '" width="26" height="' + a + '"/><rect class="f2" x="' + x + '" y="' + (82 - a - b) + '" width="26" height="' + b + '"/>').join('') + '<line class="ax" x1="8" y1="82" x2="194" y2="82"/>'],
    pct: ['100% stacked column', [[20, 40], [60, 28], [100, 50], [140, 34]].map(([x, a]) => '<rect class="f1" x="' + x + '" y="' + (82 - a) + '" width="26" height="' + a + '"/><rect class="f2" x="' + x + '" y="10" width="26" height="' + (72 - a) + '"/>').join('') + '<line class="ax" x1="8" y1="82" x2="194" y2="82"/>'],
    bar: ['Bar chart (orizontal)', [150, 118, 92, 70, 48].map((w, i) => '<rect class="f1" x="40" y="' + (8 + i * 15) + '" width="' + w + '" height="10"/><rect class="lbl" x="6" y="' + (10 + i * 15) + '" width="28" height="6"/>').join('')],
    waterfall: ['Waterfall', '<rect class="f1" x="14" y="16" width="26" height="66"/><rect class="neg" x="50" y="16" width="26" height="18"/><rect class="neg" x="86" y="34" width="26" height="14"/><rect class="neg" x="122" y="48" width="26" height="10"/><rect class="f2" x="158" y="58" width="26" height="24"/><line class="ax" x1="8" y1="82" x2="194" y2="82"/>'],
    funnel: ['Funnel', [170, 130, 90, 50].map((w, i) => '<rect class="f1 o' + (i + 1) + '" x="' + (100 - w / 2) + '" y="' + (8 + i * 19) + '" width="' + w + '" height="15" rx="2"/>').join('')],
    donut: ['Donut chart', '<g transform="rotate(-90 100 46)"><circle class="dn c1" cx="100" cy="46" r="30" stroke-dasharray="85 189"/><circle class="dn c2" cx="100" cy="46" r="30" stroke-dasharray="56 189" stroke-dashoffset="-85"/><circle class="dn c3" cx="100" cy="46" r="30" stroke-dasharray="48 189" stroke-dashoffset="-141"/></g>'],
    gauge: ['Gauge', '<path class="gg-bg" d="M40 76 A60 60 0 0 1 160 76"/><path class="gg" d="M40 76 A60 60 0 0 1 136 30"/><line class="cn" x1="100" y1="76" x2="146" y2="22"/>'],
    card: ['Card', '<text x="100" y="54" text-anchor="middle" class="big">75,9 M</text><text x="100" y="74" text-anchor="middle" class="sm">venit 2025</text>'],
    table: ['Table', [0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((c) => '<rect class="' + (r ? 'cell' : 'f1') + '" x="' + (20 + c * 56) + '" y="' + (8 + r * 15) + '" width="52" height="12"/>').join('')).join('')]
  };
  const viz = (k) => '<svg viewBox="0 0 200 90" class="s12-viz" aria-hidden="true">' + VIZ[k][1] + '</svg>';

  /* ---------- tabelul mic pentru filter context ---------- */
  const T8 = [['Nord-Vest', 'Electronice', 400], ['Nord-Vest', 'Alimente', 150], ['Sud-Est', 'Electronice', 300], ['Sud-Est', 'Alimente', 100], ['Sud-Est', 'Haine', 200], ['Centru', 'Electronice', 250], ['Centru', 'Alimente', 50], ['Centru', 'Haine', 150]];
  // on = rândurile lăsate de slicer (vizibile de la început), seen = rândurile folosite de măsură (după răspuns)
  const t8 = (slicer, on, seen) => '<div class="s12-ctx"><div class="s12-slicer">Slicer: <b>' + slicer + '</b></div><table><thead><tr><th>Regiune</th><th>Categorie</th><th>Valoare</th></tr></thead><tbody>' +
    T8.map((r, i) => '<tr class="' + (on.includes(i) ? 'is-on' : 'is-off') + '"' + (seen.includes(i) ? ' data-seen' : '') + '><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') + '</tbody></table>' +
    '<p class="s12-ctx-note" data-note>Verde: rândurile lăsate de slicer.</p></div>';
  const ALL8 = [0, 1, 2, 3, 4, 5, 6, 7];

  /* ---------- seturile ---------- */
  const SETS = {
    // ordine
    etape: { items: [
      ['Discuții', 'Ce întrebare are omul de business și ce decizie vrea să ia?'],
      ['Surse', 'Unde stau datele: Excel, ERP, CRM, o bază SQL.'],
      ['Aducere', 'Get Data: le aduci într-un loc comun.'],
      ['Curățare și model', 'Power Query, apoi relațiile din Model view.'],
      ['Raport', 'Vizuale care răspund la întrebare.'],
      ['Decizie', 'Cineva face ceva cu informația. Fără asta, raportul n-a folosit la nimic.']
    ] },
    pasi: { items: [
      ['Get Data → Excel', 'Te conectezi la fișier. Fișierul de pe disc rămâne neatins.'],
      ['Remove Top Rows', 'Scoți titlul raportului din primele rânduri.'],
      ['Use First Row as Headers', 'Abia acum primul rând e chiar antetul.'],
      ['Trim și Clean pe coloanele text', 'Scoți spațiile de la capete și caracterele invizibile.'],
      ['Change Type (Using Locale)', 'Tipul se pune pe text deja curat, altfel apar erori.'],
      ['Close & Apply', 'Load: rezultatul intră în model.']
    ] },
    refresh: { items: [
      ['Deschizi Refresh history', 'Citești mesajul exact: „credentials are invalid”.'],
      ['Settings → Data source credentials', 'Pe semantic model, în Service.'],
      ['Edit credentials, cu parola nouă', 'Parola lui Ion s-a schimbat; Service încă o folosea pe cea veche.'],
      ['Refresh now', 'Pornești un refresh manual ca test.'],
      ['Verifici statusul „Completed”', 'Abia acum știi că refresh-ul programat de mâine va merge.']
    ] },

    // coloane
    desktopService: { buckets: [['d', 'Power BI Desktop', 'pe calculatorul autorului'], ['s', 'Power BI Service', 'în cloud, app.powerbi.com']], items: [
      ['Fișierul .pbix', 'd'], ['Curățarea în Power Query', 'd'], ['Relațiile dintre tabele', 'd'], ['Scrii măsurile DAX', 'd'],
      ['Programezi refresh-ul zilnic', 's'], ['Construiești un dashboard', 's'], ['Partajezi cu echipa prin link sau app', 's'], ['Dai acces pe roluri (RLS)', 's']
    ] },
    factDim: { buckets: [['f', 'Fact table', 'evenimente, cu numere'], ['d', 'Dimension table', 'context: cine, ce, unde, când']], items: [
      ['Zborurile: un rând pe zbor, cu venit și pasageri', 'f'], ['Companiile aeriene: nume, țară, alianță', 'd'], ['Calendarul: o zi pe rând', 'd'], ['Rezervările: dată, pasager, preț plătit', 'f'],
      ['Produsele: nume, categorie, brand', 'd'], ['Pontajul: ore lucrate pe zi și pe angajat', 'f'], ['Angajații: nume, departament, oraș', 'd'], ['Proiecțiile: dată, sală, bilete vândute', 'f']
    ] },
    slicerFiltru: { buckets: [['s', 'Slicer pe pagină', 'alegerea cititorului, la vedere'], ['f', 'Filters pane', 'regulă fixă, ascunsă sau blocată']], items: [
      ['Managerul își alege singur regiunea', 's'], ['Comenzile anulate nu apar nicăieri în raport', 'f'], ['Cititorul alege anul', 's'], ['Anii dinainte de 2022 nu apar niciodată', 'f'],
      ['Graficul arată doar Top 10 produse', 'f'], ['Cititorul alege o perioadă între două date', 's']
    ] },
    importDq: { buckets: [['i', 'Import', 'copia datelor, în model'], ['q', 'DirectQuery', 'întreabă sursa la fiecare vizual']], items: [
      ['Datele sunt copiate în model', 'i'], ['Trimite o interogare la sursă la fiecare click', 'q'], ['Vezi datele de la ultimul refresh', 'i'], ['Rapoarte mai rapide', 'i'],
      ['Cifre aproape în timp real din baza caselor de bilete', 'q'], ['Ai nevoie de refresh programat ca să vină datele noi', 'i']
    ] },

    // potrivire
    pqFix: { pool: ['Trim', 'Clean', 'Unpivot Columns', 'Change Type → Using Locale', 'Remove Top Rows', 'Folder → Combine', 'Custom Column', 'Column quality'], items: [
      ['„ Franta ” și „Franta” apar ca două valori diferite', 'Trim'],
      ['„Bruges” are un Enter invizibil la final', 'Clean'],
      ['Lunile sunt coloane: Ian, Feb, Mar…', 'Unpivot Columns'],
      ['„12,5” dă eroare când schimbi tipul în Decimal', 'Change Type → Using Locale'],
      ['Titlul raportului ocupă primele două rânduri', 'Remove Top Rows'],
      ['12 fișiere lunare identice, într-un folder', 'Folder → Combine'],
      ['Data întoarcerii = data plecării + durata', 'Custom Column'],
      ['Vrei să vezi câte erori are fiecare coloană', 'Column quality']
    ] },
    unelte: { pool: ['Sync slicers', 'Edit interactions → None', 'Drillthrough', 'Tooltip', 'Bookmark + buton', 'Drill down', 'Field parameter', 'Formatare condiționată'], items: [
      ['„Anul ales pe prima pagină să rămână ales și pe celelalte.”', 'Sync slicers'],
      ['„Cardul cu totalul nu trebuie să se schimbe când dau click pe grafic.”', 'Edit interactions → None'],
      ['„Vreau clienții unui produs, pe o pagină separată.”', 'Drillthrough'],
      ['„La hover pe o regiune, vreau să văd și câți clienți are.”', 'Tooltip'],
      ['„Utilizatorii se încurcă în filtre și nu mai știu cum să revină.”', 'Bookmark + buton'],
      ['„Graficul arată lunile, dar vreau să pot urca la ani.”', 'Drill down'],
      ['„Vreau să aleg singur ce măsură apare în matrix.”', 'Field parameter'],
      ['„Rutele sub țintă să iasă în evidență cu roșu.”', 'Formatare condiționată']
    ] },

    // quiz
    bazele: { items: [
      { q: 'Care sunt cele trei vederi din Power BI Desktop?', o: ['Report, Table, Model', 'Report, Query, Data', 'Canvas, Grid, Diagram', 'Page, Data, DAX'], k: 0, x: '<b>Report</b> e pânza cu vizuale, <b>Table</b> arată datele încărcate, <b>Model</b> arată tabelele și relațiile.' },
      { q: 'Ce e fundația unui proiect Power BI?', o: ['Raportul', 'Modelul de date', 'Dashboard-ul', 'Tema de culori'], k: 1, x: 'Modelul: tabele curate, relații, măsuri. Dacă modelul e greșit, orice grafic de deasupra e greșit.' },
      { q: 'Proprietarul cafenelei Cafe Luna vine la analist. Ce cere de fapt?', o: ['Un pie chart cu cheltuielile', 'Să decidă unde taie cheltuieli', 'Un fișier Excel nou', 'Un dashboard cu 20 de grafice'], k: 1, x: 'Omul de business cere o <b>decizie</b>. Graficul e treaba analistului.' },
      { q: 'Ce înseamnă L din ETL?', o: ['Link', 'Lookup', 'Load', 'List'], k: 2, x: '<b>Extract</b> (Get Data), <b>Transform</b> (Power Query), <b>Load</b> (Close &amp; Apply, în model).' }
    ] },
    model: { items: [
      { q: 'Din ce e format un ERD?', o: ['Tabele, grafice și filtre', 'Entități, atribute și relații', 'Fapte, măsuri și pagini', 'Rânduri, coloane și celule'], k: 1, x: '<b>Entity</b> e cutia (Călător), <b>attribute</b> e coloana (nume, dată), <b>relationship</b> e linia cu 1 și *.' },
      { q: 'Ce regulă are o cheie primară (PK)?', o: ['Se repetă pe fiecare rând', 'E unică și nu lipsește', 'E mereu un număr', 'Stă în fact table'], k: 1, x: 'PK stă în dimensiune: o valoare, un rând. FK stă în fact și se poate repeta.' },
      { q: 'În Fact_Vanzari apare ID_Client = C99, dar C99 nu există în Dim_Clienti. Ce e?', o: ['O cheie orfană', 'O cheie primară', 'O relație many-to-many', 'Nimic grav'], k: 0, x: 'Un FK fără pereche în dimensiune. Vânzarea apare la „(Blank)” când filtrezi pe client.' },
      { q: 'Ce cardinalitate are relația standard dimensiune → fact?', o: ['One-to-one', 'One-to-many', 'Many-to-many', 'Depinde de culori'], k: 1, x: '<b>1 : *</b>. Un client, multe comenzi. Filtrul curge de la partea 1 spre partea *.' },
      { q: 'Când îți ajunge un singur flat table?', o: ['Când ai 5 surse diferite', 'Listă scurtă, o singură sursă, prototip rapid', 'Când vrei time intelligence', 'Niciodată'], k: 1, x: 'Pentru ceva mic și rapid. Doare când se repetă texte și trebuie legată o a doua sursă.' }
    ] },
    vizPick: { viz: true, items: [
      { q: 'Cum a evoluat numărul de bilete în ultimii doi ani?', o: ['bar', 'line', 'donut', 'table'], k: 1, x: 'O evoluție în timp: <b>linie</b>, cu timpul pe axa orizontală.' },
      { q: 'Cât am vândut în total și din ce canale vine?', o: ['stacked', 'line', 'gauge', 'funnel'], k: 0, x: '<b>Stacked column</b>: segmentele se adună; vezi totalul și componența.' },
      { q: 'Ce pondere are fiecare canal, an de an?', o: ['bar', 'pct', 'waterfall', 'card'], k: 1, x: '<b>100% stacked</b>: fiecare coloană e 100%; compari părțile, nu valorile absolute.' },
      { q: 'Care dintre cele 18 produse (cu nume lungi) se vinde cel mai bine?', o: ['donut', 'line', 'bar', 'gauge'], k: 2, x: '<b>Bar orizontal</b> sortat: numele încap, cel mai mare e sus.' },
      { q: 'Cum ajungem de la venit la profit, cost cu cost?', o: ['funnel', 'waterfall', 'stacked', 'table'], k: 1, x: '<b>Waterfall</b>: pornește de la venit, fiecare cost coboară o treaptă.' },
      { q: 'Câți clienți rămân la fiecare etapă: vizită, coș, comandă, plată?', o: ['funnel', 'pct', 'line', 'card'], k: 0, x: '<b>Funnel</b>: arată cât se pierde de la o etapă la alta.' },
      { q: 'Avem un singur obiectiv: load factor 85% până la final de an. Cât am atins?', o: ['table', 'donut', 'gauge', 'bar'], k: 2, x: 'Un singur obiectiv, o singură cifră: <b>gauge</b>. Unul, nu cinci.' },
      { q: 'Directorul vrea venitul anului dintr-o privire.', o: ['card', 'table', 'funnel', 'stacked'], k: 0, x: 'O cifră: <b>card</b>, ideal cu reper (vs anul trecut) în reference label.' }
    ] },
    daxFill: { chips: true, items: [
      { code: 'Numar clienti = ___ ( Vanzari[ID_Client] )', q: 'Câți clienți <b>diferiți</b> au cumpărat?', o: ['COUNT', 'COUNTROWS', 'DISTINCTCOUNT', 'SUM'], k: 2, x: '<b>DISTINCTCOUNT</b> numără valorile unice. COUNT numără toate rândurile completate.' },
      { code: 'Numar linii = ___ ( Vanzari )', q: 'Câte rânduri are tabelul de vânzări?', o: ['COUNTROWS', 'DISTINCTCOUNT', 'SUM', 'DIVIDE'], k: 0, x: '<b>COUNTROWS</b> primește un tabel, nu o coloană.' },
      { code: 'Marja % = ___ ( [Profit], [Total Vanzari] )', q: 'Împarte fără eroare când vânzările sunt 0.', o: ['SUMX', 'DIVIDE', 'CALCULATE', 'ALL'], k: 1, x: '<b>DIVIDE</b> dă BLANK la împărțirea la zero, în loc de eroare.' },
      { code: 'Valoare = ___ ( Vanzari, Vanzari[Cantitate] * Vanzari[Pret] )', q: 'Înmulțește pe fiecare rând, apoi adună.', o: ['SUM', 'SUMX', 'COUNTROWS', 'TOTALYTD'], k: 1, x: '<b>SUMX</b> e un iterator: merge rând cu rând prin tabel.' },
      { code: 'Vanzari Electronice =\n___ ( [Total Vanzari], Dim_Produse[Categorie] = "Electronice" )', q: 'Aceeași măsură, mereu pe Electronice.', o: ['CALCULATE', 'DIVIDE', 'SUMX', 'DISTINCTCOUNT'], k: 0, x: '<b>CALCULATE</b> schimbă filtrele sub care se calculează măsura.' },
      { code: 'Total general = CALCULATE ( [Total Vanzari], ___ ( Dim_Produse ) )', q: 'Totalul pe toate produsele, oricare e ales în slicer.', o: ['ALL', 'SUM', 'DIVIDE', 'COUNTROWS'], k: 0, x: '<b>ALL</b> scoate filtrele de pe tabel. Numitorul pentru „% din total”.' },
      { code: 'Venit AT = CALCULATE ( [Venit], ___ ( Dim_Date[Data] ) )', q: 'Venitul din aceeași perioadă, anul trecut.', o: ['TOTALYTD', 'SAMEPERIODLASTYEAR', 'ALL', 'DIVIDE'], k: 1, x: '<b>SAMEPERIODLASTYEAR</b> mută perioada cu un an înapoi. Are nevoie de tabela de date.' },
      { code: 'Venit YTD = ___ ( [Venit], Dim_Date[Data] )', q: 'Cumulat de la 1 ianuarie până la data din context.', o: ['SAMEPERIODLASTYEAR', 'SUMX', 'TOTALYTD', 'CALCULATE'], k: 2, x: '<b>TOTALYTD</b>: year to date.' }
    ] },
    ctx: { items: [
      { ctx: t8('Regiune = Sud-Est', [2, 3, 4], [2, 3, 4]), code: 'Total = SUM ( Tabel[Valoare] )', q: 'Ce număr arată cardul cu [Total]?', o: ['1.600', '600', '300', '900'], k: 1, x: 'Intră doar rândurile verzi: 300 + 100 + 200 = <b>600</b>. Formula e aceeași, rândurile diferă: <b>filter context</b>.' },
      { ctx: t8('nimic ales', ALL8, [0, 2, 5]), code: 'Electronice = CALCULATE ( [Total], Tabel[Categorie] = "Electronice" )', q: 'Ce număr arată cardul cu [Electronice]?', o: ['1.600', '400', '950', '700'], k: 2, x: 'CALCULATE păstrează doar Electronice: 400 + 300 + 250 = <b>950</b>.' },
      { ctx: t8('Regiune = Centru', [5, 6, 7], [5]), code: 'Electronice = CALCULATE ( [Total], Tabel[Categorie] = "Electronice" )', q: 'Ce număr arată cardul cu [Electronice]?', o: ['250', '950', '450', '0'], k: 0, x: 'Filtrul pe Regiune (alt câmp) se <b>adaugă</b>: Centru și Electronice = <b>250</b>.' },
      { ctx: t8('Categorie = Alimente', [1, 3, 6], [0, 2, 5]), code: 'Electronice = CALCULATE ( [Total], Tabel[Categorie] = "Electronice" )', q: 'Slicerul e pe Alimente. Ce arată cardul cu [Electronice]?', o: ['300', 'BLANK', '950', '1.250'], k: 2, x: 'Pe <b>aceeași coloană</b>, filtrul din CALCULATE îl <b>înlocuiește</b> pe cel din slicer: tot <b>950</b>.' },
      { ctx: t8('Regiune = Nord-Vest', [0, 1], [0, 1]), code: '% din total =\nDIVIDE ( [Total], CALCULATE ( [Total], ALL ( Tabel ) ) )', q: 'Ce procent arată cardul?', o: ['100%', '34,4%', '25%', '55%'], k: 1, x: 'Numărătorul vede Nord-Vest: 550. Numitorul, cu ALL, vede tot: 1.600. 550 / 1.600 = <b>34,4%</b>.' },
      { ctx: t8('Categorie = Haine', [4, 7], [4, 7]), code: 'Numar linii = COUNTROWS ( Tabel )', q: 'Ce număr arată cardul?', o: ['8', '350', '2', '3'], k: 2, x: 'COUNTROWS numără rândurile rămase după filtru: <b>2</b>.' }
    ] },
    poveste: { items: [
      { q: 'Câte vizuale ar trebui să aibă o pagină, orientativ?', o: ['2–3', '4–8', '10–15', 'Câte încap'], k: 1, x: '<b>4–8</b>. Ce nu răspunde la întrebările paginii merge pe altă pagină.' },
      { q: 'Unde se uită ochiul primul pe o pagină?', o: ['Dreapta-jos', 'Centru', 'Stânga-sus', 'Pe slicere'], k: 2, x: '<b>Stânga-sus</b>: acolo pui cifrele principale. Detaliul merge jos.' },
      { q: 'Ce titlu e cel mai bun pentru graficul cu venitul pe companii?', o: ['Venit pe companii', 'Grafic 3', 'Două companii trag venitul sub țintă', 'VENIT!!!'], k: 2, x: 'Un <b>titlu-concluzie</b>: cititorul află ideea înainte să citească graficul.' },
      { q: 'Vrei venitul de anul acesta față de anul trecut și trendul pe ultimii ani, într-un singur vizual.', o: ['Card', 'KPI', 'Gauge', 'Pie chart'], k: 1, x: '<b>KPI</b>: valoarea, ținta (anul trecut) și trendul în fundal.' },
      { q: 'Unde setezi culoarea condiționată a barelor dintr-un grafic?', o: ['Home → Theme', 'Format → Columns → Color → fx', 'Power Query → Format', 'Model view'], k: 1, x: 'Butonul <b>fx</b>: gradient, reguli sau o măsură care întoarce culoarea.' }
    ] },
    service: { items: [
      { q: 'Maria are Excelul pe laptop. Vrea date noi în raportul din Service în fiecare dimineață, la 7:00. Ce face?', o: ['Trimite fișierul pe mail în fiecare zi', 'Mută fișierul în OneDrive / SharePoint și programează refresh-ul', 'Publică din nou în fiecare dimineață', 'Nu se poate'], k: 1, x: 'Schimbă sursa pe fișierul din cloud, publică o dată și setează <b>Scheduled refresh</b>. Alternativa: un <b>gateway</b> pe un PC mereu pornit.' },
      { q: 'Ați combinat trei fișiere dintr-un folder. Apare al patrulea. Ce faceți?', o: ['Refaceți tot din Power Query', 'Îl puneți în folder și dați Refresh', 'Faceți Append manual', 'Creați un raport nou'], k: 1, x: 'Pașii se aplică singuri pe orice fișier nou din folder.' },
      { q: 'Unde programezi refresh-ul unui raport publicat?', o: ['Desktop → Home → Refresh', 'Service → setările semantic model-ului', 'Power Query → Advanced Editor', 'Excel → Data → Refresh All'], k: 1, x: 'Workspace → semantic model → Settings → <b>Scheduled refresh</b>.' },
      { q: 'Ce face un field parameter pus într-un slicer?', o: ['Filtrează rândurile', 'Lasă cititorul să aleagă ce câmp sau ce măsură apare în vizual', 'Schimbă tema raportului', 'Programează refresh-ul'], k: 1, x: 'Un singur matrix devine multe tabele diferite.' }
    ] },

    // adevărat / fals
    timp: { items: [
      ['Tabela de date poate sări peste zilele în care nu s-a vândut nimic.', false, 'Trebuie <b>fiecare zi o singură dată</b>, fără goluri, pe ani întregi.'],
      ['Mark as date table se face pe tabelul de calendar, nu pe vânzări.', true, 'Pe <code>Dim_Date</code>, cu coloana de tip Date.'],
      ['Sort by column sortează textul Luna după Luna_Nr, în toate vizualele.', true, 'Altfel lunile apar alfabetic: Apr, Aug, Dec…'],
      ['TOTALYTD adună de la 1 ianuarie până la data din context.', true, 'Year to date. Cu DATESYTD în CALCULATE obții același lucru.'],
      ['Load factor de la 81% la 83% înseamnă o creștere de 2%.', false, 'E o creștere de <b>2 puncte procentuale</b>. 2% din 81% ar fi doar 1,6 puncte.'],
      ['Venit 75,9 M față de 69,0 M anul trecut înseamnă YoY de +10%.', true, '(75,9 − 69,0) / 69,0 = +10,0%.'],
      ['O ierarhie An → Trimestru → Lună pe axă permite drill down.', true, 'Săgețile din colțul vizualului urcă și coboară un nivel.'],
      ['Import aduce automat datele noi în Service, fără refresh.', false, 'Import ține o copie. Datele noi vin doar la refresh.']
    ] },
    pqTf: { items: [
      ['null, blank și error sunt același lucru, doar afișate diferit.', false, '<b>null</b>: lipsește valoarea. <b>blank</b>: text fără caractere. <b>error</b>: o transformare a eșuat.'],
      ['Când cureți în Power Query, se modifică și fișierul Excel de pe disc.', false, 'Sursa rămâne neatinsă. Power Query ține doar pașii.'],
      ['La Refresh, pașii din Applied Steps rulează din nou, de sus în jos.', true, 'E o rețetă, nu o copie a tabelului.'],
      ['Column quality arată pe fiecare coloană procentul de erori.', true, 'Bara de sub antet: verde valid, roșu erori, gri gol.'],
      ['Dacă ștergi un pas din mijloc, pașii de după pot primi eroare.', true, 'Mai ales dacă un pas de după folosește o coloană creată de el.'],
      ['Remove Errors e cea mai sigură soluție când „12,5” nu devine număr.', false, 'Ar șterge rânduri bune. Soluția: <b>Change Type → Using Locale</b>.']
    ] },

    // carduri de întors
    greseli: { items: [
      ['Pie chart cu cele 24 de filme.', 'Prea multe felii', 'Ponderea se citește pe ≤ 5 părți. Pentru 24: bare orizontale sortate, cu Top 10.'],
      ['Line chart cu genurile de film pe axa X.', 'Linia e pentru timp', 'Genurile nu au ordine. Linia sugerează o evoluție care nu există. Bare sortate.'],
      ['Pagina „Filme” are 11 grafice.', 'Prea aglomerat', 'Păstrezi 4–8 vizuale care răspund la întrebările paginii. Restul, pe altă pagină.'],
      ['Tabelul cu toate proiecțiile e sus, cardurile jos.', 'Ordinea e inversă', 'Ochiul pornește din stânga-sus. Cifrele principale sus, detaliul jos.']
    ] },
    pagina: { items: [
      ['Ai de făcut o pagină nouă. Ce stabilești înaintea graficelor?', 'Cititorul și întrebările', '<b>Cine</b> citește și <b>ce întrebări</b> are (3–6). Întrebările aleg graficele.'],
      ['„Câte bilete am vândut în total?” Ce îi lipsește întrebării?', 'Un reper', '„Câte bilete am vândut <b>față de anul trecut</b>?” O cifră fără reper nu spune dacă e bine sau rău.'],
      ['Cardul cu totalul general se schimbă la fiecare click pe un grafic. De ce?', 'Interacțiunile', 'Graficul filtrează implicit tot pagina. <b>Format → Edit interactions</b> → pe card: None.'],
      ['Alegi 2024 pe pagina 1, iar pe pagina 2 apar toți anii. De ce?', 'Slicerul e doar pe pagina lui', '<b>View → Sync slicers</b> și bifezi pagina 2 la sync.']
    ] }
  };

  /* ---------- butoanele comune ---------- */
  const bar = (extra) => '<div class="s12-act">' + (extra || '') + '<button type="button" class="s3-btn is-primary" data-check>Verifică</button><button type="button" class="s3-btn" data-solve>Arată soluția</button><button type="button" class="s3-btn" data-reset>De la capăt</button><span class="s12-score" data-score></span></div>';

  /* ---------- pune în ordine ---------- */
  function initOrder(root, set) {
    const correct = set.items.map((x) => x[0]);
    function render(list) {
      root.innerHTML = '<ol class="s12-order" data-list>' + list.map((x) => '<li draggable="true" data-v="' + x[0] + '"><span class="s12-grip" aria-hidden="true">⋮⋮</span><span class="s12-pos"></span><span class="s12-ot"><b>' + x[0] + '</b><small>' + x[1] + '</small></span></li>').join('') + '</ol>' + bar();
      wire();
    }
    function wire() {
      const ol = root.querySelector('[data-list]');
      let drag = null, picked = null;
      const clear = () => ol.querySelectorAll('li').forEach((li) => li.classList.remove('is-ok', 'is-bad'));
      ol.addEventListener('dragstart', (e) => { drag = e.target.closest('li'); drag.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); });
      ol.addEventListener('dragend', () => { drag && drag.classList.remove('is-drag'); drag = null; });
      ol.addEventListener('dragover', (e) => {
        e.preventDefault();
        const over = e.target.closest('li');
        if (!drag || !over || over === drag) return;
        const r = over.getBoundingClientRect();
        ol.insertBefore(drag, e.clientY > r.top + r.height / 2 ? over.nextSibling : over);
        clear(); root.querySelector('[data-score]').textContent = '';
      });
      // fără mouse: click pe două elemente le schimbă între ele
      ol.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        if (!picked) { picked = li; li.classList.add('is-pick'); return; }
        if (picked !== li) {
          const tmp = document.createElement('li');
          ol.insertBefore(tmp, picked); ol.insertBefore(picked, li); ol.insertBefore(li, tmp); tmp.remove();
        }
        picked.classList.remove('is-pick'); picked = null; clear();
      });
      root.querySelector('[data-check]').addEventListener('click', () => {
        let ok = 0;
        ol.querySelectorAll('li').forEach((li, i) => { const g = li.dataset.v === correct[i]; ok += g; li.classList.toggle('is-ok', g); li.classList.toggle('is-bad', !g); });
        root.querySelector('[data-score]').textContent = ok === correct.length ? 'Perfect, toate la locul lor.' : ok + ' din ' + correct.length + ' la locul lor';
      });
      root.querySelector('[data-solve]').addEventListener('click', () => { render(set.items); root.querySelector('[data-check]').click(); });
      root.querySelector('[data-reset]').addEventListener('click', () => render(shuffle(set.items)));
    }
    render(shuffle(set.items));
  }

  /* ---------- drag & drop: coloane sau potrivire ---------- */
  function initDrop(root, set, mode) {
    // fiecare card: { id, t (text), b (zona corectă) }
    const cards = mode === 'match'
      ? set.pool.map((t, i) => ({ id: 'c' + i, t, b: 'z' + set.items.findIndex((x) => x[1] === t) }))
      : set.items.map((x, i) => ({ id: 'c' + i, t: x[0], b: x[1] }));
    const zones = mode === 'match'
      ? set.items.map((x, i) => ({ id: 'z' + i, label: x[0], one: true }))
      : set.buckets.map((b) => ({ id: b[0], label: b[1], hint: b[2] }));
    const chip = (c) => '<span class="s12-chip" draggable="true" data-c="' + c.id + '">' + c.t + '</span>';
    function render() {
      const pool = '<div class="s12-pool" data-zone="pool"><small>' + (mode === 'match' ? 'Răspunsuri' : 'Carduri') + '</small>' + shuffle(cards).map(chip).join('') + '</div>';
      const z = mode === 'match'
        ? '<div class="s12-match">' + zones.map((zn, i) => '<div class="s12-mrow"><span class="s12-mn">' + pad(i + 1) + '</span><p>' + zn.label + '</p><div class="s12-slot" data-zone="' + zn.id + '"></div></div>').join('') + '</div>'
        : '<div class="s12-buckets">' + zones.map((zn) => '<div class="s12-bucket" data-zone="' + zn.id + '"><h3>' + zn.label + '</h3><small>' + zn.hint + '</small></div>').join('') + '</div>';
      root.innerHTML = '<div class="s12-drop is-' + mode + '">' + pool + z + '</div>' + bar();
      wire();
    }
    function wire() {
      let drag = null, picked = null;
      const score = root.querySelector('[data-score]');
      const zoneOf = (el) => el.closest('[data-zone]');
      const unmark = () => { root.querySelectorAll('.s12-chip').forEach((c) => c.classList.remove('is-ok', 'is-bad')); score.textContent = ''; };
      function place(c, zone) {
        if (!zone) return;
        const z = zones.find((x) => x.id === zone.dataset.zone);
        if (z && z.one) { const old = zone.querySelector('.s12-chip'); if (old && old !== c) root.querySelector('[data-zone="pool"]').appendChild(old); }
        zone.appendChild(c);
        unmark();
      }
      // zona peste care e cardul acum; la dragend îl punem acolo (și dacă browserul nu trimite drop)
      let over = null;
      root.addEventListener('dragstart', (e) => { drag = e.target.closest('.s12-chip'); if (drag) { e.dataTransfer.setData('text/plain', ''); drag.classList.add('is-drag'); } });
      document.addEventListener('dragover', (e) => {
        if (!drag) return;
        const z = root.contains(e.target) ? zoneOf(e.target) : null;
        if (z) e.preventDefault();
        if (z !== over) { over && over.classList.remove('is-over'); over = z; over && over.classList.add('is-over'); }
      });
      root.addEventListener('drop', (e) => e.preventDefault());
      root.addEventListener('dragend', () => {
        if (drag && over) place(drag, over);
        over && over.classList.remove('is-over');
        drag && drag.classList.remove('is-drag');
        drag = null; over = null;
      });
      // fără mouse: click pe card, apoi click pe zonă
      root.addEventListener('click', (e) => {
        const c = e.target.closest('.s12-chip');
        if (c) { if (picked) picked.classList.remove('is-pick'); picked = picked === c ? null : c; if (picked) picked.classList.add('is-pick'); return; }
        const z = zoneOf(e.target);
        if (picked && z) { picked.classList.remove('is-pick'); place(picked, z); picked = null; }
      });
      root.querySelector('[data-check]').addEventListener('click', () => {
        let ok = 0, placed = 0;
        root.querySelectorAll('.s12-chip').forEach((el) => {
          const zone = zoneOf(el).dataset.zone;
          if (zone === 'pool') return;
          placed++;
          const g = cards.find((c) => c.id === el.dataset.c).b === zone;
          ok += g; el.classList.toggle('is-ok', g); el.classList.toggle('is-bad', !g);
        });
        const need = mode === 'match' ? zones.length : cards.length;
        score.textContent = ok === need ? 'Perfect, totul e la locul lui.' : ok + ' din ' + need + ' corecte' + (placed < need ? ' · mai sunt ' + (need - placed) + ' de pus' : '');
      });
      root.querySelector('[data-solve]').addEventListener('click', () => {
        root.querySelectorAll('.s12-chip').forEach((el) => { const z = root.querySelector('[data-zone="' + cards.find((c) => c.id === el.dataset.c).b + '"]'); (z || root.querySelector('[data-zone="pool"]')).appendChild(el); });
        root.querySelector('[data-check]').click();
      });
      root.querySelector('[data-reset]').addEventListener('click', render);
    }
    render();
  }

  /* ---------- quiz pas cu pas ---------- */
  function initQuiz(root, set) {
    const n = set.items.length;
    const got = new Array(n).fill(null);
    // variantele în altă ordine la fiecare încărcare, ca răspunsul corect să nu fie mereu pe aceeași literă
    const ord = set.items.map((x) => shuffle(x.o.map((_, j) => j)));
    let i = 0;
    root.innerHTML = '<div class="s12-quiz"><div class="s12-qtop"><span class="s12-qn" data-n></span><div class="s12-qdots" data-dots>' + set.items.map(() => '<span></span>').join('') + '</div>' +
      '<div class="s12-qnav"><button type="button" data-prev>Înapoi</button><button type="button" data-next>Următoarea</button></div></div><div class="s12-qbody" data-body></div></div>';
    const body = root.querySelector('[data-body]');
    const dots = root.querySelectorAll('[data-dots] span');
    function show(k) {
      i = Math.max(0, Math.min(n - 1, k));
      const x = set.items[i];
      const code = x.code ? '<pre class="s12-code" data-code>' + x.code.replace(/___/, '<span class="s12-blank">___</span>') + '</pre>' : '';
      const opts = ord[i].map((j, pos) => { const o = x.o[j]; return set.viz
        ? '<button type="button" class="s12-opt is-viz" data-o="' + j + '">' + viz(o) + '<span>' + VIZ[o][0] + '</span></button>'
        : '<button type="button" class="s12-opt' + (set.chips ? ' is-chip' : '') + '" data-o="' + j + '"><b>' + 'ABCD'[pos] + '</b><span>' + o + '</span></button>'; }).join('');
      body.innerHTML = (x.ctx ? '<div class="s12-qsplit">' + x.ctx + '<div>' : '<div>') + code + '<p class="s12-ask">' + x.q + '</p><div class="s12-opts2' + (set.viz ? ' is-viz' : '') + (set.chips ? ' is-chips' : '') + '">' + opts + '</div><p class="s12-why" data-why hidden></p></div>' + (x.ctx ? '</div>' : '');
      root.querySelector('[data-n]').textContent = pad(i + 1) + ' / ' + pad(n);
      dots.forEach((d, j) => { d.className = (j === i ? 'is-cur ' : '') + (got[j] === true ? 'is-ok' : got[j] === false ? 'is-bad' : ''); });
      root.querySelector('[data-prev]').disabled = i === 0;
      root.querySelector('[data-next]').disabled = i === n - 1;
    }
    body.addEventListener('click', (e) => {
      const b = e.target.closest('[data-o]');
      if (!b || body.querySelector('.is-right')) return;
      const x = set.items[i];
      const ok = +b.dataset.o === x.k;
      if (got[i] === null) got[i] = ok;
      b.classList.add(ok ? 'is-right' : 'is-wrong');
      if (!ok) { body.querySelector('[data-o="' + x.k + '"]').classList.add('is-right'); }
      body.querySelectorAll('[data-o]').forEach((o) => o.classList.add('is-done'));
      const why = body.querySelector('[data-why]');
      why.hidden = false;
      why.innerHTML = (ok ? '<strong>Corect.</strong> ' : '<strong>Răspunsul: ' + (set.viz ? VIZ[x.o[x.k]][0] : x.o[x.k]) + '.</strong> ') + x.x;
      const note = body.querySelector('[data-note]');
      if (note) {
        body.querySelectorAll('.s12-ctx tbody tr').forEach((tr) => { tr.className = tr.hasAttribute('data-seen') ? 'is-on' : 'is-off'; });
        note.textContent = 'Verde: rândurile pe care le-a folosit măsura.';
      }
      const blank = body.querySelector('.s12-blank');
      if (blank) { blank.textContent = x.o[x.k]; blank.classList.add('is-filled'); }
      dots[i].className = 'is-cur ' + (got[i] ? 'is-ok' : 'is-bad');
      if (got.every((g) => g !== null)) {
        const s = got.filter(Boolean).length;
        why.innerHTML += '<span class="s12-final">Ați răspuns corect din prima la ' + s + ' din ' + n + ' întrebări.</span>';
      }
    });
    root.querySelector('[data-prev]').addEventListener('click', () => show(i - 1));
    root.querySelector('[data-next]').addEventListener('click', () => show(i + 1));
    show(0);
  }

  /* ---------- adevărat / fals ---------- */
  function initTf(root, set) {
    root.innerHTML = '<div class="s12-tf">' + set.items.map((x, i) => '<div class="s12-tfrow" data-i="' + i + '"><span class="s12-mn">' + pad(i + 1) + '</span><p>' + x[0] + '</p><div class="s12-tfbtn"><button type="button" data-a="1">Adevărat</button><button type="button" data-a="0">Fals</button></div><p class="s12-tfwhy" hidden></p></div>').join('') + '</div>' +
      '<div class="s12-act"><span class="s12-score" data-score></span></div>';
    let ok = 0, done = 0;
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      const row = b.closest('[data-i]');
      if (row.classList.contains('is-done')) return;
      const x = set.items[+row.dataset.i];
      const good = (b.dataset.a === '1') === x[1];
      row.classList.add('is-done', good ? 'is-ok' : 'is-bad');
      row.querySelector('[data-a="' + (x[1] ? 1 : 0) + '"]').classList.add('is-right');
      if (!good) b.classList.add('is-wrong');
      const w = row.querySelector('.s12-tfwhy');
      w.hidden = false;
      w.innerHTML = '<strong>' + (x[1] ? 'Adevărat.' : 'Fals.') + '</strong> ' + x[2];
      ok += good; done++;
      root.querySelector('[data-score]').textContent = ok + ' din ' + done + ' corecte' + (done === set.items.length ? ' · gata' : '');
    });
  }

  /* ---------- carduri de întors ---------- */
  function initFlip(root, set) {
    root.innerHTML = set.items.map((x, i) => '<button type="button" class="s6-flip" aria-pressed="false"><span class="s6-flip-inner">' +
      '<span class="s6-flip-face s6-flip-front"><span class="s6-flip-n">' + pad(i + 1) + '</span><span class="s6-flip-q">' + x[0] + '</span><span class="s6-flip-hint">Gândește răspunsul, apoi întoarce cardul</span></span>' +
      '<span class="s6-flip-face s6-flip-back"><span class="s6-flip-n">' + pad(i + 1) + '</span><span class="s6-flip-title">' + x[1] + '</span><span class="s6-flip-text">' + x[2] + '</span></span></span></button>').join('');
    root.querySelectorAll('.s6-flip').forEach((b) => b.addEventListener('click', () => b.setAttribute('aria-pressed', b.classList.toggle('is-flipped') ? 'true' : 'false')));
  }

  const INIT = { order: initOrder, buckets: (r, s) => initDrop(r, s, 'buckets'), match: (r, s) => initDrop(r, s, 'match'), quiz: initQuiz, tf: initTf, flip: initFlip };
  document.querySelectorAll('[data-s12]').forEach((root) => {
    const set = SETS[root.dataset.set];
    if (set && INIT[root.dataset.s12]) INIT[root.dataset.s12](root, set);
  });
})();
