# -*- coding: utf-8 -*-
"""Sesiunea 10 · setul de date „Aviație”: 2 facturi + 7 dimensiuni, complet curat.

Generează:
  sesiuni/s10/date/<Tabel>.xlsx                          câte un Excel pe tabel (exemplele lecției)
  assets/s10/azure/aviatie_azure.sql                     CREATE TABLE + INSERT pentru Azure SQL Database (rulat în SSMS)
  sesiuni/s10/date/csv/<Tabel>.csv                       aceleași tabele, CSV (pentru urcarea ulterioară în Azure)
  sesiuni/s10/date/combinare/                            două exemple separate pentru „combinarea fișierelor”
  sesiuni/s10/date/rezervari_lunare/Rezervari_2025_MM.*  Fact_Rezervari 2025 pe luni (ian–nov; oct–nov XLSX, restul CSV)
  sesiuni/s10/date/rezervari_lunare_nou/Rezervari_2025_12.csv   fișierul „care vine luna viitoare” (demo refresh)

Poveste: 10 companii aeriene (fictive) care zboară din România. Fact_Zboruri = fiecare zbor operat.
Fact_Rezervari = rezervările făcute de membrii programului de loialitate (Dim_Pasageri).
Convenția cheilor e cea din S4–S9: în dimensiuni `ID`, în fact `ID_<Dimensiune>`. Moneda: EUR.
Rulare: python generate_s10.py
"""
from __future__ import annotations

import csv
import json
import math
import random
import shutil
import zipfile
from collections import defaultdict
from datetime import date, time, timedelta
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent
COURSE = ROOT.parent.parent
OUT = COURSE / "sesiuni" / "s10" / "date"
SQL_OUT = ROOT / "azure" / "aviatie_azure.sql"

CAL_START, CAL_END = date(2021, 1, 1), date(2025, 12, 31)
LUNI = ["", "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
ZILE = ["Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata", "Duminica"]
SEZOANE = {12: "Iarna", 1: "Iarna", 2: "Iarna", 3: "Primavara", 4: "Primavara", 5: "Primavara",
           6: "Vara", 7: "Vara", 8: "Vara", 9: "Toamna", 10: "Toamna", 11: "Toamna"}
N_ZBORURI = 10_000
N_REZERVARI = 12_000
N_PASAGERI = 2_500

# Cererea pe luni (vara și sărbătorile de iarnă sunt vârfuri) și creșterea 2025
SEZON_ZBOR = (0.80, 0.74, 0.86, 0.96, 1.02, 1.18, 1.38, 1.42, 1.12, 0.96, 0.84, 1.04)
CRESTERE = {2021: 0.52, 2022: 0.84, 2023: 0.95, 2024: 1.0, 2025: 1.09}  # după pandemie: revenire treptată


# ---------------------------------------------------------------------------
# Dimensiuni
# ---------------------------------------------------------------------------
def gen_date() -> list[dict]:
    rows, d, i = [], CAL_START, 1
    while d <= CAL_END:
        rows.append({
            "ID": i, "Data": d, "An": d.year, "Trimestru": f"T{(d.month - 1) // 3 + 1}", "Luna": d.month,
            "Luna_Nume": LUNI[d.month], "An_Luna": f"{d.year}-{d.month:02d}", "Zi_Saptamana": ZILE[d.weekday()],
            "Nr_Zi_Saptamana": d.weekday() + 1, "Weekend": "Da" if d.weekday() >= 5 else "Nu", "Sezon": SEZOANE[d.month],
        })
        d += timedelta(days=1)
        i += 1
    return rows


COMPANII = [
    # Nume, cod, tip, țara, alianța, an înființare, prefix înmatriculare
    ("AeroCarpati", "RC", "Traditional", "Romania", "SkyLink", 1954, "YR"),
    ("Danubia Air", "DN", "Low-cost", "Romania", "Fara alianta", 2009, "YR"),
    ("BlueWing", "BW", "Low-cost", "Ungaria", "Fara alianta", 2004, "HA"),
    ("Euronord Airways", "EN", "Traditional", "Germania", "StarBridge", 1955, "D"),
    ("Atlantis Airlines", "AT", "Traditional", "Franta", "SkyLink", 1948, "F"),
    ("Iberica Sol", "IS", "Low-cost", "Spania", "Fara alianta", 2001, "EC"),
    ("Balkan Express", "BX", "Low-cost", "Bulgaria", "Fara alianta", 2012, "LZ"),
    ("Levant Air", "LV", "Traditional", "Turcia", "StarBridge", 1960, "TC"),
    ("Adria Charter", "AC", "Charter", "Croatia", "Fara alianta", 2015, "9A"),
    ("Polaris Jet", "PJ", "Charter", "Polonia", "Fara alianta", 2010, "SP"),
]


def gen_companii() -> list[dict]:
    return [{"ID": i + 1, "Companie": c[0], "Cod_IATA": c[1], "Tip_Companie": c[2], "Tara": c[3], "Alianta": c[4],
             "An_Infiintare": c[5]} for i, c in enumerate(COMPANII)]


AEROPORTURI = {
    # cod: (oraș, țară, regiune, lat, lon)
    "OTP": ("Bucuresti", "Romania", "Romania", 44.5711, 26.0850),
    "CLJ": ("Cluj-Napoca", "Romania", "Romania", 46.7852, 23.6862),
    "TSR": ("Timisoara", "Romania", "Romania", 45.8099, 21.3379),
    "IAS": ("Iasi", "Romania", "Romania", 47.1785, 27.6206),
    "SBZ": ("Sibiu", "Romania", "Romania", 45.7856, 24.0913),
    "CND": ("Constanta", "Romania", "Romania", 44.3622, 28.4883),
    "LHR": ("Londra", "Marea Britanie", "Europa de Vest", 51.4700, -0.4543),
    "DUB": ("Dublin", "Irlanda", "Europa de Vest", 53.4264, -6.2499),
    "CDG": ("Paris", "Franta", "Europa de Vest", 49.0097, 2.5479),
    "AMS": ("Amsterdam", "Olanda", "Europa de Vest", 52.3105, 4.7683),
    "BRU": ("Bruxelles", "Belgia", "Europa de Vest", 50.9014, 4.4844),
    "FRA": ("Frankfurt", "Germania", "Europa Centrala", 50.0379, 8.5622),
    "MUC": ("Munchen", "Germania", "Europa Centrala", 48.3538, 11.7861),
    "VIE": ("Viena", "Austria", "Europa Centrala", 48.1103, 16.5697),
    "BUD": ("Budapesta", "Ungaria", "Europa Centrala", 47.4369, 19.2556),
    "WAW": ("Varsovia", "Polonia", "Europa Centrala", 52.1657, 20.9671),
    "FCO": ("Roma", "Italia", "Europa de Sud", 41.8003, 12.2389),
    "BGY": ("Milano", "Italia", "Europa de Sud", 45.6739, 9.7042),
    "BCN": ("Barcelona", "Spania", "Europa de Sud", 41.2974, 2.0833),
    "MAD": ("Madrid", "Spania", "Europa de Sud", 40.4983, -3.5676),
    "ATH": ("Atena", "Grecia", "Europa de Sud", 37.9364, 23.9445),
    "IST": ("Istanbul", "Turcia", "Orientul Mijlociu", 41.2753, 28.7519),
    "AYT": ("Antalya", "Turcia", "Orientul Mijlociu", 36.8987, 30.8005),
    "LCA": ("Larnaca", "Cipru", "Europa de Sud", 34.8751, 33.6249),
    "TLV": ("Tel Aviv", "Israel", "Orientul Mijlociu", 32.0055, 34.8854),
    "HRG": ("Hurghada", "Egipt", "Africa", 27.1783, 33.7994),
    "DXB": ("Dubai", "Emiratele Arabe Unite", "Orientul Mijlociu", 25.2532, 55.3657),
    "JFK": ("New York", "SUA", "America de Nord", 40.6413, -73.7781),
}

RUTE = [
    # plecare, sosire, cerere relativă, companii (coduri)
    ("OTP", "CLJ", 1.6, "RC DN"), ("OTP", "TSR", 1.2, "RC DN"), ("OTP", "IAS", 1.3, "RC DN"), ("OTP", "SBZ", 0.6, "RC"),
    ("OTP", "CND", 0.4, "RC"), ("CLJ", "IAS", 0.5, "DN"), ("TSR", "IAS", 0.4, "DN"),
    ("OTP", "LHR", 1.8, "RC DN BW"), ("OTP", "DUB", 0.7, "DN BW"), ("OTP", "CDG", 1.5, "RC AT DN"),
    ("OTP", "AMS", 0.9, "RC DN"), ("OTP", "BRU", 1.0, "RC DN BW"), ("OTP", "FRA", 1.3, "EN RC"),
    ("OTP", "MUC", 1.2, "EN RC"), ("OTP", "VIE", 1.1, "RC EN"), ("OTP", "BUD", 0.7, "BW"),
    ("OTP", "WAW", 0.6, "PJ RC"), ("OTP", "FCO", 1.5, "RC DN IS"), ("OTP", "BGY", 1.4, "DN BW IS"),
    ("OTP", "BCN", 1.1, "IS DN"), ("OTP", "MAD", 1.2, "IS RC"), ("OTP", "ATH", 0.9, "RC BX AC"),
    ("OTP", "IST", 1.4, "LV RC"), ("OTP", "AYT", 0.9, "LV AC PJ"), ("OTP", "LCA", 0.5, "BX AC"),
    ("OTP", "TLV", 0.7, "RC LV"), ("OTP", "HRG", 0.8, "AC PJ"), ("OTP", "DXB", 0.8, "LV RC"),
    ("OTP", "JFK", 0.5, "RC AT"),
    ("CLJ", "LHR", 1.1, "DN BW"), ("CLJ", "CDG", 0.6, "AT DN"), ("CLJ", "MUC", 0.8, "EN"),
    ("CLJ", "BGY", 0.9, "DN BW"), ("CLJ", "BCN", 0.6, "IS"), ("CLJ", "IST", 0.5, "LV"),
    ("CLJ", "AYT", 0.5, "AC PJ"),
    ("TSR", "MUC", 0.6, "EN"), ("TSR", "BGY", 0.6, "BW IS"), ("TSR", "BUD", 0.3, "BW"),
    ("IAS", "LHR", 0.7, "BW DN"), ("IAS", "FCO", 0.5, "DN IS"), ("IAS", "IST", 0.3, "LV"),
    ("SBZ", "MUC", 0.5, "EN"), ("SBZ", "VIE", 0.4, "EN"), ("CND", "AYT", 0.3, "AC"),
]


def haversine(a: str, b: str) -> int:
    la1, lo1 = map(math.radians, AEROPORTURI[a][3:5])
    la2, lo2 = map(math.radians, AEROPORTURI[b][3:5])
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return round(2 * 6371 * math.asin(math.sqrt(h)))


def tip_ruta(a: str, b: str, km: int) -> str:
    if AEROPORTURI[a][1] == AEROPORTURI[b][1] == "Romania":
        return "Intern"
    return "Intercontinental" if AEROPORTURI[b][2] in ("Africa", "America de Nord") or b in ("DXB", "TLV") else "European"


def gen_rute() -> list[dict]:
    rows = []
    for i, (a, b, _, _) in enumerate(RUTE):
        km = haversine(a, b)
        pa, pb = AEROPORTURI[a], AEROPORTURI[b]
        rows.append({
            "ID": i + 1, "Cod_Ruta": f"{a}-{b}", "Ruta": f"{pa[0]} - {pb[0]}",
            "Aeroport_Plecare": a, "Oras_Plecare": pa[0], "Tara_Plecare": pa[1],
            "Aeroport_Sosire": b, "Oras_Sosire": pb[0], "Tara_Sosire": pb[1], "Regiune_Sosire": pb[2],
            "Distanta_km": km, "Durata_Min": round(35 + km / 780 * 60 / 5) * 5, "Tip_Ruta": tip_ruta(a, b, km),
            "Latitudine_Sosire": pb[3], "Longitudine_Sosire": pb[4],
        })
    return rows


MODELE = {
    # model: (producător, locuri, fuzelaj, autonomie km)
    "ATR 72-600": ("ATR", 70, "Turbopropulsor", 1500),
    "Airbus A220-300": ("Airbus", 140, "Narrow-body", 6300),
    "Airbus A319": ("Airbus", 144, "Narrow-body", 6900),
    "Airbus A320neo": ("Airbus", 180, "Narrow-body", 6300),
    "Airbus A321neo": ("Airbus", 220, "Narrow-body", 7400),
    "Boeing 737-800": ("Boeing", 189, "Narrow-body", 5400),
    "Boeing 737 MAX 8": ("Boeing", 189, "Narrow-body", 6500),
    "Embraer E195-E2": ("Embraer", 132, "Narrow-body", 4800),
    "Airbus A330-900": ("Airbus", 290, "Wide-body", 13300),
    "Boeing 787-9": ("Boeing", 290, "Wide-body", 14000),
}
FLOTA = {
    "RC": ["ATR 72-600", "Airbus A220-300", "Airbus A320neo", "Boeing 787-9"],
    "DN": ["Airbus A320neo", "Airbus A321neo", "Airbus A319"],
    "BW": ["Airbus A320neo", "Airbus A321neo", "Airbus A321neo"],
    "EN": ["Airbus A319", "Embraer E195-E2", "Airbus A320neo"],
    "AT": ["Airbus A220-300", "Airbus A320neo", "Airbus A330-900"],
    "IS": ["Boeing 737-800", "Boeing 737 MAX 8", "Boeing 737 MAX 8"],
    "BX": ["Airbus A320neo", "Boeing 737-800"],
    "LV": ["Airbus A321neo", "Boeing 737 MAX 8", "Airbus A330-900"],
    "AC": ["Boeing 737-800", "Airbus A321neo", "Airbus A320neo"],
    "PJ": ["Boeing 737-800", "Boeing 737 MAX 8", "Boeing 737-800"],
}


def gen_aeronave() -> tuple[list[dict], dict[str, list[int]]]:
    rng = random.Random(31)
    rows, fleet, used = [], defaultdict(list), set()
    pref = {c[1]: c[6] for c in COMPANII}
    for cod, modele in FLOTA.items():
        for m in modele:
            while True:
                suf = "".join(rng.choice("ABCDEFGHIJKLMNOPRSTUVWXZ") for _ in range(3 if pref[cod] != "D" else 4))
                reg = f"{pref[cod]}-{suf}"
                if reg not in used:
                    used.add(reg)
                    break
            prod, loc, fuz, aut = MODELE[m]
            an = rng.randint(2016, 2023) if "neo" in m or "MAX" in m or "E2" in m or "787" in m or "A220" in m else rng.randint(2008, 2016)
            rows.append({"ID": len(rows) + 1, "Inmatriculare": reg, "Model": m, "Producator": prod, "Locuri": loc,
                         "Tip_Aeronava": fuz, "Autonomie_km": aut, "An_Fabricatie": an})
            fleet[cod].append(len(rows))
    return rows, fleet


CLASE = [
    # clasă, cod, multiplicator preț, bagaj inclus kg, ordine
    ("Economy", "Y", 1.0, 0, 1), ("Premium Economy", "W", 1.7, 23, 2), ("Business", "J", 3.4, 32, 3), ("First", "F", 6.0, 46, 4),
]


def gen_clase() -> list[dict]:
    return [{"ID": i + 1, "Clasa": c[0], "Cod_Clasa": c[1], "Bagaj_Inclus_kg": c[3], "Ordine": c[4]} for i, c in enumerate(CLASE)]


CANALE = [("Website", "Online", 0.0), ("Aplicatie", "Online", 0.0), ("Agentie de turism", "Offline", 8.0),
          ("Call center", "Offline", 3.0), ("Aeroport", "Offline", 0.0)]


def gen_canale() -> list[dict]:
    return [{"ID": i + 1, "Canal": c[0], "Tip_Canal": c[1], "Comision_Pct": c[2]} for i, c in enumerate(CANALE)]


TARI_PAS = [("Romania", 70), ("Italia", 6), ("Spania", 5), ("Germania", 4), ("Marea Britanie", 4), ("Franta", 3),
            ("Republica Moldova", 3), ("Ungaria", 2), ("Turcia", 2), ("Bulgaria", 1)]
ORASE_RO = [("Bucuresti", 30), ("Cluj-Napoca", 12), ("Timisoara", 8), ("Iasi", 9), ("Brasov", 6), ("Constanta", 5),
            ("Sibiu", 4), ("Craiova", 4), ("Oradea", 3), ("Suceava", 3), ("Bacau", 3), ("Arad", 2)]
CAPITALE = {"Italia": "Roma", "Spania": "Madrid", "Germania": "Berlin", "Marea Britanie": "Londra", "Franta": "Paris",
            "Republica Moldova": "Chisinau", "Ungaria": "Budapesta", "Turcia": "Istanbul", "Bulgaria": "Sofia"}
GRUPE = [("18-24", 12), ("25-34", 27), ("35-44", 25), ("45-54", 18), ("55-64", 11), ("65+", 7)]
NIVELE = [("Fara statut", 55), ("Silver", 28), ("Gold", 13), ("Platinum", 4)]


def gen_pasageri() -> list[dict]:
    rng = random.Random(41)
    rows = []
    for i in range(N_PASAGERI):
        tara = rng.choices([t[0] for t in TARI_PAS], weights=[t[1] for t in TARI_PAS])[0]
        oras = rng.choices([o[0] for o in ORASE_RO], weights=[o[1] for o in ORASE_RO])[0] if tara == "Romania" else CAPITALE[tara]
        rows.append({
            "ID": i + 1, "Cod_Pasager": f"P{i + 1:05d}", "Gen": rng.choice(["F", "M"]),
            "Grupa_Varsta": rng.choices([g[0] for g in GRUPE], weights=[g[1] for g in GRUPE])[0],
            "Tara": tara, "Oras": oras,
            "Nivel_Loialitate": rng.choices([n[0] for n in NIVELE], weights=[n[1] for n in NIVELE])[0],
            "An_Inscriere": rng.randint(2012, 2021),
        })
    return rows


# ---------------------------------------------------------------------------
# Facturi
# ---------------------------------------------------------------------------
TIP_CO = {c[1]: c[2] for c in COMPANII}
FACTOR_PRET = {"Low-cost": 0.62, "Traditional": 1.15, "Charter": 0.85}
LOAD = {"Low-cost": 0.88, "Traditional": 0.77, "Charter": 0.91}
INTARZIERE = {"Low-cost": 0.23, "Traditional": 0.13, "Charter": 0.19}
LUNA_INTARZ = (1.2, 1.15, 0.9, 0.85, 0.95, 1.2, 1.45, 1.5, 1.0, 0.85, 0.9, 1.3)
COMBUSTIBIL = {2021: (0.62, 0.65, 0.68, 0.70, 0.73, 0.78, 0.80, 0.82, 0.85, 0.92, 0.96, 0.94),
               2022: (1.00, 1.08, 1.30, 1.28, 1.35, 1.45, 1.38, 1.30, 1.28, 1.25, 1.15, 1.08),
               2023: (1.05, 1.02, 0.98, 0.99, 0.95, 0.92, 0.95, 0.98, 1.03, 1.05, 1.00, 0.97),
               2024: (1.00, 1.02, 1.06, 1.08, 1.04, 1.00, 0.98, 0.97, 0.95, 0.96, 0.94, 0.95),
               2025: (0.93, 0.92, 0.90, 0.88, 0.89, 0.91, 0.94, 0.96, 0.93, 0.92, 0.90, 0.91)}


def tarif_mediu(km: int, tip_co: str, d: dict) -> float:
    """Prețul mediu Economy pe un bilet (EUR), înainte de clasă și de zilele de avans."""
    return (28 + km * 0.085) * FACTOR_PRET[tip_co] * (0.85 + 0.25 * SEZON_ZBOR[d["Luna"] - 1]) * {2021: 0.92, 2022: 1.0, 2023: 1.07, 2024: 1.0, 2025: 1.06}[d["An"]]


def gen_zboruri(dates, rute, companii, aeronave, fleet) -> list[dict]:
    rng = random.Random(20261019)
    co_by_cod = {c["Cod_IATA"]: c for c in companii}
    wd = [SEZON_ZBOR[r["Luna"] - 1] * CRESTERE[r["An"]] * (1.06 if r["Nr_Zi_Saptamana"] in (1, 5, 7) else 0.97) for r in dates]
    pick_d = sorted(rng.choices(range(len(dates)), weights=wd, k=N_ZBORURI))
    rw = [r[2] for r in RUTE]
    nr_zbor = {}
    rows = []
    for n, di in enumerate(pick_d, start=1):
        d = dates[di]
        ri = rng.choices(range(len(rute)), weights=rw)[0]
        ruta, coduri = rute[ri], RUTE[ri][3].split()
        if ruta["Tip_Ruta"] != "Intern" and d["Luna"] in (6, 7, 8) and any(TIP_CO[c] == "Charter" for c in coduri):
            cod = rng.choices(coduri, weights=[2.2 if TIP_CO[c] == "Charter" else 1 for c in coduri])[0]
        else:
            cod = rng.choices(coduri, weights=[1.5 - 0.3 * k for k in range(len(coduri))])[0]
        co = co_by_cod[cod]
        tip = co["Tip_Companie"]
        km = ruta["Distanta_km"]
        flota = [aeronave[i - 1] for i in fleet[cod] if aeronave[i - 1]["Autonomie_km"] >= km * 1.15]
        if km > 3500:
            flota = [a for a in flota if a["Tip_Aeronava"] == "Wide-body"] or flota
        elif km > 800:
            flota = [a for a in flota if a["Tip_Aeronava"] != "Turbopropulsor" and a["Tip_Aeronava"] != "Wide-body"] or flota
        else:
            flota = [a for a in flota if a["Tip_Aeronava"] != "Wide-body"] or flota
        av = rng.choice(flota)
        locuri = av["Locuri"]
        ora = rng.choices(range(5, 24), weights=[3, 8, 9, 7, 6, 5, 5, 6, 5, 5, 5, 6, 7, 7, 6, 5, 4, 3, 2])[0]
        minut = rng.choice([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
        # status
        p_anul = 0.024 if d["Sezon"] == "Iarna" else 0.011
        p_int = INTARZIERE[tip] * LUNA_INTARZ[d["Luna"] - 1] * (1.15 if ora >= 17 else 0.9)
        x = rng.random()
        if x < p_anul:
            status, intarz = "Anulat", 0
        elif x < p_anul + p_int:
            status, intarz = "Intarziat", min(360, 15 + int(rng.expovariate(1 / 38)))
        else:
            status, intarz = "La timp", rng.choice([0, 0, 0, 2, 4, 5, 7, 9, 11, 14])
        if status == "Anulat":
            pas = 0
        else:
            lf = LOAD[tip] * (0.82 + 0.16 * SEZON_ZBOR[d["Luna"] - 1]) * (1.02 if d["An"] == 2025 else 1.0) + rng.uniform(-0.09, 0.07)
            pas = int(locuri * max(0.32, min(1.0, lf)))
        fare = tarif_mediu(km, tip, d)
        mix = {"Low-cost": 1.04, "Traditional": 1.38, "Charter": 1.08}[tip] * (1.25 if ruta["Tip_Ruta"] == "Intercontinental" and tip == "Traditional" else 1.0)
        venit = round(pas * fare * mix * rng.uniform(0.92, 1.08), 2)
        aux = round(pas * {"Low-cost": 17.5, "Traditional": 6.5, "Charter": 9.0}[tip] * rng.uniform(0.8, 1.2), 2)
        fuel = 0.0 if status == "Anulat" else round(km * locuri * 0.0145 * COMBUSTIBIL[d["An"]][d["Luna"] - 1] * rng.uniform(0.94, 1.06), 2)
        oper = round((1400 + km * locuri * 0.0105) * (0.45 if status == "Anulat" else 1.0) * rng.uniform(0.95, 1.05), 2)
        key = (cod, ri)
        if key not in nr_zbor:
            nr_zbor[key] = rng.randint(100, 989)
        rows.append({
            "ID_Zbor": n, "Cod_Zbor": f"{cod}{nr_zbor[key]}", "ID_Date": d["ID"], "ID_Companie": co["ID"], "ID_Ruta": ruta["ID"],
            "ID_Aeronava": av["ID"], "Ora_Plecare": time(ora, minut), "Status_Zbor": status, "Intarziere_Min": intarz,
            "Locuri_Disponibile": locuri, "Pasageri_Imbarcati": pas, "Venit_Bilete": venit, "Venit_Auxiliar": aux,
            "Cost_Combustibil": fuel, "Cost_Operare": oper,
        })
    return rows


def gen_rezervari(dates, rute, companii, clase, canale, pasageri, zboruri) -> list[dict]:
    rng = random.Random(20261020)
    zb = [z for z in zboruri if z["Status_Zbor"] != "Anulat"]
    pick = rng.choices(zb, weights=[z["Pasageri_Imbarcati"] for z in zb], k=N_REZERVARI)
    pick.sort(key=lambda z: (z["ID_Date"], z["Ora_Plecare"], z["ID_Zbor"]))
    pw = [{"Fara statut": 1.0, "Silver": 2.2, "Gold": 4.0, "Platinum": 7.0}[p["Nivel_Loialitate"]] for p in pasageri]
    rows = []
    for n, z in enumerate(pick, start=1):
        d, ruta, co = dates[z["ID_Date"] - 1], rute[z["ID_Ruta"] - 1], companii[z["ID_Companie"] - 1]
        tip = co["Tip_Companie"]
        if tip == "Low-cost":
            cw = [94, 6, 0, 0]
        elif tip == "Charter":
            cw = [88, 12, 0, 0]
        elif ruta["Tip_Ruta"] == "Intercontinental":
            cw = [64, 17, 15, 4]
        else:
            cw = [76, 12, 12, 0]
        ci = rng.choices(range(4), weights=cw)[0]
        app = {2021: 8, 2022: 13, 2023: 19, 2024: 25, 2025: 31}[d["An"]]  # aplicația crește an de an
        chw = [44 - app * 0.2, app, 24 - app * 0.2, 10 - app * 0.12, 5]
        if tip == "Low-cost":
            chw = [chw[0] * 1.3, chw[1] * 1.4, chw[2] * 0.3, chw[3] * 0.6, chw[4]]
        if tip == "Charter":
            chw = [chw[0] * 0.6, chw[1] * 0.5, chw[2] * 3.5, chw[3], chw[4] * 0.5]
        chi = rng.choices(range(5), weights=chw)[0]
        pas = rng.choices(pasageri, weights=pw)[0]
        nb = rng.choices([1, 2, 3, 4], weights=[52, 31, 9, 8])[0]
        avans = min(330, 1 + int(rng.expovariate(1 / (55 if tip != "Charter" else 80))))
        f_avans = 1.45 if avans <= 7 else 1.22 if avans <= 21 else 1.0 if avans <= 60 else 0.88
        pret = round(tarif_mediu(ruta["Distanta_km"], tip, d) * CLASE[ci][2] * f_avans * rng.uniform(0.85, 1.15), 2)
        taxe = round(14 + ruta["Distanta_km"] * 0.011, 2)
        p_bag = {"Low-cost": 0.45, "Charter": 0.25, "Traditional": 0.08}[tip] if ci == 0 else 0.0
        bagaj = float(nb * rng.choice([25, 32, 40])) if rng.random() < p_bag else 0.0
        status = rng.choices(["Confirmata", "Anulata"], weights=[94, 6])[0]
        rows.append({
            "ID_Rezervare": n, "Cod_Rezervare": f"R{d['An'] % 100}{n:06d}", "ID_Date": d["ID"], "ID_Companie": co["ID"],
            "ID_Ruta": ruta["ID"], "ID_Clasa": clase[ci]["ID"], "ID_Canal": canale[chi]["ID"], "ID_Pasager": pas["ID"],
            "Zile_Avans": avans, "Nr_Bilete": nb, "Pret_Bilet": pret, "Taxe_Bilet": taxe, "Bagaj_Extra": bagaj,
            "Valoare_Totala": round(nb * (pret + taxe) + bagaj, 2), "Status_Rezervare": status,
        })
    return rows


# ---------------------------------------------------------------------------
# Scriere: Excel, CSV, SQL, JS
# ---------------------------------------------------------------------------
HEADER_FILL = PatternFill("solid", fgColor="0E7490")


def style_sheet(ws, rows: list[dict]) -> None:
    cols = list(rows[0])
    for i, c in enumerate(cols, start=1):
        cell = ws.cell(row=1, column=i)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = HEADER_FILL
        ws.column_dimensions[get_column_letter(i)].width = max(12, len(c) + 4)
        v = rows[0][c]
        fmt = "DD.MM.YYYY" if isinstance(v, date) else "HH:MM" if isinstance(v, time) else None
        if fmt:
            for rr in range(2, len(rows) + 2):
                ws.cell(row=rr, column=i).number_format = fmt
    ws.freeze_panes = "A2"


def write_csv_tables(folder: Path, tables: dict[str, list[dict]]) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    for name, rows in tables.items():
        cols = list(rows[0])
        with (folder / f"{name}.csv").open("w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(cols)
            for r in rows:
                w.writerow([csv_value(r[c]) for c in cols])


def write_workbook(path: Path, tables: dict[str, list[dict]]) -> None:
    wb = Workbook()
    wb.remove(wb.active)
    for name, rows in tables.items():
        ws = wb.create_sheet(name)
        cols = list(rows[0])
        ws.append(cols)
        for r in rows:
            ws.append([r[c] for c in cols])
        style_sheet(ws, rows)
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)


def csv_value(v):
    if isinstance(v, date):
        return v.isoformat()
    if isinstance(v, time):
        return v.strftime("%H:%M")
    return v


def write_one_xlsx(path: Path, sheet: str, rows: list[dict]) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = sheet
    cols = list(rows[0])
    ws.append(cols)
    for r in rows:
        ws.append([r[c] for c in cols])
    style_sheet(ws, rows)
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)


def write_fisier_js(flat: list[dict]) -> None:
    """Rândurile din fișierul combinat, pentru simulatorul de matrix din deck (toate rezervările)."""
    order = {
        "companie": sorted({x["Companie"] for x in flat}),
        "tipCompanie": ["Traditional", "Low-cost", "Charter"],
        "ruta": sorted({x["Cod_Ruta"] for x in flat}),
        "taraSosire": sorted({x["Tara_Sosire"] for x in flat}),
        "clasa": ["Economy", "Premium Economy", "Business", "First"],
        "canal": sorted({x["Canal"] for x in flat}),
        "tipCanal": ["Online", "Offline"],
        "grupaVarsta": sorted({x["Grupa_Varsta"] for x in flat}),
        "nivelLoialitate": ["Fara statut", "Silver", "Gold", "Platinum"],
        "trimestru": ["T1", "T2", "T3", "T4"],
        "luna": LUNI[1:],
        "tipRuta": ["Intern", "European", "Intercontinental"],
    }
    key = {"companie": "Companie", "tipCompanie": "Tip_Companie", "ruta": "Cod_Ruta", "taraSosire": "Tara_Sosire", "clasa": "Clasa",
           "canal": "Canal", "tipCanal": "Tip_Canal", "grupaVarsta": "Grupa_Varsta", "nivelLoialitate": "Nivel_Loialitate", "tipRuta": "Tip_Ruta"}
    pos = {d: {v: i for i, v in enumerate(vals)} for d, vals in order.items()}
    rows = []
    for x in flat:
        m = x["Data"].month
        r = []
        for d in order:
            if d == "trimestru":
                r.append((m - 1) // 3)
            elif d == "luna":
                r.append(m - 1)
            else:
                r.append(pos[d][x[key[d]]])
        r += [1 if x["Status_Rezervare"] == "Confirmata" else 0, x["Nr_Bilete"], round(x["Valoare_Totala"], 2), x["Zile_Avans"], round(x["Bagaj_Extra"], 2)]
        rows.append(r)
    # coloanele de la final: confirmata (1/0), bilete, valoare, zile_avans, bagaj
    JS_FISIER = COURSE / "js" / "s10-fisier.js"
    JS_FISIER.write_text("/* Generat de assets/s10/generate_s10.py — nu editați de mână. */\nwindow.S10_FISIER = "
                         + json.dumps({"dims": order, "rows": rows}, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")


def write_combine_example(rez, dates, companii, rute, clase, canale, pasageri) -> None:
    """Un singur exemplu pentru „combinarea fișierelor”: rezervările din 2025, pe trimestre, într-un tabel „plat”
    cu multe câmpuri (din ele se fac apoi dimensiunile). T1–T3 sunt în folder; T4 e fișierul „nou” (Refresh)."""
    base = OUT / "combinare"
    if base.exists():
        shutil.rmtree(base)
    flat = []
    for r in rez:
        d = dates[r["ID_Date"] - 1]
        if d["An"] != 2025:
            continue
        ruta, co = rute[r["ID_Ruta"] - 1], companii[r["ID_Companie"] - 1]
        can, pas = canale[r["ID_Canal"] - 1], pasageri[r["ID_Pasager"] - 1]
        flat.append({
            "Data": d["Data"], "Companie": co["Companie"], "Tip_Companie": co["Tip_Companie"],
            "Cod_Ruta": ruta["Cod_Ruta"], "Oras_Sosire": ruta["Oras_Sosire"], "Tara_Sosire": ruta["Tara_Sosire"], "Tip_Ruta": ruta["Tip_Ruta"],
            "Clasa": clase[r["ID_Clasa"] - 1]["Clasa"], "Canal": can["Canal"], "Tip_Canal": can["Tip_Canal"],
            "Grupa_Varsta": pas["Grupa_Varsta"], "Nivel_Loialitate": pas["Nivel_Loialitate"], "Zile_Avans": r["Zile_Avans"],
            "Nr_Bilete": r["Nr_Bilete"], "Pret_Bilet": r["Pret_Bilet"], "Taxe_Bilet": r["Taxe_Bilet"],
            "Bagaj_Extra": r["Bagaj_Extra"], "Valoare_Totala": r["Valoare_Totala"], "Status_Rezervare": r["Status_Rezervare"],
        })
    quarter = lambda x: (x["Data"].month - 1) // 3 + 1
    folder = base / "exemplu_rezervari_2025"
    for q in (1, 2, 3):
        write_one_xlsx(folder / f"Rezervari_2025_T{q}.xlsx", "Rezervari", [x for x in flat if quarter(x) == q])
    write_one_xlsx(base / "fisier_nou" / "Rezervari_2025_T4.xlsx", "Rezervari", [x for x in flat if quarter(x) == 4])
    with zipfile.ZipFile(base / "exemplu_rezervari_2025.zip", "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(folder.iterdir()):
            zf.write(f, f"exemplu_rezervari_2025/{f.name}")
    write_fisier_js(flat)
    counts = {f"T{q}": sum(1 for x in flat if quarter(x) == q) for q in (1, 2, 3, 4)}
    print("combinare pe trimestre:", counts, "| T1–T3:", sum(counts[f"T{q}"] for q in (1, 2, 3)), "| total:", len(flat))
    print("distincte: Companie", len({(x["Companie"], x["Tip_Companie"]) for x in flat}),
          "| Ruta", len({(x["Cod_Ruta"], x["Oras_Sosire"], x["Tara_Sosire"], x["Tip_Ruta"]) for x in flat}),
          "| Clasa", len({x["Clasa"] for x in flat}), "| Canal", len({(x["Canal"], x["Tip_Canal"]) for x in flat}),
          "| Pasager", len({(x["Grupa_Varsta"], x["Nivel_Loialitate"]) for x in flat}),
          "| zile", len({x["Data"] for x in flat}))


SQL_TYPES = {
    "Dim_Date": {"ID": "INT NOT NULL PRIMARY KEY", "Data": "DATE NOT NULL", "An": "SMALLINT", "Trimestru": "CHAR(2)", "Luna": "TINYINT",
                 "Luna_Nume": "NVARCHAR(20)", "An_Luna": "CHAR(7)", "Zi_Saptamana": "NVARCHAR(10)", "Nr_Zi_Saptamana": "TINYINT",
                 "Weekend": "NVARCHAR(2)", "Sezon": "NVARCHAR(10)"},
    "Dim_Companii": {"ID": "INT NOT NULL PRIMARY KEY", "Companie": "NVARCHAR(40)", "Cod_IATA": "CHAR(2)", "Tip_Companie": "NVARCHAR(20)",
                     "Tara": "NVARCHAR(30)", "Alianta": "NVARCHAR(20)", "An_Infiintare": "SMALLINT"},
    "Dim_Rute": {"ID": "INT NOT NULL PRIMARY KEY", "Cod_Ruta": "CHAR(7)", "Ruta": "NVARCHAR(60)", "Aeroport_Plecare": "CHAR(3)",
                 "Oras_Plecare": "NVARCHAR(30)", "Tara_Plecare": "NVARCHAR(30)", "Aeroport_Sosire": "CHAR(3)", "Oras_Sosire": "NVARCHAR(30)",
                 "Tara_Sosire": "NVARCHAR(40)", "Regiune_Sosire": "NVARCHAR(30)", "Distanta_km": "INT", "Durata_Min": "INT",
                 "Tip_Ruta": "NVARCHAR(20)", "Latitudine_Sosire": "DECIMAL(9,4)", "Longitudine_Sosire": "DECIMAL(9,4)"},
    "Dim_Aeronave": {"ID": "INT NOT NULL PRIMARY KEY", "Inmatriculare": "NVARCHAR(10)", "Model": "NVARCHAR(30)", "Producator": "NVARCHAR(20)",
                     "Locuri": "INT", "Tip_Aeronava": "NVARCHAR(20)", "Autonomie_km": "INT", "An_Fabricatie": "SMALLINT"},
    "Dim_Clase": {"ID": "INT NOT NULL PRIMARY KEY", "Clasa": "NVARCHAR(20)", "Cod_Clasa": "CHAR(1)", "Bagaj_Inclus_kg": "INT", "Ordine": "TINYINT"},
    "Dim_Canale": {"ID": "INT NOT NULL PRIMARY KEY", "Canal": "NVARCHAR(30)", "Tip_Canal": "NVARCHAR(10)", "Comision_Pct": "DECIMAL(5,2)"},
    "Dim_Pasageri": {"ID": "INT NOT NULL PRIMARY KEY", "Cod_Pasager": "CHAR(6)", "Gen": "CHAR(1)", "Grupa_Varsta": "NVARCHAR(10)",
                     "Tara": "NVARCHAR(30)", "Oras": "NVARCHAR(30)", "Nivel_Loialitate": "NVARCHAR(20)", "An_Inscriere": "SMALLINT"},
    "Fact_Zboruri": {"ID_Zbor": "INT NOT NULL PRIMARY KEY", "Cod_Zbor": "NVARCHAR(8)", "ID_Date": "INT NOT NULL REFERENCES dbo.Dim_Date(ID)",
                     "ID_Companie": "INT NOT NULL REFERENCES dbo.Dim_Companii(ID)", "ID_Ruta": "INT NOT NULL REFERENCES dbo.Dim_Rute(ID)",
                     "ID_Aeronava": "INT NOT NULL REFERENCES dbo.Dim_Aeronave(ID)", "Ora_Plecare": "TIME(0)", "Status_Zbor": "NVARCHAR(12)",
                     "Intarziere_Min": "INT", "Locuri_Disponibile": "INT", "Pasageri_Imbarcati": "INT", "Venit_Bilete": "DECIMAL(12,2)",
                     "Venit_Auxiliar": "DECIMAL(12,2)", "Cost_Combustibil": "DECIMAL(12,2)", "Cost_Operare": "DECIMAL(12,2)"},
    "Fact_Rezervari": {"ID_Rezervare": "INT NOT NULL PRIMARY KEY", "Cod_Rezervare": "CHAR(9)", "ID_Date": "INT NOT NULL REFERENCES dbo.Dim_Date(ID)",
                       "ID_Companie": "INT NOT NULL REFERENCES dbo.Dim_Companii(ID)", "ID_Ruta": "INT NOT NULL REFERENCES dbo.Dim_Rute(ID)",
                       "ID_Clasa": "INT NOT NULL REFERENCES dbo.Dim_Clase(ID)", "ID_Canal": "INT NOT NULL REFERENCES dbo.Dim_Canale(ID)",
                       "ID_Pasager": "INT NOT NULL REFERENCES dbo.Dim_Pasageri(ID)", "Zile_Avans": "INT", "Nr_Bilete": "INT",
                       "Pret_Bilet": "DECIMAL(10,2)", "Taxe_Bilet": "DECIMAL(10,2)", "Bagaj_Extra": "DECIMAL(10,2)",
                       "Valoare_Totala": "DECIMAL(12,2)", "Status_Rezervare": "NVARCHAR(12)"},
}


def sql_value(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, date):
        return f"'{v.isoformat()}'"
    if isinstance(v, time):
        return f"'{v.strftime('%H:%M:%S')}'"
    if isinstance(v, (int, float)):
        return repr(v)
    return "N'" + str(v).replace("'", "''") + "'"


def write_sql(tables: dict[str, list[dict]]) -> None:
    SQL_OUT.parent.mkdir(parents=True, exist_ok=True)
    order = list(tables)
    out = [
        "-- Sesiunea 10 · baza de date „Aviatie” pentru Azure SQL Database",
        "-- Generat de assets/s10/generate_s10.py. Rulați tot fișierul o singură dată, în baza goală",
        "-- (SSMS sau Azure Data Studio; Query Editor din portal poate fi lent pe un fișier de aceste dimensiuni).",
        "-- Scriptul se poate rula din nou: șterge întâi tabelele existente.",
        "SET NOCOUNT ON;",
        "",
    ]
    for name in reversed(order):
        out.append(f"DROP TABLE IF EXISTS dbo.{name};")
    out.append("")
    for name in order:
        cols = ",\n    ".join(f"{c} {t}" for c, t in SQL_TYPES[name].items())
        out.append(f"CREATE TABLE dbo.{name} (\n    {cols}\n);")
    out.append("")
    for name in order:
        rows = tables[name]
        cols = list(rows[0])
        assert cols == list(SQL_TYPES[name]), name
        for i in range(0, len(rows), 1000):
            chunk = rows[i:i + 1000]
            vals = ",\n".join("(" + ", ".join(sql_value(r[c]) for c in cols) + ")" for r in chunk)
            out.append(f"INSERT INTO dbo.{name} ({', '.join(cols)}) VALUES\n{vals};")
        out.append("")
    out += [
        "-- Verificare: numărul de rânduri din fiecare tabel",
        " UNION ALL\n".join(f"SELECT '{n}' AS Tabel, COUNT(*) AS Randuri FROM dbo.{n}" for n in order) + ";",
        "",
        "-- Opțional: un utilizator doar-citire pentru cursanți. Puneți parola voastră, nu o salvați în fișier.",
        "-- CREATE USER curs_powerbi WITH PASSWORD = '<parola puternica>';",
        "-- ALTER ROLE db_datareader ADD MEMBER curs_powerbi;",
        "",
    ]
    SQL_OUT.write_text("\n".join(out), encoding="utf-8")


def main() -> None:
    cal = gen_date()
    co, rute, cl, ca, pas = gen_companii(), gen_rute(), gen_clase(), gen_canale(), gen_pasageri()
    av, fleet = gen_aeronave()
    zb = gen_zboruri(cal, rute, co, av, fleet)
    rez = gen_rezervari(cal, rute, co, cl, ca, pas, zb)
    tables = {"Dim_Date": cal, "Dim_Companii": co, "Dim_Rute": rute, "Dim_Aeronave": av, "Dim_Clase": cl, "Dim_Canale": ca,
              "Dim_Pasageri": pas, "Fact_Zboruri": zb, "Fact_Rezervari": rez}
    write_csv_tables(OUT / "csv", tables)
    for n, rows in tables.items():
        write_one_xlsx(OUT / f"{n}.xlsx", n, rows)
    write_combine_example(rez, cal, co, rute, cl, ca, pas)
    write_sql(tables)
    for n, r in tables.items():
        print(f"{n:16} {len(r):>6} rânduri  {len(r[0]):>2} coloane")


if __name__ == "__main__":
    main()
