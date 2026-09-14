import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveInteriorExpandedRuntimeActivation,
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

function snapshot(): InteriorExpandedRuntimeOperationalSnapshot {
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
        status: "available",
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

test("Planner 41 rejects a huge sparse evidence array before allocating by declared length", () => {
  const base = snapshot();
  const sparse: unknown[] = [];
  sparse.length = 1_000_000;

  assert.throws(
    () =>
      resolveInteriorExpandedRuntimeActivation({
        ...base,
        interiorExactSegmentAvailability:
          sparse as never,
      }),
    /must be a dense ordinary array/,
  );
});

test("Planner 41 rejects a huge sparse allowedModes array before routing", () => {
  const sparseModes: unknown[] = [];
  sparseModes.length = 1_000_000;

  assert.throws(
    () =>
      routeInteriorExpandedWithRuntimeEvidence(
        snapshot(),
        {
          fromNodeId: FRONT_STREET_NODE,
          toNodeId: TIGER_BRANCH_NODE,
          allowedModes: sparseModes as never,
        },
      ),
    /must be a dense ordinary array/,
  );
});
