import html
from pathlib import Path


def wells(*pairs):
    return '<div class="s5-wells">' + "".join(
        f"<div><strong>{html.escape(a)}</strong> {html.escape(b)}</div>" for a, b in pairs
    ) + "</div>"


def steps(*items):
    return "<ol>" + "".join(f"<li>{html.escape(x)}</li>" for x in items) + "</ol>"


def slide(eyebrow, title, lead, chart_id, variants, tabs, category):
    var = ""
    if variants:
        btns = []
        for i, (vid, lbl) in enumerate(variants):
            btns.append(
                f'<button type="button" class="{"is-on" if i == 0 else ""}" data-s5-variant="{vid}">{html.escape(lbl)}</button>'
            )
        var = f'<div class="s5-chart-toolbar" data-s5-variant-toggle>{"".join(btns)}</div>'
    tbtns, panels = [], []
    for i, (tid, lbl, body) in enumerate(tabs):
        tbtns.append(
            f'<button type="button" class="{"is-on" if i == 0 else ""}" data-s3-cat-btn="{tid}" aria-selected="{"true" if i == 0 else "false"}">'
            f'<span class="n">{i+1:02d}</span>{html.escape(lbl)}</button>'
        )
        panels.append(
            f'<div class="s4-tema-panel{" is-on" if i == 0 else ""}" data-s3-cat-panel="{tid}"{" hidden" if i else ""}>{body}</div>'
        )
    cat = f'<p class="s5-cat-badge">{html.escape(category)}</p>' if category else ""
    return f"""      <article class="slide s5-chart-slide">
        <span class="slide-eyebrow">Vizualizări · {html.escape(eyebrow)}</span>
        <h2>{html.escape(title)}</h2>
        {cat}
        <p class="s3-lead s5-chart-lead">{html.escape(lead)}</p>
        <div class="s5-chart-stage">
          <div class="s5-chart-box">
            {var}
            <div data-s5-chart="{chart_id}"></div>
          </div>
          <div class="s4-tema-switch" data-s3-cat>
            <div class="s4-tema-tabs" role="tablist">{"".join(tbtns)}</div>
            {"".join(panels)}
          </div>
        </div>
      </article>
"""


def T(use, ex, build, q, data, warn):
    return [
        ("use", "La ce folosește", f"<p>{use}</p>"),
        ("ex", "Exemple reale", f"<ul>{''.join(f'<li>{html.escape(x)}</li>' for x in ex)}</ul>"),
        ("build", "Cum îl construiești", build),
        ("q", "Întrebări la care răspunde", f"<ul>{''.join(f'<li>{html.escape(x)}</li>' for x in q)}</ul>"),
        ("data", "Date potrivite", f"<p>{data}</p>"),
        ("warn", "Atenție / alternativă", f"<p>{warn}</p>"),
    ]


charts = [
    slide(
        "Comparație",
        "Stacked column chart",
        "Valoare totală pe grup, împărțită în segmente colorate pe fiecare coloană.",
        "stacked-column",
        [("stacked", "Stacked"), ("clustered", "Clustered")],
        T(
            "Arată o valoare totală, împărțită pe categorii, pentru mai multe grupuri comparate unul lângă altul. Fiecare coloană e o stivă de segmente.",
            [
                "Vânzări lunare supermarket pe categorii (lactate, băuturi, panificație)",
                "Buget departament pe tipuri de cheltuieli, pe trimestre",
            ],
            steps(
                "Selectezi vizualul Stacked column chart.",
                "Câmp categorial principal (ex. luna) → X-axis.",
                "Măsura (ex. SUM(Vânzări)) → Y-axis.",
                "Al doilea câmp categorial (ex. categorie produs) → Legend (transformă coloana în segmente).",
            )
            + "<p>Minim: X-axis + măsură pe Y-axis. Legend adaugă segmentarea. Column cu mai multe măsuri pe Y-axis nu suportă Legend simultan.</p>",
            ["Cât a fost totalul pe fiecare lună, și din ce s-a compus?"],
            "Categorie principală pe X (timp sau grup), categorie secundară pe Legend (4–6 segmente lizibile), o măsură agregabilă.",
            "Peste 6–7 segmente, culorile devin greu de distins. Dacă interesează doar procentul, nu valoarea absolută → 100% Stacked column.",
        ),
        "Comparație · Parte din întreg",
    ),
    slide(
        "Comparație",
        "Stacked bar chart (orizontal)",
        "Aceeași logică ca stacked column; categoriile stau pe axa verticală.",
        "stacked-bar",
        [("stacked", "Stacked"), ("clustered", "Clustered")],
        T(
            "Identic cu stacked column, dar orizontal: categoriile pe Y, valorile pe X.",
            [
                "Tichete suport pe agent, defalcate pe prioritate (urgent, mediu, scăzut)",
            ],
            wells(
                ("Y-axis", "Agent (dimensiune)"),
                ("X-axis", "SUM(Ore) sau COUNT(Ticket)"),
                ("Legend", "Prioritate"),
            )
            + "<p>Field wells ca la column; se schimbă doar orientarea vizualului.</p>",
            ["Care agent are cele mai multe tichete, și cum se împart pe priorități?"],
            "Nume de categorii lungi sau multe rânduri; sortare descrescător după total.",
            "Aceleași limite ca la stacked column. Pentru o singură serie simplă, bar simplu e suficient.",
        ),
        "Comparație",
    ),
    slide(
        "Parte din întreg",
        "100% stacked bar / column",
        "Fiecare bară sau coloană ajunge la 100%; vezi proporția, nu mărimea absolută.",
        "pct-stacked",
        [("100", "100%"), ("stacked", "Absolut")],
        T(
            "Fiecare bară/colonă are exact 100%, indiferent de totalul absolut. Util când interesează strict structura procentuală.",
            [
                "Ponderea plăților (card, numerar, online) în fiecare magazin",
            ],
            wells(
                ("Axis", "Magazin sau lună"),
                ("Legend", "Metodă plată"),
                ("Values", "SUM(Tranzacții) (Power BI calculează %)"),
            )
            + "<p>Aceleași field wells ca stacked; alegi tipul 100% stacked din Visualizations pane.</p>"
            + "<p><strong>Demo:</strong> comută 100% ↔ absolut pe același set: stacked arată mărimea, 100% arată doar structura.</p>",
            ["Cum se compară structura procentuală între grupuri, indiferent de mărimea totală?"],
            "Aceeași măsură, o dimensiune pentru bară, una pentru segment.",
            "Pierzi mărimea absolută: două magazine cu volume diferite pot arăta identic dacă structura % coincide.",
        ),
        "Parte din întreg",
    ),
    slide(
        "Evoluție în timp",
        "Line chart",
        "Puncte conectate: tendințe, sezonalitate, schimbări pe termen lung.",
        "line",
        None,
        T(
            "Date continue în timp, afișate ca linii. Potrivit pentru evoluție și comparație între serii.",
            [
                "Vizitatori pe zi pe site",
                "Temperatură medie lunară",
            ],
            steps(
                "Câmp de timp → X-axis.",
                "Măsură numerică → Y-axis.",
                "Opțional, categorie → Legend (linii multiple).",
            )
            + "<p>Familie înrudită: Line, Area, Stacked area, 100% stacked area (alegi din Visualizations pane).</p>"
            + "<p><strong>Dim_Date:</strong> axa X poate fi Categorical (distanță egală) sau Continuous (scară reală de timp). Cu date table marcat, zilele fără evenimente pot apărea corect; fără el, linia sare peste goluri.</p>",
            ["Cum a evoluat valoarea în timp?"],
            "Axă timp + măsură; opțional Legend pentru 2–4 serii.",
            "Peste 4–5 linii devine ilizibil (spaghetti). Alternativă: filtru pe o serie sau small multiples.",
        ),
        "Evoluție în timp",
    ),
    slide(
        "Evoluție în timp",
        "Area chart (stacked area)",
        "Line chart cu suprafața colorată; stacked area arată volumul compus în timp.",
        "area",
        None,
        T(
            "Ca line chart, dar zona sub linie e colorată. Stacked area accentuează volumul acumulat pe surse.",
            [
                "Consum energie casă: rețea vs panouri solare",
            ],
            wells(
                ("X-axis", "Dată"),
                ("Y-axis", "SUM(kWh)"),
                ("Legend", "Sursă energie"),
            )
            + "<p>La stacked area, seriile se suprapun ca părți ale unui total, nu se intersectează ca linii separate.</p>",
            ["Cum a evoluat volumul total, și din ce s-a compus de-a lungul timpului?"],
            "Timp + 2–4 serii aditive.",
            "Seriile din spate devin greu de citit dacă nu sunt stacked. Dacă interesează comparația directă între serii → line simplu, fără umplere.",
        ),
        "Evoluție în timp",
    ),
    slide(
        "Evoluție în timp",
        "Line and stacked column chart",
        "Coloane stacked pentru un total compus; linie pentru o a doua măsură (adesea rată sau %).",
        "combo",
        None,
        T(
            "Două măsuri cu scări diferite: coloane = volume compuse, linie = rată sau index.",
            [
                "Venit lunar pe categorii (coloane) + marjă % (linie)",
            ],
            steps(
                "Câmp de timp → X-axis.",
                "Prima măsură (venit) → Column y-axis (+ Legend pentru categorii).",
                "A doua măsură (marjă %) → Line y-axis.",
            )
            + "<p><strong>Pas critic:</strong> dacă venitul e în mii/milioane și marja e 0–100%, activează axa secundară în Format, altfel linia pare plată.</p>",
            ["Cum evoluează totalul compus, comparat cu o rată sau un procent derivat?"],
            "Axă timp + măsuri cu unități diferite (lei vs %).",
            "Intersecția linie–coloane depinde de scările alese; nu e neapărat un eveniment din date.",
        ),
        "Evoluție în timp",
    ),
    slide(
        "Contribuție sau pași",
        "Waterfall chart",
        "De la start la final, pas cu pas, prin creșteri și scăderi cumulate.",
        "waterfall",
        None,
        T(
            "Efect cumulativ al valorilor pozitive și negative introduse secvențial.",
            [
                "De la venit la profit net (costuri, taxe, salarii)",
                "Sold cont bancar pe lună, tranzacție cu tranzacție",
            ],
            steps(
                "Câmp categorial (etape) → Category.",
                "Măsură cu semn (+ creștere, − scădere) → Y-axis.",
                "Opțional → Breakdown (subcategorie pe fiecare pas).",
            )
            + "<p>Sursa trebuie să aibă deja semn corect; graficul colorează (verde/roșu/gri), nu deduce direcția.</p>",
            ["Ce factori au contribuit, pas cu pas, la rezultatul final?"],
            "Pași ordonați, valori cu semn; totaluri marcate explicit.",
            "Prea multe categorii → grupează în „Altele”. Greșeală frecventă: toate valorile pozitive → doar creșteri, fără sens.",
        ),
        "Contribuție sau pași",
    ),
    slide(
        "Contribuție sau pași",
        "Funnel chart",
        "Proces secvențial cu pierderi la fiecare etapă.",
        "funnel",
        None,
        T(
            "Pipeline sau conversie: lățimea = volumul rămas la fiecare etapă.",
            [
                "E-commerce: vizite → coș → checkout → plată",
                "Recrutare: aplicare → interviu → ofertă → angajare",
            ],
            steps(
                "Etapă proces → Group (sau Category).",
                "Număr cazuri → Values.",
            )
            + "<p>Ordinea etapelor trebuie logică, nu alfabetică: folosește coloană de sortare (Sort by column).</p>"
            + "<p>La hover: rată de conversie între etape consecutive.</p>",
            ["Unde se pierd cei mai mulți oameni sau cazuri în acest proces?"],
            "Etape exclusive, ordonate, aceeași populație prin funnel.",
            "Dacă volumele nu scad strict, forma de pâlnie se rupe. Alternativă: bar chart sortat pe etape.",
        ),
        "Contribuție sau pași",
    ),
    slide(
        "Relație între măsuri",
        "Scatter chart",
        "Fiecare punct = o entitate; poziția arată două (sau trei) măsuri.",
        "scatter",
        None,
        T(
            "Corelație sau tipar între măsuri numerice; fiecare punct e o entitate (magazin, produs).",
            [
                "Buget reclamă vs vânzări, pentru fiecare magazin",
            ],
            steps(
                "Prima măsură → X Axis.",
                "A doua măsură → Y Axis.",
                "Opțional, a treia măsură → Size (bule).",
                "Opțional, categorie → Legend; dată → Play Axis (animație).",
            )
            + "<p>Dacă mai multe rânduri au aceleași X/Y, pune ID unic în Details, altfel Power BI le agregă într-un singur punct.</p>",
            ["Există legătură între aceste două măsuri? Cine e outlier?"],
            "Două măsuri continue + opțional Size, Legend; nu funcționează bine cu date pur categoriale.",
            "Corelația vizuală nu înseamnă cauzalitate.",
        ),
        "Relație între măsuri",
    ),
    slide(
        "Parte din întreg",
        "Treemap",
        "Ierarhii ca dreptunghiuri imbricate; mărimea = valoarea numerică.",
        "treemap",
        None,
        T(
            "Parte-din-întreg cu multe categorii: vezi rapid outlierii ca dreptunghiuri mari sau mici.",
            [
                "Buget primărie pe departamente și subdepartamente",
                "Consum spațiu stocare pe echipe",
            ],
            steps(
                "Câmp categorial (mai multe niveluri) → Category.",
                "Măsură → Values (mărimea dreptunghiului).",
            )
            + "<p>Preferat față de bar când ai 20+ categorii: ochiul găsește dominanții fără listă lungă.</p>",
            ["Cum se distribuie totalul pe multe categorii, și care ies în evidență?"],
            "Ierarhie + o măsură; drill-down pe niveluri.",
            "Categorii mici → text ilizibil. Alternativă: Matrix/Table pentru valori exacte; Decomposition tree pentru „de ce”.",
        ),
        "Parte din întreg",
    ),
    slide(
        "Detaliu și cauze",
        "Matrix",
        "Pivot: rânduri × coloane, valori la intersecție, ierarhii și subtotaluri.",
        "matrix",
        None,
        T(
            "Ca pivot în Excel: încrucișare pe două dimensiuni, agregare la intersecție, expand pe ierarhii.",
            [
                "Vânzări pe regiune (rânduri) și trimestru (coloane)",
            ],
            steps(
                "Dimensiune → Rows (poate fi ierarhie: Țară → Regiune).",
                "Altă dimensiune → Columns.",
                "Măsură → Values (Sum, Average, Count…).",
            )
            + "<p><strong>Matrix vs Table:</strong> Table = listă plată, un rând per înregistrare. Matrix = a treia dimensiune (rând × coloană) + subtotaluri și drill-down.</p>",
            ["Cum se compară o măsură pe două dimensiuni, cu detaliu la cerere?"],
            "Dimensiuni pe rând/coloană, măsuri în celule; 1–2 niveluri vizibile simultan.",
            "Prea multe combinații → grilă greu de scanat; limitează ierarhia sau filtrează.",
        ),
        "Detaliu și cauze",
    ),
    slide(
        "Detaliu și cauze",
        "Table",
        "Listă plată: valori exacte, sortare, formatare condiționată.",
        "table",
        None,
        T(
            "Un rând per înregistrare, ideal când ai nevoie de cifre exacte, nu de formă vizuală.",
            [
                "Listă facturi: număr, client, dată, sumă, status",
            ],
            steps(
                "Tragi câmpuri (dim + măsuri) direct în Columns, în ordinea dorită.",
            )
            + "<p>Alege Table când nu ai nevoie de încrucișare rând × coloană, ci doar de listă simplă.</p>",
            ["Care sunt valorile individuale, pentru fiecare înregistrare?"],
            "Multe coloane text + câteva numere; granularitate la nivel rând.",
            "Sute de rânduri fără filtru → derulare inutilă; combină cu slicer sau subset filtrat.",
        ),
        "Detaliu și cauze",
    ),
    slide(
        "Detaliu și cauze",
        "Decomposition tree",
        "Descompui o măsură pe dimensiuni, manual sau cu AI (High/Low value).",
        "decomp",
        None,
        T(
            "Analiză „de ce”, nu doar „cât”: arbore interactiv pe dimensiuni succesive.",
            [
                "De ce au scăzut vânzările: total → regiune → magazin → produs",
            ],
            steps(
                "Măsura investigată → Analyze (ex. SUM(Vânzări)).",
                "Dimensiuni candidate → Explain by (regiune, produs, canal…).",
            )
            + "<p>La „+” pe nod: alegi dimensiune sau <strong>High value</strong> / <strong>Low value</strong> (AI alege dimensiunea cu contribuția max/min).</p>"
            + "<p>Nodurile AI au indicator 💡. În Format: <strong>Absolute</strong> vs <strong>Relative</strong> pentru split-uri.</p>",
            ["Care factor explică cel mai bine rezultatul? Unde investigăm mai departe?"],
            "O măsură centrală + dimensiuni candidate; model star curat.",
            "Instrument de explorare live, nu raport static pasiv pe dashboard.",
        ),
        "Detaliu și cauze",
    ),
]

closing = """      <article class="slide s5-closing s4-closing">
        <div class="closing-hero">
          <span class="closing-eyebrow">Sesiunea 5 · încheiere</span>
          <h2 class="closing-title">Ce am învățat astăzi</h2>
        </div>
        <div class="closing-band">
          <div class="band-row is-four">
            <div class="band-card"><span class="n">01</span><strong>Întrebarea alege graficul</strong><span class="d">Comparație, parte, timp, pași, relație, detaliu: fiecare vizual are rolul lui.</span></div>
            <div class="band-card"><span class="n">02</span><strong>Dim pe axă, fact la Values</strong><span class="d">Modelul din sesiunea 4 se vede direct în field wells.</span></div>
            <div class="band-card"><span class="n">03</span><strong>Design simplu</strong><span class="d">Axa de la 0, puține categorii, culori cu sens, fără 3D.</span></div>
            <div class="band-card"><span class="n">04</span><strong>Detaliu când contează</strong><span class="d">Matrix, table și decomposition tree pentru pivot, liste și „de ce?”.</span></div>
          </div>
        </div>
        <div class="s3-note"><strong>Practică.</strong> Reproduci aceste vizuale în Power BI Desktop pe modelul tău. Slide-urile sunt ghid; exercițiul e în aplicație.</div>
      </article>

    </main>

    <nav class="slide-nav">
      <button class="slide-nav-btn" data-slide-prev>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Înapoi
      </button>
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <div class="slide-counter" data-slide-counter>1 / 2</div>
        <div class="slide-dots" data-slide-dots></div>
      </div>
      <button class="slide-nav-btn" data-slide-next>
        Următor
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </nav>
  </div>
  <script src="../../js/main.js"></script>
  <script src="../../js/s05.js?v=2"></script>
</body>
</html>
"""

out = "      <!-- C · Grafice în detaliu -->\n" + "\n".join(charts) + "\n" + closing
Path(__file__).resolve().parent.joinpath("_charts_fragment.html").write_text(out, encoding="utf-8")
print("Wrote", len(charts), "charts")
