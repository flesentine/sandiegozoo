# Planner 22 — RouteEdge Unknown Semantics

**Status:** ingress RouteEdge contract is complete without invented terrain or mobility facts

Planner 22 resolves the final schema mismatch between the evidence model and the RouteEdge contract.

Before Planner 22, four exact ingress fields were blocked because the source authority did not establish concrete values:

- `difficulty`
- `stairs`
- `accessible`
- `stroller`

The old RouteEdge schema required concrete enums/booleans, which created a dangerous choice:

1. invent a concrete value, or
2. refuse to materialize otherwise valid RouteEdges.

Planner 22 removes that false choice.

## Contract change

### Difficulty

`RouteDifficulty` now permits:

- `easy`
- `moderate`
- `steep`
- `unknown`

### Capability fields

The following RouteEdge fields now permit:

- `true`
- `false`
- `unknown`

Fields:

- `stairs`
- `accessible`
- `stroller`

`oneWay` remains a strict boolean because Planner 21 resolved the current exact pedestrian direction semantics.

## Why unknown is not false

Planner 22 explicitly separates:

- **false** — the property is known not to apply
- **unknown** — the current qualified evidence does not establish the property either way

Examples:

- absence of `highway=steps` does not prove `stairs=false`
- corridor accessibility evidence does not prove the exact connector is `accessible=true`
- facility stroller permission does not prove the exact edge is `stroller=true`

Using `false` for these cases would be false precision.

## Fail-closed routing behavior

Accessibility and stroller preferences are hard routing constraints.

When a route request sets:

`requireAccessible: true`

the router accepts only edges with:

`accessible === true`

Edges with:

- `accessible=false`
- `accessible=unknown`

are both excluded.

Likewise, when:

`requireStroller: true`

only:

`stroller === true`

is accepted.

This means the new unknown semantics do not weaken accessibility or stroller safety.

For the separate soft `preferEasyPaths` preference, `difficulty=unknown` is neutral: only explicit `moderate` or `steep` difficulty earns an easier-path penalty. Unknown is not silently treated as “not easy.”

## Unrestricted routing behavior

If a request does not require accessibility or stroller suitability, an edge with unknown capability may still participate in ordinary routing.

That preserves useful routing through source-backed geometry while avoiding claims the evidence cannot support.

## Current ingress completion

### Way 755054695

The RouteEdge semantic audit now carries:

- `difficulty=unknown`
  - unresolved reason: `EXACT_EDGE_DIFFICULTY_NOT_SOURCED`
- `stairs=unknown`
  - unresolved reason: `EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED`
- `accessible=unknown`
  - unresolved reason: `EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED`
- `stroller=unknown`
  - unresolved reason: `FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY`

### Way 755054694

The RouteEdge semantic audit now carries:

- `difficulty=unknown`
  - unresolved reason: `CORRIDOR_TERRAIN_NOT_EXACT_EDGE_AUTHORITY`
  - Front Street terrain evidence retained
- `stairs=unknown`
  - unresolved reason: `EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED`
  - Front Street terrain evidence retained
- `accessible=unknown`
  - unresolved reason: `CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY`
  - Front Street wheelchair/ADA corridor evidence retained
- `stroller=unknown`
  - unresolved reason: `FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY`

The source evidence is not discarded just because the RouteEdge value is unknown.

## RouteEdge readiness

After Planner 22, all required RouteEdge fields have valid contract semantics:

- `fromNodeId` / `toNodeId`
- `mode`
- `distanceMeters`
- `durationMinutes`
- `difficulty`
- `stairs`
- `accessible`
- `stroller`
- `oneWay`
- `status`

The ingress readiness result is therefore:

`route-edge-contract-complete`

with:

`blockedFields: []`

This does **not** mean every semantic is known. It means uncertainty is represented explicitly instead of blocking the entire edge.

## Validation rules

Planner 22 preserves all existing concrete values.

It rejects:

- arbitrary strings such as `stairs="maybe"`
- truthy strings such as `accessible="true"`
- invalid difficulty values
- the existing concrete contradiction `stairs=true + accessible=true`
- the existing concrete contradiction `stairs=true + stroller=true`

`stairs=unknown` does not trigger those concrete contradictions because unknown is not equivalent to true.

## Integrity rules

Planner 22 fails if:

- an unresolved Planner 17/18 field is silently promoted to a concrete value
- the upstream unresolved reason changes without the completion record changing
- corridor/facility evidence linkage is lost
- current ingress completion is missing or duplicated
- the shared RouteEdge audit stops matching the Planner 22 completion authority
- accessibility/stroller routing starts accepting unknown capability under hard requirements
- easier-path scoring penalizes `difficulty=unknown` as though a harder difficulty were established

## Schema compatibility

Existing schemaVersion 1 packages remain valid because all prior concrete values remain accepted.

Planner 22 broadens the allowed value domain without invalidating existing RouteEdges.

## Next boundary

The ingress RouteEdge contract is now complete.

**Planner 23 should materialize the first real production RouteEdges**:

1. Main Entrance → interior through the controlled passage
2. interior → Front Street connection

Those edges should preserve:

- Planner 13 distance
- Planner 19 duration
- Planner 20 conditional operational status
- Planner 21 bidirectional pedestrian semantics
- Planner 22 explicit unknown terrain/mobility semantics
- exact Planner 15 route-node endpoints
- source provenance from the frozen ingress authorities
