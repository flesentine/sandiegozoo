import {
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY,
  assessInteriorTreetopsEndpointRouteNode,
} from "./zooInteriorTreetopsEndpointRouteNodeAuthority.ts";
import {
  INTERIOR_TREETOPS_PROVENANCE_AUTHORITY,
} from "./zooInteriorTreetopsProvenanceAuthority.ts";
import {
  INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT,
} from "./zooInteriorTreetopsStairsAuthority.ts";
import {
  INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT,
} from "./zooInteriorTreetopsStrollerAuthority.ts";
import {
  INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY,
} from "./zooInteriorStairsAuthority.ts";
import {
  INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY,
} from "./zooInteriorStrollerAuthority.ts";

const COMPLETION_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-route-edge-contract-completion" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const ENDPOINT_ROUTE_NODE_AUTHORITY_ID =
  "sdz-interior-treetops-fern-canyon-endpoint-route-node-authority" as const;
const PROVENANCE_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-provenance" as const;
const STAIRS_EVIDENCE_AUDIT_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-stairs-evidence-audit" as const;
const STROLLER_EVIDENCE_AUDIT_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-stroller-evidence-audit" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;

const STAIRS_UNRESOLVED_REASON =
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED" as const;
const STROLLER_UNRESOLVED_REASON =
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED" as const;

const UNRESOLVED_EVIDENCE_REASONS = [
  STAIRS_UNRESOLVED_REASON,
  STROLLER_UNRESOLVED_REASON,
] as const;

export type InteriorTreetopsUnknownStairsCapability = {
  status: "supported";
  value: "unknown";
  representationBasis:
    "Planner 56 explicit unknown capability over unresolved Planner 52 stairs evidence";
  evidenceStatus: "unresolved";
  unresolvedReason: typeof STAIRS_UNRESOLVED_REASON;
  evidenceAuditId: typeof STAIRS_EVIDENCE_AUDIT_ID;
};

export type InteriorTreetopsUnknownStrollerCapability = {
  status: "supported";
  value: "unknown";
  representationBasis:
    "Planner 56 explicit unknown capability over unresolved Planner 53 stroller evidence";
  evidenceStatus: "unresolved";
  unresolvedReason: typeof STROLLER_UNRESOLVED_REASON;
  evidenceAuditId: typeof STROLLER_EVIDENCE_AUDIT_ID;
};

export type InteriorTreetopsRouteEdgeContractCompletion = {
  id: typeof COMPLETION_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  endpointRouteNodeAuthorityId:
    typeof ENDPOINT_ROUTE_NODE_AUTHORITY_ID;
  provenanceAuthorityId: typeof PROVENANCE_AUTHORITY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  stairsAuthority: InteriorTreetopsUnknownStairsCapability;
  strollerAuthority: InteriorTreetopsUnknownStrollerCapability;
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

export type InteriorTreetopsRouteEdgeContractCompletionAssessment =
  | {
      status: "route-edge-contract-complete";
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      stairs: "unknown";
      stroller: "unknown";
      unresolvedEvidenceReasons: readonly [
        typeof STAIRS_UNRESOLVED_REASON,
        typeof STROLLER_UNRESOLVED_REASON,
      ];
      blockedFields: readonly [];
      routeEdgeMaterialization: {
        status: "ready";
        nextMilestone: "route-edge-materialization";
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_ROUTE_EDGE_CONTRACT_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) {
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

const stairsAudit = INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT[0];
const strollerAudit = INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT[0];
const endpointAssessment =
  assessInteriorTreetopsEndpointRouteNode(OBJECTIVE_SOURCE_RECORD_ID);

if (endpointAssessment.status !== "route-node-ready") {
  throw new Error(
    "Planner 56 requires the Planner 55 Treetops endpoint RouteNode.",
  );
}

const RAW_STAIRS_AUTHORITY =
  nullPrototypeRecord<InteriorTreetopsUnknownStairsCapability>({
    status: "supported",
    value: "unknown",
    representationBasis:
      "Planner 56 explicit unknown capability over unresolved Planner 52 stairs evidence",
    evidenceStatus: "unresolved",
    unresolvedReason: STAIRS_UNRESOLVED_REASON,
    evidenceAuditId: STAIRS_EVIDENCE_AUDIT_ID,
  });

const RAW_STROLLER_AUTHORITY =
  nullPrototypeRecord<InteriorTreetopsUnknownStrollerCapability>({
    status: "supported",
    value: "unknown",
    representationBasis:
      "Planner 56 explicit unknown capability over unresolved Planner 53 stroller evidence",
    evidenceStatus: "unresolved",
    unresolvedReason: STROLLER_UNRESOLVED_REASON,
    evidenceAuditId: STROLLER_EVIDENCE_AUDIT_ID,
  });

const RAW_COMPLETION =
  nullPrototypeRecord<InteriorTreetopsRouteEdgeContractCompletion>({
    id: COMPLETION_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    endpointRouteNodeAuthorityId: ENDPOINT_ROUTE_NODE_AUTHORITY_ID,
    provenanceAuthorityId: PROVENANCE_AUTHORITY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
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

export function assertInteriorTreetopsRouteEdgeContractCompletionIntegrity(): void {
  if (
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY.id !==
      ENDPOINT_ROUTE_NODE_AUTHORITY_ID ||
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceWayId !==
      SOURCE_WAY_ID ||
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceObjectId !==
      TO_NODE_ID
  ) {
    throw new Error(
      "Planner 56 endpoint RouteNode linkage drifted from Planner 55.",
    );
  }

  if (
    endpointAssessment.routeEdgeMaterialization.status !== "blocked" ||
    endpointAssessment.routeEdgeMaterialization.reasons.length !== 2 ||
    endpointAssessment.routeEdgeMaterialization.reasons[0] !==
      STAIRS_UNRESOLVED_REASON ||
    endpointAssessment.routeEdgeMaterialization.reasons[1] !==
      STROLLER_UNRESOLVED_REASON
  ) {
    throw new Error(
      "Planner 56 requires Planner 55 to expose exactly the stairs and stroller blockers.",
    );
  }

  if (
    INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY.unresolvedPlannerValue !==
      "unknown" ||
    stairsAudit.id !== STAIRS_EVIDENCE_AUDIT_ID ||
    stairsAudit.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    stairsAudit.sourceWayId !== SOURCE_WAY_ID ||
    stairsAudit.sourceWayVersion !== SOURCE_WAY_VERSION ||
    stairsAudit.sourceFromNodeId !== FROM_NODE_ID ||
    stairsAudit.sourceToNodeId !== TO_NODE_ID ||
    stairsAudit.result !== "blocked" ||
    stairsAudit.blocker !== STAIRS_UNRESOLVED_REASON ||
    stairsAudit.stairs !== "unknown" ||
    stairsAudit.directStairFreeEvidence !== "not-sourced"
  ) {
    throw new Error(
      "Planner 56 cannot represent stairs as unknown unless Planner 52 remains explicitly unresolved.",
    );
  }

  if (
    INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY.unresolvedPlannerValue !==
      "unknown" ||
    strollerAudit.id !== STROLLER_EVIDENCE_AUDIT_ID ||
    strollerAudit.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    strollerAudit.sourceWayId !== SOURCE_WAY_ID ||
    strollerAudit.sourceWayVersion !== SOURCE_WAY_VERSION ||
    strollerAudit.sourceFromNodeId !== FROM_NODE_ID ||
    strollerAudit.sourceToNodeId !== TO_NODE_ID ||
    strollerAudit.result !== "blocked" ||
    strollerAudit.blocker !== STROLLER_UNRESOLVED_REASON ||
    strollerAudit.stroller !== "unknown" ||
    strollerAudit.directGenericStrollerRouteEvidence !== "not-sourced"
  ) {
    throw new Error(
      "Planner 56 cannot represent stroller as unknown unless Planner 53 remains explicitly unresolved.",
    );
  }

  if (
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.id !==
      PROVENANCE_AUTHORITY_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceWayVersion !==
      SOURCE_WAY_VERSION ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceFromNodeId !==
      FROM_NODE_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceToNodeId !== TO_NODE_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers.length !==
      2 ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers[0] !==
      STAIRS_UNRESOLVED_REASON ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers[1] !==
      STROLLER_UNRESOLVED_REASON
  ) {
    throw new Error(
      "Planner 56 must preserve Planner 54 unresolved evidence lineage.",
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
    RAW_COMPLETION.plannerMaterialization !==
      "explicit-unknown-route-edge-capability-semantics"
  ) {
    throw new Error(
      "Planner 56 explicit-unknown contract drifted from its conservative boundary.",
    );
  }

  for (const record of [
    RAW_COMPLETION as object,
    RAW_STAIRS_AUTHORITY as object,
    RAW_STROLLER_AUTHORITY as object,
  ]) {
    if (Object.getPrototypeOf(record) !== null) {
      throw new Error(
        "Planner 56 contract records must remain isolated from Object.prototype.",
      );
    }
  }

  for (const field of FORBIDDEN_ROUTE_EDGE_FIELDS) {
    if (field in RAW_COMPLETION) {
      throw new Error(
        `Planner 56 contract completion cannot materialize RouteEdge field ${field}.`,
      );
    }
  }
}

assertInteriorTreetopsRouteEdgeContractCompletionIntegrity();

export const INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION =
  deepFreeze(RAW_COMPLETION);

export function assessInteriorTreetopsRouteEdgeContractCompletion(
  objectiveSourceRecordId: string,
): InteriorTreetopsRouteEdgeContractCompletionAssessment {
  if (objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID) {
    return deepFreeze(
      nullPrototypeRecord({
        status: "blocked" as const,
        reason:
          "OBJECTIVE_TREETOPS_ROUTE_EDGE_CONTRACT_NOT_SOURCED" as const,
        objectiveSourceRecordId,
      }),
    );
  }

  return deepFreeze(
    nullPrototypeRecord({
      status: "route-edge-contract-complete" as const,
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      sourceWayId: SOURCE_WAY_ID,
      sourceWayVersion: SOURCE_WAY_VERSION,
      sourceFromNodeId: FROM_NODE_ID,
      sourceToNodeId: TO_NODE_ID,
      stairs: "unknown" as const,
      stroller: "unknown" as const,
      unresolvedEvidenceReasons: [...UNRESOLVED_EVIDENCE_REASONS],
      blockedFields: [] as [],
      routeEdgeMaterialization: nullPrototypeRecord({
        status: "ready" as const,
        nextMilestone: "route-edge-materialization" as const,
      }),
    }),
  );
}
