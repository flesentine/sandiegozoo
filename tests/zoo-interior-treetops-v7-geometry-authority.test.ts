import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY,
  assessInteriorTreetopsV7Geometry,
  assertInteriorTreetopsV7GeometryAuthorityIntegrity,
  type InteriorTreetopsV7GeometryAuthority,
} from "../src/data/zooInteriorTreetopsV7GeometryAuthority.ts";
import { INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE } from "../src/data/zooInteriorTreetopsGeometryEvidenceGate.ts";

const EXPECTED_IDS = [
  "1619736626","1619736622","1619736623","10303552086","1619736627","1619736634","13588159626","2596192926","13588159615","2596192924","2596192927","13588159620","2596192928","2596192929","13588159624","1619736615","1619736612","1619736607","1619736597","1619736585","1619736582","13588248406","1619736579","1619736575","1619736581","1619736580","1619736571","1619736567","1619736562","1619736557","1619736548","1619736539","1619736522","1619736499",
];

function mutableClone(): InteriorTreetopsV7GeometryAuthority {
  const source = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  return {
    ...source,
    orderedNodeIds: [...source.orderedNodeIds],
    nodes: source.nodes.map((node) => ({ ...node })),
  };
}

test("Planner 43 captures the exact Treetops Way v7 ordered node sequence", () => {
  const authority = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  assert.equal(authority.sourceWayId, "148910139");
  assert.equal(authority.sourceWayVersion, 7);
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T20:28:40Z");
  assert.equal(authority.sourceWayChangeset, 178875711);
  assert.equal(authority.sourceWayNodeCount, 34);
  assert.deepEqual(authority.orderedNodeIds, EXPECTED_IDS);
  assert.equal(authority.orderedNodeIds[0], "1619736626");
  assert.equal(authority.orderedNodeIds.at(-1), "1619736499");
});

test("Planner 43 remains exactly linked to the Planner 42 evidence gate", () => {
  const authority = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  const gate = INTERIOR_TREETOPS_GEOMETRY_EVIDENCE_GATE[0];
  assert.equal(authority.objectiveSourceRecordId, gate.objectiveSourceRecordId);
  assert.equal(authority.anchorNodeId, gate.anchorNodeId);
  assert.equal(authority.sourceWayId, gate.sourceWayId);
  assert.equal(authority.sourceWayVersionUrl, gate.sourceWayVersionUrl);
  assert.equal(authority.sourceWayTimestamp, gate.sourceWayTimestamp);
  assert.equal(authority.sourceName, gate.sourceName);
});

test("Planner 43 freezes exact historical coordinate provenance for every ordered node", () => {
  const authority = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  assert.equal(authority.nodes.length, 34);
  for (let index = 0; index < authority.nodes.length; index += 1) {
    const node = authority.nodes[index];
    assert.equal(node.sourceObjectId, authority.orderedNodeIds[index]);
    assert.equal(node.sourceUrl, `https://www.openstreetmap.org/node/${node.sourceObjectId}`);
    assert.equal(node.sourceVersionUrl, `https://api.openstreetmap.org/api/0.6/node/${node.sourceObjectId}/${node.sourceVersion}`);
    assert.ok(Date.parse(node.sourceTimestamp) <= Date.parse(authority.sourceWayTimestamp));
    assert.ok(Number.isFinite(node.lat));
    assert.ok(Number.isFinite(node.lng));
  }
  assert.deepEqual({ ...authority.nodes[0] }, {
    sourceObjectId: "1619736626",
    sourceUrl: "https://www.openstreetmap.org/node/1619736626",
    sourceVersionUrl: "https://api.openstreetmap.org/api/0.6/node/1619736626/2",
    sourceVersion: 2,
    sourceTimestamp: "2013-12-23T19:47:46Z",
    sourceChangeset: 19606502,
    lat: 32.735201,
    lng: -117.1496375,
  });
});

test("Planner 43 records the historical node-version selection rule explicitly", () => {
  const authority = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  assert.equal(authority.nodeVersionSelectionRule, "latest-visible-version-at-or-before-way-version-timestamp");
  const sameChangeset = authority.nodes.filter((node) => node.sourceChangeset === 178875711);
  assert.deepEqual(sameChangeset.map((node) => node.sourceObjectId), ["13588248406","1619736499"]);
  assert.ok(sameChangeset.every((node) => node.sourceTimestamp === authority.sourceWayTimestamp));
});

test("Planner 43 clears the node-sequence blocker but does not invent a next junction", () => {
  assert.deepEqual(assessInteriorTreetopsV7Geometry(), {
    status: "geometry-captured",
    authorityId: "sdz-interior-treetops-way-v7-geometry",
    objectiveSourceRecordId: "sdz-tiger-trail",
    anchorNodeId: "1619736626",
    sourceWayId: "148910139",
    sourceWayVersion: 7,
    sourceWayNodeCount: 34,
    nodeSequenceEvidence: "captured",
    coordinateProvenance: "version-pinned",
    nextJunctionSelection: "blocked",
    routeGraphExpansion: {
      status: "blocked",
      reasons: ["NEXT_JUNCTION_NOT_SOURCED","EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE"],
    },
  });
});

test("Planner 43 rejects reordered or duplicate source nodes", () => {
  const reordered = mutableClone();
  [reordered.orderedNodeIds[1], reordered.orderedNodeIds[2]] = [reordered.orderedNodeIds[2], reordered.orderedNodeIds[1]];
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity([reordered]), /ordered node sequence drifted/);

  const duplicated = mutableClone();
  duplicated.orderedNodeIds[1] = duplicated.orderedNodeIds[0];
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity([duplicated]), /lost anchor or uniqueness|ordered node sequence drifted/);
});

test("Planner 43 rejects node version, coordinate, timestamp, and URL drift", () => {
  const versionDrift = mutableClone();
  versionDrift.nodes[0].sourceVersion = 3;
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity([versionDrift]), /drifted from captured historical provenance/);

  const coordinateDrift = mutableClone();
  coordinateDrift.nodes[10].lat += 0.000001;
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity([coordinateDrift]), /drifted from captured historical provenance/);

  const timestampDrift = mutableClone();
  timestampDrift.nodes[21].sourceTimestamp = "2026-02-21T20:28:41Z";
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity([timestampDrift]), /drifted from captured historical provenance/);

  const urlDrift = mutableClone();
  urlDrift.nodes[3].sourceVersionUrl += "?download=1";
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity([urlDrift]), /drifted from captured historical provenance/);
});

test("Planner 43 rejects premature RouteEdge or junction materialization", () => {
  const forged = { ...mutableClone(), nextJunctionNodeId: "1619736499" } as unknown as InteriorTreetopsV7GeometryAuthority;
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity([forged]), /unknown field nextJunctionNodeId|cannot materialize downstream field nextJunctionNodeId/);

  const nodeForged = mutableClone();
  (nodeForged.nodes[0] as unknown as { distanceMeters: number }).distanceMeters = 1;
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity([nodeForged]), /unknown field distanceMeters|cannot materialize downstream field distanceMeters/);
});

test("Planner 43 validates exact ordinary array/object shapes", () => {
  const decorated = [mutableClone()] as InteriorTreetopsV7GeometryAuthority[] & { alias?: string };
  decorated.alias = "smuggled";
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity(decorated), /cannot contain extra own properties/);

  const hidden = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(hidden, "sourceWayChangeset", { enumerable: false, value: 178875711 });
  assert.throws(() => assertInteriorTreetopsV7GeometryAuthorityIntegrity([hidden as unknown as InteriorTreetopsV7GeometryAuthority]), /requires enumerable own data field sourceWayChangeset/);
});

test("Planner 43 rejects top-level and nested proxies without invoking get traps", () => {
  const topLevel = mutableClone();
  let topLevelReads = 0;
  const topLevelProxy = new Proxy(topLevel, {
    get(target, property, receiver) {
      topLevelReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity([topLevelProxy]),
    /Proxy-backed/,
  );
  assert.equal(topLevelReads, 0);

  const nested = mutableClone();
  let nestedReads = 0;
  nested.nodes[0] = new Proxy(nested.nodes[0], {
    get(target, property, receiver) {
      nestedReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity([nested]),
    /Proxy-backed/,
  );
  assert.equal(nestedReads, 0);
});

test("Planner 43 rejects accessors before structured-clone screening can invoke them", () => {
  const authority = mutableClone() as unknown as Record<string, unknown>;
  let reads = 0;
  Object.defineProperty(authority, "sourceWayVersion", {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return 7;
    },
  });
  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity([authority as unknown as InteriorTreetopsV7GeometryAuthority]),
    /requires enumerable own data field sourceWayVersion/,
  );
  assert.equal(reads, 0);
});

test("Planner 43 rejects nested replacement during proxy screening", () => {
  const authority = mutableClone();
  const cleanReplacement = { ...authority.nodes[0] };
  const proxy = new Proxy({ ...authority.nodes[0] }, {
    getOwnPropertyDescriptor(target, property) {
      authority.nodes[0] = cleanReplacement;
      return Reflect.getOwnPropertyDescriptor(target, property);
    },
  });
  authority.nodes[0] = proxy;

  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity([authority]),
    /node provenance collection changed during proxy screening|Proxy-backed/,
  );
});

test("Planner 43 rejects accessor-bearing scalar leaves before structured clone can traverse them", () => {
  const nodeIdAuthority = mutableClone();
  let nodeIdGetterReads = 0;
  const accessorNodeId = {};
  Object.defineProperty(accessorNodeId, "value", {
    enumerable: true,
    get() {
      nodeIdGetterReads += 1;
      return "1619736626";
    },
  });
  (nodeIdAuthority.orderedNodeIds as unknown as unknown[])[0] = accessorNodeId;
  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity([nodeIdAuthority]),
    /must be a primitive string before proxy screening/,
  );
  assert.equal(nodeIdGetterReads, 0);

  const latitudeAuthority = mutableClone();
  let latitudeGetterReads = 0;
  const accessorLatitude = {};
  Object.defineProperty(accessorLatitude, "value", {
    enumerable: true,
    get() {
      latitudeGetterReads += 1;
      return 32.735201;
    },
  });
  (latitudeAuthority.nodes[0] as unknown as { lat: unknown }).lat = accessorLatitude;
  assert.throws(
    () => assertInteriorTreetopsV7GeometryAuthorityIntegrity([latitudeAuthority]),
    /must be a finite primitive number before proxy screening/,
  );
  assert.equal(latitudeGetterReads, 0);
});

test("Planner 43 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.orderedNodeIds), true);
  assert.equal(Object.isFrozen(authority.nodes), true);
  assert.equal(Object.isFrozen(authority.nodes[0]), true);
  assert.equal(Object.getPrototypeOf(authority), null);
  assert.equal(Object.getPrototypeOf(authority.nodes[0]), null);

  const assessment = assessInteriorTreetopsV7Geometry();
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
