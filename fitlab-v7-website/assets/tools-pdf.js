/* =====================================================================
   The Fit Lab — coach-branded PDFs for diet and workout plans
   Uses jsPDF + jsPDF-AutoTable (loaded on demand from jsDelivr).
   ===================================================================== */
(function (root) {
  'use strict';
  const LIBS = ['https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
                'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js'];
  const load = (src) => new Promise((res, rej) => { if (document.querySelector(`script[src="${src}"]`)) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Couldn\'t load the PDF maker. Check your connection and try again.')); document.head.appendChild(s); });
  async function ready() { await load(LIBS[0]); await load(LIBS[1]); return window.jspdf.jsPDF; }

  // the built-in PDF fonts only know Western characters — swap the rest for close equivalents
  const WIN = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
  const MAP = { '−': '-', '≈': '~', '≥': '>=', '≤': '<=', '→': '->', '←': '<-', '✓': '', '✔': '', '₹': 'Rs ', '⚠': '!', '•': '•', ' ': ' ' };
  const clean = (s) => String(s == null ? '' : s).replace(/[^\x00-\xff]/g, (ch) => (MAP[ch] != null ? MAP[ch] : WIN.includes(ch) ? ch : ''));

  const LIME = [101, 163, 13], INK = [17, 20, 15], ASH = [93, 102, 86], LINE = [222, 224, 216], SOFT = [244, 248, 236];
  let logo = null;
  async function logoData() {
    if (logo) return logo;
    try {
      const b = await (await fetch('assets/logo-600-light.png')).blob();
      logo = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
    } catch (_) { logo = null; }
    return logo;
  }

  // a document with The Fit Lab header, the coach's details and a footer on every page
  async function start({ title, subtitle, coach, certificate, client }) {
    const JsPDF = await ready();
    const doc = new JsPDF({ unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const img = await logoData();
    if (img) doc.addImage(img, 'PNG', 14, 12, 26, 13);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...INK);
    doc.text(clean(title), W - 14, 19, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...ASH);
    if (subtitle) doc.text(clean(subtitle), W - 14, 25, { align: 'right' });
    doc.setDrawColor(...LIME); doc.setLineWidth(0.8); doc.line(14, 30, W - 14, 30);
    // coach card
    let y = 37;
    doc.setFillColor(...SOFT); doc.roundedRect(14, y - 4.5, W - 28, certificate ? 21 : 16, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...INK);
    doc.text(clean(`Prepared by ${coach.name || 'your coach'}`), 18, y + 1);
    if (coach.verified) { const w = doc.getTextWidth(clean(`Prepared by ${coach.name || 'your coach'}`)); doc.setFillColor(...LIME); doc.roundedRect(18 + w + 3, y - 2.6, 17, 4.6, 1.5, 1.5, 'F'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255); doc.text('VERIFIED', 18 + w + 11.5, y + 0.4, { align: 'center' }); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...ASH);
    const line2 = [coach.headline, coach.city, coach.unique_id ? `Fit Lab ID ${coach.unique_id}` : ''].filter(Boolean).join('  ·  ');
    if (line2) doc.text(doc.splitTextToSize(clean(line2), W - 36)[0], 18, y + 6);
    if (certificate) {
      // keep the code and the verify link; shorten a long course name if the line is too wide
      const verify = coach.unique_id ? `  ·  verify: thefitlab.in/verify?id=${coach.unique_id}` : '';
      const tail = clean(` (code ${certificate.code})${verify}`);
      let course = clean(certificate.course || 'Fit Lab course');
      while (doc.getTextWidth(`Certified: ${course}${tail}`) > W - 36 && course.length > 12) course = course.slice(0, -2).trimEnd() + '…';
      while (course.endsWith('……')) course = course.slice(0, -1);
      doc.text(`Certified: ${course.replace(/…+$/, '…')}${tail}`, 18, y + 11);
    }
    y += certificate ? 22 : 17;
    if (client) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...INK);
      doc.text(clean(`For: ${client}`), 14, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(...ASH);
      doc.text(clean(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })), W - 14, y, { align: 'right' });
      y += 5;
    }
    return { doc, W, y };
  }
  function footer(doc, note) {
    const n = doc.getNumberOfPages(), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(14, H - 14, W - 14, H - 14);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ASH);
      doc.text(clean(note || 'Made with The Fit Lab Coach Tools · thefitlab.in'), 14, H - 9.5);
      doc.text(`Page ${i} of ${n}`, W - 14, H - 9.5, { align: 'right' });
    }
  }
  function heading(ctx, text, sub) {
    const { doc } = ctx;
    if (ctx.y > 262) { doc.addPage(); ctx.y = 20; }
    ctx.y += 4;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12.5); doc.setTextColor(...INK); doc.text(clean(text), 14, ctx.y);
    if (sub) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...ASH); doc.text(clean(sub), ctx.W - 14, ctx.y, { align: 'right' }); }
    ctx.y += 3;
  }
  function table(ctx, head, body, opts = {}) {
    ctx.doc.autoTable({
      startY: ctx.y, head: head ? [head.map(clean)] : undefined, body: body.map((r) => r.map((c) => (typeof c === 'object' && c && 'content' in c) ? { ...c, content: clean(c.content) } : clean(c))),
      theme: 'grid', margin: { left: 14, right: 14, bottom: 20 },
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 1.8, textColor: INK, lineColor: LINE, lineWidth: 0.2 },
      headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      alternateRowStyles: { fillColor: [250, 251, 247] },
      ...opts,
    });
    ctx.y = ctx.doc.lastAutoTable.finalY + 4;
  }
  function paragraph(ctx, text, { size = 9, color = ASH, bold = false, indent = 0 } = {}) {
    const { doc } = ctx;
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(clean(text), ctx.W - 28 - indent);
    for (const ln of lines) { if (ctx.y > 276) { doc.addPage(); ctx.y = 20; } doc.text(ln, 14 + indent, ctx.y); ctx.y += size * 0.45; }
    ctx.y += 1.2;
  }
  function bullets(ctx, items, opts = {}) { for (const t of items) paragraph(ctx, '•  ' + t, { indent: 2, ...opts }); }
  function save(doc, name) { doc.save(clean(name).replace(/[^A-Za-z0-9 ._-]+/g, '').replace(/\s+/g, '-').slice(0, 80) + '.pdf'); }

  root.FLPdf = { ready, start, footer, heading, table, paragraph, bullets, save, clean, COLORS: { LIME, INK, ASH, LINE, SOFT } };
})(window);
