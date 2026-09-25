import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY,
  assessInteriorFernCanyonNextStepsGeometry,
  assertInteriorFernCanyonNextStepsGeometryIntegrity,
  type InteriorFernCanyonNextStepsGeometryAuthority,
} from "../src/data/zooInteriorFernCanyonNextStepsGeometry.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  return {
    ...authority,
    orderedNodeIds: [...authority.orderedNodeIds],
    nodes: authority.nodes.map((node) => ({ ...node })),
  } as unknown as InteriorFernCanyonNextStepsGeometryAuthority;
}

test("Planner 65 captures exact Fern Canyon next-steps v1 identity", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  assert.equal(authority.sourceWayId, "1481578624");
  assert.equal(authority.sourceWayVersion, 1);
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T20:08:08Z");
  assert.equal(authority.sourceWayChangeset, 178875075);
  assert.equal(authority.sourceHighway, "steps");
  assert.equal(authority.sourceIncline, "up");
  assert.equal(authority.sourceName, "Fern Canyon Trail");
});

test("Planner 65 captures both version-pinned node coordinates", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  assert.deepEqual(authority.orderedNodeIds, [
    "13588159634",
    "13588159633",
  ]);
  assert.deepEqual(
    authority.nodes.map((node) => [
      node.sourceObjectId,
      node.lat,
      node.lng,
    ]),
    [
      ["13588159634", 32.7357982, -117.150403],
      ["13588159633", 32.7357407, -117.1503614],
    ],
  );
});

test("Planner 65 records reverse source-order traversal without inferring oneWay", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  assert.equal(authority.traversalFromNodeId, "13588159633");
  assert.equal(authority.traversalToNodeId, "13588159634");
  assert.equal(authority.sourceOrderTraversal, "reverse");
  assert.equal(Object.hasOwn(authority, "oneWay"), false);
});

test("Planner 65 remains blocked on far-end topology and route semantics", () => {
  const assessment = assessInteriorFernCanyonNextStepsGeometry();
  assert.deepEqual(
    {
      ...assessment,
      routeGraphExpansion: {
        ...assessment.routeGraphExpansion,
      },
    },
    {
    status: "geometry-captured",
    authorityId: "sdz-interior-fern-canyon-next-steps-v1-geometry",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "1481578624",
    sourceWayVersion: 1,
    sourceWayNodeCount: 2,
    traversalFromNodeId: "13588159633",
    traversalToNodeId: "13588159634",
    sourceOrderTraversal: "reverse",
    coordinateProvenance: "version-pinned",
    farEndpointTopologyStatus: "not-frozen",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY_NOT_FROZEN",
        "EXACT_FERN_CANYON_NEXT_STEPS_SEGMENT_SEMANTICS_NOT_QUALIFIED",
      ],
    },
    },
  );
});

test("Planner 65 does not materialize RouteEdge semantics", () => {
  const authority =
    INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0] as unknown as Record<string, unknown>;
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

test("Planner 65 rejects coordinate drift", () => {
  const forged = mutableClone();
  (forged.nodes[0] as unknown as { lat: number }).lat = 0;
  assert.throws(
    () => assertInteriorFernCanyonNextStepsGeometryIntegrity([forged]),
    /node 13588159634 drifted/,
  );
});

test("Planner 65 rejects source-order traversal drift", () => {
  const forged = mutableClone() as unknown as {
    sourceOrderTraversal: string;
  };
  forged.sourceOrderTraversal = "forward";
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsGeometryIntegrity([
        forged as unknown as InteriorFernCanyonNextStepsGeometryAuthority,
      ]),
    /geometry drifted/,
  );
});

test("Planner 65 rejects decorated node arrays", () => {
  const forged = mutableClone();
  (forged.nodes as unknown as unknown[] & { extra?: boolean }).extra = true;
  assert.throws(
    () => assertInteriorFernCanyonNextStepsGeometryIntegrity([forged]),
    /node provenance collection cannot contain extra own properties/,
  );
});

test("Planner 65 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "stairs", {
    configurable: true,
    enumerable: false,
    value: true,
  });
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsGeometryIntegrity([
        forged as unknown as InteriorFernCanyonNextStepsGeometryAuthority,
      ]),
    /cannot contain unknown field stairs|cannot materialize route field stairs/,
  );
});

test("Planner 65 exports and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY[0];
  const assessment = assessInteriorFernCanyonNextStepsGeometry();
  assert.equal(Object.isFrozen(INTERIOR_FERN_CANYON_NEXT_STEPS_GEOMETRY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.orderedNodeIds), true);
  assert.equal(Object.isFrozen(authority.nodes), true);
  assert.equal(Object.isFrozen(authority.nodes[0]), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});


test("Planner 65 rejects ordered-node sequence drift", () => {
  for (const index of [0, 1]) {
    const forged = mutableClone();
    (
      forged.orderedNodeIds as unknown as string[]
    )[index] = `forged-${index}`;

    assert.throws(
      () => assertInteriorFernCanyonNextStepsGeometryIntegrity([forged]),
      /node 1358815963[34] drifted/,
    );
  }
});

test("Planner 65 rejects way and node provenance URL drift", () => {
  const wayForged = mutableClone() as unknown as {
    sourceWayUrl: string;
    sourceWayVersionUrl: string;
  };
  wayForged.sourceWayUrl = "https://example.com/forged-way";
  wayForged.sourceWayVersionUrl = "https://example.com/forged-version";

  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsGeometryIntegrity([
        wayForged as unknown as InteriorFernCanyonNextStepsGeometryAuthority,
      ]),
    /geometry drifted/,
  );

  for (const index of [0, 1]) {
    const nodeForged = mutableClone();
    (
      nodeForged.nodes[index] as unknown as {
        sourceUrl: string;
      }
    ).sourceUrl = "https://example.com/forged-node";

    assert.throws(
      () => assertInteriorFernCanyonNextStepsGeometryIntegrity([nodeForged]),
      /drifted from captured version-pinned geometry/,
    );
  }
});

test("Planner 65 rejects Proxy-backed authority and nested geometry input", () => {
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
      assertInteriorFernCanyonNextStepsGeometryIntegrity([
        authorityProxy as unknown as InteriorFernCanyonNextStepsGeometryAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nestedArray = mutableClone() as unknown as {
    nodes: readonly unknown[];
  };
  nestedArray.nodes = new Proxy([...nestedArray.nodes], {});

  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsGeometryIntegrity([
        nestedArray as unknown as InteriorFernCanyonNextStepsGeometryAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nestedNode = mutableClone() as unknown as {
    nodes: unknown[];
  };
  nestedNode.nodes[0] = new Proxy(
    nestedNode.nodes[0] as object,
    {},
  );

  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsGeometryIntegrity([
        nestedNode as unknown as InteriorFernCanyonNextStepsGeometryAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );
});

test("Planner 65 rejects mutation during nested reflective validation", () => {
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
    () =>
      assertInteriorFernCanyonNextStepsGeometryIntegrity(collection),
    /cannot be Proxy-backed or otherwise uncloneable|cannot mutate during validation/,
  );
});

test("Planner 65 retains its captured clone primitive against caller traps", () => {
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
    recordProxy as unknown as InteriorFernCanyonNextStepsGeometryAuthority,
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
      () =>
        assertInteriorFernCanyonNextStepsGeometryIntegrity(outerProxy),
      /cannot be Proxy-backed or otherwise uncloneable/,
    );
  } finally {
    globalThis.structuredClone = originalStructuredClone;
  }
});

test("Planner 65 assessment is isolated from Object.prototype pollution", () => {
  Object.defineProperty(Object.prototype, "routeNodeId", {
    configurable: true,
    value: "polluted",
  });
  Object.defineProperty(Object.prototype, "distanceMeters", {
    configurable: true,
    value: 999,
  });

  try {
    const assessment = assessInteriorFernCanyonNextStepsGeometry();
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
