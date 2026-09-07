# WildRoute Data

This directory is reserved for **production Zoo data packages**.

No generated UI screenshot, guessed coordinate, enclosure centroid, or straight-line approximation is allowed to become production routing truth.

## Required record qualities

Production records must carry:

- runtime-valid record shapes and enum/boolean values
- stable IDs
- source URL and source label
- last-verified timestamp
- confidence: `verified`, `provisional`, or `unknown`
- effective dates when a record is time-bounded

Guest-facing places must have:

- a guest navigation point
- a route-node ID in the same zone
- a zone ID
- optional Apple Maps label/place ID

Routing edges must explicitly model:

- distance
- duration
- difficulty
- stairs
- accessibility
- stroller suitability
- directionality
- closures/conditional status
- transport mode

Timed experiences must explicitly model:

- visit date that falls within any declared source effective window
- start/end time
- recommended arrival lead time
- destination place
- provenance

## CI authority

`npm run validate:data` executes the planner-data invariant suite.

The current JSON under `tests/fixtures/` is deliberately synthetic and uses non-Zoo coordinates. It exists only to prove the validator.

Production Zoo records will be added in later source-verification PRs.
