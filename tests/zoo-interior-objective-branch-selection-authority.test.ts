import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
  assessInteriorObjectiveBranchSelection,
  assertInteriorObjectiveBranchSelectionAuthorityIntegrity,
  objectiveScopedFrontStreetBranchSelectionFor,
  type InteriorObjectiveBranchSelectionAuthority,
} from "../src/data/zooInteriorObjectiveBranchSelectionAuthority.ts";
import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "../src/data/zooInteriorFrontStreetGeometryAuthority.ts";
import {
  PUBLISHED_WALKING_CORRIDORS,
} from "../src/data/zooMapAuthority.ts";

function mutableClone() {
  return {
    ...INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0],
  } as unknown as InteriorObjectiveBranchSelectionAuthority;
}

test("Planner 27 selects the Treetops candidate only for the Tiger Trail objective", () => {
  const selection = INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0];
  const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];

  assert.equal(INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY.length, 1);
  assert.equal(selection.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(selection.officialCorridorId, "sdz-corridor-treetops-way");
  assert.equal(selection.officialCorridorRelation, "access");
  assert.equal(selection.selectedCandidateNodeId, "1619736626");
  assert.equal(selection.selectedConnectorWayId, "148910139");
  assert.equal(selection.selectedConnectorName, "Treetops Way");
  assert.equal(selection.selectionScope, "objective-only");
  assert.equal(geometry.endpointSelection, "unresolved");
});

test("Planner 27 is linked to the exact official Treetops Way access relation", () => {
  const selection = INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0];
  const corridor = PUBLISHED_WALKING_CORRIDORS.find(
    (entry) => entry.id === selection.officialCorridorId,
  );

  assert.ok(corridor);
  assert.equal(corridor.name, "Treetops Way");
  assert.equal(corridor.artifactId, "sdz-map-2026-01-05-accessibility");
  assert.deepEqual(
    corridor.sourceRecordRelations,
    [{ sourceRecordId: "sdz-tiger-trail", relation: "access" }],
  );
});

test("Planner 27 does not globalize the Tiger Trail branch decision", () => {
  const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const assessment = assessInteriorObjectiveBranchSelection("sdz-tiger-trail");

  assert.equal(geometry.endpointSelection, "unresolved");
  assert.deepEqual(
    geometry.adjacentJunctionCandidates.map(
      (candidate) => candidate.node.sourceObjectId,
    ),
    ["1619736626", "6239154982"],
  );
  assert.equal(assessment.status, "objective-branch-selected");
  if (assessment.status === "objective-branch-selected") {
    assert.equal(assessment.selectionScope, "objective-only");
    assert.equal(assessment.globalEndpointSelection, "unresolved");
    assert.equal(assessment.selectedCandidateNodeId, "1619736626");
  }
});

test("Planner 27 keeps exact segment materialization blocked after objective branch selection", () => {
  const assessment = assessInteriorObjectiveBranchSelection("sdz-tiger-trail");

  assert.deepEqual(assessment, {
    status: "objective-branch-selected",
    objectiveSourceRecordId: "sdz-tiger-trail",
    selectedCandidateNodeId: "1619736626",
    selectedConnectorWayId: "148910139",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_MODE_NOT_SOURCED",
        "EXACT_SEGMENT_DISTANCE_NOT_SOURCED",
        "EXACT_SEGMENT_DURATION_NOT_SOURCED",
        "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        "EXACT_SEGMENT_PEDESTRIAN_DIRECTION_NOT_SOURCED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("other objectives fail closed instead of inheriting Tiger Trail branch authority", () => {
  for (const objectiveSourceRecordId of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(
      objectiveScopedFrontStreetBranchSelectionFor(objectiveSourceRecordId),
      undefined,
    );
    assert.deepEqual(
      assessInteriorObjectiveBranchSelection(objectiveSourceRecordId),
      {
        status: "blocked",
        reason: "OBJECTIVE_BRANCH_AUTHORITY_NOT_SOURCED",
        objectiveSourceRecordId,
        globalEndpointSelection: "unresolved",
      },
    );
  }
});

test("Planner 27 integrity rejects objective or selected-branch drift", () => {
  const wrongObjective = mutableClone();
  (wrongObjective as { objectiveSourceRecordId: string }).objectiveSourceRecordId =
    "sdz-koala-outback";
  assert.throws(
    () => assertInteriorObjectiveBranchSelectionAuthorityIntegrity([wrongObjective]),
    /drifted from the frozen decision contract|source-backed Tiger Trail record/,
  );

  const wrongBranch = mutableClone();
  (wrongBranch as { selectedCandidateNodeId: string }).selectedCandidateNodeId =
    "6239154982";
  assert.throws(
    () => assertInteriorObjectiveBranchSelectionAuthorityIntegrity([wrongBranch]),
    /drifted from the frozen decision contract|selected branch drifted/,
  );
});

test("Planner 27 runtime boundary rejects hidden aliases and routing-field smuggling", () => {
  const hidden = mutableClone() as InteriorObjectiveBranchSelectionAuthority & {
    exactSegmentDistanceMeters?: number;
  };
  Object.defineProperty(hidden, "exactSegmentDistanceMeters", {
    value: 7,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorObjectiveBranchSelectionAuthorityIntegrity([hidden]),
    /cannot contain unknown field exactSegmentDistanceMeters/,
  );

  const routeField = {
    ...mutableClone(),
    distanceMeters: 7,
  } as unknown as InteriorObjectiveBranchSelectionAuthority;
  assert.throws(
    () => assertInteriorObjectiveBranchSelectionAuthorityIntegrity([routeField]),
    /cannot contain unknown field distanceMeters|cannot materialize routing field distanceMeters/,
  );

  const globalEndpoint = {
    ...mutableClone(),
    globalEndpointNodeId: "1619736626",
  } as unknown as InteriorObjectiveBranchSelectionAuthority;
  assert.throws(
    () => assertInteriorObjectiveBranchSelectionAuthorityIntegrity([globalEndpoint]),
    /cannot contain unknown field globalEndpointNodeId|cannot materialize routing field globalEndpointNodeId/,
  );
});

test("Planner 27 validates the outer authority collection exactly", () => {
  const decorated = [mutableClone()] as unknown as InteriorObjectiveBranchSelectionAuthority[] & {
    selectedForAllObjectives?: boolean;
  };
  Object.defineProperty(decorated, "selectedForAllObjectives", {
    value: true,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorObjectiveBranchSelectionAuthorityIntegrity(decorated),
    /objective branch authority collection cannot contain extra own properties/,
  );

  const arrayLike = {
    0: mutableClone(),
    length: 1,
  } as unknown as readonly InteriorObjectiveBranchSelectionAuthority[];
  assert.throws(
    () => assertInteriorObjectiveBranchSelectionAuthorityIntegrity(arrayLike),
    /objective branch authority collection must be an ordinary array of length 1/,
  );
});

test("Planner 27 authority and assessments are deeply immutable", () => {
  const authority = INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0];
  assert.equal(Object.isFrozen(INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY), true);
  assert.equal(Object.isFrozen(authority), true);

  const selected = assessInteriorObjectiveBranchSelection("sdz-tiger-trail");
  assert.equal(Object.isFrozen(selected), true);
  if (selected.status === "objective-branch-selected") {
    assert.equal(Object.isFrozen(selected.exactSegmentMaterialization), true);
    assert.equal(Object.isFrozen(selected.exactSegmentMaterialization.reasons), true);
  }

  const blocked = assessInteriorObjectiveBranchSelection("sdz-koala-outback");
  assert.equal(Object.isFrozen(blocked), true);
});
