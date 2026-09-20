import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY,
  assessInteriorFernCanyonNextStepsGeometry,
  assertInteriorFernCanyonNextStepsGeometryIntegrity,
  type InteriorFernCanyonNextStepsGeometryAuthority,
} from "../src/data/zooInteriorFernCanyonNextStepsGeometry.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  return {
    ...authority,
    orderedNodeIds: [...authority.orderedNodeIds],
    nodes: authority.nodes.map((node) => ({ ...node })),
  } as unknown as InteriorFernCanyonNextStepsGeometryAuthority;
}

test("Planner 65 captures exact Fern Canyon next-steps v1 identity", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  assert.equal(authority.sourceWayId, "1481578624");
  assert.equal(authority.sourceWayVersion, 1);
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(authority.sourceWayChangeset, 178875075);
  assert.equal(authority.sourceHighway, "steps");
  assert.equal(authority.sourceIncline, "up");
  assert.equal(authority.sourceName, "Fern Canyon Trail");
});

test("Planner 65 captures both version-pinned node coordinates", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  assert.deepEqual(authority.orderedNodeIds, [
    "13588159634",
    "13588159633",
  ]);
  assert.deepEqual(
    authority.nodes.map((node) => [
      node.sourceObjectId,
      node.lat,
      node.lng,
    ]),
    [
      ["13588159634", 32.7357982, -117.150403],
      ["13588159633", 32.7357407, -117.1503614],
    ],
  );
});

test("Planner 65 records reverse source-order traversal without inferring oneWay", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  assert.equal(authority.traversalFromNodeId, "13588159633");
  assert.equal(authority.traversalToNodeId, "13588159634");
  assert.equal(authority.sourceOrderTraversal, "reverse");
  assert.equal(Object.hasOwn(authority, "oneWay"), false);
});

test("Planner 65 remains blocked on far-end topology and route semantics", () => {
  assert.deepEqual(assessInteriorFernCanyonNextStepsGeometry(), {
    status: "geometry-captured",
    authorityId: "sdz-interior-fern-canyon-next-steps-v1-geometry",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "1481578624",
    sourceWayVersion: 1,
    sourceWayNodeCount: 2,
    traversalFromNodeId: "13588159633",
    traversalToNodeId: "13588159634",
    sourceOrderTraversal: "reverse",
    coordinateProvenance: "version-pinned",
    farEndpointTopologyStatus: "not-frozen",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
        "EXACT_FERN_CANYON_NEXT_STEPS_SEGMENT_SEMANTICS_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 65 does not materialize RouteEdge semantics", () => {
  const authority =
    INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0] as unknown as Record<string, unknown>;
  for (const field of [
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
  ]) {
    assert.equal(Object.hasOwn(authority, field), false);
  }
});

test("Planner 65 rejects coordinate drift", () => {
  const forged = mutableClone();
  (forged.nodes[0] as unknown as { lat: number }).lat = 0;
  assert.throws(
    () => assertInteriorFernCanyonNextStepsGeometryIntegrity([forged]),
    /node 13588159634 drifted/,
  );
});

test("Planner 65 rejects source-order traversal drift", () => {
  const forged = mutableClone() as unknown as {
    sourceOrderTraversal: string;
  };
  forged.sourceOrderTraversal = "forward";
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsGeometryIntegrity([
        forged as unknown as InteriorFernCanyonNextStepsGeometryAuthority,
      ]),
    /geometry drifted/,
  );
});

test("Planner 65 rejects decorated node arrays", () => {
  const forged = mutableClone();
  (forged.nodes as unknown as unknown[] & { extra?: boolean }).extra = true;
  assert.throws(
    () => assertInteriorFernCanyonNextStepsGeometryIntegrity([forged]),
    /node provenance collection cannot contain extra own properties/,
  );
});

test("Planner 65 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "stairs", {
    configurable: true,
    enumerable: false,
    value: true,
  });
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsGeometryIntegrity([
        forged as unknown as InteriorFernCanyonNextStepsGeometryAuthority,
      ]),
    /cannot contain unknown field stairs|cannot materialize route field stairs/,
  );
});

test("Planner 65 exports and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  const assessment = assessInteriorFernCanyonNextStepsGeometry();
  assert.equal(Object.isFrozen(INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.orderedNodeIds), true);
  assert.equal(Object.isFrozen(authority.nodes), true);
  assert.equal(Object.isFrozen(authority.nodes[0]), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
