import { INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY } from "./zooInteriorTreetopsV7GeometryAuthority.ts";

const AUTHORITY_ID = "sdz-interior-treetops-historical-topology" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const ANCHOR_NODE_ID = "1619736626" as const;
const SOURCE_TREETOPS_WAY_ID = "148910139" as const;
const SOURCE_TREETOPS_WAY_VERSION = 7 as const;
const SOURCE_TREETOPS_WAY_TIMESTAMP = "2026-02-21T20:28:40Z" as const;
const NEXT_JUNCTION_NODE_ID = "13588159626" as const;
const NEXT_JUNCTION_TREETOPS_INDEX = 6 as const;

const SEGMENT_NODE_IDS = [
  "1619736626",
  "1619736622",
  "1619736623",
  "10303552086",
  "1619736627",
  "1619736634",
  "13588159626",
] as const;

export type HistoricalTopologyConnection = {
  sharedNodeId: string;
  treetopsIndex: number;
  sourceWayId: string;
  sourceWayUrl: string;
  sourceWayVersionUrl: string;
  sourceWayVersion: number;
  sourceWayTimestamp: string;
  sourceWayChangeset: number;
  sourceHighway: string;
  sourceArea?: string;
  sourceSurface?: string;
  sourceName?: string;
  orderedNodeIds: readonly string[];
  classification:
    | "excluded-pedestrian-area-not-linear-branch"
    | "first-linear-highway-connected-way-after-anchor";
};

export type InteriorTreetopsHistoricalTopologyAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  sourceTreetopsWayId: typeof SOURCE_TREETOPS_WAY_ID;
  sourceTreetopsWayVersion: typeof SOURCE_TREETOPS_WAY_VERSION;
  sourceTreetopsWayTimestamp: typeof SOURCE_TREETOPS_WAY_TIMESTAMP;
  historicalTopologyCaptureRule: "historical-overpass-snapshot-verified-by-exact-osm-way-version";
  junctionSelectionRule: "scan-forward-after-anchor-first-exact-connected-linear-highway-way-excluding-area-yes";
  interveningConnections: readonly HistoricalTopologyConnection[];
  selectedJunctionConnection: HistoricalTopologyConnection;
  nextJunctionNodeId: typeof NEXT_JUNCTION_NODE_ID;
  nextJunctionTreetopsIndex: typeof NEXT_JUNCTION_TREETOPS_INDEX;
  segmentProvenance: {
    sourceWayId: typeof SOURCE_TREETOPS_WAY_ID;
    sourceWayVersion: typeof SOURCE_TREETOPS_WAY_VERSION;
    sourceWayVersionUrl: string;
    fromNodeId: typeof ANCHOR_NODE_ID;
    toNodeId: typeof NEXT_JUNCTION_NODE_ID;
    fromTreetopsIndex: 0;
    toTreetopsIndex: typeof NEXT_JUNCTION_TREETOPS_INDEX;
    orderedNodeIds: readonly string[];
    provenanceStatus: "captured";
  };
  plannerMaterialization: "junction-and-segment-provenance-only";
};

export type InteriorTreetopsHistoricalTopologyAssessment = {
  status: "junction-and-segment-sourced";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  nextJunctionNodeId: typeof NEXT_JUNCTION_NODE_ID;
  nextJunctionTreetopsIndex: typeof NEXT_JUNCTION_TREETOPS_INDEX;
  connectedWayId: "1481578621";
  nextJunctionSelection: "captured";
  exactSegmentProvenance: "captured";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly ["PEDESTRIAN_MODE_NOT_QUALIFIED"];
  };
};

type DataFieldSnapshot = Readonly<{
  field: string;
  value: unknown;
  enumerable: boolean;
  configurable: boolean;
  writable: boolean;
}>;

const CAPTURED_STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);
const TOP_LEVEL_FIELDS = ["id","provider","objectiveSourceRecordId","anchorNodeId","sourceTreetopsWayId","sourceTreetopsWayVersion","sourceTreetopsWayTimestamp","historicalTopologyCaptureRule","junctionSelectionRule","interveningConnections","selectedJunctionConnection","nextJunctionNodeId","nextJunctionTreetopsIndex","segmentProvenance","plannerMaterialization"] as const;
const TOP_LEVEL_STRING_FIELDS = ["id","provider","objectiveSourceRecordId","anchorNodeId","sourceTreetopsWayId","sourceTreetopsWayTimestamp","historicalTopologyCaptureRule","junctionSelectionRule","nextJunctionNodeId","plannerMaterialization"] as const;
const TOP_LEVEL_NUMBER_FIELDS = ["sourceTreetopsWayVersion","nextJunctionTreetopsIndex"] as const;
const AREA_CONNECTION_FIELDS = ["sharedNodeId","treetopsIndex","sourceWayId","sourceWayUrl","sourceWayVersionUrl","sourceWayVersion","sourceWayTimestamp","sourceWayChangeset","sourceHighway","sourceArea","sourceSurface","orderedNodeIds","classification"] as const;
const AREA_CONNECTION_STRING_FIELDS = ["sharedNodeId","sourceWayId","sourceWayUrl","sourceWayVersionUrl","sourceWayTimestamp","sourceHighway","sourceArea","sourceSurface","classification"] as const;
const AREA_CONNECTION_NUMBER_FIELDS = ["treetopsIndex","sourceWayVersion","sourceWayChangeset"] as const;
const SELECTED_CONNECTION_FIELDS = ["sharedNodeId","treetopsIndex","sourceWayId","sourceWayUrl","sourceWayVersionUrl","sourceWayVersion","sourceWayTimestamp","sourceWayChangeset","sourceHighway","sourceName","orderedNodeIds","classification"] as const;
const SELECTED_CONNECTION_STRING_FIELDS = ["sharedNodeId","sourceWayId","sourceWayUrl","sourceWayVersionUrl","sourceWayTimestamp","sourceHighway","sourceName","classification"] as const;
const SELECTED_CONNECTION_NUMBER_FIELDS = ["treetopsIndex","sourceWayVersion","sourceWayChangeset"] as const;
const SEGMENT_FIELDS = ["sourceWayId","sourceWayVersion","sourceWayVersionUrl","fromNodeId","toNodeId","fromTreetopsIndex","toTreetopsIndex","orderedNodeIds","provenanceStatus"] as const;
const SEGMENT_STRING_FIELDS = ["sourceWayId","sourceWayVersionUrl","fromNodeId","toNodeId","provenanceStatus"] as const;
const SEGMENT_NUMBER_FIELDS = ["sourceWayVersion","fromTreetopsIndex","toTreetopsIndex"] as const;

const INTERVENING_AREA_ORDERED_NODE_IDS = ["926024999","7053320516","926024998","926024997","10303552043","10303552044","10303552045","10303552046","10303552047","926024995","10303552048","10303552049","10303552050","10303552051","10303552052","10303552053","10231892128","10231892129","10231892130","10231892131","926024989","10231892132","926024988","926024987","926024986","926024985","10231892140","10231892139","10303552054","10231892138","2591959895","2591959897","2591959899","2591959901","2591959902","2591959904","2591959906","2591959827","2591959828","2591959830","2591959832","2591959834","10303552055","10303552080","10303552056","9365675104","9365675103","9365675102","9365675101","9365675100","10303552081","10303552057","10303552058","10303552059","10303552060","10303552061","10303552062","10303552085","10303552063","10303552064","10303552065","10303552066","10303552082","10303552067","10303552068","10303552069","10303552070","10303552086","10303552071","9365675109","9365675108","10303552083","10303552072","10303552073","48905912","13587192687","10303552074","10303552075","10303552076","10303552078","10303552079","926025000","926024999"] as const;
const SELECTED_JUNCTION_ORDERED_NODE_IDS = ["13588159625", NEXT_JUNCTION_NODE_ID] as const;


function nullRecord<T extends object>(value: T): T {
  return Object.assign(Object.create(null), value) as T;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}


function cloneForIntegrityValidation(value: unknown, label: string): void {
  try {
    CAPTURED_STRUCTURED_CLONE(value);
  } catch {
    throw new Error(`${label} must be structured-cloneable plain data and cannot be Proxy-backed.`);
  }
}

function assertPlain(value: unknown, fields: readonly string[], label: string): asserts value is Record<string, unknown> {
  const prototype = value && typeof value === "object" ? Object.getPrototypeOf(value) : undefined;
  if (!value || typeof value !== "object" || Array.isArray(value) || (prototype !== Object.prototype && prototype !== null)) {
    throw new Error(`${label} must be a plain object.`);
  }
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key === "symbol")) throw new Error(`${label} cannot contain symbol fields.`);
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
function assertClonePreservesPlainRecord(value: Record<string, unknown>, fields: readonly string[], label: string): void {
  let cloned: unknown;
  try {
    cloned = CAPTURED_STRUCTURED_CLONE(value);
  } catch {
    throw new Error(`${label} must be structured-cloneable plain data and cannot be Proxy-backed.`);
  }
  assertPlain(cloned, fields, `${label} structured clone`);
}


function assertArray(value: unknown, length: number, label: string): asserts value is unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    throw new Error(`${label} must be an ordinary array of length ${length}.`);
  }
  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
  if (!lengthDescriptor || !("value" in lengthDescriptor) || lengthDescriptor.value !== length || lengthDescriptor.enumerable || lengthDescriptor.configurable) {
    throw new Error(`${label} must be an ordinary array of length ${length}.`);
  }
  const allowed = new Set([...Array.from({ length }, (_, index) => String(index)), "length"]);
  if (Reflect.ownKeys(value).some((key) => typeof key !== "string" || !allowed.has(key))) {
    throw new Error(`${label} cannot contain extra own properties.`);
  }
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data element ${index}.`);
    }
  }
}

function captureDataFieldSnapshot(value: object, fields: readonly string[], label: string): readonly DataFieldSnapshot[] {
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

function captureArraySnapshot(value: unknown[], length: number, label: string): readonly DataFieldSnapshot[] {
  return captureDataFieldSnapshot(value, Array.from({ length }, (_, index) => String(index)), label);
}

function ordinaryRecordFromSnapshot(snapshot: readonly DataFieldSnapshot[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const entry of snapshot) {
    Object.defineProperty(result, entry.field, {
      value: entry.value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  return result;
}

function snapshotField(snapshot: readonly DataFieldSnapshot[], field: string): unknown {
  const match = snapshot.find((candidate) => candidate.field === field);
  if (!match) throw new Error(`Planner 44 internal snapshot is missing ${field}.`);
  return match.value;
}

function assertPrimitiveSnapshotFields(
  snapshot: readonly DataFieldSnapshot[],
  stringFields: readonly string[],
  numberFields: readonly string[],
  label: string,
): void {
  for (const field of stringFields) {
    if (typeof snapshotField(snapshot, field) !== "string") {
      throw new Error(`${label} field ${field} must be a primitive string before proxy screening.`);
    }
  }
  for (const field of numberFields) {
    const value = snapshotField(snapshot, field);
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`${label} field ${field} must be a finite primitive number before proxy screening.`);
    }
  }
}

function assertStringArraySnapshot(snapshot: readonly DataFieldSnapshot[], label: string): void {
  for (const entry of snapshot) {
    if (typeof entry.value !== "string") {
      throw new Error(`${label} element ${entry.field} must be a primitive string before proxy screening.`);
    }
  }
}

function assertDataFieldSnapshotUnchanged(value: object, snapshot: readonly DataFieldSnapshot[], label: string): void {
  for (const expected of snapshot) {
    const descriptor = Object.getOwnPropertyDescriptor(value, expected.field);
    if (!descriptor || !("value" in descriptor) || descriptor.enumerable !== expected.enumerable || (descriptor.configurable === true) !== expected.configurable || (descriptor.writable === true) !== expected.writable || !Object.is(descriptor.value, expected.value)) {
      throw new Error(`${label} changed during proxy screening.`);
    }
  }
}

function assertSnapshotEquals(snapshot: readonly DataFieldSnapshot[], field: string, expected: unknown, label: string): void {
  if (!Object.is(snapshotField(snapshot, field), expected)) throw new Error(`${label} field ${field} drifted from frozen provenance.`);
}

type PreparedRecord = {
  record: Record<string, unknown>;
  snapshot: readonly DataFieldSnapshot[];
  orderedNodeIds: unknown[];
  orderedNodeSnapshot: readonly DataFieldSnapshot[];
};

function prepareConnectionRecord(
  candidate: unknown,
  fields: readonly string[],
  stringFields: readonly string[],
  numberFields: readonly string[],
  orderedNodeCount: number,
  label: string,
): PreparedRecord {
  assertPlain(candidate, fields, label);
  const snapshot = captureDataFieldSnapshot(candidate, fields, label);
  assertPrimitiveSnapshotFields(snapshot, stringFields, numberFields, label);
  const orderedNodeIdsValue = snapshotField(snapshot, "orderedNodeIds");
  assertArray(orderedNodeIdsValue, orderedNodeCount, `${label} ordered node sequence`);
  const orderedNodeIds = orderedNodeIdsValue as unknown[];
  const orderedNodeSnapshot = captureArraySnapshot(orderedNodeIds, orderedNodeCount, `${label} ordered node sequence`);
  assertStringArraySnapshot(orderedNodeSnapshot, `${label} ordered node sequence`);
  return { record: candidate, snapshot, orderedNodeIds, orderedNodeSnapshot };
}

function assertPreparedRecordUnchanged(prepared: PreparedRecord, fields: readonly string[], label: string): void {
  assertPlain(prepared.record, fields, label);
  assertDataFieldSnapshotUnchanged(prepared.record, prepared.snapshot, label);
  assertArray(prepared.orderedNodeIds, prepared.orderedNodeSnapshot.length, `${label} ordered node sequence`);
  assertDataFieldSnapshotUnchanged(prepared.orderedNodeIds, prepared.orderedNodeSnapshot, `${label} ordered node sequence`);
}

const INTERVENING_AREA_CONNECTION = nullRecord<HistoricalTopologyConnection>({
  sharedNodeId: "10303552086",
  treetopsIndex: 3,
  sourceWayId: "1126804582",
  sourceWayUrl: "https://www.openstreetmap.org/way/1126804582",
  sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/1126804582/3",
  sourceWayVersion: 3,
  sourceWayTimestamp: "2026-02-21T14:47:49Z",
  sourceWayChangeset: 178862584,
  sourceHighway: "pedestrian",
  sourceArea: "yes",
  sourceSurface: "paving_stones",
  orderedNodeIds: [...INTERVENING_AREA_ORDERED_NODE_IDS],
  classification: "excluded-pedestrian-area-not-linear-branch",
});

const SELECTED_JUNCTION_CONNECTION = nullRecord<HistoricalTopologyConnection>({
  sharedNodeId: NEXT_JUNCTION_NODE_ID,
  treetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
  sourceWayId: "1481578621",
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578621",
  sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/1481578621/1",
  sourceWayVersion: 1,
  sourceWayTimestamp: "2026-02-21T20:08:08Z",
  sourceWayChangeset: 178875075,
  sourceHighway: "footway",
  sourceName: "Fern Canyon Trail",
  orderedNodeIds: [...SELECTED_JUNCTION_ORDERED_NODE_IDS],
  classification: "first-linear-highway-connected-way-after-anchor",
});

const RAW_AUTHORITY: InteriorTreetopsHistoricalTopologyAuthority[] = [nullRecord({
  id: AUTHORITY_ID,
  provider: "OpenStreetMap",
  objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
  anchorNodeId: ANCHOR_NODE_ID,
  sourceTreetopsWayId: SOURCE_TREETOPS_WAY_ID,
  sourceTreetopsWayVersion: SOURCE_TREETOPS_WAY_VERSION,
  sourceTreetopsWayTimestamp: SOURCE_TREETOPS_WAY_TIMESTAMP,
  historicalTopologyCaptureRule: "historical-overpass-snapshot-verified-by-exact-osm-way-version",
  junctionSelectionRule: "scan-forward-after-anchor-first-exact-connected-linear-highway-way-excluding-area-yes",
  interveningConnections: [INTERVENING_AREA_CONNECTION],
  selectedJunctionConnection: SELECTED_JUNCTION_CONNECTION,
  nextJunctionNodeId: NEXT_JUNCTION_NODE_ID,
  nextJunctionTreetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
  segmentProvenance: nullRecord({
    sourceWayId: SOURCE_TREETOPS_WAY_ID,
    sourceWayVersion: SOURCE_TREETOPS_WAY_VERSION,
    sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/148910139/7",
    fromNodeId: ANCHOR_NODE_ID,
    toNodeId: NEXT_JUNCTION_NODE_ID,
    fromTreetopsIndex: 0,
    toTreetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
    orderedNodeIds: [...SEGMENT_NODE_IDS],
    provenanceStatus: "captured",
  }),
  plannerMaterialization: "junction-and-segment-provenance-only",
})];

export function assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity(
  authorities: readonly InteriorTreetopsHistoricalTopologyAuthority[],
): void {
  const collectionLabel = "Planner 44 authority collection";
  const authorityLabel = "Planner 44 authority";

  assertArray(authorities, 1, collectionLabel);
  const collectionSnapshot = captureArraySnapshot(authorities as unknown[], 1, collectionLabel);
  const record = collectionSnapshot[0].value;
  assertPlain(record, TOP_LEVEL_FIELDS, authorityLabel);
  const authoritySnapshot = captureDataFieldSnapshot(record, TOP_LEVEL_FIELDS, authorityLabel);
  assertPrimitiveSnapshotFields(authoritySnapshot, TOP_LEVEL_STRING_FIELDS, TOP_LEVEL_NUMBER_FIELDS, authorityLabel);

  const interveningValue = snapshotField(authoritySnapshot, "interveningConnections");
  assertArray(interveningValue, 1, "Planner 44 intervening connection collection");
  const interveningConnections = interveningValue as unknown[];
  const interveningCollectionSnapshot = captureArraySnapshot(interveningConnections, 1, "Planner 44 intervening connection collection");
  const area = prepareConnectionRecord(
    interveningCollectionSnapshot[0].value,
    AREA_CONNECTION_FIELDS,
    AREA_CONNECTION_STRING_FIELDS,
    AREA_CONNECTION_NUMBER_FIELDS,
    INTERVENING_AREA_ORDERED_NODE_IDS.length,
    "Planner 44 intervening area connection",
  );

  const selected = prepareConnectionRecord(
    snapshotField(authoritySnapshot, "selectedJunctionConnection"),
    SELECTED_CONNECTION_FIELDS,
    SELECTED_CONNECTION_STRING_FIELDS,
    SELECTED_CONNECTION_NUMBER_FIELDS,
    SELECTED_JUNCTION_ORDERED_NODE_IDS.length,
    "Planner 44 selected junction connection",
  );

  const segmentCandidate = snapshotField(authoritySnapshot, "segmentProvenance");
  assertPlain(segmentCandidate, SEGMENT_FIELDS, "Planner 44 segment provenance");
  const segmentSnapshot = captureDataFieldSnapshot(segmentCandidate, SEGMENT_FIELDS, "Planner 44 segment provenance");
  assertPrimitiveSnapshotFields(segmentSnapshot, SEGMENT_STRING_FIELDS, SEGMENT_NUMBER_FIELDS, "Planner 44 segment provenance");
  const segmentNodeIdsValue = snapshotField(segmentSnapshot, "orderedNodeIds");
  assertArray(segmentNodeIdsValue, SEGMENT_NODE_IDS.length, "Planner 44 segment ordered node sequence");
  const segmentNodeIds = segmentNodeIdsValue as unknown[];
  const segmentNodeSnapshot = captureArraySnapshot(segmentNodeIds, SEGMENT_NODE_IDS.length, "Planner 44 segment ordered node sequence");
  assertStringArraySnapshot(segmentNodeSnapshot, "Planner 44 segment ordered node sequence");

  // Screen every actual/reconstructed layer only after descriptors and scalar leaf
  // types have been captured, so rejected accessors cannot execute during cloning
  // and branded exotic objects cannot hide nested Proxy-backed values.
  cloneForIntegrityValidation(authorities, collectionLabel);
  assertClonePreservesPlainRecord(record, TOP_LEVEL_FIELDS, authorityLabel);
  cloneForIntegrityValidation(ordinaryRecordFromSnapshot(authoritySnapshot), `${authorityLabel} captured snapshot`);
  cloneForIntegrityValidation(interveningConnections, "Planner 44 intervening connection collection");
  assertClonePreservesPlainRecord(area.record, AREA_CONNECTION_FIELDS, "Planner 44 intervening area connection");
  cloneForIntegrityValidation(ordinaryRecordFromSnapshot(area.snapshot), "Planner 44 intervening area captured snapshot");
  cloneForIntegrityValidation(area.orderedNodeIds, "Planner 44 intervening area ordered node sequence");
  assertClonePreservesPlainRecord(selected.record, SELECTED_CONNECTION_FIELDS, "Planner 44 selected junction connection");
  cloneForIntegrityValidation(ordinaryRecordFromSnapshot(selected.snapshot), "Planner 44 selected junction captured snapshot");
  cloneForIntegrityValidation(selected.orderedNodeIds, "Planner 44 selected junction ordered node sequence");
  assertClonePreservesPlainRecord(segmentCandidate, SEGMENT_FIELDS, "Planner 44 segment provenance");
  cloneForIntegrityValidation(ordinaryRecordFromSnapshot(segmentSnapshot), "Planner 44 segment captured snapshot");
  cloneForIntegrityValidation(segmentNodeIds, "Planner 44 segment ordered node sequence");

  // Reject substitution or descriptor mutation that occurred during screening.
  assertArray(authorities, 1, collectionLabel);
  assertDataFieldSnapshotUnchanged(authorities as unknown as object, collectionSnapshot, collectionLabel);
  assertPlain(record, TOP_LEVEL_FIELDS, authorityLabel);
  assertDataFieldSnapshotUnchanged(record, authoritySnapshot, authorityLabel);
  assertArray(interveningConnections, 1, "Planner 44 intervening connection collection");
  assertDataFieldSnapshotUnchanged(interveningConnections, interveningCollectionSnapshot, "Planner 44 intervening connection collection");
  assertPreparedRecordUnchanged(area, AREA_CONNECTION_FIELDS, "Planner 44 intervening area connection");
  assertPreparedRecordUnchanged(selected, SELECTED_CONNECTION_FIELDS, "Planner 44 selected junction connection");
  assertPlain(segmentCandidate, SEGMENT_FIELDS, "Planner 44 segment provenance");
  assertDataFieldSnapshotUnchanged(segmentCandidate, segmentSnapshot, "Planner 44 segment provenance");
  assertArray(segmentNodeIds, SEGMENT_NODE_IDS.length, "Planner 44 segment ordered node sequence");
  assertDataFieldSnapshotUnchanged(segmentNodeIds, segmentNodeSnapshot, "Planner 44 segment ordered node sequence");

  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];

  // Top-level identity remains exactly linked to Planner 43.
  assertSnapshotEquals(authoritySnapshot, "id", AUTHORITY_ID, authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "provider", "OpenStreetMap", authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "objectiveSourceRecordId", geometry.objectiveSourceRecordId, authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "anchorNodeId", geometry.anchorNodeId, authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "sourceTreetopsWayId", geometry.sourceWayId, authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "sourceTreetopsWayVersion", geometry.sourceWayVersion, authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "sourceTreetopsWayTimestamp", geometry.sourceWayTimestamp, authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "historicalTopologyCaptureRule", "historical-overpass-snapshot-verified-by-exact-osm-way-version", authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "junctionSelectionRule", "scan-forward-after-anchor-first-exact-connected-linear-highway-way-excluding-area-yes", authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "nextJunctionNodeId", NEXT_JUNCTION_NODE_ID, authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "nextJunctionTreetopsIndex", NEXT_JUNCTION_TREETOPS_INDEX, authorityLabel);
  assertSnapshotEquals(authoritySnapshot, "plannerMaterialization", "junction-and-segment-provenance-only", authorityLabel);

  // The earlier topology contact is recorded, but remains an area polygon rather
  // than a linear graph branch.
  const areaExpected: Readonly<Record<string, unknown>> = {
    sharedNodeId: geometry.orderedNodeIds[3],
    treetopsIndex: 3,
    sourceWayId: "1126804582",
    sourceWayUrl: "https://www.openstreetmap.org/way/1126804582",
    sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/1126804582/3",
    sourceWayVersion: 3,
    sourceWayTimestamp: "2026-02-21T14:47:49Z",
    sourceWayChangeset: 178862584,
    sourceHighway: "pedestrian",
    sourceArea: "yes",
    sourceSurface: "paving_stones",
    classification: "excluded-pedestrian-area-not-linear-branch",
  };
  for (const [field, expected] of Object.entries(areaExpected)) assertSnapshotEquals(area.snapshot, field, expected, "Planner 44 intervening area connection");
  for (let index = 0; index < INTERVENING_AREA_ORDERED_NODE_IDS.length; index += 1) {
    if (area.orderedNodeSnapshot[index].value !== INTERVENING_AREA_ORDERED_NODE_IDS[index]) {
      throw new Error(`Planner 44 intervening area ordered node sequence drifted at index ${index}.`);
    }
  }

  // The selected connection is topology-only. Pedestrian mode is deliberately
  // left for Planner 45 even though the source tag itself is highway=footway.
  const selectedExpected: Readonly<Record<string, unknown>> = {
    sharedNodeId: geometry.orderedNodeIds[NEXT_JUNCTION_TREETOPS_INDEX],
    treetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
    sourceWayId: "1481578621",
    sourceWayUrl: "https://www.openstreetmap.org/way/1481578621",
    sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/1481578621/1",
    sourceWayVersion: 1,
    sourceWayTimestamp: "2026-02-21T20:08:08Z",
    sourceWayChangeset: 178875075,
    sourceHighway: "footway",
    sourceName: "Fern Canyon Trail",
    classification: "first-linear-highway-connected-way-after-anchor",
  };
  for (const [field, expected] of Object.entries(selectedExpected)) assertSnapshotEquals(selected.snapshot, field, expected, "Planner 44 selected junction connection");
  for (let index = 0; index < SELECTED_JUNCTION_ORDERED_NODE_IDS.length; index += 1) {
    if (selected.orderedNodeSnapshot[index].value !== SELECTED_JUNCTION_ORDERED_NODE_IDS[index]) {
      throw new Error(`Planner 44 selected junction ordered node sequence drifted at index ${index}.`);
    }
  }

  const segmentExpected: Readonly<Record<string, unknown>> = {
    sourceWayId: SOURCE_TREETOPS_WAY_ID,
    sourceWayVersion: SOURCE_TREETOPS_WAY_VERSION,
    sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/148910139/7",
    fromNodeId: ANCHOR_NODE_ID,
    toNodeId: NEXT_JUNCTION_NODE_ID,
    fromTreetopsIndex: 0,
    toTreetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
    provenanceStatus: "captured",
  };
  for (const [field, expected] of Object.entries(segmentExpected)) assertSnapshotEquals(segmentSnapshot, field, expected, "Planner 44 segment provenance");

  const expectedSegment = geometry.orderedNodeIds.slice(0, NEXT_JUNCTION_TREETOPS_INDEX + 1);
  if (expectedSegment.length !== SEGMENT_NODE_IDS.length) throw new Error("Planner 44 segment provenance drifted from Planner 43 ordered geometry.");
  for (let index = 0; index < SEGMENT_NODE_IDS.length; index += 1) {
    if (SEGMENT_NODE_IDS[index] !== expectedSegment[index] || segmentNodeSnapshot[index].value !== SEGMENT_NODE_IDS[index]) {
      throw new Error(`Planner 44 exact segment provenance drifted at index ${index}.`);
    }
  }
}

assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY: readonly InteriorTreetopsHistoricalTopologyAuthority[] =
  deepFreeze(RAW_AUTHORITY);

export function assessInteriorTreetopsHistoricalTopology(): InteriorTreetopsHistoricalTopologyAssessment {
  return deepFreeze({
    status: "junction-and-segment-sourced",
    authorityId: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    anchorNodeId: ANCHOR_NODE_ID,
    nextJunctionNodeId: NEXT_JUNCTION_NODE_ID,
    nextJunctionTreetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
    connectedWayId: "1481578621",
    nextJunctionSelection: "captured",
    exactSegmentProvenance: "captured",
    routeGraphExpansion: {
      status: "blocked",
      reasons: ["PEDESTRIAN_MODE_NOT_QUALIFIED"],
    },
  });
}
