# Planner 24 — Runtime Conditional-Edge Activation

**Status:** first production ingress RouteEdges can be evaluated and routed safely from current operational evidence

Planner 24 connects the Planner 20 operational-status requirements to the Planner 23 production RouteEdges.

## Security boundary

Planner 24 does **not** mint or accept a transferable runtime-trust token.

The earlier draft used a caller-supplied `conditionalEdgeRuntimeTrust` object. Codex correctly identified two P1 problems with that design:

1. a caller could forge the public trust literal and bypass the underlying evidence checks
2. genuine trust could be replayed later on the same visit date after its source evidence expired

That bridge has been removed completely.

The generic Planner 8 candidate-integration contract is restored unchanged. Provisional RouteEdges remain gated there even when a caller directly supplies their IDs.

## Live evidence model

Planner 24 accepts the underlying operational evidence itself:

- visit date
- Zoo-hours evidence
- closure-advisement evidence
- exact-edge availability evidence for each ingress OSM way

Each evidence item carries:

- stable evidence ID
- explicit status
- visit date it applies to
- `observedAt`
- `expiresAt`

Planner 24 does not accept an `evaluatedAt` timestamp from the caller.

The resolver evaluates evidence against `Date.now()` at the moment the resolver runs.

This prevents a caller from replaying stale evidence by claiming an older evaluation time.

## Activation requirements

For each exact ingress edge, all Planner 20 requirements must be current at the same evaluation instant.

### Zoo hours

Required:

- `status = inside`
- `validForDate` equals the visit date
- current time is not before `observedAt`
- current time is not after `expiresAt`

### Closure advisement

Required:

- `status = clear`
- `validForDate` equals the visit date
- current time is inside the evidence window

### Exact edge availability

Required:

- evidence exists for that exact OSM source way
- `status = available`
- `validForDate` equals the visit date
- current time is inside the evidence window

If any requirement is missing, unknown, unavailable, out of date, expired, or not yet effective, that exact RouteEdge is not enabled.

## Independent edge activation

The controlled passage and Front Street connector are evaluated separately.

One edge may be enabled while the other remains disabled.

A facility-wide hours result never becomes blanket permission for all conditional edges.

## Effective expiry

Every enabled decision records `effectiveExpiresAt`.

That timestamp is the earliest expiry among:

- Zoo-hours evidence
- closure-advisement evidence
- exact-edge availability evidence

This records the actual limiting evidence window rather than inventing a fixed freshness interval.

The value is diagnostic only; it is not a reusable credential.

## High-level routing API

Planner 24 exports:

`routeIngressWithRuntimeEvidence(snapshot, request)`

This function:

1. validates the underlying evidence
2. reevaluates it against the actual current clock
3. derives `enabledConditionalEdgeIds`
4. builds the qualified Planner 23 ingress graph
5. routes immediately using only the derived enabled IDs

The caller cannot provide `enabledConditionalEdgeIds` through this API.

Even if an untyped caller attempts to smuggle that property into the request object, Planner 24 overwrites it with the resolver-derived IDs after spreading the request.

## No transferable capability

Planner 24 intentionally returns no `conditionalEdgeRuntimeTrust` object.

There is therefore no public discriminator, nonce, capability object, or same-day token that can be copied and replayed later.

A future route attempt must run the evidence evaluation again.

If the underlying evidence has expired by then, the edge remains disabled.

## Candidate integration remains fail-closed

Planner 8's verified-only routing gate is unchanged.

Planner 23 ingress edges remain `provisional`, so a caller that invokes `buildCandidateIntegration(...)` directly and supplies the ingress IDs in `enabledConditionalEdgeIds` still receives `CONDITIONAL_EDGE_UNTRUSTED`.

Planner 24 does not weaken that boundary.

A future production planner-integration phase may generalize the live evidence boundary, but it must validate the underlying evidence at the integration/routing call rather than trusting a transferable assertion.

## Failure-closed behavior

Planner 24 disables or rejects:

- outside Zoo-hours status
- unknown Zoo-hours status
- expired Zoo-hours evidence
- wrong-date Zoo-hours evidence
- not-yet-effective Zoo-hours evidence
- blocked closure status
- unknown closure status
- expired closure evidence
- wrong-date closure evidence
- missing exact-edge evidence
- unavailable exact-edge evidence
- unknown exact-edge status
- expired exact-edge evidence
- wrong-date exact-edge evidence
- duplicate exact-edge evidence for one OSM way
- exact-edge evidence for an unknown ingress way
- malformed evidence timestamps
- inverted evidence windows

## Replay resistance

A regression supplies fully expired evidence plus a forged historical `evaluatedAt` field.

The resolver ignores that extra caller field because evaluation time is owned internally by Planner 24.

The current clock wins and the edges remain disabled.

Another regression attempts to smuggle enabled conditional edge IDs into the high-level route request while exact-edge evidence says unavailable.

The high-level function overwrites those IDs with the empty resolver-derived set and routing returns `NO_ROUTE`.

## First live-routable ingress path

When all three evidence requirements are currently satisfied for both exact edges, Planner 24 routes:

`Main Entrance → interior → Front Street`

with:

- distance: **42.212 m**
- duration: **0.586 min**

If either exact edge loses current evidence, the complete route is no longer available.

## Mobility safety

Planner 22 mobility uncertainty remains unchanged:

- `accessible = unknown`
- `stroller = unknown`

Therefore accessibility- or stroller-required routing still fails closed.

Operational evidence cannot upgrade mobility authority.

## What Planner 24 does not do

Planner 24 does not:

- scrape Zoo hours
- scrape closure advisements
- manufacture exact-edge availability
- authenticate an upstream source adapter cryptographically
- persist runtime authorization
- promote provisional provenance to verified
- weaken Planner 8's provenance gate
- enable accessibility/stroller routing on unknown capability

Operational data acquisition remains a separate source-adapter responsibility.

## Next boundary

After Planner 24, the first entrance graph has a safe **live routing boundary** that reevaluates current evidence immediately before routing.

The next major effort is graph expansion beyond Front Street, followed later by a generalized production planner/UI integration that consumes the same underlying-evidence pattern without transferable trust assertions.
