# Planner 14 — Ingress RouteEdge Semantic Audit

**Status:** walking mode and distance are supported; production RouteEdges remain blocked

Planner 14 audits the first ingress distance slice against the complete Planner 1 `RouteEdge` contract.

Planner 13 established reproducible geometry-derived distances for two current OpenStreetMap pedestrian ways.

Planner 14 asks a narrower question:

**Which RouteEdge fields are actually supported by the current source evidence?**

The answer is intentionally partial.

## Audited ways

### Controlled entrance passage — OSM way 755054695

Current frozen source tags:

- `highway=pedestrian`
- `oneway=yes`
- `tunnel=building_passage`

Planner 13 distance:

**16.836 m**

### Interior to Front Street — OSM way 755054694

Current frozen source tags:

- `highway=pedestrian`

Planner 13 distance:

**25.376 m**

## Supported fields

### Mode

`highway=pedestrian` provides direct source authority for:

`mode: "walk"`

Planner 14 therefore classifies walking mode as supported for both audited ways.

### Distance

Planner 13 already derives distance reproducibly from the frozen OSM node sequence.

Planner 14 therefore classifies the existing distance value as supported.

No new distance calculation is introduced here.

## Why generic oneway=yes is not promoted

The controlled building passage carries:

`oneway=yes`

That is not sufficient for a Planner pedestrian `oneWay` field.

OpenStreetMap provides a pedestrian-specific direction tag:

`oneway:foot=*`

The pedestrian-routing guidance also warns that generic one-way road semantics do not automatically settle foot routing in every context.

Planner 14 therefore returns:

`GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT`

rather than:

`oneWay: true`

For the interior connection, no explicit pedestrian direction authority is present, so it returns:

`PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED`

## Why the customer turnstile does not prove wheelchair or stroller suitability

Planner 12 established:

- `barrier=turnstile`
- `access=customers`

That proves a real guest access-control point exists.

It does not establish:

- wheelchair passability
- alternate wheelchair access
- stroller suitability
- width
- slope
- stairs
- duration

OpenStreetMap supports separate wheelchair and other access semantics when those facts are mapped.

Planner 14 therefore keeps:

- `accessible` blocked
- `stroller` blocked
- `stairs` blocked

No value is inferred from the presence of a turnstile.

## RouteEdge field audit

Current supported fields:

- `mode`
- `distanceMeters` authority, retained as the Planner 13 distance fact

Current blocked fields:

- `fromNodeId`
- `toNodeId`
- `durationMinutes`
- `difficulty`
- `stairs`
- `accessible`
- `stroller`
- `oneWay`
- `status`

The exported audit records are tagged:

`plannerMaterialization: "route-edge-audit-only"`

They are not `RouteEdge` records.

## Why route nodes remain blocked

Planner 12 established a verified guest navigation point for the main entrance.

Planner 13 established source geometry nodes.

Neither phase has yet created the complete production Planner zone / route-node materialization for this ingress chain.

Planner 14 therefore does not invent:

- entrance RouteNode IDs
- turnstile junction RouteNode IDs
- Front Street RouteNode IDs

The audit reports:

`PLANNER_ROUTE_NODES_NOT_MATERIALIZED`

## Duration remains blocked

A mapped geometry distance does not establish guest walking time.

Planner 14 does not select a walking speed or infer a duration from distance.

It reports:

`DURATION_POLICY_NOT_SOURCED`

## Difficulty remains blocked

The current ingress source slice does not establish a Planner difficulty classification.

Planner 14 does not map asphalt, pedestrian designation, or building passage status into:

- easy
- moderate
- steep

It reports:

`DIFFICULTY_NOT_SOURCED`

## Edge status remains blocked

The existence of a current OSM way is not the same thing as a date-specific operational guarantee that a Planner edge is open.

Planner 14 reports:

`EDGE_STATUS_NOT_SOURCED`

rather than inventing `status: "open"`.

## OSM interpretation references

Planner 14 freezes the semantic-reference URLs used to interpret the source tags:

- OpenStreetMap pedestrian navigation guidelines
- OpenStreetMap `oneway:foot` key documentation
- OpenStreetMap barrier documentation

These references explain tag semantics.

They do not replace the source objects themselves.

## Integrity rules

The audit layer fails closed if:

- an audited way no longer matches Planner 13 source authority
- source tags change without an explicit source update
- mode is promoted beyond `walk`
- distance drifts from Planner 13
- any currently blocked semantic field is promoted
- generic `oneway=yes` is treated as pedestrian one-way authority
- a direct Planner RouteEdge field is smuggled into an audit object
- an ingress way lacks exactly one audit

All exported audit data is recursively frozen.

## Current readiness

For the San Diego Zoo main-entrance ingress slice:

`partial-route-edge-authority`

Supported:

- walking mode
- distance

Blocked:

- route nodes
- duration
- difficulty
- stairs
- wheelchair accessibility
- stroller suitability
- pedestrian direction
- operational status

Therefore:

`ROUTE_EDGE_CONTRACT_INCOMPLETE`

## Next boundary

The next step should target one missing semantic class at a time.

The most useful order is:

1. production route-node / zone materialization for the ingress chain
2. explicit pedestrian direction evidence
3. accessibility and stroller evidence
4. stairs / grade / difficulty authority
5. operational edge status
6. duration policy

Only after the full contract is defensible should these records become production Planner RouteEdges.
