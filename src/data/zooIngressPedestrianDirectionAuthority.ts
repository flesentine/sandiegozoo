import {
  INGRESS_GEOMETRY_WAYS,
} from "./zooIngressDistanceAuthority.ts";
import {
  ENTRANCE_ACCESS_CONTROL_OBSERVATIONS,
} from "./zooGuestNavigationAuthority.ts";

export type PedestrianDirectionSourceSnapshot = {
  id: string;
  targetId: string;
  sourceWayId: string;
  sourceUrl: string;
  highwayTag: "pedestrian";
  genericOnewayTag: "yes" | "absent";
  onewayFootTag: "yes" | "no" | "-1" | "absent";
  accessControlObservationId?: string;
  plannerMaterialization:
    "pedestrian-direction-authority-only";
};

export type PedestrianDirectionAssessment =
  | {
      status: "blocked";
      reason:
        | "SOURCE_WAY_UNKNOWN"
        | "GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT"
        | "PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED";
      sourceWayId: string;
      sourceSnapshotId?: string;
    }
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
        | "OSM oneway:foot=yes"
        | "OSM oneway:foot=-1"
        | "OSM oneway:foot=no";
    };

export const PEDESTRIAN_DIRECTION_SEMANTIC_REFERENCES =
  Object.freeze([
    "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
    "https://wiki.openstreetmap.org/wiki/Key:oneway",
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

function stableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function validOsmWayUrl(
  value: string,
  wayId: string,
) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.openstreetmap.org" &&
      url.pathname === `/way/${wayId}`
    );
  } catch {
    return false;
  }
}

function validSemanticReference(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname ===
        "wiki.openstreetmap.org" &&
      (url.pathname === "/wiki/Key:oneway:foot" ||
        url.pathname === "/wiki/Key:oneway")
    );
  } catch {
    return false;
  }
}

const RAW_DIRECTION_SNAPSHOTS:
  PedestrianDirectionSourceSnapshot[] = [
  {
    id: "sdz-pedestrian-direction-way-755054695",
    targetId: "sdz-geo-main-entrance",
    sourceWayId: "755054695",
    sourceUrl:
      "https://www.openstreetmap.org/way/755054695",
    highwayTag: "pedestrian",
    genericOnewayTag: "yes",
    onewayFootTag: "absent",
    accessControlObservationId:
      "sdz-guest-entrance-turnstile-osm-node-7053320517",
    plannerMaterialization:
      "pedestrian-direction-authority-only",
  },
  {
    id: "sdz-pedestrian-direction-way-755054694",
    targetId: "sdz-geo-main-entrance",
    sourceWayId: "755054694",
    sourceUrl:
      "https://www.openstreetmap.org/way/755054694",
    highwayTag: "pedestrian",
    genericOnewayTag: "absent",
    onewayFootTag: "absent",
    plannerMaterialization:
      "pedestrian-direction-authority-only",
  },
];

export function assertPedestrianDirectionAuthorityIntegrity(
  snapshots:
    readonly PedestrianDirectionSourceSnapshot[],
) {
  for (
    const reference of
    PEDESTRIAN_DIRECTION_SEMANTIC_REFERENCES
  ) {
    if (!validSemanticReference(reference)) {
      throw new Error(
        `Invalid pedestrian-direction semantic reference: ${reference}`,
      );
    }
  }

  const wayById = new Map(
    INGRESS_GEOMETRY_WAYS.map((way) => [
      way.sourceObjectId,
      way,
    ]),
  );
  const turnstile =
    ENTRANCE_ACCESS_CONTROL_OBSERVATIONS.find(
      (observation) =>
        observation.targetId ===
        "sdz-geo-main-entrance",
    );

  if (
    !turnstile ||
    turnstile.barrier !== "turnstile" ||
    turnstile.access !== "customers"
  ) {
    throw new Error(
      "Planner 16 requires the qualified Planner 12 customer turnstile context.",
    );
  }

  if (snapshots.length !== INGRESS_GEOMETRY_WAYS.length) {
    throw new Error(
      "Every current ingress way requires exactly one pedestrian-direction source snapshot.",
    );
  }

  const ids = new Set<string>();
  const wayIds = new Set<string>();

  for (const snapshot of snapshots) {
    if (
      !stableId(snapshot.id) ||
      ids.has(snapshot.id)
    ) {
      throw new Error(
        `Invalid or duplicate pedestrian-direction snapshot ID: ${snapshot.id}`,
      );
    }
    ids.add(snapshot.id);

    const way = wayById.get(snapshot.sourceWayId);
    if (
      !way ||
      wayIds.has(snapshot.sourceWayId) ||
      snapshot.targetId !== way.targetId ||
      snapshot.sourceUrl !== way.sourceUrl ||
      !validOsmWayUrl(
        snapshot.sourceUrl,
        snapshot.sourceWayId,
      ) ||
      snapshot.highwayTag !== "pedestrian" ||
      snapshot.plannerMaterialization !==
        "pedestrian-direction-authority-only"
    ) {
      throw new Error(
        `Pedestrian-direction snapshot ${snapshot.id} does not match ingress source authority.`,
      );
    }

    if (
      snapshot.genericOnewayTag !== "yes" &&
      snapshot.genericOnewayTag !== "absent"
    ) {
      throw new Error(
        `Pedestrian-direction snapshot ${snapshot.id} has unsupported generic oneway authority.`,
      );
    }

    if (
      snapshot.onewayFootTag !== "yes" &&
      snapshot.onewayFootTag !== "no" &&
      snapshot.onewayFootTag !== "-1" &&
      snapshot.onewayFootTag !== "absent"
    ) {
      throw new Error(
        `Pedestrian-direction snapshot ${snapshot.id} has unsupported oneway:foot authority.`,
      );
    }

    if (
      snapshot.sourceWayId ===
      turnstile.pedestrianWayId
    ) {
      if (
        snapshot.accessControlObservationId !==
        turnstile.id
      ) {
        throw new Error(
          `Pedestrian-direction snapshot ${snapshot.id} lost its qualified turnstile context.`,
        );
      }
    } else if (
      snapshot.accessControlObservationId !==
      undefined
    ) {
      throw new Error(
        `Pedestrian-direction snapshot ${snapshot.id} claims unrelated access-control context.`,
      );
    }

    if (
      snapshot.sourceWayId === "755054695" &&
      (snapshot.genericOnewayTag !== "yes" ||
        snapshot.onewayFootTag !== "absent")
    ) {
      throw new Error(
        "Controlled entrance passage direction tags drifted from the qualified source snapshot.",
      );
    }

    if (
      snapshot.sourceWayId === "755054694" &&
      (snapshot.genericOnewayTag !== "absent" ||
        snapshot.onewayFootTag !== "absent")
    ) {
      throw new Error(
        "Interior Front Street connection direction tags drifted from the qualified source snapshot.",
      );
    }

    wayIds.add(snapshot.sourceWayId);
  }

  if (wayIds.size !== INGRESS_GEOMETRY_WAYS.length) {
    throw new Error(
      "Pedestrian-direction source coverage is incomplete.",
    );
  }
}

assertPedestrianDirectionAuthorityIntegrity(
  RAW_DIRECTION_SNAPSHOTS,
);

export const PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOTS:
  readonly PedestrianDirectionSourceSnapshot[] =
  deepFreeze(RAW_DIRECTION_SNAPSHOTS);

export function pedestrianDirectionSourceForWay(
  sourceWayId: string,
) {
  return PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOTS.find(
    (snapshot) =>
      snapshot.sourceWayId === sourceWayId,
  );
}

export function classifyPedestrianDirectionSnapshot(
  snapshot: PedestrianDirectionSourceSnapshot,
): Exclude<
  PedestrianDirectionAssessment,
  {
    status: "blocked";
    reason: "SOURCE_WAY_UNKNOWN";
  }
> {
  if (snapshot.onewayFootTag === "yes") {
    return {
      status: "supported",
      sourceWayId: snapshot.sourceWayId,
      sourceSnapshotId: snapshot.id,
      oneWay: true,
      direction: "with-source-way-order",
      basis: "OSM oneway:foot=yes",
    };
  }

  if (snapshot.onewayFootTag === "-1") {
    return {
      status: "supported",
      sourceWayId: snapshot.sourceWayId,
      sourceSnapshotId: snapshot.id,
      oneWay: true,
      direction: "against-source-way-order",
      basis: "OSM oneway:foot=-1",
    };
  }

  if (snapshot.onewayFootTag === "no") {
    return {
      status: "supported",
      sourceWayId: snapshot.sourceWayId,
      sourceSnapshotId: snapshot.id,
      oneWay: false,
      direction: "bidirectional",
      basis: "OSM oneway:foot=no",
    };
  }

  if (snapshot.genericOnewayTag === "yes") {
    return {
      status: "blocked",
      reason:
        "GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT",
      sourceWayId: snapshot.sourceWayId,
      sourceSnapshotId: snapshot.id,
    };
  }

  return {
    status: "blocked",
    reason:
      "PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED",
    sourceWayId: snapshot.sourceWayId,
    sourceSnapshotId: snapshot.id,
  };
}

export function assessPedestrianDirectionAuthority(
  sourceWayId: string,
): PedestrianDirectionAssessment {
  const snapshot =
    pedestrianDirectionSourceForWay(sourceWayId);

  if (!snapshot) {
    return {
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
      sourceWayId,
    };
  }

  return classifyPedestrianDirectionSnapshot(snapshot);
}
