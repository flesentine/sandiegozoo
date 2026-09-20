import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY,
} from "../src/data/zooInteriorTreetopsV7GeometryAuthority.ts";
import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
} from "../src/data/zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import {
  INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT,
} from "../src/data/zooInteriorTreetopsStairsAuthority.ts";
import {
  INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT,
} from "../src/data/zooInteriorTreetopsStrollerAuthority.ts";
import {
  INTERIOR_TREETOPS_PROVENANCE_AUTHORITY,
  assessInteriorTreetopsProvenance,
} from "../src/data/zooInteriorTreetopsProvenanceAuthority.ts";

test("Planner 54 freezes exact Treetops v7 provenance", () => {
  const authority = INTERIOR_TREETOPS_PROVENANCE_AUTHORITY;

  assert.equal(authority.sourceWayId, "148910139");
  assert.equal(authority.sourceWayVersion, 7);
  assert.equal(
    authority.sourceWayVersionUrl,
    "https://api.openstreetmap.org/api/0.6/way/148910139/7",
  );
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T20:28:40Z");
  assert.equal(authority.sourceWayChangeset, 178875711);
  assert.equal(authority.sourceObservedAt, "2026-09-19T11:08:15-07:00");
  assert.equal(authority.sourceFromNodeId, "1619736626");
  assert.equal(authority.sourceToNodeId, "13588159626");
});

test("Planner 54 lineage anchors geometry and topology", () => {
  const authority = INTERIOR_TREETOPS_PROVENANCE_AUTHORITY;

  assert.equal(
    authority.lineage.geometryAuthorityId,
    INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0].id,
  );
  assert.equal(
    authority.lineage.topologyAuthorityId,
    INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0].id,
  );
});

test("Planner 54 preserves unresolved stairs and stroller lineage", () => {
  const authority = INTERIOR_TREETOPS_PROVENANCE_AUTHORITY;
  const stairs = INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT[0];
  const stroller = INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT[0];

  assert.equal(authority.lineage.stairsEvidenceAuditId, stairs.id);
  assert.equal(authority.lineage.strollerEvidenceAuditId, stroller.id);
  assert.equal(stairs.stairs, "unknown");
  assert.equal(stroller.stroller, "unknown");
  assert.deepEqual(authority.unresolvedSemanticBlockers, [
    "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  ]);
});

test("Planner 54 provenance is provisional while semantics remain unresolved", () => {
  const authority = INTERIOR_TREETOPS_PROVENANCE_AUTHORITY;

  assert.equal(authority.provenance.confidence, "provisional");
  assert.equal(
    authority.confidenceRationale,
    "provenance-complete-while-stairs-and-stroller-remain-unresolved",
  );
  assert.equal(authority.semanticCompletion, "blocked");
  assert.equal(authority.plannerMaterialization, "provenance-only");
});

test("Planner 54 assessment exposes provenance without materializing graph entities", () => {
  assert.deepEqual(
    assessInteriorTreetopsProvenance("sdz-tiger-trail"),
    {
      status: "provenance-ready",
      authorityId:
        "sdz-interior-treetops-anchor-to-fern-canyon-provenance",
      objectiveSourceRecordId: "sdz-tiger-trail",
      sourceWayId: "148910139",
      sourceWayVersion: 7,
      sourceFromNodeId: "1619736626",
      sourceToNodeId: "13588159626",
      provenance: {
        sourceUrl:
          "https://api.openstreetmap.org/api/0.6/way/148910139/7",
        sourceLabel:
          "OpenStreetMap way 148910139 v7 with WildRoute Treetops exact-segment semantic lineage",
        lastVerified: "2026-09-19T11:08:15-07:00",
        confidence: "provisional",
        effectiveFrom: "2026-09-19",
      },
      confidenceRationale:
        "provenance-complete-while-stairs-and-stroller-remain-unresolved",
      routeGraphExpansion: {
        status: "blocked",
        reasons: [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        ],
      },
    },
  );

  for (const field of ["routeNodeId", "routeEdgeId", "stairs", "stroller"]) {
    assert.equal(
      Object.hasOwn(
        INTERIOR_TREETOPS_PROVENANCE_AUTHORITY as unknown as Record<
          string,
          unknown
        >,
        field,
      ),
      false,
    );
  }
});

test("Planner 54 blocks unrelated objectives", () => {
  assert.deepEqual(
    assessInteriorTreetopsProvenance("sdz-gorilla-tropics"),
    {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_PROVENANCE_NOT_SOURCED",
      objectiveSourceRecordId: "sdz-gorilla-tropics",
    },
  );
});

test("Planner 54 exports and assessments are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_PROVENANCE_AUTHORITY),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.lineage),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.provenance),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers,
    ),
    true,
  );

  const assessment =
    assessInteriorTreetopsProvenance("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "provenance-ready") {
    assert.equal(Object.isFrozen(assessment.provenance), true);
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(
      Object.isFrozen(assessment.routeGraphExpansion.reasons),
      true,
    );
  }
});
