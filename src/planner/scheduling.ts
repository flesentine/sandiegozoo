import type {
  RouteMode,
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

const ROUTE_POLICY_MODES: readonly RouteMode[] = [
  "walk",
  "skyfari",
  "bus",
  "elevator",
  "ada-shuttle",
];

const ROUTE_POLICY_KEYS = new Set([
  "allowedModes",
  "requireAccessible",
  "requireStroller",
  "enabledConditionalEdgeIds",
]);

export function assertValidRoutePolicy(
  value: unknown,
): asserts value is RoutePolicy | undefined {
  if (value === undefined) return;

  if (!isRecord(value)) {
    throw new Error("RoutePolicy must be an object when provided.");
  }

  for (const key of Object.keys(value)) {
    if (!ROUTE_POLICY_KEYS.has(key)) {
      throw new Error(`RoutePolicy contains unsupported field: ${key}`);
    }
  }

  if (value.allowedModes !== undefined) {
    if (!Array.isArray(value.allowedModes)) {
      throw new Error("RoutePolicy allowedModes must be an array.");
    }

    const seen = new Set<RouteMode>();
    for (const mode of value.allowedModes) {
      if (
        typeof mode !== "string" ||
        !ROUTE_POLICY_MODES.includes(mode as RouteMode)
      ) {
        throw new Error("RoutePolicy allowedModes contains an invalid mode.");
      }

      if (seen.has(mode as RouteMode)) {
        throw new Error("RoutePolicy allowedModes cannot contain duplicates.");
      }
      seen.add(mode as RouteMode);
    }
  }

  for (const key of ["requireAccessible", "requireStroller"] as const) {
    if (value[key] !== undefined && typeof value[key] !== "boolean") {
      throw new Error(`RoutePolicy ${key} must be boolean.`);
    }
  }

  if (value.enabledConditionalEdgeIds !== undefined) {
    if (!Array.isArray(value.enabledConditionalEdgeIds)) {
      throw new Error(
        "RoutePolicy enabledConditionalEdgeIds must be an array.",
      );
    }

    const seen = new Set<string>();
    for (const edgeId of value.enabledConditionalEdgeIds) {
      if (
        typeof edgeId !== "string" ||
        edgeId.trim().length === 0 ||
        edgeId !== edgeId.trim()
      ) {
        throw new Error(
          "RoutePolicy conditional edge IDs must be stable non-empty strings.",
        );
      }

      if (seen.has(edgeId)) {
        throw new Error(
          "RoutePolicy enabledConditionalEdgeIds cannot contain duplicates.",
        );
      }
      seen.add(edgeId);
    }
  }
}

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

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseClockMinute(value: unknown): number | null {
  if (typeof value !== "string" || !TIME_RE.test(value)) return null;
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

export function isValidPlanningHorizon(
  horizon: unknown,
): boolean {
  if (!isRecord(horizon)) return false;

  const startMinute = horizon.startMinute;
  const endMinute = horizon.endMinute;
  const durationMinutes = horizon.durationMinutes;

  return (
    validDate(horizon.date) &&
    typeof startMinute === "number" &&
    Number.isInteger(startMinute) &&
    typeof endMinute === "number" &&
    Number.isInteger(endMinute) &&
    typeof durationMinutes === "number" &&
    Number.isInteger(durationMinutes) &&
    startMinute >= 0 &&
    endMinute <= 23 * 60 + 59 &&
    endMinute > startMinute &&
    durationMinutes === endMinute - startMinute
  );
}

export function isValidScheduleAnchor(
  anchor: unknown,
): boolean {
  if (!isRecord(anchor)) return false;

  const arrivalWindowStartMinute = anchor.arrivalWindowStartMinute;
  const arrivalWindowEndMinute = anchor.arrivalWindowEndMinute;
  const serviceStartMinute = anchor.serviceStartMinute;
  const serviceEndMinute = anchor.serviceEndMinute;

  return (
    nonEmpty(anchor.id) &&
    (anchor.kind === "locked" || anchor.kind === "show") &&
    nonEmpty(anchor.title) &&
    nonEmpty(anchor.nodeId) &&
    typeof arrivalWindowStartMinute === "number" &&
    Number.isInteger(arrivalWindowStartMinute) &&
    typeof arrivalWindowEndMinute === "number" &&
    Number.isInteger(arrivalWindowEndMinute) &&
    typeof serviceStartMinute === "number" &&
    Number.isInteger(serviceStartMinute) &&
    typeof serviceEndMinute === "number" &&
    Number.isInteger(serviceEndMinute) &&
    arrivalWindowStartMinute >= 0 &&
    arrivalWindowStartMinute <= arrivalWindowEndMinute &&
    arrivalWindowEndMinute <= serviceStartMinute &&
    serviceStartMinute < serviceEndMinute &&
    serviceEndMinute <= 24 * 60
  );
}

export function evaluateAnchorSequence(
  graph: RoutingGraph,
  horizon: PlanningHorizon,
  initialNodeId: string,
  anchors: readonly ScheduleAnchor[],
  routePolicy: RoutePolicy = {},
): AnchorSequenceResult {
  assertValidRoutePolicy(routePolicy);

  if (!isValidPlanningHorizon(horizon)) {
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

    if (!isValidScheduleAnchor(anchor)) {
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
