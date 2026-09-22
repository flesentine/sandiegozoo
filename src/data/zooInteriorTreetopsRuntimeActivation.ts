import {
  resolveInteriorExpandedRuntimeActivation,
  type InteriorExpandedRuntimeActivationResult,
  type InteriorExpandedRuntimeOperationalSnapshot,
  type InteriorExpandedRuntimeRouteRequest,
} from "./zooInteriorRuntimeActivation.ts";
import {
  zooOperationalDateAt,
  type ClosureEvidenceStatus,
  type ExactEdgeAvailabilityEvidence,
  type RuntimeEvidenceStatus,
  type TimedRuntimeEvidence,
} from "./zooIngressRuntimeActivation.ts";
import {
  type InteriorExactSegmentAvailabilityEvidence,
  type InteriorRuntimeActivationReason,
} from "./zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY,
} from "./zooInteriorTreetopsOperationalStatusAuthority.ts";
import {
  INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA,
  INTERIOR_TREETOPS_ROUTE_EDGE,
  INTERIOR_TREETOPS_ROUTE_EDGE_BINDING,
} from "./zooInteriorTreetopsRouteEdgeMaterialization.ts";
import {
  buildRoutingGraph,
  findShortestRoute,
  type RouteRequest,
  type RouteResult,
} from "../planner/routing.ts";

const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const SOURCE_FROM_NODE_ID = "1619736626" as const;
const SOURCE_TO_NODE_ID = "13588159626" as const;
const TREETOPS_ROUTE_EDGE_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-route-edge" as const;

const SNAPSHOT_FIELDS = [
  "visitDate",
  "zooHours",
  "ingressClosureAdvisement",
  "ingressExactEdgeAvailability",
  "interiorExactSegmentAvailability",
  "treetopsExactSegmentAvailability",
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

const TREETOPS_SEGMENT_EVIDENCE_FIELDS = [
  ...TIMED_EVIDENCE_FIELDS,
  "objectiveSourceRecordId",
  "sourceWayId",
  "sourceWayVersion",
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

export type InteriorTreetopsExactSegmentAvailabilityStatus =
  | "available"
  | "unavailable"
  | "unknown";

export type InteriorTreetopsExactSegmentAvailabilityEvidence =
  TimedRuntimeEvidence<InteriorTreetopsExactSegmentAvailabilityStatus> & {
    objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
    sourceWayId: typeof SOURCE_WAY_ID;
    sourceWayVersion: typeof SOURCE_WAY_VERSION;
    sourceFromNodeId: typeof SOURCE_FROM_NODE_ID;
    sourceToNodeId: typeof SOURCE_TO_NODE_ID;
  };

export type InteriorTreetopsExpandedRuntimeOperationalSnapshot =
  InteriorExpandedRuntimeOperationalSnapshot & {
    treetopsExactSegmentAvailability:
      readonly InteriorTreetopsExactSegmentAvailabilityEvidence[];
  };

export type InteriorTreetopsRuntimeActivationDecision = {
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceFromNodeId: typeof SOURCE_FROM_NODE_ID;
  sourceToNodeId: typeof SOURCE_TO_NODE_ID;
  routeEdgeId: typeof TREETOPS_ROUTE_EDGE_ID;
  status: "enabled" | "disabled";
  reason: InteriorRuntimeActivationReason;
  evidenceIds: readonly string[];
  effectiveExpiresAt?: string;
};

export type InteriorTreetopsRuntimeActivation = {
  status: "evaluated";
  visitDate: string;
  evaluatedAt: string;
  decision: InteriorTreetopsRuntimeActivationDecision;
};

export type InteriorTreetopsExpandedRuntimeActivationResult = {
  visitDate: string;
  prior: InteriorExpandedRuntimeActivationResult;
  treetops: InteriorTreetopsRuntimeActivation;
  enabledConditionalEdgeIds: readonly string[];
};

export type InteriorTreetopsExpandedRuntimeRouteResult = {
  activation: InteriorTreetopsExpandedRuntimeActivationResult;
  route: RouteResult;
};

type TrustedTreetopsSnapshot = {
  base: InteriorExpandedRuntimeOperationalSnapshot;
  zooHours: TimedRuntimeEvidence<RuntimeEvidenceStatus>;
  treetopsExactSegmentAvailability:
    readonly InteriorTreetopsExactSegmentAvailabilityEvidence[];
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

function defineOwnEnumerableDataProperty(
  target: Record<string, unknown>,
  field: string,
  value: unknown,
): void {
  Object.defineProperty(target, field, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

function snapshotExactPlainObject(
  value: unknown,
  requiredFields: readonly string[],
  label: string,
): Readonly<Record<string, unknown>> {
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
  const actual = new Set(stringKeys);
  const unknown = stringKeys
    .filter((key) => !expected.has(key))
    .sort();
  const missing = requiredFields.filter(
    (key) => !actual.has(key),
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

  const snapshot: Record<string, unknown> = {};
  for (const field of requiredFields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `${label} requires enumerable own data field ${field}.`,
      );
    }
    Object.defineProperty(snapshot, field, {
      value: descriptor.value,
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }

  return Object.freeze(snapshot);
}

function snapshotOrdinaryDenseArray(
  value: unknown,
  label: string,
): readonly unknown[] {
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype
  ) {
    throw new Error(`${label} must be an ordinary array.`);
  }

  const lengthDescriptor =
    Object.getOwnPropertyDescriptor(value, "length");
  if (
    !lengthDescriptor ||
    !("value" in lengthDescriptor) ||
    !Number.isInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < 0
  ) {
    throw new Error(
      `${label} requires an ordinary array length.`,
    );
  }
  const length = lengthDescriptor.value as number;
  const ownKeys = Reflect.ownKeys(value);

  if (ownKeys.some((key) => typeof key !== "string")) {
    throw new Error(
      `${label} cannot contain extra own properties.`,
    );
  }

  const stringKeys = ownKeys as string[];
  if (!stringKeys.includes("length")) {
    throw new Error(
      `${label} requires an ordinary array length.`,
    );
  }

  const indexKeys = stringKeys.filter((key) => key !== "length");
  if (indexKeys.length !== length) {
    throw new Error(
      `${label} must be a dense ordinary array.`,
    );
  }

  const snapshot = new Array<unknown>(length);
  for (const key of indexKeys) {
    const index = Number(key);
    if (
      !Number.isSafeInteger(index) ||
      index < 0 ||
      index >= length ||
      String(index) !== key
    ) {
      throw new Error(
        `${label} cannot contain extra own properties.`,
      );
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `${label} requires enumerable own data element ${index}.`,
      );
    }
    Object.defineProperty(snapshot, key, {
      value: descriptor.value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }

  return Object.freeze(snapshot);
}

function validDate(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function validTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(
      value,
    );
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour =
    match[10] === undefined ? 0 : Number(match[10]);
  const offsetMinute =
    match[11] === undefined ? 0 : Number(match[11]);

  if (
    month < 1 ||
    month > 12 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59 ||
    offsetHour < 0 ||
    offsetHour > 14 ||
    offsetMinute < 0 ||
    offsetMinute > 59 ||
    (offsetHour === 14 && offsetMinute !== 0)
  ) {
    return false;
  }

  const leapYear =
    year % 4 === 0 &&
    (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];

  return (
    day >= 1 &&
    day <= daysInMonth &&
    Number.isFinite(Date.parse(value))
  );
}

function stableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function assertTimedEvidence(
  label: string,
  evidence: TimedRuntimeEvidence<string>,
): void {
  if (!stableId(evidence.evidenceId)) {
    throw new Error(
      `${label} evidenceId must be a stable non-empty string.`,
    );
  }
  if (!validDate(evidence.validForDate)) {
    throw new Error(
      `${label} validForDate must be a real YYYY-MM-DD date.`,
    );
  }
  if (
    !validTimestamp(evidence.observedAt) ||
    !validTimestamp(evidence.expiresAt)
  ) {
    throw new Error(
      `${label} observedAt/expiresAt must be ISO timestamps with timezone.`,
    );
  }
  if (
    Date.parse(evidence.expiresAt) <=
    Date.parse(evidence.observedAt)
  ) {
    throw new Error(
      `${label} expiresAt must be later than observedAt.`,
    );
  }
}

function evidenceCurrent(
  evidence: TimedRuntimeEvidence<string>,
  visitDate: string,
  nowMs: number,
): boolean {
  return (
    evidence.validForDate === visitDate &&
    Date.parse(evidence.observedAt) <= nowMs &&
    nowMs <= Date.parse(evidence.expiresAt)
  );
}

function earliestExpiry(
  evidence: readonly TimedRuntimeEvidence<string>[],
): string {
  return evidence
    .map((item) => item.expiresAt)
    .sort((a, b) => Date.parse(a) - Date.parse(b))[0];
}

function snapshotRuntimeSnapshot(
  value: unknown,
): TrustedTreetopsSnapshot {
  const topLevel = snapshotExactPlainObject(
    value,
    SNAPSHOT_FIELDS,
    "Planner 58 runtime snapshot",
  );

  const zooHours = snapshotExactPlainObject(
    topLevel.zooHours,
    TIMED_EVIDENCE_FIELDS,
    "Planner 58 Zoo-hours evidence",
  ) as unknown as TimedRuntimeEvidence<RuntimeEvidenceStatus>;

  const ingressClosureAdvisement = snapshotExactPlainObject(
    topLevel.ingressClosureAdvisement,
    TIMED_EVIDENCE_FIELDS,
    "Planner 58 ingress closure-advisement evidence",
  ) as unknown as TimedRuntimeEvidence<ClosureEvidenceStatus>;

  const rawIngressAvailability = snapshotOrdinaryDenseArray(
    topLevel.ingressExactEdgeAvailability,
    "Planner 58 ingress exact-edge availability evidence",
  );
  const ingressExactEdgeAvailability = Object.freeze(
    rawIngressAvailability.map(
      (evidence) =>
        snapshotExactPlainObject(
          evidence,
          INGRESS_EDGE_EVIDENCE_FIELDS,
          "Planner 58 ingress exact-edge availability record",
        ) as unknown as ExactEdgeAvailabilityEvidence,
    ),
  );

  const rawInteriorAvailability = snapshotOrdinaryDenseArray(
    topLevel.interiorExactSegmentAvailability,
    "Planner 58 prior interior exact-segment availability evidence",
  );
  const interiorExactSegmentAvailability = Object.freeze(
    rawInteriorAvailability.map(
      (evidence) =>
        snapshotExactPlainObject(
          evidence,
          INTERIOR_SEGMENT_EVIDENCE_FIELDS,
          "Planner 58 prior interior exact-segment availability record",
        ) as unknown as InteriorExactSegmentAvailabilityEvidence,
    ),
  );

  const rawTreetopsAvailability = snapshotOrdinaryDenseArray(
    topLevel.treetopsExactSegmentAvailability,
    "Planner 58 Treetops exact-segment availability evidence",
  );
  if (rawTreetopsAvailability.length > 1) {
    throw new Error(
      "Planner 58 Treetops exact-segment availability cannot duplicate the qualified segment.",
    );
  }

  const treetopsExactSegmentAvailability = Object.freeze(
    rawTreetopsAvailability.map((candidate) => {
      const evidence = snapshotExactPlainObject(
        candidate,
        TREETOPS_SEGMENT_EVIDENCE_FIELDS,
        "Planner 58 Treetops exact-segment availability record",
      ) as unknown as InteriorTreetopsExactSegmentAvailabilityEvidence;

      if (
        !["available", "unavailable", "unknown"].includes(
          evidence.status,
        )
      ) {
        throw new Error(
          "Planner 58 Treetops exact-segment availability status is invalid.",
        );
      }
      assertTimedEvidence(
        "Planner 58 Treetops exact-segment availability",
        evidence,
      );

      if (
        evidence.objectiveSourceRecordId !==
          OBJECTIVE_SOURCE_RECORD_ID ||
        evidence.sourceWayId !== SOURCE_WAY_ID ||
        evidence.sourceWayVersion !== SOURCE_WAY_VERSION ||
        evidence.sourceFromNodeId !== SOURCE_FROM_NODE_ID ||
        evidence.sourceToNodeId !== SOURCE_TO_NODE_ID
      ) {
        throw new Error(
          "Planner 58 Treetops availability references an unknown exact segment.",
        );
      }

      return evidence;
    }),
  );

  const base = Object.freeze({
    visitDate: topLevel.visitDate as string,
    zooHours,
    ingressClosureAdvisement,
    ingressExactEdgeAvailability,
    interiorExactSegmentAvailability,
  });

  return Object.freeze({
    base,
    zooHours,
    treetopsExactSegmentAvailability,
  });
}

function snapshotRuntimeRouteRequest(
  value: unknown,
): InteriorExpandedRuntimeRouteRequest {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(
      "Planner 58 route request must be a plain object with Object.prototype.",
    );
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key === "symbol")) {
    throw new Error(
      "Planner 58 route request cannot contain symbol fields.",
    );
  }

  const allowed = new Set<string>(ROUTE_REQUEST_FIELDS);
  const stringKeys = ownKeys as string[];
  const actual = new Set(stringKeys);
  const unknown = stringKeys
    .filter((key) => !allowed.has(key))
    .sort();

  if (unknown.length > 0) {
    throw new Error(
      `Planner 58 route request cannot contain caller-controlled field ${unknown.join(", ")}.`,
    );
  }

  for (const required of ["fromNodeId", "toNodeId"] as const) {
    if (!actual.has(required)) {
      throw new Error(
        `Planner 58 route request is missing required field ${required}.`,
      );
    }
  }

  const captured = Object.create(null) as Record<string, unknown>;
  for (const field of stringKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `Planner 58 route request requires enumerable own data field ${field}.`,
      );
    }

    const capturedValue =
      field === "allowedModes"
        ? snapshotOrdinaryDenseArray(
            descriptor.value,
            "Planner 58 route request allowedModes",
          )
        : descriptor.value;

    defineOwnEnumerableDataProperty(
      captured,
      field,
      capturedValue,
    );
  }

  const trusted = Object.create(null) as Record<string, unknown>;
  defineOwnEnumerableDataProperty(
    trusted,
    "fromNodeId",
    captured.fromNodeId,
  );
  defineOwnEnumerableDataProperty(
    trusted,
    "toNodeId",
    captured.toNodeId,
  );

  for (const optional of [
    "optimize",
    "allowedModes",
    "requireAccessible",
    "requireStroller",
  ] as const) {
    if (actual.has(optional)) {
      defineOwnEnumerableDataProperty(
        trusted,
        optional,
        captured[optional],
      );
    }
  }

  return Object.freeze(
    trusted,
  ) as unknown as InteriorExpandedRuntimeRouteRequest;
}

function authoritativeRouteRequest(
  request: InteriorExpandedRuntimeRouteRequest,
  enabledConditionalEdgeIds: readonly string[],
): RouteRequest {
  const result = Object.create(null) as RouteRequest;
  const record = result as unknown as Record<string, unknown>;

  defineOwnEnumerableDataProperty(
    record,
    "fromNodeId",
    request.fromNodeId,
  );
  defineOwnEnumerableDataProperty(
    record,
    "toNodeId",
    request.toNodeId,
  );
  defineOwnEnumerableDataProperty(
    record,
    "enabledConditionalEdgeIds",
    enabledConditionalEdgeIds,
  );

  for (const optional of [
    "optimize",
    "allowedModes",
    "requireAccessible",
    "requireStroller",
  ] as const) {
    if (Object.hasOwn(request, optional)) {
      defineOwnEnumerableDataProperty(
        record,
        optional,
        request[optional],
      );
    }
  }

  return result;
}

export function assertInteriorTreetopsRuntimeActivationIntegrationIntegrity(): void {
  const operational =
    INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0];
  const graphEdgeIds = new Set(
    INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.map(
      (edge) => edge.id,
    ),
  );

  if (
    !operational ||
    operational.sourceWayId !== SOURCE_WAY_ID ||
    operational.sourceWayVersion !== SOURCE_WAY_VERSION ||
    operational.sourceFromNodeId !== SOURCE_FROM_NODE_ID ||
    operational.sourceToNodeId !== SOURCE_TO_NODE_ID ||
    operational.status !== "conditional" ||
    operational.activation !== "runtime-check-required" ||
    operational.runtimeRequirements.length !== 2 ||
    operational.runtimeRequirements[0] !==
      "VISIT_WITHIN_CURRENT_ZOO_HOURS" ||
    operational.runtimeRequirements[1] !==
      "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY"
  ) {
    throw new Error(
      "Planner 58 detached from Planner 51 operational requirements.",
    );
  }

  if (
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.routeEdgeId !==
      TREETOPS_ROUTE_EDGE_ID ||
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.sourceWayId !==
      SOURCE_WAY_ID ||
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.sourceWayVersion !==
      SOURCE_WAY_VERSION ||
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.sourceFromNodeId !==
      SOURCE_FROM_NODE_ID ||
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.sourceToNodeId !==
      SOURCE_TO_NODE_ID ||
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.operationalActivation
      .exactSegmentSourceWayId !== SOURCE_WAY_ID ||
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.operationalActivation
      .sourceWayVersion !== SOURCE_WAY_VERSION ||
    INTERIOR_TREETOPS_ROUTE_EDGE_BINDING.operationalActivation
      .requirements.length !== 2
  ) {
    throw new Error(
      "Planner 58 detached from Planner 57 Treetops RouteEdge binding.",
    );
  }

  if (
    INTERIOR_TREETOPS_ROUTE_EDGE.status !== "conditional" ||
    !graphEdgeIds.has(TREETOPS_ROUTE_EDGE_ID)
  ) {
    throw new Error(
      "Planner 58 requires the exact Planner 57 conditional Treetops graph.",
    );
  }
}

assertInteriorTreetopsRuntimeActivationIntegrationIntegrity();

export function resolveInteriorTreetopsExpandedRuntimeActivation(
  snapshot: InteriorTreetopsExpandedRuntimeOperationalSnapshot,
): InteriorTreetopsExpandedRuntimeActivationResult {
  const trusted = snapshotRuntimeSnapshot(snapshot);
  const prior = resolveInteriorExpandedRuntimeActivation(
    trusted.base,
  );

  const nowMs = Date.now();
  const visitDate = trusted.base.visitDate;
  const evaluatedAt = new Date(nowMs).toISOString();
  const currentZooDate = zooOperationalDateAt(nowMs);
  const segmentEvidence =
    trusted.treetopsExactSegmentAvailability[0];

  let reason: InteriorRuntimeActivationReason;

  if (visitDate !== currentZooDate) {
    reason = "VISIT_DATE_NOT_CURRENT_ZOO_DATE";
  } else if (trusted.zooHours.status !== "inside") {
    reason = "HOURS_NOT_CONFIRMED";
  } else if (
    !evidenceCurrent(
      trusted.zooHours,
      visitDate,
      nowMs,
    )
  ) {
    reason = "HOURS_EVIDENCE_NOT_CURRENT";
  } else if (!segmentEvidence) {
    reason = "SEGMENT_AVAILABILITY_MISSING";
  } else if (segmentEvidence.status !== "available") {
    reason = "SEGMENT_AVAILABILITY_NOT_CONFIRMED";
  } else if (
    !evidenceCurrent(
      segmentEvidence,
      visitDate,
      nowMs,
    )
  ) {
    reason = "SEGMENT_AVAILABILITY_NOT_CURRENT";
  } else {
    reason = "ENABLED";
  }

  const enabled = reason === "ENABLED";
  const evidenceIds = [
    trusted.zooHours.evidenceId,
    ...(segmentEvidence
      ? [segmentEvidence.evidenceId]
      : []),
  ];

  const decision =
    nullPrototypeRecord<InteriorTreetopsRuntimeActivationDecision>({
      objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
      sourceWayId: SOURCE_WAY_ID,
      sourceWayVersion: SOURCE_WAY_VERSION,
      sourceFromNodeId: SOURCE_FROM_NODE_ID,
      sourceToNodeId: SOURCE_TO_NODE_ID,
      routeEdgeId: TREETOPS_ROUTE_EDGE_ID,
      status: enabled ? "enabled" : "disabled",
      reason,
      evidenceIds,
      ...(enabled && segmentEvidence
        ? {
            effectiveExpiresAt: earliestExpiry([
              trusted.zooHours,
              segmentEvidence,
            ]),
          }
        : {}),
    });

  const treetops = deepFreeze(
    nullPrototypeRecord<InteriorTreetopsRuntimeActivation>({
      status: "evaluated",
      visitDate,
      evaluatedAt,
      decision,
    }),
  );

  const enabledConditionalEdgeIds = new Set(
    prior.enabledConditionalEdgeIds,
  );
  if (enabled) {
    enabledConditionalEdgeIds.add(
      TREETOPS_ROUTE_EDGE_ID,
    );
  }

  const graphEdgeIds = new Set(
    INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA.routeEdges.map(
      (edge) => edge.id,
    ),
  );
  for (const edgeId of enabledConditionalEdgeIds) {
    if (!graphEdgeIds.has(edgeId)) {
      throw new Error(
        `Planner 58 resolver attempted to enable unknown RouteEdge ${edgeId}.`,
      );
    }
  }

  return deepFreeze(
    nullPrototypeRecord<InteriorTreetopsExpandedRuntimeActivationResult>({
      visitDate,
      prior,
      treetops,
      enabledConditionalEdgeIds:
        [...enabledConditionalEdgeIds].sort(),
    }),
  );
}

export function routeInteriorTreetopsExpandedWithRuntimeEvidence(
  snapshot: InteriorTreetopsExpandedRuntimeOperationalSnapshot,
  request: InteriorExpandedRuntimeRouteRequest,
): InteriorTreetopsExpandedRuntimeRouteResult {
  const trustedRequest =
    snapshotRuntimeRouteRequest(request);
  const activation =
    resolveInteriorTreetopsExpandedRuntimeActivation(snapshot);
  const graph = buildRoutingGraph(
    INTERIOR_TREETOPS_EXPANDED_ROUTE_GRAPH_DATA,
  );
  const route = findShortestRoute(
    graph,
    authoritativeRouteRequest(
      trustedRequest,
      activation.enabledConditionalEdgeIds,
    ),
  );

  return deepFreeze(
    nullPrototypeRecord<InteriorTreetopsExpandedRuntimeRouteResult>({
      activation,
      route,
    }),
  );
}
