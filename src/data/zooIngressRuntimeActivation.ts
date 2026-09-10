import {
  INGRESS_ROUTE_EDGE_BINDINGS,
  INGRESS_ROUTE_GRAPH_DATA,
} from "./zooIngressRouteEdgeMaterialization.ts";
import {
  buildRoutingGraph,
  findShortestRoute,
  type RouteRequest,
  type RouteResult,
} from "../planner/routing.ts";

export const SAN_DIEGO_ZOO_TIME_ZONE =
  "America/Los_Angeles" as const;

export type RuntimeEvidenceStatus =
  | "inside"
  | "outside"
  | "unknown";

export type ClosureEvidenceStatus =
  | "clear"
  | "blocked"
  | "unknown";

export type ExactEdgeAvailabilityStatus =
  | "available"
  | "unavailable"
  | "unknown";

export type TimedRuntimeEvidence<
  TStatus extends string,
> = {
  evidenceId: string;
  status: TStatus;
  validForDate: string;
  observedAt: string;
  expiresAt: string;
};

export type ExactEdgeAvailabilityEvidence =
  TimedRuntimeEvidence<
    ExactEdgeAvailabilityStatus
  > & {
    sourceWayId: string;
  };

export type IngressRuntimeOperationalSnapshot = {
  visitDate: string;
  zooHours: TimedRuntimeEvidence<
    RuntimeEvidenceStatus
  >;
  closureAdvisement: TimedRuntimeEvidence<
    ClosureEvidenceStatus
  >;
  exactEdgeAvailability:
    readonly ExactEdgeAvailabilityEvidence[];
};

export type IngressRuntimeActivationReason =
  | "ENABLED"
  | "VISIT_DATE_NOT_CURRENT_ZOO_DATE"
  | "HOURS_NOT_CONFIRMED"
  | "HOURS_EVIDENCE_NOT_CURRENT"
  | "CLOSURE_CLEARANCE_NOT_CONFIRMED"
  | "CLOSURE_EVIDENCE_NOT_CURRENT"
  | "EDGE_AVAILABILITY_MISSING"
  | "EDGE_AVAILABILITY_NOT_CONFIRMED"
  | "EDGE_AVAILABILITY_NOT_CURRENT";

export type IngressRuntimeActivationDecision = {
  sourceWayId: string;
  routeEdgeId: string;
  status: "enabled" | "disabled";
  reason: IngressRuntimeActivationReason;
  evidenceIds: readonly string[];
  effectiveExpiresAt?: string;
};

export type IngressRuntimeActivationResult = {
  visitDate: string;
  evaluatedAt: string;
  enabledConditionalEdgeIds:
    readonly string[];
  decisions:
    readonly IngressRuntimeActivationDecision[];
};

export type IngressRuntimeRouteRequest =
  Omit<
    RouteRequest,
    "enabledConditionalEdgeIds"
  >;

export type IngressRuntimeRouteResult = {
  activation:
    IngressRuntimeActivationResult;
  route: RouteResult;
};

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(
    `${value}T00:00:00Z`,
  );
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) ===
      value
  );
}

function validTimestamp(value: string) {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(
      value,
    );
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour =
    match[10] === undefined
      ? 0
      : Number(match[10]);
  const offsetMinute =
    match[11] === undefined
      ? 0
      : Number(match[11]);

  if (
    month < 1 ||
    month > 12 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59 ||
    offsetHour < 0 ||
    offsetHour > 14 ||
    offsetMinute < 0 ||
    offsetMinute > 59 ||
    (offsetHour === 14 &&
      offsetMinute !== 0)
  ) {
    return false;
  }

  const leapYear =
    year % 4 === 0 &&
    (year % 100 !== 0 ||
      year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];

  if (
    day < 1 ||
    day > daysInMonth
  ) {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

function stableId(value: string) {
  return (
    value.trim().length > 0 &&
    value === value.trim()
  );
}

export function zooOperationalDateAt(
  nowMs: number,
) {
  if (!Number.isFinite(nowMs)) {
    throw new Error(
      "Planner 24 Zoo operational date requires a finite timestamp.",
    );
  }

  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone:
        SAN_DIEGO_ZOO_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(new Date(nowMs));

  const values = new Map(
    parts.map((part) => [
      part.type,
      part.value,
    ]),
  );
  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");

  if (!year || !month || !day) {
    throw new Error(
      "Planner 24 could not resolve the San Diego Zoo local calendar date.",
    );
  }

  return `${year}-${month}-${day}`;
}

function assertTimedEvidence(
  label: string,
  evidence: TimedRuntimeEvidence<string>,
) {
  if (!stableId(evidence.evidenceId)) {
    throw new Error(
      `${label} evidenceId must be a stable non-empty string.`,
    );
  }
  if (!validDate(evidence.validForDate)) {
    throw new Error(
      `${label} validForDate must be a real YYYY-MM-DD date.`,
    );
  }
  if (
    !validTimestamp(evidence.observedAt) ||
    !validTimestamp(evidence.expiresAt)
  ) {
    throw new Error(
      `${label} observedAt/expiresAt must be ISO timestamps with timezone.`,
    );
  }
  if (
    Date.parse(evidence.expiresAt) <=
    Date.parse(evidence.observedAt)
  ) {
    throw new Error(
      `${label} expiresAt must be later than observedAt.`,
    );
  }
}

function assertSnapshot(
  snapshot: IngressRuntimeOperationalSnapshot,
) {
  if (!validDate(snapshot.visitDate)) {
    throw new Error(
      "Planner 24 visitDate must be a real YYYY-MM-DD date.",
    );
  }

  if (
    !["inside", "outside", "unknown"].includes(
      snapshot.zooHours.status,
    )
  ) {
    throw new Error(
      "Planner 24 Zoo-hours status is invalid.",
    );
  }
  if (
    !["clear", "blocked", "unknown"].includes(
      snapshot.closureAdvisement.status,
    )
  ) {
    throw new Error(
      "Planner 24 closure-advisement status is invalid.",
    );
  }

  assertTimedEvidence(
    "Planner 24 Zoo-hours",
    snapshot.zooHours,
  );
  assertTimedEvidence(
    "Planner 24 closure-advisement",
    snapshot.closureAdvisement,
  );

  const knownSourceWayIds = new Set(
    INGRESS_ROUTE_EDGE_BINDINGS.map(
      (binding) => binding.sourceWayId,
    ),
  );
  const seen = new Set<string>();

  for (
    const evidence of
    snapshot.exactEdgeAvailability
  ) {
    if (!stableId(evidence.sourceWayId)) {
      throw new Error(
        "Planner 24 exact-edge sourceWayId must be stable and non-empty.",
      );
    }
    if (
      !knownSourceWayIds.has(
        evidence.sourceWayId,
      )
    ) {
      throw new Error(
        `Planner 24 exact-edge evidence references unknown ingress way ${evidence.sourceWayId}.`,
      );
    }
    if (seen.has(evidence.sourceWayId)) {
      throw new Error(
        `Planner 24 exact-edge evidence duplicates ingress way ${evidence.sourceWayId}.`,
      );
    }
    if (
      ![
        "available",
        "unavailable",
        "unknown",
      ].includes(evidence.status)
    ) {
      throw new Error(
        "Planner 24 exact-edge availability status is invalid.",
      );
    }

    assertTimedEvidence(
      `Planner 24 exact-edge ${evidence.sourceWayId}`,
      evidence,
    );
    seen.add(evidence.sourceWayId);
  }
}

function evidenceCurrent(
  evidence: TimedRuntimeEvidence<string>,
  visitDate: string,
  nowMs: number,
) {
  return (
    evidence.validForDate === visitDate &&
    Date.parse(evidence.observedAt) <=
      nowMs &&
    nowMs <=
      Date.parse(evidence.expiresAt)
  );
}

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function earliestExpiry(
  evidence:
    readonly TimedRuntimeEvidence<string>[],
) {
  return evidence
    .map((item) => item.expiresAt)
    .sort(
      (a, b) =>
        Date.parse(a) - Date.parse(b),
    )[0];
}

function deepFreeze<T>(value: T): T {
  if (
    value &&
    typeof value === "object" &&
    !Object.isFrozen(value)
  ) {
    for (const child of Object.values(
      value as Record<string, unknown>,
    )) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

export function resolveIngressRuntimeActivation(
  snapshot: IngressRuntimeOperationalSnapshot,
): IngressRuntimeActivationResult {
  assertSnapshot(snapshot);

  // Planner 24 owns both the live instant and the
  // San Diego Zoo operational calendar date.
  // Callers cannot replay an older evaluatedAt or
  // relabel current evidence as a different day.
  const nowMs = Date.now();
  const evaluatedAt =
    new Date(nowMs).toISOString();
  const currentZooDate =
    zooOperationalDateAt(nowMs);
  const visitDateCurrent =
    snapshot.visitDate ===
    currentZooDate;

  const hoursCurrent =
    evidenceCurrent(
      snapshot.zooHours,
      snapshot.visitDate,
      nowMs,
    );
  const closureCurrent =
    evidenceCurrent(
      snapshot.closureAdvisement,
      snapshot.visitDate,
      nowMs,
    );

  const availabilityByWay =
    new Map(
      snapshot.exactEdgeAvailability.map(
        (evidence) => [
          evidence.sourceWayId,
          evidence,
        ],
      ),
    );

  const decisions =
    INGRESS_ROUTE_EDGE_BINDINGS.map(
      (
        binding,
      ): IngressRuntimeActivationDecision => {
        const edgeEvidence =
          availabilityByWay.get(
            binding.sourceWayId,
          );

        let reason:
          IngressRuntimeActivationReason;

        if (!visitDateCurrent) {
          reason =
            "VISIT_DATE_NOT_CURRENT_ZOO_DATE";
        } else if (
          snapshot.zooHours.status !==
            "inside"
        ) {
          reason =
            "HOURS_NOT_CONFIRMED";
        } else if (!hoursCurrent) {
          reason =
            "HOURS_EVIDENCE_NOT_CURRENT";
        } else if (
          snapshot.closureAdvisement
            .status !== "clear"
        ) {
          reason =
            "CLOSURE_CLEARANCE_NOT_CONFIRMED";
        } else if (!closureCurrent) {
          reason =
            "CLOSURE_EVIDENCE_NOT_CURRENT";
        } else if (!edgeEvidence) {
          reason =
            "EDGE_AVAILABILITY_MISSING";
        } else if (
          edgeEvidence.status !==
            "available"
        ) {
          reason =
            "EDGE_AVAILABILITY_NOT_CONFIRMED";
        } else if (
          !evidenceCurrent(
            edgeEvidence,
            snapshot.visitDate,
            nowMs,
          )
        ) {
          reason =
            "EDGE_AVAILABILITY_NOT_CURRENT";
        } else {
          reason = "ENABLED";
        }

        const enabled =
          reason === "ENABLED";

        return {
          sourceWayId:
            binding.sourceWayId,
          routeEdgeId:
            binding.routeEdgeId,
          status:
            enabled
              ? "enabled"
              : "disabled",
          reason,
          evidenceIds: [
            snapshot.zooHours.evidenceId,
            snapshot.closureAdvisement
              .evidenceId,
            ...(edgeEvidence
              ? [edgeEvidence.evidenceId]
              : []),
          ],
          ...(enabled && edgeEvidence
            ? {
                effectiveExpiresAt:
                  earliestExpiry([
                    snapshot.zooHours,
                    snapshot.closureAdvisement,
                    edgeEvidence,
                  ]),
              }
            : {}),
        };
      },
    );

  const enabledConditionalEdgeIds =
    decisions
      .filter(
        (decision) =>
          decision.status ===
          "enabled",
      )
      .map(
        (decision) =>
          decision.routeEdgeId,
      )
      .sort(compareText);

  return deepFreeze({
    visitDate: snapshot.visitDate,
    evaluatedAt,
    enabledConditionalEdgeIds,
    decisions,
  });
}

export function routeIngressWithRuntimeEvidence(
  snapshot: IngressRuntimeOperationalSnapshot,
  request: IngressRuntimeRouteRequest,
): IngressRuntimeRouteResult {
  // Evidence is re-evaluated here, immediately
  // before routing, against Date.now() and the
  // America/Los_Angeles operational date.
  const activation =
    resolveIngressRuntimeActivation(
      snapshot,
    );
  const graph = buildRoutingGraph(
    INGRESS_ROUTE_GRAPH_DATA,
  );
  const route = findShortestRoute(
    graph,
    {
      ...request,
      enabledConditionalEdgeIds:
        activation
          .enabledConditionalEdgeIds,
    },
  );

  return deepFreeze({
    activation,
    route,
  });
}
