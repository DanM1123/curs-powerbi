# -*- coding: utf-8 -*-
"""Generează Vacante_murdar.xlsx (lecție) și setul Deplasari_* (temă)."""
from __future__ import annotations

import csv
from pathlib import Path

from openpyxl import Workbook

ROOT = Path(__file__).resolve().parent


def write_xlsx(path: Path, sheet_name: str, rows: list[list]) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = sheet_name[:31]
    for r_idx, r in enumerate(rows, start=1):
        for c_idx, val in enumerate(r, start=1):
            ws.cell(row=r_idx, column=c_idx, value=val)
    wb.save(path)


def write_tema_workbook(path: Path) -> None:
    """Un singur .xlsx pentru temă: foi separate pentru Append, Merge, Unpivot."""
    wb = Workbook()
    ws = wb.active
    ws.title = "Deplasari"
    for r in deplasari_murdar_rows():
        ws.append(r)

    ws25 = wb.create_sheet("Deplasari_2025")
    h25 = [
        "ID_Angajat",
        "Angajat",
        "Oras",
        "Tara",
        "DataPlecare",
        "Tip_proiect",
        "Durata_Zile",
        "Cost",
        "Mijloc",
    ]
    ws25.append(h25)
    for row in [
        ["A01", "Mihai Popescu", "Hamburg", "Germania", "2025-03-10", "Training", "4", "1920", "Tren"],
        ["A03", "Andrei Stan", "Paris", "Franta", "2025-04-22", "Audit", "5", "2100", "Avion"],
        ["A05", "Catalin Moldovan", "Bruxelles", "Belgia", "2025-05-14", "Workshop", "3", "980", "Tren"],
        ["A08", "Simona Luca", "Milano", "Italia", "2025-06-02", "Conferinta", "6", "2450", "Avion"],
        ["A10", "Ana-Maria Cojocaru", "Viena", "Austria", "2025-07-19", "Implementare", "4", "1180", "Tren"],
        ["A04", "Diana Radu", "Stockholm", "Suedia", "2025-08-11", "Audit", "5", "2050", "Avion"],
        ["A07", "Radu Enache", "Lyon", "Franta", "2025-09-03", "Training", "3", "890", "Tren"],
    ]:
        ws25.append(row)

    ws_ang = wb.create_sheet("Angajati")
    ws_ang.append(["ID_Angajat", "Nume", "Prenume", "Oras_Resedinta"])
    for row in [
        ["A01", "Popescu", "Mihai", "Cluj-Napoca"],
        ["A02", "Ionescu", "Elena", "Timisoara"],
        ["A03", "Stan", "Andrei", "Bucuresti"],
        ["A04", "Radu", "Diana", "Iasi"],
        ["A05", "Moldovan", "Catalin", "Brasov"],
        ["A06", "Marinescu", "Ioana", "Oradea"],
        ["A07", "Enache", "Radu", "Sibiu"],
        ["A08", "Luca", "Simona", "Constanta"],
        ["A09", "Nita", "Victor", "Craiova"],
        ["A10", "Cojocaru", "Ana-Maria", "Galati"],
        ["A14", "Ilie", "George", "Pitesti"],
        ["A15", "Sandu", "Laura", "Baia Mare"],
        ["A16", "Dumitru", "Raluca", "Ploiesti"],
    ]:
        ws_ang.append(row)

    ws_ch = wb.create_sheet("Cheltuieli")
    ws_ch.append(["Angajat", "Cazare", "Transport", "Mancare", "Materiale", "Diurna"])
    for row in [
        ["Mihai Popescu", "840", "620", "310", "180", "120"],
        ["Elena Ionescu", "520", "410", "220", "95", "80"],
        ["Andrei Stan", "1200", "980", "450", "320", "200"],
        ["Diana Radu", "680", "540", "280", "140", "90"],
        ["Catalin Moldovan", "590", "470", "240", "110", "75"],
        ["Ioana Marinescu", "710", "650", "290", "160", "100"],
        ["Radu Enache", "480", "390", "210", "85", "60"],
        ["Simona Luca", "920", "710", "340", "150", "110"],
    ]:
        ws_ch.append(row)

    wb.save(path)


def vacante_murdar_rows() -> list[list]:
    title = ["Raport vacante grupa", "", "", "", "", "", "", "", "", ""]
    sub = ["generat automat, nu edita manual", "", "", "", "", "", "", "", "", ""]
    hdr = [
        "ID_Calator",
        "Calator",
        "Oras",
        "Tara",
        "Data_Plecare",
        "Sezon",
        "Durata_Zile",
        "Cost_Total",
        "",
        "Nota_interna",
    ]
    data: list[list] = [
        ["C01", "Violeta Gutu", "Paris", " Franta ", "12.03.2023", "Normal", "7 zile", "1.250,00 lei", "Avion", ""],
        ["C01", "Violeta Gutu", "Barcelona", "Spania", "15.06.2024", "", "10 zile", "2.100,50 lei", "Avion", ""],
        ["C02", "Silvana Boboescu", "Roma", "ITALIA", "15.03.2022", "Post-pandemic", "5 zile", "980,00 lei", "Avion", ""],
        ["", "Silvana Boboescu", "Maldive", "Maldive", "02.08.2024", "Normal", "14 zile", "4.800,00 lei", "Avion", ""],
        ["C03", "Andreea Filip", "Praga", "Cehia", "04.05.2023", "Normal", "4 zile", "640,00 lei", "Masina", ""],
        ["C03", "Andreea Filip", "New York", "SUA", "20.07.2024", "Normal", "12 zile", "6.200,00 lei", "Avion", ""],
        ["C04", "Costin Vaetisi", "Bali", "Indonezia", "04.05.2022", "Post-pandemic", "15 zile", "5.100,00 lei", "Avion", "verificat"],
        ["", "Costin Vaetisi", "Tokyo", "Japonia", "01.09.2023", "", "10 zile", "3.450,00 lei", "Avion", ""],
        ["C05", "Mariana Vasile", "Viena", "Austria", "21.04.2023", "Normal", "3 zile", "890,00 lei", "Tren", ""],
        ["C05", "Mariana Vasile", "Santorini", " Grecia ", "18.07.2024", "Normal", "8 zile", "2.760,00 lei", "Avion", ""],
        ["C06", "Adrian Marginean", "Londra", "UK", "06.11.2022", "Post-pandemic", "6 zile", "1.980,00 lei", "Avion", ""],
        ["C06", "Adrian Marginean", "Amsterdam", "Olanda", "14.09.2023", "Normal", "4 zile", "1.120,00 lei", "Avion", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["C01", "Violeta Gutu", "Paris", " Franta ", "12.03.2023", "Normal", "7 zile", "1.250,00 lei", "Avion", ""],
        ["C07", "Ovidiu Borlean", "Dubai", "EAU", "11.02.2023", "Normal", "7 zile", "n/a", "Avion", ""],
        ["C08", "Patricia Cadar-Musca", "Lisabona", "Portugalia", "09.05.2023", "Normal", "cinci zile", "1.540,00 lei", "Avion", ""],
        ["C09", "Alexandru-Paul Dima", "Reykjavik", "Islanda", "18.08.2023", "Normal", "6 zile", "2.400,00 lei", "Avion", ""],
        ["C10", "Beatrice Adina Antonievici", "Budapesta", "Ungaria", "02.10.2023", "Normal", "4 zile", "720,00 lei", "Tren", ""],
        ["C11", "Edgar Denes", "Bruges \n", "Belgia", "03.04.2022", "", "3 zile", "510,00 lei", "Avion", "de sters"],
        ["C12", "horea stanescu", "Atena", "Grecia", "16.06.2022", "Post-pandemic", "5 zile", "1.050,00 lei", "Avion", ""],
        ["C07", "Ovidiu Borlean", "Nisa", "Franta", "31.02.2023", "Normal", "6 zile", "1.890,00 lei", "Avion", ""],
        ["C10", "Beatrice Adina Antonievici", "Florenta", "Italia", "22.09.2024", "Normal", "5 zile", "1.310,00 lei", "Tren", ""],
    ]
    n_data = len(data)
    footer = [f"Total randuri: {n_data}", "", "", "", "", "", "", "", "", ""]
    return [title, sub, hdr, *data, footer]


def deplasari_murdar_rows() -> list[list]:
    title = ["Raport deplasari serviciu Q1-Q3", "", "", "", "", "", "", "", "", ""]
    sub = ["export HR — nu modifica manual", "", "", "", "", "", "", "", "", ""]
    hdr = [
        "ID_Angajat",
        "Angajat",
        "Oras",
        "Tara",
        "Data_Plecare",
        "Tip_proiect",
        "Durata_Zile",
        "Cost_Total",
        "",
        "Nota_interna",
    ]
    data: list[list] = [
        ["A01", "Mihai Popescu", "Berlin", " Germania ", "10.02.2023", "Audit", "4 zile", "2.100,00 lei", "Avion", ""],
        ["A01", "Mihai Popescu", "Munchen", "GERMANIA", "18.09.2024", "Training", "3 zile", "1.850,00 lei", "Tren", ""],
        ["A02", "Elena Ionescu", "Bruxelles", "Belgia", "03/15/2022", "Conferinta", "2 zile", "980,00 lei", "Avion", ""],
        ["", "Elena Ionescu", "Lyon", "Franta", "22.06.2024", "Workshop", "5 zile", "1.420,00 lei", "Avion", ""],
        ["A03", "Andrei Stan", "Stockholm", "Suedia", "2023-05-04", "Implementare", "7 zile", "3.200,00 lei", "Avion", "verificat"],
        ["A03", "Andrei Stan", "Helsinki", "Finlanda", "14.08.2023", "", "4 zile", "1.760,00 lei", "Avion", ""],
        ["A04", "Diana Radu", "Milano", "Italia", "07.11.2022", "Audit", "cinci zile", "1.540,00 lei", "Tren", ""],
        ["", "Diana Radu", "Zurich", "Elvetia", "01.03.2024", "Training", "6 zile", "2.890,00 lei", "Avion", ""],
        ["A05", "Catalin Moldovan", "Lisabona", "Portugalia", "19.04.2023", "Conferinta", "3 zile", "890,00 lei", "Avion", ""],
        ["A05", "Catalin Moldovan", "Dublin", "Irlanda", "2024-06-12", "Workshop", "5 zile", "2.050,00 lei", "Avion", ""],
        ["", "", "", "", "", "", "", "", "", ""],
        ["A01", "Mihai Popescu", "Berlin", " Germania ", "10.02.2023", "Audit", "4 zile", "2.100,00 lei", "Avion", ""],
        ["A06", "Ioana Marinescu", "Budapesta", "Ungaria", "08.07.2023", "Implementare", "4 zile", "n/a", "Tren", ""],
        ["A07", "Radu Enache", "Viena", "Austria", "12.10.2022", "Training", "3 zile", "720,00 lei", "Tren", ""],
        ["A08", "Simona Luca", "Copenhaga", "Danemarca", "25.01.2023", "Audit", "5 zile", "1.980,00 lei", "Avion", ""],
        ["A09", "Victor Nita", "Oslo", "Norvegia", "30.02.2023", "Conferinta", "4 zile", "1.650,00 lei", "Avion", ""],
        ["A10", "Ana-Maria Cojocaru", "Madrid", "Spania", "04.05.2024", "Workshop", "6 zile", "2.240,00 lei", "Avion", ""],
        ["A11", "Florin Matei", "Rotterdam\n", "Olanda", "16.03.2022", "", "2 zile", "610,00 lei", "Tren", "de sters"],
        ["A12", "gabriel toma", "Praga", "Cehia", "21.08.2022", "Implementare", "5 zile", "1.120,00 lei", "Avion", ""],
        ["A06", "Ioana Marinescu", "Sevilla", "SPANIA", "2024-09-03", "Training", "7 zile", "1.890,00 lei", "Avion", ""],
        ["A10", "Ana-Maria Cojocaru", "Edinburgh", "UK", "2024-11-18", "Conferinta", "4 zile", "1.430,00 lei", "Avion", ""],
        ["A02", "Elena Ionescu", "Tallinn", "Estonia", "2023-04-11", "Workshop", "3", "940,00 lei", "Avion", ""],
        ["A13", "Oana Petrescu", "Valletta", "Malta", "06/20/2023", "Audit", "5 zile", "1.310,00 lei", "Avion", ""],
        ["", "Oana Petrescu", "Reykjavik", "Islanda", "2024-07-22", "Training", "8 zile", "3.450,00 lei", "Avion", "prioritar"],
        ["A14", "George Ilie", "Glasgow", "UK", "11.12.2022", "Implementare", "4 zile", "1.080,00 lei", "Avion", ""],
        ["A14", "George Ilie", "Porto", "Portugalia", "2024-02-14", "Conferinta", "5 zile", "1.560,00 lei", "Avion", ""],
        ["A15", "Laura Sandu", "Krakow", "Polonia", "17.05.2023", "Workshop", "3 zile", "650,00 lei", "Tren", ""],
        ["A15", "Laura Sandu", "Singapore", "Singapore", "2024-10-05", "Training", "9 zile", "5.800,00 lei", "Avion", ""],
        ["A04", "Diana Radu", "Toronto", "Canada", "2024-03-28", "Audit", "10 zile", "4.200,00 lei", "Avion", ""],
        ["A07", "Radu Enache", "Barcelona", "Spania", "2024-05-16", "Implementare", "6 zile", "1.990,00 lei", "Avion", ""],
        ["A08", "Simona Luca", "Luxemburg", "Luxemburg", "2023-08-30", "Conferinta", "2 zile", "780,00 lei", "Tren", ""],
        ["A03", "Andrei Stan", "Chicago", "SUA", "2024-12-02", "Training", "7 zile", "6.100,00 lei", "Avion", ""],
        ["A11", "Florin Matei", "Antwerp", "Belgia", "2024-04-09", "Workshop", "3 zile", "890,00 lei", "Tren", ""],
        ["A12", "Gabriel Toma", "Bucuresti", "Romania", "2023-02-01", "Intern", "1 zile", "0,00 lei", "Masina", ""],
        ["A05", "Catalin Moldovan", "Roma", "Italia", "2025-01-08", "Audit", "4 zile", "1.240,00 lei", "Avion", ""],
        ["A09", "Victor Nita", "Warsaw", "Polonia", "2024-08-21", "Implementare", "5 zile", "1.350,00 lei", "Avion", ""],
        ["A13", "Oana Petrescu", "Nice", "Franta", "2024-06-07", "Conferinta", "4 zile", "1.720,00 lei", "Avion", ""],
        ["A16", "cristian voicu", "Bucuresti", "Romania", "2023-03-08", "Intern", "1 zile", "0,00 lei", "Masina", ""],
        ["A17", "Monica Ardelean", "Split", "Croatia", "11.07.2023", "Workshop", "6 zile", "1.480,00 lei", "Avion", ""],
        ["", "Monica Ardelean", "Marrakesh", "MAROC", "2024-04-15", "Training", "8 zile", "2.950,00 lei", "Avion", ""],
        ["A18", "Stefan Olteanu", "Geneva", "Elvetia", "2022-12-01", "Audit", "3 zile", "1.890,00 lei", "Avion", ""],
        ["A18", "Stefan Olteanu", "Birmingham", "UK", "2024-01-22", "Conferinta", "4 zile", "1.320,00 lei", "Avion", ""],
        ["A19", "Irina Popa", "Sofia", "Bulgaria", "2023-06-19", "Implementare", "5 zile", "1.050,00 lei", "Avion", ""],
        ["", "Irina Popa", "Larnaca", "Cipru", "2024-08-08", "", "7 zile", "2.180,00 lei", "Avion", ""],
        ["A20", "Dan Munteanu", "Frankfurt", " Germania ", "2024-03-05", "Training", "patru zile", "1.670,00 lei", "Tren", ""],
        ["A20", "Dan Munteanu", "Poznan", "Polonia", "2024-10-28", "Workshop", "3", "780,00 lei", "Tren", ""],
        ["A17", "Monica Ardelean", "Napoli", "Italia", "2025-02-14", "Audit", "5 zile", "1.540,00 lei", "Avion", ""],
        ["A19", "Irina Popa", "Tbilisi", "Georgia", "2024-11-30", "Conferinta", "6 zile", "n/a", "Avion", ""],
        ["A18", "Stefan Olteanu", "Lille", "Franta", "31.02.2024", "Implementare", "2 zile", "890,00 lei", "Tren", ""],
        ["A16", "Cristian Voicu", "Cluj-Napoca", "Romania", "2024-05-09", "Intern", "1", "0,00 lei", "Masina", ""],
        ["A04", "Diana Radu", "Manchester", "UK", "2023-11-17", "Workshop", "4 zile", "1.760,00 lei", "Avion", ""],
        ["A08", "Simona Luca", "Tallinn", "Estonia", "2024-07-01", "Training", "3 zile", "940,00 lei", "Avion", ""],
        ["A02", "Elena Ionescu", "Marsilia", "Franta", "2024-12-12", "Conferinta", "5 zile", "1.820,00 lei", "Avion", ""],
        ["A06", "Ioana Marinescu", "Salzburg", "Austria", "2023-09-25", "Audit", "3 zile", "720,00 lei", "Masina", ""],
    ]
    n_data = len(data)
    footer = [f"Total randuri: {n_data}", "", "", "", "", "", "", "", "", ""]
    return [title, sub, hdr, *data, footer]


def write_csv(path: Path, headers: list[str], rows: list[list]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(headers)
        w.writerows(rows)


def main() -> None:
    vac_rows = vacante_murdar_rows()
    write_xlsx(ROOT / "Vacante_murdar.xlsx", "Vacante", vac_rows)
    # CSV brut sincron (primele coloane, pentru referință)
    hdr = vac_rows[2]
    body = [r for r in vac_rows[3:-1] if any(str(c).strip() for c in r)]
    with (ROOT / "Vacante_brut.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(vac_rows[0])
        w.writerow(vac_rows[1])
        w.writerow(hdr)
        w.writerows(vac_rows[3:-1])
        w.writerow(vac_rows[-1])

    write_tema_workbook(ROOT / "Deplasari_tema.xlsx")

    write_csv(
        ROOT / "Calatori.csv",
        ["ID_Calator", "Nume", "Prenume", "Oras_Resedinta"],
        [
            ["C01", "Gutu", "Violeta", "Cluj-Napoca"],
            ["C02", "Boboescu", "Silvana", "Bucuresti"],
            ["C03", "Filip", "Andreea", "Timisoara"],
            ["C04", "Vaetisi", "Costin", "Iasi"],
            ["C05", "Vasile", "Mariana", "Brasov"],
            ["C06", "Marginean", "Adrian", "Oradea"],
            ["C07", "Borlean", "Ovidiu", "Sibiu"],
            ["C08", "Cadar-Musca", "Patricia", "Constanta"],
            ["C09", "Dima", "Alexandru-Paul", "Cluj-Napoca"],
            ["C10", "Antonievici", "Beatrice Adina", "Bucuresti"],
            ["C13", "Iordache", "Raluca", "Galati"],
        ],
    )

    dep_rows = deplasari_murdar_rows()
    n_vac = len([r for r in vac_rows[3:-1] if any(str(c).strip() for c in r)])
    n_dep = len([r for r in dep_rows[3:-1] if any(str(c).strip() for c in r)])
    print(f"Vacante_murdar.xlsx: {n_vac} rânduri de date (+ titlu, duplicat, gol, footer)")
    print(f"Deplasari_tema.xlsx: foaia Deplasari {n_dep} rânduri + Deplasari_2025, Angajati, Cheltuieli")


if __name__ == "__main__":
    main()
