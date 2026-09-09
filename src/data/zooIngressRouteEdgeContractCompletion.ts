import {
  INGRESS_GEOMETRY_WAYS,
} from "./zooIngressDistanceAuthority.ts";
import {
  assessIngressMobilityAuthority,
} from "./zooIngressMobilityAuthority.ts";
import {
  assessIngressTerrainAuthority,
} from "./zooIngressTerrainAuthority.ts";

export type IngressUnknownDifficultyAuthority = {
  status: "supported";
  value: "unknown";
  basis:
    "Planner 22 explicit unknown semantics over unresolved Planner 18 difficulty authority";
  unresolvedReason:
    | "EXACT_EDGE_DIFFICULTY_NOT_SOURCED"
    | "CORRIDOR_TERRAIN_NOT_EXACT_EDGE_AUTHORITY";
  sourceSnapshotId: string;
  corridorTerrainEvidenceId?: string;
};

export type IngressUnknownStairsAuthority = {
  status: "supported";
  value: "unknown";
  basis:
    "Planner 22 explicit unknown semantics over unresolved Planner 18 stairs authority";
  unresolvedReason:
    "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED";
  sourceSnapshotId: string;
  corridorTerrainEvidenceId?: string;
};

export type IngressUnknownAccessibilityAuthority = {
  status: "supported";
  value: "unknown";
  basis:
    "Planner 22 explicit unknown semantics over unresolved Planner 17 accessibility authority";
  unresolvedReason:
    | "EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED"
    | "CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY";
  corridorEvidenceId?: string;
};

export type IngressUnknownStrollerAuthority = {
  status: "supported";
  value: "unknown";
  basis:
    "Planner 22 explicit unknown semantics over unresolved Planner 17 stroller authority";
  unresolvedReason:
    "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY";
  policyEvidenceId: string;
};

export type IngressRouteEdgeContractCompletion = {
  sourceWayId: string;
  difficultyAuthority:
    IngressUnknownDifficultyAuthority;
  stairsAuthority:
    IngressUnknownStairsAuthority;
  accessibleAuthority:
    IngressUnknownAccessibilityAuthority;
  strollerAuthority:
    IngressUnknownStrollerAuthority;
  plannerMaterialization:
    "explicit-unknown-route-edge-semantics";
};

export type UnknownIngressRouteEdgeContractCompletion = {
  sourceWayId: string;
  status: "blocked";
  reason: "SOURCE_WAY_UNKNOWN";
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

export function completeIngressRouteEdgeUnknownSemantics(
  sourceWayId: string,
):
  | IngressRouteEdgeContractCompletion
  | UnknownIngressRouteEdgeContractCompletion {
  const way = INGRESS_GEOMETRY_WAYS.find(
    (candidate) =>
      candidate.sourceObjectId ===
      sourceWayId,
  );
  if (!way) {
    return {
      sourceWayId,
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
    };
  }

  const terrain =
    assessIngressTerrainAuthority(
      sourceWayId,
    );
  const mobility =
    assessIngressMobilityAuthority(
      sourceWayId,
    );

  if (
    "status" in terrain ||
    "status" in mobility
  ) {
    throw new Error(
      `Planner 22 cannot complete unknown semantics for unresolved ingress way ${sourceWayId}.`,
    );
  }

  if (
    terrain.difficultyAuthority.status !==
      "blocked" ||
    terrain.stairsAuthority.status !==
      "blocked" ||
    mobility.accessibilityAuthority.status !==
      "blocked" ||
    mobility.strollerAuthority.status !==
      "blocked"
  ) {
    throw new Error(
      `Planner 22 expects Planner 17/18 unresolved authority for ingress way ${sourceWayId}.`,
    );
  }

  return {
    sourceWayId,
    difficultyAuthority: {
      status: "supported",
      value: "unknown",
      basis:
        "Planner 22 explicit unknown semantics over unresolved Planner 18 difficulty authority",
      unresolvedReason:
        terrain.difficultyAuthority.reason,
      sourceSnapshotId:
        terrain.difficultyAuthority
          .sourceSnapshotId,
      ...(terrain.difficultyAuthority
        .corridorTerrainEvidenceId
        ? {
            corridorTerrainEvidenceId:
              terrain.difficultyAuthority
                .corridorTerrainEvidenceId,
          }
        : {}),
    },
    stairsAuthority: {
      status: "supported",
      value: "unknown",
      basis:
        "Planner 22 explicit unknown semantics over unresolved Planner 18 stairs authority",
      unresolvedReason:
        terrain.stairsAuthority.reason,
      sourceSnapshotId:
        terrain.stairsAuthority
          .sourceSnapshotId,
      ...(terrain.stairsAuthority
        .corridorTerrainEvidenceId
        ? {
            corridorTerrainEvidenceId:
              terrain.stairsAuthority
                .corridorTerrainEvidenceId,
          }
        : {}),
    },
    accessibleAuthority: {
      status: "supported",
      value: "unknown",
      basis:
        "Planner 22 explicit unknown semantics over unresolved Planner 17 accessibility authority",
      unresolvedReason:
        mobility.accessibilityAuthority
          .reason,
      ...(mobility.accessibilityAuthority
        .corridorEvidenceId
        ? {
            corridorEvidenceId:
              mobility.accessibilityAuthority
                .corridorEvidenceId,
          }
        : {}),
    },
    strollerAuthority: {
      status: "supported",
      value: "unknown",
      basis:
        "Planner 22 explicit unknown semantics over unresolved Planner 17 stroller authority",
      unresolvedReason:
        mobility.strollerAuthority.reason,
      policyEvidenceId:
        mobility.strollerAuthority
          .policyEvidenceId,
    },
    plannerMaterialization:
      "explicit-unknown-route-edge-semantics",
  };
}

const RAW_COMPLETIONS =
  INGRESS_GEOMETRY_WAYS.map((way) => {
    const completion =
      completeIngressRouteEdgeUnknownSemantics(
        way.sourceObjectId,
      );
    if ("status" in completion) {
      throw new Error(
        `Planner 22 failed to complete ingress way ${way.sourceObjectId}.`,
      );
    }
    return completion;
  });

export function assertIngressRouteEdgeUnknownCompletionIntegrity(
  completions:
    readonly IngressRouteEdgeContractCompletion[],
) {
  if (
    completions.length !==
      INGRESS_GEOMETRY_WAYS.length ||
    new Set(
      completions.map(
        (completion) =>
          completion.sourceWayId,
      ),
    ).size !== completions.length
  ) {
    throw new Error(
      "Planner 22 requires exactly one unknown-semantic completion per current ingress way.",
    );
  }

  for (const completion of completions) {
    const expected =
      completeIngressRouteEdgeUnknownSemantics(
        completion.sourceWayId,
      );
    if (
      "status" in expected ||
      JSON.stringify(completion) !==
        JSON.stringify(expected)
    ) {
      throw new Error(
        `Planner 22 unknown-semantic completion drifted for ingress way ${completion.sourceWayId}.`,
      );
    }

    for (const authority of [
      completion.difficultyAuthority,
      completion.stairsAuthority,
      completion.accessibleAuthority,
      completion.strollerAuthority,
    ]) {
      if (
        authority.status !==
          "supported" ||
        authority.value !== "unknown"
      ) {
        throw new Error(
          `Planner 22 cannot promote unresolved ingress semantics to concrete values for way ${completion.sourceWayId}.`,
        );
      }
    }
  }
}

assertIngressRouteEdgeUnknownCompletionIntegrity(
  RAW_COMPLETIONS,
);

export const INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS:
  readonly IngressRouteEdgeContractCompletion[] =
  deepFreeze(RAW_COMPLETIONS);

export function ingressRouteEdgeUnknownCompletionForWay(
  sourceWayId: string,
) {
  return INGRESS_ROUTE_EDGE_UNKNOWN_COMPLETIONS.find(
    (completion) =>
      completion.sourceWayId ===
      sourceWayId,
  );
}
