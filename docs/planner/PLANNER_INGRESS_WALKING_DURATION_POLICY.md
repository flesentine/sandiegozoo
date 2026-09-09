# Planner 19 — Prospective Walking-Duration Policy

**Status:** exact ingress walking duration is policy-derived and RouteEdge-ready

Planner 19 resolves the RouteEdge `durationMinutes` field for the current exact ingress walking segments.

It does so by adopting a **prospective product policy**, not by pretending the San Diego Zoo publishes exact segment-level travel times.

## Why a policy is needed

Planner 13 already froze exact derived distances for:

- OSM way 755054695 — 16.836 m
- OSM way 755054694 — 25.376 m

The Planner RouteEdge contract requires a positive `durationMinutes`.

The Zoo's published 20-minute Front Street value describes a whole named corridor and cannot be assigned to either exact ingress segment.

Planner 19 therefore defines a deterministic base traversal policy over the frozen exact distances.

## Policy v1

Policy ID:

`sdz-walking-duration-policy-v1`

Adopted:

`2026-09-08T18:11:00-07:00`

Scope:

`free-flow-walk-edges`

Frozen values:

- walking speed: **1.2 meters/second**
- output unit: minutes
- rounding: **3 decimal places**
- minimum duration floor: **none**
- pace adjustment: **none**
- terrain adjustment: **none**
- queue adjustment: **none**
- turnstile/access-control delay adjustment: **none**
- crowd adjustment: **none**

Formula:

`durationMinutes = round3(distanceMeters / 1.2 / 60)`

The 1.2 m/s value is an explicit WildRoute product baseline. It is not represented as a Zoo-sourced fact.

## Why pace is not applied here

Planner's existing visitor pace policy already changes:

- flexible-stop dwell duration
- between-stop buffer time

It does not alter RouteEdge travel duration.

Planner 19 keeps the base graph neutral so relaxed/balanced/maximize behavior is not counted twice.

A future policy may deliberately introduce pace-dependent route speed, but that must be a separate prospective change with explicit optimizer qualification.

## Why there is no one-minute floor

The current ingress segments are short.

A one-minute minimum would manufacture roughly 2–4× the actual base traversal estimate per segment and would distort optimizer comparisons.

The RouteEdge validator already supports any finite positive fractional duration.

Planner 19 therefore preserves sub-minute edge durations.

## Exact current results

### Controlled entrance passage — way 755054695

Distance:

`16.836 m`

Duration:

`0.234 min`

Equivalent free-flow traversal time:

approximately **14.0 seconds**

### Front Street connection — way 755054694

Distance:

`25.376 m`

Duration:

`0.352 min`

Equivalent free-flow traversal time:

approximately **21.1 seconds**

### Current combined ingress duration

`0.586 min`

approximately **35.2 seconds** of free-flow walking.

This does not include:

- ticket/entry processing
- turnstile dwell
- queueing
- crowd congestion
- stopping/orientation time
- terrain penalties
- accessibility-specific travel effects

## Planner 14 integration

Planner 14 now delegates `durationAuthority` to Planner 19.

Current supported RouteEdge fields are:

- `routeNodes`
- `mode`
- `distance`
- `duration`

Current blocked RouteEdge fields remain:

- `difficulty`
- `stairs`
- `accessible`
- `stroller`
- `oneWay`
- `status`

## Integrity rules

Planner 19 fails closed if:

- walking speed changes
- rounding precision changes
- a minimum-duration floor appears
- pace adjustment is hidden in the base duration
- terrain/crowd/queue/access-control adjustments are hidden in the base duration
- a duration detaches from its Planner 13 distance record
- a derived duration changes without a policy/version change
- a current distance segment has no corresponding duration record
- Planner 14 no longer matches the exact Planner 19 duration

All exported policy and duration records are recursively frozen.

## What Planner 19 does not claim

Planner 19 does **not** claim:

- the Zoo publishes 1.2 m/s as a walking speed
- the Zoo publishes these exact segment durations
- guests always move at 1.2 m/s
- turnstile/queue time is zero in the real world
- crowding or accessibility needs have no effect on travel time

It only defines the deterministic base duration used by the current routing graph.

## Next boundary

After Planner 19, the remaining exact ingress RouteEdge fields are:

- `difficulty`
- `stairs`
- `accessible`
- `stroller`
- `oneWay`
- `status`

The strongest next candidate is **operational status authority** because the current entrance/turnstile evidence may support a prospective policy for whether a verified physical path is considered `open`, `closed`, or `conditional` in the absence of real-time closure data.
