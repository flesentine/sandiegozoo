import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_DIFFICULTY_AUTHORITY,
  INTERIOR_DIFFICULTY_POLICY,
  assessInteriorDifficulty,
  assertInteriorDifficultyAuthorityIntegrity,
  assertInteriorDifficultyPolicyIntegrity,
  classifyNamedCorridorDifficulty,
  interiorDifficultyForObjective,
  type InteriorDifficultyAuthority,
  type InteriorDifficultyPolicy,
} from "../src/data/zooInteriorDifficultyAuthority.ts";
import {
  CORRIDOR_TERRAIN_EVIDENCE,
} from "../src/data/zooIngressTerrainAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "../src/data/zooInteriorPedestrianDirectionAuthority.ts";
import {
  INTERIOR_WALKING_DURATION_AUTHORITY,
} from "../src/data/zooInteriorWalkingDurationAuthority.ts";

function mutablePolicy() {
  return { ...INTERIOR_DIFFICULTY_POLICY } as unknown as InteriorDifficultyPolicy;
}

function mutableAuthority() {
  return { ...INTERIOR_DIFFICULTY_AUTHORITY[0] } as unknown as InteriorDifficultyAuthority;
}

test("Planner 32 maps only official mild terrain to Planner easy", () => {
  assert.deepEqual(
    classifyNamedCorridorDifficulty({
      publishedTerrain: "mild",
      corridorName: "Front Street",
      exactSourceWayName: "Front Street",
    }),
    {
      status: "supported",
      difficulty: "easy",
      basis: "official-mild-terrain-on-exact-name-matched-corridor",
    },
  );

  for (const publishedTerrain of ["mild-to-steep", "steep", "steep-and-stairs"]) {
    assert.deepEqual(
      classifyNamedCorridorDifficulty({
        publishedTerrain,
        corridorName: "Front Street",
        exactSourceWayName: "Front Street",
      }),
      { status: "blocked", reason: "TERRAIN_CLASS_NOT_MAPPED_BY_POLICY" },
    );
  }
});

test("Planner 32 requires exact source-way and official corridor name identity", () => {
  assert.deepEqual(
    classifyNamedCorridorDifficulty({
      publishedTerrain: "mild",
      corridorName: "Front Street",
      exactSourceWayName: "Treetops Way",
    }),
    { status: "blocked", reason: "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH" },
  );
});

test("Planner 32 is grounded in Planner 18 corridor terrain plus Planner 29 exact way name", () => {
  const authority = INTERIOR_DIFFICULTY_AUTHORITY[0];
  const corridor = CORRIDOR_TERRAIN_EVIDENCE.find(
    (record) => record.id === authority.corridorTerrainEvidenceId,
  );

  assert.ok(corridor);
  assert.equal(corridor.corridorId, "sdz-corridor-front-street");
  assert.equal(corridor.corridorName, "Front Street");
  assert.equal(corridor.publishedTerrain, "mild");
  assert.equal(corridor.scope, "named-corridor");
  assert.equal(corridor.plannerDifficultyAuthority, "source-terrain-only");
  assert.equal(INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.name, "Front Street");
  assert.equal(authority.sourceWayName, corridor.corridorName);
});

test("Planner 32 remains attached to the exact Planner 31 Tiger segment", () => {
  const authority = INTERIOR_DIFFICULTY_AUTHORITY[0];
  const duration = INTERIOR_WALKING_DURATION_AUTHORITY[0];

  assert.equal(authority.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(authority.durationAuthorityId, duration.id);
  assert.equal(authority.sourceWayId, duration.sourceWayId);
  assert.equal(authority.sourceFromNodeId, duration.sourceFromNodeId);
  assert.equal(authority.sourceToNodeId, duration.sourceToNodeId);
  assert.equal(authority.selectionScope, "objective-only");
  assert.equal(authority.globalEndpointSelection, "unresolved");
});

test("Planner 32 clears difficulty only and does not infer stairs=false from mild", () => {
  assert.deepEqual(assessInteriorDifficulty("sdz-tiger-trail"), {
    status: "difficulty-ready",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceFromNodeId: "7053320515",
    sourceToNodeId: "1619736626",
    difficulty: "easy",
    stairsAuthorityState: "independent-unresolved",
    operationalEligibility: "unresolved",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("other objectives cannot inherit Front Street easy difficulty", () => {
  for (const objective of ["sdz-koala-outback", "sdz-gorilla-tropics", "unknown-objective"]) {
    assert.equal(interiorDifficultyForObjective(objective), undefined);
    assert.deepEqual(assessInteriorDifficulty(objective), {
      status: "blocked",
      reason: "OBJECTIVE_DIFFICULTY_NOT_SOURCED",
      objectiveSourceRecordId: objective,
      globalEndpointSelection: "unresolved",
    });
  }
});

test("Planner 32 policy rejects a broader terrain mapping or stairs inference", () => {
  const terrain = mutablePolicy() as unknown as { supportedPublishedTerrain: string };
  terrain.supportedPublishedTerrain = "mild-to-steep";
  assert.throws(
    () => assertInteriorDifficultyPolicyIntegrity(terrain as unknown as InteriorDifficultyPolicy),
    /difficulty policy drifted/,
  );

  const stairs = mutablePolicy() as unknown as { stairsSemantics: string };
  stairs.stairsSemantics = "mild-implies-no-stairs";
  assert.throws(
    () => assertInteriorDifficultyPolicyIntegrity(stairs as unknown as InteriorDifficultyPolicy),
    /difficulty policy drifted/,
  );
});

test("Planner 32 authority rejects difficulty, corridor, and endpoint drift", () => {
  const difficulty = mutableAuthority() as unknown as { difficulty: string };
  difficulty.difficulty = "moderate";
  assert.throws(
    () => assertInteriorDifficultyAuthorityIntegrity([difficulty as unknown as InteriorDifficultyAuthority]),
    /difficulty authority drifted|does not reproduce/,
  );

  const corridor = mutableAuthority() as unknown as { corridorName: string };
  corridor.corridorName = "Treetops Way";
  assert.throws(
    () => assertInteriorDifficultyAuthorityIntegrity([corridor as unknown as InteriorDifficultyAuthority]),
    /difficulty authority drifted|detached from Planner 18|does not reproduce/,
  );

  const endpoint = mutableAuthority() as unknown as { sourceToNodeId: string };
  endpoint.sourceToNodeId = "6239154982";
  assert.throws(
    () => assertInteriorDifficultyAuthorityIntegrity([endpoint as unknown as InteriorDifficultyAuthority]),
    /difficulty authority drifted|detached from Planner 31/,
  );
});

test("Planner 32 rejects stairs or unrelated RouteEdge semantic promotion", () => {
  const stairs = {
    ...mutableAuthority(),
    stairs: false,
  } as unknown as InteriorDifficultyAuthority;
  assert.throws(
    () => assertInteriorDifficultyAuthorityIntegrity([stairs]),
    /cannot contain unknown field stairs|cannot own field stairs/,
  );

  const operational = mutableAuthority() as unknown as { operationalEligibility: string };
  operational.operationalEligibility = "open";
  assert.throws(
    () => assertInteriorDifficultyAuthorityIntegrity([operational as unknown as InteriorDifficultyAuthority]),
    /difficulty authority drifted/,
  );
});

test("Planner 32 runtime boundary rejects hidden aliases and decorated arrays", () => {
  const hidden = mutableAuthority();
  Object.defineProperty(hidden, "accessible", { value: true, enumerable: false });
  assert.throws(
    () => assertInteriorDifficultyAuthorityIntegrity([hidden]),
    /cannot contain unknown field accessible/,
  );

  const decorated = [mutableAuthority()] as unknown as InteriorDifficultyAuthority[] & { stairs?: boolean };
  Object.defineProperty(decorated, "stairs", { value: false, enumerable: false });
  assert.throws(
    () => assertInteriorDifficultyAuthorityIntegrity(decorated),
    /difficulty authority collection cannot contain extra own properties/,
  );
});

test("Planner 32 policy, authority, and assessments are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_DIFFICULTY_POLICY), true);
  assert.equal(Object.isFrozen(INTERIOR_DIFFICULTY_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_DIFFICULTY_AUTHORITY[0]), true);

  const assessment = assessInteriorDifficulty("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "difficulty-ready") {
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization), true);
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization.reasons), true);
  }
});
