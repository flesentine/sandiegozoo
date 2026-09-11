import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_WALKING_DURATION_AUTHORITY,
  assessInteriorWalkingDuration,
  assertInteriorWalkingDurationAuthorityIntegrity,
  interiorWalkingDurationForObjective,
  type InteriorWalkingDurationAuthority,
} from "../src/data/zooInteriorWalkingDurationAuthority.ts";
import {
  INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY,
} from "../src/data/zooInteriorObjectiveSegmentDistanceAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_MODE_AUTHORITY,
} from "../src/data/zooInteriorPedestrianModeAuthority.ts";
import {
  INGRESS_WALKING_DURATION_POLICY,
  deriveWalkingDurationMinutes,
} from "../src/data/zooIngressWalkingDurationPolicy.ts";

function mutableAuthority() {
  return { ...INTERIOR_WALKING_DURATION_AUTHORITY[0] } as unknown as InteriorWalkingDurationAuthority;
}

test("Planner 31 reuses the generic Planner 19 free-flow walking policy", () => {
  assert.equal(INGRESS_WALKING_DURATION_POLICY.scope, "free-flow-walk-edges");
  assert.equal(INGRESS_WALKING_DURATION_POLICY.speedMetersPerSecond, 1.2);
  assert.equal(INGRESS_WALKING_DURATION_POLICY.roundingDecimals, 3);
  assert.equal(INGRESS_WALKING_DURATION_POLICY.minimumDurationMinutes, null);
  assert.equal(INGRESS_WALKING_DURATION_POLICY.paceAdjustment, "none");
  assert.equal(INGRESS_WALKING_DURATION_POLICY.terrainAdjustment, "none");
  assert.equal(INGRESS_WALKING_DURATION_POLICY.queueAdjustment, "none");
  assert.equal(INGRESS_WALKING_DURATION_POLICY.accessControlDelayAdjustment, "none");
  assert.equal(INGRESS_WALKING_DURATION_POLICY.crowdAdjustment, "none");
});

test("Planner 31 derives 0.099 minutes from the exact 7.157 meter segment", () => {
  const duration = INTERIOR_WALKING_DURATION_AUTHORITY[0];
  assert.equal(duration.distanceMeters, 7.157);
  assert.equal(deriveWalkingDurationMinutes(7.157), 0.099);
  assert.equal(duration.durationMinutes, 0.099);
  assert.equal(duration.derivationMethod, "distance-over-fixed-walk-speed");
  assert.equal(duration.durationScope, "neutral-free-flow");
});

test("Planner 31 remains linked to exact Planner 28 distance and Planner 30 walk mode", () => {
  const duration = INTERIOR_WALKING_DURATION_AUTHORITY[0];
  const distance = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0];
  const mode = INTERIOR_PEDESTRIAN_MODE_AUTHORITY[0];

  assert.equal(duration.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(duration.distanceAuthorityId, distance.id);
  assert.equal(duration.modeAuthorityId, mode.id);
  assert.equal(duration.sourceWayId, distance.sourceWayId);
  assert.equal(duration.sourceFromNodeId, distance.sourceFromNodeId);
  assert.equal(duration.sourceToNodeId, distance.sourceToNodeId);
  assert.equal(mode.mode, "walk");
});

test("Planner 31 keeps every adjustment and operational eligibility independent", () => {
  const duration = INTERIOR_WALKING_DURATION_AUTHORITY[0];
  assert.equal(duration.minimumDurationMinutes, null);
  assert.equal(duration.paceAdjustment, "none");
  assert.equal(duration.terrainAdjustment, "none");
  assert.equal(duration.queueAdjustment, "none");
  assert.equal(duration.accessControlDelayAdjustment, "none");
  assert.equal(duration.crowdAdjustment, "none");
  assert.equal(duration.operationalEligibility, "unresolved");
});

test("Planner 31 clears duration only", () => {
  assert.deepEqual(assessInteriorWalkingDuration("sdz-tiger-trail"), {
    status: "duration-ready",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceFromNodeId: "7053320515",
    sourceToNodeId: "1619736626",
    distanceMeters: 7.157,
    durationMinutes: 0.099,
    durationScope: "neutral-free-flow",
    operationalEligibility: "unresolved",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [
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

test("other objectives cannot inherit Tiger Trail duration", () => {
  for (const objective of ["sdz-koala-outback", "sdz-gorilla-tropics", "unknown-objective"]) {
    assert.equal(interiorWalkingDurationForObjective(objective), undefined);
    assert.deepEqual(assessInteriorWalkingDuration(objective), {
      status: "blocked",
      reason: "OBJECTIVE_WALKING_DURATION_NOT_SOURCED",
      objectiveSourceRecordId: objective,
      globalEndpointSelection: "unresolved",
    });
  }
});

test("Planner 31 rejects duration, policy, and endpoint drift", () => {
  const duration = mutableAuthority() as unknown as { durationMinutes: number };
  duration.durationMinutes = 0.1;
  assert.throws(
    () => assertInteriorWalkingDurationAuthorityIntegrity([duration as unknown as InteriorWalkingDurationAuthority]),
    /walking duration authority drifted|does not reproduce/,
  );

  const policy = mutableAuthority() as unknown as { policyScope: string };
  policy.policyScope = "ingress-only";
  assert.throws(
    () => assertInteriorWalkingDurationAuthorityIntegrity([policy as unknown as InteriorWalkingDurationAuthority]),
    /walking duration authority drifted/,
  );

  const endpoint = mutableAuthority() as unknown as { sourceToNodeId: string };
  endpoint.sourceToNodeId = "6239154982";
  assert.throws(
    () => assertInteriorWalkingDurationAuthorityIntegrity([endpoint as unknown as InteriorWalkingDurationAuthority]),
    /walking duration authority drifted|detached from Planner 28/,
  );
});

test("Planner 31 rejects operational or unrelated RouteEdge semantic promotion", () => {
  const operational = mutableAuthority() as unknown as { operationalEligibility: string };
  operational.operationalEligibility = "open";
  assert.throws(
    () => assertInteriorWalkingDurationAuthorityIntegrity([operational as unknown as InteriorWalkingDurationAuthority]),
    /walking duration authority drifted/,
  );

  const forged = {
    ...mutableAuthority(),
    accessible: true,
  } as unknown as InteriorWalkingDurationAuthority;
  assert.throws(
    () => assertInteriorWalkingDurationAuthorityIntegrity([forged]),
    /cannot contain unknown field accessible|cannot own field accessible/,
  );
});

test("Planner 31 runtime boundary rejects hidden aliases and decorated arrays", () => {
  const hidden = mutableAuthority();
  Object.defineProperty(hidden, "status", { value: "open", enumerable: false });
  assert.throws(
    () => assertInteriorWalkingDurationAuthorityIntegrity([hidden]),
    /cannot contain unknown field status/,
  );

  const decorated = [mutableAuthority()] as unknown as InteriorWalkingDurationAuthority[] & { status?: string };
  Object.defineProperty(decorated, "status", { value: "open", enumerable: false });
  assert.throws(
    () => assertInteriorWalkingDurationAuthorityIntegrity(decorated),
    /duration authority collection cannot contain extra own properties/,
  );
});

test("Planner 31 authority and assessments are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_WALKING_DURATION_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_WALKING_DURATION_AUTHORITY[0]), true);

  const assessment = assessInteriorWalkingDuration("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "duration-ready") {
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization), true);
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization.reasons), true);
  }
});
