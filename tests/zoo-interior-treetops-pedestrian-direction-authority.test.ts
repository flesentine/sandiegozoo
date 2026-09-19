import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY,
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_POLICY,
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
  assessInteriorTreetopsPedestrianDirection,
  interiorTreetopsPedestrianDirectionForObjective,
} from "../src/data/zooInteriorTreetopsPedestrianDirectionAuthority.ts";
import { INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY } from "../src/data/zooInteriorTreetopsV7GeometryAuthority.ts";
import { INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY } from "../src/data/zooInteriorTreetopsSegmentDistanceAuthority.ts";

test("Planner 47 captures the complete exact Treetops v7 tag set", () => {
  const snapshot = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;

  assert.equal(snapshot.sourceWayId, "148910139");
  assert.equal(snapshot.sourceWayVersion, 7);
  assert.equal(snapshot.sourceWayTimestamp, "2026-02-21T20:28:40Z");
  assert.equal(snapshot.sourceWayChangeset, 178875711);
  assert.deepEqual(snapshot.sourceTagKeys, ["highway", "name", "surface"]);
  assert.deepEqual(snapshot.sourceTags, {
    highway: "footway",
    name: "Treetops Way",
    surface: "concrete",
  });
  assert.equal(snapshot.onewayTag, null);
  assert.equal(snapshot.onewayFootTag, null);
  assert.equal(snapshot.sourceState, "exact-version-complete-tag-set");
});

test("Planner 47 source snapshot remains attached to Planner 43 exact geometry", () => {
  const snapshot = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];

  assert.equal(snapshot.sourceWayId, geometry.sourceWayId);
  assert.equal(snapshot.sourceWayVersion, geometry.sourceWayVersion);
  assert.equal(snapshot.sourceWayVersionUrl, geometry.sourceWayVersionUrl);
  assert.equal(snapshot.sourceWayTimestamp, geometry.sourceWayTimestamp);
  assert.equal(snapshot.sourceWayChangeset, geometry.sourceWayChangeset);
  assert.equal(snapshot.sourceTags.highway, geometry.sourceHighway);
  assert.equal(snapshot.sourceTags.name, geometry.sourceName);
  assert.equal(snapshot.sourceTags.surface, geometry.sourceSurface);
});

test("Planner 47 qualifies a static bidirectional pedestrian baseline", () => {
  const policy = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_POLICY;
  const direction = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY[0];

  assert.equal(policy.pedestrianOneWayAuthority, "explicit-oneway-foot-only");
  assert.equal(
    policy.absentExplicitPedestrianRestriction,
    "bidirectional-by-default",
  );
  assert.equal(direction.oneWay, false);
  assert.equal(direction.direction, "bidirectional");
  assert.equal(
    direction.resolutionBasis,
    "highway-footway-without-explicit-pedestrian-oneway",
  );
  assert.equal(direction.sourceWayOrderRole, "geometry-only-not-direction-authority");
  assert.equal(direction.directionScope, "static-osm-baseline");
});

test("Planner 47 remains attached to Planner 46 exact segment", () => {
  const direction = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY[0];
  const distance = INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0];

  assert.equal(direction.distanceAuthorityId, distance.id);
  assert.equal(direction.objectiveSourceRecordId, distance.objectiveSourceRecordId);
  assert.equal(direction.sourceWayId, distance.sourceWayId);
  assert.equal(direction.sourceWayVersion, distance.sourceWayVersion);
  assert.equal(direction.sourceFromNodeId, distance.sourceFromNodeId);
  assert.equal(direction.sourceToNodeId, distance.sourceToNodeId);
  assert.equal(distance.distanceMeters, 48.615);
});

test("Planner 47 clears direction only", () => {
  assert.deepEqual(assessInteriorTreetopsPedestrianDirection("sdz-tiger-trail"), {
    status: "direction-ready",
    authorityId: "sdz-interior-treetops-anchor-to-fern-canyon-direction",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "148910139",
    sourceWayVersion: 7,
    sourceFromNodeId: "1619736626",
    sourceToNodeId: "13588159626",
    oneWay: false,
    direction: "bidirectional",
    directionScope: "static-osm-baseline",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_DURATION_NOT_QUALIFIED",
        "EXACT_SEGMENT_DIFFICULTY_NOT_QUALIFIED",
        "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
        "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 47 does not leak Treetops direction to other objectives", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(interiorTreetopsPedestrianDirectionForObjective(objective), undefined);
    assert.deepEqual(assessInteriorTreetopsPedestrianDirection(objective), {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_PEDESTRIAN_DIRECTION_NOT_SOURCED",
      objectiveSourceRecordId: objective,
    });
  }
});

test("Planner 47 direction authority owns no downstream route semantics", () => {
  const authority =
    INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY[0] as unknown as Record<string, unknown>;

  for (const field of [
    "mode",
    "distanceMeters",
    "durationMinutes",
    "difficulty",
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

test("Planner 47 exports and assessments are deeply immutable", () => {
  const snapshot = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
  const policy = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_POLICY;
  const authorities = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY;

  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.sourceTagKeys), true);
  assert.equal(Object.isFrozen(snapshot.sourceTags), true);
  assert.equal(Object.isFrozen(policy), true);
  assert.equal(Object.isFrozen(policy.semanticReferenceUrls), true);
  assert.equal(Object.isFrozen(authorities), true);
  assert.equal(Object.isFrozen(authorities[0]), true);

  const assessment = assessInteriorTreetopsPedestrianDirection("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "direction-ready") {
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
  }
});
