# Proiect · Sesiunea 11 · Flyable (Azure SQL murdar) — cheia facilitatorului

Scriptul `assets/s11/azure/aviatie_murdar_azure.sql` șterge cele 9 tabele curate din S10 și le recreează murdare.
Datele sunt generate cu funcțiile din S10, dar cu alte seed-uri și alte volume (9.600 zboruri, 11.400 rezervări, 2.200 pasageri).

## Rânduri și coloane

| Tabel | Rânduri în bază | Coloane în bază | Rânduri curat | Coloane curat |
|-------|----------------:|----------------:|--------------:|--------------:|
| Dim_Date | 1.827 | 12 | 1.826 | 11 |
| Dim_Companii | 11 | 7 | 10 | 7 |
| Dim_Rute | 45 | 16 | 45 | 15 |
| Dim_Aeronave | 32 | 8 | 30 | 8 |
| Dim_Clase | 5 | 5 | 4 | 5 |
| Dim_Canale | 5 | 4 | 5 | 4 |
| Dim_Pasageri | 2.208 | 8 | 2.200 | 8 |
| Fact_Zboruri | 9.611 | 16 | 9.600 | 15 |
| Fact_Rezervari | 11.412 | 16 | 11.400 | 15 |

## Ce e murdar și cum se curăță

**Dim_Date**: `Data` text dd.mm.yyyy (tip Date, cu locale Română dacă e nevoie); `Trimestru` „Trim 3” → „T3” (Replace Values); `Luna_Nume` uneori cu litere mici (Capitalize Each Word); coloana `Observatii` se șterge; ultimul rând are doar `Observatii` completat: după ștergerea coloanei devine gol (Remove Blank Rows).

**Dim_Companii**: `Companie` cu spații la început (Trim); `Tip_Companie` cu litere mari/mici și spații (Trim + Capitalize; „Low-cost” revine la forma lui); `Alianta` NULL în loc de „Fara alianta” (Replace Values; nu schimbă numărul de rânduri); un rând duplicat (Remove Duplicates).

**Dim_Rute**: `Distanta_km` „1234 km” și `Durata_Min` „135 min” (scoți sufixul, Whole Number); `Latitudine_Sosire` / `Longitudine_Sosire` cu virgulă (Decimal cu locale Română); `Regiune_Sosire` uneori cu litere mici (Capitalize; „Europa de Vest”, „Orientul Mijlociu” etc.); coloana `Observatii` se șterge.

**Dim_Aeronave**: `Locuri` „180 locuri” (scoți sufixul, număr); `Producator` uneori cu majuscule; 2 rânduri duplicate.

**Dim_Clase**: `Bagaj_Inclus_kg` „23 kg”; un rând de test (`ID` 99, „TEST - nu folositi”) se filtrează.

**Dim_Canale**: `Comision_Pct` „8%” (scoți „%”; valoarea curată e 8, nu 0,08); `Canal` cu spații la final (Trim).

**Dim_Pasageri**: `Nivel_Loialitate` cu litere mari/mici și spații; `Oras` cu spațiu la final; `Gen` uneori „f”/„m” (Uppercase); `Tara` uneori cu litere mici; 8 rânduri duplicate.

**Fact_Zboruri**: `Status_Zbor` cu litere mari/mici și spații; `Venit_Bilete` și `Venit_Auxiliar` text cu virgulă (Decimal cu locale Română); coloana `Exportat_La` se șterge; 6 duplicate; 3 zboruri de test (`Cod_Zbor` TEST01–TEST03, status „Test”); 2 rânduri complet goale.

**Fact_Rezervari**: `Nr_Bilete` text, uneori „2 bilete” / „1 bilet” (scoți textul, număr); `ID_Pasager` text, uneori cu spații (Trim, Whole Number); `Status_Rezervare` cu litere mari/mici și spații; coloana `Observatii` se șterge; 8 duplicate; 3 rânduri goale; un rând `TOTAL` la final (se filtrează).

## Model
9 relații *:1, Single. `Fact_Zboruri`: ID_Date, ID_Companie, ID_Ruta, ID_Aeronava. `Fact_Rezervari`: ID_Date, ID_Companie, ID_Ruta, ID_Clasa, ID_Canal, ID_Pasager. Dimensiunile comune (Dim_Date, Dim_Companii, Dim_Rute) filtrează ambele tabele de fapte; între cele două facturi nu se face relație. Dim_Date marcat ca date table pe `Data`; `Luna_Nume` sortat după `Luna`. (Pe pagina cursanților nu apar relațiile: doar lista tabelelor.)

## Raport
Fără indicații. La prezentare cursanții explică logica fiecărei pagini (de ce există, la ce întrebări răspunde fiecare chart, cum se leagă paginile). Cursanții aleg ce tabele folosesc și câte pagini fac; contează să-și poată justifica alegerile. Pașii din S11 sunt facultativi.
