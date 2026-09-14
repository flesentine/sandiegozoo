# Planner 42 — Treetops Way geometry evidence gate

Planner 42 advances the Tiger Trail interior expansion only as far as the available source evidence allows.

## Frozen source identity

The objective-selected branch from Planner 27 is anchored at OSM node `1619736626` and continues onto OSM way `148910139`, named **Treetops Way**. Planner 26 already pinned that connector as:

- provider: OpenStreetMap
- way id: `148910139`
- version: `7`
- timestamp: `2026-02-21T20:28:40Z`
- highway: `footway`
- surface: `concrete`
- version URL: `https://api.openstreetmap.org/api/0.6/way/148910139/7`

Planner 42 preserves that exact identity and does not reinterpret the tags as RouteEdge semantics.

## Why expansion remains blocked

The repository does not yet contain the exact node sequence and coordinates for version 7 of way `148910139`. Without that version-pinned geometry, choosing a next junction would require guessing or using mutable/live geometry that is not tied to the frozen source version.

Therefore Planner 42 intentionally remains fail-closed with:

- `VERSION_PINNED_TREETOPS_WAY_NODE_SEQUENCE_NOT_CAPTURED`
- `EXACT_TREETOPS_WAY_NODE_SEQUENCE_NOT_SOURCED`
- `NEXT_JUNCTION_NOT_SOURCED`
- `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`

No `RouteEdge`, distance, duration, direction, accessibility, stroller, stairs, operational state, or next route node is materialized by this gate.

## What clears the gate

The next geometry milestone must capture the exact ordered node list for OSM way `148910139` version `7`, plus versioned coordinate provenance for the nodes needed to identify the next useful junction from anchor node `1619736626`.

Only after that evidence is committed and integrity-tested may the planner select the next geometry endpoint and begin qualifying downstream segment semantics.

## Runtime policy

This module is evidence authority only. It is not part of the browser runtime activation path and does not change production bundle behavior by itself.
