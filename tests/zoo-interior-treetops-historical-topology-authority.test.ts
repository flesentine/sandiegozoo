import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
  assessInteriorTreetopsHistoricalTopology,
} from "../src/data/zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import { INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY } from "../src/data/zooInteriorTreetopsV7GeometryAuthority.ts";

test("Planner 44 selects the first linear walkable historical junction after the anchor", () => {
  const authority = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  assert.equal(authority.anchorNodeId, "1619736626");
  assert.equal(authority.nextJunctionNodeId, "13588159626");
  assert.equal(authority.nextJunctionTreetopsIndex, 6);
  assert.equal(authority.selectedJunctionConnection.sourceWayId, "1481578621");
  assert.equal(authority.selectedJunctionConnection.sourceWayVersion, 1);
  assert.equal(authority.selectedJunctionConnection.sourceHighway, "footway");
  assert.equal(authority.selectedJunctionConnection.sourceName, "Fern Canyon Trail");
});

test("Planner 44 explicitly excludes the earlier pedestrian-area connection", () => {
  const authority = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  assert.equal(authority.interveningConnections.length, 1);
  const earlier = authority.interveningConnections[0];
  assert.equal(earlier.sharedNodeId, "10303552086");
  assert.equal(earlier.treetopsIndex, 3);
  assert.equal(earlier.sourceWayId, "1126804582");
  assert.equal(earlier.sourceWayVersion, 3);
  assert.equal(earlier.sourceHighway, "pedestrian");
  assert.equal(earlier.sourceArea, "yes");
  assert.equal(earlier.classification, "excluded-pedestrian-area-not-linear-branch");
  assert.ok(earlier.orderedNodeIds.includes("10303552086"));
});

test("Planner 44 freezes exact selected connected-way provenance", () => {
  const selected = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0].selectedJunctionConnection;
  assert.deepEqual({
    sourceWayId: selected.sourceWayId,
    sourceWayVersion: selected.sourceWayVersion,
    sourceWayTimestamp: selected.sourceWayTimestamp,
    sourceWayChangeset: selected.sourceWayChangeset,
    sourceWayVersionUrl: selected.sourceWayVersionUrl,
    orderedNodeIds: selected.orderedNodeIds,
  }, {
    sourceWayId: "1481578621",
    sourceWayVersion: 1,
    sourceWayTimestamp: "2026-02-21T20:08:08Z",
    sourceWayChangeset: 178875075,
    sourceWayVersionUrl: "https://api.openstreetmap.org/api/0.6/way/1481578621/1",
    orderedNodeIds: ["13588159625", "13588159626"],
  });
});

test("Planner 44 freezes the exact Treetops segment from anchor through the selected junction", () => {
  const authority = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  assert.equal(authority.segmentProvenance.sourceWayId, "148910139");
  assert.equal(authority.segmentProvenance.sourceWayVersion, 7);
  assert.equal(authority.segmentProvenance.fromNodeId, "1619736626");
  assert.equal(authority.segmentProvenance.toNodeId, "13588159626");
  assert.equal(authority.segmentProvenance.fromTreetopsIndex, 0);
  assert.equal(authority.segmentProvenance.toTreetopsIndex, 6);
  assert.deepEqual(authority.segmentProvenance.orderedNodeIds, geometry.orderedNodeIds.slice(0, 7));
  assert.deepEqual(authority.segmentProvenance.orderedNodeIds, [
    "1619736626",
    "1619736622",
    "1619736623",
    "10303552086",
    "1619736627",
    "1619736634",
    "13588159626",
  ]);
});

test("Planner 44 clears junction and segment provenance blockers but stops before route semantics", () => {
  assert.deepEqual(assessInteriorTreetopsHistoricalTopology(), {
    status: "junction-and-segment-sourced",
    authorityId: "sdz-interior-treetops-historical-topology",
    objectiveSourceRecordId: "sdz-tiger-trail",
    anchorNodeId: "1619736626",
    nextJunctionNodeId: "13588159626",
    nextJunctionTreetopsIndex: 6,
    connectedWayId: "1481578621",
    nextJunctionSelection: "captured",
    exactSegmentProvenance: "captured",
    routeGraphExpansion: {
      status: "blocked",
      reasons: ["PEDESTRIAN_MODE_NOT_QUALIFIED"],
    },
  });

  const authority = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0] as unknown as Record<string, unknown>;
  for (const forbidden of ["mode","distanceMeters","durationMinutes","difficulty","stairs","accessible","stroller","oneWay","status","routeNodeId","routeEdgeId"]) {
    assert.equal(Object.hasOwn(authority, forbidden), false);
  }
});

test("Planner 44 canonical evidence is deeply immutable and uses null-prototype records", () => {
  const authority = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.getPrototypeOf(authority), null);
  assert.equal(Object.isFrozen(authority.interveningConnections), true);
  assert.equal(Object.isFrozen(authority.interveningConnections[0]), true);
  assert.equal(Object.getPrototypeOf(authority.interveningConnections[0]), null);
  assert.equal(Object.isFrozen(authority.selectedJunctionConnection), true);
  assert.equal(Object.getPrototypeOf(authority.selectedJunctionConnection), null);
  assert.equal(Object.isFrozen(authority.segmentProvenance), true);
  assert.equal(Object.getPrototypeOf(authority.segmentProvenance), null);
  assert.equal(Object.isFrozen(authority.segmentProvenance.orderedNodeIds), true);
});
