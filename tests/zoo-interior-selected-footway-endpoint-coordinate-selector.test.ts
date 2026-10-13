import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR,
  assertSelectedEndpointCoordinatePromotable,
  assertInteriorSelectedFootwayEndpointCoordinateSelectorIntegrity,
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

test("Planner 73 ignores inherited coordinates on deleted versions", () => {
  Object.defineProperty(Object.prototype, "lat", {
    configurable: true,
    value: 32.7,
  });

  try {
    const candidate = nodeVersion(1, "2026-02-21T20:00:00Z", false);
    assert.equal(selectLatestVisibleEndpointVersion([candidate]), null);
  } finally {
    delete (Object.prototype as { lat?: number }).lat;
  }
});

test("Planner 73 sanitizes branded candidate records from descriptors", () => {
  const template = nodeVersion(1, "2026-02-21T20:00:00Z", true);
  const exotic = new Date(0) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(exotic, Object.prototype);

  for (const key of Reflect.ownKeys(template)) {
    const descriptor = Object.getOwnPropertyDescriptor(template, key);
    if (descriptor) Object.defineProperty(exotic, key, descriptor);
  }

  const selected = selectLatestVisibleEndpointVersion([
    exotic as unknown as SelectedFootwayEndpointHistoricalNodeVersion,
  ]);

  assert.deepEqual(selected, template);
  assert.notEqual(selected, exotic);
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


test("Planner 73 rejects accessor-backed candidate array entries", () => {
  const candidates = [
    nodeVersion(1, "2026-02-21T20:00:00Z", true),
  ] as SelectedFootwayEndpointHistoricalNodeVersion[];

  Object.defineProperty(candidates, "0", {
    configurable: true,
    enumerable: true,
    get() {
      return nodeVersion(1, "2026-02-21T20:00:00Z", true);
    },
  });

  assert.throws(
    () => selectLatestVisibleEndpointVersion(candidates),
    /requires enumerable own data element 0/,
  );
});

test("Planner 73 sanitizes prototype-masked candidate backing stores without cloning them", () => {
  const template = nodeVersion(1, "2026-02-21T20:00:00Z", true);
  const exotic = new ArrayBuffer(1024 * 1024) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(exotic, Object.prototype);

  for (const key of Reflect.ownKeys(template)) {
    const descriptor = Object.getOwnPropertyDescriptor(template, key);
    if (descriptor) Object.defineProperty(exotic, key, descriptor);
  }

  const selected = selectLatestVisibleEndpointVersion([
    exotic as unknown as SelectedFootwayEndpointHistoricalNodeVersion,
  ]);

  assert.ok(selected);
  assert.notEqual(selected, exotic);
  assert.equal(Object.getPrototypeOf(selected), Object.prototype);
  assert.deepEqual(selected, template);
});

test("Planner 73 rejects impossible UTC calendar dates", () => {
  const candidate = nodeVersion(1, "2026-02-21T20:00:00Z", true);
  candidate.sourceTimestamp = "2026-02-30T00:00:00Z";

  assert.throws(
    () => selectLatestVisibleEndpointVersion([candidate]),
    /requires a real UTC calendar timestamp/,
  );
});


test("Planner 73 does not use array get traps during selection", () => {
  const backing = [
    nodeVersion(1, "2026-02-21T20:00:00Z", true),
  ];
  let reads = 0;

  const proxied = new Proxy(backing, {
    get(target, property, receiver) {
      reads += 1;
      return Reflect.get(target, property, receiver);
    },
  });

  const selected = selectLatestVisibleEndpointVersion(
    proxied as SelectedFootwayEndpointHistoricalNodeVersion[],
  );

  assert.equal(selected?.sourceVersion, 1);
  assert.equal(reads, 0);
});

test("Planner 73 sanitizes normalized branded authority inputs", () => {
  const authority = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR;
  const exotic = new CompressionStream("gzip") as unknown as Record<string, unknown>;
  Object.setPrototypeOf(exotic, Object.prototype);

  for (const key of Reflect.ownKeys(authority)) {
    const descriptor = Object.getOwnPropertyDescriptor(authority, key);
    if (descriptor) Object.defineProperty(exotic, key, descriptor);
  }

  const safe = assertInteriorSelectedFootwayEndpointCoordinateSelectorIntegrity(
    exotic as unknown as typeof authority,
  );

  assert.notEqual(safe, exotic);
  assert.equal(Object.getPrototypeOf(safe), null);
  assert.deepEqual(safe, authority);
});


test("Planner 73 rejects accessor-backed candidate evidence fields before array cloning", () => {
  const candidate = nodeVersion(1, "2026-02-21T20:00:00Z", true);
  let reads = 0;

  Object.defineProperty(candidate, "sourceVersion", {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      return 1;
    },
  });

  assert.throws(
    () => selectLatestVisibleEndpointVersion([candidate]),
    /candidate 0 requires enumerable own data field sourceVersion/,
  );
  assert.equal(reads, 0);
});


test("Planner 73 rejects deleted coordinate accessors before cloning", () => {
  const candidate = nodeVersion(1, "2026-02-21T20:00:00Z", false) as
    SelectedFootwayEndpointHistoricalNodeVersion & { lat?: number };
  let reads = 0;

  Object.defineProperty(candidate, "lat", {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      return 32.7;
    },
  });

  assert.throws(
    () => selectLatestVisibleEndpointVersion([candidate]),
    /candidate 0 lat must be an enumerable own data field/,
  );
  assert.equal(reads, 0);
});


test("Planner 73 rejects huge sparse candidate arrays without materializing indexes", () => {
  const sparse = [] as SelectedFootwayEndpointHistoricalNodeVersion[];
  sparse.length = 2 ** 32 - 1;

  assert.throws(
    () => selectLatestVisibleEndpointVersion(sparse),
    /must be dense and reasonably bounded/,
  );
});


test("Planner 73 rejects oversized dense arrays before key enumeration matters", () => {
  const oversized = new Array(10001).fill(null).map((_, index) =>
    nodeVersion(index + 1, "2026-02-21T20:00:00Z", true),
  );

  assert.throws(
    () => selectLatestVisibleEndpointVersion(oversized),
    /must be dense and reasonably bounded/,
  );
});


test("Planner 73 rejects oversized object payloads before container cloning", () => {
  const candidate = nodeVersion(1, "2026-02-21T20:00:00Z", true) as
    unknown as Record<string, unknown>;
  candidate.sourceTimestamp = new ArrayBuffer(1024 * 1024);

  assert.throws(
    () =>
      selectLatestVisibleEndpointVersion([
        candidate as unknown as SelectedFootwayEndpointHistoricalNodeVersion,
      ]),
    /requires a UTC ISO timestamp/,
  );
});

test("Planner 73 requires safe integer version and changeset IDs", () => {
  const unsafeVersion = nodeVersion(1, "2026-02-21T20:00:00Z", true);
  unsafeVersion.sourceVersion = Number.MAX_SAFE_INTEGER + 1;
  unsafeVersion.sourceVersionUrl =
    "https://api.openstreetmap.org/api/0.6/node/48920902/" +
    unsafeVersion.sourceVersion;

  assert.throws(
    () => selectLatestVisibleEndpointVersion([unsafeVersion]),
    /positive safe integer sourceVersion/,
  );

  const unsafeChangeset = nodeVersion(1, "2026-02-21T20:00:00Z", true);
  unsafeChangeset.sourceChangeset = Number.MAX_SAFE_INTEGER + 1;

  assert.throws(
    () => selectLatestVisibleEndpointVersion([unsafeChangeset]),
    /positive safe integer sourceChangeset/,
  );
});


test("Planner 73 rejects coordinate payload objects before cloning", () => {
  const candidate = nodeVersion(1, "2026-02-21T20:00:00Z", true) as
    unknown as Record<string, unknown>;
  candidate.lat = new ArrayBuffer(1024 * 1024);

  assert.throws(
    () =>
      selectLatestVisibleEndpointVersion([
        candidate as unknown as SelectedFootwayEndpointHistoricalNodeVersion,
      ]),
    /lat must be a finite coordinate in range/,
  );

  const deleted = nodeVersion(1, "2026-02-21T20:00:00Z", false) as
    unknown as Record<string, unknown>;
  deleted.lng = new ArrayBuffer(1024 * 1024);

  assert.throws(
    () =>
      selectLatestVisibleEndpointVersion([
        deleted as unknown as SelectedFootwayEndpointHistoricalNodeVersion,
      ]),
    /deleted version cannot expose coordinates/,
  );
});

test("Planner 73 preflights authority values before cloning", () => {
  const authority = {
    ...INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR,
    id: new ArrayBuffer(1024 * 1024),
  } as unknown as typeof INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR;

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointCoordinateSelectorIntegrity(authority),
    /authority drifted at id/,
  );
});


test("Planner 73 never reads visible through a candidate get trap", () => {
  const target = nodeVersion(1, "2026-02-21T20:00:00Z", true);
  let reads = 0;
  const proxied = new Proxy(target, {
    get(object, property, receiver) {
      if (property === "visible") reads += 1;
      return Reflect.get(object, property, receiver);
    },
  });

  assert.doesNotThrow(() =>
    selectLatestVisibleEndpointVersion([
      proxied as SelectedFootwayEndpointHistoricalNodeVersion,
    ]),
  );
  assert.equal(reads, 0);
});

test("Planner 73 sanitizes prototype-masked authority backing stores without cloning them", () => {
  const source = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_COORDINATE_SELECTOR;
  const exotic = new ArrayBuffer(1024 * 1024) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(exotic, Object.prototype);

  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor) Object.defineProperty(exotic, key, descriptor);
  }

  const safe = assertInteriorSelectedFootwayEndpointCoordinateSelectorIntegrity(
    exotic as unknown as typeof source,
  );

  assert.notEqual(safe, exotic);
  assert.equal(Object.getPrototypeOf(safe), null);
  assert.deepEqual(safe, source);
});
