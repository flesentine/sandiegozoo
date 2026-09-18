# Planner 44 — historical Treetops topology and first useful junction

Planner 44 clears Planner 43's two remaining evidence blockers by sourcing historical connected-way topology at the exact Treetops Way v7 timestamp and freezing the exact Treetops segment from the selected anchor to the first useful linear junction.

## Historical snapshot boundary

- Treetops source: OSM way `148910139` v7
- Snapshot timestamp: `2026-02-21T20:28:40Z`
- Anchor: node `1619736626`
- Historical topology discovery: Overpass historical snapshot at the exact timestamp
- Source verification: every candidate connected way used by the authority was re-fetched from its exact versioned OSM API endpoint and checked for matching version, timestamp, changeset, and shared-node sequence
- The one-off network capture script is removed from the permanent branch after capture

## Forward junction selection rule

Starting **after** the anchor, scan the exact Planner 43 Treetops v7 ordered node sequence. A node qualifies as the next graph junction only when exact historical topology shows a connected linear OSM highway way at the snapshot timestamp. OSM `area=yes` pedestrian polygons are recorded as topology evidence but are not treated as linear route branches for this graph-expansion milestone.

The first earlier shared node is Treetops index 3, node `10303552086`, connected to OSM way `1126804582` v3. That way is `highway=pedestrian`, `area=yes`, `surface=paving_stones`; Planner 44 records it but excludes it from linear junction selection.

The first qualifying linear branch is Treetops index 6:

- Junction node: `13588159626`
- Connected way: `1481578621`
- Exact version: `1`
- Timestamp: `2026-02-21T20:08:08Z`
- Changeset: `178875075`
- Tags: `highway=footway`, `name=Fern Canyon Trail`
- Exact connected-way node sequence: `13588159625 -> 13588159626`
- Classification remains topology-only (`first-linear-highway-connected-way-after-anchor`); the `highway=footway` source tag is not yet promoted to route mode.

## Exact Treetops segment provenance

Planner 44 freezes the exact Treetops v7 node sequence from the anchor through the selected junction:

`1619736626 -> 1619736622 -> 1619736623 -> 10303552086 -> 1619736627 -> 1619736634 -> 13588159626`

This is the exact Planner 43 source-way subsequence at indices 0 through 6. No pedestrian mode, distance, duration, direction, accessibility, difficulty, stairs, stroller, operational status, RouteNode, or RouteEdge semantics are inferred here. The exported candidate-taking integrity assertion revalidates copied/supplied authority data before downstream use.

## What this clears

Planner 43 left:

- `NEXT_JUNCTION_NOT_SOURCED`
- `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`

Planner 44 clears both with exact historical connected-way and source-segment evidence.

## Next milestone

Qualify the selected Treetops segment's pedestrian mode before deriving distance, duration, direction, mobility, operational, or RouteEdge semantics.
