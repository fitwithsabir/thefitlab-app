/* =====================================================================
   The Fit Lab — diet plan builder: turns calorie and macro targets into an
   Indian day of meals, with portions in household units (roti, katori, tsp).
   Needs FLFoods (foods.js) and FLCalc (tools-calc.js).
   ===================================================================== */
(function (root) {
  'use strict';
  const F = (root.FLFoods || (typeof require !== 'undefined' ? require('./foods.js') : null));
  const FOODS = F.FOODS;

  // -------------------------------------------------------------- meal patterns
  // meal slots and their share of the day's calories and protein
  const PATTERNS = {
    3: [['breakfast', 'Breakfast', '8:00 am', 0.30, 0.32], ['lunch', 'Lunch', '1:30 pm', 0.40, 0.36], ['dinner', 'Dinner', '8:30 pm', 0.30, 0.32]],
    4: [['breakfast', 'Breakfast', '8:00 am', 0.25, 0.27], ['lunch', 'Lunch', '1:30 pm', 0.35, 0.30], ['snack', 'Evening snack', '5:00 pm', 0.10, 0.13], ['dinner', 'Dinner', '8:30 pm', 0.30, 0.30]],
    5: [['breakfast', 'Breakfast', '8:00 am', 0.25, 0.25], ['snack', 'Mid-morning', '11:00 am', 0.10, 0.10], ['lunch', 'Lunch', '1:30 pm', 0.30, 0.27], ['snack', 'Evening snack', '5:00 pm', 0.10, 0.11], ['dinner', 'Dinner', '8:30 pm', 0.25, 0.27]],
    6: [['breakfast', 'Breakfast', '7:30 am', 0.20, 0.20], ['snack', 'Mid-morning', '10:30 am', 0.10, 0.10], ['lunch', 'Lunch', '1:30 pm', 0.25, 0.24], ['snack', 'Evening snack', '5:00 pm', 0.10, 0.11], ['dinner', 'Dinner', '8:00 pm', 0.25, 0.24], ['bedtime', 'Bedtime', '10:00 pm', 0.10, 0.11]],
  };

  // -------------------------------------------------------------- meal templates
  // each item: [choices, role, default units, min, max, step]
  //   choices: food id, or { diet: [ids…] } picking the first that suits the client
  //   role: carb / protein / fat are adjusted to hit the targets; fixed stays as it is
  const P_MAIN = { nonveg: ['chicken_curry', 'fish', 'paneer_lf', 'soya'], egg: ['paneer_lf', 'soya', 'egg'], veg: ['paneer_lf', 'soya', 'tofu'], jain: ['paneer_lf', 'tofu', 'soya'], vegan: ['soya', 'tofu'] };
  const P_LEAN = { nonveg: ['chicken', 'fish', 'egg_white', 'paneer_lf'], egg: ['egg_white', 'paneer_lf', 'egg'], veg: ['paneer_lf', 'soya', 'tofu'], jain: ['paneer_lf', 'tofu'], vegan: ['tofu', 'soya'] };
  const P_BFAST = { nonveg: ['egg', 'egg_white', 'paneer_lf'], egg: ['egg', 'egg_white', 'paneer_lf'], veg: ['paneer_lf', 'greek', 'tofu'], jain: ['paneer_lf', 'greek', 'tofu'], vegan: ['tofu', 'soya'] };
  const DAIRY = { nonveg: ['curd'], egg: ['curd'], veg: ['curd'], jain: ['curd'], vegan: ['soymilk'] };
  const MILK = { nonveg: ['milk_dt'], egg: ['milk_dt'], veg: ['milk_dt'], jain: ['milk_dt'], vegan: ['soymilk'] };
  const SNACK_P = { nonveg: ['greek', 'egg', 'chana'], egg: ['greek', 'egg', 'chana'], veg: ['greek', 'chana', 'paneer_lf'], jain: ['greek', 'chana'], vegan: ['chana', 'soymilk'] };
  const VEG = { nonveg: ['sabzi'], egg: ['sabzi'], veg: ['sabzi'], jain: ['greens'], vegan: ['sabzi'] };
  const SALAD = { nonveg: ['salad'], egg: ['salad'], veg: ['salad'], jain: ['cucumber'], vegan: ['salad'] };
  const T = {
    breakfast: [
      { key: 'oats', name: 'Oats bowl', region: 'A', items: [['oats', 'carb', 1, 0.5, 2.5, 0.25], [MILK, 'fixed', 1, 1, 1, 1], [P_BFAST, 'protein', 1, 0, 4, 1], ['banana', 'fixed', 1, 0, 1, 0.5], [['almonds', 'pumpkin_seeds', 'flax'], 'fat', 1, 0, 3, 1]] },
      { key: 'chilla', name: 'Besan chilla with curd', region: 'N', items: [['besan', 'carb', 2, 1, 4, 1], ['oil', 'fat', 1, 0.5, 3, 0.5], [DAIRY, 'fixed', 1, 1, 1, 1], [P_BFAST, 'protein', 1, 0, 3, 1]] },
      { key: 'idli', name: 'Idli, sambar and chutney', region: 'S', items: [['idli', 'carb', 3, 2, 6, 1], ['sambar', 'fixed', 1, 1, 1, 1], ['chutney', 'fat', 1, 0, 2, 0.5], [P_BFAST, 'protein', 1, 0, 4, 1]] },
      { key: 'dosa', name: 'Dosa with sambar', region: 'S', items: [['dosa', 'carb', 2, 1, 4, 1], ['sambar', 'fixed', 1, 1, 1, 1], ['chutney', 'fat', 0.5, 0, 2, 0.5], [P_BFAST, 'protein', 1, 0, 4, 1]] },
      { key: 'poha', name: 'Poha with peanuts', region: 'A', items: [['poha', 'carb', 1, 0.5, 2, 0.5], ['peanuts', 'fat', 0.5, 0, 1.5, 0.5], [P_BFAST, 'protein', 1, 0, 4, 1], [DAIRY, 'fixed', 1, 0, 1, 1]] },
      { key: 'paratha', name: 'Paratha with curd', region: 'N', items: [['paratha', 'carb', 1, 1, 3, 1], [DAIRY, 'fixed', 1, 1, 1, 1], [P_BFAST, 'protein', 1, 0, 3, 1]] },
      { key: 'toast', name: 'Eggs on toast', region: 'A', diets: ['egg', 'nonveg'], items: [['bread_brown', 'carb', 2, 1, 4, 1], ['egg', 'protein', 2, 1, 4, 1], ['egg_white', 'protein', 1, 0, 4, 1], ['apple', 'fixed', 1, 0, 1, 1]] },
      { key: 'ragi', name: 'Ragi malt with milk', region: 'S', items: [['ragi', 'carb', 1, 0.5, 2, 0.5], [MILK, 'fixed', 1, 1, 1, 1], [P_BFAST, 'protein', 1, 0, 4, 1], [['almonds', 'flax'], 'fat', 1, 0, 3, 1]] },
    ],
    lunch: [
      { key: 'roti_dal', name: 'Roti, dal, sabzi and salad', region: 'N', items: [['roti', 'carb', 2, 1, 5, 1], ['dal', 'fixed', 1, 0.5, 1.5, 0.5], [VEG, 'fixed', 1, 1, 1, 1], [SALAD, 'fixed', 1, 1, 1, 1], [P_MAIN, 'protein', 1, 0, 3, 0.5], ['oil', 'fat', 0, 0, 2, 0.5]] },
      { key: 'rice_sambar', name: 'Rice, sambar, poriyal and curd', region: 'S', items: [['rice', 'carb', 1, 0.5, 2.5, 0.5], ['sambar', 'fixed', 1, 1, 1.5, 0.5], [VEG, 'fixed', 1, 1, 1, 1], [DAIRY, 'fixed', 1, 0, 1, 1], [P_MAIN, 'protein', 1, 0, 3, 0.5], ['oil', 'fat', 0, 0, 2, 0.5]] },
      { key: 'rice_rajma', name: 'Rice with rajma or chole', region: 'N', items: [['rice', 'carb', 1, 0.5, 2.5, 0.5], [{ nonveg: ['rajma'], egg: ['rajma'], veg: ['rajma'], jain: ['dal'], vegan: ['chole'] }, 'fixed', 1, 1, 1.5, 0.5], [SALAD, 'fixed', 1, 1, 1, 1], [P_MAIN, 'protein', 1, 0, 3, 0.5], [DAIRY, 'fixed', 1, 0, 1, 1]] },
      { key: 'millet', name: 'Jowar bhakri, dal and greens', region: 'A', items: [['jowar', 'carb', 2, 1, 4, 1], ['dal', 'fixed', 1, 0.5, 1.5, 0.5], ['greens', 'fixed', 1, 1, 1, 1], [P_MAIN, 'protein', 1, 0, 3, 0.5], ['ghee', 'fat', 0.5, 0, 2, 0.5]] },
    ],
    dinner: [
      { key: 'roti_protein', name: 'Roti with a protein dish and sabzi', region: 'N', items: [['roti', 'carb', 2, 1, 4, 1], [P_MAIN, 'protein', 1, 0.5, 3, 0.5], [VEG, 'fixed', 1, 1, 1, 1], [SALAD, 'fixed', 1, 1, 1, 1], ['oil', 'fat', 0, 0, 2, 0.5]] },
      { key: 'rice_dal', name: 'Rice, dal and a protein', region: 'A', items: [['rice', 'carb', 1, 0.5, 2, 0.5], ['dal', 'fixed', 1, 0.5, 1.5, 0.5], [P_LEAN, 'protein', 1, 0, 3, 0.5], ['beans', 'fixed', 1, 1, 1, 1], ['oil', 'fat', 0, 0, 2, 0.5]] },
      { key: 'dosa_dinner', name: 'Dosa with a protein and sambar', region: 'S', items: [['dosa', 'carb', 2, 1, 4, 1], ['sambar', 'fixed', 1, 1, 1, 1], [P_LEAN, 'protein', 1, 0, 3, 0.5], ['chutney', 'fat', 0.5, 0, 1.5, 0.5]] },
      { key: 'quinoa', name: 'Quinoa bowl', region: 'A', items: [['quinoa', 'carb', 1, 0.5, 2, 0.5], [P_LEAN, 'protein', 1, 0.5, 3, 0.5], ['beans', 'fixed', 1, 1, 1, 1], [SALAD, 'fixed', 1, 1, 1, 1], ['oil', 'fat', 1, 0, 2, 0.5]] },
    ],
    snack: [
      { key: 'fruit_nuts', name: 'Fruit and nuts', region: 'A', items: [[['apple', 'guava', 'papaya', 'orange'], 'carb', 1, 0.5, 2, 0.5], [['almonds', 'walnuts', 'peanuts'], 'fat', 1, 0, 2, 1], [SNACK_P, 'protein', 0, 0, 2, 1]] },
      { key: 'chana', name: 'Roasted chana and buttermilk', region: 'A', items: [['chana', 'carb', 1, 0.5, 2, 0.5], [{ nonveg: ['buttermilk'], egg: ['buttermilk'], veg: ['buttermilk'], jain: ['buttermilk'], vegan: ['soymilk'] }, 'fixed', 1, 1, 1, 1], [SNACK_P, 'protein', 0, 0, 2, 1]] },
      { key: 'yoghurt', name: 'Greek yoghurt with fruit', region: 'A', diets: ['veg', 'egg', 'nonveg', 'jain'], items: [['greek', 'protein', 1, 0.5, 2, 0.5], [['banana', 'pomegranate', 'papaya'], 'carb', 0.5, 0, 1.5, 0.5], [['chia', 'flax'], 'fat', 1, 0, 2, 1]] },
      { key: 'makhana', name: 'Makhana and tea', region: 'A', diets: ['veg', 'egg', 'nonveg', 'jain'], items: [['makhana', 'carb', 1, 0.5, 2, 0.5], ['tea', 'fixed', 1, 1, 1, 1], [SNACK_P, 'protein', 0, 0, 2, 1]] },
    ],
    bedtime: [
      { key: 'milk', name: 'Warm milk', region: 'A', items: [[MILK, 'fixed', 1, 1, 1, 1], [SNACK_P, 'protein', 0, 0, 1, 1], [['almonds', 'walnuts'], 'fat', 0, 0, 1, 1]] },
    ],
  };
  // Jain clients: no onion, garlic or root vegetables in any dish — told in the plan notes

  // -------------------------------------------------------------- helpers
  // the first food in the list that suits the client; for protein foods, the one used least
  // so far today (paneer at every meal is a poor plan)
  const pickFood = (choice, diet, allergies, used) => {
    const ids = (typeof choice === 'string' ? [choice] : Array.isArray(choice) ? choice : (choice[diet] || [])).filter((id) => F.fits(FOODS[id], diet, allergies));
    if (!used || ids.length < 2) return ids[0] || null;
    return ids.map((id, i) => ({ id, n: (used[id] || 0) * 10 + i })).sort((a, b) => a.n - b.n)[0].id;
  };
  const per = (food, units) => {
    const g = food.grams * units, k = g / 100;
    return { g, kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k, fib: food.fib * k };
  };
  const sum = (items) => items.reduce((t, it) => { const x = per(FOODS[it.id], it.units); t.kcal += x.kcal; t.p += x.p; t.c += x.c; t.f += x.f; t.fib += x.fib; return t; },
    { kcal: 0, p: 0, c: 0, f: 0, fib: 0 });
  const snap = (v, it) => Math.min(it.max, Math.max(it.min, Math.round(v / it.step) * it.step));

  // move the protein, carb and fat items of one meal towards its share of the targets
  function sizeItems(items, target) {
    for (let round = 0; round < 12; round++) {
      let changed = false;
      for (const role of ['protein', 'carb', 'fat']) {
        const s = sum(items);
        const key = role === 'protein' ? 'p' : role === 'carb' ? 'c' : 'f';
        const err = target[key] - s[key];
        const movers = items.filter((x) => x.role === role);
        if (!movers.length || Math.abs(err) < (role === 'fat' ? 2 : 4)) continue;
        for (const it of movers) {
          const perUnit = per(FOODS[it.id], 1)[key];
          if (perUnit <= 0.1) continue;
          const want = snap(it.units + (err / movers.length) / perUnit, it);
          if (want !== it.units) { it.units = want; changed = true; }
        }
      }
      if (!changed) break;
    }
  }

  // build one meal from a template, then size the adjustable items to hit its share of the targets
  function buildMeal(tpl, target, ctx, used = null) {
    const items = [];
    for (const [choice, role, def, min, max, step] of tpl.items) {
      const id = pickFood(choice, ctx.diet, ctx.allergies, role === 'protein' ? used : null);
      if (!id) continue;
      if (ctx.lowGI && FOODS[id].group === 'sugar') continue;
      const dup = items.find((x) => x.id === id);
      if (dup) { dup.max = Math.max(dup.max, max); continue; }
      items.push({ id, role, units: def, min, max, step });
    }
    sizeItems(items, target);
    const kept = items.filter((x) => x.units > 0);
    return { key: tpl.key, name: tpl.name, items: kept, totals: sum(kept) };
  }

  // the best-fitting template for a slot (region first, then how close it gets)
  function chooseTemplate(slot, target, ctx, avoid = [], used = null) {
    const list = (T[slot] || T.snack).filter((t) => (!t.diets || t.diets.includes(ctx.diet)) && !avoid.includes(t.key));
    const scored = list.map((t) => {
      const m = buildMeal(t, target, ctx, used);
      const tt = m.totals;
      const miss = Math.abs(tt.kcal - target.kcal) / Math.max(target.kcal, 1) + Math.abs(tt.p - target.p) / Math.max(target.p, 5) * 0.8
        + Math.max(0, tt.f - target.f) / Math.max(target.f, 5) * 0.5;
      const regionPenalty = ctx.cuisine === 'mixed' || t.region === 'A' || t.region === (ctx.cuisine === 'south' ? 'S' : 'N') ? 0 : 0.6;
      return { t, m, score: miss + regionPenalty + (ctx.seed ? ((hash(t.key + ctx.seed) % 100) / 100) * 0.35 : 0) };
    }).sort((a, b) => a.score - b.score);
    return scored[0] ? scored[0].m : null;
  }
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  // -------------------------------------------------------------- the day plan
  // targets: from FLCalc.targets(). ctx: { diet, cuisine, meals, allergies[], conditions[], seed }
  function buildDay(targets, ctx) {
    const c = { diet: ctx.diet || 'veg', cuisine: ctx.cuisine || 'mixed', allergies: ctx.allergies || [], seed: ctx.seed || '',
      lowGI: (ctx.conditions || []).some((x) => ['diabetes', 'prediabetes', 'pcos'].includes(x)) };
    const pattern = PATTERNS[ctx.meals] || PATTERNS[5];
    const used = [], proteins = {};
    const meals = pattern.map(([slot, label, time, kShare, pShare]) => {
      const target = { kcal: targets.kcal * kShare, p: targets.protein * pShare, c: targets.carbs * kShare, f: targets.fat * kShare };
      const m = chooseTemplate(slot, target, c, used, proteins);
      if (m) { used.push(m.key); m.items.filter((x) => x.role === 'protein').forEach((x) => { proteins[x.id] = (proteins[x.id] || 0) + 1; }); }
      return { slot, label, time, target, ...(m || { key: null, name: '—', items: [], totals: { kcal: 0, p: 0, c: 0, f: 0, fib: 0 } }) };
    });
    fitDay(meals, targets);
    return { meals, totals: dayTotals(meals), targets, ctx: c, notes: notesFor(ctx, targets) };
  }
  // the whole day: correct the calories with the carb items first, then the fats, then the side dishes
  // (protein is left alone), and trim any extra fat
  function fitDay(meals, targets) {
    // the whole day: if it is more than 4% off the calories, move the carb items first,
    // then the fats, then the side dishes (dal, curd…) — protein is left alone
    for (const roles of [['carb'], ['carb'], ['fat'], ['fixed'], ['carb']]) {
      const day = dayTotals(meals);
      const err = targets.kcal - day.kcal;
      if (Math.abs(err) / targets.kcal < 0.04) break;
      const movers = meals.flatMap((m) => m.items.filter((x) => roles.includes(x.role) && (err > 0 ? x.units < x.max : x.units > x.min)));
      for (const it of movers) {
        const k1 = per(FOODS[it.id], 1).kcal;
        if (k1 < 1) continue;
        it.units = snap(it.units + (err / movers.length) / k1, it);
      }
      meals.forEach((m) => { m.items = m.items.filter((x) => x.units > 0); m.totals = sum(m.items); });
    }
    // too much fat for the day: trim the added fats (oil, ghee, nuts, chutney), then put the calories back as carbs
    const fatOver = dayTotals(meals).f - targets.fat;
    if (fatOver > targets.fat * 0.1) {
      const fats = meals.flatMap((m) => m.items.filter((x) => x.role === 'fat' && x.units > x.min));
      let left = fatOver;
      for (const it of fats.sort((a, b) => per(FOODS[b.id], b.units).f - per(FOODS[a.id], a.units).f)) {
        if (left <= 1) break;
        const f1 = per(FOODS[it.id], 1).f; if (f1 < 0.5) continue;
        const cut = Math.min(it.units - it.min, Math.ceil(left / f1 / it.step) * it.step);
        it.units = snap(it.units - cut, it); left -= cut * f1;
      }
      for (let i = 0; i < 2; i++) {
        const err = targets.kcal - dayTotals(meals).kcal;
        if (Math.abs(err) / targets.kcal < 0.03) break;
        const movers = meals.flatMap((m) => m.items.filter((x) => x.role === 'carb' && (err > 0 ? x.units < x.max : x.units > x.min)));
        for (const it of movers) { const k1 = per(FOODS[it.id], 1).kcal; if (k1 >= 1) it.units = snap(it.units + (err / movers.length) / k1, it); }
      }
      meals.forEach((m) => { m.items = m.items.filter((x) => x.units > 0); m.totals = sum(m.items); });
    }
  }
  const dayTotals = (meals) => meals.reduce((t, m) => { const s = sum(m.items); t.kcal += s.kcal; t.p += s.p; t.c += s.c; t.f += s.f; t.fib += s.fib; return t; }, { kcal: 0, p: 0, c: 0, f: 0, fib: 0 });

  // how a food behaves in the portion maths, for meals not built from a template (Coach AI)
  const ROLE = { grain: 'carb', fruit: 'carb', snack: 'carb', protein: 'protein', nut: 'fat', fat: 'fat', sugar: 'fixed', pulse: 'fixed', dairy: 'fixed', veg: 'fixed', drink: 'fixed' };
  function itemFor(id, units) {
    const f = FOODS[id]; if (!f) return null;
    const role = f.id === 'greek' || f.id === 'whey' ? 'protein' : (ROLE[f.group] || 'fixed');
    const step = f.grams >= 100 || ['katori', 'plate', 'bowl', 'glass', 'cup'].some((w) => f.unit.startsWith(w)) ? 0.5 : 1;
    const u = Math.max(step, Math.round((+units || 1) / step) * step);
    // a food chosen on purpose stays in the meal (at least one step); side dishes keep their size
    const half = Math.max(step, Math.round(u / 2 / step) * step);
    const max = role === 'carb' ? Math.max(u * 3, 4) : role === 'protein' ? Math.max(u * 2.5, 4) : role === 'fat' ? Math.max(u * 3, 3) : Math.max(u * 1.5, u + step);
    return { id, role, units: u, min: role === 'fat' ? 0 : role === 'fixed' ? half : step, max: Math.round(max / step) * step, step };
  }
  // size meals someone else chose (Coach AI) to the targets with the same maths as the builder
  function fitMeals(meals, targets, ctx) {
    const pattern = PATTERNS[meals.length] || null;
    meals.forEach((m, i) => {
      const share = pattern && pattern[i] ? pattern[i] : [m.slot, m.label, m.time, 1 / meals.length, 1 / meals.length];
      m.target = { kcal: targets.kcal * share[3], p: targets.protein * share[4], c: targets.carbs * share[3], f: targets.fat * share[3] };
      m.items = m.items.filter((x) => FOODS[x.id] && F.fits(FOODS[x.id], ctx.diet, ctx.allergies || []));
      sizeItems(m.items, m.target);
      m.items = m.items.filter((x) => x.units > 0); m.totals = sum(m.items);
    });
    // short of protein: raise or add a protein food in the meal that is furthest below its share
    for (let pass = 0; pass < 4; pass++) {
      const day = dayTotals(meals), gap = targets.protein - day.p;
      if (gap / targets.protein < 0.06) break;
      const m = [...meals].sort((a, b) => (b.target.p - sum(b.items).p) - (a.target.p - sum(a.items).p))[0];
      let it = m.items.find((x) => x.role === 'protein' && x.units < x.max);
      if (!it) {
        // the leanest protein food that suits the client and isn't already in this meal
        const pool = [...new Set([...(P_LEAN[ctx.diet] || []), ...(P_MAIN[ctx.diet] || []), ...(SNACK_P[ctx.diet] || [])])]
          .filter((id) => FOODS[id] && F.fits(FOODS[id], ctx.diet, ctx.allergies || []) && !m.items.some((x) => x.id === id) && FOODS[id].meals.includes({ breakfast: 'b', lunch: 'l', dinner: 'd' }[m.slot] || 's'));
        const id = pool.sort((a, b) => FOODS[b].p / FOODS[b].kcal - FOODS[a].p / FOODS[a].kcal)[0];
        if (!id) break;
        it = itemFor(id, 0); it.units = 0; it.min = 0; m.items.push(it);
      }
      const p1 = per(FOODS[it.id], 1).p;
      it.units = snap(it.units + Math.max(it.step, Math.min(gap, m.target.p) / p1), it);
      m.totals = sum(m.items);
    }
    fitDay(meals, targets);
    // still well short of calories (no starch chosen, say): add a staple to the meals that need it most
    const STAPLE = { breakfast: ['oats', 'poha', 'idli', 'bread_brown', 'ragi'], lunch: ['rice', 'roti', 'jowar', 'quinoa'], dinner: ['roti', 'rice', 'jowar', 'quinoa'], snack: ['banana', 'apple', 'chana', 'makhana'], bedtime: ['banana'] };
    for (let pass = 0; pass < 4; pass++) {
      if (dayTotals(meals).kcal >= targets.kcal * 0.94) break;
      const m = [...meals].sort((a, b) => (b.target.kcal - sum(b.items).kcal) - (a.target.kcal - sum(a.items).kcal))[0];
      if (m.items.some((x) => x.role === 'carb' && x.units < x.max)) { fitDay(meals, targets); if (dayTotals(meals).kcal >= targets.kcal * 0.94) break; }
      const id = (STAPLE[m.slot] || STAPLE.snack).find((k) => FOODS[k] && F.fits(FOODS[k], ctx.diet, ctx.allergies || []) && !m.items.some((x) => x.id === k));
      if (!id) break;
      const it = itemFor(id, 1); it.min = 0;
      it.units = snap((m.target.kcal - sum(m.items).kcal) / per(FOODS[id], 1).kcal, it);
      if (it.units > 0) m.items.push(it);
      m.totals = sum(m.items);
    }
    meals.forEach((m) => { m.items = m.items.filter((x) => x.units > 0); m.totals = sum(m.items); });
    return meals;
  }

  // swap one meal for the next-best template
  function reshuffle(plan, index) {
    const m = plan.meals[index];
    const others = plan.meals.filter((_, i) => i !== index);
    const proteins = {}; others.forEach((x) => x.items.filter((y) => y.role === 'protein').forEach((y) => { proteins[y.id] = (proteins[y.id] || 0) + 1; }));
    const next = chooseTemplate(m.slot, m.target, plan.ctx, [m.key, ...others.map((x) => x.key)], proteins) || chooseTemplate(m.slot, m.target, plan.ctx, [m.key], proteins);
    if (next) plan.meals[index] = { ...m, ...next };
    plan.totals = dayTotals(plan.meals);
    return plan;
  }
  function recalc(plan) { plan.meals.forEach((m) => { m.totals = sum(m.items); }); plan.totals = dayTotals(plan.meals); return plan; }

  // foods that can replace an item (same group, suits the diet and allergies)
  function swapsFor(id, ctx) {
    const f = FOODS[id]; if (!f) return [];
    return Object.values(FOODS).filter((x) => x.id !== id && x.group === f.group && F.fits(x, ctx.diet, ctx.allergies)).map((x) => x.id);
  }

  // -------------------------------------------------------------- guidance by condition (screening answers)
  const CONDITIONS = [
    ['diabetes', 'Diabetes (on treatment)'], ['prediabetes', 'Prediabetes / high sugar'], ['hypertension', 'High blood pressure'],
    ['cholesterol', 'High cholesterol / triglycerides'], ['thyroid', 'Thyroid condition'], ['pcos', 'PCOS / PCOD'],
    ['kidney', 'Kidney disease'], ['heart', 'Heart disease'], ['liver', 'Fatty liver'], ['pregnant', 'Pregnant'],
    ['breastfeeding', 'Breastfeeding'], ['eating_disorder', 'Eating disorder (now or before)'], ['gut', 'IBS / acidity / gut issues'],
  ];
  const REFER = ['diabetes', 'kidney', 'heart', 'pregnant', 'breastfeeding', 'eating_disorder'];
  function notesFor(ctx, t) {
    const n = [], cond = ctx.conditions || [];
    const refer = cond.filter((x) => REFER.includes(x));
    if (refer.length) n.push({ kind: 'refer', text: 'Work alongside the client\'s doctor or a registered dietitian: ' + refer.map((x) => (CONDITIONS.find((c) => c[0] === x) || [x, x])[1].toLowerCase()).join(', ') + '. Share this plan with them before starting.' });
    if (cond.includes('pregnant') || cond.includes('breastfeeding')) n.push({ kind: 'warn', text: 'No calorie deficit during pregnancy or breastfeeding. ICMR-NIN advises about +350 kcal a day in the 2nd and 3rd trimesters and more while breastfeeding — follow the doctor\'s advice.' });
    if (cond.includes('eating_disorder')) n.push({ kind: 'warn', text: 'With an eating-disorder history, avoid calorie counting and deficits unless the treating team agrees.' });
    if (cond.includes('kidney')) n.push({ kind: 'warn', text: 'Kidney disease: protein is usually limited to about 0.8 g/kg (KDIGO 2024), and potassium and phosphorus may need limits too — only a renal dietitian should set these.' });
    if (cond.includes('diabetes') || cond.includes('prediabetes')) n.push({ kind: 'tip', text: 'Blood sugar: whole grains and millets over white rice and maida, dal or protein with every meal, no sugary drinks, sweets or juice. Spread carbs evenly. If on insulin or sulphonylureas, meals must be regular — never skip.' });
    if (cond.includes('hypertension')) n.push({ kind: 'tip', text: 'Blood pressure: under 5 g of salt a day (one level teaspoon, all foods included) — cut pickles, papad, packaged snacks and sauces. More fruit, vegetables and curd (WHO; DASH diet).' });
    if (cond.includes('cholesterol') || cond.includes('heart')) n.push({ kind: 'tip', text: 'Heart health: cook in oil rather than ghee or butter, keep saturated fat under 10% of calories, add oats, nuts, seeds and plenty of fibre; avoid fried and bakery foods.' });
    if (cond.includes('liver')) n.push({ kind: 'tip', text: 'Fatty liver: losing 7–10% of body weight helps most; avoid sugary drinks and alcohol.' });
    if (cond.includes('thyroid')) n.push({ kind: 'tip', text: 'Thyroid: take thyroid tablets on an empty stomach, 30–60 minutes before tea, coffee, milk or breakfast, as the doctor advised.' });
    if (cond.includes('pcos')) n.push({ kind: 'tip', text: 'PCOS: steady weight loss of 5–10% improves cycles and insulin resistance; favour high-fibre carbs and protein at each meal.' });
    if (cond.includes('gut')) n.push({ kind: 'tip', text: 'Gut issues: smaller, regular meals; go easy on spicy, fried and very oily food; add fibre slowly with plenty of water.' });
    if (ctx.diet === 'jain') n.push({ kind: 'tip', text: 'Jain plan: cook every dish without onion, garlic, potato or other root vegetables.' });
    if (ctx.diet === 'vegan') n.push({ kind: 'tip', text: 'Vegan: vitamin B12 is found only in animal foods and fortified products — a B12 check and supplement are usually needed. Ask the doctor.' });
    n.push({ kind: 'tip', text: `Drink about ${(Math.round(t.water * 10) / 10)} litres of water a day, plus 0.5–1 litre for each hour of exercise.` });
    n.push({ kind: 'tip', text: 'Cook with measured oil (a teaspoon is 5 g). Weigh foods for the first two weeks — it makes the plan accurate.' });
    return n;
  }

  // -------------------------------------------------------------- how a portion reads: "2 rotis (80 g)", "1½ katori (225 g)", "20 almonds (24 g)"
  const frac = (u) => { const w = Math.floor(u + 1e-9), r = Math.round((u - w) * 100) / 100;
    const t = r === 0.5 ? '½' : r === 0.25 ? '¼' : r === 0.75 ? '¾' : r ? String(r).replace(/^0/, '') : '';
    return r && !t.startsWith('.') ? (w ? w + t : t) : String(Math.round(u * 100) / 100); };
  const NO_PLURAL = /^(tsp|tbsp|medium)$/;
  const plural = (w, n) => (n < 2 || NO_PLURAL.test(w) ? w : /(ss|sh|ch)$/.test(w) ? w + 'es' : /piece$/.test(w) ? w + 's' : /[^s]$/.test(w) ? w + 's' : w);
  function amount(food, units) {
    if (!food) return '';
    const base = food.unit.replace(/\s*\(.*\)\s*$/, '').trim();
    const ml = /(\d+)\s*ml/.exec(food.unit);
    const size = ml ? `${Math.round(+ml[1] * units)} ml` : `${Math.round(food.grams * units)} g`;
    // weighed foods: "150 g cooked", "60 g dry"
    const gm = /^(\d+)\s*g\b(.*)$/.exec(base);
    if (gm) return `${Math.round(food.grams * units)} g${gm[2]}`;
    // counted units with a number inside: "10 almonds", "½ cup", "2 tbsp"
    const nm = /^(\d+|½|¼)\s+(.+)$/.exec(base);
    if (nm) { const n = (nm[1] === '½' ? 0.5 : nm[1] === '¼' ? 0.25 : +nm[1]) * units; return `${frac(n)} ${nm[2]} (${size})`; }
    return `${frac(units)} ${plural(base, units)} (${size})`;
  }

  const api = { PATTERNS, TEMPLATES: T, CONDITIONS, buildDay, reshuffle, recalc, swapsFor, per, sum, dayTotals, amount, frac, sizeItems, fitDay, fitMeals, itemFor, notesFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FLDiet = api;
})(typeof window !== 'undefined' ? window : globalThis);
