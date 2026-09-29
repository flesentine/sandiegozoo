import {
  INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY,
} from "./zooInteriorFernCanyonNextStepsFarEndpointTopology.ts";

const AUTHORITY_ID =
  "sdz-interior-tiger-trail-unnamed-footway-v1-geometry" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const SOURCE_WAY_ID = "1481578625" as const;
const SOURCE_WAY_VERSION = 1 as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const SOURCE_WAY_CHANGESET = 178875075 as const;
const FROM_NODE_ID = "13588159634" as const;
const TO_NODE_ID = "1619736694" as const;
const STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);

const NODE_RECORDS = [
  {
    sourceObjectId: "13588159634",
    sourceVersion: 1,
    lat: 32.7357982,
    lng: -117.150403,
  },
  {
    sourceObjectId: "1619736694",
    sourceVersion: 2,
    lat: 32.7358299,
    lng: -117.150419,
  },
] as const;

const ORDERED_NODE_IDS = [
  NODE_RECORDS[0].sourceObjectId,
  NODE_RECORDS[1].sourceObjectId,
] as const;

export type UnnamedFootwayGeometryNode = {
  sourceObjectId: string;
  sourceVersion: number;
  sourceTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceChangeset: typeof SOURCE_WAY_CHANGESET;
  sourceVersionUrl: string;
  sourceUrl: string;
  lat: number;
  lng: number;
};

export type InteriorUnnamedFootwayGeometryAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578625";
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/1481578625/1";
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_WAY_CHANGESET;
  sourceHighway: "footway";
  sourceNameStatus: "absent";
  sourceWayNodeCount: 2;
  orderedNodeIds: readonly string[];
  nodes: readonly UnnamedFootwayGeometryNode[];
  traversalFromNodeId: typeof FROM_NODE_ID;
  traversalToNodeId: typeof TO_NODE_ID;
  sourceOrderTraversal: "forward";
  nodeVersionSelectionRule:
    "latest-visible-version-at-or-before-way-version-timestamp";
  versionPinnedNodeSequenceStatus: "captured";
  farEndpointTopologyStatus: "not-frozen";
  plannerMaterialization: "version-pinned-geometry-only";
};

export type InteriorUnnamedFootwayGeometryAssessment = {
  status: "geometry-captured";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceNameStatus: "absent";
  sourceWayNodeCount: 2;
  traversalFromNodeId: typeof FROM_NODE_ID;
  traversalToNodeId: typeof TO_NODE_ID;
  coordinateProvenance: "version-pinned";
  farEndpointTopologyStatus: "not-frozen";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "UNNAMED_FOOTWAY_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
      "EXACT_UNNAMED_FOOTWAY_SEGMENT_SEMANTICS_NOT_QUALIFIED",
    ];
  };
};

const TOP_LEVEL_FIELDS = [
  "id",
  "provider",
  "objectiveSourceRecordId",
  "sourceWayId",
  "sourceWayUrl",
  "sourceWayVersionUrl",
  "sourceWayVersion",
  "sourceWayTimestamp",
  "sourceWayChangeset",
  "sourceHighway",
  "sourceNameStatus",
  "sourceWayNodeCount",
  "orderedNodeIds",
  "nodes",
  "traversalFromNodeId",
  "traversalToNodeId",
  "sourceOrderTraversal",
  "nodeVersionSelectionRule",
  "versionPinnedNodeSequenceStatus",
  "farEndpointTopologyStatus",
  "plannerMaterialization",
] as const;

const NODE_FIELDS = [
  "sourceObjectId",
  "sourceVersion",
  "sourceTimestamp",
  "sourceChangeset",
  "sourceVersionUrl",
  "sourceUrl",
  "lat",
  "lng",
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

const BLOCK_REASONS = [
  "UNNAMED_FOOTWAY_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
  "EXACT_UNNAMED_FOOTWAY_SEGMENT_SEMANTICS_NOT_QUALIFIED",
] as const;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    const children = Object.values(value as Record<string, unknown>);
    for (let index = 0; index < children.length; index += 1) {
      deepFreeze(children[index]);
    }
    Object.freeze(value);
  }
  return value;
}

function nullRecord<T extends object>(value: T): T {
  const result = Object.create(null) as T;
  const keys = Reflect.ownKeys(value);
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new Error("Planner 67 canonical geometry requires own data fields.");
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
  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const key = keys[keyIndex];
    if (typeof key !== "string") {
      throw new Error(`${label} cannot contain symbol fields.`);
    }

    let known = false;
    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
      if (fields[fieldIndex] === key) {
        known = true;
        break;
      }
    }
    if (!known) {
      throw new Error(`${label} cannot contain unknown field ${key}.`);
    }
  }

  for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
    const field = fields[fieldIndex];
    if (!Object.hasOwn(value, field)) {
      throw new Error(`${label} is missing required field ${field}.`);
    }
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

  const keys = Reflect.ownKeys(value);
  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const key = keys[keyIndex];
    if (typeof key !== "string") {
      throw new Error(`${label} cannot contain extra own properties.`);
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
      throw new Error(`${label} cannot contain extra own properties.`);
    }
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
  for (
    let fieldIndex = 0;
    fieldIndex < FORBIDDEN_ROUTE_FIELDS.length;
    fieldIndex += 1
  ) {
    const field = FORBIDDEN_ROUTE_FIELDS[fieldIndex];
    if (field in value) {
      throw new Error(`${label} cannot materialize route field ${field}.`);
    }
  }
}

const RAW_NODES: UnnamedFootwayGeometryNode[] = [
  nullRecord({
    sourceObjectId: NODE_RECORDS[0].sourceObjectId,
    sourceVersion: NODE_RECORDS[0].sourceVersion,
    sourceTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceChangeset: SOURCE_WAY_CHANGESET,
    sourceVersionUrl:
      `https://api.openstreetmap.org/api/0.6/node/${NODE_RECORDS[0].sourceObjectId}/${NODE_RECORDS[0].sourceVersion}`,
    sourceUrl:
      `https://www.openstreetmap.org/node/${NODE_RECORDS[0].sourceObjectId}`,
    lat: NODE_RECORDS[0].lat,
    lng: NODE_RECORDS[0].lng,
  }),
  nullRecord({
    sourceObjectId: NODE_RECORDS[1].sourceObjectId,
    sourceVersion: NODE_RECORDS[1].sourceVersion,
    sourceTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceChangeset: SOURCE_WAY_CHANGESET,
    sourceVersionUrl:
      `https://api.openstreetmap.org/api/0.6/node/${NODE_RECORDS[1].sourceObjectId}/${NODE_RECORDS[1].sourceVersion}`,
    sourceUrl:
      `https://www.openstreetmap.org/node/${NODE_RECORDS[1].sourceObjectId}`,
    lat: NODE_RECORDS[1].lat,
    lng: NODE_RECORDS[1].lng,
  }),
];

const RAW_AUTHORITY: InteriorUnnamedFootwayGeometryAuthority[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578625",
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481578625/1",
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceWayChangeset: SOURCE_WAY_CHANGESET,
    sourceHighway: "footway",
    sourceNameStatus: "absent",
    sourceWayNodeCount: 2,
    orderedNodeIds: [ORDERED_NODE_IDS[0], ORDERED_NODE_IDS[1]],
    nodes: RAW_NODES,
    traversalFromNodeId: FROM_NODE_ID,
    traversalToNodeId: TO_NODE_ID,
    sourceOrderTraversal: "forward",
    nodeVersionSelectionRule:
      "latest-visible-version-at-or-before-way-version-timestamp",
    versionPinnedNodeSequenceStatus: "captured",
    farEndpointTopologyStatus: "not-frozen",
    plannerMaterialization: "version-pinned-geometry-only",
  }),
];

export function assertInteriorUnnamedFootwayGeometryIntegrity(
  authorities: readonly InteriorUnnamedFootwayGeometryAuthority[],
): void {
  const collectionLabel = "Planner 67 authority collection";
  const authorityLabel = "Planner 67 authority";
  const orderedNodeIdsLabel = "Planner 67 ordered node sequence";
  const nodesLabel = "Planner 67 node provenance collection";

  assertArray(authorities, 1, collectionLabel);
  const candidate = ownDataValue(authorities, "0", collectionLabel);
  assertPlain(candidate, TOP_LEVEL_FIELDS, authorityLabel);

  const orderedNodeIds = ownDataValue(
    candidate,
    "orderedNodeIds",
    authorityLabel,
  );
  const nodes = ownDataValue(candidate, "nodes", authorityLabel);
  assertArray(orderedNodeIds, 2, orderedNodeIdsLabel);
  assertArray(nodes, 2, nodesLabel);

  const capturedNodes: Record<string, unknown>[] = new Array(2);
  for (let index = 0; index < 2; index += 1) {
    const nodeLabel = `Planner 67 node ${index}`;
    const node = ownDataValue(nodes, String(index), nodesLabel);
    assertPlain(node, NODE_FIELDS, nodeLabel);
    capturedNodes[index] = node;
  }

  assertStructuredCloneSafe(authorities, collectionLabel);

  if (
    ownDataValue(authorities, "0", collectionLabel) !== candidate ||
    ownDataValue(candidate, "orderedNodeIds", authorityLabel) !== orderedNodeIds ||
    ownDataValue(candidate, "nodes", authorityLabel) !== nodes
  ) {
    throw new Error(
      "Planner 67 authority graph cannot mutate during validation.",
    );
  }

  for (let index = 0; index < 2; index += 1) {
    if (ownDataValue(nodes, String(index), nodesLabel) !== capturedNodes[index]) {
      throw new Error(
        "Planner 67 authority graph cannot mutate during validation.",
      );
    }
  }

  assertNoRouteMaterialization(candidate, authorityLabel);
  for (let index = 0; index < 2; index += 1) {
    assertNoRouteMaterialization(
      capturedNodes[index],
      `Planner 67 node ${index}`,
    );
  }

  const authority =
    candidate as unknown as InteriorUnnamedFootwayGeometryAuthority;
  const prior = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  const selected = prior.connectedWays[1];

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.sourceWayId !== SOURCE_WAY_ID ||
    authority.sourceWayUrl !== "https://www.openstreetmap.org/way/1481578625" ||
    authority.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/1481578625/1" ||
    authority.sourceWayVersion !== SOURCE_WAY_VERSION ||
    authority.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    authority.sourceWayChangeset !== SOURCE_WAY_CHANGESET ||
    authority.sourceHighway !== "footway" ||
    authority.sourceNameStatus !== "absent" ||
    "sourceName" in authority ||
    authority.sourceWayNodeCount !== 2 ||
    authority.traversalFromNodeId !== FROM_NODE_ID ||
    authority.traversalToNodeId !== TO_NODE_ID ||
    authority.sourceOrderTraversal !== "forward" ||
    authority.nodeVersionSelectionRule !==
      "latest-visible-version-at-or-before-way-version-timestamp" ||
    authority.versionPinnedNodeSequenceStatus !== "captured" ||
    authority.farEndpointTopologyStatus !== "not-frozen" ||
    authority.plannerMaterialization !== "version-pinned-geometry-only"
  ) {
    throw new Error(
      "Planner 67 geometry drifted from the frozen unnamed-footway evidence.",
    );
  }

  if (
    prior.selectedContinuationWayId !== authority.sourceWayId ||
    prior.selectedContinuationHighway !== authority.sourceHighway ||
    prior.selectedContinuationNameStatus !== "absent" ||
    prior.selectedContinuationEndpointIndex !== 0 ||
    selected.sourceWayId !== authority.sourceWayId ||
    selected.sourceWayUrl !== authority.sourceWayUrl ||
    selected.sourceWayVersionUrl !== authority.sourceWayVersionUrl ||
    selected.sourceWayVersion !== authority.sourceWayVersion ||
    selected.sourceWayTimestamp !== authority.sourceWayTimestamp ||
    selected.sourceWayChangeset !== authority.sourceWayChangeset ||
    selected.sourceHighway !== authority.sourceHighway ||
    "sourceName" in selected ||
    selected.orderedNodeIds.length !== 2 ||
    selected.orderedNodeIds[0] !== FROM_NODE_ID ||
    selected.orderedNodeIds[1] !== TO_NODE_ID ||
    prior.endpointNodeId !== FROM_NODE_ID ||
    prior.endpointCoordinate.lat !== NODE_RECORDS[0].lat ||
    prior.endpointCoordinate.lng !== NODE_RECORDS[0].lng
  ) {
    throw new Error(
      "Planner 67 detached from Planner 66 selected unnamed footway.",
    );
  }

  for (let index = 0; index < 2; index += 1) {
    const expected = NODE_RECORDS[index];
    const node =
      capturedNodes[index] as unknown as UnnamedFootwayGeometryNode;
    if (
      orderedNodeIds[index] !== expected.sourceObjectId ||
      node.sourceObjectId !== expected.sourceObjectId ||
      node.sourceVersion !== expected.sourceVersion ||
      node.sourceTimestamp !== SOURCE_WAY_TIMESTAMP ||
      node.sourceChangeset !== SOURCE_WAY_CHANGESET ||
      node.lat !== expected.lat ||
      node.lng !== expected.lng ||
      node.sourceVersionUrl !==
        `https://api.openstreetmap.org/api/0.6/node/${expected.sourceObjectId}/${expected.sourceVersion}` ||
      node.sourceUrl !==
        `https://www.openstreetmap.org/node/${expected.sourceObjectId}`
    ) {
      throw new Error(
        `Planner 67 node ${expected.sourceObjectId} drifted from captured version-pinned geometry.`,
      );
    }
  }
}

assertInteriorUnnamedFootwayGeometryIntegrity(RAW_AUTHORITY);

export const INTERIOR_UNNAMED_FOOTWAY_GEOMETRY:
  readonly InteriorUnnamedFootwayGeometryAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorUnnamedFootwayGeometry():
  InteriorUnnamedFootwayGeometryAssessment {
  return deepFreeze(
    nullRecord<InteriorUnnamedFootwayGeometryAssessment>({
      status: "geometry-captured",
      authorityId: AUTHORITY_ID,
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      sourceWayId: SOURCE_WAY_ID,
      sourceWayVersion: SOURCE_WAY_VERSION,
      sourceNameStatus: "absent",
      sourceWayNodeCount: 2,
      traversalFromNodeId: FROM_NODE_ID,
      traversalToNodeId: TO_NODE_ID,
      coordinateProvenance: "version-pinned",
      farEndpointTopologyStatus: "not-frozen",
      routeGraphExpansion: nullRecord({
        status: "blocked",
        reasons: [BLOCK_REASONS[0], BLOCK_REASONS[1]],
      }),
    }),
  );
}
