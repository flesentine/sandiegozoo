# Planner 25 — Interior Graph Expansion Authority

## Purpose

Planner 25 establishes the first conservative authority boundary for expanding the production route graph beyond the qualified Main Entrance → interior → Front Street ingress chain.

It does **not** materialize a new `RouteEdge`.

The goal is to identify the exact source object that continues from the existing Front Street connection and bind it to official Zoo corridor context without turning corridor-level map summaries into false exact-edge facts.

## Qualified expansion boundary

Planner 12 already established the ingress topology ending at:

- OpenStreetMap Front Street way: `1481425058`
- OpenStreetMap Front Street connection node: `7053320515`
- ingress topology: `sdz-guest-entrance-main-ingress-topology`

Planner 25 reuses that existing authority rather than creating a second independent topology claim. Source URLs are recovered by exact OSM object identity rather than positional array indexing.

The expansion seed is:

`sdz-interior-expansion-front-street`

Its source state is intentionally:

`way-identified-geometry-not-sourced`

## Official corridor context

The official San Diego Zoo Resource Map for Guests with Disabilities V01.05.26 publishes Front Street as:

- 20-minute walking corridor
- mild terrain
- access to Wildlife Explorers Basecamp
- access to Lost Forest
- access to Outback
- access to Urban Jungle
- access to Africa Rocks

Planner 25 preserves those facts as **corridor-level authority only** through explicitly namespaced fields such as `officialCorridorTerrain` and `officialCorridorAccessLabels`.

The published 20 minutes is not assigned to `RouteEdge.durationMinutes`, because the official map describes Front Street as a named corridor rather than the exact segment beginning at OSM node `7053320515`.

## Why route materialization remains blocked

Before an interior Front Street `RouteEdge` can exist, later planner phases must source and qualify every independent routing semantic required by the contract:

1. the relevant Front Street way geometry from the existing connection node onward;
2. an exact expansion endpoint node;
3. exact segment travel mode;
4. exact segment distance;
5. exact segment walking duration policy/derivation;
6. exact segment difficulty;
7. exact segment stairs semantics;
8. exact segment accessibility semantics;
9. exact segment stroller semantics;
10. exact pedestrian direction / `oneWay` semantics;
11. exact segment operational status semantics;
12. complete exact-segment provenance.

Until then, Planner 25 reports:

- `FRONT_STREET_WAY_GEOMETRY_NOT_CAPTURED`
- `EXPANSION_ENDPOINT_NODE_NOT_SOURCED`
- `EXACT_SEGMENT_MODE_NOT_SOURCED`
- `EXACT_SEGMENT_DISTANCE_NOT_SOURCED`
- `EXACT_SEGMENT_DURATION_NOT_SOURCED`
- `EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED`
- `EXACT_SEGMENT_STAIRS_NOT_SOURCED`
- `EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED`
- `EXACT_SEGMENT_STROLLER_NOT_SOURCED`
- `EXACT_SEGMENT_PEDESTRIAN_DIRECTION_NOT_SOURCED`
- `EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED`
- `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`

## Safety boundary

`InteriorGraphExpansionSeed` deliberately forbids all `RouteEdge` materialization fields. Its runtime validator also rejects unknown seed fields, preventing retired bare corridor fields or aliased exact-segment facts from being smuggled through casts or stale JSON.

Integrity tests specifically reject attempts to copy the official 20-minute corridor summary into `durationMinutes`, reject retired `terrain` / `accessLabels` fields, reject aliased exact-segment fields, and fail closed on malformed runtime seed entries.

This preserves the same evidence-first policy used by the ingress work: uncertainty remains explicit instead of being converted into planner precision.

## Next boundary

If Planner 25 is qualified, Planner 26 should capture and validate the exact OSM Front Street geometry from node `7053320515` to the first useful connected interior junction/endpoint. Only after that geometry is source-backed should the remaining independent RouteEdge semantics be qualified for actual production materialization.
