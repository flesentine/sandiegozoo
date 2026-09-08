# Planner 17 — Accessibility + Stroller Authority

**Status:** positive corridor/facility evidence captured; exact ingress RouteEdge mobility booleans remain blocked

Planner 17 isolates two related RouteEdge semantic classes:

- `accessible`
- `stroller`

The phase deliberately distinguishes **facility/corridor evidence** from **exact-edge authority**.

## Official accessibility evidence

The current official San Diego Zoo **Resource Map for Guests with Disabilities** is revision **V01.05.26 / 2026-01-05**.

The map:

- defines an **ADA MOST ACCESSIBLE ROUTE**
- marks **Front Street** with a wheelchair indicator in the Walking the Zoo legend
- describes Front Street as a 20-minute corridor with mild terrain
- separately depicts the accessible-route network on the map

Planner 17 freezes the Front Street wheelchair indicator as:

`corridor-accessibility-evidence-only`

This is positive evidence about the **named Front Street corridor**.

It is not automatically a statement about every OSM path that merely connects to Front Street.

## Exact ingress boundary

The current exact ingress geometry contains:

- OSM way 755054695 — controlled entrance passage
- OSM way 755054694 — interior continuation to the qualified Front Street connection node

Planner 12/13 topology proves that way 755054694 terminates at the Front Street connection.

However, the illustrated accessibility map is not georeferenced to those exact OSM way geometries.

Therefore:

### Way 755054695

`accessible` remains blocked:

`EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED`

### Way 755054694

The Front Street accessibility evidence is retained and linked, but `accessible` remains blocked:

`CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY`

That distinction matters. The second segment has stronger surrounding evidence, but not enough evidence to set an exact Planner RouteEdge boolean.

## Stroller authority

The current official **Guests with Disabilities** page states that the Zoo allows strollers, along with specified mobility assistive devices.

Planner 17 freezes that as:

- facility policy: `strollers allowed`
- scope: `facility-policy`
- route suitability: `not-established`

This means the policy can establish that stroller use is permitted at the Zoo.

It does **not** establish that every individual path segment is stroller-suitable.

Both ingress ways therefore keep `stroller` blocked with:

`FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY`

## Planner 14 integration

Planner 14 now delegates exact ingress mobility decisions to Planner 17.

Each RouteEdge semantic audit preserves:

### Accessibility

- exact Planner 17 blocked reason
- `basis: "Planner 17 accessibility authority"`
- Front Street corridor evidence ID when relevant

### Stroller

- exact Planner 17 blocked reason
- `basis: "Planner 17 stroller authority"`
- exact official stroller policy evidence ID

The general RouteEdge audit no longer owns accessibility/stroller interpretation itself.

## Integrity rules

Planner 17 fails closed if:

- the official accessibility-map artifact disappears or changes identity
- Front Street corridor identity/artifact linkage drifts
- the accessibility evidence observation timestamp diverges from Planner 10 map authority
- wheelchair evidence is strengthened from named-corridor scope into exact-edge scope
- the official stroller source is no longer the Zoo source
- stroller facility permission is promoted into route suitability
- the stroller observation timestamp is malformed or predates the current map evidence
- the Front Street ingress connection stops matching Planner 12/13 topology
- Planner 14 stops matching the exact Planner 17 mobility assessment

All exported authority is recursively frozen.

## What Planner 17 does not claim

Planner 17 does **not** claim:

- wheelchair accessibility for either exact ingress RouteEdge
- stroller suitability for either exact ingress RouteEdge
- that every path shown near Front Street belongs to the ADA most accessible route
- that wheelchair corridor indicators imply stroller suitability
- that facility-wide stroller permission implies stair-free or grade-suitable routing

## Next boundary

The next useful semantic class is **stairs + difficulty authority**.

The same official accessibility map publishes corridor terrain and explicitly identifies **Fern Canyon Trail** as steep terrain and stairs.

The challenge is the same as Planner 17: determine when corridor-level terrain can be defensibly attached to exact route geometry without manufacturing exactness.
