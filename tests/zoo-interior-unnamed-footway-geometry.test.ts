import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_UNNAMED_FOOTWAY_GEOMETRY,
  assessInteriorUnnamedFootwayGeometry,
  assertInteriorUnnamedFootwayGeometryIntegrity,
  type InteriorUnnamedFootwayGeometryAuthority,
} from "../src/data/zooInteriorUnnamedFootwayGeometry.ts";

function mutableClone() {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  return {
    ...authority,
    orderedNodeIds: [...authority.orderedNodeIds],
    nodes: authority.nodes.map((node) => ({ ...node })),
  } as unknown as InteriorUnnamedFootwayGeometryAuthority;
}

test("Planner 67 captures exact unnamed footway v1 identity without inventing a name", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  assert.equal(authority.sourceWayId, "1481578625");
  assert.equal(authority.sourceWayVersion, 1);
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(authority.sourceWayChangeset, 178875075);
  assert.equal(authority.sourceHighway, "footway");
  assert.equal(authority.sourceNameStatus, "absent");
  assert.equal(Object.hasOwn(authority, "sourceName"), false);
});

test("Planner 67 captures both exact node versions and coordinates", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  assert.deepEqual(authority.orderedNodeIds, [
    "13588159634",
    "1619736694",
  ]);
  assert.deepEqual(
    authority.nodes.map((node) => [
      node.sourceObjectId,
      node.sourceVersion,
      node.lat,
      node.lng,
    ]),
    [
      ["13588159634", 1, 32.7357982, -117.150403],
      ["1619736694", 2, 32.7358299, -117.150419],
    ],
  );
});

test("Planner 67 preserves forward source-order traversal without inferring oneWay", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  assert.equal(authority.traversalFromNodeId, "13588159634");
  assert.equal(authority.traversalToNodeId, "1619736694");
  assert.equal(authority.sourceOrderTraversal, "forward");
  assert.equal(Object.hasOwn(authority, "oneWay"), false);
});

test("Planner 67 remains blocked on far-end topology and route semantics", () => {
  const assessment = assessInteriorUnnamedFootwayGeometry();
  assert.deepEqual(
    {
      ...assessment,
      routeGraphExpansion: { ...assessment.routeGraphExpansion },
    },
    {
    status: "geometry-captured",
    authorityId: "sdz-interior-tiger-trail-unnamed-footway-v1-geometry",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "1481578625",
    sourceWayVersion: 1,
    sourceNameStatus: "absent",
    sourceWayNodeCount: 2,
    traversalFromNodeId: "13588159634",
    traversalToNodeId: "1619736694",
    coordinateProvenance: "version-pinned",
    farEndpointTopologyStatus: "not-frozen",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "UNNAMED_FOOTWAY_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
        "EXACT_UNNAMED_FOOTWAY_SEGMENT_SEMANTICS_NOT_QUALIFIED",
      ],
    },
    },
  );
});

test("Planner 67 does not materialize RouteEdge semantics", () => {
  const authority =
    INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0] as unknown as Record<string, unknown>;
  for (const field of [
    "fromNodeId",
    "toNodeId",
    "mode",
    "distanceMeters",
    "durationMinutes",
    "difficulty",
    "stairs",
    "accessible",
    "stroller",
    "oneWay",
    "status",
    "provenance",
    "routeNodeId",
  ]) {
    assert.equal(Object.hasOwn(authority, field), false);
  }
});

test("Planner 67 rejects node-version drift", () => {
  const forged = mutableClone();
  (forged.nodes[1] as unknown as { sourceVersion: number }).sourceVersion = 1;
  assert.throws(
    () => assertInteriorUnnamedFootwayGeometryIntegrity([forged]),
    /node 1619736694 drifted/,
  );
});

test("Planner 67 rejects invented source names", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  (forged as Record<string, unknown>).sourceName = "Fern Canyon Trail";
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayGeometryIntegrity([
        forged as unknown as InteriorUnnamedFootwayGeometryAuthority,
      ]),
    /cannot contain unknown field sourceName/,
  );
});

test("Planner 67 rejects decorated node arrays", () => {
  const forged = mutableClone();
  (forged.nodes as unknown as unknown[] & { extra?: boolean }).extra = true;
  assert.throws(
    () => assertInteriorUnnamedFootwayGeometryIntegrity([forged]),
    /node provenance collection cannot contain extra own properties/,
  );
});

test("Planner 67 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "mode", {
    configurable: true,
    enumerable: false,
    value: "walk",
  });
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayGeometryIntegrity([
        forged as unknown as InteriorUnnamedFootwayGeometryAuthority,
      ]),
    /cannot contain unknown field mode|cannot materialize route field mode/,
  );
});

test("Planner 67 exports and assessment are deeply immutable", () => {
  const authority = INTERIOR_UNNAMED_FOOTWAY_GEOMETRY[0];
  const assessment = assessInteriorUnnamedFootwayGeometry();
  assert.equal(Object.isFrozen(INTERIOR_UNNAMED_FOOTWAY_GEOMETRY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.orderedNodeIds), true);
  assert.equal(Object.isFrozen(authority.nodes), true);
  assert.equal(Object.isFrozen(authority.nodes[0]), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});


test("Planner 67 rejects ordered-node sequence drift", () => {
  for (const index of [0, 1]) {
    const forged = mutableClone();
    (forged.orderedNodeIds as unknown as string[])[index] = `forged-${index}`;
    assert.throws(
      () => assertInteriorUnnamedFootwayGeometryIntegrity([forged]),
      /node 13588159634 drifted|node 1619736694 drifted/,
    );
  }
});

test("Planner 67 rejects way and node provenance URL drift", () => {
  const wayForged = mutableClone() as unknown as {
    sourceWayUrl: string;
    sourceWayVersionUrl: string;
  };
  wayForged.sourceWayUrl = "https://example.com/forged-way";
  wayForged.sourceWayVersionUrl = "https://example.com/forged-version";
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayGeometryIntegrity([
        wayForged as unknown as InteriorUnnamedFootwayGeometryAuthority,
      ]),
    /geometry drifted/,
  );

  for (const index of [0, 1]) {
    const nodeForged = mutableClone();
    (nodeForged.nodes[index] as unknown as { sourceUrl: string }).sourceUrl =
      "https://example.com/forged-node";
    assert.throws(
      () => assertInteriorUnnamedFootwayGeometryIntegrity([nodeForged]),
      /drifted from captured version-pinned geometry/,
    );
  }
});

test("Planner 67 rejects Proxy-backed authority and nested geometry input", () => {
  const target = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(target, "routeNodeId", {
    configurable: true,
    enumerable: true,
    value: "hidden-route-node",
  });

  const authorityProxy = new Proxy(target, {
    ownKeys(inner) {
      return Reflect.ownKeys(inner).filter((key) => key !== "routeNodeId");
    },
    getOwnPropertyDescriptor(inner, property) {
      if (property === "routeNodeId") return undefined;
      return Reflect.getOwnPropertyDescriptor(inner, property);
    },
    has(inner, property) {
      if (property === "routeNodeId") return false;
      return Reflect.has(inner, property);
    },
  });

  assert.throws(
    () =>
      assertInteriorUnnamedFootwayGeometryIntegrity([
        authorityProxy as unknown as InteriorUnnamedFootwayGeometryAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nestedArray = mutableClone() as unknown as { nodes: readonly unknown[] };
  nestedArray.nodes = new Proxy([...nestedArray.nodes], {});
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayGeometryIntegrity([
        nestedArray as unknown as InteriorUnnamedFootwayGeometryAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nestedNode = mutableClone() as unknown as { nodes: unknown[] };
  nestedNode.nodes[0] = new Proxy(nestedNode.nodes[0] as object, {});
  assert.throws(
    () =>
      assertInteriorUnnamedFootwayGeometryIntegrity([
        nestedNode as unknown as InteriorUnnamedFootwayGeometryAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );
});

test("Planner 67 rejects mutation during nested reflective validation", () => {
  const original = mutableClone();
  const replacement = mutableClone();
  const collection = [original];

  const nodesTarget = [...original.nodes] as unknown[];
  const nodesProxy = new Proxy(nodesTarget, {
    getPrototypeOf(inner) {
      collection[0] = replacement;
      return Reflect.getPrototypeOf(inner);
    },
  });
  (original as unknown as { nodes: unknown }).nodes = nodesProxy;

  assert.throws(
    () => assertInteriorUnnamedFootwayGeometryIntegrity(collection),
    /cannot be Proxy-backed or otherwise uncloneable|cannot mutate during validation/,
  );
});

test("Planner 67 retains its captured clone primitive against caller traps", () => {
  const target = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(target, "routeNodeId", {
    configurable: true,
    enumerable: true,
    value: "hidden-route-node",
  });

  const recordProxy = new Proxy(target, {
    ownKeys(inner) {
      return Reflect.ownKeys(inner).filter((key) => key !== "routeNodeId");
    },
    getOwnPropertyDescriptor(inner, property) {
      if (property === "routeNodeId") return undefined;
      return Reflect.getOwnPropertyDescriptor(inner, property);
    },
    has(inner, property) {
      if (property === "routeNodeId") return false;
      return Reflect.has(inner, property);
    },
  });

  const collection = [
    recordProxy as unknown as InteriorUnnamedFootwayGeometryAuthority,
  ];
  const originalStructuredClone = globalThis.structuredClone;
  const outerProxy = new Proxy(collection, {
    getPrototypeOf(inner) {
      globalThis.structuredClone = ((value: unknown) =>
        value) as typeof structuredClone;
      return Reflect.getPrototypeOf(inner);
    },
  });

  try {
    assert.throws(
      () => assertInteriorUnnamedFootwayGeometryIntegrity(outerProxy),
      /cannot be Proxy-backed or otherwise uncloneable/,
    );
  } finally {
    globalThis.structuredClone = originalStructuredClone;
  }
});

test("Planner 67 assessment is isolated from Object.prototype pollution", () => {
  Object.defineProperty(Object.prototype, "routeNodeId", {
    configurable: true,
    value: "polluted",
  });
  Object.defineProperty(Object.prototype, "distanceMeters", {
    configurable: true,
    value: 999,
  });

  try {
    const assessment = assessInteriorUnnamedFootwayGeometry();
    assert.equal(Object.getPrototypeOf(assessment), null);
    assert.equal(Object.getPrototypeOf(assessment.routeGraphExpansion), null);
    assert.equal(
      "routeNodeId" in (assessment as unknown as Record<string, unknown>),
      false,
    );
    assert.equal(
      "distanceMeters" in
        (assessment.routeGraphExpansion as unknown as Record<string, unknown>),
      false,
    );
  } finally {
    delete (Object.prototype as Record<string, unknown>).routeNodeId;
    delete (Object.prototype as Record<string, unknown>).distanceMeters;
  }
});

test("Planner 67 rejects inherited names on the unnamed geometry authority", () => {
  Object.defineProperty(Object.prototype, "sourceName", {
    configurable: true,
    value: "Polluted Trail",
  });

  try {
    const forged = mutableClone();
    assert.throws(
      () => assertInteriorUnnamedFootwayGeometryIntegrity([forged]),
      /geometry drifted/,
    );
  } finally {
    delete (Object.prototype as Record<string, unknown>).sourceName;
  }
});

test("Planner 67 array-shape checks reject extras despite Array.prototype.some pollution", () => {
  const originalSome = Array.prototype.some;
  Array.prototype.some = (() => false) as typeof Array.prototype.some;

  try {
    const forged = mutableClone();
    (forged.nodes as unknown as unknown[] & { extra?: string }).extra = "forged";
    assert.throws(
      () => assertInteriorUnnamedFootwayGeometryIntegrity([forged]),
      /node provenance collection cannot contain extra own properties/,
    );
  } finally {
    Array.prototype.some = originalSome;
  }
});


test("Planner 67 shape checks reject extras despite Set.prototype.has pollution", () => {
  const originalHas = Set.prototype.has;
  Set.prototype.has = (() => true) as typeof Set.prototype.has;

  try {
    const forged = mutableClone();
    (forged.nodes as unknown as unknown[] & { extra?: string }).extra = "forged";
    assert.throws(
      () => assertInteriorUnnamedFootwayGeometryIntegrity([forged]),
      /node provenance collection cannot contain extra own properties/,
    );
  } finally {
    Set.prototype.has = originalHas;
  }
});


test("Planner 67 rejects route fields despite Array.prototype iterator pollution", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  forged.routeNodeId = "forged-route-node";

  const originalIterator = Array.prototype[Symbol.iterator];
  Array.prototype[Symbol.iterator] = function* () {};

  try {
    assert.throws(
      () =>
        assertInteriorUnnamedFootwayGeometryIntegrity([
          forged as unknown as InteriorUnnamedFootwayGeometryAuthority,
        ]),
      /cannot contain unknown field routeNodeId|cannot materialize route field routeNodeId/,
    );
  } finally {
    Array.prototype[Symbol.iterator] = originalIterator;
  }
});
