/* =====================================================================
   The Fit Lab — Health tools: clinical calculators and assessments
   For physiotherapists, dietitians, doctors and yoga / wellness therapists.
   Every cut-off and formula is published and referenced (REFS at the bottom).
   Inputs are metric: kg, cm, years. These are aids to a professional's
   judgement — never a diagnosis on their own.
   Works in the browser (window.FLHealth) and in Node (module.exports) for tests.
   ===================================================================== */
(function (root) {
  'use strict';
  const round = (n, d = 0) => { const f = 10 ** d; return Math.round((Number(n) + Number.EPSILON) * f) / f; };
  const isMale = (sex) => String(sex || '').toLowerCase().startsWith('m');
  const ok = (...v) => v.every((x) => typeof x === 'number' && isFinite(x));

  // ============================================================ PHYSIOTHERAPY
  // 6-minute walk distance — Enright & Sullivan 1998 (healthy adults 40–80 years)
  function sixMinuteWalk(sex, age, heightCm, weightKg, walkedM) {
    if (!ok(age, heightCm, weightKg)) return null;
    const m = isMale(sex);
    const predicted = m ? 7.57 * heightCm - 5.02 * age - 1.76 * weightKg - 309 : 2.11 * heightCm - 2.29 * weightKg - 5.78 * age + 667;
    const lln = predicted - (m ? 153 : 139);
    const r = { predicted, lln, inRange: age >= 40 && age <= 80 };
    if (ok(walkedM) && walkedM > 0) { r.walked = walkedM; r.pct = walkedM / predicted * 100; r.belowLLN = walkedM < lln; }
    return r;
  }

  // Timed Up and Go — CDC STEADI: 12 seconds or more = higher fall risk
  function timedUpGo(seconds) {
    if (!ok(seconds) || seconds <= 0) return null;
    return { seconds, risk: seconds >= 12, cutoff: 12 };
  }

  // 30-second chair stand — CDC STEADI below-average scores (Rikli & Jones norms), 60–94 years
  const CHAIR_BANDS = [[60, 64, 14, 12], [65, 69, 12, 11], [70, 74, 12, 10], [75, 79, 11, 10], [80, 84, 10, 9], [85, 89, 8, 8], [90, 94, 7, 4]];
  function chairStand(sex, age, reps) {
    if (!ok(age)) return null;
    const b = CHAIR_BANDS.find(([a, z]) => age >= a && age <= z);
    if (!b) return { inRange: false };
    const cutoff = isMale(sex) ? b[2] : b[3];
    const r = { inRange: true, cutoff, band: `${b[0]}–${b[1]}` };
    if (ok(reps) && reps >= 0) { r.reps = reps; r.below = reps < cutoff; }
    return r;
  }

  // Sarcopenia — Asian Working Group for Sarcopenia (AWGS) 2019
  function sarcopenia(sex, { grip, gait, chair5, calf, asmi, asmiMethod = 'dxa' } = {}) {
    const m = isMale(sex);
    const cut = { grip: m ? 28 : 18, gait: 1.0, chair5: 12, calf: m ? 34 : 33, asmi: asmiMethod === 'bia' ? (m ? 7.0 : 5.7) : (m ? 7.0 : 5.4) };
    const lowStrength = ok(grip) && grip > 0 ? grip < cut.grip : null;
    const perf = [];
    if (ok(gait) && gait > 0) perf.push(gait < cut.gait);
    if (ok(chair5) && chair5 > 0) perf.push(chair5 >= cut.chair5);
    const lowPerformance = perf.length ? perf.some(Boolean) : null;
    const lowCalf = ok(calf) && calf > 0 ? calf < cut.calf : null;
    const lowMass = ok(asmi) && asmi > 0 ? asmi < cut.asmi : null;
    let verdict = 'none', label = 'Enter at least grip strength or a performance test';
    if (lowStrength != null || lowPerformance != null) {
      if (lowMass === true && lowStrength && lowPerformance) { verdict = 'severe'; label = 'Severe sarcopenia'; }
      else if (lowMass === true && (lowStrength || lowPerformance)) { verdict = 'sarcopenia'; label = 'Sarcopenia'; }
      else if (lowStrength || lowPerformance) { verdict = 'possible'; label = lowMass === false ? 'Low strength or function, muscle mass normal' : 'Possible sarcopenia'; }
      else { verdict = 'normal'; label = 'Strength and function in the normal range'; }
    }
    return { cut, lowStrength, lowPerformance, lowCalf, lowMass, verdict, label };
  }

  // Normal range of motion — American Academy of Orthopaedic Surgeons
  const ROM = [
    ['Cervical spine', [['cx_flex', 'Flexion', 45], ['cx_ext', 'Extension', 45], ['cx_lat', 'Side bending', 45], ['cx_rot', 'Rotation', 60]]],
    ['Shoulder', [['sh_flex', 'Flexion', 180], ['sh_ext', 'Extension', 60], ['sh_abd', 'Abduction', 180], ['sh_ir', 'Internal rotation', 70], ['sh_er', 'External rotation', 90]]],
    ['Elbow and forearm', [['el_flex', 'Elbow flexion', 150], ['fa_pro', 'Pronation', 80], ['fa_sup', 'Supination', 80]]],
    ['Wrist', [['wr_flex', 'Flexion', 80], ['wr_ext', 'Extension', 70], ['wr_rad', 'Radial deviation', 20], ['wr_uln', 'Ulnar deviation', 30]]],
    ['Hip', [['hp_flex', 'Flexion', 120], ['hp_ext', 'Extension', 30], ['hp_abd', 'Abduction', 45], ['hp_add', 'Adduction', 30], ['hp_ir', 'Internal rotation', 45], ['hp_er', 'External rotation', 45]]],
    ['Knee', [['kn_flex', 'Flexion', 135]]],
    ['Ankle and foot', [['an_df', 'Dorsiflexion', 20], ['an_pf', 'Plantarflexion', 50], ['ft_inv', 'Inversion', 35], ['ft_ev', 'Eversion', 15]]],
  ];
  const romItem = (key) => { for (const [joint, list] of ROM) { const f = list.find((x) => x[0] === key); if (f) return { key, joint, movement: f[1], normal: f[2] }; } return null; };
  // a self-contained name for a movement, e.g. "Knee flexion", "Forearm pronation"
  function romLabel(key) {
    const it = romItem(key); if (!it) return '';
    const m = it.movement, lm = m.toLowerCase();
    if (it.joint === 'Cervical spine') return 'Neck ' + lm;
    if (it.joint === 'Elbow and forearm') return m.startsWith('Elbow') ? m : 'Forearm ' + lm;
    if (it.joint === 'Ankle and foot') return (key.startsWith('ft_') ? 'Foot ' : 'Ankle ') + lm;
    return it.joint + ' ' + lm;
  }
  function romCheck(key, measured, otherSide) {
    const it = romItem(key);
    if (!it) return null;
    const r = { ...it };
    if (ok(measured) && measured >= 0) { r.measured = measured; r.pctNormal = measured / it.normal * 100; r.deficit = Math.max(0, it.normal - measured); }
    if (ok(measured, otherSide) && otherSide > 0) r.symmetry = measured / otherSide * 100;
    return r;
  }

  // Pain (0–10 numeric rating scale) change — Farrar 2001, IMMPACT (Dworkin 2008)
  function painChange(before, now) {
    if (!ok(before, now) || before < 0 || before > 10 || now < 0 || now > 10) return null;
    const diff = before - now, pct = before > 0 ? diff / before * 100 : 0;
    let level = 'none';
    if (diff > 0 && pct >= 50) level = 'substantial';
    else if (diff >= 2 || (diff > 0 && pct >= 30)) level = 'important';
    else if (diff > 0) level = 'small';
    else if (diff < 0) level = 'worse';
    return { before, now, diff, pct, level };
  }

  // Low back pain red flags — International Framework (Finucane 2020), NICE NG59
  const RED_FLAGS = [
    { key: 'ces_bladder', tier: 'emergency', text: 'New trouble passing urine, a weak stream, or leaking' },
    { key: 'ces_bowel', tier: 'emergency', text: 'New loss of bowel control' },
    { key: 'ces_saddle', tier: 'emergency', text: 'Numbness around the back passage or genitals (saddle area)' },
    { key: 'ces_bilateral', tier: 'emergency', text: 'Pain, numbness or weakness in both legs' },
    { key: 'ces_sexual', tier: 'emergency', text: 'New sexual problems, such as loss of sensation' },
    { key: 'neuro_prog', tier: 'emergency', text: 'Leg weakness or foot drop that is getting worse' },
    { key: 'cancer', tier: 'urgent', text: 'Past or current cancer' },
    { key: 'weight', tier: 'urgent', text: 'Weight loss without trying' },
    { key: 'infection', tier: 'urgent', text: 'Fever, feeling unwell, recent infection, injecting drugs or a weak immune system (including steroids)' },
    { key: 'trauma', tier: 'urgent', text: 'A fall or accident — or a minor one with osteoporosis or long-term steroid use' },
    { key: 'night', tier: 'urgent', text: 'Constant pain that rest, position and night-time don\'t ease' },
    { key: 'thoracic', tier: 'urgent', text: 'Pain mainly in the upper back (thoracic spine)' },
    { key: 'age', tier: 'urgent', text: 'First episode of back pain under 20 or over 55' },
    { key: 'stiff', tier: 'review', text: 'Morning stiffness over 30 minutes that eases with movement (under 45 years)' },
  ];
  function redFlags(checked) {
    const on = RED_FLAGS.filter((f) => checked && checked[f.key]);
    const tier = on.some((f) => f.tier === 'emergency') ? 'emergency' : on.some((f) => f.tier === 'urgent') ? 'urgent' : on.length ? 'review' : 'clear';
    return { on, tier, count: on.length };
  }

  // ============================================================ NUTRITION & DIETETICS
  // Protein in chronic kidney disease — KDOQI 2020 (and KDIGO 2024)
  const CKD_PROTEIN = {
    g12: { label: 'CKD stage 1–2', lo: 0.8, hi: 1.3, note: 'Normal needs are fine, but avoid high-protein diets — more than 1.3 g/kg a day — when the kidneys are at risk of getting worse.', ref: 'kdigo2024' },
    g35: { label: 'CKD stage 3–5, not on dialysis', lo: 0.55, hi: 0.6, note: 'Only under a renal dietitian. With keto-acid analogues: 0.28–0.43 g/kg. Without close supervision, KDIGO 2024 suggests 0.8 g/kg.', ref: 'kdoqi2020' },
    g35dm: { label: 'CKD stage 3–5 with diabetes, not on dialysis', lo: 0.6, hi: 0.8, note: 'Keep blood sugar in control while protein is reduced.', ref: 'kdoqi2020' },
    dialysis: { label: 'On haemodialysis or peritoneal dialysis', lo: 1.0, hi: 1.2, note: 'Dialysis removes protein, so needs go up. Recheck if the patient is unwell or losing weight.', ref: 'kdoqi2020' },
  };
  function ckdProtein(stage, weightKg) {
    const s = CKD_PROTEIN[stage];
    if (!s || !ok(weightKg) || weightKg <= 0) return null;
    return { ...s, stage, gLo: s.lo * weightKg, gHi: s.hi * weightKg };
  }

  // Maintenance fluid — Holliday–Segar (100 / 50 / 20 mL per kg a day)
  function hollidaySegar(weightKg) {
    if (!ok(weightKg) || weightKg <= 0) return null;
    const w = weightKg;
    const day = w <= 10 ? 100 * w : w <= 20 ? 1000 + 50 * (w - 10) : 1500 + 20 * (w - 20);
    return { mlDay: day, mlHour: day / 24 };
  }

  // Pregnancy weight gain — Institute of Medicine 2009
  const IOM_GAIN = {
    under: { label: 'Underweight', bmi: 'below 18.5', total: [12.5, 18], rate: [0.44, 0.58], twins: null },
    normal: { label: 'Normal weight', bmi: '18.5–24.9', total: [11.5, 16], rate: [0.35, 0.5], twins: [17, 25] },
    over: { label: 'Overweight', bmi: '25–29.9', total: [7, 11.5], rate: [0.23, 0.33], twins: [14, 23] },
    obese: { label: 'Obese', bmi: '30 or more', total: [5, 9], rate: [0.17, 0.27], twins: [11, 19] },
  };
  function pregnancyGain(preWeightKg, heightCm, week, nowWeightKg, twins = false) {
    if (!ok(preWeightKg, heightCm) || preWeightKg <= 0 || heightCm <= 0) return null;
    const bmi = preWeightKg / ((heightCm / 100) ** 2);
    const key = bmi < 18.5 ? 'under' : bmi < 25 ? 'normal' : bmi < 30 ? 'over' : 'obese';
    const g = IOM_GAIN[key];
    const total = twins ? g.twins : g.total;
    const r = { bmi, key, label: g.label, total, rate: g.rate, twins: !!twins };
    if (ok(week) && week >= 0 && week <= 42 && !twins) {
      const first = Math.min(week, 13) / 13;
      let lo = 0.5 * first, hi = 2 * first;
      if (week > 13) { lo += (week - 13) * g.rate[0]; hi += (week - 13) * g.rate[1]; }
      r.week = week; r.expected = [Math.min(lo, total[1]), Math.min(hi, total[1])];
      if (ok(nowWeightKg) && nowWeightKg > 0) {
        r.gained = nowWeightKg - preWeightKg;
        r.status = r.gained < r.expected[0] - 0.05 ? 'below' : r.gained > r.expected[1] + 0.05 ? 'above' : 'within';
      }
    } else if (ok(nowWeightKg) && nowWeightKg > 0) r.gained = nowWeightKg - preWeightKg;
    return r;
  }

  // Due date — Naegele's rule (LMP + 280 days, adjusted for cycle length); ACOG 2017
  function dueDate(lmpISO, cycleDays = 28, todayISO) {
    const lmp = lmpISO ? new Date(lmpISO + 'T00:00:00') : null;
    if (!lmp || isNaN(lmp)) return null;
    const cyc = ok(cycleDays) && cycleDays >= 20 && cycleDays <= 45 ? cycleDays : 28;
    const edd = new Date(lmp); edd.setDate(edd.getDate() + 280 + (cyc - 28));
    const today = todayISO ? new Date(todayISO + 'T00:00:00') : new Date(new Date().toDateString());
    const days = Math.round((today - lmp) / 86400000) - (cyc - 28);
    const r = { edd, cycle: cyc };
    if (days >= 0 && days <= 44 * 7) { r.gaWeeks = Math.floor(days / 7); r.gaDays = days % 7; r.trimester = days < 14 * 7 ? 1 : days < 28 * 7 ? 2 : 3; }
    return r;
  }

  // Malnutrition Universal Screening Tool ('MUST') scoring — BAPEN
  function mustScore(bmi, weightLossPct, acuteNoIntake) {
    if (!ok(bmi) || bmi <= 0) return null;
    const sBmi = bmi > 20 ? 0 : bmi >= 18.5 ? 1 : 2;
    const wl = ok(weightLossPct) ? Math.max(0, weightLossPct) : 0;
    const sWl = wl > 10 ? 2 : wl >= 5 ? 1 : 0;
    const sAcute = acuteNoIntake ? 2 : 0;
    const total = sBmi + sWl + sAcute;
    const risk = total === 0 ? 'low' : total === 1 ? 'medium' : 'high';
    return { sBmi, sWl, sAcute, total, risk, weightLossPct: wl };
  }

  // ============================================================ MEDICINE
  // eGFR — CKD-EPI 2021 (no race term); KDIGO 2012 categories
  function egfr2021(sex, age, scrMgDl) {
    if (!ok(age, scrMgDl) || scrMgDl <= 0 || age < 18) return null;
    const f = !isMale(sex), k = f ? 0.7 : 0.9, a = f ? -0.241 : -0.302;
    const x = scrMgDl / k;
    return 142 * Math.min(x, 1) ** a * Math.max(x, 1) ** -1.2 * 0.9938 ** age * (f ? 1.012 : 1);
  }
  function gfrStage(e) {
    if (!ok(e)) return null;
    if (e >= 90) return { g: 'G1', label: 'Normal or high', risk: 0 };
    if (e >= 60) return { g: 'G2', label: 'Mildly decreased', risk: 0 };
    if (e >= 45) return { g: 'G3a', label: 'Mildly to moderately decreased', risk: 1 };
    if (e >= 30) return { g: 'G3b', label: 'Moderately to severely decreased', risk: 2 };
    if (e >= 15) return { g: 'G4', label: 'Severely decreased', risk: 3 };
    return { g: 'G5', label: 'Kidney failure', risk: 3 };
  }
  function albuminuria(acrMgG) {
    if (!ok(acrMgG) || acrMgG < 0) return null;
    if (acrMgG < 30) return { a: 'A1', label: 'Normal to mildly increased' };
    if (acrMgG <= 300) return { a: 'A2', label: 'Moderately increased' };
    return { a: 'A3', label: 'Severely increased' };
  }
  // Creatinine clearance — Cockcroft–Gault (still used for many drug doses)
  function cockcroftGault(sex, age, weightKg, scrMgDl) {
    if (!ok(age, weightKg, scrMgDl) || scrMgDl <= 0) return null;
    return (140 - age) * weightKg / (72 * scrMgDl) * (isMale(sex) ? 1 : 0.85);
  }
  const UMOL_PER_MGDL = 88.4;

  // Dosing weights — ideal (Devine), adjusted (0.4 factor), lean (Janmahasatian)
  function dosingWeights(sex, weightKg, heightCm) {
    if (!ok(weightKg, heightCm) || weightKg <= 0 || heightCm <= 0) return null;
    const m = isMale(sex), inches = heightCm / 2.54;
    const ibw = (m ? 50 : 45.5) + 2.3 * (inches - 60);
    const bmi = weightKg / ((heightCm / 100) ** 2);
    const abw = ibw + 0.4 * (weightKg - ibw);
    const lbw = m ? 9270 * weightKg / (6680 + 216 * bmi) : 9270 * weightKg / (8780 + 244 * bmi);
    return { ibw, abw, lbw, bmi, pctIbw: weightKg / ibw * 100, useAdjusted: weightKg > 1.2 * ibw, short: inches < 60 };
  }

  // Indian Diabetes Risk Score — Mohan et al. 2005 (MDRF)
  function idrs(sex, age, waistCm, activity, family) {
    if (!ok(age, waistCm)) return null;
    const m = isMale(sex);
    const sAge = age < 35 ? 0 : age < 50 ? 20 : 30;
    const sWaist = m ? (waistCm < 90 ? 0 : waistCm < 100 ? 10 : 20) : (waistCm < 80 ? 0 : waistCm < 90 ? 10 : 20);
    const sAct = { both: 0, one: 20, none: 30 }[activity] ?? 30;
    const sFam = { none: 0, one: 10, both: 20 }[family] ?? 0;
    const total = sAge + sWaist + sAct + sFam;
    const risk = total >= 60 ? 'high' : total >= 30 ? 'moderate' : 'low';
    return { sAge, sWaist, sAct, sFam, total, risk };
  }

  // Blood pressure — ISH 2020 and ACC/AHA 2017
  function bpCategory(sys, dia) {
    if (!ok(sys, dia) || sys <= 0 || dia <= 0) return null;
    const ish = sys >= 160 || dia >= 100 ? { k: 'g2', label: 'Grade 2 hypertension' }
      : sys >= 140 || dia >= 90 ? { k: 'g1', label: 'Grade 1 hypertension' }
      : sys >= 130 || dia >= 85 ? { k: 'hn', label: 'High-normal' } : { k: 'n', label: 'Normal' };
    const aha = sys > 180 || dia > 120 ? { k: 'crisis', label: 'Severe — needs urgent assessment' }
      : sys >= 140 || dia >= 90 ? { k: 's2', label: 'Stage 2 hypertension' }
      : sys >= 130 || dia >= 80 ? { k: 's1', label: 'Stage 1 hypertension' }
      : sys >= 120 ? { k: 'el', label: 'Elevated' } : { k: 'n', label: 'Normal' };
    return { sys, dia, ish, aha, severe: sys > 180 || dia > 120, noHardExercise: sys > 200 || dia > 110, isolated: sys >= 140 && dia < 90 };
  }

  // HbA1c — estimated average glucose (ADAG, Nathan 2008), IFCC units, ADA categories
  function hba1c(pct) {
    if (!ok(pct) || pct < 3 || pct > 20) return null;
    const eag = 28.7 * pct - 46.7;
    const cat = pct >= 6.5 ? { k: 'dm', label: 'In the diabetes range' } : pct >= 5.7 ? { k: 'pre', label: 'Prediabetes range' } : { k: 'n', label: 'Normal' };
    return { pct, eagMgDl: eag, eagMmol: eag / 18.016, ifcc: (pct - 2.15) * 10.929, cat };
  }
  function fastingGlucose(mgdl) {
    if (!ok(mgdl) || mgdl <= 0) return null;
    return mgdl >= 126 ? { k: 'dm', label: 'In the diabetes range' } : mgdl >= 100 ? { k: 'pre', label: 'Prediabetes range (impaired fasting glucose)' } : mgdl < 70 ? { k: 'low', label: 'Low' } : { k: 'n', label: 'Normal' };
  }

  // Exercise pre-participation screening — ACSM (Riebe et al. 2015)
  function acsmScreen(active, disease, symptoms, intensity = 'moderate') {
    if (symptoms) {
      return active
        ? { clearance: 'stop', title: 'Stop exercising and get medical clearance', then: 'Return to exercise only after a doctor has assessed the symptoms, then build up gradually.' }
        : { clearance: 'yes', title: 'Medical clearance recommended before starting', then: 'After clearance: start at light to moderate intensity and build up gradually.' };
    }
    if (disease) {
      if (!active) return { clearance: 'yes', title: 'Medical clearance recommended before starting', then: 'After clearance: start at light to moderate intensity and build up gradually.' };
      return intensity === 'vigorous'
        ? { clearance: 'yes', title: 'Medical clearance recommended before vigorous exercise', then: 'Moderate intensity can carry on without clearance while the patient stays free of symptoms.' }
        : { clearance: 'no', title: 'No clearance needed for moderate exercise', then: 'Get medical clearance before moving up to vigorous intensity.' };
    }
    return active
      ? { clearance: 'no', title: 'No medical clearance needed', then: 'Carry on with moderate or vigorous exercise and progress gradually.' }
      : { clearance: 'no', title: 'No medical clearance needed', then: 'Start at light to moderate intensity and build up gradually to vigorous, as advised by ACSM.' };
  }

  // ============================================================ YOGA & WELLNESS
  // Practice cautions by condition. Each note is a caution for the therapist to apply with judgement.
  const CAUTIONS = [
    { key: 'htn', label: 'High blood pressure', refs: ['pescatello'], notes: [
      ['avoid', 'Breath holding (kumbhaka) and straining (Valsalva) — keep the breath flowing in every hold'],
      ['avoid', 'Fast, forceful breathing such as kapalabhati and bhastrika while blood pressure is uncontrolled'],
      ['modify', 'Keep the head above the heart; use supported, short versions of inversions and forward folds'],
      ['refer', 'Resting blood pressure 160/100 or more, or unknown: get medical advice before starting'],
    ] },
    { key: 'glaucoma', label: 'Glaucoma or retinal problems', refs: ['jasien'], notes: [
      ['avoid', 'Head-down positions — headstand, shoulder stand, plough, and long holds of downward dog or standing forward bend raise eye pressure'],
      ['modify', 'Use upright, seated and supine alternatives; come up slowly'],
    ] },
    { key: 'preg', label: 'Pregnancy', refs: ['acog2020'], notes: [
      ['avoid', 'Hot yoga and practice in very hot rooms'],
      ['avoid', 'Lying flat on the back for long after the first trimester — use a bolster incline or side-lying'],
      ['avoid', 'Lying on the belly, deep closed twists, strong abdominal work and breath retention'],
      ['modify', 'Poses with a fall risk — use a wall or chair for balance; avoid going to the end of the range (joints are looser)'],
      ['refer', 'Stop and seek care for bleeding, fluid leak, regular painful contractions, chest pain, dizziness or calf pain or swelling'],
    ] },
    { key: 'osteo', label: 'Osteoporosis or osteopenia', refs: ['sinaki'], notes: [
      ['avoid', 'Loaded or end-range spinal flexion — rounded-back forward folds, plough, sit-up style movements'],
      ['avoid', 'Forceful end-range twisting of the spine'],
      ['modify', 'Keep the spine long and neutral; favour standing, balance and spine-extension work'],
    ] },
    { key: 'lbp', label: 'Low back pain or disc problem', refs: ['nice_lbp'], notes: [
      ['modify', 'Work in a pain-free range and build up gradually; movement is better than rest'],
      ['avoid', 'Loaded forward bending early on if it brings on leg pain'],
      ['refer', 'Leg pain, numbness or weakness that is spreading or worsening, or any red-flag sign — refer before going on'],
    ] },
    { key: 'cardiac', label: 'Heart disease or recent cardiac event', refs: ['riebe'], notes: [
      ['refer', 'Medical clearance first (see the exercise screening tool)'],
      ['avoid', 'Breath holding and straining; long holds with the arms overhead'],
      ['modify', 'Light to moderate intensity, with a long warm-up and cool-down; stop for chest pain, breathlessness or dizziness'],
    ] },
    { key: 'diabetes', label: 'Diabetes on insulin or tablets that lower sugar', refs: ['colberg'], notes: [
      ['modify', 'Check blood sugar before class if the patient self-monitors; keep a fast-acting sugar (glucose tablets, juice) at hand'],
      ['modify', 'Watch for shaking, sweating or confusion — low sugar can come on during or hours after practice'],
      ['refer', 'With eye disease (retinopathy) avoid head-down positions; with foot numbness check the feet after practice'],
    ] },
    { key: 'epilepsy', label: 'Epilepsy', refs: [], notes: [
      ['avoid', 'Fast, deep over-breathing (kapalabhati, bhastrika) — over-breathing can trigger seizures in some people'],
      ['modify', 'Avoid long breath holds and poses with a high fall risk unless supported'],
    ] },
    { key: 'joint', label: 'Hip or knee replacement', refs: [], notes: [
      ['refer', 'Follow the surgeon\'s precautions — they depend on the operation and usually last 6 to 12 weeks'],
      ['avoid', 'After a hip replacement: deep hip bending past 90°, crossing the legs and turning the knee in, unless the surgeon has cleared it'],
      ['modify', 'After a knee replacement: pad or avoid kneeling on the operated knee until it is comfortable'],
    ] },
  ];
  function cautions(keys) { const set = new Set(keys || []); return CAUTIONS.filter((c) => set.has(c.key)); }

  // Breathing patterns — seconds for [in, hold, out, hold]
  const BREATHS = {
    slow6: { label: 'Slow breathing · 6 a minute (5 in, 5 out)', steps: [5, 0, 5, 0] },
    longout: { label: 'Longer out-breath (4 in, 6 out)', steps: [4, 0, 6, 0] },
    equal: { label: 'Equal breathing (4 in, 4 out)', steps: [4, 0, 4, 0] },
    box: { label: 'Box breathing (4 in, 4 hold, 4 out, 4 hold)', steps: [4, 4, 4, 4] },
  };
  const breathRate = (key) => { const b = BREATHS[key]; if (!b) return null; const t = b.steps.reduce((a, c) => a + c, 0); return 60 / t; };

  // ============================================================ references
  const REFS = {
    enright: 'Enright PL, Sherrill DL. Reference equations for the six-minute walk in healthy adults. Am J Respir Crit Care Med. 1998;158:1384-1387.',
    ats6mwt: 'ATS Committee on Proficiency Standards for Clinical Pulmonary Function Laboratories. ATS statement: guidelines for the six-minute walk test. Am J Respir Crit Care Med. 2002;166:111-117.',
    steadi_tug: 'Centers for Disease Control and Prevention. STEADI — Assessment: Timed Up & Go (TUG). Atlanta: CDC; 2017.',
    steadi_chair: 'Centers for Disease Control and Prevention. STEADI — Assessment: 30-Second Chair Stand. Atlanta: CDC; 2017. Rikli RE, Jones CJ. Development and validation of a functional fitness test for community-residing older adults. J Aging Phys Act. 1999;7:129-161.',
    awgs: 'Chen LK, et al. Asian Working Group for Sarcopenia: 2019 consensus update on sarcopenia diagnosis and treatment. J Am Med Dir Assoc. 2020;21:300-307.',
    aaos: 'American Academy of Orthopaedic Surgeons. Joint Motion: Method of Measuring and Recording. Chicago: AAOS; 1965. Greene WB, Heckman JD, eds. The Clinical Measurement of Joint Motion. AAOS; 1994.',
    farrar: 'Farrar JT, Young JP, LaMoreaux L, Werth JL, Poole RM. Clinical importance of changes in chronic pain intensity measured on an 11-point numerical pain rating scale. Pain. 2001;94:149-158.',
    immpact: 'Dworkin RH, et al. Interpreting the clinical importance of treatment outcomes in chronic pain clinical trials: IMMPACT recommendations. J Pain. 2008;9:105-121.',
    finucane: 'Finucane LM, et al. International framework for red flags for potential serious spinal pathologies. J Orthop Sports Phys Ther. 2020;50:350-372.',
    nice_lbp: 'NICE. Low back pain and sciatica in over 16s: assessment and management (NG59). London: NICE; 2016, updated 2020.',
    kdoqi2020: 'Ikizler TA, Burrowes JD, et al. KDOQI clinical practice guideline for nutrition in CKD: 2020 update. Am J Kidney Dis. 2020;76(3 Suppl 1):S1-S107.',
    kdigo2024: 'KDIGO CKD Work Group. KDIGO 2024 clinical practice guideline for the evaluation and management of chronic kidney disease. Kidney Int. 2024;105(4S):S117-S314.',
    holliday: 'Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957;19:823-832.',
    espen_ger: 'Volkert D, et al. ESPEN guideline on clinical nutrition and hydration in geriatrics. Clin Nutr. 2019;38:10-47.',
    iom2009: 'Institute of Medicine and National Research Council. Weight Gain During Pregnancy: Reexamining the Guidelines. Washington DC: National Academies Press; 2009.',
    acog_edd: 'American College of Obstetricians and Gynecologists. Committee Opinion No. 700: Methods for estimating the due date. Obstet Gynecol. 2017;129:e150-e154.',
    must: 'Elia M, ed. The \'MUST\' Report. Nutritional screening of adults: a multidisciplinary responsibility. Redditch: BAPEN; 2003. \'MUST\' is reproduced with the kind permission of BAPEN.',
    ckdepi2021: 'Inker LA, Eneanya ND, et al. New creatinine- and cystatin C-based equations to estimate GFR without race. N Engl J Med. 2021;385:1737-1749.',
    kdigo2012: 'KDIGO CKD Work Group. KDIGO 2012 clinical practice guideline for the evaluation and management of chronic kidney disease. Kidney Int Suppl. 2013;3:1-150.',
    cockcroft: 'Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16:31-41.',
    devine: 'Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650-655.',
    pai: 'Pai MP, Paloucek FP. The origin of the "ideal" body weight equations. Ann Pharmacother. 2000;34:1066-1069.',
    janma: 'Janmahasatian S, Duffull SB, et al. Quantification of lean bodyweight. Clin Pharmacokinet. 2005;44:1051-1065.',
    idrs: 'Mohan V, Deepa R, Deepa M, Somannavar S, Datta M. A simplified Indian Diabetes Risk Score for screening for undiagnosed diabetic subjects. J Assoc Physicians India. 2005;53:759-763.',
    ish2020: 'Unger T, Borghi C, et al. 2020 International Society of Hypertension global hypertension practice guidelines. Hypertension. 2020;75:1334-1357.',
    aha2017: 'Whelton PK, Carey RM, et al. 2017 ACC/AHA guideline for the prevention, detection, evaluation, and management of high blood pressure in adults. Hypertension. 2018;71:e13-e115.',
    acsm_gl: 'American College of Sports Medicine. ACSM\'s Guidelines for Exercise Testing and Prescription. 11th ed. Philadelphia: Wolters Kluwer; 2021.',
    adag: 'Nathan DM, Kuenen J, et al. Translating the A1C assay into estimated average glucose values. Diabetes Care. 2008;31:1473-1478.',
    ada2025: 'American Diabetes Association Professional Practice Committee. 2. Diagnosis and classification of diabetes: Standards of Care in Diabetes—2025. Diabetes Care. 2025;48(Suppl 1):S27-S49.',
    riebe: 'Riebe D, Franklin BA, et al. Updating ACSM\'s recommendations for exercise preparticipation health screening. Med Sci Sports Exerc. 2015;47:2473-2479.',
    pescatello: 'Pescatello LS, et al. American College of Sports Medicine position stand: exercise and hypertension. Med Sci Sports Exerc. 2004;36:533-553.',
    jasien: 'Jasien JV, Jonas JB, de Moraes CG, Ritch R. Intraocular pressure rise in subjects with and without glaucoma during four common yoga positions. PLoS One. 2015;10:e0144505.',
    acog2020: 'American College of Obstetricians and Gynecologists. Committee Opinion No. 804: Physical activity and exercise during pregnancy and the postpartum period. Obstet Gynecol. 2020;135:e178-e188.',
    sinaki: 'Sinaki M. Yoga spinal flexion positions and vertebral compression fracture in osteopenia or osteoporosis of spine: case series. Pain Pract. 2013;13:68-75.',
    colberg: 'Colberg SR, Sigal RJ, et al. Physical activity/exercise and diabetes: a position statement of the American Diabetes Association. Diabetes Care. 2016;39:2065-2079.',
    russo: 'Russo MA, Santarelli DM, O\'Rourke D. The physiological effects of slow breathing in the healthy human. Breathe. 2017;13:298-309.',
    zaccaro: 'Zaccaro A, Piarulli A, et al. How breath-control can change your life: a systematic review on psycho-physiological correlates of slow breathing. Front Hum Neurosci. 2018;12:353.',
  };

  const api = { round, isMale, sixMinuteWalk, timedUpGo, CHAIR_BANDS, chairStand, sarcopenia, ROM, romItem, romLabel, romCheck, painChange, RED_FLAGS, redFlags,
    CKD_PROTEIN, ckdProtein, hollidaySegar, IOM_GAIN, pregnancyGain, dueDate, mustScore,
    egfr2021, gfrStage, albuminuria, cockcroftGault, UMOL_PER_MGDL, dosingWeights, idrs, bpCategory, hba1c, fastingGlucose, acsmScreen,
    CAUTIONS, cautions, BREATHS, breathRate, REFS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FLHealth = api;
})(typeof window !== 'undefined' ? window : globalThis);
