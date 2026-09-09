import {
  DERIVED_INGRESS_DISTANCES,
  INGRESS_GEOMETRY_WAYS,
} from "./zooIngressDistanceAuthority.ts";
import {
  INDEPENDENT_GEOSPATIAL_TARGETS,
} from "./zooGeospatialAuthority.ts";

export type WalkingDurationPolicy = {
  id: "sdz-walking-duration-policy-v1";
  policyVersion: "1";
  adoptedAt: string;
  scope: "free-flow-walk-edges";
  speedMetersPerSecond: 1.2;
  roundingDecimals: 3;
  minimumDurationMinutes: null;
  paceAdjustment: "none";
  terrainAdjustment: "none";
  queueAdjustment: "none";
  accessControlDelayAdjustment: "none";
  crowdAdjustment: "none";
  authority:
    "prospective-product-policy";
};

export type DerivedIngressWalkingDuration = {
  id: string;
  targetId: string;
  sourceWayId: string;
  sourceDistanceId: string;
  distanceMeters: number;
  durationMinutes: number;
  derivationMethod:
    "distance-over-fixed-walk-speed";
  speedMetersPerSecond: 1.2;
  roundingDecimals: 3;
  policyId: WalkingDurationPolicy["id"];
  policyVersion:
    WalkingDurationPolicy["policyVersion"];
  plannerMaterialization:
    "duration-only";
};

export type IngressWalkingDurationAssessment =
  | {
      status: "blocked";
      reason:
        | "TARGET_UNKNOWN"
        | "NO_DISTANCE_SEGMENTS";
      targetId: string;
    }
  | {
      status: "duration-ready";
      targetId: string;
      durationIds: string[];
      totalDurationMinutes: number;
      policyId: WalkingDurationPolicy["id"];
      policyVersion:
        WalkingDurationPolicy["policyVersion"];
    };

const SPEED_METERS_PER_SECOND = 1.2 as const;
const ROUNDING_DECIMALS = 3 as const;
const ADOPTED_AT =
  "2026-09-08T18:11:00-07:00";

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

function stableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function validTimestamp(value: string) {
  return (
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  );
}

function roundDuration(value: number) {
  const scale = 10 ** ROUNDING_DECIMALS;
  return Math.round(value * scale) / scale;
}

export const INGRESS_WALKING_DURATION_POLICY:
  WalkingDurationPolicy = deepFreeze({
    id: "sdz-walking-duration-policy-v1",
    policyVersion: "1",
    adoptedAt: ADOPTED_AT,
    scope: "free-flow-walk-edges",
    speedMetersPerSecond:
      SPEED_METERS_PER_SECOND,
    roundingDecimals:
      ROUNDING_DECIMALS,
    minimumDurationMinutes: null,
    paceAdjustment: "none",
    terrainAdjustment: "none",
    queueAdjustment: "none",
    accessControlDelayAdjustment: "none",
    crowdAdjustment: "none",
    authority:
      "prospective-product-policy",
  });

export function deriveWalkingDurationMinutes(
  distanceMeters: number,
) {
  if (
    typeof distanceMeters !== "number" ||
    !Number.isFinite(distanceMeters) ||
    distanceMeters <= 0
  ) {
    throw new Error(
      "Walking duration requires a finite positive distance.",
    );
  }

  const roundedDurationMinutes =
    roundDuration(
      distanceMeters /
        SPEED_METERS_PER_SECOND /
        60,
    );

  if (roundedDurationMinutes <= 0) {
    throw new Error(
      "Walking duration is below the policy's positive representable resolution.",
    );
  }

  return roundedDurationMinutes;
}

function deriveIngressDurations():
  DerivedIngressWalkingDuration[] {
  return DERIVED_INGRESS_DISTANCES.map(
    (distance) => ({
      id:
        `${distance.id}-walking-duration-v1`,
      targetId: distance.targetId,
      sourceWayId: distance.sourceWayId,
      sourceDistanceId: distance.id,
      distanceMeters:
        distance.distanceMeters,
      durationMinutes:
        deriveWalkingDurationMinutes(
          distance.distanceMeters,
        ),
      derivationMethod:
        "distance-over-fixed-walk-speed",
      speedMetersPerSecond:
        SPEED_METERS_PER_SECOND,
      roundingDecimals:
        ROUNDING_DECIMALS,
      policyId:
        INGRESS_WALKING_DURATION_POLICY.id,
      policyVersion:
        INGRESS_WALKING_DURATION_POLICY.policyVersion,
      plannerMaterialization:
        "duration-only",
    }),
  );
}

const RAW_DURATIONS =
  deriveIngressDurations();

export function assertIngressWalkingDurationPolicyIntegrity(
  policy: WalkingDurationPolicy,
  durations:
    readonly DerivedIngressWalkingDuration[],
) {
  if (
    policy.id !==
      "sdz-walking-duration-policy-v1" ||
    policy.policyVersion !== "1" ||
    !validTimestamp(policy.adoptedAt) ||
    policy.adoptedAt !== ADOPTED_AT ||
    policy.scope !==
      "free-flow-walk-edges" ||
    policy.speedMetersPerSecond !==
      SPEED_METERS_PER_SECOND ||
    policy.roundingDecimals !==
      ROUNDING_DECIMALS ||
    policy.minimumDurationMinutes !==
      null ||
    policy.paceAdjustment !== "none" ||
    policy.terrainAdjustment !==
      "none" ||
    policy.queueAdjustment !== "none" ||
    policy.accessControlDelayAdjustment !==
      "none" ||
    policy.crowdAdjustment !== "none" ||
    policy.authority !==
      "prospective-product-policy"
  ) {
    throw new Error(
      "Planner 19 walking-duration policy drifted from the prospective freeze.",
    );
  }

  if (
    durations.length !==
    DERIVED_INGRESS_DISTANCES.length
  ) {
    throw new Error(
      "Every Planner 13 ingress distance requires exactly one Planner 19 walking duration.",
    );
  }

  const ids = new Set<string>();
  const sourceWayIds =
    new Set<string>();

  for (const duration of durations) {
    const distance =
      DERIVED_INGRESS_DISTANCES.find(
        (candidate) =>
          candidate.id ===
          duration.sourceDistanceId,
      );

    const way =
      INGRESS_GEOMETRY_WAYS.find(
        (candidate) =>
          candidate.sourceObjectId ===
          duration.sourceWayId,
      );

    if (
      !stableId(duration.id) ||
      ids.has(duration.id) ||
      !distance ||
      !way ||
      way.highwayTag !== "pedestrian" ||
      way.sourceObjectId !==
        distance.sourceWayId ||
      sourceWayIds.has(
        duration.sourceWayId,
      ) ||
      duration.id !==
        `${distance.id}-walking-duration-v1` ||
      duration.targetId !==
        distance.targetId ||
      duration.sourceWayId !==
        distance.sourceWayId ||
      duration.distanceMeters !==
        distance.distanceMeters ||
      duration.durationMinutes !==
        deriveWalkingDurationMinutes(
          distance.distanceMeters,
        ) ||
      duration.derivationMethod !==
        "distance-over-fixed-walk-speed" ||
      duration.speedMetersPerSecond !==
        policy.speedMetersPerSecond ||
      duration.roundingDecimals !==
        policy.roundingDecimals ||
      duration.policyId !== policy.id ||
      duration.policyVersion !==
        policy.policyVersion ||
      duration.plannerMaterialization !==
        "duration-only"
    ) {
      throw new Error(
        `Planner 19 walking duration ${duration.id} does not match its frozen distance/policy authority.`,
      );
    }

    ids.add(duration.id);
    sourceWayIds.add(
      duration.sourceWayId,
    );
  }
}

assertIngressWalkingDurationPolicyIntegrity(
  INGRESS_WALKING_DURATION_POLICY,
  RAW_DURATIONS,
);

export const DERIVED_INGRESS_WALKING_DURATIONS:
  readonly DerivedIngressWalkingDuration[] =
  deepFreeze(RAW_DURATIONS);

export function walkingDurationForSourceWay(
  sourceWayId: string,
) {
  return DERIVED_INGRESS_WALKING_DURATIONS.find(
    (duration) =>
      duration.sourceWayId ===
      sourceWayId,
  );
}

export function assessIngressWalkingDurationAuthority(
  targetId: string,
): IngressWalkingDurationAssessment {
  const matchingDistances =
    DERIVED_INGRESS_DISTANCES.filter(
      (distance) =>
        distance.targetId === targetId,
    );

  if (
    matchingDistances.length === 0
  ) {
    const knownTarget =
      INDEPENDENT_GEOSPATIAL_TARGETS.some(
        (target) =>
          target.id === targetId,
      );

    return {
      status: "blocked",
      reason: knownTarget
        ? "NO_DISTANCE_SEGMENTS"
        : "TARGET_UNKNOWN",
      targetId,
    };
  }

  const durations =
    DERIVED_INGRESS_WALKING_DURATIONS.filter(
      (duration) =>
        duration.targetId === targetId,
    );

  if (
    durations.length !==
    matchingDistances.length
  ) {
    throw new Error(
      `Planner 19 duration integrity failure for target ${targetId}.`,
    );
  }

  return {
    status: "duration-ready",
    targetId,
    durationIds: durations.map(
      (duration) => duration.id,
    ),
    totalDurationMinutes:
      roundDuration(
        durations.reduce(
          (sum, duration) =>
            sum +
            duration.durationMinutes,
          0,
        ),
      ),
    policyId:
      INGRESS_WALKING_DURATION_POLICY.id,
    policyVersion:
      INGRESS_WALKING_DURATION_POLICY.policyVersion,
  };
}
