/* THE FIT LAB — feed posts: render, react, comment, report, compose. Used by feed + profile. */
(function () {
  const esc = FL.esc, icon = FL.icon, RX = FL.REACTIONS;

  // links, then #hashtags and @mentions (only after a space / start, so URLs and emails are untouched)
  function rich(text) {
    return FL.linkify(text)
      .replace(/(^|[\s(>])#([A-Za-z][A-Za-z0-9_]{1,39})\b/g, (m, pre, tag) => `${pre}<a class="hashtag" href="feed.html?tag=${encodeURIComponent(tag.toLowerCase())}">#${tag}</a>`)
      .replace(/(^|[\s(>])@([A-Za-z0-9_](?:[A-Za-z0-9_.]{1,28}[A-Za-z0-9_]))/g, (m, pre, u) => `${pre}<a class="mention" href="profile.html?u=${encodeURIComponent(u.toLowerCase())}">@${u}</a>`);
  }

  function author(p) {
    const a = p.author || {};
    const link = p.page ? `company.html?p=${encodeURIComponent(p.page.slug)}` : `profile.html?u=${encodeURIComponent(a.username || '')}`;
    return { a, link };
  }

  function reactionSummary(p) {
    const kinds = Object.entries(p.reactions || {}).sort((x, y) => y[1] - x[1]).map(([k]) => k).slice(0, 3);
    const rx = p.reaction_total ? `<span class="rx"><span class="rx-icons">${kinds.map((k) => `<span class="${RX[k].cls}">${icon(RX[k].icon, 11)}</span>`).join('')}</span>${p.reaction_total}</span>` : '<span></span>';
    const cm = p.comment_count ? `<button class="txt-btn" data-act="comments" style="padding:0;font-size:12.5px;font-weight:500">${p.comment_count} comment${p.comment_count > 1 ? 's' : ''}</button>` : '';
    const vw = p.views != null ? `<button class="txt-btn" data-act="stats" style="padding:0;font-size:12.5px;font-weight:500">${icon('chart', 13)} ${p.views} view${p.views === 1 ? '' : 's'}</button>` : '';
    return p.reaction_total || p.comment_count || vw ? `<div class="post-stats">${rx}<span style="display:flex;gap:12px;align-items:center">${cm}${vw}</span></div>` : '';
  }

  function render(p, opts = {}) {
    const { a, link } = author(p);
    const mine = p.my_reaction ? RX[p.my_reaction] : null;
    const long = (p.body || '').length > 360 || (p.body || '').split('\n').length > 6;
    const body = p.kind === 'milestone'
      ? `<div class="post-milestone"><span class="medal">${icon('award', 24)}</span><div style="flex:1;min-width:0">
           <b style="display:block;font-size:15px">${esc(p.body)}</b>
           ${p.link_url ? `<a class="t-sm" href="${esc(p.link_url)}" style="font-weight:700">View verified certificate →</a>` : ''}</div></div>`
      : `<div class="post-body ${long && !opts.expanded ? 'clamp' : ''}">${rich(p.body)}</div>
         ${long && !opts.expanded ? `<button class="morebtn" data-act="seemore" style="padding:0 16px 8px">…see more</button>` : ''}
         ${p.image_url ? `<img class="post-img" src="${esc(p.image_url)}" alt="Image shared by ${esc(a.full_name || '')}" loading="lazy" data-act="zoom">` : ''}`;
    return `<article class="box post" data-post="${p.id}" data-saved="${p.saved ? 1 : 0}">
      ${p.status === 'hidden' ? `<div class="notice warn" style="margin:12px 16px 0;font-size:13px">${icon('eye', 18)}<span>Only you can see this post while the Academy team reviews it.</span></div>` : ''}
      <div class="post-head">
        ${p.page ? `<a href="${link}">${FL.pageLogo(p.page)}</a>
        <div class="who"><a href="${link}">${esc(p.page.name)}</a>${FL.tick(p.page.verified, 15)}
          <div class="ent-sub">${esc(p.page.kind_label || '')} · ${p.page.followers} follower${p.page.followers === 1 ? '' : 's'}</div>`
        : `<a href="${link}">${FL.avatarHtml(a, 'avatar')}</a>
        <div class="who"><a href="${link}">${esc(a.full_name || a.username || 'Member')}</a>${FL.tags(a)}
          ${a.level && a.level !== 'trainee' ? ` <span class="chip acc" style="padding:0 7px;font-size:10.5px;vertical-align:1px">${FL.levelLabel(a.level)}</span>` : ''}
          <div class="ent-sub">${esc(a.headline || '')}</div>`}
          <div class="when">${FL.timeAgo(p.created_at)}${p.edited_at ? ' · Edited' : ''} · ${icon('globe', 12)}</div></div>
        <button class="icon-btn" data-act="menu" aria-label="More options">${icon('more', 20)}</button>
      </div>
      ${body}
      ${reactionSummary(p)}
      <div class="post-actions">
        <button class="txt-btn ${mine ? 'on' : ''}" data-act="react" data-k="${p.my_reaction || 'like'}" aria-label="React">${icon(mine ? mine.icon : 'like', 20)}<span class="lbl">${mine ? mine.label : 'Like'}</span></button>
        <button class="txt-btn" data-act="comments">${icon('comment', 20)}<span class="lbl">Comment</span></button>
        <button class="txt-btn" data-act="share">${icon('link', 20)}<span class="lbl">Copy link</span></button>
        <button class="txt-btn" data-act="message-author" ${p.is_mine || p.page ? 'hidden' : ''}>${icon('send', 20)}<span class="lbl">Send</span></button>
      </div>
      <div class="comments" hidden></div>
    </article>`;
  }

  function commentHtml(c) {
    const a = c.author || {};
    const link = `profile.html?u=${encodeURIComponent(a.username || '')}`;
    return `<div class="c-item" data-comment="${c.id}">
      <a href="${link}">${FL.avatarHtml(a, 'avatar xs')}</a>
      <div class="bubble"><div style="display:flex;gap:6px;align-items:flex-start">
        <div style="flex:1;min-width:0"><a href="${link}">${esc(a.full_name || a.username)}</a>${FL.tick(a.verified, 13)}<div class="ent-sub">${esc(a.headline || '')}</div></div>
        <span class="t-xs muted">${FL.timeAgo(c.created_at)}</span>
        <button class="icon-btn" style="width:26px;height:26px" data-act="cmenu" aria-label="Comment options">${icon('more', 16)}</button></div>
        <p>${rich(c.body)}</p>${c.status === 'hidden' ? '<span class="t-xs muted">Hidden while under review</span>' : ''}</div></div>`;
  }

  function closeMenus(root) { root.querySelectorAll('.menu-pop,.rx-picker').forEach((m) => m.remove()); }

  // event delegation for every post inside `root`
  function mount(root, { me, onRemoved } = {}) {
    const findPost = (el) => el.closest('[data-post]');
    const replace = (art, p) => { const tmp = document.createElement('div'); tmp.innerHTML = render(p); const n = tmp.firstElementChild; art.replaceWith(n); return n; };

    async function react(art, kind) {
      const r = await FL.call('react_to_post', { p_id: art.dataset.post, p_kind: kind });
      if (r && r.post) {
        const open = !art.querySelector('.comments').hidden;
        const n = replace(art, r.post);
        if (open) loadComments(n);
      }
    }

    async function loadComments(art) {
      const box = art.querySelector('.comments');
      box.hidden = false;
      box.innerHTML = `<div class="c-new">${FL.avatarHtml(me, 'avatar xs')}<textarea placeholder="Add a comment…" maxlength="1250" rows="1"></textarea>
        <button class="pill solid sm" data-act="send-comment" disabled>Post</button></div><div class="clist"><div class="skeleton" style="height:40px"></div></div>`;
      const ta = box.querySelector('textarea'), btn = box.querySelector('[data-act=send-comment]');
      ta.addEventListener('input', () => { btn.disabled = !ta.value.trim(); ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'; });
      const { data, error } = await sb.rpc('get_comments', { p_post_id: art.dataset.post });
      box.querySelector('.clist').innerHTML = error ? `<p class="t-sm muted">${esc(FL.friendly(error))}</p>` : (data || []).map(commentHtml).join('');
      box._comments = data || [];
    }

    root.addEventListener('click', async (e) => {
      const t = e.target.closest('[data-act]');
      if (!t) { if (!e.target.closest('.menu-pop,.rx-picker')) closeMenus(root); return; }
      const art = findPost(t); if (!art) return;
      const act = t.dataset.act;
      if (act !== 'menu' && act !== 'cmenu') closeMenus(root);

      if (act === 'react') {
        // tap = like / un-react; the picker opens on hover / long-press
        const cur = art.querySelector('[data-act=react]').classList.contains('on');
        return react(art, cur ? null : 'like');
      }
      if (act === 'pick') return react(art, t.dataset.k);
      if (act === 'seemore') { art.querySelector('.post-body').classList.remove('clamp'); t.remove(); return; }
      if (act === 'comments') { const c = art.querySelector('.comments'); if (!c.hidden && c.innerHTML) { c.hidden = true; return; } loadComments(art); setTimeout(() => { const ta = art.querySelector('.comments textarea'); if (ta) ta.focus(); }, 60); return; }
      if (act === 'send-comment') {
        const ta = art.querySelector('.comments textarea'); const body = ta.value.trim(); if (!body) return;
        FL.busy(t, true, '');
        const r = await FL.call('add_comment', { p_post_id: art.dataset.post, p_body: body });
        FL.busy(t, false);
        if (!r) return;
        ta.value = ''; t.disabled = true;
        art.querySelector('.clist').innerHTML = (r.comments || []).map(commentHtml).join('');
        const stats = art.querySelector('.post-stats');
        const fresh = await sb.rpc('get_post', { p_id: art.dataset.post });
        if (fresh.data) { const tmp = document.createElement('div'); tmp.innerHTML = reactionSummary(fresh.data) || '<div></div>';
          if (stats) stats.replaceWith(tmp.firstElementChild); else art.querySelector('.post-actions').before(tmp.firstElementChild); }
        return;
      }
      if (act === 'share') {
        const url = new URL('feed.html?post=' + art.dataset.post, location.href).href;
        try { await navigator.clipboard.writeText(url); FL.toast('Link copied', 'ok'); } catch (_) { FL.toast(url); }
        return;
      }
      if (act === 'message-author') {
        const u = art.querySelector('.who a').getAttribute('href').split('u=')[1];
        location.href = 'messaging.html?u=' + u; return;
      }
      if (act === 'zoom') {
        const m = FL.modal({ title: 'Image', wide: true, body: `<img src="${esc(t.src)}" alt="" style="width:100%;border-radius:8px">` });
        return m;
      }
      if (act === 'menu') {
        const open = art.querySelector(':scope > .menu-pop'); closeMenus(root); if (open) return;
        const mine = art.querySelector('[data-act=message-author]').hidden;
        const pop = document.createElement('div'); pop.className = 'menu-pop';
        const saved = art.dataset.saved === '1';
        pop.innerHTML = `<button data-act="save">${icon('bookmark', 18)}${saved ? 'Unsave' : 'Save post'}</button>` + (mine
          ? `<button data-act="stats">${icon('chart', 18)}Post analytics</button><button data-act="edit">${icon('edit', 18)}Edit post</button><button data-act="delete" class="danger">${icon('trash', 18)}Delete post</button>`
          : `<button data-act="report">${icon('flag', 18)}Report post</button>${me && (me.is_admin || me.is_owner) ? `<button data-act="mod-remove" class="danger">${icon('trash', 18)}Remove (moderator)</button>` : ''}`);
        art.appendChild(pop); return;
      }
      if (act === 'save') {
        closeMenus(root);
        const r = await FL.call('toggle_save_post', { p_post: art.dataset.post });
        if (r) { art.dataset.saved = r.saved ? '1' : '0'; FL.toast(r.saved ? 'Saved — find it under Saved on Home' : 'Removed from Saved', 'ok'); }
        return;
      }
      if (act === 'stats') { closeMenus(root); return stats(art.dataset.post); }
      if (act === 'report') { closeMenus(root); return FL.report('post', art.dataset.post, { onDone: () => art.remove() }); }
      if (act === 'delete' || act === 'mod-remove') {
        closeMenus(root);
        if (!(await FL.confirm(act === 'delete' ? 'Delete post?' : 'Remove this post?', act === 'delete' ? 'This can\'t be undone.' : 'It will be hidden from everyone.', act === 'delete' ? 'Delete' : 'Remove', true))) return;
        const r = await FL.call('delete_post', { p_id: art.dataset.post });
        if (r) { art.remove(); FL.toast('Post removed', 'ok'); if (onRemoved) onRemoved(); }
        return;
      }
      if (act === 'edit') {
        closeMenus(root);
        const { data: p } = await sb.rpc('get_post', { p_id: art.dataset.post }); if (!p) return;
        composer(me, { editing: p, onDone: (np) => replace(art, np) });
        return;
      }
      if (act === 'cmenu') {
        const item = t.closest('[data-comment]');
        const c = (art.querySelector('.comments')._comments || []).find((x) => x.id === item.dataset.comment) || {};
        const had = item.querySelector('.menu-pop'); closeMenus(root); if (had) return;
        const pop = document.createElement('div'); pop.className = 'menu-pop'; pop.style.top = '30px';
        pop.innerHTML = `${c.can_delete ? `<button data-act="cdelete" class="danger">${icon('trash', 18)}Delete comment</button>` : ''}
          ${!c.is_mine ? `<button data-act="creport">${icon('flag', 18)}Report comment</button>` : ''}`;
        item.style.position = 'relative'; item.appendChild(pop); return;
      }
      if (act === 'cdelete') {
        const item = t.closest('[data-comment]'); closeMenus(root);
        const r = await FL.call('delete_comment', { p_id: item.dataset.comment });
        if (r) { art.querySelector('.clist').innerHTML = (r.comments || []).map(commentHtml).join(''); art.querySelector('.comments')._comments = r.comments; }
        return;
      }
      if (act === 'creport') { const item = t.closest('[data-comment]'); closeMenus(root); return FL.report('comment', item.dataset.comment, { onDone: () => item.remove() }); }
    });

    // reaction picker: hover (desktop) or long-press (touch)
    let hoverT = null, pressT = null;
    const showPicker = (btn) => {
      const art = findPost(btn); if (!art || art.querySelector('.rx-picker')) return;
      closeMenus(root);
      const pk = document.createElement('div'); pk.className = 'rx-picker'; pk.setAttribute('role', 'menu');
      pk.innerHTML = Object.entries(RX).map(([k, r]) => `<button class="${r.cls}" data-act="pick" data-k="${k}" title="${r.label}" aria-label="${r.label}">${icon(r.icon, 22)}</button>`).join('');
      art.appendChild(pk);
      pk.addEventListener('mouseleave', () => { hoverT = setTimeout(() => pk.remove(), 350); });
      pk.addEventListener('mouseenter', () => clearTimeout(hoverT));
    };
    root.addEventListener('mouseover', (e) => {
      const b = e.target.closest('[data-act=react]'); if (!b) return;
      clearTimeout(hoverT); hoverT = setTimeout(() => showPicker(b), 450);
    });
    root.addEventListener('mouseout', (e) => {
      const b = e.target.closest('[data-act=react]'); if (!b) return;
      clearTimeout(hoverT);
      hoverT = setTimeout(() => { const art = findPost(b); const pk = art && art.querySelector('.rx-picker'); if (pk && !pk.matches(':hover')) pk.remove(); }, 500);
    });
    root.addEventListener('touchstart', (e) => {
      const b = e.target.closest('[data-act=react]'); if (!b) return;
      pressT = setTimeout(() => { showPicker(b); pressT = 'done'; }, 420);
    }, { passive: true });
    root.addEventListener('touchend', (e) => {
      const b = e.target.closest('[data-act=react]'); if (!b) return;
      if (pressT === 'done') { e.preventDefault(); } else clearTimeout(pressT);
      pressT = null;
    });
  }

  async function stats(id) {
    const { data: d, error } = await sb.rpc('post_stats', { p_post: id });
    if (error || !d) return FL.toast(error ? FL.friendly(error) : 'Analytics are only for your own posts', 'err');
    const bars = (list) => { const mx = Math.max(1, ...list.map((x) => x.n)); return list.map((x) => `<div class="hbar"><span>${esc(x.label)}</span><div class="t"><i style="width:${Math.round(x.n / mx * 100)}%"></i></div><b>${x.n}</b></div>`).join(''); };
    FL.modal({ title: 'Post analytics', wide: true, body: `
      <div class="kpis" style="padding:0;margin-bottom:14px">${[[d.views, 'Views'], [d.viewers, 'People reached'], [d.reactions, 'Reactions'], [d.comments, 'Comments'], [d.saves, 'Saves']]
        .map(([v, l]) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
      ${d.premium ? `<h4 style="margin:6px 0">Who it reached — by profession</h4>${(d.by_profession || []).length ? bars(d.by_profession) : '<p class="t-sm muted">No views yet.</p>'}
        <h4 style="margin:14px 0 6px">By city</h4>${(d.by_city || []).length ? bars(d.by_city) : '<p class="t-sm muted">No views yet.</p>'}
        ${(d.engaged || []).length ? `<h4 style="margin:14px 0 6px">People who engaged</h4><div style="display:flex;flex-wrap:wrap;gap:8px">${d.engaged.map((u) => `<a class="chip" href="profile.html?u=${encodeURIComponent(u.username)}">${esc(u.full_name)}</a>`).join('')}</div>` : ''}`
      : `<div class="prem-box"><h3>${icon('crown', 16)}See who your post reached</h3><div class="t-sm" style="line-height:1.55">With Premium, see the professions and cities of the people who viewed your posts, and exactly who engaged.</div>
          <a class="pill gold sm" href="premium.html?plan=pro" style="margin-top:10px">Try Premium free for 14 days</a></div>`}
      <p class="t-xs muted" style="margin:12px 0 0">Views count each member once a day, and never your own.</p>` });
  }

  // count a view when at least half of a post is on screen for a moment
  function trackViews(root) {
    if (!('IntersectionObserver' in window)) return;
    const seen = new Set(), queue = new Set(); let tmr = null;
    const flush = () => { tmr = null; const ids = [...queue]; queue.clear(); if (ids.length) sb.rpc('log_post_views', { p_ids: ids }).then(() => {}, () => {}); };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const id = en.target.dataset.post;
        if (en.isIntersecting && id && !seen.has(id)) { seen.add(id); queue.add(id); io.unobserve(en.target); if (!tmr) tmr = setTimeout(flush, 3000); }
      });
    }, { threshold: 0.5 });
    const scan = () => root.querySelectorAll('article.post[data-post]').forEach((a) => { if (!a._obs) { a._obs = 1; io.observe(a); } });
    new MutationObserver(scan).observe(root, { childList: true, subtree: true });
    scan();
    window.addEventListener('pagehide', flush);
  }

  // composer modal (new post or edit)
  function composer(me, { editing = null, onDone, page = null, initText = '', initFile = null } = {}) {
    let imgFile = null;
    const m = FL.modal({ title: editing ? 'Edit post' : 'Create a post', wide: true, body: `
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px">${page ? FL.pageLogo(page) : FL.avatarHtml(me, 'avatar md')}
        <div><b>${esc(page ? page.name : (me.full_name || ''))}</b><div class="t-xs muted">${icon('globe', 12)} ${page ? 'Posting as the page · followers see it in their feed' : 'Visible to Fit Lab members'}</div></div></div>
      <textarea id="pcBody" maxlength="3000" placeholder="Share a coaching insight, a client win, a question for other coaches…" style="min-height:160px;border:0;padding:4px 0;font-size:16px;box-shadow:none;background:transparent">${editing ? esc(editing.body) : esc(initText || '')}</textarea>
      <div id="pcImg"></div>
      <p class="t-xs muted" style="margin:10px 0 0">Add #hashtags so people can find your post, and @username to mention someone. Keep it professional — no photos of others without their consent.</p>`,
      foot: `<div class="left" style="display:flex;gap:4px;align-items:center">
          ${editing ? '' : `<label class="icon-btn" title="Add a photo" style="cursor:pointer">${icon('image', 22)}<input type="file" id="pcFile" accept="image/jpeg,image/png,image/webp" hidden></label>`}
          <span class="t-xs muted" id="pcCount"></span></div>
        <button class="pill solid" id="pcPost" disabled>${editing ? 'Save' : 'Post'}</button>` });
    const ta = m.q('#pcBody'), btn = m.q('#pcPost'), cnt = m.q('#pcCount');
    const sync = () => { const n = ta.value.trim().length; btn.disabled = !n; cnt.textContent = n > 2600 ? `${n} / 3000` : ''; };
    ta.addEventListener('input', sync); sync(); setTimeout(() => ta.focus(), 80);
    const file = m.q('#pcFile');
    const showImg = (f) => {
      imgFile = f || null;
      if (!imgFile) return;
      if (imgFile.size > 12 * 1024 * 1024) { imgFile = null; return FL.toast('That image is too large (max 12 MB)', 'err'); }
      const url = URL.createObjectURL(imgFile);
      m.q('#pcImg').innerHTML = `<div style="position:relative;margin-top:10px"><img src="${url}" alt="" style="width:100%;max-height:340px;object-fit:cover;border-radius:10px">
        <button class="icon-btn" id="pcRm" style="position:absolute;right:8px;top:8px;background:rgba(0,0,0,.6);color:#fff" aria-label="Remove image">${icon('close', 18)}</button></div>`;
      m.q('#pcRm').onclick = () => { imgFile = null; if (file) file.value = ''; m.q('#pcImg').innerHTML = ''; };
    };
    if (file) file.onchange = () => showImg(file.files[0]);
    if (initFile && !editing) showImg(initFile);
    btn.onclick = async () => {
      FL.busy(btn, true, editing ? 'Saving…' : 'Posting…');
      try {
        if (editing) {
          const r = await FL.call('update_post', { p_id: editing.id, p_body: ta.value });
          if (r) { m.close(); FL.toast('Post updated', 'ok'); if (onDone) onDone(r.post); }
          return;
        }
        // check the gate before uploading anything
        const { data: gate } = await sb.rpc('community_gate');
        if (gate && gate.code === 'guidelines') { const ok = await FL.guidelines(); if (!ok) return; }
        else if (gate) { FL.notice('Can\'t post right now', gate.message); return; }
        let url = null;
        if (imgFile) url = await FL.uploadImage(imgFile, page ? { bucket: 'page-media', path: `${page.page_id}/posts/${Date.now()}.jpg`, max: 1600 }
                                                         : { bucket: 'post-images', path: `${me.id}/${Date.now()}.jpg`, max: 1600 });
        const r = page ? await FL.call('create_page_post', { p_page: page.page_id, p_body: ta.value, p_image_url: url })
                       : await FL.call('create_post', { p_body: ta.value, p_image_url: url });
        if (r) { m.close(); FL.toast('Posted', 'ok'); if (onDone) onDone(r.post); }
      } catch (e) { FL.toast(FL.friendly(e), 'err'); }
      finally { FL.busy(btn, false); }
    };
    return m;
  }

  window.FLPosts = { render, mount, composer, commentHtml, trackViews, rich, stats };
})();
