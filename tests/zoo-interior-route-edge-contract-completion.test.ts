import assert from "node:assert/strict";
import test from "node:test";

import {
  INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION,
  assessInteriorRouteEdgeContractCompletion,
  assertInteriorRouteEdgeContractCompletionIntegrity,
} from "../src/data/zooInteriorRouteEdgeContractCompletion.ts";
import {
  assessInteriorEndpointRouteNode,
} from "../src/data/zooInteriorEndpointRouteNodeAuthority.ts";
import {
  INTERIOR_STAIRS_EVIDENCE_AUDIT,
  INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY,
} from "../src/data/zooInteriorStairsAuthority.ts";
import {
  INTERIOR_STROLLER_EVIDENCE_AUDIT,
  INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY,
} from "../src/data/zooInteriorStrollerAuthority.ts";
import {
  INTERIOR_PROVENANCE_AUTHORITY,
} from "../src/data/zooInteriorProvenanceAuthority.ts";

const STAIRS_REASON = "EXACT_SEGMENT_STAIRS_NOT_SOURCED" as const;
const STROLLER_REASON = "EXACT_SEGMENT_STROLLER_NOT_SOURCED" as const;

test("Planner 39 represents the two unresolved capabilities explicitly as unknown", () => {
  const completion = INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION;

  assert.equal(completion.stairsAuthority.status, "supported");
  assert.equal(completion.stairsAuthority.value, "unknown");
  assert.equal(completion.stairsAuthority.evidenceStatus, "unresolved");
  assert.equal(completion.stairsAuthority.unresolvedReason, STAIRS_REASON);

  assert.equal(completion.strollerAuthority.status, "supported");
  assert.equal(completion.strollerAuthority.value, "unknown");
  assert.equal(completion.strollerAuthority.evidenceStatus, "unresolved");
  assert.equal(completion.strollerAuthority.unresolvedReason, STROLLER_REASON);
});

test("Planner 39 preserves the exact Planner 35 and Planner 36 unresolved evidence", () => {
  const stairs = INTERIOR_STAIRS_EVIDENCE_AUDIT[0]!;
  const stroller = INTERIOR_STROLLER_EVIDENCE_AUDIT[0]!;

  assert.equal(INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY.unresolvedPlannerValue, "unknown");
  assert.equal(stairs.result, "blocked");
  assert.equal(stairs.blocker, STAIRS_REASON);
  assert.equal(stairs.directStairFreeEvidence, "not-sourced");

  assert.equal(INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.unresolvedPlannerValue, "unknown");
  assert.equal(stroller.result, "blocked");
  assert.equal(stroller.blocker, STROLLER_REASON);
  assert.equal(stroller.directGenericStrollerRouteEvidence, "not-sourced");
});

test("Planner 39 converts representability blockers without rewriting Planner 38 history", () => {
  const before = assessInteriorEndpointRouteNode("sdz-tiger-trail");
  assert.equal(before.status, "route-node-ready");
  if (before.status !== "route-node-ready") {
    assert.fail("Planner 38 endpoint unexpectedly blocked");
  }
  assert.deepEqual(before.routeEdgeMaterialization.reasons, [
    STAIRS_REASON,
    STROLLER_REASON,
  ]);

  const after = assessInteriorRouteEdgeContractCompletion("sdz-tiger-trail");
  assert.equal(after.status, "route-edge-contract-complete");
  if (after.status !== "route-edge-contract-complete") {
    assert.fail("Planner 39 contract unexpectedly blocked");
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

test("Planner 39 remains tied to the exact objective-selected Front Street segment", () => {
  const completion = INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION;

  assert.equal(completion.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(completion.sourceWayId, "1481425058");
  assert.equal(completion.sourceFromNodeId, "7053320515");
  assert.equal(completion.sourceToNodeId, "1619736626");
  assert.equal(completion.selectionScope, "objective-only");
  assert.equal(completion.globalEndpointSelection, "unresolved");
});

test("Planner 39 keeps Planner 37 unresolved evidence lineage visible", () => {
  assert.deepEqual(
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.unresolvedEvidenceReasons,
    [STAIRS_REASON, STROLLER_REASON],
  );
  assert.deepEqual(
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers,
    [STAIRS_REASON, STROLLER_REASON],
  );
  assert.equal(
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.evidenceResolution,
    "unresolved-preserved",
  );
});

test("Planner 39 completes the contract only and does not materialize a RouteEdge", () => {
  const completion =
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION as unknown as Record<string, unknown>;

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

  assert.equal(
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.plannerMaterialization,
    "explicit-unknown-route-edge-capability-semantics",
  );
});

test("Planner 39 unsupported objectives fail closed", () => {
  assert.deepEqual(
    { ...assessInteriorRouteEdgeContractCompletion("sdz-panda-ridge") },
    {
      status: "blocked",
      reason: "OBJECTIVE_ROUTE_EDGE_CONTRACT_NOT_SOURCED",
      objectiveSourceRecordId: "sdz-panda-ridge",
      globalEndpointSelection: "unresolved",
    },
  );
});

test("Planner 39 rejects non-string or unstable objective identifiers", () => {
  assert.throws(
    () => assessInteriorRouteEdgeContractCompletion({} as unknown as string),
    /primitive stable string/,
  );
  assert.throws(
    () => assessInteriorRouteEdgeContractCompletion(new String("sdz-tiger-trail") as unknown as string),
    /primitive stable string/,
  );
  assert.throws(
    () => assessInteriorRouteEdgeContractCompletion(" sdz-tiger-trail"),
    /primitive stable string/,
  );
});

test("Planner 39 exported records ignore Object.prototype RouteEdge pollution after module load", () => {
  const pollutedKeys = ["stairs", "stroller", "routeEdgeId", "status"] as const;
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
    Object.defineProperty(Object.prototype, "status", {
      value: "open",
      configurable: true,
    });

    for (const candidate of [
      INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION as unknown as Record<string, unknown>,
      INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.stairsAuthority as unknown as Record<string, unknown>,
      INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.strollerAuthority as unknown as Record<string, unknown>,
    ]) {
      assert.equal(Object.getPrototypeOf(candidate), null);
    }

    assert.equal(
      (INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION as unknown as Record<string, unknown>).stairs,
      undefined,
    );
    assert.equal(
      (INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION as unknown as Record<string, unknown>).stroller,
      undefined,
    );
    assert.equal(
      (INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION as unknown as Record<string, unknown>).routeEdgeId,
      undefined,
    );

    const result = assessInteriorRouteEdgeContractCompletion("sdz-tiger-trail");
    assert.equal(Object.getPrototypeOf(result), null);
    assert.notEqual((result as unknown as Record<string, unknown>).status, "open");
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

test("Planner 39 contract completion and assessments are deeply immutable", () => {
  assert.doesNotThrow(() =>
    assertInteriorRouteEdgeContractCompletionIntegrity(),
  );

  assert.equal(Object.isFrozen(INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION), true);
  assert.equal(Object.isFrozen(INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.stairsAuthority), true);
  assert.equal(Object.isFrozen(INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.strollerAuthority), true);
  assert.equal(Object.isFrozen(INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.unresolvedEvidenceReasons), true);
  assert.equal(Object.isFrozen(INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.blockedFields), true);

  const result = assessInteriorRouteEdgeContractCompletion("sdz-tiger-trail");
  assert.equal(Object.isFrozen(result), true);
  if (result.status === "route-edge-contract-complete") {
    assert.equal(Object.isFrozen(result.unresolvedEvidenceReasons), true);
    assert.equal(Object.isFrozen(result.blockedFields), true);
    assert.equal(Object.isFrozen(result.routeEdgeMaterialization), true);
  }
});
