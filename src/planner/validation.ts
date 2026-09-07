import type {
  RouteEdge,
  SourceProvenance,
  WildRouteDataPackage,
} from "./contracts";

export type ValidationSeverity = "error" | "warning";

export type ValidationIssue = {
  severity: ValidationSeverity;
  code: string;
  path: string;
  message: string;
};

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function push(
  issues: ValidationIssue[],
  severity: ValidationSeverity,
  code: string,
  path: string,
  message: string,
) {
  issues.push({ severity, code, path, message });
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function validDate(value: string) {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;
}

function timeToMinutes(value: string) {
  if (!TIME_RE.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function validateProvenance(
  issues: ValidationIssue[],
  provenance: SourceProvenance,
  path: string,
) {
  if (!provenance || typeof provenance !== "object") {
    push(issues, "error", "PROVENANCE_REQUIRED", path, "Source provenance is required.");
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

  if (!provenance.sourceLabel?.trim()) {
    push(
      issues,
      "error",
      "SOURCE_LABEL_REQUIRED",
      `${path}.sourceLabel`,
      "Source label is required.",
    );
  }

  if (!validTimestamp(provenance.lastVerified)) {
    push(
      issues,
      "error",
      "LAST_VERIFIED_INVALID",
      `${path}.lastVerified`,
      "lastVerified must be an ISO-compatible timestamp.",
    );
  }

  if (!["verified", "provisional", "unknown"].includes(provenance.confidence)) {
    push(
      issues,
      "error",
      "CONFIDENCE_INVALID",
      `${path}.confidence`,
      "Confidence must be verified, provisional, or unknown.",
    );
  }

  if (provenance.effectiveFrom && !validDate(provenance.effectiveFrom)) {
    push(
      issues,
      "error",
      "EFFECTIVE_FROM_INVALID",
      `${path}.effectiveFrom`,
      "effectiveFrom must be YYYY-MM-DD.",
    );
  }

  if (provenance.effectiveTo && !validDate(provenance.effectiveTo)) {
    push(
      issues,
      "error",
      "EFFECTIVE_TO_INVALID",
      `${path}.effectiveTo`,
      "effectiveTo must be YYYY-MM-DD.",
    );
  }

  if (
    provenance.effectiveFrom &&
    provenance.effectiveTo &&
    provenance.effectiveFrom > provenance.effectiveTo
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
  lat: number,
  lng: number,
  path: string,
) {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    push(
      issues,
      "error",
      "LATITUDE_INVALID",
      `${path}.lat`,
      "Latitude must be between -90 and 90.",
    );
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    push(
      issues,
      "error",
      "LONGITUDE_INVALID",
      `${path}.lng`,
      "Longitude must be between -180 and 180.",
    );
  }
}

function duplicateIds<T extends { id: string }>(
  issues: ValidationIssue[],
  values: T[],
  path: string,
) {
  const seen = new Set<string>();

  values.forEach((value, index) => {
    if (!value.id?.trim()) {
      push(
        issues,
        "error",
        "ID_REQUIRED",
        `${path}[${index}].id`,
        "Stable ID is required.",
      );
      return;
    }

    if (seen.has(value.id)) {
      push(
        issues,
        "error",
        "DUPLICATE_ID",
        `${path}[${index}].id`,
        `Duplicate ID: ${value.id}`,
      );
    }

    seen.add(value.id);
  });
}

function edgeIncidentCount(edges: RouteEdge[]) {
  const counts = new Map<string, number>();

  for (const edge of edges) {
    counts.set(edge.fromNodeId, (counts.get(edge.fromNodeId) ?? 0) + 1);
    counts.set(edge.toNodeId, (counts.get(edge.toNodeId) ?? 0) + 1);
  }

  return counts;
}

export function validateWildRouteData(
  value: WildRouteDataPackage,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!value || typeof value !== "object") {
    return [
      {
        severity: "error",
        code: "PACKAGE_REQUIRED",
        path: "$",
        message: "WildRoute data package is required.",
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

  const zones = Array.isArray(value.zones) ? value.zones : [];
  const places = Array.isArray(value.places) ? value.places : [];
  const routeNodes = Array.isArray(value.routeNodes) ? value.routeNodes : [];
  const routeEdges = Array.isArray(value.routeEdges) ? value.routeEdges : [];
  const scheduleEvents = Array.isArray(value.scheduleEvents)
    ? value.scheduleEvents
    : [];

  if (!Array.isArray(value.zones)) {
    push(issues, "error", "ZONES_REQUIRED", "zones", "zones must be an array.");
  }
  if (!Array.isArray(value.places)) {
    push(issues, "error", "PLACES_REQUIRED", "places", "places must be an array.");
  }
  if (!Array.isArray(value.routeNodes)) {
    push(
      issues,
      "error",
      "ROUTE_NODES_REQUIRED",
      "routeNodes",
      "routeNodes must be an array.",
    );
  }
  if (!Array.isArray(value.routeEdges)) {
    push(
      issues,
      "error",
      "ROUTE_EDGES_REQUIRED",
      "routeEdges",
      "routeEdges must be an array.",
    );
  }
  if (!Array.isArray(value.scheduleEvents)) {
    push(
      issues,
      "error",
      "SCHEDULE_EVENTS_REQUIRED",
      "scheduleEvents",
      "scheduleEvents must be an array.",
    );
  }

  duplicateIds(issues, zones, "zones");
  duplicateIds(issues, places, "places");
  duplicateIds(issues, routeNodes, "routeNodes");
  duplicateIds(issues, routeEdges, "routeEdges");
  duplicateIds(issues, scheduleEvents, "scheduleEvents");

  const zoneIds = new Set(zones.map((zone) => zone.id));
  const placeIds = new Set(places.map((place) => place.id));
  const nodeIds = new Set(routeNodes.map((node) => node.id));

  zones.forEach((zone, index) => {
    if (!zone.name?.trim()) {
      push(
        issues,
        "error",
        "ZONE_NAME_REQUIRED",
        `zones[${index}].name`,
        "Zone name is required.",
      );
    }
    validateProvenance(issues, zone.provenance, `zones[${index}].provenance`);
  });

  routeNodes.forEach((node, index) => {
    if (!zoneIds.has(node.zoneId)) {
      push(
        issues,
        "error",
        "NODE_ZONE_UNKNOWN",
        `routeNodes[${index}].zoneId`,
        `Unknown zone ID: ${node.zoneId}`,
      );
    }
    validateCoordinates(issues, node.lat, node.lng, `routeNodes[${index}]`);
    validateProvenance(
      issues,
      node.provenance,
      `routeNodes[${index}].provenance`,
    );
  });

  places.forEach((place, index) => {
    if (!zoneIds.has(place.zoneId)) {
      push(
        issues,
        "error",
        "PLACE_ZONE_UNKNOWN",
        `places[${index}].zoneId`,
        `Unknown zone ID: ${place.zoneId}`,
      );
    }

    if (!nodeIds.has(place.routeNodeId)) {
      push(
        issues,
        "error",
        "PLACE_ROUTE_NODE_UNKNOWN",
        `places[${index}].routeNodeId`,
        `Unknown route node ID: ${place.routeNodeId}`,
      );
    }

    if (!place.name?.trim()) {
      push(
        issues,
        "error",
        "PLACE_NAME_REQUIRED",
        `places[${index}].name`,
        "Place name is required.",
      );
    }

    if (!place.navigationPoint) {
      push(
        issues,
        "error",
        "NAVIGATION_POINT_REQUIRED",
        `places[${index}].navigationPoint`,
        "Guest-facing navigation point is required.",
      );
    } else {
      validateCoordinates(
        issues,
        place.navigationPoint.lat,
        place.navigationPoint.lng,
        `places[${index}].navigationPoint`,
      );

      if (
        !["verified", "provisional", "unknown"].includes(
          place.navigationPoint.confidence,
        )
      ) {
        push(
          issues,
          "error",
          "NAVIGATION_CONFIDENCE_INVALID",
          `places[${index}].navigationPoint.confidence`,
          "Navigation confidence is invalid.",
        );
      }
    }

    validateProvenance(
      issues,
      place.provenance,
      `places[${index}].provenance`,
    );
  });

  routeEdges.forEach((edge, index) => {
    const path = `routeEdges[${index}]`;

    if (!nodeIds.has(edge.fromNodeId)) {
      push(
        issues,
        "error",
        "EDGE_FROM_NODE_UNKNOWN",
        `${path}.fromNodeId`,
        `Unknown route node ID: ${edge.fromNodeId}`,
      );
    }

    if (!nodeIds.has(edge.toNodeId)) {
      push(
        issues,
        "error",
        "EDGE_TO_NODE_UNKNOWN",
        `${path}.toNodeId`,
        `Unknown route node ID: ${edge.toNodeId}`,
      );
    }

    if (edge.fromNodeId === edge.toNodeId) {
      push(
        issues,
        "error",
        "EDGE_SELF_LOOP",
        path,
        "Route edge cannot connect a node to itself.",
      );
    }

    if (!Number.isFinite(edge.distanceMeters) || edge.distanceMeters <= 0) {
      push(
        issues,
        "error",
        "EDGE_DISTANCE_INVALID",
        `${path}.distanceMeters`,
        "Edge distance must be greater than zero.",
      );
    }

    if (!Number.isFinite(edge.durationMinutes) || edge.durationMinutes <= 0) {
      push(
        issues,
        "error",
        "EDGE_DURATION_INVALID",
        `${path}.durationMinutes`,
        "Edge duration must be greater than zero.",
      );
    }

    if (edge.stairs && edge.accessible) {
      push(
        issues,
        "error",
        "EDGE_ACCESSIBILITY_CONFLICT",
        path,
        "A stairs edge cannot be marked accessible.",
      );
    }

    if (edge.stairs && edge.stroller) {
      push(
        issues,
        "error",
        "EDGE_STROLLER_CONFLICT",
        path,
        "A stairs edge cannot be marked stroller-friendly.",
      );
    }

    validateProvenance(issues, edge.provenance, `${path}.provenance`);
  });

  const incident = edgeIncidentCount(routeEdges);
  routeNodes.forEach((node, index) => {
    if ((incident.get(node.id) ?? 0) === 0) {
      push(
        issues,
        "warning",
        "ORPHAN_ROUTE_NODE",
        `routeNodes[${index}]`,
        `Route node ${node.id} has no incident edges.`,
      );
    }
  });

  scheduleEvents.forEach((event, index) => {
    const path = `scheduleEvents[${index}]`;

    if (!placeIds.has(event.placeId)) {
      push(
        issues,
        "error",
        "EVENT_PLACE_UNKNOWN",
        `${path}.placeId`,
        `Unknown place ID: ${event.placeId}`,
      );
    }

    if (!validDate(event.date)) {
      push(
        issues,
        "error",
        "EVENT_DATE_INVALID",
        `${path}.date`,
        "Event date must be a real YYYY-MM-DD date.",
      );
    }

    const start = timeToMinutes(event.startTime);
    if (start === null) {
      push(
        issues,
        "error",
        "EVENT_START_TIME_INVALID",
        `${path}.startTime`,
        "Event startTime must be HH:MM.",
      );
    }

    if (event.endTime) {
      const end = timeToMinutes(event.endTime);

      if (end === null) {
        push(
          issues,
          "error",
          "EVENT_END_TIME_INVALID",
          `${path}.endTime`,
          "Event endTime must be HH:MM.",
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
      !Number.isInteger(event.recommendedArrivalMinutes) ||
      event.recommendedArrivalMinutes < 0
    ) {
      push(
        issues,
        "error",
        "EVENT_ARRIVAL_INVALID",
        `${path}.recommendedArrivalMinutes`,
        "recommendedArrivalMinutes must be a non-negative integer.",
      );
    }

    validateProvenance(issues, event.provenance, `${path}.provenance`);
  });

  return issues;
}

export function assertValidWildRouteData(value: WildRouteDataPackage) {
  const issues = validateWildRouteData(value);
  const errors = issues.filter((issue) => issue.severity === "error");

  if (errors.length > 0) {
    throw new Error(
      errors
        .map((issue) => `${issue.code} at ${issue.path}: ${issue.message}`)
        .join("\n"),
    );
  }

  return issues;
}
