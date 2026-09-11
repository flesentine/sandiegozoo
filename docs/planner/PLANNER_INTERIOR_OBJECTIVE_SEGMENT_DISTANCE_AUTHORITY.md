# Planner 28 — Objective-Selected Front Street Segment Distance

## Purpose

Planner 28 derives one exact geometric quantity for the Tiger Trail objective-selected branch from Planner 27:

`7053320515 → 1619736626`

The result is **7.157 meters** using the same neutral geodesic policy already used by Planner 13:

- haversine segment sum
- Earth radius: `6,371,000 m`
- rounding: 3 decimal places
- no survey-accuracy claim

Planner 28 is distance-only authority. It does not materialize a RouteEdge or RouteNode and does not infer duration, walking mode, pedestrian direction, mobility, terrain difficulty, stairs, or operational status.

## Qualified starting boundary

Planner 26 independently version-pinned both coordinates:

- Front Street connection node `7053320515`
  - version `1`
  - exact version URL `https://api.openstreetmap.org/api/0.6/node/7053320515/1`
  - timestamp `2019-12-13T00:23:10Z`
  - changeset `78341336`
  - coordinate `32.7351404,-117.1496117`
- Treetops candidate node `1619736626`
  - version `2`
  - exact version URL `https://api.openstreetmap.org/api/0.6/node/1619736626/2`
  - timestamp `2013-12-23T19:47:46Z`
  - changeset `19606502`
  - coordinate `32.735201,-117.1496375`

Both nodes occur on Front Street OSM way `1481425058`, pinned by Planner 26 to version `1`.

Planner 27 then selected node `1619736626` only for objective `sdz-tiger-trail`, because the official accessibility-map authority records Treetops Way as providing `access` to Tiger Trail. Planner 27 keeps the global Front Street endpoint unresolved.

## Derivation

For each source coordinate pair Planner 28 computes:

`2 * R * asin(sqrt(h))`

where `R = 6,371,000 m` and `h` is the standard haversine term.

The unrounded geodesic result is approximately `7.1574948 m`; Planner policy rounds it to:

**`7.157 m`**

This is reproducible geometry-derived distance, not a survey measurement and not a published Zoo walking distance.

## Frozen authority

Planner 28 records:

- authority ID: `sdz-interior-tiger-trail-front-street-distance`
- objective: `sdz-tiger-trail`
- Planner 27 branch authority: `sdz-interior-front-street-objective-branch-selection`
- Planner 26 geometry authority: `sdz-interior-front-street-adjacent-geometry`
- source Front Street way: `1481425058`, version `1`
- source from node: `7053320515`, version `1`
- source to node: `1619736626`, version `2`
- source node sequence: `[7053320515, 1619736626]`
- distance: `7.157 m`
- derivation: `haversine-segment-sum`
- Earth radius: `6,371,000 m`
- rounding: 3 decimals
- accuracy claim: `no-survey-accuracy-claim`
- scope: `objective-only`
- global endpoint: `unresolved`
- materialization: `distance-only`

## Integrity boundary

Runtime integrity requires:

1. an exact ordinary one-element authority array;
2. an exact plain authority record with no hidden, symbol, inherited, accessor, or unknown fields;
3. an exact ordinary two-node source sequence;
4. exact linkage to Planner 27's Tiger Trail branch selection;
5. Planner 27 to remain objective-only and globally endpoint-unresolved;
6. exact linkage to Planner 26's source way and version-pinned nodes;
7. exact node version URLs, timestamps, and changesets;
8. deterministic re-derivation of `7.157 m` from Planner 26 coordinates;
9. rejection of RouteEdge/RouteNode semantics not owned by Planner 28.

## Scope and fail-closed behavior

The distance is available only for `sdz-tiger-trail`.

Other objective IDs return `OBJECTIVE_SEGMENT_DISTANCE_NOT_SOURCED`; they do not inherit the Tiger Trail distance simply because they could eventually traverse the same physical area.

Planner 26 remains globally `endpointSelection: "unresolved"`. Planner 28 does not turn the Tiger-specific branch choice into a global topology decision.

## What Planner 28 clears

For this Tiger Trail objective-selected segment only, Planner 28 clears:

- `EXACT_SEGMENT_DISTANCE_NOT_SOURCED`

## What remains blocked

The exact segment is still not materializable as a complete RouteEdge because these independent semantics remain unresolved:

1. exact mode;
2. exact duration;
3. exact difficulty;
4. exact stairs semantics;
5. exact accessibility;
6. exact stroller suitability;
7. exact pedestrian direction / `oneWay`;
8. exact operational status;
9. complete RouteEdge provenance across all required semantics.

In particular, the official Treetops Way 7-minute corridor summary must not be used as the duration of this 7.157-meter Front Street segment.

## Next boundary

Planner 29 should qualify the next independent exact-segment semantic. Pedestrian mode/direction is the leading candidate, but Planner 21 cannot simply be reused: its frozen scope is explicitly `highway-pedestrian-ingress-ways`. Planner 29 must first source the exact Front Street direction-related tags and define a deliberate interior-segment policy/authority boundary before resolving pedestrian direction. Duration, mobility, terrain, and operational status remain independent.
