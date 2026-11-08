/* =====================================================================
   The Fit Lab — handouts and letters: the content
   REHAB: home and rehab exercises for home-exercise programmes.
   HANDOUTS: patient education sheets, written in plain words, each with
   its sources. They give general advice — the professional adds what is
   specific to the person.
   Works in the browser (window.FLHandouts) and in Node for tests.
   ===================================================================== */
(function (root) {
  'use strict';
  // id, name, region, kind, default dose { sets, reps, hold (s), time (s), each (side) }, cues
  const R = (id, name, region, kind, dose, cues) => ({ id, name, region, kind, dose, cues });
  const REHAB = [
    // neck
    R('chin_tuck', 'Chin tucks', 'neck', 'mobility', { sets: 2, reps: 10, hold: 3 }, ['Sit or stand tall', 'Draw the chin straight back, as if making a double chin', 'Keep the eyes level and hold']),
    R('neck_rot', 'Neck turns', 'neck', 'mobility', { sets: 1, reps: 10, each: true }, ['Turn the head slowly to look over one shoulder', 'Go only as far as is comfortable', 'Come back to the middle, then turn to the other side']),
    R('trap_stretch', 'Side neck stretch', 'neck', 'stretch', { sets: 3, hold: 30, each: true }, ['Sit on one hand to keep that shoulder down', 'Tilt the ear towards the other shoulder', 'A gentle stretch only — no pain']),
    R('neck_iso', 'Neck isometrics', 'neck', 'strength', { sets: 1, reps: 5, hold: 5 }, ['Press the head gently into your hand — forwards, backwards and to each side', 'Don\'t let the head move', 'Use about a third of your full effort']),
    // shoulder
    R('pendulum', 'Pendulum swings', 'shoulder', 'mobility', { sets: 3, time: 30 }, ['Lean on a table with the good arm', 'Let the sore arm hang and swing it in small circles', 'Let the body sway move the arm — keep the shoulder relaxed']),
    R('table_slide', 'Table slides', 'shoulder', 'mobility', { sets: 2, reps: 10 }, ['Sit beside a table with the hand on a towel', 'Slide the hand forward, bending from the hips', 'Come back slowly']),
    R('wall_slide', 'Wall slides', 'shoulder', 'mobility', { sets: 2, reps: 10 }, ['Stand facing a wall with the forearms on it', 'Slide the arms up as far as is comfortable', 'Slide back down slowly']),
    R('scap_squeeze', 'Shoulder blade squeezes', 'shoulder', 'strength', { sets: 2, reps: 10, hold: 5 }, ['Sit or stand tall', 'Squeeze the shoulder blades back and down', 'Don\'t shrug — hold, then relax']),
    R('er_band', 'Shoulder turn-outs with a band', 'shoulder', 'strength', { sets: 3, reps: 12 }, ['Elbow by your side, bent to a right angle, a small towel between elbow and body', 'Turn the forearm outwards against the band', 'Return slowly']),
    R('ir_band', 'Shoulder turn-ins with a band', 'shoulder', 'strength', { sets: 3, reps: 12 }, ['Elbow by your side, bent to a right angle', 'Pull the forearm in towards the stomach', 'Return slowly']),
    R('row_band', 'Band rows', 'shoulder', 'strength', { sets: 3, reps: 12 }, ['Fix the band at chest height', 'Pull the elbows back, squeezing the shoulder blades', 'Return slowly']),
    R('doorway', 'Doorway chest stretch', 'shoulder', 'stretch', { sets: 3, hold: 30 }, ['Forearms on the door frame, elbows at shoulder height', 'Step through gently until you feel a stretch across the chest']),
    // back
    R('pelvic_tilt', 'Pelvic tilts', 'back', 'mobility', { sets: 2, reps: 10 }, ['Lie on your back with the knees bent', 'Flatten the lower back into the floor by tightening the tummy', 'Relax and repeat']),
    R('knee_chest', 'Knee to chest', 'back', 'stretch', { sets: 3, hold: 20, each: true }, ['Lie on your back', 'Hug one knee towards the chest', 'Keep the other leg relaxed']),
    R('trunk_rot', 'Knee rolls', 'back', 'mobility', { sets: 1, reps: 10, each: true }, ['Lie on your back, knees bent and together', 'Let the knees roll slowly to one side, then the other', 'Keep both shoulders on the floor']),
    R('cat_camel', 'Cat and camel', 'back', 'mobility', { sets: 2, reps: 10 }, ['On hands and knees', 'Round the back up slowly, then let it dip gently', 'Move within a comfortable range']),
    R('press_up', 'Lying press-ups (back extension)', 'back', 'mobility', { sets: 1, reps: 10 }, ['Lie face down with the hands under the shoulders', 'Push the upper body up and let the hips stay on the floor', 'Stop if leg pain or numbness increases']),
    R('bird_dog', 'Bird dog', 'back', 'strength', { sets: 2, reps: 8, hold: 3, each: true }, ['On hands and knees with the back flat', 'Reach one arm forward and the opposite leg back', 'Keep the hips level, hold, then swap']),
    R('bridge', 'Bridges', 'back', 'strength', { sets: 3, reps: 10 }, ['Lie on your back with the knees bent', 'Squeeze the buttocks and lift the hips', 'Lower slowly']),
    R('dead_bug', 'Dead bug', 'back', 'strength', { sets: 2, reps: 8, each: true }, ['Lie on your back, arms up, hips and knees bent to a right angle', 'Lower one arm and the opposite leg slowly while the back stays flat', 'Return and swap']),
    R('side_plank_k', 'Side plank on the knees', 'back', 'strength', { sets: 3, time: 20, each: true }, ['Lie on your side, propped on the elbow, knees bent', 'Lift the hips so the body is in a straight line', 'Breathe normally']),
    R('child_pose', 'Child\'s pose', 'back', 'stretch', { sets: 3, hold: 30 }, ['Kneel, then sit back towards the heels', 'Reach the arms forward on the floor', 'Breathe slowly into the back']),
    // hip
    R('clamshell', 'Clamshells', 'hip', 'strength', { sets: 3, reps: 15, each: true }, ['Lie on your side, knees bent, feet together', 'Lift the top knee without rolling the hips back', 'Lower slowly']),
    R('side_raise', 'Side-lying leg raises', 'hip', 'strength', { sets: 3, reps: 12, each: true }, ['Lie on your side, bottom knee bent', 'Lift the top leg up and slightly back, toes forward', 'Lower slowly']),
    R('hip_abd_band', 'Standing side steps with a band', 'hip', 'strength', { sets: 3, reps: 10, each: true }, ['Band around the ankles or above the knees', 'Knees soft, step sideways keeping tension on the band', 'Keep the body upright']),
    R('hip_flexor', 'Kneeling hip flexor stretch', 'hip', 'stretch', { sets: 3, hold: 30, each: true }, ['Kneel on one knee on a cushion, other foot in front', 'Tuck the tailbone under and shift forward gently', 'Feel the stretch at the front of the hip']),
    R('figure4', 'Buttock (figure-4) stretch', 'hip', 'stretch', { sets: 3, hold: 30, each: true }, ['Lie on your back and cross one ankle over the other knee', 'Pull the lower thigh towards you', 'Feel the stretch in the buttock']),
    R('ham_stretch', 'Hamstring stretch with a towel', 'hip', 'stretch', { sets: 3, hold: 30, each: true }, ['Lie on your back with a towel round one foot', 'Straighten the leg up until you feel a stretch behind the thigh', 'Keep the other leg relaxed']),
    // knee
    R('quad_set', 'Static quads', 'knee', 'strength', { sets: 1, reps: 10, hold: 5 }, ['Sit with the leg straight and a rolled towel under the knee', 'Tighten the thigh, pressing the knee into the towel', 'Hold, then relax']),
    R('slr', 'Straight-leg raises', 'knee', 'strength', { sets: 3, reps: 10 }, ['Lie on your back with the other knee bent', 'Tighten the thigh and lift the straight leg to the height of the other knee', 'Lower slowly']),
    R('heel_slide', 'Heel slides', 'knee', 'mobility', { sets: 2, reps: 10 }, ['Lie on your back', 'Slide the heel towards the buttock to bend the knee', 'Slide back until the leg is straight']),
    R('short_arc', 'Short-arc quads', 'knee', 'strength', { sets: 3, reps: 10, hold: 3 }, ['Lie with a rolled towel under the knee', 'Straighten the knee fully, lifting the heel', 'Hold, then lower slowly']),
    R('seated_ext', 'Seated knee straightening', 'knee', 'strength', { sets: 3, reps: 10, hold: 3 }, ['Sit tall on a chair', 'Straighten one knee fully and hold', 'Lower slowly — add an ankle weight when it gets easy']),
    R('tke', 'Knee straightening with a band', 'knee', 'strength', { sets: 3, reps: 12 }, ['Band fixed in front, looped behind the knee', 'Start with the knee slightly bent', 'Straighten the knee fully against the band']),
    R('sit_stand', 'Sit to stand', 'knee', 'strength', { sets: 3, reps: 10 }, ['Sit near the front of a firm chair, feet under the knees', 'Lean forward and stand up, without the hands if you can', 'Sit back down slowly']),
    R('mini_squat', 'Mini squats', 'knee', 'strength', { sets: 3, reps: 10 }, ['Hold a counter for balance', 'Bend the knees a little, keeping them over the toes', 'Stand back up tall']),
    R('step_up', 'Step-ups', 'knee', 'strength', { sets: 3, reps: 10, each: true }, ['Use a low step and a rail if needed', 'Step up with the working leg and stand tall', 'Step down slowly']),
    // ankle and foot
    R('ankle_pump', 'Ankle pumps', 'ankle', 'mobility', { sets: 1, reps: 20 }, ['Point the foot down, then pull it up towards you', 'Move through the full range, steadily']),
    R('ankle_abc', 'Ankle alphabet', 'ankle', 'mobility', { sets: 1, reps: 2 }, ['Sit with the foot off the floor', 'Write the letters A to Z in the air with the big toe']),
    R('heel_raise', 'Heel raises', 'ankle', 'strength', { sets: 3, reps: 15 }, ['Hold a wall or chair', 'Rise up onto the toes', 'Lower slowly over 3 seconds']),
    R('calf_stretch', 'Calf stretch against a wall', 'ankle', 'stretch', { sets: 3, hold: 30, each: true }, ['Hands on a wall, one foot back with the heel down', 'Lean forward until you feel the stretch in the calf', 'Bend the back knee slightly to stretch lower down']),
    R('plantar_stretch', 'Arch (plantar fascia) stretch', 'ankle', 'stretch', { sets: 1, reps: 10, hold: 10 }, ['Sit and cross the foot over the other knee', 'Pull the toes back towards the shin', 'Feel the stretch along the arch']),
    R('towel_scrunch', 'Towel scrunches', 'ankle', 'strength', { sets: 2, time: 60 }, ['Sit with the foot flat on a towel', 'Scrunch the towel towards you with the toes', 'Keep the heel on the floor']),
    R('eversion_band', 'Ankle turn-outs with a band', 'ankle', 'strength', { sets: 3, reps: 12 }, ['Sit with the band around the foot, fixed on the inside', 'Turn the foot outwards against the band', 'Return slowly']),
    // balance
    R('one_leg', 'Single-leg stand', 'balance', 'balance', { sets: 3, time: 30, each: true }, ['Stand next to a wall or counter', 'Lift one foot and balance', 'To make it harder: eyes closed or on a cushion — with support close by']),
    R('tandem_stand', 'Heel-to-toe stand', 'balance', 'balance', { sets: 3, time: 30 }, ['Stand next to a counter', 'Put one foot directly in front of the other', 'Hold steady, then swap the front foot']),
    R('tandem_walk', 'Heel-to-toe walk', 'balance', 'balance', { sets: 3, reps: 10 }, ['Walk along a counter or wall', 'Place the heel right in front of the other foot\'s toes', 'Look ahead, not down']),
    // general
    R('walk', 'Walking', 'general', 'aerobic', { sets: 1, time: 1200 }, ['At a pace where you can talk but not sing', 'Build up a few minutes each week', 'Wear comfortable, supportive shoes']),
    R('belly_breath', 'Belly breathing', 'general', 'breathing', { sets: 1, time: 300 }, ['Sit or lie with one hand on the chest and one on the belly', 'Breathe in through the nose so the belly rises', 'Breathe out slowly through pursed lips']),
    R('pelvic_floor', 'Pelvic floor squeezes', 'general', 'strength', { sets: 3, reps: 10, hold: 5 }, ['Squeeze and lift as if stopping wind and the flow of urine', 'Hold, then relax fully', 'Keep breathing — don\'t squeeze the buttocks or thighs']),
  ];
  const REGIONS = { neck: 'Neck', shoulder: 'Shoulder', back: 'Back and core', hip: 'Hip', knee: 'Knee', ankle: 'Ankle and foot', balance: 'Balance', general: 'General' };

  // a dose as words: "3 × 10 · hold 3 s · each side"
  function doseText(d) {
    if (!d) return '';
    const t = (s) => s >= 120 && s % 60 === 0 ? `${s / 60} min` : `${s} s`;
    const parts = [];
    if (d.reps) parts.push(d.sets > 1 ? `${d.sets} × ${d.reps}` : `${d.reps} ${d.reps === 1 ? 'time' : 'times'}`);
    else if (d.time) parts.push(d.sets > 1 ? `${d.sets} × ${t(d.time)}` : t(d.time));
    else if (d.hold) parts.push(d.sets > 1 ? `${d.sets} × hold ${t(d.hold)}` : `hold ${t(d.hold)}`);
    if (d.reps && d.hold) parts.push(`hold ${t(d.hold)}`);
    if (d.each) parts.push('each side');
    return parts.join(' · ');
  }

  // ------------------------------------------------------------------ patient handouts
  // for: physio · diet · doctor · yoga
  const HANDOUTS = [
    { id: 'lbp', title: 'Low back pain', for: ['physio', 'doctor', 'yoga'],
      intro: 'Back pain is very common. Most of the time it is not caused by serious damage, and it usually gets much better within a few weeks.',
      sections: [
        { h: 'What helps', items: ['Keep moving and carry on with your normal activities and work as much as you can — rest in bed slows recovery.', 'Walk every day and do the exercises you have been given. Build them up a little at a time.', 'Heat, such as a warm pack or a hot shower, can ease stiffness.', 'Ask your doctor or pharmacist which pain relief is right for you.'] },
        { h: 'Good to know', items: ['Scans are rarely needed and often show changes that are normal with age.', 'Pain can come and go. A flare-up does not mean you have damaged your back.', 'Sleep, stress and mood all affect pain — looking after them helps your back too.'] },
        { h: 'Get medical help straight away if you have', items: ['Numbness around the back passage or genitals', 'New problems passing urine or controlling your bowels', 'Weakness in the legs that is getting worse, or pain in both legs', 'Fever, unexplained weight loss, or back pain after a fall or accident'] },
      ], refs: ['NICE. Low back pain and sciatica in over 16s (NG59); 2016, updated 2020.', 'Foster NE, et al. Prevention and treatment of low back pain. Lancet. 2018;391:2368-2383.'] },
    { id: 'knee_oa', title: 'Knee osteoarthritis', for: ['physio', 'doctor', 'yoga'],
      intro: 'Osteoarthritis is a common joint condition. It is not just "wear and tear" — joints keep repairing themselves, and the right activity helps them work better.',
      sections: [
        { h: 'What helps', items: ['Exercise is the main treatment: strengthening the thigh and hip muscles, plus regular activity such as walking, cycling or swimming.', 'Exercise is safe for your knee. Some discomfort during exercise is normal — it should settle by the next day.', 'If you are overweight, losing weight takes load off the knee. Every kilo helps; losing 10% of your weight helps more than 5%.', 'Wear comfortable, supportive shoes. A walking stick in the opposite hand can help on bad days.', 'Ask your doctor or pharmacist about pain relief — a gel rubbed on the knee is often tried first.'] },
        { h: 'Good to know', items: ['Pain does not always match what an X-ray shows.', 'Keep active on bad days too — just do a little less, then build back up.'] },
        { h: 'See a doctor if', items: ['The knee is suddenly hot, red and swollen, especially with a fever', 'The knee locks or gives way often', 'You suddenly can\'t put weight on the leg'] },
      ], refs: ['NICE. Osteoarthritis in over 16s: diagnosis and management (NG226); 2022.'] },
    { id: 'neck', title: 'Neck pain', for: ['physio', 'doctor', 'yoga'],
      intro: 'Neck pain and stiffness are common and usually get better within a few weeks.',
      sections: [
        { h: 'What helps', items: ['Keep your neck moving gently — keeping it still for long makes stiffness worse.', 'Take short breaks from screens and phones every 30 to 45 minutes; bring the screen up to eye level.', 'Heat can ease muscle tension.', 'Use one firm pillow that keeps your neck level with your body.', 'Do the exercises you have been given every day.'] },
        { h: 'Get medical help if you have', items: ['Numbness, pins and needles or weakness in the arms that is spreading or getting worse', 'Problems with walking or balance, or with your hands feeling clumsy', 'Neck pain after a fall or accident', 'Fever, a severe headache or feeling generally unwell with the pain'] },
      ], refs: ['NICE Clinical Knowledge Summaries. Neck pain — non-specific.'] },
    { id: 'ankle', title: 'Ankle sprain', for: ['physio', 'doctor'],
      intro: 'A sprain is a stretch or tear of the ligaments around the ankle. Most sprains heal well with early movement and exercise.',
      sections: [
        { h: 'The first few days', items: ['Rest from sport, but walk as much as the pain allows — use crutches only if you can\'t.', 'Raise the foot above the level of the hip when sitting.', 'Ice wrapped in a towel for 15–20 minutes, a few times a day, can ease pain and swelling.', 'A brace or tape gives better support than a tight bandage.'] },
        { h: 'Getting back to normal', items: ['Start ankle movement, strength and balance exercises early — they speed recovery and lower the chance of spraining it again.', 'Return to sport step by step: walking, jogging, then running, turning and jumping.', 'Keep the balance exercises going for a few months after you are back to sport.'] },
        { h: 'See a doctor if', items: ['You can\'t take four steps on the foot', 'There is pain over the bony points of the ankle or the middle of the foot', 'The foot is numb, cold or a strange colour', 'It is not getting better after a week or two'] },
      ], refs: ['Vuurberg G, et al. Diagnosis, treatment and prevention of ankle sprains: an evidence-based clinical guideline. Br J Sports Med. 2018;52:956.', 'Stiell IG, et al. Decision rules for the use of radiography in acute ankle injuries (Ottawa ankle rules). JAMA. 1993;269:1127-1132.'] },
    { id: 'heel', title: 'Heel pain (plantar fasciitis)', for: ['physio', 'doctor'],
      intro: 'Pain under the heel, often worst with the first steps in the morning, is common. It usually settles with simple care, though it can take several months.',
      sections: [
        { h: 'What helps', items: ['Do the calf and arch stretches every day, especially before getting out of bed.', 'Wear supportive, cushioned shoes with a slight heel — avoid walking barefoot on hard floors.', 'Cut down long standing and running for a while, then build back up gradually.', 'Strengthening the calf and foot muscles helps the tissue get stronger.', 'If you are overweight, losing weight lowers the load on the heel.'] },
        { h: 'See a doctor if', items: ['The heel is red, hot or swollen', 'You have numbness or tingling in the foot', 'There is no improvement after a few months of care'] },
      ], refs: ['NICE Clinical Knowledge Summaries. Plantar fasciitis.', 'Rathleff MS, et al. High-load strength training improves outcome in patients with plantar fasciitis. Scand J Med Sci Sports. 2015;25:e292-300.'] },
    { id: 'shoulder', title: 'Shoulder pain', for: ['physio', 'doctor'],
      intro: 'Most shoulder pain comes from the muscles and tendons around the joint (the rotator cuff). It usually improves with the right exercise, though it can take a few months.',
      sections: [
        { h: 'What helps', items: ['Keep using the arm for everyday tasks within comfort — avoid keeping it in a sling.', 'Do your exercises every day. Mild discomfort is fine if it settles soon after.', 'Cut back on long or repeated overhead work for a while, then build it back up.', 'Lying on the other side with a pillow hugged in front of you can ease night pain.'] },
        { h: 'See a doctor if', items: ['You can\'t lift the arm at all after a fall or injury', 'The shoulder is hot, red and swollen, or you have a fever', 'You have chest pain or breathlessness with the shoulder pain'] },
      ], refs: ['NICE Clinical Knowledge Summaries. Shoulder pain.', 'Littlewood C, et al. Exercise for rotator cuff tendinopathy: a systematic review. Physiotherapy. 2012;98:101-109.'] },
    { id: 'diabetes_food', title: 'Eating well with type 2 diabetes', for: ['diet', 'doctor'],
      intro: 'What you eat has a big effect on your blood sugar. Small, steady changes work best.',
      sections: [
        { h: 'Build your plate', items: ['Half the plate: vegetables and salad.', 'A quarter: whole grains or millets — such as ragi, jowar, bajra, brown rice or whole-wheat roti — instead of white rice and maida.', 'A quarter: protein — dal, chana, rajma, curd, paneer, eggs, fish or chicken.', 'Eat fruit whole rather than as juice, one portion at a time.'] },
        { h: 'Cut down on', items: ['Sugar, sweets, mithai and sugary drinks, including fruit juice and sweetened tea and coffee', 'Fried snacks, biscuits, bakery items and namkeen', 'Large portions of rice, even at festivals — use a smaller plate'] },
        { h: 'Good habits', items: ['Eat at regular times and don\'t skip meals, especially on diabetes medicines.', 'Walk for 10–15 minutes after meals.', 'If you take insulin or tablets that can cause low sugar, carry glucose tablets and ask your doctor what to do when you are unwell or fasting.'] },
      ], refs: ['ICMR-National Institute of Nutrition. Dietary Guidelines for Indians; 2024.', 'American Diabetes Association. Standards of Care in Diabetes—2025: Facilitating positive health behaviors. Diabetes Care. 2025;48(Suppl 1).'] },
    { id: 'diabetes_ex', title: 'Exercise with diabetes', for: ['physio', 'doctor', 'diet', 'yoga'],
      intro: 'Regular activity lowers blood sugar, helps your medicines work better and protects your heart.',
      sections: [
        { h: 'How much', items: ['At least 150 minutes a week of brisk activity, such as walking, cycling or swimming, spread over 3 or more days — no more than 2 days in a row without it.', 'Strength exercises for the main muscles on 2–3 days a week.', 'Break up long sitting: get up and move for a few minutes every 30 minutes.'] },
        { h: 'Stay safe', items: ['If you take insulin or tablets that can cause low sugar, check your sugar before exercise if you can, and carry glucose tablets or juice.', 'Signs of low sugar are shaking, sweating, hunger and confusion — stop and take sugar straight away.', 'Check your feet after exercise and wear well-fitting shoes and socks.', 'Stop and get help for chest pain, unusual breathlessness or dizziness.'] },
      ], refs: ['Colberg SR, et al. Physical activity/exercise and diabetes: a position statement of the American Diabetes Association. Diabetes Care. 2016;39:2065-2079.'] },
    { id: 'bp', title: 'Lowering high blood pressure', for: ['doctor', 'diet', 'physio', 'yoga'],
      intro: 'High blood pressure rarely causes symptoms, but it raises the risk of heart attack, stroke and kidney disease. Daily habits can lower it — alongside any medicines you are prescribed.',
      sections: [
        { h: 'What helps', items: ['Less salt: under 5 g a day (about one teaspoon) in total. Go easy on pickles, papad, namkeen, sauces and ready-made food.', 'More vegetables, fruit, dal and low-fat dairy.', 'At least 150 minutes a week of brisk activity, plus some strength exercise.', 'Lose weight if you are overweight; stop smoking and tobacco; cut down on alcohol.', 'Sleep well and find ways to manage stress.'] },
        { h: 'Good to know', items: ['Take your medicines every day, even when you feel well.', 'Checking your blood pressure at home and writing it down helps your doctor.', 'Get urgent help for a severe headache, chest pain, breathlessness, weakness on one side or trouble speaking.'] },
      ], refs: ['Unger T, et al. 2020 International Society of Hypertension global hypertension practice guidelines. Hypertension. 2020;75:1334-1357.', 'WHO. Guideline: sodium intake for adults and children; 2012.'] },
    { id: 'osteo', title: 'Exercise for strong bones', for: ['physio', 'doctor', 'yoga'],
      intro: 'Exercise keeps bones strong and lowers the risk of falls and fractures, even if you have osteoporosis.',
      sections: [
        { h: 'What to do', items: ['Strength exercises for the legs, back and arms on 2–3 days a week, building up the weight over time.', 'Impact activity if it suits you, such as brisk walking, stair climbing or gentle jumping — start low and build up.', 'Balance exercises most days, such as standing on one leg near support.', 'Good posture: practise standing and sitting tall.'] },
        { h: 'Take care with', items: ['Repeated or heavy bending forward with a rounded back, especially while lifting', 'Fast or forced twisting of the spine', 'Instead, bend at the hips and knees and keep the back straight when lifting'] },
        { h: 'Also', items: ['Enough calcium (milk, curd, paneer, ragi, sesame) and vitamin D — ask your doctor whether you need supplements.', 'Make your home safer from falls: good lighting, no loose rugs, a rail on the stairs.'] },
      ], refs: ['Royal Osteoporosis Society. Strong, Steady and Straight: an expert consensus statement on physical activity and exercise for osteoporosis; 2019.'] },
    { id: 'pregnancy', title: 'Exercise in pregnancy', for: ['physio', 'doctor', 'yoga', 'diet'],
      intro: 'If your pregnancy is healthy, regular exercise is safe and good for you and your baby. Check with your doctor or midwife first.',
      sections: [
        { h: 'What to do', items: ['Aim for at least 150 minutes a week of moderate activity, such as brisk walking, swimming or a pregnancy exercise class.', 'Do pelvic floor exercises every day.', 'Gentle strength and stretching exercise is fine — avoid going to the end of your range.', 'Drink water and avoid exercising in heat.'] },
        { h: 'Avoid', items: ['Contact sports and activities with a high risk of falling', 'Lying flat on your back for long after the first trimester — use pillows to prop yourself up or lie on your side', 'Hot yoga, saunas and scuba diving'] },
        { h: 'Stop and get medical help for', items: ['Bleeding or fluid leaking from the vagina', 'Regular painful tightenings', 'Chest pain, dizziness, a headache that won\'t go, or breathlessness before you start exercising', 'Calf pain or swelling'] },
      ], refs: ['American College of Obstetricians and Gynecologists. Committee Opinion No. 804: Physical activity and exercise during pregnancy and the postpartum period. Obstet Gynecol. 2020;135:e178-e188.', 'WHO guidelines on physical activity and sedentary behaviour; 2020.'] },
    { id: 'sleep', title: 'Better sleep', for: ['yoga', 'doctor', 'physio', 'diet'],
      intro: 'Most adults need 7–9 hours of sleep. Good sleep helps pain, mood, weight and recovery.',
      sections: [
        { h: 'Habits that help', items: ['Go to bed and get up at the same time every day, weekends too.', 'Get daylight in the morning and be active during the day.', 'Keep the bedroom dark, quiet and cool, and use the bed only for sleep.', 'Stop screens 30–60 minutes before bed; try slow breathing, a warm bath or reading instead.'] },
        { h: 'Cut down on', items: ['Tea, coffee and cola after the early afternoon', 'Heavy meals and alcohol late in the evening', 'Long naps — keep them under 30 minutes and before 3 pm'] },
        { h: 'See a doctor if', items: ['Poor sleep lasts more than a few weeks and affects your day', 'You snore loudly, stop breathing in your sleep or are very sleepy in the day'] },
      ], refs: ['Hirshkowitz M, et al. National Sleep Foundation\'s sleep time duration recommendations. Sleep Health. 2015;1:40-43.', 'Irish LA, et al. The role of sleep hygiene in promoting public health: a review. Sleep Med Rev. 2015;22:23-36.'] },
  ];

  const api = { REHAB, REGIONS, doseText, HANDOUTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FLHandouts = api;
})(typeof window !== 'undefined' ? window : globalThis);
