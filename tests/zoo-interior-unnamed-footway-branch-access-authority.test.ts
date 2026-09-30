import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY,
  assessInteriorUnnamedFootwayBranchAccess,
  assertInteriorUnnamedFootwayBranchAccessAuthorityIntegrity,
  type InteriorUnnamedFootwayBranchAccessAuthority,
} from "../src/data/zooInteriorUnnamedFootwayBranchAccessAuthority.ts";

function cloneAuthority(): InteriorUnnamedFootwayBranchAccessAuthority {
  return {
    ...INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY[0],
  };
}

test("Planner 69 excludes the explicit access=no candidate", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY[0];
  assert.equal(authority.rejectedCandidateWayId, "148910140");
  assert.equal(authority.rejectedCandidateAccess, "no");
  assert.equal(
    authority.rejectedCandidateReason,
    "PUBLIC_ACCESS_PROHIBITED_BY_EXPLICIT_ACCESS_NO",
  );
});

test("Planner 69 selects the remaining Tiger Trail objective branch", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY[0];
  assert.equal(authority.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(authority.junctionNodeId, "1619736694");
  assert.equal(authority.selectedContinuationWayId, "1481578626");
  assert.equal(authority.selectedContinuationToNodeId, "48920902");
  assert.equal(authority.selectedContinuationHighway, "footway");
  assert.equal(authority.selectedContinuationNameStatus, "absent");
  assert.equal(
    authority.selectedContinuationAccessStatus,
    "no-explicit-access-restriction-captured",
  );
  assert.equal(authority.selectedContinuationFee, "yes");
  assert.equal(authority.selectedContinuationLayer, "-1");
  assert.equal(authority.selectionScope, "objective-only");
  assert.equal(authority.globalBranchSelection, "unresolved");
});

test("Planner 69 opens only the next geometry capture", () => {
  assert.deepEqual(assessInteriorUnnamedFootwayBranchAccess(), {
    status: "objective-branch-access-selected",
    objectiveSourceRecordId: "sdz-tiger-trail",
    junctionNodeId: "1619736694",
    rejectedCandidateWayId: "148910140",
    selectedContinuationWayId: "1481578626",
    selectedContinuationToNodeId: "48920902",
    selectionScope: "objective-only",
    globalBranchSelection: "unresolved",
    nextGeometryCapture: {
      status: "ready",
      sourceWayId: "1481578626",
      fromNodeId: "1619736694",
      toNodeId: "48920902",
    },
    routeEdgeMaterialization: {
      status: "blocked",
      reasons: [
        "SELECTED_SEGMENT_NODE_COORDINATES_NOT_CAPTURED",
        "SELECTED_SEGMENT_DISTANCE_NOT_SOURCED",
        "SELECTED_SEGMENT_DURATION_NOT_SOURCED",
        "SELECTED_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
        "SELECTED_SEGMENT_STROLLER_NOT_SOURCED",
        "SELECTED_SEGMENT_DIRECTION_NOT_SOURCED",
      ],
    },
  });
});

test("Planner 69 rejects branch drift", () => {
  const wrong = cloneAuthority();
  (wrong as { selectedContinuationWayId: string }).selectedContinuationWayId =
    "148910140";
  assert.throws(
    () => assertInteriorUnnamedFootwayBranchAccessAuthorityIntegrity([wrong]),
    /branch-access decision drifted/,
  );
});

test("Planner 69 rejects smuggled route semantics", () => {
  const wrong = {
    ...cloneAuthority(),
    distanceMeters: 12,
  } as unknown as InteriorUnnamedFootwayBranchAccessAuthority;
  assert.throws(
    () => assertInteriorUnnamedFootwayBranchAccessAuthorityIntegrity([wrong]),
    /unknown field distanceMeters|cannot materialize route field distanceMeters/,
  );
});

test("Planner 69 rejects decorated authority arrays", () => {
  const decorated = [cloneAuthority()] as unknown as
    InteriorUnnamedFootwayBranchAccessAuthority[] & { extra?: string };
  Object.defineProperty(decorated, "extra", {
    value: "forged",
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorUnnamedFootwayBranchAccessAuthorityIntegrity(decorated),
    /cannot contain extra own properties/,
  );
});

test("Planner 69 rejects Proxy-backed authority graphs", () => {
  const proxy = new Proxy(cloneAuthority(), {});
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayBranchAccessAuthorityIntegrity(
        [proxy] as unknown as InteriorUnnamedFootwayBranchAccessAuthority[],
      ),
    /Proxy-backed|uncloneable/,
  );
});

test("Planner 69 authority and assessment are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY[0]),
    true,
  );
  const assessment = assessInteriorUnnamedFootwayBranchAccess();
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.nextGeometryCapture), true);
  assert.equal(Object.isFrozen(assessment.routeEdgeMaterialization), true);
  assert.equal(Object.isFrozen(assessment.routeEdgeMaterialization.reasons), true);
});
