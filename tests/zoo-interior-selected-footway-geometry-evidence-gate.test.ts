import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE,
  assessInteriorSelectedFootwayGeometryEvidence,
  assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity,
  type InteriorSelectedFootwayGeometryEvidenceGate,
} from "../src/data/zooInteriorSelectedFootwayGeometryEvidenceGate.ts";

function cloneGate(): InteriorSelectedFootwayGeometryEvidenceGate {
  const gate = INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE[0];
  return {
    ...gate,
    orderedNodeIds: [...gate.orderedNodeIds],
  } as InteriorSelectedFootwayGeometryEvidenceGate;
}

test("Planner 70 freezes the selected Planner 69 continuation identity", () => {
  const gate = INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE[0];
  assert.equal(gate.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(gate.sourceWayId, "1481578626");
  assert.equal(gate.sourceWayVersion, 1);
  assert.equal(gate.sourceWayTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(gate.sourceWayChangeset, 178875075);
  assert.equal(gate.sourceHighway, "footway");
  assert.equal(gate.sourceNameStatus, "absent");
  assert.equal(
    gate.sourceAccessStatus,
    "no-explicit-access-restriction-captured",
  );
  assert.equal(gate.sourceFee, "yes");
  assert.equal(gate.sourceLayer, "-1");
  assert.deepEqual(Array.from(gate.orderedNodeIds), [
    "1619736694",
    "48920902",
  ]);
});

test("Planner 70 remains blocked on the version-pinned far coordinate", () => {
  const gate = INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE[0];
  assert.equal(gate.fromNodeCoordinateStatus, "captured-upstream");
  assert.equal(gate.toNodeCoordinateStatus, "not-captured");
  assert.equal(gate.farEndpointTopologyStatus, "not-captured");

  const assessment = assessInteriorSelectedFootwayGeometryEvidence();
  assert.equal(assessment.status, "blocked");
  assert.equal(
    assessment.reason,
    "VERSION_PINNED_SELECTED_FOOTWAY_TO_NODE_COORDINATE_NOT_CAPTURED",
  );
  assert.equal(assessment.sourceWayId, "1481578626");
  assert.equal(assessment.traversalFromNodeId, "1619736694");
  assert.equal(assessment.traversalToNodeId, "48920902");
  assert.deepEqual(Array.from(assessment.routeGraphExpansion.reasons), [
    "EXACT_SELECTED_FOOTWAY_TO_NODE_COORDINATE_NOT_SOURCED",
    "SELECTED_FOOTWAY_FAR_ENDPOINT_TOPOLOGY_NOT_SOURCED",
    "EXACT_SELECTED_FOOTWAY_PROVENANCE_NOT_COMPLETE",
  ]);
});

test("Planner 70 rejects invented coordinate or RouteEdge semantics", () => {
  const forged = {
    ...cloneGate(),
    lat: 32.7,
  } as unknown as InteriorSelectedFootwayGeometryEvidenceGate;
  assert.throws(
    () => assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity([forged]),
    /unknown field lat|cannot materialize downstream field lat/,
  );

  const forgedRoute = {
    ...cloneGate(),
    distanceMeters: 10,
  } as unknown as InteriorSelectedFootwayGeometryEvidenceGate;
  assert.throws(
    () =>
      assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity([forgedRoute]),
    /unknown field distanceMeters|cannot materialize downstream field distanceMeters/,
  );
});

test("Planner 70 rejects selected-way or node-sequence drift", () => {
  const wrongWay = cloneGate();
  (wrongWay as { sourceWayId: string }).sourceWayId = "148910140";
  assert.throws(
    () => assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity([wrongWay]),
    /geometry evidence gate drifted|detached from Planner 69/,
  );

  const wrongNodes = cloneGate();
  (wrongNodes as { orderedNodeIds: string[] }).orderedNodeIds = [
    "48920902",
    "1619736694",
  ];
  assert.throws(
    () =>
      assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity([wrongNodes]),
    /ordered node sequence drifted/,
  );
});

test("Planner 70 rejects accessor-backed collection elements", () => {
  const collection = [] as unknown as InteriorSelectedFootwayGeometryEvidenceGate[];
  Object.defineProperty(collection, "0", {
    enumerable: true,
    configurable: true,
    get() {
      return cloneGate();
    },
  });
  Object.defineProperty(collection, "length", {
    value: 1,
    writable: true,
    configurable: false,
  });

  assert.throws(
    () => assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity(collection),
    /requires enumerable own data element 0/,
  );
});

test("Planner 70 exported records ignore Object.prototype pollution", () => {
  Object.defineProperty(Object.prototype, "routeNodeId", {
    value: "forged",
    configurable: true,
  });
  Object.defineProperty(Object.prototype, "distanceMeters", {
    value: 999,
    configurable: true,
  });

  try {
    const gate = INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE[0];
    const assessment = assessInteriorSelectedFootwayGeometryEvidence();
    assert.equal(Object.getPrototypeOf(gate), null);
    assert.equal(Object.getPrototypeOf(assessment), null);
    assert.equal(Object.getPrototypeOf(assessment.routeGraphExpansion), null);
    assert.equal("routeNodeId" in gate, false);
    assert.equal("distanceMeters" in assessment.routeGraphExpansion, false);
  } finally {
    delete (Object.prototype as { routeNodeId?: string }).routeNodeId;
    delete (Object.prototype as { distanceMeters?: number }).distanceMeters;
  }
});

test("Planner 70 authority and assessment are deeply immutable", () => {
  const gate = INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE[0];
  const assessment = assessInteriorSelectedFootwayGeometryEvidence();
  assert.equal(
    Object.isFrozen(INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE),
    true,
  );
  assert.equal(Object.isFrozen(gate), true);
  assert.equal(Object.isFrozen(gate.orderedNodeIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});


test("Planner 70 rejects collection element replacement during clone screening", () => {
  const candidate = cloneGate() as unknown as Record<string, unknown>;
  const forged = cloneGate() as unknown as InteriorSelectedFootwayGeometryEvidenceGate;
  const collection = [
    candidate as unknown as InteriorSelectedFootwayGeometryEvidenceGate,
  ];

  Object.defineProperty(candidate, "sourceFee", {
    configurable: true,
    enumerable: true,
    get() {
      Object.defineProperty(candidate, "sourceFee", {
        configurable: true,
        enumerable: true,
        value: "yes",
      });
      collection[0] = forged;
      return "yes";
    },
  });

  assert.throws(
    () => assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity(collection),
    /cannot mutate element 0 during validation/,
  );
});


test("Planner 70 rejects collection growth during clone screening", () => {
  const candidate = cloneGate() as unknown as Record<string, unknown>;
  const forged = cloneGate();
  const collection = [
    candidate as unknown as InteriorSelectedFootwayGeometryEvidenceGate,
  ];

  Object.defineProperty(candidate, "sourceFee", {
    configurable: true,
    enumerable: true,
    get() {
      Object.defineProperty(candidate, "sourceFee", {
        configurable: true,
        enumerable: true,
        value: "yes",
      });
      collection.push(forged);
      return "yes";
    },
  });

  assert.throws(
    () => assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity(collection),
    /must be an ordinary array of length 1|cannot contain extra own properties/,
  );
});


test("Planner 70 rejects nested orderedNodeIds replacement during clone screening", () => {
  const candidate = cloneGate() as unknown as Record<string, unknown>;
  const originalNodes = candidate.orderedNodeIds as string[];
  let reads = 0;

  Object.defineProperty(candidate, "plannerMaterialization", {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      if (reads === 2) {
        candidate.orderedNodeIds = new Proxy([...originalNodes], {});
        Object.defineProperty(candidate, "plannerMaterialization", {
          configurable: true,
          enumerable: true,
          value: "geometry-evidence-gate-only",
        });
      }
      return "geometry-evidence-gate-only";
    },
  });

  assert.throws(
    () =>
      assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity([
        candidate as unknown as InteriorSelectedFootwayGeometryEvidenceGate,
      ]),
    /cannot mutate orderedNodeIds during validation/,
  );
});
