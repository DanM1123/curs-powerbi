# Sesiunea 11 · Context în rapoarte: cifra, pagina, celula — plan facilitator

Starea curentă: 27 de slide-uri. Tema: același model aviație din S10 (baza Azure `Flyableinc`, 2021–2025, EUR), cu un tabel nou, `Tinte`. Cititorul raportului din toate exemplele: directorul comercial. Firul lecției: o cifră are nevoie de un reper, o pagină de o întrebare, o celulă colorată de o regulă.

| Slide-uri | Conținut |
|-----------|----------|
| 1–4 | Copertă, recap S10, conceptele de azi, cârligul: cardul „75,9 M” la care se adaugă pe rând anul trecut, ținta, trendul și companiile |
| 5–10 | Partea 1 · Contextul unei cifre: cuprins; ce e un KPI (exemple din viața de zi cu zi, rețeta valoare + comparație + direcție); puncte procentuale (două cursoare, diferența în pp); cele 4 repere, fiecare pe un buton cu schemă și explicație; YoY interactiv (companie × lună: valorile și diferența); QoQ față de YoY pe același trimestru, cu „De ce diferă?” (sezonul) |
| 11–15 | Același KPI în Card nou / KPI / Gauge / Multi-row card / Table (valoarea + comparația cu anul trecut; la gauge, ținta); măsuri de comparație (PY, Δ și YoY %, PQ și QoQ %, YTD/PYTD, Δ pp): codul, logica în cuvinte și de ce e scrisă așa; trei carduri cu reper construite din aceste măsuri (venit vs anul trecut, venit T4 vs trimestrul trecut, load factor în pp); cum se face fiecare vizual (inclusiv încărcarea `Tinte.xlsx` la gauge); quiz „Ce vizual alegi?” |
| 16–21 | Partea 2 · Contextul unei pagini (după *Storytelling with Data*): cuprins; cine/ce/cum și Big Idea (slab vs bun); arborele de întrebări: schița fiecărei pagini și, dedesubt, ce punem pe ea și de ce; fluxul Overview → Diagnostic → Detaliu; storyboard cu tragere (sau săgeți), verificare și titluri-concluzie; graficul de curățat: clasa discută întâi, apoi „Arată pașii” (ultimul pas: un titlu simplu) |
| 22–26 | Partea 3 · Contextul unei celule: cuprins; brad de Crăciun vs o singură regulă; harta tipuri × moduri; matrix rută × trimestru; fx pe bar chart |
| 27 | Încheiere |

## De știut
- Conexiunea la Azure e cea din S10 (utilizatorul `curs_powerbi`, parola la curs). Cine nu se poate conecta folosește Excel-urile din `sesiuni/s10/date/`.
- `Tinte.xlsx` se încarcă separat (Get data → Excel) și se leagă de `Dim_Date[ID]` și `Dim_Companii[ID]` (pașii sunt pe slide-ul „Cum se face fiecare vizual”, la Gauge).
- Povestea din date, de repetat pe tot parcursul: +10% față de 2024, dar −1,8% sub țintă, pentru că AeroCarpati (35% din venit) scade cu 1%; celelalte cresc cu 17%.
- Culorile lecției sunt albastru (mai bine) și portocaliu (mai rău), nu verde/roșu: e unul dintre mesajele părții 3.
- La slide-ul 21 lăsați clasa 2 minute să spună ce ar schimba, înainte de „Arată pașii”.
- Din *Storytelling with Data* (Cole Nussbaumer Knaflic) folosim doar ideile (context, Big Idea, storyboard, logica orizontală, atenția, curățarea); exemplele sunt pe datele Flyable.

## Fișiere
- Pagina: `sesiuni/s11/index.html` · stil: `css/s11.css` · widget-uri: `js/s11.js` · date pentru widget-uri: `js/s11-date.js` (generat).
- Date: `sesiuni/s11/date/Tinte.xlsx` și `Tinte.csv`.
- Generator: `assets/s11/generate_s11.py` (pornește de la `sesiuni/s10/date/csv/`, afișează cifrele lecției) · soluții: `assets/s11/solutii_s11.md`.
