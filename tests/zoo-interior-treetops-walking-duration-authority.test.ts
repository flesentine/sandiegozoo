import assert from "node:assert/strict";
import test from "node:test";
import {
  INGRESS_WALKING_DURATION_POLICY,
  deriveWalkingDurationMinutes,
} from "../src/data/zooIngressWalkingDurationPolicy.ts";
import { INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY } from "../src/data/zooInteriorTreetopsPedestrianModeAuthority.ts";
import { INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY } from "../src/data/zooInteriorTreetopsSegmentDistanceAuthority.ts";
import { INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY } from "../src/data/zooInteriorTreetopsPedestrianDirectionAuthority.ts";
import {
  INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY,
  assessInteriorTreetopsWalkingDuration,
  interiorTreetopsWalkingDurationForObjective,
} from "../src/data/zooInteriorTreetopsWalkingDurationAuthority.ts";

test("Planner 48 derives 0.675 minutes from the exact 48.615 m segment", () => {
  assert.equal(deriveWalkingDurationMinutes(48.615), 0.675);
  assert.equal(
    INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0].durationMinutes,
    0.675,
  );
});

test("Planner 48 reuses the unchanged shared free-flow walk policy", () => {
  const policy = INGRESS_WALKING_DURATION_POLICY;
  const duration = INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0];

  assert.equal(policy.id, "sdz-walking-duration-policy-v1");
  assert.equal(policy.scope, "free-flow-walk-edges");
  assert.equal(policy.speedMetersPerSecond, 1.2);
  assert.equal(policy.roundingDecimals, 3);
  assert.equal(policy.minimumDurationMinutes, null);
  assert.equal(duration.policyId, policy.id);
  assert.equal(duration.policyVersion, policy.policyVersion);
  assert.equal(duration.policyScope, policy.scope);
  assert.equal(duration.speedMetersPerSecond, policy.speedMetersPerSecond);
  assert.equal(duration.roundingDecimals, policy.roundingDecimals);
});

test("Planner 48 remains attached to distance, walk mode, and direction", () => {
  const duration = INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0];
  const distance = INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0];
  const mode = INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0];
  const direction = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY[0];

  assert.equal(duration.distanceAuthorityId, distance.id);
  assert.equal(duration.modeAuthorityId, mode.id);
  assert.equal(duration.directionAuthorityId, direction.id);

  for (const upstream of [distance, mode, direction]) {
    assert.equal(upstream.objectiveSourceRecordId, duration.objectiveSourceRecordId);
    assert.equal(upstream.sourceWayId, duration.sourceWayId);
    assert.equal(upstream.sourceFromNodeId, duration.sourceFromNodeId);
    assert.equal(upstream.sourceToNodeId, duration.sourceToNodeId);
  }

  assert.equal(distance.distanceMeters, duration.distanceMeters);
  assert.equal(mode.mode, "walk");
  assert.equal(mode.operationalEligibility, "unresolved");
  assert.equal(direction.oneWay, false);
  assert.equal(direction.direction, "bidirectional");
});

test("Planner 48 duration is explicitly neutral free-flow only", () => {
  const duration = INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0];

  assert.equal(duration.durationScope, "neutral-free-flow");
  assert.equal(duration.operationalEligibility, "unresolved");
  assert.equal(duration.paceAdjustment, "none");
  assert.equal(duration.terrainAdjustment, "none");
  assert.equal(duration.queueAdjustment, "none");
  assert.equal(duration.accessControlDelayAdjustment, "none");
  assert.equal(duration.crowdAdjustment, "none");
});

test("Planner 48 clears duration only", () => {
  assert.deepEqual(assessInteriorTreetopsWalkingDuration("sdz-tiger-trail"), {
    status: "duration-ready",
    authorityId: "sdz-interior-treetops-anchor-to-fern-canyon-walking-duration",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "148910139",
    sourceWayVersion: 7,
    sourceFromNodeId: "1619736626",
    sourceToNodeId: "13588159626",
    distanceMeters: 48.615,
    durationMinutes: 0.675,
    durationScope: "neutral-free-flow",
    operationalEligibility: "unresolved",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_DIFFICULTY_NOT_QUALIFIED",
        "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
        "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 48 does not leak Treetops duration to other objectives", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(interiorTreetopsWalkingDurationForObjective(objective), undefined);
    assert.deepEqual(assessInteriorTreetopsWalkingDuration(objective), {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_WALKING_DURATION_NOT_SOURCED",
      objectiveSourceRecordId: objective,
    });
  }
});

test("Planner 48 authority owns no downstream route semantics", () => {
  const authority =
    INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0] as unknown as Record<string, unknown>;

  for (const field of [
    "mode",
    "oneWay",
    "direction",
    "difficulty",
    "stairs",
    "accessible",
    "stroller",
    "status",
    "routeNodeId",
    "routeEdgeId",
  ]) {
    assert.equal(Object.hasOwn(authority, field), false);
  }
});

test("Planner 48 exports and assessments are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY), true);
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0]),
    true,
  );

  const assessment = assessInteriorTreetopsWalkingDuration("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "duration-ready") {
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
  }
});
