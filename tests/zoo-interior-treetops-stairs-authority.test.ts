import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyExactStairsAuthority,
} from "../src/data/zooIngressTerrainAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "../src/data/zooInteriorTreetopsPedestrianDirectionAuthority.ts";
import {
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY,
} from "../src/data/zooInteriorTreetopsAccessibilityAuthority.ts";
import {
  INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY,
} from "../src/data/zooInteriorTreetopsOperationalStatusAuthority.ts";
import {
  INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT,
  assessInteriorTreetopsStairs,
  interiorTreetopsStairsAuditForObjective,
} from "../src/data/zooInteriorTreetopsStairsAuthority.ts";

test("Planner 52 exact Treetops source remains non-authoritative for stairs=false", () => {
  const source =
    INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;

  assert.deepEqual(
    classifyExactStairsAuthority({
      id: source.id,
      sourceTags: source.sourceTags,
    }),
    {
      status: "blocked",
      reason: "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
      basis: "Planner 18 stairs authority",
      sourceSnapshotId: source.id,
    },
  );
});

test("Planner 52 preserves accessibility and operational linkage", () => {
  const audit = INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT[0];
  const accessibility = INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0];
  const operational =
    INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0];

  assert.equal(audit.accessibilityAuthorityId, accessibility.id);
  assert.equal(audit.operationalStatusAuthorityId, operational.id);

  for (const upstream of [accessibility, operational]) {
    assert.equal(
      upstream.objectiveSourceRecordId,
      audit.objectiveSourceRecordId,
    );
    assert.equal(upstream.sourceWayId, audit.sourceWayId);
    assert.equal(upstream.sourceFromNodeId, audit.sourceFromNodeId);
    assert.equal(upstream.sourceToNodeId, audit.sourceToNodeId);
  }
});

test("Planner 52 does not infer no stairs from footway, concrete, mild, or accessibility", () => {
  const audit = INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT[0];

  assert.equal(audit.exactWayHighway, "footway");
  assert.equal(audit.exactWaySurface, "concrete");
  assert.equal(audit.exactWayHighwayStepsState, "not-present");
  assert.equal(audit.corridorTerrain, "mild");
  assert.equal(
    audit.corridorStairsEvidence,
    "not-explicitly-published",
  );
  assert.equal(
    audit.accessibilityState,
    "accessible-true-stairs-independent-unresolved",
  );
  assert.equal(audit.directStairFreeEvidence, "not-sourced");
  assert.equal(audit.stairs, "unknown");
});

test("Planner 52 freezes the exact unresolved stairs blocker", () => {
  assert.deepEqual(assessInteriorTreetopsStairs("sdz-tiger-trail"), {
    status: "blocked",
    reason: "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    objectiveSourceRecordId: "sdz-tiger-trail",
    evidenceAuditId:
      "sdz-interior-treetops-anchor-to-fern-canyon-stairs-evidence-audit",
    sourceWayId: "148910139",
    sourceWayVersion: 7,
    sourceFromNodeId: "1619736626",
    sourceToNodeId: "13588159626",
    stairs: "unknown",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 52 does not leak stairs audit to other objectives", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(
      interiorTreetopsStairsAuditForObjective(objective),
      undefined,
    );
    assert.deepEqual(assessInteriorTreetopsStairs(objective), {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_STAIRS_NOT_SOURCED",
      objectiveSourceRecordId: objective,
    });
  }
});

test("Planner 52 exports and assessments are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT[0]),
    true,
  );

  const assessment = assessInteriorTreetopsStairs("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if ("routeGraphExpansion" in assessment) {
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(
      Object.isFrozen(assessment.routeGraphExpansion.reasons),
      true,
    );
  }
});
