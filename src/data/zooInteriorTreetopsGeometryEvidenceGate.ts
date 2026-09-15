import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "./zooInteriorFrontStreetGeometryAuthority.ts";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
} from "./zooInteriorObjectiveBranchSelectionAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-treetops-way-geometry-evidence-gate" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const ANCHOR_NODE_ID = "1619736626" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:28:40Z" as const;
const SOURCE_WAY_NAME = "Treetops Way" as const;
const BLOCK_REASON =
  "VERSION_PINNED_TREETOPS_WAY_NODE_SEQUENCE_NOT_CAPTURED" as const;

const CAPTURED_STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);

export type InteriorTreetopsGeometryEvidenceGate = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayUrl: string;
  sourceWayVersionUrl: string;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceHighway: "footway";
  sourceName: typeof SOURCE_WAY_NAME;
  sourceSurface: "concrete";
  versionPinnedNodeSequenceStatus: "not-captured";
  nextJunctionSelection: "blocked";
  plannerMaterialization: "geometry-evidence-gate-only";
};

export type InteriorTreetopsGeometryEvidenceAssessment = {
  status: "blocked";
  reason: typeof BLOCK_REASON;
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  nextJunctionSelection: "blocked";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "EXACT_TREETOPS_WAY_NODE_SEQUENCE_NOT_SOURCED",
      "NEXT_JUNCTION_NOT_SOURCED",
      "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
    ];
  };
};

type DataFieldSnapshot = Readonly<{
  field: string;
  value: unknown;
  enumerable: boolean;
  configurable: boolean;
  writable: boolean;
}>;

const TOP_LEVEL_FIELDS = [
  "id",
  "provider",
  "objectiveSourceRecordId",
  "anchorNodeId",
  "sourceWayId",
  "sourceWayUrl",
  "sourceWayVersionUrl",
  "sourceWayVersion",
  "sourceWayTimestamp",
  "sourceHighway",
  "sourceName",
  "sourceSurface",
  "versionPinnedNodeSequenceStatus",
  "nextJunctionSelection",
  "plannerMaterialization",
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
  "sourceWayNodeIds",
  "sourceWayCoordinates",
  "nextJunctionNodeId",
] as const;

const ROUTE_GRAPH_BLOCK_REASONS = [
  "EXACT_TREETOPS_WAY_NODE_SEQUENCE_NOT_SOURCED",
  "NEXT_JUNCTION_NOT_SOURCED",
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

function nullPrototypeRecord<T extends object>(value: T): T {
  const result = Object.create(null) as T;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new Error("Planner 42 canonical authority requires own data fields.");
    }
    Object.defineProperty(result, key, descriptor);
  }
  return result;
}

function recordFromSnapshot<T extends object>(
  snapshot: readonly DataFieldSnapshot[],
): T {
  const result = Object.create(null) as T;
  for (const field of snapshot) {
    Object.defineProperty(result, field.field, {
      value: field.value,
      enumerable: field.enumerable,
      configurable: field.configurable,
      writable: field.writable,
    });
  }
  return result;
}

function cloneForIntegrityValidation(value: unknown, label: string): unknown {
  try {
    return CAPTURED_STRUCTURED_CLONE(value);
  } catch {
    throw new Error(
      `${label} must be structured-cloneable plain data and cannot be Proxy-backed.`,
    );
  }
}

function assertExactPlainObject(
  value: unknown,
  allowedFields: readonly string[],
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
    throw new Error(
      `${label} must be a plain object with Object.prototype or null prototype.`,
    );
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

function captureDataFieldSnapshot(
  value: Record<string, unknown>,
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

function assertDataFieldSnapshotUnchanged(
  value: Record<string, unknown>,
  snapshot: readonly DataFieldSnapshot[],
  label: string,
) {
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
      throw new Error(`${label} changed during proxy screening.`);
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

function assertNoPrematureGeometryOrRouteMaterialization(
  value: Record<string, unknown>,
  label: string,
) {
  for (const field of FORBIDDEN_ROUTE_FIELDS) {
    if (field in value) {
      throw new Error(`${label} cannot materialize downstream field ${field}.`);
    }
  }
}

const RAW_AUTHORITY: InteriorTreetopsGeometryEvidenceGate[] = [
  nullPrototypeRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    anchorNodeId: ANCHOR_NODE_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayUrl: "https://www.openstreetmap.org/way/148910139",
    sourceWayVersionUrl:
      "https://api.openstreetmap.org/api/0.6/way/148910139/7",
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceHighway: "footway",
    sourceName: SOURCE_WAY_NAME,
    sourceSurface: "concrete",
    versionPinnedNodeSequenceStatus: "not-captured",
    nextJunctionSelection: "blocked",
    plannerMaterialization: "geometry-evidence-gate-only",
  }),
];

export function assertInteriorTreetopsGeometryEvidenceGateIntegrity(
  authorities: readonly InteriorTreetopsGeometryEvidenceGate[],
) {
  const collectionLabel =
    "Planner 42 Treetops geometry evidence-gate collection";
  const gateLabel = "Planner 42 Treetops geometry evidence gate";

  assertExactOrdinaryArray(authorities, 1, collectionLabel);

  const candidateDescriptorBefore = Object.getOwnPropertyDescriptor(
    authorities,
    "0",
  );
  if (
    !candidateDescriptorBefore ||
    !candidateDescriptorBefore.enumerable ||
    !("value" in candidateDescriptorBefore)
  ) {
    throw new Error(
      `${collectionLabel} requires enumerable own data element 0.`,
    );
  }
  const candidate: unknown = candidateDescriptorBefore.value;

  assertExactPlainObject(candidate, TOP_LEVEL_FIELDS, gateLabel);
  assertNoPrematureGeometryOrRouteMaterialization(candidate, gateLabel);
  const candidateSnapshot = captureDataFieldSnapshot(
    candidate,
    TOP_LEVEL_FIELDS,
    gateLabel,
  );

  cloneForIntegrityValidation(authorities, collectionLabel);

  assertExactOrdinaryArray(authorities, 1, collectionLabel);
  const candidateDescriptorAfter = Object.getOwnPropertyDescriptor(
    authorities,
    "0",
  );
  if (
    !candidateDescriptorAfter ||
    !candidateDescriptorAfter.enumerable ||
    !("value" in candidateDescriptorAfter) ||
    !Object.is(candidateDescriptorAfter.value, candidate) ||
    candidateDescriptorAfter.configurable !==
      candidateDescriptorBefore.configurable ||
    candidateDescriptorAfter.writable !== candidateDescriptorBefore.writable
  ) {
    throw new Error(`${collectionLabel} changed during proxy screening.`);
  }

  assertExactPlainObject(candidate, TOP_LEVEL_FIELDS, gateLabel);
  assertNoPrematureGeometryOrRouteMaterialization(candidate, gateLabel);
  assertDataFieldSnapshotUnchanged(candidate, candidateSnapshot, gateLabel);

  const record = recordFromSnapshot<InteriorTreetopsGeometryEvidenceGate>(
    candidateSnapshot,
  );
  const branchSelection = INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0];
  const frontStreetGeometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const selectedCandidate = frontStreetGeometry.adjacentJunctionCandidates.find(
    (junction) =>
      junction.node.sourceObjectId === branchSelection.selectedCandidateNodeId &&
      junction.connectorWayId === branchSelection.selectedConnectorWayId,
  );

  if (
    record.id !== AUTHORITY_ID ||
    record.provider !== "OpenStreetMap" ||
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.anchorNodeId !== ANCHOR_NODE_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceWayUrl !== "https://www.openstreetmap.org/way/148910139" ||
    record.sourceWayVersionUrl !==
      "https://api.openstreetmap.org/api/0.6/way/148910139/7" ||
    record.sourceWayVersion !== SOURCE_WAY_VERSION ||
    record.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    record.sourceHighway !== "footway" ||
    record.sourceName !== SOURCE_WAY_NAME ||
    record.sourceSurface !== "concrete" ||
    record.versionPinnedNodeSequenceStatus !== "not-captured" ||
    record.nextJunctionSelection !== "blocked" ||
    record.plannerMaterialization !== "geometry-evidence-gate-only"
  ) {
    throw new Error(
      "Planner 42 Treetops geometry evidence gate drifted from its frozen source boundary.",
    );
  }

  if (
    branchSelection.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    branchSelection.selectedCandidateNodeId !== record.anchorNodeId ||
    branchSelection.selectedConnectorWayId !== record.sourceWayId ||
    branchSelection.selectedConnectorName !== record.sourceName
  ) {
    throw new Error(
      "Planner 42 drifted from the Planner 27 objective-selected Treetops branch.",
    );
  }

  if (
    !selectedCandidate ||
    selectedCandidate.node.sourceObjectId !== record.anchorNodeId ||
    selectedCandidate.connectorWayId !== record.sourceWayId ||
    selectedCandidate.connectorWayUrl !== record.sourceWayUrl ||
    selectedCandidate.connectorWayVersionUrl !== record.sourceWayVersionUrl ||
    selectedCandidate.connectorWayVersion !== record.sourceWayVersion ||
    selectedCandidate.connectorWayTimestamp !== record.sourceWayTimestamp ||
    selectedCandidate.connectorHighway !== record.sourceHighway ||
    selectedCandidate.connectorName !== record.sourceName ||
    selectedCandidate.connectorSurface !== record.sourceSurface
  ) {
    throw new Error(
      "Planner 42 Treetops source identity drifted from Planner 26 versioned connector evidence.",
    );
  }
}

assertInteriorTreetopsGeometryEvidenceGateIntegrity(RAW_AUTHORITY);

export const INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE:
  readonly InteriorTreetopsGeometryEvidenceGate[] = deepFreeze(RAW_AUTHORITY);

export function assessInteriorTreetopsGeometryEvidence():
  InteriorTreetopsGeometryEvidenceAssessment {
  return deepFreeze({
    status: "blocked",
    reason: BLOCK_REASON,
    authorityId: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    anchorNodeId: ANCHOR_NODE_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    nextJunctionSelection: "blocked",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...ROUTE_GRAPH_BLOCK_REASONS],
    },
  });
}
