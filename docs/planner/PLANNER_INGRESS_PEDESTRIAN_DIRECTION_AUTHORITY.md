# Planner 16 — Pedestrian Direction Authority

**Status:** pedestrian direction has been audited explicitly; current ingress `oneWay` remains blocked

Planner 16 isolates one RouteEdge semantic class:

**pedestrian direction.**

The goal is to stop the general RouteEdge audit from interpreting raw OSM direction tags itself.

## Why this phase exists

The controlled entrance passage currently carries:

- `highway=pedestrian`
- `oneway=yes`
- `tunnel=building_passage`

That does **not** automatically justify Planner:

`oneWay: true`

OpenStreetMap documents `oneway:foot=*` specifically for pedestrian direction and notes that generic `oneway=yes` can be ambiguous for pedestrians.

Planner 16 therefore treats generic one-way tagging as insufficient pedestrian authority unless explicit foot direction is present.

## Current source snapshots

### OSM way 755054695

Current frozen direction snapshot:

- generic `oneway=yes`
- no `oneway:foot`
- customer turnstile context from Planner 12

Result:

`GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT`

The turnstile is retained as access-control context, but it is not promoted into a directional rule.

### OSM way 755054694

Current frozen direction snapshot:

- no generic one-way tag
- no `oneway:foot`

Result:

`PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED`

## Explicit pedestrian direction semantics

Planner 16 defines deterministic handling for future source updates:

- `oneway:foot=yes` → one-way with OSM way order
- `oneway:foot=-1` → one-way against OSM way order
- `oneway:foot=no` → bidirectional pedestrian travel
- absent `oneway:foot` + generic `oneway=yes` → blocked as ambiguous
- absent `oneway:foot` + no generic one-way → blocked as unsourced

The future mappings are classifier behavior only. They do not claim those tags exist on the current Zoo ways.

## Planner 14 integration

Planner 14 no longer determines pedestrian direction from its own raw tag logic.

Instead, its `oneWayAuthority` now records:

- the exact Planner 16 blocked reason
- `basis: "Planner 16 pedestrian-direction authority"`
- the exact pedestrian-direction source snapshot ID

This keeps the general RouteEdge audit subordinate to the dedicated direction authority.

## What remains blocked

Current Planner RouteEdge `oneWay` is still blocked for both ingress ways.

RouteEdge materialization also remains blocked by the other unresolved semantic classes:

- duration
- difficulty
- stairs
- wheelchair accessibility
- stroller suitability
- operational status

## Integrity rules

Planner 16 fails closed if:

- a current source way disappears
- source way URL / target identity drifts
- the controlled passage loses its current generic `oneway=yes` snapshot
- a current `oneway:foot` tag is invented
- turnstile context moves to the wrong way
- semantic reference URLs drift outside the exact OSM direction definitions
- Planner 14 stops matching the exact Planner 16 direction result or source snapshot

All exports are recursively frozen.

## Next boundary

Planner 16 intentionally does not force progress by guessing direction.

The next useful RouteEdge semantic class is **accessibility / stroller authority**, because the official Zoo accessibility map may support a stronger evidence path than the current pedestrian-direction sources.
