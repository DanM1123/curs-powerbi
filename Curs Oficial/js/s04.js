/* Sesiunea 4 · modelare: tabel flat, pânză de relații, normalizare, filtre */
(function () {
  'use strict';

  const S4_FLAT = {
    headers: ['ID','Plecare','Călător','Reședință','Vârstă','Oraș','Țară','Continent','Tip','Mijloc','Zile','Cost'],
    target: 'Violeta Gutu',
    targetDays: 26,
    rows: [
      ['V22','22.09.2024','Beatrice Adina Antonievici','București',39,'Florența','Italia','Europa','Cultural','Tren',5,1310],
      ['V12','20.09.2023','Violeta Gutu','Cluj-Napoca',34,'Londra','Marea Britanie','Europa','City break','Avion',5,1680],
      ['V11','18.08.2023','Alexandru-Paul Dima','Cluj-Napoca',27,'Reykjavik','Islanda','Europa','Aventura','Avion',6,2400],
      ['V19','20.07.2024','Andreea Filip','Timișoara',29,'New York','SUA','America de Nord','City break','Avion',12,6200],
      ['V21','03.05.2024','Violeta Gutu','Cluj-Napoca',34,'Viena','Austria','Europa','City break','Tren',4,920],
      ['V15','02.10.2023','Beatrice Adina Antonievici','București',39,'Budapesta','Ungaria','Europa','City break','Tren',4,720],
      ['V18','18.07.2024','Mariana Vasile','Brașov',45,'Santorini','Grecia','Europa','Plajă','Avion',8,2760],
      ['V06','11.02.2023','Ovidiu Borlean','Sibiu',36,'Dubai','EAU','Asia','Luxury','Avion',7,3200],
      ['V20','02.08.2024','Silvana Boboescu','București',41,'Maldive','Maldive','Asia','Plajă','Avion',14,4800],
      ['V14','14.09.2023','Adrian Marginean','Oradea',33,'Amsterdam','Olanda','Europa','City break','Avion',4,1120],
      ['V17','15.06.2024','Violeta Gutu','Cluj-Napoca',34,'Barcelona','Spania','Europa','Plajă','Avion',10,2100],
      ['V09','21.04.2023','Mariana Vasile','Brașov',45,'Viena','Austria','Europa','City break','Tren',3,890],
      ['V07','12.03.2023','Violeta Gutu','Cluj-Napoca',34,'Paris','Franța','Europa','City break','Avion',7,1250],
      ['V01','15.03.2022','Silvana Boboescu','București',41,'Roma','Italia','Europa','City break','Avion',5,980],
      ['V02','03.04.2022','Patricia Cadar-Musca','Constanța',31,'Bruges','Belgia','Europa','City break','Avion',3,510],
      ['V03','04.05.2022','Costin Vaetisi','Iași',38,'Bali','Indonezia','Asia','Plajă','Avion',15,5100],
      ['V05','06.11.2022','Adrian Marginean','Oradea',33,'Londra','Marea Britanie','Europa','City break','Avion',6,1980],
      ['V16','11.11.2023','Ovidiu Borlean','Sibiu',36,'Barcelona','Spania','Europa','Plajă','Avion',6,1450],
      ['V13','01.09.2023','Costin Vaetisi','Iași',38,'Tokyo','Japonia','Asia','Cultural','Avion',10,3450],
      ['V04','16.06.2022','Alexandru-Paul Dima','Cluj-Napoca',27,'Atena','Grecia','Europa','Cultural','Avion',5,1050],
      ['V10','09.05.2023','Patricia Cadar-Musca','Constanța',31,'Lisabona','Portugalia','Europa','City break','Avion',5,1540],
      ['V08','05.04.2023','Andreea Filip','Timișoara',29,'Praga','Cehia','Europa','City break','Mașină',4,640]
    ]
  };

  const BUILDERS = {
    scoala: {
      entities: [
        { id: 'elevi', label: 'Elevi' },
        { id: 'profesori', label: 'Profesori' },
        { id: 'clase', label: 'Clase' },
        { id: 'sali', label: 'Săli' },
        { id: 'materii', label: 'Materii' },
        { id: 'ore', label: 'Ore' }
      ],
      solution: [
        ['clase', 'elevi', '1:*'],
        ['profesori', 'ore', '1:*'],
        ['clase', 'ore', '1:*'],
        ['sali', 'ore', '1:*'],
        ['materii', 'ore', '1:*']
      ]
    },
    magazin: {
      entities: [
        { id: 'clienti', label: 'Clienți' },
        { id: 'produse', label: 'Produse' },
        { id: 'categorii', label: 'Categorii' },
        { id: 'comenzi', label: 'Comenzi' },
        { id: 'linii', label: 'Linii comandă' },
        { id: 'curieri', label: 'Curieri' }
      ],
      solution: [
        ['categorii', 'produse', '1:*'],
        ['clienti', 'comenzi', '1:*'],
        ['curieri', 'comenzi', '1:*'],
        ['comenzi', 'linii', '1:*'],
        ['produse', 'linii', '1:*']
      ]
    },
    clinica: {
      entities: [
        { id: 'pacienti', label: 'Pacienți' },
        { id: 'medici', label: 'Medici' },
        { id: 'spec', label: 'Specializări' },
        { id: 'consult', label: 'Consultații' },
        { id: 'cabinete', label: 'Cabinete' }
      ],
      solution: [
        ['spec', 'medici', '1:*'],
        ['pacienti', 'consult', '1:*'],
        ['medici', 'consult', '1:*'],
        ['cabinete', 'consult', '1:*']
      ]
    },
    biblioteca: {
      entities: [
        { id: 'membri', label: 'Membri' },
        { id: 'carti', label: 'Cărți' },
        { id: 'autori', label: 'Autori' },
        { id: 'imprumuturi', label: 'Împrumuturi' },
        { id: 'edituri', label: 'Edituri' },
        { id: 'autoricarti', label: 'Autori–Cărți' }
      ],
      solution: [
        ['edituri', 'carti', '1:*'],
        ['membri', 'imprumuturi', '1:*'],
        ['carti', 'imprumuturi', '1:*'],
        ['autori', 'autoricarti', '1:*'],
        ['carti', 'autoricarti', '1:*']
      ]
    }
  };

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function initS4Flat() {
    const nameCol = 2;
    const daysCol = 10;
    const preview = document.querySelector('[data-s4-preview]');
    if (preview && !preview.dataset.ready) {
      preview.dataset.ready = '1';
      preview.innerHTML = '<thead><tr>' + S4_FLAT.headers.map(h => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
        S4_FLAT.rows.map(r => '<tr>' + r.map(c => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody>';
    }

    document.querySelectorAll('[data-s4-flat]').forEach(root => {
      const table = root.querySelector('[data-s4-flat-table]');
      const doneBtn = root.querySelector('[data-s4-flat-done]');
      const totalEl = root.querySelector('[data-s4-flat-total]');
      if (!table) return;

      const cell = (kind, value) =>
        '<td data-pick="' + kind + '"' + (kind === 'days' ? ' data-days="' + value + '"' : '') + '>' + esc(value) + '</td>';

      table.innerHTML = '<thead><tr>' + S4_FLAT.headers.map((h, i) => {
        const mark = i === nameCol || i === daysCol;
        return '<th' + (mark ? ' class="is-pick"' : '') + '>' + esc(h) + '</th>';
      }).join('') + '</tr></thead><tbody>' + S4_FLAT.rows.map(r => {
        return '<tr>' + r.map((c, i) => {
          if (i === nameCol) return cell('name', c);
          if (i === daysCol) return cell('days', c);
          return '<td>' + esc(c) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody>';

      const syncRow = (tr) => {
        const nameOn = tr.querySelector('[data-pick="name"]')?.classList.contains('is-on');
        const daysOn = tr.querySelector('[data-pick="days"]')?.classList.contains('is-on');
        tr.classList.toggle('is-row-on', !!(nameOn && daysOn));
      };

      table.addEventListener('click', (ev) => {
        const td = ev.target.closest('[data-pick]');
        if (!td || !table.contains(td)) return;
        td.classList.toggle('is-on');
        syncRow(td.closest('tr'));
        if (totalEl) totalEl.hidden = true;
      });

      doneBtn?.addEventListener('click', () => {
        const rows = table.querySelectorAll('tr.is-row-on');
        let days = 0;
        rows.forEach(tr => {
          days += Number(tr.querySelector('[data-pick="days"]')?.getAttribute('data-days') || 0);
        });
        if (!totalEl) return;
        totalEl.hidden = false;
        totalEl.textContent = days + ' zile';
      });
    });
  }

  function canonLink(a, b, type) {
    if (type === '*:1') return { a: b, b: a, type: '1:*' };
    if ((type === '1:1' || type === '*:*') && a > b) return { a: b, b: a, type: type };
    return { a: a, b: b, type: type };
  }

  function initS4Builder() {
    document.querySelectorAll('[data-s4-builder]').forEach(root => {
      const key = root.getAttribute('data-s4-builder');
      const cfg = BUILDERS[key];
      if (!cfg) return;
      const palette = root.querySelector('[data-s4-palette]');
      const canvas = root.querySelector('[data-s4-canvas]');
      const svg = root.querySelector('[data-s4-wires]');
      const pop = root.querySelector('[data-s4-pop]');
      const status = root.querySelector('[data-s4-status]');
      if (!palette || !canvas || !svg) return;

      palette.innerHTML = cfg.entities.map(e =>
        '<button type="button" class="s4-chip" draggable="true" data-ent="' + e.id + '">' + esc(e.label) + '</button>'
      ).join('');

      const placed = new Map();
      const links = [];
      let pick = null;
      let pending = null;
      let dragId = null;

      const labelOf = (id) => (cfg.entities.find(e => e.id === id) || {}).label || id;

      const nodeCenter = (id) => {
        const el = placed.get(id);
        if (!el) return null;
        const cr = canvas.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        return { x: er.left - cr.left + er.width / 2, y: er.top - cr.top + er.height / 2 };
      };

      const draw = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.style.width = w + 'px';
        svg.style.height = h + 'px';
        svg.innerHTML = links.map((l, i) => {
          const p1 = nodeCenter(l.a);
          const p2 = nodeCenter(l.b);
          if (!p1 || !p2) return '';
          const cls = l.mark || '';
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const t = l.type === '1:*' ? '1  →  *' : l.type === '*:1' ? '*  →  1' : l.type;
          return '<g class="s4-wire ' + cls + '" data-wire="' + i + '">' +
            '<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '"/>' +
            '<text x="' + mx + '" y="' + (my - 6) + '">' + t + '</text></g>';
        }).join('');
      };

      const place = (id, x, y) => {
        if (placed.has(id)) return;
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 's4-node';
        el.textContent = labelOf(id);
        el.dataset.ent = id;
        el.style.left = Math.max(8, x - 54) + 'px';
        el.style.top = Math.max(8, y - 20) + 'px';
        canvas.appendChild(el);
        placed.set(id, el);
        palette.querySelector('[data-ent="' + id + '"]')?.classList.add('is-used');

        let dragged = false;
        el.addEventListener('pointerdown', (ev) => {
          if (ev.button !== 0) return;
          dragged = false;
          const startX = ev.clientX;
          const startY = ev.clientY;
          const ox = parseFloat(el.style.left);
          const oy = parseFloat(el.style.top);
          const move = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.hypot(dx, dy) < 6) return;
            dragged = true;
            const cr = canvas.getBoundingClientRect();
            el.style.left = Math.min(cr.width - el.offsetWidth - 8, Math.max(8, ox + dx)) + 'px';
            el.style.top = Math.min(cr.height - el.offsetHeight - 8, Math.max(8, oy + dy)) + 'px';
            draw();
          };
          const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            if (!dragged) selectNode(id);
          };
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', up);
        });
      };

      const picker = document.createElement('div');
      picker.className = 's4-rel-pick';
      picker.innerHTML = '<span data-s4-rel-hint>Click pe două entități de pe pânză, apoi alege tipul.</span>' +
        '<button type="button" data-card="1:1" disabled>1:1</button>' +
        '<button type="button" data-card="1:*" disabled>1:*</button>' +
        '<button type="button" data-card="*:1" disabled>*:1</button>' +
        '<button type="button" data-card="*:*" disabled>*:*</button>';
      const bar = root.querySelector('.s4-builder-bar');
      if (bar) bar.before(picker);
      else root.appendChild(picker);
      const hint = picker.querySelector('[data-s4-rel-hint]');
      const typeBtns = picker.querySelectorAll('[data-card]');

      const setTypes = (on) => {
        typeBtns.forEach(b => { b.disabled = !on; });
        picker.classList.toggle('is-ready', on);
      };
      const markPick = () => {
        placed.forEach((el, nid) => {
          const on = nid === pick || (pending && (nid === pending.a || nid === pending.b));
          el.classList.toggle('is-pick', !!on);
        });
      };

      const hidePop = () => {
        if (pop) pop.hidden = true;
        pending = null;
        setTypes(false);
        if (hint) hint.textContent = 'Click pe două entități de pe pânză, apoi alege tipul.';
      };

      const selectNode = (id) => {
        if (!pick) {
          pick = id;
          pending = null;
          markPick();
          setTypes(false);
          if (hint) hint.textContent = 'Acum click pe a doua entitate.';
          return;
        }
        if (pick === id) {
          pick = null;
          pending = null;
          markPick();
          setTypes(false);
          if (hint) hint.textContent = 'Click pe două entități de pe pânză, apoi alege tipul.';
          return;
        }
        pending = { a: pick, b: id };
        pick = null;
        markPick();
        setTypes(true);
        if (hint) hint.textContent = labelOf(pending.a) + ' și ' + labelOf(pending.b) + '. Alege tipul.';
      };

      typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (!pending || btn.disabled) return;
          const type = btn.getAttribute('data-card');
          const a = pending.a;
          const b = pending.b;
          const exists = links.some(l => (l.a === a && l.b === b) || (l.a === b && l.b === a));
          if (!exists) links.push({ a: a, b: b, type: type });
          pending = null;
          pick = null;
          markPick();
          setTypes(false);
          if (hint) hint.textContent = 'Legătura e pusă. Poți alege altă pereche.';
          if (pop) pop.hidden = true;
          draw();
        });
      });

      palette.querySelectorAll('[data-ent]').forEach(btn => {
        btn.addEventListener('dragstart', (e) => {
          dragId = btn.getAttribute('data-ent');
          e.dataTransfer.setData('text/plain', dragId);
        });
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-ent');
          if (placed.has(id)) return;
          const n = placed.size;
          place(id, 40 + (n % 3) * 160, 30 + Math.floor(n / 3) * 80);
          draw();
        });
      });
      canvas.addEventListener('dragover', (e) => e.preventDefault());
      canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const id = dragId || e.dataTransfer.getData('text/plain');
        const cr = canvas.getBoundingClientRect();
        place(id, e.clientX - cr.left, e.clientY - cr.top);
        dragId = null;
        draw();
      });

      const clearBoard = () => {
        links.length = 0;
        placed.forEach(el => el.remove());
        placed.clear();
        palette.querySelectorAll('.is-used').forEach(b => b.classList.remove('is-used'));
        hidePop();
        pick = null;
      };

      root.querySelector('[data-s4-reset]')?.addEventListener('click', () => {
        clearBoard();
        if (status) { status.hidden = true; status.textContent = ''; }
        draw();
      });

      root.querySelector('[data-s4-solve]')?.addEventListener('click', () => {
        clearBoard();
        const ids = cfg.entities.map(e => e.id);
        ids.forEach((id, i) => place(id, 70 + (i % 3) * 190, 46 + Math.floor(i / 3) * 92));
        cfg.solution.forEach(s => links.push({ a: s[0], b: s[1], type: s[2], mark: 'is-ok' }));
        draw();
        if (status) {
          status.hidden = false;
          status.textContent = 'Soluția e pe pânză: ' + cfg.solution.length + ' legături, de la context spre eveniment.';
        }
      });

      root.querySelector('[data-s4-check]')?.addEventListener('click', () => {
        const sol = cfg.solution.map(s => canonLink(s[0], s[1], s[2]));
        const have = links.map(l => Object.assign(l, { mark: '' })).map(l => ({ raw: l, c: canonLink(l.a, l.b, l.type) }));
        let ok = 0;
        have.forEach(h => {
          const match = sol.find(s => s.a === h.c.a && s.b === h.c.b && s.type === h.c.type);
          h.raw.mark = match ? 'is-ok' : 'is-bad';
          if (match) ok += 1;
        });
        const missing = sol.filter(s => !have.some(h => h.c.a === s.a && h.c.b === s.b && h.c.type === s.type));
        draw();
        if (status) {
          status.hidden = false;
          const extra = have.length - ok;
          status.innerHTML = '<strong>' + ok + ' / ' + sol.length + '</strong> legături corecte.' +
            (extra > 0 ? ' ' + extra + ' de corectat (roșu).' : '') +
            (missing.length ? ' Lipsesc: ' + missing.map(m => labelOf(m.a) + ' → ' + labelOf(m.b)).join(', ') + '.' : '');
        }
      });

      new ResizeObserver(draw).observe(canvas);
      draw();
    });
  }

  function initS4StarLines() {
    const NS = 'http://www.w3.org/2000/svg';

    const centerIn = (el, box) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - box.left,
        y: r.top + r.height / 2 - box.top,
      };
    };

    const updateStar = (root) => {
      const panel = root.closest('[data-s3-cat-panel]');
      if (panel && panel.hasAttribute('hidden')) return;
      if (!root.isConnected || root.offsetWidth < 8) return;

      const svg = root.querySelector('.s4-star-lines');
      const fact = root.querySelector('.s4-ent.is-fact');
      const dims = [...root.querySelectorAll('.s4-ent:not(.is-fact)')];
      if (!svg || !fact || !dims.length) return;

      const box = root.getBoundingClientRect();
      const w = Math.max(1, box.width);
      const h = Math.max(1, box.height);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('preserveAspectRatio', 'none');

      const fc = centerIn(fact, box);
      const need = dims.length;
      let lines = [...svg.querySelectorAll('line')];
      while (lines.length < need) {
        svg.appendChild(document.createElementNS(NS, 'line'));
        lines.push(svg.lastElementChild);
      }
      while (lines.length > need) {
        lines.pop().remove();
        lines = [...svg.querySelectorAll('line')];
      }

      dims.forEach((dim, i) => {
        const dc = centerIn(dim, box);
        const line = lines[i];
        line.setAttribute('x1', fc.x);
        line.setAttribute('y1', fc.y);
        line.setAttribute('x2', dc.x);
        line.setAttribute('y2', dc.y);
      });
    };

    const updateAll = () => {
      document.querySelectorAll('[data-s4-star]').forEach(updateStar);
    };

    let resizeT;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(updateAll, 80);
    });

    document.querySelectorAll('[data-s3-cat].s4-star-cat').forEach(cat => {
      cat.querySelectorAll('[data-s3-cat-btn]').forEach(btn => {
        btn.addEventListener('click', () => {
          requestAnimationFrame(() => requestAnimationFrame(updateAll));
        });
      });
    });

    document.querySelectorAll('[data-s4-star]').forEach(root => {
      new ResizeObserver(() => updateStar(root)).observe(root);
    });

    const deck = document.querySelector('.slide-deck') || document.querySelector('main');
    if (deck) {
      new MutationObserver(() => {
        if (deck.querySelector('.slide.active [data-s4-star]')) {
          requestAnimationFrame(() => requestAnimationFrame(updateAll));
        }
      }).observe(deck, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    }

    updateAll();
  }

  function initS4Workflow() {
    document.querySelectorAll('[data-s4-wf]').forEach(root => {
      const btns = root.querySelectorAll('[data-s4-wf-step]');
      const panels = root.querySelectorAll('[data-s4-wf-panel]');
      const show = (id) => {
        btns.forEach(b => b.classList.toggle('is-on', b.getAttribute('data-s4-wf-step') === id));
        panels.forEach(p => {
          const on = p.getAttribute('data-s4-wf-panel') === id;
          p.classList.toggle('is-on', on);
          if (on) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
      };
      btns.forEach(b => b.addEventListener('click', () => show(b.getAttribute('data-s4-wf-step'))));
    });
  }

  function initS4Morph() {
    document.querySelectorAll('[data-s4-morph]').forEach(root => {
      const btn = root.closest('.slide')?.querySelector('[data-s4-morph-go]');
      btn?.addEventListener('click', () => {
        const on = root.classList.toggle('is-star');
        if (btn) btn.textContent = on ? 'Înapoi la entități' : 'Aranjează ca stea';
      });
    });
  }

  function initS4Normalize() {
    document.querySelectorAll('[data-s4-norm]').forEach(root => {
      const btns = root.querySelectorAll('[data-s4-norm-step]');
      const panels = root.querySelectorAll('[data-s4-norm-panel]');
      const show = (id) => {
        btns.forEach(b => b.classList.toggle('is-on', b.getAttribute('data-s4-norm-step') === id));
        panels.forEach(p => {
          const on = p.getAttribute('data-s4-norm-panel') === id;
          p.classList.toggle('is-on', on);
          p.hidden = !on;
        });
      };
      btns.forEach(b => b.addEventListener('click', () => show(b.getAttribute('data-s4-norm-step'))));
    });
  }

  function initS4Filter() {
    document.querySelectorAll('[data-s4-filter]').forEach(root => {
      const body = root.querySelector('[data-s4-filter-body]');
      const total = root.querySelector('[data-s4-filter-total]');
      const note = root.querySelector('[data-s4-filter-note]');
      if (!body) return;
      const state = { calator: '', continent: '', an: '' };
      const years = (iso) => iso.slice(-4);
      const paint = () => {
        const rows = S4_FLAT.rows.filter(r => {
          if (state.calator && r[2] !== state.calator) return false;
          if (state.continent && r[7] !== state.continent) return false;
          if (state.an && years(r[1]) !== state.an) return false;
          return true;
        });
        body.innerHTML = rows.map(r => '<tr' + (r[2] === S4_FLAT.target ? ' class="is-hit"' : '') + '><td>' +
          esc(r[2]) + '</td><td>' + esc(r[5]) + '</td><td>' + esc(r[7]) + '</td><td>' + esc(r[1]) +
          '</td><td>' + r[10] + '</td></tr>').join('') || '<tr><td colspan="5">Niciun rând cu filtrul curent.</td></tr>';
        const days = rows.reduce((s, r) => s + r[10], 0);
        if (total) total.textContent = days + ' zile';
        if (note) {
          note.textContent = state.calator === S4_FLAT.target && !state.continent && !state.an
            ? 'Aceeași întrebare ca la început: ' + S4_FLAT.targetDays + ' zile, dintr-un click pe dimensiune.'
            : rows.length + ' vacanțe în fapt, după filtrele din dimensiuni.';
        }
      };
      root.querySelectorAll('[data-s4-f]').forEach(btn => {
        btn.addEventListener('click', () => {
          const dim = btn.getAttribute('data-s4-f');
          const val = btn.getAttribute('data-val');
          state[dim] = state[dim] === val ? '' : val;
          root.querySelectorAll('[data-s4-f="' + dim + '"]').forEach(b => b.classList.toggle('is-on', b.getAttribute('data-val') === state[dim]));
          paint();
        });
      });
      paint();
    });
  }

  function initS4Sort() {
    const col = (id, label, key) => ({ id, label, key: key || null });
    const CASES = {
      cafenea: {
        fact: 2,
        dim: 4,
        answers: { fact: ['comanda', 'plata'], dim: ['client', 'produs', 'angajat', 'cafenea'] },
        names: { fact: ['Comandă', 'Plată'], dim: ['Client', 'Produs', 'Angajat', 'Cafenea'] },
        columns: {
          comanda: [col('comanda_id', 'ID_Comanda', 'pk'), col('comanda_data', 'Data_Ora'), col('comanda_total', 'Total'), col('comanda_fk_client', 'ID_Client', 'fk')],
          plata: [col('plata_id', 'ID_Plata', 'pk'), col('plata_fk_comanda', 'ID_Comanda', 'fk'), col('plata_suma', 'Suma'), col('plata_metoda', 'Metoda')],
          client: [col('client_id', 'ID_Client', 'pk'), col('client_nume', 'Nume'), col('client_oras', 'Oras'), col('client_fidel', 'Data_Fidel')],
          produs: [col('produs_id', 'ID_Produs', 'pk'), col('produs_nume', 'Nume'), col('produs_cat', 'Categorie'), col('produs_pret', 'Pret')],
          angajat: [col('angajat_id', 'ID_Angajat', 'pk'), col('angajat_nume', 'Nume'), col('angajat_rol', 'Rol')],
          cafenea: [col('cafenea_id', 'ID_Cafenea', 'pk'), col('cafenea_nume', 'Nume'), col('cafenea_oras', 'Oras')]
        },
        ok: 'Tabele corecte. PK pe dim, FK în fact spre dim, măsuri și date pe eveniment.'
      },
      clinica: {
        fact: 2,
        dim: 4,
        answers: { fact: ['consultatie', 'analiza'], dim: ['pacient', 'medic', 'cabinet', 'laborator'] },
        names: { fact: ['Consultație', 'Analiză'], dim: ['Pacient', 'Medic', 'Cabinet', 'Laborator'] },
        columns: {
          consultatie: [col('consult_id', 'ID_Consultatie', 'pk'), col('consult_data', 'Data'), col('consult_tarif', 'Tarif'), col('consult_fk_pacient', 'ID_Pacient', 'fk')],
          analiza: [col('analiza_id', 'ID_Analiza', 'pk'), col('analiza_data', 'Data'), col('analiza_cost', 'Cost'), col('analiza_fk_consult', 'ID_Consultatie', 'fk')],
          pacient: [col('pacient_id', 'ID_Pacient', 'pk'), col('pacient_nume', 'Nume'), col('pacient_varsta', 'Varsta'), col('pacient_oras', 'Oras')],
          medic: [col('medic_id', 'ID_Medic', 'pk'), col('medic_nume', 'Nume'), col('medic_spec', 'Specializare')],
          cabinet: [col('cabinet_id', 'ID_Cabinet', 'pk'), col('cabinet_numar', 'Numar'), col('cabinet_etaj', 'Etaj')],
          laborator: [col('lab_id', 'ID_Laborator', 'pk'), col('lab_nume', 'Nume'), col('lab_oras', 'Oras')]
        },
        ok: 'Tabele corecte. Consultația și analiza sunt evenimente; FK le leagă de pacient sau consultație.'
      },
      hotel: {
        fact: 2,
        dim: 4,
        answers: { fact: ['rezervare', 'serviciu'], dim: ['oaspete', 'camera', 'hotel', 'receptioner'] },
        names: { fact: ['Rezervare', 'Serviciu'], dim: ['Oaspete', 'Cameră', 'Hotel', 'Recepționer'] },
        columns: {
          rezervare: [col('rez_id', 'ID_Rezervare', 'pk'), col('rez_sosire', 'Data_Sosire'), col('rez_plecare', 'Data_Plecare'), col('rez_fk_oaspete', 'ID_Oaspete', 'fk')],
          serviciu: [col('serv_id', 'ID_Serviciu', 'pk'), col('serv_data', 'Data'), col('serv_suma', 'Suma'), col('serv_fk_rez', 'ID_Rezervare', 'fk')],
          oaspete: [col('oaspete_id', 'ID_Oaspete', 'pk'), col('oaspete_nume', 'Nume'), col('oaspete_oras', 'Oras')],
          camera: [col('camera_id', 'ID_Camera', 'pk'), col('camera_numar', 'Numar'), col('camera_tip', 'Tip')],
          hotel: [col('hotel_id', 'ID_Hotel', 'pk'), col('hotel_nume', 'Nume'), col('hotel_oras', 'Oras')],
          receptioner: [col('recept_id', 'ID_Receptioner', 'pk'), col('recept_nume', 'Nume'), col('recept_fk_hotel', 'ID_Hotel', 'fk')]
        },
        ok: 'Tabele corecte. Rezervarea și serviciul extra sunt facturi; FK spre oaspete sau rezervare.'
      }
    };

    const ALIAS = {
      comanda: ['comanda', 'comenzi'],
      client: ['client', 'clienti', 'clientul'],
      produs: ['produs', 'produse', 'produsul'],
      plata: ['plata', 'plati'],
      angajat: ['angajat', 'angajati', 'angajatul'],
      cafenea: ['cafenea', 'cafenele', 'cafeneaua'],
      analiza: ['analiza', 'analize'],
      laborator: ['laborator', 'laboratoare', 'laboratorul'],
      serviciu: ['serviciu', 'servicii', 'serviciul'],
      consultatie: ['consultatie', 'consultatii', 'consultatia'],
      pacient: ['pacient', 'pacienti', 'pacientul'],
      medic: ['medic', 'medici', 'medicul'],
      cabinet: ['cabinet', 'cabinete', 'cabinetul'],
      rezervare: ['rezervare', 'rezervari', 'rezervarea'],
      oaspete: ['oaspete', 'oaspeti', 'oaspetele'],
      camera: ['camera', 'camere'],
      hotel: ['hotel', 'hotelul', 'hoteluri'],
      receptioner: ['receptioner', 'receptioneri', 'receptionerul']
    };
    const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
    const canon = (label) => {
      const n = norm(label);
      const hit = Object.keys(ALIAS).find(key => ALIAS[key].some(a => n === a || n.includes(a) || a.includes(n)));
      if (hit) return hit;
      const keyHit = Object.keys(ALIAS).find(key => n === key || n.includes(key) || key.includes(n));
      return keyHit || n;
    };

    const makeEntityCanon = (cfg) => {
      const map = {};
      ['fact', 'dim'].forEach(kind => {
        cfg.answers[kind].forEach((key, i) => {
          const disp = cfg.names[kind][i];
          map[norm(key)] = key;
          map[norm(disp)] = key;
          (ALIAS[key] || []).forEach(a => { map[norm(a)] = key; });
        });
      });
      return (label) => {
        const n = norm(label);
        if (map[n]) return map[n];
        const fuzzy = Object.keys(map).find(k => k.length >= 4 && (n.includes(k) || k.includes(n)));
        if (fuzzy) return map[fuzzy];
        return canon(label);
      };
    };

    const sameSet = (got, want, toKey) => {
      if (got.length !== want.length) return false;
      const mapKey = toKey || canon;
      const a = got.map(mapKey).sort();
      const b = want.slice().sort();
      return a.every((v, i) => v === b[i]);
    };

    const shuffle = (arr) => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    document.querySelectorAll('[data-s4-sort]').forEach(root => {
      const cfg = CASES[root.getAttribute('data-s4-sort')];
      if (!cfg) return;
      const entityCanon = makeEntityCanon(cfg);
      const pool = root.querySelector('[data-s4-pool]');
      const attrPool = root.querySelector('[data-s4-attr-pool]');
      const input = root.querySelector('[data-s4-note]');
      const status = root.querySelector('[data-s4-sort-status]');
      const factBox = root.querySelector('[data-s4-slots="fact"]');
      const dimBox = root.querySelector('[data-s4-slots="dim"]');
      const colsStep = root.querySelector('[data-s4-cols-step]');
      const showColsBtn = root.querySelector('[data-s4-show-cols]');
      const board = root.querySelector('.s4-sort-board');
      let pick = null;
      let dragChip = null;
      let colsRevealed = false;

      const slotsOf = (kind) => [...root.querySelectorAll('[data-s4-slot="' + kind + '"]')];
      const allSlots = () => [...root.querySelectorAll('[data-s4-slot]')];
      const totalSlots = cfg.fact + cfg.dim;

      const slotHtml = (kind, i) =>
        '<div class="s4-slot" data-s4-slot="' + kind + '" data-i="' + i + '">' +
        '<div class="s4-slot-ent" data-s4-ent-zone></div>' +
        '<div class="s4-slot-cols" data-s4-attr-zone hidden></div></div>';

      const paintSlots = () => {
        factBox.innerHTML = Array.from({ length: cfg.fact }, (_, i) => slotHtml('fact', i)).join('');
        dimBox.innerHTML = Array.from({ length: cfg.dim }, (_, i) => slotHtml('dim', i)).join('');
      };

      const clearMarks = () => root.querySelectorAll('.s4-slot').forEach(s => {
        s.classList.remove('is-ok', 'is-bad', 'is-cols-ok', 'is-cols-bad');
      });

      const entitiesReady = () =>
        allSlots().filter(s => s.querySelector('[data-s4-ent-zone] .s4-chip:not(.is-attr)')).length === totalSlots;

      const syncColZone = (slot) => {
        const zone = slot.querySelector('[data-s4-attr-zone]');
        const hasEnt = slot.querySelector('[data-s4-ent-zone] .s4-chip:not(.is-attr)');
        if (zone) zone.hidden = !colsRevealed || !hasEnt;
      };

      const syncAllColZones = () => allSlots().forEach(syncColZone);

      const updateShowColsBtn = () => {
        if (!showColsBtn) return;
        showColsBtn.disabled = !entitiesReady() || colsRevealed;
        showColsBtn.hidden = colsRevealed;
      };

      const returnAttrsToPool = (slot) => {
        const zone = slot.querySelector('[data-s4-attr-zone]');
        if (!zone || !attrPool) return;
        [...zone.querySelectorAll('.s4-chip.is-attr')].forEach(c => attrPool.appendChild(c));
      };

      const activeChip = () => dragChip || pick;

      const placeEntity = (entZone) => {
        pick = activeChip();
        if (!pick || pick.classList.contains('is-attr')) return;
        const slot = entZone.closest('[data-s4-slot]');
        const sitting = entZone.querySelector('.s4-chip:not(.is-attr)');
        const fromSlot = pick.closest('[data-s4-slot]');
        if (fromSlot && fromSlot !== slot) returnAttrsToPool(fromSlot);
        if (sitting && sitting !== pick) returnAttrsToPool(slot);
        entZone.appendChild(pick);
        if (sitting && sitting !== pick) {
          pool.appendChild(sitting);
        }
        pick.classList.remove('is-pick');
        pick = null;
        syncColZone(slot);
        updateShowColsBtn();
        clearMarks();
        if (status) status.hidden = true;
      };

      const placeAttr = (attrZone) => {
        if (!colsRevealed) return;
        pick = activeChip();
        if (!pick || !pick.classList.contains('is-attr')) return;
        const slot = attrZone.closest('[data-s4-slot]');
        if (!slot.querySelector('[data-s4-ent-zone] .s4-chip:not(.is-attr)')) return;
        attrZone.appendChild(pick);
        pick.classList.remove('is-pick');
        pick = null;
        clearMarks();
        if (status) status.hidden = true;
      };

      const dropTargets = () => {
        const list = [];
        root.querySelectorAll('[data-s4-attr-zone]').forEach(el => {
          if (!el.hidden) list.push({ el, kind: 'attr' });
        });
        root.querySelectorAll('[data-s4-slot]').forEach(el => {
          list.push({ el, kind: 'slot' });
        });
        if (pool) list.push({ el: pool, kind: 'entPool' });
        if (colsRevealed && attrPool) list.push({ el: attrPool, kind: 'attrPool' });
        return list;
      };

      const zoneAtPoint = (x, y) => {
        let best = null;
        let bestArea = Infinity;
        dropTargets().forEach(({ el, kind }) => {
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) return;
          if (x < r.left || x > r.right || y < r.top || y > r.bottom) return;
          const area = r.width * r.height;
          if (area < bestArea) {
            bestArea = area;
            best = { el, kind };
          }
        });
        return best;
      };

      const highlightAt = (x, y) => {
        root.querySelectorAll('.is-over').forEach(el => el.classList.remove('is-over'));
        const hit = zoneAtPoint(x, y);
        if (hit) hit.el.classList.add('is-over');
      };

      const returnEntityToPool = (chip) => {
        const fromSlot = chip.closest('[data-s4-slot]');
        pool.appendChild(chip);
        if (fromSlot) {
          returnAttrsToPool(fromSlot);
          syncColZone(fromSlot);
        }
        chip.classList.remove('is-pick', 'is-src');
        pick = null;
        updateShowColsBtn();
        clearMarks();
      };

      const dropChipAt = (x, y, chip) => {
        pick = chip;
        const hit = zoneAtPoint(x, y);
        chip.classList.remove('is-src');
        if (!hit) {
          chip.classList.remove('is-pick');
          pick = null;
          return;
        }
        if ((hit.kind === 'slot' || hit.kind === 'ent') && !chip.classList.contains('is-attr')) {
          const zone = hit.kind === 'slot' ? hit.el.querySelector('[data-s4-ent-zone]') : hit.el;
          if (zone) placeEntity(zone);
          else { chip.classList.remove('is-pick'); pick = null; }
        } else if (hit.kind === 'attr' && chip.classList.contains('is-attr')) placeAttr(hit.el);
        else if (hit.kind === 'attr' && !chip.classList.contains('is-attr')) {
          const zone = hit.el.closest('[data-s4-slot]')?.querySelector('[data-s4-ent-zone]');
          if (zone) placeEntity(zone);
          else { chip.classList.remove('is-pick'); pick = null; }
        } else if (hit.kind === 'entPool' && !chip.classList.contains('is-attr')) returnEntityToPool(chip);
        else if (hit.kind === 'attrPool' && chip.classList.contains('is-attr')) {
          attrPool.appendChild(chip);
          chip.classList.remove('is-pick');
          pick = null;
          clearMarks();
        } else {
          chip.classList.remove('is-pick');
          pick = null;
        }
      };

      const bindChip = (b) => {
        b.addEventListener('pointerdown', (ev) => {
          if (ev.button !== 0) return;
          ev.preventDefault();
          ev.stopPropagation();
          let moved = false;
          let ghost = null;
          const sx = ev.clientX;
          const sy = ev.clientY;
          const origin = b.getBoundingClientRect();
          const ox = ev.clientX - origin.left;
          const oy = ev.clientY - origin.top;

          const onMove = (e) => {
            if (Math.hypot(e.clientX - sx, e.clientY - sy) < 4) return;
            if (!moved) {
              moved = true;
              ghost = b.cloneNode(true);
              ghost.className = b.className + ' s4-sort-ghost';
              ghost.style.width = origin.width + 'px';
              ghost.style.left = origin.left + 'px';
              ghost.style.top = origin.top + 'px';
              document.body.appendChild(ghost);
              b.classList.add('is-src');
            }
            ghost.style.left = (e.clientX - ox) + 'px';
            ghost.style.top = (e.clientY - oy) + 'px';
            pick = b;
            highlightAt(e.clientX, e.clientY);
          };

          const onUp = (e) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            if (ghost) ghost.remove();
            root.querySelectorAll('.is-over').forEach(el => el.classList.remove('is-over'));
            if (moved) dropChipAt(e.clientX, e.clientY, b);
            else {
              b.classList.remove('is-src');
              root.querySelectorAll('.s4-chip.is-pick').forEach(el => el.classList.remove('is-pick'));
              pick = pick === b ? null : b;
              if (pick) b.classList.add('is-pick');
            }
          };

          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
          window.addEventListener('pointercancel', onUp);
        });
        b.addEventListener('keydown', (ev) => {
          if (ev.key !== 'Enter' && ev.key !== ' ') return;
          ev.preventDefault();
          root.querySelectorAll('.s4-chip.is-pick').forEach(el => el.classList.remove('is-pick'));
          pick = pick === b ? null : b;
          if (pick) b.classList.add('is-pick');
        });
      };

      const chipEnt = (label) => {
        const b = document.createElement('span');
        b.className = 's4-chip';
        b.setAttribute('role', 'button');
        b.tabIndex = 0;
        b.textContent = label;
        bindChip(b);
        return b;
      };

      const chipCol = (def) => {
        const b = document.createElement('span');
        b.className = 's4-chip is-attr';
        b.setAttribute('role', 'button');
        b.tabIndex = 0;
        b.dataset.s4ColId = def.id;
        b.dataset.s4ColKey = def.key || '';
        const name = document.createElement('span');
        name.className = 's4-col-name';
        name.textContent = def.label;
        b.appendChild(name);
        if (def.key) {
          const k = document.createElement('span');
          k.className = 's4-col-key is-' + def.key;
          k.textContent = def.key.toUpperCase();
          b.appendChild(k);
        }
        bindChip(b);
        return b;
      };

      const fillAttrPool = () => {
        if (!attrPool) return;
        attrPool.innerHTML = '';
        const all = Object.values(cfg.columns).flat();
        shuffle(all).forEach(def => attrPool.appendChild(chipCol(def)));
      };

      const revealCols = () => {
        if (colsRevealed) return;
        colsRevealed = true;
        if (colsStep) colsStep.hidden = false;
        fillAttrPool();
        syncAllColZones();
        updateShowColsBtn();
      };

      const hideCols = () => {
        colsRevealed = false;
        if (colsStep) colsStep.hidden = true;
        if (attrPool) attrPool.innerHTML = '';
        allSlots().forEach(slot => {
          const zone = slot.querySelector('[data-s4-attr-zone]');
          if (zone) {
            zone.innerHTML = '';
            zone.hidden = true;
          }
        });
        updateShowColsBtn();
      };

      const addNote = () => {
        const label = (input.value || '').trim();
        if (!label) return;
        pool.appendChild(chipEnt(label));
        input.value = '';
        input.focus();
      };

      root.querySelector('[data-s4-add]').addEventListener('click', addNote);
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          addNote();
        }
      });

      if (board) {
        board.addEventListener('click', (ev) => {
          if (ev.target.closest('.s4-chip')) return;
          const entZone = ev.target.closest('[data-s4-ent-zone]');
          const attrZone = ev.target.closest('[data-s4-attr-zone]');
          if (entZone && activeChip() && !activeChip().classList.contains('is-attr')) placeEntity(entZone);
          else if (attrZone && activeChip() && activeChip().classList.contains('is-attr')) placeAttr(attrZone);
        });
      }

      showColsBtn?.addEventListener('click', () => revealCols());

      const slotEntityKey = (slot) => {
        const label = slot.querySelector('[data-s4-ent-zone] .s4-chip:not(.is-attr)')?.textContent || '';
        return label ? entityCanon(label.trim()) : '';
      };

      const slotColIds = (slot) =>
        [...slot.querySelectorAll('[data-s4-attr-zone] .s4-chip.is-attr')].map(c => c.dataset.s4ColId);

      const colsOkFor = (entityKey, gotIds) => {
        const want = (cfg.columns[entityKey] || []).map(c => c.id);
        return sameSet(gotIds, want);
      };

      const grade = () => {
        const factLabels = slotsOf('fact').map(s => s.querySelector('[data-s4-ent-zone] .s4-chip:not(.is-attr)')?.textContent || '');
        const dimLabels = slotsOf('dim').map(s => s.querySelector('[data-s4-ent-zone] .s4-chip:not(.is-attr)')?.textContent || '');
        const factOk = sameSet(factLabels.filter(Boolean), cfg.answers.fact, entityCanon) && factLabels.every(Boolean);
        const dimOk = sameSet(dimLabels.filter(Boolean), cfg.answers.dim, entityCanon) && dimLabels.every(Boolean);

        let colsOk = true;
        if (colsRevealed) {
          allSlots().forEach(slot => {
            const key = slotEntityKey(slot);
            if (!key) return;
            const ok = colsOkFor(key, slotColIds(slot));
            slot.classList.toggle('is-cols-ok', ok);
            slot.classList.toggle('is-cols-bad', !ok);
            if (!ok) colsOk = false;
          });
        } else {
          allSlots().forEach(slot => slot.classList.remove('is-cols-ok', 'is-cols-bad'));
        }

        slotsOf('fact').forEach(s => {
          s.classList.toggle('is-ok', factOk);
          s.classList.toggle('is-bad', !factOk);
        });
        slotsOf('dim').forEach(s => {
          s.classList.toggle('is-ok', dimOk);
          s.classList.toggle('is-bad', !dimOk);
        });

        if (!status) return;
        status.hidden = false;
        if (factOk && dimOk && colsRevealed && colsOk) status.textContent = cfg.ok;
        else if (!factOk || !dimOk) {
          status.textContent = 'Tabele: verifică Fact (eveniment) vs Dim (context). Completează toate casetele.';
        } else if (!colsRevealed) {
          status.textContent = 'Tabele ok. Apasă Arată coloanele, apoi le pui pe fiecare tabel.';
        } else {
          status.textContent = 'Entitățile sunt ok. Mai verifică coloanele: PK pe dim, FK în fact, restul atribute/măsuri.';
        }
      };

      const solveEntity = (kind, names, keys) => {
        names.forEach((name, i) => {
          const slot = slotsOf(kind)[i];
          const entZone = slot.querySelector('[data-s4-ent-zone]');
          entZone.appendChild(chipEnt(name));
          const entityKey = keys[i];
          const colZone = slot.querySelector('[data-s4-attr-zone]');
          colZone.hidden = false;
          (cfg.columns[entityKey] || []).forEach(def => {
            const el = attrPool.querySelector('[data-s4-col-id="' + def.id + '"]');
            if (el) colZone.appendChild(el);
            else colZone.appendChild(chipCol(def));
          });
        });
      };

      root.querySelector('[data-s4-sort-check]').addEventListener('click', grade);
      root.querySelector('[data-s4-sort-solve]').addEventListener('click', () => {
        pool.innerHTML = '';
        hideCols();
        paintSlots();
        revealCols();
        solveEntity('fact', cfg.names.fact, cfg.answers.fact);
        solveEntity('dim', cfg.names.dim, cfg.answers.dim);
        updateShowColsBtn();
        grade();
      });
      root.querySelector('[data-s4-sort-reset]').addEventListener('click', () => {
        input.value = '';
        pool.innerHTML = '';
        hideCols();
        paintSlots();
        pick = null;
        dragChip = null;
        clearMarks();
        updateShowColsBtn();
        if (status) status.hidden = true;
      });

      paintSlots();
      hideCols();
      updateShowColsBtn();
    });
  }

  function boot() {
    initS4Flat();
    initS4Builder();
    initS4Morph();
    initS4Normalize();
    initS4Filter();
    initS4Sort();
    initS4StarLines();
    initS4Workflow();
  }

  if (window.SessionGate && window.SessionGate.whenOpen) window.SessionGate.whenOpen.then(boot);
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
