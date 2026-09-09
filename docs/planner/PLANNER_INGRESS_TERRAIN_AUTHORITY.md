# Planner 18 — Stairs + Difficulty Authority

**Status:** official corridor terrain/stairs evidence captured; exact ingress RouteEdge difficulty/stairs remain blocked

Planner 18 isolates two RouteEdge semantic classes:

- `difficulty`
- `stairs`

The phase preserves exact source wording and refuses to convert corridor-level terrain into exact-edge Planner booleans/enums without a defensible mapping.

## Official terrain authority

The current San Diego Zoo **Resource Map for Guests with Disabilities** publishes named walking corridors and terrain descriptions.

Planner 18 preserves all current Planner 10 corridor terrain values one-to-one:

- Front Street — `mild`
- Park Way — `mild-to-steep`
- Center Street — `steep`
- Treetops Way — `mild`
- Fern Canyon Trail — `steep-and-stairs`
- Monkey Trail — `mild`
- Tiger Trail — `mild-to-steep`

These become:

`corridor-terrain-evidence-only`

No corridor terrain value is automatically converted into Planner:

- `easy`
- `moderate`
- `steep`

because the repository has not prospectively defined that translation policy.

## Positive stairs evidence

Fern Canyon Trail explicitly carries:

`steep-and-stairs`

Planner 18 therefore records:

`stairsEvidence: "explicitly-published"`

for that named corridor.

All other published corridor records use:

`stairsEvidence: "not-explicitly-published"`

That phrase is deliberate. It does **not** mean `stairs=false`.

## Exact OSM stairs semantics

Planner 18 also freezes the OSM semantic boundary:

- exact `highway=steps` can support `stairs=true`
- absence of `highway=steps` cannot support `stairs=false`
- `incline=*` may preserve slope evidence, but no Planner difficulty thresholds have been defined yet

The current two ingress source-tag snapshots remain:

### OSM way 755054695

- `highway=pedestrian`
- `oneway=yes`
- `tunnel=building_passage`
- no exact steps/incline authority

### OSM way 755054694

- `highway=pedestrian`
- no exact steps/incline authority

## Exact ingress boundary

Planner 12/13 proves that way 755054694 is the interior continuation terminating at the Front Street connection node.

Planner 18 therefore retains Front Street terrain context for that exact way, but the official illustrated map still does not georeference the exact OSM geometry.

### Controlled passage — 755054695

`difficulty`:

`EXACT_EDGE_DIFFICULTY_NOT_SOURCED`

`stairs`:

`EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED`

### Front Street connection — 755054694

`difficulty`:

`CORRIDOR_TERRAIN_NOT_EXACT_EDGE_AUTHORITY`

with the exact Front Street terrain evidence ID.

`stairs`:

`EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED`

with the same corridor terrain context retained, but not promoted.

## Why Mild Terrain is not "easy"

Planner's RouteDifficulty contract is:

- `easy`
- `moderate`
- `steep`

The Zoo source uses:

- `mild`
- `mild-to-steep`
- `steep`
- `steep-and-stairs`

Only `steep` happens to share wording with the Planner enum.

Planner 18 does not cherry-pick that lexical overlap or invent thresholds for the other values.

`assessPlannerDifficultyForPublishedTerrain(...)` therefore remains blocked with:

`DIFFICULTY_POLICY_NOT_DEFINED`

for every current corridor terrain value.

## Planner 14 integration

Planner 14 now delegates:

- `difficultyAuthority` → Planner 18
- `stairsAuthority` → Planner 18

and preserves exact source snapshot IDs and corridor terrain evidence IDs when relevant.

The shared RouteEdge audit fails if either field is guessed or independently reinterpreted.

## Integrity rules

Planner 18 fails closed if:

- any published corridor loses its one-to-one terrain evidence record
- corridor terrain wording drifts from Planner 10
- stairs evidence is invented on a corridor that does not publish stairs
- Fern Canyon explicit stairs evidence is weakened
- an exact ingress source-tag snapshot disappears
- Front Street terrain context is attached without the qualified Planner 12/13 topology
- `stairs=false` is inferred from absence of `highway=steps`
- a Planner difficulty value is guessed from corridor terminology
- Planner 14 stops matching the exact Planner 18 assessment

All exported terrain authority is recursively frozen.

## What Planner 18 does not claim

Planner 18 does **not** claim:

- either current ingress edge has stairs
- either current ingress edge is stair-free
- either current ingress edge is easy/moderate/steep
- the whole Front Street corridor is represented by OSM way 755054694
- every steep corridor contains stairs
- every corridor without published stairs is stair-free

## Next boundary

After Planner 18, the remaining ingress RouteEdge contract fields are primarily:

- duration
- operational status
- pedestrian direction
- accessibility
- stroller suitability

The best next candidate is a **prospective walking-duration policy**, because exact distances are already frozen and a prospectively defined speed/rounding policy could potentially promote `durationMinutes` without pretending the Zoo published segment-level times.
