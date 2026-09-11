import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "./zooInteriorFrontStreetGeometryAuthority.ts";
import {
  OFFICIAL_ZOO_MAP_ARTIFACTS,
  PUBLISHED_WALKING_CORRIDORS,
} from "./zooMapAuthority.ts";
import {
  sourceBackedRecordById,
} from "./zooSourceCatalog.ts";

const AUTHORITY_ID =
  "sdz-interior-front-street-objective-branch-selection" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const OFFICIAL_MAP_ARTIFACT_ID =
  "sdz-map-2026-01-05-accessibility" as const;
const OFFICIAL_CORRIDOR_ID = "sdz-corridor-treetops-way" as const;
const GEOMETRY_AUTHORITY_ID =
  "sdz-interior-front-street-adjacent-geometry" as const;
const GEOMETRY_CONNECTION_NODE_ID = "7053320515" as const;
const SELECTED_CANDIDATE_NODE_ID = "1619736626" as const;
const SELECTED_CONNECTOR_WAY_ID = "148910139" as const;
const SELECTED_CONNECTOR_NAME = "Treetops Way" as const;

export type InteriorObjectiveBranchSelectionAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  objectiveCanonicalName: "Tiger Trail";
  officialMapArtifactId: typeof OFFICIAL_MAP_ARTIFACT_ID;
  officialMapRevisionDate: "2026-01-05";
  officialMapObservedAt: "2026-09-07T21:53:00-07:00";
  officialCorridorId: typeof OFFICIAL_CORRIDOR_ID;
  officialCorridorName: typeof SELECTED_CONNECTOR_NAME;
  officialCorridorRelation: "access";
  geometryAuthorityId: typeof GEOMETRY_AUTHORITY_ID;
  geometryConnectionNodeId: typeof GEOMETRY_CONNECTION_NODE_ID;
  selectedCandidateNodeId: typeof SELECTED_CANDIDATE_NODE_ID;
  selectedConnectorWayId: typeof SELECTED_CONNECTOR_WAY_ID;
  selectedConnectorName: typeof SELECTED_CONNECTOR_NAME;
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "objective-branch-selection-only";
};

export type InteriorObjectiveBranchSelectionAssessment =
  | {
      status: "objective-branch-selected";
      objectiveSourceRecordId: string;
      selectedCandidateNodeId: string;
      selectedConnectorWayId: string;
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_MODE_NOT_SOURCED",
          "EXACT_SEGMENT_DISTANCE_NOT_SOURCED",
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
      reason: "OBJECTIVE_BRANCH_AUTHORITY_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const TOP_LEVEL_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "objectiveCanonicalName",
  "officialMapArtifactId",
  "officialMapRevisionDate",
  "officialMapObservedAt",
  "officialCorridorId",
  "officialCorridorName",
  "officialCorridorRelation",
  "geometryAuthorityId",
  "geometryConnectionNodeId",
  "selectedCandidateNodeId",
  "selectedConnectorWayId",
  "selectedConnectorName",
  "selectionScope",
  "globalEndpointSelection",
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
  "globalEndpointNodeId",
] as const;

const EXACT_SEGMENT_BLOCK_REASONS = [
  "EXACT_SEGMENT_MODE_NOT_SOURCED",
  "EXACT_SEGMENT_DISTANCE_NOT_SOURCED",
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
  if (
    value &&
    typeof value === "object" &&
    !Object.isFrozen(value)
  ) {
    for (const child of Object.values(
      value as Record<string, unknown>,
    )) {
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

function assertNoRouteMaterialization(
  value: Record<string, unknown>,
  label: string,
) {
  for (const field of FORBIDDEN_ROUTE_FIELDS) {
    if (field in value) {
      throw new Error(`${label} cannot materialize routing field ${field}.`);
    }
  }
}

const RAW_AUTHORITY: InteriorObjectiveBranchSelectionAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    objectiveCanonicalName: "Tiger Trail",
    officialMapArtifactId: OFFICIAL_MAP_ARTIFACT_ID,
    officialMapRevisionDate: "2026-01-05",
    officialMapObservedAt: "2026-09-07T21:53:00-07:00",
    officialCorridorId: OFFICIAL_CORRIDOR_ID,
    officialCorridorName: SELECTED_CONNECTOR_NAME,
    officialCorridorRelation: "access",
    geometryAuthorityId: GEOMETRY_AUTHORITY_ID,
    geometryConnectionNodeId: GEOMETRY_CONNECTION_NODE_ID,
    selectedCandidateNodeId: SELECTED_CANDIDATE_NODE_ID,
    selectedConnectorWayId: SELECTED_CONNECTOR_WAY_ID,
    selectedConnectorName: SELECTED_CONNECTOR_NAME,
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "objective-branch-selection-only",
  },
];

export function assertInteriorObjectiveBranchSelectionAuthorityIntegrity(
  authorities: readonly InteriorObjectiveBranchSelectionAuthority[],
) {
  assertExactOrdinaryArray(
    authorities,
    1,
    "Planner 27 objective branch authority collection",
  );

  const candidate: unknown = authorities[0];
  assertExactPlainObject(
    candidate,
    TOP_LEVEL_FIELDS,
    "Planner 27 objective branch authority",
  );
  assertNoRouteMaterialization(
    candidate,
    "Planner 27 objective branch authority",
  );

  const record = candidate as unknown as InteriorObjectiveBranchSelectionAuthority;
  const objective = sourceBackedRecordById(record.objectiveSourceRecordId);
  const corridor = PUBLISHED_WALKING_CORRIDORS.find(
    (entry) => entry.id === record.officialCorridorId,
  );
  const artifact = OFFICIAL_ZOO_MAP_ARTIFACTS.find(
    (entry) => entry.id === record.officialMapArtifactId,
  );
  const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY.find(
    (entry) => entry.id === record.geometryAuthorityId,
  );

  if (
    record.id !== AUTHORITY_ID ||
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.objectiveCanonicalName !== "Tiger Trail" ||
    record.officialMapArtifactId !== OFFICIAL_MAP_ARTIFACT_ID ||
    record.officialMapRevisionDate !== "2026-01-05" ||
    record.officialMapObservedAt !== "2026-09-07T21:53:00-07:00" ||
    record.officialCorridorId !== OFFICIAL_CORRIDOR_ID ||
    record.officialCorridorName !== SELECTED_CONNECTOR_NAME ||
    record.officialCorridorRelation !== "access" ||
    record.geometryAuthorityId !== GEOMETRY_AUTHORITY_ID ||
    record.geometryConnectionNodeId !== GEOMETRY_CONNECTION_NODE_ID ||
    record.selectedCandidateNodeId !== SELECTED_CANDIDATE_NODE_ID ||
    record.selectedConnectorWayId !== SELECTED_CONNECTOR_WAY_ID ||
    record.selectedConnectorName !== SELECTED_CONNECTOR_NAME ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !== "objective-branch-selection-only"
  ) {
    throw new Error("Planner 27 objective branch authority drifted from the frozen decision contract.");
  }

  if (
    !objective ||
    objective.kind !== "animal-destination" ||
    objective.canonicalName !== record.objectiveCanonicalName
  ) {
    throw new Error("Planner 27 objective drifted from the source-backed Tiger Trail record.");
  }

  if (
    !artifact ||
    artifact.kind !== "accessibility-map" ||
    artifact.authority !== "official" ||
    artifact.revisionDate !== record.officialMapRevisionDate ||
    artifact.observedAt !== record.officialMapObservedAt
  ) {
    throw new Error("Planner 27 official-map artifact evidence drifted.");
  }

  const matchingRelations = corridor?.sourceRecordRelations?.filter(
    (relation) =>
      relation.sourceRecordId === record.objectiveSourceRecordId &&
      relation.relation === record.officialCorridorRelation,
  ) ?? [];

  if (
    !corridor ||
    corridor.name !== record.officialCorridorName ||
    corridor.artifactId !== record.officialMapArtifactId ||
    corridor.plannerMaterialization !== "corridor-authority-only" ||
    matchingRelations.length !== 1
  ) {
    throw new Error("Planner 27 corridor access evidence drifted from official map authority.");
  }

  if (
    !geometry ||
    geometry.endpointSelection !== "unresolved" ||
    geometry.connectionNode.sourceObjectId !== record.geometryConnectionNodeId
  ) {
    throw new Error("Planner 27 requires Planner 26 to remain globally endpoint-unresolved.");
  }

  const selectedCandidates = geometry.adjacentJunctionCandidates.filter(
    (junction) =>
      junction.node.sourceObjectId === record.selectedCandidateNodeId &&
      junction.connectorWayId === record.selectedConnectorWayId &&
      junction.connectorName === record.selectedConnectorName,
  );

  if (selectedCandidates.length !== 1) {
    throw new Error("Planner 27 selected branch drifted from the exact Planner 26 Treetops candidate.");
  }
}

assertInteriorObjectiveBranchSelectionAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY:
  readonly InteriorObjectiveBranchSelectionAuthority[] =
  deepFreeze(RAW_AUTHORITY);

export function objectiveScopedFrontStreetBranchSelectionFor(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorObjectiveBranchSelection(
  objectiveSourceRecordId: string,
): InteriorObjectiveBranchSelectionAssessment {
  const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const selection = objectiveScopedFrontStreetBranchSelectionFor(
    objectiveSourceRecordId,
  );

  if (!selection) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_BRANCH_AUTHORITY_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: geometry.endpointSelection,
    });
  }

  return deepFreeze({
    status: "objective-branch-selected",
    objectiveSourceRecordId: selection.objectiveSourceRecordId,
    selectedCandidateNodeId: selection.selectedCandidateNodeId,
    selectedConnectorWayId: selection.selectedConnectorWayId,
    selectionScope: selection.selectionScope,
    globalEndpointSelection: geometry.endpointSelection,
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...EXACT_SEGMENT_BLOCK_REASONS],
    },
  });
}
