import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY,
  assessInteriorUnnamedFootwayBranchingTopology,
  assertInteriorUnnamedFootwayBranchingTopologyIntegrity,
  type InteriorUnnamedFootwayBranchingTopologyAuthority,
} from "../src/data/zooInteriorUnnamedFootwayBranchingTopology.ts";

function mutableClone() {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  return {
    ...authority,
    endpointCoordinate: { ...authority.endpointCoordinate },
    outboundCandidateWayIds: [...authority.outboundCandidateWayIds],
    connectedWays: authority.connectedWays.map((way) => ({
      ...way,
      orderedNodeIds: [...way.orderedNodeIds],
    })),
  } as unknown as InteriorUnnamedFootwayBranchingTopologyAuthority;
}

test("Planner 68 freezes the exact version-2 branching endpoint", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  assert.equal(authority.endpointNodeId, "1619736694");
  assert.equal(authority.endpointCoordinate.sourceVersion, 2);
  assert.equal(authority.endpointCoordinate.lat, 32.7358299);
  assert.equal(authority.endpointCoordinate.lng, -117.150419);
});

test("Planner 68 preserves all three historical connected ways", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  assert.equal(authority.connectedWays.length, 3);
  assert.deepEqual(
    authority.connectedWays.map((way) => way.sourceWayId),
    ["1481578625", "148910140", "1481578626"],
  );
});

test("Planner 68 preserves access=no as source evidence without selecting around it", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  const accessNo = authority.connectedWays[1];
  assert.equal(accessNo.sourceAccess, "no");
  assert.equal(accessNo.sourceFee, "yes");
  assert.equal(accessNo.sourceLayer, "-1");
  assert.equal(authority.branchSelectionStatus, "unresolved");
});

test("Planner 68 preserves both non-inbound candidates and does not invent a selected continuation", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  assert.deepEqual(authority.outboundCandidateWayIds, [
    "148910140",
    "1481578626",
  ]);
  assert.equal(authority.outboundCandidateCount, 2);
  assert.equal(Object.hasOwn(authority, "selectedContinuationWayId"), false);
});

test("Planner 68 stays blocked until objective branch authority and access semantics are qualified", () => {
  assert.deepEqual(assessInteriorUnnamedFootwayBranchingTopology(), {
    status: "branching-topology-sourced",
    authorityId: "sdz-interior-unnamed-footway-branching-endpoint-topology",
    objectiveSourceRecordId: "sdz-tiger-trail",
    endpointNodeId: "1619736694",
    historicalConnectedWayCount: 3,
    outboundCandidateWayIds: ["148910140", "1481578626"],
    branchSelectionStatus: "unresolved",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "MULTIPLE_NON_INBOUND_LINEAR_HIGHWAY_CONNECTIONS",
        "OBJECTIVE_SCOPED_BRANCH_AUTHORITY_NOT_SOURCED",
        "OUTBOUND_ACCESS_SEMANTICS_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 68 rejects endpoint-version drift", () => {
  const forged = mutableClone();
  (
    forged.endpointCoordinate as unknown as { sourceVersion: number }
  ).sourceVersion = 1;
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayBranchingTopologyIntegrity([forged]),
    /branching topology drifted/,
  );
});

test("Planner 68 rejects dropping the access=no source tag", () => {
  const forged = mutableClone();
  delete (
    forged.connectedWays[1] as unknown as { sourceAccess?: string }
  ).sourceAccess;
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayBranchingTopologyIntegrity([forged]),
    /missing required field sourceAccess|access-no candidate drifted/,
  );
});

test("Planner 68 rejects premature selected-continuation fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  (forged as Record<string, unknown>).selectedContinuationWayId = "1481578626";
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayBranchingTopologyIntegrity([
        forged as unknown as InteriorUnnamedFootwayBranchingTopologyAuthority,
      ]),
    /cannot contain unknown field selectedContinuationWayId|cannot materialize route field selectedContinuationWayId/,
  );
});

test("Planner 68 rejects decorated candidate arrays", () => {
  const forged = mutableClone();
  (
    forged.outboundCandidateWayIds as unknown as string[] & { extra?: boolean }
  ).extra = true;
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayBranchingTopologyIntegrity([forged]),
    /outbound candidate collection cannot contain extra own properties/,
  );
});

test("Planner 68 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  const assessment = assessInteriorUnnamedFootwayBranchingTopology();
  assert.equal(Object.isFrozen(INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.endpointCoordinate), true);
  assert.equal(Object.isFrozen(authority.connectedWays), true);
  assert.equal(Object.isFrozen(authority.outboundCandidateWayIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
