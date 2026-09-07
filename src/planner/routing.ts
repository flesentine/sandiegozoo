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

type SearchState = {
  nodeId: string;
  distanceMeters: number;
  durationMinutes: number;
  hops: number;
  signature: string;
  nodeIds: string[];
  edges: RoutePathEdge[];
};

export type RoutingGraph = {
  hasNode(nodeId: string): boolean;
  outgoing(nodeId: string): readonly RoutePathEdge[];
};

const ALL_MODES: readonly RouteMode[] = [
  "walk",
  "skyfari",
  "bus",
  "elevator",
  "ada-shuttle",
];

function traversalKey(traversal: Traversal) {
  return [
    traversal.edge.id,
    traversal.fromNodeId,
    traversal.toNodeId,
    traversal.reversed ? "reverse" : "forward",
  ].join("|");
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
    provenance: traversal.edge.provenance,
  };
}

function makeGraph(data: WildRouteDataPackage): {
  nodeIds: Set<string>;
  adjacency: Map<string, Traversal[]>;
} {
  const nodeIds = new Set(data.routeNodes.map((node) => node.id));
  const adjacency = new Map<string, Traversal[]>();

  for (const nodeId of nodeIds) {
    adjacency.set(nodeId, []);
  }

  for (const edge of data.routeEdges) {
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
    traversals.sort((a, b) => traversalKey(a).localeCompare(traversalKey(b)));
  }

  return { nodeIds, adjacency };
}

export function buildRoutingGraph(value: unknown): RoutingGraph {
  assertValidWildRouteData(value);
  const graph = makeGraph(value);

  return {
    hasNode(nodeId: string) {
      return graph.nodeIds.has(nodeId);
    },
    outgoing(nodeId: string) {
      return (graph.adjacency.get(nodeId) ?? []).map(asPathEdge);
    },
  };
}

function internalGraph(value: unknown) {
  assertValidWildRouteData(value);
  return makeGraph(value);
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

  return a.signature.localeCompare(b.signature);
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
  value: unknown,
  request: RouteRequest,
): RouteResult {
  const graph = internalGraph(value);
  const optimize = request.optimize ?? "duration";

  if (!graph.nodeIds.has(request.fromNodeId)) {
    return {
      status: "not-found",
      fromNodeId: request.fromNodeId,
      toNodeId: request.toNodeId,
      reason: "START_NODE_UNKNOWN",
    };
  }

  if (!graph.nodeIds.has(request.toNodeId)) {
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

  const allowedModes = new Set<RouteMode>(
    request.allowedModes ?? ALL_MODES,
  );
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
    signature: "",
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

    const outgoing = graph.adjacency.get(current.nodeId) ?? [];

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

      const pathEdge = asPathEdge(traversal);
      const next: SearchState = {
        nodeId: traversal.toNodeId,
        distanceMeters:
          current.distanceMeters + traversal.edge.distanceMeters,
        durationMinutes:
          current.durationMinutes + traversal.edge.durationMinutes,
        hops: current.hops + 1,
        signature:
          current.signature +
          (current.signature ? ">" : "") +
          traversalKey(traversal),
        nodeIds: [...current.nodeIds, traversal.toNodeId],
        edges: [...current.edges, pathEdge],
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
