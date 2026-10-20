# Sesiunea 10 · Surse de date și rapoarte flexibile — plan facilitator

Starea curentă: 20 de slide-uri, lecție scurtă, fără quiz final. Tema: companii aeriene (fictive), 2021–2025, în EUR.

| Slide-uri | Conținut |
|-----------|----------|
| 1–4 | Copertă, recap S9, conceptele de azi, datele lecției (baza Flyableinc și folderul de rezervări) |
| 5 | Partea 1 · Baza de date: conectarea la Azure SQL (`flyabieinc.database.windows.net`, baza `Flyableinc`, utilizatorul `curs_powerbi`), doar modul Import |
| 6–11 | Partea 2 · Combinarea fișierelor, un singur exemplu (T1–T3 în folder, T4 pentru Refresh): ideea, Get Data → Folder, animația Combine Files, pașii, capcane, practică |
| 12–15 | Partea 3 · Model: împărțirea pe tabele (un buton pe tabel, cu conținutul lui), cum se creează fiecare tabel în Power Query (butoane + pași numerotați), tabela de date (formula din New table), modelarea în Model view (relații, date table, chei ascunse, verificare) |
| 16–19 | Partea 3 · Matrix dinamic: ce construim (9 × 3 × 6 = 162), pas cu pas cu butoane (măsuri, trei parametri, matrix), simulator, practică |
| 20 | Încheiere: ce am făcut azi |

## De știut
- Parola utilizatorului `curs_powerbi` se dă la curs; nu e în fișiere.
- Fișierul combinat are 19 coloane; din el se fac 5 dimensiuni (Companie 10, Ruta 45, Canal 5, Clasa 4, Pasager 24), tabela de fapte `Rezervari` (2.950) și `Dim_Data` (365).

## Fișiere
- Pagina: `sesiuni/s10/index.html` · stil: `css/s10.css` · widget-uri: `js/s10.js` · date pentru widget-uri: `js/s10-fisier.js` (generat).
- Date: `sesiuni/s10/date/*.xlsx` (9 tabele, rezervă), `date/csv/` (aceleași, CSV), `date/combinare/` (`exemplu_rezervari_2025/` + `.zip`, `fisier_nou/`).
- Generator: `assets/s10/generate_s10.py` (seed fix; rularea îl regenerează identic) · scriptul pentru Azure: `assets/s10/azure/aviatie_azure.sql` · soluții: `assets/s10/solutii_s10.md`.
