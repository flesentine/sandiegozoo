import type {
  RouteNode,
  SourceProvenance,
} from "../planner/contracts.ts";
import {
  INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY,
} from "./zooInteriorTreetopsV7GeometryAuthority.ts";
import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
} from "./zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import {
  INTERIOR_TREETOPS_PROVENANCE_AUTHORITY,
} from "./zooInteriorTreetopsProvenanceAuthority.ts";
import {
  INGRESS_ROUTE_ZONES,
  routeNodeForSourceObjectId,
} from "./zooIngressRouteNodeAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-treetops-fern-canyon-endpoint-route-node-authority" as const;
const BINDING_ID =
  "sdz-interior-treetops-fern-canyon-endpoint-route-node-binding" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const GEOMETRY_AUTHORITY_ID =
  "sdz-interior-treetops-way-v7-geometry" as const;
const TOPOLOGY_AUTHORITY_ID =
  "sdz-interior-treetops-historical-topology" as const;
const PROVENANCE_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-provenance" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_OBJECT_ID = "13588159626" as const;
const SOURCE_VERSION = 1 as const;
const SOURCE_VERSION_URL =
  "https://api.openstreetmap.org/api/0.6/node/13588159626/1" as const;
const SOURCE_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const SOURCE_CHANGESET = 178875075 as const;
const LAT = 32.7352422 as const;
const LNG = -117.1501397 as const;
const ZONE_ID = "sdz-zone-san-diego-zoo" as const;
const ROUTE_NODE_ID =
  "sdz-interior-treetops-node-13588159626-route-node" as const;

export type InteriorTreetopsEndpointRouteNodeBinding = {
  id: typeof BINDING_ID;
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  geometryAuthorityId: typeof GEOMETRY_AUTHORITY_ID;
  topologyAuthorityId: typeof TOPOLOGY_AUTHORITY_ID;
  provenanceAuthorityId: typeof PROVENANCE_AUTHORITY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceObjectId: typeof SOURCE_OBJECT_ID;
  sourceVersion: typeof SOURCE_VERSION;
  routeNodeId: typeof ROUTE_NODE_ID;
  zoneId: typeof ZONE_ID;
  nodeRole: "junction";
  plannerMaterialization: "route-node";
};

export type InteriorTreetopsEndpointRouteNodeAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceObjectId: typeof SOURCE_OBJECT_ID;
  sourceVersion: typeof SOURCE_VERSION;
  sourceVersionUrl: typeof SOURCE_VERSION_URL;
  sourceTimestamp: typeof SOURCE_TIMESTAMP;
  sourceChangeset: typeof SOURCE_CHANGESET;
  lat: typeof LAT;
  lng: typeof LNG;
  routeNodeId: typeof ROUTE_NODE_ID;
  zoneId: typeof ZONE_ID;
  kind: "junction";
  provenance: SourceProvenance;
  edgeMaterialization: "blocked-until-semantic-completion";
  plannerMaterialization: "route-node-only";
};

export type InteriorTreetopsEndpointRouteNodeAssessment =
  | {
      status: "route-node-ready";
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      routeNodeId: typeof ROUTE_NODE_ID;
      sourceObjectId: typeof SOURCE_OBJECT_ID;
      zoneId: typeof ZONE_ID;
      routeEdgeMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_ENDPOINT_ROUTE_NODE_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const REMAINING_EDGE_BLOCKERS = [
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
] as const;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
const topology = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
const sourceNode = geometry.nodes.find(
  (node) => node.sourceObjectId === SOURCE_OBJECT_ID,
);
const zone = INGRESS_ROUTE_ZONES.find(
  (candidate) => candidate.id === ZONE_ID,
);

if (!sourceNode || !zone) {
  throw new Error(
    "Planner 55 requires the exact Treetops endpoint node and Zoo routing zone.",
  );
}

const qualifiedSourceNode = sourceNode;
const qualifiedZone = zone;

const RAW_PROVENANCE: SourceProvenance = {
  sourceUrl: SOURCE_VERSION_URL,
  sourceLabel:
    "OpenStreetMap node 13588159626 v1 selected as the Treetops Way / Fern Canyon Trail junction",
  lastVerified:
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceObservedAt,
  confidence: "provisional",
  effectiveFrom:
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.provenance.effectiveFrom,
};

const RAW_BINDING: InteriorTreetopsEndpointRouteNodeBinding = {
  id: BINDING_ID,
  authorityId: AUTHORITY_ID,
  objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
  geometryAuthorityId: GEOMETRY_AUTHORITY_ID,
  topologyAuthorityId: TOPOLOGY_AUTHORITY_ID,
  provenanceAuthorityId: PROVENANCE_AUTHORITY_ID,
  sourceWayId: SOURCE_WAY_ID,
  sourceObjectId: SOURCE_OBJECT_ID,
  sourceVersion: SOURCE_VERSION,
  routeNodeId: ROUTE_NODE_ID,
  zoneId: ZONE_ID,
  nodeRole: "junction",
  plannerMaterialization: "route-node",
};

const RAW_ROUTE_NODE: RouteNode = {
  id: ROUTE_NODE_ID,
  kind: "junction",
  zoneId: ZONE_ID,
  lat: LAT,
  lng: LNG,
  provenance: RAW_PROVENANCE,
};

const RAW_AUTHORITY: InteriorTreetopsEndpointRouteNodeAuthority = {
  id: AUTHORITY_ID,
  objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
  sourceWayId: SOURCE_WAY_ID,
  sourceObjectId: SOURCE_OBJECT_ID,
  sourceVersion: SOURCE_VERSION,
  sourceVersionUrl: SOURCE_VERSION_URL,
  sourceTimestamp: SOURCE_TIMESTAMP,
  sourceChangeset: SOURCE_CHANGESET,
  lat: LAT,
  lng: LNG,
  routeNodeId: ROUTE_NODE_ID,
  zoneId: ZONE_ID,
  kind: "junction",
  provenance: RAW_PROVENANCE,
  edgeMaterialization: "blocked-until-semantic-completion",
  plannerMaterialization: "route-node-only",
};

function assertCanonicalInteriorTreetopsEndpointRouteNodeIntegrity(): void {
  if (
    geometry.id !== GEOMETRY_AUTHORITY_ID ||
    geometry.sourceWayId !== SOURCE_WAY_ID ||
    geometry.sourceWayVersion !== 7 ||
    topology.id !== TOPOLOGY_AUTHORITY_ID ||
    topology.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    topology.nextJunctionNodeId !== SOURCE_OBJECT_ID ||
    topology.nextJunctionTreetopsIndex !== 6 ||
    topology.segmentProvenance.toNodeId !== SOURCE_OBJECT_ID
  ) {
    throw new Error(
      "Planner 55 endpoint selection detached from the qualified geometry/topology boundary.",
    );
  }

  if (
    qualifiedSourceNode.sourceObjectId !== SOURCE_OBJECT_ID ||
    qualifiedSourceNode.sourceVersion !== SOURCE_VERSION ||
    qualifiedSourceNode.sourceVersionUrl !== SOURCE_VERSION_URL ||
    qualifiedSourceNode.sourceTimestamp !== SOURCE_TIMESTAMP ||
    qualifiedSourceNode.sourceChangeset !== SOURCE_CHANGESET ||
    qualifiedSourceNode.lat !== LAT ||
    qualifiedSourceNode.lng !== LNG
  ) {
    throw new Error(
      "Planner 55 endpoint node drifted from version-pinned Treetops geometry.",
    );
  }

  if (
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.id !==
      PROVENANCE_AUTHORITY_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceWayId !==
      SOURCE_WAY_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceToNodeId !==
      SOURCE_OBJECT_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.semanticCompletion !==
      "blocked" ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY
      .unresolvedSemanticBlockers.length !== 2
  ) {
    throw new Error(
      "Planner 55 must remain attached to Planner 54 provisional provenance.",
    );
  }

  if (
    qualifiedZone.id !== ZONE_ID ||
    routeNodeForSourceObjectId(SOURCE_OBJECT_ID) !== undefined
  ) {
    throw new Error(
      "Planner 55 requires the existing Zoo zone and must not duplicate an ingress RouteNode.",
    );
  }

  if (
    RAW_BINDING.routeNodeId !== ROUTE_NODE_ID ||
    RAW_BINDING.sourceObjectId !== SOURCE_OBJECT_ID ||
    RAW_BINDING.zoneId !== ZONE_ID ||
    RAW_BINDING.nodeRole !== "junction" ||
    RAW_BINDING.plannerMaterialization !== "route-node" ||
    RAW_ROUTE_NODE.id !== ROUTE_NODE_ID ||
    RAW_ROUTE_NODE.kind !== "junction" ||
    RAW_ROUTE_NODE.zoneId !== ZONE_ID ||
    RAW_ROUTE_NODE.lat !== LAT ||
    RAW_ROUTE_NODE.lng !== LNG ||
    RAW_AUTHORITY.plannerMaterialization !== "route-node-only" ||
    RAW_AUTHORITY.edgeMaterialization !==
      "blocked-until-semantic-completion"
  ) {
    throw new Error(
      "Planner 55 RouteNode materialization drifted from its exact source-backed boundary.",
    );
  }

  if (
    RAW_PROVENANCE.sourceUrl !== SOURCE_VERSION_URL ||
    RAW_PROVENANCE.confidence !== "provisional" ||
    RAW_PROVENANCE.lastVerified !==
      INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceObservedAt
  ) {
    throw new Error(
      "Planner 55 RouteNode provenance drifted from qualified Treetops lineage.",
    );
  }

  for (const field of [
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
  ] as const) {
    if (
      Object.hasOwn(RAW_AUTHORITY, field) ||
      Object.hasOwn(RAW_BINDING, field) ||
      Object.hasOwn(RAW_ROUTE_NODE, field)
    ) {
      throw new Error(
        `Planner 55 RouteNode authority cannot materialize RouteEdge field ${field}.`,
      );
    }
  }
}

assertCanonicalInteriorTreetopsEndpointRouteNodeIntegrity();

export const INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY =
  deepFreeze(RAW_AUTHORITY);
export const INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_BINDING =
  deepFreeze(RAW_BINDING);
export const INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE =
  deepFreeze(RAW_ROUTE_NODE);

export function assessInteriorTreetopsEndpointRouteNode(
  objectiveSourceRecordId: string,
): InteriorTreetopsEndpointRouteNodeAssessment {
  if (objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_ENDPOINT_ROUTE_NODE_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "route-node-ready",
    objectiveSourceRecordId,
    routeNodeId: ROUTE_NODE_ID,
    sourceObjectId: SOURCE_OBJECT_ID,
    zoneId: ZONE_ID,
    routeEdgeMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_EDGE_BLOCKERS],
    },
  });
}
