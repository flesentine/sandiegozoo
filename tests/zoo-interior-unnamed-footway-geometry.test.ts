import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_UNNAMED_FOOTWAY_GEOMETRY,
  assessInteriorUnnamedFootwayGeometry,
  assertInteriorUnnamedFootwayGeometryIntegrity,
  type InteriorUnnamedFootwayGeometryAuthority,
} from "../src/data/zooInteriorUnnamedFootwayGeometry.ts";

function mutableClone() {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  return {
    ...authority,
    orderedNodeIds: [...authority.orderedNodeIds],
    nodes: authority.nodes.map((node) => ({ ...node })),
  } as unknown as InteriorUnnamedFootwayGeometryAuthority;
}

test("Planner 67 captures exact unnamed footway v1 identity without inventing a name", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  assert.equal(authority.sourceWayId, "1481578625");
  assert.equal(authority.sourceWayVersion, 1);
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(authority.sourceWayChangeset, 178875075);
  assert.equal(authority.sourceHighway, "footway");
  assert.equal(authority.sourceNameStatus, "absent");
  assert.equal(Object.hasOwn(authority, "sourceName"), false);
});

test("Planner 67 captures both exact node versions and coordinates", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  assert.deepEqual(authority.orderedNodeIds, [
    "13588159634",
    "1619736694",
  ]);
  assert.deepEqual(
    authority.nodes.map((node) => [
      node.sourceObjectId,
      node.sourceVersion,
      node.lat,
      node.lng,
    ]),
    [
      ["13588159634", 1, 32.7357982, -117.150403],
      ["1619736694", 2, 32.7358299, -117.150419],
    ],
  );
});

test("Planner 67 preserves forward source-order traversal without inferring oneWay", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  assert.equal(authority.traversalFromNodeId, "13588159634");
  assert.equal(authority.traversalToNodeId, "1619736694");
  assert.equal(authority.sourceOrderTraversal, "forward");
  assert.equal(Object.hasOwn(authority, "oneWay"), false);
});

test("Planner 67 remains blocked on far-end topology and route semantics", () => {
  assert.deepEqual(assessInteriorUnnamedFootwayGeometry(), {
    status: "geometry-captured",
    authorityId: "sdz-interior-tiger-trail-unnamed-footway-v1-geometry",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "1481578625",
    sourceWayVersion: 1,
    sourceNameStatus: "absent",
    sourceWayNodeCount: 2,
    traversalFromNodeId: "13588159634",
    traversalToNodeId: "1619736694",
    coordinateProvenance: "version-pinned",
    farEndpointTopologyStatus: "not-frozen",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "UNNAMED_FOOTWAY_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
        "EXACT_UNNAMED_FOOTWAY_SEGMENT_SEMANTICS_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 67 does not materialize RouteEdge semantics", () => {
  const authority =
    INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0] as unknown as Record<string, unknown>;
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

test("Planner 67 rejects node-version drift", () => {
  const forged = mutableClone();
  (forged.nodes[1] as unknown as { sourceVersion: number }).sourceVersion = 1;
  assert.throws(
    () => assertInteriorUnnamedFootwayGeometryIntegrity([forged]),
    /node 1619736694 drifted/,
  );
});

test("Planner 67 rejects invented source names", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  (forged as Record<string, unknown>).sourceName = "Fern Canyon Trail";
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayGeometryIntegrity([
        forged as unknown as InteriorUnnamedFootwayGeometryAuthority,
      ]),
    /cannot contain unknown field sourceName/,
  );
});

test("Planner 67 rejects decorated node arrays", () => {
  const forged = mutableClone();
  (forged.nodes as unknown as unknown[] & { extra?: boolean }).extra = true;
  assert.throws(
    () => assertInteriorUnnamedFootwayGeometryIntegrity([forged]),
    /node provenance collection cannot contain extra own properties/,
  );
});

test("Planner 67 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "mode", {
    configurable: true,
    enumerable: false,
    value: "walk",
  });
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayGeometryIntegrity([
        forged as unknown as InteriorUnnamedFootwayGeometryAuthority,
      ]),
    /cannot contain unknown field mode|cannot materialize route field mode/,
  );
});

test("Planner 67 exports and assessment are deeply immutable", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  const assessment = assessInteriorUnnamedFootwayGeometry();
  assert.equal(Object.isFrozen(INTERIOR_UNNAMED_FOOTWAY_GEOMETRY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.orderedNodeIds), true);
  assert.equal(Object.isFrozen(authority.nodes), true);
  assert.equal(Object.isFrozen(authority.nodes[0]), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
