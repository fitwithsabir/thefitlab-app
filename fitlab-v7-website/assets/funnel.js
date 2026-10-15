// =====================================================================
//  THE FIT LAB — sign-up card for the promotion pages
//  One card, three journeys (set by window.FUNNEL on each page):
//    kind 'course' → create account → pay ₹99 (full course or direct certification)
//    kind 'jobs'   → create account → profile visible to employers + job alerts
//    kind 'hire'   → create account → hiring page created → post a job
//  Needs: config.js, supabase-js, app.js, track.js.
// =====================================================================
(async function () {
  const F = window.FUNNEL;
  const $ = (id) => document.getElementById(id);
  const esc = FL.esc;
  const root = $('signup');
  if (!F || !root) return;

  const LABEL = { personal_trainer: 'Personal Trainer', sc_coach: 'Strength & Conditioning Coach', group_fitness: 'Group Fitness Instructor',
    yoga: 'Yoga Instructor', pilates: 'Pilates Instructor', functional: 'Functional Fitness Coach', dance_fitness: 'Dance Fitness Instructor',
    sports_coach: 'Sports Coach', swim_coach: 'Swimming Coach', martial_arts: 'Martial Arts Instructor', online_coach: 'Online Coach',
    physio: 'Physiotherapist', dietitian: 'Dietitian', nutritionist: 'Nutritionist', wellness_coach: 'Wellness / Health Coach',
    gym_owner: 'Gym / Studio Owner', gym_manager: 'Gym / Clinic Manager', recruiter: 'Recruiter / HR', student: 'Student / Trainee', other: 'Other' };
  const ROLE_WORD = { coach: 'coaches', trainer: 'trainers', nutritionist: 'nutritionists' };
  const KIND = { gym: 'Gym', studio: 'Fitness studio', clinic: 'Clinic', wellness: 'Wellness centre', academy: 'Academy / Institute', sports_club: 'Sports club', hospital: 'Hospital', other: 'Other' };
  const JOBTYPE = { full_time: 'Full-time', part_time: 'Part-time', freelance: 'Freelance', per_session: 'Per session', contract: 'Contract' };
  const PENDING = 'fl_pending_signup';
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }, del(k) { try { localStorage.removeItem(k); } catch (_) {} } };
  const opts = (map, codes, sel, ph) => (ph ? `<option value="">${esc(ph)}</option>` : '') +
    codes.map((c) => `<option value="${esc(c)}"${c === sel ? ' selected' : ''}>${esc(map[c] || c)}</option>`).join('');
  const icon = (n, s = 18) => FL.icon(n, s);

  let session = await FL.session();
  let me = session ? await FL.getProfile().catch(() => null) : null;
  let course = null, track = F.track || 'full', gender = (me && me.gender) || '';
  if (F.kind === 'course') {
    const { data } = await sb.from('courses').select('id, slug, title, price_paise, exam_question_count, exam_seconds_per_question, pass_percentage, max_attempts')
      .eq('slug', F.courseSlug).maybeSingle();
    course = data;
  }
  const price = course && course.price_paise ? '₹' + (course.price_paise / 100).toLocaleString('en-IN') : '₹99';
  const contentId = () => `${F.courseSlug || F.funnel}-${track}`;
  if (F.kind === 'course') FLTrack.event('ViewContent', { content_name: F.title, content_ids: [contentId()], content_type: 'product', value: (course?.price_paise || 9900) / 100, currency: 'INR' });
  else FLTrack.event('ViewContent', { content_name: F.funnel, content_category: F.kind });

  // ------------------------------------------------------------------ the form
  const needAccount = !session;
  const needProfile = !me || !me.profile_completed;
  function formHtml() {
    const roleCodes = F.professions || [];
    let roleFields = '';
    if (F.kind === 'course') {
      roleFields = `<div class="row2">
        <div class="field"><label for="fProf">You are a</label><select id="fProf">${opts(LABEL, roleCodes, '', 'Choose')}</select></div>
        <div class="field"><label for="fExp">Experience</label><select id="fExp"><option value="">Choose</option><option value="beginner">New / aspiring</option><option value="1-3 years">1–3 years</option><option value="3+ years">3+ years</option></select></div></div>`;
    } else if (F.kind === 'jobs') {
      roleFields = `<div class="row2">
        <div class="field"><label for="fProf">Your role</label><select id="fProf">${opts(LABEL, roleCodes, roleCodes[0], '')}</select></div>
        <div class="field"><label for="fExp">Experience</label><select id="fExp"><option value="">Choose</option><option value="beginner">Fresher</option><option value="1-3 years">1–3 years</option><option value="3+ years">3+ years</option></select></div></div>
        <div class="field"><label for="fType">Looking for</label><select id="fType">${opts(JOBTYPE, Object.keys(JOBTYPE), 'full_time', '')}</select></div>`;
    } else {
      roleFields = `<div class="field"><label for="fOrg">Gym / studio / clinic name</label><input id="fOrg" maxlength="80" placeholder="e.g. Iron Temple Fitness" autocomplete="organization"></div>
        <div class="row2">
          <div class="field"><label for="fKind">Type</label><select id="fKind">${opts(KIND, Object.keys(KIND), 'gym', '')}</select></div>
          <div class="field"><label for="fProf">Your role</label><select id="fProf">${opts(LABEL, ['gym_owner', 'gym_manager', 'recruiter'], 'gym_owner', '')}</select></div></div>
        <div class="field"><label>Hiring</label><div class="fseg three" id="fHire">${['coach', 'trainer', 'nutritionist'].map((r) =>
          `<button type="button" data-v="${r}" class="${r === F.role ? 'on' : ''}">${r === 'coach' ? 'Coaches' : r === 'trainer' ? 'Trainers' : 'Nutritionists'}</button>`).join('')}</div></div>`;
    }
    const optional = F.kind === 'jobs' ? `<details class="more"><summary>Add certifications &amp; specialties <span>(optional — gets you noticed)</span></summary>
        <div class="help" style="margin-bottom:8px">Any valid certification counts — K11, ACE, NASM, ISSA, REPs, a nutrition diploma, a university degree…</div>
        <div id="certs"></div><button class="btn btn-ghost" type="button" id="addCert" style="width:100%;margin-bottom:12px">+ Add a certification</button>
        <div class="field"><label for="fSpec">Specialties</label><input id="fSpec" maxlength="200" placeholder="e.g. Fat loss, Strength, PCOS nutrition"></div>
        <div class="field"><label for="fDob">Date of birth</label><input id="fDob" type="date"></div></details>`
      : F.kind === 'course' ? `<details class="more"><summary>More about you <span>(optional)</span></summary>
        <div class="field"><label for="fDob">Date of birth</label><input id="fDob" type="date"></div>
        <div class="field"><label for="fWork">Where you work now</label><input id="fWork" maxlength="100" placeholder="e.g. Trainer at ___ Gym · Freelance PT · Student"></div></details>` : '';
    return `
      ${F.kind === 'course' ? `<div class="trk" id="trk">
        <label class="${track === 'full' ? 'on' : ''}"><input type="radio" name="trk" value="full" ${track === 'full' ? 'checked' : ''}><span class="t"><b>Full course + certificate</b><span>30 days · 6 modules · then the exam</span></span><span class="p">${price}</span></label>
        <label class="${track === 'direct' ? 'on' : ''}"><input type="radio" name="trk" value="direct" ${track === 'direct' ? 'checked' : ''}><span class="t"><b>Direct certification</b><span>Skip the lessons · take the exam now</span></span><span class="p">${price}</span></label></div>` : ''}
      ${!needAccount ? `<div class="me">${FL.avatarHtml(me || { full_name: session.user.email }, 'avatar sm')}<div><b>${esc((me && me.full_name) || session.user.email)}</b><span>Signed in · <a href="#" id="swUser">not you?</a></span></div></div>` : ''}
      <form id="suForm" novalidate>
        ${needAccount ? `
        <div class="field"><label for="fName">Full name</label><input id="fName" autocomplete="name" maxlength="80" placeholder="${F.kind === 'hire' ? 'Your name' : 'As it should appear on your certificate'}"></div>
        <div class="row2">
          <div class="field"><label for="fEmail">Email</label><input id="fEmail" type="email" autocomplete="email" inputmode="email" placeholder="you@gmail.com"></div>
          <div class="field"><label for="fPhone">Mobile</label><input id="fPhone" type="tel" autocomplete="tel" inputmode="tel" maxlength="16" placeholder="98765 43210"></div></div>
        <div class="field"><label for="fPass">Create a password</label><div class="pw"><input id="fPass" type="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters"><button type="button" id="pwT">Show</button></div></div>` : ''}
        ${needProfile ? `
        ${!(me && me.gender) ? `<div class="field"><label>Gender</label><div class="fseg" id="fGender"><button type="button" data-v="male">Male</button><button type="button" data-v="female">Female</button></div></div>` : ''}
        <div class="field"><label for="fCity">City</label><input id="fCity" autocomplete="address-level2" maxlength="60" placeholder="e.g. Kakinada" value="${esc((me && me.city) || '')}"></div>
        ${needAccount ? '' : `<div class="field"><label for="fPhone">Mobile</label><input id="fPhone" type="tel" inputmode="tel" maxlength="16" placeholder="98765 43210" value="${esc((me && me.phone) || '')}"></div>`}` : ''}
        ${needProfile || F.kind !== 'course' ? roleFields : ''}
        ${needProfile ? optional : ''}
        ${needProfile ? `<label class="check" style="margin:6px 0 4px"><input type="checkbox" id="fAgree"><span>I agree to the <a href="terms.html" target="_blank" rel="noopener">terms</a>, <a href="privacy.html" target="_blank" rel="noopener">privacy policy</a> and community guidelines, and that my name${F.kind === 'course' ? ', photo and certificate result' : ' and profile'} can be shown to members and employers.</span></label>` : ''}
        <div class="err hidden" id="fErr" role="alert" style="margin-top:8px"></div>
        <button class="btn btn-primary btn-block" type="submit" id="fGo" style="margin-top:12px">${esc(ctaText())}</button>
        <p class="fine">${esc(F.fine || '')}</p>
      </form>`;
  }
  function ctaText() {
    if (F.kind === 'course') return (needAccount ? 'Create account & pay ' : 'Pay ') + price;
    if (F.kind === 'jobs') return needAccount ? 'Create my free profile' : 'Make my profile visible';
    return needAccount ? 'Create free hiring account' : 'Set up my hiring page';
  }

  function render() {
    root.innerHTML = `<div class="card glow hud su"><span class="c1"></span><span class="c2"></span>
      <div class="eyebrow">${esc(F.formEyebrow)}</div><h2>${esc(F.formTitle)}</h2><p class="su-sub">${esc(F.formSub)}</p>
      <div id="suBody">${formHtml()}</div></div>`;
    wire();
  }

  function wire() {
    const t = $('trk');
    if (t) t.onchange = (e) => { track = e.target.value; t.querySelectorAll('label').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked)); $('fGo').textContent = ctaText(); };
    const g = $('fGender');
    if (g) g.onclick = (e) => { const b = e.target.closest('[data-v]'); if (!b) return; gender = b.dataset.v; g.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); };
    const h = $('fHire');
    if (h) h.onclick = (e) => { const b = e.target.closest('[data-v]'); if (!b) return; F.role = b.dataset.v; h.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); };
    const pt = $('pwT');
    if (pt) pt.onclick = () => { const i = $('fPass'); i.type = i.type === 'password' ? 'text' : 'password'; pt.textContent = i.type === 'password' ? 'Show' : 'Hide'; };
    const sw = $('swUser');
    if (sw) sw.onclick = async (e) => { e.preventDefault(); await sb.auth.signOut(); location.reload(); };
    const ac = $('addCert');
    if (ac) { const add = () => { const d = document.createElement('div'); d.className = 'certrow';
        d.innerHTML = '<input maxlength="150" placeholder="Certification" data-c="name"><input maxlength="150" placeholder="Issued by" data-c="issuer"><button type="button" aria-label="Remove">×</button>';
        d.querySelector('button').onclick = () => d.remove(); $('certs').appendChild(d); };
      ac.onclick = add; add(); }
    $('suForm').onsubmit = (e) => { e.preventDefault(); submit(); };
  }

  const err = (m) => { const el = $('fErr'); if (!el) return FL.toast(m, 'err'); el.innerHTML = m; el.classList.remove('hidden'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
  const val = (id) => ($(id) ? $(id).value.trim() : '');
  const phoneOk = (p) => { const d = p.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, ''); return /^[6-9]\d{9}$/.test(d) ? '+91' + d : null; };

  function collect() {
    const v = { name: val('fName'), email: val('fEmail').toLowerCase(), phone: val('fPhone'), pass: $('fPass') ? $('fPass').value : '',
      city: val('fCity'), prof: val('fProf'), exp: val('fExp'), type: val('fType'), org: val('fOrg'), kind: val('fKind'), dob: val('fDob'),
      work: val('fWork'), spec: val('fSpec'), gender, role: F.role, track,
      certs: [...document.querySelectorAll('.certrow')].map((r) => ({ name: r.querySelector('[data-c=name]').value.trim(), issuer: r.querySelector('[data-c=issuer]').value.trim() }))
        .filter((c) => c.name || c.issuer) };
    return v;
  }
  function validate(v) {
    if (needAccount) {
      if (v.name.length < 2 || !/[a-z]/i.test(v.name)) return 'Enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return 'Enter a valid email address.';
      if (!phoneOk(v.phone)) return 'Enter a 10-digit Indian mobile number.';
      if (v.pass.length < 8) return 'Choose a password with at least 8 characters.';
    }
    if (needProfile) {
      if (!(me && me.gender) && !v.gender) return 'Choose your gender.';
      if (v.city.length < 2) return 'Enter your city.';
      if (!needAccount && !phoneOk(v.phone)) return 'Enter a 10-digit Indian mobile number.';
      if (F.kind !== 'hire' && !v.prof) return F.kind === 'jobs' ? 'Choose your role.' : 'Tell us what you do.';
      if (!$('fAgree').checked) return 'Please tick the box to agree to the terms.';
    }
    if (F.kind === 'hire' && (needProfile || !hasPage)) {
      if (v.org.length < 2) return 'Enter your gym, studio or clinic name.';
    }
    for (const c of v.certs) if (c.name.length < 2 || c.issuer.length < 2) return 'For each certification, add its name and who issued it (or remove the row).';
    return null;
  }

  let hasPage = false;
  if (F.kind === 'hire' && session) { const { data } = await sb.rpc('my_pages'); hasPage = Array.isArray(data) && data.length > 0; }

  async function submit() {
    $('fErr') && $('fErr').classList.add('hidden');
    const v = collect();
    const problem = validate(v); if (problem) return err(problem);
    const btn = $('fGo'); FL.busy(btn, true, needAccount ? 'Creating your account…' : 'Saving…');
    try {
      if (needAccount) {
        const { data, error } = await sb.auth.signUp({ email: v.email, password: v.pass,
          options: { data: { full_name: v.name }, emailRedirectTo: location.href.split('#')[0] } });
        if (error) {
          if (/registered|already|exists/i.test(error.message || '')) {
            const r = await sb.auth.signInWithPassword({ email: v.email, password: v.pass });
            if (r.error) { FL.busy(btn, false); return err(`This email already has a Fit Lab account. Enter that account's password, or <a href="index.html#forgot">reset it</a>.`); }
            session = r.data.session;
          } else { FL.busy(btn, false); return err(esc(FL.friendly(error))); }
        } else if (!data.session) {
          const { pass, ...keep } = v; store.set(PENDING, { funnel: F.funnel, at: Date.now(), v: keep });
          FL.busy(btn, false);
          return showConfirmEmail(v.email);
        } else session = data.session;
        me = await FL.getProfile(true).catch(() => null);
      }
      await saveProfile(v);
      FL.busy(btn, false);
      await afterSignup(v);
    } catch (ex) {
      FL.busy(btn, false);
      err(esc(FL.friendly(ex)));
    }
  }

  async function saveProfile(v) {
    if (!me) me = await FL.getProfile(true);
    const uid = me.id;
    const prof = F.kind === 'hire' ? (v.prof || 'gym_owner') : v.prof;
    if (!me.profile_completed) {
      const upd = { full_name: v.name || me.full_name, phone: phoneOk(v.phone) || me.phone || null, city: v.city || me.city || null, country: me.country || 'India',
        profession: prof || me.profession || null, experience_level: v.exp || me.experience_level || null,
        date_of_birth: v.dob || me.date_of_birth || null, display_consent: true, profile_completed: true };
      if (!me.gender && v.gender) upd.gender = v.gender;
      const label = LABEL[prof] || 'Fitness professional';
      if (!me.headline) upd.headline = F.kind === 'hire' ? `${label} at ${v.org}`.slice(0, 160) : F.kind === 'jobs' ? `${label} · open to work` : `${label}${v.city ? ' · ' + v.city : ''}`;
      if (v.work) upd.occupation = v.work;
      if (F.kind === 'hire') upd.occupation = `${label} at ${v.org}`.slice(0, 120);
      if (v.spec) upd.specialties = v.spec.split(/[,·]/).map((s) => s.trim()).filter(Boolean).slice(0, 10);
      const { error } = await sb.from('profiles').update(upd).eq('id', uid);
      if (error) throw error;
      await sb.rpc('accept_guidelines');
      me = await FL.getProfile(true);
      FLTrack.identify({ ...me, email: session.user.email });
      FLTrack.event('CompleteRegistration', { content_name: F.funnel, status: true }, 'reg-' + uid);
    } else {
      FLTrack.identify({ ...me, email: session.user.email });
    }
    if (F.kind === 'jobs') await sb.from('profiles').update({ open_to_work: true }).eq('id', uid);
    if (F.kind === 'hire') await sb.from('profiles').update({ hiring: true }).eq('id', uid);
    await FLTrack.saveAttribution(F.funnel);
    store.del(PENDING);
  }

  async function afterSignup(v) {
    if (F.kind === 'course') return pay();
    if (F.kind === 'jobs') {
      for (const c of v.certs) await sb.from('credentials').insert({ user_id: me.id, name: c.name, issuer: c.issuer });
      await sb.rpc('save_job_alert', { p: { profession: v.prof || me.profession, city: v.city || me.city, employment_type: v.type || null } });
      return done('jobs');
    }
    // hire
    if (!hasPage) {
      const r = await FL.call('create_page', { p: { name: v.org, kind: v.kind || 'gym', city: v.city || me.city || '' } });
      if (!r) return;
      hasPage = true;
    }
    FLTrack.event('Lead', { content_name: F.funnel, content_category: 'hiring' }, 'lead-' + me.id);
    return done('hire');
  }

  // ------------------------------------------------------------------ payment
  function loadRazorpay() {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  async function pay() {
    const btn = $('fGo') || $('payAgain');
    if (btn) FL.busy(btn, true, 'Opening secure payment…');
    const { data, error } = await FL.fn('premium-checkout', { action: 'course_order', course: course.id, track, meta: FLTrack.meta(F.funnel) });
    if (btn) FL.busy(btn, false);
    if (error) return payLater('Payments couldn\'t be opened. Please try again.');
    if (!data || !data.ok) {
      if (data && data.code === 'enrolled') return done(track, true);
      return payLater((data && data.message) || 'Payments couldn\'t be opened.');
    }
    try { await loadRazorpay(); } catch (e) { return payLater('Couldn\'t load the payment window. Check your connection and try again.'); }
    FLTrack.event('InitiateCheckout', { content_name: F.title, content_ids: [contentId()], content_type: 'product', value: data.amount / 100, currency: 'INR', num_items: 1 });
    const rz = new window.Razorpay({
      key: data.key_id, amount: data.amount, currency: data.currency, order_id: data.order_id,
      name: 'The Fit Lab Academy', description: `${data.name} · ${data.description}`,
      prefill: { ...(data.prefill || {}), contact: (me && me.phone) || '' },
      theme: { color: '#65a30d' },
      modal: { ondismiss: () => payLater('Payment not completed — you weren\'t charged. Your account is ready; pay whenever you like.') },
      handler: async (resp) => {
        showWorking('Confirming your payment…');
        const vr = await FL.fn('premium-checkout', { action: 'verify', order_id: resp.razorpay_order_id, payment_id: resp.razorpay_payment_id, signature: resp.razorpay_signature });
        if (vr.data && vr.data.ok) {
          FLTrack.event('Purchase', { content_name: F.title, content_ids: [contentId()], content_type: 'product', value: data.amount / 100, currency: 'INR', num_items: 1 }, resp.razorpay_order_id);
          done(track);
        } else payLater((vr.data && vr.data.message) || 'We couldn\'t confirm the payment yet. If money was taken, your access opens within a few minutes — refresh this page.');
      },
    });
    rz.on('payment.failed', (r) => FL.toast((r && r.error && r.error.description) || 'Payment failed. No money was taken.', 'err'));
    rz.open();
  }
  function payLater(msg) {
    $('suBody').innerHTML = `<div class="me">${FL.avatarHtml(me || {}, 'avatar sm')}<div><b>${esc((me && me.full_name) || 'Your account')}</b><span>Account ready</span></div></div>
      <div class="err" style="margin-bottom:12px">${esc(msg)}</div>
      <button class="btn btn-primary btn-block" id="payAgain">Pay ${price} &amp; ${track === 'direct' ? 'get certified' : 'start'}</button>
      <p class="fine">Secure payment by Razorpay · UPI, cards, net banking</p>`;
    $('payAgain').onclick = pay;
  }
  function showWorking(msg) { $('suBody').innerHTML = `<div class="done"><div class="spinner" style="margin:20px auto"></div><p>${esc(msg)}</p></div>`; }

  // ------------------------------------------------------------------ results
  function done(what, already) {
    const slug = F.courseSlug;
    const photo = me && !me.photo_url ? `<a class="btn" href="profile.html?edit=1">Add your photo — it goes on your certificate</a>` : '';
    const box = {
      full: { t: already ? 'You\'re already enrolled' : 'You\'re in!', p: 'Day 1 is open. One chapter a day — then the certification exam.',
        a: `<a class="btn btn-primary" href="lesson.html?course=${slug}&day=1">Start Day 1</a>${photo}<a class="btn btn-ghost" href="feed.html">Explore The Fit Lab</a>` },
      direct: { t: already ? 'You\'re already enrolled' : 'Your exam is ready', p: `${course?.exam_question_count || 60} questions · ${course?.exam_seconds_per_question || 60} seconds each · stay on the page until you finish. Take it now or whenever you're ready.`,
        a: `<a class="btn btn-primary" href="exam.html?course=${slug}">Take the exam</a>${photo}<a class="btn btn-ghost" href="courses.html?c=${slug}">Study the course first</a>` },
      jobs: { t: 'You\'re visible to employers', p: `Your profile is live with #OpenToWork, and we'll alert you when a matching job is posted.`,
        a: `<a class="btn btn-primary" href="jobs.html">See jobs for you</a><a class="btn" href="profile.html?edit=1">Add photo &amp; experience</a>`,
        up: `<b>Stand out to gyms:</b> add a QR-verified Fit Lab certificate to your profile for ${price}. <a href="certify?utm_source=site&utm_medium=funnel&utm_campaign=jobs_upsell">Get certified →</a>` },
      hire: { t: 'Your hiring page is ready', p: `Post your first job — the pay is always shown, so serious ${ROLE_WORD[F.role] || 'candidates'} apply. You can message candidates directly.`,
        a: `<a class="btn btn-primary" href="hiring.html?new=1&role=${encodeURIComponent(F.role || '')}">Post a job</a><a class="btn" href="hiring.html?tab=candidates">Browse candidates</a>` },
    }[what];
    $('suBody').innerHTML = `<div class="done"><div class="tick">${icon('check', 30)}</div><h2>${esc(box.t)}</h2><p>${esc(box.p)}</p>${box.a}${box.up ? `<div class="upsell">${box.up}</div>` : ''}</div>`;
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function showConfirmEmail(email) {
    $('suBody').innerHTML = `<div class="done"><div class="tick">${icon('mail', 28)}</div><h2>Check your email</h2>
      <p>We sent a confirmation link to <b>${esc(email)}</b>. Open it on this device — you'll come straight back here to ${F.kind === 'course' ? 'pay and start' : 'finish'}.</p>
      <p class="fine">No email? Check spam, or <a href="#" id="again">try again</a>.</p></div>`;
    $('again').onclick = (e) => { e.preventDefault(); render(); };
  }

  // ------------------------------------------------------------------ start
  const pending = store.get(PENDING);
  if (session && pending && pending.funnel === F.funnel && Date.now() - pending.at < 3 * 86400000 && !(me && me.profile_completed)) {
    root.innerHTML = `<div class="card glow hud su"><span class="c1"></span><span class="c2"></span><div id="suBody"></div></div>`;
    showWorking('Finishing your account…');
    try { track = pending.v.track || track; gender = pending.v.gender; F.role = pending.v.role || F.role;
      await saveProfile(pending.v);
      if (F.kind === 'course') payLater('Your email is confirmed. One step left:'); else await afterSignup(pending.v);
    } catch (ex) { render(); err(esc(FL.friendly(ex))); }
  } else if (session && me && me.profile_completed && F.kind === 'hire' && hasPage) {
    render(); $('suBody').innerHTML = ''; done('hire');
  } else render();

  // buttons on the page that pick an option and jump to the card
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick]'); if (!b) return;
    e.preventDefault();
    const t = $('trk');
    if (t && (b.dataset.pick === 'full' || b.dataset.pick === 'direct')) { const r = t.querySelector(`input[value="${b.dataset.pick}"]`); if (r) { r.checked = true; t.onchange({ target: r }); } }
    root.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setTimeout(() => { const f = root.querySelector('input:not([type=radio]),select'); if (f) f.focus({ preventScroll: true }); }, 500);
  });
  // phone sticky bar disappears once the card is on screen
  const bar = document.querySelector('.lp-sticky');
  if (bar && 'IntersectionObserver' in window) {
    document.body.classList.add('has-sticky');
    new IntersectionObserver((es) => es.forEach((x) => bar.classList.toggle('gone', x.isIntersecting))).observe(root);
  }
})();
