import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY,
  assessInteriorUnnamedFootwayBranchingTopology,
  assertInteriorUnnamedFootwayBranchingTopologyIntegrity,
  type InteriorUnnamedFootwayBranchingTopologyAuthority,
} from "../src/data/zooInteriorUnnamedFootwayBranchingTopology.ts";

function mutableClone(): InteriorUnnamedFootwayBranchingTopologyAuthority {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  return {
    ...authority,
    endpointCoordinate: { ...authority.endpointCoordinate },
    outboundCandidateWayIds: [
      authority.outboundCandidateWayIds[0],
      authority.outboundCandidateWayIds[1],
    ],
    connectedWays: [
      {
        ...authority.connectedWays[0],
        orderedNodeIds: [...authority.connectedWays[0].orderedNodeIds],
      },
      {
        ...authority.connectedWays[1],
        orderedNodeIds: [...authority.connectedWays[1].orderedNodeIds],
      },
      {
        ...authority.connectedWays[2],
        orderedNodeIds: [...authority.connectedWays[2].orderedNodeIds],
      },
    ],
  } as InteriorUnnamedFootwayBranchingTopologyAuthority;
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
    [
      authority.connectedWays[0].sourceWayId,
      authority.connectedWays[1].sourceWayId,
      authority.connectedWays[2].sourceWayId,
    ],
    ["1481578625", "148910140", "1481578626"],
  );
  assert.equal(authority.connectedWays[1].orderedNodeIds.length, 28);
});

test("Planner 68 preserves source access and fee evidence without choosing a branch", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  const inbound = authority.connectedWays[0];
  const accessNo = authority.connectedWays[1];
  const fee = authority.connectedWays[2];

  assert.equal("sourceName" in inbound, false);
  assert.equal("sourceAccess" in inbound, false);
  assert.equal(accessNo.sourceAccess, "no");
  assert.equal(accessNo.sourceFee, "yes");
  assert.equal(accessNo.sourceLayer, "-1");
  assert.equal("sourceName" in accessNo, false);
  assert.equal("sourceAccess" in fee, false);
  assert.equal(fee.sourceFee, "yes");
  assert.equal(fee.sourceLayer, "-1");
  assert.equal("sourceName" in fee, false);
  assert.equal(authority.branchSelectionStatus, "unresolved");
  assert.equal("selectedContinuationWayId" in authority, false);
});

test("Planner 68 keeps both outbound candidates and remains fail-closed", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  assert.deepEqual(
    [
      authority.outboundCandidateWayIds[0],
      authority.outboundCandidateWayIds[1],
    ],
    ["148910140", "1481578626"],
  );
  assert.equal(authority.outboundCandidateCount, 2);

  const assessment = assessInteriorUnnamedFootwayBranchingTopology();
  assert.deepEqual(
    {
      ...assessment,
      outboundCandidateWayIds: [
        assessment.outboundCandidateWayIds[0],
        assessment.outboundCandidateWayIds[1],
      ],
      routeGraphExpansion: {
        ...assessment.routeGraphExpansion,
        reasons: [
          assessment.routeGraphExpansion.reasons[0],
          assessment.routeGraphExpansion.reasons[1],
          assessment.routeGraphExpansion.reasons[2],
        ],
      },
    },
    {
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
    },
  );
});

test("Planner 68 rejects endpoint and candidate identity drift", () => {
  const endpointForged = mutableClone();
  (endpointForged.endpointCoordinate as { sourceVersion: number }).sourceVersion = 1;
  assert.throws(
    () => assertInteriorUnnamedFootwayBranchingTopologyIntegrity([endpointForged]),
    /branching topology drifted/,
  );

  const idsForged = mutableClone();
  (idsForged.outboundCandidateWayIds as unknown as string[])[1] = "forged";
  assert.throws(
    () => assertInteriorUnnamedFootwayBranchingTopologyIntegrity([idsForged]),
    /branching topology drifted/,
  );
});

test("Planner 68 rejects complete way-sequence drift, including the 28-node branch", () => {
  for (const [wayIndex, nodeIndex] of [
    [0, 0],
    [1, 0],
    [1, 13],
    [1, 27],
    [2, 1],
  ] as const) {
    const forged = mutableClone();
    (
      forged.connectedWays[wayIndex].orderedNodeIds as unknown as string[]
    )[nodeIndex] = "forged";
    assert.throws(
      () => assertInteriorUnnamedFootwayBranchingTopologyIntegrity([forged]),
      /node sequence drifted/,
    );
  }
});

test("Planner 68 rejects way provenance and source-tag drift", () => {
  const urlForged = mutableClone();
  (
    urlForged.connectedWays[1] as unknown as { sourceWayVersionUrl: string }
  ).sourceWayVersionUrl = "https://example.com/forged";
  assert.throws(
    () => assertInteriorUnnamedFootwayBranchingTopologyIntegrity([urlForged]),
    /access-no candidate drifted/,
  );

  const accessForged = mutableClone();
  delete (
    accessForged.connectedWays[1] as unknown as { sourceAccess?: string }
  ).sourceAccess;
  assert.throws(
    () => assertInteriorUnnamedFootwayBranchingTopologyIntegrity([accessForged]),
    /missing required field sourceAccess|access-no candidate drifted/,
  );

  const feeForged = mutableClone() as unknown as {
    connectedWays: Array<Record<string, unknown>>;
  };
  feeForged.connectedWays[2].sourceAccess = "no";
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayBranchingTopologyIntegrity([
        feeForged as unknown as InteriorUnnamedFootwayBranchingTopologyAuthority,
      ]),
    /fee candidate cannot contain unknown field sourceAccess|fee candidate drifted/,
  );
});

test("Planner 68 rejects premature route or branch-selection materialization", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  forged.selectedContinuationWayId = "1481578626";
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayBranchingTopologyIntegrity([
        forged as unknown as InteriorUnnamedFootwayBranchingTopologyAuthority,
      ]),
    /cannot contain unknown field selectedContinuationWayId|cannot materialize route field selectedContinuationWayId/,
  );
});

test("Planner 68 rejects decorated authority and candidate arrays", () => {
  const waysForged = mutableClone();
  (
    waysForged.connectedWays as unknown as unknown[] & { extra?: string }
  ).extra = "forged";
  assert.throws(
    () => assertInteriorUnnamedFootwayBranchingTopologyIntegrity([waysForged]),
    /connected way collection cannot contain extra own properties/,
  );

  const idsForged = mutableClone();
  (
    idsForged.outboundCandidateWayIds as unknown as unknown[] & { extra?: string }
  ).extra = "forged";
  assert.throws(
    () => assertInteriorUnnamedFootwayBranchingTopologyIntegrity([idsForged]),
    /outbound candidate collection cannot contain extra own properties/,
  );
});

test("Planner 68 rejects Proxy-backed direct and nested inputs", () => {
  const authority = new Proxy(mutableClone(), {});
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayBranchingTopologyIntegrity([
        authority as InteriorUnnamedFootwayBranchingTopologyAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nested = mutableClone() as unknown as {
    connectedWays: readonly unknown[];
  };
  nested.connectedWays = new Proxy([...nested.connectedWays], {});
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayBranchingTopologyIntegrity([
        nested as unknown as InteriorUnnamedFootwayBranchingTopologyAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );
});

test("Planner 68 rejects inherited names and access on fields whose absence is evidence", () => {
  Object.defineProperty(Object.prototype, "sourceName", {
    configurable: true,
    value: "Polluted Trail",
  });
  try {
    assert.throws(
      () => assertInteriorUnnamedFootwayBranchingTopologyIntegrity([mutableClone()]),
      /inbound connection drifted|access-no candidate drifted|fee candidate drifted/,
    );
  } finally {
    delete (Object.prototype as Record<string, unknown>).sourceName;
  }

  Object.defineProperty(Object.prototype, "sourceAccess", {
    configurable: true,
    value: "no",
  });
  try {
    assert.throws(
      () => assertInteriorUnnamedFootwayBranchingTopologyIntegrity([mutableClone()]),
      /inbound connection drifted|fee candidate drifted/,
    );
  } finally {
    delete (Object.prototype as Record<string, unknown>).sourceAccess;
  }
});

test("Planner 68 shape checks survive mutable collection-prototype pollution", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  forged.unexpected = "forged";

  const originalSome = Array.prototype.some;
  const originalFilter = Array.prototype.filter;
  const originalHas = Set.prototype.has;
  const originalIterator = Array.prototype[Symbol.iterator];
  Array.prototype.some = (() => false) as typeof Array.prototype.some;
  Array.prototype.filter = (() => []) as typeof Array.prototype.filter;
  Set.prototype.has = (() => true) as typeof Set.prototype.has;
  Array.prototype[Symbol.iterator] = function* () {};

  try {
    assert.throws(
      () =>
        assertInteriorUnnamedFootwayBranchingTopologyIntegrity([
          forged as unknown as InteriorUnnamedFootwayBranchingTopologyAuthority,
        ]),
      /authority cannot contain unknown field unexpected/,
    );
  } finally {
    Array.prototype.some = originalSome;
    Array.prototype.filter = originalFilter;
    Set.prototype.has = originalHas;
    Array.prototype[Symbol.iterator] = originalIterator;
  }
});

test("Planner 68 assessment records are isolated from Object.prototype pollution", () => {
  Object.defineProperty(Object.prototype, "routeNodeId", {
    configurable: true,
    value: "polluted",
  });
  Object.defineProperty(Object.prototype, "selectedContinuationWayId", {
    configurable: true,
    value: "polluted",
  });

  try {
    const assessment = assessInteriorUnnamedFootwayBranchingTopology();
    assert.equal(Object.getPrototypeOf(assessment), null);
    assert.equal(Object.getPrototypeOf(assessment.routeGraphExpansion), null);
    assert.equal("routeNodeId" in (assessment as unknown as object), false);
    assert.equal(
      "selectedContinuationWayId" in (assessment as unknown as object),
      false,
    );
  } finally {
    delete (Object.prototype as Record<string, unknown>).routeNodeId;
    delete (Object.prototype as Record<string, unknown>).selectedContinuationWayId;
  }
});

test("Planner 68 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  const assessment = assessInteriorUnnamedFootwayBranchingTopology();
  assert.equal(Object.isFrozen(INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.endpointCoordinate), true);
  assert.equal(Object.isFrozen(authority.connectedWays), true);
  assert.equal(Object.isFrozen(authority.connectedWays[1].orderedNodeIds), true);
  assert.equal(Object.isFrozen(authority.outboundCandidateWayIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
