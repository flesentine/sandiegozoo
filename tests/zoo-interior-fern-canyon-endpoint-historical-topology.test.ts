import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_ENDPOINT_HISTORICAL_TOPOLOGY,
  assessInteriorFernCanyonEndpointHistoricalTopology,
  assertInteriorFernCanyonEndpointHistoricalTopologyIntegrity,
  type InteriorFernCanyonEndpointHistoricalTopologyAuthority,
} from "../src/data/zooInteriorFernCanyonEndpointHistoricalTopology.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_ENDPOINT_HISTORICAL_TOPOLOGY[0];
  return {
    ...authority,
    endpointNode: { ...authority.endpointNode },
    connectedWays: authority.connectedWays.map((way) => ({
      ...way,
      orderedNodeIds: [...way.orderedNodeIds],
    })),
  } as unknown as InteriorFernCanyonEndpointHistoricalTopologyAuthority;
}

test("Planner 60 captures the far Fern Canyon endpoint node exactly", () => {
  const authority = INTERIOR_FERN_CANYON_ENDPOINT_HISTORICAL_TOPOLOGY[0];
  assert.equal(authority.endpointNode.sourceObjectId, "13588159625");
  assert.equal(authority.endpointNode.sourceVersion, 1);
  assert.equal(authority.endpointNode.sourceTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(authority.endpointNode.sourceChangeset, 178875075);
  assert.equal(authority.endpointNode.lat, 32.7353594);
  assert.equal(authority.endpointNode.lng, -117.1501187);
});

test("Planner 60 proves the endpoint has exactly two historical connected ways", () => {
  const authority = INTERIOR_FERN_CANYON_ENDPOINT_HISTORICAL_TOPOLOGY[0];
  assert.equal(authority.connectedWays.length, 2);
  assert.equal(authority.connectedWays[0].sourceWayId, "1481578621");
  assert.equal(authority.connectedWays[1].sourceWayId, "1481578622");
});

test("Planner 60 identifies the unique onward continuation as Fern Canyon steps", () => {
  const authority = INTERIOR_FERN_CANYON_ENDPOINT_HISTORICAL_TOPOLOGY[0];
  const continuation = authority.connectedWays[1];

  assert.equal(authority.selectedContinuationWayId, "1481578622");
  assert.equal(authority.selectedContinuationHighway, "steps");
  assert.equal(continuation.sourceHighway, "steps");
  assert.equal(continuation.sourceBridge, "yes");
  assert.equal(continuation.sourceIncline, "up");
  assert.equal(continuation.sourceLayer, "1");
  assert.equal(continuation.sourceName, "Fern Canyon Trail");
  assert.deepEqual(continuation.orderedNodeIds, [
    "13588159627",
    "13588159628",
    "13588159629",
    "13588159630",
    "13588159631",
    "13588159625",
  ]);
  assert.equal(continuation.endpointNodeIndex, 5);
});

test("Planner 60 clears endpoint capture but keeps RouteEdge expansion fail-closed", () => {
  assert.deepEqual(assessInteriorFernCanyonEndpointHistoricalTopology(), {
    status: "endpoint-topology-sourced",
    authorityId: "sdz-interior-fern-canyon-endpoint-historical-topology",
    objectiveSourceRecordId: "sdz-tiger-trail",
    endpointNodeId: "13588159625",
    endpointCoordinate: "captured",
    historicalConnectedWayCount: 2,
    selectedContinuationWayId: "1481578622",
    selectedContinuationHighway: "steps",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "VERSION_PINNED_FERN_CANYON_STEPS_NODE_COORDINATES_NOT_CAPTURED",
        "EXACT_FERN_CANYON_STEPS_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("Planner 60 does not promote topology evidence into planner route fields", () => {
  const authority =
    INTERIOR_FERN_CANYON_ENDPOINT_HISTORICAL_TOPOLOGY[0] as unknown as Record<
      string,
      unknown
    >;
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

test("Planner 60 rejects endpoint coordinate drift", () => {
  const forged = mutableClone();
  (
    forged.endpointNode as unknown as { lat: number }
  ).lat = 32.735;

  assert.throws(
    () =>
      assertInteriorFernCanyonEndpointHistoricalTopologyIntegrity([forged]),
    /drifted from the captured historical evidence/,
  );
});

test("Planner 60 rejects continuation tag or node-sequence drift", () => {
  const forged = mutableClone();
  const continuation =
    forged.connectedWays[1] as unknown as {
      sourceHighway: string;
      orderedNodeIds: string[];
    };
  continuation.sourceHighway = "footway";
  continuation.orderedNodeIds[0] = "999";

  assert.throws(
    () =>
      assertInteriorFernCanyonEndpointHistoricalTopologyIntegrity([forged]),
    /continuation connection drifted/,
  );
});

test("Planner 60 rejects hidden route materialization", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "stairs", {
    configurable: true,
    enumerable: false,
    value: true,
  });

  assert.throws(
    () =>
      assertInteriorFernCanyonEndpointHistoricalTopologyIntegrity([
        forged as unknown as InteriorFernCanyonEndpointHistoricalTopologyAuthority,
      ]),
    /cannot contain unknown field stairs|cannot materialize route field stairs/,
  );
});

test("Planner 60 validates nested collections as ordinary exact arrays", () => {
  const forged = mutableClone();
  (
    forged.connectedWays as unknown as Array<unknown> & { extra?: boolean }
  ).extra = true;

  assert.throws(
    () =>
      assertInteriorFernCanyonEndpointHistoricalTopologyIntegrity([forged]),
    /connected way collection cannot contain extra own properties/,
  );
});

test("Planner 60 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_ENDPOINT_HISTORICAL_TOPOLOGY[0];
  const assessment = assessInteriorFernCanyonEndpointHistoricalTopology();

  assert.equal(
    Object.isFrozen(INTERIOR_FERN_CANYON_ENDPOINT_HISTORICAL_TOPOLOGY),
    true,
  );
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.endpointNode), true);
  assert.equal(Object.isFrozen(authority.connectedWays), true);
  assert.equal(Object.isFrozen(authority.connectedWays[1].orderedNodeIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
