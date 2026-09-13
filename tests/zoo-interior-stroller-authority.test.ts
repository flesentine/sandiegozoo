import assert from "node:assert/strict";
import test from "node:test";

import {
  INGRESS_STROLLER_FACILITY_POLICY,
} from "../src/data/zooIngressMobilityAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
} from "../src/data/zooInteriorAccessibilityAuthority.ts";
import {
  INTERIOR_STAIRS_EVIDENCE_AUDIT,
} from "../src/data/zooInteriorStairsAuthority.ts";
import {
  INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE,
  INTERIOR_STROLLER_EVIDENCE_AUDIT,
  INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY,
  assertInteriorStrollerEvidenceAuditIntegrity,
  assertInteriorStrollerEvidenceAuditPolicyIntegrity,
  assessInteriorStroller,
  interiorStrollerEvidenceAuditForObjective,
  type InteriorStrollerEvidenceAudit,
  type InteriorStrollerEvidenceAuditPolicy,
} from "../src/data/zooInteriorStrollerAuthority.ts";

function mutableAudit(): InteriorStrollerEvidenceAudit {
  const source = INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!;
  return {
    ...source,
    accessibilityGuideEvidence: {
      ...source.accessibilityGuideEvidence,
    },
  };
}

function mutablePolicy(): InteriorStrollerEvidenceAuditPolicy {
  return {
    ...INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY,
  };
}

test("Planner 36 preserves the exact Tiger Trail stroller blocker after evidence audit", () => {
  const result = assessInteriorStroller("sdz-tiger-trail");

  assert.equal(result.status, "blocked");
  if (result.reason !== "EXACT_SEGMENT_STROLLER_NOT_SOURCED") {
    assert.fail(`unexpected reason: ${result.reason}`);
  }

  assert.equal(result.stroller, "unknown");
  assert.equal(result.sourceFromNodeId, "7053320515");
  assert.equal(result.sourceToNodeId, "1619736626");
  assert.deepEqual(
    result.exactSegmentMaterialization.reasons,
    [
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
      "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
    ],
  );
});

test("Planner 36 keeps facility stroller permission separate from exact route suitability", () => {
  const audit = INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!;

  assert.equal(
    audit.facilityStrollerPolicyId,
    INGRESS_STROLLER_FACILITY_POLICY.id,
  );
  assert.equal(audit.facilityStrollerPolicy, "allowed");
  assert.equal(
    audit.facilityRouteSuitabilityAuthority,
    "not-established",
  );
  assert.equal(
    INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.facilityPermission,
    "insufficient-for-exact-route-suitability",
  );
});

test("Planner 36 records wheelchair-tagged child strollers only as an accessibility-device special case", () => {
  assert.equal(
    INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE.sourceUrl,
    "https://sdzwa.org/sdzwa-accessibility-guide",
  );
  assert.equal(
    INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE.childStrollerAccessibilityDevicePolicy,
    "wheelchair-tag-available-when-child-cannot-transfer",
  );
  assert.equal(
    INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE.evidenceScope,
    "accessibility-device-specific",
  );
  assert.equal(
    INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE.genericStrollerRouteSuitabilityAuthority,
    "not-established",
  );
  assert.equal(
    INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.wheelchairTaggedStrollerTreatment,
    "accessibility-device-special-case-not-generic-stroller-authority",
  );
});

test("Planner 36 does not convert exact wheelchair accessibility into generic stroller suitability", () => {
  const accessibility = INTERIOR_ACCESSIBILITY_AUTHORITY[0]!;
  const audit = INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!;

  assert.equal(accessibility.accessible, true);
  assert.equal(
    accessibility.strollerAuthorityState,
    "facility-permission-not-route-suitability",
  );
  assert.equal(
    audit.exactAccessibilityState,
    "accessible-true-stroller-independent-unresolved",
  );
  assert.equal(
    INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.wheelchairAccessibility,
    "does-not-establish-generic-stroller-suitability",
  );
});

test("Planner 36 cannot treat unresolved stairs as stroller-compatible", () => {
  const stairs = INTERIOR_STAIRS_EVIDENCE_AUDIT[0]!;
  const audit = INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!;

  assert.equal(stairs.result, "blocked");
  assert.equal(stairs.blocker, "EXACT_SEGMENT_STAIRS_NOT_SOURCED");
  assert.equal(audit.exactStairsState, "unknown");
  assert.equal(
    INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.unresolvedStairs,
    "cannot-be-treated-as-stroller-compatible",
  );
});

test("Planner 36 freezes the positive evidence still required to clear stroller suitability", () => {
  assert.equal(
    INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.positiveEvidenceRequirement,
    "direct-exact-segment-generic-stroller-suitability-or-explicit-all-strollers-route-binding",
  );
  assert.equal(
    INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!.directGenericStrollerRouteEvidence,
    "not-sourced",
  );
});

test("Planner 36 stays attached to the exact Planner 35 and Planner 33 segment", () => {
  const audit = INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!;
  const stairs = INTERIOR_STAIRS_EVIDENCE_AUDIT[0]!;
  const accessibility = INTERIOR_ACCESSIBILITY_AUTHORITY[0]!;

  assert.equal(audit.stairsEvidenceAuditId, stairs.id);
  assert.equal(audit.accessibilityAuthorityId, accessibility.id);
  assert.equal(audit.sourceWayId, stairs.sourceWayId);
  assert.equal(audit.sourceWayId, accessibility.sourceWayId);
  assert.equal(audit.sourceFromNodeId, stairs.sourceFromNodeId);
  assert.equal(audit.sourceToNodeId, stairs.sourceToNodeId);
});

test("other objectives cannot inherit the Tiger Trail stroller evidence audit", () => {
  assert.equal(
    interiorStrollerEvidenceAuditForObjective("sdz-panda-ridge"),
    undefined,
  );

  const result = assessInteriorStroller("sdz-panda-ridge");
  assert.deepEqual(result, {
    status: "blocked",
    reason: "OBJECTIVE_STROLLER_NOT_SOURCED",
    objectiveSourceRecordId: "sdz-panda-ridge",
    globalEndpointSelection: "unresolved",
  });
});

test("Planner 36 policy rejects weakening generic stroller evidence requirements", () => {
  const facility = mutablePolicy();
  Object.assign(facility, {
    facilityPermission: "sufficient-for-exact-route-suitability",
  });
  assert.throws(
    () => assertInteriorStrollerEvidenceAuditPolicyIntegrity(facility),
    /conservative boundary/,
  );

  const wheelchair = mutablePolicy();
  Object.assign(wheelchair, {
    wheelchairTaggedStrollerTreatment:
      "generic-stroller-authority",
  });
  assert.throws(
    () => assertInteriorStrollerEvidenceAuditPolicyIntegrity(wheelchair),
    /conservative boundary/,
  );
});

test("Planner 36 audit rejects a smuggled stroller value or RouteEdge materialization", () => {
  const stroller = {
    ...mutableAudit(),
    stroller: true,
  } as unknown as InteriorStrollerEvidenceAudit;
  assert.throws(
    () => assertInteriorStrollerEvidenceAuditIntegrity([stroller]),
    /unknown field stroller/,
  );

  const routeEdge = {
    ...mutableAudit(),
    routeEdgeId: "invented-edge",
  } as unknown as InteriorStrollerEvidenceAudit;
  assert.throws(
    () => assertInteriorStrollerEvidenceAuditIntegrity([routeEdge]),
    /unknown field routeEdgeId/,
  );
});

test("Planner 36 audit rejects exact-segment and guide-evidence drift", () => {
  const endpoint = mutableAudit();
  Object.assign(endpoint, { sourceToNodeId: "other-node" });
  assert.throws(
    () => assertInteriorStrollerEvidenceAuditIntegrity([endpoint]),
    /blocker-preserving boundary/,
  );

  const guide = mutableAudit();
  Object.assign(guide.accessibilityGuideEvidence, {
    genericStrollerRouteSuitabilityAuthority: "established",
  });
  assert.throws(
    () => assertInteriorStrollerEvidenceAuditIntegrity([guide]),
    /accessibility-guide evidence drifted/,
  );
});

test("Planner 36 rejects coercible non-string guide URLs without invoking caller code", () => {
  const audit = mutableAudit();
  let coercions = 0;
  const coercibleUrl = {
    toString() {
      coercions += 1;
      return "https://sdzwa.org/sdzwa-accessibility-guide";
    },
    stroller: true,
  };
  Object.assign(audit.accessibilityGuideEvidence, {
    sourceUrl: coercibleUrl as unknown as string,
  });

  assert.throws(
    () => assertInteriorStrollerEvidenceAuditIntegrity([audit]),
    /accessibility-guide evidence drifted/,
  );
  assert.equal(coercions, 0);
});

test("Planner 36 rejects non-string objective IDs before lookup or assessment output", () => {
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;

  assert.throws(
    () => interiorStrollerEvidenceAuditForObjective(
      cyclic as unknown as string,
    ),
    /primitive stable string/,
  );
  assert.throws(
    () => assessInteriorStroller(
      cyclic as unknown as string,
    ),
    /primitive stable string/,
  );

  assert.throws(
    () => assessInteriorStroller(
      new String("sdz-tiger-trail") as unknown as string,
    ),
    /primitive stable string/,
  );
});

test("Planner 36 runtime boundary rejects accessor-backed audit array elements without invoking them", () => {
  const accessorBacked = [
    mutableAudit(),
  ] as unknown as InteriorStrollerEvidenceAudit[];
  let reads = 0;

  Object.defineProperty(accessorBacked, "0", {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return reads === 1
        ? mutableAudit()
        : { ...mutableAudit(), stroller: true };
    },
  });

  assert.throws(
    () => assertInteriorStrollerEvidenceAuditIntegrity(accessorBacked),
    /enumerable own data element 0/,
  );
  assert.equal(reads, 0);
});

test("Planner 36 policy, guide evidence, audit, and assessments are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE),
    true,
  );
  assert.equal(Object.isFrozen(INTERIOR_STROLLER_EVIDENCE_AUDIT), true);
  assert.equal(
    Object.isFrozen(INTERIOR_STROLLER_EVIDENCE_AUDIT[0]),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!.accessibilityGuideEvidence,
    ),
    true,
  );

  const result = assessInteriorStroller("sdz-tiger-trail");
  assert.equal(Object.isFrozen(result), true);
  if (result.reason === "EXACT_SEGMENT_STROLLER_NOT_SOURCED") {
    assert.equal(Object.isFrozen(result.exactSegmentMaterialization), true);
    assert.equal(
      Object.isFrozen(result.exactSegmentMaterialization.reasons),
      true,
    );
  }
});
