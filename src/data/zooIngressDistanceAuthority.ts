import {
  ENTRANCE_ACCESS_CONTROL_OBSERVATIONS,
  ENTRANCE_PEDESTRIAN_TOPOLOGY,
  EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS,
} from "./zooGuestNavigationAuthority.ts";

export type IngressGeometryNode = {
  id: string;
  targetId: string;
  provider: "OpenStreetMap";
  sourceObjectType: "node";
  sourceObjectId: string;
  sourceUrl: string;
  lat: number;
  lng: number;
  observedAt: string;
  coordinateSemantics: "source-geometry-node";
};

export type IngressGeometryWay = {
  id: string;
  targetId: string;
  provider: "OpenStreetMap";
  sourceObjectType: "way";
  sourceObjectId: string;
  sourceUrl: string;
  highwayTag: "pedestrian";
  geometryRole:
    | "controlled-entrance-passage"
    | "interior-front-street-connection";
  nodeIds: readonly string[];
  observedAt: string;
  plannerMaterialization: "distance-derivation-only";
};

export type DerivedIngressDistance = {
  id: string;
  targetId: string;
  sourceWayId: string;
  fromNodeId: string;
  toNodeId: string;
  nodeIds: readonly string[];
  distanceMeters: number;
  derivationMethod: "haversine-segment-sum";
  earthRadiusMeters: 6371000;
  roundingDecimals: 3;
  accuracyClaim: "no-survey-accuracy-claim";
  plannerMaterialization: "distance-only";
};

export type IngressDistanceAuthorityAssessment =
  | {
      status: "blocked";
      reason: "TARGET_UNKNOWN" | "INGRESS_GEOMETRY_NOT_SOURCED";
      targetId: string;
    }
  | {
      status: "distance-ready";
      targetId: string;
      segmentIds: string[];
      totalDistanceMeters: number;
      derivationMethod: "haversine-segment-sum";
      routeEdge: {
        status: "blocked";
        reason: "ROUTE_EDGE_SEMANTICS_NOT_SOURCED";
      };
    };

const OBSERVED_AT = "2026-09-07T23:05:00-07:00";
const EARTH_RADIUS_METERS = 6_371_000 as const;
const ROUNDING_DECIMALS = 3 as const;
const ISO_TIMESTAMP_RE =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

const FORBIDDEN_ROUTE_FIELDS = [
  "durationMinutes",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "oneWay",
  "status",
  "routeNodeId",
] as const;

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

function stableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function validCoordinate(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function validObservedAt(value: string) {
  return (
    ISO_TIMESTAMP_RE.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function validOsmObjectUrl(
  value: string,
  objectType: "node" | "way",
  objectId: string,
) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.openstreetmap.org" &&
      url.pathname === `/${objectType}/${objectId}`
    );
  } catch {
    return false;
  }
}

function assertNoUnsupportedRouteFields(
  value: object,
  label: string,
) {
  for (const field of FORBIDDEN_ROUTE_FIELDS) {
    if (field in value) {
      throw new Error(
        `${label} cannot contain unsupported Planner RouteEdge field ${field}.`,
      );
    }
  }
}

function haversineMeters(
  a: Pick<IngressGeometryNode, "lat" | "lng">,
  b: Pick<IngressGeometryNode, "lat" | "lng">,
) {
  const toRadians = (value: number) =>
    (value * Math.PI) / 180;

  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(lat1) *
      Math.cos(lat2) *
      sinLng *
      sinLng;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.asin(Math.min(1, Math.sqrt(h)))
  );
}

function roundDistance(value: number) {
  const scale = 10 ** ROUNDING_DECIMALS;
  return Math.round(value * scale) / scale;
}

const RAW_NODES: IngressGeometryNode[] = [
  {
    id: "sdz-ingress-node-main-entrance",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    sourceObjectType: "node",
    sourceObjectId: "7053320514",
    sourceUrl:
      "https://www.openstreetmap.org/node/7053320514",
    lat: 32.735256,
    lng: -117.149182,
    observedAt: OBSERVED_AT,
    coordinateSemantics: "source-geometry-node",
  },
  {
    id: "sdz-ingress-node-turnstile",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    sourceObjectType: "node",
    sourceObjectId: "7053320517",
    sourceUrl:
      "https://www.openstreetmap.org/node/7053320517",
    lat: 32.7352359,
    lng: -117.1492666,
    observedAt: OBSERVED_AT,
    coordinateSemantics: "source-geometry-node",
  },
  {
    id: "sdz-ingress-node-interior",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    sourceObjectType: "node",
    sourceObjectId: "7053320516",
    sourceUrl:
      "https://www.openstreetmap.org/node/7053320516",
    lat: 32.7352145,
    lng: -117.1493551,
    observedAt: OBSERVED_AT,
    coordinateSemantics: "source-geometry-node",
  },
  {
    id: "sdz-ingress-node-interior-junction",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    sourceObjectType: "node",
    sourceObjectId: "13587192693",
    sourceUrl:
      "https://www.openstreetmap.org/node/13587192693",
    lat: 32.7351734,
    lng: -117.1494973,
    observedAt: OBSERVED_AT,
    coordinateSemantics: "source-geometry-node",
  },
  {
    id: "sdz-ingress-node-front-street",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    sourceObjectType: "node",
    sourceObjectId: "7053320515",
    sourceUrl:
      "https://www.openstreetmap.org/node/7053320515",
    lat: 32.7351404,
    lng: -117.1496117,
    observedAt: OBSERVED_AT,
    coordinateSemantics: "source-geometry-node",
  },
];

const RAW_WAYS: IngressGeometryWay[] = [
  {
    id: "sdz-ingress-way-controlled-passage",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    sourceObjectType: "way",
    sourceObjectId: "755054695",
    sourceUrl:
      "https://www.openstreetmap.org/way/755054695",
    highwayTag: "pedestrian",
    geometryRole: "controlled-entrance-passage",
    nodeIds: [
      "7053320514",
      "7053320517",
      "7053320516",
    ],
    observedAt: OBSERVED_AT,
    plannerMaterialization: "distance-derivation-only",
  },
  {
    id: "sdz-ingress-way-front-street-connection",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    sourceObjectType: "way",
    sourceObjectId: "755054694",
    sourceUrl:
      "https://www.openstreetmap.org/way/755054694",
    highwayTag: "pedestrian",
    geometryRole: "interior-front-street-connection",
    nodeIds: [
      "7053320516",
      "13587192693",
      "7053320515",
    ],
    observedAt: OBSERVED_AT,
    plannerMaterialization: "distance-derivation-only",
  },
];

export function derivePolylineDistanceMeters(
  nodeIds: readonly string[],
  nodes: readonly IngressGeometryNode[] = RAW_NODES,
) {
  if (nodeIds.length < 2) {
    throw new Error(
      "Polyline distance requires at least two source nodes.",
    );
  }

  const nodeBySourceId = new Map(
    nodes.map((node) => [
      node.sourceObjectId,
      node,
    ]),
  );

  let distanceMeters = 0;
  for (let index = 0; index < nodeIds.length - 1; index += 1) {
    const from = nodeBySourceId.get(nodeIds[index]);
    const to = nodeBySourceId.get(nodeIds[index + 1]);
    if (!from || !to) {
      throw new Error(
        `Polyline references unknown source node between ${nodeIds[index]} and ${nodeIds[index + 1]}.`,
      );
    }
    distanceMeters += haversineMeters(from, to);
  }

  return roundDistance(distanceMeters);
}

function deriveDistances(
  ways: readonly IngressGeometryWay[],
  nodes: readonly IngressGeometryNode[],
): DerivedIngressDistance[] {
  return ways.map((way) => ({
    id: `${way.id}-distance`,
    targetId: way.targetId,
    sourceWayId: way.sourceObjectId,
    fromNodeId: way.nodeIds[0],
    toNodeId: way.nodeIds[way.nodeIds.length - 1],
    nodeIds: [...way.nodeIds],
    distanceMeters: derivePolylineDistanceMeters(
      way.nodeIds,
      nodes,
    ),
    derivationMethod: "haversine-segment-sum",
    earthRadiusMeters: EARTH_RADIUS_METERS,
    roundingDecimals: ROUNDING_DECIMALS,
    accuracyClaim: "no-survey-accuracy-claim",
    plannerMaterialization: "distance-only",
  }));
}

const RAW_DERIVED_DISTANCES = deriveDistances(
  RAW_WAYS,
  RAW_NODES,
);

export function assertIngressDistanceAuthorityIntegrity(
  nodes: readonly IngressGeometryNode[],
  ways: readonly IngressGeometryWay[],
  distances: readonly DerivedIngressDistance[],
) {
  const entrance =
    EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS.find(
      (candidate) =>
        candidate.targetId === "sdz-geo-main-entrance",
    );
  const accessControl =
    ENTRANCE_ACCESS_CONTROL_OBSERVATIONS.find(
      (candidate) =>
        candidate.targetId === "sdz-geo-main-entrance",
    );
  const topology = ENTRANCE_PEDESTRIAN_TOPOLOGY.find(
    (candidate) =>
      candidate.targetId === "sdz-geo-main-entrance",
  );

  if (!entrance || !accessControl || !topology) {
    throw new Error(
      "Planner 13 requires the qualified Planner 12 main-entrance authority.",
    );
  }

  const nodeIds = new Set<string>();
  const sourceNodeIds = new Set<string>();
  const nodeBySourceId = new Map<
    string,
    IngressGeometryNode
  >();

  for (const node of nodes) {
    assertNoUnsupportedRouteFields(
      node,
      `Ingress geometry node ${node.id}`,
    );

    if (!stableId(node.id) || nodeIds.has(node.id)) {
      throw new Error(
        `Invalid or duplicate ingress geometry node ID: ${node.id}`,
      );
    }
    nodeIds.add(node.id);

    if (
      node.provider !== "OpenStreetMap" ||
      node.sourceObjectType !== "node" ||
      node.coordinateSemantics !== "source-geometry-node" ||
      !stableId(node.sourceObjectId) ||
      sourceNodeIds.has(node.sourceObjectId) ||
      !validOsmObjectUrl(
        node.sourceUrl,
        "node",
        node.sourceObjectId,
      ) ||
      !validCoordinate(node.lat, node.lng) ||
      !validObservedAt(node.observedAt)
    ) {
      throw new Error(
        `Ingress geometry node ${node.id} is malformed.`,
      );
    }
    sourceNodeIds.add(node.sourceObjectId);
    nodeBySourceId.set(node.sourceObjectId, node);
  }

  const requiredNodeIds = new Set([
    entrance.sourceObjectId,
    accessControl.sourceObjectId,
    topology.interiorConnectionNodeId,
    topology.frontStreetConnectionNodeId,
    "13587192693",
  ]);
  for (const requiredId of requiredNodeIds) {
    if (!sourceNodeIds.has(requiredId)) {
      throw new Error(
        `Ingress geometry is missing required source node ${requiredId}.`,
      );
    }
  }

  const entranceNode = nodeBySourceId.get(
    entrance.sourceObjectId,
  );
  const accessNode = nodeBySourceId.get(
    accessControl.sourceObjectId,
  );
  if (
    !entranceNode ||
    entranceNode.lat !== entrance.lat ||
    entranceNode.lng !== entrance.lng ||
    !accessNode ||
    accessNode.lat !== accessControl.lat ||
    accessNode.lng !== accessControl.lng
  ) {
    throw new Error(
      "Ingress geometry node coordinates do not preserve Planner 12 entrance/access authority.",
    );
  }

  const wayIds = new Set<string>();
  const sourceWayIds = new Set<string>();
  const wayBySourceId = new Map<
    string,
    IngressGeometryWay
  >();

  for (const way of ways) {
    assertNoUnsupportedRouteFields(
      way,
      `Ingress geometry way ${way.id}`,
    );

    if (!stableId(way.id) || wayIds.has(way.id)) {
      throw new Error(
        `Invalid or duplicate ingress geometry way ID: ${way.id}`,
      );
    }
    wayIds.add(way.id);

    if (
      way.provider !== "OpenStreetMap" ||
      way.sourceObjectType !== "way" ||
      way.highwayTag !== "pedestrian" ||
      (way.geometryRole !==
        "controlled-entrance-passage" &&
        way.geometryRole !==
          "interior-front-street-connection") ||
      way.plannerMaterialization !==
        "distance-derivation-only" ||
      !stableId(way.sourceObjectId) ||
      sourceWayIds.has(way.sourceObjectId) ||
      !validOsmObjectUrl(
        way.sourceUrl,
        "way",
        way.sourceObjectId,
      ) ||
      !validObservedAt(way.observedAt) ||
      way.nodeIds.length < 2 ||
      way.nodeIds.some((id) => !sourceNodeIds.has(id))
    ) {
      throw new Error(
        `Ingress geometry way ${way.id} is malformed.`,
      );
    }
    sourceWayIds.add(way.sourceObjectId);
    wayBySourceId.set(way.sourceObjectId, way);
  }

  const controlledWay = wayBySourceId.get(
    topology.controlledPassageWayId,
  );
  const interiorWay = wayBySourceId.get(
    topology.interiorContinuationWayId,
  );

  if (
    !controlledWay ||
    JSON.stringify(controlledWay.nodeIds) !==
      JSON.stringify([
        entrance.sourceObjectId,
        accessControl.sourceObjectId,
        topology.interiorConnectionNodeId,
      ])
  ) {
    throw new Error(
      "Controlled ingress geometry does not preserve the sourced entrance-turnstile-interior node order.",
    );
  }

  if (
    !interiorWay ||
    interiorWay.nodeIds[0] !==
      topology.interiorConnectionNodeId ||
    interiorWay.nodeIds[
      interiorWay.nodeIds.length - 1
    ] !== topology.frontStreetConnectionNodeId
  ) {
    throw new Error(
      "Interior ingress geometry does not preserve the sourced Front Street connection.",
    );
  }

  const distanceIds = new Set<string>();
  const distanceWayIds = new Set<string>();

  for (const distance of distances) {
    assertNoUnsupportedRouteFields(
      distance,
      `Derived ingress distance ${distance.id}`,
    );

    if (
      !stableId(distance.id) ||
      distanceIds.has(distance.id)
    ) {
      throw new Error(
        `Invalid or duplicate derived ingress distance ID: ${distance.id}`,
      );
    }
    distanceIds.add(distance.id);

    const way = wayBySourceId.get(distance.sourceWayId);
    if (
      !way ||
      distanceWayIds.has(distance.sourceWayId) ||
      distance.targetId !== way.targetId ||
      distance.fromNodeId !== way.nodeIds[0] ||
      distance.toNodeId !==
        way.nodeIds[way.nodeIds.length - 1] ||
      JSON.stringify(distance.nodeIds) !==
        JSON.stringify(way.nodeIds) ||
      distance.derivationMethod !==
        "haversine-segment-sum" ||
      distance.earthRadiusMeters !==
        EARTH_RADIUS_METERS ||
      distance.roundingDecimals !==
        ROUNDING_DECIMALS ||
      distance.accuracyClaim !==
        "no-survey-accuracy-claim" ||
      distance.plannerMaterialization !==
        "distance-only"
    ) {
      throw new Error(
        `Derived ingress distance ${distance.id} does not match its source geometry.`,
      );
    }

    const recomputed = derivePolylineDistanceMeters(
      way.nodeIds,
      nodes,
    );
    if (distance.distanceMeters !== recomputed) {
      throw new Error(
        `Derived ingress distance ${distance.id} is not reproducible from source coordinates.`,
      );
    }

    distanceWayIds.add(distance.sourceWayId);
  }

  if (distanceWayIds.size !== ways.length) {
    throw new Error(
      "Every ingress geometry way requires exactly one derived distance record.",
    );
  }
}

assertIngressDistanceAuthorityIntegrity(
  RAW_NODES,
  RAW_WAYS,
  RAW_DERIVED_DISTANCES,
);

export const INGRESS_GEOMETRY_NODES:
  readonly IngressGeometryNode[] =
  deepFreeze(RAW_NODES);

export const INGRESS_GEOMETRY_WAYS:
  readonly IngressGeometryWay[] =
  deepFreeze(RAW_WAYS);

export const DERIVED_INGRESS_DISTANCES:
  readonly DerivedIngressDistance[] =
  deepFreeze(RAW_DERIVED_DISTANCES);

export function assessIngressDistanceAuthority(
  targetId: string,
): IngressDistanceAuthorityAssessment {
  const knownTarget =
    EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS.some(
      (entrance) => entrance.targetId === targetId,
    ) ||
    ENTRANCE_PEDESTRIAN_TOPOLOGY.some(
      (record) => record.targetId === targetId,
    );

  if (!knownTarget) {
    const isKnownPlanner12Target =
      targetId === "sdz-geo-wegeforth-bowl";
    return {
      status: "blocked",
      reason: isKnownPlanner12Target
        ? "INGRESS_GEOMETRY_NOT_SOURCED"
        : "TARGET_UNKNOWN",
      targetId,
    };
  }

  const distances = DERIVED_INGRESS_DISTANCES.filter(
    (distance) => distance.targetId === targetId,
  );

  if (distances.length === 0) {
    return {
      status: "blocked",
      reason: "INGRESS_GEOMETRY_NOT_SOURCED",
      targetId,
    };
  }

  return {
    status: "distance-ready",
    targetId,
    segmentIds: distances.map((distance) => distance.id),
    totalDistanceMeters: roundDistance(
      distances.reduce(
        (sum, distance) =>
          sum + distance.distanceMeters,
        0,
      ),
    ),
    derivationMethod: "haversine-segment-sum",
    routeEdge: {
      status: "blocked",
      reason: "ROUTE_EDGE_SEMANTICS_NOT_SOURCED",
    },
  };
}
