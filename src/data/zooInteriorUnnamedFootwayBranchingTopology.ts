import {
  INTERIOR_UNNAMED_FOOTWAY_GEOMETRY,
} from "./zooInteriorUnnamedFootwayGeometry.ts";

const AUTHORITY_ID =
  "sdz-interior-unnamed-footway-branching-endpoint-topology" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const ENDPOINT_NODE_ID = "1619736694" as const;
const INBOUND_WAY_ID = "1481578625" as const;
const ACCESS_NO_WAY_ID = "148910140" as const;
const FEE_FOOTWAY_ID = "1481578626" as const;
const SOURCE_CHANGESET = 178875075 as const;

const STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);
const OWN_KEYS = Reflect.ownKeys.bind(Reflect);
const GET_PROTOTYPE_OF = Object.getPrototypeOf.bind(Object);
const GET_DESCRIPTOR = Object.getOwnPropertyDescriptor.bind(Object);
const DEFINE_PROPERTY = Object.defineProperty.bind(Object);
const CREATE_OBJECT = Object.create.bind(Object);
const HAS_OWN = Object.hasOwn.bind(Object);
const IS_ARRAY = Array.isArray.bind(Array);
const FREEZE = Object.freeze.bind(Object);
const IS_FROZEN = Object.isFrozen.bind(Object);

const INBOUND_NODE_IDS = ["13588159634", ENDPOINT_NODE_ID] as const;
const ACCESS_NO_NODE_IDS = [
  "1619736666",
  "1619736663",
  "1619736656",
  "1619736648",
  "1619736638",
  "1619736630",
  "1619736631",
  "1619736639",
  "1619736653",
  "1619736660",
  "1619736664",
  "1619736670",
  "1619736676",
  "2627532109",
  "1619736678",
  "2627532117",
  "1619736679",
  "2627532116",
  "1619736680",
  "2627532106",
  "1619736681",
  "1619736682",
  "1619736683",
  "1619736686",
  "1619736688",
  "1619736687",
  "1619736689",
  ENDPOINT_NODE_ID,
] as const;
const FEE_FOOTWAY_NODE_IDS = [ENDPOINT_NODE_ID, "48920902"] as const;

export type UnnamedFootwayBranchConnection = {
  sourceWayId: string;
  sourceWayVersion: number;
  sourceWayTimestamp: typeof TARGET_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_CHANGESET;
  sourceWayVersionUrl: string;
  sourceWayUrl: string;
  sourceHighway: "footway";
  sourceNameStatus: "absent";
  sourceAccess?: "no";
  sourceFee?: "yes";
  sourceLayer?: "-1";
  orderedNodeIds: readonly string[];
  endpointNodeIndex: number;
  connectionRole: "inbound-qualified-segment" | "outbound-candidate";
};

export type InteriorUnnamedFootwayBranchingTopologyAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  targetTimestamp: typeof TARGET_TIMESTAMP;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  endpointCoordinate: {
    lat: 32.7358299;
    lng: -117.150419;
    sourceVersion: 2;
    sourceTimestamp: typeof TARGET_TIMESTAMP;
    sourceChangeset: typeof SOURCE_CHANGESET;
  };
  connectedWays: readonly [
    UnnamedFootwayBranchConnection,
    UnnamedFootwayBranchConnection,
    UnnamedFootwayBranchConnection,
  ];
  outboundCandidateWayIds: readonly [
    typeof ACCESS_NO_WAY_ID,
    typeof FEE_FOOTWAY_ID,
  ];
  outboundCandidateCount: 2;
  branchSelectionStatus: "unresolved";
  selectionRule:
    "requires-independent-objective-authority-when-multiple-non-inbound-linear-highway-ways-exist";
  plannerMaterialization: "branching-topology-only";
};

export type InteriorUnnamedFootwayBranchingTopologyAssessment = {
  status: "branching-topology-sourced";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  historicalConnectedWayCount: 3;
  outboundCandidateWayIds: readonly [
    typeof ACCESS_NO_WAY_ID,
    typeof FEE_FOOTWAY_ID,
  ];
  branchSelectionStatus: "unresolved";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "MULTIPLE_NON_INBOUND_LINEAR_HIGHWAY_CONNECTIONS",
      "OBJECTIVE_SCOPED_BRANCH_AUTHORITY_NOT_SOURCED",
      "OUTBOUND_ACCESS_SEMANTICS_NOT_QUALIFIED",
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
  "outboundCandidateWayIds",
  "outboundCandidateCount",
  "branchSelectionStatus",
  "selectionRule",
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
  "sourceNameStatus",
  "orderedNodeIds",
  "endpointNodeIndex",
  "connectionRole",
] as const;

const ACCESS_NO_FIELDS = [
  "sourceWayId",
  "sourceWayVersion",
  "sourceWayTimestamp",
  "sourceWayChangeset",
  "sourceWayVersionUrl",
  "sourceWayUrl",
  "sourceHighway",
  "sourceNameStatus",
  "orderedNodeIds",
  "endpointNodeIndex",
  "connectionRole",
  "sourceAccess",
  "sourceFee",
  "sourceLayer",
] as const;

const FEE_FIELDS = [
  "sourceWayId",
  "sourceWayVersion",
  "sourceWayTimestamp",
  "sourceWayChangeset",
  "sourceWayVersionUrl",
  "sourceWayUrl",
  "sourceHighway",
  "sourceNameStatus",
  "orderedNodeIds",
  "endpointNodeIndex",
  "connectionRole",
  "sourceFee",
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
  "selectedContinuationWayId",
] as const;

const BLOCK_REASONS = [
  "MULTIPLE_NON_INBOUND_LINEAR_HIGHWAY_CONNECTIONS",
  "OBJECTIVE_SCOPED_BRANCH_AUTHORITY_NOT_SOURCED",
  "OUTBOUND_ACCESS_SEMANTICS_NOT_QUALIFIED",
] as const;

function copyArray<T>(source: readonly T[]): T[] {
  const result: T[] = [];
  for (let index = 0; index < source.length; index += 1) {
    result[index] = source[index];
  }
  return result;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !IS_FROZEN(value)) {
    const keys = OWN_KEYS(value);
    for (let index = 0; index < keys.length; index += 1) {
      const descriptor = GET_DESCRIPTOR(value, keys[index]);
      if (descriptor && "value" in descriptor) {
        deepFreeze(descriptor.value);
      }
    }
    FREEZE(value);
  }
  return value;
}

function nullRecord<T extends object>(value: T): T {
  const result = CREATE_OBJECT(null) as T;
  const keys = OWN_KEYS(value);
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    const descriptor = GET_DESCRIPTOR(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new Error("Planner 68 canonical evidence requires own data fields.");
    }
    DEFINE_PROPERTY(result, key, descriptor);
  }
  return result;
}

function assertStructuredCloneSafe(value: unknown, label: string): void {
  try {
    STRUCTURED_CLONE(value);
  } catch {
    throw new Error(label + " cannot be Proxy-backed or otherwise uncloneable.");
  }
}

function ownDataValue(value: object, field: string, label: string): unknown {
  const descriptor = GET_DESCRIPTOR(value, field);
  if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
    throw new Error(
      label + " requires enumerable own data field " + field + ".",
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
    value && typeof value === "object" ? GET_PROTOTYPE_OF(value) : undefined;
  if (
    !value ||
    typeof value !== "object" ||
    IS_ARRAY(value) ||
    (prototype !== Object.prototype && prototype !== null)
  ) {
    throw new Error(label + " must be a plain object.");
  }

  const keys = OWN_KEYS(value);
  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const key = keys[keyIndex];
    if (typeof key !== "string") {
      throw new Error(label + " cannot contain symbol fields.");
    }

    let known = false;
    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
      if (fields[fieldIndex] === key) {
        known = true;
        break;
      }
    }
    if (!known) {
      throw new Error(label + " cannot contain unknown field " + key + ".");
    }
  }

  for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
    const field = fields[fieldIndex];
    if (!HAS_OWN(value, field)) {
      throw new Error(label + " is missing required field " + field + ".");
    }
    const descriptor = GET_DESCRIPTOR(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(
        label + " requires enumerable own data field " + field + ".",
      );
    }
  }
}

function assertArray(
  value: unknown,
  length: number,
  label: string,
): asserts value is unknown[] {
  if (
    !IS_ARRAY(value) ||
    GET_PROTOTYPE_OF(value) !== Array.prototype ||
    value.length !== length
  ) {
    throw new Error(
      label + " must be an ordinary array of length " + length + ".",
    );
  }

  const keys = OWN_KEYS(value);
  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const key = keys[keyIndex];
    if (typeof key !== "string") {
      throw new Error(label + " cannot contain extra own properties.");
    }
    if (key === "length") continue;

    let allowed = false;
    for (let index = 0; index < length; index += 1) {
      if (key === String(index)) {
        allowed = true;
        break;
      }
    }
    if (!allowed) {
      throw new Error(label + " cannot contain extra own properties.");
    }
  }

  for (let index = 0; index < length; index += 1) {
    const descriptor = GET_DESCRIPTOR(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(
        label + " requires enumerable own data element " + index + ".",
      );
    }
  }
}

function assertNoRouteMaterialization(
  value: Record<string, unknown>,
  label: string,
): void {
  for (
    let fieldIndex = 0;
    fieldIndex < FORBIDDEN_ROUTE_FIELDS.length;
    fieldIndex += 1
  ) {
    const field = FORBIDDEN_ROUTE_FIELDS[fieldIndex];
    if (field in value) {
      throw new Error(label + " cannot materialize route field " + field + ".");
    }
  }
}

const INBOUND = nullRecord<UnnamedFootwayBranchConnection>({
  sourceWayId: INBOUND_WAY_ID,
  sourceWayVersion: 1,
  sourceWayTimestamp: TARGET_TIMESTAMP,
  sourceWayChangeset: SOURCE_CHANGESET,
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/1481578625/1",
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578625",
  sourceHighway: "footway",
  sourceNameStatus: "absent",
  orderedNodeIds: copyArray(INBOUND_NODE_IDS),
  endpointNodeIndex: 1,
  connectionRole: "inbound-qualified-segment",
});

const ACCESS_NO_CANDIDATE = nullRecord<UnnamedFootwayBranchConnection>({
  sourceWayId: ACCESS_NO_WAY_ID,
  sourceWayVersion: 6,
  sourceWayTimestamp: TARGET_TIMESTAMP,
  sourceWayChangeset: SOURCE_CHANGESET,
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/148910140/6",
  sourceWayUrl: "https://www.openstreetmap.org/way/148910140",
  sourceHighway: "footway",
  sourceNameStatus: "absent",
  sourceAccess: "no",
  sourceFee: "yes",
  sourceLayer: "-1",
  orderedNodeIds: copyArray(ACCESS_NO_NODE_IDS),
  endpointNodeIndex: 27,
  connectionRole: "outbound-candidate",
});

const FEE_CANDIDATE = nullRecord<UnnamedFootwayBranchConnection>({
  sourceWayId: FEE_FOOTWAY_ID,
  sourceWayVersion: 1,
  sourceWayTimestamp: TARGET_TIMESTAMP,
  sourceWayChangeset: SOURCE_CHANGESET,
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/1481578626/1",
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578626",
  sourceHighway: "footway",
  sourceNameStatus: "absent",
  sourceFee: "yes",
  sourceLayer: "-1",
  orderedNodeIds: copyArray(FEE_FOOTWAY_NODE_IDS),
  endpointNodeIndex: 0,
  connectionRole: "outbound-candidate",
});

const RAW_AUTHORITY: InteriorUnnamedFootwayBranchingTopologyAuthority[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    endpointNodeId: ENDPOINT_NODE_ID,
    endpointCoordinate: nullRecord({
      lat: 32.7358299,
      lng: -117.150419,
      sourceVersion: 2,
      sourceTimestamp: TARGET_TIMESTAMP,
      sourceChangeset: SOURCE_CHANGESET,
    }),
    connectedWays: [INBOUND, ACCESS_NO_CANDIDATE, FEE_CANDIDATE],
    outboundCandidateWayIds: [ACCESS_NO_WAY_ID, FEE_FOOTWAY_ID],
    outboundCandidateCount: 2,
    branchSelectionStatus: "unresolved",
    selectionRule:
      "requires-independent-objective-authority-when-multiple-non-inbound-linear-highway-ways-exist",
    plannerMaterialization: "branching-topology-only",
  }),
];

export function assertInteriorUnnamedFootwayBranchingTopologyIntegrity(
  authorities: readonly InteriorUnnamedFootwayBranchingTopologyAuthority[],
): void {
  const collectionLabel = "Planner 68 authority collection";
  const authorityLabel = "Planner 68 authority";
  const coordinateLabel = "Planner 68 endpoint coordinate";
  const waysLabel = "Planner 68 connected way collection";
  const outboundIdsLabel = "Planner 68 outbound candidate collection";
  const inboundLabel = "Planner 68 inbound connection";
  const accessNoLabel = "Planner 68 access-no candidate";
  const feeLabel = "Planner 68 fee candidate";
  const inboundNodesLabel = "Planner 68 inbound node sequence";
  const accessNoNodesLabel = "Planner 68 access-no node sequence";
  const feeNodesLabel = "Planner 68 fee node sequence";

  assertArray(authorities, 1, collectionLabel);
  const candidate = ownDataValue(authorities, "0", collectionLabel);
  assertPlain(candidate, TOP_LEVEL_FIELDS, authorityLabel);

  const endpointCoordinate = ownDataValue(
    candidate,
    "endpointCoordinate",
    authorityLabel,
  );
  const connectedWays = ownDataValue(candidate, "connectedWays", authorityLabel);
  const outboundCandidateWayIds = ownDataValue(
    candidate,
    "outboundCandidateWayIds",
    authorityLabel,
  );

  assertPlain(endpointCoordinate, COORDINATE_FIELDS, coordinateLabel);
  assertArray(connectedWays, 3, waysLabel);
  assertArray(outboundCandidateWayIds, 2, outboundIdsLabel);

  const inboundRecord = ownDataValue(connectedWays, "0", waysLabel);
  const accessNoRecord = ownDataValue(connectedWays, "1", waysLabel);
  const feeRecord = ownDataValue(connectedWays, "2", waysLabel);

  assertPlain(inboundRecord, CONNECTION_BASE_FIELDS, inboundLabel);
  assertPlain(accessNoRecord, ACCESS_NO_FIELDS, accessNoLabel);
  assertPlain(feeRecord, FEE_FIELDS, feeLabel);

  const inboundNodeIds = ownDataValue(
    inboundRecord,
    "orderedNodeIds",
    inboundLabel,
  );
  const accessNoNodeIds = ownDataValue(
    accessNoRecord,
    "orderedNodeIds",
    accessNoLabel,
  );
  const feeNodeIds = ownDataValue(feeRecord, "orderedNodeIds", feeLabel);

  assertArray(inboundNodeIds, 2, inboundNodesLabel);
  assertArray(accessNoNodeIds, 28, accessNoNodesLabel);
  assertArray(feeNodeIds, 2, feeNodesLabel);

  assertStructuredCloneSafe(authorities, collectionLabel);

  if (
    ownDataValue(authorities, "0", collectionLabel) !== candidate ||
    ownDataValue(candidate, "endpointCoordinate", authorityLabel) !==
      endpointCoordinate ||
    ownDataValue(candidate, "connectedWays", authorityLabel) !== connectedWays ||
    ownDataValue(candidate, "outboundCandidateWayIds", authorityLabel) !==
      outboundCandidateWayIds ||
    ownDataValue(connectedWays, "0", waysLabel) !== inboundRecord ||
    ownDataValue(connectedWays, "1", waysLabel) !== accessNoRecord ||
    ownDataValue(connectedWays, "2", waysLabel) !== feeRecord ||
    ownDataValue(inboundRecord, "orderedNodeIds", inboundLabel) !==
      inboundNodeIds ||
    ownDataValue(accessNoRecord, "orderedNodeIds", accessNoLabel) !==
      accessNoNodeIds ||
    ownDataValue(feeRecord, "orderedNodeIds", feeLabel) !== feeNodeIds
  ) {
    throw new Error(
      "Planner 68 authority graph cannot mutate during validation.",
    );
  }

  assertNoRouteMaterialization(candidate, authorityLabel);
  assertNoRouteMaterialization(
    endpointCoordinate as Record<string, unknown>,
    coordinateLabel,
  );
  assertNoRouteMaterialization(
    inboundRecord as Record<string, unknown>,
    inboundLabel,
  );
  assertNoRouteMaterialization(
    accessNoRecord as Record<string, unknown>,
    accessNoLabel,
  );
  assertNoRouteMaterialization(
    feeRecord as Record<string, unknown>,
    feeLabel,
  );

  const authority =
    candidate as unknown as InteriorUnnamedFootwayBranchingTopologyAuthority;
  const endpoint =
    endpointCoordinate as unknown as InteriorUnnamedFootwayBranchingTopologyAuthority["endpointCoordinate"];
  const inbound = inboundRecord as unknown as UnnamedFootwayBranchConnection;
  const accessNo =
    accessNoRecord as unknown as UnnamedFootwayBranchConnection;
  const fee = feeRecord as unknown as UnnamedFootwayBranchConnection;

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.targetTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointNodeId !== ENDPOINT_NODE_ID ||
    endpoint.lat !== 32.7358299 ||
    endpoint.lng !== -117.150419 ||
    endpoint.sourceVersion !== 2 ||
    endpoint.sourceTimestamp !== TARGET_TIMESTAMP ||
    endpoint.sourceChangeset !== SOURCE_CHANGESET ||
    authority.outboundCandidateCount !== 2 ||
    outboundCandidateWayIds[0] !== ACCESS_NO_WAY_ID ||
    outboundCandidateWayIds[1] !== FEE_FOOTWAY_ID ||
    authority.branchSelectionStatus !== "unresolved" ||
    authority.selectionRule !==
      "requires-independent-objective-authority-when-multiple-non-inbound-linear-highway-ways-exist" ||
    authority.plannerMaterialization !== "branching-topology-only"
  ) {
    throw new Error(
      "Planner 68 branching topology drifted from captured historical evidence.",
    );
  }

  const geometry = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  const endpointNode = geometry.nodes[1];
  if (
    geometry.sourceWayId !== INBOUND_WAY_ID ||
    geometry.sourceWayVersion !== 1 ||
    geometry.sourceWayTimestamp !== TARGET_TIMESTAMP ||
    geometry.sourceWayChangeset !== SOURCE_CHANGESET ||
    geometry.sourceHighway !== "footway" ||
    geometry.sourceNameStatus !== "absent" ||
    "sourceName" in geometry ||
    geometry.traversalFromNodeId !== INBOUND_NODE_IDS[0] ||
    geometry.traversalToNodeId !== ENDPOINT_NODE_ID ||
    geometry.orderedNodeIds[0] !== INBOUND_NODE_IDS[0] ||
    geometry.orderedNodeIds[1] !== ENDPOINT_NODE_ID ||
    endpointNode.sourceObjectId !== ENDPOINT_NODE_ID ||
    endpointNode.sourceVersion !== 2 ||
    endpointNode.sourceTimestamp !== TARGET_TIMESTAMP ||
    endpointNode.sourceChangeset !== SOURCE_CHANGESET ||
    endpointNode.lat !== endpoint.lat ||
    endpointNode.lng !== endpoint.lng
  ) {
    throw new Error(
      "Planner 68 detached from Planner 67 version-pinned geometry.",
    );
  }

  if (
    inbound.sourceWayId !== INBOUND_WAY_ID ||
    inbound.sourceWayVersion !== 1 ||
    inbound.sourceWayTimestamp !== TARGET_TIMESTAMP ||
    inbound.sourceWayChangeset !== SOURCE_CHANGESET ||
    inbound.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/1481578625/1" ||
    inbound.sourceWayUrl !== "https://www.openstreetmap.org/way/1481578625" ||
    inbound.sourceHighway !== "footway" ||
    inbound.sourceNameStatus !== "absent" ||
    "sourceName" in inbound ||
    "sourceAccess" in inbound ||
    "sourceFee" in inbound ||
    "sourceLayer" in inbound ||
    inbound.endpointNodeIndex !== 1 ||
    inbound.connectionRole !== "inbound-qualified-segment"
  ) {
    throw new Error("Planner 68 inbound connection drifted.");
  }

  if (
    accessNo.sourceWayId !== ACCESS_NO_WAY_ID ||
    accessNo.sourceWayVersion !== 6 ||
    accessNo.sourceWayTimestamp !== TARGET_TIMESTAMP ||
    accessNo.sourceWayChangeset !== SOURCE_CHANGESET ||
    accessNo.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/148910140/6" ||
    accessNo.sourceWayUrl !== "https://www.openstreetmap.org/way/148910140" ||
    accessNo.sourceHighway !== "footway" ||
    accessNo.sourceNameStatus !== "absent" ||
    "sourceName" in accessNo ||
    accessNo.sourceAccess !== "no" ||
    accessNo.sourceFee !== "yes" ||
    accessNo.sourceLayer !== "-1" ||
    accessNo.endpointNodeIndex !== 27 ||
    accessNo.connectionRole !== "outbound-candidate"
  ) {
    throw new Error("Planner 68 access-no candidate drifted.");
  }

  if (
    fee.sourceWayId !== FEE_FOOTWAY_ID ||
    fee.sourceWayVersion !== 1 ||
    fee.sourceWayTimestamp !== TARGET_TIMESTAMP ||
    fee.sourceWayChangeset !== SOURCE_CHANGESET ||
    fee.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/1481578626/1" ||
    fee.sourceWayUrl !== "https://www.openstreetmap.org/way/1481578626" ||
    fee.sourceHighway !== "footway" ||
    fee.sourceNameStatus !== "absent" ||
    "sourceName" in fee ||
    "sourceAccess" in fee ||
    fee.sourceFee !== "yes" ||
    fee.sourceLayer !== "-1" ||
    fee.endpointNodeIndex !== 0 ||
    fee.connectionRole !== "outbound-candidate"
  ) {
    throw new Error("Planner 68 fee candidate drifted.");
  }

  for (let index = 0; index < INBOUND_NODE_IDS.length; index += 1) {
    if (inboundNodeIds[index] !== INBOUND_NODE_IDS[index]) {
      throw new Error("Planner 68 inbound node sequence drifted.");
    }
  }
  for (let index = 0; index < ACCESS_NO_NODE_IDS.length; index += 1) {
    if (accessNoNodeIds[index] !== ACCESS_NO_NODE_IDS[index]) {
      throw new Error("Planner 68 access-no node sequence drifted.");
    }
  }
  for (let index = 0; index < FEE_FOOTWAY_NODE_IDS.length; index += 1) {
    if (feeNodeIds[index] !== FEE_FOOTWAY_NODE_IDS[index]) {
      throw new Error("Planner 68 fee node sequence drifted.");
    }
  }
}

assertInteriorUnnamedFootwayBranchingTopologyIntegrity(RAW_AUTHORITY);

export const INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY:
  readonly InteriorUnnamedFootwayBranchingTopologyAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorUnnamedFootwayBranchingTopology():
  InteriorUnnamedFootwayBranchingTopologyAssessment {
  return deepFreeze(
    nullRecord<InteriorUnnamedFootwayBranchingTopologyAssessment>({
      status: "branching-topology-sourced",
      authorityId: AUTHORITY_ID,
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      endpointNodeId: ENDPOINT_NODE_ID,
      historicalConnectedWayCount: 3,
      outboundCandidateWayIds: [ACCESS_NO_WAY_ID, FEE_FOOTWAY_ID],
      branchSelectionStatus: "unresolved",
      routeGraphExpansion: nullRecord({
        status: "blocked",
        reasons: [
          BLOCK_REASONS[0],
          BLOCK_REASONS[1],
          BLOCK_REASONS[2],
        ],
      }),
    }),
  );
}
