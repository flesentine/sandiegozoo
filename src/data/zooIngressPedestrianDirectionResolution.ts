import {
  INGRESS_GEOMETRY_WAYS,
} from "./zooIngressDistanceAuthority.ts";
import {
  assessPedestrianDirectionAuthority,
  pedestrianDirectionSourceForWay,
  type PedestrianDirectionAssessment,
} from "./zooIngressPedestrianDirectionAuthority.ts";

export type PedestrianDirectionResolutionPolicy = {
  id: "sdz-pedestrian-direction-resolution-policy-v1";
  policyVersion: "1";
  adoptedAt: string;
  scope: "highway-pedestrian-ingress-ways";
  genericOnewayOnPedestrianWay:
    "vehicle-only-unless-explicit-foot-direction";
  noPedestrianDirectionRestriction:
    "bidirectional-by-default";
  explicitPedestrianDirection:
    "planner-16-authoritative";
  authority:
    "prospective-osm-interpretation-policy";
  semanticReferenceUrls: readonly [
    "https://wiki.openstreetmap.org/wiki/Key:oneway",
    "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
  ];
};

export type ResolvedPedestrianDirectionAuthority =
  | {
      status: "supported";
      sourceWayId: string;
      sourceSnapshotId: string;
      oneWay: boolean;
      direction:
        | "with-source-way-order"
        | "against-source-way-order"
        | "bidirectional";
      basis:
        | "Planner 16 explicit pedestrian-direction authority"
        | "Planner 21 generic oneway on highway=pedestrian is vehicle-only"
        | "Planner 21 default pedestrian bidirectionality absent explicit restriction";
      policyId:
        PedestrianDirectionResolutionPolicy["id"];
      resolutionCase:
        | "explicit-planner-16"
        | "generic-oneway-vehicle-only"
        | "no-explicit-pedestrian-restriction";
    }
  | {
      status: "blocked";
      sourceWayId: string;
      reason:
        | "SOURCE_WAY_UNKNOWN"
        | "POLICY_SCOPE_NOT_APPLICABLE"
        | "PEDESTRIAN_DIRECTION_TAG_UNSUPPORTED";
      sourceSnapshotId?: string;
    };

const ADOPTED_AT =
  "2026-09-09T09:04:00-07:00";

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

function validTimestamp(value: string) {
  return (
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  );
}

function validSemanticUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname ===
        "wiki.openstreetmap.org" &&
      (url.pathname ===
        "/wiki/Key:oneway" ||
        url.pathname ===
          "/wiki/Key:oneway:foot")
    );
  } catch {
    return false;
  }
}

const RAW_POLICY:
  PedestrianDirectionResolutionPolicy = {
  id:
    "sdz-pedestrian-direction-resolution-policy-v1",
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope:
    "highway-pedestrian-ingress-ways",
  genericOnewayOnPedestrianWay:
    "vehicle-only-unless-explicit-foot-direction",
  noPedestrianDirectionRestriction:
    "bidirectional-by-default",
  explicitPedestrianDirection:
    "planner-16-authoritative",
  authority:
    "prospective-osm-interpretation-policy",
  semanticReferenceUrls: [
    "https://wiki.openstreetmap.org/wiki/Key:oneway",
    "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
  ],
};

export function assertPedestrianDirectionResolutionPolicyIntegrity(
  policy:
    PedestrianDirectionResolutionPolicy,
) {
  if (
    policy.id !==
      "sdz-pedestrian-direction-resolution-policy-v1" ||
    policy.policyVersion !== "1" ||
    !validTimestamp(policy.adoptedAt) ||
    policy.adoptedAt !== ADOPTED_AT ||
    policy.scope !==
      "highway-pedestrian-ingress-ways" ||
    policy.genericOnewayOnPedestrianWay !==
      "vehicle-only-unless-explicit-foot-direction" ||
    policy.noPedestrianDirectionRestriction !==
      "bidirectional-by-default" ||
    policy.explicitPedestrianDirection !==
      "planner-16-authoritative" ||
    policy.authority !==
      "prospective-osm-interpretation-policy" ||
    policy.semanticReferenceUrls.length !==
      2 ||
    policy.semanticReferenceUrls[0] !==
      "https://wiki.openstreetmap.org/wiki/Key:oneway" ||
    policy.semanticReferenceUrls[1] !==
      "https://wiki.openstreetmap.org/wiki/Key:oneway:foot" ||
    policy.semanticReferenceUrls.some(
      (url) => !validSemanticUrl(url),
    )
  ) {
    throw new Error(
      "Planner 21 pedestrian-direction resolution policy drifted from the prospective freeze.",
    );
  }
}

assertPedestrianDirectionResolutionPolicyIntegrity(
  RAW_POLICY,
);

export const PEDESTRIAN_DIRECTION_RESOLUTION_POLICY:
  PedestrianDirectionResolutionPolicy =
  deepFreeze(RAW_POLICY);

function supportedFromPlanner16(
  assessment: Extract<
    PedestrianDirectionAssessment,
    { status: "supported" }
  >,
): ResolvedPedestrianDirectionAuthority {
  return {
    status: "supported",
    sourceWayId:
      assessment.sourceWayId,
    sourceSnapshotId:
      assessment.sourceSnapshotId,
    oneWay: assessment.oneWay,
    direction: assessment.direction,
    basis:
      "Planner 16 explicit pedestrian-direction authority",
    policyId:
      PEDESTRIAN_DIRECTION_RESOLUTION_POLICY.id,
    resolutionCase:
      "explicit-planner-16",
  };
}

export function resolveIngressPedestrianDirection(
  sourceWayId: string,
): ResolvedPedestrianDirectionAuthority {
  const way = INGRESS_GEOMETRY_WAYS.find(
    (candidate) =>
      candidate.sourceObjectId ===
      sourceWayId,
  );
  const snapshot =
    pedestrianDirectionSourceForWay(
      sourceWayId,
    );
  const planner16 =
    assessPedestrianDirectionAuthority(
      sourceWayId,
    );

  if (
    !way ||
    !snapshot ||
    planner16.reason ===
      "SOURCE_WAY_UNKNOWN"
  ) {
    return {
      status: "blocked",
      sourceWayId,
      reason: "SOURCE_WAY_UNKNOWN",
    };
  }

  if (planner16.status === "supported") {
    return supportedFromPlanner16(
      planner16,
    );
  }

  if (
    snapshot.sourceTags.highway !==
      "pedestrian"
  ) {
    return {
      status: "blocked",
      sourceWayId,
      reason:
        "POLICY_SCOPE_NOT_APPLICABLE",
      sourceSnapshotId: snapshot.id,
    };
  }

  if (
    planner16.reason ===
      "PEDESTRIAN_DIRECTION_TAG_UNSUPPORTED"
  ) {
    return {
      status: "blocked",
      sourceWayId,
      reason:
        "PEDESTRIAN_DIRECTION_TAG_UNSUPPORTED",
      sourceSnapshotId: snapshot.id,
    };
  }

  if (
    planner16.reason ===
      "GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT" &&
    snapshot.sourceTags.oneway === "yes"
  ) {
    return {
      status: "supported",
      sourceWayId,
      sourceSnapshotId: snapshot.id,
      oneWay: false,
      direction: "bidirectional",
      basis:
        "Planner 21 generic oneway on highway=pedestrian is vehicle-only",
      policyId:
        PEDESTRIAN_DIRECTION_RESOLUTION_POLICY.id,
      resolutionCase:
        "generic-oneway-vehicle-only",
    };
  }

  if (
    planner16.reason ===
      "PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED" &&
    snapshot.sourceTags.oneway ===
      undefined
  ) {
    return {
      status: "supported",
      sourceWayId,
      sourceSnapshotId: snapshot.id,
      oneWay: false,
      direction: "bidirectional",
      basis:
        "Planner 21 default pedestrian bidirectionality absent explicit restriction",
      policyId:
        PEDESTRIAN_DIRECTION_RESOLUTION_POLICY.id,
      resolutionCase:
        "no-explicit-pedestrian-restriction",
    };
  }

  return {
    status: "blocked",
    sourceWayId,
    reason:
      "POLICY_SCOPE_NOT_APPLICABLE",
    sourceSnapshotId: snapshot.id,
  };
}

export function assertIngressPedestrianDirectionResolutionIntegrity(
  sourceWayIds: readonly string[],
) {
  if (
    sourceWayIds.length !==
      INGRESS_GEOMETRY_WAYS.length ||
    new Set(sourceWayIds).size !==
      sourceWayIds.length
  ) {
    throw new Error(
      "Planner 21 direction resolution requires exactly one current ingress way binding.",
    );
  }

  for (const sourceWayId of sourceWayIds) {
    const way = INGRESS_GEOMETRY_WAYS.find(
      (candidate) =>
        candidate.sourceObjectId ===
        sourceWayId,
    );
    const resolved =
      resolveIngressPedestrianDirection(
        sourceWayId,
      );

    if (
      !way ||
      way.highwayTag !==
        "pedestrian" ||
      resolved.status !== "supported" ||
      resolved.sourceWayId !==
        sourceWayId ||
      resolved.oneWay !== false ||
      resolved.direction !==
        "bidirectional" ||
      resolved.policyId !==
        PEDESTRIAN_DIRECTION_RESOLUTION_POLICY.id
    ) {
      throw new Error(
        `Planner 21 pedestrian direction resolution drifted for ingress way ${sourceWayId}.`,
      );
    }
  }
}

assertIngressPedestrianDirectionResolutionIntegrity(
  INGRESS_GEOMETRY_WAYS.map(
    (way) => way.sourceObjectId,
  ),
);
