import assert from "node:assert/strict";
import test from "node:test";
import {
  INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS,
  OSM_PEDESTRIAN_SEMANTIC_REFERENCES,
  assessIngressRouteEdgeReadiness,
  assertIngressRouteEdgeSemanticAuditIntegrity,
  type RouteEdgeSemanticAudit,
} from "../src/data/zooIngressEdgeSemanticsAuthority.ts";

test("controlled entrance passage supports route-node endpoints, walk mode, and derived distance without promoting generic oneway", () => {
  const audit = INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
    (candidate) => candidate.sourceWayId === "755054695",
  );
  assert.ok(audit);

  assert.deepEqual(audit.sourceTags, {
    highway: "pedestrian",
    oneway: "yes",
    tunnel: "building_passage",
  });
  assert.deepEqual(audit.routeNodesAuthority, {
    status: "supported",
    value: {
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-interior-route-node",
    },
    basis:
      "Planner 15 route-node materialization from frozen OSM way endpoint nodes",
  });
  assert.deepEqual(audit.modeAuthority, {
    status: "supported",
    value: "walk",
    basis: "OSM highway=pedestrian",
  });
  assert.deepEqual(audit.distanceAuthority, {
    status: "supported",
    value: 16.836,
    basis:
      "Planner 13 Haversine sum over frozen OSM way node sequence",
  });
  assert.deepEqual(audit.oneWayAuthority, {
    status: "supported",
    sourceWayId: "755054695",
    sourceSnapshotId:
      "sdz-pedestrian-direction-way-755054695",
    oneWay: false,
    direction: "bidirectional",
    basis:
      "Planner 21 generic oneway on highway=pedestrian is vehicle-only",
    policyId:
      "sdz-pedestrian-direction-resolution-policy-v1",
    resolutionCase:
      "generic-oneway-vehicle-only",
  });
});

test("interior Front Street connection supports route-node endpoints, walk mode, distance, and bidirectional pedestrian travel", () => {
  const audit = INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
    (candidate) => candidate.sourceWayId === "755054694",
  );
  assert.ok(audit);

  assert.deepEqual(audit.sourceTags, {
    highway: "pedestrian",
  });
  assert.deepEqual(audit.routeNodesAuthority, {
    status: "supported",
    value: {
      fromNodeId:
        "sdz-ingress-node-interior-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
    },
    basis:
      "Planner 15 route-node materialization from frozen OSM way endpoint nodes",
  });
  assert.deepEqual(audit.modeAuthority, {
    status: "supported",
    value: "walk",
    basis: "OSM highway=pedestrian",
  });
  assert.deepEqual(audit.distanceAuthority, {
    status: "supported",
    value: 25.376,
    basis:
      "Planner 13 Haversine sum over frozen OSM way node sequence",
  });
  assert.deepEqual(audit.oneWayAuthority, {
    status: "supported",
    sourceWayId: "755054694",
    sourceSnapshotId:
      "sdz-pedestrian-direction-way-755054694",
    oneWay: false,
    direction: "bidirectional",
    basis:
      "Planner 21 default pedestrian bidirectionality absent explicit restriction",
    policyId:
      "sdz-pedestrian-direction-resolution-policy-v1",
    resolutionCase:
      "no-explicit-pedestrian-restriction",
  });
});

test("all current ingress audits expose unresolved semantics explicitly as unknown", () => {
  assert.equal(
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.length,
    2,
  );

  for (const audit of INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS) {
    assert.equal(
      audit.routeNodesAuthority.status,
      "supported",
    );
    assert.equal(
      audit.durationAuthority.status,
      "supported",
    );

    for (const authority of [
      audit.difficultyAuthority,
      audit.stairsAuthority,
      audit.accessibleAuthority,
      audit.strollerAuthority,
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
      audit.edgeStatusAuthority.status,
      "supported",
    );
    assert.equal(
      audit.edgeStatusAuthority.value,
      "conditional",
    );
    assert.equal(
      audit.oneWayAuthority.status,
      "supported",
    );
    assert.equal(
      audit.oneWayAuthority.oneWay,
      false,
    );
    assert.equal(
      audit.oneWayAuthority.direction,
      "bidirectional",
    );
    assert.equal(
      audit.plannerMaterialization,
      "route-edge-audit-only",
    );
  }
});

test("Planner 20 status linkage promotes conditional rather than always-open ingress edges", () => {
  for (
    const audit of
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS
  ) {
    assert.deepEqual(
      audit.edgeStatusAuthority,
      {
        status: "supported",
        value: "conditional",
        basis:
          "Planner 20 operational-status policy",
        policyEvidenceId:
          "sdz-operational-policy-2026-09-08",
        activation: {
          status:
            "runtime-check-required",
          exactEdgeSourceWayId:
            audit.sourceWayId,
          requirements: [
            "VISIT_WITHIN_CURRENT_ZOO_HOURS",
            "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
            "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
          ],
        },
      },
    );
  }
});

test("Planner 19 duration linkage promotes exact policy-derived free-flow durations", () => {
  const controlled =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
      (audit) =>
        audit.sourceWayId === "755054695",
    );
  const frontStreet =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
      (audit) =>
        audit.sourceWayId === "755054694",
    );
  assert.ok(controlled);
  assert.ok(frontStreet);

  assert.deepEqual(
    controlled.durationAuthority,
    {
      status: "supported",
      value: 0.234,
      basis:
        "Planner 19 prospective walking-duration policy v1 over Planner 13 derived distance",
    },
  );
  assert.deepEqual(
    frontStreet.durationAuthority,
    {
      status: "supported",
      value: 0.352,
      basis:
        "Planner 19 prospective walking-duration policy v1 over Planner 13 derived distance",
    },
  );
});

test("Planner 22 preserves Planner 18 terrain blockers as explicit unknowns", () => {
  const controlled =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
      (audit) =>
        audit.sourceWayId === "755054695",
    );
  const frontStreet =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
      (audit) =>
        audit.sourceWayId === "755054694",
    );
  assert.ok(controlled);
  assert.ok(frontStreet);

  assert.deepEqual(
    controlled.difficultyAuthority,
    {
      status: "supported",
      value: "unknown",
      basis:
        "Planner 22 explicit unknown semantics over unresolved Planner 18 difficulty authority",
      unresolvedReason:
        "EXACT_EDGE_DIFFICULTY_NOT_SOURCED",
      sourceSnapshotId:
        "sdz-pedestrian-direction-way-755054695",
    },
  );
  assert.deepEqual(
    controlled.stairsAuthority,
    {
      status: "supported",
      value: "unknown",
      basis:
        "Planner 22 explicit unknown semantics over unresolved Planner 18 stairs authority",
      unresolvedReason:
        "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
      sourceSnapshotId:
        "sdz-pedestrian-direction-way-755054695",
    },
  );

  assert.equal(
    frontStreet.difficultyAuthority.value,
    "unknown",
  );
  assert.equal(
    frontStreet.difficultyAuthority
      .unresolvedReason,
    "CORRIDOR_TERRAIN_NOT_EXACT_EDGE_AUTHORITY",
  );
  assert.equal(
    frontStreet.difficultyAuthority
      .corridorTerrainEvidenceId,
    "sdz-corridor-front-street-terrain-evidence",
  );
  assert.equal(
    frontStreet.stairsAuthority.value,
    "unknown",
  );
  assert.equal(
    frontStreet.stairsAuthority
      .corridorTerrainEvidenceId,
    "sdz-corridor-front-street-terrain-evidence",
  );
});

test("Planner 22 preserves Planner 17 mobility blockers as explicit unknowns", () => {
  const controlled =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
      (audit) =>
        audit.sourceWayId === "755054695",
    );
  const frontStreet =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
      (audit) =>
        audit.sourceWayId === "755054694",
    );
  assert.ok(controlled);
  assert.ok(frontStreet);

  assert.deepEqual(
    controlled.accessibleAuthority,
    {
      status: "supported",
      value: "unknown",
      basis:
        "Planner 22 explicit unknown semantics over unresolved Planner 17 accessibility authority",
      unresolvedReason:
        "EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED",
    },
  );
  assert.deepEqual(
    frontStreet.accessibleAuthority,
    {
      status: "supported",
      value: "unknown",
      basis:
        "Planner 22 explicit unknown semantics over unresolved Planner 17 accessibility authority",
      unresolvedReason:
        "CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY",
      corridorEvidenceId:
        "sdz-accessibility-front-street-wheelchair-indicator",
    },
  );
  assert.deepEqual(
    controlled.strollerAuthority,
    frontStreet.strollerAuthority,
  );
  assert.equal(
    controlled.strollerAuthority.value,
    "unknown",
  );
  assert.equal(
    controlled.strollerAuthority
      .unresolvedReason,
    "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY",
  );
});

test("route-edge readiness is contract-complete with explicit unknown semantics", () => {
  assert.deepEqual(
    assessIngressRouteEdgeReadiness(
      "sdz-geo-main-entrance",
    ),
    {
      status:
        "route-edge-contract-complete",
      targetId:
        "sdz-geo-main-entrance",
      auditIds: [
        "sdz-ingress-way-controlled-passage-route-edge-audit",
        "sdz-ingress-way-front-street-connection-route-edge-audit",
      ],
      supportedFields: [
        "routeNodes",
        "mode",
        "distance",
        "duration",
        "difficulty",
        "stairs",
        "accessible",
        "stroller",
        "oneWay",
        "status",
      ],
      blockedFields: [],
      routeEdgeMaterialization: {
        status: "ready",
        basis:
          "Planner 22 explicit unknown RouteEdge semantics",
      },
    },
  );

  assert.deepEqual(
    assessIngressRouteEdgeReadiness(
      "sdz-geo-wegeforth-bowl",
    ),
    {
      status: "blocked",
      reason: "NO_DISTANCE_SEGMENTS",
      targetId: "sdz-geo-wegeforth-bowl",
    },
  );

  assert.deepEqual(
    assessIngressRouteEdgeReadiness(
      "unknown-target",
    ),
    {
      status: "blocked",
      reason: "TARGET_UNKNOWN",
      targetId: "unknown-target",
    },
  );
});

test("semantic-reference URLs are frozen and scoped to pedestrian routing interpretation", () => {
  assert.equal(
    Object.isFrozen(OSM_PEDESTRIAN_SEMANTIC_REFERENCES),
    true,
  );
  assert.deepEqual(
    [...OSM_PEDESTRIAN_SEMANTIC_REFERENCES],
    [
      "https://wiki.openstreetmap.org/wiki/Guidelines_for_pedestrian_navigation",
      "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
      "https://wiki.openstreetmap.org/wiki/Key:barrier",
    ],
  );
});

test("route-edge semantic audits are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS),
    true,
  );
  assert.equal(
    Object.isFrozen(INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS[0]),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS[0].sourceTags,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS[0].modeAuthority,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS[0].oneWayAuthority,
    ),
    true,
  );
});


test("integrity rejects route-node endpoint drift from Planner 15 authority", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              routeNodesAuthority: {
                ...audit.routeNodesAuthority,
                value: {
                  ...audit.routeNodesAuthority.value,
                  toNodeId:
                    "sdz-ingress-node-front-street-route-node",
                },
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed its supported fields/,
  );
});

test("integrity rejects mode promotion beyond the sourced pedestrian tag", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              modeAuthority: {
                ...audit.modeAuthority,
                value: "skyfari" as unknown as "walk",
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed its supported fields/,
  );
});

test("integrity rejects distance drift from Planner 13 authority", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              distanceAuthority: {
                ...audit.distanceAuthority,
                value: audit.distanceAuthority.value + 1,
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed its supported fields/,
  );
});

test("integrity rejects always-open promotion beyond Planner 20 runtime-check policy", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              edgeStatusAuthority: {
                ...audit.edgeStatusAuthority,
                value: "open",
              } as unknown as RouteEdgeSemanticAudit["edgeStatusAuthority"],
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 20 operational-status linkage/,
  );
});

test("integrity rejects exact-edge activation being rebound to another ingress way", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              edgeStatusAuthority: {
                ...audit.edgeStatusAuthority,
                activation: {
                  ...audit.edgeStatusAuthority.activation,
                  exactEdgeSourceWayId:
                    "755054694",
                },
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 20 operational-status linkage/,
  );
});

test("integrity rejects removal of Planner 20 runtime activation requirements", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              edgeStatusAuthority: {
                ...audit.edgeStatusAuthority,
                activation: {
                  status:
                    "runtime-check-required",
                  exactEdgeSourceWayId:
                    audit.sourceWayId,
                  requirements: [
                    "VISIT_WITHIN_CURRENT_ZOO_HOURS",
                    "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
                  ],
                },
              } as unknown as RouteEdgeSemanticAudit["edgeStatusAuthority"],
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 20 operational-status linkage/,
  );
});

test("integrity rejects duration drift from Planner 19 policy", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              durationAuthority: {
                ...audit.durationAuthority,
                value:
                  audit.durationAuthority.value +
                  0.001,
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed its supported fields/,
  );
});

test("integrity rejects duration-basis drift from Planner 19 policy", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              durationAuthority: {
                ...audit.durationAuthority,
                basis:
                  "guessed walking time",
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed its supported fields/,
  );
});

test("integrity rejects replacing Planner 22 unknown difficulty with a guess", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit) =>
        audit.sourceWayId === "755054694"
          ? {
              ...audit,
              difficultyAuthority: {
                ...audit.difficultyAuthority,
                value: "easy",
              } as unknown as RouteEdgeSemanticAudit["difficultyAuthority"],
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 22 unknown-semantic completion/,
  );
});

test("integrity rejects replacing unknown stairs with false", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              stairsAuthority: {
                ...audit.stairsAuthority,
                value: false,
              } as unknown as RouteEdgeSemanticAudit["stairsAuthority"],
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 22 unknown-semantic completion/,
  );
});

test("integrity rejects replacing unknown accessibility with true", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit) =>
        audit.sourceWayId === "755054694"
          ? {
              ...audit,
              accessibleAuthority: {
                ...audit.accessibleAuthority,
                value: true,
              } as unknown as RouteEdgeSemanticAudit["accessibleAuthority"],
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 22 unknown-semantic completion/,
  );
});

test("integrity rejects replacing unknown stroller suitability with facility permission", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              strollerAuthority: {
                ...audit.strollerAuthority,
                value: true,
              } as unknown as RouteEdgeSemanticAudit["strollerAuthority"],
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 22 unknown-semantic completion/,
  );
});

test("integrity rejects generic OSM oneway being promoted to pedestrian one-way against Planner 21 policy", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit) =>
        audit.sourceWayId === "755054695"
          ? {
              ...audit,
              oneWayAuthority: {
                ...audit.oneWayAuthority,
                oneWay: true,
                direction:
                  "with-source-way-order",
              } as RouteEdgeSemanticAudit["oneWayAuthority"],
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 21 pedestrian-direction linkage/,
  );
});

test("integrity rejects pedestrian-direction source linkage drift", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              oneWayAuthority: {
                ...audit.oneWayAuthority,
                sourceSnapshotId:
                  "sdz-pedestrian-direction-way-755054694",
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 21 pedestrian-direction linkage/,
  );
});

test("integrity rejects direct Planner RouteEdge fields hidden by casts", () => {
  const leaked = {
    ...INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS[0],
    durationMinutes: 1,
  } as unknown as RouteEdgeSemanticAudit;

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity([
        leaked,
        INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS[1],
      ]),
    /cannot directly materialize Planner RouteEdge field durationMinutes/,
  );
});

test("integrity rejects tampered frozen source tags", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit) =>
        audit.sourceWayId === "755054695"
          ? {
              ...audit,
              sourceTags: {
                ...audit.sourceTags,
                oneway: "no",
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /does not match its source authority/,
  );
});


test("integrity rejects Planner 21 resolution-case drift", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              oneWayAuthority: {
                ...audit.oneWayAuthority,
                resolutionCase:
                  "no-explicit-pedestrian-restriction",
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 21 pedestrian-direction linkage/,
  );
});

test("integrity rejects supported-field basis drift", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              modeAuthority: {
                ...audit.modeAuthority,
                basis: "guessed from map appearance",
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed its supported fields/,
  );
});
