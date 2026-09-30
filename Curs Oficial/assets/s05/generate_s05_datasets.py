# -*- coding: utf-8 -*-
"""Generează setul murdar pentru Sesiunea 5 · vizualizări (fact + 4 dimensiuni, id numeric)."""
from __future__ import annotations

import random
from datetime import date, timedelta
from pathlib import Path

from openpyxl import Workbook

ROOT = Path(__file__).resolve().parent
SESSION_DIR = ROOT.parent.parent / "sesiuni" / "s05"
RNG = random.Random(20260330)
CAL_START = date(2022, 1, 1)
CAL_END = date(2025, 12, 31)


def calendar_id(d: date) -> int:
    return (d - CAL_START).days + 1

REGIUNI = ["Nord-Vest", "Centru", "Sud", "Sud-Est", "Bucuresti-Ilfov"]
ORASE = {
    "Nord-Vest": ["Cluj-Napoca", "Oradea", "Baia Mare", "Timisoara"],
    "Centru": ["Brasov", "Sibiu", "Alba Iulia", "Targu Mures"],
    "Sud": ["Craiova", "Pitesti", "Ploiesti"],
    "Sud-Est": ["Constanta", "Galati", "Braila", "Iasi"],
    "Bucuresti-Ilfov": ["Bucuresti", "Voluntari", "Pantelimon"],
}
JUDET = {
    "Cluj-Napoca": "Cluj",
    "Oradea": "Bihor",
    "Baia Mare": "Maramures",
    "Timisoara": "Timis",
    "Brasov": "Brasov",
    "Sibiu": "Sibiu",
    "Alba Iulia": "Alba",
    "Targu Mures": "Mures",
    "Craiova": "Dolj",
    "Pitesti": "Arges",
    "Ploiesti": "Prahova",
    "Constanta": "Constanta",
    "Galati": "Galati",
    "Braila": "Braila",
    "Iasi": "Iasi",
    "Bucuresti": "Bucuresti",
    "Voluntari": "Ilfov",
    "Pantelimon": "Ilfov",
}

MAGazine = [
    ("MG001", "Magazin Cluj Centru", "Cluj-Napoca", 46.7712, 23.6236, "Magazin propriu", 420),
    ("MG002", "Magazin Bucuresti Unirii", "Bucuresti", 44.4268, 26.1025, "Magazin propriu", 680),
    ("MG003", "Magazin Timisoara", "Timisoara", 45.7489, 21.2087, "Franciza", 310),
    ("MG004", "Magazin Constanta", "Constanta", 44.1598, 28.6348, "Magazin propriu", 390),
    ("MG005", "Magazin Iasi Palas", "Iasi", 47.1585, 27.6014, "Franciza", 280),
    ("MG006", "Magazin Brasov", "Brasov", 45.6579, 25.6012, "Magazin propriu", 350),
    ("MG007", "Magazin Oradea", "Oradea", 47.0465, 21.9189, "Franciza", 240),
    ("MG008", "Magazin Craiova", "Craiova", 44.3302, 23.7949, "Magazin propriu", 300),
    ("MG009", "Showroom Online HQ", "Bucuresti", 44.4378, 26.0975, "Online", 120),
    ("MG010", "Pop-up Galati", "Galati", 45.4353, 28.0080, "Pop-up", 85),
]

PRODUSE = [
    ("SKU-E100", "Laptop Pro 14", "Electronice", "Laptopuri", "TechNova", 4299.0),
    ("SKU-E101", "Monitor 27 4K", "Electronice", "Monitoare", "TechNova", 1899.0),
    ("SKU-E102", "Casti wireless", "Electronice", "Accesorii IT", "SoundPeak", 349.0),
    ("SKU-E103", "Telefon mid-range", "Electronice", "Telefoane", "Mobilix", 1599.0),
    ("SKU-E104", "Tableta 10 inch", "Electronice", "Tablete", "Mobilix", 1299.0),
    ("SKU-I200", "Geaca iarna barbati", "Imbracaminte", "Geci", "UrbanWear", 599.0),
    ("SKU-I201", "Pantofi sport dama", "Imbracaminte", "Incaltaminte", "UrbanWear", 329.0),
    ("SKU-I202", "Tricou bumbac", "Imbracaminte", "Tricouri", "CottonLine", 79.0),
    ("SKU-I203", "Rochie ocazie", "Imbracaminte", "Rochii", "Elegance", 449.0),
    ("SKU-A300", "Cafea boabe 1kg", "Alimente", "Bauturi", "RoastMaster", 89.0),
    ("SKU-A301", "Ulei masline extra", "Alimente", "Bacanie", "Mediterra", 54.0),
    ("SKU-A302", "Ciocolata artizanala", "Alimente", "Dulciuri", "CacaoArt", 32.0),
    ("SKU-A303", "Mix nuci 500g", "Alimente", "Snacks", "GreenNut", 45.0),
    ("SKU-C400", "Aspirator vertical", "Casa & Gradina", "Electrocasnice mici", "HomeEasy", 899.0),
    ("SKU-C401", "Set vase ceramica", "Casa & Gradina", "Bucatarie", "CeramHome", 219.0),
    ("SKU-C402", "Lampa LED birou", "Casa & Gradina", "Iluminat", "BrightDot", 129.0),
    ("SKU-S500", "Abonament service IT", "Servicii", "Support", "TechNova", 199.0),
    ("SKU-S501", "Instalare electrocasnic", "Servicii", "Montaj", "HomeEasy", 149.0),
    ("SKU-S502", "Consultanta retail", "Servicii", "Consulting", "RetailPro", 990.0),
    ("SKU-E105", "SSD extern 1TB", "Electronice", "Stocare", "DataFast", 399.0),
    ("SKU-I204", "Geaca ploaie unisex", "Imbracaminte", "Geci", "OutdoorX", 279.0),
    ("SKU-A304", "Miere poliflora 500g", "Alimente", "Bacanie", "Apicultura+", 38.0),
    ("SKU-C403", "Perdele blackout", "Casa & Gradina", "Textile", "SoftHome", 189.0),
    ("SKU-E106", "Router Wi-Fi 6", "Electronice", "Retea", "NetLink", 459.0),
]

CLIENTI = [
    ("CL001", "SC Alpha Trade SRL", "PJ", "Cluj-Napoca", "Enterprise", 9.2),
    ("CL002", "SC Beta Distribution SA", "PJ", "Bucuresti", "Enterprise", 8.5),
    ("CL003", "Ion Popescu", "PF", "Timisoara", "Retail mic", 7.8),
    ("CL004", "SC Gamma Retail SRL", "PJ", "Brasov", "SMB", 8.1),
    ("CL005", "Maria Ionescu", "PF", "Constanta", "Retail mic", 9.0),
    ("CL006", "SC Delta Foods SRL", "PJ", "Iasi", "SMB", 7.2),
    ("CL007", "SC Epsilon Tech SRL", "PJ", "Oradea", "Enterprise", 8.8),
    ("CL008", "Andrei Stan", "PF", "Sibiu", "Retail mic", 6.5),
    ("CL009", "SC Zeta Home SRL", "PJ", "Craiova", "SMB", 7.9),
    ("CL010", "Elena Radu", "PF", "Galati", "Retail mic", 8.3),
    ("CL011", "SC Omega Logistics SRL", "PJ", "Ploiesti", "Enterprise", 8.0),
    ("CL012", "SC Nova IT SRL", "PJ", "Bucuresti", "SMB", 7.5),
    ("CL013", "Catalin Moldovan", "PF", "Braila", "Retail mic", 7.1),
    ("CL014", "SC Polaris Construct SRL", "PJ", "Pitesti", "Enterprise", 6.9),
    ("CL015", "Diana Luca", "PF", "Voluntari", "Retail mic", 8.7),
    ("CL016", "SC Atlas Pharma SRL", "PJ", "Targu Mures", "SMB", 8.4),
    ("CL017", "Radu Enache", "PF", "Alba Iulia", "Retail mic", 7.6),
    ("CL018", "SC Meridian Auto SRL", "PJ", "Baia Mare", "Enterprise", 7.0),
    ("CL019", "Simona Nita", "PF", "Pantelimon", "Retail mic", 9.1),
    ("CL020", "SC Horizon Edu SRL", "PJ", "Cluj-Napoca", "SMB", 8.2),
    ("CL021", "Victor Marinescu", "PF", "Oradea", "Retail mic", 6.8),
    ("CL022", "SC Luna Beauty SRL", "PJ", "Bucuresti", "SMB", 8.6),
    ("CL023", "Ana Cojocaru", "PF", "Iasi", "Retail mic", 7.4),
    ("CL024", "SC Titan Energy SRL", "PJ", "Constanta", "Enterprise", 7.7),
    ("CL025", "George Ilie", "PF", "Craiova", "Retail mic", 8.9),
    ("CL026", "SC Vertex Media SRL", "PJ", "Brasov", "SMB", 7.3),
    ("CL027", "Laura Sandu", "PF", "Timisoara", "Retail mic", 8.0),
    ("CL028", "SC Apex Tools SRL", "PJ", "Sibiu", "Enterprise", 8.5),
    ("CL029", "Florin Matei", "PF", "Galati", "Retail mic", 6.7),
    ("CL030", "SC Orion Pack SRL", "PJ", "Bucuresti", "SMB", 7.8),
    ("CL031", "Oana Petrescu", "PF", "Cluj-Napoca", "Retail mic", 9.3),
    ("CL032", "SC Phoenix Agro SRL", "PJ", "Braila", "Enterprise", 7.1),
    ("CL033", "Gabriel Toma", "PF", "Ploiesti", "Retail mic", 8.1),
    ("CL034", "SC Quantum Labs SRL", "PJ", "Oradea", "SMB", 8.4),
    ("CL035", "Monica Ardelean", "PF", "Voluntari", "Retail mic", 7.9),
]

CANAL = ["Magazin fizic", "Online", "Partener B2B", "Telefon"]
STATUS = ["Platit", "Partial", "Neplatit", "Anulat"]
LUNI_RO = [
    "",
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
]
ZI_RO = ["Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata", "Duminica"]


def fmt_ro_money(val: float) -> str:
    s = f"{val:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"{s} RON"


def fmt_date_ro(d: date) -> str:
    """Format unic România (zi.lună.an) — folosit la Data_Facturare în fact."""
    return d.strftime("%d.%m.%Y")


def build_fact_rows(n: int = 132) -> list[list]:
    hdr = FACT_HDR[:]
    title = ["Export linii vanzari · ERP v3.2", *([""] * (len(hdr) - 1))]
    sub = ["Nu edita manual — reimport zilnic", *([""] * (len(hdr) - 1))]

    max_days = (CAL_END - CAL_START).days
    rows: list[list] = []
    for i in range(n):
        d = CAL_START + timedelta(days=RNG.randint(0, max_days))
        id_client = RNG.randint(1, len(CLIENTI))
        id_produs = RNG.randint(1, len(PRODUSE))
        id_magazin = RNG.randint(1, len(MAGazine))
        id_data = calendar_id(d)
        _, _, _, _, _, pret = PRODUSE[id_produs - 1]
        qty = RNG.randint(1, 12)
        if RNG.random() < 0.08:
            qty_str = f"{qty} buc"
        elif RNG.random() < 0.05:
            qty_str = str(qty).replace(".", ",") + " buc"
        else:
            qty_str = qty

        disc = RNG.choice([0, 0, 5, 10, 15, 20])
        net = round(pret * qty * (1 - disc / 100), 2)
        tva_rate = 19 if RNG.random() > 0.03 else 9
        tva = round(net * tva_rate / 100, 2)
        total = round(net + tva, 2)

        ds = fmt_date_ro(d)
        if RNG.random() < 0.04:
            ds = f" {ds} "

        id_client_out: str | int = id_client
        id_produs_out: str | int = id_produs
        id_magazin_out: str | int = id_magazin
        id_date_out: str | int = id_data
        if RNG.random() < 0.05:
            id_client_out = f" {id_client} "
        if RNG.random() < 0.03:
            id_produs_out = str(id_produs)
        if RNG.random() < 0.03:
            id_magazin_out = f"{id_magazin}.0"

        # Valori monetare: mereu număr (2 zecimale) — fără „RON”, fără text RO (evită mix text/număr în PQ)
        pret_out = round(float(pret), 2)
        net_out = net
        total_out = total

        canal = RNG.choice(CANAL)
        if id_magazin == 9 and canal == "Magazin fizic":
            canal = "Online"

        moneda = "RON" if RNG.random() > 0.06 else "EUR"
        status = RNG.choice(STATUS)
        if status == "Anulat" and RNG.random() < 0.5:
            net_out = 0
            total_out = 0

        rows.append(
            [
                id_date_out,
                id_client_out,
                id_produs_out,
                id_magazin_out,
                ds,
                qty_str,
                RNG.choice(["buc", "BUC", "buc."]),
                pret_out,
                disc,
                net_out,
                tva_rate,
                tva,
                total_out,
                canal,
                status,
                moneda,
                "",
            ]
        )

    # murdarie intentională
    dup = rows[12][:]
    rows.insert(45, dup)
    rows[3] = ["" if c == "" else c for c in rows[3]]
    rows[3][1] = ""  # ID_Client lipsă
    rows[7][4] = "31.02.2024"
    rows[9][4] = "2024-13-40"
    rows[55] = [""] * len(hdr)
    rows[88][1] = 1
    rows[88][4] = rows[12][4]  # duplicat (aceeași dată)
    rows[101][5] = "2,5 buc"
    rows[110][13] = "  Online  "

    footer = [f"Total linii export: {len([r for r in rows if any(str(c).strip() for c in r)])}", *([""] * (len(hdr) - 1))]
    return [title, sub, hdr, *rows, footer]


def build_dim_clienti() -> list[list]:
    hdr = [
        "ID",
        "Denumire",
        "Tip_Client",
        "Oras",
        "Judet",
        "Regiune",
        "Segment",
        "Data_Inregistrare",
        "NPS_Ultim",
        "Email_Contact",
    ]
    junk1 = ["Lista clienti CRM", *([""] * (len(hdr) - 1))]
    junk2 = ["snapshot 2025-Q1", *([""] * (len(hdr) - 1))]

    rows: list[list] = []
    for cid, (_cod, den, tip, oras, seg, nps) in enumerate(CLIENTI, start=1):
        jud = JUDET.get(oras, "N/A")
        reg = next(k for k, v in ORASE.items() if oras in v)
        reg_out = reg if RNG.random() > 0.08 else reg.upper()
        if RNG.random() < 0.07:
            oras_out = oras + "\n"
        else:
            oras_out = oras
        tip_out = tip if RNG.random() > 0.1 else ("Persoana Juridica" if tip == "PJ" else "Persoana Fizica")
        email = f"contact@{den.split()[-1].lower().replace('.', '')}.ro"
        if RNG.random() < 0.06:
            email = f" {email} "
        d_reg = date(2018, 1, 1) + timedelta(days=RNG.randint(0, 2500))
        d_str = d_reg.strftime("%d.%m.%Y") if RNG.random() > 0.15 else d_reg.strftime("%Y-%m-%d")
        nps_out = nps if RNG.random() > 0.05 else f"{nps}/10"
        id_out: str | int = cid
        if RNG.random() < 0.04:
            id_out = str(cid)
        rows.append([id_out, den, tip_out, oras_out, jud, reg_out, seg, d_str, nps_out, email])

    # duplicat aproape identic (merge) — alt id, același client
    rows.append([36, "Ion Popescu", "PF", "Timisoara", "Timis", "Nord-Vest", "Retail mic", "12.03.2019", "7,8", "ion.popescu@gmail.com"])
    rows[4] = [rows[4][0], rows[4][1], rows[4][2], "CONSTANTA", rows[4][4], "Sud-Est", rows[4][6], rows[4][7], "NULL", rows[4][9]]
    rows[11] = [rows[11][0], rows[11][1] + " ", rows[11][2], rows[11][3], rows[11][4], rows[11][5], rows[11][6], rows[11][7], rows[11][8], rows[11][9]]

    return [junk1, junk2, hdr, *rows]


def build_dim_produse() -> list[list]:
    hdr = [
        "ID",
        "SKU_Produs",
        "Nume_Produs",
        "Categorie",
        "Subcategorie",
        "Brand",
        "Pret_Catalog",
        "Greutate_Kg",
        "Activ",
    ]
    rows: list[list] = []
    prev_cat = ""
    for pid, (sku, nume, cat, sub, brand, pret) in enumerate(PRODUSE, start=1):
        cat_cell = cat
        if RNG.random() < 0.25:
            cat_cell = "" if prev_cat == cat else cat
        prev_cat = cat
        pret_out = round(float(pret), 2)
        sku_out = sku
        if RNG.random() < 0.04:
            sku_out = "0" + sku.replace("SKU-", "SKU-0")
        greutate = round(RNG.uniform(0.05, 8.5), 2)
        activ = "Da" if RNG.random() > 0.05 else "NU"
        nume_out = nume if RNG.random() > 0.06 else f"  {nume}  "
        rows.append([pid, sku_out, nume_out, cat_cell, sub, brand, pret_out, greutate, activ])

    # rand cu categorie shiftata (curatare manuala)
    rows[6] = [rows[6][0], rows[6][1], rows[6][2], rows[6][4], rows[6][3], rows[6][5], rows[6][6], rows[6][7], rows[6][8]]
    header_row = ["ID", "Cod produs", "Denumire", "Cat.", "Subcat.", "Marca", "Pret", "Kg", "Activ?"]
    return [[], header_row, hdr, *rows]


def build_dim_magazine() -> list[list]:
    hdr = [
        "ID",
        "Nume_Magazin",
        "Oras",
        "Judet",
        "Regiune",
        "Latitudine",
        "Longitudine",
        "Format_Magazin",
        "Suprafata_mp",
    ]
    rows: list[list] = []
    for mid, (_cod, nume, oras, lat, lon, fmt, sup) in enumerate(MAGazine, start=1):
        jud = JUDET.get(oras, "")
        reg = next(k for k, v in ORASE.items() if oras in v)
        if RNG.random() < 0.12:
            reg = {"Nord-Vest": "NW", "Centru": "C", "Sud": "S", "Sud-Est": "SE", "Bucuresti-Ilfov": "B-IF"}.get(reg, reg)
        lat_out: str | float = lat
        lon_out: str | float = lon
        if RNG.random() < 0.2:
            lat_out = str(lat).replace(".", ",")
            lon_out = str(lon).replace(".", ",")
        sup_out: str | int = sup if RNG.random() > 0.05 else f"{sup} mp"
        rows.append([mid, nume, oras, jud, reg, lat_out, lon_out, fmt, sup_out])

    # acelasi magazin, id diferit (dedupe)
    rows.append([11, "Magazin Timisoara", "Timisoara", "Timis", "Nord-Vest", "45,7489", "21,2087", "Franciza", "310"])
    rows[2] = [rows[2][0], rows[2][1], rows[2][2], rows[2][3], "NV", rows[2][5], rows[2][6], rows[2][7], ""]

    title = ["Locatii retail", *([""] * (len(hdr) - 1))]
    return [title, hdr, *rows]


def build_dim_date() -> list[list]:
    hdr = [
        "ID",
        "Data",
        "An",
        "Trimestru",
        "Luna",
        "Luna_Nume",
        "Zi_Saptamana",
        "Nr_Saptamana_An",
        "Zi_Lucratoare",
        "Perioada_Fiscala",
    ]
    rows: list[list] = []
    d = CAL_START
    day_id = 1
    while d <= CAL_END:
        q = (d.month - 1) // 3 + 1
        week = d.isocalendar()[1]
        zi = ZI_RO[d.weekday()]
        lucr = "Da" if d.weekday() < 5 else "Nu"
        pf = f"Q{q}-{d.year}"
        if RNG.random() < 0.02:
            data_out: str | int = (d - date(1899, 12, 30)).days
        elif RNG.random() < 0.03:
            data_out = d.strftime("%Y/%m/%d")
        else:
            data_out = d.strftime("%d.%m.%Y")
        rows.append(
            [
                day_id,
                data_out,
                d.year,
                f"T{q}",
                d.month,
                LUNI_RO[d.month],
                zi,
                week,
                lucr,
                pf,
            ]
        )
        day_id += 1
        d += timedelta(days=1)

    # randuri problematice
    rows[100][1] = "32.01.2022"
    rows[500][8] = "YES"
    rows[800][1] = ""

    title = ["Dim date · vanzari 2022-2025", *([""] * (len(hdr) - 1))]
    note = ["Include zile lucratoare RO", *([""] * (len(hdr) - 1))]
    return [title, note, hdr, *rows]


FACT_HDR = [
    "ID_Date",
    "ID_Client",
    "ID_Produs",
    "ID_Magazin",
    "Data_Facturare",
    "Cantitate",
    "UM",
    "Pret_Lista",
    "Discount_Pct",
    "Valoare_Neta",
    "Cota_TVA",
    "Valoare_TVA",
    "Valoare_Totala",
    "Canal_Vanzare",
    "Status_Plata",
    "Moneda",
    "Nota_Export",
]


def build_vanzari_clean(n: int = 132) -> list[list]:
    """Fact curat: header + rânduri, tipuri consistente, fără orfani."""
    rng = random.Random(20260330)
    max_days = (CAL_END - CAL_START).days
    rows: list[list] = []
    for _ in range(n):
        d = CAL_START + timedelta(days=rng.randint(0, max_days))
        id_client = rng.randint(1, len(CLIENTI))
        id_produs = rng.randint(1, len(PRODUSE))
        id_magazin = rng.randint(1, len(MAGazine))
        id_data = calendar_id(d)
        _, _, _, _, _, pret = PRODUSE[id_produs - 1]
        qty = rng.randint(1, 12)
        disc = rng.choice([0, 0, 5, 10, 15, 20])
        net = round(pret * qty * (1 - disc / 100), 2)
        tva_rate = 19 if rng.random() > 0.03 else 9
        tva = round(net * tva_rate / 100, 2)
        total = round(net + tva, 2)
        canal = rng.choice(CANAL)
        if id_magazin == 9 and canal == "Magazin fizic":
            canal = "Online"
        status = rng.choice(STATUS)
        if status == "Anulat" and rng.random() < 0.5:
            net = 0.0
            total = 0.0
        rows.append(
            [
                id_data,
                id_client,
                id_produs,
                id_magazin,
                fmt_date_ro(d),
                qty,
                "buc",
                round(float(pret), 2),
                disc,
                net,
                tva_rate,
                tva,
                total,
                canal,
                status,
                "RON",
                "",
            ]
        )
    return [FACT_HDR, *rows]


def build_dim_clienti_clean() -> list[list]:
    hdr = [
        "ID",
        "Denumire",
        "Tip_Client",
        "Oras",
        "Judet",
        "Regiune",
        "Segment",
        "Data_Inregistrare",
        "NPS_Ultim",
        "Email_Contact",
    ]
    rows: list[list] = []
    for cid, (_cod, den, tip, oras, seg, nps) in enumerate(CLIENTI, start=1):
        jud = JUDET.get(oras, "N/A")
        reg = next(k for k, v in ORASE.items() if oras in v)
        email = f"contact@{den.split()[-1].lower().replace('.', '')}.ro"
        d_reg = date(2018, 1, 1) + timedelta(days=(cid * 47) % 2500)
        rows.append(
            [
                cid,
                den,
                tip,
                oras,
                jud,
                reg,
                seg,
                d_reg.strftime("%d.%m.%Y"),
                round(nps, 1),
                email,
            ]
        )
    return [hdr, *rows]


def build_dim_produse_clean() -> list[list]:
    hdr = [
        "ID",
        "SKU_Produs",
        "Nume_Produs",
        "Categorie",
        "Subcategorie",
        "Brand",
        "Pret_Catalog",
        "Greutate_Kg",
        "Activ",
    ]
    rows: list[list] = []
    rng = random.Random(20260401)
    for pid, (sku, nume, cat, sub, brand, pret) in enumerate(PRODUSE, start=1):
        greutate = round(rng.uniform(0.05, 8.5), 2)
        rows.append([pid, sku, nume, cat, sub, brand, round(float(pret), 2), greutate, "Da"])
    return [hdr, *rows]


def build_dim_magazine_clean() -> list[list]:
    hdr = [
        "ID",
        "Nume_Magazin",
        "Oras",
        "Judet",
        "Regiune",
        "Latitudine",
        "Longitudine",
        "Format_Magazin",
        "Suprafata_mp",
    ]
    rows: list[list] = []
    for mid, (_cod, nume, oras, lat, lon, fmt, sup) in enumerate(MAGazine, start=1):
        jud = JUDET.get(oras, "")
        reg = next(k for k, v in ORASE.items() if oras in v)
        rows.append([mid, nume, oras, jud, reg, lat, lon, fmt, sup])
    return [hdr, *rows]


def build_dim_date_clean() -> list[list]:
    hdr = [
        "ID",
        "Data",
        "An",
        "Trimestru",
        "Luna",
        "Luna_Nume",
        "Zi_Saptamana",
        "Nr_Saptamana_An",
        "Zi_Lucratoare",
        "Perioada_Fiscala",
    ]
    rows: list[list] = []
    d = CAL_START
    day_id = 1
    while d <= CAL_END:
        q = (d.month - 1) // 3 + 1
        week = d.isocalendar()[1]
        zi = ZI_RO[d.weekday()]
        lucr = "Da" if d.weekday() < 5 else "Nu"
        pf = f"Q{q}-{d.year}"
        rows.append(
            [
                day_id,
                d.strftime("%d.%m.%Y"),
                d.year,
                f"T{q}",
                d.month,
                LUNI_RO[d.month],
                zi,
                week,
                lucr,
                pf,
            ]
        )
        day_id += 1
        d += timedelta(days=1)
    return [hdr, *rows]


def write_workbook_from_tables(path: Path, tables: list[tuple[str, list[list]]]) -> None:
    wb = Workbook()
    wb.remove(wb.active)
    for sheet_name, rows in tables:
        ws = wb.create_sheet(sheet_name[:31])
        sheet_from_rows(ws, rows)
    wb.save(path)


def write_clean_outputs(clean_dir: Path) -> None:
    clean_dir.mkdir(parents=True, exist_ok=True)
    vanzari = build_vanzari_clean()
    dims = [
        ("Dim_Clienti", build_dim_clienti_clean()),
        ("Dim_Produse", build_dim_produse_clean()),
        ("Dim_Magazine", build_dim_magazine_clean()),
        ("Dim_Date", build_dim_date_clean()),
    ]
    write_workbook_from_tables(
        clean_dir / "Vanzari_s5_curat.xlsx",
        [("Vanzari", vanzari), *dims],
    )
    wb = Workbook()
    ws = wb.active
    ws.title = "Vanzari"
    sheet_from_rows(ws, vanzari)
    wb.save(clean_dir / "Vanzari_curat.xlsx")
    for sheet_name, rows in dims:
        wb = Workbook()
        ws = wb.active
        ws.title = sheet_name[:31]
        sheet_from_rows(ws, rows)
        wb.save(clean_dir / f"{sheet_name}_curat.xlsx")
    (clean_dir / "CITESTE_MAI_INTAI_curat.txt").write_text(
        """Set date CURAT · Sesiunea 5
==============================

Același model star ca setul *_murdar*, fără rânduri junk, fără FK orfane,
tipuri consistente (gata de Model view după import).

Fișier principal: Vanzari_s5_curat.xlsx (5 foi)
Sau: Vanzari_curat.xlsx + Dim_*_curat.xlsx

Relații:
- Vanzari[ID_Date] → Dim_Date[ID]
- Vanzari[ID_Client] → Dim_Clienti[ID]
- Vanzari[ID_Produs] → Dim_Produse[ID]
- Vanzari[ID_Magazin] → Dim_Magazine[ID]

Folosire: soluție facilitator, raport demo final, sau dacă sari peste exercițiul Power Query.
""",
        encoding="utf-8",
    )


def sheet_from_rows(ws, rows: list[list]) -> None:
    for r_idx, row in enumerate(rows, start=1):
        for c_idx, val in enumerate(row, start=1):
            ws.cell(row=r_idx, column=c_idx, value=val)


def write_workbook(path: Path) -> None:
    wb = Workbook()
    ws_fact = wb.active
    ws_fact.title = "Vanzari"
    sheet_from_rows(ws_fact, build_fact_rows())

    ws_cl = wb.create_sheet("Dim_Clienti")
    sheet_from_rows(ws_cl, build_dim_clienti())

    ws_pr = wb.create_sheet("Dim_Produse")
    sheet_from_rows(ws_pr, build_dim_produse())

    ws_mg = wb.create_sheet("Dim_Magazine")
    sheet_from_rows(ws_mg, build_dim_magazine())

    ws_dt = wb.create_sheet("Dim_Date")
    sheet_from_rows(ws_dt, build_dim_date())

    wb.save(path)


def write_separate_workbooks(out_dir: Path) -> None:
    """Câte un fișier .xlsx per tabel (opțional, pentru încărcare separată)."""
    specs = [
        ("Vanzari_murdar.xlsx", "Vanzari", build_fact_rows()),
        ("Dim_Clienti_murdar.xlsx", "Dim_Clienti", build_dim_clienti()),
        ("Dim_Produse_murdar.xlsx", "Dim_Produse", build_dim_produse()),
        ("Dim_Magazine_murdar.xlsx", "Dim_Magazine", build_dim_magazine()),
        ("Dim_Date_murdar.xlsx", "Dim_Date", build_dim_date()),
    ]
    for fname, sheet, rows in specs:
        wb = Workbook()
        ws = wb.active
        ws.title = sheet[:31]
        sheet_from_rows(ws, rows)
        wb.save(out_dir / fname)


def write_readme(path: Path) -> None:
    path.write_text(
        """Set date · Sesiunea 5 · Vizualizări
=====================================

Fișier principal: Vanzari_s5_murdar.xlsx (5 foi)
Sau fișiere separate: *_murdar.xlsx în același folder.
Set curat (facilitator / fără PQ): folder date_curat/ sau assets/s05/curat/

Structură model (star):
- Vanzari (fact) — coloane: ID_Date, ID_Client, ID_Produs, ID_Magazin, apoi Data_Facturare (dd.mm.yyyy) + măsuri
- Dim_Clienti, Dim_Produse, Dim_Magazine, Dim_Date — coloană ID (1, 2, 3…)
- Relație date: Vanzari[ID_Date] → Dim_Date[ID]

Curățare diferită pe fiecare tabel (Power Query), similar sesiunea 3:
- Fact: titlu/footer, câteva date invalide punctual, FK text sau lipsă (fără ID inexistent în dim), cantități text; sumele sunt numere în Excel
- Clienți: junk sus, ID ca text punctual, tip client inconsistent, duplicat ID 36
- Produse: header dublu, categorie fill-down
- Magazine: regiuni abreviate, lat/long cu virgulă, magazin duplicat ID 11
- Dim_Date: ID + Data; unele date serial Excel, valori invalide punctuale (fără coloană sărbători)
""",
        encoding="utf-8",
    )


SESSION_DATA_FILES = [
    "Vanzari_s5_murdar.xlsx",
    "Vanzari_murdar.xlsx",
    "Dim_Clienti_murdar.xlsx",
    "Dim_Produse_murdar.xlsx",
    "Dim_Magazine_murdar.xlsx",
    "Dim_Date_murdar.xlsx",
    "CITESTE_MAI_INTAI_s05_date.txt",
]

# Fișiere vechi / duplicate — nu le păstrăm în sesiuni/s05
OBSOLETE_DATA_GLOB = [
    "Fact_Linii_Vanzari_murdar.xlsx",
    "Fact_Vanzari.xlsx",
    "Fact_Vanzari_murdar.xlsx",
    "Dim_Clienti.xlsx",
    "Dim_Produse.xlsx",
    "Dim_Magazine.xlsx",
    "Dim_Date.xlsx",
    "Dim_Calendar_murdar.xlsx",
    "Dim_Calendar.xlsx",
]


def prune_obsolete_data_files(directory: Path) -> None:
    for name in OBSOLETE_DATA_GLOB:
        path = directory / name
        if path.exists():
            path.unlink()
    for path in directory.glob("~$*.xlsx"):
        path.unlink(missing_ok=True)


CLEAN_DIR = ROOT / "curat"
SESSION_CLEAN_DIR = SESSION_DIR / "date_curat"


def copy_dir_files(src_dir: Path, dest_dir: Path) -> None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    if not src_dir.exists():
        return
    for src in src_dir.iterdir():
        if src.is_file():
            (dest_dir / src.name).write_bytes(src.read_bytes())


def copy_to_session() -> None:
    SESSION_DIR.mkdir(parents=True, exist_ok=True)
    prune_obsolete_data_files(SESSION_DIR)
    prune_obsolete_data_files(ROOT)
    for name in SESSION_DATA_FILES:
        src = ROOT / name
        if src.exists():
            (SESSION_DIR / name).write_bytes(src.read_bytes())
    copy_dir_files(CLEAN_DIR, SESSION_CLEAN_DIR)


def main() -> None:
    write_workbook(ROOT / "Vanzari_s5_murdar.xlsx")
    write_separate_workbooks(ROOT)
    write_readme(ROOT / "CITESTE_MAI_INTAI_s05_date.txt")
    write_clean_outputs(CLEAN_DIR)
    copy_to_session()
    fact = build_fact_rows()
    n_fact = len([r for r in fact[3:-1] if any(str(c).strip() for c in r)])
    dim_date = build_dim_date()
    n_date = len(dim_date[3:])
    print(f"Vanzari_s5_murdar.xlsx · Fact ~{n_fact} linii · Dim_Date {n_date} zile")
    print(f"Dim Clienti: {len(build_dim_clienti()) - 3} · Produse: {len(build_dim_produse()) - 3} · Magazine: {len(build_dim_magazine()) - 2}")
    print(f"Curat: {CLEAN_DIR} · copiat în {SESSION_CLEAN_DIR}")


if __name__ == "__main__":
    main()
