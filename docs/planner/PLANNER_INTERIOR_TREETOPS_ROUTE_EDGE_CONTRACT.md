# Planner 56 — Treetops RouteEdge contract completion

Planner 56 completes the RouteEdge field contract without inventing evidence.

## Explicit unknown capabilities

Planner 52 left stairs unresolved:

- value: `unknown`
- blocker: `EXACT_SEGMENT_STAIRS_NOT_SOURCED`

Planner 53 left stroller suitability unresolved:

- value: `unknown`
- blocker: `EXACT_SEGMENT_STROLLER_NOT_SOURCED`

The planner contract supports `boolean | "unknown"` for these capabilities. Planner 56 therefore marks both fields as representable while preserving their unresolved evidence lineage.

## Result

The exact Treetops segment now has every RouteEdge field representable:

- stairs: `unknown`
- stroller: `unknown`

The underlying evidence remains unresolved; Planner 56 does not convert either value to true or false.

No RouteEdge is materialized in this milestone. It only makes RouteEdge materialization ready for the next milestone.
