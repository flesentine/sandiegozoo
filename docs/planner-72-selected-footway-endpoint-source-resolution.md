# Planner 72 — selected-footway endpoint historical source resolution

Planner 71 established that node `48920902` must not be promoted without a version-pinned historical record.

Planner 72 freezes the source-resolution policy for that record.

## Source order

1. Authoritative OSM node history API:
   `https://api.openstreetmap.org/api/0.6/node/48920902/history`
2. Official OSM object-history page:
   `https://www.openstreetmap.org/node/48920902/history`
3. OSM Deep History viewer:
   `https://osmlab.github.io/osm-deep-history/#/node/48920902`

Only the authoritative OSM history record is sufficient for final promotion. Viewer output may help discover the correct version, but it must be confirmed against the authoritative record.

## Acceptance rule

Capture the exact node version that existed at or immediately before
`2026-02-21T20:08:08Z`, including:

- version
- timestamp
- changeset
- exact version URL
- latitude
- longitude

Current coordinates, rendered viewer coordinates, and search snippets are explicitly insufficient on their own.

The environment still cannot retrieve the authoritative history record, so Planner 72 remains fail-closed and does not invent endpoint geometry.
