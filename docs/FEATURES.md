# Features

The screen, top to bottom and left to right.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Top bar: brand · site · UNACK badge · clock (UTC) · theme                │
├──────────────────────────────────────────────────────────────────────────┤
│ Status strip: 6 category tiles │ 5 derived operational states            │
├────────────┬──────────────────────────────────────────┬──────────────────┤
│ Filter     │ Schematic                    [Weather]   │ Sensor detail    │
│ rail       │                                          │ (when selected)  │
│            │                                          ├──────────────────┤
│ Simulation │                                          │ Alerts           │
├────────────┴──────────────────────────────────────────┴──────────────────┤
│ Raw feed (table / JSON)                                                  │
├──────────────────────────────────────────────────────────────────────────┤
│ Status bar: mesh · nodes · poll time · API calls · samples · sim speed   │
└──────────────────────────────────────────────────────────────────────────┘
```

## Top bar

- **Site line:** platform name, block, region and water depth from
  `getPlatform()`.
- **UNACK badge:** number of unacknowledged alerts, with the icon of the worst
  active priority.
- **Clock:** the simulated time in UTC.
- **Theme toggle:** dark (the default, for control rooms) or light. The choice
  is remembered in the browser; `?theme=` overrides it.

## Status strip

**Category tiles** (Safety, Security, Operations, Integrity, Environment,
Weather & Sea). Each shows the sensor count and counts of sensors in alarm,
warning or offline, or "all normal". The tile's edge takes the worst status.
Clicking a tile toggles that category in the filters.

**Derived operational states.** Each combines several sensors into a
decision. The tile's tooltip and second line say why.

| Tile | Values | Inputs |
|---|---|---|
| Helideck | OPEN, LIMITED, SUSPENDED | Helideck wind, gust, visibility, lightning distance, deck motion, drone RF |
| Crane ops | OPEN, LIMITED, STOPPED | Boom-tip wind, lightning distance |
| Well control | DRILLING, FLOW CHECK, SHUT IN | Active pit volume gain |
| Personnel | *n* POB, MUSTER *x*/*n* | Badge locators by area, muster station count |
| Production | rate in kbbl/d | Multiphase flow meter |

The rules are in `deriveOps()` in `js/panels.jsx` and tabulated in the
[sensor catalog](SENSOR_CATALOG.md#derived-operational-states).

## Schematic

The main view: a side elevation of the platform, looking north.

**Sensor markers.** One per sensor. The shape and letter give the category
(see [UI design](UI_DESIGN.md#encoding)); the fill gives the status. Abnormal
markers get a value callout ("16.4 ppm", "NO DATA") placed so callouts don't
overlap. Unacknowledged alerts pulse. The selected sensor gets a ring.

- **Hover** a marker for a tooltip: id, name, type, value and status.
- **Click** (or Enter/Space when focused) to open the sensor detail; click again
  to close it.
- Markers outside the current filters are dimmed and taken out of the tab
  order, not hidden, so the drawing keeps its context.

**Zones.** The 14 locations (met mast, drilling module, upper deck and crane,
helideck, quarters and control room, perimeter / 500 m zone, flare boom,
process, compression and power, well bay, cellar and utilities, jacket and
splash zone, sea surface, seabed and pipeline) are hit areas on the drawing. Hovering a
zone, or its row in the filter rail, outlines it. Clicking a zone toggles it as
a location filter. The rail's **outline** switch shows all zones at once.

**Live scene.** These parts are driven by the latest readings:

| Element | Driven by |
|---|---|
| Sky darkening, rain | Met mast wind speed |
| Lightning flash | Lightning distance under 15 km |
| Wave height (animated) | Wave buoy significant wave height |
| Flare size | Flare gas flow |
| Separator liquid level | Separator level transmitter |
| Windsock direction and lift | Helideck wind speed, wind direction |
| Unidentified vessel and its range label | Perimeter radar range (shown inside 9 km) |
| Dashed outline and drift arrow around gas detectors | Gas detectors in warning or alarm, wind direction |

The 500 m safety-zone marks and a supply vessel (on AIS) are static scenery.

**Weather card.** Floats top right: wind speed and direction on a compass
(the arrow points where the wind blows to), gust, wave height, visibility,
pressure and lightning distance. Rows in warning or alarm show the status
icon.

## Filter rail

All filters combine: a sensor must match every active filter. Within the
category and location lists, ticked items are alternatives.

| Control | Effect |
|---|---|
| Search | Matches sensor id, name or type name, case-insensitive |
| Status | All, Warn+ (warning or alarm), Alarm, Offline |
| Category | Checkboxes with counts. Changing them resets the type and narrows the type list |
| Sensor type | One type, or all |
| Location | Checkboxes with counts and the worst current status per zone. Hover outlines the zone on the drawing |
| Clear all filters | Appears when any filter is active |

The filters apply to the schematic (dimming), the raw feed, and the alert list
when its *Only alerts matching filters* switch is on.

**Simulation (demo only).** Loop position, speed (1×, 2×, 5×, 10×) and one
button per scenario. A scenario button jumps the loop to five seconds before
it starts; scenarios in progress are marked LIVE.

## Sensor detail

Opens above the alerts when a sensor is selected from the drawing or the
alert list.

- Category, id, name, type and location.
- Current value, unit and status pill, with the warning and alarm limits.
- **Trend** of the last ~180 samples, with warning and alarm limit lines when
  they're near the data. Hover for a crosshair and the value at that time.
- **Measures** and **What it tells you**, from the sensor catalog.
- Node, link (mesh, satellite or acoustic), reporting period, last latency,
  last sample time and data quality.
- **Show only this sensor in the raw feed.**

## Alerts

One alert per sensor while it is abnormal, loosely following ISA-18.2.

- **Priorities:** ALARM, WARNING, and FAULT (sensor not reporting).
- **States:** UNACK, ACK, and RTN (returned to normal but not yet
  acknowledged). An acknowledged alert disappears when its reading returns to
  normal; an RTN alert disappears when acknowledged.
- Escalating from warning to alarm makes an acknowledged alert unacknowledged
  again.
- Sorted active first, then by priority, then newest.
- Each shows the sensor name, id, value against the limit crossed, and the
  time raised. **Ack** acknowledges one; **Ack all** acknowledges all.
- Clicking an alert selects its sensor.
- *Only alerts matching filters* limits the list to the current filters.

## Raw feed

Every sample the API returns, newest first, filtered by the same controls as
the drawing.

- **Table:** time (ms), sensor, type, zone, value, unit, status, data quality,
  node / link, link latency, sequence number. Abnormal rows are tinted. On
  narrow screens the secondary columns are hidden.
- **JSON:** each sample exactly as the API returned it, one per line.
- **Exceptions only:** hides normal samples.
- **Pause / Resume:** freezes the view; polling continues underneath.
- Collapse with the arrow to give the drawing more room.
- The header shows the incoming rate (samples/s) and how many rows are shown.
  The table shows up to 250 rows, the JSON view up to 80; the client keeps
  the latest 1,500 samples.

## Status bar

Mesh health (OK, or DEGRADED · re-routed when any sensor is offline), nodes
reporting, last poll round-trip, API calls made, samples generated, simulation
speed, and the simulated-data disclaimer.

## URL parameters

| Param | Effect | Example |
|---|---|---|
| `t` | Start the loop at second *t* | `?t=300` |
| `speed` | Simulation speed | `?speed=5` |
| `theme` | `dark` or `light` | `?theme=light` |
