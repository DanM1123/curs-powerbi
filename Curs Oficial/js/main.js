/* ==========================================================================
   Curs Oficial · Main JS
   Theme, slide deck, live polls (Firebase or local), Would-you-rather charts
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE = {
    THEME: 'curs-oficial-theme',
    POLLS: 'curs-oficial-polls',
  };

  const POLL_ROOT = document.body.getAttribute('data-poll-root') || 'curs-oficial/s01/polls';

  const getTheme = () => localStorage.getItem(STORAGE.THEME) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const setTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem(STORAGE.THEME, t); };
  setTheme(getTheme());

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
    });
    const start = () => {
      const ready = window.LIVE_POLLS_READY;
      if (ready && typeof ready.then === 'function') ready.then(() => initStudent());
      else initStudent();
    };
    if (window.SessionGate && window.SessionGate.whenOpen) {
      window.SessionGate.whenOpen.then(start);
    } else {
      start();
    }
  });

  function initStudent() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) {
      initPolls();
      return;
    }

    let current = 0;
    const total = slides.length;
    const counter = document.querySelector('[data-slide-counter]');
    const progressFill = document.querySelector('[data-slide-progress]');
    const dotsBar = document.querySelector('[data-slide-dots]');
    const prevBtn = document.querySelector('[data-slide-prev]');
    const nextBtn = document.querySelector('[data-slide-next]');

    if (dotsBar) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slide-dot';
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => go(i));
        dotsBar.appendChild(dot);
      });
    }

    const render = () => {
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      if (counter) counter.textContent = `${current + 1} / ${total}`;
      if (progressFill) progressFill.style.width = (((current + 1) / total) * 100) + '%';
      if (dotsBar) dotsBar.querySelectorAll('.slide-dot').forEach((d, i) => d.classList.toggle('active', i === current));
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === total - 1;
      const deck = document.querySelector('.slide-deck');
      if (deck && deck.scrollHeight > deck.clientHeight) deck.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const go = (i) => { current = Math.max(0, Math.min(total - 1, i)); render(); };

    if (prevBtn) prevBtn.addEventListener('click', () => go(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(current + 1));

    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });

    render();
    initPolls();
    initJobsMap();
    initFlowMap();
    initPbiTour();
    initStepper();
    initRealTour();
    initContrast();
    initCases();
    initReveal();
  }

  function initCases() {
    const CASES = {
      vanzari: {
        kicker: 'Întrebarea de luni dimineață',
        q: '„De ce au scăzut vânzările luna trecută?”',
        off: 'Datele stau în patru fișiere separate: magazine, marketing, contabilitate și un <code>raport_final_v3.xlsx</code>. Consolidezi manual. O formulă trage din rândul greșit. Rezultatul ajunge ca o captură pe chat — de obicei joi, nu luni.',
        onWork: 'Un singur raport. În ședință filtrezi luna și regiunea. Tot ecranul se actualizează. Nu mai cauți în fișiere.',
        onAnswer: 'Scăderea nu e peste tot. <strong>Nordul, categoria Băuturi, −18% față de februarie.</strong> Restul țării e aproape pe loc. Asta e gaura — nu „vânzările, în general”.',
        kpi: ['Vânzări mar', '176.4k', '−12%', 'Nord · Băuturi', '−18%', 'față de feb']
      },
      retail: {
        kicker: 'Retail',
        q: '„Care produse s-au vândut cel mai prost în Vest, luna trecută?”',
        off: 'Cineva exportă vânzările, filtrează manual pe Vest, sortează de la mic la mare, copiază lista într-un mail. Durează o după-amiază. Dacă întreabă și de Est, o iei de la capăt.',
        onWork: 'Raport cu filtru pe regiune și pe lună. Sortezi graficul de la mic la mare. Lista se actualizează pe loc.',
        onAnswer: 'În Vest, <strong>Cafea 250g a scăzut de la 80 la 12 bucăți</strong>. Următoarele două produse slabe sunt Ceai verde și Biscuiți. Asta e lista pe care o pui pe masă.',
        kpi: ['Vest · mar', '12 buc', 'Cafea 250g', 'Față de feb', '−85%', '80 → 12']
      },
      hr: {
        kicker: 'Resurse umane',
        q: '„În ce echipă pleacă cei mai mulți oameni?”',
        off: 'HR scoate un export, numără plecările în Excel, face un tabel, îl copiază în PowerPoint. Cifra e gata vineri. Până atunci, ședința rămâne pe impresii.',
        onWork: 'Un grafic pe echipe și un număr mare cu totalul. Filtrezi luna. Click pe o bară și vezi detaliul.',
        onAnswer: '<strong>Echipa Vânzări: 4 plecări din 18 oameni</strong> — peste restul. Support are 1. Nu e „fluctuație generală”, e o echipă.',
        kpi: ['Plecări mar', '7', 'toată firma', 'Vânzări', '4 din 18', 'cea mai mare']
      },
      fin: {
        kicker: 'Financiar',
        q: '„Unde am cheltuit mai mult decât era planificat?”',
        off: 'Două fișiere: bugetul și cheltuielile. Le aliniezi pe departament, scazi, cauți minusurile. O greșeală de aliniere și apare o alarmă falsă.',
        onWork: 'Un tabel cu buget, realizat și diferența. Rămân vizibile doar rândurile peste plan. Filtrezi luna.',
        onAnswer: '<strong>Marketing +23% peste buget</strong> (12.400 lei). IT e sub plan. Nu tai din tot — tai de unde e depășirea.',
        kpi: ['Depășiri', '12.4k', 'o linie', 'Marketing', '+23%', 'vs plan']
      },
      mkt: {
        kicker: 'Marketing',
        q: '„Pe ce canal de publicitate cheltuim fără rezultat?”',
        off: 'Cifrele sunt în trei locuri: Facebook, Google, Excel-ul intern. Le lipești, calculezi costul pe client, trimiți un tabel. Până luni, numerele s-au schimbat.',
        onWork: 'Un ecran: canal, bani cheltuiți, clienți veniți. Filtrezi ultimele 30 de zile.',
        onAnswer: '<strong>Facebook Ads: 12.000 lei, 3 clienți noi</strong> — 4.000 lei / client. Google a adus 18 clienți cu 6.000 lei. Banii de tăiat sunt pe Facebook.',
        kpi: ['Facebook', '12k', '3 clienți', 'Google', '6k', '18 clienți']
      }
    };

    const root = document.querySelector('[data-cases]');
    if (!root) return;
    const fill = (id) => {
      const c = CASES[id];
      if (!c) return;
      root.querySelectorAll('[data-case]').forEach(t => t.classList.toggle('active', t.dataset.case === id));
      const set = (sel, html) => { const el = root.querySelector(sel); if (el) el.innerHTML = html; };
      set('[data-case-kicker]', c.kicker);
      set('[data-case-q]', c.q);
      set('[data-case-off]', c.off);
      set('[data-case-on-work]', c.onWork);
      set('[data-case-on-answer]', c.onAnswer);
      const map = [
        ['[data-case-kpi-l]', c.kpi[0]],
        ['[data-case-kpi-v]', c.kpi[1]],
        ['[data-case-kpi-s]', c.kpi[2]],
        ['[data-case-kpi2-l]', c.kpi[3]],
        ['[data-case-kpi2-v]', c.kpi[4]],
        ['[data-case-kpi2-s]', c.kpi[5]]
      ];
      map.forEach(([sel, val]) => { const el = root.querySelector(sel); if (el) el.textContent = val; });
    };
    root.querySelectorAll('[data-case]').forEach(t => t.addEventListener('click', () => fill(t.dataset.case)));
  }

  function updateRevealScore(root) {
    const scoreEl = root.querySelector('[data-reveal-score]');
    if (!scoreEl || scoreEl.hidden) return;
    let ok = 0;
    let bad = 0;
    root.querySelectorAll('.s2-qpoll .poll-opt').forEach(opt => {
      const count = parseInt(opt.getAttribute('data-votes') || opt.querySelector('.opt-pct')?.textContent || '0', 10) || 0;
      if (opt.hasAttribute('data-correct')) ok += count;
      else bad += count;
    });
    scoreEl.innerHTML =
      `<span class="sc ok">Corect: ${ok} ${ok === 1 ? 'vot' : 'voturi'}</span>` +
      `<span class="sc bad">Greșit: ${bad} ${bad === 1 ? 'vot' : 'voturi'}</span>`;
  }

  function initReveal() {
    document.querySelectorAll('[data-reveal]').forEach(root => {
      const btn = root.querySelector('[data-reveal-btn]');
      const ans = root.querySelector('[data-reveal-ans]');
      const scoreEl = root.querySelector('[data-reveal-score]');
      if (!btn) return;
      btn.addEventListener('click', () => {
        root.querySelectorAll('.s2-qpoll').forEach(poll => {
          poll.classList.add('is-revealed');
          poll.querySelectorAll('.poll-opt').forEach(opt => {
            const correct = opt.hasAttribute('data-correct');
            opt.classList.toggle('is-correct', correct);
            opt.classList.toggle('is-wrong', !correct);
          });
        });
        if (ans) ans.hidden = false;
        if (scoreEl) {
          scoreEl.hidden = false;
          updateRevealScore(root);
        }
        btn.disabled = true;
        btn.textContent = 'Răspunsurile sunt afișate';
      });
    });
  }

  function initContrast() {
    document.querySelectorAll('[data-contrast]').forEach(root => {
      const btns = root.querySelectorAll('[data-contrast-btn]');
      const panels = root.querySelectorAll('[data-contrast-panel]');
      const show = (id) => {
        btns.forEach(b => {
          const on = b.dataset.contrastBtn === id;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        panels.forEach(p => { p.hidden = p.dataset.contrastPanel !== id; });
      };
      btns.forEach(b => b.addEventListener('click', () => show(b.dataset.contrastBtn)));
    });
  }

  function initDepts() {
    const DEPTS = {
      retail: {
        who: 'Retail',
        q: '„Care produse s-au vândut cel mai prost în Vest, luna trecută?”',
        off: {
          title: 'Fără BI',
          text: 'Cineva exportă vânzările, le pune într-un Excel, filtrează manual pe Vest, sortează de la mic la mare, copiază primele 10 produse într-un mail. Durează o după-amiază. Dacă șeful întreabă și de Est, o iei de la capăt.'
        },
        on: {
          title: 'Cu BI',
          text: 'Un raport cu filtru pe regiune și pe lună. Sortezi graficul de la mic la mare și vezi imediat lista. Click pe Vest sau pe Martie — lista se actualizează pe loc, în ședință.'
        }
      },
      hr: {
        who: 'Resurse umane',
        q: '„În ce echipă pleacă cei mai mulți oameni?”',
        off: {
          title: 'Fără BI',
          text: 'HR scoate un export, numără plecările în Excel, face un tabel pivot, îl copiază în PowerPoint. Cifra e gata vineri. Până atunci, discuția din ședință rămâne pe impresii.'
        },
        on: {
          title: 'Cu BI',
          text: 'Un grafic pe echipe și un număr mare cu totalul plecărilor. Filtrezi luna. Vezi imediat că una dintre echipe e deasupra celorlalte — și poți coborî la nume, dacă ai dreptul.'
        }
      },
      fin: {
        who: 'Financiar',
        q: '„Unde am cheltuit mai mult decât era planificat?”',
        off: {
          title: 'Fără BI',
          text: 'Două fișiere: bugetul și cheltuielile. Le aliniezi pe departament, scazi, cauți diferențele negative. O greșeală de aliniere și apare o alarmă falsă. Raportul e gata după ce cineva a verificat de mână.'
        },
        on: {
          title: 'Cu BI',
          text: 'Un tabel cu buget, realizat și diferența. Rămân vizibile doar rândurile peste plan. Un număr mare arată suma depășirilor. În ședință filtrezi luna și discuți excepțiile, nu tot planul.'
        }
      },
      mkt: {
        who: 'Marketing',
        q: '„Pe ce canal de publicitate cheltuim fără rezultat?”',
        off: {
          title: 'Fără BI',
          text: 'Cifrele sunt în trei locuri: Facebook, Google, Excel-ul intern. Le lipești, calculezi costul pe client, trimiți un tabel. Până luni, numerele s-au schimbat deja.'
        },
        on: {
          title: 'Cu BI',
          text: 'Un ecran cu canalele, banii cheltuiți și câți clienți au venit. Vezi imediat canalul scump și slab. Filtrezi ultimele 30 de zile. Decizia de tăiat sau mutat bugetul se ia pe loc.'
        }
      }
    };

    document.querySelectorAll('[data-depts]').forEach(root => {
      const tabs = root.querySelectorAll('[data-dept]');
      const panel = root.querySelector('[data-dept-panel]');
      if (!panel) return;

      const showSide = (side) => {
        panel.querySelectorAll('[data-dept-side]').forEach(b => {
          b.classList.toggle('active', b.dataset.deptSide === side);
        });
        panel.querySelectorAll('[data-dept-side-panel]').forEach(p => {
          p.hidden = p.dataset.deptSidePanel !== side;
        });
      };

      const render = (id) => {
        const d = DEPTS[id];
        if (!d) return;
        tabs.forEach(t => t.classList.toggle('active', t.dataset.dept === id));
        panel.hidden = false;
        panel.innerHTML = `
          <p class="who">${d.who}</p>
          <p class="q">${d.q}</p>
          <div class="s2-toggle-bar">
            <button type="button" class="s2-toggle-btn is-off" data-dept-side="off">Fără BI</button>
            <button type="button" class="s2-toggle-btn is-on" data-dept-side="on">Cu BI</button>
          </div>
          <div class="s2-dept-side is-off" data-dept-side-panel="off" hidden>
            <h3>${d.off.title}</h3>
            <p>${d.off.text}</p>
          </div>
          <div class="s2-dept-side is-on" data-dept-side-panel="on" hidden>
            <h3>${d.on.title}</h3>
            <p>${d.on.text}</p>
          </div>`;
        panel.querySelectorAll('[data-dept-side]').forEach(b => {
          b.addEventListener('click', () => showSide(b.dataset.deptSide));
        });
      };

      tabs.forEach(t => t.addEventListener('click', () => render(t.dataset.dept)));
    });
  }

  function initStepper() {
    document.querySelectorAll('[data-stepper]').forEach(root => {
      const steps = root.querySelectorAll('[data-step]');
      const total = steps.length;
      if (!total) return;
      const prevBtn = root.querySelector('[data-step-prev]');
      const nextBtn = root.querySelector('[data-step-next]');
      const counter = root.querySelector('[data-step-count]');
      let shown = 0;

      const render = () => {
        steps.forEach((s, i) => s.classList.toggle('visible', i < shown));
        if (counter) counter.textContent = `${shown} / ${total}`;
        if (prevBtn) prevBtn.disabled = shown === 0;
        if (!nextBtn) return;
        const done = shown >= total;
        nextBtn.disabled = done;
        nextBtn.textContent = done ? 'Toate etapele' : `Etapa ${shown + 1} →`;
        nextBtn.classList.toggle('primary', !done);
        nextBtn.classList.toggle('done', done);
      };

      if (prevBtn) prevBtn.addEventListener('click', () => { shown = Math.max(0, shown - 1); render(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { shown = Math.min(total, shown + 1); render(); });
      render();
    });
  }

  function initRealTour() {
    const tour = document.querySelector('[data-real-tour]');
    if (!tour) return;

    const VIEW_DEFAULTS = {
      report: {
        title: 'Report View — pânza raportului',
        text: 'Aici construiești raportul: tragi vizuale (card KPI, grafic, slicer) pe canvas și le configurezi din panourile din dreapta. <strong>Aici stăm cea mai mare parte din timp.</strong>',
        hint: 'Apasă punctele galbene pentru fiecare zonă a interfeței.',
        badge: ''
      },
      table: {
        title: 'Table View — datele brute',
        text: 'Vezi datele exact cum au intrat după import: rânduri, coloane, sortare, filtrare — ca într-un sheet Excel. <strong>Aici verifici</strong> dacă importul e corect.',
        hint: 'Exemplu: verifici dacă „Sumă” e număr, nu text.',
        badge: 'is-table'
      },
      model: {
        title: 'Model View — relațiile dintre tabele',
        text: 'Tabelele apar ca dreptunghiuri, iar liniile dintre ele sunt relațiile. Le legi prin drag &amp; drop, tragând o coloană peste alta.',
        hint: 'Exemplu: legi Vânzări[ID_Client] cu Clienți[ID_Client].',
        badge: 'is-model'
      }
    };

    const HOTSPOTS = {
      r1: { view: 'report', title: 'Ribbon — bara de comenzi', text: 'Bara de sus, cu tab-uri ca la Word sau Excel: <strong>File · Home · Insert · Modeling · View</strong>. De aici pornește tot: <strong>Get data</strong> (aduci sursele), <strong>Transform data</strong> (deschide Power Query), <strong>Refresh</strong> (reîncarci datele).', hint: 'Exemplu: Home → Get data → Excel → Vanzari_2024.xlsx.' },
      r2: { view: 'report', title: 'Canvas — suprafața raportului', text: 'Zona albă din centru. Aici aranjezi KPI-uri, grafice, slicere și tabele. Seamănă cu un slide de PowerPoint, doar că fiecare element e conectat la date și reacționează la filtre.', hint: 'Exemplu: click pe o bară din grafic → tot raportul se filtrează.' },
      r3: { view: 'report', title: 'Visualizations — tipurile de vizuale', text: 'Galeria cu tipurile disponibile: <strong>bar, line, card, donut, hartă, matrix, slicer, table</strong>. Alegi tipul, apoi mai jos configurezi ce intră în el (Values, Axis, Legend).', hint: 'Exemplu: alegi Card, tragi „Sumă” în Values → apare totalul.' },
      r4: { view: 'report', title: 'Data — tabelele și coloanele', text: 'Lista datelor importate: fiecare tabel cu coloanele lui (Categorie, Regiune, Data, Sumă). Le tragi direct pe canvas sau în câmpurile vizualului.', hint: 'Exemplu: tragi „Regiune” pe axă și „Sumă” în valori → grafic pe regiuni.' },
      r5: { view: 'report', title: 'Pages — paginile raportului', text: 'Un raport poate avea mai multe pagini, exact ca un workbook Excel cu sheet-uri. Fiecare pagină = o perspectivă (vânzări, profit, detaliu client).', hint: 'Tab-urile sunt jos, ca în Excel.' },
      t1: { view: 'table', title: 'Table tools — unelte pe tabel', text: 'Când selectezi un tabel apare acest tab. De aici creezi <strong>măsuri</strong> (New measure), <strong>coloane calculate</strong> (New column) și gestionezi relațiile.', hint: 'Măsurile în DAX le lucrăm în sesiunile următoare.' },
      t2: { view: 'table', title: 'Grila cu date', text: 'Datele importate, rând cu rând. Aici <strong>verifici</strong>, nu modifici: dacă vezi valori goale, tipuri greșite sau duplicate, te întorci în Power Query.', hint: 'Exemplu: vezi „null” pe Regiune → problemă de curățat.' },
      t3: { view: 'table', title: 'Lista tabelelor și tipurile', text: 'În dreapta ai tabelele și, pentru fiecare, coloanele cu tipul lor de date (text, număr, dată). Iconița Σ marchează coloanele numerice care se pot agrega.', hint: 'Dacă „Sumă” nu are Σ, tipul e greșit.' },
      m1: { view: 'model', title: 'Canvas-ul modelului', text: 'Fiecare dreptunghi e un tabel, fiecare linie e o relație. Pe linii vezi <strong>cardinalitatea</strong> (1 la mai mulți) și direcția în care se propagă filtrul.', hint: 'Un model curat = rapoarte rapide și formule simple.' },
      m2: { view: 'model', title: 'Properties — proprietăți', text: 'Selectezi un tabel, o coloană sau o relație și configurezi aici: <strong>formatarea</strong> (lei, %, dată), categoria datelor (geografie, URL), descrieri, ascundere.', hint: 'Exemplu: setezi formatul monetar pentru coloana Sumă.' },
      m3: { view: 'model', title: 'Structura modelului', text: 'Comuți între lista clasică de tabele și panoul cu carduri. Util când ai multe tabele și vrei să le organizezi sau să ascunzi cele tehnice.', hint: 'Devine important de la ~10 tabele în sus.' }
    };

    const ASPECTS = { report: '1919 / 973', table: '1919 / 982', model: '1919 / 742' };

    const stage = tour.querySelector('.s2-real-stage');
    const badge = tour.querySelector('[data-rti-badge]');
    const titleEl = tour.querySelector('[data-rti-title]');
    const textEl = tour.querySelector('[data-rti-text]');
    const hintEl = tour.querySelector('[data-rti-hint]');
    const imgs = tour.querySelectorAll('.s2-real-img');
    const vsBtns = tour.querySelectorAll('.s2-vs-btn');
    const spots = tour.querySelectorAll('.s2-rh');
    const rows = tour.querySelectorAll('.s2-rti-row');

    const paint = (view, data, suffix) => {
      if (badge) {
        badge.textContent = view.toUpperCase() + ' VIEW' + (suffix || '');
        badge.classList.remove('is-table', 'is-model');
        if (VIEW_DEFAULTS[view].badge) badge.classList.add(VIEW_DEFAULTS[view].badge);
      }
      if (titleEl) titleEl.textContent = data.title;
      if (textEl) textEl.innerHTML = data.text;
      if (hintEl) hintEl.innerHTML = data.hint;
    };

    const setView = (view) => {
      if (!VIEW_DEFAULTS[view]) return;
      if (stage) {
        stage.style.aspectRatio = ASPECTS[view];
        stage.dataset.activeView = view;
      }
      imgs.forEach(i => i.classList.toggle('active', i.dataset.viewImg === view));
      vsBtns.forEach(b => b.classList.toggle('active', b.dataset.view === view));
      spots.forEach(s => {
        s.classList.remove('active');
        s.classList.toggle('show', s.dataset.view === view);
      });
      rows.forEach(r => r.classList.toggle('active', r.dataset.viewQuick === view));
      paint(view, VIEW_DEFAULTS[view], '');
    };

    const showSpot = (id) => {
      const data = HOTSPOTS[id];
      if (!data) return;
      spots.forEach(s => s.classList.toggle('active', s.dataset.id === id));
      paint(data.view, data, ' · ZONA ' + id.slice(1));
    };

    vsBtns.forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    rows.forEach(r => r.addEventListener('click', () => setView(r.dataset.viewQuick)));
    spots.forEach(s => s.addEventListener('click', () => showSpot(s.dataset.id)));
    setView('report');
  }

  const PALETTE = ['#059669', '#14B8A6', '#84CC16', '#06B6D4', '#F59E0B', '#8B5CF6'];

  function initPolls() {
    const live = window.LIVE_POLLS || null;
    try {
      Object.keys(localStorage).forEach(k => {
        if (k === STORAGE.POLLS || k.startsWith(STORAGE.POLLS + '-mine-')) localStorage.removeItem(k);
      });
    } catch {}

    document.querySelectorAll('.poll').forEach(poll => {
      const id = poll.getAttribute('data-poll-id');
      if (!id) return;

      const opts = poll.querySelectorAll('.poll-opt');
      const seed = poll.getAttribute('data-seed') || '';
      const seedArr = seed.split(',').map(n => parseInt(n, 10));
      const chartType = poll.getAttribute('data-chart') || '';
      const plainBars = poll.hasAttribute('data-plain-bars');
      let myVote = null;
      const votes = {};
      opts.forEach((_, i) => { votes[i] = seedArr[i] || 0; });

      const labels = () => Array.from(opts).map(o => {
        const t = o.querySelector('.opt-text');
        return t ? t.textContent.trim() : o.textContent.trim();
      });
      const letters = () => Array.from(opts).map((o, i) => {
        const el = o.querySelector('.opt-letter');
        return el ? el.textContent.trim() : String.fromCharCode(65 + i);
      });
      const colors = () => Array.from(opts).map((o, i) => o.getAttribute('data-color') || PALETTE[i % PALETTE.length]);

      const persist = () => {};

      const renderPoll = () => {
        const total = Object.values(votes).reduce((a, b) => a + b, 0);
        const showCounts = poll.classList.contains('s2-qpoll');
        opts.forEach((opt, i) => {
          const c = votes[i] || 0;
          const pct = total ? Math.round((c / total) * 100) : 0;
          let bar = opt.querySelector('.opt-bar');
          if (!bar) { bar = document.createElement('div'); bar.className = 'opt-bar'; opt.prepend(bar); }
          let pctEl = opt.querySelector('.opt-pct');
          if (!pctEl) { pctEl = document.createElement('span'); pctEl.className = 'opt-pct'; opt.appendChild(pctEl); }
          bar.style.width = (showCounts ? (total ? pct : 0) : pct) + '%';
          if (showCounts) {
            pctEl.textContent = String(c);
            pctEl.setAttribute('title', c === 1 ? '1 vot' : c + ' voturi');
            opt.setAttribute('data-votes', String(c));
          } else {
            pctEl.textContent = (plainBars || !total) ? '' : (pct + '%');
          }
          opt.classList.toggle('selected', myVote === i);
        });
        poll.classList.toggle('voted', myVote !== null || (showCounts && total > 0));
        if (showCounts) {
          const revealRoot = poll.closest('[data-reveal]');
          if (revealRoot) updateRevealScore(revealRoot);
        }
        if (chartType) renderWyrChart(poll, chartType, labels(), colors(), votes, total, letters());
      };

      const cast = (i) => {
        if (myVote !== null) return;
        myVote = i;
        votes[i] = (votes[i] || 0) + 1;
        persist();
        renderPoll();
        if (live && live.vote) {
          live.vote(`${POLL_ROOT}/${id}`, i).catch((err) => {
            console.error('[polls] write failed', err);
            showPollsWarn();
          });
        }
      };

      if (live && live.listen) {
        live.listen(`${POLL_ROOT}/${id}`, (data) => {
          opts.forEach((_, i) => {
            const remote = parseInt((data && (data[i] ?? data[String(i)])), 10) || 0;
            votes[i] = (seedArr[i] || 0) + remote;
          });
          persist();
          renderPoll();
        }, (err) => {
          console.error('[polls] read failed', err);
          showPollsWarn();
          renderPoll();
        });
      }

      opts.forEach((opt, i) => opt.addEventListener('click', () => cast(i)));
      renderPoll();
    });
  }

  function showPollsWarn() {
    if (document.querySelector('.polls-live-warn')) return;
    const el = document.createElement('div');
    el.className = 'polls-live-warn';
    el.textContent = 'Voturile nu sunt sincronizate. Reîncarcă pagina în 1 minut.';
    document.body.appendChild(el);
  }

  function renderWyrChart(poll, type, labels, colors, votes, total, letters) {
    const host = poll.querySelector('[data-wyr-chart]') || poll.parentElement?.querySelector('[data-wyr-chart]');
    if (!host) return;
    const vals = labels.map((_, i) => votes[i] || 0);
    const plain = poll.hasAttribute('data-plain-bars');
    if (type === 'pie') host.innerHTML = svgPie(labels, vals, colors, total, false);
    else if (type === 'donut') host.innerHTML = svgPie(labels, vals, colors, total, true);
    else if (type === 'columns') host.innerHTML = svgColumns(labels, vals, colors, total, plain, letters);
    else if (type === 'stacked') host.innerHTML = svgStacked(labels, vals, colors, total);
    else host.innerHTML = htmlBars(labels, vals, colors, total, letters);
  }

  function htmlBars(labels, vals, colors, total, letters) {
    const maxV = Math.max(...vals, 1);
    const rows = vals.map((v, i) => {
      const letter = (letters && letters[i]) || String.fromCharCode(65 + i);
      const w = v ? Math.max(18, (v / maxV) * 100) : 0;
      const fill = w
        ? `<div class="wyr-track-fill" style="width:${w}%;background:${colors[i]}"><span class="wyr-bar-label">${letter}</span></div>`
        : `<span class="wyr-bar-label is-empty">${letter}</span>`;
      return `<div class="wyr-track-row">
        <div class="wyr-track">${fill}</div>
      </div>`;
    }).join('');
    return `<div class="wyr-tracks">${rows}</div>`;
  }

  function svgColumns(labels, vals, colors, total, plain, letters) {
    const n = vals.length, W = 560, padT = 28, padB = 16, padL = 8, padR = 8;
    const H = 260;
    const maxV = Math.max(...vals, 1);
    const slot = (W - padL - padR) / n;
    const barW = Math.min(56, slot * 0.62);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="wyr-svg">`;
    vals.forEach((v, i) => {
      const x = padL + i * slot + (slot - barW) / 2;
      const usable = H - padT - padB;
      const h = v ? Math.max(18, (usable * v) / maxV) : 0;
      const y = H - padB - h;
      const letter = (letters && letters[i]) || String.fromCharCode(65 + i);
      s += `<rect x="${x}" y="${H - padB - usable}" width="${barW}" height="${usable}" rx="8" fill="var(--bg-alt)"/>`;
      if (h) s += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="8" fill="${colors[i]}"/>`;
      const labelY = h ? y + Math.min(22, h / 2 + 5) : H - padB - 12;
      s += `<text x="${x + barW / 2}" y="${labelY}" text-anchor="middle" font-size="13" font-weight="800" fill="${h ? '#fff' : 'var(--text-3)'}">${letter}</text>`;
      if (!plain && total && v) {
        const pct = Math.round((v / total) * 100);
        s += `<text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="${colors[i]}">${pct}%</text>`;
      }
    });
    return s + '</svg>';
  }

  function svgPie(labels, vals, colors, total, donut) {
    const H = 280;
    const cx = 280, cy = 140, r = 108, ir = donut ? 58 : 0;
    const sum = total || 1;
    let offset = -Math.PI / 2;
    let s = `<svg viewBox="0 0 560 ${H}" class="wyr-svg">`;
    const nonZero = vals.filter(v => v > 0).length;
    if (nonZero === 1) {
      const i = vals.findIndex(v => v > 0);
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colors[i]}"/>`;
      if (donut) s += `<circle cx="${cx}" cy="${cy}" r="${ir}" fill="var(--surface)"/>`;
    } else if (total) {
      vals.forEach((v, i) => {
        const angle = (v / sum) * Math.PI * 2;
        if (v > 0 && angle > 0.01) s += pieSlice(cx, cy, r, ir, offset, angle, colors[i]);
        offset += angle;
      });
      if (donut) s += `<circle cx="${cx}" cy="${cy}" r="${ir - 1}" fill="var(--surface)"/>`;
    } else {
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--bg-alt)"/>`;
      if (donut) s += `<circle cx="${cx}" cy="${cy}" r="${ir}" fill="var(--surface)"/>`;
    }
    return s + '</svg>';
  }

  function svgStacked(labels, vals, colors, total) {
    const W = 560, H = 140, barY = 36, barH = 36;
    const sum = total || 1;
    let x = 0;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="wyr-svg">`;
    s += `<rect x="0" y="${barY}" width="${W}" height="${barH}" rx="10" fill="var(--bg-alt)"/>`;
    if (total) {
      vals.forEach((v, i) => {
        const w = (v / sum) * W;
        if (w > 0) s += `<rect x="${x}" y="${barY}" width="${Math.max(w, 2)}" height="${barH}" fill="${colors[i]}"/>`;
        x += w;
      });
    }
    labels.forEach((lbl, i) => {
      const pct = total ? Math.round((vals[i] / total) * 100) : 0;
      const lx = 8 + (i % 3) * 184;
      const ly = 100 + Math.floor(i / 3) * 22;
      s += `<rect x="${lx}" y="${ly - 10}" width="10" height="10" rx="2" fill="${colors[i]}"/>`;
      s += `<text x="${lx + 16}" y="${ly}" font-size="12" font-weight="600" fill="var(--text)">${escapeXml(wrapLabel(lbl, 16)[0] || lbl)}${total ? ' ' + pct + '%' : ''}</text>`;
    });
    return s + '</svg>';
  }

  function pieSlice(cx, cy, r, ir, start, angle, color) {
    if (angle <= 0) return '';
    const end = start + angle;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const large = angle > Math.PI ? 1 : 0;
    if (!ir) {
      return `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${color}"/>`;
    }
    const ix1 = cx + ir * Math.cos(end), iy1 = cy + ir * Math.sin(end);
    const ix2 = cx + ir * Math.cos(start), iy2 = cy + ir * Math.sin(start);
    return `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${ir},${ir} 0 ${large},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z" fill="${color}"/>`;
  }

  function wrapLabel(str, n) {
    const parts = String(str).split(/[\s/]+/);
    const lines = [];
    let cur = '';
    parts.forEach(p => {
      const next = cur ? cur + ' ' + p : p;
      if (next.length > n && cur) { lines.push(cur); cur = p; }
      else cur = next;
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 2);
  }

  function escapeXml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function initJobsMap() {
    document.querySelectorAll('[data-jobs-map]').forEach(map => {
      const nodes = Array.from(map.querySelectorAll('[data-job]'));
      const panels = Array.from(map.querySelectorAll('[data-job-panel]'));
      if (!nodes.length) return;
      const activate = (id) => {
        nodes.forEach(n => n.classList.toggle('is-on', n.getAttribute('data-job') === id));
        panels.forEach(p => p.classList.toggle('is-on', p.getAttribute('data-job-panel') === id));
      };
      nodes.forEach(n => n.addEventListener('click', () => activate(n.getAttribute('data-job'))));
      const current = nodes.find(n => n.classList.contains('is-on'));
      activate((current || nodes[0]).getAttribute('data-job'));
    });
  }

  function initFlowMap() {
    document.querySelectorAll('[data-flow-map]').forEach(map => {
      const nodes = Array.from(map.querySelectorAll('[data-flow]'));
      const panels = Array.from(map.querySelectorAll('[data-flow-panel]'));
      if (!nodes.length) return;
      const activate = (id) => {
        nodes.forEach(n => n.classList.toggle('is-on', n.getAttribute('data-flow') === id));
        panels.forEach(p => p.classList.toggle('is-on', p.getAttribute('data-flow-panel') === id));
      };
      nodes.forEach(n => n.addEventListener('click', () => activate(n.getAttribute('data-flow'))));
      const current = nodes.find(n => n.classList.contains('is-on'));
      activate((current || nodes[0]).getAttribute('data-flow'));
    });
  }

  function initPbiTour() {
    const tour = document.querySelector('[data-tour]');
    if (!tour) return;
    const TOUR_DATA = {
      '1': {
        title: 'Ribbon — comenzile',
        text: 'Bara de sus, ca la Word sau Excel. Aici: <strong>Get Data</strong> (aduci Excel), <strong>Transform data</strong> (curăți), <strong>Refresh</strong> (reîncarci).',
        hint: 'Exemplu: Home → Get Data → Excel → alegi Vanzari_2024.xlsx.'
      },
      '2': {
        title: 'Vederi — Report / Data / Model',
        text: '<strong>Report</strong> = canvas cu grafice · <strong>Data</strong> = tabelul brut (ca Excel) · <strong>Model</strong> = tabelele legate cu linii.',
        hint: 'Exemplu: treci pe Data View ca să vezi dacă „Sumă” e număr, nu text.'
      },
      '3': {
        title: 'Canvas — pânza raportului',
        text: 'Zona din mijloc. Aici pui card-uri, grafice, slicere. Click pe un grafic → filtrează tot raportul.',
        hint: 'Exemplu: un card „Total vânzări” + un bar pe luni — pe aceeași pagină.'
      },
      '4': {
        title: 'Visualizations',
        text: 'Galeria de tipuri: bar, line, pie, card, table, slicer, map. Click pe un tip → apare pe canvas.',
        hint: 'Exemplu: click pe Card, apoi tragi coloana Sumă → apare totalul.'
      },
      '5': {
        title: 'Fields — coloanele',
        text: 'Lista coloanelor din datele importate (Categorie, Regiune, Data…). Le tragi pe canvas, drag & drop.',
        hint: 'Exemplu: tragi Regiune pe Axis și Sumă pe Values → bar chart pe regiuni.'
      }
    };
    const hotspots = tour.querySelectorAll('.pbi-hotspot');
    const pagerBtns = tour.querySelectorAll('[data-tour-jump]');
    const numEl = tour.querySelector('[data-tour-info-num]');
    const titleEl = tour.querySelector('[data-tour-info-title]');
    const textEl = tour.querySelector('[data-tour-info-text]');
    const hintEl = tour.querySelector('[data-tour-info-hint]');
    const activate = (id) => {
      const data = TOUR_DATA[id];
      if (!data) return;
      hotspots.forEach(h => h.classList.toggle('active', h.dataset.tourId === id));
      pagerBtns.forEach(p => p.classList.toggle('active', p.dataset.tourJump === id));
      if (numEl) numEl.textContent = id;
      if (titleEl) titleEl.textContent = data.title;
      if (textEl) textEl.innerHTML = data.text;
      if (hintEl) hintEl.innerHTML = data.hint;
    };
    hotspots.forEach(h => h.addEventListener('click', () => activate(h.dataset.tourId)));
    pagerBtns.forEach(p => p.addEventListener('click', () => activate(p.dataset.tourJump)));
    activate('1');
  }
})();
