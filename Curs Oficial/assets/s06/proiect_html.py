# -*- coding: utf-8 -*-
"""Pagina temei · S6: trei secțiuni (Curățare, Model, Raport) + pagina de index."""
from __future__ import annotations

import html
import random
from pathlib import Path


def fmt_num(x: float, dec: int = 2) -> str:
    s = f"{x:,.{dec}f}".replace(",", " ").replace(".", ",").replace(" ", ".")
    return s


def esc(s: str) -> str:
    return html.escape(str(s), quote=False)


# ---------------------------------------------------------------------------
# Măsuri și cerințe de raport pe set de date
# ---------------------------------------------------------------------------
def measure_values(t, d) -> dict:
    f = d["fact"]
    tot = sum(r["Valoare_Totala"] for r in f)
    n = len(f)
    dc = len({r[t.c_cli] for r in f})
    ok = sum(r["Valoare_Totala"] for r in f if r["Status"] != t.status_ko)
    ko_n = sum(1 for r in f if r["Status"] == t.status_ko)
    qty = sum(r[t.c_qty] for r in f)
    return {"total": tot, "n": n, "avg": tot / n, "dc": dc, "ok": ok, "qty": qty,
            "rata_ko": ko_n / n, "per_cli": tot / dc}


def report_spec(t, v) -> dict:
    F, C, P, L = t.fact, t.t_cli, t.t_prod, t.t_loc
    m = lambda name: f"[{name}]"
    if t.folder == "cafeloop":
        measures = [
            ("Total Vanzari", f"SUM ( {F}[Valoare_Totala] )", "Valoarea tuturor bonurilor.", fmt_num(v["total"]) + " lei"),
            ("Nr Bonuri", f"COUNTROWS ( {F} )", "Câte bonuri (linii de vânzare) există.", fmt_num(v["n"], 0)),
            ("Valoare medie bon", "DIVIDE ( [Total Vanzari], [Nr Bonuri] )", "Cât valorează, în medie, un bon.", fmt_num(v["avg"]) + " lei"),
            ("Clienti activi", f"DISTINCTCOUNT ( {F}[{t.c_cli}] )", "Câți clienți diferiți au cumpărat.", fmt_num(v["dc"], 0)),
            ("Vanzari fara anulate", f'CALCULATE ( [Total Vanzari], {F}[Status] <> "{t.status_ko}" )', "Vânzările fără bonurile anulate.", fmt_num(v["ok"]) + " lei"),
            ("% din total", f"DIVIDE ( [Total Vanzari], CALCULATE ( [Total Vanzari], ALL ( {P}[Categorie] ) ) )", "Ce procent din toate vânzările face fiecare categorie. Format: Percentage.", "100% (fără filtre)"),
        ]
        columns = [("Calendar", "Tip_Zi", 'IF ( Calendar[Nr_Zi] >= 6, "Weekend", "Zi lucratoare" )', "Eticheta Weekend / Zi lucratoare pentru fiecare zi.")]
        pages = [
            ("Performanța rețelei",
             "Directorul de operațiuni vrea să vadă dintr-o privire cât vinde rețeaua CafeLoop, cum se schimbă vânzările de la o lună la alta (iarna față de vară) și ce cafenele trag rețeaua în sus. Pagina răspunde la întrebarea: merge bine rețeaua, când și unde?",
             ["Total Vanzari", "Nr Bonuri", "Valoare medie bon"],
             [("Clustered bar chart", [("Axa Y", f"{L}[{t.l_nume}]"), ("Axa X", m("Total Vanzari")), ("Filtru pe vizual", f'{F}[Status] = "{t.status_ok}"')]),
              ("Pie chart", [("Legendă", f"{L}[Oras]"), ("Valori", m("Total Vanzari"))]),
              ("Line chart", [("Axa X", "Calendar[Luna_Nume]"), ("Axa Y", m("Total Vanzari")), ("Legendă", "Calendar[An]")]),
              ("Clustered column chart", [("Axa X", f"{L}[Format]"), ("Axa Y", m("Valoare medie bon"))])],
             ["Calendar[An]", f"{L}[Regiune]"]),
            ("Ce vindem și cui",
             "Departamentul de marketing vrea să știe ce categorii de produse aduc banii, ce produse sunt vedetele meniului și ce tipuri de clienți cumpără, ca să decidă unde face promoții. Pagina răspunde la întrebarea: pe ce și pe cine ne concentrăm?",
             ["Clienti activi", "Vanzari fara anulate"],
             [("Line chart", [("Axa X", f"{P}[Categorie]"), ("Axa Y", m("Total Vanzari"))]),
              ("Clustered bar chart", [("Axa Y", f"{P}[{t.p_nume}]"), ("Axa X", m("Total Vanzari")), ("Filtru pe vizual", f"Top N = 10 după {m('Total Vanzari')}")]),
              ("Line chart", [("Axa X", "Calendar[Luna_Nume]"), ("Axa Y", m("Vanzari fara anulate")), ("Legendă", f"{P}[Categorie]"), ("Filtru pe vizual", "Calendar[An] = 2025")]),
              ("Table", [("Coloane", f"{P}[Categorie], {m('Total Vanzari')}, {m('% din total')}")])],
             [f"{F}[{t.c_canal}]", "Calendar[Tip_Zi]"]),
        ]
    elif t.folder == "travelgo":
        measures = [
            ("Valoare Rezervari", f"SUM ( {F}[Valoare_Totala] )", "Valoarea tuturor rezervărilor.", fmt_num(v["total"]) + " lei"),
            ("Nr Rezervari", f"COUNTROWS ( {F} )", "Câte rezervări există.", fmt_num(v["n"], 0)),
            ("Turisti", f"SUM ( {F}[{t.c_qty}] )", "Câte persoane au rezervat.", fmt_num(v["qty"], 0)),
            ("Valoare medie rezervare", "DIVIDE ( [Valoare Rezervari], [Nr Rezervari] )", "Cât valorează, în medie, o rezervare.", fmt_num(v["avg"]) + " lei"),
            ("Rezervari anulate", f'CALCULATE ( [Nr Rezervari], {F}[Status] = "{t.status_ko}" )', "Câte rezervări au fost anulate.", fmt_num(round(v["rata_ko"] * v["n"]), 0)),
            ("Rata anulare", "DIVIDE ( [Rezervari anulate], [Nr Rezervari] )", "Ce procent din rezervări se anulează. Format: Percentage.", fmt_num(v["rata_ko"] * 100, 1) + "%"),
        ]
        columns = [(P, "Tip_Sejur", f'IF ( {P}[Categorie] = "City break", "Scurt", "Lung" )', "City break = sejur scurt; restul = sejur lung.")]
        pages = [
            ("Vânzări și sezonalitate",
             "Directorul comercial vrea să știe cât a vândut TravelGo, în ce luni se fac cele mai multe rezervări (early booking iarna sau last minute vara?) și care agenții vând cel mai bine, ca să planifice campaniile pentru anul următor.",
             ["Valoare Rezervari", "Nr Rezervari", "Turisti"],
             [("Pie chart", [("Legendă", "Calendar[Luna_Nume]"), ("Valori", m("Nr Rezervari"))]),
              ("Line chart", [("Axa X", "Calendar[Luna_Nume]"), ("Axa Y", m("Valoare Rezervari")), ("Legendă", "Calendar[An]")]),
              ("Clustered bar chart", [("Axa Y", f"{L}[{t.l_nume}]"), ("Axa X", m("Valoare Rezervari")), ("Filtru pe vizual", f'{L}[Format] nu este „Online”')]),
              ("Donut chart", [("Legendă", f"{F}[{t.c_canal}]"), ("Valori", m("Nr Rezervari"))])],
             ["Calendar[An]", f"{L}[Regiune]"]),
            ("Destinații și clienți",
             "Managerul de produs vrea să vadă ce tipuri de vacanțe și ce țări se vând, ce clienți cumpără fiecare tip de vacanță și cât pierdem din anulări. Pagina răspunde la întrebarea: ce pachete păstrăm și pentru cine?",
             ["Valoare medie rezervare", "Rata anulare"],
             [("Line chart", [("Axa X", f"{P}[Tara]"), ("Axa Y", m("Valoare Rezervari"))]),
              ("Stacked bar chart", [("Axa Y", f"{P}[Categorie]"), ("Axa X", m("Valoare Rezervari")), ("Legendă", f"{C}[Segment]")]),
              ("Clustered column chart", [("Axa X", f"{P}[Tip_Sejur]"), ("Axa Y", m("Valoare medie rezervare"))]),
              ("Table", [("Coloane", f"{P}[{t.p_nume}], {m('Nr Rezervari')}, {m('Turisti')}, {m('Valoare Rezervari')}"), ("Filtru pe vizual", f"Top N = 10 după {m('Valoare Rezervari')}")])],
             [f"{F}[{t.c_canal}]", f"{C}[Tip_Client]"]),
        ]
    elif t.folder == "petzone":
        measures = [
            ("Total Vanzari", f"SUM ( {F}[Valoare_Totala] )", "Valoarea tuturor bonurilor.", fmt_num(v["total"]) + " lei"),
            ("Nr Bonuri", f"COUNTROWS ( {F} )", "Câte bonuri (linii de vânzare) există.", fmt_num(v["n"], 0)),
            ("Bucati vandute", f"SUM ( {F}[{t.c_qty}] )", "Câte bucăți s-au vândut.", fmt_num(v["qty"], 0)),
            ("Valoare medie bon", "DIVIDE ( [Total Vanzari], [Nr Bonuri] )", "Cât valorează, în medie, un bon.", fmt_num(v["avg"]) + " lei"),
            ("Clienti activi", f"DISTINCTCOUNT ( {F}[{t.c_cli}] )", "Câți clienți diferiți au cumpărat.", fmt_num(v["dc"], 0)),
            ("Vanzari nete", f'CALCULATE ( [Total Vanzari], {F}[Status] <> "{t.status_ko}" )', "Vânzările fără produsele returnate.", fmt_num(v["ok"]) + " lei"),
            ("% din total animale", f"DIVIDE ( [Total Vanzari], CALCULATE ( [Total Vanzari], ALL ( {P}[Animal] ) ) )", "Ce procent din vânzări face fiecare tip de animal. Format: Percentage.", "100% (fără filtre)"),
        ]
        columns = [(F, "Are_Discount", f'IF ( {F}[Discount_Pct] > 0, "Cu discount", "Fara discount" )', "Marchează bonurile care au primit discount.")]
        pages = [
            ("Rețeaua de magazine",
             "Managerul de rețea vrea să vadă cât vând magazinele PetZone, cum evoluează vânzările de la o lună la alta (inclusiv luna cadourilor, decembrie) și ce formate de magazin merg cel mai bine. Pagina răspunde la întrebarea: ce magazine și ce formate susțin rețeaua?",
             ["Total Vanzari", "Nr Bonuri", "Valoare medie bon"],
             [("Donut chart", [("Legendă", f"{P}[{t.p_nume}]"), ("Valori", m("Total Vanzari"))]),
              ("Line chart", [("Axa X", "Calendar[Luna_Nume]"), ("Axa Y", m("Total Vanzari")), ("Legendă", "Calendar[An]")]),
              ("Clustered bar chart", [("Axa Y", f"{L}[{t.l_nume}]"), ("Axa X", m("Total Vanzari")), ("Filtru pe vizual", f'{L}[Format] nu este „Online”')]),
              ("Clustered column chart", [("Axa X", f"{L}[Format]"), ("Axa Y", m("Valoare medie bon"))])],
             ["Calendar[An]", f"{L}[Regiune]"]),
            ("Animale, produse și clienți",
             "Departamentul de achiziții vrea să știe pentru ce animale și ce categorii de produse se vinde cel mai mult, cât de des cumpără clienții cu discount și ce tipuri de clienți aduc bani. Pagina răspunde la întrebarea: ce să avem mereu pe stoc?",
             ["Bucati vandute", "Clienti activi", "Vanzari nete"],
             [("Line chart", [("Axa X", f"{L}[Oras]"), ("Axa Y", m("Total Vanzari"))]),
              ("100% stacked column chart", [("Axa X", f"{P}[Animal]"), ("Axa Y", m("Total Vanzari")), ("Legendă", f"{P}[Categorie]"), ("Filtru pe vizual", f'{F}[Status] = "{t.status_ok}"')]),
              ("Clustered column chart", [("Axa X", f"{F}[Are_Discount]"), ("Axa Y", m("Nr Bonuri"))]),
              ("Table", [("Coloane", f"{P}[Animal], {m('Total Vanzari')}, {m('% din total animale')}")])],
             [f"{F}[{t.c_canal}]", f"{C}[Segment]"]),
        ]
    else:  # galben
        measures = [
            ("Total Incasari", f"SUM ( {F}[Valoare_Totala] )", "Valoarea tuturor încasărilor.", fmt_num(v["total"]) + " lei"),
            ("Nr Tranzactii", f"COUNTROWS ( {F} )", "Câte încasări (linii) există.", fmt_num(v["n"], 0)),
            ("Membri activi", f"DISTINCTCOUNT ( {F}[{t.c_cli}] )", "Câți membri diferiți au plătit ceva.", fmt_num(v["dc"], 0)),
            ("Incasare medie per membru", "DIVIDE ( [Total Incasari], [Membri activi] )", "Cât plătește, în medie, un membru.", fmt_num(v["per_cli"]) + " lei"),
            ("Incasari fara anulate", f'CALCULATE ( [Total Incasari], {F}[Status] <> "{t.status_ko}" )', "Încasările fără tranzacțiile anulate.", fmt_num(v["ok"]) + " lei"),
            ("% din total categorii", f"DIVIDE ( [Total Incasari], CALCULATE ( [Total Incasari], ALL ( {P}[Categorie] ) ) )", "Ce procent din încasări face fiecare categorie de servicii. Format: Percentage.", "100% (fără filtre)"),
        ]
        columns = [("Calendar", "Tip_Zi", 'IF ( Calendar[Nr_Zi] >= 6, "Weekend", "Zi lucratoare" )', "Eticheta Weekend / Zi lucratoare pentru fiecare zi.")]
        pages = [
            ("Încasări și sezon",
             "Directorul FitPro vrea să vadă cât încasează rețeaua, în ce luni vin cei mai mulți bani (ianuarie, după sărbători? septembrie, după vacanță?) și ce săli performează. Pagina răspunde la întrebarea: când și unde se fac încasările?",
             ["Total Incasari", "Nr Tranzactii", "Membri activi"],
             [("Pie chart", [("Legendă", f"{L}[{t.l_nume}]"), ("Valori", m("Total Incasari"))]),
              ("Line chart", [("Axa X", "Calendar[Luna_Nume]"), ("Axa Y", m("Total Incasari")), ("Legendă", "Calendar[An]")]),
              ("Clustered column chart", [("Axa X", f"{L}[Format]"), ("Axa Y", m("Incasare medie per membru"))]),
              ("Clustered bar chart", [("Axa Y", f"{L}[Oras]"), ("Axa X", m("Total Incasari")), ("Filtru pe vizual", f"Top N = 5 după {m('Total Incasari')}")])],
             ["Calendar[An]", f"{L}[Regiune]"]),
            ("Servicii și membri",
             "Departamentul de marketing vrea să știe ce servicii aduc banii, prin ce canal plătesc membrii, ce tipuri de membri plătesc mai mult și dacă se plătește mai mult în zilele lucrătoare sau în weekend. Pagina răspunde la întrebarea: ce promovăm și cui?",
             ["Incasare medie per membru", "Incasari fara anulate"],
             [("Line chart", [("Axa X", f"{C}[Segment]"), ("Axa Y", m("Total Incasari"))]),
              ("Stacked bar chart", [("Axa Y", f"{P}[Categorie]"), ("Axa X", m("Total Incasari")), ("Legendă", f"{F}[{t.c_canal}]"), ("Filtru pe vizual", f'{F}[Status] = "{t.status_ok}"')]),
              ("Clustered column chart", [("Axa X", "Calendar[Tip_Zi]"), ("Axa Y", m("Nr Tranzactii"))]),
              ("Table", [("Coloane", f"{P}[Categorie], {m('Nr Tranzactii')}, {m('Total Incasari')}, {m('% din total categorii')}")])],
             [f"{C}[Tip_Client]", "Calendar[Trimestru]"]),
        ]
    return {"measures": measures, "columns": columns, "pages": pages}


# ---------------------------------------------------------------------------
# Secțiunea 1 · Curățare
# ---------------------------------------------------------------------------
TYPES = {
    "id": "Număr întreg", "int": "Număr întreg", "dec": "Număr zecimal", "txt": "Text", "date": "Dată",
}


def col_types(t, table: str) -> list[tuple[str, str]]:
    if table == "fact":
        return [(t.c_id, "id"), (t.c_data, "date"), (t.c_cli, "id"), (t.c_prod, "id"), (t.c_loc, "id"),
                (t.c_qty, "int"), (t.c_pret, "dec"), ("Discount_Pct", "int"), ("Valoare_Totala", "dec"),
                (t.c_canal, "txt"), ("Status", "txt")]
    if table == "cli":
        return [(t.c_cli, "id"), (t.cli_nume, "txt"), ("Tip_Client", "txt"), ("Oras", "txt"), ("Regiune", "txt"),
                ("Segment", "txt"), (t.cli_data, "date")]
    if table == "prod":
        out = [(t.c_prod, "id"), (t.p_cod, "txt"), (t.p_nume, "txt"), ("Categorie", "txt")]
        if t.p_extra:
            out.append((t.p_extra[0], "int" if t.p_extra[1] == "Număr întreg" else "txt"))
        return out + [("Pret_Lista", "dec")]
    if table == "loc":
        return [(t.c_loc, "id"), (t.l_nume, "txt"), ("Oras", "txt"), ("Regiune", "txt"), ("Format", "txt"),
                ("Suprafata_mp", "int"), ("Latitudine", "dec"), ("Longitudine", "dec")]
    return [("Data", "date"), ("An", "int"), ("Luna", "int"), ("Luna_Nume", "txt"), ("Trimestru", "txt"),
            ("Zi_Saptamana", "txt"), ("Nr_Zi", "int")]


H_TOP = ("<b>Elimină rândurile de titlu:</b> Home → Remove Rows → <b>Remove Top Rows</b> → scrii {n}. "
         "Apoi Home → <b>Use First Row as Headers</b>. Verifică: primul rând din tabel trebuie să fie primul rând cu date.")
H_LOCALE = ("<b>Data e text în format românesc (zz.ll.aaaa).</b> Click dreapta pe antetul coloanei <code>{c}</code> → "
            "Change Type → <b>Using Locale…</b> → Data Type: <b>Date</b>, Locale: <b>Romanian (Romania)</b> → OK. "
            "Dacă alegi simplu „Date”, Power BI poate inversa ziua cu luna sau poate da erori.")
H_TRIM = ("<b>Spații în plus:</b> selectezi coloana <code>{c}</code> → Transform → Format → <b>Trim</b>. "
          "Trim șterge spațiile de la început și de la final.")


def cleaning_blocks(t, d) -> list[dict]:
    f, c, p, l = d["i_fact"], d["i_cli"], d["i_prod"], d["i_loc"]
    regs = sorted({r["Regiune"] for r in d["loc"]})
    pf = sum(1 for r in d["cli"] if r["Tip_Client"] == "PF")
    cats = []
    for r in d["prod"]:
        if r["Categorie"] not in cats:
            cats.append(r["Categorie"])
    stat_ok = sum(1 for r in d["fact"] if r["Status"] == t.status_ok)
    canale = sorted({r[t.c_canal] for r in d["fact"]})
    blocks = []

    blocks.append({
        "key": "fact", "name": t.fact, "kind": "Fact (tabelul de fapte)",
        "rows": len(d["fact"]), "cols": col_types(t, "fact"),
        "problems": [
            "Primele 2 rânduri sunt titlul exportului, nu date. Antetul real este pe rândul 3.",
            "Ultimul rând este un total („Total linii export: …”), nu o tranzacție.",
            "Există un rând complet gol, la mijlocul tabelului.",
            f"3 tranzacții apar de două ori (rânduri identice). {t.c_id} trebuie să fie unic: ID-urile dublate sunt {', '.join(str(x) for x in f['dup_ids'])}.",
            f"{t.c_data} este text în formatul zz.ll.aaaa și trebuie transformată în dată.",
            f"{t.c_qty} are {f['qty_txt']} valori scrise cu text, de exemplu „3 buc”. Trebuie să rămână doar numărul.",
            f"{t.c_cli} are {f['id_sp']} valori cu spații înainte și după număr.",
            f"Status este scris în mai multe feluri ({', '.join(f['status_bad'])}). La final trebuie să existe doar 2 valori: {t.status_ok} și {t.status_ko}.",
            f"{t.c_canal} are {f['can_sp']} valori cu spații la final.",
        ],
        "help": [
            H_TOP.format(n=2),
            "<b>Rândul de total de la final:</b> Home → Remove Rows → <b>Remove Bottom Rows</b> → scrii 1.",
            "<b>Rândul gol:</b> Home → Remove Rows → <b>Remove Blank Rows</b>.",
            f"<b>Dubluri:</b> click pe antetul coloanei <code>{t.c_id}</code> → Home → Remove Rows → <b>Remove Duplicates</b>. Power Query păstrează prima apariție a fiecărui ID.",
            H_LOCALE.format(c=t.c_data),
            f"<b>„buc” din cantitate:</b> coloana are și numere, și text, deci întâi click dreapta pe <code>{t.c_qty}</code> → Change Type → <b>Text</b>. Apoi Transform → <b>Replace Values</b>: Value To Find = <code> buc</code> (cu spațiu în față), Replace With = gol. Apoi Change Type → <b>Whole Number</b>.",
            f"<b>Spații în ID:</b> click dreapta pe <code>{t.c_cli}</code> → Change Type → <b>Text</b> (coloana are și numere, și text), apoi Transform → Format → <b>Trim</b>, apoi Change Type → <b>Whole Number</b>.",
            "<b>Status:</b> selectezi <code>Status</code> → Transform → Format → <b>Trim</b>, apoi Format → <b>Capitalize Each Word</b>. „platit”, „PLATIT” și „ Platit” devin toate „Platit”.",
            H_TRIM.format(c=t.c_canal),
            "<b>Tipurile de date:</b> la final verifică pictograma din stânga fiecărui antet: ID-urile și Discount_Pct = 1²³ (Whole Number), prețul și valoarea = 1.2 (Decimal Number), data = calendar (Date), restul = ABC (Text).",
        ],
        "checks": [
            f"Suma coloanei Valoare_Totala = <b>{fmt_num(sum(r['Valoare_Totala'] for r in d['fact']))}</b>.",
            f"Status are doar 2 valori: {t.status_ok} ({stat_ok} rânduri) și {t.status_ko} ({len(d['fact']) - stat_ok} rânduri).",
            f"{t.c_canal} are exact {len(canale)} valori: {', '.join(canale)}.",
            f"Prima tranzacție este din {d['fact'][0][t.c_data].strftime('%d.%m.%Y')}, ultima din {d['fact'][-1][t.c_data].strftime('%d.%m.%Y')}.",
        ],
    })
    blocks.append({
        "key": "cli", "name": t.t_cli, "kind": "Dimensiune",
        "rows": len(d["cli"]), "cols": col_types(t, "cli"),
        "problems": [
            "Primele 2 rânduri sunt titluri. Antetul real este pe rândul 3.",
            f"Tip_Client este scris în două feluri: „PF” / „PJ” și „Persoana Fizica” / „Persoana Juridica” ({c['tip_bad']} rânduri). La final rămân doar PF și PJ.",
            f"Oras are {c['oras_sp']} valori cu spațiu la final.",
            f"{'Membrul' if t.t_cli == 'Membri' else 'Clientul'} cu {t.c_cli} = {c['dup_id']} apare de două ori (rând identic, la finalul tabelului).",
            f"{t.cli_data} este text în formatul zz.ll.aaaa.",
        ],
        "help": [
            H_TOP.format(n=2),
            "<b>Tip_Client:</b> selectezi coloana → Transform → <b>Replace Values</b>: „Persoana Fizica” → „PF”. Repeți pentru „Persoana Juridica” → „PJ”.",
            H_TRIM.format(c="Oras"),
            f"<b>Dublura:</b> click pe antetul <code>{t.c_cli}</code> → Home → Remove Rows → <b>Remove Duplicates</b>.",
            H_LOCALE.format(c=t.cli_data),
        ],
        "checks": [
            f"Tip_Client: PF = <b>{pf}</b> rânduri, PJ = <b>{len(d['cli']) - pf}</b> rânduri.",
            f"{t.c_cli} merge de la 1 la {len(d['cli'])}, fără dubluri.",
        ],
    })
    blocks.append({
        "key": "prod", "name": t.t_prod, "kind": "Dimensiune",
        "rows": len(d["prod"]), "cols": col_types(t, "prod"),
        "problems": [
            "Primul rând este un titlu, iar al doilea este un antet vechi (Cod, Denumire, Cat.…). Antetul bun este pe rândul 3.",
            "Categorie este completată doar pe primul rând din fiecare grup; rândurile de sub el sunt goale și trebuie completate cu aceeași categorie.",
            f"Pret_Lista are {p['lei']} valori scrise ca text, de exemplu „35 lei”.",
            f"{t.p_nume} are {p['sp']} valori cu spații înainte sau după.",
        ],
        "help": [
            H_TOP.format(n=2),
            "<b>Categoria lipsă:</b> click pe antetul <code>Categorie</code> → Transform → <b>Fill → Down</b>. Fiecare celulă goală primește valoarea de deasupra ei.",
            "<b>„lei” din preț:</b> click dreapta pe <code>Pret_Lista</code> → Change Type → <b>Text</b> (coloana are și numere, și text). Apoi Transform → <b>Replace Values</b>: <code> lei</code> (cu spațiu în față) → gol. Apoi Change Type → <b>Decimal Number</b>.",
            H_TRIM.format(c=t.p_nume),
        ],
        "checks": [
            f"Categorie nu mai are nicio celulă goală și are {len(cats)} valori: {', '.join(cats)}.",
            f"Pret_Lista este număr pe toate cele {len(d['prod'])} rânduri (nicio eroare, nimic aliniat la stânga).",
        ],
    })
    reg_lines = ", ".join(f"„{a}” → „{b}”" for a, b in l["reg_bad"])
    blocks.append({
        "key": "loc", "name": t.t_loc, "kind": "Dimensiune",
        "rows": len(d["loc"]), "cols": col_types(t, "loc"),
        "problems": [
            "Primele 2 rânduri sunt titluri. Antetul real este pe rândul 3.",
            f"Regiune este scrisă cu spațiu în loc de cratimă pe unele rânduri: {reg_lines}.",
            f"Suprafata_mp are {l['mp']} valori cu „mp” scris după număr" + (" și o valoare „N/A” (locația online nu are suprafață)." if l["na"] else "."),
            "Latitudine și Longitudine sunt text cu virgulă (46,7712) și trebuie să devină numere zecimale.",
        ],
        "help": [
            H_TOP.format(n=2),
            "<b>Regiune:</b> selectezi coloana → Transform → <b>Replace Values</b>, câte o dată pentru fiecare variantă greșită: " + reg_lines + ".",
            "<b>Suprafata_mp:</b> întâi Change Type → <b>Text</b> (coloana are și numere, și text). Apoi Replace Values <code> mp</code> (cu spațiu în față) → gol" + (", apoi Replace Values <code>N/A</code> → <code>null</code> (scris exact așa, cu litere mici)" if l["na"] else "") + ". Apoi Change Type → <b>Whole Number</b>.",
            "<b>Coordonatele:</b> click dreapta pe <code>Latitudine</code> → Change Type → <b>Using Locale…</b> → Decimal Number, <b>Romanian (Romania)</b>. Repeți pentru <code>Longitudine</code>. În română virgula este separatorul zecimal, deci 46,7712 devine 46.7712.",
        ],
        "checks": [
            f"Regiune are exact {len(regs)} valori, toate cu cratimă unde e cazul: {', '.join(regs)}.",
            "Latitudine este între 43 și 48, Longitudine între 20 și 30 (numere, nu text).",
        ],
    })
    blocks.append({
        "key": "cal", "name": "Calendar", "kind": "Dimensiune de timp",
        "rows": len(d["cal"]), "cols": col_types(t, "cal"),
        "problems": [
            "Primul rând este un titlu. Antetul real este pe rândul 2.",
            "Data este text în formatul zz.ll.aaaa.",
            f"Trimestru este scris în două feluri: „T1” și „Trim 1” ({d['i_cal']['trim']} rânduri). La final trebuie să existe doar T1, T2, T3, T4.",
            f"Luna_Nume are {d['i_cal']['low']} valori scrise cu literă mică (de exemplu „martie”).",
        ],
        "help": [
            H_TOP.format(n=1),
            H_LOCALE.format(c="Data"),
            "<b>Trimestru:</b> selectezi coloana → Transform → <b>Replace Values</b>: <code>Trim </code> (cu spațiu la final) → <code>T</code>. „Trim 1” devine „T1”.",
            "<b>Luna_Nume:</b> selectezi coloana → Transform → Format → <b>Capitalize Each Word</b>.",
        ],
        "checks": [
            "Prima zi este 01.01.2024, ultima 31.12.2025, fără zile lipsă.",
            "Trimestru are exact 4 valori: T1, T2, T3, T4. Luna_Nume are exact 12 valori.",
        ],
    })
    return blocks


# ---------------------------------------------------------------------------
# HTML
# ---------------------------------------------------------------------------
CSS = """
:root {
  --c: #DC2626;
  --bg: #0b1120; --surface: #131c2e; --surface-2: #1b2638; --line: #2a3850;
  --text: #f1f5f9; --text-2: #cbd5e1; --text-3: #94a3b8; --code: #0a0f1c;
  --ct: color-mix(in srgb, var(--c) 60%, white);
  --soft: color-mix(in srgb, var(--c) 20%, var(--surface));
  --ok-bg: rgba(16, 185, 129, 0.18); --ok: #6ee7b7;
  --help-bg: rgba(245, 158, 11, 0.10); --help-line: rgba(245, 158, 11, 0.40);
  --m-bg: rgba(139, 92, 246, 0.22); --m: #c4b5fd; --cc-bg: rgba(14, 165, 233, 0.20); --cc: #7dd3fc;
  --xl-bg: rgba(34, 197, 94, 0.16); --xl: #86efac;
  color-scheme: dark;
}
[data-theme="light"] {
  --bg: #f5f6f7; --surface: #ffffff; --surface-2: #f8fafc; --line: #e5e7eb;
  --text: #111827; --text-2: #4b5563; --text-3: #6b7280; --code: #1e293b;
  --ct: var(--c); --soft: color-mix(in srgb, var(--c) 10%, white);
  --ok-bg: #ecfdf5; --ok: #047857; --help-bg: #fffbeb; --help-line: #fde68a;
  --m-bg: #ede9fe; --m: #6d28d9; --cc-bg: #e0f2fe; --cc: #0369a1; --xl-bg: #e7f5ec; --xl: #1d6f42;
  color-scheme: light;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.55; }
main { max-width: 1040px; margin: 0 auto; padding: 22px 20px 72px; }
a { color: var(--ct); font-weight: 600; text-decoration: none; }
a:hover { text-decoration: underline; }
code { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 0.86em; padding: 1px 5px; border-radius: 5px; background: var(--surface-2); color: var(--text); }
.back { display: inline-block; margin-bottom: 14px; font-size: 0.92rem; }

.hero { position: relative; overflow: hidden; padding: 28px 30px; border-radius: 18px; background: var(--surface); border: 1px solid var(--line); }
.hero::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 6px; background: var(--c); }
.badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: var(--c); color: #fff; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
.hero h1 { margin: 12px 0 2px; font-size: 2rem; letter-spacing: -0.03em; }
.tag { margin: 0 0 16px; color: var(--text-3); }
.context p { margin: 0 0 8px; color: var(--text-2); }

.files { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 16px 0 0; }
.file { padding: 12px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); }
.file .xl { display: inline-block; padding: 3px 7px; border-radius: 6px; background: var(--xl-bg); color: var(--xl); font-size: 0.68rem; font-weight: 800; }
.file h3 { margin: 6px 0 2px; font-size: 0.98rem; }
.file p { margin: 0; font-size: 0.82rem; color: var(--text-3); }

.tabs { position: sticky; top: 0; z-index: 5; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 22px 0 18px; padding: 10px 0; background: var(--bg); }
.tabs button { font: inherit; cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 14px; border: 2px solid var(--line); background: var(--surface); color: var(--text); text-align: left; }
.tabs button .tn { display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 10px; background: var(--soft); color: var(--ct); font-weight: 800; }
.tabs button b { display: block; font-size: 1.02rem; }
.tabs button small { color: var(--text-3); font-size: 0.82rem; }
.tabs button.on { border-color: var(--ct); box-shadow: 0 0 0 1px var(--c); }
.tabs button.on .tn { background: var(--c); color: #fff; }
.panel { display: none; }
.panel.on { display: block; }

h2 { margin: 0 0 6px; font-size: 1.4rem; letter-spacing: -0.02em; }
.lead { margin: 0 0 16px; color: var(--text-2); }
.box { padding: 16px 20px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); margin-bottom: 14px; }
.box h3 { margin: 0 0 8px; font-size: 1.08rem; }
.box.intro { border-left: 4px solid var(--c); }
.box ol, .box ul { margin: 6px 0 0; padding-left: 1.2rem; }
.box li { margin: 5px 0; }

table.t { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
table.t code { overflow-wrap: anywhere; }
.box { overflow-x: auto; }
table.t th { text-align: left; font-size: 0.74rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-3); padding: 6px 10px; border-bottom: 2px solid var(--line); }
table.t td { padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
table.t td.num { font-weight: 800; color: var(--ct); white-space: nowrap; }

.tcard { padding: 18px 20px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); margin-bottom: 16px; }
.tcard-head { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.tcard-head h3 { margin: 0; font-size: 1.2rem; }
.kind { padding: 3px 10px; border-radius: 999px; background: var(--soft); color: var(--ct); font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
.tcard .desc { margin: 6px 0 12px; color: var(--text-2); }
.target-line { margin: 8px 0 12px; padding: 10px 14px; border-radius: 12px; background: var(--soft); font-size: 1rem; }
.target-line b { color: var(--ct); }
.target { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.target div { padding: 10px 14px; border-radius: 12px; background: var(--soft); }
.target b { display: block; font-size: 1.5rem; line-height: 1.1; color: var(--ct); }
.target span { font-size: 0.84rem; color: var(--text-2); }
.cols { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.cols span { padding: 4px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface-2); font-size: 0.84rem; }
.cols span i { font-style: normal; color: var(--text-3); margin-left: 6px; font-size: 0.78rem; }
.sub { margin: 14px 0 6px; font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-3); font-weight: 800; }
.probs { margin: 0; padding-left: 1.3rem; }
.probs li { margin: 5px 0; }
.checks { margin: 0; padding: 0; list-style: none; }
.checks li { margin: 5px 0; padding-left: 26px; position: relative; }
.checks li::before { content: "✓"; position: absolute; left: 0; top: 0; width: 18px; height: 18px; border-radius: 50%; background: var(--ok-bg); color: var(--ok); font-size: 0.72rem; font-weight: 800; display: grid; place-items: center; }

.help-btn { font: inherit; cursor: pointer; margin-top: 14px; padding: 8px 14px; border-radius: 10px; border: 1px dashed var(--c); background: var(--surface); color: var(--ct); font-weight: 700; }
.help-btn:hover { background: var(--soft); }
.help { display: none; margin-top: 10px; padding: 12px 16px; border-radius: 12px; background: var(--help-bg); border: 1px solid var(--help-line); }
.help.on { display: block; }
.help ol { margin: 0; padding-left: 1.2rem; }
.help li { margin: 6px 0; font-size: 0.93rem; }

.star { display: grid; grid-template-columns: 1fr 1.1fr 1fr; grid-template-rows: auto auto auto; gap: 12px; align-items: center; margin: 8px 0 4px; }
.star .node { padding: 12px 14px; border-radius: 12px; background: var(--surface); border: 2px solid var(--line); text-align: center; }
.star .node b { display: block; font-size: 1rem; }
.star .node span { font-size: 0.8rem; color: var(--text-3); }
.star .fact { grid-column: 2; grid-row: 2; border-color: var(--ct); background: var(--soft); }
.star .n1 { grid-column: 2; grid-row: 1; } .star .n2 { grid-column: 1; grid-row: 2; } .star .n3 { grid-column: 3; grid-row: 2; } .star .n4 { grid-column: 2; grid-row: 3; }
.star .key { display: inline-block; margin-top: 4px; padding: 1px 8px; border-radius: 6px; background: var(--surface-2); font-family: ui-monospace, monospace; font-size: 0.76rem; color: var(--text); }

.fmt { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 18px; margin: 6px 0 0; padding: 0; list-style: none; }
.fmt li { padding-left: 22px; position: relative; font-size: 0.93rem; }
.fmt li::before { content: "◆"; position: absolute; left: 2px; color: var(--ct); font-size: 0.7rem; top: 4px; }

.meas td:first-child { font-weight: 700; white-space: nowrap; }
.f-btn { font: inherit; cursor: pointer; padding: 4px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--surface); font-size: 0.82rem; font-weight: 600; }
.f-btn:hover { border-color: var(--ct); color: var(--ct); }
pre.dax { display: none; margin: 8px 0 0; padding: 10px 12px; border-radius: 10px; background: var(--code); color: #e2e8f0; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 0.82rem; white-space: pre-wrap; }
pre.dax.on { display: block; }

.rpage { padding: 20px 22px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); border-top: 5px solid var(--c); margin-bottom: 18px; }
.rpage .pn { display: inline-block; padding: 3px 10px; border-radius: 999px; background: var(--soft); color: var(--ct); font-size: 0.74rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
.rpage h3 { margin: 8px 0 6px; font-size: 1.3rem; }
.story { margin: 0 0 6px; padding: 12px 14px; border-radius: 12px; background: var(--surface-2); border-left: 3px solid var(--c); color: var(--text-2); }
.story b { color: var(--text); }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.kpis div { padding: 10px 12px; border-radius: 12px; border: 1px solid var(--line); }
.kpis b { display: block; font-family: ui-monospace, monospace; font-size: 0.88rem; }
.kpis span { display: block; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-3); }
.vis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.vis article { padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface-2); }
.vis .vl { display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 7px; background: var(--c); color: #fff; font-size: 0.78rem; font-weight: 800; margin-right: 8px; }
.vis h4 { display: flex; align-items: center; margin: 0 0 8px; font-size: 1rem; }
.vis dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: 0.88rem; }
.vis dt { color: var(--text-3); }
.vis dd { margin: 0; }
.vis .need { margin-top: 8px; font-size: 0.82rem; color: var(--text-2); }
.m-tag, .c-tag { display: inline-block; margin-left: 4px; padding: 0 6px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; vertical-align: 1px; }
.m-tag { background: var(--m-bg); color: var(--m); }
.c-tag { background: var(--cc-bg); color: var(--cc); }
.slicers { display: flex; flex-wrap: wrap; gap: 8px; }
.deadline { margin: 0 0 10px; padding: 12px 16px; border-radius: 12px; background: var(--soft); border: 1px solid var(--c); font-size: 1.02rem; }
.slicers span { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); font-size: 0.88rem; font-family: ui-monospace, monospace; }

@media (max-width: 820px) {
  .vis, .fmt, .kpis { grid-template-columns: 1fr; }
  .files { grid-template-columns: 1fr 1fr; }
  .tabs { grid-template-columns: 1fr; position: static; }
  .star { grid-template-columns: 1fr; }
  .star .node { grid-column: auto !important; grid-row: auto !important; }
}

.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.topbar .back { margin: 0; }
.theme-btn { font: inherit; cursor: pointer; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--text-2); font-size: 0.85rem; font-weight: 600; }
.theme-btn:hover { color: var(--text); border-color: var(--ct); }
"""

THEME_JS = """
(function () {
  var KEY = 'proiect-s06-theme';
  var btn = document.querySelector('[data-theme-btn]');
  function apply(t) {
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    if (btn) btn.textContent = t === 'light' ? '☾ Temă închisă' : '☀ Temă deschisă';
  }
  var cur = 'dark';
  try { cur = localStorage.getItem(KEY) || 'dark'; } catch (e) {}
  apply(cur);
  if (btn) btn.addEventListener('click', function () {
    cur = cur === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(KEY, cur); } catch (e) {}
    apply(cur);
  });
})();
"""

JS = """
(function () {
  var tabs = document.querySelectorAll('[data-tab]');
  function show(id) {
    tabs.forEach(function (b) { b.classList.toggle('on', b.dataset.tab === id); });
    document.querySelectorAll('.panel').forEach(function (p) { p.classList.toggle('on', p.id === id); });
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () { show(b.dataset.tab); history.replaceState(null, '', '#' + b.dataset.tab); window.scrollTo({ top: document.querySelector('.tabs').offsetTop, behavior: 'smooth' }); });
  });
  var h = location.hash.replace('#', '');
  show(['curatare', 'model', 'raport'].indexOf(h) >= 0 ? h : 'curatare');
  document.querySelectorAll('[data-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = document.getElementById(b.dataset.toggle);
      var on = el.classList.toggle('on');
      b.textContent = on ? b.dataset.off : b.dataset.on;
    });
  });
})();
"""


def field_html(fld: str, measure_names: set, col_names: set) -> str:
    parts = []
    for raw in [x.strip() for x in fld.split(",")]:
        s = esc(raw)
        if raw.startswith("[") and raw.strip("[]") in measure_names:
            s += '<span class="m-tag">măsură</span>'
        elif any(raw.endswith(f"[{c}]") for c in col_names):
            s += '<span class="c-tag">coloană calculată</span>'
        parts.append(s)
    return ", ".join(parts)


def section_curatare(t, d) -> str:
    blocks = cleaning_blocks(t, d)
    rows = "".join(
        f"<tr><td><b>{esc(b['name'])}</b> <span class='kind'>{esc(b['kind'].split(' ')[0])}</span></td><td class='num'>{fmt_num(b['rows'], 0)}</td><td class='num'>{len(b['cols'])}</td></tr>"
        for b in blocks)
    out = [f"""
    <section class="panel" id="curatare">
      <h2>Pasul 1 · Curățarea datelor</h2>
      <p class="lead">Datele vin din sisteme diferite și au greșeli. Le curățați în <b>Power Query</b>, fără să modificați fișierele Excel.</p>
      <div class="box intro">
        <h3>Cum începeți</h3>
        <ol>
          <li>Power BI Desktop → <b>Get data → Excel workbook</b> → alegeți primul fișier → bifați foaia → <b>Transform Data</b>.</li>
          <li><b>Important:</b> la încărcare, Power Query adaugă singur doi pași în <b>Applied Steps</b>: <i>Promoted Headers</i> și <i>Changed Type</i>. Ștergeți-i pe amândoi (✕), ca să lucrați pe datele exact cum sunt în Excel. Antetul îl alegeți voi, după ce scoateți rândurile de titlu.</li>
          <li>Repetați pentru toate cele 5 fișiere. În Power Query, în stânga, aveți câte o interogare pentru fiecare tabel. Numele interogării trebuie să fie exact numele din tabelul de mai jos (de exemplu <code>{esc(t.fact)}</code>).</li>
          <li>Rezolvați problemele fiecărui tabel, în ordinea din listă. Fiecare pas apare în dreapta, la <b>Applied Steps</b>: dacă greșiți, ștergeți pasul cu ✕.</li>
          <li>Verificați rezultatul cu cifrele de control. Abia apoi <b>Home → Close &amp; Apply</b>.</li>
        </ol>
      </div>
      <div class="box">
        <h3>Ce trebuie să obțineți</h3>
        <table class="t"><thead><tr><th>Tabel</th><th>Rânduri</th><th>Coloane</th></tr></thead><tbody>{rows}</tbody></table>
      </div>"""]
    for b in blocks:
        cols = "".join(f"<span>{esc(n)}<i>{TYPES[k]}</i></span>" for n, k in b["cols"])
        probs = "".join(f"<li>{esc(p)}</li>" for p in b["problems"])
        checks = "".join(f"<li>{c}</li>" for c in b["checks"])
        helps = "".join(f"<li>{h}</li>" for h in b["help"])
        hid = f"help-{b['key']}"
        out.append(f"""
      <article class="tcard">
        <div class="tcard-head"><h3>{esc(b['name'])}</h3><span class="kind">{esc(b['kind'])}</span><code>{esc(b['name'])}.xlsx</code></div>
        <p class="target-line">După curățare: <b>{fmt_num(b['rows'], 0)} rânduri</b> · <b>{len(b['cols'])} coloane</b></p>
        <p class="sub">Coloanele finale și tipul fiecăreia</p>
        <div class="cols">{cols}</div>
        <p class="sub">Cifre de control după curățare</p>
        <ul class="checks">{checks}</ul>
        <button type="button" class="help-btn" data-toggle="{hid}" data-on="Ajutor suplimentar: ce trebuie rezolvat și cum" data-off="Ascunde ajutorul">Ajutor suplimentar: ce trebuie rezolvat și cum</button>
        <div class="help" id="{hid}"><p class="sub">Ce trebuie rezolvat</p><ol class="probs">{probs}</ol><p class="sub">Cum faceți pașii în Power Query</p><ol>{helps}</ol></div>
      </article>""")
    out.append("""
    </section>""")
    return "".join(out)


def section_model(t) -> str:
    rel = [
        (t.fact, t.c_cli, t.t_cli, t.c_cli),
        (t.fact, t.c_prod, t.t_prod, t.c_prod),
        (t.fact, t.c_loc, t.t_loc, t.c_loc),
        (t.fact, t.c_data, "Calendar", "Data"),
    ]
    rows = "".join(
        f"<tr><td><code>{esc(a)}[{esc(b)}]</code></td><td>→</td><td><code>{esc(c)}[{esc(dd)}]</code></td><td>Many to one (*:1)</td><td>Single</td></tr>"
        for a, b, c, dd in rel)
    return f"""
    <section class="panel" id="model">
      <h2>Pasul 2 · Modelul de date (star schema)</h2>
      <p class="lead">Tabelul <b>{esc(t.fact)}</b> stă în centru. Fiecare dimensiune se leagă de el printr-o singură coloană-cheie.</p>
      <div class="box">
        <h3>Cum arată modelul</h3>
        <div class="star">
          <div class="node n1"><b>{esc(t.t_cli)}</b><span>dimensiune</span><br><span class="key">{esc(t.c_cli)}</span></div>
          <div class="node n2"><b>{esc(t.t_prod)}</b><span>dimensiune</span><br><span class="key">{esc(t.c_prod)}</span></div>
          <div class="node fact"><b>{esc(t.fact)}</b><span>fact · tabelul din centru</span></div>
          <div class="node n3"><b>{esc(t.t_loc)}</b><span>dimensiune</span><br><span class="key">{esc(t.c_loc)}</span></div>
          <div class="node n4"><b>Calendar</b><span>dimensiune de timp</span><br><span class="key">Data</span></div>
        </div>
      </div>
      <div class="box">
        <h3>Cele 4 relații, exact</h3>
        <table class="t"><thead><tr><th>Din (partea „mulți”)</th><th></th><th>În (partea „unu”)</th><th>Cardinalitate</th><th>Direcție filtru</th></tr></thead><tbody>{rows}</tbody></table>
        <p class="lead" style="margin:10px 0 0">În fiecare dimensiune, cheia apare <b>o singură dată</b> (de exemplu un client apare o dată în <code>{esc(t.t_cli)}</code>). În <code>{esc(t.fact)}</code> aceeași cheie apare de <b>multe ori</b> (un client are multe tranzacții). De aceea relația este <b>*:1</b>.</p>
      </div>
      <div class="box">
        <h3>Pașii în Power BI</h3>
        <ol>
          <li>Deschideți <b>Model view</b> (a treia pictogramă din stânga).</li>
          <li>Power BI poate crea singur unele relații. Deschideți <b>Home → Manage relationships</b> și comparați cu tabelul de mai sus. Ștergeți orice relație care nu este în listă.</li>
          <li>Pentru fiecare relație lipsă: trageți coloana din <code>{esc(t.fact)}</code> peste coloana cu același nume din dimensiune (pentru Calendar: <code>{esc(t.c_data)}</code> peste <code>Data</code>).</li>
          <li>Dublu-click pe linia relației și verificați: Cardinality = <b>Many to one (*:1)</b>, Cross filter direction = <b>Single</b>.</li>
          <li>Selectați tabelul <b>Calendar</b> → Table tools → <b>Mark as date table</b> → coloana <code>Data</code>.</li>
          <li>În Calendar, selectați coloana <code>Luna_Nume</code> → Column tools → <b>Sort by column</b> → <code>Luna</code>. Altfel lunile apar în ordine alfabetică (August, Aprilie, Decembrie…).</li>
        </ol>
        <button type="button" class="help-btn" data-toggle="help-model" data-on="Ajutor suplimentar: cum verific modelul?" data-off="Ascunde ajutorul">Ajutor suplimentar: cum verific modelul?</button>
        <div class="help" id="help-model"><ol>
          <li><b>Uitați-vă la capetele liniilor:</b> lângă dimensiune trebuie să scrie <b>1</b>, lângă <code>{esc(t.fact)}</code> trebuie să scrie <b>*</b>. Săgeata merge de la dimensiune spre fact.</li>
          <li><b>Dacă Power BI spune „many to many”</b>, cheia din dimensiune nu este unică: ați uitat să eliminați o dublură la curățare. Întoarceți-vă în Power Query (Home → Transform data).</li>
          <li><b>Dacă relația nu se poate crea pe dată</b>, una dintre coloane este încă text. Ambele (<code>{esc(t.fact)}[{esc(t.c_data)}]</code> și <code>Calendar[Data]</code>) trebuie să fie de tip Date.</li>
          <li><b>Testul final:</b> puneți un slicer cu <code>{esc(t.t_loc)}[Regiune]</code> și un card cu suma <code>Valoare_Totala</code>. Când schimbați regiunea, cardul trebuie să se schimbe. Dacă nu se schimbă, relația lipsește sau e greșită.</li>
        </ol></div>
      </div>
    </section>"""


def section_raport(t, d) -> str:
    v = measure_values(t, d)
    spec = report_spec(t, v)
    mnames = {m[0] for m in spec["measures"]}
    cnames = {c[1] for c in spec["columns"]}
    mrows = []
    for i, (name, formula, desc, val) in enumerate(spec["measures"]):
        fid = f"f-m{i}"
        mrows.append(f"<tr><td>[{esc(name)}]</td><td>{esc(desc)}<pre class='dax' id='{fid}'>{esc(name)} =\n{esc(formula)}</pre></td>"
                     f"<td class='num'>{esc(val)}</td><td><button type='button' class='f-btn' data-toggle='{fid}' data-on='Arată formula' data-off='Ascunde formula'>Arată formula</button></td></tr>")
    crows = []
    for i, (tab, name, formula, desc) in enumerate(spec["columns"]):
        fid = f"f-c{i}"
        crows.append(f"<tr><td>{esc(tab)}[{esc(name)}]</td><td>{esc(desc)} Se creează din Table view → selectați tabelul <b>{esc(tab)}</b> → Table tools → <b>New column</b>.<pre class='dax' id='{fid}'>{esc(name)} =\n{esc(formula)}</pre></td>"
                     f"<td><button type='button' class='f-btn' data-toggle='{fid}' data-on='Arată formula' data-off='Ascunde formula'>Arată formula</button></td></tr>")
    pages_html = []
    rng = random.Random(t.seed + 77)
    for pi, (title, story, kpis, charts, slicers) in enumerate(spec["pages"], start=1):
        charts = [("Card", [("Câmp", f"[{k}]")]) for k in kpis] + charts[:] + [("Slicer", [("Câmp", sl)]) for sl in slicers]
        rng.shuffle(charts)
        vis = []
        for j, (typ, fields) in enumerate(charts):
            dl = "".join(f"<dt>{esc(r)}</dt><dd>{field_html(f, mnames, cnames)}</dd>" for r, f in fields)
            base = spec['measures'][0][0]   # măsura de bază (SUM) nu mai e repetată la fiecare vizual
            needs = sorted({x.strip().strip('[]') for _, f in fields for x in f.split(',') if x.strip().startswith('[') and x.strip().strip('[]') in mnames} - {base})
            needc = sorted({c for _, f in fields for c in cnames if f"[{c}]" in f})
            need = ""
            if needs or needc:
                need = "<p class='need'>Înainte creați: " + ", ".join([f"măsura <b>[{esc(x)}]</b>" for x in needs] + [f"coloana calculată <b>{esc(x)}</b>" for x in needc]) + ".</p>"
            vis.append(f"<article><h4><span class='vl'>{chr(65 + j)}</span>{esc(typ)}</h4><dl>{dl}</dl>{need}</article>")
        pages_html.append(f"""
      <article class="rpage">
        <span class="pn">Pagina {pi} din 2</span>
        <h3>{esc(title)}</h3>
        <p class="sub">Povestea paginii</p>
        <p class="story">{esc(story)}</p>
        <p class="sub">Ce puneți pe pagină</p>
        <div class="vis">{''.join(vis)}</div>
      </article>""")
    return f"""
    <section class="panel" id="raport">
      <h2>Pasul 3 · Raportul (2 pagini)</h2>
      <p class="lead">Fiecare pagină are o poveste: o întrebare la care trebuie să răspundă. Pentru fiecare pagină primiți cardurile KPI, vizualele (cu câmpurile exacte) și slicerele. <b>Vizualele sunt date în ordine amestecată:</b> voi decideți unde stă fiecare în pagină, ca povestea să se citească de sus în jos.</p>
      <div class="box intro">
        <h3>Ordinea de lucru</h3>
        <ol>
          <li>Creați întâi <b>măsurile</b> și <b>coloanele calculate</b> de mai jos. Selectați tabelul <code>{esc(t.fact)}</code> în panoul Data, apoi Home → <b>New measure</b>.</li>
          <li>Verificați fiecare măsură într-un card: fără filtre trebuie să dea exact valoarea din tabel.</li>
          <li>Construiți pagina 1, apoi pagina 2: carduri KPI, vizuale, slicere.</li>
          <li>Unde scrie <b>Filtru pe vizual</b>: selectați vizualul → panoul <b>Filters</b> → secțiunea <i>Filters on this visual</i> → trageți câmpul și setați condiția (pentru Top N: Filter type = <b>Top N</b>).</li>
          <li>Formatați fiecare vizual (vezi lista de mai jos) și dați fiecărei pagini un titlu.</li>
        </ol>
      </div>
      <div class="box">
        <h3>Măsuri de creat</h3>
        <table class="t meas"><thead><tr><th>Măsura</th><th>Ce calculează</th><th>Fără filtre</th><th></th></tr></thead><tbody>{''.join(mrows)}</tbody></table>
      </div>
      <div class="box">
        <h3>Coloane calculate</h3>
        <table class="t meas"><thead><tr><th>Coloana</th><th>Ce face</th><th></th></tr></thead><tbody>{''.join(crows)}</tbody></table>
      </div>
      <div class="box">
        <h3>Formatare · pentru fiecare vizual</h3>
        <ul class="fmt">
          <li><b>Titlu</b> care spune ce arată vizualul, nu numele câmpurilor („Vânzări pe luni, 2024 vs 2025”).</li>
          <li><b>Data labels</b> pornite unde ajută la citire; numere rotunjite (mii, fără zecimale inutile).</li>
          <li><b>Culori:</b> o culoare principală pentru toată pagina și aceeași culoare pentru aceeași categorie peste tot.</li>
          <li><b>Sortare:</b> barele de la cea mai mare la cea mai mică; lunile în ordinea calendarului.</li>
          <li><b>Axe:</b> titluri clare sau scoase dacă se înțelege; fără gridlines inutile.</li>
          <li><b>Carduri KPI:</b> etichetă scurtă, unitate (lei, %), același stil pe toate.</li>
          <li><b>Slicere:</b> stil Dropdown sau Tile, aliniate, cu titlu.</li>
          <li><b>Pagina:</b> un titlu sus, vizualele aliniate și de aceeași dimensiune unde se poate.</li>
        </ul>
      </div>
      {''.join(pages_html)}
      <div class="box intro">
        <h3>Ce predați</h3>
        <p class="deadline">Raportul se publică în <b>Power BI Service</b> cel târziu <b>marți, ora 17:00</b>.</p>
        <ol>
          <li>Publicați raportul: în Power BI Desktop, <b>Home → Publish</b> → alegeți workspace-ul cursului. Verificați în browser că ambele pagini se deschid.</li>
          <li>Fișierul <b>.pbix</b> cu cele 5 tabele curățate, modelul star și cele 2 pagini.</li>
          <li>La prezentare: pentru fiecare pagină, spuneți povestea în 2–3 propoziții și ce ați aflat din date.</li>
        </ol>
      </div>
    </section>"""


def write_team_page(team_dir: Path, t, d) -> None:
    color = t.color
    files = [(t.fact, "fact · tranzacțiile"), (t.t_cli, "dimensiune"), (t.t_prod, "dimensiune"),
             (t.t_loc, "dimensiune"), ("Calendar", "dimensiune de timp")]
    files_html = "".join(
        f'<a class="file" href="{esc(n)}.xlsx" download><span class="xl">XLSX</span><h3>{esc(n)}.xlsx</h3><p>{esc(k)}</p></a>' for n, k in files)
    ctx = "".join(f"<p>{esc(p)}</p>" for p in t.context)
    page = f"""<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Temă · {esc(t.company)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <style>{CSS.replace('#DC2626', color).replace('--c: #DC2626', '--c: ' + color)}</style>
  <style>:root {{ --c: {color}; }}</style>
</head>
<body>
  <main>
    <div class="topbar"><a class="back" href="../index.html">← Toate seturile de date</a><button type="button" class="theme-btn" data-theme-btn>☀ Temă deschisă</button></div>
    <header class="hero">
      <span class="badge">Temă · Sesiunea 6</span>
      <h1>{esc(t.company)}</h1>
      <p class="tag">{esc(t.tagline)}</p>
      <div class="context">{ctx}</div>
    </header>
    <div class="files">{files_html}</div>

    <nav class="tabs">
      <button type="button" data-tab="curatare"><span class="tn">1</span><span><b>Curățare</b><small>Power Query · 5 tabele</small></span></button>
      <button type="button" data-tab="model"><span class="tn">2</span><span><b>Model</b><small>star schema · 4 relații</small></span></button>
      <button type="button" data-tab="raport"><span class="tn">3</span><span><b>Raport</b><small>2 pagini · KPI, vizuale, slicere</small></span></button>
    </nav>
    {section_curatare(t, d)}
    {section_model(t)}
    {section_raport(t, d)}
  </main>
  <script>{THEME_JS}{JS}</script>
</body>
</html>
"""
    (team_dir / "tema.html").write_text(page, encoding="utf-8")
    (team_dir / "CITESTE_MAI_INTAI.txt").write_text(
        f"""Temă Sesiunea 6 · {t.company} ({t.tagline})
==============================================

Cerințele complete: tema.html (Curățare · Model · Raport).

Fișiere (date murdare, se curăță în Power Query):
  {t.fact}.xlsx  - fact (tranzacțiile)
  {t.t_cli}.xlsx, {t.t_prod}.xlsx, {t.t_loc}.xlsx, Calendar.xlsx - dimensiuni

Model: star schema, {t.fact} în centru, 4 relații *:1.
Raport: 2 pagini.
""", encoding="utf-8")


def write_index(out: Path, teams) -> None:
    cards = "".join(
        f'<a class="team" href="{t.folder}/tema.html" style="--c:{t.color}"><span class="dot"></span><b>{esc(t.company)}</b><span>{esc(t.tagline)}</span></a>'
        for t in teams)
    page = f"""<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Temă · Sesiunea 6</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {{ --bg: #0b1120; --surface: #131c2e; --line: #2a3850; --text: #f1f5f9; --text-2: #cbd5e1; --text-3: #94a3b8; --link: #6ee7b7; color-scheme: dark; }}
    [data-theme="light"] {{ --bg: #f5f6f7; --surface: #ffffff; --line: #e5e7eb; --text: #111827; --text-2: #4b5563; --text-3: #6b7280; --link: #059669; color-scheme: light; }}
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; font-family: Inter, system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.55; }}
    .topbar {{ display: flex; justify-content: space-between; align-items: center; }}
    .theme-btn {{ font: inherit; cursor: pointer; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--text-2); font-size: 0.85rem; font-weight: 600; }}
    main {{ max-width: 900px; margin: 0 auto; padding: 28px 20px 60px; }}
    a.back {{ color: var(--link); font-weight: 600; text-decoration: none; }}
    h1 {{ margin: 14px 0 4px; font-size: 2rem; letter-spacing: -0.03em; }}
    p.lead {{ margin: 0 0 22px; color: var(--text-2); }}
    .steps {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }}
    .steps div {{ padding: 14px 16px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); }}
    .steps b {{ display: block; font-size: 1.05rem; }}
    .steps span {{ font-size: 0.88rem; color: var(--text-3); }}
    .teams {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }}
    .team {{ display: flex; flex-direction: column; gap: 2px; padding: 18px 20px; border-radius: 16px; background: var(--surface); border: 1px solid var(--line); border-left: 6px solid var(--c); color: var(--text); text-decoration: none; }}
    .team:hover {{ box-shadow: 0 4px 18px rgba(0,0,0,.07); }}
    .team b {{ font-size: 1.1rem; font-weight: 600; color: color-mix(in srgb, var(--c) 60%, white); }}
    [data-theme="light"] .team b {{ color: var(--c); }}
    .team span {{ color: var(--text-2); }}
    .team .dot {{ display: none; }}
    @media (max-width: 720px) {{ .teams, .steps {{ grid-template-columns: 1fr; }} }}
  </style>
</head>
<body>
  <main>
    <div class="topbar"><a class="back" href="../index.html">← Înapoi la Sesiunea 6</a><button type="button" class="theme-btn" data-theme-btn>☀ Temă deschisă</button></div>
    <h1>Temă · alege un set de date</h1>
    <p class="lead">Fiecare set are 5 fișiere Excel cu date murdare. Pagina setului arată exact ce trebuie făcut, în trei pași.</p>
    <div class="steps">
      <div><b>1 · Curățare</b><span>Power Query: câte rânduri și coloane trebuie să rămână în fiecare tabel.</span></div>
      <div><b>2 · Model</b><span>Star schema: ce coloană se leagă de care.</span></div>
      <div><b>3 · Raport</b><span>2 pagini: KPI, vizuale, slicere, măsuri DAX.</span></div>
    </div>
    <div class="teams">{cards}</div>
  </main>
  <script>{THEME_JS}</script>
</body>
</html>
"""
    (out / "index.html").write_text(page, encoding="utf-8")
