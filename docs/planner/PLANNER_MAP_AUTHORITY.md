# Planner 10 — Official Map-Anchor and Corridor Authority

**Status:** navigation/topology evidence without geospatial materialization

Planner 10 advances source-backed navigation authority without inventing coordinates.

## Official map artifacts

The current San Diego Zoo planning page links to the Zoo's official illustrated map.

Planner 10 freezes two current official map artifacts, both revision **V01.05.26 / 2026-01-05**:

- classic Zoo map
- Resource Map for Guests with Disabilities

Both were re-observed on:

**2026-09-07T21:53:00-07:00**

## What the maps establish

The map artifacts visibly label guest-facing destinations including:

- Entrance
- Panda Ridge
- Tiger Trail
- Wegeforth Bowl
- Rady Ambassador Presentation Area
- Alaska Airlines Skyfari East
- Alaska Airlines Skyfari West
- Lost Forest
- Outback

Planner 10 records these as:

`plannerMaterialization: "map-anchor-only"`

A map anchor proves that the current official map depicts a named guest-facing destination/area.

It does **not** prove georeferenced latitude/longitude.

## Walking-corridor authority

The accessibility map publishes named walking corridors with approximate whole-route walking times and terrain/access descriptions.

Planner 10 records the following source facts:

- Front Street — 20-minute walk — mild terrain — access to Basecamp, Lost Forest, Outback, Urban Jungle, Africa Rocks
- Park Way — 30-minute walk — mild to steep — access to Africa Rocks, Asian Passage, Panda Ridge, Northern Frontier, Elephant Odyssey
- Center Street — 15-minute walk — steep — access to Outback and Asian Passage
- Treetops Way — 7-minute walk — mild — access to Fern Canyon, Tiger, Orangutan, Hippo, and Monkey Trails
- Fern Canyon Trail — 7-minute walk — Treetops Way to Park Way / Center Street — steep terrain and stairs
- Monkey Trail — 15-minute walk — Entrance to Gorillas — mild terrain
- Tiger Trail — 20-minute walk — Entrance to Tigers — mild to steep terrain

These are recorded as:

`plannerMaterialization: "corridor-authority-only"`

They are **not** converted into Planner 2 edges.

The published times describe Zoo map corridors, not necessarily the exact segment between two optimizer route nodes.

## Why no NavigationPoint yet

The current Planner 1 contract requires:

- latitude
- longitude
- confidence

for a `NavigationPoint`, and coordinates for every `RouteNode`.

The official illustrated maps are not georeferenced source data.

Estimating coordinates from the artwork would manufacture precision.

Planner 10 therefore exposes:

`assessPlannerNavigationMaterialization(sourceRecordId)`

which returns:
- `COORDINATES_NOT_SOURCED` when an official map anchor exists but geospatial authority does not
- `SOURCE_RECORD_HAS_NO_MAP_ANCHOR` when even the map-anchor layer is unresolved

This makes the missing authority explicit rather than filling it with guessed coordinates.

## Source-version caution

The V01.05.26 map is a January 2026 artifact.

It remains useful for physical map labels and published corridor topology, but presentation naming can change faster than the printed map.

For example:
- the January map presentation legend says `WILDLIFE AMBASSADORS – 1 P.M.`
- the current Wildlife Presentations web page calls the 1 p.m. offering `Rady Ambassador Presentation Area`

Planner 10 therefore does not use the map's presentation legend as current schedule authority.

Planner 9's fresher presentation web source remains authoritative for current schedule naming/time.

## Scope boundary

Planner 10 does not yet:

- create production `NavigationPoint` coordinates
- create production `RouteNode` coordinates
- create Planner 2 walking edges from corridor totals
- interpolate coordinates from the illustrated map
- treat approximate corridor minutes as exact edge duration
- claim a specific guest entrance point inside Panda Ridge/Tiger Trail/Wegeforth Bowl
- use third-party map geometry as verified route authority

The next clean phase is an independent **geospatial authority** slice for one or two destinations, with explicit source provenance and a strict distinction between building/area centroid and actual guest-facing entrance point.
