# Planner 47 — Treetops pedestrian direction

Planner 47 qualifies pedestrian direction for the exact Planner 44/46 Treetops segment.

## Exact source capture

Planner 47 fetched the exact historical OpenStreetMap object:

- way: `148910139`
- version: `7`
- version URL: `https://api.openstreetmap.org/api/0.6/way/148910139/7`
- timestamp: `2026-02-21T20:28:40Z`
- changeset: `178875711`
- temporary capture CI: WildRoute CI #912

The complete exact-version tag set returned by OSM was:

- `highway=footway`
- `name=Treetops Way`
- `surface=concrete`

There was no `oneway` tag and no `oneway:foot` tag.

The temporary network capture harness is not part of the permanent Planner 47 diff.

## Direction policy

Planner 47 freezes a Treetops-specific pedestrian-direction policy for exact `highway=footway` segments:

- pedestrian one-way authority: explicit `oneway:foot` only
- absent explicit pedestrian restriction: bidirectional by default
- source way ordering: geometry only, not direction authority
- scope: static OSM baseline

Semantic references:

- `https://wiki.openstreetmap.org/wiki/Restrictions`
- `https://wiki.openstreetmap.org/wiki/Key:oneway:foot`

## Result

For the exact segment from node `1619736626` to node `13588159626`:

- `oneWay = false`
- `direction = bidirectional`

This is a static source baseline, not a claim about current operational status.

Still blocked:

- walking duration
- difficulty
- stairs
- accessibility
- stroller suitability
- operational status

No RouteNode or RouteEdge is materialized here.
