# API reference

`window.PlatformAPI` in `js/api.jsx`. Every method returns a Promise that
resolves with plain JSON after a simulated network delay (40–180 ms unless
noted). The REST paths are the ones a real service would expose.

## Endpoints

| Method | REST equivalent | Returns |
|---|---|---|
| `getPlatform()` | `GET /platform` | [Platform](#platform) |
| `getCatalog()` | `GET /catalog` | `{ categories, types }` from `js/catalog.jsx` |
| `getSensors()` | `GET /sensors` | [Sensor](#sensor)`[]` |
| `getLatest()` | `GET /readings/latest` | `{ cursor, readings: { [sensorId]: Reading }, clock }` |
| `getReadings({ after, limit, ...filter })` | `GET /readings?after=<cursor>` | [Readings page](#readings-page) |
| `getHistory(sensorId, { limit })` | `GET /sensors/:id/history` | [Reading](#reading)`[]`, oldest first (default limit 180, max 300 kept) |
| `getAlerts()` | `GET /alerts` | [Alert](#alert)`[]` |
| `acknowledgeAlert(alertId)` | `POST /alerts/:id/ack` | `{ ok: true }` (60–220 ms) |
| `acknowledgeAll()` | `POST /alerts/ack-all` | `{ ok: true }` (60–220 ms) |
| `getViews()` | `GET /views` | Built-in views: `{ id, name, description?, filters, builtIn: true }[]` |
| `evaluate(type, value)` | (shared helper) | `{ status, dir?, limit? }`, synchronous |

### Demo-only

| Method | Returns |
|---|---|
| `getScenarios()` | `{ id, title, category, window: [start, end], story }[]` |
| `sim.setSpeed(n)` | [Clock](#clock) (10–30 ms) |
| `sim.seek(loopSeconds)` | [Clock](#clock) (10–30 ms). Moves the scenario loop; timestamps keep going forward |
| `sim.stats()` | `{ calls, samples }`, synchronous |

## Objects

### Platform

```json
{
  "name": "KESTREL-A",
  "block": "GC-718 (fictional)",
  "region": "Gulf of Mexico",
  "waterDepth": "212 m",
  "type": "Fixed jacket · drilling + production",
  "loopSeconds": 600,
  "zones": { "WHB": { "label": "Well bay", "rect": [312, 356, 140, 54] }, "…": {} }
}
```

### Sensor

```json
{
  "id": "GD-H2S-WHB-02",
  "type": "GD_H2S",
  "category": "safety",
  "zone": "WHB",
  "x": 392, "y": 368,
  "label": "Well bay H₂S (east)",
  "node": "SN-028",
  "link": "mesh"
}
```

- `id` is `TYPE-ZONE-nn` (underscores in the type become hyphens).
- `x`, `y` are positions on the drawing (viewBox 1200 × 760).
- `link` is `mesh`, `satellite` or `acoustic`.

### Reading

```json
{
  "seq": 4182,
  "ts": "2026-10-21T13:08:46.615Z",
  "simT": 213.4,
  "sensorId": "GD-H2S-WHB-02",
  "type": "GD_H2S",
  "category": "safety",
  "zone": "WHB",
  "value": 16.4,
  "unit": "ppm",
  "status": "alarm",
  "quality": "GOOD",
  "node": "SN-028",
  "link": "mesh",
  "latencyMs": 7
}
```

| Field | Notes |
|---|---|
| `seq` | Global, strictly increasing. Use it as the cursor |
| `ts` | Sample time, ISO 8601 UTC |
| `simT` | Simulated seconds since start (demo only) |
| `value` | Number, or `null` when the sensor isn't reporting. Hatch contacts report 0 (closed) or 1 (open) |
| `status` | `normal`, `warning`, `alarm`, `offline` |
| `quality` | `GOOD`, or `NO_DATA` when `value` is null |
| `latencyMs` | Typical latency for the sensor's link, as metadata |

### Readings page

```json
{ "cursor": 4250, "truncated": false, "readings": [ /* Reading, oldest first */ ], "clock": { } }
```

- Returns readings with `seq > after`, oldest first.
- `limit` defaults to 800. If more were waiting, only the newest `limit` are
  returned and `truncated` is `true`.
- Optional filters: `sensorIds`, `categories`, `zones` (arrays). The demo UI
  doesn't use them; it filters on the client so it can change filters without
  refetching.
- The server keeps the last 4,000 readings, so a cursor older than that
  returns what's left.

### Alert

```json
{
  "id": "ALM-00003",
  "sensorId": "GD-H2S-WHB-02",
  "type": "GD_H2S", "category": "safety", "zone": "WHB",
  "priority": "alarm",
  "state": "active",
  "acked": false,
  "raisedAt": "2026-10-21T13:07:12.004Z",
  "updatedAt": "2026-10-21T13:08:46.615Z",
  "clearedAt": null,
  "value": 16.4, "peak": 16.9, "unit": "ppm",
  "dir": "hi", "limit": 10
}
```

| Field | Notes |
|---|---|
| `priority` | `alarm`, `warning`, or `fault` (no data) |
| `state` | `active`, or `rtn` (returned to normal, awaiting acknowledgement) |
| `acked` | Reset to `false` when the alert escalates or re-activates |
| `peak` | Furthest value in the direction of the excursion |
| `dir`, `limit` | Which limit was crossed (`hi` / `lo`) and its value |

There is at most one alert per sensor. See
[Architecture](ARCHITECTURE.md#alert-engine) for the lifecycle.

### Clock

```json
{
  "simT": 213.4,
  "loopT": 273.4,
  "loopSeconds": 600,
  "speed": 1,
  "now": "2026-10-21T13:08:46.615Z",
  "activeScenarios": ["kick", "bearing", "vessel", "node"]
}
```

Returned with `getLatest`, `getReadings` and the `sim.*` calls. A real
service would return only `now`.
