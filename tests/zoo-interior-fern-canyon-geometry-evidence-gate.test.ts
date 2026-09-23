import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE,
  assessInteriorFernCanyonGeometryEvidence,
  assertInteriorFernCanyonGeometryEvidenceGateIntegrity,
  type InteriorFernCanyonGeometryEvidenceGate,
} from "../src/data/zooInteriorFernCanyonGeometryEvidenceGate.ts";
import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
} from "../src/data/zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import {
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY,
} from "../src/data/zooInteriorTreetopsEndpointRouteNodeAuthority.ts";

const DOWNSTREAM_FIELDS = [
  "fromNodeId",
  "toNodeId",
  "mode",
  "distanceMeters",
  "durationMinutes",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "oneWay",
  "status",
  "provenance",
  "routeNodeId",
  "lat",
  "lng",
  "coordinates",
  "sourceWayCoordinates",
] as const;

function mutableClone() {
  const gate = INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE[0];
  return {
    ...gate,
    orderedNodeIds: [...gate.orderedNodeIds],
  } as unknown as InteriorFernCanyonGeometryEvidenceGate;
}

test("Planner 59 pins the Fern Canyon Trail branch selected by Planner 44", () => {
  const gate = INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE[0];
  const topology = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  const selected = topology.selectedJunctionConnection;

  assert.equal(INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE.length, 1);
  assert.equal(gate.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(gate.anchorNodeId, "13588159626");
  assert.equal(gate.anchorNodeId, topology.nextJunctionNodeId);
  assert.equal(gate.sourceWayId, "1481578621");
  assert.equal(gate.sourceWayId, selected.sourceWayId);
  assert.equal(gate.sourceWayVersion, 1);
  assert.equal(gate.sourceWayTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(gate.sourceWayChangeset, 178875075);
  assert.equal(gate.sourceHighway, "footway");
  assert.equal(gate.sourceName, "Fern Canyon Trail");
  assert.deepEqual(gate.orderedNodeIds, [
    "13588159625",
    "13588159626",
  ]);
});

test("Planner 59 anchors the new branch to the materialized Treetops endpoint", () => {
  const gate = INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE[0];

  assert.equal(
    gate.anchorNodeId,
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceObjectId,
  );
  assert.equal(
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY.routeNodeId,
    "sdz-interior-treetops-node-13588159626-route-node",
  );
  assert.equal(gate.anchorWayIndex, 1);
  assert.equal(gate.farEndpointWayIndex, 0);
  assert.equal(gate.farEndpointNodeId, "13588159625");
});

test("Planner 59 remains fail-closed until the far endpoint coordinate and topology are sourced", () => {
  const assessment = assessInteriorFernCanyonGeometryEvidence();
  assert.deepEqual(
    {
      ...assessment,
      routeGraphExpansion: {
        ...assessment.routeGraphExpansion,
      },
    },
    {
    status: "blocked",
    reason:
      "VERSION_PINNED_FERN_CANYON_FAR_ENDPOINT_COORDINATE_NOT_CAPTURED",
    authorityId:
      "sdz-interior-fern-canyon-trail-geometry-evidence-gate",
    objectiveSourceRecordId: "sdz-tiger-trail",
    anchorNodeId: "13588159626",
    sourceWayId: "1481578621",
    sourceWayVersion: 1,
    farEndpointNodeId: "13588159625",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "EXACT_FERN_CANYON_FAR_ENDPOINT_COORDINATE_NOT_SOURCED",
        "FERN_CANYON_FAR_ENDPOINT_TOPOLOGY_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  );
});

test("Planner 59 cannot promote source tags into RouteEdge or coordinate semantics", () => {
  const gate = INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE[0];

  assert.equal(gate.farEndpointCoordinateStatus, "not-captured");
  assert.equal(gate.farEndpointTopologyStatus, "not-captured");
  assert.equal(gate.plannerMaterialization, "geometry-evidence-gate-only");

  for (const field of DOWNSTREAM_FIELDS) {
    assert.equal(Object.hasOwn(gate, field), false);
  }
});

test("Planner 59 rejects way identity or version drift", () => {
  const forged = mutableClone() as unknown as {
    sourceWayId: string;
    sourceWayVersion: number;
  };
  forged.sourceWayId = "1481578622";
  forged.sourceWayVersion = 2;

  assert.throws(
    () =>
      assertInteriorFernCanyonGeometryEvidenceGateIntegrity([
        forged as unknown as InteriorFernCanyonGeometryEvidenceGate,
      ]),
    /drifted from its frozen source boundary|drifted from Planner 44/,
  );
});

test("Planner 59 rejects ordered-node or anchor-direction drift", () => {
  const forged = mutableClone() as unknown as {
    orderedNodeIds: [string, string];
    anchorWayIndex: number;
  };
  forged.orderedNodeIds = [
    "13588159626",
    "13588159625",
  ];
  forged.anchorWayIndex = 0;

  assert.throws(
    () =>
      assertInteriorFernCanyonGeometryEvidenceGateIntegrity([
        forged as unknown as InteriorFernCanyonGeometryEvidenceGate,
      ]),
    /drifted from its frozen source boundary|drifted from Planner 44/,
  );
});

test("Planner 59 rejects hidden or inherited downstream materialization", () => {
  const hidden = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(hidden, "distanceMeters", {
    configurable: true,
    enumerable: false,
    value: 10,
  });

  assert.throws(
    () =>
      assertInteriorFernCanyonGeometryEvidenceGateIntegrity([
        hidden as unknown as InteriorFernCanyonGeometryEvidenceGate,
      ]),
    /cannot contain unknown field distanceMeters|cannot materialize downstream field distanceMeters/,
  );

  Object.defineProperty(Object.prototype, "routeNodeId", {
    configurable: true,
    value: "polluted",
  });

  try {
    const forged = mutableClone();
    assert.throws(
      () =>
        assertInteriorFernCanyonGeometryEvidenceGateIntegrity([
          forged,
        ]),
      /cannot materialize downstream field routeNodeId/,
    );

    const canonical =
      INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE[0] as unknown as {
        routeNodeId?: string;
      };
    assert.equal(Object.getPrototypeOf(canonical), null);
    assert.equal(canonical.routeNodeId, undefined);
  } finally {
    delete (Object.prototype as { routeNodeId?: string }).routeNodeId;
  }
});

test("Planner 59 validates the authority collection and node sequence as ordinary arrays", () => {
  const decorated = [
    mutableClone(),
  ] as unknown as InteriorFernCanyonGeometryEvidenceGate[] & {
    extra?: boolean;
  };
  decorated.extra = true;

  assert.throws(
    () =>
      assertInteriorFernCanyonGeometryEvidenceGateIntegrity(decorated),
    /collection cannot contain extra own properties/,
  );

  const forged = mutableClone() as unknown as {
    orderedNodeIds: [string, string] & { extra?: boolean };
  };
  forged.orderedNodeIds.extra = true;

  assert.throws(
    () =>
      assertInteriorFernCanyonGeometryEvidenceGateIntegrity([
        forged as unknown as InteriorFernCanyonGeometryEvidenceGate,
      ]),
    /ordered node sequence cannot contain extra own properties/,
  );
});

test("Planner 59 gate and assessment are deeply immutable", () => {
  const gate = INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE[0];
  const assessment = assessInteriorFernCanyonGeometryEvidence();

  assert.equal(
    Object.isFrozen(INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE),
    true,
  );
  assert.equal(Object.isFrozen(gate), true);
  assert.equal(Object.isFrozen(gate.orderedNodeIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
  assert.equal(
    Object.isFrozen(assessment.routeGraphExpansion.reasons),
    true,
  );
});


test("Planner 59 assessment ignores Object.prototype pollution", () => {
  Object.defineProperty(Object.prototype, "routeNodeId", {
    configurable: true,
    value: "polluted",
  });
  Object.defineProperty(Object.prototype, "distanceMeters", {
    configurable: true,
    value: 999,
  });

  try {
    const assessment = assessInteriorFernCanyonGeometryEvidence();

    assert.equal(Object.getPrototypeOf(assessment), null);
    assert.equal(
      Object.getPrototypeOf(assessment.routeGraphExpansion),
      null,
    );
    assert.equal(
      "routeNodeId" in
        (assessment as unknown as Record<string, unknown>),
      false,
    );
    assert.equal(
      "distanceMeters" in
        (assessment.routeGraphExpansion as unknown as Record<
          string,
          unknown
        >),
      false,
    );
  } finally {
    delete (Object.prototype as Record<string, unknown>).routeNodeId;
    delete (Object.prototype as Record<string, unknown>).distanceMeters;
  }
});
