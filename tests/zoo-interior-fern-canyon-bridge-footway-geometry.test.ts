import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY,
  assessInteriorFernCanyonBridgeFootwayGeometry,
  assertInteriorFernCanyonBridgeFootwayGeometryIntegrity,
  type InteriorFernCanyonBridgeFootwayGeometryAuthority,
} from "../src/data/zooInteriorFernCanyonBridgeFootwayGeometry.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY[0];
  return {
    ...authority,
    orderedNodeIds: [...authority.orderedNodeIds],
    nodes: authority.nodes.map((node) => ({ ...node })),
  } as unknown as InteriorFernCanyonBridgeFootwayGeometryAuthority;
}

test("Planner 63 captures exact Fern Canyon bridge footway v1 identity", () => {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY[0];
  assert.equal(authority.sourceWayId, "1481578623");
  assert.equal(authority.sourceWayVersion, 1);
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(authority.sourceWayChangeset, 178875075);
  assert.equal(authority.sourceHighway, "footway");
  assert.equal(authority.sourceBridge, "yes");
  assert.equal(authority.sourceLayer, "1");
  assert.equal(authority.sourceName, "Fern Canyon Trail");
});

test("Planner 63 captures all three version-pinned node coordinates", () => {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY[0];
  assert.deepEqual(authority.orderedNodeIds, [
    "13588159627",
    "13588159632",
    "13588159633",
  ]);
  assert.deepEqual(
    authority.nodes.map((node) => [
      node.sourceObjectId,
      node.lat,
      node.lng,
    ]),
    [
      ["13588159627", 32.7357192, -117.1500664],
      ["13588159632", 32.7356752, -117.1502715],
      ["13588159633", 32.7357407, -117.1503614],
    ],
  );
});

test("Planner 63 preserves source orientation without inferring oneWay", () => {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY[0];
  assert.equal(authority.traversalFromNodeId, "13588159627");
  assert.equal(authority.traversalToNodeId, "13588159633");
  assert.equal(Object.hasOwn(authority, "oneWay"), false);
});

test("Planner 63 remains blocked on far-end topology and route semantics", () => {
  assert.deepEqual(assessInteriorFernCanyonBridgeFootwayGeometry(), {
    status: "geometry-captured",
    authorityId: "sdz-interior-fern-canyon-bridge-footway-v1-geometry",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "1481578623",
    sourceWayVersion: 1,
    sourceWayNodeCount: 3,
    traversalFromNodeId: "13588159627",
    traversalToNodeId: "13588159633",
    coordinateProvenance: "version-pinned",
    farEndpointTopologyStatus: "not-frozen",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "FERN_CANYON_BRIDGE_FOOTWAY_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
        "EXACT_FERN_CANYON_BRIDGE_FOOTWAY_SEGMENT_SEMANTICS_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 63 does not materialize RouteEdge semantics", () => {
  const authority =
    INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY[0] as unknown as Record<string, unknown>;
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

test("Planner 63 rejects coordinate drift", () => {
  const forged = mutableClone();
  (forged.nodes[1] as unknown as { lng: number }).lng = 0;
  assert.throws(
    () =>
      assertInteriorFernCanyonBridgeFootwayGeometryIntegrity([forged]),
    /node 13588159632 drifted/,
  );
});

test("Planner 63 rejects way tag drift", () => {
  const forged = mutableClone() as unknown as { sourceBridge: string };
  forged.sourceBridge = "no";
  assert.throws(
    () =>
      assertInteriorFernCanyonBridgeFootwayGeometryIntegrity([
        forged as unknown as InteriorFernCanyonBridgeFootwayGeometryAuthority,
      ]),
    /geometry drifted/,
  );
});

test("Planner 63 rejects decorated node arrays", () => {
  const forged = mutableClone();
  (forged.nodes as unknown as unknown[] & { extra?: boolean }).extra = true;
  assert.throws(
    () =>
      assertInteriorFernCanyonBridgeFootwayGeometryIntegrity([forged]),
    /node provenance collection cannot contain extra own properties/,
  );
});

test("Planner 63 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "mode", {
    configurable: true,
    enumerable: false,
    value: "walk",
  });
  assert.throws(
    () =>
      assertInteriorFernCanyonBridgeFootwayGeometryIntegrity([
        forged as unknown as InteriorFernCanyonBridgeFootwayGeometryAuthority,
      ]),
    /cannot contain unknown field mode|cannot materialize route field mode/,
  );
});

test("Planner 63 exports and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY[0];
  const assessment = assessInteriorFernCanyonBridgeFootwayGeometry();
  assert.equal(
    Object.isFrozen(INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY),
    true,
  );
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.orderedNodeIds), true);
  assert.equal(Object.isFrozen(authority.nodes), true);
  assert.equal(Object.isFrozen(authority.nodes[0]), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
