import re
from pathlib import Path

IDS = (
    "stacked-column",
    "stacked-bar",
    "pct-stacked",
    "line",
    "area",
    "combo",
    "waterfall",
    "funnel",
    "scatter",
    "treemap",
    "matrix",
    "table",
    "decomp",
)
pat = re.compile(
    r'(slide\(\s*"[^"]+",\s*\n\s*"[^"]+",\s*\n\s*)("(?:'
    + "|".join(re.escape(i) for i in IDS)
    + r')")(\s*,\s*\n\s*(?:None|\[))',
    re.MULTILINE,
)


def repl(m):
    prefix = m.group(1)
    chart_id = m.group(2)
    suffix = m.group(3)
    chunk = m.string[m.end() : m.end() + 800]
    tm = re.search(r'T\(\s*\n\s*"([^"]+)"', chunk)
    if not tm:
        return m.group(0)
    lead = tm.group(1)
    if lead in prefix:
        return m.group(0)
    return f'{prefix}"{lead}",\n        {chart_id}{suffix}'


p = Path(__file__).with_name("build_chart_slides.py")
text = p.read_text(encoding="utf-8")
text2 = pat.sub(repl, text)
p.write_text(text2, encoding="utf-8")
print("replacements", len(pat.findall(text)), "->", len(pat.findall(text2)))
