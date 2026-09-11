import {
  CORRIDOR_TERRAIN_EVIDENCE,
} from "./zooIngressTerrainAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "./zooInteriorPedestrianDirectionAuthority.ts";
import {
  INTERIOR_WALKING_DURATION_AUTHORITY,
} from "./zooInteriorWalkingDurationAuthority.ts";

const POLICY_ID = "sdz-interior-difficulty-policy-v1" as const;
const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-difficulty" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const DURATION_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-walking-duration" as const;
const CORRIDOR_TERRAIN_EVIDENCE_ID =
  "sdz-corridor-front-street-terrain-evidence" as const;
const CORRIDOR_ID = "sdz-corridor-front-street" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const ADOPTED_AT = "2026-09-11T10:00:00-07:00" as const;

export type InteriorDifficultyPolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope: "exact-segments-with-exact-named-corridor-match";
  supportedPublishedTerrain: "mild";
  plannerDifficulty: "easy";
  corridorProjectionRequirement:
    "exact-source-way-name-must-equal-official-corridor-name";
  exactSegmentRequirement:
    "qualified-endpoints-must-remain-on-that-source-way";
  stairsSemantics: "independent-not-inferred-from-mild";
  authority: "prospective-product-semantic-policy";
};

export type NamedCorridorDifficultyClassification =
  | {
      status: "supported";
      difficulty: "easy";
      basis: "official-mild-terrain-on-exact-name-matched-corridor";
    }
  | {
      status: "blocked";
      reason:
        | "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH"
        | "TERRAIN_CLASS_NOT_MAPPED_BY_POLICY";
    };

export type InteriorDifficultyAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  durationAuthorityId: typeof DURATION_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  corridorTerrainEvidenceId: typeof CORRIDOR_TERRAIN_EVIDENCE_ID;
  corridorId: typeof CORRIDOR_ID;
  corridorName: "Front Street";
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayName: "Front Street";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  publishedTerrain: "mild";
  difficulty: "easy";
  resolutionBasis:
    "official-mild-terrain-on-exact-name-matched-corridor";
  stairsAuthorityState: "independent-unresolved";
  operationalEligibility: "unresolved";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "difficulty-only";
};

export type InteriorDifficultyAssessment =
  | {
      status: "difficulty-ready";
      objectiveSourceRecordId: string;
      sourceFromNodeId: string;
      sourceToNodeId: string;
      difficulty: "easy";
      stairsAuthorityState: "independent-unresolved";
      operationalEligibility: "unresolved";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
          "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
          "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_DIFFICULTY_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const POLICY_FIELDS = [
  "id",
  "policyVersion",
  "adoptedAt",
  "scope",
  "supportedPublishedTerrain",
  "plannerDifficulty",
  "corridorProjectionRequirement",
  "exactSegmentRequirement",
  "stairsSemantics",
  "authority",
] as const;

const AUTHORITY_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "durationAuthorityId",
  "policyId",
  "corridorTerrainEvidenceId",
  "corridorId",
  "corridorName",
  "sourceWayId",
  "sourceWayName",
  "sourceFromNodeId",
  "sourceToNodeId",
  "publishedTerrain",
  "difficulty",
  "resolutionBasis",
  "stairsAuthorityState",
  "operationalEligibility",
  "selectionScope",
  "globalEndpointSelection",
  "plannerMaterialization",
] as const;

const FORBIDDEN_UNOWNED_FIELDS = [
  "stairs",
  "accessible",
  "stroller",
  "oneWay",
  "status",
  "routeNodeId",
  "provenance",
  "globalEndpointNodeId",
] as const;

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
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

const RAW_POLICY: InteriorDifficultyPolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope: "exact-segments-with-exact-named-corridor-match",
  supportedPublishedTerrain: "mild",
  plannerDifficulty: "easy",
  corridorProjectionRequirement:
    "exact-source-way-name-must-equal-official-corridor-name",
  exactSegmentRequirement:
    "qualified-endpoints-must-remain-on-that-source-way",
  stairsSemantics: "independent-not-inferred-from-mild",
  authority: "prospective-product-semantic-policy",
};

const RAW_AUTHORITY: InteriorDifficultyAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    durationAuthorityId: DURATION_AUTHORITY_ID,
    policyId: POLICY_ID,
    corridorTerrainEvidenceId: CORRIDOR_TERRAIN_EVIDENCE_ID,
    corridorId: CORRIDOR_ID,
    corridorName: "Front Street",
    sourceWayId: SOURCE_WAY_ID,
    sourceWayName: "Front Street",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    publishedTerrain: "mild",
    difficulty: "easy",
    resolutionBasis:
      "official-mild-terrain-on-exact-name-matched-corridor",
    stairsAuthorityState: "independent-unresolved",
    operationalEligibility: "unresolved",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "difficulty-only",
  },
];

export function classifyNamedCorridorDifficulty(input: {
  publishedTerrain: string;
  corridorName: string;
  exactSourceWayName: string;
}): NamedCorridorDifficultyClassification {
  if (input.exactSourceWayName !== input.corridorName) {
    return {
      status: "blocked",
      reason: "CORRIDOR_NAME_NOT_EXACT_SOURCE_WAY_MATCH",
    };
  }

  if (input.publishedTerrain !== "mild") {
    return {
      status: "blocked",
      reason: "TERRAIN_CLASS_NOT_MAPPED_BY_POLICY",
    };
  }

  return {
    status: "supported",
    difficulty: "easy",
    basis: "official-mild-terrain-on-exact-name-matched-corridor",
  };
}

export function assertInteriorDifficultyPolicyIntegrity(
  policy: InteriorDifficultyPolicy,
) {
  assertExactPlainObject(policy, POLICY_FIELDS, "Planner 32 difficulty policy");
  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.adoptedAt !== ADOPTED_AT ||
    !validTimestamp(policy.adoptedAt) ||
    policy.scope !== "exact-segments-with-exact-named-corridor-match" ||
    policy.supportedPublishedTerrain !== "mild" ||
    policy.plannerDifficulty !== "easy" ||
    policy.corridorProjectionRequirement !==
      "exact-source-way-name-must-equal-official-corridor-name" ||
    policy.exactSegmentRequirement !==
      "qualified-endpoints-must-remain-on-that-source-way" ||
    policy.stairsSemantics !== "independent-not-inferred-from-mild" ||
    policy.authority !== "prospective-product-semantic-policy"
  ) {
    throw new Error("Planner 32 difficulty policy drifted from the frozen semantic boundary.");
  }
}

export function assertInteriorDifficultyAuthorityIntegrity(
  authorities: readonly InteriorDifficultyAuthority[],
) {
  assertInteriorDifficultyPolicyIntegrity(RAW_POLICY);
  assertExactOrdinaryArray(authorities, 1, "Planner 32 difficulty authority collection");
  const candidate: unknown = authorities[0];
  assertExactPlainObject(candidate, AUTHORITY_FIELDS, "Planner 32 difficulty authority");

  for (const field of FORBIDDEN_UNOWNED_FIELDS) {
    if (field in candidate) {
      throw new Error(`Planner 32 difficulty authority cannot own field ${field}.`);
    }
  }

  const record = candidate as unknown as InteriorDifficultyAuthority;
  const duration = INTERIOR_WALKING_DURATION_AUTHORITY.find(
    (entry) => entry.id === record.durationAuthorityId,
  );
  const corridor = CORRIDOR_TERRAIN_EVIDENCE.find(
    (entry) => entry.id === record.corridorTerrainEvidenceId,
  );
  const sourceSnapshot = INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
  const classification = classifyNamedCorridorDifficulty({
    publishedTerrain: record.publishedTerrain,
    corridorName: record.corridorName,
    exactSourceWayName: record.sourceWayName,
  });

  if (
    record.id !== AUTHORITY_ID ||
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.durationAuthorityId !== DURATION_AUTHORITY_ID ||
    record.policyId !== POLICY_ID ||
    record.corridorTerrainEvidenceId !== CORRIDOR_TERRAIN_EVIDENCE_ID ||
    record.corridorId !== CORRIDOR_ID ||
    record.corridorName !== "Front Street" ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceWayName !== "Front Street" ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.publishedTerrain !== "mild" ||
    record.difficulty !== "easy" ||
    record.resolutionBasis !==
      "official-mild-terrain-on-exact-name-matched-corridor" ||
    record.stairsAuthorityState !== "independent-unresolved" ||
    record.operationalEligibility !== "unresolved" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !== "difficulty-only"
  ) {
    throw new Error("Planner 32 difficulty authority drifted from the frozen exact-segment contract.");
  }

  if (
    !duration ||
    duration.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    duration.sourceWayId !== record.sourceWayId ||
    duration.sourceFromNodeId !== record.sourceFromNodeId ||
    duration.sourceToNodeId !== record.sourceToNodeId ||
    duration.selectionScope !== "objective-only" ||
    duration.globalEndpointSelection !== "unresolved"
  ) {
    throw new Error("Planner 32 difficulty authority detached from Planner 31 exact segment.");
  }

  if (
    !corridor ||
    corridor.corridorId !== record.corridorId ||
    corridor.corridorName !== record.corridorName ||
    corridor.publishedTerrain !== record.publishedTerrain ||
    corridor.plannerDifficultyAuthority !== "source-terrain-only" ||
    corridor.scope !== "named-corridor"
  ) {
    throw new Error("Planner 32 difficulty authority detached from Planner 18 corridor terrain evidence.");
  }

  if (
    sourceSnapshot.sourceWayId !== record.sourceWayId ||
    sourceSnapshot.sourceTags.name !== record.sourceWayName ||
    sourceSnapshot.sourceState !== "exact-version-complete-tag-set"
  ) {
    throw new Error("Planner 32 requires Planner 29 exact source-way identity and name evidence.");
  }

  if (
    classification.status !== "supported" ||
    classification.difficulty !== record.difficulty ||
    classification.basis !== record.resolutionBasis
  ) {
    throw new Error("Planner 32 difficulty does not reproduce from the frozen semantic policy.");
  }
}

assertInteriorDifficultyPolicyIntegrity(RAW_POLICY);
assertInteriorDifficultyAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_DIFFICULTY_POLICY: InteriorDifficultyPolicy =
  deepFreeze(RAW_POLICY);

export const INTERIOR_DIFFICULTY_AUTHORITY:
  readonly InteriorDifficultyAuthority[] = deepFreeze(RAW_AUTHORITY);

export function interiorDifficultyForObjective(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_DIFFICULTY_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorDifficulty(
  objectiveSourceRecordId: string,
): InteriorDifficultyAssessment {
  const difficulty = interiorDifficultyForObjective(objectiveSourceRecordId);
  if (!difficulty) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_DIFFICULTY_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }

  return deepFreeze({
    status: "difficulty-ready",
    objectiveSourceRecordId: difficulty.objectiveSourceRecordId,
    sourceFromNodeId: difficulty.sourceFromNodeId,
    sourceToNodeId: difficulty.sourceToNodeId,
    difficulty: difficulty.difficulty,
    stairsAuthorityState: difficulty.stairsAuthorityState,
    operationalEligibility: difficulty.operationalEligibility,
    selectionScope: difficulty.selectionScope,
    globalEndpointSelection: difficulty.globalEndpointSelection,
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
