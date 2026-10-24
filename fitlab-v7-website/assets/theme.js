/* THE FIT LAB — look bootstrap (load in <head>, before the CSS paints).
   Style: 'neon' (Neon Lab, the default) · 'pop' (Lab Notebook Pop) · 'pro' (Performance OS).
     Chosen by each person; kept on this device and on their account.
   Mode:  'system' follows the device; 'light' / 'dark' are manual choices.
   Sets <html data-style data-mode [data-theme]> and loads the fonts for that style. */
(function () {
  var d = document.documentElement;
  var get = function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } };
  var FONTS = {
    neon: 'family=Unbounded:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700',
    pop: 'family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Mono:wght@400;500',
    pro: 'family=Geist:wght@300..800&family=Geist+Mono:wght@400..700'
  };
  // browser bar colour for each look
  var BAR = { neon: ['#06070a', '#f3f6ef'], pop: ['#121311', '#f6f7f4'], pro: ['#0a0b0d', '#f6f7f9'] };
  var s = get('fl:style'); if (!FONTS[s]) s = 'neon';
  var t = get('fl:theme') || 'system';
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  var modeOf = function () {
    var th = d.getAttribute('data-theme');
    return th === 'light' || th === 'dark' ? th : (mq && mq.matches ? 'light' : 'dark');
  };
  d.setAttribute('data-style', s);
  if (t === 'light' || t === 'dark') d.setAttribute('data-theme', t); else d.removeAttribute('data-theme');
  d.setAttribute('data-mode', modeOf());
  // cards rise in on first paint only (styles.css .fl-enter)
  d.classList.add('fl-enter');
  setTimeout(function () { d.classList.remove('fl-enter'); }, 1600);

  var link = document.createElement('link');
  link.rel = 'stylesheet'; link.id = 'fl-fonts';
  link.href = 'https://fonts.googleapis.com/css2?' + FONTS[s] + '&display=swap';
  document.head.appendChild(link);
  var m = document.createElement('meta');
  m.name = 'color-scheme'; m.content = t === 'system' ? 'dark light' : t;
  document.head.appendChild(m);

  var paintBar = function () {
    var c = BAR[d.getAttribute('data-style')] || BAR.neon;
    var col = c[d.getAttribute('data-mode') === 'light' ? 1 : 0];
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    if (!metas.length) { var x = document.createElement('meta'); x.name = 'theme-color'; document.head.appendChild(x); metas = [x]; }
    for (var i = 0; i < metas.length; i++) metas[i].setAttribute('content', col);
  };
  paintBar();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintBar);
  if (mq) {
    var onChange = function () { if (!d.getAttribute('data-theme')) { d.setAttribute('data-mode', mq.matches ? 'light' : 'dark'); paintBar(); } };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  // used by app.js to switch looks without a reload
  window.FL_LOOK = { FONTS: FONTS, BAR: BAR, modeOf: modeOf, paintBar: paintBar };
})();
