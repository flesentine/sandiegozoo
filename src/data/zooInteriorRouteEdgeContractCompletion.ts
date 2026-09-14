import {
  INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY,
  assessInteriorEndpointRouteNode,
} from "./zooInteriorEndpointRouteNodeAuthority.ts";
import {
  INTERIOR_PROVENANCE_AUTHORITY,
} from "./zooInteriorProvenanceAuthority.ts";
import {
  INTERIOR_STAIRS_EVIDENCE_AUDIT,
  INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY,
} from "./zooInteriorStairsAuthority.ts";
import {
  INTERIOR_STROLLER_EVIDENCE_AUDIT,
  INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY,
} from "./zooInteriorStrollerAuthority.ts";

const COMPLETION_ID =
  "sdz-interior-tiger-trail-front-street-route-edge-contract-completion" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const ENDPOINT_ROUTE_NODE_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-endpoint-route-node-authority" as const;
const PROVENANCE_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-provenance" as const;
const STAIRS_EVIDENCE_AUDIT_ID =
  "sdz-interior-tiger-trail-front-street-stairs-evidence-audit" as const;
const STROLLER_EVIDENCE_AUDIT_ID =
  "sdz-interior-tiger-trail-front-street-stroller-evidence-audit" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;

const STAIRS_UNRESOLVED_REASON =
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED" as const;
const STROLLER_UNRESOLVED_REASON =
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED" as const;

const UNRESOLVED_EVIDENCE_REASONS = Object.freeze([
  STAIRS_UNRESOLVED_REASON,
  STROLLER_UNRESOLVED_REASON,
] as const);

export type InteriorUnknownStairsCapability = {
  status: "supported";
  value: "unknown";
  representationBasis:
    "Planner 39 explicit unknown capability over unresolved Planner 35 stairs evidence";
  evidenceStatus: "unresolved";
  unresolvedReason: typeof STAIRS_UNRESOLVED_REASON;
  evidenceAuditId: typeof STAIRS_EVIDENCE_AUDIT_ID;
};

export type InteriorUnknownStrollerCapability = {
  status: "supported";
  value: "unknown";
  representationBasis:
    "Planner 39 explicit unknown capability over unresolved Planner 36 stroller evidence";
  evidenceStatus: "unresolved";
  unresolvedReason: typeof STROLLER_UNRESOLVED_REASON;
  evidenceAuditId: typeof STROLLER_EVIDENCE_AUDIT_ID;
};

export type InteriorRouteEdgeContractCompletion = {
  id: typeof COMPLETION_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  endpointRouteNodeAuthorityId:
    typeof ENDPOINT_ROUTE_NODE_AUTHORITY_ID;
  provenanceAuthorityId: typeof PROVENANCE_AUTHORITY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  stairsAuthority: InteriorUnknownStairsCapability;
  strollerAuthority: InteriorUnknownStrollerCapability;
  evidenceResolution: "unresolved-preserved";
  unresolvedEvidenceReasons: readonly [
    typeof STAIRS_UNRESOLVED_REASON,
    typeof STROLLER_UNRESOLVED_REASON,
  ];
  blockedFields: readonly [];
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization:
    "explicit-unknown-route-edge-capability-semantics";
};

export type InteriorRouteEdgeContractCompletionAssessment =
  | {
      status: "route-edge-contract-complete";
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      stairs: "unknown";
      stroller: "unknown";
      unresolvedEvidenceReasons: readonly [
        typeof STAIRS_UNRESOLVED_REASON,
        typeof STROLLER_UNRESOLVED_REASON,
      ];
      blockedFields: readonly [];
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      routeEdgeMaterialization: {
        status: "ready";
        nextMilestone: "route-edge-materialization";
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_ROUTE_EDGE_CONTRACT_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
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
      "Planner 39 objectiveSourceRecordId must be a primitive stable string.",
    );
  }
}

const stairsAudit = INTERIOR_STAIRS_EVIDENCE_AUDIT[0];
const strollerAudit = INTERIOR_STROLLER_EVIDENCE_AUDIT[0];
const endpointAssessment =
  assessInteriorEndpointRouteNode(OBJECTIVE_SOURCE_RECORD_ID);

if (!stairsAudit || !strollerAudit) {
  throw new Error(
    "Planner 39 requires the qualified Planner 35/36 evidence audits.",
  );
}

if (endpointAssessment.status !== "route-node-ready") {
  throw new Error(
    "Planner 39 requires the Planner 38 objective-selected endpoint RouteNode.",
  );
}

const qualifiedStairsAudit = stairsAudit;
const qualifiedStrollerAudit = strollerAudit;
const qualifiedEndpointAssessment = endpointAssessment;

const RAW_STAIRS_AUTHORITY =
  nullPrototypeRecord<InteriorUnknownStairsCapability>({
    status: "supported",
    value: "unknown",
    representationBasis:
      "Planner 39 explicit unknown capability over unresolved Planner 35 stairs evidence",
    evidenceStatus: "unresolved",
    unresolvedReason: STAIRS_UNRESOLVED_REASON,
    evidenceAuditId: STAIRS_EVIDENCE_AUDIT_ID,
  });

const RAW_STROLLER_AUTHORITY =
  nullPrototypeRecord<InteriorUnknownStrollerCapability>({
    status: "supported",
    value: "unknown",
    representationBasis:
      "Planner 39 explicit unknown capability over unresolved Planner 36 stroller evidence",
    evidenceStatus: "unresolved",
    unresolvedReason: STROLLER_UNRESOLVED_REASON,
    evidenceAuditId: STROLLER_EVIDENCE_AUDIT_ID,
  });

const RAW_COMPLETION =
  nullPrototypeRecord<InteriorRouteEdgeContractCompletion>({
    id: COMPLETION_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    endpointRouteNodeAuthorityId: ENDPOINT_ROUTE_NODE_AUTHORITY_ID,
    provenanceAuthorityId: PROVENANCE_AUTHORITY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    stairsAuthority: RAW_STAIRS_AUTHORITY,
    strollerAuthority: RAW_STROLLER_AUTHORITY,
    evidenceResolution: "unresolved-preserved",
    unresolvedEvidenceReasons: [...UNRESOLVED_EVIDENCE_REASONS],
    blockedFields: [],
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization:
      "explicit-unknown-route-edge-capability-semantics",
  });

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
  "provenance",
  "routeEdgeId",
] as const;

export function assertInteriorRouteEdgeContractCompletionIntegrity() {
  if (
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.id !==
      ENDPOINT_ROUTE_NODE_AUTHORITY_ID ||
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceObjectId !== TO_NODE_ID ||
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.selectionScope !==
      "objective-only" ||
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.globalEndpointSelection !==
      "unresolved"
  ) {
    throw new Error(
      "Planner 39 endpoint RouteNode linkage drifted from Planner 38.",
    );
  }

  if (
    qualifiedEndpointAssessment.sourceObjectId !== TO_NODE_ID ||
    qualifiedEndpointAssessment.routeEdgeMaterialization.status !==
      "blocked" ||
    qualifiedEndpointAssessment.routeEdgeMaterialization.reasons.length !==
      2 ||
    qualifiedEndpointAssessment.routeEdgeMaterialization.reasons[0] !==
      STAIRS_UNRESOLVED_REASON ||
    qualifiedEndpointAssessment.routeEdgeMaterialization.reasons[1] !==
      STROLLER_UNRESOLVED_REASON
  ) {
    throw new Error(
      "Planner 39 requires Planner 38 to expose exactly the stairs and stroller blockers.",
    );
  }

  if (
    INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY.unresolvedPlannerValue !==
      "unknown" ||
    qualifiedStairsAudit.id !== STAIRS_EVIDENCE_AUDIT_ID ||
    qualifiedStairsAudit.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    qualifiedStairsAudit.sourceWayId !== SOURCE_WAY_ID ||
    qualifiedStairsAudit.sourceFromNodeId !== FROM_NODE_ID ||
    qualifiedStairsAudit.sourceToNodeId !== TO_NODE_ID ||
    qualifiedStairsAudit.result !== "blocked" ||
    qualifiedStairsAudit.blocker !== STAIRS_UNRESOLVED_REASON ||
    qualifiedStairsAudit.directStairFreeEvidence !== "not-sourced"
  ) {
    throw new Error(
      "Planner 39 cannot represent stairs as unknown unless Planner 35 remains explicitly unresolved.",
    );
  }

  if (
    INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.unresolvedPlannerValue !==
      "unknown" ||
    qualifiedStrollerAudit.id !== STROLLER_EVIDENCE_AUDIT_ID ||
    qualifiedStrollerAudit.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    qualifiedStrollerAudit.sourceWayId !== SOURCE_WAY_ID ||
    qualifiedStrollerAudit.sourceFromNodeId !== FROM_NODE_ID ||
    qualifiedStrollerAudit.sourceToNodeId !== TO_NODE_ID ||
    qualifiedStrollerAudit.result !== "blocked" ||
    qualifiedStrollerAudit.blocker !== STROLLER_UNRESOLVED_REASON ||
    qualifiedStrollerAudit.directGenericStrollerRouteEvidence !==
      "not-sourced"
  ) {
    throw new Error(
      "Planner 39 cannot represent stroller as unknown unless Planner 36 remains explicitly unresolved.",
    );
  }

  if (
    INTERIOR_PROVENANCE_AUTHORITY.id !== PROVENANCE_AUTHORITY_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.sourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.sourceFromNodeId !== FROM_NODE_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.sourceToNodeId !== TO_NODE_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers.length !== 2 ||
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers[0] !==
      STAIRS_UNRESOLVED_REASON ||
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers[1] !==
      STROLLER_UNRESOLVED_REASON
  ) {
    throw new Error(
      "Planner 39 must preserve Planner 37's unresolved evidence lineage.",
    );
  }

  if (
    RAW_STAIRS_AUTHORITY.status !== "supported" ||
    RAW_STAIRS_AUTHORITY.value !== "unknown" ||
    RAW_STAIRS_AUTHORITY.evidenceStatus !== "unresolved" ||
    RAW_STAIRS_AUTHORITY.unresolvedReason !== STAIRS_UNRESOLVED_REASON ||
    RAW_STROLLER_AUTHORITY.status !== "supported" ||
    RAW_STROLLER_AUTHORITY.value !== "unknown" ||
    RAW_STROLLER_AUTHORITY.evidenceStatus !== "unresolved" ||
    RAW_STROLLER_AUTHORITY.unresolvedReason !==
      STROLLER_UNRESOLVED_REASON ||
    RAW_COMPLETION.evidenceResolution !== "unresolved-preserved" ||
    RAW_COMPLETION.blockedFields.length !== 0 ||
    RAW_COMPLETION.unresolvedEvidenceReasons.length !== 2 ||
    RAW_COMPLETION.unresolvedEvidenceReasons[0] !==
      STAIRS_UNRESOLVED_REASON ||
    RAW_COMPLETION.unresolvedEvidenceReasons[1] !==
      STROLLER_UNRESOLVED_REASON ||
    RAW_COMPLETION.selectionScope !== "objective-only" ||
    RAW_COMPLETION.globalEndpointSelection !== "unresolved"
  ) {
    throw new Error(
      "Planner 39 explicit-unknown completion drifted from the conservative contract boundary.",
    );
  }

  for (const record of [
    RAW_COMPLETION as object,
    RAW_STAIRS_AUTHORITY as object,
    RAW_STROLLER_AUTHORITY as object,
  ]) {
    if (Object.getPrototypeOf(record) !== null) {
      throw new Error(
        "Planner 39 exported records must remain isolated from Object.prototype.",
      );
    }
  }

  for (const field of FORBIDDEN_ROUTE_EDGE_FIELDS) {
    if (field in RAW_COMPLETION) {
      throw new Error(
        `Planner 39 contract completion cannot materialize RouteEdge field ${field}.`,
      );
    }
  }
}

assertInteriorRouteEdgeContractCompletionIntegrity();

export const INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION =
  deepFreeze(RAW_COMPLETION);

export function assessInteriorRouteEdgeContractCompletion(
  objectiveSourceRecordId: string,
): InteriorRouteEdgeContractCompletionAssessment {
  assertObjectiveSourceRecordId(objectiveSourceRecordId);

  if (objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID) {
    return deepFreeze(
      nullPrototypeRecord<Extract<
        InteriorRouteEdgeContractCompletionAssessment,
        { status: "blocked" }
      >>({
        status: "blocked",
        reason: "OBJECTIVE_ROUTE_EDGE_CONTRACT_NOT_SOURCED",
        objectiveSourceRecordId,
        globalEndpointSelection: "unresolved",
      }),
    );
  }

  return deepFreeze(
    nullPrototypeRecord<Extract<
      InteriorRouteEdgeContractCompletionAssessment,
      { status: "route-edge-contract-complete" }
    >>({
      status: "route-edge-contract-complete",
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      sourceWayId: SOURCE_WAY_ID,
      sourceFromNodeId: FROM_NODE_ID,
      sourceToNodeId: TO_NODE_ID,
      stairs: "unknown",
      stroller: "unknown",
      unresolvedEvidenceReasons: [...UNRESOLVED_EVIDENCE_REASONS],
      blockedFields: [],
      selectionScope: "objective-only",
      globalEndpointSelection: "unresolved",
      routeEdgeMaterialization: nullPrototypeRecord({
        status: "ready" as const,
        nextMilestone: "route-edge-materialization" as const,
      }),
    }),
  );
}
