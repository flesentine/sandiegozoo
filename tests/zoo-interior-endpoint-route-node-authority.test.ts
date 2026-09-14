import assert from "node:assert/strict";
import test from "node:test";

import {
  INTERIOR_ENDPOINT_ROUTE_NODE,
  INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY,
  INTERIOR_ENDPOINT_ROUTE_NODE_BINDING,
  assessInteriorEndpointRouteNode,
  assertInteriorEndpointRouteNodeAuthorityIntegrity,
} from "../src/data/zooInteriorEndpointRouteNodeAuthority.ts";
import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "../src/data/zooInteriorFrontStreetGeometryAuthority.ts";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
} from "../src/data/zooInteriorObjectiveBranchSelectionAuthority.ts";
import {
  INTERIOR_PROVENANCE_AUTHORITY,
} from "../src/data/zooInteriorProvenanceAuthority.ts";
import {
  INGRESS_ROUTE_ZONES,
  routeNodeForSourceObjectId,
} from "../src/data/zooIngressRouteNodeAuthority.ts";
import { validateWildRouteData } from "../src/planner/validation.ts";

test("Planner 38 materializes only the selected Tiger Trail interior endpoint RouteNode", () => {
  const node = INTERIOR_ENDPOINT_ROUTE_NODE;
  const binding = INTERIOR_ENDPOINT_ROUTE_NODE_BINDING;

  assert.equal(node.id, "sdz-interior-front-street-node-1619736626-route-node");
  assert.equal(node.kind, "junction");
  assert.equal(node.zoneId, "sdz-zone-san-diego-zoo");
  assert.equal(node.lat, 32.735201);
  assert.equal(node.lng, -117.1496375);
  assert.equal(binding.sourceObjectId, "1619736626");
  assert.equal(binding.routeNodeId, node.id);
  assert.equal(binding.nodeRole, "junction");
  assert.equal(binding.plannerMaterialization, "route-node");
});

test("Planner 38 is attached to the exact Planner 26 geometry and Planner 27 branch selection", () => {
  const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0]!;
  const branch = INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0]!;
  const candidate = geometry.adjacentJunctionCandidates.find(
    (entry) => entry.node.sourceObjectId === "1619736626",
  );

  assert.ok(candidate);
  assert.equal(branch.selectedCandidateNodeId, candidate.node.sourceObjectId);
  assert.equal(branch.selectedConnectorWayId, candidate.connectorWayId);
  assert.equal(branch.selectedConnectorName, "Treetops Way");
  assert.equal(candidate.node.sourceVersion, 2);
  assert.equal(
    candidate.node.sourceVersionUrl,
    "https://api.openstreetmap.org/api/0.6/node/1619736626/2",
  );
  assert.equal(candidate.node.sourceTimestamp, "2013-12-23T19:47:46Z");
  assert.equal(candidate.node.sourceChangeset, 19606502);
});

test("Planner 38 reuses the existing Zoo routing zone without duplicating ingress source objects", () => {
  assert.ok(
    INGRESS_ROUTE_ZONES.some(
      (zone) => zone.id === INTERIOR_ENDPOINT_ROUTE_NODE.zoneId,
    ),
  );
  assert.equal(routeNodeForSourceObjectId("1619736626"), undefined);
});

test("Planner 38 RouteNode provenance is exact-version pinned but remains provisional", () => {
  const provenance = INTERIOR_ENDPOINT_ROUTE_NODE.provenance;

  assert.deepEqual({ ...provenance }, {
    sourceUrl:
      "https://api.openstreetmap.org/api/0.6/node/1619736626/2",
    sourceLabel:
      "OpenStreetMap node 1619736626 v2 selected as the Tiger Trail Front Street junction",
    lastVerified: INTERIOR_PROVENANCE_AUTHORITY.sourceObservedAt,
    confidence: "provisional",
    effectiveFrom: INTERIOR_PROVENANCE_AUTHORITY.provenance.effectiveFrom,
  });
  assert.equal(
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.provenance,
    INTERIOR_ENDPOINT_ROUTE_NODE.provenance,
  );
});

test("Planner 38 does not globalize the objective-only endpoint selection", () => {
  assert.equal(
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.selectionScope,
    "objective-only",
  );
  assert.equal(
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.globalEndpointSelection,
    "unresolved",
  );
  assert.equal(
    INTERIOR_ENDPOINT_ROUTE_NODE_BINDING.globalEndpointSelection,
    "unresolved",
  );
});

test("Planner 38 keeps exact RouteEdge materialization blocked by stairs and stroller only", () => {
  const result = assessInteriorEndpointRouteNode("sdz-tiger-trail");

  assert.equal(result.status, "route-node-ready");
  if (result.status !== "route-node-ready") {
    assert.fail("Tiger Trail endpoint RouteNode unexpectedly blocked");
  }

  assert.deepEqual(
    result.routeEdgeMaterialization.reasons,
    [
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
    ],
  );
  assert.equal(
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.edgeMaterialization,
    "blocked-until-semantic-completion",
  );
});

test("Planner 38 RouteNode and authority cannot masquerade as a RouteEdge", () => {
  for (const candidate of [
    INTERIOR_ENDPOINT_ROUTE_NODE as unknown as Record<string, unknown>,
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY as unknown as Record<string, unknown>,
    INTERIOR_ENDPOINT_ROUTE_NODE_BINDING as unknown as Record<string, unknown>,
  ]) {
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
      assert.equal(field in candidate, false, field);
    }
  }
});

test("Planner 38 endpoint RouteNode satisfies the base WildRoute data contract", () => {
  const issues = validateWildRouteData({
    schemaVersion: "1",
    zones: [...INGRESS_ROUTE_ZONES],
    places: [],
    routeNodes: [{
      ...INTERIOR_ENDPOINT_ROUTE_NODE,
      provenance: { ...INTERIOR_ENDPOINT_ROUTE_NODE.provenance },
    }],
    routeEdges: [],
    scheduleEvents: [],
  });

  assert.equal(
    issues.some((issue) => issue.severity === "error"),
    false,
    JSON.stringify(issues),
  );
});

test("Planner 38 unsupported objectives fail closed", () => {
  assert.deepEqual(
    { ...assessInteriorEndpointRouteNode("sdz-panda-ridge") },
    {
      status: "blocked",
      reason: "OBJECTIVE_ENDPOINT_ROUTE_NODE_NOT_SOURCED",
      objectiveSourceRecordId: "sdz-panda-ridge",
      globalEndpointSelection: "unresolved",
    },
  );
});

test("Planner 38 rejects non-string or unstable objective identifiers", () => {
  assert.throws(
    () => assessInteriorEndpointRouteNode({} as unknown as string),
    /primitive stable string/,
  );
  assert.throws(
    () => assessInteriorEndpointRouteNode(new String("sdz-tiger-trail") as unknown as string),
    /primitive stable string/,
  );
  assert.throws(
    () => assessInteriorEndpointRouteNode("sdz-tiger-trail "),
    /primitive stable string/,
  );
});

test("Planner 38 exported records ignore Object.prototype RouteEdge pollution after module load", () => {
  const pollutedKeys = ["stairs", "stroller", "fromNodeId", "status"] as const;
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
    Object.defineProperty(Object.prototype, "fromNodeId", {
      value: "polluted-from-node",
      configurable: true,
    });
    Object.defineProperty(Object.prototype, "status", {
      value: "open",
      configurable: true,
    });

    for (const candidate of [
      INTERIOR_ENDPOINT_ROUTE_NODE as unknown as Record<string, unknown>,
      INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY as unknown as Record<string, unknown>,
      INTERIOR_ENDPOINT_ROUTE_NODE_BINDING as unknown as Record<string, unknown>,
      INTERIOR_ENDPOINT_ROUTE_NODE.provenance as unknown as Record<string, unknown>,
    ]) {
      assert.equal(Object.getPrototypeOf(candidate), null);
      for (const key of pollutedKeys) {
        assert.equal(candidate[key], undefined, key);
      }
    }

    const result = assessInteriorEndpointRouteNode("sdz-tiger-trail");
    assert.equal(Object.getPrototypeOf(result), null);
    assert.equal((result as unknown as Record<string, unknown>).stairs, undefined);
    assert.equal((result as unknown as Record<string, unknown>).stroller, undefined);
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

test("Planner 38 static integrity and deep immutability remain green", () => {
  assert.doesNotThrow(() =>
    assertInteriorEndpointRouteNodeAuthorityIntegrity(),
  );
  assert.equal(Object.isFrozen(INTERIOR_ENDPOINT_ROUTE_NODE), true);
  assert.equal(Object.isFrozen(INTERIOR_ENDPOINT_ROUTE_NODE.provenance), true);
  assert.equal(Object.isFrozen(INTERIOR_ENDPOINT_ROUTE_NODE_BINDING), true);
  assert.equal(Object.isFrozen(INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY), true);

  const result = assessInteriorEndpointRouteNode("sdz-tiger-trail");
  assert.equal(Object.isFrozen(result), true);
  if (result.status === "route-node-ready") {
    assert.equal(Object.isFrozen(result.routeEdgeMaterialization), true);
    assert.equal(Object.isFrozen(result.routeEdgeMaterialization.reasons), true);
  }
});
