// Sensor catalog — categories, sensor types, and platform zones.
// This is the "what can a sensor tell us" taxonomy; docs/SENSOR_CATALOG.md is
// the long-form version. Thresholds are demo values, not engineering limits.
//
// limits: { hi: [warn, alarm] } and/or { lo: [warn, alarm] }
// sim:    { base, noise, dp, period }  — baseline, noise amplitude, decimals,
//         reporting period in seconds (sensor placements may override base)

(() => {

const CATEGORIES = {
  safety: {
    label: "Safety", code: "S", shape: "circle",
    blurb: "Fire, gas and people — detect hazards to life before they escalate.",
  },
  security: {
    label: "Security", code: "X", shape: "diamond",
    blurb: "Who and what is approaching or entering — physical and cyber.",
  },
  operations: {
    label: "Operations", code: "O", shape: "square",
    blurb: "Process, drilling, rotating equipment and power — produce safely and efficiently.",
  },
  structural: {
    label: "Integrity", code: "I", shape: "triangle",
    blurb: "Jacket, foundations and corrosion — the platform's long-term structural health.",
  },
  environment: {
    label: "Environment", code: "E", shape: "hexagon",
    blurb: "Discharges, emissions and marine life — permit compliance and sustainability.",
  },
  weather: {
    label: "Weather & Sea", code: "W", shape: "invtriangle",
    blurb: "Wind, visibility, lightning, waves and current — gate helicopter, crane and marine ops.",
  },
};

const SENSOR_TYPES = {
  // ---------------- SAFETY ----------------
  GD_HC: {
    category: "safety", name: "Flammable gas detector (IR point)", unit: "%LEL",
    measures: "Hydrocarbon gas concentration as a percentage of the lower explosive limit.",
    tells: ["Gas release before it reaches an ignition source", "Triggers area ESD / ventilation changes at high LEL", "At HVAC inlets: whether to isolate the living quarters"],
    limits: { hi: [20, 50] }, sim: { base: 1.2, noise: 0.8, dp: 1, period: 2 },
  },
  GD_OP: {
    category: "safety", name: "Open-path gas detector", unit: "LEL·m",
    measures: "Integrated hydrocarbon concentration along an infrared beam across a module.",
    tells: ["Gas cloud anywhere along a line, not just at one point", "Better coverage in open, windy modules"],
    limits: { hi: [1, 3] }, sim: { base: 0.15, noise: 0.08, dp: 2, period: 2 },
  },
  GD_H2S: {
    category: "safety", name: "H₂S toxic gas detector", unit: "ppm",
    measures: "Hydrogen sulfide concentration (electrochemical / MOS cell).",
    tells: ["Toxic exposure risk — smell is unreliable, H₂S deadens the nose", "Sour gas breakthrough from wells or mud returns", "Drives muster and breathing-apparatus decisions"],
    limits: { hi: [5, 10] }, sim: { base: 0.3, noise: 0.25, dp: 1, period: 2 },
  },
  GD_O2: {
    category: "safety", name: "Oxygen depletion monitor", unit: "%vol",
    measures: "Oxygen concentration in enclosed or confined spaces.",
    tells: ["Inert gas (N₂) leaks displacing oxygen", "Confined-space entry safety"],
    limits: { lo: [19.5, 18.0] }, sim: { base: 20.9, noise: 0.05, dp: 1, period: 5 },
  },
  FD_FLAME: {
    category: "safety", name: "Flame detector (multi-IR / UV)", unit: "% signal",
    measures: "Radiant energy signature of hydrocarbon flames in the detector's field of view.",
    tells: ["Fire in seconds, before heat detectors respond", "Confirms or rules out ignition after a gas alarm"],
    limits: { hi: [40, 75] }, sim: { base: 2, noise: 1.5, dp: 0, period: 2 },
  },
  HD_SMOKE: {
    category: "safety", name: "Smoke / heat detector", unit: "°C",
    measures: "Ambient temperature with rate-of-rise; optical smoke obscuration.",
    tells: ["Fire in accommodation, galley and equipment rooms"],
    limits: { hi: [57, 68] }, sim: { base: 22, noise: 0.4, dp: 1, period: 5 },
  },
  FW_PRESS: {
    category: "safety", name: "Fire-water ring main pressure", unit: "bar",
    measures: "Pressure in the firewater distribution ring.",
    tells: ["Firefighting system readiness", "Pump start / deluge activation", "Line rupture or valve misalignment"],
    limits: { lo: [9, 7] }, sim: { base: 11.8, noise: 0.15, dp: 1, period: 5 },
  },
  ESDV: {
    category: "safety", name: "ESD valve position", unit: "% open",
    measures: "Position feedback from emergency shutdown valves.",
    tells: ["Whether an isolation actually happened when commanded", "Spurious trips that stop production"],
    limits: { lo: [90, 10] }, sim: { base: 100, noise: 0, dp: 0, period: 5 },
  },
  POB: {
    category: "safety", name: "Personnel locator (RFID / BLE)", unit: "persons",
    measures: "Badged personnel detected in a zone or at a muster point.",
    tells: ["Persons on board by area", "Muster accountability during an alarm", "Lone-worker and restricted-area presence"],
    limits: null, sim: { base: 4, noise: 0, dp: 0, period: 5 },
  },

  // ---------------- SECURITY ----------------
  RADAR: {
    category: "security", name: "Surface radar + AIS fusion", unit: "m",
    measures: "Range to the nearest surface target with no matching AIS transponder.",
    tells: ["Unannounced vessels approaching the 500 m safety zone", "Collision risk to the jacket and risers", "Supply-vessel positioning"],
    limits: { lo: [2000, 500] }, sim: { base: 15000, noise: 0, dp: 0, period: 3 },
  },
  CCTV: {
    category: "security", name: "Thermal / PTZ camera analytics", unit: "events/min",
    measures: "Video-analytics detections: people, vessels, smoke, or flare state.",
    tells: ["Intrusion or unexpected people in restricted areas", "Visual confirmation of other sensor alarms"],
    limits: { hi: [1, 3] }, sim: { base: 0, noise: 0, dp: 0, period: 5 },
  },
  ACCESS: {
    category: "security", name: "Access control reader", unit: "denied/hr",
    measures: "Denied or anomalous badge attempts at controlled doors.",
    tells: ["Unauthorized access attempts to control room, switchgear, telecoms"],
    limits: { hi: [2, 5] }, sim: { base: 0, noise: 0, dp: 0, period: 5 },
  },
  DOOR: {
    category: "security", name: "Hatch / door contact", unit: "state",
    measures: "Open (1) or closed (0) state of hatches and restricted doors.",
    tells: ["Unsecured hatches in weather", "Restricted area breaches"],
    limits: { hi: [0.5, 0.5] }, sim: { base: 0, noise: 0, dp: 0, period: 5 },
  },
  DRONE_RF: {
    category: "security", name: "RF drone detector", unit: "UAS",
    measures: "Count of unidentified drone control / video links detected.",
    tells: ["Unauthorized UAS overflight — surveillance or collision hazard to helicopters"],
    limits: { hi: [1, 2] }, sim: { base: 0, noise: 0, dp: 0, period: 5 },
  },
  OT_IDS: {
    category: "security", name: "OT network intrusion sensor", unit: "score",
    measures: "Anomaly score of control-system (SCADA / PLC) network traffic.",
    tells: ["Unexpected devices or commands on the control network", "Possible cyber intrusion or misconfiguration"],
    limits: { hi: [60, 85] }, sim: { base: 12, noise: 4, dp: 0, period: 5 },
  },

  // ---------------- OPERATIONS ----------------
  PT_WH: {
    category: "operations", name: "Wellhead (tubing head) pressure", unit: "psi",
    measures: "Pressure at the Christmas tree on each producing well.",
    tells: ["Well productivity and choke performance", "Blockage (hydrates, wax) or integrity loss", "Annulus pressure build-up"],
    limits: { hi: [2900, 3200] }, sim: { base: 2400, noise: 18, dp: 0, period: 2 },
  },
  FT_MPFM: {
    category: "operations", name: "Multiphase flow meter", unit: "bbl/d",
    measures: "Combined oil / water / gas flow from the production manifold.",
    tells: ["Production rate without a test separator", "Water breakthrough trends"],
    limits: null, sim: { base: 42100, noise: 220, dp: 0, period: 3 },
  },
  PT_SEP: {
    category: "operations", name: "Separator pressure", unit: "psi",
    measures: "Operating pressure of the HP production separator.",
    tells: ["Process upset", "Approach to relief-valve set pressure (flaring)"],
    limits: { hi: [1200, 1300] }, sim: { base: 1050, noise: 6, dp: 0, period: 2 },
  },
  LT_SEP: {
    category: "operations", name: "Separator liquid level", unit: "%",
    measures: "Oil/water interface and liquid level in the separator.",
    tells: ["Liquid carry-over to the gas system at high level", "Gas blow-by to downstream vessels at low level"],
    limits: { hi: [75, 85], lo: [20, 10] }, sim: { base: 50, noise: 1.5, dp: 1, period: 2 },
  },
  TT_PROC: {
    category: "operations", name: "Process temperature", unit: "°C",
    measures: "Fluid temperature at the separator inlet.",
    tells: ["Hydrate or wax risk at low temperature", "Heater performance"],
    limits: { hi: [85, 95], lo: [25, 18] }, sim: { base: 58, noise: 0.6, dp: 1, period: 5 },
  },
  VIB: {
    category: "operations", name: "Machine vibration (accelerometer)", unit: "mm/s",
    measures: "RMS velocity vibration on compressor and pump bearings (ISO 10816 zones).",
    tells: ["Imbalance, misalignment, bearing wear — weeks before failure", "Prioritises maintenance, avoids unplanned shutdowns"],
    limits: { hi: [7.1, 11] }, sim: { base: 2.8, noise: 0.25, dp: 2, period: 2 },
  },
  BRG_T: {
    category: "operations", name: "Bearing temperature", unit: "°C",
    measures: "RTD temperature on rotating-equipment bearings.",
    tells: ["Lubrication failure", "Corroborates vibration trends"],
    limits: { hi: [95, 110] }, sim: { base: 78, noise: 0.5, dp: 1, period: 5 },
  },
  GEN_LOAD: {
    category: "operations", name: "Turbine generator load", unit: "%",
    measures: "Electrical load on gas-turbine generators.",
    tells: ["Spare power capacity", "Risk of load-shed or blackout if a unit trips"],
    limits: { hi: [90, 98] }, sim: { base: 71, noise: 1.2, dp: 1, period: 3 },
  },
  PIT_VOL: {
    category: "operations", name: "Mud pit volume gain", unit: "bbl",
    measures: "Change in active mud pit volume versus expected while drilling.",
    tells: ["Kick (formation fluid influx) — the earliest well-control warning", "Lost circulation (losses) when negative"],
    limits: { hi: [10, 20], lo: [-10, -20] }, sim: { base: 0, noise: 0.3, dp: 1, period: 2 },
  },
  SPP: {
    category: "operations", name: "Standpipe pressure", unit: "psi",
    measures: "Mud pump discharge pressure at the drill floor.",
    tells: ["Washouts or plugged bit", "Pressure drop that accompanies a kick"],
    limits: { lo: [2600, 2300] }, sim: { base: 3150, noise: 15, dp: 0, period: 2 },
  },
  HOOK: {
    category: "operations", name: "Hook load", unit: "klb",
    measures: "Weight hanging from the derrick's travelling block.",
    tells: ["Stuck pipe / overpull", "Drill string weight and bit weight"],
    limits: { hi: [420, 480] }, sim: { base: 286, noise: 3, dp: 0, period: 2 },
  },
  CRANE: {
    category: "operations", name: "Crane load moment indicator", unit: "% SWL",
    measures: "Lift load as a percentage of safe working load at current radius.",
    tells: ["Overload protection", "Combined with wind: whether lifting can continue"],
    limits: { hi: [85, 100] }, sim: { base: 34, noise: 1, dp: 0, period: 3 },
  },
  PT_PL: {
    category: "operations", name: "Export pipeline pressure", unit: "psi",
    measures: "Pressure at the export riser / pipeline.",
    tells: ["Pipeline leak (pressure loss)", "Blockage downstream"],
    limits: { lo: [1350, 1200] }, sim: { base: 1480, noise: 5, dp: 0, period: 3 },
  },

  // ---------------- STRUCTURAL / INTEGRITY ----------------
  STRAIN: {
    category: "structural", name: "Jacket strain gauge", unit: "µε",
    measures: "Strain at jacket leg and brace nodes.",
    tells: ["Load from waves and storms", "Fatigue accumulation at welded joints", "Damage after vessel impact"],
    limits: { hi: [600, 900] }, sim: { base: 210, noise: 22, dp: 0, period: 5 },
  },
  ACCEL: {
    category: "structural", name: "Structural accelerometer", unit: "mg",
    measures: "Deck / helideck motion and natural frequency.",
    tells: ["Shift in natural frequency → hidden structural damage", "Helideck motion limits for landings"],
    limits: { hi: [40, 80] }, sim: { base: 9, noise: 2, dp: 1, period: 3 },
  },
  CORR_ER: {
    category: "structural", name: "Corrosion probe (ER)", unit: "mpy",
    measures: "Metal-loss rate from electrical-resistance probes.",
    tells: ["Internal corrosion of process piping", "Effectiveness of corrosion-inhibitor dosing"],
    limits: { hi: [5, 10] }, sim: { base: 1.6, noise: 0.08, dp: 2, period: 10 },
  },
  CP: {
    category: "structural", name: "Cathodic protection potential", unit: "mV",
    measures: "Steel-to-seawater potential vs Ag/AgCl reference (more negative = protected).",
    tells: ["Whether sacrificial anodes still protect the jacket", "Depleted anodes before corrosion starts"],
    limits: { hi: [-850, -800] }, sim: { base: -985, noise: 3, dp: 0, period: 10 },
  },
  SCOUR: {
    category: "structural", name: "Scour sonar", unit: "m",
    measures: "Seabed erosion depth around piles.",
    tells: ["Loss of foundation support after storms or currents"],
    limits: { hi: [1.5, 2.5] }, sim: { base: 0.42, noise: 0.01, dp: 2, period: 10 },
  },

  // ---------------- ENVIRONMENT ----------------
  OIW: {
    category: "environment", name: "Oil-in-water analyzer", unit: "mg/L",
    measures: "Hydrocarbon content of produced water before overboard discharge.",
    tells: ["Permit compliance for produced-water discharge", "Water-treatment (hydrocyclone / flotation) performance"],
    limits: { hi: [29, 42] }, sim: { base: 14, noise: 0.8, dp: 1, period: 5 },
  },
  SHEEN: {
    category: "environment", name: "Oil-sheen detection radar", unit: "% conf.",
    measures: "Confidence of an oil film on the sea surface (X-band radar / IR).",
    tells: ["Spills and leaks from risers, hoses or overboard lines", "Spill extent and drift for response"],
    limits: { hi: [40, 70] }, sim: { base: 4, noise: 2, dp: 0, period: 5 },
  },
  CH4_FUG: {
    category: "environment", name: "Fugitive methane camera (OGI)", unit: "ppm·m",
    measures: "Path-integrated methane from optical gas imaging.",
    tells: ["Leaking flanges, seals, vents — methane emissions", "Flare combustion efficiency"],
    limits: { hi: [500, 1000] }, sim: { base: 60, noise: 12, dp: 0, period: 5 },
  },
  FLARE: {
    category: "environment", name: "Flare gas flow meter", unit: "MMscfd",
    measures: "Gas volume sent to the flare (ultrasonic).",
    tells: ["Process upsets and relief events", "Flaring emissions reporting"],
    limits: { hi: [8, 12] }, sim: { base: 1.4, noise: 0.12, dp: 2, period: 3 },
  },
  NOX: {
    category: "environment", name: "Turbine exhaust NOx", unit: "ppm",
    measures: "NOx concentration in gas-turbine exhaust (CEMS).",
    tells: ["Air-permit compliance", "Combustion tuning"],
    limits: { hi: [25, 42] }, sim: { base: 16, noise: 0.9, dp: 1, period: 5 },
  },
  HYDRO: {
    category: "environment", name: "Hydrophone (underwater noise)", unit: "dB",
    measures: "Underwater sound pressure level (re 1 µPa).",
    tells: ["Noise exposure for marine mammals during piling or drilling", "Marine-mammal presence (vocalisations)"],
    limits: { hi: [170, 180] }, sim: { base: 138, noise: 2, dp: 0, period: 5 },
  },

  // ---------------- WEATHER & METOCEAN ----------------
  WIND: {
    category: "weather", name: "Anemometer — wind speed", unit: "kt",
    measures: "10-minute mean wind speed (ultrasonic anemometer).",
    tells: ["Crane and helicopter operating limits", "Gas dispersion direction and speed"],
    limits: { hi: [30, 40] }, sim: { base: 14, noise: 1.2, dp: 1, period: 3 },
  },
  GUST: {
    category: "weather", name: "Anemometer — gust", unit: "kt",
    measures: "3-second peak gust.",
    tells: ["Helideck limits — gusts matter more than mean wind"],
    limits: { hi: [40, 50] }, sim: { base: 19, noise: 2, dp: 1, period: 3 },
  },
  WDIR: {
    category: "weather", name: "Wind direction", unit: "°",
    measures: "Direction wind is blowing from.",
    tells: ["Which way a gas release will drift", "Safe muster and lifeboat side", "Helicopter approach heading"],
    limits: null, sim: { base: 135, noise: 4, dp: 0, period: 3 },
  },
  BARO: {
    category: "weather", name: "Barometer", unit: "hPa",
    measures: "Atmospheric pressure and its tendency.",
    tells: ["Approaching fronts and tropical systems", "Rapid drops forecast squalls"],
    limits: { lo: [1000, 990] }, sim: { base: 1013, noise: 0.2, dp: 1, period: 10 },
  },
  AIRT: {
    category: "weather", name: "Air temperature / humidity", unit: "°C",
    measures: "Ambient air temperature (with relative humidity).",
    tells: ["Heat stress for deck crews", "Fog formation with humidity"],
    limits: { hi: [36, 40] }, sim: { base: 29, noise: 0.2, dp: 1, period: 10 },
  },
  VIS: {
    category: "weather", name: "Visibility sensor", unit: "nm",
    measures: "Forward-scatter visibility.",
    tells: ["Helicopter VFR minima", "Fog / heavy rain affecting vessel ops and CCTV"],
    limits: { lo: [2, 0.5] }, sim: { base: 9, noise: 0.2, dp: 1, period: 5 },
  },
  LIGHTNING: {
    category: "weather", name: "Lightning detector", unit: "km",
    measures: "Distance to the nearest lightning strike.",
    tells: ["Suspend crane, helideck and outdoor work", "Protect hydrocarbon venting"],
    limits: { lo: [30, 10] }, sim: { base: 120, noise: 0, dp: 0, period: 5 },
  },
  WAVE: {
    category: "weather", name: "Wave radar / buoy", unit: "m Hs",
    measures: "Significant wave height.",
    tells: ["Supply-vessel and personnel-transfer limits", "Structural loading"],
    limits: { hi: [3, 4.5] }, sim: { base: 1.6, noise: 0.08, dp: 1, period: 5 },
  },
  CURRENT: {
    category: "weather", name: "ADCP current profiler", unit: "kt",
    measures: "Sea current speed through the water column.",
    tells: ["Riser and jacket loading", "Loop-current eddies (Gulf of Mexico)", "ROV and diving limits"],
    limits: { hi: [2, 3] }, sim: { base: 0.8, noise: 0.05, dp: 2, period: 10 },
  },
  SST: {
    category: "weather", name: "Sea temperature", unit: "°C",
    measures: "Sea-surface temperature.",
    tells: ["Tropical-storm intensification potential", "Process cooling-water performance"],
    limits: null, sim: { base: 28.4, noise: 0.05, dp: 1, period: 10 },
  },
};

// Platform zones — rectangles in schematic space (viewBox 0 0 1200 760)
const ZONES = {
  MET: { label: "Met mast",                 rect: [318, 6, 146, 28] },
  DRL: { label: "Drilling module",          rect: [312, 38, 228, 248] },
  DCK: { label: "Upper deck & crane",       rect: [540, 120, 150, 166] },
  HLD: { label: "Helideck",                 rect: [688, 128, 206, 50] },
  LQ:  { label: "Quarters & control room",  rect: [692, 180, 166, 106] },
  PER: { label: "Perimeter / 500 m zone",   rect: [860, 180, 40, 106] },
  FLR: { label: "Flare boom",               rect: [80, 120, 232, 180] },
  PRC: { label: "Process — separation",     rect: [448, 288, 166, 66] },
  CMP: { label: "Compression & power",      rect: [614, 288, 230, 66] },
  WHB: { label: "Well bay",                 rect: [312, 356, 140, 54] },
  UTL: { label: "Cellar — utilities",       rect: [452, 356, 392, 54] },
  JKT: { label: "Jacket & splash zone",     rect: [290, 412, 560, 280] },
  SEA: { label: "Sea surface (offshore)",   rect: [900, 440, 300, 60] },
  SUB: { label: "Seabed & pipeline",        rect: [280, 692, 920, 68] },
};

window.Catalog = { CATEGORIES, SENSOR_TYPES, ZONES };

})();
