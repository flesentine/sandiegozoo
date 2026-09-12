# Planner 35 — Interior Stairs Authority

## Purpose

Planner 35 qualifies one additional RouteEdge semantic for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

The qualified value is:

- `stairs: false`

This does **not** come from the absence of `highway=steps` alone. Planner 18's conservative rule remains intact: missing step tags by themselves are insufficient to establish `stairs:false`.

## Evidence conjunction

Planner 35 adopts a new prospective product semantic policy only for an unusually narrow conjunction of already-qualified evidence.

### 1. Positive exact OSM classification

The complete version-pinned Planner 29 snapshot for OSM way `1481425058` positively classifies Front Street as:

- `highway=pedestrian`
- `surface=asphalt`
- `name=Front Street`

This is positive feature classification, not inference from a missing tag.

### 2. Exact-name wheelchair-route evidence

Planner 33 has already qualified this exact segment as `accessible:true` only because the exact OSM way name and official accessibility corridor name are both `Front Street`, with:

- wheelchair indicator: `shown`
- route legend: `ADA MOST ACCESSIBLE ROUTE`

Planner 35 requires that prior exact-segment result rather than independently promoting corridor accessibility.

### 3. Controlled stairs vocabulary on the same official map

Planner 18 freezes the official accessibility map's walking-corridor terrain vocabulary.

For Front Street the same official map publishes:

- terrain: `mild`
- stairs evidence: `not-explicitly-published`

Critically, the same artifact also publishes Fern Canyon Trail as:

- terrain: `steep-and-stairs`
- stairs evidence: `explicitly-published`

That controlled contrast establishes that the map has an explicit mechanism for identifying stair-bearing walking corridors. Planner 35 requires this contrast to remain present on the same official artifact.

## Policy boundary

`stairs:false` is supported only when all of the following remain true:

1. exact source way is positively `highway=pedestrian`;
2. exact source way surface is `asphalt`;
3. exact source-way name equals the official corridor name;
4. the exact segment already has qualified `accessible:true` wheelchair-route evidence;
5. Front Street remains published as `mild` with no explicit stairs notation;
6. the same official map continues to contain a known stair-bearing corridor using the explicit `steep-and-stairs` / `explicitly-published` vocabulary.

If any prerequisite changes, Planner 35 fails closed.

## What Planner 35 does not claim

Planner 35 does not establish a general rule that:

- missing `highway=steps` means no stairs;
- every `highway=pedestrian` way is stair-free;
- every mild corridor is stair-free;
- wheelchair accessibility alone implies `stairs:false`;
- all parts of the named Front Street corridor inherit exact-edge semantics.

The result is limited to this already-qualified exact objective-selected segment and this evidence conjunction.

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
- source snapshot drift away from `pedestrian` / `asphalt` / `Front Street`;
- loss of exact accessibility authority;
- OSM/corridor name mismatch;
- Front Street terrain drift;
- loss of the official stair-bearing contrast corridor;
- promotion of absence-only evidence into authority;
- stroller or provenance promotion;
- hidden, symbol, inherited, accessor, unknown fields;
- decorated authority arrays.

## Next boundary

After Planner 35, only exact stroller suitability and final cross-semantic provenance remain before this exact Tiger Trail Front Street segment can be considered for RouteEdge materialization.

Planner 36 should inspect whether the combination of facility stroller permission and the now-qualified exact wheelchair-accessible, non-stair segment is sufficient for a narrow stroller-suitability policy. Facility-level stroller permission alone must remain insufficient.
