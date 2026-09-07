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
  budgetHeadroomStates: number;
  budgetHeadroomRatio: number;
  stats: ScalableOptimizerStats;
  oracleParityChecked: boolean;
  oracleParityMatched?: boolean;
  failures: OptimizerQualificationFailure[];
};

function normalizeRatio(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function semanticResult(result: OptimizerResult) {
  return JSON.stringify(result, (key, value) =>
    key === "evaluatedStates" ? undefined : value,
  );
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

export function runOptimizerQualification(
  scenario: OptimizerQualificationScenario,
): OptimizerQualificationReport {
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
    !Number.isInteger(scenario.stateBudget) ||
    scenario.stateBudget <= 0
  ) {
    throw new Error(
      "Optimizer qualification stateBudget must be a positive integer.",
    );
  }

  const result = optimizeItineraryScalable(
    scenario.request,
    { stateBudget: scenario.stateBudget },
  );
  const stats = statsFromResult(result);
  const evaluatedStates = stats.evaluatedStates;
  const budgetHeadroomStates = Math.max(
    0,
    scenario.stateBudget - evaluatedStates,
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
    budgetHeadroomStates,
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
  const seen = new Set<string>();
  const reports: OptimizerQualificationReport[] = [];

  for (const scenario of scenarios) {
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
