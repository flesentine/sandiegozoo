import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY,
  assessInteriorFernCanyonNextStepsFarEndpointTopology,
  assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity,
  type InteriorFernCanyonNextStepsFarEndpointTopologyAuthority,
} from "../src/data/zooInteriorFernCanyonNextStepsFarEndpointTopology.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  return {
    ...authority,
    endpointCoordinate: { ...authority.endpointCoordinate },
    connectedWays: authority.connectedWays.map((way) => ({
      ...way,
      orderedNodeIds: [...way.orderedNodeIds],
    })),
  } as unknown as InteriorFernCanyonNextStepsFarEndpointTopologyAuthority;
}

test("Planner 66 freezes the exact far endpoint from Planner 65 geometry", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.endpointNodeId, "13588159634");
  assert.equal(authority.endpointCoordinate.lat, 32.7357982);
  assert.equal(authority.endpointCoordinate.lng, -117.150403);
});

test("Planner 66 proves exactly two historical ways at the steps far endpoint", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.connectedWays.length, 2);
  assert.equal(authority.connectedWays[0].sourceWayId, "1481578624");
  assert.equal(authority.connectedWays[1].sourceWayId, "1481578625");
});

test("Planner 66 selects the unique onward unnamed footway without inventing a name", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  const continuation = authority.connectedWays[1];
  assert.equal(authority.selectedContinuationWayId, "1481578625");
  assert.equal(authority.selectedContinuationHighway, "footway");
  assert.equal(authority.selectedContinuationNameStatus, "absent");
  assert.equal(continuation.sourceHighway, "footway");
  assert.equal(Object.hasOwn(continuation, "sourceName"), false);
  assert.deepEqual(continuation.orderedNodeIds, [
    "13588159634",
    "1619736694",
  ]);
});

test("Planner 66 keeps unnamed-footway geometry fail-closed until the new node coordinate is captured", () => {
  assert.deepEqual(assessInteriorFernCanyonNextStepsFarEndpointTopology(), {
    status: "endpoint-topology-sourced",
    authorityId: "sdz-interior-fern-canyon-next-steps-far-endpoint-topology",
    objectiveSourceRecordId: "sdz-tiger-trail",
    endpointNodeId: "13588159634",
    historicalConnectedWayCount: 2,
    selectedContinuationWayId: "1481578625",
    selectedContinuationHighway: "footway",
    selectedContinuationNameStatus: "absent",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "VERSION_PINNED_UNNAMED_FOOTWAY_NODE_COORDINATE_NOT_CAPTURED",
        "EXACT_UNNAMED_FOOTWAY_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("Planner 66 does not materialize route semantics", () => {
  const authority =
    INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0] as unknown as Record<
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

test("Planner 66 rejects endpoint coordinate drift", () => {
  const forged = mutableClone();
  (forged.endpointCoordinate as unknown as { lng: number }).lng = 0;
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
    /far-end topology drifted/,
  );
});

test("Planner 66 rejects invented continuation names", () => {
  const forged = mutableClone();
  (
    forged.connectedWays[1] as unknown as { sourceName?: string }
  ).sourceName = "Fern Canyon Trail";
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
    /continuation connection cannot contain unknown field sourceName|continuation connection drifted/,
  );
});

test("Planner 66 rejects decorated connected-way arrays", () => {
  const forged = mutableClone();
  (
    forged.connectedWays as unknown as unknown[] & { extra?: boolean }
  ).extra = true;
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
    /connected way collection cannot contain extra own properties/,
  );
});

test("Planner 66 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "distanceMeters", {
    configurable: true,
    enumerable: false,
    value: 1,
  });
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([
        forged as unknown as InteriorFernCanyonNextStepsFarEndpointTopologyAuthority,
      ]),
    /cannot contain unknown field distanceMeters|cannot materialize route field distanceMeters/,
  );
});

test("Planner 66 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  const assessment = assessInteriorFernCanyonNextStepsFarEndpointTopology();
  assert.equal(
    Object.isFrozen(INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY),
    true,
  );
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.endpointCoordinate), true);
  assert.equal(Object.isFrozen(authority.connectedWays), true);
  assert.equal(Object.isFrozen(authority.connectedWays[1].orderedNodeIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
