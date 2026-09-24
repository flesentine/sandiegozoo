# Planner 61 — Fern Canyon steps version-pinned geometry

Planner 61 captures exact geometry for the continuation selected by Planner 60.

## Source way

- OSM way: `1481578622`
- version: `1`
- timestamp: `2026-02-21T20:08:08Z`
- changeset: `178875075`
- `highway=steps`
- `bridge=yes`
- `incline=up`
- `layer=1`
- `name=Fern Canyon Trail`

The exact node sequence is:

`13588159627 -> 13588159628 -> 13588159629 -> 13588159630 -> 13588159631 -> 13588159625`

Planner routing approaches this source way from node `13588159625`, so the prospective traversal is from `13588159625` toward `13588159627`. That traversal orientation is not a `oneWay` claim.

## Version-pinned coordinates

All six nodes were selected as the latest visible versions at or before the way-v1 timestamp and re-fetched from their exact OSM node-version endpoints.

- `13588159627`: `32.7357192, -117.1500664`
- `13588159628`: `32.7356741, -117.1500395`
- `13588159629`: `32.7355805, -117.1501039`
- `13588159630`: `32.7354981, -117.1500261`
- `13588159631`: `32.7353955, -117.1500281`
- `13588159625`: `32.7353594, -117.1501187`

Every node is version 1, timestamped `2026-02-21T20:08:08Z`, changeset `178875075`.

## Boundary

Planner 61 freezes source geometry only. It does not yet promote `highway=steps` into the planner `stairs` field, derive distance or duration, infer pedestrian direction, or materialize a RouteNode/RouteEdge.

The temporary CI capture also verified historical topology at the far endpoint `13588159627`, but that topology is intentionally deferred to Planner 62.

Remaining blockers:

- `FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN`
- `EXACT_FERN_CANYON_STEPS_SEGMENT_SEMANTICS_NOT_QUALIFIED`
