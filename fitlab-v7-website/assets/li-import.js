/* The Fit Lab — fill your profile from your LinkedIn data file (fix-43).
   The member downloads "Get a copy of your data" from LinkedIn (a ZIP of CSV files) and picks it here.
   The file is read in the browser; nothing is uploaded. They tick what to add, and only that is saved.
   FLImport.open({ me, p, onDone })   me = own profiles row, p = get_profile result (for what's already there) */
(function () {
  'use strict';
  const ZIPLIB = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const cut = (s, n) => { s = String(s || '').replace(/\r/g, '').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
  let zipP = null;
  const zipLib = () => zipP || (zipP = new Promise((res, rej) => {
    if (window.JSZip) return res(window.JSZip);
    const s = document.createElement('script'); s.src = ZIPLIB; s.async = true;
    s.onload = () => res(window.JSZip); s.onerror = () => { zipP = null; rej(new Error('Couldn\'t open ZIP files right now. Check your connection, or pick the CSV files from inside the ZIP instead.')); };
    document.head.appendChild(s);
  }));

  // ---- CSV (quotes, commas and line breaks inside quotes)
  function csv(text) {
    const rows = []; let row = [], f = '', q = false;
    text = String(text || '').replace(/^﻿/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
      if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  // some LinkedIn files start with a few lines of notes before the header
  function table(text, mustHave) {
    const rows = csv(text);
    const h = rows.findIndex((r) => r.some((c) => norm(c) === norm(mustHave)));
    if (h < 0) return [];
    const head = rows[h].map((c) => norm(c));
    return rows.slice(h + 1).filter((r) => r.some((c) => String(c).trim())).map((r) => Object.fromEntries(head.map((k, i) => [k, String(r[i] ?? '').trim()])));
  }

  const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
  // "Jan 2020", "January 2020", "2020", "2020-01", "01/2020", "15 Jan 2020" → 2020-01-01
  function ym(s) {
    s = String(s || '').trim().toLowerCase(); if (!s) return null;
    let m = s.match(/([a-z]{3,9})\.?\s+(\d{4})/);
    const mo = m && (MON[m[1].slice(0, 4)] || MON[m[1].slice(0, 3)]);
    if (mo) return `${m[2]}-${String(mo).padStart(2, '0')}-01`;
    m = s.match(/^(\d{4})-(\d{1,2})/); if (m) return `${m[1]}-${m[2].padStart(2, '0')}-01`;
    m = s.match(/^(\d{1,2})\/(\d{4})$/); if (m) return `${m[2]}-${m[1].padStart(2, '0')}-01`;
    m = s.match(/^(\d{1,2})\/\d{1,2}\/(\d{4})$/); if (m) return `${m[2]}-${m[1].padStart(2, '0')}-01`;
    m = s.match(/(\d{4})/); if (m) return `${m[1]}-01-01`;
    return null;
  }
  const yr = (s) => { const d = ym(s); const y = d ? +d.slice(0, 4) : null; return y && y >= 1950 && y <= 2100 ? y : null; };
  const nice = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '';

  const WANT = { 'profile.csv': ['profile', 'first name'], 'positions.csv': ['positions', 'company name'], 'education.csv': ['education', 'school name'],
    'skills.csv': ['skills', 'name'], 'certifications.csv': ['certs', 'name'], 'languages.csv': ['langs', 'name'] };

  async function read(files) {
    const out = { profile: [], positions: [], education: [], skills: [], certs: [], langs: [] };
    let found = 0;
    const take = (name, text) => { const k = WANT[name.split('/').pop().toLowerCase()]; if (!k) return; out[k[0]] = table(text, k[1]); found++; };
    for (const f of files) {
      if (/\.zip$/i.test(f.name) || f.type === 'application/zip' || f.type === 'application/x-zip-compressed') {
        const JSZip = await zipLib();
        const z = await JSZip.loadAsync(f);
        for (const e of Object.values(z.files)) if (!e.dir && /\.csv$/i.test(e.name) && WANT[e.name.split('/').pop().toLowerCase()]) take(e.name, await e.async('string'));
      } else if (/\.csv$/i.test(f.name)) take(f.name, await f.text());
    }
    if (!found) throw new Error('No profile files found. Pick the ZIP LinkedIn emailed you, or the CSV files inside it (Profile, Positions, Education, Skills, Certifications, Languages).');
    return out;
  }

  // ---- turn the files into tickable items, marking what's already on the profile
  function build(d, me, p) {
    const has = {
      exp: new Set((p.experience || []).map((e) => norm(e.title) + '|' + norm(e.organization))),
      edu: new Set((p.education || []).map((e) => norm(e.school) + '|' + norm(e.degree))),
      cred: new Set((p.credentials || []).map((e) => norm(e.name))),
      skill: new Set((p.skills || []).map((e) => norm(e.name))),
      lang: new Set((me.languages || []).map(norm)),
    };
    const items = [];
    const pr = d.profile[0] || {};
    const fileName = [pr['first name'], pr['last name']].filter(Boolean).join(' ');
    if (pr.headline) items.push({ sec: 'intro', k: 'headline', label: 'Headline', sub: cut(pr.headline, 160), val: cut(pr.headline, 160),
      on: !me.headline, note: me.headline ? 'Replaces your current headline' : '' });
    if (pr.summary) items.push({ sec: 'intro', k: 'bio', label: 'About', sub: cut(pr.summary, 180), val: cut(pr.summary, 2600),
      on: (me.bio || '').length < 50, note: (me.bio || '').length >= 50 ? 'Replaces your current About' : '' });
    const geo = String(pr['geo location'] || '').split(',').map((x) => x.trim()).filter(Boolean);
    if (geo.length && !/area$/i.test(geo[0])) {
      const loc = { city: geo[0], state: geo.length >= 3 ? geo[geo.length - 2] : null, country: geo.length >= 2 ? geo[geo.length - 1] : null };
      const same = norm(me.city) === norm(loc.city);
      if (!same) items.push({ sec: 'intro', k: 'loc', label: 'Location', sub: geo.join(', '), val: loc, on: !me.city, note: me.city ? 'Replaces ' + [me.city, me.state || me.district, me.country].filter(Boolean).join(', ') : '' });
    }
    d.positions.forEach((r) => {
      const title = cut(r.title, 100), org = cut(r['company name'], 120), start = ym(r['started on']), end = ym(r['finished on']);
      if (!title || !org) return;
      const dup = has.exp.has(norm(title) + '|' + norm(org));
      items.push({ sec: 'exp', label: title, sub: [org, [nice(start), end ? nice(end) : start ? 'Present' : ''].filter(Boolean).join(' – '), r.location].filter(Boolean).join(' · '),
        on: !dup && !!start, off: !start ? 'No start date in the file — add this one by hand' : '', note: dup ? 'Already on your profile' : '',
        row: { title, organization: org, location: cut(r.location, 120) || null, start_date: start, end_date: end, description: cut(r.description, 2000) || null } });
    });
    d.education.forEach((r) => {
      const school = cut(r['school name'], 150); if (!school || school.length < 2) return;
      const degree = cut(r['degree name'], 150) || null;
      const dup = has.edu.has(norm(school) + '|' + norm(degree));
      const desc = [r.notes, r.activities ? 'Activities: ' + r.activities : ''].filter(Boolean).join('\n\n');
      const sy = yr(r['start date']), ey = yr(r['end date']);
      items.push({ sec: 'edu', label: school, sub: [degree, [sy, ey].filter(Boolean).join(' – ')].filter(Boolean).join(' · '), on: !dup, note: dup ? 'Already on your profile' : '',
        row: { school, degree, start_year: sy, end_year: ey, description: cut(desc, 1500) || null } });
    });
    d.certs.forEach((r) => {
      const name = cut(r.name, 150), issuer = cut(r.authority, 150); if (!name || name.length < 2) return;
      const dup = has.cred.has(norm(name));
      const url = /^https?:\/\//i.test(r.url || '') ? r.url.slice(0, 500) : null;
      items.push({ sec: 'cred', label: name, sub: [issuer, nice(ym(r['started on'])), r['license number'] ? 'No. ' + r['license number'] : ''].filter(Boolean).join(' · '),
        on: !dup && issuer.length >= 2, off: issuer.length < 2 ? 'No issuing organisation in the file — add this one by hand' : '', note: dup ? 'Already on your profile' : '',
        row: { name, issuer, issue_date: ym(r['started on']), expiry_date: ym(r['finished on']), credential_id: cut(r['license number'], 80) || null, credential_url: url } });
    });
    let room = 50 - (p.skills || []).length;
    d.skills.forEach((r) => {
      const name = cut(r.name, 60); if (!name || name.length < 2) return;
      const dup = has.skill.has(norm(name)); if (!dup) has.skill.add(norm(name));
      const on = !dup && room > 0; if (on) room--;
      items.push({ sec: 'skill', label: name, on, note: dup ? 'Already on your profile' : '', off: !dup && !on ? 'You can list up to 50 skills' : '', row: { name } });
    });
    d.langs.forEach((r) => {
      const name = cut(r.name, 30); if (!name) return;
      const dup = has.lang.has(norm(name)); if (!dup) has.lang.add(norm(name));
      items.push({ sec: 'lang', label: name, sub: r.proficiency || '', on: !dup, note: dup ? 'Already on your profile' : '', val: name });
    });
    // a quick check that the file belongs to this member
    const a = norm(fileName).split(' ').filter((x) => x.length > 1), b = new Set(norm(me.full_name).split(' '));
    const nameOk = !a.length || a.some((x) => b.has(x));
    return { items, fileName, nameOk };
  }

  const SECS = [['intro', 'Intro', 'edit'], ['exp', 'Experience', 'briefcase'], ['edu', 'Education', 'school'], ['cred', 'Licences & certifications', 'award'],
    ['skill', 'Skills', 'sparkles'], ['lang', 'Languages', 'globe']];

  async function save(items, me) {
    const sb = window.sb; const pick = items.filter((x) => x.on && !x.off);
    let added = 0; const failed = [];
    const upd = {};
    pick.filter((x) => x.sec === 'intro').forEach((x) => { if (x.k === 'loc') Object.assign(upd, { city: x.val.city || null, state: x.val.state || null, country: x.val.country || null, district: null, subdistrict: null }); else upd[x.k] = x.val; });
    const langs = pick.filter((x) => x.sec === 'lang').map((x) => x.val);
    if (langs.length) upd.languages = [...new Set([...(me.languages || []), ...langs])].slice(0, 12);
    if (Object.keys(upd).length) {
      const { error } = await sb.from('profiles').update(upd).eq('id', me.id);
      if (error) failed.push(['Intro', window.FL.friendly(error)]); else added += pick.filter((x) => x.sec === 'intro' || x.sec === 'lang').length;
    }
    const TABLE = { exp: 'work_experience', edu: 'education', cred: 'credentials', skill: 'skills' };
    let sort = 1000;
    for (const x of pick.filter((i) => TABLE[i.sec])) {
      const row = { ...x.row, user_id: me.id }; if (x.sec === 'skill') row.sort_order = sort++;
      const { error } = await sb.from(TABLE[x.sec]).insert(row);
      if (error) failed.push([x.label, window.FL.friendly(error)]); else added++;
    }
    return { added, failed };
  }

  function open({ me, p, onDone }) {
    const FL = window.FL; const I = (n, s) => FL.icon(n, s);
    const m = FL.modal({ title: 'Import from LinkedIn', wide: true, body: `
      <div class="lii">
        <p style="margin:0 0 14px;line-height:1.6">Bring your experience, education, licences, skills and languages across in a minute. You choose what's added.</p>
        <ol class="lii-steps">
          <li>On LinkedIn, open <b>Me → Settings &amp; Privacy → Data privacy → Get a copy of your data</b>.</li>
          <li>Choose <b>Want something in particular?</b> and tick <b>Profile, Positions, Education, Skills, Certifications</b> and <b>Languages</b>. Then <b>Request archive</b>.</li>
          <li>LinkedIn emails you a download link, usually within 10 minutes. Download the ZIP file.</li>
          <li>Pick the ZIP here — or the CSV files from inside it.</li>
        </ol>
        <label class="lii-drop" for="liiFile">${I('upload', 22)}<span><b>Choose your LinkedIn file</b><small>ZIP or CSV · read on your device, never uploaded</small></span>
          <input type="file" id="liiFile" accept=".zip,.csv,application/zip,text/csv" multiple hidden></label>
        <div class="err hidden" id="liiErr"></div>
      </div>`, foot: '<button class="pill ghost" data-close>Cancel</button>' });
    const err = m.q('#liiErr');
    m.q('[data-close]').onclick = m.close;
    // "Confirmed with LinkedIn": sign in to LinkedIn once (only when LinkedIn sign-in is switched on)
    FL.linkedinReady().then((ok) => {
      if (!ok || !m.el.isConnected || !m.q('.lii-steps')) return;
      const box = document.createElement('div'); box.className = 'lii-confirm';
      box.innerHTML = me.linkedin_confirmed_at ? `${I('check', 17)}<span>Your profile is confirmed with LinkedIn.</span>`
        : `<span><b>Confirm it's you</b><small>Sign in to LinkedIn once and your profile shows “Confirmed with LinkedIn”.</small></span><button type="button" class="pill sm" data-conf>Confirm with LinkedIn</button>`;
      m.q('.lii').appendChild(box);
      const b = box.querySelector('[data-conf]');
      if (b) b.onclick = async () => {
        FL.busy(b, true, 'Opening LinkedIn…');
        const { error } = await window.sb.auth.linkIdentity({ provider: 'linkedin_oidc', options: { redirectTo: location.origin + '/profile?li=confirm' } });
        if (error) { FL.busy(b, false); FL.toast(FL.friendly(error), 'err'); }
      };
    });
    m.q('#liiFile').onchange = async (e) => {
      const files = [...e.target.files]; if (!files.length) return;
      err.classList.add('hidden');
      const drop = m.q('.lii-drop'); drop.classList.add('busy'); drop.querySelector('b').textContent = 'Reading your file…';
      try {
        const data = await read(files);
        review(m, build(data, me, p), me, onDone);
      } catch (ex) {
        drop.classList.remove('busy'); drop.querySelector('b').textContent = 'Choose your LinkedIn file';
        err.textContent = ex && ex.message || 'Couldn\'t read that file.'; err.classList.remove('hidden');
      }
      e.target.value = '';
    };
    return m;
  }

  function review(m, res, me, onDone) {
    const FL = window.FL; const I = (n, s) => FL.icon(n, s);
    const { items } = res;
    const body = m.el.querySelector('.mdl-body') || m.el;
    const count = () => items.filter((x) => x.on && !x.off).length;
    const secs = SECS.map(([k, label, ic]) => {
      const list = items.map((x, i) => [x, i]).filter(([x]) => x.sec === k);
      if (!list.length) return '';
      const n = list.filter(([x]) => !x.off && !(x.note === 'Already on your profile')).length;
      return `<section class="lii-sec"><div class="lii-h">${I(ic, 17)}<b>${esc(label)}</b><span class="muted t-xs">${list.length}</span>
          ${n > 1 ? `<button type="button" class="txt-btn t-xs" data-all="${k}">Select all</button>` : ''}</div>
        <div class="${k === 'skill' || k === 'lang' ? 'lii-chips' : 'lii-list'}">${list.map(([x, i]) => k === 'skill' || k === 'lang'
          ? `<label class="lii-chip${x.off || x.note ? ' dim' : ''}" title="${esc(x.off || x.note || '')}"><input type="checkbox" data-i="${i}" ${x.on ? 'checked' : ''} ${x.off ? 'disabled' : ''}><span>${esc(x.label)}</span></label>`
          : `<label class="lii-row${x.off ? ' dim' : ''}"><input type="checkbox" data-i="${i}" ${x.on ? 'checked' : ''} ${x.off ? 'disabled' : ''}>
              <span class="lii-t"><b>${esc(x.label)}</b>${x.sub ? `<small>${esc(x.sub)}</small>` : ''}${x.off || x.note ? `<em>${esc(x.off || x.note)}</em>` : ''}</span></label>`).join('')}</div></section>`;
    }).join('');
    body.innerHTML = `<div class="lii">
      ${res.nameOk ? '' : `<div class="lii-warn">${I('help', 17)}<span>This file is for <b>${esc(res.fileName)}</b>. Only import your own LinkedIn data.</span></div>`}
      ${items.length ? `<p class="t-sm muted" style="margin:0 0 6px">Tick what to add. Things already on your profile are left unticked.</p>${secs}`
        : '<p>We couldn\'t find anything to add in this file.</p>'}
      <div class="err hidden" id="liiErr2"></div></div>`;
    const foot = m.el.querySelector('.mdl-foot');
    const paint = () => { const n = count(); foot.innerHTML = `<button class="pill ghost" data-close>Cancel</button><button class="pill solid" data-go ${n ? '' : 'disabled'}>${n ? `Add ${n} item${n === 1 ? '' : 's'}` : 'Nothing ticked'}</button>`;
      foot.querySelector('[data-close]').onclick = m.close; foot.querySelector('[data-go]').onclick = go; };
    body.addEventListener('change', (e) => { const cb = e.target.closest('input[data-i]'); if (!cb) return; items[+cb.dataset.i].on = cb.checked; paint(); });
    body.addEventListener('click', (e) => { const b = e.target.closest('[data-all]'); if (!b) return;
      body.querySelectorAll('input[data-i]').forEach((cb) => { const x = items[+cb.dataset.i]; if (x.sec === b.dataset.all && !x.off) { x.on = true; cb.checked = true; } }); paint(); });
    async function go(e) {
      FL.busy(e.target, true, 'Adding…');
      const r = await save(items, me);
      FL.busy(e.target, false);
      if (r.failed.length) {
        const er = body.querySelector('#liiErr2');
        er.innerHTML = `${r.added ? `Added ${r.added}. ` : ''}These couldn't be added:<ul style="margin:6px 0 0;padding-left:18px">${r.failed.slice(0, 6).map(([l, why]) => `<li><b>${esc(l)}</b> — ${esc(why)}</li>`).join('')}</ul>`;
        er.classList.remove('hidden'); er.scrollIntoView({ block: 'nearest' });
        r.failed.forEach(([l]) => { const x = items.find((i) => i.label === l); if (x) x.on = true; });
        items.forEach((x) => { if (!r.failed.some(([l]) => l === x.label)) x.on = false; });
        body.querySelectorAll('input[data-i]').forEach((cb) => { cb.checked = items[+cb.dataset.i].on; });
        paint();
        if (onDone && r.added) onDone(r);
        return;
      }
      m.close(); FL.toast(`Added ${r.added} item${r.added === 1 ? '' : 's'} to your profile`, 'ok');
      if (onDone) onDone(r);
    }
    paint();
  }

  window.FLImport = { open, _test: { csv, table, ym, build } };
})();
