/* =====================================================================
   The Fit Lab — Coach Tools: the calculations
   Every formula here is published and referenced (see REFS at the bottom).
   Inputs are metric: kg, cm, years. Nothing here is medical advice.
   Works in the browser (window.FLCalc) and in Node (module.exports) for tests.
   ===================================================================== */
(function (root) {
  'use strict';
  const round = (n, d = 0) => { const f = 10 ** d; return Math.round((Number(n) + Number.EPSILON) * f) / f; };
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const isMale = (sex) => String(sex || '').toLowerCase().startsWith('m');
  const log10 = Math.log10;

  // ---------------------------------------------------------------- BMI
  // WHO 2000 (TRS 894) for everyone; WHO Expert Consultation 2004 + Indian consensus (Misra 2009) for Asian Indians
  function bmi(weightKg, heightCm) {
    const m = heightCm / 100;
    if (!(weightKg > 0) || !(m > 0)) return null;
    return weightKg / (m * m);
  }
  function bmiClass(b, scale = 'asian') {
    if (b == null || !isFinite(b)) return null;
    if (scale === 'asian') {
      if (b < 18.5) return { key: 'under', label: 'Underweight', risk: 'low weight' };
      if (b < 23) return { key: 'normal', label: 'Normal', risk: 'healthy range' };
      if (b < 25) return { key: 'over', label: 'Overweight', risk: 'increased risk' };
      if (b < 30) return { key: 'obese1', label: 'Obese (class I)', risk: 'high risk' };
      return { key: 'obese2', label: 'Obese (class II)', risk: 'very high risk' };
    }
    if (b < 18.5) return { key: 'under', label: 'Underweight', risk: 'low weight' };
    if (b < 25) return { key: 'normal', label: 'Normal', risk: 'healthy range' };
    if (b < 30) return { key: 'over', label: 'Overweight', risk: 'increased risk' };
    if (b < 35) return { key: 'obese1', label: 'Obese (class I)', risk: 'high risk' };
    if (b < 40) return { key: 'obese2', label: 'Obese (class II)', risk: 'very high risk' };
    return { key: 'obese3', label: 'Obese (class III)', risk: 'extremely high risk' };
  }
  // healthy weight range for a height (Asian: BMI 18.5–22.9; WHO: 18.5–24.9)
  function healthyWeightRange(heightCm, scale = 'asian') {
    const m2 = (heightCm / 100) ** 2;
    return { min: 18.5 * m2, max: (scale === 'asian' ? 22.9 : 24.9) * m2 };
  }

  // ---------------------------------------------------------------- BMR (kcal/day)
  function bmrMifflin(sex, weightKg, heightCm, age) {          // Mifflin–St Jeor 1990
    return 10 * weightKg + 6.25 * heightCm - 5 * age + (isMale(sex) ? 5 : -161);
  }
  function bmrHarris(sex, weightKg, heightCm, age) {           // Harris–Benedict, revised by Roza & Shizgal 1984
    return isMale(sex) ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
                       : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
  }
  function bmrKatch(leanKg) {                                   // Katch–McArdle (needs lean mass)
    return 370 + 21.6 * leanKg;
  }

  // ---------------------------------------------------------------- activity and TDEE
  const ACTIVITY = [
    { key: 'sedentary', label: 'Sedentary — desk job, little exercise', f: 1.2 },
    { key: 'light', label: 'Lightly active — exercise 1–3 days a week', f: 1.375 },
    { key: 'moderate', label: 'Moderately active — exercise 3–5 days a week', f: 1.55 },
    { key: 'very', label: 'Very active — hard exercise 6–7 days a week', f: 1.725 },
    { key: 'extra', label: 'Extremely active — physical job plus training', f: 1.9 },
  ];
  const activityFactor = (key) => (ACTIVITY.find((a) => a.key === key) || ACTIVITY[0]).f;
  const tdee = (bmrKcal, activityKey) => bmrKcal * activityFactor(activityKey);

  // ---------------------------------------------------------------- body composition
  // US Navy circumference method (Hodgdon & Beckett 1984), metric form
  function bodyFatNavy(sex, heightCm, neckCm, waistCm, hipCm) {
    if (!(heightCm > 0 && neckCm > 0 && waistCm > 0)) return null;
    if (isMale(sex)) {
      if (waistCm <= neckCm) return null;
      return 495 / (1.0324 - 0.19077 * log10(waistCm - neckCm) + 0.15456 * log10(heightCm)) - 450;
    }
    if (!(hipCm > 0) || waistCm + hipCm <= neckCm) return null;
    return 495 / (1.29579 - 0.35004 * log10(waistCm + hipCm - neckCm) + 0.22100 * log10(heightCm)) - 450;
  }
  // from BMI, age and sex (Deurenberg 1991) — a rough estimate when no tape measurements exist
  function bodyFatDeurenberg(sex, bmiValue, age) {
    return 1.2 * bmiValue + 0.23 * age - 10.8 * (isMale(sex) ? 1 : 0) - 5.4;
  }
  // lean body mass (Boer 1984)
  function leanMassBoer(sex, weightKg, heightCm) {
    return isMale(sex) ? 0.407 * weightKg + 0.267 * heightCm - 19.2 : 0.252 * weightKg + 0.473 * heightCm - 48.3;
  }
  const leanFromBodyFat = (weightKg, bfPct) => weightKg * (1 - bfPct / 100);
  // fat-free mass index (Kouri 1995), normalised to 1.8 m
  function ffmi(leanKg, heightCm) {
    const h = heightCm / 100;
    const v = leanKg / (h * h);
    return { ffmi: v, normalized: v + 6.1 * (1.8 - h) };
  }
  function bodyFatBand(sex, bf) {                      // ACE body-fat categories
    const m = isMale(sex);
    const cuts = m ? [[6, 'Essential fat'], [14, 'Athletes'], [18, 'Fitness'], [25, 'Average'], [Infinity, 'Above average (obese range)']]
                   : [[14, 'Essential fat'], [21, 'Athletes'], [25, 'Fitness'], [32, 'Average'], [Infinity, 'Above average (obese range)']];
    for (const [lim, lbl] of cuts) if (bf < lim) return lbl;
    return cuts[cuts.length - 1][1];
  }

  // ---------------------------------------------------------------- ideal body weight (kg)
  function idealWeights(sex, heightCm) {
    const inchesOver5ft = Math.max(0, heightCm / 2.54 - 60);
    const m = isMale(sex);
    return {
      devine: (m ? 50 : 45.5) + 2.3 * inchesOver5ft,        // Devine 1974
      robinson: (m ? 52 : 49) + (m ? 1.9 : 1.7) * inchesOver5ft, // Robinson 1983
      miller: (m ? 56.2 : 53.1) + (m ? 1.41 : 1.36) * inchesOver5ft, // Miller 1983
    };
  }
  // weight used for protein when someone carries a lot of fat (adjusted body weight)
  function referenceWeight(sex, weightKg, heightCm) {
    const b = bmi(weightKg, heightCm);
    if (b == null || b < 27.5) return weightKg;
    const ibw = idealWeights(sex, heightCm).devine;
    return ibw + 0.4 * (weightKg - ibw);
  }

  // ---------------------------------------------------------------- waist
  function waistRisk(sex, waistCm) {                    // Asian Indian cut-offs (Misra 2009; IDF 2006)
    const lim = isMale(sex) ? 90 : 80;
    return waistCm >= lim ? { high: true, limit: lim } : { high: false, limit: lim };
  }
  function waistToHeight(waistCm, heightCm) {           // NICE 2022 / Ashwell 2012
    const r = waistCm / heightCm;
    const band = r < 0.4 ? 'Take care (may be too thin)' : r < 0.5 ? 'Healthy' : r < 0.6 ? 'Increased health risk' : 'High health risk';
    return { ratio: r, band };
  }
  function waistToHip(sex, waistCm, hipCm) {            // WHO 2008 expert consultation
    const r = waistCm / hipCm;
    const lim = isMale(sex) ? 0.9 : 0.85;
    return { ratio: r, high: r >= lim, limit: lim };
  }

  // ---------------------------------------------------------------- energy and macro targets
  const GOALS = {
    fat_loss: { label: 'Fat loss', adj: -0.20, protein: 2.0, fatPct: 25 },
    fat_loss_gentle: { label: 'Gentle fat loss', adj: -0.10, protein: 1.8, fatPct: 25 },
    recomp: { label: 'Recomposition', adj: -0.05, protein: 2.0, fatPct: 25 },
    maintain: { label: 'Maintenance', adj: 0, protein: 1.6, fatPct: 28 },
    muscle_gain: { label: 'Muscle gain', adj: 0.10, protein: 1.8, fatPct: 25 },
    health: { label: 'General health', adj: 0, protein: 1.2, fatPct: 28 },
  };
  // calories, protein, fat, carbs, fibre and water for one person and one goal
  function targets({ sex, age, weightKg, heightCm, activity = 'sedentary', goal = 'maintain', bodyFatPct = null,
                     proteinPerKg = null, fatPct = null, adjust = null }) {
    const g = GOALS[goal] || GOALS.maintain;
    const lean = bodyFatPct ? leanFromBodyFat(weightKg, bodyFatPct) : null;
    const bmrM = bmrMifflin(sex, weightKg, heightCm, age);
    const bmrUsed = lean ? (bmrM + bmrKatch(lean)) / 2 : bmrM;   // with a body-fat %, average the two
    const maintenance = tdee(bmrUsed, activity);
    const adj = adjust != null ? adjust : g.adj;
    let kcal = maintenance * (1 + adj);
    // never plan below 1,200 kcal (women) / 1,500 kcal (men) without medical supervision — or below maintenance if that is lower
    const floor = Math.min(isMale(sex) ? 1500 : 1200, maintenance);
    const warnings = [];
    if (kcal < floor) { warnings.push(`Raised to ${Math.round(floor)} kcal — eating less than this should only happen under medical supervision.`); kcal = floor; }
    const b = bmi(weightKg, heightCm);
    if (b < 18.5) warnings.push('BMI is under 18.5 (underweight). Plan for weight gain and suggest a check-up with a doctor or dietitian.');
    else if (adj < 0 && b < 20) warnings.push('BMI is already at the low end of healthy — fat loss is rarely needed. Consider maintenance or recomposition.');
    if (age < 18) warnings.push('Under 18: use these numbers only with a parent or guardian and a qualified professional — growth needs extra energy and protein.');
    const refW = referenceWeight(sex, weightKg, heightCm);
    const pKg = proteinPerKg != null ? proteinPerKg : g.protein;
    const protein = pKg * refW;
    const fPct = fatPct != null ? fatPct : g.fatPct;
    let fat = (kcal * fPct / 100) / 9;
    if (fat < 0.5 * weightKg) fat = 0.5 * weightKg;                // keep fat from going too low (hormonal health)
    const carbs = Math.max(0, (kcal - protein * 4 - fat * 9) / 4);
    if (carbs < 100) warnings.push('Carbohydrate is under 100 g a day — consider a smaller deficit or less fat.');
    const fibre = 15 * kcal / 1000;                                 // ICMR-NIN: about 30 g per 2000 kcal
    const water = 35 * weightKg / 1000;                             // litres a day, before exercise
    return {
      bmr: bmrUsed, bmrMifflin: bmrM, bmrKatch: lean ? bmrKatch(lean) : null, maintenance, kcal, adjust: adj,
      protein, fat, carbs, fibre, water, proteinPerKg: pKg, referenceWeight: refW,
      split: { protein: protein * 4 / kcal * 100, fat: fat * 9 / kcal * 100, carbs: carbs * 4 / kcal * 100 },
      weeklyChangeKg: (kcal - maintenance) * 7 / 7700,              // ~7,700 kcal per kg of body fat
      warnings,
    };
  }

  // ---------------------------------------------------------------- strength and heart rate
  function oneRepMax(weight, reps) {
    if (!(weight > 0) || !(reps >= 1)) return null;
    if (reps === 1) return { epley: weight, brzycki: weight, average: weight };
    const epley = weight * (1 + reps / 30);                         // Epley 1985
    const brzycki = reps < 37 ? weight * 36 / (37 - reps) : null;   // Brzycki 1993
    return { epley, brzycki, average: brzycki ? (epley + brzycki) / 2 : epley, reliable: reps <= 10 };
  }
  const PCT_1RM = [[1, 100], [2, 95], [3, 93], [4, 90], [5, 87], [6, 85], [8, 80], [10, 75], [12, 70], [15, 65]];
  const hrMax = (age) => 208 - 0.7 * age;                           // Tanaka 2001
  function hrZones(age, restingHr) {
    const max = hrMax(age), rest = restingHr > 0 ? restingHr : null;
    const zone = (lo, hi) => rest ? [rest + (max - rest) * lo, rest + (max - rest) * hi] : [max * lo, max * hi];
    return { max, method: rest ? 'Karvonen (heart-rate reserve)' : 'Percent of maximum heart rate', zones: [
      { z: 1, label: 'Recovery', range: zone(0.5, 0.6) },
      { z: 2, label: 'Endurance / fat-burning', range: zone(0.6, 0.7) },
      { z: 3, label: 'Tempo', range: zone(0.7, 0.8) },
      { z: 4, label: 'Threshold', range: zone(0.8, 0.9) },
      { z: 5, label: 'Max effort', range: zone(0.9, 1.0) },
    ] };
  }

  // ---------------------------------------------------------------- references
  const REFS = {
    who_bmi: 'WHO. Obesity: preventing and managing the global epidemic. Technical Report Series 894. Geneva: WHO; 2000.',
    who_asian: 'WHO Expert Consultation. Appropriate body-mass index for Asian populations and its implications for policy and intervention strategies. Lancet. 2004;363:157-163.',
    misra: 'Misra A, et al. Consensus statement for diagnosis of obesity, abdominal obesity and the metabolic syndrome for Asian Indians and recommendations for physical activity, medical and surgical management. J Assoc Physicians India. 2009;57:163-170.',
    mifflin: 'Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51:241-247.',
    roza: 'Roza AM, Shizgal HM. The Harris Benedict equation reevaluated: resting energy requirements and the body cell mass. Am J Clin Nutr. 1984;40:168-182.',
    katch: 'McArdle WD, Katch FI, Katch VL. Exercise Physiology: Nutrition, Energy, and Human Performance. Wolters Kluwer.',
    fao: 'FAO/WHO/UNU. Human energy requirements. Food and Nutrition Technical Report Series 1. Rome; 2004.',
    navy: 'Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy men and women from body circumferences and height. Naval Health Research Center Report 84-11/84-29; 1984.',
    deurenberg: 'Deurenberg P, Weststrate JA, Seidell JC. Body mass index as a measure of body fatness: age- and sex-specific prediction formulas. Br J Nutr. 1991;65:105-114.',
    boer: 'Boer P. Estimated lean body mass as an index for normalization of body fluid volumes in humans. Am J Physiol. 1984;247:F632-F636.',
    kouri: 'Kouri EM, Pope HG, et al. Fat-free mass index in users and nonusers of anabolic-androgenic steroids. Clin J Sport Med. 1995;5:223-228.',
    devine: 'Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650-655. Robinson JD, et al. Am J Hosp Pharm. 1983;40:1016-1019. Miller DR, et al. Am J Hosp Pharm. 1983;40:1622.',
    nice_whtr: 'NICE. Obesity: identification, assessment and management (CG189), waist-to-height ratio update; 2022. Ashwell M, et al. Obes Rev. 2012;13:275-286.',
    who_waist: 'WHO. Waist circumference and waist-hip ratio: report of a WHO expert consultation. Geneva; 2008.',
    issn_protein: 'Jäger R, Kerksick CM, et al. International Society of Sports Nutrition position stand: protein and exercise. J Int Soc Sports Nutr. 2017;14:20.',
    helms: 'Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. J Int Soc Sports Nutr. 2014;11:20.',
    iraki: 'Iraki J, Fitschen P, Espinar S, Helms E. Nutrition recommendations for bodybuilders in the off-season: a narrative review. Sports. 2019;7:154.',
    acsm_nutr: 'Thomas DT, Erdman KA, Burke LM. American College of Sports Medicine joint position statement: nutrition and athletic performance. Med Sci Sports Exerc. 2016;48:543-568.',
    iom_amdr: 'Institute of Medicine. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids. Washington DC: National Academies Press; 2005.',
    icmr_nin: 'ICMR-National Institute of Nutrition. Nutrient Requirements for Indians (RDA and EAR); 2020. Dietary Guidelines for Indians; 2024.',
    efsa_water: 'EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on dietary reference values for water. EFSA Journal. 2010;8(3):1459.',
    meal_protein: 'Schoenfeld BJ, Aragon AA. How much protein can the body use in a single meal for muscle-building? J Int Soc Sports Nutr. 2018;15:10.',
    epley: 'Epley B. Poundage chart. Boyd Epley Workout. Lincoln, NE; 1985. Brzycki M. Strength testing: predicting a one-rep max from reps-to-fatigue. JOPERD. 1993;64:88-90.',
    tanaka: 'Tanaka H, Monahan KD, Seals DR. Age-predicted maximal heart rate revisited. J Am Coll Cardiol. 2001;37:153-156.',
    karvonen: 'Karvonen MJ, Kentala E, Mustala O. The effects of training on heart rate. Ann Med Exp Biol Fenn. 1957;35:307-315.',
    ace_bf: 'American Council on Exercise. ACE Personal Trainer Manual, body-fat percentage categories.',
    who_pa: 'Bull FC, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54:1451-1462.',
    kcal_kg: 'Hall KD. What is the required energy deficit per unit weight loss? Int J Obes. 2008;32:573-576 (7,700 kcal/kg is an approximation; real loss slows over time).',
  };

  const api = { round, clamp, isMale, bmi, bmiClass, healthyWeightRange, bmrMifflin, bmrHarris, bmrKatch, ACTIVITY, activityFactor, tdee,
    bodyFatNavy, bodyFatDeurenberg, leanMassBoer, leanFromBodyFat, ffmi, bodyFatBand, idealWeights, referenceWeight,
    waistRisk, waistToHeight, waistToHip, GOALS, targets, oneRepMax, PCT_1RM, hrMax, hrZones, REFS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FLCalc = api;
})(typeof window !== 'undefined' ? window : globalThis);
