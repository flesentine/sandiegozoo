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
    "capture-exact-versioned-node-record-then-promote-coordinate-and-topology",
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

test("Planner 72 rejects mutation during clone screening", () => {
  const forged = cloneAuthority() as unknown as Record<string, unknown>;
  const original = forged.sourceCandidates;
  Object.defineProperty(forged, "plannerMaterialization", {
    configurable: true,
    enumerable: true,
    get() {
      forged.sourceCandidates = [
        ...(original as unknown[]),
      ];
      Object.defineProperty(forged, "plannerMaterialization", {
        configurable: true,
        enumerable: true,
        value: "historical-source-resolution-only",
      });
      return "historical-source-resolution-only";
    },
  });

  assert.throws(
    () =>
      assertInteriorSelectedFootwayEndpointSourceResolutionIntegrity([
        forged as unknown as InteriorSelectedFootwayEndpointSourceResolutionAuthority,
      ]),
    /authority graph cannot mutate during validation/,
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
