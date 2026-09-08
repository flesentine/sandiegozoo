import assert from "node:assert/strict";
import test from "node:test";
import {
  INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS,
  OSM_PEDESTRIAN_SEMANTIC_REFERENCES,
  assessIngressRouteEdgeReadiness,
  assertIngressRouteEdgeSemanticAuditIntegrity,
  type RouteEdgeSemanticAudit,
} from "../src/data/zooIngressEdgeSemanticsAuthority.ts";

test("controlled entrance passage supports walk mode and derived distance without promoting generic oneway", () => {
  const audit = INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
    (candidate) => candidate.sourceWayId === "755054695",
  );
  assert.ok(audit);

  assert.deepEqual(audit.sourceTags, {
    highway: "pedestrian",
    oneway: "yes",
    tunnel: "building_passage",
  });
  assert.deepEqual(audit.mode, {
    status: "supported",
    value: "walk",
    basis: "OSM highway=pedestrian",
  });
  assert.deepEqual(audit.distance, {
    status: "supported",
    value: 16.836,
    basis:
      "Planner 13 Haversine sum over frozen OSM way node sequence",
  });
  assert.deepEqual(audit.oneWay, {
    status: "blocked",
    reason: "GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT",
  });
});

test("interior Front Street connection supports walk mode and distance while pedestrian direction remains unsourced", () => {
  const audit = INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.find(
    (candidate) => candidate.sourceWayId === "755054694",
  );
  assert.ok(audit);

  assert.deepEqual(audit.sourceTags, {
    highway: "pedestrian",
  });
  assert.deepEqual(audit.mode, {
    status: "supported",
    value: "walk",
    basis: "OSM highway=pedestrian",
  });
  assert.deepEqual(audit.distance, {
    status: "supported",
    value: 25.376,
    basis:
      "Planner 13 Haversine sum over frozen OSM way node sequence",
  });
  assert.deepEqual(audit.oneWay, {
    status: "blocked",
    reason:
      "PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED",
  });
});

test("all current ingress audits keep unsupported RouteEdge semantics blocked", () => {
  assert.equal(
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.length,
    2,
  );

  for (const audit of INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS) {
    assert.equal(audit.routeNodes.status, "blocked");
    assert.equal(
      audit.routeNodes.reason,
      "PLANNER_ROUTE_NODES_NOT_MATERIALIZED",
    );

    assert.equal(audit.duration.status, "blocked");
    assert.equal(
      audit.duration.reason,
      "DURATION_POLICY_NOT_SOURCED",
    );

    assert.equal(audit.difficulty.status, "blocked");
    assert.equal(
      audit.difficulty.reason,
      "DIFFICULTY_NOT_SOURCED",
    );

    assert.equal(audit.stairs.status, "blocked");
    assert.equal(
      audit.stairs.reason,
      "STAIRS_NOT_EXPLICITLY_SOURCED",
    );

    assert.equal(audit.accessible.status, "blocked");
    assert.equal(
      audit.accessible.reason,
      "WHEELCHAIR_ACCESS_NOT_SOURCED",
    );

    assert.equal(audit.stroller.status, "blocked");
    assert.equal(
      audit.stroller.reason,
      "STROLLER_ACCESS_NOT_SOURCED",
    );

    assert.equal(audit.edgeStatus.status, "blocked");
    assert.equal(
      audit.edgeStatus.reason,
      "EDGE_STATUS_NOT_SOURCED",
    );

    assert.equal(
      audit.plannerMaterialization,
      "route-edge-audit-only",
    );
  }
});

test("route-edge readiness exposes only mode and distance as supported", () => {
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
      supportedFields: ["mode", "distance"],
      blockedFields: [
        "routeNodes",
        "duration",
        "difficulty",
        "stairs",
        "accessible",
        "stroller",
        "oneWay",
        "status",
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
      INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS[0].mode,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS[0].oneWay,
    ),
    true,
  );
});

test("integrity rejects mode promotion beyond the sourced pedestrian tag", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit, index) =>
        index === 0
          ? {
              ...audit,
              mode: {
                ...audit.mode,
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
              distance: {
                ...audit.distance,
                value: audit.distance.value + 1,
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

test("integrity rejects generic OSM oneway being promoted to pedestrian direction authority", () => {
  const badAudits: RouteEdgeSemanticAudit[] =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
      (audit) =>
        audit.sourceWayId === "755054695"
          ? {
              ...audit,
              oneWay: {
                status: "supported",
                value: true,
              } as unknown as RouteEdgeSemanticAudit["oneWay"],
            }
          : { ...audit },
    );

  assert.throws(
    () =>
      assertIngressRouteEdgeSemanticAuditIntegrity(
        badAudits,
      ),
    /improperly promoted an unsupported field/,
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
