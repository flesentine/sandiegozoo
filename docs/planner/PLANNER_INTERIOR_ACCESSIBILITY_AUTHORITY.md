# Planner 33 — Interior Accessibility Authority

## Purpose

Planner 33 qualifies one additional semantic for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

The qualified Planner accessibility value is:

- `accessible: true`

This is a deliberately narrow product semantic interpretation of official wheelchair-route evidence. Planner 33 does not materialize a RouteEdge or RouteNode and does not resolve stairs, stroller suitability, operational status, or complete RouteEdge provenance.

## Official evidence boundary

Planner 17 freezes official San Diego Zoo accessibility-map evidence for the named Front Street corridor:

- corridor: `Front Street`
- wheelchair indicator: `shown`
- map route legend: `ADA MOST ACCESSIBLE ROUTE`
- scope: `named-corridor`
- materialization: `corridor-accessibility-evidence-only`

Planner 17 correctly refuses direct exact-edge promotion. Planner 33 adds an explicit prospective product semantic policy rather than weakening that source record.

## Narrow projection policy

The corridor evidence may resolve Planner `accessible: true` only when:

1. the exact segment is already qualified on one OSM source way;
2. that exact source way has a qualified exact name;
3. the exact OSM way name equals the official named accessibility corridor name;
4. the exact segment endpoints remain on that source way;
5. the official corridor evidence contains both the wheelchair indicator and the `ADA MOST ACCESSIBLE ROUTE` legend.

For the current exact segment:

- source way `1481425058`
- source way name `Front Street`
- official accessibility corridor `Front Street`
- from node `7053320515`
- to node `1619736626`
- wheelchair indicator `shown`
- official route legend `ADA MOST ACCESSIBLE ROUTE`

The narrow policy therefore resolves `accessible: true` for this exact segment.

## Stroller remains independent

The official Zoo stroller evidence says strollers are allowed at facility level, but Planner 17 explicitly records:

- scope: `facility-policy`
- stroller policy: `allowed`
- route suitability authority: `not-established`

Planner 33 does not convert that into `stroller: true` for this route segment.

The authority therefore records:

- `strollerAuthorityState: facility-permission-not-route-suitability`

## Stairs remain independent

Wheelchair accessibility does not cause Planner 33 to invent a stairs value. Exact stairs semantics remain independently unresolved under the existing Planner 18 boundary.

The authority records:

- `stairsAuthorityState: independent-unresolved`

## Scope

Planner 33 remains:

- objective-only for `sdz-tiger-trail`
- globally Front Street endpoint-unresolved
- operationally unresolved
- `accessibility-only` materialization

Other objectives cannot inherit this accessibility result.

## What Planner 33 clears

For this exact objective-selected segment only, Planner 33 clears:

- `EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED`

## What remains blocked

1. exact stairs semantics;
2. exact stroller suitability;
3. exact operational status;
4. complete cross-semantic RouteEdge provenance.

## Integrity boundary

Runtime integrity requires:

1. exact linkage to Planner 32's exact segment;
2. exact linkage to Planner 17 official Front Street wheelchair evidence;
3. exact source-way/corridor name identity;
4. both the official wheelchair indicator and ADA route legend;
5. stroller facility permission to remain non-route-authoritative;
6. stairs to remain independently unresolved;
7. objective-only scope and unresolved global endpoint;
8. rejection of hidden, symbol, inherited, accessor, unknown, and unrelated RouteEdge fields.

## Next boundary

Planner 34 should not promote stroller suitability from the existing facility-level permission. Exact stairs is also still unresolved. The most productive remaining semantic is likely exact operational status, but that requires an explicit runtime evidence strategy for interior segments rather than reusing ingress activation blindly.
