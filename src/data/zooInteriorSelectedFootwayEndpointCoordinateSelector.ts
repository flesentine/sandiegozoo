import {
  INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION,
} from "./zooInteriorSelectedFootwayEndpointSourceResolution.ts";

const AUTHORITY_ID =
  "sdz-interior-selected-footway-endpoint-coordinate-selector" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const ENDPOINT_NODE_ID = "48920902" as const;
const HISTORY_URL =
  "https://api.openstreetmap.org/api/0.6/node/48920902/history" as const;

const GET_PROTOTYPE_OF = Object.getPrototypeOf.bind(Object);
const IS_ARRAY = Array.isArray.bind(Array);
const OWN_KEYS = Reflect.ownKeys.bind(Reflect);
const GET_DESCRIPTOR = Object.getOwnPropertyDescriptor.bind(Object);

export type SelectedFootwayEndpointHistoricalNodeVersion = {
  sourceObjectId: typeof ENDPOINT_NODE_ID;
  sourceVersion: number;
  sourceTimestamp: string;
  sourceChangeset: number;
  sourceVersionUrl: string;
  visible: boolean;
  lat?: number;
  lng?: number;
};

export type InteriorSelectedFootwayEndpointCoordinateSelectorAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  targetTimestamp: typeof TARGET_TIMESTAMP;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  endpointHistoryUrl: typeof HISTORY_URL;
  selectionRule:
    "latest-visible-version-at-or-before-target-timestamp";
  coordinatePromotionRule:
    "selected-version-must-contain-finite-lat-and-lng";
  capturedHistoryStatus: "not-captured";
  plannerMaterialization: "historical-coordinate-selector-only";
};

const TOP_LEVEL_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "targetTimestamp",
  "endpointNodeId",
  "endpointHistoryUrl",
  "selectionRule",
  "coordinatePromotionRule",
  "capturedHistoryStatus",
  "plannerMaterialization",
] as const;

const CANDIDATE_REQUIRED_FIELDS = [
  "sourceObjectId",
  "sourceVersion",
  "sourceTimestamp",
  "sourceChangeset",
  "sourceVersionUrl",
  "visible",
] as const;

const CANDIDATE_ALLOWED_FIELDS = [
  ...CANDIDATE_REQUIRED_FIELDS,
  "lat",
  "lng",
] as const;

function assertPlainObject(
  value: unknown,
  requiredFields: readonly string[],
  label: string,
  allowedFields: readonly string[] = requiredFields,
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
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    if (typeof key !== "string") {
      throw new Error(label + " cannot contain symbol fields.");
    }
    let allowed = false;
    for (let fieldIndex = 0; fieldIndex < allowedFields.length; fieldIndex += 1) {
      if (allowedFields[fieldIndex] === key) {
        allowed = true;
        break;
      }
    }
    if (!allowed) {
      throw new Error(label + " cannot contain unknown field " + key + ".");
    }
  }

  for (let index = 0; index < requiredFields.length; index += 1) {
    const field = requiredFields[index];
    const descriptor = GET_DESCRIPTOR(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(label + " requires enumerable own data field " + field + ".");
    }
  }
}

function assertFiniteCoordinate(
  value: unknown,
  min: number,
  max: number,
  label: string,
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(label + " must be a finite coordinate in range.");
  }
}

function assertCanonicalUtcTimestamp(value: unknown, label: string): asserts value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  ) {
    throw new Error(label + " requires a UTC ISO timestamp.");
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error(label + " requires a UTC ISO timestamp.");
  }

  const canonical = new Date(parsed).toISOString();
  const normalizedInput = value.includes(".") ? value : value.replace("Z", ".000Z");
  if (canonical !== normalizedInput) {
    throw new Error(label + " requires a real UTC calendar timestamp.");
  }
}

function sanitizeCandidateFromRecord(
  candidate: unknown,
  index: number,
): SelectedFootwayEndpointHistoricalNodeVersion {
  const label = "Planner 73 candidate " + index;
  assertPlainObject(
    candidate,
    CANDIDATE_REQUIRED_FIELDS,
    label,
    CANDIDATE_ALLOWED_FIELDS,
  );

  const descriptors = {
    sourceObjectId: GET_DESCRIPTOR(candidate, "sourceObjectId"),
    sourceVersion: GET_DESCRIPTOR(candidate, "sourceVersion"),
    sourceTimestamp: GET_DESCRIPTOR(candidate, "sourceTimestamp"),
    sourceChangeset: GET_DESCRIPTOR(candidate, "sourceChangeset"),
    sourceVersionUrl: GET_DESCRIPTOR(candidate, "sourceVersionUrl"),
    visible: GET_DESCRIPTOR(candidate, "visible"),
    lat: GET_DESCRIPTOR(candidate, "lat"),
    lng: GET_DESCRIPTOR(candidate, "lng"),
  };

  const sourceObjectId = descriptors.sourceObjectId?.value;
  const sourceVersion = descriptors.sourceVersion?.value;
  const sourceTimestamp = descriptors.sourceTimestamp?.value;
  const sourceChangeset = descriptors.sourceChangeset?.value;
  const sourceVersionUrl = descriptors.sourceVersionUrl?.value;
  const visible = descriptors.visible?.value;

  if (sourceObjectId !== ENDPOINT_NODE_ID) {
    throw new Error(label + " must target node " + ENDPOINT_NODE_ID + ".");
  }
  if (
    typeof sourceVersion !== "number" ||
    !Number.isSafeInteger(sourceVersion) ||
    sourceVersion < 1
  ) {
    throw new Error(label + " requires a positive safe integer sourceVersion.");
  }
  assertCanonicalUtcTimestamp(sourceTimestamp, label);
  if (
    typeof sourceChangeset !== "number" ||
    !Number.isSafeInteger(sourceChangeset) ||
    sourceChangeset < 1
  ) {
    throw new Error(label + " requires a positive safe integer sourceChangeset.");
  }
  if (
    sourceVersionUrl !==
    "https://api.openstreetmap.org/api/0.6/node/" +
      ENDPOINT_NODE_ID +
      "/" +
      sourceVersion
  ) {
    throw new Error(label + " sourceVersionUrl does not match its version.");
  }
  if (typeof visible !== "boolean") {
    throw new Error(label + " requires boolean visible.");
  }

  if (descriptors.lat && (!descriptors.lat.enumerable || !("value" in descriptors.lat))) {
    throw new Error(label + " lat must be an enumerable own data field.");
  }
  if (descriptors.lng && (!descriptors.lng.enumerable || !("value" in descriptors.lng))) {
    throw new Error(label + " lng must be an enumerable own data field.");
  }

  if (visible) {
    if (!descriptors.lat || !descriptors.lng) {
      throw new Error(label + " visible version requires own coordinates.");
    }
    assertFiniteCoordinate(descriptors.lat.value, -90, 90, label + " lat");
    assertFiniteCoordinate(descriptors.lng.value, -180, 180, label + " lng");
    return {
      sourceObjectId: ENDPOINT_NODE_ID,
      sourceVersion,
      sourceTimestamp,
      sourceChangeset,
      sourceVersionUrl,
      visible: true,
      lat: descriptors.lat.value,
      lng: descriptors.lng.value,
    };
  }

  if (descriptors.lat || descriptors.lng) {
    throw new Error(label + " deleted version cannot expose coordinates.");
  }

  return {
    sourceObjectId: ENDPOINT_NODE_ID,
    sourceVersion,
    sourceTimestamp,
    sourceChangeset,
    sourceVersionUrl,
    visible: false,
  };
}

export function selectLatestVisibleEndpointVersion(
  candidates: readonly SelectedFootwayEndpointHistoricalNodeVersion[],
): SelectedFootwayEndpointHistoricalNodeVersion | null {
  if (!IS_ARRAY(candidates) || GET_PROTOTYPE_OF(candidates) !== Array.prototype) {
    throw new Error("Planner 73 candidates must be an ordinary array.");
  }

  const lengthDescriptor = GET_DESCRIPTOR(candidates, "length");
  if (
    !lengthDescriptor ||
    !("value" in lengthDescriptor) ||
    typeof lengthDescriptor.value !== "number" ||
    !Number.isInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < 0
  ) {
    throw new Error("Planner 73 candidates require an own data length.");
  }
  const originalLength = lengthDescriptor.value;
  if (originalLength > 10000) {
    throw new Error("Planner 73 candidates must be dense and reasonably bounded.");
  }

  const originalKeys = OWN_KEYS(candidates);
  const dataIndexKeyCount = originalKeys.reduce((count, key) => {
    if (typeof key !== "string" || key === "length") return count;
    if (!/^(?:0|[1-9]\d*)$/.test(key)) return count;
    return count + 1;
  }, 0);
  if (dataIndexKeyCount !== originalLength) {
    throw new Error("Planner 73 candidates must be dense and reasonably bounded.");
  }

  const allowedKeys = new Set([
    ...Array.from({ length: originalLength }, (_, index) => String(index)),
    "length",
  ]);
  for (let index = 0; index < originalKeys.length; index += 1) {
    const key = originalKeys[index];
    if (typeof key !== "string" || !allowedKeys.has(key)) {
      throw new Error("Planner 73 candidates cannot contain extra own properties.");
    }
  }

  const targetMillis = Date.parse(TARGET_TIMESTAMP);
  let selected: SelectedFootwayEndpointHistoricalNodeVersion | null = null;
  let selectedMillis = Number.NEGATIVE_INFINITY;
  const seenVersions = new Set<number>();

  for (let index = 0; index < originalLength; index += 1) {
    const descriptor = GET_DESCRIPTOR(candidates, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(
        "Planner 73 candidate array requires enumerable own data element " + index + ".",
      );
    }

    const candidate = sanitizeCandidateFromRecord(descriptor.value, index);

    if (seenVersions.has(candidate.sourceVersion)) {
      throw new Error(
        "Planner 73 history cannot contain duplicate sourceVersion " +
          candidate.sourceVersion +
          ".",
      );
    }
    seenVersions.add(candidate.sourceVersion);
    if (!candidate.visible) continue;

    const timestampMillis = Date.parse(candidate.sourceTimestamp);
    if (timestampMillis > targetMillis) continue;

    if (
      timestampMillis > selectedMillis ||
      (timestampMillis === selectedMillis &&
        selected !== null &&
        candidate.sourceVersion > selected.sourceVersion)
    ) {
      selected = candidate;
      selectedMillis = timestampMillis;
    } else if (timestampMillis === selectedMillis && selected === null) {
      selected = candidate;
      selectedMillis = timestampMillis;
    }
  }

  return selected;
}

export function assertSelectedEndpointCoordinatePromotable(
  selected: SelectedFootwayEndpointHistoricalNodeVersion | null,
): asserts selected is SelectedFootwayEndpointHistoricalNodeVersion & {
  lat: number;
  lng: number;
} {
  if (!selected) {
    throw new Error("Planner 73 has no visible endpoint version at the target timestamp.");
  }
  if (!selected.visible) {
    throw new Error("Planner 73 selected endpoint version must be visible.");
  }
  assertFiniteCoordinate(selected.lat, -90, 90, "Planner 73 selected lat");
  assertFiniteCoordinate(selected.lng, -180, 180, "Planner 73 selected lng");
}

export const INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR:
  InteriorSelectedFootwayEndpointCoordinateSelectorAuthority = Object.freeze({
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    endpointNodeId: ENDPOINT_NODE_ID,
    endpointHistoryUrl: HISTORY_URL,
    selectionRule: "latest-visible-version-at-or-before-target-timestamp",
    coordinatePromotionRule: "selected-version-must-contain-finite-lat-and-lng",
    capturedHistoryStatus: "not-captured",
    plannerMaterialization: "historical-coordinate-selector-only",
  });

export function assertInteriorSelectedFootwayEndpointCoordinateSelectorIntegrity(
  authority: InteriorSelectedFootwayEndpointCoordinateSelectorAuthority,
): InteriorSelectedFootwayEndpointCoordinateSelectorAuthority {
  assertPlainObject(authority, TOP_LEVEL_FIELDS, "Planner 73 authority");

  const expected: InteriorSelectedFootwayEndpointCoordinateSelectorAuthority = {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    endpointNodeId: ENDPOINT_NODE_ID,
    endpointHistoryUrl: HISTORY_URL,
    selectionRule: "latest-visible-version-at-or-before-target-timestamp",
    coordinatePromotionRule: "selected-version-must-contain-finite-lat-and-lng",
    capturedHistoryStatus: "not-captured",
    plannerMaterialization: "historical-coordinate-selector-only",
  };

  const safeAuthority = Object.create(null) as Record<string, unknown>;
  for (let index = 0; index < TOP_LEVEL_FIELDS.length; index += 1) {
    const field = TOP_LEVEL_FIELDS[index];
    const descriptor = GET_DESCRIPTOR(authority, field);
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor) ||
      descriptor.value !== expected[field]
    ) {
      throw new Error("Planner 73 authority drifted at " + field + ".");
    }
    Object.defineProperty(safeAuthority, field, {
      configurable: false,
      enumerable: true,
      writable: false,
      value: descriptor.value,
    });
  }

  const prior = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION[0];
  const typedSafe =
    safeAuthority as InteriorSelectedFootwayEndpointCoordinateSelectorAuthority;

  if (
    prior.endpointNodeId !== typedSafe.endpointNodeId ||
    prior.targetTimestamp !== typedSafe.targetTimestamp ||
    prior.sourceCandidates[0].url !== typedSafe.endpointHistoryUrl ||
    prior.acceptedEvidenceRule !==
      "latest-visible-node-version-at-or-before-target-timestamp-from-authoritative-osm-history"
  ) {
    throw new Error("Planner 73 detached from Planner 72 source resolution.");
  }

  return typedSafe;
}

assertInteriorSelectedFootwayEndpointCoordinateSelectorIntegrity(
  INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR,
);
