/* ==========================================================================
   Atelier de raport · povestea raportului
   Înainte de grafice: cine citește, ce decizie ia, ce întrebări are pe
   fiecare pagină și ce face cu răspunsurile. Totul în limbajul afacerii.
   Banca de întrebări și paginile propuse pornesc de la datele încărcate.
   ========================================================================== */
(function () {
  'use strict';

  const A = (window.Atelier = window.Atelier || {});

  /* ---------- tipurile de răspuns (legătura cu familiile de vizuale) ---------- */
  const KINDS = [
    { id: 'cat', label: 'Cât?', hint: 'o cifră, un total, o rată', fams: ['kpi'] },
    { id: 'cmp', label: 'Cine e primul?', hint: 'comparație, clasament', fams: ['comp'] },
    { id: 'time', label: 'Cum evoluează?', hint: 'schimbarea în timp', fams: ['time'] },
    { id: 'part', label: 'Din ce e format?', hint: 'ponderi, mix', fams: ['part'] },
    { id: 'why', label: 'Ce a dus la rezultat?', hint: 'contribuții, cauze probabile', fams: ['flow', 'ai'] },
    { id: 'rel', label: 'Merg împreună?', hint: 'legătura dintre două cifre', fams: ['rel'] },
    { id: 'geo', label: 'Unde?', hint: 'locul contează', fams: ['geo'] },
    { id: 'det', label: 'Care exact?', hint: 'liste, cifre exacte', fams: ['detail'] }
  ];
  const kindOf = (id) => KINDS.find((k) => k.id === id) || KINDS[0];

  const W = {
    cat: { label: 'Cât?', sub: 'performanța pe scurt', icon: 'coins' },
    who: { label: 'Cine?', sub: 'clienții', icon: 'users' },
    what: { label: 'Ce?', sub: 'produsele, serviciile', icon: 'box' },
    where: { label: 'Unde?', sub: 'locațiile', icon: 'pin' },
    when: { label: 'Când?', sub: 'timpul', icon: 'calendar' },
    how: { label: 'Cum?', sub: 'canale, calitate', icon: 'filter' },
    other: { label: 'Despre ce?', sub: 'alte descrieri', icon: 'table' }
  };

  const ucfirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

  /* ---------- banca de întrebări, din date ---------- */
  function questionBank(m) {
    const D = A.Data;
    const R = m.R, n = R.noun, F = m.fact.name;
    const nArt = /[ie]$/.test(n) ? n + 'le' : n; // vânzări → vânzările
    const vn = R.valueNoun || n; // ce se adună: vânzări, încasări
    const out = [];
    const fl = (id) => (id && m.fields.get(id) ? `${m.fields.get(id).table}[${m.fields.get(id).col}]` : null);
    const add = (w, kind, text, uses) => out.push({ w, kind, text, uses: (uses || []).filter(Boolean) });
    const val = R.value ? `${F}[${R.value.name}]` : `${F} (rânduri)`;
    const word = (id) => D.human(m.fields.get(id).col).toLowerCase();
    const catIn = (dim) => dim && m.cats.find((c) => m.fields.get(c).table === dim.t.name);
    const t = m.time || {};

    add('cat', 'cat', vn === 'încasări' ? 'Cât am încasat în total?' : `Cât am realizat în total din ${vn}?`, [val]);
    add('cat', 'cat', `Câte ${n} am avut?`, [`${F} (numărul de rânduri)`]);
    if (R.value) add('cat', 'cat', `Cât valorează, în medie, o ${R.unit}?`, [val]);
    if (m.years.length >= 2) add('cat', 'cat', 'Suntem peste sau sub anul trecut?', [val, fl(t.year)]);

    if (R.customer) {
      add('who', 'cmp', `Care sunt cei mai importanți ${R.customerNoun}?`, [fl(R.customerName), val]);
      add('who', 'cat', `Câți ${R.customerNoun} diferiți avem?`, [`${F}[${R.customer.rel.from.col}]`]);
      const c = catIn(R.customer);
      if (c) add('who', 'part', `Ce pondere are fiecare ${word(c)} din ${vn}?`, [fl(c), val]);
      if (m.measures.has('avg')) add('who', 'rel', `Care ${R.customerNoun} apar des, dar aduc puțin, și care rar, dar mult?`, [fl(R.customerName)]);
    }
    if (R.product) {
      add('what', 'cmp', `Ce ${R.productNoun} aduc cele mai multe ${vn}?`, [fl(R.productName), val]);
      const c = catIn(R.product);
      if (c) add('what', 'part', `Ce ${word(c)} contează cel mai mult și ce conține?`, [fl(c), fl(R.productName)]);
      if (R.discount) add('what', 'cmp', 'Se vinde mai mult când dăm discount?', [`${F}[${R.discount.name}]`]);
    }
    if (R.location) {
      add('where', 'cmp', `Care ${R.locationNoun} merg cel mai bine?`, [fl(R.locationName), val]);
      const c = catIn(R.location);
      if (c) add('where', 'cmp', `Ce ${word(c)} aduce cele mai multe ${vn}?`, [fl(c), val]);
      if (R.geo) add('where', 'geo', `Unde sunt, pe hartă, cele mai puternice ${R.locationNoun}?`, [fl(R.geo.lat), fl(R.geo.lon)]);
    }
    if (t.month) {
      add('when', 'time', `Cum evoluează ${nArt} lună de lună?`, [fl(t.month), val]);
      if (t.weekday) add('when', 'cmp', `În ce zile ale săptămânii avem cele mai multe ${n}?`, [fl(t.weekday)]);
      if (m.years.length >= 2) {
        add('when', 'time', 'Se repetă aceleași vârfuri în fiecare an?', [fl(t.month), fl(t.year)]);
        add('when', 'why', 'Ce a dus la creșterea sau scăderea față de anul trecut?', [fl(t.year), fl(m.cats[0])]);
      }
    }
    if (R.channel) add('how', 'part', `Ce pondere are fiecare ${D.human(R.channel.name).toLowerCase()} din ${n}?`, [`${F}[${R.channel.name}]`]);
    if (R.status) {
      const bad = `statusul „${R.status.bad.join(' / ')}”`;
      add('how', 'cat', `Ce procent din ${n} au ${bad}?`, [`${F}[${R.status.col.name}]`]);
      add('how', 'cmp', `Unde apar cele mai multe cazuri cu ${bad}?`, [`${F}[${R.status.col.name}]`, fl(m.cats[0])]);
      add('how', 'why', `Ce face ca o ${R.unit} să ajungă la ${bad}?`, [`${F}[${R.status.col.name}]`]);
    }
    // alte dimensiuni, fără rol cunoscut
    const known = [R.customer, R.product, R.location].filter(Boolean).map((d) => d.t.name);
    m.tables.filter((x) => x.modelRole === 'dim' && x !== m.calendar && !known.includes(x.name)).forEach((x) => {
      const c = m.cats.find((id) => m.fields.get(id).table === x.name);
      if (c) add('other', 'cmp', `Cum se împart ${n} pe ${word(c)}?`, [fl(c), val]);
    });
    if (R.productName || m.names[0]) add('cat', 'det', `Care sunt cifrele exacte pentru fiecare ${R.productName ? D.singular(m.fields.get(R.productName).table) : 'rând'}?`, [fl(R.productName || m.names[0])]);
    return out;
  }

  /* ---------- pagini propuse ---------- */
  function pageTemplates(m) {
    const R = m.R, n = R.noun;
    const nArt = /[ie]$/.test(n) ? n + 'le' : n;
    const bank = questionBank(m);
    const pick = (pred, max) => bank.filter(pred).slice(0, max || 5).map((q) => ({ text: q.text, kind: q.kind }));
    const out = [];
    out.push({
      id: 'overview', name: 'Prezentare generală', audience: 'Directorul general',
      purpose: `Cum stăm cu ${nArt}, dintr-o privire?`,
      action: 'Vede unde e o problemă și decide pe ce pagină intră mai în detaliu.',
      qs: pick((q) => q.w === 'cat' && q.kind === 'cat', 3).concat(pick((q) => q.w === 'when' && q.kind === 'time', 1)).concat(pick((q) => (q.w === 'what' || q.w === 'where') && q.kind === 'cmp', 1))
    });
    if (m.time && m.time.month) out.push({ id: 'time', name: 'Evoluție în timp', audience: 'Managerul de vânzări', purpose: `Când avem ${n} și cum se schimbă?`, action: 'Planifică stocurile, campaniile și personalul pentru perioadele de vârf.', qs: pick((q) => q.w === 'when') });
    if (R.customer) out.push({ id: 'cust', name: ucfirst(R.customerNoun), audience: 'Echipa de marketing', purpose: `Cine sunt ${/i$/.test(R.customerNoun) ? R.customerNoun + 'i' : R.customerNoun} noștri și cât valorează?`, action: 'Alege cui se adresează următoarea campanie și pe cine încearcă să păstreze.', qs: pick((q) => q.w === 'who') });
    if (R.product) out.push({ id: 'prod', name: ucfirst(R.productNoun), audience: 'Managerul de categorie', purpose: 'Ce vindem și ce contează cu adevărat?', action: 'Decide ce promovează, ce reduce și ce scoate din ofertă.', qs: pick((q) => q.w === 'what') });
    if (R.location) out.push({ id: 'loc', name: ucfirst(R.locationNoun), audience: 'Managerul de rețea', purpose: 'Unde merge bine și unde nu?', action: 'Decide unde trimite sprijin, oameni sau buget.', qs: pick((q) => q.w === 'where') });
    if (R.status) out.push({ id: 'quality', name: `Calitate · ${R.status.bad[0]}`, audience: 'Echipa operațională', purpose: `Cât pierdem prin ${n} cu statusul „${R.status.bad.join(' / ')}” și unde?`, action: 'Află unde să intervină ca să reducă pierderile.', qs: pick((q) => q.w === 'how') });
    out.push({ id: 'detail', name: 'Detaliu', audience: 'Analistul', purpose: 'Care sunt cifrele exacte, pentru cine vrea să verifice?', action: 'Găsește rândul exact și îl folosește mai departe (export, discuție).', qs: pick((q) => q.kind === 'det', 2).concat(m.cats[0] ? [{ text: `Cum arată fiecare ${A.Data.human(m.fields.get(m.cats[0]).col).toLowerCase()} pe ani și luni?`, kind: 'det' }] : []) });
    return out.filter((t) => t.qs.length);
  }

  /* ---------- modulul de interfață ---------- */
  A.Story = function (ctx) {
    const D = A.Data;
    const esc = ctx.esc, icon = ctx.icon;
    const ui = { sug: false, confirmDel: null };
    const S = () => ctx.S, M = () => ctx.M;
    const page = () => ctx.page();

    const AUD = () => {
      const R = M().R;
      return ['Directorul general', 'Managerul de vânzări', 'Echipa de marketing', R.location ? `Managerul de ${D.singular(R.location.t.name)}` : 'Managerul regional', 'Echipa financiară'];
    };
    const kindSel = (q) => `<select data-st-qk="${esc(q.id)}" title="Ce fel de răspuns așteaptă cititorul">${KINDS.map((k) => `<option value="${k.id}" ${k.id === q.kind ? 'selected' : ''}>${esc(k.label)}</option>`).join('')}</select>`;

    /* întrebări sugerate pentru pagină: întâi cele ale paginii-șablon, apoi restul băncii */
    function suggestions(p) {
      const bank = questionBank(M());
      const tp = p.tpl && pageTemplates(M()).find((x) => x.id === p.tpl);
      const have = new Set((p.questions || []).map((q) => D.norm(q.text)));
      const first = tp ? tp.qs.map((q) => q.text) : [];
      return bank.map((q, i) => Object.assign({ i }, q)).filter((q) => !have.has(D.norm(q.text)))
        .sort((a, b) => (first.includes(b.text) ? 1 : 0) - (first.includes(a.text) ? 1 : 0));
    }

    const delBtn = (p) => (S().pages.length > 1 ? `<button class="atl-btn atl-btn-xs atl-btn-ghost${ui.confirmDel === p.id ? ' is-danger' : ''}" data-st-act="del" data-page="${esc(p.id)}" aria-label="Șterge pagina">${icon('trash')}${ui.confirmDel === p.id ? ' Sigur?' : ''}</button>` : '');
    function pageCard(p, i) {
      const act = p.id === S().active;
      const qs = p.questions || [];
      if (!act) {
        return `<article class="atl-st-page" data-st-open="${esc(p.id)}" tabindex="0">
          <header class="atl-st-ph"><span class="atl-st-n">${i + 1}</span><div class="atl-st-pt"><b>${esc(p.name)}</b><span>${esc((qs.find((q) => q.text.trim()) || {}).text || 'Fără întrebări încă')}</span></div><em>${qs.length} ${qs.length === 1 ? 'întrebare' : 'întrebări'}</em>${delBtn(p)}</header>
        </article>`;
      }
      const fields = ctx.filterFields();
      const wf = p.wantFilters || [];
      const sug = ui.sug ? suggestions(p) : [];
      return `<article class="atl-st-page is-active">
        <header class="atl-st-ph"><span class="atl-st-n">${i + 1}</span><input class="atl-st-name" data-st-p="name" value="${esc(p.name)}" aria-label="Numele paginii"/>
          <div class="atl-st-pa">
            <button class="atl-icon-btn atl-sm" data-st-act="up" ${i === 0 ? 'disabled' : ''} title="Mută mai sus" aria-label="Mută mai sus">${icon('up')}</button>
            <button class="atl-icon-btn atl-sm" data-st-act="down" ${i === S().pages.length - 1 ? 'disabled' : ''} title="Mută mai jos" aria-label="Mută mai jos">${icon('down')}</button>
            ${delBtn(p)}
          </div></header>
        <ol class="atl-st-steps">
          <li><div class="atl-st-lbl"><b>Pentru cine e pagina?</b><span>Cine o deschide și ce știe deja.</span></div>
            <input data-st-p="audience" value="${esc(p.audience || '')}" placeholder="${esc(S().story.audience || 'ex. Managerul de vânzări')}" list="atl-st-aud"/></li>
          <li><div class="atl-st-lbl"><b>Ce răspunsuri vrea să primească cititorul?</b><span>Scrie întrebările cum le-ar pune el și alege ce fel de răspuns așteaptă.</span></div>
            <div class="atl-st-qs">${qs.map((q) => `<div class="atl-st-q">${kindSel(q)}<input data-st-qt="${esc(q.id)}" value="${esc(q.text)}" placeholder="ex. Care magazin vinde cel mai mult?"/><button class="atl-icon-btn atl-sm" data-st-act="qdel" data-q="${esc(q.id)}" aria-label="Șterge întrebarea">${icon('x')}</button></div>`).join('')}
              <div class="atl-st-qbtns"><button class="atl-btn atl-btn-xs" data-st-act="qadd">${icon('plus')} Întrebare</button><button class="atl-btn atl-btn-xs${ui.sug ? ' is-on' : ''}" data-st-act="sug">${icon('bulb')} ${ui.sug ? 'Ascunde sugestiile' : 'Sugerează întrebări'}</button></div>
              ${ui.sug ? `<ul class="atl-st-sug">${sug.slice(0, 10).map((q) => `<li><button data-st-act="bank" data-i="${q.i}" aria-label="Adaugă">${icon('plus')}</button><span>${esc(q.text)}<em>${esc(kindOf(q.kind).label)}</em></span></li>`).join('') || '<li class="atl-muted">Ai luat deja toate sugestiile.</li>'}</ul>` : ''}
            </div></li>
          <li><div class="atl-st-lbl"><b>După ce vrea să filtreze?</b><span>Ce ar alege singur: perioada, zona, categoria.</span></div>
            <div class="atl-st-wf">${fields.map((id) => { const f = M().fields.get(id); return `<button class="${wf.includes(id) ? 'on' : ''}" data-st-wf="${esc(id)}" title="${esc(f.table)}[${esc(f.col)}]">${esc(f.qlabel || D.human(f.col))}</button>`; }).join('')}</div></li>
        </ol>
      </article>`;
    }
    const arcHtml = () => S().pages.map((p, i) => `<button class="${p.id === S().active ? 'on' : ''}" data-st-open="${esc(p.id)}"><span>${i + 1}</span>${esc(p.name)}</button>${i < S().pages.length - 1 ? `<i>${icon('arrow')}</i>` : ''}`).join('') + `<button class="atl-st-arc-add" data-st-act="add" title="Pagină nouă" aria-label="Pagină nouă">${icon('plus')}</button>`;
    function refresh() {
      const arc = document.querySelector('.atl-st-arc');
      if (arc) arc.innerHTML = arcHtml();
    }

    function view() {
      const s = S();
      const nQ = s.pages.reduce((a, p) => a + (p.questions || []).filter((q) => q.text.trim()).length, 0);
      return `<div class="atl-wrap atl-story">
        <header class="atl-head"><h2>Povestea raportului</h2><p>Înainte de grafice: ce vrea să afle cititorul pe fiecare pagină. Fără nume de vizuale, doar întrebări de business.</p></header>
        <datalist id="atl-st-aud">${AUD().map((a) => `<option value="${esc(a)}">`).join('')}</datalist>
        <nav class="atl-st-arc" aria-label="Paginile raportului">${arcHtml()}</nav>
        <div class="atl-st-main">${s.pages.map(pageCard).join('')}</div>
        <div class="atl-next"><a class="atl-btn atl-btn-ghost" href="#model">← Modelare</a><span class="atl-muted atl-small">${s.pages.length} ${s.pages.length === 1 ? 'pagină' : 'pagini'} · ${nQ} ${nQ === 1 ? 'întrebare' : 'întrebări'}</span><a class="atl-btn atl-btn-primary" href="#biblioteca">Alege vizualele →</a></div>
      </div>`;
    }

    /* ---------- acțiuni ---------- */
    const newQ = (text, kind) => ({ id: ctx.uid(), text: text || '', kind: kind || 'cat' });
    function addQs(p, qs) {
      const have = new Set((p.questions || []).map((q) => D.norm(q.text)));
      let n = 0;
      qs.forEach((q) => { if (!have.has(D.norm(q.text))) { p.questions.push(newQ(q.text, q.kind)); n++; } });
      return n;
    }
    function onClick(e) {
      const t = e.target;
      const wf = t.closest('[data-st-wf]');
      if (wf) {
        const p = page(), id = wf.getAttribute('data-st-wf');
        p.wantFilters = (p.wantFilters || []).includes(id) ? p.wantFilters.filter((x) => x !== id) : (p.wantFilters || []).concat(id);
        ctx.save(); ctx.rerender(); return true;
      }
      const op = t.closest('[data-st-open]');
      if (op && !t.closest('[data-st-act]')) { S().active = op.getAttribute('data-st-open'); ui.confirmDel = null; ctx.save(); ctx.rerender(); return true; }
      const el = t.closest('[data-st-act]');
      if (!el) return false;
      const act = el.getAttribute('data-st-act');
      const s = S();
      const p = page();
      const i = s.pages.indexOf(p);
      switch (act) {
        case 'add': ctx.addPage(); break;
        case 'up': if (i > 0) { s.pages.splice(i, 1); s.pages.splice(i - 1, 0, p); } break;
        case 'down': if (i < s.pages.length - 1) { s.pages.splice(i, 1); s.pages.splice(i + 1, 0, p); } break;
        case 'del': {
          const dp = s.pages.find((x) => x.id === el.dataset.page) || p;
          if (ui.confirmDel !== dp.id) { ui.confirmDel = dp.id; setTimeout(() => { ui.confirmDel = null; }, 4000); break; }
          ui.confirmDel = null;
          const di = s.pages.indexOf(dp);
          s.pages = s.pages.filter((x) => x !== dp);
          if (s.active === dp.id) s.active = s.pages[Math.max(0, di - 1)].id;
          break;
        }
        case 'qadd': p.questions.push(newQ('', 'cat')); ctx.save(); ctx.rerender(); { const ins = document.querySelectorAll('[data-st-qt]'); if (ins.length) ins[ins.length - 1].focus(); } return true;
        case 'sug': ui.sug = !ui.sug; break;
        case 'qdel': p.questions = p.questions.filter((q) => q.id !== el.dataset.q); break;
        case 'bank': { const q = questionBank(M())[+el.dataset.i]; if (q && addQs(p, [q])) ctx.toast(`Adăugată în „${p.name}”. Rescrie-o cu cuvintele tale.`); break; }
        default: return false;
      }
      ctx.save();
      ctx.rerender();
      return true;
    }
    function onInput(e) {
      const t = e.target;
      const p = page();
      if (t.matches('[data-st-p]')) { p[t.getAttribute('data-st-p')] = t.value; if (t.getAttribute('data-st-p') === 'name' && !t.value) p.name = 'Pagină'; ctx.save(); return true; }
      if (t.matches('[data-st-s]')) { S().story[t.getAttribute('data-st-s')] = t.value; ctx.save(); return true; }
      if (t.matches('[data-st-qt]')) { const q = p.questions.find((x) => x.id === t.getAttribute('data-st-qt')); if (q) { q.text = t.value; ctx.save(); } return true; }
      return false;
    }
    function onChange(e) {
      const t = e.target;
      if (t.matches('[data-st-qk]')) { const q = page().questions.find((x) => x.id === t.getAttribute('data-st-qk')); if (q) { q.kind = t.value; ctx.save(); ctx.rerender(); } return true; }
      // la ieșirea din câmp, reîmprospătăm doar verificările și firul poveștii (fără să pierdem focusul)
      if (t.matches('[data-st-p], [data-st-qt]')) { refresh(); return true; }
      if (t.matches('[data-st-s]')) return true;
      return false;
    }
    function onKey(e) {
      const op = e.target.closest && e.target.closest('article[data-st-open]');
      if (op && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); S().active = op.getAttribute('data-st-open'); ctx.save(); ctx.rerender(); return true; }
      if (e.key === 'Enter' && e.target.matches('[data-st-qt]')) { e.preventDefault(); page().questions.push(newQ('', 'cat')); ctx.save(); ctx.rerender(); const ins = document.querySelectorAll('[data-st-qt]'); if (ins.length) ins[ins.length - 1].focus(); return true; }
      return false;
    }

    return { view, onClick, onInput, onChange, onKey };
  };

  A.StoryData = { KINDS, kindOf, W, questionBank, pageTemplates };
})();
