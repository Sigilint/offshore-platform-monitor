// Platform definition — fictional fixed-jacket platform, sensor placements,
// and the scripted scenarios the simulator plays on a loop.
// Coordinates are schematic space (viewBox 0 0 1200 760).

(() => {

const PLATFORM = {
  name: "KESTREL-A",
  block: "GC-718 (fictional)",
  region: "Gulf of Mexico",
  waterDepth: "212 m",
  type: "Fixed jacket · drilling + production",
  loopSeconds: 600,
};

// [type, zone, x, y, label, overrides]
const PLACEMENTS = [
  // Met mast — crossarm above the derrick
  ["WIND",      "MET", 330, 22, "Met mast anemometer"],
  ["GUST",      "MET", 350, 22, "Met mast gust"],
  ["WDIR",      "MET", 370, 22, "Met mast wind vane"],
  ["BARO",      "MET", 390, 22, "Met mast barometer"],
  ["AIRT",      "MET", 410, 22, "Met mast air temp / RH"],
  ["VIS",       "MET", 430, 22, "Met mast visibility"],
  ["LIGHTNING", "MET", 450, 22, "Met mast lightning"],

  // Drilling module
  ["HOOK",      "DRL", 380, 80,  "Travelling block hook load"],
  ["CCTV",      "DRL", 345, 140, "Derrick PTZ camera"],
  ["SPP",       "DRL", 430, 190, "Standpipe manifold"],
  ["FD_FLAME",  "DRL", 418, 232, "Drill floor flame detector"],
  ["GD_HC",     "DRL", 350, 240, "Drill floor gas"],
  ["POB",       "DRL", 520, 236, "Drill crew (badges)", { base: 6 }],
  ["GD_H2S",    "DRL", 465, 248, "Shale shaker H₂S"],
  ["GD_O2",     "DRL", 330, 268, "Mud room O₂"],
  ["GD_H2S",    "DRL", 395, 268, "Bell nipple H₂S"],
  ["PIT_VOL",   "DRL", 500, 268, "Active pit volume"],

  // Upper deck & crane
  ["WIND",      "DCK", 548, 140, "Crane boom-tip anemometer"],
  ["CRANE",     "DCK", 620, 252, "Pedestal crane LMI"],
  ["CCTV",      "DCK", 665, 262, "Laydown area camera"],

  // Helideck
  ["CCTV",      "HLD", 705, 160, "Helideck camera"],
  ["ACCEL",     "HLD", 790, 160, "Helideck motion sensor"],
  ["WIND",      "HLD", 880, 160, "Helideck anemometer"],

  // Living quarters & control room
  ["HD_SMOKE",  "LQ", 720, 201, "Galley heat/smoke"],
  ["HD_SMOKE",  "LQ", 760, 201, "Cabins heat/smoke"],
  ["GD_HC",     "LQ", 840, 201, "HVAC inlet gas"],
  ["POB",       "LQ", 712, 233, "Accommodation (badges)", { base: 48 }],
  ["DOOR",      "LQ", 800, 233, "Switchgear room door"],
  ["OT_IDS",    "LQ", 740, 265, "Control-room OT IDS"],
  ["ACCESS",    "LQ", 780, 265, "Control-room access"],
  ["POB",       "LQ", 830, 265, "Muster station / lifeboats", { base: 0 }],

  // Perimeter sensor mast
  ["RADAR",     "PER", 875, 200, "Surface radar / AIS"],
  ["DRONE_RF",  "PER", 875, 222, "RF drone detector"],
  ["CCTV",      "PER", 875, 244, "Thermal perimeter camera"],
  ["SHEEN",     "PER", 875, 266, "Oil-sheen radar"],

  // Flare boom
  ["CCTV",      "FLR", 150, 174, "Flare tip thermal camera"],
  ["CH4_FUG",   "FLR", 210, 216, "Flare OGI methane camera"],
  ["FLARE",     "FLR", 285, 262, "Flare header flow"],

  // Process — separation
  ["PT_SEP",    "PRC", 475, 298, "HP separator pressure"],
  ["GD_OP",     "PRC", 530, 298, "Open-path beam, process module"],
  ["TT_PROC",   "PRC", 585, 298, "Separator inlet temp"],
  ["LT_SEP",    "PRC", 527, 323, "HP separator level"],
  ["GD_HC",     "PRC", 465, 344, "Process gas (west)"],
  ["FD_FLAME",  "PRC", 500, 344, "Process flame detector"],
  ["CORR_ER",   "PRC", 565, 344, "Process piping ER probe"],
  ["GD_HC",     "PRC", 600, 344, "Process gas (east)"],

  // Compression & power
  ["VIB",       "CMP", 646, 300, "Compressor A vibration"],
  ["VIB",       "CMP", 702, 300, "Compressor B vibration"],
  ["BRG_T",     "CMP", 702, 330, "Compressor B bearing temp"],
  ["GD_HC",     "CMP", 674, 344, "Compression gas"],
  ["FD_FLAME",  "CMP", 760, 296, "Turbine hall flame detector"],
  ["GEN_LOAD",  "CMP", 790, 326, "Turbine generator load"],
  ["NOX",       "CMP", 825, 296, "Turbine exhaust NOx"],

  // Well bay
  ["GD_H2S",    "WHB", 330, 368, "Well bay H₂S (west)"],
  ["GD_HC",     "WHB", 362, 368, "Well bay gas"],
  ["GD_H2S",    "WHB", 392, 368, "Well bay H₂S (east)"],
  ["FT_MPFM",   "WHB", 436, 370, "Production manifold MPFM"],
  ["PT_WH",     "WHB", 345, 396, "Well A-01 THP", { base: 2400 }],
  ["PT_WH",     "WHB", 375, 396, "Well A-02 THP", { base: 2650 }],
  ["PT_WH",     "WHB", 405, 396, "Well A-03 THP", { base: 1980 }],
  ["ESDV",      "WHB", 436, 396, "Production header ESDV"],

  // Cellar deck utilities
  ["CORR_ER",   "UTL", 510, 384, "Produced water line ER probe"],
  ["GD_O2",     "UTL", 560, 384, "Sump room O₂"],
  ["DOOR",      "UTL", 610, 384, "Cellar hatch"],
  ["OIW",       "UTL", 675, 384, "Produced water OiW"],
  ["PT_PL",     "UTL", 735, 384, "Export riser pressure"],
  ["FW_PRESS",  "UTL", 785, 384, "Fire-water ring main"],
  ["ESDV",      "UTL", 825, 384, "Riser ESDV"],

  // Jacket & splash zone
  ["WAVE",      "JKT", 305, 428, "Downward wave radar"],
  ["ACCEL",     "JKT", 570, 428, "Deck-level accelerometer"],
  ["STRAIN",    "JKT", 333, 470, "Leg A1 splash-zone node"],
  ["STRAIN",    "JKT", 807, 470, "Leg B2 splash-zone node"],
  ["SST",       "JKT", 570, 520, "Sea temperature"],
  ["CP",        "JKT", 461, 560, "Leg A2 CP reference cell"],
  ["CP",        "JKT", 680, 560, "Leg B1 CP reference cell"],
  ["STRAIN",    "JKT", 316, 600, "Leg A1 mid-water node"],
  ["STRAIN",    "JKT", 824, 600, "Leg B2 mid-water node"],
  ["CURRENT",   "JKT", 570, 610, "Jacket-mounted ADCP"],

  // Offshore — wave buoy
  ["WAVE",      "SEA", 1150, 452, "Wave buoy"],
  ["CURRENT",   "SEA", 1150, 486, "Wave buoy current"],

  // Seabed & pipeline
  ["SCOUR",     "SUB", 312, 714, "Leg A1 scour sonar"],
  ["SCOUR",     "SUB", 828, 714, "Leg B2 scour sonar"],
  ["HYDRO",     "SUB", 1000, 716, "Seabed hydrophone"],
  ["CP",        "SUB", 1100, 722, "Export pipeline CP"],
];

const LINK_BY_ZONE = { SUB: "acoustic", SEA: "satellite", JKT: "mesh", MET: "mesh" };

// Build sensor records with stable IDs: TYPE-ZONE-nn
const SENSORS = (() => {
  const counts = {};
  return PLACEMENTS.map(([type, zone, x, y, label, overrides], i) => {
    const key = `${type}-${zone}`;
    counts[key] = (counts[key] || 0) + 1;
    const id = `${type.replace("_", "-")}-${zone}-${String(counts[key]).padStart(2, "0")}`;
    return {
      id, type, zone, x, y, label,
      index: i,
      node: `SN-${String(10 + Math.floor(i / 3)).padStart(3, "0")}`,
      link: LINK_BY_ZONE[zone] || "mesh",
      ...(overrides || {}),
    };
  });
})();

// Scenario effects:
//   plateau — smooth rise over `rise` s, hold, smooth fall; adds `delta`
//   ramp    — linear 0 → delta over the window
//   offline — sensor stops reporting during the window
// Optional per-effect `at: [start, end]` overrides the scenario window.
const SCENARIOS = [
  {
    id: "h2s", title: "Sour gas release — well bay (Well A-02)", category: "safety",
    window: [60, 210],
    story: "H₂S detectors in the well bay climb past alarm while Well A-02 tubing pressure sags — a leaking tree seal. Crew in the quarters muster at the lifeboat station.",
    effects: [
      { sensor: "GD-H2S-WHB-02", kind: "plateau", delta: 16, rise: 30 },
      { sensor: "GD-H2S-WHB-01", kind: "plateau", delta: 7,  rise: 45 },
      { sensor: "GD-HC-WHB-01",  kind: "plateau", delta: 13, rise: 40 },
      { sensor: "PT-WH-WHB-02",  kind: "plateau", delta: -260, rise: 40 },
      { sensor: "POB-LQ-02",    kind: "plateau", delta: 52, rise: 25, at: [95, 235] },
      { sensor: "POB-LQ-01",    kind: "plateau", delta: -46, rise: 25, at: [95, 235] },
      { sensor: "POB-DRL-01",   kind: "plateau", delta: -6, rise: 25, at: [95, 235] },
    ],
  },
  {
    id: "kick", title: "Pit gain while drilling — possible kick", category: "operations",
    window: [130, 270],
    story: "Active pit volume rises with falling standpipe pressure — the classic kick signature. Driller performs a flow check.",
    effects: [
      { sensor: "PIT-VOL-DRL-01", kind: "plateau", delta: 15, rise: 45 },
      { sensor: "SPP-DRL-01",    kind: "plateau", delta: -320, rise: 45 },
      { sensor: "GD-H2S-DRL-01",  kind: "plateau", delta: 3.2, rise: 40 },
    ],
  },
  {
    id: "bearing", title: "Compressor B bearing degradation", category: "operations",
    window: [0, 600],
    story: "Vibration on compressor B trends up for the whole loop, bearing temperature follows — predictive maintenance catches it before a trip.",
    effects: [
      { sensor: "VIB-CMP-02",  kind: "ramp", delta: 7.2 },
      { sensor: "BRG-T-CMP-01", kind: "ramp", delta: 22 },
    ],
  },
  {
    id: "vessel", title: "Unidentified vessel approaching", category: "security",
    window: [220, 430],
    story: "Radar tracks a target with no AIS transponder closing on the 500 m safety zone. Thermal camera confirms a small craft.",
    effects: [
      { sensor: "RADAR-PER-01", kind: "plateau", delta: -14580, rise: 95 },
      { sensor: "CCTV-PER-01",  kind: "plateau", delta: 2.4, rise: 20, at: [290, 400] },
    ],
  },
  {
    id: "node", title: "Mesh node offline — jacket strain gauge", category: "structural",
    window: [240, 330],
    story: "A subsea-side mesh node drops out. The mesh re-routes neighbours; the gauge reports a comms fault rather than a false 'normal'.",
    effects: [{ sensor: "STRAIN-JKT-03", kind: "offline" }],
  },
  {
    id: "squall", title: "Squall line passing", category: "weather",
    window: [300, 540],
    story: "A squall line brings gusts over helideck limits, lightning within 10 km, falling visibility and building seas. Helicopter and crane ops are suspended.",
    effects: [
      { sensor: "WIND-MET-01",      kind: "plateau", delta: 22, rise: 60 },
      { sensor: "GUST-MET-01",      kind: "plateau", delta: 34, rise: 60 },
      { sensor: "WIND-DCK-01",      kind: "plateau", delta: 29, rise: 60 },
      { sensor: "WIND-HLD-01",      kind: "plateau", delta: 22, rise: 60 },
      { sensor: "WDIR-MET-01",      kind: "plateau", delta: 85, rise: 70 },
      { sensor: "BARO-MET-01",      kind: "plateau", delta: -15, rise: 80 },
      { sensor: "AIRT-MET-01",      kind: "plateau", delta: -5, rise: 60 },
      { sensor: "VIS-MET-01",       kind: "plateau", delta: -8.3, rise: 50 },
      { sensor: "LIGHTNING-MET-01", kind: "plateau", delta: -114, rise: 70 },
      { sensor: "WAVE-JKT-01",      kind: "plateau", delta: 2.1, rise: 80 },
      { sensor: "WAVE-SEA-01",      kind: "plateau", delta: 2.4, rise: 80 },
      { sensor: "ACCEL-HLD-01",     kind: "plateau", delta: 38, rise: 60 },
      { sensor: "STRAIN-JKT-01",    kind: "plateau", delta: 260, rise: 80 },
      { sensor: "STRAIN-JKT-02",    kind: "plateau", delta: 300, rise: 80 },
      { sensor: "STRAIN-JKT-04",    kind: "plateau", delta: 240, rise: 80 },
      { sensor: "CRANE-DCK-01",     kind: "plateau", delta: -34, rise: 30 },
    ],
  },
  {
    id: "cyber", title: "Unusual Modbus writes on the OT network", category: "security",
    window: [370, 450],
    story: "The OT IDS flags unexpected write commands to a PLC, coinciding with denied badge attempts at the control-room door.",
    effects: [
      { sensor: "OT-IDS-LQ-01",  kind: "plateau", delta: 64, rise: 20 },
      { sensor: "ACCESS-LQ-01", kind: "plateau", delta: 3.4, rise: 15, at: [380, 430] },
    ],
  },
  {
    id: "oiw", title: "Produced-water oil-in-water excursion", category: "environment",
    window: [440, 580],
    story: "A hydrocyclone upset pushes oil-in-water above the discharge permit limit. Methane at the flare rises as gas is diverted.",
    effects: [
      { sensor: "OIW-UTL-01",     kind: "plateau", delta: 30, rise: 40 },
      { sensor: "FLARE-FLR-01",   kind: "plateau", delta: 7.4, rise: 35, at: [460, 560] },
      { sensor: "CH4-FUG-FLR-01",  kind: "plateau", delta: 560, rise: 35, at: [460, 560] },
    ],
  },
  {
    id: "drone", title: "Drone near helideck", category: "security",
    window: [470, 525],
    story: "An RF detector picks up an unidentified drone control link close to the helideck approach path.",
    effects: [{ sensor: "DRONE-RF-PER-01", kind: "plateau", delta: 1.3, rise: 8 }],
  },
];

window.PlatformDef = { PLATFORM, SENSORS, SCENARIOS };

})();
