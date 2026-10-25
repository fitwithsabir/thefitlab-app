/* THE FIT LAB — languages (load in <head> right after theme.js).

   Which language a page shows:
     1. the language this person chose (kept on this device and on their account)
     2. otherwise their phone / computer language, when The Fit Lab has it
     3. otherwise English
   Packs: built-in languages ship with the site (/i18n/<code>.json); any other
   language can be downloaded — it is translated once (AI, then a grammar review)
   and kept for everyone (i18n_packs in the database).

   How text is translated: the page is written in English. As the page builds
   itself, every piece of interface text is looked up in the language pack and
   replaced. A sentence that contains links or bold words is translated as one
   sentence, with the links and bold words kept, so the grammar stays right.
   Numbers are kept as they are ({0}, {1}… in the pack). Anything the pack doesn't
   know (people's names, posts, messages) is left exactly as it was written. */
(function () {
  'use strict';
  var d = document.documentElement;
  var LS = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) {} }
  };

  // ---------------------------------------------------------------- languages
  var VERSION = '2026-10-25a';            // built-in packs; bump when /i18n/*.json change
  var COMMON = ['en', 'hi', 'te', 'ur', 'ar'];
  // languages whose packs ship with the site (/i18n/<code>.json) — a language is added here once it is fully
  // translated and reviewed; until then it comes from the database like a download ("Being translated")
  var BUILT = [];
  var RTL = ['ar', 'ur', 'fa', 'he', 'ps', 'sd', 'ug', 'dv', 'ckb', 'yi', 'ks'];
  // suggestions by country (the five common languages are always shown too)
  var COUNTRY = {
    IN: ['bn', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'ne', 'fr', 'de', 'es', 'ja'],
    AE: ['ml', 'ta', 'bn', 'fil', 'ne', 'fa', 'pa', 'fr'], SA: ['ml', 'bn', 'fil', 'ta', 'ne', 'id', 'fr'],
    QA: ['ml', 'ne', 'bn', 'ta', 'fil', 'fr'], KW: ['ml', 'bn', 'fil', 'ta', 'ne', 'fa'], OM: ['ml', 'bn', 'ta', 'fil', 'sw', 'fa'],
    BH: ['ml', 'bn', 'fil', 'ta', 'fa'], PK: ['pa', 'sd', 'ps', 'fa'], BD: ['bn'], NP: ['ne', 'mai', 'bho'], LK: ['si', 'ta'],
    AF: ['ps', 'fa', 'uz'], MV: ['dv'], MM: ['my'], BT: ['dz', 'ne'],
    US: ['es', 'zh', 'fil', 'vi', 'fr', 'ko', 'pt', 'ru', 'de'], CA: ['fr', 'pa', 'zh', 'es', 'fil', 'gu'],
    GB: ['pl', 'pa', 'bn', 'gu', 'ro', 'pt', 'es', 'fr'], IE: ['ga', 'pl', 'pt'], AU: ['zh', 'vi', 'pa', 'el', 'it', 'es'], NZ: ['mi', 'zh', 'hi', 'sm'],
    SG: ['zh', 'ms', 'ta'], MY: ['ms', 'zh', 'ta'], ID: ['id', 'jv', 'su'], PH: ['fil', 'ceb'], TH: ['th'], VN: ['vi'],
    CN: ['zh'], TW: ['zh-Hant'], HK: ['zh-Hant'], JP: ['ja'], KR: ['ko'],
    DE: ['de', 'tr', 'ru', 'pl'], AT: ['de'], CH: ['de', 'fr', 'it'], FR: ['fr', 'pt', 'es'], BE: ['nl', 'fr', 'de'], NL: ['nl', 'tr'],
    ES: ['es', 'ca', 'eu', 'gl'], PT: ['pt'], IT: ['it'], PL: ['pl', 'uk'], RU: ['ru'], UA: ['uk', 'ru'], TR: ['tr', 'ku'], GR: ['el'],
    SE: ['sv'], NO: ['no'], DK: ['da'], FI: ['fi', 'sv'], RO: ['ro'], HU: ['hu'], CZ: ['cs'],
    BR: ['pt'], MX: ['es'], AR: ['es'], CO: ['es'], CL: ['es'], PE: ['es', 'qu'],
    EG: [], MA: ['fr'], DZ: ['fr'], TN: ['fr'], JO: [], LB: ['fr'], IQ: ['ckb'], IR: ['fa'], IL: ['he', 'ru'],
    NG: ['yo', 'ha', 'ig'], KE: ['sw'], TZ: ['sw'], UG: ['sw'], ZA: ['af', 'zu', 'xh'], ET: ['am'], GH: ['ha'],
    MU: ['fr'], FJ: ['fj'], TT: ['es'], GY: [], KZ: ['kk', 'ru'], UZ: ['uz', 'ru']
  };
  // time zone → country, when the location lookup isn't reachable
  var TZ = { 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW',
    'Asia/Muscat': 'OM', 'Asia/Bahrain': 'BH', 'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Kathmandu': 'NP', 'Asia/Katmandu': 'NP',
    'Asia/Colombo': 'LK', 'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY', 'Europe/London': 'GB', 'America/New_York': 'US',
    'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
    'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'Africa/Nairobi': 'KE', 'Africa/Lagos': 'NG' };
  // every language that can be searched and downloaded
  var ALL = ('af am ar as awa az be bg bgc bho bn bo brx bs ca ceb ckb cs cy da de doi dv dz el en es et eu fa fi fil fj fr ga gbm gl gom gu ha he hi hne hr ht hu hy ' +
    'id ig is it ja jv ka kha kk km kn ko ks ku ky lo lt lus lv mag mai mg mi mk ml mn mni mr ms mt my ne nl no ny or pa pl ps pt qu raj ro ru rw sa sat sd si sk sl sm sn ' +
    'so sq sr st su sv sw ta tcy te tg th ti tk tr tt ug uk ur uz vi xh yi yo zh zh-Hant zu').split(' ');
  // names the browser may not know
  var NAMES = {
    awa: ['Awadhi', 'अवधी'], bgc: ['Haryanvi', 'हरियाणवी'], bho: ['Bhojpuri', 'भोजपुरी'], brx: ['Bodo', 'बड़ो'], doi: ['Dogri', 'डोगरी'],
    gbm: ['Garhwali', 'गढ़वळि'], gom: ['Konkani', 'कोंकणी'], hne: ['Chhattisgarhi', 'छत्तीसगढ़ी'], kha: ['Khasi', 'Ka Ktien Khasi'],
    ks: ['Kashmiri', 'کٲشُر'], lus: ['Mizo', 'Mizo ṭawng'], mag: ['Magahi', 'मगही'], mai: ['Maithili', 'मैथिली'], mni: ['Manipuri', 'মৈতৈলোন্'],
    raj: ['Rajasthani', 'राजस्थानी'], sat: ['Santali', 'ᱥᱟᱱᱛᱟᱲᱤ'], tcy: ['Tulu', 'ತುಳು'], fil: ['Filipino', 'Filipino'],
    'zh-Hant': ['Chinese (Traditional)', '繁體中文'], zh: ['Chinese (Simplified)', '简体中文'], ckb: ['Kurdish (Sorani)', 'کوردیی ناوەندی'],
    as: ['Assamese', 'অসমীয়া'], or: ['Odia', 'ଓଡ଼ିଆ'], ur: ['Urdu', 'اردو'], fj: ['Fijian', 'Vosa Vakaviti'], dz: ['Dzongkha', 'རྫོང་ཁ']
  };
  // fonts for scripts the site's own fonts don't cover
  var FONT = {
    hi: 'Noto Sans Devanagari', mr: 'Noto Sans Devanagari', ne: 'Noto Sans Devanagari', sa: 'Noto Sans Devanagari', mai: 'Noto Sans Devanagari',
    bho: 'Noto Sans Devanagari', doi: 'Noto Sans Devanagari', gom: 'Noto Sans Devanagari', brx: 'Noto Sans Devanagari', awa: 'Noto Sans Devanagari',
    mag: 'Noto Sans Devanagari', hne: 'Noto Sans Devanagari', raj: 'Noto Sans Devanagari', bgc: 'Noto Sans Devanagari', gbm: 'Noto Sans Devanagari',
    te: 'Noto Sans Telugu', ta: 'Noto Sans Tamil', kn: 'Noto Sans Kannada', tcy: 'Noto Sans Kannada', ml: 'Noto Sans Malayalam',
    gu: 'Noto Sans Gujarati', pa: 'Noto Sans Gurmukhi', bn: 'Noto Sans Bengali', as: 'Noto Sans Bengali', mni: 'Noto Sans Bengali',
    or: 'Noto Sans Oriya', si: 'Noto Sans Sinhala', ar: 'Noto Sans Arabic', fa: 'Noto Sans Arabic', ps: 'Noto Sans Arabic', sd: 'Noto Sans Arabic',
    ckb: 'Noto Sans Arabic', ug: 'Noto Sans Arabic', ks: 'Noto Nastaliq Urdu', ur: 'Noto Nastaliq Urdu', he: 'Noto Sans Hebrew', yi: 'Noto Sans Hebrew',
    ja: 'Noto Sans JP', zh: 'Noto Sans SC', 'zh-Hant': 'Noto Sans TC', ko: 'Noto Sans KR', th: 'Noto Sans Thai', lo: 'Noto Sans Lao',
    km: 'Noto Sans Khmer', my: 'Noto Sans Myanmar', am: 'Noto Sans Ethiopic', ti: 'Noto Sans Ethiopic', ka: 'Noto Sans Georgian',
    hy: 'Noto Sans Armenian', bo: 'Noto Serif Tibetan', dz: 'Noto Serif Tibetan', dv: 'Noto Sans Thaana', sat: 'Noto Sans Ol Chiki'
  };

  var base = function (code) {
    var c = String(code || '').trim();
    if (/^zh-(hant|tw|hk|mo)/i.test(c)) return 'zh-Hant';
    c = c.toLowerCase().split(/[-_]/)[0];
    if (c === 'tl') return 'fil';
    if (c === 'iw') return 'he';
    if (c === 'nb' || c === 'nn') return 'no';
    if (c === 'in') return 'id';
    if (c === 'kok') return 'gom';
    return c;
  };
  var names = function (code) {
    var en = null, nat = null;
    try { en = new Intl.DisplayNames(['en'], { type: 'language' }).of(code); } catch (e) {}
    try { nat = new Intl.DisplayNames([code], { type: 'language' }).of(code); } catch (e) {}
    var f = NAMES[code];
    if (f) { en = f[0]; nat = f[1]; }
    if (!en || en === code) en = code;
    if (!nat || nat === code) nat = en;
    nat = nat.charAt(0).toLocaleUpperCase(code) + nat.slice(1);
    return { code: code, english: en, native: nat };
  };

  // ---------------------------------------------------------------- which language
  var downloaded = function () { try { return JSON.parse(LS.get('fl:langs') || '[]'); } catch (e) { return []; } };
  var available = function (code) { return code === 'en' || BUILT.indexOf(code) >= 0 || downloaded().indexOf(code) >= 0; };
  var systemLangs = function () { return (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']).map(base); };
  var chosen = LS.get('fl:lang');
  var lang = 'en', auto = false;
  if (chosen && ALL.indexOf(chosen) >= 0) lang = chosen;
  else {
    var sys = systemLangs();
    for (var i = 0; i < sys.length; i++) {
      if (sys[i] === 'en') break;
      if (available(sys[i])) { lang = sys[i]; auto = true; break; }
      // a language we don't have yet: it may already be downloadable — checked after the page loads
      if (ALL.indexOf(sys[i]) >= 0) { LS.set('fl:lang-offer', sys[i]); break; }
    }
  }
  if (d.hasAttribute('data-i18n-off')) { lang = 'en'; auto = false; }   // the admin console stays in English
  var dir = RTL.indexOf(lang) >= 0 ? 'rtl' : 'ltr';
  var LOCALE = { hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', mr: 'mr-IN', gu: 'gu-IN', bn: 'bn-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN',
    ur: 'ur-IN', en: 'en-IN', ar: 'ar-u-nu-latn', fa: 'fa-u-nu-latn' };
  var locale = LOCALE[lang] || lang;

  d.setAttribute('lang', lang === 'en' ? 'en' : lang);
  d.setAttribute('dir', dir);
  d.setAttribute('data-lang', lang);
  if (FONT[lang]) {
    var fam = FONT[lang];
    var fl = document.createElement('link');
    fl.rel = 'stylesheet'; fl.id = 'fl-script-font';
    fl.href = 'https://fonts.googleapis.com/css2?family=' + fam.replace(/ /g, '+') + ':wght@400;500;600;700&display=swap';
    document.head.appendChild(fl);
    d.style.setProperty('--sf', "'" + fam + "'");
  }
  // hide the page for a moment until the pack is in, so English doesn't flash first
  var st = document.createElement('style');
  st.textContent = 'html.i18n-wait body{visibility:hidden!important}';
  document.head.appendChild(st);

  // ---------------------------------------------------------------- text keys
  var NUM = /\d+(?:[.,:\/]\d+)*/g;
  var LETTER = /\p{L}/u;
  var INLINE = { A: 1, ABBR: 1, B: 1, BDI: 1, BDO: 1, CITE: 1, CODE: 1, DFN: 1, EM: 1, I: 1, KBD: 1, MARK: 1, Q: 1, S: 1, SAMP: 1, SMALL: 1,
    SPAN: 1, STRONG: 1, SUB: 1, SUP: 1, TIME: 1, U: 1, VAR: 1, FONT: 1, TSPAN: 1 };
  var ATOM = { SVG: 1, IMG: 1, BR: 1, INPUT: 1, CANVAS: 1, VIDEO: 1, AUDIO: 1, IFRAME: 1, PICTURE: 1, svg: 1 };
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, PRE: 1, TEMPLATE: 1, OPTION_: 1 };
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'data-tip'];
  var tag = function (el) { return (el.tagName || '').toUpperCase(); };
  var skipped = function (el) {
    if (!el || el.nodeType !== 1) return false;
    var t = tag(el);
    if (SKIP[t]) return true;
    if (el.isContentEditable) return true;
    if (el.getAttribute('translate') === 'no' || el.getAttribute('data-i18n') === 'no') return true;
    if (el.classList && el.classList.contains('notranslate')) return true;
    return false;
  };
  var hasLetters = function (s) { return LETTER.test(s); };
  // kept exactly as it is inside a sentence: icons, and names / numbers marked translate="no"
  var isAtom = function (c) { var t = tag(c); return !!(ATOM[t] || ATOM[c.tagName] || (INLINE[t] && skipped(c))); };
  var norm = function (s, nums) {
    return s.replace(/\s+/g, ' ').replace(NUM, function (m) { nums.push(m); return '{' + (nums.length - 1) + '}'; });
  };
  // elements whose content is a sentence or a label (a <div> or <nav> full of links is layout, not a sentence)
  var TEXTY = { P: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, LI: 1, BUTTON: 1, A: 1, LABEL: 1, TD: 1, TH: 1, DT: 1, DD: 1, FIGCAPTION: 1,
    BLOCKQUOTE: 1, SUMMARY: 1, LEGEND: 1, CAPTION: 1, OPTION: 1, B: 1, STRONG: 1, EM: 1, I: 1, SMALL: 1, TEXT: 1, TITLE: 1 };
  // can this element be translated as one sentence? (only text, inline tags and icons inside)
  function leafInfo(el) {
    if (!TEXTY[tag(el)]) {
      var direct = false;
      for (var c0 = el.firstChild; c0; c0 = c0.nextSibling) if (c0.nodeType === 3 && hasLetters(c0.data)) { direct = true; break; }
      if (!direct) return false;
    }
    var text = false;
    var walk = function (n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) { if (hasLetters(c.data)) text = true; continue; }
        if (c.nodeType !== 1) continue;
        var t = tag(c);
        if (isAtom(c)) continue;
        if (!INLINE[t]) return false;
        if (!walk(c)) return false;
      }
      return true;
    };
    return walk(el) && text;
  }
  // serialise a leaf: text with <0>…</0> for inline tags, <1/> for icons, {0} for numbers
  function serialise(el, map, nums) {
    var out = '';
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { out += norm(c.data, nums); continue; }
      if (c.nodeType !== 1) continue;
      var t = tag(c), k = map.length;
      map.push(c);
      var inner = isAtom(c) ? null : serialise(c, map, nums);
      out += inner === null || (!hasLetters(inner) && !/\{\d+\}/.test(inner)) ? '<' + k + '/>' : '<' + k + '>' + inner + '</' + k + '>';
    }
    return out;
  }
  var keyOf = function (el) { var map = [], nums = []; var k = serialise(el, map, nums).replace(/\s+/g, ' ').trim(); return { key: k, map: map, nums: nums }; };

  // ---------------------------------------------------------------- the pack
  var dict = null;                 // key → translation
  var plural = null;
  try { plural = new Intl.PluralRules(locale); } catch (e) {}
  function fill(tr, nums) {
    // ICU-style plurals in a translation: {0, plural, one {…} other {…}}
    tr = tr.replace(/\{(\d+), plural,((?:[^{}]*\{[^{}]*\})+)\s*\}/g, function (m, i, body) {
      var n = parseFloat(String(nums[+i] || '0').replace(/,/g, '')), cat = plural ? plural.select(n) : 'other', forms = {};
      body.replace(/(=\d+|zero|one|two|few|many|other)\s*\{([^{}]*)\}/g, function (x, k, v) { forms[k] = v; });
      var v = forms['=' + n] || forms[cat] || forms.other || '';
      return v.replace(/#/g, '{' + i + '}');
    });
    return tr.replace(/\{(\d+)\}/g, function (m, i) { return nums[+i] != null ? nums[+i] : m; });
  }
  var done = typeof WeakSet === 'function' ? new WeakSet() : null;
  var isDone = function (n) { return done && done.has(n); };
  var markDone = function (n) { if (done) done.add(n); };

  var doneAll = function (n) { if (n.nodeType === 3) markDone(n); else for (var c = n.firstChild; c; c = c.nextSibling) doneAll(c); };
  // put a translated sentence back, reusing the original links / bold words / icons
  function rebuild(el, tr, map, nums) {
    var re = /<(\d+)\/>|<(\d+)>|<\/(\d+)>/g, parts = [], last = 0, m;
    var frag = document.createDocumentFragment(), stack = [frag], used = {};
    var addText = function (s) { if (s) { var tn = document.createTextNode(s); markDone(tn); stack[stack.length - 1].appendChild(tn); } };
    tr = fill(tr, nums);
    while ((m = re.exec(tr))) {
      addText(tr.slice(last, m.index)); last = re.lastIndex;
      if (m[1] != null) { var a = map[+m[1]]; if (!a) return false; used[m[1]] = 1; stack[stack.length - 1].appendChild(a); doneAll(a); }
      else if (m[2] != null) { var o = map[+m[2]]; if (!o) return false; used[m[2]] = 1; while (o.firstChild) o.removeChild(o.firstChild); stack[stack.length - 1].appendChild(o); stack.push(o); }
      else { if (stack.length < 2) return false; stack.pop(); }
    }
    addText(tr.slice(last));
    if (stack.length !== 1) return false;
    for (var i = 0; i < map.length; i++) if (!used[i] && map[i].nodeType === 1 && tag(map[i]) !== 'BR') { /* a tag the translation dropped: keep it at the end */ frag.appendChild(map[i]); }
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(frag);
    return true;
  }

  function translateLeaf(el) {
    // already in the chosen language?
    var allDone = true, any = false;
    (function chk(n) { for (var c = n.firstChild; c; c = c.nextSibling) { if (c.nodeType === 3 && hasLetters(c.data)) { any = true; if (!isDone(c)) allDone = false; } else if (c.nodeType === 1 && !isAtom(c)) chk(c); } })(el);
    if (any && allDone) return true;
    var k = keyOf(el);
    var tr = dict[k.key];
    if (tr == null) {
      // a member's name or a page name inside the sentence ("<0>Bushra Khan</0> wants to connect"): try it as a placeholder
      var alt = k.key.replace(/<(\d+)>([^<>]*)<\/\1>/g, function (m, i, inner) {
        inner = inner.trim();
        return hasLetters(inner) && inner.indexOf('{') < 0 && dict[inner] == null ? '<' + i + '/>' : m;
      });
      if (alt !== k.key) tr = dict[alt];
    }
    if (tr == null) return false;
    return rebuild(el, tr, k.map, k.nums);
  }
  function translateText(n) {
    if (isDone(n) || !hasLetters(n.data)) return;
    var nums = [], raw = n.data, key = norm(raw, nums).trim();
    var tr = dict[key];
    if (tr == null) {
      // "Shaan Fitness · Kakinada · Part-time": a list of separate labels — translate the ones we know
      if (raw.indexOf(' · ') < 0) return;
      var segs = raw.split(' · '), hit = false;
      for (var i = 0; i < segs.length; i++) {
        var sm = /^(\s*)([\s\S]*?)(\s*)$/.exec(segs[i]), sn = [], st = dict[norm(sm[2], sn).trim()];
        if (st != null && sm[2]) { segs[i] = sm[1] + fill(st, sn) + sm[3]; hit = true; }
      }
      if (hit) { n.data = segs.join(' · '); markDone(n); }
      return;
    }
    var lead = (/^\s*/.exec(raw) || [''])[0], trail = (/\s*$/.exec(raw) || [''])[0];
    n.data = lead + fill(tr, nums) + trail;
    markDone(n);
  }
  var attrDone = typeof WeakMap === 'function' ? new WeakMap() : null;
  function translateAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute && el.getAttribute(a);
      if (!v || !hasLetters(v)) continue;
      var seen = attrDone && attrDone.get(el);
      if (seen && seen[a] === v) continue;
      var nums = [], tr = dict[norm(v, nums).trim()];
      if (tr == null) continue;
      var out = fill(tr, nums);
      el.setAttribute(a, out);
      if (attrDone) { seen = seen || {}; seen[a] = out; attrDone.set(el, seen); }
    }
  }
  function translateTitle() {
    var t = document.title;
    if (!t || !dict) return;
    var parts = t.split(/( — | · |: )/), changed = false;
    for (var i = 0; i < parts.length; i += 2) {
      var nums = [], tr = dict[norm(parts[i], nums).trim()];
      if (tr != null) { parts[i] = fill(tr, nums); changed = true; }
    }
    if (changed) { var was = busy; busy = true; document.title = parts.join(''); if (obs) obs.takeRecords(); busy = was; }
  }
  function visit(el) {
    if (!el || el.nodeType !== 1) return;
    // a text box: its placeholder is interface text, what's typed in it isn't
    if (tag(el) === 'TEXTAREA') { if (el.getAttribute('data-i18n') !== 'no') translateAttrs(el); return; }
    if (skipped(el)) return;
    if (tag(el) === 'TITLE') return translateTitle();
    translateAttrs(el);
    if (tag(el) === 'SELECT') { for (var o = 0; o < el.options.length; o++) visit(el.options[o]); return; }
    if (leafInfo(el)) {
      if (translateLeaf(el)) return;
      // no whole-sentence translation: try the pieces (each inline tag as its own sentence, loose text by itself)
      for (var c0 = el.firstChild; c0; c0 = c0.nextSibling) {
        if (c0.nodeType === 3) translateText(c0); else if (c0.nodeType === 1) visit(c0);
      }
      return;
    }
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) translateText(c);
      else if (c.nodeType === 1) visit(c);
    }
  }

  // ---------------------------------------------------------------- watching the page
  var busy = false, obs = null;
  function onMut(list) {
    if (busy || !dict) return;
    busy = true;
    try {
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r.type === 'attributes') { var at = r.target; if (at.nodeType === 1 && at.getAttribute('data-i18n') !== 'no' && (tag(at) === 'TEXTAREA' || !skipped(at))) translateAttrs(at); continue; }
        if (r.type === 'characterData') {
          if (done) done.delete(r.target);           // the page changed this text: translate it again
          var p = r.target.parentNode;
          if (!p || p.nodeType !== 1 || skipped(p) || closestSkipped(p)) continue;
          if (tag(p) === 'TITLE') { translateTitle(); continue; }
          if (leafInfo(p)) visit(p); else translateText(r.target);
          continue;
        }
        var t = r.target;
        if (t.nodeType !== 1 || closestSkipped(t)) continue;
        if (tag(t) === 'TITLE') { translateTitle(); continue; }
        if (leafInfo(t)) { visit(t); continue; }
        for (var j = 0; j < r.addedNodes.length; j++) {
          var n = r.addedNodes[j];
          if (n.nodeType === 1) visit(n);
          else if (n.nodeType === 3 && n.parentNode === t) translateText(n);
        }
      }
    } finally {
      if (obs) obs.takeRecords();
      busy = false;
    }
  }
  function closestSkipped(el) { for (var e = el; e && e.nodeType === 1; e = e.parentNode) if (skipped(e)) return true; return false; }
  function start() {
    if (obs || !dict || typeof MutationObserver !== 'function') return;
    obs = new MutationObserver(onMut);
    obs.observe(d, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    busy = true;
    try { visit(d); translateTitle(); } finally { obs.takeRecords(); busy = false; }
  }
  function ready() { d.classList.remove('i18n-wait'); }

  function usePack(strings) {
    dict = strings || {};
    start();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { busy = true; try { visit(document.body); } finally { if (obs) obs.takeRecords(); busy = false; } ready(); });
    else ready();
  }
  var packUrl = function (code) { return '/i18n/' + code + '.json?v=' + VERSION; };
  function cfg() { return window.FITLAB_CONFIG || {}; }
  function fetchDbPack(code) {
    var c = cfg();
    if (!c.SUPABASE_URL) return Promise.reject(new Error('no config'));
    return fetch(c.SUPABASE_URL + '/rest/v1/rpc/i18n_pack', {
      method: 'POST', headers: { apikey: c.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + c.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_lang: code })
    }).then(function (r) { return r.ok ? r.json() : null; });
  }
  function loadPack(code) {
    var cached = null;
    try { cached = JSON.parse(LS.get('fl:pack:' + code) || 'null'); } catch (e) {}
    var builtin = BUILT.indexOf(code) >= 0;
    if (cached && cached.strings && (!builtin || cached.v === VERSION)) {
      usePack(cached.strings);
      if (!builtin) refreshDb(code, cached.v);       // a downloaded pack may have grown since
      return;
    }
    d.classList.add('i18n-wait');
    setTimeout(ready, 2500);
    var got = builtin ? fetch(packUrl(code)).then(function (r) { return r.ok ? r.json() : null; }) : fetchDbPack(code);
    got.then(function (p) {
      if (!p || !p.strings) { ready(); return; }
      LS.set('fl:pack:' + code, JSON.stringify({ v: builtin ? VERSION : p.v, strings: p.strings }));
      usePack(p.strings);
    }).catch(ready);
  }
  function refreshDb(code, v) {
    var later = function () {
      fetchDbPack(code).then(function (p) { if (p && p.strings && p.v !== v) LS.set('fl:pack:' + code, JSON.stringify({ v: p.v, strings: p.strings })); }).catch(function () {});
    };
    if (document.readyState === 'complete') setTimeout(later, 3000); else window.addEventListener('load', function () { setTimeout(later, 3000); });
  }
  if (lang !== 'en') loadPack(lang);

  // dialogs the browser draws itself
  ['alert', 'confirm', 'prompt'].forEach(function (fn) {
    var orig = window[fn];
    if (typeof orig !== 'function') return;
    window[fn] = function (msg) { var a = Array.prototype.slice.call(arguments); a[0] = T(msg); return orig.apply(window, a); };
  });

  // translate one string in code (for the few places that don't go through the page)
  function T(s) {
    if (!dict || s == null) return s;
    var nums = [], tr = dict[norm(String(s), nums).trim()];
    return tr == null ? s : fill(tr, nums);
  }

  // ---------------------------------------------------------------- where you are (for suggestions)
  var countryP = null;
  function country() {
    if (countryP) return countryP;
    var cached = LS.get('fl:cc');
    var guess = TZ[(Intl.DateTimeFormat().resolvedOptions() || {}).timeZone] || null;
    countryP = (cached ? Promise.resolve(cached) : fetch('/cdn-cgi/trace').then(function (r) { return r.text(); }).then(function (t) {
      var m = /(?:^|\n)loc=([A-Z]{2})/.exec(t);
      if (m && m[1] !== 'XX') { LS.set('fl:cc', m[1]); return m[1]; }
      return guess;
    })).catch(function () { return guess; }).then(function (cc) { return cc || guess || 'IN'; });
    return countryP;
  }

  // ---------------------------------------------------------------- choosing a language
  function setLang(code, opts) {
    code = code === 'en' || ALL.indexOf(code) >= 0 ? code : 'en';
    LS.set('fl:lang', code);
    if (code !== 'en' && BUILT.indexOf(code) < 0) {
      var dl = downloaded(); if (dl.indexOf(code) < 0) { dl.push(code); LS.set('fl:langs', JSON.stringify(dl)); }
    }
    // keep it on the account too, so every device follows
    var go = function () { if (!opts || opts.reload !== false) location.reload(); };
    try {
      if (window.sb && window.FL && FL._me) { sb.from('profiles').update({ lang: code }).eq('id', FL._me.id).then(go, go); return; }
    } catch (e) {}
    go();
  }

  var API = {
    lang: lang, dir: dir, locale: locale, auto: auto, version: VERSION,
    COMMON: COMMON, BUILT: BUILT, ALL: ALL, COUNTRY: COUNTRY, RTL: RTL,
    names: names, base: base, available: available, downloaded: downloaded,
    country: country, set: setLang, t: T,
    suggested: function (cc) { return (COUNTRY[cc] || []).filter(function (c) { return COMMON.indexOf(c) < 0; }); },
    // the account's language follows the person to a new device
    fromAccount: function (code, save) {
      var mine = LS.get('fl:lang');
      if (!code) { if (mine && save) save(mine); return; }        // first sign-in: the account takes this device's choice
      if (code === lang) { if (mine !== code) LS.set('fl:lang', code); return; }
      if (code === 'en' || ALL.indexOf(code) >= 0) { LS.set('fl:lang', code); location.reload(); }
    },
    // for building the packs: every piece of interface text on this page, as pack keys
    collect: function (root) {
      var keys = {};
      var add1 = function (k, ctx) { k = k.replace(/\s+/g, ' ').trim(); if (k && hasLetters(k.replace(/<\/?\d+\/?>|\{\d+\}/g, '')) && !(k in keys)) keys[k] = ctx || ''; };
      var add = function (k, ctx) {
        add1(k, ctx);
        if (k.indexOf(' · ') >= 0 && !/<\/?\d+\/?>/.test(k)) k.split(' · ').forEach(function (p) { add1(norm(p.replace(/\{\d+\}/g, '0'), []), k); });
      };
      var walk = function (el) {
        if (!el || el.nodeType !== 1) return;
        if (tag(el) === 'TEXTAREA') { if (el.getAttribute('data-i18n') !== 'no') { var ph = el.getAttribute('placeholder'); if (ph) add(norm(ph, [])); } return; }
        if (skipped(el)) return;
        if (tag(el) === 'TITLE') { document.title.split(/ — | · |: /).forEach(function (p) { add(norm(p, [])); }); return; }
        for (var i = 0; i < ATTRS.length; i++) { var v = el.getAttribute(ATTRS[i]); if (v) add(norm(v, [])); }
        if (leafInfo(el)) {
          var whole = keyOf(el).key, texts = 0;
          add(whole);
          (function cnt(n) { for (var c = n.firstChild; c; c = c.nextSibling) { if (c.nodeType === 3) { if (hasLetters(c.data)) texts++; } else if (c.nodeType === 1 && !isAtom(c)) cnt(c); } })(el);
          // the pieces too, with the sentence they belong to: a label inside an icon button, a link or bold word inside a sentence
          // (not the loose words between them: "verified the page" on its own is not a sentence anyone should see)
          (function sub(n) { for (var c = n.firstChild; c; c = c.nextSibling) { if (c.nodeType === 3) { if (texts === 1) add(norm(c.data, []), whole); } else if (c.nodeType === 1 && !isAtom(c)) { if (leafInfo(c)) add(keyOf(c).key, whole); sub(c); } } })(el);
          return;
        }
        for (var c = el.firstChild; c; c = c.nextSibling) { if (c.nodeType === 3) add(norm(c.data, [])); else if (c.nodeType === 1) walk(c); }
      };
      walk(root || d);
      return Object.keys(keys).map(function (k) { return [k, keys[k]]; });
    },
    // date helpers in the chosen language
    date: function (v, o) { return new Date(v).toLocaleDateString(locale, o || { day: '2-digit', month: 'short', year: 'numeric' }); }
  };
  window.FLI18N = API;

  // ---------------------------------------------------------------- the language picker
  var esc = function (x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var fold = function (x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  function api(path, body, method) {
    var c = cfg();
    var token = function () { return window.sb && sb.auth ? sb.auth.getSession().then(function (r) { return r && r.data && r.data.session ? r.data.session.access_token : null; }).catch(function () { return null; }) : Promise.resolve(null); };
    return token().then(function (t) {
      return fetch(c.SUPABASE_URL + path, { method: method || 'POST',
        headers: { apikey: c.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + (t || c.SUPABASE_ANON_KEY), 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined })
        .then(function (r) { return r.json().catch(function () { return null; }).then(function (j) { return { ok: r.ok, status: r.status, data: j }; }); });
    });
  }
  var dbLangs = null;   // languages already translated in the database: { code: {status, done, total} }
  function readyLangs(fresh) {
    if (dbLangs && !fresh) return Promise.resolve(dbLangs);
    // kept for a few minutes in this tab, so browsing doesn't ask the server on every page
    if (!fresh) { try { var c0 = JSON.parse(sessionStorage.getItem('fl:dblangs') || 'null'); if (c0 && Date.now() - c0.t < 600000) { dbLangs = c0.d; return Promise.resolve(dbLangs); } } catch (e) {} }
    return api('/rest/v1/rpc/i18n_langs', {}).then(function (r) {
      dbLangs = {};
      (r.data || []).forEach(function (x) { dbLangs[x.lang] = x; });
      try { sessionStorage.setItem('fl:dblangs', JSON.stringify({ t: Date.now(), d: dbLangs })); } catch (e) {}
      return dbLangs;
    }).catch(function () { dbLangs = {}; return dbLangs; });
  }
  function openPicker() {
    var old = document.querySelector('.mdl.lang-mdl'); if (old) old.remove();
    var cur = names(lang);
    var ov = document.createElement('div');
    ov.className = 'mdl lang-mdl';
    ov.innerHTML = '<div class="mdl-card" role="dialog" aria-modal="true" aria-labelledby="langTtl">' +
      '<div class="mdl-head"><h3 id="langTtl">Language</h3><button class="icon-btn lang-x" type="button" aria-label="Close">&times;</button></div>' +
      '<div class="lang-search"><input type="search" id="langQ" placeholder="Search any language" autocomplete="off" aria-label="Search any language"></div>' +
      '<div class="mdl-body lang-body" id="langBody"></div>' +
      '<div class="lang-foot" id="langFoot"><span>Now: </span><b translate="no">' + esc(cur.native) + '</b>' +
      (lang !== 'en' ? ' <span class="lang-en" translate="no">' + esc(cur.english) + '</span>' : '') + '</div></div>';
    document.body.appendChild(ov);
    var close = function () { ov.remove(); document.removeEventListener('keydown', onKey); };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('.lang-x')) close(); });
    var body = ov.querySelector('#langBody'), q = ov.querySelector('#langQ');
    var item = function (code) {
      var n = names(code), on = code === lang;
      var dbx = dbLangs && dbLangs[code];
      var state = on ? '<span class="lang-st on">Current</span>'
        : (code === 'en' || BUILT.indexOf(code) >= 0 || downloaded().indexOf(code) >= 0 || (dbx && dbx.status === 'ready')) ? ''
        : dbx && (dbx.status === 'working' || dbx.status === 'queued') ? '<span class="lang-st">Being translated</span>'
        : '<span class="lang-st dl">Download</span>';
      return '<button type="button" class="lang-it' + (on ? ' on' : '') + '" data-code="' + esc(code) + '" lang="' + esc(code) + '" dir="' + (RTL.indexOf(code) >= 0 ? 'rtl' : 'ltr') + '">' +
        '<span class="lang-nm" translate="no">' + esc(n.native) + '</span>' + (n.english !== n.native ? '<span class="lang-en" translate="no">' + esc(n.english) + '</span>' : '') + state + '</button>';
    };
    var section = function (title, codes, extra) {
      if (!codes.length) return '';
      return '<div class="lang-sec"><h6>' + esc(title) + (extra ? ' <span class="lang-cc" translate="no">' + esc(extra) + '</span>' : '') + '</h6><div class="lang-grid">' + codes.map(item).join('') + '</div></div>';
    };
    var cc = null;
    var draw = function () {
      var t = fold(q.value.trim());
      if (t) {
        var hits = ALL.filter(function (code) { var n = names(code); return fold(n.native).indexOf(t) >= 0 || fold(n.english).indexOf(t) >= 0 || code === t; });
        body.innerHTML = hits.length ? section('Search results', hits) : '<p class="lang-none">No language matches that search. Try its English name.</p>';
        return;
      }
      var sug = cc ? API.suggested(cc) : [];
      var mine = downloaded().filter(function (c) { return COMMON.indexOf(c) < 0 && sug.indexOf(c) < 0; });
      var region = '';
      try { if (cc) region = new Intl.DisplayNames([locale], { type: 'region' }).of(cc); } catch (e) {}
      body.innerHTML = section('Common', COMMON) + section('Suggested for you', sug, region) + section('Your downloads', mine) +
        '<p class="lang-note">Can\'t see your language? Search for it above — any language can be downloaded.</p>';
    };
    draw();
    q.addEventListener('input', draw);
    country().then(function (c) { cc = c; if (!q.value.trim()) draw(); });
    readyLangs(true).then(function () { draw(); });
    body.addEventListener('click', function (e) {
      var b = e.target.closest('.lang-it'); if (!b) return;
      choose(b.dataset.code, ov);
    });
    setTimeout(function () { try { q.focus({ preventScroll: true }); } catch (e) {} }, 60);
  }
  function choose(code, ov) {
    if (code === lang) { if (ov) ov.remove(); return; }
    var dbx = dbLangs && dbLangs[code];
    if (code === 'en' || BUILT.indexOf(code) >= 0 || downloaded().indexOf(code) >= 0 || (dbx && dbx.status === 'ready')) { setLang(code); return; }
    download(code, ov);
  }
  // a language nobody has used yet: translate it once (AI + grammar review), then it's ready for everyone
  function download(code, ov) {
    var n = names(code);
    var foot = ov && ov.querySelector('#langFoot');
    var show = function (html) { if (foot) foot.innerHTML = html; };
    show('<div class="lang-prog"><b translate="no">' + esc(n.native) + '</b><span id="langPct">Starting…</span><i><u id="langBar" style="width:2%"></u></i></div>');
    api('/functions/v1/i18n', { action: 'request', lang: code }).then(function (r) {
      if (!r.ok || !r.data || r.data.ok === false) {
        var msg = r.data && r.data.message ? r.data.message : 'The download could not start. Please try again.';
        if (r.status === 401 || (r.data && r.data.code === 'signin')) msg = 'Sign in to download a new language.';
        show('<span class="lang-err">' + esc(msg) + '</span>');
        return;
      }
      poll(code, show);
    }).catch(function () { show('<span class="lang-err">You seem to be offline. Check your connection and try again.</span>'); });
  }
  function poll(code, show) {
    var tick = function () {
      api('/rest/v1/rpc/i18n_progress', { p_lang: code }).then(function (r) {
        var x = r.data || {};
        var pct = x.total ? Math.min(100, Math.round(100 * x.done / x.total)) : 0;
        var bar = document.getElementById('langBar'), lab = document.getElementById('langPct');
        if (bar) bar.style.width = Math.max(2, pct) + '%';
        if (lab) lab.textContent = x.status === 'ready' ? 'Ready' : 'Translating… ' + pct + '%';
        if (x.status === 'ready') { setLang(code); return; }
        if (x.status === 'failed') { show('<span class="lang-err">This language could not be translated right now. Please try again later.</span>'); return; }
        setTimeout(tick, 4000);
      }).catch(function () { setTimeout(tick, 6000); });
    };
    tick();
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-lang-open]');
    if (b) { e.preventDefault(); openPicker(); }
  });
  API.open = openPicker;

  // the phone's language isn't built in: use it if it's already been translated, otherwise offer it once
  var offer = LS.get('fl:lang-offer');
  if (offer && !LS.get('fl:lang') && lang === 'en') {
    var later = function () {
      if (!cfg().SUPABASE_URL) return;
      readyLangs().then(function (r) {
        if (r[offer] && r[offer].status === 'ready') { setLang(offer, { save: false }); return; }
        if (LS.get('fl:lang-offer-seen:' + offer)) return;          // asked once already; switch by itself once it's ready
        LS.set('fl:lang-offer-seen:' + offer, '1');
        var n = names(offer);
        var bn = document.createElement('div');
        bn.className = 'lang-offer';
        bn.innerHTML = '<span>Use The Fit Lab in <b translate="no">' + esc(n.native) + '</b>?</span><button type="button" class="pill sm solid" data-lang-open>Choose language</button><button type="button" class="icon-btn" aria-label="Close">&times;</button>';
        bn.querySelector('.icon-btn').onclick = function () { bn.remove(); };
        bn.querySelector('[data-lang-open]').addEventListener('click', function () { bn.remove(); setTimeout(function () { var i = document.getElementById('langQ'); if (i) { i.value = n.english; i.dispatchEvent(new Event('input')); } }, 80); });
        document.body.appendChild(bn);
      });
    };
    if (document.readyState === 'complete') setTimeout(later, 1500); else window.addEventListener('load', function () { setTimeout(later, 1500); });
  }

  // styles for the picker (the rest comes from the site's own .mdl styles)
  var css = document.createElement('style');
  css.textContent =
    '.lang-btn{width:auto!important;flex:0 0 auto!important;padding:0 10px!important;gap:5px;display:inline-flex!important;align-items:center}' +
    '.lang-btn .lang-cur{font:700 11px/1 var(--mono);letter-spacing:.04em}' +
    '.lang-search{padding:12px 18px 0}.lang-search input{width:100%;height:44px;border-radius:10px;border:1px solid var(--line-2,var(--line));background:var(--field,transparent);color:var(--bone);padding:0 14px;font:500 15px var(--body)}' +
    '.lang-body{padding-top:6px}.lang-sec h6{margin:14px 0 8px;font:700 12px var(--body);color:var(--ash);text-transform:uppercase;letter-spacing:.06em}' +
    '.lang-cc{text-transform:none;letter-spacing:0;color:var(--lime);font-weight:600}' +
    '.lang-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}' +
    '.lang-it{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--bone);cursor:pointer;text-align:start;font-family:var(--body);position:relative;min-height:56px}' +
    '.lang-it:hover{border-color:var(--lime)}.lang-it.on{border-color:var(--lime);background:color-mix(in srgb,var(--lime) 8%,transparent)}' +
    '.lang-nm{font-size:16px;font-weight:600;line-height:1.3}.lang-en{font-size:12px;color:var(--ash)}' +
    '.lang-st{font:700 10px/1 var(--mono);color:var(--ash);margin-top:3px;text-transform:uppercase}.lang-st.on{color:var(--lime)}.lang-st.dl{color:var(--lime)}' +
    '.lang-note,.lang-none{margin:16px 0 4px;font-size:13px;color:var(--ash)}' +
    '.lang-foot{padding:12px 18px;border-top:1px solid var(--line);font-size:13px;color:var(--ash);display:flex;gap:6px;align-items:baseline;flex-wrap:wrap}.lang-foot b{color:var(--bone)}' +
    '.lang-prog{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;width:100%;align-items:center}.lang-prog i{grid-column:1/-1;height:6px;border-radius:9px;background:var(--line);overflow:hidden;display:block}' +
    '.lang-prog u{display:block;height:100%;background:var(--lime);transition:width .6s}.lang-err{color:var(--danger-text,#f87171)}' +
    '.lang-offer{position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:80;display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow-lg);max-width:92vw;font-size:14px;color:var(--bone)}';
  document.head.appendChild(css);
})();
