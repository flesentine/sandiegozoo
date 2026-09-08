export type OfficialZooSource = {
  sourceUrl: string;
  sourceLabel: string;
  lastVerified: string;
  confidence: "verified";
};

export type SourceBackedAnimalDestination = {
  id: string;
  kind: "animal-destination";
  uiPriorityId: string;
  canonicalName: string;
  officialLocationLabel?: string;
  source: OfficialZooSource;
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
  source: OfficialZooSource;
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
  source: OfficialZooSource;
  plannerMaterialization: "identity-and-hours-partial";
};

export type SourceBackedZooRecord =
  | SourceBackedAnimalDestination
  | SourceBackedPresentation
  | SourceBackedTransport;

const VERIFIED_AT = "2026-09-07T21:53:00-07:00";

export const SOURCE_BACKED_ZOO_RECORDS: readonly SourceBackedZooRecord[] = [
  {
    id: "sdz-panda-ridge",
    kind: "animal-destination",
    uiPriorityId: "panda",
    canonicalName: "Denny Sanford Panda Ridge",
    source: {
      sourceUrl: "https://zoo.sandiegozoo.org/giant-pandas",
      sourceLabel: "San Diego Zoo — Giant Pandas",
      lastVerified: VERIFIED_AT,
      confidence: "verified",
    },
    plannerMaterialization: "identity-only",
  },
  {
    id: "sdz-tiger-trail",
    kind: "animal-destination",
    uiPriorityId: "tiger",
    canonicalName: "Tiger Trail",
    officialLocationLabel: "Lost Forest",
    source: {
      sourceUrl: "https://zoo.sandiegozoo.org/animals/tiger-trail",
      sourceLabel: "San Diego Zoo — Tiger Trail",
      lastVerified: VERIFIED_AT,
      confidence: "verified",
    },
    plannerMaterialization: "identity-only",
  },
  {
    id: "sdz-koala-outback",
    kind: "animal-destination",
    uiPriorityId: "koala",
    canonicalName: "Koala",
    officialLocationLabel: "Outback",
    source: {
      sourceUrl: "https://zoo.sandiegozoo.org/animals/koala",
      sourceLabel: "San Diego Zoo — Koala",
      lastVerified: VERIFIED_AT,
      confidence: "verified",
    },
    plannerMaterialization: "identity-only",
  },
  {
    id: "sdz-gorilla-tropics",
    kind: "animal-destination",
    uiPriorityId: "gorilla",
    canonicalName: "Gorilla Tropics® and Scripps Aviary",
    officialLocationLabel: "Lost Forest",
    source: {
      sourceUrl:
        "https://zoo.sandiegozoo.org/animals/gorilla-tropicsr-and-scripps-aviary",
      sourceLabel: "San Diego Zoo — Gorilla Tropics and Scripps Aviary",
      lastVerified: VERIFIED_AT,
      confidence: "verified",
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
    source: {
      sourceUrl:
        "https://zoo.sandiegozoo.org/activities/wildlife-presentations",
      sourceLabel: "San Diego Zoo — Wildlife Presentations",
      lastVerified: VERIFIED_AT,
      confidence: "verified",
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
    source: {
      sourceUrl:
        "https://zoo.sandiegozoo.org/activities/wildlife-presentations",
      sourceLabel: "San Diego Zoo — Wildlife Presentations",
      lastVerified: VERIFIED_AT,
      confidence: "verified",
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
    source: {
      sourceUrl:
        "https://zoo.sandiegozoo.org/activities/skyfarir-aerial-tram",
      sourceLabel: "San Diego Zoo — Skyfari Aerial Tram",
      lastVerified: VERIFIED_AT,
      confidence: "verified",
    },
    plannerMaterialization: "identity-and-hours-partial",
  },
] as const;

export function sourceBackedRecordById(id: string) {
  return SOURCE_BACKED_ZOO_RECORDS.find((record) => record.id === id);
}

export function sourceBackedAnimalByUiPriorityId(uiPriorityId: string) {
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
