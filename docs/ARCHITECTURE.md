# Architecture

## Stack

- **No build step.** `index.html` loads React 18.3.1 and ReactDOM from unpkg
  (with subresource integrity hashes) and Babel standalone 7.29.0, which
  compiles the `text/babel` `.jsx` files in the browser. This matches
  `well-monitor` and keeps the demo editable with nothing but a text editor.
- Babel fetches the `.jsx` files over HTTP, so the folder has to be served
  (`python3 -m http.server 8734`); `file://` won't work.
- Each file is an IIFE that publishes what it exports on `window`, and
  `index.html` loads them in dependency order.
- Fonts from Google Fonts: Space Grotesk (display), Inter (body),
  JetBrains Mono (data).

In-browser Babel is fine for a demo but slow to start and not for production;
see [Roadmap](ROADMAP.md).

## Files

| File | Exports | Role |
|---|---|---|
| `js/catalog.jsx` | `window.Catalog` = `{ CATEGORIES, SENSOR_TYPES, ZONES }` | The taxonomy: 6 categories, 49 sensor types with units, limits, descriptions and simulation parameters; 14 zones with their rectangles on the drawing |
| `js/platform.jsx` | `window.PlatformDef` = `{ PLATFORM, SENSORS, SCENARIOS }` | Platform metadata, the 84 sensor placements, generated ids, node and link assignments, and the nine scenarios |
| `js/api.jsx` | `window.PlatformAPI` | The simulated server and the async API the UI calls |
| `js/glyphs.jsx` | `CategoryIcon`, `StatusIcon`, `ShapePath`, `ShapeLetter`, `window.Fmt` | Category shapes, status icons, value / time / unit formatters |
| `js/schematic.jsx` | `RigSchematic` | The platform drawing, live scene elements, markers, callouts, tooltip |
| `js/panels.jsx` | `FilterRail`, `StatusStrip`, `AlertsPanel` | Filter rail, status strip and derived ops states, alert list |
| `js/feed.jsx` | `RawFeed` | The raw data feed: match-filters, clear, size, row click, new-row flash |
| `js/drawer.jsx` | `SensorDrawer` | The detail drawer and its trend chart |
| `js/views.jsx` | `ViewsSection`, `ViewStore` | Saved views in the rail; per-browser storage of saved views |
| `js/zonebanner.jsx` | `ZoneBanner` | The area banner at the top of the schematic |
| `js/app.jsx` | (mounts `App`) | Initial load, polling and live/paused, filter, selection, view and area state, layout, weather card |
| `styles.css` | | Tokens for both themes, layout, schematic and component styles, breakpoints |
| `scripts/gen-catalog-doc.js` | | Regenerates the tables in `docs/SENSOR_CATALOG.md` from the catalog |

Load order: `catalog` → `platform` → `api` → `glyphs` → `schematic` →
`panels` → `feed` → `drawer` → `views` → `zonebanner` → `app`.

`feed`, `drawer`, `views` and `zonebanner` are identical in this project and
`well-site-monitor`; keep them in sync.

## Data flow

```
 catalog.jsx ─┐
 platform.jsx ┴─► api.jsx  "server"                       app.jsx (React)
                 ┌──────────────────────────┐   Promise   ┌────────────────────────┐
                 │ sim clock (simT, offset) │   + JSON    │ on load:               │
                 │ advance(): due samples   │ ──────────► │  platform, sensors,    │
                 │  → valueAt → evaluate    │  40–180 ms  │  scenarios, latest,    │
                 │  → feed ring (4000)      │             │  alerts, recent feed   │
                 │  → history (300/sensor)  │             │ every 1 s:             │
                 │  → latest                │ ◄────────── │  getReadings({after})  │
                 │  → alert engine          │   calls     │  getAlerts()           │
                 └──────────────────────────┘             └───────────┬────────────┘
                                                                      │ props
                       ┌───────────────┬──────────────┬───────────────┼───────────┐
                       ▼               ▼              ▼               ▼           ▼
                  StatusStrip     FilterRail    RigSchematic    AlertsPanel    RawFeed
                                  + Views       + ZoneBanner    SensorDrawer
```

The UI never reads simulator state directly. It only calls `PlatformAPI`
methods, which return deep copies after a random delay, the way a network
call would.

## The simulator (`js/api.jsx`)

### Clock

- `simT` is monotonic simulated seconds since page load. Each API call runs
  `advance()`, which moves `simT` forward by the wall-clock time elapsed times
  the speed.
- Sample timestamps are `page load time + simT`, so they never go backwards.
- The scenario loop is 600 s. Loop time is `(simT + offset) mod 600`.
  `sim.seek(t)` changes only `offset`, so jumping to a scenario doesn't rewind
  timestamps or the feed.
- At start-up the simulator generates 60 s of history (loop 0–60) so trends
  have data on first paint, and "now" lands at loop 01:00 as the first
  scenario begins.
- If the tab was in the background, it backfills at most 60 s per sensor.

### Samples

- Each sensor type has a reporting period (`sim.period`, 2–10 s). `advance()`
  collects every sensor's due sample times, sorts them by time, and emits them
  in order, like a gateway would.
- A value is `base + noise × amplitude + Σ scenario effects`:
  - **noise** is two slow sine waves plus a per-second pseudo-random term,
    seeded by the sensor's index, so it looks organic and is repeatable.
  - **scenario effects** are `plateau` (smooth rise, hold, smooth fall),
    `ramp` (linear across the window) or `offline` (no value).
  - values are clamped at zero except cathodic protection, pit volume change
    and wind direction (which wraps at 360°), then rounded to the type's
    decimals.
- `evaluate(type, value)` checks the high limits, then the low limits, and
  returns `normal`, `warning`, `alarm`, or `offline` for a missing value.
- Each sample carries link metadata: the sensor's mesh node, the link
  (`mesh` for topsides and jacket, `satellite` for the wave buoy, `acoustic`
  for the seabed) and a plausible latency for that link (mesh 4–14 ms,
  satellite 540–720 ms, acoustic 900–1500 ms). This is metadata only; it
  doesn't delay delivery.

### Storage

| Store | Size | Used by |
|---|---|---|
| `feed` | Ring of the last 4,000 samples | `getReadings` |
| `history[sensorId]` | Last 300 samples per sensor | `getHistory` |
| `latest[sensorId]` | Most recent sample | `getLatest` |
| `alerts` | One per sensor with an open alert | `getAlerts`, acknowledgements |

### Alert engine

On every sample, `updateAlert()` keeps at most one alert per sensor:

```
                    abnormal sample
   (none) ───────────────────────────────► ACTIVE, unacked
                                               │      │
                                         ack   │      │ returns to normal
                                               ▼      ▼
                                        ACTIVE, acked   RTN, unacked
                                               │      │
                        returns to normal      │      │ ack
                                               ▼      ▼
                                             (removed)

   escalation (warning → alarm, fault → warning/alarm) clears the ack
   abnormal again while RTN → ACTIVE, unacked
```

- Priority is `alarm`, `warning`, or `fault` (sensor offline).
- The alert tracks the latest value, the peak in the direction of the
  excursion, the limit crossed, and raised / updated / cleared times.
- Ids are sequential: `ALM-00001`, `ALM-00002`, …

### Responses

`respond(payload, min, max)` counts the call, waits a random 40–180 ms (or
the range given), then resolves with a JSON round-trip copy so callers can't
mutate server state.

## The client (`js/app.jsx`)

- **Initial load:** applies `?t` and `?speed`, then fetches platform,
  sensors, scenarios, latest readings, alerts and the most recent 400 samples
  in parallel.
- **Polling:** every second, `getReadings({ after: cursor })` and
  `getAlerts()` in parallel. New samples update `latest`, are prepended to the
  feed (capped at 1,500), and are appended to the selected sensor's history
  (skipping any sample it already has). The incoming rate is smoothed for the
  feed header.
- **Live / Paused:** while paused, polling continues so the cursor keeps up,
  but each batch is queued instead of applied. Resume applies the queued
  readings, the latest alert list and the clock in one go.
- **Views:** built-in views come from `getViews()`. Saved views live in
  `localStorage` (`opm-views`) for the demo. A view stores its filters as
  plain sorted arrays, so "is this view active?" is a JSON comparison with the
  current filters.
- **Per-viewer preferences:** theme, feed size and whether the weather card
  is open are stored in `localStorage` under the `opm-` prefix. Each read
  is wrapped so the page works without storage.
- **Area banner:** `hoverZone` comes from hovering an area, a marker or a rail
  location; `pinnedZone` from clicking an area. The banner shows the hovered
  area if there is one, otherwise the pinned one, and offers filter buttons
  only when pinned. Esc closes the drawer first, then unpins.
- **Selection** fetches `getHistory(id)` once; polling keeps it current.
- **Filters** are one object: `{ categories: Set, zones: Set, type, status, q }`.
  `isVisible(sensor)` decides dimming on the drawing and alert filtering;
  `matchSample(reading)` filters the feed using the sample's own status.
- **Errors:** a failed load shows the error in place of the app; a failed
  poll shows *API ERROR* in the status bar and the next poll retries.

The schematic's static structure (jacket and topsides) is memoised so only
the live elements and markers re-render each second.

## Connecting a real service

Replace the bodies in the `--- API ---` section of `js/api.jsx` with `fetch`
calls returning the same shapes (see [API reference](API.md)), and delete the
simulator above it. For example:

```js
const BASE = "/api/v1";
const get = path => fetch(BASE + path).then(r => {
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
});

const PlatformAPI = {
  getPlatform: () => get("/platform"),
  getSensors:  () => get("/sensors"),
  getReadings: ({ after = 0, limit = 800 } = {}) => get(`/readings?after=${after}&limit=${limit}`),
  getAlerts:   () => get("/alerts"),
  acknowledgeAlert: id => fetch(`${BASE}/alerts/${id}/ack`, { method: "POST" }).then(r => r.json()),
  // …
};
```

Things that move server-side with real data:

- **Thresholds and the alert engine.** Alerting must not depend on a browser
  being open. The UI already treats `status` on each sample and the alert list
  as authoritative.
- **Cursor semantics.** `after` is a monotonically increasing sequence number.
  A real service needs the same guarantee, plus `truncated: true` when the
  client has fallen too far behind.
- **Push instead of poll.** The one-second poll could become Server-Sent
  Events or a WebSocket carrying the same reading objects; only `app.jsx`'s
  poll loop would change.
- **Sensor positions.** `x`/`y` in `getSensors()` are drawing coordinates
  (viewBox 1200 × 760). A real site needs its own drawing and placement data.
- **Demo controls.** `getScenarios()` and `sim.*` go away, along with the
  Simulation section of the rail.

## Maintaining the docs

After changing `js/catalog.jsx` or sensor placements, regenerate the tables in
the sensor catalog:

```sh
node scripts/gen-catalog-doc.js
```

It evaluates the two data files in Node and rewrites the section between the
`BEGIN GENERATED` / `END GENERATED` markers in `docs/SENSOR_CATALOG.md`.
