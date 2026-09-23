import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY,
} from "../src/data/zooInteriorTreetopsV7GeometryAuthority.ts";
import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
} from "../src/data/zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import {
  INTERIOR_TREETOPS_PROVENANCE_AUTHORITY,
} from "../src/data/zooInteriorTreetopsProvenanceAuthority.ts";
import {
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE,
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY,
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_BINDING,
  assessInteriorTreetopsEndpointRouteNode,
} from "../src/data/zooInteriorTreetopsEndpointRouteNodeAuthority.ts";

test("Planner 55 materializes exact Treetops junction node 13588159626", () => {
  const node = INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY;

  assert.equal(node.sourceObjectId, "13588159626");
  assert.equal(node.sourceVersion, 1);
  assert.equal(
    node.sourceVersionUrl,
    "https://api.openstreetmap.org/api/0.6/node/13588159626/1",
  );
  assert.equal(node.sourceTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(node.sourceChangeset, 178875075);
  assert.equal(node.lat, 32.7352422);
  assert.equal(node.lng, -117.1501397);
});

test("Planner 55 endpoint remains attached to Treetops topology selection", () => {
  const topology = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];

  assert.equal(topology.nextJunctionNodeId, "13588159626");
  assert.equal(topology.nextJunctionTreetopsIndex, 6);
  assert.equal(
    geometry.nodes[6].sourceObjectId,
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceObjectId,
  );
});

test("Planner 55 RouteNode uses the Zoo zone and provisional provenance", () => {
  assert.equal(
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.zoneId,
    "sdz-zone-san-diego-zoo",
  );
  assert.equal(
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.kind,
    "junction",
  );
  assert.equal(
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.provenance.confidence,
    "provisional",
  );
  assert.equal(
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.provenance.lastVerified,
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceObservedAt,
  );
});

test("Planner 55 binding points only to the exact source-backed RouteNode", () => {
  assert.equal(
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_BINDING.routeNodeId,
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.id,
  );
  assert.equal(
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_BINDING.sourceObjectId,
    "13588159626",
  );
  assert.equal(
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_BINDING.nodeRole,
    "junction",
  );
  assert.equal(
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_BINDING.plannerMaterialization,
    "route-node",
  );
});

test("Planner 55 still blocks RouteEdge materialization", () => {
  const assessment =
    assessInteriorTreetopsEndpointRouteNode("sdz-tiger-trail");

  assert.equal(assessment.status, "route-node-ready");
  if (assessment.status !== "route-node-ready") {
    assert.fail("expected route-node-ready assessment");
  }
  assert.equal(assessment.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(
    assessment.routeNodeId,
    "sdz-interior-treetops-node-13588159626-route-node",
  );
  assert.equal(assessment.sourceObjectId, "13588159626");
  assert.equal(assessment.zoneId, "sdz-zone-san-diego-zoo");
  assert.equal(assessment.routeEdgeMaterialization.status, "blocked");
  assert.deepEqual(assessment.routeEdgeMaterialization.reasons, [
    "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  ]);
});

test("Planner 55 does not materialize RouteEdge fields", () => {
  for (const record of [
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY,
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_BINDING,
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE,
  ] as readonly unknown[]) {
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
    ]) {
      assert.equal(
        field in (record as Record<string, unknown>),
        false,
      );
    }
  }
});

test("Planner 55 exports and assessments are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_BINDING),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.provenance),
    true,
  );

  const assessment =
    assessInteriorTreetopsEndpointRouteNode("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "route-node-ready") {
    assert.equal(
      Object.isFrozen(assessment.routeEdgeMaterialization),
      true,
    );
    assert.equal(
      Object.isFrozen(assessment.routeEdgeMaterialization.reasons),
      true,
    );
  }
});


test("Planner 55 RouteNode exports ignore Object.prototype pollution", () => {
  const pollutedFields = [
    "stairs",
    "stroller",
    "distanceMeters",
  ] as const;

  try {
    for (const field of pollutedFields) {
      Object.defineProperty(Object.prototype, field, {
        configurable: true,
        value: "polluted",
      });
    }

    const records = [
      INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY,
      INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_BINDING,
      INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE,
      INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.provenance,
    ] as readonly object[];

    for (const record of records) {
      assert.equal(Object.getPrototypeOf(record), null);
      for (const field of pollutedFields) {
        assert.equal(
          field in (record as Record<string, unknown>),
          false,
        );
        assert.equal(
          (record as Record<string, unknown>)[field],
          undefined,
        );
      }
    }

    const ready =
      assessInteriorTreetopsEndpointRouteNode("sdz-tiger-trail");
    assert.equal(Object.getPrototypeOf(ready), null);
    assert.equal(ready.status, "route-node-ready");
    if (ready.status !== "route-node-ready") {
      assert.fail("expected route-node-ready assessment");
    }
    assert.equal(
      Object.getPrototypeOf(ready.routeEdgeMaterialization),
      null,
    );
    for (const field of pollutedFields) {
      assert.equal(
        field in (ready as unknown as Record<string, unknown>),
        false,
      );
    }

    const blocked =
      assessInteriorTreetopsEndpointRouteNode("sdz-gorilla-tropics");
    assert.equal(Object.getPrototypeOf(blocked), null);
    assert.equal(blocked.status, "blocked");
    for (const field of pollutedFields) {
      assert.equal(
        field in (blocked as unknown as Record<string, unknown>),
        false,
      );
    }
  } finally {
    for (const field of pollutedFields) {
      delete (Object.prototype as Record<string, unknown>)[field];
    }
  }
});
