import type {
  RouteEdge,
  SourceProvenance,
  WildRouteDataPackage,
} from "../planner/contracts.ts";
import {
  INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS,
  assessIngressRouteEdgeReadiness,
  type RouteEdgeSemanticAudit,
} from "./zooIngressEdgeSemanticsAuthority.ts";
import {
  INGRESS_ROUTE_NODES,
  INGRESS_ROUTE_ZONES,
} from "./zooIngressRouteNodeAuthority.ts";
import {
  pedestrianDirectionSourceForWay,
} from "./zooIngressPedestrianDirectionAuthority.ts";

export type IngressRouteEdgeBinding = {
  targetId: string;
  sourceWayId: string;
  semanticAuditId: string;
  routeEdgeId: string;
  operationalActivation: {
    exactEdgeSourceWayId: string;
    requirements: readonly [
      "VISIT_WITHIN_CURRENT_ZOO_HOURS",
      "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
      "AFFIRMATIVE_CURRENT_EXACT_EDGE_AVAILABILITY",
    ];
  };
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

function sourceDate(observedAt: string) {
  return observedAt.slice(0, 10);
}

function routeEdgeIdForAudit(
  audit: RouteEdgeSemanticAudit,
) {
  if (!audit.id.endsWith("-route-edge-audit")) {
    throw new Error(
      `Planner 23 cannot derive a stable RouteEdge ID from audit ${audit.id}.`,
    );
  }
  return audit.id.replace(
    /-route-edge-audit$/,
    "-route-edge",
  );
}

function provenanceForAudit(
  audit: RouteEdgeSemanticAudit,
): SourceProvenance {
  const snapshot =
    pedestrianDirectionSourceForWay(
      audit.sourceWayId,
    );

  if (!snapshot) {
    throw new Error(
      `Planner 23 requires the Planner 16 source snapshot for way ${audit.sourceWayId}.`,
    );
  }

  return {
    sourceUrl: audit.sourceUrl,
    sourceLabel:
      `OpenStreetMap way ${audit.sourceWayId} with qualified WildRoute ingress semantics`,
    lastVerified: snapshot.observedAt,
    confidence: "provisional",
    effectiveFrom:
      sourceDate(snapshot.observedAt),
  };
}

function materializeAudit(
  audit: RouteEdgeSemanticAudit,
): {
  edge: RouteEdge;
  binding: IngressRouteEdgeBinding;
} {
  const readiness =
    assessIngressRouteEdgeReadiness(
      audit.targetId,
    );

  if (
    readiness.status !==
      "route-edge-contract-complete" ||
    readiness.routeEdgeMaterialization
      .status !== "ready"
  ) {
    throw new Error(
      `Planner 23 cannot materialize RouteEdge for incomplete target ${audit.targetId}.`,
    );
  }

  if (
    audit.difficultyAuthority.status !==
      "supported" ||
    audit.stairsAuthority.status !==
      "supported" ||
    audit.accessibleAuthority.status !==
      "supported" ||
    audit.strollerAuthority.status !==
      "supported" ||
    audit.oneWayAuthority.status !==
      "supported" ||
    audit.edgeStatusAuthority.status !==
      "supported"
  ) {
    throw new Error(
      `Planner 23 requires fully representable semantic authority for audit ${audit.id}.`,
    );
  }

  const routeEdgeId =
    routeEdgeIdForAudit(audit);

  return {
    edge: {
      id: routeEdgeId,
      fromNodeId:
        audit.routeNodesAuthority.value
          .fromNodeId,
      toNodeId:
        audit.routeNodesAuthority.value
          .toNodeId,
      mode: audit.modeAuthority.value,
      distanceMeters:
        audit.distanceAuthority.value,
      durationMinutes:
        audit.durationAuthority.value,
      difficulty:
        audit.difficultyAuthority.value,
      stairs:
        audit.stairsAuthority.value,
      accessible:
        audit.accessibleAuthority.value,
      stroller:
        audit.strollerAuthority.value,
      oneWay:
        audit.oneWayAuthority.oneWay,
      status:
        audit.edgeStatusAuthority.value,
      provenance:
        provenanceForAudit(audit),
    },
    binding: {
      targetId: audit.targetId,
      sourceWayId: audit.sourceWayId,
      semanticAuditId: audit.id,
      routeEdgeId,
      operationalActivation: {
        exactEdgeSourceWayId:
          audit.edgeStatusAuthority.activation
            .exactEdgeSourceWayId,
        requirements:
          audit.edgeStatusAuthority.activation
            .requirements,
      },
      plannerMaterialization:
        "route-edge",
    },
  };
}

const RAW_MATERIALIZATIONS =
  INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.map(
    materializeAudit,
  );

const RAW_ROUTE_EDGES =
  RAW_MATERIALIZATIONS.map(
    (materialization) =>
      materialization.edge,
  );

const RAW_BINDINGS =
  RAW_MATERIALIZATIONS.map(
    (materialization) =>
      materialization.binding,
  );

const RAW_GRAPH_NODE_IDS = new Set(
  RAW_ROUTE_EDGES.flatMap((edge) => [
    edge.fromNodeId,
    edge.toNodeId,
  ]),
);

const RAW_GRAPH_ROUTE_NODES =
  INGRESS_ROUTE_NODES.filter(
    (node) =>
      RAW_GRAPH_NODE_IDS.has(node.id),
  );

if (
  RAW_GRAPH_ROUTE_NODES.length !==
    RAW_GRAPH_NODE_IDS.size
) {
  throw new Error(
    "Planner 23 ingress graph is missing a materialized RouteEdge endpoint node.",
  );
}

export function assertIngressRouteEdgeMaterializationIntegrity(
  edges: readonly RouteEdge[],
  bindings:
    readonly IngressRouteEdgeBinding[],
) {
  if (
    edges.length !==
      INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.length ||
    bindings.length !==
      INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.length
  ) {
    throw new Error(
      "Planner 23 requires exactly one RouteEdge and binding per semantic audit.",
    );
  }

  const edgeIds = new Set<string>();
  const sourceWayIds = new Set<string>();

  for (
    const audit of
    INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS
  ) {
    const expected =
      materializeAudit(audit);
    const edge = edges.find(
      (candidate) =>
        candidate.id ===
        expected.edge.id,
    );
    const binding = bindings.find(
      (candidate) =>
        candidate.routeEdgeId ===
        expected.edge.id,
    );

    if (
      !edge ||
      !binding ||
      edgeIds.has(edge.id) ||
      sourceWayIds.has(
        binding.sourceWayId,
      ) ||
      JSON.stringify(edge) !==
        JSON.stringify(expected.edge) ||
      JSON.stringify(binding) !==
        JSON.stringify(expected.binding)
    ) {
      throw new Error(
        `Planner 23 RouteEdge materialization drifted for audit ${audit.id}.`,
      );
    }

    if (
      edge.status !== "conditional" ||
      edge.difficulty !== "unknown" ||
      edge.stairs !== "unknown" ||
      edge.accessible !== "unknown" ||
      edge.stroller !== "unknown" ||
      edge.oneWay !== false ||
      edge.provenance.confidence !==
        "provisional" ||
      binding.operationalActivation
        .exactEdgeSourceWayId !==
        binding.sourceWayId
    ) {
      throw new Error(
        `Planner 23 RouteEdge ${edge.id} lost its conservative production semantics.`,
      );
    }

    edgeIds.add(edge.id);
    sourceWayIds.add(
      binding.sourceWayId,
    );
  }

  if (
    edgeIds.size !==
      INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.length ||
    sourceWayIds.size !==
      INGRESS_ROUTE_EDGE_SEMANTIC_AUDITS.length
  ) {
    throw new Error(
      "Planner 23 RouteEdge materialization coverage is incomplete.",
    );
  }
}

assertIngressRouteEdgeMaterializationIntegrity(
  RAW_ROUTE_EDGES,
  RAW_BINDINGS,
);

export const INGRESS_ROUTE_EDGES:
  readonly RouteEdge[] =
  deepFreeze(RAW_ROUTE_EDGES);

export const INGRESS_ROUTE_EDGE_BINDINGS:
  readonly IngressRouteEdgeBinding[] =
  deepFreeze(RAW_BINDINGS);

export const INGRESS_ROUTE_GRAPH_NODES =
  deepFreeze(RAW_GRAPH_ROUTE_NODES);

export const INGRESS_ROUTE_GRAPH_DATA:
  WildRouteDataPackage =
  deepFreeze({
    schemaVersion: "1",
    zones: [...INGRESS_ROUTE_ZONES],
    places: [],
    routeNodes:
      [...INGRESS_ROUTE_GRAPH_NODES],
    routeEdges: [...INGRESS_ROUTE_EDGES],
    scheduleEvents: [],
  });

export function ingressRouteEdgeForSourceWay(
  sourceWayId: string,
) {
  const binding =
    INGRESS_ROUTE_EDGE_BINDINGS.find(
      (candidate) =>
        candidate.sourceWayId ===
        sourceWayId,
    );
  if (!binding) return undefined;

  return INGRESS_ROUTE_EDGES.find(
    (edge) =>
      edge.id === binding.routeEdgeId,
  );
}
