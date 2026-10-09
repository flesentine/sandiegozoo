import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR,
  assertSelectedEndpointCoordinatePromotable,
  selectLatestVisibleEndpointVersion,
  type SelectedFootwayEndpointHistoricalNodeVersion,
} from "../src/data/zooInteriorSelectedFootwayEndpointCoordinateSelector.ts";

function nodeVersion(
  version: number,
  timestamp: string,
  visible: boolean,
  lat?: number,
  lng?: number,
): SelectedFootwayEndpointHistoricalNodeVersion {
  const base = {
    sourceObjectId: "48920902" as const,
    sourceVersion: version,
    sourceTimestamp: timestamp,
    sourceChangeset: 100000 + version,
    sourceVersionUrl:
      "https://api.openstreetmap.org/api/0.6/node/48920902/" + version,
    visible,
  };

  return visible
    ? { ...base, lat: lat ?? 32.7, lng: lng ?? -117.1 }
    : base;
}

test("Planner 73 binds to the endpoint and frozen timestamp", () => {
  assert.equal(
    INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR.endpointNodeId,
    "48920902",
  );
  assert.equal(
    INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR.targetTimestamp,
    "2026-02-21T20:08:08Z",
  );
  assert.equal(
    INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR.capturedHistoryStatus,
    "not-captured",
  );
});

test("Planner 73 selects the latest visible version at or before target", () => {
  const selected = selectLatestVisibleEndpointVersion([
    nodeVersion(1, "2025-01-01T00:00:00Z", true, 32.71, -117.11),
    nodeVersion(2, "2026-02-21T20:08:07Z", true, 32.72, -117.12),
    nodeVersion(3, "2026-02-21T20:08:09Z", true, 32.73, -117.13),
  ]);

  assert.equal(selected?.sourceVersion, 2);
  assert.equal(selected?.lat, 32.72);
  assert.equal(selected?.lng, -117.12);
});

test("Planner 73 skips deleted versions", () => {
  const selected = selectLatestVisibleEndpointVersion([
    nodeVersion(1, "2026-02-21T19:00:00Z", true, 32.71, -117.11),
    nodeVersion(2, "2026-02-21T20:00:00Z", false),
  ]);

  assert.equal(selected?.sourceVersion, 1);
});

test("Planner 73 returns null when no visible version existed by target", () => {
  const selected = selectLatestVisibleEndpointVersion([
    nodeVersion(1, "2026-02-21T20:08:09Z", true),
    nodeVersion(2, "2026-02-22T00:00:00Z", true),
  ]);

  assert.equal(selected, null);
});

test("Planner 73 promotion requires finite coordinates", () => {
  const selected = selectLatestVisibleEndpointVersion([
    nodeVersion(1, "2026-02-21T20:00:00Z", true, 32.7, -117.1),
  ]);

  assert.doesNotThrow(() => assertSelectedEndpointCoordinatePromotable(selected));
});

test("Planner 73 rejects a mismatched version URL", () => {
  const candidate = nodeVersion(2, "2026-02-21T20:00:00Z", true);
  candidate.sourceVersionUrl =
    "https://api.openstreetmap.org/api/0.6/node/48920902/1";

  assert.throws(
    () => selectLatestVisibleEndpointVersion([candidate]),
    /sourceVersionUrl does not match its version/,
  );
});

test("Planner 73 rejects a deleted version that exposes inherited coordinates", () => {
  Object.defineProperty(Object.prototype, "lat", {
    configurable: true,
    value: 32.7,
  });

  try {
    const candidate = nodeVersion(1, "2026-02-21T20:00:00Z", false);
    assert.throws(
      () => selectLatestVisibleEndpointVersion([candidate]),
      /deleted version cannot expose coordinates/,
    );
  } finally {
    delete (Object.prototype as { lat?: number }).lat;
  }
});

test("Planner 73 rejects branded exotic candidate records", () => {
  const template = nodeVersion(1, "2026-02-21T20:00:00Z", true);
  const exotic = new Date(0) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(exotic, Object.prototype);

  for (const key of Reflect.ownKeys(template)) {
    const descriptor = Object.getOwnPropertyDescriptor(template, key);
    if (descriptor) Object.defineProperty(exotic, key, descriptor);
  }

  assert.throws(
    () =>
      selectLatestVisibleEndpointVersion([
        exotic as unknown as SelectedFootwayEndpointHistoricalNodeVersion,
      ]),
    /must clone as a plain object/,
  );
});


test("Planner 73 rejects duplicate source versions", () => {
  assert.throws(
    () =>
      selectLatestVisibleEndpointVersion([
        nodeVersion(1, "2026-02-21T19:00:00Z", true),
        nodeVersion(1, "2026-02-21T20:00:00Z", true),
      ]),
    /duplicate sourceVersion 1/,
  );
});

test("Planner 73 rejects non-UTC timestamp formats", () => {
  const candidate = nodeVersion(1, "2026-02-21T20:00:00Z", true);
  candidate.sourceTimestamp = "2026-02-21 20:00:00";

  assert.throws(
    () => selectLatestVisibleEndpointVersion([candidate]),
    /requires a UTC ISO timestamp/,
  );
});

test("Planner 73 rejects unknown candidate fields", () => {
  const candidate = nodeVersion(1, "2026-02-21T20:00:00Z", true) as
    SelectedFootwayEndpointHistoricalNodeVersion & { connectedWays?: unknown[] };
  candidate.connectedWays = [];

  assert.throws(
    () => selectLatestVisibleEndpointVersion([candidate]),
    /cannot contain unknown field connectedWays/,
  );
});
