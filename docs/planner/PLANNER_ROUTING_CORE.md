# Planner 2 — Deterministic Routing Core

**Status:** implementation baseline

Planner 2 compiles a Planner 1 validated data package into a reusable routing graph, then answers point-to-point route queries against that compiled graph. It does not infer missing paths from coordinates.

## Route authority

A path can use only explicit graph edges.

No fallback is allowed to:

- straight-line distance
- visual map geometry
- guest navigation-point proximity
- generated coordinates

## Edge direction

- `oneWay: true` creates only the declared traversal.
- `oneWay: false` creates forward and reverse traversals with the same edge provenance.

Reverse traversal is explicit in the route result.

## Availability

- `closed` edges are never routable.
- `conditional` edges are unavailable by default.
- a conditional edge is routable only when its **exact stable edge ID** appears in `enabledConditionalEdgeIds`.

There is intentionally no global “allow all conditional edges” switch.

## Constraints

A route request can require:

- accessible edges
- stroller-friendly edges
- a permitted set of transport modes

These are hard filters. Soft preferences such as “prefer easier paths” belong in later scoring/cost policy, not in this foundational graph filter.

## Optimization

The caller chooses:

- `duration` — default
- `distance`

Path comparison is deterministic:

1. requested primary cost
2. secondary cost
3. fewer hops
4. lexical traversal signature using fixed JavaScript code-unit ordering

The result therefore does not depend on input edge order or host locale.

## Result

A found route returns:

- ordered node IDs
- ordered traversed edges
- edge direction
- edge mode/difficulty/status
- exact summed distance
- exact summed duration
- per-edge source provenance

Failures distinguish:

- unknown start node
- unknown end node
- no route under the active constraints

A start node routed to itself is a valid zero-cost route.

## Scope boundary

Planner 2 does not yet:

- choose attractions
- score Must-Sees
- choose show performances
- model dwell time
- schedule meals
- compute an all-day itinerary
- evaluate soft route preferences

It establishes trustworthy point-to-point travel costs for the scheduling and optimizer phases.


## Graph lifecycle

`buildRoutingGraph(...)` validates and compiles adjacency once.

`findShortestRoute(graph, request)` consumes that compiled graph and never reparses or rebuilds the source package for each query. This matters because the later optimizer will request many point-to-point travel costs during one plan build.

`declaredOutgoing(nodeId)` is a diagnostics view of declared graph topology only. It may include closed or conditional edges. Route search always applies availability and request constraints separately.
