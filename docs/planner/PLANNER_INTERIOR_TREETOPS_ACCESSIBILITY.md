# Planner 50 — Treetops accessibility

Planner 50 qualifies accessibility for the exact Treetops segment after Planner 49 difficulty.

## Official evidence

The San Diego Zoo's 2026 Resource Map for Guests with Disabilities lists **TREETOPS WAY** with:

- wheelchair-accessible indicator shown
- 7-minute walk
- access to Fern Canyon, Tiger, Orangutan, Hippo, and Monkey Trails
- Mild Terrain

The map legend identifies the dotted route as **ADA MOST ACCESSIBLE ROUTE**.

The repo's official map authority already freezes the same Treetops Way corridor name, accessibility-map artifact, 7-minute published walk, mild terrain, and Tiger Trail access relationship.

## Shared policy

Planner 50 reuses `sdz-interior-accessibility-policy-v1`:

- exact source-way name must equal the official corridor name
- wheelchair indicator must be shown
- map route legend must be `ADA MOST ACCESSIBLE ROUTE`
- supported planner value: `accessible=true`
- stairs and stroller remain independent

## Result

For OSM way `148910139` v7 from node `1619736626` to `13588159626`:

- `accessible = true`

Still blocked:

- stairs
- stroller suitability
- operational status

No RouteNode or RouteEdge is materialized here.
