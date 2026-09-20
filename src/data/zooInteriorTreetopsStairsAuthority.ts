import {
  INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY,
} from "./zooInteriorStairsAuthority.ts";
import {
  classifyExactStairsAuthority,
} from "./zooIngressTerrainAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "./zooInteriorTreetopsPedestrianDirectionAuthority.ts";
import {
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorTreetopsAccessibilityAuthority.ts";
import {
  INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY,
} from "./zooInteriorTreetopsOperationalStatusAuthority.ts";

const AUDIT_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-stairs-evidence-audit" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const OPERATIONAL_STATUS_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-operational-status" as const;
const ACCESSIBILITY_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-accessibility" as const;
const SOURCE_SNAPSHOT_ID =
  "sdz-interior-treetops-v7-direction-source" as const;
const POLICY_ID =
  "sdz-interior-stairs-evidence-audit-policy-v1" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;

export type InteriorTreetopsStairsEvidenceAudit = {
  id: typeof AUDIT_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  operationalStatusAuthorityId: typeof OPERATIONAL_STATUS_AUTHORITY_ID;
  accessibilityAuthorityId: typeof ACCESSIBILITY_AUTHORITY_ID;
  sourceSnapshotId: typeof SOURCE_SNAPSHOT_ID;
  policyId: typeof POLICY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayName: "Treetops Way";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  exactWayHighway: "footway";
  exactWaySurface: "concrete";
  exactWayHighwayStepsState: "not-present";
  accessibilityState:
    "accessible-true-stairs-independent-unresolved";
  corridorTerrain: "mild";
  corridorStairsEvidence: "not-explicitly-published";
  sourceClassificationState: "blocked";
  sourceClassificationReason:
    "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED";
  directStairFreeEvidence: "not-sourced";
  result: "blocked";
  blocker: "EXACT_SEGMENT_STAIRS_NOT_SOURCED";
  stairs: "unknown";
  strollerAuthorityState:
    "facility-permission-not-route-suitability";
  plannerMaterialization: "stairs-evidence-audit-only";
};

export type InteriorTreetopsStairsAssessment =
  | {
      status: "blocked";
      reason: "EXACT_SEGMENT_STAIRS_NOT_SOURCED";
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      evidenceAuditId: typeof AUDIT_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      stairs: "unknown";
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_STAIRS_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
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

const RAW_AUDIT: InteriorTreetopsStairsEvidenceAudit[] = [
  {
    id: AUDIT_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    operationalStatusAuthorityId: OPERATIONAL_STATUS_AUTHORITY_ID,
    accessibilityAuthorityId: ACCESSIBILITY_AUTHORITY_ID,
    sourceSnapshotId: SOURCE_SNAPSHOT_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayName: "Treetops Way",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    exactWayHighway: "footway",
    exactWaySurface: "concrete",
    exactWayHighwayStepsState: "not-present",
    accessibilityState:
      "accessible-true-stairs-independent-unresolved",
    corridorTerrain: "mild",
    corridorStairsEvidence: "not-explicitly-published",
    sourceClassificationState: "blocked",
    sourceClassificationReason:
      "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
    directStairFreeEvidence: "not-sourced",
    result: "blocked",
    blocker: "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    stairs: "unknown",
    strollerAuthorityState:
      "facility-permission-not-route-suitability",
    plannerMaterialization: "stairs-evidence-audit-only",
  },
];

function assertCanonicalInteriorTreetopsStairsAuditIntegrity(): void {
  const policy = INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY;
  const source =
    INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
  const accessibility = INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0];
  const operational =
    INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0];
  const audit = RAW_AUDIT[0];
  const sourceClassification = classifyExactStairsAuthority({
    id: source.id,
    sourceTags: source.sourceTags,
  });

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.scope !==
      "exact-objective-selected-interior-segment-stairs-evidence-audit" ||
    policy.absenceOfHighwaySteps !==
      "insufficient-for-stairs-false" ||
    policy.wheelchairAccessibility !==
      "independent-does-not-establish-stairs" ||
    policy.generalAccessibleRouteGuidance !==
      "does-not-bind-exact-segment-to-ada-402" ||
    policy.positiveEvidenceRequirement !==
      "explicit-exact-route-ada-402-binding-or-direct-stair-free-evidence" ||
    policy.unresolvedPlannerValue !== "unknown" ||
    policy.authority !== "conservative-evidence-audit-policy"
  ) {
    throw new Error(
      "Planner 52 requires the unchanged conservative stairs audit policy.",
    );
  }

  if (
    source.id !== SOURCE_SNAPSHOT_ID ||
    source.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    source.sourceWayId !== SOURCE_WAY_ID ||
    source.sourceWayVersion !== SOURCE_WAY_VERSION ||
    source.sourceTags.highway !== "footway" ||
    source.sourceTags.name !== "Treetops Way" ||
    source.sourceTags.surface !== "concrete"
  ) {
    throw new Error(
      "Planner 52 stairs audit detached from the exact Treetops v7 source snapshot.",
    );
  }

  if (
    sourceClassification.status !== "blocked" ||
    sourceClassification.reason !==
      "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED" ||
    sourceClassification.sourceSnapshotId !== SOURCE_SNAPSHOT_ID
  ) {
    throw new Error(
      "Planner 52 requires exact source tags to remain non-authoritative for stairs=false.",
    );
  }

  if (
    accessibility.id !== ACCESSIBILITY_AUTHORITY_ID ||
    accessibility.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    accessibility.sourceWayId !== SOURCE_WAY_ID ||
    accessibility.sourceWayVersion !== SOURCE_WAY_VERSION ||
    accessibility.sourceFromNodeId !== FROM_NODE_ID ||
    accessibility.sourceToNodeId !== TO_NODE_ID ||
    accessibility.accessible !== true ||
    accessibility.stairsAuthorityState !== "independent-unresolved"
  ) {
    throw new Error(
      "Planner 52 stairs audit detached from Planner 50 accessibility.",
    );
  }

  if (
    operational.id !== OPERATIONAL_STATUS_AUTHORITY_ID ||
    operational.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    operational.sourceWayId !== SOURCE_WAY_ID ||
    operational.sourceWayVersion !== SOURCE_WAY_VERSION ||
    operational.sourceFromNodeId !== FROM_NODE_ID ||
    operational.sourceToNodeId !== TO_NODE_ID ||
    operational.status !== "conditional" ||
    operational.stairsAuthorityState !== "independent-unresolved"
  ) {
    throw new Error(
      "Planner 52 stairs audit detached from Planner 51 operational status.",
    );
  }

  if (
    audit.id !== AUDIT_ID ||
    audit.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    audit.operationalStatusAuthorityId !== OPERATIONAL_STATUS_AUTHORITY_ID ||
    audit.accessibilityAuthorityId !== ACCESSIBILITY_AUTHORITY_ID ||
    audit.sourceSnapshotId !== SOURCE_SNAPSHOT_ID ||
    audit.policyId !== POLICY_ID ||
    audit.sourceWayId !== SOURCE_WAY_ID ||
    audit.sourceWayVersion !== SOURCE_WAY_VERSION ||
    audit.sourceWayName !== "Treetops Way" ||
    audit.sourceFromNodeId !== FROM_NODE_ID ||
    audit.sourceToNodeId !== TO_NODE_ID ||
    audit.exactWayHighway !== "footway" ||
    audit.exactWaySurface !== "concrete" ||
    audit.exactWayHighwayStepsState !== "not-present" ||
    audit.accessibilityState !==
      "accessible-true-stairs-independent-unresolved" ||
    audit.corridorTerrain !== "mild" ||
    audit.corridorStairsEvidence !== "not-explicitly-published" ||
    audit.sourceClassificationState !== "blocked" ||
    audit.sourceClassificationReason !==
      "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED" ||
    audit.directStairFreeEvidence !== "not-sourced" ||
    audit.result !== "blocked" ||
    audit.blocker !== "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    audit.stairs !== "unknown" ||
    audit.strollerAuthorityState !==
      "facility-permission-not-route-suitability" ||
    audit.plannerMaterialization !== "stairs-evidence-audit-only"
  ) {
    throw new Error(
      "Planner 52 Treetops stairs audit drifted from the frozen conservative boundary.",
    );
  }

  for (const field of [
    "stairsFalse",
    "stroller",
    "provenance",
    "routeNodeId",
    "routeEdgeId",
  ] as const) {
    if (Object.hasOwn(audit, field)) {
      throw new Error(
        `Planner 52 stairs audit cannot materialize downstream field ${field}.`,
      );
    }
  }
}

assertCanonicalInteriorTreetopsStairsAuditIntegrity();

export const INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT:
  readonly InteriorTreetopsStairsEvidenceAudit[] =
    deepFreeze(RAW_AUDIT);

export function interiorTreetopsStairsAuditForObjective(
  objectiveSourceRecordId: string,
): InteriorTreetopsStairsEvidenceAudit | undefined {
  return INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorTreetopsStairs(
  objectiveSourceRecordId: string,
): InteriorTreetopsStairsAssessment {
  const audit =
    interiorTreetopsStairsAuditForObjective(objectiveSourceRecordId);

  if (!audit) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_STAIRS_NOT_SOURCED",
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
    stairs: audit.stairs,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
