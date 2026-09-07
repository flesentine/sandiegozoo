import assert from "node:assert/strict";
import test from "node:test";
import type {
  RouteEdge,
  RouteNode,
  SourceProvenance,
  WildRouteDataPackage,
} from "../src/planner/contracts.ts";
import { buildRoutingGraph } from "../src/planner/routing.ts";
import {
  createPlanningHorizon,
  type PlanningHorizon,
  type ScheduleAnchor,
} from "../src/planner/scheduling.ts";
import {
  MAX_EXHAUSTIVE_CANDIDATES,
  optimizeItinerary,
  type OptimizerCandidate,
} from "../src/planner/optimizer.ts";

const provenance: SourceProvenance = {
  sourceUrl: "https://example.invalid/optimizer-fixture",
  sourceLabel: "Synthetic optimizer fixture",
  lastVerified: "2026-09-06T21:30:00-07:00",
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
    edge("entry-a", "entry", "a", 5),
    edge("a-b", "a", "b", 5),
    edge("b-c", "b", "c", 5),
    edge("c-exit", "c", "exit", 5),
  ],
) {
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
    routeNodes: ["entry", "a", "b", "c", "exit"].map(node),
    routeEdges: edges,
    scheduleEvents: [],
  };

  return buildRoutingGraph(data);
}

function horizon(
  arrival = "09:00",
  departure = "17:00",
): PlanningHorizon {
  const result = createPlanningHorizon(
    "2026-09-19",
    arrival,
    departure,
  );
  assert.equal(result.status, "valid");
  if (result.status !== "valid") throw new Error("expected valid horizon");
  return result.horizon;
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
    arrivalWindowStartMinute: startMinute - arrivalLeadMinutes,
    arrivalWindowEndMinute: startMinute,
    serviceStartMinute: startMinute,
    serviceEndMinute: startMinute + durationMinutes,
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
    serviceEndMinute: startMinute + durationMinutes,
  };
}

function request(
  candidates: readonly OptimizerCandidate[],
  overrides: Partial<Parameters<typeof optimizeItinerary>[0]> = {},
): Parameters<typeof optimizeItinerary>[0] {
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

test("protected Must-Sees are selected before optional optimization", () => {
  const result = optimizeItinerary(
    request([
      flexible("must-see", "c", {
        authority: "protected",
        priority: "must",
        baseDwellMinutes: 20,
      }),
      flexible("favorite", "a", {
        priority: "favorite",
        baseDwellMinutes: 20,
      }),
    ]),
  );

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  assert.ok(result.selectedSelectionKeys.includes("must-see"));
  assert.ok(
    result.steps.some(
      (step) =>
        step.selectionKey === "must-see" &&
        step.authority === "protected",
    ),
  );
});

test("required show selection chooses exactly one feasible performance", () => {
  const candidates: OptimizerCandidate[] = [
    {
      ...flexible("show-early", "c"),
      selectionKey: "wildlife-wonders",
      authority: "required",
      timing: "windowed",
      priority: "must",
      baseDwellMinutes: 20,
      anchor: showAnchor("show-early", "c", 550, 20),
    },
    {
      ...flexible("show-late", "b"),
      selectionKey: "wildlife-wonders",
      authority: "required",
      timing: "windowed",
      priority: "must",
      baseDwellMinutes: 20,
      anchor: showAnchor("show-late", "b", 660, 20),
    },
    flexible("panda", "a", {
      authority: "protected",
      priority: "must",
      baseDwellMinutes: 30,
    }),
  ];

  const result = optimizeItinerary(request(candidates));

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  const selectedShows = result.selectedCandidateIds.filter((id) =>
    id.startsWith("show-"),
  );
  assert.equal(selectedShows.length, 1);
  assert.ok(result.selectedSelectionKeys.includes("wildlife-wonders"));
  assert.equal(result.unselectedAlternativeCandidateIds.length, 1);
});

test("flexible protected stops can be inserted around timed anchors", () => {
  const reservation: OptimizerCandidate = {
    ...flexible("reservation", "b"),
    authority: "locked",
    timing: "fixed",
    priority: "must",
    baseDwellMinutes: 30,
    anchor: lockedAnchor("reservation", "b", 660, 30),
  };
  const before = flexible("before", "a", {
    authority: "protected",
    priority: "must",
    baseDwellMinutes: 20,
  });
  const after = flexible("after", "c", {
    authority: "protected",
    priority: "must",
    baseDwellMinutes: 20,
  });

  const result = optimizeItinerary(
    request([after, reservation, before]),
  );

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  const order = result.steps.map((step) => step.candidateId);
  assert.ok(order.indexOf("before") < order.indexOf("reservation"));
  assert.ok(order.indexOf("reservation") < order.indexOf("after"));
  assert.equal(
    result.steps.find((step) => step.candidateId === "reservation")
      ?.serviceStartMinute,
    660,
  );
});

test("infeasible mandatory set returns explicit tradeoff candidates", () => {
  const first: OptimizerCandidate = {
    ...flexible("locked-a", "a"),
    authority: "locked",
    timing: "fixed",
    priority: "must",
    baseDwellMinutes: 30,
    anchor: lockedAnchor("locked-a", "a", 600, 30),
  };
  const second: OptimizerCandidate = {
    ...flexible("locked-c", "c"),
    authority: "locked",
    timing: "fixed",
    priority: "must",
    baseDwellMinutes: 30,
    anchor: lockedAnchor("locked-c", "c", 600, 30),
  };

  const result = optimizeItinerary(request([first, second]));

  assert.equal(result.status, "tradeoff-required");
  if (result.status !== "tradeoff-required") {
    throw new Error("expected tradeoff");
  }

  assert.deepEqual(result.mandatorySelectionKeys, [
    "locked-a",
    "locked-c",
  ]);
  assert.deepEqual(result.tradeoffSelectionKeys, [
    "locked-a",
    "locked-c",
  ]);
});

test("Favorite tier beats multiple Bonuses when capacity conflicts", () => {
  const shortHorizon = horizon("09:00", "09:25");
  const localGraph = graph([
    edge("entry-a", "entry", "a", 0.5),
    edge("a-b", "a", "b", 0.5),
    edge("b-c", "b", "c", 0.5),
    edge("c-exit", "c", "exit", 0.5),
  ]);

  const result = optimizeItinerary(
    request(
      [
        flexible("favorite", "a", {
          priority: "favorite",
          baseDwellMinutes: 20,
        }),
        flexible("bonus-a", "b", {
          priority: "bonus",
          baseDwellMinutes: 9,
        }),
        flexible("bonus-b", "c", {
          priority: "bonus",
          baseDwellMinutes: 9,
        }),
      ],
      {
        graph: localGraph,
        horizon: shortHorizon,
        scoreContext: {
          pace: "maximize",
          preferEasyPaths: false,
        },
      },
    ),
  );

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  assert.ok(result.selectedCandidateIds.includes("favorite"));
  assert.equal(result.utility.favorite.count, 1);
});

test("optimizer result is independent of candidate input order", () => {
  const values = [
    flexible("z", "c", {
      priority: "favorite",
      baseDwellMinutes: 10,
    }),
    flexible("a", "a", {
      priority: "favorite",
      baseDwellMinutes: 10,
    }),
    flexible("m", "b", {
      priority: "favorite",
      baseDwellMinutes: 10,
    }),
  ];

  const forward = optimizeItinerary(request(values));
  const reverse = optimizeItinerary(request([...values].reverse()));

  assert.equal(forward.status, "optimized");
  assert.equal(reverse.status, "optimized");
  if (forward.status !== "optimized" || reverse.status !== "optimized") {
    throw new Error("expected optimized");
  }

  assert.deepEqual(reverse.selectedCandidateIds, forward.selectedCandidateIds);
  assert.deepEqual(
    reverse.steps.map((step) => step.candidateId),
    forward.steps.map((step) => step.candidateId),
  );
  assert.deepEqual(reverse.utility, forward.utility);
});

test("exit node must be reachable before visit departure", () => {
  const localGraph = graph([
    edge("entry-a", "entry", "a", 5),
    edge("a-exit", "a", "exit", 20),
  ]);
  const result = optimizeItinerary(
    request(
      [
        flexible("late-favorite", "a", {
          priority: "favorite",
          baseDwellMinutes: 15,
        }),
      ],
      {
        graph: localGraph,
        horizon: horizon("09:00", "09:30"),
        endNodeId: "exit",
      },
    ),
  );

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  assert.deepEqual(result.selectedCandidateIds, []);
  assert.equal(result.omissions[0].selectionKey, "late-favorite");
  assert.equal(result.omissions[0].reason, "INSUFFICIENT_TIME");
  assert.ok(result.exitRoute);
});

test("hard routing constraints flow through the optimizer", () => {
  const localGraph = graph([
    edge("entry-a", "entry", "a", 5, {
      accessible: false,
      stroller: false,
    }),
    edge("a-exit", "a", "exit", 5, {
      accessible: false,
      stroller: false,
    }),
  ]);

  const result = optimizeItinerary(
    request(
      [
        flexible("optional", "a", {
          priority: "favorite",
        }),
      ],
      {
        graph: localGraph,
        routePolicy: { requireAccessible: true },
      },
    ),
  );

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  assert.deepEqual(result.selectedCandidateIds, []);
  assert.equal(result.omissions[0].reason, "NO_ROUTE");
});

test("pace buffer applies between selected stops but not before the first", () => {
  const result = optimizeItinerary(
    request(
      [
        flexible("first", "a", {
          authority: "protected",
          priority: "must",
          baseDwellMinutes: 10,
        }),
        flexible("second", "b", {
          authority: "protected",
          priority: "must",
          baseDwellMinutes: 10,
        }),
      ],
      {
        scoreContext: {
          pace: "relaxed",
          preferEasyPaths: false,
        },
      },
    ),
  );

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  assert.equal(result.steps[0].bufferMinutes, 0);
  assert.equal(result.steps[1].bufferMinutes, 10);
  assert.equal(result.steps[0].score.paceAdjustedDwellMinutes, 12);
});

test("timed service duration is preserved regardless of pace", () => {
  const timed: OptimizerCandidate = {
    ...flexible("show", "a"),
    authority: "required",
    timing: "windowed",
    priority: "must",
    baseDwellMinutes: 30,
    anchor: showAnchor("show", "a", 600, 30),
  };

  const result = optimizeItinerary(
    request([timed], {
      scoreContext: {
        pace: "relaxed",
        preferEasyPaths: false,
      },
    }),
  );

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  assert.equal(result.steps[0].score.paceAdjustedDwellMinutes, 30);
  assert.equal(result.steps[0].serviceEndMinute - result.steps[0].serviceStartMinute, 30);
});

test("duplicate optimizer candidate IDs fail closed", () => {
  assert.throws(
    () =>
      optimizeItinerary(
        request([
          flexible("same", "a"),
          {
            ...flexible("other", "b"),
            id: "same",
          },
        ]),
      ),
    /Duplicate optimizer candidate ID/,
  );
});

test("alternatives must agree on authority timing and priority", () => {
  assert.throws(
    () =>
      optimizeItinerary(
        request([
          {
            ...flexible("first", "a", {
              priority: "favorite",
            }),
            selectionKey: "one-request",
          },
          {
            ...flexible("second", "b", {
              priority: "bonus",
            }),
            selectionKey: "one-request",
          },
        ]),
      ),
    /must share authority, timing, and priority/,
  );
});

test("timed scoring dwell must match anchor service duration", () => {
  const bad: OptimizerCandidate = {
    ...flexible("bad-show", "a"),
    authority: "required",
    timing: "windowed",
    priority: "must",
    baseDwellMinutes: 20,
    anchor: showAnchor("bad-show", "a", 600, 30),
  };

  assert.throws(
    () => optimizeItinerary(request([bad])),
    /base dwell must match fixed service duration/,
  );
});

test("bounded oracle refuses oversized candidate searches", () => {
  const candidates = Array.from(
    { length: MAX_EXHAUSTIVE_CANDIDATES + 1 },
    (_, index) =>
      flexible(`candidate-${index}`, "a", {
        baseDwellMinutes: 1,
      }),
  );

  const result = optimizeItinerary(request(candidates));

  assert.deepEqual(result, {
    status: "search-limit-exceeded",
    candidateCount: MAX_EXHAUSTIVE_CANDIDATES + 1,
    limit: MAX_EXHAUSTIVE_CANDIDATES,
  });
});

test("empty candidate set can still enforce return-to-exit", () => {
  const result = optimizeItinerary(
    request([], {
      endNodeId: "exit",
      horizon: horizon("09:00", "10:00"),
    }),
  );

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  assert.deepEqual(result.selectedCandidateIds, []);
  assert.ok(result.exitRoute);
  assert.equal(result.finishMinute, 560);
});

test("fixed code-unit tie-break chooses stable candidate order", () => {
  const localGraph = graph([
    edge("entry-a", "entry", "a", 1),
    edge("entry-b", "entry", "b", 1),
    edge("a-b", "a", "b", 1),
    edge("a-exit", "a", "exit", 1),
    edge("b-exit", "b", "exit", 1),
  ]);
  const result = optimizeItinerary(
    request(
      [
        flexible("ä", "a", {
          priority: "favorite",
          baseDwellMinutes: 1,
        }),
        flexible("z", "b", {
          priority: "favorite",
          baseDwellMinutes: 1,
        }),
      ],
      {
        graph: localGraph,
        horizon: horizon("09:00", "09:03"),
      },
    ),
  );

  assert.equal(result.status, "optimized");
  if (result.status !== "optimized") throw new Error("expected optimized");

  assert.deepEqual(result.selectedCandidateIds, ["z"]);
});


test("unreachable required exit is baseline infeasibility, not a mandatory tradeoff", () => {
  const localGraph = graph([
    edge("entry-a", "entry", "a", 5),
  ]);

  const result = optimizeItinerary(
    request([], {
      graph: localGraph,
      endNodeId: "exit",
    }),
  );

  assert.deepEqual(result, {
    status: "infeasible",
    reason: "END_NODE_UNREACHABLE",
    evaluatedStates: 1,
  });
});

test("exit that cannot be reached before departure is baseline infeasibility", () => {
  const localGraph = graph([
    edge("entry-exit", "entry", "exit", 20),
  ]);

  const result = optimizeItinerary(
    request([], {
      graph: localGraph,
      horizon: horizon("09:00", "09:10"),
      endNodeId: "exit",
    }),
  );

  assert.deepEqual(result, {
    status: "infeasible",
    reason: "END_NODE_AFTER_HORIZON",
    evaluatedStates: 1,
  });
});

test("score context is validated even when there are no candidates", () => {
  assert.throws(
    () =>
      optimizeItinerary(
        request([], {
          scoreContext: {
            pace: "warp",
            preferEasyPaths: false,
          } as unknown as Parameters<typeof optimizeItinerary>[0]["scoreContext"],
        }),
      ),
    /Pace must be/,
  );
});

test("timed anchors require whole-minute schedule semantics", () => {
  const bad: OptimizerCandidate = {
    ...flexible("half-minute-show", "a"),
    authority: "required",
    timing: "windowed",
    priority: "must",
    baseDwellMinutes: 20,
    anchor: {
      id: "half-minute-show",
      kind: "show",
      title: "Half minute",
      nodeId: "a",
      arrivalWindowStartMinute: 589.5,
      arrivalWindowEndMinute: 600.5,
      serviceStartMinute: 600.5,
      serviceEndMinute: 620.5,
    },
  };

  assert.throws(
    () => optimizeItinerary(request([bad])),
    /requires a valid schedule anchor/,
  );
});

test("malformed runtime anchors fail closed instead of throwing inside validation", () => {
  const bad = {
    ...flexible("bad-runtime-anchor", "a"),
    authority: "required",
    timing: "windowed",
    priority: "must",
    anchor: {
      id: 42,
      kind: "show",
      title: [],
      nodeId: "a",
      arrivalWindowStartMinute: 590,
      arrivalWindowEndMinute: 600,
      serviceStartMinute: 600,
      serviceEndMinute: 610,
    },
  } as unknown as OptimizerCandidate;

  assert.throws(
    () => optimizeItinerary(request([bad])),
    /requires a valid schedule anchor/,
  );
});
