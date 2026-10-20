# Sesiunea 10 · cheia facilitatorului

## Date (curate, fără murdărire)

| Tabel | Rânduri | Coloane |
|-------|---------|---------|
| Dim_Date (2021–2025) | 1.826 | 11 |
| Dim_Companii | 10 | 7 |
| Dim_Rute | 45 | 15 |
| Dim_Aeronave | 30 | 8 |
| Dim_Clase | 4 | 5 |
| Dim_Canale | 5 | 4 |
| Dim_Pasageri | 2.500 | 8 |
| Fact_Zboruri | 10.000 | 15 |
| Fact_Rezervari | 12.000 | 15 |

Relații (toate *:1, Single): `Fact_Zboruri[ID_Date|ID_Companie|ID_Ruta|ID_Aeronava]` → dimensiuni; `Fact_Rezervari[ID_Date|ID_Companie|ID_Ruta|ID_Clasa|ID_Canal|ID_Pasager]` → dimensiuni. `Dim_Clase` și `Dim_Canale` nu se leagă de `Fact_Zboruri`, iar `Dim_Aeronave` nu se leagă de `Fact_Rezervari`: de aici blocajul din simulatorul de pivot.

Rezervările din 2025 pe luni: 175, 166, 191, 219, 242, 341, 366, 347, 226, 251, 170, 256 (total 2.950). Fișierele din `rezervari_lunare` acoperă ian–nov (2.694); decembrie (256) e în `rezervari_lunare_nou`.

## Măsuri

```dax
Bilete = CALCULATE ( SUM ( Fact_Rezervari[Nr_Bilete] ), Fact_Rezervari[Status_Rezervare] = "Confirmata" )
Venit Rezervari = CALCULATE ( SUM ( Fact_Rezervari[Valoare_Totala] ), Fact_Rezervari[Status_Rezervare] = "Confirmata" )
Pret Mediu Bilet = DIVIDE ( [Venit Rezervari], [Bilete] )
Zboruri = COUNTROWS ( Fact_Zboruri )
Intarziate % = DIVIDE ( CALCULATE ( COUNTROWS ( Fact_Zboruri ), Fact_Zboruri[Status_Zbor] = "Intarziat" ), [Zboruri] )
La Timp % = DIVIDE ( CALCULATE ( COUNTROWS ( Fact_Zboruri ), Fact_Zboruri[Status_Zbor] = "La timp" ), [Zboruri] )
Load Factor % =
DIVIDE (
    SUM ( Fact_Zboruri[Pasageri_Imbarcati] ),
    CALCULATE ( SUM ( Fact_Zboruri[Locuri_Disponibile] ), Fact_Zboruri[Status_Zbor] <> "Anulat" )
)
Venit Zboruri = SUM ( Fact_Zboruri[Venit_Bilete] ) + SUM ( Fact_Zboruri[Venit_Auxiliar] )
Cost Combustibil = SUM ( Fact_Zboruri[Cost_Combustibil] )
Cost Operare = SUM ( Fact_Zboruri[Cost_Operare] )
Profit = [Venit Zboruri] - [Cost Combustibil] - [Cost Operare]
```

Field parameters: `Parametru Randuri` (Companie, Tip companie, Tip rută, Clasă, Canal), `Parametru Coloane` (An, Trimestru, Tip rută), `Parametru Valori` (măsurile de mai sus, fără costuri). Atenție: `Tip companie` = `Dim_Companii[Tip_Companie]`.

## Combinarea fișierelor (un singur exemplu)

Folderul `sesiuni/s10/date/combinare/exemplu_rezervari_2025/` conține T1–T3 2025, cu foaia `Rezervari`:

| Fișier | Rânduri |
|---|---|
| Rezervari_2025_T1.xlsx | 532 |
| Rezervari_2025_T2.xlsx | 802 |
| Rezervari_2025_T3.xlsx | 939 |
| **Total T1–T3** | **2.273** |
| Rezervari_2025_T4.xlsx (în `fisier_nou/`, pentru Refresh) | 677 → total **2.950** |

Coloanele: `Data`, `Trimestru`, `Companie`, `Cod_Ruta`, `Tip_Ruta`, `Clasa`, `Canal`, `Nr_Bilete`, `Pret_Bilet`, `Taxe_Bilet`, `Bagaj_Extra`, `Valoare_Totala`, `Status_Rezervare`.

Cod M de referință (fără butonul Combine):

```m
let
    Sursa = Folder.Files ( "C:\Curs\exemplu_rezervari_2025" ),
    FaraTemp = Table.SelectRows ( Sursa, each not Text.StartsWith ( [Name], "~$" ) ),
    Date = Table.AddColumn ( FaraTemp, "Date", each Excel.Workbook ( [Content] ){[Item = "Rezervari"]}[Data] ),
    Antet = Table.TransformColumns ( Date, { { "Date", each Table.PromoteHeaders ( _ ) } } ),
    Final = Table.ExpandTableColumn ( Antet, "Date", Table.ColumnNames ( Antet[Date]{0} ) )
in
    Final
```

Notă: după combinare setați tipurile (`Table.TransformColumnTypes`): `Data` = date, `Nr_Bilete` = întreg, restul sumelor = decimal.

## Fișierul combinat (19 coloane)

`Data`, `Companie`, `Tip_Companie`, `Cod_Ruta`, `Oras_Sosire`, `Tara_Sosire`, `Tip_Ruta`, `Clasa`, `Canal`, `Tip_Canal`, `Grupa_Varsta`, `Nivel_Loialitate`, `Zile_Avans`, `Nr_Bilete`, `Pret_Bilet`, `Taxe_Bilet`, `Bagaj_Extra`, `Valoare_Totala`, `Status_Rezervare`. Trimestrul nu mai e în fișier: vine din `Dim_Data`.

## Împărțirea pe tabele

Pentru fiecare dimensiune: *Duplicate → Remove Other Columns → Remove Duplicates → Add Index Column* (`ID`, de la 1), cu numele interogării = numele tabelului.

| Tabel | Coloane păstrate | Rânduri |
|---|---|---|
| Companie | Companie, Tip_Companie | 10 |
| Ruta | Cod_Ruta, Oras_Sosire, Tara_Sosire, Tip_Ruta | 45 |
| Canal | Canal, Tip_Canal | 5 |
| Clasa | Clasa | 4 |
| Pasager | Grupa_Varsta, Nivel_Loialitate | 24 |
| Rezervari (fapte) | Data, ID_Companie, ID_Ruta, ID_Canal, ID_Clasa, ID_Pasager, Zile_Avans, Nr_Bilete, Pret_Bilet, Taxe_Bilet, Bagaj_Extra, Valoare_Totala, Status_Rezervare | 2.950 |

Tabela de fapte: *Duplicate → Merge Queries* cu fiecare dimensiune (*Left Outer*, pe `Companie`, `Cod_Ruta`, `Canal`, `Clasa`; pentru Pasager pe ambele coloane, `Grupa_Varsta` + `Nivel_Loialitate`), *Expand* doar `ID`, redenumire în `ID_<Dimensiune>`, apoi ștergerea coloanelor text.

## Tabela de date (Modeling → New table)

```dax
Dim_Data =
VAR _Inceput = DATE ( YEAR ( MIN ( Rezervari[Data] ) ), 1, 1 )
VAR _Sfarsit = DATE ( YEAR ( MAX ( Rezervari[Data] ) ), 12, 31 )
RETURN
ADDCOLUMNS (
    CALENDAR ( _Inceput, _Sfarsit ),
    "An", YEAR ( [Date] ),
    "Trimestru", "T" & QUARTER ( [Date] ),
    "Luna", MONTH ( [Date] ),
    "Luna_Nume", FORMAT ( [Date], "MMMM" ),
    "Zi_Saptamana", FORMAT ( [Date], "dddd" )
)
```

Apoi: *Mark as date table* pe `Date`; `Luna_Nume` sortat după `Luna`; relația `Rezervari[Data]` → `Dim_Data[Date]` (365 de rânduri pentru 2025).

## Matrix cu field parameters

Măsuri (pe `Rezervari`):

```dax
Bilete = CALCULATE ( SUM ( Rezervari[Nr_Bilete] ), Rezervari[Status_Rezervare] = "Confirmata" )
Venit Rezervari = CALCULATE ( SUM ( Rezervari[Valoare_Totala] ), Rezervari[Status_Rezervare] = "Confirmata" )
Pret Mediu Bilet = DIVIDE ( [Venit Rezervari], [Bilete] )
Zile Avans Mediu = AVERAGE ( Rezervari[Zile_Avans] )
Venit Bagaj = CALCULATE ( SUM ( Rezervari[Bagaj_Extra] ), Rezervari[Status_Rezervare] = "Confirmata" )
Rata Anulare % = DIVIDE (
    CALCULATE ( COUNTROWS ( Rezervari ), Rezervari[Status_Rezervare] = "Anulata" ),
    COUNTROWS ( Rezervari ) )
```

Parametrii (Modeling → New parameter → Fields):

- **Parametru Randuri** (9): Companie[Companie], Companie[Tip_Companie], Ruta[Cod_Ruta], Ruta[Tara_Sosire], Clasa[Clasa], Canal[Canal], Canal[Tip_Canal], Pasager[Grupa_Varsta], Pasager[Nivel_Loialitate].
- **Parametru Coloane** (3): Dim_Data[Trimestru], Dim_Data[Luna_Nume] (sortat după Luna), Ruta[Tip_Ruta].
- **Parametru Valori** (6): cele șase măsuri de mai sus.

Matrix: Rows ← Parametru Randuri, Columns ← Parametru Coloane, Values ← Parametru Valori. Slicere: single select la rânduri și coloane, selecție multiplă la valori. 9 × 3 × 6 = 162 de combinații.

Simulatorul din slide-ul 17 folosește aceleași rânduri (`js/s10-fisier.js`, 2.950 de rezervări, cu rata de anulare calculată pe toate).
