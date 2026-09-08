# Planner 15 — Ingress Route-Node Authority

**Status:** source-backed ingress RouteNodes are materialized; RouteEdges remain blocked

Planner 15 closes one specific gap left by Planner 14:

**the ingress geometry now has production Planner `RouteNode` identities and a valid Planner `ZoneRecord`.**

It does not create RouteEdges.

## Scope

Planner 15 materializes the five source geometry nodes already qualified by Planners 12–13:

1. OSM node **7053320514** — explicit main entrance
2. OSM node **7053320517** — customer turnstile
3. OSM node **7053320516** — interior connection
4. OSM node **13587192693** — interior pedestrian junction
5. OSM node **7053320515** — Front Street connection

The explicit entrance becomes a Planner `RouteNode` with:

`kind: "entrance"`

The remaining geometry points become:

`kind: "junction"`

No transport, destination, accessibility, direction, or edge-status semantics are inferred.

## Conservative zone policy

Planner 1 requires every `RouteNode` to reference a valid `ZoneRecord`.

The current evidence does **not** justify claiming that every point in the ingress chain belongs to the named Front Street corridor. Only the terminal connection is explicitly tied to Front Street.

Planner 15 therefore uses one conservative top-level zone:

- ID: `sdz-zone-san-diego-zoo`
- name: **San Diego Zoo**

Its provenance is the official San Diego Zoo classic map, revision **2026-01-05**.

This is intentionally coarse. More specific zones can replace or subdivide it later when source-backed area membership is available.

## Route-node provenance

Each route node preserves the exact Planner 13 OSM source node:

- exact node URL
- exact latitude / longitude
- exact observation timestamp
- `confidence: "verified"`
- `effectiveFrom: "2026-09-07"`

Here, `verified` means the stored Planner record exactly preserves the already-qualified source object and topology. It is not a survey-accuracy claim.

## One-to-one binding

Planner 15 exports an explicit binding for every node:

- source geometry node ID
- OSM source object ID
- Planner route-node ID
- zone ID
- Planner node role

Integrity fails if any source node is omitted, duplicated, remapped, moved, reclassified, or given different provenance.

## Planner 1 contract validation

The Planner 15 zone + route-node slice is validated through the existing Planner 1 data validator.

It produces:

- **0 validation errors**
- expected `ORPHAN_ROUTE_NODE` warnings because RouteEdges are intentionally not materialized yet

Those warnings are expected at this phase boundary.

## Planner 14 promotion

Planner 14 previously reported:

`PLANNER_ROUTE_NODES_NOT_MATERIALIZED`

Planner 15 removes that blocker for the two audited ingress ways.

The semantic audit now supports:

- `routeNodes`
- `mode`
- `distance`

For OSM way **755054695**:

- from: main entrance RouteNode
- to: interior RouteNode

For OSM way **755054694**:

- from: interior RouteNode
- to: Front Street connection RouteNode

Intermediate geometry nodes remain materialized independently even though the current Planner 13 distance records cover the complete source-way polylines.

## What remains blocked

Planner 15 does not invent:

- duration
- difficulty
- stairs
- wheelchair accessibility
- stroller suitability
- pedestrian one-way semantics
- operational edge status

Therefore production `RouteEdge` materialization remains blocked with:

`ROUTE_EDGE_CONTRACT_INCOMPLETE`

## Integrity rules

The layer fails closed if:

- the official Zoo zone provenance changes
- a route node no longer matches its source geometry
- a source object maps to multiple Planner nodes
- the explicit entrance is not the only `entrance` node
- an interior node is promoted to another role
- source coordinates drift
- source provenance drifts
- a hidden RouteEdge field is injected by cast/deserialization
- Planner 14 endpoint authority drifts from Planner 15

All exported materialization is recursively frozen.

## Next boundary

The next clean step is to qualify one of the still-blocked RouteEdge semantic classes.

The highest-value candidates are:

1. pedestrian direction authority
2. accessibility / stroller authority
3. stairs / grade / difficulty authority
4. operational edge status
5. duration policy

Production RouteEdges should remain blocked until the full contract is defensible.
