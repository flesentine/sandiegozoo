import {
  INTERIOR_GRAPH_EXPANSION_SEEDS,
} from "./zooInteriorGraphExpansionAuthority.ts";
import {
  INGRESS_GEOMETRY_NODES,
} from "./zooIngressDistanceAuthority.ts";

const FRONT_STREET_GEOMETRY_AUTHORITY_ID =
  "sdz-interior-front-street-adjacent-geometry" as const;
const FRONT_STREET_WAY_ID = "1481425058" as const;
const CONNECTION_NODE_ID = "7053320515" as const;
const PREVIOUS_ADJACENT_NODE_ID = "1619736626" as const;
const NEXT_ADJACENT_NODE_ID = "6239154982" as const;

export type FrontStreetGeometryNode = {
  sourceObjectId: string;
  sourceUrl: string;
  sourceVersionUrl: string;
  sourceVersion: number;
  sourceTimestamp: string;
  sourceChangeset: number;
  lat: number;
  lng: number;
};

export type FrontStreetAdjacentJunctionCandidate = {
  node: FrontStreetGeometryNode;
  relativePosition: "previous-adjacent" | "next-adjacent";
  connectorWayId: string;
  connectorWayUrl: string;
  connectorWayVersionUrl: string;
  connectorWayVersion: number;
  connectorWayTimestamp: string;
  connectorHighway: "footway";
  connectorName: string | null;
  connectorSurface: string | null;
};

export type InteriorFrontStreetGeometryAuthority = {
  id: typeof FRONT_STREET_GEOMETRY_AUTHORITY_ID;
  provider: "OpenStreetMap";
  sourceWayId: typeof FRONT_STREET_WAY_ID;
  sourceWayUrl: string;
  sourceWayVersionUrl: string;
  sourceWayVersion: 1;
  sourceWayTimestamp: "2026-02-21T14:47:49Z";
  sourceWayNodeCount: 17;
  connectionNodeIndex: 4;
  highwayTag: "pedestrian";
  name: "Front Street";
  footTag: "customers";
  feeTag: "yes";
  surfaceTag: "asphalt";
  connectionNode: FrontStreetGeometryNode;
  sourceWayNeighborhoodNodeIds: readonly [
    typeof PREVIOUS_ADJACENT_NODE_ID,
    typeof CONNECTION_NODE_ID,
    typeof NEXT_ADJACENT_NODE_ID,
  ];
  adjacentJunctionCandidates: readonly [
    FrontStreetAdjacentJunctionCandidate,
    FrontStreetAdjacentJunctionCandidate,
  ];
  endpointSelection: "unresolved";
  plannerMaterialization: "geometry-candidates-only";
};

export type InteriorFrontStreetGeometryAssessment = {
  status: "geometry-candidates-ready";
  authorityId: string;
  sourceWayId: string;
  connectionNodeId: string;
  candidateEndpointNodeIds: readonly [string, string];
  sourceWayNeighborhoodNodeIds: readonly [string, string, string];
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
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

const ISO_TIMESTAMP_RE =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

const TOP_LEVEL_FIELDS = [
  "id",
  "provider",
  "sourceWayId",
  "sourceWayUrl",
  "sourceWayVersionUrl",
  "sourceWayVersion",
  "sourceWayTimestamp",
  "sourceWayNodeCount",
  "connectionNodeIndex",
  "highwayTag",
  "name",
  "footTag",
  "feeTag",
  "surfaceTag",
  "connectionNode",
  "sourceWayNeighborhoodNodeIds",
  "adjacentJunctionCandidates",
  "endpointSelection",
  "plannerMaterialization",
] as const;

const NODE_FIELDS = [
  "sourceObjectId",
  "sourceUrl",
  "sourceVersionUrl",
  "sourceVersion",
  "sourceTimestamp",
  "sourceChangeset",
  "lat",
  "lng",
] as const;

const JUNCTION_FIELDS = [
  "node",
  "relativePosition",
  "connectorWayId",
  "connectorWayUrl",
  "connectorWayVersionUrl",
  "connectorWayVersion",
  "connectorWayTimestamp",
  "connectorHighway",
  "connectorName",
  "connectorSurface",
] as const;

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
  "routeNodeId",
] as const;

const REMAINING_BLOCK_REASONS = [
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
  const extraKeys = Reflect.ownKeys(value).filter(
    (key) => typeof key !== "string" || !allowedOwnKeys.has(key),
  );
  if (extraKeys.length > 0) {
    throw new Error(`${label} cannot contain extra own properties.`);
  }

  for (let index = 0; index < expectedLength; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data element ${index}.`);
    }
  }
}

function validOsmObjectUrl(
  value: unknown,
  objectType: "node" | "way",
  objectId: unknown,
) {
  if (typeof value !== "string" || typeof objectId !== "string") {
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

function validOsmVersionUrl(
  value: unknown,
  objectType: "node" | "way",
  objectId: unknown,
  version: unknown,
) {
  if (
    typeof value !== "string" ||
    typeof objectId !== "string" ||
    typeof version !== "number" ||
    !Number.isSafeInteger(version) ||
    version < 1
  ) {
    return false;
  }
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "api.openstreetmap.org" &&
      url.pathname === `/api/0.6/${objectType}/${objectId}/${version}`
    );
  } catch {
    return false;
  }
}

function validCoordinate(lat: unknown, lng: unknown) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function validTimestamp(value: unknown) {
  return (
    typeof value === "string" &&
    ISO_TIMESTAMP_RE.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function validChangeset(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

function assertNoRouteEdgeMaterialization(
  value: Record<string, unknown>,
  label: string,
) {
  for (const field of FORBIDDEN_ROUTE_EDGE_FIELDS) {
    if (field in value) {
      throw new Error(`${label} cannot materialize Planner RouteEdge field ${field}.`);
    }
  }
}

function assertNodeProvenance(
  node: FrontStreetGeometryNode,
  expected: {
    id: string;
    version: number;
    timestamp: string;
    changeset: number;
    lat: number;
    lng: number;
  },
  label: string,
) {
  if (
    node.sourceObjectId !== expected.id ||
    node.sourceVersion !== expected.version ||
    node.sourceTimestamp !== expected.timestamp ||
    node.sourceChangeset !== expected.changeset ||
    node.lat !== expected.lat ||
    node.lng !== expected.lng ||
    !validOsmObjectUrl(node.sourceUrl, "node", node.sourceObjectId) ||
    !validOsmVersionUrl(
      node.sourceVersionUrl,
      "node",
      node.sourceObjectId,
      node.sourceVersion,
    ) ||
    !validTimestamp(node.sourceTimestamp) ||
    !validChangeset(node.sourceChangeset) ||
    !validCoordinate(node.lat, node.lng)
  ) {
    throw new Error(`${label} drifted from versioned OSM node provenance.`);
  }
}

const RAW_AUTHORITY: InteriorFrontStreetGeometryAuthority[] = [
  {
    id: FRONT_STREET_GEOMETRY_AUTHORITY_ID,
    provider: "OpenStreetMap",
    sourceWayId: FRONT_STREET_WAY_ID,
    sourceWayUrl: "https://www.openstreetmap.org/way/1481425058",
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481425058/1",
    sourceWayVersion: 1,
    sourceWayTimestamp: "2026-02-21T14:47:49Z",
    sourceWayNodeCount: 17,
    connectionNodeIndex: 4,
    highwayTag: "pedestrian",
    name: "Front Street",
    footTag: "customers",
    feeTag: "yes",
    surfaceTag: "asphalt",
    connectionNode: {
      sourceObjectId: CONNECTION_NODE_ID,
      sourceUrl: "https://www.openstreetmap.org/node/7053320515",
      sourceVersionUrl:
        "https://api.openstreetmap.org/api/0.6/node/7053320515/1",
      sourceVersion: 1,
      sourceTimestamp: "2019-12-13T00:23:10Z",
      sourceChangeset: 78341336,
      lat: 32.7351404,
      lng: -117.1496117,
    },
    sourceWayNeighborhoodNodeIds: [
      PREVIOUS_ADJACENT_NODE_ID,
      CONNECTION_NODE_ID,
      NEXT_ADJACENT_NODE_ID,
    ],
    adjacentJunctionCandidates: [
      {
        node: {
          sourceObjectId: PREVIOUS_ADJACENT_NODE_ID,
          sourceUrl: "https://www.openstreetmap.org/node/1619736626",
          sourceVersionUrl:
            "https://api.openstreetmap.org/api/0.6/node/1619736626/2",
          sourceVersion: 2,
          sourceTimestamp: "2013-12-23T19:47:46Z",
          sourceChangeset: 19606502,
          lat: 32.735201,
          lng: -117.1496375,
        },
        relativePosition: "previous-adjacent",
        connectorWayId: "148910139",
        connectorWayUrl: "https://www.openstreetmap.org/way/148910139",
        connectorWayVersionUrl:
          "https://api.openstreetmap.org/api/0.6/way/148910139/7",
        connectorWayVersion: 7,
        connectorWayTimestamp: "2026-02-21T20:28:40Z",
        connectorHighway: "footway",
        connectorName: "Treetops Way",
        connectorSurface: "concrete",
      },
      {
        node: {
          sourceObjectId: NEXT_ADJACENT_NODE_ID,
          sourceUrl: "https://www.openstreetmap.org/node/6239154982",
          sourceVersionUrl:
            "https://api.openstreetmap.org/api/0.6/node/6239154982/1",
          sourceVersion: 1,
          sourceTimestamp: "2019-01-27T06:49:41Z",
          sourceChangeset: 66670306,
          lat: 32.7349978,
          lng: -117.1495509,
        },
        relativePosition: "next-adjacent",
        connectorWayId: "666404421",
        connectorWayUrl: "https://www.openstreetmap.org/way/666404421",
        connectorWayVersionUrl:
          "https://api.openstreetmap.org/api/0.6/way/666404421/2",
        connectorWayVersion: 2,
        connectorWayTimestamp: "2023-01-04T00:10:45Z",
        connectorHighway: "footway",
        connectorName: null,
        connectorSurface: null,
      },
    ],
    endpointSelection: "unresolved",
    plannerMaterialization: "geometry-candidates-only",
  },
];

export function assertInteriorFrontStreetGeometryAuthorityIntegrity(
  authorities: readonly InteriorFrontStreetGeometryAuthority[],
) {
  assertExactOrdinaryArray(
    authorities,
    1,
    "Planner 26 geometry authority collection",
  );

  const candidate: unknown = authorities[0];
  assertExactPlainObject(candidate, TOP_LEVEL_FIELDS, "Planner 26 geometry authority");
  assertNoRouteEdgeMaterialization(candidate, "Planner 26 geometry authority");

  const record = candidate as unknown as InteriorFrontStreetGeometryAuthority;
  assertExactPlainObject(record.connectionNode, NODE_FIELDS, "Planner 26 connection node");
  assertExactOrdinaryArray(
    record.sourceWayNeighborhoodNodeIds,
    3,
    "Planner 26 source-way neighborhood",
  );
  assertExactOrdinaryArray(
    record.adjacentJunctionCandidates,
    2,
    "Planner 26 adjacent-junction candidates",
  );
  for (const [index, junction] of record.adjacentJunctionCandidates.entries()) {
    assertExactPlainObject(junction, JUNCTION_FIELDS, `Planner 26 junction candidate ${index}`);
    assertExactPlainObject(junction.node, NODE_FIELDS, `Planner 26 junction candidate ${index} node`);
  }

  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS.find(
    (entry) => entry.id === "sdz-interior-expansion-front-street",
  );
  const ingressConnection = INGRESS_GEOMETRY_NODES.find(
    (node) => node.sourceObjectId === CONNECTION_NODE_ID,
  );
  if (!seed || !ingressConnection) {
    throw new Error("Planner 26 requires the qualified Planner 25 seed and Planner 13 connection node.");
  }

  if (
    record.id !== FRONT_STREET_GEOMETRY_AUTHORITY_ID ||
    record.provider !== "OpenStreetMap" ||
    record.sourceWayId !== FRONT_STREET_WAY_ID ||
    record.sourceWayId !== seed.sourceWayId ||
    record.connectionNode.sourceObjectId !== CONNECTION_NODE_ID ||
    record.connectionNode.sourceObjectId !== seed.connectionNodeId ||
    record.sourceWayVersion !== 1 ||
    record.sourceWayTimestamp !== "2026-02-21T14:47:49Z" ||
    record.sourceWayNodeCount !== 17 ||
    record.connectionNodeIndex !== 4 ||
    record.highwayTag !== "pedestrian" ||
    record.name !== "Front Street" ||
    record.footTag !== "customers" ||
    record.feeTag !== "yes" ||
    record.surfaceTag !== "asphalt" ||
    record.endpointSelection !== "unresolved" ||
    record.plannerMaterialization !== "geometry-candidates-only"
  ) {
    throw new Error("Planner 26 Front Street geometry authority drifted from the sourced OSM snapshot or Planner 25 seed.");
  }

  if (
    !validOsmObjectUrl(record.sourceWayUrl, "way", record.sourceWayId) ||
    !validOsmVersionUrl(
      record.sourceWayVersionUrl,
      "way",
      record.sourceWayId,
      record.sourceWayVersion,
    ) ||
    !validTimestamp(record.sourceWayTimestamp)
  ) {
    throw new Error("Planner 26 Front Street source-way provenance is malformed.");
  }

  assertNodeProvenance(
    record.connectionNode,
    {
      id: CONNECTION_NODE_ID,
      version: 1,
      timestamp: "2019-12-13T00:23:10Z",
      changeset: 78341336,
      lat: 32.7351404,
      lng: -117.1496117,
    },
    "Planner 26 connection node",
  );

  if (
    record.connectionNode.lat !== ingressConnection.lat ||
    record.connectionNode.lng !== ingressConnection.lng
  ) {
    throw new Error("Planner 26 connection-node coordinates drifted from qualified ingress geometry.");
  }

  if (
    record.sourceWayNeighborhoodNodeIds[0] !== PREVIOUS_ADJACENT_NODE_ID ||
    record.sourceWayNeighborhoodNodeIds[1] !== CONNECTION_NODE_ID ||
    record.sourceWayNeighborhoodNodeIds[2] !== NEXT_ADJACENT_NODE_ID
  ) {
    throw new Error("Planner 26 exact Front Street source-way neighborhood drifted.");
  }

  const [previousCandidate, nextCandidate] = record.adjacentJunctionCandidates;

  assertNodeProvenance(
    previousCandidate.node,
    {
      id: PREVIOUS_ADJACENT_NODE_ID,
      version: 2,
      timestamp: "2013-12-23T19:47:46Z",
      changeset: 19606502,
      lat: 32.735201,
      lng: -117.1496375,
    },
    "Planner 26 previous adjacent node",
  );
  if (
    previousCandidate.relativePosition !== "previous-adjacent" ||
    previousCandidate.connectorWayId !== "148910139" ||
    previousCandidate.connectorWayVersion !== 7 ||
    previousCandidate.connectorWayTimestamp !== "2026-02-21T20:28:40Z" ||
    previousCandidate.connectorHighway !== "footway" ||
    previousCandidate.connectorName !== "Treetops Way" ||
    previousCandidate.connectorSurface !== "concrete" ||
    !validOsmObjectUrl(
      previousCandidate.connectorWayUrl,
      "way",
      previousCandidate.connectorWayId,
    ) ||
    !validOsmVersionUrl(
      previousCandidate.connectorWayVersionUrl,
      "way",
      previousCandidate.connectorWayId,
      previousCandidate.connectorWayVersion,
    ) ||
    !validTimestamp(previousCandidate.connectorWayTimestamp)
  ) {
    throw new Error("Planner 26 previous adjacent junction evidence drifted.");
  }

  assertNodeProvenance(
    nextCandidate.node,
    {
      id: NEXT_ADJACENT_NODE_ID,
      version: 1,
      timestamp: "2019-01-27T06:49:41Z",
      changeset: 66670306,
      lat: 32.7349978,
      lng: -117.1495509,
    },
    "Planner 26 next adjacent node",
  );
  if (
    nextCandidate.relativePosition !== "next-adjacent" ||
    nextCandidate.connectorWayId !== "666404421" ||
    nextCandidate.connectorWayVersion !== 2 ||
    nextCandidate.connectorWayTimestamp !== "2023-01-04T00:10:45Z" ||
    nextCandidate.connectorHighway !== "footway" ||
    nextCandidate.connectorName !== null ||
    nextCandidate.connectorSurface !== null ||
    !validOsmObjectUrl(
      nextCandidate.connectorWayUrl,
      "way",
      nextCandidate.connectorWayId,
    ) ||
    !validOsmVersionUrl(
      nextCandidate.connectorWayVersionUrl,
      "way",
      nextCandidate.connectorWayId,
      nextCandidate.connectorWayVersion,
    ) ||
    !validTimestamp(nextCandidate.connectorWayTimestamp)
  ) {
    throw new Error("Planner 26 next adjacent junction evidence drifted.");
  }
}

assertInteriorFrontStreetGeometryAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY:
  readonly InteriorFrontStreetGeometryAuthority[] =
  deepFreeze(RAW_AUTHORITY);

export function assessInteriorFrontStreetGeometry(): InteriorFrontStreetGeometryAssessment {
  const record = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  return deepFreeze({
    status: "geometry-candidates-ready",
    authorityId: record.id,
    sourceWayId: record.sourceWayId,
    connectionNodeId: record.connectionNode.sourceObjectId,
    candidateEndpointNodeIds: [
      record.adjacentJunctionCandidates[0].node.sourceObjectId,
      record.adjacentJunctionCandidates[1].node.sourceObjectId,
    ],
    sourceWayNeighborhoodNodeIds: [
      ...record.sourceWayNeighborhoodNodeIds,
    ] as [string, string, string],
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
