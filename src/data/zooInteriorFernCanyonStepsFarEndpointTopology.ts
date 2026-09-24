import {
  INTERIOR_FERN_CANYON_STEPS_GEOMETRY,
} from "./zooInteriorFernCanyonStepsGeometry.ts";

const AUTHORITY_ID =
  "sdz-interior-fern-canyon-steps-far-endpoint-topology" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const ENDPOINT_NODE_ID = "13588159627" as const;
const INBOUND_WAY_ID = "1481578622" as const;
const CONTINUATION_WAY_ID = "1481578623" as const;
const SOURCE_CHANGESET = 178875075 as const;
const STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);

const INBOUND_NODE_IDS = [
  "13588159627",
  "13588159628",
  "13588159629",
  "13588159630",
  "13588159631",
  "13588159625",
] as const;

const CONTINUATION_NODE_IDS = [
  ENDPOINT_NODE_ID,
  "13588159632",
  "13588159633",
] as const;

export type FernCanyonStepsFarEndpointConnection = {
  sourceWayId: string;
  sourceWayVersion: 1;
  sourceWayTimestamp: typeof TARGET_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_CHANGESET;
  sourceWayVersionUrl: string;
  sourceWayUrl: string;
  sourceHighway: "steps" | "footway";
  sourceName: "Fern Canyon Trail";
  sourceBridge: "yes";
  sourceIncline?: "up";
  sourceLayer: "1";
  orderedNodeIds: readonly string[];
  endpointNodeIndex: 0;
  connectionRole: "inbound-steps-segment" | "onward-footway-continuation";
};

export type InteriorFernCanyonStepsFarEndpointTopologyAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  targetTimestamp: typeof TARGET_TIMESTAMP;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  endpointCoordinate: {
    lat: 32.7357192;
    lng: -117.1500664;
    sourceVersion: 1;
    sourceTimestamp: typeof TARGET_TIMESTAMP;
    sourceChangeset: typeof SOURCE_CHANGESET;
  };
  connectedWays: readonly [
    FernCanyonStepsFarEndpointConnection,
    FernCanyonStepsFarEndpointConnection,
  ];
  selectedContinuationWayId: typeof CONTINUATION_WAY_ID;
  selectedContinuationHighway: "footway";
  selectedContinuationName: "Fern Canyon Trail";
  selectionRule:
    "unique-non-inbound-connected-linear-highway-way-at-frozen-timestamp";
  continuationGeometryStatus: "node-sequence-captured-coordinates-not-captured";
  plannerMaterialization: "endpoint-topology-only";
};

export type InteriorFernCanyonStepsFarEndpointTopologyAssessment = {
  status: "endpoint-topology-sourced";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  historicalConnectedWayCount: 2;
  selectedContinuationWayId: typeof CONTINUATION_WAY_ID;
  selectedContinuationHighway: "footway";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "VERSION_PINNED_FERN_CANYON_FOOTWAY_NODE_COORDINATES_NOT_CAPTURED",
      "EXACT_FERN_CANYON_FOOTWAY_SEGMENT_PROVENANCE_NOT_COMPLETE",
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
  "sourceBridge",
  "sourceLayer",
  "orderedNodeIds",
  "endpointNodeIndex",
  "connectionRole",
] as const;

const INBOUND_EXTRA_FIELDS = ["sourceIncline"] as const;

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
  "VERSION_PINNED_FERN_CANYON_FOOTWAY_NODE_COORDINATES_NOT_CAPTURED",
  "EXACT_FERN_CANYON_FOOTWAY_SEGMENT_PROVENANCE_NOT_COMPLETE",
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
      throw new Error("Planner 62 canonical evidence requires data fields.");
    }
    Object.defineProperty(result, key, descriptor);
  }
  return result;
}

function assertStructuredCloneSafe(
  value: unknown,
  label: string,
): void {
  try {
    STRUCTURED_CLONE(value);
  } catch {
    throw new Error(
      `${label} cannot be Proxy-backed or otherwise uncloneable.`,
    );
  }
}

function ownDataValue(
  value: object,
  field: string,
  label: string,
): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, field);
  if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
    throw new Error(
      `${label} requires enumerable own data field ${field}.`,
    );
  }
  return descriptor.value;
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
  nullRecord<FernCanyonStepsFarEndpointConnection>({
    sourceWayId: INBOUND_WAY_ID,
    sourceWayVersion: 1,
    sourceWayTimestamp: TARGET_TIMESTAMP,
    sourceWayChangeset: SOURCE_CHANGESET,
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481578622/1",
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578622",
    sourceHighway: "steps",
    sourceName: "Fern Canyon Trail",
    sourceBridge: "yes",
    sourceIncline: "up",
    sourceLayer: "1",
    orderedNodeIds: [...INBOUND_NODE_IDS],
    endpointNodeIndex: 0,
    connectionRole: "inbound-steps-segment",
  });

const CONTINUATION =
  nullRecord<FernCanyonStepsFarEndpointConnection>({
    sourceWayId: CONTINUATION_WAY_ID,
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
    orderedNodeIds: [...CONTINUATION_NODE_IDS],
    endpointNodeIndex: 0,
    connectionRole: "onward-footway-continuation",
  });

const RAW_AUTHORITY: InteriorFernCanyonStepsFarEndpointTopologyAuthority[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    endpointNodeId: ENDPOINT_NODE_ID,
    endpointCoordinate: nullRecord({
      lat: 32.7357192,
      lng: -117.1500664,
      sourceVersion: 1,
      sourceTimestamp: TARGET_TIMESTAMP,
      sourceChangeset: SOURCE_CHANGESET,
    }),
    connectedWays: [INBOUND, CONTINUATION],
    selectedContinuationWayId: CONTINUATION_WAY_ID,
    selectedContinuationHighway: "footway",
    selectedContinuationName: "Fern Canyon Trail",
    selectionRule:
      "unique-non-inbound-connected-linear-highway-way-at-frozen-timestamp",
    continuationGeometryStatus:
      "node-sequence-captured-coordinates-not-captured",
    plannerMaterialization: "endpoint-topology-only",
  }),
];

export function assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity(
  authorities: readonly InteriorFernCanyonStepsFarEndpointTopologyAuthority[],
): void {
  const collectionLabel = "Planner 62 authority collection";
  const authorityLabel = "Planner 62 authority";
  const coordinateLabel = "Planner 62 endpoint coordinate";
  const waysLabel = "Planner 62 connected way collection";
  const inboundLabel = "Planner 62 inbound connection";
  const continuationLabel = "Planner 62 continuation connection";
  const inboundNodesLabel = "Planner 62 inbound node sequence";
  const continuationNodesLabel = "Planner 62 continuation node sequence";

  assertArray(authorities, 1, collectionLabel);
  const candidate = ownDataValue(authorities, "0", collectionLabel);
  assertPlain(candidate, TOP_LEVEL_FIELDS, authorityLabel);

  const endpointCoordinate = ownDataValue(
    candidate,
    "endpointCoordinate",
    authorityLabel,
  );
  const connectedWays = ownDataValue(
    candidate,
    "connectedWays",
    authorityLabel,
  );
  assertPlain(endpointCoordinate, COORDINATE_FIELDS, coordinateLabel);
  assertArray(connectedWays, 2, waysLabel);

  const inboundRecord = ownDataValue(connectedWays, "0", waysLabel);
  const continuationRecord = ownDataValue(connectedWays, "1", waysLabel);
  assertPlain(
    inboundRecord,
    [...CONNECTION_BASE_FIELDS, ...INBOUND_EXTRA_FIELDS],
    inboundLabel,
  );
  assertPlain(
    continuationRecord,
    CONNECTION_BASE_FIELDS,
    continuationLabel,
  );

  const inboundNodeIds = ownDataValue(
    inboundRecord,
    "orderedNodeIds",
    inboundLabel,
  );
  const continuationNodeIds = ownDataValue(
    continuationRecord,
    "orderedNodeIds",
    continuationLabel,
  );
  assertArray(inboundNodeIds, 6, inboundNodesLabel);
  assertArray(continuationNodeIds, 3, continuationNodesLabel);

  assertStructuredCloneSafe(authorities, collectionLabel);

  if (
    ownDataValue(authorities, "0", collectionLabel) !== candidate ||
    ownDataValue(candidate, "endpointCoordinate", authorityLabel) !==
      endpointCoordinate ||
    ownDataValue(candidate, "connectedWays", authorityLabel) !== connectedWays ||
    ownDataValue(connectedWays, "0", waysLabel) !== inboundRecord ||
    ownDataValue(connectedWays, "1", waysLabel) !== continuationRecord ||
    ownDataValue(inboundRecord, "orderedNodeIds", inboundLabel) !==
      inboundNodeIds ||
    ownDataValue(continuationRecord, "orderedNodeIds", continuationLabel) !==
      continuationNodeIds
  ) {
    throw new Error(
      "Planner 62 authority graph cannot mutate during validation.",
    );
  }

  assertNoRouteMaterialization(candidate, authorityLabel);
  assertNoRouteMaterialization(endpointCoordinate, coordinateLabel);
  assertNoRouteMaterialization(inboundRecord, inboundLabel);
  assertNoRouteMaterialization(continuationRecord, continuationLabel);

  const authority =
    candidate as unknown as InteriorFernCanyonStepsFarEndpointTopologyAuthority;
  const inbound =
    inboundRecord as unknown as FernCanyonStepsFarEndpointConnection;
  const continuation =
    continuationRecord as unknown as FernCanyonStepsFarEndpointConnection;
  const geometry = INTERIOR_FERN_CANYON_STEPS_GEOMETRY[0];
  const endpointNode = geometry.nodes[0];

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.targetTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointNodeId !== ENDPOINT_NODE_ID ||
    authority.endpointCoordinate.lat !== 32.7357192 ||
    authority.endpointCoordinate.lng !== -117.1500664 ||
    authority.endpointCoordinate.sourceVersion !== 1 ||
    authority.endpointCoordinate.sourceTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointCoordinate.sourceChangeset !== SOURCE_CHANGESET ||
    authority.selectedContinuationWayId !== CONTINUATION_WAY_ID ||
    authority.selectedContinuationHighway !== "footway" ||
    authority.selectedContinuationName !== "Fern Canyon Trail" ||
    authority.selectionRule !==
      "unique-non-inbound-connected-linear-highway-way-at-frozen-timestamp" ||
    authority.continuationGeometryStatus !==
      "node-sequence-captured-coordinates-not-captured" ||
    authority.plannerMaterialization !== "endpoint-topology-only"
  ) {
    throw new Error(
      "Planner 62 far-end topology drifted from captured historical evidence.",
    );
  }

  if (
    geometry.sourceWayId !== INBOUND_WAY_ID ||
    geometry.sourceWayUrl !== "https://www.openstreetmap.org/way/1481578622" ||
    geometry.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/1481578622/1" ||
    geometry.sourceWayVersion !== 1 ||
    geometry.sourceWayTimestamp !== TARGET_TIMESTAMP ||
    geometry.sourceWayChangeset !== SOURCE_CHANGESET ||
    geometry.sourceHighway !== "steps" ||
    geometry.sourceName !== "Fern Canyon Trail" ||
    geometry.sourceBridge !== "yes" ||
    geometry.sourceIncline !== "up" ||
    geometry.sourceLayer !== "1" ||
    geometry.traversalToNodeId !== authority.endpointNodeId ||
    endpointNode.sourceObjectId !== authority.endpointNodeId ||
    endpointNode.sourceVersion !== authority.endpointCoordinate.sourceVersion ||
    endpointNode.sourceTimestamp !== authority.endpointCoordinate.sourceTimestamp ||
    endpointNode.sourceChangeset !== authority.endpointCoordinate.sourceChangeset ||
    endpointNode.lat !== authority.endpointCoordinate.lat ||
    endpointNode.lng !== authority.endpointCoordinate.lng ||
    endpointNode.sourceVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/node/13588159627/1" ||
    endpointNode.sourceUrl !==
      "https://www.openstreetmap.org/node/13588159627"
  ) {
    throw new Error(
      "Planner 62 detached from Planner 61 version-pinned steps geometry.",
    );
  }

  if (
    inbound.sourceWayId !== INBOUND_WAY_ID ||
    inbound.sourceWayVersion !== 1 ||
    inbound.sourceWayTimestamp !== TARGET_TIMESTAMP ||
    inbound.sourceWayChangeset !== SOURCE_CHANGESET ||
    inbound.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/1481578622/1" ||
    inbound.sourceWayUrl !== "https://www.openstreetmap.org/way/1481578622" ||
    inbound.sourceHighway !== "steps" ||
    inbound.sourceName !== "Fern Canyon Trail" ||
    inbound.sourceBridge !== "yes" ||
    inbound.sourceIncline !== "up" ||
    inbound.sourceLayer !== "1" ||
    inbound.endpointNodeIndex !== 0 ||
    inbound.connectionRole !== "inbound-steps-segment" ||
    inboundNodeIds.length !== INBOUND_NODE_IDS.length ||
    inboundNodeIds.some(
      (nodeId, index) => nodeId !== INBOUND_NODE_IDS[index],
    )
  ) {
    throw new Error("Planner 62 inbound steps connection drifted.");
  }

  if (
    continuation.sourceWayId !== CONTINUATION_WAY_ID ||
    continuation.sourceWayVersion !== 1 ||
    continuation.sourceWayTimestamp !== TARGET_TIMESTAMP ||
    continuation.sourceWayChangeset !== SOURCE_CHANGESET ||
    continuation.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/1481578623/1" ||
    continuation.sourceWayUrl !==
      "https://www.openstreetmap.org/way/1481578623" ||
    continuation.sourceHighway !== "footway" ||
    continuation.sourceBridge !== "yes" ||
    continuation.sourceLayer !== "1" ||
    continuation.sourceName !== "Fern Canyon Trail" ||
    continuation.endpointNodeIndex !== 0 ||
    continuation.connectionRole !== "onward-footway-continuation" ||
    continuationNodeIds.length !== CONTINUATION_NODE_IDS.length ||
    continuationNodeIds.some(
      (nodeId, index) => nodeId !== CONTINUATION_NODE_IDS[index],
    )
  ) {
    throw new Error("Planner 62 continuation connection drifted.");
  }
}

assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity(RAW_AUTHORITY);

export const INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY:
  readonly InteriorFernCanyonStepsFarEndpointTopologyAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorFernCanyonStepsFarEndpointTopology():
  InteriorFernCanyonStepsFarEndpointTopologyAssessment {
  return deepFreeze(
    nullRecord<InteriorFernCanyonStepsFarEndpointTopologyAssessment>({
      status: "endpoint-topology-sourced",
      authorityId: AUTHORITY_ID,
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      endpointNodeId: ENDPOINT_NODE_ID,
      historicalConnectedWayCount: 2,
      selectedContinuationWayId: CONTINUATION_WAY_ID,
      selectedContinuationHighway: "footway",
      routeGraphExpansion: nullRecord({
        status: "blocked",
        reasons: [...BLOCK_REASONS],
      }),
    }),
  );
}
