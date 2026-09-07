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
import type {
  OptimizerCandidate,
  OptimizerRequest,
} from "../src/planner/optimizer.ts";
import {
  runOptimizerQualification,
  runOptimizerQualificationSuite,
  type OptimizerQualificationScenario,
} from "../src/planner/qualification.ts";

const provenance: SourceProvenance = {
  sourceUrl: "https://example.invalid/qualification-fixture",
  sourceLabel: "Synthetic qualification fixture",
  lastVerified: "2026-09-06T23:00:00-07:00",
  confidence: "verified",
};

function node(id: string): RouteNode {
  return {
    id,
    kind: id === "entry" || id === "exit"
      ? "entrance"
      : "destination",
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

function frozenScenarios(): OptimizerQualificationScenario[] {
  const sameNodeGraph = graph([], ["entry"]);

  const oracleMixed = request(
    [
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
    ],
    { endNodeId: "exit" },
  );

  const sameNode12 = request(
    Array.from(
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
    ),
    {
      graph: sameNodeGraph,
      initialNodeId: "entry",
      horizon: horizon("09:00", "10:00"),
      scoreContext: {
        pace: "maximize",
        preferEasyPaths: false,
      },
    },
  );

  const lineGraph = graph(
    [
      edge("entry-a", "entry", "a", 1),
      edge("a-b", "a", "b", 1),
      edge("b-c", "b", "c", 1),
    ],
    ["entry", "a", "b", "c"],
  );
  const lineUpperBound = request(
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
      graph: lineGraph,
      initialNodeId: "entry",
      horizon: horizon("09:00", "10:00"),
      scoreContext: {
        pace: "maximize",
        preferEasyPaths: false,
      },
    },
  );

  const timedAnchorReset = request(
    [
      {
        ...flexible("z-flex", "entry", {
          authority: "protected",
          priority: "must",
          baseDwellMinutes: 10,
        }),
        selectionKey: "a-flex",
      },
      {
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
      },
      {
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
      },
    ],
    {
      graph: sameNodeGraph,
      initialNodeId: "entry",
      horizon: horizon("09:00", "12:00"),
    },
  );

  return [
    {
      id: "oracle-mixed",
      request: oracleMixed,
      stateBudget: 500_000,
      thresholds: {
        expectedStatus: "complete",
        maxEvaluatedStates: 50_000,
        minBudgetHeadroomStates: 450_000,
        requireOracleParity: true,
      },
    },
    {
      id: "same-node-12",
      request: sameNode12,
      stateBudget: 500_000,
      thresholds: {
        expectedStatus: "complete",
        maxEvaluatedStates: 100_000,
        minBudgetHeadroomStates: 400_000,
      },
    },
    {
      id: "line-upper-bound",
      request: lineUpperBound,
      stateBudget: 500_000,
      thresholds: {
        expectedStatus: "complete",
        maxEvaluatedStates: 10_000,
        minBudgetHeadroomStates: 490_000,
        requireOracleParity: true,
      },
    },
    {
      id: "timed-anchor-reset",
      request: timedAnchorReset,
      stateBudget: 500_000,
      thresholds: {
        expectedStatus: "complete",
        maxEvaluatedStates: 10_000,
        minBudgetHeadroomStates: 490_000,
        requireOracleParity: true,
      },
    },
    {
      id: "budget-saturation-sentinel",
      request: sameNode12,
      stateBudget: 10,
      thresholds: {
        expectedStatus: "search-budget-exceeded",
        maxEvaluatedStates: 11,
      },
    },
  ];
}

test("frozen scalable qualification workload family passes", () => {
  const reports = runOptimizerQualificationSuite(
    frozenScenarios(),
  );

  assert.deepEqual(
    reports.map((report) => [
      report.id,
      report.passed,
      report.optimizerStatus,
    ]),
    [
      ["oracle-mixed", true, "complete"],
      ["same-node-12", true, "complete"],
      ["line-upper-bound", true, "complete"],
      ["timed-anchor-reset", true, "complete"],
      [
        "budget-saturation-sentinel",
        true,
        "search-budget-exceeded",
      ],
    ],
  );

  for (const report of reports) {
    assert.deepEqual(report.failures, []);
  }

  const bounded = reports.filter(
    (report) => report.oracleParityChecked,
  );
  assert.ok(bounded.length >= 3);
  for (const report of bounded) {
    assert.equal(report.oracleParityMatched, true);
  }
});

test("qualification reports deterministic budget headroom", () => {
  const report = runOptimizerQualification(
    frozenScenarios().find(
      (scenario) => scenario.id === "line-upper-bound",
    )!,
  );

  assert.equal(
    report.budgetHeadroomStates,
    report.stateBudget - report.evaluatedStates,
  );
  assert.equal(
    report.budgetHeadroomRatio,
    Math.round(
      (report.budgetHeadroomStates / report.stateBudget) *
        1_000_000,
    ) / 1_000_000,
  );
  assert.ok(report.budgetHeadroomRatio > 0.9);
});

test("qualification returns structured threshold failures instead of throwing", () => {
  const base = frozenScenarios().find(
    (scenario) => scenario.id === "line-upper-bound",
  )!;

  const report = runOptimizerQualification({
    ...base,
    id: "intentional-threshold-failure",
    thresholds: {
      ...base.thresholds,
      maxEvaluatedStates: 0,
      minBudgetHeadroomStates: base.stateBudget,
      minDominancePrunes: 999_999,
      minUpperBoundPrunes: 999_999,
      minRouteCacheHits: 999_999,
      maxRouteCacheMisses: 0,
    },
  });

  assert.equal(report.passed, false);
  assert.deepEqual(
    report.failures.map((failure) => failure.code),
    [
      "MAX_STATES_EXCEEDED",
      "BUDGET_HEADROOM_TOO_LOW",
      "DOMINANCE_PRUNING_TOO_LOW",
      "UPPER_BOUND_PRUNING_TOO_LOW",
      "ROUTE_CACHE_HITS_TOO_LOW",
      "ROUTE_CACHE_MISSES_TOO_HIGH",
    ],
  );
});

test("qualification rejects duplicate scenario IDs", () => {
  const scenario = frozenScenarios()[0];

  assert.throws(
    () =>
      runOptimizerQualificationSuite([
        scenario,
        { ...scenario },
      ]),
    /Duplicate optimizer qualification scenario ID/,
  );
});

test("qualification rejects malformed harness configuration", () => {
  const scenario = frozenScenarios()[0];

  assert.throws(
    () =>
      runOptimizerQualification({
        ...scenario,
        id: " bad ",
      }),
    /scenario ID must be/,
  );

  assert.throws(
    () =>
      runOptimizerQualification({
        ...scenario,
        stateBudget: 0,
      }),
    /stateBudget must be a positive finite integer/,
  );

  for (const badBudget of [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    1.5,
    -1,
  ]) {
    assert.throws(
      () =>
        runOptimizerQualification({
          ...scenario,
          id: `bad-budget-${String(badBudget)}`,
          stateBudget: badBudget,
        }),
      /stateBudget must be a positive finite integer/,
    );
  }
});

test("oracle parity requirement reports explicit oracle-limit failure", () => {
  const scenario = frozenScenarios().find(
    (item) => item.id === "same-node-12",
  )!;

  const report = runOptimizerQualification({
    ...scenario,
    id: "oversized-oracle-request",
    thresholds: {
      ...scenario.thresholds,
      requireOracleParity: true,
    },
  });

  assert.equal(report.passed, false);
  assert.equal(report.oracleParityChecked, true);
  assert.equal(report.oracleParityMatched, false);
  assert.ok(
    report.failures.some(
      (failure) =>
        failure.code === "ORACLE_LIMIT_EXCEEDED",
    ),
  );
});


test("qualification validates threshold values fail closed", () => {
  const base = frozenScenarios()[0];

  for (const [key, value] of [
    ["maxEvaluatedStates", Number.NaN],
    ["maxEvaluatedStates", -1],
    ["maxEvaluatedStates", 1.5],
    ["minBudgetHeadroomStates", -1],
    ["minDominancePrunes", Number.POSITIVE_INFINITY],
    ["minUpperBoundPrunes", 0.25],
    ["minRouteCacheHits", -5],
    ["maxRouteCacheMisses", Number.NaN],
  ] as const) {
    assert.throws(
      () =>
        runOptimizerQualification({
          ...base,
          id: `bad-${key}`,
          thresholds: {
            ...base.thresholds,
            [key]: value,
          },
        }),
      new RegExp(`${key} must be a non-negative finite integer`),
    );
  }

  assert.throws(
    () =>
      runOptimizerQualification({
        ...base,
        id: "bad-status",
        thresholds: {
          ...base.thresholds,
          expectedStatus: "maybe",
        } as unknown as OptimizerQualificationScenario["thresholds"],
      }),
    /expectedStatus is invalid/,
  );

  assert.throws(
    () =>
      runOptimizerQualification({
        ...base,
        id: "bad-parity-flag",
        thresholds: {
          ...base.thresholds,
          requireOracleParity: "yes",
        } as unknown as OptimizerQualificationScenario["thresholds"],
      }),
    /requireOracleParity must be boolean/,
  );

  assert.throws(
    () =>
      runOptimizerQualification({
        ...base,
        id: "impossible-headroom",
        thresholds: {
          ...base.thresholds,
          minBudgetHeadroomStates: base.stateBudget + 1,
        },
      }),
    /cannot exceed stateBudget/,
  );

  assert.throws(
    () =>
      runOptimizerQualification({
        ...base,
        id: "contradictory-parity",
        thresholds: {
          ...base.thresholds,
          expectedStatus: "search-budget-exceeded",
          requireOracleParity: true,
        },
      }),
    /oracle parity requires expectedStatus complete/,
  );
});

test("qualification reports budget exhaustion separately from headroom", () => {
  const scenario = frozenScenarios().find(
    (item) =>
      item.id === "budget-saturation-sentinel",
  )!;
  const report = runOptimizerQualification(scenario);

  assert.equal(report.optimizerStatus, "search-budget-exceeded");
  assert.equal(report.budgetExhausted, true);
  assert.equal(report.budgetHeadroomStates, 0);
  assert.equal(report.budgetHeadroomRatio, 0);
  assert.equal(report.budgetOverrunStates, 1);
});

test("unexpected scalable non-completion records both status and parity failure", () => {
  const base = frozenScenarios()[0];
  const report = runOptimizerQualification({
    ...base,
    id: "unexpected-budget-exhaustion",
    stateBudget: 1,
    thresholds: {
      expectedStatus: "complete",
      requireOracleParity: true,
    },
  });

  assert.equal(report.passed, false);
  assert.equal(report.optimizerStatus, "search-budget-exceeded");
  assert.equal(report.oracleParityChecked, true);
  assert.equal(report.oracleParityMatched, false);
  assert.deepEqual(
    report.failures.map((failure) => failure.code),
    ["STATUS_MISMATCH", "ORACLE_RESULT_MISMATCH"],
  );
});

test("qualification report snapshots do not contaminate later runs", () => {
  const scenario = frozenScenarios()[0];
  const first = runOptimizerQualification(scenario);
  first.stats.evaluatedStates = 999_999;
  first.failures.push({
    code: "MAX_STATES_EXCEEDED",
    message: "mutated",
  });

  const second = runOptimizerQualification(scenario);
  assert.notEqual(second.stats.evaluatedStates, 999_999);
  assert.deepEqual(second.failures, []);
  assert.equal(second.passed, true);
});

test("qualification suite results are scenario-order independent", () => {
  const scenarios = frozenScenarios();
  const forward = runOptimizerQualificationSuite(scenarios);
  const reverse = runOptimizerQualificationSuite(
    [...scenarios].reverse(),
  );

  const byId = (reports: typeof forward) =>
    Object.fromEntries(
      reports.map((report) => [report.id, report]),
    );

  assert.deepEqual(byId(reverse), byId(forward));
});

test("qualification rejects malformed runtime scenario and threshold objects", () => {
  assert.throws(
    () =>
      runOptimizerQualification(
        null as unknown as OptimizerQualificationScenario,
      ),
    /scenario must be an object/,
  );

  const base = frozenScenarios()[0];
  assert.throws(
    () =>
      runOptimizerQualification({
        ...base,
        thresholds: null,
      } as unknown as OptimizerQualificationScenario),
    /thresholds must be an object/,
  );
});
