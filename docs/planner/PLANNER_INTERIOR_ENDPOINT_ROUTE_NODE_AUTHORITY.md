# Planner 38 — Interior endpoint RouteNode authority

## Decision

Materialize exactly one Planner `RouteNode` for the Tiger Trail objective-selected Front Street endpoint:

- source way: OpenStreetMap way `1481425058` (`Front Street`)
- source node: `1619736626`, version `2`
- coordinate: `32.735201, -117.1496375`
- RouteNode kind: `junction`
- zone: `sdz-zone-san-diego-zoo`
- selection scope: `objective-only`
- global Front Street endpoint selection: `unresolved`

The RouteNode exists because Planner 26 version-pinned the candidate node and Planner 27 selected that candidate specifically for the `sdz-tiger-trail` objective. It is not a claim that this node is the global Front Street expansion endpoint or the Tiger Trail destination itself.

## Provenance

The RouteNode provenance points to the exact versioned OSM node URL and remains `provisional`. Planner 37 supplies the qualified lineage/verification boundary. This milestone does not strengthen Planner 37's confidence or reinterpret OSM geometry as Zoo policy authority.

## Edge boundary

Planner 38 materializes a node only. It must not contain or imply `RouteEdge` fields such as mode, distance, duration, difficulty, stairs, accessibility, stroller suitability, direction, or operational status.

The exact Tiger Trail segment still cannot materialize as a RouteEdge because two independent semantic blockers remain:

1. `EXACT_SEGMENT_STAIRS_NOT_SOURCED`
2. `EXACT_SEGMENT_STROLLER_NOT_SOURCED`

Planner 38 does not convert either unknown into a concrete value.

## Runtime hardening

The exported authority, binding, RouteNode, provenance, and assessment records use null-prototype objects so inherited `Object.prototype` pollution cannot make node-only records appear to expose RouteEdge semantics. Integrity checks use inherited-aware field tests and the test suite pollutes `Object.prototype` after module load to verify the boundary remains closed.

## Next step

A later milestone may complete the two unresolved edge capabilities explicitly as `"unknown"`, following the existing conservative ingress contract-completion precedent. That completion must retain the unresolved evidence reasons rather than pretending new stairs or stroller facts were sourced.
