/* THE FIT LAB ACADEMY — animated lesson diagrams
   Usage: FLD.render('squat_vs_hinge') → HTML string. Add new diagrams to the registry. */
(function () {
  const D = {};

  // 1. Six movement patterns — ring that lights up in sequence
  D.movement_patterns = () => {
    const items = [
      ['SQUAT', 'knee-dominant'], ['HINGE', 'hip-dominant'], ['PUSH', 'horizontal · vertical'],
      ['PULL', 'horizontal · vertical'], ['CORE', 'resist movement'], ['CARRY', 'locomotion']
    ];
    const cx = 200, cy = 150, R = 105;
    const nodes = items.map(([t, s], i) => {
      const a = (-90 + i * 60) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      return `<g class="n" style="animation-delay:${i * 1.1}s">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="34" class="ring"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="34" class="fill"/>
        <text x="${x.toFixed(1)}" y="${(y - 2).toFixed(1)}" class="t">${t}</text>
        <text x="${x.toFixed(1)}" y="${(y + 12).toFixed(1)}" class="s">${s}</text></g>`;
    }).join('');
    const spokes = items.map((_, i) => {
      const a = (-90 + i * 60) * Math.PI / 180;
      return `<line x1="${cx}" y1="${cy}" x2="${(cx + (R - 36) * Math.cos(a)).toFixed(1)}" y2="${(cy + (R - 36) * Math.sin(a)).toFixed(1)}" class="spoke"/>`;
    }).join('');
    return `<svg viewBox="0 0 400 300" class="fld" role="img" aria-label="Six movement patterns arranged in a ring: squat, hinge, push, pull, core, carry">
      <style>
        .fld .ring{fill:none;stroke:#2c332b;stroke-width:1.5}
        .fld .fill{fill:#0d0f0d;stroke:#a3e635;stroke-width:1.5;opacity:.0}
        .fld .n{animation:fldPulse 6.6s ease-in-out infinite}
        .fld .n .fill{animation:inherit;animation-name:fldFill}
        .fld .t{fill:#f1f4ec;font:700 12px 'DM Sans',sans-serif;text-anchor:middle;letter-spacing:.14em}
        .fld .s{fill:#93a08f;font:500 8px 'DM Sans',sans-serif;text-anchor:middle}
        .fld .spoke{stroke:#1f241f;stroke-width:1}
        .fld .c{fill:#a3e635;font:400 22px 'Bebas Neue',sans-serif;text-anchor:middle;letter-spacing:.06em}
        .fld .c2{fill:#93a08f;font:500 9px 'DM Sans',sans-serif;text-anchor:middle;letter-spacing:.2em}
        @keyframes fldFill{0%,12%{opacity:0}4%{opacity:1}}
        @keyframes fldPulse{0%,100%{transform:none}}
        @media (prefers-reduced-motion:reduce){.fld .fill{animation:none;opacity:.35}}
      </style>
      ${spokes}<circle cx="${cx}" cy="${cy}" r="46" fill="#0a0b0a" stroke="#1f241f"/>
      <text x="${cx}" y="${cy - 2}" class="c">6 PATTERNS</text><text x="${cx}" y="${cy + 14}" class="c2">ONE BODY</text>
      ${nodes}</svg>`;
  };

  // 2. Squat vs hinge — two animated stick figures
  D.squat_vs_hinge = () => {
    // pose paths: body "M shoulder L hip L knee L ankle M heel L toe", arm "M shoulder L hand"
    const stand = { body: 'M60 33 L60 82 L60 122 L60 162 M48 162 L80 162', arm: 'M60 33 L62 90', hx: 60, hy: 22, px: 60, py: 82 };
    const squat = { body: 'M58 62 L48 110 L80 126 L60 162 M48 162 L80 162', arm: 'M58 62 L100 70', hx: 59, hy: 51, px: 48, py: 110 };
    const hinge = { body: 'M85 59 L44 88 L52 126 L60 162 M48 162 L80 162', arm: 'M85 59 L82 104', hx: 93, hy: 53, px: 44, py: 88 };
    const anim = (attr, a, b) => `<animate attributeName="${attr}" dur="4.4s" repeatCount="indefinite" calcMode="spline"
        values="${a};${a};${b};${b};${a}" keyTimes="0;.15;.45;.72;1" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"/>`;
    const fig = (bottom, label, sub, hipArrow, x) => `
      <g transform="translate(${x} 0)">
        <line x1="10" y1="162" x2="140" y2="162" class="floor"/>
        <path d="${stand.body}" class="body">${anim('d', stand.body, bottom.body)}</path>
        <path d="${stand.arm}" class="arm">${anim('d', stand.arm, bottom.arm)}</path>
        <circle cx="${stand.hx}" cy="${stand.hy}" r="9" class="head">${anim('cx', stand.hx, bottom.hx)}${anim('cy', stand.hy, bottom.hy)}</circle>
        <circle cx="${stand.px}" cy="${stand.py}" r="4" class="hip">${anim('cx', stand.px, bottom.px)}${anim('cy', stand.py, bottom.py)}</circle>
        <text x="75" y="184" class="lbl">${label}</text>
        <text x="75" y="197" class="sub">${sub[0]}</text>
        <text x="75" y="208" class="sub">${sub[1]}</text>
        <text x="75" y="14" class="hipdir">${hipArrow}</text>
      </g>`;
    return `<svg viewBox="0 0 300 216" class="fld fld-fig" role="img" aria-label="Animated comparison: in a squat the hips drop down and knees travel forward; in a hinge the hips travel back and the torso tips forward">
      <style>
        .fld-fig .floor{stroke:#2c332b;stroke-width:1.5}
        .fld-fig .body,.fld-fig .arm{fill:none;stroke:#f1f4ec;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
        .fld-fig .arm{stroke:#93a08f;stroke-width:4}
        .fld-fig .head{fill:#f1f4ec}
        .fld-fig .hip{fill:#a3e635;filter:drop-shadow(0 0 4px #a3e635)}
        .fld-fig .lbl{fill:#a3e635;font:400 15px 'Bebas Neue',sans-serif;text-anchor:middle;letter-spacing:.14em}
        .fld-fig .sub{fill:#93a08f;font:500 8px 'DM Sans',sans-serif;text-anchor:middle}
        .fld-fig .hipdir{fill:#93a08f;font:700 8px 'DM Sans',sans-serif;text-anchor:middle;letter-spacing:.16em}
      </style>
      <line x1="150" y1="20" x2="150" y2="210" stroke="#1f241f"/>
      ${fig(squat, 'SQUAT', ['hips DOWN · knees FORWARD', 'torso stays upright'], 'HIPS ↓', 0)}
      ${fig(hinge, 'HINGE', ['hips BACK · knees soft', 'torso tips forward'], 'HIPS ←', 150)}
    </svg>`;
  };

  // 3. The framework — chips lighting up in order (HTML)
  D.framework = () => {
    const steps = ['Assess', 'Identify', 'Plan', 'Coach', 'Monitor', 'Progress', 'Modify', 'Refer'];
    return `<div class="fld-fw" role="img" aria-label="The coaching framework: ${steps.join(', ')}">
      ${steps.map((s, i) => `<span style="animation-delay:${i * .7}s"><i>${String(i + 1).padStart(2, '0')}</i>${s}</span>`).join('<b>→</b>')}
    </div>`;
  };

  // 4. Regression ladder — rungs from easiest to hardest (HTML)
  D.regression_ladder = (opts) => {
    const rungs = (opts && opts.rungs) || ['Wall push-up', 'High incline', 'Low incline', 'Floor push-up', 'Feet elevated', 'Weighted'];
    return `<div class="fld-ladder" role="img" aria-label="Regression ladder from ${rungs[0]} to ${rungs[rungs.length - 1]}">
      <div class="axis"><span>Harder ↑</span><span>Easier ↓</span></div>
      <ol>${rungs.slice().reverse().map((r, i) => `<li style="animation-delay:${(rungs.length - 1 - i) * .55}s"><i></i>${r}</li>`).join('')}</ol>
      <div class="note">Start where the pattern is clean. Climb one rung at a time. Load only at the top.</div>
    </div>`;
  };


  // 5. Assessment layers — four layers, top first (HTML)
  D.assessment_layers = () => {
    const L = [['1', 'Health & safety', 'Is exercise appropriate right now? Any reason for medical clearance?'],
               ['2', 'Goals & lifestyle', 'What do they actually want — and what can they sustain?'],
               ['3', 'Baseline fitness', 'What can they currently do?'],
               ['4', 'Movement competency', 'How well do they perform the patterns we intend to train?']];
    return `<div class="fld-layers" role="img" aria-label="Four assessment layers in order: health and safety, goals and lifestyle, baseline fitness, movement competency">
      ${L.map(([n, t, d], i) => `<div style="animation-delay:${i * .9}s"><i>${n}</i><div><b>${t}</b><span>${d}</span></div></div>`).join('')}
      <p>Never reverse the order. Safety before goals; goals before tests; tests before exercises.</p></div>`;
  };

  // 6. RPE / RIR scale (HTML)
  D.rpe_scale = () => {
    const rows = [['10', '0', 'Maximal — no more reps possible'], ['9', '1', 'One good rep left'], ['8', '2', 'Two good reps left'],
                  ['7', '3', 'Three left — solid working set'], ['6', '4', 'Four left — warm-up / technique'], ['≤5', '5+', 'Easy']];
    return `<div class="fld-rpe" role="img" aria-label="RPE and reps-in-reserve scale">
      <div class="h"><span>RPE</span><span>RIR</span><span>What it feels like</span></div>
      ${rows.map(([a, b, c], i) => `<div class="r" style="animation-delay:${i * .6}s"><span class="mono">${a}</span><span class="mono">${b}</span><span>${c}</span></div>`).join('')}
      <p>Most productive training lives between RPE 7 and 9. Estimates, not laws — ask "how many good reps were left?"</p></div>`;
  };

  // 7. Stimulus → Recovery → Adaptation curve (animated SVG)
  D.sra_curve = () => {
    const path = 'M20 120 C 60 120, 70 175, 100 175 S 150 100, 190 96 S 250 96, 300 96 S 340 105, 380 118';
    return `<svg viewBox="0 0 400 220" class="fld fld-sra" role="img" aria-label="Performance dips after training, recovers, then rises above baseline (adaptation), then fades if no new stimulus">
      <style>
        .fld-sra .ax{stroke:#2c332b;stroke-width:1.5}
        .fld-sra .base{stroke:#3a433a;stroke-dasharray:4 4}
        .fld-sra .curve{fill:none;stroke:#a3e635;stroke-width:3.5;stroke-linecap:round;stroke-dasharray:600;stroke-dashoffset:600;animation:draw 6s ease-in-out infinite;filter:drop-shadow(0 0 6px color-mix(in srgb,var(--lime) 50%,transparent))}
        .fld-sra .lbl{fill:#93a08f;font:700 9px 'DM Sans',sans-serif;letter-spacing:.14em}
        .fld-sra .lbl.k{fill:#f1f4ec}
        .fld-sra .z{fill:#a3e635;opacity:.08}
        @keyframes draw{0%{stroke-dashoffset:600}55%,85%{stroke-dashoffset:0}100%{stroke-dashoffset:0}}
        @media (prefers-reduced-motion:reduce){.fld-sra .curve{animation:none;stroke-dashoffset:0}}
      </style>
      <rect class="z" x="150" y="60" width="200" height="60"/>
      <line class="ax" x1="20" y1="200" x2="385" y2="200"/><line class="ax" x1="20" y1="30" x2="20" y2="200"/>
      <line class="base" x1="20" y1="120" x2="385" y2="120"/>
      <path class="curve" d="${path}"/>
      <circle cx="20" cy="120" r="4" fill="#f1f4ec"/>
      <text x="26" y="112" class="lbl">BASELINE</text>
      <text x="62" y="192" class="lbl k">STIMULUS</text>
      <text x="112" y="150" class="lbl">FATIGUE ↓</text>
      <text x="152" y="86" class="lbl">RECOVERY →</text>
      <text x="255" y="86" class="lbl k">ADAPTATION ↑</text>
      <text x="330" y="140" class="lbl">DETRAINING</text>
      <text x="300" y="214" class="lbl">TIME →</text>
      <text x="6" y="60" class="lbl" transform="rotate(-90 6 60)">PERFORMANCE →</text>
    </svg>`;
  };

  // 8. Energy systems — three overlapping contributions vs effort duration (SVG)
  D.energy_systems = () => `<svg viewBox="0 0 400 220" class="fld fld-es" role="img" aria-label="Three energy systems overlap: phosphagen dominates the first seconds, glycolytic the next minute or two, oxidative for longer efforts and recovery">
      <style>
        .fld-es .ax{stroke:#2c332b;stroke-width:1.5}
        .fld-es path{fill:none;stroke-width:3;stroke-linecap:round;opacity:.9}
        .fld-es .p1{stroke:#f1f4ec;animation:esPulse 6s infinite}
        .fld-es .p2{stroke:#a3e635;animation:esPulse 6s 2s infinite}
        .fld-es .p3{stroke:#65a30d;animation:esPulse 6s 4s infinite}
        .fld-es .lbl{font:700 9px 'DM Sans',sans-serif;letter-spacing:.12em}
        .fld-es .t{fill:#93a08f;font:500 8px 'DM Sans',sans-serif}
        @keyframes esPulse{0%,100%{stroke-width:3;opacity:.7}15%{stroke-width:5;opacity:1}}
        @media (prefers-reduced-motion:reduce){.fld-es path{animation:none}}
      </style>
      <line class="ax" x1="30" y1="185" x2="385" y2="185"/><line class="ax" x1="30" y1="25" x2="30" y2="185"/>
      <path class="p1" d="M30 40 C 60 40, 70 150, 120 175 S 200 185, 380 185"/>
      <path class="p2" d="M30 175 C 60 100, 90 45, 130 45 S 210 150, 280 175 S 340 185, 380 185"/>
      <path class="p3" d="M30 182 C 90 175, 150 150, 200 105 S 300 45, 380 40"/>
      <text x="40" y="34" class="lbl" fill="#f1f4ec">PHOSPHAGEN (ATP-PC) — seconds</text>
      <text x="140" y="60" class="lbl" fill="#a3e635">GLYCOLYTIC — hard efforts, ~10 s to 2+ min</text>
      <text x="200" y="130" class="lbl" fill="#65a30d">OXIDATIVE — minutes+, and recovery between efforts</text>
      <text x="30" y="200" class="t">0 s</text><text x="120" y="200" class="t">~30 s</text><text x="220" y="200" class="t">~2 min</text><text x="330" y="200" class="t">10+ min</text>
      <text x="300" y="214" class="t">EFFORT DURATION →</text>
      <text x="14" y="120" class="t" transform="rotate(-90 14 120)">CONTRIBUTION →</text>
      <text x="40" y="180" class="t">All three run at once — the mix shifts with intensity and duration</text>
    </svg>`;

  // 9. Anatomical planes (SVG, three panels)
  D.planes = () => {
    const fig = (x, cut) => `<g transform="translate(${x} 0)">
        <circle cx="60" cy="40" r="11" fill="#f1f4ec"/><path d="M60 52 L60 110 M35 70 L85 70 M60 110 L44 165 M60 110 L76 165" stroke="#f1f4ec" stroke-width="5" stroke-linecap="round" fill="none"/>
        ${cut}</g>`;
    const sag = '<line x1="60" y1="20" x2="60" y2="175" stroke="#a3e635" stroke-width="2" stroke-dasharray="5 4"/><text x="60" y="190" class="pl">SAGITTAL</text><text x="60" y="203" class="ps">left / right · flexion & extension</text><text x="60" y="214" class="ps">squat · lunge · curl · run</text>';
    const fro = '<rect x="18" y="20" width="84" height="155" fill="none" stroke="#a3e635" stroke-width="2" stroke-dasharray="5 4"/><text x="60" y="190" class="pl">FRONTAL</text><text x="60" y="203" class="ps">front / back · ab- & adduction</text><text x="60" y="214" class="ps">lateral lunge · lateral raise · shuffle</text>';
    const tra = '<ellipse cx="60" cy="90" rx="44" ry="10" fill="none" stroke="#a3e635" stroke-width="2" stroke-dasharray="5 4"/><text x="60" y="190" class="pl">TRANSVERSE</text><text x="60" y="203" class="ps">upper / lower · rotation</text><text x="60" y="214" class="ps">punch · throw · cutting</text>';
    return `<svg viewBox="0 0 400 222" class="fld fld-pl" role="img" aria-label="The three anatomical planes: sagittal, frontal, transverse">
      <style>.fld-pl .pl{fill:#a3e635;font:400 15px 'Bebas Neue',sans-serif;text-anchor:middle;letter-spacing:.14em}.fld-pl .ps{fill:#93a08f;font:500 7.5px 'DM Sans',sans-serif;text-anchor:middle}
      .fld-pl g{animation:plGlow 6s infinite}.fld-pl g:nth-child(2){animation-delay:2s}.fld-pl g:nth-child(3){animation-delay:4s}
      @keyframes plGlow{0%,100%{opacity:.55}10%,28%{opacity:1}}@media (prefers-reduced-motion:reduce){.fld-pl g{animation:none;opacity:1}}</style>
      ${fig(10, sag)}${fig(140, fro)}${fig(270, tra)}</svg>`;
  };


  // ---------- BATCH 2: diagrams for the previously bare days ----------

  // Force–velocity: strength vs power (Days 7, 17)
  D.force_velocity = () => `<svg viewBox="0 0 400 250" class="fld fld-fv" role="img" aria-label="Force-velocity curve showing maximal strength at high force low velocity, and power in the middle">
    <style>
      .fld-fv .ax{stroke:#2c332b;stroke-width:1.5}
      .fld-fv .cv{fill:none;stroke:#a3e635;stroke-width:2.5;stroke-dasharray:420;stroke-dashoffset:420;animation:fvDraw 3.4s ease-out infinite}
      .fld-fv .lbl{fill:#f1f4ec;font:700 10px 'DM Sans',sans-serif;letter-spacing:.1em}
      .fld-fv .sub{fill:#93a08f;font:500 8px 'DM Sans',sans-serif}
      .fld-fv .ax-t{fill:#93a08f;font:400 9px 'Space Mono',monospace;letter-spacing:.1em}
      .fld-fv .dot{fill:#a3e635;opacity:0;animation:fvDot 3.4s ease-out infinite}
      .fld-fv .zone{fill:#a3e635;opacity:.07}
      @keyframes fvDraw{0%{stroke-dashoffset:420}60%,100%{stroke-dashoffset:0}}
      @keyframes fvDot{0%,40%{opacity:0}55%,100%{opacity:1}}
      @media (prefers-reduced-motion:reduce){.fld-fv .cv{animation:none;stroke-dashoffset:0}.fld-fv .dot{animation:none;opacity:1}}
    </style>
    <rect x="150" y="40" width="110" height="150" class="zone" rx="6"/>
    <line x1="55" y1="190" x2="360" y2="190" class="ax"/><line x1="55" y1="30" x2="55" y2="190" class="ax"/>
    <path d="M65,50 C120,58 175,105 230,140 C275,168 320,180 350,184" class="cv"/>
    <circle cx="72" cy="52" r="5" class="dot" style="animation-delay:.1s"/>
    <circle cx="205" cy="125" r="5" class="dot" style="animation-delay:.3s"/>
    <circle cx="345" cy="183" r="5" class="dot" style="animation-delay:.5s"/>
    <text x="86" y="48" class="lbl">MAX STRENGTH</text><text x="86" y="60" class="sub">heavy · slow</text>
    <text x="163" y="72" class="lbl">POWER</text><text x="163" y="84" class="sub">moderate load · fast</text>
    <text x="272" y="172" class="lbl">MAX SPEED</text><text x="272" y="184" class="sub">light · very fast</text>
    <text x="200" y="212" class="ax-t" text-anchor="middle">VELOCITY →</text>
    <text x="20" y="115" class="ax-t" transform="rotate(-90 20 115)" text-anchor="middle">FORCE →</text>
  </svg>`;

  // Where daily energy actually goes (Day 8)
  D.tdee_components = () => {
    const parts = [['BMR','60-70%',62,'#a3e635'],['NEAT','15-30%',22,'#84cc16'],['EXERCISE','5-10%',9,'#4d7c0f'],['TEF','~10%',7,'#365314']];
    let x = 30; const w = 340;
    const bars = parts.map(([n,p,pct,c],i)=>{
      const bw = (pct/100)*w, seg = `<g style="animation-delay:${i*.3}s" class="seg">
        <rect x="${x}" y="70" width="${bw}" height="46" fill="${c}" rx="3"/>
        <text x="${x+bw/2}" y="136" class="n">${n}</text>
        <text x="${x+bw/2}" y="150" class="p">${p}</text></g>`;
      x += bw + 3; return seg;
    }).join('');
    return `<svg viewBox="0 0 400 190" class="fld fld-tdee" role="img" aria-label="Total daily energy expenditure broken into BMR, NEAT, exercise and thermic effect of food">
      <style>
        .fld-tdee .n{fill:#f1f4ec;font:700 9px 'DM Sans',sans-serif;text-anchor:middle;letter-spacing:.08em}
        .fld-tdee .p{fill:#93a08f;font:400 8px 'Space Mono',monospace;text-anchor:middle}
        .fld-tdee .cap{fill:#93a08f;font:500 9px 'DM Sans',sans-serif;text-anchor:middle}
        .fld-tdee .ttl{fill:#a3e635;font:400 15px 'Bebas Neue',sans-serif;text-anchor:middle;letter-spacing:.14em}
        .fld-tdee .seg{opacity:0;animation:tdIn .6s ease-out forwards}
        @keyframes tdIn{to{opacity:1}}
        @media (prefers-reduced-motion:reduce){.fld-tdee .seg{animation:none;opacity:1}}
      </style>
      <text x="200" y="38" class="ttl">TOTAL DAILY ENERGY EXPENDITURE</text>
      ${bars}
      <text x="200" y="174" class="cap">Most programs only train the smallest slice. NEAT is the one clients forget.</text>
    </svg>`;
  };

  // Intensity zones by talk test (Day 12)
  D.intensity_zones = () => {
    const z = [['EASY','Full sentences comfortably','#365314'],['MODERATE','Talking, occasional pause','#4d7c0f'],
               ['HARD','Talking is difficult','#84cc16'],['VERY HARD','Short phrases only','#a3e635']];
    return `<svg viewBox="0 0 400 210" class="fld fld-iz" role="img" aria-label="Four training intensity zones described by how easily you can speak">
      <style>
        .fld-iz .n{fill:#050605;font:700 10px 'DM Sans',sans-serif;letter-spacing:.1em}
        .fld-iz .d{fill:#93a08f;font:500 9px 'DM Sans',sans-serif}
        .fld-iz .row{opacity:0;animation:izIn .5s ease-out forwards}
        .fld-iz .cap{fill:#93a08f;font:500 9px 'DM Sans',sans-serif;text-anchor:middle}
        @keyframes izIn{to{opacity:1}}
        @media (prefers-reduced-motion:reduce){.fld-iz .row{animation:none;opacity:1}}
      </style>
      ${z.map(([n,d,c],i)=>`<g class="row" style="animation-delay:${i*.35}s">
        <rect x="26" y="${20+i*42}" width="130" height="30" fill="${c}" rx="5"/>
        <text x="38" y="${39+i*42}" class="n">${n}</text>
        <text x="172" y="${39+i*42}" class="d">${d}</text></g>`).join('')}
      <text x="200" y="200" class="cap">No monitor needed — the talk test works anywhere.</text>
    </svg>`;
  };

  // Work : rest interval structure (Day 13)
  D.interval_structure = () => {
    const blocks = [[40,'WORK'],[20,'rest'],[40,'WORK'],[20,'rest'],[40,'WORK'],[20,'rest']];
    let x = 30;
    const bars = blocks.map(([w,t],i)=>{
      const width = w*2.6, work = t==='WORK';
      const b = `<g class="blk" style="animation-delay:${i*.45}s">
        <rect x="${x}" y="${work?55:75}" width="${width}" height="${work?60:22}" rx="4"
              fill="${work?'#a3e635':'#1f241f'}" stroke="${work?'none':'#2c332b'}"/>
        <text x="${x+width/2}" y="${work?92:90}" class="${work?'w':'r'}">${t}</text></g>`;
      x += width + 4; return b;
    }).join('');
    return `<svg viewBox="0 0 400 190" class="fld fld-int" role="img" aria-label="Interval structure alternating work blocks and shorter recovery blocks">
      <style>
        .fld-int .w{fill:#050605;font:700 10px 'DM Sans',sans-serif;text-anchor:middle;letter-spacing:.1em}
        .fld-int .r{fill:#93a08f;font:500 8px 'DM Sans',sans-serif;text-anchor:middle;letter-spacing:.08em}
        .fld-int .ttl{fill:#a3e635;font:400 14px 'Bebas Neue',sans-serif;letter-spacing:.14em}
        .fld-int .cap{fill:#93a08f;font:500 9px 'DM Sans',sans-serif;text-anchor:middle}
        .fld-int .blk{opacity:0;animation:intIn .45s ease-out forwards}
        @keyframes intIn{to{opacity:1}}
        @media (prefers-reduced-motion:reduce){.fld-int .blk{animation:none;opacity:1}}
      </style>
      <text x="30" y="36" class="ttl">40s WORK : 20s REST — a 2:1 ratio</text>
      ${bars}
      <text x="200" y="150" class="cap">Shorten the rest and fatigue accumulates. Lengthen it and quality returns.</text>
      <text x="200" y="168" class="cap">Both are valid — but only if you chose it deliberately.</text>
    </svg>`;
  };

  // Endurance intensity pyramid (Day 14)
  D.endurance_pyramid = () => `<svg viewBox="0 0 400 230" class="fld fld-ep" role="img" aria-label="Endurance training pyramid with a large easy aerobic base and a small hard peak">
    <style>
      .fld-ep .lay{opacity:0;animation:epIn .55s ease-out forwards}
      .fld-ep .n{fill:#050605;font:700 10px 'DM Sans',sans-serif;text-anchor:middle;letter-spacing:.08em}
      .fld-ep .p{fill:#93a08f;font:400 9px 'Space Mono',monospace;text-anchor:middle}
      .fld-ep .cap{fill:#93a08f;font:500 9px 'DM Sans',sans-serif;text-anchor:middle}
      @keyframes epIn{to{opacity:1}}
      @media (prefers-reduced-motion:reduce){.fld-ep .lay{animation:none;opacity:1}}
    </style>
    <g class="lay" style="animation-delay:0s"><polygon points="60,175 340,175 310,135 90,135" fill="#365314"/>
      <text x="200" y="160" class="n">EASY AEROBIC BASE</text></g>
    <g class="lay" style="animation-delay:.4s"><polygon points="90,133 310,133 285,95 115,95" fill="#4d7c0f"/>
      <text x="200" y="119" class="n">STEADY / MODERATE</text></g>
    <g class="lay" style="animation-delay:.8s"><polygon points="115,93 285,93 262,58 138,58" fill="#84cc16"/>
      <text x="200" y="80" class="n">THRESHOLD</text></g>
    <g class="lay" style="animation-delay:1.2s"><polygon points="138,56 262,56 200,20" fill="#a3e635"/>
      <text x="200" y="48" class="n">HARD</text></g>
    <text x="200" y="200" class="p">roughly 80% easy · 20% hard</text>
    <text x="200" y="218" class="cap">Not every endurance session should be hard.</text>
  </svg>`;

  // Goal hierarchy for hybrid clients (Day 18, 26)
  D.goal_hierarchy = () => `<div class="fld-gh">
    <style>
      .fld-gh{display:grid;gap:10px;padding:6px 2px}
      .fld-gh .g{display:flex;align-items:center;gap:12px;padding:13px 16px;border-radius:10px;
        border:1px solid #2c332b;background:#0d0f0d;opacity:0;animation:ghIn .5s ease-out forwards}
      .fld-gh .g:nth-child(1){animation-delay:.1s;border-color:#a3e635;background:color-mix(in srgb,var(--lime) 8%,transparent)}
      .fld-gh .g:nth-child(2){animation-delay:.5s}
      .fld-gh .g:nth-child(3){animation-delay:.9s;opacity:.7}
      .fld-gh .tier{font:400 11px 'Space Mono',monospace;letter-spacing:.14em;color:#a3e635;min-width:96px}
      .fld-gh .lab{font:700 13px 'DM Sans',sans-serif;color:#f1f4ec}
      .fld-gh .note{font:500 11px 'DM Sans',sans-serif;color:#93a08f;margin-left:auto;text-align:right}
      .fld-gh .cap{font:500 11px 'DM Sans',sans-serif;color:#93a08f;text-align:center;margin-top:6px}
      @keyframes ghIn{to{opacity:1}}
      @media (prefers-reduced-motion:reduce){.fld-gh .g{animation:none;opacity:1}}
    </style>
    <div class="g"><span class="tier">PRIMARY</span><span class="lab">Gets the recovery</span><span class="note">most volume · programmed first</span></div>
    <div class="g"><span class="tier">SECONDARY</span><span class="lab">Improves, doesn't dominate</span><span class="note">reduced volume</span></div>
    <div class="g"><span class="tier">MAINTENANCE</span><span class="lab">Just holds its ground</span><span class="note">minimum effective dose</span></div>
    <div class="cap">You cannot maximise everything at once. Choose, or the schedule chooses for you.</div>
  </div>`;

  // AMRAP vs EMOM (Day 19)
  D.amrap_emom = () => `<svg viewBox="0 0 400 220" class="fld fld-ae" role="img" aria-label="AMRAP accumulates rounds in a fixed window while EMOM gives recovery based on how fast you finish">
    <style>
      .fld-ae .ttl{fill:#a3e635;font:400 14px 'Bebas Neue',sans-serif;letter-spacing:.14em}
      .fld-ae .d{fill:#93a08f;font:500 9px 'DM Sans',sans-serif}
      .fld-ae .box{fill:#0d0f0d;stroke:#2c332b;stroke-width:1.5;rx:4}
      .fld-ae .fill{fill:#a3e635}
      .fld-ae .rest{fill:#1f241f}
      .fld-ae .t{fill:#050605;font:700 8px 'DM Sans',sans-serif;text-anchor:middle}
      .fld-ae .rt{fill:#93a08f;font:500 8px 'DM Sans',sans-serif;text-anchor:middle}
      .fld-ae .bar{transform-origin:left center;animation:aeGrow 3.2s ease-out infinite}
      @keyframes aeGrow{0%{transform:scaleX(0)}70%,100%{transform:scaleX(1)}}
      @media (prefers-reduced-motion:reduce){.fld-ae .bar{animation:none}}
    </style>
    <text x="26" y="30" class="ttl">AMRAP — 15 MIN</text>
    <rect x="26" y="42" width="348" height="34" class="box"/>
    <rect x="28" y="44" width="344" height="30" class="fill bar" rx="3"/>
    <text x="200" y="64" class="t">AS MANY QUALITY ROUNDS AS YOU CAN SUSTAIN</text>
    <text x="26" y="94" class="d">Pace it. Sprinting the first minute costs you the last ten.</text>
    <text x="26" y="132" class="ttl">EMOM — EVERY MINUTE ON THE MINUTE</text>
    ${[0,1,2,3].map(i=>`<g><rect x="${26+i*88}" y="144" width="52" height="30" class="fill" rx="3"/>
      <text x="${52+i*88}" y="164" class="t">WORK</text>
      <rect x="${80+i*88}" y="150" width="30" height="18" class="rest" rx="3"/>
      <text x="${95+i*88}" y="163" class="rt">rest</text></g>`).join('')}
    <text x="26" y="196" class="d">Finish faster, rest longer. The prescription decides the recovery —</text>
    <text x="26" y="210" class="d">so it has to match what the athlete can actually hold.</text>
  </svg>`;

  // HYROX race map (Day 20)
  D.hyrox_map = () => {
    const st = ['SkiErg','Sled Push','Sled Pull','Burpee BJ','Row','Farmers','Lunges','Wall Balls'];
    return `<svg viewBox="0 0 400 240" class="fld fld-hx" role="img" aria-label="HYROX alternates eight one-kilometre runs with eight functional stations">
      <style>
        .fld-hx .run{fill:#1f241f;stroke:#2c332b;stroke-width:1}
        .fld-hx .stn{fill:#a3e635}
        .fld-hx .rt{fill:#93a08f;font:400 7px 'Space Mono',monospace;text-anchor:middle}
        .fld-hx .st{fill:#050605;font:700 7px 'DM Sans',sans-serif;text-anchor:middle}
        .fld-hx .ttl{fill:#a3e635;font:400 14px 'Bebas Neue',sans-serif;letter-spacing:.14em}
        .fld-hx .cap{fill:#93a08f;font:500 9px 'DM Sans',sans-serif;text-anchor:middle}
        .fld-hx .pair{opacity:0;animation:hxIn .4s ease-out forwards}
        @keyframes hxIn{to{opacity:1}}
        @media (prefers-reduced-motion:reduce){.fld-hx .pair{animation:none;opacity:1}}
      </style>
      <text x="26" y="30" class="ttl">8 × (1KM RUN → STATION)</text>
      ${st.map((s,i)=>{const row=Math.floor(i/4), col=i%4, x=26+col*90, y=48+row*82;
        return `<g class="pair" style="animation-delay:${i*.22}s">
          <rect x="${x}" y="${y}" width="82" height="24" rx="4" class="run"/>
          <text x="${x+41}" y="${y+16}" class="rt">1 KM RUN</text>
          <rect x="${x}" y="${y+28}" width="82" height="26" rx="4" class="stn"/>
          <text x="${x+41}" y="${y+45}" class="st">${s.toUpperCase()}</text></g>`;}).join('')}
      <text x="200" y="228" class="cap">You never fully recover between them — that's the whole coaching problem.</text>
    </svg>`;
  };

  // Boxing round demand (Day 21)
  D.boxing_round = () => `<svg viewBox="0 0 400 210" class="fld fld-bx" role="img" aria-label="A boxing round mixes explosive bursts, hard exchanges and aerobic recovery">
    <style>
      .fld-bx .base{stroke:#2c332b;stroke-width:1.5;fill:none}
      .fld-bx .wave{fill:none;stroke:#a3e635;stroke-width:2.5;stroke-dasharray:600;stroke-dashoffset:600;animation:bxDraw 4s linear infinite}
      .fld-bx .k{font:400 8px 'Space Mono',monospace;letter-spacing:.08em}
      .fld-bx .ttl{fill:#a3e635;font:400 14px 'Bebas Neue',sans-serif;letter-spacing:.14em}
      .fld-bx .cap{fill:#93a08f;font:500 9px 'DM Sans',sans-serif;text-anchor:middle}
      @keyframes bxDraw{0%{stroke-dashoffset:600}80%,100%{stroke-dashoffset:0}}
      @media (prefers-reduced-motion:reduce){.fld-bx .wave{animation:none;stroke-dashoffset:0}}
    </style>
    <text x="26" y="28" class="ttl">ONE ROUND — ALL THREE SYSTEMS</text>
    <line x1="40" y1="150" x2="370" y2="150" class="base"/>
    <path d="M45,140 L70,140 L78,62 L92,62 L100,132 L130,132 L138,58 L152,58 L160,128 L200,128
             L208,70 L222,70 L230,138 L268,138 L276,55 L290,55 L298,130 L340,130 L348,120 L368,120" class="wave"/>
    <text x="80" y="52" class="k" fill="#a3e635" text-anchor="middle">BURST</text>
    <text x="185" y="120" class="k" fill="#93a08f" text-anchor="middle">recover</text>
    <text x="283" y="45" class="k" fill="#a3e635" text-anchor="middle">EXCHANGE</text>
    <text x="200" y="176" class="cap">Explosive bursts (phosphagen) · hard exchanges (glycolytic)</text>
    <text x="200" y="192" class="cap">· recovery between them (aerobic). Train only one and the round exposes it.</text>
  </svg>`;

  // Scope of practice boundary (Day 22)
  D.scope_boundary = () => `<div class="fld-sc">
    <style>
      .fld-sc{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:4px 2px}
      .fld-sc .col{border-radius:10px;padding:14px;border:1px solid #2c332b;opacity:0;animation:scIn .5s ease-out forwards}
      .fld-sc .yes{border-color:color-mix(in srgb,var(--lime) 40%,transparent);background:color-mix(in srgb,var(--lime) 7%,transparent);animation-delay:.1s}
      .fld-sc .no{border-color:rgba(248,113,113,.35);background:rgba(248,113,113,.06);animation-delay:.5s}
      .fld-sc h4{margin:0 0 10px;font:400 15px 'Bebas Neue',sans-serif;letter-spacing:.12em}
      .fld-sc .yes h4{color:#a3e635}.fld-sc .no h4{color:#f87171}
      .fld-sc ul{margin:0;padding-left:16px;list-style:none}
      .fld-sc li{font:500 11px 'DM Sans',sans-serif;color:#93a08f;margin-bottom:7px;position:relative;line-height:1.4}
      .fld-sc li:before{position:absolute;left:-15px}
      .fld-sc .yes li:before{content:'✓';color:#a3e635}
      .fld-sc .no li:before{content:'✕';color:#f87171}
      .fld-sc .cap{grid-column:1/-1;font:500 11px 'DM Sans',sans-serif;color:#93a08f;text-align:center;margin-top:4px}
      @keyframes scIn{to{opacity:1}}
      @media (max-width:520px){.fld-sc{grid-template-columns:1fr}}
      @media (prefers-reduced-motion:reduce){.fld-sc .col{animation:none;opacity:1}}
    </style>
    <div class="col yes"><h4>YOU CAN</h4><ul>
      <li>Assess movement and fitness</li><li>Teach, modify and progress exercise</li>
      <li>Monitor response and adjust</li><li>Encourage healthy lifestyle habits</li>
      <li>Communicate with their healthcare team</li></ul></div>
    <div class="col no"><h4>YOU MUST NOT</h4><ul>
      <li>Diagnose disease</li><li>Change medication or insulin</li>
      <li>Interpret lab results clinically</li><li>Treat complications</li>
      <li>Claim exercise cures a condition</li></ul></div>
    <div class="cap">Competence is knowing exactly where this line sits — and saying so out loud.</div>
  </div>`;

  // Exercise modification ladder (Days 23, 24)
  D.modification_ladder = () => {
    const steps = [['LOAD','lighten it'],['RANGE','shorten it'],['TEMPO','slow it down'],
                   ['VOLUME','fewer sets'],['FREQUENCY','less often'],['VARIATION','different exercise']];
    return `<div class="fld-ml">
      <style>
        .fld-ml{display:grid;gap:8px;padding:4px 2px}
        .fld-ml .s{display:flex;align-items:center;gap:12px;padding:11px 15px;border-radius:9px;
          border:1px solid #2c332b;background:#0d0f0d;opacity:0;animation:mlIn .45s ease-out forwards}
        .fld-ml .num{font:400 10px 'Space Mono',monospace;color:#a3e635;min-width:20px}
        .fld-ml .k{font:700 12px 'DM Sans',sans-serif;color:#f1f4ec;letter-spacing:.08em;min-width:96px}
        .fld-ml .v{font:500 11px 'DM Sans',sans-serif;color:#93a08f}
        .fld-ml .cap{font:500 11px 'DM Sans',sans-serif;color:#93a08f;text-align:center;margin-top:6px}
        @keyframes mlIn{to{opacity:1}}
        @media (prefers-reduced-motion:reduce){.fld-ml .s{animation:none;opacity:1}}
      </style>
      ${steps.map(([k,v],i)=>`<div class="s" style="animation-delay:${i*.22}s">
        <span class="num">0${i+1}</span><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}
      <div class="cap">Work down the ladder before you ever conclude "they can't do this exercise."</div>
    </div>`;
  };

  // Five goal templates side by side (Day 26)
  D.five_templates = () => {
    const t = [['FAT LOSS','deficit · preserve muscle','3-4 lift · 2-4 cardio'],
               ['MUSCLE','modest surplus · volume','3-5 lift · light cardio'],
               ['STRENGTH','heavy · low reps · rest','3-5 lift · minimal cardio'],
               ['ENDURANCE','aerobic base · 80/20','3-5 cardio · 2 lift'],
               ['HYBRID','pick a primary goal','built from the primary']];
    return `<div class="fld-ft">
      <style>
        .fld-ft{display:grid;gap:8px;padding:4px 2px}
        .fld-ft .r{display:grid;grid-template-columns:104px 1fr auto;gap:12px;align-items:center;
          padding:11px 14px;border-radius:9px;border:1px solid #2c332b;background:#0d0f0d;
          opacity:0;animation:ftIn .45s ease-out forwards}
        .fld-ft .r:last-of-type{border-color:color-mix(in srgb,var(--lime) 35%,transparent);background:color-mix(in srgb,var(--lime) 6%,transparent)}
        .fld-ft .k{font:400 13px 'Bebas Neue',sans-serif;color:#a3e635;letter-spacing:.1em}
        .fld-ft .v{font:500 11px 'DM Sans',sans-serif;color:#93a08f}
        .fld-ft .n{font:400 9px 'Space Mono',monospace;color:#93a08f;white-space:nowrap}
        .fld-ft .cap{font:500 11px 'DM Sans',sans-serif;color:#93a08f;text-align:center;margin-top:6px}
        @keyframes ftIn{to{opacity:1}}
        @media (max-width:560px){.fld-ft .r{grid-template-columns:1fr}.fld-ft .n{display:none}}
        @media (prefers-reduced-motion:reduce){.fld-ft .r{animation:none;opacity:1}}
      </style>
      ${t.map(([k,v,n],i)=>`<div class="r" style="animation-delay:${i*.2}s">
        <span class="k">${k}</span><span class="v">${v}</span><span class="n">${n}</span></div>`).join('')}
      <div class="cap">Same process every time. Only the dials change.</div>
    </div>`;
  };



  // ===== BATCH 2 — visuals for days 7-29 =====

  // Force-velocity: strength vs power (Days 7, 17)
  D.force_velocity = () => `
    <svg viewBox="0 0 400 230" class="fld fld-fv" role="img" aria-label="Force-velocity curve: heavy slow lifting at one end, fast light movement at the other, power peaks in between">
      <line x1="52" y1="185" x2="375" y2="185" stroke="var(--line)" stroke-width="1.5"/>
      <line x1="52" y1="185" x2="52" y2="24" stroke="var(--line)" stroke-width="1.5"/>
      <text x="20" y="30" class="ax" transform="rotate(-90 20 30)">FORCE</text>
      <text x="330" y="207" class="ax">VELOCITY →</text>
      <path d="M62 52 C 140 66, 210 124, 368 178" fill="none" stroke="var(--lime)" stroke-width="2.5"
            stroke-linecap="round" class="fv-line"/>
      <g class="fv-pt" style="animation-delay:.2s"><circle cx="70" cy="56" r="5.5"/>
        <text x="94" y="42" class="lb">MAX STRENGTH</text><text x="94" y="55" class="sm">heavy · slow</text></g>
      <g class="fv-pt" style="animation-delay:1.1s"><circle cx="200" cy="112" r="6"/>
        <text x="216" y="92" class="lb">POWER</text><text x="216" y="105" class="sm">moderate load · fast</text></g>
      <g class="fv-pt" style="animation-delay:2s"><circle cx="352" cy="172" r="6"/>
        <text x="196" y="196" class="lb">SPEED</text><text x="256" y="196" class="sm">light · max velocity</text></g>
    </svg>`;

  // Where daily energy actually goes (Day 8)
  D.tdee_components = () => {
    const parts = [['BMR', 60, 'Basic physiological function'], ['NEAT', 20, 'Walking, standing, daily movement'],
                   ['EXERCISE', 12, 'Planned training'], ['TEF', 8, 'Digesting food']];
    let acc = 0;
    return `<div class="fld-tdee" role="img" aria-label="Total daily energy expenditure split into BMR, NEAT, exercise and thermic effect of food">
      <div class="bar">${parts.map(([n, v], i) => { const l = acc; acc += v;
        return `<span class="seg s${i}" style="left:${l}%;width:${v}%;animation-delay:${i * .35}s" title="${n} ~${v}%"></span>`; }).join('')}</div>
      <div class="key">${parts.map(([n, v, d], i) => `<div class="k" style="animation-delay:${i * .35 + .2}s">
        <i class="s${i}"></i><b>${n}</b><span class="mono">~${v}%</span><em>${d}</em></div>`).join('')}</div>
      <p>Proportions vary a lot between individuals. The point: planned exercise is usually the <em>smallest</em> slice — NEAT is the one most programs ignore.</p>
    </div>`;
  };

  // Macro roles, not good/bad food (Day 9)
  D.macro_plate = () => `
    <div class="fld-macro" role="img" aria-label="The three macronutrients and their roles">
      ${[['PROTEIN', '1.6–2.2 g/kg', 'Repair, enzymes, muscle maintenance', 'Eggs · dal · curd · chicken · fish · soy'],
         ['CARBOHYDRATE', 'Goal-dependent', 'Energy, glycogen, training performance', 'Rice · roti · oats · millet · fruit'],
         ['FAT', '~20–35% of intake', 'Cell structure, vitamin absorption, hormones', 'Nuts · seeds · oils · ghee · dairy']]
        .map(([n, amt, role, src], i) => `<div class="m" style="animation-delay:${i * .4}s">
          <div class="mh"><b>${n}</b><span class="mono">${amt}</span></div>
          <div class="mr">${role}</div><div class="ms">${src}</div></div>`).join('')}
      <p>No macronutrient is "bad". Each has a job — the dose and the source is the coaching decision.</p>
    </div>`;

  // Deficit / maintenance / surplus (Day 10)
  D.energy_scale = () => `
    <div class="fld-scale" role="img" aria-label="Energy balance: deficit drives fat loss, surplus supports muscle gain">
      ${[['DEFICIT', '−10 to −25%', 'Fat loss', 'lo'], ['MAINTENANCE', '≈ TDEE', 'Weight stable', 'mid'],
         ['SURPLUS', '+5 to +15%', 'Muscle gain', 'hi']]
        .map(([n, v, r, c], i) => `<div class="sc ${c}" style="animation-delay:${i * .45}s">
          <b>${n}</b><span class="mono">${v}</span><em>${r}</em></div>`).join('')}
      <p>A bigger surplus does not build muscle faster — the body's rate of tissue gain is limited. Excess energy beyond that becomes fat.</p>
    </div>`;

  // Talk test zones (Day 12)
  D.talk_test = () => `
    <div class="fld-talk" role="img" aria-label="Talk test intensity zones from easy conversation to single words">
      ${[['EASY', 'Full sentences, comfortably', 1], ['MODERATE', 'Talking, with occasional pauses', 2],
         ['HARD', 'Talking becomes difficult', 3], ['VERY HARD', 'Short phrases or single words', 4]]
        .map(([z, d, lvl], i) => `<div class="tz l${lvl}" style="animation-delay:${i * .4}s">
          <span class="dots">${'●'.repeat(lvl)}${'○'.repeat(4 - lvl)}</span><b>${z}</b><em>${d}</em></div>`).join('')}
      <p>No monitor, no lab, no equipment — the most practical intensity tool you own.</p>
    </div>`;

  // Interval structure — work/rest (Day 13)
  D.interval_structure = () => `
    <svg viewBox="0 0 400 190" class="fld fld-int" role="img" aria-label="Interval structure: work blocks separated by recovery, with the ratio changing the stimulus">
      <text x="14" y="26" class="lb">30s WORK : 90s RECOVERY — 1:3</text>
      ${[0, 1, 2].map((i) => `<g><rect x="${20 + i * 120}" y="38" width="30" height="26" rx="4" class="w"
        style="animation-delay:${i * .5}s"/><rect x="${50 + i * 120}" y="45" width="88" height="12" rx="6" class="r"
        style="animation-delay:${i * .5 + .2}s"/></g>`).join('')}
      <text x="14" y="106" class="lb">40s WORK : 20s RECOVERY — 2:1</text>
      ${[0, 1, 2, 3, 4].map((i) => `<g><rect x="${20 + i * 72}" y="118" width="46" height="26" rx="4" class="w"
        style="animation-delay:${i * .35}s"/><rect x="${66 + i * 72}" y="125" width="22" height="12" rx="6" class="r"
        style="animation-delay:${i * .35 + .15}s"/></g>`).join('')}
      <text x="14" y="164" class="sm">Shorter recovery = more fatigue and lower output on later intervals.</text>
      <text x="14" y="176" class="sm">Neither ratio is "better" — they train different things.</text>
    </svg>`;

  // Endurance intensity pyramid (Day 14)
  D.endurance_pyramid = () => `
    <div class="fld-pyr" role="img" aria-label="Endurance training pyramid: mostly easy work at the base, small amount of hard work at the top">
      ${[['SPORT-SPECIFIC', 'Race pace, event demands', 20],
         ['THRESHOLD / HARD', 'Sustained high intensity', 40],
         ['AEROBIC ENDURANCE', 'Moderate, repeatable volume', 68],
         ['GENERAL AEROBIC BASE', 'Easy, conversational, high volume', 96]]
        .map(([n, d, w], i) => `<div class="py" style="width:${w}%;animation-delay:${(3 - i) * .4}s">
          <b>${n}</b><em>${d}</em></div>`).join('')}
      <p>Roughly 80% easy / 20% hard is a common framework — not a universal law. The real lesson: <em>not every session should be hard.</em></p>
    </div>`;

  // Primary / secondary / maintenance (Day 18)
  D.goal_hierarchy = () => `
    <div class="fld-goals" role="img" aria-label="Goal hierarchy: one primary goal, secondary goals, and maintenance goals">
      ${[['PRIMARY', 'Gets the most volume, freshest sessions, and drives the whole week', 'p'],
         ['SECONDARY', 'Improves, but never at the expense of the primary goal', 's'],
         ['MAINTENANCE', 'Just enough work to hold it where it is', 'm']]
        .map(([n, d, c], i) => `<div class="g ${c}" style="animation-delay:${i * .45}s"><b>${n}</b><span>${d}</span></div>`).join('')}
      <p>You cannot maximise everything at once. Recovery is finite — choosing a primary goal is the first real programming decision.</p>
    </div>`;

  // AMRAP vs EMOM (Day 19)
  D.wod_formats = () => `
    <div class="fld-wod" role="img" aria-label="AMRAP and EMOM workout formats compared">
      <div class="f" style="animation-delay:.1s"><b>AMRAP</b><span class="mono">As many rounds/reps as possible</span>
        <div class="tl"><i style="width:100%"></i></div>
        <em>Fixed time, variable work. Pacing decides the result — sprinting the first minute is the classic mistake.</em></div>
      <div class="f" style="animation-delay:.5s"><b>EMOM</b><span class="mono">Every minute on the minute</span>
        <div class="tl emom">${[0,1,2,3,4].map((i) => `<i style="animation-delay:${i * .3}s"></i>`).join('')}</div>
        <em>Fixed work, variable rest. Finish in 30s → 30s recovery. Finish in 55s → almost none. The prescription must match capacity.</em></div>
    </div>`;

  // HYROX course map (Day 20)
  D.hyrox_map = () => {
    const stations = ['SkiErg', 'Sled push', 'Sled pull', 'Burpee broad jump', 'Row', 'Farmers carry', 'Sandbag lunges', 'Wall balls'];
    return `<div class="fld-hyrox" role="img" aria-label="HYROX structure: eight one-kilometre runs alternating with eight functional stations">
      <div class="track">${stations.map((s, i) => `
        <span class="run" style="animation-delay:${i * .22}s"><i>1 km</i></span>
        <span class="st" style="animation-delay:${i * .22 + .1}s">${s}</span>`).join('')}</div>
      <p>8 runs · 8 stations · no full recovery between them. Performance on one directly affects the next — which is why "run more" or "get stronger" alone doesn't prepare anyone for it.</p>
    </div>`;
  };

  // Boxing round demand (Day 21)
  D.round_demand = () => `
    <svg viewBox="0 0 400 170" class="fld fld-round" role="img" aria-label="A boxing round is intermittent: bursts of explosive work over a continuous aerobic base">
      <text x="14" y="24" class="lb">ONE ROUND — INTERMITTENT, NOT CONTINUOUS</text>
      <rect x="18" y="96" width="364" height="26" rx="4" class="base"/>
      <text x="24" y="113" class="sm2">AEROBIC BASE — recovery between exchanges</text>
      ${[[40, 22], [96, 16], [150, 28], [214, 18], [262, 24], [322, 20]].map(([x, w], i) =>
        `<rect x="${x}" y="${52 - w}" width="${w}" height="${w + 40}" rx="3" class="burst" style="animation-delay:${i * .4}s"/>`).join('')}
      <text x="14" y="150" class="sm">Explosive bursts (phosphagen) · repeated hard efforts (glycolytic) · recovery between them (aerobic). All three, every round.</text>
    </svg>`;

  // Scope of practice (Day 22)
  D.scope_ladder = () => `
    <div class="fld-scope" role="img" aria-label="What a fitness coach can and cannot do with medical populations">
      <div class="col can" style="animation-delay:.1s"><b>YOU CAN</b><ul>
        <li>Assess movement and fitness</li><li>Teach and modify exercise</li><li>Progress training safely</li>
        <li>Monitor response</li><li>Encourage healthy habits</li><li>Communicate with their care team</li></ul></div>
      <div class="col cant" style="animation-delay:.5s"><b>YOU SHOULD NOT</b><ul>
        <li>Diagnose any condition</li><li>Change medication or insulin</li><li>Interpret lab results</li>
        <li>Treat complications</li><li>Claim exercise "cures" a condition</li><li>Guess when unsure — refer</li></ul></div>
    </div>`;

  // Modification ladder (Days 23, 24)
  D.modification_ladder = () => `
    <div class="fld-modlad" role="img" aria-label="Modification ladder: load, range, tempo, volume, frequency, variation">
      ${[['LOAD', 'Reduce the weight first'], ['RANGE', 'Shorten the range of motion'],
         ['TEMPO', 'Slow it down, add control'], ['VOLUME', 'Fewer sets'],
         ['FREQUENCY', 'Less often'], ['VARIATION', 'A different version of the movement']]
        .map(([n, d], i) => `<div class="ml" style="animation-delay:${i * .3}s">
          <span class="n mono">${i + 1}</span><b>${n}</b><em>${d}</em></div>`).join('')}
      <p>Six options before you ever conclude "this client can't squat". Banning a whole movement pattern is the last resort, not the first response.</p>
    </div>`;

  // Five goal templates (Day 26)
  D.goal_templates = () => `
    <div class="fld-tmpl" role="img" aria-label="Five program templates and what changes between them">
      <div class="th"><span>GOAL</span><span>RESISTANCE</span><span>CARDIO</span><span>NUTRITION</span></div>
      ${[['FAT LOSS', '3–4× · RIR 1–3', '2–4× mixed', 'Moderate deficit'],
         ['MUSCLE GAIN', '3–5× · RIR 1–3', 'Light–moderate', 'Small surplus'],
         ['STRENGTH', '3–5× · 1–6 reps', 'Light, separated', 'Maintenance+'],
         ['ENDURANCE', '2× supporting', '3–5× polarised', 'Fuel the work'],
         ['HYBRID', 'From primary goal', 'From primary goal', 'From primary goal']]
        .map((r, i) => `<div class="tr" style="animation-delay:${i * .3}s">${r.map((c, j) =>
          `<span${j === 0 ? ' class="g"' : ''}>${c}</span>`).join('')}</div>`).join('')}
      <p>The process never changes — consultation, assessment, movement patterns, overload, monitoring. Only these dials move.</p>
    </div>`;

  // Adherence over time (Day 28)
  D.adherence_curve = () => `
    <svg viewBox="0 0 400 210" class="fld fld-adh" role="img" aria-label="A good but abandoned program produces nothing; a sustainable program compounds over time">
      <line x1="48" y1="170" x2="378" y2="170" stroke="var(--line)" stroke-width="1.5"/>
      <line x1="48" y1="170" x2="48" y2="22" stroke="var(--line)" stroke-width="1.5"/>
      <text x="300" y="192" class="ax">TIME →</text>
      <text x="18" y="34" class="ax" transform="rotate(-90 18 34)">RESULT</text>
      <path d="M48 170 C 90 140, 110 128, 128 126" fill="none" stroke="#f87171" stroke-width="2.5" class="adh-a"/>
      <circle cx="128" cy="126" r="5" fill="#f87171" class="adh-x"/>
      <text x="136" y="122" class="lb" style="fill:#f87171">Abandoned week 3</text>
      <text x="136" y="136" class="sm">"perfect" program, not followed</text>
      <path d="M48 170 C 140 158, 240 110, 372 44" fill="none" stroke="var(--lime)" stroke-width="2.5" class="adh-b"/>
      <text x="196" y="86" class="lb">Sustained for a year</text>
      <text x="196" y="100" class="sm">good program, actually followed</text>
    </svg>`;

  // Layered real client (Day 29)
  D.case_layers = () => `
    <div class="fld-caselayers" role="img" aria-label="A real client arrives with several overlapping factors at once">
      <div class="hub">ONE<br>CLIENT</div>
      ${[['MEDICAL', 'Diagnosis, medication, complications'], ['MOVEMENT', 'Limitations, pain, competency'],
         ['TRAINING AGE', 'Beginner in one quality, advanced in another'], ['LIFE', 'Sleep, stress, schedule, budget'],
         ['GOALS', 'Often several, often competing'], ['HISTORY', 'Past coaching, past failures, trust']]
        .map(([n, d], i) => `<div class="ly" style="animation-delay:${i * .3}s"><b>${n}</b><em>${d}</em></div>`).join('')}
      <p>No real client arrives as a single clean textbook problem. The skill isn't memorising every combination — it's running the same framework, freshly, every time.</p>
    </div>`;

  window.FLD = {
    render(name, opts) { const f = D[name]; return f ? f(opts) : ''; },
    has(name) { return !!D[name]; }
  };
})();
