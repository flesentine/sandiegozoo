import { INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY } from "./zooInteriorTreetopsV7GeometryAuthority.ts";

const AUTHORITY_ID = "sdz-interior-treetops-historical-topology" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const ANCHOR_NODE_ID = "1619736626" as const;
const SOURCE_TREETOPS_WAY_ID = "148910139" as const;
const SOURCE_TREETOPS_WAY_VERSION = 7 as const;
const SOURCE_TREETOPS_WAY_TIMESTAMP = "2026-02-21T20:28:40Z" as const;
const NEXT_JUNCTION_NODE_ID = "13588159626" as const;
const NEXT_JUNCTION_TREETOPS_INDEX = 6 as const;

const SEGMENT_NODE_IDS = [
  "1619736626",
  "1619736622",
  "1619736623",
  "10303552086",
  "1619736627",
  "1619736634",
  "13588159626",
] as const;

export type HistoricalTopologyConnection = {
  sharedNodeId: string;
  treetopsIndex: number;
  sourceWayId: string;
  sourceWayUrl: string;
  sourceWayVersionUrl: string;
  sourceWayVersion: number;
  sourceWayTimestamp: string;
  sourceWayChangeset: number;
  sourceHighway: string;
  sourceArea?: string;
  sourceSurface?: string;
  sourceName?: string;
  orderedNodeIds: readonly string[];
  classification:
    | "excluded-pedestrian-area-not-linear-branch"
    | "first-linear-walkable-connected-way-after-anchor";
};

export type InteriorTreetopsHistoricalTopologyAuthority = {
  id: typeof AUTHORITY_ID;
  provider: "OpenStreetMap";
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  sourceTreetopsWayId: typeof SOURCE_TREETOPS_WAY_ID;
  sourceTreetopsWayVersion: typeof SOURCE_TREETOPS_WAY_VERSION;
  sourceTreetopsWayTimestamp: typeof SOURCE_TREETOPS_WAY_TIMESTAMP;
  historicalTopologyCaptureRule: "historical-overpass-snapshot-verified-by-exact-osm-way-version";
  junctionSelectionRule: "scan-forward-after-anchor-first-exact-connected-linear-highway-way-excluding-area-yes";
  interveningConnections: readonly HistoricalTopologyConnection[];
  selectedJunctionConnection: HistoricalTopologyConnection;
  nextJunctionNodeId: typeof NEXT_JUNCTION_NODE_ID;
  nextJunctionTreetopsIndex: typeof NEXT_JUNCTION_TREETOPS_INDEX;
  segmentProvenance: {
    sourceWayId: typeof SOURCE_TREETOPS_WAY_ID;
    sourceWayVersion: typeof SOURCE_TREETOPS_WAY_VERSION;
    sourceWayVersionUrl: string;
    fromNodeId: typeof ANCHOR_NODE_ID;
    toNodeId: typeof NEXT_JUNCTION_NODE_ID;
    fromTreetopsIndex: 0;
    toTreetopsIndex: typeof NEXT_JUNCTION_TREETOPS_INDEX;
    orderedNodeIds: readonly string[];
    status: "captured";
  };
  plannerMaterialization: "junction-and-segment-provenance-only";
};

export type InteriorTreetopsHistoricalTopologyAssessment = {
  status: "junction-and-segment-sourced";
  authorityId: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  anchorNodeId: typeof ANCHOR_NODE_ID;
  nextJunctionNodeId: typeof NEXT_JUNCTION_NODE_ID;
  nextJunctionTreetopsIndex: typeof NEXT_JUNCTION_TREETOPS_INDEX;
  connectedWayId: "1481578621";
  nextJunctionSelection: "captured";
  exactSegmentProvenance: "captured";
  routeGraphExpansion: {
    status: "blocked";
    reasons: readonly ["PEDESTRIAN_MODE_NOT_QUALIFIED"];
  };
};

function nullRecord<T extends object>(value: T): T {
  return Object.assign(Object.create(null), value) as T;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const INTERVENING_AREA_CONNECTION = nullRecord<HistoricalTopologyConnection>({
  sharedNodeId: "10303552086",
  treetopsIndex: 3,
  sourceWayId: "1126804582",
  sourceWayUrl: "https://www.openstreetmap.org/way/1126804582",
  sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/1126804582/3",
  sourceWayVersion: 3,
  sourceWayTimestamp: "2026-02-21T14:47:49Z",
  sourceWayChangeset: 178862584,
  sourceHighway: "pedestrian",
  sourceArea: "yes",
  sourceSurface: "paving_stones",
  orderedNodeIds: ["926024999","7053320516","926024998","926024997","10303552043","10303552044","10303552045","10303552046","10303552047","926024995","10303552048","10303552049","10303552050","10303552051","10303552052","10303552053","10231892128","10231892129","10231892130","10231892131","926024989","10231892132","926024988","926024987","926024986","926024985","10231892140","10231892139","10303552054","10231892138","2591959895","2591959897","2591959899","2591959901","2591959902","2591959904","2591959906","2591959827","2591959828","2591959830","2591959832","2591959834","10303552055","10303552080","10303552056","9365675104","9365675103","9365675102","9365675101","9365675100","10303552081","10303552057","10303552058","10303552059","10303552060","10303552061","10303552062","10303552085","10303552063","10303552064","10303552065","10303552066","10303552082","10303552067","10303552068","10303552069","10303552070","10303552086","10303552071","9365675109","9365675108","10303552083","10303552072","10303552073","48905912","13587192687","10303552074","10303552075","10303552076","10303552078","10303552079","926025000","926024999"],
  classification: "excluded-pedestrian-area-not-linear-branch",
});

const SELECTED_JUNCTION_CONNECTION = nullRecord<HistoricalTopologyConnection>({
  sharedNodeId: NEXT_JUNCTION_NODE_ID,
  treetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
  sourceWayId: "1481578621",
  sourceWayUrl: "https://www.openstreetmap.org/way/1481578621",
  sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/1481578621/1",
  sourceWayVersion: 1,
  sourceWayTimestamp: "2026-02-21T20:08:08Z",
  sourceWayChangeset: 178875075,
  sourceHighway: "footway",
  sourceName: "Fern Canyon Trail",
  orderedNodeIds: ["13588159625", NEXT_JUNCTION_NODE_ID],
  classification: "first-linear-walkable-connected-way-after-anchor",
});

const RAW_AUTHORITY: InteriorTreetopsHistoricalTopologyAuthority[] = [nullRecord({
  id: AUTHORITY_ID,
  provider: "OpenStreetMap",
  objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
  anchorNodeId: ANCHOR_NODE_ID,
  sourceTreetopsWayId: SOURCE_TREETOPS_WAY_ID,
  sourceTreetopsWayVersion: SOURCE_TREETOPS_WAY_VERSION,
  sourceTreetopsWayTimestamp: SOURCE_TREETOPS_WAY_TIMESTAMP,
  historicalTopologyCaptureRule: "historical-overpass-snapshot-verified-by-exact-osm-way-version",
  junctionSelectionRule: "scan-forward-after-anchor-first-exact-connected-linear-highway-way-excluding-area-yes",
  interveningConnections: [INTERVENING_AREA_CONNECTION],
  selectedJunctionConnection: SELECTED_JUNCTION_CONNECTION,
  nextJunctionNodeId: NEXT_JUNCTION_NODE_ID,
  nextJunctionTreetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
  segmentProvenance: nullRecord({
    sourceWayId: SOURCE_TREETOPS_WAY_ID,
    sourceWayVersion: SOURCE_TREETOPS_WAY_VERSION,
    sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/148910139/7",
    fromNodeId: ANCHOR_NODE_ID,
    toNodeId: NEXT_JUNCTION_NODE_ID,
    fromTreetopsIndex: 0,
    toTreetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
    orderedNodeIds: [...SEGMENT_NODE_IDS],
    status: "captured",
  }),
  plannerMaterialization: "junction-and-segment-provenance-only",
})];

function assertCanonicalAuthority(): void {
  const authority = RAW_AUTHORITY[0];
  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];

  if (
    authority.objectiveSourceRecordId !== geometry.objectiveSourceRecordId ||
    authority.anchorNodeId !== geometry.anchorNodeId ||
    authority.sourceTreetopsWayId !== geometry.sourceWayId ||
    authority.sourceTreetopsWayVersion !== geometry.sourceWayVersion ||
    authority.sourceTreetopsWayTimestamp !== geometry.sourceWayTimestamp
  ) throw new Error("Planner 44 drifted from Planner 43 version-pinned Treetops geometry.");

  const expectedSegment = geometry.orderedNodeIds.slice(0, NEXT_JUNCTION_TREETOPS_INDEX + 1);
  if (expectedSegment.length !== SEGMENT_NODE_IDS.length || expectedSegment.some((nodeId, index) => nodeId !== SEGMENT_NODE_IDS[index])) {
    throw new Error("Planner 44 segment provenance drifted from Planner 43 ordered geometry.");
  }

  const area = authority.interveningConnections[0];
  if (
    authority.interveningConnections.length !== 1 ||
    area.sharedNodeId !== geometry.orderedNodeIds[3] ||
    area.treetopsIndex !== 3 ||
    area.sourceWayId !== "1126804582" ||
    area.sourceWayVersion !== 3 ||
    area.sourceWayTimestamp !== "2026-02-21T14:47:49Z" ||
    area.sourceWayChangeset !== 178862584 ||
    area.sourceHighway !== "pedestrian" ||
    area.sourceArea !== "yes" ||
    !area.orderedNodeIds.includes(area.sharedNodeId) ||
    area.classification !== "excluded-pedestrian-area-not-linear-branch"
  ) throw new Error("Planner 44 intervening historical area evidence drifted.");

  const selected = authority.selectedJunctionConnection;
  if (
    selected.sharedNodeId !== geometry.orderedNodeIds[NEXT_JUNCTION_TREETOPS_INDEX] ||
    selected.treetopsIndex !== NEXT_JUNCTION_TREETOPS_INDEX ||
    selected.sourceWayId !== "1481578621" ||
    selected.sourceWayVersion !== 1 ||
    selected.sourceWayTimestamp !== "2026-02-21T20:08:08Z" ||
    selected.sourceWayChangeset !== 178875075 ||
    selected.sourceHighway !== "footway" ||
    selected.sourceName !== "Fern Canyon Trail" ||
    selected.orderedNodeIds.length !== 2 ||
    selected.orderedNodeIds[0] !== "13588159625" ||
    selected.orderedNodeIds[1] !== NEXT_JUNCTION_NODE_ID ||
    selected.classification !== "first-linear-walkable-connected-way-after-anchor"
  ) throw new Error("Planner 44 selected junction provenance drifted.");

  const segment = authority.segmentProvenance;
  if (
    segment.sourceWayId !== SOURCE_TREETOPS_WAY_ID ||
    segment.sourceWayVersion !== SOURCE_TREETOPS_WAY_VERSION ||
    segment.sourceWayVersionUrl !== "https://api.openstreetmap.org/api/0.6/way/148910139/7" ||
    segment.fromNodeId !== ANCHOR_NODE_ID ||
    segment.toNodeId !== NEXT_JUNCTION_NODE_ID ||
    segment.fromTreetopsIndex !== 0 ||
    segment.toTreetopsIndex !== NEXT_JUNCTION_TREETOPS_INDEX ||
    segment.status !== "captured" ||
    segment.orderedNodeIds.length !== SEGMENT_NODE_IDS.length ||
    segment.orderedNodeIds.some((nodeId, index) => nodeId !== SEGMENT_NODE_IDS[index])
  ) throw new Error("Planner 44 exact segment provenance drifted.");

  const forbidden = ["mode","distanceMeters","durationMinutes","difficulty","stairs","accessible","stroller","oneWay","status","routeNodeId","routeEdgeId"];
  const serialized = JSON.stringify(authority);
  if (forbidden.some((field) => serialized.includes(`"${field}"`))) throw new Error("Planner 44 cannot materialize downstream route semantics.");
}

assertCanonicalAuthority();

export const INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY: readonly InteriorTreetopsHistoricalTopologyAuthority[] =
  deepFreeze(RAW_AUTHORITY);

export function assessInteriorTreetopsHistoricalTopology(): InteriorTreetopsHistoricalTopologyAssessment {
  return deepFreeze({
    status: "junction-and-segment-sourced",
    authorityId: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    anchorNodeId: ANCHOR_NODE_ID,
    nextJunctionNodeId: NEXT_JUNCTION_NODE_ID,
    nextJunctionTreetopsIndex: NEXT_JUNCTION_TREETOPS_INDEX,
    connectedWayId: "1481578621",
    nextJunctionSelection: "captured",
    exactSegmentProvenance: "captured",
    routeGraphExpansion: {
      status: "blocked",
      reasons: ["PEDESTRIAN_MODE_NOT_QUALIFIED"],
    },
  });
}
