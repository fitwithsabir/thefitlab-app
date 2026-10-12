/* THE FIT LAB ACADEMY — shared client helpers (v7: network shell, themes, moderation UX)
   Requires: config.js and the supabase-js UMD build loaded before this file. */
(function () {
  const cfg = window.FITLAB_CONFIG || {};
  const notConfigured = !cfg.SUPABASE_URL || String(cfg.SUPABASE_URL).startsWith('PASTE');

  if (notConfigured) {
    document.addEventListener('DOMContentLoaded', () => {
      const b = document.createElement('div');
      b.className = 'banner';
      b.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:100;max-width:92vw';
      b.textContent = 'Setup needed: open config.js and paste your Supabase Project URL and anon key.';
      document.body.appendChild(b);
    });
  }

  window.sb = window.supabase.createClient(
    notConfigured ? 'https://placeholder.supabase.co' : cfg.SUPABASE_URL,
    notConfigured ? 'placeholder' : cfg.SUPABASE_ANON_KEY,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------------------------------------------------------- icons
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    network: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.4.3 4.2 2.1 4.7 4.8"/>',
    courses: '<path d="M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/>',
    messages: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13h5"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    like: '<path d="M7 11v9H4v-9zM7 11l4-7c1.5 0 2.5 1 2.2 2.6L12.6 10H19a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7"/>',
    celebrate: '<path d="m4 20 4.5-12 7.5 7.5z"/><path d="M14 4.5c.5 1.5 0 3-1.5 3.5M18.5 9.5c1.5-.5 3 0 3.5 1.5M16 3l.5 1.5M20.5 6l-1.5.5M19 13l1.5 1"/>',
    support: '<path d="M2.5 12.5 7 8l3.5 1.5L14 7l7.5 5.5-5 5.5-4-2.5-3.5 3z"/><path d="m10.5 9.5 3 3"/>',
    insightful: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    comment: '<path d="M4 5h16v11H9l-5 4z"/>',
    send: '<path d="m3 11 18-8-8 18-2-8z"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    block: '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7.5 5-2.5 5 2.5-1.5-7.5"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12.5h18"/>',
    school: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v5c1.8 1.6 3.6 2.4 5.5 2.4s3.7-.8 5.5-2.4v-5M21.5 9v5.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    userplus: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.7-3.5 3.2-5.5 6.5-5.5s5.8 2 6.5 5.5M19 8v6M16 11h6"/>',
    usercheck: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.7-3.5 3.2-5.5 6.5-5.5s5.8 2 6.5 5.5M16 11l2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 0 1 5 1c0 1.8-2.5 2.2-2.5 3.8M12 17.3v.2"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    hire: '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01"/>',
  };
  const icon = (name, size = 22, extra = '') =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[name] || ''}</svg>`;

  const REACTIONS = {
    like: { label: 'Like', icon: 'like', cls: 'rx-like' },
    celebrate: { label: 'Celebrate', icon: 'celebrate', cls: 'rx-celebrate' },
    support: { label: 'Support', icon: 'support', cls: 'rx-support' },
    insightful: { label: 'Insightful', icon: 'insightful', cls: 'rx-insightful' },
  };

  const FL = {
    cfg,
    esc,
    icon,
    REACTIONS,
    _me: null,

    async session() {
      const { data } = await sb.auth.getSession();
      const s = data.session || null;
      if (s) s.uid = s.user.id;
      return s;
    },

    // Redirects to index.html when not signed in. Returns the session otherwise.
    async requireAuth() {
      const s = await this.session();
      if (!s) { location.replace('index.html'); return null; }
      return s;
    },

    async getProfile(force) {
      if (this._me && !force) return this._me;
      const s = await this.session();
      if (!s) return null;
      const { data, error } = await sb.from('profiles').select('*').eq('id', s.user.id).single();
      if (error) throw error;
      this._me = data;
      // theme follows the account across devices unless this device chose one
      try { if (data.theme && !localStorage.getItem('fl:theme') && data.theme !== 'system') this.theme.apply(data.theme, false); } catch (_) {}
      return data;
    },

    async signOut() {
      await sb.auth.signOut();
      location.replace('index.html');
    },

    toast(msg, type = '') {
      let t = document.querySelector('.toast');
      if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
      t.textContent = msg;
      t.className = 'toast show ' + type;
      clearTimeout(t._h);
      t._h = setTimeout(() => t.classList.remove('show'), 4200);
    },

    // Human-friendly messages for the most common Supabase errors
    friendly(err) {
      const m = (err && (err.message || err.error_description || String(err))) || 'Something went wrong';
      if (/invalid login credentials/i.test(m)) return 'Email or password is incorrect.';
      if (/email not confirmed/i.test(m)) return 'Please confirm your email first — check your inbox.';
      if (/already registered/i.test(m)) return 'This email is already registered. Log in instead.';
      if (/password should be at least/i.test(m)) return 'Password must be at least 8 characters.';
      if (/rate limit/i.test(m)) return 'Too many attempts. Wait a minute and try again.';
      if (/failed to fetch|network/i.test(m)) return 'You seem to be offline. Check your connection and try again.';
      if (/row-level security/i.test(m)) return 'You don\'t have permission to do that.';
      return m;
    },

    fmtDate(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    fmtMonth(d) {
      if (!d) return 'Present';
      return new Date(String(d).length <= 10 ? d + 'T00:00:00' : d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    },
    timeAgo(d) {
      const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
      if (s < 60) return 'now';
      const m = s / 60; if (m < 60) return Math.floor(m) + 'm';
      const h = m / 60; if (h < 24) return Math.floor(h) + 'h';
      const dd = h / 24; if (dd < 7) return Math.floor(dd) + 'd';
      if (dd < 30) return Math.floor(dd / 7) + 'w';
      if (dd < 365) return Math.floor(dd / 30) + 'mo';
      return Math.floor(dd / 365) + 'y';
    },
    duration(start, end) {
      if (!start) return '';
      const a = new Date(start + 'T00:00:00'), b = end ? new Date(end + 'T00:00:00') : new Date();
      let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1;
      if (months < 1) months = 1;
      const y = Math.floor(months / 12), mo = months % 12;
      return [y ? y + ' yr' + (y > 1 ? 's' : '') : '', mo ? mo + ' mo' + (mo > 1 ? 's' : '') : ''].filter(Boolean).join(' ');
    },

    initials(name) {
      return String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
    },

    avatarHtml(profile, cls = 'avatar') {
      if (profile && profile.photo_url) return `<img class="${cls}" src="${esc(profile.photo_url)}" alt="" loading="lazy">`;
      return `<div class="${cls}">${esc(this.initials(profile && (profile.full_name || profile.username)))}</div>`;
    },

    // escape, keep line breaks (CSS pre-line) and turn web links into links
    linkify(text) {
      return esc(text).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g, '<a href="$1" target="_blank" rel="noopener nofollow ugc">$1</a>');
    },

    levelLabel(l) { return ({ coach: 'Coach', trainer: 'Trainer', trainee: 'Trainee' })[l] || ''; },

    logoHtml() {
      return `<a class="logo" href="feed.html" aria-label="The Fit Lab Academy">
        <img class="logomark logo-d" src="assets/logo-600.png" alt="The Fit Lab"><img class="logomark logo-l" src="assets/logo-600-light.png" alt="" aria-hidden="true">
        <span class="sub"><b>The Fit Lab</b>Academy</span></a>`;
    },

    // ---- theme ----
    theme: {
      get() { try { return localStorage.getItem('fl:theme') || 'system'; } catch (_) { return 'system'; } },
      apply(t, remember = true) {
        if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
        else document.documentElement.removeAttribute('data-theme');
        if (remember) { try { if (t === 'system') localStorage.removeItem('fl:theme'); else localStorage.setItem('fl:theme', t); } catch (_) {} }
        document.querySelectorAll('[data-theme-set]').forEach((b) => b.classList.toggle('on', b.dataset.themeSet === t));
      },
      async set(t) {
        this.apply(t, true);
        try {
          const s = await FL.session();
          if (s) await sb.from('profiles').update({ theme: t }).eq('id', s.user.id);
          if (FL._me) FL._me.theme = t;
        } catch (_) {}
      },
    },
    themeSwitchHtml() {
      const t = this.theme.get();
      return `<div class="seg" role="group" aria-label="Theme">
        <button type="button" data-theme-set="system" class="${t === 'system' ? 'on' : ''}">${icon('monitor', 15)}Auto</button>
        <button type="button" data-theme-set="light" class="${t === 'light' ? 'on' : ''}">${icon('sun', 15)}Light</button>
        <button type="button" data-theme-set="dark" class="${t === 'dark' ? 'on' : ''}">${icon('moon', 15)}Dark</button></div>`;
    },

    // ---- Voice (browser narration; free, no files) ----
    _voice: null,
    speechSupported() { return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; },
    pickVoice() {
      if (!this.speechSupported()) return null;
      const vs = speechSynthesis.getVoices();
      if (!vs.length) return null;
      const pref = [(v) => /en-IN/i.test(v.lang), (v) => /India/i.test(v.name), (v) => /en-GB/i.test(v.lang), (v) => /en-US/i.test(v.lang), (v) => /^en/i.test(v.lang)];
      for (const f of pref) { const v = vs.find(f); if (v) return v; }
      return vs[0];
    },
    speaking() { return this.speechSupported() && speechSynthesis.speaking; },
    stopSpeaking() { if (this.speechSupported()) speechSynthesis.cancel(); document.querySelectorAll('.narrate.on').forEach((b) => b.classList.remove('on')); },
    speak(text, onend) {
      if (!this.speechSupported()) { this.toast('Narration is not supported in this browser', 'err'); return false; }
      speechSynthesis.cancel();
      const clean = String(text || '').replace(/\*\*/g, '').replace(/^[-•]\s+/gm, '').replace(/^\d+[.)]\s+/gm, '').replace(/\s+/g, ' ').trim();
      const u = new SpeechSynthesisUtterance(clean);
      const v = this._voice || (this._voice = this.pickVoice());
      if (v) u.voice = v;
      u.rate = 0.95; u.pitch = 1;
      u.onend = () => { if (onend) onend(); };
      u.onerror = () => { if (onend) onend(); };
      speechSynthesis.speak(u);
      return true;
    },
    stripMd(text) { return String(text || '').replace(/\*\*/g, '').replace(/^[-•]\s+/gm, '').replace(/^\d+[.)]\s+/gm, ''); },

    // Star badge markup — used on profiles, directory and hire portal
    starBadge(count, tier) {
      const t = tier || 'none';
      const stars = count > 0 ? '★'.repeat(count) : '—';
      const label = { diamond: 'Diamond', platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze', none: 'Unrated' }[t] || 'Unrated';
      return `<span class="starbadge s-${t}" title="${label} · ${count}/5">${stars}</span>`;
    },
    // same, but nothing at all for members without stars yet (social pages)
    starsIf(count, tier) { return count > 0 ? this.starBadge(count, tier) : ''; },

    // ---------------------------------------------------------------- modals
    modal({ title = '', body = '', foot = '', wide = false, onClose } = {}) {
      const el = document.createElement('div');
      el.className = 'mdl';
      el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
      el.innerHTML = `<div class="mdl-card${wide ? ' wide' : ''}">
        <div class="mdl-head"><h3>${esc(title)}</h3><button class="icon-btn" data-x aria-label="Close">${icon('close', 20)}</button></div>
        <div class="mdl-body">${body}</div>${foot ? `<div class="mdl-foot">${foot}</div>` : ''}</div>`;
      const close = () => { el.remove(); document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; if (onClose) onClose(); };
      const onKey = (e) => { if (e.key === 'Escape') close(); };
      el.addEventListener('mousedown', (e) => { if (e.target === el) close(); });
      el.querySelector('[data-x]').onclick = close;
      document.addEventListener('keydown', onKey);
      document.body.appendChild(el);
      document.body.style.overflow = 'hidden';
      const first = el.querySelector('input:not([type=hidden]),textarea,select');
      if (first && window.matchMedia('(min-width:768px)').matches) setTimeout(() => first.focus(), 60);
      return { el, close, q: (s) => el.querySelector(s), qa: (s) => el.querySelectorAll(s) };
    },

    confirm(title, text, okLabel = 'Confirm', danger = false) {
      return new Promise((resolve) => {
        let done = false;
        const m = this.modal({ title, body: `<p style="margin:0;line-height:1.55">${esc(text)}</p>`,
          foot: `<button class="pill ghost" data-no>Cancel</button><button class="pill solid" data-ok ${danger ? 'style="background:var(--danger);border-color:var(--danger);color:#fff"' : ''}>${esc(okLabel)}</button>`,
          onClose: () => { if (!done) resolve(false); } });
        m.q('[data-no]').onclick = () => { done = true; m.close(); resolve(false); };
        m.q('[data-ok]').onclick = () => { done = true; m.close(); resolve(true); };
      });
    },

    notice(title, text) {
      const m = this.modal({ title, body: `<div class="notice warn" style="margin:0">${icon('shield', 20)}<div style="line-height:1.55">${esc(text)}</div></div>
        <p class="t-sm muted" style="margin:12px 0 0">The Fit Lab is a professional coaching network. <a href="#" data-gl>Read the community guidelines</a>.</p>`,
        foot: `<button class="pill solid" data-ok>OK</button>` });
      m.q('[data-ok]').onclick = m.close;
      m.q('[data-gl]').onclick = (e) => { e.preventDefault(); m.close(); this.guidelines(true); };
    },

    GUIDELINES: `
      <p style="margin-top:0">The Fit Lab is a <b>professional network</b> for coaches, trainers and learners. These rules keep it useful and safe for everyone — women and men alike.</p>
      <h4>1 · Keep it professional</h4>
      <ul><li>Talk coaching, training, nutrition, health science, careers and courses.</li>
      <li>Use your real name and a clear, professional headshot.</li></ul>
      <h4>2 · This is not a dating space</h4>
      <ul><li>No romantic or flirty messages, compliments on looks, or asking whether someone is single.</li>
      <li>No requests for personal photos. Connect only for professional reasons.</li></ul>
      <h4>3 · Respect everyone</h4>
      <ul><li>No abuse, profanity, slurs, harassment or threats — in any language.</li>
      <li>Disagree with ideas, never attack people.</li></ul>
      <h4>4 · Keep contact on The Fit Lab</h4>
      <ul><li>Phone numbers, emails and social handles can't be shared in messages, comments or profiles.</li>
      <li>Gyms hire coaches through the Hire-a-Coach portal, which the Academy team handles.</li></ul>
      <h4>How this is enforced</h4>
      <ul><li>Automatic checks block abusive, sexual, dating-style and contact-sharing text before it is sent.</li>
      <li>A serious breach, or three in 30 days, pauses messaging and posting until the Academy team reviews it.</li>
      <li>Anyone can report or block a member at any time. Members under 18 can't message or connect.</li>
      <li>Your courses and certificates are never affected by community decisions.</li></ul>`,

    guidelines(readOnly = false) {
      return new Promise((resolve) => {
        let done = false;
        const m = this.modal({ title: 'Community guidelines', wide: true,
          body: `<div class="guidelines">${this.GUIDELINES}</div>
            ${readOnly ? '' : `<label class="check" style="margin-top:16px;font-size:14px;color:var(--bone)"><input type="checkbox" id="glOk"><span>I've read these guidelines and agree to follow them.</span></label>`}`,
          foot: readOnly ? `<button class="pill solid" data-ok>Close</button>` : `<button class="pill ghost" data-no>Not now</button><button class="pill solid" data-ok disabled>Agree &amp; continue</button>`,
          onClose: () => { if (!done) resolve(false); } });
        const ok = m.q('[data-ok]');
        if (readOnly) { ok.onclick = () => { done = true; m.close(); resolve(true); }; return; }
        m.q('#glOk').onchange = (e) => { ok.disabled = !e.target.checked; };
        m.q('[data-no]').onclick = () => { done = true; m.close(); resolve(false); };
        ok.onclick = async () => {
          this.busy(ok, true, 'Saving…');
          const { error } = await sb.rpc('accept_guidelines');
          this.busy(ok, false);
          if (error) return this.toast(this.friendly(error), 'err');
          if (this._me) this._me.guidelines_accepted_at = new Date().toISOString();
          done = true; m.close(); resolve(true);
        };
      });
    },

    // RPC wrapper: shows errors / refusals, handles the guidelines gate and
    // conduct blocks. Returns the data, or null when nothing should happen.
    async call(fn, args = {}, opts = {}) {
      const { quiet = false, retry = true } = opts;
      const { data, error } = await sb.rpc(fn, args);
      if (error) { if (!quiet) this.toast(this.friendly(error), 'err'); return null; }
      if (data && data.ok === false) {
        if (data.code === 'guidelines' && retry) {
          const agreed = await this.guidelines();
          return agreed ? this.call(fn, args, { quiet, retry: false }) : null;
        }
        if (data.blocked) { this.notice(data.category === 'contact' ? 'Keep contact details off the network' : 'Not sent', data.message); return null; }
        if (data.code === 'suspended' || data.code === 'banned') { this.notice('Community access paused', data.message); return null; }
        if (!quiet) this.toast(data.message || 'That isn\'t allowed.', 'err');
        return null;
      }
      return data;
    },

    report(type, targetId, opts = {}) {
      const reasons = [
        ['inappropriate', 'Sexual or inappropriate content'], ['dating', 'Romantic or dating advances'],
        ['harassment', 'Harassment, abuse or threats'], ['spam', 'Spam or scam'],
        ['fake', 'Fake profile or impersonation'], ['other', 'Something else']];
      const m = this.modal({ title: 'Report', body: `
        <p class="t-sm muted" style="margin:0 0 12px">Reports are private. The Academy team reviews every one. Content reported by several members is hidden straight away.</p>
        <div class="radio-list">${reasons.map(([v, l], i) => `<label><input type="radio" name="rr" value="${v}" ${i === 0 ? 'checked' : ''}>${l}</label>`).join('')}</div>
        <div class="field" style="margin-top:12px"><label for="rrD">Anything else we should know? (optional)</label><textarea id="rrD" maxlength="1000" style="min-height:70px"></textarea></div>
        ${opts.userId ? `<label class="check" style="color:var(--bone)"><input type="checkbox" id="rrB"><span>Also block ${esc(opts.name || 'this member')} — they won't be able to message you, connect or see your posts.</span></label>` : ''}`,
        foot: `<button class="pill ghost" data-no>Cancel</button><button class="pill solid" data-ok>Send report</button>` });
      m.q('[data-no]').onclick = m.close;
      m.q('[data-ok]').onclick = async (e) => {
        const reason = m.q('input[name=rr]:checked').value;
        this.busy(e.target, true, 'Sending…');
        const r = await this.call('report_content', { p_type: type, p_target: targetId, p_reason: reason, p_details: m.q('#rrD').value.trim() || null });
        if (r && opts.userId && m.q('#rrB') && m.q('#rrB').checked) await this.call('block_member', { p_user_id: opts.userId });
        this.busy(e.target, false);
        if (!r) return;
        m.close();
        this.toast('Thanks — the Academy team will review this.', 'ok');
        if (opts.onDone) opts.onDone();
      };
    },

    // LinkedIn-style invite: send with or without a short professional note
    connect(username, name) {
      return new Promise((resolve) => {
        let done = false;
        const m = this.modal({ title: `Invite ${name || '@' + username} to connect`, body: `
          <p class="t-sm" style="margin:0 0 10px;line-height:1.55">Add a short note about why you'd like to connect — coaches are more likely to accept invitations with a professional note.</p>
          <div id="cnNoteWrap" hidden><textarea id="cnNote" maxlength="300" placeholder="e.g. Hi, I saw your post on PCOS programming — I coach similar clients in Kakinada and would love to connect."></textarea>
          <div class="t-xs muted" style="text-align:right;margin-top:4px" id="cnCount">0 / 300</div></div>`,
          foot: `<button class="pill ghost" id="cnAdd">Add a note</button><button class="pill solid" id="cnSend">Send without a note</button>`,
          onClose: () => { if (!done) resolve(null); } });
        const ta = m.q('#cnNote'), send = m.q('#cnSend'), add = m.q('#cnAdd');
        add.onclick = () => { m.q('#cnNoteWrap').hidden = false; add.hidden = true; send.textContent = 'Send'; ta.focus(); };
        ta.oninput = () => { m.q('#cnCount').textContent = `${ta.value.length} / 300`; };
        send.onclick = async () => {
          this.busy(send, true, 'Sending…');
          const r = await this.call('send_connection_request', { p_username: username, p_note: ta.value.trim() || null });
          this.busy(send, false);
          if (!r) return;
          done = true; m.close();
          this.toast(r.status === 'accepted' ? 'You are now connected' : 'Invitation sent', 'ok');
          resolve(r);
        };
      });
    },

    // resize + upload an image to Storage, returns its public URL
    async uploadImage(file, { bucket = 'avatars', path, max = 1600, square = false, aspect = null, quality = 0.86 } = {}) {
      if (!file) return null;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Use a JPG, PNG or WebP image');
      const blob = await new Promise((resolve, reject) => {
        const img = new Image(); const url = URL.createObjectURL(file);
        img.onload = () => {
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          if (square || aspect) {
            const want = square ? 1 : aspect;
            if (sw / sh > want) { const nw = sh * want; sx = (sw - nw) / 2; sw = nw; } else { const nh = sw / want; sy = (sh - nh) / 2; sh = nh; }
          }
          const scale = Math.min(1, max / Math.max(sw, sh));
          const c = document.createElement('canvas');
          c.width = Math.round(sw * scale); c.height = Math.round(sh * scale);
          c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
          c.toBlob((b) => { URL.revokeObjectURL(url); b ? resolve(b) : reject(new Error('Could not process the image')); }, 'image/jpeg', quality);
        };
        img.onerror = () => reject(new Error('That file is not a readable image'));
        img.src = url;
      });
      const { error } = await sb.storage.from(bucket).upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
      if (error) throw error;
      return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl + '?v=' + Date.now();
    },

    communityNotice(p) {
      if (!p || !p.community_status || p.community_status === 'active') return '';
      return `<div class="notice ${p.community_status === 'banned' ? 'bad' : 'warn'}">${icon('shield', 20)}<div>
        <b>${p.community_status === 'banned' ? 'Community access removed' : 'Community access paused for review'}</b><br>
        <span class="t-sm">${p.community_status === 'banned'
          ? 'You can no longer message, post or connect. Your courses and certificates are not affected.'
          : 'Messaging, posting and connecting are paused while the Academy team reviews recent activity. Your courses are not affected.'}</span></div></div>`;
    },

    // left-column mini profile (feed / network / notifications)
    miniProfile(p, counts = {}) {
      if (!p) return '';
      return `<div class="box mini">
        <div class="cov" ${p.cover_url ? `style="background-image:url('${esc(p.cover_url)}')"` : ''}></div>
        <a href="profile.html?u=${encodeURIComponent(p.username || '')}">${this.avatarHtml(p, 'avatar')}</a>
        <h3><a href="profile.html?u=${encodeURIComponent(p.username || '')}" style="color:var(--bone)">${esc(p.full_name || 'Member')}</a></h3>
        <p>${esc(p.headline || p.occupation || 'Add a headline to your profile')}</p>
        <div class="divider"></div>
        <a class="stat" href="network.html#connections"><span>Connections</span><b>${counts.connections ?? '—'}</b></a>
        <a class="stat" href="courses.html"><span>Courses</span><b>${counts.courses ?? '—'}</b></a>
        <div class="divider" style="margin-top:6px"></div>
        <a class="stat" href="profile.html?u=${encodeURIComponent(p.username || '')}"><span class="mono" style="font-size:11px">${esc(p.unique_id || '')}</span>${this.starsIf(p.star_count || 0, p.star_tier)}</a>
      </div>`;
    },

    siteFootHtml(compact = false) {
      const links = `<a href="hire.html">Hire a coach</a><a href="verify.html">Verify a certificate</a><a href="#" data-guidelines>Community guidelines</a><a href="settings.html">Settings</a><a href="mailto:${esc(cfg.SUPPORT_EMAIL || '')}">Help</a>`;
      return `<div class="${compact ? 'right-foot' : 'site-foot'}">${links}<span>The Fit Lab © ${new Date().getFullYear()}</span></div>`;
    },

    // Site-wide popups: admin announcements + Academy notices, then a motivation nudge.
    async showEntryPopups(courseId) {
      const sess = await this.session();
      if (!sess) return;
      const myUid = sess.user.id;
      const shown = (k) => sessionStorage.getItem(k);
      const mark = (k) => sessionStorage.setItem(k, '1');
      const open = (html, onClose) => new Promise((resolve) => {
        const wrap = document.createElement('div');
        wrap.className = 'fl-modal on';
        wrap.innerHTML = html;
        const close = () => { wrap.remove(); if (onClose) onClose(); resolve(); };
        wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
        document.body.appendChild(wrap);
      });
      try {
        const { data: notes } = await sb.rpc('my_notifications');
        for (const n of (notes || []).slice(0, 2)) {
          await open(`
            <div class="card hud" style="max-width:460px;padding:32px 28px">
              <span class="c1"></span><span class="c2"></span>
              <div class="eyebrow" style="color:var(--lime)">${({ launch: 'New course', system: 'The Fit Lab Academy', motivation: 'Keep going' })[n.kind] || 'Announcement'}</div>
              <h2 style="margin:10px 0 8px;font-size:24px">${this.esc(n.title)}</h2>
              ${n.body ? `<p style="color:var(--ash);line-height:1.6">${this.esc(n.body)}</p>` : ''}
              <div class="btn-row" style="margin-top:20px">
                ${n.link_url ? `<a class="btn btn-primary" href="${this.esc(n.link_url)}">Take a look</a>` : ''}
                <button class="btn btn-ghost" data-close>Got it</button>
              </div>
            </div>`, () => sb.from('notification_reads').insert({ user_id: myUid, notification_id: n.id }));
        }
      } catch (_) { /* non-blocking */ }
      if (courseId && !shown('fl:mot')) {
        try {
          const { data: m } = await sb.rpc('motivation_for', { p_course_id: courseId });
          if (m && (m.stage === 'start' || m.stage === 'mid' || m.stage === 'late')) {
            mark('fl:mot');
            const pct = m.total ? Math.round((m.done / m.total) * 100) : 0;
            await open(`
              <div class="card hud" style="max-width:420px;text-align:center;padding:32px 28px">
                <span class="c1"></span><span class="c2"></span>
                <div class="eyebrow" style="color:var(--lime)">${m.stage === 'start' ? 'Welcome back' : 'Keep going'}</div>
                <h2 style="margin:12px 0 14px;font-size:23px;line-height:1.35">${this.esc(m.message)}</h2>
                <div class="mono ash" style="font-size:12px;margin-bottom:10px">${m.done} of ${m.total} days · ${pct}%</div>
                <div class="progress" style="margin-bottom:20px"><i style="width:${pct}%"></i></div>
                <button class="btn btn-primary" data-close>Let's go</button>
              </div>`);
          }
        } catch (_) { /* non-blocking */ }
      }
    },

    // ---------------------------------------------------------------- shell
    pageKey() {
      if (document.body.dataset.page) return document.body.dataset.page;
      const f = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
      return ({ feed: 'home', network: 'network', connections: 'network', members: 'network', courses: 'courses', dashboard: 'courses',
                lesson: 'courses', exam: 'courses', messaging: 'messages', chat: 'messages', notifications: 'notifications',
                profile: 'profile', settings: 'me', search: 'search', admin: 'admin' })[f] || f;
    },

    renderHeader(profile) {
      const page = this.pageKey();
      document.body.classList.add('app');
      document.querySelectorAll('.topbar,.bottombar,.me-menu').forEach((e) => e.remove());
      const legacy = document.getElementById('nav'); if (legacy) legacy.innerHTML = '';

      const tabs = [
        ['home', 'feed.html', 'Home', 'home', null],
        ['network', 'network.html', 'My Network', 'network', 'invitations'],
        ['courses', 'courses.html', 'Courses', 'courses', null],
        ['messages', 'messaging.html', 'Messaging', 'messages', 'messages'],
        ['notifications', 'notifications.html', 'Notifications', 'bell', 'notifications'],
      ];
      const q = this.param('q') || '';
      const bar = document.createElement('header');
      bar.className = 'topbar';
      if (profile) {
        bar.innerHTML = `<div class="topbar-in">
          <a class="tb-logo" href="feed.html" aria-label="The Fit Lab — home"><img class="logo-d" src="assets/logo-600.png" alt="The Fit Lab"><img class="logo-l" src="assets/logo-600-light.png" alt="" aria-hidden="true"></a>
          <form class="tb-search" action="search.html" role="search">${icon('search', 17)}
            <input name="q" type="search" placeholder="Search coaches, trainers, skills" value="${esc(q)}" aria-label="Search"></form>
          <nav class="tb-tabs">
            ${tabs.map(([k, href, label, ic, cnt]) => `<a class="tb-tab ${k === 'messages' ? 'tb-msg' : ''} ${page === k ? 'on' : ''}" href="${href}">
              <span class="ic">${icon(ic, 24)}${cnt ? `<span class="cnt" data-cnt="${cnt}"></span>` : ''}</span><span class="lbl">${label}</span></a>`).join('')}
            <button class="tb-tab tb-me ${page === 'me' || (page === 'profile' && this.param('u') === profile.username) ? 'on' : ''}" type="button" aria-haspopup="true" aria-expanded="false">
              <span class="ic">${this.avatarHtml(profile, 'ava avatar')}</span><span class="lbl">Me ${icon('down', 12)}</span></button>
            ${profile.is_admin ? `<span class="tb-sep"></span><a class="tb-tab ${location.pathname.endsWith('admin.html') ? 'on' : ''}" href="admin.html"><span class="ic">${icon('shield', 24)}</span><span class="lbl">Admin</span></a>` : ''}
          </nav></div>`;
      } else {
        bar.innerHTML = `<div class="topbar-in">
          <a class="tb-logo" href="index.html" aria-label="The Fit Lab"><img class="logo-d" src="assets/logo-600.png" alt="The Fit Lab"><img class="logo-l" src="assets/logo-600-light.png" alt="" aria-hidden="true"></a>
          <nav class="tb-tabs" style="gap:8px;align-items:center">
            <a class="txt-btn" href="hire.html">${icon('hire', 18)}<span class="lbl">Hire a coach</span></a>
            <a class="txt-btn" href="verify.html">${icon('award', 18)}<span class="lbl">Verify</span></a>
            ${/index\.html$|\/$/.test(location.pathname) ? '' : '<a class="pill solid sm" href="index.html">Sign in</a>'}
          </nav></div>`;
      }
      document.body.prepend(bar);

      if (!profile) return;
      const mobileTabs = [
        ['home', 'feed.html', 'Home', 'home', null],
        ['network', 'network.html', 'Network', 'network', 'invitations'],
        ['post', 'feed.html#compose', 'Post', 'plus', null],
        ['courses', 'courses.html', 'Courses', 'courses', null],
        ['notifications', 'notifications.html', 'Alerts', 'bell', 'notifications'],
      ];
      const bb = document.createElement('nav');
      bb.className = 'bottombar';
      bb.innerHTML = mobileTabs.map(([k, href, label, ic, cnt]) => `<a href="${href}" class="${page === k ? 'on' : ''}" data-bb="${k}">
        <span class="ic">${icon(ic, 24)}${cnt ? `<span class="cnt" data-cnt="${cnt}"></span>` : ''}</span>${label}</a>`).join('');
      document.body.appendChild(bb);

      const menu = document.createElement('div');
      menu.className = 'me-menu';
      menu.innerHTML = `
        <div class="me-head">${this.avatarHtml(profile, 'avatar')}<div><b>${esc(profile.full_name || 'Member')}</b><span>${esc(profile.headline || profile.occupation || profile.unique_id || '')}</span></div></div>
        <a class="pill btn-view" href="profile.html?u=${encodeURIComponent(profile.username || '')}">View profile</a>
        <div class="me-sec"><h6>Appearance</h6>${this.themeSwitchHtml()}</div>
        <div class="me-sec"><h6>Account</h6>
          <a href="settings.html">${icon('settings', 18)}Settings &amp; privacy</a>
          <a href="courses.html">${icon('award', 18)}Courses &amp; certificates</a>
          <button class="lnk" type="button" data-guidelines>${icon('shield', 18)}Community guidelines</button>
          <a href="mailto:${esc(cfg.SUPPORT_EMAIL || '')}">${icon('help', 18)}Help</a></div>
        <div class="me-sec"><h6>For gyms &amp; studios</h6><a href="hire.html">${icon('hire', 18)}Hire a coach</a>
          ${profile.is_admin ? `<a href="admin.html">${icon('shield', 18)}Admin control room</a>` : ''}</div>
        <div class="me-sec"><button class="lnk" type="button" id="btnSignOut">${icon('logout', 18)}Sign out</button></div>`;
      document.body.appendChild(menu);

      const meBtn = bar.querySelector('.tb-me');
      const toggle = (on) => { menu.classList.toggle('on', on); meBtn.setAttribute('aria-expanded', on ? 'true' : 'false'); };
      meBtn.onclick = (e) => { e.stopPropagation(); toggle(!menu.classList.contains('on')); };
      document.addEventListener('click', (e) => { if (!menu.contains(e.target) && !meBtn.contains(e.target)) toggle(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
      menu.querySelector('#btnSignOut').onclick = () => this.signOut();
      this.wireCommon(document);
      this.refreshCounts();
      clearInterval(this._cntTimer);
      this._cntTimer = setInterval(() => { if (document.visibilityState === 'visible') this.refreshCounts(); }, 45000);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this.refreshCounts(); });
    },

    // theme buttons + guidelines links anywhere on the page
    wireCommon(root) {
      root.querySelectorAll('[data-theme-set]').forEach((b) => { b.onclick = () => this.theme.set(b.dataset.themeSet); });
      root.querySelectorAll('[data-guidelines]').forEach((b) => { b.onclick = (e) => { e.preventDefault(); this.guidelines(true); }; });
    },

    async refreshCounts() {
      try {
        const { data } = await sb.rpc('unread_counts');
        if (!data) return;
        this.counts = data;
        document.querySelectorAll('[data-cnt]').forEach((el) => {
          const n = data[el.dataset.cnt] || 0;
          el.dataset.n = n; el.textContent = n ? (n > 99 ? '99+' : n) : '';
        });
        const total = (data.messages || 0) + (data.notifications || 0) + (data.invitations || 0);
        const base = document.title.replace(/^\(\d+\+?\)\s*/, '');
        document.title = total ? `(${total > 99 ? '99+' : total}) ${base}` : base;
      } catch (_) {}
    },

    // Tiny markdown: **bold**, "- " bullets, "1. " numbered, blank-line paragraphs
    md(text) {
      const lines = String(text || '').split('\n');
      let html = '', list = null, para = [];
      const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      const flushPara = () => { if (para.length) { html += `<p>${inline(para.join(' '))}</p>`; para = []; } };
      const flushList = () => { if (list) { html += `</${list}>`; list = null; } };
      for (const raw of lines) {
        const line = raw.trimEnd();
        const ul = /^[-•]\s+(.*)/.exec(line);
        const ol = /^\d+[.)]\s+(.*)/.exec(line);
        if (ul || ol) {
          flushPara();
          const type = ul ? 'ul' : 'ol';
          if (list !== type) { flushList(); list = type; html += `<${type}>`; }
          html += `<li>${inline((ul || ol)[1])}</li>`;
        } else if (line.trim() === '') {
          flushPara(); flushList();
        } else {
          flushList(); para.push(line);
        }
      }
      flushPara(); flushList();
      return html;
    },

    param(name) { return new URLSearchParams(location.search).get(name); },

    busy(btn, on, label) {
      if (!btn) return;
      if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spin"></span> ${label || 'Working…'}`; }
      else { btn.disabled = false; btn.innerHTML = btn.dataset.label || btn.innerHTML; }
    }
  };

  window.FL = FL;
})();
