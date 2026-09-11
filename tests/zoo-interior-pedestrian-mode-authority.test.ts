import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_PEDESTRIAN_MODE_AUTHORITY,
  INTERIOR_PEDESTRIAN_MODE_POLICY,
  assessInteriorPedestrianMode,
  assertInteriorPedestrianModeAuthorityIntegrity,
  assertInteriorPedestrianModePolicyIntegrity,
  interiorPedestrianModeForObjective,
  type InteriorPedestrianModeAuthority,
  type InteriorPedestrianModePolicy,
} from "../src/data/zooInteriorPedestrianModeAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY,
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "../src/data/zooInteriorPedestrianDirectionAuthority.ts";

function mutablePolicy() {
  return { ...INTERIOR_PEDESTRIAN_MODE_POLICY } as unknown as InteriorPedestrianModePolicy;
}

function mutableAuthority() {
  return { ...INTERIOR_PEDESTRIAN_MODE_AUTHORITY[0] } as unknown as InteriorPedestrianModeAuthority;
}

test("Planner 30 qualifies walk mode from the exact pedestrian source snapshot", () => {
  const source = INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
  const mode = INTERIOR_PEDESTRIAN_MODE_AUTHORITY[0];

  assert.equal(source.sourceTags.highway, "pedestrian");
  assert.equal(source.sourceTags.foot, "customers");
  assert.equal(mode.mode, "walk");
  assert.equal(mode.resolutionBasis, "osm-highway-pedestrian");
  assert.equal(mode.sourceHighwayTag, "pedestrian");
  assert.equal(mode.sourceFootTag, "customers");
});

test("Planner 30 keeps foot=customers separate from operational eligibility", () => {
  const mode = INTERIOR_PEDESTRIAN_MODE_AUTHORITY[0];
  assert.equal(mode.footAccessTagRole, "access-context-only");
  assert.equal(mode.operationalEligibility, "unresolved");
  assert.equal(
    INTERIOR_PEDESTRIAN_MODE_POLICY.footAccessTagRole,
    "access-context-not-mode-or-operational-eligibility",
  );
});

test("Planner 30 remains attached to the exact Planner 29 Tiger Trail segment", () => {
  const mode = INTERIOR_PEDESTRIAN_MODE_AUTHORITY[0];
  const direction = INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY[0];

  assert.equal(mode.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(mode.directionAuthorityId, direction.id);
  assert.equal(mode.sourceWayId, direction.sourceWayId);
  assert.equal(mode.sourceFromNodeId, direction.sourceFromNodeId);
  assert.equal(mode.sourceToNodeId, direction.sourceToNodeId);
  assert.equal(mode.selectionScope, "objective-only");
  assert.equal(mode.globalEndpointSelection, "unresolved");
});

test("Planner 30 clears mode only", () => {
  assert.deepEqual(assessInteriorPedestrianMode("sdz-tiger-trail"), {
    status: "mode-ready",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceFromNodeId: "7053320515",
    sourceToNodeId: "1619736626",
    mode: "walk",
    operationalEligibility: "unresolved",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_DURATION_NOT_SOURCED",
        "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("other objectives cannot inherit Tiger Trail walk mode", () => {
  for (const objective of ["sdz-koala-outback", "sdz-gorilla-tropics", "unknown-objective"]) {
    assert.equal(interiorPedestrianModeForObjective(objective), undefined);
    assert.deepEqual(assessInteriorPedestrianMode(objective), {
      status: "blocked",
      reason: "OBJECTIVE_PEDESTRIAN_MODE_NOT_SOURCED",
      objectiveSourceRecordId: objective,
      globalEndpointSelection: "unresolved",
    });
  }
});

test("Planner 30 policy rejects mode and access-role drift", () => {
  const mode = mutablePolicy() as unknown as { supportedMode: string };
  mode.supportedMode = "tram";
  assert.throws(
    () => assertInteriorPedestrianModePolicyIntegrity(mode as unknown as InteriorPedestrianModePolicy),
    /policy drifted/,
  );

  const access = mutablePolicy() as unknown as { footAccessTagRole: string };
  access.footAccessTagRole = "currently-eligible";
  assert.throws(
    () => assertInteriorPedestrianModePolicyIntegrity(access as unknown as InteriorPedestrianModePolicy),
    /policy drifted/,
  );
});

test("Planner 30 authority rejects endpoint and operational promotion", () => {
  const endpoint = mutableAuthority() as unknown as { sourceToNodeId: string };
  endpoint.sourceToNodeId = "6239154982";
  assert.throws(
    () => assertInteriorPedestrianModeAuthorityIntegrity([endpoint as unknown as InteriorPedestrianModeAuthority]),
    /mode authority drifted|detached from Planner 29/,
  );

  const operational = mutableAuthority() as unknown as { operationalEligibility: string };
  operational.operationalEligibility = "open";
  assert.throws(
    () => assertInteriorPedestrianModeAuthorityIntegrity([operational as unknown as InteriorPedestrianModeAuthority]),
    /mode authority drifted/,
  );
});

test("Planner 30 runtime boundary rejects unrelated RouteEdge semantics", () => {
  const forged = {
    ...mutableAuthority(),
    durationMinutes: 0.1,
  } as unknown as InteriorPedestrianModeAuthority;
  assert.throws(
    () => assertInteriorPedestrianModeAuthorityIntegrity([forged]),
    /cannot contain unknown field durationMinutes|cannot own field durationMinutes/,
  );
});

test("Planner 30 rejects hidden aliases and decorated authority arrays", () => {
  const hidden = mutablePolicy();
  Object.defineProperty(hidden, "status", { value: "open", enumerable: false });
  assert.throws(
    () => assertInteriorPedestrianModePolicyIntegrity(hidden),
    /cannot contain unknown field status/,
  );

  const decorated = [mutableAuthority()] as unknown as InteriorPedestrianModeAuthority[] & { status?: string };
  Object.defineProperty(decorated, "status", { value: "open", enumerable: false });
  assert.throws(
    () => assertInteriorPedestrianModeAuthorityIntegrity(decorated),
    /mode authority collection cannot contain extra own properties/,
  );
});

test("Planner 30 exports and assessments are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_MODE_POLICY), true);
  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_MODE_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_MODE_AUTHORITY[0]), true);

  const assessment = assessInteriorPedestrianMode("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "mode-ready") {
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization), true);
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization.reasons), true);
  }
});
