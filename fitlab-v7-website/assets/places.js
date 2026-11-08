/* The Fit Lab — location picker (fix-42).
   Country → State → District → Mandal/Tehsil → City, town or village, each a typeahead list.
   India uses the Local Government Directory; other countries use states and cities.
   Anything not in a list can still be typed. Values are saved as plain names.

   const pick = await FLPlaces.mount(el, { value: { country, state, district, subdistrict, city }, levels });
   pick.get() → { country, state, district, subdistrict, city }   (names, or null) */
(function () {
  'use strict';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const KIND = { c: 'City', t: 'Town', v: 'Village' };
  const ALL = ['country', 'state', 'district', 'subdistrict', 'city'];
  const cache = new Map();
  let uid = 0;

  async function children(level, parent) {
    const k = level + ':' + (parent ?? '');
    if (!cache.has(k)) {
      cache.set(k, (async () => {
        if (level === 'country') { try { const c = JSON.parse(localStorage.getItem('fl:geo:c1') || 'null'); if (c && c.length) return c; } catch (_) {} }
        const { data, error } = await window.sb.rpc('geo_children', { p_level: level, p_parent: parent == null ? null : String(parent) });
        if (error) { cache.delete(k); throw error; }
        if (level === 'country' && data && data.length) { try { localStorage.setItem('fl:geo:c1', JSON.stringify(data)); } catch (_) {} }
        return data || [];
      })());
    }
    return cache.get(k);
  }

  function rank(list, q, max = 60) {
    const n = norm(q);
    if (!n) return list.slice(0, max);
    const a = [], b = [];
    for (const it of list) { const t = it._n || (it._n = norm(it.name)); if (t.startsWith(n)) a.push(it); else if (t.includes(' ' + n) || (n.length > 2 && t.includes(n))) b.push(it); if (a.length >= max) break; }
    return a.concat(b).slice(0, max);
  }

  async function mount(el, opts = {}) {
    const v0 = opts.value || {};
    const levels = (opts.levels || ALL).filter((l) => ALL.includes(l));
    const fixedCountry = opts.country || null;   // e.g. 'India' when the country isn't asked
    const id = 'geo' + (++uid);
    const label = {
      country: 'Country', state: 'State', district: 'District', subdistrict: 'Mandal / tehsil / taluk', city: 'City, town or village',
    };
    el.innerHTML = `<div class="geo" id="${id}"><div class="geo-grid">${levels.map((l) => `
      <div class="field geo-f" data-l="${l}">
        <label for="${id}-${l}" id="${id}-${l}-lb">${label[l]}</label>
        <div class="geo-box"><input id="${id}-${l}" autocomplete="off" spellcheck="false" maxlength="80" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-${l}-menu">
          <button type="button" class="geo-x" tabindex="-1" aria-label="Clear" hidden>×</button></div>
        <ul class="geo-menu" id="${id}-${l}-menu" role="listbox" aria-labelledby="${id}-${l}-lb"></ul>
      </div>`).join('')}</div>
      <p class="help geo-hint">Pick from the lists as you type — or just type it if your place isn't listed.</p></div>`;
    const root = el.querySelector('.geo');
    const F = {}; levels.forEach((l) => { const f = root.querySelector(`[data-l="${l}"]`); F[l] = { f, inp: f.querySelector('input'), menu: f.querySelector('.geo-menu'), x: f.querySelector('.geo-x'), lb: f.querySelector('label') }; });

    // the chosen values: { id (null if typed), name }
    const sel = { country: null, state: null, district: null, subdistrict: null, city: null };
    const val = (l) => (sel[l] && sel[l].name) || '';
    const isIndia = () => { const c = sel.country || (fixedCountry ? { id: fixedCountry === 'India' ? 'IN' : null } : null); return !c || c.id === 'IN' || /^india$/i.test(c.name || ''); };
    const countryCode = () => (sel.country && sel.country.id) || (fixedCountry === 'India' || !sel.country ? 'IN' : null);

    function layout() {
      const ind = isIndia();
      ['district', 'subdistrict'].forEach((l) => { if (F[l]) F[l].f.hidden = !ind; });
      if (F.state) F.state.lb.textContent = ind ? 'State / UT' : 'State / province / county';
      levels.forEach((l) => { F[l].inp.value = val(l); F[l].x.hidden = !val(l); });
      // the field after the hidden ones takes the full row when the count is odd
      const shown = levels.filter((l) => !F[l].f.hidden);
      levels.forEach((l) => F[l].f.classList.toggle('wide', shown.length % 2 === 1 && l === shown[shown.length - 1]));
    }

    function clearBelow(l) {
      for (const k of ALL.slice(ALL.indexOf(l) + 1)) sel[k] = null;
    }

    // what list does a level choose from right now?
    async function source(l, q) {
      if (l === 'country') return (await children('country')).map(([id, name, flag]) => ({ id, name, flag }));
      if (l === 'state') { const c = countryCode(); return c ? (await children('state', c)).map(([id, name]) => ({ id, name })) : null; }
      if (l === 'district') return sel.state && sel.state.id ? (await children('district', sel.state.id)).map(([id, name]) => ({ id, name })) : null;
      if (l === 'subdistrict') return sel.district && sel.district.id ? (await children('subdistrict', sel.district.id)).map(([id, name]) => ({ id, name })) : null;
      if (l === 'city') {
        if (sel.subdistrict && sel.subdistrict.id) return (await children('place', 'sub:' + sel.subdistrict.id)).map(([id, name, kind]) => ({ id, name, kind }));
        if (!isIndia() && sel.state && sel.state.id) return (await children('place', 'state:' + sel.state.id)).map(([id, name, kind]) => ({ id, name, kind }));
        // otherwise search the whole country (or state / district) as they type
        const c = countryCode();
        if (!c || norm(q).length < 2) return 'type';
        const { data } = await window.sb.rpc('geo_search', { p_q: q, p_country: c, p_state: sel.state && sel.state.id || null, p_district: sel.district && sel.district.id || null });
        return (data || []).map((x) => ({ ...x, found: true }));
      }
      return null;
    }

    let openL = null, items = [], active = -1, seq = 0, tmr = null;
    function close() {
      if (!openL) return;
      const m = F[openL]; m.menu.classList.remove('open'); m.menu.innerHTML = ''; m.inp.setAttribute('aria-expanded', 'false'); m.inp.removeAttribute('aria-activedescendant');
      openL = null; items = []; active = -1;
    }
    function paint(l, list, q, note) {
      const m = F[l]; items = list || []; active = items.length && norm(q) ? 0 : -1;
      const typed = String(q || '').trim();
      let html = items.map((it, i) => {
        const sub = it.found ? [it.sub, it.dist, it.state].filter(Boolean).join(', ') : it.kind ? KIND[it.kind] : '';
        return `<li role="option" id="${id}-${l}-o${i}" data-i="${i}" class="${i === active ? 'on' : ''}">${it.flag ? `<span class="geo-fl">${esc(it.flag)}</span>` : ''}<span class="geo-nm">${esc(it.name)}</span>${sub ? `<small>${esc(it.found && it.kind !== 'v' ? KIND[it.kind] + ' · ' + sub : sub)}</small>` : ''}</li>`;
      }).join('');
      if (note) html += `<li class="note" aria-disabled="true">${esc(note)}</li>`;
      else if (typed && !items.some((it) => norm(it.name) === norm(typed))) html += `<li class="note" aria-disabled="true">Not listed? Keep “${esc(typed)}” — that's fine.</li>`;
      m.menu.innerHTML = html;
      m.menu.classList.toggle('open', !!html);
      m.inp.setAttribute('aria-expanded', html ? 'true' : 'false');
      openL = html ? l : null;
      if (active >= 0) m.inp.setAttribute('aria-activedescendant', `${id}-${l}-o${active}`);
    }
    async function show(l) {
      const my = ++seq; const q = F[l].inp.value;
      if (openL && openL !== l) close();
      let src;
      try { src = await source(l, q); } catch (_) { src = null; }
      if (my !== seq || document.activeElement !== F[l].inp) return;
      if (src === 'type') return paint(l, [], q, norm(q).length ? 'Keep typing to find your town or village…' : 'Type the first letters of your town or village');
      if (!src) {
        const need = l === 'district' && !val('state') ? 'Choose your state first — or just type the district'
          : l === 'subdistrict' && !val('district') ? 'Choose your district first — or just type it' : '';
        return need ? paint(l, [], '', need) : close();
      }
      paint(l, src[0] && src[0].found ? src : rank(src, q), q);
    }

    function choose(l, it) {
      const prev = sel[l];
      if (it.found) {   // a search result fills the whole address
        sel.state = { id: it.state_id, name: it.state };
        sel.district = it.dist_id ? { id: it.dist_id, name: it.dist } : null;
        sel.subdistrict = it.sub_id ? { id: it.sub_id, name: it.sub } : null;
        sel.city = { id: it.id, name: it.name, kind: it.kind };
      } else {
        sel[l] = { id: it.id, name: it.name, kind: it.kind };
        if (!prev || prev.id !== it.id || norm(prev.name) !== norm(it.name)) clearBelow(l);
      }
      close(); layout();
      const next = levels.slice(levels.indexOf(l) + 1).find((k) => !F[k].f.hidden && !val(k));
      if (next && !it.found) { F[next].inp.focus(); }
    }
    // typed text: match it to the list if it's there, otherwise keep it as typed
    async function commit(l) {
      const t = F[l].inp.value.replace(/\s+/g, ' ').trim();
      if (norm(t) === norm(val(l)) && (sel[l] || !t)) { layout(); return; }
      if (!t) { sel[l] = null; clearBelow(l); layout(); return; }
      let src = null;
      try { src = await source(l, t); } catch (_) {}
      const hit = Array.isArray(src) && src.find((it) => norm(it.name) === norm(t));
      if (hit && !hit.found) return choose(l, hit);
      sel[l] = { id: null, name: t }; clearBelow(l); layout();
    }

    levels.forEach((l) => {
      const { inp, menu, x } = F[l];
      inp.addEventListener('focus', () => show(l));
      inp.addEventListener('input', () => { x.hidden = !inp.value; clearTimeout(tmr); tmr = setTimeout(() => show(l), l === 'city' && !(sel.subdistrict && sel.subdistrict.id) ? 220 : 0); });
      inp.addEventListener('blur', () => setTimeout(() => { if (document.activeElement !== inp) { if (openL === l) close(); commit(l); } }, 120));
      inp.addEventListener('keydown', (e) => {
        if (openL !== l && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { show(l); return; }
        if (openL !== l) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); if (!items.length) return;
          active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
          menu.querySelectorAll('li[data-i]').forEach((li) => li.classList.toggle('on', +li.dataset.i === active));
          const on = menu.querySelector(`li[data-i="${active}"]`); if (on) { on.scrollIntoView({ block: 'nearest' }); inp.setAttribute('aria-activedescendant', on.id); }
        } else if (e.key === 'Enter') {
          e.preventDefault(); if (active >= 0 && items[active]) choose(l, items[active]); else { close(); commit(l); }
        } else if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'Tab' && active >= 0 && items[active] && norm(inp.value) && norm(items[active].name).startsWith(norm(inp.value))) { choose(l, items[active]); }
      });
      // pointerdown, so the choice lands before the input loses focus
      menu.addEventListener('pointerdown', (e) => { const li = e.target.closest('li[data-i]'); if (!li) return; e.preventDefault(); choose(l, items[+li.dataset.i]); });
      x.addEventListener('click', () => { sel[l] = null; clearBelow(l); layout(); inp.focus(); });
    });

    // start from the saved names, then find their list ids
    const start = { country: v0.country || fixedCountry || 'India', state: v0.state, district: v0.district, subdistrict: v0.subdistrict, city: v0.city };
    ALL.forEach((l) => { if (start[l]) sel[l] = { id: null, name: String(start[l]).trim() }; });
    layout();
    try {
      const { data: r } = await window.sb.rpc('geo_resolve', { p_country: start.country, p_state: start.state || null, p_district: start.district || null, p_subdistrict: start.subdistrict || null });
      if (r) {
        if (r.country && sel.country) { const cl = await children('country'); const c = cl.find((x) => x[0] === r.country); sel.country = { id: r.country, name: c ? c[1] : sel.country.name }; }
        // the saved names, tidied to the list's spelling; an old profile with only a district gets its state filled in
        if (r.state && (sel.state || (r.district && sel.district))) sel.state = { id: r.state, name: r.state_name || (sel.state && sel.state.name) };
        if (r.district && sel.district) sel.district = { id: r.district, name: r.district_name || sel.district.name };
        if (r.subdistrict && sel.subdistrict) sel.subdistrict = { id: r.subdistrict, name: r.subdistrict_name || sel.subdistrict.name };
      }
    } catch (_) { /* the lists are a help, not a must */ }
    layout();

    return {
      get() {
        levels.forEach((l) => { const t = F[l].inp.value.replace(/\s+/g, ' ').trim(); if (norm(t) !== norm(val(l))) sel[l] = t ? { id: null, name: t } : null; });
        const ind = isIndia();
        const out = {};
        ALL.forEach((l) => { out[l] = (levels.includes(l) || l === 'country') && val(l) ? val(l) : null; });
        if (!levels.includes('country')) out.country = fixedCountry || out.country;
        if (!ind) { out.district = null; out.subdistrict = null; }
        return out;
      },
      el: root,
    };
  }

  window.FLPlaces = { mount };
})();
