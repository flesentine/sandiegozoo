# Planner 7 — Scalable Optimizer Qualification

**Status:** deterministic qualification harness

Planner 7 does not make the optimizer smarter.

It freezes how WildRoute decides whether the exact scalable optimizer is qualified for a workload shape before production data is introduced.

## No wall-clock CI gates

Planner qualification intentionally does **not** use elapsed milliseconds as a correctness gate.

Wall-clock timing varies across CI hosts and can create flaky builds.

Instead, qualification measures deterministic algorithmic work:

- evaluated search states
- dominance-pruned states
- upper-bound-pruned states
- route-cache hits
- route-cache misses
- state-budget headroom
- semantic Planner 5 oracle parity for bounded fixtures

These metrics are stable for an exact source/data fixture and therefore suitable for regression gates.

## Qualification scenario

Every scenario declares:

- stable scenario ID
- optimizer request
- exact state budget
- expected top-level scalable status
- optional maximum evaluated states
- optional minimum remaining budget headroom
- optional minimum dominance pruning
- optional minimum upper-bound pruning
- optional minimum route-cache hits
- optional maximum route-cache misses
- optional Planner 5 oracle-parity requirement

The harness returns a structured report rather than throwing on a threshold miss.

Invalid harness configuration still fails closed.

## Budget headroom

For a completed scenario:

`budgetHeadroomStates = stateBudget - evaluatedStates`

The report also exposes a deterministic six-decimal headroom ratio.

Headroom is intentionally explicit because “completed below the budget” is not enough evidence for production-shaped workloads. A workload completing at 499,999 of 500,000 states has essentially no operating margin.

## Oracle parity

A scenario may require Planner 5 parity.

When enabled:

- Planner 5 must accept the request inside its eight-record bound
- Planner 6 must return `complete`
- semantic optimizer output must match after removing engine-specific `evaluatedStates`

Parity covers the same planner authority already frozen in Planner 6:

- selected candidates and order
- anchors/timing
- utility
- travel totals
- omissions
- tradeoffs
- exit behavior

## Frozen synthetic workload families

Planner 7 qualification uses several intentionally different deterministic shapes:

1. **Oracle-mixed** — bounded authority + show alternatives + optional utility; requires Planner 5 parity.
2. **Same-node-12** — twelve optional records at one node; stresses subset/order dominance and cache reuse beyond the oracle limit.
3. **Line-upper-bound** — ordered graph where a bad permutation accumulates a provably worse travel lower bound; requires upper-bound pruning.
4. **Timed-anchor-reset** — fixed anchors plus flexible work; protects the dominance/tie-break counterexample fixed in Planner 6 and requires oracle parity.
5. **Budget-saturation sentinel** — deliberately tiny state budget; must return explicit budget exhaustion and never a partial itinerary.

The thresholds belong to these exact synthetic fixtures. They are not claims about the final Zoo production workload.

## Scope boundary

Planner 7 does not yet:

- qualify real San Diego Zoo data
- promise that 20 arbitrary records complete below 500k states
- use wall-clock latency as a release gate
- persist qualification history
- benchmark devices/browsers
- generate meal/rest candidates
- perform live replanning

The next data-integration phase can use this harness to qualify production-shaped candidate sets before routing them into the visitor experience.


## Final pre-merge qualification review

The qualification layer itself is a runtime trust boundary.

The final review hardened threshold configuration so the harness rejects:

- invalid expected status values
- NaN / infinite thresholds
- negative thresholds
- fractional count thresholds
- minimum headroom larger than the configured state budget
- non-boolean oracle-parity flags
- contradictory parity configuration that expects a non-complete scalable result
- malformed scenario / threshold objects

A malformed threshold can therefore no longer disable a comparison through JavaScript numeric behavior such as comparisons against NaN.

### Semantic parity normalization

Planner 5/6 parity no longer depends on object property insertion order.

Before comparison, optimizer results are recursively canonicalized:

- object keys are sorted
- array ordering is preserved
- engine-specific `evaluatedStates` fields are removed

This keeps ordering that is planner semantics (candidate/step arrays) while ignoring irrelevant object-key construction order.

### Budget exhaustion reporting

Qualification reports now distinguish:

- `budgetExhausted`
- remaining headroom states
- budget overrun states
- headroom ratio

Planner 6's sentinel state that detects exhaustion evaluates one state beyond the configured budget. A budget-exhausted report therefore records zero headroom and the explicit one-state overrun rather than allowing a clamped headroom value to hide how exhaustion was detected.

### Capacity gates vs implementation-detail diagnostics

Prune/cache counters remain available as optional qualification thresholds and are useful for dedicated mechanism tests.

However, the frozen workload-family release gates no longer require specific dominance/cache/upper-bound counter activity.

Why: a later exact implementation may legitimately reduce state count by a different proof, precompute a route matrix, or eliminate a branch before the current pruning mechanism runs. Requiring an internal counter would then reject an objectively better implementation.

The frozen workload gates therefore prioritize:

- exact completion / explicit exhaustion status
- maximum evaluated states
- minimum budget headroom
- Planner 5 oracle parity when available

Planner 6's focused engine tests remain responsible for proving that dominance pruning, upper-bound pruning, and route caching work when those mechanisms are present.

### Report isolation and suite ordering

Qualification reports copy optimizer statistics and construct fresh failure arrays.

Regression tests now prove that mutating one returned report does not contaminate a later qualification run and that running the frozen scenarios in reverse order produces the same per-scenario evidence.


## Final release-gate hardening

The final pre-merge code review treats qualification configuration as untrusted release-policy input.

Planner 7 now rejects:

- unknown scenario fields
- unknown threshold fields / misspelled threshold names
- unsafe-integer budgets and count thresholds
- budget-headroom thresholds on non-complete expected statuses
- `complete` scenarios that provide no capacity or oracle-parity evidence beyond the status itself

A scenario cannot therefore become green merely because a threshold name was misspelled or because all meaningful gates were omitted.

## Status / metric consistency

The qualification harness independently checks optimizer status against deterministic state accounting:

- `complete` may not evaluate beyond the declared state budget
- `search-budget-exceeded` must actually cross the declared state budget
- `candidate-limit-exceeded` must occur before any search state is evaluated

Violations are reported as:

`STATUS_METRICS_INCONSISTENT`

Budget-edge regressions pin both:
- exact-budget completion
- budget-plus-one exhaustion

The report distinguishes:
- `budgetHeadroomStates`
- `budgetOverrunStates`
- `budgetExhausted`

so exhaustion is never disguised as zero headroom.

## Oracle isolation and semantic comparison

Planner 6 and Planner 5 now receive independent snapshots of the same qualification request while sharing only the immutable compiled routing graph authority.

Candidate objects, anchors, horizon, score context, and route-policy arrays are cloned separately for each engine.

A future accidental mutation by one engine therefore cannot change the input seen by the other engine or contaminate the caller's scenario.

Oracle semantic comparison ignores only the **top-level engine-specific** `evaluatedStates` field.

Nested fields named `evaluatedStates` are no longer recursively discarded, preventing a future meaningful nested metric from being silently hidden by parity normalization.

## Determinism

The qualification suite now proves:

- running the same scenario twice produces the same report
- source scenario data remains unchanged
- reversing scenario execution order does not change any per-scenario report

Qualification evidence is therefore independent of suite ordering and prior scenario execution.
