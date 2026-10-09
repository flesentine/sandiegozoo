# Planner 73 — selected-footway endpoint historical coordinate selector

Planner 73 prepares deterministic ingestion of the authoritative OSM history for node `48920902`.

It does **not** invent or embed a coordinate while the authoritative history endpoint is unreachable.

## Selection semantics

Given the full version history, Planner 73:

- validates each record as a version of node `48920902`
- requires a version-specific OSM API URL
- respects OSM visibility/deletion state
- ignores versions after `2026-02-21T20:08:08Z`
- selects the latest visible version at or before that timestamp
- requires finite latitude and longitude before coordinate promotion

Deleted versions may not expose coordinates.

## Boundary

Coordinate promotion remains blocked until the real authoritative node history is captured. Historical connected-way topology remains a separate follow-up and is not inferred here.
