# Planner 13 — Geometry-Derived Ingress Distance Authority

**Status:** Main-entrance ingress distance derivation available; production RouteEdges still blocked

Planner 13 builds on Planner 12 without weakening its trust boundary.

Planner 12 established:

- explicit guest entrance node **7053320514**
- customer turnstile node **7053320517**
- interior connection node **7053320516**
- interior pedestrian continuation through node **13587192693**
- Front Street connection node **7053320515**
- pedestrian ways **755054695** and **755054694**

Planner 13 derives only one additional fact class:

**polyline distance from published source coordinates**

It does not treat the result as a surveyed physical measurement.

## Source geometry

### Controlled entrance passage

OpenStreetMap way **755054695**

https://www.openstreetmap.org/way/755054695

Published node order:

1. 7053320514 — explicit `entrance=main`
2. 7053320517 — customer turnstile
3. 7053320516 — interior connection

Published node coordinates:

- 7053320514: **32.7352560, -117.1491820**
- 7053320517: **32.7352359, -117.1492666**
- 7053320516: **32.7352145, -117.1493551**

### Interior to Front Street

OpenStreetMap way **755054694**

https://www.openstreetmap.org/way/755054694

Published node order:

1. 7053320516
2. 13587192693
3. 7053320515

Published node coordinates:

- 7053320516: **32.7352145, -117.1493551**
- 13587192693: **32.7351734, -117.1494973**
- 7053320515: **32.7351404, -117.1496117**

The final node is shared with the current OSM **Front Street** pedestrian way.

## Derivation method

Planner 13 uses deterministic Haversine great-circle distance for each adjacent source-node pair, then sums the segments.

Constants:

- Earth radius: **6,371,000 meters**
- result rounding: **3 decimal places**
- method ID: `haversine-segment-sum`

The code recomputes the result from source coordinates rather than trusting hand-entered aggregate distances.

## Derived results

Controlled entrance passage:

**16.836 m**

Interior continuation to Front Street:

**25.376 m**

Combined entrance-to-Front-Street source-polyline length:

**42.212 m**

Every result carries:

`accuracyClaim: "no-survey-accuracy-claim"`

This means the number is a reproducible geospatial derivation from mapped coordinates, not a claim of centimeter-level real-world path accuracy.

## Planner materialization boundary

Source ways are marked:

`plannerMaterialization: "distance-derivation-only"`

Derived records are marked:

`plannerMaterialization: "distance-only"`

Planner 13 still does **not** create a Planner `RouteEdge`.

The distance assessment returns:

`ROUTE_EDGE_SEMANTICS_NOT_SOURCED`

because the complete edge contract still requires additional authority.

Planner 13 does not invent:

- `durationMinutes`
- `difficulty`
- `stairs`
- `accessible`
- `stroller`
- `oneWay`
- route-node IDs
- edge status

Although OpenStreetMap contains some additional tags on individual ways, Planner 13 intentionally does not collapse those tags into the full Planner routing policy yet.

## Integrity rules

The layer fails closed if:

- Planner 12 main-entrance authority is missing
- a source node URL does not match its declared node ID
- a source way URL does not match its declared way ID
- required entrance/access/connection nodes are missing
- entrance or turnstile coordinates drift from Planner 12 authority
- controlled passage node order changes
- the Front Street endpoint changes
- a way references unknown source nodes
- a derived distance cannot be recomputed exactly from source coordinates
- a way lacks exactly one distance derivation
- hidden RouteEdge fields are injected by cast or deserialization

All exported source and derived records are recursively frozen.

## Wegeforth Bowl

Wegeforth Bowl still has no sourced ingress geometry.

Its Planner 13 assessment remains:

`INGRESS_GEOMETRY_NOT_SOURCED`

## Next boundary

The next clean step is not to guess a walking time.

It is to source and model the remaining edge semantics independently:

- directional policy
- pedestrian access meaning
- accessibility / wheelchair suitability
- stroller suitability
- stairs / grade / difficulty
- duration policy

Only after those fields have defensible authority should this distance slice be promoted into production Planner RouteEdges.
