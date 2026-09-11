import {
  INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE,
  INGRESS_STROLLER_FACILITY_POLICY,
} from "./zooIngressMobilityAuthority.ts";
import {
  INTERIOR_DIFFICULTY_AUTHORITY,
} from "./zooInteriorDifficultyAuthority.ts";

const POLICY_ID = "sdz-interior-accessibility-policy-v1" as const;
const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-accessibility" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const DIFFICULTY_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-difficulty" as const;
const CORRIDOR_ACCESSIBILITY_EVIDENCE_ID =
  "sdz-accessibility-front-street-wheelchair-indicator" as const;
const CORRIDOR_ID = "sdz-corridor-front-street" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const ADOPTED_AT = "2026-09-11T09:30:00-07:00" as const;

export type InteriorAccessibilityPolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope: "exact-segments-with-exact-named-accessibility-corridor-match";
  supportedWheelchairIndicator: "shown";
  supportedMapRouteLegend: "ADA MOST ACCESSIBLE ROUTE";
  plannerAccessible: true;
  corridorProjectionRequirement:
    "exact-source-way-name-must-equal-official-corridor-name";
  exactSegmentRequirement:
    "qualified-endpoints-must-remain-on-that-source-way";
  strollerSemantics:
    "independent-facility-permission-does-not-establish-route-suitability";
  stairsSemantics: "independent-unresolved";
  authority: "prospective-product-semantic-policy";
};

export type NamedCorridorAccessibilityClassification =
  | {
      status: "supported";
      accessible: true;
      basis:
        "official-wheelchair-indicator-on-exact-name-matched-ada-corridor";
    }
  | {
      status: "blocked";
      reason:
        | "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH"
        | "ACCESSIBILITY_EVIDENCE_NOT_MAPPED_BY_POLICY";
    };

export type InteriorAccessibilityAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  difficultyAuthorityId: typeof DIFFICULTY_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  corridorAccessibilityEvidenceId:
    typeof CORRIDOR_ACCESSIBILITY_EVIDENCE_ID;
  corridorId: typeof CORRIDOR_ID;
  corridorName: "Front Street";
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayName: "Front Street";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  wheelchairIndicator: "shown";
  mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE";
  accessible: true;
  resolutionBasis:
    "official-wheelchair-indicator-on-exact-name-matched-ada-corridor";
  stairsAuthorityState: "independent-unresolved";
  strollerAuthorityState: "facility-permission-not-route-suitability";
  operationalEligibility: "unresolved";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "accessibility-only";
};

export type InteriorAccessibilityAssessment =
  | {
      status: "accessibility-ready";
      objectiveSourceRecordId: string;
      sourceFromNodeId: string;
      sourceToNodeId: string;
      accessible: true;
      stairsAuthorityState: "independent-unresolved";
      strollerAuthorityState: "facility-permission-not-route-suitability";
      operationalEligibility: "unresolved";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
          "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
          "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_ACCESSIBILITY_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const POLICY_FIELDS = [
  "id",
  "policyVersion",
  "adoptedAt",
  "scope",
  "supportedWheelchairIndicator",
  "supportedMapRouteLegend",
  "plannerAccessible",
  "corridorProjectionRequirement",
  "exactSegmentRequirement",
  "strollerSemantics",
  "stairsSemantics",
  "authority",
] as const;

const AUTHORITY_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "difficultyAuthorityId",
  "policyId",
  "corridorAccessibilityEvidenceId",
  "corridorId",
  "corridorName",
  "sourceWayId",
  "sourceWayName",
  "sourceFromNodeId",
  "sourceToNodeId",
  "wheelchairIndicator",
  "mapRouteLegend",
  "accessible",
  "resolutionBasis",
  "stairsAuthorityState",
  "strollerAuthorityState",
  "operationalEligibility",
  "selectionScope",
  "globalEndpointSelection",
  "plannerMaterialization",
] as const;

const FORBIDDEN_UNOWNED_FIELDS = [
  "stroller",
  "stairs",
  "oneWay",
  "status",
  "routeNodeId",
  "provenance",
  "globalEndpointNodeId",
] as const;

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
  "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
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
    throw new Error(`${label} must be a plain object with Object.prototype.`);
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key === "symbol")) {
    throw new Error(`${label} cannot contain symbol fields.`);
  }

  const expected = new Set(allowedFields);
  const stringKeys = ownKeys as string[];
  const unknown = stringKeys.filter((key) => !expected.has(key)).sort();
  const missing = allowedFields.filter((key) => !Object.hasOwn(value, key));
  if (unknown.length > 0) {
    throw new Error(`${label} cannot contain unknown field ${unknown.join(", ")}.`);
  }
  if (missing.length > 0) {
    throw new Error(`${label} is missing required field ${missing.join(", ")}.`);
  }

  for (const field of allowedFields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data field ${field}.`);
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
    throw new Error(`${label} must be an ordinary array of length ${expectedLength}.`);
  }

  const allowedOwnKeys = new Set([
    ...Array.from({ length: expectedLength }, (_, index) => String(index)),
    "length",
  ]);
  if (
    Reflect.ownKeys(value).some(
      (key) => typeof key !== "string" || !allowedOwnKeys.has(key),
    )
  ) {
    throw new Error(`${label} cannot contain extra own properties.`);
  }

  for (let index = 0; index < expectedLength; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data element ${index}.`);
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

const RAW_POLICY: InteriorAccessibilityPolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope: "exact-segments-with-exact-named-accessibility-corridor-match",
  supportedWheelchairIndicator: "shown",
  supportedMapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
  plannerAccessible: true,
  corridorProjectionRequirement:
    "exact-source-way-name-must-equal-official-corridor-name",
  exactSegmentRequirement:
    "qualified-endpoints-must-remain-on-that-source-way",
  strollerSemantics:
    "independent-facility-permission-does-not-establish-route-suitability",
  stairsSemantics: "independent-unresolved",
  authority: "prospective-product-semantic-policy",
};

const RAW_AUTHORITY: InteriorAccessibilityAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    difficultyAuthorityId: DIFFICULTY_AUTHORITY_ID,
    policyId: POLICY_ID,
    corridorAccessibilityEvidenceId: CORRIDOR_ACCESSIBILITY_EVIDENCE_ID,
    corridorId: CORRIDOR_ID,
    corridorName: "Front Street",
    sourceWayId: SOURCE_WAY_ID,
    sourceWayName: "Front Street",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    wheelchairIndicator: "shown",
    mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
    accessible: true,
    resolutionBasis:
      "official-wheelchair-indicator-on-exact-name-matched-ada-corridor",
    stairsAuthorityState: "independent-unresolved",
    strollerAuthorityState: "facility-permission-not-route-suitability",
    operationalEligibility: "unresolved",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "accessibility-only",
  },
];

export function classifyNamedCorridorAccessibility(input: {
  corridorName: string;
  exactSourceWayName: string;
  wheelchairIndicator: string;
  mapRouteLegend: string;
}): NamedCorridorAccessibilityClassification {
  if (input.exactSourceWayName !== input.corridorName) {
    return {
      status: "blocked",
      reason: "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH",
    };
  }

  if (
    input.wheelchairIndicator !== "shown" ||
    input.mapRouteLegend !== "ADA MOST ACCESSIBLE ROUTE"
  ) {
    return {
      status: "blocked",
      reason: "ACCESSIBILITY_EVIDENCE_NOT_MAPPED_BY_POLICY",
    };
  }

  return {
    status: "supported",
    accessible: true,
    basis:
      "official-wheelchair-indicator-on-exact-name-matched-ada-corridor",
  };
}

export function assertInteriorAccessibilityPolicyIntegrity(
  policy: InteriorAccessibilityPolicy,
) {
  assertExactPlainObject(policy, POLICY_FIELDS, "Planner 33 accessibility policy");
  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.adoptedAt !== ADOPTED_AT ||
    !validTimestamp(policy.adoptedAt) ||
    policy.scope !==
      "exact-segments-with-exact-named-accessibility-corridor-match" ||
    policy.supportedWheelchairIndicator !== "shown" ||
    policy.supportedMapRouteLegend !== "ADA MOST ACCESSIBLE ROUTE" ||
    policy.plannerAccessible !== true ||
    policy.corridorProjectionRequirement !==
      "exact-source-way-name-must-equal-official-corridor-name" ||
    policy.exactSegmentRequirement !==
      "qualified-endpoints-must-remain-on-that-source-way" ||
    policy.strollerSemantics !==
      "independent-facility-permission-does-not-establish-route-suitability" ||
    policy.stairsSemantics !== "independent-unresolved" ||
    policy.authority !== "prospective-product-semantic-policy"
  ) {
    throw new Error(
      "Planner 33 accessibility policy drifted from the frozen semantic boundary.",
    );
  }
}

export function assertInteriorAccessibilityAuthorityIntegrity(
  authorities: readonly InteriorAccessibilityAuthority[],
) {
  assertInteriorAccessibilityPolicyIntegrity(RAW_POLICY);
  assertExactOrdinaryArray(
    authorities,
    1,
    "Planner 33 accessibility authority collection",
  );
  const candidate: unknown = authorities[0];
  assertExactPlainObject(
    candidate,
    AUTHORITY_FIELDS,
    "Planner 33 accessibility authority",
  );

  for (const field of FORBIDDEN_UNOWNED_FIELDS) {
    if (field in candidate) {
      throw new Error(
        `Planner 33 accessibility authority cannot own field ${field}.`,
      );
    }
  }

  const record = candidate as unknown as InteriorAccessibilityAuthority;
  const difficulty = INTERIOR_DIFFICULTY_AUTHORITY.find(
    (entry) => entry.id === record.difficultyAuthorityId,
  );
  const corridorEvidence = INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE.find(
    (entry) => entry.id === record.corridorAccessibilityEvidenceId,
  );
  const classification = classifyNamedCorridorAccessibility({
    corridorName: record.corridorName,
    exactSourceWayName: record.sourceWayName,
    wheelchairIndicator: record.wheelchairIndicator,
    mapRouteLegend: record.mapRouteLegend,
  });

  if (
    record.id !== AUTHORITY_ID ||
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.difficultyAuthorityId !== DIFFICULTY_AUTHORITY_ID ||
    record.policyId !== POLICY_ID ||
    record.corridorAccessibilityEvidenceId !==
      CORRIDOR_ACCESSIBILITY_EVIDENCE_ID ||
    record.corridorId !== CORRIDOR_ID ||
    record.corridorName !== "Front Street" ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceWayName !== "Front Street" ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.wheelchairIndicator !== "shown" ||
    record.mapRouteLegend !== "ADA MOST ACCESSIBLE ROUTE" ||
    record.accessible !== true ||
    record.resolutionBasis !==
      "official-wheelchair-indicator-on-exact-name-matched-ada-corridor" ||
    record.stairsAuthorityState !== "independent-unresolved" ||
    record.strollerAuthorityState !==
      "facility-permission-not-route-suitability" ||
    record.operationalEligibility !== "unresolved" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !== "accessibility-only"
  ) {
    throw new Error(
      "Planner 33 accessibility authority drifted from the frozen exact-segment contract.",
    );
  }

  if (
    !difficulty ||
    difficulty.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    difficulty.corridorId !== record.corridorId ||
    difficulty.corridorName !== record.corridorName ||
    difficulty.sourceWayId !== record.sourceWayId ||
    difficulty.sourceWayName !== record.sourceWayName ||
    difficulty.sourceFromNodeId !== record.sourceFromNodeId ||
    difficulty.sourceToNodeId !== record.sourceToNodeId ||
    difficulty.stairsAuthorityState !== "independent-unresolved" ||
    difficulty.operationalEligibility !== "unresolved" ||
    difficulty.selectionScope !== "objective-only" ||
    difficulty.globalEndpointSelection !== "unresolved"
  ) {
    throw new Error(
      "Planner 33 accessibility authority detached from Planner 32 exact segment.",
    );
  }

  if (
    !corridorEvidence ||
    corridorEvidence.corridorId !== record.corridorId ||
    corridorEvidence.corridorName !== record.corridorName ||
    corridorEvidence.wheelchairIndicator !== record.wheelchairIndicator ||
    corridorEvidence.mapRouteLegend !== record.mapRouteLegend ||
    corridorEvidence.scope !== "named-corridor" ||
    corridorEvidence.plannerMaterialization !==
      "corridor-accessibility-evidence-only"
  ) {
    throw new Error(
      "Planner 33 accessibility authority detached from Planner 17 corridor evidence.",
    );
  }

  if (
    INGRESS_STROLLER_FACILITY_POLICY.scope !== "facility-policy" ||
    INGRESS_STROLLER_FACILITY_POLICY.strollerPolicy !== "allowed" ||
    INGRESS_STROLLER_FACILITY_POLICY.routeSuitabilityAuthority !==
      "not-established" ||
    INGRESS_STROLLER_FACILITY_POLICY.plannerMaterialization !==
      "facility-stroller-policy-only"
  ) {
    throw new Error(
      "Planner 33 requires Planner 17 stroller evidence to remain facility-only and non-route-authoritative.",
    );
  }

  if (
    classification.status !== "supported" ||
    classification.accessible !== record.accessible ||
    classification.basis !== record.resolutionBasis
  ) {
    throw new Error(
      "Planner 33 accessibility does not reproduce from the frozen semantic policy.",
    );
  }
}

assertInteriorAccessibilityPolicyIntegrity(RAW_POLICY);
assertInteriorAccessibilityAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_ACCESSIBILITY_POLICY: InteriorAccessibilityPolicy =
  deepFreeze(RAW_POLICY);

export const INTERIOR_ACCESSIBILITY_AUTHORITY:
  readonly InteriorAccessibilityAuthority[] = deepFreeze(RAW_AUTHORITY);

export function interiorAccessibilityForObjective(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_ACCESSIBILITY_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorAccessibility(
  objectiveSourceRecordId: string,
): InteriorAccessibilityAssessment {
  const accessibility = interiorAccessibilityForObjective(
    objectiveSourceRecordId,
  );
  if (!accessibility) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_ACCESSIBILITY_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }

  return deepFreeze({
    status: "accessibility-ready",
    objectiveSourceRecordId: accessibility.objectiveSourceRecordId,
    sourceFromNodeId: accessibility.sourceFromNodeId,
    sourceToNodeId: accessibility.sourceToNodeId,
    accessible: accessibility.accessible,
    stairsAuthorityState: accessibility.stairsAuthorityState,
    strollerAuthorityState: accessibility.strollerAuthorityState,
    operationalEligibility: accessibility.operationalEligibility,
    selectionScope: accessibility.selectionScope,
    globalEndpointSelection: accessibility.globalEndpointSelection,
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
