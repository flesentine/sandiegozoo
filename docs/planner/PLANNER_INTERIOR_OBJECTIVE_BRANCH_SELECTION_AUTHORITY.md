# Planner 27 — Objective-Scoped Front Street Branch Selection

## Purpose

Planner 27 resolves one narrow question left open by Planner 26:

> For a specific sourced visit objective, is there enough independent authority to choose one of the two adjacent Front Street branch candidates?

The answer is **yes for `sdz-tiger-trail` only**.

Planner 27 does **not** choose a global Front Street expansion endpoint, does not discard the other Planner 26 branch candidate, and does not materialize a `RouteNode` or `RouteEdge`.

## Qualified starting boundary

Planner 26 preserves the exact Front Street neighborhood around the existing ingress connection node:

`1619736626 → 7053320515 → 6239154982`

Both adjacent nodes have pedestrian branches:

- node `1619736626` connects to OSM way `148910139`, named **Treetops Way**
- node `6239154982` connects to OSM way `666404421`, unnamed footway

Planner 26 deliberately leaves `endpointSelection: "unresolved"` because a path name alone is not routing authority.

## Independent official objective authority

The official San Diego Zoo accessibility-map authority already records:

- corridor: `sdz-corridor-treetops-way`
- name: **Treetops Way**
- artifact: `sdz-map-2026-01-05-accessibility`
- relation: `access`
- source-backed objective: `sdz-tiger-trail`

The source-backed Zoo catalog independently defines `sdz-tiger-trail` as the Tiger Trail animal destination.

That relationship is strong enough to answer a narrower question:

> When the objective is specifically Tiger Trail, which of the two Planner 26 branch candidates enters the officially published corridor that provides access to Tiger Trail?

The answer is the Treetops Way candidate at node `1619736626` / connector way `148910139`.

## Scope rule

The selection is explicitly:

`selectionScope: "objective-only"`

It means:

- Tiger Trail may select the Treetops Way candidate.
- Koala, Gorilla, Panda, shows, transport, and unknown objectives do **not** inherit this decision.
- Planner 26 remains globally `endpointSelection: "unresolved"`.
- The unnamed branch remains preserved and may be valid for another objective.

Planner 27 therefore does not convert an objective-specific map relation into a global topology claim.

## Frozen authority

Planner 27 stores one authority record:

- authority ID: `sdz-interior-front-street-objective-branch-selection`
- objective: `sdz-tiger-trail`
- official map artifact: `sdz-map-2026-01-05-accessibility`
- map revision: `2026-01-05`
- map observation: `2026-09-07T21:53:00-07:00`
- official corridor: `sdz-corridor-treetops-way`
- relation: `access`
- Planner 26 geometry authority: `sdz-interior-front-street-adjacent-geometry`
- ingress connection node: `7053320515`
- selected candidate node: `1619736626`
- selected connector way: `148910139`
- selected connector name: `Treetops Way`
- selection scope: `objective-only`
- global endpoint selection: `unresolved`
- materialization: `objective-branch-selection-only`

## Integrity boundary

Runtime integrity requires all of the following to remain true:

1. the authority collection is an exact ordinary one-element array;
2. the authority record is an exact plain object with no hidden, symbol, inherited, accessor, or unknown fields;
3. `sdz-tiger-trail` still exists as the source-backed Tiger Trail animal destination;
4. the official accessibility-map artifact still matches the frozen revision and observation;
5. `sdz-corridor-treetops-way` still carries exactly the `access` relationship to `sdz-tiger-trail`;
6. Planner 26 still remains globally endpoint-unresolved;
7. Planner 26 still contains exactly one matching Treetops Way candidate with node `1619736626` and connector way `148910139`;
8. no RouteEdge or RouteNode semantics are smuggled into the authority record.

## What Planner 27 clears

For the **Tiger Trail objective only**, Planner 27 clears the objective-scoped branch-choice uncertainty.

It does not clear the global Planner 26 endpoint blocker.

## What remains blocked

Even after choosing the Tiger Trail branch, exact segment materialization remains blocked on:

1. exact segment mode;
2. exact segment distance;
3. exact duration;
4. exact difficulty;
5. exact stairs semantics;
6. exact accessibility;
7. exact stroller suitability;
8. exact pedestrian direction / `oneWay`;
9. exact operational status;
10. complete exact-segment provenance.

The official Treetops Way corridor's published walking minutes and terrain remain corridor-level context and are not exact segment weights.

## Fail-closed behavior

`objectiveScopedFrontStreetBranchSelectionFor()` performs exact objective-ID lookup.

`assessInteriorObjectiveBranchSelection()` returns a blocked result with `OBJECTIVE_BRANCH_AUTHORITY_NOT_SOURCED` for any objective without explicit branch authority.

This prevents the Tiger Trail decision from leaking into unrelated itinerary objectives.

## Next boundary

Planner 28 should qualify the exact Front Street segment from connection node `7053320515` to the Tiger Trail objective-selected candidate node `1619736626`.

The next safest step is exact distance derivation from Planner 26's independently version-pinned coordinates while keeping mode, duration, mobility, terrain, direction, and operational status separate until each has its own authority.
