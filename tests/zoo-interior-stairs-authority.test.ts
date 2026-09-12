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
  CORRIDOR_TERRAIN_EVIDENCE,
  classifyExactStairsAuthority,
} from "../src/data/zooIngressTerrainAuthority.ts";

function validInput() {
  return {
    exactWayHighway: "pedestrian",
    exactWaySurface: "asphalt",
    exactWayName: "Front Street",
    corridorName: "Front Street",
    accessible: true,
    wheelchairIndicator: "shown",
    mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
    corridorTerrain: "mild",
    corridorStairsEvidence: "not-explicitly-published",
    knownStairCorridorTerrain: "steep-and-stairs",
    knownStairCorridorStairsEvidence: "explicitly-published",
  };
}

function mutablePolicy() {
  return { ...INTERIOR_STAIRS_POLICY } as unknown as InteriorStairsPolicy;
}

function mutableAuthority() {
  return { ...INTERIOR_STAIRS_AUTHORITY[0] } as unknown as InteriorStairsAuthority;
}

test("Planner 35 maps the combined positive exact-way, wheelchair-corridor, and controlled-stairs contrast to stairs=false", () => {
  assert.deepEqual(classifyInteriorStairs(validInput()), {
    status: "supported",
    stairs: false,
    basis:
      "positive-pedestrian-asphalt-plus-exact-name-wheelchair-corridor-with-controlled-stairs-contrast",
  });
});

test("Planner 35 does not weaken Planner 18 absence-only stairs semantics", () => {
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

test("Planner 35 requires a positive pedestrian asphalt source-way classification", () => {
  for (const patch of [
    { exactWayHighway: "footway" },
    { exactWayHighway: "steps" },
    { exactWaySurface: "unknown" },
  ]) {
    assert.deepEqual(
      classifyInteriorStairs({ ...validInput(), ...patch }),
      {
        status: "blocked",
        reason:
          "EXACT_WAY_NOT_POSITIVE_NONSTEP_PEDESTRIAN_CLASSIFICATION",
      },
    );
  }
});

test("Planner 35 requires exact source-way and official corridor name identity", () => {
  assert.deepEqual(
    classifyInteriorStairs({
      ...validInput(),
      corridorName: "Treetops Way",
    }),
    {
      status: "blocked",
      reason: "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH",
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

test("Planner 35 requires Front Street mild terrain and the official controlled stairs contrast", () => {
  assert.deepEqual(
    classifyInteriorStairs({
      ...validInput(),
      corridorTerrain: "steep",
    }),
    {
      status: "blocked",
      reason: "CORRIDOR_TERRAIN_NOT_MAPPED_BY_POLICY",
    },
  );
  assert.deepEqual(
    classifyInteriorStairs({
      ...validInput(),
      knownStairCorridorStairsEvidence:
        "not-explicitly-published",
    }),
    {
      status: "blocked",
      reason: "CONTROLLED_STAIRS_CONTRAST_NOT_ESTABLISHED",
    },
  );
});

test("official map evidence distinguishes Front Street from an explicitly stair-bearing corridor", () => {
  const frontStreet = CORRIDOR_TERRAIN_EVIDENCE.find(
    (record) =>
      record.id ===
      "sdz-corridor-front-street-terrain-evidence",
  );
  const fernCanyon = CORRIDOR_TERRAIN_EVIDENCE.find(
    (record) =>
      record.id ===
      "sdz-corridor-fern-canyon-trail-terrain-evidence",
  );

  assert.ok(frontStreet);
  assert.equal(frontStreet.corridorName, "Front Street");
  assert.equal(frontStreet.publishedTerrain, "mild");
  assert.equal(
    frontStreet.stairsEvidence,
    "not-explicitly-published",
  );
  assert.ok(fernCanyon);
  assert.equal(fernCanyon.corridorName, "Fern Canyon Trail");
  assert.equal(
    fernCanyon.publishedTerrain,
    "steep-and-stairs",
  );
  assert.equal(
    fernCanyon.stairsEvidence,
    "explicitly-published",
  );
  assert.equal(frontStreet.artifactId, fernCanyon.artifactId);
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
});

test("Planner 35 stays attached to the complete version-pinned Planner 29 OSM tag snapshot", () => {
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

test("Planner 35 policy and authority reject weakening the evidence conjunction", () => {
  const policy = mutablePolicy() as unknown as {
    absenceOfHighwayStepsAlone: string;
  };
  policy.absenceOfHighwayStepsAlone = "sufficient-for-stairs-false";
  assert.throws(
    () =>
      assertInteriorStairsPolicyIntegrity(
        policy as unknown as InteriorStairsPolicy,
      ),
    /stairs policy drifted/,
  );

  const authority = mutableAuthority() as unknown as {
    exactWayHighway: string;
  };
  authority.exactWayHighway = "footway";
  assert.throws(
    () =>
      assertInteriorStairsAuthorityIntegrity([
        authority as unknown as InteriorStairsAuthority,
      ]),
    /stairs authority drifted|detached/,
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
