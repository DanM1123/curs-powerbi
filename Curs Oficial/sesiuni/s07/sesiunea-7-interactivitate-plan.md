# Sesiunea 7 · Interactivitate — plan facilitator

## Obiectiv
Participanții adaugă pe raportul S5/S6 slicere, filtre, interacțiuni, drillthrough, tooltips și bookmarks, lucrând în paralel în Power BI Desktop. Firul roșu: **fiecare click pune un filtru; cine îl pune și până unde ajunge?**

## Structură · ~2h15
| Slide-uri | Segment | Minute |
|-----------|---------|--------|
| 1–3 | Copertă, recap S6, hartă | 10 |
| 4–5 | Pagina de lucru „Explorare” + raza unui filtru | 15 |
| 6–8 | Partea 1 · Slicere + Exercițiu 1 | 25 |
| 9–13 | Partea 2 · Filters pane, slicer vs filtru, Edit interactions, drill + Exercițiu 2 | 35 |
| 14–16 | Partea 3 · Tooltips + Exercițiu 3 | 20 |
| 17–19 | Partea 4 · Bookmarks, butoane + Exercițiu 4 | 25 |
| 20–22 | Verifică-te, fișă, încheiere | 5 |

## Pagina de lucru „Explorare”
Card `[Total Vanzari]`, bar chart Categorie, column chart Canal_Vanzare, tabel Nume_Produs + `[Total Vanzari]` + `[Numar linii]`, coloană liberă pentru slicere.

## Rezultate de referință (Vanzari_s5_curat.xlsx)
| Context | Rezultat |
|---------|----------|
| Fără filtre | 560.544,56 |
| Regiune (magazin) = Nord-Vest | 167.849,85 |
| Nord-Vest + Electronice | 107.574,57 |
| An 2024 / 2023 | 220.350,16 / 69.977,29 |
| 2024 pe trimestre | T1 89.763,37 · T2 38.680,95 · T3 14.027,07 · T4 77.878,77 |
| Fără Anulat (filtru pagină) | 445.974,08 |
| Top 3 categorii | Electronice, Servicii, Casa & Gradina |
| Electronice pe canal (toate statusurile) | B2B 151.337,68 · Telefon 146.964,93 · Magazin 97.729,64 · Online 19.068,80 |
| Electronice pe canal (fără Anulat) | Telefon 146.964,93 · B2B 88.984,57 · Magazin 72.636,11 · Online 16.694,75 |
| Electronice | 415.101,05 · 37 linii · 24 clienți · Laptop Pro 14 = 190.927,20 |
| Servicii | 63.355,01 · 20 linii |

Diferența dintre cele două clasamente pe canal (slide 11 vs Exercițiul 2) e intenționată: arată că filtrul de pagină pe Status se adună cu click-ul.

## Capcane de subliniat
- `Regiune` există și în Dim_Clienti, și în Dim_Magazine.
- Top N doar la nivel de vizual.
- Bookmark cu **Data** bifat suprascrie slicerele cititorului; pentru grafic ↔ tabel se debifează.
- Butoanele în Desktop: Ctrl + click.
- Drillthrough: Keep all filters (implicit On) transmite și slicerele/click-urile.

## Fișiere
- Prezentare: `sesiuni/s07/index.html` · stiluri `css/s07.css` (refolosește și `css/s06.css`)
- Date: `sesiuni/s05/date_curat/Vanzari_s5_curat.xlsx` + fișierul .pbix din S6
