# Planner 46 — Treetops exact segment distance

Planner 46 derives distance for the exact Planner 44 Treetops segment after Planner 45 qualified pedestrian mode.

## Frozen inputs

- Objective: `sdz-tiger-trail`
- Treetops OSM way: `148910139` v7
- Way timestamp: `2026-02-21T20:28:40Z`
- From node: `1619736626` (index 0)
- To node: `13588159626` (index 6)
- Ordered segment:
  `1619736626 -> 1619736622 -> 1619736623 -> 10303552086 -> 1619736627 -> 1619736634 -> 13588159626`
- Coordinates: version-pinned Planner 43 node authority
- Segment provenance: Planner 44
- Walk mode: Planner 45

## Derivation

Distance is the sum of six Haversine legs following the exact ordered polyline, using Earth radius `6,371,000 m`, then rounded once to three decimal places.

Result:

`48.615 m`

This is a geodesic derivation from OSM node coordinates, not a survey-accuracy claim.

## Scope

Planner 46 promotes only `distanceMeters`.

Still blocked:

- pedestrian direction
- walking duration
- difficulty
- stairs
- accessibility
- stroller suitability
- operational status

No RouteNode or RouteEdge is materialized here.
