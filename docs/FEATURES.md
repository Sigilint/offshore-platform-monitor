# Features

The screen, top to bottom and left to right.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Top bar: brand · site · Live/Paused · UNACK badge · clock (UTC) · theme  │
├──────────────────────────────────────────────────────────────────────────┤
│ Status strip: 6 category tiles │ 5 derived operational states            │
├────────────┬──────────────────────────────────────────┬──────────────────┤
│ Views      │ [Area banner]                [Weather]   │ Alerts           │
│ Filter     │ Schematic          ┌────────────────────┐│                  │
│ rail       │                    │ Detail drawer      ││                  │
│ Simulation │                    │ (when selected)    ││                  │
├────────────┴────────────────────┴────────────────────┴┴──────────────────┤
│ Raw feed (table / JSON) · collapse / normal / expand                     │
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
- **Live / Paused:** freezes the screen so a busy moment can be read
  without it changing. Polling continues underneath and the button counts
  the samples queued; Resume applies them all at once. A dashed outline
  around the schematic shows the screen is paused.
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
- **Click** (or Enter/Space when focused) to open the sensor in the
  [detail drawer](#detail-drawer); click again to close it.
- Markers outside the current filters are dimmed and taken out of the tab
  order, not hidden, so the drawing keeps its context.

**Areas.** The 14 locations (met mast, drilling module, upper deck and crane,
helideck, quarters and control room, perimeter / 500 m zone, flare boom,
process, compression and power, well bay, cellar and utilities, jacket and
splash zone, sea surface, seabed and pipeline) are hit areas on the drawing.

- **Hover** an area, a sensor in it, or its row in the filter rail. This
  outlines the area and shows the **area banner** at the top left of the
  drawing: code, name, a one-line description (for example *"Derrick, drill
  floor and mud pits, where wells are drilled"*), sensor count and any
  alarm, warning or offline counts.
- **Click** an area to pin the banner. A pinned banner adds:
  - **Show only these N sensors:** filters the whole screen to that area.
  - **Add to filter:** appears when other areas are already filtered.
  - **Showing only this area · show all:** appears once the area is the
    only one filtered.
- **Unpin** by clicking the area again, clicking empty space, pressing Esc
  or using ×.
- The rail's **outline** switch shows every area at once.

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

**Weather card.** Floats top right and collapses (–) to a one-line chip
with wind speed, direction and the worst weather status, so it doesn't cover
the drawing; the choice is remembered. Expanded, it shows wind speed and
direction on a compass (the arrow points where the wind blows to), gust, wave height, visibility,
pressure and lightning distance. Rows in warning or alarm show the status
icon.

## Filter rail

**Views.** Named filter sets at the top of the rail. Built-in views come from
the API (`getViews()`):

- All sensors
- Needs attention
- Well bay & drill floor safety
- Helideck & crane ops
- Security watch
- Jacket & subsea integrity
- Discharges & emissions

The view matching the current filters is highlighted. When the filters don't
match any view, the section shows *unsaved* and a **Save current filters as a
view** button. Saved views are marked *mine* and can be deleted. For the demo
they're kept in the browser (`localStorage`); a real service would store them
per user.

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

## Detail drawer

A 440 px panel that slides over the right of the drawing, next to the alerts
column, so alerts stay visible. Below 1100 px it covers the screen from the
right, over a dimmed backdrop.

**Opening and closing**
- Opens from a sensor marker, an alert or a raw-feed row.
- Selecting another sensor, including from the drawer's own list, switches
  it in place.
- **Esc**, × or clicking the marker again closes it.
- Focus moves to the close button when it opens.

**Head**
- Category, id, name, type and location.
- Current value, unit and status pill, with the limits.
- **Acknowledge** for an unacknowledged alert.
- **Show only this sensor in the feed.**

**Sections, in order**
1. **Alert:** priority, state, raised and updated times, the limit crossed,
   and the peak.
2. **Trend:** the last ~180 samples, with warning and alarm lines when
   they're near the data. Hover for a crosshair and value.
3. **What it measures** and **What it tells you**, from the catalog.
4. **Also at *location*:** the other sensors in the same area, worst status
   first, each with its value. Click one to open it. Below the list is a count
   of other open alerts in that area.
5. **Recent samples:** the last eight readings, with times.
6. **Telemetry:** node, link, reporting period, latency, last sample and data
   quality.
7. **Raw reading:** the latest sample exactly as the API returned it
   (expandable).

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
- Clicking an alert opens its sensor in the detail drawer.
- *Only alerts matching filters* limits the list to the current filters.

## Raw feed

Every sample the API returns, newest first.

- **Rate:** the header shows samples per minute and how many rows are shown.
- **Match filters:** on by default, so the feed follows the same filters as
  the drawing. Off shows every sensor.
- **Click a row** (or Enter on a focused row) to open that sensor in the
  detail drawer. Rows for the selected sensor are highlighted. New rows flash
  briefly as they arrive.
- **Clear** hides what's there now while new samples keep arriving;
  **Restore** brings it back.
- **Size:** collapse (header only), normal, or expand (about half the
  screen). The choice is remembered.
- **Table:** time (ms), sensor, type, zone, value, unit, status, data quality,
  node / link, link latency, sequence number. Abnormal rows are tinted. On
  narrow screens the secondary columns are hidden.
- **JSON:** each sample exactly as the API returned it, one per line.
- **Exceptions only:** hides normal samples.
- **Pause / Resume:** freezes just the feed; the rest of the screen stays
  live. (The top bar's Live / Paused freezes everything.)
- When following the selected sensor, a *sensor: ID ×* tag in the header
  turns it off.
- The table shows up to 250 rows, the JSON view up to 80; the client keeps
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
