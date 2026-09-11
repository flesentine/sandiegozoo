# Planner 29 — Interior Pedestrian Direction Authority

## Purpose

Planner 29 resolves one additional exact-segment semantic for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

It establishes a **static OSM baseline pedestrian direction** only:

- `oneWay: false`
- `direction: bidirectional`

Planner 29 does not resolve mode, duration, difficulty, stairs, accessibility, stroller suitability, operational status, or complete RouteEdge provenance.

## Why Planner 21 is not reused directly

Planner 21 already defines pedestrian-direction interpretation, but its frozen scope is explicitly:

`highway-pedestrian-ingress-ways`

The Planner 29 segment is an interior Front Street segment, not an ingress way. Reusing Planner 21 directly would silently widen a frozen authority boundary.

Planner 29 therefore defines a new prospective policy with scope:

`highway-pedestrian-interior-exact-segments`

The semantic references remain OpenStreetMap's direction semantics, but the policy identity and scope are independent.

## Exact OSM v1 source probe

Planner 29 queried the immutable exact version endpoint:

`https://api.openstreetmap.org/api/0.6/way/1481425058/1`

The returned way metadata was:

- way: `1481425058`
- version: `1`
- changeset: `178862584`
- timestamp: `2026-02-21T14:47:49Z`

The complete returned tag set was:

- `fee=yes`
- `foot=customers`
- `highway=pedestrian`
- `name=Front Street`
- `surface=asphalt`
- `tiger:cfcc=A51`
- `tiger:county=San Diego, CA`

Critically, the exact version contains neither:

- `oneway=*`
- `oneway:foot=*`

Planner 29 records those absences explicitly as `null` and freezes the complete source tag-key set so a later hidden or invented direction tag cannot be silently introduced.

## Semantic policy

OpenStreetMap's pedestrian-specific direction restriction is `oneway:foot=*`. Generic `oneway=*` is vehicle-oriented unless a pedestrian-specific restriction is explicitly present.

The Planner 29 interior policy freezes:

- pedestrian one-way authority: `explicit-oneway-foot-only`
- absent explicit pedestrian restriction: `bidirectional-by-default`
- generic one-way semantics: `vehicle-only-unless-explicit-foot-direction`
- authority class: `prospective-osm-interpretation-policy`

References:

- `https://wiki.openstreetmap.org/wiki/Restrictions`
- `https://wiki.openstreetmap.org/wiki/Key:oneway:foot`

## Exact segment linkage

Planner 29 is attached only to the exact Tiger Trail objective segment already qualified by Planner 28:

- objective: `sdz-tiger-trail`
- distance authority: `sdz-interior-tiger-trail-front-street-distance`
- source way: `1481425058`
- from node: `7053320515`
- to node: `1619736626`
- selection scope: `objective-only`
- global Front Street endpoint: still `unresolved`

The source-way node order is retained only as geometry. Because the direction result is bidirectional, source-way order is explicitly **not** direction authority.

## Static baseline, not live operational status

`directionScope: "static-osm-baseline"` is deliberate.

Planner 29 does not claim that temporary Zoo operations can never impose directional controls. Operational availability and temporary restrictions remain independently blocked until sourced by their own runtime/operational authority.

This prevents a static OSM interpretation from masquerading as current operational truth.

## Fail-closed integrity

Runtime integrity requires:

1. exact OSM way identity/version/version URL/timestamp/changeset;
2. the exact complete seven-key tag set;
3. explicit absence of `oneway` and `oneway:foot`;
4. exact continuity with Planner 26's Front Street geometry fields;
5. a new interior policy scope distinct from Planner 21's ingress scope;
6. exact semantic-reference URLs and policy wording;
7. exact linkage to Planner 28's Tiger-only segment;
8. `oneWay:false` and `bidirectional` only under the frozen source/policy prerequisites;
9. no mode, distance, duration, mobility, terrain, operational-status, RouteNode, or unrelated RouteEdge fields in the direction authority;
10. exact ordinary arrays and plain objects with hidden, symbol, inherited, accessor, and unknown aliases rejected.

## What Planner 29 clears

For the Tiger Trail objective-selected Front Street segment only, Planner 29 clears:

- `EXACT_SEGMENT_PEDESTRIAN_DIRECTION_NOT_SOURCED`

## What remains blocked

After Planner 29, these independent semantics remain unresolved:

1. exact mode;
2. exact duration;
3. exact difficulty;
4. exact stairs semantics;
5. exact accessibility;
6. exact stroller suitability;
7. exact operational status;
8. complete cross-semantic RouteEdge provenance.

## Next boundary

Planner 30 should qualify the next independent semantic without bundling unrelated evidence. **Walk mode** is the leading candidate because the exact source snapshot contains both `highway=pedestrian` and `foot=customers`, but access-class meaning (`customers`) and operational eligibility must remain separate from the transport-mode classification.
