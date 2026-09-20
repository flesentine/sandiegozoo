# Planner 52 — Treetops stairs evidence audit

Planner 52 audits stairs evidence for the exact Treetops segment on top of Planner 51.

## Evidence boundary

The exact OSM v7 Treetops source says:

- `highway=footway`
- `surface=concrete`
- no `highway=steps`

The official accessibility map also gives:

- Treetops Way terrain: `mild`
- wheelchair-accessible route indicator shown

None of those facts establishes `stairs=false`.

The existing conservative stairs policy requires explicit exact-route stair-free evidence or an exact ADA 402 binding before declaring a segment stair-free.

## Result

For way `148910139` v7 from node `1619736626` to `13588159626`:

- stairs evidence: unresolved
- planner stairs value: `unknown`
- blocker: `EXACT_SEGMENT_STAIRS_NOT_SOURCED`

This is deliberate. Absence of `highway=steps`, concrete surface, mild terrain, and wheelchair accessibility are all insufficient to infer a no-stairs fact.

Stroller suitability remains separately unresolved.
