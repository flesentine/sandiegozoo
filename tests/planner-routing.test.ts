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
    routing.outgoing("b").map((item) => [
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
    routing.outgoing("c").some((item) => item.edgeId === "one-way"),
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
    findShortestRoute(data, {
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
    findShortestRoute(data, {
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
    findShortestRoute(data, { fromNodeId: "a", toNodeId: "b" }).status,
    "found",
  );

  assert.deepEqual(
    findShortestRoute(data, { fromNodeId: "b", toNodeId: "a" }),
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
    findShortestRoute(data, { fromNodeId: "a", toNodeId: "b" }).status,
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
    findShortestRoute(data, {
      fromNodeId: "a",
      toNodeId: "c",
      enabledConditionalEdgeIds: ["conditional-a-b"],
    }).status,
    "not-found",
  );

  assert.equal(
    findShortestRoute(data, {
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
    findShortestRoute(data, { fromNodeId: "a", toNodeId: "c" }),
  );
  assert.deepEqual(normal.edges.map((item) => item.edgeId), [
    "short-inaccessible",
  ]);

  const accessible = found(
    findShortestRoute(data, {
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
    findShortestRoute(data, {
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
    findShortestRoute(data, {
      fromNodeId: "a",
      toNodeId: "c",
      allowedModes: transportModes,
    }),
  );
  assert.deepEqual(unrestricted.edges.map((item) => item.edgeId), [
    "skyfari-fast",
  ]);

  const walkingOnly = found(
    findShortestRoute(data, {
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
    findShortestRoute(data, {
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
    findShortestRoute(data, {
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
    findShortestRoute(data, { fromNodeId: "a", toNodeId: "a" }),
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
      findShortestRoute(secondary, { fromNodeId: "a", toNodeId: "d" }),
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
    found(findShortestRoute(hops, { fromNodeId: "a", toNodeId: "d" })).edges.map(
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
      findShortestRoute(lexical, { fromNodeId: "a", toNodeId: "d" }),
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
    findShortestRoute(forward, { fromNodeId: "a", toNodeId: "d" }),
  );
  const second = found(
    findShortestRoute(reversed, { fromNodeId: "a", toNodeId: "d" }),
  );

  assert.deepEqual(second, first);
});

test("path output preserves edge provenance and traversal direction", () => {
  const data = graph(
    ["a", "b"],
    [edge("a-b", "a", "b", { oneWay: false })],
  );

  const route = found(
    findShortestRoute(data, { fromNodeId: "b", toNodeId: "a" }),
  );

  assert.equal(route.edges[0].edgeId, "a-b");
  assert.equal(route.edges[0].reversed, true);
  assert.deepEqual(route.edges[0].provenance, provenance);
});
