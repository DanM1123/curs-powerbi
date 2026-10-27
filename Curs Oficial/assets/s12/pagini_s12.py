# -*- coding: utf-8 -*-
"""Paginile proiectelor finale S12 (o pagină pe temă + pagina cu toate temele), fișierele text și cheia facilitatorului.

Design nou față de S11: stil editorial (Fraunces + Manrope), hârtie deschisă, accent în culoarea companiei,
traseul Curățare → Model → Raport ca timeline vertical, nu ca tab-uri.
"""
from __future__ import annotations

from html import escape as esc

META = {
    "telekom": {
        "nume": "Telekom Romania Business", "sector": "Telecom · B2B", "accent": "#E20074",
        "tagline": "Abonamente, echipamente, soluții ICT și lucrările tehnice care vin cu ele, până în ziua în care compania a fost vândută.",
        "context": [
            "Telekom Romania Mobile a fost divizia mobilă a grupului OTE / Deutsche Telekom. Pe zona Business vindea companiilor abonamente, telefoane și echipamente de rețea, licențe Microsoft 365, soluții IoT (urmărire GPS a flotelor, telemetrie) și făcea lucrările tehnice: instalare, deployment, integrare de rețele, securitate și mentenanță.",
            "Între 2023 și 2025 veniturile au scăzut de la an la an. Pe 30 septembrie 2025 compania a fost vândută: clienții business au trecut la Vodafone, iar clienții prepaid la Digi. Datele voastre se opresc în ziua aceea.",
        ],
        "fapte": [("1,42 → 1,07", "mld. lei venituri, 2023 → 2025"), ("−12,2%", "scăderea veniturilor în 2025"),
                  ("755 → 686", "angajați, 2024 → 2025"), ("30.09.2025", "vânzarea către Vodafone și Digi")],
    },
    "erbasu": {
        "nume": "Construcții Erbașu", "sector": "Construcții & instalații", "accent": "#C8102E",
        "tagline": "Spitale, stadioane, autostradă și metrou: situațiile de lucrări și achizițiile unuia dintre cei mai mari constructori din România.",
        "context": [
            "Construcții Erbașu este un antreprenor general cu capital 100% românesc, fondat în 1990. Are peste 4.000 de angajați, peste 160 de șantiere active în 29 de județe, iar 95% din lucrări sunt proiecte publice.",
            "În portofoliul analizat intră proiecte ca Spitalul Regional de Urgență Craiova, Autostrada Transilvania (Suplacu de Barcău–Chiribiș), stadioanele din Pitești, Constanța și Timișoara și Planșeul Unirii. Pentru fiecare aveți lucrările executate lună de lună pe categorii (structură, instalații electrice, sanitare, HVAC, finisaje) și ce s-a cumpărat pentru ele.",
        ],
        "fapte": [("2,27 → 3,01", "mld. lei cifră de afaceri, 2024 → 2025"), ("280,8 mil.", "lei profit net 2024"),
                  ("160+", "șantiere active în 29 de județe"), ("95%", "din portofoliu: proiecte publice")],
    },
    "endava": {
        "nume": "Endava România", "sector": "IT · Resource allocation & portofoliu de proiecte", "accent": "#FF5640",
        "tagline": "Cine lucrează pe ce proiect, cât e planificat față de cât s-a lucrat, cine e supra-alocat și cine stă pe bench.",
        "context": [
            "Endava este o companie britanică de servicii IT, listată la bursa din New York, cu birouri în 10 orașe din România. Sediul filialei din România este la Cluj-Napoca. Echipele din țară livrează proiecte pentru clienți din plăți (Worldpay, Paysafe), bănci, asigurări, telecom, mobilitate și sănătate.",
            "În 2024 numărul mediu de angajați din România a scăzut de la 4.372 la 3.333, iar în 2025 a crescut la 4.023. Cu toate astea, cifra de afaceri a scăzut în ambii ani. Datele vă arată cum se distribuie oamenii pe proiecte în fiecare lună: alocarea planificată, orele pontate, costul, venitul și riscurile fiecărui proiect.",
        ],
        "fapte": [("1,35 → 1,18", "mld. lei cifră de afaceri RO, 2023 → 2025"), ("4.372 → 3.333 → 4.023", "angajați medii, 2023–2025"),
                  ("10", "orașe cu birouri în România"), ("20% BCM · 19% Payments", "cele mai mari industrii, FY2025")],
    },
    "unilever": {
        "nume": "Unilever România", "sector": "FMCG · bunuri de larg consum", "accent": "#1F36C7",
        "tagline": "Dero, Dove, Rexona, Knorr, Delikat, Magnum: ce livrează Unilever lanțurilor de retail și distribuitorilor, față de target.",
        "context": [
            "Unilever South Central Europe produce și vinde în România și Moldova peste 20 de branduri. Are o fabrică de alimente la Ploiești, unde se fac Knorr și Delikat (28 de linii, peste 40.000 de tone pe an), și o fabrică de înghețată la Suceava (Napoca, Betty Ice). Dero deține aproape 30% din piața de detergent pudră.",
            "Datele sunt livrările (sell-in) către Kaufland, Lidl, Carrefour, Mega Image, Profi, Penny, eMAG și distribuitorii regionali, plus targetul lunar al fiecărui agent. Atenție: în decembrie 2025 înghețata a ieșit din Unilever și a trecut la The Magnum Ice Cream Company.",
        ],
        "fapte": [("1,358 mld.", "lei cifră de afaceri 2025"), ("444 mil.", "lei profit 2025 (efect one-off)"),
                  ("~30%", "cota Dero la detergent pudră"), ("28 linii", "la fabrica din Ploiești")],
    },
    "uipath": {
        "nume": "UiPath", "sector": "Digitalizare · Business Process Automation", "accent": "#FA4616",
        "tagline": "Procese manuale vs. automate la clienții UiPath: timp economisit, erori, rework și costuri.",
        "context": [
            "UiPath este compania de automatizare fondată în România, acum listată la New York, cu peste 10.000 de clienți. Platforma sa automatizează procese de business: facturi, reconcilieri, onboarding, verificări KYC/AML, triere de e-mailuri și, din 2025, agenți AI.",
            "Proiectul urmărește 12 clienți UiPath (Royal Mail, Banca Transilvania, Provident Financial Romania, Mediq, City of Copenhagen…). Pentru fiecare aveți proiectele de automatizare și execuțiile lunare ale proceselor, manuale și automate: cât durează, câte erori apar, cât costă.",
        ],
        "fapte": [("$1,67 mld.", "ARR la 31.01.2025 (+14%)"), ("10.750", "clienți"),
                  ("10 min → 12 s", "un proces la Banca Transilvania"), ("10.000 h/an", "economisite la Provident RO")],
    },
    "hm": {
        "nume": "H&M România", "sector": "Fashion · retail omnichannel", "accent": "#E50010",
        "tagline": "Bonuri din magazinele din mall-uri și de pe hm.com, colecții pe sezon, reduceri și retururi.",
        "context": [
            "H&M a intrat în România în 2011, cu primul magazin în AFI Cotroceni. Acum este cel mai mare brand de modă din țară după vânzări, cu peste 50 de magazine și magazinul online. În 2023 vânzările au crescut cu 35%, până la 1,32 miliarde de lei.",
            "Aveți 35 de magazine din toată țara și magazinul online, articolele împărțite pe departamente, grupuri de produse, culori și colecții, vânzările pe linii de bon, campaniile de reduceri și retururile, cu motivul lor.",
        ],
        "fapte": [("1,32 mld.", "lei vânzări 2023 (+35%)"), ("66,7 mil.", "lei profit 2023"),
                  ("53 + 2 COS", "magazine în 2023"), ("2011", "primul magazin, AFI Cotroceni")],
    },
}
ORDINE = ["telekom", "erbasu", "endava", "unilever", "uipath", "hm"]


def n(x: int) -> str:
    return f"{x:,}".replace(",", ".")


FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@400;500;600;700&'
         'family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">')

CSS = """
:root{--paper:#f5f2eb;--card:#fffdf8;--ink:#1c1b18;--ink-2:#4a4740;--ink-3:#8a857a;--rule:#e3ddd0;--a:#333;
--soft:color-mix(in srgb,var(--a) 10%,var(--card));--a-ink:color-mix(in srgb,var(--a) 82%,#000)}
:root[data-theme="dark"]{--paper:#14130f;--card:#1d1c17;--ink:#f1ede4;--ink-2:#c5bfb2;--ink-3:#8c8678;--rule:#34312a;
--soft:color-mix(in srgb,var(--a) 18%,var(--card));--a-ink:color-mix(in srgb,var(--a) 70%,#fff)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#14130f;--card:#1d1c17;--ink:#f1ede4;--ink-2:#c5bfb2;--ink-3:#8c8678;--rule:#34312a;
--soft:color-mix(in srgb,var(--a) 18%,var(--card));--a-ink:color-mix(in srgb,var(--a) 70%,#fff)}}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--a-ink)}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}
.bar{display:flex;justify-content:space-between;align-items:center;padding:18px 0;border-bottom:1px solid var(--rule);font-size:14px}
.bar a{text-decoration:none;color:var(--ink-2);font-weight:600}.bar a:hover{color:var(--ink)}
.tog{background:none;border:1px solid var(--rule);color:var(--ink-2);border-radius:999px;padding:6px 14px;font:600 13px Manrope;cursor:pointer}
.kick{font:500 12px 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--a-ink)}
h1,h2,h3{font-family:Fraunces,Georgia,serif;font-weight:700;letter-spacing:-.01em;margin:0}
.hero{display:grid;grid-template-columns:1.35fr 1fr;gap:48px;padding:56px 0 48px;border-bottom:1px solid var(--rule)}
.hero h1{font-size:clamp(40px,6vw,72px);line-height:1;margin:14px 0 20px}
.hero h1 span{display:block;width:72px;height:6px;background:var(--a);margin-top:22px;border-radius:3px}
.tag{font-size:19px;color:var(--ink-2);max-width:34em}
.fisa{background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:8px 22px;align-self:start;box-shadow:6px 6px 0 var(--soft)}
.fisa div{padding:14px 0;border-bottom:1px dashed var(--rule)}.fisa div:last-child{border:0}
.fisa b{display:block;font:700 24px Fraunces,serif;color:var(--ink)}.fisa small{color:var(--ink-3);font-size:13px}
.fisa .lab{font:500 11px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);padding:12px 0 4px;border:0}
section{padding:56px 0;border-bottom:1px solid var(--rule)}
.two{display:grid;grid-template-columns:220px 1fr;gap:40px}
.two h2{font-size:30px;line-height:1.15}
.prose p{margin:0 0 16px;max-width:42em;color:var(--ink-2)}.prose p:first-child{color:var(--ink);font-size:18px}
.files{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.file{display:flex;gap:12px;align-items:center;background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:14px 16px;text-decoration:none;color:var(--ink);transition:.15s}
.file:hover{border-color:var(--a);transform:translateY(-2px)}
.file i{font-style:normal;flex:none;width:38px;height:44px;border-radius:3px;background:var(--soft);color:var(--a-ink);display:grid;place-items:center;font:700 10px 'JetBrains Mono',monospace}
.file b{display:block;font-size:14px}.file small{color:var(--ink-3);font-size:12px}
.file.fact i{background:var(--a);color:#fff}
.note{font-size:14px;color:var(--ink-3);margin-top:14px}
.steps{position:relative;margin-top:8px}
.step{display:grid;grid-template-columns:110px 1fr;gap:28px;padding:0 0 56px;position:relative}
.step:before{content:"";position:absolute;left:46px;top:84px;bottom:0;border-left:2px dashed var(--rule)}
.step:last-child:before{display:none}.step:last-child{padding-bottom:0}
.num{font:700 72px/1 Fraunces,serif;color:var(--a);opacity:.9}
.step h3{font-size:28px;margin:6px 0 4px}.step .sub{color:var(--ink-3);font-size:14px;margin-bottom:18px}
.step p{color:var(--ink-2);max-width:44em}
.rules{list-style:none;padding:0;margin:18px 0;display:grid;gap:10px;max-width:46em}
.rules li{background:var(--card);border-left:4px solid var(--a);padding:10px 16px;border-radius:0 4px 4px 0;color:var(--ink-2)}
table{border-collapse:collapse;width:100%;max-width:640px;font-size:14px;margin-top:12px;background:var(--card);border:1px solid var(--rule)}
th,td{padding:9px 14px;text-align:left;border-bottom:1px solid var(--rule)}th{font:500 11px 'JetBrains Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)}
td.r,th.r{text-align:right;font-family:'JetBrains Mono',monospace}
.grp{font:500 11px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);margin:22px 0 10px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.tcard{background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:16px 18px}
.tcard b{font-family:'JetBrains Mono',monospace;font-size:13.5px}.tcard p{margin:6px 0 0;font-size:14px;color:var(--ink-2)}
.tcard.fact{border-top:4px solid var(--a)}
.callout{background:var(--soft);border-radius:4px;padding:18px 22px;max-width:46em;margin-top:18px}
.callout b{display:block;margin-bottom:4px}
.btn{display:inline-block;margin-top:10px;background:var(--a);color:#fff;text-decoration:none;font-weight:700;padding:9px 18px;border-radius:999px;font-size:14px}
.present{counter-reset:p;list-style:none;padding:0;margin:14px 0 0;max-width:44em}
.present li{counter-increment:p;padding:10px 0 10px 44px;position:relative;border-bottom:1px solid var(--rule);color:var(--ink-2)}
.present li:before{content:counter(p,decimal-leading-zero);position:absolute;left:0;font:700 18px Fraunces,serif;color:var(--a)}
footer{padding:40px 0 60px;font-size:13px;color:var(--ink-3)}footer ol{padding-left:18px;margin:10px 0 0;word-break:break-all}
footer li{margin:3px 0}footer a{color:var(--ink-3)}
.hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:18px;padding:40px 0 70px}
.hcard{--a:#333;display:flex;flex-direction:column;background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:26px 26px 22px;text-decoration:none;color:var(--ink);position:relative;overflow:hidden;transition:.15s}
.hcard:before{content:"";position:absolute;left:0;top:0;right:0;height:5px;background:var(--a)}
.hcard:hover{transform:translateY(-3px);box-shadow:6px 6px 0 color-mix(in srgb,var(--a) 14%,transparent)}
.hcard h2{font-size:28px;margin:10px 0 8px}.hcard p{color:var(--ink-2);font-size:15px;margin:0 0 18px;flex:1}
.hcard .meta{font:500 12px 'JetBrains Mono',monospace;color:var(--ink-3)}.hcard .go{font-weight:700;color:var(--a-ink);margin-top:10px}
.hubhero{padding:56px 0 8px}.hubhero h1{font-size:clamp(38px,5vw,60px);margin:12px 0 14px}.hubhero p{max-width:40em;color:var(--ink-2);font-size:18px}
@media (max-width:820px){.hero,.two{grid-template-columns:1fr;gap:24px}.step{grid-template-columns:1fr;gap:4px}.step:before{display:none}.num{font-size:52px}
.wrap{padding:0 16px}table{font-size:13px}th,td{padding:8px 10px}}
"""

THEME_JS = """<script>
(function(){var k='proiect-s12-theme',r=document.documentElement;try{var s=localStorage.getItem(k);if(s)r.dataset.theme=s}catch(e){}
function cur(){return r.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function lab(){var b=document.getElementById('tog');if(b)b.textContent=cur()==='dark'?'☀ Temă deschisă':'☾ Temă închisă'}
document.addEventListener('DOMContentLoaded',function(){lab();document.getElementById('tog').onclick=function(){r.dataset.theme=cur()==='dark'?'light':'dark';try{localStorage.setItem(k,r.dataset.theme)}catch(e){}lab()}})})();
</script>"""


def head(title: str, accent: str) -> str:
    return (f'<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{esc(title)}</title>{FONTS}<style>{CSS}</style><style>:root{{--a:{accent}}}</style>{THEME_JS}</head><body>')


def page(tema: str, ref: dict, summary: list[dict]) -> str:
    m = META[tema]
    facts = "".join(f"<div><b>{esc(a)}</b><small>{esc(b)}</small></div>" for a, b in m["fapte"])
    files = "".join(
        f'<a class="file{" fact" if s["fapt"] else ""}" href="date/{s["tabel"]}.xlsx" download><i>XLSX</i>'
        f'<span><b>{s["tabel"]}.xlsx</b><small>{"tabel de fapte" if s["fapt"] else "dimensiune"} · {n(s["randuri_murdar"])} rânduri</small></span></a>'
        for s in summary)
    target = "".join(f'<tr><td>{s["tabel"]}</td><td class="r">{n(s["randuri"])}</td><td class="r">{s["coloane"]}</td></tr>' for s in summary)
    facts_c = "".join(f'<div class="tcard fact"><b>{s["tabel"]}</b><p>{esc(s["desc"])}</p></div>' for s in summary if s["fapt"])
    dims_c = "".join(f'<div class="tcard"><b>{s["tabel"]}</b><p>{esc(s["desc"])}</p></div>' for s in summary if not s["fapt"])
    ctx = "".join(f"<p>{esc(p)}</p>" for p in m["context"])
    n_t = len(summary)
    return head(f"Proiect final · {m['nume']}", m["accent"]) + f"""
<div class="wrap">
<div class="bar"><a href="../index.html">← Toate proiectele</a><button class="tog" id="tog">Temă</button></div>
<header class="hero">
  <div><div class="kick">Proiect final · Sesiunea 12 · {esc(m['sector'])}</div>
  <h1>{esc(m['nume'])}<span></span></h1><p class="tag">{esc(m['tagline'])}</p></div>
  <aside class="fisa"><div class="lab">Compania în cifre</div>{facts}</aside>
</header>

<section class="two"><h2>Povestea companiei</h2><div class="prose">{ctx}</div></section>

<section class="two"><h2>Fișierele de date</h2><div>
<div class="files">{files}</div></div></section>

<section><div class="kick">Traseul proiectului</div>
<div class="steps" style="margin-top:28px">
 <div class="step"><div class="num">01</div><div>
  <h3>Curățarea datelor</h3><div class="sub">Power Query</div>
  <p>Importați fișierele din <code>date/</code> în Power BI și curățați totul în Power Query. Fișierele Excel nu le modificați.</p>
  <ul class="rules">
   <li>Numele interogării = numele fișierului (de exemplu <b>{summary[0]['tabel']}</b>).</li>
   <li>Fiecare coloană are tipul potrivit conținutului ei: numerele sunt numere, datele sunt date, textul e scris unitar.</li>
   <li>Verificați-vă după numărul de rânduri și coloane din tabelul de mai jos. Dacă nu se potrivește, mai e ceva de curățat.</li>
  </ul>
  <table><thead><tr><th>Tabel</th><th class="r">Rânduri</th><th class="r">Coloane</th></tr></thead><tbody>{target}</tbody></table>
 </div></div>
 <div class="step"><div class="num">02</div><div>
  <h3>Modelul de date</h3><div class="sub">relațiile le decideți voi</div>
  <p>Acestea sunt cele {n_t} tabele. Legați-le ca să obțineți un model de date: ce relații faceți și cum le setați decideți voi.</p>
  <div class="grp">Tabele de fapte</div><div class="cards">{facts_c}</div>
  <div class="grp">Dimensiuni</div><div class="cards">{dims_c}</div>
 </div></div>
 <div class="step"><div class="num">03</div><div>
  <h3>Raportul</h3><div class="sub">fără indicații</div>
  <p>Aici nu primiți nicio indicație: ce pagini faceți, ce întrebări alegeți și ce chart-uri folosiți hotărâți voi. Gândiți-vă cine ar citi raportul în companie și ce decizii ar lua pe baza lui.</p>
  <ul class="rules"><li><b>Cerință:</b> la final publicați raportul în Power BI Service (Publish din Power BI Desktop) și ne trimiteți linkul raportului publicat.</li></ul>
  <div class="callout"><b>Facultativ: pașii din sesiunea 11</b>Dacă vreți să vă faceți o idee despre cum ar trebui construit raportul, puteți urma pașii din sesiunea 11: cititorul și Big Idea, arborele de întrebări, imaginea de ansamblu → diagnostic → detaliu, storyboard-ul, titlurile-concluzie, KPI-urile cu reper și formatarea condiționată.<br><a class="btn" href="../../../s11/index.html">Deschide sesiunea 11</a></div>
  <p style="margin-top:26px"><b style="color:var(--ink)">Ce prezentați.</b> Pe lângă chart-uri, ne prezentați logica fiecărei pagini, ca să înțelegem structura raportului:</p>
  <ol class="present"><li>De ce ați ales să faceți pagina respectivă.</li><li>La ce întrebări răspunde fiecare chart de pe pagină.</li><li>Cum se leagă paginile între ele: ce drum parcurge cititorul de la prima la ultima.</li></ol>
 </div></div>
</div></section>

</div></body></html>"""


def hub(results: list[dict]) -> str:
    cards = ""
    for r in results:
        t = r["tema"]
        m = META[t]
        rows = sum(s["randuri"] for s in r["summary"])
        cards += (f'<a class="hcard" style="--a:{m["accent"]}" href="{t}/index.html"><div class="kick">{esc(m["sector"])}</div>'
                  f'<h2>{esc(m["nume"])}</h2><p>{esc(m["tagline"])}</p>'
                  f'<div class="meta">{len(r["summary"])} tabele · {n(rows)} rânduri</div><div class="go">Deschide proiectul →</div></a>')
    return head("Proiecte finale · Sesiunea 12", "#1c1b18") + f"""
<div class="wrap"><div class="bar"><a href="../../../index.html">← Cursul Power BI</a><button class="tog" id="tog">Temă</button></div>
<header class="hubhero"><div class="kick">Sesiunea 12 · Proiecte finale</div><h1>Proiecte finale</h1>
<p>Fiecare echipă primește o companie și datele ei. Traseul e același la toate temele: curățare, model, raport publicat în Power BI Service.</p></header>
<div class="hub-grid">{cards}</div></div></body></html>"""


def readme_txt(tema: str, summary: list[dict]) -> str:
    m = META[tema]
    t = f"Proiect final · Sesiunea 12 · {m['nume']} ({m['sector']})"
    out = [t, "=" * len(t), "", "Cerințele complete: index.html (Curățare · Model · Raport publicat în Power BI Service).", "", "Fișiere (folderul date/, se curăță în Power Query):"]
    for s in summary:
        out.append(f"  {s['tabel'] + '.xlsx':28s} {'fapt' if s['fapt'] else 'dimensiune':10s} {s['desc']}")
    return "\n".join(out) + "\n"


def solutii_md(results: list[dict]) -> str:
    out = ["# Proiecte finale S12 · cheia facilitatorului", "",
           "Generat de `generate_proiecte_s12.py`. Pentru fiecare temă: rânduri murdar → curat, ce e de curățat și modelul așteptat.",
           "Toate relațiile sunt many-to-one, cu filtrare într-o singură direcție, de la dimensiune la fapt. Între cele două tabele de fapte nu se face nicio relație.", ""]
    for r in results:
        m = META[r["tema"]]
        out += [f"## {m['nume']}", ""]
        if r.get("share"):
            out.append(f"Eșantion: tabelul de fapte principal reprezintă ~{r['share'] * 100:.2f}% din cifra reală (trendul anual e păstrat).\n")
        out += ["| Tabel | Murdar (rânduri × col.) | Curat (rânduri × col.) | Ce e de curățat |", "|---|---|---|---|"]
        for s in r["summary"]:
            out.append(f"| {s['tabel']} | {s['randuri_murdar']} × {s['coloane_murdar']} | {s['randuri']} × {s['coloane']} | {'; '.join(s['murdarie'])} |")
        out += ["", "Relații:", ""] + [f"- `{a}[{c}]` → `{b}`" for a, c, b in r["relatii"]] + [""]
    out += ["Note:", "- Endava: Dim_Proiecte → Dim_Clienti, Dim_Angajati → Dim_Centre și Dim_Riscuri → Dim_Proiecte fac un model snowflake.",
            "- UiPath: Fact_Initiative nu se leagă de Dim_Date, pentru că Data_Go_Live poate cădea înainte de 2023 sau după 2025.",
            "- H&M: Fact_Retururi are ID_Linie_Vanzare doar pentru urmărire; nu se face relație între fapte.",
            "- Unilever: Fact_Target e la nivel de agent × categorie × lună, deci se compară cu vânzările prin dimensiuni comune (Dim_Agenti, Dim_Categorii prin Dim_Produse, Dim_Date)."]
    return "\n".join(out) + "\n"
