import {
  ENTRANCE_PEDESTRIAN_TOPOLOGY,
} from "./zooGuestNavigationAuthority.ts";
import {
  PUBLISHED_WALKING_CORRIDORS,
} from "./zooMapAuthority.ts";

export type InteriorGraphExpansionSeed = {
  id: string;
  provider: "OpenStreetMap";
  sourceWayId: string;
  sourceUrl: string;
  connectionNodeId: string;
  connectionNodeSourceUrl: string;
  ingressTopologyId: string;
  officialCorridorId: string;
  officialMapArtifactId: string;
  officialPublishedWalkMinutes: number;
  officialCorridorTerrain: "mild";
  officialCorridorAccessLabels: readonly string[];
  sourceState: "way-identified-geometry-not-sourced";
  plannerMaterialization: "graph-expansion-seed-only";
};

export type InteriorGraphExpansionAssessment = {
  status: "expansion-seed-ready";
  seedId: string;
  sourceWayId: string;
  connectionNodeId: string;
  officialCorridorId: string;
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "FRONT_STREET_WAY_GEOMETRY_NOT_CAPTURED",
      "EXPANSION_ENDPOINT_NODE_NOT_SOURCED",
      "EXACT_SEGMENT_MODE_NOT_SOURCED",
      "EXACT_SEGMENT_DISTANCE_NOT_SOURCED",
      "EXACT_SEGMENT_DURATION_NOT_SOURCED",
      "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
      "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
      "EXACT_SEGMENT_PEDESTRIAN_DIRECTION_NOT_SOURCED",
      "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
      "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
    ];
  };
};

const INTERIOR_GRAPH_EXPANSION_SEED_FIELDS = [
  "id",
  "provider",
  "sourceWayId",
  "sourceUrl",
  "connectionNodeId",
  "connectionNodeSourceUrl",
  "ingressTopologyId",
  "officialCorridorId",
  "officialMapArtifactId",
  "officialPublishedWalkMinutes",
  "officialCorridorTerrain",
  "officialCorridorAccessLabels",
  "sourceState",
  "plannerMaterialization",
] as const;

const INTERIOR_GRAPH_EXPANSION_SEED_FIELD_SET = new Set<string>(
  INTERIOR_GRAPH_EXPANSION_SEED_FIELDS,
);

const FORBIDDEN_ROUTE_EDGE_FIELDS = [
  "fromNodeId",
  "toNodeId",
  "mode",
  "distanceMeters",
  "durationMinutes",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "oneWay",
  "status",
  "provenance",
] as const;

const EXPANSION_BLOCK_REASONS = [
  "FRONT_STREET_WAY_GEOMETRY_NOT_CAPTURED",
  "EXPANSION_ENDPOINT_NODE_NOT_SOURCED",
  "EXACT_SEGMENT_MODE_NOT_SOURCED",
  "EXACT_SEGMENT_DISTANCE_NOT_SOURCED",
  "EXACT_SEGMENT_DURATION_NOT_SOURCED",
  "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  "EXACT_SEGMENT_PEDESTRIAN_DIRECTION_NOT_SOURCED",
  "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
  "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
] as const;

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

function validOsmObjectUrl(
  value: unknown,
  objectType: "node" | "way",
  objectId: unknown,
) {
  if (
    typeof value !== "string" ||
    typeof objectId !== "string"
  ) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.openstreetmap.org" &&
      url.pathname === `/${objectType}/${objectId}`
    );
  } catch {
    return false;
  }
}

function exactOsmSourceUrl(
  sourceUrls: readonly string[],
  objectType: "node" | "way",
  objectId: string,
) {
  const matches = sourceUrls.filter((sourceUrl) =>
    validOsmObjectUrl(sourceUrl, objectType, objectId),
  );

  if (matches.length !== 1) {
    throw new Error(
      `Planner 25 requires exactly one ${objectType} source URL for OSM object ${objectId}.`,
    );
  }

  return matches[0];
}

function assertPlainSeedObject(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      "Planner 25 interior graph expansion seed must be a plain object.",
    );
  }
}

function assertNoRouteEdgeMaterialization(
  value: Record<string, unknown>,
  label: string,
) {
  for (const field of FORBIDDEN_ROUTE_EDGE_FIELDS) {
    if (field in value) {
      throw new Error(
        `${label} cannot materialize Planner RouteEdge field ${field}.`,
      );
    }
  }
}

function assertNoUnknownSeedFields(
  value: Record<string, unknown>,
  label: string,
) {
  const unknownFields = Object.keys(value)
    .filter(
      (field) =>
        !INTERIOR_GRAPH_EXPANSION_SEED_FIELD_SET.has(field),
    )
    .sort();

  if (unknownFields.length > 0) {
    throw new Error(
      `${label} cannot contain unknown field ${unknownFields.join(
        ", ",
      )}.`,
    );
  }
}

const FRONT_STREET_TOPOLOGIES =
  ENTRANCE_PEDESTRIAN_TOPOLOGY.filter(
    (record) =>
      record.connectsToDescriptor === "Front Street",
  );

if (FRONT_STREET_TOPOLOGIES.length !== 1) {
  throw new Error(
    "Planner 25 requires exactly one qualified ingress topology connected to Front Street.",
  );
}

const FRONT_STREET_TOPOLOGY = FRONT_STREET_TOPOLOGIES[0];

const FRONT_STREET_CORRIDORS =
  PUBLISHED_WALKING_CORRIDORS.filter(
    (corridor) =>
      corridor.id === "sdz-corridor-front-street" &&
      corridor.name === "Front Street",
  );

if (FRONT_STREET_CORRIDORS.length !== 1) {
  throw new Error(
    "Planner 25 requires exactly one official Front Street corridor authority record.",
  );
}

const FRONT_STREET_CORRIDOR = FRONT_STREET_CORRIDORS[0];

const FRONT_STREET_SOURCE_URL = exactOsmSourceUrl(
  FRONT_STREET_TOPOLOGY.waySourceUrls,
  "way",
  FRONT_STREET_TOPOLOGY.frontStreetWayId,
);

const FRONT_STREET_CONNECTION_NODE_SOURCE_URL =
  exactOsmSourceUrl(
    FRONT_STREET_TOPOLOGY.connectionNodeSourceUrls,
    "node",
    FRONT_STREET_TOPOLOGY.frontStreetConnectionNodeId,
  );

const RAW_SEEDS: InteriorGraphExpansionSeed[] = [
  {
    id: "sdz-interior-expansion-front-street",
    provider: "OpenStreetMap",
    sourceWayId:
      FRONT_STREET_TOPOLOGY.frontStreetWayId,
    sourceUrl: FRONT_STREET_SOURCE_URL,
    connectionNodeId:
      FRONT_STREET_TOPOLOGY.frontStreetConnectionNodeId,
    connectionNodeSourceUrl:
      FRONT_STREET_CONNECTION_NODE_SOURCE_URL,
    ingressTopologyId: FRONT_STREET_TOPOLOGY.id,
    officialCorridorId: FRONT_STREET_CORRIDOR.id,
    officialMapArtifactId:
      FRONT_STREET_CORRIDOR.artifactId,
    officialPublishedWalkMinutes:
      FRONT_STREET_CORRIDOR.publishedWalkMinutes,
    officialCorridorTerrain: "mild",
    officialCorridorAccessLabels: [
      ...(FRONT_STREET_CORRIDOR.accessLabels ?? []),
    ],
    sourceState: "way-identified-geometry-not-sourced",
    plannerMaterialization: "graph-expansion-seed-only",
  },
];

export function assertInteriorGraphExpansionAuthorityIntegrity(
  seeds: readonly InteriorGraphExpansionSeed[],
) {
  if (seeds.length !== 1) {
    throw new Error(
      "Planner 25 currently requires exactly one conservative interior expansion seed.",
    );
  }

  const candidate: unknown = seeds[0];
  assertPlainSeedObject(candidate);

  const label = `Interior graph expansion seed ${String(
    candidate.id,
  )}`;
  assertNoRouteEdgeMaterialization(candidate, label);
  assertNoUnknownSeedFields(candidate, label);

  const seed = candidate as InteriorGraphExpansionSeed;

  if (
    !stableId(seed.id) ||
    seed.provider !== "OpenStreetMap" ||
    seed.sourceWayId !==
      FRONT_STREET_TOPOLOGY.frontStreetWayId ||
    seed.connectionNodeId !==
      FRONT_STREET_TOPOLOGY.frontStreetConnectionNodeId ||
    seed.ingressTopologyId !== FRONT_STREET_TOPOLOGY.id ||
    seed.sourceUrl !== FRONT_STREET_SOURCE_URL ||
    seed.connectionNodeSourceUrl !==
      FRONT_STREET_CONNECTION_NODE_SOURCE_URL ||
    !validOsmObjectUrl(
      seed.sourceUrl,
      "way",
      seed.sourceWayId,
    ) ||
    !validOsmObjectUrl(
      seed.connectionNodeSourceUrl,
      "node",
      seed.connectionNodeId,
    )
  ) {
    throw new Error(
      "Planner 25 Front Street expansion seed drifted from qualified ingress topology.",
    );
  }

  if (
    seed.officialCorridorId !==
      FRONT_STREET_CORRIDOR.id ||
    seed.officialMapArtifactId !==
      FRONT_STREET_CORRIDOR.artifactId ||
    seed.officialPublishedWalkMinutes !== 20 ||
    seed.officialPublishedWalkMinutes !==
      FRONT_STREET_CORRIDOR.publishedWalkMinutes ||
    seed.officialCorridorTerrain !== "mild" ||
    seed.officialCorridorTerrain !==
      FRONT_STREET_CORRIDOR.terrain ||
    JSON.stringify(seed.officialCorridorAccessLabels) !==
      JSON.stringify(
        FRONT_STREET_CORRIDOR.accessLabels ?? [],
      )
  ) {
    throw new Error(
      "Planner 25 Front Street expansion seed drifted from official corridor authority.",
    );
  }

  if (
    seed.sourceState !==
      "way-identified-geometry-not-sourced" ||
    seed.plannerMaterialization !==
      "graph-expansion-seed-only"
  ) {
    throw new Error(
      "Planner 25 expansion seed lost its non-materializing authority boundary.",
    );
  }
}

assertInteriorGraphExpansionAuthorityIntegrity(
  RAW_SEEDS,
);

export const INTERIOR_GRAPH_EXPANSION_SEEDS:
  readonly InteriorGraphExpansionSeed[] =
  deepFreeze(RAW_SEEDS);

export function interiorGraphExpansionSeedForWay(
  sourceWayId: string,
) {
  return INTERIOR_GRAPH_EXPANSION_SEEDS.find(
    (seed) => seed.sourceWayId === sourceWayId,
  );
}

export function assessInteriorGraphExpansion(
  seedId = "sdz-interior-expansion-front-street",
): InteriorGraphExpansionAssessment {
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS.find(
    (candidate) => candidate.id === seedId,
  );

  if (!seed) {
    throw new Error(
      `Unknown Planner 25 interior graph expansion seed: ${seedId}.`,
    );
  }

  return deepFreeze({
    status: "expansion-seed-ready",
    seedId: seed.id,
    sourceWayId: seed.sourceWayId,
    connectionNodeId: seed.connectionNodeId,
    officialCorridorId: seed.officialCorridorId,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...EXPANSION_BLOCK_REASONS],
    },
  });
}
