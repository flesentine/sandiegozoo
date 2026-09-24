# Planner 59 — Fern Canyon Trail geometry evidence gate

Planner 59 starts the next Tiger Trail graph expansion after the completed Treetops runtime milestone.

## Existing authority

Planner 44 already captured the first exact linear branch at the Treetops endpoint:

- anchor / shared node: `13588159626`
- connected OSM way: `1481578621`
- exact way version: `1`
- timestamp: `2026-02-21T20:08:08Z`
- changeset: `178875075`
- highway tag: `footway`
- name: **Fern Canyon Trail**
- exact ordered node sequence: `13588159625 -> 13588159626`

Planner 55 independently materialized node `13588159626` as the current Treetops endpoint RouteNode.

## Gate boundary

Planner 59 freezes that already-sourced way identity and traversal orientation without inventing the missing far-end geometry.

The current anchor is way index 1. The opposite endpoint is node `13588159625` at way index 0.

The repository does **not** yet contain version-pinned coordinate provenance or connected-way topology for node `13588159625`. Therefore the next route segment remains fail-closed.

## Blockers preserved

Planner 59 reports:

- `EXACT_FERN_CANYON_FAR_ENDPOINT_COORDINATE_NOT_SOURCED`
- `FERN_CANYON_FAR_ENDPOINT_TOPOLOGY_NOT_SOURCED`
- `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`

No distance, duration, mode, difficulty, accessibility, stairs, stroller, direction, operational status, RouteNode, or RouteEdge is materialized.

## Next boundary

The next milestone should capture the exact historical/version-pinned node record for `13588159625` at or before the frozen way-v1 timestamp, then source its historical connected-way topology before deciding whether it is a useful graph junction.

This module is evidence authority only and does not change browser behavior.
