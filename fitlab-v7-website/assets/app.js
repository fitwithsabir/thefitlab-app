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
    calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5v2.5M8.5 18.5h.01M12 18.5h.01"/>',
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
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    star: '<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
    dumbbell: '<path d="M6.5 7.5v9M17.5 7.5v9M3.5 10v4M20.5 10v4M6.5 12h11"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 0 1 5 1c0 1.8-2.5 2.2-2.5 3.8M12 17.3v.2"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    // verified seal: 12 equal scallops on a true circle around (12,12), tick centred
    tick: '<path d="M9.44 2.45 A2.6 2.6 0 0 1 14.56 2.45 A2.6 2.6 0 0 1 18.99 5.01 A2.6 2.6 0 0 1 21.55 9.44 A2.6 2.6 0 0 1 21.55 14.56 A2.6 2.6 0 0 1 18.99 18.99 A2.6 2.6 0 0 1 14.56 21.55 A2.6 2.6 0 0 1 9.44 21.55 A2.6 2.6 0 0 1 5.01 18.99 A2.6 2.6 0 0 1 2.45 14.56 A2.6 2.6 0 0 1 2.45 9.44 A2.6 2.6 0 0 1 5.01 5.01 A2.6 2.6 0 0 1 9.44 2.45Z" fill="currentColor" stroke="none"/><path d="m8 12.4 2.75 2.75L16 9.9" stroke="var(--on-tick,#fff)" stroke-width="2.2"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-1.8 10H4.8z" fill="currentColor" stroke="none"/>',
    building: '<rect x="4" y="3" width="11" height="18" rx="1"/><path d="M15 9h4a1 1 0 0 1 1 1v11H15M8 7h3M8 11h3M8 15h3M9.5 21v-3"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
    rupee: '<path d="M7 4h10M7 8.5h10M9 4c4.5 0 6 1.6 6 4.5S12.5 13 9 13H7l7.5 7"/>',
    bookmark: '<path d="M6 3.5h12v17l-6-4.2-6 4.2z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    inbox: '<path d="M3 13l2.5-8h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
    hire: '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6M8 10h.01M12 10h.01M16 10h.01"/>',
    play: '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>',
    at: '<circle cx="12" cy="12" r="3.8"/><path d="M15.8 12v1.5a2.5 2.5 0 0 0 5 0V12a8.8 8.8 0 1 0-3.4 6.9"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.6"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.4.3 4.2 2.1 4.7 4.8"/>',
    hash: '<path d="M9 3 7 21M17 3l-2 18M4 8.5h17M3 15.5h17"/>',
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

    // Redirects to / when not signed in. Returns the session otherwise.
    async requireAuth() {
      const s = await this.session();
      if (!s) { location.replace('/'); return null; }
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
      location.replace('/');
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
      return `<a class="logo" href="feed" aria-label="The Fit Lab Academy">
        <img class="logomark logo-d" src="assets/logo-600.png" alt="The Fit Lab"><img class="logomark logo-l" src="assets/logo-600-light.png" alt="" aria-hidden="true">
        <span class="sub"><b>The Fit Lab</b>Academy</span></a>`;
    },

    // ---- theme ----
    theme: {
      get() { try { return localStorage.getItem('fl:theme') || 'system'; } catch (_) { return 'system'; } },
      // the look actually on screen: a chosen theme, or the device setting
      isDark() {
        const t = document.documentElement.getAttribute('data-theme');
        if (t) return t === 'dark';
        return !(window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches);
      },
      apply(t, remember = true) {
        if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
        else document.documentElement.removeAttribute('data-theme');
        if (remember) { try { if (t === 'system') localStorage.removeItem('fl:theme'); else localStorage.setItem('fl:theme', t); } catch (_) {} }
        document.querySelectorAll('[data-theme-set]').forEach((b) => b.classList.toggle('on', b.dataset.themeSet === t));
        FL.syncThemeToggles();
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
    // small day/night button for pages people see before signing in
    themeToggleHtml() {
      const dark = this.theme.isDark();
      const label = dark ? 'Switch to day mode' : 'Switch to night mode';
      return `<button type="button" class="theme-tgl" data-theme-toggle aria-label="${label}" title="${label}">${icon(dark ? 'sun' : 'moon', 18)}</button>`;
    },
    syncThemeToggles() {
      const dark = this.theme.isDark(), label = dark ? 'Switch to day mode' : 'Switch to night mode';
      document.querySelectorAll('[data-theme-toggle]').forEach((b) => { b.innerHTML = icon(dark ? 'sun' : 'moon', 18); b.setAttribute('aria-label', label); b.title = label; });
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

    // ---------------------------------------------------------------- v8: ticks, badges, rings
    tick(on, size = 16) { return on ? `<span class="vtick" title="Verified by The Fit Lab" aria-label="Verified">${icon('tick', size)}</span>` : ''; },
    PLAN_NAMES: { pro: 'Pro', business: 'Business', recruiter: 'Recruiter' },
    prem(plan) { return plan ? `<span class="pbadge" title="${this.PLAN_NAMES[plan] || 'Premium'} member" aria-label="Premium">${icon('crown', 11)}</span>` : ''; },
    tags(c) { return c ? this.tick(c.verified) + this.prem(c.premium) : ''; },
    // avatar with the #OpenToWork (green) / #Hiring (purple) frame
    ringAvatar(c, cls = 'avatar') {
      const ring = c && c.hiring ? 'hiring' : c && c.open_to_work ? 'otw' : '';
      const a = this.avatarHtml(c, cls);
      return ring ? `<span class="ring ${ring}" title="${ring === 'hiring' ? '#Hiring' : '#OpenToWork'}">${a}</span>` : a;
    },
    inr(rupees) { return '₹' + Number(rupees || 0).toLocaleString('en-IN'); },
    paise(p) { return '₹' + (Number(p || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }); },
    PERIOD: { month: 'month', year: 'year', hour: 'hour', session: 'session' },
    pay(j) {
      if (!j || j.salary_min == null) return '';
      const a = this.inr(j.salary_min), b = this.inr(j.salary_max);
      return `${a === b ? a : a + '–' + b.slice(1)} / ${this.PERIOD[j.salary_period] || j.salary_period}`;
    },
    JOB_TYPES: { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', freelance: 'Freelance', internship: 'Internship', per_session: 'Per session' },
    WORKPLACES: { on_site: 'On-site', hybrid: 'Hybrid', remote: 'Remote', home_visits: 'Home visits' },
    PAGE_KINDS: { gym: 'Gym', studio: 'Fitness studio', clinic: 'Clinic', hospital: 'Hospital', academy: 'Academy / Institute', brand: 'Brand',
                  sports_club: 'Sports club', wellness: 'Wellness centre', association: 'Association', other: 'Other organisation' },
    async professions() {
      if (this._prof) return this._prof;
      const { data } = await sb.from('professions').select('code,label,category,requires_licence,sort').order('sort');
      this._prof = data || [];
      return this._prof;
    },
    professionOptions(list, selected, placeholder = 'Choose a profession') {
      const cats = [...new Set(list.map((p) => p.category))];
      return `<option value="">${esc(placeholder)}</option>` + cats.map((c) => `<optgroup label="${esc(c)}">${list.filter((p) => p.category === c)
        .map((p) => `<option value="${p.code}" ${p.code === selected ? 'selected' : ''}>${esc(p.label)}</option>`).join('')}</optgroup>`).join('');
    },
    pageLogo(pg, cls = 'co-logo') {
      if (pg && pg.logo_url) return `<img class="${cls}" src="${esc(pg.logo_url)}" alt="" loading="lazy">`;
      return `<span class="${cls}">${icon('building', cls === 'co-logo' ? 22 : 30)}</span>`;
    },
    // Premium upsell — shown whenever a Premium feature is tapped
    upsell(title, text, plan = 'pro') {
      const m = this.modal({ title: title || 'Premium feature', body: `<div class="upsell">${icon('crown', 28)}
          <p style="margin:10px 0 0;line-height:1.55">${esc(text || 'This is part of Fit Lab Premium.')}</p>
          <p class="t-sm muted" style="margin:10px 0 0">Try it free for 14 days — no card needed for the trial.</p></div>`,
        foot: `<button class="pill ghost" data-no>Not now</button><a class="pill solid gold" href="premium?plan=${plan}">See Premium plans</a>` });
      m.q('[data-no]').onclick = m.close;
    },
    // job-related InMail (employers ↔ applicants / open-to-work members; Pro → hiring managers)
    inmail(c, ctx = null) {
      return new Promise((resolve) => {
        let done = false;
        const cost = ctx && ctx.cost ? `<p class="t-xs muted" style="margin:8px 0 0">${icon('mail', 13)} Uses 1 InMail credit · ${ctx.credits_left} left this month</p>`
                                     : `<p class="t-xs muted" style="margin:8px 0 0">${icon('mail', 13)} Free — job-related message</p>`;
        const m = this.modal({ title: `InMail ${c.full_name || '@' + c.username}`, body: `
          <p class="t-sm muted" style="margin:0 0 12px;line-height:1.5">InMail is for jobs and hiring only. Say who you are and why you're reaching out — they can accept or decline.</p>
          <div class="field"><label for="imS">Subject</label><input id="imS" maxlength="120" placeholder="e.g. Strength coach role at Shaan Fitness"></div>
          <div class="field"><label for="imB">Message</label><textarea id="imB" maxlength="2000" style="min-height:130px" placeholder="Hi ${esc((c.full_name || '').split(' ')[0])}, …"></textarea></div>${cost}`,
          foot: `<button class="pill ghost" data-no>Cancel</button><button class="pill solid" data-ok>Send InMail</button>`,
          onClose: () => { if (!done) resolve(null); } });
        m.q('[data-no]').onclick = m.close;
        m.q('[data-ok]').onclick = async (e) => {
          const body = m.q('#imB').value.trim();
          if (body.length < 20) return this.toast('Write at least a couple of sentences.', 'err');
          this.busy(e.target, true, 'Sending…');
          const r = await this.call('send_inmail', { p_recipient: c.user_id, p_subject: m.q('#imS').value.trim() || null, p_body: body });
          this.busy(e.target, false);
          if (!r) return;
          done = true; m.close(); this.toast('InMail sent', 'ok'); resolve(r);
        };
      });
    },
    // generic upload (PDF or image) to a bucket path — photos are checked and shrunk first; returns the storage path
    async uploadFile(bucket, path, file, maxMB = 5) {
      if (!file) return null;
      if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.type)) throw new Error('Upload a PDF, JPG or PNG');
      if (file.type === 'application/pdf') {
        if (file.size > maxMB * 1024 * 1024) throw new Error(`PDFs can be up to ${maxMB} MB`);
        const { error } = await sb.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
        if (error) throw error;
        return path;
      }
      const { blob, canvas } = await this.compressImage(file, { max: 2000, quality: 0.85 });   // documents stay readable
      const res = await this.photoCheck.check(canvas);
      if (res.verdict === 'blocked') { this._logPhoto(bucket, null, res); throw new Error(this.BLOCKED_PHOTO); }
      const { error } = await sb.storage.from(bucket).upload(path, blob, { upsert: true, contentType: blob.type });
      if (error) throw error;
      this._logPhoto(bucket, path, res);
      return path;
    },

    // ---------------------------------------------------------------- modals
    modal({ title = '', body = '', foot = '', wide = false, onClose } = {}) {
      const el = document.createElement('div');
      el.className = 'mdl';
      el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
      el.innerHTML = `<div class="mdl-card${wide ? ' wide' : ''}">
        <div class="mdl-head"><h3>${esc(title)}</h3><button class="icon-btn" data-x aria-label="Close">${icon('close', 20)}</button></div>
        <div class="mdl-body">${body}</div>${foot ? `<div class="mdl-foot">${foot}</div>` : ''}</div>`;
      // the page stays locked while any dialog is still open (a confirm inside a form, say)
      const close = () => { el.remove(); document.removeEventListener('keydown', onKey); FL.lockScroll(); if (onClose) onClose(); };
      const onKey = (e) => { if (e.key === 'Escape') close(); };
      el.addEventListener('mousedown', (e) => { if (e.target === el) close(); });
      el.querySelector('[data-x]').onclick = close;
      document.addEventListener('keydown', onKey);
      document.body.appendChild(el);
      this.lockScroll();
      const first = el.querySelector('input:not([type=hidden]),textarea,select');
      if (first && window.matchMedia('(min-width:768px)').matches) setTimeout(() => first.focus(), 60);
      return { el, close, q: (s) => el.querySelector(s), qa: (s) => el.querySelectorAll(s) };
    },

    // page scrolling is off only while a dialog or drawer is on screen
    lockScroll() { document.body.style.overflow = document.querySelector('.mdl, .cr-drawer, [data-scroll-lock]') ? 'hidden' : ''; },

    // generic form in a modal. fields: {k, label, type, req, max, ph, help, half, options:[[v,l]], html}
    // onSave(values, modal) may throw an Error (shown in the form) or return false to keep it open.
    form({ title, fields, values = {}, onSave, onDelete, wide = false, saveLabel = 'Save', note = '* Indicates required' }) {
      const fieldHtml = (f) => {
        if (f.html) return f.html;
        const v = values[f.k] ?? f.def ?? '';
        const lbl = `<label for="f_${f.k}" class="${f.req ? 'req' : ''}">${esc(f.label)}</label>`;
        let input;
        if (f.type === 'textarea') input = `<textarea id="f_${f.k}" maxlength="${f.max || 2000}" placeholder="${esc(f.ph || '')}" style="min-height:${f.rows || 120}px">${esc(v)}</textarea>`;
        else if (f.type === 'select') input = `<select id="f_${f.k}">${f.optionsHtml || (f.options || []).map(([ov, ol]) => `<option value="${esc(ov)}" ${String(v) === String(ov) ? 'selected' : ''}>${esc(ol)}</option>`).join('')}</select>`;
        else if (f.type === 'checkbox') return `<label class="check" style="margin-bottom:12px;color:var(--bone)"><input type="checkbox" id="f_${f.k}" ${v ? 'checked' : ''}><span>${esc(f.label)}</span></label>`;
        else input = `<input id="f_${f.k}" type="${f.type || 'text'}" value="${esc(v)}" maxlength="${f.max || 200}" placeholder="${esc(f.ph || '')}" ${f.min != null ? `min="${f.min}"` : ''} ${f.maxv != null ? `max="${f.maxv}"` : ''} ${f.type === 'number' ? 'inputmode="numeric"' : ''}>`;
        return `<div class="field">${lbl}${input}${f.help ? `<span class="help">${esc(f.help)}</span>` : ''}</div>`;
      };
      let body = '', buf = [];
      const flush = () => { if (buf.length) { body += `<div class="row2">${buf.join('')}</div>`; buf = []; } };
      for (const f of fields) { if (f.half) { buf.push(fieldHtml(f)); if (buf.length === 2) flush(); } else { flush(); body += fieldHtml(f); } }
      flush();
      const m = this.modal({ title, wide, body: `${note ? `<p class="t-xs muted" style="margin:0 0 12px">${esc(note)}</p>` : ''}${body}<div class="err hidden" id="fErr"></div>`,
        foot: `${onDelete ? `<button class="pill ghost left" data-del style="color:var(--danger-text);border-color:var(--line-2)">Delete</button>` : ''}<button class="pill solid" data-save>${esc(saveLabel)}</button>` });
      const read = () => Object.fromEntries(fields.filter((f) => f.k).map((f) => { const el = m.q('#f_' + f.k); return [f.k, !el ? null : f.type === 'checkbox' ? el.checked : el.value.trim()]; }));
      const err = m.q('#fErr');
      const showErr = (t) => { err.textContent = t; err.classList.remove('hidden'); err.scrollIntoView({ block: 'nearest' }); };
      m.q('[data-save]').onclick = async (e) => {
        const vals = read();
        const missing = fields.find((f) => f.req && f.k && !vals[f.k]);
        if (missing) return showErr(`${missing.label} is required.`);
        err.classList.add('hidden');
        this.busy(e.target, true, 'Saving…');
        try { const ok = await onSave(vals, m); if (ok !== false) m.close(); }
        catch (ex) { showErr(this.friendly(ex)); }
        finally { this.busy(e.target, false); }
      };
      if (onDelete) m.q('[data-del]').onclick = async () => {
        if (!(await this.confirm('Delete?', 'This will be removed.', 'Delete', true))) return;
        try { await onDelete(); m.close(); } catch (ex) { this.toast(this.friendly(ex), 'err'); }
      };
      return m;
    },

    // GST number check (same rule as the database) — instant feedback while typing
    gstinValid(g) {
      const c = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; g = String(g || '').toUpperCase().replace(/\s/g, '');
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g)) return false;
      let s = 0;
      for (let i = 0; i < 14; i++) { const p = c.indexOf(g[i]) * (i % 2 === 0 ? 1 : 2); s += Math.floor(p / 36) + (p % 36); }
      return c[(36 - (s % 36)) % 36] === g[14];
    },

    // Edge Function call with the member's login; returns {data} or {error}
    async fn(name, body) {
      try {
        const { data, error } = await sb.functions.invoke(name, { body });
        if (error) {
          try { const j = await error.context.json(); if (j && j.message) return { data: j }; } catch (_) {}
          return { error: { message: error.message } };
        }
        return { data };
      } catch (e) { return { error: e }; }
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
      <p style="margin-top:0">The Fit Lab is a <b>professional network</b> for the health and fitness industry — trainers, coaches, physios, doctors, dietitians, gyms, clinics and learners. These rules keep it useful and safe for everyone — women and men alike.</p>
      <h4>1 · Keep it professional</h4>
      <ul><li>Talk training, rehab, nutrition, health science, careers, hiring and courses.</li>
      <li>Use your real name and a clear, professional headshot. Pages must represent a real organisation you're authorised to act for.</li></ul>
      <h4>2 · This is not a dating space</h4>
      <ul><li>No romantic or flirty messages, compliments on looks, or asking whether someone is single.</li>
      <li>No requests for personal photos. Connect only for professional reasons.</li></ul>
      <h4>3 · Respect everyone</h4>
      <ul><li>No abuse, profanity, slurs, harassment or threats — in any language.</li>
      <li>Disagree with ideas, never attack people.</li></ul>
      <h4>4 · Sharing contact details</h4>
      <ul><li>You're free to share your phone number, email, website or social media — in messages, on your profile and on your page. Only share what you're comfortable with.</li>
      <li>InMail is for jobs and hiring. Jobs must show their pay and can never ask applicants for a fee or deposit.</li></ul>
      <h4>How this is enforced</h4>
      <ul><li>Automatic checks block abusive, sexual and dating-style text before it is sent.</li>
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
        if (data.code === 'premium') { this.upsell('Premium feature', data.message, /Recruiter/.test(data.message || '') ? 'recruiter' : 'pro'); return null; }
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

    // invite: optional note + how you know them (private category)
    CONN_TAGS: [['colleague', 'Colleague'], ['client', 'Client'], ['coach', 'My coach / trainer'], ['mentor', 'Mentor'], ['mentee', 'Mentee / student'],
      ['referral', 'Referral partner'], ['business', 'Business contact'], ['classmate', 'Classmate'], ['event', 'Met at an event'], ['friend', 'Friend'], ['other', 'Other']],
    tagOptions(sel = '', empty = 'Choose (optional)') {
      return `<option value="">${esc(empty)}</option>` + this.CONN_TAGS.map(([k, l]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${esc(l)}</option>`).join('');
    },
    connect(username, name) {
      return new Promise((resolve) => {
        let done = false;
        const m = this.modal({ title: `Invite ${name || '@' + username} to connect`, body: `
          <div class="field" style="margin-bottom:12px"><label for="cnTag">How do you know ${esc(name || 'them')}?</label>
            <select id="cnTag">${this.tagOptions()}</select>
            <div class="t-xs muted" style="margin-top:4px">Only you see this — it helps you sort your network.</div></div>
          <p class="t-sm" style="margin:0 0 10px;line-height:1.55">A short note about why you'd like to connect makes people more likely to accept.</p>
          <div id="cnNoteWrap" hidden><textarea id="cnNote" maxlength="300" placeholder="e.g. Hi, I saw your post on PCOS programming — I coach similar clients in Kakinada and would love to connect."></textarea>
          <div class="t-xs muted" style="text-align:right;margin-top:4px" id="cnCount">0 / 300</div></div>`,
          foot: `<button class="pill ghost" id="cnAdd">Add a note</button><button class="pill solid" id="cnSend">Send without a note</button>`,
          onClose: () => { if (!done) resolve(null); } });
        const ta = m.q('#cnNote'), send = m.q('#cnSend'), add = m.q('#cnAdd');
        add.onclick = () => { m.q('#cnNoteWrap').hidden = false; add.hidden = true; send.textContent = 'Send'; ta.focus(); };
        ta.oninput = () => { m.q('#cnCount').textContent = `${ta.value.length} / 300`; };
        send.onclick = async () => {
          this.busy(send, true, 'Sending…');
          const r = await this.call('send_invite', { p_username: username, p_note: ta.value.trim() || null, p_tag: m.q('#cnTag').value || null });
          this.busy(send, false);
          if (!r) return;
          done = true; m.close();
          this.toast(r.status === 'accepted' ? 'You are now connected' : 'Invitation sent', 'ok');
          resolve(r);
        };
      });
    },

    // pick or change the private category of a connection
    async tagConnection(userId, name, current) {
      return new Promise((resolve) => {
        const m = this.modal({ title: `How do you know ${name || 'this member'}?`, body: `
          <div class="radio-list">${this.CONN_TAGS.map(([k, l]) => `<label><input type="radio" name="ct" value="${k}" ${k === current ? 'checked' : ''}>${esc(l)}</label>`).join('')}</div>
          <p class="t-xs muted" style="margin:10px 0 0">Only you see this.</p>`,
          foot: `${current ? '<button class="pill ghost" data-clear>Remove</button>' : ''}<button class="pill solid" data-ok>Save</button>`,
          onClose: () => resolve(null) });
        const save = async (tag) => {
          const r = await this.call('set_connection_tag', { p_other: userId, p_tag: tag });
          if (!r) return; m.close(); this.toast(tag ? 'Saved' : 'Removed', 'ok'); resolve(r);
        };
        m.q('[data-ok]').onclick = () => { const c = m.q('input[name=ct]:checked'); if (!c) return this.toast('Choose one', 'err'); save(c.value); };
        const cl = m.q('[data-clear]'); if (cl) cl.onclick = () => save(null);
      });
    },

    // social links shown on profiles (labelled chips, no brand logos)
    SOCIAL: [['instagram', 'Instagram', 'camera', '@yourname'], ['youtube', 'YouTube', 'play', '@yourchannel'], ['facebook', 'Facebook', 'users', 'facebook.com/yourpage'],
      ['linkedin', 'LinkedIn', 'briefcase', 'linkedin.com/in/yourname'], ['x', 'X (Twitter)', 'at', '@yourname'], ['threads', 'Threads', 'at', '@yourname'],
      ['whatsapp', 'WhatsApp', 'messages', 'Your number, e.g. 98765 43210'], ['telegram', 'Telegram', 'send', '@yourname'], ['website', 'Website', 'globe', 'yourgym.in']],
    socialChips(links) {
      if (!links) return '';
      return this.SOCIAL.filter(([k]) => links[k] && /^https:\/\//.test(links[k]))
        .map(([k, l, ic]) => `<a class="soc" href="${esc(links[k])}" target="_blank" rel="noopener nofollow ugc">${icon(ic, 15)}${esc(l)}</a>`).join('');
    },

    // ---------------------------------------------------------------- safe, light photos
    // Every photo is shrunk on the member's own device before upload (smaller files, location
    // data removed) and checked for nudity there too — the photo never leaves the phone for the check.
    photoCheck: {
      _ready: null,
      CDN: 'https://cdn.jsdelivr.net/npm/nsfwjs@4.4.0/dist/',
      load() {
        if (!this._ready) {
          this._ready = (async () => {
            const add = (src) => new Promise((res, rej) => {
              const el = document.createElement('script'); el.src = src; el.async = false; el.crossOrigin = 'anonymous';
              el.onload = res; el.onerror = () => rej(new Error('photo check unavailable')); document.head.appendChild(el);
            });
            if (!window.nsfwjs) for (const f of ['models/mobilenet_v2/model.min.js', 'models/mobilenet_v2/group1-shard1of1.min.js', 'browser/nsfwjs.min.js']) await add(this.CDN + f);
            return window.nsfwjs.load('MobileNetV2');
          })();
          this._ready.catch(() => { this._ready = null; });
        }
        return this._ready;
      },
      warm() { this.load().catch(() => {}); },
      // {verdict: 'passed' | 'review' | 'blocked' | 'unchecked', scores}
      async check(source) {
        let model;
        try { model = await Promise.race([this.load(), new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 25000))]); }
        catch (e) { return { verdict: 'unchecked', scores: null }; }
        try {
          const s = Object.fromEntries((await model.classify(source)).map((x) => [x.className, Math.round(x.probability * 1000) / 1000]));
          const porn = s.Porn || 0, hentai = s.Hentai || 0;
          // "Sexy" never blocks: gym, physique and swimwear photos are normal here.
          if (porn >= 0.85 || hentai >= 0.85 || porn + hentai >= 0.9) return { verdict: 'blocked', scores: s };
          return { verdict: porn + hentai >= 0.5 ? 'review' : 'passed', scores: s };
        } catch (e) { return { verdict: 'unchecked', scores: null }; }
      },
    },
    BLOCKED_PHOTO: 'This photo can\'t be used on The Fit Lab — it looks like it may show nudity. Gym, physique and sports photos are fine; please choose a different photo.',
    async _logPhoto(bucket, path, res) {
      if (!res || res.verdict === 'passed') return;
      try { await sb.rpc('log_media_check', { p_bucket: bucket, p_path: path, p_verdict: res.verdict, p_scores: res.scores }); } catch (e) { /* never block the member */ }
    },
    // shrink a photo on the device: crop (square / aspect), resize, re-encode (WebP where the browser can, else JPEG)
    async compressImage(file, { max = 1600, square = false, aspect = null, quality = 0.82, format = 'webp' } = {}) {
      if (!file) throw new Error('Choose a photo');
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Use a JPG, PNG or WebP image');
      const img = await new Promise((resolve, reject) => {
        const el = new Image(); const url = URL.createObjectURL(file);
        el.onload = () => { URL.revokeObjectURL(url); resolve(el); };
        el.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a readable image')); };
        el.src = url;
      });
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (square || aspect) {
        const want = square ? 1 : aspect;
        if (sw / sh > want) { const nw = sh * want; sx = (sw - nw) / 2; sw = nw; } else { const nh = sw / want; sy = (sh - nh) / 2; sh = nh; }
      }
      const scale = Math.min(1, max / Math.max(sw, sh));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(sw * scale)); c.height = Math.max(1, Math.round(sh * scale));
      const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);   // transparent PNGs get a white background
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      const enc = (type, q) => new Promise((res) => c.toBlob(res, type, q));
      let blob = format === 'webp' ? await enc('image/webp', quality) : null;
      if (!blob || blob.type !== 'image/webp') blob = await enc('image/jpeg', quality);
      if (!blob) throw new Error('Could not process the image');
      return { blob, canvas: c };
    },
    // check, shrink and upload a photo to Storage — returns its public URL
    async uploadImage(file, { bucket = 'avatars', path, max = 1600, square = false, aspect = null, quality = 0.82, format = 'webp' } = {}) {
      if (!file) return null;
      const { blob, canvas } = await this.compressImage(file, { max, square, aspect, quality, format });
      const res = await this.photoCheck.check(canvas);
      if (res.verdict === 'blocked') { this._logPhoto(bucket, null, res); throw new Error(this.BLOCKED_PHOTO); }
      const { error } = await sb.storage.from(bucket).upload(path, blob, { upsert: true, contentType: blob.type, cacheControl: '3600' });
      if (error) throw error;
      this._logPhoto(bucket, path, res);
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
        <a href="profile?u=${encodeURIComponent(p.username || '')}">${this.ringAvatar(p, 'avatar')}</a>
        <h3><a href="profile?u=${encodeURIComponent(p.username || '')}" style="color:var(--bone)">${esc(p.full_name || 'Member')}</a>${this.tick(p.verified || p.is_owner, 15)}</h3>
        <p>${esc(p.headline || p.occupation || 'Add a headline to your profile')}</p>
        <div class="divider"></div>
        <a class="stat" href="network#connections"><span>Connections</span><b>${counts.connections ?? '—'}</b></a>
        <a class="stat" href="courses"><span>Courses</span><b>${counts.courses ?? '—'}</b></a>
        <a class="stat" href="insights"><span>Profile insights</span><b>→</b></a>
        <div class="divider" style="margin-top:6px"></div>
        <a class="stat" href="profile?u=${encodeURIComponent(p.username || '')}"><span class="mono" style="font-size:11px">${esc(p.unique_id || '')}</span>${this.starsIf(p.star_count || 0, p.star_tier)}</a>
      </div>`;
    },

    siteFootHtml(compact = false) {
      const links = `<a href="jobs">Jobs</a><a href="company">Pages</a><a href="premium">Premium</a><a href="hire">Hire a coach</a><a href="verify">Verify a certificate</a><a href="#" data-guidelines>Community guidelines</a><a href="settings">Settings</a><a href="mailto:${esc(cfg.SUPPORT_EMAIL || '')}">Help</a>`;
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
                ${n.link_url ? `<a class="btn btn-primary" href="${this.esc(this.href(n.link_url))}">Take a look</a>` : ''}
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
      const f = (location.pathname.split('/').pop() || 'index').replace('.html', '');
      return ({ feed: 'home', network: 'network', connections: 'network', members: 'network', courses: 'courses', dashboard: 'courses',
                lesson: 'courses', exam: 'courses', messaging: 'messages', chat: 'messages', notifications: 'notifications',
                profile: 'profile', settings: 'me', search: 'search', admin: 'admin', jobs: 'jobs', hiring: 'jobs',
                company: 'network', premium: 'me', verification: 'me', insights: 'me' })[f] || f;
    },

    renderHeader(profile) {
      const page = this.pageKey();
      document.body.classList.add('app');
      document.querySelectorAll('.topbar,.bottombar,.me-menu').forEach((e) => e.remove());
      const legacy = document.getElementById('nav'); if (legacy) legacy.innerHTML = '';

      const tabs = [
        ['home', 'feed', 'Home', 'home', null],
        ['network', 'network', 'My Network', 'network', 'invitations'],
        ['jobs', 'jobs', 'Jobs', 'briefcase', null],
        ['courses', 'courses', 'Courses', 'courses', null],
        ['tools', 'tools', 'Tools', 'calc', null],
        ['messages', 'messaging', 'Messaging', 'messages', 'messages'],
        ['notifications', 'notifications', 'Notifications', 'bell', 'notifications'],
      ];
      const q = this.param('q') || '';
      const bar = document.createElement('header');
      bar.className = 'topbar';
      if (profile) {
        bar.innerHTML = `<div class="topbar-in">
          <a class="tb-logo" href="feed" aria-label="The Fit Lab — home"><img class="logo-d" src="assets/logo-600.png" alt="The Fit Lab"><img class="logo-l" src="assets/logo-600-light.png" alt="" aria-hidden="true"></a>
          <form class="tb-search" action="search" role="search">${icon('search', 17)}
            <input name="q" type="search" placeholder="Search people, jobs, pages" value="${esc(q)}" aria-label="Search"></form>
          <nav class="tb-tabs">
            ${tabs.map(([k, href, label, ic, cnt]) => `<a class="tb-tab ${k === 'messages' ? 'tb-msg' : ''} ${k === 'tools' ? 'tb-tools' : ''} ${page === k ? 'on' : ''}" href="${href}"${k === 'tools' ? ' aria-label="Coach tools"' : ''}>
              <span class="ic">${icon(ic, 24)}${cnt ? `<span class="cnt" data-cnt="${cnt}"></span>` : ''}</span><span class="lbl">${label}</span></a>`).join('')}
            <button class="tb-tab tb-me ${page === 'me' || (page === 'profile' && this.param('u') === profile.username) ? 'on' : ''}" type="button" aria-haspopup="true" aria-expanded="false">
              <span class="ic">${this.avatarHtml(profile, 'ava avatar')}</span><span class="lbl">Me ${icon('down', 12)}</span></button>
            ${(profile.is_admin || profile.is_owner) ? `<span class="tb-sep"></span><a class="tb-tab ${/\/admin(\.html)?$/.test(location.pathname) ? 'on' : ''}" href="admin"><span class="ic">${icon('shield', 24)}</span><span class="lbl">Admin</span></a>` : ''}
            <a class="tb-prem" href="premium">${icon('crown', 15)}<span id="tbPremLbl">Try Premium</span></a>
          </nav></div>`;
      } else {
        bar.innerHTML = `<div class="topbar-in">
          <a class="tb-logo" href="/" aria-label="The Fit Lab"><img class="logo-d" src="assets/logo-600.png" alt="The Fit Lab"><img class="logo-l" src="assets/logo-600-light.png" alt="" aria-hidden="true"></a>
          <nav class="tb-tabs" style="gap:8px;align-items:center">
            <a class="txt-btn" href="tools" title="Free tools" aria-label="Free tools">${icon('calc', 18)}<span class="lbl">Free tools</span></a>
            <a class="txt-btn" href="hire" title="Hire a coach" aria-label="Hire a coach">${icon('hire', 18)}<span class="lbl">Hire a coach</span></a>
            <a class="txt-btn" href="verify" title="Verify a certificate" aria-label="Verify a certificate">${icon('award', 18)}<span class="lbl">Verify</span></a>
            ${this.themeToggleHtml()}
            ${/\/(index(\.html)?)?$/.test(location.pathname) ? '' : '<a class="pill solid sm" href="/">Sign in</a>'}
          </nav></div>`;
      }
      document.body.prepend(bar);

      if (!profile) return;
      const mobileTabs = [
        ['home', 'feed', 'Home', 'home', null],
        ['network', 'network', 'Network', 'network', 'invitations'],
        ['jobs', 'jobs', 'Jobs', 'briefcase', null],
        ['courses', 'courses', 'Courses', 'courses', null],
        ['notifications', 'notifications', 'Alerts', 'bell', 'notifications'],
      ];
      const bb = document.createElement('nav');
      bb.className = 'bottombar';
      bb.innerHTML = mobileTabs.map(([k, href, label, ic, cnt]) => `<a href="${href}" class="${page === k ? 'on' : ''}" data-bb="${k}">
        <span class="ic">${icon(ic, 24)}${cnt ? `<span class="cnt" data-cnt="${cnt}"></span>` : ''}</span>${label}</a>`).join('');
      document.body.appendChild(bb);

      const menu = document.createElement('div');
      menu.className = 'me-menu';
      menu.innerHTML = `
        <div class="me-head">${this.avatarHtml(profile, 'avatar')}<div><b>${esc(profile.full_name || 'Member')} ${this.tick(profile.verified || profile.is_owner, 15)}</b><span>${esc(profile.headline || profile.occupation || profile.unique_id || '')}</span></div></div>
        <a class="pill btn-view" href="profile?u=${encodeURIComponent(profile.username || '')}">View profile</a>
        <div class="me-sec"><h6>Premium &amp; trust</h6>
          <a href="premium" class="gold-lnk">${icon('crown', 18)}<span id="mePremLbl">Try Premium free for 14 days</span></a>
          ${(profile.verified || profile.is_owner) ? `<a href="verification">${icon('tick', 18)}You're verified</a>` : `<a href="verification">${icon('tick', 18)}Get the verified tick</a>`}
          <a href="insights">${icon('chart', 18)}Profile insights</a></div>
        <div class="me-sec"><h6>Clients &amp; bookings</h6>
          <a href="tools">${icon('calc', 18)}Coach tools</a>
          <a href="bookings">${icon('calendar', 18)}Bookings</a>
          <a href="requests">${icon('target', 18)}Client requests</a>
          <a href="bookings#settings">${icon('clock', 18)}Booking settings</a></div>
        <div class="me-sec"><h6>Jobs &amp; pages</h6>
          <a href="jobs?tab=applied">${icon('briefcase', 18)}My jobs</a>
          <a href="hiring">${icon('userplus', 18)}Hiring &amp; job posts</a>
          <div id="meMyPages"></div>
          <a href="company?new=1">${icon('building', 18)}Create a page</a></div>
        <div class="me-sec"><h6>Appearance</h6>${this.themeSwitchHtml()}</div>
        <div class="me-sec"><h6>Account</h6>
          <a href="settings">${icon('settings', 18)}Settings &amp; privacy</a>
          <a href="settings#notifications">${icon('bell', 18)}Pop-up notifications</a>
          <button class="lnk" type="button" id="meInstall" hidden>${icon('phone', 18)}Install the app</button>
          <a href="courses">${icon('award', 18)}Courses &amp; certificates</a>
          <button class="lnk" type="button" data-guidelines>${icon('shield', 18)}Community guidelines</button>
          <a href="mailto:${esc(cfg.SUPPORT_EMAIL || '')}">${icon('help', 18)}Help</a></div>
        <div class="me-sec"><h6>For gyms &amp; studios</h6><a href="hire">${icon('hire', 18)}Hire a coach</a>
          ${(profile.is_admin || profile.is_owner) ? `<a href="admin">${icon('shield', 18)}Admin control room</a>` : ''}</div>
        <div class="me-sec"><button class="lnk" type="button" id="btnSignOut">${icon('logout', 18)}Sign out</button></div>`;
      document.body.appendChild(menu);

      const meBtn = bar.querySelector('.tb-me');
      const toggle = (on) => {
        // open right under the Me button, wherever the page is scrolled to
        if (on) menu.style.right = Math.max(12, Math.round(innerWidth - meBtn.getBoundingClientRect().right)) + 'px';
        menu.classList.toggle('on', on); meBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
      };
      meBtn.onclick = (e) => { e.stopPropagation(); toggle(!menu.classList.contains('on')); };
      document.addEventListener('click', (e) => { if (!menu.contains(e.target) && !meBtn.contains(e.target)) toggle(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
      menu.querySelector('#btnSignOut').onclick = () => this.signOut();
      menu.querySelector('#meInstall').onclick = () => { toggle(false); this.installApp(); };
      // Premium + my pages in the menu (non-blocking)
      sb.rpc('my_premium').then(({ data }) => {
        this._prem = data;
        if (data && data.plan) {
          const t = `${this.PLAN_NAMES[data.plan]}${data.source === 'trial' ? ' trial' : ''}`;
          const a = document.getElementById('tbPremLbl'); if (a) a.textContent = t;
          const b = document.getElementById('mePremLbl'); if (b) b.textContent = `Premium: ${t}`;
        }
      }).catch(() => {});
      sb.rpc('my_pages').then(({ data }) => {
        const el = document.getElementById('meMyPages');
        if (el && data && data.length) el.innerHTML = data.slice(0, 3).map((p) => `<a href="company?p=${encodeURIComponent(p.slug)}">${icon('building', 18)}${esc(p.name)}</a>`).join('');
      }).catch(() => {});
      this.wireCommon(document);
      this.refreshCounts();
      clearInterval(this._cntTimer);
      this._cntTimer = setInterval(() => { if (document.visibilityState === 'visible') this.refreshCounts(); }, 25000);
      // app install, device pop-ups, daily housekeeping (all non-blocking)
      this.push.reg().then(() => this.push.sync()).catch(() => {});
      if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', (e) => { if (e.data && e.data.type === 'fl-push') this.refreshCounts(); });
      window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); this._installEvt = e; const a = document.getElementById('meInstall'); if (a) a.hidden = false; });
      if (!this.isStandalone() && this.isIOS()) { const a = document.getElementById('meInstall'); if (a) a.hidden = false; }
      if (profile.id) this.dailyTick(profile.id);
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
        const prev = this.counts; this.counts = data;
        this.liveCheck(prev, data);
        document.querySelectorAll('[data-cnt]').forEach((el) => {
          const n = data[el.dataset.cnt] || 0;
          el.dataset.n = n; el.textContent = n ? (n > 99 ? '99+' : n) : '';
        });
        const total = (data.messages || 0) + (data.notifications || 0) + (data.invitations || 0);
        const base = document.title.replace(/^\(\d+\+?\)\s*/, '');
        document.title = total ? `(${total > 99 ? '99+' : total}) ${base}` : base;
        // number on the installed app's icon
        try { if (navigator.setAppBadge) { if (total) navigator.setAppBadge(total); else navigator.clearAppBadge(); } } catch (_) {}
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

    // ---------------------------------------------------------------- app + pop-up notifications
    isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); },
    isStandalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; },

    push: {
      // fix-28: the key pair lives in the database; the public half comes from push_public_key()
      _key: null,
      supported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; },
      async reg() {
        if (!('serviceWorker' in navigator)) return null;
        try { return await navigator.serviceWorker.register('sw.js', { scope: './' }); } catch (_) { return null; }
      },
      async current() {
        if (!this.supported()) return null;
        const r = await this.reg(); if (!r) return null;
        try { return await r.pushManager.getSubscription(); } catch (_) { return null; }
      },
      // { supported, permission, on, needsInstall }
      async status() {
        const needsInstall = FL.isIOS() && !FL.isStandalone();
        if (!this.supported()) return { supported: false, permission: 'unsupported', on: false, needsInstall };
        const sub = await this.current();
        return { supported: true, permission: Notification.permission, on: !!sub && Notification.permission === 'granted', needsInstall };
      },
      async keyText() {
        if (this._key) return this._key;
        try { const { data } = await sb.rpc('push_public_key'); if (data) this._key = String(data); } catch (_) {}
        if (!this._key) throw new Error('Pop-up notifications are being set up. Please try again in a minute.');
        return this._key;
      },
      async key() {
        const b = (await this.keyText()).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(b + '==='.slice((b.length + 3) % 4));
        return Uint8Array.from(raw, (c) => c.charCodeAt(0));
      },
      // was this device subscribed with the current key? (older subscriptions used a key that never worked)
      async sameKey(sub) {
        try {
          const k = sub && sub.options && sub.options.applicationServerKey;
          if (!k) return true;                       // browser doesn't tell us — assume it's fine
          const a = new Uint8Array(k), b = await this.key();
          return a.length === b.length && a.every((v, i) => v === b[i]);
        } catch (_) { return true; }
      },
      async save(sub) {
        const j = sub.toJSON();
        const { data, error } = await sb.rpc('save_push_subscription', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth,
          p_user_agent: (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || null });
        if (error || !data || data.ok === false) throw new Error((data && data.message) || (error && error.message) || 'Could not save');
        try { localStorage.setItem('fl:pushsync', String(Date.now())); } catch (_) {}
        return data;
      },
      async subscribe(r) {
        let sub = await r.pushManager.getSubscription();
        if (sub && !(await this.sameKey(sub))) { try { await sub.unsubscribe(); } catch (_) {} sub = null; }
        if (!sub) sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: await this.key() });
        await this.save(sub);
        return sub;
      },
      // must be called from a click
      async enable() {
        if (!this.supported()) throw new Error(FL.isIOS() && !FL.isStandalone()
          ? 'On iPhone and iPad, first add The Fit Lab to your Home Screen (Share → Add to Home Screen), then open it from there and turn notifications on.'
          : 'This browser doesn\'t support pop-up notifications. Try Chrome, Edge, Firefox or Safari.');
        const perm = await Notification.requestPermission();      // first, while the tap still counts
        if (perm !== 'granted') throw new Error(perm === 'denied'
          ? 'Notifications are blocked for this site. Allow them in your browser\'s site settings, then try again.'
          : 'Notifications weren\'t allowed.');
        try { localStorage.removeItem('fl:pushoff'); } catch (_) {}
        const r = await this.reg(); if (!r) throw new Error('Couldn\'t start notifications on this device.');
        await navigator.serviceWorker.ready;
        await this.subscribe(r);
        FL._pushOn = true;
        return true;
      },
      async disable() {
        const sub = await this.current();
        if (sub) { try { await sb.rpc('remove_push_subscription', { p_endpoint: sub.endpoint }); } catch (_) {} try { await sub.unsubscribe(); } catch (_) {} }
        try { localStorage.setItem('fl:pushoff', '1'); } catch (_) {}
        FL._pushOn = false;
      },
      // on every visit: keep this device subscribed with the current key (no prompt needed once allowed)
      async sync() {
        if (!this.supported() || Notification.permission !== 'granted') { FL._pushOn = false; return; }
        let off = false; try { off = localStorage.getItem('fl:pushoff') === '1'; } catch (_) {}
        const r = await this.reg(); if (!r) return;
        let sub = await this.current();
        if (off && !sub) { FL._pushOn = false; return; }        // the member turned pop-ups off here
        const stale = sub && !(await this.sameKey(sub));
        let last = 0; try { last = +localStorage.getItem('fl:pushsync') || 0; } catch (_) {}
        if (!sub || stale || Date.now() - last > 86400000) {
          try { await navigator.serviceWorker.ready; sub = await this.subscribe(r); } catch (_) {}
        }
        FL._pushOn = !!sub;
      },
      // a small card asking to turn pop-ups on (feed + notifications), until turned on or dismissed for 2 weeks
      async nudge(host) {
        if (!host) return;
        let snooze = 0, off = false;
        try { snooze = +localStorage.getItem('fl:pushnudge') || 0; off = localStorage.getItem('fl:pushoff') === '1'; } catch (_) {}
        if (off || Date.now() < snooze) return;
        const st = await this.status();
        const ios = st.needsInstall;
        if (!ios && (!st.supported || st.permission !== 'default')) return;
        try { await this.keyText(); } catch (_) { if (!ios) return; }
        const el = document.createElement('div');
        el.className = 'box push-nudge';
        el.innerHTML = `<span class="pn-ic">${icon('bell', 22)}</span>
          <div class="pn-tx"><b>Get a pop-up when someone messages you</b>
            <span>${ios ? 'On iPhone, add The Fit Lab to your Home Screen first, then turn notifications on in Settings.' : 'Messages, invitations, job replies and bookings — even when The Fit Lab is closed. You choose which in Settings.'}</span></div>
          <div class="pn-act"><button type="button" class="pill solid sm" data-pn-on>${ios ? 'Show me how' : 'Turn on'}</button><button type="button" class="pill ghost sm" data-pn-later>Not now</button></div>`;
        host.prepend(el);
        el.querySelector('[data-pn-later]').onclick = () => { try { localStorage.setItem('fl:pushnudge', String(Date.now() + 14 * 86400000)); } catch (_) {} el.remove(); };
        el.querySelector('[data-pn-on]').onclick = async (e) => {
          if (ios) return FL.installApp();
          FL.busy(e.target, true, 'Turning on…');
          try { await this.enable(); el.remove(); FL.toast('Pop-ups are on for this device', 'ok'); }
          catch (err) { FL.busy(e.target, false); FL.notice('Notifications', err.message); if (Notification.permission === 'denied') el.remove(); }
        };
      },
    },

    // install the site as an app (Android / desktop Chrome & Edge)
    _installEvt: null,
    async installApp() {
      if (this._installEvt) { this._installEvt.prompt(); const c = await this._installEvt.userChoice; this._installEvt = null; return c.outcome === 'accepted'; }
      if (this.isIOS()) { const m = this.modal({ title: 'Add The Fit Lab to your Home Screen', body: `<ol style="line-height:1.7;margin:0;padding-left:20px"><li>Tap the <b>Share</b> button in Safari.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Open The Fit Lab from your Home Screen — then turn on notifications in Settings.</li></ol>`, foot: '<button class="pill solid" data-ok>OK</button>' }); m.q('[data-ok]').onclick = m.close; return false; }
      this.toast('Use your browser menu → "Install app" or "Add to Home screen".');
      return false;
    },

    // pop-ups inside the site while it's open (for devices without system pop-ups)
    liveToast(n) {
      let host = document.querySelector('.live-toasts');
      if (!host) { host = document.createElement('div'); host.className = 'live-toasts'; host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
      const el = document.createElement('a');
      el.className = 'live-toast'; el.href = this.href(n.url) || 'notifications';
      el.innerHTML = `${n.actor ? this.avatarHtml(n.actor, 'avatar') : `<span class="lt-ic">${icon(n.icon || 'bell', 20)}</span>`}
        <span class="lt-tx"><b>${esc(n.title || '')}</b>${n.body ? `<span>${esc(n.body)}</span>` : ''}</span>
        <button type="button" class="lt-x" aria-label="Dismiss">${icon('close', 16)}</button>`;
      el.querySelector('.lt-x').onclick = (e) => { e.preventDefault(); e.stopPropagation(); el.remove(); };
      host.prepend(el);
      while (host.children.length > 3) host.lastChild.remove();
      setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 7000);
    },
    async liveCheck(prev, now) {
      if (!prev || this._pushOn) return;
      try {
        if ((now.notifications || 0) > (prev.notifications || 0)) {
          const { data } = await sb.rpc('list_notifications', { p_limit: 5 });
          let seen = []; try { seen = JSON.parse(sessionStorage.getItem('fl:lt') || '[]'); } catch (_) {}
          (data || []).filter((n) => !n.is_read && !seen.includes(n.id)).slice(0, 2).reverse().forEach((n) => {
            seen.push(n.id); this.liveToast({ title: n.title, body: n.body, url: n.link_url || 'notifications', actor: n.actor });
          });
          try { sessionStorage.setItem('fl:lt', JSON.stringify(seen.slice(-50))); } catch (_) {}
        }
        if ((now.messages || 0) > (prev.messages || 0) && !/\/messaging(\.html)?$/.test(location.pathname)) {
          const { data } = await sb.rpc('list_conversations');
          const c = (data || []).filter((x) => x.unread > 0 && !x.last_mine).sort((a, b) => new Date(b.last_at) - new Date(a.last_at))[0];
          if (c) this.liveToast({ title: c.full_name, body: c.last_body, url: 'messaging?u=' + encodeURIComponent(c.username), actor: c, icon: 'messages' });
        }
      } catch (_) {}
    },

    // once a day: Premium reminders etc.
    async dailyTick(uid) {
      const k = 'fl:tick:' + uid + ':' + new Date().toISOString().slice(0, 10);
      try { if (localStorage.getItem(k)) return; localStorage.setItem(k, '1'); } catch (_) {}
      try { await sb.rpc('daily_tick'); } catch (_) {}
    },

    param(name) { return new URLSearchParams(location.search).get(name); },
    // links saved before clean addresses ("jobs.html?x") → "jobs?x"; other links unchanged
    href(u) { return typeof u === 'string' ? u.replace(/^([a-z0-9_-]+)\.html(?=[?#]|$)/i, '$1') : u; },

    busy(btn, on, label) {
      if (!btn) return;
      if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spin"></span> ${label || 'Working…'}`; }
      else { btn.disabled = false; btn.innerHTML = btn.dataset.label || btn.innerHTML; }
    }
  };

  window.FL = FL;
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('[data-theme-toggle]');
    if (b) FL.theme.set(FL.theme.isDark() ? 'light' : 'dark');
  });
  const addLandingToggle = () => {
    const nav = document.querySelector('.lp-top nav');
    if (nav && !nav.querySelector('[data-theme-toggle]')) nav.insertAdjacentHTML('afterbegin', FL.themeToggleHtml());
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addLandingToggle); else addLandingToggle();
  try { matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => FL.syncThemeToggles()); } catch (_) {}
  // start loading the photo check as soon as someone opens a file picker, so it's ready when they choose a photo
  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest && e.target.closest('input[type=file], label');
    if (t && (t.matches('input[type=file]') || t.querySelector('input[type=file]'))) FL.photoCheck.warm();
  }, true);
})();
