import assert from "node:assert/strict";
import test from "node:test";
import {
  ANIMAL_OPTIONS,
  getExperienceSchedule,
} from "../src/data/priorityOptions.ts";
import {
  auditPriorityFixturesAgainstOfficialSources,
  sourceBackedPresentationUiIds,
} from "../src/data/prioritySourceAudit.ts";
import {
  SOURCE_BACKED_ZOO_RECORDS,
  sourceBackedAnimalByUiPriorityId,
  sourceBackedPresentationByUiPriorityId,
  sourceBackedRecordById,
} from "../src/data/zooSourceCatalog.ts";

test("source-backed Zoo record IDs and official URLs are stable and unique", () => {
  const ids = SOURCE_BACKED_ZOO_RECORDS.map(
    (record) => record.id,
  );

  assert.equal(new Set(ids).size, ids.length);

  for (const record of SOURCE_BACKED_ZOO_RECORDS) {
    assert.equal(record.source.confidence, "verified");
    assert.equal(
      record.source.lastVerified,
      "2026-09-07T21:53:00-07:00",
    );

    const url = new URL(record.source.sourceUrl);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "zoo.sandiegozoo.org");
  }
});

test("all current animal priority IDs have explicit official-source identities", () => {
  const mapped = ANIMAL_OPTIONS.map((animal) => {
    const record =
      sourceBackedAnimalByUiPriorityId(animal.id);

    assert.ok(
      record,
      `missing source-backed identity for ${animal.id}`,
    );

    return [
      animal.id,
      record?.id,
      record?.plannerMaterialization,
    ];
  });

  assert.deepEqual(mapped, [
    ["panda", "sdz-panda-ridge", "identity-only"],
    ["tiger", "sdz-tiger-trail", "identity-only"],
    ["koala", "sdz-koala-outback", "identity-only"],
    ["gorilla", "sdz-gorilla-tropics", "identity-only"],
  ]);
});

test("Wildlife Wonders official source facts remain partial rather than inventing exact duration", () => {
  const record = sourceBackedRecordById(
    "sdz-wildlife-wonders",
  );

  assert.ok(record);
  assert.equal(record?.kind, "presentation");
  if (!record || record.kind !== "presentation") {
    throw new Error("expected presentation");
  }

  assert.equal(record.canonicalName, "Wildlife Wonders");
  assert.equal(record.venue, "Wegeforth Bowl");
  assert.equal(record.recurrence, "daily");
  assert.equal(record.startTime, "14:00");
  assert.deepEqual(record.durationMinutesRange, [15, 20]);
  assert.equal(record.recommendedArrivalMinutes, 10);
  assert.equal(
    record.plannerMaterialization,
    "identity-and-schedule-partial",
  );

  assert.equal("durationMinutes" in record, false);
  assert.equal("endTime" in record, false);
});

test("the current 1 p.m. official presentation is not silently bound to the stale wildlife-ambassadors UI ID", () => {
  assert.equal(
    sourceBackedPresentationByUiPriorityId(
      "wildlife-ambassadors",
    ),
    undefined,
  );

  const current = sourceBackedRecordById(
    "sdz-rady-ambassador-presentation",
  );
  assert.ok(current);
  assert.equal(current?.kind, "presentation");
  if (!current || current.kind !== "presentation") {
    throw new Error("expected presentation");
  }

  assert.equal(
    current.canonicalName,
    "Rady Ambassador Presentation Area",
  );
  assert.equal(current.startTime, "13:00");
  assert.equal(current.uiPriorityId, undefined);
});

test("source-backed presentation UI bindings contain only explicitly resolved identities", () => {
  assert.deepEqual(sourceBackedPresentationUiIds(), [
    "wildlife-wonders",
  ]);
});

test("official-source audit exposes current UX fixture drift deterministically", () => {
  const schedule = getExperienceSchedule("2026-09-19");
  assert.deepEqual(
    schedule.options.map((item) => [
      item.id,
      item.time,
      item.location,
    ]),
    [
      [
        "wildlife-wonders",
        "2:00 PM",
        "Discovery Theater",
      ],
      [
        "wildlife-ambassadors",
        "1:00 PM",
        "Wildlife Explorers Basecamp",
      ],
    ],
  );

  const issues =
    auditPriorityFixturesAgainstOfficialSources(
      "2026-09-19",
    );

  assert.deepEqual(
    issues.map((issue) => [
      issue.code,
      issue.uiPriorityId,
      issue.sourceRecordId,
    ]),
    [
      [
        "ANIMAL_LOCATION_LABEL_DIFFERS",
        "gorilla",
        "sdz-gorilla-tropics",
      ],
      [
        "ANIMAL_LOCATION_LABEL_DIFFERS",
        "koala",
        "sdz-koala-outback",
      ],
      [
        "ANIMAL_LOCATION_LABEL_DIFFERS",
        "tiger",
        "sdz-tiger-trail",
      ],
      [
        "EXPERIENCE_SOURCE_IDENTITY_MISSING",
        "wildlife-ambassadors",
        undefined,
      ],
      [
        "EXPERIENCE_VENUE_DIFFERS",
        "wildlife-wonders",
        "sdz-wildlife-wonders",
      ],
      [
        "SOURCE_PRESENTATION_HAS_NO_UI_BINDING",
        undefined,
        "sdz-rady-ambassador-presentation",
      ],
    ],
  );
});

test("source-backed records do not pretend to contain planner geometry", () => {
  for (const record of SOURCE_BACKED_ZOO_RECORDS) {
    assert.equal("lat" in record, false);
    assert.equal("lng" in record, false);
    assert.equal("routeNodeId" in record, false);
    assert.equal("distanceMeters" in record, false);
    assert.equal("durationMinutes" in record, false);
  }
});

test("source lookup helpers are read-only and deterministic", () => {
  const first = sourceBackedRecordById("sdz-skyfari");
  const second = sourceBackedRecordById("sdz-skyfari");

  assert.deepEqual(second, first);
  assert.equal(first?.kind, "transport");
  if (!first || first.kind !== "transport") {
    throw new Error("expected transport");
  }

  assert.equal(first.startTime, "10:00");
  assert.equal(first.endTimePolicy, "zoo-close");
});
