import {
  INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY,
} from "./zooInteriorUnnamedFootwayBranchAccessAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-selected-footway-geometry-evidence-gate" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const SOURCE_WAY_ID = "1481578626" as const;
const SOURCE_WAY_VERSION = 1 as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const SOURCE_WAY_CHANGESET = 178875075 as const;
const FROM_NODE_ID = "1619736694" as const;
const TO_NODE_ID = "48920902" as const;
const BLOCK_REASON =
  "VERSION_PINNED_SELECTED_FOOTWAY_TO_NODE_COORDINATE_NOT_CAPTURED" as const;

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

const ORDERED_NODE_IDS = [FROM_NODE_ID, TO_NODE_ID] as const;

export type InteriorSelectedFootwayGeometryEvidenceGate = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578626";
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/1481578626/1";
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_WAY_CHANGESET;
  sourceHighway: "footway";
  sourceNameStatus: "absent";
  sourceAccessStatus: "no-explicit-access-restriction-captured";
  sourceFee: "yes";
  sourceLayer: "-1";
  orderedNodeIds: readonly [typeof FROM_NODE_ID, typeof TO_NODE_ID];
  traversalFromNodeId: typeof FROM_NODE_ID;
  traversalToNodeId: typeof TO_NODE_ID;
  fromNodeCoordinateStatus: "captured-upstream";
  toNodeCoordinateStatus: "not-captured";
  farEndpointTopologyStatus: "not-captured";
  plannerMaterialization: "geometry-evidence-gate-only";
};

export type InteriorSelectedFootwayGeometryEvidenceAssessment = {
  status: "blocked";
  reason: typeof BLOCK_REASON;
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  traversalFromNodeId: typeof FROM_NODE_ID;
  traversalToNodeId: typeof TO_NODE_ID;
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "EXACT_SELECTED_FOOTWAY_TO_NODE_COORDINATE_NOT_SOURCED",
      "SELECTED_FOOTWAY_FAR_ENDPOINT_TOPOLOGY_NOT_SOURCED",
      "EXACT_SELECTED_FOOTWAY_PROVENANCE_NOT_COMPLETE",
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
  "sourceAccessStatus",
  "sourceFee",
  "sourceLayer",
  "orderedNodeIds",
  "traversalFromNodeId",
  "traversalToNodeId",
  "fromNodeCoordinateStatus",
  "toNodeCoordinateStatus",
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
  "routeEdgeId",
  "lat",
  "lng",
  "coordinates",
  "selectedContinuationWayId",
] as const;

const BLOCK_REASONS = [
  "EXACT_SELECTED_FOOTWAY_TO_NODE_COORDINATE_NOT_SOURCED",
  "SELECTED_FOOTWAY_FAR_ENDPOINT_TOPOLOGY_NOT_SOURCED",
  "EXACT_SELECTED_FOOTWAY_PROVENANCE_NOT_COMPLETE",
] as const;

function nullRecord<T extends object>(value: T): T {
  const result = CREATE_OBJECT(null) as T;
  const keys = OWN_KEYS(value);
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    const descriptor = GET_DESCRIPTOR(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new Error("Planner 70 canonical records require own data fields.");
    }
    DEFINE_PROPERTY(result, key, descriptor);
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
      throw new Error(label + " requires enumerable own data field " + field + ".");
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
    throw new Error(label + " must be an ordinary array of length " + length + ".");
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
      throw new Error(label + " requires enumerable own data element " + index + ".");
    }
  }
}

function assertNoDownstreamMaterialization(
  value: Record<string, unknown>,
  label: string,
): void {
  for (let index = 0; index < FORBIDDEN_DOWNSTREAM_FIELDS.length; index += 1) {
    const field = FORBIDDEN_DOWNSTREAM_FIELDS[index];
    if (field in value) {
      throw new Error(label + " cannot materialize downstream field " + field + ".");
    }
  }
}

const RAW_AUTHORITY: InteriorSelectedFootwayGeometryEvidenceGate[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578626",
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/1481578626/1",
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceWayChangeset: SOURCE_WAY_CHANGESET,
    sourceHighway: "footway",
    sourceNameStatus: "absent",
    sourceAccessStatus: "no-explicit-access-restriction-captured",
    sourceFee: "yes",
    sourceLayer: "-1",
    orderedNodeIds: [...ORDERED_NODE_IDS],
    traversalFromNodeId: FROM_NODE_ID,
    traversalToNodeId: TO_NODE_ID,
    fromNodeCoordinateStatus: "captured-upstream",
    toNodeCoordinateStatus: "not-captured",
    farEndpointTopologyStatus: "not-captured",
    plannerMaterialization: "geometry-evidence-gate-only",
  }),
];

export function assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity(
  authorities: readonly InteriorSelectedFootwayGeometryEvidenceGate[],
): void {
  const collectionLabel = "Planner 70 geometry evidence-gate collection";
  const authorityLabel = "Planner 70 geometry evidence gate";

  assertArray(authorities, 1, collectionLabel);
  const descriptor = GET_DESCRIPTOR(authorities, "0");
  if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
    throw new Error(collectionLabel + " requires enumerable own data element 0.");
  }
  const candidate = descriptor.value;
  try {
    STRUCTURED_CLONE(authorities);
    STRUCTURED_CLONE(candidate);
  } catch {
    throw new Error(collectionLabel + " cannot be Proxy-backed or otherwise uncloneable.");
  }

  const currentDescriptor = GET_DESCRIPTOR(authorities, "0");
  if (
    !currentDescriptor ||
    !("value" in currentDescriptor) ||
    currentDescriptor.value !== candidate
  ) {
    throw new Error(collectionLabel + " cannot mutate element 0 during validation.");
  }

  assertPlain(candidate, TOP_LEVEL_FIELDS, authorityLabel);
  assertNoDownstreamMaterialization(candidate, authorityLabel);

  const authority =
    candidate as unknown as InteriorSelectedFootwayGeometryEvidenceGate;
  const selected = INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY[0];

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.sourceWayId !== SOURCE_WAY_ID ||
    authority.sourceWayUrl !== "https://www.openstreetmap.org/way/1481578626" ||
    authority.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/1481578626/1" ||
    authority.sourceWayVersion !== SOURCE_WAY_VERSION ||
    authority.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    authority.sourceWayChangeset !== SOURCE_WAY_CHANGESET ||
    authority.sourceHighway !== "footway" ||
    authority.sourceNameStatus !== "absent" ||
    authority.sourceAccessStatus !==
      "no-explicit-access-restriction-captured" ||
    authority.sourceFee !== "yes" ||
    authority.sourceLayer !== "-1" ||
    authority.traversalFromNodeId !== FROM_NODE_ID ||
    authority.traversalToNodeId !== TO_NODE_ID ||
    authority.fromNodeCoordinateStatus !== "captured-upstream" ||
    authority.toNodeCoordinateStatus !== "not-captured" ||
    authority.farEndpointTopologyStatus !== "not-captured" ||
    authority.plannerMaterialization !== "geometry-evidence-gate-only"
  ) {
    throw new Error("Planner 70 geometry evidence gate drifted.");
  }

  assertArray(
    authority.orderedNodeIds,
    2,
    "Planner 70 ordered node sequence",
  );
  if (
    authority.orderedNodeIds[0] !== FROM_NODE_ID ||
    authority.orderedNodeIds[1] !== TO_NODE_ID
  ) {
    throw new Error("Planner 70 ordered node sequence drifted.");
  }

  if (
    selected.objectiveSourceRecordId !== authority.objectiveSourceRecordId ||
    selected.selectedContinuationWayId !== authority.sourceWayId ||
    selected.selectedContinuationToNodeId !== authority.traversalToNodeId ||
    selected.junctionNodeId !== authority.traversalFromNodeId ||
    selected.selectedContinuationHighway !== authority.sourceHighway ||
    selected.selectedContinuationNameStatus !== authority.sourceNameStatus ||
    selected.selectedContinuationAccessStatus !== authority.sourceAccessStatus ||
    selected.selectedContinuationFee !== authority.sourceFee ||
    selected.selectedContinuationLayer !== authority.sourceLayer
  ) {
    throw new Error("Planner 70 detached from Planner 69 selected branch.");
  }
}

assertInteriorSelectedFootwayGeometryEvidenceGateIntegrity(RAW_AUTHORITY);

export const INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE:
  readonly InteriorSelectedFootwayGeometryEvidenceGate[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorSelectedFootwayGeometryEvidence():
  InteriorSelectedFootwayGeometryEvidenceAssessment {
  return deepFreeze(
    nullRecord<InteriorSelectedFootwayGeometryEvidenceAssessment>({
      status: "blocked",
      reason: BLOCK_REASON,
      authorityId: AUTHORITY_ID,
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      sourceWayId: SOURCE_WAY_ID,
      sourceWayVersion: SOURCE_WAY_VERSION,
      traversalFromNodeId: FROM_NODE_ID,
      traversalToNodeId: TO_NODE_ID,
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
