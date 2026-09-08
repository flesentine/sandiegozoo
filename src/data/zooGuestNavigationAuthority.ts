import type { NavigationPoint } from "../planner/contracts.ts";
import {
  INDEPENDENT_GEOSPATIAL_OBSERVATIONS,
  INDEPENDENT_GEOSPATIAL_TARGETS,
} from "./zooGeospatialAuthority.ts";
import { OFFICIAL_MAP_ANCHORS } from "./zooMapAuthority.ts";

export type ExplicitGuestEntranceObservation = {
  id: string;
  targetId: string;
  provider: "OpenStreetMap";
  sourceUrl: string;
  sourceObjectType: "node";
  sourceObjectId: string;
  lat: number;
  lng: number;
  observedAt: string;
  entranceTag: "main";
  buildingWayId: string;
  connectedPedestrianWayIds: readonly string[];
  coordinateSemantics: "explicit-guest-entrance-node";
};

export type EntranceAccessControlObservation = {
  id: string;
  targetId: string;
  provider: "OpenStreetMap";
  sourceUrl: string;
  sourceObjectType: "node";
  sourceObjectId: string;
  lat: number;
  lng: number;
  observedAt: string;
  barrier: "turnstile";
  access: "customers";
  pedestrianWayId: string;
  coordinateSemantics: "guest-access-control-node";
};

export type EntrancePedestrianTopology = {
  id: string;
  targetId: string;
  provider: "OpenStreetMap";
  entryPlazaWayId: string;
  controlledPassageWayId: string;
  interiorContinuationWayId: string;
  interiorConnectionNodeId: string;
  frontStreetWayId: string;
  frontStreetConnectionNodeId: string;
  connectsToDescriptor: "Front Street";
  waySourceUrls: readonly string[];
  connectionNodeSourceUrls: readonly string[];
  plannerMaterialization: "topology-only";
};

export type GuestNavigationAuthorityAssessment =
  | {
      status: "blocked";
      reason: "TARGET_UNKNOWN" | "EXPLICIT_ENTRANCE_NODE_NOT_SOURCED";
      targetId: string;
      observationIds: string[];
    }
  | {
      status: "navigation-point-ready";
      targetId: string;
      observationId: string;
      navigationPoint: NavigationPoint;
      mapAnchorId: string;
      topologyId: string;
      routeGraph: {
        status: "blocked";
        reason: "ROUTE_EDGE_WEIGHTS_NOT_SOURCED";
      };
    };

const OBSERVED_AT = "2026-09-07T22:55:00-07:00";
const ISO_TIMESTAMP_RE =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

export const GUEST_NAVIGATION_SEMANTIC_CONTEXT_URLS = Object.freeze([
  "https://zoo.sandiegozoo.org/plan-your-visit",
  "https://www.sandiego.gov/blog/zoo-balboa-park-traffic-information",
] as const);

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

function validOfficialContextUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "zoo.sandiegozoo.org" ||
        url.hostname === "www.sandiego.gov" ||
        url.hostname === "sandiego.gov")
    );
  } catch {
    return false;
  }
}

const FORBIDDEN_ROUTE_FIELDS = [
  "routeNodeId",
  "distanceMeters",
  "durationMinutes",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "oneWay",
  "status",
] as const;

function assertNoRouteMaterialization(
  value: object,
  label: string,
) {
  for (const field of FORBIDDEN_ROUTE_FIELDS) {
    if (field in value) {
      throw new Error(
        `${label} cannot contain planner route field ${field}.`,
      );
    }
  }
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

const RAW_EXPLICIT_ENTRANCES: ExplicitGuestEntranceObservation[] = [
  {
    id: "sdz-guest-entrance-main-osm-node-7053320514",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    sourceUrl:
      "https://www.openstreetmap.org/node/7053320514",
    sourceObjectType: "node",
    sourceObjectId: "7053320514",
    lat: 32.735256,
    lng: -117.149182,
    observedAt: OBSERVED_AT,
    entranceTag: "main",
    buildingWayId: "79293454",
    connectedPedestrianWayIds: [
      "1126804580",
      "755054695",
    ],
    coordinateSemantics: "explicit-guest-entrance-node",
  },
];

const RAW_ACCESS_CONTROLS: EntranceAccessControlObservation[] = [
  {
    id: "sdz-guest-entrance-turnstile-osm-node-7053320517",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    sourceUrl:
      "https://www.openstreetmap.org/node/7053320517",
    sourceObjectType: "node",
    sourceObjectId: "7053320517",
    lat: 32.7352359,
    lng: -117.1492666,
    observedAt: OBSERVED_AT,
    barrier: "turnstile",
    access: "customers",
    pedestrianWayId: "755054695",
    coordinateSemantics: "guest-access-control-node",
  },
];

const RAW_TOPOLOGY: EntrancePedestrianTopology[] = [
  {
    id: "sdz-guest-entrance-main-ingress-topology",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    entryPlazaWayId: "1126804580",
    controlledPassageWayId: "755054695",
    interiorContinuationWayId: "755054694",
    interiorConnectionNodeId: "7053320516",
    frontStreetWayId: "1481425058",
    frontStreetConnectionNodeId: "7053320515",
    connectsToDescriptor: "Front Street",
    waySourceUrls: [
      "https://www.openstreetmap.org/way/1126804580",
      "https://www.openstreetmap.org/way/755054695",
      "https://www.openstreetmap.org/way/755054694",
      "https://www.openstreetmap.org/way/1481425058",
    ],
    connectionNodeSourceUrls: [
      "https://www.openstreetmap.org/node/7053320516",
      "https://www.openstreetmap.org/node/7053320515",
    ],
    plannerMaterialization: "topology-only",
  },
];

export function assertGuestNavigationAuthorityIntegrity(
  entrances: readonly ExplicitGuestEntranceObservation[],
  accessControls: readonly EntranceAccessControlObservation[],
  topology: readonly EntrancePedestrianTopology[],
) {
  for (const url of GUEST_NAVIGATION_SEMANTIC_CONTEXT_URLS) {
    if (!validOfficialContextUrl(url)) {
      throw new Error(
        `Guest navigation semantic context URL is not official: ${url}`,
      );
    }
  }

  const targetById = new Map(
    INDEPENDENT_GEOSPATIAL_TARGETS.map((target) => [
      target.id,
      target,
    ]),
  );
  const officialMapAnchorIds = new Set(
    OFFICIAL_MAP_ANCHORS.map((anchor) => anchor.id),
  );
  const featureWayIdsByTarget = new Map<string, Set<string>>();

  for (const observation of INDEPENDENT_GEOSPATIAL_OBSERVATIONS) {
    if (
      observation.provider === "OpenStreetMap" &&
      observation.sourceObjectType === "way"
    ) {
      const ids =
        featureWayIdsByTarget.get(observation.targetId) ??
        new Set<string>();
      ids.add(observation.sourceObjectId);
      featureWayIdsByTarget.set(observation.targetId, ids);
    }
  }

  const entranceIds = new Set<string>();
  const entranceSourceObjects = new Set<string>();
  const entranceByTarget = new Map<
    string,
    ExplicitGuestEntranceObservation
  >();

  for (const entrance of entrances) {
    assertNoRouteMaterialization(
      entrance,
      `Explicit guest entrance ${entrance.id}`,
    );

    if (!stableId(entrance.id)) {
      throw new Error(
        "Explicit guest entrance contains an invalid stable ID.",
      );
    }
    if (entranceIds.has(entrance.id)) {
      throw new Error(
        `Duplicate explicit guest entrance ID: ${entrance.id}`,
      );
    }
    entranceIds.add(entrance.id);

    const target = targetById.get(entrance.targetId);
    if (!target) {
      throw new Error(
        `Explicit guest entrance ${entrance.id} references unknown target ${entrance.targetId}.`,
      );
    }
    if (!officialMapAnchorIds.has(target.mapAnchorId)) {
      throw new Error(
        `Explicit guest entrance ${entrance.id} target does not match a known official map anchor.`,
      );
    }
    if (entranceByTarget.has(entrance.targetId)) {
      throw new Error(
        `Multiple explicit guest entrance nodes exist for target ${entrance.targetId} without a routing-preference authority.`,
      );
    }

    if (
      entrance.provider !== "OpenStreetMap" ||
      entrance.sourceObjectType !== "node" ||
      entrance.entranceTag !== "main" ||
      entrance.coordinateSemantics !==
        "explicit-guest-entrance-node"
    ) {
      throw new Error(
        `Explicit guest entrance ${entrance.id} has unsupported entrance authority semantics.`,
      );
    }

    if (
      !stableId(entrance.sourceObjectId) ||
      !validOsmObjectUrl(
        entrance.sourceUrl,
        "node",
        entrance.sourceObjectId,
      ) ||
      !validCoordinate(entrance.lat, entrance.lng) ||
      !validObservedAt(entrance.observedAt)
    ) {
      throw new Error(
        `Explicit guest entrance ${entrance.id} is malformed.`,
      );
    }

    const sourceObjectKey =
      `${entrance.provider}:node:${entrance.sourceObjectId}`;
    if (entranceSourceObjects.has(sourceObjectKey)) {
      throw new Error(
        `Duplicate explicit guest entrance source object: ${sourceObjectKey}`,
      );
    }
    entranceSourceObjects.add(sourceObjectKey);

    if (
      !stableId(entrance.buildingWayId) ||
      !featureWayIdsByTarget
        .get(entrance.targetId)
        ?.has(entrance.buildingWayId)
    ) {
      throw new Error(
        `Explicit guest entrance ${entrance.id} does not match the target's sourced feature way.`,
      );
    }

    if (
      entrance.connectedPedestrianWayIds.length === 0 ||
      new Set(entrance.connectedPedestrianWayIds).size !==
        entrance.connectedPedestrianWayIds.length ||
      entrance.connectedPedestrianWayIds.some(
        (id) => !stableId(id),
      )
    ) {
      throw new Error(
        `Explicit guest entrance ${entrance.id} has invalid connected pedestrian ways.`,
      );
    }

    entranceByTarget.set(entrance.targetId, entrance);
  }

  const accessIds = new Set<string>();
  const accessByTarget = new Map<
    string,
    EntranceAccessControlObservation
  >();

  for (const accessControl of accessControls) {
    assertNoRouteMaterialization(
      accessControl,
      `Entrance access control ${accessControl.id}`,
    );

    if (!stableId(accessControl.id)) {
      throw new Error(
        "Entrance access-control observation contains an invalid stable ID.",
      );
    }
    if (accessIds.has(accessControl.id)) {
      throw new Error(
        `Duplicate entrance access-control ID: ${accessControl.id}`,
      );
    }
    accessIds.add(accessControl.id);

    const entrance = entranceByTarget.get(
      accessControl.targetId,
    );
    if (!entrance) {
      throw new Error(
        `Entrance access control ${accessControl.id} has no explicit entrance target authority.`,
      );
    }
    if (accessByTarget.has(accessControl.targetId)) {
      throw new Error(
        `Multiple access-control nodes exist for target ${accessControl.targetId} without a selection rule.`,
      );
    }

    if (
      accessControl.provider !== "OpenStreetMap" ||
      accessControl.sourceObjectType !== "node" ||
      accessControl.barrier !== "turnstile" ||
      accessControl.access !== "customers" ||
      accessControl.coordinateSemantics !==
        "guest-access-control-node"
    ) {
      throw new Error(
        `Entrance access control ${accessControl.id} has unsupported authority semantics.`,
      );
    }

    if (
      !stableId(accessControl.sourceObjectId) ||
      !validOsmObjectUrl(
        accessControl.sourceUrl,
        "node",
        accessControl.sourceObjectId,
      ) ||
      !validCoordinate(
        accessControl.lat,
        accessControl.lng,
      ) ||
      !validObservedAt(accessControl.observedAt) ||
      !stableId(accessControl.pedestrianWayId)
    ) {
      throw new Error(
        `Entrance access control ${accessControl.id} is malformed.`,
      );
    }

    if (
      !entrance.connectedPedestrianWayIds.includes(
        accessControl.pedestrianWayId,
      )
    ) {
      throw new Error(
        `Entrance access control ${accessControl.id} is not on a pedestrian way connected to the explicit entrance node.`,
      );
    }

    accessByTarget.set(
      accessControl.targetId,
      accessControl,
    );
  }

  const topologyIds = new Set<string>();
  const topologyByTarget = new Map<
    string,
    EntrancePedestrianTopology
  >();

  for (const record of topology) {
    assertNoRouteMaterialization(
      record,
      `Entrance topology ${record.id}`,
    );

    if (!stableId(record.id)) {
      throw new Error(
        "Entrance pedestrian topology contains an invalid stable ID.",
      );
    }
    if (topologyIds.has(record.id)) {
      throw new Error(
        `Duplicate entrance pedestrian topology ID: ${record.id}`,
      );
    }
    topologyIds.add(record.id);

    const entrance = entranceByTarget.get(record.targetId);
    const accessControl = accessByTarget.get(record.targetId);
    if (!entrance || !accessControl) {
      throw new Error(
        `Entrance topology ${record.id} requires explicit entrance and access-control authority.`,
      );
    }
    if (topologyByTarget.has(record.targetId)) {
      throw new Error(
        `Multiple entrance topology records exist for target ${record.targetId}.`,
      );
    }

    if (
      record.provider !== "OpenStreetMap" ||
      record.connectsToDescriptor !== "Front Street" ||
      record.plannerMaterialization !== "topology-only"
    ) {
      throw new Error(
        `Entrance topology ${record.id} has unsupported semantics.`,
      );
    }

    const wayIds = [
      record.entryPlazaWayId,
      record.controlledPassageWayId,
      record.interiorContinuationWayId,
      record.frontStreetWayId,
    ];
    const connectionNodeIds = [
      record.interiorConnectionNodeId,
      record.frontStreetConnectionNodeId,
    ];
    if (
      wayIds.some((id) => !stableId(id)) ||
      new Set(wayIds).size !== wayIds.length ||
      connectionNodeIds.some((id) => !stableId(id)) ||
      new Set(connectionNodeIds).size !==
        connectionNodeIds.length ||
      record.controlledPassageWayId !==
        accessControl.pedestrianWayId ||
      !entrance.connectedPedestrianWayIds.includes(
        record.entryPlazaWayId,
      ) ||
      !entrance.connectedPedestrianWayIds.includes(
        record.controlledPassageWayId,
      )
    ) {
      throw new Error(
        `Entrance topology ${record.id} does not preserve the sourced ingress chain.`,
      );
    }

    if (
      record.waySourceUrls.length !== wayIds.length ||
      record.waySourceUrls.some(
        (url, index) =>
          !validOsmObjectUrl(url, "way", wayIds[index]),
      ) ||
      record.connectionNodeSourceUrls.length !==
        connectionNodeIds.length ||
      record.connectionNodeSourceUrls.some(
        (url, index) =>
          !validOsmObjectUrl(
            url,
            "node",
            connectionNodeIds[index],
          ),
      )
    ) {
      throw new Error(
        `Entrance topology ${record.id} has invalid source URLs.`,
      );
    }

    topologyByTarget.set(record.targetId, record);
  }

  for (const entrance of entrances) {
    if (!accessByTarget.has(entrance.targetId)) {
      throw new Error(
        `Explicit guest entrance ${entrance.id} has no sourced guest access-control node.`,
      );
    }
    if (!topologyByTarget.has(entrance.targetId)) {
      throw new Error(
        `Explicit guest entrance ${entrance.id} has no sourced pedestrian ingress topology.`,
      );
    }
  }
}

assertGuestNavigationAuthorityIntegrity(
  RAW_EXPLICIT_ENTRANCES,
  RAW_ACCESS_CONTROLS,
  RAW_TOPOLOGY,
);

export const EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS:
  readonly ExplicitGuestEntranceObservation[] =
  deepFreeze(RAW_EXPLICIT_ENTRANCES);

export const ENTRANCE_ACCESS_CONTROL_OBSERVATIONS:
  readonly EntranceAccessControlObservation[] =
  deepFreeze(RAW_ACCESS_CONTROLS);

export const ENTRANCE_PEDESTRIAN_TOPOLOGY:
  readonly EntrancePedestrianTopology[] =
  deepFreeze(RAW_TOPOLOGY);

export function explicitGuestEntranceForTarget(
  targetId: string,
) {
  return EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS.find(
    (observation) => observation.targetId === targetId,
  );
}

export function entranceAccessControlForTarget(
  targetId: string,
) {
  return ENTRANCE_ACCESS_CONTROL_OBSERVATIONS.find(
    (observation) => observation.targetId === targetId,
  );
}

export function entrancePedestrianTopologyForTarget(
  targetId: string,
) {
  return ENTRANCE_PEDESTRIAN_TOPOLOGY.find(
    (record) => record.targetId === targetId,
  );
}

export function assessGuestNavigationAuthority(
  targetId: string,
): GuestNavigationAuthorityAssessment {
  const target = INDEPENDENT_GEOSPATIAL_TARGETS.find(
    (candidate) => candidate.id === targetId,
  );

  if (!target) {
    return {
      status: "blocked",
      reason: "TARGET_UNKNOWN",
      targetId,
      observationIds: [],
    };
  }

  const entrance = explicitGuestEntranceForTarget(targetId);
  if (!entrance) {
    return {
      status: "blocked",
      reason: "EXPLICIT_ENTRANCE_NODE_NOT_SOURCED",
      targetId,
      observationIds: [],
    };
  }

  const topology =
    entrancePedestrianTopologyForTarget(targetId);
  if (!topology) {
    throw new Error(
      `Integrity failure: target ${targetId} is missing entrance topology.`,
    );
  }

  return {
    status: "navigation-point-ready",
    targetId,
    observationId: entrance.id,
    navigationPoint: deepFreeze({
      lat: entrance.lat,
      lng: entrance.lng,
      confidence: "verified",
    }),
    mapAnchorId: target.mapAnchorId,
    topologyId: topology.id,
    routeGraph: {
      status: "blocked",
      reason: "ROUTE_EDGE_WEIGHTS_NOT_SOURCED",
    },
  };
}
