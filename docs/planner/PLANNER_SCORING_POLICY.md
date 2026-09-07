# Planner 4 — Priority / Scoring Policy Foundation

**Status:** implementation baseline

Planner 4 defines how WildRoute represents authority, preference, pace, and soft route comfort before the full optimizer exists.

It deliberately does **not** reduce every planner concern to one numeric score.

## Three separate dimensions

Every candidate has:

### Authority
- `locked` — booked reservation; never auto-dropped
- `required` — must-attend timed item; never auto-dropped
- `protected` — Must-See; near-hard and never silently dropped
- `optional` — Favorite, Interested, or Bonus; may be dropped with an explicit reason

### Timing
- `fixed`
- `windowed`
- `flexible`

Timing describes scheduling shape. It does not by itself imply importance.

### Preference
- `must`
- `favorite`
- `bonus`

Preference score is intentionally separate from authority.

A required Favorite still outranks an optional Must in authority ordering even though the optional Must has more preference points.

## UI mapping

Current planning UI maps as follows:

- Animal Must-See → protected / flexible / must
- Animal Favorite → optional / flexible / favorite
- Experience Must → required / windowed / must
- Experience Interested → optional / windowed / favorite
- booked reservation → locked / fixed / must
- planner-added Bonus → optional / flexible / bonus

Unselected UI items do not become scoring candidates.

## Preference points

V1 frozen preference points:

- Must: **1000**
- Favorite: **100**
- Bonus: **10**

These values are only preference utility. They are not a substitute for authority.

The future optimizer must feasibility-pass locked, required, and protected work before optional competition.

## Pace policy

V1 pace policy:

| Pace | Dwell multiplier | Between-stop buffer |
| --- | ---: | ---: |
| Relaxed | 1.15× | 10 min |
| Balanced | 1.00× | 5 min |
| Maximize | 0.90× | 2 min |

Adjusted dwell rounds up to the next whole minute.

The numbers are a product policy baseline, not a claim about human walking physiology. They can be versioned later if simulation shows a better calibration.

## Prefer easier paths

Hard accessibility remains Planner 2 authority.

`Prefer easier paths` is a **soft** scoring preference:

- easy walking edge: no penalty
- moderate edge: 0.25 points per travel minute
- steep edge: 1 point per travel minute
- any non-easy walking edge: additional 0.5 points

This can rank otherwise similar optional candidates/routes lower without making them unreachable.

Wheelchair/stroller constraints remain hard filters and are never replaced by this penalty.

## Deterministic candidate ordering

Within the current scoring comparator:

1. authority rank
2. raw preference tier / points
3. net preference points after soft route comfort
4. shorter pace-adjusted dwell
5. stable candidate ID using fixed code-unit ordering

This means an easier-path penalty can choose between two Favorites, but it cannot demote a Favorite below a Bonus.

Input array order is not authority.

## Drop policy

Optional items may be omitted only with an explicit reason:

- outside horizon
- no route
- anchor conflict
- insufficient time
- lower-priority alternative
- data unavailable
- user removed

Locked, required, and protected candidates are never returned as silently dropped.

Attempting to omit one produces:

`tradeoff-required`

The future optimizer/UI must surface that conflict to the visitor.

## Scope boundary

Planner 4 does not yet:

- solve the all-day itinerary
- choose which show performance wins
- sum combinations of optional candidates
- schedule food/rest
- select alternate routes for soft easier-path preference
- run the Must-See feasibility pass
- decide the final item to sacrifice when protected constraints conflict

It freezes the policy primitives that those later search phases must obey.


## Aggregate preference utility

Preference points are **not additive across tiers** for itinerary choice.

Planner 4 now exposes a lexicographic preference utility vector. Candidate sets are compared tier-by-tier:

1. Must count, then Must net utility
2. Favorite count, then Favorite net utility
3. Bonus count, then Bonus net utility

Therefore:

- any feasible Must outranks any number of Favorites/Bonuses
- any feasible Favorite outranks any number of Bonuses
- soft route comfort distinguishes choices within a preference tier

This prevents the future optimizer from sacrificing one Favorite merely because many 10-point Bonuses sum to more than 100.

## Runtime trust boundary

Scoring candidates are runtime-validated before ranking, partitioning, scoring, or omission decisions.

Validation rejects:

- non-object candidates
- empty or whitespace-padded stable IDs
- unknown authority
- unknown timing
- unknown preference priority
- non-positive/non-integer dwell
- invalid pace
- non-boolean easier-path preference
- duplicate candidate IDs
- unknown omission reasons

Unknown UI priority values fail closed instead of falling through to Favorite/Interested behavior.

## Pace and timed work

Pace dwell multipliers apply only to **flexible** candidates.

Fixed and windowed service durations preserve their supplied duration. Relaxed/Maximize pace may change buffers and flexible-stop dwell, but it cannot stretch or compress a booked reservation or scheduled presentation.
