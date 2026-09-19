import {
  INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY,
} from "./zooInteriorTreetopsV7GeometryAuthority.ts";
import {
  INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY,
} from "./zooInteriorTreetopsSegmentDistanceAuthority.ts";

const SOURCE_SNAPSHOT_ID =
  "sdz-interior-treetops-v7-direction-source" as const;
const POLICY_ID =
  "sdz-interior-treetops-footway-direction-policy-v1" as const;
const AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-direction" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const DISTANCE_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-distance" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const SOURCE_WAY_VERSION_URL =
  "https://api.openstreetmap.org/api/0.6/way/148910139/7" as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:28:40Z" as const;
const SOURCE_WAY_CHANGESET = 178875711 as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;
const OBSERVED_AT = "2026-09-19T11:08:15-07:00" as const;
const ADOPTED_AT = "2026-09-19T11:10:00-07:00" as const;

const SOURCE_TAG_KEYS = ["highway", "name", "surface"] as const;
const SEMANTIC_REFERENCE_URLS = [
  "https://wiki.openstreetmap.org/wiki/Restrictions",
  "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
] as const;

export type InteriorTreetopsPedestrianDirectionSourceSnapshot = {
  id: typeof SOURCE_SNAPSHOT_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayVersionUrl: typeof SOURCE_WAY_VERSION_URL;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_WAY_CHANGESET;
  observedAt: typeof OBSERVED_AT;
  captureMethod: "direct-osm-api-exact-way-version";
  sourceTagKeys: readonly ["highway", "name", "surface"];
  sourceTags: {
    highway: "footway";
    name: "Treetops Way";
    surface: "concrete";
  };
  onewayTag: null;
  onewayFootTag: null;
  sourceState: "exact-version-complete-tag-set";
};

export type InteriorTreetopsPedestrianDirectionPolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope: "highway-footway-interior-exact-segments";
  pedestrianOneWayAuthority: "explicit-oneway-foot-only";
  absentExplicitPedestrianRestriction: "bidirectional-by-default";
  sourceWayOrderSemantics: "geometry-only-not-direction-authority";
  directionScope: "static-osm-baseline";
  authority: "prospective-osm-interpretation-policy";
  semanticReferenceUrls: readonly [
    "https://wiki.openstreetmap.org/wiki/Restrictions",
    "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
  ];
};

export type InteriorTreetopsPedestrianDirectionAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  distanceAuthorityId: typeof DISTANCE_AUTHORITY_ID;
  sourceSnapshotId: typeof SOURCE_SNAPSHOT_ID;
  policyId: typeof POLICY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  oneWay: false;
  direction: "bidirectional";
  resolutionBasis: "highway-footway-without-explicit-pedestrian-oneway";
  sourceWayOrderRole: "geometry-only-not-direction-authority";
  directionScope: "static-osm-baseline";
  plannerMaterialization: "pedestrian-direction-only";
};

export type InteriorTreetopsPedestrianDirectionAssessment =
  | {
      status: "direction-ready";
      authorityId: typeof AUTHORITY_ID;
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      oneWay: false;
      direction: "bidirectional";
      directionScope: "static-osm-baseline";
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_DURATION_NOT_QUALIFIED",
          "EXACT_SEGMENT_DIFFICULTY_NOT_QUALIFIED",
          "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
          "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
          "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
          "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_PEDESTRIAN_DIRECTION_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_DURATION_NOT_QUALIFIED",
  "EXACT_SEGMENT_DIFFICULTY_NOT_QUALIFIED",
  "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
  "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
  "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
  "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
] as const;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

const RAW_SOURCE_SNAPSHOT: InteriorTreetopsPedestrianDirectionSourceSnapshot = {
  id: SOURCE_SNAPSHOT_ID,
  provider: "OpenStreetMap",
  objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
  sourceWayId: SOURCE_WAY_ID,
  sourceWayVersion: SOURCE_WAY_VERSION,
  sourceWayVersionUrl: SOURCE_WAY_VERSION_URL,
  sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
  sourceWayChangeset: SOURCE_WAY_CHANGESET,
  observedAt: OBSERVED_AT,
  captureMethod: "direct-osm-api-exact-way-version",
  sourceTagKeys: [...SOURCE_TAG_KEYS],
  sourceTags: {
    highway: "footway",
    name: "Treetops Way",
    surface: "concrete",
  },
  onewayTag: null,
  onewayFootTag: null,
  sourceState: "exact-version-complete-tag-set",
};

const RAW_POLICY: InteriorTreetopsPedestrianDirectionPolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope: "highway-footway-interior-exact-segments",
  pedestrianOneWayAuthority: "explicit-oneway-foot-only",
  absentExplicitPedestrianRestriction: "bidirectional-by-default",
  sourceWayOrderSemantics: "geometry-only-not-direction-authority",
  directionScope: "static-osm-baseline",
  authority: "prospective-osm-interpretation-policy",
  semanticReferenceUrls: [...SEMANTIC_REFERENCE_URLS],
};

const RAW_AUTHORITY: InteriorTreetopsPedestrianDirectionAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    distanceAuthorityId: DISTANCE_AUTHORITY_ID,
    sourceSnapshotId: SOURCE_SNAPSHOT_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    oneWay: false,
    direction: "bidirectional",
    resolutionBasis: "highway-footway-without-explicit-pedestrian-oneway",
    sourceWayOrderRole: "geometry-only-not-direction-authority",
    directionScope: "static-osm-baseline",
    plannerMaterialization: "pedestrian-direction-only",
  },
];

function assertCanonicalInteriorTreetopsPedestrianDirectionIntegrity(): void {
  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  const distance = INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0];
  const snapshot = RAW_SOURCE_SNAPSHOT;
  const policy = RAW_POLICY;
  const authority = RAW_AUTHORITY[0];

  if (
    snapshot.id !== SOURCE_SNAPSHOT_ID ||
    snapshot.provider !== "OpenStreetMap" ||
    snapshot.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    snapshot.sourceWayId !== SOURCE_WAY_ID ||
    snapshot.sourceWayVersion !== SOURCE_WAY_VERSION ||
    snapshot.sourceWayVersionUrl !== SOURCE_WAY_VERSION_URL ||
    snapshot.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    snapshot.sourceWayChangeset !== SOURCE_WAY_CHANGESET ||
    snapshot.observedAt !== OBSERVED_AT ||
    snapshot.captureMethod !== "direct-osm-api-exact-way-version" ||
    snapshot.sourceState !== "exact-version-complete-tag-set" ||
    snapshot.onewayTag !== null ||
    snapshot.onewayFootTag !== null
  ) {
    throw new Error(
      "Planner 47 source snapshot drifted from the exact OSM way v7 capture.",
    );
  }

  if (
    snapshot.sourceTagKeys.length !== SOURCE_TAG_KEYS.length ||
    snapshot.sourceTagKeys.some((key, index) => key !== SOURCE_TAG_KEYS[index]) ||
    Reflect.ownKeys(snapshot.sourceTags).length !== SOURCE_TAG_KEYS.length ||
    snapshot.sourceTags.highway !== "footway" ||
    snapshot.sourceTags.name !== "Treetops Way" ||
    snapshot.sourceTags.surface !== "concrete"
  ) {
    throw new Error(
      "Planner 47 complete OSM tag set drifted from the exact v7 capture.",
    );
  }

  if (
    geometry.sourceWayId !== snapshot.sourceWayId ||
    geometry.sourceWayVersion !== snapshot.sourceWayVersion ||
    geometry.sourceWayVersionUrl !== snapshot.sourceWayVersionUrl ||
    geometry.sourceWayTimestamp !== snapshot.sourceWayTimestamp ||
    geometry.sourceWayChangeset !== snapshot.sourceWayChangeset ||
    geometry.sourceHighway !== snapshot.sourceTags.highway ||
    geometry.sourceName !== snapshot.sourceTags.name ||
    geometry.sourceSurface !== snapshot.sourceTags.surface
  ) {
    throw new Error(
      "Planner 47 source snapshot detached from Planner 43 version-pinned geometry.",
    );
  }

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.adoptedAt !== ADOPTED_AT ||
    policy.scope !== "highway-footway-interior-exact-segments" ||
    policy.pedestrianOneWayAuthority !== "explicit-oneway-foot-only" ||
    policy.absentExplicitPedestrianRestriction !== "bidirectional-by-default" ||
    policy.sourceWayOrderSemantics !== "geometry-only-not-direction-authority" ||
    policy.directionScope !== "static-osm-baseline" ||
    policy.authority !== "prospective-osm-interpretation-policy" ||
    policy.semanticReferenceUrls.length !== SEMANTIC_REFERENCE_URLS.length ||
    policy.semanticReferenceUrls.some(
      (url, index) => url !== SEMANTIC_REFERENCE_URLS[index],
    )
  ) {
    throw new Error(
      "Planner 47 pedestrian-direction policy drifted from the frozen policy boundary.",
    );
  }

  if (
    distance.id !== DISTANCE_AUTHORITY_ID ||
    distance.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    distance.sourceWayId !== SOURCE_WAY_ID ||
    distance.sourceWayVersion !== SOURCE_WAY_VERSION ||
    distance.sourceFromNodeId !== FROM_NODE_ID ||
    distance.sourceToNodeId !== TO_NODE_ID ||
    distance.distanceMeters !== 48.615
  ) {
    throw new Error(
      "Planner 47 direction authority detached from Planner 46 exact distance authority.",
    );
  }

  if (
    authority.id !== AUTHORITY_ID ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.distanceAuthorityId !== DISTANCE_AUTHORITY_ID ||
    authority.sourceSnapshotId !== SOURCE_SNAPSHOT_ID ||
    authority.policyId !== POLICY_ID ||
    authority.sourceWayId !== SOURCE_WAY_ID ||
    authority.sourceWayVersion !== SOURCE_WAY_VERSION ||
    authority.sourceFromNodeId !== FROM_NODE_ID ||
    authority.sourceToNodeId !== TO_NODE_ID ||
    authority.oneWay !== false ||
    authority.direction !== "bidirectional" ||
    authority.resolutionBasis !==
      "highway-footway-without-explicit-pedestrian-oneway" ||
    authority.sourceWayOrderRole !==
      "geometry-only-not-direction-authority" ||
    authority.directionScope !== "static-osm-baseline" ||
    authority.plannerMaterialization !== "pedestrian-direction-only"
  ) {
    throw new Error(
      "Planner 47 pedestrian direction authority drifted from the frozen exact-segment contract.",
    );
  }

  const forbidden = [
    "mode",
    "distanceMeters",
    "durationMinutes",
    "difficulty",
    "stairs",
    "accessible",
    "stroller",
    "status",
    "routeNodeId",
    "routeEdgeId",
  ] as const;
  for (const field of forbidden) {
    if (Object.hasOwn(authority, field)) {
      throw new Error(
        `Planner 47 pedestrian direction authority cannot own downstream field ${field}.`,
      );
    }
  }
}

assertCanonicalInteriorTreetopsPedestrianDirectionIntegrity();

export const INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT:
  InteriorTreetopsPedestrianDirectionSourceSnapshot =
    deepFreeze(RAW_SOURCE_SNAPSHOT);

export const INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_POLICY:
  InteriorTreetopsPedestrianDirectionPolicy = deepFreeze(RAW_POLICY);

export const INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY:
  readonly InteriorTreetopsPedestrianDirectionAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function interiorTreetopsPedestrianDirectionForObjective(
  objectiveSourceRecordId: string,
): InteriorTreetopsPedestrianDirectionAuthority | undefined {
  return INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorTreetopsPedestrianDirection(
  objectiveSourceRecordId: string,
): InteriorTreetopsPedestrianDirectionAssessment {
  const direction =
    interiorTreetopsPedestrianDirectionForObjective(objectiveSourceRecordId);

  if (!direction) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_PEDESTRIAN_DIRECTION_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "direction-ready",
    authorityId: direction.id,
    objectiveSourceRecordId: direction.objectiveSourceRecordId,
    sourceWayId: direction.sourceWayId,
    sourceWayVersion: direction.sourceWayVersion,
    sourceFromNodeId: direction.sourceFromNodeId,
    sourceToNodeId: direction.sourceToNodeId,
    oneWay: direction.oneWay,
    direction: direction.direction,
    directionScope: direction.directionScope,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
