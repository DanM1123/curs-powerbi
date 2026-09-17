/* ==========================================================================
   Demo Session · Main JS
   - Theme toggle
   - Trainer: segment navigation, progress strip
   - Student: slide deck, polls, brainstorm, team workspace
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE = {
    THEME: 'demo-theme',
    SEGMENTS: 'demo-segments-done',
    POLLS: 'demo-polls',
    BRAINSTORM: 'demo-brainstorm',
    TEAM: 'demo-team',
  };

  // -------- THEME --------
  const getTheme = () => localStorage.getItem(STORAGE.THEME) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const setTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem(STORAGE.THEME, t); };
  setTheme(getTheme());

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
    });

    initTrainer();
    initStudent();
    initAuditionTimer();
  });

  /* ====================================================================
     TRAINER VIEW — focused presenter mode
     ==================================================================== */
  function initTrainer() {
    const segments = document.querySelectorAll('.tseg');
    if (!segments.length) return;

    const total = segments.length;
    let current = 0;

    const stripSegs = document.querySelectorAll('[data-strip-seg]');
    const prevBtn = document.querySelector('[data-tseg-prev]');
    const nextBtn = document.querySelector('[data-tseg-next]');
    const counter = document.querySelector('[data-tseg-counter]');

    let done = {};
    try { done = JSON.parse(localStorage.getItem(STORAGE.SEGMENTS) || '{}'); } catch {}

    const render = () => {
      segments.forEach((s, i) => s.classList.toggle('active', i === current));
      if (counter) counter.textContent = `${current + 1} / ${total}`;
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === total - 1;
      stripSegs.forEach((seg, i) => {
        seg.classList.toggle('active', i === current);
        seg.classList.toggle('done', !!done[i + 1]);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const activeSeg = segments[current];
      const target = parseInt(activeSeg?.getAttribute('data-target-seconds') || '0', 10);
      document.dispatchEvent(new CustomEvent('tseg:change', {
        detail: { index: current, target }
      }));
    };

    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (current > 0) { current--; render(); }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (current < total - 1) {
        done[current + 1] = Date.now();
        localStorage.setItem(STORAGE.SEGMENTS, JSON.stringify(done));
        current++;
        render();
      }
    });

    stripSegs.forEach((seg, i) => {
      seg.addEventListener('click', () => { current = i; render(); });
    });

    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight') { if (current < total - 1) { done[current + 1] = Date.now(); localStorage.setItem(STORAGE.SEGMENTS, JSON.stringify(done)); current++; render(); } }
      if (e.key === 'ArrowLeft') { if (current > 0) { current--; render(); } }
    });

    render();
  }

  /* ====================================================================
     STUDENT VIEW · slide deck
     ==================================================================== */
  function initStudent() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;

    let current = 0;
    const total = slides.length;

    const counter = document.querySelector('[data-slide-counter]');
    const progressFill = document.querySelector('[data-slide-progress]');
    const dotsBar = document.querySelector('[data-slide-dots]');
    const prevBtn = document.querySelector('[data-slide-prev]');
    const nextBtn = document.querySelector('[data-slide-next]');

    // Build dots
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const go = (i) => { current = Math.max(0, Math.min(total - 1, i)); render(); };

    if (prevBtn) prevBtn.addEventListener('click', () => go(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(current + 1));

    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });

    render();

    initPolls();
    initBrainstorm();
    initTeam();
    initPbiTour();
  }

  /* ---- Power BI UI Tour — hotspots clickabili pe slide-ul „cum arată" ---- */
  function initPbiTour() {
    const tour = document.querySelector('[data-tour]');
    if (!tour) return;

    const TOUR_DATA = {
      '1': {
        title: 'Ribbon — comenzile',
        text: 'Bara de sus, ca la Word sau Excel. Aici ai butoanele importante: <strong>Get Data</strong> (aduci datele), <strong>Transform</strong> (le cureți), <strong>Refresh</strong> (le actualizezi). Fiecare „tab" (Home, Insert, View) deschide alte comenzi.',
        hint: '💡 Astăzi vom folosi în principal Home → Get Data și Home → Transform.'
      },
      '2': {
        title: 'Vederi — Report / Data / Model',
        text: 'Trei moduri de a privi datele tale: <strong>Report</strong> = canvas-ul cu vizuale (unde construim raportul) · <strong>Data</strong> = tabelul brut, ca în Excel · <strong>Model</strong> = relațiile dintre tabele.',
        hint: '💡 Începătorii stau 95% din timp în Report. La asta începem și noi.'
      },
      '3': {
        title: 'Canvas — pânza raportului',
        text: 'Zona din mijloc — aici trag și aranjez vizualele. <strong>Card-uri</strong> pentru cifre cheie, <strong>grafice</strong> pentru tendințe, <strong>slicere</strong> pentru filtrare. Fiecare element e mutabil cu mouse-ul.',
        hint: '💡 Gândește-te la canvas ca la o pagină de PowerPoint, dar fiecare element e <em>viu</em> — se actualizează când datele se schimbă.'
      },
      '4': {
        title: 'Visualizations — tipurile de vizuale',
        text: 'Galeria cu toate tipurile: bar chart, line chart, pie, card, table, slicer, map și multe altele. <strong>Click pe un tip</strong> și apare pe canvas. Sub el — opțiuni de personalizare (culori, font, formatare).',
        hint: '💡 Există ~30 vizuale built-in + sute downloadabile gratuit din marketplace.'
      },
      '5': {
        title: 'Fields — coloanele datelor tale',
        text: 'Lista cu toate coloanele din fișierele importate: <code>Vânzări</code>, <code>Categorie</code>, <code>Regiune</code>, <code>Data</code>. <strong>Le tragi pe canvas</strong> sau le pui în vizuale prin drag & drop. Schimbi câmpul → vizual nou.',
        hint: '💡 Asta e „limbajul" Power BI — drag & drop, fără să scrii cod la început.'
      }
    };

    const hotspots = tour.querySelectorAll('.pbi-hotspot');
    const pagerBtns = tour.querySelectorAll('[data-tour-jump]');
    const numEl = tour.querySelector('[data-tour-info-num]');
    const titleEl = tour.querySelector('[data-tour-info-title]');
    const textEl = tour.querySelector('[data-tour-info-text]');
    const hintEl = tour.querySelector('[data-tour-info-hint]');

    function activate(id) {
      const data = TOUR_DATA[id];
      if (!data) return;
      hotspots.forEach(h => h.classList.toggle('active', h.dataset.tourId === id));
      pagerBtns.forEach(p => p.classList.toggle('active', p.dataset.tourJump === id));
      if (numEl) numEl.textContent = id;
      if (titleEl) titleEl.textContent = data.title;
      if (textEl) textEl.innerHTML = data.text;
      if (hintEl) hintEl.innerHTML = data.hint;
    }

    hotspots.forEach(h => h.addEventListener('click', () => activate(h.dataset.tourId)));
    pagerBtns.forEach(p => p.addEventListener('click', () => activate(p.dataset.tourJump)));
  }

  /* ---- Polls ----
     Two modes:
     1. LIVE mode (when window.LIVE_POLLS is set in student.html via Firebase):
        votes are saved in Firebase Realtime DB and synced live to all viewers.
     2. LOCAL mode (no Firebase config): uses localStorage — votes are per-browser only.
  */
  function initPolls() {
    const live = window.LIVE_POLLS || null;

    let store = {};
    try { store = JSON.parse(localStorage.getItem(STORAGE.POLLS) || '{}'); } catch {}

    document.querySelectorAll('.poll').forEach(poll => {
      const id = poll.getAttribute('data-poll-id');
      if (!id) return;

      const opts = poll.querySelectorAll('.poll-opt');
      const seed = poll.getAttribute('data-seed') || '';
      const seedArr = seed.split(',').map(n => parseInt(n, 10));

      // Track if this browser already voted on this poll (prevents double-voting)
      const voteKey = `${STORAGE.POLLS}-mine-${id}`;
      let myVote = null;
      const stored = localStorage.getItem(voteKey);
      if (stored !== null && stored !== '') {
        const parsedVote = parseInt(stored, 10);
        if (Number.isInteger(parsedVote) && parsedVote >= 0 && parsedVote < opts.length) {
          myVote = parsedVote;
        } else {
          localStorage.removeItem(voteKey);
        }
      }

      // Counts in memory
      let votes = {};
      opts.forEach((_, i) => votes[i] = seedArr[i] || 0);

      const renderPoll = () => {
        const total = Object.values(votes).reduce((a, b) => a + b, 0);
        opts.forEach((opt, i) => {
          const c = votes[i] || 0;
          const pct = total ? Math.round((c / total) * 100) : 0;
          let bar = opt.querySelector('.opt-bar');
          if (!bar) { bar = document.createElement('div'); bar.className = 'opt-bar'; opt.prepend(bar); }
          let pctEl = opt.querySelector('.opt-pct');
          if (!pctEl) { pctEl = document.createElement('span'); pctEl.className = 'opt-pct'; opt.appendChild(pctEl); }
          bar.style.width = pct + '%';
          pctEl.textContent = pct + '%';
          opt.classList.toggle('selected', myVote === i);
        });
        poll.classList.toggle('voted', myVote !== null);
      };

      if (live) {
        // ===== LIVE MODE (Firebase sync) =====
        const { db, ref, onValue, runTransaction } = live;
        const pollRef = ref(db, `polls/${id}`);

        // Real-time listener: every time anyone votes, update the UI for everyone
        onValue(pollRef, (snap) => {
          // If the trainer deletes the Firebase `polls` node between sessions,
          // unlock the local browser too so it can vote again.
          if (!snap.exists() && myVote !== null) {
            myVote = null;
            localStorage.removeItem(voteKey);
          }
          const data = snap.val() || {};
          opts.forEach((_, i) => {
            votes[i] = (seedArr[i] || 0) + (parseInt(data[i], 10) || 0);
          });
          renderPoll();
        });

        opts.forEach((opt, i) => {
          opt.addEventListener('click', () => {
            if (myVote !== null) return;
            myVote = i;
            localStorage.setItem(voteKey, String(i));
            // Atomic increment so concurrent votes don't lose data
            runTransaction(ref(db, `polls/${id}/${i}`), (current) => (current || 0) + 1);
          });
        });

        renderPoll();
      } else {
        // ===== LOCAL MODE (localStorage fallback) =====
        if (!store[id]) {
          store[id] = { votes: {} };
          opts.forEach((_, i) => store[id].votes[i] = seedArr[i] || 0);
        }
        votes = store[id].votes;
        renderPoll();

        opts.forEach((opt, i) => {
          opt.addEventListener('click', () => {
            if (myVote !== null) return;
            myVote = i;
            localStorage.setItem(voteKey, String(i));
            votes[i] = (votes[i] || 0) + 1;
            store[id].votes = votes;
            localStorage.setItem(STORAGE.POLLS, JSON.stringify(store));
            renderPoll();
          });
        });
      }
    });
  }

  /* ---- Brainstorm wall ---- */
  function initBrainstorm() {
    document.querySelectorAll('.brainstorm').forEach(bs => {
      const id = bs.getAttribute('data-bs-id');
      if (!id) return;
      const key = `${STORAGE.BRAINSTORM}-${id}`;
      let items = [];
      try { items = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}

      const list = bs.querySelector('.brainstorm-list');
      const input = bs.querySelector('input');
      const btn = bs.querySelector('button');

      const render = () => {
        list.innerHTML = '';
        items.forEach((it, idx) => {
          const tag = document.createElement('span');
          tag.className = 'brainstorm-tag';
          tag.innerHTML = `${it} <button aria-label="șterge">×</button>`;
          tag.querySelector('button').addEventListener('click', () => {
            items.splice(idx, 1);
            localStorage.setItem(key, JSON.stringify(items));
            render();
          });
          list.appendChild(tag);
        });
      };

      const add = () => {
        const v = input.value.trim();
        if (!v) return;
        items.push(v);
        localStorage.setItem(key, JSON.stringify(items));
        input.value = '';
        render();
      };

      if (btn) btn.addEventListener('click', add);
      if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });

      render();
    });
  }

  /* ====================================================================
     AUDITION TIMER · 30 min total + per-segment, vizibil în trainer top bar
     ==================================================================== */
  function initAuditionTimer() {
    const wrap = document.querySelector('[data-timer]');
    if (!wrap) return;

    const TOTAL_BUDGET = 30 * 60;
    const totalEl = wrap.querySelector('[data-timer-total]');
    const segEl = wrap.querySelector('[data-timer-seg]');
    const toggleBtn = wrap.querySelector('[data-timer-toggle]');
    const resetBtn = wrap.querySelector('[data-timer-reset]');
    const playIcon = wrap.querySelector('[data-timer-play]');
    const pauseIcon = wrap.querySelector('[data-timer-pause]');

    let totalElapsed = 0;
    let segElapsed = 0;
    let segTarget = 90;
    let running = false;
    let tickHandle = null;

    const fmt = (s) => {
      const sec = Math.max(0, Math.floor(s));
      const m = Math.floor(sec / 60);
      const r = sec % 60;
      return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
    };

    const colorFor = (elapsed, target) => {
      if (!target) return '';
      const ratio = elapsed / target;
      if (ratio >= 1) return 'over';
      if (ratio >= 0.85) return 'warn';
      return 'ok';
    };

    const render = () => {
      const totalSign = totalElapsed > TOTAL_BUDGET ? '+' : '';
      const totalDisplay = totalElapsed > TOTAL_BUDGET
        ? `${totalSign}${fmt(totalElapsed - TOTAL_BUDGET)} OVER`
        : `${fmt(totalElapsed)} / ${fmt(TOTAL_BUDGET)}`;
      totalEl.textContent = totalDisplay;
      totalEl.classList.remove('ok', 'warn', 'over');
      totalEl.classList.add(colorFor(totalElapsed, TOTAL_BUDGET));

      const segDisplay = segElapsed > segTarget
        ? `+${fmt(segElapsed - segTarget)} OVER`
        : `${fmt(segElapsed)} / ${fmt(segTarget)}`;
      segEl.textContent = segDisplay;
      segEl.classList.remove('ok', 'warn', 'over');
      segEl.classList.add(colorFor(segElapsed, segTarget));
    };

    const tick = () => {
      totalElapsed += 1;
      segElapsed += 1;
      render();
    };

    const start = () => {
      if (running) return;
      running = true;
      tickHandle = setInterval(tick, 1000);
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    };
    const pause = () => {
      running = false;
      if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    };
    const reset = () => {
      pause();
      totalElapsed = 0;
      segElapsed = 0;
      render();
    };

    toggleBtn.addEventListener('click', () => running ? pause() : start());
    resetBtn.addEventListener('click', () => {
      if (confirm('Resetezi timer-ul de audiție? (Total + segment)')) reset();
    });

    document.addEventListener('tseg:change', (e) => {
      const t = e.detail?.target;
      if (t && t > 0) segTarget = t;
      segElapsed = 0;
      render();
    });

    const firstSeg = document.querySelector('.tseg.active');
    if (firstSeg) {
      const t = parseInt(firstSeg.getAttribute('data-target-seconds') || '90', 10);
      if (t > 0) segTarget = t;
    }

    render();
  }

  /* ---- Team workspace ---- */
  function initTeam() {
    const team = document.querySelector('[data-team]');
    if (!team) return;

    const key = STORAGE.TEAM;
    let state = { name: '', members: '', choice: null };
    try { state = Object.assign(state, JSON.parse(localStorage.getItem(key) || '{}')); } catch {}

    const nameInput = team.querySelector('[data-team-name]');
    const membersInput = team.querySelector('[data-team-members]');
    const choices = team.querySelectorAll('[data-team-choice]');
    const saveBtn = team.querySelector('[data-team-save]');

    if (nameInput) nameInput.value = state.name || '';
    if (membersInput) membersInput.value = state.members || '';
    choices.forEach(c => {
      if (c.getAttribute('data-team-choice') === state.choice) c.classList.add('selected');
      c.addEventListener('click', () => {
        choices.forEach(o => o.classList.remove('selected'));
        c.classList.add('selected');
        state.choice = c.getAttribute('data-team-choice');
        localStorage.setItem(key, JSON.stringify(state));
      });
    });
    if (nameInput) nameInput.addEventListener('input', () => { state.name = nameInput.value; localStorage.setItem(key, JSON.stringify(state)); });
    if (membersInput) membersInput.addEventListener('input', () => { state.members = membersInput.value; localStorage.setItem(key, JSON.stringify(state)); });
    if (saveBtn) saveBtn.addEventListener('click', () => {
      saveBtn.classList.add('saved');
      saveBtn.textContent = '✓ Salvat — succes la prezentare!';
      setTimeout(() => {
        saveBtn.classList.remove('saved');
        saveBtn.textContent = 'Salvează alegerea echipei';
      }, 2400);
    });
  }
})();
