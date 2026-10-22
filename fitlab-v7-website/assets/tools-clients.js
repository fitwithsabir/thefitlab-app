/* =====================================================================
   The Fit Lab — Coach Tools: the coach's private client list
   (shared by the diet builder, the workout builder and Coach AI)
   ===================================================================== */
(function (root) {
  'use strict';
  const esc = (s) => FL.esc(s);
  const ALLERGIES = [['dairy', 'Milk / lactose'], ['gluten', 'Gluten (wheat)'], ['peanut', 'Peanut'], ['treenut', 'Tree nuts'], ['soy', 'Soy'], ['egg', 'Egg'], ['fish', 'Fish'], ['shellfish', 'Shellfish']];
  const DIETS = [['veg', 'Vegetarian'], ['egg', 'Eggetarian'], ['nonveg', 'Non-vegetarian'], ['vegan', 'Vegan'], ['jain', 'Jain']];
  const CUISINES = [['mixed', 'All-India mix'], ['north', 'North Indian'], ['south', 'South Indian']];
  const thisYear = new Date().getFullYear();
  const age = (c) => c && c.birth_year ? thisYear - c.birth_year : null;
  // allergies are kept in the allergies text as "dairy, gluten" plus any free text after a semicolon
  const parseAllergies = (txt) => String(txt || '').split(';')[0].split(',').map((x) => x.trim()).filter((x) => ALLERGIES.some(([k]) => k === x));
  const extraAllergies = (txt) => (String(txt || '').split(';')[1] || '').trim();

  let cache = null;
  async function list(force = false) {
    if (cache && !force) return cache;
    const { data, error } = await sb.from('coach_clients').select('*').is('archived_at', null).order('updated_at', { ascending: false });
    if (error) throw error;
    cache = data || [];
    return cache;
  }

  // add or edit a client in a dialog; resolves with the saved row (or null)
  function form(existing = null, { access } = {}) {
    const c = existing || { sex: 'female', activity: 'light', goal: 'fat_loss', diet: 'veg', cuisine: 'mixed', conditions: [] };
    const conds = (root.FLDiet && root.FLDiet.CONDITIONS) || [];
    const allergies = parseAllergies(c.allergies);
    const chip = (name, val, label, on) => `<label class="tl-chip"><input type="checkbox" name="${name}" value="${val}" ${on ? 'checked' : ''}><span>${esc(label)}</span></label>`;
    return new Promise((resolve) => {
      let done = false;
      const m = FL.modal({ title: existing ? `Edit ${c.full_name}` : 'New client', wide: true, onClose: () => { if (!done) resolve(null); },
        body: `<div class="tl-form">
          <div class="row2"><div class="field"><label class="req" for="cName">Name</label><input id="cName" maxlength="80" value="${esc(c.full_name || '')}" placeholder="Client's name"></div>
            <div class="field"><label for="cSex">Sex</label><select id="cSex"><option value="female" ${c.sex === 'female' ? 'selected' : ''}>Female</option><option value="male" ${c.sex === 'male' ? 'selected' : ''}>Male</option></select></div></div>
          <div class="row3"><div class="field"><label class="req" for="cAge">Age</label><input id="cAge" type="number" inputmode="numeric" min="10" max="100" value="${esc(age(c) ?? '')}"></div>
            <div class="field"><label class="req" for="cH">Height (cm)</label><input id="cH" type="number" inputmode="decimal" min="100" max="250" step="0.1" value="${esc(c.height_cm ?? '')}"></div>
            <div class="field"><label class="req" for="cW">Weight (kg)</label><input id="cW" type="number" inputmode="decimal" min="20" max="350" step="0.1" value="${esc(c.weight_kg ?? '')}"></div></div>
          <div class="row3"><div class="field"><label for="cBf">Body fat % <span class="muted">(optional)</span></label><input id="cBf" type="number" inputmode="decimal" min="2" max="70" step="0.1" value="${esc(c.body_fat ?? '')}"></div>
            <div class="field"><label for="cWaist">Waist cm <span class="muted">(optional)</span></label><input id="cWaist" type="number" inputmode="decimal" min="30" max="250" step="0.5" value="${esc(c.waist_cm ?? '')}"></div>
            <div class="field"><label for="cAct">Activity</label><select id="cAct">${FLCalc.ACTIVITY.map((a) => `<option value="${a.key}" ${c.activity === a.key ? 'selected' : ''}>${esc(a.label.split(' — ')[0])}</option>`).join('')}</select></div></div>
          <div class="row3"><div class="field"><label for="cGoal">Goal</label><select id="cGoal">${Object.entries(FLCalc.GOALS).map(([k, g]) => `<option value="${k}" ${c.goal === k ? 'selected' : ''}>${esc(g.label)}</option>`).join('')}</select></div>
            <div class="field"><label for="cDiet">Food preference</label><select id="cDiet">${DIETS.map(([k, l]) => `<option value="${k}" ${c.diet === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
            <div class="field"><label for="cCuisine">Cuisine</label><select id="cCuisine">${CUISINES.map(([k, l]) => `<option value="${k}" ${c.cuisine === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
          <div class="field"><label>Allergies and intolerances</label><div class="tl-chips">${ALLERGIES.map(([k, l]) => chip('alg', k, l, allergies.includes(k))).join('')}</div>
            <input id="cAlgX" maxlength="120" placeholder="Anything else (free text)" value="${esc(extraAllergies(c.allergies))}" style="margin-top:8px"></div>
          <div class="field"><label>Health screening <span class="muted">(ask every client)</span></label><div class="tl-chips">${conds.map(([k, l]) => chip('cond', k, l, (c.conditions || []).includes(k))).join('')}</div></div>
          <label class="check" id="consentRow"><input type="checkbox" id="cConsent" ${c.health_consent_at ? 'checked' : ''}><span>The client agreed that I can keep these health details to plan for them, and knows they can ask me to delete them at any time.</span></label>
          <div class="field" style="margin-top:12px"><label for="cNotes">Private notes</label><textarea id="cNotes" maxlength="2000" placeholder="Food likes and dislikes, timings, injuries…">${esc(c.notes || '')}</textarea></div>
          <div class="err" id="cErr" hidden></div></div>`,
        foot: `${existing ? '<button class="pill ghost red-o" data-archive>Archive</button><button class="txt-btn" data-erase>Delete for good</button><span style="flex:1"></span>' : ''}<button class="pill ghost" data-no>Cancel</button><button class="pill solid" data-ok>${existing ? 'Save' : 'Add client'}</button>` });
      const q = m.q, err = (t) => { const e = q('#cErr'); e.textContent = t; e.hidden = !t; };
      q('[data-no]').onclick = m.close;
      const arch = q('[data-archive]');
      if (arch) arch.onclick = async () => {
        if (!(await FL.confirm('Archive this client?', 'They leave your list and free up a place. Their saved plans are kept.', 'Archive'))) return;
        const { error } = await sb.from('coach_clients').update({ archived_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) return err(FL.friendly(error));
        cache = null; done = true; m.close(); resolve({ archived: true });
      };
      // the client's right to have their data deleted: plans, reports and report files go too
      const erase = q('[data-erase]');
      if (erase) erase.onclick = async () => {
        if (!(await FL.confirm(`Delete ${c.full_name} for good?`, 'Their details, saved plans, blood reports and report files are deleted and can\'t be brought back. Use this when the client asks you to delete their data.', 'Delete everything', true))) return;
        const uid = (await FL.session()).user.id;
        const { data: files } = await sb.storage.from('client-reports').list(`${uid}/${existing.id}`, { limit: 100 });
        if ((files || []).length) await sb.storage.from('client-reports').remove(files.map((f) => `${uid}/${existing.id}/${f.name}`));
        const { error } = await sb.from('coach_clients').delete().eq('id', existing.id);
        if (error) return err(FL.friendly(error));
        cache = null; done = true; m.close(); FL.toast('Client and their data deleted', 'ok'); resolve({ archived: true, deleted: true });
      };
      q('[data-ok]').onclick = async (e) => {
        err('');
        const nm = q('#cName').value.trim(), a = parseInt(q('#cAge').value, 10), h = parseFloat(q('#cH').value), w = parseFloat(q('#cW').value);
        if (!nm) return err('Add the client\'s name.');
        if (!(a >= 10 && a <= 100)) return err('Age must be between 10 and 100.');
        if (!(h >= 100 && h <= 250)) return err('Height must be between 100 and 250 cm.');
        if (!(w >= 20 && w <= 350)) return err('Weight must be between 20 and 350 kg.');
        const conditions = [...m.el.querySelectorAll('input[name=cond]:checked')].map((x) => x.value);
        const algs = [...m.el.querySelectorAll('input[name=alg]:checked')].map((x) => x.value);
        const algX = q('#cAlgX').value.trim().replace(/;/g, ',');
        const consent = q('#cConsent').checked;
        if ((conditions.length || q('#cBf').value || q('#cWaist').value) && !consent) return err('Tick the consent box before saving health details.');
        const num = (id) => { const v = parseFloat(q(id).value); return isFinite(v) ? v : null; };
        const row = { full_name: nm, sex: q('#cSex').value, birth_year: thisYear - a, height_cm: h, weight_kg: w, body_fat: num('#cBf'), waist_cm: num('#cWaist'),
          activity: q('#cAct').value, goal: q('#cGoal').value, diet: q('#cDiet').value, cuisine: q('#cCuisine').value,
          allergies: algs.join(', ') + (algX ? '; ' + algX : ''), conditions, notes: q('#cNotes').value.trim() || null,
          health_consent_at: consent ? (c.health_consent_at || new Date().toISOString()) : null };
        FL.busy(e.target, true, 'Saving…');
        const res = existing ? await sb.from('coach_clients').update(row).eq('id', existing.id).select().single()
                             : await sb.from('coach_clients').insert({ ...row, coach_id: (await FL.session()).user.id }).select().single();
        FL.busy(e.target, false);
        if (res.error) return err(FL.friendly(res.error));
        cache = null; done = true; m.close(); resolve(res.data);
      };
    });
  }

  // a client as calculator inputs
  const toPerson = (c) => ({ sex: c.sex, age: age(c) || 30, weightKg: Number(c.weight_kg), heightCm: Number(c.height_cm), activity: c.activity || 'light',
    goal: c.goal || 'maintain', bodyFatPct: c.body_fat ? Number(c.body_fat) : null });

  root.FLClients = { list, form, age, toPerson, parseAllergies, ALLERGIES, DIETS, CUISINES, reset: () => { cache = null; } };
})(window);
