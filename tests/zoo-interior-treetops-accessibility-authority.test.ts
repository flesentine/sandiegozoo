import assert from "node:assert/strict";
import test from "node:test";
import {
  OFFICIAL_ZOO_MAP_ARTIFACTS,
  PUBLISHED_WALKING_CORRIDORS,
} from "../src/data/zooMapAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_POLICY,
  classifyNamedCorridorAccessibility,
} from "../src/data/zooInteriorAccessibilityAuthority.ts";
import {
  INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY,
} from "../src/data/zooInteriorTreetopsDifficultyAuthority.ts";
import {
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY,
  INTERIOR_TREETOPS_ACCESSIBILITY_EVIDENCE,
  assessInteriorTreetopsAccessibility,
  interiorTreetopsAccessibilityForObjective,
} from "../src/data/zooInteriorTreetopsAccessibilityAuthority.ts";

test("Planner 50 freezes the official Treetops Way wheelchair evidence", () => {
  const evidence = INTERIOR_TREETOPS_ACCESSIBILITY_EVIDENCE;
  const map = OFFICIAL_ZOO_MAP_ARTIFACTS.find(
    (entry) => entry.id === "sdz-map-2026-01-05-accessibility",
  );
  const corridor = PUBLISHED_WALKING_CORRIDORS.find(
    (entry) => entry.id === "sdz-corridor-treetops-way",
  );

  assert.ok(map);
  assert.ok(corridor);
  assert.equal(evidence.sourceUrl, map.sourceUrl);
  assert.equal(evidence.observedAt, map.observedAt);
  assert.equal(evidence.corridorName, corridor.name);
  assert.equal(evidence.publishedWalkMinutes, corridor.publishedWalkMinutes);
  assert.equal(evidence.publishedTerrain, corridor.terrain);
  assert.equal(evidence.wheelchairIndicator, "shown");
  assert.equal(evidence.mapRouteLegend, "ADA MOST ACCESSIBLE ROUTE");
  assert.equal(evidence.walkingGuideLabel, "TREETOPS WAY");
});

test("Planner 50 reuses the shared exact-name accessibility policy", () => {
  const policy = INTERIOR_ACCESSIBILITY_POLICY;
  assert.equal(
    policy.scope,
    "exact-segments-with-exact-named-accessibility-corridor-match",
  );
  assert.equal(policy.supportedWheelchairIndicator, "shown");
  assert.equal(policy.supportedMapRouteLegend, "ADA MOST ACCESSIBLE ROUTE");
  assert.equal(policy.plannerAccessible, true);
  assert.equal(policy.stairsSemantics, "independent-unresolved");

  assert.deepEqual(
    classifyNamedCorridorAccessibility({
      corridorName: "Treetops Way",
      exactSourceWayName: "Treetops Way",
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

test("Planner 50 refuses a source-way name mismatch", () => {
  assert.deepEqual(
    classifyNamedCorridorAccessibility({
      corridorName: "Treetops Way",
      exactSourceWayName: "Treetops Trail",
      wheelchairIndicator: "shown",
      mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
    }),
    {
      status: "blocked",
      reason: "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH",
    },
  );
});

test("Planner 50 remains attached to Planner 49 exact segment", () => {
  const authority = INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0];
  const difficulty = INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY[0];

  assert.equal(authority.difficultyAuthorityId, difficulty.id);
  assert.equal(authority.objectiveSourceRecordId, difficulty.objectiveSourceRecordId);
  assert.equal(authority.corridorId, difficulty.corridorId);
  assert.equal(authority.corridorName, difficulty.corridorName);
  assert.equal(authority.sourceWayId, difficulty.sourceWayId);
  assert.equal(authority.sourceWayVersion, difficulty.sourceWayVersion);
  assert.equal(authority.sourceFromNodeId, difficulty.sourceFromNodeId);
  assert.equal(authority.sourceToNodeId, difficulty.sourceToNodeId);
});

test("Planner 50 qualifies accessibility without inferring stairs or stroller", () => {
  const authority = INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0];

  assert.equal(authority.accessible, true);
  assert.equal(
    authority.resolutionBasis,
    "official-wheelchair-indicator-on-exact-name-matched-ada-corridor",
  );
  assert.equal(authority.stairsAuthorityState, "independent-unresolved");
  assert.equal(
    authority.strollerAuthorityState,
    "facility-permission-not-route-suitability",
  );
  assert.equal(authority.operationalEligibility, "unresolved");
});

test("Planner 50 clears accessibility only", () => {
  assert.deepEqual(assessInteriorTreetopsAccessibility("sdz-tiger-trail"), {
    status: "accessibility-ready",
    authorityId: "sdz-interior-treetops-anchor-to-fern-canyon-accessibility",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "148910139",
    sourceWayVersion: 7,
    sourceFromNodeId: "1619736626",
    sourceToNodeId: "13588159626",
    accessible: true,
    stairsAuthorityState: "independent-unresolved",
    strollerAuthorityState:
      "facility-permission-not-route-suitability",
    operationalEligibility: "unresolved",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
        "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 50 does not leak accessibility to other objectives", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(
      interiorTreetopsAccessibilityForObjective(objective),
      undefined,
    );
    assert.deepEqual(assessInteriorTreetopsAccessibility(objective), {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_ACCESSIBILITY_NOT_SOURCED",
      objectiveSourceRecordId: objective,
    });
  }
});

test("Planner 50 authority owns no downstream route semantics", () => {
  const authority =
    INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0] as unknown as Record<string, unknown>;

  for (const field of [
    "mode",
    "distanceMeters",
    "durationMinutes",
    "oneWay",
    "direction",
    "difficulty",
    "stairs",
    "stroller",
    "status",
    "routeNodeId",
    "routeEdgeId",
  ]) {
    assert.equal(Object.hasOwn(authority, field), false);
  }
});

test("Planner 50 exports and assessments are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_ACCESSIBILITY_EVIDENCE), true);
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY), true);
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0]),
    true,
  );

  const assessment = assessInteriorTreetopsAccessibility("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "accessibility-ready") {
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
  }
});
