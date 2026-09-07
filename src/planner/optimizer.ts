import {
  buildPreferenceUtilityVector,
  comparePreferenceUtilityVectors,
  decideCandidateOmission,
  scoreCandidate,
  assertValidScoringCandidate,
  assertValidScoreContext,
  type CandidateAuthority,
  type CandidateScore,
  type OmissionDecision,
  type OptionalDropReason,
  type PreferenceUtilityVector,
  type ScoreContext,
  type ScoringCandidate,
} from "./scoring.ts";
import {
  assertCompiledRoutingGraph,
  findShortestRoute,
  type RouteFound,
  type RouteResult,
  type RoutingGraph,
} from "./routing.ts";
import {
  assertValidRoutePolicy,
  isValidPlanningHorizon,
  isValidScheduleAnchor,
  type PlanningHorizon,
  type RoutePolicy,
  type ScheduleAnchor,
} from "./scheduling.ts";

export const MAX_EXHAUSTIVE_CANDIDATES = 8;

export type OptimizerCandidate = ScoringCandidate & {
  selectionKey: string;
  nodeId: string;
  anchor?: ScheduleAnchor;
};

export type OptimizerRequest = {
  graph: RoutingGraph;
  horizon: PlanningHorizon;
  initialNodeId: string;
  endNodeId?: string;
  candidates: readonly OptimizerCandidate[];
  scoreContext: ScoreContext;
  routePolicy?: RoutePolicy;
};

export type OptimizerStep = {
  candidateId: string;
  selectionKey: string;
  authority: CandidateAuthority;
  nodeId: string;
  departMinute: number;
  travelDurationMinutes: number;
  travelDistanceMeters: number;
  rawArrivalMinute: number;
  bufferMinutes: number;
  plannedArrivalMinute: number;
  waitMinutes: number;
  serviceStartMinute: number;
  serviceEndMinute: number;
  route: RouteFound;
  score: CandidateScore;
};

export type OptimizerOmission = {
  selectionKey: string;
  candidateIds: string[];
  reason: OptionalDropReason;
  decision: OmissionDecision;
};

export type OptimizedItinerary = {
  status: "optimized";
  selectedCandidateIds: string[];
  selectedSelectionKeys: string[];
  steps: OptimizerStep[];
  utility: PreferenceUtilityVector;
  finishMinute: number;
  remainingMinutes: number;
  totalTravelMinutes: number;
  totalTravelMeters: number;
  exitRoute?: RouteFound;
  omissions: OptimizerOmission[];
  unselectedAlternativeCandidateIds: string[];
  evaluatedStates: number;
};

export type OptimizerBaselineInfeasible = {
  status: "infeasible";
  reason: "END_NODE_UNREACHABLE" | "END_NODE_AFTER_HORIZON";
  evaluatedStates: number;
};

export type OptimizerTradeoff = {
  status: "tradeoff-required";
  reason: "MANDATORY_SET_INFEASIBLE";
  mandatorySelectionKeys: string[];
  tradeoffOptions: string[][];
  evaluatedStates: number;
};

export type OptimizerSearchLimit = {
  status: "search-limit-exceeded";
  candidateCount: number;
  limit: number;
};

export type OptimizerResult =
  | OptimizedItinerary
  | OptimizerBaselineInfeasible
  | OptimizerTradeoff
  | OptimizerSearchLimit;

export type OptimizerOptimizerCandidateGroup = {
  selectionKey: string;
  authority: CandidateAuthority;
  candidates: OptimizerCandidate[];
};

export type OptimizerOptimizerStepFailure =
  | "OUTSIDE_HORIZON"
  | "NO_ROUTE"
  | "ANCHOR_CONFLICT"
  | "INSUFFICIENT_TIME";

export type OptimizerOptimizerSearchState = {
  nodeId: string;
  minute: number;
  selectedKeys: Set<string>;
  selectedCandidateIds: string[];
  steps: OptimizerStep[];
  scores: CandidateScore[];
  totalTravelMinutes: number;
  totalTravelMeters: number;
};

export type OptimizerOptimizerFinalizedPlan = {
  state: OptimizerSearchState;
  utility: PreferenceUtilityVector;
  finishMinute: number;
  remainingMinutes: number;
  totalTravelMinutes: number;
  totalTravelMeters: number;
  exitRoute?: RouteFound;
  signature: string;
};

type SearchOutcome = {
  best?: OptimizerFinalizedPlan;
  evaluatedStates: number;
  failures: Set<OptimizerStepFailure>;
  finalizeFailures: Set<OptimizerStepFailure>;
  failuresBySelectionKey: Map<string, Set<OptimizerStepFailure>>;
};

const COST_PRECISION = 1_000_000_000;

function normalize(value: number) {
  return Math.round(value * COST_PRECISION) / COST_PRECISION;
}

function addCost(a: number, b: number) {
  return normalize(a + b);
}

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function nonEmptyStableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function assertOptimizerCandidate(
  graph: RoutingGraph,
  candidate: unknown,
): asserts candidate is OptimizerCandidate {
  assertValidScoringCandidate(candidate);

  const value = candidate as OptimizerCandidate;

  if (!nonEmptyStableId(value.selectionKey)) {
    throw new Error(
      "OptimizerCandidate selectionKey must be a stable non-empty ID without surrounding whitespace.",
    );
  }

  if (!nonEmptyStableId(value.nodeId)) {
    throw new Error(
      "OptimizerCandidate nodeId must be a stable non-empty ID without surrounding whitespace.",
    );
  }

  if (!graph.hasNode(value.nodeId)) {
    throw new Error(
      `OptimizerCandidate ${value.id} references unknown node ${value.nodeId}.`,
    );
  }

  if (value.timing === "flexible") {
    if (value.anchor !== undefined) {
      throw new Error(
        `Flexible candidate ${value.id} cannot carry a schedule anchor.`,
      );
    }
  } else {
    if (!value.anchor || !isValidScheduleAnchor(value.anchor)) {
      throw new Error(
        `Timed candidate ${value.id} requires a valid schedule anchor.`,
      );
    }

    if (value.anchor.nodeId !== value.nodeId) {
      throw new Error(
        `Timed candidate ${value.id} node must match its schedule anchor node.`,
      );
    }

    const serviceDuration =
      value.anchor.serviceEndMinute - value.anchor.serviceStartMinute;

    if (serviceDuration !== value.baseDwellMinutes) {
      throw new Error(
        `Timed candidate ${value.id} base dwell must match fixed service duration.`,
      );
    }

    if (value.timing === "fixed") {
      if (
        value.anchor.kind !== "locked" ||
        value.anchor.arrivalWindowStartMinute !== value.anchor.serviceStartMinute ||
        value.anchor.arrivalWindowEndMinute !== value.anchor.serviceStartMinute
      ) {
        throw new Error(
          `Fixed candidate ${value.id} must use an exact locked anchor.`,
        );
      }
    }

    if (value.timing === "windowed" && value.anchor.kind !== "show") {
      throw new Error(
        `Windowed candidate ${value.id} must use a show anchor.`,
      );
    }
  }

  if (value.authority === "locked" && value.timing !== "fixed") {
    throw new Error(
      `Locked candidate ${value.id} must use fixed timing.`,
    );
  }
}

export function buildOptimizerGroups(
  graph: RoutingGraph,
  candidates: readonly OptimizerCandidate[],
) {
  const byId = new Set<string>();
  const groups = new Map<string, OptimizerCandidateGroup>();

  for (const rawCandidate of candidates) {
    assertOptimizerCandidate(graph, rawCandidate);
    const candidate = rawCandidate;

    if (byId.has(candidate.id)) {
      throw new Error(`Duplicate optimizer candidate ID: ${candidate.id}`);
    }
    byId.add(candidate.id);

    const existing = groups.get(candidate.selectionKey);

    if (!existing) {
      groups.set(candidate.selectionKey, {
        selectionKey: candidate.selectionKey,
        authority: candidate.authority,
        candidates: [{ ...candidate }],
      });
      continue;
    }

    const first = existing.candidates[0];

    if (
      candidate.authority !== first.authority ||
      candidate.timing !== first.timing ||
      candidate.priority !== first.priority
    ) {
      throw new Error(
        `All alternatives for selectionKey ${candidate.selectionKey} must share authority, timing, and priority.`,
      );
    }

    existing.candidates.push({ ...candidate });
  }

  const result = [...groups.values()].sort((a, b) =>
    compareText(a.selectionKey, b.selectionKey),
  );

  for (const group of result) {
    group.candidates.sort((a, b) => compareText(a.id, b.id));

    if (group.authority === "locked" && group.candidates.length !== 1) {
      throw new Error(
        `Locked selectionKey ${group.selectionKey} must have exactly one candidate.`,
      );
    }
  }

  return result;
}

function routePolicyWithDuration(routePolicy: RoutePolicy | undefined) {
  return {
    ...(routePolicy ?? {}),
    optimize: "duration" as const,
  };
}

export type OptimizerRouteResolver = (
  fromNodeId: string,
  toNodeId: string,
) => RouteResult;

export function createOptimizerRouteResolver(
  request: OptimizerRequest,
): OptimizerRouteResolver {
  return (fromNodeId, toNodeId) =>
    findShortestRoute(request.graph, {
      ...routePolicyWithDuration(request.routePolicy),
      fromNodeId,
      toNodeId,
    });
}

export function advanceOptimizerState(
  request: OptimizerRequest,
  state: OptimizerSearchState,
  candidate: OptimizerCandidate,
  resolveRoute: OptimizerRouteResolver = createOptimizerRouteResolver(request),
): OptimizerSearchState | OptimizerStepFailure {
  const route = resolveRoute(state.nodeId, candidate.nodeId);

  if (route.status === "not-found") {
    return "NO_ROUTE";
  }

  const score = scoreCandidate(
    candidate,
    request.scoreContext,
    route,
  );
  const rawArrivalMinute = addCost(
    state.minute,
    route.durationMinutes,
  );
  const bufferMinutes =
    state.steps.length === 0 ? 0 : score.betweenStopBufferMinutes;
  const bufferedArrivalMinute = addCost(
    rawArrivalMinute,
    bufferMinutes,
  );

  let plannedArrivalMinute = bufferedArrivalMinute;
  let waitMinutes = 0;
  let serviceStartMinute: number;
  let serviceEndMinute: number;

  if (candidate.anchor) {
    if (
      candidate.anchor.serviceStartMinute < request.horizon.startMinute ||
      candidate.anchor.serviceEndMinute > request.horizon.endMinute
    ) {
      return "OUTSIDE_HORIZON";
    }

    if (bufferedArrivalMinute > candidate.anchor.arrivalWindowEndMinute) {
      return "ANCHOR_CONFLICT";
    }

    plannedArrivalMinute = Math.max(
      bufferedArrivalMinute,
      candidate.anchor.arrivalWindowStartMinute,
    );
    serviceStartMinute = candidate.anchor.serviceStartMinute;
    serviceEndMinute = candidate.anchor.serviceEndMinute;
    waitMinutes = normalize(
      serviceStartMinute - plannedArrivalMinute,
    );
  } else {
    serviceStartMinute = bufferedArrivalMinute;
    serviceEndMinute = addCost(
      serviceStartMinute,
      score.paceAdjustedDwellMinutes,
    );

    if (serviceEndMinute > request.horizon.endMinute) {
      return "INSUFFICIENT_TIME";
    }
  }

  return {
    nodeId: candidate.nodeId,
    minute: serviceEndMinute,
    selectedKeys: new Set([
      ...state.selectedKeys,
      candidate.selectionKey,
    ]),
    selectedCandidateIds: [
      ...state.selectedCandidateIds,
      candidate.id,
    ],
    steps: [
      ...state.steps,
      {
        candidateId: candidate.id,
        selectionKey: candidate.selectionKey,
        authority: candidate.authority,
        nodeId: candidate.nodeId,
        departMinute: state.minute,
        travelDurationMinutes: route.durationMinutes,
        travelDistanceMeters: route.distanceMeters,
        rawArrivalMinute,
        bufferMinutes,
        plannedArrivalMinute,
        waitMinutes,
        serviceStartMinute,
        serviceEndMinute,
        route,
        score,
      },
    ],
    scores: [...state.scores, score],
    totalTravelMinutes: addCost(
      state.totalTravelMinutes,
      route.durationMinutes,
    ),
    totalTravelMeters: addCost(
      state.totalTravelMeters,
      route.distanceMeters,
    ),
  };
}

export function finalizeOptimizerState(
  request: OptimizerRequest,
  state: OptimizerSearchState,
  resolveRoute: OptimizerRouteResolver = createOptimizerRouteResolver(request),
): OptimizerFinalizedPlan | OptimizerStepFailure {
  let finishMinute = state.minute;
  let totalTravelMinutes = state.totalTravelMinutes;
  let totalTravelMeters = state.totalTravelMeters;
  let exitRoute: RouteFound | undefined;

  if (request.endNodeId !== undefined) {
    const route = resolveRoute(state.nodeId, request.endNodeId);

    if (route.status === "not-found") {
      return "NO_ROUTE";
    }

    finishMinute = addCost(finishMinute, route.durationMinutes);

    if (finishMinute > request.horizon.endMinute) {
      return "INSUFFICIENT_TIME";
    }

    totalTravelMinutes = addCost(
      totalTravelMinutes,
      route.durationMinutes,
    );
    totalTravelMeters = addCost(
      totalTravelMeters,
      route.distanceMeters,
    );
    exitRoute = route;
  }

  return {
    state,
    utility: buildPreferenceUtilityVector(state.scores),
    finishMinute,
    remainingMinutes: normalize(
      request.horizon.endMinute - finishMinute,
    ),
    totalTravelMinutes,
    totalTravelMeters,
    exitRoute,
    signature: JSON.stringify(state.selectedCandidateIds),
  };
}

export function compareOptimizerPlans(
  a: OptimizerFinalizedPlan,
  b: OptimizerFinalizedPlan,
) {
  const utility = comparePreferenceUtilityVectors(
    a.utility,
    b.utility,
  );
  if (utility !== 0) return utility;

  if (a.totalTravelMinutes !== b.totalTravelMinutes) {
    return a.totalTravelMinutes - b.totalTravelMinutes;
  }

  if (a.totalTravelMeters !== b.totalTravelMeters) {
    return a.totalTravelMeters - b.totalTravelMeters;
  }

  if (a.finishMinute !== b.finishMinute) {
    return a.finishMinute - b.finishMinute;
  }

  return compareText(a.signature, b.signature);
}

export function createOptimizerInitialState(
  request: OptimizerRequest,
): OptimizerSearchState {
  return {
    nodeId: request.initialNodeId,
    minute: request.horizon.startMinute,
    selectedKeys: new Set(),
    selectedCandidateIds: [],
    steps: [],
    scores: [],
    totalTravelMinutes: 0,
    totalTravelMeters: 0,
  };
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

function search(
  request: OptimizerRequest,
  groups: readonly OptimizerCandidateGroup[],
  requiredKeys: ReadonlySet<string>,
): SearchOutcome {
  const failures = new Set<OptimizerStepFailure>();
  const finalizeFailures = new Set<OptimizerStepFailure>();
  const failuresBySelectionKey = new Map<string, Set<OptimizerStepFailure>>();
  let evaluatedStates = 0;
  let best: OptimizerFinalizedPlan | undefined;

  const start = createOptimizerInitialState(request);

  function visit(state: OptimizerSearchState) {
    evaluatedStates += 1;

    if (allRequiredSelected(state, requiredKeys)) {
      const finalized = finalizeOptimizerState(request, state);

      if (typeof finalized === "string") {
        failures.add(finalized);
        finalizeFailures.add(finalized);
      } else if (!best || compareOptimizerPlans(finalized, best) < 0) {
        best = finalized;
      }
    }

    for (const group of groups) {
      if (state.selectedKeys.has(group.selectionKey)) continue;

      for (const candidate of group.candidates) {
        const next = advanceOptimizerState(request, state, candidate);

        if (typeof next === "string") {
          failures.add(next);
          const groupFailures =
            failuresBySelectionKey.get(group.selectionKey) ??
            new Set<OptimizerStepFailure>();
          groupFailures.add(next);
          failuresBySelectionKey.set(
            group.selectionKey,
            groupFailures,
          );
          continue;
        }

        visit(next);
      }
    }
  }

  visit(start);

  return {
    best,
    evaluatedStates,
    failures,
    finalizeFailures,
    failuresBySelectionKey,
  };
}

function omissionReasonFromFailures(
  failures: ReadonlySet<OptimizerStepFailure>,
): OptionalDropReason {
  if (failures.size === 1 && failures.has("OUTSIDE_HORIZON")) {
    return "OUTSIDE_HORIZON";
  }

  if (failures.size === 1 && failures.has("NO_ROUTE")) {
    return "NO_ROUTE";
  }

  if (failures.size === 1 && failures.has("ANCHOR_CONFLICT")) {
    return "ANCHOR_CONFLICT";
  }

  return "INSUFFICIENT_TIME";
}

function diagnoseOmittedGroup(
  request: OptimizerRequest,
  mandatoryGroups: readonly OptimizerCandidateGroup[],
  group: OptimizerCandidateGroup,
) {
  const diagnosticGroups = [...mandatoryGroups, group].sort((a, b) =>
    compareText(a.selectionKey, b.selectionKey),
  );
  const required = new Set(
    diagnosticGroups.map((item) => item.selectionKey),
  );
  const outcome = search(request, diagnosticGroups, required);

  if (outcome.best) {
    return {
      reason: "LOWER_PRIORITY_ALTERNATIVE" as const,
      evaluatedStates: outcome.evaluatedStates,
    };
  }

  const groupFailures =
    outcome.failuresBySelectionKey.get(group.selectionKey);
  const diagnosticFailures =
    groupFailures && groupFailures.size > 0
      ? groupFailures
      : outcome.finalizeFailures.size > 0
        ? outcome.finalizeFailures
        : outcome.failures;

  return {
    reason: omissionReasonFromFailures(diagnosticFailures),
    evaluatedStates: outcome.evaluatedStates,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function assertValidOptimizerRequest(
  request: unknown,
): asserts request is OptimizerRequest {
  if (!isRecord(request)) {
    throw new Error("OptimizerRequest must be an object.");
  }

  assertCompiledRoutingGraph(request.graph);

  if (!isValidPlanningHorizon(request.horizon)) {
    throw new Error("OptimizerRequest horizon is invalid.");
  }

  if (!nonEmptyStableId(request.initialNodeId)) {
    throw new Error(
      "OptimizerRequest initialNodeId must be a stable non-empty ID.",
    );
  }

  if (!request.graph.hasNode(request.initialNodeId)) {
    throw new Error(
      `OptimizerRequest initial node ${request.initialNodeId} is unknown.`,
    );
  }

  if (
    request.endNodeId !== undefined &&
    !nonEmptyStableId(request.endNodeId)
  ) {
    throw new Error(
      "OptimizerRequest endNodeId must be a stable non-empty ID when provided.",
    );
  }

  if (
    request.endNodeId !== undefined &&
    !request.graph.hasNode(request.endNodeId)
  ) {
    throw new Error(
      `OptimizerRequest end node ${request.endNodeId} is unknown.`,
    );
  }

  if (!Array.isArray(request.candidates)) {
    throw new Error("OptimizerRequest candidates must be an array.");
  }

  assertValidScoreContext(request.scoreContext);
  assertValidRoutePolicy(request.routePolicy);
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
      index <= values.length - (size - selected.length);
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
) {
  let evaluatedStates = 0;

  for (let size = 1; size <= mandatoryGroups.length; size += 1) {
    const options: string[][] = [];

    for (const removedGroups of combinations(mandatoryGroups, size)) {
      const removedKeys = new Set(
        removedGroups.map((group) => group.selectionKey),
      );
      const remaining = mandatoryGroups.filter(
        (group) => !removedKeys.has(group.selectionKey),
      );
      const required = new Set(
        remaining.map((group) => group.selectionKey),
      );
      const outcome = search(request, remaining, required);
      evaluatedStates += outcome.evaluatedStates;

      if (outcome.best) {
        options.push(
          [...removedKeys].sort(compareText),
        );
      }
    }

    if (options.length > 0) {
      options.sort((a, b) =>
        compareText(JSON.stringify(a), JSON.stringify(b)),
      );
      return { options, evaluatedStates };
    }
  }

  return {
    options: [
      mandatoryGroups
        .map((group) => group.selectionKey)
        .sort(compareText),
    ],
    evaluatedStates,
  };
}


export function optimizeItinerary(
  request: OptimizerRequest,
): OptimizerResult {
  assertValidOptimizerRequest(request);

  const groups = buildOptimizerGroups(request.graph, request.candidates);

  if (request.candidates.length > MAX_EXHAUSTIVE_CANDIDATES) {
    return {
      status: "search-limit-exceeded",
      candidateCount: request.candidates.length,
      limit: MAX_EXHAUSTIVE_CANDIDATES,
    };
  }

  const baselineOutcome = search(
    request,
    [],
    new Set(),
  );

  if (!baselineOutcome.best) {
    return {
      status: "infeasible",
      reason: baselineOutcome.failures.has("NO_ROUTE")
        ? "END_NODE_UNREACHABLE"
        : "END_NODE_AFTER_HORIZON",
      evaluatedStates: baselineOutcome.evaluatedStates,
    };
  }

  const mandatoryGroups = groups.filter(
    (group) => group.authority !== "optional",
  );
  const mandatoryKeys = new Set(
    mandatoryGroups.map((group) => group.selectionKey),
  );

  const mandatoryOutcome = search(
    request,
    mandatoryGroups,
    mandatoryKeys,
  );

  if (!mandatoryOutcome.best) {
    const tradeoffs = findMinimalTradeoffOptions(
      request,
      mandatoryGroups,
    );

    return {
      status: "tradeoff-required",
      reason: "MANDATORY_SET_INFEASIBLE",
      mandatorySelectionKeys: [...mandatoryKeys].sort(compareText),
      tradeoffOptions: tradeoffs.options,
      evaluatedStates:
        baselineOutcome.evaluatedStates +
        mandatoryOutcome.evaluatedStates +
        tradeoffs.evaluatedStates,
    };
  }

  const fullOutcome = search(request, groups, mandatoryKeys);
  const best = fullOutcome.best ?? mandatoryOutcome.best;
  const selectedKeys = best.state.selectedKeys;
  const selectedCandidateIds = new Set(
    best.state.selectedCandidateIds,
  );
  const omissions: OptimizerOmission[] = [];
  const unselectedAlternativeCandidateIds: string[] = [];
  let diagnosticEvaluatedStates = 0;

  for (const group of groups) {
    if (selectedKeys.has(group.selectionKey)) {
      for (const candidate of group.candidates) {
        if (!selectedCandidateIds.has(candidate.id)) {
          unselectedAlternativeCandidateIds.push(candidate.id);
        }
      }
      continue;
    }

    if (group.authority !== "optional") {
      throw new Error(
        `Optimizer invariant violated: mandatory selectionKey ${group.selectionKey} was omitted.`,
      );
    }

    const diagnosis = diagnoseOmittedGroup(
      request,
      mandatoryGroups,
      group,
    );
    diagnosticEvaluatedStates += diagnosis.evaluatedStates;
    const representative = group.candidates[0];

    omissions.push({
      selectionKey: group.selectionKey,
      candidateIds: group.candidates.map((candidate) => candidate.id),
      reason: diagnosis.reason,
      decision: decideCandidateOmission(
        representative,
        diagnosis.reason,
      ),
    });
  }

  omissions.sort((a, b) =>
    compareText(a.selectionKey, b.selectionKey),
  );
  unselectedAlternativeCandidateIds.sort(compareText);

  return {
    status: "optimized",
    selectedCandidateIds: [...best.state.selectedCandidateIds],
    selectedSelectionKeys: [...selectedKeys].sort(compareText),
    steps: [...best.state.steps],
    utility: best.utility,
    finishMinute: best.finishMinute,
    remainingMinutes: best.remainingMinutes,
    totalTravelMinutes: best.totalTravelMinutes,
    totalTravelMeters: best.totalTravelMeters,
    exitRoute: best.exitRoute,
    omissions,
    unselectedAlternativeCandidateIds,
    evaluatedStates:
      baselineOutcome.evaluatedStates +
      mandatoryOutcome.evaluatedStates +
      fullOutcome.evaluatedStates +
      diagnosticEvaluatedStates,
  };
}
