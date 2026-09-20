import {
  INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY,
} from "./zooInteriorFernCanyonBridgeFootwayGeometry.ts";

const AUTHORITY_ID =
  "sdz-interior-fern-canyon-bridge-footway-far-endpoint-topology" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const ENDPOINT_NODE_ID = "13588159633" as const;
const INBOUND_WAY_ID = "1481578623" as const;
const CONTINUATION_WAY_ID = "1481578624" as const;
const SOURCE_CHANGESET = 178875075 as const;

const INBOUND_NODE_IDS = [
  "13588159627",
  "13588159632",
  ENDPOINT_NODE_ID,
] as const;

const CONTINUATION_NODE_IDS = [
  "13588159634",
  ENDPOINT_NODE_ID,
] as const;

export type FernCanyonBridgeFarEndpointConnection = {
  sourceWayId: string;
  sourceWayVersion: 1;
  sourceWayTimestamp: typeof TARGET_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_CHANGESET;
  sourceWayVersionUrl: string;
  sourceWayUrl: string;
  sourceHighway: "footway" | "steps";
  sourceName: "Fern Canyon Trail";
  sourceBridge?: "yes";
  sourceIncline?: "up";
  sourceLayer?: "1";
  orderedNodeIds: readonly string[];
  endpointNodeIndex: number;
  connectionRole:
    | "inbound-bridge-footway-segment"
    | "onward-steps-continuation";
};

export type InteriorFernCanyonBridgeFarEndpointTopologyAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  targetTimestamp: typeof TARGET_TIMESTAMP;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  endpointCoordinate: {
    lat: 32.7357407;
    lng: -117.1503614;
    sourceVersion: 1;
    sourceTimestamp: typeof TARGET_TIMESTAMP;
    sourceChangeset: typeof SOURCE_CHANGESET;
  };
  connectedWays: readonly [
    FernCanyonBridgeFarEndpointConnection,
    FernCanyonBridgeFarEndpointConnection,
  ];
  selectedContinuationWayId: typeof CONTINUATION_WAY_ID;
  selectedContinuationHighway: "steps";
  selectedContinuationName: "Fern Canyon Trail";
  selectedContinuationEndpointIndex: 1;
  selectionRule:
    "unique-non-inbound-connected-linear-highway-way-at-frozen-timestamp";
  continuationGeometryStatus: "node-sequence-captured-coordinates-not-captured";
  plannerMaterialization: "endpoint-topology-only";
};

export type InteriorFernCanyonBridgeFarEndpointTopologyAssessment = {
  status: "endpoint-topology-sourced";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  historicalConnectedWayCount: 2;
  selectedContinuationWayId: typeof CONTINUATION_WAY_ID;
  selectedContinuationHighway: "steps";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "VERSION_PINNED_FERN_CANYON_NEXT_STEPS_NODE_COORDINATE_NOT_CAPTURED",
      "EXACT_FERN_CANYON_NEXT_STEPS_SEGMENT_PROVENANCE_NOT_COMPLETE",
    ];
  };
};

const TOP_LEVEL_FIELDS = [
  "id",
  "provider",
  "objectiveSourceRecordId",
  "targetTimestamp",
  "endpointNodeId",
  "endpointCoordinate",
  "connectedWays",
  "selectedContinuationWayId",
  "selectedContinuationHighway",
  "selectedContinuationName",
  "selectedContinuationEndpointIndex",
  "selectionRule",
  "continuationGeometryStatus",
  "plannerMaterialization",
] as const;

const COORDINATE_FIELDS = [
  "lat",
  "lng",
  "sourceVersion",
  "sourceTimestamp",
  "sourceChangeset",
] as const;

const CONNECTION_BASE_FIELDS = [
  "sourceWayId",
  "sourceWayVersion",
  "sourceWayTimestamp",
  "sourceWayChangeset",
  "sourceWayVersionUrl",
  "sourceWayUrl",
  "sourceHighway",
  "sourceName",
  "orderedNodeIds",
  "endpointNodeIndex",
  "connectionRole",
] as const;

const INBOUND_EXTRA_FIELDS = ["sourceBridge", "sourceLayer"] as const;
const CONTINUATION_EXTRA_FIELDS = ["sourceIncline"] as const;

const FORBIDDEN_ROUTE_FIELDS = [
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

const BLOCK_REASONS = [
  "VERSION_PINNED_FERN_CANYON_NEXT_STEPS_NODE_COORDINATE_NOT_CAPTURED",
  "EXACT_FERN_CANYON_NEXT_STEPS_SEGMENT_PROVENANCE_NOT_COMPLETE",
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

function nullRecord<T extends object>(value: T): T {
  const result = Object.create(null) as T;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new Error("Planner 64 canonical evidence requires data fields.");
    }
    Object.defineProperty(result, key, descriptor);
  }
  return result;
}

function assertPlain(
  value: unknown,
  fields: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  const prototype =
    value && typeof value === "object" ? Object.getPrototypeOf(value) : undefined;
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    (prototype !== Object.prototype && prototype !== null)
  ) {
    throw new Error(`${label} must be a plain object.`);
  }

  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key === "symbol")) {
    throw new Error(`${label} cannot contain symbol fields.`);
  }
  const expected = new Set(fields);
  const stringKeys = keys as string[];
  const unknown = stringKeys.filter((key) => !expected.has(key)).sort();
  const missing = fields.filter((field) => !Object.hasOwn(value, field));
  if (unknown.length) {
    throw new Error(`${label} cannot contain unknown field ${unknown.join(", ")}.`);
  }
  if (missing.length) {
    throw new Error(`${label} is missing required field ${missing.join(", ")}.`);
  }
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data field ${field}.`);
    }
  }
}

function assertArray(
  value: unknown,
  length: number,
  label: string,
): asserts value is unknown[] {
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype ||
    value.length !== length
  ) {
    throw new Error(`${label} must be an ordinary array of length ${length}.`);
  }
  const allowed = new Set([
    ...Array.from({ length }, (_, index) => String(index)),
    "length",
  ]);
  if (
    Reflect.ownKeys(value).some(
      (key) => typeof key !== "string" || !allowed.has(key),
    )
  ) {
    throw new Error(`${label} cannot contain extra own properties.`);
  }
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data element ${index}.`);
    }
  }
}

function assertNoRouteMaterialization(
  value: Record<string, unknown>,
  label: string,
): void {
  for (const field of FORBIDDEN_ROUTE_FIELDS) {
    if (field in value) {
      throw new Error(`${label} cannot materialize route field ${field}.`);
    }
  }
}

const INBOUND =
  nullRecord<FernCanyonBridgeFarEndpointConnection>({
    sourceWayId: INBOUND_WAY_ID,
    sourceWayVersion: 1,
    sourceWayTimestamp: TARGET_TIMESTAMP,
    sourceWayChangeset: SOURCE_CHANGESET,
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481578623/1",
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578623",
    sourceHighway: "footway",
    sourceName: "Fern Canyon Trail",
    sourceBridge: "yes",
    sourceLayer: "1",
    orderedNodeIds: [...INBOUND_NODE_IDS],
    endpointNodeIndex: 2,
    connectionRole: "inbound-bridge-footway-segment",
  });

const CONTINUATION =
  nullRecord<FernCanyonBridgeFarEndpointConnection>({
    sourceWayId: CONTINUATION_WAY_ID,
    sourceWayVersion: 1,
    sourceWayTimestamp: TARGET_TIMESTAMP,
    sourceWayChangeset: SOURCE_CHANGESET,
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481578624/1",
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578624",
    sourceHighway: "steps",
    sourceName: "Fern Canyon Trail",
    sourceIncline: "up",
    orderedNodeIds: [...CONTINUATION_NODE_IDS],
    endpointNodeIndex: 1,
    connectionRole: "onward-steps-continuation",
  });

const RAW_AUTHORITY: InteriorFernCanyonBridgeFarEndpointTopologyAuthority[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    endpointNodeId: ENDPOINT_NODE_ID,
    endpointCoordinate: nullRecord({
      lat: 32.7357407,
      lng: -117.1503614,
      sourceVersion: 1,
      sourceTimestamp: TARGET_TIMESTAMP,
      sourceChangeset: SOURCE_CHANGESET,
    }),
    connectedWays: [INBOUND, CONTINUATION],
    selectedContinuationWayId: CONTINUATION_WAY_ID,
    selectedContinuationHighway: "steps",
    selectedContinuationName: "Fern Canyon Trail",
    selectedContinuationEndpointIndex: 1,
    selectionRule:
      "unique-non-inbound-connected-linear-highway-way-at-frozen-timestamp",
    continuationGeometryStatus:
      "node-sequence-captured-coordinates-not-captured",
    plannerMaterialization: "endpoint-topology-only",
  }),
];

export function assertInteriorFernCanyonBridgeFarEndpointTopologyIntegrity(
  authorities: readonly InteriorFernCanyonBridgeFarEndpointTopologyAuthority[],
): void {
  assertArray(authorities, 1, "Planner 64 authority collection");
  const candidate = authorities[0] as unknown;
  assertPlain(candidate, TOP_LEVEL_FIELDS, "Planner 64 authority");
  assertNoRouteMaterialization(candidate, "Planner 64 authority");

  const authority =
    candidate as unknown as InteriorFernCanyonBridgeFarEndpointTopologyAuthority;
  assertPlain(
    authority.endpointCoordinate,
    COORDINATE_FIELDS,
    "Planner 64 endpoint coordinate",
  );
  assertArray(authority.connectedWays, 2, "Planner 64 connected way collection");

  const inbound = authority.connectedWays[0];
  const continuation = authority.connectedWays[1];
  assertPlain(
    inbound,
    [...CONNECTION_BASE_FIELDS, ...INBOUND_EXTRA_FIELDS],
    "Planner 64 inbound connection",
  );
  assertPlain(
    continuation,
    [...CONNECTION_BASE_FIELDS, ...CONTINUATION_EXTRA_FIELDS],
    "Planner 64 continuation connection",
  );
  assertArray(inbound.orderedNodeIds, 3, "Planner 64 inbound node sequence");
  assertArray(
    continuation.orderedNodeIds,
    2,
    "Planner 64 continuation node sequence",
  );

  const geometry = INTERIOR_FERN_CANYON_BRIDGE_FOOTWAY_GEOMETRY[0];
  const endpointNode = geometry.nodes[2];

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.targetTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointNodeId !== ENDPOINT_NODE_ID ||
    authority.endpointCoordinate.lat !== 32.7357407 ||
    authority.endpointCoordinate.lng !== -117.1503614 ||
    authority.endpointCoordinate.sourceVersion !== 1 ||
    authority.endpointCoordinate.sourceTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointCoordinate.sourceChangeset !== SOURCE_CHANGESET ||
    authority.selectedContinuationWayId !== CONTINUATION_WAY_ID ||
    authority.selectedContinuationHighway !== "steps" ||
    authority.selectedContinuationName !== "Fern Canyon Trail" ||
    authority.selectedContinuationEndpointIndex !== 1 ||
    authority.selectionRule !==
      "unique-non-inbound-connected-linear-highway-way-at-frozen-timestamp" ||
    authority.continuationGeometryStatus !==
      "node-sequence-captured-coordinates-not-captured" ||
    authority.plannerMaterialization !== "endpoint-topology-only"
  ) {
    throw new Error(
      "Planner 64 far-end topology drifted from captured historical evidence.",
    );
  }

  if (
    geometry.sourceWayId !== INBOUND_WAY_ID ||
    geometry.traversalToNodeId !== authority.endpointNodeId ||
    endpointNode.sourceObjectId !== authority.endpointNodeId ||
    endpointNode.lat !== authority.endpointCoordinate.lat ||
    endpointNode.lng !== authority.endpointCoordinate.lng
  ) {
    throw new Error(
      "Planner 64 detached from Planner 63 version-pinned bridge geometry.",
    );
  }

  if (
    inbound.sourceWayId !== INBOUND_WAY_ID ||
    inbound.sourceHighway !== "footway" ||
    inbound.sourceBridge !== "yes" ||
    inbound.sourceLayer !== "1" ||
    inbound.endpointNodeIndex !== 2 ||
    inbound.connectionRole !== "inbound-bridge-footway-segment" ||
    inbound.orderedNodeIds[0] !== "13588159627" ||
    inbound.orderedNodeIds[2] !== ENDPOINT_NODE_ID
  ) {
    throw new Error("Planner 64 inbound bridge-footway connection drifted.");
  }

  if (
    continuation.sourceWayId !== CONTINUATION_WAY_ID ||
    continuation.sourceWayVersion !== 1 ||
    continuation.sourceWayTimestamp !== TARGET_TIMESTAMP ||
    continuation.sourceWayChangeset !== SOURCE_CHANGESET ||
    continuation.sourceHighway !== "steps" ||
    continuation.sourceIncline !== "up" ||
    continuation.sourceName !== "Fern Canyon Trail" ||
    continuation.endpointNodeIndex !== 1 ||
    continuation.connectionRole !== "onward-steps-continuation" ||
    continuation.orderedNodeIds[0] !== "13588159634" ||
    continuation.orderedNodeIds[1] !== ENDPOINT_NODE_ID
  ) {
    throw new Error("Planner 64 continuation connection drifted.");
  }
}

assertInteriorFernCanyonBridgeFarEndpointTopologyIntegrity(RAW_AUTHORITY);

export const INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY:
  readonly InteriorFernCanyonBridgeFarEndpointTopologyAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorFernCanyonBridgeFarEndpointTopology():
  InteriorFernCanyonBridgeFarEndpointTopologyAssessment {
  return deepFreeze({
    status: "endpoint-topology-sourced",
    authorityId: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    endpointNodeId: ENDPOINT_NODE_ID,
    historicalConnectedWayCount: 2,
    selectedContinuationWayId: CONTINUATION_WAY_ID,
    selectedContinuationHighway: "steps",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...BLOCK_REASONS],
    },
  });
}
