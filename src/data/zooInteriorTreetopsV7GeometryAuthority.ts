import { INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE } from "./zooInteriorTreetopsGeometryEvidenceGate.ts";

const AUTHORITY_ID = "sdz-interior-treetops-way-v7-geometry" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const ANCHOR_NODE_ID = "1619736626" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:28:40Z" as const;
const SOURCE_WAY_CHANGESET = 178875711 as const;
const SOURCE_WAY_NODE_COUNT = 34 as const;
const CAPTURED_STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);

type NodeTuple = readonly [string, number, string, number, number, number];
type DataFieldSnapshot = Readonly<{
  field: string;
  value: unknown;
  enumerable: boolean;
  configurable: boolean;
  writable: boolean;
}>;

const CAPTURED_NODES = [
  ["1619736626",2,"2013-12-23T19:47:46Z",19606502,32.735201,-117.1496375],
  ["1619736622",1,"2012-02-06T04:26:07Z",10600093,32.7352019,-117.1496651],
  ["1619736623",1,"2012-02-06T04:26:07Z",10600093,32.7352035,-117.1497494],
  ["10303552086",1,"2023-01-04T00:10:45Z",130846733,32.7352221,-117.1498087],
  ["1619736627",1,"2012-02-06T04:26:07Z",10600093,32.7352341,-117.149847],
  ["1619736634",1,"2012-02-06T04:26:08Z",10600093,32.7352696,-117.1499523],
  ["13588159626",1,"2026-02-21T20:08:08Z",178875075,32.7352422,-117.1501397],
  ["2596192926",1,"2013-12-27T01:33:17Z",19654286,32.7352248,-117.1501738],
  ["13588159615",1,"2026-02-21T20:08:08Z",178875075,32.7352135,-117.1502373],
  ["2596192924",1,"2013-12-27T01:33:16Z",19654286,32.7351899,-117.1503695],
  ["2596192927",1,"2013-12-27T01:33:17Z",19654286,32.7352257,-117.150586],
  ["13588159620",1,"2026-02-21T20:08:08Z",178875075,32.7352384,-117.1506405],
  ["2596192928",1,"2013-12-27T01:33:17Z",19654286,32.7352464,-117.150675],
  ["2596192929",1,"2013-12-27T01:33:17Z",19654286,32.7352157,-117.1507768],
  ["13588159624",1,"2026-02-21T20:08:08Z",178875075,32.7351783,-117.1507958],
  ["1619736615",1,"2012-02-06T04:26:06Z",10600093,32.7351536,-117.1508083],
  ["1619736612",1,"2012-02-06T04:26:06Z",10600093,32.7351246,-117.1508178],
  ["1619736607",1,"2012-02-06T04:26:06Z",10600093,32.7350827,-117.1508178],
  ["1619736597",2,"2013-12-27T01:33:17Z",19654286,32.7350394,-117.150849],
  ["1619736585",2,"2013-12-27T01:33:17Z",19654286,32.7349712,-117.1509073],
  ["1619736582",1,"2012-02-06T04:26:04Z",10600093,32.7349506,-117.1509595],
  ["13588248406",1,"2026-02-21T20:28:40Z",178875711,32.7349451,-117.1509894],
  ["1619736579",1,"2012-02-06T04:26:04Z",10600093,32.7349345,-117.1510476],
  ["1619736575",1,"2012-02-06T04:26:04Z",10600093,32.7349329,-117.1511798],
  ["1619736581",1,"2012-02-06T04:26:04Z",10600093,32.734949,-117.1512851],
  ["1619736580",1,"2012-02-06T04:26:04Z",10600093,32.7349377,-117.1513559],
  ["1619736571",1,"2012-02-06T04:26:04Z",10600093,32.7349039,-117.1514172],
  ["1619736567",1,"2012-02-06T04:26:03Z",10600093,32.7348865,-117.1514748],
  ["1619736562",1,"2012-02-06T04:26:03Z",10600093,32.7348556,-117.151557],
  ["1619736557",1,"2012-02-06T04:26:02Z",10600093,32.7348153,-117.1516451],
  ["1619736548",1,"2012-02-06T04:26:02Z",10600093,32.7347815,-117.1517121],
  ["1619736539",1,"2012-02-06T04:26:01Z",10600093,32.7347364,-117.1517561],
  ["1619736522",1,"2012-02-06T04:26:01Z",10600093,32.7346526,-117.1517791],
  ["1619736499",2,"2026-02-21T20:28:40Z",178875711,32.7345778,-117.1518137],
] as const satisfies readonly NodeTuple[];

export type TreetopsV7GeometryNode = {
  sourceObjectId: string;
  sourceUrl: string;
  sourceVersionUrl: string;
  sourceVersion: number;
  sourceTimestamp: string;
  sourceChangeset: number;
  lat: number;
  lng: number;
};

export type InteriorTreetopsV7GeometryAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayUrl: string;
  sourceWayVersionUrl: string;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_WAY_CHANGESET;
  sourceHighway: "footway";
  sourceName: "Treetops Way";
  sourceSurface: "concrete";
  sourceWayNodeCount: typeof SOURCE_WAY_NODE_COUNT;
  orderedNodeIds: readonly string[];
  nodes: readonly TreetopsV7GeometryNode[];
  nodeVersionSelectionRule: "latest-visible-version-at-or-before-way-version-timestamp";
  versionPinnedNodeSequenceStatus: "captured";
  nextJunctionSelection: "blocked";
  plannerMaterialization: "version-pinned-geometry-only";
};

export type InteriorTreetopsV7GeometryAssessment = {
  status: "geometry-captured";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayNodeCount: typeof SOURCE_WAY_NODE_COUNT;
  nodeSequenceEvidence: "captured";
  coordinateProvenance: "version-pinned";
  nextJunctionSelection: "blocked";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly ["NEXT_JUNCTION_NOT_SOURCED","EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE"];
  };
};

const TOP_LEVEL_FIELDS = ["id","provider","objectiveSourceRecordId","anchorNodeId","sourceWayId","sourceWayUrl","sourceWayVersionUrl","sourceWayVersion","sourceWayTimestamp","sourceWayChangeset","sourceHighway","sourceName","sourceSurface","sourceWayNodeCount","orderedNodeIds","nodes","nodeVersionSelectionRule","versionPinnedNodeSequenceStatus","nextJunctionSelection","plannerMaterialization"] as const;
const TOP_LEVEL_STRING_FIELDS = ["id","provider","objectiveSourceRecordId","anchorNodeId","sourceWayId","sourceWayUrl","sourceWayVersionUrl","sourceWayTimestamp","sourceHighway","sourceName","sourceSurface","nodeVersionSelectionRule","versionPinnedNodeSequenceStatus","nextJunctionSelection","plannerMaterialization"] as const;
const TOP_LEVEL_NUMBER_FIELDS = ["sourceWayVersion","sourceWayChangeset","sourceWayNodeCount"] as const;
const NODE_FIELDS = ["sourceObjectId","sourceUrl","sourceVersionUrl","sourceVersion","sourceTimestamp","sourceChangeset","lat","lng"] as const;
const NODE_STRING_FIELDS = ["sourceObjectId","sourceUrl","sourceVersionUrl","sourceTimestamp"] as const;
const NODE_NUMBER_FIELDS = ["sourceVersion","sourceChangeset","lat","lng"] as const;
const FORBIDDEN_ROUTE_FIELDS = ["fromNodeId","toNodeId","mode","distanceMeters","durationMinutes","difficulty","stairs","accessible","stroller","oneWay","status","provenance","routeNodeId","nextJunctionNodeId"] as const;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function nullRecord<T extends object>(value: T): T {
  const result = Object.create(null) as T;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) throw new Error("Planner 43 canonical geometry requires data fields.");
    Object.defineProperty(result, key, descriptor);
  }
  return result;
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
  if (!value || typeof value !== "object" || Array.isArray(value) || (prototype !== Object.prototype && prototype !== null)) throw new Error(`${label} must be a plain object.`);
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key === "symbol")) throw new Error(`${label} cannot contain symbol fields.`);
  const expected = new Set(fields);
  const unknown = (keys as string[]).filter((key) => !expected.has(key));
  const missing = fields.filter((key) => !Object.hasOwn(value, key));
  if (unknown.length) throw new Error(`${label} cannot contain unknown field ${unknown.join(", ")}.`);
  if (missing.length) throw new Error(`${label} is missing required field ${missing.join(", ")}.`);
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) throw new Error(`${label} requires enumerable own data field ${field}.`);
  }
}

function assertArray(value: unknown, length: number, label: string): asserts value is unknown[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || value.length !== length) throw new Error(`${label} must be an ordinary array of length ${length}.`);
  const allowed = new Set([...Array.from({ length }, (_, index) => String(index)), "length"]);
  if (Reflect.ownKeys(value).some((key) => typeof key !== "string" || !allowed.has(key))) throw new Error(`${label} cannot contain extra own properties.`);
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) throw new Error(`${label} requires enumerable own data element ${index}.`);
  }
}

function captureDataFieldSnapshot(value: object, fields: readonly string[], label: string): readonly DataFieldSnapshot[] {
  return fields.map((field) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) throw new Error(`${label} requires enumerable own data field ${field}.`);
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

function snapshotField(snapshot: readonly DataFieldSnapshot[], field: string): unknown {
  const match = snapshot.find((candidate) => candidate.field === field);
  if (!match) throw new Error(`Planner 43 internal snapshot is missing ${field}.`);
  return match.value;
}

function assertPrimitiveSnapshotFields(
  snapshot: readonly DataFieldSnapshot[],
  stringFields: readonly string[],
  numberFields: readonly string[],
  label: string,
): void {
  for (const field of stringFields) {
    if (typeof snapshotField(snapshot, field) !== "string") throw new Error(`${label} field ${field} must be a primitive string before proxy screening.`);
  }
  for (const field of numberFields) {
    const value = snapshotField(snapshot, field);
    if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${label} field ${field} must be a finite primitive number before proxy screening.`);
  }
}

function assertStringArraySnapshot(snapshot: readonly DataFieldSnapshot[], label: string): void {
  for (const entry of snapshot) {
    if (typeof entry.value !== "string") throw new Error(`${label} element ${entry.field} must be a primitive string before proxy screening.`);
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

function assertNoRouteFields(value: Record<string, unknown>, label: string) {
  for (const field of FORBIDDEN_ROUTE_FIELDS) if (field in value) throw new Error(`${label} cannot materialize downstream field ${field}.`);
}

const nodes = CAPTURED_NODES.map(([id,version,timestamp,changeset,lat,lng]) => nullRecord({
  sourceObjectId: id,
  sourceUrl: `https://www.openstreetmap.org/node/${id}`,
  sourceVersionUrl: `https://api.openstreetmap.org/api/0.6/node/${id}/${version}`,
  sourceVersion: version,
  sourceTimestamp: timestamp,
  sourceChangeset: changeset,
  lat,
  lng,
}));

const RAW_AUTHORITY: InteriorTreetopsV7GeometryAuthority[] = [nullRecord({
  id: AUTHORITY_ID,
  provider: "OpenStreetMap",
  objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
  anchorNodeId: ANCHOR_NODE_ID,
  sourceWayId: SOURCE_WAY_ID,
  sourceWayUrl: "https://www.openstreetmap.org/way/148910139",
  sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/148910139/7",
  sourceWayVersion: SOURCE_WAY_VERSION,
  sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
  sourceWayChangeset: SOURCE_WAY_CHANGESET,
  sourceHighway: "footway",
  sourceName: "Treetops Way",
  sourceSurface: "concrete",
  sourceWayNodeCount: SOURCE_WAY_NODE_COUNT,
  orderedNodeIds: CAPTURED_NODES.map(([id]) => id),
  nodes,
  nodeVersionSelectionRule: "latest-visible-version-at-or-before-way-version-timestamp",
  versionPinnedNodeSequenceStatus: "captured",
  nextJunctionSelection: "blocked",
  plannerMaterialization: "version-pinned-geometry-only",
})];

export function assertInteriorTreetopsV7GeometryAuthorityIntegrity(authorities: readonly InteriorTreetopsV7GeometryAuthority[]) {
  const collectionLabel = "Planner 43 authority collection";
  const authorityLabel = "Planner 43 authority";

  assertArray(authorities, 1, collectionLabel);
  const collectionSnapshot = captureArraySnapshot(authorities as unknown[], 1, collectionLabel);
  const record = collectionSnapshot[0].value;
  assertPlain(record, TOP_LEVEL_FIELDS, authorityLabel);
  assertNoRouteFields(record, authorityLabel);
  const authoritySnapshot = captureDataFieldSnapshot(record, TOP_LEVEL_FIELDS, authorityLabel);
  assertPrimitiveSnapshotFields(authoritySnapshot, TOP_LEVEL_STRING_FIELDS, TOP_LEVEL_NUMBER_FIELDS, authorityLabel);

  const orderedNodeIdsValue = snapshotField(authoritySnapshot, "orderedNodeIds");
  assertArray(orderedNodeIdsValue, SOURCE_WAY_NODE_COUNT, "Planner 43 ordered node sequence");
  const orderedNodeIds = orderedNodeIdsValue as unknown[];
  const orderedNodeSnapshot = captureArraySnapshot(orderedNodeIds, SOURCE_WAY_NODE_COUNT, "Planner 43 ordered node sequence");
  assertStringArraySnapshot(orderedNodeSnapshot, "Planner 43 ordered node sequence");

  const nodesValue = snapshotField(authoritySnapshot, "nodes");
  assertArray(nodesValue, SOURCE_WAY_NODE_COUNT, "Planner 43 node provenance collection");
  const nodeCollection = nodesValue as unknown[];
  const nodeCollectionSnapshot = captureArraySnapshot(nodeCollection, SOURCE_WAY_NODE_COUNT, "Planner 43 node provenance collection");
  const nodeSnapshots = nodeCollectionSnapshot.map((entry, index) => {
    const candidate = entry.value;
    assertPlain(candidate, NODE_FIELDS, `Planner 43 node ${index}`);
    assertNoRouteFields(candidate, `Planner 43 node ${index}`);
    const snapshot = captureDataFieldSnapshot(candidate, NODE_FIELDS, `Planner 43 node ${index}`);
    assertPrimitiveSnapshotFields(snapshot, NODE_STRING_FIELDS, NODE_NUMBER_FIELDS, `Planner 43 node ${index}`);
    return snapshot;
  });

  cloneForIntegrityValidation(authorities, collectionLabel);

  assertArray(authorities, 1, collectionLabel);
  assertDataFieldSnapshotUnchanged(authorities as unknown as object, collectionSnapshot, collectionLabel);
  assertPlain(record, TOP_LEVEL_FIELDS, authorityLabel);
  assertNoRouteFields(record, authorityLabel);
  assertDataFieldSnapshotUnchanged(record, authoritySnapshot, authorityLabel);
  assertArray(orderedNodeIds, SOURCE_WAY_NODE_COUNT, "Planner 43 ordered node sequence");
  assertDataFieldSnapshotUnchanged(orderedNodeIds, orderedNodeSnapshot, "Planner 43 ordered node sequence");
  assertArray(nodeCollection, SOURCE_WAY_NODE_COUNT, "Planner 43 node provenance collection");
  assertDataFieldSnapshotUnchanged(nodeCollection, nodeCollectionSnapshot, "Planner 43 node provenance collection");
  for (let index = 0; index < SOURCE_WAY_NODE_COUNT; index += 1) {
    const candidate = nodeCollectionSnapshot[index].value;
    assertPlain(candidate, NODE_FIELDS, `Planner 43 node ${index}`);
    assertNoRouteFields(candidate, `Planner 43 node ${index}`);
    assertDataFieldSnapshotUnchanged(candidate, nodeSnapshots[index], `Planner 43 node ${index}`);
  }

  const authority = record as unknown as InteriorTreetopsV7GeometryAuthority;
  const gate = INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE[0];

  if (authority.id !== AUTHORITY_ID || authority.provider !== "OpenStreetMap" || authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID || authority.anchorNodeId !== ANCHOR_NODE_ID || authority.sourceWayId !== SOURCE_WAY_ID || authority.sourceWayUrl !== "https://www.openstreetmap.org/way/148910139" || authority.sourceWayVersionUrl !== "https://api.openstreetmap.org/api/0.6/way/148910139/7" || authority.sourceWayVersion !== SOURCE_WAY_VERSION || authority.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP || authority.sourceWayChangeset !== SOURCE_WAY_CHANGESET || authority.sourceHighway !== "footway" || authority.sourceName !== "Treetops Way" || authority.sourceSurface !== "concrete" || authority.sourceWayNodeCount !== SOURCE_WAY_NODE_COUNT || authority.nodeVersionSelectionRule !== "latest-visible-version-at-or-before-way-version-timestamp" || authority.versionPinnedNodeSequenceStatus !== "captured" || authority.nextJunctionSelection !== "blocked" || authority.plannerMaterialization !== "version-pinned-geometry-only") throw new Error("Planner 43 authority drifted from frozen OSM way v7 evidence.");

  if (authority.objectiveSourceRecordId !== gate.objectiveSourceRecordId || authority.anchorNodeId !== gate.anchorNodeId || authority.sourceWayId !== gate.sourceWayId || authority.sourceWayUrl !== gate.sourceWayUrl || authority.sourceWayVersionUrl !== gate.sourceWayVersionUrl || authority.sourceWayVersion !== gate.sourceWayVersion || authority.sourceWayTimestamp !== gate.sourceWayTimestamp || authority.sourceHighway !== gate.sourceHighway || authority.sourceName !== gate.sourceName || authority.sourceSurface !== gate.sourceSurface) throw new Error("Planner 43 drifted from the qualified Planner 42 source gate.");

  if (authority.orderedNodeIds[0] !== ANCHOR_NODE_ID || new Set(authority.orderedNodeIds).size !== SOURCE_WAY_NODE_COUNT) throw new Error("Planner 43 ordered node sequence lost anchor or uniqueness.");

  for (let index = 0; index < SOURCE_WAY_NODE_COUNT; index += 1) {
    const [id,version,timestamp,changeset,lat,lng] = CAPTURED_NODES[index];
    if (authority.orderedNodeIds[index] !== id) throw new Error(`Planner 43 ordered node sequence drifted at index ${index}.`);
    const node = authority.nodes[index];
    if (node.sourceObjectId !== id || node.sourceUrl !== `https://www.openstreetmap.org/node/${id}` || node.sourceVersionUrl !== `https://api.openstreetmap.org/api/0.6/node/${id}/${version}` || node.sourceVersion !== version || node.sourceTimestamp !== timestamp || node.sourceChangeset !== changeset || node.lat !== lat || node.lng !== lng || !Number.isFinite(Date.parse(node.sourceTimestamp)) || Date.parse(node.sourceTimestamp) > Date.parse(SOURCE_WAY_TIMESTAMP)) throw new Error(`Planner 43 node ${id} drifted from captured historical provenance.`);
  }
}

assertInteriorTreetopsV7GeometryAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY: readonly InteriorTreetopsV7GeometryAuthority[] = deepFreeze(RAW_AUTHORITY);

export function assessInteriorTreetopsV7Geometry(): InteriorTreetopsV7GeometryAssessment {
  return deepFreeze({
    status: "geometry-captured",
    authorityId: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    anchorNodeId: ANCHOR_NODE_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayNodeCount: SOURCE_WAY_NODE_COUNT,
    nodeSequenceEvidence: "captured",
    coordinateProvenance: "version-pinned",
    nextJunctionSelection: "blocked",
    routeGraphExpansion: { status: "blocked", reasons: ["NEXT_JUNCTION_NOT_SOURCED","EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE"] },
  });
}
