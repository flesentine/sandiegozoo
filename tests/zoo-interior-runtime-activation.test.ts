import assert from "node:assert/strict";
import test from "node:test";

import {
  assertInteriorRuntimeActivationIntegrationIntegrity,
  resolveInteriorExpandedRuntimeActivation,
  routeInteriorExpandedWithRuntimeEvidence,
  type InteriorExpandedRuntimeOperationalSnapshot,
} from "../src/data/zooInteriorRuntimeActivation.ts";
import {
  zooOperationalDateAt,
} from "../src/data/zooIngressRuntimeActivation.ts";

const TEST_NOW = Date.now();
const TEST_DATE = zooOperationalDateAt(TEST_NOW);

const ENTRANCE_NODE =
  "sdz-ingress-node-main-entrance-route-node";
const FRONT_STREET_NODE =
  "sdz-ingress-node-front-street-route-node";
const TIGER_BRANCH_NODE =
  "sdz-interior-front-street-node-1619736626-route-node";
const INTERIOR_EDGE_ID =
  "sdz-interior-tiger-trail-front-street-route-edge";
const INGRESS_EDGE_IDS = [
  "sdz-ingress-way-controlled-passage-route-edge",
  "sdz-ingress-way-front-street-connection-route-edge",
] as const;

function isoOffset(minutes: number) {
  return new Date(
    TEST_NOW + minutes * 60_000,
  ).toISOString();
}

function snapshot(
  overrides:
    Partial<InteriorExpandedRuntimeOperationalSnapshot> = {},
): InteriorExpandedRuntimeOperationalSnapshot {
  return {
    visitDate: TEST_DATE,
    zooHours: {
      evidenceId: `hours-${TEST_DATE}`,
      status: "inside",
      validForDate: TEST_DATE,
      observedAt: isoOffset(-120),
      expiresAt: isoOffset(240),
    },
    ingressClosureAdvisement: {
      evidenceId: `closure-${TEST_DATE}`,
      status: "clear",
      validForDate: TEST_DATE,
      observedAt: isoOffset(-15),
      expiresAt: isoOffset(45),
    },
    ingressExactEdgeAvailability: [
      {
        evidenceId: "edge-755054695-availability",
        sourceWayId: "755054695",
        status: "available",
        validForDate: TEST_DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
      },
      {
        evidenceId: "edge-755054694-availability",
        sourceWayId: "755054694",
        status: "available",
        validForDate: TEST_DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
      },
    ],
    interiorExactSegmentAvailability: [
      {
        evidenceId:
          "segment-front-street-tiger-availability",
        status: "available",
        validForDate: TEST_DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
        objectiveSourceRecordId:
          "sdz-tiger-trail",
        sourceWayId: "1481425058",
        sourceFromNodeId: "7053320515",
        sourceToNodeId: "1619736626",
      },
    ],
    ...overrides,
  };
}

function unavailableInteriorSnapshot() {
  const base = snapshot();
  return {
    ...base,
    interiorExactSegmentAvailability:
      base.interiorExactSegmentAvailability.map(
        (evidence) => ({
          ...evidence,
          status: "unavailable" as const,
        }),
      ),
  };
}

test("Planner 41 remains bound to the exact Planner 34/40 runtime graph contract", () => {
  assert.doesNotThrow(() =>
    assertInteriorRuntimeActivationIntegrationIntegrity(),
  );
});

test("fresh shared Zoo-hours evidence plus independently qualified ingress/interior evidence enables all three conditional edges", () => {
  const before = Date.now();
  const result =
    resolveInteriorExpandedRuntimeActivation(
      snapshot(),
    );
  const after = Date.now();

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [
      ...INGRESS_EDGE_IDS,
      INTERIOR_EDGE_ID,
    ],
  );
  assert.ok(
    Date.parse(result.ingress.evaluatedAt) >= before,
  );
  assert.ok(
    Date.parse(result.ingress.evaluatedAt) <= after,
  );
  assert.equal(result.interior.status, "evaluated");
  if (result.interior.status !== "evaluated") {
    assert.fail("expected evaluated interior activation");
  }
  assert.ok(
    Date.parse(result.interior.evaluatedAt) >= before,
  );
  assert.ok(
    Date.parse(result.interior.evaluatedAt) <= after,
  );
  assert.equal(
    result.interior.decision.status,
    "enabled",
  );
  assert.equal(
    result.interior.decision.reason,
    "ENABLED",
  );
});

test("Planner 41 live boundary qualifies the real entrance-to-interior route", () => {
  const result = routeInteriorExpandedWithRuntimeEvidence(
    snapshot(),
    {
      fromNodeId: ENTRANCE_NODE,
      toNodeId: TIGER_BRANCH_NODE,
    },
  );

  assert.equal(result.route.status, "found");
  if (result.route.status !== "found") {
    assert.fail("expected live entrance-to-interior route");
  }

  assert.deepEqual(
    result.route.edges.map((edge) => edge.edgeId),
    [
      ...INGRESS_EDGE_IDS,
      INTERIOR_EDGE_ID,
    ],
  );
  assert.equal(result.route.distanceMeters, 49.369);
  assert.equal(result.route.durationMinutes, 0.685);
});

test("ingress closure advisement does not become interior-segment authority", () => {
  const base = snapshot();
  const blockedIngress = {
    ...base,
    ingressClosureAdvisement: {
      ...base.ingressClosureAdvisement,
      status: "blocked" as const,
    },
  };

  const result = routeInteriorExpandedWithRuntimeEvidence(
    blockedIngress,
    {
      fromNodeId: FRONT_STREET_NODE,
      toNodeId: TIGER_BRANCH_NODE,
    },
  );

  assert.deepEqual(
    result.activation.ingress.enabledConditionalEdgeIds,
    [],
  );
  assert.equal(result.activation.interior.status, "evaluated");
  if (result.activation.interior.status !== "evaluated") {
    assert.fail("expected evaluated interior activation");
  }
  assert.equal(
    result.activation.interior.decision.status,
    "enabled",
  );
  assert.deepEqual(
    result.activation.enabledConditionalEdgeIds,
    [INTERIOR_EDGE_ID],
  );
  assert.equal(result.route.status, "found");
});

test("missing interior availability leaves independently proven ingress edges enabled but keeps the interior edge closed", () => {
  const base = snapshot();
  const result = routeInteriorExpandedWithRuntimeEvidence(
    {
      ...base,
      interiorExactSegmentAvailability: [],
    },
    {
      fromNodeId: ENTRANCE_NODE,
      toNodeId: TIGER_BRANCH_NODE,
    },
  );

  assert.deepEqual(
    result.activation.enabledConditionalEdgeIds,
    [...INGRESS_EDGE_IDS],
  );
  assert.equal(result.activation.interior.status, "evaluated");
  if (result.activation.interior.status === "evaluated") {
    assert.equal(
      result.activation.interior.decision.reason,
      "SEGMENT_AVAILABILITY_MISSING",
    );
  }
  assert.deepEqual(result.route, {
    status: "not-found",
    fromNodeId: ENTRANCE_NODE,
    toNodeId: TIGER_BRANCH_NODE,
    reason: "NO_ROUTE",
  });
});

test("unavailable interior evidence cannot be overridden by the expanded routing layer", () => {
  const result = routeInteriorExpandedWithRuntimeEvidence(
    unavailableInteriorSnapshot(),
    {
      fromNodeId: ENTRANCE_NODE,
      toNodeId: TIGER_BRANCH_NODE,
    },
  );

  assert.deepEqual(
    result.activation.enabledConditionalEdgeIds,
    [...INGRESS_EDGE_IDS],
  );
  assert.equal(result.activation.interior.status, "evaluated");
  if (result.activation.interior.status === "evaluated") {
    assert.equal(
      result.activation.interior.decision.reason,
      "SEGMENT_AVAILABILITY_NOT_CONFIRMED",
    );
  }
  assert.equal(result.route.status, "not-found");
});

test("stale interior evidence disables only the interior conditional edge", () => {
  const base = snapshot();
  const staleInterior = {
    ...base,
    interiorExactSegmentAvailability:
      base.interiorExactSegmentAvailability.map(
        (evidence) => ({
          ...evidence,
          observedAt: isoOffset(-120),
          expiresAt: isoOffset(-60),
        }),
      ),
  };

  const result =
    resolveInteriorExpandedRuntimeActivation(
      staleInterior,
    );

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [...INGRESS_EDGE_IDS],
  );
  assert.equal(result.interior.status, "evaluated");
  if (result.interior.status === "evaluated") {
    assert.equal(
      result.interior.decision.reason,
      "SEGMENT_AVAILABILITY_NOT_CURRENT",
    );
  }
});

test("shared outside Zoo-hours evidence disables ingress and interior activation together", () => {
  const base = snapshot();
  const result =
    resolveInteriorExpandedRuntimeActivation({
      ...base,
      zooHours: {
        ...base.zooHours,
        status: "outside",
      },
    });

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [],
  );
  assert.ok(
    result.ingress.decisions.every(
      (decision) =>
        decision.reason === "HOURS_NOT_CONFIRMED" &&
        decision.status === "disabled",
    ),
  );
  assert.equal(result.interior.status, "evaluated");
  if (result.interior.status === "evaluated") {
    assert.equal(
      result.interior.decision.reason,
      "HOURS_NOT_CONFIRMED",
    );
    assert.equal(
      result.interior.decision.status,
      "disabled",
    );
  }
});

test("caller-owned enabledConditionalEdgeIds are rejected at the Planner 41 live boundary", () => {
  assert.throws(
    () =>
      routeInteriorExpandedWithRuntimeEvidence(
        unavailableInteriorSnapshot(),
        {
          fromNodeId: FRONT_STREET_NODE,
          toNodeId: TIGER_BRANCH_NODE,
          enabledConditionalEdgeIds: [
            INTERIOR_EDGE_ID,
          ],
        } as never,
      ),
    /cannot contain caller-controlled field enabledConditionalEdgeIds/,
  );
});

test("inherited enabledConditionalEdgeIds cannot force unavailable interior evidence open", () => {
  const originalDescriptor =
    Object.getOwnPropertyDescriptor(
      Object.prototype,
      "enabledConditionalEdgeIds",
    );

  try {
    Object.defineProperty(
      Object.prototype,
      "enabledConditionalEdgeIds",
      {
        value: [INTERIOR_EDGE_ID],
        configurable: true,
      },
    );

    const request = {
      fromNodeId: FRONT_STREET_NODE,
      toNodeId: TIGER_BRANCH_NODE,
    };

    assert.equal(
      Object.hasOwn(request, "enabledConditionalEdgeIds"),
      false,
    );

    const result =
      routeInteriorExpandedWithRuntimeEvidence(
        unavailableInteriorSnapshot(),
        request,
      );

    assert.deepEqual(
      result.activation.enabledConditionalEdgeIds,
      [...INGRESS_EDGE_IDS],
    );
    assert.deepEqual(result.route, {
      status: "not-found",
      fromNodeId: FRONT_STREET_NODE,
      toNodeId: TIGER_BRANCH_NODE,
      reason: "NO_ROUTE",
    });
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(
        Object.prototype,
        "enabledConditionalEdgeIds",
        originalDescriptor,
      );
    } else {
      delete (Object.prototype as Record<string, unknown>)
        .enabledConditionalEdgeIds;
    }
  }
});

test("Planner 41 rejects inherited evidence fields instead of laundering prototype pollution into a resolver", () => {
  const base = snapshot();
  const originalDescriptor =
    Object.getOwnPropertyDescriptor(
      Object.prototype,
      "status",
    );

  try {
    Object.defineProperty(Object.prototype, "status", {
      value: "clear",
      configurable: true,
    });

    const pollutedClosure = {
      evidenceId:
        base.ingressClosureAdvisement.evidenceId,
      validForDate:
        base.ingressClosureAdvisement.validForDate,
      observedAt:
        base.ingressClosureAdvisement.observedAt,
      expiresAt:
        base.ingressClosureAdvisement.expiresAt,
    } as never;

    assert.throws(
      () =>
        resolveInteriorExpandedRuntimeActivation({
          ...base,
          ingressClosureAdvisement:
            pollutedClosure,
        }),
      /missing required field status/,
    );
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(
        Object.prototype,
        "status",
        originalDescriptor,
      );
    } else {
      delete (Object.prototype as Record<string, unknown>)
        .status;
    }
  }
});

test("Planner 41 rejects route-request accessors before routing", () => {
  const request = {
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
  } as Record<string, unknown>;

  Object.defineProperty(request, "requireAccessible", {
    enumerable: true,
    get() {
      return true;
    },
  });

  assert.throws(
    () =>
      routeInteriorExpandedWithRuntimeEvidence(
        snapshot(),
        request as never,
      ),
    /requires enumerable own data field requireAccessible/,
  );
});

test("Planner 41 preserves stroller fail-closed semantics after live activation", () => {
  const result = routeInteriorExpandedWithRuntimeEvidence(
    snapshot(),
    {
      fromNodeId: FRONT_STREET_NODE,
      toNodeId: TIGER_BRANCH_NODE,
      requireStroller: true,
    },
  );

  assert.ok(
    result.activation.enabledConditionalEdgeIds.includes(
      INTERIOR_EDGE_ID,
    ),
  );
  assert.deepEqual(result.route, {
    status: "not-found",
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
    reason: "NO_ROUTE",
  });
});

test("Planner 41 activation and route results are deeply immutable", () => {
  const result = routeInteriorExpandedWithRuntimeEvidence(
    snapshot(),
    {
      fromNodeId: ENTRANCE_NODE,
      toNodeId: TIGER_BRANCH_NODE,
    },
  );

  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.activation), true);
  assert.equal(
    Object.isFrozen(
      result.activation.enabledConditionalEdgeIds,
    ),
    true,
  );
  assert.equal(Object.isFrozen(result.route), true);
  assert.equal(Object.isFrozen(result.activation.ingress), true);
  assert.equal(Object.isFrozen(result.activation.interior), true);
});
