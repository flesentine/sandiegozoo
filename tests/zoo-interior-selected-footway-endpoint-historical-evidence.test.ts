import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_SELECTED_FOOTWAY_ENDPOINT_HISTORICAL_EVIDENCE,
  assessInteriorSelectedFootwayEndpointHistoricalEvidence,
  assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity,
  type InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority,
} from "../src/data/zooInteriorSelectedFootwayEndpointHistoricalEvidence.ts";

function cloneAuthority(): InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority {
  const authority =
    INTERIOR_SELECTED_FOOTWAY_ENDPOINT_HISTORICAL_EVIDENCE[0];
  return {
    ...authority,
    requiredCaptureFields: [...authority.requiredCaptureFields],
  } as InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority;
}

test("Planner 71 binds endpoint evidence to Planner 70", () => {
  const authority =
    INTERIOR_SELECTED_FOOTWAY_ENDPOINT_HISTORICAL_EVIDENCE[0];

  assert.equal(authority.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(authority.targetTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(authority.sourceWayId, "1481578626");
  assert.equal(authority.endpointNodeId, "48920902");
  assert.equal(
    authority.endpointHistoryUrl,
    "https://api.openstreetmap.org/api/0.6/node/48920902/history",
  );
  assert.equal(
    authority.endpointSourceUrl,
    "https://www.openstreetmap.org/node/48920902",
  );
});

test("Planner 71 remains blocked until node version and coordinate are sourced", () => {
  const authority =
    INTERIOR_SELECTED_FOOTWAY_ENDPOINT_HISTORICAL_EVIDENCE[0];
  assert.equal(authority.endpointVersionStatus, "not-captured");
  assert.equal(authority.endpointCoordinateStatus, "not-captured");
  assert.equal(authority.endpointChangesetStatus, "not-captured");
  assert.equal(authority.farEndpointTopologyStatus, "not-captured");
  assert.deepEqual(Array.from(authority.requiredCaptureFields), [
    "sourceVersion",
    "sourceTimestamp",
    "sourceChangeset",
    "sourceVersionUrl",
    "lat",
    "lng",
  ]);

  const assessment =
    assessInteriorSelectedFootwayEndpointHistoricalEvidence();
  assert.equal(assessment.status, "blocked");
  assert.equal(
    assessment.reason,
    "VERSION_PINNED_SELECTED_FOOTWAY_ENDPOINT_NODE_NOT_CAPTURED",
  );
  assert.deepEqual(Array.from(assessment.routeGraphExpansion.reasons), [
    "EXACT_ENDPOINT_NODE_VERSION_NOT_SOURCED",
    "EXACT_ENDPOINT_NODE_COORDINATE_NOT_SOURCED",
    "ENDPOINT_HISTORICAL_CONNECTED_WAYS_NOT_SOURCED",
  ]);
});

test("Planner 71 rejects invented historical node facts", () => {
  const forged = {
    ...cloneAuthority(),
    lat: 32.7,
  } as unknown as InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority;

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity([
        forged,
      ]),
    /unknown field lat|prematurely materialize field lat/,
  );

  const forgedVersion = {
    ...cloneAuthority(),
    sourceVersion: 1,
  } as unknown as InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority;

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity([
        forgedVersion,
      ]),
    /unknown field sourceVersion|prematurely materialize field sourceVersion/,
  );
});

test("Planner 71 rejects required-field sequence drift", () => {
  const forged = cloneAuthority() as unknown as {
    requiredCaptureFields: string[];
  };
  forged.requiredCaptureFields = [
    "lat",
    "lng",
    "sourceVersion",
    "sourceTimestamp",
    "sourceChangeset",
    "sourceVersionUrl",
  ];

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity([
        forged as unknown as InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority,
      ]),
    /required capture fields drifted/,
  );
});

test("Planner 71 rejects Proxy-backed nested capture fields", () => {
  const forged = cloneAuthority() as unknown as {
    requiredCaptureFields: readonly string[];
  };
  forged.requiredCaptureFields = new Proxy(
    [...forged.requiredCaptureFields],
    {},
  );

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity([
        forged as unknown as InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );
});

test("Planner 71 exports null-prototype immutable records", () => {
  Object.defineProperty(Object.prototype, "lat", {
    value: 99,
    configurable: true,
  });

  try {
    const authority =
      INTERIOR_SELECTED_FOOTWAY_ENDPOINT_HISTORICAL_EVIDENCE[0];
    const assessment =
      assessInteriorSelectedFootwayEndpointHistoricalEvidence();

    assert.equal(Object.getPrototypeOf(authority), null);
    assert.equal(Object.getPrototypeOf(assessment), null);
    assert.equal(Object.getPrototypeOf(assessment.routeGraphExpansion), null);
    assert.equal("lat" in authority, false);
    assert.equal(Object.isFrozen(authority), true);
    assert.equal(Object.isFrozen(authority.requiredCaptureFields), true);
    assert.equal(Object.isFrozen(assessment), true);
  } finally {
    delete (Object.prototype as { lat?: number }).lat;
  }
});


test("Planner 71 rejects branded exotic objects disguised as plain records", () => {
  const template = cloneAuthority() as unknown as Record<string, unknown>;
  const exotic = new Date(0) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(exotic, Object.prototype);

  for (const key of Reflect.ownKeys(template)) {
    const descriptor = Object.getOwnPropertyDescriptor(template, key);
    if (descriptor) Object.defineProperty(exotic, key, descriptor);
  }

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity([
        exotic as unknown as InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority,
      ]),
    /must be a plain object/,
  );
});

test("Planner 71 rejects inherited coordinates evidence", () => {
  Object.defineProperty(Object.prototype, "coordinates", {
    configurable: true,
    enumerable: false,
    value: [32.7, -117.1],
  });

  try {
    const forged = cloneAuthority();
    assert.throws(
      () =>
        assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity([
          forged,
        ]),
      /prematurely materialize field coordinates/,
    );
  } finally {
    delete (Object.prototype as { coordinates?: unknown }).coordinates;
  }
});


test("Planner 71 rejects exotic records even when inherited toStringTag is polluted", () => {
  Object.defineProperty(Object.prototype, Symbol.toStringTag, {
    configurable: true,
    value: "Object",
  });

  try {
    const template = cloneAuthority() as unknown as Record<string, unknown>;
    const exotic = new Date(0) as unknown as Record<string, unknown>;
    Object.setPrototypeOf(exotic, Object.prototype);

    for (const key of Reflect.ownKeys(template)) {
      const descriptor = Object.getOwnPropertyDescriptor(template, key);
      if (descriptor) Object.defineProperty(exotic, key, descriptor);
    }

    assert.throws(
      () =>
        assertInteriorSelectedFootwayEndpointHistoricalEvidenceIntegrity([
          exotic as unknown as InteriorSelectedFootwayEndpointHistoricalEvidenceAuthority,
        ]),
      /must clone as a plain object without internal-slot branding/,
    );
  } finally {
    delete (Object.prototype as Record<PropertyKey, unknown>)[Symbol.toStringTag];
  }
});
