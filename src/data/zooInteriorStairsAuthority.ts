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

const POLICY_ID = "sdz-interior-stairs-policy-v2" as const;
const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-stairs" as const;
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
const ADA_STANDARD_URL =
  "https://www.ada.gov/assets/pdfs/2010-design-standards.pdf" as const;
const ADA_STANDARD_SECTION = "402.2" as const;
const ADA_STAIRS_SEMANTIC =
  "stairs-not-an-accessible-route-component" as const;

export type InteriorStairsPolicy = {
  id: typeof POLICY_ID;
  policyVersion: "2";
  adoptedAt: typeof ADOPTED_AT;
  scope:
    "exact-segment-with-qualified-ada-accessible-route-semantic";
  exactWayIdentityRequirement:
    "pedestrian-asphalt-front-street-source-context";
  exactWayIdentityRole:
    "identity-context-only-not-no-stairs-authority";
  exactWayNameRequirement:
    "must-equal-qualified-accessibility-source-way-name";
  accessibilityRequirement:
    "exact-segment-must-already-be-accessible-true";
  wheelchairIndicatorRequirement: "shown";
  mapRouteLegendRequirement: "ADA MOST ACCESSIBLE ROUTE";
  adaStandardReferenceUrl: typeof ADA_STANDARD_URL;
  adaStandardSection: typeof ADA_STANDARD_SECTION;
  accessibleRouteStairsSemantics: typeof ADA_STAIRS_SEMANTIC;
  absenceOfHighwayStepsAlone:
    "insufficient-for-stairs-false";
  plannerStairs: false;
  authority: "prospective-product-semantic-policy";
};

export type InteriorStairsClassificationInput = {
  exactWayHighway: string;
  exactWaySurface: string;
  exactWayName: string;
  accessibilitySourceWayName: string;
  accessible: boolean;
  wheelchairIndicator: string;
  mapRouteLegend: string;
  adaStandardReferenceUrl: string;
  adaStandardSection: string;
  accessibleRouteStairsSemantics: string;
};

export type InteriorStairsClassification =
  | {
      status: "supported";
      stairs: false;
      basis:
        "qualified-exact-accessible-route-plus-ada-402-2-no-stairs-component-semantic";
    }
  | {
      status: "blocked";
      reason:
        | "EXACT_WAY_IDENTITY_CONTEXT_NOT_MET"
        | "ACCESSIBILITY_SOURCE_NAME_NOT_EXACT_SOURCE_WAY_MATCH"
        | "ACCESSIBILITY_PREREQUISITE_NOT_MET"
        | "ACCESSIBLE_ROUTE_STANDARD_PREREQUISITE_NOT_MET";
    };

export type InteriorStairsAuthority = {
  id: typeof AUTHORITY_ID;
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
  wheelchairIndicator: "shown";
  mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE";
  adaStandardReferenceUrl: typeof ADA_STANDARD_URL;
  adaStandardSection: typeof ADA_STANDARD_SECTION;
  accessibleRouteStairsSemantics: typeof ADA_STAIRS_SEMANTIC;
  stairs: false;
  resolutionBasis:
    "qualified-exact-accessible-route-plus-ada-402-2-no-stairs-component-semantic";
  absenceOfHighwayStepsRole:
    "non-authoritative-supporting-context-only";
  exactWayIdentityRole:
    "identity-context-only-not-no-stairs-authority";
  strollerAuthorityState:
    "facility-permission-not-route-suitability";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "stairs-only";
};

export type InteriorStairsAssessment =
  | {
      status: "stairs-ready";
      objectiveSourceRecordId: string;
      sourceFromNodeId: string;
      sourceToNodeId: string;
      stairs: false;
      strollerAuthorityState:
        "facility-permission-not-route-suitability";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
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
  "exactWayIdentityRequirement",
  "exactWayIdentityRole",
  "exactWayNameRequirement",
  "accessibilityRequirement",
  "wheelchairIndicatorRequirement",
  "mapRouteLegendRequirement",
  "adaStandardReferenceUrl",
  "adaStandardSection",
  "accessibleRouteStairsSemantics",
  "absenceOfHighwayStepsAlone",
  "plannerStairs",
  "authority",
] as const;

const AUTHORITY_FIELDS = [
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
  "wheelchairIndicator",
  "mapRouteLegend",
  "adaStandardReferenceUrl",
  "adaStandardSection",
  "accessibleRouteStairsSemantics",
  "stairs",
  "resolutionBasis",
  "absenceOfHighwayStepsRole",
  "exactWayIdentityRole",
  "strollerAuthorityState",
  "selectionScope",
  "globalEndpointSelection",
  "plannerMaterialization",
] as const;

const FORBIDDEN_UNOWNED_FIELDS = [
  "stroller",
  "status",
  "routeNodeId",
  "routeEdgeId",
  "provenance",
  "globalEndpointNodeId",
] as const;

const REMAINING_BLOCK_REASONS = Object.freeze([
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

  for (
    let index = 0;
    index < expectedLength;
    index += 1
  ) {
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

function validAdaStandardsUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.ada.gov" &&
      url.pathname === "/assets/pdfs/2010-design-standards.pdf"
    );
  } catch {
    return false;
  }
}

export function classifyInteriorStairs(
  input: InteriorStairsClassificationInput,
): InteriorStairsClassification {
  if (
    input.exactWayHighway !== "pedestrian" ||
    input.exactWaySurface !== "asphalt" ||
    input.exactWayName !== "Front Street"
  ) {
    return {
      status: "blocked",
      reason: "EXACT_WAY_IDENTITY_CONTEXT_NOT_MET",
    };
  }

  if (
    input.exactWayName !== input.accessibilitySourceWayName
  ) {
    return {
      status: "blocked",
      reason:
        "ACCESSIBILITY_SOURCE_NAME_NOT_EXACT_SOURCE_WAY_MATCH",
    };
  }

  if (
    input.accessible !== true ||
    input.wheelchairIndicator !== "shown" ||
    input.mapRouteLegend !== "ADA MOST ACCESSIBLE ROUTE"
  ) {
    return {
      status: "blocked",
      reason: "ACCESSIBILITY_PREREQUISITE_NOT_MET",
    };
  }

  if (
    input.adaStandardReferenceUrl !== ADA_STANDARD_URL ||
    !validAdaStandardsUrl(input.adaStandardReferenceUrl) ||
    input.adaStandardSection !== ADA_STANDARD_SECTION ||
    input.accessibleRouteStairsSemantics !==
      ADA_STAIRS_SEMANTIC
  ) {
    return {
      status: "blocked",
      reason:
        "ACCESSIBLE_ROUTE_STANDARD_PREREQUISITE_NOT_MET",
    };
  }

  return {
    status: "supported",
    stairs: false,
    basis:
      "qualified-exact-accessible-route-plus-ada-402-2-no-stairs-component-semantic",
  };
}

const RAW_POLICY: InteriorStairsPolicy = {
  id: POLICY_ID,
  policyVersion: "2",
  adoptedAt: ADOPTED_AT,
  scope:
    "exact-segment-with-qualified-ada-accessible-route-semantic",
  exactWayIdentityRequirement:
    "pedestrian-asphalt-front-street-source-context",
  exactWayIdentityRole:
    "identity-context-only-not-no-stairs-authority",
  exactWayNameRequirement:
    "must-equal-qualified-accessibility-source-way-name",
  accessibilityRequirement:
    "exact-segment-must-already-be-accessible-true",
  wheelchairIndicatorRequirement: "shown",
  mapRouteLegendRequirement: "ADA MOST ACCESSIBLE ROUTE",
  adaStandardReferenceUrl: ADA_STANDARD_URL,
  adaStandardSection: ADA_STANDARD_SECTION,
  accessibleRouteStairsSemantics: ADA_STAIRS_SEMANTIC,
  absenceOfHighwayStepsAlone:
    "insufficient-for-stairs-false",
  plannerStairs: false,
  authority: "prospective-product-semantic-policy",
};

const accessibility =
  INTERIOR_ACCESSIBILITY_AUTHORITY[0];

if (!accessibility) {
  throw new Error(
    "Planner 35 requires the qualified Planner 33 accessibility authority.",
  );
}

const RAW_AUTHORITY: InteriorStairsAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    operationalStatusAuthorityId:
      OPERATIONAL_STATUS_AUTHORITY_ID,
    accessibilityAuthorityId:
      ACCESSIBILITY_AUTHORITY_ID,
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
    wheelchairIndicator: accessibility.wheelchairIndicator,
    mapRouteLegend: accessibility.mapRouteLegend,
    adaStandardReferenceUrl: ADA_STANDARD_URL,
    adaStandardSection: ADA_STANDARD_SECTION,
    accessibleRouteStairsSemantics: ADA_STAIRS_SEMANTIC,
    stairs: false,
    resolutionBasis:
      "qualified-exact-accessible-route-plus-ada-402-2-no-stairs-component-semantic",
    absenceOfHighwayStepsRole:
      "non-authoritative-supporting-context-only",
    exactWayIdentityRole:
      "identity-context-only-not-no-stairs-authority",
    strollerAuthorityState:
      "facility-permission-not-route-suitability",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "stairs-only",
  },
];

export function assertInteriorStairsPolicyIntegrity(
  policy: InteriorStairsPolicy,
) {
  assertExactPlainObject(
    policy,
    POLICY_FIELDS,
    "Planner 35 stairs policy",
  );

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "2" ||
    policy.adoptedAt !== ADOPTED_AT ||
    !validTimestamp(policy.adoptedAt) ||
    policy.scope !==
      "exact-segment-with-qualified-ada-accessible-route-semantic" ||
    policy.exactWayIdentityRequirement !==
      "pedestrian-asphalt-front-street-source-context" ||
    policy.exactWayIdentityRole !==
      "identity-context-only-not-no-stairs-authority" ||
    policy.exactWayNameRequirement !==
      "must-equal-qualified-accessibility-source-way-name" ||
    policy.accessibilityRequirement !==
      "exact-segment-must-already-be-accessible-true" ||
    policy.wheelchairIndicatorRequirement !== "shown" ||
    policy.mapRouteLegendRequirement !==
      "ADA MOST ACCESSIBLE ROUTE" ||
    policy.adaStandardReferenceUrl !== ADA_STANDARD_URL ||
    !validAdaStandardsUrl(policy.adaStandardReferenceUrl) ||
    policy.adaStandardSection !== ADA_STANDARD_SECTION ||
    policy.accessibleRouteStairsSemantics !==
      ADA_STAIRS_SEMANTIC ||
    policy.absenceOfHighwayStepsAlone !==
      "insufficient-for-stairs-false" ||
    policy.plannerStairs !== false ||
    policy.authority !==
      "prospective-product-semantic-policy"
  ) {
    throw new Error(
      "Planner 35 stairs policy drifted from the frozen prospective semantic boundary.",
    );
  }
}

export function assertInteriorStairsAuthorityIntegrity(
  authorities: readonly InteriorStairsAuthority[],
) {
  assertInteriorStairsPolicyIntegrity(RAW_POLICY);
  assertExactOrdinaryArray(
    authorities,
    1,
    "Planner 35 stairs authority collection",
  );
  const candidate: unknown = authorities[0];
  assertExactPlainObject(
    candidate,
    AUTHORITY_FIELDS,
    "Planner 35 stairs authority",
  );

  for (const field of FORBIDDEN_UNOWNED_FIELDS) {
    if (field in candidate) {
      throw new Error(
        `Planner 35 stairs authority cannot own field ${field}.`,
      );
    }
  }

  const record = candidate as unknown as InteriorStairsAuthority;
  const operational =
    INTERIOR_OPERATIONAL_STATUS_AUTHORITY.find(
      (entry) =>
        entry.id === record.operationalStatusAuthorityId,
    );
  const currentAccessibility =
    INTERIOR_ACCESSIBILITY_AUTHORITY.find(
      (entry) =>
        entry.id === record.accessibilityAuthorityId,
    );

  if (
    record.id !== AUTHORITY_ID ||
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
    record.wheelchairIndicator !== "shown" ||
    record.mapRouteLegend !==
      "ADA MOST ACCESSIBLE ROUTE" ||
    record.adaStandardReferenceUrl !== ADA_STANDARD_URL ||
    record.adaStandardSection !== ADA_STANDARD_SECTION ||
    record.accessibleRouteStairsSemantics !==
      ADA_STAIRS_SEMANTIC ||
    record.stairs !== false ||
    record.resolutionBasis !==
      "qualified-exact-accessible-route-plus-ada-402-2-no-stairs-component-semantic" ||
    record.absenceOfHighwayStepsRole !==
      "non-authoritative-supporting-context-only" ||
    record.exactWayIdentityRole !==
      "identity-context-only-not-no-stairs-authority" ||
    record.strollerAuthorityState !==
      "facility-permission-not-route-suitability" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !== "stairs-only"
  ) {
    throw new Error(
      "Planner 35 stairs authority drifted from the frozen exact-segment contract.",
    );
  }

  if (
    !operational ||
    operational.objectiveSourceRecordId !==
      record.objectiveSourceRecordId ||
    operational.sourceWayId !== record.sourceWayId ||
    operational.sourceFromNodeId !==
      record.sourceFromNodeId ||
    operational.sourceToNodeId !==
      record.sourceToNodeId ||
    operational.status !== "conditional"
  ) {
    throw new Error(
      "Planner 35 stairs authority detached from Planner 34 exact operational segment.",
    );
  }

  if (
    !currentAccessibility ||
    currentAccessibility.objectiveSourceRecordId !==
      record.objectiveSourceRecordId ||
    currentAccessibility.sourceWayId !==
      record.sourceWayId ||
    currentAccessibility.sourceWayName !==
      record.sourceWayName ||
    currentAccessibility.sourceFromNodeId !==
      record.sourceFromNodeId ||
    currentAccessibility.sourceToNodeId !==
      record.sourceToNodeId ||
    currentAccessibility.accessible !== true ||
    currentAccessibility.wheelchairIndicator !==
      record.wheelchairIndicator ||
    currentAccessibility.mapRouteLegend !==
      record.mapRouteLegend
  ) {
    throw new Error(
      "Planner 35 stairs authority detached from Planner 33 exact accessibility evidence.",
    );
  }

  if (
    INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.id !==
      record.sourceSnapshotId ||
    INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceWayId !==
      record.sourceWayId ||
    INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.highway !==
      record.exactWayHighway ||
    INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.surface !==
      record.exactWaySurface ||
    INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.name !==
      record.sourceWayName
  ) {
    throw new Error(
      "Planner 35 stairs authority detached from Planner 29 exact OSM identity context.",
    );
  }

  const planner18 = classifyExactStairsAuthority({
    id: record.sourceSnapshotId,
    sourceTags:
      INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags,
  });
  if (planner18.status !== "blocked") {
    throw new Error(
      "Planner 35 requires Planner 18 absence-only stairs inference to remain blocked.",
    );
  }

  const classification = classifyInteriorStairs({
    exactWayHighway: record.exactWayHighway,
    exactWaySurface: record.exactWaySurface,
    exactWayName: record.sourceWayName,
    accessibilitySourceWayName:
      currentAccessibility.sourceWayName,
    accessible: currentAccessibility.accessible,
    wheelchairIndicator:
      currentAccessibility.wheelchairIndicator,
    mapRouteLegend:
      currentAccessibility.mapRouteLegend,
    adaStandardReferenceUrl:
      record.adaStandardReferenceUrl,
    adaStandardSection:
      record.adaStandardSection,
    accessibleRouteStairsSemantics:
      record.accessibleRouteStairsSemantics,
  });

  if (
    classification.status !== "supported" ||
    classification.stairs !== false ||
    classification.basis !== record.resolutionBasis
  ) {
    throw new Error(
      "Planner 35 stairs authority no longer reproduces its prospective policy classification.",
    );
  }
}

assertInteriorStairsPolicyIntegrity(RAW_POLICY);
assertInteriorStairsAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_STAIRS_POLICY:
  InteriorStairsPolicy = deepFreeze(RAW_POLICY);

export const INTERIOR_STAIRS_AUTHORITY:
  readonly InteriorStairsAuthority[] =
  deepFreeze(RAW_AUTHORITY);

export function interiorStairsForObjective(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_STAIRS_AUTHORITY.find(
    (record) =>
      record.objectiveSourceRecordId ===
      objectiveSourceRecordId,
  );
}

export function assessInteriorStairs(
  objectiveSourceRecordId: string,
): InteriorStairsAssessment {
  const record =
    interiorStairsForObjective(objectiveSourceRecordId);

  if (!record) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_STAIRS_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }

  return deepFreeze({
    status: "stairs-ready",
    objectiveSourceRecordId,
    sourceFromNodeId: record.sourceFromNodeId,
    sourceToNodeId: record.sourceToNodeId,
    stairs: record.stairs,
    strollerAuthorityState:
      record.strollerAuthorityState,
    selectionScope: record.selectionScope,
    globalEndpointSelection:
      record.globalEndpointSelection,
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS] as const,
    },
  });
}
