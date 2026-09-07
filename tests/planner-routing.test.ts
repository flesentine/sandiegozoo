import assert from "node:assert/strict";
import test from "node:test";
import type {
  RouteEdge,
  RouteMode,
  RouteNode,
  SourceProvenance,
  WildRouteDataPackage,
} from "../src/planner/contracts.ts";
import {
  buildRoutingGraph,
  findShortestRoute,
} from "../src/planner/routing.ts";

const provenance: SourceProvenance = {
  sourceUrl: "https://example.invalid/routing-fixture",
  sourceLabel: "Synthetic routing fixture",
  lastVerified: "2026-09-06T20:00:00-07:00",
  confidence: "verified",
};

function node(id: string): RouteNode {
  return {
    id,
    kind: id === "a" ? "entrance" : "junction",
    zoneId: "fixture-zone",
    lat: 0,
    lng: 0,
    provenance,
  };
}

function edge(
  id: string,
  fromNodeId: string,
  toNodeId: string,
  overrides: Partial<RouteEdge> = {},
): RouteEdge {
  return {
    id,
    fromNodeId,
    toNodeId,
    mode: "walk",
    distanceMeters: 100,
    durationMinutes: 2,
    difficulty: "easy",
    stairs: false,
    accessible: true,
    stroller: true,
    oneWay: false,
    status: "open",
    provenance,
    ...overrides,
  };
}

function graph(
  nodes: string[],
  edges: RouteEdge[],
): WildRouteDataPackage {
  return {
    schemaVersion: "1",
    zones: [
      {
        id: "fixture-zone",
        name: "Fixture Zone",
        provenance,
      },
    ],
    places: [],
    routeNodes: nodes.map(node),
    routeEdges: edges,
    scheduleEvents: [],
  };
}

function routeData(
  data: WildRouteDataPackage,
  request: Parameters<typeof findShortestRoute>[1],
) {
  return findShortestRoute(buildRoutingGraph(data), request);
}

function found(
  result: ReturnType<typeof findShortestRoute>,
) {
  assert.equal(result.status, "found");
  if (result.status !== "found") {
    throw new Error("Expected route to be found.");
  }
  return result;
}

test("builds reverse traversal only for non-one-way edges", () => {
  const data = graph(
    ["a", "b", "c"],
    [
      edge("two-way", "a", "b"),
      edge("one-way", "b", "c", { oneWay: true }),
    ],
  );

  const routing = buildRoutingGraph(data);

  assert.deepEqual(
    routing.declaredOutgoing("b").map((item) => [
      item.edgeId,
      item.toNodeId,
      item.reversed,
    ]),
    [
      ["one-way", "c", false],
      ["two-way", "a", true],
    ],
  );
  assert.equal(
    routing.declaredOutgoing("c").some((item) => item.edgeId === "one-way"),
    false,
  );
});

test("chooses the shortest duration route and reports exact totals", () => {
  const data = graph(
    ["a", "b", "c", "d"],
    [
      edge("slow-direct", "a", "d", {
        distanceMeters: 80,
        durationMinutes: 10,
      }),
      edge("fast-1", "a", "b", {
        distanceMeters: 100,
        durationMinutes: 2,
      }),
      edge("fast-2", "b", "d", {
        distanceMeters: 120,
        durationMinutes: 2.5,
      }),
      edge("decoy", "a", "c", {
        distanceMeters: 10,
        durationMinutes: 20,
      }),
    ],
  );

  const route = found(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "d",
    }),
  );

  assert.deepEqual(route.nodeIds, ["a", "b", "d"]);
  assert.deepEqual(route.edges.map((item) => item.edgeId), ["fast-1", "fast-2"]);
  assert.equal(route.distanceMeters, 220);
  assert.equal(route.durationMinutes, 4.5);
});

test("can optimize distance instead of duration", () => {
  const data = graph(
    ["a", "b", "d"],
    [
      edge("short-slow", "a", "d", {
        distanceMeters: 80,
        durationMinutes: 10,
      }),
      edge("long-fast-1", "a", "b", {
        distanceMeters: 100,
        durationMinutes: 2,
      }),
      edge("long-fast-2", "b", "d", {
        distanceMeters: 120,
        durationMinutes: 2,
      }),
    ],
  );

  const route = found(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "d",
      optimize: "distance",
    }),
  );

  assert.deepEqual(route.edges.map((item) => item.edgeId), ["short-slow"]);
  assert.equal(route.distanceMeters, 80);
  assert.equal(route.durationMinutes, 10);
});

test("respects one-way direction", () => {
  const data = graph(
    ["a", "b"],
    [edge("one-way", "a", "b", { oneWay: true })],
  );

  assert.equal(
    routeData(data, { fromNodeId: "a", toNodeId: "b" }).status,
    "found",
  );

  assert.deepEqual(
    routeData(data, { fromNodeId: "b", toNodeId: "a" }),
    {
      status: "not-found",
      fromNodeId: "b",
      toNodeId: "a",
      reason: "NO_ROUTE",
    },
  );
});

test("closed edges are never routable", () => {
  const data = graph(
    ["a", "b"],
    [edge("closed", "a", "b", { status: "closed" })],
  );

  assert.equal(
    routeData(data, { fromNodeId: "a", toNodeId: "b" }).status,
    "not-found",
  );
});

test("conditional edges require that exact edge ID to be enabled", () => {
  const data = graph(
    ["a", "b", "c"],
    [
      edge("conditional-a-b", "a", "b", { status: "conditional" }),
      edge("conditional-b-c", "b", "c", { status: "conditional" }),
    ],
  );

  assert.equal(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "c",
      enabledConditionalEdgeIds: ["conditional-a-b"],
    }).status,
    "not-found",
  );

  assert.equal(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "c",
      enabledConditionalEdgeIds: [
        "conditional-a-b",
        "conditional-b-c",
      ],
    }).status,
    "found",
  );
});

test("wheelchair routing rejects non-accessible edges", () => {
  const data = graph(
    ["a", "b", "c"],
    [
      edge("short-inaccessible", "a", "c", {
        durationMinutes: 1,
        accessible: false,
        stroller: false,
      }),
      edge("accessible-1", "a", "b", { durationMinutes: 2 }),
      edge("accessible-2", "b", "c", { durationMinutes: 2 }),
    ],
  );

  const normal = found(
    routeData(data, { fromNodeId: "a", toNodeId: "c" }),
  );
  assert.deepEqual(normal.edges.map((item) => item.edgeId), [
    "short-inaccessible",
  ]);

  const accessible = found(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "c",
      requireAccessible: true,
    }),
  );
  assert.deepEqual(accessible.edges.map((item) => item.edgeId), [
    "accessible-1",
    "accessible-2",
  ]);
});

test("stroller routing rejects non-stroller edges independently", () => {
  const data = graph(
    ["a", "b", "c"],
    [
      edge("short-no-stroller", "a", "c", {
        durationMinutes: 1,
        stroller: false,
      }),
      edge("stroller-1", "a", "b", { durationMinutes: 2 }),
      edge("stroller-2", "b", "c", { durationMinutes: 2 }),
    ],
  );

  const route = found(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "c",
      requireStroller: true,
    }),
  );

  assert.deepEqual(route.edges.map((item) => item.edgeId), [
    "stroller-1",
    "stroller-2",
  ]);
});

test("allowed transport modes are enforced", () => {
  const transportModes: RouteMode[] = ["walk", "skyfari"];
  const data = graph(
    ["a", "b", "c"],
    [
      edge("skyfari-fast", "a", "c", {
        mode: "skyfari",
        durationMinutes: 1,
        distanceMeters: 500,
      }),
      edge("walk-1", "a", "b", { durationMinutes: 3 }),
      edge("walk-2", "b", "c", { durationMinutes: 3 }),
    ],
  );

  const unrestricted = found(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "c",
      allowedModes: transportModes,
    }),
  );
  assert.deepEqual(unrestricted.edges.map((item) => item.edgeId), [
    "skyfari-fast",
  ]);

  const walkingOnly = found(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "c",
      allowedModes: ["walk"],
    }),
  );
  assert.deepEqual(walkingOnly.edges.map((item) => item.edgeId), [
    "walk-1",
    "walk-2",
  ]);
});

test("returns explicit unknown-node failures", () => {
  const data = graph(["a", "b"], [edge("a-b", "a", "b")]);

  assert.deepEqual(
    routeData(data, {
      fromNodeId: "missing",
      toNodeId: "b",
    }),
    {
      status: "not-found",
      fromNodeId: "missing",
      toNodeId: "b",
      reason: "START_NODE_UNKNOWN",
    },
  );

  assert.deepEqual(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "missing",
    }),
    {
      status: "not-found",
      fromNodeId: "a",
      toNodeId: "missing",
      reason: "END_NODE_UNKNOWN",
    },
  );
});

test("same-node routes are valid zero-cost routes", () => {
  const data = graph(["a"], []);

  assert.deepEqual(
    routeData(data, { fromNodeId: "a", toNodeId: "a" }),
    {
      status: "found",
      fromNodeId: "a",
      toNodeId: "a",
      optimize: "duration",
      nodeIds: ["a"],
      edges: [],
      distanceMeters: 0,
      durationMinutes: 0,
    },
  );
});

test("tie-breaking uses secondary cost, then hops, then lexical path signature", () => {
  const secondary = graph(
    ["a", "b", "c", "d"],
    [
      edge("a-b", "a", "b", { durationMinutes: 2, distanceMeters: 100 }),
      edge("b-d", "b", "d", { durationMinutes: 2, distanceMeters: 100 }),
      edge("a-c", "a", "c", { durationMinutes: 2, distanceMeters: 50 }),
      edge("c-d", "c", "d", { durationMinutes: 2, distanceMeters: 50 }),
    ],
  );

  assert.deepEqual(
    found(
      routeData(secondary, { fromNodeId: "a", toNodeId: "d" }),
    ).edges.map((item) => item.edgeId),
    ["a-c", "c-d"],
  );

  const hops = graph(
    ["a", "b", "d"],
    [
      edge("direct", "a", "d", { durationMinutes: 4, distanceMeters: 200 }),
      edge("via-1", "a", "b", { durationMinutes: 2, distanceMeters: 100 }),
      edge("via-2", "b", "d", { durationMinutes: 2, distanceMeters: 100 }),
    ],
  );

  assert.deepEqual(
    found(routeData(hops, { fromNodeId: "a", toNodeId: "d" })).edges.map(
      (item) => item.edgeId,
    ),
    ["direct"],
  );

  const lexical = graph(
    ["a", "b", "c", "d"],
    [
      edge("z-first", "a", "b"),
      edge("z-second", "b", "d"),
      edge("a-first", "a", "c"),
      edge("a-second", "c", "d"),
    ],
  );

  assert.deepEqual(
    found(
      routeData(lexical, { fromNodeId: "a", toNodeId: "d" }),
    ).edges.map((item) => item.edgeId),
    ["a-first", "a-second"],
  );
});

test("route choice is independent of input edge order", () => {
  const edges = [
    edge("z-first", "a", "b"),
    edge("z-second", "b", "d"),
    edge("a-first", "a", "c"),
    edge("a-second", "c", "d"),
  ];

  const forward = graph(["a", "b", "c", "d"], edges);
  const reversed = graph(["a", "b", "c", "d"], [...edges].reverse());

  const first = found(
    routeData(forward, { fromNodeId: "a", toNodeId: "d" }),
  );
  const second = found(
    routeData(reversed, { fromNodeId: "a", toNodeId: "d" }),
  );

  assert.deepEqual(second, first);
});

test("path output preserves edge provenance and traversal direction", () => {
  const data = graph(
    ["a", "b"],
    [edge("a-b", "a", "b", { oneWay: false })],
  );

  const route = found(
    routeData(data, { fromNodeId: "b", toNodeId: "a" }),
  );

  assert.equal(route.edges[0].edgeId, "a-b");
  assert.equal(route.edges[0].reversed, true);
  assert.deepEqual(route.edges[0].provenance, provenance);
});


test("compiled graph can be reused for repeated route queries", () => {
  const data = graph(
    ["a", "b", "c"],
    [
      edge("a-b", "a", "b"),
      edge("b-c", "b", "c"),
    ],
  );
  const routing = buildRoutingGraph(data);

  const first = found(
    findShortestRoute(routing, { fromNodeId: "a", toNodeId: "c" }),
  );
  const second = found(
    findShortestRoute(routing, { fromNodeId: "c", toNodeId: "a" }),
  );

  assert.deepEqual(first.nodeIds, ["a", "b", "c"]);
  assert.deepEqual(second.nodeIds, ["c", "b", "a"]);
});

test("graph compilation rejects invalid source data before search", () => {
  const data = graph(
    ["a", "b"],
    [edge("bad-edge", "a", "b", { distanceMeters: 0 })],
  );

  assert.throws(
    () => buildRoutingGraph(data),
    /EDGE_DISTANCE_INVALID/,
  );
});

test("lexical tie-breaking uses stable code-unit order, not host locale", () => {
  const data = graph(
    ["a", "b", "c", "d"],
    [
      edge("ä-first", "a", "b"),
      edge("ä-second", "b", "d"),
      edge("z-first", "a", "c"),
      edge("z-second", "c", "d"),
    ],
  );

  const result = found(
    routeData(data, { fromNodeId: "a", toNodeId: "d" }),
  );

  assert.deepEqual(result.edges.map((item) => item.edgeId), [
    "z-first",
    "z-second",
  ]);
});


test("compiled graph is isolated from source-data mutation", () => {
  const data = graph(
    ["a", "b"],
    [edge("a-b", "a", "b", { durationMinutes: 2.25 })],
  );
  const routing = buildRoutingGraph(data);

  data.routeEdges[0].durationMinutes = 99;
  data.routeEdges[0].provenance.sourceLabel = "mutated source";

  const result = found(
    findShortestRoute(routing, { fromNodeId: "a", toNodeId: "b" }),
  );

  assert.equal(result.durationMinutes, 2.25);
  assert.equal(result.edges[0].provenance.sourceLabel, "Synthetic routing fixture");
});

test("mutating returned route provenance cannot alter later route results", () => {
  const data = graph(["a", "b"], [edge("a-b", "a", "b")]);
  const routing = buildRoutingGraph(data);

  const first = found(
    findShortestRoute(routing, { fromNodeId: "a", toNodeId: "b" }),
  );
  first.edges[0].provenance.sourceLabel = "caller mutation";

  const second = found(
    findShortestRoute(routing, { fromNodeId: "a", toNodeId: "b" }),
  );

  assert.equal(second.edges[0].provenance.sourceLabel, "Synthetic routing fixture");
});

test("decimal cost accumulation does not break mathematically equal ties", () => {
  const data = graph(
    ["a", "b", "d"],
    [
      edge("z-direct", "a", "d", {
        distanceMeters: 30,
        durationMinutes: 0.3,
      }),
      edge("a-part-1", "a", "b", {
        distanceMeters: 10,
        durationMinutes: 0.1,
      }),
      edge("a-part-2", "b", "d", {
        distanceMeters: 20,
        durationMinutes: 0.2,
      }),
    ],
  );

  const result = found(
    routeData(data, { fromNodeId: "a", toNodeId: "d" }),
  );

  assert.equal(result.durationMinutes, 0.3);
  assert.deepEqual(result.edges.map((item) => item.edgeId), ["z-direct"]);
});

test("empty allowedModes produces no route without weakening same-node routing", () => {
  const data = graph(["a", "b"], [edge("a-b", "a", "b")]);
  const routing = buildRoutingGraph(data);

  assert.equal(
    findShortestRoute(routing, {
      fromNodeId: "a",
      toNodeId: "b",
      allowedModes: [],
    }).status,
    "not-found",
  );

  assert.equal(
    findShortestRoute(routing, {
      fromNodeId: "a",
      toNodeId: "a",
      allowedModes: [],
    }).status,
    "found",
  );
});

test("unknown conditional edge IDs are inert", () => {
  const data = graph(
    ["a", "b"],
    [edge("conditional-a-b", "a", "b", { status: "conditional" })],
  );

  assert.equal(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "b",
      enabledConditionalEdgeIds: ["not-a-real-edge"],
    }).status,
    "not-found",
  );
});

test("accessibility stroller and transport constraints compose as hard filters", () => {
  const data = graph(
    ["a", "b", "c", "d"],
    [
      edge("skyfari", "a", "d", {
        mode: "skyfari",
        durationMinutes: 1,
      }),
      edge("accessible-no-stroller", "a", "b", {
        durationMinutes: 2,
        accessible: true,
        stroller: false,
      }),
      edge("stroller-accessible-1", "a", "c", {
        durationMinutes: 3,
        accessible: true,
        stroller: true,
      }),
      edge("stroller-accessible-2", "c", "d", {
        durationMinutes: 3,
        accessible: true,
        stroller: true,
      }),
    ],
  );

  const result = found(
    routeData(data, {
      fromNodeId: "a",
      toNodeId: "d",
      allowedModes: ["walk"],
      requireAccessible: true,
      requireStroller: true,
    }),
  );

  assert.deepEqual(result.edges.map((item) => item.edgeId), [
    "stroller-accessible-1",
    "stroller-accessible-2",
  ]);
});

test("positive-cost cycles do not disturb the best route", () => {
  const data = graph(
    ["a", "b", "c", "d"],
    [
      edge("a-b", "a", "b", { oneWay: true, durationMinutes: 1 }),
      edge("b-c", "b", "c", { oneWay: true, durationMinutes: 1 }),
      edge("c-b", "c", "b", { oneWay: true, durationMinutes: 1 }),
      edge("c-d", "c", "d", { oneWay: true, durationMinutes: 1 }),
      edge("slow-direct", "a", "d", { durationMinutes: 10 }),
    ],
  );

  const result = found(
    routeData(data, { fromNodeId: "a", toNodeId: "d" }),
  );

  assert.deepEqual(result.nodeIds, ["a", "b", "c", "d"]);
  assert.equal(result.durationMinutes, 3);
});
