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
    initIndustries();
    initBiStages();
    initBiIntro();
    initAdvantages();
    initArtifacts();
    initRealTour();
    initRibbonTour();
    initContrast();
    initCases();
    initReveal();
  }

  function initAdvantages() {
    document.querySelectorAll('[data-advantages]').forEach(root => {
      const tabs = root.querySelectorAll('[data-adv]');
      const panels = root.querySelectorAll('[data-adv-panel]');
      if (!tabs.length || !panels.length) return;

      const show = (id) => {
        tabs.forEach(t => {
          const on = t.getAttribute('data-adv') === id;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(p => {
          const on = p.getAttribute('data-adv-panel') === id;
          p.classList.toggle('is-on', on);
          if (on) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
      };

      tabs.forEach(t => t.addEventListener('click', () => show(t.getAttribute('data-adv'))));
    });
  }

  function initArtifacts() {
    document.querySelectorAll('[data-artifacts]').forEach(root => {
      const tabs = root.querySelectorAll('[data-art]');
      const panels = root.querySelectorAll('[data-art-panel]');
      if (!tabs.length || !panels.length) return;

      const show = (id) => {
        tabs.forEach(t => {
          const on = t.getAttribute('data-art') === id;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(p => {
          const on = p.getAttribute('data-art-panel') === id;
          p.classList.toggle('is-on', on);
          if (on) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
      };

      tabs.forEach(t => t.addEventListener('click', () => show(t.getAttribute('data-art'))));
    });
  }

  function initBiIntro() {
    document.querySelectorAll('[data-bi-intro]').forEach(root => {
      const tabs = root.querySelectorAll('[data-bi-topic]');
      const panels = root.querySelectorAll('[data-bi-panel]');
      if (!tabs.length || !panels.length) return;

      const show = (id) => {
        tabs.forEach(t => {
          const on = t.getAttribute('data-bi-topic') === id;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(p => {
          const on = p.getAttribute('data-bi-panel') === id;
          p.classList.toggle('is-on', on);
          if (on) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
      };

      tabs.forEach(t => t.addEventListener('click', () => show(t.getAttribute('data-bi-topic'))));
    });
  }

  function initIndustries() {
    document.querySelectorAll('[data-industries]').forEach(root => {
      const tabs = root.querySelectorAll('[data-ind]');
      const panels = root.querySelectorAll('[data-ind-panel]');
      if (!tabs.length || !panels.length) return;

      const show = (id) => {
        tabs.forEach(t => {
          const on = t.getAttribute('data-ind') === id;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(p => {
          const on = p.getAttribute('data-ind-panel') === id;
          p.classList.toggle('is-on', on);
          if (on) p.removeAttribute('hidden');
          else p.setAttribute('hidden', '');
        });
      };

      tabs.forEach(t => t.addEventListener('click', () => show(t.getAttribute('data-ind'))));
    });
  }

  function initBiStages() {
    document.querySelectorAll('[data-bi-stages]').forEach(root => {
      const cards = root.querySelectorAll('[data-reveal-stage]');
      if (!cards.length) return;

      cards.forEach(card => {
        card.addEventListener('click', () => {
          const on = card.classList.toggle('is-revealed');
          card.setAttribute('aria-expanded', on ? 'true' : 'false');
        });
      });
    });
  }

  function initCases() {
    const CASES = {
      vanzari: {
        kicker: 'Întrebarea de luni dimineață',
        q: '„De ce au scăzut vânzările luna trecută?”',
        off: 'Datele stau în patru fișiere separate: magazine, marketing, contabilitate și un <code>raport_final_v3.xlsx</code>. Consolidezi manual. O formulă trage din rândul greșit. Rezultatul ajunge ca o captură pe chat: de obicei joi, nu luni.',
        onWork: 'Un singur raport. În ședință filtrezi luna și regiunea. Tot ecranul se actualizează. Nu mai cauți în fișiere.',
        onAnswer: 'Scăderea nu e peste tot. <strong>Nordul, categoria Băuturi, −18% față de februarie.</strong> Restul țării e aproape pe loc. Asta e gaura: nu „vânzările, în general”.',
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
        onAnswer: '<strong>Echipa Vânzări: 4 plecări din 18 oameni</strong>: peste restul. Support are 1. Nu e „fluctuație generală”, e o echipă.',
        kpi: ['Plecări mar', '7', 'toată firma', 'Vânzări', '4 din 18', 'cea mai mare']
      },
      fin: {
        kicker: 'Financiar',
        q: '„Unde am cheltuit mai mult decât era planificat?”',
        off: 'Două fișiere: bugetul și cheltuielile. Le aliniezi pe departament, scazi, cauți minusurile. O greșeală de aliniere și apare o alarmă falsă.',
        onWork: 'Un tabel cu buget, realizat și diferența. Rămân vizibile doar rândurile peste plan. Filtrezi luna.',
        onAnswer: '<strong>Marketing +23% peste buget</strong> (12.400 lei). IT e sub plan. Nu tai din tot: tai de unde e depășirea.',
        kpi: ['Depășiri', '12.4k', 'o linie', 'Marketing', '+23%', 'vs plan']
      },
      mkt: {
        kicker: 'Marketing',
        q: '„Pe ce canal de publicitate cheltuim fără rezultat?”',
        off: 'Cifrele sunt în trei locuri: Facebook, Google, Excel-ul intern. Le lipești, calculezi costul pe client, trimiți un tabel. Până luni, numerele s-au schimbat.',
        onWork: 'Un ecran: canal, bani cheltuiți, clienți veniți. Filtrezi ultimele 30 de zile.',
        onAnswer: '<strong>Facebook Ads: 12.000 lei, 3 clienți noi</strong>: 4.000 lei / client. Google a adus 18 clienți cu 6.000 lei. Banii de tăiat sunt pe Facebook.',
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
          text: 'Un raport cu filtru pe regiune și pe lună. Sortezi graficul de la mic la mare și vezi imediat lista. Click pe Vest sau pe Martie: lista se actualizează pe loc, în ședință.'
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
          text: 'Un grafic pe echipe și un număr mare cu totalul plecărilor. Filtrezi luna. Vezi imediat că una dintre echipe e deasupra celorlalte: și poți coborî la nume, dacă ai dreptul.'
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
        title: 'Report View: pânza raportului',
        text: 'Aceasta este vederea în care petreci cel mai mult timp. Aici <strong>construiești raportul</strong>: tragi pe canvas carduri KPI, grafice, tabele și slicere, apoi le configurezi din panourile din dreapta. Gândește-te la ea ca la un slide PowerPoint, doar că fiecare element e legat de date și reacționează la filtre.',
        hint: 'Apasă punctele numerotate de pe imagine ca să afli ce face fiecare zonă a ecranului.',
        badge: ''
      },
      table: {
        title: 'Table View: datele pe rânduri',
        text: 'Aici vezi datele <strong>exact cum au intrat</strong> după import: rânduri și coloane, ca într-un sheet Excel. Nu construiești grafice aici: <strong>verifici</strong> dacă importul e corect: tipuri de date, valori lipsă, duplicate. Dacă ceva e greșit, te întorci în Power Query să cureți.',
        hint: 'Exemplu: dacă „Sumă” apare ca text („200 lei”), aici observi problema înainte să faci totaluri greșite.',
        badge: 'is-table'
      },
      model: {
        title: 'Model View: relațiile dintre tabele',
        text: 'Tabelele apar ca dreptunghiuri, iar liniile dintre ele sunt <strong>relațiile</strong>. Le creezi prin drag &amp; drop (tragi o coloană peste alta). Un model bun face ca filtrele din raport să funcționeze pe toate tabelele legate: fără el, graficele „nu se văd între ele”.',
        hint: 'Exemplu din poză: legi Collisions de Date sau de Location ca să filtrezi accidentele pe an sau pe cartier.',
        badge: 'is-model'
      }
    };

    const HOTSPOTS = {
      r1: { view: 'report', title: 'Ribbon: bara de comenzi', text: 'Bara de sus, cu tab-uri ca la Word sau Excel: <strong>File · Home · Insert · Modeling · View</strong>. De aici pornește munca: aduci datele (Get data), le cureți (Transform data), reîncarci (Refresh) sau adaugi elemente pe pagină. Ribbon-ul se schimbă puțin în funcție de ce vedere ești: detaliile le vedem pe slide-ul următor.', hint: 'Exemplu tipic: Home → Get data → Excel → alegi fișierul de vânzări.' },
      r2: { view: 'report', title: 'Canvas: suprafața raportului', text: 'Zona centrală, albă. Aici aranjezi vizualele: KPI-uri sus, grafice în mijloc, filtre pe laterale. Fiecare element e conectat la date. Poți avea mai multe pagini (tab-uri jos), ca sheet-urile din Excel: fiecare pagină = o perspectivă (vânzări, stoc, detaliu).', hint: 'Exemplu: click pe o bară din grafic → tot raportul se filtrează pe acea valoare.' },
      r3: { view: 'report', title: 'Visualizations: tipurile de vizuale', text: 'Galeria din dreapta cu tipurile disponibile: bar, line, card, donut, hartă, matrix, slicer, table etc. Alegi tipul, apoi completezi câmpurile (Values, Axis, Legend). Același set de date poate arăta foarte diferit în funcție de vizualul ales.', hint: 'Exemplu: alegi Card, tragi „Sumă” în Values → apare totalul pe ecran.' },
      r4: { view: 'report', title: 'Data: tabelele și coloanele', text: 'Lista datelor importate: fiecare tabel cu coloanele lui (Categorie, Regiune, Data, Sumă). De aici tragi câmpuri pe canvas sau în panoul vizualului. Iconița Σ marchează coloanele numerice pe care le poți aduna.', hint: 'Exemplu: tragi „Regiune” pe axă și „Sumă” în valori → grafic pe regiuni.' },
      r5: { view: 'report', title: 'Pages: paginile raportului', text: 'Un raport Power BI poate avea mai multe pagini, exact ca un workbook Excel cu mai multe sheet-uri. Fiecare pagină poate spune o altă poveste: sumar, detalii pe magazin, comparație pe luni. Navigarea e pe tab-urile de jos.', hint: 'Începătorii: păstrează o pagină „Sumar” și una „Detaliu”: mai ușor de citit.' },
      t1: { view: 'table', title: 'Table tools: unelte pe tabel', text: 'Când selectezi un tabel, în ribbon apare un tab contextual. De aici poți crea <strong>măsuri</strong> (calcule tip total) și <strong>coloane calculate</strong>. Nu e locul unde cureți datele: curățarea se face în Power Query; aici lucrezi pe modelul deja încărcat.', hint: 'Măsurile în DAX le aprofundăm în sesiunile următoare: acum e suficient să știi că există.' },
      t2: { view: 'table', title: 'Grila cu date', text: 'Datele pe rânduri și coloane. Aici <strong>verifici</strong>, nu edifici raportul: cauți valori goale, tipuri greșite, duplicate. Dacă ceva nu arată bine, notezi problema și o rezolvi în Power Query (Transform data).', hint: 'Exemplu: vezi „null” pe coloana Regiune → magazinul fără regiune va lipsi din filtre.' },
      t3: { view: 'table', title: 'Lista tabelelor și tipurile', text: 'În dreapta ai tabelele și, pentru fiecare, coloanele cu tipul lor (text, număr, dată). Tipul greșit strică calculele: un preț ca text nu se adună. Verifică iconițele înainte să construiești vizuale.', hint: 'Dacă „Sumă” nu are Σ, tipul e probabil text: trebuie corectat.' },
      m1: { view: 'model', title: 'Tabele de dimensiuni', text: 'Vehicle Type, Date, Time și Location descriu accidentul: tipul de vehicul, când și unde. Stau în jurul tabelului central și îl filtrează.', hint: 'Dimensiunile răspund la „după ce grupăm?”: dată, loc, tip de vehicul.' },
      m2: { view: 'model', title: 'Tabelul de fapte (Collisions)', text: 'Collisions este tabelul central, cu măsurile (număr de accidente, răniți). Aici se adună cifrele. Liniile cu 1 și * arată relația unu-la-mulți.', hint: 'Într-un star schema, faptele stau la mijloc, dimensiunile pe margine.' },
      m3: { view: 'model', title: 'Relațiile din dreapta', text: 'Contributing Factor și Location se leagă de Collisions. Fiecare linie este o relație: fără ea, un filtru dintr-un tabel nu ajunge în celălalt.', hint: 'Urmărește simbolurile 1 și * ca să vezi sensul filtrului.' }
    };

    const ASPECTS = { report: '1919 / 973', table: '1919 / 982', model: '1170 / 617' };

    const stage = tour.querySelector('.s2-real-stage');
    const badge = tour.querySelector('[data-rti-badge]');
    const titleEl = tour.querySelector('[data-rti-title]');
    const textEl = tour.querySelector('[data-rti-text]');
    const hintEl = tour.querySelector('[data-rti-hint]');
    const imgs = tour.querySelectorAll('.s2-real-img');
    const vsBtns = tour.querySelectorAll('.s2-view-top-btn[data-view]');
    const spots = tour.querySelectorAll('.s2-rh');

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
      paint(view, VIEW_DEFAULTS[view], '');
    };

    const showSpot = (id) => {
      const data = HOTSPOTS[id];
      if (!data) return;
      spots.forEach(s => s.classList.toggle('active', s.dataset.id === id));
      paint(data.view, data, ' · ZONA ' + id.slice(1));
    };

    vsBtns.forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    spots.forEach(s => s.addEventListener('click', () => showSpot(s.dataset.id)));
    setView('report');
  }

  function initRibbonTour() {
    const root = document.querySelector('[data-ribbon-tour]');
    if (!root) return;

    const FOCUS = {
      report: 'Specific Report View: aici construiești pagina: vizuale, text, publicare. Ribbon-ul are grupul Insert, pe care nu-l vezi la fel în celelalte vederi.',
      table: 'Specific Table View: tab-ul contextual Table tools. Redenumești tabelul, gestionezi relații, creezi măsuri/coloane și marchezi tabela de date.',
      model: 'Specific Model View: lucrezi pe legături dintre tabele. Ai Relationships, Calculations și Parameters: fără Insert de vizuale.'
    };

    const SPOTS = {
      r1: {
        title: 'Data: aduci datele în proiect',
        text: 'Grupul cu care începe aproape orice raport. De aici te conectezi la surse. Nu trebuie să știi toate butoanele: ține minte pe cele de mai jos.',
        fields: [
          { name: 'Get data', desc: 'Meniu cu toate tipurile de surse (Excel, SQL, web…). Punctul de start.' },
          { name: 'Excel workbook', desc: 'Scurtătură directă: cel mai folosit la început.' },
          { name: 'Enter data', desc: 'Tastezi sau lipești un tabel mic, fără fișier.' },
          { name: 'Recent sources', desc: 'Revii rapid la o sursă pe care ai mai folosit-o.' }
        ],
        hint: 'La început: Get data → Excel. Restul (SQL, Dataverse, OneLake) le lași pe mai târziu.'
      },
      r2: {
        title: 'Queries: cureți și reîncarci datele',
        text: 'După ce ai importat, aici pregătești datele. Transform data deschide Power Query: editorul de curățare pe care îl aprofundăm în sesiunea următoare.',
        fields: [
          { name: 'Transform data', desc: 'Deschide Power Query: filtrezi, redenumești coloane, corectezi tipuri.' },
          { name: 'Refresh', desc: 'Reîncarcă datele din surse (când apar rânduri noi în Excel, de ex.).' }
        ],
        hint: 'Vezi valori greșite pe raport → Transform data, nu „corectezi pe grafic”.'
      },
      r3: {
        title: 'Insert: pui elemente pe pagină',
        text: 'Doar în Report View ai acest grup pe Home. Adaugi vizuale și text pe canvas: e diferența mare față de Table / Model.',
        fields: [
          { name: 'New visual', desc: 'Pune un vizual gol pe pagină; apoi alegi tipul și câmpurile.' },
          { name: 'Text box', desc: 'Titluri, explicații scurte pe raport.' },
          { name: 'More visuals', desc: 'Vizuale din magazin (opțional, mai târziu).' }
        ],
        hint: 'Specific Report: aici „desenezi” raportul. În Table/Model nu ai Insert de grafice.'
      },
      r4: {
        title: 'Calculations: calcule pe date',
        text: 'Aici creezi măsuri (totaluri, procente). La început e suficient să știi că există: DAX-ul vine în sesiuni viitoare.',
        fields: [
          { name: 'New measure', desc: 'Formule tip „Total vânzări” folosite pe tot raportul.' },
          { name: 'Quick measure', desc: 'Asistent pentru calcule comune, fără să scrii totul de mână.' }
        ],
        hint: 'Nu e obligatoriu în prima zi. Important: există și e pe Home, în Report.'
      },
      r5: {
        title: 'Publish: trimiți raportul în cloud',
        text: 'Când raportul e gata pe PC, Publish îl urcă în Power BI Service. De acolo îl văd colegii din browser.',
        fields: [
          { name: 'Publish', desc: 'Încarcă fișierul .pbix în workspace-ul din Service.' }
        ],
        hint: 'Desktop = creezi. Publish = împărtășești. Fără Publish, raportul rămâne doar pe calculatorul tău.'
      },
      t1: {
        title: 'Structure: numele tabelului',
        text: 'În Table tools poți redenumi tabelul selectat. Numele clar (ex. Vânzări, nu Sheet1) ajută pe tot modelul și în rapoarte.',
        fields: [
          { name: 'Name', desc: 'Câmpul unde schimbi denumirea tabelului curent.' }
        ],
        hint: 'Redenumește tabelele imediat după import: e greu să lucrezi cu Sheet1, Sheet2…'
      },
      t2: {
        title: 'Relationships: legăturile dintre tabele',
        text: 'Manage relationships deschide lista relațiilor din model. De aici creezi sau editezi legăturile (ex. pe ID), fără să schimbi neapărat vederea Model.',
        fields: [
          { name: 'Manage relationships', desc: 'Creezi, editezi sau ștergi relații între tabele.' }
        ],
        hint: 'Relațiile corecte fac ca filtrele din raport să meargă între tabele.'
      },
      t3: {
        title: 'Calculations: măsuri și coloane',
        text: 'Grupul central din Table tools: aici creezi calcule pe model (DAX), nu curățare de date (aceea e în Power Query).',
        fields: [
          { name: 'New measure', desc: 'Calcul dinamic (total, medie) folosit în vizuale.' },
          { name: 'Quick measure', desc: 'Asistent pentru calcule frecvente.' },
          { name: 'New column', desc: 'Coloană calculată pe fiecare rând.' },
          { name: 'New table', desc: 'Tabel nou dintr-o formulă DAX.' }
        ],
        hint: 'La început e suficient să recunoști New measure / New column. DAX-ul vine mai târziu.'
      },
      t4: {
        title: 'Calendars: tabela de date',
        text: 'Mark as date table spune modelului care tabel este calendarul oficial, necesar pentru funcții de time intelligence (YTD, MoM etc.).',
        fields: [
          { name: 'Mark as date table', desc: 'Marchează tabelul selectat ca tabel de date al modelului.' }
        ],
        hint: 'Folosești asta când ai un tabel Date / Calendar dedicat, nu pe orice tabel.'
      },
      m1: {
        title: 'Data: date noi și din Model View',
        text: 'Poți importa surse și din Model View. Rareori e primul loc unde te duci ca începător, dar butoanele există.',
        fields: [
          { name: 'Get data', desc: 'Adaugi o sursă nouă fără să schimbi vederea.' },
          { name: 'Excel workbook', desc: 'Import rapid Excel.' }
        ],
        hint: 'De obicei: imporți din Report/Table, apoi treci la Model ca să legi tabelele.'
      },
      m2: {
        title: 'Queries: curățare din Model',
        text: 'Transform data și Refresh sunt disponibile și aici. Dacă observi o problemă pe diagramă (tabel lipsă, coloane greșite), poți sări direct în Power Query.',
        fields: [
          { name: 'Transform data', desc: 'Deschide Power Query.' },
          { name: 'Refresh', desc: 'Reîncarcă datele în model.' }
        ],
        hint: 'Modelul e la fel de bun ca datele din spate: Transform data rămâne unealta de curățare.'
      },
      m3: {
        title: 'Relationships: inima Model View',
        text: 'Aici relațiile contează cel mai mult. Pe canvas le vezi ca linii; Manage relationships îți dă lista și detaliile.',
        fields: [
          { name: 'Manage relationships', desc: 'Creezi / editezi legături (ex. ID_Client în ambele tabele).' }
        ],
        hint: 'Specific Model: fără relații corecte, vizuale din tabele diferite nu se filtrează cum trebuie.'
      },
      m4: {
        title: 'Calculations: măsuri pe model',
        text: 'În Model View poți crea măsuri, coloane, tabele calculate. Lucrezi pe structură, nu pe aspectul paginii.',
        fields: [
          { name: 'New measure', desc: 'Calcul pentru tot raportul.' },
          { name: 'New column', desc: 'Coloană calculată în tabel.' },
          { name: 'New table', desc: 'Tabel din formulă.' }
        ],
        hint: 'Calculele aparțin modelului: de aceea le găsești și aici, nu doar pe canvas.'
      },
      m5: {
        title: 'Parameters: scenarii „ce-ar fi dacă”',
        text: 'New parameter creează un control pe care utilizatorul îl poate schimba (ex. un procent de creștere). La început e opțional: știi că există.',
        fields: [
          { name: 'New parameter', desc: 'Parametru what-if sau listă de câmpuri pentru slicer-e avansate.' }
        ],
        hint: 'Specific Model (și mai avansat): nu e necesar în prima săptămână, dar e pe ribbon ca să-l recunoști.'
      }
    };

    const viewBtns = root.querySelectorAll('[data-rib-view]');
    const imgs = root.querySelectorAll('[data-rib-img]');
    const spots = root.querySelectorAll('.s2-rib-h');
    const badge = root.querySelector('[data-rib-badge]');
    const focusEl = root.querySelector('[data-rib-focus]');
    const titleEl = root.querySelector('[data-rib-title]');
    const textEl = root.querySelector('[data-rib-text]');
    const fieldsEl = root.querySelector('[data-rib-fields]');
    const hintEl = root.querySelector('[data-rib-hint]');
    const firstByView = { report: 'r1', table: 't1', model: 'm1' };

    const showSpot = (id) => {
      const spot = SPOTS[id];
      if (!spot) return;
      spots.forEach(s => s.classList.toggle('active', s.dataset.id === id));
      if (titleEl) titleEl.textContent = spot.title;
      if (textEl) textEl.textContent = spot.text;
      if (fieldsEl) {
        fieldsEl.innerHTML = (spot.fields || []).map(f =>
          `<li><strong>${f.name}</strong>${f.desc}</li>`
        ).join('');
      }
      if (hintEl) hintEl.innerHTML = spot.hint || '';
    };

    const setView = (view) => {
      const stage = root.querySelector('.s2-rib-stage');
      if (stage) stage.dataset.rib = view;
      viewBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-rib-view') === view));
      imgs.forEach(img => img.classList.toggle('active', img.getAttribute('data-rib-img') === view));
      spots.forEach(s => {
        const on = s.dataset.view === view;
        s.classList.toggle('show', on);
        s.classList.remove('active');
      });
      if (badge) {
        badge.textContent = view.toUpperCase() + ' VIEW';
        badge.classList.toggle('is-table', view === 'table');
        badge.classList.toggle('is-model', view === 'model');
      }
      if (focusEl) focusEl.textContent = FOCUS[view] || '';
      showSpot(firstByView[view]);
    };

    viewBtns.forEach(b => b.addEventListener('click', () => setView(b.getAttribute('data-rib-view'))));
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
      let votedAt = 0;
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
          pctEl.textContent = showCounts
            ? String(c)
            : (c === 1 ? '1 pers.' : c + ' pers.');
          pctEl.setAttribute('title', c === 1 ? '1 vot' : c + ' voturi');
          opt.setAttribute('data-votes', String(c));
          opt.classList.toggle('selected', myVote === i);
        });
        poll.classList.toggle('voted', myVote !== null || total > 0);
        if (showCounts) {
          const revealRoot = poll.closest('[data-reveal]');
          if (revealRoot) updateRevealScore(revealRoot);
        }
        if (chartType) renderWyrChart(poll, chartType, labels(), colors(), votes, total, letters());
      };

      const cast = (i) => {
        if (myVote !== null) return;
        myVote = i;
        votedAt = Date.now();
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
          let remoteTotal = 0;
          opts.forEach((_, i) => {
            remoteTotal += parseInt((data && (data[i] ?? data[String(i)])), 10) || 0;
          });
          if (remoteTotal === 0 && myVote !== null && Date.now() - votedAt > 4000) {
            myVote = null;
          }
          if (remoteTotal === 0 && myVote !== null && Date.now() - votedAt < 4000) {
            renderPoll();
            return;
          }
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

    addPollResetButton(live);
  }

  function addPollResetButton(live) {
    if (!live || !live.reset || !document.querySelector('.poll')) return;
    if (document.querySelector('.poll-reset-btn')) return;
    const host = document.querySelector('.nav-actions');
    if (!host) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn poll-reset-btn';
    btn.setAttribute('aria-label', 'Resetează voturile');
    btn.title = 'Reset voturi: pornește de la 0';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5L1 10"/></svg>';
    btn.addEventListener('click', async () => {
      if (!confirm('Ștergi toate răspunsurile din sesiunea asta și pornești de la 0?')) return;
      btn.disabled = true;
      try {
        await live.reset(POLL_ROOT);
        location.reload();
      } catch (err) {
        console.error('[polls] reset failed', err);
        btn.disabled = false;
        alert('Nu am putut reseta voturile. Încearcă din nou.');
      }
    });
    host.insertBefore(btn, host.firstChild);
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
    if (type === 'pie') host.innerHTML = svgPie(labels, vals, colors, total, false, letters);
    else if (type === 'donut') host.innerHTML = svgPie(labels, vals, colors, total, true, letters);
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
        ? `<div class="wyr-track-fill" style="width:${w}%;background:${colors[i]}"><span class="wyr-bar-label">${letter} · ${v}</span></div>`
        : `<span class="wyr-bar-label is-empty">${letter} · 0</span>`;
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
      s += `<text x="${x + barW / 2}" y="${h ? y - 6 : H - padB - usable - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="${colors[i]}">${v}</text>`;
    });
    return s + '</svg>';
  }

  function svgPie(labels, vals, colors, total, donut, letters) {
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
    const legend = vals.map((v, i) => {
      const letter = (letters && letters[i]) || String.fromCharCode(65 + i);
      return `<span class="wyr-pie-tag"><i style="background:${colors[i]}"></i>${letter} · ${v}</span>`;
    }).join('');
    return `<div class="wyr-pie-wrap">${s}</svg><div class="wyr-pie-legend">${legend}</div></div>`;
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
        title: 'Ribbon: comenzile',
        text: 'Bara de sus, ca la Word sau Excel. Aici: <strong>Get Data</strong> (aduci Excel), <strong>Transform data</strong> (curăți), <strong>Refresh</strong> (reîncarci).',
        hint: 'Exemplu: Home → Get Data → Excel → alegi Vanzari_2024.xlsx.'
      },
      '2': {
        title: 'Vederi: Report / Data / Model',
        text: '<strong>Report</strong> = canvas cu grafice · <strong>Data</strong> = tabelul brut (ca Excel) · <strong>Model</strong> = tabelele legate cu linii.',
        hint: 'Exemplu: treci pe Data View ca să vezi dacă „Sumă” e număr, nu text.'
      },
      '3': {
        title: 'Canvas: pânza raportului',
        text: 'Zona din mijloc. Aici pui card-uri, grafice, slicere. Click pe un grafic → filtrează tot raportul.',
        hint: 'Exemplu: un card „Total vânzări” + un bar pe luni: pe aceeași pagină.'
      },
      '4': {
        title: 'Visualizations',
        text: 'Galeria de tipuri: bar, line, pie, card, table, slicer, map. Click pe un tip → apare pe canvas.',
        hint: 'Exemplu: click pe Card, apoi tragi coloana Sumă → apare totalul.'
      },
      '5': {
        title: 'Fields: coloanele',
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
