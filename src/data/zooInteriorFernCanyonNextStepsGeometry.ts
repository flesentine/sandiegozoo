import {
  INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY,
} from "./zooInteriorFernCanyonBridgeFarEndpointTopology.ts";

const AUTHORITY_ID =
  "sdz-interior-fern-canyon-next-steps-v1-geometry" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const SOURCE_WAY_ID = "1481578624" as const;
const SOURCE_WAY_VERSION = 1 as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const SOURCE_WAY_CHANGESET = 178875075 as const;
const FROM_NODE_ID = "13588159633" as const;
const TO_NODE_ID = "13588159634" as const;

const NODE_TUPLES = [
  ["13588159634", 32.7357982, -117.150403],
  ["13588159633", 32.7357407, -117.1503614],
] as const;

const ORDERED_NODE_IDS = NODE_TUPLES.map(([id]) => id);

export type FernCanyonNextStepsGeometryNode = {
  sourceObjectId: string;
  sourceVersion: 1;
  sourceTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceChangeset: typeof SOURCE_WAY_CHANGESET;
  sourceVersionUrl: string;
  sourceUrl: string;
  lat: number;
  lng: number;
};

export type InteriorFernCanyonNextStepsGeometryAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578624";
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/1481578624/1";
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_WAY_CHANGESET;
  sourceHighway: "steps";
  sourceName: "Fern Canyon Trail";
  sourceIncline: "up";
  sourceWayNodeCount: 2;
  orderedNodeIds: readonly string[];
  nodes: readonly FernCanyonNextStepsGeometryNode[];
  traversalFromNodeId: typeof FROM_NODE_ID;
  traversalToNodeId: typeof TO_NODE_ID;
  sourceOrderTraversal: "reverse";
  nodeVersionSelectionRule:
    "latest-visible-version-at-or-before-way-version-timestamp";
  versionPinnedNodeSequenceStatus: "captured";
  farEndpointTopologyStatus: "not-frozen";
  plannerMaterialization: "version-pinned-geometry-only";
};

export type InteriorFernCanyonNextStepsGeometryAssessment = {
  status: "geometry-captured";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayNodeCount: 2;
  traversalFromNodeId: typeof FROM_NODE_ID;
  traversalToNodeId: typeof TO_NODE_ID;
  sourceOrderTraversal: "reverse";
  coordinateProvenance: "version-pinned";
  farEndpointTopologyStatus: "not-frozen";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
      "EXACT_FERN_CANYON_NEXT_STEPS_SEGMENT_SEMANTICS_NOT_QUALIFIED",
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
  "sourceName",
  "sourceIncline",
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
  "FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
  "EXACT_FERN_CANYON_NEXT_STEPS_SEGMENT_SEMANTICS_NOT_QUALIFIED",
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
      throw new Error("Planner 65 canonical geometry requires own data fields.");
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

const RAW_NODES: FernCanyonNextStepsGeometryNode[] = NODE_TUPLES.map(
  ([sourceObjectId, lat, lng]) =>
    nullRecord({
      sourceObjectId,
      sourceVersion: 1,
      sourceTimestamp: SOURCE_WAY_TIMESTAMP,
      sourceChangeset: SOURCE_WAY_CHANGESET,
      sourceVersionUrl:
        `https://api.openstreetmap.org/api/0.6/node/${sourceObjectId}/1`,
      sourceUrl:
        `https://www.openstreetmap.org/node/${sourceObjectId}`,
      lat,
      lng,
    }),
);

const RAW_AUTHORITY: InteriorFernCanyonNextStepsGeometryAuthority[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578624",
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481578624/1",
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceWayChangeset: SOURCE_WAY_CHANGESET,
    sourceHighway: "steps",
    sourceName: "Fern Canyon Trail",
    sourceIncline: "up",
    sourceWayNodeCount: 2,
    orderedNodeIds: [...ORDERED_NODE_IDS],
    nodes: RAW_NODES,
    traversalFromNodeId: FROM_NODE_ID,
    traversalToNodeId: TO_NODE_ID,
    sourceOrderTraversal: "reverse",
    nodeVersionSelectionRule:
      "latest-visible-version-at-or-before-way-version-timestamp",
    versionPinnedNodeSequenceStatus: "captured",
    farEndpointTopologyStatus: "not-frozen",
    plannerMaterialization: "version-pinned-geometry-only",
  }),
];

export function assertInteriorFernCanyonNextStepsGeometryIntegrity(
  authorities: readonly InteriorFernCanyonNextStepsGeometryAuthority[],
): void {
  assertArray(authorities, 1, "Planner 65 authority collection");
  const candidate = authorities[0] as unknown;
  assertPlain(candidate, TOP_LEVEL_FIELDS, "Planner 65 authority");
  assertNoRouteMaterialization(candidate, "Planner 65 authority");

  const authority =
    candidate as unknown as InteriorFernCanyonNextStepsGeometryAuthority;
  assertArray(authority.orderedNodeIds, 2, "Planner 65 ordered node sequence");
  assertArray(authority.nodes, 2, "Planner 65 node provenance collection");
  for (let index = 0; index < 2; index += 1) {
    assertPlain(authority.nodes[index], NODE_FIELDS, `Planner 65 node ${index}`);
    assertNoRouteMaterialization(
      authority.nodes[index] as unknown as Record<string, unknown>,
      `Planner 65 node ${index}`,
    );
  }

  const prior = INTERIOR_FERN_CANYON_BRIDGE_FAR_ENDPOINT_TOPOLOGY[0];
  const selected = prior.connectedWays[1];

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.sourceWayId !== SOURCE_WAY_ID ||
    authority.sourceWayVersion !== SOURCE_WAY_VERSION ||
    authority.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    authority.sourceWayChangeset !== SOURCE_WAY_CHANGESET ||
    authority.sourceHighway !== "steps" ||
    authority.sourceName !== "Fern Canyon Trail" ||
    authority.sourceIncline !== "up" ||
    authority.sourceWayNodeCount !== 2 ||
    authority.traversalFromNodeId !== FROM_NODE_ID ||
    authority.traversalToNodeId !== TO_NODE_ID ||
    authority.sourceOrderTraversal !== "reverse" ||
    authority.nodeVersionSelectionRule !==
      "latest-visible-version-at-or-before-way-version-timestamp" ||
    authority.versionPinnedNodeSequenceStatus !== "captured" ||
    authority.farEndpointTopologyStatus !== "not-frozen" ||
    authority.plannerMaterialization !== "version-pinned-geometry-only"
  ) {
    throw new Error(
      "Planner 65 geometry drifted from the frozen Fern Canyon next-steps evidence.",
    );
  }

  if (
    prior.selectedContinuationWayId !== authority.sourceWayId ||
    selected.sourceWayId !== authority.sourceWayId ||
    selected.sourceWayVersion !== authority.sourceWayVersion ||
    selected.sourceWayTimestamp !== authority.sourceWayTimestamp ||
    selected.sourceWayChangeset !== authority.sourceWayChangeset ||
    selected.sourceHighway !== authority.sourceHighway ||
    selected.sourceName !== authority.sourceName ||
    selected.sourceIncline !== authority.sourceIncline ||
    selected.orderedNodeIds.length !== 2
  ) {
    throw new Error(
      "Planner 65 detached from Planner 64 selected steps continuation.",
    );
  }

  for (let index = 0; index < 2; index += 1) {
    const [id, lat, lng] = NODE_TUPLES[index];
    const node = authority.nodes[index];
    if (
      authority.orderedNodeIds[index] !== id ||
      selected.orderedNodeIds[index] !== id ||
      node.sourceObjectId !== id ||
      node.sourceVersion !== 1 ||
      node.sourceTimestamp !== SOURCE_WAY_TIMESTAMP ||
      node.sourceChangeset !== SOURCE_WAY_CHANGESET ||
      node.lat !== lat ||
      node.lng !== lng ||
      node.sourceVersionUrl !==
        `https://api.openstreetmap.org/api/0.6/node/${id}/1`
    ) {
      throw new Error(
        `Planner 65 node ${id} drifted from captured version-pinned geometry.`,
      );
    }
  }
}

assertInteriorFernCanyonNextStepsGeometryIntegrity(RAW_AUTHORITY);

export const INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY:
  readonly InteriorFernCanyonNextStepsGeometryAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorFernCanyonNextStepsGeometry():
  InteriorFernCanyonNextStepsGeometryAssessment {
  return deepFreeze({
    status: "geometry-captured",
    authorityId: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayNodeCount: 2,
    traversalFromNodeId: FROM_NODE_ID,
    traversalToNodeId: TO_NODE_ID,
    sourceOrderTraversal: "reverse",
    coordinateProvenance: "version-pinned",
    farEndpointTopologyStatus: "not-frozen",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...BLOCK_REASONS],
    },
  });
}
