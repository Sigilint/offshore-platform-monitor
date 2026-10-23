# UI design

## Principles

1. **The schematic leads.** It takes the centre of the screen. Everything else
   (strip, rail, alerts, feed) supports finding and explaining what's on it.
2. **Colour means abnormal.** Following ISA-101 high-performance HMI practice,
   amber and red appear only for warnings and alarms. Normal equipment is
   greyscale. One blue accent marks selection and interactive state.
3. **Never colour alone.** Every status has an icon shape and a word as well
   as a colour, and every category has a shape and a letter.
4. **Show the data, not a guess.** Gas detections are outlined around the
   detectors that are alarming, with a wind-drift arrow; the demo doesn't
   draw a modelled plume. A silent sensor shows NO DATA rather than its last
   value.
5. **Live but calm.** Values update in place every second. Nothing reorders
   under the pointer except the alert list, which re-sorts by priority.
6. **Context stays visible.** Filters dim what's out of scope rather than
   removing it from the drawing.

## Layout

A full-height shell: top bar, status strip, a three-column main area (filter
rail · schematic · detail and alerts), the raw feed docked below, and a status
bar.

| Width | Layout |
|---|---|
| Above 1440 px | Rail 248 px · schematic · side 330 px; strip shows categories and ops side by side |
| 1101–1440 px | Rail 220 px · schematic · side 300 px; categories and ops on two rows |
| 641–1100 px | Single column, page scrolls: schematic, then detail and alerts, then filters, then feed. Strip tiles three across; weather card scaled down |
| Up to 640 px | Strip tiles two across; secondary feed columns, weather card and stage note hidden; top bar wraps |

The schematic scales to fit (`preserveAspectRatio="xMidYMid meet"`). The feed
can be collapsed to give the schematic the height.

## Encoding

Two independent encodings: **category** by shape and letter, **status** by
colour, icon and word.

### Category

| Category | Shape | Letter |
|---|---|---|
| Safety | Circle | S |
| Security | Diamond | X |
| Operations | Square | O |
| Integrity | Triangle | I |
| Environment | Hexagon | E |
| Weather & Sea | Inverted triangle | W |

Categories are not colour-coded. A five- or six-hue categorical palette fails
colour-vision-deficiency separation checks on all pairs, would compete with
the alarm colours, and would break the "colour means abnormal" rule.

### Status

| Status | Colour | Icon | Marker |
|---|---|---|---|
| Normal | none (greyscale) | circle | Default fill |
| Warning | Amber `#fab219` | triangle | Amber fill, value callout |
| Alarm | Red `#d03b3b` | diamond | Red fill, value callout |
| Offline / fault | none | dashed square | Dashed outline, NO DATA callout |
| Unacknowledged | (status colour) | | Pulsing ring |
| Selected | Accent blue | | Ring |

The same icons appear in the strip, rail, alerts, detail, feed and weather
card.

## Tokens

All colours are CSS custom properties on `:root[data-theme="light"|"dark"]`
in `styles.css`. Dark is the default.

| Group | Tokens |
|---|---|
| Surfaces | `--bg`, `--panel`, `--panel-2`, `--stage` |
| Rules | `--rule`, `--rule-2` |
| Text | `--ink`, `--ink-2`, `--ink-3` |
| Accent | `--accent`, `--accent-soft` |
| Warning | `--warn`, `--warn-edge`, `--warn-soft`, `--warn-text` |
| Alarm | `--alarm`, `--alarm-edge`, `--alarm-soft`, `--alarm-text` |
| Scene | `--sky`, `--storm`, `--rain`, `--sea`, `--sea-deep`, `--sea-surface`, `--wave-line`, `--seabed`, `--steel`, `--steel-2`, `--deck`, `--equip`, `--window`, `--flame*`, `--liquid` |
| Markers | `--mk-fill`, `--mk-stroke`, `--mk-letter` |
| Type | `--display` Space Grotesk, `--sans` Inter, `--mono` JetBrains Mono |

Warning and alarm fills are the same in both themes; their text and edge
variants change so labels keep contrast on each background.

**Type.** Body 13 px Inter. Every value, id, time and count is in JetBrains
Mono. Section labels are small uppercase mono.

## Interaction and accessibility

- Sensor markers are focusable buttons with a label giving name, id and
  status; Enter or Space selects. Dimmed markers leave the tab order.
- Status filter is a radio group; filters, toggles and buttons are native
  controls with labels.
- The theme toggle and feed collapse have accessible names; the feed collapse
  exposes `aria-expanded`.
- `prefers-reduced-motion` turns off pulses, waves, rain, the radar sweep and
  transitions.
- Hover-only information (marker tooltip, trend crosshair) is also available
  by selecting the sensor.

Not yet done: a keyboard path through zones on the drawing, a live region
announcing new alarms, and checks with a screen reader. See
[Roadmap](ROADMAP.md).
