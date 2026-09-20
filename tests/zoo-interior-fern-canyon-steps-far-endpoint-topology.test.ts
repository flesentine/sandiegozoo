import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY,
  assessInteriorFernCanyonStepsFarEndpointTopology,
  assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity,
  type InteriorFernCanyonStepsFarEndpointTopologyAuthority,
} from "../src/data/zooInteriorFernCanyonStepsFarEndpointTopology.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  return {
    ...authority,
    endpointCoordinate: { ...authority.endpointCoordinate },
    connectedWays: authority.connectedWays.map((way) => ({
      ...way,
      orderedNodeIds: [...way.orderedNodeIds],
    })),
  } as unknown as InteriorFernCanyonStepsFarEndpointTopologyAuthority;
}

test("Planner 62 freezes the exact far endpoint from Planner 61 geometry", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.endpointNodeId, "13588159627");
  assert.equal(authority.endpointCoordinate.lat, 32.7357192);
  assert.equal(authority.endpointCoordinate.lng, -117.1500664);
});

test("Planner 62 proves exactly two historical ways at the far endpoint", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.connectedWays.length, 2);
  assert.equal(authority.connectedWays[0].sourceWayId, "1481578622");
  assert.equal(authority.connectedWays[1].sourceWayId, "1481578623");
});

test("Planner 62 selects the unique onward Fern Canyon bridge footway", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  const continuation = authority.connectedWays[1];

  assert.equal(authority.selectedContinuationWayId, "1481578623");
  assert.equal(authority.selectedContinuationHighway, "footway");
  assert.equal(continuation.sourceHighway, "footway");
  assert.equal(continuation.sourceBridge, "yes");
  assert.equal(continuation.sourceLayer, "1");
  assert.equal(continuation.sourceName, "Fern Canyon Trail");
  assert.deepEqual(continuation.orderedNodeIds, [
    "13588159627",
    "13588159632",
    "13588159633",
  ]);
});

test("Planner 62 keeps continuation geometry fail-closed until node coordinates are captured", () => {
  assert.deepEqual(assessInteriorFernCanyonStepsFarEndpointTopology(), {
    status: "endpoint-topology-sourced",
    authorityId: "sdz-interior-fern-canyon-steps-far-endpoint-topology",
    objectiveSourceRecordId: "sdz-tiger-trail",
    endpointNodeId: "13588159627",
    historicalConnectedWayCount: 2,
    selectedContinuationWayId: "1481578623",
    selectedContinuationHighway: "footway",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "VERSION_PINNED_FERN_CANYON_FOOTWAY_NODE_COORDINATES_NOT_CAPTURED",
        "EXACT_FERN_CANYON_FOOTWAY_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("Planner 62 does not materialize route semantics", () => {
  const authority =
    INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0] as unknown as Record<
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

test("Planner 62 rejects endpoint coordinate drift", () => {
  const forged = mutableClone();
  (forged.endpointCoordinate as unknown as { lat: number }).lat = 0;
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([forged]),
    /far-end topology drifted/,
  );
});

test("Planner 62 rejects continuation identity drift", () => {
  const forged = mutableClone();
  (
    forged.connectedWays[1] as unknown as { sourceWayId: string }
  ).sourceWayId = "1481579999";
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([forged]),
    /continuation connection drifted/,
  );
});

test("Planner 62 rejects decorated connected-way arrays", () => {
  const forged = mutableClone();
  (
    forged.connectedWays as unknown as unknown[] & { extra?: boolean }
  ).extra = true;
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([forged]),
    /connected way collection cannot contain extra own properties/,
  );
});

test("Planner 62 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "distanceMeters", {
    configurable: true,
    enumerable: false,
    value: 1,
  });
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([
        forged as unknown as InteriorFernCanyonStepsFarEndpointTopologyAuthority,
      ]),
    /cannot contain unknown field distanceMeters|cannot materialize route field distanceMeters/,
  );
});

test("Planner 62 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  const assessment = assessInteriorFernCanyonStepsFarEndpointTopology();
  assert.equal(
    Object.isFrozen(INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY),
    true,
  );
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.endpointCoordinate), true);
  assert.equal(Object.isFrozen(authority.connectedWays), true);
  assert.equal(Object.isFrozen(authority.connectedWays[1].orderedNodeIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
