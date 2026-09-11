import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "./zooInteriorFrontStreetGeometryAuthority.ts";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
} from "./zooInteriorObjectiveBranchSelectionAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-distance" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const BRANCH_SELECTION_AUTHORITY_ID =
  "sdz-interior-front-street-objective-branch-selection" as const;
const GEOMETRY_AUTHORITY_ID =
  "sdz-interior-front-street-adjacent-geometry" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const EARTH_RADIUS_METERS = 6_371_000 as const;
const ROUNDING_DECIMALS = 3 as const;

export type InteriorObjectiveSegmentDistanceAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  branchSelectionAuthorityId: typeof BRANCH_SELECTION_AUTHORITY_ID;
  geometryAuthorityId: typeof GEOMETRY_AUTHORITY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: 1;
  sourceWayVersionUrl: string;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceFromNodeVersion: 1;
  sourceFromNodeVersionUrl: string;
  sourceFromNodeTimestamp: "2019-12-13T00:23:10Z";
  sourceFromNodeChangeset: 78341336;
  sourceToNodeId: typeof TO_NODE_ID;
  sourceToNodeVersion: 2;
  sourceToNodeVersionUrl: string;
  sourceToNodeTimestamp: "2013-12-23T19:47:46Z";
  sourceToNodeChangeset: 19606502;
  sourceNodeIds: readonly [typeof FROM_NODE_ID, typeof TO_NODE_ID];
  distanceMeters: number;
  derivationMethod: "haversine-segment-sum";
  earthRadiusMeters: typeof EARTH_RADIUS_METERS;
  roundingDecimals: typeof ROUNDING_DECIMALS;
  accuracyClaim: "no-survey-accuracy-claim";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "distance-only";
};

export type InteriorObjectiveSegmentDistanceAssessment =
  | {
      status: "distance-ready";
      objectiveSourceRecordId: string;
      sourceFromNodeId: string;
      sourceToNodeId: string;
      distanceMeters: number;
      derivationMethod: "haversine-segment-sum";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_MODE_NOT_SOURCED",
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
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_SEGMENT_DISTANCE_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const TOP_LEVEL_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "branchSelectionAuthorityId",
  "geometryAuthorityId",
  "sourceWayId",
  "sourceWayVersion",
  "sourceWayVersionUrl",
  "sourceFromNodeId",
  "sourceFromNodeVersion",
  "sourceFromNodeVersionUrl",
  "sourceFromNodeTimestamp",
  "sourceFromNodeChangeset",
  "sourceToNodeId",
  "sourceToNodeVersion",
  "sourceToNodeVersionUrl",
  "sourceToNodeTimestamp",
  "sourceToNodeChangeset",
  "sourceNodeIds",
  "distanceMeters",
  "derivationMethod",
  "earthRadiusMeters",
  "roundingDecimals",
  "accuracyClaim",
  "selectionScope",
  "globalEndpointSelection",
  "plannerMaterialization",
] as const;

const FORBIDDEN_ROUTE_FIELDS = [
  "fromNodeId",
  "toNodeId",
  "mode",
  "durationMinutes",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "oneWay",
  "status",
  "routeNodeId",
  "provenance",
  "globalEndpointNodeId",
] as const;

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_MODE_NOT_SOURCED",
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
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) {
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

function assertNoRouteMaterialization(value: Record<string, unknown>, label: string) {
  for (const field of FORBIDDEN_ROUTE_FIELDS) {
    if (field in value) {
      throw new Error(`${label} cannot materialize routing field ${field}.`);
    }
  }
}

function roundDistance(value: number) {
  const scale = 10 ** ROUNDING_DECIMALS;
  return Math.round(value * scale) / scale;
}

export function deriveInteriorObjectiveSegmentDistanceMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  for (const point of [from, to]) {
    if (
      !Number.isFinite(point.lat) ||
      !Number.isFinite(point.lng) ||
      point.lat < -90 ||
      point.lat > 90 ||
      point.lng < -180 ||
      point.lng > 180
    ) {
      throw new Error("Planner 28 distance derivation requires valid finite coordinates.");
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

  return roundDistance(
    2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h))),
  );
}

const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
const selectedCandidate = geometry.adjacentJunctionCandidates.find(
  (candidate) => candidate.node.sourceObjectId === TO_NODE_ID,
);
if (!selectedCandidate) {
  throw new Error("Planner 28 requires the Planner 26 Treetops geometry candidate.");
}

const RAW_AUTHORITY: InteriorObjectiveSegmentDistanceAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    branchSelectionAuthorityId: BRANCH_SELECTION_AUTHORITY_ID,
    geometryAuthorityId: GEOMETRY_AUTHORITY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: geometry.sourceWayVersion,
    sourceWayVersionUrl: geometry.sourceWayVersionUrl,
    sourceFromNodeId: FROM_NODE_ID,
    sourceFromNodeVersion: geometry.connectionNode.sourceVersion,
    sourceFromNodeVersionUrl: geometry.connectionNode.sourceVersionUrl,
    sourceFromNodeTimestamp: geometry.connectionNode.sourceTimestamp,
    sourceFromNodeChangeset: geometry.connectionNode.sourceChangeset,
    sourceToNodeId: TO_NODE_ID,
    sourceToNodeVersion: selectedCandidate.node.sourceVersion,
    sourceToNodeVersionUrl: selectedCandidate.node.sourceVersionUrl,
    sourceToNodeTimestamp: selectedCandidate.node.sourceTimestamp,
    sourceToNodeChangeset: selectedCandidate.node.sourceChangeset,
    sourceNodeIds: [FROM_NODE_ID, TO_NODE_ID],
    distanceMeters: deriveInteriorObjectiveSegmentDistanceMeters(
      geometry.connectionNode,
      selectedCandidate.node,
    ),
    derivationMethod: "haversine-segment-sum",
    earthRadiusMeters: EARTH_RADIUS_METERS,
    roundingDecimals: ROUNDING_DECIMALS,
    accuracyClaim: "no-survey-accuracy-claim",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "distance-only",
  },
];

export function assertInteriorObjectiveSegmentDistanceAuthorityIntegrity(
  authorities: readonly InteriorObjectiveSegmentDistanceAuthority[],
) {
  assertExactOrdinaryArray(
    authorities,
    1,
    "Planner 28 objective segment distance authority collection",
  );

  const candidate: unknown = authorities[0];
  assertExactPlainObject(
    candidate,
    TOP_LEVEL_FIELDS,
    "Planner 28 objective segment distance authority",
  );
  assertNoRouteMaterialization(
    candidate,
    "Planner 28 objective segment distance authority",
  );

  const record = candidate as unknown as InteriorObjectiveSegmentDistanceAuthority;
  assertExactOrdinaryArray(
    record.sourceNodeIds,
    2,
    "Planner 28 source-node sequence",
  );

  const branchSelection = INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY.find(
    (entry) => entry.id === record.branchSelectionAuthorityId,
  );
  const currentGeometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY.find(
    (entry) => entry.id === record.geometryAuthorityId,
  );
  const currentTarget = currentGeometry?.adjacentJunctionCandidates.find(
    (entry) => entry.node.sourceObjectId === record.sourceToNodeId,
  );

  if (
    record.id !== AUTHORITY_ID ||
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.branchSelectionAuthorityId !== BRANCH_SELECTION_AUTHORITY_ID ||
    record.geometryAuthorityId !== GEOMETRY_AUTHORITY_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.sourceNodeIds[0] !== FROM_NODE_ID ||
    record.sourceNodeIds[1] !== TO_NODE_ID ||
    record.derivationMethod !== "haversine-segment-sum" ||
    record.earthRadiusMeters !== EARTH_RADIUS_METERS ||
    record.roundingDecimals !== ROUNDING_DECIMALS ||
    record.accuracyClaim !== "no-survey-accuracy-claim" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !== "distance-only"
  ) {
    throw new Error("Planner 28 distance authority drifted from the frozen objective-segment contract.");
  }

  if (
    !branchSelection ||
    branchSelection.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    branchSelection.selectedCandidateNodeId !== record.sourceToNodeId ||
    branchSelection.geometryConnectionNodeId !== record.sourceFromNodeId ||
    branchSelection.selectionScope !== "objective-only" ||
    branchSelection.globalEndpointSelection !== "unresolved"
  ) {
    throw new Error("Planner 28 distance authority detached from Planner 27 objective branch selection.");
  }

  if (
    !currentGeometry ||
    !currentTarget ||
    currentGeometry.endpointSelection !== "unresolved" ||
    currentGeometry.sourceWayId !== record.sourceWayId ||
    currentGeometry.sourceWayVersion !== record.sourceWayVersion ||
    currentGeometry.sourceWayVersionUrl !== record.sourceWayVersionUrl ||
    currentGeometry.connectionNode.sourceObjectId !== record.sourceFromNodeId ||
    currentGeometry.connectionNode.sourceVersion !== record.sourceFromNodeVersion ||
    currentGeometry.connectionNode.sourceVersionUrl !== record.sourceFromNodeVersionUrl ||
    currentGeometry.connectionNode.sourceTimestamp !== record.sourceFromNodeTimestamp ||
    currentGeometry.connectionNode.sourceChangeset !== record.sourceFromNodeChangeset ||
    currentTarget.node.sourceVersion !== record.sourceToNodeVersion ||
    currentTarget.node.sourceVersionUrl !== record.sourceToNodeVersionUrl ||
    currentTarget.node.sourceTimestamp !== record.sourceToNodeTimestamp ||
    currentTarget.node.sourceChangeset !== record.sourceToNodeChangeset
  ) {
    throw new Error("Planner 28 distance provenance drifted from version-pinned Planner 26 geometry.");
  }

  const expectedDistance = deriveInteriorObjectiveSegmentDistanceMeters(
    currentGeometry.connectionNode,
    currentTarget.node,
  );
  if (
    !Number.isFinite(record.distanceMeters) ||
    record.distanceMeters <= 0 ||
    record.distanceMeters !== expectedDistance ||
    record.distanceMeters !== 7.157
  ) {
    throw new Error("Planner 28 objective segment distance drifted from the frozen geodesic derivation.");
  }
}

assertInteriorObjectiveSegmentDistanceAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY:
  readonly InteriorObjectiveSegmentDistanceAuthority[] = deepFreeze(RAW_AUTHORITY);

export function objectiveSegmentDistanceFor(objectiveSourceRecordId: string) {
  return INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorObjectiveSegmentDistance(
  objectiveSourceRecordId: string,
): InteriorObjectiveSegmentDistanceAssessment {
  const selection = objectiveSegmentDistanceFor(objectiveSourceRecordId);
  if (!selection) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_SEGMENT_DISTANCE_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: geometry.endpointSelection,
    });
  }

  return deepFreeze({
    status: "distance-ready",
    objectiveSourceRecordId: selection.objectiveSourceRecordId,
    sourceFromNodeId: selection.sourceFromNodeId,
    sourceToNodeId: selection.sourceToNodeId,
    distanceMeters: selection.distanceMeters,
    derivationMethod: selection.derivationMethod,
    selectionScope: selection.selectionScope,
    globalEndpointSelection: geometry.endpointSelection,
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
