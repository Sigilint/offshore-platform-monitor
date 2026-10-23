# Roadmap and open questions

## Known limitations

- **Phone widths not verified.** Layouts were checked down to 500 px in
  headless Chrome; true phone widths (390 px) haven't been seen.
- **Checked in Chrome only.** Safari and Firefox haven't been tried.
- **No automated tests.** The alert behaviour for each scenario was checked by
  running the simulator in Node; there is no test suite.
- **In-browser Babel.** Start-up compiles every `.jsx` file in the page. Fine
  for a demo, too slow and too permissive for production.
- **Feed rows aren't clickable.** Selecting a sensor works from the drawing
  and the alert list only.
- **No alert history.** An alert is removed once it is acknowledged and back
  to normal. There is no event log, shelving, suppression or first-out
  indication.
- **Rules live in the UI.** The derived ops states (helideck, crane, well
  control, muster) are computed in `deriveOps()` in `js/panels.jsx`, with a
  fixed POB of 54. In a real system they belong on the server, configured
  per site.
- **One platform, one drawing.** Sensor positions are hand-placed coordinates
  on a hand-drawn schematic.

## Next steps

Grouped roughly by effort.

**Small**
- Click a feed row to select its sensor.
- Feed header: events per minute, a *Match filters* switch (off shows
  everything), Clear, and a brief highlight on new rows.
- A Live / Paused control in the top bar, and a *system* theme option.
- An `aria-live` region announcing new alarms.

**Medium**
- **Detail drawer.** Move sensor detail into a drawer from the right, opened
  from the drawing, an alert or a feed row. Leaves the side column for alerts
  and gives room for related alerts, a longer trend, and the raw JSON for the
  sensor.
- **Alert log.** Keep cleared alerts with raise, ack and clear times; add
  shelving with a reason and expiry, per ISA-18.2.
- **Saved views.** Named filter sets such as "Well bay safety" or "Weather
  ops" in the rail.
- **Replay.** Scrub back through the last hour and watch the drawing as it was.

**Large**
- A build step (Vite or similar) and a real backend with the API in
  [API reference](API.md), pushing readings over Server-Sent Events or a
  WebSocket.
- Server-side alerting and derived states, configured per site.
- A plan-view (top-down) drawing per deck alongside the elevation.
- Multiple platforms, with a field overview that drills into each.

## Alignment with the release dashboard

The release dashboard prototype
(`releasedashboard/releasedashboard-prototype-c1`) uses the same shell:
header, left sidebar, main view, docked event stream and summary strip. To
make the two feel like one product family, adopt its stream conventions,
detail drawer, Live toggle, saved views and system theme default (the items
above). Keep the colour rules different on purpose: the release dashboard
colours event types, whereas a control-room screen reserves colour for
abnormal states.

## Open questions for a real deployment

- **Data sources.** Which systems feed it: the distributed control system
  historian, fire & gas panels, the security system, a met-ocean provider?
  Over which protocols (OPC UA, Modbus, MQTT)?
- **Authority.** Which alarms are mirrored from certified systems, and which
  (if any) does Sigil Watch raise itself? Who owns acknowledgement: does
  acknowledging here acknowledge in the source system?
- **Connectivity.** Offshore links are slow and sometimes down. What should
  the screen show onshore when the link drops, and how much does the platform
  buffer?
- **Users.** Control-room operators offshore, the onshore support centre, or
  both? Each needs a different density and different actions.
- **Drawings.** Can site drawings (or a 3D model) be reused, or does every
  installation need a new schematic?
- **Retention.** How long are readings and alert history kept, and at what
  resolution?
