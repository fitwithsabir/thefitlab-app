/* =====================================================================
   The Fit Lab — workout program builder
   Builds a weekly resistance-training program from goal, level, days a week,
   session length, equipment, sore spots and health screening.
   Needs FLEx (exercises.js).
   ===================================================================== */
(function (root) {
  'use strict';
  const E = root.FLEx || (typeof require !== 'undefined' ? require('./exercises.js') : null);
  const BY = E.BY;

  // -------------------------------------------------------------- goals (ACSM 2009; Schoenfeld 2017, 2021; Grgic 2018)
  // sets by level [beginner, intermediate, advanced], reps [low, high], rest in seconds
  const GOALS = {
    fat_loss: { label: 'Fat loss', main: { sets: [3, 3, 4], reps: [8, 12], rest: 90 }, second: { sets: [2, 3, 3], reps: [10, 12], rest: 75 }, acc: { sets: [2, 2, 3], reps: [12, 15], rest: 60 }, rir: ['2–3', '1–3', '1–2'], cardio: 'finisher' },
    muscle_gain: { label: 'Muscle gain', main: { sets: [3, 3, 4], reps: [6, 10], rest: 120 }, second: { sets: [2, 3, 3], reps: [8, 12], rest: 90 }, acc: { sets: [2, 3, 3], reps: [10, 15], rest: 60 }, rir: ['2–3', '1–3', '0–2'], cardio: 'easy' },
    strength: { label: 'Strength', main: { sets: [3, 4, 5], reps: [3, 6], rest: 180 }, second: { sets: [3, 3, 4], reps: [6, 8], rest: 120 }, acc: { sets: [2, 3, 3], reps: [8, 12], rest: 75 }, rir: ['2–3', '1–3', '1–2'], cardio: 'easy' },
    general: { label: 'General fitness and health', main: { sets: [2, 3, 3], reps: [8, 12], rest: 90 }, second: { sets: [2, 2, 3], reps: [10, 12], rest: 75 }, acc: { sets: [2, 2, 2], reps: [12, 15], rest: 60 }, rir: ['2–3', '2–3', '1–3'], cardio: 'finisher' },
  };
  // the calculator's goals → a training goal
  const fromDietGoal = (g) => ({ fat_loss: 'fat_loss', fat_loss_gentle: 'fat_loss', recomp: 'muscle_gain', muscle_gain: 'muscle_gain', maintain: 'general', health: 'general' }[g] || 'general');
  const LEVELS = [['1', 'Beginner (under 6 months)'], ['2', 'Intermediate (6 months – 2 years)'], ['3', 'Advanced (2+ years)']];

  // -------------------------------------------------------------- session templates
  // each slot: patterns it can use (first is preferred), role, priority (lower = dropped last when time is short)
  const S = (pats, role, prio) => ({ pats, role, prio });
  const DAYS = {
    fbA: { name: 'Full body A', focus: 'Squat, push, pull', slots: [S(['squat'], 'main', 1), S(['push_h'], 'main', 2), S(['pull_v', 'pull_h'], 'second', 3), S(['hinge'], 'second', 4), S(['delt_iso', 'rear_delt'], 'acc', 7), S(['biceps'], 'acc', 8), S(['core'], 'core', 6)] },
    fbB: { name: 'Full body B', focus: 'Hinge, press, row', slots: [S(['hinge'], 'main', 1), S(['push_v', 'push_h'], 'main', 2), S(['pull_h'], 'second', 3), S(['lunge'], 'second', 4), S(['rear_delt', 'delt_iso'], 'acc', 7), S(['triceps'], 'acc', 8), S(['core', 'carry'], 'core', 6)] },
    fbC: { name: 'Full body C', focus: 'Single leg, incline, pull-down', slots: [S(['lunge', 'squat'], 'main', 1), S(['push_h'], 'second', 2), S(['pull_v', 'pull_h'], 'main', 3), S(['ham_iso', 'hinge'], 'acc', 4), S(['chest_iso', 'glute_iso'], 'acc', 7), S(['biceps', 'triceps'], 'acc', 8), S(['carry', 'core'], 'core', 6)] },
    upA: { name: 'Upper A', focus: 'Chest and back, heavier', slots: [S(['push_h'], 'main', 1), S(['pull_h'], 'main', 2), S(['push_v'], 'second', 3), S(['pull_v'], 'second', 4), S(['delt_iso'], 'acc', 5), S(['biceps'], 'acc', 6), S(['triceps'], 'acc', 7)] },
    upB: { name: 'Upper B', focus: 'Shoulders and back, more reps', slots: [S(['push_v'], 'main', 1), S(['pull_v'], 'main', 2), S(['push_h'], 'second', 3), S(['pull_h'], 'second', 4), S(['chest_iso', 'triceps'], 'acc', 5), S(['rear_delt'], 'acc', 6), S(['biceps'], 'acc', 7)] },
    loA: { name: 'Lower A', focus: 'Squat focus', slots: [S(['squat'], 'main', 1), S(['hinge'], 'second', 2), S(['lunge'], 'second', 3), S(['ham_iso'], 'acc', 4), S(['calves'], 'acc', 6), S(['core'], 'core', 5)] },
    loB: { name: 'Lower B', focus: 'Hinge focus', slots: [S(['hinge'], 'main', 1), S(['squat'], 'second', 2), S(['lunge'], 'second', 3), S(['glute_iso', 'quad_iso'], 'acc', 4), S(['calves'], 'acc', 6), S(['core', 'carry'], 'core', 5)] },
    push: { name: 'Push', focus: 'Chest, shoulders, triceps', slots: [S(['push_h'], 'main', 1), S(['push_v'], 'second', 2), S(['push_h'], 'second', 3), S(['chest_iso'], 'acc', 5), S(['delt_iso'], 'acc', 4), S(['triceps'], 'acc', 6)] },
    pull: { name: 'Pull', focus: 'Back, rear delts, biceps', slots: [S(['pull_v'], 'main', 1), S(['pull_h'], 'second', 2), S(['pull_h', 'pull_v'], 'second', 3), S(['rear_delt'], 'acc', 4), S(['biceps'], 'acc', 5), S(['core'], 'core', 6)] },
    legs: { name: 'Legs', focus: 'Quads, hamstrings, glutes', slots: [S(['squat'], 'main', 1), S(['hinge'], 'second', 2), S(['lunge'], 'second', 3), S(['quad_iso', 'glute_iso'], 'acc', 5), S(['ham_iso'], 'acc', 4), S(['calves'], 'acc', 6), S(['core'], 'core', 7)] },
  };
  const SPLITS = {
    2: { name: 'Full body, 2 days', days: ['fbA', 'fbB'], when: ['Mon', 'Thu'] },
    3: { name: 'Full body, 3 days', days: ['fbA', 'fbB', 'fbC'], when: ['Mon', 'Wed', 'Fri'] },
    4: { name: 'Upper / lower, 4 days', days: ['upA', 'loA', 'upB', 'loB'], when: ['Mon', 'Tue', 'Thu', 'Fri'] },
    5: { name: 'Upper / lower + push / pull / legs, 5 days', days: ['upA', 'loA', 'push', 'pull', 'legs'], when: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'] },
    6: { name: 'Push / pull / legs, 6 days', days: ['push', 'pull', 'legs', 'push', 'pull', 'legs'], when: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  };

  // exercises lying on the back or front, and jumps — left out in pregnancy (ACOG 2020)
  const SUPINE = ['bench_press', 'db_bench', 'floor_press', 'db_fly', 'skullcrusher', 'close_bench', 'dead_bug', 'glute_bridge', 'sl_bridge', 'slider_curl', 'rev_crunch', 'hollow', 'hip_thrust', 'db_hip_thrust', 'cs_row', 'nordic', 'ab_wheel'];
  const IMPACT = ['jacks', 'burpee', 'skipping', 'mountain'];
  const FALL_RISK = ['bss', 'sl_rdl', 'walking_lunge', 'db_step_up', 'lateral_lunge', 'sl_stand'];
  const STEADY = ['brisk_walk', 'cycle', 'rower', 'step_jacks', 'shadow_box'];
  // when nothing suits a slot (bodyweight only, say), the next-closest job
  const FALLBACK = { pull_v: ['pull_h'], pull_h: ['pull_v'], push_v: ['push_h'], delt_iso: ['rear_delt', 'push_v'], rear_delt: ['pull_h'], chest_iso: ['push_h'], biceps: ['pull_h', 'pull_v'],
    triceps: ['push_h'], quad_iso: ['squat', 'lunge'], ham_iso: ['hinge'], glute_iso: ['hinge'], carry: ['core'], squat: ['lunge'], lunge: ['squat'] };

  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  // -------------------------------------------------------------- who can do what
  function rules(ctx) {
    const cond = ctx.conditions || [];
    const pregnant = cond.includes('pregnant');
    const older = (ctx.age || 30) >= 60;
    const lowImpact = pregnant || older || (ctx.bmi || 0) >= 30 || (ctx.injuries || []).includes('knee') || cond.includes('heart');
    const careful = pregnant || older || cond.includes('heart') || cond.includes('hypertension');
    let maxLvl = Math.min(3, +ctx.level || 1);
    if (careful) maxLvl = Math.min(maxLvl, 2);
    return { pregnant, older, lowImpact, careful, maxLvl };
  }
  function allowed(ex, ctx, R) {
    if (!E.canDo(ex, ctx.equipment || [])) return false;
    if (ex.lvl > R.maxLvl) return false;
    if ((ctx.injuries || []).some((i) => ex.avoid.includes(i))) return false;
    if (R.pregnant && (SUPINE.includes(ex.id) || FALL_RISK.includes(ex.id))) return false;
    if (R.lowImpact && IMPACT.includes(ex.id)) return false;
    return true;
  }
  // all exercises that could fill a slot, best first
  function candidates(slot, ctx, R, used, today, seed) {
    const lvl = +ctx.level || 1;
    const list = E.LIST.filter((ex) => slot.pats.includes(ex.pat) && !today.includes(ex.id) && allowed(ex, ctx, R));
    return list.map((ex) => {
      let s = slot.pats.indexOf(ex.pat) * 1.2;                         // preferred pattern first
      const gap = Math.min(lvl, R.maxLvl) - ex.lvl;                      // advanced clients still use simple lifts
      s += gap >= 2 ? 1.2 : gap === 1 ? 0.25 : 0;
      if (slot.role === 'main') { if (ex.kind !== 'compound') s += 3; if (ex.uni) s += 1.2; if (ex.time) s += 4; if (ex.ballistic) s += 2.5; if (ex.support) s += ctx.goal === 'strength' ? 2.5 : 1.6; if (ctx.goal === 'strength' && ex.eq.includes('bb')) s -= 0.8; }
      if (slot.role === 'second') { if (ex.time) s += 2; if (ex.kind === 'isolation') s += 1.5; }
      if (slot.role === 'acc' && ex.kind === 'compound' && slot.pats[0].endsWith('_iso')) s += 0.5;
      if (lvl === 1 && (ex.eq.includes('mc') || ex.eq.includes('db'))) s -= 0.3;       // easier to learn
      if (ex.eq.length === 0 && (ctx.equipment || []).length > 1 && ex.kind !== 'core' && ex.pat !== 'balance') s += lvl >= 2 ? 1.6 : 0.4;   // load it if you can
      s += (used[ex.id] || 0) * (slot.role === 'main' ? (ctx.goal === 'strength' ? 0.6 : 1.1) : 2.5);   // variety across the week (main lifts may repeat)
      s += seed ? (hash(ex.id + seed) % 100) / 100 * 0.9 : 0;
      return { ex, s };
    }).sort((a, b) => a.s - b.s).map((x) => x.ex);
  }

  // -------------------------------------------------------------- sets, reps, rest and effort
  function prescribe(ex, role, ctx, R) {
    const g = GOALS[ctx.goal] || GOALS.general, li = Math.min(3, Math.max(1, +ctx.level || 1)) - 1;
    let p = role === 'main' ? g.main : role === 'second' ? g.second : g.acc;
    let sets = p.sets[li], reps = [...p.reps], rest = p.rest, rir = g.rir[li];
    if (R.careful && ctx.goal === 'strength') reps = [8, 12];          // no very heavy sets with BP or heart issues
    if (R.careful) rir = '2–3';
    if (R.pregnant) rir = '3+ (able to talk)';
    if (ex.kind === 'isolation' && role !== 'main') reps = [Math.max(reps[0], 10), Math.max(reps[1], 15)];
    if (ex.pat === 'calves') reps = [10, 20];
    if (ex.reps) reps = ex.reps;
    // bodyweight moves need more reps to be hard enough
    if (!ex.eq.length && ex.kind === 'compound' && !ex.time) reps = ex.mus === 'quads' || ex.mus === 'glutes' ? [12, 20] : [Math.max(reps[0], 6), Math.max(reps[1], 15)];
    if (role === 'core') { sets = Math.min(sets, 3); rest = 45; }
    let text = ex.time ? (ex.pat === 'carry' ? '30–40 s' : role === 'core' || ex.pat === 'balance' ? '20–40 s' : '30–45 s') : `${reps[0]}–${reps[1]}`;
    if (ex.kind === 'core' && !ex.time) text = '8–12';
    if (ex.uni) text += ' each side';
    if (ex.kind === 'core' || ex.pat === 'balance') { rest = 45; }
    return { sets, reps: text, rest, rir: ex.kind === 'core' || ex.pat === 'balance' ? 'Steady' : rir };
  }

  // about how long a session takes: warm-up + each set (~40 s of work) and its rest + changeovers
  const workSec = (it) => (BY[it.id] && BY[it.id].uni ? 70 : 40);
  function minutes(day, finisher = true) {
    let s = (day.short ? 5 : 8) * 60;
    for (const it of day.items) s += it.sets * (workSec(it) + it.rest) + 60;
    if (finisher && day.finisher) s += day.finisher.minutes * 60;
    return Math.round(s / 60);
  }

  // -------------------------------------------------------------- the program
  // ctx: { goal, level, days, minutes, equipment[], injuries[], conditions[], age, sex, bmi, seed }
  function build(ctx) {
    const c = { goal: GOALS[ctx.goal] ? ctx.goal : 'general', level: String(ctx.level || 1), days: Math.min(6, Math.max(2, +ctx.days || 3)), minutes: +ctx.minutes || 60,
      equipment: ctx.equipment || [], injuries: ctx.injuries || [], conditions: ctx.conditions || [], age: ctx.age || 30, sex: ctx.sex || 'female', bmi: ctx.bmi || 0, seed: ctx.seed || '' };
    const R = rules(c);
    const split = SPLITS[c.days];
    const used = {};
    const days = split.days.map((key, di) => buildDay(key, di, c, R, used, split.when[di]));
    return { split: split.name, days, ctx: c, notes: notesFor(c, R), progression: progression(c, R), warmup: warmup(c, R) };
  }
  function buildDay(key, di, c, R, used, when) {
    const tpl = DAYS[key];
    const today = [];
    let slots = [...tpl.slots];
    if (R.older) slots = [...slots, S(['balance'], 'core', 5)];
    let items = [];
    for (const slot of slots) {
      let ex = candidates(slot, c, R, used, today, c.seed + di)[0];
      if (!ex && FALLBACK[slot.pats[0]]) ex = candidates({ ...slot, pats: FALLBACK[slot.pats[0]] }, c, R, used, today, c.seed + di)[0];
      if (!ex) continue;
      today.push(ex.id); used[ex.id] = (used[ex.id] || 0) + 1;
      items.push({ id: ex.id, role: slot.role, prio: slot.prio, ...prescribe(ex, slot.role, c, R) });
    }
    // very little equipment can leave a day thin — top it up with core work
    for (let k = 0; items.length < 4 && k < 2; k++) {
      const ex = candidates(S(['core', 'carry'], 'core', 9), c, R, used, today, c.seed + di + 'x')[0];
      if (!ex) break;
      today.push(ex.id); used[ex.id] = (used[ex.id] || 0) + 1;
      items.push({ id: ex.id, role: 'core', prio: 9, ...prescribe(ex, 'core', c, R) });
    }
    const day = { key, name: tpl.name, focus: tpl.focus, when, items, finisher: finisher(c, R, di), short: c.minutes <= 30 };
    // too long for the time the client has: shorten the finisher, drop the lowest-priority exercises,
    // then take sets off — accessories first, main lifts last
    const fit = () => minutes(day) <= c.minutes + 3;
    const dropTo = (n) => { while (!fit() && day.items.length > n) { const d = day.items.reduce((a, b) => (b.prio > a.prio ? b : a)); day.items = day.items.filter((x) => x !== d); } };
    const trim = (roles, floor) => { for (const it of day.items) { if (fit()) return; if (roles.includes(it.role) && it.sets > floor) it.sets -= 1; } };
    if (!fit() && day.finisher) { day.finisher.minutes = 6; day.finisher.text = day.finisher.steady ? day.finisher.text.replace('10 minutes', '6 minutes') : day.finisher.text.replace('8 rounds', '5 rounds').replace('about 10 minutes', 'about 6 minutes'); }
    dropTo(5);
    if (!fit()) day.finisher = null;
    trim(['acc', 'core', 'second'], 2); trim(['acc', 'core', 'second'], 2);
    dropTo(4); trim(['main'], 3); dropTo(3); trim(['main'], 3); trim(['second', 'acc', 'core'], 2); trim(['main'], 2); trim(['main'], 2);
    day.items.sort((a, b) => ({ main: 0, second: 1, acc: 2, core: 3 }[a.role] - { main: 0, second: 1, acc: 2, core: 3 }[b.role]));
    day.minutes = minutes(day);
    return day;
  }
  function finisher(c, R, di) {
    const g = GOALS[c.goal];
    if (g.cardio !== 'finisher') return null;
    const easy = R.lowImpact || c.level === '1' || R.careful;
    const pick = E.LIST.filter((x) => x.pat === 'cardio' && allowed(x, c, R) && (!easy || STEADY.includes(x.id)));
    if (!pick.length) return null;
    const ex = pick[(hash(c.seed + 'f' + di) % pick.length)];
    return easy || STEADY.includes(ex.id) && hash(c.seed + 'i' + di) % 2
      ? { id: ex.id, minutes: 10, steady: true, text: `${ex.name}: 10 minutes at a steady pace — you can talk in short sentences.` }
      : { id: ex.id, minutes: 10, text: `${ex.name}: 8 rounds of 30 seconds hard, 45 seconds easy (about 10 minutes).` };
  }

  // -------------------------------------------------------------- guidance
  function warmup(c, R) {
    return ['5 minutes of easy cardio — brisk walk, bike or step jacks — until slightly warm.',
      'Mobility, 5–8 reps each: arm circles, cat–camel, hip openers, bodyweight squats to a comfortable depth' + (c.injuries.includes('shoulder') ? ', band pull-aparts' : '') + '.',
      'Before the first main exercise: 2–3 lighter sets — about 50% of the working weight × 8, 70% × 4, 85% × 2.'];
  }
  function progression(c, R) {
    const top = c.goal === 'strength' ? 'the top of the rep range' : 'the top of the rep range on every set';
    return [
      { week: 'Week 1', text: R.pregnant ? 'Learn the moves with light weights. Stay at an effort where you can talk.' : 'Learn the moves. Pick weights that leave about 3 reps in the tank.' },
      { week: 'Week 2', text: 'Same weights — add 1–2 reps per set where the form stays clean.' },
      { week: 'Week 3', text: `When you reach ${top} at the planned effort, add the smallest step of weight next time (about 1–2.5 kg upper body, 2.5–5 kg lower body).` },
      { week: 'Week 4', text: 'Lighter week if you feel run down or stop improving: same exercises, about half the sets, easy effort. Then start the next block a little heavier.' },
    ];
  }
  function notesFor(c, R) {
    const n = [], cond = c.conditions;
    n.push({ kind: 'refer', text: 'Before starting, the client should complete the PAR-Q+ health questionnaire. If they answer "yes" to any question, get their doctor\'s clearance first.' });
    if (cond.includes('heart')) n.push({ kind: 'refer', text: 'Heart disease: train only with the cardiologist\'s clearance, at moderate effort (stop 3 or more reps before failure), with no breath-holding.' });
    if (cond.includes('hypertension')) n.push({ kind: 'warn', text: 'High blood pressure: breathe out on the effort — never hold the breath — and keep 2–3 reps in reserve. If resting BP is 160/100 or higher, or not controlled, get the doctor\'s clearance before lifting (ACSM).' });
    if (cond.includes('diabetes')) n.push({ kind: 'warn', text: 'Diabetes: if on insulin or sulphonylureas, check blood sugar before training and carry glucose tablets or juice. Check the feet for cuts after training (ADA).' });
    if (R.pregnant) n.push({ kind: 'warn', text: 'Pregnancy: no lying flat on the back, no jumping or contact, no heavy breath-holding, avoid overheating. Stop and call the doctor for bleeding, dizziness, chest pain, calf pain or fluid leaking (ACOG 2020).' });
    if (cond.includes('kidney')) n.push({ kind: 'refer', text: 'Kidney disease: confirm the training plan with the client\'s nephrologist.' });
    if (c.injuries.includes('knee')) n.push({ kind: 'tip', text: 'Knee: squat and lunge only to a pain-free depth, with no jumping. Pain up to 3/10 that settles by the next morning is usually OK; sharper or lasting pain means reduce the load or range.' });
    if (c.injuries.includes('back')) n.push({ kind: 'tip', text: 'Lower back: keep the spine neutral, brace before each rep, and avoid rounding under load. Bird dog, side plank and curl-ups help most backs (McGill).' });
    if (c.injuries.includes('shoulder')) n.push({ kind: 'tip', text: 'Shoulder: use neutral-grip (palms facing) pressing, stop pressing where it pinches, and add band pull-aparts or face pulls.' });
    if (c.injuries.includes('wrist')) n.push({ kind: 'tip', text: 'Wrist or elbow: use dumbbells with palms facing in, and do push-ups on dumbbells or fists.' });
    if (R.older) n.push({ kind: 'tip', text: 'Over 60: balance work is added to each session. Train near a wall or rail and progress slowly (NSCA 2019; WHO 2020).' });
    if (c.level === '1' && c.days >= 5) n.push({ kind: 'tip', text: 'Most beginners progress best on 2–4 full-body days a week. More days only help once recovery and technique are solid (ACSM 2009).' });
    if ((c.bmi || 0) >= 30) n.push({ kind: 'tip', text: 'Conditioning is kept low-impact (walk, bike, step jacks) to protect the joints.' });
    const g = GOALS[c.goal];
    if (c.goal === 'fat_loss') n.push({ kind: 'tip', text: 'Fat loss comes mostly from the diet. Lifting keeps muscle. Build up to 7,000–10,000 steps a day, adding about 1,000 a week (Paluch 2022).' });
    if (g.cardio === 'easy') n.push({ kind: 'tip', text: 'For heart health, add 2–3 sessions of 20–30 minutes of easy cardio a week, ideally away from leg days.' });
    n.push({ kind: 'tip', text: 'Effort: "reps in reserve" (RIR) is how many more good reps you could have done. RIR 2 = you stopped with 2 left (Helms 2016).' });
    n.push({ kind: 'tip', text: 'Lower every rep in about 2–3 seconds with control. Breathe out as you push or pull.' });
    n.push({ kind: 'warn', text: 'Stop right away and seek help for chest pain, unusual breathlessness, dizziness, or sharp joint pain.' });
    return n;
  }

  // weekly hard sets per muscle (an exercise counts fully for its main muscle and half for the others)
  function volume(plan) {
    const v = {};
    for (const d of plan.days) for (const it of d.items) {
      const ex = BY[it.id]; if (!ex || ex.kind === 'cardio' || ex.pat === 'balance') continue;
      v[ex.mus] = (v[ex.mus] || 0) + it.sets;
      for (const m of ex.also) v[m] = (v[m] || 0) + it.sets * 0.5;
    }
    Object.keys(v).forEach((k) => { v[k] = Math.round(v[k] * 2) / 2; });
    return v;
  }
  const volumeBand = (sets) => (sets < 6 ? 'low' : sets < 10 ? 'moderate' : sets <= 20 ? 'good' : 'high');

  // other exercises for the same job that suit this client
  function swapsFor(id, ctx) {
    const ex = BY[id]; if (!ex) return [];
    const R = rules(ctx);
    const near = { squat: ['squat', 'lunge'], lunge: ['lunge', 'squat'], hinge: ['hinge'], push_h: ['push_h'], push_v: ['push_v'], pull_h: ['pull_h'], pull_v: ['pull_v', 'pull_h'],
      quad_iso: ['quad_iso', 'squat'], ham_iso: ['ham_iso', 'hinge'], glute_iso: ['glute_iso'], delt_iso: ['delt_iso'], rear_delt: ['rear_delt'], chest_iso: ['chest_iso', 'push_h'],
      biceps: ['biceps'], triceps: ['triceps'], calves: ['calves'], core: ['core', 'carry'], carry: ['carry', 'core'], cardio: ['cardio'], balance: ['balance'] }[ex.pat] || [ex.pat];
    return E.LIST.filter((x) => x.id !== id && near.includes(x.pat) && allowed(x, ctx, R)).map((x) => x.id);
  }
  // swap a day for a fresh selection
  function reshuffle(plan, di) {
    const c = { ...plan.ctx, seed: (plan.ctx.seed || '') + 'r' + Math.random().toString(36).slice(2, 5) };
    const R = rules(c);
    const used = {};
    plan.days.forEach((d, i) => { if (i !== di) d.items.forEach((x) => { used[x.id] = (used[x.id] || 0) + 1; }); });
    plan.days[di].items.forEach((x) => { used[x.id] = (used[x.id] || 0) + 3; });
    const old = plan.days[di];
    plan.days[di] = buildDay(old.key, di, c, R, used, old.when);
    return plan;
  }
  function addable(ctx) { const R = rules(ctx); return E.LIST.filter((x) => allowed(x, ctx, R)); }

  const REFS = [
    'American College of Sports Medicine. Progression models in resistance training for healthy adults. Med Sci Sports Exerc. 2009;41:687-708.',
    'Garber CE, et al. ACSM position stand: quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults. Med Sci Sports Exerc. 2011;43:1334-1359.',
    'Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases in muscle mass: a systematic review and meta-analysis. J Sports Sci. 2017;35:1073-1082.',
    'Schoenfeld BJ, Ogborn D, Krieger JW. Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis. Sports Med. 2016;46:1689-1697.',
    'Schoenfeld BJ, Grgic J, Van Every DW, Plotkin DL. Loading recommendations for muscle strength, hypertrophy, and local endurance: a re-examination of the repetition continuum. Sports. 2021;9:32.',
    'Grgic J, Schoenfeld BJ, Skrepnik M, Davies TB, Mikulic P. Effects of rest interval duration in resistance training on measures of muscular strength: a systematic review. Sports Med. 2018;48:137-151.',
    'Helms ER, Cronin J, Storey A, Zourdos MC. Application of the repetitions in reserve-based rating of perceived exertion scale for resistance training. Strength Cond J. 2016;38:42-49.',
    'Bull FC, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med. 2020;54:1451-1462.',
    'Fragala MS, et al. Resistance training for older adults: position statement from the National Strength and Conditioning Association. J Strength Cond Res. 2019;33:2019-2052.',
    'Paluch AE, et al. Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. Lancet Public Health. 2022;7:e219-e228.',
    'Warburton DER, Jamnik VK, Bredin SSD, Gledhill N. The Physical Activity Readiness Questionnaire for Everyone (PAR-Q+) and electronic Physical Activity Readiness Medical Examination (ePARmed-X+). Health Fit J Can. 2011;4:3-23.',
    'ACOG Committee Opinion No. 804: Physical activity and exercise during pregnancy and the postpartum period. Obstet Gynecol. 2020;135:e178-e188.',
    'Colberg SR, et al. Physical activity/exercise and diabetes: a position statement of the American Diabetes Association. Diabetes Care. 2016;39:2065-2079.',
    'Pescatello LS, et al. American College of Sports Medicine position stand: exercise and hypertension. Med Sci Sports Exerc. 2004;36:533-553.',
    'Silbernagel KG, Thomeé R, Eriksson BI, Karlsson J. Continued sports activity, using a pain-monitoring model, during rehabilitation in patients with Achilles tendinopathy. Am J Sports Med. 2007;35:897-906.',
    'McGill SM. Low Back Disorders: Evidence-Based Prevention and Rehabilitation. 3rd ed. Champaign, IL: Human Kinetics; 2016.',
  ];

  const api = { GOALS, LEVELS, DAYS, SPLITS, fromDietGoal, rules, allowed, build, buildDay, prescribe, minutes, volume, volumeBand, swapsFor, reshuffle, addable, REFS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FLWorkout = api;
})(typeof window !== 'undefined' ? window : globalThis);
