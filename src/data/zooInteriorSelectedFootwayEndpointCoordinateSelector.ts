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

const STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);
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

function assertCandidate(
  candidate: unknown,
  index: number,
): asserts candidate is SelectedFootwayEndpointHistoricalNodeVersion {
  const label = "Planner 73 candidate " + index;
  assertPlainObject(
    candidate,
    CANDIDATE_REQUIRED_FIELDS,
    label,
    CANDIDATE_ALLOWED_FIELDS,
  );

  const record = candidate as Record<string, unknown>;
  if (record.sourceObjectId !== ENDPOINT_NODE_ID) {
    throw new Error(label + " must target node " + ENDPOINT_NODE_ID + ".");
  }
  if (
    typeof record.sourceVersion !== "number" ||
    !Number.isInteger(record.sourceVersion) ||
    record.sourceVersion < 1
  ) {
    throw new Error(label + " requires a positive integer sourceVersion.");
  }
  if (
    typeof record.sourceTimestamp !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(record.sourceTimestamp) ||
    Number.isNaN(Date.parse(record.sourceTimestamp))
  ) {
    throw new Error(label + " requires a UTC ISO timestamp.");
  }
  if (
    typeof record.sourceChangeset !== "number" ||
    !Number.isInteger(record.sourceChangeset) ||
    record.sourceChangeset < 1
  ) {
    throw new Error(label + " requires a positive integer sourceChangeset.");
  }
  if (
    record.sourceVersionUrl !==
    "https://api.openstreetmap.org/api/0.6/node/" +
      ENDPOINT_NODE_ID +
      "/" +
      record.sourceVersion
  ) {
    throw new Error(label + " sourceVersionUrl does not match its version.");
  }
  if (typeof record.visible !== "boolean") {
    throw new Error(label + " requires boolean visible.");
  }

  if (record.visible) {
    const latDescriptor = GET_DESCRIPTOR(candidate, "lat");
    const lngDescriptor = GET_DESCRIPTOR(candidate, "lng");
    if (!latDescriptor || !latDescriptor.enumerable || !("value" in latDescriptor)) {
      throw new Error(label + " visible version requires own lat.");
    }
    if (!lngDescriptor || !lngDescriptor.enumerable || !("value" in lngDescriptor)) {
      throw new Error(label + " visible version requires own lng.");
    }
    assertFiniteCoordinate(latDescriptor.value, -90, 90, label + " lat");
    assertFiniteCoordinate(lngDescriptor.value, -180, 180, label + " lng");
  } else {
    if ("lat" in record || "lng" in record) {
      throw new Error(label + " deleted version cannot expose coordinates.");
    }
  }

  let clone: unknown;
  try {
    clone = STRUCTURED_CLONE(candidate);
  } catch {
    throw new Error(label + " cannot be Proxy-backed or otherwise uncloneable.");
  }

  const clonePrototype =
    clone && typeof clone === "object" ? GET_PROTOTYPE_OF(clone) : undefined;
  if (
    !clone ||
    typeof clone !== "object" ||
    IS_ARRAY(clone) ||
    (clonePrototype !== Object.prototype && clonePrototype !== null)
  ) {
    throw new Error(label + " must clone as a plain object.");
  }
}

export function selectLatestVisibleEndpointVersion(
  candidates: readonly SelectedFootwayEndpointHistoricalNodeVersion[],
): SelectedFootwayEndpointHistoricalNodeVersion | null {
  if (!IS_ARRAY(candidates) || GET_PROTOTYPE_OF(candidates) !== Array.prototype) {
    throw new Error("Planner 73 candidates must be an ordinary array.");
  }

  const targetMillis = Date.parse(TARGET_TIMESTAMP);
  let selected: SelectedFootwayEndpointHistoricalNodeVersion | null = null;
  let selectedMillis = Number.NEGATIVE_INFINITY;
  const seenVersions = new Set<number>();

  for (let index = 0; index < candidates.length; index += 1) {
    assertCandidate(candidates[index], index);
    if (seenVersions.has(candidates[index].sourceVersion)) {
      throw new Error(
        "Planner 73 history cannot contain duplicate sourceVersion " +
          candidates[index].sourceVersion +
          ".",
      );
    }
    seenVersions.add(candidates[index].sourceVersion);
    const candidate = candidates[index];
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
): void {
  assertPlainObject(authority, TOP_LEVEL_FIELDS, "Planner 73 authority");
  const prior = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION[0];

  if (
    authority.id !== AUTHORITY_ID ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.targetTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointNodeId !== ENDPOINT_NODE_ID ||
    authority.endpointHistoryUrl !== HISTORY_URL ||
    authority.selectionRule !==
      "latest-visible-version-at-or-before-target-timestamp" ||
    authority.coordinatePromotionRule !==
      "selected-version-must-contain-finite-lat-and-lng" ||
    authority.capturedHistoryStatus !== "not-captured" ||
    authority.plannerMaterialization !== "historical-coordinate-selector-only"
  ) {
    throw new Error("Planner 73 coordinate selector authority drifted.");
  }

  if (
    prior.endpointNodeId !== authority.endpointNodeId ||
    prior.targetTimestamp !== authority.targetTimestamp ||
    prior.sourceCandidates[0].url !== authority.endpointHistoryUrl ||
    prior.acceptedEvidenceRule !==
      "latest-visible-node-version-at-or-before-target-timestamp-from-authoritative-osm-history"
  ) {
    throw new Error("Planner 73 detached from Planner 72 source resolution.");
  }
}

assertInteriorSelectedFootwayEndpointCoordinateSelectorIntegrity(
  INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR,
);
