# Overview

## What it is

Offshore Platform Monitor is a browser demo of Sigil Watch applied to an
offshore oil & gas platform. It shows a side view of a fictional fixed-jacket
platform, **KESTREL-A** (block GC-718, Gulf of Mexico, 212 m water depth), with
84 sensors placed where they would be installed: on the met mast, drill floor,
wellheads, process and compression modules, quarters, helideck, jacket legs,
seabed and a wave buoy.

Readings stream in live from a simulated service. Thresholds turn them into
warnings and alarms, alarms become acknowledgeable alerts, and the drawing
itself changes with the data: sea state, storm and lightning, flare size,
separator level, a vessel closing on the safety zone, and outlines around gas
detectors in alarm.

It is a sibling of [`well-monitor`](../../well-monitor) (onshore wells on a
map) and uses the same no-build React stack.

## Who it's for

| Audience | What they get from it |
|---|---|
| Prospects and partners | A concrete picture of what "every sensor on one screen" means for an offshore asset |
| Sales and solutions | A repeatable demo with scripted events that can be jumped to on cue |
| Product and design | A reference for the schematic-first layout, alarm colour discipline and the API shape |
| Engineers | A working front end against a mock API that can be swapped for a real one |

## What it demonstrates

1. **One view across disciplines.** Safety, security, operations, structural
   integrity, environment and weather share one drawing, one alert list and
   one data feed. Problems that cross disciplines are visible together: a
   squall raises jacket strain, suspends helicopter and crane operations and
   changes which way a gas release would drift.
2. **The schematic leads.** Operators find problems by *where* they are. Every
   sensor is a marker on the drawing; abnormal ones carry colour, a value
   callout and, while unacknowledged, a pulse.
3. **Decisions, not just readings.** Five derived states (helideck, crane ops,
   well control, personnel/muster, production) combine several sensors into the
   answer an offshore installation manager actually needs.
4. **Honest data quality.** A sensor that stops reporting shows *NO DATA* and
   raises a comms fault. It never shows a stale value as normal.
5. **The raw data is right there.** Every sample can be inspected as a table
   row or as the JSON the API returned, filtered by the same controls as the
   drawing.
6. **API-first.** The UI only calls async functions shaped like REST endpoints,
   so moving to real data means replacing those functions, not the UI.

## Five-minute demo script

Open `http://localhost:8734/` (see the main [README](../README.md) to run it).
The loop starts at 01:00, just as the first event begins. The sidebar's
**Simulation** section jumps to any scenario.

| When | Do | Point out |
|---|---|---|
| 01:00 | Let it run | H₂S detectors at the well bay climb into warning then alarm. A dashed outline and drift arrow appear, and the alert pulses at the top of the list. |
| ~01:40 | Watch the Personnel tile | Crew move from the quarters to the muster station: "MUSTER 52/54" and a count of who isn't there yet. |
| ~02:30 | Click the pit volume marker on the drill floor | Well control goes to FLOW CHECK. The detail drawer's trend crosses the warning line; "What it tells you" explains why pit gain matters, and *Also at* lists the rest of the drill floor. |
| Any time | Click **Ack all** | Pulses stop; alerts stay listed as ACK until the readings return to normal. |
| 04:00 | Jump to *Mesh node offline* | A jacket strain gauge shows NO DATA, the footer reports the mesh as degraded and re-routed. |
| 05:00 | Jump to *Squall line passing* | The sky darkens, rain and lightning appear, waves build, the wind arrow swings, helideck and crane ops are suspended. |
| 06:10 | Jump to *Unusual Modbus writes* | A cyber alert and denied badge attempts at the control-room door appear together. |
| Any time | Open the raw feed, switch to **JSON**, tick **Exceptions only** | This is what the API delivers, filtered to what's abnormal. |
| Any time | Click the helideck on the drawing, then **Show only these sensors** in the banner | The banner names the area; the filter dims everything else, and the feed and (optionally) the alert list follow. Pick **Helideck & crane ops** under Views for the same thing in one click. |
| Any time | Press **Live** to pause | The screen freezes while data queues; Resume catches up at once. |

Useful URLs: `?t=300` starts at the squall, `?speed=5` runs five times faster,
`?theme=light` for projectors and printouts.

## What it is not

- Not a safety system. A monitoring overlay like this runs alongside the
  certified fire & gas and emergency shutdown systems and never replaces them.
- Not an engineering model. Thresholds, sensor counts and placements are
  plausible illustrations.
- Not connected to anything. There is no backend; the "server" runs in the
  page.
