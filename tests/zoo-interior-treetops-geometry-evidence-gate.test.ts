import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE,
  assessInteriorTreetopsGeometryEvidence,
  assertInteriorTreetopsGeometryEvidenceGateIntegrity,
  type InteriorTreetopsGeometryEvidenceGate,
} from "../src/data/zooInteriorTreetopsGeometryEvidenceGate.ts";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
} from "../src/data/zooInteriorObjectiveBranchSelectionAuthority.ts";

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
  "sourceWayNodeIds",
  "sourceWayCoordinates",
  "nextJunctionNodeId",
] as const;

function mutableClone() {
  return {
    ...INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE[0],
  } as unknown as InteriorTreetopsGeometryEvidenceGate;
}

test("Planner 42 pins the objective-selected Treetops Way source identity without inventing geometry", () => {
  const gate = INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE[0];
  const selection = INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0];

  assert.equal(INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE.length, 1);
  assert.equal(gate.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(gate.objectiveSourceRecordId, selection.objectiveSourceRecordId);
  assert.equal(gate.anchorNodeId, "1619736626");
  assert.equal(gate.anchorNodeId, selection.selectedCandidateNodeId);
  assert.equal(gate.sourceWayId, "148910139");
  assert.equal(gate.sourceWayId, selection.selectedConnectorWayId);
  assert.equal(gate.sourceWayVersion, 7);
  assert.equal(gate.sourceWayTimestamp, "2026-02-21T20:28:40Z");
  assert.equal(gate.sourceName, "Treetops Way");
  assert.equal(gate.sourceHighway, "footway");
  assert.equal(gate.sourceSurface, "concrete");
});

test("Planner 42 remains fail-closed until the exact version-pinned node sequence is captured", () => {
  assert.deepEqual(assessInteriorTreetopsGeometryEvidence(), {
    status: "blocked",
    reason: "VERSION_PINNED_TREETOPS_WAY_NODE_SEQUENCE_NOT_CAPTURED",
    authorityId: "sdz-interior-treetops-way-geometry-evidence-gate",
    objectiveSourceRecordId: "sdz-tiger-trail",
    anchorNodeId: "1619736626",
    sourceWayId: "148910139",
    sourceWayVersion: 7,
    nextJunctionSelection: "blocked",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "EXACT_TREETOPS_WAY_NODE_SEQUENCE_NOT_SOURCED",
        "NEXT_JUNCTION_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("Planner 42 source metadata cannot materialize geometry or RouteEdge semantics", () => {
  const gate = INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE[0];

  assert.equal(gate.versionPinnedNodeSequenceStatus, "not-captured");
  assert.equal(gate.nextJunctionSelection, "blocked");
  assert.equal(gate.plannerMaterialization, "geometry-evidence-gate-only");

  for (const field of DOWNSTREAM_FIELDS) {
    assert.equal(Object.hasOwn(gate, field), false);
  }
});

test("Planner 42 rejects attempts to smuggle an unsourced node sequence into the evidence gate", () => {
  const forged = {
    ...mutableClone(),
    sourceWayNodeIds: ["1619736626", "9999999999"],
  } as unknown as InteriorTreetopsGeometryEvidenceGate;

  assert.throws(
    () => assertInteriorTreetopsGeometryEvidenceGateIntegrity([forged]),
    /cannot contain unknown field sourceWayNodeIds|cannot materialize downstream field sourceWayNodeIds/,
  );
});

test("Planner 42 rejects proxy-backed records before a get trap can substitute validated identity", () => {
  let getTrapCalls = 0;
  const target = mutableClone();
  const proxy = new Proxy(target, {
    get(innerTarget, property, receiver) {
      getTrapCalls += 1;
      if (property === "sourceWayVersion") {
        return getTrapCalls === 1 ? 7 : 8;
      }
      return Reflect.get(innerTarget, property, receiver);
    },
  });

  assert.throws(
    () =>
      assertInteriorTreetopsGeometryEvidenceGateIntegrity([
        proxy as unknown as InteriorTreetopsGeometryEvidenceGate,
      ]),
    /cannot be Proxy-backed|structured-cloneable plain data/,
  );
  assert.equal(getTrapCalls, 0);
});

test("Planner 42 blocks inherited downstream RouteEdge fields and isolates the exported gate from Object.prototype", () => {
  Object.defineProperty(Object.prototype, "fromNodeId", {
    configurable: true,
    value: "polluted-route-node",
  });

  try {
    const gate = INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE[0] as unknown as {
      fromNodeId?: string;
    };
    assert.equal(Object.getPrototypeOf(gate), null);
    assert.equal(gate.fromNodeId, undefined);

    const forged = mutableClone();
    assert.throws(
      () => assertInteriorTreetopsGeometryEvidenceGateIntegrity([forged]),
      /cannot materialize downstream field fromNodeId/,
    );
  } finally {
    delete (Object.prototype as { fromNodeId?: string }).fromNodeId;
  }
});

test("Planner 42 rejects version drift even when the connector way id remains the same", () => {
  const forged = mutableClone() as unknown as {
    sourceWayVersion: number;
    sourceWayVersionUrl: string;
  };
  forged.sourceWayVersion = 8;
  forged.sourceWayVersionUrl =
    "https://api.openstreetmap.org/api/0.6/way/148910139/8";

  assert.throws(
    () =>
      assertInteriorTreetopsGeometryEvidenceGateIntegrity([
        forged as unknown as InteriorTreetopsGeometryEvidenceGate,
      ]),
    /drifted from its frozen source boundary/,
  );
});

test("Planner 42 rejects anchor drift away from the Planner 27 selected branch", () => {
  const forged = mutableClone() as unknown as { anchorNodeId: string };
  forged.anchorNodeId = "6239154982";

  assert.throws(
    () =>
      assertInteriorTreetopsGeometryEvidenceGateIntegrity([
        forged as unknown as InteriorTreetopsGeometryEvidenceGate,
      ]),
    /drifted from its frozen source boundary|drifted from the Planner 27 objective-selected Treetops branch/,
  );
});

test("Planner 42 requires exact canonical OSM source URLs", () => {
  const forged = mutableClone() as unknown as { sourceWayVersionUrl: string };
  forged.sourceWayVersionUrl += "?download=1";

  assert.throws(
    () =>
      assertInteriorTreetopsGeometryEvidenceGateIntegrity([
        forged as unknown as InteriorTreetopsGeometryEvidenceGate,
      ]),
    /drifted from its frozen source boundary/,
  );
});

test("Planner 42 validates its authority collection as an exact ordinary array", () => {
  const decorated = [mutableClone()] as unknown as InteriorTreetopsGeometryEvidenceGate[] & {
    sourceWayNodeIds?: string[];
  };
  decorated.sourceWayNodeIds = ["1619736626"];

  assert.throws(
    () => assertInteriorTreetopsGeometryEvidenceGateIntegrity(decorated),
    /evidence-gate collection cannot contain extra own properties/,
  );

  const arrayLike = {
    0: mutableClone(),
    length: 1,
  } as unknown as readonly InteriorTreetopsGeometryEvidenceGate[];
  assert.throws(
    () => assertInteriorTreetopsGeometryEvidenceGateIntegrity(arrayLike),
    /evidence-gate collection must be an ordinary array of length 1/,
  );
});

test("Planner 42 gate and assessment are deeply immutable", () => {
  const gate = INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE[0];
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE), true);
  assert.equal(Object.isFrozen(gate), true);

  const assessment = assessInteriorTreetopsGeometryEvidence();
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
