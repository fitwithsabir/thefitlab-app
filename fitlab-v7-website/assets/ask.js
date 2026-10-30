/* The Fit Lab — "Ask The Fit Lab" chat panel (fix-38).
   Opened from the round button at the bottom right (app.js → FL.askFab). Members ask how to do
   something, report a problem or share an idea. Every message reaches the team in
   Admin → Ideas; when the AI is switched on it answers straight away and files the idea.
   Nothing typed here changes the website by itself — the team decides what gets built. */
(function () {
  'use strict';
  const FL = window.FL, sb = window.sb;
  if (!FL || !sb || window.FLAsk) return;
  const I = (n, s) => FL.icon(n, s);
  const esc = FL.esc;
  const STATUS = { new: 'With the team', planned: 'Planned', building: 'Being built', done: 'Live' };
  const ACK = 'Thanks, it\'s with the team. We read every message and reply right here. If your idea gets built, you\'ll get a notification.';

  let el = null, dim = null, chat = null, aiReady = null, busy = false, acked = false, poll = null, lastSig = '';

  // plain text → safe HTML: line breaks and https links only
  const fmt = (s) => esc(s).replace(/\n/g, '<br>')
    .replace(/https:\/\/[^\s<]+[^\s<.,;:!?)\]]/g, (u) => `<a href="${u}" target="_blank" rel="noopener nofollow">${u}</a>`);
  const page = () => ((location.pathname.split('/').pop() || 'feed').replace('.html', '') + location.search).slice(0, 120);

  async function checkAi() {
    if (aiReady != null) return aiReady;
    try {
      const c = JSON.parse(sessionStorage.getItem('fl:askai') || 'null');
      if (c && Date.now() - c.t < 10 * 60000) return (aiReady = !!c.r);
    } catch (_) {}
    const { data } = await FL.fn('ideas-chat', { action: 'status' });
    aiReady = !!(data && data.ready);
    try { sessionStorage.setItem('fl:askai', JSON.stringify({ r: aiReady, t: Date.now() })); } catch (_) {}
    return aiReady;
  }

  function msgHtml(m) {
    if (m.role === 'note') return `<div class="ask-msg note"><div class="ask-bub">${esc(m.body)}</div></div>`;
    const who = m.role === 'ai' ? `${I('sparkles', 13)}AI helper`
      : m.role === 'team' ? `${I('shield', 13)}${m.by ? `<span translate="no">${esc(m.by)}</span> · ` : ''}The Fit Lab team` : '';
    return `<div class="ask-msg ${m.role === 'member' ? 'me' : m.role}">${who ? `<div class="ask-who">${who}</div>` : ''}
      <div class="ask-bub">${fmt(m.body)}</div>${m.at ? `<time>${esc(FL.timeAgo(m.at))}</time>` : ''}</div>`;
  }

  function render(scroll = true) {
    if (!el) return;
    const body = el.querySelector('.ask-body');
    const msgs = (chat && chat.messages) || [];
    const ideas = (chat && chat.ideas) || [];
    let h = '';
    if (ideas.length) {
      h += `<div class="ask-ideas"><h6>Your ideas</h6>${ideas.slice(0, 5).map((i) => `<div class="ask-idea"><span>${esc(i.title)}</span>
        <b class="ask-st st-${esc(i.status)}">${esc(STATUS[i.status] || i.status)}</b></div>`).join('')}</div>`;
    }
    if (!msgs.length) {
      h += `<div class="ask-intro"><span class="ask-intro-ic">${I('sparkles', 24)}</span>
        <b>What would make The Fit Lab better for you?</b>
        <p>Ask how to do something, tell us what isn't working, or share an idea.${aiReady ? ' Our AI helper answers straight away, and the team reads everything.' : ' The team reads every message.'}</p>
        <div class="ask-chips">
          <button type="button" data-chip="Something isn't working: ">${I('flag', 15)}Something isn't working</button>
          <button type="button" data-chip="I have an idea: ">${I('zap', 15)}I have an idea</button>
          <button type="button" data-chip="How do I ">${I('help', 15)}How do I…?</button>
        </div></div>`;
    }
    h += msgs.map(msgHtml).join('');
    if (busy) h += `<div class="ask-msg ai typing"><div class="ask-who">${I('sparkles', 13)}AI helper</div><div class="ask-bub"><i></i><i></i><i></i></div></div>`;
    body.innerHTML = h;
    body.querySelectorAll('[data-chip]').forEach((b) => {
      b.onclick = () => { const t = el.querySelector('textarea'); t.value = b.dataset.chip; grow(t); t.focus(); t.setSelectionRange(t.value.length, t.value.length); };
    });
    if (scroll) body.scrollTop = body.scrollHeight;
  }

  async function load(quiet) {
    const data = await FL.call('idea_chat_mine', {}, { quiet: true });
    if (!data) { if (!quiet && !chat) { chat = { messages: [], ideas: [] }; render(); } return; }
    const local = ((chat && chat.messages) || []).filter((m) => m.role === 'note');
    const sig = JSON.stringify([data.chat_id, (data.messages || []).length, (data.ideas || []).map((i) => i.status)]);
    if (quiet && sig === lastSig) return;
    lastSig = sig;
    chat = data;
    // keep the "it's with the team" note after the member's last message
    if (local.length && chat.messages.length && chat.messages[chat.messages.length - 1].role === 'member') chat.messages = chat.messages.concat(local.slice(-1));
    render();
  }

  const grow = (t) => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 140) + 'px'; };

  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    const t = el.querySelector('textarea'), btn = el.querySelector('.ask-send');
    chat = chat || { messages: [], ideas: [] };
    chat.messages = chat.messages.filter((m) => m.role !== 'note').concat({ role: 'member', body: text, at: new Date().toISOString() });
    t.value = ''; grow(t); btn.disabled = true;
    render();
    const r = await FL.call('idea_chat_send', { p_body: text, p_page: page() });
    btn.disabled = false;
    if (!r) {   // not saved: put the text back so nothing is lost
      chat.messages.pop(); t.value = text; grow(t); render(); return;
    }
    chat.chat_id = r.chat_id;
    let answered = false;
    if (await checkAi()) {
      busy = true; render();
      const { data } = await FL.fn('ideas-chat', { action: 'reply' });
      busy = false;
      if (data && data.ai && data.reply) { chat.messages.push({ role: 'ai', body: data.reply, at: new Date().toISOString() }); answered = true; }
      else if (data && data.reason === 'limit') { chat.messages.push({ role: 'note', body: 'Our AI helper has answered a lot today, so the team will reply here instead.' }); answered = true; }
    }
    if (!answered && !acked) { chat.messages.push({ role: 'note', body: ACK }); acked = true; }
    render();
    if (answered) load(true);   // picks up the idea the AI filed under "Your ideas"
  }

  function build() {
    el = document.createElement('div');
    el.className = 'ask-panel';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Ask The Fit Lab');
    el.innerHTML = `<div class="ask-head"><span class="ask-ic">${I('sparkles', 20)}</span>
        <div class="ask-ttl"><b>Ask The Fit Lab</b><span>Questions, problems or ideas</span></div>
        <button type="button" class="icon-btn" data-new title="Start a new conversation" aria-label="Start a new conversation">${I('edit', 18)}</button>
        <button type="button" class="icon-btn" data-x aria-label="Close">${I('close', 20)}</button></div>
      <div class="ask-body" aria-live="polite"><div class="ask-load">${I('sparkles', 20)}</div></div>
      <form class="ask-foot" autocomplete="off">
        <textarea rows="1" maxlength="2000" placeholder="Type your message…" aria-label="Your message"></textarea>
        <button type="submit" class="ask-send" aria-label="Send">${I('send', 18)}</button></form>
      <div class="ask-fine">Please don't share passwords, OTPs or card details here.</div>`;
    document.body.appendChild(el);
    // on phones the panel is a sheet: dim the page behind it, tap outside to close
    dim = document.createElement('div');
    dim.className = 'ask-dim';
    dim.onclick = close;
    document.body.appendChild(dim);
    const t = el.querySelector('textarea');
    t.addEventListener('input', () => grow(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia('(hover:hover) and (pointer:fine)').matches) { e.preventDefault(); send(t.value); }
    });
    el.querySelector('form').onsubmit = (e) => { e.preventDefault(); send(t.value); };
    el.querySelector('[data-x]').onclick = close;
    el.querySelector('[data-new]').onclick = async () => {
      if (!chat || !chat.messages.some((m) => m.role !== 'note')) return t.focus();
      if (!(await FL.confirm('Start a new conversation?', 'This one stays with the team, and you can still get replies to it in your notifications.', 'Start new'))) return;
      await FL.call('idea_chat_new', {});
      chat = { messages: [], ideas: (chat && chat.ideas) || [] }; acked = false; lastSig = ''; render(); t.focus();
    };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el && el.classList.contains('on') && !document.querySelector('.mdl')) close(); });
  }

  async function open() {
    if (!el) build();
    el.classList.add('on');
    dim.classList.add('on');
    document.body.classList.add('ask-open');
    await checkAi();
    await load(false);
    if (window.matchMedia('(min-width:768px)').matches) el.querySelector('textarea').focus();
    clearInterval(poll);
    poll = setInterval(() => { if (document.visibilityState === 'visible' && !busy) load(true); }, 20000);
  }
  function close() {
    if (!el) return;
    el.classList.remove('on');
    if (dim) dim.classList.remove('on');
    document.body.classList.remove('ask-open');
    clearInterval(poll);
  }

  window.FLAsk = { open, close };
})();
