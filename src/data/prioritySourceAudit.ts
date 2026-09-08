import {
  ANIMAL_OPTIONS,
  getExperienceSchedule,
} from "./priorityOptions.ts";
import {
  SOURCE_BACKED_ZOO_RECORDS,
  sourceBackedAnimalByUiPriorityId,
  sourceBackedPresentationByUiPriorityId,
} from "./zooSourceCatalog.ts";

export type PrioritySourceAuditCode =
  | "ANIMAL_SOURCE_IDENTITY_MISSING"
  | "ANIMAL_DISPLAY_NAME_DIFFERS"
  | "ANIMAL_LOCATION_LABEL_DIFFERS"
  | "EXPERIENCE_SOURCE_IDENTITY_MISSING"
  | "EXPERIENCE_VENUE_DIFFERS"
  | "EXPERIENCE_TIME_DIFFERS"
  | "SOURCE_PRESENTATION_HAS_NO_UI_BINDING";

export type PrioritySourceAuditIssue = {
  code: PrioritySourceAuditCode;
  uiPriorityId?: string;
  sourceRecordId?: string;
  message: string;
};

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function normalizeClock(value: string) {
  const match = value
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);

  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = match[3].toUpperCase();

  if (
    hour < 1 ||
    hour > 12 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  if (suffix === "AM") {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function auditPriorityFixturesAgainstOfficialSources(
  visitDate: string,
) {
  const issues: PrioritySourceAuditIssue[] = [];

  for (const animal of ANIMAL_OPTIONS) {
    const source = sourceBackedAnimalByUiPriorityId(animal.id);

    if (!source) {
      issues.push({
        code: "ANIMAL_SOURCE_IDENTITY_MISSING",
        uiPriorityId: animal.id,
        message: `No official source-backed identity is registered for animal priority ${animal.id}.`,
      });
      continue;
    }

    const sourceName = source.canonicalName
      .replace(/®/g, "")
      .toLowerCase();
    const uiName = animal.name
      .replace(/s$/i, "")
      .toLowerCase();

    if (!sourceName.includes(uiName)) {
      issues.push({
        code: "ANIMAL_DISPLAY_NAME_DIFFERS",
        uiPriorityId: animal.id,
        sourceRecordId: source.id,
        message: `UI animal label "${animal.name}" differs from official source identity "${source.canonicalName}".`,
      });
    }

    if (
      source.officialLocationLabel &&
      animal.zone !== source.officialLocationLabel
    ) {
      issues.push({
        code: "ANIMAL_LOCATION_LABEL_DIFFERS",
        uiPriorityId: animal.id,
        sourceRecordId: source.id,
        message: `UI location "${animal.zone}" differs from official location label "${source.officialLocationLabel}".`,
      });
    }
  }

  const schedule = getExperienceSchedule(visitDate);

  for (const experience of schedule.options) {
    const source =
      sourceBackedPresentationByUiPriorityId(experience.id);

    if (!source) {
      issues.push({
        code: "EXPERIENCE_SOURCE_IDENTITY_MISSING",
        uiPriorityId: experience.id,
        message: `No current official presentation identity is bound to UI experience ${experience.id}.`,
      });
      continue;
    }

    if (experience.location !== source.venue) {
      issues.push({
        code: "EXPERIENCE_VENUE_DIFFERS",
        uiPriorityId: experience.id,
        sourceRecordId: source.id,
        message: `UI venue "${experience.location}" differs from current official venue "${source.venue}".`,
      });
    }

    const uiTime = normalizeClock(experience.time);
    if (uiTime !== source.startTime) {
      issues.push({
        code: "EXPERIENCE_TIME_DIFFERS",
        uiPriorityId: experience.id,
        sourceRecordId: source.id,
        message: `UI time "${experience.time}" differs from current official start time "${source.startTime}".`,
      });
    }
  }

  for (const record of SOURCE_BACKED_ZOO_RECORDS) {
    if (
      record.kind === "presentation" &&
      record.uiPriorityId === undefined
    ) {
      issues.push({
        code: "SOURCE_PRESENTATION_HAS_NO_UI_BINDING",
        sourceRecordId: record.id,
        message: `Official presentation ${record.canonicalName} has no current UI priority binding.`,
      });
    }
  }

  return issues.sort((a, b) => {
    const code = compareText(a.code, b.code);
    if (code !== 0) return code;

    const ui = compareText(
      a.uiPriorityId ?? "",
      b.uiPriorityId ?? "",
    );
    if (ui !== 0) return ui;

    return compareText(
      a.sourceRecordId ?? "",
      b.sourceRecordId ?? "",
    );
  });
}

export function sourceBackedPresentationUiIds() {
  return [...new Set(
    SOURCE_BACKED_ZOO_RECORDS.flatMap((record) =>
      record.kind === "presentation" && record.uiPriorityId
        ? [record.uiPriorityId]
        : [],
    ),
  )].sort(compareText);
}
