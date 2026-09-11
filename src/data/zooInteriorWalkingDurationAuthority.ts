import {
  INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY,
} from "./zooInteriorObjectiveSegmentDistanceAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_MODE_AUTHORITY,
} from "./zooInteriorPedestrianModeAuthority.ts";
import {
  INGRESS_WALKING_DURATION_POLICY,
  deriveWalkingDurationMinutes,
} from "./zooIngressWalkingDurationPolicy.ts";

const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-walking-duration" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const DISTANCE_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-distance" as const;
const MODE_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-mode" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const DISTANCE_METERS = 7.157 as const;
const DURATION_MINUTES = 0.099 as const;

export type InteriorWalkingDurationAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  distanceAuthorityId: typeof DISTANCE_AUTHORITY_ID;
  modeAuthorityId: typeof MODE_AUTHORITY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  distanceMeters: typeof DISTANCE_METERS;
  durationMinutes: typeof DURATION_MINUTES;
  derivationMethod: "distance-over-fixed-walk-speed";
  speedMetersPerSecond: 1.2;
  roundingDecimals: 3;
  minimumDurationMinutes: null;
  paceAdjustment: "none";
  terrainAdjustment: "none";
  queueAdjustment: "none";
  accessControlDelayAdjustment: "none";
  crowdAdjustment: "none";
  policyId: "sdz-walking-duration-policy-v1";
  policyVersion: "1";
  policyScope: "free-flow-walk-edges";
  durationScope: "neutral-free-flow";
  operationalEligibility: "unresolved";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "duration-only";
};

export type InteriorWalkingDurationAssessment =
  | {
      status: "duration-ready";
      objectiveSourceRecordId: string;
      sourceFromNodeId: string;
      sourceToNodeId: string;
      distanceMeters: number;
      durationMinutes: number;
      durationScope: "neutral-free-flow";
      operationalEligibility: "unresolved";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
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
      reason: "OBJECTIVE_WALKING_DURATION_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const AUTHORITY_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "distanceAuthorityId",
  "modeAuthorityId",
  "sourceWayId",
  "sourceFromNodeId",
  "sourceToNodeId",
  "distanceMeters",
  "durationMinutes",
  "derivationMethod",
  "speedMetersPerSecond",
  "roundingDecimals",
  "minimumDurationMinutes",
  "paceAdjustment",
  "terrainAdjustment",
  "queueAdjustment",
  "accessControlDelayAdjustment",
  "crowdAdjustment",
  "policyId",
  "policyVersion",
  "policyScope",
  "durationScope",
  "operationalEligibility",
  "selectionScope",
  "globalEndpointSelection",
  "plannerMaterialization",
] as const;

const FORBIDDEN_UNOWNED_FIELDS = [
  "mode",
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

function assertSharedWalkingPolicyBoundary() {
  const policy = INGRESS_WALKING_DURATION_POLICY;
  if (
    policy.id !== "sdz-walking-duration-policy-v1" ||
    policy.policyVersion !== "1" ||
    policy.scope !== "free-flow-walk-edges" ||
    policy.speedMetersPerSecond !== 1.2 ||
    policy.roundingDecimals !== 3 ||
    policy.minimumDurationMinutes !== null ||
    policy.paceAdjustment !== "none" ||
    policy.terrainAdjustment !== "none" ||
    policy.queueAdjustment !== "none" ||
    policy.accessControlDelayAdjustment !== "none" ||
    policy.crowdAdjustment !== "none" ||
    policy.authority !== "prospective-product-policy"
  ) {
    throw new Error(
      "Planner 31 requires the unchanged Planner 19 generic free-flow walking-duration policy.",
    );
  }
}

const RAW_AUTHORITY: InteriorWalkingDurationAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    distanceAuthorityId: DISTANCE_AUTHORITY_ID,
    modeAuthorityId: MODE_AUTHORITY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    distanceMeters: DISTANCE_METERS,
    durationMinutes: DURATION_MINUTES,
    derivationMethod: "distance-over-fixed-walk-speed",
    speedMetersPerSecond: 1.2,
    roundingDecimals: 3,
    minimumDurationMinutes: null,
    paceAdjustment: "none",
    terrainAdjustment: "none",
    queueAdjustment: "none",
    accessControlDelayAdjustment: "none",
    crowdAdjustment: "none",
    policyId: "sdz-walking-duration-policy-v1",
    policyVersion: "1",
    policyScope: "free-flow-walk-edges",
    durationScope: "neutral-free-flow",
    operationalEligibility: "unresolved",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "duration-only",
  },
];

export function assertInteriorWalkingDurationAuthorityIntegrity(
  authorities: readonly InteriorWalkingDurationAuthority[],
) {
  assertSharedWalkingPolicyBoundary();
  assertExactOrdinaryArray(authorities, 1, "Planner 31 duration authority collection");
  const candidate: unknown = authorities[0];
  assertExactPlainObject(candidate, AUTHORITY_FIELDS, "Planner 31 walking duration authority");

  for (const field of FORBIDDEN_UNOWNED_FIELDS) {
    if (field in candidate) {
      throw new Error(`Planner 31 walking duration authority cannot own field ${field}.`);
    }
  }

  const record = candidate as unknown as InteriorWalkingDurationAuthority;
  const distance = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY.find(
    (entry) => entry.id === record.distanceAuthorityId,
  );
  const mode = INTERIOR_PEDESTRIAN_MODE_AUTHORITY.find(
    (entry) => entry.id === record.modeAuthorityId,
  );

  if (
    record.id !== AUTHORITY_ID ||
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.distanceAuthorityId !== DISTANCE_AUTHORITY_ID ||
    record.modeAuthorityId !== MODE_AUTHORITY_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.distanceMeters !== DISTANCE_METERS ||
    record.durationMinutes !== DURATION_MINUTES ||
    record.derivationMethod !== "distance-over-fixed-walk-speed" ||
    record.speedMetersPerSecond !== 1.2 ||
    record.roundingDecimals !== 3 ||
    record.minimumDurationMinutes !== null ||
    record.paceAdjustment !== "none" ||
    record.terrainAdjustment !== "none" ||
    record.queueAdjustment !== "none" ||
    record.accessControlDelayAdjustment !== "none" ||
    record.crowdAdjustment !== "none" ||
    record.policyId !== "sdz-walking-duration-policy-v1" ||
    record.policyVersion !== "1" ||
    record.policyScope !== "free-flow-walk-edges" ||
    record.durationScope !== "neutral-free-flow" ||
    record.operationalEligibility !== "unresolved" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !== "duration-only"
  ) {
    throw new Error(
      "Planner 31 walking duration authority drifted from the frozen exact-segment contract.",
    );
  }

  if (
    !distance ||
    distance.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    distance.sourceWayId !== record.sourceWayId ||
    distance.sourceFromNodeId !== record.sourceFromNodeId ||
    distance.sourceToNodeId !== record.sourceToNodeId ||
    distance.distanceMeters !== record.distanceMeters ||
    distance.selectionScope !== "objective-only" ||
    distance.globalEndpointSelection !== "unresolved"
  ) {
    throw new Error(
      "Planner 31 duration authority detached from Planner 28 exact distance authority.",
    );
  }

  if (
    !mode ||
    mode.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    mode.sourceWayId !== record.sourceWayId ||
    mode.sourceFromNodeId !== record.sourceFromNodeId ||
    mode.sourceToNodeId !== record.sourceToNodeId ||
    mode.mode !== "walk" ||
    mode.operationalEligibility !== "unresolved" ||
    mode.selectionScope !== "objective-only" ||
    mode.globalEndpointSelection !== "unresolved"
  ) {
    throw new Error(
      "Planner 31 duration authority detached from Planner 30 walk-mode authority.",
    );
  }

  const derived = deriveWalkingDurationMinutes(record.distanceMeters);
  if (derived !== record.durationMinutes) {
    throw new Error(
      "Planner 31 duration does not reproduce from Planner 28 distance under the Planner 19 policy.",
    );
  }
}

assertInteriorWalkingDurationAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_WALKING_DURATION_AUTHORITY:
  readonly InteriorWalkingDurationAuthority[] = deepFreeze(RAW_AUTHORITY);

export function interiorWalkingDurationForObjective(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_WALKING_DURATION_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorWalkingDuration(
  objectiveSourceRecordId: string,
): InteriorWalkingDurationAssessment {
  const duration = interiorWalkingDurationForObjective(objectiveSourceRecordId);
  if (!duration) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_WALKING_DURATION_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }

  return deepFreeze({
    status: "duration-ready",
    objectiveSourceRecordId: duration.objectiveSourceRecordId,
    sourceFromNodeId: duration.sourceFromNodeId,
    sourceToNodeId: duration.sourceToNodeId,
    distanceMeters: duration.distanceMeters,
    durationMinutes: duration.durationMinutes,
    durationScope: duration.durationScope,
    operationalEligibility: duration.operationalEligibility,
    selectionScope: duration.selectionScope,
    globalEndpointSelection: duration.globalEndpointSelection,
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
