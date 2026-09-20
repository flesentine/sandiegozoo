import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY,
  assessInteriorFernCanyonBridgeFarEndpointTopology,
  assertInteriorFernCanyonBridgeFarEndpointTopologyIntegrity,
  type InteriorFernCanyonBridgeFarEndpointTopologyAuthority,
} from "../src/data/zooInteriorFernCanyonBridgeFarEndpointTopology.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY[0];
  return {
    ...authority,
    endpointCoordinate: { ...authority.endpointCoordinate },
    connectedWays: authority.connectedWays.map((way) => ({
      ...way,
      orderedNodeIds: [...way.orderedNodeIds],
    })),
  } as unknown as InteriorFernCanyonBridgeFarEndpointTopologyAuthority;
}

test("Planner 64 freezes the exact far endpoint from Planner 63 geometry", () => {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.endpointNodeId, "13588159633");
  assert.equal(authority.endpointCoordinate.lat, 32.7357407);
  assert.equal(authority.endpointCoordinate.lng, -117.1503614);
});

test("Planner 64 proves exactly two historical ways at the bridge far endpoint", () => {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.connectedWays.length, 2);
  assert.equal(authority.connectedWays[0].sourceWayId, "1481578623");
  assert.equal(authority.connectedWays[1].sourceWayId, "1481578624");
});

test("Planner 64 selects the unique onward Fern Canyon steps segment", () => {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY[0];
  const continuation = authority.connectedWays[1];
  assert.equal(authority.selectedContinuationWayId, "1481578624");
  assert.equal(authority.selectedContinuationHighway, "steps");
  assert.equal(continuation.sourceHighway, "steps");
  assert.equal(continuation.sourceIncline, "up");
  assert.equal(continuation.sourceName, "Fern Canyon Trail");
  assert.deepEqual(continuation.orderedNodeIds, [
    "13588159634",
    "13588159633",
  ]);
  assert.equal(continuation.endpointNodeIndex, 1);
});

test("Planner 64 keeps next steps geometry fail-closed until the new node coordinate is captured", () => {
  assert.deepEqual(assessInteriorFernCanyonBridgeFarEndpointTopology(), {
    status: "endpoint-topology-sourced",
    authorityId: "sdz-interior-fern-canyon-bridge-footway-far-endpoint-topology",
    objectiveSourceRecordId: "sdz-tiger-trail",
    endpointNodeId: "13588159633",
    historicalConnectedWayCount: 2,
    selectedContinuationWayId: "1481578624",
    selectedContinuationHighway: "steps",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "VERSION_PINNED_FERN_CANYON_NEXT_STEPS_NODE_COORDINATE_NOT_CAPTURED",
        "EXACT_FERN_CANYON_NEXT_STEPS_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("Planner 64 does not materialize route semantics", () => {
  const authority =
    INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY[0] as unknown as Record<
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

test("Planner 64 rejects endpoint coordinate drift", () => {
  const forged = mutableClone();
  (forged.endpointCoordinate as unknown as { lat: number }).lat = 0;
  assert.throws(
    () =>
      assertInteriorFernCanyonBridgeFarEndpointTopologyIntegrity([forged]),
    /far-end topology drifted/,
  );
});

test("Planner 64 rejects continuation identity drift", () => {
  const forged = mutableClone();
  (
    forged.connectedWays[1] as unknown as { sourceWayId: string }
  ).sourceWayId = "1481579999";
  assert.throws(
    () =>
      assertInteriorFernCanyonBridgeFarEndpointTopologyIntegrity([forged]),
    /continuation connection drifted/,
  );
});

test("Planner 64 rejects decorated connected-way arrays", () => {
  const forged = mutableClone();
  (
    forged.connectedWays as unknown as unknown[] & { extra?: boolean }
  ).extra = true;
  assert.throws(
    () =>
      assertInteriorFernCanyonBridgeFarEndpointTopologyIntegrity([forged]),
    /connected way collection cannot contain extra own properties/,
  );
});

test("Planner 64 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "stairs", {
    configurable: true,
    enumerable: false,
    value: true,
  });
  assert.throws(
    () =>
      assertInteriorFernCanyonBridgeFarEndpointTopologyIntegrity([
        forged as unknown as InteriorFernCanyonBridgeFarEndpointTopologyAuthority,
      ]),
    /cannot contain unknown field stairs|cannot materialize route field stairs/,
  );
});

test("Planner 64 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY[0];
  const assessment = assessInteriorFernCanyonBridgeFarEndpointTopology();
  assert.equal(
    Object.isFrozen(INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY),
    true,
  );
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.endpointCoordinate), true);
  assert.equal(Object.isFrozen(authority.connectedWays), true);
  assert.equal(Object.isFrozen(authority.connectedWays[1].orderedNodeIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
