import type {
  DayPreferences,
  Pace,
} from "../planning/dayPreferences.ts";
import type {
  AnimalPriority,
  ExperiencePriority,
  PriorityPreferences,
} from "../planning/priorityPreferences.ts";
import type { VisitPreferences } from "../planning/visitPreferences.ts";
import type {
  PlaceRecord,
  RouteEdge,
  RouteMode,
  RouteNode,
  ScheduleEvent,
  WildRouteDataPackage,
} from "./contracts.ts";
import {
  buildOptimizerGroups,
  type OptimizerCandidate,
  type OptimizerRequest,
} from "./optimizer.ts";
import {
  policyFromAnimalPriority,
  policyFromExperiencePriority,
} from "./scoring.ts";
import {
  buildShowCandidateSets,
  createLockedAnchor,
  createPlanningHorizon,
} from "./scheduling.ts";
import { buildRoutingGraph } from "./routing.ts";
import {
  runOptimizerQualification,
  type OptimizerQualificationReport,
  type QualificationThresholds,
} from "./qualification.ts";
import { assertValidWildRouteData } from "./validation.ts";

export type AnimalCandidateBinding = {
  placeId: string;
  dwellMinutes: number;
};

export type ExperienceCandidateBinding = {
  activityId: string;
  dwellMinutes?: number;
};

export type ReservationCandidateBinding = {
  placeId: string;
  durationMinutes: number;
};

export type CandidateIntegrationBindings = {
  animals: Readonly<Record<string, AnimalCandidateBinding>>;
  experiences: Readonly<Record<string, ExperienceCandidateBinding>>;
  reservation?: ReservationCandidateBinding;
};

export type ConditionalEdgeRuntimeTrust = {
  authority:
    "qualified-runtime-conditional-edge-activation";
  visitDate: string;
  evaluatedAt: string;
  edgeIds: readonly string[];
};

export type CandidateIntegrationInput = {
  data: unknown;
  visit: VisitPreferences;
  day: DayPreferences;
  priorities: PriorityPreferences;
  initialNodeId: string;
  endNodeId?: string;
  bindings: CandidateIntegrationBindings;
  enabledConditionalEdgeIds?: readonly string[];
  conditionalEdgeRuntimeTrust?:
    ConditionalEdgeRuntimeTrust;
};

export type CandidateIntegrationIssueSeverity = "error" | "warning";

export type CandidateIntegrationIssueCode =
  | "VISIT_HORIZON_INVALID"
  | "INITIAL_NODE_UNKNOWN"
  | "END_NODE_UNKNOWN"
  | "INITIAL_NODE_UNVERIFIED"
  | "END_NODE_UNVERIFIED"
  | "INITIAL_NODE_OUTSIDE_EFFECTIVE_RANGE"
  | "END_NODE_OUTSIDE_EFFECTIVE_RANGE"
  | "ANIMAL_BINDING_REQUIRED"
  | "ANIMAL_PLACE_UNKNOWN"
  | "ANIMAL_PLACE_KIND_MISMATCH"
  | "ANIMAL_PLACE_UNVERIFIED"
  | "ANIMAL_PLACE_OUTSIDE_EFFECTIVE_RANGE"
  | "ANIMAL_PLACE_COLLISION"
  | "EXPERIENCE_BINDING_REQUIRED"
  | "EXPERIENCE_ACTIVITY_COLLISION"
  | "EXPERIENCE_SCHEDULE_MISSING"
  | "EXPERIENCE_PERFORMANCE_UNVERIFIED"
  | "EXPERIENCE_PERFORMANCE_OUTSIDE_EFFECTIVE_RANGE"
  | "EXPERIENCE_NO_TRUSTED_PERFORMANCE"
  | "RESERVATION_INCOMPLETE"
  | "RESERVATION_BINDING_REQUIRED"
  | "RESERVATION_PLACE_UNKNOWN"
  | "RESERVATION_PLACE_UNVERIFIED"
  | "RESERVATION_PLACE_OUTSIDE_EFFECTIVE_RANGE"
  | "RESERVATION_ANCHOR_INVALID"
  | "CONDITIONAL_EDGE_UNKNOWN"
  | "CONDITIONAL_EDGE_NOT_CONDITIONAL"
  | "CONDITIONAL_EDGE_UNTRUSTED"
  | "CONDITIONAL_EDGE_RUNTIME_TRUST_DATE_MISMATCH"
  | "CONDITIONAL_EDGE_RUNTIME_TRUST_UNKNOWN"
  | "CONDITIONAL_EDGE_RUNTIME_TRUST_NOT_CONDITIONAL"
  | "CONDITIONAL_EDGE_RUNTIME_TRUST_PROVENANCE_UNKNOWN"
  | "ROUTING_DATA_GATED";

export type CandidateIntegrationIssue = {
  severity: CandidateIntegrationIssueSeverity;
  code: CandidateIntegrationIssueCode;
  selectionKey?: string;
  sourceId?: string;
  message: string;
};

export type CandidateIntegrationRoutingGate = {
  disabledUnverifiedEdgeIds: string[];
};

export type CandidateIntegrationReady = {
  status: "ready";
  request: OptimizerRequest;
  candidates: OptimizerCandidate[];
  issues: CandidateIntegrationIssue[];
  excludedSelectionKeys: string[];
  routingGate: CandidateIntegrationRoutingGate;
};

export type CandidateIntegrationBlocked = {
  status: "blocked";
  candidates: OptimizerCandidate[];
  issues: CandidateIntegrationIssue[];
  excludedSelectionKeys: string[];
  routingGate: CandidateIntegrationRoutingGate;
};

export type CandidateIntegrationResult =
  | CandidateIntegrationReady
  | CandidateIntegrationBlocked;

export type QualifiedCandidateIntegration =
  | {
      status: "integration-blocked";
      integration: CandidateIntegrationBlocked;
    }
  | {
      status: "qualified" | "not-qualified";
      integration: CandidateIntegrationReady;
      report: OptimizerQualificationReport;
    };

const ANIMAL_PRIORITIES: readonly AnimalPriority[] = [
  "none",
  "favorite",
  "must",
];
const EXPERIENCE_PRIORITIES: readonly ExperiencePriority[] = [
  "none",
  "interested",
  "must",
];
const PACES: readonly Pace[] = ["relaxed", "balanced", "maximize"];
const ALL_ROUTE_MODES: readonly RouteMode[] = [
  "walk",
  "skyfari",
  "bus",
  "elevator",
  "ada-shuttle",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function positiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

function assertPriorityRecord(
  value: unknown,
  allowed: readonly string[],
  label: string,
) {
  if (!isRecord(value)) {
    throw new Error(`${label} priorities must be an object.`);
  }

  for (const [id, priority] of Object.entries(value)) {
    if (!stableId(id)) {
      throw new Error(`${label} priority ID must be stable and non-empty.`);
    }

    if (
      typeof priority !== "string" ||
      !allowed.includes(priority)
    ) {
      throw new Error(`${label} priority is invalid for ${id}.`);
    }
  }
}

function assertVisitPreferences(value: unknown): asserts value is VisitPreferences {
  if (!isRecord(value)) {
    throw new Error("VisitPreferences must be an object.");
  }

  for (const key of [
    "date",
    "arrival",
    "departure",
  ] as const) {
    if (typeof value[key] !== "string") {
      throw new Error(`VisitPreferences ${key} must be a string.`);
    }
  }

  for (const key of [
    "stroller",
    "easyPaths",
    "wheelchair",
  ] as const) {
    if (typeof value[key] !== "boolean") {
      throw new Error(`VisitPreferences ${key} must be boolean.`);
    }
  }

  if (!isRecord(value.reservation)) {
    throw new Error("VisitPreferences reservation must be an object.");
  }

  if (
    typeof value.reservation.name !== "string" ||
    typeof value.reservation.time !== "string"
  ) {
    throw new Error(
      "VisitPreferences reservation name/time must be strings.",
    );
  }
}

function assertDayPreferences(value: unknown): asserts value is DayPreferences {
  if (!isRecord(value)) {
    throw new Error("DayPreferences must be an object.");
  }

  if (
    typeof value.pace !== "string" ||
    !PACES.includes(value.pace as Pace)
  ) {
    throw new Error("DayPreferences pace is invalid.");
  }

  if (typeof value.useSkyfari !== "boolean") {
    throw new Error("DayPreferences useSkyfari must be boolean.");
  }
}

function assertBindings(
  value: unknown,
): asserts value is CandidateIntegrationBindings {
  if (!isRecord(value)) {
    throw new Error("Candidate integration bindings must be an object.");
  }

  if (!isRecord(value.animals) || !isRecord(value.experiences)) {
    throw new Error(
      "Candidate integration animal/experience bindings must be objects.",
    );
  }

  for (const [id, raw] of Object.entries(value.animals)) {
    if (!stableId(id) || !isRecord(raw)) {
      throw new Error("Animal candidate binding is invalid.");
    }

    if (!stableId(raw.placeId) || !positiveInteger(raw.dwellMinutes)) {
      throw new Error(
        `Animal binding ${id} requires stable placeId and positive integer dwellMinutes.`,
      );
    }
  }

  for (const [id, raw] of Object.entries(value.experiences)) {
    if (!stableId(id) || !isRecord(raw)) {
      throw new Error("Experience candidate binding is invalid.");
    }

    if (!stableId(raw.activityId)) {
      throw new Error(
        `Experience binding ${id} requires a stable activityId.`,
      );
    }

    if (
      raw.dwellMinutes !== undefined &&
      !positiveInteger(raw.dwellMinutes)
    ) {
      throw new Error(
        `Experience binding ${id} dwellMinutes must be a positive integer when provided.`,
      );
    }
  }

  if (value.reservation !== undefined) {
    if (
      !isRecord(value.reservation) ||
      !stableId(value.reservation.placeId) ||
      !positiveInteger(value.reservation.durationMinutes)
    ) {
      throw new Error(
        "Reservation binding requires stable placeId and positive integer durationMinutes.",
      );
    }
  }
}

function assertConditionalEdgeIds(value: unknown) {
  if (value === undefined) return;

  if (!Array.isArray(value)) {
    throw new Error(
      "enabledConditionalEdgeIds must be an array when provided.",
    );
  }

  const seen = new Set<string>();
  for (const edgeId of value) {
    if (!stableId(edgeId)) {
      throw new Error(
        "enabledConditionalEdgeIds must contain stable non-empty strings.",
      );
    }
    if (seen.has(edgeId)) {
      throw new Error(
        "enabledConditionalEdgeIds cannot contain duplicates.",
      );
    }
    seen.add(edgeId);
  }
}

function validRuntimeTimestamp(value: unknown) {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  );
}

function validRuntimeVisitDate(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }
  const parsed = new Date(
    `${value}T00:00:00Z`,
  );
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) ===
      value
  );
}

function assertConditionalEdgeRuntimeTrust(
  value: unknown,
) {
  if (value === undefined) return;
  if (!isRecord(value)) {
    throw new Error(
      "conditionalEdgeRuntimeTrust must be an object when provided.",
    );
  }
  if (
    value.authority !==
      "qualified-runtime-conditional-edge-activation"
  ) {
    throw new Error(
      "conditionalEdgeRuntimeTrust authority is invalid.",
    );
  }
  if (!validRuntimeVisitDate(value.visitDate)) {
    throw new Error(
      "conditionalEdgeRuntimeTrust visitDate must be a real YYYY-MM-DD date.",
    );
  }
  if (!validRuntimeTimestamp(value.evaluatedAt)) {
    throw new Error(
      "conditionalEdgeRuntimeTrust evaluatedAt must be an ISO timestamp with timezone.",
    );
  }
  if (!Array.isArray(value.edgeIds)) {
    throw new Error(
      "conditionalEdgeRuntimeTrust edgeIds must be an array.",
    );
  }
  const seen = new Set<string>();
  for (const edgeId of value.edgeIds) {
    if (!stableId(edgeId)) {
      throw new Error(
        "conditionalEdgeRuntimeTrust edgeIds must contain stable non-empty strings.",
      );
    }
    if (seen.has(edgeId)) {
      throw new Error(
        "conditionalEdgeRuntimeTrust edgeIds cannot contain duplicates.",
      );
    }
    seen.add(edgeId);
  }
}

function assertIntegrationInput(
  input: CandidateIntegrationInput,
) {
  if (!isRecord(input)) {
    throw new Error("CandidateIntegrationInput must be an object.");
  }

  assertVisitPreferences(input.visit);
  assertDayPreferences(input.day);

  if (!isRecord(input.priorities)) {
    throw new Error("PriorityPreferences must be an object.");
  }
  assertPriorityRecord(
    input.priorities.animals,
    ANIMAL_PRIORITIES,
    "Animal",
  );
  assertPriorityRecord(
    input.priorities.experiences,
    EXPERIENCE_PRIORITIES,
    "Experience",
  );

  if (!stableId(input.initialNodeId)) {
    throw new Error("initialNodeId must be a stable non-empty ID.");
  }

  if (
    input.endNodeId !== undefined &&
    !stableId(input.endNodeId)
  ) {
    throw new Error(
      "endNodeId must be a stable non-empty ID when provided.",
    );
  }

  assertBindings(input.bindings);
  assertConditionalEdgeIds(input.enabledConditionalEdgeIds);
  assertConditionalEdgeRuntimeTrust(
    input.conditionalEdgeRuntimeTrust,
  );
}

function provenanceEffectiveOnDate(
  provenance: {
    effectiveFrom?: string;
    effectiveTo?: string;
  },
  date: string,
) {
  return (
    (provenance.effectiveFrom === undefined ||
      provenance.effectiveFrom <= date) &&
    (provenance.effectiveTo === undefined ||
      date <= provenance.effectiveTo)
  );
}

function nodeConfidenceVerified(node: RouteNode | undefined) {
  return node?.provenance.confidence === "verified";
}

function nodeEffectiveOnDate(
  node: RouteNode | undefined,
  date: string,
) {
  return Boolean(
    node &&
      provenanceEffectiveOnDate(node.provenance, date),
  );
}

function nodeVerified(
  node: RouteNode | undefined,
  date: string,
) {
  return (
    nodeConfidenceVerified(node) &&
    nodeEffectiveOnDate(node, date)
  );
}

function placeConfidenceVerified(
  place: PlaceRecord,
  node: RouteNode | undefined,
) {
  return (
    place.provenance.confidence === "verified" &&
    place.navigationPoint.confidence === "verified" &&
    nodeConfidenceVerified(node)
  );
}

function placeEffectiveOnDate(
  place: PlaceRecord,
  node: RouteNode | undefined,
  date: string,
) {
  return (
    provenanceEffectiveOnDate(place.provenance, date) &&
    nodeEffectiveOnDate(node, date)
  );
}

function confidenceVerified(
  place: PlaceRecord,
  node: RouteNode | undefined,
  date: string,
) {
  return (
    placeConfidenceVerified(place, node) &&
    placeEffectiveOnDate(place, node, date)
  );
}

function issueSeverityForAnimal(priority: AnimalPriority) {
  return priority === "must" ? "error" as const : "warning" as const;
}

function issueSeverityForExperience(priority: ExperiencePriority) {
  return priority === "must" ? "error" as const : "warning" as const;
}

function pushIssue(
  issues: CandidateIntegrationIssue[],
  severity: CandidateIntegrationIssueSeverity,
  code: CandidateIntegrationIssueCode,
  message: string,
  selectionKey?: string,
  sourceId?: string,
) {
  issues.push({
    severity,
    code,
    ...(selectionKey ? { selectionKey } : {}),
    ...(sourceId ? { sourceId } : {}),
    message,
  });
}

function trustedRoutingPackage(
  data: WildRouteDataPackage,
  date: string,
  runtimeTrustedConditionalEdgeIds:
    ReadonlySet<string> = new Set(),
) {
  const nodeById = new Map(
    data.routeNodes.map((node) => [node.id, node]),
  );
  const disabledUnverifiedEdgeIds: string[] = [];

  const routeEdges = data.routeEdges.map((edge) => {
    const from = nodeById.get(edge.fromNodeId);
    const to = nodeById.get(edge.toNodeId);
    const baseEvidenceEffective =
      provenanceEffectiveOnDate(
        edge.provenance,
        date,
      ) &&
      nodeVerified(from, date) &&
      nodeVerified(to, date);

    const trusted =
      (edge.provenance.confidence ===
        "verified" &&
        baseEvidenceEffective) ||
      (edge.status === "conditional" &&
        edge.provenance.confidence ===
          "provisional" &&
        runtimeTrustedConditionalEdgeIds.has(
          edge.id,
        ) &&
        baseEvidenceEffective);

    if (trusted) {
      return {
        ...edge,
        provenance: { ...edge.provenance },
      };
    }

    disabledUnverifiedEdgeIds.push(edge.id);
    return {
      ...edge,
      status: "closed" as const,
      provenance: { ...edge.provenance },
    };
  });

  return {
    data: {
      ...data,
      zones: data.zones.map((zone) => ({
        ...zone,
        provenance: { ...zone.provenance },
      })),
      places: data.places.map((place) => ({
        ...place,
        navigationPoint: { ...place.navigationPoint },
        provenance: { ...place.provenance },
      })),
      routeNodes: data.routeNodes.map((node) => ({
        ...node,
        provenance: { ...node.provenance },
      })),
      routeEdges,
      scheduleEvents: data.scheduleEvents.map((event) => ({
        ...event,
        provenance: { ...event.provenance },
      })),
    } satisfies WildRouteDataPackage,
    disabledUnverifiedEdgeIds:
      disabledUnverifiedEdgeIds.sort(compareText),
  };
}

function routePolicyFor(
  visit: VisitPreferences,
  day: DayPreferences,
  enabledConditionalEdgeIds?: readonly string[],
) {
  const allowedModes = day.useSkyfari
    ? undefined
    : ALL_ROUTE_MODES.filter((mode) => mode !== "skyfari");

  return {
    ...(allowedModes ? { allowedModes } : {}),
    ...(visit.wheelchair
      ? { requireAccessible: true }
      : {}),
    ...(visit.stroller ? { requireStroller: true } : {}),
    ...(enabledConditionalEdgeIds &&
    enabledConditionalEdgeIds.length > 0
      ? {
          enabledConditionalEdgeIds: [
            ...enabledConditionalEdgeIds,
          ],
        }
      : {}),
  };
}

function selectedEntries<T extends string>(
  values: Readonly<Record<string, T>>,
  none: string,
) {
  return Object.entries(values)
    .filter(([, priority]) => priority !== none)
    .sort(([a], [b]) => compareText(a, b));
}

function findPlace(
  placeById: ReadonlyMap<string, PlaceRecord>,
  id: string,
) {
  return placeById.get(id);
}

type PerformanceTrust =
  | "trusted"
  | "unverified"
  | "outside-effective-range";

function performanceTrust(
  event: ScheduleEvent | undefined,
  placeById: ReadonlyMap<string, PlaceRecord>,
  nodeById: ReadonlyMap<string, RouteNode>,
  date: string,
): PerformanceTrust {
  if (!event) return "unverified";

  const place = placeById.get(event.placeId);
  if (!place) return "unverified";
  const node = nodeById.get(place.routeNodeId);

  if (
    event.provenance.confidence !== "verified" ||
    !placeConfidenceVerified(place, node)
  ) {
    return "unverified";
  }

  if (
    !provenanceEffectiveOnDate(event.provenance, date) ||
    !placeEffectiveOnDate(place, node, date)
  ) {
    return "outside-effective-range";
  }

  return "trusted";
}

export function buildCandidateIntegration(
  input: CandidateIntegrationInput,
): CandidateIntegrationResult {
  assertIntegrationInput(input);
  assertValidWildRouteData(input.data);
  const data: WildRouteDataPackage = input.data;

  const issues: CandidateIntegrationIssue[] = [];
  const excluded = new Set<string>();
  const candidates: OptimizerCandidate[] = [];
  const placeById = new Map(
    data.places.map((place) => [place.id, place]),
  );
  const nodeById = new Map(
    data.routeNodes.map((node) => [node.id, node]),
  );
  const eventById = new Map(
    data.scheduleEvents.map((event) => [event.id, event]),
  );
  const edgeById = new Map(
    data.routeEdges.map((edge) => [edge.id, edge]),
  );

  const runtimeTrustEdgeIds =
    new Set<string>();
  const runtimeTrust =
    input.conditionalEdgeRuntimeTrust;

  if (
    runtimeTrust &&
    runtimeTrust.visitDate !==
      input.visit.date
  ) {
    pushIssue(
      issues,
      "error",
      "CONDITIONAL_EDGE_RUNTIME_TRUST_DATE_MISMATCH",
      `Runtime conditional-edge trust is for ${runtimeTrust.visitDate}, not visit date ${input.visit.date}.`,
    );
  } else if (runtimeTrust) {
    for (const edgeId of runtimeTrust.edgeIds) {
      const edge = edgeById.get(edgeId);
      if (!edge) {
        pushIssue(
          issues,
          "error",
          "CONDITIONAL_EDGE_RUNTIME_TRUST_UNKNOWN",
          `Runtime conditional-edge trust references unknown edge ${edgeId}.`,
          undefined,
          edgeId,
        );
        continue;
      }
      if (edge.status !== "conditional") {
        pushIssue(
          issues,
          "error",
          "CONDITIONAL_EDGE_RUNTIME_TRUST_NOT_CONDITIONAL",
          `Runtime trust may only target conditional edges; ${edgeId} has status ${edge.status}.`,
          undefined,
          edgeId,
        );
        continue;
      }
      if (
        edge.provenance.confidence ===
          "unknown"
      ) {
        pushIssue(
          issues,
          "error",
          "CONDITIONAL_EDGE_RUNTIME_TRUST_PROVENANCE_UNKNOWN",
          `Runtime operational trust cannot override unknown base provenance for conditional edge ${edgeId}.`,
          undefined,
          edgeId,
        );
        continue;
      }
      runtimeTrustEdgeIds.add(edgeId);
    }
  }

  const gated = trustedRoutingPackage(
    data,
    input.visit.date,
    runtimeTrustEdgeIds,
  );
  const gatedEdgeIds = new Set(
    gated.disabledUnverifiedEdgeIds,
  );

  const horizon = createPlanningHorizon(
    input.visit.date,
    input.visit.arrival,
    input.visit.departure,
  );

  if (horizon.status !== "valid") {
    pushIssue(
      issues,
      "error",
      "VISIT_HORIZON_INVALID",
      `Visit horizon is invalid: ${horizon.reason}.`,
    );
  }

  const initialNode = nodeById.get(input.initialNodeId);
  if (!initialNode) {
    pushIssue(
      issues,
      "error",
      "INITIAL_NODE_UNKNOWN",
      `Initial route node ${input.initialNodeId} is not present in planner data.`,
      undefined,
      input.initialNodeId,
    );
  } else if (!nodeConfidenceVerified(initialNode)) {
    pushIssue(
      issues,
      "error",
      "INITIAL_NODE_UNVERIFIED",
      `Initial route node ${input.initialNodeId} is not verified.`,
      undefined,
      input.initialNodeId,
    );
  } else if (!nodeEffectiveOnDate(initialNode, input.visit.date)) {
    pushIssue(
      issues,
      "error",
      "INITIAL_NODE_OUTSIDE_EFFECTIVE_RANGE",
      `Initial route node ${input.initialNodeId} is outside its effective range for ${input.visit.date}.`,
      undefined,
      input.initialNodeId,
    );
  }

  if (input.endNodeId !== undefined) {
    const endNode = nodeById.get(input.endNodeId);
    if (!endNode) {
      pushIssue(
        issues,
        "error",
        "END_NODE_UNKNOWN",
        `End route node ${input.endNodeId} is not present in planner data.`,
        undefined,
        input.endNodeId,
      );
    } else if (!nodeConfidenceVerified(endNode)) {
      pushIssue(
        issues,
        "error",
        "END_NODE_UNVERIFIED",
        `End route node ${input.endNodeId} is not verified.`,
        undefined,
        input.endNodeId,
      );
    } else if (!nodeEffectiveOnDate(endNode, input.visit.date)) {
      pushIssue(
        issues,
        "error",
        "END_NODE_OUTSIDE_EFFECTIVE_RANGE",
        `End route node ${input.endNodeId} is outside its effective range for ${input.visit.date}.`,
        undefined,
        input.endNodeId,
      );
    }
  }

  for (const edgeId of input.enabledConditionalEdgeIds ?? []) {
    const edge = edgeById.get(edgeId);

    if (!edge) {
      pushIssue(
        issues,
        "error",
        "CONDITIONAL_EDGE_UNKNOWN",
        `Enabled conditional edge ${edgeId} does not exist in planner data.`,
        undefined,
        edgeId,
      );
      continue;
    }

    if (edge.status !== "conditional") {
      pushIssue(
        issues,
        "error",
        "CONDITIONAL_EDGE_NOT_CONDITIONAL",
        `Enabled edge ${edgeId} has status ${edge.status}; only conditional edges may be explicitly enabled.`,
        undefined,
        edgeId,
      );
      continue;
    }

    if (gatedEdgeIds.has(edgeId)) {
      pushIssue(
        issues,
        "error",
        "CONDITIONAL_EDGE_UNTRUSTED",
        `Conditional edge ${edgeId} cannot be enabled because its edge/endpoint evidence is not fully verified and effective for ${input.visit.date}.`,
        undefined,
        edgeId,
      );
    }
  }

  const selectedAnimals = selectedEntries(
    input.priorities.animals,
    "none",
  );
  const animalPreferenceIdsByPlace = new Map<string, string[]>();

  for (const [preferenceId] of selectedAnimals) {
    const binding = input.bindings.animals[preferenceId];
    if (!binding) continue;

    const owners =
      animalPreferenceIdsByPlace.get(binding.placeId) ?? [];
    owners.push(preferenceId);
    animalPreferenceIdsByPlace.set(binding.placeId, owners);
  }

  for (const [placeId, owners] of animalPreferenceIdsByPlace) {
    if (owners.length < 2) continue;

    owners.sort(compareText);
    for (const owner of owners) {
      excluded.add(`animal:${owner}`);
    }

    pushIssue(
      issues,
      "error",
      "ANIMAL_PLACE_COLLISION",
      `Selected animal priorities ${owners.join(", ")} all bind to the same planner place ${placeId}.`,
      `animal:${owners[0]}`,
      placeId,
    );
  }

  for (const [preferenceId, priority] of selectedAnimals) {
    const selectionKey = `animal:${preferenceId}`;
    const binding = input.bindings.animals[preferenceId];
    const severity = issueSeverityForAnimal(priority);

    if (excluded.has(selectionKey)) {
      continue;
    }

    if (!binding) {
      excluded.add(selectionKey);
      pushIssue(
        issues,
        severity,
        "ANIMAL_BINDING_REQUIRED",
        `Selected animal ${preferenceId} has no explicit planner place binding.`,
        selectionKey,
        preferenceId,
      );
      continue;
    }

    const place = findPlace(placeById, binding.placeId);
    if (!place) {
      excluded.add(selectionKey);
      pushIssue(
        issues,
        severity,
        "ANIMAL_PLACE_UNKNOWN",
        `Animal binding ${preferenceId} references unknown place ${binding.placeId}.`,
        selectionKey,
        binding.placeId,
      );
      continue;
    }

    if (place.kind !== "animal") {
      excluded.add(selectionKey);
      pushIssue(
        issues,
        severity,
        "ANIMAL_PLACE_KIND_MISMATCH",
        `Animal binding ${preferenceId} references place kind ${place.kind} instead of animal.`,
        selectionKey,
        place.id,
      );
      continue;
    }

    const placeNode = nodeById.get(place.routeNodeId);

    if (!placeConfidenceVerified(place, placeNode)) {
      excluded.add(selectionKey);
      pushIssue(
        issues,
        severity,
        "ANIMAL_PLACE_UNVERIFIED",
        `Animal place ${place.id} does not have fully verified place, navigation, and route-node evidence.`,
        selectionKey,
        place.id,
      );
      continue;
    }

    if (
      !placeEffectiveOnDate(
        place,
        placeNode,
        input.visit.date,
      )
    ) {
      excluded.add(selectionKey);
      pushIssue(
        issues,
        severity,
        "ANIMAL_PLACE_OUTSIDE_EFFECTIVE_RANGE",
        `Animal place ${place.id} is outside its place/route-node effective range for ${input.visit.date}.`,
        selectionKey,
        place.id,
      );
      continue;
    }

    const policy = policyFromAnimalPriority(priority);
    if (!policy) continue;

    candidates.push({
      id: selectionKey,
      selectionKey,
      nodeId: place.routeNodeId,
      baseDwellMinutes: binding.dwellMinutes,
      ...policy,
    });
  }

  const selectedExperiences = selectedEntries(
    input.priorities.experiences,
    "none",
  );
  const selectedActivityOwner = new Map<string, string>();

  for (const [preferenceId, priority] of selectedExperiences) {
    const binding = input.bindings.experiences[preferenceId];
    if (!binding) continue;

    const priorOwner = selectedActivityOwner.get(binding.activityId);
    if (priorOwner) {
      const currentKey = `experience:${preferenceId}`;
      const priorKey = `experience:${priorOwner}`;
      excluded.add(currentKey);
      excluded.add(priorKey);
      pushIssue(
        issues,
        "error",
        "EXPERIENCE_ACTIVITY_COLLISION",
        `Selected experiences ${priorOwner} and ${preferenceId} both bind to activity ${binding.activityId}.`,
        currentKey,
        binding.activityId,
      );
    } else {
      selectedActivityOwner.set(binding.activityId, preferenceId);
    }
  }

  const dwellByActivityId: Record<string, number> = {};
  for (const [activityId, preferenceId] of selectedActivityOwner) {
    const selectionKey = `experience:${preferenceId}`;
    if (excluded.has(selectionKey)) continue;

    const binding =
      input.bindings.experiences[preferenceId];
    if (binding?.dwellMinutes !== undefined) {
      dwellByActivityId[activityId] =
        binding.dwellMinutes;
    }
  }

  const showBuild = buildShowCandidateSets(
    data,
    input.visit.date,
    dwellByActivityId,
  );
  const showSetByActivity = new Map(
    showBuild.sets.map((set) => [set.activityId, set]),
  );
  const showIssuesByActivity = new Map<string, typeof showBuild.issues>();

  for (const showIssue of showBuild.issues) {
    const list =
      showIssuesByActivity.get(showIssue.activityId) ?? [];
    list.push(showIssue);
    showIssuesByActivity.set(showIssue.activityId, list);
  }

  for (const [preferenceId, priority] of selectedExperiences) {
    const selectionKey = `experience:${preferenceId}`;
    if (excluded.has(selectionKey)) continue;

    const binding = input.bindings.experiences[preferenceId];
    const severity = issueSeverityForExperience(priority);

    if (!binding) {
      excluded.add(selectionKey);
      pushIssue(
        issues,
        severity,
        "EXPERIENCE_BINDING_REQUIRED",
        `Selected experience ${preferenceId} has no explicit activity binding.`,
        selectionKey,
        preferenceId,
      );
      continue;
    }

    const set = showSetByActivity.get(binding.activityId);
    const sourceIssues =
      showIssuesByActivity.get(binding.activityId) ?? [];

    if (!set) {
      excluded.add(selectionKey);
      const detail =
        sourceIssues.length > 0
          ? "Available schedule records are missing a trusted service duration."
          : "No schedule performances exist for the selected visit date.";
      pushIssue(
        issues,
        severity,
        "EXPERIENCE_SCHEDULE_MISSING",
        `Experience ${preferenceId} cannot be scheduled. ${detail}`,
        selectionKey,
        binding.activityId,
      );
      continue;
    }

    const trusted = set.candidates.filter(
      (show) =>
        performanceTrust(
          eventById.get(show.eventId),
          placeById,
          nodeById,
          input.visit.date,
        ) === "trusted",
    );

    for (const show of set.candidates) {
      const trust = performanceTrust(
        eventById.get(show.eventId),
        placeById,
        nodeById,
        input.visit.date,
      );

      if (trust === "unverified") {
        pushIssue(
          issues,
          "warning",
          "EXPERIENCE_PERFORMANCE_UNVERIFIED",
          `Performance ${show.eventId} was excluded because its event/place/navigation/route-node evidence is not fully verified.`,
          selectionKey,
          show.eventId,
        );
      } else if (trust === "outside-effective-range") {
        pushIssue(
          issues,
          "warning",
          "EXPERIENCE_PERFORMANCE_OUTSIDE_EFFECTIVE_RANGE",
          `Performance ${show.eventId} was excluded because its event/place/route-node evidence is outside the effective range for ${input.visit.date}.`,
          selectionKey,
          show.eventId,
        );
      }
    }

    if (trusted.length === 0) {
      excluded.add(selectionKey);
      pushIssue(
        issues,
        severity,
        "EXPERIENCE_NO_TRUSTED_PERFORMANCE",
        `Experience ${preferenceId} has no fully verified performance available for the selected date.`,
        selectionKey,
        binding.activityId,
      );
      continue;
    }

    const policy = policyFromExperiencePriority(priority);
    if (!policy) continue;

    for (const show of trusted) {
      candidates.push({
        id: `${selectionKey}:${show.eventId}`,
        selectionKey,
        nodeId: show.nodeId,
        baseDwellMinutes:
          show.serviceEndMinute - show.serviceStartMinute,
        anchor: {
          id: show.id,
          kind: show.kind,
          title: show.title,
          nodeId: show.nodeId,
          arrivalWindowStartMinute:
            show.arrivalWindowStartMinute,
          arrivalWindowEndMinute:
            show.arrivalWindowEndMinute,
          serviceStartMinute: show.serviceStartMinute,
          serviceEndMinute: show.serviceEndMinute,
        },
        ...policy,
      });
    }
  }

  const reservationName = input.visit.reservation.name.trim();
  const reservationTime = input.visit.reservation.time;
  const hasReservationName = reservationName.length > 0;
  const hasReservationTime = reservationTime.length > 0;

  if (hasReservationName !== hasReservationTime) {
    excluded.add("reservation:visit");
    pushIssue(
      issues,
      "error",
      "RESERVATION_INCOMPLETE",
      "Reservation requires both a name and a time before it can become a locked planner candidate.",
      "reservation:visit",
    );
  } else if (hasReservationName && hasReservationTime) {
    const selectionKey = "reservation:visit";
    const binding = input.bindings.reservation;

    if (!binding) {
      excluded.add(selectionKey);
      pushIssue(
        issues,
        "error",
        "RESERVATION_BINDING_REQUIRED",
        "A visit reservation requires an explicit planner place/duration binding.",
        selectionKey,
        reservationName,
      );
    } else {
      const place = placeById.get(binding.placeId);
      if (!place) {
        excluded.add(selectionKey);
        pushIssue(
          issues,
          "error",
          "RESERVATION_PLACE_UNKNOWN",
          `Reservation binding references unknown place ${binding.placeId}.`,
          selectionKey,
          binding.placeId,
        );
      } else {
        const placeNode = nodeById.get(place.routeNodeId);

        if (!placeConfidenceVerified(place, placeNode)) {
          excluded.add(selectionKey);
          pushIssue(
            issues,
            "error",
            "RESERVATION_PLACE_UNVERIFIED",
            `Reservation place ${place.id} does not have fully verified place, navigation, and route-node evidence.`,
            selectionKey,
            place.id,
          );
        } else if (
          !placeEffectiveOnDate(
            place,
            placeNode,
            input.visit.date,
          )
        ) {
          excluded.add(selectionKey);
          pushIssue(
            issues,
            "error",
            "RESERVATION_PLACE_OUTSIDE_EFFECTIVE_RANGE",
            `Reservation place ${place.id} is outside its place/route-node effective range for ${input.visit.date}.`,
            selectionKey,
            place.id,
          );
        } else {
        const anchor = createLockedAnchor({
          id: "reservation:visit",
          title: reservationName,
          nodeId: place.routeNodeId,
          startTime: reservationTime,
          durationMinutes: binding.durationMinutes,
        });

        if (anchor.status !== "valid") {
          excluded.add(selectionKey);
          pushIssue(
            issues,
            "error",
            "RESERVATION_ANCHOR_INVALID",
            `Reservation cannot be scheduled: ${anchor.reason}.`,
            selectionKey,
            binding.placeId,
          );
        } else {
          candidates.push({
            id: selectionKey,
            selectionKey,
            nodeId: place.routeNodeId,
            authority: "locked",
            timing: "fixed",
            priority: "must",
            baseDwellMinutes: binding.durationMinutes,
            anchor: anchor.anchor,
          });
        }
      }
      }
    }
  }

  candidates.sort((a, b) => {
    const selection = compareText(a.selectionKey, b.selectionKey);
    return selection !== 0
      ? selection
      : compareText(a.id, b.id);
  });

  buildOptimizerGroups(
    buildRoutingGraph(data),
    candidates,
  );

  if (gated.disabledUnverifiedEdgeIds.length > 0) {
    pushIssue(
      issues,
      "warning",
      "ROUTING_DATA_GATED",
      `${gated.disabledUnverifiedEdgeIds.length} route edge(s) were disabled because edge or endpoint-node provenance is not fully verified/effective for ${input.visit.date}.`,
    );
  }

  const routingGate = {
    disabledUnverifiedEdgeIds:
      gated.disabledUnverifiedEdgeIds,
  };

  issues.sort((a, b) => {
    const severity =
      a.severity === b.severity
        ? 0
        : a.severity === "error"
          ? -1
          : 1;
    if (severity !== 0) return severity;

    const code = compareText(a.code, b.code);
    if (code !== 0) return code;

    const selection = compareText(
      a.selectionKey ?? "",
      b.selectionKey ?? "",
    );
    if (selection !== 0) return selection;

    const source = compareText(
      a.sourceId ?? "",
      b.sourceId ?? "",
    );
    if (source !== 0) return source;

    return compareText(a.message, b.message);
  });

  const excludedSelectionKeys = [...excluded].sort(compareText);
  const hasErrors = issues.some(
    (issue) => issue.severity === "error",
  );

  if (
    hasErrors ||
    horizon.status !== "valid" ||
    !initialNode ||
    !nodeVerified(initialNode, input.visit.date) ||
    (input.endNodeId !== undefined &&
      !nodeVerified(
        nodeById.get(input.endNodeId),
        input.visit.date,
      ))
  ) {
    return {
      status: "blocked",
      candidates,
      issues,
      excludedSelectionKeys,
      routingGate,
    };
  }

  const graph = buildRoutingGraph(gated.data);

  return {
    status: "ready",
    request: {
      graph,
      horizon: horizon.horizon,
      initialNodeId: input.initialNodeId,
      ...(input.endNodeId !== undefined
        ? { endNodeId: input.endNodeId }
        : {}),
      candidates,
      scoreContext: {
        pace: input.day.pace,
        preferEasyPaths: input.visit.easyPaths,
      },
      routePolicy: routePolicyFor(
        input.visit,
        input.day,
        input.enabledConditionalEdgeIds,
      ),
    },
    candidates,
    issues,
    excludedSelectionKeys,
    routingGate,
  };
}

export function qualifyCandidateIntegration(
  integration: CandidateIntegrationResult,
  scenarioId: string,
  stateBudget: number,
  thresholds: QualificationThresholds,
): QualifiedCandidateIntegration {
  if (integration.status === "blocked") {
    return {
      status: "integration-blocked",
      integration,
    };
  }

  const report = runOptimizerQualification({
    id: scenarioId,
    request: integration.request,
    stateBudget,
    thresholds,
  });

  return {
    status: report.passed ? "qualified" : "not-qualified",
    integration,
    report,
  };
}
