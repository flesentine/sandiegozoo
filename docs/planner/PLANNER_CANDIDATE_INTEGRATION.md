# Planner 8 — Candidate / Data Integration

**Status:** production-shaped integration seam

Planner 8 connects three previously separate authorities:

1. validated WildRoute data
2. current visitor/day/priority preferences
3. Planner 5–7 optimizer + qualification contracts

It does **not** introduce live Zoo facts.

The integration seam is designed so real source-dated Zoo data can be inserted later without changing planner semantics.

## Explicit UI-to-data bindings

Current UI priority IDs are UX identifiers such as:

- `panda`
- `wildlife-wonders`

Planner 8 does not assume those IDs equal `PlaceRecord.id` or `ScheduleEvent.activityId`.

Integration requires explicit bindings:

### Animals

`UI preference ID → PlaceRecord.id + explicit dwell minutes`

Animal dwell is not invented by the adapter.

### Experiences

`UI preference ID → ScheduleEvent.activityId`

An optional explicit dwell is allowed only as the Planner 3 fallback when source events do not provide `endTime`.

### Reservation

The current visit form stores reservation name + time but not a planner destination.

A reservation therefore requires an explicit:

`placeId + durationMinutes`

before it can become a locked candidate.

No fuzzy name matching is used.

## Verified-only candidate evidence

A place-backed candidate is eligible only when all three are verified:

- place provenance
- guest-facing navigation point confidence
- destination route-node provenance

For scheduled experiences, each performance additionally requires verified event provenance.

Unverified performances are excluded individually and reported.

If no trusted performance remains:
- a Must experience blocks integration
- an Interested experience is explicitly excluded with a warning

The same policy applies to animals:
- Must-See missing/unverified data blocks integration
- Favorite missing/unverified data is explicitly excluded with a warning

This preserves Must-See authority without pretending optional data gaps are successful visits.

## Verified-only routing graph

Planner 8 compiles an ephemeral routing package.

Any route edge is planner-disabled when:
- its provenance is not verified, or
- either endpoint route node is not verified

The source record is not rewritten or claimed to be operationally closed.

The integration result reports the exact disabled edge IDs under:

`routingGate.disabledUnverifiedEdgeIds`

and emits a `ROUTING_DATA_GATED` warning.

## Preference mapping

Planner 8 reuses Planner 4 policy:

- animal Must → protected / flexible / must
- animal Favorite → optional / flexible / favorite
- experience Must → required / windowed / must
- experience Interested → optional / windowed / favorite
- reservation → locked / fixed / must

Multiple performances for one experience share the same stable `selectionKey`, so the optimizer chooses exactly one.

## Visit/day mapping

Visit preferences become planner policy as follows:

- wheelchair → hard accessible routing
- stroller → hard stroller routing
- easier paths → soft route-comfort scoring
- pace → Planner 4 pace policy
- Skyfari disabled → route modes exclude Skyfari
- enabled conditional edge IDs pass through explicitly

The adapter does not infer opening hours from the temporary UI fixture.

The user-entered visit arrival/departure creates the Planner 3 horizon directly.

## Integration result

The adapter returns either:

### ready

Contains:
- optimizer request
- deterministic candidate list
- warnings
- explicitly excluded optional selection keys
- routing confidence gate evidence

### blocked

Contains:
- candidates that could be constructed
- explicit errors/warnings
- excluded selection keys
- routing confidence gate evidence

A blocked integration deliberately does **not** expose an optimizer request.

## Qualification gate

`qualifyCandidateIntegration(...)` composes Planner 8 with Planner 7.

Blocked integration returns:

`integration-blocked`

Ready integration runs the exact Planner 7 qualification scenario and returns:

- `qualified`
- or `not-qualified`

The caller must provide an explicit qualification scenario ID, state budget, and Planner 7 thresholds.

Planner 7 still owns validation of those release gates.

## Scope boundary

Planner 8 does not yet:

- provide actual San Diego Zoo production bindings
- scrape or fetch live Zoo schedules
- infer reservation destination from free text
- invent animal dwell durations
- invent show duration when neither endTime nor configured dwell exists
- trust provisional geography/routing data
- generate meals/rest stops
- change the current UI to show integration issues
- execute live replanning

The next data phase can add source-backed bindings and verified records without bypassing this adapter or its qualification gate.
