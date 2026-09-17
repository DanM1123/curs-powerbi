/* ==========================================================================
   Session gate · password = session number (1, 2, 3…)
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'curs-oficial-unlock';
  const LOCK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

  const readUnlocked = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.map(Number) : [];
    } catch {
      return [];
    }
  };

  const isUnlocked = (n) => readUnlocked().includes(Number(n));

  const unlock = (n) => {
    const next = Array.from(new Set(readUnlocked().concat(Number(n))));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const sessionFromPath = () => {
    const m = location.pathname.match(/\/s(\d+)(?:\/|$)/i);
    return m ? Number(m[1], 10) : 0;
  };

  const sessionFromHref = (href) => {
    const m = String(href || '').match(/s(\d+)/i);
    return m ? Number(m[1], 10) : 0;
  };

  const pad = (n) => String(n).padStart(2, '0');

  const passwordOk = (n, value) => {
    const v = String(value || '').trim();
    return v === String(n) || v === pad(n);
  };

  const pageSession = sessionFromPath();
  if (pageSession && !isUnlocked(pageSession)) {
    document.documentElement.classList.add('session-locked');
  }

  let resolveOpen;
  const whenOpen = new Promise((res) => { resolveOpen = res; });

  const hubHref = pageSession ? '../../index.html' : 'index.html';

  function closeGate(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  function showGate(n, { onSuccess, showBack }) {
    closeGate(document.querySelector('.session-gate'));

    const wrap = document.createElement('div');
    wrap.className = 'session-gate';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'session-gate-title');
    wrap.innerHTML =
      '<div class="session-gate-card">' +
        '<span class="session-gate-kicker">Sesiunea ' + pad(n) + '</span>' +
        '<h2 id="session-gate-title">Introdu parola</h2>' +
        '<form class="session-gate-form" autocomplete="off">' +
          '<input class="session-gate-input" type="password" inputmode="numeric" name="session-pass" placeholder="Parolă" required />' +
          '<p class="session-gate-error" hidden>Parolă greșită. Încearcă din nou.</p>' +
          '<button class="session-gate-btn" type="submit">Intră</button>' +
        '</form>' +
        (showBack ? '<a class="session-gate-back" href="' + hubHref + '">← Înapoi la sesiuni</a>' : '') +
      '</div>';

    document.body.appendChild(wrap);

    const form = wrap.querySelector('form');
    const input = wrap.querySelector('.session-gate-input');
    const error = wrap.querySelector('.session-gate-error');
    input.focus();

    if (!showBack) {
      wrap.addEventListener('click', (e) => {
        if (e.target === wrap) closeGate(wrap);
      });
      const onEsc = (e) => {
        if (e.key === 'Escape') {
          closeGate(wrap);
          document.removeEventListener('keydown', onEsc);
        }
      };
      document.addEventListener('keydown', onEsc);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!passwordOk(n, input.value)) {
        error.hidden = false;
        wrap.classList.remove('is-shake');
        void wrap.offsetWidth;
        wrap.classList.add('is-shake');
        input.select();
        return;
      }
      unlock(n);
      closeGate(wrap);
      onSuccess();
    });
  }

  function markHubLocks() {
    document.querySelectorAll('.hub-sessions a.hub-go[href]').forEach((a) => {
      const n = sessionFromHref(a.getAttribute('href'));
      const go = a.querySelector('.go');
      if (!n || !go) return;
      if (isUnlocked(n)) {
        a.classList.remove('is-gated');
        go.textContent = 'Start →';
      } else {
        a.classList.add('is-gated');
        go.innerHTML = LOCK_SVG + ' Intră';
      }
    });
  }

  function initHub() {
    const nav = document.querySelector('.hub-sessions');
    if (!nav) return;
    markHubLocks();
    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a.hub-go[href]');
      if (!a || a.classList.contains('is-soon')) return;
      const n = sessionFromHref(a.getAttribute('href'));
      if (!n || isUnlocked(n)) return;
      e.preventDefault();
      showGate(n, {
        showBack: false,
        onSuccess: () => { location.href = a.href; }
      });
    });
  }

  function initPageGate() {
    if (!pageSession) {
      resolveOpen();
      return;
    }
    if (isUnlocked(pageSession)) {
      document.documentElement.classList.remove('session-locked');
      resolveOpen();
      return;
    }
    showGate(pageSession, {
      showBack: true,
      onSuccess: () => {
        document.documentElement.classList.remove('session-locked');
        resolveOpen();
      }
    });
  }

  function boot() {
    initHub();
    initPageGate();
  }

  window.SessionGate = { whenOpen };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
