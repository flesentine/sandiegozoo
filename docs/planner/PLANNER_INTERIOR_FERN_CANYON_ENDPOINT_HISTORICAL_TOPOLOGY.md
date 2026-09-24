# Planner 60 — Fern Canyon endpoint historical topology

Planner 60 resolves the two evidence blockers left by Planner 59 for endpoint node `13588159625`.

## Exact endpoint node

A temporary CI capture selected the latest visible OSM node version at or before the frozen Fern Canyon way-v1 timestamp and then re-fetched the exact node version.

- node: `13588159625`
- version: `1`
- timestamp: `2026-02-21T20:08:08Z`
- changeset: `178875075`
- latitude: `32.7353594`
- longitude: `-117.1501187`

## Historical topology

At the same frozen timestamp, the endpoint has exactly two connected ways, each re-fetched from its exact OSM version.

The inbound qualified segment is:

- way `1481578621` v1
- `highway=footway`
- `name=Fern Canyon Trail`
- node sequence `13588159625 -> 13588159626`

The unique non-inbound linear continuation is:

- way `1481578622` v1
- `highway=steps`
- `bridge=yes`
- `incline=up`
- `layer=1`
- `name=Fern Canyon Trail`
- node sequence `13588159627 -> 13588159628 -> 13588159629 -> 13588159630 -> 13588159631 -> 13588159625`

Planner 60 records those tags as exact source evidence only. It does **not** yet promote them into Planner `stairs`, direction, distance, duration, accessibility, stroller, or RouteEdge semantics.

## Remaining boundary

The next milestone should capture version-pinned coordinates for the five remaining nodes on way `1481578622` and preserve the exact geometry. Until then graph expansion remains blocked on:

- `VERSION_PINNED_FERN_CANYON_STEPS_NODE_COORDINATES_NOT_CAPTURED`
- `EXACT_FERN_CANYON_STEPS_SEGMENT_PROVENANCE_NOT_COMPLETE`

The temporary network capture is removed from the permanent branch after the evidence is frozen.
