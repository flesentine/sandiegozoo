import {
  optimizeItinerary,
  type OptimizerRequest,
  type OptimizerResult,
} from "./optimizer.ts";
import {
  optimizeItineraryScalable,
  type ScalableOptimizerResult,
  type ScalableOptimizerStats,
} from "./optimizer-scalable.ts";

export type QualificationExpectedStatus =
  | "complete"
  | "search-budget-exceeded"
  | "candidate-limit-exceeded";

export type QualificationThresholds = {
  expectedStatus: QualificationExpectedStatus;
  maxEvaluatedStates?: number;
  minBudgetHeadroomStates?: number;
  minDominancePrunes?: number;
  minUpperBoundPrunes?: number;
  minRouteCacheHits?: number;
  maxRouteCacheMisses?: number;
  requireOracleParity?: boolean;
};

export type OptimizerQualificationScenario = {
  id: string;
  request: OptimizerRequest;
  stateBudget: number;
  thresholds: QualificationThresholds;
};

export type OptimizerQualificationFailureCode =
  | "STATUS_MISMATCH"
  | "MAX_STATES_EXCEEDED"
  | "BUDGET_HEADROOM_TOO_LOW"
  | "DOMINANCE_PRUNING_TOO_LOW"
  | "UPPER_BOUND_PRUNING_TOO_LOW"
  | "ROUTE_CACHE_HITS_TOO_LOW"
  | "ROUTE_CACHE_MISSES_TOO_HIGH"
  | "ORACLE_LIMIT_EXCEEDED"
  | "ORACLE_RESULT_MISMATCH";

export type OptimizerQualificationFailure = {
  code: OptimizerQualificationFailureCode;
  message: string;
};

export type OptimizerQualificationReport = {
  id: string;
  passed: boolean;
  optimizerStatus: ScalableOptimizerResult["status"];
  candidateCount: number;
  stateBudget: number;
  evaluatedStates: number;
  budgetExhausted: boolean;
  budgetHeadroomStates: number;
  budgetOverrunStates: number;
  budgetHeadroomRatio: number;
  stats: ScalableOptimizerStats;
  oracleParityChecked: boolean;
  oracleParityMatched?: boolean;
  failures: OptimizerQualificationFailure[];
};

const EXPECTED_STATUSES: readonly QualificationExpectedStatus[] = [
  "complete",
  "search-budget-exceeded",
  "candidate-limit-exceeded",
];

const COUNT_THRESHOLD_KEYS = [
  "maxEvaluatedStates",
  "minBudgetHeadroomStates",
  "minDominancePrunes",
  "minUpperBoundPrunes",
  "minRouteCacheHits",
  "maxRouteCacheMisses",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeRatio(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function canonicalSemanticValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalSemanticValue);
  }

  if (isRecord(value)) {
    const normalized: Record<string, unknown> = {};

    for (const key of Object.keys(value).sort()) {
      if (key === "evaluatedStates") continue;
      normalized[key] = canonicalSemanticValue(value[key]);
    }

    return normalized;
  }

  return value;
}

function semanticResult(result: OptimizerResult) {
  return JSON.stringify(canonicalSemanticValue(result));
}

function addFailure(
  failures: OptimizerQualificationFailure[],
  code: OptimizerQualificationFailureCode,
  message: string,
) {
  failures.push({ code, message });
}

function statsFromResult(
  result: ScalableOptimizerResult,
): ScalableOptimizerStats {
  return { ...result.stats };
}

function assertNonNegativeInteger(
  value: unknown,
  label: string,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `Optimizer qualification ${label} must be a non-negative finite integer.`,
    );
  }
}

function assertValidThresholds(
  value: unknown,
  stateBudget: number,
): asserts value is QualificationThresholds {
  if (!isRecord(value)) {
    throw new Error(
      "Optimizer qualification thresholds must be an object.",
    );
  }

  if (
    typeof value.expectedStatus !== "string" ||
    !EXPECTED_STATUSES.includes(
      value.expectedStatus as QualificationExpectedStatus,
    )
  ) {
    throw new Error(
      "Optimizer qualification expectedStatus is invalid.",
    );
  }

  for (const key of COUNT_THRESHOLD_KEYS) {
    if (value[key] !== undefined) {
      assertNonNegativeInteger(value[key], key);
    }
  }

  if (
    typeof value.minBudgetHeadroomStates === "number" &&
    value.minBudgetHeadroomStates > stateBudget
  ) {
    throw new Error(
      "Optimizer qualification minBudgetHeadroomStates cannot exceed stateBudget.",
    );
  }

  if (
    value.requireOracleParity !== undefined &&
    typeof value.requireOracleParity !== "boolean"
  ) {
    throw new Error(
      "Optimizer qualification requireOracleParity must be boolean.",
    );
  }

  if (
    value.requireOracleParity === true &&
    value.expectedStatus !== "complete"
  ) {
    throw new Error(
      "Optimizer qualification oracle parity requires expectedStatus complete.",
    );
  }
}

function assertValidScenario(
  scenario: unknown,
): asserts scenario is OptimizerQualificationScenario {
  if (!isRecord(scenario)) {
    throw new Error(
      "Optimizer qualification scenario must be an object.",
    );
  }

  if (
    typeof scenario.id !== "string" ||
    scenario.id.trim().length === 0 ||
    scenario.id !== scenario.id.trim()
  ) {
    throw new Error(
      "Optimizer qualification scenario ID must be a stable non-empty string.",
    );
  }

  if (
    typeof scenario.stateBudget !== "number" ||
    !Number.isFinite(scenario.stateBudget) ||
    !Number.isInteger(scenario.stateBudget) ||
    scenario.stateBudget <= 0
  ) {
    throw new Error(
      "Optimizer qualification stateBudget must be a positive finite integer.",
    );
  }

  assertValidThresholds(
    scenario.thresholds,
    scenario.stateBudget,
  );
}

export function runOptimizerQualification(
  scenario: OptimizerQualificationScenario,
): OptimizerQualificationReport {
  assertValidScenario(scenario);

  const result = optimizeItineraryScalable(
    scenario.request,
    { stateBudget: scenario.stateBudget },
  );
  const stats = statsFromResult(result);
  const evaluatedStates = stats.evaluatedStates;
  const budgetExhausted =
    result.status === "search-budget-exceeded";
  const budgetHeadroomStates = Math.max(
    0,
    scenario.stateBudget - evaluatedStates,
  );
  const budgetOverrunStates = Math.max(
    0,
    evaluatedStates - scenario.stateBudget,
  );
  const budgetHeadroomRatio = normalizeRatio(
    budgetHeadroomStates / scenario.stateBudget,
  );
  const failures: OptimizerQualificationFailure[] = [];

  if (result.status !== scenario.thresholds.expectedStatus) {
    addFailure(
      failures,
      "STATUS_MISMATCH",
      `Expected status ${scenario.thresholds.expectedStatus} but received ${result.status}.`,
    );
  }

  if (
    scenario.thresholds.maxEvaluatedStates !== undefined &&
    evaluatedStates > scenario.thresholds.maxEvaluatedStates
  ) {
    addFailure(
      failures,
      "MAX_STATES_EXCEEDED",
      `Evaluated ${evaluatedStates} states, above maximum ${scenario.thresholds.maxEvaluatedStates}.`,
    );
  }

  if (
    scenario.thresholds.minBudgetHeadroomStates !== undefined &&
    budgetHeadroomStates <
      scenario.thresholds.minBudgetHeadroomStates
  ) {
    addFailure(
      failures,
      "BUDGET_HEADROOM_TOO_LOW",
      `Budget headroom ${budgetHeadroomStates} states is below minimum ${scenario.thresholds.minBudgetHeadroomStates}.`,
    );
  }

  if (
    scenario.thresholds.minDominancePrunes !== undefined &&
    stats.prunedByDominance <
      scenario.thresholds.minDominancePrunes
  ) {
    addFailure(
      failures,
      "DOMINANCE_PRUNING_TOO_LOW",
      `Dominance pruning count ${stats.prunedByDominance} is below minimum ${scenario.thresholds.minDominancePrunes}.`,
    );
  }

  if (
    scenario.thresholds.minUpperBoundPrunes !== undefined &&
    stats.prunedByUpperBound <
      scenario.thresholds.minUpperBoundPrunes
  ) {
    addFailure(
      failures,
      "UPPER_BOUND_PRUNING_TOO_LOW",
      `Upper-bound pruning count ${stats.prunedByUpperBound} is below minimum ${scenario.thresholds.minUpperBoundPrunes}.`,
    );
  }

  if (
    scenario.thresholds.minRouteCacheHits !== undefined &&
    stats.routeCacheHits <
      scenario.thresholds.minRouteCacheHits
  ) {
    addFailure(
      failures,
      "ROUTE_CACHE_HITS_TOO_LOW",
      `Route-cache hit count ${stats.routeCacheHits} is below minimum ${scenario.thresholds.minRouteCacheHits}.`,
    );
  }

  if (
    scenario.thresholds.maxRouteCacheMisses !== undefined &&
    stats.routeCacheMisses >
      scenario.thresholds.maxRouteCacheMisses
  ) {
    addFailure(
      failures,
      "ROUTE_CACHE_MISSES_TOO_HIGH",
      `Route-cache miss count ${stats.routeCacheMisses} is above maximum ${scenario.thresholds.maxRouteCacheMisses}.`,
    );
  }

  let oracleParityMatched: boolean | undefined;
  const oracleParityChecked =
    scenario.thresholds.requireOracleParity === true;

  if (oracleParityChecked) {
    const oracle = optimizeItinerary(scenario.request);

    if (oracle.status === "search-limit-exceeded") {
      oracleParityMatched = false;
      addFailure(
        failures,
        "ORACLE_LIMIT_EXCEEDED",
        "Scenario requested Planner 5 oracle parity but exceeds the eight-record oracle limit.",
      );
    } else if (result.status !== "complete") {
      oracleParityMatched = false;
      addFailure(
        failures,
        "ORACLE_RESULT_MISMATCH",
        "Planner 6 did not complete, so semantic oracle parity could not hold.",
      );
    } else {
      oracleParityMatched =
        semanticResult(result.result) ===
        semanticResult(oracle);

      if (!oracleParityMatched) {
        addFailure(
          failures,
          "ORACLE_RESULT_MISMATCH",
          "Planner 6 semantic result does not match Planner 5 oracle output.",
        );
      }
    }
  }

  return {
    id: scenario.id,
    passed: failures.length === 0,
    optimizerStatus: result.status,
    candidateCount: scenario.request.candidates.length,
    stateBudget: scenario.stateBudget,
    evaluatedStates,
    budgetExhausted,
    budgetHeadroomStates,
    budgetOverrunStates,
    budgetHeadroomRatio,
    stats,
    oracleParityChecked,
    oracleParityMatched,
    failures,
  };
}

export function runOptimizerQualificationSuite(
  scenarios: readonly OptimizerQualificationScenario[],
) {
  if (!Array.isArray(scenarios)) {
    throw new Error(
      "Optimizer qualification suite must be an array.",
    );
  }

  const seen = new Set<string>();
  const reports: OptimizerQualificationReport[] = [];

  for (const scenario of scenarios) {
    assertValidScenario(scenario);

    if (seen.has(scenario.id)) {
      throw new Error(
        `Duplicate optimizer qualification scenario ID: ${scenario.id}`,
      );
    }
    seen.add(scenario.id);
    reports.push(runOptimizerQualification(scenario));
  }

  return reports;
}
