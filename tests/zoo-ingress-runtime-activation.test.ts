import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveIngressRuntimeActivation,
  type IngressRuntimeOperationalSnapshot,
} from "../src/data/zooIngressRuntimeActivation.ts";
import {
  INGRESS_ROUTE_EDGES,
  INGRESS_ROUTE_GRAPH_DATA,
} from "../src/data/zooIngressRouteEdgeMaterialization.ts";
import {
  buildCandidateIntegration,
  type CandidateIntegrationInput,
} from "../src/planner/integration.ts";
import {
  findShortestRoute,
} from "../src/planner/routing.ts";
import type { VisitPreferences } from "../src/planning/visitPreferences.ts";
import type { DayPreferences } from "../src/planning/dayPreferences.ts";
import type { PriorityPreferences } from "../src/planning/priorityPreferences.ts";

function snapshot(
  overrides:
    Partial<IngressRuntimeOperationalSnapshot> = {},
): IngressRuntimeOperationalSnapshot {
  return {
    visitDate: "2026-09-09",
    evaluatedAt:
      "2026-09-09T14:20:00-07:00",
    zooHours: {
      evidenceId:
        "hours-2026-09-09",
      status: "inside",
      validForDate: "2026-09-09",
      observedAt:
        "2026-09-09T08:00:00-07:00",
      expiresAt:
        "2026-09-09T21:00:00-07:00",
    },
    closureAdvisement: {
      evidenceId:
        "closure-2026-09-09",
      status: "clear",
      validForDate: "2026-09-09",
      observedAt:
        "2026-09-09T14:00:00-07:00",
      expiresAt:
        "2026-09-09T15:00:00-07:00",
    },
    exactEdgeAvailability: [
      {
        evidenceId:
          "edge-755054695-availability",
        sourceWayId:
          "755054695",
        status: "available",
        validForDate:
          "2026-09-09",
        observedAt:
          "2026-09-09T14:10:00-07:00",
        expiresAt:
          "2026-09-09T14:40:00-07:00",
      },
      {
        evidenceId:
          "edge-755054694-availability",
        sourceWayId:
          "755054694",
        status: "available",
        validForDate:
          "2026-09-09",
        observedAt:
          "2026-09-09T14:10:00-07:00",
        expiresAt:
          "2026-09-09T14:40:00-07:00",
      },
    ],
    ...overrides,
  };
}

function visit(): VisitPreferences {
  return {
    date: "2026-09-09",
    arrival: "09:00",
    departure: "17:00",
    party: {
      adults: 2,
      kids: 1,
    },
    stroller: false,
    easyPaths: false,
    wheelchair: false,
    reservation: {
      name: "",
      time: "",
    },
  };
}

function day(): DayPreferences {
  return {
    foodCategories: ["anything"],
    lunchStyle: "balanced",
    pace: "balanced",
    useSkyfari: true,
  };
}

function priorities(): PriorityPreferences {
  return {
    animals: {},
    experiences: {},
  };
}

function integrationInput(
  activation:
    ReturnType<
      typeof resolveIngressRuntimeActivation
    >,
  overrides:
    Partial<CandidateIntegrationInput> = {},
): CandidateIntegrationInput {
  return {
    data: INGRESS_ROUTE_GRAPH_DATA,
    visit: visit(),
    day: day(),
    priorities: priorities(),
    initialNodeId:
      "sdz-ingress-node-main-entrance-route-node",
    endNodeId:
      "sdz-ingress-node-front-street-route-node",
    bindings: {
      animals: {},
      experiences: {},
    },
    enabledConditionalEdgeIds:
      activation
        .enabledConditionalEdgeIds,
    conditionalEdgeRuntimeTrust:
      activation
        .conditionalEdgeRuntimeTrust,
    ...overrides,
  };
}

test("fresh current evidence activates both exact Planner 23 ingress edges", () => {
  const result =
    resolveIngressRuntimeActivation(
      snapshot(),
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [
      "sdz-ingress-way-controlled-passage-route-edge",
      "sdz-ingress-way-front-street-connection-route-edge",
    ],
  );
  assert.deepEqual(
    result.conditionalEdgeRuntimeTrust,
    {
      authority:
        "qualified-runtime-conditional-edge-activation",
      visitDate: "2026-09-09",
      evaluatedAt:
        "2026-09-09T14:20:00-07:00",
      edgeIds: [
        "sdz-ingress-way-controlled-passage-route-edge",
        "sdz-ingress-way-front-street-connection-route-edge",
      ],
    },
  );
  assert.deepEqual(
    result.decisions.map(
      (decision) => [
        decision.sourceWayId,
        decision.status,
        decision.reason,
      ],
    ),
    [
      [
        "755054695",
        "enabled",
        "ENABLED",
      ],
      [
        "755054694",
        "enabled",
        "ENABLED",
      ],
    ],
  );
});

test("Planner 24 activation makes the Planner 23 route actually routable through candidate integration", () => {
  const activation =
    resolveIngressRuntimeActivation(
      snapshot(),
    );
  const integration =
    buildCandidateIntegration(
      integrationInput(activation),
    );

  assert.equal(
    integration.status,
    "ready",
  );
  if (
    integration.status !== "ready"
  ) {
    throw new Error(
      "expected ready ingress integration",
    );
  }

  assert.deepEqual(
    integration.routingGate
      .disabledUnverifiedEdgeIds,
    [],
  );
  assert.deepEqual(
    integration.request.routePolicy
      ?.enabledConditionalEdgeIds,
    activation
      .enabledConditionalEdgeIds,
  );

  const route = findShortestRoute(
    integration.request.graph,
    {
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      enabledConditionalEdgeIds:
        activation
          .enabledConditionalEdgeIds,
    },
  );

  assert.equal(route.status, "found");
  if (route.status !== "found") {
    throw new Error(
      "expected activated ingress route",
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

test("missing exact-edge evidence activates only the independently proven edge", () => {
  const base = snapshot();
  const result =
    resolveIngressRuntimeActivation({
      ...base,
      exactEdgeAvailability:
        base.exactEdgeAvailability.filter(
          (evidence) =>
            evidence.sourceWayId ===
            "755054695",
        ),
    });

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [
      "sdz-ingress-way-controlled-passage-route-edge",
    ],
  );
  assert.deepEqual(
    result.decisions.map(
      (decision) => [
        decision.sourceWayId,
        decision.reason,
      ],
    ),
    [
      ["755054695", "ENABLED"],
      [
        "755054694",
        "EDGE_AVAILABILITY_MISSING",
      ],
    ],
  );
});

test("outside or unknown Zoo-hours status disables every ingress edge", () => {
  for (const status of [
    "outside",
    "unknown",
  ] as const) {
    const base = snapshot();
    const result =
      resolveIngressRuntimeActivation({
        ...base,
        zooHours: {
          ...base.zooHours,
          status,
        },
      });

    assert.deepEqual(
      result.enabledConditionalEdgeIds,
      [],
    );
    assert.ok(
      result.decisions.every(
        (decision) =>
          decision.reason ===
          "HOURS_NOT_CONFIRMED",
      ),
    );
  }
});

test("expired or wrong-date Zoo-hours evidence disables every ingress edge", () => {
  const base = snapshot();
  const expired =
    resolveIngressRuntimeActivation({
      ...base,
      zooHours: {
        ...base.zooHours,
        expiresAt:
          "2026-09-09T14:19:59-07:00",
      },
    });
  assert.deepEqual(
    expired.enabledConditionalEdgeIds,
    [],
  );
  assert.ok(
    expired.decisions.every(
      (decision) =>
        decision.reason ===
        "HOURS_EVIDENCE_NOT_CURRENT",
    ),
  );

  const wrongDate =
    resolveIngressRuntimeActivation({
      ...base,
      zooHours: {
        ...base.zooHours,
        validForDate:
          "2026-09-10",
      },
    });
  assert.ok(
    wrongDate.decisions.every(
      (decision) =>
        decision.reason ===
        "HOURS_EVIDENCE_NOT_CURRENT",
    ),
  );
});

test("blocked, unknown, expired, or wrong-date closure evidence disables every ingress edge", () => {
  for (const status of [
    "blocked",
    "unknown",
  ] as const) {
    const base = snapshot();
    const result =
      resolveIngressRuntimeActivation({
        ...base,
        closureAdvisement: {
          ...base.closureAdvisement,
          status,
        },
      });

    assert.ok(
      result.decisions.every(
        (decision) =>
          decision.reason ===
          "CLOSURE_CLEARANCE_NOT_CONFIRMED",
      ),
    );
  }

  const base = snapshot();
  const expired =
    resolveIngressRuntimeActivation({
      ...base,
      closureAdvisement: {
        ...base.closureAdvisement,
        expiresAt:
          "2026-09-09T14:19:59-07:00",
      },
    });
  assert.ok(
    expired.decisions.every(
      (decision) =>
        decision.reason ===
        "CLOSURE_EVIDENCE_NOT_CURRENT",
    ),
  );

  const wrongDate =
    resolveIngressRuntimeActivation({
      ...base,
      closureAdvisement: {
        ...base.closureAdvisement,
        validForDate:
          "2026-09-10",
      },
    });
  assert.ok(
    wrongDate.decisions.every(
      (decision) =>
        decision.reason ===
        "CLOSURE_EVIDENCE_NOT_CURRENT",
    ),
  );
});

test("unavailable or unknown exact-edge evidence disables only that exact edge", () => {
  for (const status of [
    "unavailable",
    "unknown",
  ] as const) {
    const base = snapshot();
    const result =
      resolveIngressRuntimeActivation({
        ...base,
        exactEdgeAvailability:
          base.exactEdgeAvailability.map(
            (evidence) =>
              evidence.sourceWayId ===
              "755054695"
                ? {
                    ...evidence,
                    status,
                  }
                : evidence,
          ),
      });

    assert.deepEqual(
      result.enabledConditionalEdgeIds,
      [
        "sdz-ingress-way-front-street-connection-route-edge",
      ],
    );
    assert.equal(
      result.decisions[0].reason,
      "EDGE_AVAILABILITY_NOT_CONFIRMED",
    );
    assert.equal(
      result.decisions[1].reason,
      "ENABLED",
    );
  }
});

test("expired or wrong-date exact-edge evidence disables only that exact edge", () => {
  const base = snapshot();
  const expired =
    resolveIngressRuntimeActivation({
      ...base,
      exactEdgeAvailability:
        base.exactEdgeAvailability.map(
          (evidence) =>
            evidence.sourceWayId ===
            "755054695"
              ? {
                  ...evidence,
                  expiresAt:
                    "2026-09-09T14:19:59-07:00",
                }
              : evidence,
        ),
    });

  assert.equal(
    expired.decisions[0].reason,
    "EDGE_AVAILABILITY_NOT_CURRENT",
  );
  assert.equal(
    expired.decisions[1].reason,
    "ENABLED",
  );

  const wrongDate =
    resolveIngressRuntimeActivation({
      ...base,
      exactEdgeAvailability:
        base.exactEdgeAvailability.map(
          (evidence) =>
            evidence.sourceWayId ===
            "755054695"
              ? {
                  ...evidence,
                  validForDate:
                    "2026-09-10",
                }
              : evidence,
        ),
    });
  assert.equal(
    wrongDate.decisions[0].reason,
    "EDGE_AVAILABILITY_NOT_CURRENT",
  );
});

test("runtime trust is scoped to the visit date and cannot be replayed onto another day", () => {
  const activation =
    resolveIngressRuntimeActivation(
      snapshot(),
    );

  const result =
    buildCandidateIntegration(
      integrationInput(
        activation,
        {
          visit: {
            ...visit(),
            date: "2026-09-10",
          },
        },
      ),
    );

  assert.equal(result.status, "blocked");
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code ===
        "CONDITIONAL_EDGE_RUNTIME_TRUST_DATE_MISMATCH",
    ),
  );
});

test("integration rejects forged runtime trust for unknown or non-conditional edges", () => {
  const activation =
    resolveIngressRuntimeActivation(
      snapshot(),
    );

  const unknown =
    buildCandidateIntegration(
      integrationInput(
        activation,
        {
          conditionalEdgeRuntimeTrust: {
            ...activation
              .conditionalEdgeRuntimeTrust,
            edgeIds: [
              "missing-edge",
            ],
          },
        },
      ),
    );
  assert.equal(unknown.status, "blocked");
  assert.ok(
    unknown.issues.some(
      (issue) =>
        issue.code ===
        "CONDITIONAL_EDGE_RUNTIME_TRUST_UNKNOWN",
    ),
  );

  const data = structuredClone(
    INGRESS_ROUTE_GRAPH_DATA,
  );
  data.routeEdges[0].status = "open";
  const nonConditional =
    buildCandidateIntegration(
      integrationInput(
        activation,
        {
          data,
          enabledConditionalEdgeIds: [],
          conditionalEdgeRuntimeTrust: {
            ...activation
              .conditionalEdgeRuntimeTrust,
            edgeIds: [
              data.routeEdges[0].id,
            ],
          },
        },
      ),
    );
  assert.equal(
    nonConditional.status,
    "blocked",
  );
  assert.ok(
    nonConditional.issues.some(
      (issue) =>
        issue.code ===
        "CONDITIONAL_EDGE_RUNTIME_TRUST_NOT_CONDITIONAL",
    ),
  );
});

test("runtime operational trust cannot override unknown base provenance", () => {
  const activation =
    resolveIngressRuntimeActivation(
      snapshot(),
    );
  const data = structuredClone(
    INGRESS_ROUTE_GRAPH_DATA,
  );
  data.routeEdges[0].provenance
    .confidence = "unknown";

  const result =
    buildCandidateIntegration(
      integrationInput(
        activation,
        { data },
      ),
    );

  assert.equal(result.status, "blocked");
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code ===
        "CONDITIONAL_EDGE_RUNTIME_TRUST_PROVENANCE_UNKNOWN",
    ),
  );
});

test("duplicate or unknown source-way evidence is rejected instead of ambiguously merged", () => {
  const base = snapshot();

  assert.throws(
    () =>
      resolveIngressRuntimeActivation({
        ...base,
        exactEdgeAvailability: [
          ...base.exactEdgeAvailability,
          {
            ...base
              .exactEdgeAvailability[0],
            evidenceId:
              "duplicate-edge-evidence",
          },
        ],
      }),
    /duplicates ingress way 755054695/,
  );

  assert.throws(
    () =>
      resolveIngressRuntimeActivation({
        ...base,
        exactEdgeAvailability: [
          ...base.exactEdgeAvailability,
          {
            ...base
              .exactEdgeAvailability[0],
            evidenceId:
              "unknown-edge-evidence",
            sourceWayId:
              "999999999",
          },
        ],
      }),
    /unknown ingress way 999999999/,
  );
});

test("invalid or inverted evidence windows are rejected", () => {
  const base = snapshot();

  assert.throws(
    () =>
      resolveIngressRuntimeActivation({
        ...base,
        closureAdvisement: {
          ...base.closureAdvisement,
          observedAt:
            "not-a-timestamp",
        },
      }),
    /observedAt\/expiresAt must be ISO timestamps/,
  );

  assert.throws(
    () =>
      resolveIngressRuntimeActivation({
        ...base,
        closureAdvisement: {
          ...base.closureAdvisement,
          observedAt:
            "2026-09-09T15:00:00-07:00",
          expiresAt:
            "2026-09-09T14:00:00-07:00",
        },
      }),
    /expiresAt must be later than observedAt/,
  );
});

test("Planner 24 result and trust envelope are deeply immutable", () => {
  const result =
    resolveIngressRuntimeActivation(
      snapshot(),
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
      result.conditionalEdgeRuntimeTrust,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      result.conditionalEdgeRuntimeTrust
        .edgeIds,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      result.decisions,
    ),
    true,
  );
});

test("activated IDs always remain a subset of the actual Planner 23 conditional ingress edges", () => {
  const result =
    resolveIngressRuntimeActivation(
      snapshot(),
    );
  const edgeIds = new Set(
    INGRESS_ROUTE_EDGES.map(
      (edge) => edge.id,
    ),
  );

  assert.ok(
    result.enabledConditionalEdgeIds
      .every(
        (edgeId) =>
          edgeIds.has(edgeId),
      ),
  );
});
