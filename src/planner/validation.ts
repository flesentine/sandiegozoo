import type { WildRouteDataPackage } from "./contracts";

export type ValidationSeverity = "error" | "warning";

export type ValidationIssue = {
  severity: ValidationSeverity;
  code: string;
  path: string;
  message: string;
};

type JsonRecord = Record<string, unknown>;

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIMESTAMP_RE =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

const CONFIDENCE = ["verified", "provisional", "unknown"] as const;
const PLACE_KINDS = [
  "animal",
  "experience",
  "dining",
  "restroom",
  "entrance",
  "transport",
  "elevator",
  "service",
] as const;
const NODE_KINDS = [
  "junction",
  "destination",
  "entrance",
  "transport",
  "elevator",
] as const;
const ROUTE_MODES = [
  "walk",
  "skyfari",
  "bus",
  "elevator",
  "ada-shuttle",
] as const;
const ROUTE_DIFFICULTIES = ["easy", "moderate", "steep"] as const;
const ROUTE_STATUSES = ["open", "closed", "conditional"] as const;

function push(
  issues: ValidationIssue[],
  severity: ValidationSeverity,
  code: string,
  path: string,
  message: string,
) {
  issues.push({ severity, code, path, message });
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validHttpUrl(value: unknown) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validTimestamp(value: unknown) {
  return (
    typeof value === "string" &&
    ISO_TIMESTAMP_RE.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function timeToMinutes(value: unknown) {
  if (typeof value !== "string" || !TIME_RE.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateEnum(
  issues: ValidationIssue[],
  value: unknown,
  allowed: readonly string[],
  code: string,
  path: string,
  label: string,
) {
  if (typeof value !== "string" || !allowed.includes(value)) {
    push(
      issues,
      "error",
      code,
      path,
      `${label} must be one of: ${allowed.join(", ")}.`,
    );
  }
}

function validateBoolean(
  issues: ValidationIssue[],
  value: unknown,
  code: string,
  path: string,
  label: string,
) {
  if (typeof value !== "boolean") {
    push(issues, "error", code, path, `${label} must be boolean.`);
  }
}

function validateProvenance(
  issues: ValidationIssue[],
  provenance: unknown,
  path: string,
) {
  if (!isRecord(provenance)) {
    push(
      issues,
      "error",
      "PROVENANCE_REQUIRED",
      path,
      "Source provenance must be an object.",
    );
    return;
  }

  if (!validHttpUrl(provenance.sourceUrl)) {
    push(
      issues,
      "error",
      "SOURCE_URL_INVALID",
      `${path}.sourceUrl`,
      "Source URL must be an absolute HTTP(S) URL.",
    );
  }

  if (!nonEmptyString(provenance.sourceLabel)) {
    push(
      issues,
      "error",
      "SOURCE_LABEL_REQUIRED",
      `${path}.sourceLabel`,
      "Source label must be a non-empty string.",
    );
  }

  if (!validTimestamp(provenance.lastVerified)) {
    push(
      issues,
      "error",
      "LAST_VERIFIED_INVALID",
      `${path}.lastVerified`,
      "lastVerified must be an ISO timestamp with an explicit timezone.",
    );
  }

  validateEnum(
    issues,
    provenance.confidence,
    CONFIDENCE,
    "CONFIDENCE_INVALID",
    `${path}.confidence`,
    "Confidence",
  );

  const effectiveFrom = provenance.effectiveFrom;
  const effectiveTo = provenance.effectiveTo;

  if (effectiveFrom !== undefined && !validDate(effectiveFrom)) {
    push(
      issues,
      "error",
      "EFFECTIVE_FROM_INVALID",
      `${path}.effectiveFrom`,
      "effectiveFrom must be a real YYYY-MM-DD date.",
    );
  }

  if (effectiveTo !== undefined && !validDate(effectiveTo)) {
    push(
      issues,
      "error",
      "EFFECTIVE_TO_INVALID",
      `${path}.effectiveTo`,
      "effectiveTo must be a real YYYY-MM-DD date.",
    );
  }

  if (
    validDate(effectiveFrom) &&
    validDate(effectiveTo) &&
    effectiveFrom > effectiveTo
  ) {
    push(
      issues,
      "error",
      "EFFECTIVE_RANGE_INVALID",
      path,
      "effectiveFrom cannot be later than effectiveTo.",
    );
  }
}

function validateCoordinates(
  issues: ValidationIssue[],
  lat: unknown,
  lng: unknown,
  path: string,
) {
  if (typeof lat !== "number" || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    push(
      issues,
      "error",
      "LATITUDE_INVALID",
      `${path}.lat`,
      "Latitude must be a finite number between -90 and 90.",
    );
  }

  if (
    typeof lng !== "number" ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    push(
      issues,
      "error",
      "LONGITUDE_INVALID",
      `${path}.lng`,
      "Longitude must be a finite number between -180 and 180.",
    );
  }
}

function getArray(
  issues: ValidationIssue[],
  value: JsonRecord,
  key: string,
  code: string,
) {
  const candidate = value[key];

  if (!Array.isArray(candidate)) {
    push(issues, "error", code, key, `${key} must be an array.`);
    return [] as unknown[];
  }

  return candidate as unknown[];
}

function validateRecordShape(
  issues: ValidationIssue[],
  value: unknown,
  code: string,
  path: string,
  label: string,
): value is JsonRecord {
  if (!isRecord(value)) {
    push(issues, "error", code, path, `${label} must be an object.`);
    return false;
  }

  return true;
}

function duplicateIds(
  issues: ValidationIssue[],
  values: unknown[],
  path: string,
) {
  const seen = new Set<string>();

  values.forEach((value, index) => {
    if (!isRecord(value)) return;

    if (!nonEmptyString(value.id)) {
      push(
        issues,
        "error",
        "ID_REQUIRED",
        `${path}[${index}].id`,
        "Stable ID must be a non-empty string.",
      );
      return;
    }

    const id = value.id as string;

    if (id !== id.trim()) {
      push(
        issues,
        "error",
        "ID_WHITESPACE_INVALID",
        `${path}[${index}].id`,
        "Stable ID cannot contain leading or trailing whitespace.",
      );
    }

    if (seen.has(id)) {
      push(
        issues,
        "error",
        "DUPLICATE_ID",
        `${path}[${index}].id`,
        `Duplicate ID: ${id}`,
      );
    }

    seen.add(id);
  });
}

function stableIds(values: unknown[]) {
  return new Set(
    values.flatMap((value) =>
      isRecord(value) && nonEmptyString(value.id) ? [value.id as string] : [],
    ),
  );
}

function edgeIncidentCount(edges: unknown[]) {
  const counts = new Map<string, number>();

  for (const edge of edges) {
    if (!isRecord(edge)) continue;

    for (const key of ["fromNodeId", "toNodeId"] as const) {
      const nodeId = edge[key];
      if (typeof nodeId === "string") {
        counts.set(nodeId, (counts.get(nodeId) ?? 0) + 1);
      }
    }
  }

  return counts;
}

export function validateWildRouteData(value: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    return [
      {
        severity: "error",
        code: "PACKAGE_REQUIRED",
        path: "$",
        message: "WildRoute data package must be an object.",
      },
    ];
  }

  if (value.schemaVersion !== "1") {
    push(
      issues,
      "error",
      "SCHEMA_VERSION_UNSUPPORTED",
      "schemaVersion",
      "Only schemaVersion 1 is supported.",
    );
  }

  const zones = getArray(issues, value, "zones", "ZONES_REQUIRED");
  const places = getArray(issues, value, "places", "PLACES_REQUIRED");
  const routeNodes = getArray(
    issues,
    value,
    "routeNodes",
    "ROUTE_NODES_REQUIRED",
  );
  const routeEdges = getArray(
    issues,
    value,
    "routeEdges",
    "ROUTE_EDGES_REQUIRED",
  );
  const scheduleEvents = getArray(
    issues,
    value,
    "scheduleEvents",
    "SCHEDULE_EVENTS_REQUIRED",
  );

  duplicateIds(issues, zones, "zones");
  duplicateIds(issues, places, "places");
  duplicateIds(issues, routeNodes, "routeNodes");
  duplicateIds(issues, routeEdges, "routeEdges");
  duplicateIds(issues, scheduleEvents, "scheduleEvents");

  const zoneIds = stableIds(zones);
  const placeIds = stableIds(places);
  const nodeIds = stableIds(routeNodes);
  const nodeZoneById = new Map<string, string>();

  routeNodes.forEach((rawNode, index) => {
    const path = `routeNodes[${index}]`;
    if (
      !validateRecordShape(
        issues,
        rawNode,
        "ROUTE_NODE_RECORD_INVALID",
        path,
        "Route node",
      )
    ) {
      return;
    }

    validateEnum(
      issues,
      rawNode.kind,
      NODE_KINDS,
      "NODE_KIND_INVALID",
      `${path}.kind`,
      "Route node kind",
    );

    if (!nonEmptyString(rawNode.zoneId) || !zoneIds.has(rawNode.zoneId as string)) {
      push(
        issues,
        "error",
        "NODE_ZONE_UNKNOWN",
        `${path}.zoneId`,
        `Unknown zone ID: ${String(rawNode.zoneId)}`,
      );
    }

    if (nonEmptyString(rawNode.id) && nonEmptyString(rawNode.zoneId)) {
      nodeZoneById.set(rawNode.id as string, rawNode.zoneId as string);
    }

    validateCoordinates(issues, rawNode.lat, rawNode.lng, path);
    validateProvenance(issues, rawNode.provenance, `${path}.provenance`);
  });

  zones.forEach((rawZone, index) => {
    const path = `zones[${index}]`;
    if (
      !validateRecordShape(
        issues,
        rawZone,
        "ZONE_RECORD_INVALID",
        path,
        "Zone",
      )
    ) {
      return;
    }

    if (!nonEmptyString(rawZone.name)) {
      push(
        issues,
        "error",
        "ZONE_NAME_REQUIRED",
        `${path}.name`,
        "Zone name must be a non-empty string.",
      );
    }

    validateProvenance(issues, rawZone.provenance, `${path}.provenance`);
  });

  places.forEach((rawPlace, index) => {
    const path = `places[${index}]`;
    if (
      !validateRecordShape(
        issues,
        rawPlace,
        "PLACE_RECORD_INVALID",
        path,
        "Place",
      )
    ) {
      return;
    }

    validateEnum(
      issues,
      rawPlace.kind,
      PLACE_KINDS,
      "PLACE_KIND_INVALID",
      `${path}.kind`,
      "Place kind",
    );

    if (!nonEmptyString(rawPlace.zoneId) || !zoneIds.has(rawPlace.zoneId as string)) {
      push(
        issues,
        "error",
        "PLACE_ZONE_UNKNOWN",
        `${path}.zoneId`,
        `Unknown zone ID: ${String(rawPlace.zoneId)}`,
      );
    }

    if (
      !nonEmptyString(rawPlace.routeNodeId) ||
      !nodeIds.has(rawPlace.routeNodeId as string)
    ) {
      push(
        issues,
        "error",
        "PLACE_ROUTE_NODE_UNKNOWN",
        `${path}.routeNodeId`,
        `Unknown route node ID: ${String(rawPlace.routeNodeId)}`,
      );
    } else if (
      nonEmptyString(rawPlace.zoneId) &&
      nodeZoneById.get(rawPlace.routeNodeId as string) !== rawPlace.zoneId
    ) {
      push(
        issues,
        "error",
        "PLACE_ROUTE_NODE_ZONE_MISMATCH",
        `${path}.routeNodeId`,
        "Place zone must match its destination route node zone.",
      );
    }

    if (!nonEmptyString(rawPlace.name)) {
      push(
        issues,
        "error",
        "PLACE_NAME_REQUIRED",
        `${path}.name`,
        "Place name must be a non-empty string.",
      );
    }

    if (!isRecord(rawPlace.navigationPoint)) {
      push(
        issues,
        "error",
        "NAVIGATION_POINT_REQUIRED",
        `${path}.navigationPoint`,
        "Guest-facing navigation point must be an object.",
      );
    } else {
      validateCoordinates(
        issues,
        rawPlace.navigationPoint.lat,
        rawPlace.navigationPoint.lng,
        `${path}.navigationPoint`,
      );
      validateEnum(
        issues,
        rawPlace.navigationPoint.confidence,
        CONFIDENCE,
        "NAVIGATION_CONFIDENCE_INVALID",
        `${path}.navigationPoint.confidence`,
        "Navigation confidence",
      );
    }

    for (const key of ["appleMapsLabel", "applePlaceId"] as const) {
      const optionalValue = rawPlace[key];
      if (optionalValue !== undefined && !nonEmptyString(optionalValue)) {
        push(
          issues,
          "error",
          "PLACE_NAVIGATION_METADATA_INVALID",
          `${path}.${key}`,
          `${key} must be a non-empty string when provided.`,
        );
      }
    }

    validateProvenance(issues, rawPlace.provenance, `${path}.provenance`);
  });

  routeEdges.forEach((rawEdge, index) => {
    const path = `routeEdges[${index}]`;
    if (
      !validateRecordShape(
        issues,
        rawEdge,
        "ROUTE_EDGE_RECORD_INVALID",
        path,
        "Route edge",
      )
    ) {
      return;
    }

    if (
      !nonEmptyString(rawEdge.fromNodeId) ||
      !nodeIds.has(rawEdge.fromNodeId as string)
    ) {
      push(
        issues,
        "error",
        "EDGE_FROM_NODE_UNKNOWN",
        `${path}.fromNodeId`,
        `Unknown route node ID: ${String(rawEdge.fromNodeId)}`,
      );
    }

    if (
      !nonEmptyString(rawEdge.toNodeId) ||
      !nodeIds.has(rawEdge.toNodeId as string)
    ) {
      push(
        issues,
        "error",
        "EDGE_TO_NODE_UNKNOWN",
        `${path}.toNodeId`,
        `Unknown route node ID: ${String(rawEdge.toNodeId)}`,
      );
    }

    if (
      typeof rawEdge.fromNodeId === "string" &&
      rawEdge.fromNodeId === rawEdge.toNodeId
    ) {
      push(
        issues,
        "error",
        "EDGE_SELF_LOOP",
        path,
        "Route edge cannot connect a node to itself.",
      );
    }

    validateEnum(
      issues,
      rawEdge.mode,
      ROUTE_MODES,
      "EDGE_MODE_INVALID",
      `${path}.mode`,
      "Route mode",
    );
    validateEnum(
      issues,
      rawEdge.difficulty,
      ROUTE_DIFFICULTIES,
      "EDGE_DIFFICULTY_INVALID",
      `${path}.difficulty`,
      "Route difficulty",
    );
    validateEnum(
      issues,
      rawEdge.status,
      ROUTE_STATUSES,
      "EDGE_STATUS_INVALID",
      `${path}.status`,
      "Route status",
    );

    if (
      typeof rawEdge.distanceMeters !== "number" ||
      !Number.isFinite(rawEdge.distanceMeters) ||
      rawEdge.distanceMeters <= 0
    ) {
      push(
        issues,
        "error",
        "EDGE_DISTANCE_INVALID",
        `${path}.distanceMeters`,
        "Edge distance must be a finite number greater than zero.",
      );
    }

    if (
      typeof rawEdge.durationMinutes !== "number" ||
      !Number.isFinite(rawEdge.durationMinutes) ||
      rawEdge.durationMinutes <= 0
    ) {
      push(
        issues,
        "error",
        "EDGE_DURATION_INVALID",
        `${path}.durationMinutes`,
        "Edge duration must be a finite number greater than zero.",
      );
    }

    validateBoolean(
      issues,
      rawEdge.stairs,
      "EDGE_STAIRS_INVALID",
      `${path}.stairs`,
      "stairs",
    );
    validateBoolean(
      issues,
      rawEdge.accessible,
      "EDGE_ACCESSIBLE_INVALID",
      `${path}.accessible`,
      "accessible",
    );
    validateBoolean(
      issues,
      rawEdge.stroller,
      "EDGE_STROLLER_INVALID",
      `${path}.stroller`,
      "stroller",
    );
    validateBoolean(
      issues,
      rawEdge.oneWay,
      "EDGE_ONE_WAY_INVALID",
      `${path}.oneWay`,
      "oneWay",
    );

    if (rawEdge.stairs === true && rawEdge.accessible === true) {
      push(
        issues,
        "error",
        "EDGE_ACCESSIBILITY_CONFLICT",
        path,
        "A stairs edge cannot be marked accessible.",
      );
    }

    if (rawEdge.stairs === true && rawEdge.stroller === true) {
      push(
        issues,
        "error",
        "EDGE_STROLLER_CONFLICT",
        path,
        "A stairs edge cannot be marked stroller-friendly.",
      );
    }

    validateProvenance(issues, rawEdge.provenance, `${path}.provenance`);
  });

  const incident = edgeIncidentCount(routeEdges);
  routeNodes.forEach((rawNode, index) => {
    if (
      isRecord(rawNode) &&
      nonEmptyString(rawNode.id) &&
      (incident.get(rawNode.id as string) ?? 0) === 0
    ) {
      push(
        issues,
        "warning",
        "ORPHAN_ROUTE_NODE",
        `routeNodes[${index}]`,
        `Route node ${rawNode.id as string} has no incident edges.`,
      );
    }
  });

  scheduleEvents.forEach((rawEvent, index) => {
    const path = `scheduleEvents[${index}]`;
    if (
      !validateRecordShape(
        issues,
        rawEvent,
        "SCHEDULE_EVENT_RECORD_INVALID",
        path,
        "Schedule event",
      )
    ) {
      return;
    }

    if (!nonEmptyString(rawEvent.activityId)) {
      push(
        issues,
        "error",
        "EVENT_ACTIVITY_ID_REQUIRED",
        `${path}.activityId`,
        "Event activityId must be a non-empty stable string.",
      );
    }

    if (!nonEmptyString(rawEvent.title)) {
      push(
        issues,
        "error",
        "EVENT_TITLE_REQUIRED",
        `${path}.title`,
        "Event title must be a non-empty string.",
      );
    }

    if (
      !nonEmptyString(rawEvent.placeId) ||
      !placeIds.has(rawEvent.placeId as string)
    ) {
      push(
        issues,
        "error",
        "EVENT_PLACE_UNKNOWN",
        `${path}.placeId`,
        `Unknown place ID: ${String(rawEvent.placeId)}`,
      );
    }

    if (!validDate(rawEvent.date)) {
      push(
        issues,
        "error",
        "EVENT_DATE_INVALID",
        `${path}.date`,
        "Event date must be a real YYYY-MM-DD date.",
      );
    }

    const start = timeToMinutes(rawEvent.startTime);
    if (start === null) {
      push(
        issues,
        "error",
        "EVENT_START_TIME_INVALID",
        `${path}.startTime`,
        "Event startTime must be HH:MM.",
      );
    }

    let end: number | null = null;
    if (rawEvent.endTime !== undefined) {
      end = timeToMinutes(rawEvent.endTime);

      if (end === null) {
        push(
          issues,
          "error",
          "EVENT_END_TIME_INVALID",
          `${path}.endTime`,
          "Event endTime must be HH:MM when provided.",
        );
      } else if (start !== null && end <= start) {
        push(
          issues,
          "error",
          "EVENT_TIME_RANGE_INVALID",
          path,
          "Event endTime must be later than startTime.",
        );
      }
    }

    if (
      typeof rawEvent.recommendedArrivalMinutes !== "number" ||
      !Number.isInteger(rawEvent.recommendedArrivalMinutes) ||
      rawEvent.recommendedArrivalMinutes < 0
    ) {
      push(
        issues,
        "error",
        "EVENT_ARRIVAL_INVALID",
        `${path}.recommendedArrivalMinutes`,
        "recommendedArrivalMinutes must be a non-negative integer.",
      );
    } else if (
      start !== null &&
      rawEvent.recommendedArrivalMinutes > start
    ) {
      push(
        issues,
        "error",
        "EVENT_ARRIVAL_CROSSES_DAY",
        `${path}.recommendedArrivalMinutes`,
        "Recommended arrival cannot fall before midnight in the same-day schedule model.",
      );
    }

    validateProvenance(issues, rawEvent.provenance, `${path}.provenance`);

    if (validDate(rawEvent.date) && isRecord(rawEvent.provenance)) {
      const effectiveFrom = rawEvent.provenance.effectiveFrom;
      const effectiveTo = rawEvent.provenance.effectiveTo;

      if (
        (validDate(effectiveFrom) && rawEvent.date < effectiveFrom) ||
        (validDate(effectiveTo) && rawEvent.date > effectiveTo)
      ) {
        push(
          issues,
          "error",
          "EVENT_OUTSIDE_EFFECTIVE_RANGE",
          path,
          "Event date must fall within its provenance effective range.",
        );
      }
    }
  });

  return issues;
}

export function assertValidWildRouteData(
  value: unknown,
): asserts value is WildRouteDataPackage {
  const issues = validateWildRouteData(value);
  const errors = issues.filter((issue) => issue.severity === "error");

  if (errors.length > 0) {
    throw new Error(
      errors
        .map((issue) => `${issue.code} at ${issue.path}: ${issue.message}`)
        .join("\n"),
    );
  }

}

export function isValidWildRouteData(
  value: unknown,
): value is WildRouteDataPackage {
  return validateWildRouteData(value).every(
    (issue) => issue.severity !== "error",
  );
}
