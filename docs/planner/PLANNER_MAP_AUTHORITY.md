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


## Final map/topology authority review

A focused pre-merge review rechecked the current code against both pages of the official accessibility PDF and found three authority-model issues.

### Route legend is not a physical map anchor

The accessibility PDF's second page lists `TIGER TRAIL` under **Walking the Zoo** as:

- 20-minute walk
- Entrance to Tigers
- Mild to Steep Terrain

That is strong corridor/endpoint authority.

It is not the same thing as the first-page illustrated map visibly labeling a physical guest-facing anchor named `TIGER TRAIL`.

Planner 10 therefore removes the Tiger Trail `map-anchor-only` record.

Tiger Trail remains source-backed through:
- the 20-minute Entrance → Tigers endpoint corridor
- Treetops Way's published access to `Tiger`

Navigation materialization for Tiger Trail now correctly remains `SOURCE_RECORD_HAS_NO_MAP_ANCHOR`.

### Corridor relationship semantics

The old `targetSourceRecordId` field was too strong.

For example:
- Park Way says it provides **access to** Panda Ridge
- Treetops Way says it provides **access to** Tiger
- Monkey Trail explicitly says **Entrance to Gorillas**
- Tiger Trail explicitly says **Entrance to Tigers**

Planner 10 now models source-record relationships as:

- `relation: "access"`
- `relation: "endpoint"`

Access relationships require published access labels.
Endpoint relationships require published from/to descriptors.

This prevents an access corridor from being mistaken for an exact route endpoint.

### Unknown materialization requests fail closed

`assessPlannerNavigationMaterialization(...)` previously returned `SOURCE_RECORD_HAS_NO_MAP_ANCHOR` even for a completely unknown source-record ID.

It now returns:

`SOURCE_RECORD_UNKNOWN`

An unknown identity can no longer masquerade as a known destination that merely lacks coordinates.

### Artifact and mapping integrity

The final review also hardens:

- real calendar-date validation for map revision dates
- timezone-bearing observation timestamp validation
- official Zoo HTTPS PDF URL validation
- revision date cannot be later than observation date
- source-record/map-anchor role compatibility
- duplicate semantic source-record anchor mappings
- duplicate/blank corridor access labels
- duplicate source-record corridor relationships
- deterministic lookup ordering

The accessibility map's wheelchair symbols remain source imagery only.

Planner 10 still does **not** convert them into Planner 2 `accessible` or `stroller` booleans, because the corridor records are not exact route edges.
