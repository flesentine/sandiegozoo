import {
  OFFICIAL_MAP_ANCHORS,
} from "./zooMapAuthority.ts";
import {
  sourceBackedRecordById,
} from "./zooSourceCatalog.ts";

export type GeospatialTarget = {
  id: string;
  canonicalName: string;
  targetKind: "source-record" | "map-anchor";
  sourceRecordId?: string;
  mapAnchorId: string;
  officialContextUrl?: string;
  plannerMaterialization: "feature-geometry-only";
};

export type IndependentGeospatialObservation = {
  id: string;
  targetId: string;
  provider: "OpenStreetMap" | "GeoNames";
  retrievalUrl: string;
  sourceObjectType: "way" | "feature";
  sourceObjectId: string;
  lat: number;
  lng: number;
  observedAt: string;
  coordinateSemantics:
    "mapped-feature-representative-point";
  featureClass:
    | "theatre-building"
    | "entrance-building";
};

export type FeatureAuthorityAssessment =
  | {
      status: "unknown-target";
      targetId: string;
    }
  | {
      status: "single-source-feature-location";
      targetId: string;
      observationIds: string[];
    }
  | {
      status: "corroborated-feature-location";
      targetId: string;
      observationIds: string[];
      maximumSourceSeparationMeters: number;
    }
  | {
      status: "conflicting-feature-location";
      targetId: string;
      observationIds: string[];
      maximumSourceSeparationMeters: number;
    };

export type GuestNavigationPointAssessment =
  | {
      status: "blocked";
      reason: "TARGET_UNKNOWN";
      targetId: string;
      observationIds: string[];
    }
  | {
      status: "blocked";
      reason: "GUEST_ENTRANCE_POINT_NOT_SOURCED";
      targetId: string;
      observationIds: string[];
    };

const OBSERVED_AT = "2026-09-07T22:20:00-07:00";
const CORROBORATION_MAX_SEPARATION_METERS = 25;

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function stableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

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

function validCoordinate(
  lat: number,
  lng: number,
) {
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
    /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(
      value,
    ) && Number.isFinite(Date.parse(value))
  );
}

function validHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validOfficialContextUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "www.sandiego.gov" ||
        url.hostname === "sandiego.gov" ||
        url.hostname === "zoo.sandiegozoo.org")
    );
  } catch {
    return false;
  }
}

function haversineMeters(
  a: Pick<IndependentGeospatialObservation, "lat" | "lng">,
  b: Pick<IndependentGeospatialObservation, "lat" | "lng">,
) {
  const earthRadiusMeters = 6_371_000;
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
    earthRadiusMeters *
    Math.asin(Math.min(1, Math.sqrt(h)))
  );
}

const RAW_TARGETS: GeospatialTarget[] = [
  {
    id: "sdz-geo-wegeforth-bowl",
    canonicalName: "Wegeforth Bowl",
    targetKind: "source-record",
    sourceRecordId: "sdz-wildlife-wonders",
    mapAnchorId: "sdz-map-anchor-wegeforth-bowl",
    plannerMaterialization: "feature-geometry-only",
  },
  {
    id: "sdz-geo-main-entrance",
    canonicalName: "San Diego Zoo Main Entrance",
    targetKind: "map-anchor",
    mapAnchorId: "sdz-map-anchor-entrance",
    officialContextUrl:
      "https://www.sandiego.gov/blog/zoo-balboa-park-traffic-information",
    plannerMaterialization: "feature-geometry-only",
  },
];

const RAW_OBSERVATIONS: IndependentGeospatialObservation[] = [
  {
    id: "sdz-geoobs-wegeforth-osm-way-79135720",
    targetId: "sdz-geo-wegeforth-bowl",
    provider: "OpenStreetMap",
    retrievalUrl: "https://mapcarta.com/W79135720",
    sourceObjectType: "way",
    sourceObjectId: "79135720",
    lat: 32.73367,
    lng: -117.14972,
    observedAt: OBSERVED_AT,
    coordinateSemantics:
      "mapped-feature-representative-point",
    featureClass: "theatre-building",
  },
  {
    id: "sdz-geoobs-wegeforth-geonames-5407722",
    targetId: "sdz-geo-wegeforth-bowl",
    provider: "GeoNames",
    retrievalUrl: "https://mapcarta.com/23161122",
    sourceObjectType: "feature",
    sourceObjectId: "5407722",
    lat: 32.73366,
    lng: -117.14976,
    observedAt: OBSERVED_AT,
    coordinateSemantics:
      "mapped-feature-representative-point",
    featureClass: "theatre-building",
  },
  {
    id: "sdz-geoobs-main-entrance-osm-way-79293454",
    targetId: "sdz-geo-main-entrance",
    provider: "OpenStreetMap",
    retrievalUrl: "https://mapcarta.com/W79293454",
    sourceObjectType: "way",
    sourceObjectId: "79293454",
    lat: 32.73513,
    lng: -117.1493,
    observedAt: OBSERVED_AT,
    coordinateSemantics:
      "mapped-feature-representative-point",
    featureClass: "entrance-building",
  },
];

export function assertIndependentGeospatialAuthorityIntegrity(
  targets: readonly GeospatialTarget[],
  observations: readonly IndependentGeospatialObservation[],
) {
  const targetIds = new Set<string>();
  const mapAnchorIds = new Set(
    OFFICIAL_MAP_ANCHORS.map((anchor) => anchor.id),
  );

  for (const target of targets) {
    if (!stableId(target.id)) {
      throw new Error(
        "Geospatial target contains an invalid stable ID.",
      );
    }

    if (targetIds.has(target.id)) {
      throw new Error(
        `Duplicate geospatial target ID: ${target.id}`,
      );
    }
    targetIds.add(target.id);

    if (!stableId(target.canonicalName)) {
      throw new Error(
        `Geospatial target ${target.id} requires a canonical name.`,
      );
    }

    if (!mapAnchorIds.has(target.mapAnchorId)) {
      throw new Error(
        `Geospatial target ${target.id} references unknown map anchor ${target.mapAnchorId}.`,
      );
    }

    const anchor = OFFICIAL_MAP_ANCHORS.find(
      (value) => value.id === target.mapAnchorId,
    );

    if (
      target.targetKind === "source-record" &&
      (!target.sourceRecordId ||
        !sourceBackedRecordById(target.sourceRecordId))
    ) {
      throw new Error(
        `Geospatial target ${target.id} requires a known source record.`,
      );
    }

    if (
      target.sourceRecordId !== undefined &&
      anchor?.sourceRecordId !== target.sourceRecordId
    ) {
      throw new Error(
        `Geospatial target ${target.id} source record does not match map-anchor authority.`,
      );
    }

    if (
      target.targetKind === "map-anchor" &&
      target.sourceRecordId !== undefined
    ) {
      throw new Error(
        `Map-anchor geospatial target ${target.id} cannot also declare sourceRecordId.`,
      );
    }

    if (
      target.officialContextUrl !== undefined &&
      !validOfficialContextUrl(
        target.officialContextUrl,
      )
    ) {
      throw new Error(
        `Geospatial target ${target.id} has an invalid official context URL.`,
      );
    }
  }

  const observationIds = new Set<string>();
  const providerObjects = new Set<string>();
  const observationCountByTarget = new Map<
    string,
    number
  >();

  for (const observation of observations) {
    if (!stableId(observation.id)) {
      throw new Error(
        "Geospatial observation contains an invalid stable ID.",
      );
    }

    if (observationIds.has(observation.id)) {
      throw new Error(
        `Duplicate geospatial observation ID: ${observation.id}`,
      );
    }
    observationIds.add(observation.id);

    if (!targetIds.has(observation.targetId)) {
      throw new Error(
        `Geospatial observation ${observation.id} references unknown target ${observation.targetId}.`,
      );
    }

    if (
      !stableId(observation.sourceObjectId) ||
      !validHttpsUrl(observation.retrievalUrl) ||
      !validObservedAt(observation.observedAt) ||
      !validCoordinate(observation.lat, observation.lng)
    ) {
      throw new Error(
        `Geospatial observation ${observation.id} is malformed.`,
      );
    }

    const providerObjectKey = JSON.stringify([
      observation.provider,
      observation.sourceObjectType,
      observation.sourceObjectId,
    ]);

    if (providerObjects.has(providerObjectKey)) {
      throw new Error(
        `Duplicate geospatial provider object: ${observation.provider} ${observation.sourceObjectType} ${observation.sourceObjectId}.`,
      );
    }
    providerObjects.add(providerObjectKey);
    observationCountByTarget.set(
      observation.targetId,
      (observationCountByTarget.get(
        observation.targetId,
      ) ?? 0) + 1,
    );

    if (
      observation.coordinateSemantics !==
      "mapped-feature-representative-point"
    ) {
      throw new Error(
        `Geospatial observation ${observation.id} has unsupported coordinate semantics.`,
      );
    }
  }

  for (const target of targets) {
    if (
      (observationCountByTarget.get(target.id) ?? 0) ===
      0
    ) {
      throw new Error(
        `Geospatial target ${target.id} has no observations.`,
      );
    }
  }
}

assertIndependentGeospatialAuthorityIntegrity(
  RAW_TARGETS,
  RAW_OBSERVATIONS,
);

export const INDEPENDENT_GEOSPATIAL_TARGETS:
  readonly GeospatialTarget[] =
  deepFreeze(RAW_TARGETS);

export const INDEPENDENT_GEOSPATIAL_OBSERVATIONS:
  readonly IndependentGeospatialObservation[] =
  deepFreeze(RAW_OBSERVATIONS);

export function geospatialObservationsForTarget(
  targetId: string,
) {
  return INDEPENDENT_GEOSPATIAL_OBSERVATIONS
    .filter(
      (observation) =>
        observation.targetId === targetId,
    )
    .sort((a, b) => compareText(a.id, b.id));
}

export function classifyFeatureObservationAgreement(
  targetId: string,
  observations: readonly IndependentGeospatialObservation[],
): Exclude<
  FeatureAuthorityAssessment,
  { status: "unknown-target" }
> {
  const ordered = [...observations].sort((a, b) =>
    compareText(a.id, b.id),
  );

  if (ordered.length < 2) {
    return {
      status: "single-source-feature-location",
      targetId,
      observationIds: ordered.map(
        (observation) => observation.id,
      ),
    };
  }

  let maximumSourceSeparationMeters = 0;

  for (let i = 0; i < ordered.length; i += 1) {
    for (
      let j = i + 1;
      j < ordered.length;
      j += 1
    ) {
      maximumSourceSeparationMeters = Math.max(
        maximumSourceSeparationMeters,
        haversineMeters(
          ordered[i],
          ordered[j],
        ),
      );
    }
  }

  const roundedSeparation =
    Math.round(maximumSourceSeparationMeters * 1000) /
    1000;

  return maximumSourceSeparationMeters <=
    CORROBORATION_MAX_SEPARATION_METERS
    ? {
        status: "corroborated-feature-location",
        targetId,
        observationIds: ordered.map(
          (observation) => observation.id,
        ),
        maximumSourceSeparationMeters:
          roundedSeparation,
      }
    : {
        status: "conflicting-feature-location",
        targetId,
        observationIds: ordered.map(
          (observation) => observation.id,
        ),
        maximumSourceSeparationMeters:
          roundedSeparation,
      };
}

export function assessFeatureGeospatialAuthority(
  targetId: string,
): FeatureAuthorityAssessment {
  const target =
    INDEPENDENT_GEOSPATIAL_TARGETS.find(
      (value) => value.id === targetId,
    );

  if (!target) {
    return {
      status: "unknown-target",
      targetId,
    };
  }

  return classifyFeatureObservationAgreement(
    targetId,
    geospatialObservationsForTarget(targetId),
  );
}

export function assessGuestNavigationPointAuthority(
  targetId: string,
): GuestNavigationPointAssessment {
  const target =
    INDEPENDENT_GEOSPATIAL_TARGETS.find(
      (value) => value.id === targetId,
    );

  if (!target) {
    return {
      status: "blocked",
      reason: "TARGET_UNKNOWN",
      targetId,
      observationIds: [],
    };
  }

  return {
    status: "blocked",
    reason: "GUEST_ENTRANCE_POINT_NOT_SOURCED",
    targetId,
    observationIds:
      geospatialObservationsForTarget(
        targetId,
      ).map((observation) => observation.id),
  };
}
