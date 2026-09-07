# Planner 3 — Schedule / Time-Window Foundation

**Status:** implementation baseline

Planner 3 adds deterministic time semantics on top of Planner 2 routing. It still does not choose the all-day itinerary.

## Same-day planning horizon

A visit is represented as:

- visit date
- arrival minute
- departure minute
- total duration

Times are deterministic minutes from midnight on the visit date.

Overnight horizons are intentionally rejected. WildRoute Zoo visits are planned as same-day visits.

## Dwell duration

Flexible stops and schedule fallbacks use explicit positive integer dwell minutes.

Planner 3 never invents a duration for a show whose source record has no end time. A caller must provide an explicit activity dwell duration before that performance becomes schedulable.

## Stable schedule activity ID

Each performance record now carries:

`activityId`

This is the stable identity that groups multiple performances of the same presentation.

Display titles are not identity and are never used for grouping.

## Locked anchors

Reservations/booked experiences become immovable service intervals:

- fixed start minute
- explicit duration
- fixed end minute
- exact destination node

The planner may arrive early and wait. It may not move the reservation to make a route feasible.

## Show candidates

A source-dated schedule performance becomes a candidate with:

- stable event ID
- stable activity ID
- destination route node
- recommended arrival minute
- allowed arrival window from recommended arrival through event start
- fixed event start
- fixed service end
- source provenance

Multiple performances of one activity remain separate candidates. Choosing among them belongs to the optimizer.

## Anchor sequence feasibility

`evaluateAnchorSequence(...)` checks an already ordered anchor sequence.

For every anchor it:

1. starts from the previous anchor's fixed service end
2. asks Planner 2 for the constrained route
3. calculates raw arrival
4. waits until the arrival window if early
5. rejects arrival after the allowed window
6. preserves the fixed service interval
7. continues from the anchor destination

It returns exact route/travel/wait details for every step.

## Explicit failures

Planner 3 never silently shifts an anchor.

Failures distinguish:

- unknown initial route node
- duplicate anchor IDs
- structurally invalid anchors
- anchors outside the visit horizon
- overlapping/out-of-order anchors
- no route under the active routing constraints
- missed arrival window

## Scope boundary

Planner 3 does not yet:

- choose which animal stops fit
- choose the best show performance
- insert meals
- score Must-Sees/Favorites
- optimize ordering
- protect backup opportunities
- create the final day

It provides the deterministic feasibility primitives that Planner 4+ can search over.
