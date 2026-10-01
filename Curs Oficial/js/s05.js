/* Sesiunea 5 · vizualizări: grafice SVG, demo-uri interactive */
(function () {
  'use strict';

  const COLORS = ['#059669', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
  const MONTHS = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun'];

  const DATA = {
    supermarket: {
      categories: MONTHS,
      series: [
        { name: 'Lactate', values: [42, 38, 45, 41, 48, 52] },
        { name: 'Băuturi', values: [55, 51, 58, 60, 62, 59] },
        { name: 'Panificație', values: [28, 30, 27, 32, 35, 33] }
      ]
    },
    tickets: {
      categories: ['Ana M.', 'Bogdan P.', 'Carmen L.', 'Dan V.', 'Elena R.'],
      series: [
        { name: 'Urgent', values: [12, 8, 15, 6, 9] },
        { name: 'Normal', values: [34, 41, 28, 38, 32] },
        { name: 'Scăzut', values: [18, 22, 19, 25, 21] }
      ]
    },
    payments: {
      categories: ['Centru', 'Mall', 'Cartier'],
      series: [
        { name: 'Card', values: [52, 61, 48] },
        { name: 'Numerar', values: [28, 22, 35] },
        { name: 'Online', values: [20, 17, 17] }
      ]
    },
    visitors: {
      labels: ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'],
      values: [820, 910, 880, 940, 1020, 1180, 760]
    },
    energy: {
      labels: MONTHS.slice(0, 6),
      series: [
        { name: 'Rețea', values: [320, 290, 260, 240, 220, 250] },
        { name: 'Panouri', values: [80, 110, 140, 160, 180, 170] }
      ]
    },
    combo: {
      categories: MONTHS,
      bars: [
        { name: 'Electronice', values: [120, 115, 130, 125, 140, 135] },
        { name: 'Îmbrăcăminte', values: [85, 90, 88, 92, 95, 98] }
      ],
      line: { name: 'Marjă %', values: [22, 23, 21, 24, 25, 24] }
    },
    waterfall: [
      { label: 'Venit', value: 850, type: 'total' },
      { label: 'Salarii', value: -320, type: 'dec' },
      { label: 'Chirie', value: -95, type: 'dec' },
      { label: 'Marketing', value: -48, type: 'dec' },
      { label: 'Taxe', value: -72, type: 'dec' },
      { label: 'Profit net', value: 315, type: 'total' }
    ],
    funnel: [
      { label: 'Vizite site', value: 12000 },
      { label: 'Coș', value: 4200 },
      { label: 'Checkout', value: 2100 },
      { label: 'Plată', value: 1680 }
    ],
    scatter: [
      { name: 'Cluj', x: 12, y: 890, size: 8 },
      { name: 'București', x: 45, y: 2100, size: 22 },
      { name: 'Iași', x: 8, y: 420, size: 5 },
      { name: 'Timișoara', x: 15, y: 680, size: 7 },
      { name: 'Brașov', x: 10, y: 520, size: 6 }
    ],
    treemap: {
      name: 'Buget total',
      value: 100,
      children: [
        {
          name: 'Educație',
          value: 35,
          children: [
            { name: 'Școli', value: 22 },
            { name: 'Grădinițe', value: 13 }
          ]
        },
        {
          name: 'Infrastructură',
          value: 40,
          children: [
            { name: 'Drumuri', value: 25 },
            { name: 'Apă-canal', value: 15 }
          ]
        },
        { name: 'Sănătate', value: 25 }
      ]
    },
    matrix: {
      rows: ['Nord', 'Sud', 'Est', 'Vest'],
      cols: ['T1', 'T2', 'T3', 'T4'],
      values: [
        [120, 132, 118, 140],
        [95, 102, 98, 110],
        [88, 91, 85, 92],
        [105, 112, 108, 115]
      ]
    },
    invoices: [
      { nr: 'F-1042', client: 'SC Alfa SRL', data: '12.03.2025', suma: 4200, status: 'Plătită' },
      { nr: 'F-1043', client: 'Beta SA', data: '14.03.2025', suma: 1850, status: 'Deschisă' },
      { nr: 'F-1044', client: 'Gamma SRL', data: '15.03.2025', suma: 920, status: 'Plătită' },
      { nr: 'F-1045', client: 'Delta SRL', data: '18.03.2025', suma: 3100, status: 'Întârziată' },
      { nr: 'F-1046', client: 'Epsilon SA', data: '20.03.2025', suma: 560, status: 'Plătită' }
    ],
    decomp: {
      label: 'Vânzări Q1',
      value: '1,2 M lei',
      children: [
        {
          label: 'Regiune Nord',
          value: '520 k',
          children: [
            { label: 'Magazin A', value: '310 k', children: [{ label: 'Produs X', value: '180 k' }, { label: 'Produs Y', value: '130 k' }] },
            { label: 'Magazin B', value: '210 k' }
          ]
        },
        {
          label: 'Regiune Sud',
          value: '680 k',
          children: [
            { label: 'Magazin C', value: '400 k' },
            { label: 'Magazin D', value: '280 k' }
          ]
        }
      ]
    }
  };

  let tooltipEl = null;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function scaleLinear(d0, d1, r0, r1) {
    const span = d1 - d0 || 1;
    return (v) => r0 + ((v - d0) / span) * (r1 - r0);
  }

  function svgEl(tag, attrs, children) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === 'text') el.textContent = attrs[k];
        else el.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach((c) => {
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else if (c) el.appendChild(c);
    });
    return el;
  }

  function ensureTooltip() {
    if (tooltipEl) return tooltipEl;
    tooltipEl = document.createElement('div');
    tooltipEl.className = 's5-tooltip';
    document.body.appendChild(tooltipEl);
    return tooltipEl;
  }

  function showTip(html, x, y) {
    const t = ensureTooltip();
    t.innerHTML = html;
    t.classList.add('is-on');
    t.style.left = Math.min(window.innerWidth - 180, x + 12) + 'px';
    t.style.top = Math.min(window.innerHeight - 60, y + 12) + 'px';
  }

  function hideTip() {
    if (tooltipEl) tooltipEl.classList.remove('is-on');
  }

  function clearHost(host) {
    host.querySelectorAll('svg').forEach((n) => n.remove());
    host.querySelectorAll('.s5-legend').forEach((n) => n.remove());
  }

  function getHiddenSeries(host) {
    if (!host._s5Hidden) host._s5Hidden = new Set();
    return host._s5Hidden;
  }

  function renderLegend(host, series, onToggle) {
    let leg = host.querySelector('.s5-legend');
    if (!leg) {
      leg = document.createElement('div');
      leg.className = 's5-legend';
      host.appendChild(leg);
    }
    const hidden = getHiddenSeries(host);
    leg.innerHTML = series
      .map((s, i) => {
        const off = hidden.has(s.name) ? ' is-off' : '';
        return (
          '<button type="button" class="' +
          off.trim() +
          '" data-s5-leg="' +
          esc(s.name) +
          '"><i style="background:' +
          COLORS[i % COLORS.length] +
          '"></i>' +
          esc(s.name) +
          '</button>'
        );
      })
      .join('');
    leg.querySelectorAll('[data-s5-leg]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-s5-leg');
        if (hidden.has(name)) hidden.delete(name);
        else hidden.add(name);
        onToggle();
      });
    });
  }

  function drawBars(host, opts) {
    clearHost(host);
    const variant = host.getAttribute('data-s5-variant') || opts.defaultVariant || 'stacked';
    const horizontal = opts.horizontal || false;
    const pct = variant === '100';
    const clustered = variant === 'clustered';
    const data = opts.data;
    const hidden = getHiddenSeries(host);
    const series = data.series.filter((s) => !hidden.has(s.name));
    const W = 520;
    const H = 280;
    const m = { t: 16, r: 12, b: 36, l: 48 };
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    host.insertBefore(svg, host.firstChild);

    const cats = data.categories;
    const nCat = cats.length;
    const nSer = series.length;

    let maxVal = 0;
    if (pct) maxVal = 100;
    else if (clustered) {
      series.forEach((s) => s.values.forEach((v) => { if (v > maxVal) maxVal = v; }));
    } else {
      cats.forEach((_, ci) => {
        let sum = 0;
        series.forEach((s) => { sum += s.values[ci]; });
        if (sum > maxVal) maxVal = sum;
      });
    }
    maxVal = maxVal * 1.1 || 1;

    const plotW = W - m.l - m.r;
    const plotH = H - m.t - m.b;

    for (let g = 0; g <= 4; g++) {
      const v = (maxVal / 4) * g;
      const y = m.t + plotH - scaleLinear(0, maxVal, 0, plotH)(v);
      svg.appendChild(svgEl('line', { class: 's5-grid', x1: m.l, x2: W - m.r, y1: y, y2: y }));
    }

    series.forEach((s, si) => {
      const color = COLORS[data.series.indexOf(s) % COLORS.length];
      cats.forEach((cat, ci) => {
        let val = s.values[ci];
        let base = 0;
        if (pct) {
          let tot = 0;
          data.series.forEach((ss) => { if (!hidden.has(ss.name)) tot += ss.values[ci]; });
          val = tot ? (s.values[ci] / tot) * 100 : 0;
          series.slice(0, si).forEach((prev) => {
            const t2 = data.series.reduce((a, ss) => a + (hidden.has(ss.name) ? 0 : ss.values[ci]), 0);
            base += t2 ? (prev.values[ci] / t2) * 100 : 0;
          });
        } else if (!clustered) {
          series.slice(0, si).forEach((prev) => { base += prev.values[ci]; });
        }

        let x;
        let y;
        let w;
        let h;
        const catSlot = plotW / nCat;
        if (horizontal) {
          h = clustered ? plotH / nCat / nSer * 0.85 : plotH / nCat * 0.7;
          w = scaleLinear(0, maxVal, 0, plotW)(val);
          const x0 = scaleLinear(0, maxVal, 0, plotW)(base);
          y = m.t + ci * (plotH / nCat) + (clustered ? si * h : (plotH / nCat - h) / 2);
          x = m.l + x0;
        } else {
          w = clustered ? catSlot / nSer * 0.85 : catSlot * 0.7;
          h = scaleLinear(0, maxVal, 0, plotH)(val);
          const y0 = scaleLinear(0, maxVal, 0, plotH)(base);
          x = m.l + ci * catSlot + (clustered ? si * w : (catSlot - w) / 2);
          y = m.t + plotH - y0 - h;
        }

        const rect = svgEl('rect', {
          class: 's5-bar',
          x: x.toFixed(1),
          y: y.toFixed(1),
          width: Math.max(0, w).toFixed(1),
          height: Math.max(0, h).toFixed(1),
          fill: color,
          rx: 2
        });
        rect.addEventListener('mouseenter', (e) => {
          showTip('<strong>' + esc(cat) + '</strong><br>' + esc(s.name) + ': ' + (pct ? val.toFixed(1) + '%' : val), e.clientX, e.clientY);
        });
        rect.addEventListener('mouseleave', hideTip);
        svg.appendChild(rect);
      });
    });

    cats.forEach((cat, ci) => {
      const catSlot = plotW / nCat;
      const tx = horizontal ? m.l - 6 : m.l + ci * catSlot + catSlot / 2;
      const ty = horizontal ? m.t + ci * (plotH / nCat) + plotH / nCat / 2 : H - 8;
      const t = svgEl('text', {
        class: 's5-axis',
        x: tx.toFixed(1),
        y: ty.toFixed(1),
        'text-anchor': horizontal ? 'end' : 'middle'
      }, [cat]);
      svg.appendChild(t);
    });

    renderLegend(host, data.series, () => drawBars(host, opts));
  }

  function drawLineArea(host, mode) {
    clearHost(host);
    const stacked = mode === 'area-stack';
    const labels = stacked ? DATA.energy.labels : DATA.visitors.labels;
    const series = stacked
      ? DATA.energy.series
      : [{ name: 'Vizitatori', values: DATA.visitors.values }];
    const hidden = getHiddenSeries(host);
    const visible = series.filter((s) => !hidden.has(s.name));
    const W = 520;
    const H = 280;
    const m = { t: 16, r: 12, b: 36, l: 44 };
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H });
    host.insertBefore(svg, host.firstChild);
    const plotW = W - m.l - m.r;
    const plotH = H - m.t - m.b;
    let max = 0;
    labels.forEach((_, i) => {
      let sum = 0;
      visible.forEach((s) => { sum += s.values[i]; });
      if (!stacked) sum = visible[0] ? visible[0].values[i] : 0;
      if (sum > max) max = sum;
    });
    max *= 1.1;
    const xAt = scaleLinear(0, labels.length - 1, m.l, m.l + plotW);
    const yAt = scaleLinear(0, max, m.t + plotH, m.t);

    if (stacked) {
      const acc = labels.map(() => 0);
      visible.forEach((s, si) => {
        const color = COLORS[series.indexOf(s) % COLORS.length];
        let d = '';
        labels.forEach((_, i) => {
          const yTop = yAt(acc[i] + s.values[i]);
          const x = xAt(i);
          d += (i ? ' L' : 'M') + x + ' ' + yTop;
          acc[i] += s.values[i];
        });
        for (let i = labels.length - 1; i >= 0; i--) {
          d += ' L' + xAt(i) + ' ' + yAt(acc[i] - s.values[i]);
        }
        d += ' Z';
        svg.appendChild(svgEl('path', { d, fill: color, opacity: 0.55 }));
      });
    }

    visible.forEach((s) => {
      const color = COLORS[series.indexOf(s) % COLORS.length];
      const pts = labels.map((_, i) => {
        let v = s.values[i];
        if (stacked) {
          let base = 0;
          visible.forEach((ss) => {
            if (ss === s) return;
            const idx = visible.indexOf(ss);
            if (idx < visible.indexOf(s)) base += ss.values[i];
          });
          v = base + v;
        }
        return [xAt(i), yAt(v)];
      });
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
      if (mode === 'area' && !stacked) {
        svg.appendChild(svgEl('path', {
          d: d + ' L' + pts[pts.length - 1][0] + ' ' + (m.t + plotH) + ' L' + pts[0][0] + ' ' + (m.t + plotH) + ' Z',
          fill: color,
          opacity: 0.25
        }));
      }
      const line = svgEl('path', { class: 's5-line', d, stroke: color });
      svg.appendChild(line);
      pts.forEach((p, i) => {
        const c = svgEl('circle', { cx: p[0], cy: p[1], r: 4, fill: color });
        c.addEventListener('mouseenter', (e) => showTip('<strong>' + esc(labels[i]) + '</strong><br>' + esc(s.name) + ': ' + s.values[i], e.clientX, e.clientY));
        c.addEventListener('mouseleave', hideTip);
        svg.appendChild(c);
      });
    });

    labels.forEach((lab, i) => {
      svg.appendChild(svgEl('text', {
        class: 's5-axis',
        x: xAt(i),
        y: H - 8,
        'text-anchor': 'middle'
      }, [lab]));
    });
    if (stacked) renderLegend(host, series, () => drawLineArea(host, mode));
  }

  function drawCombo(host) {
    clearHost(host);
    const d = DATA.combo;
    const W = 520;
    const H = 280;
    const m = { t: 16, r: 44, b: 36, l: 44 };
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H });
    host.insertBefore(svg, host.firstChild);
    const plotW = W - m.l - m.r;
    const plotH = H - m.t - m.b;
    let maxB = 0;
    d.categories.forEach((_, ci) => {
      let s = 0;
      d.bars.forEach((b) => { s += b.values[ci]; });
      if (s > maxB) maxB = s;
    });
    const maxL = Math.max(...d.line.values) * 1.2;
    const xAt = scaleLinear(0, d.categories.length - 1, m.l + plotW / d.categories.length / 2, m.l + plotW - plotW / d.categories.length / 2);
    const yB = scaleLinear(0, maxB * 1.1, m.t + plotH, m.t);
    const yL = scaleLinear(0, maxL, m.t + plotH, m.t);
    const slot = plotW / d.categories.length;

    d.categories.forEach((cat, ci) => {
      let base = 0;
      d.bars.forEach((b, bi) => {
        const v = b.values[ci];
        const h = yB(base) - yB(base + v);
        const w = slot * 0.35;
        const x = m.l + ci * slot + (bi === 0 ? slot * 0.15 : slot * 0.5);
        svg.appendChild(svgEl('rect', {
          class: 's5-bar',
          x: x,
          y: yB(base + v),
          width: w,
          height: h,
          fill: COLORS[bi]
        }));
        base += v;
      });
      svg.appendChild(svgEl('text', { class: 's5-axis', x: m.l + ci * slot + slot / 2, y: H - 8, 'text-anchor': 'middle' }, [cat]));
    });

    const pts = d.line.values.map((v, i) => [xAt(i), yL(v)]);
    svg.appendChild(svgEl('path', {
      class: 's5-line',
      d: pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' '),
      stroke: '#ef4444'
    }));
    pts.forEach((p, i) => {
      svg.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 4, fill: '#ef4444' }));
    });
  }

  function drawWaterfall(host) {
    clearHost(host);
    const steps = DATA.waterfall;
    const W = 520;
    const H = 280;
    const m = { t: 16, r: 12, b: 48, l: 44 };
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H });
    host.insertBefore(svg, host.firstChild);
    const plotW = W - m.l - m.r;
    const plotH = H - m.t - m.b;
    let run = 0;
    let minY = 0;
    let maxY = 0;
    const segs = steps.map((s) => {
      const start = s.type === 'total' && s.label === 'Venit' ? 0 : run;
      const end = s.type === 'total' && s.label === 'Profit net' ? run + s.value : start + s.value;
      if (s.type !== 'total' || s.label === 'Venit') run += s.value;
      minY = Math.min(minY, start, end);
      maxY = Math.max(maxY, start, end);
      return { ...s, start, end };
    });
    const yAt = scaleLinear(minY, maxY * 1.05, m.t + plotH, m.t);
    const slot = plotW / segs.length;

    segs.forEach((s, i) => {
      const y1 = yAt(Math.max(s.start, s.end));
      const y2 = yAt(Math.min(s.start, s.end));
      const fill = s.type === 'total' ? '#64748b' : s.value < 0 ? '#ef4444' : '#059669';
      const rect = svgEl('rect', {
        class: 's5-bar',
        x: m.l + i * slot + slot * 0.15,
        y: y1,
        width: slot * 0.7,
        height: Math.max(2, y2 - y1),
        fill
      });
      rect.addEventListener('mouseenter', (e) => showTip('<strong>' + esc(s.label) + '</strong><br>' + s.value, e.clientX, e.clientY));
      rect.addEventListener('mouseleave', hideTip);
      svg.appendChild(rect);
      svg.appendChild(svgEl('text', {
        class: 's5-axis',
        x: m.l + i * slot + slot / 2,
        y: H - 6,
        'text-anchor': 'middle',
        transform: 'rotate(-24 ' + (m.l + i * slot + slot / 2) + ' ' + (H - 6) + ')'
      }, [s.label]));
    });
  }

  function drawFunnel(host) {
    clearHost(host);
    const steps = DATA.funnel;
    const W = 520;
    const H = 280;
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H });
    host.insertBefore(svg, host.firstChild);
    const max = steps[0].value;
    const h = H / steps.length;

    steps.forEach((s, i) => {
      const wTop = (s.value / max) * (W * 0.85);
      const wNext = steps[i + 1] ? (steps[i + 1].value / max) * (W * 0.85) : wTop * 0.7;
      const xTop = (W - wTop) / 2;
      const xBot = (W - wNext) / 2;
      const y = i * h + 8;
      const poly = svgEl('polygon', {
        class: 's5-bar',
        points: xTop + ',' + y + ' ' + (xTop + wTop) + ',' + y + ' ' + (xBot + wNext) + ',' + (y + h - 8) + ' ' + xBot + ',' + (y + h - 8),
        fill: COLORS[i % COLORS.length],
        opacity: 0.85
      });
      poly.addEventListener('mouseenter', (e) => {
        const conv = i ? ((s.value / steps[i - 1].value) * 100).toFixed(1) : '100';
        showTip('<strong>' + esc(s.label) + '</strong><br>' + s.value.toLocaleString('ro-RO') + '<br>Conv: ' + conv + '%', e.clientX, e.clientY);
      });
      poly.addEventListener('mouseleave', hideTip);
      svg.appendChild(poly);
      svg.appendChild(svgEl('text', {
        class: 's5-axis',
        x: W / 2,
        y: y + h / 2 + 4,
        'text-anchor': 'middle',
        fill: '#fff',
        'font-weight': '700'
      }, [s.label]));
    });
  }

  function drawScatter(host) {
    clearHost(host);
    const pts = DATA.scatter;
    const W = 520;
    const H = 280;
    const m = { t: 16, r: 12, b: 36, l: 44 };
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H });
    host.insertBefore(svg, host.firstChild);
    const plotW = W - m.l - m.r;
    const plotH = H - m.t - m.b;
    const maxX = Math.max(...pts.map((p) => p.x)) * 1.15;
    const maxY = Math.max(...pts.map((p) => p.y)) * 1.1;
    const xAt = scaleLinear(0, maxX, m.l, m.l + plotW);
    const yAt = scaleLinear(0, maxY, m.t + plotH, m.t);
    pts.forEach((p) => {
      const c = svgEl('circle', {
        class: 's5-bar',
        cx: xAt(p.x),
        cy: yAt(p.y),
        r: 4 + p.size,
        fill: COLORS[0],
        opacity: 0.75
      });
      c.addEventListener('mouseenter', (e) => showTip('<strong>' + esc(p.name) + '</strong><br>Reclamă: ' + p.x + ' k<br>Vânzări: ' + p.y + ' k', e.clientX, e.clientY));
      c.addEventListener('mouseleave', hideTip);
      svg.appendChild(c);
    });
    svg.appendChild(svgEl('text', { class: 's5-axis', x: W / 2, y: H - 6, 'text-anchor': 'middle' }, ['Buget reclamă (k)']));
  }

  function layoutTreemap(node, x, y, w, h, out) {
    if (!node.children || !node.children.length) {
      out.push({ node, x, y, w, h });
      return;
    }
    const total = node.children.reduce((a, c) => a + c.value, 0);
    let cx = x;
    node.children.forEach((ch) => {
      const cw = (ch.value / total) * w;
      layoutTreemap(ch, cx, y, cw, h, out);
      cx += cw;
    });
  }

  function drawTreemap(host) {
    clearHost(host);
    if (!host._s5TreeNode) host._s5TreeNode = DATA.treemap;
    const root = host._s5TreeNode;
    const W = 520;
    const H = 240;
    const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H });
    host.insertBefore(svg, host.firstChild);
    const rects = [];
    layoutTreemap(root, 4, 4, W - 8, H - 8, rects);
    rects.forEach((r, i) => {
      if (r.w < 20 || r.h < 16) return;
      const rect = svgEl('rect', {
        class: 's5-bar',
        x: r.x,
        y: r.y,
        width: r.w,
        height: r.h,
        fill: COLORS[i % COLORS.length],
        stroke: 'var(--surface)',
        'stroke-width': 2
      });
      rect.addEventListener('click', () => {
        if (r.node.children && r.node.children.length) {
          host._s5TreeNode = r.node;
          drawTreemap(host);
        }
      });
      rect.addEventListener('mouseenter', (e) => showTip('<strong>' + esc(r.node.name) + '</strong><br>' + r.node.value + '%', e.clientX, e.clientY));
      rect.addEventListener('mouseleave', hideTip);
      svg.appendChild(rect);
      if (r.w > 50 && r.h > 24) {
        svg.appendChild(svgEl('text', {
          class: 's5-axis',
          x: r.x + 6,
          y: r.y + 14,
          fill: '#fff',
          'font-weight': '600'
        }, [r.node.name]));
      }
    });
    let back = host.querySelector('[data-s5-tree-back]');
    if (!back) {
      back = document.createElement('button');
      back.type = 'button';
      back.className = 's3-btn';
      back.setAttribute('data-s5-tree-back', '1');
      back.textContent = 'Înapoi la rădăcină';
      back.addEventListener('click', () => {
        host._s5TreeNode = DATA.treemap;
        drawTreemap(host);
      });
      host.appendChild(back);
    }
  }

  function renderMatrix(host) {
    clearHost(host);
    const d = DATA.matrix;
    const wrap = document.createElement('div');
    wrap.className = 's5-matrix-wrap';
    let html = '<table><thead><tr><th>Regiune</th>';
    d.cols.forEach((c) => { html += '<th>' + esc(c) + '</th>'; });
    html += '<th>Total</th></tr></thead><tbody>';
    d.rows.forEach((row, ri) => {
      let sum = 0;
      html += '<tr><td>' + esc(row) + '</td>';
      d.values[ri].forEach((v) => { sum += v; html += '<td>' + v + '</td>'; });
      html += '<td><strong>' + sum + '</strong></td></tr>';
    });
    html += '<tr class="is-subtotal"><td>Total</td>';
    d.cols.forEach((_, ci) => {
      let col = 0;
      d.values.forEach((row) => { col += row[ci]; });
      html += '<td>' + col + '</td>';
    });
    html += '<td>' + d.values.flat().reduce((a, b) => a + b, 0) + '</td></tr></tbody></table>';
    wrap.innerHTML = html;
    host.appendChild(wrap);
  }

  function renderTable(host) {
    clearHost(host);
    const wrap = document.createElement('div');
    wrap.className = 's5-table-wrap';
    const table = document.createElement('table');
    table.innerHTML =
      '<thead><tr><th data-sort="nr">Nr</th><th data-sort="client">Client</th><th data-sort="data">Dată</th><th data-sort="suma">Sumă</th><th>Status</th></tr></thead><tbody></tbody>';
    wrap.appendChild(table);
    host.appendChild(wrap);
    const tbody = table.querySelector('tbody');
    let sortKey = 'data';
    let asc = true;

    function paint() {
      const rows = [...DATA.invoices].sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (sortKey === 'suma') return asc ? va - vb : vb - va;
        return asc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
      tbody.innerHTML = rows
        .map((r) => {
          const st = r.status === 'Întârziată' ? 'is-neg' : r.status === 'Plătită' ? 'is-pos' : '';
          return (
            '<tr><td>' +
            esc(r.nr) +
            '</td><td>' +
            esc(r.client) +
            '</td><td>' +
            esc(r.data) +
            '</td><td>' +
            r.suma +
            '</td><td class="' +
            st +
            '">' +
            esc(r.status) +
            '</td></tr>'
          );
        })
        .join('');
    }
    table.querySelectorAll('[data-sort]').forEach((th) => {
      th.addEventListener('click', () => {
        const k = th.getAttribute('data-sort');
        if (sortKey === k) asc = !asc;
        else {
          sortKey = k;
          asc = true;
        }
        paint();
      });
    });
    paint();
  }

  function renderDecomp(host) {
    clearHost(host);
    const box = document.createElement('div');
    box.className = 's5-decomp';
    host.appendChild(box);

    function branch(node, depth) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = '<strong>' + esc(node.label) + '</strong> · ' + esc(node.value);
      li.appendChild(btn);
      if (node.children && node.children.length) {
        const ul = document.createElement('ul');
        ul.hidden = true;
        node.children.forEach((ch) => ul.appendChild(branch(ch, depth + 1)));
        btn.addEventListener('click', () => {
          ul.hidden = !ul.hidden;
        });
        li.appendChild(ul);
      }
      return li;
    }

    const ul = document.createElement('ul');
    ul.appendChild(branch(DATA.decomp, 0));
    box.appendChild(ul);
  }

  const RENDERERS = {
    'stacked-column': (h) => drawBars(h, { data: DATA.supermarket, defaultVariant: 'stacked' }),
    'stacked-bar': (h) => drawBars(h, { data: DATA.tickets, horizontal: true, defaultVariant: 'stacked' }),
    'pct-stacked': (h) => drawBars(h, { data: DATA.payments, defaultVariant: '100' }),
    line: (h) => drawLineArea(h, 'line'),
    area: (h) => drawLineArea(h, 'area-stack'),
    combo: drawCombo,
    waterfall: drawWaterfall,
    funnel: drawFunnel,
    scatter: drawScatter,
    treemap: drawTreemap,
    matrix: renderMatrix,
    table: renderTable,
    decomp: renderDecomp
  };

  function renderChart(host) {
    if (!host) return;
    const force = host.dataset.s5Force === '1';
    if (host.dataset.s5Rendered === '1' && !force) return;
    const kind = host.getAttribute('data-s5-chart');
    const fn = RENDERERS[kind];
    if (!fn) return;
    if (!host._s5Hidden) host._s5Hidden = new Set();
    host.dataset.s5Force = '';
    fn(host);
    host.dataset.s5Rendered = '1';
  }

  function refreshChartsInSlide(slide) {
    if (!slide) return;
    slide.querySelectorAll('[data-s5-chart]').forEach((host) => {
      host.dataset.s5Rendered = '';
      if (host.getAttribute('data-s5-chart') === 'treemap') host._s5TreeNode = DATA.treemap;
      renderChart(host);
    });
  }

  function initSlideWatch() {
    const slides = document.querySelectorAll('.slide');
    const check = () => {
      const active = document.querySelector('.slide.active');
      refreshChartsInSlide(active);
    };
    slides.forEach((s) => {
      new MutationObserver(check).observe(s, { attributes: true, attributeFilter: ['class'] });
    });
    document.querySelectorAll('[data-slide-prev], [data-slide-next], .slide-dot').forEach((btn) => {
      btn.addEventListener('click', () => setTimeout(check, 0));
    });
    check();
  }

  function initVariants() {
    document.querySelectorAll('[data-s5-variant-toggle]').forEach((root) => {
      const box = root.closest('.s5-chart-box');
      const host = box ? box.querySelector('[data-s5-chart]') : null;
      const active = root.querySelector('button[data-s5-variant].is-on') || root.querySelector('button[data-s5-variant]');
      if (host && active) host.setAttribute('data-s5-variant', active.getAttribute('data-s5-variant'));
      root.querySelectorAll('button[data-s5-variant]').forEach((btn) => {
        btn.addEventListener('click', () => {
          root.querySelectorAll('button[data-s5-variant]').forEach((b) => b.classList.toggle('is-on', b === btn));
          if (host) {
            host.setAttribute('data-s5-variant', btn.getAttribute('data-s5-variant'));
            host.dataset.s5Rendered = '';
            host.dataset.s5Force = '1';
            renderChart(host);
          }
        });
      });
    });
  }

  function initChoose() {
    const root = document.querySelector('[data-s5-choose]');
    if (!root) return;
    const out = document.querySelector('[data-s5-choose-out]');
    const map = {
      compare: 'Bar, Column (clustered / stacked).',
      part: '100% stacked, Treemap.',
      time: 'Line, Area, Line and stacked column (combo).',
      flow: 'Waterfall, Funnel.',
      relation: 'Scatter.',
      detail: 'Table, Matrix, Decomposition tree.'
    };
    const paint = (k) => {
      if (out) out.innerHTML = '<strong>Grafice potrivite:</strong> ' + esc(map[k] || '');
    };
    root.querySelectorAll('button[data-s5-q]').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('button[data-s5-q]').forEach((b) => b.classList.toggle('is-on', b === btn));
        paint(btn.getAttribute('data-s5-q'));
      });
    });
    const first = root.querySelector('button[data-s5-q].is-on');
    if (first) paint(first.getAttribute('data-s5-q'));
  }

  function initDemoToggle() {
    const root = document.querySelector('[data-s5-demo]');
    if (!root) return;
    const view = root.querySelector('[data-s5-demo-view]');
    const data = [12, 19, 8, 22, 15, 28, 11, 24, 17, 20, 9, 26];
    const labels = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function tableView() {
      let h = '<table class="s4-sheet"><thead><tr><th>Lună</th><th>Vânzări (k)</th></tr></thead><tbody>';
      labels.forEach((l, i) => { h += '<tr><td>' + l + '</td><td>' + data[i] + '</td></tr>'; });
      h += '</tbody></table>';
      view.innerHTML = h;
    }

    const savedVisitors = { labels: DATA.visitors.labels.slice(), values: DATA.visitors.values.slice() };

    function chartView() {
      view.innerHTML = '<div data-s5-chart="line" style="min-height:160px"></div>';
      const host = view.querySelector('[data-s5-chart]');
      host.dataset.s5Rendered = '';
      DATA.visitors.values = data.slice();
      DATA.visitors.labels = labels.slice();
      renderChart(host);
      DATA.visitors.labels = savedVisitors.labels;
      DATA.visitors.values = savedVisitors.values;
    }

    root.querySelectorAll('[data-s5-demo-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-s5-demo-mode]').forEach((b) => {
          b.classList.toggle('is-on', b === btn);
          b.classList.toggle('is-primary', b === btn);
        });
        if (btn.getAttribute('data-s5-demo-mode') === 'table') tableView();
        else chartView();
      });
    });
    tableView();
  }

  function initAnatomy() {
    const root = document.querySelector('[data-s5-anatomy]');
    if (!root) return;
    const note = root.querySelector('[data-s5-anatomy-note]');
    const tips = {
      title: 'Titlu: spune ce întrebare răspunde graficul, nu doar ce date conține.',
      legend: 'Legendă: a treia dimensiune codificată prin culoare (categorie suplimentară).',
      axis: 'Axe: X = categorii sau timp; Y = scara numerică.',
      labels: 'Data labels: valoarea exactă pe element, când precizia contează mai mult decât forma.',
      tooltip: 'Tooltip: context suplimentar la interacțiune, fără să aglomereze vizualul de bază.',
      grid: 'Gridlines: reper pentru citirea aproximativă a valorilor pe axă.'
    };
    root.querySelectorAll('[data-s5-part]').forEach((hot) => {
      hot.addEventListener('mouseenter', () => {
        root.querySelectorAll('[data-s5-part]').forEach((h) => h.classList.remove('is-on'));
        hot.classList.add('is-on');
        const k = hot.getAttribute('data-s5-part');
        if (note) note.textContent = tips[k] || '';
      });
    });
  }

  function initFrameworkInteractives() {
    document.querySelectorAll('[data-s5-dtypes]').forEach((root) => {
      const panel = root.closest('.slide')?.querySelector('[data-s5-dtype-panel]');
      if (!panel) return;
      const show = (key) => {
        root.querySelectorAll('[data-s5-dtype]').forEach((b) => {
          b.classList.toggle('is-on', b.getAttribute('data-s5-dtype') === key);
        });
        panel.querySelectorAll('[data-s5-dtype-content]').forEach((el) => {
          const on = el.getAttribute('data-s5-dtype-content') === key;
          el.classList.toggle('is-on', on);
          if (on) el.removeAttribute('hidden');
          else el.setAttribute('hidden', '');
        });
      };
      root.querySelectorAll('[data-s5-dtype]').forEach((btn) => {
        btn.addEventListener('click', () => show(btn.getAttribute('data-s5-dtype')));
      });
      const initial = root.querySelector('[data-s5-dtype].is-on') || root.querySelector('[data-s5-dtype]');
      if (initial) show(initial.getAttribute('data-s5-dtype'));
    });

    document.querySelectorAll('[data-s5-communicate]').forEach((root) => {
      const detail = root.closest('.slide')?.querySelector('[data-s5-comm-detail]');
      if (!detail) return;
      const show = (key) => {
        root.querySelectorAll('[data-s5-comm]').forEach((b) => {
          b.classList.toggle('is-on', b.getAttribute('data-s5-comm') === key);
        });
        detail.querySelectorAll('[data-s5-comm-panel]').forEach((el) => {
          const on = el.getAttribute('data-s5-comm-panel') === key;
          el.classList.toggle('is-on', on);
          if (on) el.removeAttribute('hidden');
          else el.setAttribute('hidden', '');
        });
      };
      root.querySelectorAll('[data-s5-comm]').forEach((btn) => {
        btn.addEventListener('click', () => show(btn.getAttribute('data-s5-comm')));
      });
      const initialComm = root.querySelector('[data-s5-comm].is-on') || root.querySelector('[data-s5-comm]');
      if (initialComm) show(initialComm.getAttribute('data-s5-comm'));
    });

    document.querySelectorAll('[data-s5-mistakes]').forEach((root) => {
      const detail = root.closest('.slide')?.querySelector('[data-s5-mistake-detail]');
      if (!detail) return;
      const show = (key) => {
        root.querySelectorAll('[data-s5-mistake]').forEach((b) => {
          b.classList.toggle('is-on', b.getAttribute('data-s5-mistake') === key);
        });
        detail.querySelectorAll('[data-s5-mistake-panel]').forEach((el) => {
          const on = el.getAttribute('data-s5-mistake-panel') === key;
          el.classList.toggle('is-on', on);
          if (on) el.removeAttribute('hidden');
          else el.setAttribute('hidden', '');
        });
      };
      root.querySelectorAll('[data-s5-mistake]').forEach((btn) => {
        btn.addEventListener('click', () => show(btn.getAttribute('data-s5-mistake')));
      });
      const initialM = root.querySelector('[data-s5-mistake].is-on') || root.querySelector('[data-s5-mistake]');
      if (initialM) show(initialM.getAttribute('data-s5-mistake'));
    });

    document.querySelectorAll('[data-s5-audience]').forEach((root) => {
      const mock = root.closest('.slide')?.querySelector('[data-s5-aud-mock]');
      if (!mock) return;
      const show = (key) => {
        root.querySelectorAll('[data-s5-aud]').forEach((b) => {
          b.classList.toggle('is-on', b.getAttribute('data-s5-aud') === key);
        });
        mock.querySelectorAll('[data-s5-aud-scene]').forEach((el) => {
          const on = el.getAttribute('data-s5-aud-scene') === key;
          el.hidden = !on;
          el.classList.toggle('is-on', on);
        });
      };
      root.querySelectorAll('[data-s5-aud]').forEach((btn) => {
        btn.addEventListener('click', () => show(btn.getAttribute('data-s5-aud')));
      });
    });

    document.querySelectorAll('[data-s5-context]').forEach((root) => {
      const btn = root.querySelector('[data-s5-context-toggle]');
      const extra = root.querySelector('[data-s5-context-extra]');
      const deltas = root.querySelector('[data-s5-context-deltas]');
      if (!btn || !extra) return;
      btn.addEventListener('click', () => {
        const open = extra.hidden;
        extra.hidden = !open;
        if (deltas) deltas.hidden = !open;
        root.classList.toggle('is-open', open);
        btn.classList.toggle('is-on', open);
        btn.textContent = open ? 'Ascunde contextul' : 'Context';
      });
    });
  }

  function initStackedRead() {
    const hints = {
      all: 'Apasă o regulă din dreapta. Graficul arată exact bucata despre care vorbești.',
      total: 'Bara întreagă este totalul. Laptop Pro are 600, Mouse are 120. Compari totalurile dintr-o privire.',
      color: 'Verde este Online, albastru este Magazin. Culorile sunt valorile din Legend.',
      segment: 'Doar segmentul verde pornește din același punct, deci îl compari ușor. Albastrul plutește.'
    };
    document.querySelectorAll('[data-s5-read]').forEach((root) => {
      const hint = root.querySelector('[data-s5-read-hint]');
      const buttons = root.querySelectorAll('[data-s5-read-mode]');
      const set = (mode) => {
        root.setAttribute('data-mode', mode);
        buttons.forEach((b) => {
          const on = b.getAttribute('data-s5-read-mode') === mode;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (hint) hint.textContent = hints[mode] || hints.all;
      };
      buttons.forEach((b) => {
        b.addEventListener('click', () => {
          const mode = b.getAttribute('data-s5-read-mode');
          set(root.getAttribute('data-mode') === mode ? 'all' : mode);
        });
      });
      set('all');
    });
  }

  /* Familii de grafice: butoane de variantă care schimbă panoul și titlul */
  function initFamilies() {
    document.querySelectorAll('[data-s5f]').forEach((root) => {
      const groups = Array.from(root.querySelectorAll('[data-s5f-group]'));
      const title = root.querySelector('[data-s5f-title]');
      const show = () => {
        const key = groups.map((g) => (g.querySelector('.is-on') || g.querySelector('[data-v]')).getAttribute('data-v')).join('|');
        root.querySelectorAll('[data-s5f-panel]').forEach((p) => {
          const on = p.getAttribute('data-s5f-panel') === key;
          p.classList.toggle('is-on', on);
          if (on) {
            p.removeAttribute('hidden');
            if (title) title.textContent = p.getAttribute('data-title');
          } else p.setAttribute('hidden', '');
        });
      };
      groups.forEach((g) => {
        g.querySelectorAll('[data-v]').forEach((btn) => {
          btn.addEventListener('click', () => {
            g.querySelectorAll('[data-v]').forEach((b) => b.classList.toggle('is-on', b === btn));
            show();
            btn.blur();
          });
        });
      });
      show();
    });
  }

  function boot() {
    initVariants();
    initChoose();
    initDemoToggle();
    initAnatomy();
    initFrameworkInteractives();
    initStackedRead();
    initFamilies();
    initSlideWatch();
  }

  if (window.SessionGate && window.SessionGate.whenOpen) window.SessionGate.whenOpen.then(boot);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
