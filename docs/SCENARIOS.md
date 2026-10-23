# Scenarios

The simulator plays nine scripted events on a 600-second loop, defined in
`SCENARIOS` in `js/platform.jsx`. Outside these windows every sensor shows its
baseline plus noise. Jump to any scenario from the rail's Simulation section,
or with `?t=<seconds>`.

```
  0        60       120      180      240      300      360      420      480      540      600
  ├────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┼────────┤
  ██████████████████████████████████████████████████████████████████████████████████████████  bearing
           ██████████████████████                                                             h2s
                      ████████████████████                                                    kick
                                   ███████████████████████████████                            vessel
                                      ██████████████                                          node
                                               ████████████████████████████████████           squall
                                                          ████████████                        cyber
                                                                    █████████████████████     oiw
                                                                        █████████             drone
```

## Effects

Each scenario changes specific sensors with one of three effect kinds:

| Kind | Behaviour |
|---|---|
| `plateau` | Smooth rise over `rise` seconds (default 20), hold, smooth fall at the end; adds `delta` to the baseline |
| `ramp` | Linear from 0 to `delta` across the window |
| `offline` | The sensor reports `null` (NO DATA) for the window |

An effect can have its own `at: [start, end]` to lag or lead the scenario,
for example the muster starting after the gas alarm.

## The nine scenarios

### Compressor B bearing degradation · Operations · 0–600 s

Vibration on compressor B trends up for the whole loop and bearing
temperature follows: predictive maintenance catching it before a trip.

| Sensor | Effect |
|---|---|
| `VIB-CMP-02` | ramp +7.2 mm/s |
| `BRG-T-CMP-01` | ramp +22 °C |

Starts the loop in normal, reaches warning partway through, and is the
slow-burn counterpoint to the sudden events.

### Sour gas release, well bay · Safety · 60–210 s

H₂S detectors in the well bay climb past alarm while Well A-02 tubing
pressure sags: a leaking tree seal. Crew in the quarters muster at the
lifeboat station.

| Sensor | Effect |
|---|---|
| `GD-H2S-WHB-02` | plateau +16 ppm |
| `GD-H2S-WHB-01` | plateau +7 ppm |
| `GD-HC-WHB-01` | plateau +13 %LEL |
| `PT-WH-WHB-02` | plateau −260 psi |
| `POB-LQ-02` (muster) | plateau +52 persons, 95–235 s |
| `POB-LQ-01` (quarters) | plateau −46 persons, 95–235 s |
| `POB-DRL-01` (drill crew) | plateau −6 persons, 95–235 s |

Shows the gas outline and drift arrow, and the Personnel tile counting
people to muster.

### Pit gain while drilling, possible kick · Operations · 130–270 s

Active pit volume rises while standpipe pressure falls: the classic kick
signature. The driller performs a flow check.

| Sensor | Effect |
|---|---|
| `PIT-VOL-DRL-01` | plateau +15 bbl |
| `SPP-DRL-01` | plateau −320 psi |
| `GD-H2S-DRL-01` | plateau +3.2 ppm |

Well control goes to FLOW CHECK. Overlaps the H₂S event, so two safety-
critical problems are on screen at once.

### Unidentified vessel approaching · Security · 220–430 s

Radar tracks a target with no AIS closing on the 500 m safety zone. The
thermal camera confirms a small craft.

| Sensor | Effect |
|---|---|
| `RADAR-PER-01` | plateau −14,580 m (to about 420 m) |
| `CCTV-PER-01` | plateau +2.4 events/min, 290–400 s |

The vessel appears on the drawing inside 9 km and moves in with its range.

### Mesh node offline, jacket strain gauge · Integrity · 240–330 s

A mesh node on the jacket drops out. Neighbouring sensors re-route; the gauge
reports a comms fault rather than a false "normal".

| Sensor | Effect |
|---|---|
| `STRAIN-JKT-03` | offline |

Shows NO DATA, a FAULT alert, and MESH: DEGRADED in the status bar.

### Squall line passing · Weather & Sea · 300–540 s

Gusts over helideck limits, lightning within 10 km, falling visibility and
building seas. Helicopter and crane operations are suspended.

| Sensor | Effect |
|---|---|
| `WIND-MET-01`, `WIND-HLD-01` | plateau +22 kt |
| `WIND-DCK-01` (crane boom tip) | plateau +29 kt |
| `GUST-MET-01` | plateau +34 kt |
| `WDIR-MET-01` | plateau +85° (wind veers) |
| `BARO-MET-01` | plateau −15 hPa |
| `AIRT-MET-01` | plateau −5 °C |
| `VIS-MET-01` | plateau −8.3 nm |
| `LIGHTNING-MET-01` | plateau −114 km |
| `WAVE-SEA-01`, `WAVE-JKT-01` | plateau +2.4 m, +2.1 m |
| `ACCEL-HLD-01` (helideck motion) | plateau +38 mg |
| `STRAIN-JKT-01/02/04` | plateau +240 to +300 µε |
| `CRANE-DCK-01` | plateau −34 % SWL (load set down) |

The biggest visual change: storm sky, rain, lightning, waves, the windsock and
gas drift direction. Weather drives operations (helideck, crane) and
integrity (jacket strain) at the same time.

### Unusual Modbus writes on the OT network · Security · 370–450 s

The OT intrusion sensor flags unexpected write commands to a PLC, while badge
attempts are denied at the control-room door.

| Sensor | Effect |
|---|---|
| `OT-IDS-LQ-01` | plateau +64 score |
| `ACCESS-LQ-01` | plateau +3.4 denied/hr, 380–430 s |

Physical and cyber security correlated on one screen.

### Produced-water oil-in-water excursion · Environment · 440–580 s

A hydrocyclone upset pushes oil-in-water above the discharge permit limit.
Flaring and methane at the flare rise as gas is diverted.

| Sensor | Effect |
|---|---|
| `OIW-UTL-01` | plateau +30 mg/L |
| `FLARE-FLR-01` | plateau +7.4 MMscfd, 460–560 s |
| `CH4-FUG-FLR-01` | plateau +560 ppm·m, 460–560 s |

The flare grows on the drawing.

### Drone near helideck · Security · 470–525 s

An RF detector picks up a drone control link near the helideck approach.

| Sensor | Effect |
|---|---|
| `DRONE-RF-PER-01` | plateau +1.3 UAS |

Suspends the helideck on its own, on top of the squall.

## Adding a scenario

1. Add an entry to `SCENARIOS` with `id`, `title`, `category`, `window`,
   `story` and `effects`.
2. Use sensor ids exactly as generated (`TYPE-ZONE-nn`). Unknown ids log a
   `[sim]` warning in the console at load.
3. Pick deltas against the type's limits in `js/catalog.jsx` so the sensor
   crosses warning or alarm when intended.
4. Check the overlap with other scenarios. Too many simultaneous alarms makes
   the demo harder to follow, which is itself a lesson in alarm flooding.
