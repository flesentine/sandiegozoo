import {
  INTERIOR_UNNAMED_FOOTWAY_GEOMETRY,
} from "./zooInteriorUnnamedFootwayGeometry.ts";

const AUTHORITY_ID =
  "sdz-interior-unnamed-footway-branching-endpoint-topology" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z" as const;
const ENDPOINT_NODE_ID = "1619736694" as const;
const INBOUND_WAY_ID = "1481578625" as const;
const ACCESS_NO_WAY_ID = "148910140" as const;
const FEE_FOOTWAY_ID = "1481578626" as const;
const SOURCE_CHANGESET = 178875075 as const;

const INBOUND_NODE_IDS = ["13588159634", ENDPOINT_NODE_ID] as const;
const ACCESS_NO_NODE_IDS = [
  "1619736666","1619736663","1619736656","1619736648","1619736638",
  "1619736630","1619736631","1619736639","1619736653","1619736660",
  "1619736664","1619736670","1619736676","2627532109","1619736678",
  "2627532117","1619736679","2627532116","1619736680","2627532106",
  "1619736681","1619736682","1619736683","1619736686","1619736688",
  "1619736687","1619736689",ENDPOINT_NODE_ID,
] as const;
const FEE_FOOTWAY_NODE_IDS = [ENDPOINT_NODE_ID, "48920902"] as const;

export type UnnamedFootwayBranchConnection = {
  sourceWayId: string;
  sourceWayVersion: number;
  sourceWayTimestamp: typeof TARGET_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_CHANGESET;
  sourceWayVersionUrl: string;
  sourceWayUrl: string;
  sourceHighway: "footway";
  sourceNameStatus: "absent";
  sourceAccess?: "no";
  sourceFee?: "yes";
  sourceLayer?: "-1";
  orderedNodeIds: readonly string[];
  endpointNodeIndex: number;
  connectionRole:
    | "inbound-qualified-segment"
    | "outbound-candidate";
};

export type InteriorUnnamedFootwayBranchingTopologyAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  targetTimestamp: typeof TARGET_TIMESTAMP;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  endpointCoordinate: {
    lat: 32.7358299;
    lng: -117.150419;
    sourceVersion: 2;
    sourceTimestamp: typeof TARGET_TIMESTAMP;
    sourceChangeset: typeof SOURCE_CHANGESET;
  };
  connectedWays: readonly [
    UnnamedFootwayBranchConnection,
    UnnamedFootwayBranchConnection,
    UnnamedFootwayBranchConnection,
  ];
  outboundCandidateWayIds: readonly [
    typeof ACCESS_NO_WAY_ID,
    typeof FEE_FOOTWAY_ID,
  ];
  outboundCandidateCount: 2;
  branchSelectionStatus: "unresolved";
  selectionRule:
    "requires-independent-objective-authority-when-multiple-non-inbound-linear-highway-ways-exist";
  plannerMaterialization: "branching-topology-only";
};

export type InteriorUnnamedFootwayBranchingTopologyAssessment = {
  status: "branching-topology-sourced";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  endpointNodeId: typeof ENDPOINT_NODE_ID;
  historicalConnectedWayCount: 3;
  outboundCandidateWayIds: readonly [
    typeof ACCESS_NO_WAY_ID,
    typeof FEE_FOOTWAY_ID,
  ];
  branchSelectionStatus: "unresolved";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly [
      "MULTIPLE_NON_INBOUND_LINEAR_HIGHWAY_CONNECTIONS",
      "OBJECTIVE_SCOPED_BRANCH_AUTHORITY_NOT_SOURCED",
      "OUTBOUND_ACCESS_SEMANTICS_NOT_QUALIFIED",
    ];
  };
};

const TOP_LEVEL_FIELDS = [
  "id","provider","objectiveSourceRecordId","targetTimestamp","endpointNodeId",
  "endpointCoordinate","connectedWays","outboundCandidateWayIds",
  "outboundCandidateCount","branchSelectionStatus","selectionRule",
  "plannerMaterialization",
] as const;

const COORDINATE_FIELDS = [
  "lat","lng","sourceVersion","sourceTimestamp","sourceChangeset",
] as const;

const CONNECTION_BASE_FIELDS = [
  "sourceWayId","sourceWayVersion","sourceWayTimestamp","sourceWayChangeset",
  "sourceWayVersionUrl","sourceWayUrl","sourceHighway","sourceNameStatus",
  "orderedNodeIds","endpointNodeIndex","connectionRole",
] as const;

const ACCESS_NO_EXTRA_FIELDS = ["sourceAccess","sourceFee","sourceLayer"] as const;
const FEE_EXTRA_FIELDS = ["sourceFee","sourceLayer"] as const;

const FORBIDDEN_ROUTE_FIELDS = [
  "fromNodeId","toNodeId","mode","distanceMeters","durationMinutes",
  "difficulty","stairs","accessible","stroller","oneWay","status",
  "provenance","routeNodeId","selectedContinuationWayId",
] as const;

const BLOCK_REASONS = [
  "MULTIPLE_NON_INBOUND_LINEAR_HIGHWAY_CONNECTIONS",
  "OBJECTIVE_SCOPED_BRANCH_AUTHORITY_NOT_SOURCED",
  "OUTBOUND_ACCESS_SEMANTICS_NOT_QUALIFIED",
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

function nullRecord<T extends object>(value: T): T {
  const result = Object.create(null) as T;
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new Error("Planner 68 canonical evidence requires data fields.");
    }
    Object.defineProperty(result, key, descriptor);
  }
  return result;
}

function assertPlain(
  value: unknown,
  fields: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  const prototype =
    value && typeof value === "object" ? Object.getPrototypeOf(value) : undefined;
  if (
    !value || typeof value !== "object" || Array.isArray(value) ||
    (prototype !== Object.prototype && prototype !== null)
  ) {
    throw new Error(`${label} must be a plain object.`);
  }
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key === "symbol")) {
    throw new Error(`${label} cannot contain symbol fields.`);
  }
  const expected = new Set(fields);
  const stringKeys = keys as string[];
  const unknown = stringKeys.filter((key) => !expected.has(key)).sort();
  const missing = fields.filter((field) => !Object.hasOwn(value, field));
  if (unknown.length) {
    throw new Error(`${label} cannot contain unknown field ${unknown.join(", ")}.`);
  }
  if (missing.length) {
    throw new Error(`${label} is missing required field ${missing.join(", ")}.`);
  }
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data field ${field}.`);
    }
  }
}

function assertArray(
  value: unknown,
  length: number,
  label: string,
): asserts value is unknown[] {
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype ||
    value.length !== length
  ) {
    throw new Error(`${label} must be an ordinary array of length ${length}.`);
  }
  const allowed = new Set([
    ...Array.from({ length }, (_, index) => String(index)),
    "length",
  ]);
  if (
    Reflect.ownKeys(value).some(
      (key) => typeof key !== "string" || !allowed.has(key),
    )
  ) {
    throw new Error(`${label} cannot contain extra own properties.`);
  }
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(`${label} requires enumerable own data element ${index}.`);
    }
  }
}

function assertNoRouteMaterialization(
  value: Record<string, unknown>,
  label: string,
): void {
  for (const field of FORBIDDEN_ROUTE_FIELDS) {
    if (field in value) {
      throw new Error(`${label} cannot materialize route field ${field}.`);
    }
  }
}

const INBOUND = nullRecord<UnnamedFootwayBranchConnection>({
  sourceWayId: INBOUND_WAY_ID,
  sourceWayVersion: 1,
  sourceWayTimestamp: TARGET_TIMESTAMP,
  sourceWayChangeset: SOURCE_CHANGESET,
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/1481578625/1",
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578625",
  sourceHighway: "footway",
  sourceNameStatus: "absent",
  orderedNodeIds: [...INBOUND_NODE_IDS],
  endpointNodeIndex: 1,
  connectionRole: "inbound-qualified-segment",
});

const ACCESS_NO_CANDIDATE = nullRecord<UnnamedFootwayBranchConnection>({
  sourceWayId: ACCESS_NO_WAY_ID,
  sourceWayVersion: 6,
  sourceWayTimestamp: TARGET_TIMESTAMP,
  sourceWayChangeset: SOURCE_CHANGESET,
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/148910140/6",
  sourceWayUrl: "https://www.openstreetmap.org/way/148910140",
  sourceHighway: "footway",
  sourceNameStatus: "absent",
  sourceAccess: "no",
  sourceFee: "yes",
  sourceLayer: "-1",
  orderedNodeIds: [...ACCESS_NO_NODE_IDS],
  endpointNodeIndex: 27,
  connectionRole: "outbound-candidate",
});

const FEE_CANDIDATE = nullRecord<UnnamedFootwayBranchConnection>({
  sourceWayId: FEE_FOOTWAY_ID,
  sourceWayVersion: 1,
  sourceWayTimestamp: TARGET_TIMESTAMP,
  sourceWayChangeset: SOURCE_CHANGESET,
  sourceWayVersionUrl:
    "https://api.openstreetmap.org/api/0.6/way/1481578626/1",
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578626",
  sourceHighway: "footway",
  sourceNameStatus: "absent",
  sourceFee: "yes",
  sourceLayer: "-1",
  orderedNodeIds: [...FEE_FOOTWAY_NODE_IDS],
  endpointNodeIndex: 0,
  connectionRole: "outbound-candidate",
});

const RAW_AUTHORITY: InteriorUnnamedFootwayBranchingTopologyAuthority[] = [
  nullRecord({
    id: AUTHORITY_ID,
    provider: "OpenStreetMap",
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    endpointNodeId: ENDPOINT_NODE_ID,
    endpointCoordinate: nullRecord({
      lat: 32.7358299,
      lng: -117.150419,
      sourceVersion: 2,
      sourceTimestamp: TARGET_TIMESTAMP,
      sourceChangeset: SOURCE_CHANGESET,
    }),
    connectedWays: [INBOUND, ACCESS_NO_CANDIDATE, FEE_CANDIDATE],
    outboundCandidateWayIds: [ACCESS_NO_WAY_ID, FEE_FOOTWAY_ID],
    outboundCandidateCount: 2,
    branchSelectionStatus: "unresolved",
    selectionRule:
      "requires-independent-objective-authority-when-multiple-non-inbound-linear-highway-ways-exist",
    plannerMaterialization: "branching-topology-only",
  }),
];

export function assertInteriorUnnamedFootwayBranchingTopologyIntegrity(
  authorities: readonly InteriorUnnamedFootwayBranchingTopologyAuthority[],
): void {
  assertArray(authorities, 1, "Planner 68 authority collection");
  const candidate = authorities[0] as unknown;
  assertPlain(candidate, TOP_LEVEL_FIELDS, "Planner 68 authority");
  assertNoRouteMaterialization(candidate, "Planner 68 authority");

  const authority =
    candidate as unknown as InteriorUnnamedFootwayBranchingTopologyAuthority;
  assertPlain(
    authority.endpointCoordinate,
    COORDINATE_FIELDS,
    "Planner 68 endpoint coordinate",
  );
  assertArray(authority.connectedWays, 3, "Planner 68 connected way collection");
  assertArray(
    authority.outboundCandidateWayIds,
    2,
    "Planner 68 outbound candidate collection",
  );

  const inbound = authority.connectedWays[0];
  const accessNo = authority.connectedWays[1];
  const fee = authority.connectedWays[2];
  assertPlain(inbound, CONNECTION_BASE_FIELDS, "Planner 68 inbound connection");
  assertPlain(
    accessNo,
    [...CONNECTION_BASE_FIELDS, ...ACCESS_NO_EXTRA_FIELDS],
    "Planner 68 access-no candidate",
  );
  assertPlain(
    fee,
    [...CONNECTION_BASE_FIELDS, ...FEE_EXTRA_FIELDS],
    "Planner 68 fee candidate",
  );
  assertArray(inbound.orderedNodeIds, 2, "Planner 68 inbound node sequence");
  assertArray(accessNo.orderedNodeIds, 28, "Planner 68 access-no node sequence");
  assertArray(fee.orderedNodeIds, 2, "Planner 68 fee node sequence");

  const geometry = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  const endpointNode = geometry.nodes[1];

  if (
    authority.id !== AUTHORITY_ID ||
    authority.provider !== "OpenStreetMap" ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.targetTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointNodeId !== ENDPOINT_NODE_ID ||
    authority.endpointCoordinate.lat !== 32.7358299 ||
    authority.endpointCoordinate.lng !== -117.150419 ||
    authority.endpointCoordinate.sourceVersion !== 2 ||
    authority.endpointCoordinate.sourceTimestamp !== TARGET_TIMESTAMP ||
    authority.endpointCoordinate.sourceChangeset !== SOURCE_CHANGESET ||
    authority.outboundCandidateCount !== 2 ||
    authority.outboundCandidateWayIds[0] !== ACCESS_NO_WAY_ID ||
    authority.outboundCandidateWayIds[1] !== FEE_FOOTWAY_ID ||
    authority.branchSelectionStatus !== "unresolved" ||
    authority.selectionRule !==
      "requires-independent-objective-authority-when-multiple-non-inbound-linear-highway-ways-exist" ||
    authority.plannerMaterialization !== "branching-topology-only"
  ) {
    throw new Error(
      "Planner 68 branching topology drifted from captured historical evidence.",
    );
  }

  if (
    geometry.sourceWayId !== INBOUND_WAY_ID ||
    geometry.traversalToNodeId !== authority.endpointNodeId ||
    endpointNode.sourceObjectId !== authority.endpointNodeId ||
    endpointNode.sourceVersion !== 2 ||
    endpointNode.lat !== authority.endpointCoordinate.lat ||
    endpointNode.lng !== authority.endpointCoordinate.lng
  ) {
    throw new Error(
      "Planner 68 detached from Planner 67 version-pinned geometry.",
    );
  }

  if (
    inbound.sourceWayId !== INBOUND_WAY_ID ||
    inbound.connectionRole !== "inbound-qualified-segment" ||
    inbound.endpointNodeIndex !== 1 ||
    inbound.orderedNodeIds[1] !== ENDPOINT_NODE_ID
  ) {
    throw new Error("Planner 68 inbound connection drifted.");
  }

  if (
    accessNo.sourceWayId !== ACCESS_NO_WAY_ID ||
    accessNo.sourceWayVersion !== 6 ||
    accessNo.sourceAccess !== "no" ||
    accessNo.sourceFee !== "yes" ||
    accessNo.sourceLayer !== "-1" ||
    accessNo.endpointNodeIndex !== 27 ||
    accessNo.connectionRole !== "outbound-candidate" ||
    accessNo.orderedNodeIds[27] !== ENDPOINT_NODE_ID
  ) {
    throw new Error("Planner 68 access-no candidate drifted.");
  }

  if (
    fee.sourceWayId !== FEE_FOOTWAY_ID ||
    fee.sourceWayVersion !== 1 ||
    Object.hasOwn(fee, "sourceAccess") ||
    fee.sourceFee !== "yes" ||
    fee.sourceLayer !== "-1" ||
    fee.endpointNodeIndex !== 0 ||
    fee.connectionRole !== "outbound-candidate" ||
    fee.orderedNodeIds[0] !== ENDPOINT_NODE_ID ||
    fee.orderedNodeIds[1] !== "48920902"
  ) {
    throw new Error("Planner 68 fee candidate drifted.");
  }
}

assertInteriorUnnamedFootwayBranchingTopologyIntegrity(RAW_AUTHORITY);

export const INTERIOR_UNNAMED_FOOTWAY_BRANCHING_TOPOLOGY:
  readonly InteriorUnnamedFootwayBranchingTopologyAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorUnnamedFootwayBranchingTopology():
  InteriorUnnamedFootwayBranchingTopologyAssessment {
  return deepFreeze({
    status: "branching-topology-sourced",
    authorityId: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    endpointNodeId: ENDPOINT_NODE_ID,
    historicalConnectedWayCount: 3,
    outboundCandidateWayIds: [ACCESS_NO_WAY_ID, FEE_FOOTWAY_ID],
    branchSelectionStatus: "unresolved",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...BLOCK_REASONS],
    },
  });
}
