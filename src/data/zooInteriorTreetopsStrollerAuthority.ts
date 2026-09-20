import {
  INGRESS_STROLLER_FACILITY_POLICY,
} from "./zooIngressMobilityAuthority.ts";
import {
  INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY,
  INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE,
} from "./zooInteriorStrollerAuthority.ts";
import {
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorTreetopsAccessibilityAuthority.ts";
import {
  INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT,
} from "./zooInteriorTreetopsStairsAuthority.ts";

const AUDIT_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-stroller-evidence-audit" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const STAIRS_EVIDENCE_AUDIT_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-stairs-evidence-audit" as const;
const ACCESSIBILITY_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-accessibility" as const;
const POLICY_ID =
  "sdz-interior-stroller-evidence-audit-policy-v1" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;

export type InteriorTreetopsStrollerEvidenceAudit = {
  id: typeof AUDIT_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  stairsEvidenceAuditId: typeof STAIRS_EVIDENCE_AUDIT_ID;
  accessibilityAuthorityId: typeof ACCESSIBILITY_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayName: "Treetops Way";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  facilityStrollerPolicyId: string;
  facilityStrollerPolicy: "allowed";
  facilityRouteSuitabilityAuthority: "not-established";
  exactAccessibilityState:
    "accessible-true-stroller-independent-unresolved";
  exactStairsState: "unknown";
  accessibilityGuideEvidenceScope:
    "accessibility-device-specific";
  genericStrollerRouteSuitabilityAuthority:
    "not-established";
  directGenericStrollerRouteEvidence: "not-sourced";
  result: "blocked";
  blocker: "EXACT_SEGMENT_STROLLER_NOT_SOURCED";
  stroller: "unknown";
  plannerMaterialization: "stroller-evidence-audit-only";
};

export type InteriorTreetopsStrollerAssessment =
  | {
      status: "blocked";
      reason: "EXACT_SEGMENT_STROLLER_NOT_SOURCED";
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      evidenceAuditId: typeof AUDIT_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      stroller: "unknown";
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_STROLLER_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const REMAINING_BLOCK_REASONS = [
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

const RAW_AUDIT: InteriorTreetopsStrollerEvidenceAudit[] = [
  {
    id: AUDIT_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    stairsEvidenceAuditId: STAIRS_EVIDENCE_AUDIT_ID,
    accessibilityAuthorityId: ACCESSIBILITY_AUTHORITY_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayName: "Treetops Way",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    facilityStrollerPolicyId:
      INGRESS_STROLLER_FACILITY_POLICY.id,
    facilityStrollerPolicy:
      INGRESS_STROLLER_FACILITY_POLICY.strollerPolicy,
    facilityRouteSuitabilityAuthority:
      INGRESS_STROLLER_FACILITY_POLICY.routeSuitabilityAuthority,
    exactAccessibilityState:
      "accessible-true-stroller-independent-unresolved",
    exactStairsState: "unknown",
    accessibilityGuideEvidenceScope:
      INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE.evidenceScope,
    genericStrollerRouteSuitabilityAuthority:
      INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE
        .genericStrollerRouteSuitabilityAuthority,
    directGenericStrollerRouteEvidence: "not-sourced",
    result: "blocked",
    blocker: "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
    stroller: "unknown",
    plannerMaterialization: "stroller-evidence-audit-only",
  },
];

function assertCanonicalInteriorTreetopsStrollerAuditIntegrity(): void {
  const policy = INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY;
  const accessibility = INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0];
  const stairs = INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT[0];
  const audit = RAW_AUDIT[0];

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.scope !==
      "exact-objective-selected-interior-segment-stroller-evidence-audit" ||
    policy.facilityPermission !==
      "insufficient-for-exact-route-suitability" ||
    policy.wheelchairTaggedStrollerTreatment !==
      "accessibility-device-special-case-not-generic-stroller-authority" ||
    policy.wheelchairAccessibility !==
      "does-not-establish-generic-stroller-suitability" ||
    policy.unresolvedStairs !==
      "cannot-be-treated-as-stroller-compatible" ||
    policy.positiveEvidenceRequirement !==
      "direct-exact-segment-generic-stroller-suitability-or-explicit-all-strollers-route-binding" ||
    policy.unresolvedPlannerValue !== "unknown" ||
    policy.authority !== "conservative-evidence-audit-policy"
  ) {
    throw new Error(
      "Planner 53 requires the unchanged conservative stroller audit policy.",
    );
  }

  if (
    INGRESS_STROLLER_FACILITY_POLICY.strollerPolicy !== "allowed" ||
    INGRESS_STROLLER_FACILITY_POLICY.routeSuitabilityAuthority !==
      "not-established" ||
    INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE.evidenceScope !==
      "accessibility-device-specific" ||
    INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE
      .genericStrollerRouteSuitabilityAuthority !== "not-established"
  ) {
    throw new Error(
      "Planner 53 requires facility stroller permission and accessibility-device guidance to remain non-route-authoritative.",
    );
  }

  if (
    accessibility.id !== ACCESSIBILITY_AUTHORITY_ID ||
    accessibility.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    accessibility.sourceWayId !== SOURCE_WAY_ID ||
    accessibility.sourceWayVersion !== SOURCE_WAY_VERSION ||
    accessibility.sourceWayName !== "Treetops Way" ||
    accessibility.sourceFromNodeId !== FROM_NODE_ID ||
    accessibility.sourceToNodeId !== TO_NODE_ID ||
    accessibility.accessible !== true ||
    accessibility.strollerAuthorityState !==
      "facility-permission-not-route-suitability"
  ) {
    throw new Error(
      "Planner 53 stroller audit detached from Planner 50 accessibility.",
    );
  }

  if (
    stairs.id !== STAIRS_EVIDENCE_AUDIT_ID ||
    stairs.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    stairs.sourceWayId !== SOURCE_WAY_ID ||
    stairs.sourceWayVersion !== SOURCE_WAY_VERSION ||
    stairs.sourceFromNodeId !== FROM_NODE_ID ||
    stairs.sourceToNodeId !== TO_NODE_ID ||
    stairs.stairs !== "unknown" ||
    stairs.result !== "blocked" ||
    stairs.blocker !== "EXACT_SEGMENT_STAIRS_NOT_SOURCED"
  ) {
    throw new Error(
      "Planner 53 stroller audit detached from Planner 52 unresolved stairs state.",
    );
  }

  if (
    audit.id !== AUDIT_ID ||
    audit.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    audit.stairsEvidenceAuditId !== STAIRS_EVIDENCE_AUDIT_ID ||
    audit.accessibilityAuthorityId !== ACCESSIBILITY_AUTHORITY_ID ||
    audit.policyId !== POLICY_ID ||
    audit.sourceWayId !== SOURCE_WAY_ID ||
    audit.sourceWayVersion !== SOURCE_WAY_VERSION ||
    audit.sourceWayName !== "Treetops Way" ||
    audit.sourceFromNodeId !== FROM_NODE_ID ||
    audit.sourceToNodeId !== TO_NODE_ID ||
    audit.facilityStrollerPolicy !== "allowed" ||
    audit.facilityRouteSuitabilityAuthority !== "not-established" ||
    audit.exactAccessibilityState !==
      "accessible-true-stroller-independent-unresolved" ||
    audit.exactStairsState !== "unknown" ||
    audit.accessibilityGuideEvidenceScope !==
      "accessibility-device-specific" ||
    audit.genericStrollerRouteSuitabilityAuthority !==
      "not-established" ||
    audit.directGenericStrollerRouteEvidence !== "not-sourced" ||
    audit.result !== "blocked" ||
    audit.blocker !== "EXACT_SEGMENT_STROLLER_NOT_SOURCED" ||
    audit.stroller !== "unknown" ||
    audit.plannerMaterialization !== "stroller-evidence-audit-only"
  ) {
    throw new Error(
      "Planner 53 Treetops stroller audit drifted from the frozen conservative boundary.",
    );
  }

  for (const field of [
    "strollerTrue",
    "provenance",
    "routeNodeId",
    "routeEdgeId",
  ] as const) {
    if (Object.hasOwn(audit, field)) {
      throw new Error(
        `Planner 53 stroller audit cannot materialize downstream field ${field}.`,
      );
    }
  }
}

assertCanonicalInteriorTreetopsStrollerAuditIntegrity();

export const INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT:
  readonly InteriorTreetopsStrollerEvidenceAudit[] =
    deepFreeze(RAW_AUDIT);

export function interiorTreetopsStrollerAuditForObjective(
  objectiveSourceRecordId: string,
): InteriorTreetopsStrollerEvidenceAudit | undefined {
  return INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorTreetopsStroller(
  objectiveSourceRecordId: string,
): InteriorTreetopsStrollerAssessment {
  const audit =
    interiorTreetopsStrollerAuditForObjective(objectiveSourceRecordId);

  if (!audit) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_STROLLER_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "blocked",
    reason: audit.blocker,
    objectiveSourceRecordId: audit.objectiveSourceRecordId,
    evidenceAuditId: audit.id,
    sourceWayId: audit.sourceWayId,
    sourceWayVersion: audit.sourceWayVersion,
    sourceFromNodeId: audit.sourceFromNodeId,
    sourceToNodeId: audit.sourceToNodeId,
    stroller: audit.stroller,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
