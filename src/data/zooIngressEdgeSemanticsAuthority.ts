import { INDEPENDENT_GEOSPATIAL_TARGETS } from "./zooGeospatialAuthority.ts";
import {
  DERIVED_INGRESS_DISTANCES,
  INGRESS_GEOMETRY_WAYS,
} from "./zooIngressDistanceAuthority.ts";
import {
  ENTRANCE_ACCESS_CONTROL_OBSERVATIONS,
} from "./zooGuestNavigationAuthority.ts";
import {
  routeNodeForSourceObjectId,
} from "./zooIngressRouteNodeAuthority.ts";
import {
  assessPedestrianDirectionAuthority,
  pedestrianDirectionSourceForWay,
} from "./zooIngressPedestrianDirectionAuthority.ts";
import {
  assessIngressMobilityAuthority,
} from "./zooIngressMobilityAuthority.ts";

export type SupportedFieldAuthority<T> = {
  status: "supported";
  value: T;
  basis: string;
};

export type BlockedFieldAuthority = {
  status: "blocked";
  reason:
    | "DURATION_POLICY_NOT_SOURCED"
    | "DIFFICULTY_NOT_SOURCED"
    | "STAIRS_NOT_EXPLICITLY_SOURCED"
    | "EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED"
    | "CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY"
    | "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY"
    | "GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT"
    | "PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED"
    | "PEDESTRIAN_DIRECTION_TAG_UNSUPPORTED"
    | "EDGE_STATUS_NOT_SOURCED";
};

export type PedestrianOneWayFieldAuthority =
  BlockedFieldAuthority & {
    basis: "Planner 16 pedestrian-direction authority";
    sourceSnapshotId: string;
  };

export type AccessibilityFieldAuthority = {
  status: "blocked";
  reason:
    | "EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED"
    | "CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY";
  basis: "Planner 17 accessibility authority";
  corridorEvidenceId?: string;
};

export type StrollerFieldAuthority = {
  status: "blocked";
  reason:
    "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY";
  basis: "Planner 17 stroller authority";
  policyEvidenceId: string;
};

export type RouteEdgeSemanticAudit = {
  id: string;
  targetId: string;
  sourceWayId: string;
  sourceUrl: string;
  sourceTags: Readonly<Record<string, string>>;
  routeNodesAuthority: SupportedFieldAuthority<
    Readonly<{
      fromNodeId: string;
      toNodeId: string;
    }>
  >;
  modeAuthority: SupportedFieldAuthority<"walk">;
  distanceAuthority: SupportedFieldAuthority<number>;
  durationAuthority: BlockedFieldAuthority;
  difficultyAuthority: BlockedFieldAuthority;
  stairsAuthority: BlockedFieldAuthority;
  accessibleAuthority: AccessibilityFieldAuthority;
  strollerAuthority: StrollerFieldAuthority;
  oneWayAuthority: PedestrianOneWayFieldAuthority;
  edgeStatusAuthority: BlockedFieldAuthority;
  plannerMaterialization: "route-edge-audit-only";
};

export type IngressRouteEdgeReadiness =
  | {
      status: "blocked";
      reason: "TARGET_UNKNOWN" | "NO_DISTANCE_SEGMENTS";
      targetId: string;
    }
  | {
      status: "partial-route-edge-authority";
      targetId: string;
      auditIds: string[];
      supportedFields: readonly [
        "routeNodes",
        "mode",
        "distance",
      ];
      blockedFields: readonly [
        "duration",
        "difficulty",
        "stairs",
        "accessible",
        "stroller",
        "oneWay",
        "status",
      ];
      routeEdgeMaterialization: {
        status: "blocked";
        reason: "ROUTE_EDGE_CONTRACT_INCOMPLETE";
      };
    };

export const OSM_PEDESTRIAN_SEMANTIC_REFERENCES =
  Object.freeze([
    "https://wiki.openstreetmap.org/wiki/Guidelines_for_pedestrian_navigation",
    "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
    "https://wiki.openstreetmap.org/wiki/Key:barrier",
  ] as const);

const FORBIDDEN_DIRECT_ROUTE_EDGE_FIELDS = [
  "fromNodeId",
  "toNodeId",
  "mode",
  "distanceMeters",
  "durationMinutes",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "oneWay",
  "status",
] as const;

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

function assertNoDirectRouteEdgeShape(
  value: object,
  label: string,
) {
  for (const field of FORBIDDEN_DIRECT_ROUTE_EDGE_FIELDS) {
    if (field in value) {
      throw new Error(
        `${label} cannot directly materialize Planner RouteEdge field ${field}.`,
      );
    }
  }
}

function validOsmWayUrl(value: string, wayId: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.openstreetmap.org" &&
      url.pathname === `/way/${wayId}`
    );
  } catch {
    return false;
  }
}

function blocked(
  reason: BlockedFieldAuthority["reason"],
): BlockedFieldAuthority {
  return { status: "blocked", reason };
}

function buildAudit(
  sourceWayId: string,
): RouteEdgeSemanticAudit {
  const way = INGRESS_GEOMETRY_WAYS.find(
    (candidate) =>
      candidate.sourceObjectId === sourceWayId,
  );
  const distance = DERIVED_INGRESS_DISTANCES.find(
    (candidate) =>
      candidate.sourceWayId === sourceWayId,
  );

  if (!way || !distance) {
    throw new Error(
      `Cannot audit unknown ingress way ${sourceWayId}.`,
    );
  }

  const directionSource =
    pedestrianDirectionSourceForWay(sourceWayId);
  if (!directionSource) {
    throw new Error(
      `Ingress way ${sourceWayId} has no Planner 16 source-tag snapshot.`,
    );
  }
  const sourceTags = directionSource.sourceTags;

  const fromRouteNode =
    routeNodeForSourceObjectId(way.nodeIds[0]);
  const toRouteNode =
    routeNodeForSourceObjectId(
      way.nodeIds[way.nodeIds.length - 1],
    );

  if (!fromRouteNode || !toRouteNode) {
    throw new Error(
      `Ingress way ${sourceWayId} is missing qualified Planner 15 endpoint route nodes.`,
    );
  }

  const directionAuthority =
    assessPedestrianDirectionAuthority(sourceWayId);
  const mobilityAuthority =
    assessIngressMobilityAuthority(sourceWayId);

  if (
    "status" in mobilityAuthority ||
    directionAuthority.status !== "blocked" ||
    directionAuthority.reason === "SOURCE_WAY_UNKNOWN" ||
    !directionAuthority.sourceSnapshotId
  ) {
    throw new Error(
      `Ingress way ${sourceWayId} does not have the expected blocked Planner 16 pedestrian-direction authority.`,
    );
  }

  return {
    id: `${way.id}-route-edge-audit`,
    targetId: way.targetId,
    sourceWayId,
    sourceUrl: way.sourceUrl,
    sourceTags,
    routeNodesAuthority: {
      status: "supported",
      value: {
        fromNodeId: fromRouteNode.id,
        toNodeId: toRouteNode.id,
      },
      basis:
        "Planner 15 route-node materialization from frozen OSM way endpoint nodes",
    },
    modeAuthority: {
      status: "supported",
      value: "walk",
      basis: "OSM highway=pedestrian",
    },
    distanceAuthority: {
      status: "supported",
      value: distance.distanceMeters,
      basis:
        "Planner 13 Haversine sum over frozen OSM way node sequence",
    },
    durationAuthority: blocked("DURATION_POLICY_NOT_SOURCED"),
    difficultyAuthority: blocked("DIFFICULTY_NOT_SOURCED"),
    stairsAuthority: blocked("STAIRS_NOT_EXPLICITLY_SOURCED"),
    accessibleAuthority:
      mobilityAuthority.accessibilityAuthority,
    strollerAuthority:
      mobilityAuthority.strollerAuthority,
    oneWayAuthority: {
      status: "blocked",
      reason: directionAuthority.reason,
      basis:
        "Planner 16 pedestrian-direction authority",
      sourceSnapshotId:
        directionAuthority.sourceSnapshotId,
    },
    edgeStatusAuthority: blocked("EDGE_STATUS_NOT_SOURCED"),
    plannerMaterialization: "route-edge-audit-only",
  };
}

const RAW_AUDITS = [
  buildAudit("755054695"),
  buildAudit("755054694"),
];

export function assertIngressRouteEdgeSemanticAuditIntegrity(
  audits: readonly RouteEdgeSemanticAudit[],
) {
  const distanceByWay = new Map(
    DERIVED_INGRESS_DISTANCES.map((distance) => [
      distance.sourceWayId,
      distance,
    ]),
  );
  const wayById = new Map(
    INGRESS_GEOMETRY_WAYS.map((way) => [
      way.sourceObjectId,
      way,
    ]),
  );
  const accessControl =
    ENTRANCE_ACCESS_CONTROL_OBSERVATIONS.find(
      (observation) =>
        observation.targetId === "sdz-geo-main-entrance",
    );

  if (
    !accessControl ||
    accessControl.barrier !== "turnstile" ||
    accessControl.access !== "customers"
  ) {
    throw new Error(
      "Planner 14 requires qualified customer-turnstile authority from Planner 12.",
    );
  }

  const ids = new Set<string>();
  const auditedWayIds = new Set<string>();

  for (const audit of audits) {
    assertNoDirectRouteEdgeShape(
      audit,
      `Route-edge semantic audit ${audit.id}`,
    );

    if (
      typeof audit.id !== "string" ||
      audit.id.trim() === "" ||
      audit.id !== audit.id.trim() ||
      ids.has(audit.id)
    ) {
      throw new Error(
        `Invalid or duplicate route-edge semantic audit ID: ${audit.id}`,
      );
    }
    ids.add(audit.id);

    const way = wayById.get(audit.sourceWayId);
    const distance = distanceByWay.get(audit.sourceWayId);
    const directionSource =
      pedestrianDirectionSourceForWay(
        audit.sourceWayId,
      );
    const sourceTags = directionSource?.sourceTags;

    if (
      !way ||
      !distance ||
      !sourceTags ||
      auditedWayIds.has(audit.sourceWayId) ||
      audit.targetId !== way.targetId ||
      audit.sourceUrl !== way.sourceUrl ||
      !validOsmWayUrl(
        audit.sourceUrl,
        audit.sourceWayId,
      ) ||
      JSON.stringify(audit.sourceTags) !==
        JSON.stringify(sourceTags) ||
      audit.plannerMaterialization !==
        "route-edge-audit-only"
    ) {
      throw new Error(
        `Route-edge semantic audit ${audit.id} does not match its source authority.`,
      );
    }

    const expectedFromRouteNode =
      routeNodeForSourceObjectId(way.nodeIds[0]);
    const expectedToRouteNode =
      routeNodeForSourceObjectId(
        way.nodeIds[way.nodeIds.length - 1],
      );

    if (
      !expectedFromRouteNode ||
      !expectedToRouteNode ||
      audit.routeNodesAuthority.status !== "supported" ||
      JSON.stringify(audit.routeNodesAuthority.value) !==
        JSON.stringify({
          fromNodeId: expectedFromRouteNode.id,
          toNodeId: expectedToRouteNode.id,
        }) ||
      audit.routeNodesAuthority.basis !==
        "Planner 15 route-node materialization from frozen OSM way endpoint nodes" ||
      audit.modeAuthority.status !== "supported" ||
      audit.modeAuthority.value !== "walk" ||
      audit.modeAuthority.basis !== "OSM highway=pedestrian" ||
      audit.distanceAuthority.status !== "supported" ||
      audit.distanceAuthority.value !== distance.distanceMeters ||
      audit.distanceAuthority.basis !==
        "Planner 13 Haversine sum over frozen OSM way node sequence"
    ) {
      throw new Error(
        `Route-edge semantic audit ${audit.id} changed its supported fields.`,
      );
    }

    const mobilityAuthority =
      assessIngressMobilityAuthority(
        audit.sourceWayId,
      );
    if (
      "status" in mobilityAuthority ||
      JSON.stringify(audit.accessibleAuthority) !==
        JSON.stringify(
          mobilityAuthority.accessibilityAuthority,
        ) ||
      JSON.stringify(audit.strollerAuthority) !==
        JSON.stringify(
          mobilityAuthority.strollerAuthority,
        )
    ) {
      throw new Error(
        `Route-edge semantic audit ${audit.id} changed Planner 17 mobility linkage.`,
      );
    }

    const directionAuthority =
      assessPedestrianDirectionAuthority(
        audit.sourceWayId,
      );
    if (
      directionAuthority.status !== "blocked" ||
      directionAuthority.reason === "SOURCE_WAY_UNKNOWN" ||
      !directionAuthority.sourceSnapshotId ||
      audit.oneWayAuthority.basis !==
        "Planner 16 pedestrian-direction authority" ||
      audit.oneWayAuthority.sourceSnapshotId !==
        directionAuthority.sourceSnapshotId
    ) {
      throw new Error(
        `Route-edge semantic audit ${audit.id} changed Planner 16 pedestrian-direction linkage.`,
      );
    }
    const expectedDirectionReason =
      directionAuthority.reason;

    const expectedBlockedReasons = [
      [
        audit.durationAuthority,
        "DURATION_POLICY_NOT_SOURCED",
      ],
      [
        audit.difficultyAuthority,
        "DIFFICULTY_NOT_SOURCED",
      ],
      [
        audit.stairsAuthority,
        "STAIRS_NOT_EXPLICITLY_SOURCED",
      ],
      [
        audit.accessibleAuthority,
        mobilityAuthority.accessibilityAuthority.reason,
      ],
      [
        audit.strollerAuthority,
        mobilityAuthority.strollerAuthority.reason,
      ],
      [audit.oneWayAuthority, expectedDirectionReason],
      [audit.edgeStatusAuthority, "EDGE_STATUS_NOT_SOURCED"],
    ] as const;

    if (
      expectedBlockedReasons.some(
        ([field, reason]) =>
          field.status !== "blocked" ||
          field.reason !== reason,
      )
    ) {
      throw new Error(
        `Route-edge semantic audit ${audit.id} changed blocked-field authority.`,
      );
    }

    auditedWayIds.add(audit.sourceWayId);
  }

  if (auditedWayIds.size !== INGRESS_GEOMETRY_WAYS.length) {
    throw new Error(
      "Every ingress distance way requires exactly one route-edge semantic audit.",
    );
  }
}

assertIngressRouteEdgeSemanticAuditIntegrity(RAW_AUDITS);

export const INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS:
  readonly RouteEdgeSemanticAudit[] =
  deepFreeze(RAW_AUDITS);

export function assessIngressRouteEdgeReadiness(
  targetId: string,
): IngressRouteEdgeReadiness {
  const knownTarget =
    INDEPENDENT_GEOSPATIAL_TARGETS.some(
      (target) => target.id === targetId,
    );

  if (!knownTarget) {
    return {
      status: "blocked",
      reason: "TARGET_UNKNOWN",
      targetId,
    };
  }

  const audits =
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.filter(
      (audit) => audit.targetId === targetId,
    );

  if (audits.length === 0) {
    return {
      status: "blocked",
      reason: "NO_DISTANCE_SEGMENTS",
      targetId,
    };
  }

  return {
    status: "partial-route-edge-authority",
    targetId,
    auditIds: audits.map((audit) => audit.id),
    supportedFields: [
      "routeNodes",
      "mode",
      "distance",
    ],
    blockedFields: [
      "duration",
      "difficulty",
      "stairs",
      "accessible",
      "stroller",
      "oneWay",
      "status",
    ],
    routeEdgeMaterialization: {
      status: "blocked",
      reason: "ROUTE_EDGE_CONTRACT_INCOMPLETE",
    },
  };
}
