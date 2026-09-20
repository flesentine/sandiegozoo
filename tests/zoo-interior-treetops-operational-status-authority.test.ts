import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_OPERATIONAL_STATUS_POLICY,
} from "../src/data/zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY,
} from "../src/data/zooInteriorTreetopsAccessibilityAuthority.ts";
import {
  INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY,
  assessInteriorTreetopsOperationalStatus,
  interiorTreetopsOperationalStatusForObjective,
} from "../src/data/zooInteriorTreetopsOperationalStatusAuthority.ts";

test("Planner 51 reuses the shared conservative operational policy", () => {
  const policy = INTERIOR_OPERATIONAL_STATUS_POLICY;

  assert.equal(policy.scope, "objective-selected-exact-interior-segments");
  assert.equal(policy.plannerStatus, "conditional");
  assert.deepEqual(policy.runtimeRequirements, [
    "VISIT_WITHIN_CURRENT_ZOO_HOURS",
    "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
  ]);
  assert.equal(
    policy.ingressClosureAdvisementApplicability,
    "not-interior-segment-authority",
  );
});

test("Planner 51 remains attached to Planner 50 exact segment", () => {
  const operational = INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0];
  const accessibility = INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0];

  assert.equal(
    operational.accessibilityAuthorityId,
    accessibility.id,
  );
  assert.equal(
    operational.objectiveSourceRecordId,
    accessibility.objectiveSourceRecordId,
  );
  assert.equal(operational.sourceWayId, accessibility.sourceWayId);
  assert.equal(
    operational.sourceWayVersion,
    accessibility.sourceWayVersion,
  );
  assert.equal(
    operational.sourceFromNodeId,
    accessibility.sourceFromNodeId,
  );
  assert.equal(
    operational.sourceToNodeId,
    accessibility.sourceToNodeId,
  );
});

test("Planner 51 marks the exact Treetops segment conditional", () => {
  const operational = INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0];

  assert.equal(operational.status, "conditional");
  assert.equal(operational.activation, "runtime-check-required");
  assert.deepEqual(operational.runtimeRequirements, [
    "VISIT_WITHIN_CURRENT_ZOO_HOURS",
    "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
  ]);
  assert.equal(
    operational.ingressClosureAdvisementApplicability,
    "not-interior-segment-authority",
  );
  assert.equal(
    operational.stairsAuthorityState,
    "independent-unresolved",
  );
  assert.equal(
    operational.strollerAuthorityState,
    "facility-permission-not-route-suitability",
  );
});

test("Planner 51 clears operational status only", () => {
  assert.deepEqual(
    assessInteriorTreetopsOperationalStatus("sdz-tiger-trail"),
    {
      status: "operational-status-ready",
      authorityId:
        "sdz-interior-treetops-anchor-to-fern-canyon-operational-status",
      objectiveSourceRecordId: "sdz-tiger-trail",
      sourceWayId: "148910139",
      sourceWayVersion: 7,
      sourceFromNodeId: "1619736626",
      sourceToNodeId: "13588159626",
      routeStatus: "conditional",
      activation: "runtime-check-required",
      runtimeRequirements: [
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
        "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
      ],
      ingressClosureAdvisementApplicability:
        "not-interior-segment-authority",
      stairsAuthorityState: "independent-unresolved",
      strollerAuthorityState:
        "facility-permission-not-route-suitability",
      routeGraphExpansion: {
        status: "blocked",
        reasons: [
          "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
          "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
        ],
      },
    },
  );
});

test("Planner 51 does not leak status to other objectives", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(
      interiorTreetopsOperationalStatusForObjective(objective),
      undefined,
    );
    assert.deepEqual(
      assessInteriorTreetopsOperationalStatus(objective),
      {
        status: "blocked",
        reason: "OBJECTIVE_TREETOPS_OPERATIONAL_STATUS_NOT_SOURCED",
        objectiveSourceRecordId: objective,
      },
    );
  }
});

test("Planner 51 authority owns no downstream route semantics", () => {
  const authority =
    INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0] as unknown as Record<
      string,
      unknown
    >;

  for (const field of [
    "mode",
    "distanceMeters",
    "durationMinutes",
    "oneWay",
    "direction",
    "difficulty",
    "accessible",
    "stairs",
    "stroller",
    "provenance",
    "routeNodeId",
    "routeEdgeId",
  ]) {
    assert.equal(Object.hasOwn(authority, field), false);
  }
});

test("Planner 51 exports and assessments are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0]),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0].runtimeRequirements,
    ),
    true,
  );

  const assessment =
    assessInteriorTreetopsOperationalStatus("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "operational-status-ready") {
    assert.equal(Object.isFrozen(assessment.runtimeRequirements), true);
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(
      Object.isFrozen(assessment.routeGraphExpansion.reasons),
      true,
    );
  }
});
