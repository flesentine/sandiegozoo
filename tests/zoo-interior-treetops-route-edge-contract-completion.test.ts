import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION,
  assessInteriorTreetopsRouteEdgeContractCompletion,
  assertInteriorTreetopsRouteEdgeContractCompletionIntegrity,
} from "../src/data/zooInteriorTreetopsRouteEdgeContractCompletion.ts";
import {
  assessInteriorTreetopsEndpointRouteNode,
} from "../src/data/zooInteriorTreetopsEndpointRouteNodeAuthority.ts";
import {
  INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT,
} from "../src/data/zooInteriorTreetopsStairsAuthority.ts";
import {
  INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT,
} from "../src/data/zooInteriorTreetopsStrollerAuthority.ts";
import {
  INTERIOR_TREETOPS_PROVENANCE_AUTHORITY,
} from "../src/data/zooInteriorTreetopsProvenanceAuthority.ts";

const STAIRS_REASON = "EXACT_SEGMENT_STAIRS_NOT_SOURCED" as const;
const STROLLER_REASON = "EXACT_SEGMENT_STROLLER_NOT_SOURCED" as const;

test("Planner 56 represents unresolved stairs and stroller explicitly as unknown", () => {
  const completion = INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION;

  assert.equal(completion.stairsAuthority.status, "supported");
  assert.equal(completion.stairsAuthority.value, "unknown");
  assert.equal(completion.stairsAuthority.evidenceStatus, "unresolved");
  assert.equal(completion.stairsAuthority.unresolvedReason, STAIRS_REASON);

  assert.equal(completion.strollerAuthority.status, "supported");
  assert.equal(completion.strollerAuthority.value, "unknown");
  assert.equal(completion.strollerAuthority.evidenceStatus, "unresolved");
  assert.equal(
    completion.strollerAuthority.unresolvedReason,
    STROLLER_REASON,
  );
});

test("Planner 56 preserves Planner 52/53 evidence instead of rewriting it", () => {
  const stairs = INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT[0];
  const stroller = INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT[0];

  assert.equal(stairs.result, "blocked");
  assert.equal(stairs.blocker, STAIRS_REASON);
  assert.equal(stairs.stairs, "unknown");
  assert.equal(stairs.directStairFreeEvidence, "not-sourced");

  assert.equal(stroller.result, "blocked");
  assert.equal(stroller.blocker, STROLLER_REASON);
  assert.equal(stroller.stroller, "unknown");
  assert.equal(
    stroller.directGenericStrollerRouteEvidence,
    "not-sourced",
  );
});

test("Planner 56 converts representability blockers without rewriting Planner 55 history", () => {
  const before = assessInteriorTreetopsEndpointRouteNode("sdz-tiger-trail");
  assert.equal(before.status, "route-node-ready");
  if (before.status !== "route-node-ready") {
    assert.fail("Planner 55 endpoint unexpectedly blocked");
  }
  assert.deepEqual(before.routeEdgeMaterialization.reasons, [
    STAIRS_REASON,
    STROLLER_REASON,
  ]);

  const after =
    assessInteriorTreetopsRouteEdgeContractCompletion("sdz-tiger-trail");
  assert.equal(after.status, "route-edge-contract-complete");
  if (after.status !== "route-edge-contract-complete") {
    assert.fail("Planner 56 contract unexpectedly blocked");
  }
  assert.deepEqual(after.blockedFields, []);
  assert.deepEqual(after.unresolvedEvidenceReasons, [
    STAIRS_REASON,
    STROLLER_REASON,
  ]);
  assert.equal(after.stairs, "unknown");
  assert.equal(after.stroller, "unknown");
  assert.equal(after.routeEdgeMaterialization.status, "ready");
});

test("Planner 56 stays tied to the exact Treetops segment and provenance", () => {
  const completion = INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION;

  assert.equal(completion.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(completion.sourceWayId, "148910139");
  assert.equal(completion.sourceWayVersion, 7);
  assert.equal(completion.sourceFromNodeId, "1619736626");
  assert.equal(completion.sourceToNodeId, "13588159626");
  assert.deepEqual(
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers,
    [STAIRS_REASON, STROLLER_REASON],
  );
});

test("Planner 56 completes the contract only and does not materialize a RouteEdge", () => {
  const completion =
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION as unknown as Record<
      string,
      unknown
    >;

  for (const field of [
    "fromNodeId",
    "toNodeId",
    "mode",
    "distanceMeters",
    "durationMinutes",
    "difficulty",
    "stairs",
    "accessible",
    "stroller",
    "oneWay",
    "status",
    "provenance",
    "routeEdgeId",
  ]) {
    assert.equal(field in completion, false, field);
  }
});

test("Planner 56 exports stay isolated from Object.prototype pollution", () => {
  assert.equal(
    Object.getPrototypeOf(INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION),
    null,
  );
  assert.equal(
    Object.getPrototypeOf(
      INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.stairsAuthority,
    ),
    null,
  );
  assert.equal(
    Object.getPrototypeOf(
      INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.strollerAuthority,
    ),
    null,
  );
});

test("Planner 56 rejects unrelated objectives", () => {
  assert.deepEqual(
    {
      ...assessInteriorTreetopsRouteEdgeContractCompletion(
        "sdz-gorilla-tropics",
      ),
    },
    {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_ROUTE_EDGE_CONTRACT_NOT_SOURCED",
      objectiveSourceRecordId: "sdz-gorilla-tropics",
    },
  );
});

test("Planner 56 contract and assessments are deeply immutable", () => {
  assert.doesNotThrow(() =>
    assertInteriorTreetopsRouteEdgeContractCompletionIntegrity(),
  );

  const completion = INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION;
  assert.equal(Object.isFrozen(completion), true);
  assert.equal(Object.isFrozen(completion.stairsAuthority), true);
  assert.equal(Object.isFrozen(completion.strollerAuthority), true);
  assert.equal(Object.isFrozen(completion.unresolvedEvidenceReasons), true);
  assert.equal(Object.isFrozen(completion.blockedFields), true);

  const assessment =
    assessInteriorTreetopsRouteEdgeContractCompletion("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "route-edge-contract-complete") {
    assert.equal(
      Object.isFrozen(assessment.unresolvedEvidenceReasons),
      true,
    );
    assert.equal(Object.isFrozen(assessment.blockedFields), true);
    assert.equal(
      Object.isFrozen(assessment.routeEdgeMaterialization),
      true,
    );
  }
});
