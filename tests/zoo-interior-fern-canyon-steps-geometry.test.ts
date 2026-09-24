import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_STEPS_GEOMETRY,
  assessInteriorFernCanyonStepsGeometry,
  assertInteriorFernCanyonStepsGeometryIntegrity,
  type InteriorFernCanyonStepsGeometryAuthority,
} from "../src/data/zooInteriorFernCanyonStepsGeometry.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_STEPS_GEOMETRY[0];
  return {
    ...authority,
    orderedNodeIds: [...authority.orderedNodeIds],
    nodes: authority.nodes.map((node) => ({ ...node })),
  } as unknown as InteriorFernCanyonStepsGeometryAuthority;
}

test("Planner 61 captures exact Fern Canyon steps v1 identity", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_GEOMETRY[0];
  assert.equal(authority.sourceWayId, "1481578622");
  assert.equal(authority.sourceWayVersion, 1);
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(authority.sourceWayChangeset, 178875075);
  assert.equal(authority.sourceHighway, "steps");
  assert.equal(authority.sourceBridge, "yes");
  assert.equal(authority.sourceIncline, "up");
  assert.equal(authority.sourceLayer, "1");
  assert.equal(authority.sourceName, "Fern Canyon Trail");
});

test("Planner 61 captures all six version-pinned node coordinates", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_GEOMETRY[0];
  assert.deepEqual(authority.orderedNodeIds, [
    "13588159627",
    "13588159628",
    "13588159629",
    "13588159630",
    "13588159631",
    "13588159625",
  ]);

  assert.deepEqual(
    authority.nodes.map((node) => [
      node.sourceObjectId,
      node.lat,
      node.lng,
    ]),
    [
      ["13588159627", 32.7357192, -117.1500664],
      ["13588159628", 32.7356741, -117.1500395],
      ["13588159629", 32.7355805, -117.1501039],
      ["13588159630", 32.7354981, -117.1500261],
      ["13588159631", 32.7353955, -117.1500281],
      ["13588159625", 32.7353594, -117.1501187],
    ],
  );
});

test("Planner 61 freezes traversal from the current endpoint to the far endpoint without inferring oneWay", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_GEOMETRY[0];
  assert.equal(authority.traversalFromNodeId, "13588159625");
  assert.equal(authority.traversalToNodeId, "13588159627");
  assert.equal(Object.hasOwn(authority, "oneWay"), false);
});

test("Planner 61 remains blocked on far-end topology and route semantics", () => {
  const assessment = assessInteriorFernCanyonStepsGeometry();
  assert.deepEqual(
    {
      ...assessment,
      routeGraphExpansion: {
        ...assessment.routeGraphExpansion,
      },
    },
    {
    status: "geometry-captured",
    authorityId: "sdz-interior-fern-canyon-steps-v1-geometry",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "1481578622",
    sourceWayVersion: 1,
    sourceWayNodeCount: 6,
    traversalFromNodeId: "13588159625",
    traversalToNodeId: "13588159627",
    coordinateProvenance: "version-pinned",
    farEndpointTopologyStatus: "not-frozen",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
        "EXACT_FERN_CANYON_STEPS_SEGMENT_SEMANTICS_NOT_QUALIFIED",
      ],
    },
    },
  );
});

test("Planner 61 does not materialize RouteEdge semantics", () => {
  const authority =
    INTERIOR_FERN_CANYON_STEPS_GEOMETRY[0] as unknown as Record<string, unknown>;
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

test("Planner 61 rejects coordinate drift", () => {
  const forged = mutableClone();
  (forged.nodes[2] as unknown as { lat: number }).lat = 0;

  assert.throws(
    () => assertInteriorFernCanyonStepsGeometryIntegrity([forged]),
    /node 13588159629 drifted/,
  );
});

test("Planner 61 rejects way tag drift", () => {
  const forged = mutableClone() as unknown as {
    sourceHighway: string;
  };
  forged.sourceHighway = "footway";

  assert.throws(
    () =>
      assertInteriorFernCanyonStepsGeometryIntegrity([
        forged as unknown as InteriorFernCanyonStepsGeometryAuthority,
      ]),
    /geometry drifted/,
  );
});

test("Planner 61 rejects decorated node arrays", () => {
  const forged = mutableClone();
  (forged.nodes as unknown as unknown[] & { extra?: boolean }).extra = true;

  assert.throws(
    () => assertInteriorFernCanyonStepsGeometryIntegrity([forged]),
    /node provenance collection cannot contain extra own properties/,
  );
});

test("Planner 61 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "stairs", {
    configurable: true,
    enumerable: false,
    value: true,
  });

  assert.throws(
    () =>
      assertInteriorFernCanyonStepsGeometryIntegrity([
        forged as unknown as InteriorFernCanyonStepsGeometryAuthority,
      ]),
    /cannot contain unknown field stairs|cannot materialize route field stairs/,
  );
});

test("Planner 61 exports and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_GEOMETRY[0];
  const assessment = assessInteriorFernCanyonStepsGeometry();
  assert.equal(Object.isFrozen(INTERIOR_FERN_CANYON_STEPS_GEOMETRY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.orderedNodeIds), true);
  assert.equal(Object.isFrozen(authority.nodes), true);
  assert.equal(Object.isFrozen(authority.nodes[0]), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});


test("Planner 61 rejects way and node provenance URL drift", () => {
  const wayForged = mutableClone() as unknown as {
    sourceWayUrl: string;
    sourceWayVersionUrl: string;
  };
  wayForged.sourceWayUrl = "https://example.com/forged-way";
  wayForged.sourceWayVersionUrl = "https://example.com/forged-way-version";

  assert.throws(
    () =>
      assertInteriorFernCanyonStepsGeometryIntegrity([
        wayForged as unknown as InteriorFernCanyonStepsGeometryAuthority,
      ]),
    /geometry drifted/,
  );

  const nodeForged = mutableClone();
  (
    nodeForged.nodes[3] as unknown as {
      sourceUrl: string;
    }
  ).sourceUrl = "https://example.com/forged-node";

  assert.throws(
    () => assertInteriorFernCanyonStepsGeometryIntegrity([nodeForged]),
    /node 13588159630 drifted/,
  );
});

test("Planner 61 rejects Proxy-backed authority and nested geometry input", () => {
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
      assertInteriorFernCanyonStepsGeometryIntegrity([
        authorityProxy as unknown as InteriorFernCanyonStepsGeometryAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nestedArray = mutableClone() as unknown as {
    nodes: readonly unknown[];
  };
  nestedArray.nodes = new Proxy([...nestedArray.nodes], {});
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsGeometryIntegrity([
        nestedArray as unknown as InteriorFernCanyonStepsGeometryAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nestedNode = mutableClone() as unknown as {
    nodes: unknown[];
  };
  nestedNode.nodes[2] = new Proxy(
    nestedNode.nodes[2] as object,
    {},
  );
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsGeometryIntegrity([
        nestedNode as unknown as InteriorFernCanyonStepsGeometryAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );
});

test("Planner 61 rejects mutation during nested reflective validation", () => {
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
    () => assertInteriorFernCanyonStepsGeometryIntegrity(collection),
    /cannot be Proxy-backed or otherwise uncloneable|cannot mutate during validation/,
  );
});

test("Planner 61 retains its captured clone primitive against caller traps", () => {
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
    recordProxy as unknown as InteriorFernCanyonStepsGeometryAuthority,
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
      () => assertInteriorFernCanyonStepsGeometryIntegrity(outerProxy),
      /cannot be Proxy-backed or otherwise uncloneable/,
    );
  } finally {
    globalThis.structuredClone = originalStructuredClone;
  }
});

test("Planner 61 assessment is isolated from Object.prototype pollution", () => {
  Object.defineProperty(Object.prototype, "routeNodeId", {
    configurable: true,
    value: "polluted",
  });
  Object.defineProperty(Object.prototype, "distanceMeters", {
    configurable: true,
    value: 999,
  });

  try {
    const assessment = assessInteriorFernCanyonStepsGeometry();
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
