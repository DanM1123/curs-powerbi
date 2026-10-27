# Proiecte finale S12 · cheia facilitatorului

Generat de `generate_proiecte_s12.py`. Pentru fiecare temă: rânduri murdar → curat, ce e de curățat și modelul așteptat.
Toate relațiile sunt many-to-one, cu filtrare într-o singură direcție, de la dimensiune la fapt. Între cele două tabele de fapte nu se face nicio relație.

## Telekom Romania Business

Eșantion: tabelul de fapte principal reprezintă ~15.34% din cifra reală (trendul anual e păstrat).

| Tabel | Murdar (rânduri × col.) | Curat (rânduri × col.) | Ce e de curățat |
|---|---|---|---|
| Fact_Vanzari | 10932 × 13 | 10919 × 12 | litere mari/mici amestecate și spații: Canal, Tip_Contract; numere cu unități ca text: Cantitate; zecimale cu virgulă (text): Pret_Unitar_RON; procente ca text („15%”): Discount; date ca text dd.mm.yyyy: Data_Comanda; chei ca text cu spații: ID_Client; coloană în plus: Exportat_La; 7 duplicate; 2 rânduri de test (ID_Vanzare = TEST…); 3 rânduri goale; rând TOTAL la final |
| Fact_Servicii | 2672 × 14 | 2665 × 14 | litere mari/mici amestecate și spații: Status, SLA_Respectat; numere cu unități ca text: Ore_Estimate; zecimale cu virgulă (text): Ore_Realizate, Ore_Pana_La_Interventie; date ca text dd.mm.yyyy: Data_Programare; 5 duplicate; 2 rânduri goale; rând de titlu deasupra antetului |
| Dim_Clienti | 655 × 8 | 650 × 8 | litere mari/mici amestecate și spații: Industrie, Segment; spații la început/sfârșit: Judet; aceeași valoare scrisă în mai multe feluri: Judet; 4 duplicate; 1 rânduri de test (ID_Client = TEST…) |
| Dim_Produse | 35 × 7 | 33 × 7 | litere mari/mici amestecate și spații: Vendor; numere cu unități ca text: Pret_Lista_EUR; 1 duplicate; 1 rânduri de test (ID_Produs = TEST…) |
| Dim_Servicii | 8 × 5 | 8 × 5 | spații la început/sfârșit: Serviciu; numere cu unități ca text: Tarif_EUR_Ora, SLA_Ore |
| Dim_Echipa | 72 × 6 | 70 × 6 | litere mari/mici amestecate și spații: Rol; spații la început/sfârșit: Nume; date ca text dd.mm.yyyy: Data_Angajare; 2 duplicate |
| Dim_Date | 1096 × 11 | 1096 × 11 | curată, o primiți gata făcută |

Relații:

- `Fact_Vanzari[ID_Client]` → `Dim_Clienti`
- `Fact_Vanzari[ID_Produs]` → `Dim_Produse`
- `Fact_Vanzari[ID_Agent]` → `Dim_Echipa`
- `Fact_Vanzari[Data_Comanda]` → `Dim_Date`
- `Fact_Servicii[ID_Client]` → `Dim_Clienti`
- `Fact_Servicii[ID_Serviciu]` → `Dim_Servicii`
- `Fact_Servicii[ID_Tehnician]` → `Dim_Echipa`
- `Fact_Servicii[Data_Programare]` → `Dim_Date`

## Construcții Erbașu

Eșantion: tabelul de fapte principal reprezintă ~66.23% din cifra reală (trendul anual e păstrat).

| Tabel | Murdar (rânduri × col.) | Curat (rânduri × col.) | Ce e de curățat |
|---|---|---|---|
| Fact_Situatii_Lucrari | 2423 × 10 | 2413 × 9 | numere cu unități ca text: Zile_Intarziere; zecimale cu virgulă (text): Valoare_Planificata_RON, Valoare_Executata_RON; procente ca text („15%”): Avans_Cumulat; date ca text dd.mm.yyyy: Luna; chei ca text cu spații: ID_Proiect; coloană în plus: Observatii; 6 duplicate; 3 rânduri goale; rând TOTAL la final |
| Fact_Achizitii | 5104 × 10 | 5092 × 9 | numere cu unități ca text: Cantitate; zecimale cu virgulă (text): Pret_Unitar_RON; date ca text dd.mm.yyyy: Data_Achizitie; chei ca text cu spații: ID_Furnizor; coloană în plus: Exportat_La; 8 duplicate; 2 rânduri de test (ID_Achizitie = TEST…); 2 rânduri goale |
| Dim_Proiecte | 20 × 10 | 19 × 10 | litere mari/mici amestecate și spații: Status, Tip_Proiect; spații la început/sfârșit: Proiect; date ca text dd.mm.yyyy: Data_Start; 1 duplicate |
| Dim_Beneficiari | 17 × 4 | 16 × 4 | litere mari/mici amestecate și spații: Tip_Beneficiar; 1 duplicate |
| Dim_Categorii_Lucrari | 10 × 4 | 10 × 4 | spații la început/sfârșit: Categorie_Lucrare; procente ca text („15%”): Pondere_Tipica |
| Dim_Articole | 30 × 6 | 29 × 6 | litere mari/mici amestecate și spații: Tip_Articol; numere cu unități ca text: Pret_Referinta_RON; valori lipsă în loc de valoarea implicită: Producator; 1 rânduri de test (ID_Articol = TEST…) |
| Dim_Furnizori | 39 × 5 | 37 × 5 | litere mari/mici amestecate și spații: Tip_Furnizor; spații la început/sfârșit: Furnizor; 2 duplicate |
| Dim_Date | 1096 × 11 | 1096 × 11 | curată, o primiți gata făcută |

Relații:

- `Fact_Situatii_Lucrari[ID_Proiect]` → `Dim_Proiecte`
- `Fact_Situatii_Lucrari[ID_Categorie]` → `Dim_Categorii_Lucrari`
- `Fact_Situatii_Lucrari[Luna]` → `Dim_Date`
- `Fact_Achizitii[ID_Proiect]` → `Dim_Proiecte`
- `Fact_Achizitii[ID_Articol]` → `Dim_Articole`
- `Fact_Achizitii[ID_Furnizor]` → `Dim_Furnizori`
- `Fact_Achizitii[Data_Achizitie]` → `Dim_Date`
- `Dim_Proiecte[ID_Beneficiar]` → `Dim_Beneficiari`

## Endava România

Eșantion: tabelul de fapte principal reprezintă ~11.49% din cifra reală (trendul anual e păstrat).

| Tabel | Murdar (rânduri × col.) | Curat (rânduri × col.) | Ce e de curățat |
|---|---|---|---|
| Fact_Pontaj | 17487 × 11 | 17472 × 10 | zecimale cu virgulă (text): Ore_Lucrate, Ore_Facturabile, Cost_RON; date ca text dd.mm.yyyy: Luna; chei ca text cu spații: ID_Angajat; coloană în plus: Exportat_La; 9 duplicate; 2 rânduri de test (ID_Pontaj = TEST…); 3 rânduri goale; rând TOTAL la final |
| Fact_Alocari | 17480 × 6 | 17472 × 6 | numere cu unități ca text: Ore_Planificate; procente ca text („15%”): Alocare_Planificata; date ca text dd.mm.yyyy: Luna; 6 duplicate; 2 rânduri goale; rând de titlu deasupra antetului |
| Dim_Angajati | 597 × 9 | 593 × 9 | litere mari/mici amestecate și spații: Rol, Senioritate; spații la început/sfârșit: Nume; zecimale cu virgulă (text): Cost_Orar_RON; date ca text dd.mm.yyyy: Data_Angajare; 3 duplicate; 1 rânduri de test (ID_Angajat = TEST…) |
| Dim_Proiecte | 42 × 10 | 41 × 10 | litere mari/mici amestecate și spații: Status, Metodologie; spații la început/sfârșit: Proiect; valori lipsă în loc de valoarea implicită: Facturabil; 1 duplicate |
| Dim_Clienti | 29 × 5 | 29 × 5 | litere mari/mici amestecate și spații: Industrie; spații la început/sfârșit: Client; aceeași valoare scrisă în mai multe feluri: Geografie |
| Dim_Centre | 10 × 4 | 10 × 4 | spații la început/sfârșit: Oras; aceeași valoare scrisă în mai multe feluri: Oras |
| Dim_Riscuri | 122 × 8 | 120 × 8 | litere mari/mici amestecate și spații: Status_Risc, Categorie_Risc; date ca text dd.mm.yyyy: Data_Identificare; 2 duplicate |
| Dim_Date | 1096 × 11 | 1096 × 11 | curată, o primiți gata făcută |

Relații:

- `Fact_Pontaj[ID_Angajat]` → `Dim_Angajati`
- `Fact_Pontaj[ID_Proiect]` → `Dim_Proiecte`
- `Fact_Pontaj[Luna]` → `Dim_Date`
- `Fact_Alocari[ID_Angajat]` → `Dim_Angajati`
- `Fact_Alocari[ID_Proiect]` → `Dim_Proiecte`
- `Fact_Alocari[Luna]` → `Dim_Date`
- `Dim_Proiecte[ID_Client]` → `Dim_Clienti`
- `Dim_Angajati[ID_Centru]` → `Dim_Centre`
- `Dim_Riscuri[ID_Proiect]` → `Dim_Proiecte`

## Unilever România

Eșantion: tabelul de fapte principal reprezintă ~1.44% din cifra reală (trendul anual e păstrat).

| Tabel | Murdar (rânduri × col.) | Curat (rânduri × col.) | Ce e de curățat |
|---|---|---|---|
| Fact_Vanzari | 13548 × 12 | 13533 × 11 | numere cu unități ca text: Baxuri; zecimale cu virgulă (text): Pret_Unitar_RON; procente ca text („15%”): Discount; date ca text dd.mm.yyyy: Data_Livrare; chei ca text cu spații: ID_Produs; coloană în plus: Exportat_La; 9 duplicate; 2 rânduri de test (ID_Livrare = TEST…); 3 rânduri goale; rând TOTAL la final |
| Fact_Target | 1154 × 5 | 1149 × 5 | zecimale cu virgulă (text): Target_RON; date ca text dd.mm.yyyy: Luna; 4 duplicate; 1 rânduri goale; rând de titlu deasupra antetului |
| Dim_Produse | 30 × 9 | 28 × 9 | litere mari/mici amestecate și spații: Brand; spații la început/sfârșit: Produs; numere cu unități ca text: Bucati_Bax; zecimale cu virgulă (text): Pret_Raft_RON; 1 duplicate; 1 rânduri de test (ID_Produs = TEST…) |
| Dim_Categorii | 4 × 3 | 4 × 3 | spații la început/sfârșit: Categorie |
| Dim_Clienti | 20 × 6 | 19 × 6 | litere mari/mici amestecate și spații: Canal; spații la început/sfârșit: Client; aceeași valoare scrisă în mai multe feluri: Canal; 1 duplicate |
| Dim_Agenti | 15 × 4 | 15 × 4 | litere mari/mici amestecate și spații: Functie; spații la început/sfârșit: Nume |
| Dim_Promotii | 10 × 4 | 10 × 4 | litere mari/mici amestecate și spații: Tip_Promotie; procente ca text („15%”): Discount_Tipic |
| Dim_Date | 1096 × 11 | 1096 × 11 | curată, o primiți gata făcută |

Relații:

- `Fact_Vanzari[ID_Client]` → `Dim_Clienti`
- `Fact_Vanzari[ID_Produs]` → `Dim_Produse`
- `Fact_Vanzari[ID_Agent]` → `Dim_Agenti`
- `Fact_Vanzari[ID_Promotie]` → `Dim_Promotii`
- `Fact_Vanzari[Data_Livrare]` → `Dim_Date`
- `Fact_Target[ID_Agent]` → `Dim_Agenti`
- `Fact_Target[ID_Categorie]` → `Dim_Categorii`
- `Fact_Target[Luna]` → `Dim_Date`
- `Dim_Produse[ID_Categorie]` → `Dim_Categorii`

## UiPath

| Tabel | Murdar (rânduri × col.) | Curat (rânduri × col.) | Ce e de curățat |
|---|---|---|---|
| Fact_Executii | 3014 × 11 | 3000 × 10 | litere mari/mici amestecate și spații: Mod_Executie; numere cu unități ca text: Nr_Executii; zecimale cu virgulă (text): Durata_Totala_Min, Cost_USD; date ca text dd.mm.yyyy: Luna; chei ca text cu spații: ID_Proces; aceeași valoare scrisă în mai multe feluri: Mod_Executie; coloană în plus: Exportat_La; 8 duplicate; 2 rânduri de test (ID_Executie = TEST…); 3 rânduri goale; rând TOTAL la final |
| Fact_Initiative | 54 × 10 | 51 × 10 | litere mari/mici amestecate și spații: Status; zecimale cu virgulă (text): Investitie_USD, Ore_Economisite_Estimate_An; date ca text dd.mm.yyyy: Data_Go_Live; 2 duplicate; 1 rânduri goale; rând de titlu deasupra antetului |
| Dim_Clienti | 13 × 5 | 12 × 5 | litere mari/mici amestecate și spații: Industrie; spații la început/sfârșit: Client; date ca text dd.mm.yyyy: Client_Din; 1 rânduri de test (ID_Client = TEST…) |
| Dim_Procese | 15 × 6 | 14 × 6 | litere mari/mici amestecate și spații: Complexitate; spații la început/sfârșit: Proces; zecimale cu virgulă (text): Durata_Manual_Min, Durata_Automat_Min; 1 duplicate |
| Dim_Produse | 13 × 5 | 13 × 5 | litere mari/mici amestecate și spații: Familie; date ca text dd.mm.yyyy: Disponibil_Din |
| Dim_Departamente | 8 × 2 | 8 × 2 | spații la început/sfârșit: Departament |
| Dim_Date | 1096 × 11 | 1096 × 11 | curată, o primiți gata făcută |

Relații:

- `Fact_Executii[ID_Client]` → `Dim_Clienti`
- `Fact_Executii[ID_Proces]` → `Dim_Procese`
- `Fact_Executii[Luna]` → `Dim_Date`
- `Fact_Initiative[ID_Client]` → `Dim_Clienti`
- `Fact_Initiative[ID_Proces]` → `Dim_Procese`
- `Fact_Initiative[ID_Produs]` → `Dim_Produse`
- `Dim_Procese[ID_Departament]` → `Dim_Departamente`

## H&M România

Eșantion: tabelul de fapte principal reprezintă ~0.04% din cifra reală (trendul anual e păstrat).

| Tabel | Murdar (rânduri × col.) | Curat (rânduri × col.) | Ce e de curățat |
|---|---|---|---|
| Fact_Vanzari | 13305 × 13 | 13290 × 12 | litere mari/mici amestecate și spații: Marime; numere cu unități ca text: Cantitate; zecimale cu virgulă (text): Pret_Lista_RON; procente ca text („15%”): Reducere; date ca text dd.mm.yyyy: Data_Vanzare; chei ca text cu spații: ID_Produs; coloană în plus: Exportat_La; 9 duplicate; 2 rânduri de test (ID_Linie = TEST…); 3 rânduri goale; rând TOTAL la final |
| Fact_Retururi | 1415 × 11 | 1408 × 11 | litere mari/mici amestecate și spații: Motiv_Retur, Canal_Retur; numere cu unități ca text: Zile_Pana_La_Retur; zecimale cu virgulă (text): Valoare_Returnata_RON; date ca text dd.mm.yyyy: Data_Retur; 5 duplicate; 2 rânduri goale; rând de titlu deasupra antetului |
| Dim_Produse | 524 × 11 | 520 × 11 | litere mari/mici amestecate și spații: Departament, Culoare; spații la început/sfârșit: Denumire; zecimale cu virgulă (text): Pret_Lista_RON; aceeași valoare scrisă în mai multe feluri: Departament; 3 duplicate; 1 rânduri de test (ID_Produs = TEST…) |
| Dim_Magazine | 37 × 6 | 36 × 6 | litere mari/mici amestecate și spații: Canal; spații la început/sfârșit: Magazin; aceeași valoare scrisă în mai multe feluri: Oras; 1 duplicate |
| Dim_Clienti | 3205 × 8 | 3201 × 8 | litere mari/mici amestecate și spații: Status_Membru, Newsletter; date ca text dd.mm.yyyy: Data_Inscriere; valori lipsă în loc de valoarea implicită: Newsletter; 4 duplicate |
| Dim_Campanii | 7 × 5 | 7 × 5 | spații la început/sfârșit: Campanie; procente ca text („15%”): Reducere_Min, Reducere_Max |
| Dim_Date | 1096 × 11 | 1096 × 11 | curată, o primiți gata făcută |

Relații:

- `Fact_Vanzari[ID_Magazin]` → `Dim_Magazine`
- `Fact_Vanzari[ID_Client]` → `Dim_Clienti`
- `Fact_Vanzari[ID_Produs]` → `Dim_Produse`
- `Fact_Vanzari[ID_Campanie]` → `Dim_Campanii`
- `Fact_Vanzari[Data_Vanzare]` → `Dim_Date`
- `Fact_Retururi[ID_Magazin]` → `Dim_Magazine`
- `Fact_Retururi[ID_Client]` → `Dim_Clienti`
- `Fact_Retururi[ID_Produs]` → `Dim_Produse`
- `Fact_Retururi[Data_Retur]` → `Dim_Date`

Note:
- Endava: Dim_Proiecte → Dim_Clienti, Dim_Angajati → Dim_Centre și Dim_Riscuri → Dim_Proiecte fac un model snowflake.
- UiPath: Fact_Initiative nu se leagă de Dim_Date, pentru că Data_Go_Live poate cădea înainte de 2023 sau după 2025.
- H&M: Fact_Retururi are ID_Linie_Vanzare doar pentru urmărire; nu se face relație între fapte.
- Unilever: Fact_Target e la nivel de agent × categorie × lună, deci se compară cu vânzările prin dimensiuni comune (Dim_Agenti, Dim_Categorii prin Dim_Produse, Dim_Date).
