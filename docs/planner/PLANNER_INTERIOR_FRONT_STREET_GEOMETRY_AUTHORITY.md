# Planner 26 — Front Street Geometry Authority

Planner 26 advances the graph-expansion boundary from the Planner 25 Front Street seed without selecting a route endpoint and without materializing a production `RouteEdge`.

## Qualified starting boundary

Planner 25 ends at:

- OpenStreetMap Front Street way `1481425058`
- existing ingress connection node `7053320515`
- Planner 25 seed `sdz-interior-expansion-front-street`

Planner 26 preserves the already-qualified connection coordinate from Planner 13:

- node `7053320515`
- `32.7351404, -117.1496117`

## Exact OSM way snapshot

The source probe captured way `1481425058` as:

- version `1`
- timestamp `2026-02-21T14:47:49Z`
- 17 source nodes
- connection node `7053320515` at source index `4`
- `highway=pedestrian`
- `name=Front Street`
- `foot=customers`
- `fee=yes`
- `surface=asphalt`

The authority retains both the ordinary OSM object URL and the exact version API URL.

These tags are source context only. They do not independently materialize Planner mode, accessibility, direction, duration, or operational status.

## Versioned node geometry provenance

OSM ways reference node IDs, but moving a node does not require a new containing-way version. Planner 26 therefore pins the exact node versions used for every coordinate in the local geometry boundary:

- connection node `7053320515`
  - version `1`
  - timestamp `2019-12-13T00:23:10Z`
  - changeset `78341336`
  - `32.7351404, -117.1496117`
- previous adjacent node `1619736626`
  - version `2`
  - timestamp `2013-12-23T19:47:46Z`
  - changeset `19606502`
  - `32.735201, -117.1496375`
- next adjacent node `6239154982`
  - version `1`
  - timestamp `2019-01-27T06:49:41Z`
  - changeset `66670306`
  - `32.7349978, -117.1495509`

Each node stores an exact version API URL in addition to its ordinary OSM object URL, so later geometry derivation can identify the exact coordinate snapshot rather than whatever the live node contains at a future date.

## Two adjacent junction candidates

The exact local source-way neighborhood, preserving OSM source order, is:

`1619736626 → 7053320515 → 6239154982`

Both immediately adjacent Front Street nodes have distinct pedestrian branches:

1. previous adjacent node `1619736626`
   - distinct connector way `148910139`
   - connector version `7`
   - connector timestamp `2026-02-21T20:28:40Z`
   - `highway=footway`
   - `name=Treetops Way`
   - `surface=concrete`
2. next adjacent node `6239154982`
   - distinct connector way `666404421`
   - connector version `2`
   - connector timestamp `2023-01-04T00:10:45Z`
   - `highway=footway`
   - no OSM name

Planner 26 intentionally does **not** choose between them. A connector having a name does not establish that it is the correct planner endpoint, and an unnamed footway is not thereby unusable. The endpoint remains unresolved until a later Planner phase has an explicit routing objective or other source-backed selection authority.

Source-way order also does **not** assert allowed pedestrian travel direction.

## Authority boundary

The new authority is `geometry-candidates-only`.

It intentionally does **not** contain:

- a selected expansion endpoint
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
- RouteNode materialization

The runtime validator is fail-closed:

- the outer authority collection itself must be an exact ordinary one-element array
- exact top-level and nested object schemas
- ordinary nested arrays only
- no hidden, symbol, inherited, or unknown aliases
- exact source-way version/timestamp/tag binding
- exact versioned node provenance for all three local geometry nodes
- exact two-sided source-way neighborhood
- both adjacent junction candidates remain present
- exact continuity with the Planner 25 seed
- exact connection-coordinate continuity with Planner 13 ingress geometry

## Remaining blockers

Planner 26 clears only the blocker it actually sources:

- `FRONT_STREET_WAY_GEOMETRY_NOT_CAPTURED`

The graph remains blocked on:

1. exact expansion endpoint node
2. exact segment mode
3. exact segment distance
4. exact duration policy/derivation
5. exact difficulty
6. exact stairs semantics
7. exact accessibility
8. exact stroller semantics
9. exact pedestrian direction / `oneWay`
10. exact operational status
11. complete exact-segment provenance

## Next boundary

Planner 27 should source the routing objective or other explicit authority needed to choose between the two adjacent Front Street junction candidates. Only after the endpoint is qualified should a later phase derive exact segment distance. The official 20-minute Front Street corridor summary remains corridor-level context and must never be promoted into an exact segment weight.
