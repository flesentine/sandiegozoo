import assert from "node:assert/strict";
import test from "node:test";
import {
  INGRESS_ROUTE_NODE_BINDINGS,
  INGRESS_ROUTE_NODES,
  INGRESS_ROUTE_ZONES,
  assessIngressRouteNodeAuthority,
  assertIngressRouteNodeAuthorityIntegrity,
  routeNodeForSourceObjectId,
  type IngressRouteNodeBinding,
} from "../src/data/zooIngressRouteNodeAuthority.ts";
import type {
  RouteNode,
  ZoneRecord,
} from "../src/planner/contracts.ts";
import {
  validateWildRouteData,
} from "../src/planner/validation.ts";

const EXPECTED_NODES = [
  {
    sourceObjectId: "7053320514",
    routeNodeId:
      "sdz-ingress-node-main-entrance-route-node",
    kind: "entrance",
    lat: 32.735256,
    lng: -117.149182,
  },
  {
    sourceObjectId: "7053320517",
    routeNodeId:
      "sdz-ingress-node-turnstile-route-node",
    kind: "junction",
    lat: 32.7352359,
    lng: -117.1492666,
  },
  {
    sourceObjectId: "7053320516",
    routeNodeId:
      "sdz-ingress-node-interior-route-node",
    kind: "junction",
    lat: 32.7352145,
    lng: -117.1493551,
  },
  {
    sourceObjectId: "13587192693",
    routeNodeId:
      "sdz-ingress-node-interior-junction-route-node",
    kind: "junction",
    lat: 32.7351734,
    lng: -117.1494973,
  },
  {
    sourceObjectId: "7053320515",
    routeNodeId:
      "sdz-ingress-node-front-street-route-node",
    kind: "junction",
    lat: 32.7351404,
    lng: -117.1496117,
  },
] as const;

test("Planner 15 materializes one conservative Zoo zone from official map authority", () => {
  assert.deepEqual(INGRESS_ROUTE_ZONES, [
    {
      id: "sdz-zone-san-diego-zoo",
      name: "San Diego Zoo",
      provenance: {
        sourceUrl:
          "https://zoo.sandiegozoo.org/sites/default/files/2026-01/01-05-26_Zoo%20Map_web.pdf",
        sourceLabel:
          "San Diego Zoo — Zoo Map V01.05.26",
        lastVerified:
          "2026-09-07T21:53:00-07:00",
        confidence: "verified",
        effectiveFrom: "2026-01-05",
      },
    },
  ]);
});

test("every qualified ingress geometry node becomes one exact Planner RouteNode", () => {
  assert.equal(
    INGRESS_ROUTE_NODES.length,
    EXPECTED_NODES.length,
  );
  assert.equal(
    INGRESS_ROUTE_NODE_BINDINGS.length,
    EXPECTED_NODES.length,
  );

  for (const expected of EXPECTED_NODES) {
    const routeNode =
      routeNodeForSourceObjectId(
        expected.sourceObjectId,
      );
    assert.ok(routeNode);
    assert.equal(routeNode.id, expected.routeNodeId);
    assert.equal(routeNode.kind, expected.kind);
    assert.equal(
      routeNode.zoneId,
      "sdz-zone-san-diego-zoo",
    );
    assert.equal(routeNode.lat, expected.lat);
    assert.equal(routeNode.lng, expected.lng);
    assert.deepEqual(routeNode.provenance, {
      sourceUrl:
        `https://www.openstreetmap.org/node/${expected.sourceObjectId}`,
      sourceLabel:
        `OpenStreetMap node ${expected.sourceObjectId}`,
      lastVerified:
        "2026-09-07T23:05:00-07:00",
      confidence: "verified",
      effectiveFrom: "2026-09-07",
    });
  }
});

test("route-node bindings remain one-to-one with source objects", () => {
  assert.deepEqual(
    INGRESS_ROUTE_NODE_BINDINGS.map(
      (binding) => ({
        sourceObjectId: binding.sourceObjectId,
        routeNodeId: binding.routeNodeId,
        nodeRole: binding.nodeRole,
      }),
    ),
    EXPECTED_NODES.map((expected) => ({
      sourceObjectId: expected.sourceObjectId,
      routeNodeId: expected.routeNodeId,
      nodeRole: expected.kind,
    })),
  );
});

test("Planner 15 route-node slice satisfies Planner 1 data validation", () => {
  const issues = validateWildRouteData({
    schemaVersion: "1",
    zones: [...INGRESS_ROUTE_ZONES],
    places: [],
    routeNodes: [...INGRESS_ROUTE_NODES],
    routeEdges: [],
    scheduleEvents: [],
  });

  assert.deepEqual(
    issues.filter(
      (issue) => issue.severity === "error",
    ),
    [],
  );
  assert.equal(
    issues.filter(
      (issue) =>
        issue.code === "ORPHAN_ROUTE_NODE",
    ).length,
    EXPECTED_NODES.length,
  );
});

test("route-node readiness is scoped to sourced ingress geometry", () => {
  assert.deepEqual(
    assessIngressRouteNodeAuthority(
      "sdz-geo-main-entrance",
    ),
    {
      status: "route-nodes-ready",
      targetId: "sdz-geo-main-entrance",
      zoneIds: ["sdz-zone-san-diego-zoo"],
      routeNodeIds: EXPECTED_NODES.map(
        (expected) => expected.routeNodeId,
      ),
      sourceObjectIds: EXPECTED_NODES.map(
        (expected) => expected.sourceObjectId,
      ),
      routeEdges: {
        status: "blocked",
        reason: "ROUTE_EDGE_CONTRACT_INCOMPLETE",
      },
    },
  );

  assert.deepEqual(
    assessIngressRouteNodeAuthority(
      "sdz-geo-wegeforth-bowl",
    ),
    {
      status: "blocked",
      reason:
        "INGRESS_ROUTE_NODE_GEOMETRY_NOT_SOURCED",
      targetId: "sdz-geo-wegeforth-bowl",
    },
  );

  assert.deepEqual(
    assessIngressRouteNodeAuthority(
      "unknown-target",
    ),
    {
      status: "blocked",
      reason: "TARGET_UNKNOWN",
      targetId: "unknown-target",
    },
  );
});

test("Planner 15 exports are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INGRESS_ROUTE_ZONES),
    true,
  );
  assert.equal(
    Object.isFrozen(INGRESS_ROUTE_ZONES[0]),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_ZONES[0].provenance,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(INGRESS_ROUTE_NODES),
    true,
  );
  assert.equal(
    Object.isFrozen(INGRESS_ROUTE_NODES[0]),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_NODES[0].provenance,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_NODE_BINDINGS,
    ),
    true,
  );
});

test("integrity rejects route-node coordinate drift", () => {
  const badNodes: RouteNode[] =
    INGRESS_ROUTE_NODES.map(
      (routeNode, index) =>
        index === 0
          ? {
              ...routeNode,
              lat: routeNode.lat + 0.001,
            }
          : { ...routeNode },
    );

  assert.throws(
    () =>
      assertIngressRouteNodeAuthorityIntegrity(
        INGRESS_ROUTE_ZONES,
        badNodes,
        INGRESS_ROUTE_NODE_BINDINGS,
      ),
    /changed its qualified source-backed materialization/,
  );
});

test("integrity rejects route-node role promotion", () => {
  const badNodes: RouteNode[] =
    INGRESS_ROUTE_NODES.map(
      (routeNode, index) =>
        index === 1
          ? {
              ...routeNode,
              kind: "entrance",
            }
          : { ...routeNode },
    );

  assert.throws(
    () =>
      assertIngressRouteNodeAuthorityIntegrity(
        INGRESS_ROUTE_ZONES,
        badNodes,
        INGRESS_ROUTE_NODE_BINDINGS,
      ),
    /changed its qualified source-backed materialization/,
  );
});

test("integrity rejects route-node provenance drift", () => {
  const badNodes: RouteNode[] =
    INGRESS_ROUTE_NODES.map(
      (routeNode, index) =>
        index === 2
          ? {
              ...routeNode,
              provenance: {
                ...routeNode.provenance,
                sourceUrl:
                  "https://example.com/guessed-node",
              },
            }
          : { ...routeNode },
    );

  assert.throws(
    () =>
      assertIngressRouteNodeAuthorityIntegrity(
        INGRESS_ROUTE_ZONES,
        badNodes,
        INGRESS_ROUTE_NODE_BINDINGS,
      ),
    /changed its qualified source-backed materialization/,
  );
});

test("integrity rejects routing-zone provenance drift", () => {
  const badZones: ZoneRecord[] = [
    {
      ...INGRESS_ROUTE_ZONES[0],
      provenance: {
        ...INGRESS_ROUTE_ZONES[0].provenance,
        confidence: "provisional",
      },
    },
  ];

  assert.throws(
    () =>
      assertIngressRouteNodeAuthorityIntegrity(
        badZones,
        INGRESS_ROUTE_NODES,
        INGRESS_ROUTE_NODE_BINDINGS,
      ),
    /routing zone drifted from official map authority/,
  );
});

test("integrity rejects duplicate source bindings", () => {
  const badBindings: IngressRouteNodeBinding[] =
    INGRESS_ROUTE_NODE_BINDINGS.map(
      (binding, index) =>
        index === 1
          ? {
              ...binding,
              sourceGeometryNodeId:
                INGRESS_ROUTE_NODE_BINDINGS[0]
                  .sourceGeometryNodeId,
              sourceObjectId:
                INGRESS_ROUTE_NODE_BINDINGS[0]
                  .sourceObjectId,
            }
          : { ...binding },
    );

  assert.throws(
    () =>
      assertIngressRouteNodeAuthorityIntegrity(
        INGRESS_ROUTE_ZONES,
        INGRESS_ROUTE_NODES,
        badBindings,
      ),
    /does not match source geometry authority|duplicated/,
  );
});

test("integrity rejects hidden RouteEdge fields on route nodes", () => {
  const leaked = {
    ...INGRESS_ROUTE_NODES[0],
    durationMinutes: 1,
  } as unknown as RouteNode;

  assert.throws(
    () =>
      assertIngressRouteNodeAuthorityIntegrity(
        INGRESS_ROUTE_ZONES,
        [
          leaked,
          ...INGRESS_ROUTE_NODES.slice(1),
        ],
        INGRESS_ROUTE_NODE_BINDINGS,
      ),
    /cannot materialize Planner RouteEdge field durationMinutes/,
  );
});
