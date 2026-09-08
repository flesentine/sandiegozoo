export type OfficialZooSource = {
  id: string;
  sourceUrl: string;
  sourceLabel: string;
  observedAt: string;
  authority: "official";
};

export type SourceEvidence = {
  identity: OfficialZooSource;
  location?: OfficialZooSource;
  schedule?: OfficialZooSource;
  hours?: OfficialZooSource;
};

export type SourceBackedAnimalDestination = {
  id: string;
  kind: "animal-destination";
  uiPriorityId: string;
  canonicalName: string;
  officialAreaLabel?: string;
  evidence: SourceEvidence;
  plannerMaterialization: "identity-only";
};

export type SourceBackedPresentation = {
  id: string;
  kind: "presentation";
  uiPriorityId?: string;
  canonicalName: string;
  venue: string;
  recurrence: "daily";
  startTime: string;
  durationMinutesRange?: readonly [number, number];
  recommendedArrivalMinutes?: number;
  evidence: SourceEvidence;
  plannerMaterialization:
    | "identity-and-schedule-partial"
    | "identity-only";
};

export type SourceBackedTransport = {
  id: string;
  kind: "transport";
  canonicalName: string;
  recurrence: "daily";
  startTime: string;
  endTimePolicy: "zoo-close";
  evidence: SourceEvidence;
  plannerMaterialization: "identity-and-hours-partial";
};

export type SourceBackedZooRecord =
  | SourceBackedAnimalDestination
  | SourceBackedPresentation
  | SourceBackedTransport;

const OBSERVED_AT = "2026-09-07T21:53:00-07:00";

function officialSource(
  id: string,
  sourceUrl: string,
  sourceLabel: string,
): OfficialZooSource {
  return {
    id,
    sourceUrl,
    sourceLabel,
    observedAt: OBSERVED_AT,
    authority: "official",
  };
}

const PANDA_SOURCE = officialSource(
  "sdz-source-giant-pandas",
  "https://zoo.sandiegozoo.org/giant-pandas",
  "San Diego Zoo — Giant Pandas",
);

const TIGER_SOURCE = officialSource(
  "sdz-source-tiger-trail",
  "https://zoo.sandiegozoo.org/animals/tiger-trail",
  "San Diego Zoo — Tiger Trail",
);

const KOALA_SOURCE = officialSource(
  "sdz-source-koala",
  "https://zoo.sandiegozoo.org/animals/koala",
  "San Diego Zoo — Koala",
);

const GORILLA_SOURCE = officialSource(
  "sdz-source-gorilla-tropics",
  "https://zoo.sandiegozoo.org/animals/gorilla-tropicsr-and-scripps-aviary",
  "San Diego Zoo — Gorilla Tropics and Scripps Aviary",
);

const PRESENTATIONS_SOURCE = officialSource(
  "sdz-source-wildlife-presentations",
  "https://zoo.sandiegozoo.org/activities/wildlife-presentations",
  "San Diego Zoo — Wildlife Presentations",
);

const SKYFARI_DETAIL_SOURCE = officialSource(
  "sdz-source-skyfari-detail",
  "https://zoo.sandiegozoo.org/activities/skyfarir-aerial-tram",
  "San Diego Zoo — Skyfari Aerial Tram",
);

const ACTIVITIES_INDEX_SOURCE = officialSource(
  "sdz-source-activities-index",
  "https://zoo.sandiegozoo.org/activities",
  "San Diego Zoo — Activities",
);

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

const RAW_SOURCE_BACKED_ZOO_RECORDS: SourceBackedZooRecord[] = [
  {
    id: "sdz-panda-ridge",
    kind: "animal-destination",
    uiPriorityId: "panda",
    canonicalName: "Denny Sanford Panda Ridge",
    evidence: {
      identity: PANDA_SOURCE,
    },
    plannerMaterialization: "identity-only",
  },
  {
    id: "sdz-tiger-trail",
    kind: "animal-destination",
    uiPriorityId: "tiger",
    canonicalName: "Tiger Trail",
    officialAreaLabel: "Lost Forest",
    evidence: {
      identity: TIGER_SOURCE,
      location: TIGER_SOURCE,
    },
    plannerMaterialization: "identity-only",
  },
  {
    id: "sdz-koala-outback",
    kind: "animal-destination",
    uiPriorityId: "koala",
    canonicalName: "Koala",
    officialAreaLabel: "Outback",
    evidence: {
      identity: KOALA_SOURCE,
      location: KOALA_SOURCE,
    },
    plannerMaterialization: "identity-only",
  },
  {
    id: "sdz-gorilla-tropics",
    kind: "animal-destination",
    uiPriorityId: "gorilla",
    canonicalName: "Gorilla Tropics® and Scripps Aviary",
    officialAreaLabel: "Lost Forest",
    evidence: {
      identity: GORILLA_SOURCE,
      location: GORILLA_SOURCE,
    },
    plannerMaterialization: "identity-only",
  },
  {
    id: "sdz-wildlife-wonders",
    kind: "presentation",
    uiPriorityId: "wildlife-wonders",
    canonicalName: "Wildlife Wonders",
    venue: "Wegeforth Bowl",
    recurrence: "daily",
    startTime: "14:00",
    durationMinutesRange: [15, 20],
    recommendedArrivalMinutes: 10,
    evidence: {
      identity: PRESENTATIONS_SOURCE,
      location: PRESENTATIONS_SOURCE,
      schedule: PRESENTATIONS_SOURCE,
    },
    plannerMaterialization: "identity-and-schedule-partial",
  },
  {
    id: "sdz-rady-ambassador-presentation",
    kind: "presentation",
    canonicalName: "Rady Ambassador Presentation Area",
    venue: "Rady Ambassador Presentation Area",
    recurrence: "daily",
    startTime: "13:00",
    evidence: {
      identity: PRESENTATIONS_SOURCE,
      location: PRESENTATIONS_SOURCE,
      schedule: PRESENTATIONS_SOURCE,
    },
    plannerMaterialization: "identity-only",
  },
  {
    id: "sdz-skyfari",
    kind: "transport",
    canonicalName: "Skyfari® Aerial Tram",
    recurrence: "daily",
    startTime: "10:00",
    endTimePolicy: "zoo-close",
    evidence: {
      identity: SKYFARI_DETAIL_SOURCE,
      hours: ACTIVITIES_INDEX_SOURCE,
    },
    plannerMaterialization: "identity-and-hours-partial",
  },
];

function assertCatalogIntegrity(
  records: readonly SourceBackedZooRecord[],
) {
  const ids = new Set<string>();
  const animalUiIds = new Set<string>();
  const presentationUiIds = new Set<string>();

  for (const record of records) {
    if (ids.has(record.id)) {
      throw new Error(
        `Duplicate source-backed Zoo record ID: ${record.id}`,
      );
    }
    ids.add(record.id);

    if (record.kind === "animal-destination") {
      if (animalUiIds.has(record.uiPriorityId)) {
        throw new Error(
          `Duplicate animal source binding for UI priority ID: ${record.uiPriorityId}`,
        );
      }
      animalUiIds.add(record.uiPriorityId);
    }

    if (
      record.kind === "presentation" &&
      record.uiPriorityId !== undefined
    ) {
      if (presentationUiIds.has(record.uiPriorityId)) {
        throw new Error(
          `Duplicate presentation source binding for UI priority ID: ${record.uiPriorityId}`,
        );
      }
      presentationUiIds.add(record.uiPriorityId);
    }

    const evidenceEntries = Object.entries(record.evidence);
    for (const [factClass, source] of evidenceEntries) {
      if (
        !source ||
        source.authority !== "official" ||
        !source.id ||
        !source.sourceUrl ||
        !source.sourceLabel ||
        !source.observedAt
      ) {
        throw new Error(
          `Source-backed Zoo record ${record.id} has invalid ${factClass} evidence.`,
        );
      }
    }

    if (
      record.kind === "animal-destination" &&
      record.officialAreaLabel !== undefined &&
      record.evidence.location === undefined
    ) {
      throw new Error(
        `Animal source-backed record ${record.id} has an officialAreaLabel without location evidence.`,
      );
    }

    if (
      record.kind === "presentation" &&
      record.evidence.schedule === undefined
    ) {
      throw new Error(
        `Presentation source-backed record ${record.id} is missing schedule evidence.`,
      );
    }

    if (
      record.kind === "transport" &&
      record.evidence.hours === undefined
    ) {
      throw new Error(
        `Transport source-backed record ${record.id} is missing hours evidence.`,
      );
    }
  }
}

assertCatalogIntegrity(RAW_SOURCE_BACKED_ZOO_RECORDS);

export const SOURCE_BACKED_ZOO_RECORDS:
  readonly SourceBackedZooRecord[] =
  deepFreeze(RAW_SOURCE_BACKED_ZOO_RECORDS);

export function sourceBackedRecordById(id: string) {
  return SOURCE_BACKED_ZOO_RECORDS.find(
    (record) => record.id === id,
  );
}

export function sourceBackedAnimalByUiPriorityId(
  uiPriorityId: string,
) {
  return SOURCE_BACKED_ZOO_RECORDS.find(
    (record): record is SourceBackedAnimalDestination =>
      record.kind === "animal-destination" &&
      record.uiPriorityId === uiPriorityId,
  );
}

export function sourceBackedPresentationByUiPriorityId(
  uiPriorityId: string,
) {
  return SOURCE_BACKED_ZOO_RECORDS.find(
    (record): record is SourceBackedPresentation =>
      record.kind === "presentation" &&
      record.uiPriorityId === uiPriorityId,
  );
}

export function assertSourceBackedZooCatalogIntegrity(
  records: readonly SourceBackedZooRecord[],
) {
  assertCatalogIntegrity(records);
}
