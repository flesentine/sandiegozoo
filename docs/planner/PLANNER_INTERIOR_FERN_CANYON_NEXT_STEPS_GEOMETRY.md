# Planner 65 — Fern Canyon next steps version-pinned geometry

Planner 65 captures exact geometry for the steps continuation selected by Planner 64.

## Source way

- OSM way: `1481578624`
- version: `1`
- timestamp: `2026-02-21T20:08:08Z`
- changeset: `178875075`
- `highway=steps`
- `incline=up`
- `name=Fern Canyon Trail`
- source node order: `13588159634 -> 13588159633`

Routing reaches this way at source index 1, node `13588159633`, so the prospective continuation traverses the source geometry in reverse toward `13588159634`. This is not a `oneWay` claim.

## Version-pinned coordinates

- `13588159634`: `32.7357982, -117.1504030`
- `13588159633`: `32.7357407, -117.1503614`

Both are node version 1 from changeset `178875075` at the frozen timestamp.

## Boundary

Planner 65 captures geometry only and does not promote source tags into planner stairs/direction/accessibility/stroller/distance/duration semantics.

The same temporary capture verified the historical topology at node `13588159634`; Planner 66 freezes that separately.

Current blockers:

- `FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN`
- `EXACT_FERN_CANYON_NEXT_STEPS_SEGMENT_SEMANTICS_NOT_QUALIFIED`
