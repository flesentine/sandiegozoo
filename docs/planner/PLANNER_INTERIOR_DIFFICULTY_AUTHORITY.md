# Planner 32 — Interior Difficulty Authority

## Purpose

Planner 32 qualifies one additional semantic for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

The qualified Planner difficulty is:

- `difficulty: easy`

This is a product semantic interpretation of official terrain evidence under a deliberately narrow policy. Planner 32 does not materialize a RouteEdge or RouteNode and does not resolve stairs, accessibility, stroller suitability, operational status, or complete RouteEdge provenance.

## Why a new policy is required

Planner 18 intentionally keeps the Zoo accessibility map's terrain classes at named-corridor scope. In particular, Front Street is officially published as:

- corridor: `Front Street`
- terrain: `mild`

Planner 18 explicitly does not treat that corridor label as exact-edge Planner difficulty.

Planner 32 therefore does not simply promote the old evidence. It adds a prospective product semantic policy with a narrow applicability gate.

## Narrow policy

Planner 32 supports exactly one mapping:

- official published terrain `mild` → Planner difficulty `easy`

It does **not** define mappings for:

- `mild-to-steep`
- `steep`
- `steep-and-stairs`

Those remain blocked until separately policy-qualified.

The `mild → easy` rule is usable only when:

1. the exact route segment is already qualified on one source OSM way;
2. the exact OSM way name equals the official named corridor name;
3. both exact segment endpoints remain on that source way.

For the current Tiger Trail segment:

- exact source way: Front Street way `1481425058`
- exact source-way name from Planner 29: `Front Street`
- official corridor from Planner 18: `Front Street`
- official terrain: `mild`
- qualified endpoints: `7053320515 ↔ 1619736626`

Therefore the narrow policy resolves the exact segment to Planner `easy`.

## Stairs remain independent

Planner 32 does **not** infer `stairs: false` from `mild`.

Planner 18 already freezes the rule that exact stairs semantics require independent exact evidence, such as `OSM highway=steps` for `stairs: true`. Absence of that tag or a mild corridor label does not prove `stairs: false`.

Planner 32 therefore records:

- `stairsAuthorityState: independent-unresolved`

## Scope

The difficulty authority remains:

- objective: `sdz-tiger-trail`
- objective-only
- global Front Street endpoint unresolved
- operational eligibility unresolved
- `difficulty-only` materialization

Other objectives cannot inherit the Front Street `easy` result.

## What Planner 32 clears

For this exact objective-selected segment only, Planner 32 clears:

- `EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED`

## What remains blocked

1. exact stairs semantics;
2. exact accessibility;
3. exact stroller suitability;
4. exact operational status;
5. complete cross-semantic RouteEdge provenance.

## Integrity boundary

Runtime integrity requires:

1. exact linkage to Planner 31's exact segment;
2. exact Planner 29 source-way name evidence;
3. exact Planner 18 Front Street corridor terrain evidence;
4. exact source-way/corridor name identity;
5. policy mapping limited to `mild → easy`;
6. all other published terrain classes to fail closed;
7. stairs to remain independently unresolved;
8. objective-only scope and unresolved global endpoint;
9. rejection of hidden, symbol, inherited, accessor, unknown, and unrelated RouteEdge fields.

## Next boundary

Planner 33 should address the next independent semantic. Exact stairs remains blocked because the current source evidence can support neither `stairs: true` nor `stairs: false` for this exact segment. Accessibility or stroller semantics may be a more productive next boundary if a similarly explicit corridor-to-exact-segment policy can be justified without over-promoting corridor evidence.
