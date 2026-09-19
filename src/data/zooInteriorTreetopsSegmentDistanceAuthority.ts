import {
  INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY,
  assertInteriorTreetopsV7GeometryAuthorityIntegrity,
} from "./zooInteriorTreetopsV7GeometryAuthority.ts";
import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
  assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity,
} from "./zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY,
  assertInteriorTreetopsPedestrianModeAuthorityIntegrity,
} from "./zooInteriorTreetopsPedestrianModeAuthority.ts";

const AUTHORITY_ID = "sdz-interior-treetops-anchor-to-fern-canyon-distance" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TOPOLOGY_AUTHORITY_ID = "sdz-interior-treetops-historical-topology" as const;
const GEOMETRY_AUTHORITY_ID = "sdz-interior-treetops-way-v7-geometry" as const;
const MODE_AUTHORITY_ID = "sdz-interior-treetops-anchor-to-fern-canyon-mode" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:28:40Z" as const;
const SOURCE_WAY_VERSION_URL = "https://api.openstreetmap.org/api/0.6/way/148910139/7" as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;
const FROM_TREETOPS_INDEX = 0 as const;
const TO_TREETOPS_INDEX = 6 as const;
const EARTH_RADIUS_METERS = 6_371_000 as const;
const ROUNDING_DECIMALS = 3 as const;
const EXPECTED_DISTANCE_METERS = 48.615 as const;

const SEGMENT_NODE_IDS = [
  "1619736626",
  "1619736622",
  "1619736623",
  "10303552086",
  "1619736627",
  "1619736634",
  "13588159626",
] as const;

export type InteriorTreetopsSegmentDistanceAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  topologyAuthorityId: typeof TOPOLOGY_AUTHORITY_ID;
  geometryAuthorityId: typeof GEOMETRY_AUTHORITY_ID;
  modeAuthorityId: typeof MODE_AUTHORITY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceWayVersionUrl: typeof SOURCE_WAY_VERSION_URL;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  sourceFromTreetopsIndex: typeof FROM_TREETOPS_INDEX;
  sourceToTreetopsIndex: typeof TO_TREETOPS_INDEX;
  sourceNodeIds: readonly string[];
  distanceMeters: number;
  derivationMethod: "haversine-polyline-segment-sum";
  earthRadiusMeters: typeof EARTH_RADIUS_METERS;
  roundingDecimals: typeof ROUNDING_DECIMALS;
  accuracyClaim: "no-survey-accuracy-claim";
  plannerMaterialization: "distance-only";
};

export type InteriorTreetopsSegmentDistanceAssessment =
  | {
      status: "distance-ready";
      authorityId: typeof AUTHORITY_ID;
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      sourceNodeCount: 7;
      distanceMeters: number;
      derivationMethod: "haversine-polyline-segment-sum";
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "PEDESTRIAN_DIRECTION_NOT_QUALIFIED",
          "EXACT_SEGMENT_DURATION_NOT_QUALIFIED",
          "EXACT_SEGMENT_DIFFICULTY_NOT_QUALIFIED",
          "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
          "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
          "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
          "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_SEGMENT_DISTANCE_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

type DataFieldSnapshot = Readonly<{
  field: string;
  value: unknown;
  enumerable: boolean;
  configurable: boolean;
  writable: boolean;
}>;

const CAPTURED_STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);

const AUTHORITY_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "topologyAuthorityId",
  "geometryAuthorityId",
  "modeAuthorityId",
  "sourceWayId",
  "sourceWayVersion",
  "sourceWayTimestamp",
  "sourceWayVersionUrl",
  "sourceFromNodeId",
  "sourceToNodeId",
  "sourceFromTreetopsIndex",
  "sourceToTreetopsIndex",
  "sourceNodeIds",
  "distanceMeters",
  "derivationMethod",
  "earthRadiusMeters",
  "roundingDecimals",
  "accuracyClaim",
  "plannerMaterialization",
] as const;

const STRING_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "topologyAuthorityId",
  "geometryAuthorityId",
  "modeAuthorityId",
  "sourceWayId",
  "sourceWayTimestamp",
  "sourceWayVersionUrl",
  "sourceFromNodeId",
  "sourceToNodeId",
  "derivationMethod",
  "accuracyClaim",
  "plannerMaterialization",
] as const;

const NUMBER_FIELDS = [
  "sourceWayVersion",
  "sourceFromTreetopsIndex",
  "sourceToTreetopsIndex",
  "distanceMeters",
  "earthRadiusMeters",
  "roundingDecimals",
] as const;

const FORBIDDEN_ROUTE_FIELDS = [
  "mode",
  "durationMinutes",
  "oneWay",
  "direction",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "status",
  "routeNodeId",
  "routeEdgeId",
  "fromNodeId",
  "toNodeId",
] as const;

const REMAINING_BLOCK_REASONS = [
  "PEDESTRIAN_DIRECTION_NOT_QUALIFIED",
  "EXACT_SEGMENT_DURATION_NOT_QUALIFIED",
  "EXACT_SEGMENT_DIFFICULTY_NOT_QUALIFIED",
  "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
  "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
  "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
  "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
] as const;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function assertExactPlainRecord(
  value: unknown,
  fields: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  const prototype = value && typeof value === "object" ? Object.getPrototypeOf(value) : undefined;
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
  const unknown = (keys as string[]).filter((key) => !expected.has(key));
  const missing = fields.filter((key) => !Object.hasOwn(value, key));
  if (unknown.length) throw new Error(`${label} cannot contain unknown field ${unknown.join(", ")}.`);
  if (missing.length) throw new Error(`${label} is missing required field ${missing.join(", ")}.`);

  for (const field of fields) {
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
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    throw new Error(`${label} must be an ordinary array of length ${expectedLength}.`);
  }

  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
  if (
    !lengthDescriptor ||
    !("value" in lengthDescriptor) ||
    lengthDescriptor.value !== expectedLength ||
    lengthDescriptor.enumerable ||
    lengthDescriptor.configurable
  ) {
    throw new Error(`${label} must be an ordinary array of length ${expectedLength}.`);
  }

  const allowed = new Set([
    ...Array.from({ length: expectedLength }, (_, index) => String(index)),
    "length",
  ]);
  if (Reflect.ownKeys(value).some((key) => typeof key !== "string" || !allowed.has(key))) {
    throw new Error(`${label} cannot contain extra own properties.`);
  }

  for (let index = 0; index < expectedLength; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data element ${index}.`);
    }
  }
}

function captureSnapshot(
  value: object,
  fields: readonly string[],
  label: string,
): readonly DataFieldSnapshot[] {
  return fields.map((field) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data field ${field}.`);
    }
    return {
      field,
      value: descriptor.value,
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable === true,
      writable: descriptor.writable === true,
    };
  });
}

function captureArraySnapshot(
  value: unknown[],
  expectedLength: number,
  label: string,
): readonly DataFieldSnapshot[] {
  return captureSnapshot(
    value,
    Array.from({ length: expectedLength }, (_, index) => String(index)),
    label,
  );
}

function snapshotField(snapshot: readonly DataFieldSnapshot[], field: string): unknown {
  const entry = snapshot.find((candidate) => candidate.field === field);
  if (!entry) throw new Error(`Planner 46 internal snapshot is missing ${field}.`);
  return entry.value;
}

function assertPrimitiveSnapshot(
  snapshot: readonly DataFieldSnapshot[],
  stringFields: readonly string[],
  numberFields: readonly string[],
  label: string,
): void {
  for (const field of stringFields) {
    if (typeof snapshotField(snapshot, field) !== "string") {
      throw new Error(`${label} field ${field} must be a primitive string.`);
    }
  }
  for (const field of numberFields) {
    const value = snapshotField(snapshot, field);
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`${label} field ${field} must be a finite primitive number.`);
    }
  }
}

function assertStringArraySnapshot(
  snapshot: readonly DataFieldSnapshot[],
  label: string,
): void {
  for (const entry of snapshot) {
    if (typeof entry.value !== "string") {
      throw new Error(`${label} element ${entry.field} must be a primitive string.`);
    }
  }
}

function assertSnapshotUnchanged(
  value: object,
  snapshot: readonly DataFieldSnapshot[],
  label: string,
): void {
  for (const expected of snapshot) {
    const descriptor = Object.getOwnPropertyDescriptor(value, expected.field);
    if (
      !descriptor ||
      !("value" in descriptor) ||
      descriptor.enumerable !== expected.enumerable ||
      (descriptor.configurable === true) !== expected.configurable ||
      (descriptor.writable === true) !== expected.writable ||
      !Object.is(descriptor.value, expected.value)
    ) {
      throw new Error(`${label} changed during integrity screening.`);
    }
  }
}

function assertSnapshotValue(
  snapshot: readonly DataFieldSnapshot[],
  field: string,
  expected: unknown,
  label: string,
): void {
  if (!Object.is(snapshotField(snapshot, field), expected)) {
    throw new Error(`${label} field ${field} drifted from the frozen contract.`);
  }
}

function assertNoRouteMaterialization(candidate: Record<string, unknown>): void {
  for (const field of FORBIDDEN_ROUTE_FIELDS) {
    if (field in candidate) {
      throw new Error(`Planner 46 distance authority cannot own routing field ${field}.`);
    }
  }
}

function roundDistance(value: number): number {
  const scale = 10 ** ROUNDING_DECIMALS;
  return Math.round(value * scale) / scale;
}

function haversineLegMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  for (const point of [from, to]) {
    if (
      !Number.isFinite(point.lat) ||
      !Number.isFinite(point.lng) ||
      point.lat < -90 ||
      point.lat > 90 ||
      point.lng < -180 ||
      point.lng > 180
    ) {
      throw new Error("Planner 46 distance derivation requires valid finite coordinates.");
    }
  }

  const toRadians = (value: number) => (value * Math.PI) / 180;
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function deriveInteriorTreetopsSegmentDistanceMeters(
  points: readonly { lat: number; lng: number }[],
): number {
  if (!Array.isArray(points) || points.length < 2) {
    throw new Error("Planner 46 distance derivation requires at least two coordinates.");
  }

  let distance = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    distance += haversineLegMeters(points[index], points[index + 1]);
  }
  return roundDistance(distance);
}

assertInteriorTreetopsV7GeometryAuthorityIntegrity(INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY);
assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity(
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
);
assertInteriorTreetopsPedestrianModeAuthorityIntegrity(
  INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY,
);

const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
const topology = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
const mode = INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0];
const segmentNodeIds = topology.segmentProvenance.orderedNodeIds;
const segmentNodes = segmentNodeIds.map((sourceObjectId) => {
  const node = geometry.nodes.find((candidate) => candidate.sourceObjectId === sourceObjectId);
  if (!node) throw new Error(`Planner 46 could not find version-pinned node ${sourceObjectId}.`);
  return node;
});

const RAW_AUTHORITY: InteriorTreetopsSegmentDistanceAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    topologyAuthorityId: TOPOLOGY_AUTHORITY_ID,
    geometryAuthorityId: GEOMETRY_AUTHORITY_ID,
    modeAuthorityId: MODE_AUTHORITY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceWayVersionUrl: SOURCE_WAY_VERSION_URL,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    sourceFromTreetopsIndex: FROM_TREETOPS_INDEX,
    sourceToTreetopsIndex: TO_TREETOPS_INDEX,
    sourceNodeIds: [...segmentNodeIds],
    distanceMeters: deriveInteriorTreetopsSegmentDistanceMeters(segmentNodes),
    derivationMethod: "haversine-polyline-segment-sum",
    earthRadiusMeters: EARTH_RADIUS_METERS,
    roundingDecimals: ROUNDING_DECIMALS,
    accuracyClaim: "no-survey-accuracy-claim",
    plannerMaterialization: "distance-only",
  },
];

function assertSanitizedInteriorTreetopsSegmentDistanceAuthorityIntegrity(
  authorities: readonly InteriorTreetopsSegmentDistanceAuthority[],
): void {
  const collectionLabel = "Planner 46 sanitized distance authority collection";
  const authorityLabel = "Planner 46 sanitized distance authority";
  const nodeLabel = "Planner 46 sanitized source-node sequence";

  assertExactOrdinaryArray(authorities, 1, collectionLabel);
  const candidate = authorities[0] as unknown;
  assertExactPlainRecord(candidate, AUTHORITY_FIELDS, authorityLabel);
  assertNoRouteMaterialization(candidate);
  const snapshot = captureSnapshot(candidate, AUTHORITY_FIELDS, authorityLabel);
  assertPrimitiveSnapshot(snapshot, STRING_FIELDS, NUMBER_FIELDS, authorityLabel);

  const sourceNodeIdsValue = snapshotField(snapshot, "sourceNodeIds");
  assertExactOrdinaryArray(sourceNodeIdsValue, SEGMENT_NODE_IDS.length, nodeLabel);
  const sourceNodeIds = sourceNodeIdsValue as unknown[];
  const nodeSnapshot = captureArraySnapshot(sourceNodeIds, SEGMENT_NODE_IDS.length, nodeLabel);
  assertStringArraySnapshot(nodeSnapshot, nodeLabel);

  const expected: Readonly<Record<string, unknown>> = {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    topologyAuthorityId: TOPOLOGY_AUTHORITY_ID,
    geometryAuthorityId: GEOMETRY_AUTHORITY_ID,
    modeAuthorityId: MODE_AUTHORITY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceWayVersionUrl: SOURCE_WAY_VERSION_URL,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    sourceFromTreetopsIndex: FROM_TREETOPS_INDEX,
    sourceToTreetopsIndex: TO_TREETOPS_INDEX,
    distanceMeters: EXPECTED_DISTANCE_METERS,
    derivationMethod: "haversine-polyline-segment-sum",
    earthRadiusMeters: EARTH_RADIUS_METERS,
    roundingDecimals: ROUNDING_DECIMALS,
    accuracyClaim: "no-survey-accuracy-claim",
    plannerMaterialization: "distance-only",
  };
  for (const [field, value] of Object.entries(expected)) {
    assertSnapshotValue(snapshot, field, value, authorityLabel);
  }

  for (let index = 0; index < SEGMENT_NODE_IDS.length; index += 1) {
    if (nodeSnapshot[index].value !== SEGMENT_NODE_IDS[index]) {
      throw new Error(`Planner 46 sanitized source-node sequence drifted at index ${index}.`);
    }
  }

  if (
    geometry.id !== GEOMETRY_AUTHORITY_ID ||
    geometry.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    geometry.sourceWayId !== SOURCE_WAY_ID ||
    geometry.sourceWayVersion !== SOURCE_WAY_VERSION ||
    geometry.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    geometry.sourceWayVersionUrl !== SOURCE_WAY_VERSION_URL
  ) {
    throw new Error("Planner 46 sanitized distance authority detached from Planner 43 geometry.");
  }

  if (
    topology.id !== TOPOLOGY_AUTHORITY_ID ||
    topology.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    topology.segmentProvenance.sourceWayId !== SOURCE_WAY_ID ||
    topology.segmentProvenance.sourceWayVersion !== SOURCE_WAY_VERSION ||
    topology.segmentProvenance.fromNodeId !== FROM_NODE_ID ||
    topology.segmentProvenance.toNodeId !== TO_NODE_ID ||
    topology.segmentProvenance.fromTreetopsIndex !== FROM_TREETOPS_INDEX ||
    topology.segmentProvenance.toTreetopsIndex !== TO_TREETOPS_INDEX ||
    topology.segmentProvenance.provenanceStatus !== "captured"
  ) {
    throw new Error("Planner 46 sanitized distance authority detached from Planner 44 segment provenance.");
  }

  if (
    mode.id !== MODE_AUTHORITY_ID ||
    mode.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    mode.sourceWayId !== SOURCE_WAY_ID ||
    mode.sourceWayVersion !== SOURCE_WAY_VERSION ||
    mode.sourceFromNodeId !== FROM_NODE_ID ||
    mode.sourceToNodeId !== TO_NODE_ID ||
    mode.mode !== "walk"
  ) {
    throw new Error("Planner 46 sanitized distance authority detached from Planner 45 walk-mode authority.");
  }

  const exactNodes = SEGMENT_NODE_IDS.map((sourceObjectId, index) => {
    if (geometry.orderedNodeIds[index] !== sourceObjectId) {
      throw new Error(`Planner 46 geometry order drifted at segment index ${index}.`);
    }
    const node = geometry.nodes.find((candidateNode) => candidateNode.sourceObjectId === sourceObjectId);
    if (!node) throw new Error(`Planner 46 geometry lost source node ${sourceObjectId}.`);
    return node;
  });
  const derived = deriveInteriorTreetopsSegmentDistanceMeters(exactNodes);
  if (derived !== EXPECTED_DISTANCE_METERS || snapshotField(snapshot, "distanceMeters") !== derived) {
    throw new Error("Planner 46 distance drifted from the frozen six-leg geodesic derivation.");
  }
}

export function sanitizeInteriorTreetopsSegmentDistanceAuthorities(
  authorities: readonly InteriorTreetopsSegmentDistanceAuthority[],
): readonly InteriorTreetopsSegmentDistanceAuthority[] {
  const collectionLabel = "Planner 46 distance authority input collection";
  const authorityLabel = "Planner 46 distance authority input";
  const nodeLabel = "Planner 46 source-node input sequence";

  // Descriptor-only screening rejects accessors before structuredClone can
  // invoke them. The input object itself is never trusted after this point.
  assertExactOrdinaryArray(authorities, 1, collectionLabel);
  const collectionSnapshot = captureArraySnapshot(authorities as unknown[], 1, collectionLabel);
  const candidate = collectionSnapshot[0].value;
  assertExactPlainRecord(candidate, AUTHORITY_FIELDS, authorityLabel);
  const snapshot = captureSnapshot(candidate, AUTHORITY_FIELDS, authorityLabel);
  assertPrimitiveSnapshot(snapshot, STRING_FIELDS, NUMBER_FIELDS, authorityLabel);
  assertNoRouteMaterialization(candidate);

  const sourceNodeIdsValue = snapshotField(snapshot, "sourceNodeIds");
  assertExactOrdinaryArray(sourceNodeIdsValue, SEGMENT_NODE_IDS.length, nodeLabel);
  const sourceNodeIds = sourceNodeIdsValue as unknown[];
  const nodeSnapshot = captureArraySnapshot(sourceNodeIds, SEGMENT_NODE_IDS.length, nodeLabel);
  assertStringArraySnapshot(nodeSnapshot, nodeLabel);

  // A trap-capable nested value can mutate its parent, so fully screen and
  // revalidate the nested sequence before rechecking the parent.
  assertSnapshotUnchanged(sourceNodeIds, nodeSnapshot, nodeLabel);
  try {
    CAPTURED_STRUCTURED_CLONE(sourceNodeIds);
  } catch {
    throw new Error(`${nodeLabel} cannot be Proxy-backed.`);
  }

  assertExactPlainRecord(candidate, AUTHORITY_FIELDS, authorityLabel);
  assertSnapshotUnchanged(candidate, snapshot, authorityLabel);
  assertExactOrdinaryArray(sourceNodeIds, SEGMENT_NODE_IDS.length, nodeLabel);
  assertSnapshotUnchanged(sourceNodeIds, nodeSnapshot, nodeLabel);

  // The collection is the final trap-capable layer. Revalidate the entire
  // supplied graph immediately before sanitizing it.
  assertExactOrdinaryArray(authorities, 1, collectionLabel);
  assertSnapshotUnchanged(authorities as unknown as object, collectionSnapshot, collectionLabel);
  assertExactPlainRecord(candidate, AUTHORITY_FIELDS, authorityLabel);
  assertSnapshotUnchanged(candidate, snapshot, authorityLabel);
  assertExactOrdinaryArray(sourceNodeIds, SEGMENT_NODE_IDS.length, nodeLabel);
  assertSnapshotUnchanged(sourceNodeIds, nodeSnapshot, nodeLabel);

  let sanitized: unknown;
  try {
    sanitized = CAPTURED_STRUCTURED_CLONE(authorities);
  } catch {
    throw new Error(`${collectionLabel} cannot be Proxy-backed.`);
  }

  // From here onward only the sanitized clone is validated and returned. This
  // deliberately handles intrinsic-branded objects that structuredClone
  // normalizes to ordinary data: callers never receive/trust the original.
  assertSanitizedInteriorTreetopsSegmentDistanceAuthorityIntegrity(
    sanitized as readonly InteriorTreetopsSegmentDistanceAuthority[],
  );
  return deepFreeze(
    sanitized as readonly InteriorTreetopsSegmentDistanceAuthority[],
  );
}

export const INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY:
  readonly InteriorTreetopsSegmentDistanceAuthority[] =
    sanitizeInteriorTreetopsSegmentDistanceAuthorities(RAW_AUTHORITY);

export function interiorTreetopsSegmentDistanceForObjective(
  objectiveSourceRecordId: string,
): InteriorTreetopsSegmentDistanceAuthority | undefined {
  return INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorTreetopsSegmentDistance(
  objectiveSourceRecordId: string,
): InteriorTreetopsSegmentDistanceAssessment {
  const distance = interiorTreetopsSegmentDistanceForObjective(objectiveSourceRecordId);
  if (!distance) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_SEGMENT_DISTANCE_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "distance-ready",
    authorityId: distance.id,
    objectiveSourceRecordId: distance.objectiveSourceRecordId,
    sourceWayId: distance.sourceWayId,
    sourceWayVersion: distance.sourceWayVersion,
    sourceFromNodeId: distance.sourceFromNodeId,
    sourceToNodeId: distance.sourceToNodeId,
    sourceNodeCount: 7,
    distanceMeters: distance.distanceMeters,
    derivationMethod: distance.derivationMethod,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
