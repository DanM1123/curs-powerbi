/* ==========================================================================
   Atelier de raport · desenarea vizualelor
   Fiecare vizual Power BI e redesenat în SVG/HTML din datele încărcate.
   render(model, spec, opts) întoarce HTML. Elementele pe care se poate da
   click poartă data-sel='[[câmp, valoare], …]' pentru filtrarea încrucișată.
   ========================================================================== */
(function () {
  'use strict';

  const A = (window.Atelier = window.Atelier || {});
  const D = () => A.Data;

  const PALETTES = {
    curs: { name: 'Curs', colors: ['#059669', '#84CC16', '#0D9488', '#F59E0B', '#6366F1', '#EC4899', '#06B6D4', '#EF4444', '#64748B', '#A855F7'] },
    powerbi: { name: 'Power BI (implicit)', colors: ['#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7', '#744EC2', '#D9B300', '#D64550', '#197278', '#1AAB40'] },
    sobru: { name: 'Sobru', colors: ['#1E3A5F', '#4A7BA7', '#9DB9D5', '#C9A227', '#7A7A7A', '#B5651D', '#2F6F4E', '#8C2F39', '#5B5B8F', '#A3A3A3'] },
    cald: { name: 'Cald', colors: ['#C2410C', '#F59E0B', '#B91C1C', '#FCD34D', '#7C2D12', '#FB923C', '#A16207', '#E11D48', '#78716C', '#FDBA74'] }
  };

  /* ---------- utilitare ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const selAttr = (pairs) => ` data-sel="${esc(JSON.stringify(pairs))}"`;
  const tw = (s, fs) => String(s).length * fs * 0.56;
  const clip = (s, max, fs) => {
    s = String(s);
    if (tw(s, fs) <= max) return s;
    const n = Math.max(1, Math.floor(max / (fs * 0.56)) - 1);
    return s.slice(0, n) + '…';
  };
  const meas = (m, id) => m.measures.get(id) || { name: id, fmt: 'number' };
  const fmtS = (m, id, v) => D().fmtShort(v, meas(m, id).fmt);
  const fmtF = (m, id, v) => D().fmtFull(v, meas(m, id).fmt);
  const fieldOf = (m, id) => m.fields.get(id);

  function label(m, id, v, short) {
    const f = fieldOf(m, id);
    if (v == null) return '(Gol)';
    if (f && f.order === 'month' && short) { const i = D().monthIndex(v); if (i >= 0) return D().MONTH_SHORT[i]; }
    return D().displayValue(m, id, v);
  }
  const keyLabel = (m, by, keys, short) => keys.map((k, i) => label(m, by[i], k, short)).join(' ');

  function niceMax(v) {
    if (!(v > 0)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
  function ticks(min, max, count) {
    const span = max - min || 1;
    const step = niceMax(span / (count || 4));
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  function filtersOf(spec, opts) { return (opts.filters || []).concat(spec.fixedFilters || []); }
  function run(m, spec, opts, by, measures) { return D().query(m, { by, measures, filters: filtersOf(spec, opts) }); }

  function sortGroups(m, groups, by, how, mid) {
    const cmpKeys = (a, b) => {
      for (let i = 0; i < by.length; i++) {
        const c = D().compareValues(fieldOf(m, by[i]), a.keys[i], b.keys[i]);
        if (c) return c;
      }
      return 0;
    };
    if (how === 'desc') groups.sort((a, b) => (b.vals[mid] || 0) - (a.vals[mid] || 0) || cmpKeys(a, b));
    else groups.sort(cmpKeys);
    return groups;
  }
  const distinctSorted = (m, id, values) => [...new Set(values)].sort((a, b) => D().compareValues(fieldOf(m, id), a, b));

  const isSel = (opts, pairs) => {
    const s = opts.sel;
    if (!s || !s.length) return null;
    // vizualul care a pus selecția: evidențiem ce s-a ales, restul se estompează
    const hit = s.every(([f, v]) => pairs.some(([pf, pv]) => pf === f && D().keyOf(pv) === D().keyOf(v)));
    const relevant = s.some(([f]) => pairs.some(([pf]) => pf === f));
    if (!relevant) return null;
    return hit;
  };
  const dimCls = (opts, pairs) => { const h = isSel(opts, pairs); return h === false ? ' is-dim' : h === true ? ' is-hit' : ''; };

  const empty = (msg) => `<div class="atl-empty-vis"><span>${esc(msg || 'Nu sunt date pentru selecția curentă')}</span></div>`;
  const svgOpen = (w, h, cls) => `<svg class="atl-svg ${cls || ''}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">`;

  function legendHtml(items, colors) {
    return `<div class="atl-legend">${items.map((it, i) => `<span class="atl-leg-i"><i style="background:${colors[i % colors.length]}"></i>${esc(it)}</span>`).join('')}</div>`;
  }

  /* ---------- Card / Multi-row card ---------- */
  function card(m, spec, opts) {
    const id = spec.values[0];
    const r = run(m, spec, opts, [], [id]);
    const v = r.total[id];
    const big = opts.h < 120 ? 26 : Math.min(54, Math.max(28, opts.h * 0.3));
    return `<div class="atl-card-vis"><div class="atl-card-val" style="font-size:${big}px">${esc(fmtS(m, id, v))}</div><div class="atl-card-lbl">${esc(meas(m, id).name)}</div></div>`;
  }
  function multicard(m, spec, opts) {
    const r = run(m, spec, opts, [], spec.values);
    return `<div class="atl-multicard">${spec.values.map((id, i) => `<div class="atl-mc-row" style="--bar:${opts.palette[i % opts.palette.length]}"><b>${esc(fmtS(m, id, r.total[id]))}</b><span>${esc(meas(m, id).name)}</span></div>`).join('')}</div>`;
  }

  /* ---------- KPI ---------- */
  function kpi(m, spec, opts) {
    const r = run(m, spec, opts, [spec.trend], [spec.value, spec.target]);
    const g = sortGroups(m, r.groups.filter((x) => x.keys[0] != null), [spec.trend], 'axis');
    if (!g.length) return empty();
    const last = g[g.length - 1];
    const v = last.vals[spec.value];
    const t = last.vals[spec.target];
    const diff = t ? (v - t) / Math.abs(t) : null;
    const good = diff == null ? null : diff >= 0;
    const w = opts.w, h = opts.h;
    const vals = g.map((x) => x.vals[spec.value] || 0);
    const max = Math.max(...vals) || 1;
    const pts = vals.map((x, i) => [vals.length === 1 ? w / 2 : (i / (vals.length - 1)) * w, h - (x / max) * h * 0.55]);
    const area = pts.length ? `M0,${h} L${pts.map((p) => p.join(',')).join(' L')} L${w},${h} Z` : '';
    const col = good == null ? 'var(--text-3)' : good ? '#10B981' : '#EF4444';
    return `<div class="atl-kpi-vis">${svgOpen(w, h, 'atl-kpi-bg')}<path d="${area}" style="fill:${col};opacity:.14"/></svg>
      <div class="atl-kpi-in"><div class="atl-kpi-val" style="color:${col}">${esc(fmtS(m, spec.value, v))} <span>${good == null ? '' : good ? '▲' : '▼'}</span></div>
      <div class="atl-kpi-sub">${esc(label(m, spec.trend, last.keys[0]))} · Țintă: ${esc(fmtS(m, spec.target, t))}${diff == null ? '' : ` (${diff >= 0 ? '+' : ''}${D().fmtShort(diff, 'pct')})`}</div></div></div>`;
  }

  /* ---------- Gauge ---------- */
  function gauge(m, spec, opts) {
    const yid = m.time && m.time.year;
    const r = run(m, spec, opts, yid ? [yid] : [], [spec.value, spec.target]);
    let v = r.total[spec.value];
    let t = null;
    const gs = sortGroups(m, r.groups, yid ? [yid] : [], 'axis');
    if (gs.length) { const last = gs[gs.length - 1]; v = last.vals[spec.value]; t = last.vals[spec.target]; }
    if (v == null) return empty();
    const max = niceMax(Math.max(v, t || 0) * 1.15);
    const w = opts.w, h = opts.h;
    const cx = w / 2, cy = h * 0.78, R = Math.min(w * 0.42, h * 0.7), rIn = R * 0.64;
    const pt = (f, rad) => { const a = Math.PI * (1 - f); return [cx + rad * Math.cos(a), cy - rad * Math.sin(a)]; };
    const arc = (f0, f1) => {
      const [x0, y0] = pt(f0, R), [x1, y1] = pt(f1, R), [x2, y2] = pt(f1, rIn), [x3, y3] = pt(f0, rIn);
      return `M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} L${x2},${y2} A${rIn},${rIn} 0 0 0 ${x3},${y3} Z`;
    };
    const fv = Math.min(1, v / max);
    let s = svgOpen(w, h) + `<path d="${arc(0, 1)}" class="atl-track"/><path d="${arc(0, Math.max(0.001, fv))}" style="fill:${opts.palette[0]}"/>`;
    if (t) {
      const ft = Math.min(1, t / max);
      const [a1, b1] = pt(ft, R + 4), [a2, b2] = pt(ft, rIn - 4);
      s += `<line x1="${a1}" y1="${b1}" x2="${a2}" y2="${b2}" class="atl-target"/>`;
      const [lx, ly] = pt(ft, R + 14);
      s += `<text x="${lx}" y="${ly}" text-anchor="middle" class="atl-t-sm">${esc(fmtS(m, spec.target, t))}</text>`;
    }
    s += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="atl-t-big" style="font-size:${Math.max(16, R * 0.32)}px">${esc(fmtS(m, spec.value, v))}</text>`;
    s += `<text x="${cx - (R + rIn) / 2}" y="${cy + 14}" text-anchor="middle" class="atl-t-sm">0</text><text x="${cx + (R + rIn) / 2}" y="${cy + 14}" text-anchor="middle" class="atl-t-sm">${esc(D().fmtShort(max))}</text>`;
    return s + '</svg>';
  }

  /* ---------- axe ---------- */
  function valueAxis(min, max, n) { const t = ticks(min, max, n); return { t, lo: Math.min(min, t[0]), hi: Math.max(max, t[t.length - 1]) }; }

  /* ---------- Bar / Column (clustered, stacked, 100%) ---------- */
  function barData(m, spec, opts) {
    const axis = spec.axis;
    const mid = spec.values[0];
    const by = spec.legend ? axis.concat(spec.legend) : axis;
    const r = run(m, spec, opts, by, [mid]);
    // totalul pe categorie, pentru sortare
    const totals = new Map();
    const catKeys = new Map();
    r.groups.forEach((g) => {
      const ck = g.keys.slice(0, axis.length);
      const k = ck.map(D().keyOf).join('§');
      catKeys.set(k, ck);
      totals.set(k, (totals.get(k) || 0) + (g.vals[mid] || 0));
    });
    let cats = [...catKeys.entries()].map(([k, keys]) => ({ k, keys, total: totals.get(k) }));
    if (spec.sort === 'desc' && !axis.every((a) => D().hasNaturalOrder(fieldOf(m, a)))) cats.sort((a, b) => b.total - a.total);
    else cats.sort((a, b) => { for (let i = 0; i < axis.length; i++) { const c = D().compareValues(fieldOf(m, axis[i]), a.keys[i], b.keys[i]); if (c) return c; } return 0; });
    let more = 0;
    const cap = spec.topN || (opts.compact ? 10 : 15);
    if (cats.length > cap) { more = cats.length - cap; cats = cats.slice(0, cap); }
    let series = [null];
    if (spec.legend) series = distinctSorted(m, spec.legend, r.groups.map((g) => g.keys[axis.length]));
    const val = new Map();
    r.groups.forEach((g) => {
      const k = g.keys.slice(0, axis.length).map(D().keyOf).join('§');
      const sk = spec.legend ? D().keyOf(g.keys[axis.length]) : '∅';
      val.set(k + '|' + sk, g.vals[mid]);
    });
    const get = (c, s) => val.get(c.k + '|' + (spec.legend ? D().keyOf(s) : '∅')) || 0;
    return { cats, series, get, mid, more, topN: spec.topN && more ? spec.topN : 0 };
  }

  function bar(m, spec, opts) {
    const d = barData(m, spec, opts);
    if (!d.cats.length) return empty();
    const pal = opts.palette;
    const horiz = spec.orient === 'h';
    const mode = spec.mode || 'clustered';
    const ns = d.series.length;
    const stacked = mode !== 'clustered' && ns > 1;
    const pct = mode === 'percent';
    let lo = 0, hi = 0;
    d.cats.forEach((c) => {
      if (stacked || pct) {
        let pos = 0, neg = 0;
        d.series.forEach((s) => { const v = d.get(c, s); if (v >= 0) pos += v; else neg += v; });
        hi = Math.max(hi, pct ? 1 : pos); lo = Math.min(lo, pct ? 0 : neg);
      } else d.series.forEach((s) => { const v = d.get(c, s); hi = Math.max(hi, v); lo = Math.min(lo, v); });
    });
    const ax = valueAxis(lo, hi, horiz ? 4 : 4);
    const w = opts.w, legendH = ns > 1 ? 22 : 0;
    const h = opts.h - legendH;
    const fs = opts.compact ? 10 : 11;
    const showLbl = opts.labels !== false;
    const catLbl = d.cats.map((c) => keyLabel(m, spec.axis, c.keys, true));
    let out = '';
    if (horiz) {
      const lw = Math.min(w * 0.36, Math.max(...catLbl.map((s) => tw(s, fs))) + 10);
      const x0 = lw, x1 = w - (showLbl && !(stacked && pct) ? 44 : 10), y0 = 6, y1 = h - (opts.compact ? 6 : 20);
      const band = (y1 - y0) / d.cats.length;
      const sx = (v) => x0 + ((v - ax.lo) / (ax.hi - ax.lo)) * (x1 - x0);
      out += svgOpen(w, h);
      if (!opts.compact) ax.t.forEach((t) => { out += `<line x1="${sx(t)}" x2="${sx(t)}" y1="${y0}" y2="${y1}" class="atl-grid"/><text x="${sx(t)}" y="${y1 + 13}" text-anchor="middle" class="atl-t-ax">${esc(pct ? Math.round(t * 100) + '%' : D().fmtShort(t))}</text>`; });
      d.cats.forEach((c, i) => {
        const yb = y0 + i * band;
        const bh = Math.max(2, band * 0.7);
        out += `<text x="${x0 - 6}" y="${yb + band / 2 + fs * 0.35}" text-anchor="end" class="atl-t-cat" style="font-size:${fs}px">${esc(clip(catLbl[i], lw - 8, fs))}<title>${esc(catLbl[i])}</title></text>`;
        let acc = 0, accN = 0;
        const tot = d.series.reduce((s, se) => s + Math.max(0, d.get(c, se)), 0) || 1;
        d.series.forEach((s, j) => {
          let v = d.get(c, s);
          if (pct) v = v / tot;
          const pairs = spec.axis.map((a, ai) => [a, c.keys[ai]]).concat(spec.legend ? [[spec.legend, s]] : []);
          const cls = 'atl-mark' + dimCls(opts, pairs);
          const col = pal[(ns > 1 ? j : 0) % pal.length];
          let xa, xb, yy, hh;
          if (stacked) { const base = v >= 0 ? acc : accN; xa = sx(base); xb = sx(base + v); if (v >= 0) acc += v; else accN += v; yy = yb + (band - bh) / 2; hh = bh; }
          else { const sub = bh / ns; xa = sx(0); xb = sx(v); yy = yb + (band - bh) / 2 + j * sub; hh = Math.max(1.5, sub - (ns > 1 ? 1 : 0)); }
          out += `<rect x="${Math.min(xa, xb)}" y="${yy}" width="${Math.max(0.5, Math.abs(xb - xa))}" height="${hh}" rx="2" fill="${col}" class="${cls}"${selAttr(pairs)}><title>${esc(catLbl[i] + (s != null ? ' · ' + label(m, spec.legend, s) : '') + ': ' + (pct ? D().fmtShort(v, 'pct') : fmtF(m, d.mid, v)))}</title></rect>`;
          if (showLbl && !stacked && hh >= 8) out += `<text x="${Math.max(xa, xb) + 4}" y="${yy + hh / 2 + 3.5}" class="atl-t-lbl">${esc(fmtS(m, d.mid, v))}</text>`;
          if (showLbl && stacked && pct && Math.abs(xb - xa) > 30) out += `<text x="${(xa + xb) / 2}" y="${yy + hh / 2 + 3.5}" text-anchor="middle" class="atl-t-in">${esc(Math.round(v * 100) + '%')}</text>`;
        });
        if (showLbl && stacked && !pct) out += `<text x="${sx(acc) + 4}" y="${yb + band / 2 + 3.5}" class="atl-t-lbl">${esc(fmtS(m, d.mid, acc + accN))}</text>`;
      });
      out += '</svg>';
    } else {
      const yAxW = opts.compact ? 6 : 40;
      const x0 = yAxW, x1 = w - 6, y0 = showLbl ? 14 : 6;
      const rot = d.cats.length > 6 && Math.max(...catLbl.map((s) => tw(s, fs))) > (x1 - x0) / d.cats.length - 4;
      const y1 = h - (rot ? Math.min(60, Math.max(...catLbl.map((s) => tw(s, fs))) * 0.75 + 12) : 20);
      const band = (x1 - x0) / d.cats.length;
      const sy = (v) => y1 - ((v - ax.lo) / (ax.hi - ax.lo)) * (y1 - y0);
      out += svgOpen(w, h);
      if (!opts.compact) ax.t.forEach((t) => { out += `<line x1="${x0}" x2="${x1}" y1="${sy(t)}" y2="${sy(t)}" class="atl-grid"/><text x="${x0 - 5}" y="${sy(t) + 3.5}" text-anchor="end" class="atl-t-ax">${esc(pct ? Math.round(t * 100) + '%' : D().fmtShort(t))}</text>`; });
      d.cats.forEach((c, i) => {
        const xb0 = x0 + i * band;
        const bw = Math.max(2, band * 0.72);
        const lx = xb0 + band / 2;
        out += rot
          ? `<text transform="translate(${lx},${y1 + 10}) rotate(-40)" text-anchor="end" class="atl-t-cat" style="font-size:${fs}px">${esc(clip(catLbl[i], 70, fs))}</text>`
          : `<text x="${lx}" y="${y1 + 14}" text-anchor="middle" class="atl-t-cat" style="font-size:${fs}px">${esc(clip(catLbl[i], band - 2, fs))}<title>${esc(catLbl[i])}</title></text>`;
        let acc = 0, accN = 0;
        const tot = d.series.reduce((s, se) => s + Math.max(0, d.get(c, se)), 0) || 1;
        d.series.forEach((s, j) => {
          let v = d.get(c, s);
          if (pct) v = v / tot;
          const pairs = spec.axis.map((a, ai) => [a, c.keys[ai]]).concat(spec.legend ? [[spec.legend, s]] : []);
          const cls = 'atl-mark' + dimCls(opts, pairs);
          const col = pal[(ns > 1 ? j : 0) % pal.length];
          let ya, yb, xx, ww;
          if (stacked) { const base = v >= 0 ? acc : accN; ya = sy(base); yb = sy(base + v); if (v >= 0) acc += v; else accN += v; xx = xb0 + (band - bw) / 2; ww = bw; }
          else { const sub = bw / ns; ya = sy(0); yb = sy(v); xx = xb0 + (band - bw) / 2 + j * sub; ww = Math.max(1.5, sub - (ns > 1 ? 1 : 0)); }
          out += `<rect x="${xx}" y="${Math.min(ya, yb)}" width="${ww}" height="${Math.max(0.5, Math.abs(yb - ya))}" rx="2" fill="${col}" class="${cls}"${selAttr(pairs)}><title>${esc(catLbl[i] + (s != null ? ' · ' + label(m, spec.legend, s) : '') + ': ' + (pct ? D().fmtShort(v, 'pct') : fmtF(m, d.mid, v)))}</title></rect>`;
          if (showLbl && !stacked && ww >= 16 && ns <= 2) out += `<text x="${xx + ww / 2}" y="${Math.min(ya, yb) - 3}" text-anchor="middle" class="atl-t-lbl">${esc(fmtS(m, d.mid, v))}</text>`;
          if (showLbl && stacked && pct && Math.abs(yb - ya) > 14 && ww > 24) out += `<text x="${xx + ww / 2}" y="${(ya + yb) / 2 + 3.5}" text-anchor="middle" class="atl-t-in">${esc(Math.round(v * 100) + '%')}</text>`;
        });
        if (showLbl && stacked && !pct && bw > 18) out += `<text x="${lx}" y="${sy(acc) - 3}" text-anchor="middle" class="atl-t-lbl">${esc(fmtS(m, d.mid, acc + accN))}</text>`;
      });
      out += `<line x1="${x0}" x2="${x1}" y1="${sy(0)}" y2="${sy(0)}" class="atl-base"/></svg>`;
    }
    const legend = ns > 1 ? legendHtml(d.series.map((s) => label(m, spec.legend, s)), pal) : '';
    const more = d.more && !d.topN ? `<div class="atl-more">+ încă ${d.more} (folosește un filtru Top N)</div>` : '';
    return legend + out + more;
  }

  /* ---------- Pie / Donut ---------- */
  function pie(m, spec, opts, donut) {
    const mid = spec.values[0];
    const r = run(m, spec, opts, [spec.legend], [mid]);
    let g = r.groups.filter((x) => (x.vals[mid] || 0) > 0).sort((a, b) => b.vals[mid] - a.vals[mid]);
    if (!g.length) return empty();
    if (g.length > 8) {
      const rest = g.slice(7);
      g = g.slice(0, 7).concat([{ keys: ['Altele'], vals: { [mid]: rest.reduce((s, x) => s + x.vals[mid], 0) }, other: true }]);
    }
    const tot = g.reduce((s, x) => s + x.vals[mid], 0) || 1;
    const w = opts.w, h = opts.h;
    const lgW = opts.compact ? 0 : Math.min(150, w * 0.36);
    const R = Math.max(20, Math.min((w - lgW) / 2 - 10, h / 2 - 10));
    const cx = (w - lgW) / 2, cy = h / 2;
    const rin = donut ? R * 0.6 : 0;
    let a = -Math.PI / 2;
    let s = svgOpen(w, h);
    const pal = opts.palette;
    g.forEach((x, i) => {
      const f = x.vals[mid] / tot;
      const a2 = a + f * Math.PI * 2;
      const large = f > 0.5 ? 1 : 0;
      const p = (ang, rad) => [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)];
      const [x0, y0] = p(a, R), [x1, y1] = p(a2 - 1e-6, R);
      let path;
      if (donut) { const [x2, y2] = p(a2 - 1e-6, rin), [x3, y3] = p(a, rin); path = `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${rin},${rin} 0 ${large} 0 ${x3},${y3} Z`; }
      else path = f >= 0.9999 ? `M${cx - R},${cy} a${R},${R} 0 1,0 ${2 * R},0 a${R},${R} 0 1,0 ${-2 * R},0` : `M${cx},${cy} L${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} Z`;
      const pairs = x.other ? [] : [[spec.legend, x.keys[0]]];
      const lbl = x.other ? 'Altele' : label(m, spec.legend, x.keys[0]);
      s += `<path d="${path}" fill="${pal[i % pal.length]}" class="atl-mark atl-slice${x.other ? '' : dimCls(opts, pairs)}"${x.other ? '' : selAttr(pairs)}><title>${esc(lbl + ': ' + fmtF(m, mid, x.vals[mid]) + ' (' + D().fmtShort(f, 'pct') + ')')}</title></path>`;
      if (f > 0.07 && R > 50) { const [tx, ty] = p((a + a2) / 2, donut ? (R + rin) / 2 : R * 0.64); s += `<text x="${tx}" y="${ty + 4}" text-anchor="middle" class="atl-t-in">${Math.round(f * 100)}%</text>`; }
      a = a2;
    });
    if (donut) s += `<text x="${cx}" y="${cy + 2}" text-anchor="middle" class="atl-t-big" style="font-size:${Math.max(12, rin * 0.38)}px">${esc(fmtS(m, mid, tot))}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" class="atl-t-sm">total</text>`;
    if (lgW) {
      const lh = 18, y0 = Math.max(8, cy - (g.length * lh) / 2);
      g.forEach((x, i) => {
        const lbl = x.other ? 'Altele' : label(m, spec.legend, x.keys[0]);
        s += `<rect x="${w - lgW + 4}" y="${y0 + i * lh}" width="10" height="10" rx="2" fill="${pal[i % pal.length]}"/><text x="${w - lgW + 19}" y="${y0 + i * lh + 9}" class="atl-t-cat">${esc(clip(lbl, lgW - 22, 11))}</text>`;
      });
    }
    return s + '</svg>';
  }

  /* ---------- Treemap (squarified) ---------- */
  function squarify(items, x, y, w, h) {
    const out = [];
    const total = items.reduce((s, it) => s + it.v, 0);
    if (!total || w <= 0 || h <= 0) return out;
    const scaled = items.map((it) => Object.assign({}, it, { a: (it.v / total) * w * h }));
    let rect = { x, y, w, h };
    let row = [];
    const worst = (r, side) => {
      const s = r.reduce((t, it) => t + it.a, 0);
      const mx = Math.max(...r.map((it) => it.a)), mn = Math.min(...r.map((it) => it.a));
      return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
    };
    const layoutRow = (r) => {
      const s = r.reduce((t, it) => t + it.a, 0);
      if (rect.w >= rect.h) {
        const cw = s / rect.h; let yy = rect.y;
        r.forEach((it) => { const hh = it.a / cw; out.push(Object.assign(it, { x: rect.x, y: yy, w: cw, h: hh })); yy += hh; });
        rect = { x: rect.x + cw, y: rect.y, w: rect.w - cw, h: rect.h };
      } else {
        const rh = s / rect.w; let xx = rect.x;
        r.forEach((it) => { const ww = it.a / rh; out.push(Object.assign(it, { x: xx, y: rect.y, w: ww, h: rh })); xx += ww; });
        rect = { x: rect.x, y: rect.y + rh, w: rect.w, h: rect.h - rh };
      }
    };
    scaled.forEach((it) => {
      const side = Math.min(rect.w, rect.h);
      if (!row.length || worst(row.concat(it), side) <= worst(row, side)) row.push(it);
      else { layoutRow(row); row = [it]; }
    });
    if (row.length) layoutRow(row);
    return out;
  }
  function treemap(m, spec, opts) {
    const mid = spec.values[0];
    const r = run(m, spec, opts, [spec.group, spec.details], [mid]);
    const groups = new Map();
    r.groups.forEach((g) => {
      if (!(g.vals[mid] > 0)) return;
      const k = D().keyOf(g.keys[0]);
      if (!groups.has(k)) groups.set(k, { key: g.keys[0], v: 0, kids: [] });
      const G = groups.get(k);
      G.v += g.vals[mid];
      G.kids.push({ key: g.keys[1], v: g.vals[mid] });
    });
    const list = [...groups.values()].sort((a, b) => b.v - a.v);
    if (!list.length) return empty();
    const w = opts.w, h = opts.h;
    const pal = opts.palette;
    let s = svgOpen(w, h);
    const tops = squarify(list, 0, 0, w, h);
    tops.forEach((G, gi) => {
      const col = pal[list.indexOf(list.find((x) => x.key === G.key)) % pal.length];
      const kids = squarify(G.kids.sort((a, b) => b.v - a.v), G.x, G.y, G.w, G.h);
      kids.forEach((k) => {
        const pairs = [[spec.group, G.key], [spec.details, k.key]];
        s += `<rect x="${k.x + 0.5}" y="${k.y + 0.5}" width="${Math.max(0, k.w - 1)}" height="${Math.max(0, k.h - 1)}" fill="${col}" class="atl-mark atl-tm${dimCls(opts, pairs)}"${selAttr(pairs)}><title>${esc(label(m, spec.group, G.key) + ' · ' + label(m, spec.details, k.key) + ': ' + fmtF(m, mid, k.v))}</title></rect>`;
        if (k.w > 54 && k.h > 26) s += `<text x="${k.x + 5}" y="${k.y + 14}" class="atl-t-in atl-t-l">${esc(clip(label(m, spec.details, k.key), k.w - 10, 10.5))}</text>`;
        if (k.w > 54 && k.h > 40) s += `<text x="${k.x + 5}" y="${k.y + 27}" class="atl-t-in atl-t-l atl-t-soft">${esc(fmtS(m, mid, k.v))}</text>`;
      });
      s += `<rect x="${G.x}" y="${G.y}" width="${G.w}" height="${G.h}" class="atl-tm-g"/>`;
      if (G.w > 70 && G.h > 50 && !opts.compact) s += `<text x="${G.x + G.w - 5}" y="${G.y + G.h - 6}" text-anchor="end" class="atl-t-in atl-t-g">${esc(clip(label(m, spec.group, G.key), G.w - 10, 11))}</text>`;
    });
    return s + '</svg>';
  }

  /* ---------- Line / Area / Combo ---------- */
  function timeSeries(m, spec, opts, mids) {
    const axis = spec.axis;
    const by = spec.legend ? axis.concat(spec.legend) : axis;
    const r = run(m, spec, opts, by, mids);
    const pts = new Map();
    r.groups.forEach((g) => {
      if (g.keys.slice(0, axis.length).some((k) => k == null)) return;
      const k = g.keys.slice(0, axis.length).map(D().keyOf).join('§');
      if (!pts.has(k)) pts.set(k, { keys: g.keys.slice(0, axis.length) });
    });
    const xs = sortGroups(m, [...pts.values()], axis, 'axis');
    const series = spec.legend ? distinctSorted(m, spec.legend, r.groups.map((g) => g.keys[axis.length])).filter((x) => x != null) : [null];
    const val = new Map();
    r.groups.forEach((g) => {
      const k = g.keys.slice(0, axis.length).map(D().keyOf).join('§') + '|' + (spec.legend ? D().keyOf(g.keys[axis.length]) : '∅');
      val.set(k, g.vals);
    });
    const get = (x, s, mid) => { const v = val.get(x.keys.map(D().keyOf).join('§') + '|' + (spec.legend ? D().keyOf(s) : '∅')); return v ? v[mid] : null; };
    // totaluri pe X (pentru combo fără legendă pe linie)
    const rx = spec.legend ? run(m, spec, opts, axis, mids) : r;
    const xval = new Map();
    rx.groups.forEach((g) => xval.set(g.keys.map(D().keyOf).join('§'), g.vals));
    const getX = (x, mid) => { const v = xval.get(x.keys.map(D().keyOf).join('§')); return v ? v[mid] : null; };
    return { xs, series, get, getX };
  }

  function xLabels(m, axis, xs) {
    const multi = axis.length > 1;
    return xs.map((x, i) => {
      if (!multi) return { main: label(m, axis[0], x.keys[0], true), sub: '' };
      const prev = xs[i - 1];
      const main = label(m, axis[axis.length - 1], x.keys[axis.length - 1], true);
      const sub = !prev || D().keyOf(prev.keys[0]) !== D().keyOf(x.keys[0]) ? label(m, axis[0], x.keys[0]) : '';
      return { main, sub };
    });
  }

  function lineLike(m, spec, opts, kind) {
    const mid = spec.values[0];
    const mids = kind === 'combo' ? [mid, spec.line] : [mid];
    const d = timeSeries(m, spec, opts, mids);
    if (!d.xs.length) return empty();
    const pal = opts.palette;
    const w = opts.w, legendH = (d.series.length > 1 || kind === 'combo') ? 22 : 0;
    const h = opts.h - legendH;
    const multi = spec.axis.length > 1;
    const x0 = opts.compact ? 6 : 42, x1 = w - (kind === 'combo' && !opts.compact ? 42 : 10), y0 = 10, y1 = h - (opts.compact ? 8 : multi ? 30 : 20);
    const n = d.xs.length;
    const pct = kind === 'area' && spec.mode === 'percent';
    const stacked = (kind === 'area' && (spec.mode === 'stacked' || pct)) || (kind === 'combo' && spec.mode === 'stacked' && spec.legend);
    const xTot = pct ? d.xs.map((x) => d.series.reduce((s, se) => s + Math.max(0, d.get(x, se, mid) || 0), 0) || 1) : null;
    let lo = 0, hi = 0;
    if (pct) hi = 1;
    else d.xs.forEach((x) => {
      if (stacked) { let s = 0; d.series.forEach((se) => { s += d.get(x, se, mid) || 0; }); hi = Math.max(hi, s); }
      else d.series.forEach((se) => { const v = d.get(x, se, mid); if (v != null) { hi = Math.max(hi, v); lo = Math.min(lo, v); } });
    });
    const ax = valueAxis(lo, hi, 4);
    const isBars = kind === 'combo';
    const band = (x1 - x0) / n;
    const px = (i) => (isBars ? x0 + band * (i + 0.5) : n === 1 ? (x0 + x1) / 2 : x0 + (i / (n - 1)) * (x1 - x0));
    const sy = (v) => y1 - ((v - ax.lo) / (ax.hi - ax.lo)) * (y1 - y0);
    let s = svgOpen(w, h);
    if (!opts.compact) ax.t.forEach((t) => { s += `<line x1="${x0}" x2="${x1}" y1="${sy(t)}" y2="${sy(t)}" class="atl-grid"/><text x="${x0 - 5}" y="${sy(t) + 3.5}" text-anchor="end" class="atl-t-ax">${esc(pct || meas(m, mid).fmt === 'pct' ? Math.round(t * 100) + '%' : D().fmtShort(t))}</text>`; });
    const labels = xLabels(m, spec.axis, d.xs);
    const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((x1 - x0) / 34))));
    if (!opts.compact) labels.forEach((L, i) => {
      if (i % every === 0 || L.sub) s += `<text x="${px(i)}" y="${y1 + 13}" text-anchor="middle" class="atl-t-ax">${esc(i % every === 0 ? L.main : '')}</text>`;
      if (L.sub) s += `<text x="${px(i)}" y="${y1 + 26}" text-anchor="${multi ? 'start' : 'middle'}" class="atl-t-cat atl-t-b">${esc(L.sub)}</text><line x1="${px(i) - (isBars ? band / 2 : 0)}" x2="${px(i) - (isBars ? band / 2 : 0)}" y1="${y1}" y2="${y1 + 28}" class="atl-grid"/>`;
    });
    if (isBars) {
      const bw = Math.max(2, band * 0.7);
      d.xs.forEach((x, i) => {
        let acc = 0;
        const ns = d.series.length;
        d.series.forEach((se, j) => {
          const v = d.get(x, se, mid) || 0;
          const pairs = spec.axis.map((a, ai) => [a, x.keys[ai]]).concat(spec.legend ? [[spec.legend, se]] : []);
          const col = pal[(ns > 1 ? j : 0) % pal.length];
          if (stacked) { s += `<rect x="${px(i) - bw / 2}" y="${sy(acc + v)}" width="${bw}" height="${Math.max(0.5, sy(acc) - sy(acc + v))}" fill="${col}" class="atl-mark${dimCls(opts, pairs)}"${selAttr(pairs)}><title>${esc(labels[i].main + ': ' + fmtF(m, mid, v))}</title></rect>`; acc += v; }
          else { const sub = bw / ns; s += `<rect x="${px(i) - bw / 2 + j * sub}" y="${Math.min(sy(0), sy(v))}" width="${Math.max(1, sub - 1)}" height="${Math.max(0.5, Math.abs(sy(0) - sy(v)))}" fill="${col}" class="atl-mark${dimCls(opts, pairs)}"${selAttr(pairs)}><title>${esc(labels[i].main + ': ' + fmtF(m, mid, v))}</title></rect>`; }
        });
      });
      // linia pe axa secundară
      const lv = d.xs.map((x) => d.getX(x, spec.line));
      const lmax = valueAxis(Math.min(0, ...lv.filter((v) => v != null)), Math.max(0, ...lv.filter((v) => v != null)), 4);
      const sy2 = (v) => y1 - ((v - lmax.lo) / (lmax.hi - lmax.lo)) * (y1 - y0);
      const lc = '#F97316';
      const path = lv.map((v, i) => (v == null ? null : `${px(i)},${sy2(v)}`)).filter(Boolean);
      s += `<polyline points="${path.join(' ')}" class="atl-line" style="stroke:${lc}"/>`;
      lv.forEach((v, i) => { if (v != null) s += `<circle cx="${px(i)}" cy="${sy2(v)}" r="3" style="fill:${lc}"><title>${esc(labels[i].main + ' · ' + meas(m, spec.line).name + ': ' + fmtF(m, spec.line, v))}</title></circle>`; });
      if (!opts.compact) lmax.t.forEach((t) => { s += `<text x="${x1 + 5}" y="${sy2(t) + 3.5}" class="atl-t-ax">${esc(meas(m, spec.line).fmt === 'pct' ? Math.round(t * 100) + '%' : D().fmtShort(t))}</text>`; });
    } else {
      const base = d.xs.map(() => 0);
      d.series.forEach((se, j) => {
        const col = pal[j % pal.length];
        const vals = d.xs.map((x, i) => { const v = d.get(x, se, mid); return pct ? Math.max(0, v || 0) / xTot[i] : v; });
        const top = vals.map((v, i) => (stacked ? base[i] + (v || 0) : v));
        const pts = top.map((v, i) => (v == null ? null : [px(i), sy(v)]));
        const segs = pts.filter(Boolean);
        if (kind === 'area') {
          const bot = d.xs.map((_, i) => [px(i), sy(stacked ? base[i] : 0)]).reverse();
          if (segs.length) s += `<path d="M${segs.map((p) => p.join(',')).join(' L')} L${bot.map((p) => p.join(',')).join(' L')} Z" style="fill:${col};opacity:${stacked ? 0.75 : 0.28}"/>`;
        }
        s += `<polyline points="${segs.map((p) => p.join(',')).join(' ')}" class="atl-line" style="stroke:${col}"/>`;
        if (n <= 24 && !opts.compact) pts.forEach((p, i) => {
          if (!p) return;
          const pairs = spec.axis.map((a, ai) => [a, d.xs[i].keys[ai]]).concat(spec.legend ? [[spec.legend, se]] : []);
          s += `<circle cx="${p[0]}" cy="${p[1]}" r="3.2" style="fill:${col}" class="atl-mark atl-pt${dimCls(opts, pairs)}"${selAttr(pairs)}><title>${esc(labels[i].main + (labels[i].sub ? ' ' + labels[i].sub : '') + (se != null ? ' · ' + label(m, spec.legend, se) : '') + ': ' + (pct ? D().fmtShort(vals[i], 'pct') : fmtF(m, mid, vals[i])))}</title></circle>`;
        });
        if (stacked) vals.forEach((v, i) => { base[i] += v || 0; });
      });
    }
    s += '</svg>';
    let legend = '';
    if (kind === 'combo') legend = `<div class="atl-legend">${spec.legend ? d.series.map((se, j) => `<span class="atl-leg-i"><i style="background:${pal[j % pal.length]}"></i>${esc(label(m, spec.legend, se))}</span>`).join('') : `<span class="atl-leg-i"><i style="background:${pal[0]}"></i>${esc(meas(m, mid).name)}</span>`}<span class="atl-leg-i"><i class="ln" style="background:#F97316"></i>${esc(meas(m, spec.line).name)}</span></div>`;
    else if (d.series.length > 1) legend = legendHtml(d.series.map((se) => label(m, spec.legend, se)), pal);
    return legend + s;
  }

  /* ---------- Waterfall ---------- */
  function waterfall(m, spec, opts) {
    const mid = spec.values[0];
    let steps = [];
    if (spec.bridge) {
      const r = run(m, spec, opts, [], ['list', 'disc', 'total', 'valid']);
      const T = r.total;
      const S = m.R.status;
      const netId = m.R.net ? m.fieldId(m.fact.name, m.R.net.name) : null;
      let net = 0;
      if (netId) r.rows.forEach((row) => { if (typeof row[netId] === 'number') net += row[netId]; });
      spec.bridge.forEach((b) => {
        if (b.kind === 'list') steps.push({ label: b.label, v: T.list, start: true });
        else if (b.kind === 'disc') steps.push({ label: b.label, v: -T.disc });
        else if (b.kind === 'taxes') steps.push({ label: b.label, v: T.total - net });
        else steps.push({ label: b.label, v: -(T.total - T.valid) });
      });
      steps.push({ label: 'Total', v: T.valid, total: true });
      void S;
    } else if (spec.breakdown) {
      const ys = (spec.fixedFilters && spec.fixedFilters[0] && spec.fixedFilters[0].values) || m.years.slice(-2);
      const r = run(m, spec, opts, [spec.category, spec.breakdown], [mid]);
      const by = new Map();
      const yt = {};
      r.groups.forEach((g) => {
        const y = g.keys[0];
        yt[y] = (yt[y] || 0) + (g.vals[mid] || 0);
        const k = D().keyOf(g.keys[1]);
        if (!by.has(k)) by.set(k, { key: g.keys[1], a: 0, b: 0 });
        if (y === ys[0]) by.get(k).a += g.vals[mid] || 0; else if (y === ys[1]) by.get(k).b += g.vals[mid] || 0;
      });
      let deltas = [...by.values()].map((x) => ({ key: x.key, v: x.b - x.a })).sort((a, b) => Math.abs(b.v) - Math.abs(a.v));
      if (deltas.length > 5) { const rest = deltas.slice(5).reduce((s, x) => s + x.v, 0); deltas = deltas.slice(0, 5).concat([{ key: 'Other', v: rest, other: true }]); }
      steps.push({ label: String(ys[0]), v: yt[ys[0]] || 0, start: true, pairs: [[spec.category, ys[0]]] });
      deltas.forEach((x) => steps.push({ label: x.other ? 'Other' : label(m, spec.breakdown, x.key), v: x.v, pairs: x.other ? null : [[spec.breakdown, x.key]] }));
      steps.push({ label: String(ys[1]), v: yt[ys[1]] || 0, total: true, pairs: [[spec.category, ys[1]]] });
    } else {
      const r = run(m, spec, opts, [spec.category], [mid]);
      sortGroups(m, r.groups.filter((g) => g.keys[0] != null), [spec.category], 'axis').forEach((g) => steps.push({ label: label(m, spec.category, g.keys[0], true), v: g.vals[mid] || 0, pairs: [[spec.category, g.keys[0]]] }));
      steps.push({ label: 'Total', v: r.total[mid] || 0, total: true });
    }
    if (steps.length < 2) return empty();
    // cumul
    let acc = 0, lo = 0, hi = 0;
    steps.forEach((st) => {
      if (st.start) { st.a = 0; st.b = st.v; acc = st.v; }
      else if (st.total) { st.a = 0; st.b = st.v; }
      else { st.a = acc; st.b = acc + st.v; acc = st.b; }
      lo = Math.min(lo, st.a, st.b); hi = Math.max(hi, st.a, st.b);
    });
    const ax = valueAxis(lo, hi, 4);
    const w = opts.w, h = opts.h - 20;
    const x0 = opts.compact ? 6 : 42, x1 = w - 6, y0 = 14, y1 = h - 20;
    const band = (x1 - x0) / steps.length;
    const sy = (v) => y1 - ((v - ax.lo) / (ax.hi - ax.lo)) * (y1 - y0);
    const cUp = '#10B981', cDn = '#EF4444', cT = opts.palette[0];
    let s = svgOpen(w, h);
    if (!opts.compact) ax.t.forEach((t) => { s += `<line x1="${x0}" x2="${x1}" y1="${sy(t)}" y2="${sy(t)}" class="atl-grid"/><text x="${x0 - 5}" y="${sy(t) + 3.5}" text-anchor="end" class="atl-t-ax">${esc(D().fmtShort(t))}</text>`; });
    const fs = opts.compact ? 9.5 : 10.5;
    steps.forEach((st, i) => {
      const bx = x0 + i * band + band * 0.15, bw = band * 0.7;
      const col = st.start || st.total ? cT : st.v >= 0 ? cUp : cDn;
      const pairs = st.pairs || [];
      s += `<rect x="${bx}" y="${Math.min(sy(st.a), sy(st.b))}" width="${bw}" height="${Math.max(0.8, Math.abs(sy(st.a) - sy(st.b)))}" fill="${col}" rx="1.5" class="atl-mark${pairs.length ? dimCls(opts, pairs) : ''}"${pairs.length ? selAttr(pairs) : ''}><title>${esc(st.label + ': ' + fmtF(m, mid, st.v))}</title></rect>`;
      if (i < steps.length - 1 && !steps[i + 1].total) s += `<line x1="${bx + bw}" x2="${bx + band}" y1="${sy(st.b)}" y2="${sy(st.b)}" class="atl-grid"/>`;
      if (bw > 22 && opts.labels !== false) s += `<text x="${bx + bw / 2}" y="${Math.min(sy(st.a), sy(st.b)) - 3}" text-anchor="middle" class="atl-t-lbl" style="font-size:${fs - 0.5}px">${esc((st.v > 0 && !st.start && !st.total ? '+' : '') + D().fmtShort(st.v))}</text>`;
      s += `<text x="${bx + bw / 2}" y="${y1 + 13}" text-anchor="middle" class="atl-t-cat" style="font-size:${fs}px">${esc(clip(st.label, band - 2, fs))}<title>${esc(st.label)}</title></text>`;
    });
    s += '</svg>';
    const lg = `<div class="atl-legend"><span class="atl-leg-i"><i style="background:${cUp}"></i>Increase</span><span class="atl-leg-i"><i style="background:${cDn}"></i>Decrease</span><span class="atl-leg-i"><i style="background:${cT}"></i>Total</span></div>`;
    return lg + s;
  }

  /* ---------- Funnel ---------- */
  function funnel(m, spec, opts) {
    const mid = spec.values[0];
    const r = run(m, spec, opts, spec.axis, [mid]);
    const g = r.groups.filter((x) => x.vals[mid] > 0).sort((a, b) => b.vals[mid] - a.vals[mid]).slice(0, 10);
    if (!g.length) return empty();
    const first = g[0].vals[mid];
    const w = opts.w, h = opts.h;
    const lw = opts.compact ? Math.min(90, w * 0.3) : Math.min(140, w * 0.28);
    const x0 = lw, x1 = w - 6;
    const bh = (h - 8) / g.length;
    let s = svgOpen(w, h);
    g.forEach((x, i) => {
      const f = x.vals[mid] / first;
      const bw = Math.max(2, f * (x1 - x0));
      const bx = x0 + (x1 - x0 - bw) / 2;
      const y = 4 + i * bh;
      const pairs = spec.axis.map((a, ai) => [a, x.keys[ai]]);
      const lbl = keyLabel(m, spec.axis, x.keys);
      s += `<text x="${lw - 6}" y="${y + bh / 2 + 4}" text-anchor="end" class="atl-t-cat">${esc(clip(lbl, lw - 8, 11))}</text>`;
      s += `<rect x="${bx}" y="${y + bh * 0.1}" width="${bw}" height="${bh * 0.8}" fill="${opts.palette[0]}" class="atl-mark${dimCls(opts, pairs)}"${selAttr(pairs)}><title>${esc(lbl + ': ' + fmtF(m, mid, x.vals[mid]))}</title></rect>`;
      if (bh > 14) s += `<text x="${x0 + (x1 - x0) / 2}" y="${y + bh / 2 + 4}" text-anchor="middle" class="atl-t-in">${esc(fmtS(m, mid, x.vals[mid]) + (i ? ' · ' + Math.round(f * 100) + '%' : ''))}</text>`;
    });
    return s + '</svg>';
  }

  /* ---------- Scatter ---------- */
  function scatter(m, spec, opts) {
    const mids = [spec.y].concat(spec.xField ? [] : [spec.x]);
    const by = [spec.details].concat(spec.xField ? [spec.xField] : []);
    const r = run(m, spec, opts, by, mids);
    const pts = new Map();
    r.groups.forEach((g) => {
      if (g.keys[0] == null) return;
      const k = D().keyOf(g.keys[0]);
      const p = pts.get(k) || { key: g.keys[0], x: 0, xn: 0, y: 0 };
      p.y += g.vals[spec.y] || 0;
      if (spec.xField) { if (typeof g.keys[1] === 'number') { p.x = g.keys[1]; p.xn = 1; } }
      else { p.x = g.vals[spec.x]; p.xn = 1; }
      pts.set(k, p);
    });
    // y non-aditiv (ex. medie): recalculăm pe detaliu
    if (!meas(m, spec.y).additive) { const r2 = run(m, spec, opts, [spec.details], [spec.y]); r2.groups.forEach((g) => { const p = pts.get(D().keyOf(g.keys[0])); if (p) p.y = g.vals[spec.y]; }); }
    // Size (bubble chart): a treia măsură, pe detaliu
    let sMax = 0;
    if (spec.size) {
      const r3 = run(m, spec, opts, [spec.details], [spec.size]);
      r3.groups.forEach((g) => { const p = pts.get(D().keyOf(g.keys[0])); if (p) { p.s = Math.max(0, g.vals[spec.size] || 0); sMax = Math.max(sMax, p.s); } });
    }
    let legendMap = null, legendVals = [];
    if (spec.legend) {
      const rl = run(m, spec, opts, [spec.details, spec.legend], []);
      legendMap = new Map();
      rl.groups.forEach((g) => legendMap.set(D().keyOf(g.keys[0]), g.keys[1]));
      legendVals = distinctSorted(m, spec.legend, [...legendMap.values()]);
    }
    const list = [...pts.values()].filter((p) => p.xn && p.x != null && p.y != null);
    if (!list.length) return empty();
    if (spec.size) list.sort((a, b) => (b.s || 0) - (a.s || 0)); // bulele mari dedesubt
    const w = opts.w, legendH = spec.legend ? 22 : 0, h = opts.h - legendH;
    const x0 = opts.compact ? 8 : 44, x1 = w - 10, y0 = 10, y1 = h - (opts.compact ? 8 : 22);
    const ax = valueAxis(Math.min(0, ...list.map((p) => p.x)), Math.max(...list.map((p) => p.x)), 4);
    const ay = valueAxis(Math.min(0, ...list.map((p) => p.y)), Math.max(...list.map((p) => p.y)), 4);
    const sx = (v) => x0 + ((v - ax.lo) / (ax.hi - ax.lo)) * (x1 - x0);
    const sy = (v) => y1 - ((v - ay.lo) / (ay.hi - ay.lo)) * (y1 - y0);
    const xfmt = spec.xField ? 'number' : meas(m, spec.x).fmt;
    let s = svgOpen(w, h);
    if (!opts.compact) {
      ay.t.forEach((t) => { s += `<line x1="${x0}" x2="${x1}" y1="${sy(t)}" y2="${sy(t)}" class="atl-grid"/><text x="${x0 - 5}" y="${sy(t) + 3.5}" text-anchor="end" class="atl-t-ax">${esc(D().fmtShort(t, meas(m, spec.y).fmt))}</text>`; });
      ax.t.forEach((t) => { s += `<text x="${sx(t)}" y="${y1 + 14}" text-anchor="middle" class="atl-t-ax">${esc(D().fmtShort(t, xfmt))}</text>`; });
      const ax_ = list.reduce((a, p) => a + p.x, 0) / list.length, ay_ = list.reduce((a, p) => a + p.y, 0) / list.length;
      s += `<line x1="${sx(ax_)}" x2="${sx(ax_)}" y1="${y0}" y2="${y1}" class="atl-ref"/><line x1="${x0}" x2="${x1}" y1="${sy(ay_)}" y2="${sy(ay_)}" class="atl-ref"/>`;
    }
    list.forEach((p) => {
      const lv = legendMap ? legendMap.get(D().keyOf(p.key)) : null;
      const col = legendMap ? opts.palette[Math.max(0, legendVals.indexOf(lv)) % opts.palette.length] : opts.palette[0];
      const pairs = [[spec.details, p.key]];
      const rad = spec.size ? (opts.compact ? 3 : 4) + Math.sqrt((p.s || 0) / (sMax || 1)) * Math.min(opts.compact ? 14 : 24, Math.min(w, h) * 0.08) : (opts.compact ? 4 : 5.5);
      s += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="${rad}" style="fill:${col}" class="atl-mark atl-dot${spec.size ? ' atl-bubble' : ''}${dimCls(opts, pairs)}"${selAttr(pairs)}><title>${esc(label(m, spec.details, p.key) + '\n' + (spec.xField ? fieldOf(m, spec.xField).col : meas(m, spec.x).name) + ': ' + D().fmtFull(p.x, xfmt) + '\n' + meas(m, spec.y).name + ': ' + fmtF(m, spec.y, p.y) + (spec.size ? '\n' + meas(m, spec.size).name + ': ' + fmtF(m, spec.size, p.s) : ''))}</title></circle>`;
      if (!opts.compact && list.length <= 14) s += `<text x="${sx(p.x) + 7}" y="${sy(p.y) + 3.5}" class="atl-t-sm">${esc(clip(label(m, spec.details, p.key), 90, 10))}</text>`;
    });
    s += '</svg>';
    return (spec.legend ? legendHtml(legendVals.map((v) => label(m, spec.legend, v)), opts.palette) : '') + s;
  }

  /* ---------- Map (bule pe coordonate) ---------- */
  function mapVis(m, spec, opts) {
    const mid = spec.values[0];
    const r = run(m, spec, opts, [spec.name, spec.lat, spec.lon], [mid]);
    const list = r.groups.filter((g) => typeof g.keys[1] === 'number' && typeof g.keys[2] === 'number' && (g.vals[mid] || 0) > 0);
    if (!list.length) return empty();
    const w = opts.w, h = opts.h;
    let la0 = Math.min(...list.map((g) => g.keys[1])), la1 = Math.max(...list.map((g) => g.keys[1]));
    let lo0 = Math.min(...list.map((g) => g.keys[2])), lo1 = Math.max(...list.map((g) => g.keys[2]));
    const padA = Math.max(0.6, (la1 - la0) * 0.2), padO = Math.max(0.9, (lo1 - lo0) * 0.2);
    la0 -= padA; la1 += padA; lo0 -= padO; lo1 += padO;
    // păstrăm proporția aproximativă a hărții
    const k = Math.cos(((la0 + la1) / 2) * Math.PI / 180);
    const spanX = (lo1 - lo0) * k, spanY = la1 - la0;
    const sc = Math.min((w - 16) / spanX, (h - 16) / spanY);
    const ox = (w - spanX * sc) / 2, oy = (h - spanY * sc) / 2;
    const sx = (lo) => ox + (lo - lo0) * k * sc;
    const sy = (la) => oy + (la1 - la) * sc;
    const max = Math.max(...list.map((g) => g.vals[mid]));
    let s = svgOpen(w, h, 'atl-map');
    s += `<rect x="0" y="0" width="${w}" height="${h}" class="atl-map-bg"/>`;
    for (let la = Math.ceil(la0); la <= la1; la++) s += `<line x1="0" x2="${w}" y1="${sy(la)}" y2="${sy(la)}" class="atl-map-grid"/>`;
    for (let lo = Math.ceil(lo0); lo <= lo1; lo++) s += `<line x1="${sx(lo)}" x2="${sx(lo)}" y1="0" y2="${h}" class="atl-map-grid"/>`;
    list.sort((a, b) => b.vals[mid] - a.vals[mid]).forEach((g) => {
      const rr = 4 + Math.sqrt(g.vals[mid] / max) * Math.min(26, Math.min(w, h) * 0.09);
      const pairs = [[spec.name, g.keys[0]]];
      s += `<circle cx="${sx(g.keys[2])}" cy="${sy(g.keys[1])}" r="${rr}" style="fill:${opts.palette[0]}" class="atl-mark atl-bubble${dimCls(opts, pairs)}"${selAttr(pairs)}><title>${esc(label(m, spec.name, g.keys[0]) + ': ' + fmtF(m, mid, g.vals[mid]))}</title></circle>`;
      if (!opts.compact) s += `<text x="${sx(g.keys[2])}" y="${sy(g.keys[1]) + rr + 11}" text-anchor="middle" class="atl-t-sm">${esc(clip(label(m, spec.name, g.keys[0]), 110, 10))}</text>`;
    });
    return s + '</svg>';
  }

  /* ---------- Table / Matrix ---------- */
  function table(m, spec, opts) {
    const r = run(m, spec, opts, [spec.rows], spec.values);
    const g = sortGroups(m, r.groups, [spec.rows], 'desc', spec.values[0]);
    if (!g.length) return empty();
    const max = Math.max(...g.map((x) => Math.abs(x.vals[spec.values[0]] || 0))) || 1;
    const lim = opts.compact ? 6 : 200;
    const head = `<tr><th>${esc(fieldOf(m, spec.rows).col)}</th>${spec.values.map((id) => `<th class="n">${esc(meas(m, id).name)}</th>`).join('')}</tr>`;
    const rows = g.slice(0, lim).map((x) => {
      const pairs = [[spec.rows, x.keys[0]]];
      return `<tr class="atl-mark${dimCls(opts, pairs)}"${selAttr(pairs)}><td>${esc(label(m, spec.rows, x.keys[0]))}</td>${spec.values.map((id, i) => {
        const v = x.vals[id];
        const bar = i === 0 ? `<i class="atl-databar" style="width:${Math.round((Math.abs(v || 0) / max) * 100)}%;background:${opts.palette[0]}"></i>` : '';
        return `<td class="n">${bar}<span>${esc(fmtF(m, id, v))}</span></td>`;
      }).join('')}</tr>`;
    }).join('');
    const more = g.length > lim ? `<tr class="atl-tr-more"><td colspan="${spec.values.length + 1}">… încă ${g.length - lim} rânduri</td></tr>` : '';
    const tot = `<tr class="atl-total"><td>Total</td>${spec.values.map((id) => `<td class="n">${esc(fmtF(m, id, r.total[id]))}</td>`).join('')}</tr>`;
    return `<div class="atl-table-wrap"><table class="atl-table"><thead>${head}</thead><tbody>${rows}${more}</tbody><tfoot>${tot}</tfoot></table></div>`;
  }

  function matrix(m, spec, opts) {
    const mid = spec.values[0];
    const r = run(m, spec, opts, [spec.rows, spec.cols], [mid]);
    const rowsR = run(m, spec, opts, [spec.rows], [mid]);
    const colsR = run(m, spec, opts, [spec.cols], [mid]);
    const rowKeys = sortGroups(m, rowsR.groups, [spec.rows], 'desc', mid).slice(0, opts.compact ? 6 : 40);
    const colKeys = sortGroups(m, colsR.groups.filter((g) => g.keys[0] != null), [spec.cols], 'axis');
    if (!rowKeys.length || !colKeys.length) return empty();
    const cell = new Map();
    r.groups.forEach((g) => cell.set(D().keyOf(g.keys[0]) + '|' + D().keyOf(g.keys[1]), g.vals[mid]));
    const vals = [...cell.values()].filter((v) => v != null);
    const mx = Math.max(...vals.map(Math.abs)) || 1;
    const col0 = opts.palette[0];
    const heat = (v) => (spec.heat && v != null ? `background:color-mix(in srgb, ${col0} ${Math.round((Math.abs(v) / mx) * 70)}%, transparent)` : '');
    const head = `<tr><th>${esc(fieldOf(m, spec.rows).col)}</th>${colKeys.map((c) => `<th class="n">${esc(label(m, spec.cols, c.keys[0]))}</th>`).join('')}<th class="n">Total</th></tr>`;
    const body = rowKeys.map((rk) => `<tr><td>${esc(label(m, spec.rows, rk.keys[0]))}</td>${colKeys.map((ck) => {
      const v = cell.get(D().keyOf(rk.keys[0]) + '|' + D().keyOf(ck.keys[0]));
      const pairs = [[spec.rows, rk.keys[0]], [spec.cols, ck.keys[0]]];
      return `<td class="n atl-mark${dimCls(opts, pairs)}" style="${heat(v)}"${selAttr(pairs)}>${v == null ? '' : esc(fmtS(m, mid, v))}</td>`;
    }).join('')}<td class="n b">${esc(fmtS(m, mid, rk.vals[mid]))}</td></tr>`).join('');
    const foot = `<tr class="atl-total"><td>Total</td>${colKeys.map((c) => `<td class="n">${esc(fmtS(m, mid, c.vals[mid]))}</td>`).join('')}<td class="n">${esc(fmtS(m, mid, rowsR.total[mid]))}</td></tr>`;
    return `<div class="atl-table-wrap"><table class="atl-table atl-matrix"><thead>${head}</thead><tbody>${body}</tbody><tfoot>${foot}</tfoot></table></div>`;
  }

  /* ---------- Decomposition tree ---------- */
  function decomp(m, spec, opts) {
    const mid = spec.values[0];
    const by = (spec.by || []).filter((id) => fieldOf(m, id));
    const path = opts.decompPath || [];
    const base = run(m, spec, opts, [], [mid]);
    const total = base.total[mid] || 0;
    const levels = [];
    let filters = [];
    for (let i = 0; i < by.length; i++) {
      const r = D().query(m, { by: [by[i]], measures: [mid], filters: filtersOf(spec, opts).concat(filters) });
      const g = r.groups.filter((x) => (x.vals[mid] || 0) > 0).sort((a, b) => b.vals[mid] - a.vals[mid]).slice(0, opts.compact ? 4 : 6);
      if (!g.length) break;
      const pick = path[i] != null ? g.find((x) => D().keyOf(x.keys[0]) === D().keyOf(path[i])) || g[0] : g[0];
      levels.push({ field: by[i], items: g, pick, sum: r.total[mid] || 1 });
      filters = filters.concat([{ field: by[i], op: 'in', values: [pick.keys[0]] }]);
      if (i >= 2) break;
    }
    if (!levels.length) return empty();
    const cols = levels.length + 1;
    const cw = opts.w / cols;
    let html = `<div class="atl-decomp" style="grid-template-columns:repeat(${cols},1fr)">`;
    html += `<div class="atl-dc-col"><div class="atl-dc-h">${esc(meas(m, mid).name)}</div><div class="atl-dc-node is-pick"><span>Total</span><b>${esc(fmtS(m, mid, total))}</b><i style="width:100%;background:${opts.palette[0]}"></i></div></div>`;
    levels.forEach((L, li) => {
      const mx = L.items[0].vals[mid] || 1;
      html += `<div class="atl-dc-col"><div class="atl-dc-h">${esc(fieldOf(m, L.field).col)}</div>${L.items.map((x) => {
        const pk = x === L.pick;
        return `<div class="atl-dc-node${pk ? ' is-pick' : ''}" data-decomp="${li}" data-dv="${esc(JSON.stringify(x.keys[0]))}"><span>${esc(clip(label(m, L.field, x.keys[0]), cw - 50, 11))}</span><b>${esc(fmtS(m, mid, x.vals[mid]))}</b><i style="width:${Math.round((x.vals[mid] / mx) * 100)}%;background:${opts.palette[0]}"></i></div>`;
      }).join('')}</div>`;
    });
    return html + '</div>';
  }

  /* ---------- Ribbon chart ---------- */
  function ribbon(m, spec, opts) {
    const mid = spec.values[0];
    const d = timeSeries(m, spec, opts, [mid]);
    if (!d.xs.length || !d.series.length) return empty();
    const pal = opts.palette;
    const w = opts.w, h = opts.h - 22;
    const multi = spec.axis.length > 1;
    const x0 = 6, x1 = w - 6, y0 = 6, y1 = h - (opts.compact ? 8 : multi ? 30 : 20);
    const n = d.xs.length;
    const band = (x1 - x0) / n, bw = Math.max(4, Math.min(band * 0.52, 46));
    // în fiecare perioadă, seriile se ordonează după valoare: cea mai mare sus
    let hi = 0;
    const cols = d.xs.map((x) => {
      const items = d.series.map((se, j) => ({ se, j, v: Math.max(0, d.get(x, se, mid) || 0) })).sort((a, b) => a.v - b.v);
      let acc = 0;
      items.forEach((it) => { it.a = acc; acc += it.v; it.b = acc; });
      hi = Math.max(hi, acc);
      return items;
    });
    const sy = (v) => y1 - (v / (hi || 1)) * (y1 - y0);
    const cx = (i) => x0 + band * (i + 0.5);
    let s = svgOpen(w, h);
    for (let i = 0; i < n - 1; i++) {
      d.series.forEach((se, j) => {
        const a = cols[i].find((it) => it.j === j), b = cols[i + 1].find((it) => it.j === j);
        if (!a || !b || (!a.v && !b.v)) return;
        const xa = cx(i) + bw / 2, xb = cx(i + 1) - bw / 2, xm = (xa + xb) / 2;
        s += `<path d="M${xa},${sy(a.b)} C${xm},${sy(a.b)} ${xm},${sy(b.b)} ${xb},${sy(b.b)} L${xb},${sy(b.a)} C${xm},${sy(b.a)} ${xm},${sy(a.a)} ${xa},${sy(a.a)} Z" style="fill:${pal[j % pal.length]};opacity:.32"/>`;
      });
    }
    const labels = xLabels(m, spec.axis, d.xs);
    cols.forEach((items, i) => {
      items.forEach((it) => {
        if (!it.v) return;
        const pairs = spec.axis.map((a, ai) => [a, d.xs[i].keys[ai]]).concat([[spec.legend, it.se]]);
        s += `<rect x="${cx(i) - bw / 2}" y="${sy(it.b)}" width="${bw}" height="${Math.max(0.5, sy(it.a) - sy(it.b))}" fill="${pal[it.j % pal.length]}" class="atl-mark${dimCls(opts, pairs)}"${selAttr(pairs)}><title>${esc(labels[i].main + (labels[i].sub ? ' ' + labels[i].sub : '') + ' · ' + label(m, spec.legend, it.se) + ': ' + fmtF(m, mid, it.v))}</title></rect>`;
      });
      if (!opts.compact) {
        const L = labels[i];
        const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((x1 - x0) / 34))));
        if (i % every === 0) s += `<text x="${cx(i)}" y="${y1 + 13}" text-anchor="middle" class="atl-t-ax">${esc(L.main)}</text>`;
        if (L.sub) s += `<text x="${cx(i) - band / 2 + 2}" y="${y1 + 26}" class="atl-t-cat atl-t-b">${esc(L.sub)}</text>`;
      }
    });
    s += '</svg>';
    return legendHtml(d.series.map((se) => label(m, spec.legend, se)), pal) + s;
  }

  /* ---------- Small multiples (line) ---------- */
  function smallMult(m, spec, opts) {
    const mid = spec.values[0];
    const by = spec.axis.concat(spec.split);
    const r = run(m, spec, opts, by, [mid]);
    const na = spec.axis.length;
    const totals = new Map();
    const xsMap = new Map();
    r.groups.forEach((g) => {
      if (g.keys[na] == null || g.keys.slice(0, na).some((k) => k == null)) return;
      const sk = D().keyOf(g.keys[na]);
      const t = totals.get(sk) || { key: g.keys[na], v: 0 };
      t.v += g.vals[mid] || 0;
      totals.set(sk, t);
      const xk = g.keys.slice(0, na).map(D().keyOf).join('§');
      if (!xsMap.has(xk)) xsMap.set(xk, { keys: g.keys.slice(0, na) });
    });
    const splits = [...totals.values()].sort((a, b) => b.v - a.v).slice(0, opts.compact ? 4 : 6);
    if (!splits.length) return empty();
    const xs = sortGroups(m, [...xsMap.values()], spec.axis, 'axis');
    const val = new Map();
    r.groups.forEach((g) => val.set(g.keys.map(D().keyOf).join('§'), g.vals[mid]));
    let hi = 0;
    splits.forEach((sp) => xs.forEach((x) => { const v = val.get(x.keys.map(D().keyOf).concat(D().keyOf(sp.key)).join('§')); if (v != null) hi = Math.max(hi, v); }));
    const w = opts.w, h = opts.h;
    const nc = Math.min(splits.length, opts.compact || w < 420 ? 2 : 3);
    const nr = Math.ceil(splits.length / nc);
    const cw = w / nc, ch = h / nr;
    const pal = opts.palette;
    let s = svgOpen(w, h);
    splits.forEach((sp, k) => {
      const ox = (k % nc) * cw, oy = Math.floor(k / nc) * ch;
      const px0 = ox + 6, px1 = ox + cw - 8, py0 = oy + 20, py1 = oy + ch - 8;
      const px = (i) => (xs.length === 1 ? (px0 + px1) / 2 : px0 + (i / (xs.length - 1)) * (px1 - px0));
      const py = (v) => py1 - (v / (hi || 1)) * (py1 - py0);
      s += `<rect x="${ox + 2}" y="${oy + 2}" width="${cw - 4}" height="${ch - 4}" rx="6" class="atl-sm-cell"/>`;
      s += `<text x="${px0}" y="${oy + 14}" class="atl-t-cat atl-t-b" style="font-size:10.5px">${esc(clip(label(m, spec.split, sp.key), cw - 70, 10.5))}</text>`;
      s += `<text x="${px1}" y="${oy + 14}" text-anchor="end" class="atl-t-sm">${esc(fmtS(m, mid, sp.v))}</text>`;
      s += `<line x1="${px0}" x2="${px1}" y1="${py1}" y2="${py1}" class="atl-base"/>`;
      const pts = xs.map((x, i) => { const v = val.get(x.keys.map(D().keyOf).concat(D().keyOf(sp.key)).join('§')); return [px(i), py(v || 0), v || 0, x]; });
      s += `<path d="M${pts.map((p) => p[0] + ',' + p[1]).join(' L')} L${px1},${py1} L${px0},${py1} Z" style="fill:${pal[0]};opacity:.1"/>`;
      s += `<polyline points="${pts.map((p) => p[0] + ',' + p[1]).join(' ')}" class="atl-line" style="stroke:${pal[0]};stroke-width:1.8"/>`;
      const pairs = [[spec.split, sp.key]];
      s += `<rect x="${ox + 2}" y="${oy + 2}" width="${cw - 4}" height="${ch - 4}" fill="transparent" class="atl-mark${dimCls(opts, pairs)}"${selAttr(pairs)}><title>${esc(label(m, spec.split, sp.key) + ': ' + fmtF(m, mid, sp.v))}</title></rect>`;
    });
    return s + '</svg>';
  }

  /* ---------- Table cu sparklines ---------- */
  function tableSpark(m, spec, opts) {
    const mid = spec.values[0];
    const r = run(m, spec, opts, [spec.rows], spec.values);
    const g = sortGroups(m, r.groups.filter((x) => x.keys[0] != null), [spec.rows], 'desc', mid);
    if (!g.length) return empty();
    const rs = run(m, spec, opts, [spec.rows].concat(spec.spark), [mid]);
    const xsMap = new Map();
    const series = new Map();
    rs.groups.forEach((x) => {
      if (x.keys.slice(1).some((k) => k == null)) return;
      const xk = x.keys.slice(1).map(D().keyOf).join('§');
      if (!xsMap.has(xk)) xsMap.set(xk, { keys: x.keys.slice(1) });
      series.set(D().keyOf(x.keys[0]) + '|' + xk, x.vals[mid] || 0);
    });
    const xs = sortGroups(m, [...xsMap.values()], spec.spark, 'axis');
    const lim = opts.compact ? 6 : 60;
    const SW = 84, SH = 20;
    const spark = (rowKey) => {
      const vals = xs.map((x) => series.get(D().keyOf(rowKey) + '|' + x.keys.map(D().keyOf).join('§')) || 0);
      const mx = Math.max(...vals) || 1;
      const pts = vals.map((v, i) => [vals.length === 1 ? SW / 2 : 2 + (i / (vals.length - 1)) * (SW - 4), SH - 2 - (v / mx) * (SH - 4)]);
      const last = pts[pts.length - 1];
      const up = vals.length > 1 && vals[vals.length - 1] >= vals[0];
      return `<svg class="atl-spark" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}"><polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${opts.palette[0]}" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${last[0]}" cy="${last[1]}" r="2.2" fill="${up ? '#10B981' : '#EF4444'}"/></svg>`;
    };
    const head = `<tr><th>${esc(fieldOf(m, spec.rows).col)}</th>${spec.values.map((id) => `<th class="n">${esc(meas(m, id).name)}</th>`).join('')}<th>Tendință</th></tr>`;
    const rows = g.slice(0, lim).map((x) => {
      const pairs = [[spec.rows, x.keys[0]]];
      return `<tr class="atl-mark${dimCls(opts, pairs)}"${selAttr(pairs)}><td>${esc(label(m, spec.rows, x.keys[0]))}</td>${spec.values.map((id) => `<td class="n">${esc(fmtF(m, id, x.vals[id]))}</td>`).join('')}<td class="atl-td-spark">${spark(x.keys[0])}</td></tr>`;
    }).join('');
    const more = g.length > lim ? `<tr class="atl-tr-more"><td colspan="${spec.values.length + 2}">… încă ${g.length - lim} rânduri</td></tr>` : '';
    return `<div class="atl-table-wrap"><table class="atl-table"><thead>${head}</thead><tbody>${rows}${more}</tbody></table></div>`;
  }

  /* ---------- Key influencers ---------- */
  function keyInfData(m, spec, opts) {
    const rows = D().applyFilters(m.flat, filtersOf(spec, opts));
    if (rows.length < 6) return null;
    const isRate = !!spec.statusField;
    const bad = new Set(spec.bad || []);
    const metric = (rs) => {
      if (isRate) return rs.length ? rs.filter((r) => bad.has(r[spec.statusField])).length / rs.length : 0;
      let s = 0, k = 0;
      rs.forEach((r) => { const v = r[spec.valueField]; if (typeof v === 'number') { s += v; k++; } });
      return k ? s / k : 0;
    };
    const base = metric(rows);
    const minN = Math.max(3, Math.round(rows.length * 0.04));
    const out = [];
    (spec.by || []).filter((id) => fieldOf(m, id)).forEach((fid) => {
      const groups = new Map();
      rows.forEach((r) => { const v = r[fid]; if (v == null) return; const k = D().keyOf(v); if (!groups.has(k)) groups.set(k, { v, rows: [] }); groups.get(k).rows.push(r); });
      if (groups.size < 2) return;
      groups.forEach((g) => {
        if (g.rows.length < minN) return;
        const val = metric(g.rows);
        const effect = isRate ? (base ? val / base : 0) : val - base;
        if (isRate ? effect > 1.1 : effect > 0) out.push({ field: fid, value: g.v, val, effect, n: g.rows.length });
      });
    });
    out.sort((a, b) => b.effect - a.effect);
    return { base, isRate, items: out.slice(0, opts.compact ? 3 : 6) };
  }
  function keyInf(m, spec, opts) {
    const d = keyInfData(m, spec, opts);
    if (!d) return empty('Prea puține rânduri pentru analiză');
    if (!d.items.length) return empty('Nicio valoare nu iese în evidență');
    const fmtV = (v) => (d.isRate ? D().fmtShort(v, 'pct') : D().fmtShort(v));
    const mx = Math.max(...d.items.map((x) => x.val), d.base) || 1;
    const target = d.isRate ? `${fieldOf(m, spec.statusField).col} = ${(spec.bad || []).join(' / ')}` : `${fieldOf(m, spec.valueField).col} medie`;
    const items = d.items.map((x, i) => {
      const pairs = [[x.field, x.value]];
      const eff = d.isRate ? D().fmtShort(x.effect, 'number').replace(/,0+$/, '') + 'x' : '+' + D().fmtShort(x.effect);
      return `<div class="atl-ki-row atl-mark${i === 0 ? ' is-top' : ''}${dimCls(opts, pairs)}"${selAttr(pairs)}>
        <div class="atl-ki-t"><span>Când <b>${esc(fieldOf(m, x.field).col)}</b> este <b>${esc(label(m, x.field, x.value))}</b></span>${opts.compact ? '' : `<small>${esc(fmtV(x.val))} față de ${esc(fmtV(d.base))} în medie · ${x.n} rânduri</small>`}</div>
        <div class="atl-ki-bar"><i style="width:${Math.round((x.val / mx) * 100)}%;background:${opts.palette[0]}"></i><em style="left:${Math.round((d.base / mx) * 100)}%"></em></div>
        <span class="atl-ki-eff">${esc(eff)}</span>
      </div>`;
    }).join('');
    return `<div class="atl-ki"><div class="atl-ki-h">Ce crește <b>${esc(target)}</b>?</div>${items}</div>`;
  }

  /* ---------- Smart narrative ---------- */
  function narrative(m, spec, opts) {
    const f = filtersOf(spec, opts);
    const q = (by, ms) => D().query(m, { by, measures: ms, filters: f });
    const R = m.R;
    const base = q([], ['total', 'count'].filter((x) => m.measures.has(x)));
    if (!base.rows.length) return empty();
    const B = (t) => `<b class="atl-narr-v">${esc(t)}</b>`;
    const out = [];
    const tot = base.total.total;
    out.push(`${esc(meas(m, 'total').name)} este ${B(fmtF(m, 'total', tot))}${m.measures.has('count') && meas(m, 'total').name !== meas(m, 'count').name ? `, din ${B(fmtF(m, 'count', base.total.count))} ${esc(R.noun)}` : ''}.`);
    const t = m.time;
    if (t && t.year && t.month) {
      const r = q([t.year, t.month], ['total']);
      const g = sortGroups(m, r.groups.filter((x) => x.keys[0] != null && x.keys[1] != null), [t.year, t.month], 'axis');
      if (g.length >= 2) {
        const best = g.reduce((a, b) => (b.vals.total > a.vals.total ? b : a));
        const worst = g.reduce((a, b) => (b.vals.total < a.vals.total ? b : a));
        const nm = (x) => `${label(m, t.month, x.keys[1])} ${x.keys[0]}`;
        out.push(`Cea mai bună lună a fost ${B(nm(best))}, cu ${B(fmtS(m, 'total', best.vals.total))}; cea mai slabă, ${B(nm(worst))} (${B(fmtS(m, 'total', worst.vals.total))}).`);
      }
      if (m.years.length >= 2) {
        const ry = q([t.year], ['total']);
        const ys = sortGroups(m, ry.groups.filter((x) => x.keys[0] != null), [t.year], 'axis');
        if (ys.length >= 2) {
          const a = ys[ys.length - 2], b = ys[ys.length - 1];
          const ch = a.vals.total ? (b.vals.total - a.vals.total) / Math.abs(a.vals.total) : null;
          if (ch != null) out.push(`În ${B(b.keys[0])}, ${esc(R.noun)} au ${ch >= 0 ? 'crescut' : 'scăzut'} cu ${B(D().fmtShort(Math.abs(ch), 'pct'))} față de ${esc(a.keys[0])}.`);
        }
      }
    }
    if (m.cats[0]) {
      const c = m.cats[0];
      const r = q([c], ['total']);
      const g = r.groups.filter((x) => x.keys[0] != null).sort((a, b) => b.vals.total - a.vals.total);
      if (g.length >= 2 && tot) out.push(`După ${esc(fieldOf(m, c).col)}, pe primul loc e ${B(label(m, c, g[0].keys[0]))}, cu ${B(D().fmtShort(g[0].vals.total / tot, 'pct'))} din total.`);
    }
    if (R.productName && !opts.compact) {
      const r = q([R.productName], ['total']);
      const g = r.groups.filter((x) => x.keys[0] != null).sort((a, b) => b.vals.total - a.vals.total);
      if (g.length) out.push(`Cel mai mare contributor: ${B(label(m, R.productName, g[0].keys[0]))} (${B(fmtS(m, 'total', g[0].vals.total))}).`);
    }
    if (m.measures.has('rate')) {
      const r = q([], ['rate']);
      out.push(`${B(D().fmtShort(r.total.rate, 'pct'))} din ${esc(R.noun)} au statusul ${esc(R.status.bad.join(' / '))}.`);
    }
    const max = opts.compact ? 3 : 6;
    return `<div class="atl-narr"><p>${out.slice(0, max).join(' ')}</p></div>`;
  }

  /* ---------- Slicer ---------- */
  function slicer(m, el, opts) {
    const f = fieldOf(m, el.field);
    if (!f) return empty('Câmpul nu mai există');
    const vals = D().distinctValues(m, el.field).filter((v) => v != null);
    const sel = new Set((el.values || []).map(D().keyOf));
    const head = `<div class="atl-sl-h">${esc(el.title || f.col)}${sel.size ? '<button class="atl-sl-clear" data-sl-clear title="Șterge selecția">✕</button>' : ''}</div>`;
    if (el.style === 'dropdown') {
      const txt = sel.size === 0 ? 'Toate' : sel.size === 1 ? label(m, el.field, vals.find((v) => sel.has(D().keyOf(v)))) : 'Selecție multiplă';
      return `<div class="atl-slicer">${head}<details class="atl-sl-dd"><summary>${esc(txt)}</summary><div class="atl-sl-list">${vals.map((v) => `<label><input type="checkbox" data-sl-v="${esc(JSON.stringify(v))}" ${sel.has(D().keyOf(v)) ? 'checked' : ''}/> ${esc(label(m, el.field, v))}</label>`).join('')}</div></details></div>`;
    }
    if (el.style === 'tile') {
      return `<div class="atl-slicer">${head}<div class="atl-sl-tiles">${vals.slice(0, 24).map((v) => `<button class="${sel.has(D().keyOf(v)) ? 'on' : ''}" data-sl-v="${esc(JSON.stringify(v))}">${esc(label(m, el.field, v, true))}</button>`).join('')}</div></div>`;
    }
    return `<div class="atl-slicer">${head}<div class="atl-sl-list">${vals.slice(0, 60).map((v) => `<label><input type="checkbox" data-sl-v="${esc(JSON.stringify(v))}" ${sel.has(D().keyOf(v)) ? 'checked' : ''}/> ${esc(label(m, el.field, v))}</label>`).join('')}</div></div>`;
  }

  /* ---------- dispecer ---------- */
  function render(m, spec, opts) {
    opts = Object.assign({ w: 360, h: 220, palette: PALETTES.curs.colors, filters: [], labels: true }, opts || {});
    opts.w = Math.max(80, Math.round(opts.w));
    opts.h = Math.max(60, Math.round(opts.h));
    try {
      switch (spec.chart) {
        case 'card': return card(m, spec, opts);
        case 'multicard': return multicard(m, spec, opts);
        case 'kpi': return kpi(m, spec, opts);
        case 'gauge': return gauge(m, spec, opts);
        case 'bar': return bar(m, spec, opts);
        case 'pie': return pie(m, spec, opts, false);
        case 'donut': return pie(m, spec, opts, true);
        case 'treemap': return treemap(m, spec, opts);
        case 'line': return lineLike(m, spec, opts, 'line');
        case 'area': return lineLike(m, spec, opts, 'area');
        case 'combo': return lineLike(m, spec, opts, 'combo');
        case 'waterfall': return waterfall(m, spec, opts);
        case 'funnel': return funnel(m, spec, opts);
        case 'scatter': return scatter(m, spec, opts);
        case 'map': return mapVis(m, spec, opts);
        case 'table': return table(m, spec, opts);
        case 'matrix': return matrix(m, spec, opts);
        case 'decomp': return decomp(m, spec, opts);
        case 'ribbon': return ribbon(m, spec, opts);
        case 'smallmult': return smallMult(m, spec, opts);
        case 'tablespark': return tableSpark(m, spec, opts);
        case 'keyinf': return keyInf(m, spec, opts);
        case 'narrative': return narrative(m, spec, opts);
        default: return empty('Vizual necunoscut');
      }
    } catch (err) {
      console.warn('[atelier] eroare la desen', spec, err);
      return empty('Nu am putut desena vizualul');
    }
  }

  A.Charts = { render, slicer, PALETTES, esc };
})();
