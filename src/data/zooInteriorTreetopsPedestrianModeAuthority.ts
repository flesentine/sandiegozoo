import {
  INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY,
  assertInteriorTreetopsV7GeometryAuthorityIntegrity,
} from "./zooInteriorTreetopsV7GeometryAuthority.ts";
import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
  assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity,
} from "./zooInteriorTreetopsHistoricalTopologyAuthority.ts";

const POLICY_ID = "sdz-interior-treetops-footway-mode-policy-v1" as const;
const AUTHORITY_ID = "sdz-interior-treetops-anchor-to-fern-canyon-mode" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TOPOLOGY_AUTHORITY_ID = "sdz-interior-treetops-historical-topology" as const;
const GEOMETRY_AUTHORITY_ID = "sdz-interior-treetops-way-v7-geometry" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:28:40Z" as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;
const FROM_TREETOPS_INDEX = 0 as const;
const TO_TREETOPS_INDEX = 6 as const;
const ADOPTED_AT = "2026-09-18T11:44:00-07:00" as const;

export type InteriorTreetopsPedestrianModePolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope: "version-pinned-highway-footway-exact-segments";
  modeAuthority: "osm-highway-footway";
  supportedMode: "walk";
  sourceMeaning: "mainly-or-exclusively-pedestrians";
  accessRole: "mode-classification-not-operational-eligibility";
  sourceDefinitionUrl: "https://wiki.openstreetmap.org/wiki/Tag:highway%3Dfootway";
  authority: "prospective-osm-mode-classification-policy";
};

export type InteriorTreetopsPedestrianModeAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  topologyAuthorityId: typeof TOPOLOGY_AUTHORITY_ID;
  geometryAuthorityId: typeof GEOMETRY_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  sourceFromTreetopsIndex: typeof FROM_TREETOPS_INDEX;
  sourceToTreetopsIndex: typeof TO_TREETOPS_INDEX;
  mode: "walk";
  resolutionBasis: "osm-highway-footway";
  sourceHighwayTag: "footway";
  sourceName: "Treetops Way";
  sourceSurface: "concrete";
  operationalEligibility: "unresolved";
  plannerMaterialization: "mode-only";
};

export type InteriorTreetopsPedestrianModeAssessment =
  | {
      status: "mode-ready";
      authorityId: typeof AUTHORITY_ID;
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      mode: "walk";
      operationalEligibility: "unresolved";
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_DISTANCE_NOT_QUALIFIED",
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
      reason: "OBJECTIVE_TREETOPS_PEDESTRIAN_MODE_NOT_SOURCED";
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

const POLICY_FIELDS = [
  "id",
  "policyVersion",
  "adoptedAt",
  "scope",
  "modeAuthority",
  "supportedMode",
  "sourceMeaning",
  "accessRole",
  "sourceDefinitionUrl",
  "authority",
] as const;

const AUTHORITY_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "topologyAuthorityId",
  "geometryAuthorityId",
  "policyId",
  "sourceWayId",
  "sourceWayVersion",
  "sourceWayTimestamp",
  "sourceFromNodeId",
  "sourceToNodeId",
  "sourceFromTreetopsIndex",
  "sourceToTreetopsIndex",
  "mode",
  "resolutionBasis",
  "sourceHighwayTag",
  "sourceName",
  "sourceSurface",
  "operationalEligibility",
  "plannerMaterialization",
] as const;

const POLICY_STRING_FIELDS = POLICY_FIELDS;
const AUTHORITY_STRING_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "topologyAuthorityId",
  "geometryAuthorityId",
  "policyId",
  "sourceWayId",
  "sourceWayTimestamp",
  "sourceFromNodeId",
  "sourceToNodeId",
  "mode",
  "resolutionBasis",
  "sourceHighwayTag",
  "sourceName",
  "sourceSurface",
  "operationalEligibility",
  "plannerMaterialization",
] as const;
const AUTHORITY_NUMBER_FIELDS = [
  "sourceWayVersion",
  "sourceFromTreetopsIndex",
  "sourceToTreetopsIndex",
] as const;

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_DISTANCE_NOT_QUALIFIED",
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
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(`${label} must be a plain object with Object.prototype.`);
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
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype
  ) {
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

function snapshotField(snapshot: readonly DataFieldSnapshot[], field: string): unknown {
  const entry = snapshot.find((candidate) => candidate.field === field);
  if (!entry) throw new Error(`Planner 45 internal snapshot is missing ${field}.`);
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

function assertClonePreservesPlainRecord(
  value: Record<string, unknown>,
  fields: readonly string[],
  label: string,
): void {
  let cloned: unknown;
  try {
    cloned = CAPTURED_STRUCTURED_CLONE(value);
  } catch {
    throw new Error(`${label} must be structured-cloneable plain data and cannot be Proxy-backed.`);
  }
  assertExactPlainRecord(cloned, fields, `${label} structured clone`);
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

const RAW_POLICY: InteriorTreetopsPedestrianModePolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope: "version-pinned-highway-footway-exact-segments",
  modeAuthority: "osm-highway-footway",
  supportedMode: "walk",
  sourceMeaning: "mainly-or-exclusively-pedestrians",
  accessRole: "mode-classification-not-operational-eligibility",
  sourceDefinitionUrl: "https://wiki.openstreetmap.org/wiki/Tag:highway%3Dfootway",
  authority: "prospective-osm-mode-classification-policy",
};

const RAW_AUTHORITY: InteriorTreetopsPedestrianModeAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    topologyAuthorityId: TOPOLOGY_AUTHORITY_ID,
    geometryAuthorityId: GEOMETRY_AUTHORITY_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    sourceFromTreetopsIndex: FROM_TREETOPS_INDEX,
    sourceToTreetopsIndex: TO_TREETOPS_INDEX,
    mode: "walk",
    resolutionBasis: "osm-highway-footway",
    sourceHighwayTag: "footway",
    sourceName: "Treetops Way",
    sourceSurface: "concrete",
    operationalEligibility: "unresolved",
    plannerMaterialization: "mode-only",
  },
];

export function assertInteriorTreetopsPedestrianModePolicyIntegrity(
  policy: InteriorTreetopsPedestrianModePolicy,
): void {
  assertExactPlainRecord(policy, POLICY_FIELDS, "Planner 45 pedestrian mode policy");
  const snapshot = captureSnapshot(policy, POLICY_FIELDS, "Planner 45 pedestrian mode policy");
  assertPrimitiveSnapshot(snapshot, POLICY_STRING_FIELDS, [], "Planner 45 pedestrian mode policy");
  assertSnapshotUnchanged(policy, snapshot, "Planner 45 pedestrian mode policy");
  assertClonePreservesPlainRecord(policy, POLICY_FIELDS, "Planner 45 pedestrian mode policy");
  assertSnapshotUnchanged(policy, snapshot, "Planner 45 pedestrian mode policy");

  const expected: Readonly<Record<string, unknown>> = {
    id: POLICY_ID,
    policyVersion: "1",
    adoptedAt: ADOPTED_AT,
    scope: "version-pinned-highway-footway-exact-segments",
    modeAuthority: "osm-highway-footway",
    supportedMode: "walk",
    sourceMeaning: "mainly-or-exclusively-pedestrians",
    accessRole: "mode-classification-not-operational-eligibility",
    sourceDefinitionUrl: "https://wiki.openstreetmap.org/wiki/Tag:highway%3Dfootway",
    authority: "prospective-osm-mode-classification-policy",
  };
  for (const [field, value] of Object.entries(expected)) {
    assertSnapshotValue(snapshot, field, value, "Planner 45 pedestrian mode policy");
  }
}

export function assertInteriorTreetopsPedestrianModeAuthorityIntegrity(
  authorities: readonly InteriorTreetopsPedestrianModeAuthority[],
): void {
  assertExactOrdinaryArray(authorities, 1, "Planner 45 mode authority collection");
  const collectionDescriptor = Object.getOwnPropertyDescriptor(authorities, "0");
  if (!collectionDescriptor || !("value" in collectionDescriptor)) {
    throw new Error("Planner 45 mode authority collection requires data element 0.");
  }

  const candidate = collectionDescriptor.value;
  assertExactPlainRecord(candidate, AUTHORITY_FIELDS, "Planner 45 pedestrian mode authority");
  const snapshot = captureSnapshot(candidate, AUTHORITY_FIELDS, "Planner 45 pedestrian mode authority");
  assertPrimitiveSnapshot(
    snapshot,
    AUTHORITY_STRING_FIELDS,
    AUTHORITY_NUMBER_FIELDS,
    "Planner 45 pedestrian mode authority",
  );

  // Screen the single flat record before cloning the containing collection.
  // Every authority field is primitive, so no nested attacker-controlled graph
  // remains after this record passes.
  assertSnapshotUnchanged(candidate, snapshot, "Planner 45 pedestrian mode authority");
  assertClonePreservesPlainRecord(candidate, AUTHORITY_FIELDS, "Planner 45 pedestrian mode authority");
  assertSnapshotUnchanged(candidate, snapshot, "Planner 45 pedestrian mode authority");

  assertExactOrdinaryArray(authorities, 1, "Planner 45 mode authority collection");
  const afterDescriptor = Object.getOwnPropertyDescriptor(authorities, "0");
  if (
    !afterDescriptor ||
    !("value" in afterDescriptor) ||
    !Object.is(afterDescriptor.value, candidate)
  ) {
    throw new Error("Planner 45 mode authority collection changed during integrity screening.");
  }
  try {
    CAPTURED_STRUCTURED_CLONE(authorities);
  } catch {
    throw new Error("Planner 45 mode authority collection cannot be Proxy-backed.");
  }

  const expected: Readonly<Record<string, unknown>> = {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    topologyAuthorityId: TOPOLOGY_AUTHORITY_ID,
    geometryAuthorityId: GEOMETRY_AUTHORITY_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    sourceFromTreetopsIndex: FROM_TREETOPS_INDEX,
    sourceToTreetopsIndex: TO_TREETOPS_INDEX,
    mode: "walk",
    resolutionBasis: "osm-highway-footway",
    sourceHighwayTag: "footway",
    sourceName: "Treetops Way",
    sourceSurface: "concrete",
    operationalEligibility: "unresolved",
    plannerMaterialization: "mode-only",
  };
  for (const [field, value] of Object.entries(expected)) {
    assertSnapshotValue(snapshot, field, value, "Planner 45 pedestrian mode authority");
  }

  assertInteriorTreetopsV7GeometryAuthorityIntegrity(INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY);
  assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity(
    INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
  );

  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  const topology = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  const segment = topology.segmentProvenance;

  if (
    geometry.id !== GEOMETRY_AUTHORITY_ID ||
    geometry.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    geometry.sourceWayId !== SOURCE_WAY_ID ||
    geometry.sourceWayVersion !== SOURCE_WAY_VERSION ||
    geometry.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    geometry.sourceHighway !== "footway" ||
    geometry.sourceName !== "Treetops Way" ||
    geometry.sourceSurface !== "concrete"
  ) {
    throw new Error("Planner 45 mode authority detached from Planner 43 version-pinned footway evidence.");
  }

  if (
    topology.id !== TOPOLOGY_AUTHORITY_ID ||
    topology.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    topology.anchorNodeId !== FROM_NODE_ID ||
    topology.nextJunctionNodeId !== TO_NODE_ID ||
    topology.nextJunctionTreetopsIndex !== TO_TREETOPS_INDEX ||
    segment.sourceWayId !== SOURCE_WAY_ID ||
    segment.sourceWayVersion !== SOURCE_WAY_VERSION ||
    segment.fromNodeId !== FROM_NODE_ID ||
    segment.toNodeId !== TO_NODE_ID ||
    segment.fromTreetopsIndex !== FROM_TREETOPS_INDEX ||
    segment.toTreetopsIndex !== TO_TREETOPS_INDEX ||
    segment.provenanceStatus !== "captured"
  ) {
    throw new Error("Planner 45 mode authority detached from Planner 44 exact segment provenance.");
  }
}

assertInteriorTreetopsPedestrianModePolicyIntegrity(RAW_POLICY);
assertInteriorTreetopsPedestrianModeAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_TREETOPS_PEDESTRIAN_MODE_POLICY: InteriorTreetopsPedestrianModePolicy =
  deepFreeze(RAW_POLICY);

export const INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY:
  readonly InteriorTreetopsPedestrianModeAuthority[] = deepFreeze(RAW_AUTHORITY);

export function interiorTreetopsPedestrianModeForObjective(
  objectiveSourceRecordId: string,
): InteriorTreetopsPedestrianModeAuthority | undefined {
  return INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorTreetopsPedestrianMode(
  objectiveSourceRecordId: string,
): InteriorTreetopsPedestrianModeAssessment {
  const mode = interiorTreetopsPedestrianModeForObjective(objectiveSourceRecordId);
  if (!mode) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_PEDESTRIAN_MODE_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "mode-ready",
    authorityId: mode.id,
    objectiveSourceRecordId: mode.objectiveSourceRecordId,
    sourceWayId: mode.sourceWayId,
    sourceWayVersion: mode.sourceWayVersion,
    sourceFromNodeId: mode.sourceFromNodeId,
    sourceToNodeId: mode.sourceToNodeId,
    mode: mode.mode,
    operationalEligibility: mode.operationalEligibility,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
