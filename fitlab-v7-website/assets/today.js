/* THE FIT LAB — the top of the app home ("today"), drawn the way each look's phone design shows it.
   Neon Lab: greeting, ID chips, four glowing shortcuts, a job for you and your course.
   Notebook Pop: "Hey …", four sticker tiles.
   Performance OS: progress rings, your clients, a Coach AI bar and matching jobs.
   Redraws itself when the member switches look. */
(function (root) {
  const esc = (s) => FL.esc(s);
  const GOALS = { fat_loss: 'Fat loss', fat_loss_gentle: 'Gentle fat loss', recomp: 'Recomposition', maintain: 'Maintenance', muscle_gain: 'Muscle gain', health: 'General health' };
  const first = (n) => String(n || '').trim().split(/\s+/)[0] || 'there';
  const part = () => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const sparkle = (cls, size) => `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"/></svg>`;
  const arrow = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';

  // how complete a profile is, from the parts people see first
  function strength(p) {
    const parts = [p.photo_url, p.headline, p.bio, p.city, p.profession || p.occupation, p.experience_level,
      (p.specialties || []).length, (p.languages || []).length, p.cover_url, p.social_links && Object.values(p.social_links).some(Boolean)];
    return Math.round(parts.filter(Boolean).length / parts.length * 100);
  }
  const shortPay = (j) => {
    if (!j || j.salary_min == null) return '';
    const k = (v) => v >= 1000 ? Math.round(v / 1000) + 'k' : String(v);
    return '₹' + (j.salary_min === j.salary_max ? k(j.salary_min) : k(j.salary_min) + '–' + k(j.salary_max || j.salary_min));
  };
  const jobSub = (j) => [j.page && j.page.name, j.city, j.type_label].filter(Boolean).map(esc).join(' · ');
  const ring = (r, frac, color, delay) => {
    const len = Math.round(2 * Math.PI * r), off = Math.round(len * (1 - Math.max(0, Math.min(1, frac))));
    return `<circle cx="50" cy="50" r="${r}" fill="none" stroke-width="8" style="stroke:var(--line)"/>
      <circle class="td-rg" cx="50" cy="50" r="${r}" fill="none" stroke-width="8" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${off}" style="--len:${len};stroke:${color};animation-delay:${delay}s" transform="rotate(-90 50 50)"/>`;
  };
  const nextMilestone = (n) => [10, 25, 50, 100, 250, 500, 1000].find((m) => m > n) || n + 1;

  function neon(me, d) {
    const c = d.course, j = d.jobs && d.jobs[0];
    const role = me.headline || me.occupation || '';
    return `<div class="td td-n">
      <div class="td-hi"><small>Good ${part()},</small><b>${esc(first(me.full_name))}</b>
        <div class="td-chips">${role ? `<span>${esc(role.length > 34 ? role.slice(0, 32) + '…' : role)}</span>` : ''}${me.unique_id ? `<span class="id">${esc(me.unique_id)}</span>` : ''}</div></div>
      <nav class="td-qa" aria-label="Your lab">
        <a href="tools"><span class="ic">${FL.icon('calc', 26)}</span>Tools</a>
        <a href="tools-ai"><span class="ic ai">${FL.icon('sparkles', 26)}</span>Coach AI</a>
        <a href="jobs"><span class="ic">${FL.icon('briefcase', 26)}</span>Jobs</a>
        <a href="${c ? 'courses?c=' + encodeURIComponent(c.slug) : 'courses'}"><span class="ic">${FL.icon('courses', 26)}</span>Course</a>
      </nav>
      ${j ? `<a class="box td-job" href="jobs?job=${encodeURIComponent(j.id)}">
        <span class="td-row"><span class="td-eye">JOB FOR YOU</span>${j.why ? `<span class="td-why">${esc(j.why)}</span>` : ''}</span>
        <b class="td-jt">${esc(j.title)}</b><span class="td-js">${jobSub(j)}</span>
        <span class="td-row" style="margin-top:14px"><span class="td-pay">${esc(FL.pay(j))}</span><span class="td-go">Apply</span></span></a>` : ''}
      ${c ? `<a class="box td-course" href="courses?c=${encodeURIComponent(c.slug)}">
        <span class="td-row"><b>${esc(c.title)}</b><span class="td-n2">${c.done}/${c.total}</span></span>
        <span class="td-bar"><i style="width:${c.pct}%"><em></em></i></span>
        <span class="td-next">${c.done >= c.total ? 'Course complete — your certificate is ready' : 'Next: Day ' + (c.done + 1)}</span></a>` : ''}
    </div>`;
  }

  function pop(me, d) {
    const c = d.course;
    return `<div class="td td-p">
      <div class="td-hey">Hey ${esc(first(me.full_name))}${sparkle('td-spk', 30)}</div>
      <p class="td-what">What are we building today?</p>
      <nav class="td-tiles" aria-label="Your lab">
        <a class="tl lime" href="tools">${FL.icon('calc', 28)}<b>Calculators</b><span>BMI · BMR · TDEE</span></a>
        <a class="tl violet" href="tools-ai">${FL.icon('sparkles', 28)}<b>Coach AI</b><span>Plan from a report</span></a>
        <a class="tl white" href="jobs"><i class="rs">₹</i><b>Jobs</b><span>${d.jobs && d.jobs.length ? esc(d.jobs.length + (d.jobs.length === 1 ? ' match' : ' matches') + ' for you') : 'Pay on every job'}</span></a>
        <a class="tl ink" href="${c ? 'courses?c=' + encodeURIComponent(c.slug) : 'courses'}"><span class="k">COURSE</span>
          ${c ? `<b>Day ${Math.min(c.done + 1, c.total)} / ${c.total}</b><span class="bar"><i style="width:${c.pct}%"></i></span>` : '<b>Start learning</b><span>QR certificates</span>'}</a>
      </nav>
    </div>`;
  }

  function pro(me, d) {
    const c = d.course, a = d.access || {}, cl = d.clients || [];
    const prof = strength(me);
    const third = a.ai_limit ? { label: 'AI plans', val: `${a.ai_used || 0}/${a.ai_limit}`, frac: (a.ai_used || 0) / a.ai_limit }
      : { label: 'Network', val: String(d.cnt || 0), frac: (d.cnt || 0) / nextMilestone(d.cnt || 0) };
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
    const top = cl[0];
    return `<div class="td td-c">
      <div class="td-hd"><span class="td-eye">TODAY · ${esc(today)}</span><b>${cap(part())}, ${esc(first(me.full_name))}</b></div>
      <div class="box td-rings">
        <svg width="104" height="104" viewBox="0 0 100 100" aria-hidden="true">${ring(44, prof / 100, 'var(--fill)', .2)}${ring(33, c ? c.done / c.total : 0, 'var(--acc2)', .35)}${ring(22, third.frac, 'var(--bone)', .5)}</svg>
        <ul>
          <li><a href="profile?u=${encodeURIComponent(me.username || '')}"><span><i style="background:var(--fill)"></i>Profile</span><b>${prof}%</b></a></li>
          <li><a href="${c ? 'courses?c=' + encodeURIComponent(c.slug) : 'courses'}"><span><i style="background:var(--acc2)"></i>Course</span><b>${c ? c.done + '/' + c.total : '—'}</b></a></li>
          <li><a href="${a.ai_limit ? 'tools-ai' : 'network'}"><span><i style="background:var(--bone)"></i>${third.label}</span><b>${esc(third.val)}</b></a></li>
        </ul>
      </div>
      ${cl.length ? `<div class="td-sec"><div class="td-sh"><h2>Your clients</h2><a href="tools-ai">All clients</a></div>
        <div class="box td-list">${cl.slice(0, 2).map((x) => `<a class="td-li" href="tools-diet?client=${encodeURIComponent(x.id)}">
          <span class="sq">${esc(FL.initials(x.full_name || '?'))}</span><span class="m"><b>${esc(x.full_name || 'Client')}</b><span>${esc(GOALS[x.goal] || 'Client')}</span></span>
          ${x.weight_kg ? `<span class="v"><b>${esc(Number(x.weight_kg).toFixed(1))}</b><span>kg</span></span>` : ''}</a>`).join('')}</div></div>` : ''}
      <a class="td-ai" href="${top ? 'tools-diet?client=' + encodeURIComponent(top.id) + '&ai=1' : 'tools-ai'}">
        <span class="ic">${FL.icon('sparkles', 20)}</span>
        <span class="m"><b>${top ? `Build ${esc(first(top.full_name))}'s next plan` : 'Build your next plan'}</b><span>${top ? 'Coach AI · uses the latest blood report' : 'Coach AI · diet and workout plans from blood reports'}</span></span>${arrow}</a>
      ${(d.jobs || []).length ? `<div class="td-sec td-dup"><div class="td-sh"><h2>Jobs that match you</h2><a href="jobs?tab=foryou">See all</a></div>
        <div class="box td-list">${d.jobs.slice(0, 2).map((j) => `<a class="td-li" href="jobs?job=${encodeURIComponent(j.id)}">
          <span class="m"><b>${esc(j.title)}</b><span>${jobSub(j)}</span></span><span class="v"><b>${esc(shortPay(j))}</b><span>${esc((FL.PERIOD && FL.PERIOD[j.salary_period]) || '')}</span></span></a>`).join('')}</div></div>` : ''}
    </div>`;
  }

  function mount(host, me, dataP) {
    if (!host) return;
    const d = { jobs: null, course: null, cnt: 0, access: null, clients: null };
    let proAsked = false;
    const draw = () => {
      const s = FL.look.get();
      if (s === 'pro' && !proAsked) {
        proAsked = true;
        Promise.all([
          Promise.resolve(sb.rpc('tools_access')).then((r) => (r && r.data) || {}).catch(() => ({})),
          Promise.resolve(sb.from('coach_clients').select('id,full_name,goal,weight_kg,updated_at').is('archived_at', null).order('updated_at', { ascending: false }).limit(2))
            .then((r) => (r && r.data) || []).catch(() => []),
        ]).then(([acc, cl]) => { d.access = acc; d.clients = cl; if (FL.look.get() === 'pro') draw(); });
      }
      host.innerHTML = s === 'pop' ? pop(me, d) : s === 'pro' ? pro(me, d) : neon(me, d);
    };
    draw();
    Promise.resolve(dataP).then((x) => { if (!x) return; Object.assign(d, x); draw(); }).catch(() => {});
    document.addEventListener('fl:look', draw);
  }

  root.FLToday = { mount, strength };
})(window);
