# Offshore platform sensor catalog

What gets instrumented on an offshore oil & gas platform, grouped by what the
reading is *for*, and what each sensor can tell an operator. This is the
taxonomy behind the demo: `js/catalog.jsx` is the source of truth, and the
tables below are generated from it (`node scripts/gen-catalog-doc.js`).

> **Demo values.** Thresholds are plausible illustrative numbers, not
> engineering, regulatory, or safety limits. Real alarm set points come from
> the site's safety case, equipment vendors, permits, and the applicable
> standards. A monitoring overlay like Sigil Watch runs *alongside* the
> certified fire & gas and ESD systems and never replaces them.

## The six categories

| Category | Question it answers | Typical consumers |
|---|---|---|
| **Safety** | Is anyone about to be hurt — gas, fire, toxic exposure, missing people? | Control room, OIM, emergency response |
| **Security** | Who or what is approaching or entering — physically or on the network? | Control room, security officer, company security / SOC |
| **Operations** | Is the process, drilling and power producing safely and efficiently? | Control room operators, driller, production engineers |
| **Integrity** | Is the structure and pipework sound, now and over its design life? | Structural / integrity engineers, inspection planners |
| **Environment** | Are discharges and emissions within permits; is marine life protected? | HSE advisor, regulators (reporting) |
| **Weather & Sea** | Can we fly, lift, transfer, and keep working outside? | OIM, helideck officer, crane operators, marine |

The categories overlap on purpose. A few readings that matter twice:

- **Wind** is weather, but it also decides **gas dispersion** direction
  (safety), **crane limits** (operations), and **helicopter ops**.
- **Pit gain** is a drilling measurement, but it is the earliest warning of a
  **well-control** event (kick), the most serious hazard on a drilling rig.
- **Strain** and **accelerometers** are integrity, but after a vessel impact
  or storm they become an immediate safety question.
- **Cameras** serve security (intrusion), safety (fire / smoke confirmation),
  and environment (flare state, sheen).

## Derived operational states

Some of the most useful things on the dashboard aren't sensors but
*decisions* combined from several sensors. The demo computes five:

| State | Inputs | Example rule (demo) |
|---|---|---|
| Helideck | helideck wind, gust, visibility, lightning distance, deck motion, drone RF | Suspended if gust ≥ 50 kt, visibility ≤ 0.5 nm, lightning ≤ 10 km, motion ≥ 80 mg, or drone present |
| Crane ops | boom-tip wind, lightning | Stopped at ≥ 40 kt or lightning ≤ 10 km |
| Well control | pit volume gain | Flow check ≥ 10 bbl, shut in ≥ 20 bbl |
| Personnel | badge locators by zone, muster station | Muster in progress when anyone is at the muster point; shows count vs. POB |
| Production | multiphase flow meter | Rate in kbbl/d |

## Sensor types

<!-- BEGIN GENERATED -->

### Safety — shape: circle, code `S`

Fire, gas and people — detect hazards to life before they escalate. (9 types, 24 sensors in the demo)

| Type | Sensor | Unit | Warn / alarm | What it tells you | Demo locations |
|---|---|---|---|---|---|
| `GD_HC` | Flammable gas detector (IR point) | %LEL | ≥ 20 / 50 | Gas release before it reaches an ignition source; Triggers area ESD / ventilation changes at high LEL; At HVAC inlets: whether to isolate the living quarters | DRL, LQ, PRC, CMP, WHB |
| `GD_OP` | Open-path gas detector | LEL·m | ≥ 1 / 3 | Gas cloud anywhere along a line, not just at one point; Better coverage in open, windy modules | PRC |
| `GD_H2S` | H₂S toxic gas detector | ppm | ≥ 5 / 10 | Toxic exposure risk — smell is unreliable, H₂S deadens the nose; Sour gas breakthrough from wells or mud returns; Drives muster and breathing-apparatus decisions | DRL, WHB |
| `GD_O2` | Oxygen depletion monitor | %vol | ≤ 19.5 / 18 | Inert gas (N₂) leaks displacing oxygen; Confined-space entry safety | DRL, UTL |
| `FD_FLAME` | Flame detector (multi-IR / UV) | % signal | ≥ 40 / 75 | Fire in seconds, before heat detectors respond; Confirms or rules out ignition after a gas alarm | DRL, PRC, CMP |
| `HD_SMOKE` | Smoke / heat detector | °C | ≥ 57 / 68 | Fire in accommodation, galley and equipment rooms | LQ |
| `FW_PRESS` | Fire-water ring main pressure | bar | ≤ 9 / 7 | Firefighting system readiness; Pump start / deluge activation; Line rupture or valve misalignment | UTL |
| `ESDV` | ESD valve position | % open | ≤ 90 / 10 | Whether an isolation actually happened when commanded; Spurious trips that stop production | WHB, UTL |
| `POB` | Personnel locator (RFID / BLE) | persons | — | Persons on board by area; Muster accountability during an alarm; Lone-worker and restricted-area presence | DRL, LQ |

### Security — shape: diamond, code `X`

Who and what is approaching or entering — physical and cyber. (6 types, 11 sensors in the demo)

| Type | Sensor | Unit | Warn / alarm | What it tells you | Demo locations |
|---|---|---|---|---|---|
| `RADAR` | Surface radar + AIS fusion | m | ≤ 2000 / 500 | Unannounced vessels approaching the 500 m safety zone; Collision risk to the jacket and risers; Supply-vessel positioning | PER |
| `CCTV` | Thermal / PTZ camera analytics | events/min | ≥ 1 / 3 | Intrusion or unexpected people in restricted areas; Visual confirmation of other sensor alarms | DRL, DCK, HLD, PER, FLR |
| `ACCESS` | Access control reader | denied/hr | ≥ 2 / 5 | Unauthorized access attempts to control room, switchgear, telecoms | LQ |
| `DOOR` | Hatch / door contact | state | ≥ 0.5 / 0.5 | Unsecured hatches in weather; Restricted area breaches | LQ, UTL |
| `DRONE_RF` | RF drone detector | UAS | ≥ 1 / 2 | Unauthorized UAS overflight — surveillance or collision hazard to helicopters | PER |
| `OT_IDS` | OT network intrusion sensor | score | ≥ 60 / 85 | Unexpected devices or commands on the control network; Possible cyber intrusion or misconfiguration | LQ |

### Operations — shape: square, code `O`

Process, drilling, rotating equipment and power — produce safely and efficiently. (13 types, 16 sensors in the demo)

| Type | Sensor | Unit | Warn / alarm | What it tells you | Demo locations |
|---|---|---|---|---|---|
| `PT_WH` | Wellhead (tubing head) pressure | psi | ≥ 2900 / 3200 | Well productivity and choke performance; Blockage (hydrates, wax) or integrity loss; Annulus pressure build-up | WHB |
| `FT_MPFM` | Multiphase flow meter | bbl/d | — | Production rate without a test separator; Water breakthrough trends | WHB |
| `PT_SEP` | Separator pressure | psi | ≥ 1200 / 1300 | Process upset; Approach to relief-valve set pressure (flaring) | PRC |
| `LT_SEP` | Separator liquid level | % | ≥ 75 / 85; ≤ 20 / 10 | Liquid carry-over to the gas system at high level; Gas blow-by to downstream vessels at low level | PRC |
| `TT_PROC` | Process temperature | °C | ≥ 85 / 95; ≤ 25 / 18 | Hydrate or wax risk at low temperature; Heater performance | PRC |
| `VIB` | Machine vibration (accelerometer) | mm/s | ≥ 7.1 / 11 | Imbalance, misalignment, bearing wear — weeks before failure; Prioritises maintenance, avoids unplanned shutdowns | CMP |
| `BRG_T` | Bearing temperature | °C | ≥ 95 / 110 | Lubrication failure; Corroborates vibration trends | CMP |
| `GEN_LOAD` | Turbine generator load | % | ≥ 90 / 98 | Spare power capacity; Risk of load-shed or blackout if a unit trips | CMP |
| `PIT_VOL` | Mud pit volume gain | bbl | ≥ 10 / 20; ≤ -10 / -20 | Kick (formation fluid influx) — the earliest well-control warning; Lost circulation (losses) when negative | DRL |
| `SPP` | Standpipe pressure | psi | ≤ 2600 / 2300 | Washouts or plugged bit; Pressure drop that accompanies a kick | DRL |
| `HOOK` | Hook load | klb | ≥ 420 / 480 | Stuck pipe / overpull; Drill string weight and bit weight | DRL |
| `CRANE` | Crane load moment indicator | % SWL | ≥ 85 / 100 | Overload protection; Combined with wind: whether lifting can continue | DCK |
| `PT_PL` | Export pipeline pressure | psi | ≤ 1350 / 1200 | Pipeline leak (pressure loss); Blockage downstream | UTL |

### Integrity — shape: triangle, code `I`

Jacket, foundations and corrosion — the platform's long-term structural health. (5 types, 13 sensors in the demo)

| Type | Sensor | Unit | Warn / alarm | What it tells you | Demo locations |
|---|---|---|---|---|---|
| `STRAIN` | Jacket strain gauge | µε | ≥ 600 / 900 | Load from waves and storms; Fatigue accumulation at welded joints; Damage after vessel impact | JKT |
| `ACCEL` | Structural accelerometer | mg | ≥ 40 / 80 | Shift in natural frequency → hidden structural damage; Helideck motion limits for landings | HLD, JKT |
| `CORR_ER` | Corrosion probe (ER) | mpy | ≥ 5 / 10 | Internal corrosion of process piping; Effectiveness of corrosion-inhibitor dosing | PRC, UTL |
| `CP` | Cathodic protection potential | mV | ≥ -850 / -800 | Whether sacrificial anodes still protect the jacket; Depleted anodes before corrosion starts | JKT, SUB |
| `SCOUR` | Scour sonar | m | ≥ 1.5 / 2.5 | Loss of foundation support after storms or currents | SUB |

### Environment — shape: hexagon, code `E`

Discharges, emissions and marine life — permit compliance and sustainability. (6 types, 6 sensors in the demo)

| Type | Sensor | Unit | Warn / alarm | What it tells you | Demo locations |
|---|---|---|---|---|---|
| `OIW` | Oil-in-water analyzer | mg/L | ≥ 29 / 42 | Permit compliance for produced-water discharge; Water-treatment (hydrocyclone / flotation) performance | UTL |
| `SHEEN` | Oil-sheen detection radar | % conf. | ≥ 40 / 70 | Spills and leaks from risers, hoses or overboard lines; Spill extent and drift for response | PER |
| `CH4_FUG` | Fugitive methane camera (OGI) | ppm·m | ≥ 500 / 1000 | Leaking flanges, seals, vents — methane emissions; Flare combustion efficiency | FLR |
| `FLARE` | Flare gas flow meter | MMscfd | ≥ 8 / 12 | Process upsets and relief events; Flaring emissions reporting | FLR |
| `NOX` | Turbine exhaust NOx | ppm | ≥ 25 / 42 | Air-permit compliance; Combustion tuning | CMP |
| `HYDRO` | Hydrophone (underwater noise) | dB | ≥ 170 / 180 | Noise exposure for marine mammals during piling or drilling; Marine-mammal presence (vocalisations) | SUB |

### Weather & Sea — shape: invtriangle, code `W`

Wind, visibility, lightning, waves and current — gate helicopter, crane and marine ops. (10 types, 14 sensors in the demo)

| Type | Sensor | Unit | Warn / alarm | What it tells you | Demo locations |
|---|---|---|---|---|---|
| `WIND` | Anemometer — wind speed | kt | ≥ 30 / 40 | Crane and helicopter operating limits; Gas dispersion direction and speed | MET, DCK, HLD |
| `GUST` | Anemometer — gust | kt | ≥ 40 / 50 | Helideck limits — gusts matter more than mean wind | MET |
| `WDIR` | Wind direction | ° | — | Which way a gas release will drift; Safe muster and lifeboat side; Helicopter approach heading | MET |
| `BARO` | Barometer | hPa | ≤ 1000 / 990 | Approaching fronts and tropical systems; Rapid drops forecast squalls | MET |
| `AIRT` | Air temperature / humidity | °C | ≥ 36 / 40 | Heat stress for deck crews; Fog formation with humidity | MET |
| `VIS` | Visibility sensor | nm | ≤ 2 / 0.5 | Helicopter VFR minima; Fog / heavy rain affecting vessel ops and CCTV | MET |
| `LIGHTNING` | Lightning detector | km | ≤ 30 / 10 | Suspend crane, helideck and outdoor work; Protect hydrocarbon venting | MET |
| `WAVE` | Wave radar / buoy | m Hs | ≥ 3 / 4.5 | Supply-vessel and personnel-transfer limits; Structural loading | JKT, SEA |
| `CURRENT` | ADCP current profiler | kt | ≥ 2 / 3 | Riser and jacket loading; Loop-current eddies (Gulf of Mexico); ROV and diving limits | JKT, SEA |
| `SST` | Sea temperature | °C | — | Tropical-storm intensification potential; Process cooling-water performance | JKT |

### Zones

| Code | Location | Sensors |
|---|---|---|
| `MET` | Met mast | 7 |
| `DRL` | Drilling module | 10 |
| `DCK` | Upper deck & crane | 3 |
| `HLD` | Helideck | 3 |
| `LQ` | Quarters & control room | 8 |
| `PER` | Perimeter / 500 m zone | 4 |
| `FLR` | Flare boom | 3 |
| `PRC` | Process — separation | 8 |
| `CMP` | Compression & power | 7 |
| `WHB` | Well bay | 8 |
| `UTL` | Cellar — utilities | 7 |
| `JKT` | Jacket & splash zone | 10 |
| `SEA` | Sea surface (offshore) | 2 |
| `SUB` | Seabed & pipeline | 4 |
<!-- END GENERATED -->

## Data quality is part of the reading

Every sample carries a `quality` flag (`GOOD`, `NO_DATA`) and the node and link
it came over (`mesh`, `satellite`, `acoustic`). A sensor that stops reporting
raises a **fault**, not a silent "normal" — the jacket strain-gauge scenario
demonstrates this. Subsea acoustic links and satellite buoys have very
different latencies from the topsides mesh, and the feed shows that per sample.
