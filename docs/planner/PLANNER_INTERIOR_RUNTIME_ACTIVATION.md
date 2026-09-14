# Planner 41 — Live interior runtime activation integration

## Decision

Wire the qualified Planner 24 ingress runtime resolver and Planner 34 interior runtime resolver into the Planner 40 expanded conditional graph.

Planner 41 does not create a new operational policy. It composes the two already-qualified evidence domains and translates only their enabled decisions into conditional `RouteEdge` IDs immediately before routing.

## Shared Zoo-hours evidence

The expanded runtime snapshot carries one Zoo-hours evidence object and one visit date. The same values are supplied to both qualified resolvers.

This prevents the integration layer from accepting contradictory ingress-vs-interior hours claims while preserving each resolver's ownership of the current instant and San Diego Zoo operational date.

## Evidence domains remain independent

Ingress activation remains Planner 24 authority:

1. current Zoo-local visit date;
2. current affirmative Zoo-hours evidence;
3. current clear main-entrance closure advisement;
4. current affirmative availability for each exact ingress edge.

Interior activation remains Planner 34 authority:

1. current Zoo-local visit date;
2. current affirmative Zoo-hours evidence;
3. current affirmative availability for the exact Tiger Trail-selected Front Street segment.

The main-entrance closure advisement is deliberately not passed to Planner 34 and therefore cannot become interior-segment authority.

That distinction is observable at runtime: a blocked ingress closure can leave both ingress edges disabled while the exact Front Street interior segment remains independently enabled for a route that starts at the Front Street RouteNode.

## Conditional edge translation

Planner 41 may enable only:

- `sdz-ingress-way-controlled-passage-route-edge`
- `sdz-ingress-way-front-street-connection-route-edge`
- `sdz-interior-tiger-trail-front-street-route-edge`

The first two IDs come directly from Planner 24's enabled decisions. The interior ID is added only when Planner 34 returns an evaluated `ENABLED` decision whose exact objective/way/from/to identity still matches the Planner 40 binding.

All derived IDs are checked against the Planner 40 expanded graph before routing.

## Caller boundary

The high-level route API intentionally omits `enabledConditionalEdgeIds` from its request contract.

At runtime it also:

- accepts only a plain request object;
- rejects unknown own fields, including a smuggled `enabledConditionalEdgeIds`;
- rejects accessors and symbol fields;
- copies only allowlisted routing controls into a fresh request;
- installs the resolver-derived activation IDs after that copy;
- remains protected against inherited `enabledConditionalEdgeIds` by both this boundary and the Planner 40 generic-routing hardening.

## Evidence-object hardening

The Planner 41 snapshot boundary requires exact plain objects and ordinary dense arrays for the snapshot and all runtime evidence records before delegating semantic validation to Planner 24/34.

This prevents inherited or accessor-backed evidence fields from being laundered into either resolver.

Planner 24 and Planner 34 continue to own date, timestamp, status, exact-segment identity, and freshness semantics.

## Routing behavior

With all current affirmative evidence, the live route from the main entrance to the Tiger Trail-selected interior junction uses:

1. `sdz-ingress-way-controlled-passage-route-edge`
2. `sdz-ingress-way-front-street-connection-route-edge`
3. `sdz-interior-tiger-trail-front-street-route-edge`

Expected totals remain:

- distance: `49.369 m`
- free-flow duration: `0.685 min`

If the interior availability evidence is missing, unavailable, unknown, stale, future-dated, or otherwise non-current, the two independently qualified ingress edges may remain enabled while the interior edge stays closed.

Capability gates still apply after operational activation. In particular, Planner 39's `stroller: "unknown"` remains fail-closed for stroller-required routing even when the interior edge is operationally enabled.

## Scope

Planner 41 remains specific to the currently materialized Tiger Trail objective-selected Front Street segment. It does not resolve global Front Street endpoint selection, stairs evidence, stroller evidence, or additional interior graph coverage.
