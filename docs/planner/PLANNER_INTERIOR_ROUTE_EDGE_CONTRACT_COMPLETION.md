# Planner 39 — Interior RouteEdge contract completion

## Decision

Complete the Tiger Trail objective-selected Front Street RouteEdge contract by representing the two still-unresolved capabilities explicitly as `"unknown"`:

- `stairs: "unknown"`
- `stroller: "unknown"`

This follows the existing Planner 22 ingress precedent: **unknown is a truthful planner value, not a claim that the underlying fact was resolved**.

## Exact scope

Planner 39 applies only to the qualified Tiger Trail segment:

`7053320515 ↔ 1619736626`

on Front Street way `1481425058`.

The endpoint selection remains `objective-only`; global Front Street endpoint selection remains `unresolved`.

## Evidence is still unresolved

Planner 39 does not weaken or overwrite the evidence audits.

Planner 35 remains:

- result: `blocked`
- blocker: `EXACT_SEGMENT_STAIRS_NOT_SOURCED`
- direct stair-free evidence: `not-sourced`
- unresolved planner value: `unknown`

Planner 36 remains:

- result: `blocked`
- blocker: `EXACT_SEGMENT_STROLLER_NOT_SOURCED`
- direct generic stroller-route evidence: `not-sourced`
- unresolved planner value: `unknown`

Planner 37's provenance lineage continues to preserve both unresolved evidence reasons.

## Representability vs. evidence

Before Planner 39, Planner 38 correctly reported that RouteEdge materialization was blocked by the two unresolved capability fields.

Planner 39 changes only the **contract representation**:

- both unresolved fields now have valid conservative planner values (`"unknown"`);
- `blockedFields` becomes empty;
- the unresolved evidence reasons remain explicitly attached;
- the RouteEdge contract becomes ready for a later materialization milestone.

This does **not** turn either unknown into `true` or `false`.

## Routing safety

WildRoute's existing contract already treats capability unknowns conservatively. Hard stroller/accessibility requests accept only explicit positive capability and therefore fail closed when the relevant capability is unknown.

Planner 39 does not alter those routing rules.

## Runtime boundary

Planner 39 exports null-prototype authority/assessment records, preserving the prototype-pollution hardening introduced in Planner 37 and carried through Planner 38.

It does not materialize a `RouteEdge`; fields such as `fromNodeId`, `toNodeId`, `mode`, `distanceMeters`, `durationMinutes`, `difficulty`, `accessible`, `oneWay`, `status`, `provenance`, and `routeEdgeId` remain absent from the completion record.

## Next step

If Planner 39 qualifies, Planner 40 can materialize the exact interior RouteEdge using the already-qualified semantics:

- exact endpoints
- `walk`
- `7.157 m`
- `0.099 min`
- `easy`
- `stairs: "unknown"`
- `accessible: true`
- `stroller: "unknown"`
- `oneWay: false`
- `status: "conditional"`
- provisional qualified provenance

That materialization must retain exact runtime activation requirements for the conditional operational status and must not reinterpret either unknown capability as a sourced concrete fact.
