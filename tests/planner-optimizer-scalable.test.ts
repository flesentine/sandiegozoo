import assert from "node:assert/strict";
import test from "node:test";
import type {
  RouteEdge,
  RouteNode,
  SourceProvenance,
  WildRouteDataPackage,
} from "../src/planner/contracts.ts";
import {
  buildRoutingGraph,
  type RoutingGraph,
} from "../src/planner/routing.ts";
import {
  createPlanningHorizon,
  type PlanningHorizon,
  type ScheduleAnchor,
} from "../src/planner/scheduling.ts";
import {
  optimizeItinerary,
  type OptimizerCandidate,
  type OptimizerRequest,
  type OptimizerResult,
} from "../src/planner/optimizer.ts";
import {
  MAX_SCALABLE_CANDIDATES,
  optimizeItineraryScalable,
} from "../src/planner/optimizer-scalable.ts";

const provenance: SourceProvenance = {
  sourceUrl: "https://example.invalid/scalable-fixture",
  sourceLabel: "Synthetic scalable optimizer fixture",
  lastVerified: "2026-09-06T22:00:00-07:00",
  confidence: "verified",
};

function node(id: string): RouteNode {
  return {
    id,
    kind: id === "entry" || id === "exit" ? "entrance" : "destination",
    zoneId: "fixture-zone",
    lat: 0,
    lng: 0,
    provenance: { ...provenance },
  };
}

function edge(
  id: string,
  fromNodeId: string,
  toNodeId: string,
  durationMinutes: number,
  overrides: Partial<RouteEdge> = {},
): RouteEdge {
  return {
    id,
    fromNodeId,
    toNodeId,
    mode: "walk",
    distanceMeters: durationMinutes * 80,
    durationMinutes,
    difficulty: "easy",
    stairs: false,
    accessible: true,
    stroller: true,
    oneWay: false,
    status: "open",
    provenance: { ...provenance },
    ...overrides,
  };
}

function graph(
  edges: RouteEdge[] = [
    edge("entry-a", "entry", "a", 4),
    edge("a-b", "a", "b", 5),
    edge("b-c", "b", "c", 6),
    edge("c-d", "c", "d", 4),
    edge("d-exit", "d", "exit", 5),
    edge("entry-d", "entry", "d", 14),
    edge("b-exit", "b", "exit", 10),
  ],
  nodeIds = ["entry", "a", "b", "c", "d", "exit"],
): RoutingGraph {
  const data: WildRouteDataPackage = {
    schemaVersion: "1",
    zones: [
      {
        id: "fixture-zone",
        name: "Fixture Zone",
        provenance: { ...provenance },
      },
    ],
    places: [],
    routeNodes: nodeIds.map(node),
    routeEdges: edges,
    scheduleEvents: [],
  };

  return buildRoutingGraph(data);
}

function horizon(
  arrival = "09:00",
  departure = "17:00",
): PlanningHorizon {
  const built = createPlanningHorizon(
    "2026-09-19",
    arrival,
    departure,
  );
  assert.equal(built.status, "valid");
  if (built.status !== "valid") {
    throw new Error("expected valid horizon");
  }
  return built.horizon;
}

function flexible(
  id: string,
  nodeId: string,
  overrides: Partial<OptimizerCandidate> = {},
): OptimizerCandidate {
  return {
    id,
    selectionKey: id,
    nodeId,
    authority: "optional",
    timing: "flexible",
    priority: "bonus",
    baseDwellMinutes: 10,
    ...overrides,
  };
}

function showAnchor(
  id: string,
  nodeId: string,
  startMinute: number,
  durationMinutes: number,
  arrivalLeadMinutes = 10,
): ScheduleAnchor {
  return {
    id,
    kind: "show",
    title: id,
    nodeId,
    arrivalWindowStartMinute:
      startMinute - arrivalLeadMinutes,
    arrivalWindowEndMinute: startMinute,
    serviceStartMinute: startMinute,
    serviceEndMinute:
      startMinute + durationMinutes,
  };
}

function lockedAnchor(
  id: string,
  nodeId: string,
  startMinute: number,
  durationMinutes: number,
): ScheduleAnchor {
  return {
    id,
    kind: "locked",
    title: id,
    nodeId,
    arrivalWindowStartMinute: startMinute,
    arrivalWindowEndMinute: startMinute,
    serviceStartMinute: startMinute,
    serviceEndMinute:
      startMinute + durationMinutes,
  };
}

function request(
  candidates: readonly OptimizerCandidate[],
  overrides: Partial<OptimizerRequest> = {},
): OptimizerRequest {
  return {
    graph: graph(),
    horizon: horizon(),
    initialNodeId: "entry",
    candidates,
    scoreContext: {
      pace: "balanced",
      preferEasyPaths: false,
    },
    ...overrides,
  };
}

function semantic(result: OptimizerResult) {
  return JSON.parse(
    JSON.stringify(result, (key, value) =>
      key === "evaluatedStates" ? undefined : value,
    ),
  );
}

function assertOracleParity(
  optimizerRequest: OptimizerRequest,
) {
  const oracle = optimizeItinerary(optimizerRequest);
  assert.notEqual(
    oracle.status,
    "search-limit-exceeded",
    "fixture must remain inside Planner 5 oracle bound",
  );

  const scalable = optimizeItineraryScalable(
    optimizerRequest,
    { stateBudget: 500_000 },
  );

  assert.equal(scalable.status, "complete");
  if (scalable.status !== "complete") {
    throw new Error("expected scalable completion");
  }

  assert.deepEqual(
    semantic(scalable.result),
    semantic(oracle),
  );

  return scalable;
}

test("scalable optimizer matches oracle on mixed authority and show alternatives", () => {
  const candidates: OptimizerCandidate[] = [
    flexible("panda", "a", {
      authority: "protected",
      priority: "must",
      baseDwellMinutes: 25,
    }),
    {
      ...flexible("show-early", "c"),
      selectionKey: "wildlife-wonders",
      authority: "required",
      timing: "windowed",
      priority: "must",
      baseDwellMinutes: 20,
      anchor: showAnchor(
        "show-early",
        "c",
        620,
        20,
      ),
    },
    {
      ...flexible("show-late", "b"),
      selectionKey: "wildlife-wonders",
      authority: "required",
      timing: "windowed",
      priority: "must",
      baseDwellMinutes: 20,
      anchor: showAnchor(
        "show-late",
        "b",
        700,
        20,
      ),
    },
    flexible("favorite", "d", {
      priority: "favorite",
      baseDwellMinutes: 20,
    }),
    flexible("bonus", "b", {
      priority: "bonus",
      baseDwellMinutes: 10,
    }),
  ];

  const scalable = assertOracleParity(
    request(candidates, {
      endNodeId: "exit",
    }),
  );

  assert.ok(scalable.stats.routeCacheHits > 0);
});

test("scalable optimizer matches oracle on mandatory tradeoff combinations", () => {
  const candidates: OptimizerCandidate[] = [
    {
      ...flexible("lock-a", "a"),
      authority: "locked",
      timing: "fixed",
      priority: "must",
      baseDwellMinutes: 30,
      anchor: lockedAnchor(
        "lock-a",
        "a",
        600,
        30,
      ),
    },
    {
      ...flexible("lock-c", "c"),
      authority: "locked",
      timing: "fixed",
      priority: "must",
      baseDwellMinutes: 30,
      anchor: lockedAnchor(
        "lock-c",
        "c",
        600,
        30,
      ),
    },
  ];

  assertOracleParity(request(candidates));
});

test("scalable optimizer matches oracle on baseline exit infeasibility", () => {
  const localGraph = graph(
    [edge("entry-a", "entry", "a", 5)],
  );

  assertOracleParity(
    request([], {
      graph: localGraph,
      endNodeId: "exit",
    }),
  );
});

test("scalable optimizer matches oracle under hard accessibility constraints", () => {
  const localGraph = graph([
    edge("entry-a", "entry", "a", 3, {
      accessible: false,
    }),
    edge("entry-b", "entry", "b", 5, {
      accessible: true,
    }),
    edge("b-exit", "b", "exit", 5, {
      accessible: true,
    }),
  ]);

  assertOracleParity(
    request(
      [
        flexible("blocked-favorite", "a", {
          priority: "favorite",
        }),
        flexible("accessible-bonus", "b", {
          priority: "bonus",
        }),
      ],
      {
        graph: localGraph,
        routePolicy: {
          requireAccessible: true,
        },
      },
    ),
  );
});

test("scalable dominance preserves oracle lexical tie-break on equal plans", () => {
  const localGraph = graph(
    [],
    ["entry"],
  );
  const values = [
    flexible("ä", "entry", {
      priority: "favorite",
      baseDwellMinutes: 1,
    }),
    flexible("z", "entry", {
      priority: "favorite",
      baseDwellMinutes: 1,
    }),
    flexible("a", "entry", {
      priority: "favorite",
      baseDwellMinutes: 1,
    }),
    flexible("m", "entry", {
      priority: "favorite",
      baseDwellMinutes: 1,
    }),
  ];

  const scalable = assertOracleParity(
    request(values, {
      graph: localGraph,
      initialNodeId: "entry",
      horizon: horizon("09:00", "09:30"),
      scoreContext: {
        pace: "maximize",
        preferEasyPaths: false,
      },
    }),
  );

  assert.ok(
    scalable.stats.prunedByDominance > 0,
  );
});

test("scalable engine completes a 12-record request beyond the oracle limit", () => {
  const localGraph = graph(
    [],
    ["entry"],
  );
  const candidates = Array.from(
    { length: 12 },
    (_, index) =>
      flexible(
        `candidate-${String(index).padStart(2, "0")}`,
        "entry",
        {
          priority: "bonus",
          baseDwellMinutes: 1,
        },
      ),
  );
  const optimizerRequest = request(candidates, {
    graph: localGraph,
    initialNodeId: "entry",
    horizon: horizon("09:00", "10:00"),
    scoreContext: {
      pace: "maximize",
      preferEasyPaths: false,
    },
  });

  assert.equal(
    optimizeItinerary(optimizerRequest).status,
    "search-limit-exceeded",
  );

  const scalable = optimizeItineraryScalable(
    optimizerRequest,
    { stateBudget: 500_000 },
  );

  assert.equal(scalable.status, "complete");
  if (scalable.status !== "complete") {
    throw new Error("expected scalable completion");
  }
  assert.equal(
    scalable.result.status,
    "optimized",
  );
  if (scalable.result.status !== "optimized") {
    throw new Error("expected optimized");
  }

  assert.equal(
    scalable.result.selectedCandidateIds.length,
    12,
  );
  assert.ok(
    scalable.stats.prunedByDominance > 0,
  );
  assert.ok(scalable.stats.routeCacheHits > 0);
  assert.ok(
    scalable.stats.evaluatedStates < 500_000,
  );
});

test("scalable optimizer is input-order independent beyond the oracle limit", () => {
  const localGraph = graph(
    [],
    ["entry"],
  );
  const candidates = Array.from(
    { length: 10 },
    (_, index) =>
      flexible(
        `candidate-${String(index).padStart(2, "0")}`,
        "entry",
        {
          priority:
            index < 2 ? "favorite" : "bonus",
          baseDwellMinutes:
            index % 3 === 0 ? 2 : 1,
        },
      ),
  );
  const options = { stateBudget: 500_000 };

  const forward = optimizeItineraryScalable(
    request(candidates, {
      graph: localGraph,
      initialNodeId: "entry",
      horizon: horizon("09:00", "10:00"),
      scoreContext: {
        pace: "maximize",
        preferEasyPaths: false,
      },
    }),
    options,
  );
  const reverse = optimizeItineraryScalable(
    request([...candidates].reverse(), {
      graph: localGraph,
      initialNodeId: "entry",
      horizon: horizon("09:00", "10:00"),
      scoreContext: {
        pace: "maximize",
        preferEasyPaths: false,
      },
    }),
    options,
  );

  assert.equal(forward.status, "complete");
  assert.equal(reverse.status, "complete");
  if (
    forward.status !== "complete" ||
    reverse.status !== "complete"
  ) {
    throw new Error("expected complete");
  }

  assert.deepEqual(
    semantic(forward.result),
    semantic(reverse.result),
  );
});

test("state-budget exhaustion returns no partial itinerary", () => {
  const localGraph = graph(
    [],
    ["entry"],
  );
  const candidates = Array.from(
    { length: 12 },
    (_, index) =>
      flexible(
        `candidate-${index}`,
        "entry",
        {
          baseDwellMinutes: 1,
        },
      ),
  );

  const result = optimizeItineraryScalable(
    request(candidates, {
      graph: localGraph,
      initialNodeId: "entry",
    }),
    { stateBudget: 10 },
  );

  assert.equal(
    result.status,
    "search-budget-exceeded",
  );
  if (
    result.status !==
    "search-budget-exceeded"
  ) {
    throw new Error("expected budget failure");
  }
  assert.equal(result.stateBudget, 10);
  assert.equal(result.evaluatedStates, 11);
  assert.equal(
    "result" in result,
    false,
  );
});

test("candidate-limit result is explicit and still validates candidates first", () => {
  const localGraph = graph(
    [],
    ["entry"],
  );
  const candidates = Array.from(
    { length: MAX_SCALABLE_CANDIDATES + 1 },
    (_, index) =>
      flexible(
        `candidate-${index}`,
        "entry",
        {
          baseDwellMinutes: 1,
        },
      ),
  );

  const result = optimizeItineraryScalable(
    request(candidates, {
      graph: localGraph,
      initialNodeId: "entry",
    }),
  );

  assert.equal(
    result.status,
    "candidate-limit-exceeded",
  );
  if (
    result.status !==
    "candidate-limit-exceeded"
  ) {
    throw new Error("expected candidate limit");
  }
  assert.equal(
    result.candidateCount,
    MAX_SCALABLE_CANDIDATES + 1,
  );

  candidates[candidates.length - 1] = {
    ...candidates[candidates.length - 1],
    authority: "invalid",
  } as unknown as OptimizerCandidate;

  assert.throws(
    () =>
      optimizeItineraryScalable(
        request(candidates, {
          graph: localGraph,
          initialNodeId: "entry",
        }),
      ),
    /authority is invalid/,
  );
});

test("cached route results are isolated between returned steps", () => {
  const localGraph = graph(
    [],
    ["entry"],
  );
  const result = optimizeItineraryScalable(
    request(
      [
        flexible("a", "entry", {
          authority: "protected",
          priority: "must",
          baseDwellMinutes: 1,
        }),
        flexible("b", "entry", {
          authority: "protected",
          priority: "must",
          baseDwellMinutes: 1,
        }),
      ],
      {
        graph: localGraph,
        initialNodeId: "entry",
      },
    ),
  );

  assert.equal(result.status, "complete");
  if (
    result.status !== "complete" ||
    result.result.status !== "optimized"
  ) {
    throw new Error("expected optimized");
  }

  const first = result.result.steps[0].route;
  const second = result.result.steps[1].route;
  assert.notEqual(first, second);
  assert.notEqual(first.nodeIds, second.nodeIds);

  first.nodeIds.push("mutated");
  assert.deepEqual(second.nodeIds, ["entry"]);
});


test("dominance preserves a lex-better later state when a future fixed anchor can erase its time deficit", () => {
  const localGraph = graph([], ["entry"]);

  const flexibleFirst = {
    ...flexible("z-flex", "entry", {
      authority: "protected",
      priority: "must",
      baseDwellMinutes: 10,
    }),
    selectionKey: "a-flex",
  };

  const middleLock: OptimizerCandidate = {
    ...flexible("a-lock", "entry"),
    selectionKey: "b-lock",
    authority: "locked",
    timing: "fixed",
    priority: "must",
    baseDwellMinutes: 10,
    anchor: lockedAnchor(
      "a-lock",
      "entry",
      600,
      10,
    ),
  };

  const resetLock: OptimizerCandidate = {
    ...flexible("c-reset", "entry"),
    selectionKey: "c-reset",
    authority: "locked",
    timing: "fixed",
    priority: "must",
    baseDwellMinutes: 10,
    anchor: lockedAnchor(
      "c-reset",
      "entry",
      660,
      10,
    ),
  };

  const optimizerRequest = request(
    [flexibleFirst, middleLock, resetLock],
    {
      graph: localGraph,
      initialNodeId: "entry",
      horizon: horizon("09:00", "12:00"),
    },
  );

  const oracle = optimizeItinerary(optimizerRequest);
  assert.equal(oracle.status, "optimized");
  if (oracle.status !== "optimized") {
    throw new Error("expected oracle optimization");
  }

  assert.deepEqual(oracle.selectedCandidateIds, [
    "a-lock",
    "z-flex",
    "c-reset",
  ]);

  const scalable = optimizeItineraryScalable(
    optimizerRequest,
    { stateBudget: 500_000 },
  );

  assert.equal(scalable.status, "complete");
  if (
    scalable.status !== "complete" ||
    scalable.result.status !== "optimized"
  ) {
    throw new Error("expected scalable optimization");
  }

  assert.deepEqual(
    semantic(scalable.result),
    semantic(oracle),
  );
  assert.deepEqual(
    scalable.result.selectedCandidateIds,
    ["a-lock", "z-flex", "c-reset"],
  );
});

test("upper-bound pruning never lets lower-tier travel advantage block a remaining Favorite", () => {
  const localGraph = graph([
    edge("entry-a", "entry", "a", 1),
    edge("entry-b", "entry", "b", 8),
    edge("a-b", "a", "b", 8),
  ], ["entry", "a", "b"]);

  const optimizerRequest = request(
    [
      flexible("cheap-bonus", "a", {
        priority: "bonus",
        baseDwellMinutes: 5,
      }),
      flexible("far-favorite", "b", {
        priority: "favorite",
        baseDwellMinutes: 5,
      }),
    ],
    {
      graph: localGraph,
      initialNodeId: "entry",
      horizon: horizon("09:00", "09:30"),
    },
  );

  const oracle = optimizeItinerary(optimizerRequest);
  assert.equal(oracle.status, "optimized");
  if (oracle.status !== "optimized") {
    throw new Error("expected oracle optimization");
  }
  assert.ok(
    oracle.selectedCandidateIds.includes("far-favorite"),
  );

  const scalable = optimizeItineraryScalable(
    optimizerRequest,
    { stateBudget: 500_000 },
  );

  assert.equal(scalable.status, "complete");
  if (scalable.status !== "complete") {
    throw new Error("expected scalable completion");
  }

  assert.deepEqual(
    semantic(scalable.result),
    semantic(oracle),
  );
});

test("upper-bound pruning cuts a travel-dominated branch while retaining exact oracle parity", () => {
  const localGraph = graph(
    [
      edge("entry-a", "entry", "a", 1),
      edge("a-b", "a", "b", 1),
      edge("b-c", "b", "c", 1),
    ],
    ["entry", "a", "b", "c"],
  );

  const optimizerRequest = request(
    [
      flexible("a-stop", "a", {
        priority: "favorite",
        baseDwellMinutes: 1,
      }),
      flexible("b-stop", "b", {
        priority: "favorite",
        baseDwellMinutes: 1,
      }),
      flexible("c-stop", "c", {
        priority: "favorite",
        baseDwellMinutes: 1,
      }),
    ],
    {
      graph: localGraph,
      initialNodeId: "entry",
      horizon: horizon("09:00", "10:00"),
      scoreContext: {
        pace: "maximize",
        preferEasyPaths: false,
      },
    },
  );

  const oracle = optimizeItinerary(optimizerRequest);
  assert.equal(oracle.status, "optimized");
  if (oracle.status !== "optimized") {
    throw new Error("expected oracle optimization");
  }
  assert.deepEqual(oracle.selectedCandidateIds, [
    "a-stop",
    "b-stop",
    "c-stop",
  ]);
  assert.equal(oracle.totalTravelMinutes, 3);

  const scalable = optimizeItineraryScalable(
    optimizerRequest,
    { stateBudget: 500_000 },
  );

  assert.equal(scalable.status, "complete");
  if (scalable.status !== "complete") {
    throw new Error("expected scalable completion");
  }

  assert.deepEqual(
    semantic(scalable.result),
    semantic(oracle),
  );
  assert.ok(scalable.stats.prunedByUpperBound > 0);
});
