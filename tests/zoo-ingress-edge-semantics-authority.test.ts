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
    status: "blocked",
    reason: "GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT",
    basis:
      "Planner 16 pedestrian-direction authority",
    sourceSnapshotId:
      "sdz-pedestrian-direction-way-755054695",
  });
});

test("interior Front Street connection supports route-node endpoints, walk mode, and distance while pedestrian direction remains unsourced", () => {
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
    status: "blocked",
    reason:
      "PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED",
    basis:
      "Planner 16 pedestrian-direction authority",
    sourceSnapshotId:
      "sdz-pedestrian-direction-way-755054694",
  });
});

test("all current ingress audits keep unsupported RouteEdge semantics blocked", () => {
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
    assert.equal(
      audit.durationAuthority.basis,
      "Planner 19 prospective walking-duration policy v1 over Planner 13 derived distance",
    );

    assert.equal(audit.difficultyAuthority.status, "blocked");
    assert.equal(
      audit.difficultyAuthority.basis,
      "Planner 18 difficulty authority",
    );

    assert.equal(audit.stairsAuthority.status, "blocked");
    assert.equal(
      audit.stairsAuthority.reason,
      "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
    );
    assert.equal(
      audit.stairsAuthority.basis,
      "Planner 18 stairs authority",
    );

    assert.equal(audit.accessibleAuthority.status, "blocked");
    assert.equal(
      audit.accessibleAuthority.basis,
      "Planner 17 accessibility authority",
    );
    assert.equal(audit.strollerAuthority.status, "blocked");
    assert.equal(
      audit.strollerAuthority.reason,
      "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY",
    );
    assert.equal(
      audit.strollerAuthority.basis,
      "Planner 17 stroller authority",
    );
    assert.equal(
      audit.strollerAuthority.policyEvidenceId,
      "sdz-stroller-facility-policy-2026-09-08",
    );

    assert.equal(
      audit.edgeStatusAuthority.status,
      "supported",
    );
    assert.equal(
      audit.edgeStatusAuthority.value,
      "conditional",
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
          requirements: [
            "VISIT_WITHIN_CURRENT_ZOO_HOURS",
            "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
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

test("Planner 18 terrain linkage preserves exact edge-specific blocked reasons", () => {
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

  assert.deepEqual(controlled.difficultyAuthority, {
    status: "blocked",
    reason:
      "EXACT_EDGE_DIFFICULTY_NOT_SOURCED",
    basis:
      "Planner 18 difficulty authority",
    sourceSnapshotId:
      "sdz-pedestrian-direction-way-755054695",
  });
  assert.deepEqual(controlled.stairsAuthority, {
    status: "blocked",
    reason:
      "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
    basis:
      "Planner 18 stairs authority",
    sourceSnapshotId:
      "sdz-pedestrian-direction-way-755054695",
  });

  assert.deepEqual(frontStreet.difficultyAuthority, {
    status: "blocked",
    reason:
      "CORRIDOR_TERRAIN_NOT_EXACT_EDGE_AUTHORITY",
    basis:
      "Planner 18 difficulty authority",
    sourceSnapshotId:
      "sdz-pedestrian-direction-way-755054694",
    corridorTerrainEvidenceId:
      "sdz-corridor-front-street-terrain-evidence",
  });
  assert.deepEqual(frontStreet.stairsAuthority, {
    status: "blocked",
    reason:
      "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
    basis:
      "Planner 18 stairs authority",
    sourceSnapshotId:
      "sdz-pedestrian-direction-way-755054694",
    corridorTerrainEvidenceId:
      "sdz-corridor-front-street-terrain-evidence",
  });
});

test("Planner 17 mobility linkage preserves exact edge-specific blocked reasons", () => {
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

  assert.deepEqual(controlled.accessibleAuthority, {
    status: "blocked",
    reason:
      "EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED",
    basis:
      "Planner 17 accessibility authority",
  });
  assert.deepEqual(frontStreet.accessibleAuthority, {
    status: "blocked",
    reason:
      "CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY",
    basis:
      "Planner 17 accessibility authority",
    corridorEvidenceId:
      "sdz-accessibility-front-street-wheelchair-indicator",
  });
  assert.deepEqual(
    controlled.strollerAuthority,
    frontStreet.strollerAuthority,
  );
});

test("route-edge readiness exposes route nodes, mode, and distance as supported", () => {
  assert.deepEqual(
    assessIngressRouteEdgeReadiness(
      "sdz-geo-main-entrance",
    ),
    {
      status: "partial-route-edge-authority",
      targetId: "sdz-geo-main-entrance",
      auditIds: [
        "sdz-ingress-way-controlled-passage-route-edge-audit",
        "sdz-ingress-way-front-street-connection-route-edge-audit",
      ],
      supportedFields: [
        "routeNodes",
        "mode",
        "distance",
        "duration",
        "status",
      ],
      blockedFields: [
        "difficulty",
        "stairs",
        "accessible",
        "stroller",
        "oneWay",
      ],
      routeEdgeMaterialization: {
        status: "blocked",
        reason: "ROUTE_EDGE_CONTRACT_INCOMPLETE",
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
    assessIngressRouteEdgeReadiness("unknown-target"),
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
                  requirements: [
                    "VISIT_WITHIN_CURRENT_ZOO_HOURS",
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

test("integrity rejects guessed difficulty promotion beyond Planner 18 authority", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit) =>
        audit.sourceWayId === "755054694"
          ? {
              ...audit,
              difficultyAuthority: {
                status: "supported",
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
    /changed Planner 18 terrain linkage/,
  );
});

test("integrity rejects stairs=false inferred from absence of exact steps evidence", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              stairsAuthority: {
                status: "supported",
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
    /changed Planner 18 terrain linkage/,
  );
});

test("integrity rejects accessibility promotion beyond Planner 17 exact-edge authority", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit) =>
        audit.sourceWayId === "755054694"
          ? {
              ...audit,
              accessibleAuthority: {
                status: "supported",
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
    /changed Planner 17 mobility linkage/,
  );
});

test("integrity rejects stroller promotion from facility permission", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              strollerAuthority: {
                status: "supported",
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
    /changed Planner 17 mobility linkage/,
  );
});

test("integrity rejects generic OSM oneway being promoted to pedestrian direction authority", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit) =>
        audit.sourceWayId === "755054695"
          ? {
              ...audit,
              oneWayAuthority: {
                status: "supported",
                value: true,
              } as unknown as RouteEdgeSemanticAudit["oneWayAuthority"],
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed Planner 16 pedestrian-direction linkage|changed blocked-field authority/,
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
    /changed Planner 16 pedestrian-direction linkage/,
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


test("integrity rejects semantic-reason drift while fields remain blocked", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              oneWayAuthority: {
                ...audit.oneWayAuthority,
                reason:
                  "PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED",
              },
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /changed blocked-field authority/,
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
