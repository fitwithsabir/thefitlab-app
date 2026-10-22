/* =====================================================================
   The Fit Lab — Indian food database for the diet builder
   Values are per 100 g of the food as eaten (cooked unless it says dry).
   Sources: Indian Food Composition Tables 2017 (NIN-ICMR) for Indian grains,
   millets and pulses; USDA FoodData Central (SR Legacy / Foundation) for
   generic foods; home recipes (dal, sabzi, curries, poha, upma, chutney) are
   worked out from their ingredients and are approximate — oil and recipe
   change them, so weigh and adjust for each client.
   Fields: id, name, group, kcal, protein g, carbs g, fat g, fibre g,
           unit name, grams per unit, diets, meals, region, allergens
   diets:   v vegetarian · vg vegan · e egg · n non-veg · j Jain-friendly
   meals:   b breakfast · l lunch · d dinner · s snack
   region:  N north · S south · A anywhere
   ===================================================================== */
(function (root) {
  'use strict';
  const R = [
    // grains, breads and millets
    ['rice', 'Rice, white (cooked)', 'grain', 130, 2.7, 28.2, 0.3, 0.4, 'katori', 150, 'v vg j e n', 'l d', 'A', ''],
    ['rice_brown', 'Brown rice (cooked)', 'grain', 123, 2.7, 25.6, 1.0, 1.6, 'katori', 150, 'v vg j e n', 'l d', 'A', ''],
    ['roti', 'Roti / phulka (whole wheat, no ghee)', 'grain', 264, 8.7, 50.5, 1.4, 8.0, 'roti (40 g)', 40, 'v vg j e n', 'b l d', 'N', 'gluten'],
    ['paratha', 'Plain paratha (with oil)', 'grain', 320, 7.0, 45.0, 12.5, 5.0, 'paratha (70 g)', 70, 'v vg j e n', 'b l d', 'N', 'gluten'],
    ['idli', 'Idli', 'grain', 139, 4.5, 28.8, 0.4, 1.5, 'idli (40 g)', 40, 'v vg j e n', 'b d', 'S', ''],
    ['dosa', 'Plain dosa (light oil)', 'grain', 168, 3.9, 29.0, 3.7, 1.0, 'dosa (80 g)', 80, 'v vg j e n', 'b d', 'S', ''],
    ['ragi', 'Ragi / finger millet flour (dry)', 'grain', 321, 7.2, 66.8, 1.9, 11.2, '30 g (1 ragi roti or mudde)', 30, 'v vg j e n', 'b l d', 'S', ''],
    ['jowar', 'Jowar flour (dry, for bhakri)', 'grain', 334, 10.0, 67.7, 1.7, 10.2, 'bhakri (35 g flour)', 35, 'v vg j e n', 'l d', 'A', ''],
    ['bajra', 'Bajra flour (dry, for roti)', 'grain', 348, 11.0, 61.8, 5.4, 11.5, 'roti (35 g flour)', 35, 'v vg j e n', 'l d', 'N', ''],
    ['oats', 'Rolled oats (dry)', 'grain', 379, 13.2, 67.7, 6.5, 10.1, '½ cup (40 g)', 40, 'v vg j e n', 'b s', 'A', ''],
    ['daliya', 'Daliya / broken wheat (dry)', 'grain', 342, 12.3, 75.9, 1.3, 12.5, '40 g dry', 40, 'v vg j e n', 'b', 'N', 'gluten'],
    ['poha', 'Poha (cooked, light oil)', 'grain', 158, 2.9, 27.5, 4.0, 1.2, 'plate (150 g)', 150, 'v vg e n', 'b s', 'A', ''],
    ['upma', 'Rava upma', 'grain', 135, 3.4, 20.5, 4.3, 1.5, 'plate (180 g)', 180, 'v vg e n', 'b', 'S', 'gluten'],
    ['bread_brown', 'Whole-wheat (brown) bread', 'grain', 252, 12.4, 42.7, 3.5, 6.0, 'slice (30 g)', 30, 'v e n', 'b s', 'A', 'gluten'],
    ['quinoa', 'Quinoa (cooked)', 'grain', 120, 4.4, 21.3, 1.9, 2.8, 'katori (150 g)', 150, 'v vg j e n', 'l d', 'A', ''],
    ['potato', 'Potato (boiled)', 'grain', 87, 1.9, 20.1, 0.1, 1.8, 'medium (100 g)', 100, 'v vg e n', 'l d s', 'A', ''],
    ['sweet_potato', 'Sweet potato (boiled)', 'grain', 76, 1.4, 17.7, 0.1, 2.5, 'medium (100 g)', 100, 'v vg e n', 's l', 'A', ''],
    ['makhana', 'Makhana / fox nuts (dry-roasted)', 'snack', 347, 9.7, 76.9, 0.1, 7.0, 'cup (15 g)', 15, 'v vg j e n', 's', 'A', ''],
    // pulses, soya and other plant protein
    ['dal', 'Dal — toor / moong / masoor (cooked, with tadka)', 'pulse', 106, 5.4, 13.8, 2.9, 2.3, 'katori (150 g)', 150, 'v vg j e n', 'l d', 'A', ''],
    ['sambar', 'Sambar', 'pulse', 65, 3.0, 9.0, 2.0, 2.5, 'katori (150 g)', 150, 'v vg e n', 'b l d', 'S', ''],
    ['rajma', 'Rajma curry', 'pulse', 134, 6.5, 17.0, 4.5, 5.0, 'katori (150 g)', 150, 'v vg e n', 'l d', 'N', ''],
    ['chole', 'Chole / chickpea curry', 'pulse', 152, 6.8, 19.0, 5.5, 6.0, 'katori (150 g)', 150, 'v vg e n', 'l d', 'N', ''],
    ['besan', 'Besan / gram flour (dry, for chilla)', 'pulse', 387, 22.4, 57.8, 6.7, 10.8, 'chilla (40 g besan)', 40, 'v vg j e n', 'b s', 'A', ''],
    ['soya', 'Soya chunks (dry weight)', 'protein', 345, 52.0, 33.0, 0.5, 13.0, '30 g dry', 30, 'v vg j e n', 'l d', 'A', 'soy'],
    ['tofu', 'Tofu (firm)', 'protein', 144, 17.3, 2.8, 8.7, 2.3, '100 g', 100, 'v vg j e n', 'b l d', 'A', 'soy'],
    ['chana', 'Roasted chana', 'snack', 369, 22.5, 58.0, 5.2, 16.0, 'handful (30 g)', 30, 'v vg j e n', 's', 'A', ''],
    ['peanuts', 'Peanuts (roasted, no salt)', 'nut', 567, 25.8, 16.1, 49.2, 8.5, 'handful (20 g)', 20, 'v vg j e n', 'b s', 'A', 'peanut'],
    // dairy
    ['milk', 'Milk, toned (3% fat)', 'dairy', 58, 3.1, 4.7, 3.0, 0, 'glass (200 ml)', 200, 'v j e n', 'b s', 'A', 'dairy'],
    ['milk_dt', 'Milk, double-toned (1.5% fat)', 'dairy', 46, 3.1, 4.9, 1.5, 0, 'glass (200 ml)', 200, 'v j e n', 'b s', 'A', 'dairy'],
    ['soymilk', 'Soy milk, unsweetened', 'dairy', 33, 2.9, 1.7, 1.6, 0.4, 'glass (200 ml)', 200, 'v vg j e n', 'b s', 'A', 'soy'],
    ['curd', 'Curd / dahi (toned milk)', 'dairy', 60, 3.2, 4.6, 3.2, 0, 'katori (100 g)', 100, 'v j e n', 'l d s', 'A', 'dairy'],
    ['greek', 'Greek yoghurt, plain, low-fat', 'dairy', 59, 10.2, 3.6, 0.4, 0, 'cup (150 g)', 150, 'v j e n', 'b s', 'A', 'dairy'],
    ['paneer', 'Paneer (full-fat)', 'protein', 265, 18.3, 1.2, 20.8, 0, '50 g', 50, 'v j e n', 'b l d s', 'A', 'dairy'],
    ['paneer_lf', 'Paneer, low-fat', 'protein', 198, 24.0, 3.0, 10.0, 0, '50 g', 50, 'v j e n', 'b l d s', 'A', 'dairy'],
    ['buttermilk', 'Buttermilk / chaas (unsweetened)', 'dairy', 25, 1.3, 1.9, 1.4, 0, 'glass (250 ml)', 250, 'v j e n', 'l s', 'A', 'dairy'],
    ['whey', 'Whey protein (check the label)', 'protein', 390, 78.0, 8.0, 5.0, 0, 'scoop (30 g)', 30, 'v j e n', 'b s', 'A', 'dairy'],
    ['tea', 'Tea with milk and 1 tsp sugar', 'drink', 38, 1.2, 5.5, 1.2, 0, 'cup (150 ml)', 150, 'v j e n', 'b s', 'A', 'dairy'],
    // eggs, meat and fish
    ['egg', 'Egg, whole (boiled)', 'protein', 155, 12.6, 1.1, 10.6, 0, 'egg (50 g)', 50, 'e n', 'b l d s', 'A', 'egg'],
    ['egg_white', 'Egg white', 'protein', 52, 10.9, 0.7, 0.2, 0, 'white (33 g)', 33, 'e n', 'b s', 'A', 'egg'],
    ['chicken', 'Chicken breast, cooked (skinless)', 'protein', 165, 31.0, 0, 3.6, 0, '100 g cooked', 100, 'n', 'l d', 'A', ''],
    ['chicken_curry', 'Chicken curry (home-style)', 'protein', 148, 14.0, 4.0, 8.5, 0.8, 'katori (150 g)', 150, 'n', 'l d', 'A', ''],
    ['fish', 'Fish, cooked (rohu / surmai / pomfret)', 'protein', 137, 22.0, 0, 5.5, 0, '100 g', 100, 'n', 'l d', 'A', 'fish'],
    ['prawns', 'Prawns, cooked', 'protein', 99, 24.0, 0.2, 0.3, 0, '100 g', 100, 'n', 'l d', 'A', 'shellfish'],
    ['mutton', 'Mutton curry', 'protein', 202, 16.0, 3.0, 14.0, 0.5, 'katori (150 g)', 150, 'n', 'l d', 'A', ''],
    ['tuna', 'Tuna, canned in water', 'protein', 116, 25.5, 0, 0.8, 0, '100 g', 100, 'n', 'l d s', 'A', 'fish'],
    // vegetables
    ['sabzi', 'Mixed vegetable sabzi (with oil)', 'veg', 91, 2.5, 9.0, 5.0, 3.0, 'katori (150 g)', 150, 'v vg e n', 'l d', 'A', ''],
    ['greens', 'Palak / leafy greens sabzi', 'veg', 75, 3.0, 5.0, 5.0, 3.0, 'katori (150 g)', 150, 'v vg j e n', 'l d', 'A', ''],
    ['salad', 'Salad — cucumber, tomato, carrot', 'veg', 20, 0.9, 4.0, 0.2, 1.2, 'plate (100 g)', 100, 'v vg e n', 'l d', 'A', ''],
    ['cucumber', 'Cucumber', 'veg', 15, 0.7, 3.6, 0.1, 0.5, 'medium (150 g)', 150, 'v vg j e n', 'l d s', 'A', ''],
    ['beans', 'Beans / broccoli (steamed)', 'veg', 35, 2.4, 7.2, 0.4, 3.3, 'katori (100 g)', 100, 'v vg j e n', 'l d', 'A', ''],
    ['rasam', 'Rasam', 'veg', 30, 1.0, 4.5, 1.0, 0.5, 'katori (150 g)', 150, 'v vg e n', 'l d', 'S', ''],
    // fruit
    ['banana', 'Banana', 'fruit', 89, 1.1, 22.8, 0.3, 2.6, 'medium (120 g)', 120, 'v vg j e n', 'b s', 'A', ''],
    ['apple', 'Apple', 'fruit', 52, 0.3, 13.8, 0.2, 2.4, 'medium (150 g)', 150, 'v vg j e n', 'b s', 'A', ''],
    ['papaya', 'Papaya', 'fruit', 43, 0.5, 10.8, 0.3, 1.7, 'bowl (150 g)', 150, 'v vg j e n', 'b s', 'A', ''],
    ['guava', 'Guava', 'fruit', 68, 2.6, 14.3, 1.0, 5.4, 'medium (100 g)', 100, 'v vg j e n', 's', 'A', ''],
    ['orange', 'Orange', 'fruit', 47, 0.9, 11.8, 0.1, 2.4, 'medium (130 g)', 130, 'v vg j e n', 's', 'A', ''],
    ['watermelon', 'Watermelon', 'fruit', 30, 0.6, 7.6, 0.2, 0.4, 'bowl (200 g)', 200, 'v vg j e n', 's', 'A', ''],
    ['pomegranate', 'Pomegranate', 'fruit', 83, 1.7, 18.7, 1.2, 4.0, '½ cup seeds (90 g)', 90, 'v vg j e n', 'b s', 'A', ''],
    ['dates', 'Dates', 'fruit', 277, 1.8, 75.0, 0.2, 6.7, 'date (8 g)', 8, 'v vg j e n', 's', 'A', ''],
    // nuts, seeds and fats
    ['almonds', 'Almonds', 'nut', 579, 21.2, 21.6, 49.9, 12.5, '10 almonds (12 g)', 12, 'v vg j e n', 'b s', 'A', 'treenut'],
    ['walnuts', 'Walnuts', 'nut', 654, 15.2, 13.7, 65.2, 6.7, '5 halves (10 g)', 10, 'v vg j e n', 'b s', 'A', 'treenut'],
    ['cashews', 'Cashews', 'nut', 553, 18.2, 30.2, 43.9, 3.3, '10 cashews (15 g)', 15, 'v vg j e n', 's', 'A', 'treenut'],
    ['flax', 'Flax seeds (ground)', 'nut', 534, 18.3, 28.9, 42.2, 27.3, 'tbsp (10 g)', 10, 'v vg j e n', 'b s', 'A', ''],
    ['chia', 'Chia seeds', 'nut', 486, 16.5, 42.1, 30.7, 34.4, 'tbsp (12 g)', 12, 'v vg j e n', 'b s', 'A', ''],
    ['pumpkin_seeds', 'Pumpkin seeds', 'nut', 559, 30.2, 10.7, 49.0, 6.0, 'tbsp (10 g)', 10, 'v vg j e n', 's', 'A', ''],
    ['pb', 'Peanut butter (no sugar)', 'nut', 588, 25.0, 20.0, 50.0, 6.0, 'tbsp (16 g)', 16, 'v vg j e n', 'b s', 'A', 'peanut'],
    ['oil', 'Cooking oil (any)', 'fat', 884, 0, 0, 100, 0, 'tsp (5 g)', 5, 'v vg j e n', 'b l d', 'A', ''],
    ['ghee', 'Ghee', 'fat', 876, 0, 0, 99.5, 0, 'tsp (5 g)', 5, 'v j e n', 'b l d', 'A', 'dairy'],
    ['chutney', 'Coconut chutney', 'fat', 178, 2.5, 6.0, 16.0, 4.0, '2 tbsp (30 g)', 30, 'v vg j e n', 'b d', 'S', ''],
    // sugars
    ['sugar', 'Sugar', 'sugar', 387, 0, 100, 0, 0, 'tsp (5 g)', 5, 'v vg j e n', 'b s', 'A', ''],
    ['honey', 'Honey', 'sugar', 304, 0.3, 82.4, 0, 0.2, 'tsp (7 g)', 7, 'v j e n', 'b s', 'A', ''],
    ['jaggery', 'Jaggery', 'sugar', 383, 0.4, 95.0, 0.1, 0, 'small piece (10 g)', 10, 'v vg j e n', 's', 'A', ''],
  ];
  const FOODS = {};
  for (const [id, name, group, kcal, p, c, f, fib, unit, grams, diets, meals, region, allergens] of R) {
    FOODS[id] = { id, name, group, kcal, p, c, f, fib, unit, grams, diets: diets.split(' '), meals: meals.split(' '), region,
      allergens: allergens ? allergens.split(' ') : [] };
  }
  // which diet tags a food must carry for each client diet
  const DIET_TAG = { veg: 'v', vegan: 'vg', jain: 'j', egg: 'e', nonveg: 'n' };
  const fits = (food, diet, allergies = []) => {
    if (!food) return false;
    const tag = DIET_TAG[diet] || 'n';
    if (!food.diets.includes(tag)) return false;
    return !food.allergens.some((a) => allergies.includes(a));
  };
  const SOURCES = [
    'Longvah T, Ananthan R, Bhaskarachary K, Venkaiah K. Indian Food Composition Tables 2017. Hyderabad: National Institute of Nutrition (ICMR); 2017.',
    'U.S. Department of Agriculture, Agricultural Research Service. FoodData Central (SR Legacy and Foundation Foods). fdc.nal.usda.gov.',
  ];
  const api = { FOODS, fits, DIET_TAG, SOURCES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FLFoods = api;
})(typeof window !== 'undefined' ? window : globalThis);
