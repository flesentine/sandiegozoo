# Planner 23 — First Production RouteEdges

**Status:** first real San Diego Zoo ingress RouteEdges materialized

Planner 23 turns the qualified ingress authority chain into actual `RouteEdge` records.

## Materialized edges

### 1. Controlled entrance passage

RouteEdge ID:

`sdz-ingress-way-controlled-passage-route-edge`

Source OSM way:

`755054695`

Endpoints:

- from: `sdz-ingress-node-main-entrance-route-node`
- to: `sdz-ingress-node-interior-route-node`

Semantics:

- mode: `walk`
- distance: `16.836 m`
- duration: `0.234 min`
- difficulty: `unknown`
- stairs: `unknown`
- accessible: `unknown`
- stroller: `unknown`
- oneWay: `false`
- status: `conditional`

### 2. Interior → Front Street connection

RouteEdge ID:

`sdz-ingress-way-front-street-connection-route-edge`

Source OSM way:

`755054694`

Endpoints:

- from: `sdz-ingress-node-interior-route-node`
- to: `sdz-ingress-node-front-street-route-node`

Semantics:

- mode: `walk`
- distance: `25.376 m`
- duration: `0.352 min`
- difficulty: `unknown`
- stairs: `unknown`
- accessible: `unknown`
- stroller: `unknown`
- oneWay: `false`
- status: `conditional`

## First real routed path

When both conditional edges are explicitly enabled, the planner can route:

`Main Entrance → interior → Front Street`

Total:

- distance: **42.212 m**
- duration: **0.586 min**

Because Planner 21 resolved both pedestrian directions as bidirectional, the same path is routable in reverse.

## Conditional status remains fail-closed

The RouteEdges are not available to ordinary routing by default.

Each edge has a separate Planner 23 binding that preserves the exact Planner 20 runtime activation requirements:

1. `VISIT_WITHIN_CURRENT_ZOO_HOURS`
2. `NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT`
3. `AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY`

The activation is bound to the exact source OSM way.

A later runtime phase must satisfy all three before placing the RouteEdge ID in `enabledConditionalEdgeIds`.

## Mobility safety

The two current ingress edges carry:

- `accessible=unknown`
- `stroller=unknown`

Therefore:

- `requireAccessible=true` cannot use these edges
- `requireStroller=true` cannot use these edges

This intentionally fails closed until exact mobility authority improves.

## Provenance

Each RouteEdge uses the exact OSM way as its primary provenance source.

Confidence is:

`provisional`

rather than `verified`, because:

- four RouteEdge properties remain explicitly unknown
- operational availability is conditional and must be checked at runtime

The underlying semantic audit still preserves the Planner 17/18 blocker/evidence chain.

## Data package

Planner 23 exports:

- `INGRESS_ROUTE_EDGES`
- `INGRESS_ROUTE_EDGE_BINDINGS`
- `INGRESS_ROUTE_GRAPH_DATA`

`INGRESS_ROUTE_GRAPH_DATA` is a runtime-valid `WildRouteDataPackage` containing:

- San Diego Zoo zone
- Planner 15 ingress RouteNodes
- Planner 23 ingress RouteEdges
- no places yet
- no schedule events yet

This package exists to validate and route the real ingress graph independently before wider Zoo graph integration.

## Integrity rules

Planner 23 fails if:

- any RouteEdge stops matching its semantic audit
- a concrete value replaces a qualified `unknown`
- conditional status is promoted to open
- pedestrian direction becomes one-way
- provenance confidence is promoted beyond provisional
- a runtime activation binding is detached from its exact source way
- edge/audit coverage becomes missing or duplicated

## Next boundary

Planner 24 should wire **runtime conditional-edge activation** so production code can safely enable these RouteEdges only when:

- the visit is within current Zoo hours
- no current closure advisement blocks the ingress
- the exact source edge has affirmative current availability

After that, graph expansion can continue beyond Front Street.
