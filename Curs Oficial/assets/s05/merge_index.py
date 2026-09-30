from pathlib import Path

root = Path(__file__).resolve().parents[2]
index = root / "sesiuni/s05/index.html"
frag = Path(__file__).with_name("_charts_fragment.html")
text = index.read_text(encoding="utf-8")
marker = "      <!-- C · Grafice în detaliu -->"
if marker not in text:
    marker = "      <!-- C · Grafice (generated content) -->"
if marker in text:
    text = text.split(marker)[0].rstrip() + "\n"
else:
    # cut before closing article design slide
    end = "      </article>\n"
    idx = text.rfind('        <span class="slide-eyebrow">Design</span>')
    if idx < 0:
        raise SystemExit("no design slide")
    idx2 = text.index(end, text.index("Reguli generale", idx)) + len(end)
    text = text[:idx2]

text += frag.read_text(encoding="utf-8")
index.write_text(text, encoding="utf-8")
print("merged", index)
