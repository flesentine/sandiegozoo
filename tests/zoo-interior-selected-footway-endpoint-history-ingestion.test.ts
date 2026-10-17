import assert from "node:assert/strict";
import test from "node:test";
import {
  ingestSelectedFootwayEndpointHistoryXml,
  parseSelectedFootwayEndpointHistoryXml,
} from "../src/data/zooInteriorSelectedFootwayEndpointHistoryIngestion.ts";

const history = `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6" generator="OpenStreetMap server">
  <node id="48920902" lat="32.7000000" lon="-117.1000000" version="1" changeset="100" timestamp="2025-01-01T00:00:00Z"/>
  <node id="48920902" lat="32.7100000" lon="-117.1100000" version="2" changeset="101" timestamp="2026-02-21T20:08:07Z"/>
  <node id="48920902" lat="32.7200000" lon="-117.1200000" version="3" changeset="102" timestamp="2026-02-21T20:08:09Z"/>
</osm>`;

test("Planner 74 parses authoritative OSM node-history XML into Planner 73 candidates", () => {
  const candidates = parseSelectedFootwayEndpointHistoryXml(history);
  assert.equal(candidates.length, 3);
  assert.deepEqual(candidates[1], {
    sourceObjectId: "48920902",
    sourceVersion: 2,
    sourceTimestamp: "2026-02-21T20:08:07Z",
    sourceChangeset: 101,
    sourceVersionUrl:
      "https://api.openstreetmap.org/api/0.6/node/48920902/2",
    visible: true,
    lat: 32.71,
    lng: -117.11,
  });
});

test("Planner 74 feeds parsed history through Planner 73 latest-visible selection", () => {
  const result = ingestSelectedFootwayEndpointHistoryXml(history);
  assert.equal(result.sourceObjectId, "48920902");
  assert.equal(result.targetTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(result.candidateCount, 3);
  assert.equal(result.selected?.sourceVersion, 2);
  assert.equal(result.selected?.lat, 32.71);
  assert.equal(result.selected?.lng, -117.11);
});

test("Planner 74 supports deleted historical versions without coordinates", () => {
  const xml = `<osm version="0.6">
    <node id="48920902" lat="32.7" lon="-117.1" version="1" changeset="100" timestamp="2026-02-21T20:00:00Z"/>
    <node id="48920902" version="2" changeset="101" timestamp="2026-02-21T20:05:00Z" visible="false"/>
  </osm>`;
  const parsed = parseSelectedFootwayEndpointHistoryXml(xml);
  assert.equal(parsed[1].visible, false);
  assert.equal("lat" in parsed[1], false);
  assert.equal("lng" in parsed[1], false);
});

test("Planner 74 rejects wrong endpoint IDs", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><node id="1" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z"/></osm>`,
      ),
    /must target node 48920902/,
  );
});

test("Planner 74 rejects duplicate versions", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm>
          <node id="48920902" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z"/>
          <node id="48920902" lat="2" lon="2" version="1" changeset="2" timestamp="2026-01-02T00:00:00Z"/>
        </osm>`,
      ),
    /duplicate version 1/,
  );
});

test("Planner 74 rejects visible versions with missing coordinates", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><node id="48920902" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z"/></osm>`,
      ),
    /visible version requires lat/,
  );
});

test("Planner 74 rejects deleted versions that expose coordinates", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><node id="48920902" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z" visible="false"/></osm>`,
      ),
    /deleted version cannot expose coordinates/,
  );
});

test("Planner 74 rejects impossible timestamps and unsafe provenance IDs", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><node id="48920902" lat="1" lon="1" version="1" changeset="1" timestamp="2026-02-30T00:00:00Z"/></osm>`,
      ),
    /real UTC calendar timestamp/,
  );

  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><node id="48920902" lat="1" lon="1" version="9007199254740992" changeset="1" timestamp="2026-01-01T00:00:00Z"/></osm>`,
      ),
    /safely representable version/,
  );
});

test("Planner 74 rejects malformed visibility and empty history", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><node id="48920902" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z" visible="yes"/></osm>`,
      ),
    /requires boolean visible/,
  );
  assert.throws(
    () => parseSelectedFootwayEndpointHistoryXml("<osm></osm>"),
    /contains no endpoint node versions/,
  );
});

test("Planner 74 decodes XML entities but still validates exact endpoint identity", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><node id="4892090&#50;" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z"/></osm>`,
      ),
    /must target node 48920902/,
  );
});


test("Planner 74 returns null when a deletion is active at the target time", () => {
  const xml = `<osm version="0.6">
    <node id="48920902" lat="32.7" lon="-117.1" version="1" changeset="100" timestamp="2026-02-21T20:00:00Z"/>
    <node id="48920902" version="2" changeset="101" timestamp="2026-02-21T20:05:00Z" visible="false"/>
    <node id="48920902" lat="32.8" lon="-117.2" version="3" changeset="102" timestamp="2026-02-21T20:09:00Z"/>
  </osm>`;
  const result = ingestSelectedFootwayEndpointHistoryXml(xml);
  assert.equal(result.selected, null);
});

test("Planner 74 ignores node-looking text inside XML comments", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><!-- <node id="48920902" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z"/> --></osm>`,
      ),
    /contains no endpoint node versions/,
  );
});

test("Planner 74 rejects truncated XML even after a valid node", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><node id="48920902" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z"/>`,
      ),
    /not a complete well-formed document/,
  );
});

test("Planner 74 requires a contiguous version chain starting at version 1", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm>
          <node id="48920902" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z"/>
          <node id="48920902" lat="2" lon="2" version="3" changeset="3" timestamp="2026-01-03T00:00:00Z"/>
        </osm>`,
      ),
    /contiguous version chain starting at 1/,
  );
});

test("Planner 74 requires timestamps to increase with OSM versions", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm>
          <node id="48920902" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-02T00:00:00Z"/>
          <node id="48920902" lat="2" lon="2" version="2" changeset="2" timestamp="2026-01-01T00:00:00Z"/>
        </osm>`,
      ),
    /timestamps must increase with versions/,
  );
});

test("Planner 74 rejects nested node records instead of treating them as history entries", () => {
  assert.throws(
    () =>
      parseSelectedFootwayEndpointHistoryXml(
        `<osm><way id="1"><node id="48920902" lat="1" lon="1" version="1" changeset="1" timestamp="2026-01-01T00:00:00Z"/></way></osm>`,
      ),
    /node records must be direct children of osm/,
  );
});
