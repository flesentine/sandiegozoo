import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
  assessInteriorTreetopsHistoricalTopology,
  assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity,
  type InteriorTreetopsHistoricalTopologyAuthority,
} from "../src/data/zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import { INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY } from "../src/data/zooInteriorTreetopsV7GeometryAuthority.ts";


function mutableClone(): InteriorTreetopsHistoricalTopologyAuthority {
  const source = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  return {
    ...source,
    interveningConnections: source.interveningConnections.map((connection) => ({
      ...connection,
      orderedNodeIds: [...connection.orderedNodeIds],
    })),
    selectedJunctionConnection: {
      ...source.selectedJunctionConnection,
      orderedNodeIds: [...source.selectedJunctionConnection.orderedNodeIds],
    },
    segmentProvenance: {
      ...source.segmentProvenance,
      orderedNodeIds: [...source.segmentProvenance.orderedNodeIds],
    },
  };
}

test("Planner 44 selects the first linear historical highway junction after the anchor", () => {
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


test("Planner 44 exported integrity boundary accepts only the frozen topology authority", () => {
  assert.doesNotThrow(() =>
    assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity(
      INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
    ),
  );

  const forged = mutableClone() as unknown as Record<string, unknown>;
  forged.mode = "walk";
  assert.throws(
    () =>
      assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity([
        forged as unknown as InteriorTreetopsHistoricalTopologyAuthority,
      ]),
    /unknown field mode/,
  );

  const nestedForged = mutableClone();
  (nestedForged.selectedJunctionConnection as unknown as Record<string, unknown>).distanceMeters = 10;
  assert.throws(
    () => assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity([nestedForged]),
    /unknown field distanceMeters/,
  );
});

test("Planner 44 selected connection stays topology-only before pedestrian-mode qualification", () => {
  const selected = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0].selectedJunctionConnection;
  assert.equal(selected.classification, "first-linear-highway-connected-way-after-anchor");
  assert.equal(selected.sourceHighway, "footway");
  assert.equal(JSON.stringify(selected).includes("walkable"), false);
  assert.equal(assessInteriorTreetopsHistoricalTopology().routeGraphExpansion.reasons[0], "PEDESTRIAN_MODE_NOT_QUALIFIED");
});

test("Planner 44 rejects top-level and nested proxies without invoking get traps", () => {
  const topLevel = mutableClone();
  let topLevelReads = 0;
  const topLevelProxy = new Proxy(topLevel, {
    get(target, property, receiver) {
      topLevelReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity([topLevelProxy]),
    /Proxy-backed/,
  );
  assert.equal(topLevelReads, 0);

  const nested = mutableClone();
  let nestedReads = 0;
  nested.selectedJunctionConnection = new Proxy(nested.selectedJunctionConnection, {
    get(target, property, receiver) {
      nestedReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity([nested]),
    /Proxy-backed/,
  );
  assert.equal(nestedReads, 0);

  const nestedArray = mutableClone();
  let arrayReads = 0;
  nestedArray.segmentProvenance.orderedNodeIds = new Proxy(
    [...nestedArray.segmentProvenance.orderedNodeIds],
    {
      get(target, property, receiver) {
        arrayReads += 1;
        return Reflect.get(target, property, receiver);
      },
    },
  );
  assert.throws(
    () => assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity([nestedArray]),
    /Proxy-backed/,
  );
  assert.equal(arrayReads, 0);
});

test("Planner 44 rejects accessors and accessor-bearing scalar leaves before they execute", () => {
  const topLevel = mutableClone() as unknown as Record<string, unknown>;
  let topLevelReads = 0;
  Object.defineProperty(topLevel, "nextJunctionNodeId", {
    enumerable: true,
    configurable: true,
    get() {
      topLevelReads += 1;
      return "13588159626";
    },
  });
  assert.throws(
    () =>
      assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity([
        topLevel as unknown as InteriorTreetopsHistoricalTopologyAuthority,
      ]),
    /requires enumerable own data field nextJunctionNodeId/,
  );
  assert.equal(topLevelReads, 0);

  const scalarLeaf = mutableClone();
  let scalarReads = 0;
  const accessorBearingScalar = {};
  Object.defineProperty(accessorBearingScalar, "value", {
    enumerable: true,
    get() {
      scalarReads += 1;
      return "1481578621";
    },
  });
  (scalarLeaf.selectedJunctionConnection as unknown as { sourceWayId: unknown }).sourceWayId =
    accessorBearingScalar;
  assert.throws(
    () => assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity([scalarLeaf]),
    /must be a primitive string before proxy screening/,
  );
  assert.equal(scalarReads, 0);
});

test("Planner 44 rejects nested replacement during proxy screening", () => {
  const authority = mutableClone();
  const replacement = {
    ...authority.selectedJunctionConnection,
    orderedNodeIds: [...authority.selectedJunctionConnection.orderedNodeIds],
  };
  const proxy = new Proxy(
    {
      ...authority.selectedJunctionConnection,
      orderedNodeIds: [...authority.selectedJunctionConnection.orderedNodeIds],
    },
    {
      getOwnPropertyDescriptor(target, property) {
        authority.selectedJunctionConnection = replacement;
        return Reflect.getOwnPropertyDescriptor(target, property);
      },
    },
  );
  authority.selectedJunctionConnection = proxy;

  assert.throws(
    () => assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity([authority]),
    /changed during proxy screening|Proxy-backed/,
  );
});

test("Planner 44 branded exotic records cannot hide nested proxy-backed topology", () => {
  const authority = mutableClone();
  let orderedNodeReads = 0;
  const selected = new Date(0) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(selected, Object.prototype);
  const canonical = authority.selectedJunctionConnection as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(canonical)) {
    selected[key] =
      key === "orderedNodeIds"
        ? new Proxy([...(value as readonly string[])], {
            get(target, property, receiver) {
              orderedNodeReads += 1;
              return Reflect.get(target, property, receiver);
            },
          })
        : value;
  }
  authority.selectedJunctionConnection =
    selected as unknown as InteriorTreetopsHistoricalTopologyAuthority["selectedJunctionConnection"];

  assert.throws(
    () => assertInteriorTreetopsHistoricalTopologyAuthorityIntegrity([authority]),
    /Proxy-backed/,
  );
  assert.equal(orderedNodeReads, 0);
});
