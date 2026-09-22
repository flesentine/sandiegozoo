# Planner 57 — Treetops RouteEdge materialization

Planner 57 materializes the exact Treetops segment as a planner RouteEdge.

## Endpoints

From:

- source node `1619736626`
- RouteNode `sdz-interior-front-street-node-1619736626-route-node`

To:

- source node `13588159626`
- RouteNode `sdz-interior-treetops-node-13588159626-route-node`

## RouteEdge

- mode: `walk`
- distance: `48.615 m`
- duration: `0.675 min`
- difficulty: `easy`
- stairs: `unknown`
- accessible: `true`
- stroller: `unknown`
- oneWay: `false`
- status: `conditional`
- provenance: exact Treetops v7 lineage, provisional because stairs/stroller remain unresolved

Planner 57 appends one RouteNode and one RouteEdge to the previously qualified expanded graph.

The conditional edge is not traversable until runtime activation supplies current zoo-hours evidence and affirmative current availability for this exact segment.
