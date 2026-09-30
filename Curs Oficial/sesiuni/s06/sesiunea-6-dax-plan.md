# Sesiunea 6 · Introducere în DAX — plan facilitator

## Obiectiv
Participanții scriu măsuri de bază pe modelul **Vanzari** (S5) și pot explica orice rezultat răspunzând la o singură întrebare: **ce rânduri intră în calcul?**

## Firul logic · 4 părți
| Parte | Întrebare | Concepte |
|------|-----------|----------|
| 1 | Unde scriu formula? | sintaxă, coloană vs măsură, medie ponderată, SUM / COUNTROWS / DISTINCTCOUNT / AVERAGE |
| 2 | Ce rânduri vede? | filter context: slicer, matrix, totaluri, propagare pe relații |
| 3 | Cum schimb rândurile? | CALCULATE (adaugă vs înlocuiește), ALL, % din total |
| 4 | Cum combin rezultate? | SUMX (row context), coloană cu IF, DIVIDE, VAR/RETURN |

Apoi: detectiv pe date reale, greșeli frecvente, fișa de buzunar, laborator cu rezultate așteptate.

## Durată orientativă · ~2h15
| Slide-uri | Segment | Minute |
|-----------|---------|--------|
| 1–3 | Copertă, recap S5, hartă | 10 |
| 4–7 | Partea 1 | 25 |
| 8–10 | Partea 2 · laborator de context + verificare | 20 |
| 11–14 | Partea 3 · CALCULATE, ALL, % | 25 |
| 15–17 | Partea 4 · SUMX, IF, DIVIDE/VAR | 20 |
| 18–20 | Detectiv, greșeli, fișă | 10 |
| 21–22 | Laborator în Power BI Desktop, încheiere | 25 |

## Widget-uri interactive (js/s06.js)
- **Laborator de context** (slide 8, 9, 12, 13): 8 rânduri mini-Vanzari cu numere rotunde. Verde = intră în calcul, gri = scos de vizual, roșu tăiat = scos de CALCULATE, albastru = adus înapoi de CALCULATE/ALL. Pașii calculului se scriu sub tabel.
- **SUMX pas cu pas** (slide 15): parcurge 4 rânduri; comparație cu greșeala SUM × SUM.
- **% din total cu / fără ALL** (slide 14): date reale pe regiuni.

Scenarii de demonstrat live:
1. Slide 12 · Regiune = Nord-Vest + `[Vanzari fara anulate]` → 600 (filtre pe coloane diferite se adună).
2. Slide 12 · Categorie = Alimente + `[Vanzari Electronice]` → 1.800 (CALCULATE înlocuiește filtrul pe aceeași coloană).
3. Slide 13 · `[% din total]`, celula Nord-Vest × Electronice → 44,4% (ALL șterge doar Regiune).

## Rezultate de referință (Vanzari_s5_curat.xlsx)
| Măsură | Rezultat |
|--------|----------|
| Total Vanzari | 560.544,56 |
| Numar linii | 132 |
| Numar clienti | 33 |
| Medie linie / Valoare medie linie | 4.246,55 |
| Vanzari fara anulate | 445.974,08 |
| Vanzari Online | 66.935,58 |
| Vanzari Electronice | 415.101,05 |
| Valoare la pret lista (SUMX) | 564.145 |
| % Nord-Vest (ALL Dim_Magazine[Regiune]) | 29,9% |
| Marime_Comanda | 70 mari (466.116,50) · 62 mici (94.428,06) |
| Neta + TVA vs Total | 570.077,85 vs 560.544,56 → diferență 9.533,29 |

**Diferența Neta + TVA:** 15 linii `Anulat` au `Valoare_Neta = 0` și `Valoare_Totala = 0`, dar `Valoare_TVA` completat. E intenționat folosit ca exercițiu de verificare.

**Capcană:** `Regiune` există și în `Dim_Clienti`, și în `Dim_Magazine`. Procentul folosește regiunea magazinului.

## Ce NU acoperim (sesiuni viitoare)
- Time intelligence (S9)
- KEEPFILTERS, FILTER cu tabel, context transition în detaliu
- Tabular Editor, variabile de tip tabel

## Fișiere
- Prezentare: `sesiuni/s06/index.html` · stiluri `css/s06.css` · interacțiuni `js/s06.js`
- Date exercițiu: `sesiuni/s05/date_curat/Vanzari_s5_curat.xlsx`

## Referințe pentru facilitator
- [DAX intro · COUNT, SUM, SUM vs SUMX, IF](https://www.youtube.com/watch?v=vcijg0gUXSg&t=208s)
- [DAX tutorial · operatori, Quick measure, CALCULATE](https://www.youtube.com/watch?v=waG_JhBgUpM)
