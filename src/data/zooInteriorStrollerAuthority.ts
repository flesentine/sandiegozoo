import {
  INGRESS_STROLLER_FACILITY_POLICY,
} from "./zooIngressMobilityAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorAccessibilityAuthority.ts";
import {
  INTERIOR_STAIRS_EVIDENCE_AUDIT,
} from "./zooInteriorStairsAuthority.ts";

const POLICY_ID =
  "sdz-interior-stroller-evidence-audit-policy-v1" as const;
const AUDIT_ID =
  "sdz-interior-tiger-trail-front-street-stroller-evidence-audit" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const STAIRS_EVIDENCE_AUDIT_ID =
  "sdz-interior-tiger-trail-front-street-stairs-evidence-audit" as const;
const ACCESSIBILITY_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-accessibility" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const ADOPTED_AT = "2026-09-13T12:05:00-07:00" as const;
const ZOO_ACCESSIBILITY_GUIDE_URL =
  "https://sdzwa.org/sdzwa-accessibility-guide" as const;
const ZOO_ACCESSIBILITY_GUIDE_LABEL =
  "San Diego Zoo Wildlife Alliance Accessibility Guide 2026" as const;

export type InteriorStrollerEvidenceAuditPolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope:
    "exact-objective-selected-interior-segment-stroller-evidence-audit";
  facilityPermission:
    "insufficient-for-exact-route-suitability";
  wheelchairTaggedStrollerTreatment:
    "accessibility-device-special-case-not-generic-stroller-authority";
  wheelchairAccessibility:
    "does-not-establish-generic-stroller-suitability";
  unresolvedStairs:
    "cannot-be-treated-as-stroller-compatible";
  positiveEvidenceRequirement:
    "direct-exact-segment-generic-stroller-suitability-or-explicit-all-strollers-route-binding";
  unresolvedPlannerValue: "unknown";
  authority: "conservative-evidence-audit-policy";
};

export type StrollerAccessibilityGuideEvidence = {
  sourceUrl: typeof ZOO_ACCESSIBILITY_GUIDE_URL;
  sourceLabel: typeof ZOO_ACCESSIBILITY_GUIDE_LABEL;
  observedAt: typeof ADOPTED_AT;
  childStrollerAccessibilityDevicePolicy:
    "wheelchair-tag-available-when-child-cannot-transfer";
  mobilityDeviceMapAdvisement:
    "consult-accessibility-map-or-app-and-signs";
  evidenceScope: "accessibility-device-specific";
  genericStrollerRouteSuitabilityAuthority:
    "not-established";
};

export type InteriorStrollerEvidenceAudit = {
  id: typeof AUDIT_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  stairsEvidenceAuditId: typeof STAIRS_EVIDENCE_AUDIT_ID;
  accessibilityAuthorityId: typeof ACCESSIBILITY_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayName: "Front Street";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  facilityStrollerPolicyId: string;
  facilityStrollerPolicy: "allowed";
  facilityRouteSuitabilityAuthority: "not-established";
  exactAccessibilityState:
    "accessible-true-stroller-independent-unresolved";
  exactStairsState: "unknown";
  accessibilityGuideEvidence:
    StrollerAccessibilityGuideEvidence;
  directGenericStrollerRouteEvidence: "not-sourced";
  result: "blocked";
  blocker: "EXACT_SEGMENT_STROLLER_NOT_SOURCED";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization:
    "stroller-evidence-audit-only";
};

export type InteriorStrollerAssessment =
  | {
      status: "blocked";
      reason: "EXACT_SEGMENT_STROLLER_NOT_SOURCED";
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      evidenceAuditId: typeof AUDIT_ID;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      stroller: "unknown";
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
      reason: "OBJECTIVE_STROLLER_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const POLICY_FIELDS = [
  "id",
  "policyVersion",
  "adoptedAt",
  "scope",
  "facilityPermission",
  "wheelchairTaggedStrollerTreatment",
  "wheelchairAccessibility",
  "unresolvedStairs",
  "positiveEvidenceRequirement",
  "unresolvedPlannerValue",
  "authority",
] as const;

const GUIDE_FIELDS = [
  "sourceUrl",
  "sourceLabel",
  "observedAt",
  "childStrollerAccessibilityDevicePolicy",
  "mobilityDeviceMapAdvisement",
  "evidenceScope",
  "genericStrollerRouteSuitabilityAuthority",
] as const;

const AUDIT_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "stairsEvidenceAuditId",
  "accessibilityAuthorityId",
  "policyId",
  "sourceWayId",
  "sourceWayName",
  "sourceFromNodeId",
  "sourceToNodeId",
  "facilityStrollerPolicyId",
  "facilityStrollerPolicy",
  "facilityRouteSuitabilityAuthority",
  "exactAccessibilityState",
  "exactStairsState",
  "accessibilityGuideEvidence",
  "directGenericStrollerRouteEvidence",
  "result",
  "blocker",
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

  for (let index = 0; index < expectedLength; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(
      value,
      String(index),
    );
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `${label} requires enumerable own data element ${index}.`,
      );
    }
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

const RAW_POLICY: InteriorStrollerEvidenceAuditPolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope:
    "exact-objective-selected-interior-segment-stroller-evidence-audit",
  facilityPermission:
    "insufficient-for-exact-route-suitability",
  wheelchairTaggedStrollerTreatment:
    "accessibility-device-special-case-not-generic-stroller-authority",
  wheelchairAccessibility:
    "does-not-establish-generic-stroller-suitability",
  unresolvedStairs:
    "cannot-be-treated-as-stroller-compatible",
  positiveEvidenceRequirement:
    "direct-exact-segment-generic-stroller-suitability-or-explicit-all-strollers-route-binding",
  unresolvedPlannerValue: "unknown",
  authority: "conservative-evidence-audit-policy",
};

const accessibility = INTERIOR_ACCESSIBILITY_AUTHORITY[0];
const stairsAudit = INTERIOR_STAIRS_EVIDENCE_AUDIT[0];

if (!accessibility || !stairsAudit) {
  throw new Error(
    "Planner 36 requires the exact prior accessibility and stairs evidence authorities.",
  );
}

const RAW_GUIDE_EVIDENCE: StrollerAccessibilityGuideEvidence = {
  sourceUrl: ZOO_ACCESSIBILITY_GUIDE_URL,
  sourceLabel: ZOO_ACCESSIBILITY_GUIDE_LABEL,
  observedAt: ADOPTED_AT,
  childStrollerAccessibilityDevicePolicy:
    "wheelchair-tag-available-when-child-cannot-transfer",
  mobilityDeviceMapAdvisement:
    "consult-accessibility-map-or-app-and-signs",
  evidenceScope: "accessibility-device-specific",
  genericStrollerRouteSuitabilityAuthority:
    "not-established",
};

const RAW_AUDIT: InteriorStrollerEvidenceAudit[] = [
  {
    id: AUDIT_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    stairsEvidenceAuditId: STAIRS_EVIDENCE_AUDIT_ID,
    accessibilityAuthorityId: ACCESSIBILITY_AUTHORITY_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayName: "Front Street",
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
    accessibilityGuideEvidence: RAW_GUIDE_EVIDENCE,
    directGenericStrollerRouteEvidence: "not-sourced",
    result: "blocked",
    blocker: "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization:
      "stroller-evidence-audit-only",
  },
];

export function assertInteriorStrollerEvidenceAuditPolicyIntegrity(
  policy: InteriorStrollerEvidenceAuditPolicy,
) {
  assertExactPlainObject(
    policy,
    POLICY_FIELDS,
    "Planner 36 stroller evidence-audit policy",
  );

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.adoptedAt !== ADOPTED_AT ||
    !validTimestamp(policy.adoptedAt) ||
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
    policy.authority !==
      "conservative-evidence-audit-policy"
  ) {
    throw new Error(
      "Planner 36 stroller evidence-audit policy drifted from its conservative boundary.",
    );
  }
}

function assertAccessibilityGuideEvidenceIntegrity(
  evidence: StrollerAccessibilityGuideEvidence,
) {
  assertExactPlainObject(
    evidence,
    GUIDE_FIELDS,
    "Planner 36 stroller accessibility-guide evidence",
  );

  if (
    !validExactUrl(
      evidence.sourceUrl,
      ZOO_ACCESSIBILITY_GUIDE_URL,
    ) ||
    evidence.sourceLabel !==
      ZOO_ACCESSIBILITY_GUIDE_LABEL ||
    evidence.observedAt !== ADOPTED_AT ||
    !validTimestamp(evidence.observedAt) ||
    evidence.childStrollerAccessibilityDevicePolicy !==
      "wheelchair-tag-available-when-child-cannot-transfer" ||
    evidence.mobilityDeviceMapAdvisement !==
      "consult-accessibility-map-or-app-and-signs" ||
    evidence.evidenceScope !==
      "accessibility-device-specific" ||
    evidence.genericStrollerRouteSuitabilityAuthority !==
      "not-established"
  ) {
    throw new Error(
      "Planner 36 stroller accessibility-guide evidence drifted from the qualified source boundary.",
    );
  }
}

export function assertInteriorStrollerEvidenceAuditIntegrity(
  audits: readonly InteriorStrollerEvidenceAudit[],
) {
  assertInteriorStrollerEvidenceAuditPolicyIntegrity(RAW_POLICY);
  assertExactOrdinaryArray(
    audits,
    1,
    "Planner 36 stroller evidence-audit collection",
  );

  const candidate: unknown = audits[0];
  assertExactPlainObject(
    candidate,
    AUDIT_FIELDS,
    "Planner 36 stroller evidence audit",
  );
  const record =
    candidate as unknown as InteriorStrollerEvidenceAudit;

  if (
    "stroller" in candidate ||
    "stairs" in candidate ||
    "provenance" in candidate ||
    "routeEdgeId" in candidate ||
    record.id !== AUDIT_ID ||
    record.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    record.stairsEvidenceAuditId !==
      STAIRS_EVIDENCE_AUDIT_ID ||
    record.accessibilityAuthorityId !==
      ACCESSIBILITY_AUTHORITY_ID ||
    record.policyId !== POLICY_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceWayName !== "Front Street" ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.facilityStrollerPolicyId !==
      INGRESS_STROLLER_FACILITY_POLICY.id ||
    record.facilityStrollerPolicy !== "allowed" ||
    record.facilityRouteSuitabilityAuthority !==
      "not-established" ||
    record.exactAccessibilityState !==
      "accessible-true-stroller-independent-unresolved" ||
    record.exactStairsState !== "unknown" ||
    record.directGenericStrollerRouteEvidence !==
      "not-sourced" ||
    record.result !== "blocked" ||
    record.blocker !==
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !==
      "stroller-evidence-audit-only"
  ) {
    throw new Error(
      "Planner 36 stroller evidence audit drifted from its blocker-preserving boundary.",
    );
  }

  assertAccessibilityGuideEvidenceIntegrity(
    record.accessibilityGuideEvidence,
  );

  if (
    stairsAudit.id !== record.stairsEvidenceAuditId ||
    stairsAudit.objectiveSourceRecordId !==
      record.objectiveSourceRecordId ||
    stairsAudit.sourceWayId !== record.sourceWayId ||
    stairsAudit.sourceWayName !== record.sourceWayName ||
    stairsAudit.sourceFromNodeId !==
      record.sourceFromNodeId ||
    stairsAudit.sourceToNodeId !==
      record.sourceToNodeId ||
    stairsAudit.result !== "blocked" ||
    stairsAudit.blocker !==
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
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
    accessibility.strollerAuthorityState !==
      "facility-permission-not-route-suitability"
  ) {
    throw new Error(
      "Planner 36 stroller evidence audit detached from the qualified exact segment or prior unresolved stroller/stairs boundaries.",
    );
  }
}

assertInteriorStrollerEvidenceAuditPolicyIntegrity(RAW_POLICY);
assertAccessibilityGuideEvidenceIntegrity(RAW_GUIDE_EVIDENCE);
assertInteriorStrollerEvidenceAuditIntegrity(RAW_AUDIT);

export const INTERIOR_STROLLER_EVIDENCE_AUDIT_POLICY:
  InteriorStrollerEvidenceAuditPolicy = deepFreeze(RAW_POLICY);

export const INTERIOR_STROLLER_ACCESSIBILITY_GUIDE_EVIDENCE:
  StrollerAccessibilityGuideEvidence =
  deepFreeze(RAW_GUIDE_EVIDENCE);

export const INTERIOR_STROLLER_EVIDENCE_AUDIT:
  readonly InteriorStrollerEvidenceAudit[] =
  deepFreeze(RAW_AUDIT);

export function interiorStrollerEvidenceAuditForObjective(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_STROLLER_EVIDENCE_AUDIT.find(
    (record) =>
      record.objectiveSourceRecordId ===
      objectiveSourceRecordId,
  );
}

export function assessInteriorStroller(
  objectiveSourceRecordId: string,
): InteriorStrollerAssessment {
  const audit =
    interiorStrollerEvidenceAuditForObjective(
      objectiveSourceRecordId,
    );

  if (!audit) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_STROLLER_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }

  return deepFreeze({
    status: "blocked",
    reason: "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
    objectiveSourceRecordId:
      OBJECTIVE_SOURCE_RECORD_ID,
    evidenceAuditId: audit.id,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    stroller: "unknown",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS] as const,
    },
  });
}
