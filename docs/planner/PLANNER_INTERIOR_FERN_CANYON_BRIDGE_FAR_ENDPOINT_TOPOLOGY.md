# Planner 64 — Fern Canyon bridge-footway far-end topology

Planner 64 freezes the historical topology already verified during Planner 63's temporary capture.

## Endpoint

The bridge footway ends at node `13588159633`:

- coordinates: `32.7357407, -117.1503614`
- node version: `1`
- timestamp: `2026-02-21T20:08:08Z`
- changeset: `178875075`

## Historical connected ways

At the same frozen timestamp, exactly two ways connect to this node.

Inbound:

- way `1481578623` v1
- `highway=footway`
- `bridge=yes`
- `layer=1`
- `name=Fern Canyon Trail`

Unique onward continuation:

- way `1481578624` v1
- `highway=steps`
- `incline=up`
- `name=Fern Canyon Trail`
- node sequence `13588159634 -> 13588159633`

Planner 64 records source topology only. It does not yet convert `highway=steps` into planner stairs semantics, derive direction/distance/duration, or materialize RouteNode/RouteEdge state.

## Next boundary

Planner 65 should capture the version-pinned coordinate for node `13588159634` and inspect historical connected ways there.

Until then:

- `VERSION_PINNED_FERN_CANYON_NEXT_STEPS_NODE_COORDINATE_NOT_CAPTURED`
- `EXACT_FERN_CANYON_NEXT_STEPS_SEGMENT_PROVENANCE_NOT_COMPLETE`
