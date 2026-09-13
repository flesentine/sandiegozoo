import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_STAIRS_AUTHORITY,
  INTERIOR_STAIRS_POLICY,
  assessInteriorStairs,
  assertInteriorStairsAuthorityIntegrity,
  assertInteriorStairsPolicyIntegrity,
  classifyInteriorStairs,
  interiorStairsForObjective,
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
    adaStandardReferenceUrl:
      "https://www.ada.gov/assets/pdfs/2010-design-standards.pdf",
    adaStandardSection: "402.2",
    accessibleRouteStairsSemantics:
      "stairs-not-an-accessible-route-component",
  };
}

function mutablePolicy() {
  return { ...INTERIOR_STAIRS_POLICY } as unknown as InteriorStairsPolicy;
}

function mutableAuthority() {
  return { ...INTERIOR_STAIRS_AUTHORITY[0] } as unknown as InteriorStairsAuthority;
}

test("Planner 35 maps the already-qualified exact accessible route plus ADA 402.2 semantics to stairs=false", () => {
  assert.deepEqual(classifyInteriorStairs(validInput()), {
    status: "supported",
    stairs: false,
    basis:
      "qualified-exact-accessible-route-plus-ada-402-2-no-stairs-component-semantic",
  });
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

test("Planner 35 requires the exact DOJ ADA accessible-route semantic reference", () => {
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

  assert.equal(
    INTERIOR_STAIRS_POLICY.adaStandardReferenceUrl,
    "https://www.ada.gov/assets/pdfs/2010-design-standards.pdf",
  );
  assert.equal(INTERIOR_STAIRS_POLICY.adaStandardSection, "402.2");
  assert.equal(
    INTERIOR_STAIRS_POLICY.accessibleRouteStairsSemantics,
    "stairs-not-an-accessible-route-component",
  );
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

test("Planner 35 policy rejects absence inference or semantic-standard weakening", () => {
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

  const semanticPolicy = mutablePolicy() as unknown as {
    accessibleRouteStairsSemantics: string;
  };
  semanticPolicy.accessibleRouteStairsSemantics =
    "stairs-may-be-an-accessible-route-component";
  assert.throws(
    () =>
      assertInteriorStairsPolicyIntegrity(
        semanticPolicy as unknown as InteriorStairsPolicy,
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

test("Planner 35 policy, authority, and assessments are deeply immutable", () => {
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
