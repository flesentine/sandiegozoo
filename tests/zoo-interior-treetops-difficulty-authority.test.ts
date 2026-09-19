import assert from "node:assert/strict";
import test from "node:test";
import {
  CORRIDOR_TERRAIN_EVIDENCE,
} from "../src/data/zooIngressTerrainAuthority.ts";
import {
  INTERIOR_DIFFICULTY_POLICY,
  classifyNamedCorridorDifficulty,
} from "../src/data/zooInteriorDifficultyAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "../src/data/zooInteriorTreetopsPedestrianDirectionAuthority.ts";
import {
  INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY,
} from "../src/data/zooInteriorTreetopsWalkingDurationAuthority.ts";
import {
  INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY,
  assessInteriorTreetopsDifficulty,
  interiorTreetopsDifficultyForObjective,
} from "../src/data/zooInteriorTreetopsDifficultyAuthority.ts";

test("Planner 49 uses official Treetops Way mild terrain evidence", () => {
  const corridor = CORRIDOR_TERRAIN_EVIDENCE.find(
    (entry) => entry.id === "sdz-corridor-treetops-way-terrain-evidence",
  );
  assert.ok(corridor);
  assert.equal(corridor.corridorId, "sdz-corridor-treetops-way");
  assert.equal(corridor.corridorName, "Treetops Way");
  assert.equal(corridor.publishedTerrain, "mild");
  assert.equal(corridor.stairsEvidence, "not-explicitly-published");
  assert.equal(corridor.plannerDifficultyAuthority, "source-terrain-only");
});

test("Planner 49 exact source-way name matches the official corridor name", () => {
  const snapshot =
    INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
  const corridor = CORRIDOR_TERRAIN_EVIDENCE.find(
    (entry) => entry.id === "sdz-corridor-treetops-way-terrain-evidence",
  );
  assert.ok(corridor);
  assert.equal(snapshot.sourceTags.name, corridor.corridorName);
  assert.equal(snapshot.sourceWayId, "148910139");
  assert.equal(snapshot.sourceWayVersion, 7);
});

test("Planner 49 reuses the shared mild-to-easy exact-name policy", () => {
  const policy = INTERIOR_DIFFICULTY_POLICY;
  assert.equal(policy.scope, "exact-segments-with-exact-named-corridor-match");
  assert.equal(policy.supportedPublishedTerrain, "mild");
  assert.equal(policy.plannerDifficulty, "easy");
  assert.equal(policy.stairsSemantics, "independent-not-inferred-from-mild");

  assert.deepEqual(
    classifyNamedCorridorDifficulty({
      publishedTerrain: "mild",
      corridorName: "Treetops Way",
      exactSourceWayName: "Treetops Way",
    }),
    {
      status: "supported",
      difficulty: "easy",
      basis: "official-mild-terrain-on-exact-name-matched-corridor",
    },
  );
});

test("Planner 49 refuses name mismatch and unmapped terrain", () => {
  assert.deepEqual(
    classifyNamedCorridorDifficulty({
      publishedTerrain: "mild",
      corridorName: "Treetops Way",
      exactSourceWayName: "Treetops Trail",
    }),
    {
      status: "blocked",
      reason: "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH",
    },
  );

  assert.deepEqual(
    classifyNamedCorridorDifficulty({
      publishedTerrain: "steep",
      corridorName: "Treetops Way",
      exactSourceWayName: "Treetops Way",
    }),
    {
      status: "blocked",
      reason: "TERRAIN_CLASS_NOT_MAPPED_BY_POLICY",
    },
  );
});

test("Planner 49 remains attached to Planner 48 exact segment", () => {
  const authority = INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY[0];
  const duration = INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0];

  assert.equal(authority.durationAuthorityId, duration.id);
  assert.equal(authority.objectiveSourceRecordId, duration.objectiveSourceRecordId);
  assert.equal(authority.sourceWayId, duration.sourceWayId);
  assert.equal(authority.sourceWayVersion, duration.sourceWayVersion);
  assert.equal(authority.sourceFromNodeId, duration.sourceFromNodeId);
  assert.equal(authority.sourceToNodeId, duration.sourceToNodeId);
});

test("Planner 49 qualifies easy without inferring stairs", () => {
  const authority = INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY[0];

  assert.equal(authority.publishedTerrain, "mild");
  assert.equal(authority.difficulty, "easy");
  assert.equal(
    authority.resolutionBasis,
    "official-mild-terrain-on-exact-name-matched-corridor",
  );
  assert.equal(authority.stairsAuthorityState, "independent-unresolved");
  assert.equal(authority.operationalEligibility, "unresolved");
});

test("Planner 49 clears difficulty only", () => {
  assert.deepEqual(assessInteriorTreetopsDifficulty("sdz-tiger-trail"), {
    status: "difficulty-ready",
    authorityId: "sdz-interior-treetops-anchor-to-fern-canyon-difficulty",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "148910139",
    sourceWayVersion: 7,
    sourceFromNodeId: "1619736626",
    sourceToNodeId: "13588159626",
    difficulty: "easy",
    stairsAuthorityState: "independent-unresolved",
    operationalEligibility: "unresolved",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
        "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 49 does not leak difficulty to other objectives", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(interiorTreetopsDifficultyForObjective(objective), undefined);
    assert.deepEqual(assessInteriorTreetopsDifficulty(objective), {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_DIFFICULTY_NOT_SOURCED",
      objectiveSourceRecordId: objective,
    });
  }
});

test("Planner 49 authority owns no downstream route semantics", () => {
  const authority =
    INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY[0] as unknown as Record<string, unknown>;

  for (const field of [
    "mode",
    "distanceMeters",
    "durationMinutes",
    "oneWay",
    "direction",
    "stairs",
    "accessible",
    "stroller",
    "status",
    "routeNodeId",
    "routeEdgeId",
  ]) {
    assert.equal(Object.hasOwn(authority, field), false);
  }
});

test("Planner 49 exports and assessments are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY[0]), true);

  const assessment = assessInteriorTreetopsDifficulty("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "difficulty-ready") {
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
  }
});
