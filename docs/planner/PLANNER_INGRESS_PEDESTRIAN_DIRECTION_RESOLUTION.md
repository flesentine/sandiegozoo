# Planner 21 — Pedestrian Direction Resolution

**Status:** exact ingress `oneWay` is resolved and RouteEdge-ready

Planner 21 resolves the remaining pedestrian-direction ambiguity from Planner 16 without changing Planner 16's frozen OSM source snapshots.

## Frozen source snapshots

Planner 16 remains the source-tag authority.

### OSM way 755054695

Current frozen tags:

- `highway=pedestrian`
- `oneway=yes`
- `tunnel=building_passage`

Planner 16 intentionally blocked this as:

`GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT`

because plain `oneway=yes` did not explicitly identify pedestrian direction.

### OSM way 755054694

Current frozen tags:

- `highway=pedestrian`

Planner 16 intentionally blocked this as:

`PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED`

## Planner 21 interpretation policy

Policy ID:

`sdz-pedestrian-direction-resolution-policy-v1`

Scope:

`highway-pedestrian-ingress-ways`

The policy freezes three precedence rules:

1. Explicit Planner 16 pedestrian direction remains authoritative.
2. On `highway=pedestrian`, generic `oneway=yes` is interpreted as vehicle-only unless explicit pedestrian-direction tagging says otherwise.
3. A pedestrian way with no explicit pedestrian-direction restriction is bidirectional by default, even when a generic vehicle `oneway` tag such as `oneway=no` is present.

Semantic references:

- OpenStreetMap `Key:oneway`
- OpenStreetMap `Key:oneway:foot`

Planner 21 is an explicit WildRoute interpretation policy over the frozen source tags. It does not alter OpenStreetMap.

## Exact current results

### Way 755054695

Planner 16 source state:

`GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT`

Planner 21 resolution:

- `oneWay: false`
- direction: `bidirectional`
- resolution case: `generic-oneway-vehicle-only`

The generic `oneway=yes` remains preserved in source provenance; it is simply not promoted into pedestrian one-way semantics.

### Way 755054694

Planner 16 source state:

`PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED`

Planner 21 resolution:

- `oneWay: false`
- direction: `bidirectional`
- resolution case: `no-explicit-pedestrian-restriction`

## Explicit pedestrian tags still win

If a future frozen snapshot contains an explicit supported value such as:

- `oneway:foot=yes`
- `oneway:foot=-1`
- `oneway:foot=no`

Planner 16 remains authoritative and Planner 21 passes that result through rather than overriding it.

Unsupported explicit pedestrian-direction tags remain blocked.

## Planner 14 integration

The shared RouteEdge audit now delegates `oneWayAuthority` to Planner 21.

Current supported RouteEdge fields:

- `routeNodes`
- `mode`
- `distance`
- `duration`
- `status`
- `oneWay`

Current blocked RouteEdge fields:

- `difficulty`
- `stairs`
- `accessible`
- `stroller`

RouteEdge materialization remains blocked until those four remaining fields have defensible authority.

## Integrity rules

Planner 21 fails closed if:

- the policy ID/version/timestamp changes silently
- the policy scope expands beyond `highway=pedestrian`
- generic oneway is reinterpreted as pedestrian one-way
- generic vehicle-only oneway tags incorrectly block the pedestrian bidirectional default
- default pedestrian bidirectionality changes silently
- Planner 16 explicit direction loses precedence
- semantic-reference URLs drift
- current ingress coverage is incomplete or duplicated
- either current ingress edge stops resolving bidirectional
- the shared RouteEdge audit changes the Planner 21 source snapshot, basis, direction, policy ID, or resolution case

All exported policy data is recursively frozen.

## What Planner 21 does not claim

Planner 21 does **not** claim:

- every OSM `oneway=yes` is irrelevant to pedestrians on every highway class
- every path or footway is necessarily bidirectional
- explicit pedestrian restrictions may be ignored
- the controlled passage is operationally available in both directions at every moment

Operational availability remains governed independently by Planner 20.

## Next boundary

After Planner 21, only four exact ingress RouteEdge fields remain blocked:

- `difficulty`
- `stairs`
- `accessible`
- `stroller`

The strongest next move is a **contract-completion policy phase** that determines whether these four fields can be safely resolved from existing corridor/facility evidence plus conservative product semantics, or whether some must remain conditional/unknown and require a richer RouteEdge contract before materialization.
