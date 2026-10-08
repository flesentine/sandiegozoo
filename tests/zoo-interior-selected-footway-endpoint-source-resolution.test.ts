import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION,
  assessInteriorSelectedFootwayEndpointSourceResolution,
  assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity,
  type InteriorSelectedFootwayEndpointSourceResolutionAuthority,
} from "../src/data/zooInteriorSelectedFootwayEndpointSourceResolution.ts";

function cloneAuthority(): InteriorSelectedFootwayEndpointSourceResolutionAuthority {
  const source = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION[0];
  return {
    ...source,
    sourceCandidates: source.sourceCandidates.map((candidate) => ({ ...candidate })) as unknown as InteriorSelectedFootwayEndpointSourceResolutionAuthority["sourceCandidates"],
    rejectedEvidenceRules: [...source.rejectedEvidenceRules],
    requiredOutputFields: [...source.requiredOutputFields],
  };
}

test("Planner 72 prioritizes authoritative OSM history", () => {
  const authority = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION[0];
  assert.equal(authority.endpointNodeId, "48920902");
  assert.equal(authority.targetTimestamp, "2026-02-21T20:08:08Z");
  assert.deepEqual(
    authority.sourceCandidates.map((candidate) => candidate.priority),
    [1, 2, 3],
  );
  assert.equal(
    authority.sourceCandidates[0].url,
    "https://api.openstreetmap.org/api/0.6/node/48920902/history",
  );
  assert.equal(
    authority.sourceCandidates[0].acceptance,
    "authoritative-record-required",
  );
});

test("Planner 72 rejects current/viewer/search-only evidence as sufficient", () => {
  const authority = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION[0];
  assert.deepEqual(Array.from(authority.rejectedEvidenceRules), [
    "current-node-coordinate-alone-is-insufficient",
    "viewer-rendered-coordinate-alone-is-insufficient",
    "search-index-snippet-alone-is-insufficient",
  ]);
  assert.deepEqual(Array.from(authority.requiredOutputFields), [
    "sourceVersion",
    "sourceTimestamp",
    "sourceChangeset",
    "sourceVersionUrl",
    "lat",
    "lng",
  ]);
});

test("Planner 72 remains blocked until authoritative history is captured", () => {
  const assessment = assessInteriorSelectedFootwayEndpointSourceResolution();
  assert.equal(assessment.status, "blocked");
  assert.equal(
    assessment.reason,
    "AUTHORITATIVE_ENDPOINT_NODE_HISTORY_NOT_CAPTURED",
  );
  assert.equal(
    assessment.nextAction,
    "capture-latest-visible-versioned-node-record-then-promote-coordinate-only-and-source-topology-separately",
  );
});

test("Planner 72 rejects source priority drift", () => {
  const forged = cloneAuthority() as unknown as {
    sourceCandidates: Array<{ priority: number }>;
  };
  forged.sourceCandidates[0].priority = 2;

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity([
        forged as unknown as InteriorSelectedFootwayEndpointSourceResolutionAuthority,
      ]),
    /source candidate drifted/,
  );
});

test("Planner 72 rejects Proxy-backed nested source candidates", () => {
  const forged = cloneAuthority() as unknown as {
    sourceCandidates: unknown[];
  };
  forged.sourceCandidates[1] = new Proxy(
    forged.sourceCandidates[1] as object,
    {},
  );

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity([
        forged as unknown as InteriorSelectedFootwayEndpointSourceResolutionAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );
});

test("Planner 72 rejects accessor mutation attempts before clone screening", () => {
  const forged = cloneAuthority() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "plannerMaterialization", {
    configurable: true,
    enumerable: true,
    get() {
      return "historical-source-resolution-only";
    },
  });

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity([
        forged as unknown as InteriorSelectedFootwayEndpointSourceResolutionAuthority,
      ]),
    /requires enumerable own data field plannerMaterialization/,
  );
});

test("Planner 72 exports immutable null-prototype records", () => {
  const authority = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION[0];
  const assessment = assessInteriorSelectedFootwayEndpointSourceResolution();
  assert.equal(Object.getPrototypeOf(authority), null);
  assert.equal(Object.getPrototypeOf(assessment), null);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.sourceCandidates), true);
  assert.equal(Object.isFrozen(authority.sourceCandidates[0]), true);
  assert.equal(Object.isFrozen(assessment), true);
});


test("Planner 72 rejects branded exotic nested source candidates", () => {
  const forged = cloneAuthority() as unknown as {
    sourceCandidates: unknown[];
  };
  const template = forged.sourceCandidates[0] as Record<string, unknown>;
  const exotic = new Date(0) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(exotic, Object.prototype);

  for (const key of Reflect.ownKeys(template)) {
    const descriptor = Object.getOwnPropertyDescriptor(template, key);
    if (descriptor) Object.defineProperty(exotic, key, descriptor);
  }

  forged.sourceCandidates[0] = exotic;

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity([
        forged as unknown as InteriorSelectedFootwayEndpointSourceResolutionAuthority,
      ]),
    /source candidate 0 must clone as a plain object/,
  );
});

test("Planner 72 requires latest visible version selection semantics", () => {
  const authority = INTERIOR_SELECTED_FOOTWAY_ENDPOINT_SOURCE_RESOLUTION[0];
  assert.equal(
    authority.acceptedEvidenceRule,
    "latest-visible-node-version-at-or-before-target-timestamp-from-authoritative-osm-history",
  );
});


test("Planner 72 rejects inherited promoted endpoint evidence", () => {
  Object.defineProperty(Object.prototype, "lat", {
    configurable: true,
    enumerable: false,
    value: 32.7,
  });

  try {
    const forged = cloneAuthority();
    assert.throws(
      () =>
        assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity([
          forged,
        ]),
      /cannot prematurely materialize field lat/,
    );
  } finally {
    delete (Object.prototype as { lat?: number }).lat;
  }
});

test("Planner 72 rejects inherited historical topology evidence", () => {
  Object.defineProperty(Object.prototype, "connectedWays", {
    configurable: true,
    enumerable: false,
    value: [],
  });

  try {
    const forged = cloneAuthority();
    assert.throws(
      () =>
        assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity([
          forged,
        ]),
      /cannot prematurely materialize field connectedWays/,
    );
  } finally {
    delete (Object.prototype as { connectedWays?: unknown }).connectedWays;
  }
});


test("Planner 72 rejects inherited capture-status evidence", () => {
  Object.defineProperty(Object.prototype, "farEndpointTopologyStatus", {
    configurable: true,
    enumerable: false,
    value: "captured",
  });

  try {
    const forged = cloneAuthority();
    assert.throws(
      () =>
        assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity([
          forged,
        ]),
      /cannot prematurely materialize field farEndpointTopologyStatus/,
    );
  } finally {
    delete (Object.prototype as { farEndpointTopologyStatus?: unknown })
      .farEndpointTopologyStatus;
  }
});

test("Planner 72 screens nested source candidates for inherited promoted evidence", () => {
  Object.defineProperty(Object.prototype, "lat", {
    configurable: true,
    enumerable: false,
    value: 32.7,
  });

  try {
    const forged = cloneAuthority() as unknown as {
      sourceCandidates: Array<Record<string, unknown>>;
    };
    Object.setPrototypeOf(forged, null);
    assert.throws(
      () =>
        assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity([
          forged as unknown as InteriorSelectedFootwayEndpointSourceResolutionAuthority,
        ]),
      /source candidate 0 cannot prematurely materialize field lat/,
    );
  } finally {
    delete (Object.prototype as { lat?: number }).lat;
  }
});
