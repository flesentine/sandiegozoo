import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "./zooInteriorFrontStreetGeometryAuthority.ts";
import {
  INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY,
} from "./zooInteriorObjectiveSegmentDistanceAuthority.ts";
import {
  PEDESTRIAN_DIRECTION_RESOLUTION_POLICY,
} from "./zooIngressPedestrianDirectionResolution.ts";

const SOURCE_SNAPSHOT_ID =
  "sdz-interior-front-street-direction-source-v1" as const;
const POLICY_ID =
  "sdz-interior-pedestrian-direction-policy-v1" as const;
const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-direction" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const DISTANCE_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-distance" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const SOURCE_WAY_VERSION_URL =
  "https://api.openstreetmap.org/api/0.6/way/1481425058/1" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const OBSERVED_AT = "2026-09-10T23:02:16-07:00" as const;
const ADOPTED_AT = "2026-09-10T23:03:00-07:00" as const;

const SOURCE_TAG_KEYS = [
  "fee",
  "foot",
  "highway",
  "name",
  "surface",
  "tiger:cfcc",
  "tiger:county",
] as const;

const SEMANTIC_REFERENCE_URLS = [
  "https://wiki.openstreetmap.org/wiki/Restrictions",
  "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
] as const;

export type InteriorPedestrianDirectionSourceSnapshot = {
  id: typeof SOURCE_SNAPSHOT_ID;
  provider: "OpenStreetMap";
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: 1;
  sourceWayVersionUrl: typeof SOURCE_WAY_VERSION_URL;
  sourceWayTimestamp: "2026-02-21T14:47:49Z";
  sourceWayChangeset: 178862584;
  observedAt: typeof OBSERVED_AT;
  sourceTagKeys: readonly [
    "fee",
    "foot",
    "highway",
    "name",
    "surface",
    "tiger:cfcc",
    "tiger:county",
  ];
  sourceTags: {
    fee: "yes";
    foot: "customers";
    highway: "pedestrian";
    name: "Front Street";
    surface: "asphalt";
    "tiger:cfcc": "A51";
    "tiger:county": "San Diego, CA";
  };
  onewayTag: null;
  onewayFootTag: null;
  sourceState: "exact-version-complete-tag-set";
};

export type InteriorPedestrianDirectionPolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope: "highway-pedestrian-interior-exact-segments";
  pedestrianOneWayAuthority: "explicit-oneway-foot-only";
  absentExplicitPedestrianRestriction: "bidirectional-by-default";
  genericOnewaySemantics: "vehicle-only-unless-explicit-foot-direction";
  authority: "prospective-osm-interpretation-policy";
  semanticReferenceUrls: readonly [
    "https://wiki.openstreetmap.org/wiki/Restrictions",
    "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
  ];
};

export type InteriorPedestrianDirectionAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  distanceAuthorityId: typeof DISTANCE_AUTHORITY_ID;
  sourceSnapshotId: typeof SOURCE_SNAPSHOT_ID;
  policyId: typeof POLICY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  oneWay: false;
  direction: "bidirectional";
  resolutionBasis:
    "highway-pedestrian-without-explicit-pedestrian-oneway";
  sourceWayOrderRole: "geometry-only-not-direction-authority";
  directionScope: "static-osm-baseline";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "pedestrian-direction-only";
};

export type InteriorPedestrianDirectionAssessment =
  | {
      status: "direction-ready";
      objectiveSourceRecordId: string;
      sourceFromNodeId: string;
      sourceToNodeId: string;
      oneWay: false;
      direction: "bidirectional";
      directionScope: "static-osm-baseline";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_MODE_NOT_SOURCED",
          "EXACT_SEGMENT_DURATION_NOT_SOURCED",
          "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
          "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
          "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_PEDESTRIAN_DIRECTION_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const SNAPSHOT_FIELDS = [
  "id",
  "provider",
  "sourceWayId",
  "sourceWayVersion",
  "sourceWayVersionUrl",
  "sourceWayTimestamp",
  "sourceWayChangeset",
  "observedAt",
  "sourceTagKeys",
  "sourceTags",
  "onewayTag",
  "onewayFootTag",
  "sourceState",
] as const;

const SOURCE_TAG_FIELDS = [...SOURCE_TAG_KEYS] as const;

const POLICY_FIELDS = [
  "id",
  "policyVersion",
  "adoptedAt",
  "scope",
  "pedestrianOneWayAuthority",
  "absentExplicitPedestrianRestriction",
  "genericOnewaySemantics",
  "authority",
  "semanticReferenceUrls",
] as const;

const AUTHORITY_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "distanceAuthorityId",
  "sourceSnapshotId",
  "policyId",
  "sourceWayId",
  "sourceFromNodeId",
  "sourceToNodeId",
  "oneWay",
  "direction",
  "resolutionBasis",
  "sourceWayOrderRole",
  "directionScope",
  "selectionScope",
  "globalEndpointSelection",
  "plannerMaterialization",
] as const;

const FORBIDDEN_ROUTE_FIELDS = [
  "fromNodeId",
  "toNodeId",
  "mode",
  "distanceMeters",
  "durationMinutes",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "status",
  "routeNodeId",
  "provenance",
  "globalEndpointNodeId",
] as const;

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_MODE_NOT_SOURCED",
  "EXACT_SEGMENT_DURATION_NOT_SOURCED",
  "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
  "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
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

function assertExactPlainObject(
  value: unknown,
  allowedFields: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(`${label} must be a plain object with Object.prototype.`);
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key === "symbol")) {
    throw new Error(`${label} cannot contain symbol fields.`);
  }

  const expected = new Set(allowedFields);
  const stringKeys = ownKeys as string[];
  const unknown = stringKeys.filter((key) => !expected.has(key)).sort();
  const missing = allowedFields.filter((key) => !Object.hasOwn(value, key));

  if (unknown.length > 0) {
    throw new Error(`${label} cannot contain unknown field ${unknown.join(", ")}.`);
  }
  if (missing.length > 0) {
    throw new Error(`${label} is missing required field ${missing.join(", ")}.`);
  }

  for (const field of allowedFields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data field ${field}.`);
    }
  }
}

function assertExactOrdinaryArray(
  value: unknown,
  expectedLength: number,
  label: string,
): asserts value is unknown[] {
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype ||
    value.length !== expectedLength
  ) {
    throw new Error(`${label} must be an ordinary array of length ${expectedLength}.`);
  }

  const allowedOwnKeys = new Set([
    ...Array.from({ length: expectedLength }, (_, index) => String(index)),
    "length",
  ]);
  const extraKeys = Reflect.ownKeys(value).filter(
    (key) => typeof key !== "string" || !allowedOwnKeys.has(key),
  );
  if (extraKeys.length > 0) {
    throw new Error(`${label} cannot contain extra own properties.`);
  }

  for (let index = 0; index < expectedLength; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data element ${index}.`);
    }
  }
}

function validTimestamp(value: unknown) {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  );
}

function assertNoRouteMaterialization(value: Record<string, unknown>, label: string) {
  for (const field of FORBIDDEN_ROUTE_FIELDS) {
    if (field in value) {
      throw new Error(`${label} cannot materialize routing field ${field}.`);
    }
  }
}

const RAW_SOURCE_SNAPSHOT: InteriorPedestrianDirectionSourceSnapshot = {
  id: SOURCE_SNAPSHOT_ID,
  provider: "OpenStreetMap",
  sourceWayId: SOURCE_WAY_ID,
  sourceWayVersion: 1,
  sourceWayVersionUrl: SOURCE_WAY_VERSION_URL,
  sourceWayTimestamp: "2026-02-21T14:47:49Z",
  sourceWayChangeset: 178862584,
  observedAt: OBSERVED_AT,
  sourceTagKeys: [...SOURCE_TAG_KEYS],
  sourceTags: {
    fee: "yes",
    foot: "customers",
    highway: "pedestrian",
    name: "Front Street",
    surface: "asphalt",
    "tiger:cfcc": "A51",
    "tiger:county": "San Diego, CA",
  },
  onewayTag: null,
  onewayFootTag: null,
  sourceState: "exact-version-complete-tag-set",
};

const RAW_POLICY: InteriorPedestrianDirectionPolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope: "highway-pedestrian-interior-exact-segments",
  pedestrianOneWayAuthority: "explicit-oneway-foot-only",
  absentExplicitPedestrianRestriction: "bidirectional-by-default",
  genericOnewaySemantics: "vehicle-only-unless-explicit-foot-direction",
  authority: "prospective-osm-interpretation-policy",
  semanticReferenceUrls: [...SEMANTIC_REFERENCE_URLS],
};

const RAW_AUTHORITY: InteriorPedestrianDirectionAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    distanceAuthorityId: DISTANCE_AUTHORITY_ID,
    sourceSnapshotId: SOURCE_SNAPSHOT_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    oneWay: false,
    direction: "bidirectional",
    resolutionBasis:
      "highway-pedestrian-without-explicit-pedestrian-oneway",
    sourceWayOrderRole: "geometry-only-not-direction-authority",
    directionScope: "static-osm-baseline",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "pedestrian-direction-only",
  },
];

export function assertInteriorPedestrianDirectionSourceSnapshotIntegrity(
  snapshot: InteriorPedestrianDirectionSourceSnapshot,
) {
  assertExactPlainObject(
    snapshot,
    SNAPSHOT_FIELDS,
    "Planner 29 direction source snapshot",
  );
  assertExactOrdinaryArray(
    snapshot.sourceTagKeys,
    SOURCE_TAG_KEYS.length,
    "Planner 29 source tag-key list",
  );
  assertExactPlainObject(
    snapshot.sourceTags,
    SOURCE_TAG_FIELDS,
    "Planner 29 complete source tag set",
  );

  const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  if (
    snapshot.id !== SOURCE_SNAPSHOT_ID ||
    snapshot.provider !== "OpenStreetMap" ||
    snapshot.sourceWayId !== SOURCE_WAY_ID ||
    snapshot.sourceWayVersion !== 1 ||
    snapshot.sourceWayVersionUrl !== SOURCE_WAY_VERSION_URL ||
    snapshot.sourceWayTimestamp !== "2026-02-21T14:47:49Z" ||
    snapshot.sourceWayChangeset !== 178862584 ||
    snapshot.observedAt !== OBSERVED_AT ||
    !validTimestamp(snapshot.sourceWayTimestamp) ||
    !validTimestamp(snapshot.observedAt) ||
    snapshot.onewayTag !== null ||
    snapshot.onewayFootTag !== null ||
    snapshot.sourceState !== "exact-version-complete-tag-set"
  ) {
    throw new Error("Planner 29 direction source snapshot drifted from exact OSM way v1 evidence.");
  }

  for (let index = 0; index < SOURCE_TAG_KEYS.length; index += 1) {
    if (snapshot.sourceTagKeys[index] !== SOURCE_TAG_KEYS[index]) {
      throw new Error("Planner 29 source tag-key list drifted from the complete OSM tag set.");
    }
  }

  if (
    snapshot.sourceTags.fee !== "yes" ||
    snapshot.sourceTags.foot !== "customers" ||
    snapshot.sourceTags.highway !== "pedestrian" ||
    snapshot.sourceTags.name !== "Front Street" ||
    snapshot.sourceTags.surface !== "asphalt" ||
    snapshot.sourceTags["tiger:cfcc"] !== "A51" ||
    snapshot.sourceTags["tiger:county"] !== "San Diego, CA"
  ) {
    throw new Error("Planner 29 complete OSM tag set drifted.");
  }

  if (
    geometry.sourceWayId !== snapshot.sourceWayId ||
    geometry.sourceWayVersion !== snapshot.sourceWayVersion ||
    geometry.sourceWayVersionUrl !== snapshot.sourceWayVersionUrl ||
    geometry.sourceWayTimestamp !== snapshot.sourceWayTimestamp ||
    geometry.highwayTag !== snapshot.sourceTags.highway ||
    geometry.name !== snapshot.sourceTags.name ||
    geometry.footTag !== snapshot.sourceTags.foot ||
    geometry.feeTag !== snapshot.sourceTags.fee ||
    geometry.surfaceTag !== snapshot.sourceTags.surface ||
    geometry.endpointSelection !== "unresolved"
  ) {
    throw new Error("Planner 29 source snapshot detached from qualified Planner 26 Front Street geometry.");
  }
}

export function assertInteriorPedestrianDirectionPolicyIntegrity(
  policy: InteriorPedestrianDirectionPolicy,
) {
  assertExactPlainObject(
    policy,
    POLICY_FIELDS,
    "Planner 29 interior pedestrian direction policy",
  );
  assertExactOrdinaryArray(
    policy.semanticReferenceUrls,
    SEMANTIC_REFERENCE_URLS.length,
    "Planner 29 semantic-reference list",
  );

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.adoptedAt !== ADOPTED_AT ||
    !validTimestamp(policy.adoptedAt) ||
    policy.scope !== "highway-pedestrian-interior-exact-segments" ||
    policy.pedestrianOneWayAuthority !== "explicit-oneway-foot-only" ||
    policy.absentExplicitPedestrianRestriction !== "bidirectional-by-default" ||
    policy.genericOnewaySemantics !== "vehicle-only-unless-explicit-foot-direction" ||
    policy.authority !== "prospective-osm-interpretation-policy" ||
    policy.semanticReferenceUrls[0] !== SEMANTIC_REFERENCE_URLS[0] ||
    policy.semanticReferenceUrls[1] !== SEMANTIC_REFERENCE_URLS[1]
  ) {
    throw new Error("Planner 29 interior pedestrian direction policy drifted from the frozen policy boundary.");
  }

  if (
    PEDESTRIAN_DIRECTION_RESOLUTION_POLICY.scope !==
      "highway-pedestrian-ingress-ways" ||
    policy.scope === PEDESTRIAN_DIRECTION_RESOLUTION_POLICY.scope
  ) {
    throw new Error("Planner 29 must not silently reuse or widen the ingress-only Planner 21 scope.");
  }
}

export function assertInteriorPedestrianDirectionAuthorityIntegrity(
  authorities: readonly InteriorPedestrianDirectionAuthority[],
) {
  assertExactOrdinaryArray(
    authorities,
    1,
    "Planner 29 direction authority collection",
  );

  const candidate: unknown = authorities[0];
  assertExactPlainObject(
    candidate,
    AUTHORITY_FIELDS,
    "Planner 29 pedestrian direction authority",
  );
  assertNoRouteMaterialization(
    candidate,
    "Planner 29 pedestrian direction authority",
  );

  const record = candidate as unknown as InteriorPedestrianDirectionAuthority;
  const distance = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY.find(
    (entry) => entry.id === record.distanceAuthorityId,
  );

  if (
    record.id !== AUTHORITY_ID ||
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.distanceAuthorityId !== DISTANCE_AUTHORITY_ID ||
    record.sourceSnapshotId !== SOURCE_SNAPSHOT_ID ||
    record.policyId !== POLICY_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.oneWay !== false ||
    record.direction !== "bidirectional" ||
    record.resolutionBasis !==
      "highway-pedestrian-without-explicit-pedestrian-oneway" ||
    record.sourceWayOrderRole !== "geometry-only-not-direction-authority" ||
    record.directionScope !== "static-osm-baseline" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !== "pedestrian-direction-only"
  ) {
    throw new Error("Planner 29 pedestrian direction authority drifted from the frozen exact-segment contract.");
  }

  if (
    !distance ||
    distance.objectiveSourceRecordId !== record.objectiveSourceRecordId ||
    distance.sourceWayId !== record.sourceWayId ||
    distance.sourceFromNodeId !== record.sourceFromNodeId ||
    distance.sourceToNodeId !== record.sourceToNodeId ||
    distance.selectionScope !== "objective-only" ||
    distance.globalEndpointSelection !== "unresolved"
  ) {
    throw new Error("Planner 29 direction authority detached from Planner 28 objective-selected exact segment.");
  }

  if (
    RAW_SOURCE_SNAPSHOT.sourceTags.highway !== "pedestrian" ||
    RAW_SOURCE_SNAPSHOT.onewayFootTag !== null ||
    RAW_POLICY.absentExplicitPedestrianRestriction !== "bidirectional-by-default"
  ) {
    throw new Error("Planner 29 cannot resolve bidirectionality without its exact source and policy prerequisites.");
  }
}

assertInteriorPedestrianDirectionSourceSnapshotIntegrity(RAW_SOURCE_SNAPSHOT);
assertInteriorPedestrianDirectionPolicyIntegrity(RAW_POLICY);
assertInteriorPedestrianDirectionAuthorityIntegrity(RAW_AUTHORITY);

export const INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT:
  InteriorPedestrianDirectionSourceSnapshot = deepFreeze(RAW_SOURCE_SNAPSHOT);

export const INTERIOR_PEDESTRIAN_DIRECTION_POLICY:
  InteriorPedestrianDirectionPolicy = deepFreeze(RAW_POLICY);

export const INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY:
  readonly InteriorPedestrianDirectionAuthority[] = deepFreeze(RAW_AUTHORITY);

export function interiorPedestrianDirectionForObjective(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorPedestrianDirection(
  objectiveSourceRecordId: string,
): InteriorPedestrianDirectionAssessment {
  const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const direction = interiorPedestrianDirectionForObjective(objectiveSourceRecordId);

  if (!direction) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_PEDESTRIAN_DIRECTION_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: geometry.endpointSelection,
    });
  }

  return deepFreeze({
    status: "direction-ready",
    objectiveSourceRecordId: direction.objectiveSourceRecordId,
    sourceFromNodeId: direction.sourceFromNodeId,
    sourceToNodeId: direction.sourceToNodeId,
    oneWay: direction.oneWay,
    direction: direction.direction,
    directionScope: direction.directionScope,
    selectionScope: direction.selectionScope,
    globalEndpointSelection: geometry.endpointSelection,
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
