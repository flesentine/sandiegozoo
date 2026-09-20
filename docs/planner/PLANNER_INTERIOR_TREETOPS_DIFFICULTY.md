# Planner 49 — Treetops difficulty

Planner 49 qualifies difficulty for the exact Treetops segment after Planner 48 walking duration.

## Evidence

The official San Diego Zoo accessibility-map authority publishes:

- corridor: `Treetops Way`
- corridor id: `sdz-corridor-treetops-way`
- terrain: `mild`
- Tiger Trail relationship: access corridor

Planner 47's exact OSM v7 source snapshot names way `148910139` exactly `Treetops Way`.

That exact name match satisfies the existing interior difficulty policy requirement that the exact source-way name equal the official corridor name.

## Shared policy

Planner 49 reuses `sdz-interior-difficulty-policy-v1`:

- scope: exact segments with exact named-corridor match
- supported published terrain: `mild`
- planner difficulty: `easy`
- stairs semantics: independent; never inferred from `mild`

## Result

For the exact segment from node `1619736626` to node `13588159626`:

- published terrain: `mild`
- planner difficulty: `easy`

Stairs remain independently unresolved. `not-explicitly-published` stairs evidence is not interpreted as `stairs=false`.

Still blocked:

- stairs
- accessibility
- stroller suitability
- operational status

No RouteNode or RouteEdge is materialized here.
