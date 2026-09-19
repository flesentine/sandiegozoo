# Planner 48 — Treetops walking duration

Planner 48 derives a neutral free-flow walking duration for the exact Treetops segment after Planner 47 direction qualification.

## Frozen upstream segment

- Objective: `sdz-tiger-trail`
- OSM way: `148910139` v7
- From node: `1619736626`
- To node: `13588159626`
- Exact distance: `48.615 m` (Planner 46)
- Mode: `walk` (Planner 45)
- Direction: `bidirectional` static OSM baseline (Planner 47)

## Shared duration policy

Planner 48 reuses the existing generic free-flow walking-duration policy:

- policy: `sdz-walking-duration-policy-v1`
- scope: `free-flow-walk-edges`
- speed: `1.2 m/s`
- rounding: 3 decimal places
- minimum duration: none
- pace adjustment: none
- terrain adjustment: none
- queue adjustment: none
- access-control-delay adjustment: none
- crowd adjustment: none

## Derivation

`48.615 m / 1.2 m/s / 60 = 0.675208... min`

Rounded under the shared policy:

`0.675 min`

This is approximately 40.5 seconds.

## Scope

The duration is explicitly `neutral-free-flow`. It does not claim current crowding, terrain delay, queue delay, access-control delay, operational availability, or observed walking time.

Still blocked:

- difficulty
- stairs
- accessibility
- stroller suitability
- operational status

No RouteNode or RouteEdge is materialized here.
