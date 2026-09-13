# Planner 35 — Interior Stairs Authority

## Purpose

Planner 35 qualifies one additional RouteEdge semantic for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

The qualified value is:

- `stairs: false`

Planner 35 does **not** derive that value from a missing `highway=steps` tag, `mild` terrain, or a map simply failing to mention stairs. Planner 18's conservative absence-only rule remains intact.

## Review history

The first candidate relied partly on Front Street having no explicit stairs publication while Fern Canyon Trail was explicitly labeled with stairs. Codex correctly rejected that because one positive stairs label does not prove exhaustive stair labeling.

The second candidate removed that inference but jumped directly from Planner 33's product `accessible:true` result to federal ADA §402.2. Codex correctly identified the missing applicability premise: a Zoo map label alone had not established that the traversal was an accessible route to which §402.2 should be applied.

Planner 35 v3 makes that applicability premise explicit with a separate official Zoo-authored source.

## Positive evidence chain

### 1. Exact segment identity remains pinned

The complete version-pinned Planner 29 OSM snapshot keeps the exact source identity fixed:

- way `1481425058`
- `highway=pedestrian`
- `surface=asphalt`
- `name=Front Street`
- endpoints `7053320515 ↔ 1619736626`

These OSM facts are **identity context only**. They are not no-stairs authority.

### 2. Planner 33 already qualifies this exact segment as accessible

Planner 33 maps the exact-name-matched official Zoo accessibility evidence to `accessible:true` for this same exact segment. Its prerequisites include:

- exact source-way name: `Front Street`
- official accessibility source-way/corridor name: `Front Street`
- wheelchair indicator: `shown`
- official route legend: `ADA MOST ACCESSIBLE ROUTE`

Planner 35 does not independently re-promote the map corridor.

### 3. The official 2026 Zoo Accessibility Guide establishes route applicability

Planner 35 v3 freezes a separate source snapshot from the **San Diego Zoo Wildlife Alliance Accessibility Guide 2026**:

- source: `https://sdzwa.org/sdzwa-accessibility-guide`
- source authority: official Zoo accessibility guide
- the Zoo states that it is committed to compliance with the ADA and California access laws;
- the guide describes the Zoo accessibility map as providing information on **accessible routes** for guests with limited mobility;
- it says the blue dotted line on the Zoo accessibility map indicates the **best path of travel**;
- it directs mobility-device users to consult the accessibility map/app and signs to determine which areas are accessible.

This is the missing Zoo-authored applicability premise. Planner 35 no longer asks the `ADA MOST ACCESSIBLE ROUTE` legend to prove formal applicability by itself.

### 4. ADA Standards §402.2 supplies the route-component semantic

Planner 35 freezes the Department of Justice **2010 ADA Standards for Accessible Design**:

- source: `https://www.ada.gov/assets/pdfs/2010-design-standards.pdf`
- section: `402.2 Components`

Section 402.2 defines the permitted components of an accessible route through walking surfaces, doorways, ramps, curb ramps, elevators, and platform lifts. Stairs are not an accessible-route component.

Planner 35 v3 therefore adopts a narrow prospective product rule only after both prerequisites are present:

1. the Zoo itself establishes that its accessibility map is information for accessible routes / best path of travel in an ADA-compliance context; and
2. the exact Planner 33 Front Street traversal is the wheelchair-marked `ADA MOST ACCESSIBLE ROUTE` on that map.

The federal component definition then supplies the no-stairs semantic for the accessible traversal represented by the exact segment.

## Planner 18 remains conservative

Planner 35 explicitly freezes:

- `absenceOfHighwayStepsAlone: insufficient-for-stairs-false`
- `absenceOfHighwayStepsRole: non-authoritative-supporting-context-only`
- OSM identity role: `identity-context-only-not-no-stairs-authority`

The integrity boundary also re-runs Planner 18 `classifyExactStairsAuthority` on the current exact snapshot and requires it to remain blocked. If Planner 18 ever started inferring `stairs:false` from tag absence, Planner 35 would fail integrity.

## Policy boundary

`stairs:false` is supported only while all of these remain true:

1. the exact source way and endpoints remain the same Planner 29 / Planner 34 segment;
2. the exact OSM identity remains `pedestrian` / `asphalt` / `Front Street` as identity context only;
3. Planner 33 still qualifies this exact segment as `accessible:true`;
4. the accessibility source-way name remains `Front Street`;
5. the wheelchair indicator remains `shown`;
6. the map route legend remains `ADA MOST ACCESSIBLE ROUTE`;
7. the official 2026 Zoo Accessibility Guide remains the applicability source;
8. the guide evidence remains ADA-compliance context + accessible-routes map semantics + blue-dotted best-path semantics + mobility-device map instruction;
9. the downstream semantic authority remains DOJ ADA Standards §402.2;
10. Planner 18 remains blocked on absence-only stairs inference.

Any prerequisite drift fails closed.

## What Planner 35 does not claim

Planner 35 does not establish a general rule that:

- missing `highway=steps` means no stairs;
- every `highway=pedestrian` way is stair-free;
- asphalt implies no stairs;
- every `mild` Zoo corridor is stair-free;
- every wheelchair icon or `accessible:true` value automatically means `stairs:false`;
- the `ADA MOST ACCESSIBLE ROUTE` legend alone certifies §402 applicability;
- all parts of named Front Street inherit this exact-edge result.

The result is objective-only and exact-segment-only.

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
- wheelchair indicator or map legend drift;
- Zoo Accessibility Guide source or applicability-semantic drift;
- ADA Standards source, section, or component-semantic drift;
- promotion of absence-only evidence into authority;
- stroller or provenance promotion;
- hidden, inherited, symbol, accessor, unknown fields;
- decorated authority arrays.

## Next boundary

After Planner 35, only exact stroller suitability and final cross-semantic provenance remain before this exact Tiger Trail Front Street segment can be considered for RouteEdge materialization.

Planner 36 should use independent stroller evidence. The current Zoo policy allows strollers, and the current 2026 Accessibility Guide explicitly recognizes a stroller used as an accessibility device and can issue it a wheelchair tag. Facility permission alone must remain insufficient.