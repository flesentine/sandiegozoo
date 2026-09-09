import {
  INGRESS_ROUTE_EDGE_BINDINGS,
} from "./zooIngressRouteEdgeMaterialization.ts";
import type {
  OperationalActivationRequirement,
} from "./zooIngressOperationalStatusAuthority.ts";

export type RuntimeObservationFreshness =
  | "current"
  | "stale";

export type ZooHoursRuntimeObservation = {
  requirement:
    "VISIT_WITHIN_CURRENT_ZOO_HOURS";
  observedAt: string;
  freshness:
    RuntimeObservationFreshness;
  status:
    | "within-hours"
    | "outside-hours"
    | "unknown";
  sourceLabel: string;
};

export type IngressClosureRuntimeObservation = {
  requirement:
    "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT";
  observedAt: string;
  freshness:
    RuntimeObservationFreshness;
  status:
    | "clear"
    | "closure"
    | "unknown";
  sourceLabel: string;
};

export type ExactEdgeAvailabilityRuntimeObservation = {
  requirement:
    "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY";
  sourceWayId: string;
  observedAt: string;
  freshness:
    RuntimeObservationFreshness;
  status:
    | "available"
    | "unavailable"
    | "unknown";
  sourceLabel: string;
};

export type IngressRuntimeActivationInput = {
  zooHours?: ZooHoursRuntimeObservation;
  closureAdvisement?:
    IngressClosureRuntimeObservation;
  exactEdgeAvailability?:
    readonly ExactEdgeAvailabilityRuntimeObservation[];
};

export type RuntimeRequirementDecision = {
  requirement:
    OperationalActivationRequirement;
  status:
    | "satisfied"
    | "blocked";
  reason:
    | "SATISFIED"
    | "OBSERVATION_MISSING"
    | "OBSERVATION_STALE"
    | "OUTSIDE_ZOO_HOURS"
    | "HOURS_UNKNOWN"
    | "CLOSURE_ADVISED"
    | "CLOSURE_STATUS_UNKNOWN"
    | "EXACT_EDGE_UNAVAILABLE"
    | "EXACT_EDGE_AVAILABILITY_UNKNOWN";
  observedAt?: string;
  sourceLabel?: string;
};

export type IngressConditionalEdgeActivationDecision = {
  routeEdgeId: string;
  sourceWayId: string;
  status:
    | "enabled"
    | "blocked";
  requirements:
    readonly RuntimeRequirementDecision[];
};

export type IngressConditionalEdgeActivationResult = {
  enabledConditionalEdgeIds:
    readonly string[];
  decisions:
    readonly IngressConditionalEdgeActivationDecision[];
};

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

function validTimestamp(value: string) {
  return (
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  );
}

function validSourceLabel(
  value: string,
) {
  return value.trim().length > 0;
}

function observationMetadataValid(
  observation: {
    observedAt: string;
    sourceLabel: string;
  },
) {
  return (
    validTimestamp(observation.observedAt) &&
    validSourceLabel(
      observation.sourceLabel,
    )
  );
}

function hoursDecision(
  observation:
    | ZooHoursRuntimeObservation
    | undefined,
): RuntimeRequirementDecision {
  if (!observation) {
    return {
      requirement:
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
      status: "blocked",
      reason:
        "OBSERVATION_MISSING",
    };
  }

  if (
    observation.requirement !==
      "VISIT_WITHIN_CURRENT_ZOO_HOURS" ||
    !observationMetadataValid(
      observation,
    )
  ) {
    return {
      requirement:
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
      status: "blocked",
      reason:
        "HOURS_UNKNOWN",
    };
  }

  if (
    observation.freshness !==
      "current"
  ) {
    return {
      requirement:
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
      status: "blocked",
      reason:
        "OBSERVATION_STALE",
      observedAt:
        observation.observedAt,
      sourceLabel:
        observation.sourceLabel,
    };
  }

  if (
    observation.status ===
      "within-hours"
  ) {
    return {
      requirement:
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
      status: "satisfied",
      reason: "SATISFIED",
      observedAt:
        observation.observedAt,
      sourceLabel:
        observation.sourceLabel,
    };
  }

  return {
    requirement:
      "VISIT_WITHIN_CURRENT_ZOO_HOURS",
    status: "blocked",
    reason:
      observation.status ===
        "outside-hours"
        ? "OUTSIDE_ZOO_HOURS"
        : "HOURS_UNKNOWN",
    observedAt:
      observation.observedAt,
    sourceLabel:
      observation.sourceLabel,
  };
}

function closureDecision(
  observation:
    | IngressClosureRuntimeObservation
    | undefined,
): RuntimeRequirementDecision {
  if (!observation) {
    return {
      requirement:
        "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
      status: "blocked",
      reason:
        "OBSERVATION_MISSING",
    };
  }

  if (
    observation.requirement !==
      "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT" ||
    !observationMetadataValid(
      observation,
    )
  ) {
    return {
      requirement:
        "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
      status: "blocked",
      reason:
        "CLOSURE_STATUS_UNKNOWN",
    };
  }

  if (
    observation.freshness !==
      "current"
  ) {
    return {
      requirement:
        "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
      status: "blocked",
      reason:
        "OBSERVATION_STALE",
      observedAt:
        observation.observedAt,
      sourceLabel:
        observation.sourceLabel,
    };
  }

  if (
    observation.status === "clear"
  ) {
    return {
      requirement:
        "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
      status: "satisfied",
      reason: "SATISFIED",
      observedAt:
        observation.observedAt,
      sourceLabel:
        observation.sourceLabel,
    };
  }

  return {
    requirement:
      "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
    status: "blocked",
    reason:
      observation.status === "closure"
        ? "CLOSURE_ADVISED"
        : "CLOSURE_STATUS_UNKNOWN",
    observedAt:
      observation.observedAt,
    sourceLabel:
      observation.sourceLabel,
  };
}

function exactEdgeDecision(
  sourceWayId: string,
  observations:
    | readonly ExactEdgeAvailabilityRuntimeObservation[]
    | undefined,
): RuntimeRequirementDecision {
  const candidates =
    observations?.filter(
      (observation) =>
        observation.sourceWayId ===
        sourceWayId,
    ) ?? [];

  if (candidates.length === 0) {
    return {
      requirement:
        "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
      status: "blocked",
      reason:
        "OBSERVATION_MISSING",
    };
  }

  if (candidates.length !== 1) {
    return {
      requirement:
        "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
      status: "blocked",
      reason:
        "EXACT_EDGE_AVAILABILITY_UNKNOWN",
    };
  }

  const observation = candidates[0];

  if (
    observation.requirement !==
      "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY" ||
    !observationMetadataValid(
      observation,
    )
  ) {
    return {
      requirement:
        "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
      status: "blocked",
      reason:
        "EXACT_EDGE_AVAILABILITY_UNKNOWN",
    };
  }

  if (
    observation.freshness !==
      "current"
  ) {
    return {
      requirement:
        "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
      status: "blocked",
      reason:
        "OBSERVATION_STALE",
      observedAt:
        observation.observedAt,
      sourceLabel:
        observation.sourceLabel,
    };
  }

  if (
    observation.status ===
      "available"
  ) {
    return {
      requirement:
        "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
      status: "satisfied",
      reason: "SATISFIED",
      observedAt:
        observation.observedAt,
      sourceLabel:
        observation.sourceLabel,
    };
  }

  return {
    requirement:
      "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
    status: "blocked",
    reason:
      observation.status ===
        "unavailable"
        ? "EXACT_EDGE_UNAVAILABLE"
        : "EXACT_EDGE_AVAILABILITY_UNKNOWN",
    observedAt:
      observation.observedAt,
    sourceLabel:
      observation.sourceLabel,
  };
}

export function resolveIngressConditionalEdgeActivation(
  input:
    IngressRuntimeActivationInput,
): IngressConditionalEdgeActivationResult {
  const hours =
    hoursDecision(input.zooHours);
  const closure =
    closureDecision(
      input.closureAdvisement,
    );

  const decisions =
    INGRESS_ROUTE_EDGE_BINDINGS.map(
      (binding) => {
        const exactEdge =
          exactEdgeDecision(
            binding.sourceWayId,
            input.exactEdgeAvailability,
          );

        const requirements = [
          hours,
          closure,
          exactEdge,
        ] as const;

        const status =
          requirements.every(
            (requirement) =>
              requirement.status ===
              "satisfied",
          )
            ? "enabled"
            : "blocked";

        return {
          routeEdgeId:
            binding.routeEdgeId,
          sourceWayId:
            binding.sourceWayId,
          status,
          requirements,
        } satisfies IngressConditionalEdgeActivationDecision;
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
      );

  return deepFreeze({
    enabledConditionalEdgeIds,
    decisions,
  });
}

export function assertIngressConditionalEdgeActivationIntegrity(
  result:
    IngressConditionalEdgeActivationResult,
) {
  const expectedEdgeIds = new Set(
    INGRESS_ROUTE_EDGE_BINDINGS.map(
      (binding) =>
        binding.routeEdgeId,
    ),
  );
  const decisionEdgeIds = new Set(
    result.decisions.map(
      (decision) =>
        decision.routeEdgeId,
    ),
  );

  if (
    result.decisions.length !==
      INGRESS_ROUTE_EDGE_BINDINGS.length ||
    decisionEdgeIds.size !==
      result.decisions.length ||
    result.enabledConditionalEdgeIds.some(
      (edgeId) =>
        !expectedEdgeIds.has(edgeId),
    )
  ) {
    throw new Error(
      "Planner 24 activation result does not match current conditional ingress bindings.",
    );
  }

  for (
    const binding of
    INGRESS_ROUTE_EDGE_BINDINGS
  ) {
    const decision =
      result.decisions.find(
        (candidate) =>
          candidate.routeEdgeId ===
          binding.routeEdgeId,
      );

    if (
      !decision ||
      decision.sourceWayId !==
        binding.sourceWayId ||
      decision.requirements.length !==
        binding.operationalActivation
          .requirements.length ||
      JSON.stringify(
        decision.requirements.map(
          (requirement) =>
            requirement.requirement,
        ),
      ) !==
        JSON.stringify(
          binding.operationalActivation
            .requirements,
        )
    ) {
      throw new Error(
        `Planner 24 activation decision drifted for RouteEdge ${binding.routeEdgeId}.`,
      );
    }

    const allSatisfied =
      decision.requirements.every(
        (requirement) =>
          requirement.status ===
          "satisfied",
      );

    if (
      (decision.status === "enabled") !==
        allSatisfied ||
      result.enabledConditionalEdgeIds.includes(
        decision.routeEdgeId,
      ) !== allSatisfied
    ) {
      throw new Error(
        `Planner 24 activation decision is not fail-closed for RouteEdge ${binding.routeEdgeId}.`,
      );
    }
  }
}
