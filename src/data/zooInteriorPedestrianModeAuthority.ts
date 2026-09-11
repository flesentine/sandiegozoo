import {
  INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY,
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "./zooInteriorPedestrianDirectionAuthority.ts";

const POLICY_ID = "sdz-interior-pedestrian-mode-policy-v1" as const;
const AUTHORITY_ID = "sdz-interior-tiger-trail-front-street-mode" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const DIRECTION_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-direction" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const ADOPTED_AT = "2026-09-11T09:45:00-07:00" as const;

export type InteriorPedestrianModePolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope: "highway-pedestrian-interior-exact-segments";
  modeAuthority: "osm-highway-pedestrian";
  supportedMode: "walk";
  footAccessTagRole: "access-context-not-mode-or-operational-eligibility";
  authority: "prospective-osm-mode-classification-policy";
};

export type InteriorPedestrianModeAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  directionAuthorityId: typeof DIRECTION_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  mode: "walk";
  resolutionBasis: "osm-highway-pedestrian";
  sourceHighwayTag: "pedestrian";
  sourceFootTag: "customers";
  footAccessTagRole: "access-context-only";
  operationalEligibility: "unresolved";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "mode-only";
};

export type InteriorPedestrianModeAssessment =
  | {
      status: "mode-ready";
      objectiveSourceRecordId: string;
      sourceFromNodeId: string;
      sourceToNodeId: string;
      mode: "walk";
      operationalEligibility: "unresolved";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_DURATION_NOT_SOURCED",
          "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
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
      reason: "OBJECTIVE_PEDESTRIAN_MODE_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const POLICY_FIELDS = [
  "id",
  "policyVersion",
  "adoptedAt",
  "scope",
  "modeAuthority",
  "supportedMode",
  "footAccessTagRole",
  "authority",
] as const;

const AUTHORITY_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "directionAuthorityId",
  "policyId",
  "sourceWayId",
  "sourceFromNodeId",
  "sourceToNodeId",
  "mode",
  "resolutionBasis",
  "sourceHighwayTag",
  "sourceFootTag",
  "footAccessTagRole",
  "operationalEligibility",
  "selectionScope",
  "globalEndpointSelection",
  "plannerMaterialization",
] as const;

const FORBIDDEN_UNOWNED_FIELDS = [
  "distanceMeters",
  "durationMinutes",
  "difficulty",
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
  "EXACT_SEGMENT_DURATION_NOT_SOURCED",
  "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
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

const RAW_POLICY: InteriorPedestrianModePolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope: "highway-pedestrian-interior-exact-segments",
  modeAuthority: "osm-highway-pedestrian",
  supportedMode: "walk",
  footAccessTagRole: "access-context-not-mode-or-operational-eligibility",
  authority: "prospective-osm-mode-classification-policy",
};

const RAW_AUTHORITY: InteriorPedestrianModeAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    directionAuthorityId: DIRECTION_AUTHORITY_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    mode: "walk",
    resolutionBasis: "osm-highway-pedestrian",
    sourceHighwayTag: "pedestrian",
    sourceFootTag: "customers",
    footAccessTagRole: "access-context-only",
    operationalEligibility: "unresolved",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "mode-only",
  },
];

export function assertInteriorPedestrianModePolicyIntegrity(
  policy: InteriorPedestrianModePolicy,
) {
  assertExactPlainObject(policy, POLICY_FIELDS, "Planner 30 pedestrian mode policy");
  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.adoptedAt !== ADOPTED_AT ||
    !validTimestamp(policy.adoptedAt) ||
    policy.scope !== "highway-pedestrian-interior-exact-segments" ||
    policy.modeAuthority !== "osm-highway-pedestrian" ||
    policy.supportedMode !== "walk" ||
    policy.footAccessTagRole !==
      "access-context-not-mode-or-operational-eligibility" ||
    policy.authority !== "prospective-osm-mode-classification-policy"
  ) {
    throw new Error("Planner 30 pedestrian mode policy drifted from the frozen policy boundary.");
  }
}

export function assertInteriorPedestrianModeAuthorityIntegrity(
  authorities: readonly InteriorPedestrianModeAuthority[],
) {
  assertExactOrdinaryArray(authorities, 1, "Planner 30 mode authority collection");
  const candidate: unknown = authorities[0];
  assertExactPlainObject(candidate, AUTHORITY_FIELDS, "Planner 30 pedestrian mode authority");
  for (const field of FORBIDDEN_UNOWNED_FIELDS) {
    if (field in candidate) {
      throw new Error(`Planner 30 pedestrian mode authority cannot own field ${field}.`);
    }
  }

  const record = candidate as unknown as InteriorPedestrianModeAuthority;
  const direction = INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY.find(
    (entry) => entry.id === record.directionAuthorityId,
  );

  if (
    record.id !== AUTHORITY_ID ||
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.directionAuthorityId !== DIRECTION_AUTHORITY_ID ||
    record.policyId !== POLICY_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.mode !== "walk" ||
    record.resolutionBasis !== "osm-highway-pedestrian" ||
    record.sourceHighwayTag !== "pedestrian" ||
    record.sourceFootTag !== "customers" ||
    record.footAccessTagRole !== "access-context-only" ||
    record.operationalEligibility !== "unresolved" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !== "mode-only"
  ) {
    throw new Error("Planner 30 pedestrian mode authority drifted from the frozen exact-segment contract.");
  }

  if (
    !direction ||
    direction.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    direction.sourceWayId !== record.sourceWayId ||
    direction.sourceFromNodeId !== record.sourceFromNodeId ||
    direction.sourceToNodeId !== record.sourceToNodeId ||
    direction.selectionScope !== "objective-only" ||
    direction.globalEndpointSelection !== "unresolved"
  ) {
    throw new Error("Planner 30 mode authority detached from Planner 29 exact-segment direction authority.");
  }

  if (
    INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.highway !==
      "pedestrian" ||
    INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags.foot !==
      "customers"
  ) {
    throw new Error("Planner 30 walk mode requires the exact Planner 29 pedestrian source snapshot.");
  }
}

assertInteriorPedestrianModePolicyIntegrity(RAW_POLICY);
assertInteriorPedestrianModeAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_PEDESTRIAN_MODE_POLICY: InteriorPedestrianModePolicy =
  deepFreeze(RAW_POLICY);

export const INTERIOR_PEDESTRIAN_MODE_AUTHORITY:
  readonly InteriorPedestrianModeAuthority[] = deepFreeze(RAW_AUTHORITY);

export function interiorPedestrianModeForObjective(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_PEDESTRIAN_MODE_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorPedestrianMode(
  objectiveSourceRecordId: string,
): InteriorPedestrianModeAssessment {
  const mode = interiorPedestrianModeForObjective(objectiveSourceRecordId);
  if (!mode) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_PEDESTRIAN_MODE_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }

  return deepFreeze({
    status: "mode-ready",
    objectiveSourceRecordId: mode.objectiveSourceRecordId,
    sourceFromNodeId: mode.sourceFromNodeId,
    sourceToNodeId: mode.sourceToNodeId,
    mode: mode.mode,
    operationalEligibility: mode.operationalEligibility,
    selectionScope: mode.selectionScope,
    globalEndpointSelection: mode.globalEndpointSelection,
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
