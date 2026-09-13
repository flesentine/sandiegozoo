import assert from "node:assert/strict";
import test from "node:test";

import {
  INTERIOR_PROVENANCE_AUTHORITY,
  assessInteriorProvenance,
  assertInteriorProvenanceAuthorityIntegrity,
} from "../src/data/zooInteriorProvenanceAuthority.ts";
import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "../src/data/zooInteriorFrontStreetGeometryAuthority.ts";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
} from "../src/data/zooInteriorObjectiveBranchSelectionAuthority.ts";
import {
  INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY,
} from "../src/data/zooInteriorObjectiveSegmentDistanceAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY,
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "../src/data/zooInteriorPedestrianDirectionAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_MODE_AUTHORITY,
} from "../src/data/zooInteriorPedestrianModeAuthority.ts";
import {
  INTERIOR_WALKING_DURATION_AUTHORITY,
} from "../src/data/zooInteriorWalkingDurationAuthority.ts";
import {
  INTERIOR_DIFFICULTY_AUTHORITY,
} from "../src/data/zooInteriorDifficultyAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
} from "../src/data/zooInteriorAccessibilityAuthority.ts";
import {
  INTERIOR_OPERATIONAL_STATUS_AUTHORITY,
} from "../src/data/zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_STAIRS_EVIDENCE_AUDIT,
} from "../src/data/zooInteriorStairsAuthority.ts";
import {
  INTERIOR_STROLLER_EVIDENCE_AUDIT,
} from "../src/data/zooInteriorStrollerAuthority.ts";

test("Planner 37 completes provenance for the exact Tiger Trail Front Street segment", () => {
  const result = assessInteriorProvenance("sdz-tiger-trail");

  assert.equal(result.status, "provenance-ready");
  if (result.status !== "provenance-ready") {
    assert.fail("Tiger Trail provenance unexpectedly blocked");
  }

  assert.equal(result.sourceFromNodeId, "7053320515");
  assert.equal(result.sourceToNodeId, "1619736626");
  assert.equal(result.provenance.confidence, "provisional");
  assert.deepEqual(
    result.exactSegmentMaterialization.reasons,
    [
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
    ],
  );
  assert.equal(
    result.exactSegmentMaterialization.reasons.includes(
      "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE" as never,
    ),
    false,
  );
});

test("Planner 37 pins provenance to the exact OSM way version snapshot", () => {
  const authority = INTERIOR_PROVENANCE_AUTHORITY;
  const snapshot = INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;

  assert.equal(authority.sourceWayId, "1481425058");
  assert.equal(authority.sourceWayVersion, 1);
  assert.equal(
    authority.sourceWayVersionUrl,
    "https://api.openstreetmap.org/api/0.6/way/1481425058/1",
  );
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T14:47:49Z");
  assert.equal(authority.sourceWayChangeset, 178862584);
  assert.equal(authority.sourceObservedAt, "2026-09-10T23:02:16-07:00");
  assert.equal(authority.sourceWayVersionUrl, snapshot.sourceWayVersionUrl);
  assert.equal(authority.sourceObservedAt, snapshot.observedAt);
  assert.equal(snapshot.sourceState, "exact-version-complete-tag-set");
});

test("Planner 37 emits conservative SourceProvenance instead of verified confidence", () => {
  const provenance = INTERIOR_PROVENANCE_AUTHORITY.provenance;

  assert.deepEqual({ ...provenance }, {
    sourceUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481425058/1",
    sourceLabel:
      "OpenStreetMap way 1481425058 v1 with WildRoute exact-segment semantic lineage",
    lastVerified: "2026-09-10T23:02:16-07:00",
    confidence: "provisional",
    effectiveFrom: "2026-09-10",
  });
  assert.equal(
    INTERIOR_PROVENANCE_AUTHORITY.confidenceRationale,
    "provenance-complete-while-stairs-and-stroller-remain-unresolved",
  );
  assert.notEqual(provenance.confidence, "verified");
});

test("Planner 37 lineage spans every qualified interior authority through Planner 36", () => {
  const lineage = INTERIOR_PROVENANCE_AUTHORITY.lineage;

  assert.equal(
    lineage.geometryAuthorityId,
    INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0]!.id,
  );
  assert.equal(
    lineage.branchSelectionAuthorityId,
    INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0]!.id,
  );
  assert.equal(
    lineage.distanceAuthorityId,
    INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0]!.id,
  );
  assert.equal(
    lineage.directionSourceSnapshotId,
    INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.id,
  );
  assert.equal(
    lineage.directionAuthorityId,
    INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY[0]!.id,
  );
  assert.equal(
    lineage.modeAuthorityId,
    INTERIOR_PEDESTRIAN_MODE_AUTHORITY[0]!.id,
  );
  assert.equal(
    lineage.durationAuthorityId,
    INTERIOR_WALKING_DURATION_AUTHORITY[0]!.id,
  );
  assert.equal(
    lineage.difficultyAuthorityId,
    INTERIOR_DIFFICULTY_AUTHORITY[0]!.id,
  );
  assert.equal(
    lineage.accessibilityAuthorityId,
    INTERIOR_ACCESSIBILITY_AUTHORITY[0]!.id,
  );
  assert.equal(
    lineage.operationalStatusAuthorityId,
    INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0]!.id,
  );
  assert.equal(
    lineage.stairsEvidenceAuditId,
    INTERIOR_STAIRS_EVIDENCE_AUDIT[0]!.id,
  );
  assert.equal(
    lineage.strollerEvidenceAuditId,
    INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!.id,
  );
});

test("Planner 37 preserves the unresolved stairs and stroller evidence boundaries", () => {
  const stairs = INTERIOR_STAIRS_EVIDENCE_AUDIT[0]!;
  const stroller = INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!;

  assert.equal(stairs.result, "blocked");
  assert.equal(stairs.blocker, "EXACT_SEGMENT_STAIRS_NOT_SOURCED");
  assert.equal(stroller.result, "blocked");
  assert.equal(stroller.blocker, "EXACT_SEGMENT_STROLLER_NOT_SOURCED");
  assert.equal(INTERIOR_PROVENANCE_AUTHORITY.semanticCompletion, "blocked");
  assert.deepEqual(
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers,
    [
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
    ],
  );
});

test("Planner 37 provenance authority cannot masquerade as RouteEdge or RouteNode materialization", () => {
  const authority = INTERIOR_PROVENANCE_AUTHORITY as unknown as Record<
    string,
    unknown
  >;

  assert.equal(authority.plannerMaterialization, "provenance-only");
  assert.equal(authority.globalEndpointSelection, "unresolved");
  assert.equal("routeEdgeId" in authority, false);
  assert.equal("routeNodeId" in authority, false);
  assert.equal("fromNodeId" in authority, false);
  assert.equal("toNodeId" in authority, false);
  assert.equal("stairs" in authority, false);
  assert.equal("stroller" in authority, false);
});

test("Planner 37 unsupported objectives fail closed", () => {
  assert.deepEqual(
    { ...assessInteriorProvenance("sdz-panda-ridge") },
    {
      status: "blocked",
      reason: "OBJECTIVE_PROVENANCE_NOT_SOURCED",
      objectiveSourceRecordId: "sdz-panda-ridge",
      globalEndpointSelection: "unresolved",
    },
  );
});

test("Planner 37 rejects non-string or unstable objective identifiers", () => {
  assert.throws(
    () => assessInteriorProvenance({} as unknown as string),
    /primitive stable string/,
  );
  assert.throws(
    () => assessInteriorProvenance(new String("sdz-tiger-trail") as unknown as string),
    /primitive stable string/,
  );
  assert.throws(
    () => assessInteriorProvenance(" sdz-tiger-trail"),
    /primitive stable string/,
  );
});

test("Planner 37 static integrity check remains green", () => {
  assert.doesNotThrow(() => assertInteriorProvenanceAuthorityIntegrity());
});

test("Planner 37 authority and assessment outputs are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_PROVENANCE_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_PROVENANCE_AUTHORITY.lineage), true);
  assert.equal(Object.isFrozen(INTERIOR_PROVENANCE_AUTHORITY.provenance), true);
  assert.equal(
    Object.isFrozen(INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers),
    true,
  );

  const result = assessInteriorProvenance("sdz-tiger-trail");
  assert.equal(Object.isFrozen(result), true);
  if (result.status === "provenance-ready") {
    assert.equal(Object.isFrozen(result.provenance), true);
    assert.equal(Object.isFrozen(result.exactSegmentMaterialization), true);
    assert.equal(Object.isFrozen(result.exactSegmentMaterialization.reasons), true);
  }
});

test("Planner 37 exported records ignore Object.prototype semantic pollution after module load", () => {
  const pollutedKeys = ["stairs", "stroller", "routeEdgeId"] as const;
  const originalDescriptors = new Map(
    pollutedKeys.map((key) => [
      key,
      Object.getOwnPropertyDescriptor(Object.prototype, key),
    ]),
  );

  try {
    Object.defineProperty(Object.prototype, "stairs", {
      value: false,
      configurable: true,
    });
    Object.defineProperty(Object.prototype, "stroller", {
      value: true,
      configurable: true,
    });
    Object.defineProperty(Object.prototype, "routeEdgeId", {
      value: "polluted-route-edge",
      configurable: true,
    });

    assert.equal(Object.getPrototypeOf(INTERIOR_PROVENANCE_AUTHORITY), null);
    assert.equal(Object.getPrototypeOf(INTERIOR_PROVENANCE_AUTHORITY.lineage), null);
    assert.equal(Object.getPrototypeOf(INTERIOR_PROVENANCE_AUTHORITY.provenance), null);
    assert.equal(
      (INTERIOR_PROVENANCE_AUTHORITY as unknown as Record<string, unknown>).stairs,
      undefined,
    );
    assert.equal(
      (INTERIOR_PROVENANCE_AUTHORITY as unknown as Record<string, unknown>).stroller,
      undefined,
    );
    assert.equal(
      (INTERIOR_PROVENANCE_AUTHORITY as unknown as Record<string, unknown>).routeEdgeId,
      undefined,
    );

    const result = assessInteriorProvenance("sdz-tiger-trail");
    assert.equal(Object.getPrototypeOf(result), null);
    assert.equal(
      (result as unknown as Record<string, unknown>).stairs,
      undefined,
    );
    assert.equal(
      (result as unknown as Record<string, unknown>).stroller,
      undefined,
    );
    assert.equal(
      (result as unknown as Record<string, unknown>).routeEdgeId,
      undefined,
    );

    if (result.status === "provenance-ready") {
      assert.equal(Object.getPrototypeOf(result.provenance), null);
      assert.equal(Object.getPrototypeOf(result.exactSegmentMaterialization), null);
      assert.equal(
        (result.provenance as unknown as Record<string, unknown>).stairs,
        undefined,
      );
      assert.equal(
        (result.exactSegmentMaterialization as unknown as Record<string, unknown>).stroller,
        undefined,
      );
    }
  } finally {
    for (const key of pollutedKeys) {
      const descriptor = originalDescriptors.get(key);
      if (descriptor) {
        Object.defineProperty(Object.prototype, key, descriptor);
      } else {
        delete (Object.prototype as Record<string, unknown>)[key];
      }
    }
  }
});
