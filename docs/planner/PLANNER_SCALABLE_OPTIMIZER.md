# Planner 6 — Scalable Optimizer Foundation

**Status:** exact scalable-search baseline

Planner 6 introduces a second optimizer engine without changing Planner 5.

Planner 5 remains the exhaustive small-input oracle.

Planner 6 must reproduce the oracle exactly on bounded fixtures before any larger-set result is trusted.

## Shared execution authority

Planner 6 does not reimplement candidate semantics.

Planner 5 now exports shared execution primitives for:

- optimizer request validation
- candidate grouping / alternative consistency
- initial search state
- candidate transition timing
- fixed/windowed anchor handling
- fastest-route authority
- scoring
- finalization / required-exit handling
- plan comparison

Both engines therefore execute the same routing, schedule, scoring, and tie-break contracts.

## Exact search, not approximation

The scalable engine remains exact when it returns `complete`.

It adds only correctness-preserving acceleration:

### Pairwise route cache

Fastest constrained routes are memoized by ordered node pair for the duration of one optimization request.

Cached results are cloned on read so search branches and returned itineraries do not share mutable route/provenance objects.

### Dominance pruning

For the same:

- selected logical request set
- current route node

a state is pruned only when another state has:

- equal-or-better preference utility
- no later current minute
- no more travel minutes
- no more travel distance
- and, when all metrics are equal, an equal-or-better lexical path signature

Because future feasibility depends only on current node/time, remaining logical requests, and fixed request policy, the dominated state cannot produce a better final itinerary.

### Utility upper bound

For every unselected logical request, the engine assumes an optimistic zero-penalty preference contribution.

If even that optimistic utility cannot beat the current best plan, the branch is pruned.

When optimistic utility ties the best plan, already-worse travel/time lower bounds may also safely prune the branch.

## Explicit limits

Planner 6 accepts up to:

**20 candidate records**

The default exact search state budget is:

**500,000 evaluated states**

If the state budget is exhausted, Planner 6 returns:

`search-budget-exceeded`

It does not return the best partial plan as though it were optimal.

If more than 20 candidate records are supplied:

`candidate-limit-exceeded`

The larger limit is a foundation guardrail, not a final production capacity promise.

## Differential qualification

Every bounded Planner 6 fixture also runs through Planner 5.

The semantic result must match exactly for:

- status
- selected candidate IDs
- selected logical selection keys
- step order and times
- utility
- finish / remaining time
- travel totals
- exit behavior
- omissions and omission reasons
- unselected performance alternatives
- mandatory tradeoff combinations

`evaluatedStates` is engine-specific and is not expected to match.

## Scope boundary

Planner 6 does not yet:

- guarantee every real Zoo-sized request fits the 500k state budget
- add pairwise route-matrix persistence across requests
- implement live replanning
- add meals/rest generation
- use production Zoo data
- parallelize search
- persist optimizer traces
- claim heuristic/approximate answers when exact search cannot finish

The next performance phases can raise capacity only while preserving Planner 5 differential parity on bounded cases.


## Dominance proof hardening

The final pre-merge review found a deterministic tie-break counterexample in the first dominance rule.

An earlier state is not automatically safe to keep over a later state when utility and travel totals tie.

Why: a future fixed/windowed anchor can force both states to wait until the same service time, erasing the earlier state's clock advantage. If the later state has a lexicographically better candidate-order signature, Planner 5's final comparator must choose the later state after that wait.

The dominance rule is therefore stricter:

- better utility may dominate when the other monotone metrics are no worse
- better travel totals may dominate under the existing monotone constraints
- when utility and both travel totals tie, the dominating state must also have an equal-or-better lexical history signature **even if its current minute is earlier**

A dedicated differential regression constructs exactly this “time advantage erased by future fixed anchor” case and pins Planner 6 to Planner 5.

## Upper-bound proof review

The optimistic utility bound remains sound:

- each unselected selection key contributes at most one future candidate
- alternatives share preference tier by Planner 5 validation
- the bound grants the full raw preference points with zero route-comfort penalty
- it ignores feasibility, route time, dwell, buffers, and schedule conflicts

Those choices can only overestimate future utility.

Travel/time pruning is applied only when this optimistic utility can do no better than the current best:

- current travel minutes are a monotone lower bound on final travel minutes
- when travel minutes tie, current travel distance is a monotone lower bound on final distance
- when utility and travel totals tie, current minute greater than the best final finish cannot recover because future work has non-negative elapsed time

Targeted oracle-parity regressions verify that a branch with a remaining higher-tier Favorite is never pruned merely because it currently has worse travel, and that upper-bound pruning is actually exercised on a bounded fixture.
