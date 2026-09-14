import type {
  RouteEdge,
  WildRouteDataPackage,
} from "../planner/contracts.ts";
import {
  INGRESS_ROUTE_EDGES,
  INGRESS_ROUTE_GRAPH_NODES,
} from "./zooIngressRouteEdgeMaterialization.ts";
import {
  INGRESS_ROUTE_ZONES,
  routeNodeForSourceObjectId,
} from "./zooIngressRouteNodeAuthority.ts";
import {
  INTERIOR_ENDPOINT_ROUTE_NODE,
  INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY,
} from "./zooInteriorEndpointRouteNodeAuthority.ts";
import {
  INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY,
} from "./zooInteriorObjectiveSegmentDistanceAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY,
} from "./zooInteriorPedestrianDirectionAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_MODE_AUTHORITY,
} from "./zooInteriorPedestrianModeAuthority.ts";
import {
  INTERIOR_WALKING_DURATION_AUTHORITY,
} from "./zooInteriorWalkingDurationAuthority.ts";
import {
  INTERIOR_DIFFICULTY_AUTHORITY,
} from "./zooInteriorDifficultyAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorAccessibilityAuthority.ts";
import {
  INTERIOR_OPERATIONAL_STATUS_AUTHORITY,
} from "./zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_PROVENANCE_AUTHORITY,
} from "./zooInteriorProvenanceAuthority.ts";
import {
  INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION,
  assessInteriorRouteEdgeContractCompletion,
} from "./zooInteriorRouteEdgeContractCompletion.ts";

const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const SOURCE_FROM_NODE_ID = "7053320515" as const;
const SOURCE_TO_NODE_ID = "1619736626" as const;
const FROM_ROUTE_NODE_ID =
  "sdz-ingress-node-front-street-route-node" as const;
const TO_ROUTE_NODE_ID =
  "sdz-interior-front-street-node-1619736626-route-node" as const;
const ROUTE_EDGE_ID =
  "sdz-interior-tiger-trail-front-street-route-edge" as const;
const CONTRACT_COMPLETION_ID =
  "sdz-interior-tiger-trail-front-street-route-edge-contract-completion" as const;
const PROVENANCE_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-provenance" as const;
const OPERATIONAL_STATUS_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-operational-status" as const;

const UNRESOLVED_CAPABILITY_EVIDENCE = Object.freeze([
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
] as const);

export type InteriorRouteEdgeBinding = {
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceFromNodeId: typeof SOURCE_FROM_NODE_ID;
  sourceToNodeId: typeof SOURCE_TO_NODE_ID;
  fromRouteNodeId: typeof FROM_ROUTE_NODE_ID;
  toRouteNodeId: typeof TO_ROUTE_NODE_ID;
  routeEdgeId: typeof ROUTE_EDGE_ID;
  contractCompletionId: typeof CONTRACT_COMPLETION_ID;
  provenanceAuthorityId: typeof PROVENANCE_AUTHORITY_ID;
  operationalStatusAuthorityId: typeof OPERATIONAL_STATUS_AUTHORITY_ID;
  capabilityEvidenceState:
    "unresolved-preserved-as-explicit-unknown";
  unresolvedCapabilityEvidence: readonly [
    "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  ];
  operationalActivation: {
    objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
    exactSegmentSourceWayId: typeof SOURCE_WAY_ID;
    sourceFromNodeId: typeof SOURCE_FROM_NODE_ID;
    sourceToNodeId: typeof SOURCE_TO_NODE_ID;
    requirements: readonly [
      "VISIT_WITHIN_CURRENT_ZOO_HOURS",
      "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
    ];
  };
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "route-edge";
};

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

function requireValue<T>(
  value: T | undefined,
  label: string,
): T {
  if (value === undefined) {
    throw new Error(`Planner 40 requires ${label}.`);
  }
  return value;
}

function assertExactSegmentIdentity(
  label: string,
  record: {
    objectiveSourceRecordId: string;
    sourceWayId: string;
    sourceFromNodeId: string;
    sourceToNodeId: string;
  },
) {
  if (
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceFromNodeId !== SOURCE_FROM_NODE_ID ||
    record.sourceToNodeId !== SOURCE_TO_NODE_ID
  ) {
    throw new Error(
      `Planner 40 ${label} detached from the qualified exact segment.`,
    );
  }
}

const fromRouteNode = requireValue(
  routeNodeForSourceObjectId(SOURCE_FROM_NODE_ID),
  "the existing Planner 15 Front Street connection RouteNode",
);
const distance = requireValue(
  INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0],
  "Planner 28 exact distance authority",
);
const direction = requireValue(
  INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY[0],
  "Planner 29 pedestrian direction authority",
);
const mode = requireValue(
  INTERIOR_PEDESTRIAN_MODE_AUTHORITY[0],
  "Planner 30 pedestrian mode authority",
);
const duration = requireValue(
  INTERIOR_WALKING_DURATION_AUTHORITY[0],
  "Planner 31 walking duration authority",
);
const difficulty = requireValue(
  INTERIOR_DIFFICULTY_AUTHORITY[0],
  "Planner 32 difficulty authority",
);
const accessibility = requireValue(
  INTERIOR_ACCESSIBILITY_AUTHORITY[0],
  "Planner 33 accessibility authority",
);
const operationalStatus = requireValue(
  INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0],
  "Planner 34 operational status authority",
);
const contractAssessment =
  assessInteriorRouteEdgeContractCompletion(
    OBJECTIVE_SOURCE_RECORD_ID,
  );

if (contractAssessment.status !== "route-edge-contract-complete") {
  throw new Error(
    "Planner 40 requires Planner 39 route-edge contract completion.",
  );
}

const qualifiedContractAssessment = contractAssessment;

const RAW_ROUTE_EDGE: RouteEdge = {
  id: ROUTE_EDGE_ID,
  fromNodeId: fromRouteNode.id,
  toNodeId: INTERIOR_ENDPOINT_ROUTE_NODE.id,
  mode: mode.mode,
  distanceMeters: distance.distanceMeters,
  durationMinutes: duration.durationMinutes,
  difficulty: difficulty.difficulty,
  stairs: INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.stairsAuthority.value,
  accessible: accessibility.accessible,
  stroller:
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.strollerAuthority.value,
  oneWay: direction.oneWay,
  status: operationalStatus.status,
  provenance: INTERIOR_PROVENANCE_AUTHORITY.provenance,
};

const RAW_BINDING: InteriorRouteEdgeBinding = {
  objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
  sourceWayId: SOURCE_WAY_ID,
  sourceFromNodeId: SOURCE_FROM_NODE_ID,
  sourceToNodeId: SOURCE_TO_NODE_ID,
  fromRouteNodeId: FROM_ROUTE_NODE_ID,
  toRouteNodeId: TO_ROUTE_NODE_ID,
  routeEdgeId: ROUTE_EDGE_ID,
  contractCompletionId: CONTRACT_COMPLETION_ID,
  provenanceAuthorityId: PROVENANCE_AUTHORITY_ID,
  operationalStatusAuthorityId: OPERATIONAL_STATUS_AUTHORITY_ID,
  capabilityEvidenceState:
    "unresolved-preserved-as-explicit-unknown",
  unresolvedCapabilityEvidence:
    [...UNRESOLVED_CAPABILITY_EVIDENCE],
  operationalActivation: {
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    exactSegmentSourceWayId: SOURCE_WAY_ID,
    sourceFromNodeId: SOURCE_FROM_NODE_ID,
    sourceToNodeId: SOURCE_TO_NODE_ID,
    requirements: [...operationalStatus.runtimeRequirements],
  },
  selectionScope: "objective-only",
  globalEndpointSelection: "unresolved",
  plannerMaterialization: "route-edge",
};

const RAW_EXPANDED_ROUTE_NODES = [
  ...INGRESS_ROUTE_GRAPH_NODES,
  INTERIOR_ENDPOINT_ROUTE_NODE,
];

const RAW_EXPANDED_ROUTE_EDGES = [
  ...INGRESS_ROUTE_EDGES,
  RAW_ROUTE_EDGE,
];

const RAW_EXPANDED_ROUTE_GRAPH_DATA: WildRouteDataPackage = {
  schemaVersion: "1",
  zones: [...INGRESS_ROUTE_ZONES],
  places: [],
  routeNodes: RAW_EXPANDED_ROUTE_NODES,
  routeEdges: RAW_EXPANDED_ROUTE_EDGES,
  scheduleEvents: [],
};

export function assertInteriorRouteEdgeMaterializationIntegrity() {
  for (const [label, authority] of [
    ["distance authority", distance],
    ["direction authority", direction],
    ["mode authority", mode],
    ["duration authority", duration],
    ["difficulty authority", difficulty],
    ["accessibility authority", accessibility],
    ["operational-status authority", operationalStatus],
  ] as const) {
    assertExactSegmentIdentity(label, authority);
  }

  if (
    fromRouteNode.id !== FROM_ROUTE_NODE_ID ||
    fromRouteNode.zoneId !== "sdz-zone-san-diego-zoo" ||
    INTERIOR_ENDPOINT_ROUTE_NODE.id !== TO_ROUTE_NODE_ID ||
    INTERIOR_ENDPOINT_ROUTE_NODE.zoneId !== fromRouteNode.zoneId ||
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceObjectId !==
      SOURCE_TO_NODE_ID ||
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.selectionScope !==
      "objective-only" ||
    INTERIOR_ENDPOINT_ROUTE_NODE_AUTHORITY.globalEndpointSelection !==
      "unresolved"
  ) {
    throw new Error(
      "Planner 40 RouteEdge endpoints drifted from the qualified Planner 15/38 RouteNodes.",
    );
  }

  if (
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.id !== CONTRACT_COMPLETION_ID ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.sourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.sourceFromNodeId !==
      SOURCE_FROM_NODE_ID ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.sourceToNodeId !==
      SOURCE_TO_NODE_ID ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.stairsAuthority.value !==
      "unknown" ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.strollerAuthority.value !==
      "unknown" ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.evidenceResolution !==
      "unresolved-preserved" ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.unresolvedEvidenceReasons[0] !==
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.unresolvedEvidenceReasons[1] !==
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED" ||
    INTERIOR_ROUTE_EDGE_CONTRACT_COMPLETION.blockedFields.length !== 0 ||
    qualifiedContractAssessment.routeEdgeMaterialization.status !== "ready"
  ) {
    throw new Error(
      "Planner 40 cannot materialize unless Planner 39 remains complete with unresolved capabilities represented explicitly as unknown.",
    );
  }

  if (
    INTERIOR_PROVENANCE_AUTHORITY.id !== PROVENANCE_AUTHORITY_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.sourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.sourceFromNodeId !== SOURCE_FROM_NODE_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.sourceToNodeId !== SOURCE_TO_NODE_ID ||
    INTERIOR_PROVENANCE_AUTHORITY.provenance.confidence !== "provisional" ||
    INTERIOR_PROVENANCE_AUTHORITY.semanticCompletion !== "blocked" ||
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers[0] !==
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    INTERIOR_PROVENANCE_AUTHORITY.unresolvedSemanticBlockers[1] !==
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED"
  ) {
    throw new Error(
      "Planner 40 must preserve Planner 37 provisional provenance and unresolved evidence lineage.",
    );
  }

  if (
    operationalStatus.id !== OPERATIONAL_STATUS_AUTHORITY_ID ||
    operationalStatus.status !== "conditional" ||
    operationalStatus.activation !== "runtime-check-required" ||
    operationalStatus.runtimeRequirements.length !== 2 ||
    operationalStatus.runtimeRequirements[0] !==
      "VISIT_WITHIN_CURRENT_ZOO_HOURS" ||
    operationalStatus.runtimeRequirements[1] !==
      "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY" ||
    operationalStatus.ingressClosureAdvisementApplicability !==
      "not-interior-segment-authority"
  ) {
    throw new Error(
      "Planner 40 operational binding drifted from Planner 34's exact interior runtime policy.",
    );
  }

  if (
    RAW_ROUTE_EDGE.id !== ROUTE_EDGE_ID ||
    RAW_ROUTE_EDGE.fromNodeId !== FROM_ROUTE_NODE_ID ||
    RAW_ROUTE_EDGE.toNodeId !== TO_ROUTE_NODE_ID ||
    RAW_ROUTE_EDGE.mode !== mode.mode ||
    RAW_ROUTE_EDGE.distanceMeters !== distance.distanceMeters ||
    RAW_ROUTE_EDGE.durationMinutes !== duration.durationMinutes ||
    RAW_ROUTE_EDGE.difficulty !== difficulty.difficulty ||
    RAW_ROUTE_EDGE.stairs !== "unknown" ||
    RAW_ROUTE_EDGE.accessible !== accessibility.accessible ||
    RAW_ROUTE_EDGE.stroller !== "unknown" ||
    RAW_ROUTE_EDGE.oneWay !== direction.oneWay ||
    RAW_ROUTE_EDGE.status !== "conditional" ||
    RAW_ROUTE_EDGE.provenance !== INTERIOR_PROVENANCE_AUTHORITY.provenance
  ) {
    throw new Error(
      "Planner 40 RouteEdge drifted from qualified interior semantic authorities.",
    );
  }

  if (
    RAW_BINDING.routeEdgeId !== RAW_ROUTE_EDGE.id ||
    RAW_BINDING.fromRouteNodeId !== RAW_ROUTE_EDGE.fromNodeId ||
    RAW_BINDING.toRouteNodeId !== RAW_ROUTE_EDGE.toNodeId ||
    RAW_BINDING.capabilityEvidenceState !==
      "unresolved-preserved-as-explicit-unknown" ||
    RAW_BINDING.unresolvedCapabilityEvidence.length !== 2 ||
    RAW_BINDING.unresolvedCapabilityEvidence[0] !==
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    RAW_BINDING.unresolvedCapabilityEvidence[1] !==
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED" ||
    RAW_BINDING.operationalActivation.exactSegmentSourceWayId !==
      SOURCE_WAY_ID ||
    RAW_BINDING.operationalActivation.sourceFromNodeId !==
      SOURCE_FROM_NODE_ID ||
    RAW_BINDING.operationalActivation.sourceToNodeId !==
      SOURCE_TO_NODE_ID ||
    JSON.stringify(RAW_BINDING.operationalActivation.requirements) !==
      JSON.stringify(operationalStatus.runtimeRequirements) ||
    RAW_BINDING.selectionScope !== "objective-only" ||
    RAW_BINDING.globalEndpointSelection !== "unresolved" ||
    RAW_BINDING.plannerMaterialization !== "route-edge"
  ) {
    throw new Error(
      "Planner 40 RouteEdge binding drifted from its operational or evidence boundary.",
    );
  }

  if (
    INGRESS_ROUTE_EDGES.some((edge) => edge.id === RAW_ROUTE_EDGE.id) ||
    INGRESS_ROUTE_GRAPH_NODES.some(
      (node) => node.id === INTERIOR_ENDPOINT_ROUTE_NODE.id,
    ) ||
    new Set(RAW_EXPANDED_ROUTE_NODES.map((node) => node.id)).size !==
      RAW_EXPANDED_ROUTE_NODES.length ||
    new Set(RAW_EXPANDED_ROUTE_EDGES.map((edge) => edge.id)).size !==
      RAW_EXPANDED_ROUTE_EDGES.length
  ) {
    throw new Error(
      "Planner 40 expanded graph introduced duplicate RouteNode or RouteEdge IDs.",
    );
  }
}

assertInteriorRouteEdgeMaterializationIntegrity();

export const INTERIOR_ROUTE_EDGE: RouteEdge =
  deepFreeze(RAW_ROUTE_EDGE);
export const INTERIOR_ROUTE_EDGE_BINDING: InteriorRouteEdgeBinding =
  deepFreeze(RAW_BINDING);
export const INTERIOR_EXPANDED_ROUTE_GRAPH_NODES =
  deepFreeze(RAW_EXPANDED_ROUTE_NODES);
export const INTERIOR_EXPANDED_ROUTE_EDGES =
  deepFreeze(RAW_EXPANDED_ROUTE_EDGES);
export const INTERIOR_EXPANDED_ROUTE_GRAPH_DATA: WildRouteDataPackage =
  deepFreeze(RAW_EXPANDED_ROUTE_GRAPH_DATA);
