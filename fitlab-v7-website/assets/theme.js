/* THE FIT LAB — theme bootstrap (load in <head>, before CSS paints).
   'system' follows the device setting; 'light' / 'dark' are manual overrides. */
(function () {
  var t = 'system';
  try { t = localStorage.getItem('fl:theme') || 'system'; } catch (e) {}
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
  var m = document.createElement('meta');
  m.name = 'color-scheme'; m.content = t === 'system' ? 'dark light' : t;
  document.head.appendChild(m);
})();
