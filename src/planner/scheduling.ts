import type {
  ScheduleEvent,
  SourceProvenance,
  WildRouteDataPackage,
} from "./contracts";
import {
  findShortestRoute,
  type RouteRequest,
  type RouteResult,
  type RoutingGraph,
} from "./routing.ts";
import { assertValidWildRouteData } from "./validation.ts";

export type PlanningHorizon = {
  date: string;
  startMinute: number;
  endMinute: number;
  durationMinutes: number;
};

export type HorizonFailureReason =
  | "DATE_INVALID"
  | "ARRIVAL_TIME_INVALID"
  | "DEPARTURE_TIME_INVALID"
  | "NON_POSITIVE_HORIZON";

export type PlanningHorizonResult =
  | { status: "valid"; horizon: PlanningHorizon }
  | { status: "invalid"; reason: HorizonFailureReason };

export type DwellTarget = {
  id: string;
  nodeId: string;
  durationMinutes: number;
};

export type DwellTargetResult =
  | { status: "valid"; target: DwellTarget }
  | {
      status: "invalid";
      reason: "ID_REQUIRED" | "NODE_ID_REQUIRED" | "DURATION_INVALID";
    };

export type ScheduleAnchorKind = "locked" | "show";

export type ScheduleAnchor = {
  id: string;
  kind: ScheduleAnchorKind;
  title: string;
  nodeId: string;
  arrivalWindowStartMinute: number;
  arrivalWindowEndMinute: number;
  serviceStartMinute: number;
  serviceEndMinute: number;
};

export type LockedAnchorInput = {
  id: string;
  title: string;
  nodeId: string;
  startTime: string;
  durationMinutes: number;
};

export type LockedAnchorResult =
  | { status: "valid"; anchor: ScheduleAnchor }
  | {
      status: "invalid";
      reason:
        | "ID_REQUIRED"
        | "TITLE_REQUIRED"
        | "NODE_ID_REQUIRED"
        | "START_TIME_INVALID"
        | "DURATION_INVALID"
        | "END_AFTER_DAY";
    };

export type ShowCandidate = ScheduleAnchor & {
  kind: "show";
  eventId: string;
  activityId: string;
  recommendedArrivalMinute: number;
  provenance: SourceProvenance;
};

export type ShowCandidateSet = {
  activityId: string;
  title: string;
  candidates: ShowCandidate[];
};

export type ShowCandidateIssue = {
  code: "SHOW_DURATION_REQUIRED";
  eventId: string;
  activityId: string;
  message: string;
};

export type ShowCandidateBuild = {
  sets: ShowCandidateSet[];
  issues: ShowCandidateIssue[];
};

export type RoutePolicy = Omit<
  RouteRequest,
  "fromNodeId" | "toNodeId" | "optimize"
>;

export type AnchorScheduleStep = {
  anchorId: string;
  anchorKind: ScheduleAnchorKind;
  nodeId: string;
  departMinute: number;
  travelDurationMinutes: number;
  travelDistanceMeters: number;
  rawArrivalMinute: number;
  plannedArrivalMinute: number;
  waitForArrivalWindowMinutes: number;
  waitForServiceMinutes: number;
  serviceStartMinute: number;
  serviceEndMinute: number;
  route: Extract<RouteResult, { status: "found" }>;
};

export type AnchorFeasibilityFailureReason =
  | "HORIZON_INVALID"
  | "START_NODE_UNKNOWN"
  | "DUPLICATE_ANCHOR_ID"
  | "ANCHOR_INVALID"
  | "ANCHOR_OUTSIDE_HORIZON"
  | "ANCHOR_ORDER_CONFLICT"
  | "NO_ROUTE_TO_ANCHOR"
  | "ARRIVAL_WINDOW_MISSED";

export type AnchorSequenceResult =
  | {
      status: "feasible";
      horizon: PlanningHorizon;
      steps: AnchorScheduleStep[];
      finishMinute: number;
      remainingMinutes: number;
      totalTravelMinutes: number;
      totalTravelMeters: number;
    }
  | {
      status: "infeasible";
      horizon: PlanningHorizon;
      reason: AnchorFeasibilityFailureReason;
      anchorId?: string;
      routeReason?: Extract<RouteResult, { status: "not-found" }>["reason"];
    };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const COST_PRECISION = 1_000_000_000;

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function normalizedCost(value: number) {
  return Math.round(value * COST_PRECISION) / COST_PRECISION;
}

function addCost(a: number, b: number) {
  return normalizedCost(a + b);
}

function validDate(value: string) {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function nonEmpty(value: string) {
  return value.trim().length > 0;
}

export function parseClockMinute(value: string): number | null {
  if (!TIME_RE.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function createPlanningHorizon(
  date: string,
  arrivalTime: string,
  departureTime: string,
): PlanningHorizonResult {
  if (!validDate(date)) {
    return { status: "invalid", reason: "DATE_INVALID" };
  }

  const startMinute = parseClockMinute(arrivalTime);
  if (startMinute === null) {
    return { status: "invalid", reason: "ARRIVAL_TIME_INVALID" };
  }

  const endMinute = parseClockMinute(departureTime);
  if (endMinute === null) {
    return { status: "invalid", reason: "DEPARTURE_TIME_INVALID" };
  }

  if (endMinute <= startMinute) {
    return { status: "invalid", reason: "NON_POSITIVE_HORIZON" };
  }

  return {
    status: "valid",
    horizon: {
      date,
      startMinute,
      endMinute,
      durationMinutes: endMinute - startMinute,
    },
  };
}

export function createDwellTarget(
  id: string,
  nodeId: string,
  durationMinutes: number,
): DwellTargetResult {
  if (!nonEmpty(id)) {
    return { status: "invalid", reason: "ID_REQUIRED" };
  }

  if (!nonEmpty(nodeId)) {
    return { status: "invalid", reason: "NODE_ID_REQUIRED" };
  }

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    durationMinutes > 24 * 60
  ) {
    return { status: "invalid", reason: "DURATION_INVALID" };
  }

  return {
    status: "valid",
    target: {
      id,
      nodeId,
      durationMinutes,
    },
  };
}

export function createLockedAnchor(
  input: LockedAnchorInput,
): LockedAnchorResult {
  if (!nonEmpty(input.id)) {
    return { status: "invalid", reason: "ID_REQUIRED" };
  }

  if (!nonEmpty(input.title)) {
    return { status: "invalid", reason: "TITLE_REQUIRED" };
  }

  if (!nonEmpty(input.nodeId)) {
    return { status: "invalid", reason: "NODE_ID_REQUIRED" };
  }

  const startMinute = parseClockMinute(input.startTime);
  if (startMinute === null) {
    return { status: "invalid", reason: "START_TIME_INVALID" };
  }

  if (
    !Number.isInteger(input.durationMinutes) ||
    input.durationMinutes <= 0 ||
    input.durationMinutes > 24 * 60
  ) {
    return { status: "invalid", reason: "DURATION_INVALID" };
  }

  const serviceEndMinute = startMinute + input.durationMinutes;
  if (serviceEndMinute > 24 * 60) {
    return { status: "invalid", reason: "END_AFTER_DAY" };
  }

  return {
    status: "valid",
    anchor: {
      id: input.id,
      kind: "locked",
      title: input.title,
      nodeId: input.nodeId,
      arrivalWindowStartMinute: startMinute,
      arrivalWindowEndMinute: startMinute,
      serviceStartMinute: startMinute,
      serviceEndMinute,
    },
  };
}

function eventServiceEndMinute(
  event: ScheduleEvent,
  startMinute: number,
  dwellByActivityId: Readonly<Record<string, number>>,
) {
  if (event.endTime) {
    return parseClockMinute(event.endTime);
  }

  const dwell = dwellByActivityId[event.activityId];
  if (!Number.isInteger(dwell) || dwell <= 0) {
    return null;
  }

  const end = startMinute + dwell;
  return end <= 24 * 60 ? end : null;
}

export function buildShowCandidateSets(
  value: unknown,
  date: string,
  dwellByActivityId: Readonly<Record<string, number>> = {},
): ShowCandidateBuild {
  assertValidWildRouteData(value);
  const data: WildRouteDataPackage = value;

  const placeNodeById = new Map(
    data.places.map((place) => [place.id, place.routeNodeId]),
  );
  const groups = new Map<string, ShowCandidateSet>();
  const issues: ShowCandidateIssue[] = [];

  const events = data.scheduleEvents
    .filter((event) => event.date === date)
    .slice()
    .sort((a, b) => {
      const time = compareText(a.startTime, b.startTime);
      return time !== 0 ? time : compareText(a.id, b.id);
    });

  for (const event of events) {
    const startMinute = parseClockMinute(event.startTime)!;
    const serviceEndMinute = eventServiceEndMinute(
      event,
      startMinute,
      dwellByActivityId,
    );

    if (serviceEndMinute === null) {
      issues.push({
        code: "SHOW_DURATION_REQUIRED",
        eventId: event.id,
        activityId: event.activityId,
        message:
          "A show performance needs an endTime or a positive dwell duration before it can be scheduled.",
      });
      continue;
    }

    const candidate: ShowCandidate = {
      id: `show:${event.id}`,
      kind: "show",
      title: event.title,
      nodeId: placeNodeById.get(event.placeId)!,
      eventId: event.id,
      activityId: event.activityId,
      recommendedArrivalMinute:
        startMinute - event.recommendedArrivalMinutes,
      arrivalWindowStartMinute:
        startMinute - event.recommendedArrivalMinutes,
      arrivalWindowEndMinute: startMinute,
      serviceStartMinute: startMinute,
      serviceEndMinute,
      provenance: { ...event.provenance },
    };

    const group = groups.get(event.activityId);
    if (group) {
      group.candidates.push(candidate);
    } else {
      groups.set(event.activityId, {
        activityId: event.activityId,
        title: event.title,
        candidates: [candidate],
      });
    }
  }

  const sets = [...groups.values()]
    .sort((a, b) => compareText(a.activityId, b.activityId))
    .map((set) => ({
      ...set,
      candidates: set.candidates.slice().sort((a, b) => {
        if (a.serviceStartMinute !== b.serviceStartMinute) {
          return a.serviceStartMinute - b.serviceStartMinute;
        }
        return compareText(a.eventId, b.eventId);
      }),
    }));

  issues.sort((a, b) => compareText(a.eventId, b.eventId));

  return { sets, issues };
}

function horizonStructureValid(horizon: PlanningHorizon) {
  return (
    validDate(horizon.date) &&
    Number.isInteger(horizon.startMinute) &&
    Number.isInteger(horizon.endMinute) &&
    Number.isInteger(horizon.durationMinutes) &&
    horizon.startMinute >= 0 &&
    horizon.endMinute <= 23 * 60 + 59 &&
    horizon.endMinute > horizon.startMinute &&
    horizon.durationMinutes === horizon.endMinute - horizon.startMinute
  );
}

function anchorStructureValid(anchor: ScheduleAnchor) {
  return (
    nonEmpty(anchor.id) &&
    nonEmpty(anchor.title) &&
    nonEmpty(anchor.nodeId) &&
    Number.isFinite(anchor.arrivalWindowStartMinute) &&
    Number.isFinite(anchor.arrivalWindowEndMinute) &&
    Number.isFinite(anchor.serviceStartMinute) &&
    Number.isFinite(anchor.serviceEndMinute) &&
    anchor.arrivalWindowStartMinute >= 0 &&
    anchor.arrivalWindowStartMinute <= anchor.arrivalWindowEndMinute &&
    anchor.arrivalWindowEndMinute <= anchor.serviceStartMinute &&
    anchor.serviceStartMinute < anchor.serviceEndMinute &&
    anchor.serviceEndMinute <= 24 * 60
  );
}

export function evaluateAnchorSequence(
  graph: RoutingGraph,
  horizon: PlanningHorizon,
  initialNodeId: string,
  anchors: readonly ScheduleAnchor[],
  routePolicy: RoutePolicy = {},
): AnchorSequenceResult {
  if (!horizonStructureValid(horizon)) {
    return {
      status: "infeasible",
      horizon: { ...horizon },
      reason: "HORIZON_INVALID",
    };
  }

  if (!graph.hasNode(initialNodeId)) {
    return {
      status: "infeasible",
      horizon,
      reason: "START_NODE_UNKNOWN",
    };
  }

  const seen = new Set<string>();
  let previousServiceEnd: number | null = null;

  for (const anchor of anchors) {
    if (seen.has(anchor.id)) {
      return {
        status: "infeasible",
        horizon,
        reason: "DUPLICATE_ANCHOR_ID",
        anchorId: anchor.id,
      };
    }
    seen.add(anchor.id);

    if (!anchorStructureValid(anchor)) {
      return {
        status: "infeasible",
        horizon,
        reason: "ANCHOR_INVALID",
        anchorId: anchor.id,
      };
    }

    if (
      anchor.serviceStartMinute < horizon.startMinute ||
      anchor.serviceEndMinute > horizon.endMinute
    ) {
      return {
        status: "infeasible",
        horizon,
        reason: "ANCHOR_OUTSIDE_HORIZON",
        anchorId: anchor.id,
      };
    }

    if (
      previousServiceEnd !== null &&
      anchor.serviceStartMinute < previousServiceEnd
    ) {
      return {
        status: "infeasible",
        horizon,
        reason: "ANCHOR_ORDER_CONFLICT",
        anchorId: anchor.id,
      };
    }

    previousServiceEnd = anchor.serviceEndMinute;
  }

  const steps: AnchorScheduleStep[] = [];
  let currentNodeId = initialNodeId;
  let currentMinute = horizon.startMinute;
  let totalTravelMinutes = 0;
  let totalTravelMeters = 0;

  for (const anchor of anchors) {
    const route = findShortestRoute(graph, {
      ...routePolicy,
      optimize: "duration",
      fromNodeId: currentNodeId,
      toNodeId: anchor.nodeId,
    });

    if (route.status === "not-found") {
      return {
        status: "infeasible",
        horizon,
        reason: "NO_ROUTE_TO_ANCHOR",
        anchorId: anchor.id,
        routeReason: route.reason,
      };
    }

    const rawArrivalMinute = addCost(
      currentMinute,
      route.durationMinutes,
    );

    if (rawArrivalMinute > anchor.arrivalWindowEndMinute) {
      return {
        status: "infeasible",
        horizon,
        reason: "ARRIVAL_WINDOW_MISSED",
        anchorId: anchor.id,
      };
    }

    const plannedArrivalMinute = Math.max(
      rawArrivalMinute,
      anchor.arrivalWindowStartMinute,
    );
    const waitForArrivalWindowMinutes = normalizedCost(
      plannedArrivalMinute - rawArrivalMinute,
    );
    const waitForServiceMinutes = normalizedCost(
      anchor.serviceStartMinute - plannedArrivalMinute,
    );

    steps.push({
      anchorId: anchor.id,
      anchorKind: anchor.kind,
      nodeId: anchor.nodeId,
      departMinute: currentMinute,
      travelDurationMinutes: route.durationMinutes,
      travelDistanceMeters: route.distanceMeters,
      rawArrivalMinute,
      plannedArrivalMinute,
      waitForArrivalWindowMinutes,
      waitForServiceMinutes,
      serviceStartMinute: anchor.serviceStartMinute,
      serviceEndMinute: anchor.serviceEndMinute,
      route,
    });

    totalTravelMinutes = addCost(
      totalTravelMinutes,
      route.durationMinutes,
    );
    totalTravelMeters = addCost(
      totalTravelMeters,
      route.distanceMeters,
    );
    currentNodeId = anchor.nodeId;
    currentMinute = anchor.serviceEndMinute;
  }

  return {
    status: "feasible",
    horizon,
    steps,
    finishMinute: currentMinute,
    remainingMinutes: normalizedCost(horizon.endMinute - currentMinute),
    totalTravelMinutes,
    totalTravelMeters,
  };
}
