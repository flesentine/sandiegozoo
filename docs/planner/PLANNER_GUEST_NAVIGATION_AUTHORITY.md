# Planner 12 — Explicit Guest Entrance Authority

**Status:** San Diego Zoo main entrance navigation point verified; route graph still blocked

Planner 12 promotes one target beyond Planner 11's feature-geometry boundary.

Planner 11 proved where the **San Diego Zoo Main Entrance building** is located, but correctly refused to treat a building representative point as a guest routing target.

Planner 12 finds a different kind of source object:

- an explicit OpenStreetMap **node**
- on the sourced main-entrance building
- tagged `entrance=main`
- connected directly to pedestrian geometry

That is sufficient to establish the first guest-facing navigation point.

It is not sufficient to create weighted route edges.

## Official semantic context

Current official sources establish the identity and guest semantics of the main Zoo entrance.

### San Diego Zoo

The Zoo's Plan Your Visit page identifies:

- San Diego Zoo
- 2920 Zoo Drive, San Diego, CA 92101
- shuttle service directly to the Zoo's main entrance

Source:

https://zoo.sandiegozoo.org/plan-your-visit

### City of San Diego

The City's current Balboa Park / Zoo traffic page tells rideshare visitors to:

- use the **main Zoo Entrance**
- and states that the Zoo Entrance is on **Zoo Drive**

Source:

https://www.sandiego.gov/blog/zoo-balboa-park-traffic-information

These official pages establish semantic identity.

They do **not** supply the coordinate.

## Explicit entrance coordinate authority

OpenStreetMap node:

**7053320514**

Source:

https://www.openstreetmap.org/node/7053320514

Current source facts:

- coordinate: **32.7352560, -117.1491820**
- tag: `entrance=main`
- part of the previously sourced San Diego Zoo Main Entrance building way **79293454**
- connected to pedestrian ways **1126804580** and **755054695**

Planner 12 records this as:

`coordinateSemantics: "explicit-guest-entrance-node"`

This is materially stronger authority than Planner 11's:

`mapped-feature-representative-point`

## Why a NavigationPoint is now allowed

Planner 1 requires a guest-facing navigation point to represent the place a guest should actually navigate to.

OpenStreetMap's documented entrance model uses `entrance=*` on the point where a person enters a building or enclosed area.

The current main-entrance node is:

- explicitly tagged `entrance=main`
- physically part of the sourced entrance building
- connected to pedestrian geometry
- semantically consistent with the official Zoo and City descriptions of the main entrance

Planner 12 therefore allows:

`NavigationPoint { lat, lng, confidence: "verified" }`

for the main entrance target.

## Guest access-control evidence

The controlled pedestrian passage contains OpenStreetMap node:

**7053320517**

Source:

https://www.openstreetmap.org/node/7053320517

Current source facts:

- coordinate: **32.7352359, -117.1492666**
- `barrier=turnstile`
- `access=customers`
- part of pedestrian way **755054695**

This independently strengthens the interpretation that the mapped passage is real guest ingress geometry.

It is preserved as access-control evidence, not as a weighted planner edge.

## Pedestrian ingress topology

Planner 12 freezes three OpenStreetMap ways as topology evidence.

### Entry plaza

Way **1126804580**

https://www.openstreetmap.org/way/1126804580

Current source fact:

- `highway=pedestrian`
- includes explicit entrance node **7053320514**

### Controlled building passage

Way **755054695**

https://www.openstreetmap.org/way/755054695

Current source facts include:

- `highway=pedestrian`
- `tunnel=building_passage`
- the explicit entrance node
- the customer turnstile node
- an interior continuation node

### Interior continuation

Way **755054694**

https://www.openstreetmap.org/way/755054694

Current source fact:

- `highway=pedestrian`
- continues from the inside of the entrance structure toward the mapped **Front Street** connection

Planner 12 stores this chain as:

`plannerMaterialization: "topology-only"`

## Why the route graph remains blocked

The source geometry establishes connectivity.

It does not yet establish the complete Planner 2 edge contract.

Planner 12 therefore does **not** invent:

- `distanceMeters`
- `durationMinutes`
- `difficulty`
- `stairs`
- `accessible`
- `stroller`
- exact planner edge direction policy
- a full production route graph

The guest-navigation assessment explicitly returns:

`ROUTE_EDGE_WEIGHTS_NOT_SOURCED`

for the route graph.

The main entrance can now be a trusted navigation point without pretending the rest of the routing network is ready.

## Wegeforth Bowl remains blocked

Planner 11 has corroborated feature-location evidence for Wegeforth Bowl.

Planner 12 still has no explicit guest entrance node for that target.

Its assessment remains:

`EXPLICIT_ENTRANCE_NODE_NOT_SOURCED`

No entrance is inferred from the theatre building geometry.

## Integrity rules

The Planner 12 authority layer fails closed when:

- an entrance target is unknown
- the target does not resolve to an official entrance map anchor
- multiple entrance nodes exist without routing-preference authority
- an entrance observation is not an OSM node
- the entrance is not tagged `main`
- coordinate semantics are not explicit-entrance semantics
- the entrance building way does not match Planner 11 feature authority
- pedestrian way IDs are malformed or duplicated
- access control is not a customer turnstile
- the turnstile is not on a pedestrian way connected to the entrance
- ingress topology does not preserve the sourced chain
- OSM object URLs do not match their declared object IDs
- semantic context URLs are not official Zoo / City authority

All exported authority records are recursively frozen.

## Scope boundary

Planner 12 does not yet:

- create production RouteEdges
- infer edge distance from straight-line geometry
- infer walking time from geometry
- infer accessibility or stroller suitability
- infer slope or stairs
- materialize Wegeforth Bowl as a navigation point
- connect the entrance to every destination
- claim the optimizer has a production Zoo route graph

The next clean step is to determine whether the sourced pedestrian geometry can support a small **measured ingress graph slice** with trustworthy distances and separately sourced walking/accessibility semantics. If those edge fields cannot be sourced, the topology remains unweighted.
