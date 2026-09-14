import {
  resolveIngressRuntimeActivation,
  type ClosureEvidenceStatus,
  type ExactEdgeAvailabilityEvidence,
  type IngressRuntimeActivationResult,
  type IngressRuntimeOperationalSnapshot,
  type RuntimeEvidenceStatus,
  type TimedRuntimeEvidence,
} from "./zooIngressRuntimeActivation.ts";
import {
  resolveInteriorRuntimeActivation,
  type InteriorExactSegmentAvailabilityEvidence,
  type InteriorRuntimeActivationResult,
  type InteriorRuntimeOperationalSnapshot,
} from "./zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_EXPANDED_ROUTE_GRAPH_DATA,
  INTERIOR_ROUTE_EDGE_BINDING,
} from "./zooInteriorRouteEdgeMaterialization.ts";
import {
  INGRESS_ROUTE_EDGES,
} from "./zooIngressRouteEdgeMaterialization.ts";
import {
  buildRoutingGraph,
  findShortestRoute,
  type RouteRequest,
  type RouteResult,
} from "../planner/routing.ts";

const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const SOURCE_FROM_NODE_ID = "7053320515" as const;
const SOURCE_TO_NODE_ID = "1619736626" as const;
const INTERIOR_ROUTE_EDGE_ID =
  "sdz-interior-tiger-trail-front-street-route-edge" as const;

const SNAPSHOT_FIELDS = [
  "visitDate",
  "zooHours",
  "ingressClosureAdvisement",
  "ingressExactEdgeAvailability",
  "interiorExactSegmentAvailability",
] as const;

const TIMED_EVIDENCE_FIELDS = [
  "evidenceId",
  "status",
  "validForDate",
  "observedAt",
  "expiresAt",
] as const;

const INGRESS_EDGE_EVIDENCE_FIELDS = [
  ...TIMED_EVIDENCE_FIELDS,
  "sourceWayId",
] as const;

const INTERIOR_SEGMENT_EVIDENCE_FIELDS = [
  ...TIMED_EVIDENCE_FIELDS,
  "objectiveSourceRecordId",
  "sourceWayId",
  "sourceFromNodeId",
  "sourceToNodeId",
] as const;

const ROUTE_REQUEST_FIELDS = [
  "fromNodeId",
  "toNodeId",
  "optimize",
  "allowedModes",
  "requireAccessible",
  "requireStroller",
] as const;

export type InteriorExpandedRuntimeOperationalSnapshot = {
  visitDate: string;
  zooHours: TimedRuntimeEvidence<RuntimeEvidenceStatus>;
  ingressClosureAdvisement:
    TimedRuntimeEvidence<ClosureEvidenceStatus>;
  ingressExactEdgeAvailability:
    readonly ExactEdgeAvailabilityEvidence[];
  interiorExactSegmentAvailability:
    readonly InteriorExactSegmentAvailabilityEvidence[];
};

export type InteriorExpandedRuntimeActivationResult = {
  visitDate: string;
  ingress: IngressRuntimeActivationResult;
  interior: InteriorRuntimeActivationResult;
  enabledConditionalEdgeIds: readonly string[];
};

export type InteriorExpandedRuntimeRouteRequest = Omit<
  RouteRequest,
  "enabledConditionalEdgeIds"
>;

export type InteriorExpandedRuntimeRouteResult = {
  activation: InteriorExpandedRuntimeActivationResult;
  route: RouteResult;
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

function assertExactPlainObject(
  value: unknown,
  requiredFields: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(
      `${label} must be a plain object with Object.prototype.`,
    );
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key === "symbol")) {
    throw new Error(`${label} cannot contain symbol fields.`);
  }

  const expected = new Set(requiredFields);
  const stringKeys = ownKeys as string[];
  const unknown = stringKeys
    .filter((key) => !expected.has(key))
    .sort();
  const missing = requiredFields.filter(
    (key) => !Object.hasOwn(value, key),
  );

  if (unknown.length > 0) {
    throw new Error(
      `${label} cannot contain unknown field ${unknown.join(", ")}.`,
    );
  }
  if (missing.length > 0) {
    throw new Error(
      `${label} is missing required field ${missing.join(", ")}.`,
    );
  }

  for (const field of requiredFields) {
    const descriptor = Object.getOwnPropertyDescriptor(
      value,
      field,
    );
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `${label} requires enumerable own data field ${field}.`,
      );
    }
  }
}

function assertOrdinaryDenseArray(
  value: unknown,
  label: string,
): asserts value is unknown[] {
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype
  ) {
    throw new Error(`${label} must be an ordinary array.`);
  }

  const allowedOwnKeys = new Set([
    ...Array.from(
      { length: value.length },
      (_, index) => String(index),
    ),
    "length",
  ]);

  if (
    Reflect.ownKeys(value).some(
      (key) =>
        typeof key !== "string" ||
        !allowedOwnKeys.has(key),
    )
  ) {
    throw new Error(
      `${label} cannot contain extra own properties.`,
    );
  }

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    const descriptor = Object.getOwnPropertyDescriptor(
      value,
      String(index),
    );
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `${label} requires enumerable own data element ${index}.`,
      );
    }
  }
}

function assertRuntimeSnapshot(
  value: unknown,
): asserts value is InteriorExpandedRuntimeOperationalSnapshot {
  assertExactPlainObject(
    value,
    SNAPSHOT_FIELDS,
    "Planner 41 runtime snapshot",
  );

  const snapshot =
    value as unknown as InteriorExpandedRuntimeOperationalSnapshot;

  assertExactPlainObject(
    snapshot.zooHours,
    TIMED_EVIDENCE_FIELDS,
    "Planner 41 Zoo-hours evidence",
  );
  assertExactPlainObject(
    snapshot.ingressClosureAdvisement,
    TIMED_EVIDENCE_FIELDS,
    "Planner 41 ingress closure-advisement evidence",
  );

  assertOrdinaryDenseArray(
    snapshot.ingressExactEdgeAvailability,
    "Planner 41 ingress exact-edge availability evidence",
  );
  for (
    const evidence of
    snapshot.ingressExactEdgeAvailability
  ) {
    assertExactPlainObject(
      evidence,
      INGRESS_EDGE_EVIDENCE_FIELDS,
      "Planner 41 ingress exact-edge availability record",
    );
  }

  assertOrdinaryDenseArray(
    snapshot.interiorExactSegmentAvailability,
    "Planner 41 interior exact-segment availability evidence",
  );
  for (
    const evidence of
    snapshot.interiorExactSegmentAvailability
  ) {
    assertExactPlainObject(
      evidence,
      INTERIOR_SEGMENT_EVIDENCE_FIELDS,
      "Planner 41 interior exact-segment availability record",
    );
  }
}

function assertRuntimeRouteRequest(
  value: unknown,
): asserts value is InteriorExpandedRuntimeRouteRequest {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(
      "Planner 41 route request must be a plain object with Object.prototype.",
    );
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key === "symbol")) {
    throw new Error(
      "Planner 41 route request cannot contain symbol fields.",
    );
  }

  const allowed = new Set<string>(ROUTE_REQUEST_FIELDS);
  const stringKeys = ownKeys as string[];
  const unknown = stringKeys
    .filter((key) => !allowed.has(key))
    .sort();

  if (unknown.length > 0) {
    throw new Error(
      `Planner 41 route request cannot contain caller-controlled field ${unknown.join(", ")}.`,
    );
  }

  for (const required of ["fromNodeId", "toNodeId"] as const) {
    if (!Object.hasOwn(value, required)) {
      throw new Error(
        `Planner 41 route request is missing required field ${required}.`,
      );
    }
  }

  for (const field of stringKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(
      value,
      field,
    );
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `Planner 41 route request requires enumerable own data field ${field}.`,
      );
    }
  }
}

function authoritativeRouteRequest(
  request: InteriorExpandedRuntimeRouteRequest,
  enabledConditionalEdgeIds: readonly string[],
): RouteRequest {
  const result: RouteRequest = {
    fromNodeId: request.fromNodeId,
    toNodeId: request.toNodeId,
    enabledConditionalEdgeIds,
  };

  if (Object.hasOwn(request, "optimize")) {
    result.optimize = request.optimize;
  }
  if (Object.hasOwn(request, "allowedModes")) {
    result.allowedModes = request.allowedModes;
  }
  if (Object.hasOwn(request, "requireAccessible")) {
    result.requireAccessible = request.requireAccessible;
  }
  if (Object.hasOwn(request, "requireStroller")) {
    result.requireStroller = request.requireStroller;
  }

  return result;
}

export function assertInteriorRuntimeActivationIntegrationIntegrity() {
  if (
    INTERIOR_ROUTE_EDGE_BINDING.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    INTERIOR_ROUTE_EDGE_BINDING.sourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_ROUTE_EDGE_BINDING.sourceFromNodeId !==
      SOURCE_FROM_NODE_ID ||
    INTERIOR_ROUTE_EDGE_BINDING.sourceToNodeId !==
      SOURCE_TO_NODE_ID ||
    INTERIOR_ROUTE_EDGE_BINDING.routeEdgeId !==
      INTERIOR_ROUTE_EDGE_ID ||
    INTERIOR_ROUTE_EDGE_BINDING.operationalActivation
      .objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    INTERIOR_ROUTE_EDGE_BINDING.operationalActivation
      .exactSegmentSourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_ROUTE_EDGE_BINDING.operationalActivation
      .sourceFromNodeId !== SOURCE_FROM_NODE_ID ||
    INTERIOR_ROUTE_EDGE_BINDING.operationalActivation
      .sourceToNodeId !== SOURCE_TO_NODE_ID ||
    INTERIOR_ROUTE_EDGE_BINDING.operationalActivation
      .requirements.length !== 2 ||
    INTERIOR_ROUTE_EDGE_BINDING.operationalActivation
      .requirements[0] !== "VISIT_WITHIN_CURRENT_ZOO_HOURS" ||
    INTERIOR_ROUTE_EDGE_BINDING.operationalActivation
      .requirements[1] !==
        "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY"
  ) {
    throw new Error(
      "Planner 41 detached from the qualified Planner 34/40 interior activation binding.",
    );
  }

  const graphEdgeIds = new Set(
    INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.map(
      (edge) => edge.id,
    ),
  );
  const interiorEdge =
    INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.find(
      (edge) => edge.id === INTERIOR_ROUTE_EDGE_ID,
    );

  if (
    !interiorEdge ||
    interiorEdge.status !== "conditional" ||
    !INGRESS_ROUTE_EDGES.every(
      (edge) =>
        edge.status === "conditional" &&
        graphEdgeIds.has(edge.id),
    )
  ) {
    throw new Error(
      "Planner 41 requires the exact Planner 40 expanded conditional graph.",
    );
  }
}

assertInteriorRuntimeActivationIntegrationIntegrity();

export function resolveInteriorExpandedRuntimeActivation(
  snapshot: InteriorExpandedRuntimeOperationalSnapshot,
): InteriorExpandedRuntimeActivationResult {
  assertRuntimeSnapshot(snapshot);

  const ingressSnapshot: IngressRuntimeOperationalSnapshot = {
    visitDate: snapshot.visitDate,
    zooHours: snapshot.zooHours,
    closureAdvisement:
      snapshot.ingressClosureAdvisement,
    exactEdgeAvailability:
      snapshot.ingressExactEdgeAvailability,
  };

  const interiorSnapshot: InteriorRuntimeOperationalSnapshot = {
    visitDate: snapshot.visitDate,
    zooHours: snapshot.zooHours,
    exactSegmentAvailability:
      snapshot.interiorExactSegmentAvailability,
  };

  const ingress = resolveIngressRuntimeActivation(
    ingressSnapshot,
  );
  const interior = resolveInteriorRuntimeActivation(
    OBJECTIVE_SOURCE_RECORD_ID,
    interiorSnapshot,
  );

  if (
    ingress.visitDate !== snapshot.visitDate ||
    (interior.status === "evaluated" &&
      interior.visitDate !== snapshot.visitDate)
  ) {
    throw new Error(
      "Planner 41 runtime resolver visit-date binding drifted.",
    );
  }

  const enabledConditionalEdgeIds = new Set(
    ingress.enabledConditionalEdgeIds,
  );

  if (interior.status === "evaluated") {
    const decision = interior.decision;
    if (
      decision.objectiveSourceRecordId !==
        OBJECTIVE_SOURCE_RECORD_ID ||
      decision.sourceWayId !== SOURCE_WAY_ID ||
      decision.sourceFromNodeId !== SOURCE_FROM_NODE_ID ||
      decision.sourceToNodeId !== SOURCE_TO_NODE_ID
    ) {
      throw new Error(
        "Planner 41 interior runtime decision detached from the Planner 40 RouteEdge binding.",
      );
    }

    if (decision.status === "enabled") {
      enabledConditionalEdgeIds.add(
        INTERIOR_ROUTE_EDGE_ID,
      );
    }
  }

  const graphEdgeIds = new Set(
    INTERIOR_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.map(
      (edge) => edge.id,
    ),
  );
  for (const edgeId of enabledConditionalEdgeIds) {
    if (!graphEdgeIds.has(edgeId)) {
      throw new Error(
        `Planner 41 resolver attempted to enable unknown RouteEdge ${edgeId}.`,
      );
    }
  }

  return deepFreeze({
    visitDate: snapshot.visitDate,
    ingress,
    interior,
    enabledConditionalEdgeIds:
      [...enabledConditionalEdgeIds].sort(),
  });
}

export function routeInteriorExpandedWithRuntimeEvidence(
  snapshot: InteriorExpandedRuntimeOperationalSnapshot,
  request: InteriorExpandedRuntimeRouteRequest,
): InteriorExpandedRuntimeRouteResult {
  assertRuntimeRouteRequest(request);

  // Planner 41 resolves both qualified evidence domains immediately before
  // traversal. Conditional edge IDs are derived only from those resolver
  // decisions; callers never control the activation set.
  const activation =
    resolveInteriorExpandedRuntimeActivation(snapshot);
  const graph = buildRoutingGraph(
    INTERIOR_EXPANDED_ROUTE_GRAPH_DATA,
  );
  const route = findShortestRoute(
    graph,
    authoritativeRouteRequest(
      request,
      activation.enabledConditionalEdgeIds,
    ),
  );

  return deepFreeze({
    activation,
    route,
  });
}
