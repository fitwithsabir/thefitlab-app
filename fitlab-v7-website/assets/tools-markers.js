/* =====================================================================
   The Fit Lab — reading common blood-test markers for nutrition planning
   This flags results against published cut-offs so a coach knows what to
   plan around and when to refer. It never diagnoses: anything outside
   the normal range is "discuss with the doctor".
   ===================================================================== */
(function (root) {
  'use strict';
  // name patterns, the unit we work in, and conversions from other common units
  const DEFS = [
    { key: 'hba1c', label: 'HbA1c', unit: '%', re: /hba1c|glyc(o|a)ted|a1c/i },
    { key: 'fbs', label: 'Fasting glucose', unit: 'mg/dL', re: /fasting.*(glucose|sugar)|\bfbs\b|\bfpg\b|glucose.*fasting/i, conv: { 'mmol/l': 18.016 } },
    { key: 'ppbs', label: 'Glucose 2 h after a meal', unit: 'mg/dL', re: /post.?prandial|\bppbs\b|\bpp\b.*(glucose|sugar)|2.?h(ou)?r.*(glucose|sugar)/i, conv: { 'mmol/l': 18.016 } },
    { key: 'tc', label: 'Total cholesterol', unit: 'mg/dL', re: /total.*cholesterol|cholesterol.*total|^cholesterol$|serum cholesterol/i, conv: { 'mmol/l': 38.67 } },
    { key: 'ldl', label: 'LDL cholesterol', unit: 'mg/dL', re: /\bldl\b|low.density/i, conv: { 'mmol/l': 38.67 } },
    { key: 'hdl', label: 'HDL cholesterol', unit: 'mg/dL', re: /\bhdl\b|high.density/i, conv: { 'mmol/l': 38.67 } },
    { key: 'tg', label: 'Triglycerides', unit: 'mg/dL', re: /triglyceride|\btg\b/i, conv: { 'mmol/l': 88.57 } },
    { key: 'tsh', label: 'TSH', unit: 'mIU/L', re: /\btsh\b|thyroid.stimulating/i, conv: { 'uiu/ml': 1, 'µiu/ml': 1, 'miu/ml': 1 } },
    { key: 'hb', label: 'Haemoglobin', unit: 'g/dL', re: /ha?emoglobin|^hb$|^hgb$/i, conv: { 'g/l': 0.1 } },
    { key: 'ferritin', label: 'Ferritin', unit: 'ng/mL', re: /ferritin/i, conv: { 'µg/l': 1, 'ug/l': 1 } },
    { key: 'vitd', label: 'Vitamin D (25-OH)', unit: 'ng/mL', re: /vit(amin)?.?d|25.?oh|25.?hydroxy/i, conv: { 'nmol/l': 0.4006 } },
    { key: 'b12', label: 'Vitamin B12', unit: 'pg/mL', re: /b.?12|cobalamin/i, conv: { 'pmol/l': 1.355 } },
    { key: 'creat', label: 'Creatinine', unit: 'mg/dL', re: /creatinine/i, conv: { 'µmol/l': 0.01131, 'umol/l': 0.01131 } },
    { key: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²', re: /egfr|glomerular/i },
    { key: 'uric', label: 'Uric acid', unit: 'mg/dL', re: /uric/i, conv: { 'µmol/l': 0.01681, 'umol/l': 0.01681 } },
    { key: 'alt', label: 'ALT (SGPT)', unit: 'U/L', re: /\balt\b|sgpt|alanine/i },
    { key: 'ast', label: 'AST (SGOT)', unit: 'U/L', re: /\bast\b|sgot|aspartate/i },
    { key: 'na', label: 'Sodium', unit: 'mmol/L', re: /sodium|^na\+?$/i, conv: { 'meq/l': 1 } },
    { key: 'k', label: 'Potassium', unit: 'mmol/L', re: /potassium|^k\+?$/i, conv: { 'meq/l': 1 } },
  ];
  // the egfr pattern must win over creatinine ("eGFR (creatinine)"), and LDL/HDL over total cholesterol
  const ORDER = ['egfr', 'hba1c', 'ldl', 'hdl', 'tg', 'tc', 'fbs', 'ppbs', 'tsh', 'hb', 'ferritin', 'vitd', 'b12', 'creat', 'uric', 'alt', 'ast', 'na', 'k'];
  const BYKEY = Object.fromEntries(DEFS.map((d) => [d.key, d]));
  // look-alikes that are different tests (non-HDL, ratios, MCH/MCHC, urine values)
  const NOT = { hb: /corpuscular|\bmchc?\b|glyc|a1c/i, hdl: /non.?hdl|ratio/i, ldl: /ratio|vldl/i, tc: /ratio|non.?hdl/i, creat: /urine|clearance|ratio/i, fbs: /urine/i, k: /urine/i, na: /urine/i };
  const keyFor = (name) => { const n = String(name || ''); if (/ratio/i.test(n) && !/a1c/i.test(n)) return null; return ORDER.find((k) => BYKEY[k].re.test(n) && !(NOT[k] && NOT[k].test(n))) || null; };
  const normUnit = (u) => String(u || '').toLowerCase().replace(/\s+/g, '').replace('μ', 'µ').replace('mcg', 'µg');

  // one marker into our unit (null if the unit is unknown and the value looks off)
  function normalise(m) {
    const key = m.key || keyFor(m.name);
    const d = BYKEY[key]; if (!d) return null;
    let v = parseFloat(String(m.value).replace(/[^0-9.\-]/g, ''));
    if (!isFinite(v)) return null;
    const u = normUnit(m.unit), base = normUnit(d.unit);
    if (u && u !== base && d.conv) { const f = Object.entries(d.conv).find(([k]) => normUnit(k) === u); if (f) v *= f[1]; }
    return { key, label: d.label, value: Math.round(v * 100) / 100, unit: d.unit, ref_low: m.ref_low ?? null, ref_high: m.ref_high ?? null, raw: m };
  }

  // CKD-EPI 2021 (race-free) estimated GFR from creatinine (Inker 2021)
  function egfr(creat, age, sex) {
    if (!(creat > 0) || !(age > 0)) return null;
    const f = sex === 'female', k = f ? 0.7 : 0.9, a = f ? -0.241 : -0.302;
    return Math.round(142 * Math.pow(Math.min(creat / k, 1), a) * Math.pow(Math.max(creat / k, 1), -1.2) * Math.pow(0.9938, age) * (f ? 1.012 : 1));
  }

  const REFS = {
    ada: 'American Diabetes Association. Standards of Care in Diabetes—2024: 2. Diagnosis and classification of diabetes. Diabetes Care. 2024;47(Suppl 1):S20-S42.',
    atp3: 'National Cholesterol Education Program (NCEP) Expert Panel. Third Report on Detection, Evaluation, and Treatment of High Blood Cholesterol in Adults (ATP III). Circulation. 2002;106:3143-3421.',
    who_hb: 'World Health Organization. Haemoglobin concentrations for the diagnosis of anaemia and assessment of severity. WHO/NMH/NHD/MNM/11.1. Geneva: WHO; 2011.',
    who_ferritin: 'World Health Organization. WHO guideline on use of ferritin concentrations to assess iron status in individuals and populations. Geneva: WHO; 2020.',
    iom_vitd: 'Institute of Medicine. Dietary Reference Intakes for Calcium and Vitamin D. Washington DC: National Academies Press; 2011.',
    ods_b12: 'NIH Office of Dietary Supplements. Vitamin B12: fact sheet for health professionals (updated 2024).',
    kdigo: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.',
    ckdepi: 'Inker LA, et al. New creatinine- and cystatin C–based equations to estimate GFR without race. N Engl J Med. 2021;385:1737-1749.',
    acr_gout: 'FitzGerald JD, et al. 2020 American College of Rheumatology guideline for the management of gout. Arthritis Care Res. 2020;72:744-760.',
    aasld: 'Rinella ME, et al. AASLD Practice Guidance on the clinical assessment and management of nonalcoholic fatty liver disease. Hepatology. 2023;77:1797-1835.',
    icmr: 'ICMR-National Institute of Nutrition. Dietary Guidelines for Indians; 2024.',
  };

  // what each result means for planning — never a diagnosis
  function interpret(list, { sex = 'female', age = 30, pregnant = false } = {}) {
    const ms = (list || []).map(normalise).filter(Boolean);
    const get = (k) => ms.find((m) => m.key === k);
    const out = [], conditions = new Set(), focus = new Set();
    const add = (m, status, text, { refer = false, ref, tags = [] } = {}) => { out.push({ key: m.key, label: m.label, value: m.value, unit: m.unit, status, text, refer, ref }); tags.forEach((t) => focus.add(t)); };
    const outside = (m) => (m.ref_low != null && m.value < +m.ref_low) || (m.ref_high != null && m.value > +m.ref_high);
    let m;
    if ((m = get('hba1c'))) {
      if (m.value >= 6.5) { add(m, 'high', 'In the diabetes range (6.5% or more). Plan with the doctor; steady carbs at every meal.', { refer: true, ref: 'ada', tags: ['lowGI'] }); conditions.add('diabetes'); }
      else if (m.value >= 5.7) { add(m, 'borderline', 'In the prediabetes range (5.7–6.4%). Weight loss of 5–7%, whole grains and fewer sugary foods help.', { ref: 'ada', tags: ['lowGI'] }); conditions.add('prediabetes'); }
      else add(m, 'normal', 'Normal (under 5.7%).', { ref: 'ada' });
    }
    if ((m = get('fbs'))) {
      if (m.value >= 126) { add(m, 'high', 'In the diabetes range (126 mg/dL or more fasting). Doctor review needed.', { refer: true, ref: 'ada', tags: ['lowGI'] }); conditions.add('diabetes'); }
      else if (m.value >= 100) { add(m, 'borderline', 'Raised fasting sugar (100–125 mg/dL).', { ref: 'ada', tags: ['lowGI'] }); conditions.add('prediabetes'); }
      else if (m.value < 70) add(m, 'low', 'Low fasting sugar — ask the doctor.', { refer: true, ref: 'ada' });
      else add(m, 'normal', 'Normal (70–99 mg/dL).', { ref: 'ada' });
    }
    if ((m = get('ppbs'))) {
      if (m.value >= 200) { add(m, 'high', 'In the diabetes range after a meal (200 mg/dL or more).', { refer: true, ref: 'ada', tags: ['lowGI'] }); conditions.add('diabetes'); }
      else if (m.value >= 140) { add(m, 'borderline', 'Raised after a meal (140–199 mg/dL).', { ref: 'ada', tags: ['lowGI'] }); conditions.add('prediabetes'); }
      else add(m, 'normal', 'Normal (under 140 mg/dL).', { ref: 'ada' });
    }
    if ((m = get('ldl'))) {
      if (m.value >= 190) { add(m, 'high', 'Very high LDL (190 mg/dL or more) — needs the doctor.', { refer: true, ref: 'atp3', tags: ['lipids'] }); conditions.add('cholesterol'); }
      else if (m.value >= 130) { add(m, m.value >= 160 ? 'high' : 'borderline', `${m.value >= 160 ? 'High' : 'Borderline-high'} LDL. Less saturated fat (ghee, butter, fried and bakery foods), more fibre — oats, dal, vegetables.`, { ref: 'atp3', tags: ['lipids'] }); conditions.add('cholesterol'); }
      else add(m, 'normal', m.value < 100 ? 'Optimal (under 100 mg/dL).' : 'Near optimal (100–129 mg/dL).', { ref: 'atp3' });
    }
    if ((m = get('hdl'))) {
      const low = sex === 'male' ? 40 : 50;
      if (m.value < low) add(m, 'low', `Low HDL (under ${low} mg/dL). Regular exercise, weight loss and swapping refined carbs for whole foods help.`, { ref: 'atp3', tags: ['lipids'] });
      else add(m, 'normal', 'Normal.', { ref: 'atp3' });
    }
    if ((m = get('tg'))) {
      if (m.value >= 500) { add(m, 'high', 'Very high triglycerides (500 mg/dL or more) — needs the doctor soon.', { refer: true, ref: 'atp3', tags: ['tg'] }); conditions.add('cholesterol'); }
      else if (m.value >= 150) { add(m, m.value >= 200 ? 'high' : 'borderline', 'Raised triglycerides. Cut sugar, sweets, juices, refined flour and alcohol; weight loss helps most.', { ref: 'atp3', tags: ['tg'] }); conditions.add('cholesterol'); }
      else add(m, 'normal', 'Normal (under 150 mg/dL).', { ref: 'atp3' });
    }
    if ((m = get('tc')) && !get('ldl')) {
      if (m.value >= 240) { add(m, 'high', 'High total cholesterol (240 mg/dL or more).', { ref: 'atp3', tags: ['lipids'] }); conditions.add('cholesterol'); }
      else if (m.value >= 200) add(m, 'borderline', 'Borderline-high total cholesterol (200–239 mg/dL).', { ref: 'atp3', tags: ['lipids'] });
      else add(m, 'normal', 'Desirable (under 200 mg/dL).', { ref: 'atp3' });
    }
    if ((m = get('tsh'))) {
      const lo = m.ref_low != null ? +m.ref_low : 0.4, hi = m.ref_high != null ? +m.ref_high : 4.5;
      if (m.value < lo || m.value > hi) { add(m, m.value > hi ? 'high' : 'low', 'Outside the lab\'s range — the doctor should review the thyroid before big diet changes.', { refer: true, tags: ['thyroid'] }); conditions.add('thyroid'); }
      else add(m, 'normal', 'Within the lab\'s range.');
    }
    if ((m = get('hb'))) {
      const low = pregnant ? 11 : sex === 'male' ? 13 : 12;
      if (m.value < low) add(m, 'low', `Below ${low} g/dL — possible anaemia. Doctor review; meanwhile iron-rich foods (dal, chana, rajma, greens, eggs or meat) with vitamin C (lemon, guava, orange).`, { refer: true, ref: 'who_hb', tags: ['iron'] });
      else add(m, 'normal', 'Normal.', { ref: 'who_hb' });
    }
    if ((m = get('ferritin'))) {
      if (m.value < 15) add(m, 'low', 'Low iron stores (under 15 ng/mL). Doctor review; iron-rich foods with vitamin C, tea and coffee away from meals.', { refer: true, ref: 'who_ferritin', tags: ['iron'] });
      else if (m.value < 30) add(m, 'borderline', 'Iron stores on the low side. Plan iron-rich foods with vitamin C.', { ref: 'who_ferritin', tags: ['iron'] });
      else add(m, 'normal', 'Normal.', { ref: 'who_ferritin' });
    }
    if ((m = get('vitd'))) {
      if (m.value < 12) add(m, 'low', 'Deficient (under 12 ng/mL). The doctor may prescribe a supplement.', { refer: true, ref: 'iom_vitd', tags: ['vitd'] });
      else if (m.value < 20) add(m, 'borderline', 'Below the 20 ng/mL most people need. Sunlight, fortified milk, eggs and fish help; ask the doctor about a supplement.', { ref: 'iom_vitd', tags: ['vitd'] });
      else add(m, 'normal', 'Adequate (20 ng/mL or more).', { ref: 'iom_vitd' });
    }
    if ((m = get('b12'))) {
      if (m.value < 200) add(m, 'low', 'Low B12 (under 200 pg/mL). Doctor review — a supplement is often needed, especially for vegetarians.', { refer: true, ref: 'ods_b12', tags: ['b12'] });
      else if (m.value < 300) add(m, 'borderline', 'Borderline B12. Milk, curd, paneer, eggs or fish daily; ask the doctor.', { ref: 'ods_b12', tags: ['b12'] });
      else add(m, 'normal', 'Normal.', { ref: 'ods_b12' });
    }
    let gfr = get('egfr') ? get('egfr').value : null;
    if (gfr == null && get('creat')) gfr = egfr(get('creat').value, age, sex);
    if (gfr != null) {
      const g = get('egfr') || { key: 'egfr', label: 'eGFR (from creatinine, CKD-EPI 2021)', unit: 'mL/min/1.73m²' };
      g.value = gfr;
      if (gfr < 60) { add(g, 'low', 'Kidney function is reduced (eGFR under 60). Protein about 0.8 g/kg and a renal dietitian\'s advice on potassium and phosphorus.', { refer: true, ref: 'kdigo', tags: ['kidney'] }); conditions.add('kidney'); }
      else if (gfr < 90) add(g, 'borderline', 'Mildly reduced for age — usually fine; the doctor can confirm.', { ref: 'kdigo' });
      else add(g, 'normal', 'Normal.', { ref: 'kdigo' });
    }
    if ((m = get('uric'))) {
      const hi = sex === 'male' ? 7 : 6;
      if (m.value > hi) add(m, 'high', `Raised uric acid (over ${hi} mg/dL). Limit alcohol, sugary drinks, organ meats and shellfish; drink plenty of water.`, { ref: 'acr_gout', tags: ['uric'] });
      else add(m, 'normal', 'Normal.');
    }
    for (const k of ['alt', 'ast']) {
      if ((m = get(k))) {
        const hi = m.ref_high != null ? +m.ref_high : 40;
        if (m.value > hi) { add(m, 'high', 'Raised liver enzyme — common with fatty liver. Doctor review; weight loss of 7–10%, no alcohol or sugary drinks.', { refer: true, ref: 'aasld', tags: ['liver'] }); conditions.add('liver'); }
        else add(m, 'normal', 'Within range.');
      }
    }
    for (const k of ['na', 'k']) {
      if ((m = get(k))) {
        const lo = k === 'na' ? 135 : 3.5, hi = k === 'na' ? 145 : 5.0;
        if (m.value < lo || m.value > hi || outside(m)) add(m, m.value > hi ? 'high' : 'low', 'Outside the normal range — this is for the doctor, not a diet change.', { refer: true, tags: k === 'k' && m.value > hi ? ['kidney'] : [] });
        else add(m, 'normal', 'Within range.');
      }
    }
    return { findings: out, conditions: [...conditions], focus: [...focus], refer: out.some((f) => f.refer) };
  }

  // what each focus means for food choices (used by Coach AI and printed on the plan)
  const FOCUS = {
    lowGI: 'Whole grains and millets over white rice and maida; dal, protein and vegetables at every meal; no sugary drinks, sweets or juice.',
    lipids: 'Cook in measured oil rather than ghee or butter; add oats, dal, vegetables, nuts and seeds; avoid fried and bakery foods.',
    tg: 'Cut sugar, sweets, juice, refined flour and alcohol; choose whole grains and fruit in place of sweets.',
    iron: 'Iron-rich foods (dal, chana, rajma, greens, eggs, meat, fish) with a vitamin C food (lemon, guava, orange, tomato); tea and coffee an hour away from meals.',
    b12: 'A B12 source every day — milk, curd, paneer, eggs or fish; vegans need fortified foods or a supplement the doctor advises.',
    vitd: 'Fortified milk, eggs and fish; some midday sunlight; supplement only as the doctor advises.',
    kidney: 'Protein about 0.8 g/kg; salt under 5 g a day; potassium and phosphorus only as the renal dietitian advises.',
    uric: 'Limit alcohol, sugary drinks, organ meats, red meat and shellfish; plenty of water.',
    liver: 'Steady weight loss, no alcohol or sugary drinks, fewer refined carbs and fried foods.',
    thyroid: 'Thyroid tablets on an empty stomach as prescribed, 30–60 minutes before tea, coffee or breakfast.',
  };

  const api = { DEFS, keyFor, normalise, egfr, interpret, FOCUS, REFS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FLMarkers = api;
})(typeof window !== 'undefined' ? window : globalThis);
