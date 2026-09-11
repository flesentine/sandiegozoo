# Planner 26 — Front Street Geometry Authority

Planner 26 advances the graph-expansion boundary from the Planner 25 Front Street seed without materializing a production `RouteEdge`.

## Qualified starting boundary

Planner 25 ends at:

- OpenStreetMap Front Street way `1481425058`
- existing ingress connection node `7053320515`
- Planner 25 seed `sdz-interior-expansion-front-street`

Planner 26 preserves the already-qualified connection coordinate from Planner 13:

- node `7053320515`
- `32.7351404, -117.1496117`

## Exact OSM snapshot

The live OSM source probe captured way `1481425058` as:

- version `1`
- timestamp `2026-02-21T14:47:49Z`
- 17 source nodes
- connection node `7053320515` at source index `4`
- `highway=pedestrian`
- `name=Front Street`
- `foot=customers`
- `fee=yes`
- `surface=asphalt`

These tags are preserved only as source context. They do not independently materialize Planner mode, accessibility, direction, duration, or operational status.

## First useful connected junction

The connection node has an adjacent Front Street node on each side with a distinct pedestrian branch:

1. previous adjacent node `1619736626`
   - distinct connector way `148910139`
   - `highway=footway`
   - `name=Treetops Way`
   - `surface=concrete`
   - way version `7`
   - way timestamp `2026-02-21T20:28:40Z`
2. next adjacent node `6239154982`
   - distinct connector way `666404421`
   - `highway=footway`
   - no published OSM name
   - way version `2`
   - way timestamp `2023-01-04T00:10:45Z`

Planner 26 therefore uses the explicit selection rule:

`nearest-adjacent-node-with-distinct-named-pedestrian-connector`

That selects node `1619736626`, where Front Street connects to named **Treetops Way**.

The exact Front Street source-way slice is:

`1619736626 → 7053320515`

This order preserves OSM source-way order. It does **not** assert allowed pedestrian travel direction. The expansion boundary is the same two-node geometry considered from the already-qualified connection node toward the selected endpoint.

## Authority boundary

The new authority is `geometry-only`.

It intentionally does **not** contain:

- Planner `fromNodeId` / `toNodeId`
- mode
- distance
- duration
- difficulty
- stairs
- accessibility
- stroller suitability
- pedestrian `oneWay`
- operational status
- RouteEdge provenance

The runtime validator is fail-closed:

- exact top-level and nested object schemas
- ordinary arrays only
- no hidden, symbol, inherited, or unknown aliases
- exact source-way version/timestamp/tag binding
- exact endpoint and adjacent-junction evidence
- exact continuity with the Planner 25 seed
- exact connection-coordinate continuity with Planner 13 ingress geometry

## Remaining blockers

Planner 26 clears only the two Planner 25 blockers it actually sources:

- `FRONT_STREET_WAY_GEOMETRY_NOT_CAPTURED`
- `EXPANSION_ENDPOINT_NODE_NOT_SOURCED`

The graph remains blocked on:

1. exact segment mode
2. exact segment distance
3. exact duration policy/derivation
4. exact difficulty
5. exact stairs semantics
6. exact accessibility
7. exact stroller semantics
8. exact pedestrian direction / `oneWay`
9. exact operational status
10. complete exact-segment provenance

## Next boundary

Planner 27 should derive and qualify the exact geometric distance for the two-node Front Street slice without using the official 20-minute corridor summary as a segment weight. RouteEdge materialization remains out of scope until every independent semantic blocker is qualified.
