/* ==========================================================================
   Power BI Course - Main JS
   Shared functionality across all pages
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE = {
    THEME: 'pbi-course-theme',
    PROGRESS: 'pbi-course-progress',
    CHECKLIST: 'pbi-course-checklist',
  };

  const TOTAL_LESSONS = 14;

  // -------- THEME --------
  const getTheme = () => localStorage.getItem(STORAGE.THEME) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const setTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(STORAGE.THEME, t);
  };
  setTheme(getTheme());

  // -------- PROGRESS --------
  const getProgress = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE.PROGRESS) || '{}'); }
    catch { return {}; }
  };
  const setProgress = (p) => localStorage.setItem(STORAGE.PROGRESS, JSON.stringify(p));
  const markLesson = (id, done) => {
    const p = getProgress();
    if (done) p[id] = { done: true, at: Date.now() };
    else delete p[id];
    setProgress(p);
    updateProgressUI();
  };
  const countDone = () => Object.keys(getProgress()).length;

  const updateProgressUI = () => {
    const done = countDone();
    const pct = Math.round((done / TOTAL_LESSONS) * 100);
    document.querySelectorAll('[data-progress-count]').forEach(el => el.textContent = `${done}/${TOTAL_LESSONS}`);
    document.querySelectorAll('[data-progress-fill]').forEach(el => el.style.width = pct + '%');
    document.querySelectorAll('[data-progress-pct]').forEach(el => el.textContent = pct + '%');

    // Mark lesson cards as done
    const progress = getProgress();
    document.querySelectorAll('.lesson-card[data-lesson]').forEach(card => {
      const id = card.getAttribute('data-lesson');
      if (progress[id]) card.setAttribute('data-done', 'true');
      else card.removeAttribute('data-done');
    });

    // Mark-as-done button state
    document.querySelectorAll('[data-mark-lesson]').forEach(btn => {
      const id = btn.getAttribute('data-mark-lesson');
      const isDone = !!progress[id];
      btn.textContent = isDone ? 'Lecție finalizată ✓' : 'Marchează ca finalizată';
      const row = btn.closest('.mark-done-row');
      if (row) row.classList.toggle('done', isDone);
    });
  };

  // -------- DOM READY --------
  document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
      });
    });

    // Menu toggle (mobile)
    const menuBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
    }

    // Copy code buttons
    document.querySelectorAll('.code-wrap').forEach(wrap => {
      if (wrap.querySelector('.code-copy')) return;
      const btn = document.createElement('button');
      btn.className = 'code-copy';
      btn.setAttribute('aria-label', 'Copiază codul');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      btn.addEventListener('click', () => {
        const code = wrap.querySelector('pre')?.innerText || '';
        navigator.clipboard.writeText(code).then(() => {
          btn.classList.add('copied');
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
          }, 1600);
        });
      });
      wrap.appendChild(btn);
    });

    // Tabs
    document.querySelectorAll('.tabs').forEach(tabs => {
      const btns = tabs.querySelectorAll('.tab-btn');
      const panels = tabs.querySelectorAll('.tab-panel');
      btns.forEach((b, i) => {
        b.addEventListener('click', () => {
          btns.forEach(x => x.classList.remove('active'));
          panels.forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          if (panels[i]) panels[i].classList.add('active');
        });
      });
    });

    // Quiz
    document.querySelectorAll('.quiz').forEach(q => {
      const opts = q.querySelectorAll('.quiz-opt');
      const feedback = q.querySelector('.quiz-feedback');
      opts.forEach(opt => {
        opt.addEventListener('click', () => {
          if (q.classList.contains('answered')) return;
          q.classList.add('answered');
          const correct = opt.getAttribute('data-correct') === 'true';
          opts.forEach(o => {
            o.classList.add('disabled');
            if (o.getAttribute('data-correct') === 'true') o.classList.add('correct');
          });
          if (!correct) opt.classList.add('wrong');
          if (feedback) {
            feedback.classList.add('show');
            feedback.classList.add(correct ? 'ok' : 'ko');
          }
        });
      });
    });

    // Checklist persistence
    document.querySelectorAll('.checklist[data-list-id]').forEach(list => {
      const id = list.getAttribute('data-list-id');
      const key = `${STORAGE.CHECKLIST}-${id}`;
      let state = {};
      try { state = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}

      list.querySelectorAll('li').forEach((li, idx) => {
        const cb = li.querySelector('input[type="checkbox"]');
        if (!cb) return;
        const itemId = cb.id || `${id}-${idx}`;
        if (state[itemId]) { cb.checked = true; li.classList.add('done'); }
        cb.addEventListener('change', () => {
          state[itemId] = cb.checked;
          localStorage.setItem(key, JSON.stringify(state));
          li.classList.toggle('done', cb.checked);
        });
      });
    });

    // Mark-as-done button
    document.querySelectorAll('[data-mark-lesson]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-mark-lesson');
        const p = getProgress();
        markLesson(id, !p[id]);
      });
    });

    // TOC scrollspy
    const tocLinks = document.querySelectorAll('.toc a[href^="#"]');
    if (tocLinks.length) {
      const targets = Array.from(tocLinks).map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            tocLinks.forEach(l => l.classList.remove('active'));
            const match = document.querySelector(`.toc a[href="#${e.target.id}"]`);
            if (match) match.classList.add('active');
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      targets.forEach(t => io.observe(t));
    }

    // Reveal on scroll
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(el => io.observe(el));
    }

    updateProgressUI();
  });

  // expose small API
  window.PBICourse = { markLesson, getProgress, countDone };
})();
