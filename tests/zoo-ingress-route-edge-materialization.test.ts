import assert from "node:assert/strict";
import test from "node:test";
import {
  INGRESS_ROUTE_EDGE_BINDINGS,
  INGRESS_ROUTE_EDGES,
  INGRESS_ROUTE_GRAPH_DATA,
  INGRESS_ROUTE_GRAPH_NODES,
  assertIngressRouteEdgeMaterializationIntegrity,
  ingressRouteEdgeForSourceWay,
} from "../src/data/zooIngressRouteEdgeMaterialization.ts";
import {
  assertValidWildRouteData,
  validateWildRouteData,
} from "../src/planner/validation.ts";
import {
  buildRoutingGraph,
  findShortestRoute,
} from "../src/planner/routing.ts";

test("Planner 23 materializes exactly two first production ingress RouteEdges", () => {
  assert.equal(
    INGRESS_ROUTE_EDGES.length,
    2,
  );
  assert.equal(
    INGRESS_ROUTE_EDGE_BINDINGS.length,
    2,
  );

  assert.deepEqual(
    INGRESS_ROUTE_EDGES.map(
      (edge) => edge.id,
    ),
    [
      "sdz-ingress-way-controlled-passage-route-edge",
      "sdz-ingress-way-front-street-connection-route-edge",
    ],
  );
});

test("controlled passage RouteEdge matches qualified ingress authority", () => {
  assert.deepEqual(
    ingressRouteEdgeForSourceWay(
      "755054695",
    ),
    {
      id:
        "sdz-ingress-way-controlled-passage-route-edge",
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-interior-route-node",
      mode: "walk",
      distanceMeters: 16.836,
      durationMinutes: 0.234,
      difficulty: "unknown",
      stairs: "unknown",
      accessible: "unknown",
      stroller: "unknown",
      oneWay: false,
      status: "conditional",
      provenance: {
        sourceUrl:
          "https://www.openstreetmap.org/way/755054695",
        sourceLabel:
          "OpenStreetMap way 755054695 with qualified WildRoute ingress semantics",
        lastVerified:
          "2026-09-07T23:05:00-07:00",
        confidence: "provisional",
        effectiveFrom:
          "2026-09-07",
      },
    },
  );
});

test("Front Street RouteEdge matches qualified ingress authority", () => {
  assert.deepEqual(
    ingressRouteEdgeForSourceWay(
      "755054694",
    ),
    {
      id:
        "sdz-ingress-way-front-street-connection-route-edge",
      fromNodeId:
        "sdz-ingress-node-interior-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      mode: "walk",
      distanceMeters: 25.376,
      durationMinutes: 0.352,
      difficulty: "unknown",
      stairs: "unknown",
      accessible: "unknown",
      stroller: "unknown",
      oneWay: false,
      status: "conditional",
      provenance: {
        sourceUrl:
          "https://www.openstreetmap.org/way/755054694",
        sourceLabel:
          "OpenStreetMap way 755054694 with qualified WildRoute ingress semantics",
        lastVerified:
          "2026-09-07T23:05:00-07:00",
        confidence: "provisional",
        effectiveFrom:
          "2026-09-07",
      },
    },
  );
});

test("Planner 23 ingress graph is runtime-valid WildRoute data", () => {
  assert.deepEqual(
    validateWildRouteData(
      INGRESS_ROUTE_GRAPH_DATA,
    ),
    [],
  );
  assert.deepEqual(
    INGRESS_ROUTE_GRAPH_NODES.map(
      (node) => node.id,
    ),
    [
      "sdz-ingress-node-main-entrance-route-node",
      "sdz-ingress-node-interior-route-node",
      "sdz-ingress-node-front-street-route-node",
    ],
  );
  assert.doesNotThrow(() =>
    assertValidWildRouteData(
      INGRESS_ROUTE_GRAPH_DATA,
    ),
  );
});

test("conditional ingress edges are unavailable by default", () => {
  const graph = buildRoutingGraph(
    INGRESS_ROUTE_GRAPH_DATA,
  );
  const route = findShortestRoute(
    graph,
    {
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
    },
  );

  assert.deepEqual(
    route,
    {
      status: "not-found",
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      reason: "NO_ROUTE",
    },
  );
});

test("enabling both conditional ingress edges produces the first real entrance-to-Front-Street route", () => {
  const graph = buildRoutingGraph(
    INGRESS_ROUTE_GRAPH_DATA,
  );
  const enabledConditionalEdgeIds =
    new Set(
      INGRESS_ROUTE_EDGES.map(
        (edge) => edge.id,
      ),
    );

  const route = findShortestRoute(
    graph,
    {
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      enabledConditionalEdgeIds,
    },
  );

  assert.equal(route.status, "found");
  if (route.status !== "found") {
    throw new Error(
      "expected real ingress route",
    );
  }

  assert.deepEqual(
    route.edges.map(
      (edge) => edge.edgeId,
    ),
    [
      "sdz-ingress-way-controlled-passage-route-edge",
      "sdz-ingress-way-front-street-connection-route-edge",
    ],
  );
  assert.equal(
    route.distanceMeters,
    42.212,
  );
  assert.equal(
    route.durationMinutes,
    0.586,
  );
});

test("Planner 21 bidirectionality makes the exact ingress route reversible", () => {
  const graph = buildRoutingGraph(
    INGRESS_ROUTE_GRAPH_DATA,
  );
  const enabledConditionalEdgeIds =
    new Set(
      INGRESS_ROUTE_EDGES.map(
        (edge) => edge.id,
      ),
    );

  const route = findShortestRoute(
    graph,
    {
      fromNodeId:
        "sdz-ingress-node-front-street-route-node",
      toNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      enabledConditionalEdgeIds,
    },
  );

  assert.equal(route.status, "found");
  if (route.status !== "found") {
    throw new Error(
      "expected reverse ingress route",
    );
  }

  assert.deepEqual(
    route.edges.map(
      (edge) => edge.edgeId,
    ),
    [
      "sdz-ingress-way-front-street-connection-route-edge",
      "sdz-ingress-way-controlled-passage-route-edge",
    ],
  );
});

test("unknown accessibility fails closed when an accessible route is required", () => {
  const graph = buildRoutingGraph(
    INGRESS_ROUTE_GRAPH_DATA,
  );
  const route = findShortestRoute(
    graph,
    {
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      enabledConditionalEdgeIds:
        new Set(
          INGRESS_ROUTE_EDGES.map(
            (edge) => edge.id,
          ),
        ),
      requireAccessible: true,
    },
  );

  assert.deepEqual(
    route,
    {
      status: "not-found",
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      reason: "NO_ROUTE",
    },
  );
});

test("unknown stroller suitability fails closed when a stroller route is required", () => {
  const graph = buildRoutingGraph(
    INGRESS_ROUTE_GRAPH_DATA,
  );
  const route = findShortestRoute(
    graph,
    {
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      enabledConditionalEdgeIds:
        new Set(
          INGRESS_ROUTE_EDGES.map(
            (edge) => edge.id,
          ),
        ),
      requireStroller: true,
    },
  );

  assert.deepEqual(
    route,
    {
      status: "not-found",
      fromNodeId:
        "sdz-ingress-node-main-entrance-route-node",
      toNodeId:
        "sdz-ingress-node-front-street-route-node",
      reason: "NO_ROUTE",
    },
  );
});

test("operational bindings stay exact-edge scoped", () => {
  assert.deepEqual(
    INGRESS_ROUTE_EDGE_BINDINGS.map(
      (binding) => ({
        sourceWayId:
          binding.sourceWayId,
        routeEdgeId:
          binding.routeEdgeId,
        exactEdgeSourceWayId:
          binding.operationalActivation
            .exactEdgeSourceWayId,
        requirements:
          binding.operationalActivation
            .requirements,
      }),
    ),
    [
      {
        sourceWayId: "755054695",
        routeEdgeId:
          "sdz-ingress-way-controlled-passage-route-edge",
        exactEdgeSourceWayId:
          "755054695",
        requirements: [
          "VISIT_WITHIN_CURRENT_ZOO_HOURS",
          "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
          "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
        ],
      },
      {
        sourceWayId: "755054694",
        routeEdgeId:
          "sdz-ingress-way-front-street-connection-route-edge",
        exactEdgeSourceWayId:
          "755054694",
        requirements: [
          "VISIT_WITHIN_CURRENT_ZOO_HOURS",
          "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
          "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
        ],
      },
    ],
  );
});

test("materialization integrity rejects semantic drift", () => {
  const badEdges = structuredClone(
    INGRESS_ROUTE_EDGES,
  );
  badEdges[0].accessible = true;

  assert.throws(
    () =>
      assertIngressRouteEdgeMaterializationIntegrity(
        badEdges,
        INGRESS_ROUTE_EDGE_BINDINGS,
      ),
    /materialization drifted|lost its conservative production semantics/,
  );
});

test("Planner 23 exports are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGES,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGES[0],
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_EDGE_BINDINGS,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ROUTE_GRAPH_DATA,
    ),
    true,
  );
});
