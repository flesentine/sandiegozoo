import {
  buildPreferenceUtilityVector,
  comparePreferenceUtilityVectors,
  decideCandidateOmission,
  scoreCandidate,
  type OptionalDropReason,
  type PreferenceUtilityVector,
} from "./scoring.ts";
import {
  findShortestRoute,
  type RouteResult,
} from "./routing.ts";
import {
  assertValidRoutePolicy,
} from "./scheduling.ts";
import {
  advanceOptimizerState,
  assertValidOptimizerRequest,
  buildOptimizerGroups,
  compareOptimizerPlans,
  createOptimizerInitialState,
  finalizeOptimizerState,
  type OptimizerCandidateGroup,
  type OptimizerFinalizedPlan,
  type OptimizerOmission,
  type OptimizerRequest,
  type OptimizerResult,
  type OptimizerRouteResolver,
  type OptimizerSearchState,
  type OptimizerStepFailure,
} from "./optimizer.ts";

export const MAX_SCALABLE_CANDIDATES = 20;
export const DEFAULT_SCALABLE_STATE_BUDGET = 500_000;

export type ScalableOptimizerOptions = {
  stateBudget?: number;
};

export type ScalableOptimizerStats = {
  evaluatedStates: number;
  prunedByDominance: number;
  prunedByUpperBound: number;
  routeCacheHits: number;
  routeCacheMisses: number;
  dominanceFrontierEntries: number;
};

export type ScalableOptimizerComplete = {
  status: "complete";
  result: Exclude<OptimizerResult, { status: "search-limit-exceeded" }>;
  stats: ScalableOptimizerStats;
};

export type ScalableOptimizerBudgetExceeded = {
  status: "search-budget-exceeded";
  stateBudget: number;
  evaluatedStates: number;
  stats: ScalableOptimizerStats;
};

export type ScalableOptimizerCandidateLimitExceeded = {
  status: "candidate-limit-exceeded";
  candidateCount: number;
  limit: number;
  stats: ScalableOptimizerStats;
};

export type ScalableOptimizerResult =
  | ScalableOptimizerComplete
  | ScalableOptimizerBudgetExceeded
  | ScalableOptimizerCandidateLimitExceeded;

type SearchOutcome = {
  best?: OptimizerFinalizedPlan;
  failures: Set<OptimizerStepFailure>;
  finalizeFailures: Set<OptimizerStepFailure>;
  failuresBySelectionKey: Map<string, Set<OptimizerStepFailure>>;
};

type FrontierEntry = {
  minute: number;
  utility: PreferenceUtilityVector;
  totalTravelMinutes: number;
  totalTravelMeters: number;
  signature: string;
};

type Controller = {
  stateBudget: number;
  exhausted: boolean;
  stats: ScalableOptimizerStats;
  frontiers: Map<string, FrontierEntry[]>;
  resolveRoute: OptimizerRouteResolver;
};

const COST_PRECISION = 1_000_000_000;

function normalize(value: number) {
  return Math.round(value * COST_PRECISION) / COST_PRECISION;
}

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function cloneRouteResult(result: RouteResult): RouteResult {
  if (result.status === "not-found") {
    return { ...result };
  }

  return {
    ...result,
    nodeIds: [...result.nodeIds],
    edges: result.edges.map((edge) => ({
      ...edge,
      provenance: { ...edge.provenance },
    })),
  };
}

function createCachedRouteResolver(
  request: OptimizerRequest,
  stats: ScalableOptimizerStats,
): OptimizerRouteResolver {
  assertValidRoutePolicy(request.routePolicy);

  const cache = new Map<string, RouteResult>();

  return (fromNodeId, toNodeId) => {
    const key = JSON.stringify([fromNodeId, toNodeId]);
    const cached = cache.get(key);

    if (cached) {
      stats.routeCacheHits += 1;
      return cloneRouteResult(cached);
    }

    stats.routeCacheMisses += 1;
    const result = findShortestRoute(request.graph, {
      ...(request.routePolicy ?? {}),
      optimize: "duration",
      fromNodeId,
      toNodeId,
    });
    const snapshot = cloneRouteResult(result);
    cache.set(key, snapshot);
    return cloneRouteResult(snapshot);
  };
}

function emptyStats(): ScalableOptimizerStats {
  return {
    evaluatedStates: 0,
    prunedByDominance: 0,
    prunedByUpperBound: 0,
    routeCacheHits: 0,
    routeCacheMisses: 0,
    dominanceFrontierEntries: 0,
  };
}

function selectedKeySignature(state: OptimizerSearchState) {
  return [...state.selectedKeys].sort(compareText).join("\u001f");
}

function stateSignature(state: OptimizerSearchState) {
  return JSON.stringify(state.selectedCandidateIds);
}

function utilityForState(state: OptimizerSearchState) {
  return buildPreferenceUtilityVector(state.scores);
}

function dominates(a: FrontierEntry, b: FrontierEntry) {
  const utility = comparePreferenceUtilityVectors(a.utility, b.utility);

  if (utility > 0) return false;
  if (a.minute > b.minute) return false;
  if (a.totalTravelMinutes > b.totalTravelMinutes) return false;
  if (a.totalTravelMeters > b.totalTravelMeters) return false;

  const equalMetrics =
    utility === 0 &&
    a.minute === b.minute &&
    a.totalTravelMinutes === b.totalTravelMinutes &&
    a.totalTravelMeters === b.totalTravelMeters;

  if (equalMetrics && compareText(a.signature, b.signature) > 0) {
    return false;
  }

  return true;
}

function dominanceKey(state: OptimizerSearchState) {
  return JSON.stringify([
    selectedKeySignature(state),
    state.nodeId,
  ]);
}

function acceptByDominance(
  controller: Controller,
  state: OptimizerSearchState,
) {
  const key = dominanceKey(state);
  const entries = controller.frontiers.get(key) ?? [];
  const candidate: FrontierEntry = {
    minute: state.minute,
    utility: utilityForState(state),
    totalTravelMinutes: state.totalTravelMinutes,
    totalTravelMeters: state.totalTravelMeters,
    signature: stateSignature(state),
  };

  if (entries.some((entry) => dominates(entry, candidate))) {
    controller.stats.prunedByDominance += 1;
    return false;
  }

  const survivors = entries.filter(
    (entry) => !dominates(candidate, entry),
  );
  survivors.push(candidate);
  controller.frontiers.set(key, survivors);
  controller.stats.dominanceFrontierEntries +=
    survivors.length - entries.length;

  return true;
}

function optimisticUtility(
  request: OptimizerRequest,
  state: OptimizerSearchState,
  groups: readonly OptimizerCandidateGroup[],
) {
  const upper = utilityForState(state);
  const clone: PreferenceUtilityVector = {
    must: { ...upper.must },
    favorite: { ...upper.favorite },
    bonus: { ...upper.bonus },
  };

  for (const group of groups) {
    if (state.selectedKeys.has(group.selectionKey)) continue;

    const representative = group.candidates[0];
    const score = scoreCandidate(
      representative,
      request.scoreContext,
    );
    const tier = clone[score.priority];
    tier.count += 1;
    tier.netPoints = normalize(
      tier.netPoints + score.preferencePoints,
    );
  }

  return clone;
}

function upperBoundCannotBeat(
  request: OptimizerRequest,
  state: OptimizerSearchState,
  groups: readonly OptimizerCandidateGroup[],
  best: OptimizerFinalizedPlan | undefined,
) {
  if (!best) return false;

  const upper = optimisticUtility(request, state, groups);
  const utility = comparePreferenceUtilityVectors(
    upper,
    best.utility,
  );

  if (utility > 0) return true;
  if (utility < 0) return false;

  if (state.totalTravelMinutes > best.totalTravelMinutes) {
    return true;
  }

  if (
    state.totalTravelMinutes === best.totalTravelMinutes &&
    state.totalTravelMeters > best.totalTravelMeters
  ) {
    return true;
  }

  if (
    state.totalTravelMinutes === best.totalTravelMinutes &&
    state.totalTravelMeters === best.totalTravelMeters &&
    state.minute > best.finishMinute
  ) {
    return true;
  }

  return false;
}

function allRequiredSelected(
  state: OptimizerSearchState,
  requiredKeys: ReadonlySet<string>,
) {
  for (const key of requiredKeys) {
    if (!state.selectedKeys.has(key)) return false;
  }
  return true;
}

function recordFailure(
  map: Map<string, Set<OptimizerStepFailure>>,
  selectionKey: string,
  failure: OptimizerStepFailure,
) {
  const failures =
    map.get(selectionKey) ?? new Set<OptimizerStepFailure>();
  failures.add(failure);
  map.set(selectionKey, failures);
}

function search(
  request: OptimizerRequest,
  groups: readonly OptimizerCandidateGroup[],
  requiredKeys: ReadonlySet<string>,
  controller: Controller,
): SearchOutcome {
  const failures = new Set<OptimizerStepFailure>();
  const finalizeFailures = new Set<OptimizerStepFailure>();
  const failuresBySelectionKey = new Map<
    string,
    Set<OptimizerStepFailure>
  >();
  let best: OptimizerFinalizedPlan | undefined;

  controller.frontiers = new Map();

  function visit(state: OptimizerSearchState) {
    if (controller.exhausted) return;

    controller.stats.evaluatedStates += 1;
    if (
      controller.stats.evaluatedStates >
      controller.stateBudget
    ) {
      controller.exhausted = true;
      return;
    }

    if (!acceptByDominance(controller, state)) {
      return;
    }

    if (allRequiredSelected(state, requiredKeys)) {
      const finalized = finalizeOptimizerState(
        request,
        state,
        controller.resolveRoute,
      );

      if (typeof finalized === "string") {
        failures.add(finalized);
        finalizeFailures.add(finalized);
      } else if (
        !best ||
        compareOptimizerPlans(finalized, best) < 0
      ) {
        best = finalized;
      }
    }

    if (
      upperBoundCannotBeat(
        request,
        state,
        groups,
        best,
      )
    ) {
      controller.stats.prunedByUpperBound += 1;
      return;
    }

    for (const group of groups) {
      if (state.selectedKeys.has(group.selectionKey)) {
        continue;
      }

      for (const candidate of group.candidates) {
        const next = advanceOptimizerState(
          request,
          state,
          candidate,
          controller.resolveRoute,
        );

        if (typeof next === "string") {
          failures.add(next);
          recordFailure(
            failuresBySelectionKey,
            group.selectionKey,
            next,
          );
          continue;
        }

        visit(next);

        if (controller.exhausted) return;
      }
    }
  }

  visit(createOptimizerInitialState(request));

  return {
    best,
    failures,
    finalizeFailures,
    failuresBySelectionKey,
  };
}

function omissionReasonFromFailures(
  failures: ReadonlySet<OptimizerStepFailure>,
): OptionalDropReason {
  if (
    failures.size === 1 &&
    failures.has("OUTSIDE_HORIZON")
  ) {
    return "OUTSIDE_HORIZON";
  }

  if (failures.size === 1 && failures.has("NO_ROUTE")) {
    return "NO_ROUTE";
  }

  if (
    failures.size === 1 &&
    failures.has("ANCHOR_CONFLICT")
  ) {
    return "ANCHOR_CONFLICT";
  }

  return "INSUFFICIENT_TIME";
}

function diagnoseOmittedGroup(
  request: OptimizerRequest,
  mandatoryGroups: readonly OptimizerCandidateGroup[],
  group: OptimizerCandidateGroup,
  controller: Controller,
) {
  const groups = [...mandatoryGroups, group].sort((a, b) =>
    compareText(a.selectionKey, b.selectionKey),
  );
  const required = new Set(
    groups.map((item) => item.selectionKey),
  );
  const outcome = search(
    request,
    groups,
    required,
    controller,
  );

  if (controller.exhausted) return null;

  if (outcome.best) {
    return "LOWER_PRIORITY_ALTERNATIVE" as const;
  }

  const groupFailures =
    outcome.failuresBySelectionKey.get(group.selectionKey);
  const diagnosticFailures =
    groupFailures && groupFailures.size > 0
      ? groupFailures
      : outcome.finalizeFailures.size > 0
        ? outcome.finalizeFailures
        : outcome.failures;

  return omissionReasonFromFailures(diagnosticFailures);
}

function combinations<T>(
  values: readonly T[],
  size: number,
): T[][] {
  const result: T[][] = [];

  function visit(start: number, selected: T[]) {
    if (selected.length === size) {
      result.push([...selected]);
      return;
    }

    for (
      let index = start;
      index <=
      values.length - (size - selected.length);
      index += 1
    ) {
      selected.push(values[index]);
      visit(index + 1, selected);
      selected.pop();
    }
  }

  visit(0, []);
  return result;
}

function findMinimalTradeoffOptions(
  request: OptimizerRequest,
  mandatoryGroups: readonly OptimizerCandidateGroup[],
  controller: Controller,
) {
  for (
    let size = 1;
    size <= mandatoryGroups.length;
    size += 1
  ) {
    const options: string[][] = [];

    for (
      const removedGroups of combinations(
        mandatoryGroups,
        size,
      )
    ) {
      const removedKeys = new Set(
        removedGroups.map(
          (group) => group.selectionKey,
        ),
      );
      const remaining = mandatoryGroups.filter(
        (group) =>
          !removedKeys.has(group.selectionKey),
      );
      const required = new Set(
        remaining.map((group) => group.selectionKey),
      );
      const outcome = search(
        request,
        remaining,
        required,
        controller,
      );

      if (controller.exhausted) return null;

      if (outcome.best) {
        options.push(
          [...removedKeys].sort(compareText),
        );
      }
    }

    if (options.length > 0) {
      options.sort((a, b) =>
        compareText(
          JSON.stringify(a),
          JSON.stringify(b),
        ),
      );
      return options;
    }
  }

  return [
    mandatoryGroups
      .map((group) => group.selectionKey)
      .sort(compareText),
  ];
}

function budgetExceeded(
  controller: Controller,
): ScalableOptimizerBudgetExceeded {
  return {
    status: "search-budget-exceeded",
    stateBudget: controller.stateBudget,
    evaluatedStates: controller.stats.evaluatedStates,
    stats: { ...controller.stats },
  };
}

function assembleOptimizedResult(
  request: OptimizerRequest,
  groups: readonly OptimizerCandidateGroup[],
  mandatoryGroups: readonly OptimizerCandidateGroup[],
  best: OptimizerFinalizedPlan,
  controller: Controller,
): Exclude<
  OptimizerResult,
  | { status: "search-limit-exceeded" }
  | { status: "tradeoff-required" }
  | { status: "infeasible" }
> | null {
  const selectedKeys = best.state.selectedKeys;
  const selectedCandidateIds = new Set(
    best.state.selectedCandidateIds,
  );
  const omissions: OptimizerOmission[] = [];
  const unselectedAlternativeCandidateIds: string[] = [];

  for (const group of groups) {
    if (selectedKeys.has(group.selectionKey)) {
      for (const candidate of group.candidates) {
        if (!selectedCandidateIds.has(candidate.id)) {
          unselectedAlternativeCandidateIds.push(
            candidate.id,
          );
        }
      }
      continue;
    }

    if (group.authority !== "optional") {
      throw new Error(
        `Scalable optimizer invariant violated: mandatory selectionKey ${group.selectionKey} was omitted.`,
      );
    }

    const reason = diagnoseOmittedGroup(
      request,
      mandatoryGroups,
      group,
      controller,
    );

    if (!reason) return null;

    const representative = group.candidates[0];
    omissions.push({
      selectionKey: group.selectionKey,
      candidateIds: group.candidates.map(
        (candidate) => candidate.id,
      ),
      reason,
      decision: decideCandidateOmission(
        representative,
        reason,
      ),
    });
  }

  omissions.sort((a, b) =>
    compareText(a.selectionKey, b.selectionKey),
  );
  unselectedAlternativeCandidateIds.sort(compareText);

  return {
    status: "optimized",
    selectedCandidateIds: [
      ...best.state.selectedCandidateIds,
    ],
    selectedSelectionKeys: [
      ...selectedKeys,
    ].sort(compareText),
    steps: [...best.state.steps],
    utility: best.utility,
    finishMinute: best.finishMinute,
    remainingMinutes: best.remainingMinutes,
    totalTravelMinutes: best.totalTravelMinutes,
    totalTravelMeters: best.totalTravelMeters,
    exitRoute: best.exitRoute,
    omissions,
    unselectedAlternativeCandidateIds,
    evaluatedStates: controller.stats.evaluatedStates,
  };
}

export function optimizeItineraryScalable(
  request: OptimizerRequest,
  options: ScalableOptimizerOptions = {},
): ScalableOptimizerResult {
  assertValidOptimizerRequest(request);

  const stateBudget =
    options.stateBudget ??
    DEFAULT_SCALABLE_STATE_BUDGET;

  if (
    !Number.isInteger(stateBudget) ||
    stateBudget <= 0
  ) {
    throw new Error(
      "Scalable optimizer stateBudget must be a positive integer.",
    );
  }

  const stats = emptyStats();
  const groups = buildOptimizerGroups(
    request.graph,
    request.candidates,
  );

  if (
    request.candidates.length >
    MAX_SCALABLE_CANDIDATES
  ) {
    return {
      status: "candidate-limit-exceeded",
      candidateCount: request.candidates.length,
      limit: MAX_SCALABLE_CANDIDATES,
      stats,
    };
  }

  const controller: Controller = {
    stateBudget,
    exhausted: false,
    stats,
    frontiers: new Map(),
    resolveRoute: (() => {
      throw new Error("route resolver not initialized");
    }) as OptimizerRouteResolver,
  };
  controller.resolveRoute = createCachedRouteResolver(
    request,
    stats,
  );

  const baseline = search(
    request,
    [],
    new Set(),
    controller,
  );

  if (controller.exhausted) {
    return budgetExceeded(controller);
  }

  if (!baseline.best) {
    const result: Exclude<
      OptimizerResult,
      { status: "search-limit-exceeded" }
    > = {
      status: "infeasible",
      reason: baseline.failures.has("NO_ROUTE")
        ? "END_NODE_UNREACHABLE"
        : "END_NODE_AFTER_HORIZON",
      evaluatedStates: stats.evaluatedStates,
    };

    return {
      status: "complete",
      result,
      stats: { ...stats },
    };
  }

  const mandatoryGroups = groups.filter(
    (group) => group.authority !== "optional",
  );
  const mandatoryKeys = new Set(
    mandatoryGroups.map(
      (group) => group.selectionKey,
    ),
  );
  const mandatory = search(
    request,
    mandatoryGroups,
    mandatoryKeys,
    controller,
  );

  if (controller.exhausted) {
    return budgetExceeded(controller);
  }

  if (!mandatory.best) {
    const tradeoffOptions =
      findMinimalTradeoffOptions(
        request,
        mandatoryGroups,
        controller,
      );

    if (!tradeoffOptions || controller.exhausted) {
      return budgetExceeded(controller);
    }

    return {
      status: "complete",
      result: {
        status: "tradeoff-required",
        reason: "MANDATORY_SET_INFEASIBLE",
        mandatorySelectionKeys: [
          ...mandatoryKeys,
        ].sort(compareText),
        tradeoffOptions,
        evaluatedStates: stats.evaluatedStates,
      },
      stats: { ...stats },
    };
  }

  const full = search(
    request,
    groups,
    mandatoryKeys,
    controller,
  );

  if (controller.exhausted) {
    return budgetExceeded(controller);
  }

  const best = full.best ?? mandatory.best;
  const optimized = assembleOptimizedResult(
    request,
    groups,
    mandatoryGroups,
    best,
    controller,
  );

  if (!optimized || controller.exhausted) {
    return budgetExceeded(controller);
  }

  return {
    status: "complete",
    result: optimized,
    stats: { ...stats },
  };
}
