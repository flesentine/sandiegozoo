import assert from "node:assert/strict";
import test from "node:test";

import {
  INGRESS_ROUTE_EDGES,
} from "../src/data/zooIngressRouteEdgeMaterialization.ts";
import {
  INTERIOR_PROVENANCE_AUTHORITY,
} from "../src/data/zooInteriorProvenanceAuthority.ts";
import {
  INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION,
} from "../src/data/zooInteriorRouteEdgeContractCompletion.ts";
import {
  INTERIOR_EXPANDED_ROUTE_EDGES,
  INTERIOR_EXPANDED_ROUTE_GRAPH_DATA,
  INTERIOR_EXPANDED_ROUTE_GRAPH_NODES,
  INTERIOR_ROUTE_EDGE,
  INTERIOR_ROUTE_EDGE_BINDING,
  assertInteriorRouteEdgeMaterializationIntegrity,
} from "../src/data/zooInteriorRouteEdgeMaterialization.ts";
import {
  assertValidWildRouteData,
  validateWildRouteData,
} from "../src/planner/validation.ts";
import {
  buildRoutingGraph,
  findShortestRoute,
} from "../src/planner/routing.ts";

const ENTRANCE_NODE =
  "sdz-ingress-node-main-entrance-route-node";
const FRONT_STREET_NODE =
  "sdz-ingress-node-front-street-route-node";
const TIGER_BRANCH_NODE =
  "sdz-interior-front-street-node-1619736626-route-node";
const INTERIOR_EDGE_ID =
  "sdz-interior-tiger-trail-front-street-route-edge";

test("Planner 40 materializes the first exact interior RouteEdge", () => {
  assert.deepEqual(
    {
      ...INTERIOR_ROUTE_EDGE,
      provenance: { ...INTERIOR_ROUTE_EDGE.provenance },
    },
    {
      id: INTERIOR_EDGE_ID,
      fromNodeId: FRONT_STREET_NODE,
      toNodeId: TIGER_BRANCH_NODE,
      mode: "walk",
      distanceMeters: 7.157,
      durationMinutes: 0.099,
      difficulty: "easy",
      stairs: "unknown",
      accessible: true,
      stroller: "unknown",
      oneWay: false,
      status: "conditional",
      provenance: {
        sourceUrl:
          "https://api.openstreetmap.org/api/0.6/way/1481425058/1",
        sourceLabel:
          "OpenStreetMap way 1481425058 v1 with WildRoute exact-segment semantic lineage",
        lastVerified: "2026-09-10T23:02:16-07:00",
        confidence: "provisional",
        effectiveFrom: "2026-09-10",
      },
    },
  );
});

test("Planner 40 derives unknown capabilities from Planner 39 without resolving their evidence", () => {
  assert.equal(
    INTERIOR_ROUTE_EDGE.stairs,
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.stairsAuthority.value,
  );
  assert.equal(
    INTERIOR_ROUTE_EDGE.stroller,
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.strollerAuthority.value,
  );
  assert.equal(INTERIOR_ROUTE_EDGE.stairs, "unknown");
  assert.equal(INTERIOR_ROUTE_EDGE.stroller, "unknown");
  assert.deepEqual(
    INTERIOR_ROUTE_EDGE_BINDING.unresolvedCapabilityEvidence,
    [
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
    ],
  );
  assert.equal(
    INTERIOR_ROUTE_EDGE_BINDING.capabilityEvidenceState,
    "unresolved-preserved-as-explicit-unknown",
  );
});

test("Planner 40 preserves provisional provenance and unresolved Planner 37 evidence lineage", () => {
  assert.equal(INTERIOR_ROUTE_EDGE.provenance.confidence, "provisional");
  assert.equal(
    INTERIOR_ROUTE_EDGE.provenance,
    INTERIOR_PROVENANCE_AUTHORITY.provenance,
  );
  assert.equal(INTERIOR_PROVENANCE_AUTHORITY.semanticCompletion, "blocked");
  assert.deepEqual(
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers,
    [
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
    ],
  );
});

test("Planner 40 operational binding remains exact-segment scoped and excludes ingress closure semantics", () => {
  assert.deepEqual(
    INTERIOR_ROUTE_EDGE_BINDING.operationalActivation,
    {
      objectiveSourceRecordId: "sdz-tiger-trail",
      exactSegmentSourceWayId: "1481425058",
      sourceFromNodeId: "7053320515",
      sourceToNodeId: "1619736626",
      requirements: [
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
        "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
      ],
    },
  );
  assert.equal(
    INTERIOR_ROUTE_EDGE_BINDING.operationalActivation.requirements.includes(
      "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT" as never,
    ),
    false,
  );
});

test("Planner 40 expanded graph is runtime-valid WildRoute data", () => {
  assert.deepEqual(validateWildRouteData(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA), []);
  assert.doesNotThrow(() =>
    assertValidWildRouteData(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA),
  );

  assert.equal(
    INTERIOR_EXPANDED_ROUTE_GRAPH_NODES.length,
    4,
  );
  assert.equal(
    INTERIOR_EXPANDED_ROUTE_EDGES.length,
    3,
  );
  assert.equal(
    INTERIOR_EXPANDED_ROUTE_GRAPH_NODES.at(-1)?.id,
    TIGER_BRANCH_NODE,
  );
  assert.equal(
    INTERIOR_EXPANDED_ROUTE_EDGES.at(-1)?.id,
    INTERIOR_EDGE_ID,
  );
});

test("conditional interior RouteEdge is unavailable by default", () => {
  const graph = buildRoutingGraph(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA);
  const route = findShortestRoute(graph, {
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
  });

  assert.deepEqual(route, {
    status: "not-found",
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
    reason: "NO_ROUTE",
  });
});

test("inherited conditional-edge activation IDs cannot bypass default-unavailable routing", () => {
  const graph = buildRoutingGraph(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA);
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    Object.prototype,
    "enabledConditionalEdgeIds",
  );

  try {
    Object.defineProperty(Object.prototype, "enabledConditionalEdgeIds", {
      value: [INTERIOR_EDGE_ID],
      configurable: true,
    });

    const request = {
      fromNodeId: FRONT_STREET_NODE,
      toNodeId: TIGER_BRANCH_NODE,
    };
    assert.equal(
      Object.hasOwn(request, "enabledConditionalEdgeIds"),
      false,
    );

    assert.deepEqual(findShortestRoute(graph, request), {
      status: "not-found",
      fromNodeId: FRONT_STREET_NODE,
      toNodeId: TIGER_BRANCH_NODE,
      reason: "NO_ROUTE",
    });
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(
        Object.prototype,
        "enabledConditionalEdgeIds",
        originalDescriptor,
      );
    } else {
      delete (Object.prototype as Record<string, unknown>)
        .enabledConditionalEdgeIds;
    }
  }
});

test("enabling the exact interior edge creates the qualified Front Street branch route", () => {
  const graph = buildRoutingGraph(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA);
  const route = findShortestRoute(graph, {
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
    enabledConditionalEdgeIds: new Set([INTERIOR_EDGE_ID]),
  });

  assert.equal(route.status, "found");
  if (route.status !== "found") {
    assert.fail("expected the qualified interior route");
  }
  assert.deepEqual(
    route.edges.map((edge) => edge.edgeId),
    [INTERIOR_EDGE_ID],
  );
  assert.equal(route.distanceMeters, 7.157);
  assert.equal(route.durationMinutes, 0.099);
});

test("Planner 29 bidirectionality makes the materialized interior edge reversible", () => {
  const graph = buildRoutingGraph(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA);
  const route = findShortestRoute(graph, {
    fromNodeId: TIGER_BRANCH_NODE,
    toNodeId: FRONT_STREET_NODE,
    enabledConditionalEdgeIds: new Set([INTERIOR_EDGE_ID]),
  });

  assert.equal(route.status, "found");
  if (route.status !== "found") {
    assert.fail("expected the reverse interior route");
  }
  assert.deepEqual(
    route.edges.map((edge) => edge.edgeId),
    [INTERIOR_EDGE_ID],
  );
});

test("Planner 33 accessible=true survives materialization for the exact interior edge", () => {
  const graph = buildRoutingGraph(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA);
  const route = findShortestRoute(graph, {
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
    enabledConditionalEdgeIds: new Set([INTERIOR_EDGE_ID]),
    requireAccessible: true,
  });

  assert.equal(route.status, "found");
});

test("Planner 39 stroller=unknown still fails closed when stroller routing is required", () => {
  const graph = buildRoutingGraph(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA);
  const route = findShortestRoute(graph, {
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
    enabledConditionalEdgeIds: new Set([INTERIOR_EDGE_ID]),
    requireStroller: true,
  });

  assert.deepEqual(route, {
    status: "not-found",
    fromNodeId: FRONT_STREET_NODE,
    toNodeId: TIGER_BRANCH_NODE,
    reason: "NO_ROUTE",
  });
});

test("enabling all three conditional edges extends the real entrance route to the Tiger branch node", () => {
  const graph = buildRoutingGraph(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA);
  const enabledConditionalEdgeIds = new Set([
    ...INGRESS_ROUTE_EDGES.map((edge) => edge.id),
    INTERIOR_EDGE_ID,
  ]);

  const route = findShortestRoute(graph, {
    fromNodeId: ENTRANCE_NODE,
    toNodeId: TIGER_BRANCH_NODE,
    enabledConditionalEdgeIds,
  });

  assert.equal(route.status, "found");
  if (route.status !== "found") {
    assert.fail("expected the expanded entrance-to-interior route");
  }
  assert.deepEqual(
    route.edges.map((edge) => edge.edgeId),
    [
      "sdz-ingress-way-controlled-passage-route-edge",
      "sdz-ingress-way-front-street-connection-route-edge",
      INTERIOR_EDGE_ID,
    ],
  );
  assert.equal(route.distanceMeters, 49.369);
  assert.equal(route.durationMinutes, 0.685);
});

test("Planner 40 remains objective-only and does not globalize the Front Street endpoint", () => {
  assert.equal(INTERIOR_ROUTE_EDGE_BINDING.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(INTERIOR_ROUTE_EDGE_BINDING.selectionScope, "objective-only");
  assert.equal(INTERIOR_ROUTE_EDGE_BINDING.globalEndpointSelection, "unresolved");
});

test("Planner 40 materialization integrity and exports are deeply immutable", () => {
  assert.doesNotThrow(() => assertInteriorRouteEdgeMaterializationIntegrity());
  assert.equal(Object.isFrozen(INTERIOR_ROUTE_EDGE), true);
  assert.equal(Object.isFrozen(INTERIOR_ROUTE_EDGE.provenance), true);
  assert.equal(Object.isFrozen(INTERIOR_ROUTE_EDGE_BINDING), true);
  assert.equal(
    Object.isFrozen(INTERIOR_ROUTE_EDGE_BINDING.operationalActivation),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_ROUTE_EDGE_BINDING.unresolvedCapabilityEvidence),
    true,
  );
  assert.equal(Object.isFrozen(INTERIOR_EXPANDED_ROUTE_GRAPH_DATA), true);
  assert.equal(Object.isFrozen(INTERIOR_EXPANDED_ROUTE_GRAPH_NODES), true);
  assert.equal(Object.isFrozen(INTERIOR_EXPANDED_ROUTE_EDGES), true);
});
