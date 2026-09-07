import type {
  RouteDifficulty,
  RouteEdge,
  RouteMode,
  SourceProvenance,
  WildRouteDataPackage,
} from "./contracts";
import { assertValidWildRouteData } from "./validation.ts";

export type RouteOptimization = "duration" | "distance";

export type RouteRequest = {
  fromNodeId: string;
  toNodeId: string;
  optimize?: RouteOptimization;
  allowedModes?: readonly RouteMode[];
  requireAccessible?: boolean;
  requireStroller?: boolean;
  enabledConditionalEdgeIds?: readonly string[];
};

export type RoutePathEdge = {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  reversed: boolean;
  mode: RouteMode;
  difficulty: RouteDifficulty;
  status: RouteEdge["status"];
  distanceMeters: number;
  durationMinutes: number;
  provenance: SourceProvenance;
};

export type RouteFound = {
  status: "found";
  fromNodeId: string;
  toNodeId: string;
  optimize: RouteOptimization;
  nodeIds: string[];
  edges: RoutePathEdge[];
  distanceMeters: number;
  durationMinutes: number;
};

export type RouteFailureReason =
  | "START_NODE_UNKNOWN"
  | "END_NODE_UNKNOWN"
  | "NO_ROUTE";

export type RouteNotFound = {
  status: "not-found";
  fromNodeId: string;
  toNodeId: string;
  reason: RouteFailureReason;
};

export type RouteResult = RouteFound | RouteNotFound;

type Traversal = {
  edge: RouteEdge;
  fromNodeId: string;
  toNodeId: string;
  reversed: boolean;
};

type InternalGraph = {
  nodeIds: Set<string>;
  adjacency: Map<string, Traversal[]>;
};

type SearchState = {
  nodeId: string;
  distanceMeters: number;
  durationMinutes: number;
  hops: number;
  signature: string[];
  nodeIds: string[];
  edges: RoutePathEdge[];
};

export type RoutingGraph = {
  hasNode(nodeId: string): boolean;
  declaredOutgoing(nodeId: string): readonly RoutePathEdge[];
};

const graphInternals = new WeakMap<object, InternalGraph>();

const COST_PRECISION = 1_000_000_000;

const ALL_MODES: readonly RouteMode[] = [
  "walk",
  "skyfari",
  "bus",
  "elevator",
  "ada-shuttle",
];

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function traversalSignature(traversal: Traversal) {
  return JSON.stringify([
    traversal.edge.id,
    traversal.fromNodeId,
    traversal.toNodeId,
    traversal.reversed ? "reverse" : "forward",
  ]);
}

function compareSignatures(a: readonly string[], b: readonly string[]) {
  const length = Math.min(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const compared = compareText(a[index], b[index]);
    if (compared !== 0) return compared;
  }

  return a.length < b.length ? -1 : a.length > b.length ? 1 : 0;
}

function cloneProvenance(
  provenance: SourceProvenance,
): SourceProvenance {
  return { ...provenance };
}

function snapshotEdge(edge: RouteEdge): RouteEdge {
  return {
    ...edge,
    provenance: Object.freeze(cloneProvenance(edge.provenance)),
  };
}

function normalizedCost(value: number) {
  return Math.round(value * COST_PRECISION) / COST_PRECISION;
}

function addCost(a: number, b: number) {
  return normalizedCost(a + b);
}

function asPathEdge(traversal: Traversal): RoutePathEdge {
  return {
    edgeId: traversal.edge.id,
    fromNodeId: traversal.fromNodeId,
    toNodeId: traversal.toNodeId,
    reversed: traversal.reversed,
    mode: traversal.edge.mode,
    difficulty: traversal.edge.difficulty,
    status: traversal.edge.status,
    distanceMeters: traversal.edge.distanceMeters,
    durationMinutes: traversal.edge.durationMinutes,
    provenance: cloneProvenance(traversal.edge.provenance),
  };
}

function makeGraph(data: WildRouteDataPackage): InternalGraph {
  const nodeIds = new Set(data.routeNodes.map((node) => node.id));
  const adjacency = new Map<string, Traversal[]>();

  for (const nodeId of nodeIds) {
    adjacency.set(nodeId, []);
  }

  for (const sourceEdge of data.routeEdges) {
    const edge = Object.freeze(snapshotEdge(sourceEdge));

    adjacency.get(edge.fromNodeId)!.push({
      edge,
      fromNodeId: edge.fromNodeId,
      toNodeId: edge.toNodeId,
      reversed: false,
    });

    if (!edge.oneWay) {
      adjacency.get(edge.toNodeId)!.push({
        edge,
        fromNodeId: edge.toNodeId,
        toNodeId: edge.fromNodeId,
        reversed: true,
      });
    }
  }

  for (const traversals of adjacency.values()) {
    traversals.sort((a, b) =>
      compareText(traversalSignature(a), traversalSignature(b)),
    );
  }

  return { nodeIds, adjacency };
}

export function assertCompiledRoutingGraph(
  value: unknown,
): asserts value is RoutingGraph {
  if (
    !value ||
    typeof value !== "object" ||
    !graphInternals.has(value as object)
  ) {
    throw new Error(
      "RoutingGraph must be created by buildRoutingGraph before routing.",
    );
  }
}

export function buildRoutingGraph(value: unknown): RoutingGraph {
  assertValidWildRouteData(value);
  const internal = makeGraph(value);

  const graph: RoutingGraph = {
    hasNode(nodeId: string) {
      return internal.nodeIds.has(nodeId);
    },
    declaredOutgoing(nodeId: string) {
      return (internal.adjacency.get(nodeId) ?? []).map(asPathEdge);
    },
  };

  Object.freeze(graph);
  graphInternals.set(graph, internal);
  return graph;
}

function getInternalGraph(graph: RoutingGraph) {
  assertCompiledRoutingGraph(graph);
  return graphInternals.get(graph as object)!;
}

function compareNumber(a: number, b: number) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareStates(
  a: SearchState,
  b: SearchState,
  optimize: RouteOptimization,
) {
  const primary =
    optimize === "duration"
      ? compareNumber(a.durationMinutes, b.durationMinutes)
      : compareNumber(a.distanceMeters, b.distanceMeters);
  if (primary !== 0) return primary;

  const secondary =
    optimize === "duration"
      ? compareNumber(a.distanceMeters, b.distanceMeters)
      : compareNumber(a.durationMinutes, b.durationMinutes);
  if (secondary !== 0) return secondary;

  const hops = compareNumber(a.hops, b.hops);
  if (hops !== 0) return hops;

  return compareSignatures(a.signature, b.signature);
}

function traversalAllowed(
  traversal: Traversal,
  allowedModes: ReadonlySet<RouteMode>,
  requireAccessible: boolean,
  requireStroller: boolean,
  enabledConditionalEdgeIds: ReadonlySet<string>,
) {
  const edge = traversal.edge;

  if (edge.status === "closed") return false;

  if (
    edge.status === "conditional" &&
    !enabledConditionalEdgeIds.has(edge.id)
  ) {
    return false;
  }

  if (!allowedModes.has(edge.mode)) return false;
  if (requireAccessible && !edge.accessible) return false;
  if (requireStroller && !edge.stroller) return false;

  return true;
}

export function findShortestRoute(
  graph: RoutingGraph,
  request: RouteRequest,
): RouteResult {
  const internal = getInternalGraph(graph);
  const optimize = request.optimize ?? "duration";

  if (!internal.nodeIds.has(request.fromNodeId)) {
    return {
      status: "not-found",
      fromNodeId: request.fromNodeId,
      toNodeId: request.toNodeId,
      reason: "START_NODE_UNKNOWN",
    };
  }

  if (!internal.nodeIds.has(request.toNodeId)) {
    return {
      status: "not-found",
      fromNodeId: request.fromNodeId,
      toNodeId: request.toNodeId,
      reason: "END_NODE_UNKNOWN",
    };
  }

  if (request.fromNodeId === request.toNodeId) {
    return {
      status: "found",
      fromNodeId: request.fromNodeId,
      toNodeId: request.toNodeId,
      optimize,
      nodeIds: [request.fromNodeId],
      edges: [],
      distanceMeters: 0,
      durationMinutes: 0,
    };
  }

  const allowedModes = new Set<RouteMode>(request.allowedModes ?? ALL_MODES);
  const enabledConditionalEdgeIds = new Set(
    request.enabledConditionalEdgeIds ?? [],
  );
  const requireAccessible = request.requireAccessible ?? false;
  const requireStroller = request.requireStroller ?? false;

  const start: SearchState = {
    nodeId: request.fromNodeId,
    distanceMeters: 0,
    durationMinutes: 0,
    hops: 0,
    signature: [],
    nodeIds: [request.fromNodeId],
    edges: [],
  };

  const best = new Map<string, SearchState>([[start.nodeId, start]]);
  const queue: SearchState[] = [start];

  while (queue.length > 0) {
    queue.sort((a, b) => compareStates(a, b, optimize));
    const current = queue.shift()!;
    const currentBest = best.get(current.nodeId);

    if (!currentBest || compareStates(current, currentBest, optimize) !== 0) {
      continue;
    }

    if (current.nodeId === request.toNodeId) {
      return {
        status: "found",
        fromNodeId: request.fromNodeId,
        toNodeId: request.toNodeId,
        optimize,
        nodeIds: current.nodeIds,
        edges: current.edges,
        distanceMeters: current.distanceMeters,
        durationMinutes: current.durationMinutes,
      };
    }

    const outgoing = internal.adjacency.get(current.nodeId) ?? [];

    for (const traversal of outgoing) {
      if (
        !traversalAllowed(
          traversal,
          allowedModes,
          requireAccessible,
          requireStroller,
          enabledConditionalEdgeIds,
        )
      ) {
        continue;
      }

      const next: SearchState = {
        nodeId: traversal.toNodeId,
        distanceMeters: addCost(
          current.distanceMeters,
          traversal.edge.distanceMeters,
        ),
        durationMinutes: addCost(
          current.durationMinutes,
          traversal.edge.durationMinutes,
        ),
        hops: current.hops + 1,
        signature: [
          ...current.signature,
          traversalSignature(traversal),
        ],
        nodeIds: [...current.nodeIds, traversal.toNodeId],
        edges: [...current.edges, asPathEdge(traversal)],
      };

      const previous = best.get(next.nodeId);

      if (!previous || compareStates(next, previous, optimize) < 0) {
        best.set(next.nodeId, next);
        queue.push(next);
      }
    }
  }

  return {
    status: "not-found",
    fromNodeId: request.fromNodeId,
    toNodeId: request.toNodeId,
    reason: "NO_ROUTE",
  };
}
