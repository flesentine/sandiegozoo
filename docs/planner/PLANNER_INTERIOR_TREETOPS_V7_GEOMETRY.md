# Planner 43 — Treetops Way v7 geometry capture

Planner 43 clears Planner 42's exact-node-sequence evidence blocker without inventing a route edge or a next junction.

## Frozen source boundary

- OpenStreetMap way: `148910139`
- Name: `Treetops Way`
- Exact way version: `7`
- Exact way timestamp: `2026-02-21T20:28:40Z`
- Exact way changeset: `178875711`
- Source tags: `highway=footway`, `name=Treetops Way`, `surface=concrete`
- Objective-selected anchor: node `1619736626`
- Ordered way-node count: `34`

The ordered node IDs come from the version-pinned OSM way endpoint. For each referenced node, Planner 43 freezes the latest visible historical node version with coordinates whose timestamp is at or before the exact way-version timestamp. Every node therefore carries its own object URL, exact version URL, version, timestamp, changeset, latitude, and longitude.

## What this clears

Planner 42 blocked expansion because the exact Treetops Way v7 ordered node sequence had not been captured. Planner 43 captures that sequence and version-pinned coordinate provenance, so `EXACT_TREETOPS_WAY_NODE_SEQUENCE_NOT_SOURCED` is no longer a blocker.

## What remains blocked

Planner 43 does **not** infer a junction from bends in the polyline. A useful next junction requires connected-way topology evidence, not geometry shape alone. The remaining blockers are:

- `NEXT_JUNCTION_NOT_SOURCED`
- `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`

No `RouteNode`, `RouteEdge`, mode, distance, duration, direction, difficulty, stairs, accessibility, stroller suitability, or operational status is materialized here.

## Capture method

The exact historical evidence was obtained in a one-off CI capture from the versioned OSM API. The temporary network capture script is not part of the permanent Planner 43 runtime or test path; only the frozen source facts and deterministic integrity tests remain in the repository.

## Next milestone

Source historical connected-way topology for the Treetops v7 nodes, identify the first useful junction from the anchor, and freeze the exact segment provenance before any downstream semantic qualification.
