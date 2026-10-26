# offshore-platform-monitor

A Sigil Watch demo for an **offshore oil & gas platform**: a live side-elevation
schematic of a fictional fixed-jacket platform (KESTREL-A, Gulf of Mexico) with
84 sensors across six categories, driven entirely by simulated data served
through an async, API-shaped layer. Sibling of [`well-monitor`](../well-monitor)
(same no-build React stack).

**Everything here is simulated.** The platform, sensor placements, readings and
thresholds are fictional demo values, not engineering or safety limits.

## Documentation

| Document | What it covers |
|---|---|
| [Overview](docs/OVERVIEW.md) | What it is, who it's for, and a five-minute demo script |
| [Features](docs/FEATURES.md) | Every part of the screen and how it behaves |
| [Architecture](docs/ARCHITECTURE.md) | Files, data flow, simulator, alert engine, connecting a real service |
| [API reference](docs/API.md) | `PlatformAPI` calls and object shapes |
| [UI design](docs/UI_DESIGN.md) | Layout, shape and colour encoding, tokens, accessibility |
| [Scenarios](docs/SCENARIOS.md) | The nine scripted events, sensor by sensor |
| [Sensor catalog](docs/SENSOR_CATALOG.md) | Six categories, 49 sensor types and what each tells you |
| [Roadmap](docs/ROADMAP.md) | Known limitations, next steps, open questions |

## Run it

Babel-in-the-browser loads the `.jsx` files over HTTP, so serve the folder
(opening `index.html` from `file://` won't work):

```sh
python3 -m http.server 8734
# → http://localhost:8734/
```

URL parameters for demos:

| Param | Effect | Example |
|---|---|---|
| `t` | Jump the 10-minute scenario loop to second *t* | `?t=300` (squall line arrives) |
| `speed` | Simulation speed multiplier | `?speed=5` |
| `theme` | `dark` (default, control-room) or `light` | `?theme=light` |

## What's on screen

- **Status strip** — one tile per sensor category (count, warnings, alarms;
  click to filter) plus derived operational states: helideck, crane ops,
  well control, personnel / muster, production.
- **Schematic** (the main view) — sensors sit where they'd be installed. Shape
  + letter = category; color appears **only** for warning (amber) and alarm
  (red), following ISA-101 alarm-color practice. Unacknowledged alerts pulse.
  The scene reacts to the readings: wave height, storm sky and rain, lightning,
  flare size, separator level, windsock, the radar target closing on the 500 m
  zone, and dashed outlines around gas detectors in alarm with a wind-drift
  arrow. Hover an area to see what it is in the **area banner**; click to pin
  it, with a button to filter to just that area's sensors. The weather card
  collapses to a one-line chip.
- **Top bar** — site, **Live / Paused** (freeze the screen while data
  queues), unacknowledged count, clock, theme.
- **Views** — built-in and saved filter sets at the top of the rail.
- **Filter rail** — search, status (all / warn+ / alarm / offline), category,
  sensor type, location; plus demo simulation controls (speed, jump to a
  scenario).
- **Alerts** — active / acknowledged / returned-to-normal, priority-sorted,
  with acknowledge and ack-all. Optionally restricted to the current filters.
- **Detail drawer** — opens from a marker, an alert or a feed row: value,
  limits, acknowledge, the alert, trend, what it measures and *what it tells
  you*, other sensors in the same area, recent samples, telemetry, and the raw
  reading.
- **Raw feed** — every sample as it arrives (table or raw JSON): samples/min,
  match filters, exceptions-only, pause, clear, collapse / expand, click a row
  to open the sensor.

## Scenarios (10-minute loop)

| t (s) | Scenario | Category |
|---|---|---|
| 0–600 | Compressor B bearing degradation (slow vibration + temp trend) | Operations |
| 60–210 | Sour gas (H₂S) release at the well bay → crew musters | Safety |
| 130–270 | Pit gain while drilling — possible kick | Operations |
| 220–430 | Unidentified vessel (no AIS) approaching the 500 m zone | Security |
| 240–330 | Mesh node offline — jacket strain gauge reports a comms fault | Integrity |
| 300–540 | Squall line: gusts, lightning, visibility, seas → heli/crane suspended | Weather & Sea |
| 370–450 | Unusual Modbus writes on the OT network + denied badge attempts | Security |
| 440–580 | Produced-water oil-in-water excursion + flaring | Environment |
| 470–525 | Drone near the helideck | Security |

Defined in `js/platform.jsx` (`SCENARIOS`) as effects on specific sensors.

## Code layout

| File | Role |
|---|---|
| `js/catalog.jsx` | Categories, 49 sensor types (unit, limits, what it measures / tells you), zones |
| `js/platform.jsx` | Platform metadata, sensor placements on the schematic, scenarios |
| `js/api.jsx` | Simulated backend (clock, sample generation, alert engine) + the async `PlatformAPI` |
| `js/glyphs.jsx` | Category shapes, status icons, formatters |
| `js/schematic.jsx` | The platform drawing and live overlays |
| `js/panels.jsx` | Filter rail, status strip, alerts |
| `js/feed.jsx` | Raw data feed |
| `js/drawer.jsx` | Sensor detail drawer + trend |
| `js/views.jsx` | Saved views |
| `js/zonebanner.jsx` | Area banner on the schematic |
| `js/app.jsx` | Polling loop, live / paused, filter, view and selection state, layout |
| `docs/SENSOR_CATALOG.md` | Sensor taxonomy write-up (tables generated by `scripts/gen-catalog-doc.js`) |

### The API layer

The UI only talks to `window.PlatformAPI`; every call returns a Promise that
resolves with JSON after 40–180 ms of simulated network latency:

```
getPlatform()            GET  /platform
getCatalog()             GET  /catalog
getSensors()             GET  /sensors
getLatest()              GET  /readings/latest
getReadings({ after })   GET  /readings?after=<cursor>   (incremental feed)
getHistory(id)           GET  /sensors/:id/history
getAlerts()              GET  /alerts
acknowledgeAlert(id)     POST /alerts/:id/ack
acknowledgeAll()         POST /alerts/ack-all
getViews()               GET  /views                     (built-in views)
getScenarios(), sim.*    demo-only controls
```

The app polls `getReadings` + `getAlerts` once a second. Pointing it at a real
service means replacing those function bodies with `fetch()` calls.

A reading looks like:

```json
{ "seq": 4182, "ts": "2026-10-21T13:08:46.615Z", "sensorId": "GD-H2S-WHB-02",
  "type": "GD_H2S", "category": "safety", "zone": "WHB", "value": 16.4,
  "unit": "ppm", "status": "alarm", "quality": "GOOD",
  "node": "SN-028", "link": "mesh", "latencyMs": 7 }
```

After editing `js/catalog.jsx` or sensor placements, regenerate the doc tables:

```sh
node scripts/gen-catalog-doc.js
```

## Deployment

Live at **https://platform.sigilint.com**, also served at `https://sigilint-offshore-platform-monitor.netlify.app`. It is the Netlify site `sigilint-offshore-platform-monitor`, which deploys automatically on every push to `main` of `Sigilint/offshore-platform-monitor`. Build settings are in `netlify.toml`: no build step, and the repo root is published. See `DEPLOYMENT.md` in `Sigilint/sigilint-web` for how all the Sigilint sites are hosted.
