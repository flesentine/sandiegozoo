# Planner 24 — Runtime Conditional RouteEdge Activation

**Status:** fail-closed runtime activation resolver for the first production ingress RouteEdges

Planner 24 turns the Planner 20 operational requirements and Planner 23 exact-edge bindings into a runtime decision that can be passed directly to routing as:

`enabledConditionalEdgeIds`

## Why this phase exists

Planner 23 materialized the first real RouteEdges, but both have:

`status: "conditional"`

The routing engine correctly excludes conditional edges unless their IDs are explicitly enabled.

Planner 24 is the gate that decides whether each exact ingress edge is safe to enable.

## Required runtime observations

Every ingress edge requires all three Planner 20 conditions:

1. `VISIT_WITHIN_CURRENT_ZOO_HOURS`
2. `NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT`
3. `AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY`

Planner 24 accepts explicit observations for those requirements.

It does **not** infer them from:

- the Zoo being generally open every day
- the absence of online closure information
- historical operating hours
- the existence of the OSM way
- another ingress edge being available

## Observation freshness

Every observation must explicitly declare:

- `freshness: "current"`
- a valid timezone-aware `observedAt`
- a non-empty source label

A stale observation fails closed.

Planner 24 deliberately does not invent a numeric max-age window. The source integration that creates an observation is responsible for deciding whether its data is still current.

## Facility-level observations

### Zoo hours

Accepted positive state:

`within-hours`

Blocked states:

- `outside-hours`
- `unknown`
- missing
- stale
- invalid metadata

### Closure advisement

Accepted positive state:

`clear`

Blocked states:

- `closure`
- `unknown`
- missing
- stale
- invalid metadata

## Exact-edge observation

Each RouteEdge additionally requires a current observation bound to its own exact OSM source way.

Accepted positive state:

`available`

Blocked states:

- `unavailable`
- `unknown`
- missing
- stale
- invalid metadata
- duplicate/conflicting observations for the same source way

A positive observation for way `755054694` cannot satisfy way `755054695`, or vice versa.

## Output

Planner 24 exports:

`resolveIngressConditionalEdgeActivation(input)`

The result contains:

- `enabledConditionalEdgeIds`
- one decision per conditional ingress RouteEdge
- one decision per required runtime condition

Only edges whose three requirement decisions are all `satisfied` appear in `enabledConditionalEdgeIds`.

## Partial activation

Edges are evaluated independently.

If one exact ingress edge is currently available and the other is not, Planner 24 may enable only the available edge.

The routing graph remains fail-closed naturally: the full Main Entrance → Front Street path still fails unless **both** required RouteEdges are enabled.

## First end-to-end runtime proof

With all three runtime conditions satisfied for both exact source ways:

- `sdz-ingress-way-controlled-passage-route-edge` is enabled
- `sdz-ingress-way-front-street-connection-route-edge` is enabled

The routing engine then finds:

`Main Entrance → interior → Front Street`

with the existing Planner 23 totals:

- **42.212 m**
- **0.586 min**

## Integrity guarantees

Planner 24 rejects or detects:

- missing edge decisions
- duplicate decision coverage
- unknown enabled edge IDs
- wrong source-way bindings
- changed requirement order/set
- enabled edges with any blocked requirement
- blocked edges appearing in `enabledConditionalEdgeIds`

The activation result is recursively frozen.

## What Planner 24 does not do

Planner 24 does **not**:

- fetch live Zoo data itself
- scrape operating hours
- decide observation freshness from an arbitrary hard-coded TTL
- treat silence as a positive closure check
- infer exact-edge availability from facility-level status
- bypass the router's conditional-edge mechanism

It is a deterministic policy gate between runtime observations and routing.

## Next boundary

After Planner 24, the entrance RouteEdges have both:

- qualified production data
- a safe runtime activation path

Planner 25 should begin expanding the production graph **beyond Front Street**, starting with the next source-backed pedestrian junction/corridor toward high-priority destinations.
