// =====================================================================
//  THE FIT LAB — ad tracking (Meta Pixel + URL parameters)
//  • Remembers where a visitor came from (utm_* / fbclid) — first and latest
//    visit — and saves it on their account when they sign up.
//  • Loads the Meta Pixel when FITLAB_CONFIG.META_PIXEL_ID is set.
//  • Every Purchase uses the Razorpay order id as its event ID, so the
//    browser event and the server event (Conversions API) are counted once.
// =====================================================================
(function () {
  const C = window.FITLAB_CONFIG || {};
  const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'fbclid', 'gclid', 'placement', 'site_source'];
  const STANDARD = new Set(['PageView', 'ViewContent', 'Lead', 'CompleteRegistration', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Contact', 'SubmitApplication', 'Search', 'Subscribe', 'StartTrial']);
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
  };
  const cookie = (n) => { const m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : ''; };

  // ---- where did this visit come from?
  const q = new URLSearchParams(location.search);
  const touch = {};
  KEYS.forEach((k) => { const v = q.get(k); if (v) touch[k] = v.slice(0, 150); });
  const ref = document.referrer && !document.referrer.includes(location.host) ? document.referrer.slice(0, 300) : '';
  if (Object.keys(touch).length || (ref && !store.get('fl_first'))) {
    Object.assign(touch, { landing: (location.pathname + location.search).slice(0, 300), at: new Date().toISOString() });
    if (ref) touch.referrer = ref;
    if (!store.get('fl_first')) store.set('fl_first', touch);
    store.set('fl_last', touch);
  }
  // Meta's click id → _fbc cookie (the Pixel also does this; this covers ad blockers / no-pixel setups)
  if (touch.fbclid && !cookie('_fbc')) {
    document.cookie = `_fbc=fb.1.${Date.now()}.${touch.fbclid}; max-age=7776000; path=/; SameSite=Lax`;
  }

  // ---- Meta Pixel
  let pixel = false;
  if (C.META_PIXEL_ID) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', C.META_PIXEL_ID);
    window.fbq('track', 'PageView');
    pixel = true;
  }

  const lastTouch = () => store.get('fl_last') || store.get('fl_first') || {};
  window.FLTrack = {
    on: () => pixel,
    // Meta event; eventId de-duplicates against the server-side Conversions API event
    event(name, params, eventId) {
      if (!pixel) return;
      try { window.fbq(STANDARD.has(name) ? 'track' : 'trackCustom', name, params || {}, eventId ? { eventID: String(eventId) } : undefined); } catch (_) {}
    },
    // better ad matching once we know who the visitor is (the Pixel hashes these in the browser)
    identify(u) {
      if (!pixel || !u) return;
      const digits = String(u.phone || '').replace(/\D/g, '');
      const parts = String(u.full_name || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
      const data = { external_id: u.id, em: (u.email || '').toLowerCase() || undefined,
        ph: digits ? (digits.length === 10 ? '91' + digits : digits) : undefined,
        fn: parts[0], ln: parts.length > 1 ? parts[parts.length - 1] : undefined,
        ge: u.gender === 'female' ? 'f' : u.gender === 'male' ? 'm' : undefined,
        ct: (u.city || '').toLowerCase().replace(/[^a-z]/g, '') || undefined, country: 'in' };
      Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
      try { window.fbq('init', C.META_PIXEL_ID, data); } catch (_) {}
    },
    // sent with each order so the server can report the Purchase to Meta
    meta(funnel) {
      const t = lastTouch(), m = { fbp: cookie('_fbp'), fbc: cookie('_fbc'), url: location.href.split('#')[0].slice(0, 400), funnel: funnel || '' };
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => { if (t[k]) m[k] = t[k]; });
      Object.keys(m).forEach((k) => !m[k] && delete m[k]);
      return m;
    },
    first: () => store.get('fl_first'),
    last: lastTouch,
    async saveAttribution(funnel) {
      if (!window.sb) return;
      const f = store.get('fl_first') || {}, l = store.get('fl_last') || f;
      try { await window.sb.rpc('save_attribution', { p_funnel: funnel || null, p_first: f, p_last: l }); } catch (_) {}
    },
  };
})();
