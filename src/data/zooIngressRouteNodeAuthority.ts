import type {
  RouteNode,
  SourceProvenance,
  ZoneRecord,
} from "../planner/contracts.ts";
import {
  INDEPENDENT_GEOSPATIAL_TARGETS,
} from "./zooGeospatialAuthority.ts";
import {
  EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS,
} from "./zooGuestNavigationAuthority.ts";
import {
  INGRESS_GEOMETRY_NODES,
  type IngressGeometryNode,
} from "./zooIngressDistanceAuthority.ts";
import {
  OFFICIAL_ZOO_MAP_ARTIFACTS,
} from "./zooMapAuthority.ts";

export type IngressRouteNodeBinding = {
  targetId: string;
  sourceGeometryNodeId: string;
  sourceObjectId: string;
  routeNodeId: string;
  zoneId: string;
  nodeRole: "entrance" | "junction";
  plannerMaterialization: "route-node";
};

export type IngressRouteNodeAuthorityAssessment =
  | {
      status: "blocked";
      reason:
        | "TARGET_UNKNOWN"
        | "INGRESS_ROUTE_NODE_GEOMETRY_NOT_SOURCED";
      targetId: string;
    }
  | {
      status: "route-nodes-ready";
      targetId: string;
      zoneIds: string[];
      routeNodeIds: string[];
      sourceObjectIds: string[];
      routeEdges: {
        status: "blocked";
        reason: "ROUTE_EDGE_CONTRACT_INCOMPLETE";
      };
    };

const ZOO_ZONE_ID = "sdz-zone-san-diego-zoo";
const ZOO_ZONE_NAME = "San Diego Zoo";
const ZOO_ZONE_MAP_ARTIFACT_ID = "sdz-map-2026-01-05-classic";

const FORBIDDEN_ROUTE_EDGE_FIELDS = [
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

function stableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function assertNoRouteEdgeMaterialization(
  value: object,
  label: string,
) {
  for (const field of FORBIDDEN_ROUTE_EDGE_FIELDS) {
    if (field in value) {
      throw new Error(
        `${label} cannot materialize Planner RouteEdge field ${field}.`,
      );
    }
  }
}

function sourceDate(observedAt: string) {
  return observedAt.slice(0, 10);
}

function provenanceForGeometryNode(
  sourceNode: IngressGeometryNode,
): SourceProvenance {
  return {
    sourceUrl: sourceNode.sourceUrl,
    sourceLabel:
      `OpenStreetMap node ${sourceNode.sourceObjectId}`,
    lastVerified: sourceNode.observedAt,
    confidence: "verified",
    effectiveFrom: sourceDate(sourceNode.observedAt),
  };
}

const zoneArtifact = OFFICIAL_ZOO_MAP_ARTIFACTS.find(
  (artifact) => artifact.id === ZOO_ZONE_MAP_ARTIFACT_ID,
);

if (!zoneArtifact) {
  throw new Error(
    `Planner 15 requires official map artifact ${ZOO_ZONE_MAP_ARTIFACT_ID}.`,
  );
}

const ZOO_ZONE_PROVENANCE: SourceProvenance = {
  sourceUrl: zoneArtifact.sourceUrl,
  sourceLabel: zoneArtifact.sourceLabel,
  lastVerified: zoneArtifact.observedAt,
  confidence: "verified",
  effectiveFrom: zoneArtifact.revisionDate,
};

const RAW_ZONES: ZoneRecord[] = [
  {
    id: ZOO_ZONE_ID,
    name: ZOO_ZONE_NAME,
    provenance: ZOO_ZONE_PROVENANCE,
  },
];

const explicitMainEntrance =
  EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS.find(
    (observation) =>
      observation.targetId === "sdz-geo-main-entrance",
  );

if (!explicitMainEntrance) {
  throw new Error(
    "Planner 15 requires the qualified explicit main-entrance node from Planner 12.",
  );
}

const RAW_BINDINGS: IngressRouteNodeBinding[] =
  INGRESS_GEOMETRY_NODES.map((sourceNode) => {
    const nodeRole =
      sourceNode.sourceObjectId ===
      explicitMainEntrance.sourceObjectId
        ? "entrance" as const
        : "junction" as const;

    return {
      targetId: sourceNode.targetId,
      sourceGeometryNodeId: sourceNode.id,
      sourceObjectId: sourceNode.sourceObjectId,
      routeNodeId: `${sourceNode.id}-route-node`,
      zoneId: ZOO_ZONE_ID,
      nodeRole,
      plannerMaterialization: "route-node" as const,
    };
  });

const sourceNodeById = new Map(
  INGRESS_GEOMETRY_NODES.map((sourceNode) => [
    sourceNode.id,
    sourceNode,
  ]),
);

const RAW_ROUTE_NODES: RouteNode[] = RAW_BINDINGS.map(
  (binding) => {
    const sourceNode = sourceNodeById.get(
      binding.sourceGeometryNodeId,
    );

    if (!sourceNode) {
      throw new Error(
        `Planner 15 binding ${binding.routeNodeId} references unknown source geometry node ${binding.sourceGeometryNodeId}.`,
      );
    }

    return {
      id: binding.routeNodeId,
      kind: binding.nodeRole,
      zoneId: binding.zoneId,
      lat: sourceNode.lat,
      lng: sourceNode.lng,
      provenance: provenanceForGeometryNode(sourceNode),
    };
  },
);

export function assertIngressRouteNodeAuthorityIntegrity(
  zones: readonly ZoneRecord[],
  routeNodes: readonly RouteNode[],
  bindings: readonly IngressRouteNodeBinding[],
) {
  if (zones.length !== 1) {
    throw new Error(
      "Planner 15 currently requires exactly one conservative Zoo routing zone.",
    );
  }

  const zone = zones[0];
  if (
    zone.id !== ZOO_ZONE_ID ||
    zone.name !== ZOO_ZONE_NAME ||
    JSON.stringify(zone.provenance) !==
      JSON.stringify(ZOO_ZONE_PROVENANCE)
  ) {
    throw new Error(
      "Planner 15 Zoo routing zone drifted from official map authority.",
    );
  }

  if (
    routeNodes.length !== INGRESS_GEOMETRY_NODES.length ||
    bindings.length !== INGRESS_GEOMETRY_NODES.length
  ) {
    throw new Error(
      "Every qualified ingress geometry node requires exactly one Planner route-node binding.",
    );
  }

  const targetIds = new Set(
    INDEPENDENT_GEOSPATIAL_TARGETS.map(
      (target) => target.id,
    ),
  );
  const sourceByGeometryId = new Map(
    INGRESS_GEOMETRY_NODES.map((sourceNode) => [
      sourceNode.id,
      sourceNode,
    ]),
  );
  const sourceGeometryIds = new Set<string>();
  const sourceObjectIds = new Set<string>();
  const routeNodeIds = new Set<string>();
  const routeNodeById = new Map(
    routeNodes.map((routeNode) => [
      routeNode.id,
      routeNode,
    ]),
  );

  for (const binding of bindings) {
    assertNoRouteEdgeMaterialization(
      binding,
      `Ingress route-node binding ${binding.routeNodeId}`,
    );

    const sourceNode = sourceByGeometryId.get(
      binding.sourceGeometryNodeId,
    );
    const routeNode = routeNodeById.get(
      binding.routeNodeId,
    );

    if (
      !sourceNode ||
      !routeNode ||
      !targetIds.has(binding.targetId) ||
      binding.targetId !== sourceNode.targetId ||
      binding.sourceObjectId !== sourceNode.sourceObjectId ||
      binding.routeNodeId !==
        `${sourceNode.id}-route-node` ||
      binding.zoneId !== ZOO_ZONE_ID ||
      binding.plannerMaterialization !== "route-node"
    ) {
      throw new Error(
        `Ingress route-node binding ${binding.routeNodeId} does not match source geometry authority.`,
      );
    }

    if (
      sourceGeometryIds.has(binding.sourceGeometryNodeId) ||
      sourceObjectIds.has(binding.sourceObjectId) ||
      routeNodeIds.has(binding.routeNodeId)
    ) {
      throw new Error(
        `Ingress route-node binding ${binding.routeNodeId} is duplicated.`,
      );
    }

    sourceGeometryIds.add(binding.sourceGeometryNodeId);
    sourceObjectIds.add(binding.sourceObjectId);
    routeNodeIds.add(binding.routeNodeId);

    const expectedKind =
      sourceNode.sourceObjectId ===
      explicitMainEntrance.sourceObjectId
        ? "entrance"
        : "junction";

    if (
      binding.nodeRole !== expectedKind ||
      routeNode.kind !== expectedKind ||
      routeNode.zoneId !== ZOO_ZONE_ID ||
      routeNode.lat !== sourceNode.lat ||
      routeNode.lng !== sourceNode.lng ||
      JSON.stringify(routeNode.provenance) !==
        JSON.stringify(
          provenanceForGeometryNode(sourceNode),
        )
    ) {
      throw new Error(
        `Planner route node ${routeNode.id} changed its qualified source-backed materialization.`,
      );
    }

    assertNoRouteEdgeMaterialization(
      routeNode,
      `Planner route node ${routeNode.id}`,
    );

    if (
      !stableId(routeNode.id) ||
      !stableId(routeNode.zoneId)
    ) {
      throw new Error(
        `Planner route node ${routeNode.id} has invalid stable IDs.`,
      );
    }
  }

  if (
    sourceGeometryIds.size !==
      INGRESS_GEOMETRY_NODES.length ||
    sourceObjectIds.size !==
      INGRESS_GEOMETRY_NODES.length ||
    routeNodeIds.size !==
      INGRESS_GEOMETRY_NODES.length
  ) {
    throw new Error(
      "Planner 15 route-node coverage is not one-to-one with ingress source geometry.",
    );
  }
}

assertIngressRouteNodeAuthorityIntegrity(
  RAW_ZONES,
  RAW_ROUTE_NODES,
  RAW_BINDINGS,
);

export const INGRESS_ROUTE_ZONES:
  readonly ZoneRecord[] =
  deepFreeze(RAW_ZONES);

export const INGRESS_ROUTE_NODES:
  readonly RouteNode[] =
  deepFreeze(RAW_ROUTE_NODES);

export const INGRESS_ROUTE_NODE_BINDINGS:
  readonly IngressRouteNodeBinding[] =
  deepFreeze(RAW_BINDINGS);

export function routeNodeBindingForSourceObjectId(
  sourceObjectId: string,
) {
  return INGRESS_ROUTE_NODE_BINDINGS.find(
    (binding) =>
      binding.sourceObjectId === sourceObjectId,
  );
}

export function routeNodeForSourceObjectId(
  sourceObjectId: string,
) {
  const binding =
    routeNodeBindingForSourceObjectId(sourceObjectId);
  if (!binding) return undefined;

  return INGRESS_ROUTE_NODES.find(
    (routeNode) =>
      routeNode.id === binding.routeNodeId,
  );
}

export function assessIngressRouteNodeAuthority(
  targetId: string,
): IngressRouteNodeAuthorityAssessment {
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

  const bindings =
    INGRESS_ROUTE_NODE_BINDINGS.filter(
      (binding) =>
        binding.targetId === targetId,
    );

  if (bindings.length === 0) {
    return {
      status: "blocked",
      reason:
        "INGRESS_ROUTE_NODE_GEOMETRY_NOT_SOURCED",
      targetId,
    };
  }

  return {
    status: "route-nodes-ready",
    targetId,
    zoneIds: [ZOO_ZONE_ID],
    routeNodeIds: bindings.map(
      (binding) => binding.routeNodeId,
    ),
    sourceObjectIds: bindings.map(
      (binding) => binding.sourceObjectId,
    ),
    routeEdges: {
      status: "blocked",
      reason: "ROUTE_EDGE_CONTRACT_INCOMPLETE",
    },
  };
}
