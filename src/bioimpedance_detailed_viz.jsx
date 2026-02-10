import { useState } from "react";

// ─── INJURY SCENARIO DATA ───
const scenarios = {
  healthy: {
    label: "Healthy Baseline",
    color: "#27ae60",
    bgColor: "#d5f5e3",
    icon: "✓",
    description: "Well-rested athlete, 48+ hours since last training. All tissue structures intact, normal hydration.",
    data: { phaseAngle: 8.5, R0: 385, Rinf: 220, Xc: 54, alpha: 0.86, fc: 130, icwEcw: 1.50, asymmetry: 1.8, Cm: 1.2 },
    freqTrail: [{f:"1k",r:410,xc:28},{f:"5k",r:400,xc:38},{f:"50k",r:375,xc:54},{f:"200k",r:345,xc:36}],
    bodeZ: [410,405,400,395,388,375,365,355,350,347,345],
    bodePhase: [3.9,5.4,6.8,7.6,8.1,8.5,7.8,6.5,5.8,5.3,5.0],
  },
  mildEIMD: {
    label: "Mild EIMD (24h post-eccentric)",
    color: "#f39c12",
    bgColor: "#fef9e7",
    icon: "●",
    description: "24 hours after heavy eccentric exercise. Micro-tears in sarcolemma, early inflammatory response beginning. Athlete reports mild soreness but full function.",
    data: { phaseAngle: 7.2, R0: 355, Rinf: 215, Xc: 44, alpha: 0.78, fc: 155, icwEcw: 1.30, asymmetry: 4.8, Cm: 0.95 },
    freqTrail: [{f:"1k",r:385,xc:25},{f:"5k",r:375,xc:33},{f:"50k",r:350,xc:44},{f:"200k",r:332,xc:30}],
    bodeZ: [390,386,380,375,367,355,345,338,335,333,332],
    bodePhase: [3.5,4.8,6.0,6.7,7.1,7.2,6.6,5.5,4.9,4.5,4.2],
    changes: [
      { metric: "Phase Angle", direction: "↓ 15%", why: "Cell membranes have micro-tears from eccentric loading. These tiny holes reduce the membrane's ability to store charge (capacitance), so the phase shift between current and voltage decreases. Think of it like a battery with small leaks — it still holds charge, but less efficiently." },
      { metric: "R₀", direction: "↓ 8%", why: "The inflammatory response has begun: blood vessels dilate and leak protein-rich fluid into the spaces between muscle fibers. This extra extracellular fluid is electrically conductive, so low-frequency resistance drops. The tissue is slightly 'wetter' than normal." },
      { metric: "Reactance (Xc)", direction: "↓ 19%", why: "Reactance drops more than resistance because it specifically reflects membrane integrity. Even small tears in the sarcolemma (muscle cell membrane) dramatically reduce the tissue's capacitive properties. This is why Xc is the most sensitive marker — it detects membrane damage before swelling becomes clinically obvious." },
      { metric: "α parameter", direction: "↓ 9%", why: "The tissue is becoming less uniform. Some fibers are damaged while neighbours are intact; some areas are inflamed while others are not. This patchwork of different cell states creates electrical heterogeneity, flattening the Cole-Cole semicircle." },
      { metric: "Bilateral asymmetry", direction: "↑ 167%", why: "The exercised limb shows clear differences from the resting limb. Even though both legs walked around all day, only the exercised leg has inflammatory changes. This makes bilateral comparison the most powerful detection method — it cancels out hydration, temperature, and time-of-day effects." },
    ]
  },
  severeEIMD: {
    label: "Severe EIMD (48h, peak damage)",
    color: "#e67e22",
    bgColor: "#fdebd0",
    icon: "▲",
    description: "48 hours post-exercise — the peak of delayed-onset muscle soreness (DOMS). Maximum edema, significant membrane disruption, elevated CK. Athlete has pain with movement and reduced strength.",
    data: { phaseAngle: 5.8, R0: 320, Rinf: 210, Xc: 34, alpha: 0.70, fc: 190, icwEcw: 1.05, asymmetry: 9.5, Cm: 0.72 },
    freqTrail: [{f:"1k",r:355,xc:22},{f:"5k",r:345,xc:28},{f:"50k",r:318,xc:34},{f:"200k",r:305,xc:22}],
    bodeZ: [360,356,350,344,335,322,314,310,308,306,305],
    bodePhase: [3.2,4.2,5.1,5.6,5.8,5.8,5.2,4.3,3.8,3.5,3.3],
    changes: [
      { metric: "Phase Angle", direction: "↓ 32%", why: "Massive membrane disruption at peak DOMS. The sarcolemma of hundreds of thousands of muscle fibers has been mechanically torn by eccentric loading. Intracellular contents (CK, myoglobin) are leaking out. The tissue's capacitive properties have collapsed — current passes through as if membranes barely exist." },
      { metric: "R₀", direction: "↓ 17%", why: "Peak edema: inflammatory mediators (histamine, prostaglandins) have maximally increased vascular permeability. The extracellular space is flooded with protein-rich exudate. Neutrophils are migrating into the tissue. All of this extra conductive fluid dramatically lowers resistance at low frequencies." },
      { metric: "fc (characteristic freq)", direction: "↑ 46%", why: "The characteristic frequency has shifted dramatically upward because damaged membranes have less total capacitance. Remember: fc = 1/(2πτ) and τ depends on membrane capacitance. Fewer intact membranes = less capacitance = higher fc. This is equivalent to the tissue 'ageing' — older/damaged tissue always has higher fc." },
      { metric: "ICW/ECW ratio", direction: "↓ 30%", why: "Cells are leaking their contents into the extracellular space (ICW decreasing) while inflammatory edema adds to extracellular volume (ECW increasing). This double effect makes ICW/ECW one of the most dramatic changes in severe damage." },
    ]
  },
  gradeI: {
    label: "Grade I Muscle Strain",
    color: "#e74c3c",
    bgColor: "#fadbd8",
    icon: "◆",
    description: "Minor muscle strain — less than 5% of fibers torn. Localised tenderness, mild swelling. Athlete felt a 'twinge' during sprint acceleration. Can walk normally but running is painful.",
    data: { phaseAngle: 7.0, R0: 340, Rinf: 212, Xc: 41, alpha: 0.75, fc: 160, icwEcw: 1.22, asymmetry: 6.2, Cm: 0.88 },
    freqTrail: [{f:"1k",r:370,xc:24},{f:"5k",r:362,xc:31},{f:"50k",r:338,xc:41},{f:"200k",r:320,xc:28}],
    bodeZ: [375,372,368,363,355,342,332,326,323,321,320],
    bodePhase: [3.4,4.6,5.7,6.3,6.8,7.0,6.4,5.4,4.8,4.4,4.1],
    changes: [
      { metric: "Resistance (R)", direction: "↓ 12%", why: "Localised bleeding from torn capillaries and early edema. Blood and inflammatory fluid are highly conductive, so resistance drops in the injured area. The drop is concentrated around the injury site — with our tetrapolar electrode configuration, we're measuring exactly this localised change." },
      { metric: "Reactance (Xc)", direction: "↓ 24%", why: "The torn fibers have lost membrane integrity completely in the injury zone, while surrounding fibers may have partial damage from the mechanical shockwave. The 24% drop (vs 12% for R) shows that membrane damage is disproportionately severe relative to fluid changes — this is the hallmark signature of a strain vs pure overload." },
      { metric: "Phase Angle", direction: "↓ 18%", why: "Combines the R and Xc changes. The fact that PhA drops more than R but less than Xc tells us this is membrane-dominant damage (strain) rather than fluid-dominant damage (contusion). This pattern helps differentiate injury mechanisms." },
    ]
  },
  gradeII: {
    label: "Grade II Muscle Strain",
    color: "#c0392b",
    bgColor: "#f1948a",
    icon: "■",
    description: "Moderate muscle strain — significant partial tear with visible swelling and bruising. MRI shows clear architectural distortion. Athlete cannot run and has pain at rest. Typical 3-6 week recovery.",
    data: { phaseAngle: 5.2, R0: 305, Rinf: 208, Xc: 28, alpha: 0.62, fc: 210, icwEcw: 0.88, asymmetry: 14.5, Cm: 0.58 },
    freqTrail: [{f:"1k",r:340,xc:18},{f:"5k",r:332,xc:23},{f:"50k",r:303,xc:28},{f:"200k",r:290,xc:18}],
    bodeZ: [345,342,338,332,322,308,298,294,292,291,290],
    bodePhase: [2.8,3.6,4.4,4.9,5.1,5.2,4.7,3.9,3.4,3.1,2.9],
    changes: [
      { metric: "R₀", direction: "↓ 21%", why: "Major hemorrhage and edema. The torn muscle has created a cavity filling with blood (hematoma) and inflammatory exudate. This large volume of highly conductive fluid creates a substantial low-resistance pathway. The 21% drop matches Nescolarde's published data from FC Barcelona players with Grade II injuries." },
      { metric: "Reactance (Xc)", direction: "↓ 48%", why: "Nearly half the reactance is gone. Large numbers of muscle fibers have been completely severed, destroying their membrane capacitance. The surviving membranes in the surrounding zone are under mechanical stress and becoming leaky. This is the most dramatic parameter change and explains why Nescolarde identified Xc as the 'sensitive indicator of graded muscle membrane damage.'" },
      { metric: "α parameter", direction: "↓ 27%", why: "The tissue is now extremely heterogeneous: there's a core of completely destroyed tissue, a penumbra of partially damaged fibers, an inflammatory zone with edema and immune cells, and an outer ring of intact muscle. This gradient of tissue states creates maximum electrical heterogeneity, dramatically flattening the Cole-Cole semicircle." },
      { metric: "Bilateral asymmetry", direction: "↑ 706%", why: "The injured limb is dramatically different from the healthy side. An asymmetry of 14.5% (vs baseline 1.8%) is impossible to explain by normal variation — it's unambiguous pathology. This is why bilateral comparison is rated 9/10 for predictive confidence: it virtually eliminates false positives." },
    ]
  },
  tendinopathy: {
    label: "Early Achilles Tendinopathy",
    color: "#8e44ad",
    bgColor: "#e8daef",
    icon: "◇",
    description: "Reactive tendinopathy — the early stage where collagen is beginning to disorganize and ground substance is accumulating. Tendon is thickened on ultrasound. Morning stiffness, pain with initial loading that 'warms up.'",
    data: { phaseAngle: 7.8, R0: 365, Rinf: 218, Xc: 48, alpha: 0.72, fc: 140, icwEcw: 1.38, asymmetry: 5.5, Cm: 1.05 },
    freqTrail: [{f:"1k",r:395,xc:26},{f:"5k",r:386,xc:34},{f:"50k",r:362,xc:48},{f:"200k",r:338,xc:32}],
    bodeZ: [398,394,390,386,378,365,355,348,342,340,338],
    bodePhase: [3.6,5.0,6.2,6.9,7.4,7.8,7.2,6.0,5.3,4.8,4.5],
    changes: [
      { metric: "α parameter", direction: "↓ 16%", why: "This is the standout metric for tendon pathology. Healthy tendon has highly organized parallel collagen bundles. In tendinopathy, this organization breaks down: collagen fibers become crimped, wavy, and disorganized. Ground substance (proteoglycans) accumulates between fibers. New blood vessels (neovascularization) grow into normally avascular tissue. All of this creates electrical heterogeneity that α captures beautifully — even before the tendon becomes painful." },
      { metric: "Phase Angle", direction: "↓ 8%", why: "Modest decrease because tendons have few cells to begin with. The small population of tenocytes (tendon cells) may be affected, but the bigger signal comes from the altered extracellular matrix rather than membrane damage. This is why PhA is rated only 5/10 for tendon injuries — it's not the primary signal source." },
      { metric: "R₀", direction: "↓ 5%", why: "Slight decrease from increased water content in the degenerating extracellular matrix and mild peritendinous edema. The change is subtle because tendons have high baseline impedance (dense collagen) and the edema is less dramatic than in muscle injury. But over serial measurements, a consistent downward trend in R₀ is meaningful." },
      { metric: "Bilateral asymmetry", direction: "↑ 206%", why: "Tendinopathy is almost always unilateral initially (one Achilles, not both). The contralateral tendon provides an excellent control. Even modest changes become detectable because the baseline asymmetry for tendon measurements is very low (healthy tendons are remarkably symmetric)." },
    ]
  },
  fatigue: {
    label: "Cumulative Fatigue (Overtraining)",
    color: "#2980b9",
    bgColor: "#d6eaf8",
    icon: "~",
    description: "End of a heavy training block — 3 weeks of progressive overload without adequate recovery. No acute injury, but the tissue is approaching its limits. Athlete reports 'heavy legs' and reduced performance but no specific pain.",
    data: { phaseAngle: 7.6, R0: 362, Rinf: 216, Xc: 47, alpha: 0.80, fc: 142, icwEcw: 1.35, asymmetry: 4.0, Cm: 1.02 },
    freqTrail: [{f:"1k",r:392,xc:27},{f:"5k",r:383,xc:35},{f:"50k",r:360,xc:47},{f:"200k",r:336,xc:33}],
    bodeZ: [396,392,388,383,375,362,352,344,340,338,336],
    bodePhase: [3.7,5.1,6.3,7.0,7.4,7.6,7.0,5.8,5.2,4.7,4.4],
    changes: [
      { metric: "Phase Angle", direction: "↓ 11%", why: "A subtle but consistent decline over weeks. Individual membranes aren't torn — instead, the cumulative micro-damage from repeated training hasn't fully repaired. Each session leaves a tiny membrane 'deficit' that accumulates. This gradual PhA erosion is the key early warning sign for overtraining and is exactly the use case where longitudinal monitoring provides the most value." },
      { metric: "R₀", direction: "↓ 6%", why: "Chronic low-grade inflammation from insufficient recovery creates persistent mild edema. The tissue never fully returns to baseline between sessions. Glycogen depletion also affects intracellular water content. These small fluid shifts are invisible clinically but detectable with our 0.58% CV measurements." },
      { metric: "α parameter", direction: "↓ 7%", why: "Some fibers are in various stages of repair while others are freshly micro-damaged. This creates a subtle heterogeneity that accumulates over a training block. The α trend over 2-3 weeks is more informative than any single measurement — it's the 'slope' that matters, not the absolute value." },
      { metric: "Bilateral asymmetry", direction: "↑ 122%", why: "If the athlete has a dominant/preferred leg or a slightly uneven training pattern, fatigue accumulates asymmetrically. A gradually widening bilateral gap (e.g., 2% → 3% → 4% over three weeks) is a red flag even though each individual value looks 'normal.' This is where our longitudinal tracking provides unique value." },
    ]
  },
  recovery: {
    label: "Day 14 Recovery (from Grade I)",
    color: "#1abc9c",
    bgColor: "#d1f2eb",
    icon: "↑",
    description: "Two weeks after a Grade I hamstring strain. Active rehabilitation in progress. Swelling resolved, pain-free walking and light jogging. The question: is the tissue actually healed enough for full training?",
    data: { phaseAngle: 7.9, R0: 372, Rinf: 219, Xc: 50, alpha: 0.82, fc: 135, icwEcw: 1.40, asymmetry: 3.2, Cm: 1.10 },
    freqTrail: [{f:"1k",r:402,xc:27},{f:"5k",r:393,xc:36},{f:"50k",r:368,xc:50},{f:"200k",r:342,xc:35}],
    bodeZ: [405,401,397,393,384,372,360,352,347,344,342],
    bodePhase: [3.8,5.2,6.5,7.2,7.7,7.9,7.3,6.1,5.5,5.0,4.7],
    changes: [
      { metric: "Phase Angle", direction: "93% recovered", why: "PhA has nearly returned to baseline, indicating that the new membrane repairs are functionally intact. However, 'nearly' is important — the remaining 7% deficit may represent immature scar tissue that hasn't yet developed full capacitive properties. In Nescolarde's FC Barcelona data, returning to play before PhA fully recovers correlated with re-injury risk." },
      { metric: "R₀", direction: "97% recovered", why: "Edema has almost completely resolved — the inflammatory phase is over and excess fluid has been reabsorbed. The 3% remaining deficit likely represents the slightly increased vascularity of healing tissue. Resistance recovers faster than reactance because fluid reabsorption is faster than membrane rebuilding." },
      { metric: "α parameter", direction: "95% recovered", why: "Tissue homogeneity is returning as the repair zone matures. The small remaining deficit reflects the boundary between the scar/repair tissue and the surrounding healthy muscle. Full α recovery typically lags behind functional recovery by 1-2 weeks — this is the hidden re-injury risk window." },
      { metric: "Bilateral asymmetry", direction: "78% recovered", why: "Asymmetry has improved dramatically but hasn't fully normalised. The remaining 3.2% asymmetry (vs 1.8% baseline) suggests the tissue is structurally different from the contralateral side. This is the most important return-to-play metric: an athlete may feel 100% but if asymmetry hasn't returned to within 1 SD of their personal baseline, the tissue isn't fully healed." },
    ]
  },
};

const scenarioOrder = ["healthy", "mildEIMD", "severeEIMD", "gradeI", "gradeII", "tendinopathy", "fatigue", "recovery"];
const metrics = [
  { key: "phaseAngle", label: "Phase Angle", short: "PhA", unit: "°", max: 12 },
  { key: "Xc", label: "Reactance", short: "Xc", unit: "Ω", max: 80 },
  { key: "R0", label: "R₀ (ECW)", short: "R₀", unit: "Ω", max: 500 },
  { key: "alpha", label: "α Param", short: "α", unit: "", max: 1 },
  { key: "icwEcw", label: "ICW/ECW", short: "ICW/ECW", unit: "", max: 2 },
  { key: "Cm", label: "Membr. Cap", short: "Cm", unit: "μF", max: 1.6 },
  { key: "asymmetry", label: "Bilateral Sym", short: "Asym", unit: "%", max: 20, invert: true },
  { key: "fc", label: "Char. Freq", short: "fc", unit: "kHz", max: 250, invert: true },
];

const freqs = [1, 2, 5, 10, 20, 50, 75, 100, 130, 165, 200];

// ─── RADAR PLOT ───
function RadarPlot({ baseData, compareData, baseLabel, compareLabel, compareColor }) {
  const cx = 190, cy = 190, r = 140;
  const n = metrics.length;
  const angleStep = (2 * Math.PI) / n;
  
  const normalize = (val, m) => {
    if (m.invert) return Math.max(0.05, 1 - val / m.max);
    return Math.min(0.95, val / m.max);
  };
  
  const getPoint = (data, i) => {
    const m = metrics[i];
    const val = normalize(data[m.key], m);
    const angle = -Math.PI / 2 + i * angleStep;
    return { x: cx + Math.cos(angle) * r * val, y: cy + Math.sin(angle) * r * val };
  };

  const makePath = (data) => metrics.map((_, i) => {
    const p = getPoint(data, i);
    return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }).join(' ') + ' Z';

  const polyArea = (data) => {
    let area = 0;
    const pts = metrics.map((_, i) => getPoint(data, i));
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return Math.abs(area) / 2;
  };

  const ratio = Math.round((polyArea(compareData) / polyArea(baseData)) * 100);
  const ratioColor = ratio > 85 ? "#27ae60" : ratio > 70 ? "#f39c12" : ratio > 55 ? "#e67e22" : "#e74c3c";

  return (
    <svg viewBox="0 0 380 400" style={{width:'100%'}}>
      {[0.25, 0.5, 0.75, 1].map(s => (
        <circle key={s} cx={cx} cy={cy} r={r * s} fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
      ))}
      {metrics.map((m, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        const ex = cx + Math.cos(angle) * r;
        const ey = cy + Math.sin(angle) * r;
        const lx = cx + Math.cos(angle) * (r + 22);
        const ly = cy + Math.sin(angle) * (r + 22);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#e8e8e8" strokeWidth="0.5" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#888" fontFamily="system-ui">{m.short}</text>
          </g>
        );
      })}
      <path d={makePath(baseData)} fill="rgba(46,204,113,0.12)" stroke="#27ae60" strokeWidth="1.5" />
      <path d={makePath(compareData)} fill={`${compareColor}18`} stroke={compareColor} strokeWidth="2" strokeDasharray="5,3" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="bold" fill={ratioColor} fontFamily="system-ui">{ratio}%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#aaa" fontFamily="system-ui">tissue score</text>
      <line x1={20} y1={388} x2={36} y2={388} stroke="#27ae60" strokeWidth="1.5" />
      <text x={40} y={391} fontSize="8" fill="#777" fontFamily="system-ui">{baseLabel}</text>
      <line x1={160} y1={388} x2={176} y2={388} stroke={compareColor} strokeWidth="2" strokeDasharray="4,2" />
      <text x={180} y={391} fontSize="8" fill="#777" fontFamily="system-ui">{compareLabel}</text>
    </svg>
  );
}

// ─── BIVA VECTOR PLOT ───
function BIVAPlot({ scenarioKeys }) {
  const w = 520, h = 400, pad = 55;
  const rMin = 270, rMax = 430, xcMin = 14, xcMax = 60;
  const sx = (v) => pad + (v - rMin) / (rMax - rMin) * (w - 2 * pad);
  const sy = (v) => h - pad - (v - xcMin) / (xcMax - xcMin) * (h - 2 * pad);
  
  const healthy = scenarios.healthy;
  const eCx = sx(375), eCy = sy(42), eRx = 55, eRy = 30;
  const ellipsePath = Array.from({length: 60}, (_, i) => {
    const t = (i / 60) * 2 * Math.PI;
    return `${i === 0 ? 'M' : 'L'} ${eCx + eRx * Math.cos(t)} ${eCy + eRy * Math.sin(t)}`;
  }).join(' ') + ' Z';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%'}}>
      <rect x={pad} y={10} width={w - 2 * pad} height={h - pad - 10} fill="#fafcfa" rx="3" />
      <rect x={pad} y={sy(30)} width={sx(340) - pad} height={sy(xcMin) - sy(30)} fill="#fef5f5" opacity="0.4" rx="2" />
      <text x={pad + 5} y={sy(16)} fontSize="7" fill="#e74c3c" opacity="0.6" fontFamily="system-ui">injury zone</text>
      <path d={ellipsePath} fill="rgba(46,204,113,0.06)" stroke="#27ae60" strokeWidth="0.8" strokeDasharray="3,3" />
      {[300, 340, 380, 420].map(v => <line key={v} x1={sx(v)} y1={10} x2={sx(v)} y2={h - pad} stroke="#f0f0f0" strokeWidth="0.5" />)}
      {[20, 30, 40, 50].map(v => <line key={v} x1={pad} y1={sy(v)} x2={w - pad} y2={sy(v)} stroke="#f0f0f0" strokeWidth="0.5" />)}
      {scenarioKeys.map(key => {
        const s = scenarios[key];
        const trail = s.freqTrail;
        const path = trail.map((d, i) => `${i === 0 ? 'M' : 'L'} ${sx(d.r)} ${sy(d.xc)}`).join(' ');
        return (
          <g key={key}>
            <path d={path} fill="none" stroke={s.color} strokeWidth="1.2" opacity="0.6" />
            {trail.map((d, i) => (
              <circle key={i} cx={sx(d.r)} cy={sy(d.xc)} r={i === 2 ? 4 : 2.5} fill={s.color} opacity="0.8" />
            ))}
            <text x={sx(trail[2].r) + 6} y={sy(trail[2].xc) - 6} fontSize="7" fill={s.color} fontFamily="system-ui" fontWeight="bold">{s.label.split(' (')[0].split(' ').slice(0,2).join(' ')}</text>
          </g>
        );
      })}
      {scenarioKeys.filter(k => k !== 'healthy').map(key => {
        const s = scenarios[key];
        const from = healthy.freqTrail[2];
        const to = s.freqTrail[2];
        return (
          <line key={key} x1={sx(from.r)} y1={sy(from.xc)} x2={sx(to.r)} y2={sy(to.xc)}
            stroke={s.color} strokeWidth="0.8" opacity="0.3" strokeDasharray="2,2" />
        );
      })}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#444" strokeWidth="0.8" />
      <line x1={pad} y1={10} x2={pad} y2={h - pad} stroke="#444" strokeWidth="0.8" />
      <text x={w / 2} y={h - 10} textAnchor="middle" fontSize="10" fill="#444" fontFamily="system-ui">Resistance R (Ω) →</text>
      <text x={14} y={h / 2} textAnchor="middle" fontSize="10" fill="#444" fontFamily="system-ui" transform={`rotate(-90, 14, ${h/2})`}>Reactance Xc (Ω) →</text>
      {[300, 340, 380, 420].map(v => <text key={v} x={sx(v)} y={h - pad + 12} textAnchor="middle" fontSize="7" fill="#aaa" fontFamily="system-ui">{v}</text>)}
      {[20, 30, 40, 50].map(v => <text key={v} x={pad - 6} y={sy(v) + 3} textAnchor="end" fontSize="7" fill="#aaa" fontFamily="system-ui">{v}</text>)}
      <text x={w - pad - 5} y={sy(55)} fontSize="7" fill="#27ae60" textAnchor="end" fontFamily="system-ui">↑ More membrane integrity</text>
      <text x={w - pad - 5} y={sy(55) + 10} fontSize="7" fill="#27ae60" textAnchor="end" fontFamily="system-ui">→ Less edema</text>
    </svg>
  );
}

// ─── BODE PLOT ───
function BodePlot({ scenarioKeys }) {
  const w = 520, h = 340, pad = 50;
  const topH = 150, gap = 20;
  
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%'}}>
      {scenarioKeys.map(key => {
        const s = scenarios[key];
        const zData = s.bodeZ;
        const path = zData.map((z, i) => {
          const x = pad + (i / (zData.length - 1)) * (w - 2 * pad);
          const y = 10 + (1 - (z - 280) / 150) * topH;
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
        return <path key={`z-${key}`} d={path} fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.7" />;
      })}
      <text x={14} y={10 + topH / 2} textAnchor="middle" fontSize="9" fill="#444" fontFamily="system-ui" transform={`rotate(-90, 14, ${10 + topH/2})`}>|Z| (Ω)</text>
      {[300, 350, 400].map(v => {
        const y = 10 + (1 - (v - 280) / 150) * topH;
        return <g key={v}><line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#f0f0f0" strokeWidth="0.5" /><text x={pad - 5} y={y + 3} textAnchor="end" fontSize="7" fill="#aaa" fontFamily="system-ui">{v}</text></g>;
      })}
      {scenarioKeys.map(key => {
        const s = scenarios[key];
        const pData = s.bodePhase;
        const path = pData.map((p, i) => {
          const x = pad + (i / (pData.length - 1)) * (w - 2 * pad);
          const y = topH + gap + 10 + (1 - (p - 2) / 7) * (h - topH - gap - pad - 10);
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
        return <path key={`p-${key}`} d={path} fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.7" />;
      })}
      <text x={14} y={topH + gap + 10 + (h - topH - gap - pad - 10) / 2} textAnchor="middle" fontSize="9" fill="#444" fontFamily="system-ui" transform={`rotate(-90, 14, ${topH + gap + 10 + (h - topH - gap - pad - 10)/2})`}>Phase (°)</text>
      {[4, 6, 8].map(v => {
        const y = topH + gap + 10 + (1 - (v - 2) / 7) * (h - topH - gap - pad - 10);
        return <g key={v}><line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#f0f0f0" strokeWidth="0.5" /><text x={pad - 5} y={y + 3} textAnchor="end" fontSize="7" fill="#aaa" fontFamily="system-ui">{v}°</text></g>;
      })}
      {freqs.map((f, i) => {
        const x = pad + (i / (freqs.length - 1)) * (w - 2 * pad);
        return <text key={f} x={x} y={h - 8} textAnchor="middle" fontSize="6" fill="#aaa" fontFamily="system-ui">{f}k</text>;
      })}
      <text x={w / 2} y={h} textAnchor="middle" fontSize="9" fill="#444" fontFamily="system-ui">Frequency (kHz)</text>
      <rect x={pad} y={h - pad + 3} width={(w - 2 * pad) * 0.3} height={4} fill="#3498db" opacity="0.2" rx="1" />
      <rect x={pad + (w - 2 * pad) * 0.3} y={h - pad + 3} width={(w - 2 * pad) * 0.4} height={4} fill="#9b59b6" opacity="0.2" rx="1" />
      <rect x={pad + (w - 2 * pad) * 0.7} y={h - pad + 3} width={(w - 2 * pad) * 0.3} height={4} fill="#e67e22" opacity="0.2" rx="1" />
      <text x={pad + (w - 2 * pad) * 0.15} y={h - pad + 15} textAnchor="middle" fontSize="6" fill="#3498db" fontFamily="system-ui">ECW pathway</text>
      <text x={pad + (w - 2 * pad) * 0.5} y={h - pad + 15} textAnchor="middle" fontSize="6" fill="#9b59b6" fontFamily="system-ui">membrane zone</text>
      <text x={pad + (w - 2 * pad) * 0.85} y={h - pad + 15} textAnchor="middle" fontSize="6" fill="#e67e22" fontFamily="system-ui">total water</text>
      <text x={pad + 3} y={20} fontSize="8" fill="#555" fontWeight="bold" fontFamily="system-ui">Impedance Magnitude</text>
      <text x={pad + 3} y={topH + gap + 20} fontSize="8" fill="#555" fontWeight="bold" fontFamily="system-ui">Phase Angle</text>
    </svg>
  );
}

// ─── BAR COMPARISON (ALL INLINE STYLES) ───
function BarComparison({ scenarioKey }) {
  const s = scenarios[scenarioKey];
  const base = scenarios.healthy.data;
  const comp = s.data;
  
  const items = metrics.map(m => {
    const baseVal = base[m.key];
    const compVal = comp[m.key];
    const pctChange = ((compVal - baseVal) / baseVal * 100);
    return { ...m, baseVal, compVal, pctChange };
  });

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
      {items.map(item => {
        const absChange = Math.abs(item.pctChange);
        const barColor = absChange < 5 ? "#27ae60" : absChange < 15 ? "#f39c12" : absChange < 25 ? "#e67e22" : "#e74c3c";
        return (
          <div key={item.key} style={{display:'flex', alignItems:'center', gap:'4px'}}>
            <span style={{fontSize:'9px', color:'#888', width:'50px', textAlign:'right', flexShrink:0}}>{item.short}</span>
            <div style={{flex:1, height:'14px', backgroundColor:'#f8f8f8', borderRadius:'3px', position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', top:0, bottom:0, left:'50%', width:'1px', backgroundColor:'#ccc'}} />
              {item.pctChange < 0 ? (
                <div style={{position:'absolute', top:0, bottom:0, right:'50%', width: `${Math.min(50, absChange * 1.5)}%`, backgroundColor: barColor, opacity: 0.6, borderRadius:'3px 0 0 3px'}} />
              ) : (
                <div style={{position:'absolute', top:0, bottom:0, left:'50%', width: `${Math.min(50, absChange * 1.5)}%`, backgroundColor: barColor, opacity: 0.6, borderRadius:'0 3px 3px 0'}} />
              )}
            </div>
            <span style={{fontSize:'9px', fontFamily:'monospace', width:'42px', textAlign:'right', color: barColor, flexShrink:0}}>
              {item.pctChange > 0 ? '+' : ''}{item.pctChange.toFixed(0)}%
            </span>
          </div>
        );
      })}
      <div style={{display:'flex', alignItems:'center', gap:'4px', paddingTop:'2px'}}>
        <span style={{width:'50px', flexShrink:0}} />
        <div style={{flex:1, display:'flex', justifyContent:'space-between', padding:'0 4px'}}>
          <span style={{fontSize:'7px', color:'#aaa'}}>← decrease</span>
          <span style={{fontSize:'7px', color:'#aaa'}}>baseline</span>
          <span style={{fontSize:'7px', color:'#aaa'}}>increase →</span>
        </div>
        <span style={{width:'42px', flexShrink:0}} />
      </div>
    </div>
  );
}

// ─── COLE-COLE NYQUIST PLOT ───
function NyquistPlot({ scenarioKeys }) {
  const w = 400, h = 220, pad = 45;
  
  const drawSemicircle = (s) => {
    const d = s.data;
    const cR = (d.R0 + d.Rinf) / 2;
    const radius = (d.R0 - d.Rinf) / 2;
    const pts = Array.from({length: 40}, (_, i) => {
      const t = (i / 39) * Math.PI;
      const rVal = cR - radius * Math.cos(t);
      const xcVal = radius * Math.pow(Math.sin(t), d.alpha) * 0.7;
      return { r: rVal, xc: xcVal };
    });
    return pts;
  };

  const allPts = scenarioKeys.flatMap(k => drawSemicircle(scenarios[k]));
  const rMin = Math.min(...allPts.map(p => p.r)) - 10;
  const rMax = Math.max(...allPts.map(p => p.r)) + 10;
  const xcMax = Math.max(...allPts.map(p => p.xc)) + 5;
  
  const sx = (v) => pad + (v - rMin) / (rMax - rMin) * (w - 2 * pad);
  const sy = (v) => h - pad - (v / (xcMax + 5)) * (h - pad - 10);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%'}}>
      {[rMin + 20, (rMin + rMax) / 2, rMax - 20].map(v => (
        <line key={v} x1={sx(v)} y1={10} x2={sx(v)} y2={h - pad} stroke="#f0f0f0" strokeWidth="0.5" />
      ))}
      {scenarioKeys.map(key => {
        const s = scenarios[key];
        const pts = drawSemicircle(s);
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.r)} ${sy(p.xc)}`).join(' ');
        return (
          <g key={key}>
            <path d={path} fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.7" />
            <circle cx={sx(s.data.R0)} cy={sy(0)} r={2.5} fill={s.color} />
            <circle cx={sx(s.data.Rinf)} cy={sy(0)} r={2.5} fill={s.color} />
          </g>
        );
      })}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#444" strokeWidth="0.8" />
      <line x1={pad} y1={10} x2={pad} y2={h - pad} stroke="#444" strokeWidth="0.8" />
      <text x={w / 2} y={h - 8} textAnchor="middle" fontSize="9" fill="#444" fontFamily="system-ui">Real(Z) — Resistance (Ω)</text>
      <text x={10} y={(h - pad) / 2} textAnchor="middle" fontSize="9" fill="#444" fontFamily="system-ui" transform={`rotate(-90, 10, ${(h-pad)/2})`}>-Imag(Z) — Reactance (Ω)</text>
      <text x={w - pad - 5} y={20} fontSize="7" fill="#888" textAnchor="end" fontFamily="system-ui" fontStyle="italic">Flatter = more heterogeneous (lower α)</text>
      <text x={w - pad - 5} y={30} fontSize="7" fill="#888" textAnchor="end" fontFamily="system-ui" fontStyle="italic">Smaller = more damage/edema</text>
    </svg>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [selected, setSelected] = useState("mildEIMD");
  const [compareSet, setCompareSet] = useState(["healthy", "mildEIMD", "gradeII", "tendinopathy"]);
  
  const s = scenarios[selected];

  // Common inline style helpers
  const font = 'system-ui, -apple-system, sans-serif';

  return (
    <div style={{minHeight:'100vh', backgroundColor:'white', fontFamily: font}}>
      <div style={{maxWidth:'1152px', margin:'0 auto', padding:'24px 16px'}}>
        
        {/* Header */}
        <div style={{marginBottom:'24px', borderBottom:'1px solid #e5e7eb', paddingBottom:'16px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <img src="/antelope-logo.png" alt="Antelope Health" style={{height:'40px'}} />
          </div>
          <h1 style={{fontSize:'20px', fontWeight:'bold', color:'#111', marginTop:'4px'}}>Bioimpedance Injury Visualization — Detailed Examples</h1>
          <p style={{fontSize:'12px', color:'#888'}}>Select injury scenarios to explore how each metric changes and why</p>
        </div>

        {/* Scenario Selector - Sticky */}
        <div style={{position:'sticky', top:0, zIndex:50, backgroundColor:'white', paddingTop:'12px', paddingBottom:'12px', marginBottom:'12px', borderBottom:'1px solid #e5e7eb'}}>
          <p style={{fontSize:'11px', fontWeight:600, color:'#555', marginBottom:'8px', letterSpacing:'0.05em'}}>SELECT SCENARIO FOR DETAILED VIEW:</p>
          <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
            {scenarioOrder.map(key => {
              const sc = scenarios[key];
              const isSelected = selected === key;
              return (
                <button key={key} onClick={() => setSelected(key)}
                  style={{
                    padding:'6px 10px', borderRadius:'4px', fontSize:'12px', cursor:'pointer',
                    backgroundColor: sc.bgColor, color: sc.color, border: 'none',
                    fontWeight: isSelected ? 700 : 400,
                    outline: isSelected ? `2px solid ${sc.color}` : 'none',
                    outlineOffset: '2px',
                    opacity: isSelected ? 1 : 0.7,
                    transition: 'all 0.15s',
                    fontFamily: font,
                  }}>
                  <span style={{marginRight:'4px'}}>{sc.icon}</span>{sc.label.split(' (')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* DETAIL PANEL */}
        <div style={{marginBottom:'32px', borderRadius:'8px', border:`1px solid ${s.color}44`, backgroundColor: s.bgColor + '33', padding:'16px'}}>
          <div style={{display:'flex', alignItems:'flex-start', gap:'8px', marginBottom:'12px'}}>
            <span style={{fontSize:'24px'}}>{s.icon}</span>
            <div>
              <h2 style={{fontSize:'16px', fontWeight:'bold', color: s.color, margin:0}}>{s.label}</h2>
              <p style={{fontSize:'12px', color:'#555', marginTop:'4px'}}>{s.description}</p>
            </div>
          </div>
          
          {/* Two-column grid: Radar + Bar chart */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
            {/* Radar */}
            <div style={{backgroundColor:'white', borderRadius:'8px', padding:'12px', border:'1px solid #f0f0f0'}}>
              <h3 style={{fontSize:'11px', fontWeight:600, color:'#888', margin:'0 0 4px 0', letterSpacing:'0.03em'}}>TISSUE STATE COMPASS</h3>
              <p style={{fontSize:'11px', color:'#aaa', margin:'0 0 8px 0'}}>Polygon area = health score. Green = baseline, dashed = current.</p>
              <RadarPlot baseData={scenarios.healthy.data} compareData={s.data} baseLabel="Healthy" compareLabel={s.label.split(' (')[0]} compareColor={s.color} />
            </div>
            
            {/* Change bars */}
            <div style={{backgroundColor:'white', borderRadius:'8px', padding:'12px', border:'1px solid #f0f0f0'}}>
              <h3 style={{fontSize:'11px', fontWeight:600, color:'#888', margin:'0 0 4px 0', letterSpacing:'0.03em'}}>% CHANGE FROM BASELINE</h3>
              <p style={{fontSize:'11px', color:'#aaa', margin:'0 0 8px 0'}}>Each bar shows deviation from healthy. Centre = no change.</p>
              <BarComparison scenarioKey={selected} />
            </div>
          </div>
          
          {/* Physiological explanations */}
          {s.changes && (
            <div style={{marginTop:'16px'}}>
              <h3 style={{fontSize:'11px', fontWeight:600, color:'#888', marginBottom:'8px', letterSpacing:'0.03em'}}>WHY THESE CHANGES HAPPEN:</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                {s.changes.map((c, i) => (
                  <div key={i} style={{backgroundColor:'white', borderRadius:'4px', padding:'10px', border:'1px solid #f0f0f0'}}>
                    <div style={{display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'4px'}}>
                      <span style={{fontSize:'12px', fontWeight:'bold', color: s.color}}>{c.metric}</span>
                      <span style={{fontSize:'11px', fontFamily:'monospace', padding:'2px 6px', borderRadius:'3px', backgroundColor: s.bgColor, color: s.color}}>{c.direction}</span>
                    </div>
                    <p style={{fontSize:'12px', color:'#555', lineHeight:1.5, margin:0}}>{c.why}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ MULTI-SCENARIO COMPARISON PLOTS ═══ */}
        <h2 style={{fontSize:'16px', fontWeight:'bold', color:'#333', marginBottom:'4px'}}>Multi-Scenario Comparison Plots</h2>
        <p style={{fontSize:'12px', color:'#888', marginBottom:'12px'}}>Toggle which scenarios appear on the shared plots below:</p>
        <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px'}}>
          {scenarioOrder.map(key => {
            const sc = scenarios[key];
            const active = compareSet.includes(key);
            return (
              <button key={key} onClick={() => setCompareSet(prev => active ? prev.filter(k => k !== key) : [...prev, key])}
                style={{
                  padding:'4px 8px', borderRadius:'4px', fontSize:'12px', cursor:'pointer',
                  border: `1px solid ${sc.color}`,
                  backgroundColor: active ? sc.bgColor : 'white',
                  color: sc.color,
                  fontWeight: active ? 600 : 400,
                  opacity: active ? 1 : 0.4,
                  transition: 'all 0.15s',
                  fontFamily: font,
                }}>
                {sc.icon} {sc.label.split(' (')[0]}
              </button>
            );
          })}
        </div>
        
        {/* Comparison plots 2x2 grid */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'32px'}}>
          {/* BIVA Vector */}
          <div style={{border:'1px solid #f0f0f0', borderRadius:'8px', padding:'12px'}}>
            <h3 style={{fontSize:'14px', fontWeight:600, color:'#444', margin:'0 0 2px 0'}}>BIVA Vector Plot</h3>
            <p style={{fontSize:'11px', color:'#aaa', marginBottom:'8px'}}>Multi-frequency trails (dots = 1k, 5k, 50k, 200k Hz). Large dot = 50kHz. Green ellipse = healthy zone.</p>
            <BIVAPlot scenarioKeys={compareSet} />
            <div style={{marginTop:'8px', padding:'6px 8px', backgroundColor:'#f8f8f8', borderRadius:'4px', fontSize:'12px', color:'#555'}}>
              <strong>How to read this:</strong> Each scenario shows a trail of dots at 4 frequencies. Healthy tissue (green) sits in the upper-right — high resistance (little edema) and high reactance (intact membranes). Injuries pull the trail down-left: left = more edema (lower R), down = more membrane damage (lower Xc). The direction of the shift tells you the injury mechanism. The distance tells you the severity.
            </div>
          </div>
          
          {/* Nyquist / Cole-Cole */}
          <div style={{border:'1px solid #f0f0f0', borderRadius:'8px', padding:'12px'}}>
            <h3 style={{fontSize:'14px', fontWeight:600, color:'#444', margin:'0 0 2px 0'}}>Cole-Cole (Nyquist) Plot</h3>
            <p style={{fontSize:'11px', color:'#aaa', marginBottom:'8px'}}>Semicircle shape reveals tissue properties. Width = fluid range. Height = membrane capacitance. Flatness = heterogeneity (α).</p>
            <NyquistPlot scenarioKeys={compareSet} />
            <div style={{marginTop:'8px', padding:'6px 8px', backgroundColor:'#f8f8f8', borderRadius:'4px', fontSize:'12px', color:'#555'}}>
              <strong>How to read this:</strong> Each curve should form a semicircle. The left intercept is R∞ (total water), the right is R₀ (extracellular water). A wider semicircle means the tissue has more distinct intra/extracellular compartments (healthy). A flatter, depressed arc (lower α) means the tissue is heterogeneous — a mix of damaged and intact regions. Injuries shrink and flatten the semicircle.
            </div>
          </div>

          {/* Bode Plot - spans 2 columns */}
          <div style={{border:'1px solid #f0f0f0', borderRadius:'8px', padding:'12px', gridColumn:'1 / -1'}}>
            <h3 style={{fontSize:'14px', fontWeight:600, color:'#444', margin:'0 0 2px 0'}}>Frequency Response (Bode Plot)</h3>
            <p style={{fontSize:'11px', color:'#aaa', marginBottom:'8px'}}>Top: impedance magnitude across frequency. Bottom: phase angle. Coloured bands show what each frequency range probes.</p>
            <BodePlot scenarioKeys={compareSet} />
            <div style={{marginTop:'8px', padding:'6px 8px', backgroundColor:'#f8f8f8', borderRadius:'4px', fontSize:'12px', color:'#555'}}>
              <strong>How to read this:</strong> The top panel shows overall impedance dropping with injury (more conductive tissue). The bottom panel is more revealing: the phase angle peak occurs where membranes have maximum effect on the signal (~50 kHz). Injuries flatten and lower this peak. The key insight: if the left side (low freq) drops more than the right, it's primarily edema. If the middle drops most, it's membrane damage. If both drop equally, it's a severe combined injury.
            </div>
          </div>
        </div>

        {/* ═══ SCENARIO COMPARISON TABLE ═══ */}
        <h2 style={{fontSize:'16px', fontWeight:'bold', color:'#333', marginBottom:'8px'}}>Side-by-Side Scenario Comparison</h2>
        <div style={{overflowX:'auto', marginBottom:'32px'}}>
          <table style={{width:'100%', fontSize:'12px', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                <th style={{textAlign:'left', padding:'6px', borderBottom:'2px solid #ccc', color:'#888', fontWeight:600, fontSize:'9px'}}>Metric</th>
                {scenarioOrder.map(key => (
                  <th key={key} style={{padding:'6px', borderBottom:`2px solid ${scenarios[key].color}`, textAlign:'center', fontWeight:600, color: scenarios[key].color, fontSize:'8px'}}>
                    {scenarios[key].icon} {scenarios[key].label.split(' ').slice(0, 2).join(' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map(m => (
                <tr key={m.key}>
                  <td style={{padding:'6px', borderBottom:'1px solid #f0f0f0', fontWeight:500, color:'#444', fontSize:'9px'}}>{m.label}</td>
                  {scenarioOrder.map(key => {
                    const val = scenarios[key].data[m.key];
                    const baseVal = scenarios.healthy.data[m.key];
                    const pct = ((val - baseVal) / baseVal * 100);
                    const isBaseline = key === "healthy";
                    const absP = Math.abs(pct);
                    const cellColor = isBaseline ? "#f0f0f0" : absP < 5 ? "#d5f5e3" : absP < 12 ? "#fef9e7" : absP < 22 ? "#fdebd0" : "#fadbd8";
                    return (
                      <td key={key} style={{padding:'6px', borderBottom:'1px solid #f0f0f0', textAlign:'center', fontFamily:'monospace', backgroundColor: cellColor, fontSize:'9px'}}>
                        {val.toFixed(m.max <= 2 ? 2 : 0)}
                        {!isBaseline && <span style={{display:'block', fontSize:'7px', color: absP < 5 ? '#27ae60' : absP < 12 ? '#f39c12' : '#e74c3c'}}>{pct > 0 ? '+' : ''}{pct.toFixed(0)}%</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ KEY PATTERNS SUMMARY ═══ */}
        <h2 style={{fontSize:'16px', fontWeight:'bold', color:'#333', marginBottom:'8px'}}>Injury Signature Patterns — How to Tell Them Apart</h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'32px'}}>
          {[
            { title: "Edema-Dominant (Contusion/Impact)", sig: "R drops much more than Xc. Low-frequency impedance affected most. Phase angle moderately reduced. α relatively preserved.", color: "#3498db",
              explain: "When tissue is hit (e.g., a dead leg/charley horse), blood vessels rupture and fluid floods the extracellular space, but cell membranes stay mostly intact. The extra fluid creates easy current pathways at low frequencies. On the Bode plot, you'll see the left side (low freq) dropping while the right side barely changes." },
            { title: "Membrane-Dominant (Eccentric Damage)", sig: "Xc drops much more than R. Phase angle severely reduced. fc shifts upward significantly. α decreases.", color: "#9b59b6",
              explain: "Eccentric exercise mechanically tears the sarcolemma through the 'popping sarcomere' mechanism. The membranes fail while fluid accumulation is initially modest. On the BIVA plot, the vector moves predominantly downward (Xc axis) rather than leftward (R axis). The Cole-Cole semicircle flattens and shrinks." },
            { title: "Combined (Muscle Strain)", sig: "Both R and Xc drop substantially. Xc/R ratio > 2. Massive bilateral asymmetry. α collapses.", color: "#e74c3c",
              explain: "A strain tears both cells and blood vessels simultaneously. This creates the most dramatic bioimpedance changes. The distinguishing feature is the proportional relationship: in Grade I strains, Xc drops ~2× more than R. In Grade II, both drop severely. The bilateral asymmetry index becomes the most reliable severity indicator." },
            { title: "Tendon/Collagen (Tendinopathy)", sig: "α is the primary change (collagen disorganization). R₀ modestly reduced. Xc minimally affected. Changes are subtle.", color: "#8e44ad",
              explain: "Tendons have sparse cells, so membrane-dependent metrics change little. Instead, the electrical signal changes because organized parallel collagen creates predictable current pathways that become disrupted in tendinopathy. This shows up as decreased α (heterogeneity) and modest R₀ changes from peritendinous fluid. The pattern is uniquely different from muscle injuries." },
            { title: "Overtraining (Cumulative Fatigue)", sig: "All metrics drift 5-10% from baseline over weeks. No single dramatic change. Bilateral asymmetry gradually widens.", color: "#2980b9",
              explain: "The hallmark is gradual, multi-metric erosion without a single acute event. Think of it as the tissue accumulating a 'debt' that hasn't been repaid by recovery. No individual measurement looks alarming, but the trend over 2-3 weeks tells the story. This is where longitudinal tracking is irreplaceable — a single snapshot cannot detect overtraining." },
            { title: "Recovery Tracking", sig: "Metrics return toward baseline at different rates: R first (days), then Xc (1-2 weeks), then α (2-4 weeks). Asymmetry is last to normalise.", color: "#1abc9c",
              explain: "R recovers first because edema reabsorption is rapid (days). Xc recovers next as new membrane proteins are synthesized and inserted (1-2 weeks). α is last because tissue homogeneity requires the repair zone to mature and integrate with surrounding healthy tissue (2-4 weeks). Bilateral asymmetry persisting >2% after other metrics normalise suggests structural remodelling that increases re-injury risk." },
          ].map(pattern => (
            <div key={pattern.title} style={{border:`1px solid ${pattern.color}44`, borderRadius:'8px', padding:'12px'}}>
              <h3 style={{fontSize:'13px', fontWeight:'bold', color: pattern.color, margin:'0 0 4px 0'}}>{pattern.title}</h3>
              <p style={{fontSize:'9px', fontFamily:'monospace', color:'#444', marginBottom:'8px', padding:'4px 8px', borderRadius:'3px', backgroundColor: pattern.color + '0D'}}>{pattern.sig}</p>
              <p style={{fontSize:'12px', color:'#555', lineHeight:1.5, margin:0}}>{pattern.explain}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{borderTop:'1px solid #f0f0f0', paddingTop:'12px', fontSize:'12px', color:'#aaa'}}>
          <p style={{margin:0}}>Antelope Health — Bioimpedance Visualization Concepts v2.1 — February 2026</p>
          <p style={{margin:'2px 0 0 0'}}>Data shown is simulated based on published literature values (Nescolarde 2013, 2023; Yamaguchi 2024)</p>
        </div>
      </div>
    </div>
  );
}
