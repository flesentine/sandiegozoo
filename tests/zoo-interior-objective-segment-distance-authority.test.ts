import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY,
  assessInteriorObjectiveSegmentDistance,
  assertInteriorObjectiveSegmentDistanceAuthorityIntegrity,
  deriveInteriorObjectiveSegmentDistanceMeters,
  objectiveSegmentDistanceFor,
  type InteriorObjectiveSegmentDistanceAuthority,
} from "../src/data/zooInteriorObjectiveSegmentDistanceAuthority.ts";
import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "../src/data/zooInteriorFrontStreetGeometryAuthority.ts";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
} from "../src/data/zooInteriorObjectiveBranchSelectionAuthority.ts";

function mutableClone() {
  const source = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0];
  return {
    ...source,
    sourceNodeIds: [...source.sourceNodeIds],
  } as unknown as InteriorObjectiveSegmentDistanceAuthority;
}

test("Planner 28 derives the exact objective-selected Front Street distance", () => {
  const authority = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0];

  assert.equal(INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY.length, 1);
  assert.equal(authority.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(authority.sourceFromNodeId, "7053320515");
  assert.equal(authority.sourceToNodeId, "1619736626");
  assert.deepEqual(authority.sourceNodeIds, ["7053320515", "1619736626"]);
  assert.equal(authority.distanceMeters, 7.157);
  assert.equal(authority.derivationMethod, "haversine-segment-sum");
  assert.equal(authority.earthRadiusMeters, 6_371_000);
  assert.equal(authority.roundingDecimals, 3);
  assert.equal(authority.accuracyClaim, "no-survey-accuracy-claim");
});

test("Planner 28 distance is reproducible from Planner 26 version-pinned coordinates", () => {
  const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const to = geometry.adjacentJunctionCandidates.find(
    (candidate) => candidate.node.sourceObjectId === "1619736626",
  );
  assert.ok(to);

  assert.equal(
    deriveInteriorObjectiveSegmentDistanceMeters(
      geometry.connectionNode,
      to.node,
    ),
    7.157,
  );
});

test("Planner 28 is bound to the exact Planner 27 Tiger Trail branch decision", () => {
  const distance = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0];
  const selection = INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0];

  assert.equal(distance.branchSelectionAuthorityId, selection.id);
  assert.equal(distance.objectiveSourceRecordId, selection.objectiveSourceRecordId);
  assert.equal(distance.sourceFromNodeId, selection.geometryConnectionNodeId);
  assert.equal(distance.sourceToNodeId, selection.selectedCandidateNodeId);
  assert.equal(distance.selectionScope, "objective-only");
  assert.equal(selection.globalEndpointSelection, "unresolved");
});

test("Planner 28 preserves exact source-way and node-version provenance", () => {
  const authority = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0];

  assert.deepEqual(
    [
      authority.sourceWayId,
      authority.sourceWayVersion,
      authority.sourceWayVersionUrl,
      authority.sourceFromNodeVersion,
      authority.sourceFromNodeVersionUrl,
      authority.sourceFromNodeTimestamp,
      authority.sourceFromNodeChangeset,
      authority.sourceToNodeVersion,
      authority.sourceToNodeVersionUrl,
      authority.sourceToNodeTimestamp,
      authority.sourceToNodeChangeset,
    ],
    [
      "1481425058",
      1,
      "https://api.openstreetmap.org/api/0.6/way/1481425058/1",
      1,
      "https://api.openstreetmap.org/api/0.6/node/7053320515/1",
      "2019-12-13T00:23:10Z",
      78341336,
      2,
      "https://api.openstreetmap.org/api/0.6/node/1619736626/2",
      "2013-12-23T19:47:46Z",
      19606502,
    ],
  );
});

test("Planner 28 clears distance only and keeps every other exact segment semantic blocked", () => {
  assert.deepEqual(assessInteriorObjectiveSegmentDistance("sdz-tiger-trail"), {
    status: "distance-ready",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceFromNodeId: "7053320515",
    sourceToNodeId: "1619736626",
    distanceMeters: 7.157,
    derivationMethod: "haversine-segment-sum",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_MODE_NOT_SOURCED",
        "EXACT_SEGMENT_DURATION_NOT_SOURCED",
        "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        "EXACT_SEGMENT_PEDESTRIAN_DIRECTION_NOT_SOURCED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("other objectives cannot inherit the Tiger Trail segment distance", () => {
  for (const objectiveSourceRecordId of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(objectiveSegmentDistanceFor(objectiveSourceRecordId), undefined);
    assert.deepEqual(assessInteriorObjectiveSegmentDistance(objectiveSourceRecordId), {
      status: "blocked",
      reason: "OBJECTIVE_SEGMENT_DISTANCE_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }
});

test("Planner 28 rejects distance or endpoint drift", () => {
  const distanceDrift = mutableClone();
  (distanceDrift as { distanceMeters: number }).distanceMeters = 7.158;
  assert.throws(
    () => assertInteriorObjectiveSegmentDistanceAuthorityIntegrity([distanceDrift]),
    /distance drifted from the frozen geodesic derivation/,
  );

  const endpointDrift = mutableClone();
  (endpointDrift as { sourceToNodeId: string }).sourceToNodeId = "6239154982";
  assert.throws(
    () => assertInteriorObjectiveSegmentDistanceAuthorityIntegrity([endpointDrift]),
    /drifted from the frozen objective-segment contract|detached from Planner 27/,
  );
});

test("Planner 28 rejects source version provenance drift", () => {
  const forged = mutableClone();
  (forged as { sourceToNodeVersion: number }).sourceToNodeVersion = 3;
  (forged as { sourceToNodeVersionUrl: string }).sourceToNodeVersionUrl =
    "https://api.openstreetmap.org/api/0.6/node/1619736626/3";

  assert.throws(
    () => assertInteriorObjectiveSegmentDistanceAuthorityIntegrity([forged]),
    /distance provenance drifted from version-pinned Planner 26 geometry/,
  );
});

test("Planner 28 distance derivation rejects malformed coordinates", () => {
  assert.throws(
    () => deriveInteriorObjectiveSegmentDistanceMeters(
      { lat: Number.NaN, lng: -117.1496117 },
      { lat: 32.735201, lng: -117.1496375 },
    ),
    /requires valid finite coordinates/,
  );
  assert.throws(
    () => deriveInteriorObjectiveSegmentDistanceMeters(
      { lat: 91, lng: 0 },
      { lat: 0, lng: 0 },
    ),
    /requires valid finite coordinates/,
  );
});

test("Planner 28 runtime boundary rejects hidden aliases and RouteEdge materialization", () => {
  const hidden = mutableClone() as InteriorObjectiveSegmentDistanceAuthority & {
    durationMinutes?: number;
  };
  Object.defineProperty(hidden, "durationMinutes", {
    value: 0.1,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorObjectiveSegmentDistanceAuthorityIntegrity([hidden]),
    /cannot contain unknown field durationMinutes|cannot materialize routing field durationMinutes/,
  );

  const routeField = {
    ...mutableClone(),
    fromNodeId: "some-route-node",
  } as unknown as InteriorObjectiveSegmentDistanceAuthority;
  assert.throws(
    () => assertInteriorObjectiveSegmentDistanceAuthorityIntegrity([routeField]),
    /cannot contain unknown field fromNodeId|cannot materialize routing field fromNodeId/,
  );
});

test("Planner 28 validates its outer authority and source-node arrays exactly", () => {
  const decorated = [mutableClone()] as unknown as InteriorObjectiveSegmentDistanceAuthority[] & {
    durationMinutes?: number;
  };
  Object.defineProperty(decorated, "durationMinutes", {
    value: 1,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorObjectiveSegmentDistanceAuthorityIntegrity(decorated),
    /distance authority collection cannot contain extra own properties/,
  );

  const reordered = mutableClone();
  (reordered.sourceNodeIds as unknown as string[]).reverse();
  assert.throws(
    () => assertInteriorObjectiveSegmentDistanceAuthorityIntegrity([reordered]),
    /drifted from the frozen objective-segment contract/,
  );

  const aliased = mutableClone();
  Object.defineProperty(
    aliased.sourceNodeIds as unknown as object,
    Symbol("duration"),
    { value: 1 },
  );
  assert.throws(
    () => assertInteriorObjectiveSegmentDistanceAuthorityIntegrity([aliased]),
    /source-node sequence cannot contain extra own properties/,
  );
});

test("Planner 28 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0];
  assert.equal(Object.isFrozen(INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.sourceNodeIds), true);

  const assessment = assessInteriorObjectiveSegmentDistance("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "distance-ready") {
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization), true);
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization.reasons), true);
  }
});
