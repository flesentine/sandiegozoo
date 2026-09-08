# Planner 9 — First Source-Backed Zoo Data Slice

**Status:** official-source identity/schedule foundation

Planner 9 begins replacing temporary UX fixtures with source-backed San Diego Zoo facts.

It deliberately does **not** create guessed map geometry or route nodes.

## Source authority used

This first slice uses current official San Diego Zoo pages only.

Verified on:

**2026-09-07T21:53:00-07:00**

Source-backed records now cover:

- Denny Sanford Panda Ridge
- Tiger Trail
- Koala / Outback
- Gorilla Tropics® and Scripps Aviary
- Wildlife Wonders
- Rady Ambassador Presentation Area
- Skyfari® Aerial Tram

## What is verified

### Animal identity/location labels

Official pages verify current destination identity and, where explicitly published, the Zoo's location label.

This is enough to establish canonical destination identity.

It is **not** enough to establish:
- guest navigation coordinates
- internal route node
- walking edge geometry
- walking duration/distance

Animal records therefore remain:

`plannerMaterialization: "identity-only"`

until geography has independent authority.

## Wildlife Wonders

The current official Wildlife Presentations page states:

- Wildlife Wonders
- Wegeforth Bowl
- daily at 2 p.m.
- presentation runs 15–20 minutes
- general guests may enter at 1:50 p.m.

Planner 9 records:
- start time 14:00
- recommended arrival 10 minutes
- source duration range 15–20 minutes

It does **not** convert the duration range into a fake exact Planner 3 service duration.

Therefore Wildlife Wonders is currently:

`identity-and-schedule-partial`

and cannot yet become a strict optimizer ScheduleEvent without an explicit exact-duration policy/data point.

## Current UX fixture mismatches

The existing temporary UX fixture currently says:

- Wildlife Wonders — Discovery Theater — 2:00 PM
- Wildlife Ambassadors — Wildlife Explorers Basecamp — 1:00 PM

Current official source says:

- Wildlife Wonders — Wegeforth Bowl — 2:00 PM
- Rady Ambassador Presentation Area — 1:00 PM

Planner 9 does **not** silently equate the existing `wildlife-ambassadors` UI ID with the current Rady presentation.

That identity remains unresolved until the product explicitly replaces/rebinds the stale fixture.

## Skyfari

Current official source verifies:

- Skyfari® Aerial Tram
- operates daily
- starts at 10 a.m.
- operates until Zoo close

This verifies a transport identity and partial operating-hours policy.

It does not establish:
- station route-node coordinates
- exact ride duration
- queue/wait time
- service availability for a specific future date
- closure status on arrival day

Skyfari therefore remains partial source authority.

## Fixture audit

`auditPriorityFixturesAgainstOfficialSources(date)` compares the current UX priority fixture against the source-backed catalog and reports deterministic mismatches.

This is an audit seam, not a runtime route authority.

It makes stale UX facts explicit so later UI/data PRs can retire fixtures without silently changing planner identity.

## Scope boundary

Planner 9 does not yet:
- modify UI copy
- create production PlaceRecord geometry
- create production RouteNode/RouteEdge geometry
- claim an exact Wildlife Wonders duration
- bind the stale `wildlife-ambassadors` UI experience
- turn Skyfari source identity into a usable graph edge
- fetch sources at runtime

The next source-data step is to establish **guest-facing navigation points and route-node authority** for a very small destination set before any of these source identities are allowed into the optimizer.
