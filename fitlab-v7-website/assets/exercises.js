/* =====================================================================
   The Fit Lab — exercise library for the workout builder
   eq:     what it needs (bw = nothing). db dumbbells · bench · bb barbell and rack ·
           mc machines and cables · kb kettlebell · band resistance band · bar pull-up bar
   pat:    movement pattern (used to build sessions and to find swaps)
   lvl:    1 beginner · 2 intermediate · 3 advanced
   avoid:  common sore spots it can aggravate (knee, back, shoulder, wrist) — the
           builder leaves these out when the client reports that problem
   kind:   compound · isolation · core · cardio
   uni:    done one side at a time (reps are per side) · time: done for seconds
   ===================================================================== */
(function (root) {
  'use strict';
  const X = (id, name, pat, mus, also, eq, lvl, kind, avoid, cues, extra = {}) => ({ id, name, pat, mus, also, eq, lvl, kind, avoid, cues, ...extra });
  const LIST = [
    // ------------------------------------------------------------- squat
    X('back_squat', 'Barbell back squat', 'squat', 'quads', ['glutes', 'core'], ['bb'], 2, 'compound', ['knee', 'back'], ['Bar on the upper back, brace before each rep', 'Knees track over the toes', 'Go as deep as you can with a neutral back']),
    X('front_squat', 'Barbell front squat', 'squat', 'quads', ['glutes', 'core'], ['bb'], 3, 'compound', ['knee', 'wrist'], ['Elbows high, bar on the front of the shoulders', 'Stay tall through the whole rep']),
    X('goblet_squat', 'Goblet squat', 'squat', 'quads', ['glutes', 'core'], ['db'], 1, 'compound', [], ['Hold one dumbbell at the chest', 'Sit between the heels, chest up', 'Push the floor away to stand']),
    X('leg_press', 'Leg press', 'squat', 'quads', ['glutes'], ['mc'], 1, 'compound', [], ['Lower back stays on the pad', 'Lower only as far as the hips stay down', 'Don\'t lock the knees hard at the top']),
    X('hack_squat', 'Hack squat machine', 'squat', 'quads', ['glutes'], ['mc'], 2, 'compound', ['knee'], ['Feet mid-platform, shoulder-width', 'Control the way down']),
    X('box_squat', 'Box squat (sit to stand)', 'squat', 'quads', ['glutes'], ['bench'], 1, 'compound', [], ['Sit back to a bench or box at a comfortable height', 'Stand up without rocking', 'Lower the box over the weeks']),
    X('bw_squat', 'Bodyweight squat', 'squat', 'quads', ['glutes'], [], 1, 'compound', [], ['Feet shoulder-width, arms forward', 'Sit down and back, heels flat']),
    X('wall_sit', 'Wall sit', 'squat', 'quads', ['glutes'], [], 1, 'isolation', [], ['Back flat on the wall, thighs as level as is comfortable', 'Breathe normally — don\'t hold your breath'], { time: true }),
    X('db_squat', 'Dumbbell squat', 'squat', 'quads', ['glutes'], ['db'], 1, 'compound', [], ['A dumbbell in each hand at the sides', 'Chest up, sit straight down']),
    // ------------------------------------------------------------- hinge
    X('deadlift', 'Conventional deadlift', 'hinge', 'hamstrings', ['glutes', 'back', 'core'], ['bb'], 3, 'compound', ['back'], ['Bar over mid-foot, shins close', 'Brace, then push the floor away', 'Back stays neutral from start to finish']),
    X('rdl_bb', 'Barbell Romanian deadlift', 'hinge', 'hamstrings', ['glutes', 'back'], ['bb'], 2, 'compound', ['back'], ['Soft knees, push the hips back', 'Bar slides down the thighs', 'Stop when the hamstrings are tight']),
    X('rdl_db', 'Dumbbell Romanian deadlift', 'hinge', 'hamstrings', ['glutes', 'back'], ['db'], 1, 'compound', ['back'], ['Push the hips back, dumbbells close to the legs', 'Neutral back, stand tall at the top']),
    X('trap_dl', 'Trap-bar deadlift', 'hinge', 'glutes', ['quads', 'hamstrings', 'back'], ['bb'], 2, 'compound', ['back'], ['Stand in the middle of the bar', 'Chest up, push the floor away']),
    X('hip_thrust', 'Barbell hip thrust', 'hinge', 'glutes', ['hamstrings'], ['bb', 'bench'], 2, 'compound', [], ['Upper back on the bench, chin tucked', 'Drive through the heels, squeeze at the top', 'Ribs down — don\'t arch the lower back'], { support: true }),
    X('db_hip_thrust', 'Dumbbell hip thrust', 'hinge', 'glutes', ['hamstrings'], ['db', 'bench'], 1, 'compound', [], ['Dumbbell on the hips, upper back on the bench', 'Pause for a second at the top'], { support: true }),
    X('glute_bridge', 'Glute bridge', 'hinge', 'glutes', ['hamstrings'], [], 1, 'compound', [], ['Lie on your back, feet flat', 'Push through the heels and lift the hips', 'Squeeze the glutes, don\'t arch'], { support: true }),
    X('sl_bridge', 'Single-leg glute bridge', 'hinge', 'glutes', ['hamstrings'], [], 2, 'compound', [], ['One foot on the floor, the other leg up', 'Keep the hips level'], { uni: true, support: true }),
    X('kb_swing', 'Kettlebell swing', 'hinge', 'glutes', ['hamstrings', 'core'], ['kb'], 2, 'compound', ['back'], ['A hip snap, not a squat or an arm lift', 'Bell floats to chest height', 'Stand tall and squeeze at the top'], { ballistic: true }),
    X('superman', 'Prone back extension (superman)', 'hinge', 'back', ['glutes'], [], 1, 'isolation', [], ['Lie face down, lift chest and legs a little', 'Squeeze the glutes, look at the floor'], { support: true }),
    X('back_ext', '45° back extension', 'hinge', 'glutes', ['hamstrings', 'back'], ['mc'], 1, 'compound', [], ['Hinge at the hips, not the lower back', 'Stop when the body is in a straight line'], { support: true }),
    X('band_pullthrough', 'Band pull-through', 'hinge', 'glutes', ['hamstrings'], ['band'], 1, 'compound', [], ['Band anchored low behind you', 'Hips back, then snap forward and squeeze'], { support: true }),
    X('good_morning_band', 'Banded good morning', 'hinge', 'hamstrings', ['glutes', 'back'], ['band'], 1, 'compound', ['back'], ['Band under the feet and behind the neck', 'Push the hips back with soft knees'], { support: true }),
    // ------------------------------------------------------------- lunge / single leg
    X('walking_lunge', 'Dumbbell walking lunge', 'lunge', 'quads', ['glutes'], ['db'], 2, 'compound', ['knee'], ['Long step, back knee towards the floor', 'Front heel stays down'], { uni: true }),
    X('reverse_lunge', 'Reverse lunge', 'lunge', 'quads', ['glutes'], [], 1, 'compound', [], ['Step back, lower the back knee', 'Push through the front heel to return', 'Add dumbbells when 12 a side is easy'], { uni: true }),
    X('bss', 'Bulgarian split squat', 'lunge', 'quads', ['glutes'], ['db', 'bench'], 2, 'compound', ['knee'], ['Back foot on a bench', 'Drop straight down, torso slightly forward'], { uni: true }),
    X('split_squat', 'Split squat', 'lunge', 'quads', ['glutes'], [], 1, 'compound', [], ['Stay in the split stance', 'Lower the back knee straight down'], { uni: true }),
    X('step_up', 'Step-up', 'lunge', 'quads', ['glutes'], ['bench'], 1, 'compound', [], ['Whole foot on a knee-height step or lower', 'Push through the top leg, don\'t bounce off the bottom one'], { uni: true }),
    X('db_step_up', 'Dumbbell step-up', 'lunge', 'quads', ['glutes'], ['db', 'bench'], 2, 'compound', [], ['Dumbbells at the sides', 'Control the step down'], { uni: true }),
    X('lateral_lunge', 'Lateral lunge', 'lunge', 'glutes', ['quads'], [], 2, 'compound', ['knee'], ['Wide step to the side, sit into that hip', 'Other leg stays straight'], { uni: true }),
    X('sl_rdl', 'Single-leg Romanian deadlift', 'hinge', 'hamstrings', ['glutes', 'core'], ['db'], 2, 'compound', [], ['Hips stay square to the floor', 'Hold a wall for balance at first'], { uni: true }),
    // ------------------------------------------------------------- leg isolation
    X('leg_ext', 'Leg extension', 'quad_iso', 'quads', [], ['mc'], 1, 'isolation', ['knee'], ['Knee lined up with the machine pivot', 'Pause at the top, lower slowly']),
    X('leg_curl', 'Leg curl (lying or seated)', 'ham_iso', 'hamstrings', [], ['mc'], 1, 'isolation', [], ['Hips stay on the pad', 'Lower slowly']),
    X('slider_curl', 'Slider or towel leg curl', 'ham_iso', 'hamstrings', ['glutes'], [], 2, 'isolation', [], ['Lift into a bridge, slide the heels out and back', 'Keep the hips up']),
    X('nordic', 'Nordic hamstring curl', 'ham_iso', 'hamstrings', [], [], 3, 'isolation', ['knee'], ['Feet anchored, lower yourself as slowly as you can', 'Catch with the hands, push back up'], { reps: [3, 6] }),
    X('calf_raise', 'Standing calf raise', 'calves', 'calves', [], [], 1, 'isolation', [], ['Full stretch at the bottom, pause at the top', 'Hold a dumbbell or a step edge to progress']),
    X('db_calf_raise', 'Dumbbell calf raise', 'calves', 'calves', [], ['db'], 1, 'isolation', [], ['Ball of the foot on a step', 'Slow down, pause, up']),
    X('seated_calf', 'Seated calf raise', 'calves', 'calves', [], ['mc'], 1, 'isolation', [], ['Pause in the stretch', 'Full range']),
    X('hip_abd', 'Hip abduction machine', 'glute_iso', 'glutes', [], ['mc'], 1, 'isolation', [], ['Sit tall, push the knees out', 'Control the way back']),
    X('band_walk', 'Banded side walk', 'glute_iso', 'glutes', [], ['band'], 1, 'isolation', [], ['Band above the knees, half-squat', 'Small steps, toes forward']),
    X('cable_kickback', 'Cable glute kickback', 'glute_iso', 'glutes', ['hamstrings'], ['mc'], 1, 'isolation', [], ['Hinge slightly, kick back and up', 'Don\'t arch the lower back'], { uni: true }),
    X('clamshell', 'Clamshell', 'glute_iso', 'glutes', [], [], 1, 'isolation', [], ['Lie on your side, knees bent', 'Open the top knee without rolling back'], { uni: true }),
    // ------------------------------------------------------------- horizontal push
    X('bench_press', 'Barbell bench press', 'push_h', 'chest', ['triceps', 'shoulders'], ['bb', 'bench'], 2, 'compound', ['shoulder'], ['Shoulder blades back and down', 'Bar to the lower chest, elbows about 45°', 'Use a spotter or safety arms']),
    X('db_bench', 'Dumbbell bench press', 'push_h', 'chest', ['triceps', 'shoulders'], ['db', 'bench'], 1, 'compound', [], ['Feet flat, shoulder blades pinned', 'Lower to chest level, press up and slightly in']),
    X('incline_db', 'Incline dumbbell press', 'push_h', 'chest', ['shoulders', 'triceps'], ['db', 'bench'], 1, 'compound', [], ['Bench at 30°', 'Elbows slightly tucked']),
    X('incline_bb', 'Incline barbell press', 'push_h', 'chest', ['shoulders', 'triceps'], ['bb', 'bench'], 2, 'compound', ['shoulder'], ['Bench at 30°, bar to the upper chest']),
    X('chest_press', 'Machine chest press', 'push_h', 'chest', ['triceps', 'shoulders'], ['mc'], 1, 'compound', [], ['Handles at mid-chest height', 'Press without shrugging']),
    X('floor_press', 'Dumbbell floor press', 'push_h', 'chest', ['triceps'], ['db'], 1, 'compound', [], ['Lie on the floor, upper arms touch down softly', 'Easy on the shoulders']),
    X('pushup', 'Push-up', 'push_h', 'chest', ['triceps', 'shoulders', 'core'], [], 2, 'compound', ['wrist'], ['Body in one straight line', 'Chest to just above the floor', 'Hands on dumbbells or fists if the wrists hurt']),
    X('knee_pushup', 'Knee push-up', 'push_h', 'chest', ['triceps', 'shoulders'], [], 1, 'compound', ['wrist'], ['Knees down, body straight from knees to head', 'Chest to just above the floor']),
    X('incline_pushup', 'Incline push-up (hands on a bench or wall)', 'push_h', 'chest', ['triceps', 'shoulders'], [], 1, 'compound', ['wrist'], ['The higher the hands, the easier it is', 'Lower the height over the weeks']),
    X('band_press', 'Band chest press', 'push_h', 'chest', ['triceps'], ['band'], 1, 'compound', [], ['Band anchored behind at chest height', 'Press forward, control the return']),
    X('dips', 'Parallel-bar dip', 'push_h', 'chest', ['triceps', 'shoulders'], ['mc'], 3, 'compound', ['shoulder'], ['Lean slightly forward', 'Stop when the upper arm is level with the floor'], { support: true }),
    X('cable_fly', 'Cable fly', 'chest_iso', 'chest', [], ['mc'], 1, 'isolation', [], ['Slight bend in the elbows, hug a big tree', 'Feel the stretch, don\'t overstretch']),
    X('pec_deck', 'Pec deck', 'chest_iso', 'chest', [], ['mc'], 1, 'isolation', [], ['Elbows level with the shoulders', 'Squeeze, then return slowly']),
    X('db_fly', 'Dumbbell fly', 'chest_iso', 'chest', [], ['db', 'bench'], 2, 'isolation', ['shoulder'], ['Light weight, wide arc', 'Stop at chest level']),
    // ------------------------------------------------------------- vertical push
    X('ohp', 'Standing barbell overhead press', 'push_v', 'shoulders', ['triceps', 'core'], ['bb'], 2, 'compound', ['shoulder', 'back'], ['Squeeze glutes and brace', 'Bar travels close to the face', 'Head through at the top']),
    X('db_press', 'Seated dumbbell shoulder press', 'push_v', 'shoulders', ['triceps'], ['db', 'bench'], 1, 'compound', ['shoulder'], ['Back supported', 'Press up and slightly in, don\'t clash the dumbbells']),
    X('standing_db_press', 'Standing dumbbell press', 'push_v', 'shoulders', ['triceps', 'core'], ['db'], 1, 'compound', ['shoulder'], ['Ribs down, glutes tight', 'Palms facing in is easier on the shoulders']),
    X('landmine', 'Landmine press', 'push_v', 'shoulders', ['chest', 'triceps'], ['bb'], 2, 'compound', [], ['One end of the bar in a corner', 'Press up and forward — kind to the shoulders'], { uni: true }),
    X('machine_press', 'Machine shoulder press', 'push_v', 'shoulders', ['triceps'], ['mc'], 1, 'compound', ['shoulder'], ['Seat so handles start at shoulder height']),
    X('pike_pushup', 'Pike push-up', 'push_v', 'shoulders', ['triceps'], [], 2, 'compound', ['shoulder', 'wrist'], ['Hips high, head towards the floor between the hands']),
    X('band_ohp', 'Band overhead press', 'push_v', 'shoulders', ['triceps'], ['band'], 1, 'compound', ['shoulder'], ['Stand on the band, press overhead', 'Ribs down']),
    // ------------------------------------------------------------- shoulder isolation
    X('lat_raise', 'Dumbbell lateral raise', 'delt_iso', 'shoulders', [], ['db'], 1, 'isolation', [], ['Light weight, lift out to the sides', 'Stop at shoulder height, lead with the elbows']),
    X('cable_lat', 'Cable lateral raise', 'delt_iso', 'shoulders', [], ['mc'], 1, 'isolation', [], ['Cable behind the body, lift to shoulder height'], { uni: true }),
    X('band_lat', 'Band lateral raise', 'delt_iso', 'shoulders', [], ['band'], 1, 'isolation', [], ['Stand on the band, lift to shoulder height']),
    X('rear_fly', 'Bent-over rear-delt fly', 'rear_delt', 'shoulders', ['back'], ['db'], 1, 'isolation', [], ['Hinge forward, arms slightly bent', 'Lift out wide, squeeze the shoulder blades']),
    X('face_pull', 'Face pull', 'rear_delt', 'shoulders', ['back'], ['mc'], 1, 'isolation', [], ['Rope at face height, pull to the eyes', 'Elbows high, thumbs back']),
    X('prone_yt', 'Prone Y-T raise', 'rear_delt', 'shoulders', ['back'], [], 1, 'isolation', [], ['Lie face down, thumbs up', 'Lift the arms into a Y, then a T, squeezing the shoulder blades']),
    X('band_apart', 'Band pull-apart', 'rear_delt', 'shoulders', ['back'], ['band'], 1, 'isolation', [], ['Arms straight at chest height', 'Pull the band to the chest, squeeze']),
    X('rev_pec', 'Reverse pec deck', 'rear_delt', 'shoulders', ['back'], ['mc'], 1, 'isolation', [], ['Chest on the pad, arms out wide']),
    // ------------------------------------------------------------- horizontal pull
    X('bb_row', 'Bent-over barbell row', 'pull_h', 'back', ['biceps', 'shoulders'], ['bb'], 2, 'compound', ['back'], ['Hinge to about 45°, neutral back', 'Pull the bar to the lower ribs']),
    X('db_row', 'One-arm dumbbell row', 'pull_h', 'back', ['biceps'], ['db', 'bench'], 1, 'compound', [], ['Hand and knee on the bench', 'Pull the elbow back to the hip'], { uni: true }),
    X('cs_row', 'Chest-supported dumbbell row', 'pull_h', 'back', ['biceps', 'shoulders'], ['db', 'bench'], 1, 'compound', [], ['Lie face down on an incline bench', 'Pull both elbows back — no strain on the lower back']),
    X('cable_row', 'Seated cable row', 'pull_h', 'back', ['biceps'], ['mc'], 1, 'compound', [], ['Sit tall, pull to the stomach', 'Let the shoulder blades move forward and back']),
    X('machine_row', 'Machine row', 'pull_h', 'back', ['biceps'], ['mc'], 1, 'compound', [], ['Chest on the pad, squeeze the shoulder blades']),
    X('inverted_row', 'Inverted row (under a bar or sturdy table)', 'pull_h', 'back', ['biceps', 'core'], ['bar'], 2, 'compound', [], ['Body straight, pull the chest to the bar', 'Bend the knees to make it easier']),
    X('band_row', 'Band row', 'pull_h', 'back', ['biceps'], ['band'], 1, 'compound', [], ['Band anchored at chest height', 'Pull the elbows back, squeeze']),
    X('door_row', 'Door-frame row', 'pull_h', 'back', ['biceps'], [], 1, 'compound', [], ['Hold both sides of a sturdy door frame, feet close to it', 'Lean back with straight arms, pull the chest to the frame', 'Walk the feet closer to make it harder']),
    X('db_bent_row', 'Bent-over dumbbell row', 'pull_h', 'back', ['biceps'], ['db'], 1, 'compound', ['back'], ['Hinge forward, neutral back', 'Pull both dumbbells to the hips']),
    // ------------------------------------------------------------- vertical pull
    X('pullup', 'Pull-up', 'pull_v', 'back', ['biceps', 'core'], ['bar'], 3, 'compound', ['shoulder'], ['Hands just wider than the shoulders', 'Chest to the bar, full hang at the bottom']),
    X('chinup', 'Chin-up', 'pull_v', 'back', ['biceps'], ['bar'], 3, 'compound', [], ['Palms facing you, shoulder-width', 'Pull the chin over the bar']),
    X('neg_pullup', 'Slow negative pull-up', 'pull_v', 'back', ['biceps'], ['bar'], 2, 'compound', [], ['Jump or step to the top', 'Lower yourself over 3–5 seconds']),
    X('band_pullup', 'Band-assisted pull-up', 'pull_v', 'back', ['biceps'], ['bar', 'band'], 2, 'compound', [], ['Loop a band over the bar under the knee or foot', 'Use a lighter band over the weeks']),
    X('lat_pulldown', 'Lat pulldown', 'pull_v', 'back', ['biceps'], ['mc'], 1, 'compound', [], ['Lean back slightly, pull to the upper chest', 'Control the bar back up']),
    X('band_pulldown', 'Band pulldown', 'pull_v', 'back', ['biceps'], ['band'], 1, 'compound', [], ['Band anchored high, kneel', 'Pull elbows down to the ribs']),
    X('straight_pulldown', 'Straight-arm pulldown', 'pull_v', 'back', [], ['mc'], 1, 'isolation', [], ['Arms nearly straight, sweep the bar to the thighs']),
    // ------------------------------------------------------------- arms
    X('db_curl', 'Dumbbell biceps curl', 'biceps', 'biceps', [], ['db'], 1, 'isolation', [], ['Elbows by the sides', 'No swinging, lower slowly']),
    X('hammer_curl', 'Hammer curl', 'biceps', 'biceps', [], ['db'], 1, 'isolation', [], ['Palms facing each other', 'Elbows still']),
    X('bb_curl', 'Barbell curl', 'biceps', 'biceps', [], ['bb'], 1, 'isolation', ['wrist'], ['Shoulder-width grip', 'Elbows stay at the sides']),
    X('cable_curl', 'Cable curl', 'biceps', 'biceps', [], ['mc'], 1, 'isolation', [], ['Constant tension, slow return']),
    X('incline_curl', 'Incline dumbbell curl', 'biceps', 'biceps', [], ['db', 'bench'], 2, 'isolation', [], ['Bench at 45°, arms hang straight down']),
    X('band_curl', 'Band curl', 'biceps', 'biceps', [], ['band'], 1, 'isolation', [], ['Stand on the band, curl up, lower slowly']),
    X('pushdown', 'Triceps pushdown', 'triceps', 'triceps', [], ['mc'], 1, 'isolation', [], ['Elbows pinned to the sides', 'Straighten fully, squeeze']),
    X('oh_ext', 'Overhead dumbbell triceps extension', 'triceps', 'triceps', [], ['db'], 1, 'isolation', ['shoulder'], ['Elbows point up, lower behind the head', 'Ribs down']),
    X('skullcrusher', 'Dumbbell skull crusher', 'triceps', 'triceps', [], ['db', 'bench'], 2, 'isolation', [], ['Upper arms still, lower towards the forehead']),
    X('close_bench', 'Close-grip bench press', 'triceps', 'triceps', ['chest'], ['bb', 'bench'], 2, 'compound', ['wrist'], ['Hands shoulder-width', 'Elbows close to the body']),
    X('bench_dip', 'Bench dip', 'triceps', 'triceps', ['chest'], ['bench'], 1, 'compound', ['shoulder'], ['Hands on a bench behind you', 'Lower only until the upper arms are level']),
    X('band_pushdown', 'Band pushdown', 'triceps', 'triceps', [], ['band'], 1, 'isolation', [], ['Band anchored high', 'Elbows by the sides']),
    X('diamond_pushup', 'Close-hand push-up', 'triceps', 'triceps', ['chest'], [], 2, 'compound', ['wrist'], ['Hands under the chest', 'Elbows brush the ribs']),
    // ------------------------------------------------------------- core and carries
    X('plank', 'Front plank', 'core', 'core', [], [], 1, 'core', [], ['Elbows under the shoulders', 'Squeeze glutes, ribs down, breathe'], { time: true }),
    X('side_plank', 'Side plank', 'core', 'core', ['glutes'], [], 1, 'core', [], ['Body in a straight line, hips up', 'Knees bent to make it easier'], { time: true, uni: true }),
    X('dead_bug', 'Dead bug', 'core', 'core', [], [], 1, 'core', [], ['Lower back pressed to the floor', 'Move the opposite arm and leg slowly'], { uni: true }),
    X('bird_dog', 'Bird dog', 'core', 'core', ['glutes'], [], 1, 'core', [], ['Hands and knees, back flat', 'Reach opposite arm and leg, pause 2 seconds'], { uni: true }),
    X('pallof', 'Pallof press', 'core', 'core', [], ['band'], 1, 'core', [], ['Side-on to the anchor', 'Press out and resist the twist'], { uni: true }),
    X('cable_pallof', 'Cable Pallof press', 'core', 'core', [], ['mc'], 1, 'core', [], ['Side-on to the cable', 'Press out, hold 2 seconds'], { uni: true }),
    X('knee_raise', 'Hanging knee raise', 'core', 'core', [], ['bar'], 2, 'core', ['shoulder'], ['No swinging', 'Curl the hips up, lower slowly']),
    X('ab_wheel', 'Ab wheel rollout', 'core', 'core', ['shoulders'], ['mc'], 3, 'core', ['back', 'shoulder'], ['From the knees, ribs down', 'Roll out only as far as the back stays flat']),
    X('rev_crunch', 'Reverse crunch', 'core', 'core', [], [], 1, 'core', [], ['Curl the hips off the floor, lower slowly']),
    X('hollow', 'Hollow-body hold', 'core', 'core', [], [], 2, 'core', ['back'], ['Lower back pressed down, arms and legs long'], { time: true }),
    X('farmer', 'Farmer\'s carry', 'carry', 'core', ['shoulders', 'back'], ['db'], 1, 'compound', [], ['Heavy dumbbells at the sides', 'Walk tall with short steps'], { time: true }),
    X('suitcase', 'Suitcase carry', 'carry', 'core', ['shoulders'], ['db'], 1, 'compound', [], ['One dumbbell, don\'t lean to the side'], { time: true, uni: true }),
    // ------------------------------------------------------------- conditioning
    X('brisk_walk', 'Brisk or incline walk', 'cardio', 'cardio', [], [], 1, 'cardio', [], ['Fast enough to talk but not sing']),
    X('cycle', 'Stationary bike', 'cardio', 'cardio', [], ['mc'], 1, 'cardio', [], ['Seat at hip height', 'Easy on the knees']),
    X('rower', 'Rowing machine', 'cardio', 'cardio', ['back'], ['mc'], 2, 'cardio', ['back'], ['Legs, then body, then arms']),
    X('jacks', 'Jumping jacks', 'cardio', 'cardio', [], [], 1, 'cardio', ['knee'], ['Land softly — step-jacks for no jumping']),
    X('step_jacks', 'Step jacks (low impact)', 'cardio', 'cardio', [], [], 1, 'cardio', [], ['Step side to side with arm raises']),
    X('mountain', 'Mountain climbers', 'cardio', 'core', [], [], 1, 'cardio', ['wrist'], ['Hands under the shoulders, drive the knees']),
    X('burpee', 'Burpee', 'cardio', 'cardio', ['chest', 'quads'], [], 2, 'cardio', ['knee', 'wrist', 'back'], ['Step back instead of jumping to make it easier']),
    X('shadow_box', 'Shadow boxing', 'cardio', 'cardio', ['shoulders'], [], 1, 'cardio', [], ['Light on the feet, keep the hands up']),
    X('skipping', 'Skipping (rope or no rope)', 'cardio', 'cardio', ['calves'], [], 2, 'cardio', ['knee'], ['Small hops on the balls of the feet']),
    X('kb_swing_c', 'Kettlebell swing intervals', 'cardio', 'glutes', ['hamstrings'], ['kb'], 2, 'cardio', ['back'], ['Hip snap, bell to chest height']),
    // ------------------------------------------------------------- balance (older adults)
    X('sl_stand', 'Single-leg stand', 'balance', 'core', [], [], 1, 'core', [], ['Near a wall or chair', 'Progress: eyes closed, soft surface'], { time: true, uni: true }),
    X('tandem_walk', 'Heel-to-toe walk', 'balance', 'core', [], [], 1, 'core', [], ['Walk along a line, near a wall'], { time: true }),
  ];
  const BY = Object.fromEntries(LIST.map((x) => [x.id, x]));

  const EQUIPMENT = [['db', 'Dumbbells'], ['bench', 'Bench or step'], ['bb', 'Barbell and rack'], ['mc', 'Machines and cables'], ['kb', 'Kettlebell'], ['band', 'Resistance bands'], ['bar', 'Pull-up bar']];
  const PRESETS = { gym: ['db', 'bench', 'bb', 'mc', 'kb', 'band', 'bar'], home: ['db', 'bench', 'band'], bw: [] };
  const MUSCLES = [['chest', 'Chest'], ['back', 'Back'], ['shoulders', 'Shoulders'], ['quads', 'Quads'], ['hamstrings', 'Hamstrings'], ['glutes', 'Glutes'], ['biceps', 'Biceps'], ['triceps', 'Triceps'], ['calves', 'Calves'], ['core', 'Core']];
  const PATTERNS = { squat: 'Squat', hinge: 'Hinge', lunge: 'Single leg', push_h: 'Horizontal push', push_v: 'Vertical push', pull_h: 'Horizontal pull', pull_v: 'Vertical pull',
    quad_iso: 'Quads', ham_iso: 'Hamstrings', glute_iso: 'Glutes', calves: 'Calves', chest_iso: 'Chest fly', delt_iso: 'Side delts', rear_delt: 'Rear delts', biceps: 'Biceps', triceps: 'Triceps',
    core: 'Core', carry: 'Carry', cardio: 'Conditioning', balance: 'Balance' };
  const INJURIES = [['knee', 'Knee pain'], ['back', 'Lower-back pain'], ['shoulder', 'Shoulder pain'], ['wrist', 'Wrist or elbow pain']];

  const canDo = (ex, eq) => ex.eq.every((e) => eq.includes(e));
  const api = { LIST, BY, EQUIPMENT, PRESETS, MUSCLES, PATTERNS, INJURIES, canDo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FLEx = api;
})(typeof window !== 'undefined' ? window : globalThis);
