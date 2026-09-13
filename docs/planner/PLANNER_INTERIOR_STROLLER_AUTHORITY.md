# Planner 36 — Interior Stroller Evidence Audit

Planner 36 audits stroller-specific evidence for the Tiger Trail objective-selected Front Street segment:

- source way: `1481425058`
- exact segment: `7053320515 ↔ 1619736626`
- objective: `sdz-tiger-trail`

## Decision

Planner 36 does **not** qualify `stroller: true` or `stroller: false`.

The WildRoute planner treats `RouteEdge.stroller` as a generic hard routing capability: when `requireStroller` is true, an edge is usable only when `edge.stroller === true`. The current evidence does not establish that generic exact-segment capability.

The result therefore remains:

- `stroller: unknown`
- blocker: `EXACT_SEGMENT_STROLLER_NOT_SOURCED`

## Evidence retained

### Facility stroller policy

Planner 17 already freezes the official Zoo policy that strollers are allowed inside the grounds. It also explicitly classifies that source as facility permission only:

- `strollerPolicy: allowed`
- `scope: facility-policy`
- `routeSuitabilityAuthority: not-established`

Planner 36 preserves that distinction. Permission to bring or use a stroller does not establish that every exact pedestrian segment is suitable for a stroller.

### 2026 Accessibility Guide

The current San Diego Zoo Wildlife Alliance Accessibility Guide 2026 provides stroller-specific accessibility-device context:

- if a child uses a stroller as an accessibility device and cannot transfer out of it, Guest Services can issue a wheelchair tag;
- guests using mobility devices are advised to consult the accessibility map/app and signs to determine accessible areas.

Planner 36 records this as `accessibility-device-specific` evidence. It is important positive evidence, but it applies to a special accessibility use case and does not state that every ordinary stroller can traverse this exact Front Street segment.

### Exact accessibility

Planner 33 previously qualified this exact segment as `accessible: true` for WildRoute accessibility filtering. Planner 36 does not convert that independent wheelchair/accessibility semantic into generic stroller suitability.

### Stairs

Planner 35 leaves the same exact segment at `stairs: unknown`. Planner 36 cannot silently treat unresolved stairs as stroller-compatible.

## Positive evidence threshold

Planner 36 freezes the evidence required before the stroller blocker can be cleared. A future change needs at least one of:

1. direct authoritative evidence that this exact segment is suitable for generic stroller travel; or
2. an explicit authoritative route binding whose semantics apply to all allowed strollers, not only a stroller serving as a disability mobility device.

Until then, the planner remains fail-closed.

## Materialization state

Planner 36 clears no RouteEdge semantic. The exact segment still has these independent blockers:

1. `EXACT_SEGMENT_STAIRS_NOT_SOURCED`
2. `EXACT_SEGMENT_STROLLER_NOT_SOURCED`
3. `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`

No RouteEdge or RouteNode is materialized by Planner 36.

## Runtime integrity

The authority boundary rejects:

- unknown or hidden fields;
- symbol fields;
- accessor-backed object fields;
- accessor-backed array elements;
- decorated arrays;
- direct `stroller`, `stairs`, provenance, or RouteEdge promotion;
- exact-segment identity drift;
- guide-evidence role drift;
- upstream Planner 33 / Planner 35 linkage drift.

The exported policy, guide evidence, audit, and assessment snapshots are deeply immutable.
