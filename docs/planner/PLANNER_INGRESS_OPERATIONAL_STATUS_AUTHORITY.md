# Planner 20 — Operational Status Authority

**Status:** exact ingress RouteEdge status is supported as conditional

Planner 20 resolves the `RouteEdge.status` field for the current exact ingress walking segments without claiming real-time availability.

## Official operational evidence

Current official San Diego Zoo information establishes:

- the Zoo is open every day of the year, rain or shine
- operating hours vary throughout the year
- habitats, tours, restaurants, transportation, entertainment, and services may change or close without notice
- a daily listing of changes or closures is available at the main entrance

Planner 20 freezes that combination as operational-policy evidence.

## Why status is conditional, not open

The repository does not have authoritative live closure telemetry for the exact ingress paths.

Therefore:

`status: "open"`

would overstate certainty.

Instead, every current exact ingress edge receives:

`status: "conditional"`

This matches the existing routing contract, where conditional edges are traversable only when explicitly enabled.

## Runtime activation requirements

A Planner 20 ingress edge may only be enabled after **all three** conditions are satisfied:

1. `VISIT_WITHIN_CURRENT_ZOO_HOURS`
2. `NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT`
3. `AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY`

The third condition is bound to the edge's exact OSM source way ID. Facility hours and the absence of a closure notice are not sufficient by themselves.

Planner 20 does not hard-code a yearly hours table.

The current hours source is date-dependent and must be evaluated for the actual visit date.

Likewise, the absence of a closure must come from current operational input rather than stale source assumptions.

## Exact current ingress results

### OSM way 755054695

Status authority:

- supported
- value: `conditional`
- runtime activation required

### OSM way 755054694

Status authority:

- supported
- value: `conditional`
- runtime activation required

Neither edge is represented as unconditionally open.

## Planner 14 integration

Planner 14 now delegates `edgeStatusAuthority` to Planner 20.

Current supported RouteEdge fields:

- `routeNodes`
- `mode`
- `distance`
- `duration`
- `status`

Current blocked RouteEdge fields:

- `difficulty`
- `stairs`
- `accessible`
- `stroller`
- `oneWay`

RouteEdge materialization remains blocked until those remaining contract fields have defensible authority.

## Router compatibility

The routing engine already supports:

`status: "conditional"`

and excludes conditional edges unless their IDs are explicitly provided through:

`enabledConditionalEdgeIds`

Planner 20 deliberately uses that existing mechanism rather than introducing a second operational bypass.

A later production integration phase must resolve all three runtime activation requirements—including affirmative current availability of that **specific exact edge**—and only then enable the exact edge IDs.

## Integrity rules

Planner 20 fails closed if:

- the official operational source URLs change without a new evidence freeze
- the observation timestamp changes silently
- the Zoo's open-daily policy is replaced with a stronger claim
- variable-hours semantics are removed
- without-notice closure semantics are removed
- the daily closure-advisement location changes
- `conditional` is promoted to `open`
- any runtime activation requirement is removed
- the exact-edge activation binding is changed to another source way
- current ingress ways lose one-to-one operational status coverage
- Planner 14 stops matching Planner 20 status authority

All exported operational policy is recursively frozen.

## What Planner 20 does not claim

Planner 20 does **not** claim:

- an exact ingress path is currently open
- absence of online closure information proves a path is open
- facility-level operating evidence proves an exact edge is currently traversable
- Zoo opening hours never change
- a scheduled-open facility guarantees every internal path is available
- a conditional edge should be enabled automatically

## Next boundary

After Planner 20, the remaining exact ingress RouteEdge fields are:

- `difficulty`
- `stairs`
- `accessible`
- `stroller`
- `oneWay`

The highest-value next phase is **pedestrian direction resolution**, because one current ingress way has generic `oneway=yes` but still lacks explicit pedestrian direction authority, while the second way has no pedestrian-direction tag at all.

If exact direction cannot be sourced, the alternative is a prospective bidirectional-walk policy only where that policy can be justified without contradicting source semantics.
