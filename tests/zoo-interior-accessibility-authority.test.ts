import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
  INTERIOR_ACCESSIBILITY_POLICY,
  assessInteriorAccessibility,
  assertInteriorAccessibilityAuthorityIntegrity,
  assertInteriorAccessibilityPolicyIntegrity,
  classifyNamedCorridorAccessibility,
  interiorAccessibilityForObjective,
  type InteriorAccessibilityAuthority,
  type InteriorAccessibilityPolicy,
} from "../src/data/zooInteriorAccessibilityAuthority.ts";
import {
  INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE,
  INGRESS_STROLLER_FACILITY_POLICY,
} from "../src/data/zooIngressMobilityAuthority.ts";
import {
  INTERIOR_DIFFICULTY_AUTHORITY,
} from "../src/data/zooInteriorDifficultyAuthority.ts";

function mutablePolicy() {
  return { ...INTERIOR_ACCESSIBILITY_POLICY } as unknown as InteriorAccessibilityPolicy;
}

function mutableAuthority() {
  return { ...INTERIOR_ACCESSIBILITY_AUTHORITY[0] } as unknown as InteriorAccessibilityAuthority;
}

test("Planner 33 maps exact-name-matched official wheelchair corridor evidence to accessible=true", () => {
  assert.deepEqual(
    classifyNamedCorridorAccessibility({
      corridorName: "Front Street",
      exactSourceWayName: "Front Street",
      wheelchairIndicator: "shown",
      mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
    }),
    {
      status: "supported",
      accessible: true,
      basis:
        "official-wheelchair-indicator-on-exact-name-matched-ada-corridor",
    },
  );
});

test("Planner 33 refuses accessibility projection when exact source-way and official corridor names differ", () => {
  assert.deepEqual(
    classifyNamedCorridorAccessibility({
      corridorName: "Front Street",
      exactSourceWayName: "Treetops Way",
      wheelchairIndicator: "shown",
      mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
    }),
    {
      status: "blocked",
      reason: "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH",
    },
  );
});

test("Planner 33 requires both the official wheelchair indicator and ADA route legend", () => {
  for (const input of [
    {
      corridorName: "Front Street",
      exactSourceWayName: "Front Street",
      wheelchairIndicator: "absent",
      mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
    },
    {
      corridorName: "Front Street",
      exactSourceWayName: "Front Street",
      wheelchairIndicator: "shown",
      mapRouteLegend: "OTHER ROUTE",
    },
  ]) {
    assert.deepEqual(classifyNamedCorridorAccessibility(input), {
      status: "blocked",
      reason: "ACCESSIBILITY_EVIDENCE_NOT_MAPPED_BY_POLICY",
    });
  }
});

test("Planner 33 is grounded in Planner 17 official Front Street wheelchair evidence", () => {
  const authority = INTERIOR_ACCESSIBILITY_AUTHORITY[0];
  const evidence = INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE.find(
    (record) => record.id === authority.corridorAccessibilityEvidenceId,
  );

  assert.ok(evidence);
  assert.equal(evidence.corridorId, "sdz-corridor-front-street");
  assert.equal(evidence.corridorName, "Front Street");
  assert.equal(evidence.wheelchairIndicator, "shown");
  assert.equal(evidence.mapRouteLegend, "ADA MOST ACCESSIBLE ROUTE");
  assert.equal(evidence.scope, "named-corridor");
  assert.equal(
    evidence.plannerMaterialization,
    "corridor-accessibility-evidence-only",
  );
});

test("Planner 33 remains attached to the exact Planner 32 Tiger segment", () => {
  const accessibility = INTERIOR_ACCESSIBILITY_AUTHORITY[0];
  const difficulty = INTERIOR_DIFFICULTY_AUTHORITY[0];

  assert.equal(accessibility.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(accessibility.difficultyAuthorityId, difficulty.id);
  assert.equal(accessibility.corridorId, difficulty.corridorId);
  assert.equal(accessibility.corridorName, difficulty.corridorName);
  assert.equal(accessibility.sourceWayId, difficulty.sourceWayId);
  assert.equal(accessibility.sourceWayName, difficulty.sourceWayName);
  assert.equal(accessibility.sourceFromNodeId, difficulty.sourceFromNodeId);
  assert.equal(accessibility.sourceToNodeId, difficulty.sourceToNodeId);
});

test("Planner 33 clears accessibility only while stairs and stroller remain independent", () => {
  assert.deepEqual(assessInteriorAccessibility("sdz-tiger-trail"), {
    status: "accessibility-ready",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceFromNodeId: "7053320515",
    sourceToNodeId: "1619736626",
    accessible: true,
    stairsAuthorityState: "independent-unresolved",
    strollerAuthorityState: "facility-permission-not-route-suitability",
    operationalEligibility: "unresolved",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("facility stroller permission still does not establish exact-segment stroller suitability", () => {
  assert.equal(INGRESS_STROLLER_FACILITY_POLICY.strollerPolicy, "allowed");
  assert.equal(
    INGRESS_STROLLER_FACILITY_POLICY.routeSuitabilityAuthority,
    "not-established",
  );
  assert.equal(
    INTERIOR_ACCESSIBILITY_AUTHORITY[0].strollerAuthorityState,
    "facility-permission-not-route-suitability",
  );
  assert.equal(
    Object.hasOwn(INTERIOR_ACCESSIBILITY_AUTHORITY[0], "stroller"),
    false,
  );
});

test("other objectives cannot inherit Front Street accessibility", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(interiorAccessibilityForObjective(objective), undefined);
    assert.deepEqual(assessInteriorAccessibility(objective), {
      status: "blocked",
      reason: "OBJECTIVE_ACCESSIBILITY_NOT_SOURCED",
      objectiveSourceRecordId: objective,
      globalEndpointSelection: "unresolved",
    });
  }
});

test("Planner 33 policy rejects stroller or stairs coupling", () => {
  const stroller = mutablePolicy() as unknown as { strollerSemantics: string };
  stroller.strollerSemantics = "accessible-implies-stroller";
  assert.throws(
    () =>
      assertInteriorAccessibilityPolicyIntegrity(
        stroller as unknown as InteriorAccessibilityPolicy,
      ),
    /accessibility policy drifted/,
  );

  const stairs = mutablePolicy() as unknown as { stairsSemantics: string };
  stairs.stairsSemantics = "accessible-implies-no-stairs";
  assert.throws(
    () =>
      assertInteriorAccessibilityPolicyIntegrity(
        stairs as unknown as InteriorAccessibilityPolicy,
      ),
    /accessibility policy drifted/,
  );
});

test("Planner 33 authority rejects accessibility, corridor, and endpoint drift", () => {
  const accessibility = mutableAuthority() as unknown as { accessible: boolean };
  accessibility.accessible = false;
  assert.throws(
    () =>
      assertInteriorAccessibilityAuthorityIntegrity([
        accessibility as unknown as InteriorAccessibilityAuthority,
      ]),
    /accessibility authority drifted|does not reproduce/,
  );

  const corridor = mutableAuthority() as unknown as { corridorName: string };
  corridor.corridorName = "Treetops Way";
  assert.throws(
    () =>
      assertInteriorAccessibilityAuthorityIntegrity([
        corridor as unknown as InteriorAccessibilityAuthority,
      ]),
    /accessibility authority drifted|detached from Planner 32|detached from Planner 17|does not reproduce/,
  );

  const endpoint = mutableAuthority() as unknown as { sourceToNodeId: string };
  endpoint.sourceToNodeId = "6239154982";
  assert.throws(
    () =>
      assertInteriorAccessibilityAuthorityIntegrity([
        endpoint as unknown as InteriorAccessibilityAuthority,
      ]),
    /accessibility authority drifted|detached from Planner 32/,
  );
});

test("Planner 33 rejects stroller, status, and unrelated RouteEdge semantic promotion", () => {
  const stroller = {
    ...mutableAuthority(),
    stroller: true,
  } as unknown as InteriorAccessibilityAuthority;
  assert.throws(
    () => assertInteriorAccessibilityAuthorityIntegrity([stroller]),
    /cannot contain unknown field stroller|cannot own field stroller/,
  );

  const operational = mutableAuthority() as unknown as {
    operationalEligibility: string;
  };
  operational.operationalEligibility = "open";
  assert.throws(
    () =>
      assertInteriorAccessibilityAuthorityIntegrity([
        operational as unknown as InteriorAccessibilityAuthority,
      ]),
    /accessibility authority drifted/,
  );
});

test("Planner 33 runtime boundary rejects hidden aliases and decorated arrays", () => {
  const hidden = mutableAuthority();
  Object.defineProperty(hidden, "stroller", {
    value: true,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorAccessibilityAuthorityIntegrity([hidden]),
    /cannot contain unknown field stroller/,
  );

  const decorated = [
    mutableAuthority(),
  ] as unknown as InteriorAccessibilityAuthority[] & { status?: string };
  Object.defineProperty(decorated, "status", {
    value: "open",
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorAccessibilityAuthorityIntegrity(decorated),
    /accessibility authority collection cannot contain extra own properties/,
  );
});

test("Planner 33 policy, authority, and assessments are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_ACCESSIBILITY_POLICY), true);
  assert.equal(Object.isFrozen(INTERIOR_ACCESSIBILITY_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_ACCESSIBILITY_AUTHORITY[0]), true);

  const assessment = assessInteriorAccessibility("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "accessibility-ready") {
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization), true);
    assert.equal(
      Object.isFrozen(assessment.exactSegmentMaterialization.reasons),
      true,
    );
  }
});
