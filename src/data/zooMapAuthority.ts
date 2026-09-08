import {
  sourceBackedRecordById,
} from "./zooSourceCatalog.ts";

export type OfficialZooMapArtifact = {
  id: string;
  kind: "classic-map" | "accessibility-map";
  sourceUrl: string;
  sourceLabel: string;
  revisionDate: string;
  observedAt: string;
  authority: "official";
};

export type OfficialMapAnchor = {
  id: string;
  mapLabel: string;
  artifactId: string;
  sourceRecordId?: string;
  role:
    | "entrance"
    | "destination"
    | "presentation-venue"
    | "transport-station"
    | "area";
  plannerMaterialization: "map-anchor-only";
};

export type PublishedWalkingCorridor = {
  id: string;
  name: string;
  artifactId: string;
  publishedWalkMinutes: number;
  terrain:
    | "mild"
    | "mild-to-steep"
    | "steep"
    | "steep-and-stairs";
  fromDescriptor?: string;
  toDescriptor?: string;
  accessLabels?: readonly string[];
  targetSourceRecordId?: string;
  plannerMaterialization: "corridor-authority-only";
};

export type PlannerNavigationMaterializationBlock = {
  status: "blocked";
  reason:
    | "COORDINATES_NOT_SOURCED"
    | "SOURCE_RECORD_HAS_NO_MAP_ANCHOR";
  sourceRecordId: string;
  mapAnchorIds: string[];
};

const OBSERVED_AT = "2026-09-07T21:53:00-07:00";

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

const RAW_MAP_ARTIFACTS: OfficialZooMapArtifact[] = [
  {
    id: "sdz-map-2026-01-05-classic",
    kind: "classic-map",
    sourceUrl:
      "https://zoo.sandiegozoo.org/sites/default/files/2026-01/01-05-26_Zoo%20Map_web.pdf",
    sourceLabel: "San Diego Zoo — Zoo Map V01.05.26",
    revisionDate: "2026-01-05",
    observedAt: OBSERVED_AT,
    authority: "official",
  },
  {
    id: "sdz-map-2026-01-05-accessibility",
    kind: "accessibility-map",
    sourceUrl:
      "https://zoo.sandiegozoo.org/sites/default/files/2026-01/Zoo_ADA_Map_01-05-26_web.pdf",
    sourceLabel:
      "San Diego Zoo — Resource Map for Guests with Disabilities V01.05.26",
    revisionDate: "2026-01-05",
    observedAt: OBSERVED_AT,
    authority: "official",
  },
];

const CLASSIC_MAP = "sdz-map-2026-01-05-classic";
const ACCESSIBILITY_MAP =
  "sdz-map-2026-01-05-accessibility";

const RAW_MAP_ANCHORS: OfficialMapAnchor[] = [
  {
    id: "sdz-map-anchor-entrance",
    mapLabel: "ENTRANCE",
    artifactId: CLASSIC_MAP,
    role: "entrance",
    plannerMaterialization: "map-anchor-only",
  },
  {
    id: "sdz-map-anchor-panda-ridge",
    mapLabel: "PANDA RIDGE",
    artifactId: CLASSIC_MAP,
    sourceRecordId: "sdz-panda-ridge",
    role: "destination",
    plannerMaterialization: "map-anchor-only",
  },
  {
    id: "sdz-map-anchor-tiger-trail",
    mapLabel: "TIGER TRAIL",
    artifactId: ACCESSIBILITY_MAP,
    sourceRecordId: "sdz-tiger-trail",
    role: "destination",
    plannerMaterialization: "map-anchor-only",
  },
  {
    id: "sdz-map-anchor-wegeforth-bowl",
    mapLabel: "WEGEFORTH BOWL",
    artifactId: ACCESSIBILITY_MAP,
    sourceRecordId: "sdz-wildlife-wonders",
    role: "presentation-venue",
    plannerMaterialization: "map-anchor-only",
  },
  {
    id: "sdz-map-anchor-rady-ambassador",
    mapLabel: "RADY AMBASSADOR PRESENTATION AREA",
    artifactId: ACCESSIBILITY_MAP,
    sourceRecordId: "sdz-rady-ambassador-presentation",
    role: "presentation-venue",
    plannerMaterialization: "map-anchor-only",
  },
  {
    id: "sdz-map-anchor-skyfari-east",
    mapLabel: "ALASKA AIRLINES SKYFARI EAST",
    artifactId: ACCESSIBILITY_MAP,
    sourceRecordId: "sdz-skyfari",
    role: "transport-station",
    plannerMaterialization: "map-anchor-only",
  },
  {
    id: "sdz-map-anchor-skyfari-west",
    mapLabel: "ALASKA AIRLINES SKYFARI WEST",
    artifactId: ACCESSIBILITY_MAP,
    sourceRecordId: "sdz-skyfari",
    role: "transport-station",
    plannerMaterialization: "map-anchor-only",
  },
  {
    id: "sdz-map-anchor-lost-forest",
    mapLabel: "LOST FOREST",
    artifactId: ACCESSIBILITY_MAP,
    role: "area",
    plannerMaterialization: "map-anchor-only",
  },
  {
    id: "sdz-map-anchor-outback",
    mapLabel: "OUTBACK",
    artifactId: ACCESSIBILITY_MAP,
    role: "area",
    plannerMaterialization: "map-anchor-only",
  },
];

const RAW_WALKING_CORRIDORS: PublishedWalkingCorridor[] = [
  {
    id: "sdz-corridor-front-street",
    name: "Front Street",
    artifactId: ACCESSIBILITY_MAP,
    publishedWalkMinutes: 20,
    terrain: "mild",
    accessLabels: [
      "Wildlife Explorers Basecamp",
      "Lost Forest",
      "Outback",
      "Urban Jungle",
      "Africa Rocks",
    ],
    plannerMaterialization: "corridor-authority-only",
  },
  {
    id: "sdz-corridor-park-way",
    name: "Park Way",
    artifactId: ACCESSIBILITY_MAP,
    publishedWalkMinutes: 30,
    terrain: "mild-to-steep",
    accessLabels: [
      "Africa Rocks",
      "Asian Passage",
      "Panda Ridge",
      "Northern Frontier",
      "Elephant Odyssey",
    ],
    targetSourceRecordId: "sdz-panda-ridge",
    plannerMaterialization: "corridor-authority-only",
  },
  {
    id: "sdz-corridor-center-street",
    name: "Center Street",
    artifactId: ACCESSIBILITY_MAP,
    publishedWalkMinutes: 15,
    terrain: "steep",
    accessLabels: ["Outback", "Asian Passage"],
    plannerMaterialization: "corridor-authority-only",
  },
  {
    id: "sdz-corridor-treetops-way",
    name: "Treetops Way",
    artifactId: ACCESSIBILITY_MAP,
    publishedWalkMinutes: 7,
    terrain: "mild",
    accessLabels: [
      "Fern Canyon",
      "Tiger",
      "Orangutan",
      "Hippo",
      "Monkey Trails",
    ],
    targetSourceRecordId: "sdz-tiger-trail",
    plannerMaterialization: "corridor-authority-only",
  },
  {
    id: "sdz-corridor-fern-canyon-trail",
    name: "Fern Canyon Trail",
    artifactId: ACCESSIBILITY_MAP,
    publishedWalkMinutes: 7,
    terrain: "steep-and-stairs",
    fromDescriptor: "Treetops Way",
    toDescriptor: "Park Way and Center Street",
    plannerMaterialization: "corridor-authority-only",
  },
  {
    id: "sdz-corridor-monkey-trail",
    name: "Monkey Trail",
    artifactId: ACCESSIBILITY_MAP,
    publishedWalkMinutes: 15,
    terrain: "mild",
    fromDescriptor: "Entrance",
    toDescriptor: "Gorillas",
    targetSourceRecordId: "sdz-gorilla-tropics",
    plannerMaterialization: "corridor-authority-only",
  },
  {
    id: "sdz-corridor-tiger-trail",
    name: "Tiger Trail",
    artifactId: ACCESSIBILITY_MAP,
    publishedWalkMinutes: 20,
    terrain: "mild-to-steep",
    fromDescriptor: "Entrance",
    toDescriptor: "Tigers",
    targetSourceRecordId: "sdz-tiger-trail",
    plannerMaterialization: "corridor-authority-only",
  },
];

function stableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function assertUniqueIds(
  values: readonly { id: string }[],
  label: string,
) {
  const seen = new Set<string>();

  for (const value of values) {
    if (!stableId(value.id)) {
      throw new Error(
        `${label} contains an invalid stable ID.`,
      );
    }

    if (seen.has(value.id)) {
      throw new Error(
        `Duplicate ${label} ID: ${value.id}`,
      );
    }

    seen.add(value.id);
  }
}

export function assertOfficialMapAuthorityIntegrity(
  artifacts: readonly OfficialZooMapArtifact[],
  anchors: readonly OfficialMapAnchor[],
  corridors: readonly PublishedWalkingCorridor[],
) {
  assertUniqueIds(artifacts, "map artifact");
  assertUniqueIds(anchors, "map anchor");
  assertUniqueIds(corridors, "walking corridor");

  const artifactIds = new Set(
    artifacts.map((artifact) => artifact.id),
  );
  const sourceRecordToAnchorIds = new Map<
    string,
    string[]
  >();

  for (const artifact of artifacts) {
    if (
      artifact.authority !== "official" ||
      !stableId(artifact.sourceLabel) ||
      !/^https:\/\/zoo\.sandiegozoo\.org\//.test(
        artifact.sourceUrl,
      ) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(
        artifact.revisionDate,
      )
    ) {
      throw new Error(
        `Official map artifact ${artifact.id} is malformed.`,
      );
    }
  }

  for (const anchor of anchors) {
    if (!artifactIds.has(anchor.artifactId)) {
      throw new Error(
        `Map anchor ${anchor.id} references unknown artifact ${anchor.artifactId}.`,
      );
    }

    if (!stableId(anchor.mapLabel)) {
      throw new Error(
        `Map anchor ${anchor.id} requires a map label.`,
      );
    }

    if (anchor.sourceRecordId) {
      if (!sourceBackedRecordById(anchor.sourceRecordId)) {
        throw new Error(
          `Map anchor ${anchor.id} references unknown source record ${anchor.sourceRecordId}.`,
        );
      }

      const ids =
        sourceRecordToAnchorIds.get(
          anchor.sourceRecordId,
        ) ?? [];
      ids.push(anchor.id);
      sourceRecordToAnchorIds.set(
        anchor.sourceRecordId,
        ids,
      );
    }
  }

  for (const corridor of corridors) {
    if (!artifactIds.has(corridor.artifactId)) {
      throw new Error(
        `Walking corridor ${corridor.id} references unknown artifact ${corridor.artifactId}.`,
      );
    }

    if (
      !Number.isSafeInteger(
        corridor.publishedWalkMinutes,
      ) ||
      corridor.publishedWalkMinutes <= 0
    ) {
      throw new Error(
        `Walking corridor ${corridor.id} requires a positive integer publishedWalkMinutes.`,
      );
    }

    if (
      corridor.targetSourceRecordId &&
      !sourceBackedRecordById(
        corridor.targetSourceRecordId,
      )
    ) {
      throw new Error(
        `Walking corridor ${corridor.id} references unknown source record ${corridor.targetSourceRecordId}.`,
      );
    }
  }

  return sourceRecordToAnchorIds;
}

const SOURCE_RECORD_TO_ANCHOR_IDS =
  assertOfficialMapAuthorityIntegrity(
    RAW_MAP_ARTIFACTS,
    RAW_MAP_ANCHORS,
    RAW_WALKING_CORRIDORS,
  );

export const OFFICIAL_ZOO_MAP_ARTIFACTS:
  readonly OfficialZooMapArtifact[] =
  deepFreeze(RAW_MAP_ARTIFACTS);

export const OFFICIAL_MAP_ANCHORS:
  readonly OfficialMapAnchor[] =
  deepFreeze(RAW_MAP_ANCHORS);

export const PUBLISHED_WALKING_CORRIDORS:
  readonly PublishedWalkingCorridor[] =
  deepFreeze(RAW_WALKING_CORRIDORS);

export function officialMapAnchorsForSourceRecord(
  sourceRecordId: string,
) {
  const ids =
    SOURCE_RECORD_TO_ANCHOR_IDS.get(
      sourceRecordId,
    ) ?? [];
  const idSet = new Set(ids);

  return OFFICIAL_MAP_ANCHORS.filter((anchor) =>
    idSet.has(anchor.id),
  );
}

export function publishedWalkingCorridorsForSourceRecord(
  sourceRecordId: string,
) {
  return PUBLISHED_WALKING_CORRIDORS.filter(
    (corridor) =>
      corridor.targetSourceRecordId ===
      sourceRecordId,
  );
}

export function assessPlannerNavigationMaterialization(
  sourceRecordId: string,
): PlannerNavigationMaterializationBlock {
  const anchors =
    officialMapAnchorsForSourceRecord(
      sourceRecordId,
    );

  return {
    status: "blocked",
    reason:
      anchors.length > 0
        ? "COORDINATES_NOT_SOURCED"
        : "SOURCE_RECORD_HAS_NO_MAP_ANCHOR",
    sourceRecordId,
    mapAnchorIds: anchors
      .map((anchor) => anchor.id)
      .sort(),
  };
}
