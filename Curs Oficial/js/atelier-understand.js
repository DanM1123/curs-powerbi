/* ==========================================================================
   Atelier de raport · înțelegerea datelor
   Ca și cum ai primi datele unei afaceri pe care nu o cunoști: ce
   înregistrează, despre ce lucruri avem informații, ce știm despre fiecare
   și ce am putea afla. Fără concluzii și fără grafice: acelea vin în Power BI.
   ========================================================================== */
(function () {
  'use strict';

  const A = (window.Atelier = window.Atelier || {});

  A.Understand = function (ctx) {
    const D = A.Data;
    const SD = A.StoryData;
    const esc = ctx.esc, icon = ctx.icon;
    const M = () => ctx.M;
    const nf = (n) => Number(n).toLocaleString('ro-RO');
    const B = (t) => `<b>${esc(t)}</b>`;
    const ucf = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
    const list = (arr) => (arr.length > 1 ? arr.slice(0, -1).join(', ') + ' și ' + arr[arr.length - 1] : (arr[0] || ''));

    const ROLE = {
      who: { q: 'Cine?', w: 'cine', icon: 'users' }, what: { q: 'Ce?', w: 'ce', icon: 'box' }, where: { q: 'Unde?', w: 'unde', icon: 'pin' },
      when: { q: 'Când?', w: 'când', icon: 'calendar' }, other: { q: 'Cu ce? Cum?', w: 'cu ce', icon: 'table' }
    };
    function roleOf(m, t) {
      const R = m.R;
      if (t === m.calendar) return 'when';
      if (R.customer && R.customer.t === t) return 'who';
      if (R.product && R.product.t === t) return 'what';
      if (R.location && R.location.t === t) return 'where';
      return 'other';
    }
    function rowNoun(m, t) {
      if (t === m.calendar) return 'o zi';
      const s = D.singular(t.name);
      return /[ăea]$/.test(s) && !/^(produs|client|magazin|serviciu|pachet|membru|călător|transport)$/.test(s) ? `o ${s}` : `un ${s}`;
    }
    // ce știm despre fiecare rând: atributele, în cuvinte simple
    const attrs = (t) => t.columns.filter((c) => c.role !== 'ignore' && c.role !== 'key').map((c) => D.human(c.name).toLowerCase());

    function entity(m, t, bank) {
      const role = roleOf(m, t);
      const qs = bank.filter((x) => x.w === role).slice(0, 3);
      const title = t === m.calendar ? 'Calendarul' : ucf(D.plural(t.name));
      const known = attrs(t);
      return `<article class="atl-u3-ent">
        <div class="atl-u3-ic">${icon(ROLE[role].icon)}</div>
        <div class="atl-u3-body">
          <h3>${esc(title)} <span>${esc(ROLE[role].q)}</span></h3>
          <p class="atl-u3-meta">Tabelul ${B(t.name)} · un rând = ${esc(rowNoun(m, t))}${t.virtual ? ' · nu există în fișiere, îl creezi în Power BI' : ` · ${nf(t.rowCount)} rânduri`}</p>
          ${known.length ? `<p>Despre fiecare ${esc(t === m.calendar ? 'zi' : D.singular(t.name))} știm: ${esc(list(known))}.</p>` : ''}
          ${qs.length ? `<div class="atl-u3-ask"><b>Ce am putea afla</b><ul>${qs.map((x) => `<li>${esc(x.text)}</li>`).join('')}</ul></div>` : ''}
        </div>
      </article>`;
    }

    function view() {
      const m = M();
      // dosar de afacere pentru un domeniu cunoscut (ex. cinematografe), dacă există
      const brief = (A.Briefs || []).find((b) => b.match(m, D));
      if (brief) return brief.render(m, { D, esc, icon });
      const R = m.R, F = m.fact;
      const n = R.noun;
      const bank = SD.questionBank(m);
      const t = m.time || {};
      let d0 = null, d1 = null;
      if (t.date) { const v = m.flat.map((r) => r[t.date]).filter((x) => x != null); if (v.length) { d0 = Math.min(...v); d1 = Math.max(...v); } }
      const linked = m.rels.filter((r) => r.from.table === F.name).map((r) => m.tableByName[r.to.table]);
      const about = linked.filter((x) => x !== m.calendar).map((x) => `${ROLE[roleOf(m, x)].w} (${D.plural(x.name).toLowerCase()})`);

      const intro = `Imaginează-ți că ai primit datele unei afaceri pe care nu o cunoști. Din ele afli ce face: înregistrează ${B(n)}${d0 ? `, în perioada ${B(D.fmtDate(d0))} – ${B(D.fmtDate(d1))}` : ''}.`
        + (about.length ? ` Pentru fiecare ${esc(R.unit)} știm și ${esc(list(about))}.` : '')
        + ' Aici doar descriem ce avem. Ce spun datele vei descoperi în Power BI.';

      // un rând, spus în cuvinte
      const row = m.flat.find((r) => (!R.customerName || r[R.customerName] != null) && (!R.productName || r[R.productName] != null)) || m.flat[0];
      const show = (id) => (id && row && row[id] != null ? D.displayValue(m, id, row[id]) : null);
      const ex = row ? [
        t.date && show(t.date) ? `pe ${B(show(t.date))}` : '',
        show(R.customerName) ? B(show(R.customerName)) : '',
        show(R.productName) ? B(show(R.productName)) : '',
        show(R.locationName) ? `la ${B(show(R.locationName))}` : '',
        R.value ? `${esc(D.human(R.value.name).toLowerCase())} ${B(D.fmtFull(row[m.fieldId(F.name, R.value.name)]))}` : ''
      ].filter(Boolean).join(', ') : '';

      // evenimentul: ce conține fiecare rând din tabelul de fapte
      const factBits = linked.map((x) => `${ROLE[roleOf(m, x)].w} (din ${x.virtual ? 'calendar' : x.name})`);
      const factOwn = attrs(F);
      const factQs = bank.filter((x) => x.w === 'cat' || x.w === 'how').slice(0, 4);
      const factCard = `<article class="atl-u3-ent is-fact">
        <div class="atl-u3-ic">${icon('coins')}</div>
        <div class="atl-u3-body">
          <h3>${esc(ucf(n))} <span>Ce s-a întâmplat?</span></h3>
          <p class="atl-u3-meta">Tabelul ${B(F.name)} · un rând = o ${esc(R.unit)} · ${nf(F.rowCount)} rânduri</p>
          <p>Fiecare rând e un eveniment al afacerii.${factBits.length ? ` Spune ${esc(list(factBits))}.` : ''}${factOwn.length ? ` Mai conține: ${esc(list(factOwn))}.` : ''}</p>
          ${factQs.length ? `<div class="atl-u3-ask"><b>Ce am putea afla</b><ul>${factQs.map((x) => `<li>${esc(x.text)}</li>`).join('')}</ul></div>` : ''}
        </div>
      </article>`;

      const others = m.tables.filter((x) => x !== F && x.modelRole !== 'other' && !x.virtual);
      const loose = m.tables.filter((x) => x.modelRole === 'other');
      const firstDim = linked.find((x) => x !== m.calendar);

      return `<div class="atl-wrap atl-u2 atl-u3">
        <header class="atl-u2-hero">
          <span class="atl-u2-kicker">${icon('book')} Înțelege afacerea</span>
          <h2>Ce poveste spun datele tale?</h2>
          <p class="atl-u2-intro">${intro}</p>
          ${ex ? `<p class="atl-u2-ex"><span>Un singur rând din date, spus în cuvinte:</span> ${ex}.</p>` : ''}
        </header>
        <section class="atl-u3-list">
          ${factCard}
          ${others.map((x) => entity(m, x, bank)).join('')}
          ${loose.map((x) => `<article class="atl-u3-ent is-loose"><div class="atl-u3-ic">${icon('table')}</div><div class="atl-u3-body"><h3>${esc(x.name)}</h3><p>Conține ${esc(list(attrs(x)))}. Nu e încă clar cum se leagă de ${esc(n)}: vei vedea la Modelare.</p></div></article>`).join('')}
        </section>
        <section class="atl-u2-end">
          <h3>Și acum?</h3>
          <p>Informațiile stau în tabele separate. Ca Power BI să le poată combina, de exemplu ${esc(n)} pe ${esc(firstDim ? D.plural(firstDim.name).toLowerCase() : 'categorii')} și pe luni, trebuie să le legi între ele.</p>
          <div class="atl-next"><a class="atl-btn atl-btn-ghost" href="#date">← Date</a><a class="atl-btn atl-btn-primary" href="#model">Leagă tabelele →</a></div>
        </section>
      </div>`;
    }

    function onClick(e) {
      const g = e.target.closest('[data-u-goto]');
      if (!g) return false;
      const el = document.getElementById(g.getAttribute('data-u-goto'));
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      return true;
    }

    return { view, after() {}, onClick, reset() {} };
  };
})();
