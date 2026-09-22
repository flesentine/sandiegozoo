import type {
  RouteEdge,
  WildRouteDataPackage,
} from "../planner/contracts.ts";
import {
  INTERIOR_ENDPOINT_ROUTE_NODE,
} from "./zooInteriorEndpointRouteNodeAuthority.ts";
import {
  INTERIOR_EXPANDED_ROUTE_GRAPH_DATA,
} from "./zooInteriorRouteEdgeMaterialization.ts";
import {
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE,
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY,
} from "./zooInteriorTreetopsEndpointRouteNodeAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY,
} from "./zooInteriorTreetopsPedestrianModeAuthority.ts";
import {
  INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY,
} from "./zooInteriorTreetopsSegmentDistanceAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY,
} from "./zooInteriorTreetopsPedestrianDirectionAuthority.ts";
import {
  INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY,
} from "./zooInteriorTreetopsWalkingDurationAuthority.ts";
import {
  INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY,
} from "./zooInteriorTreetopsDifficultyAuthority.ts";
import {
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorTreetopsAccessibilityAuthority.ts";
import {
  INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY,
} from "./zooInteriorTreetopsOperationalStatusAuthority.ts";
import {
  INTERIOR_TREETOPS_PROVENANCE_AUTHORITY,
} from "./zooInteriorTreetopsProvenanceAuthority.ts";
import {
  INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION,
  assessInteriorTreetopsRouteEdgeContractCompletion,
} from "./zooInteriorTreetopsRouteEdgeContractCompletion.ts";

const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const SOURCE_FROM_NODE_ID = "1619736626" as const;
const SOURCE_TO_NODE_ID = "13588159626" as const;
const FROM_ROUTE_NODE_ID =
  "sdz-interior-front-street-node-1619736626-route-node" as const;
const TO_ROUTE_NODE_ID =
  "sdz-interior-treetops-node-13588159626-route-node" as const;
const ROUTE_EDGE_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-route-edge" as const;
const CONTRACT_COMPLETION_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-route-edge-contract-completion" as const;
const PROVENANCE_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-provenance" as const;
const OPERATIONAL_STATUS_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-operational-status" as const;

const UNRESOLVED_CAPABILITY_EVIDENCE = Object.freeze([
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
] as const);

export type InteriorTreetopsRouteEdgeBinding = {
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
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
    sourceWayVersion: typeof SOURCE_WAY_VERSION;
    sourceFromNodeId: typeof SOURCE_FROM_NODE_ID;
    sourceToNodeId: typeof SOURCE_TO_NODE_ID;
    requirements: readonly [
      "VISIT_WITHIN_CURRENT_ZOO_HOURS",
      "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
    ];
  };
  plannerMaterialization: "route-edge";
};

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
  const snapshot = Object.create(null) as Record<PropertyKey, unknown>;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor) {
      Object.defineProperty(snapshot, key, descriptor);
    }
  }
  return snapshot as T;
}

function requireValue<T>(
  value: T | undefined,
  label: string,
): T {
  if (value === undefined) {
    throw new Error(`Planner 57 requires ${label}.`);
  }
  return value;
}

function assertExactSegmentIdentity(
  label: string,
  record: {
    objectiveSourceRecordId: string;
    sourceWayId: string;
    sourceWayVersion?: number;
    sourceFromNodeId: string;
    sourceToNodeId: string;
  },
): void {
  if (
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    (record.sourceWayVersion !== undefined &&
      record.sourceWayVersion !== SOURCE_WAY_VERSION) ||
    record.sourceFromNodeId !== SOURCE_FROM_NODE_ID ||
    record.sourceToNodeId !== SOURCE_TO_NODE_ID
  ) {
    throw new Error(
      `Planner 57 ${label} detached from the qualified exact Treetops segment.`,
    );
  }
}

const mode = requireValue(
  INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0],
  "Planner 45 Treetops pedestrian mode authority",
);
const distance = requireValue(
  INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0],
  "Planner 46 Treetops segment distance authority",
);
const direction = requireValue(
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY[0],
  "Planner 47 Treetops direction authority",
);
const duration = requireValue(
  INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0],
  "Planner 48 Treetops duration authority",
);
const difficulty = requireValue(
  INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY[0],
  "Planner 49 Treetops difficulty authority",
);
const accessibility = requireValue(
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0],
  "Planner 50 Treetops accessibility authority",
);
const operational = requireValue(
  INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0],
  "Planner 51 Treetops operational-status authority",
);
const contractAssessment =
  assessInteriorTreetopsRouteEdgeContractCompletion(
    OBJECTIVE_SOURCE_RECORD_ID,
  );

if (contractAssessment.status !== "route-edge-contract-complete") {
  throw new Error(
    "Planner 57 requires Planner 56 Treetops RouteEdge contract completion.",
  );
}
const qualifiedContractAssessment = contractAssessment;

const RAW_ROUTE_EDGE = nullPrototypeRecord<RouteEdge>({
  id: ROUTE_EDGE_ID,
  fromNodeId: FROM_ROUTE_NODE_ID,
  toNodeId: TO_ROUTE_NODE_ID,
  mode: mode.mode,
  distanceMeters: distance.distanceMeters,
  durationMinutes: duration.durationMinutes,
  difficulty: difficulty.difficulty,
  stairs:
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.stairsAuthority.value,
  accessible: accessibility.accessible,
  stroller:
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.strollerAuthority.value,
  oneWay: direction.oneWay,
  status: operational.status,
  provenance: INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.provenance,
});

const RAW_BINDING =
  nullPrototypeRecord<InteriorTreetopsRouteEdgeBinding>({
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
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
    unresolvedCapabilityEvidence: [...UNRESOLVED_CAPABILITY_EVIDENCE],
    operationalActivation: nullPrototypeRecord({
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      exactSegmentSourceWayId: SOURCE_WAY_ID,
      sourceWayVersion: SOURCE_WAY_VERSION,
      sourceFromNodeId: SOURCE_FROM_NODE_ID,
      sourceToNodeId: SOURCE_TO_NODE_ID,
      requirements: [...operational.runtimeRequirements],
    }),
    plannerMaterialization: "route-edge",
  });

const RAW_EXPANDED_ROUTE_NODES = [
  ...INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.routeNodes,
  INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE,
];

const RAW_EXPANDED_ROUTE_EDGES = [
  ...INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.routeEdges,
  RAW_ROUTE_EDGE,
];

const RAW_EXPANDED_ROUTE_GRAPH_DATA =
  nullPrototypeRecord<WildRouteDataPackage>({
    schemaVersion: INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.schemaVersion,
    zones: [...INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.zones],
    places: [...INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.places],
    routeNodes: RAW_EXPANDED_ROUTE_NODES,
    routeEdges: RAW_EXPANDED_ROUTE_EDGES,
    scheduleEvents: [...INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.scheduleEvents],
  });

export function assertInteriorTreetopsRouteEdgeMaterializationIntegrity(): void {
  for (const [label, authority] of [
    ["mode authority", mode],
    ["distance authority", distance],
    ["direction authority", direction],
    ["duration authority", duration],
    ["difficulty authority", difficulty],
    ["accessibility authority", accessibility],
    ["operational-status authority", operational],
  ] as const) {
    assertExactSegmentIdentity(label, authority);
  }

  if (
    INTERIOR_ENDPOINT_ROUTE_NODE.id !== FROM_ROUTE_NODE_ID ||
    INTERIOR_ENDPOINT_ROUTE_NODE.kind !== "junction" ||
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.id !== TO_ROUTE_NODE_ID ||
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.kind !== "junction" ||
    INTERIOR_ENDPOINT_ROUTE_NODE.zoneId !==
      INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.zoneId ||
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceWayId !==
      SOURCE_WAY_ID ||
    INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE_AUTHORITY.sourceObjectId !==
      SOURCE_TO_NODE_ID
  ) {
    throw new Error(
      "Planner 57 RouteEdge endpoints drifted from the qualified RouteNodes.",
    );
  }

  if (
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.id !==
      CONTRACT_COMPLETION_ID ||
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.sourceWayId !==
      SOURCE_WAY_ID ||
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.sourceWayVersion !==
      SOURCE_WAY_VERSION ||
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.sourceFromNodeId !==
      SOURCE_FROM_NODE_ID ||
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.sourceToNodeId !==
      SOURCE_TO_NODE_ID ||
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.stairsAuthority.value !==
      "unknown" ||
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.strollerAuthority.value !==
      "unknown" ||
    INTERIOR_TREETOPS_ROUTE_EDGE_CONTRACT_COMPLETION.blockedFields.length !==
      0 ||
    qualifiedContractAssessment.routeEdgeMaterialization.status !== "ready"
  ) {
    throw new Error(
      "Planner 57 cannot materialize unless Planner 56 remains contract-complete.",
    );
  }

  if (
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.id !==
      PROVENANCE_AUTHORITY_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceWayVersion !==
      SOURCE_WAY_VERSION ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceFromNodeId !==
      SOURCE_FROM_NODE_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.sourceToNodeId !==
      SOURCE_TO_NODE_ID ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.provenance.confidence !==
      "provisional" ||
    INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.semanticCompletion !== "blocked"
  ) {
    throw new Error(
      "Planner 57 must preserve Planner 54 provisional provenance.",
    );
  }

  if (
    operational.id !== OPERATIONAL_STATUS_AUTHORITY_ID ||
    operational.status !== "conditional" ||
    operational.activation !== "runtime-check-required" ||
    operational.runtimeRequirements.length !== 2 ||
    operational.runtimeRequirements[0] !==
      "VISIT_WITHIN_CURRENT_ZOO_HOURS" ||
    operational.runtimeRequirements[1] !==
      "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY"
  ) {
    throw new Error(
      "Planner 57 operational binding drifted from Planner 51.",
    );
  }

  if (
    RAW_ROUTE_EDGE.id !== ROUTE_EDGE_ID ||
    RAW_ROUTE_EDGE.fromNodeId !== FROM_ROUTE_NODE_ID ||
    RAW_ROUTE_EDGE.toNodeId !== TO_ROUTE_NODE_ID ||
    RAW_ROUTE_EDGE.mode !== "walk" ||
    RAW_ROUTE_EDGE.distanceMeters !== 48.615 ||
    RAW_ROUTE_EDGE.durationMinutes !== 0.675 ||
    RAW_ROUTE_EDGE.difficulty !== "easy" ||
    RAW_ROUTE_EDGE.stairs !== "unknown" ||
    RAW_ROUTE_EDGE.accessible !== true ||
    RAW_ROUTE_EDGE.stroller !== "unknown" ||
    RAW_ROUTE_EDGE.oneWay !== false ||
    RAW_ROUTE_EDGE.status !== "conditional" ||
    RAW_ROUTE_EDGE.provenance !==
      INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.provenance
  ) {
    throw new Error(
      "Planner 57 RouteEdge drifted from qualified Treetops semantics.",
    );
  }

  for (const record of [
    RAW_ROUTE_EDGE as object,
    RAW_BINDING as object,
    RAW_BINDING.operationalActivation as object,
    RAW_EXPANDED_ROUTE_GRAPH_DATA as object,
  ]) {
    if (Object.getPrototypeOf(record) !== null) {
      throw new Error(
        "Planner 57 exported records must remain isolated from Object.prototype.",
      );
    }
  }

  if (
    RAW_BINDING.routeEdgeId !== RAW_ROUTE_EDGE.id ||
    RAW_BINDING.fromRouteNodeId !== RAW_ROUTE_EDGE.fromNodeId ||
    RAW_BINDING.toRouteNodeId !== RAW_ROUTE_EDGE.toNodeId ||
    RAW_BINDING.capabilityEvidenceState !==
      "unresolved-preserved-as-explicit-unknown" ||
    RAW_BINDING.unresolvedCapabilityEvidence[0] !==
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    RAW_BINDING.unresolvedCapabilityEvidence[1] !==
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED" ||
    JSON.stringify(RAW_BINDING.operationalActivation.requirements) !==
      JSON.stringify(operational.runtimeRequirements) ||
    RAW_BINDING.plannerMaterialization !== "route-edge"
  ) {
    throw new Error(
      "Planner 57 RouteEdge binding drifted from its evidence boundary.",
    );
  }

  const oldNodeIds = new Set(
    INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.routeNodes.map((node) => node.id),
  );
  const oldEdgeIds = new Set(
    INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.map((edge) => edge.id),
  );

  if (
    oldNodeIds.has(INTERIOR_TREETOPS_ENDPOINT_ROUTE_NODE.id) ||
    oldEdgeIds.has(RAW_ROUTE_EDGE.id) ||
    !oldNodeIds.has(FROM_ROUTE_NODE_ID) ||
    new Set(RAW_EXPANDED_ROUTE_NODES.map((node) => node.id)).size !==
      RAW_EXPANDED_ROUTE_NODES.length ||
    new Set(RAW_EXPANDED_ROUTE_EDGES.map((edge) => edge.id)).size !==
      RAW_EXPANDED_ROUTE_EDGES.length
  ) {
    throw new Error(
      "Planner 57 expanded graph introduced duplicate or detached graph IDs.",
    );
  }
}

assertInteriorTreetopsRouteEdgeMaterializationIntegrity();

export const INTERIOR_TREETOPS_ROUTE_EDGE: RouteEdge =
  deepFreeze(RAW_ROUTE_EDGE);
export const INTERIOR_TREETOPS_ROUTE_EDGE_BINDING:
  InteriorTreetopsRouteEdgeBinding =
    deepFreeze(RAW_BINDING);
export const INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_NODES =
  deepFreeze(RAW_EXPANDED_ROUTE_NODES);
export const INTERIOR_TREETOPS_EXPANDED_ROUTE_EDGES =
  deepFreeze(RAW_EXPANDED_ROUTE_EDGES);
export const INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA:
  WildRouteDataPackage =
    deepFreeze(RAW_EXPANDED_ROUTE_GRAPH_DATA);
