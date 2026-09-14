# Planner 40 — First interior RouteEdge materialization

## Decision

Materialize the first exact interior WildRoute `RouteEdge` for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

The edge extends the already-materialized entrance graph from the Planner 15 Front Street connection RouteNode to the Planner 38 interior junction RouteNode.

## Materialized RouteEdge

- ID: `sdz-interior-tiger-trail-front-street-route-edge`
- from: `sdz-ingress-node-front-street-route-node`
- to: `sdz-interior-front-street-node-1619736626-route-node`
- mode: `walk`
- distance: `7.157 m`
- duration: `0.099 min`
- difficulty: `easy`
- stairs: `unknown`
- accessible: `true`
- stroller: `unknown`
- one-way: `false`
- static status: `conditional`
- provenance confidence: `provisional`

Every field is taken from the already-qualified Planner 28–39 authority chain rather than re-inferred in Planner 40.

## Unknown does not mean resolved

Planner 40 preserves the distinction introduced by Planner 39:

- the RouteEdge contract can carry `stairs: "unknown"` and `stroller: "unknown"`;
- Planner 35 still has no direct stair-free evidence;
- Planner 36 still has no direct generic stroller-route evidence;
- Planner 37 provenance still records both unresolved semantic blockers;
- the Planner 40 binding keeps those unresolved evidence reasons attached to the materialized edge.

No boolean stairs or stroller claim is introduced.

## Operational behavior

The edge is statically `conditional` and is unavailable to routing unless its exact edge ID is enabled.

Its binding preserves Planner 34's exact runtime requirements:

1. `VISIT_WITHIN_CURRENT_ZOO_HOURS`
2. `AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY`

The main-entrance closure advisement is deliberately **not** reused as interior-segment authority.

Planner 40 does not invent a second runtime resolver. Planner 34 remains the authority that evaluates current exact-segment evidence. A later runtime-integration milestone can translate an enabled Planner 34 decision into the conditional edge ID used by routing.

## Expanded graph slice

Planner 40 exposes a runtime-valid graph containing:

- the three existing ingress RouteNodes;
- the new Planner 38 interior endpoint RouteNode;
- the two existing ingress RouteEdges;
- this first interior RouteEdge.

With no conditional IDs enabled, the interior edge is unroutable. Enabling only the exact interior edge allows the 7.157 m Front Street segment. Enabling all three current conditional edges extends the real entrance route to the new interior junction.

## Mobility behavior

`accessible: true` remains independently qualified by Planner 33 and survives materialization.

`stroller: "unknown"` remains fail-closed when a stroller-compatible route is required. Planner 40 does not couple wheelchair accessibility to generic stroller suitability.

## Scope

The edge remains specific to `sdz-tiger-trail`. The Planner 27 branch selection is still objective-only, and global Front Street endpoint selection remains unresolved.

## Next step

Planner 41 should wire Planner 34's current runtime activation decision into the Planner 40 conditional RouteEdge ID and qualify live entrance-to-interior routing without allowing caller-supplied conditional edge IDs to bypass the resolver.
