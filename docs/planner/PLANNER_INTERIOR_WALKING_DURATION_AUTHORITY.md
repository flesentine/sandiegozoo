# Planner 31 — Interior Walking Duration Authority

## Purpose

Planner 31 qualifies one additional semantic for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

The qualified duration is a **neutral free-flow walking duration** only.

Planner 31 does not materialize a RouteEdge or RouteNode and does not resolve terrain difficulty, stairs, accessibility, stroller suitability, operational status, crowd delay, queue delay, access-control delay, or complete RouteEdge provenance.

## Reused Planner 19 policy

Planner 19's file is ingress-oriented, but the frozen policy itself is deliberately generic:

- policy ID: `sdz-walking-duration-policy-v1`
- scope: `free-flow-walk-edges`
- speed: `1.2 m/s`
- rounding: 3 decimal places in minutes
- minimum duration: none
- pace adjustment: none
- terrain adjustment: none
- queue adjustment: none
- access-control delay adjustment: none
- crowd adjustment: none

Because the policy is scoped to free-flow walk edges rather than ingress, Planner 31 reuses it directly instead of inventing a second interior walking speed.

## Exact derivation

Planner 28 qualified the exact segment distance as:

- `7.157 m`

Planner 30 qualified the exact segment mode as:

- `walk`

Planner 31 applies the shared policy formula:

`distance / 1.2 m/s / 60`

The unrounded result is approximately `0.0994028 minutes` (`5.964 seconds`).

Planner 19 policy rounds to three decimal places:

**`0.099 minutes`**

There is no artificial one-minute floor.

## Scope

The duration remains:

- objective: `sdz-tiger-trail`
- objective-only
- global Front Street endpoint unresolved
- neutral free-flow only
- operational eligibility unresolved

It is not a prediction of crowded, queued, terrain-adjusted, or access-control-delayed travel time.

## What Planner 31 clears

For this exact objective-selected segment only, Planner 31 clears:

- `EXACT_SEGMENT_DURATION_NOT_SOURCED`

## What remains blocked

1. exact difficulty;
2. exact stairs semantics;
3. exact accessibility;
4. exact stroller suitability;
5. exact operational status;
6. complete cross-semantic RouteEdge provenance.

## Integrity boundary

Runtime integrity requires:

1. exact linkage to Planner 28 distance authority;
2. exact linkage to Planner 30 walk-mode authority;
3. the shared Planner 19 policy to remain `free-flow-walk-edges` at `1.2 m/s` with 3-decimal rounding and no adjustments;
4. deterministic reproduction of `0.099 minutes` from `7.157 m`;
5. exact objective/way/endpoints;
6. operational eligibility to remain unresolved;
7. no unrelated RouteEdge/RouteNode semantic smuggling;
8. exact plain-object and ordinary-array runtime shapes.

## Next boundary

Planner 32 should qualify the next independent exact-segment semantic. Terrain/difficulty and stairs remain intentionally separate: the official Front Street corridor's `mild` terrain is corridor-level evidence and must not automatically become exact-segment Planner difficulty without an explicit semantic policy.
