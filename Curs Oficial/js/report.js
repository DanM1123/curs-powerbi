/* ============================================================
     KPI count-up for bio slide
     ============================================================ */
  (function() {
    let done = false;
    const run = () => {
      if (done) return; done = true;
      document.querySelectorAll('[data-count-up]').forEach(el => {
        const target = parseInt(el.getAttribute('data-count-up'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const dur = 900, t0 = performance.now();
        const step = now => {
          const p = Math.min((now - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };
    const obs = new MutationObserver(() => {
      const slides = document.querySelectorAll('.slide');
      if (slides[1]?.classList.contains('active')) run();
    });
    document.addEventListener('DOMContentLoaded', () => {
      const deck = document.querySelector('.slide-deck');
      if (deck) obs.observe(deck, { subtree:true, attributeFilter:['class'] });
    });
  })();

  /* ============================================================
     Generic reveal stepper (BI flow + structura sesiunilor)
     ============================================================ */
  const steppers = {};

  function stepperSteps(id) {
    return document.querySelectorAll('[data-stepper="' + id + '"] [data-bi-step]');
  }

  function stepNext(id) {
    const s = steppers[id];
    if (!s) return;
    const steps = stepperSteps(id);
    if (s.visible < s.total) {
      steps[s.visible].classList.add('visible');
      s.visible++;
      updateStepper(id);
    }
  }
  function stepPrev(id) {
    const s = steppers[id];
    if (!s) return;
    const steps = stepperSteps(id);
    if (s.visible > 0) {
      s.visible--;
      steps[s.visible].classList.remove('visible');
      updateStepper(id);
    }
  }
  function updateStepper(id) {
    const s = steppers[id];
    if (!s) return;
    const prevBtn = document.getElementById(id + 'StepPrev');
    const nextBtn = document.getElementById(id + 'StepNext');
    const counter = document.getElementById(id + 'StepCounter');
    if (counter) counter.textContent = s.visible + ' / ' + s.total;
    if (prevBtn) prevBtn.disabled = s.visible === 0;
    if (nextBtn) {
      nextBtn.disabled = s.visible >= s.total;
      if (s.visible >= s.total) {
        nextBtn.textContent = '✓ Toate';
        nextBtn.classList.remove('primary');
        nextBtn.classList.add('done');
      } else {
        nextBtn.textContent = (s.nextLabel || 'Următorul') + ' ' + (s.visible + 1) + ' →';
        nextBtn.classList.add('primary');
        nextBtn.classList.remove('done');
      }
    }
  }

  function biStepNext() { stepNext('bi'); }
  function biStepPrev() { stepPrev('bi'); }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-stepper]').forEach(grid => {
      const id = grid.getAttribute('data-stepper');
      const steps = grid.querySelectorAll('[data-bi-step]');
      steppers[id] = {
        visible: 0,
        total: steps.length,
        nextLabel: grid.getAttribute('data-next-label') || 'Următorul'
      };
      updateStepper(id);
    });
  });

  /* ============================================================
     Interactive BI Report
     ============================================================ */
  const MONTHLY_PROFIT = {
    '2022': {
      all:   [310,292,382,422,452,482,522,492,442,392,362,272],
      casaA: [80,72,98,112,122,128,138,128,118,102,92,68],
      casaB: [130,120,158,178,188,202,218,208,188,168,158,118],
      casaC: [100,98,124,130,140,150,164,154,134,120,110,84],
      casaD: [48,45,60,68,72,75,80,75,70,62,58,45]
    },
    '2023': {
      all:   [392,382,462,522,562,602,642,614,574,514,484,374],
      casaA: [102,97,117,133,143,152,162,157,142,127,122,92],
      casaB: [167,162,197,222,237,258,272,262,242,217,207,157],
      casaC: [121,121,146,165,180,190,206,193,188,168,153,123],
      casaD: [58,55,72,82,88,92,98,92,86,78,72,55]
    },
    '2024': {
      all:   [524,514,624,694,744,794,834,804,764,684,644,504],
      casaA: [132,127,157,177,187,197,212,202,192,172,162,127],
      casaB: [217,212,257,287,307,327,342,332,317,282,267,207],
      casaC: [173,173,208,228,248,268,278,268,253,228,213,168],
      casaD: [72,68,88,102,112,118,128,122,114,98,92,72]
    }
  };
  const YEARLY_TOTALS = {
    all:   { labels:['2022','2023','2024'], values:[4600,6100,8300] },
    casaA: { labels:['2022','2023','2024'], values:[1160,1455,1975] },
    casaB: { labels:['2022','2023','2024'], values:[1835,2400,3335] },
    casaC: { labels:['2022','2023','2024'], values:[1449,1954,2751] },
    casaD: { labels:['2022','2023','2024'], values:[758,928,1187] }
  };
  const MONTH_LABELS = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec'];

  const KPI_DATA = {
    all: {
      all:   { sales:'€56.8M', profit:'€16.2M', units:376, clients:354, sd:'Toată perioada', pd:'Marjă 28.5%', ud:'Toate tipurile', cd:'94% unici' },
      casaA: { sales:'€20.3M', profit:'€5.6M',  units:158, clients:149, sd:'36% din total', pd:'Marjă 27.6%', ud:'Cel mai vândut', cd:'Top segment' },
      casaB: { sales:'€21.5M', profit:'€6.3M',  units:114, clients:107, sd:'38% din total', pd:'Marjă 29.3%', ud:'Segment mediu', cd:'Cel mai stabil' },
      casaC: { sales:'€15.0M', profit:'€4.3M',  units:45,  clients:43,  sd:'26% din total', pd:'Marjă 28.7%', ud:'Cel mai scump', cd:'Premium' },
      casaD: { sales:'€4.8M',  profit:'€1.38M', units:59,  clients:55,  sd:'8% din total',  pd:'Marjă 28.8%', ud:'Entry level', cd:'Studio' }
    },
    '2022': {
      all:   { sales:'€14.5M', profit:'€3.8M',  units:89,  clients:84,  sd:'Baza 2022', pd:'Marjă 26.2%', ud:'89 unități', cd:'84 clienți' },
      casaA: { sales:'€5.4M',  profit:'€1.16M', units:36,  clients:34,  sd:'37% an 2022', pd:'Marjă 21.5%', ud:'36 unități', cd:'34 clienți' },
      casaB: { sales:'€5.3M',  profit:'€1.66M', units:28,  clients:26,  sd:'37% an 2022', pd:'Marjă 31.3%', ud:'28 unități', cd:'26 clienți' },
      casaC: { sales:'€3.8M',  profit:'€0.98M', units:12,  clients:12,  sd:'26% an 2022', pd:'Marjă 25.8%', ud:'12 unități', cd:'12 clienți' },
      casaD: { sales:'€1.28M', profit:'€0.758M',units:13,  clients:12,  sd:'9% an 2022',  pd:'Marjă 59.2%', ud:'13 unități', cd:'12 clienți' }
    },
    '2023': {
      all:   { sales:'€18.7M', profit:'€5.1M',  units:105, clients:98,  sd:'▲ 29% vs 2022', pd:'Marjă 27.3%', ud:'▲ +18%', cd:'▲ +17%' },
      casaA: { sales:'€6.7M',  profit:'€1.46M', units:42,  clients:39,  sd:'▲ 24% vs 2022', pd:'Marjă 21.8%', ud:'42 unități', cd:'39 clienți' },
      casaB: { sales:'€6.8M',  profit:'€2.26M', units:33,  clients:31,  sd:'▲ 28% vs 2022', pd:'Marjă 33.2%', ud:'33 unități', cd:'31 clienți' },
      casaC: { sales:'€5.2M',  profit:'€1.39M', units:15,  clients:14,  sd:'▲ 37% vs 2022', pd:'Marjă 26.7%', ud:'15 unități', cd:'14 clienți' },
      casaD: { sales:'€1.68M', profit:'€0.928M',units:15,  clients:14,  sd:'▲ 31% vs 2022', pd:'Marjă 55.2%', ud:'15 unități', cd:'14 clienți' }
    },
    '2024': {
      all:   { sales:'€23.6M', profit:'€7.3M',  units:123, clients:116, sd:'▲ 26% vs 2023', pd:'Marjă 30.9%', ud:'▲ +17%', cd:'▲ +18%' },
      casaA: { sales:'€8.2M',  profit:'€1.98M', units:52,  clients:49,  sd:'▲ 22% vs 2023', pd:'Marjă 24.1%', ud:'52 unități', cd:'49 clienți' },
      casaB: { sales:'€8.4M',  profit:'€2.82M', units:38,  clients:36,  sd:'▲ 24% vs 2023', pd:'Marjă 33.6%', ud:'38 unități', cd:'36 clienți' },
      casaC: { sales:'€7.0M',  profit:'€2.17M', units:18,  clients:17,  sd:'▲ 35% vs 2023', pd:'Marjă 31.0%', ud:'18 unități', cd:'17 clienți' },
      casaD: { sales:'€2.14M', profit:'€1.187M',units:17,  clients:14,  sd:'▲ 27% vs 2023', pd:'Marjă 55.5%', ud:'17 unități', cd:'14 clienți' }
    }
  };

  // Pie: units distribution by house type
  const PIE_DATA = {
    all:    [[42,'Casa A','#059669'],[30,'Casa B','#14B8A6'],[12,'Casa C','#84CC16'],[16,'Casa D','#06B6D4']],
    '2022': [[40,'Casa A','#059669'],[32,'Casa B','#14B8A6'],[13,'Casa C','#84CC16'],[15,'Casa D','#06B6D4']],
    '2023': [[40,'Casa A','#059669'],[31,'Casa B','#14B8A6'],[14,'Casa C','#84CC16'],[14,'Casa D','#06B6D4']],
    '2024': [[42,'Casa A','#059669'],[31,'Casa B','#14B8A6'],[15,'Casa C','#84CC16'],[13,'Casa D','#06B6D4']]
  };

  let activeYear = 'all', activeType = 'all';

  // Smooth catmull-rom curve generator for nicer line chart
  function smoothPath(points) {
    if (points.length < 2) return '';
    const d = [`M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const tension = 0.18;
      const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
      const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
      const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
      const cp2y = p2[1] - (p3[1] - p1[1]) * tension;
      d.push(`C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`);
    }
    return d.join(' ');
  }

  function renderLineChart() {
    const isAllYears = activeYear === 'all';
    let labels, vals;
    if (isAllYears) {
      const d = YEARLY_TOTALS[activeType] || YEARLY_TOTALS.all;
      labels = d.labels; vals = d.values;
    } else {
      const yr = MONTHLY_PROFIT[activeYear];
      vals = yr ? (yr[activeType] || yr.all) : MONTHLY_PROFIT['2024'].all;
      labels = MONTH_LABELS;
    }
    const n = vals.length;
    const rawMax = Math.max(...vals), rawMin = Math.min(...vals);
    const pad = (rawMax - rawMin) * 0.18 || rawMax * 0.15;
    const maxV = rawMax + pad, minV = Math.max(0, rawMin - pad * 0.6);
    const range = maxV - minV || 1;

    // Generous viewBox: 600x220 with healthy padding for labels
    const W = 600, H = 220, pL = 50, pR = 18, pT = 16, pB = 32;
    const gW = W - pL - pR, gH = H - pT - pB;
    const px = i => pL + (n > 1 ? (i / (n - 1)) * gW : gW / 2);
    const py = v => pT + (1 - (v - minV) / range) * gH;

    const colors = { casaA:'#059669', casaB:'#14B8A6', casaC:'#84CC16', casaD:'#06B6D4', all:'#059669' };
    const color = colors[activeType] || '#059669';
    const gradId = 'lcGrad-' + activeType;

    const fmtVal = v => v >= 1000 ? '€' + (v/1000).toFixed(2) + 'M' : '€' + Math.round(v) + 'k';
    const fmtAxis = v => v >= 1000 ? (v/1000).toFixed(1)+'M' : Math.round(v)+'k';

    let svg = '';

    // Gradient definition for area fill
    svg += `<defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.02"/>
      </linearGradient>
    </defs>`;

    // 4 horizontal grid lines (incl. min and max)
    for (let f = 0; f <= 1.001; f += 0.25) {
      const gv = minV + range * f;
      const y = py(gv);
      svg += `<line x1="${pL}" y1="${y.toFixed(1)}" x2="${W-pR}" y2="${y.toFixed(1)}" class="lc-grid"/>`;
      svg += `<text x="${pL-8}" y="${(y+3).toFixed(1)}" class="lc-ylabel">${fmtAxis(gv)}€</text>`;
    }

    // X axis baseline
    svg += `<line x1="${pL}" y1="${(pT+gH).toFixed(1)}" x2="${W-pR}" y2="${(pT+gH).toFixed(1)}" class="lc-axis"/>`;

    // X labels
    const step = n > 8 ? Math.ceil(n / 6) : 1;
    labels.forEach((lbl, i) => {
      if (i % step === 0 || i === n - 1) {
        svg += `<text x="${px(i).toFixed(1)}" y="${H-8}" class="lc-xlabel">${lbl}</text>`;
      }
    });

    // Build smooth curve
    const points = vals.map((v, i) => [px(i), py(v)]);
    const linePath = smoothPath(points);

    // Area (closed below curve)
    const areaPath = linePath + ` L${px(n-1).toFixed(1)},${(pT+gH).toFixed(1)} L${px(0).toFixed(1)},${(pT+gH).toFixed(1)} Z`;
    svg += `<path d="${areaPath}" fill="url(#${gradId})" class="lc-area"/>`;

    // Line
    svg += `<path d="${linePath}" stroke="${color}" class="lc-line"/>`;

    // Hover guide line (vertical)
    svg += `<line id="lcHoverLine" class="lc-hover-line" stroke="${color}" x1="0" y1="${pT}" x2="0" y2="${pT+gH}"/>`;

    // Points + invisible halos for easier hovering
    vals.forEach((v, i) => {
      const label = fmtVal(v);
      const cx = px(i).toFixed(1), cy = py(v).toFixed(1);
      svg += `<circle cx="${cx}" cy="${cy}" r="14" class="lc-point-halo"
        data-period="${labels[i]}" data-value="${label}" data-x="${cx}" data-y="${cy}"
        onmouseenter="showLCTip(this)" onmouseleave="hideLCTip()"/>`;
      svg += `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${color}" class="lc-point" pointer-events="none"/>`;
    });

    document.getElementById('lineChart').innerHTML = svg;
    const typeLabel = {casaA:' · Casa A', casaB:' · Casa B', casaC:' · Casa C', casaD:' · Casa D', all:''}[activeType] || '';
    const periodLabel = isAllYears ? 'pe ani' : activeYear + ' (lunar)';
    document.getElementById('lineChartTitle').textContent = `Trend Profit ${periodLabel}${typeLabel}`;
  }

  function renderPieChart() {
    const yearKey = activeYear === 'all' ? 'all' : activeYear;
    let segs = (PIE_DATA[yearKey] || PIE_DATA['all']).slice();

    // If filtering by type, highlight that slice (gray out others)
    const cx = 80, cy = 80, r = 68;
    const total = segs.reduce((s, d) => s + d[0], 0);
    let offset = -Math.PI / 2;
    let paths = '';

    segs.forEach(([pct, lbl, col]) => {
      const angle = (pct / total) * Math.PI * 2;
      const x1 = cx + r * Math.cos(offset);
      const y1 = cy + r * Math.sin(offset);
      const x2 = cx + r * Math.cos(offset + angle);
      const y2 = cy + r * Math.sin(offset + angle);
      const large = angle > Math.PI ? 1 : 0;
      const isActive = activeType === 'all' || activeType === lbl.replace('Casa ', 'casa');
      const opacity = isActive ? '0.9' : '0.25';
      paths += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z"
        fill="${col}" opacity="${opacity}" stroke="var(--surface)" stroke-width="2"
        class="pie-slice"
        data-tip="${lbl}: ${pct}%"
        onmouseenter="showPieTip(event,this.dataset.tip)"
        onmouseleave="hidePieTip()"/>`;
      // Label inside slice
      if (pct > 10 && isActive) {
        const midA = offset + angle / 2;
        const lx = cx + (r * 0.6) * Math.cos(midA);
        const ly = cy + (r * 0.6) * Math.sin(midA);
        paths += `<text x="${lx.toFixed(1)}" y="${(ly+4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" pointer-events="none">${pct}%</text>`;
      }
      offset += angle;
    });

    document.getElementById('pieChart').innerHTML = paths;
  }

  function renderKPIs() {
    const yr = KPI_DATA[activeYear] || KPI_DATA['all'];
    const d = yr[activeType] || yr['all'];
    document.getElementById('kpi-sales').textContent = d.sales;
    document.getElementById('kpi-profit').textContent = d.profit;
    document.getElementById('kpi-units').textContent = d.units;
    document.getElementById('kpi-clients').textContent = d.clients;
    document.getElementById('kpi-sales-d').textContent = d.sd;
    document.getElementById('kpi-profit-d').textContent = d.pd;
    document.getElementById('kpi-units-d').textContent = d.ud;
    document.getElementById('kpi-clients-d').textContent = d.cd;
  }

  function renderReport() { renderKPIs(); renderLineChart(); renderPieChart(); }

  function setFilter(dim, val, btn) {
    btn.closest('.bi-slicer-group').querySelectorAll('.bi-slicer-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (dim === 'year') activeYear = val;
    else activeType = val;
    renderReport();
  }

  function showBIReport() {
    document.getElementById('excelView').classList.add('hidden');
    document.getElementById('biWizardBtn').style.display = 'none';
    const rep = document.getElementById('biReport');
    rep.classList.remove('hidden');
    rep.classList.add('appearing');
    renderReport();
  }

  // Line chart tooltip + hover guide
  function showLCTip(circle) {
    const tip = document.getElementById('lcTooltip');
    const svg = document.getElementById('lineChart');
    const wrap = svg.closest('.line-chart-wrap');
    const wrapRect = wrap.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    const cxAttr = parseFloat(circle.dataset.x);
    const cyAttr = parseFloat(circle.dataset.y);
    // Map svg viewBox coords to actual pixels
    const scaleX = svgRect.width / 600;
    const scaleY = svgRect.height / 220;
    const screenX = svgRect.left + cxAttr * scaleX;
    const screenY = svgRect.top + cyAttr * scaleY;

    tip.querySelector('.tip-period').textContent = circle.dataset.period;
    tip.querySelector('.tip-value').textContent = circle.dataset.value;
    tip.style.left = (screenX - wrapRect.left) + 'px';
    tip.style.top = (screenY - wrapRect.top) + 'px';
    tip.classList.add('show');

    // Show hover line
    const guide = document.getElementById('lcHoverLine');
    if (guide) {
      guide.setAttribute('x1', cxAttr);
      guide.setAttribute('x2', cxAttr);
      guide.classList.add('show');
    }
  }
  function hideLCTip() {
    document.getElementById('lcTooltip').classList.remove('show');
    const guide = document.getElementById('lcHoverLine');
    if (guide) guide.classList.remove('show');
  }

  // Pie tooltip
  function showPieTip(e, text) {
    const tip = document.getElementById('pieTooltip');
    tip.textContent = text; tip.style.opacity = '1';
  }
  function hidePieTip() {
    const tip = document.getElementById('pieTooltip');
    tip.style.opacity = '0';
  }
