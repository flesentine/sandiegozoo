import {
  INTERIOR_OPERATIONAL_STATUS_AUTHORITY,
} from "./zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorAccessibilityAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "./zooInteriorPedestrianDirectionAuthority.ts";
import {
  classifyExactStairsAuthority,
} from "./zooIngressTerrainAuthority.ts";

const POLICY_ID = "sdz-interior-stairs-evidence-audit-policy-v1" as const;
const AUDIT_ID =
  "sdz-interior-tiger-trail-front-street-stairs-evidence-audit" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const OPERATIONAL_STATUS_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-operational-status" as const;
const ACCESSIBILITY_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-accessibility" as const;
const SOURCE_SNAPSHOT_ID =
  "sdz-interior-front-street-direction-source-v1" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const ADOPTED_AT = "2026-09-13T00:39:00-07:00" as const;
const ZOO_ACCESSIBILITY_GUIDE_URL =
  "https://sdzwa.org/sdzwa-accessibility-guide" as const;
const ADA_STANDARD_URL =
  "https://www.ada.gov/assets/pdfs/2010-design-standards.pdf" as const;

export type InteriorStairsEvidenceAuditPolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope: "exact-objective-selected-interior-segment-stairs-evidence-audit";
  absenceOfHighwaySteps:
    "insufficient-for-stairs-false";
  pedestrianOrAsphaltClassification:
    "identity-context-only-not-no-stairs-authority";
  wheelchairAccessibility:
    "independent-does-not-establish-stairs";
  generalAccessibleRouteGuidance:
    "does-not-bind-exact-segment-to-ada-402";
  adaSection402Semantics:
    "requires-explicit-exact-route-applicability-before-use";
  positiveEvidenceRequirement:
    "explicit-exact-route-ada-402-binding-or-direct-stair-free-evidence";
  unresolvedPlannerValue: "unknown";
  authority: "conservative-evidence-audit-policy";
};

export type InteriorStairsEvidenceAudit = {
  id: typeof AUDIT_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  operationalStatusAuthorityId:
    typeof OPERATIONAL_STATUS_AUTHORITY_ID;
  accessibilityAuthorityId: typeof ACCESSIBILITY_AUTHORITY_ID;
  sourceSnapshotId: typeof SOURCE_SNAPSHOT_ID;
  policyId: typeof POLICY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayName: "Front Street";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  exactWayHighway: "pedestrian";
  exactWaySurface: "asphalt";
  planner18State: "blocked";
  planner18Reason:
    "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED";
  planner33AccessibilityState:
    "accessible-true-stairs-independent-unresolved";
  zooAccessibilityGuideUrl:
    typeof ZOO_ACCESSIBILITY_GUIDE_URL;
  zooAccessibilityGuideRole:
    "general-accessible-route-context-not-exact-section-402-binding";
  adaStandardUrl: typeof ADA_STANDARD_URL;
  adaStandardSection: "402.2";
  adaStandardRole:
    "semantic-only-until-exact-route-applicability-sourced";
  directStairFreeEvidence: "not-sourced";
  result: "blocked";
  blocker: "EXACT_SEGMENT_STAIRS_NOT_SOURCED";
  strollerAuthorityState:
    "facility-permission-not-route-suitability";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "stairs-evidence-audit-only";
};

export type InteriorStairsAssessment =
  | {
      status: "blocked";
      reason: "EXACT_SEGMENT_STAIRS_NOT_SOURCED";
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      evidenceAuditId: typeof AUDIT_ID;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      stairs: "unknown";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
          "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_STAIRS_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const POLICY_FIELDS = [
  "id",
  "policyVersion",
  "adoptedAt",
  "scope",
  "absenceOfHighwaySteps",
  "pedestrianOrAsphaltClassification",
  "wheelchairAccessibility",
  "generalAccessibleRouteGuidance",
  "adaSection402Semantics",
  "positiveEvidenceRequirement",
  "unresolvedPlannerValue",
  "authority",
] as const;

const AUDIT_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "operationalStatusAuthorityId",
  "accessibilityAuthorityId",
  "sourceSnapshotId",
  "policyId",
  "sourceWayId",
  "sourceWayName",
  "sourceFromNodeId",
  "sourceToNodeId",
  "exactWayHighway",
  "exactWaySurface",
  "planner18State",
  "planner18Reason",
  "planner33AccessibilityState",
  "zooAccessibilityGuideUrl",
  "zooAccessibilityGuideRole",
  "adaStandardUrl",
  "adaStandardSection",
  "adaStandardRole",
  "directStairFreeEvidence",
  "result",
  "blocker",
  "strollerAuthorityState",
  "selectionScope",
  "globalEndpointSelection",
  "plannerMaterialization",
] as const;

const REMAINING_BLOCK_REASONS = Object.freeze([
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
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

function assertExactPlainObject(
  value: unknown,
  allowedFields: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(
      `${label} must be a plain object with Object.prototype.`,
    );
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key === "symbol")) {
    throw new Error(`${label} cannot contain symbol fields.`);
  }

  const expected = new Set(allowedFields);
  const stringKeys = ownKeys as string[];
  const unknown = stringKeys
    .filter((key) => !expected.has(key))
    .sort();
  const missing = allowedFields.filter(
    (key) => !Object.hasOwn(value, key),
  );

  if (unknown.length > 0) {
    throw new Error(
      `${label} cannot contain unknown field ${unknown.join(", ")}.`,
    );
  }
  if (missing.length > 0) {
    throw new Error(
      `${label} is missing required field ${missing.join(", ")}.`,
    );
  }

  for (const field of allowedFields) {
    const descriptor =
      Object.getOwnPropertyDescriptor(value, field);
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `${label} requires enumerable own data field ${field}.`,
      );
    }
  }
}

function assertExactOrdinaryArray(
  value: unknown,
  expectedLength: number,
  label: string,
): asserts value is unknown[] {
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype ||
    value.length !== expectedLength
  ) {
    throw new Error(
      `${label} must be an ordinary array of length ${expectedLength}.`,
    );
  }

  const allowedOwnKeys = new Set([
    ...Array.from(
      { length: expectedLength },
      (_, index) => String(index),
    ),
    "length",
  ]);
  if (
    Reflect.ownKeys(value).some(
      (key) =>
        typeof key !== "string" ||
        !allowedOwnKeys.has(key),
    )
  ) {
    throw new Error(`${label} cannot contain extra own properties.`);
  }
}

function validTimestamp(value: unknown) {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  );
}

function validExactUrl(value: string, expected: string) {
  try {
    return new URL(value).toString() === expected;
  } catch {
    return false;
  }
}

const RAW_POLICY: InteriorStairsEvidenceAuditPolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope:
    "exact-objective-selected-interior-segment-stairs-evidence-audit",
  absenceOfHighwaySteps:
    "insufficient-for-stairs-false",
  pedestrianOrAsphaltClassification:
    "identity-context-only-not-no-stairs-authority",
  wheelchairAccessibility:
    "independent-does-not-establish-stairs",
  generalAccessibleRouteGuidance:
    "does-not-bind-exact-segment-to-ada-402",
  adaSection402Semantics:
    "requires-explicit-exact-route-applicability-before-use",
  positiveEvidenceRequirement:
    "explicit-exact-route-ada-402-binding-or-direct-stair-free-evidence",
  unresolvedPlannerValue: "unknown",
  authority: "conservative-evidence-audit-policy",
};

const accessibility = INTERIOR_ACCESSIBILITY_AUTHORITY[0];
const operational = INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0];
const planner18 = classifyExactStairsAuthority({
  id: SOURCE_SNAPSHOT_ID,
  sourceTags:
    INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags,
});

if (!accessibility || !operational || planner18.status !== "blocked") {
  throw new Error(
    "Planner 35 requires the exact prior segment authorities and blocked Planner 18 stairs state.",
  );
}

const RAW_AUDIT: InteriorStairsEvidenceAudit[] = [
  {
    id: AUDIT_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    operationalStatusAuthorityId:
      OPERATIONAL_STATUS_AUTHORITY_ID,
    accessibilityAuthorityId: ACCESSIBILITY_AUTHORITY_ID,
    sourceSnapshotId: SOURCE_SNAPSHOT_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayName: "Front Street",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    exactWayHighway:
      INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.highway,
    exactWaySurface:
      INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.surface,
    planner18State: "blocked",
    planner18Reason:
      "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
    planner33AccessibilityState:
      "accessible-true-stairs-independent-unresolved",
    zooAccessibilityGuideUrl:
      ZOO_ACCESSIBILITY_GUIDE_URL,
    zooAccessibilityGuideRole:
      "general-accessible-route-context-not-exact-section-402-binding",
    adaStandardUrl: ADA_STANDARD_URL,
    adaStandardSection: "402.2",
    adaStandardRole:
      "semantic-only-until-exact-route-applicability-sourced",
    directStairFreeEvidence: "not-sourced",
    result: "blocked",
    blocker: "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    strollerAuthorityState:
      "facility-permission-not-route-suitability",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization:
      "stairs-evidence-audit-only",
  },
];

export function assertInteriorStairsEvidenceAuditPolicyIntegrity(
  policy: InteriorStairsEvidenceAuditPolicy,
) {
  assertExactPlainObject(
    policy,
    POLICY_FIELDS,
    "Planner 35 stairs evidence-audit policy",
  );

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.adoptedAt !== ADOPTED_AT ||
    !validTimestamp(policy.adoptedAt) ||
    policy.scope !==
      "exact-objective-selected-interior-segment-stairs-evidence-audit" ||
    policy.absenceOfHighwaySteps !==
      "insufficient-for-stairs-false" ||
    policy.pedestrianOrAsphaltClassification !==
      "identity-context-only-not-no-stairs-authority" ||
    policy.wheelchairAccessibility !==
      "independent-does-not-establish-stairs" ||
    policy.generalAccessibleRouteGuidance !==
      "does-not-bind-exact-segment-to-ada-402" ||
    policy.adaSection402Semantics !==
      "requires-explicit-exact-route-applicability-before-use" ||
    policy.positiveEvidenceRequirement !==
      "explicit-exact-route-ada-402-binding-or-direct-stair-free-evidence" ||
    policy.unresolvedPlannerValue !== "unknown" ||
    policy.authority !==
      "conservative-evidence-audit-policy"
  ) {
    throw new Error(
      "Planner 35 stairs evidence-audit policy drifted from its conservative boundary.",
    );
  }
}

export function assertInteriorStairsEvidenceAuditIntegrity(
  audits: readonly InteriorStairsEvidenceAudit[],
) {
  assertInteriorStairsEvidenceAuditPolicyIntegrity(RAW_POLICY);
  assertExactOrdinaryArray(
    audits,
    1,
    "Planner 35 stairs evidence-audit collection",
  );

  const candidate: unknown = audits[0];
  assertExactPlainObject(
    candidate,
    AUDIT_FIELDS,
    "Planner 35 stairs evidence audit",
  );
  const record = candidate as unknown as InteriorStairsEvidenceAudit;

  if (
    "stairs" in candidate ||
    "stroller" in candidate ||
    "provenance" in candidate ||
    "routeEdgeId" in candidate ||
    record.id !== AUDIT_ID ||
    record.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    record.operationalStatusAuthorityId !==
      OPERATIONAL_STATUS_AUTHORITY_ID ||
    record.accessibilityAuthorityId !==
      ACCESSIBILITY_AUTHORITY_ID ||
    record.sourceSnapshotId !== SOURCE_SNAPSHOT_ID ||
    record.policyId !== POLICY_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceWayName !== "Front Street" ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.exactWayHighway !== "pedestrian" ||
    record.exactWaySurface !== "asphalt" ||
    record.planner18State !== "blocked" ||
    record.planner18Reason !==
      "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED" ||
    record.planner33AccessibilityState !==
      "accessible-true-stairs-independent-unresolved" ||
    record.zooAccessibilityGuideUrl !==
      ZOO_ACCESSIBILITY_GUIDE_URL ||
    !validExactUrl(
      record.zooAccessibilityGuideUrl,
      ZOO_ACCESSIBILITY_GUIDE_URL,
    ) ||
    record.zooAccessibilityGuideRole !==
      "general-accessible-route-context-not-exact-section-402-binding" ||
    record.adaStandardUrl !== ADA_STANDARD_URL ||
    !validExactUrl(record.adaStandardUrl, ADA_STANDARD_URL) ||
    record.adaStandardSection !== "402.2" ||
    record.adaStandardRole !==
      "semantic-only-until-exact-route-applicability-sourced" ||
    record.directStairFreeEvidence !== "not-sourced" ||
    record.result !== "blocked" ||
    record.blocker !==
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    record.strollerAuthorityState !==
      "facility-permission-not-route-suitability" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !==
      "stairs-evidence-audit-only"
  ) {
    throw new Error(
      "Planner 35 stairs evidence audit drifted from the frozen exact-segment blocker.",
    );
  }

  if (
    operational.id !== record.operationalStatusAuthorityId ||
    operational.objectiveSourceRecordId !==
      record.objectiveSourceRecordId ||
    operational.sourceWayId !== record.sourceWayId ||
    operational.sourceFromNodeId !==
      record.sourceFromNodeId ||
    operational.sourceToNodeId !==
      record.sourceToNodeId ||
    accessibility.id !== record.accessibilityAuthorityId ||
    accessibility.objectiveSourceRecordId !==
      record.objectiveSourceRecordId ||
    accessibility.sourceWayId !== record.sourceWayId ||
    accessibility.sourceWayName !== record.sourceWayName ||
    accessibility.sourceFromNodeId !==
      record.sourceFromNodeId ||
    accessibility.sourceToNodeId !==
      record.sourceToNodeId ||
    accessibility.accessible !== true ||
    accessibility.stairsAuthorityState !==
      "independent-unresolved"
  ) {
    throw new Error(
      "Planner 35 stairs evidence audit detached from the qualified exact segment or Planner 33 unresolved-stairs boundary.",
    );
  }

  const currentPlanner18 = classifyExactStairsAuthority({
    id: record.sourceSnapshotId,
    sourceTags:
      INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags,
  });
  if (
    currentPlanner18.status !== "blocked" ||
    currentPlanner18.reason !== record.planner18Reason
  ) {
    throw new Error(
      "Planner 35 requires Planner 18 to remain blocked on the exact source snapshot.",
    );
  }
}

assertInteriorStairsEvidenceAuditPolicyIntegrity(RAW_POLICY);
assertInteriorStairsEvidenceAuditIntegrity(RAW_AUDIT);

export const INTERIOR_STAIRS_EVIDENCE_AUDIT_POLICY:
  InteriorStairsEvidenceAuditPolicy = deepFreeze(RAW_POLICY);

export const INTERIOR_STAIRS_EVIDENCE_AUDIT:
  readonly InteriorStairsEvidenceAudit[] =
  deepFreeze(RAW_AUDIT);

export function interiorStairsEvidenceAuditForObjective(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_STAIRS_EVIDENCE_AUDIT.find(
    (record) =>
      record.objectiveSourceRecordId ===
      objectiveSourceRecordId,
  );
}

export function assessInteriorStairs(
  objectiveSourceRecordId: string,
): InteriorStairsAssessment {
  const audit =
    interiorStairsEvidenceAuditForObjective(
      objectiveSourceRecordId,
    );

  if (!audit) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_STAIRS_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }

  return deepFreeze({
    status: "blocked",
    reason: "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    objectiveSourceRecordId:
      OBJECTIVE_SOURCE_RECORD_ID,
    evidenceAuditId: audit.id,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    stairs: "unknown",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS] as const,
    },
  });
}
