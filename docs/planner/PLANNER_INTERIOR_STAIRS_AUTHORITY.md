# Planner 35 — Interior Stairs Authority

## Purpose

Planner 35 qualifies one additional RouteEdge semantic for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

The qualified value is:

- `stairs: false`

Planner 35 does **not** derive that value from a missing `highway=steps` tag or from the Zoo map merely failing to publish stairs. Planner 18's conservative rule remains intact: absence alone is insufficient.

## Positive evidence chain

Planner 35 v2 uses a different, positive semantic chain.

### 1. Exact segment identity remains pinned

The complete version-pinned Planner 29 OSM snapshot keeps the exact source identity fixed:

- way `1481425058`
- `highway=pedestrian`
- `surface=asphalt`
- `name=Front Street`
- endpoints `7053320515 ↔ 1619736626`

These OSM facts are **identity context only**. Planner 35 explicitly does not treat `pedestrian`, `asphalt`, or the absence of `highway=steps` as no-stairs authority.

### 2. Planner 33 already qualifies this exact segment as accessible

Planner 33 maps the exact-name-matched official Zoo accessibility evidence to `accessible:true` for this same exact segment. Its prerequisites include:

- exact source-way name: `Front Street`
- official accessibility source-way/corridor name: `Front Street`
- wheelchair indicator: `shown`
- official route legend: `ADA MOST ACCESSIBLE ROUTE`

Planner 35 does not independently promote the Zoo's corridor data. It requires the already-qualified exact Planner 33 accessibility result.

### 3. ADA Standards §402.2 supplies the stairs semantic

Planner 35 freezes the Department of Justice **2010 ADA Standards for Accessible Design** as semantic authority:

- source: `https://www.ada.gov/assets/pdfs/2010-design-standards.pdf`
- section: `402.2 Components`

Section 402.2 defines accessible-route components as walking surfaces, doorways, ramps, curb ramps, elevators, and platform lifts. Stairs are not an accessible-route component.

Planner 35 therefore adopts the narrow prospective product rule:

> when this exact segment has already been qualified by Planner 33 as the Zoo's wheelchair-marked `ADA MOST ACCESSIBLE ROUTE`, the accessible traversal represented by that exact segment does not require stairs.

That is the positive semantic basis for `stairs:false`.

## What changed after review

The first Planner 35 candidate also relied on a comparison between Front Street's `mild` terrain row and Fern Canyon Trail's explicit `Steep Terrain and Stairs` row. Codex correctly identified that as insufficient: one explicit stairs label does not prove that every stair-bearing corridor is exhaustively labeled.

Planner 35 v2 removes that inference completely. Terrain non-publication and the Fern Canyon contrast are no longer prerequisites or authority.

## Policy boundary

`stairs:false` is supported only while all of these remain true:

1. the exact source way and endpoints remain the same Planner 29 / Planner 34 segment;
2. the exact OSM identity remains `pedestrian` / `asphalt` / `Front Street`;
3. Planner 33 still qualifies this exact segment as `accessible:true`;
4. the exact accessibility source-way name remains `Front Street`;
5. the wheelchair indicator remains `shown`;
6. the official route legend remains `ADA MOST ACCESSIBLE ROUTE`;
7. the semantic authority remains the DOJ ADA Standards §402.2 accessible-route component definition;
8. Planner 18 still treats absence of `highway=steps` alone as insufficient.

Any prerequisite drift fails closed.

## What Planner 35 does not claim

Planner 35 does not establish a general rule that:

- missing `highway=steps` means no stairs;
- every `highway=pedestrian` way is stair-free;
- asphalt implies no stairs;
- every `mild` Zoo corridor is stair-free;
- every wheelchair-related map symbol automatically means `stairs:false`;
- all parts of named Front Street inherit this exact-edge result.

The result is objective-only and exact-segment-only, and depends on the prior exact Planner 33 accessibility qualification plus the ADA accessible-route semantic definition.

## What Planner 35 clears

Planner 35 clears only:

- `EXACT_SEGMENT_STAIRS_NOT_SOURCED`

## What remains blocked

1. `EXACT_SEGMENT_STROLLER_NOT_SOURCED`
2. `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`

No RouteEdge or RouteNode is materialized yet.

## Integrity boundary

Planner 35 fails closed on:

- unsupported objectives;
- exact way/endpoint drift;
- Planner 29 source identity drift;
- loss of Planner 33 exact accessibility authority;
- source-way/accessibility-name mismatch;
- wheelchair indicator or ADA route legend drift;
- ADA source URL or section drift;
- weakening the accessible-route no-stairs semantic;
- promotion of absence-only evidence into authority;
- stroller or provenance promotion;
- hidden, inherited, symbol, accessor, unknown fields;
- decorated authority arrays.

## Next boundary

After Planner 35, only exact stroller suitability and final cross-semantic provenance remain before this exact Tiger Trail Front Street segment can be considered for RouteEdge materialization.

Planner 36 should inspect whether facility stroller permission plus the already-qualified exact accessible, non-stair traversal is enough for a narrow stroller-suitability policy. Facility permission alone must remain insufficient.
