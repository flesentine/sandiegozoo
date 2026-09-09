import type {
  RouteDifficulty,
} from "../planner/contracts.ts";
import {
  OFFICIAL_ZOO_MAP_ARTIFACTS,
  PUBLISHED_WALKING_CORRIDORS,
  type PublishedWalkingCorridor,
} from "./zooMapAuthority.ts";
import {
  INGRESS_GEOMETRY_WAYS,
} from "./zooIngressDistanceAuthority.ts";
import {
  entrancePedestrianTopologyForTarget,
} from "./zooGuestNavigationAuthority.ts";
import {
  pedestrianDirectionSourceForWay,
  type PedestrianDirectionSourceSnapshot,
} from "./zooIngressPedestrianDirectionAuthority.ts";

export type CorridorTerrainEvidence = {
  id: string;
  artifactId: string;
  corridorId: string;
  corridorName: string;
  sourceUrl: string;
  observedAt: string;
  publishedTerrain:
    PublishedWalkingCorridor["terrain"];
  stairsEvidence:
    | "explicitly-published"
    | "not-explicitly-published";
  plannerDifficultyAuthority:
    "source-terrain-only";
  plannerStairsAuthority:
    "corridor-only";
  scope: "named-corridor";
  plannerMaterialization:
    "corridor-terrain-evidence-only";
};

export type ExactStairsAuthority =
  | {
      status: "supported";
      value: true;
      basis: "OSM highway=steps";
      sourceSnapshotId: string;
    }
  | {
      status: "blocked";
      reason:
        "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED";
      basis: "Planner 18 stairs authority";
      sourceSnapshotId: string;
      corridorTerrainEvidenceId?: string;
    };

export type ExactDifficultyAuthority = {
  status: "blocked";
  reason:
    | "EXACT_EDGE_DIFFICULTY_NOT_SOURCED"
    | "CORRIDOR_TERRAIN_NOT_EXACT_EDGE_AUTHORITY";
  basis: "Planner 18 difficulty authority";
  sourceSnapshotId: string;
  corridorTerrainEvidenceId?: string;
};

export type IngressTerrainAssessment = {
  sourceWayId: string;
  difficultyAuthority:
    ExactDifficultyAuthority;
  stairsAuthority: ExactStairsAuthority;
};

export type UnknownIngressTerrainAssessment = {
  sourceWayId: string;
  status: "blocked";
  reason: "SOURCE_WAY_UNKNOWN";
};

export const TERRAIN_SEMANTIC_REFERENCES =
  Object.freeze([
    "https://wiki.openstreetmap.org/wiki/Tag:highway%3Dsteps",
    "https://wiki.openstreetmap.org/wiki/Key:incline",
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

function validOsmSemanticReference(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname ===
        "wiki.openstreetmap.org" &&
      (url.pathname ===
        "/wiki/Tag:highway%3Dsteps" ||
        url.pathname === "/wiki/Key:incline")
    );
  } catch {
    return false;
  }
}

function sourceArtifactForCorridor(
  corridor: PublishedWalkingCorridor,
) {
  return OFFICIAL_ZOO_MAP_ARTIFACTS.find(
    (artifact) =>
      artifact.id === corridor.artifactId,
  );
}

function stairsEvidenceForTerrain(
  terrain:
    PublishedWalkingCorridor["terrain"],
): CorridorTerrainEvidence["stairsEvidence"] {
  return terrain === "steep-and-stairs"
    ? "explicitly-published"
    : "not-explicitly-published";
}

function buildCorridorTerrainEvidence(
  corridor: PublishedWalkingCorridor,
): CorridorTerrainEvidence {
  const artifact =
    sourceArtifactForCorridor(corridor);
  if (
    !artifact ||
    artifact.kind !== "accessibility-map"
  ) {
    throw new Error(
      `Walking corridor ${corridor.id} lacks qualified accessibility-map terrain authority.`,
    );
  }

  return {
    id: `${corridor.id}-terrain-evidence`,
    artifactId: artifact.id,
    corridorId: corridor.id,
    corridorName: corridor.name,
    sourceUrl: artifact.sourceUrl,
    observedAt: artifact.observedAt,
    publishedTerrain: corridor.terrain,
    stairsEvidence:
      stairsEvidenceForTerrain(
        corridor.terrain,
      ),
    plannerDifficultyAuthority:
      "source-terrain-only",
    plannerStairsAuthority:
      "corridor-only",
    scope: "named-corridor",
    plannerMaterialization:
      "corridor-terrain-evidence-only",
  };
}

const RAW_CORRIDOR_TERRAIN_EVIDENCE =
  PUBLISHED_WALKING_CORRIDORS.map(
    buildCorridorTerrainEvidence,
  );

export function assertCorridorTerrainAuthorityIntegrity(
  evidence:
    readonly CorridorTerrainEvidence[],
) {
  for (
    const reference of
    TERRAIN_SEMANTIC_REFERENCES
  ) {
    if (
      !validOsmSemanticReference(reference)
    ) {
      throw new Error(
        `Invalid terrain semantic reference: ${reference}`,
      );
    }
  }

  if (
    evidence.length !==
    PUBLISHED_WALKING_CORRIDORS.length
  ) {
    throw new Error(
      "Every published walking corridor requires exactly one Planner 18 terrain evidence record.",
    );
  }

  const ids = new Set<string>();
  const corridorIds = new Set<string>();

  for (const record of evidence) {
    const corridor =
      PUBLISHED_WALKING_CORRIDORS.find(
        (candidate) =>
          candidate.id === record.corridorId,
      );
    const artifact = corridor
      ? sourceArtifactForCorridor(corridor)
      : undefined;

    if (
      !stableId(record.id) ||
      ids.has(record.id) ||
      !corridor ||
      !artifact ||
      corridorIds.has(record.corridorId) ||
      record.id !==
        `${corridor.id}-terrain-evidence` ||
      record.artifactId !==
        corridor.artifactId ||
      record.corridorName !== corridor.name ||
      record.sourceUrl !== artifact.sourceUrl ||
      record.observedAt !==
        artifact.observedAt ||
      record.publishedTerrain !==
        corridor.terrain ||
      record.stairsEvidence !==
        stairsEvidenceForTerrain(
          corridor.terrain,
        ) ||
      record.plannerDifficultyAuthority !==
        "source-terrain-only" ||
      record.plannerStairsAuthority !==
        "corridor-only" ||
      record.scope !== "named-corridor" ||
      record.plannerMaterialization !==
        "corridor-terrain-evidence-only"
    ) {
      throw new Error(
        `Corridor terrain evidence ${record.id} drifted from Planner 10 map authority.`,
      );
    }

    ids.add(record.id);
    corridorIds.add(record.corridorId);
  }
}

assertCorridorTerrainAuthorityIntegrity(
  RAW_CORRIDOR_TERRAIN_EVIDENCE,
);

export const CORRIDOR_TERRAIN_EVIDENCE:
  readonly CorridorTerrainEvidence[] =
  deepFreeze(
    RAW_CORRIDOR_TERRAIN_EVIDENCE,
  );

export function corridorTerrainEvidenceForId(
  corridorId: string,
) {
  return CORRIDOR_TERRAIN_EVIDENCE.find(
    (record) =>
      record.corridorId === corridorId,
  );
}

export function classifyExactStairsAuthority(
  snapshot: Pick<
    PedestrianDirectionSourceSnapshot,
    "id" | "sourceTags"
  >,
): ExactStairsAuthority {
  if (
    snapshot.sourceTags.highway === "steps"
  ) {
    return {
      status: "supported",
      value: true,
      basis: "OSM highway=steps",
      sourceSnapshotId: snapshot.id,
    };
  }

  return {
    status: "blocked",
    reason:
      "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
    basis: "Planner 18 stairs authority",
    sourceSnapshotId: snapshot.id,
  };
}

function frontStreetTerrainEvidenceForWay(
  sourceWayId: string,
) {
  const way = INGRESS_GEOMETRY_WAYS.find(
    (candidate) =>
      candidate.sourceObjectId ===
      sourceWayId,
  );
  if (!way) return undefined;

  const topology =
    entrancePedestrianTopologyForTarget(
      way.targetId,
    );
  if (!topology) return undefined;

  const isFrontStreetConnection =
    way.geometryRole ===
      "interior-front-street-connection" &&
    way.sourceObjectId ===
      topology.interiorContinuationWayId &&
    way.nodeIds[
      way.nodeIds.length - 1
    ] === topology.frontStreetConnectionNodeId &&
    topology.connectsToDescriptor ===
      "Front Street";

  return isFrontStreetConnection
    ? corridorTerrainEvidenceForId(
        "sdz-corridor-front-street",
      )
    : undefined;
}

export function assessIngressTerrainAuthority(
  sourceWayId: string,
):
  | IngressTerrainAssessment
  | UnknownIngressTerrainAssessment {
  const way = INGRESS_GEOMETRY_WAYS.find(
    (candidate) =>
      candidate.sourceObjectId ===
      sourceWayId,
  );
  if (!way) {
    return {
      sourceWayId,
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
    };
  }

  const sourceSnapshot =
    pedestrianDirectionSourceForWay(
      sourceWayId,
    );
  if (!sourceSnapshot) {
    throw new Error(
      `Planner 18 ingress way ${sourceWayId} lacks the qualified source-tag snapshot.`,
    );
  }

  const corridorTerrain =
    frontStreetTerrainEvidenceForWay(
      sourceWayId,
    );

  const stairsAuthority =
    classifyExactStairsAuthority(
      sourceSnapshot,
    );

  const stairsWithContext:
    ExactStairsAuthority =
    stairsAuthority.status === "blocked" &&
    corridorTerrain
      ? {
          ...stairsAuthority,
          corridorTerrainEvidenceId:
            corridorTerrain.id,
        }
      : stairsAuthority;

  return {
    sourceWayId,
    difficultyAuthority: {
      status: "blocked",
      reason: corridorTerrain
        ? "CORRIDOR_TERRAIN_NOT_EXACT_EDGE_AUTHORITY"
        : "EXACT_EDGE_DIFFICULTY_NOT_SOURCED",
      basis:
        "Planner 18 difficulty authority",
      sourceSnapshotId:
        sourceSnapshot.id,
      ...(corridorTerrain
        ? {
            corridorTerrainEvidenceId:
              corridorTerrain.id,
          }
        : {}),
    },
    stairsAuthority:
      stairsWithContext,
  };
}

export function plannerDifficultyForPublishedTerrain(
  _terrain:
    PublishedWalkingCorridor["terrain"],
):
  | RouteDifficulty
  | {
      status: "blocked";
      reason:
        "DIFFICULTY_POLICY_NOT_DEFINED";
    } {
  return {
    status: "blocked",
    reason:
      "DIFFICULTY_POLICY_NOT_DEFINED",
  };
}
