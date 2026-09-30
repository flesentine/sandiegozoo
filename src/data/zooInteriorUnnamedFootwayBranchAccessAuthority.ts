import {
  INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY,
} from "./zooInteriorUnnamedFootwayBranchingTopology.ts";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
} from "./zooInteriorObjectiveBranchSelectionAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-unnamed-footway-objective-branch-access-selection" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const JUNCTION_NODE_ID = "1619736694" as const;
const REJECTED_WAY_ID = "148910140" as const;
const SELECTED_WAY_ID = "1481578626" as const;
const SELECTED_TO_NODE_ID = "48920902" as const;

const STRUCTURED_CLONE = globalThis.structuredClone.bind(globalThis);
const OWN_KEYS = Reflect.ownKeys.bind(Reflect);
const GET_PROTOTYPE_OF = Object.getPrototypeOf.bind(Object);
const GET_DESCRIPTOR = Object.getOwnPropertyDescriptor.bind(Object);
const HAS_OWN = Object.hasOwn.bind(Object);
const IS_ARRAY = Array.isArray.bind(Array);
const FREEZE = Object.freeze.bind(Object);
const IS_FROZEN = Object.isFrozen.bind(Object);

export type InteriorUnnamedFootwayBranchAccessAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  junctionNodeId: typeof JUNCTION_NODE_ID;
  sourceTopologyAuthorityId:
    "sdz-interior-unnamed-footway-branching-endpoint-topology";
  objectiveBranchAuthorityId:
    "sdz-interior-front-street-objective-branch-selection";
  rejectedCandidateWayId: typeof REJECTED_WAY_ID;
  rejectedCandidateAccess: "no";
  rejectedCandidateReason: "PUBLIC_ACCESS_PROHIBITED_BY_EXPLICIT_ACCESS_NO";
  selectedContinuationWayId: typeof SELECTED_WAY_ID;
  selectedContinuationToNodeId: typeof SELECTED_TO_NODE_ID;
  selectedContinuationHighway: "footway";
  selectedContinuationNameStatus: "absent";
  selectedContinuationAccessStatus: "no-explicit-access-restriction-captured";
  selectedContinuationFee: "yes";
  selectedContinuationLayer: "-1";
  selectionScope: "objective-only";
  globalBranchSelection: "unresolved";
  plannerMaterialization: "objective-branch-access-selection-only";
};

export type InteriorUnnamedFootwayBranchAccessAssessment = {
  status: "objective-branch-access-selected";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  junctionNodeId: typeof JUNCTION_NODE_ID;
  rejectedCandidateWayId: typeof REJECTED_WAY_ID;
  selectedContinuationWayId: typeof SELECTED_WAY_ID;
  selectedContinuationToNodeId: typeof SELECTED_TO_NODE_ID;
  selectionScope: "objective-only";
  globalBranchSelection: "unresolved";
  nextGeometryCapture: {
    status: "ready";
    sourceWayId: typeof SELECTED_WAY_ID;
    fromNodeId: typeof JUNCTION_NODE_ID;
    toNodeId: typeof SELECTED_TO_NODE_ID;
  };
  routeEdgeMaterialization: {
    status: "blocked";
    reasons: readonly [
      "SELECTED_SEGMENT_NODE_COORDINATES_NOT_CAPTURED",
      "SELECTED_SEGMENT_DISTANCE_NOT_SOURCED",
      "SELECTED_SEGMENT_DURATION_NOT_SOURCED",
      "SELECTED_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
      "SELECTED_SEGMENT_STROLLER_NOT_SOURCED",
      "SELECTED_SEGMENT_DIRECTION_NOT_SOURCED",
    ];
  };
};

const TOP_LEVEL_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "junctionNodeId",
  "sourceTopologyAuthorityId",
  "objectiveBranchAuthorityId",
  "rejectedCandidateWayId",
  "rejectedCandidateAccess",
  "rejectedCandidateReason",
  "selectedContinuationWayId",
  "selectedContinuationToNodeId",
  "selectedContinuationHighway",
  "selectedContinuationNameStatus",
  "selectedContinuationAccessStatus",
  "selectedContinuationFee",
  "selectedContinuationLayer",
  "selectionScope",
  "globalBranchSelection",
  "plannerMaterialization",
] as const;

const FORBIDDEN_ROUTE_FIELDS = [
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
] as const;

const ROUTE_EDGE_BLOCK_REASONS = [
  "SELECTED_SEGMENT_NODE_COORDINATES_NOT_CAPTURED",
  "SELECTED_SEGMENT_DISTANCE_NOT_SOURCED",
  "SELECTED_SEGMENT_DURATION_NOT_SOURCED",
  "SELECTED_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
  "SELECTED_SEGMENT_STROLLER_NOT_SOURCED",
  "SELECTED_SEGMENT_DIRECTION_NOT_SOURCED",
] as const;

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
  expectedFields: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  const prototype =
    value && typeof value === "object" ? GET_PROTOTYPE_OF(value) : undefined;
  if (
    !value ||
    typeof value !== "object" ||
    IS_ARRAY(value) ||
    prototype !== Object.prototype
  ) {
    throw new Error(label + " must be a plain object with Object.prototype.");
  }

  const keys = OWN_KEYS(value);
  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const key = keys[keyIndex];
    if (typeof key !== "string") {
      throw new Error(label + " cannot contain symbol fields.");
    }

    let known = false;
    for (
      let fieldIndex = 0;
      fieldIndex < expectedFields.length;
      fieldIndex += 1
    ) {
      if (expectedFields[fieldIndex] === key) {
        known = true;
        break;
      }
    }
    if (!known) {
      throw new Error(label + " cannot contain unknown field " + key + ".");
    }
  }

  for (
    let fieldIndex = 0;
    fieldIndex < expectedFields.length;
    fieldIndex += 1
  ) {
    const field = expectedFields[fieldIndex];
    if (!HAS_OWN(value, field)) {
      throw new Error(label + " is missing required field " + field + ".");
    }
    const descriptor = GET_DESCRIPTOR(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(label + " requires enumerable own data field " + field + ".");
    }
  }
}

function assertOrdinaryArray(
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
}

function assertNoRouteMaterialization(
  value: Record<string, unknown>,
  label: string,
): void {
  for (let index = 0; index < FORBIDDEN_ROUTE_FIELDS.length; index += 1) {
    const field = FORBIDDEN_ROUTE_FIELDS[index];
    if (field in value) {
      throw new Error(label + " cannot materialize route field " + field + ".");
    }
  }
}

const RAW_AUTHORITY: InteriorUnnamedFootwayBranchAccessAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    junctionNodeId: JUNCTION_NODE_ID,
    sourceTopologyAuthorityId:
      "sdz-interior-unnamed-footway-branching-endpoint-topology",
    objectiveBranchAuthorityId:
      "sdz-interior-front-street-objective-branch-selection",
    rejectedCandidateWayId: REJECTED_WAY_ID,
    rejectedCandidateAccess: "no",
    rejectedCandidateReason:
      "PUBLIC_ACCESS_PROHIBITED_BY_EXPLICIT_ACCESS_NO",
    selectedContinuationWayId: SELECTED_WAY_ID,
    selectedContinuationToNodeId: SELECTED_TO_NODE_ID,
    selectedContinuationHighway: "footway",
    selectedContinuationNameStatus: "absent",
    selectedContinuationAccessStatus:
      "no-explicit-access-restriction-captured",
    selectedContinuationFee: "yes",
    selectedContinuationLayer: "-1",
    selectionScope: "objective-only",
    globalBranchSelection: "unresolved",
    plannerMaterialization: "objective-branch-access-selection-only",
  },
];

export function assertInteriorUnnamedFootwayBranchAccessAuthorityIntegrity(
  authorities: readonly InteriorUnnamedFootwayBranchAccessAuthority[],
): void {
  const collectionLabel = "Planner 69 branch-access authority collection";
  const authorityLabel = "Planner 69 branch-access authority";

  assertOrdinaryArray(authorities, 1, collectionLabel);
  const candidate = authorities[0];
  assertPlain(candidate, TOP_LEVEL_FIELDS, authorityLabel);
  assertNoRouteMaterialization(candidate, authorityLabel);

  try {
    STRUCTURED_CLONE(authorities);
  } catch {
    throw new Error(collectionLabel + " cannot be Proxy-backed or otherwise uncloneable.");
  }

  if (
    candidate.id !== AUTHORITY_ID ||
    candidate.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    candidate.junctionNodeId !== JUNCTION_NODE_ID ||
    candidate.sourceTopologyAuthorityId !==
      "sdz-interior-unnamed-footway-branching-endpoint-topology" ||
    candidate.objectiveBranchAuthorityId !==
      "sdz-interior-front-street-objective-branch-selection" ||
    candidate.rejectedCandidateWayId !== REJECTED_WAY_ID ||
    candidate.rejectedCandidateAccess !== "no" ||
    candidate.rejectedCandidateReason !==
      "PUBLIC_ACCESS_PROHIBITED_BY_EXPLICIT_ACCESS_NO" ||
    candidate.selectedContinuationWayId !== SELECTED_WAY_ID ||
    candidate.selectedContinuationToNodeId !== SELECTED_TO_NODE_ID ||
    candidate.selectedContinuationHighway !== "footway" ||
    candidate.selectedContinuationNameStatus !== "absent" ||
    candidate.selectedContinuationAccessStatus !==
      "no-explicit-access-restriction-captured" ||
    candidate.selectedContinuationFee !== "yes" ||
    candidate.selectedContinuationLayer !== "-1" ||
    candidate.selectionScope !== "objective-only" ||
    candidate.globalBranchSelection !== "unresolved" ||
    candidate.plannerMaterialization !==
      "objective-branch-access-selection-only"
  ) {
    throw new Error("Planner 69 branch-access decision drifted.");
  }

  const topology = INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY[0];
  const objectiveSelection = INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0];

  if (
    topology.id !== candidate.sourceTopologyAuthorityId ||
    topology.objectiveSourceRecordId !== candidate.objectiveSourceRecordId ||
    topology.endpointNodeId !== candidate.junctionNodeId ||
    topology.branchSelectionStatus !== "unresolved" ||
    topology.outboundCandidateCount !== 2 ||
    topology.outboundCandidateWayIds[0] !== REJECTED_WAY_ID ||
    topology.outboundCandidateWayIds[1] !== SELECTED_WAY_ID
  ) {
    throw new Error("Planner 69 detached from Planner 68 branching topology.");
  }

  if (
    objectiveSelection.id !== candidate.objectiveBranchAuthorityId ||
    objectiveSelection.objectiveSourceRecordId !==
      candidate.objectiveSourceRecordId ||
    objectiveSelection.officialCorridorRelation !== "access" ||
    objectiveSelection.selectionScope !== "objective-only"
  ) {
    throw new Error("Planner 69 detached from Planner 27 Tiger Trail objective authority.");
  }

  const rejected = topology.connectedWays[1];
  const selected = topology.connectedWays[2];

  if (
    rejected.sourceWayId !== candidate.rejectedCandidateWayId ||
    rejected.sourceAccess !== candidate.rejectedCandidateAccess ||
    rejected.connectionRole !== "outbound-candidate"
  ) {
    throw new Error("Planner 69 rejected branch drifted from Planner 68.");
  }

  if (
    selected.sourceWayId !== candidate.selectedContinuationWayId ||
    selected.sourceHighway !== candidate.selectedContinuationHighway ||
    selected.sourceNameStatus !== candidate.selectedContinuationNameStatus ||
    "sourceName" in selected ||
    "sourceAccess" in selected ||
    selected.sourceFee !== candidate.selectedContinuationFee ||
    selected.sourceLayer !== candidate.selectedContinuationLayer ||
    selected.orderedNodeIds.length !== 2 ||
    selected.orderedNodeIds[0] !== candidate.junctionNodeId ||
    selected.orderedNodeIds[1] !== candidate.selectedContinuationToNodeId ||
    selected.connectionRole !== "outbound-candidate"
  ) {
    throw new Error("Planner 69 selected branch drifted from Planner 68.");
  }
}

assertInteriorUnnamedFootwayBranchAccessAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_UNNAMED_FOOTWAY_BRANCH_ACCESS_AUTHORITY:
  readonly InteriorUnnamedFootwayBranchAccessAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorUnnamedFootwayBranchAccess():
  InteriorUnnamedFootwayBranchAccessAssessment {
  return deepFreeze({
    status: "objective-branch-access-selected",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    junctionNodeId: JUNCTION_NODE_ID,
    rejectedCandidateWayId: REJECTED_WAY_ID,
    selectedContinuationWayId: SELECTED_WAY_ID,
    selectedContinuationToNodeId: SELECTED_TO_NODE_ID,
    selectionScope: "objective-only",
    globalBranchSelection: "unresolved",
    nextGeometryCapture: {
      status: "ready",
      sourceWayId: SELECTED_WAY_ID,
      fromNodeId: JUNCTION_NODE_ID,
      toNodeId: SELECTED_TO_NODE_ID,
    },
    routeEdgeMaterialization: {
      status: "blocked",
      reasons: [
        ROUTE_EDGE_BLOCK_REASONS[0],
        ROUTE_EDGE_BLOCK_REASONS[1],
        ROUTE_EDGE_BLOCK_REASONS[2],
        ROUTE_EDGE_BLOCK_REASONS[3],
        ROUTE_EDGE_BLOCK_REASONS[4],
        ROUTE_EDGE_BLOCK_REASONS[5],
      ],
    },
  });
}
