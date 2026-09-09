import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveIngressConditionalEdgeActivation,
  assertIngressConditionalEdgeActivationIntegrity,
  type ZooHoursRuntimeObservation,
  type IngressClosureRuntimeObservation,
  type ExactEdgeAvailabilityRuntimeObservation,
  type RuntimeRequirementDecision,
} from "../src/data/zooIngressRuntimeConditionalActivation.ts";
import {
  INGRESS_ROUTE_GRAPH_DATA,
} from "../src/data/zooIngressRouteEdgeMaterialization.ts";
import {
  buildRoutingGraph,
  findShortestRoute,
} from "../src/planner/routing.ts";

const CURRENT_AT =
  "2026-09-09T12:22:00-07:00";

type MutableActivationInput = {
  zooHours:
    ZooHoursRuntimeObservation;
  closureAdvisement:
    IngressClosureRuntimeObservation;
  exactEdgeAvailability:
    ExactEdgeAvailabilityRuntimeObservation[];
};

function validInput():
  MutableActivationInput {
  return {
    zooHours: {
      requirement:
        "VISIT_WITHIN_CURRENT_ZOO_HOURS" as const,
      observedAt: CURRENT_AT,
      freshness: "current" as const,
      status: "within-hours" as const,
      sourceLabel:
        "San Diego Zoo current hours",
    },
    closureAdvisement: {
      requirement:
        "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT" as const,
      observedAt: CURRENT_AT,
      freshness: "current" as const,
      status: "clear" as const,
      sourceLabel:
        "San Diego Zoo current ingress closure advisement",
    },
    exactEdgeAvailability: [
      {
        requirement:
          "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY" as const,
        sourceWayId: "755054695",
        observedAt: CURRENT_AT,
        freshness: "current" as const,
        status: "available" as const,
        sourceLabel:
          "Current exact availability for OSM way 755054695",
      },
      {
        requirement:
          "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY" as const,
        sourceWayId: "755054694",
        observedAt: CURRENT_AT,
        freshness: "current" as const,
        status: "available" as const,
        sourceLabel:
          "Current exact availability for OSM way 755054694",
      },
    ],
  };
}

test("Planner 24 enables both ingress RouteEdges only when all three runtime requirements are satisfied", () => {
  const result =
    resolveIngressConditionalEdgeActivation(
      validInput(),
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [
      "sdz-ingress-way-controlled-passage-route-edge",
      "sdz-ingress-way-front-street-connection-route-edge",
    ],
  );
  assert.deepEqual(
    result.decisions.map(
      (decision) => decision.status,
    ),
    ["enabled", "enabled"],
  );

  assert.doesNotThrow(() =>
    assertIngressConditionalEdgeActivationIntegrity(
      result,
    ),
  );
});

test("Planner 24 activation output routes the first production entrance path", () => {
  const activation =
    resolveIngressConditionalEdgeActivation(
      validInput(),
    );
  const graph = buildRoutingGraph(
    INGRESS_ROUTE_GRAPH_DATA,
  );
  const route = findShortestRoute(
    graph,
    {
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      enabledConditionalEdgeIds:
        activation.enabledConditionalEdgeIds,
    },
  );

  assert.equal(route.status, "found");
  if (route.status !== "found") {
    throw new Error(
      "expected Planner 24 activated ingress route",
    );
  }
  assert.equal(
    route.distanceMeters,
    42.212,
  );
  assert.equal(
    route.durationMinutes,
    0.586,
  );
});

test("missing runtime observations fail closed", () => {
  const result =
    resolveIngressConditionalEdgeActivation(
      {},
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [],
  );

  for (const decision of result.decisions) {
    assert.equal(
      decision.status,
      "blocked",
    );
    assert.deepEqual(
      decision.requirements.map(
        (requirement) =>
          requirement.reason,
      ),
      [
        "OBSERVATION_MISSING",
        "OBSERVATION_MISSING",
        "OBSERVATION_MISSING",
      ],
    );
  }
});

test("stale hours observation blocks every conditional ingress edge", () => {
  const input = validInput();
  input.zooHours.freshness = "stale";

  const result =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [],
  );
  for (const decision of result.decisions) {
    assert.equal(
      decision.requirements[0].reason,
      "OBSERVATION_STALE",
    );
  }
});

test("outside Zoo hours blocks every conditional ingress edge", () => {
  const input = validInput();
  input.zooHours.status =
    "outside-hours";

  const result =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [],
  );
  for (const decision of result.decisions) {
    assert.equal(
      decision.requirements[0].reason,
      "OUTSIDE_ZOO_HOURS",
    );
  }
});

test("current closure advisement blocks every conditional ingress edge", () => {
  const input = validInput();
  input.closureAdvisement.status =
    "closure";

  const result =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [],
  );
  for (const decision of result.decisions) {
    assert.equal(
      decision.requirements[1].reason,
      "CLOSURE_ADVISED",
    );
  }
});

test("unknown facility-level observations fail closed rather than assuming open", () => {
  const input = validInput();
  input.zooHours.status = "unknown";
  input.closureAdvisement.status =
    "unknown";

  const result =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [],
  );
  for (const decision of result.decisions) {
    assert.equal(
      decision.requirements[0].reason,
      "HOURS_UNKNOWN",
    );
    assert.equal(
      decision.requirements[1].reason,
      "CLOSURE_STATUS_UNKNOWN",
    );
  }
});

test("one unavailable exact edge produces partial activation only", () => {
  const input = validInput();
  input.exactEdgeAvailability[0].status =
    "unavailable";

  const result =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [
      "sdz-ingress-way-front-street-connection-route-edge",
    ],
  );
  assert.equal(
    result.decisions[0].status,
    "blocked",
  );
  assert.equal(
    result.decisions[0]
      .requirements[2].reason,
    "EXACT_EDGE_UNAVAILABLE",
  );
  assert.equal(
    result.decisions[1].status,
    "enabled",
  );
});

test("wrong-edge observation cannot satisfy exact-edge availability", () => {
  const input = validInput();
  input.exactEdgeAvailability =
    input.exactEdgeAvailability.filter(
      (observation) =>
        observation.sourceWayId !==
        "755054695",
    );

  const result =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [
      "sdz-ingress-way-front-street-connection-route-edge",
    ],
  );
  assert.equal(
    result.decisions[0]
      .requirements[2].reason,
    "OBSERVATION_MISSING",
  );
});

test("duplicate exact-edge observations fail closed instead of choosing one", () => {
  const input = validInput();
  input.exactEdgeAvailability = [
    ...input.exactEdgeAvailability,
    {
      ...input.exactEdgeAvailability[0],
      status: "unavailable",
      sourceLabel:
        "Conflicting duplicate observation",
    },
  ];

  const result =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [
      "sdz-ingress-way-front-street-connection-route-edge",
    ],
  );
  assert.equal(
    result.decisions[0]
      .requirements[2].reason,
    "EXACT_EDGE_AVAILABILITY_UNKNOWN",
  );
});

test("stale exact-edge observation blocks only its matching edge", () => {
  const input = validInput();
  input.exactEdgeAvailability[1].freshness =
    "stale";

  const result =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [
      "sdz-ingress-way-controlled-passage-route-edge",
    ],
  );
  assert.equal(
    result.decisions[1]
      .requirements[2].reason,
    "OBSERVATION_STALE",
  );
});

test("invalid observation metadata fails closed", () => {
  const input = validInput();
  input.zooHours.observedAt =
    "not-a-timestamp";
  input.exactEdgeAvailability[0]
    .sourceLabel = "   ";

  const result =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [],
  );
  assert.equal(
    result.decisions[0]
      .requirements[0].reason,
    "HOURS_UNKNOWN",
  );
  assert.equal(
    result.decisions[0]
      .requirements[2].reason,
    "EXACT_EDGE_AVAILABILITY_UNKNOWN",
  );
});

test("activation result is deeply immutable", () => {
  const result =
    resolveIngressConditionalEdgeActivation(
      validInput(),
    );

  assert.equal(
    Object.isFrozen(result),
    true,
  );
  assert.equal(
    Object.isFrozen(
      result.enabledConditionalEdgeIds,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      result.decisions,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      result.decisions[0]
        .requirements,
    ),
    true,
  );
});

test("activation integrity rejects an enabled edge whose requirement is blocked", () => {
  const result = structuredClone(
    resolveIngressConditionalEdgeActivation(
      validInput(),
    ),
  );
  (
    result.decisions[0]
      .requirements as RuntimeRequirementDecision[]
  )[2] = {
    requirement:
      "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
    status: "blocked",
    reason:
      "EXACT_EDGE_UNAVAILABLE",
  };

  assert.throws(
    () =>
      assertIngressConditionalEdgeActivationIntegrity(
        result,
      ),
    /not fail-closed/,
  );
});

test("partial activation does not create an end-to-end entrance route", () => {
  const input = validInput();
  input.exactEdgeAvailability[0].status =
    "unavailable";
  const activation =
    resolveIngressConditionalEdgeActivation(
      input,
    );

  const route = findShortestRoute(
    buildRoutingGraph(
      INGRESS_ROUTE_GRAPH_DATA,
    ),
    {
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      enabledConditionalEdgeIds:
        activation.enabledConditionalEdgeIds,
    },
  );

  assert.deepEqual(
    route,
    {
      status: "not-found",
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      reason: "NO_ROUTE",
    },
  );
});
