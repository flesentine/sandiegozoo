import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_EXPANDED_ROUTE_GRAPH_DATA,
} from "../src/data/zooInteriorRouteEdgeMaterialization.ts";
import {
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE,
} from "../src/data/zooInteriorTreetopsEndpointRouteNodeAuthority.ts";
import {
  INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION,
} from "../src/data/zooInteriorTreetopsRouteEdgeContractCompletion.ts";
import {
  INTERIOR_TREETOPS_ROUTE_EDGE,
  INTERIOR_TREETOPS_ROUTE_EDGE_BINDING,
  INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA,
  assertInteriorTreetopsRouteEdgeMaterializationIntegrity,
} from "../src/data/zooInteriorTreetopsRouteEdgeMaterialization.ts";

test("Planner 57 materializes the exact Treetops RouteEdge", () => {
  assert.deepEqual(INTERIOR_TREETOPS_ROUTE_EDGE, {
    id: "sdz-interior-treetops-anchor-to-fern-canyon-route-edge",
    fromNodeId:
      "sdz-interior-front-street-node-1619736626-route-node",
    toNodeId:
      "sdz-interior-treetops-node-13588159626-route-node",
    mode: "walk",
    distanceMeters: 48.615,
    durationMinutes: 0.675,
    difficulty: "easy",
    stairs: "unknown",
    accessible: true,
    stroller: "unknown",
    oneWay: false,
    status: "conditional",
    provenance:
      INTERIOR_TREETOPS_ROUTE_EDGE.provenance,
  });
});

test("Planner 57 preserves unknown capability evidence explicitly", () => {
  assert.equal(
    INTERIOR_TREETOPS_ROUTE_EDGE.stairs,
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.stairsAuthority.value,
  );
  assert.equal(
    INTERIOR_TREETOPS_ROUTE_EDGE.stroller,
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.strollerAuthority.value,
  );
  assert.deepEqual(
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.unresolvedCapabilityEvidence,
    [
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
    ],
  );
});

test("Planner 57 binds runtime activation to exact Treetops availability", () => {
  assert.deepEqual(
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.operationalActivation,
    {
      objectiveSourceRecordId: "sdz-tiger-trail",
      exactSegmentSourceWayId: "148910139",
      sourceWayVersion: 7,
      sourceFromNodeId: "1619736626",
      sourceToNodeId: "13588159626",
      requirements: [
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
        "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
      ],
    },
  );
});

test("Planner 57 appends exactly one node and one edge to the existing expanded graph", () => {
  assert.equal(
    INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeNodes.length,
    INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.routeNodes.length + 1,
  );
  assert.equal(
    INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.length,
    INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.length + 1,
  );

  assert.equal(
    INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeNodes.some(
      (node) => node.id === INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.id,
    ),
    true,
  );
  assert.equal(
    INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.some(
      (edge) => edge.id === INTERIOR_TREETOPS_ROUTE_EDGE.id,
    ),
    true,
  );
});

test("Planner 57 graph IDs remain unique", () => {
  const nodeIds =
    INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeNodes.map(
      (node) => node.id,
    );
  const edgeIds =
    INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.map(
      (edge) => edge.id,
    );

  assert.equal(new Set(nodeIds).size, nodeIds.length);
  assert.equal(new Set(edgeIds).size, edgeIds.length);
});

test("Planner 57 RouteEdge and expanded graph are deeply immutable", () => {
  assert.doesNotThrow(() =>
    assertInteriorTreetopsRouteEdgeMaterializationIntegrity(),
  );
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_ROUTE_EDGE), true);
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_ROUTE_EDGE.provenance),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_ROUTE_EDGE_BINDING),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.operationalActivation,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeNodes,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeEdges,
    ),
    true,
  );
});
