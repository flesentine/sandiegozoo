# Planner 51 — Treetops operational status

Planner 51 qualifies the exact Treetops segment's static planner status after Planner 50 accessibility.

## Shared policy

Planner 51 reuses the existing interior operational-status policy:

- status: `conditional`
- activation: `runtime-check-required`
- facility schedule: open every day
- hours vary through the year
- changes or closures may occur without notice
- main-entrance closure advisement is not exact interior-segment authority

The exact segment must satisfy both runtime requirements before traversal:

1. `VISIT_WITHIN_CURRENT_ZOO_HOURS`
2. `AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY`

## Result

For OSM way `148910139` v7 from node `1619736626` to node `13588159626`:

- planner status: `conditional`
- activation: `runtime-check-required`

This milestone does not implement the final runtime resolver. That belongs to the runtime activation/integration milestone after RouteEdge materialization.

Still unresolved:

- stairs
- stroller suitability

No RouteNode or RouteEdge is materialized here.
