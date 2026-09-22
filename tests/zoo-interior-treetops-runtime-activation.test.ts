import assert from "node:assert/strict";
import test from "node:test";
import {
  zooOperationalDateAt,
} from "../src/data/zooIngressRuntimeActivation.ts";
import {
  assertInteriorTreetopsRuntimeActivationIntegrationIntegrity,
  resolveInteriorTreetopsExpandedRuntimeActivation,
  routeInteriorTreetopsExpandedWithRuntimeEvidence,
  type InteriorTreetopsExpandedRuntimeOperationalSnapshot,
} from "../src/data/zooInteriorTreetopsRuntimeActivation.ts";

const NOW = Date.now();
const DATE = zooOperationalDateAt(NOW);

const ENTRANCE_NODE =
  "sdz-ingress-node-main-entrance-route-node";
const TreetopsAnchorNode =
  "sdz-interior-front-street-node-1619736626-route-node";
const TreetopsEndpointNode =
  "sdz-interior-treetops-node-13588159626-route-node";
const TreetopsEdgeId =
  "sdz-interior-treetops-anchor-to-fern-canyon-route-edge";

const PRIOR_EDGE_IDS = [
  "sdz-ingress-way-controlled-passage-route-edge",
  "sdz-ingress-way-front-street-connection-route-edge",
  "sdz-interior-tiger-trail-front-street-route-edge",
] as const;

function isoOffset(minutes: number) {
  return new Date(NOW + minutes * 60_000).toISOString();
}

function snapshot(
  overrides:
    Partial<InteriorTreetopsExpandedRuntimeOperationalSnapshot> = {},
): InteriorTreetopsExpandedRuntimeOperationalSnapshot {
  return {
    visitDate: DATE,
    zooHours: {
      evidenceId: `hours-${DATE}`,
      status: "inside",
      validForDate: DATE,
      observedAt: isoOffset(-120),
      expiresAt: isoOffset(240),
    },
    ingressClosureAdvisement: {
      evidenceId: `closure-${DATE}`,
      status: "clear",
      validForDate: DATE,
      observedAt: isoOffset(-15),
      expiresAt: isoOffset(45),
    },
    ingressExactEdgeAvailability: [
      {
        evidenceId: "edge-755054695-availability",
        sourceWayId: "755054695",
        status: "available",
        validForDate: DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
      },
      {
        evidenceId: "edge-755054694-availability",
        sourceWayId: "755054694",
        status: "available",
        validForDate: DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
      },
    ],
    interiorExactSegmentAvailability: [
      {
        evidenceId:
          "segment-front-street-tiger-availability",
        status: "available",
        validForDate: DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
        objectiveSourceRecordId: "sdz-tiger-trail",
        sourceWayId: "1481425058",
        sourceFromNodeId: "7053320515",
        sourceToNodeId: "1619736626",
      },
    ],
    treetopsExactSegmentAvailability: [
      {
        evidenceId: "segment-treetops-v7-availability",
        status: "available",
        validForDate: DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
        objectiveSourceRecordId: "sdz-tiger-trail",
        sourceWayId: "148910139",
        sourceWayVersion: 7,
        sourceFromNodeId: "1619736626",
        sourceToNodeId: "13588159626",
      },
    ],
    ...overrides,
  };
}

test("Planner 58 remains bound to the Planner 51/57 Treetops runtime contract", () => {
  assert.doesNotThrow(() =>
    assertInteriorTreetopsRuntimeActivationIntegrationIntegrity(),
  );
});

test("fresh exact evidence enables the Treetops edge in addition to the prior graph", () => {
  const result =
    resolveInteriorTreetopsExpandedRuntimeActivation(snapshot());

  assert.deepEqual(
    result.enabledConditionalEdgeIds,
    [...PRIOR_EDGE_IDS, TreetopsEdgeId].sort(),
  );
  assert.equal(result.treetops.decision.status, "enabled");
  assert.equal(result.treetops.decision.reason, "ENABLED");
  assert.equal(
    result.treetops.decision.sourceWayVersion,
    7,
  );
});

test("Planner 58 qualifies the live anchor-to-Treetops endpoint route", () => {
  const result =
    routeInteriorTreetopsExpandedWithRuntimeEvidence(
      snapshot(),
      {
        fromNodeId: TreetopsAnchorNode,
        toNodeId: TreetopsEndpointNode,
      },
    );

  assert.equal(result.route.status, "found");
  if (result.route.status !== "found") {
    assert.fail("expected live Treetops route");
  }
  assert.deepEqual(
    result.route.edges.map((edge) => edge.edgeId),
    [TreetopsEdgeId],
  );
  assert.equal(result.route.distanceMeters, 48.615);
  assert.equal(result.route.durationMinutes, 0.675);
});

test("Planner 58 qualifies the full entrance-to-Treetops endpoint route", () => {
  const result =
    routeInteriorTreetopsExpandedWithRuntimeEvidence(
      snapshot(),
      {
        fromNodeId: ENTRANCE_NODE,
        toNodeId: TreetopsEndpointNode,
      },
    );

  assert.equal(result.route.status, "found");
  if (result.route.status !== "found") {
    assert.fail("expected live entrance-to-Treetops route");
  }
  assert.deepEqual(
    result.route.edges.map((edge) => edge.edgeId),
    [...PRIOR_EDGE_IDS, TreetopsEdgeId],
  );
});

test("missing Treetops availability keeps only the new edge closed", () => {
  const result =
    routeInteriorTreetopsExpandedWithRuntimeEvidence(
      snapshot({
        treetopsExactSegmentAvailability: [],
      }),
      {
        fromNodeId: TreetopsAnchorNode,
        toNodeId: TreetopsEndpointNode,
      },
    );

  assert.equal(
    result.activation.treetops.decision.reason,
    "SEGMENT_AVAILABILITY_MISSING",
  );
  assert.deepEqual(
    result.activation.enabledConditionalEdgeIds,
    [...PRIOR_EDGE_IDS].sort(),
  );
  assert.deepEqual(result.route, {
    status: "not-found",
    fromNodeId: TreetopsAnchorNode,
    toNodeId: TreetopsEndpointNode,
    reason: "NO_ROUTE",
  });
});

test("unavailable or stale Treetops evidence fails closed", () => {
  const unavailableBase = snapshot();
  const unavailable =
    resolveInteriorTreetopsExpandedRuntimeActivation({
      ...unavailableBase,
      treetopsExactSegmentAvailability:
        unavailableBase.treetopsExactSegmentAvailability.map(
          (evidence) => ({
            ...evidence,
            status: "unavailable" as const,
          }),
        ),
    });

  assert.equal(
    unavailable.treetops.decision.reason,
    "SEGMENT_AVAILABILITY_NOT_CONFIRMED",
  );
  assert.equal(
    unavailable.enabledConditionalEdgeIds.includes(
      TreetopsEdgeId,
    ),
    false,
  );

  const staleBase = snapshot();
  const stale =
    resolveInteriorTreetopsExpandedRuntimeActivation({
      ...staleBase,
      treetopsExactSegmentAvailability:
        staleBase.treetopsExactSegmentAvailability.map(
          (evidence) => ({
            ...evidence,
            observedAt: isoOffset(-60),
            expiresAt: isoOffset(-30),
          }),
        ),
    });

  assert.equal(
    stale.treetops.decision.reason,
    "SEGMENT_AVAILABILITY_NOT_CURRENT",
  );
});

test("Planner 58 rejects evidence for a different source version or segment", () => {
  const base = snapshot();
  assert.throws(
    () =>
      resolveInteriorTreetopsExpandedRuntimeActivation({
        ...base,
        treetopsExactSegmentAvailability: [
          {
            ...base.treetopsExactSegmentAvailability[0],
            sourceWayVersion: 6 as 7,
          },
        ],
      }),
    /unknown exact segment/,
  );
});

test("Planner 58 never lets caller route requests inject enabled conditional edge IDs", () => {
  assert.throws(
    () =>
      routeInteriorTreetopsExpandedWithRuntimeEvidence(
        snapshot(),
        {
          fromNodeId: TreetopsAnchorNode,
          toNodeId: TreetopsEndpointNode,
          enabledConditionalEdgeIds: [
            TreetopsEdgeId,
          ],
        } as never,
      ),
    /cannot contain caller-controlled field enabledConditionalEdgeIds/,
  );
});

test("Planner 58 snapshots Treetops evidence before Proxy get traps can substitute availability", () => {
  const base = snapshot();
  const unavailable = {
    ...base.treetopsExactSegmentAvailability[0],
    status: "unavailable" as const,
  };
  let getReads = 0;

  const hostileEvidence = new Proxy(unavailable, {
    get(target, property, receiver) {
      if (property === "status") {
        getReads += 1;
        return "available";
      }
      return Reflect.get(target, property, receiver);
    },
  });

  const result =
    resolveInteriorTreetopsExpandedRuntimeActivation({
      ...base,
      treetopsExactSegmentAvailability: [
        hostileEvidence,
      ],
    });

  assert.equal(getReads, 0);
  assert.equal(
    result.treetops.decision.reason,
    "SEGMENT_AVAILABILITY_NOT_CONFIRMED",
  );
});

test("Planner 58 rejects huge sparse Treetops evidence arrays before declared-length allocation", () => {
  const base = snapshot();
  const sparse: unknown[] = [];
  sparse.length = 1_000_000;

  assert.throws(
    () =>
      resolveInteriorTreetopsExpandedRuntimeActivation({
        ...base,
        treetopsExactSegmentAvailability:
          sparse as never,
      }),
    /must be a dense ordinary array/,
  );
});

test("Planner 58 preserves stroller fail-closed semantics after live activation", () => {
  const result =
    routeInteriorTreetopsExpandedWithRuntimeEvidence(
      snapshot(),
      {
        fromNodeId: TreetopsAnchorNode,
        toNodeId: TreetopsEndpointNode,
        requireStroller: true,
      },
    );

  assert.equal(
    result.activation.enabledConditionalEdgeIds.includes(
      TreetopsEdgeId,
    ),
    true,
  );
  assert.equal(result.route.status, "not-found");
});

test("Planner 58 results are deeply immutable", () => {
  const result =
    routeInteriorTreetopsExpandedWithRuntimeEvidence(
      snapshot(),
      {
        fromNodeId: ENTRANCE_NODE,
        toNodeId: TreetopsEndpointNode,
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
  assert.equal(Object.isFrozen(result.activation.treetops), true);
  assert.equal(
    Object.isFrozen(result.activation.treetops.decision),
    true,
  );
  assert.equal(Object.isFrozen(result.route), true);
});


test("Planner 58 runtime outputs ignore Object.prototype pollution", () => {
  const pollutedFields = [
    "effectiveExpiresAt",
    "selectionScope",
    "globalEndpointSelection",
  ] as const;

  try {
    for (const field of pollutedFields) {
      Object.defineProperty(Object.prototype, field, {
        configurable: true,
        value: "polluted",
      });
    }

    const activation =
      resolveInteriorTreetopsExpandedRuntimeActivation(
        snapshot({
          treetopsExactSegmentAvailability: [],
        }),
      );

    assert.equal(Object.getPrototypeOf(activation), null);
    assert.equal(Object.getPrototypeOf(activation.treetops), null);
    assert.equal(
      Object.getPrototypeOf(activation.treetops.decision),
      null,
    );
    assert.equal(
      "effectiveExpiresAt" in activation.treetops.decision,
      false,
    );
    assert.equal(
      (
        activation.treetops.decision as unknown as Record<
          string,
          unknown
        >
      ).effectiveExpiresAt,
      undefined,
    );

    const routed =
      routeInteriorTreetopsExpandedWithRuntimeEvidence(
        snapshot(),
        {
          fromNodeId: ENTRANCE_NODE,
          toNodeId: TreetopsEndpointNode,
        },
      );

    assert.equal(Object.getPrototypeOf(routed), null);
    for (const field of [
      "selectionScope",
      "globalEndpointSelection",
    ] as const) {
      assert.equal(
        field in (routed as unknown as Record<string, unknown>),
        false,
      );
    }
  } finally {
    for (const field of pollutedFields) {
      delete (Object.prototype as Record<string, unknown>)[field];
    }
  }
});


test("Planner 58 revalidates prior enabled edges at the final resolver instant", () => {
  const originalDateNow = Date.now;
  const boundaryNow = NOW;
  const expiresBetweenLayers =
    new Date(boundaryNow + 5).toISOString();
  const observedBefore =
    new Date(boundaryNow - 1_000).toISOString();
  const laterExpiry =
    new Date(boundaryNow + 60_000).toISOString();

  const base = snapshot();
  const boundarySnapshot: InteriorTreetopsExpandedRuntimeOperationalSnapshot = {
    ...base,
    zooHours: {
      ...base.zooHours,
      observedAt: observedBefore,
      expiresAt: expiresBetweenLayers,
    },
    ingressClosureAdvisement: {
      ...base.ingressClosureAdvisement,
      observedAt: observedBefore,
      expiresAt: laterExpiry,
    },
    ingressExactEdgeAvailability:
      base.ingressExactEdgeAvailability.map((evidence) => ({
        ...evidence,
        observedAt: observedBefore,
        expiresAt: laterExpiry,
      })),
    interiorExactSegmentAvailability:
      base.interiorExactSegmentAvailability.map((evidence) => ({
        ...evidence,
        observedAt: observedBefore,
        expiresAt: laterExpiry,
      })),
    treetopsExactSegmentAvailability:
      base.treetopsExactSegmentAvailability.map((evidence) => ({
        ...evidence,
        observedAt: observedBefore,
        expiresAt: laterExpiry,
      })),
  };

  let nowReads = 0;
  Date.now = () => {
    nowReads += 1;
    return nowReads <= 2
      ? boundaryNow
      : boundaryNow + 10;
  };

  try {
    const result =
      resolveInteriorTreetopsExpandedRuntimeActivation(
        boundarySnapshot,
      );

    assert.deepEqual(
      result.prior.enabledConditionalEdgeIds,
      [...PRIOR_EDGE_IDS].sort(),
    );
    assert.equal(
      result.treetops.decision.reason,
      "HOURS_EVIDENCE_NOT_CURRENT",
    );
    assert.deepEqual(
      result.enabledConditionalEdgeIds,
      [],
    );
  } finally {
    Date.now = originalDateNow;
  }
});
