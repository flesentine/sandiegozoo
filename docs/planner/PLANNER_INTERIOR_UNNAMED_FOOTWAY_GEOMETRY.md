# Planner 67 — unnamed footway version-pinned geometry

Planner 67 captures exact geometry for the unnamed footway selected by Planner 66.

## Source way

- OSM way: `1481578625`
- version: `1`
- timestamp: `2026-02-21T20:08:08Z`
- changeset: `178875075`
- `highway=footway`
- no `name` tag
- node sequence: `13588159634 -> 1619736694`

The missing source name remains explicit; Planner 67 does not inherit `Fern Canyon Trail` from the preceding segment.

## Version-pinned nodes

- `13588159634` v1: `32.7357982, -117.1504030`
- `1619736694` v2: `32.7358299, -117.1504190`

Both selected versions are valid at the way-v1 timestamp and were re-fetched from exact OSM node-version endpoints.

## Far-end discovery

The temporary capture found three historical ways at node `1619736694`, so this is no longer a unique-continuation junction. Planner 68 must freeze that three-way topology before any branch selection.

Planner 67 therefore remains geometry-only and does not materialize routing semantics.
