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
  const assessment = assessInteriorUnnamedFootwayBranchAccess();
  assert.equal(assessment.status, "objective-branch-access-selected");
  assert.equal(assessment.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(assessment.junctionNodeId, "1619736694");
  assert.equal(assessment.rejectedCandidateWayId, "148910140");
  assert.equal(assessment.selectedContinuationWayId, "1481578626");
  assert.equal(assessment.selectedContinuationToNodeId, "48920902");
  assert.equal(assessment.selectionScope, "objective-only");
  assert.equal(assessment.globalBranchSelection, "unresolved");
  assert.equal(assessment.nextGeometryCapture.status, "ready");
  assert.equal(assessment.nextGeometryCapture.sourceWayId, "1481578626");
  assert.equal(assessment.nextGeometryCapture.fromNodeId, "1619736694");
  assert.equal(assessment.nextGeometryCapture.toNodeId, "48920902");
  assert.equal(assessment.routeEdgeMaterialization.status, "blocked");
  assert.deepEqual(
    Array.from(assessment.routeEdgeMaterialization.reasons),
    [
      "SELECTED_SEGMENT_NODE_COORDINATES_NOT_CAPTURED",
      "SELECTED_SEGMENT_DISTANCE_NOT_SOURCED",
      "SELECTED_SEGMENT_DURATION_NOT_SOURCED",
      "SELECTED_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
      "SELECTED_SEGMENT_STROLLER_NOT_SOURCED",
      "SELECTED_SEGMENT_DIRECTION_NOT_SOURCED",
    ],
  );
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


test("Planner 69 rejects accessor-backed authority array elements", () => {
  const canonical = cloneAuthority();
  const forged = {
    ...canonical,
    selectedContinuationWayId: "148910140",
  } as unknown as InteriorUnnamedFootwayBranchAccessAuthority;
  const accessor = [] as unknown as InteriorUnnamedFootwayBranchAccessAuthority[];
  let reads = 0;
  Object.defineProperty(accessor, "0", {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return reads === 1 ? canonical : forged;
    },
  });
  Object.defineProperty(accessor, "length", {
    value: 1,
    writable: true,
    enumerable: false,
    configurable: false,
  });

  assert.throws(
    () => assertInteriorUnnamedFootwayBranchAccessAuthorityIntegrity(accessor),
    /requires enumerable own data element 0/,
  );
});


test("Planner 69 exported records are isolated from Object.prototype pollution", () => {
  Object.defineProperty(Object.prototype, "routeNodeId", {
    value: "forged-route-node",
    configurable: true,
    enumerable: true,
  });
  Object.defineProperty(Object.prototype, "distanceMeters", {
    value: 999,
    configurable: true,
    enumerable: true,
  });

  try {
    const authority = INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY[0];
    const assessment = assessInteriorUnnamedFootwayBranchAccess();

    assert.equal(Object.getPrototypeOf(authority), null);
    assert.equal(Object.getPrototypeOf(assessment), null);
    assert.equal(Object.getPrototypeOf(assessment.nextGeometryCapture), null);
    assert.equal(Object.getPrototypeOf(assessment.routeEdgeMaterialization), null);
    assert.equal("routeNodeId" in authority, false);
    assert.equal("distanceMeters" in authority, false);
    assert.equal("routeNodeId" in assessment, false);
    assert.equal("distanceMeters" in assessment.routeEdgeMaterialization, false);
  } finally {
    delete (Object.prototype as { routeNodeId?: string }).routeNodeId;
    delete (Object.prototype as { distanceMeters?: number }).distanceMeters;
  }
});
