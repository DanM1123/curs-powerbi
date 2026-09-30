# Generates chart slide HTML fragments (run manually if needed)
import html

def wells(lines):
    inner = "".join(f'<div><strong>{html.escape(a)}</strong> {html.escape(b)}</div>' for a, b in lines)
    return f'<div class="s5-wells">{inner}</div>'

def chart_slide(badge, title, chart_id, variants, tabs):
    var_html = ""
    if variants:
        btns = []
        for i, (vid, vlabel) in enumerate(variants):
            cls = "is-on" if i == 0 else ""
            btns.append(
                f'<button type="button" class="{cls}" data-s5-variant="{vid}">{html.escape(vlabel)}</button>'
            )
        var_html = f'<div class="s5-chart-toolbar" data-s5-variant-toggle>{"".join(btns)}</div>'
    tab_btns = []
    panels = []
    for i, (tid, tlabel, body) in enumerate(tabs):
        on_btn = "is-on" if i == 0 else ""
        sel = "true" if i == 0 else "false"
        tab_btns.append(
            f'<button type="button" class="{on_btn}" data-s3-cat-btn="{tid}" aria-selected="{sel}">'
            f'<span class="n">{i+1:02d}</span>{html.escape(tlabel)}</button>'
        )
        hid = "" if i == 0 else " hidden"
        on_p = " is-on" if i == 0 else ""
        panels.append(f'<div class="s4-tema-panel{on_p}" data-s3-cat-panel="{tid}"{hid}>{body}</div>')
    return f"""      <article class="slide s5-chart-slide">
        <span class="s5-badge">{html.escape(badge)}</span>
        <h2>{html.escape(title)}</h2>
        <div class="s5-chart-row">
          <div class="s5-chart-box">
            {var_html}
            <div data-s5-chart="{chart_id}"></div>
          </div>
          <div class="s5-side">
            <div class="s4-tema-switch" data-s3-cat>
              <div class="s4-tema-tabs" role="tablist">{"".join(tab_btns)}</div>
              {"".join(panels)}
            </div>
          </div>
        </div>
      </article>
"""

if __name__ == "__main__":
    print("Use from build script")
