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
  CORRIDOR_TERRAIN_EVIDENCE,
} from "./zooIngressTerrainAuthority.ts";

const POLICY_ID = "sdz-interior-stairs-policy-v1" as const;
const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-stairs" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const OPERATIONAL_STATUS_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-operational-status" as const;
const ACCESSIBILITY_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-accessibility" as const;
const SOURCE_SNAPSHOT_ID =
  "sdz-interior-front-street-direction-source-v1" as const;
const FRONT_STREET_TERRAIN_EVIDENCE_ID =
  "sdz-corridor-front-street-terrain-evidence" as const;
const STAIRS_CONTRAST_EVIDENCE_ID =
  "sdz-corridor-fern-canyon-trail-terrain-evidence" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const ADOPTED_AT = "2026-09-12T15:45:00-07:00" as const;

export type InteriorStairsPolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope:
    "exact-name-matched-wheelchair-corridor-on-positive-nonstep-pedestrian-way";
  exactWayHighwayRequirement: "pedestrian";
  exactWaySurfaceRequirement: "asphalt";
  exactWayNameRequirement:
    "must-equal-official-corridor-name";
  accessibilityRequirement:
    "exact-segment-must-already-be-accessible-true";
  corridorTerrainRequirement: "mild";
  corridorStairsEvidenceRequirement:
    "not-explicitly-published";
  controlledVocabularyContrastRequirement:
    "same-official-map-must-explicitly-publish-stairs-on-known-stair-corridor";
  knownStairCorridorTerrain: "steep-and-stairs";
  knownStairCorridorStairsEvidence:
    "explicitly-published";
  absenceOfHighwayStepsAlone:
    "insufficient-for-stairs-false";
  plannerStairs: false;
  authority: "prospective-product-semantic-policy";
};

export type InteriorStairsClassificationInput = {
  exactWayHighway: string;
  exactWaySurface: string;
  exactWayName: string;
  corridorName: string;
  accessible: boolean;
  wheelchairIndicator: string;
  mapRouteLegend: string;
  corridorTerrain: string;
  corridorStairsEvidence: string;
  knownStairCorridorTerrain: string;
  knownStairCorridorStairsEvidence: string;
};

export type InteriorStairsClassification =
  | {
      status: "supported";
      stairs: false;
      basis:
        "positive-pedestrian-asphalt-plus-exact-name-wheelchair-corridor-with-controlled-stairs-contrast";
    }
  | {
      status: "blocked";
      reason:
        | "EXACT_WAY_NOT_POSITIVE_NONSTEP_PEDESTRIAN_CLASSIFICATION"
        | "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH"
        | "ACCESSIBILITY_PREREQUISITE_NOT_MET"
        | "CORRIDOR_TERRAIN_NOT_MAPPED_BY_POLICY"
        | "CONTROLLED_STAIRS_CONTRAST_NOT_ESTABLISHED";
    };

export type InteriorStairsAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  operationalStatusAuthorityId:
    typeof OPERATIONAL_STATUS_AUTHORITY_ID;
  accessibilityAuthorityId: typeof ACCESSIBILITY_AUTHORITY_ID;
  sourceSnapshotId: typeof SOURCE_SNAPSHOT_ID;
  policyId: typeof POLICY_ID;
  frontStreetTerrainEvidenceId:
    typeof FRONT_STREET_TERRAIN_EVIDENCE_ID;
  stairsContrastEvidenceId:
    typeof STAIRS_CONTRAST_EVIDENCE_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayName: "Front Street";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  exactWayHighway: "pedestrian";
  exactWaySurface: "asphalt";
  corridorTerrain: "mild";
  corridorStairsEvidence:
    "not-explicitly-published";
  knownStairCorridorName: "Fern Canyon Trail";
  knownStairCorridorTerrain: "steep-and-stairs";
  knownStairCorridorStairsEvidence:
    "explicitly-published";
  stairs: false;
  resolutionBasis:
    "positive-pedestrian-asphalt-plus-exact-name-wheelchair-corridor-with-controlled-stairs-contrast";
  absenceOfHighwayStepsRole:
    "non-authoritative-supporting-context-only";
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
  "exactWayHighwayRequirement",
  "exactWaySurfaceRequirement",
  "exactWayNameRequirement",
  "accessibilityRequirement",
  "corridorTerrainRequirement",
  "corridorStairsEvidenceRequirement",
  "controlledVocabularyContrastRequirement",
  "knownStairCorridorTerrain",
  "knownStairCorridorStairsEvidence",
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
  "frontStreetTerrainEvidenceId",
  "stairsContrastEvidenceId",
  "sourceWayId",
  "sourceWayName",
  "sourceFromNodeId",
  "sourceToNodeId",
  "exactWayHighway",
  "exactWaySurface",
  "corridorTerrain",
  "corridorStairsEvidence",
  "knownStairCorridorName",
  "knownStairCorridorTerrain",
  "knownStairCorridorStairsEvidence",
  "stairs",
  "resolutionBasis",
  "absenceOfHighwayStepsRole",
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

export function classifyInteriorStairs(
  input: InteriorStairsClassificationInput,
): InteriorStairsClassification {
  if (
    input.exactWayHighway !== "pedestrian" ||
    input.exactWaySurface !== "asphalt"
  ) {
    return {
      status: "blocked",
      reason:
        "EXACT_WAY_NOT_POSITIVE_NONSTEP_PEDESTRIAN_CLASSIFICATION",
    };
  }

  if (input.exactWayName !== input.corridorName) {
    return {
      status: "blocked",
      reason:
        "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH",
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
    input.corridorTerrain !== "mild" ||
    input.corridorStairsEvidence !==
      "not-explicitly-published"
  ) {
    return {
      status: "blocked",
      reason: "CORRIDOR_TERRAIN_NOT_MAPPED_BY_POLICY",
    };
  }

  if (
    input.knownStairCorridorTerrain !==
      "steep-and-stairs" ||
    input.knownStairCorridorStairsEvidence !==
      "explicitly-published"
  ) {
    return {
      status: "blocked",
      reason:
        "CONTROLLED_STAIRS_CONTRAST_NOT_ESTABLISHED",
    };
  }

  return {
    status: "supported",
    stairs: false,
    basis:
      "positive-pedestrian-asphalt-plus-exact-name-wheelchair-corridor-with-controlled-stairs-contrast",
  };
}

const RAW_POLICY: InteriorStairsPolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope:
    "exact-name-matched-wheelchair-corridor-on-positive-nonstep-pedestrian-way",
  exactWayHighwayRequirement: "pedestrian",
  exactWaySurfaceRequirement: "asphalt",
  exactWayNameRequirement:
    "must-equal-official-corridor-name",
  accessibilityRequirement:
    "exact-segment-must-already-be-accessible-true",
  corridorTerrainRequirement: "mild",
  corridorStairsEvidenceRequirement:
    "not-explicitly-published",
  controlledVocabularyContrastRequirement:
    "same-official-map-must-explicitly-publish-stairs-on-known-stair-corridor",
  knownStairCorridorTerrain: "steep-and-stairs",
  knownStairCorridorStairsEvidence:
    "explicitly-published",
  absenceOfHighwayStepsAlone:
    "insufficient-for-stairs-false",
  plannerStairs: false,
  authority: "prospective-product-semantic-policy",
};

const frontStreetTerrain =
  CORRIDOR_TERRAIN_EVIDENCE.find(
    (record) =>
      record.id === FRONT_STREET_TERRAIN_EVIDENCE_ID,
  );
const stairsContrast =
  CORRIDOR_TERRAIN_EVIDENCE.find(
    (record) =>
      record.id === STAIRS_CONTRAST_EVIDENCE_ID,
  );
const accessibility =
  INTERIOR_ACCESSIBILITY_AUTHORITY[0];

if (!frontStreetTerrain || !stairsContrast || !accessibility) {
  throw new Error(
    "Planner 35 prerequisites are missing qualified terrain/accessibility evidence.",
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
    frontStreetTerrainEvidenceId:
      FRONT_STREET_TERRAIN_EVIDENCE_ID,
    stairsContrastEvidenceId:
      STAIRS_CONTRAST_EVIDENCE_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayName: "Front Street",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    exactWayHighway:
      INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.highway,
    exactWaySurface:
      INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.surface,
    corridorTerrain: "mild",
    corridorStairsEvidence:
      "not-explicitly-published",
    knownStairCorridorName: "Fern Canyon Trail",
    knownStairCorridorTerrain: "steep-and-stairs",
    knownStairCorridorStairsEvidence:
      "explicitly-published",
    stairs: false,
    resolutionBasis:
      "positive-pedestrian-asphalt-plus-exact-name-wheelchair-corridor-with-controlled-stairs-contrast",
    absenceOfHighwayStepsRole:
      "non-authoritative-supporting-context-only",
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
    policy.policyVersion !== "1" ||
    policy.adoptedAt !== ADOPTED_AT ||
    !validTimestamp(policy.adoptedAt) ||
    policy.scope !==
      "exact-name-matched-wheelchair-corridor-on-positive-nonstep-pedestrian-way" ||
    policy.exactWayHighwayRequirement !== "pedestrian" ||
    policy.exactWaySurfaceRequirement !== "asphalt" ||
    policy.exactWayNameRequirement !==
      "must-equal-official-corridor-name" ||
    policy.accessibilityRequirement !==
      "exact-segment-must-already-be-accessible-true" ||
    policy.corridorTerrainRequirement !== "mild" ||
    policy.corridorStairsEvidenceRequirement !==
      "not-explicitly-published" ||
    policy.controlledVocabularyContrastRequirement !==
      "same-official-map-must-explicitly-publish-stairs-on-known-stair-corridor" ||
    policy.knownStairCorridorTerrain !==
      "steep-and-stairs" ||
    policy.knownStairCorridorStairsEvidence !==
      "explicitly-published" ||
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
  const currentFrontStreetTerrain =
    CORRIDOR_TERRAIN_EVIDENCE.find(
      (entry) =>
        entry.id === record.frontStreetTerrainEvidenceId,
    );
  const currentStairsContrast =
    CORRIDOR_TERRAIN_EVIDENCE.find(
      (entry) =>
        entry.id === record.stairsContrastEvidenceId,
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
    record.frontStreetTerrainEvidenceId !==
      FRONT_STREET_TERRAIN_EVIDENCE_ID ||
    record.stairsContrastEvidenceId !==
      STAIRS_CONTRAST_EVIDENCE_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceWayName !== "Front Street" ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.exactWayHighway !== "pedestrian" ||
    record.exactWaySurface !== "asphalt" ||
    record.corridorTerrain !== "mild" ||
    record.corridorStairsEvidence !==
      "not-explicitly-published" ||
    record.knownStairCorridorName !==
      "Fern Canyon Trail" ||
    record.knownStairCorridorTerrain !==
      "steep-and-stairs" ||
    record.knownStairCorridorStairsEvidence !==
      "explicitly-published" ||
    record.stairs !== false ||
    record.resolutionBasis !==
      "positive-pedestrian-asphalt-plus-exact-name-wheelchair-corridor-with-controlled-stairs-contrast" ||
    record.absenceOfHighwayStepsRole !==
      "non-authoritative-supporting-context-only" ||
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
    currentAccessibility.wheelchairIndicator !== "shown" ||
    currentAccessibility.mapRouteLegend !==
      "ADA MOST ACCESSIBLE ROUTE"
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
      "Planner 35 stairs authority detached from Planner 29 exact OSM source snapshot.",
    );
  }

  if (
    !currentFrontStreetTerrain ||
    currentFrontStreetTerrain.corridorName !==
      record.sourceWayName ||
    currentFrontStreetTerrain.publishedTerrain !==
      record.corridorTerrain ||
    currentFrontStreetTerrain.stairsEvidence !==
      record.corridorStairsEvidence ||
    currentFrontStreetTerrain.scope !== "named-corridor" ||
    !currentStairsContrast ||
    currentStairsContrast.corridorName !==
      record.knownStairCorridorName ||
    currentStairsContrast.publishedTerrain !==
      record.knownStairCorridorTerrain ||
    currentStairsContrast.stairsEvidence !==
      record.knownStairCorridorStairsEvidence ||
    currentStairsContrast.artifactId !==
      currentFrontStreetTerrain.artifactId
  ) {
    throw new Error(
      "Planner 35 stairs authority detached from the official controlled terrain/stairs vocabulary.",
    );
  }

  const classification = classifyInteriorStairs({
    exactWayHighway: record.exactWayHighway,
    exactWaySurface: record.exactWaySurface,
    exactWayName: record.sourceWayName,
    corridorName: currentFrontStreetTerrain.corridorName,
    accessible: currentAccessibility.accessible,
    wheelchairIndicator:
      currentAccessibility.wheelchairIndicator,
    mapRouteLegend:
      currentAccessibility.mapRouteLegend,
    corridorTerrain: record.corridorTerrain,
    corridorStairsEvidence:
      record.corridorStairsEvidence,
    knownStairCorridorTerrain:
      record.knownStairCorridorTerrain,
    knownStairCorridorStairsEvidence:
      record.knownStairCorridorStairsEvidence,
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
