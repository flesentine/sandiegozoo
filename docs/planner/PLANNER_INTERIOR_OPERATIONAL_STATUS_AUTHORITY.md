# Planner 34 — Interior Operational Status Authority

## Purpose

Planner 34 qualifies one additional RouteEdge semantic for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

The qualified static RouteEdge status is:

- `status: conditional`

Planner 34 does **not** claim that the segment is currently open. Runtime activation is required before a future materialized conditional RouteEdge may be enabled.

## Why `conditional` is the only defensible static value

Planner 20 freezes Zoo-wide operational facts:

- the Zoo is open every day;
- hours vary through the year;
- changes or closures may occur without notice;
- daily closure advisement is available at the main entrance.

Those facts are enough to establish that exact walking edges cannot safely be treated as permanently `open`.

Planner 34 therefore adopts a conservative exact-interior policy:

- static planner status: `conditional`;
- runtime activation required;
- current Zoo-local date required;
- affirmative current Zoo-hours evidence required;
- affirmative current exact-segment availability required.

## Important ingress/interior separation

Planner 24 uses `NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT` because the relevant source is a main-entrance closure advisement and the qualified edges are ingress edges.

That evidence is **not** exact interior Front Street authority.

Planner 34 therefore freezes:

- ingress closure advisement source: `main-entrance`;
- applicability to this exact interior segment: `not-interior-segment-authority`.

A clear main-entrance advisement cannot activate the interior segment and is not accepted as a field in the interior runtime snapshot.

## Exact segment binding

Planner 34 remains attached to Planner 33's exact accessibility-qualified segment:

- objective: `sdz-tiger-trail`;
- OSM way: `1481425058`;
- way name: `Front Street`;
- from node: `7053320515`;
- to node: `1619736626`.

Planner 34 does not change the global Front Street endpoint decision. The authority remains objective-only.

## Runtime evidence contract

For the supported Tiger Trail objective, the resolver accepts only:

1. `visitDate`;
2. current Zoo-hours evidence;
3. zero or one exact-segment availability record for the qualified segment.

### Zoo-hours evidence

Required fields:

- stable `evidenceId`;
- status `inside | outside | unknown`;
- `validForDate`;
- timezone-qualified `observedAt`;
- timezone-qualified `expiresAt`.

### Exact-segment availability evidence

Required identity:

- objective `sdz-tiger-trail`;
- way `1481425058`;
- from node `7053320515`;
- to node `1619736626`.

Availability status is:

- `available | unavailable | unknown`.

Evidence for another segment is rejected instead of being ignored.

## Resolver-owned time

The runtime resolver owns the evaluation instant via `Date.now()` and resolves the current operational date in `America/Los_Angeles` through the existing Planner 24 Zoo-date helper.

Callers cannot supply or replay an `evaluatedAt` field.

The runtime decision is enabled only when all of the following are true:

1. `visitDate` equals the current San Diego Zoo local date;
2. Zoo-hours status is `inside`;
3. Zoo-hours evidence is currently valid for that date;
4. exact-segment evidence exists;
5. exact-segment status is `available`;
6. exact-segment evidence is currently valid for that date.

Otherwise the conditional segment remains disabled.

## What Planner 34 clears

For this exact objective-selected segment only, Planner 34 clears:

- `EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED`.

The sourced static status is `conditional`; current runtime eligibility remains an evaluation result, not a permanent source fact.

## What remains blocked

Planner 34 intentionally leaves three RouteEdge contract items unresolved:

1. `EXACT_SEGMENT_STAIRS_NOT_SOURCED`;
2. `EXACT_SEGMENT_STROLLER_NOT_SOURCED`;
3. `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`.

The segment is therefore still **not** materialized as a RouteEdge.

## Integrity boundary

Planner 34 fails closed on:

- unsupported objectives;
- source-way or endpoint drift;
- promotion from `conditional` to `open`;
- ingress closure-advisement smuggling;
- caller-supplied replay timestamps;
- malformed calendar dates or timestamps;
- expired, future, or wrong-date evidence;
- unknown exact-segment identity;
- duplicate exact-segment evidence;
- hidden, inherited, symbol, accessor, unknown fields;
- decorated evidence or authority arrays;
- unrelated RouteEdge or RouteNode semantic promotion.

## Next boundary

After Planner 34, only stairs, stroller suitability, and final cross-semantic provenance remain before the exact Tiger Trail Front Street segment can be considered for RouteEdge materialization.

Planner 35 should inspect whether the current exact OSM/official evidence can responsibly resolve stairs. Accessibility must not be used as a shortcut to infer `stairs:false`.
