import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveIngressRuntimeActivation,
  routeIngressWithRuntimeEvidence,
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
import type { VisitPreferences } from "../src/planning/visitPreferences.ts";
import type { DayPreferences } from "../src/planning/dayPreferences.ts";
import type { PriorityPreferences } from "../src/planning/priorityPreferences.ts";

const TEST_NOW = Date.now();
const TEST_DATE = new Date(TEST_NOW)
  .toISOString()
  .slice(0, 10);

function isoOffset(minutes: number) {
  return new Date(
    TEST_NOW + minutes * 60_000,
  ).toISOString();
}

function snapshot(
  overrides:
    Partial<IngressRuntimeOperationalSnapshot> = {},
): IngressRuntimeOperationalSnapshot {
  return {
    visitDate: TEST_DATE,
    zooHours: {
      evidenceId:
        `hours-${TEST_DATE}`,
      status: "inside",
      validForDate: TEST_DATE,
      observedAt: isoOffset(-120),
      expiresAt: isoOffset(240),
    },
    closureAdvisement: {
      evidenceId:
        `closure-${TEST_DATE}`,
      status: "clear",
      validForDate: TEST_DATE,
      observedAt: isoOffset(-15),
      expiresAt: isoOffset(45),
    },
    exactEdgeAvailability: [
      {
        evidenceId:
          "edge-755054695-availability",
        sourceWayId:
          "755054695",
        status: "available",
        validForDate: TEST_DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
      },
      {
        evidenceId:
          "edge-755054694-availability",
        sourceWayId:
          "755054694",
        status: "available",
        validForDate: TEST_DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
      },
    ],
    ...overrides,
  };
}

function visit(): VisitPreferences {
  return {
    date: TEST_DATE,
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
    ...overrides,
  };
}

test("fresh current evidence activates both exact Planner 23 ingress edges", () => {
  const before = Date.now();
  const result =
    resolveIngressRuntimeActivation(
      snapshot(),
    );
  const after = Date.now();

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [
      "sdz-ingress-way-controlled-passage-route-edge",
      "sdz-ingress-way-front-street-connection-route-edge",
    ],
  );
  assert.ok(
    Date.parse(result.evaluatedAt) >=
      before,
  );
  assert.ok(
    Date.parse(result.evaluatedAt) <=
      after,
  );
  assert.deepEqual(
    result.decisions.map(
      (decision) => [
        decision.sourceWayId,
        decision.status,
        decision.reason,
        decision.effectiveExpiresAt,
      ],
    ),
    [
      [
        "755054695",
        "enabled",
        "ENABLED",
        isoOffset(30),
      ],
      [
        "755054694",
        "enabled",
        "ENABLED",
        isoOffset(30),
      ],
    ],
  );
});

test("high-level live route reevaluates evidence immediately before traversal", () => {
  const result =
    routeIngressWithRuntimeEvidence(
      snapshot(),
      {
        fromNodeId:
          "sdz-ingress-node-main-entrance-route-node",
        toNodeId:
          "sdz-ingress-node-front-street-route-node",
      },
    );

  assert.deepEqual(
    result.activation
      .enabledConditionalEdgeIds,
    [
      "sdz-ingress-way-controlled-passage-route-edge",
      "sdz-ingress-way-front-street-connection-route-edge",
    ],
  );
  assert.equal(
    result.route.status,
    "found",
  );
  if (result.route.status !== "found") {
    throw new Error(
      "expected activated ingress route",
    );
  }
  assert.equal(
    result.route.distanceMeters,
    42.212,
  );
  assert.equal(
    result.route.durationMinutes,
    0.586,
  );
});

test("candidate integration remains fail-closed for provisional ingress edges even if IDs are asserted directly", () => {
  const result = buildCandidateIntegration(
    integrationInput({
      enabledConditionalEdgeIds:
        INGRESS_ROUTE_EDGES.map(
          (edge) => edge.id,
        ),
    }),
  );

  assert.equal(result.status, "blocked");
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code ===
        "CONDITIONAL_EDGE_UNTRUSTED",
    ),
  );
  assert.deepEqual(
    result.routingGate
      .disabledUnverifiedEdgeIds,
    INGRESS_ROUTE_EDGES.map(
      (edge) => edge.id,
    ).sort(),
  );
});

test("expired evidence cannot be replayed with a caller-supplied old evaluatedAt", () => {
  const expired = snapshot({
    zooHours: {
      ...snapshot().zooHours,
      observedAt: isoOffset(-120),
      expiresAt: isoOffset(-60),
    },
    closureAdvisement: {
      ...snapshot().closureAdvisement,
      observedAt: isoOffset(-120),
      expiresAt: isoOffset(-60),
    },
    exactEdgeAvailability:
      snapshot().exactEdgeAvailability.map(
        (evidence) => ({
          ...evidence,
          observedAt: isoOffset(-120),
          expiresAt: isoOffset(-60),
        }),
      ),
  });

  const forged = {
    ...expired,
    evaluatedAt: isoOffset(-90),
  } as IngressRuntimeOperationalSnapshot & {
    evaluatedAt: string;
  };

  const result =
    resolveIngressRuntimeActivation(
      forged,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [],
  );
  assert.ok(
    result.decisions.every(
      (decision) =>
        decision.reason ===
        "HOURS_EVIDENCE_NOT_CURRENT",
    ),
  );
  assert.ok(
    Date.parse(result.evaluatedAt) >
      Date.parse(forged.evaluatedAt),
  );
});

test("high-level route cannot be forced open by smuggling enabledConditionalEdgeIds into the request", () => {
  const base = snapshot();
  const unavailable = {
    ...base,
    exactEdgeAvailability:
      base.exactEdgeAvailability.map(
        (evidence) => ({
          ...evidence,
          status:
            "unavailable" as const,
        })),
  };

  const result =
    routeIngressWithRuntimeEvidence(
      unavailable,
      {
        fromNodeId:
          "sdz-ingress-node-main-entrance-route-node",
        toNodeId:
          "sdz-ingress-node-front-street-route-node",
        enabledConditionalEdgeIds:
          INGRESS_ROUTE_EDGES.map(
            (edge) => edge.id,
          ),
      } as never,
    );

  assert.deepEqual(
    result.activation
      .enabledConditionalEdgeIds,
    [],
  );
  assert.deepEqual(
    result.route,
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
        observedAt: isoOffset(-60),
        expiresAt: isoOffset(-1),
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
        validForDate: "2099-01-01",
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
        observedAt: isoOffset(-60),
        expiresAt: isoOffset(-1),
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
        validForDate: "2099-01-01",
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
                  observedAt:
                    isoOffset(-60),
                  expiresAt:
                    isoOffset(-1),
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
                    "2099-01-01",
                }
              : evidence,
        ),
    });
  assert.equal(
    wrongDate.decisions[0].reason,
    "EDGE_AVAILABILITY_NOT_CURRENT",
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
          observedAt: isoOffset(10),
          expiresAt: isoOffset(5),
        },
      }),
    /expiresAt must be later than observedAt/,
  );
});

test("Planner 24 result records effective expiry and is deeply immutable", () => {
  const result =
    resolveIngressRuntimeActivation(
      snapshot(),
    );

  assert.equal(
    result.decisions[0]
      .effectiveExpiresAt,
    isoOffset(30),
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
      result.decisions[0],
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
