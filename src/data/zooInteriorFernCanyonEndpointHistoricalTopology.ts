import {
  INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE,
} from "./zooInteriorFernCanyonGeometryEvidenceGate.ts";
import {
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY,
} from "./zooInteriorTreetopsEndpointRouteNodeAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-fern-canyon-endpoint-historical-topology" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const ENDPOINT_NODE_ID = "13588159625" as const;
const ENDPOINT_NODE_VERSION = 1 as const;
const ENDPOINT_NODE_CHANGESET = 178875075 as const;
const ENDPOINT_LAT = 32.7353594 as const;
const ENDPOINT_LNG = -117.1501187 as const;
const INBOUND_WAY_ID = "1481578621" as const;
const CONTINUATION_WAY_ID = "1481578622" as const;
const STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);

const INBOUND_NODE_IDS = [
  "13588159625",
  "13588159626",
] as const;

const CONTINUATION_NODE_IDS = [
  "13588159627",
  "13588159628",
  "13588159629",
  "13588159630",
  "13588159631",
  ENDPOINT_NODE_ID,
] as const;

export type FernCanyonEndpointHistoricalConnection = {
  sourceWayId: string;
  sourceWayVersion: 1;
  sourceWayTimestamp: typeof TARGET_TIMESTAMP;
  sourceWayChangeset: typeof ENDPOINT_NODE_CHANGESET;
  sourceWayVersionUrl: string;
  sourceWayUrl: string;
  sourceHighway: "footway" | "steps";
  sourceName: "Fern Canyon Trail";
  sourceBridge?: "yes";
  sourceIncline?: "up";
  sourceLayer?: "1";
  orderedNodeIds: readonly string[];
  endpointNodeIndex: number;
  connectionRole: "inbound-qualified-segment" | "onward-linear-continuation";
};

export type InteriorFernCanyonEndpointHistoricalTopologyAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  targetTimestamp: typeof TARGET_TIMESTAMP;
  endpointNode: {
    sourceObjectId: typeof ENDPOINT_NODE_ID;
    sourceVersion: typeof ENDPOINT_NODE_VERSION;
    sourceTimestamp: typeof TARGET_TIMESTAMP;
    sourceChangeset: typeof ENDPOINT_NODE_CHANGESET;
    sourceVersionUrl:
      "https://api.openstreetmap.org/api/0.6/node/13588159625/1";
    sourceUrl: "https://www.openstreetmap.org/node/13588159625";
    lat: typeof ENDPOINT_LAT;
    lng: typeof ENDPOINT_LNG;
  };
  connectedWays: readonly [
    FernCanyonEndpointHistoricalConnection,
    FernCanyonEndpointHistoricalConnection,
  ];
  selectedContinuationWayId: typeof CONTINUATION_WAY_ID;
  selectedContinuationHighway: "steps";
  selectedContinuationName: "Fern Canyon Trail";
  selectedContinuationEndpointIndex: 5;
  selectionRule:
    "unique-non-inbound-connected-linear-highway-way-at-frozen-timestamp";
  plannerMaterialization: "endpoint-topology-only";
};

export type InteriorFernCanyonEndpointHistoricalTopologyAssessment = {
  status: "endpoint-topology-sourced";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  endpointCoordinate: "captured";
  historicalConnectedWayCount: 2;
  selectedContinuationWayId: typeof CONTINUATION_WAY_ID;
  selectedContinuationHighway: "steps";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "VERSION_PINNED_FERN_CANYON_STEPS_NODE_COORDINATES_NOT_CAPTURED",
      "EXACT_FERN_CANYON_STEPS_SEGMENT_PROVENANCE_NOT_COMPLETE",
    ];
  };
};

const TOP_LEVEL_FIELDS = [
  "id",
  "provider",
  "objectiveSourceRecordId",
  "targetTimestamp",
  "endpointNode",
  "connectedWays",
  "selectedContinuationWayId",
  "selectedContinuationHighway",
  "selectedContinuationName",
  "selectedContinuationEndpointIndex",
  "selectionRule",
  "plannerMaterialization",
] as const;

const ENDPOINT_FIELDS = [
  "sourceObjectId",
  "sourceVersion",
  "sourceTimestamp",
  "sourceChangeset",
  "sourceVersionUrl",
  "sourceUrl",
  "lat",
  "lng",
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

const CONTINUATION_EXTRA_FIELDS = [
  "sourceBridge",
  "sourceIncline",
  "sourceLayer",
] as const;

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

const ROUTE_GRAPH_BLOCK_REASONS = [
  "VERSION_PINNED_FERN_CANYON_STEPS_NODE_COORDINATES_NOT_CAPTURED",
  "EXACT_FERN_CANYON_STEPS_SEGMENT_PROVENANCE_NOT_COMPLETE",
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
      throw new Error("Planner 60 canonical evidence requires own data fields.");
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
  const missing = fields.filter((key) => !Object.hasOwn(value, key));
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

const INBOUND_CONNECTION =
  nullRecord<FernCanyonEndpointHistoricalConnection>({
    sourceWayId: INBOUND_WAY_ID,
    sourceWayVersion: 1,
    sourceWayTimestamp: TARGET_TIMESTAMP,
    sourceWayChangeset: ENDPOINT_NODE_CHANGESET,
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481578621/1",
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578621",
    sourceHighway: "footway",
    sourceName: "Fern Canyon Trail",
    orderedNodeIds: [...INBOUND_NODE_IDS],
    endpointNodeIndex: 0,
    connectionRole: "inbound-qualified-segment",
  });

const CONTINUATION_CONNECTION =
  nullRecord<FernCanyonEndpointHistoricalConnection>({
    sourceWayId: CONTINUATION_WAY_ID,
    sourceWayVersion: 1,
    sourceWayTimestamp: TARGET_TIMESTAMP,
    sourceWayChangeset: ENDPOINT_NODE_CHANGESET,
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481578622/1",
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578622",
    sourceHighway: "steps",
    sourceName: "Fern Canyon Trail",
    sourceBridge: "yes",
    sourceIncline: "up",
    sourceLayer: "1",
    orderedNodeIds: [...CONTINUATION_NODE_IDS],
    endpointNodeIndex: 5,
    connectionRole: "onward-linear-continuation",
  });

const RAW_AUTHORITY: InteriorFernCanyonEndpointHistoricalTopologyAuthority[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    endpointNode: nullRecord({
      sourceObjectId: ENDPOINT_NODE_ID,
      sourceVersion: ENDPOINT_NODE_VERSION,
      sourceTimestamp: TARGET_TIMESTAMP,
      sourceChangeset: ENDPOINT_NODE_CHANGESET,
      sourceVersionUrl:
        "https://api.openstreetmap.org/api/0.6/node/13588159625/1",
      sourceUrl: "https://www.openstreetmap.org/node/13588159625",
      lat: ENDPOINT_LAT,
      lng: ENDPOINT_LNG,
    }),
    connectedWays: [INBOUND_CONNECTION, CONTINUATION_CONNECTION],
    selectedContinuationWayId: CONTINUATION_WAY_ID,
    selectedContinuationHighway: "steps",
    selectedContinuationName: "Fern Canyon Trail",
    selectedContinuationEndpointIndex: 5,
    selectionRule:
      "unique-non-inbound-connected-linear-highway-way-at-frozen-timestamp",
    plannerMaterialization: "endpoint-topology-only",
  }),
];

export function assertInteriorFernCanyonEndpointHistoricalTopologyIntegrity(
  authorities: readonly InteriorFernCanyonEndpointHistoricalTopologyAuthority[],
): void {
  const collectionLabel = "Planner 60 authority collection";
  const authorityLabel = "Planner 60 authority";
  const endpointLabel = "Planner 60 endpoint node";
  const waysLabel = "Planner 60 connected way collection";
  const inboundLabel = "Planner 60 inbound connection";
  const continuationLabel = "Planner 60 continuation connection";
  const inboundNodesLabel = "Planner 60 inbound node sequence";
  const continuationNodesLabel = "Planner 60 continuation node sequence";

  // Validate the entire expected graph with descriptor-only checks before
  // invoking the captured clone primitive. Ordinary getters/accessors are
  // rejected without execution; Proxy objects may lie to reflection, but
  // structuredClone rejects them recursively.
  assertArray(authorities, 1, collectionLabel);
  const candidate = ownDataValue(authorities, "0", collectionLabel);
  assertPlain(candidate, TOP_LEVEL_FIELDS, authorityLabel);

  const endpointNode = ownDataValue(
    candidate,
    "endpointNode",
    authorityLabel,
  );
  const connectedWays = ownDataValue(
    candidate,
    "connectedWays",
    authorityLabel,
  );
  assertPlain(endpointNode, ENDPOINT_FIELDS, endpointLabel);
  assertArray(connectedWays, 2, waysLabel);

  const inbound = ownDataValue(connectedWays, "0", waysLabel);
  const continuation = ownDataValue(connectedWays, "1", waysLabel);
  assertPlain(inbound, CONNECTION_BASE_FIELDS, inboundLabel);
  assertPlain(
    continuation,
    [...CONNECTION_BASE_FIELDS, ...CONTINUATION_EXTRA_FIELDS],
    continuationLabel,
  );

  const inboundNodeIds = ownDataValue(
    inbound,
    "orderedNodeIds",
    inboundLabel,
  );
  const continuationNodeIds = ownDataValue(
    continuation,
    "orderedNodeIds",
    continuationLabel,
  );
  assertArray(inboundNodeIds, 2, inboundNodesLabel);
  assertArray(continuationNodeIds, 6, continuationNodesLabel);

  assertStructuredCloneSafe(authorities, collectionLabel);

  // A reflective trap is allowed to run during the descriptor checks above,
  // but it must not be able to swap any validated object before screening
  // completes. Re-check every captured identity after clone screening.
  if (
    ownDataValue(authorities, "0", collectionLabel) !== candidate ||
    ownDataValue(candidate, "endpointNode", authorityLabel) !== endpointNode ||
    ownDataValue(candidate, "connectedWays", authorityLabel) !== connectedWays ||
    ownDataValue(connectedWays, "0", waysLabel) !== inbound ||
    ownDataValue(connectedWays, "1", waysLabel) !== continuation ||
    ownDataValue(inbound, "orderedNodeIds", inboundLabel) !== inboundNodeIds ||
    ownDataValue(
      continuation,
      "orderedNodeIds",
      continuationLabel,
    ) !== continuationNodeIds
  ) {
    throw new Error(
      "Planner 60 authority graph cannot mutate during validation.",
    );
  }

  assertNoRouteMaterialization(candidate, authorityLabel);

  const authority =
    candidate as unknown as InteriorFernCanyonEndpointHistoricalTopologyAuthority;
  const gate = INTERIOR_FERN_CANYON_GEOMETRY_EVIDENCE_GATE[0];
  const priorEndpoint = INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY;

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.targetTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointNode.sourceObjectId !== ENDPOINT_NODE_ID ||
    authority.endpointNode.sourceVersion !== ENDPOINT_NODE_VERSION ||
    authority.endpointNode.sourceTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointNode.sourceChangeset !== ENDPOINT_NODE_CHANGESET ||
    authority.endpointNode.lat !== ENDPOINT_LAT ||
    authority.endpointNode.lng !== ENDPOINT_LNG ||
    authority.selectedContinuationWayId !== CONTINUATION_WAY_ID ||
    authority.selectedContinuationHighway !== "steps" ||
    authority.selectedContinuationName !== "Fern Canyon Trail" ||
    authority.selectedContinuationEndpointIndex !== 5 ||
    authority.selectionRule !==
      "unique-non-inbound-connected-linear-highway-way-at-frozen-timestamp" ||
    authority.plannerMaterialization !== "endpoint-topology-only"
  ) {
    throw new Error(
      "Planner 60 endpoint topology drifted from the captured historical evidence.",
    );
  }

  if (
    gate.objectiveSourceRecordId !== authority.objectiveSourceRecordId ||
    gate.farEndpointNodeId !== authority.endpointNode.sourceObjectId ||
    gate.sourceWayId !== INBOUND_WAY_ID ||
    gate.sourceWayVersion !== 1 ||
    gate.orderedNodeIds[0] !== ENDPOINT_NODE_ID ||
    gate.orderedNodeIds[1] !== priorEndpoint.sourceObjectId
  ) {
    throw new Error(
      "Planner 60 detached from the Planner 59 Fern Canyon geometry gate.",
    );
  }

  if (
    inbound.sourceWayId !== INBOUND_WAY_ID ||
    inbound.sourceHighway !== "footway" ||
    inbound.sourceName !== "Fern Canyon Trail" ||
    inbound.endpointNodeIndex !== 0 ||
    inbound.connectionRole !== "inbound-qualified-segment" ||
    inbound.orderedNodeIds[0] !== ENDPOINT_NODE_ID ||
    inbound.orderedNodeIds[1] !== "13588159626"
  ) {
    throw new Error("Planner 60 inbound connection drifted.");
  }

  if (
    continuation.sourceWayId !== CONTINUATION_WAY_ID ||
    continuation.sourceWayVersion !== 1 ||
    continuation.sourceWayTimestamp !== TARGET_TIMESTAMP ||
    continuation.sourceWayChangeset !== ENDPOINT_NODE_CHANGESET ||
    continuation.sourceHighway !== "steps" ||
    continuation.sourceName !== "Fern Canyon Trail" ||
    continuation.sourceBridge !== "yes" ||
    continuation.sourceIncline !== "up" ||
    continuation.sourceLayer !== "1" ||
    continuation.endpointNodeIndex !== 5 ||
    continuation.connectionRole !== "onward-linear-continuation" ||
    continuation.orderedNodeIds[0] !== "13588159627" ||
    continuation.orderedNodeIds[4] !== "13588159631" ||
    continuation.orderedNodeIds[5] !== ENDPOINT_NODE_ID
  ) {
    throw new Error("Planner 60 continuation connection drifted.");
  }
}

assertInteriorFernCanyonEndpointHistoricalTopologyIntegrity(RAW_AUTHORITY);

export const INTERIOR_FERN_CANYON_ENDPOINT_HISTORICAL_TOPOLOGY:
  readonly InteriorFernCanyonEndpointHistoricalTopologyAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorFernCanyonEndpointHistoricalTopology():
  InteriorFernCanyonEndpointHistoricalTopologyAssessment {
  return deepFreeze(
    nullRecord<InteriorFernCanyonEndpointHistoricalTopologyAssessment>({
      status: "endpoint-topology-sourced",
      authorityId: AUTHORITY_ID,
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      endpointNodeId: ENDPOINT_NODE_ID,
      endpointCoordinate: "captured",
      historicalConnectedWayCount: 2,
      selectedContinuationWayId: CONTINUATION_WAY_ID,
      selectedContinuationHighway: "steps",
      routeGraphExpansion: nullRecord({
        status: "blocked",
        reasons: [...ROUTE_GRAPH_BLOCK_REASONS],
      }),
    }),
  );
}
