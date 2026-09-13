# Planner 37 — Interior Provenance Authority

Planner 37 completes provenance for the Tiger Trail objective-selected Front Street segment without claiming that the segment is semantically ready for RouteEdge materialization.

## Exact segment

- Objective: `sdz-tiger-trail`
- OpenStreetMap way: `1481425058`
- Way version: `1`
- From node: `7053320515`
- To node: `1619736626`
- Version-pinned source: `https://api.openstreetmap.org/api/0.6/way/1481425058/1`
- Source way timestamp: `2026-02-21T14:47:49Z`
- Source way changeset: `178862584`
- Snapshot observed: `2026-09-10T23:02:16-07:00`

The version-pinned OSM snapshot is the primary geometry/source trace anchor. Planner 37 also records the complete WildRoute semantic lineage through Planners 26–36 so the provenance record can identify exactly which qualified authorities produced the current exact-segment state.

## Provenance semantics

Planner 37 emits a `SourceProvenance` value with:

- `confidence: "provisional"`
- `lastVerified: "2026-09-10T23:02:16-07:00"`
- `effectiveFrom: "2026-09-10"`

The confidence deliberately remains provisional. Completing provenance does not convert unresolved stairs or stroller semantics into verified facts, and it does not imply that all semantic evidence comes from OpenStreetMap. The lineage preserves the separate qualified authorities that contain the Zoo-map, policy, runtime, and evidence-audit semantics.

## Qualified lineage

The provenance authority binds the exact segment to:

1. Planner 26 Front Street geometry authority
2. Planner 27 objective branch selection authority
3. Planner 28 exact segment distance authority
4. Planner 29 version-pinned direction source snapshot and direction authority
5. Planner 30 pedestrian mode authority
6. Planner 31 walking duration authority
7. Planner 32 difficulty authority
8. Planner 33 accessibility authority
9. Planner 34 operational-status authority
10. Planner 35 stairs evidence audit
11. Planner 36 stroller evidence audit

Every semantic authority from distance onward must remain attached to objective `sdz-tiger-trail`, way `1481425058`, and nodes `7053320515 ↔ 1619736626`. The branch-selection authority must continue selecting those same endpoints from the qualified geometry.

## What Planner 37 clears

Planner 37 clears only:

- `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`

After provenance completion, exact-segment materialization remains blocked by exactly:

1. `EXACT_SEGMENT_STAIRS_NOT_SOURCED`
2. `EXACT_SEGMENT_STROLLER_NOT_SOURCED`

Planner 37 does **not** infer either missing semantic from provenance completeness.

## Materialization boundary

The Planner 37 authority is `provenance-only`:

- no `RouteEdge` is created;
- no `RouteNode` is created;
- no global Front Street endpoint is selected;
- no concrete `stairs` value is introduced;
- no concrete `stroller` value is introduced;
- unsupported objectives fail closed.

The static integrity check is closed over already-qualified module exports rather than accepting arbitrary caller-owned evidence objects. This keeps provenance aggregation auditable without adding a new untrusted-object certification boundary.

## Next step

After Planner 37, the exact Tiger Trail Front Street segment has two remaining semantic blockers: stairs and stroller. A later planner may clear either only with evidence meeting the conservative thresholds already frozen by Planners 35 and 36. RouteEdge materialization remains blocked until both are resolved.
