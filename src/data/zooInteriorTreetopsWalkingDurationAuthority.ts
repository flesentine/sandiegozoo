import {
  INGRESS_WALKING_DURATION_POLICY,
  deriveWalkingDurationMinutes,
} from "./zooIngressWalkingDurationPolicy.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY,
} from "./zooInteriorTreetopsPedestrianModeAuthority.ts";
import {
  INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY,
} from "./zooInteriorTreetopsSegmentDistanceAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY,
} from "./zooInteriorTreetopsPedestrianDirectionAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-walking-duration" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const DISTANCE_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-distance" as const;
const MODE_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-mode" as const;
const DIRECTION_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-direction" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;
const DISTANCE_METERS = 48.615 as const;
const DURATION_MINUTES = 0.675 as const;

export type InteriorTreetopsWalkingDurationAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  distanceAuthorityId: typeof DISTANCE_AUTHORITY_ID;
  modeAuthorityId: typeof MODE_AUTHORITY_ID;
  directionAuthorityId: typeof DIRECTION_AUTHORITY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
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
  plannerMaterialization: "duration-only";
};

export type InteriorTreetopsWalkingDurationAssessment =
  | {
      status: "duration-ready";
      authorityId: typeof AUTHORITY_ID;
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      distanceMeters: typeof DISTANCE_METERS;
      durationMinutes: typeof DURATION_MINUTES;
      durationScope: "neutral-free-flow";
      operationalEligibility: "unresolved";
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_DIFFICULTY_NOT_QUALIFIED",
          "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
          "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
          "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
          "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_WALKING_DURATION_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_DIFFICULTY_NOT_QUALIFIED",
  "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
  "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
  "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
  "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
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

const RAW_AUTHORITY: InteriorTreetopsWalkingDurationAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    distanceAuthorityId: DISTANCE_AUTHORITY_ID,
    modeAuthorityId: MODE_AUTHORITY_ID,
    directionAuthorityId: DIRECTION_AUTHORITY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
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
    plannerMaterialization: "duration-only",
  },
];

function assertCanonicalInteriorTreetopsWalkingDurationIntegrity(): void {
  const policy = INGRESS_WALKING_DURATION_POLICY;
  const distance = INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0];
  const mode = INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0];
  const direction = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY[0];
  const authority = RAW_AUTHORITY[0];

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
      "Planner 48 requires the unchanged shared free-flow walking-duration policy.",
    );
  }

  if (
    distance.id !== DISTANCE_AUTHORITY_ID ||
    distance.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    distance.sourceWayId !== SOURCE_WAY_ID ||
    distance.sourceWayVersion !== SOURCE_WAY_VERSION ||
    distance.sourceFromNodeId !== FROM_NODE_ID ||
    distance.sourceToNodeId !== TO_NODE_ID ||
    distance.distanceMeters !== DISTANCE_METERS
  ) {
    throw new Error(
      "Planner 48 duration authority detached from Planner 46 exact distance.",
    );
  }

  if (
    mode.id !== MODE_AUTHORITY_ID ||
    mode.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    mode.sourceWayId !== SOURCE_WAY_ID ||
    mode.sourceWayVersion !== SOURCE_WAY_VERSION ||
    mode.sourceFromNodeId !== FROM_NODE_ID ||
    mode.sourceToNodeId !== TO_NODE_ID ||
    mode.mode !== "walk" ||
    mode.operationalEligibility !== "unresolved"
  ) {
    throw new Error(
      "Planner 48 duration authority detached from Planner 45 walk mode.",
    );
  }

  if (
    direction.id !== DIRECTION_AUTHORITY_ID ||
    direction.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    direction.sourceWayId !== SOURCE_WAY_ID ||
    direction.sourceWayVersion !== SOURCE_WAY_VERSION ||
    direction.sourceFromNodeId !== FROM_NODE_ID ||
    direction.sourceToNodeId !== TO_NODE_ID ||
    direction.oneWay !== false ||
    direction.direction !== "bidirectional" ||
    direction.directionScope !== "static-osm-baseline"
  ) {
    throw new Error(
      "Planner 48 duration authority detached from Planner 47 pedestrian direction.",
    );
  }

  if (
    authority.id !== AUTHORITY_ID ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.distanceAuthorityId !== DISTANCE_AUTHORITY_ID ||
    authority.modeAuthorityId !== MODE_AUTHORITY_ID ||
    authority.directionAuthorityId !== DIRECTION_AUTHORITY_ID ||
    authority.sourceWayId !== SOURCE_WAY_ID ||
    authority.sourceWayVersion !== SOURCE_WAY_VERSION ||
    authority.sourceFromNodeId !== FROM_NODE_ID ||
    authority.sourceToNodeId !== TO_NODE_ID ||
    authority.distanceMeters !== DISTANCE_METERS ||
    authority.durationMinutes !== DURATION_MINUTES ||
    authority.derivationMethod !== "distance-over-fixed-walk-speed" ||
    authority.speedMetersPerSecond !== 1.2 ||
    authority.roundingDecimals !== 3 ||
    authority.minimumDurationMinutes !== null ||
    authority.paceAdjustment !== "none" ||
    authority.terrainAdjustment !== "none" ||
    authority.queueAdjustment !== "none" ||
    authority.accessControlDelayAdjustment !== "none" ||
    authority.crowdAdjustment !== "none" ||
    authority.policyId !== "sdz-walking-duration-policy-v1" ||
    authority.policyVersion !== "1" ||
    authority.policyScope !== "free-flow-walk-edges" ||
    authority.durationScope !== "neutral-free-flow" ||
    authority.operationalEligibility !== "unresolved" ||
    authority.plannerMaterialization !== "duration-only"
  ) {
    throw new Error(
      "Planner 48 walking duration authority drifted from the frozen exact-segment contract.",
    );
  }

  const derived = deriveWalkingDurationMinutes(authority.distanceMeters);
  if (derived !== DURATION_MINUTES || derived !== authority.durationMinutes) {
    throw new Error(
      "Planner 48 duration no longer reproduces from Planner 46 distance under the shared policy.",
    );
  }

  for (const field of [
    "mode",
    "oneWay",
    "direction",
    "difficulty",
    "stairs",
    "accessible",
    "stroller",
    "status",
    "routeNodeId",
    "routeEdgeId",
  ] as const) {
    if (Object.hasOwn(authority, field)) {
      throw new Error(
        `Planner 48 duration authority cannot own downstream field ${field}.`,
      );
    }
  }
}

assertCanonicalInteriorTreetopsWalkingDurationIntegrity();

export const INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY:
  readonly InteriorTreetopsWalkingDurationAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function interiorTreetopsWalkingDurationForObjective(
  objectiveSourceRecordId: string,
): InteriorTreetopsWalkingDurationAuthority | undefined {
  return INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorTreetopsWalkingDuration(
  objectiveSourceRecordId: string,
): InteriorTreetopsWalkingDurationAssessment {
  const duration =
    interiorTreetopsWalkingDurationForObjective(objectiveSourceRecordId);

  if (!duration) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_WALKING_DURATION_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "duration-ready",
    authorityId: duration.id,
    objectiveSourceRecordId: duration.objectiveSourceRecordId,
    sourceWayId: duration.sourceWayId,
    sourceWayVersion: duration.sourceWayVersion,
    sourceFromNodeId: duration.sourceFromNodeId,
    sourceToNodeId: duration.sourceToNodeId,
    distanceMeters: duration.distanceMeters,
    durationMinutes: duration.durationMinutes,
    durationScope: duration.durationScope,
    operationalEligibility: duration.operationalEligibility,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
