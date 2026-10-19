/* =====================================================================
   THE FIT LAB — bookings (v10)
   Shared by profile, bookings, requests and Hire-a-coach pages:
   time-slot picker, the booking window, online payment, the UPI box.
   ===================================================================== */
(function () {
  const esc = FL.esc, I = FL.icon;
  const TZ = 'Asia/Kolkata';
  const fmtDay = (t) => new Date(t).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ });
  const fmtTime = (t) => new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
  const fmtWhen = (t) => `${fmtDay(t)}, ${fmtTime(t)}`;
  const fmtDate = (d) => new Date(String(d).length === 10 ? d + 'T12:00:00+05:30' : d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
  const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
  const METHOD = { upi: 'UPI to the professional', cash: 'Pay at the session', online: 'Pay now on The Fit Lab', free: 'Free' };
  const METHOD_HELP = {
    upi: 'You pay their UPI ID directly from any UPI app after they confirm.',
    cash: 'Pay in cash or UPI when you meet.',
    online: 'Card, UPI or net banking through Razorpay. Your time is confirmed as soon as you pay.',
  };
  const STATUS = { requested: 'Waiting for reply', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', declined: 'Declined', expired: 'Expired' };
  const PAY = { unpaid: 'Not paid', claimed: 'Payment to check', paid: 'Paid', refund_due: 'Refund on its way', refunded: 'Refunded' };
  const MODE = { in_person: 'In person', online: 'Online', home_visit: 'Home visit', hybrid: 'In person or online' };
  const statusChip = (s) => `<span class="chip st-${esc(s)}">${esc(STATUS[s] || s)}</span>`;
  const payChip = (b) => b.pay_method === 'free' ? '<span class="chip">Free</span>'
    : `<span class="chip pay-${esc(b.pay_status)}">${esc(PAY[b.pay_status] || b.pay_status)}</span>`;
  const stars = (n, size = 14) => {
    const v = Math.round(Number(n) || 0);
    return `<span class="stars" aria-label="${v} out of 5 stars" style="font-size:${size}px">${'★'.repeat(v)}<i>${'★'.repeat(5 - v)}</i></span>`;
  };
  const ratingLine = (r) => r && r.count ? `${stars(r.avg)} <b>${Number(r.avg).toFixed(1)}</b> <span class="muted">(${r.count} review${r.count === 1 ? '' : 's'})</span>` : '';

  // ---------------------------------------------------------- time slots
  async function slotPicker(el, coachId, minutes, onPick) {
    el.innerHTML = '<div class="skeleton" style="height:120px;border-radius:10px"></div>';
    const { data, error } = await sb.rpc('coach_slots', { p_coach: coachId, p_min: minutes, p_from: null, p_days: 21 });
    const days = (!error && data) || [];
    if (!days.length) {
      el.innerHTML = '<div class="empty" style="padding:18px 8px"><b>No open times in the next 3 weeks</b>Message them to find a time, or check back later.</div>';
      onPick(null);
      return { refresh: () => slotPicker(el, coachId, minutes, onPick) };
    }
    let di = 0, picked = null;
    const parts = (d) => { const [y, m, dd] = d.split('-').map(Number); const dt = new Date(Date.UTC(y, m - 1, dd, 6)); return dt; };
    const render = () => {
      el.innerHTML = `<div class="bk-days" role="tablist" aria-label="Day">${days.map((d, i) => {
          const dt = parts(d.date);
          return `<button type="button" role="tab" aria-selected="${i === di}" class="${i === di ? 'on' : ''}" data-d="${i}">
            <span>${dt.toLocaleDateString('en-IN', { weekday: 'short', timeZone: TZ })}</span><b>${dt.getUTCDate()}</b><span>${dt.toLocaleDateString('en-IN', { month: 'short', timeZone: TZ })}</span></button>`; }).join('')}</div>
        <div class="bk-times" role="listbox" aria-label="Time">${days[di].times.map((t) => `<button type="button" role="option" aria-selected="${t === picked}" class="${t === picked ? 'on' : ''}" data-t="${esc(t)}">${fmtTime(t)}</button>`).join('')}</div>`;
    };
    el.onclick = (e) => {
      const d = e.target.closest('[data-d]'); if (d) { di = +d.dataset.d; render(); return; }
      const t = e.target.closest('[data-t]'); if (t) { picked = t.dataset.t; render(); onPick(picked); }
    };
    render();
    return { refresh: () => slotPicker(el, coachId, minutes, onPick) };
  }

  // ---------------------------------------------------------- the booking window
  async function open(serviceId, { proposal = null, price = null } = {}) {
    const session = await FL.session();
    if (!session) { location.href = '/?next=' + encodeURIComponent(location.pathname + location.search); return; }
    const { data: o, error } = await sb.rpc('booking_options', { p_service: serviceId });
    if (error || !o) return FL.toast(FL.friendly(error || new Error('Booking isn\'t available')), 'err');
    if (!o.ok) return FL.notice('Booking isn\'t available', o.message);
    if (o.own) return FL.toast('This is your own service', 'err');
    const s = o.service, c = o.coach;
    const amount = price != null ? Number(price) : Number(s.price);
    const methods = amount === 0 ? ['free'] : o.methods.filter((x) => x !== 'free');
    if (!methods.length) return FL.notice('Booking isn\'t available', 'This professional hasn\'t set up how clients pay yet. Send them a message instead.');
    let start = null, method = methods[0], picker = null;
    const m = FL.modal({ title: 'Book ' + s.title, wide: true, body: `
      <div class="bk-sum">
        <div class="bk-who">${FL.avatarHtml(c, 'avatar')}<div><b>${esc(c.full_name)}</b> ${FL.tick(c.verified, 14)}
          <div class="t-sm muted">${esc(c.headline || '')}</div>${c.rating && c.rating.count ? `<div class="t-sm">${ratingLine(c.rating)}</div>` : ''}</div></div>
        <div class="bk-facts">
          <span>${I('clock', 16)}${s.sessions > 1 ? `${s.sessions} sessions × ` : ''}${s.session_min} min</span>
          <span>${I('rupee', 16)}${amount === 0 ? 'Free' : inr(amount)}${proposal && amount !== Number(s.price) ? ' <span class="muted">(proposal price)</span>' : ''}</span>
          <span>${I('pin', 16)}${esc(MODE[s.mode] || 'In person')}${o.place && s.mode !== 'online' ? ' · ' + esc(o.place) : ''}</span>
          ${s.sessions > 1 ? `<span>${I('calendar', 16)}Use within ${s.valid_days} days</span>` : ''}
        </div>
      </div>
      <h4 class="bk-h">${s.sessions > 1 ? 'Choose a time for your first session' : 'Choose a time'}</h4>
      <div id="bkSlots"></div>
      ${methods[0] !== 'free' ? `<h4 class="bk-h">How you'll pay</h4>
        <div class="radio-list bk-pay">${methods.map((x, i) => `<label class="opt"><input type="radio" name="bkm" value="${x}" ${i === 0 ? 'checked' : ''}>
          <span><b>${esc(METHOD[x])}</b><br><span class="t-xs muted">${esc(METHOD_HELP[x] || '')}</span></span></label>`).join('')}</div>` : ''}
      <div class="field" style="margin-top:14px"><label for="bkNote">Anything they should know? <span class="muted" style="text-transform:none;letter-spacing:0">(optional)</span></label>
        <textarea id="bkNote" maxlength="600" style="min-height:76px" placeholder="Your goal, injuries, preferred days…"></textarea></div>
      <p class="t-xs muted" style="margin:6px 0 0">${o.instant ? 'Your time is confirmed straight away.' : 'They confirm within 48 hours, or the time is released.'}
        You can move or cancel a session up to ${o.notice_hours} hours before it starts.</p>`,
      foot: `<span class="left t-sm" id="bkWhen">Pick a time</span><button class="pill solid" id="bkGo" disabled>${amount === 0 ? 'Book free session' : 'Book'}</button>` });
    const go = m.q('#bkGo'), when = m.q('#bkWhen');
    const sync = () => {
      go.disabled = !start;
      go.textContent = !start ? 'Book' : method === 'online' ? `Pay ${inr(amount)}` : amount === 0 ? 'Book free session' : o.instant ? 'Book' : 'Send booking request';
    };
    m.qa('input[name=bkm]').forEach((r) => { r.onchange = () => { method = r.value; sync(); }; });
    picker = await slotPicker(m.q('#bkSlots'), c.user_id, s.session_min, (t) => { start = t; when.textContent = t ? fmtWhen(t) : 'Pick a time'; sync(); });
    go.onclick = async () => {
      FL.busy(go, true, method === 'online' ? 'Opening payment…' : 'Booking…');
      try {
        const { data: r, error: e } = await sb.rpc('book_service', { p_service: serviceId, p_start: start, p_method: method, p_note: m.q('#bkNote').value.trim() || null, p_proposal: proposal });
        if (e) return FL.toast(FL.friendly(e), 'err');
        if (!r || r.ok === false) {
          if (r && r.code === 'slot') { FL.toast(r.message, 'err'); start = null; sync(); when.textContent = 'Pick a time'; if (picker) picker = await picker.refresh(); return; }
          if (r && r.code === 'guidelines') { const ok = await FL.guidelines(); if (ok) go.click(); return; }
          if (r && r.blocked) return FL.notice('Not sent', r.message);
          return FL.notice('Couldn\'t book', (r && r.message) || 'Please try again.');
        }
        m.close();
        if (r.pay_method === 'online') return payOnline(r.id);
        location.href = 'bookings?b=' + r.id;
      } finally { FL.busy(go, false); sync(); }
    };
    sync();
  }

  // ---------------------------------------------------------- online payment
  function loadScript(src, globalName) {
    if (window[globalName]) return Promise.resolve();
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  async function payOnline(bookingId) {
    const { data, error } = await FL.fn('booking-checkout', { action: 'order', booking: bookingId });
    if (error || !data || !data.ok) {
      const msg = (data && data.message) || 'Online payment couldn\'t be opened.';
      if (data && data.code === 'not_configured') {
        await sb.rpc('cancel_booking', { p_booking: bookingId, p_reason: null });
        return FL.notice('Online payment is coming soon', msg);
      }
      FL.toast(msg, 'err');
      location.href = 'bookings?b=' + bookingId;
      return;
    }
    try { await loadScript('https://checkout.razorpay.com/v1/checkout.js', 'Razorpay'); }
    catch (_) { FL.toast('Couldn\'t load the payment window. Check your connection and try again.', 'err'); location.href = 'bookings?b=' + bookingId; return; }
    const rz = new window.Razorpay({
      key: data.key_id, amount: data.amount, currency: data.currency, order_id: data.order_id,
      name: 'The Fit Lab', description: data.description, prefill: data.prefill,
      theme: { color: getComputedStyle(document.documentElement).getPropertyValue('--lime').trim() || '#a3e635' },
      modal: { ondismiss: () => { location.href = 'bookings?b=' + bookingId; } },
      handler: async (resp) => {
        FL.toast('Confirming your payment…');
        const v = await FL.fn('booking-checkout', { action: 'verify', order_id: resp.razorpay_order_id, payment_id: resp.razorpay_payment_id, signature: resp.razorpay_signature });
        if (v.data && v.data.ok) FL.toast(v.data.confirmed === false ? 'Paid. That time was released, so we\'ll refund you.' : 'Booked and paid', v.data.confirmed === false ? 'err' : 'ok');
        else FL.toast((v.data && v.data.message) || 'We couldn\'t confirm the payment yet. If money was taken, your booking is confirmed within a few minutes.', 'err');
        setTimeout(() => { location.href = 'bookings?b=' + bookingId; }, 900);
      },
    });
    rz.on('payment.failed', (r) => FL.toast((r && r.error && r.error.description) || 'Payment failed. No money was taken.', 'err'));
    rz.open();
  }

  // ---------------------------------------------------------- UPI box
  function upiLink(b) {
    const p = new URLSearchParams({ pa: b.upi.id, pn: b.upi.name || 'Coach', am: String(b.price), cu: 'INR', tn: `Fit Lab ${b.ref}` });
    return 'upi://pay?' + p.toString().replace(/\+/g, '%20');
  }
  function upiBoxHtml(b) {
    const claimed = b.pay_status === 'claimed';
    return `<div class="upi-box">
      <div class="upi-qr" id="upiQr" aria-hidden="true"></div>
      <div class="upi-main">
        <div class="t-sm muted">Pay ${esc(b.upi.name || '')}</div>
        <div class="upi-amt">${inr(b.price)}</div>
        <div class="upi-id"><span class="mono" id="upiId">${esc(b.upi.id)}</span><button class="txt-btn" type="button" data-copyupi>${I('link', 15)}Copy UPI ID</button></div>
        <div class="t-xs muted">Add <b class="mono">${esc(b.ref)}</b> as the note so they can match your payment.</div>
        <div class="btn-row" style="margin-top:10px">
          <a class="pill sm only-phone" href="${esc(upiLink(b))}">Open UPI app</a>
          ${claimed ? '<span class="chip">You said you\'ve paid · waiting for them to check</span>' : '<button class="pill solid sm" type="button" data-paid>I\'ve paid</button>'}
        </div>
      </div></div>`;
  }
  async function drawQr(el, text) {
    if (!el) return;
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js', 'qrcode');
      const qr = window.qrcode(0, 'M'); qr.addData(text); qr.make();
      el.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    } catch (_) { el.remove(); }
  }

  window.FLBook = { open, payOnline, slotPicker, upiBoxHtml, upiLink, drawQr, fmtDay, fmtTime, fmtWhen, fmtDate, inr, stars, ratingLine,
    statusChip, payChip, STATUS, PAY, METHOD, MODE };
})();
