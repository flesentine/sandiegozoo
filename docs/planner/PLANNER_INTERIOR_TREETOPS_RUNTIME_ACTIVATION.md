# Planner 58 — Treetops runtime activation and routing integration

Planner 58 is the final Treetops graph milestone.

## Runtime boundary

The Treetops RouteEdge is conditional. It is enabled only when:

1. the requested visit date is the current San Diego Zoo operational date;
2. current Zoo-hours evidence says the visit is inside Zoo hours; and
3. current exact-segment evidence affirmatively says OSM way `148910139` v7 from node `1619736626` to `13588159626` is available.

Missing, stale, unknown, unavailable, wrong-version, or wrong-segment evidence keeps the edge disabled.

## Composition

Planner 58 composes:

- existing ingress runtime activation;
- existing Front Street interior runtime activation;
- Treetops exact-segment runtime activation.

Only resolver-derived conditional edge IDs are passed to the router. Callers cannot inject `enabledConditionalEdgeIds`.

## Input hardening

The runtime boundary:

- snapshots own data descriptors before use;
- rejects accessors;
- ignores Proxy `get` substitutions;
- rejects sparse/exotic arrays;
- rejects caller-controlled conditional-edge IDs;
- validates exact Treetops source identity and version.

## Result

With all current evidence affirmative, the planner can route:

- from the Treetops anchor RouteNode to the Fern Canyon junction RouteNode; and
- from the main entrance through the already-qualified ingress/Front Street graph to the Treetops endpoint.

Stroller-required routing remains fail-closed because stroller suitability is still explicitly `unknown`.
