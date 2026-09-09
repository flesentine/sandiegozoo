# Planner 24 — Runtime Conditional-Edge Activation

**Status:** first production ingress RouteEdges can now be activated safely at runtime

Planner 24 connects the Planner 20 operational-status contract to the Planner 23 production RouteEdges.

## Why this phase exists

Planner 23 created two real ingress RouteEdges, but both remain:

`status: "conditional"`

That is intentional. The planner must not infer that an exact entrance path is usable merely because:

- the Zoo is generally open
- the path exists in OpenStreetMap
- no closure notice was noticed earlier

Planner 20 required three runtime facts for each exact edge:

1. `VISIT_WITHIN_CURRENT_ZOO_HOURS`
2. `NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT`
3. `AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY`

Planner 24 evaluates those facts and produces the only RouteEdge IDs that may be placed in `enabledConditionalEdgeIds`.

## Runtime evidence model

Planner 24 consumes a point-in-time operational snapshot containing:

- visit date
- evaluation timestamp
- Zoo-hours evidence
- closure-advisement evidence
- exact-edge availability evidence for each ingress OSM way

Every evidence item carries:

- a stable evidence ID
- a status
- the visit date it applies to
- `observedAt`
- `expiresAt`

Planner 24 does **not** invent a fixed freshness interval such as 30 minutes.

The evidence producer chooses its validity window. Planner 24 only accepts evidence when the current evaluation timestamp falls inside that explicit window.

## Exact-edge activation

A RouteEdge is enabled only when all conditions are true:

### Zoo hours

- status is `inside`
- evidence applies to the same visit date
- evaluation time is between `observedAt` and `expiresAt`

### Closure advisement

- status is `clear`
- evidence applies to the same visit date
- evaluation time is inside its validity window

### Exact edge availability

- evidence exists for the RouteEdge's exact OSM source way
- status is `available`
- evidence applies to the same visit date
- evaluation time is inside its validity window

If any requirement fails, that exact edge remains disabled.

## Independent edge decisions

The two ingress RouteEdges are evaluated independently.

For example:

- way 755054695 may be enabled
- way 755054694 may remain disabled because its exact-edge evidence is missing or stale

Planner 24 never turns a global Zoo-hours result into blanket permission for all conditional edges.

## Runtime activation result

Planner 24 returns:

- `enabledConditionalEdgeIds`
- a dated `conditionalEdgeRuntimeTrust` envelope
- one explicit decision per ingress edge

Each decision records:

- source OSM way
- RouteEdge ID
- enabled/disabled status
- reason
- evidence IDs used

Current decision reasons include:

- `ENABLED`
- `HOURS_NOT_CONFIRMED`
- `HOURS_EVIDENCE_NOT_CURRENT`
- `CLOSURE_CLEARANCE_NOT_CONFIRMED`
- `CLOSURE_EVIDENCE_NOT_CURRENT`
- `EDGE_AVAILABILITY_MISSING`
- `EDGE_AVAILABILITY_NOT_CONFIRMED`
- `EDGE_AVAILABILITY_NOT_CURRENT`

## Candidate-integration trust bridge

Planner 23 RouteEdges intentionally use:

`provenance.confidence = "provisional"`

because terrain/mobility semantics remain explicitly unknown and operational availability is conditional.

Before Planner 24, the generic candidate-integration gate closed every provisional edge before routing. That meant the first production RouteEdges could never be used even after their operational requirements were satisfied.

Planner 24 adds a narrow runtime trust channel:

`conditionalEdgeRuntimeTrust`

This does **not** promote provenance to verified.

It only allows an edge through the integration trust gate when:

- the edge is still `conditional`
- base edge provenance is at least provisional
- endpoint RouteNodes remain verified/effective
- the runtime trust envelope is for the same visit date
- the edge ID is explicitly listed by the runtime activation resolver

The router must still receive the same edge ID in:

`enabledConditionalEdgeIds`

Therefore:

- runtime trust alone cannot open an edge
- enabledConditionalEdgeIds alone cannot bypass provisional trust
- both are required for Planner 23 provisional conditional edges

## Base-provenance boundary

Runtime operational evidence is not allowed to repair unknown geometric/source provenance.

If a RouteEdge's base provenance confidence is:

`unknown`

Planner 24 runtime trust cannot pass it through candidate integration.

This keeps operational availability separate from structural/source authority.

## Failure-closed behavior

Planner 24 disables or rejects:

- outside Zoo-hours status
- unknown Zoo-hours status
- expired or wrong-date Zoo-hours evidence
- blocked or unknown closure status
- expired or wrong-date closure evidence
- missing exact-edge evidence
- unavailable or unknown exact-edge status
- expired or wrong-date exact-edge evidence
- duplicate exact-edge evidence for the same OSM way
- exact-edge evidence for an unknown ingress way
- runtime trust replayed onto another visit date
- runtime trust targeting an unknown edge
- runtime trust targeting a non-conditional edge
- runtime trust trying to override `confidence="unknown"`

## First fully activated real ingress route

With fresh evidence for both exact ingress ways, Planner 24 enables:

- `sdz-ingress-way-controlled-passage-route-edge`
- `sdz-ingress-way-front-street-connection-route-edge`

Candidate integration then accepts those provisional conditional edges without upgrading their provenance.

The router can find:

`Main Entrance → interior → Front Street`

at:

- **42.212 m**
- **0.586 min**

If either exact edge loses current availability evidence, the full entrance-to-Front-Street route is no longer available.

## What Planner 24 does not do

Planner 24 does **not**:

- scrape Zoo hours itself
- scrape closure advisements itself
- claim absence of a notice proves an edge is clear
- manufacture exact-edge availability
- persist runtime trust as long-lived authority
- promote provisional edge provenance to verified
- enable accessibility/stroller routing on unknown capability

Operational data acquisition remains a separate adapter/source responsibility.

## Next boundary

After Planner 24, the entrance graph is structurally routable and operationally activatable.

The next high-value work is **graph expansion beyond Front Street**:

1. establish source-backed RouteNodes/edges toward the first destination corridor
2. add Panda Ridge / Wegeforth Bowl / Tiger Trail / nearby major junctions
3. keep the same authority → semantics → materialization → runtime-activation pattern for new conditional edges

Skyfari, full destination bindings, schedules, live UI planner wiring, and final freeze remain later phases.
