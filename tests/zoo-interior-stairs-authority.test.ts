import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_STAIRS_APPLICABILITY_EVIDENCE,
  INTERIOR_STAIRS_AUTHORITY,
  INTERIOR_STAIRS_POLICY,
  assessInteriorStairs,
  assertInteriorStairsApplicabilityEvidenceIntegrity,
  assertInteriorStairsAuthorityIntegrity,
  assertInteriorStairsPolicyIntegrity,
  classifyInteriorStairs,
  interiorStairsForObjective,
  type InteriorStairsApplicabilityEvidence,
  type InteriorStairsAuthority,
  type InteriorStairsPolicy,
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

function validInput() {
  return {
    exactWayHighway: "pedestrian",
    exactWaySurface: "asphalt",
    exactWayName: "Front Street",
    accessibilitySourceWayName: "Front Street",
    accessible: true,
    wheelchairIndicator: "shown",
    mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
    zooGuideSourceUrl:
      "https://sdzwa.org/sdzwa-accessibility-guide",
    zooGuideAdaComplianceContext:
      "committed-to-ada-and-california-access-laws",
    zooGuideAccessibilityMapMeaning:
      "provides-information-on-accessible-routes",
    zooGuideBestPathMeaning:
      "blue-dotted-line-is-best-path-of-travel",
    zooGuideMobilityDeviceMapInstruction:
      "consult-accessibility-map-to-determine-accessible-areas",
    adaStandardReferenceUrl:
      "https://www.ada.gov/assets/pdfs/2010-design-standards.pdf",
    adaStandardSection: "402.2",
    accessibleRouteStairsSemantics:
      "stairs-not-an-accessible-route-component",
  };
}

function mutableApplicability() {
  return {
    ...INTERIOR_STAIRS_APPLICABILITY_EVIDENCE,
  } as unknown as InteriorStairsApplicabilityEvidence;
}

function mutablePolicy() {
  return { ...INTERIOR_STAIRS_POLICY } as unknown as InteriorStairsPolicy;
}

function mutableAuthority() {
  return { ...INTERIOR_STAIRS_AUTHORITY[0] } as unknown as InteriorStairsAuthority;
}

test("Planner 35 v3 maps Zoo-authored accessible-route applicability plus ADA 402.2 semantics to stairs=false", () => {
  assert.deepEqual(classifyInteriorStairs(validInput()), {
    status: "supported",
    stairs: false,
    basis:
      "zoo-authored-accessible-route-applicability-plus-ada-402-2-components",
  });
});

test("Planner 35 freezes official Zoo-authored applicability evidence instead of assuming map labels are formal ADA routes", () => {
  assert.deepEqual(INTERIOR_STAIRS_APPLICABILITY_EVIDENCE, {
    id: "sdz-zoo-accessibility-guide-2026-route-applicability",
    sourceUrl: "https://sdzwa.org/sdzwa-accessibility-guide",
    sourceLabel:
      "San Diego Zoo Wildlife Alliance Accessibility Guide 2026",
    observedAt: "2026-09-13T00:39:00-07:00",
    sourceAuthority: "official-zoo-accessibility-guide",
    adaComplianceContext:
      "committed-to-ada-and-california-access-laws",
    zooAccessibilityMapMeaning:
      "provides-information-on-accessible-routes",
    zooBestPathMeaning:
      "blue-dotted-line-is-best-path-of-travel",
    mobilityDeviceMapInstruction:
      "consult-accessibility-map-to-determine-accessible-areas",
    plannerMaterialization:
      "stairs-applicability-evidence-only",
  });
});

test("Planner 35 requires the Zoo guide to establish accessible-route applicability", () => {
  for (const patch of [
    { zooGuideSourceUrl: "https://example.com/accessibility-guide" },
    { zooGuideAdaComplianceContext: "generic-accessibility-context" },
    { zooGuideAccessibilityMapMeaning: "general-map-only" },
    { zooGuideBestPathMeaning: "unknown" },
    { zooGuideMobilityDeviceMapInstruction: "not-specified" },
  ]) {
    assert.deepEqual(
      classifyInteriorStairs({ ...validInput(), ...patch }),
      {
        status: "blocked",
        reason: "ZOO_ACCESSIBLE_ROUTE_APPLICABILITY_NOT_ESTABLISHED",
      },
    );
  }
});

test("Planner 35 preserves Planner 18 absence-only stairs blocking", () => {
  const planner18 = classifyExactStairsAuthority({
    id: "front-street-test",
    sourceTags: {
      highway: "pedestrian",
    } as never,
  });
  assert.equal(planner18.status, "blocked");
  assert.equal(
    INTERIOR_STAIRS_POLICY.absenceOfHighwayStepsAlone,
    "insufficient-for-stairs-false",
  );
  assert.equal(
    INTERIOR_STAIRS_AUTHORITY[0].absenceOfHighwayStepsRole,
    "non-authoritative-supporting-context-only",
  );
});

test("Planner 35 keeps OSM pedestrian/asphalt classification as identity context only", () => {
  assert.equal(
    INTERIOR_STAIRS_POLICY.exactWayIdentityRole,
    "identity-context-only-not-no-stairs-authority",
  );
  assert.equal(
    INTERIOR_STAIRS_AUTHORITY[0].exactWayIdentityRole,
    "identity-context-only-not-no-stairs-authority",
  );

  for (const patch of [
    { exactWayHighway: "footway" },
    { exactWayHighway: "steps" },
    { exactWaySurface: "unknown" },
    { exactWayName: "Other Street" },
  ]) {
    assert.deepEqual(
      classifyInteriorStairs({ ...validInput(), ...patch }),
      {
        status: "blocked",
        reason: "EXACT_WAY_IDENTITY_CONTEXT_NOT_MET",
      },
    );
  }
});

test("Planner 35 requires exact source-way name identity with the qualified accessibility source", () => {
  assert.deepEqual(
    classifyInteriorStairs({
      ...validInput(),
      accessibilitySourceWayName: "Treetops Way",
    }),
    {
      status: "blocked",
      reason:
        "ACCESSIBILITY_SOURCE_NAME_NOT_EXACT_SOURCE_WAY_MATCH",
    },
  );
});

test("Planner 35 requires the already-qualified wheelchair accessibility result", () => {
  for (const patch of [
    { accessible: false },
    { wheelchairIndicator: "absent" },
    { mapRouteLegend: "OTHER ROUTE" },
  ]) {
    assert.deepEqual(
      classifyInteriorStairs({ ...validInput(), ...patch }),
      {
        status: "blocked",
        reason: "ACCESSIBILITY_PREREQUISITE_NOT_MET",
      },
    );
  }
});

test("Planner 35 requires the exact DOJ ADA accessible-route component semantic", () => {
  for (const patch of [
    { adaStandardReferenceUrl: "https://example.com/ada.pdf" },
    { adaStandardSection: "405" },
    {
      accessibleRouteStairsSemantics:
        "stairs-may-be-an-accessible-route-component",
    },
  ]) {
    assert.deepEqual(
      classifyInteriorStairs({ ...validInput(), ...patch }),
      {
        status: "blocked",
        reason:
          "ACCESSIBLE_ROUTE_STANDARD_PREREQUISITE_NOT_MET",
      },
    );
  }
});

test("Planner 35 stays attached to the exact Planner 34 segment and Planner 33 accessibility evidence", () => {
  const stairs = INTERIOR_STAIRS_AUTHORITY[0];
  const operational = INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0];
  const accessibility = INTERIOR_ACCESSIBILITY_AUTHORITY[0];

  assert.equal(
    stairs.operationalStatusAuthorityId,
    operational.id,
  );
  assert.equal(stairs.accessibilityAuthorityId, accessibility.id);
  assert.equal(stairs.sourceWayId, operational.sourceWayId);
  assert.equal(
    stairs.sourceFromNodeId,
    operational.sourceFromNodeId,
  );
  assert.equal(
    stairs.sourceToNodeId,
    operational.sourceToNodeId,
  );
  assert.equal(stairs.sourceWayName, accessibility.sourceWayName);
  assert.equal(accessibility.accessible, true);
  assert.equal(accessibility.wheelchairIndicator, "shown");
  assert.equal(
    accessibility.mapRouteLegend,
    "ADA MOST ACCESSIBLE ROUTE",
  );
});

test("Planner 35 stays attached to the complete version-pinned Planner 29 OSM identity snapshot", () => {
  const stairs = INTERIOR_STAIRS_AUTHORITY[0];
  const snapshot = INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
  assert.equal(stairs.sourceSnapshotId, snapshot.id);
  assert.equal(stairs.sourceWayId, snapshot.sourceWayId);
  assert.equal(stairs.exactWayHighway, snapshot.sourceTags.highway);
  assert.equal(stairs.exactWaySurface, snapshot.sourceTags.surface);
  assert.equal(stairs.sourceWayName, snapshot.sourceTags.name);
  assert.equal(snapshot.sourceState, "exact-version-complete-tag-set");
});

test("Planner 35 clears stairs only while stroller and provenance remain blocked", () => {
  assert.deepEqual(assessInteriorStairs("sdz-tiger-trail"), {
    status: "stairs-ready",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceFromNodeId: "7053320515",
    sourceToNodeId: "1619736626",
    stairs: false,
    strollerAuthorityState:
      "facility-permission-not-route-suitability",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("other objectives cannot inherit the Tiger Trail stairs result", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(interiorStairsForObjective(objective), undefined);
    assert.deepEqual(assessInteriorStairs(objective), {
      status: "blocked",
      reason: "OBJECTIVE_STAIRS_NOT_SOURCED",
      objectiveSourceRecordId: objective,
      globalEndpointSelection: "unresolved",
    });
  }
});

test("Planner 35 applicability evidence rejects source and semantic drift", () => {
  const urlDrift = mutableApplicability() as unknown as {
    sourceUrl: string;
  };
  urlDrift.sourceUrl = "https://example.com/guide";
  assert.throws(
    () =>
      assertInteriorStairsApplicabilityEvidenceIntegrity(
        urlDrift as unknown as InteriorStairsApplicabilityEvidence,
      ),
    /applicability evidence drifted/,
  );

  const routeDrift = mutableApplicability() as unknown as {
    zooAccessibilityMapMeaning: string;
  };
  routeDrift.zooAccessibilityMapMeaning = "general-map-only";
  assert.throws(
    () =>
      assertInteriorStairsApplicabilityEvidenceIntegrity(
        routeDrift as unknown as InteriorStairsApplicabilityEvidence,
      ),
    /applicability evidence drifted/,
  );
});

test("Planner 35 policy rejects absence inference or accessible-route applicability weakening", () => {
  const absencePolicy = mutablePolicy() as unknown as {
    absenceOfHighwayStepsAlone: string;
  };
  absencePolicy.absenceOfHighwayStepsAlone =
    "sufficient-for-stairs-false";
  assert.throws(
    () =>
      assertInteriorStairsPolicyIntegrity(
        absencePolicy as unknown as InteriorStairsPolicy,
      ),
    /stairs policy drifted/,
  );

  const applicabilityPolicy = mutablePolicy() as unknown as {
    zooRouteApplicabilityRequirement: string;
  };
  applicabilityPolicy.zooRouteApplicabilityRequirement =
    "map-label-alone-is-enough";
  assert.throws(
    () =>
      assertInteriorStairsPolicyIntegrity(
        applicabilityPolicy as unknown as InteriorStairsPolicy,
      ),
    /stairs policy drifted/,
  );

  const authority = mutableAuthority() as unknown as {
    adaStandardSection: string;
  };
  authority.adaStandardSection = "405";
  assert.throws(
    () =>
      assertInteriorStairsAuthorityIntegrity([
        authority as unknown as InteriorStairsAuthority,
      ]),
    /stairs authority drifted|no longer reproduces/,
  );
});

test("Planner 35 rejects stroller/provenance promotion and hidden or decorated fields", () => {
  const stroller = {
    ...mutableAuthority(),
    stroller: true,
  } as unknown as InteriorStairsAuthority;
  assert.throws(
    () => assertInteriorStairsAuthorityIntegrity([stroller]),
    /cannot contain unknown field stroller|cannot own field stroller/,
  );

  const hidden = mutableAuthority();
  Object.defineProperty(hidden, "provenance", {
    value: "complete",
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorStairsAuthorityIntegrity([hidden]),
    /cannot contain unknown field provenance/,
  );

  const symbol = mutableAuthority() as unknown as Record<PropertyKey, unknown>;
  symbol[Symbol("stairs")] = true;
  assert.throws(
    () =>
      assertInteriorStairsAuthorityIntegrity([
        symbol as unknown as InteriorStairsAuthority,
      ]),
    /cannot contain symbol fields/,
  );

  const decorated = [
    mutableAuthority(),
  ] as unknown as InteriorStairsAuthority[] & { stroller?: boolean };
  Object.defineProperty(decorated, "stroller", {
    value: true,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorStairsAuthorityIntegrity(decorated),
    /cannot contain extra own properties/,
  );
});

test("Planner 35 applicability evidence, policy, authority, and assessments are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_STAIRS_APPLICABILITY_EVIDENCE),
    true,
  );
  assert.equal(Object.isFrozen(INTERIOR_STAIRS_POLICY), true);
  assert.equal(Object.isFrozen(INTERIOR_STAIRS_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_STAIRS_AUTHORITY[0]), true);

  const assessment = assessInteriorStairs("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "stairs-ready") {
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
