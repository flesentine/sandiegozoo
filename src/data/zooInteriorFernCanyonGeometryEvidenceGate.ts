import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
} from "./zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import {
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY,
} from "./zooInteriorTreetopsEndpointRouteNodeAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-fern-canyon-trail-geometry-evidence-gate" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const ANCHOR_NODE_ID = "13588159626" as const;
const SOURCE_WAY_ID = "1481578621" as const;
const SOURCE_WAY_VERSION = 1 as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const SOURCE_WAY_CHANGESET = 178875075 as const;
const SOURCE_WAY_NAME = "Fern Canyon Trail" as const;
const FAR_ENDPOINT_NODE_ID = "13588159625" as const;
const ANCHOR_WAY_INDEX = 1 as const;
const FAR_ENDPOINT_WAY_INDEX = 0 as const;
const BLOCK_REASON =
  "VERSION_PINNED_FERN_CANYON_FAR_ENDPOINT_COORDINATE_NOT_CAPTURED" as const;

const ORDERED_NODE_IDS = [
  FAR_ENDPOINT_NODE_ID,
  ANCHOR_NODE_ID,
] as const;

export type InteriorFernCanyonGeometryEvidenceGate = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578621";
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/1481578621/1";
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_WAY_CHANGESET;
  sourceHighway: "footway";
  sourceName: typeof SOURCE_WAY_NAME;
  orderedNodeIds: readonly [
    typeof FAR_ENDPOINT_NODE_ID,
    typeof ANCHOR_NODE_ID,
  ];
  anchorWayIndex: typeof ANCHOR_WAY_INDEX;
  farEndpointNodeId: typeof FAR_ENDPOINT_NODE_ID;
  farEndpointWayIndex: typeof FAR_ENDPOINT_WAY_INDEX;
  farEndpointCoordinateStatus: "not-captured";
  farEndpointTopologyStatus: "not-captured";
  plannerMaterialization: "geometry-evidence-gate-only";
};

export type InteriorFernCanyonGeometryEvidenceAssessment = {
  status: "blocked";
  reason: typeof BLOCK_REASON;
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  farEndpointNodeId: typeof FAR_ENDPOINT_NODE_ID;
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "EXACT_FERN_CANYON_FAR_ENDPOINT_COORDINATE_NOT_SOURCED",
      "FERN_CANYON_FAR_ENDPOINT_TOPOLOGY_NOT_SOURCED",
      "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
    ];
  };
};

const TOP_LEVEL_FIELDS = [
  "id",
  "provider",
  "objectiveSourceRecordId",
  "anchorNodeId",
  "sourceWayId",
  "sourceWayUrl",
  "sourceWayVersionUrl",
  "sourceWayVersion",
  "sourceWayTimestamp",
  "sourceWayChangeset",
  "sourceHighway",
  "sourceName",
  "orderedNodeIds",
  "anchorWayIndex",
  "farEndpointNodeId",
  "farEndpointWayIndex",
  "farEndpointCoordinateStatus",
  "farEndpointTopologyStatus",
  "plannerMaterialization",
] as const;

const FORBIDDEN_DOWNSTREAM_FIELDS = [
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
  "lat",
  "lng",
  "coordinates",
  "sourceWayCoordinates",
] as const;

const ROUTE_GRAPH_BLOCK_REASONS = [
  "EXACT_FERN_CANYON_FAR_ENDPOINT_COORDINATE_NOT_SOURCED",
  "FERN_CANYON_FAR_ENDPOINT_TOPOLOGY_NOT_SOURCED",
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

function nullPrototypeRecord<T extends object>(value: T): T {
  const result = Object.create(null) as T;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new Error(
        "Planner 59 canonical authority requires own data fields.",
      );
    }
    Object.defineProperty(result, key, descriptor);
  }
  return result;
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
    throw new Error(
      `${label} must be an ordinary array of length ${expectedLength}.`,
    );
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
      throw new Error(
        `${label} requires enumerable own data element ${index}.`,
      );
    }
  }
}

function assertExactPlainObject(
  value: unknown,
  allowedFields: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  const prototype =
    value && typeof value === "object"
      ? Object.getPrototypeOf(value)
      : undefined;

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    (prototype !== Object.prototype && prototype !== null)
  ) {
    throw new Error(
      `${label} must be a plain object with Object.prototype or null prototype.`,
    );
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
    throw new Error(
      `${label} cannot contain unknown field ${unknown.join(", ")}.`,
    );
  }
  if (missing.length > 0) {
    throw new Error(
      `${label} is missing required field ${missing.join(", ")}.`,
    );
  }

  for (const field of allowedFields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(
        `${label} requires enumerable own data field ${field}.`,
      );
    }
  }
}

function assertNoDownstreamMaterialization(
  value: Record<string, unknown>,
  label: string,
): void {
  for (const field of FORBIDDEN_DOWNSTREAM_FIELDS) {
    if (field in value) {
      throw new Error(
        `${label} cannot materialize downstream field ${field}.`,
      );
    }
  }
}

const RAW_AUTHORITY: InteriorFernCanyonGeometryEvidenceGate[] = [
  nullPrototypeRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    anchorNodeId: ANCHOR_NODE_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578621",
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481578621/1",
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceWayChangeset: SOURCE_WAY_CHANGESET,
    sourceHighway: "footway",
    sourceName: SOURCE_WAY_NAME,
    orderedNodeIds: [...ORDERED_NODE_IDS],
    anchorWayIndex: ANCHOR_WAY_INDEX,
    farEndpointNodeId: FAR_ENDPOINT_NODE_ID,
    farEndpointWayIndex: FAR_ENDPOINT_WAY_INDEX,
    farEndpointCoordinateStatus: "not-captured",
    farEndpointTopologyStatus: "not-captured",
    plannerMaterialization: "geometry-evidence-gate-only",
  }),
];

export function assertInteriorFernCanyonGeometryEvidenceGateIntegrity(
  authorities: readonly InteriorFernCanyonGeometryEvidenceGate[],
): void {
  const collectionLabel =
    "Planner 59 Fern Canyon geometry evidence-gate collection";
  const gateLabel = "Planner 59 Fern Canyon geometry evidence gate";

  assertExactOrdinaryArray(authorities, 1, collectionLabel);

  const authorityDescriptor = Object.getOwnPropertyDescriptor(
    authorities,
    "0",
  );
  if (
    !authorityDescriptor ||
    !authorityDescriptor.enumerable ||
    !("value" in authorityDescriptor)
  ) {
    throw new Error(
      `${collectionLabel} requires enumerable own data element 0.`,
    );
  }

  const candidate: unknown = authorityDescriptor.value;
  assertExactPlainObject(candidate, TOP_LEVEL_FIELDS, gateLabel);
  assertNoDownstreamMaterialization(candidate, gateLabel);

  const record =
    candidate as unknown as InteriorFernCanyonGeometryEvidenceGate;
  const topology = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  const selected = topology.selectedJunctionConnection;
  const endpoint = INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY;

  if (
    record.id !== AUTHORITY_ID ||
    record.provider !== "OpenStreetMap" ||
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.anchorNodeId !== ANCHOR_NODE_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceWayUrl !==
      "https://www.openstreetmap.org/way/1481578621" ||
    record.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/1481578621/1" ||
    record.sourceWayVersion !== SOURCE_WAY_VERSION ||
    record.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    record.sourceWayChangeset !== SOURCE_WAY_CHANGESET ||
    record.sourceHighway !== "footway" ||
    record.sourceName !== SOURCE_WAY_NAME ||
    record.orderedNodeIds.length !== 2 ||
    record.orderedNodeIds[0] !== FAR_ENDPOINT_NODE_ID ||
    record.orderedNodeIds[1] !== ANCHOR_NODE_ID ||
    record.anchorWayIndex !== ANCHOR_WAY_INDEX ||
    record.farEndpointNodeId !== FAR_ENDPOINT_NODE_ID ||
    record.farEndpointWayIndex !== FAR_ENDPOINT_WAY_INDEX ||
    record.farEndpointCoordinateStatus !== "not-captured" ||
    record.farEndpointTopologyStatus !== "not-captured" ||
    record.plannerMaterialization !== "geometry-evidence-gate-only"
  ) {
    throw new Error(
      "Planner 59 Fern Canyon geometry evidence gate drifted from its frozen source boundary.",
    );
  }

  if (
    topology.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    topology.nextJunctionNodeId !== record.anchorNodeId ||
    selected.sharedNodeId !== record.anchorNodeId ||
    selected.sourceWayId !== record.sourceWayId ||
    selected.sourceWayUrl !== record.sourceWayUrl ||
    selected.sourceWayVersionUrl !== record.sourceWayVersionUrl ||
    selected.sourceWayVersion !== record.sourceWayVersion ||
    selected.sourceWayTimestamp !== record.sourceWayTimestamp ||
    selected.sourceWayChangeset !== record.sourceWayChangeset ||
    selected.sourceHighway !== record.sourceHighway ||
    selected.sourceName !== record.sourceName ||
    selected.orderedNodeIds.length !== 2 ||
    selected.orderedNodeIds[0] !== record.orderedNodeIds[0] ||
    selected.orderedNodeIds[1] !== record.orderedNodeIds[1]
  ) {
    throw new Error(
      "Planner 59 Fern Canyon source identity drifted from Planner 44 historical topology evidence.",
    );
  }

  if (
    endpoint.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    endpoint.sourceObjectId !== record.anchorNodeId ||
    endpoint.sourceVersion !== 1 ||
    endpoint.lat !== 32.7352422 ||
    endpoint.lng !== -117.1501397
  ) {
    throw new Error(
      "Planner 59 anchor drifted from the Planner 55 Treetops endpoint RouteNode authority.",
    );
  }

  assertExactOrdinaryArray(
    record.orderedNodeIds,
    2,
    "Planner 59 Fern Canyon ordered node sequence",
  );
}

assertInteriorFernCanyonGeometryEvidenceGateIntegrity(RAW_AUTHORITY);

export const INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE:
  readonly InteriorFernCanyonGeometryEvidenceGate[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorFernCanyonGeometryEvidence():
  InteriorFernCanyonGeometryEvidenceAssessment {
  return deepFreeze(
    nullPrototypeRecord<InteriorFernCanyonGeometryEvidenceAssessment>({
      status: "blocked",
      reason: BLOCK_REASON,
      authorityId: AUTHORITY_ID,
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      anchorNodeId: ANCHOR_NODE_ID,
      sourceWayId: SOURCE_WAY_ID,
      sourceWayVersion: SOURCE_WAY_VERSION,
      farEndpointNodeId: FAR_ENDPOINT_NODE_ID,
      routeGraphExpansion: nullPrototypeRecord({
        status: "blocked",
        reasons: [...ROUTE_GRAPH_BLOCK_REASONS],
      }),
    }),
  );
}
