import assert from "node:assert/strict";
import test from "node:test";

import {
  routeInteriorExpandedWithRuntimeEvidence,
  type InteriorExpandedRuntimeOperationalSnapshot,
} from "../src/data/zooInteriorRuntimeActivation.ts";
import {
  zooOperationalDateAt,
} from "../src/data/zooIngressRuntimeActivation.ts";

const NOW = Date.now();
const DATE = zooOperationalDateAt(NOW);
const FRONT_STREET_NODE =
  "sdz-ingress-node-front-street-route-node";
const TIGER_BRANCH_NODE =
  "sdz-interior-front-street-node-1619736626-route-node";

function isoOffset(minutes: number) {
  return new Date(NOW + minutes * 60_000).toISOString();
}

function unavailableSnapshot(): InteriorExpandedRuntimeOperationalSnapshot {
  return {
    visitDate: DATE,
    zooHours: {
      evidenceId: `hours-${DATE}`,
      status: "inside",
      validForDate: DATE,
      observedAt: isoOffset(-30),
      expiresAt: isoOffset(30),
    },
    ingressClosureAdvisement: {
      evidenceId: `closure-${DATE}`,
      status: "clear",
      validForDate: DATE,
      observedAt: isoOffset(-15),
      expiresAt: isoOffset(15),
    },
    ingressExactEdgeAvailability: [
      {
        evidenceId: "edge-755054695-availability",
        sourceWayId: "755054695",
        status: "available",
        validForDate: DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(20),
      },
      {
        evidenceId: "edge-755054694-availability",
        sourceWayId: "755054694",
        status: "available",
        validForDate: DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(20),
      },
    ],
    interiorExactSegmentAvailability: [
      {
        evidenceId: "segment-front-street-tiger-availability",
        status: "unavailable",
        validForDate: DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(20),
        objectiveSourceRecordId: "sdz-tiger-trail",
        sourceWayId: "1481425058",
        sourceFromNodeId: "7053320515",
        sourceToNodeId: "1619736626",
      },
    ],
  };
}

function availableSnapshot(): InteriorExpandedRuntimeOperationalSnapshot {
  const base = unavailableSnapshot();
  return {
    ...base,
    interiorExactSegmentAvailability:
      base.interiorExactSegmentAvailability.map((evidence) => ({
        ...evidence,
        status: "available" as const,
      })),
  };
}

test("Planner 41 snapshots validated snapshot fields before a Proxy can substitute different evidence during use", () => {
  const target = unavailableSnapshot();
  const forgedAvailable = {
    ...target,
    interiorExactSegmentAvailability:
      target.interiorExactSegmentAvailability.map((evidence) => ({
        ...evidence,
        status: "available" as const,
      })),
  }.interiorExactSegmentAvailability;

  let substitutedReads = 0;
  const hostile = new Proxy(target, {
    get(object, property, receiver) {
      if (property === "interiorExactSegmentAvailability") {
        substitutedReads += 1;
        return forgedAvailable;
      }
      return Reflect.get(object, property, receiver);
    },
  });

  const result = routeInteriorExpandedWithRuntimeEvidence(
    hostile,
    {
      fromNodeId: FRONT_STREET_NODE,
      toNodeId: TIGER_BRANCH_NODE,
    },
  );

  assert.equal(
    substitutedReads,
    0,
    "validated fields must come from captured own-data descriptors, not later property reads",
  );
  assert.equal(result.activation.interior.status, "evaluated");
  if (result.activation.interior.status !== "evaluated") {
    assert.fail("expected evaluated interior activation");
  }
  assert.equal(
    result.activation.interior.decision.reason,
    "SEGMENT_AVAILABILITY_NOT_CONFIRMED",
  );
  assert.equal(
    result.activation.interior.decision.status,
    "disabled",
  );
  assert.equal(result.route.status, "not-found");
});

test("Planner 41 snapshots route request fields before a Proxy can change the requested endpoint", () => {
  const target = {
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
  };
  let endpointReads = 0;
  const hostileRequest = new Proxy(target, {
    get(object, property, receiver) {
      if (property === "toNodeId") {
        endpointReads += 1;
        return FRONT_STREET_NODE;
      }
      return Reflect.get(object, property, receiver);
    },
  });

  const result = routeInteriorExpandedWithRuntimeEvidence(
    unavailableSnapshot(),
    hostileRequest,
  );

  assert.equal(endpointReads, 0);
  assert.deepEqual(result.route, {
    status: "not-found",
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
    reason: "NO_ROUTE",
  });
});

test("Planner 41 preserves stroller routing gates under inherited setter pollution", () => {
  const previous = Object.getOwnPropertyDescriptor(
    Object.prototype,
    "requireStroller",
  );
  let setterCalls = 0;

  Object.defineProperty(Object.prototype, "requireStroller", {
    configurable: true,
    set() {
      setterCalls += 1;
    },
  });

  try {
    const snapshot = availableSnapshot();
    const unrestricted = routeInteriorExpandedWithRuntimeEvidence(
      snapshot,
      {
        fromNodeId: FRONT_STREET_NODE,
        toNodeId: TIGER_BRANCH_NODE,
      },
    );
    assert.equal(
      unrestricted.route.status,
      "found",
      "the regression requires an otherwise-routable interior edge",
    );

    const strollerRequired = routeInteriorExpandedWithRuntimeEvidence(
      snapshot,
      {
        fromNodeId: FRONT_STREET_NODE,
        toNodeId: TIGER_BRANCH_NODE,
        requireStroller: true,
      },
    );

    assert.equal(
      setterCalls,
      0,
      "routing-control copies must define own data properties instead of invoking inherited setters",
    );
    assert.equal(
      strollerRequired.route.status,
      "not-found",
      "stroller:unknown must remain fail-closed when requireStroller is supplied",
    );
  } finally {
    if (previous) {
      Object.defineProperty(
        Object.prototype,
        "requireStroller",
        previous,
      );
    } else {
      Reflect.deleteProperty(
        Object.prototype,
        "requireStroller",
      );
    }
  }
});
