import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_STAIRS_EVIDENCE_AUDIT,
  INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY,
  assessInteriorStairs,
  assertInteriorStairsEvidenceAuditIntegrity,
  assertInteriorStairsEvidenceAuditPolicyIntegrity,
  interiorStairsEvidenceAuditForObjective,
  type InteriorStairsEvidenceAudit,
  type InteriorStairsEvidenceAuditPolicy,
} from "../src/data/zooInteriorStairsAuthority.ts";
import {
  INTERIOR_OPERATIONAL_STATUS_AUTHORITY,
} from "../src/data/zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
} from "../src/data/zooInteriorAccessibilityAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "../src/data/zooInteriorPedestrianDirectionAuthority.ts";
import {
  classifyExactStairsAuthority,
} from "../src/data/zooIngressTerrainAuthority.ts";

function mutablePolicy() {
  return {
    ...INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY,
  } as unknown as InteriorStairsEvidenceAuditPolicy;
}

function mutableAudit() {
  return {
    ...INTERIOR_STAIRS_EVIDENCE_AUDIT[0],
  } as unknown as InteriorStairsEvidenceAudit;
}

test("Planner 35 preserves the exact Tiger Trail stairs blocker after evidence audit", () => {
  assert.deepEqual(assessInteriorStairs("sdz-tiger-trail"), {
    status: "blocked",
    reason: "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    objectiveSourceRecordId: "sdz-tiger-trail",
    evidenceAuditId:
      "sdz-interior-tiger-trail-front-street-stairs-evidence-audit",
    sourceFromNodeId: "7053320515",
    sourceToNodeId: "1619736626",
    stairs: "unknown",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("Planner 35 requires Planner 18 absence-only classification to remain blocked", () => {
  const result = classifyExactStairsAuthority({
    id: INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.id,
    sourceTags:
      INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags,
  });
  assert.deepEqual(result, {
    status: "blocked",
    reason: "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
    basis: "Planner 18 stairs authority",
    sourceSnapshotId:
      INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.id,
  });
  assert.equal(
    INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY.absenceOfHighwaySteps,
    "insufficient-for-stairs-false",
  );
});

test("Planner 35 records OSM pedestrian and asphalt only as identity context", () => {
  const audit = INTERIOR_STAIRS_EVIDENCE_AUDIT[0];
  assert.equal(audit.exactWayHighway, "pedestrian");
  assert.equal(audit.exactWaySurface, "asphalt");
  assert.equal(audit.sourceWayName, "Front Street");
  assert.equal(
    INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY.pedestrianOrAsphaltClassification,
    "identity-context-only-not-no-stairs-authority",
  );
});

test("Planner 35 preserves Planner 33 accessibility while refusing to convert it into stairs", () => {
  const audit = INTERIOR_STAIRS_EVIDENCE_AUDIT[0];
  const accessibility = INTERIOR_ACCESSIBILITY_AUTHORITY[0];
  assert.equal(accessibility.accessible, true);
  assert.equal(
    accessibility.stairsAuthorityState,
    "independent-unresolved",
  );
  assert.equal(
    audit.planner33AccessibilityState,
    "accessible-true-stairs-independent-unresolved",
  );
  assert.equal(
    INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY.wheelchairAccessibility,
    "independent-does-not-establish-stairs",
  );
  assert.equal("stairs" in audit, false);
});

test("Planner 35 records Zoo accessible-route guidance and ADA 402 only as insufficient context", () => {
  const audit = INTERIOR_STAIRS_EVIDENCE_AUDIT[0];
  assert.equal(
    audit.zooAccessibilityGuideUrl,
    "https://sdzwa.org/sdzwa-accessibility-guide",
  );
  assert.equal(
    audit.zooAccessibilityGuideRole,
    "general-accessible-route-context-not-exact-section-402-binding",
  );
  assert.equal(
    audit.adaStandardUrl,
    "https://www.ada.gov/assets/pdfs/2010-design-standards.pdf",
  );
  assert.equal(audit.adaStandardSection, "402.2");
  assert.equal(
    audit.adaStandardRole,
    "semantic-only-until-exact-route-applicability-sourced",
  );
  assert.equal(
    INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY.generalAccessibleRouteGuidance,
    "does-not-bind-exact-segment-to-ada-402",
  );
});

test("Planner 35 freezes the positive evidence still required to clear stairs", () => {
  assert.equal(
    INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY.positiveEvidenceRequirement,
    "explicit-exact-route-ada-402-binding-or-direct-stair-free-evidence",
  );
  assert.equal(
    INTERIOR_STAIRS_EVIDENCE_AUDIT[0].directStairFreeEvidence,
    "not-sourced",
  );
  assert.equal(
    INTERIOR_STAIRS_EVIDENCE_AUDIT[0].blocker,
    "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  );
});

test("Planner 35 stays attached to the exact Planner 34 and Planner 33 segment", () => {
  const audit = INTERIOR_STAIRS_EVIDENCE_AUDIT[0];
  const operational = INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0];
  const accessibility = INTERIOR_ACCESSIBILITY_AUTHORITY[0];

  assert.equal(audit.operationalStatusAuthorityId, operational.id);
  assert.equal(audit.accessibilityAuthorityId, accessibility.id);
  assert.equal(audit.sourceWayId, operational.sourceWayId);
  assert.equal(audit.sourceWayId, accessibility.sourceWayId);
  assert.equal(audit.sourceFromNodeId, operational.sourceFromNodeId);
  assert.equal(audit.sourceToNodeId, operational.sourceToNodeId);
  assert.equal(audit.sourceFromNodeId, accessibility.sourceFromNodeId);
  assert.equal(audit.sourceToNodeId, accessibility.sourceToNodeId);
});

test("other objectives cannot inherit the Tiger Trail stairs evidence audit", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(
      interiorStairsEvidenceAuditForObjective(objective),
      undefined,
    );
    assert.deepEqual(assessInteriorStairs(objective), {
      status: "blocked",
      reason: "OBJECTIVE_STAIRS_NOT_SOURCED",
      objectiveSourceRecordId: objective,
      globalEndpointSelection: "unresolved",
    });
  }
});

test("Planner 35 policy rejects weakening the evidence standard", () => {
  const policy = mutablePolicy() as unknown as {
    absenceOfHighwaySteps: string;
  };
  policy.absenceOfHighwaySteps = "sufficient-for-stairs-false";
  assert.throws(
    () =>
      assertInteriorStairsEvidenceAuditPolicyIntegrity(
        policy as unknown as InteriorStairsEvidenceAuditPolicy,
      ),
    /policy drifted/,
  );

  const applicability = mutablePolicy() as unknown as {
    adaSection402Semantics: string;
  };
  applicability.adaSection402Semantics =
    "general-accessibility-context-is-enough";
  assert.throws(
    () =>
      assertInteriorStairsEvidenceAuditPolicyIntegrity(
        applicability as unknown as InteriorStairsEvidenceAuditPolicy,
      ),
    /policy drifted/,
  );
});

test("Planner 35 audit rejects a smuggled stairs value or positive result", () => {
  const stairs = {
    ...mutableAudit(),
    stairs: false,
  } as unknown as InteriorStairsEvidenceAudit;
  assert.throws(
    () => assertInteriorStairsEvidenceAuditIntegrity([stairs]),
    /unknown field stairs|drifted/,
  );

  const positive = mutableAudit() as unknown as {
    result: string;
  };
  positive.result = "supported";
  assert.throws(
    () =>
      assertInteriorStairsEvidenceAuditIntegrity([
        positive as unknown as InteriorStairsEvidenceAudit,
      ]),
    /audit drifted/,
  );
});

test("Planner 35 audit rejects exact-segment and evidence-role drift", () => {
  const endpoint = mutableAudit() as unknown as {
    sourceToNodeId: string;
  };
  endpoint.sourceToNodeId = "wrong-node";
  assert.throws(
    () =>
      assertInteriorStairsEvidenceAuditIntegrity([
        endpoint as unknown as InteriorStairsEvidenceAudit,
      ]),
    /audit drifted|detached/,
  );

  const guideRole = mutableAudit() as unknown as {
    zooAccessibilityGuideRole: string;
  };
  guideRole.zooAccessibilityGuideRole =
    "formal-exact-route-section-402-certification";
  assert.throws(
    () =>
      assertInteriorStairsEvidenceAuditIntegrity([
        guideRole as unknown as InteriorStairsEvidenceAudit,
      ]),
    /audit drifted/,
  );
});

test("Planner 35 runtime boundary rejects hidden fields, symbols, and decorated arrays", () => {
  const hidden = mutableAudit();
  Object.defineProperty(hidden, "provenance", {
    value: "complete",
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorStairsEvidenceAuditIntegrity([hidden]),
    /unknown field provenance/,
  );

  const symbol = mutableAudit() as unknown as Record<PropertyKey, unknown>;
  symbol[Symbol("stairs")] = false;
  assert.throws(
    () =>
      assertInteriorStairsEvidenceAuditIntegrity([
        symbol as unknown as InteriorStairsEvidenceAudit,
      ]),
    /symbol fields/,
  );

  const decorated = [
    mutableAudit(),
  ] as unknown as InteriorStairsEvidenceAudit[] & { stairs?: boolean };
  Object.defineProperty(decorated, "stairs", {
    value: false,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorStairsEvidenceAuditIntegrity(decorated),
    /extra own properties/,
  );
});

test("Planner 35 evidence audit, policy, and assessments are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY),
    true,
  );
  assert.equal(Object.isFrozen(INTERIOR_STAIRS_EVIDENCE_AUDIT), true);
  assert.equal(
    Object.isFrozen(INTERIOR_STAIRS_EVIDENCE_AUDIT[0]),
    true,
  );

  const assessment = assessInteriorStairs("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (
    "exactSegmentMaterialization" in assessment
  ) {
    assert.equal(
      Object.isFrozen(assessment.exactSegmentMaterialization),
      true,
    );
    assert.equal(
      Object.isFrozen(assessment.exactSegmentMaterialization.reasons),
      true,
    );
  }
});
