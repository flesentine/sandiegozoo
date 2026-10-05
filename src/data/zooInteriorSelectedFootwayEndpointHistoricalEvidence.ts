import {
  INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE,
} from "./zooInteriorSelectedFootwayGeometryEvidenceGate.ts";

const AUTHORITY_ID =
  "sdz-interior-selected-footway-endpoint-historical-evidence" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const SOURCE_WAY_ID = "1481578626" as const;
const ENDPOINT_NODE_ID = "48920902" as const;
const HISTORY_URL =
  "https://api.openstreetmap.org/api/0.6/node/48920902/history" as const;
const SOURCE_URL =
  "https://www.openstreetmap.org/node/48920902" as const;
const BLOCK_REASON =
  "VERSION_PINNED_SELECTED_FOOTWAY_ENDPOINT_NODE_NOT_CAPTURED" as const;

const STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);
const OWN_KEYS = Reflect.ownKeys.bind(Reflect);
const GET_DESCRIPTOR = Object.getOwnPropertyDescriptor.bind(Object);
const GET_PROTOTYPE_OF = Object.getPrototypeOf.bind(Object);
const DEFINE_PROPERTY = Object.defineProperty.bind(Object);
const CREATE_OBJECT = Object.create.bind(Object);
const HAS_OWN = Object.hasOwn.bind(Object);
const IS_ARRAY = Array.isArray.bind(Array);
const FREEZE = Object.freeze.bind(Object);
const IS_FROZEN = Object.isFrozen.bind(Object);

export type InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  targetTimestamp: typeof TARGET_TIMESTAMP;
  sourceWayId: typeof SOURCE_WAY_ID;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  endpointSourceUrl: typeof SOURCE_URL;
  endpointHistoryUrl: typeof HISTORY_URL;
  endpointVersionStatus: "not-captured";
  endpointCoordinateStatus: "not-captured";
  endpointChangesetStatus: "not-captured";
  requiredCaptureFields: readonly [
    "sourceVersion",
    "sourceTimestamp",
    "sourceChangeset",
    "sourceVersionUrl",
    "lat",
    "lng",
  ];
  farEndpointTopologyStatus: "not-captured";
  plannerMaterialization: "endpoint-historical-evidence-only";
};

export type InteriorSelectedFootwayEndpointHistoricalEvidenceAssessment = {
  status: "blocked";
  reason: typeof BLOCK_REASON;
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "EXACT_ENDPOINT_NODE_VERSION_NOT_SOURCED",
      "EXACT_ENDPOINT_NODE_COORDINATE_NOT_SOURCED",
      "ENDPOINT_HISTORICAL_CONNECTED_WAYS_NOT_SOURCED",
    ];
  };
};

const TOP_LEVEL_FIELDS = [
  "id",
  "provider",
  "objectiveSourceRecordId",
  "targetTimestamp",
  "sourceWayId",
  "endpointNodeId",
  "endpointSourceUrl",
  "endpointHistoryUrl",
  "endpointVersionStatus",
  "endpointCoordinateStatus",
  "endpointChangesetStatus",
  "requiredCaptureFields",
  "farEndpointTopologyStatus",
  "plannerMaterialization",
] as const;

const REQUIRED_CAPTURE_FIELDS = [
  "sourceVersion",
  "sourceTimestamp",
  "sourceChangeset",
  "sourceVersionUrl",
  "lat",
  "lng",
] as const;

const FORBIDDEN_PROMOTED_FIELDS = [
  "sourceVersion",
  "sourceTimestamp",
  "sourceChangeset",
  "sourceVersionUrl",
  "lat",
  "lng",
  "connectedWays",
  "selectedContinuationWayId",
  "routeNodeId",
  "routeEdgeId",
  "distanceMeters",
  "durationMinutes",
  "accessible",
  "stroller",
  "oneWay",
] as const;

const BLOCK_REASONS = [
  "EXACT_ENDPOINT_NODE_VERSION_NOT_SOURCED",
  "EXACT_ENDPOINT_NODE_COORDINATE_NOT_SOURCED",
  "ENDPOINT_HISTORICAL_CONNECTED_WAYS_NOT_SOURCED",
] as const;

function nullRecord<T extends object>(value: T): T {
  const result = CREATE_OBJECT(null) as T;
  const keys = OWN_KEYS(value);
  for (let index = 0; index < keys.length; index += 1) {
    const descriptor = GET_DESCRIPTOR(value, keys[index]);
    if (!descriptor || !("value" in descriptor)) {
      throw new Error("Planner 71 canonical records require own data fields.");
    }
    DEFINE_PROPERTY(result, keys[index], descriptor);
  }
  return result;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !IS_FROZEN(value)) {
    const keys = OWN_KEYS(value);
    for (let index = 0; index < keys.length; index += 1) {
      const descriptor = GET_DESCRIPTOR(value, keys[index]);
      if (descriptor && "value" in descriptor) deepFreeze(descriptor.value);
    }
    FREEZE(value);
  }
  return value;
}

function assertArray(
  value: unknown,
  expectedLength: number,
  label: string,
): asserts value is unknown[] {
  if (
    !IS_ARRAY(value) ||
    GET_PROTOTYPE_OF(value) !== Array.prototype ||
    value.length !== expectedLength
  ) {
    throw new Error(label + " must be an ordinary array of length " + expectedLength + ".");
  }

  const keys = OWN_KEYS(value);
  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const key = keys[keyIndex];
    if (typeof key !== "string") {
      throw new Error(label + " cannot contain extra own properties.");
    }
    if (key === "length") continue;

    let allowed = false;
    for (let index = 0; index < expectedLength; index += 1) {
      if (key === String(index)) {
        allowed = true;
        break;
      }
    }
    if (!allowed) {
      throw new Error(label + " cannot contain extra own properties.");
    }
  }

  for (let index = 0; index < expectedLength; index += 1) {
    const descriptor = GET_DESCRIPTOR(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(label + " requires enumerable own data element " + index + ".");
    }
  }
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

function assertNoPrematurePromotion(
  value: Record<string, unknown>,
  label: string,
): void {
  for (let index = 0; index < FORBIDDEN_PROMOTED_FIELDS.length; index += 1) {
    const field = FORBIDDEN_PROMOTED_FIELDS[index];
    if (field in value) {
      throw new Error(label + " cannot prematurely materialize field " + field + ".");
    }
  }
}

const RAW_AUTHORITY:
  InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    sourceWayId: SOURCE_WAY_ID,
    endpointNodeId: ENDPOINT_NODE_ID,
    endpointSourceUrl: SOURCE_URL,
    endpointHistoryUrl: HISTORY_URL,
    endpointVersionStatus: "not-captured",
    endpointCoordinateStatus: "not-captured",
    endpointChangesetStatus: "not-captured",
    requiredCaptureFields: [...REQUIRED_CAPTURE_FIELDS],
    farEndpointTopologyStatus: "not-captured",
    plannerMaterialization: "endpoint-historical-evidence-only",
  }),
];

export function assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity(
  authorities:
    readonly InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority[],
): void {
  const collectionLabel = "Planner 71 authority collection";
  const authorityLabel = "Planner 71 authority";
  const fieldsLabel = "Planner 71 required capture fields";

  assertArray(authorities, 1, collectionLabel);

  const authorityDescriptor = GET_DESCRIPTOR(authorities, "0");
  if (
    !authorityDescriptor ||
    !authorityDescriptor.enumerable ||
    !("value" in authorityDescriptor)
  ) {
    throw new Error(collectionLabel + " requires enumerable own data element 0.");
  }
  const candidate = authorityDescriptor.value;

  assertPlain(candidate, TOP_LEVEL_FIELDS, authorityLabel);

  const fieldsDescriptor = GET_DESCRIPTOR(candidate, "requiredCaptureFields");
  if (!fieldsDescriptor || !fieldsDescriptor.enumerable || !("value" in fieldsDescriptor)) {
    throw new Error(authorityLabel + " requires requiredCaptureFields as an own data field.");
  }
  const requiredFieldsCandidate = fieldsDescriptor.value;
  assertArray(requiredFieldsCandidate, 6, fieldsLabel);

  try {
    STRUCTURED_CLONE(authorities);
    STRUCTURED_CLONE(candidate);
    STRUCTURED_CLONE(requiredFieldsCandidate);
  } catch {
    throw new Error(collectionLabel + " cannot be Proxy-backed or otherwise uncloneable.");
  }

  assertArray(authorities, 1, collectionLabel);
  const currentAuthorityDescriptor = GET_DESCRIPTOR(authorities, "0");
  const currentFieldsDescriptor = GET_DESCRIPTOR(candidate, "requiredCaptureFields");

  if (
    !currentAuthorityDescriptor ||
    !("value" in currentAuthorityDescriptor) ||
    currentAuthorityDescriptor.value !== candidate ||
    !currentFieldsDescriptor ||
    !("value" in currentFieldsDescriptor) ||
    currentFieldsDescriptor.value !== requiredFieldsCandidate
  ) {
    throw new Error("Planner 71 authority graph cannot mutate during validation.");
  }

  assertPlain(candidate, TOP_LEVEL_FIELDS, authorityLabel);
  assertArray(requiredFieldsCandidate, 6, fieldsLabel);
  assertNoPrematurePromotion(candidate, authorityLabel);

  const authority =
    candidate as unknown as InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority;
  const prior = INTERIOR_SELECTED_FOOTWAY_GEOMETRY_EVIDENCE_GATE[0];

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.targetTimestamp !== TARGET_TIMESTAMP ||
    authority.sourceWayId !== SOURCE_WAY_ID ||
    authority.endpointNodeId !== ENDPOINT_NODE_ID ||
    authority.endpointSourceUrl !== SOURCE_URL ||
    authority.endpointHistoryUrl !== HISTORY_URL ||
    authority.endpointVersionStatus !== "not-captured" ||
    authority.endpointCoordinateStatus !== "not-captured" ||
    authority.endpointChangesetStatus !== "not-captured" ||
    authority.farEndpointTopologyStatus !== "not-captured" ||
    authority.plannerMaterialization !==
      "endpoint-historical-evidence-only"
  ) {
    throw new Error("Planner 71 endpoint evidence authority drifted.");
  }

  for (let index = 0; index < REQUIRED_CAPTURE_FIELDS.length; index += 1) {
    if (authority.requiredCaptureFields[index] !== REQUIRED_CAPTURE_FIELDS[index]) {
      throw new Error("Planner 71 required capture fields drifted.");
    }
  }

  if (
    prior.objectiveSourceRecordId !== authority.objectiveSourceRecordId ||
    prior.sourceWayId !== authority.sourceWayId ||
    prior.traversalToNodeId !== authority.endpointNodeId ||
    prior.sourceWayTimestamp !== authority.targetTimestamp ||
    prior.toNodeCoordinateStatus !== "not-captured" ||
    prior.farEndpointTopologyStatus !== "not-captured"
  ) {
    throw new Error("Planner 71 detached from Planner 70 evidence gate.");
  }
}

assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity(RAW_AUTHORITY);

export const INTERIOR_SELECTED_FOOTWAY_ENDPOINT_HISTORICAL_EVIDENCE:
  readonly InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorSelectedFootwayEndpointHistoricalEvidence():
  InteriorSelectedFootwayEndpointHistoricalEvidenceAssessment {
  return deepFreeze(
    nullRecord<InteriorSelectedFootwayEndpointHistoricalEvidenceAssessment>({
      status: "blocked",
      reason: BLOCK_REASON,
      authorityId: AUTHORITY_ID,
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      endpointNodeId: ENDPOINT_NODE_ID,
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
