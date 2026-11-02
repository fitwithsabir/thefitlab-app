/* The Fit Lab — payment receipts as PDF (fix-39).
   FLReceipt.download(r) turns one receipt (from my_receipts() / admin_receipt()) into an A4 PDF.
   The PDF fonts have no ₹ or Indian-script letters, so amounts read "INR 99.00". */
(function () {
  'use strict';
  const LIB = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  let libP = null;
  const lib = () => libP || (libP = new Promise((res, rej) => {
    if (window.jspdf) return res(window.jspdf.jsPDF);
    const s = document.createElement('script'); s.src = LIB; s.async = true;
    s.onload = () => res(window.jspdf.jsPDF); s.onerror = () => { libP = null; rej(new Error('Couldn\'t load the PDF maker. Check your connection and try again.')); };
    document.head.appendChild(s);
  }));
  let logoP = null;
  const logo = () => logoP || (logoP = fetch('assets/logo-600-light.png').then((r) => r.blob()).then((b) => new Promise((res) => {
    const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(b);
  })).catch(() => null));

  // the built-in PDF fonts cover Latin-1 only
  const txt = (s) => String(s == null ? '' : s)
    .replace(/₹\s?/g, 'INR ').replace(/[–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/→/g, '->')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '').trim();
  const inr = (paise) => 'INR ' + (Math.round(Number(paise) || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const KIND = { premium: 'Fit Lab Premium', team: 'Fit Lab Premium (team)', course: 'Course', coach_ai: 'Coach AI plan', booking: 'Session booking' };

  async function build(r) {
    const jsPDF = await lib();
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, L = 20, R = W - 20;
    const ink = [25, 28, 22], ash = [93, 102, 86], line = [226, 225, 220], green = [63, 125, 15];
    const set = (c) => doc.setTextColor(c[0], c[1], c[2]);

    // header
    const img = await logo();
    if (img) { try { doc.addImage(img, 'PNG', L, 16, 30, 15.2); } catch (_) { /* logo optional */ } }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); set(ink);
    doc.text('Payment receipt', R, 24, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); set(ash);
    doc.text(txt('Receipt no. ' + (r.order_id || '')), R, 30, { align: 'right' });
    doc.text(txt('Paid on ' + (r.paid_at || '')), R, 35, { align: 'right' });

    // PAID stamp
    doc.setDrawColor(green[0], green[1], green[2]); doc.setLineWidth(0.6);
    doc.roundedRect(R - 22, 40, 22, 8, 1.5, 1.5);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(green[0], green[1], green[2]);
    doc.text('PAID', R - 11, 45.6, { align: 'center' });

    // from / to
    let y = 60;
    doc.setFontSize(8.5); set(ash); doc.setFont('helvetica', 'bold');
    doc.text('FROM', L, y); doc.text('BILLED TO', 112, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); set(ink);
    const from = ['The Fit Lab', 'Kakinada, Andhra Pradesh, India', 'hello@thefitlab.in', 'thefitlab.in'];
    const to = [txt(r.name) || 'Fit Lab member', txt(r.email)].filter(Boolean);
    from.forEach((s, i) => { doc.setFont('helvetica', i ? 'normal' : 'bold'); doc.text(s, L, y + 6 + i * 5.2); });
    to.forEach((s, i) => { doc.setFont('helvetica', i ? 'normal' : 'bold'); doc.text(doc.splitTextToSize(s, 78)[0], 112, y + 6 + i * 5.2); });

    // item table
    y = 92;
    doc.setDrawColor(line[0], line[1], line[2]); doc.setLineWidth(0.3);
    doc.setFillColor(243, 242, 238); doc.rect(L, y, R - L, 9, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); set(ash);
    doc.text('DESCRIPTION', L + 3, y + 6); doc.text('AMOUNT', R - 3, y + 6, { align: 'right' });
    y += 9;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); set(ink);
    const item = doc.splitTextToSize(txt(r.item) || KIND[r.kind] || 'Payment', 120);
    doc.text(item, L + 3, y + 7);
    doc.text(inr(r.amount), R - 3, y + 7, { align: 'right' });
    let iy = y + 7 + (item.length - 1) * 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); set(ash);
    const details = [KIND[r.kind] ? KIND[r.kind] : '', txt(r.period), r.ref ? 'Booking ref ' + txt(r.ref) : '',
      r.until ? (r.kind === 'booking' ? 'Use by ' : 'Active until ') + txt(r.until) : ''].filter(Boolean);
    details.forEach((s) => { iy += 5; doc.text(s, L + 3, iy); });
    y = iy + 6;
    doc.line(L, y, R, y);

    // total
    y += 9;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); set(ink);
    doc.text('Total paid', R - 50, y, { align: 'right' });
    doc.text(inr(r.amount), R - 3, y, { align: 'right' });

    // payment details
    y += 16;
    doc.setFontSize(8.5); set(ash); doc.text('PAYMENT DETAILS', L, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); set(ink);
    const rows = [['Paid through', 'Razorpay (UPI, cards, net banking)'], ['Payment ID', r.payment_id || '-'], ['Order ID', r.order_id || '-'], ['Currency', r.currency || 'INR']];
    rows.forEach(([k, v], i) => { set(ash); doc.text(k, L, y + 7 + i * 6); set(ink); doc.text(txt(v), L + 40, y + 7 + i * 6); });

    // notes + footer
    y += 7 + rows.length * 6 + 8;
    doc.setFontSize(9); set(ash);
    const notes = [r.kind === 'premium' || r.kind === 'team' || r.kind === 'coach_ai' ? 'Paid once - nothing renews automatically.' : '',
      'This is a payment receipt. It is computer-generated and needs no signature.',
      'Questions about this payment? Write to hello@thefitlab.in with the receipt number.'].filter(Boolean);
    notes.forEach((s, i) => doc.text(s, L, y + i * 5));
    doc.setDrawColor(line[0], line[1], line[2]); doc.line(L, 280, R, 280);
    doc.setFontSize(8); doc.text('The Fit Lab - the network for health & fitness professionals - thefitlab.in', W / 2, 285, { align: 'center' });
    return doc;
  }

  const fileName = (r) => 'FitLab-receipt-' + String(r.order_id || r.paid_at || Date.now()).replace(/[^\w-]+/g, '') + '.pdf';

  window.FLReceipt = {
    async download(r) {
      const doc = await build(r);
      doc.save(fileName(r));
    },
  };
})();
