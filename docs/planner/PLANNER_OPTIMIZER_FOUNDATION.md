# Planner 5 — Deterministic Itinerary Optimizer Foundation

**Status:** exhaustive reference optimizer

Planner 5 composes the Planner 2 routing engine, Planner 3 time-window semantics, and Planner 4 authority/preference policy into the first end-to-end itinerary search.

This is deliberately an **exact bounded oracle**, not the eventual production-scale search algorithm.

## Why exhaustive first

Before adding heuristics, pruning, caching, or approximation, WildRoute needs a small-input implementation whose answer is definitionally the best feasible answer under the frozen policy.

Planner 5 therefore enumerates every feasible candidate order and every schedule alternative for up to:

**8 candidate records**

If the input is larger, it returns `search-limit-exceeded` rather than silently switching to an approximation.

A later scalable optimizer can be tested against this oracle on small cases.

## Selection keys

Every optimizer candidate has:

- unique candidate ID
- stable `selectionKey`
- route node
- Planner 4 authority/timing/priority
- dwell duration
- optional Planner 3 anchor

`selectionKey` identifies the user's logical request.

Examples:

- Panda Must-See: one candidate, selection key `panda`
- Wildlife Wonders Must: three performance candidates, all selection key `wildlife-wonders`
- booked tour: one locked candidate, selection key `tour-reservation`

At most one candidate is selected per key.

For locked / required / protected keys, exactly one candidate must be selected.

Optional keys may be omitted.

## Alternative consistency

Candidates sharing a selection key must share:

- authority
- timing
- preference priority

Locked groups must have exactly one candidate.

Timed candidates must carry a valid Planner 3 anchor at the same node, and their scoring dwell duration must match the anchor's fixed service duration.

Flexible candidates may not carry an anchor.

## Search order

The optimizer performs two passes.

### 1. Mandatory feasibility

It first searches only:

- locked
- required
- protected

If no itinerary satisfies every mandatory selection key, optimization stops with:

`tradeoff-required / MANDATORY_SET_INFEASIBLE`

Optional candidates never get a chance to displace mandatory work.

The result also identifies mandatory selection keys whose removal individually restores feasibility when such a single-key relief exists.

### 2. Optional optimization

Only after mandatory feasibility is proven does the optimizer search the complete candidate set.

Planner 4 lexicographic utility determines the winning feasible plan:

1. Must tier
2. Favorite tier
3. Bonus tier

Within a tier, soft easier-path utility applies.

Ties then prefer:

1. less total travel time
2. less total travel distance
3. earlier finish
4. stable lexical candidate-order signature

Input array order is not authority and does not determine the winner.

## Scheduling

Every transition uses Planner 2's fastest route under the active hard route constraints.

Planner 4 between-stop pace buffer is applied after the first selected stop.

Flexible candidates:
- begin after route + buffer
- use pace-adjusted dwell
- must finish inside the visit horizon

Timed candidates:
- preserve Planner 3 fixed/windowed service times
- use their arrival window
- never have service duration pace-adjusted
- fail when route + buffer misses the window

## Exit node

The request may provide an `endNodeId`.

When present, a candidate itinerary is feasible only if the visitor can route from the final stop to that node and arrive by visit departure.

This lets later product integration model “back to the entrance by 5:00” rather than merely “finish the last exhibit by 5:00.”

## Optional omission explanations

For an omitted optional selection key, Planner 5 distinguishes:

- OUTSIDE_HORIZON
- NO_ROUTE
- ANCHOR_CONFLICT
- INSUFFICIENT_TIME
- LOWER_PRIORITY_ALTERNATIVE

Unused performance records inside a selected selection key are reported separately as unselected alternatives; they are not treated as dropped user requests.

## Scope boundary

Planner 5 does not yet:

- scale beyond the exact 8-record oracle
- add meal/rest candidate generation
- choose alternate graph paths specifically for easier-path scoring
- use live Zoo production data
- adapt an itinerary during the visit
- cache pairwise route matrices
- use branch-and-bound or dynamic programming

Those optimizations must preserve this oracle's decisions on bounded test cases.


## Baseline feasibility

Before candidate authority is considered, Planner 5 validates the empty itinerary against an optional required `endNodeId`.

If the visitor cannot reach the required end node at all, the result is:

`infeasible / END_NODE_UNREACHABLE`

If the route exists but cannot reach the end node before visit departure:

`infeasible / END_NODE_AFTER_HORIZON`

These are baseline trip constraints, not reasons to sacrifice a Must-See or reservation.

## Runtime schedule boundary

Planner 3's exported horizon/anchor validators now accept untrusted runtime values and fail closed.

Schedule minutes must be whole integers. Malformed anchor objects and fractional-minute anchors are rejected before optimizer search.

Planner 5 also validates score context even for an empty candidate set, so invalid pace/easier-path state cannot bypass validation merely because there is nothing to score.
