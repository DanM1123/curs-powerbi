# -*- coding: utf-8 -*-
"""Proiect · Sesiunea 11: baza „Aviatie” din Azure, refăcută și murdărită (9 tabele) + pagina proiectului.

Generează:
  assets/s11/azure/aviatie_murdar_azure.sql   șterge tabelele din S10 și creează/umple cele 9 tabele murdare
  sesiuni/s11/proiect/index.html              pagina proiectului
  assets/s11/proiect_solutii.md               cheia facilitatorului (ce e murdar și cum se curăță)

Datele pornesc de la generatorul din S10, dar cu alte seed-uri și alte volume: cifrele nu sunt cele din lecții.
Murdăria e cea din proiectele S6–S9, adaptată la o bază SQL: coloane text acolo unde ar trebui numere sau date,
spații, litere mari/mici amestecate, duplicate, rânduri goale, rânduri de test și de total, coloane în plus.
Rulare: python generate_proiect_s11.py
"""
from __future__ import annotations

import random
import sys
from datetime import date, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COURSE = ROOT.parent.parent
OUT = COURSE / "sesiuni" / "s11" / "proiect"
SQL_OUT = ROOT / "azure" / "aviatie_murdar_azure.sql"
KEY_OUT = ROOT / "proiect_solutii.md"
sys.path.insert(0, str(ROOT.parent / "s10"))
sys.path.insert(0, str(ROOT.parent / "s09"))
sys.path.insert(0, str(ROOT.parent / "s06"))
import generate_s10 as g10  # noqa: E402
from generate_proiect_final import EXTRA_CSS, PAGE_JS, esc  # noqa: E402  (pagina proiectului din S9)
from proiect_html import CSS, THEME_JS  # noqa: E402

COLOR = "#0E7490"
SEED_SHIFT = 1111
TXT = "NVARCHAR(60)"


class _AltSeed:
    """Același generator ca în S10, dar cu alte seed-uri: alte zboruri, alte rezervări, alți pasageri."""

    @staticmethod
    def Random(seed):
        return random.Random(seed + SEED_SHIFT)


g10.random = _AltSeed
g10.N_ZBORURI, g10.N_REZERVARI, g10.N_PASAGERI = 9_600, 11_400, 2_200


def base_type(t: str) -> str:
    return t.split(" NOT NULL")[0].split(" REFERENCES")[0].strip()


def comma(x: float, dec: int = 2) -> str:
    return f"{x:.{dec}f}".replace(".", ",")


def case_variant(rng: random.Random, s: str, p: float) -> str:
    x = rng.random()
    if x < p * 0.4:
        return s.lower()
    if x < p * 0.7:
        return s.upper()
    if x < p:
        return s + "  " if rng.random() < 0.5 else " " + s
    return s


def with_dupes(rng: random.Random, rows: list[dict], n: int) -> list[dict]:
    out = list(rows)
    for i in sorted(rng.sample(range(5, len(rows) - 5), n), reverse=True):
        out.insert(i + 1, dict(out[i]))
    return out


def with_blanks(rng: random.Random, rows: list[dict], n: int) -> list[dict]:
    out = list(rows)
    for i in sorted(rng.sample(range(10, len(rows) - 10), n), reverse=True):
        out.insert(i, {c: None for c in rows[0]})
    return out


# ---------------------------------------------------------------------------
# Murdărire: fiecare funcție întoarce (rândurile murdare, tipurile SQL ale coloanelor schimbate sau noi)
# ---------------------------------------------------------------------------
def dirty_date(rows):
    rng = random.Random(101)
    out = []
    for r in rows:
        v = dict(r)
        v["Data"] = r["Data"].strftime("%d.%m.%Y")
        if rng.random() < 0.3:
            v["Trimestru"] = "Trim " + r["Trimestru"][1]
        if rng.random() < 0.1:
            v["Luna_Nume"] = r["Luna_Nume"].lower()
        v["Observatii"] = None
        out.append(v)
    out.append({c: None for c in out[0]} | {"Observatii": "Calendar generat automat 2021-2025"})
    return out, {"Data": "NVARCHAR(10)", "Trimestru": "NVARCHAR(10)", "Observatii": TXT}


def dirty_companii(rows):
    rng = random.Random(102)
    out = []
    for i, r in enumerate(rows):
        v = dict(r)
        if i % 3 == 1:
            v["Companie"] = "  " + r["Companie"]
        v["Tip_Companie"] = case_variant(rng, r["Tip_Companie"], 0.5)
        if r["Alianta"] == "Fara alianta" and i % 2 == 0:
            v["Alianta"] = None
        out.append(v)
    out.insert(5, dict(out[4]))
    return out, {"Companie": TXT, "Tip_Companie": TXT}


def dirty_rute(rows):
    rng = random.Random(103)
    out = []
    for r in rows:
        v = dict(r)
        v["Distanta_km"] = f"{r['Distanta_km']} km"
        v["Durata_Min"] = f"{r['Durata_Min']} min"
        v["Latitudine_Sosire"] = comma(r["Latitudine_Sosire"], 4)
        v["Longitudine_Sosire"] = comma(r["Longitudine_Sosire"], 4)
        if rng.random() < 0.3:
            v["Regiune_Sosire"] = r["Regiune_Sosire"].lower()
        v["Observatii"] = None
        out.append(v)
    return out, {"Distanta_km": "NVARCHAR(20)", "Durata_Min": "NVARCHAR(20)", "Latitudine_Sosire": "NVARCHAR(20)",
                 "Longitudine_Sosire": "NVARCHAR(20)", "Observatii": TXT}


def dirty_aeronave(rows):
    rng = random.Random(104)
    out = []
    for r in rows:
        v = dict(r)
        v["Locuri"] = f"{r['Locuri']} locuri"
        if rng.random() < 0.25:
            v["Producator"] = r["Producator"].upper()
        out.append(v)
    return with_dupes(rng, out, 2), {"Locuri": "NVARCHAR(20)"}


def dirty_clase(rows):
    out = [dict(r) | {"Bagaj_Inclus_kg": f"{r['Bagaj_Inclus_kg']} kg"} for r in rows]
    out.append({"ID": 99, "Clasa": "TEST - nu folositi", "Cod_Clasa": "X", "Bagaj_Inclus_kg": "0 kg", "Ordine": 99})
    return out, {"Bagaj_Inclus_kg": "NVARCHAR(20)"}


def dirty_canale(rows):
    out = []
    for i, r in enumerate(rows):
        v = dict(r)
        v["Comision_Pct"] = f"{r['Comision_Pct']:g}%"
        if i % 2 == 0:
            v["Canal"] = r["Canal"] + "   "
        out.append(v)
    return out, {"Comision_Pct": "NVARCHAR(10)"}


def dirty_pasageri(rows):
    rng = random.Random(107)
    out = []
    for r in rows:
        v = dict(r)
        v["Nivel_Loialitate"] = case_variant(rng, r["Nivel_Loialitate"], 0.3)
        if rng.random() < 0.2:
            v["Oras"] = r["Oras"] + " "
        if rng.random() < 0.15:
            v["Gen"] = r["Gen"].lower()
        if rng.random() < 0.05:
            v["Tara"] = r["Tara"].lower()
        out.append(v)
    return with_dupes(rng, out, 8), {"Nivel_Loialitate": TXT, "Oras": TXT}


def dirty_zboruri(rows):
    rng = random.Random(108)
    out = []
    for r in rows:
        v = dict(r)
        v["Status_Zbor"] = case_variant(rng, r["Status_Zbor"], 0.13)
        v["Venit_Bilete"] = comma(r["Venit_Bilete"])
        v["Venit_Auxiliar"] = comma(r["Venit_Auxiliar"])
        v["Exportat_La"] = "2026-01-05 06:00"
        out.append(v)
    out = with_dupes(rng, out, 6)
    for k in range(3):
        t = dict(out[100 + k * 2000])
        t |= {"ID_Zbor": 90001 + k, "Cod_Zbor": f"TEST{k + 1:02d}", "Status_Zbor": "Test", "Intarziere_Min": 0,
              "Pasageri_Imbarcati": 0, "Venit_Bilete": "0,00", "Venit_Auxiliar": "0,00", "Cost_Combustibil": 0.0, "Cost_Operare": 0.0}
        out.insert(100 + k * 2000 + 1, t)
    return with_blanks(rng, out, 2), {"Status_Zbor": "NVARCHAR(20)", "Venit_Bilete": "NVARCHAR(20)",
                                      "Venit_Auxiliar": "NVARCHAR(20)", "Exportat_La": "NVARCHAR(20)"}


def dirty_rezervari(rows):
    rng = random.Random(109)
    out = []
    for r in rows:
        v = dict(r)
        if rng.random() < 0.10:
            v["Nr_Bilete"] = f"{r['Nr_Bilete']} bilete" if r["Nr_Bilete"] > 1 else "1 bilet"
        else:
            v["Nr_Bilete"] = str(r["Nr_Bilete"])
        v["ID_Pasager"] = f" {r['ID_Pasager']} " if rng.random() < 0.06 else str(r["ID_Pasager"])
        v["Status_Rezervare"] = case_variant(rng, r["Status_Rezervare"], 0.12)
        v["Observatii"] = None
        out.append(v)
    out = with_blanks(rng, with_dupes(rng, out, 8), 3)
    total = round(sum(r["Valoare_Totala"] for r in rows), 2)
    out.append({c: None for c in out[0]} | {"Cod_Rezervare": "TOTAL", "Valoare_Totala": total, "Observatii": "total export"})
    return out, {"Nr_Bilete": "NVARCHAR(20)", "ID_Pasager": "NVARCHAR(20)", "Status_Rezervare": "NVARCHAR(20)",
                 "Cod_Rezervare": "NVARCHAR(12)", "Observatii": TXT}


DIRTY = {"Dim_Date": dirty_date, "Dim_Companii": dirty_companii, "Dim_Rute": dirty_rute, "Dim_Aeronave": dirty_aeronave,
         "Dim_Clase": dirty_clase, "Dim_Canale": dirty_canale, "Dim_Pasageri": dirty_pasageri,
         "Fact_Zboruri": dirty_zboruri, "Fact_Rezervari": dirty_rezervari}


def check(name: str, clean: list[dict], dirty: list[dict]) -> None:
    """Simulează curățarea minimă (fără coloanele în plus, fără rânduri goale/test/total, fără duplicate)."""
    cols = list(clean[0])
    keep, seen = [], set()
    for r in dirty:
        if all(r.get(c) is None for c in cols):
            continue
        if r.get("Cod_Zbor", "").startswith("TEST") or r.get("Cod_Rezervare") == "TOTAL" or r.get("Clasa", "").startswith("TEST"):
            continue
        key = tuple(r[c] for c in cols)
        if key in seen:
            continue
        seen.add(key)
        keep.append(r)
    id_col = cols[0]
    assert len(keep) == len(clean), (name, len(keep), len(clean))
    assert sorted(int(str(r[id_col]).strip()) for r in keep) == sorted(r[id_col] for r in clean), name


# ---------------------------------------------------------------------------
# SQL
# ---------------------------------------------------------------------------
def sql_value(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, (date, time)):
        return g10.sql_value(v)
    if isinstance(v, (int, float)):
        return repr(v)
    return "N'" + str(v).replace("'", "''") + "'"


def write_sql(dirty: dict[str, tuple[list[dict], dict]]) -> None:
    SQL_OUT.parent.mkdir(parents=True, exist_ok=True)
    order = list(dirty)
    out = [
        "-- Proiect · Sesiunea 11 · baza „Aviatie” refăcută, cu date murdare (Azure SQL Database)",
        "-- Server: fly.database.windows.net · Database: Flyableinc",
        "-- Generat de assets/s11/generate_proiect_s11.py. Rulați tot fișierul o dată, în SSMS sau Azure Data Studio",
        "-- Fișierul e împărțit în loturi cu GO (merge în SSMS / Azure Data Studio, nu în Query Editor din portal):",
        "-- inserările se compilează abia după ce tabelele noi există, cu coloanele lor noi.",
        "-- ATENȚIE: pasul 1 șterge tabelele din S10 (datele curate). Exemplele din S10–S11 merg în continuare",
        "-- pe Excel-urile din sesiuni/s10/date/. Ca să le readuceți în bază, rulați din nou assets/s10/azure/aviatie_azure.sql.",
        "-- Utilizatorul curs_powerbi își păstrează dreptul de citire (rolul db_datareader e pe toată baza).",
        "-- În SSMS alegeți întâi baza flyableinc din lista de baze de deasupra editorului (Azure SQL nu acceptă USE).",
        "SET NOCOUNT ON;",
        "",
        "-- 0. Oprim scriptul dacă nu suntem în baza flyableinc (de exemplu în master)",
        "IF DB_NAME() <> N'flyableinc'",
        "BEGIN",
        "    RAISERROR(N'Scriptul trebuie rulat în baza flyableinc. Alegeți-o din lista de baze din SSMS și rulați din nou.', 16, 1);",
        "    SET NOEXEC ON;  -- loturile de mai jos nu se mai execută",
        "END;",
        "GO",
        "",
        "SET NOCOUNT ON;",
        "-- 1. Ștergem tabelele existente (întâi cele de fapte, din cauza cheilor externe)",
    ]
    for name in reversed(order):
        out.append(f"DROP TABLE IF EXISTS dbo.{name};")
    out += ["GO", "", "-- 2. Creăm tabelele noi: fără chei și fără constrângeri, ca un export brut din sistemele companiilor"]
    for name in order:
        rows, types = dirty[name]
        clean_types = {c: base_type(t) for c, t in g10.SQL_TYPES[name].items()}
        cols = ",\n    ".join(f"{c} {types.get(c, clean_types.get(c))}" for c in rows[0])
        out.append(f"CREATE TABLE dbo.{name} (\n    {cols}\n);")
    out += ["GO", "", "-- 3. Inserăm datele murdare (câte un lot pe tabel)", "SET NOCOUNT ON;"]
    for name in order:
        rows, _ = dirty[name]
        cols = list(rows[0])
        for i in range(0, len(rows), 1000):
            chunk = rows[i:i + 1000]
            vals = ",\n".join("(" + ", ".join(sql_value(r[c]) for c in cols) + ")" for r in chunk)
            out.append(f"INSERT INTO dbo.{name} ({', '.join(cols)}) VALUES\n{vals};")
        out += ["GO", "", "SET NOCOUNT ON;"]
    out += [
        "-- 4. Verificare: câte rânduri are fiecare tabel ÎNAINTE de curățare",
        " UNION ALL\n".join(f"SELECT '{n}' AS Tabel, COUNT(*) AS Randuri FROM dbo.{n}" for n in order) + ";",
        "GO",
        "SET NOEXEC OFF;",
        "GO",
        "",
    ]
    SQL_OUT.write_text("\n".join(out), encoding="utf-8")


# ---------------------------------------------------------------------------
# Pagina proiectului
# ---------------------------------------------------------------------------
SPEC = [
    ("Fact_Zboruri", "fiecare zbor operat: companie, rută, aeronavă, status, pasageri, venituri și costuri"),
    ("Fact_Rezervari", "rezervările membrilor programului de loialitate: clasă, canal, bilete, valoare"),
    ("Dim_Date", "calendarul 2021–2025"),
    ("Dim_Companii", "cele 10 companii aeriene"),
    ("Dim_Rute", "rutele: aeroporturi, orașe, țări, distanță"),
    ("Dim_Aeronave", "flota: model, producător, locuri"),
    ("Dim_Clase", "clasele de călătorie"),
    ("Dim_Canale", "canalele prin care se fac rezervările"),
    ("Dim_Pasageri", "membrii programului de loialitate"),
]

PROJ_CSS = """
.conn { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 16px 0 0; }
.conn div { padding: 12px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); }
.conn span { display: block; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-3); }
.conn b { display: block; margin-top: 4px; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 0.88rem; overflow-wrap: anywhere; }
.tables { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 6px 0 0; }
.tables div { padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface-2); }
.tables b { display: block; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 0.92rem; }
.tables span { font-size: 0.84rem; color: var(--text-2); }
.must.one { grid-template-columns: 1fr; }
@media (max-width: 820px) { .conn, .tables { grid-template-columns: 1fr; } }
"""


def build_page(clean: dict[str, list[dict]]) -> str:
    rows = "".join(f"<tr><td><b>{n}</b></td><td class='num'>{len(clean[n]):,}".replace(",", ".") + f"</td><td class='num'>{len(clean[n][0])}</td></tr>" for n, _ in SPEC)
    tables = "".join(f"<div><b>{n}</b><span>{esc(d)}</span></div>" for n, d in SPEC)
    return f"""<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Proiect · Flyable</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <style>{CSS.replace('#DC2626', COLOR)}</style>
  <style>{EXTRA_CSS}</style>
  <style>{PROJ_CSS}</style>
  <style>:root {{ --c: {COLOR}; }}</style>
</head>
<body>
  <main>
    <div class="topbar"><a class="back" href="../index.html">← Înapoi la Sesiunea 11</a><button type="button" class="theme-btn" data-theme-btn>☀ Temă deschisă</button></div>
    <header class="hero">
      <span class="badge">Proiect · Sesiunea 11</span>
      <h1>Flyable</h1>
      <div class="context">
        <p>Datele sunt în baza Azure SQL pe care ați folosit-o în sesiunea 10, dar au fost refăcute: <b>alte zboruri, alte rezervări, alți pasageri</b>, exportate așa cum vin din sistemele companiilor, adică murdare.</p>
        <p>Puteți folosi <b>ce tabele vreți</b> din sursă și puteți face <b>câte pagini vreți</b>. Important e să alegeți conștient ce vreți să faceți: fiecare tabel și fiecare pagină să aibă un motiv.</p>
      </div>
    </header>
    <div class="conn">
      <div><span>Sursă</span><b>Azure SQL database</b></div>
      <div><span>Server</span><b>fly.database.windows.net</b></div>
      <div><span>Database</span><b>Flyableinc</b></div>
      <div><span>Utilizator</span><b>curs_powerbi</b></div>
    </div>

    <nav class="tabs">
      <button type="button" data-tab="curatare"><span class="tn">1</span><span><b>Curățare</b><small>Power Query</small></span></button>
      <button type="button" data-tab="model"><span class="tn">2</span><span><b>Model</b><small>legați tabelele alese</small></span></button>
      <button type="button" data-tab="raport"><span class="tn">3</span><span><b>Raport</b><small>fără indicații</small></span></button>
    </nav>

    <section class="panel" id="curatare">
      <h2>Pasul 1 · Curățarea datelor</h2>
      <p class="lead">Conectați-vă la bază în modul <b>Import</b>, bifați tabelele pe care le folosiți și apăsați <b>Transform Data</b>. Curățați totul în Power Query: în bază nu modificați nimic.</p>
      <div class="box intro">
        <h3>Regulile</h3>
        <ul>
          <li>Numele interogării = numele tabelului, fără <code>dbo</code> (de exemplu <code>Fact_Zboruri</code>).</li>
          <li>Fiecare coloană are tipul potrivit conținutului ei.</li>
          <li>Verificați-vă după numărul de <b>rânduri</b> și <b>coloane</b> din tabel. Dacă nu se potrivește, mai e ceva de curățat.</li>
        </ul>
      </div>
      <div class="box">
        <h3>Ce trebuie să obțineți (pentru tabelele pe care le folosiți)</h3>
        <table class="t"><thead><tr><th>Tabel</th><th>Rânduri</th><th>Coloane</th></tr></thead><tbody>{rows}</tbody></table>
      </div>
    </section>

    <section class="panel" id="model">
      <h2>Pasul 2 · Modelul de date</h2>
      <p class="lead">Acestea sunt cele 9 tabele din sursă. <b>Legați tabelele alese</b> ca să obțineți un model de date: ce relații faceți și cum le setați decideți voi.</p>
      <div class="box">
        <div class="tables">{tables}</div>
      </div>
    </section>

    <section class="panel" id="raport">
      <h2>Pasul 3 · Raportul</h2>
      <p class="lead">Aici nu primiți nicio indicație: ce pagini faceți, ce întrebări alegeți și ce chart-uri folosiți hotărâți voi.</p>

      <div class="box intro">
        <h3>Facultativ: pașii din sesiunea 11</h3>
        <p style="margin:0 0 8px">Dacă vreți să vă faceți o idee despre cum ar trebui construit raportul, puteți urma pașii din sesiunea 11: cititorul și Big Idea, arborele de întrebări, imaginea de ansamblu → diagnostic → detaliu, storyboard-ul, titlurile-concluzie, KPI-urile cu reper și formatarea condiționată.</p>
        <div class="btnrow" style="margin:0"><a class="btn ghost" href="../index.html" target="_blank" rel="noopener">Deschide sesiunea 11</a></div>
      </div>

      <div class="box">
        <h3>Ce prezentați</h3>
        <p style="margin:0 0 8px">Pe lângă chart-uri, ne prezentați <b>logica fiecărei pagini</b>, ca să înțelegem structura raportului:</p>
        <ul class="must one">
          <li><b>De ce</b> ați ales să faceți pagina respectivă.</li>
          <li><b>La ce întrebări</b> răspunde fiecare chart de pe pagină.</li>
          <li><b>Cum se leagă</b> paginile între ele: ce drum parcurge cititorul de la prima la ultima.</li>
        </ul>
      </div>
    </section>
  </main>
  <script>{THEME_JS.replace('proiect-s06-theme', 'proiect-s11-theme')}</script>
  <script>{PAGE_JS}</script>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Cheia facilitatorului
# ---------------------------------------------------------------------------
def write_key(clean, dirty) -> None:
    raw = "\n".join(f"| {n} | {len(dirty[n][0]):,} | {len(dirty[n][0][0])} | {len(clean[n]):,} | {len(clean[n][0])} |".replace(",", ".") for n in clean)
    KEY_OUT.write_text(f"""# Proiect · Sesiunea 11 · Flyable (Azure SQL murdar) — cheia facilitatorului

Scriptul `assets/s11/azure/aviatie_murdar_azure.sql` șterge cele 9 tabele curate din S10 și le recreează murdare.
Datele sunt generate cu funcțiile din S10, dar cu alte seed-uri și alte volume (9.600 zboruri, 11.400 rezervări, 2.200 pasageri).

## Rânduri și coloane

| Tabel | Rânduri în bază | Coloane în bază | Rânduri curat | Coloane curat |
|-------|----------------:|----------------:|--------------:|--------------:|
{raw}

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
""", encoding="utf-8")


def main() -> None:
    cal = g10.gen_date()
    co, rute, cl, ca, pas = g10.gen_companii(), g10.gen_rute(), g10.gen_clase(), g10.gen_canale(), g10.gen_pasageri()
    av, fleet = g10.gen_aeronave()
    zb = g10.gen_zboruri(cal, rute, co, av, fleet)
    rez = g10.gen_rezervari(cal, rute, co, cl, ca, pas, zb)
    clean = {"Dim_Date": cal, "Dim_Companii": co, "Dim_Rute": rute, "Dim_Aeronave": av, "Dim_Clase": cl, "Dim_Canale": ca,
             "Dim_Pasageri": pas, "Fact_Zboruri": zb, "Fact_Rezervari": rez}
    dirty = {n: DIRTY[n](rows) for n, rows in clean.items()}
    for n in clean:
        check(n, clean[n], dirty[n][0])
    write_sql(dirty)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "index.html").write_text(build_page(clean), encoding="utf-8")
    write_key(clean, dirty)
    for n in clean:
        print(f"{n:16} bază {len(dirty[n][0]):>6} × {len(dirty[n][0][0]):>2}   curat {len(clean[n]):>6} × {len(clean[n][0]):>2}")


if __name__ == "__main__":
    main()
