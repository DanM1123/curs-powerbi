# Sesiunea 5 · Vizualizări — Plan revizuit, documentat

Structura tehnică și partea de recapitulare rămân **neschimbate** față de planul inițial (deja revizuite). Tot ce urmează dezvoltă mult mai documentat Partea B (generală) și Partea C (grafice, unul câte unul), cu informații verificate din documentația oficială Power BI și din surse de referință pentru fiecare tip de grafic.

---

## Structură tehnică (păstrată identic)

Pagină nouă: `Curs Oficial/sesiuni/s05/index.html`. Același schelet ca la s04: hub-page, nav, student-shell, slide-deck, slide-nav, main.js. Include style.css, session.css, extras.css, s02.css, s03.css.

Fișier CSS nou: `Curs Oficial/css/s05.css` — doar ce e nou: layout pentru grafice, field wells, tooltips, stiluri SVG. Aceleași variabile de temă (light/dark).

Fișier JS nou: `Curs Oficial/js/s05.js` — funcții `initS5*()` și `boot()`. Grafice desenate ca SVG din date mici, definite direct în fișier.

În `Curs Oficial/index.html`, cardul „05 · Vizualizări" trece din `div.hub-go.is-soon` în link activ `a.hub-go`.

Componente reutilizate: `s2-reveal-card` / `data-bi-stages`, `data-s3-recap` + `s3-q` + `data-s3-reveal`, `s3-concepts`, `s3-duo`, `s3-note`, `s4-picks`, `s4-tema-tabs` + `data-s3-cat`, `closing-hero` / `closing-band`.

## Fluxul lecției

```
Recapitulare s04 → Ce este un visual → Anatomie și Visualizations pane
→ Ce întrebare pui, ce grafic alegi → 13 grafice în detaliu → Încheiere
```

---

## A. Recapitulare sesiunea 4 (păstrată neschimbat — deja revizuită)

Slide 1 (reveal cards): fact vs dimension, PK vs FK, cardinalitate *:1, direcția filtrului, star vs snowflake, de ce există Dim_Date.

Slide 2 (data-s3-recap): dezavantajele unui flat table; ce face Mark as date table; unde stă filtrul și unde stau numerele (s4-picks); ce coloană merge în fact și ce merge în dimensiune.

Slide-punte: pe axă și în legendă pui câmpuri din dimensiuni; la Values pui numerele din fact.

---

## B. Partea generală (dezvoltată)

### B1. Harta sesiunii

`s3-concepts` cu cele 6 categorii de grafice, ca organizator vizual pentru tot restul lecției (aceleași 6 categorii revin ca badge pe fiecare slide de grafic din Partea C):

1. **Comparație** — bar, column
2. **Parte din întreg** — 100% stacked, treemap
3. **Evoluție în timp** — line, area, combo
4. **Contribuție sau pași** — waterfall, funnel
5. **Relație între două măsuri** — scatter
6. **Detaliu și cauze** — table, matrix, decomposition tree

### B2. Ce este un visual

Un visual transformă o întrebare într-un răspuns pe care ochiul îl citește mai repede decât mintea calculează un tabel de numere. Demo interactiv: aceleași 12 numere (de exemplu, vânzări lunare), afișate mai întâi ca tabel brut, apoi ca grafic — un toggle comută între cele două reprezentări ale acelorași date. Punctul pedagogic: numerele nu s-au schimbat, doar modul de citire.

**De adăugat, ca fir conducător explicit pentru tot restul sesiunii:** graficul nu e un scop în sine — e răspunsul la o întrebare de business, formulată dinainte. „Care lună a avut cele mai mari vânzări?" cere un grafic diferit de „Cum s-au distribuit vânzările pe categorii, luna asta?" chiar dacă ambele pornesc din același tabel de date.

### B3. Anatomia unui grafic

SVG cu etichete care se aprind la hover sau click: titlu, axe, legendă, data labels, tooltip, gridlines. Fiecare element identificat capătă o singură propoziție de rol (nu doar numele lui):

- **Titlu** — spune ce întrebare răspunde graficul, nu doar ce date conține.
- **Axe** — X definește categoriile sau timpul; Y definește scara numerică.
- **Legendă** — arată a treia dimensiune adăugată printr-o culoare (o categorie suplimentară).
- **Data labels** — valoarea exactă suprapusă pe element, utilă când precizia contează mai mult decât forma.
- **Tooltip** — context suplimentar, disponibil la interacțiune, fără să aglomereze vizualul de bază.
- **Gridlines** — reper vizual pentru citirea aproximativă a valorilor pe axă.

### B4. Visualizations pane în Power BI

Trei tab-uri: **Build** (structura — ce câmp merge unde), **Format** (aspect — culori, titluri, dimensiuni), **Analytics** (linii de referință — medie, tendință, min/max).

Field wells explicate ca vocabular comun pentru toate graficele din Partea C (fiecare grafic folosește un subset din acestea, cu nume ușor diferite de la un tip la altul):

| Field well | Rol | Vine, de regulă, din |
|---|---|---|
| **X-axis / Category / Rows** | Categoriile sau timpul pe orizontală | O dimensiune (Dim_Calator, Dim_Date) |
| **Y-axis / Values** | Numărul care determină înălțimea/mărimea | O măsură din fact table |
| **Legend / Columns** | A treia dimensiune, codificată prin culoare | O altă dimensiune |
| **Size** | A patra dimensiune, codificată prin mărime (doar scatter) | O măsură din fact table |
| **Tooltips** | Context suplimentar, ascuns până la hover | Orice câmp |
| **Play Axis** | Adaugă timpul ca animație (doar scatter) | O coloană din Dim_Date |

Regulă generală de reținut, care leagă direct de sesiunea trecută: **câmpurile de context (text, categorii) merg pe axă, în legendă sau la rows/columns — vin din dimensiuni. Câmpurile numerice care se agregă merg la values — vin din fact.**

### B5. Alegerea graficului după întrebare

Selector interactiv: click pe o categorie evidențiază graficele potrivite din harta B1. Fiecare categorie primește o întrebare-tip, ca ancoră:

| Categorie | Întrebarea-tip | Grafice |
|---|---|---|
| Comparație | „Care e mai mare?" | Bar, Column |
| Parte din întreg | „Cât la sută din total?" | 100% stacked, Treemap |
| Evoluție în timp | „Cum s-a schimbat?" | Line, Area, Combo |
| Contribuție sau pași | „Ce a dus la rezultatul final?" | Waterfall, Funnel |
| Relație între două măsuri | „Există o legătură între X și Y?" | Scatter |
| Detaliu și cauze | „De ce s-a întâmplat asta?" | Table, Matrix, Decomposition tree |

### B6. Reguli generale de design (s3-duo / s4-picks, „Da" / „Nu")

- Axa valorică pornește de la 0 — altfel diferențele se exagerează vizual.
- Maximum 5-7 categorii pe un grafic — peste acest prag, gruped restul în „Altele" sau treci la un tabel.
- Sortare după valoare, nu alfabetic — excepție: axele de timp, care rămân cronologice.
- Culori cu sens — o singură culoare accentuată pentru ce contează, restul în nuanțe neutre; nu una diferită pentru fiecare categorie doar ca decor.
- Fără 3D — distorsionează percepția mărimii.
- Fără pie chart cu peste 5-6 felii — ochiul nu poate compara unghiuri cu precizie; un bar chart sortat face treaba mai bine aproape mereu.

**Cross-filtering:** un click pe un element dintr-un grafic filtrează automat celelalte vizuale de pe pagină — exact același mecanism de propagare a filtrului prin relații, discutat la sesiunea trecută, dar declanșat acum dintr-un vizual, nu dintr-un slicer.

---

## C. Graficele în detaliu

Template unic pentru toate: grafic live SVG în stânga (tooltip la hover, legendă apăsabilă ca să ascunzi o serie, toggle între variante unde are sens), taburi în dreapta (**La ce folosește** · **Exemple reale** · **Cum îl construiești** · **Întrebări la care răspunde** · **Date potrivite** · **Atenție la / Alternativă**), badge de categorie sus, legat de harta din B1.

---

### C1. Stacked column chart

**Categorie:** Parte din întreg / Comparație

**La ce folosește:** arată o valoare totală, împărțită pe categorii, pentru mai multe grupuri comparate unul lângă altul. Fiecare coloană e o „stivă" de segmente colorate.

**Exemple reale:** vânzările lunare ale unui supermarket, împărțite pe categorii (lactate, băuturi, panificație). Bugetul unui departament, împărțit pe tipuri de cheltuieli, pe trimestre.

**Cum îl construiești (field wells confirmate din documentația Power BI):**
1. Selectezi vizualul **Stacked column chart**.
2. Câmpul categorial principal (de exemplu, luna) → **X-axis**.
3. Măsura numerică (de exemplu, suma vânzărilor) → **Y-axis**.
4. Al doilea câmp categorial (de exemplu, categoria de produs) → **Legend** — acest pas transformă coloana simplă într-o coloană împărțită pe segmente.

Recomandare oficială Microsoft: combinația minimă e un câmp pe X-axis + o măsură pe Y-axis; adăugarea unui câmp pe Legend creează segmentarea. Column chart cu mai multe măsuri pe Y-axis nu suportă Legend simultan.

**Întrebări la care răspunde:** „Cât a fost totalul pe fiecare lună, și din ce s-a compus?"

**Date potrivite:** o categorie principală pe X (timp sau grup), o categorie secundară pe Legend (max. 4-6 segmente lizibile), o măsură agregabilă.

**Atenție la:** peste 6-7 segmente în legendă, culorile devin greu de distins. **Alternativă:** dacă interesează doar procentul, nu valoarea absolută → 100% Stacked column.

---

### C2. Stacked bar chart (orizontal)

**Categorie:** Comparație

**La ce folosește:** identic cu stacked column, dar orizontal — categoriile stau pe axa verticală, valorile pe orizontală.

**Exemplu real:** numărul de tichete de suport pe agent, împărțite după prioritate (urgent, mediu, scăzut).

**Cum îl construiești:** aceleași field wells ca la stacked column (**Y-axis** pentru categorie, **X-axis** pentru valoare, **Legend** pentru segmentare) — orientarea se schimbă, logica field wells rămâne identică.

**Când alegi orizontal, nu vertical:** nume de categorii lungi (care s-ar suprapune pe axa X a unui column chart), sau multe categorii (un bar chart orizontal se derulează mai natural pe verticală decât un column chart se lățește pe orizontală).

**Întrebări la care răspunde:** „Care agent are cele mai multe tichete, și cum se împart pe priorități?"

**Atenție la:** aceleași reguli ca la stacked column — nu abuza de segmente multe.

---

### C3. 100% Stacked bar / column chart

**Categorie:** Parte din întreg

**La ce folosește:** fiecare coloană/bară ajunge la exact 100%, indiferent de valoarea totală absolută — utilă când interesează strict proporția, nu mărimea.

**Exemplu real:** ponderea metodelor de plată (card, numerar, online) în fiecare magazin — indiferent dacă un magazin are 100 sau 10.000 de tranzacții, graficul arată doar structura procentuală.

**Cum îl construiești:** field wells identice cu stacked column/bar (X sau Y-axis pentru categorie, Legend pentru segmentare) — diferența e doar tipul de vizual ales din Visualizations pane, care normalizează automat fiecare coloană la 100%.

**Exercițiu recomandat în slide:** toggle între stacked și 100% stacked, pe același set de date — se vede clar diferența: stacked arată mărimea absolută, 100% arată doar structura.

**Întrebări la care răspunde:** „Cum se compară structura procentuală între grupuri, indiferent de mărimea lor totală?"

**Atenție la:** pierzi informația despre mărimea absolută — un magazin mic și unul mare pot arăta identic dacă structura procentuală coincide, deși volumele diferă enorm.

---

### C4. Line chart

**Categorie:** Evoluție în timp

**La ce folosește:** date continue, afișate ca puncte conectate prin linii — cel mai potrivit pentru tendințe, sezonalitate, schimbări pe termen lung.

**Exemple reale:** vizitatori pe zi pe un site, temperatura medie lunară.

**Cum îl construiești:**
1. Câmp de timp (de exemplu, data) → **X-axis**.
2. Măsură numerică → **Y-axis**.
3. Opțional, un câmp categorial → **Legend**, pentru linii multiple pe același grafic.

Power BI oferă patru variante înrudite: **Line chart**, **Area chart**, **Stacked area chart**, **100% stacked area chart** — toate din aceeași familie, alese din Visualizations pane.

**De ce contează Dim_Date aici, explicit:** axa X poate fi setată **Categorical** (fiecare valoare, distanță egală) sau **Continuous** (proporțional cu scara reală de timp) — opțiune disponibilă doar cu o coloană de tip dată reală, exact tabelul de date construit la sesiunea trecută. Fără Dim_Date, zilele fără evenimente lipsesc din axă, iar linia „sare" peste goluri, dând impresia unei continuități care nu există.

**Întrebări la care răspunde:** „Cum a evoluat valoarea în timp?"

**Atenție la:** prea multe linii (peste 4-5) devin ilizibile — „spaghetti chart". **Alternativă:** small multiples (un mini-grafic separat pentru fiecare serie) sau un selector care filtrează o singură linie la un moment dat.

---

### C5. Area chart (și stacked area)

**Categorie:** Evoluție în timp

**La ce folosește:** ca line chart, dar cu suprafața de sub linie colorată — accentuează vizual volumul acumulat, nu doar traiectoria.

**Exemplu real:** consumul de energie al unei case, pe surse (rețea, panouri solare) — stacked area arată atât evoluția totalului, cât și contribuția fiecărei surse.

**Cum îl construiești:** field wells identice cu line chart (X-axis pentru timp, Y-axis pentru valoare, Legend pentru serii multiple — care, la stacked area, se suprapun vizual în loc să se intersecteze).

**Întrebări la care răspunde:** „Cum a evoluat volumul total, și din ce s-a compus de-a lungul timpului?"

**Atenție la:** cu mai multe serii suprapuse, seriile din spate devin greu de citit dacă nu sunt stacked. **Alternativă:** dacă seriile se intersectează des și interesează comparația directă, un line chart simplu (fără umplere) e mai clar decât un area chart.

---

### C6. Line and stacked column chart (combo)

**Categorie:** Evoluție în timp

**La ce folosește:** combină două măsuri cu scări diferite pe același grafic — coloanele arată un total compus din părți, linia arată o a doua măsură, adesea un procent sau un raport.

**Exemplu real:** venitul lunar pe categorii (coloane, stivuite) și marja procentuală (linie, pe axa secundară).

**Cum îl construiești (confirmat oficial):**
1. Câmp de timp → **X-axis**.
2. Prima măsură (de exemplu, venitul) → **Column y-axis**.
3. A doua măsură (de exemplu, marja %) → **Line y-axis**.

**Pas critic, frecvent omis:** dacă cele două măsuri au scări foarte diferite (venit în mii/milioane, marjă procentuală 0-100), linia devine plată și inutilă pe aceeași axă. Se activează axa secundară din Format, ca linia să aibă propria scară, dedicată.

**Întrebări la care răspunde:** „Cum evoluează totalul compus, comparat cu o rată sau un procent derivat?"

**Atenție la:** intersecțiile dintre linie și coloane pot părea semnificative vizual, dar depind pur de scara aleasă pe fiecare axă — nu confunda un „punct de intersecție" cu un eveniment real din date.

---

### C7. Waterfall chart

**Categorie:** Contribuție sau pași

**La ce folosește:** arată efectul cumulativ al unor valori pozitive și negative introduse secvențial — cum se ajunge, pas cu pas, de la o valoare de start la una finală.

**Exemple reale:** de la venit la profit net (costuri, taxe, salarii scăzute succesiv). Soldul unui cont bancar pe parcursul unei luni, cu fiecare tranzacție ca un pas.

**Cum îl construiești:**
1. Câmp categorial (etapele) → **Category**.
2. Măsură cu **valori cu semn** (pozitive = creșteri, negative = scăderi) → **Y-axis**.
3. Opțional, un câmp de subcategorie → **Breakdown**, pentru a descompune fiecare pas pe o dimensiune suplimentară (de exemplu, sursa fiecărei cheltuieli).

**Regulă de date, esențială:** sursa trebuie să conțină deja valori cu semn corect (pozitiv pentru creștere, negativ pentru scădere) — graficul nu deduce singur direcția, doar colorează automat (implicit: verde pentru creștere, roșu pentru scădere, gri pentru total).

**Întrebări la care răspunde:** „Ce factori au contribuit, pas cu pas, la rezultatul final?"

**Atenție la:** prea multe categorii aglomerează graficul — gruped categoriile mici într-un „Altele". **Greșeală frecventă:** date fără semn corect (toate pozitive) — graficul arată doar creșteri, fără sens.

---

### C8. Funnel chart

**Categorie:** Contribuție sau pași

**La ce folosește:** vizualizează un proces secvențial cu pierderi progresive la fiecare etapă — un pipeline de vânzări, un proces de conversie.

**Exemple reale:** magazin online (vizite → coș → checkout → plată). Proces de recrutare (aplicații → interviu → ofertă → angajare).

**Cum îl construiești:**
1. Câmpul categorial cu etapele procesului → **Group** (sau **Category**, în funcție de versiune).
2. Măsura numerică (numărul de cazuri la fiecare etapă) → **Values**.

**Regulă de date, critică:** sursa trebuie să conțină etapele deja ordonate logic (nu alfabetic) — Power BI sortează implicit alfabetic sau descrescător după valoare, ceea ce poate rupe ordinea reală a procesului. Se rezolvă cu o coloană ajutătoare de sortare (Sort by column) legată de etapă.

**Ce arată automat:** rata de conversie între etape consecutive, la hover pe fiecare segment.

**Întrebări la care răspunde:** „Unde se pierd cei mai mulți oameni/cazuri în acest proces?"

**Atenție la:** dacă etapele nu sunt strict descrescătoare ca volum (ceea ce se poate întâmpla legitim, de exemplu reveniri într-un proces), forma de „pâlnie" clasică se rupe vizual. **Alternativă:** dacă procesul nu e strict secvențial, un bar chart simplu comunică la fel de clar, fără forma înșelătoare de pâlnie.

---

### C9. Scatter chart

**Categorie:** Relație între două măsuri

**La ce folosește:** arată relația (corelație, tipar) dintre două măsuri numerice, cu fiecare punct reprezentând o entitate individuală.

**Exemplu real:** bugetul de reclamă comparat cu vânzările, pentru fiecare magazin.

**Cum îl construiești (confirmat oficial, până la 3 măsuri + o categorie într-un singur grafic):**
1. Prima măsură → **X Axis**.
2. A doua măsură → **Y Axis**.
3. Opțional, a treia măsură (de exemplu, numărul de angajați) → **Size** — transformă punctele în bule de mărimi variabile.
4. Opțional, un câmp categorial → **Legend** — colorează punctele pe categorii.
5. Opțional, o coloană de dată → **Play Axis** — adaugă animație temporală, punctele se mută pe măsură ce timpul avansează.

**Detaliu tehnic important:** dacă mai multe rânduri au aceleași valori X/Y, trebuie un câmp unic (ID) în **Details**, altfel Power BI le agregă într-un singur punct în loc să le arate separat.

**Întrebări la care răspunde:** „Există o legătură între aceste două măsuri? Cine iese în evidență (outlieri)?"

**Date potrivite:** două măsuri numerice continue, plus opțional o a treia (size) și o categorie (legend) — nu funcționează bine cu date pur categoriale.

**Atenție la:** corelație vizuală nu înseamnă cauzalitate — un tipar pe scatter arată o asociere, nu explică de ce există.

---

### C10. Treemap

**Categorie:** Parte din întreg

**La ce folosește:** afișează date ierarhice ca dreptunghiuri imbricate, cu mărimea proporțională cu o valoare numerică — potrivit pentru multe categorii, unde interesează atât structura part-din-întreg, cât și identificarea rapidă a outlierilor (dreptunghiuri mult mai mari sau mici decât restul).

**Exemple reale:** bugetul unei primării pe departamente și subdepartamente. Consumul de spațiu de stocare, pe echipe.

**Cum îl construiești:**
1. Câmp categorial → **Category** (poate avea mai multe niveluri, pentru ierarhie și drill-down).
2. Măsură numerică → **Values** — determină mărimea fiecărui dreptunghi.

**Când e preferat treemap-ului unui bar chart:** cu multe categorii (20+), un bar chart devine o listă lungă greu de scanat; treemap-ul permite ochiului să identifice instant cele câteva dreptunghiuri dominante, restul rămânând vizibile, dar secundare.

**Întrebări la care răspunde:** „Cum se distribuie un total pe multe categorii, și care ies în evidență ca mărime?"

**Atenție la:** cu prea multe categorii mici, dreptunghiurile devin ilizibile (text netăiat). **Alternativă:** pentru date exacte, sortabile → Matrix sau Table. Pentru analiză automată a cauzelor → Decomposition tree.

---

### C11. Matrix

**Categorie:** Detaliu și cauze

**La ce folosește:** echivalentul unui pivot table din Excel — date încrucișate pe rânduri și coloane, cu valori agregate la intersecție, cu suport nativ pentru ierarhii și drill-down.

**Exemplu real:** vânzări pe regiune (rânduri) și trimestru (coloane), cu expand/collapse pe ierarhie și subtotaluri automate.

**Cum îl construiești:**
1. Câmp categorial → **Rows** (poate avea mai multe niveluri, pentru ierarhie — de exemplu, Regiune → Oraș).
2. Câmp categorial diferit → **Columns**.
3. Măsură numerică → **Values** — Power BI o agregă implicit (Sum), configurabil la Average, Count, Min, Max.

**Diferența față de Table, explicată clar:** Table afișează o listă plată, două dimensiuni (rânduri + coloane simple). Matrix adaugă o a treia dimensiune — încrucișarea rânduri × coloane, plus suportul de drill-down pe ierarhii, cu subtotaluri și grand total calculate automat pe fiecare nivel.

**Întrebări la care răspunde:** „Cum se compară o măsură, încrucișată pe două dimensiuni simultan, cu detaliu la cerere (drill-down)?"

**Atenție la:** cu prea multe combinații rând × coloană, grila devine greu de scanat — util să limitezi la 1-2 niveluri de ierarhie vizibile simultan, cu restul accesibil prin expand.

---

### C12. Table

**Categorie:** Detaliu și cauze

**La ce folosește:** listă plată, un rând per înregistrare, ideală când utilizatorul are nevoie de valori exacte, nu de o formă vizuală de comparație.

**Exemplu real:** lista de facturi (număr, client, dată, sumă, status) — sortabilă la click pe antet, cu conditional formatting pe coloana de status sau sumă.

**Cum îl construiești:**
1. Câmpuri (categoriale și/sau numerice) → drag direct în **Columns** — fiecare câmp devine o coloană a tabelului, în ordinea adăugării.

**Când alegi Table, nu Matrix:** când nu ai nevoie de o încrucișare rând × coloană, ci doar de o listă simplă de înregistrări cu atributele lor — Table e mai rapid de citit pentru acest caz, fără complexitatea suplimentară a unei grile bidimensionale.

**Întrebări la care răspunde:** „Care sunt exact valorile individuale, pentru fiecare înregistrare?"

**Atenție la:** un table cu sute de rânduri, fără filtrare sau paginare, devine un „ecran de derulat" inutil — de regulă e combinat cu un slicer sau folosit doar pe un subset deja filtrat.

---

### C13. Decomposition tree

**Categorie:** Detaliu și cauze

**La ce folosește:** descompune interactiv o măsură pe mai multe dimensiuni succesive, cu asistență AI care identifică automat unde se află valoarea cea mai mare sau cea mai mică — instrumentul potrivit pentru analiza „de ce", nu doar „cât".

**Exemplu real:** de ce au scăzut vânzările — arborele se desface interactiv, nod cu nod: total → regiune → magazin → produs.

**Cum îl construiești:**
1. Măsura de investigat → **Analyze** (de exemplu, suma vânzărilor).
2. Una sau mai multe dimensiuni candidate → **Explain by** (de exemplu, regiune, categorie produs, canal de vânzare) — ordinea influențează sugestiile AI, dar nu blochează un anumit traseu de explorare.

**AI Splits, mecanismul exact:** la click pe „+" lângă orice nod, pe lângă selecția manuală a unei dimensiuni din Explain by, apar două opțiuni asistate de AI:
- **High value** — Power BI scanează toate dimensiunile din Explain by și expandează automat pe cea și valoarea care contribuie cel mai mult la rezultat.
- **Low value** — identică logică, dar pentru cea mai mică contribuție.

Un bec (💡) marchează nodurile generate prin AI split, cu tooltip explicativ („Suma e cea mai mare când Regiunea e Sud-Vest"). Mod suplimentar de analiză: **Absolute** (valoarea brută cea mai mare/mică) vs. **Relative** (valoarea care iese cel mai mult în evidență, comparativ cu restul din aceeași coloană) — configurabil din Format.

**Întrebări la care răspunde:** „Care factor explică cel mai bine acest rezultat? Unde ar trebui să mă uit în continuare?"

**Atenție la:** decomposition tree e un instrument de explorare, nu de raportare statică — potrivit pentru analiză live, mai puțin pentru un dashboard fix pe care utilizatorii doar îl citesc pasiv.

---

## D. Încheiere (păstrat neschimbat)

`closing-band` cu 4 carduri: întrebarea alege graficul; dimensiunile merg pe axă, faptele la valori; regulile de design; graficele de detaliu (matrix și decomposition tree). Fără temă — exercițiul se face live în Power BI.

---

## Detalii de implementare JS (s05.js) — păstrate neschimbat

Helper SVG (`svgEl`, `scaleLinear`, `axis`) + o funcție de desenare per familie: `drawBars`, `drawLineArea`, `drawCombo`, `drawWaterfall`, `drawFunnel`, `drawScatter`, `drawTreemap`, `renderMatrix`, `renderTable`, `initDecompTree`.

Grafice declarate în HTML prin `data-s5-chart="stacked-column"`, date într-un obiect `DATA` în JS. Tooltip comun (`initS5Tooltip`), toggle comun (`data-s5-variant`). Animație de „desenare" la activarea slide-ului (`data-s4-draw`). Fără librării externe.

---

## Ce s-a adăugat față de planul inițial

- Field wells exacte, verificate, pentru toate cele 13 grafice (nu doar nume generice de „category/values", ci denumirile reale din Power BI: Column y-axis / Line y-axis pentru combo, Group pentru funnel, Analyze/Explain by pentru decomposition tree etc.)
- Pentru fiecare grafic: un paragraf „de ce acest grafic și nu altul" (alternativă explicită), nu doar definiție izolată
- Mecanismul AI Splits (High value / Low value, Absolute / Relative) explicat concret, cu sursă din documentația oficială
- Regula de date obligatorie pentru waterfall (valori cu semn) și funnel (ordine, nu alfabetic) — greșeli frecvente documentate explicit
- Legătura explicită Dim_Date → axa Continuous la line chart, care conectează direct la sesiunea anterioară
- Tabel comparativ Matrix vs. Table, cu criteriul clar de alegere
- B4 (Visualizations pane) extins cu un tabel unificat de field wells, ca vocabular comun înainte de a intra în cele 13 grafice individuale
