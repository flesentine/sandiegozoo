import type {
  ConditionalEdgeRuntimeTrust,
} from "../planner/integration.ts";
import {
  INGRESS_ROUTE_EDGE_BINDINGS,
} from "./zooIngressRouteEdgeMaterialization.ts";

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
  evaluatedAt: string;
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
};

export type IngressRuntimeActivationResult = {
  visitDate: string;
  evaluatedAt: string;
  enabledConditionalEdgeIds:
    readonly string[];
  conditionalEdgeRuntimeTrust:
    ConditionalEdgeRuntimeTrust;
  decisions:
    readonly IngressRuntimeActivationDecision[];
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
  return (
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  );
}

function stableId(value: string) {
  return (
    value.trim().length > 0 &&
    value === value.trim()
  );
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
  if (!validTimestamp(snapshot.evaluatedAt)) {
    throw new Error(
      "Planner 24 evaluatedAt must be an ISO timestamp with timezone.",
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
  evaluatedAt: string,
) {
  const evaluated =
    Date.parse(evaluatedAt);
  return (
    evidence.validForDate === visitDate &&
    Date.parse(evidence.observedAt) <=
      evaluated &&
    evaluated <=
      Date.parse(evidence.expiresAt)
  );
}

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
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

  const hoursCurrent =
    evidenceCurrent(
      snapshot.zooHours,
      snapshot.visitDate,
      snapshot.evaluatedAt,
    );
  const closureCurrent =
    evidenceCurrent(
      snapshot.closureAdvisement,
      snapshot.visitDate,
      snapshot.evaluatedAt,
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

        if (
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
            snapshot.evaluatedAt,
          )
        ) {
          reason =
            "EDGE_AVAILABILITY_NOT_CURRENT";
        } else {
          reason = "ENABLED";
        }

        return {
          sourceWayId:
            binding.sourceWayId,
          routeEdgeId:
            binding.routeEdgeId,
          status:
            reason === "ENABLED"
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
    evaluatedAt:
      snapshot.evaluatedAt,
    enabledConditionalEdgeIds,
    conditionalEdgeRuntimeTrust: {
      authority:
        "qualified-runtime-conditional-edge-activation",
      visitDate: snapshot.visitDate,
      evaluatedAt:
        snapshot.evaluatedAt,
      edgeIds: [
        ...enabledConditionalEdgeIds,
      ],
    },
    decisions,
  });
}
