import assert from "node:assert/strict";
import test from "node:test";
import {
  INGRESS_STROLLER_FACILITY_POLICY,
} from "../src/data/zooIngressMobilityAuthority.ts";
import {
  INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE,
  INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY,
} from "../src/data/zooInteriorStrollerAuthority.ts";
import {
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY,
} from "../src/data/zooInteriorTreetopsAccessibilityAuthority.ts";
import {
  INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT,
} from "../src/data/zooInteriorTreetopsStairsAuthority.ts";
import {
  INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT,
  assessInteriorTreetopsStroller,
  interiorTreetopsStrollerAuditForObjective,
} from "../src/data/zooInteriorTreetopsStrollerAuthority.ts";

test("Planner 53 facility stroller permission is not exact-route suitability", () => {
  assert.equal(
    INGRESS_STROLLER_FACILITY_POLICY.strollerPolicy,
    "allowed",
  );
  assert.equal(
    INGRESS_STROLLER_FACILITY_POLICY.routeSuitabilityAuthority,
    "not-established",
  );
  assert.equal(
    INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.facilityPermission,
    "insufficient-for-exact-route-suitability",
  );
});

test("Planner 53 wheelchair accessibility and guide evidence remain non-authoritative for generic strollers", () => {
  assert.equal(
    INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.wheelchairAccessibility,
    "does-not-establish-generic-stroller-suitability",
  );
  assert.equal(
    INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE.evidenceScope,
    "accessibility-device-specific",
  );
  assert.equal(
    INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE
      .genericStrollerRouteSuitabilityAuthority,
    "not-established",
  );
});

test("Planner 53 remains attached to exact accessibility and unresolved stairs", () => {
  const audit = INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT[0];
  const accessibility = INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0];
  const stairs = INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT[0];

  assert.equal(audit.accessibilityAuthorityId, accessibility.id);
  assert.equal(audit.stairsEvidenceAuditId, stairs.id);
  assert.equal(accessibility.accessible, true);
  assert.equal(stairs.stairs, "unknown");
  assert.equal(stairs.blocker, "EXACT_SEGMENT_STAIRS_NOT_SOURCED");
});

test("Planner 53 does not infer stroller suitability", () => {
  const audit = INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT[0];

  assert.equal(audit.facilityStrollerPolicy, "allowed");
  assert.equal(
    audit.facilityRouteSuitabilityAuthority,
    "not-established",
  );
  assert.equal(audit.exactStairsState, "unknown");
  assert.equal(audit.directGenericStrollerRouteEvidence, "not-sourced");
  assert.equal(audit.stroller, "unknown");
  assert.equal(audit.result, "blocked");
  assert.equal(
    audit.blocker,
    "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  );
});

test("Planner 53 freezes the exact unresolved stroller blocker", () => {
  assert.deepEqual(
    assessInteriorTreetopsStroller("sdz-tiger-trail"),
    {
      status: "blocked",
      reason: "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
      objectiveSourceRecordId: "sdz-tiger-trail",
      evidenceAuditId:
        "sdz-interior-treetops-anchor-to-fern-canyon-stroller-evidence-audit",
      sourceWayId: "148910139",
      sourceWayVersion: 7,
      sourceFromNodeId: "1619736626",
      sourceToNodeId: "13588159626",
      stroller: "unknown",
      routeGraphExpansion: {
        status: "blocked",
        reasons: [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        ],
      },
    },
  );
});

test("Planner 53 does not leak stroller audit to other objectives", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(
      interiorTreetopsStrollerAuditForObjective(objective),
      undefined,
    );
    assert.deepEqual(assessInteriorTreetopsStroller(objective), {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_STROLLER_NOT_SOURCED",
      objectiveSourceRecordId: objective,
    });
  }
});

test("Planner 53 exports and assessments are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT[0]),
    true,
  );

  const assessment =
    assessInteriorTreetopsStroller("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if ("routeGraphExpansion" in assessment) {
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(
      Object.isFrozen(assessment.routeGraphExpansion.reasons),
      true,
    );
  }
});
