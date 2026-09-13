import type {
  RouteNode,
  SourceProvenance,
} from "../planner/contracts.ts";
import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "./zooInteriorFrontStreetGeometryAuthority.ts";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
} from "./zooInteriorObjectiveBranchSelectionAuthority.ts";
import {
  INTERIOR_PROVENANCE_AUTHORITY,
} from "./zooInteriorProvenanceAuthority.ts";
import {
  INGRESS_ROUTE_ZONES,
  routeNodeForSourceObjectId,
} from "./zooIngressRouteNodeAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-endpoint-route-node-authority" as const;
const BINDING_ID =
  "sdz-interior-tiger-trail-front-street-endpoint-route-node-binding" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const GEOMETRY_AUTHORITY_ID =
  "sdz-interior-front-street-adjacent-geometry" as const;
const BRANCH_SELECTION_AUTHORITY_ID =
  "sdz-interior-front-street-objective-branch-selection" as const;
const PROVENANCE_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-provenance" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const SOURCE_OBJECT_ID = "1619736626" as const;
const SOURCE_VERSION = 2 as const;
const SOURCE_VERSION_URL =
  "https://api.openstreetmap.org/api/0.6/node/1619736626/2" as const;
const SOURCE_TIMESTAMP = "2013-12-23T19:47:46Z" as const;
const SOURCE_CHANGESET = 19606502 as const;
const LAT = 32.735201 as const;
const LNG = -117.1496375 as const;
const ZONE_ID = "sdz-zone-san-diego-zoo" as const;
const ROUTE_NODE_ID =
  "sdz-interior-front-street-node-1619736626-route-node" as const;

export type InteriorEndpointRouteNodeBinding = {
  id: typeof BINDING_ID;
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  geometryAuthorityId: typeof GEOMETRY_AUTHORITY_ID;
  branchSelectionAuthorityId: typeof BRANCH_SELECTION_AUTHORITY_ID;
  provenanceAuthorityId: typeof PROVENANCE_AUTHORITY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceObjectId: typeof SOURCE_OBJECT_ID;
  sourceVersion: typeof SOURCE_VERSION;
  routeNodeId: typeof ROUTE_NODE_ID;
  zoneId: typeof ZONE_ID;
  nodeRole: "junction";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "route-node";
};

export type InteriorEndpointRouteNodeAuthority = {
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
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  edgeMaterialization: "blocked-until-semantic-completion";
  plannerMaterialization: "route-node-only";
};

export type InteriorEndpointRouteNodeAssessment =
  | {
      status: "route-node-ready";
      objectiveSourceRecordId: string;
      routeNodeId: typeof ROUTE_NODE_ID;
      sourceObjectId: typeof SOURCE_OBJECT_ID;
      zoneId: typeof ZONE_ID;
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
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
      reason: "OBJECTIVE_ENDPOINT_ROUTE_NODE_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const REMAINING_EDGE_BLOCKERS = Object.freeze([
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
] as const);

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

function nullPrototypeRecord<T extends object>(value: T): T {
  const snapshot = Object.create(null) as Record<PropertyKey, unknown>;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor) {
      Object.defineProperty(snapshot, key, descriptor);
    }
  }
  return snapshot as T;
}

function assertObjectiveSourceRecordId(
  value: unknown,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value !== value.trim()
  ) {
    throw new Error(
      "Planner 38 objectiveSourceRecordId must be a primitive stable string.",
    );
  }
}

const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
const branchSelection =
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0];
const zone = INGRESS_ROUTE_ZONES.find(
  (candidate) => candidate.id === ZONE_ID,
);

if (!geometry || !branchSelection || !zone) {
  throw new Error(
    "Planner 38 requires the qualified interior geometry, objective branch selection, and Zoo routing zone.",
  );
}

const selectedCandidate =
  geometry.adjacentJunctionCandidates.find(
    (candidate) =>
      candidate.node.sourceObjectId === SOURCE_OBJECT_ID,
  );

if (!selectedCandidate) {
  throw new Error(
    "Planner 38 cannot find the Planner 27 selected endpoint in Planner 26 geometry authority.",
  );
}

const qualifiedZone = zone;
const qualifiedSelectedCandidate = selectedCandidate;

const RAW_PROVENANCE = nullPrototypeRecord<SourceProvenance>({
  sourceUrl: SOURCE_VERSION_URL,
  sourceLabel:
    "OpenStreetMap node 1619736626 v2 selected as the Tiger Trail Front Street junction",
  lastVerified: INTERIOR_PROVENANCE_AUTHORITY.sourceObservedAt,
  confidence: "provisional",
  effectiveFrom:
    INTERIOR_PROVENANCE_AUTHORITY.provenance.effectiveFrom,
});

const RAW_BINDING =
  nullPrototypeRecord<InteriorEndpointRouteNodeBinding>({
    id: BINDING_ID,
    authorityId: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    geometryAuthorityId: GEOMETRY_AUTHORITY_ID,
    branchSelectionAuthorityId: BRANCH_SELECTION_AUTHORITY_ID,
    provenanceAuthorityId: PROVENANCE_AUTHORITY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceObjectId: SOURCE_OBJECT_ID,
    sourceVersion: SOURCE_VERSION,
    routeNodeId: ROUTE_NODE_ID,
    zoneId: ZONE_ID,
    nodeRole: "junction",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "route-node",
  });

const RAW_ROUTE_NODE = nullPrototypeRecord<RouteNode>({
  id: ROUTE_NODE_ID,
  kind: "junction",
  zoneId: ZONE_ID,
  lat: LAT,
  lng: LNG,
  provenance: RAW_PROVENANCE,
});

const RAW_AUTHORITY =
  nullPrototypeRecord<InteriorEndpointRouteNodeAuthority>({
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
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    edgeMaterialization: "blocked-until-semantic-completion",
    plannerMaterialization: "route-node-only",
  });

const FORBIDDEN_EDGE_FIELDS = [
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

export function assertInteriorEndpointRouteNodeAuthorityIntegrity() {
  if (
    geometry.id !== GEOMETRY_AUTHORITY_ID ||
    geometry.sourceWayId !== SOURCE_WAY_ID ||
    branchSelection.id !== BRANCH_SELECTION_AUTHORITY_ID ||
    branchSelection.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    branchSelection.geometryAuthorityId !== GEOMETRY_AUTHORITY_ID ||
    branchSelection.selectedCandidateNodeId !== SOURCE_OBJECT_ID ||
    branchSelection.selectionScope !== "objective-only" ||
    branchSelection.globalEndpointSelection !== "unresolved"
  ) {
    throw new Error(
      "Planner 38 endpoint selection drifted from the qualified Planner 26/27 boundary.",
    );
  }

  const node = qualifiedSelectedCandidate.node;
  if (
    node.sourceObjectId !== SOURCE_OBJECT_ID ||
    node.sourceVersion !== SOURCE_VERSION ||
    node.sourceVersionUrl !== SOURCE_VERSION_URL ||
    node.sourceTimestamp !== SOURCE_TIMESTAMP ||
    node.sourceChangeset !== SOURCE_CHANGESET ||
    node.lat !== LAT ||
    node.lng !== LNG ||
    qualifiedSelectedCandidate.relativePosition !== "previous-adjacent" ||
    qualifiedSelectedCandidate.connectorWayId !== "148910139" ||
    qualifiedSelectedCandidate.connectorName !== "Treetops Way"
  ) {
    throw new Error(
      "Planner 38 selected endpoint drifted from version-pinned Planner 26 geometry.",
    );
  }

  if (
    !INTERIOR_PROVENANCE_AUTHORITY ||
    INTERIOR_PROVENANCE_AUTHORITY.id !== PROVENANCE_AUTHORITY_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.sourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.sourceToNodeId !== SOURCE_OBJECT_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.semanticCompletion !== "blocked" ||
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers.length !== 2 ||
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers[0] !==
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers[1] !==
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED"
  ) {
    throw new Error(
      "Planner 38 must remain attached to Planner 37 provenance with stairs and stroller unresolved.",
    );
  }

  if (
    qualifiedZone.id !== ZONE_ID ||
    routeNodeForSourceObjectId(SOURCE_OBJECT_ID) !== undefined
  ) {
    throw new Error(
      "Planner 38 requires the existing Zoo zone and must not duplicate an ingress RouteNode.",
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
    RAW_ROUTE_NODE.provenance !== RAW_PROVENANCE ||
    RAW_AUTHORITY.plannerMaterialization !== "route-node-only" ||
    RAW_AUTHORITY.edgeMaterialization !==
      "blocked-until-semantic-completion"
  ) {
    throw new Error(
      "Planner 38 RouteNode materialization drifted from its exact source-backed boundary.",
    );
  }

  if (
    RAW_PROVENANCE.sourceUrl !== SOURCE_VERSION_URL ||
    RAW_PROVENANCE.confidence !== "provisional" ||
    RAW_PROVENANCE.lastVerified !==
      INTERIOR_PROVENANCE_AUTHORITY.sourceObservedAt
  ) {
    throw new Error(
      "Planner 38 RouteNode provenance drifted from the qualified source lineage.",
    );
  }

  for (const record of [
    RAW_AUTHORITY as object,
    RAW_BINDING as object,
    RAW_ROUTE_NODE as object,
    RAW_PROVENANCE as object,
  ]) {
    if (Object.getPrototypeOf(record) !== null) {
      throw new Error(
        "Planner 38 exported records must remain isolated from Object.prototype.",
      );
    }
  }

  for (const field of FORBIDDEN_EDGE_FIELDS) {
    if (
      field in RAW_AUTHORITY ||
      field in RAW_BINDING ||
      field in RAW_ROUTE_NODE
    ) {
      throw new Error(
        `Planner 38 RouteNode authority cannot materialize RouteEdge field ${field}.`,
      );
    }
  }
}

assertInteriorEndpointRouteNodeAuthorityIntegrity();

export const INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY =
  deepFreeze(RAW_AUTHORITY);
export const INTERIOR_ENDPOINT_ROUTE_NODE_BINDING =
  deepFreeze(RAW_BINDING);
export const INTERIOR_ENDPOINT_ROUTE_NODE =
  deepFreeze(RAW_ROUTE_NODE);

export function assessInteriorEndpointRouteNode(
  objectiveSourceRecordId: string,
): InteriorEndpointRouteNodeAssessment {
  assertObjectiveSourceRecordId(objectiveSourceRecordId);

  if (objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID) {
    return deepFreeze(
      nullPrototypeRecord<Extract<
        InteriorEndpointRouteNodeAssessment,
        { status: "blocked" }
      >>({
        status: "blocked",
        reason: "OBJECTIVE_ENDPOINT_ROUTE_NODE_NOT_SOURCED",
        objectiveSourceRecordId,
        globalEndpointSelection: "unresolved",
      }),
    );
  }

  return deepFreeze(
    nullPrototypeRecord<Extract<
      InteriorEndpointRouteNodeAssessment,
      { status: "route-node-ready" }
    >>({
      status: "route-node-ready",
      objectiveSourceRecordId,
      routeNodeId: ROUTE_NODE_ID,
      sourceObjectId: SOURCE_OBJECT_ID,
      zoneId: ZONE_ID,
      selectionScope: "objective-only",
      globalEndpointSelection: "unresolved",
      routeEdgeMaterialization: nullPrototypeRecord({
        status: "blocked" as const,
        reasons: [...REMAINING_EDGE_BLOCKERS] as [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        ],
      }),
    }),
  );
}
