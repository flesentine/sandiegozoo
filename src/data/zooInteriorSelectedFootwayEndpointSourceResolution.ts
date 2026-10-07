import {
  INTERIOR_SELECTED_FOOTWAY_ENDPOINT_HISTORICAL_EVIDENCE,
} from "./zooInteriorSelectedFootwayEndpointHistoricalEvidence.ts";

const AUTHORITY_ID =
  "sdz-interior-selected-footway-endpoint-source-resolution" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const ENDPOINT_NODE_ID = "48920902" as const;
const PRIMARY_HISTORY_URL =
  "https://api.openstreetmap.org/api/0.6/node/48920902/history" as const;
const OBJECT_HISTORY_URL =
  "https://www.openstreetmap.org/node/48920902/history" as const;
const DEEP_HISTORY_URL =
  "https://osmlab.github.io/osm-deep-history/#/node/48920902" as const;

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

export type EndpointHistoricalSourceCandidate = {
  priority: 1 | 2 | 3;
  role:
    | "authoritative-history-record"
    | "official-history-view"
    | "secondary-history-discovery";
  url: string;
  acceptance:
    | "authoritative-record-required"
    | "discovery-only-until-authoritative-record-confirmed";
};

export type InteriorSelectedFootwayEndpointSourceResolutionAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  targetTimestamp: typeof TARGET_TIMESTAMP;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  resolutionStatus: "unresolved";
  sourceCandidates: readonly [
    EndpointHistoricalSourceCandidate,
    EndpointHistoricalSourceCandidate,
    EndpointHistoricalSourceCandidate,
  ];
  acceptedEvidenceRule:
    "exact-node-version-at-or-before-target-timestamp-from-authoritative-osm-history";
  rejectedEvidenceRules: readonly [
    "current-node-coordinate-alone-is-insufficient",
    "viewer-rendered-coordinate-alone-is-insufficient",
    "search-index-snippet-alone-is-insufficient",
  ];
  requiredOutputFields: readonly [
    "sourceVersion",
    "sourceTimestamp",
    "sourceChangeset",
    "sourceVersionUrl",
    "lat",
    "lng",
  ];
  plannerMaterialization: "historical-source-resolution-only";
};

export type InteriorSelectedFootwayEndpointSourceResolutionAssessment = {
  status: "blocked";
  authorityId: typeof AUTHORITY_ID;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  reason: "AUTHORITATIVE_ENDPOINT_NODE_HISTORY_NOT_CAPTURED";
  nextAction:
    "capture-exact-versioned-node-record-then-promote-coordinate-and-topology";
};

const TOP_LEVEL_FIELDS = [
  "id",
  "provider",
  "objectiveSourceRecordId",
  "targetTimestamp",
  "endpointNodeId",
  "resolutionStatus",
  "sourceCandidates",
  "acceptedEvidenceRule",
  "rejectedEvidenceRules",
  "requiredOutputFields",
  "plannerMaterialization",
] as const;

const SOURCE_FIELDS = ["priority", "role", "url", "acceptance"] as const;
const REJECTED_EVIDENCE_RULES = [
  "current-node-coordinate-alone-is-insufficient",
  "viewer-rendered-coordinate-alone-is-insufficient",
  "search-index-snippet-alone-is-insufficient",
] as const;
const REQUIRED_OUTPUT_FIELDS = [
  "sourceVersion",
  "sourceTimestamp",
  "sourceChangeset",
  "sourceVersionUrl",
  "lat",
  "lng",
] as const;

function nullRecord<T extends object>(value: T): T {
  const result = CREATE_OBJECT(null) as T;
  const keys = OWN_KEYS(value);
  for (let index = 0; index < keys.length; index += 1) {
    const descriptor = GET_DESCRIPTOR(value, keys[index]);
    if (!descriptor || !("value" in descriptor)) {
      throw new Error("Planner 72 canonical records require own data fields.");
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

function assertArray(value: unknown, length: number, label: string): asserts value is unknown[] {
  if (
    !IS_ARRAY(value) ||
    GET_PROTOTYPE_OF(value) !== Array.prototype ||
    value.length !== length
  ) {
    throw new Error(label + " must be an ordinary array of length " + length + ".");
  }
  const keys = OWN_KEYS(value);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (typeof key !== "string") throw new Error(label + " cannot contain extra own properties.");
    if (key === "length") continue;
    let allowed = false;
    for (let j = 0; j < length; j += 1) {
      if (key === String(j)) {
        allowed = true;
        break;
      }
    }
    if (!allowed) throw new Error(label + " cannot contain extra own properties.");
  }
  for (let i = 0; i < length; i += 1) {
    const descriptor = GET_DESCRIPTOR(value, String(i));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(label + " requires enumerable own data element " + i + ".");
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
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (typeof key !== "string") throw new Error(label + " cannot contain symbol fields.");
    let known = false;
    for (let j = 0; j < fields.length; j += 1) {
      if (fields[j] === key) {
        known = true;
        break;
      }
    }
    if (!known) throw new Error(label + " cannot contain unknown field " + key + ".");
  }
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    if (!HAS_OWN(value, field)) throw new Error(label + " is missing required field " + field + ".");
    const descriptor = GET_DESCRIPTOR(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(label + " requires enumerable own data field " + field + ".");
    }
  }
}

const RAW_AUTHORITY: InteriorSelectedFootwayEndpointSourceResolutionAuthority[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    endpointNodeId: ENDPOINT_NODE_ID,
    resolutionStatus: "unresolved",
    sourceCandidates: [
      nullRecord({
        priority: 1,
        role: "authoritative-history-record",
        url: PRIMARY_HISTORY_URL,
        acceptance: "authoritative-record-required",
      }),
      nullRecord({
        priority: 2,
        role: "official-history-view",
        url: OBJECT_HISTORY_URL,
        acceptance: "discovery-only-until-authoritative-record-confirmed",
      }),
      nullRecord({
        priority: 3,
        role: "secondary-history-discovery",
        url: DEEP_HISTORY_URL,
        acceptance: "discovery-only-until-authoritative-record-confirmed",
      }),
    ],
    acceptedEvidenceRule:
      "exact-node-version-at-or-before-target-timestamp-from-authoritative-osm-history",
    rejectedEvidenceRules: [...REJECTED_EVIDENCE_RULES],
    requiredOutputFields: [...REQUIRED_OUTPUT_FIELDS],
    plannerMaterialization: "historical-source-resolution-only",
  }),
];

export function assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity(
  authorities: readonly InteriorSelectedFootwayEndpointSourceResolutionAuthority[],
): void {
  const collectionLabel = "Planner 72 authority collection";
  const authorityLabel = "Planner 72 authority";
  const sourcesLabel = "Planner 72 source candidates";
  const rejectedLabel = "Planner 72 rejected evidence rules";
  const requiredLabel = "Planner 72 required output fields";

  assertArray(authorities, 1, collectionLabel);
  const authorityDescriptor = GET_DESCRIPTOR(authorities, "0");
  if (!authorityDescriptor || !authorityDescriptor.enumerable || !("value" in authorityDescriptor)) {
    throw new Error(collectionLabel + " requires enumerable own data element 0.");
  }
  const candidate = authorityDescriptor.value;
  assertPlain(candidate, TOP_LEVEL_FIELDS, authorityLabel);

  const sourcesDescriptor = GET_DESCRIPTOR(candidate, "sourceCandidates");
  const rejectedDescriptor = GET_DESCRIPTOR(candidate, "rejectedEvidenceRules");
  const requiredDescriptor = GET_DESCRIPTOR(candidate, "requiredOutputFields");
  if (
    !sourcesDescriptor ||
    !("value" in sourcesDescriptor) ||
    !rejectedDescriptor ||
    !("value" in rejectedDescriptor) ||
    !requiredDescriptor ||
    !("value" in requiredDescriptor)
  ) {
    throw new Error("Planner 72 nested evidence collections require own data fields.");
  }

  const sources = sourcesDescriptor.value;
  const rejected = rejectedDescriptor.value;
  const required = requiredDescriptor.value;
  assertArray(sources, 3, sourcesLabel);
  assertArray(rejected, 3, rejectedLabel);
  assertArray(required, 6, requiredLabel);

  const sourceObjects: unknown[] = [];
  for (let index = 0; index < 3; index += 1) {
    const descriptor = GET_DESCRIPTOR(sources, String(index));
    if (!descriptor || !("value" in descriptor)) {
      throw new Error(sourcesLabel + " requires own data element " + index + ".");
    }
    const source = descriptor.value;
    assertPlain(source, SOURCE_FIELDS, "Planner 72 source candidate " + index);
    sourceObjects.push(source);
  }

  let clonedCandidate: unknown;
  try {
    STRUCTURED_CLONE(authorities);
    clonedCandidate = STRUCTURED_CLONE(candidate);
    STRUCTURED_CLONE(sources);
    STRUCTURED_CLONE(rejected);
    STRUCTURED_CLONE(required);
    for (let index = 0; index < sourceObjects.length; index += 1) {
      STRUCTURED_CLONE(sourceObjects[index]);
    }
  } catch {
    throw new Error(collectionLabel + " cannot be Proxy-backed or otherwise uncloneable.");
  }

  const clonedPrototype =
    clonedCandidate && typeof clonedCandidate === "object"
      ? GET_PROTOTYPE_OF(clonedCandidate)
      : undefined;
  if (
    !clonedCandidate ||
    typeof clonedCandidate !== "object" ||
    IS_ARRAY(clonedCandidate) ||
    (clonedPrototype !== Object.prototype && clonedPrototype !== null)
  ) {
    throw new Error(authorityLabel + " must clone as a plain object.");
  }

  const currentAuthorityDescriptor = GET_DESCRIPTOR(authorities, "0");
  const currentSourcesDescriptor = GET_DESCRIPTOR(candidate, "sourceCandidates");
  const currentRejectedDescriptor = GET_DESCRIPTOR(candidate, "rejectedEvidenceRules");
  const currentRequiredDescriptor = GET_DESCRIPTOR(candidate, "requiredOutputFields");
  if (
    !currentAuthorityDescriptor ||
    !("value" in currentAuthorityDescriptor) ||
    currentAuthorityDescriptor.value !== candidate ||
    !currentSourcesDescriptor ||
    !("value" in currentSourcesDescriptor) ||
    currentSourcesDescriptor.value !== sources ||
    !currentRejectedDescriptor ||
    !("value" in currentRejectedDescriptor) ||
    currentRejectedDescriptor.value !== rejected ||
    !currentRequiredDescriptor ||
    !("value" in currentRequiredDescriptor) ||
    currentRequiredDescriptor.value !== required
  ) {
    throw new Error("Planner 72 authority graph cannot mutate during validation.");
  }
  for (let index = 0; index < sourceObjects.length; index += 1) {
    const descriptor = GET_DESCRIPTOR(sources, String(index));
    if (!descriptor || !("value" in descriptor) || descriptor.value !== sourceObjects[index]) {
      throw new Error("Planner 72 source candidate graph cannot mutate during validation.");
    }
  }

  const authority =
    candidate as unknown as InteriorSelectedFootwayEndpointSourceResolutionAuthority;
  const prior = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_HISTORICAL_EVIDENCE[0];

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.targetTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointNodeId !== ENDPOINT_NODE_ID ||
    authority.resolutionStatus !== "unresolved" ||
    authority.acceptedEvidenceRule !==
      "exact-node-version-at-or-before-target-timestamp-from-authoritative-osm-history" ||
    authority.plannerMaterialization !== "historical-source-resolution-only"
  ) {
    throw new Error("Planner 72 source resolution authority drifted.");
  }

  const expectedSources = [
    [1, "authoritative-history-record", PRIMARY_HISTORY_URL, "authoritative-record-required"],
    [2, "official-history-view", OBJECT_HISTORY_URL, "discovery-only-until-authoritative-record-confirmed"],
    [3, "secondary-history-discovery", DEEP_HISTORY_URL, "discovery-only-until-authoritative-record-confirmed"],
  ] as const;

  for (let index = 0; index < expectedSources.length; index += 1) {
    const source = authority.sourceCandidates[index];
    const expected = expectedSources[index];
    if (
      source.priority !== expected[0] ||
      source.role !== expected[1] ||
      source.url !== expected[2] ||
      source.acceptance !== expected[3]
    ) {
      throw new Error("Planner 72 source candidate drifted.");
    }
  }

  for (let index = 0; index < REJECTED_EVIDENCE_RULES.length; index += 1) {
    if (authority.rejectedEvidenceRules[index] !== REJECTED_EVIDENCE_RULES[index]) {
      throw new Error("Planner 72 rejected evidence rules drifted.");
    }
  }
  for (let index = 0; index < REQUIRED_OUTPUT_FIELDS.length; index += 1) {
    if (authority.requiredOutputFields[index] !== REQUIRED_OUTPUT_FIELDS[index]) {
      throw new Error("Planner 72 required output fields drifted.");
    }
  }

  if (
    prior.objectiveSourceRecordId !== authority.objectiveSourceRecordId ||
    prior.targetTimestamp !== authority.targetTimestamp ||
    prior.endpointNodeId !== authority.endpointNodeId ||
    prior.endpointHistoryUrl !== PRIMARY_HISTORY_URL ||
    prior.endpointVersionStatus !== "not-captured" ||
    prior.endpointCoordinateStatus !== "not-captured" ||
    prior.endpointChangesetStatus !== "not-captured"
  ) {
    throw new Error("Planner 72 detached from Planner 71 endpoint evidence boundary.");
  }
}

assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity(RAW_AUTHORITY);

export const INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION:
  readonly InteriorSelectedFootwayEndpointSourceResolutionAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorSelectedFootwayEndpointSourceResolution():
  InteriorSelectedFootwayEndpointSourceResolutionAssessment {
  return deepFreeze(
    nullRecord<InteriorSelectedFootwayEndpointSourceResolutionAssessment>({
      status: "blocked",
      authorityId: AUTHORITY_ID,
      endpointNodeId: ENDPOINT_NODE_ID,
      reason: "AUTHORITATIVE_ENDPOINT_NODE_HISTORY_NOT_CAPTURED",
      nextAction:
        "capture-exact-versioned-node-record-then-promote-coordinate-and-topology",
    }),
  );
}
