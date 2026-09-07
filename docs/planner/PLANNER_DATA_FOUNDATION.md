# Planner/Data Foundation — Phase 1

**Status:** implementation baseline

WildRoute's optimizer is deterministic. It is only as trustworthy as the data it consumes, so data validation is a hard boundary before scoring or routing.

## Authority order

1. Booked experiences supplied by the visitor
2. Source-dated, verified Zoo records
3. Provisional records that are explicitly marked as such
4. Unknown data, which may be shown as unknown but never promoted to verified truth

ImageGen references are never geographic or schedule authority.

## Stable IDs

Planner state stores stable IDs, not display names.

Display names can change without invalidating:

- Must-See state
- route-node references
- schedule anchors
- dining preferences
- cached visits

## Guest navigation points

Every guest-facing place needs a navigation point intended for a visitor to reach.

Do not substitute:

- enclosure centroids
- approximate map centers
- arbitrary photo coordinates

The place must also resolve to a routing node.

## Routing graph

The internal graph is authoritative for route calculation.

An edge records:

- from/to node
- travel mode
- distance
- duration
- difficulty
- stairs
- accessibility
- stroller support
- one-way status
- open/closed/conditional status
- provenance

Transportation is topology, not decoration. Skyfari, bus, elevators, and ADA shuttle paths belong in the same routing model with explicit modes.

## Timed events

Schedules are date-specific records.

A timed event carries:

- place
- start time
- optional end time
- recommended arrival lead time
- effective/source metadata

The optimizer will later turn recommended arrival into a protected arrival window.

## Validation policy

CI errors include:

- duplicate IDs
- dangling zone/node/place references
- invalid coordinates
- invalid provenance
- impossible effective-date ranges
- non-positive edge weights
- stairs marked accessible or stroller-friendly
- invalid event dates/times
- event end before start

An orphan route node is currently a warning, allowing incremental graph construction while still surfacing incomplete topology.

## What this phase does not do

This phase does **not**:

- claim production Zoo coordinates
- populate a complete Zoo graph
- estimate walking
- score priorities
- choose show times
- solve itinerary feasibility

Those come only after verified source ingestion and graph coverage.
