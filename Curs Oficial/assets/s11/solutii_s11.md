# Sesiunea 11 · cheia facilitatorului

## Date

Modelul din S10, încărcat din Azure (`Flyableinc`, 9 tabele, Import), plus `Tinte`:

| Tabel | Rânduri | Coloane | Relații |
|-------|---------|---------|---------|
| Tinte | 120 (12 luni × 10 companii, 2025) | `ID_Date`, `Data`, `ID_Companie`, `Tinta_Venit` | `Tinte[ID_Date]` → `Dim_Date[ID]`, `Tinte[ID_Companie]` → `Dim_Companii[ID]`, *:1, Single |

Ținta = venitul aceleiași luni din 2024 × 1,12, rotunjit la sute, pentru fiecare companie. E pusă pe prima zi a lunii: se folosește pe lună, trimestru și an, nu pe zile.

## Cifrele lecției (Venit Zboruri = Venit_Bilete + Venit_Auxiliar)

| | 2023 | 2024 | 2025 |
|---|---|---|---|
| Venit zboruri | 66.305.345 | 69.042.378 | 75.932.135 |
| Pasageri | 306.652 | 328.352 | 349.707 |
| Load factor | 81,21% | 81,12% | 82,97% |
| La timp | 78,80% | 78,71% | 80,15% |

- 2025: **+10,0%** față de 2024; ținta 77.327.700 → **−1,8%** sub țintă. 2024 față de 2023: +4,1%.
- Load factor: +1,85 pp (afișat +1,8 pp); „+2,3%” ar fi variația relativă, de evitat. La timp: +1,4 pp. Pasageri: +6,5%. Venit pe pasager: +3,3%.
- Trimestre 2024: 12,43 · 18,08 · 23,77 · 14,76 M; 2025: 12,21 · 19,24 · 26,70 · 17,79 M. T4 2025: QoQ **−33,4%**, YoY **+20,5%**.
- Iulie 2025: 10,72 M vs 8,99 M (+19,4%). Ian–iun: 31,45 M vs 30,52 M (+3,0%).
- 1–15 dec 2025: 3,74 M; tot dec 2024: 6,16 M (−39%, greșit); 1–15 dec 2024: 2,17 M (+72%, corect).
- Pe companii, 2025: AeroCarpati 26,9 M (35% din venit) **−1,0%** YoY, −11,6% vs țintă; celelalte 9 împreună **+17,1%**. Sub țintă: AeroCarpati, Danubia Air (−1,9%), Iberica Sol (−7,4%). 12 din 45 de rute sunt sub 2024.

Toate cifrele se regenerează cu `python assets/s11/generate_s11.py` (le afișează la final).

## Măsuri (pe Fact_Zboruri; măsurile de bază din S10 sunt pe primul tab al slide-ului 12: Venit Zboruri, Pasageri, Zboruri, Load Factor %, La Timp %)

```dax
Pasageri = SUM ( Fact_Zboruri[Pasageri_Imbarcati] )

Venit PY = CALCULATE ( [Venit Zboruri], SAMEPERIODLASTYEAR ( Dim_Date[Data] ) )
Venit Δ YoY = [Venit Zboruri] - [Venit PY]
Venit YoY % = DIVIDE ( [Venit Δ YoY], [Venit PY] )

Venit PQ = CALCULATE ( [Venit Zboruri], DATEADD ( Dim_Date[Data], -1, QUARTER ) )
Venit QoQ % = DIVIDE ( [Venit Zboruri] - [Venit PQ], [Venit PQ] )

Venit YTD = TOTALYTD ( [Venit Zboruri], Dim_Date[Data] )
Venit PYTD = CALCULATE ( [Venit YTD], SAMEPERIODLASTYEAR ( Dim_Date[Data] ) )

Pasageri PY = CALCULATE ( [Pasageri], SAMEPERIODLASTYEAR ( Dim_Date[Data] ) )
Pasageri YoY % = DIVIDE ( [Pasageri] - [Pasageri PY], [Pasageri PY] )

Load Factor PY = CALCULATE ( [Load Factor %], SAMEPERIODLASTYEAR ( Dim_Date[Data] ) )
Load Factor Δ pp = ( [Load Factor %] - [Load Factor PY] ) * 100      -- format: +0.0 "pp";-0.0 "pp"
La Timp PY = CALCULATE ( [La Timp %], SAMEPERIODLASTYEAR ( Dim_Date[Data] ) )
La Timp Δ pp = ( [La Timp %] - [La Timp PY] ) * 100

Tinta Venit = SUM ( Tinte[Tinta_Venit] )
Venit vs Tinta % = DIVIDE ( [Venit Zboruri] - [Tinta Venit], [Tinta Venit] )
```

### Prezentare (reference labels, culori, titluri)

```dax
-- Partea 1, cardurile (slide 12, tabul 6): verde peste 0, roșu sub 0; aceeași rețetă pentru orice comparație
Culoare YoY = IF ( [Venit YoY %] >= 0, "#16A34A", "#DC2626" )
Culoare QoQ = IF ( [Venit QoQ %] >= 0, "#16A34A", "#DC2626" )
Culoare Load Factor = IF ( [Load Factor Δ pp] >= 0, "#16A34A", "#DC2626" )

-- Partea 3 (formatare condiționată) folosește varianta albastru/portocaliu:
Venit Text =
VAR d = [Venit YoY %]
RETURN
    IF ( ISBLANK ( d ), "fără an anterior",
        IF ( d >= 0, UNICHAR ( 9650 ), UNICHAR ( 9660 ) ) & " " & FORMAT ( d, "+0.0%;-0.0%" ) & " vs " & ( MAX ( Dim_Date[An] ) - 1 ) )

Culoare YoY =
SWITCH ( TRUE (),
    ISBLANK ( [Venit YoY %] ), "#94A3B8",
    [Venit YoY %] >= 0, "#1D4ED8",
    "#C2410C" )

-- „mai puțin = mai bine”: semnul se inversează
Intarziate % = DIVIDE ( CALCULATE ( COUNTROWS ( Fact_Zboruri ), Fact_Zboruri[Status_Zbor] = "Intarziat" ), [Zboruri] )
Intarziate Δ pp = ( [Intarziate %] - CALCULATE ( [Intarziate %], SAMEPERIODLASTYEAR ( Dim_Date[Data] ) ) ) * 100
Culoare Intarziate = IF ( [Intarziate Δ pp] <= 0, "#1D4ED8", "#C2410C" )

Titlu Overview =
"Venitul " & IF ( [Venit YoY %] >= 0, "crește", "scade" ) & " cu " & FORMAT ( ABS ( [Venit YoY %] ), "0%" )
    & " față de anul trecut"

Culoare Max =
IF ( [Venit Zboruri] = MAXX ( ALLSELECTED ( Dim_Companii[Companie] ), [Venit Zboruri] ), "#0E7490", "#CBD5E1" )
Culoare Tinta = IF ( [Venit Zboruri] < [Tinta Venit], "#C2410C", "#CBD5E1" )
Culoare Gauge = IF ( [Venit Zboruri] >= [Tinta Venit], "#16A34A", "#DC2626" )   -- gauge: verde peste țintă, roșu sub ea

Companie Aleasa = DISTINCT ( Dim_Companii[Companie] )      -- New table, fără relații
Culoare Aleasa =
IF ( SELECTEDVALUE ( Dim_Companii[Companie] ) = SELECTEDVALUE ( 'Companie Aleasa'[Companie] ), "#0E7490", "#CBD5E1" )
```

### Perioada incompletă (capcana 1, pentru cine întreabă)

```dax
Venit PY comparabil =
VAR UltimaZi = CALCULATE ( MAX ( Dim_Date[Data] ), Fact_Zboruri )
RETURN
    CALCULATE ( [Venit Zboruri],
        SAMEPERIODLASTYEAR ( Dim_Date[Data] ),
        Dim_Date[Data] <= EDATE ( UltimaZi, -12 ) )
```

Cele două filtre pe `Dim_Date[Data]` se intersectează: anul trecut, dar doar până la aceeași zi.

## Setări în Power BI

- **Card nou, reference label:** Format → Reference labels → Add → Value: `[Venit Text]`; Value → Color → *fx* → Field value → `[Culoare YoY]`. Al doilea label: `[Tinta Venit]` cu detaliu `[Venit vs Tinta %]`. Sparkline: Callout values → Sparkline, axa `Dim_Date[Luna_Nume]`.
- **KPI visual:** Value `[Venit Zboruri]`, Trend axis `Dim_Date[An]`, Target `[Tinta Venit]`. Format → Colors: Good = albastru, Bad = portocaliu (implicit e verde/roșu).
- **Gauge (slide 14):** Value `[Venit Zboruri]`, Target `[Tinta Venit]`, Max 90 M, Fill color → fx → Field value `[Culoare Gauge]`. Pe 2025: 75,9 M sub ținta 77,3 M (roșu); pe iulie 2025: 10,72 M peste 10,06 M (verde).
- **Matrix Detaliu:** Rows `Dim_Rute[Cod_Ruta]`, Columns `Dim_Date[Trimestru]`, Values `[Venit Zboruri]`, `[Venit YoY %]`; filtru pe pagină An = 2025.
  - Cell elements → Venit Zboruri → Background color → fx → Gradient (gri deschis → accent). *Apply to: Values only.*
  - Venit YoY % → Icons → fx → Rules: ≥ 0 Number ▲, < 0 Number ▼.
  - Venit YoY % → Font color → fx → Field value → `[Culoare YoY]`.
  - Data bars: pe o coloană cu totalul anual (un al doilea matrix sau un table), nu pe trimestre.
- **Bar chart:** Format → Bars → Color → fx → Field value → `[Culoare Tinta]` (sau `Culoare Max`, `Culoare Aleasa`).
- **Titlu dinamic:** Format → General → Title → Text → fx → Field value → `[Titlu Overview]`.

## Partea 1 · cele trei carduri (slide 13)

1. **Venit · vs anul trecut:** `[Venit Zboruri]` + reference label `[Venit YoY %]`, An = 2025 → 75,9 M, ▲ +10,0%.
2. **Venit T4 · vs trimestrul trecut:** același card, slicer Trimestru = T4, label `[Venit QoQ %]` → 17,8 M, ▼ −33,4% (al doilea label opțional `[Venit YoY %]`: +20,5%).
3. **Load factor · în puncte:** `[Load Factor %]` + label `[Load Factor Δ pp]` (format `+0.0 "pp";-0.0 "pp"`) → 83,0%, ▲ +1,8 pp.

Culoarea label-ului: fx → Field value → `[Culoare YoY]` / `[Culoare QoQ]` / `[Culoare Load Factor]`. Cu Rules, fiecare regulă cere ambele margini: ≥ 0 și ≤ 100 verde, ≥ −1 și < 0 roșu (valorile sunt zecimale: 10% = 0,10). Nu e nevoie de alte măsuri decât cele de pe slide-ul 12.

## Partea 2 · modelul de răspuns

- **Big Idea:** „Venitul a crescut cu 10%, dar a rămas sub țintă din cauza unui început de an slab.” (ian–iun +3,0%, iul–dec +15,5%)
- **Arbore → pagini:** Cât? → Overview · De ce? → Venit & preț · Unde? → Rute & companii · Ce ne costă? → Operațional · Care exact? → Detaliu.
- **Storyboard:** ordinea de pornire e Rute, Detaliu, Overview, Operațional, Venit; cea corectă: Overview → Venit & preț → Rute & companii → Operațional → Detaliu. Titluri-concluzie: Venitul crește cu +10%, dar e cu 1,8% sub țintă → Creștem din pasageri (+6,5%) și din venit pe pasager (+3,3%) → AeroCarpati scade (−1,0%), celelalte cresc cu +17% → Zburăm mai plini (+1,8 pp) și mai la timp (+1,4 pp) → 12 din 45 rute sunt sub 2024.
