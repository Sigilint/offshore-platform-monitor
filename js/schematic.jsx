// Platform schematic — side elevation of a fixed-jacket platform, looking north
// (west is left). Structure is static line art; sea state, weather, flare,
// separator level, gas detections and the radar target are driven by the
// latest readings. Sensor markers sit on top and carry all alarm color.

(() => {

const { useState, useMemo, useRef } = React;
const { CATEGORIES, SENSOR_TYPES, ZONES } = window.Catalog;
const { fmtValue, fmtUnit, STATUS_RANK } = window.Fmt;

const W = 1200, H = 760, SEA_Y = 470, BED_Y = 730, DECK_BOTTOM = 413;
const LEGS = [[340, 300], [470, 450], [670, 690], [800, 840]];
const LEVELS = [DECK_BOTTOM, 470, 560, 650, BED_Y];
const legX = ([x0, x1], y) => x0 + (x1 - x0) * (y - DECK_BOTTOM) / (BED_Y - DECK_BOTTOM);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const GAS_TYPES = new Set(["GD_HC", "GD_H2S", "GD_OP"]);

function wavePath(amp, wl, y0, x0 = -200, x1 = W + 200) {
  let d = `M${x0},${y0}`;
  for (let x = x0; x < x1; x += wl) {
    d += ` Q${x + wl / 4},${y0 - amp} ${x + wl / 2},${y0} Q${x + wl * 3 / 4},${y0 + amp} ${x + wl},${y0}`;
  }
  return d;
}

// ---------- static structure ----------

const Jacket = React.memo(function Jacket() {
  const parts = [];
  // X-bracing between adjacent legs, per bay
  for (let i = 0; i < LEGS.length - 1; i++) {
    for (let j = 0; j < LEVELS.length - 1; j++) {
      const [ya, yb] = [LEVELS[j], LEVELS[j + 1]];
      parts.push(<line key={`xa${i}${j}`} x1={legX(LEGS[i], ya)} y1={ya} x2={legX(LEGS[i + 1], yb)} y2={yb} />);
      parts.push(<line key={`xb${i}${j}`} x1={legX(LEGS[i + 1], ya)} y1={ya} x2={legX(LEGS[i], yb)} y2={yb} />);
    }
  }
  LEVELS.slice(1).forEach((y, j) =>
    parts.push(<line key={`h${j}`} x1={legX(LEGS[0], y)} y1={y} x2={legX(LEGS[3], y)} y2={y} />));
  return (
    <g className="jacket">
      <g className="brace">{parts}</g>
      {/* well conductors */}
      <g className="conductor">
        {[345, 375, 405].map(x => <line key={x} x1={x} y1={DECK_BOTTOM} x2={x + 2} y2={BED_Y} />)}
      </g>
      {/* fire-water caisson */}
      <line className="pipe" x1="785" y1={DECK_BOTTOM} x2="787" y2="528" />
      {/* export riser + pipeline */}
      <path className="riser" d={`M824,${DECK_BOTTOM} L856,${BED_Y - 2} Q862,${BED_Y + 3} 880,${BED_Y + 4} L1200,${BED_Y + 8}`} />
      {/* legs + piles */}
      <g className="leg">
        {LEGS.map(([a, b], i) => <line key={i} x1={a} y1={DECK_BOTTOM} x2={b} y2={BED_Y + 18} />)}
      </g>
      {/* sacrificial anodes */}
      <g className="anode">
        {LEGS.flatMap((leg, i) => [520, 610, 690].map(y =>
          <rect key={`${i}-${y}`} x={legX(leg, y) - 2.5} y={y} width="5" height="14" rx="1.5" />))}
      </g>
    </g>
  );
});

const Topsides = React.memo(function Topsides() {
  // derrick lattice
  const rungs = [];
  for (let y = 61; y < 250; y += 21) {
    const l = 366 + (330 - 366) * (y - 40) / 210, r = 394 + (430 - 394) * (y - 40) / 210;
    const yn = Math.min(y + 21, 250);
    const ln = 366 + (330 - 366) * (yn - 40) / 210, rn = 394 + (430 - 394) * (yn - 40) / 210;
    rungs.push(<line key={`r${y}`} x1={l} y1={y} x2={r} y2={y} />);
    rungs.push(<line key={`d${y}`} x1={l} y1={y} x2={rn} y2={yn} />);
  }
  // flare boom lattice
  const boom = [];
  for (let i = 0; i <= 9; i++) {
    const t = i / 9, t2 = Math.min(1, (i + 0.5) / 9);
    const ax = 310 + (112 - 310) * t, ay = 284 + (152 - 284) * t;
    const bx = 298 + (118 - 298) * t2, by = 262 + (146 - 262) * t2;
    boom.push(<line key={i} x1={ax} y1={ay} x2={bx} y2={by} />);
  }

  return (
    <g className="topsides">
      {/* flare boom */}
      <g className="lattice">
        <line x1="310" y1="284" x2="112" y2="152" className="chord" />
        <line x1="298" y1="262" x2="118" y2="146" className="chord" />
        {boom}
      </g>
      <rect x="104" y="138" width="14" height="9" className="equip" transform="rotate(-34 111 142)" />

      {/* decks */}
      <rect x="300" y="280" width="580" height="8" className="deck" />
      <rect x="300" y="350" width="545" height="8" className="deck" />
      <rect x="300" y="405" width="545" height="8" className="deck" />
      {[340, 470, 670, 800].map(x => (
        <g key={x} className="column">
          <rect x={x - 3} y="288" width="6" height="62" />
          <rect x={x - 3} y="358" width="6" height="47" />
        </g>
      ))}

      {/* derrick + drill floor */}
      <g className="lattice">
        <line x1="330" y1="250" x2="366" y2="40" className="chord" />
        <line x1="430" y1="250" x2="394" y2="40" className="chord" />
        {rungs}
      </g>
      <rect x="360" y="34" width="40" height="8" className="equip" />
      <line x1="380" y1="34" x2="380" y2="22" className="mast" />
      <line x1="320" y1="22" x2="460" y2="22" className="mast" />
      <line x1="380" y1="42" x2="380" y2="248" className="drillpipe" />
      <rect x="372" y="70" width="16" height="16" className="equip" />
      <rect x="318" y="248" width="124" height="6" className="deck" />
      <g className="lattice">
        <rect x="325" y="254" width="110" height="26" className="chord" fill="none" />
        <line x1="325" y1="254" x2="435" y2="280" /><line x1="435" y1="254" x2="325" y2="280" />
      </g>
      {/* mud pits */}
      <rect x="448" y="256" width="90" height="24" className="equip" />
      <line x1="478" y1="256" x2="478" y2="280" className="thin" />
      <line x1="508" y1="256" x2="508" y2="280" className="thin" />

      {/* crane */}
      <rect x="612" y="232" width="16" height="48" className="equip" />
      <rect x="596" y="214" width="36" height="20" rx="2" className="equip" />
      <line x1="604" y1="216" x2="546" y2="132" className="chord" />
      <line x1="612" y1="218" x2="550" y2="130" className="chord" />
      <line x1="548" y1="132" x2="548" y2="198" className="cable" />
      <rect x="542" y="198" width="12" height="9" className="equip" />
      <rect x="640" y="256" width="44" height="24" className="equip" />
      <line x1="652" y1="256" x2="652" y2="280" className="thin" />
      <line x1="664" y1="256" x2="664" y2="280" className="thin" />

      {/* living quarters */}
      <rect x="700" y="185" width="150" height="95" className="equip" />
      {[217, 249].map(y => <line key={y} x1="700" y1={y} x2="850" y2={y} className="thin" />)}
      {[190, 222, 254].map(y =>
        Array.from({ length: 9 }, (_, i) => (
          <rect key={`${y}-${i}`} x={706 + i * 16} y={y} width="8" height="5" className="window" />
        )))}
      <text x="704" y="277" className="sx-label">CONTROL ROOM</text>
      {/* helideck */}
      <rect x="688" y="172" width="204" height="6" className="deck" />
      <line x1="700" y1="185" x2="690" y2="178" className="thin" />
      <line x1="850" y1="205" x2="890" y2="178" className="thin" />
      <line x1="680" y1="170" x2="688" y2="175" className="cable" />
      <line x1="892" y1="175" x2="900" y2="170" className="cable" />
      {/* lifeboat */}
      <line x1="852" y1="288" x2="852" y2="293" className="cable" />
      <line x1="878" y1="288" x2="878" y2="293" className="cable" />
      <rect x="846" y="293" width="38" height="13" rx="6.5" className="equip lifeboat" />

      {/* perimeter mast */}
      <line x1="875" y1="280" x2="875" y2="190" className="mast" />
      <rect x="863" y="184" width="24" height="3.5" className="radar-bar" />

      {/* separator */}
      <rect x="480" y="340" width="8" height="10" className="equip" />
      <rect x="566" y="340" width="8" height="10" className="equip" />
      <path d="M436,382 V323 H462" className="pipe" />
      <path d="M592,316 H622" className="pipe" />

      {/* compressors */}
      {[624, 680].map(x => (
        <g key={x}>
          <rect x={x} y="314" width="40" height="36" className="equip" />
          <circle cx={x + 20} cy="332" r="9" className="equip" />
        </g>
      ))}
      {/* gas turbine generator */}
      <rect x="740" y="306" width="96" height="44" className="equip" />
      <path d="M752,342 L766,316 H794 L808,342 Z" className="thin" fill="none" />
      <rect x="814" y="290" width="18" height="16" className="equip" />

      {/* well bay — christmas trees */}
      {[345, 375, 405].map(x => (
        <g key={x}>
          <rect x={x - 4} y="374" width="8" height="31" className="equip" />
          <rect x={x - 9} y="384" width="18" height="5" className="equip" />
          <circle cx={x} cy="378" r="2.5" className="equip" />
        </g>
      ))}

      {/* cellar utilities */}
      <rect x="494" y="368" width="34" height="36" rx="5" className="equip" />
      <rect x="544" y="372" width="34" height="32" className="equip" />
      <rect x="640" y="368" width="70" height="36" rx="6" className="equip" />
      <rect x="770" y="366" width="30" height="38" className="equip" />
      <rect x="718" y="372" width="34" height="32" className="equip" />
    </g>
  );
});

// ---------- dynamic layers ----------

function Sea({ hs }) {
  const amp = 2 + hs * 2.2;
  const back = wavePath(amp * 0.6, 90, SEA_Y - 3);
  return (
    <g className="sea">
      <defs>
        <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="sea-top" />
          <stop offset="1" className="sea-deep" />
        </linearGradient>
        <pattern id="bedDots" width="14" height="10" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.9" className="bed-dot" />
          <circle cx="10" cy="8" r="0.7" className="bed-dot" />
        </pattern>
      </defs>
      <rect x="0" y={SEA_Y} width={W} height={H - SEA_Y} fill="url(#seaGrad)" />
      <g className="wave-anim slow"><path d={`${back} L${W + 200},${SEA_Y + 12} L-200,${SEA_Y + 12} Z`} className="wave-back" /></g>
      <path d={`M0,${BED_Y + 4} C200,${BED_Y - 4} 400,${BED_Y + 8} 600,${BED_Y + 1} S1000,${BED_Y - 4} ${W},${BED_Y + 3} L${W},${H} L0,${H} Z`}
            className="seabed" />
      <path d={`M0,${BED_Y + 4} C200,${BED_Y - 4} 400,${BED_Y + 8} 600,${BED_Y + 1} S1000,${BED_Y - 4} ${W},${BED_Y + 3} L${W},${H} L0,${H} Z`}
            fill="url(#bedDots)" />
    </g>
  );
}

function Sky({ storm, lightningKm }) {
  return (
    <g className="sky">
      <defs>
        <pattern id="rain" width="18" height="18" patternUnits="userSpaceOnUse">
          <line x1="16" y1="0" x2="10" y2="12" className="rain-line" />
        </pattern>
        <clipPath id="skyClip"><rect x="0" y="0" width={W} height={SEA_Y} /></clipPath>
      </defs>
      <rect x="0" y="0" width={W} height={SEA_Y + 5} className="sky-fill" />
      <rect x="0" y="0" width={W} height={SEA_Y + 5} className="storm-fill" style={{ opacity: storm * 0.75 }} />
      <g clipPath="url(#skyClip)" style={{ opacity: clamp((storm - 0.3) * 1.6, 0, 0.9) }}>
        <rect x="-36" y="-36" width={W + 72} height={SEA_Y + 72} fill="url(#rain)" className="rain-anim" />
      </g>
      {lightningKm < 15 && <rect x="0" y="0" width={W} height={SEA_Y} className="lightning-flash" />}
    </g>
  );
}

function Flare({ flow }) {
  const s = 0.55 + clamp(flow, 0, 12) / 5;
  return (
    <g transform={`translate(110 138) scale(${s})`}>
      <g className="flame-anim">
        <path d="M0,0 C-9,-10 -7,-24 0,-38 C2,-28 9,-22 8,-12 C7,-5 4,-1 0,0 Z" className="flame" />
        <path d="M0,-2 C-4,-8 -3,-16 0,-22 C3,-15 4,-8 0,-2 Z" className="flame-core" />
      </g>
    </g>
  );
}

function SeparatorLevel({ level }) {
  const h = 34 * clamp(level, 0, 100) / 100;
  return (
    <g>
      <defs><clipPath id="sepClip"><rect x="462" y="306" width="130" height="34" rx="17" /></clipPath></defs>
      <rect x="462" y={340 - h} width="130" height={h} clipPath="url(#sepClip)" className="liquid" />
      <rect x="462" y="306" width="130" height="34" rx="17" className="equip" fill="none" />
    </g>
  );
}

function Windsock({ windKt, driftSign }) {
  // droops at calm, flies horizontal above ~25 kt
  const lift = clamp(windKt / 25, 0.1, 1);
  return (
    <g transform="translate(896 150)">
      <line x1="0" y1="0" x2="0" y2="22" className="mast" />
      <g transform={`scale(${driftSign} 1)`}>
        <path d="M0,1 L18,3 L18,6 L0,8 Z" className="sock" transform={`rotate(${90 - lift * 85} 0 4)`} />
      </g>
    </g>
  );
}

function SupplyVessel() {
  return (
    <g className="vessel">
      <path d="M930,463 L1080,463 L1068,481 L942,481 Z" className="hull" />
      <rect x="1040" y="440" width="28" height="23" className="equip" />
      <rect x="1046" y="444" width="16" height="4" className="window" />
      <rect x="955" y="455" width="22" height="8" className="equip" />
      <rect x="980" y="453" width="30" height="10" className="equip" />
      <text x="1005" y="500" textAnchor="middle" className="sx-label">MSV KESTREL SUPPORT · AIS</text>
    </g>
  );
}

function UnknownVessel({ range, status }) {
  if (range == null || range > 9000) return null;
  const x = 190 - (range - 500) / 8500 * 270;
  return (
    <g transform={`translate(${x} 466)`} className={`unk-vessel st-${status}`}>
      <path d="M-46,8 h-30 M-40,13 h-26" className="wake" />
      <path d="M-26,0 L22,0 L15,10 L-20,10 Z" className="hull" />
      <rect x="-10" y="-10" width="16" height="10" className="equip" />
      <text y="-26" textAnchor="middle" className="sx-label strong">UNIDENTIFIED · NO AIS</text>
      <text y="-15" textAnchor="middle" className="sx-label">{Math.round(range).toLocaleString()} m</text>
    </g>
  );
}

function SafetyZoneMarks() {
  return (
    <g className="zone-marks">
      {[190, 1120].map(x => (
        <g key={x}>
          <line x1={x} y1={SEA_Y - 26} x2={x} y2={SEA_Y + 24} />
          <text x={x} y={SEA_Y - 30} textAnchor="middle" className="sx-label">500 m</text>
        </g>
      ))}
    </g>
  );
}

// Gas detections: outline the detectors in warning/alarm per zone, with drift arrow
function GasDetections({ sensors, latest, driftSign }) {
  const groups = {};
  sensors.forEach(s => {
    if (!GAS_TYPES.has(s.type)) return;
    const r = latest[s.id];
    if (!r || (r.status !== "warning" && r.status !== "alarm")) return;
    (groups[s.zone] = groups[s.zone] || []).push({ s, r });
  });
  return Object.entries(groups).map(([zone, items]) => {
    const xs = items.map(i => i.s.x), ys = items.map(i => i.s.y);
    const x0 = Math.min(...xs) - 20, x1 = Math.max(...xs) + 20;
    const y0 = Math.min(...ys) - 18, y1 = Math.max(...ys) + 18;
    const worst = items.some(i => i.r.status === "alarm") ? "alarm" : "warning";
    const gases = [...new Set(items.map(i => i.s.type === "GD_H2S" ? "H₂S" : "HC"))].join(" + ");
    const ax = driftSign >= 0 ? x1 + 4 : x0 - 4;
    return (
      <g key={zone} className={`gas-hull st-${worst}`}>
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx="12" />
        <text x={x0} y={y0 - 5} className="sx-label strong">
          {gases} {worst.toUpperCase()} · {items.length} detector{items.length > 1 ? "s" : ""}
        </text>
        <path d={`M${ax},${(y0 + y1) / 2} h${driftSign * 26} m${-driftSign * 6},-4 l${driftSign * 6},4 l${-driftSign * 6},4`}
              className="drift-arrow" />
      </g>
    );
  });
}

// ---------- markers + callouts ----------

function SensorMarker({ sensor, reading, alert, dimmed, selected, hovered, onSelect, onHover, onLeave }) {
  const cat = CATEGORIES[sensor.category];
  const status = reading ? reading.status : "normal";
  const unack = alert && !alert.acked && alert.state === "active" && status !== "normal";
  return (
    <g
      className={`mk st-${status} ${dimmed ? "dim" : ""} ${selected ? "sel" : ""} ${hovered ? "hov" : ""}`}
      transform={`translate(${sensor.x} ${sensor.y})`}
      onClick={e => { e.stopPropagation(); onSelect(sensor.id); }}
      onMouseEnter={e => onHover(sensor.id, e)}
      onMouseMove={e => onHover(sensor.id, e)}
      onMouseLeave={onLeave}
      tabIndex={dimmed ? -1 : 0}
      role="button"
      aria-label={`${sensor.label}, ${sensor.id}, ${status}`}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(sensor.id); } }}
    >
      <circle r="13" className="mk-hit" />
      {unack && <circle r="9" className="mk-pulse" />}
      {selected && <circle r="13" className="mk-ring" />}
      <g className="mk-body">
        <ShapePath shape={cat.shape} className="mk-shape" />
        <ShapeLetter shape={cat.shape} code={cat.code} />
      </g>
    </g>
  );
}

// Greedy placement of value callouts for alerting sensors so they don't collide
function placeCallouts(items) {
  const placed = [];
  const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const out = [];
  items.sort((a, b) => STATUS_RANK[b.status] - STATUS_RANK[a.status]);
  for (const it of items) {
    const w = 10 + it.text.length * 5.9, h = 14;
    const cands = [
      { x: it.x + 11, y: it.y - h / 2 },
      { x: it.x - 11 - w, y: it.y - h / 2 },
      { x: it.x - w / 2, y: it.y + 11 },
      { x: it.x - w / 2, y: it.y - 11 - h },
    ];
    const box = cands.map(c => ({ ...c, w, h })).find(b => !placed.some(p => hit(p, b)) && b.x > 0 && b.x + w < W);
    if (!box) continue;
    placed.push(box);
    out.push({ ...it, box });
  }
  return out;
}

function Callouts({ sensors, latest, isVisible }) {
  const items = [];
  sensors.forEach(s => {
    const r = latest[s.id];
    if (!r || !isVisible(s)) return;
    if (r.status === "warning" || r.status === "alarm" || r.status === "offline") {
      const text = r.status === "offline" ? "NO DATA" : `${fmtValue(r.value, s.type)} ${fmtUnit(s.type)}`.trim();
      items.push({ id: s.id, x: s.x, y: s.y, status: r.status, text });
    }
  });
  return placeCallouts(items).map(c => (
    <g key={c.id} className={`callout st-${c.status}`} pointerEvents="none">
      <rect x={c.box.x} y={c.box.y} width={c.box.w} height={c.box.h} rx="2" />
      <text x={c.box.x + 5} y={c.box.y + c.box.h / 2} dominantBaseline="central">{c.text}</text>
    </g>
  ));
}

// ---------- main ----------

function RigSchematic({
  sensors, latest, alertBySensor, isVisible, selectedId, onSelect,
  focusZones, hoverZone, pinnedZone, onZoneHover, onZoneClick, showZones, children,
}) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const v = (id, d) => latest[id]?.value ?? d;

  const wind = v("WIND-MET-01", 14), wdir = v("WDIR-MET-01", 135);
  const storm = clamp((wind - 18) / 18, 0, 1);
  const driftSign = -Math.sin(wdir * Math.PI / 180) >= 0 ? 1 : -1;

  const onHover = (id, e) => {
    const box = wrapRef.current.getBoundingClientRect();
    setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top, w: box.width });
    onZoneHover(sensors.find(s => s.id === id)?.zone || null);
  };
  const onLeave = () => { setHover(null); onZoneHover(null); };

  const zoneEntries = Object.entries(ZONES);
  const hovered = hover && sensors.find(s => s.id === hover.id);

  return (
    <div className="schematic" ref={wrapRef}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="schematic-svg"
           onClick={() => onZoneClick(null)}
           role="img" aria-label="Platform schematic with sensor markers">
        <Sky storm={storm} lightningKm={v("LIGHTNING-MET-01", 120)} />
        <Sea hs={v("WAVE-SEA-01", 1.6)} />
        <SafetyZoneMarks />
        <SupplyVessel />
        <UnknownVessel range={v("RADAR-PER-01", 15000)} status={latest["RADAR-PER-01"]?.status || "normal"} />
        <Jacket />
        <Flare flow={v("FLARE-FLR-01", 1.4)} />
        <Topsides />
        <SeparatorLevel level={v("LT-SEP-PRC-01", 50)} />
        <Windsock windKt={v("WIND-HLD-01", 14)} driftSign={driftSign} />
        <g className="wave-anim">
          <path d={wavePath(2 + v("WAVE-SEA-01", 1.6) * 2.2, 70, SEA_Y)} className="wave-line" />
        </g>

        {/* zones: hover to name, click to pin the area banner */}
        <g className="zones">
          {zoneEntries.map(([key, z]) => {
            const [x, y, w, h] = z.rect;
            const on = showZones || hoverZone === key || pinnedZone === key || focusZones.has(key);
            return (
              <g key={key} className={`zone ${on ? "on" : ""} ${focusZones.has(key) ? "focus" : ""} ${pinnedZone === key ? "pinned" : ""}`}
                 onMouseEnter={() => onZoneHover(key)} onMouseLeave={() => onZoneHover(null)}
                 onClick={e => { e.stopPropagation(); onZoneClick(key); }}>
                <rect x={x} y={y} width={w} height={h} rx="4" />
                {on && <text x={x + 4} y={y + 10} className="zone-label">{z.label.toUpperCase()}</text>}
              </g>
            );
          })}
        </g>

        <GasDetections sensors={sensors} latest={latest} driftSign={driftSign} />

        <g className="markers">
          {sensors.map(s => (
            <SensorMarker
              key={s.id}
              sensor={s}
              reading={latest[s.id]}
              alert={alertBySensor[s.id]}
              dimmed={!isVisible(s)}
              selected={selectedId === s.id}
              hovered={hover?.id === s.id}
              onSelect={onSelect}
              onHover={onHover}
              onLeave={onLeave}
            />
          ))}
        </g>
        <Callouts sensors={sensors} latest={latest} isVisible={isVisible} />
      </svg>

      {children}

      {hovered && (
        <SensorTooltip sensor={hovered} reading={latest[hovered.id]} x={hover.x} y={hover.y} w={hover.w} />
      )}
    </div>
  );
}

function SensorTooltip({ sensor, reading, x, y, w }) {
  const type = SENSOR_TYPES[sensor.type];
  const status = reading?.status || "normal";
  const left = x > w - 260 ? x - 250 : x + 16;
  return (
    <div className="tooltip" style={{ left, top: y + 14 }}>
      <div className="tt-head">
        <CategoryIcon category={sensor.category} />
        <span className="mono tt-id">{sensor.id}</span>
        <span className={`pill st-${status}`}><StatusIcon status={status} size={10} /> {window.Fmt.STATUS_LABEL[status]}</span>
      </div>
      <div className="tt-name">{sensor.label}</div>
      <div className="tt-type">{type.name}</div>
      <div className="tt-value mono">
        {fmtValue(reading?.value, sensor.type)} <span>{fmtUnit(sensor.type)}</span>
      </div>
      <div className="tt-hint">Click for detail & trend</div>
    </div>
  );
}

window.RigSchematic = RigSchematic;

})();
