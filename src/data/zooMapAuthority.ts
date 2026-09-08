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

export type CorridorSourceRecordRelation = {
  sourceRecordId: string;
  relation: "access" | "endpoint";
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
  sourceRecordRelations?: readonly CorridorSourceRecordRelation[];
  plannerMaterialization: "corridor-authority-only";
};

export type PlannerNavigationMaterializationBlock = {
  status: "blocked";
  reason:
    | "COORDINATES_NOT_SOURCED"
    | "SOURCE_RECORD_HAS_NO_MAP_ANCHOR"
    | "SOURCE_RECORD_UNKNOWN";
  sourceRecordId: string;
  mapAnchorIds: string[];
};

const OBSERVED_AT = "2026-09-07T21:53:00-07:00";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIMESTAMP_RE =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

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
    sourceRecordRelations: [
      {
        sourceRecordId: "sdz-panda-ridge",
        relation: "access",
      },
    ],
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
    sourceRecordRelations: [
      {
        sourceRecordId: "sdz-tiger-trail",
        relation: "access",
      },
    ],
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
    sourceRecordRelations: [
      {
        sourceRecordId: "sdz-gorilla-tropics",
        relation: "endpoint",
      },
    ],
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
    sourceRecordRelations: [
      {
        sourceRecordId: "sdz-tiger-trail",
        relation: "endpoint",
      },
    ],
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

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function validDate(value: string) {
  if (!DATE_RE.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function validTimestamp(value: string) {
  return (
    ISO_TIMESTAMP_RE.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function validZooPdfUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "zoo.sandiegozoo.org" &&
      url.pathname.toLowerCase().endsWith(".pdf")
    );
  } catch {
    return false;
  }
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

function expectedAnchorRole(
  sourceRecordId: string,
) {
  const record = sourceBackedRecordById(sourceRecordId);
  if (!record) return null;

  switch (record.kind) {
    case "animal-destination":
      return "destination" as const;
    case "presentation":
      return "presentation-venue" as const;
    case "transport":
      return "transport-station" as const;
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
  const sourceAnchorKeys = new Set<string>();

  for (const artifact of artifacts) {
    if (
      artifact.authority !== "official" ||
      !stableId(artifact.sourceLabel) ||
      !validZooPdfUrl(artifact.sourceUrl) ||
      !validDate(artifact.revisionDate) ||
      !validTimestamp(artifact.observedAt) ||
      artifact.revisionDate >
        artifact.observedAt.slice(0, 10)
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
      const expectedRole = expectedAnchorRole(
        anchor.sourceRecordId,
      );

      if (!expectedRole) {
        throw new Error(
          `Map anchor ${anchor.id} references unknown source record ${anchor.sourceRecordId}.`,
        );
      }

      if (anchor.role !== expectedRole) {
        throw new Error(
          `Map anchor ${anchor.id} role ${anchor.role} is incompatible with source record ${anchor.sourceRecordId}.`,
        );
      }

      const sourceAnchorKey = JSON.stringify([
        anchor.sourceRecordId,
        anchor.mapLabel,
        anchor.role,
      ]);

      if (sourceAnchorKeys.has(sourceAnchorKey)) {
        throw new Error(
          `Duplicate source-record map anchor mapping for ${anchor.sourceRecordId}: ${anchor.mapLabel}.`,
        );
      }
      sourceAnchorKeys.add(sourceAnchorKey);

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

    if (!stableId(corridor.name)) {
      throw new Error(
        `Walking corridor ${corridor.id} requires a stable name.`,
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
      corridor.accessLabels !== undefined &&
      (corridor.accessLabels.length === 0 ||
        new Set(corridor.accessLabels).size !==
          corridor.accessLabels.length ||
        corridor.accessLabels.some(
          (label) => !stableId(label),
        ))
    ) {
      throw new Error(
        `Walking corridor ${corridor.id} has invalid access labels.`,
      );
    }

    const relationKeys = new Set<string>();

    for (const relation of
      corridor.sourceRecordRelations ?? []) {
      if (!sourceBackedRecordById(relation.sourceRecordId)) {
        throw new Error(
          `Walking corridor ${corridor.id} references unknown source record ${relation.sourceRecordId}.`,
        );
      }

      if (
        relation.relation !== "access" &&
        relation.relation !== "endpoint"
      ) {
        throw new Error(
          `Walking corridor ${corridor.id} has invalid source-record relation.`,
        );
      }

      const relationKey = JSON.stringify([
        relation.sourceRecordId,
        relation.relation,
      ]);
      if (relationKeys.has(relationKey)) {
        throw new Error(
          `Walking corridor ${corridor.id} has a duplicate source-record relation.`,
        );
      }
      relationKeys.add(relationKey);

      if (
        relation.relation === "access" &&
        (!corridor.accessLabels ||
          corridor.accessLabels.length === 0)
      ) {
        throw new Error(
          `Walking corridor ${corridor.id} requires accessLabels for an access relation.`,
        );
      }

      if (
        relation.relation === "endpoint" &&
        (!stableId(corridor.fromDescriptor) ||
          !stableId(corridor.toDescriptor))
      ) {
        throw new Error(
          `Walking corridor ${corridor.id} requires from/to descriptors for an endpoint relation.`,
        );
      }
    }
  }

  for (const [sourceRecordId, ids] of
    sourceRecordToAnchorIds) {
    ids.sort(compareText);
    sourceRecordToAnchorIds.set(
      sourceRecordId,
      ids,
    );
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
  ).sort((a, b) => compareText(a.id, b.id));
}

export function publishedWalkingCorridorsForSourceRecord(
  sourceRecordId: string,
) {
  return PUBLISHED_WALKING_CORRIDORS.filter(
    (corridor) =>
      corridor.sourceRecordRelations?.some(
        (relation) =>
          relation.sourceRecordId === sourceRecordId,
      ) === true,
  ).sort((a, b) => compareText(a.id, b.id));
}

export function assessPlannerNavigationMaterialization(
  sourceRecordId: string,
): PlannerNavigationMaterializationBlock {
  if (!sourceBackedRecordById(sourceRecordId)) {
    return {
      status: "blocked",
      reason: "SOURCE_RECORD_UNKNOWN",
      sourceRecordId,
      mapAnchorIds: [],
    };
  }

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
    mapAnchorIds: anchors.map(
      (anchor) => anchor.id,
    ),
  };
}
