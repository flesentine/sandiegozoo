import assert from "node:assert/strict";
import test from "node:test";
import {
  INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS,
  assertIngressRouteEdgeUnknownCompletionIntegrity,
  completeIngressRouteEdgeUnknownSemantics,
} from "../src/data/zooIngressRouteEdgeContractCompletion.ts";

test("Planner 22 completes every current ingress way with explicit unknown semantics", () => {
  assert.equal(
    INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS.length,
    2,
  );

  for (
    const completion of
    INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS
  ) {
    for (const authority of [
      completion.difficultyAuthority,
      completion.stairsAuthority,
      completion.accessibleAuthority,
      completion.strollerAuthority,
    ]) {
      assert.equal(
        authority.status,
        "supported",
      );
      assert.equal(
        authority.value,
        "unknown",
      );
    }
    assert.equal(
      completion.plannerMaterialization,
      "explicit-unknown-route-edge-semantics",
    );
  }
});

test("controlled passage preserves exact unresolved reasons", () => {
  assert.deepEqual(
    completeIngressRouteEdgeUnknownSemantics(
      "755054695",
    ),
    {
      sourceWayId: "755054695",
      difficultyAuthority: {
        status: "supported",
        value: "unknown",
        basis:
          "Planner 22 explicit unknown semantics over unresolved Planner 18 difficulty authority",
        unresolvedReason:
          "EXACT_EDGE_DIFFICULTY_NOT_SOURCED",
        sourceSnapshotId:
          "sdz-pedestrian-direction-way-755054695",
      },
      stairsAuthority: {
        status: "supported",
        value: "unknown",
        basis:
          "Planner 22 explicit unknown semantics over unresolved Planner 18 stairs authority",
        unresolvedReason:
          "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
        sourceSnapshotId:
          "sdz-pedestrian-direction-way-755054695",
      },
      accessibleAuthority: {
        status: "supported",
        value: "unknown",
        basis:
          "Planner 22 explicit unknown semantics over unresolved Planner 17 accessibility authority",
        unresolvedReason:
          "EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED",
      },
      strollerAuthority: {
        status: "supported",
        value: "unknown",
        basis:
          "Planner 22 explicit unknown semantics over unresolved Planner 17 stroller authority",
        unresolvedReason:
          "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY",
        policyEvidenceId:
          "sdz-stroller-facility-policy-2026-09-08",
      },
      plannerMaterialization:
        "explicit-unknown-route-edge-semantics",
    },
  );
});

test("Front Street connection preserves corridor context while remaining unknown", () => {
  const completion =
    completeIngressRouteEdgeUnknownSemantics(
      "755054694",
    );
  assert.ok(
    !("status" in completion),
  );

  assert.equal(
    completion.difficultyAuthority
      .corridorTerrainEvidenceId,
    "sdz-corridor-front-street-terrain-evidence",
  );
  assert.equal(
    completion.stairsAuthority
      .corridorTerrainEvidenceId,
    "sdz-corridor-front-street-terrain-evidence",
  );
  assert.equal(
    completion.accessibleAuthority
      .corridorEvidenceId,
    "sdz-accessibility-front-street-wheelchair-indicator",
  );
});

test("unknown ingress way fails closed", () => {
  assert.deepEqual(
    completeIngressRouteEdgeUnknownSemantics(
      "unknown-way",
    ),
    {
      sourceWayId: "unknown-way",
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
    },
  );
});

test("Planner 22 completion exports are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS[0],
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS[0]
        .difficultyAuthority,
    ),
    true,
  );
});

test("completion integrity rejects guessed concrete replacement values", () => {
  const bad = structuredClone(
    INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS,
  );
  (
    bad[0].difficultyAuthority as unknown as {
      value: string;
    }
  ).value = "easy";

  assert.throws(
    () =>
      assertIngressRouteEdgeUnknownCompletionIntegrity(
        bad,
      ),
    /unknown-semantic completion drifted|cannot promote unresolved ingress semantics/,
  );
});

test("completion integrity rejects missing or duplicate ingress coverage", () => {
  assert.throws(
    () =>
      assertIngressRouteEdgeUnknownCompletionIntegrity(
        [
          INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS[0],
        ],
      ),
    /requires exactly one unknown-semantic completion/,
  );

  assert.throws(
    () =>
      assertIngressRouteEdgeUnknownCompletionIntegrity(
        [
          INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS[0],
          INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS[0],
        ],
      ),
    /requires exactly one unknown-semantic completion/,
  );
});
