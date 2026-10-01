# -*- coding: utf-8 -*-
"""Scrie brief-ul proiect-echipa.html pentru fiecare echipă S5 (fără a regenera datele).

Rulare: python build_team_briefs.py
"""
from __future__ import annotations

from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SESSION_S05 = ROOT.parent.parent / "sesiuni" / "s05"

# Cum se numesc „lucrurile” în fiecare industrie (pentru descrierea fișierelor)
NOUNS = {
    "echipa_rosu": dict(purpose="Raportul e pentru managementul GustRo: să înțeleagă performanța rețelei, nu doar un total.", line="un produs de pe o comandă", product="Meniul: preparate, băuturi, deserturi și pachete de catering",
                        location="Restaurantele și punctele de vânzare"),
    "echipa_albastru": dict(purpose="Raportul sprijină decizii despre încărcarea centrelor și mixul servicii vs piese.", line="o lucrare sau o piesă de pe o factură de service", product="Serviciile și piesele: manoperă, ITP, anvelope, frâne, lubrifianți",
                            location="Centrele de service"),
    "echipa_verde": dict(purpose="Managerii regionali compară farmaciile și categoriile de asortiment.", line="un produs vândut pe un bon sau o comandă", product="Produsele: OTC, RX, cosmetice, suplimente",
                         location="Farmaciile (inclusiv canalul online)"),
    "echipa_galben": dict(purpose="Conducerea urmărește volumul pe regiuni și mixul materiale vs unelte.", line="un produs de pe o comandă", product="Produsele: materiale, finisaje, unelte, instalații",
                          location="Depozitele (inclusiv portalul B2B)"),
}

ISSUES = [
    "rânduri de titlu deasupra tabelului și rânduri de subsol sau de total sub el",
    "rânduri de antet duble și rânduri complet goale",
    "rânduri duplicate și ID-uri care apar de două ori într-un tabel de descrieri",
    "text în coloane numerice: unități („buc”), procente („%”), monedă („lei”), cifre scrise în litere",
    "zecimale cu virgulă în loc de punct",
    "aceeași valoare scrisă diferit: majuscule, spații în plus, prescurtări, cratimă lipsă",
    "date în formate diferite sau date imposibile",
    "celule goale care trebuie completate din rândul de deasupra (fill down)",
]


def _cap(t: str) -> str:
    return t[:1].upper() + t[1:]


def write_brief(team_dir: Path, team) -> None:
    n = NOUNS[team.folder]
    color = team.color
    members = "".join(f"<li>{escape(m)}</li>" for m in team.members)

    files = [
        ("Vanzari.xlsx", f"Liniile de vânzare ({escape(team.fact_title)}). O linie = {n['line']}: cantitate, preț, discount, valori, canal de vânzare, status plată.", "128 linii"),
        ("Clienti.xlsx", "Clienții: denumire, tip (persoană fizică sau juridică), oraș, regiune, segment.", "28 clienți"),
        ("Produse.xlsx", f"{n['product']}. Categorie, subcategorie, brand, preț de catalog.", "18 produse"),
        ("Magazine.xlsx", f"{n['location']}: oraș, județ, regiune, format, coordonate.", "10 locații"),
        ("Date.xlsx", "Calendarul: o zi pe rând, 2022–2025, cu an, trimestru, lună, zi a săptămânii.", "1.461 zile"),
    ]
    files_html = "".join(
        f'<article class="file"><span class="xl">XLSX</span><h3>{f}</h3></article>'
        for f, d, c in files
    )
    issues_html = "".join(f"<li>{i}</li>" for i in ISSUES)

    pages_html = []
    for idx, (ptitle, focus, questions, recs) in enumerate(team.pages, start=1):
        q_items = "".join(f"<li>{q}</li>" for q in questions)
        r_items = "".join(f"<li>{_cap(r.replace('Recomandare: ', ''))}</li>" for r in recs)
        pages_html.append(f"""
        <article class="rpage">
          <span class="pn">Pagina {idx}</span>
          <h3>{ptitle}</h3>
          <p class="focus">{focus}</p>
          <h4>Întrebări la care răspunde pagina</h4>
          <ol class="qs">{q_items}</ol>
          <h4 class="soft">Vizuale sugerate (opțional)</h4>
          <ul class="recs">{r_items}</ul>
        </article>""")

    html = f"""<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{team.label} · Proiect · {team.company}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {{
      --c: {color};
      --soft: color-mix(in srgb, {color} 10%, white);
      --line: #e5e7eb;
      --text: #111827;
      --text-2: #4b5563;
      --text-3: #6b7280;
    }}
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; font-family: Inter, system-ui, sans-serif; background: #f5f6f7; color: var(--text); line-height: 1.55; }}
    main {{ max-width: 980px; margin: 0 auto; padding: 22px 20px 64px; }}
    a {{ color: var(--c); font-weight: 600; text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    .back {{ display: inline-block; margin-bottom: 14px; font-size: 0.92rem; }}

    .hero {{ position: relative; overflow: hidden; padding: 28px 30px; border-radius: 18px; background: #fff; border: 1px solid var(--line); }}
    .hero::before {{ content: ""; position: absolute; inset: 0 0 auto 0; height: 6px; background: var(--c); }}
    .badge {{ display: inline-block; padding: 4px 12px; border-radius: 999px; background: var(--c); color: #fff; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }}
    .hero h1 {{ margin: 12px 0 2px; font-size: 2rem; letter-spacing: -0.03em; }}
    .tag {{ margin: 0 0 16px; color: var(--text-3); }}
    .hero-grid {{ display: grid; grid-template-columns: 1.6fr 1fr; gap: 18px; }}
    .context p {{ margin: 0 0 8px; color: var(--text-2); }}
    .members {{ padding: 14px 16px; border-radius: 12px; background: var(--soft); }}
    .members strong {{ display: block; margin-bottom: 6px; font-size: 0.78rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--c); }}
    .members ul {{ margin: 0; padding: 0; list-style: none; display: grid; gap: 3px; font-weight: 600; }}

    .stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0 26px; }}
    .stats div {{ padding: 12px 14px; border-radius: 12px; background: #fff; border: 1px solid var(--line); }}
    .stats b {{ display: block; font-size: 1.4rem; color: var(--c); line-height: 1.1; }}
    .stats span {{ font-size: 0.84rem; color: var(--text-2); }}

    section {{ margin-top: 30px; }}
    h2 {{ display: flex; align-items: center; gap: 10px; margin: 0 0 6px; font-size: 1.3rem; letter-spacing: -0.02em; }}
    h2 .n {{ display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: var(--c); color: #fff; font-size: 0.9rem; }}
    .lead {{ margin: 0 0 14px; color: var(--text-2); }}

    .files {{ display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }}
    .file {{ display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: center; padding: 12px 16px; border-radius: 12px; background: #fff; border: 1px solid var(--line); }}
    .xl {{ padding: 5px 8px; border-radius: 6px; background: #e7f5ec; color: #1d6f42; font-size: 0.7rem; font-weight: 800; }}
    .file h3 {{ margin: 0; font-size: 1rem; }}
    .file p {{ margin: 2px 0 0; font-size: 0.9rem; color: var(--text-2); }}
    .cnt {{ font-size: 0.8rem; font-weight: 700; color: var(--text-3); white-space: nowrap; }}
    .note {{ margin-top: 10px; padding: 10px 14px; border-radius: 10px; background: var(--soft); font-size: 0.92rem; color: var(--text-2); }}
    .note strong {{ color: var(--text); }}

    .steps {{ display: grid; gap: 10px; }}
    .step {{ display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 14px; padding: 12px 18px; border-radius: 14px; background: #fff; border: 1px solid var(--line); }}
    .step .sn {{ display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: var(--soft); color: var(--c); font-weight: 800; font-size: 1.05rem; }}
    .step h3 {{ margin: 0; font-size: 1.05rem; }}
    .step p {{ margin: 0 0 6px; color: var(--text-2); }}
    .step ul {{ margin: 6px 0 8px; padding-left: 1.15rem; color: var(--text-2); font-size: 0.93rem; }}
    .step li {{ margin: 3px 0; }}
    .done {{ display: inline-block; margin-top: 4px; padding: 4px 10px; border-radius: 8px; background: #ecfdf5; color: #047857; font-size: 0.86rem; font-weight: 600; }}
    .done::before {{ content: "✓ "; font-weight: 800; }}

    .rules {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }}
    .rule {{ padding: 14px 16px; border-radius: 12px; background: #fff; border: 1px solid var(--line); border-left: 4px solid var(--c); }}
    .rule h3 {{ margin: 0 0 4px; font-size: 0.98rem; }}
    .rule p {{ margin: 0; font-size: 0.92rem; color: var(--text-2); }}

    .pages {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }}
    .rpage {{ padding: 18px 20px; border-radius: 14px; background: #fff; border: 1px solid var(--line); }}
    .pn {{ display: inline-block; padding: 3px 10px; border-radius: 999px; background: var(--soft); color: var(--c); font-size: 0.74rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }}
    .rpage h3 {{ margin: 8px 0 4px; font-size: 1.12rem; }}
    .focus {{ margin: 0 0 12px; color: var(--text-2); font-size: 0.93rem; }}
    .rpage h4 {{ margin: 12px 0 6px; font-size: 0.82rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text); }}
    .rpage h4.soft {{ color: var(--text-3); }}
    .qs {{ margin: 0; padding-left: 1.2rem; }}
    .qs li {{ margin: 4px 0; }}
    .recs {{ margin: 0; padding-left: 1.1rem; color: var(--text-3); font-size: 0.9rem; }}
    .recs li {{ margin: 3px 0; }}

    @media (max-width: 760px) {{
      .hero-grid, .rules, .pages {{ grid-template-columns: 1fr; }}
      .stats {{ grid-template-columns: 1fr 1fr; }}
      .files {{ grid-template-columns: 1fr 1fr; }}
      .hero {{ padding: 22px 18px; }}
    }}
  </style>
</head>
<body>
  <main>
    <a class="back" href="../index.html">← Înapoi la Sesiunea 5</a>

    <header class="hero">
      <span class="badge">{team.label}</span>
      <h1>{team.company}</h1>
      <p class="tag">{team.tagline} · {team.industry}</p>
      <div class="hero-grid">
        <div class="context">
          <p>{team.context}</p>
          <p>{n['purpose']}</p>
        </div>
        <div class="members"><strong>Membri echipă</strong><ul>{members}</ul></div>
      </div>
    </header>

    <div class="stats">
      <div><b>5</b><span>fișiere Excel cu date brute</span></div>
      <div><b>1</b><span>model star în Power BI</span></div>
      <div><b>4</b><span>pagini de raport</span></div>
      <div><b>3–4</b><span>vizuale pe pagină</span></div>
    </div>

    <section>
      <h2><span class="n">1</span>Ce găsiți în folder</h2>
      <div class="files">{files_html}</div>
    </section>

    <section>
      <h2><span class="n">2</span>Pașii proiectului</h2>
      <div class="steps">
        <article class="step"><span class="sn">1</span><h3>Explorați datele</h3></article>
        <article class="step"><span class="sn">2</span><h3>Curățați datele în Power Query</h3></article>
        <article class="step"><span class="sn">3</span><h3>Stabiliți fact și dimensiuni</h3></article>
        <article class="step"><span class="sn">4</span><h3>Setați tipurile de date și construiți modelul</h3></article>
        <article class="step"><span class="sn">5</span><h3>Construiți raportul de 4 pagini</h3></article>
      </div>
    </section>

    <section>
      <h2><span class="n">3</span>Raportul: cele 4 pagini</h2>
      <p class="lead">Raportul este pentru managementul {team.company}. Fiecare pagină răspunde unui alt om din firmă.</p>
      <div class="pages">{''.join(pages_html)}
      </div>
    </section>
  </main>
</body>
</html>
"""
    (team_dir / "proiect-echipa.html").write_text(html, encoding="utf-8")


def main() -> None:
    import generate_s05_echipe as ge

    for team in ge.TEAMS:
        write_brief(SESSION_S05 / team.folder, team)
        print("OK:", team.folder)


if __name__ == "__main__":
    main()
