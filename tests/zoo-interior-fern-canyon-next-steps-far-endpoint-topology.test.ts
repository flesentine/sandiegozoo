import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY,
  assessInteriorFernCanyonNextStepsFarEndpointTopology,
  assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity,
  type InteriorFernCanyonNextStepsFarEndpointTopologyAuthority,
} from "../src/data/zooInteriorFernCanyonNextStepsFarEndpointTopology.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  return {
    ...authority,
    endpointCoordinate: { ...authority.endpointCoordinate },
    connectedWays: authority.connectedWays.map((way) => ({
      ...way,
      orderedNodeIds: [...way.orderedNodeIds],
    })),
  } as unknown as InteriorFernCanyonNextStepsFarEndpointTopologyAuthority;
}

test("Planner 66 freezes the exact far endpoint from Planner 65 geometry", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.endpointNodeId, "13588159634");
  assert.equal(authority.endpointCoordinate.lat, 32.7357982);
  assert.equal(authority.endpointCoordinate.lng, -117.150403);
});

test("Planner 66 proves exactly two historical ways at the steps far endpoint", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.connectedWays.length, 2);
  assert.equal(authority.connectedWays[0].sourceWayId, "1481578624");
  assert.equal(authority.connectedWays[1].sourceWayId, "1481578625");
});

test("Planner 66 selects the unique onward unnamed footway without inventing a name", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  const continuation = authority.connectedWays[1];
  assert.equal(authority.selectedContinuationWayId, "1481578625");
  assert.equal(authority.selectedContinuationHighway, "footway");
  assert.equal(authority.selectedContinuationNameStatus, "absent");
  assert.equal(continuation.sourceHighway, "footway");
  assert.equal(Object.hasOwn(continuation, "sourceName"), false);
  assert.deepEqual(continuation.orderedNodeIds, [
    "13588159634",
    "1619736694",
  ]);
});

test("Planner 66 keeps unnamed-footway geometry fail-closed until the new node coordinate is captured", () => {
  const assessment = assessInteriorFernCanyonNextStepsFarEndpointTopology();
  assert.deepEqual(
    {
      ...assessment,
      routeGraphExpansion: {
        ...assessment.routeGraphExpansion,
      },
    },
    {
    status: "endpoint-topology-sourced",
    authorityId: "sdz-interior-fern-canyon-next-steps-far-endpoint-topology",
    objectiveSourceRecordId: "sdz-tiger-trail",
    endpointNodeId: "13588159634",
    historicalConnectedWayCount: 2,
    selectedContinuationWayId: "1481578625",
    selectedContinuationHighway: "footway",
    selectedContinuationNameStatus: "absent",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "VERSION_PINNED_UNNAMED_FOOTWAY_NODE_COORDINATE_NOT_CAPTURED",
        "EXACT_UNNAMED_FOOTWAY_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
    },
  );
});

test("Planner 66 does not materialize route semantics", () => {
  const authority =
    INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0] as unknown as Record<
      string,
      unknown
    >;
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

test("Planner 66 rejects endpoint coordinate drift", () => {
  const forged = mutableClone();
  (forged.endpointCoordinate as unknown as { lng: number }).lng = 0;
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
    /far-end topology drifted/,
  );
});

test("Planner 66 rejects invented continuation names", () => {
  const forged = mutableClone();
  (
    forged.connectedWays[1] as unknown as { sourceName?: string }
  ).sourceName = "Fern Canyon Trail";
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
    /continuation connection cannot contain unknown field sourceName|continuation connection drifted/,
  );
});

test("Planner 66 rejects decorated connected-way arrays", () => {
  const forged = mutableClone();
  (
    forged.connectedWays as unknown as unknown[] & { extra?: boolean }
  ).extra = true;
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
    /connected way collection cannot contain extra own properties/,
  );
});

test("Planner 66 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "distanceMeters", {
    configurable: true,
    enumerable: false,
    value: 1,
  });
  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([
        forged as unknown as InteriorFernCanyonNextStepsFarEndpointTopologyAuthority,
      ]),
    /cannot contain unknown field distanceMeters|cannot materialize route field distanceMeters/,
  );
});

test("Planner 66 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  const assessment = assessInteriorFernCanyonNextStepsFarEndpointTopology();
  assert.equal(
    Object.isFrozen(INTERIOR_FERN_CANYON_NEXT_STEPS_FAR_ENDPOINT_TOPOLOGY),
    true,
  );
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.endpointCoordinate), true);
  assert.equal(Object.isFrozen(authority.connectedWays), true);
  assert.equal(Object.isFrozen(authority.connectedWays[1].orderedNodeIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});


test("Planner 66 rejects complete inbound sequence and provenance drift", () => {
  const sequenceForged = mutableClone();
  (
    sequenceForged.connectedWays[0].orderedNodeIds as unknown as string[]
  )[1] = "forged-inbound-node";

  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([
        sequenceForged,
      ]),
    /inbound steps connection drifted/,
  );

  const mutations: Array<
    (inbound: Record<string, unknown>) => void
  > = [
    (inbound) => {
      inbound.sourceWayVersion = 2;
    },
    (inbound) => {
      inbound.sourceWayTimestamp = "2026-02-21T20:09:00Z";
    },
    (inbound) => {
      inbound.sourceWayChangeset = 999;
    },
    (inbound) => {
      inbound.sourceWayVersionUrl = "https://example.com/forged-version";
    },
    (inbound) => {
      inbound.sourceWayUrl = "https://example.com/forged-way";
    },
  ];

  for (const mutate of mutations) {
    const forged = mutableClone();
    const inbound =
      forged.connectedWays[0] as unknown as Record<string, unknown>;
    mutate(inbound);

    assert.throws(
      () =>
        assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
      /inbound steps connection drifted/,
    );
  }
});

test("Planner 66 rejects continuation provenance and node-sequence drift", () => {
  const mutations: Array<
    (continuation: Record<string, unknown>) => void
  > = [
    (continuation) => {
      continuation.sourceWayVersionUrl = "https://example.com/forged-version";
    },
    (continuation) => {
      continuation.sourceWayUrl = "https://example.com/forged-way";
    },
    (continuation) => {
      continuation.sourceWayChangeset = 999;
    },
  ];

  for (const mutate of mutations) {
    const forged = mutableClone();
    const continuation =
      forged.connectedWays[1] as unknown as Record<string, unknown>;
    mutate(continuation);

    assert.throws(
      () =>
        assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
      /continuation connection drifted/,
    );
  }

  const sequenceForged = mutableClone();
  (
    sequenceForged.connectedWays[1].orderedNodeIds as unknown as string[]
  )[1] = "forged-continuation-node";

  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([
        sequenceForged,
      ]),
    /continuation connection drifted/,
  );
});

test("Planner 66 rejects Proxy-backed authority and nested topology input", () => {
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
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([
        authorityProxy as unknown as InteriorFernCanyonNextStepsFarEndpointTopologyAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nestedWays = mutableClone() as unknown as {
    connectedWays: readonly unknown[];
  };
  nestedWays.connectedWays = new Proxy([...nestedWays.connectedWays], {});

  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([
        nestedWays as unknown as InteriorFernCanyonNextStepsFarEndpointTopologyAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nestedSequence = mutableClone() as unknown as {
    connectedWays: Array<{ orderedNodeIds: readonly string[] }>;
  };
  nestedSequence.connectedWays[1].orderedNodeIds = new Proxy(
    [...nestedSequence.connectedWays[1].orderedNodeIds],
    {},
  );

  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([
        nestedSequence as unknown as InteriorFernCanyonNextStepsFarEndpointTopologyAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );
});

test("Planner 66 rejects mutation during nested reflective validation", () => {
  const original = mutableClone();
  const replacement = mutableClone();
  const collection = [original];

  const waysTarget = [...original.connectedWays] as unknown[];
  const waysProxy = new Proxy(waysTarget, {
    getPrototypeOf(inner) {
      collection[0] = replacement;
      return Reflect.getPrototypeOf(inner);
    },
  });
  (original as unknown as { connectedWays: unknown }).connectedWays =
    waysProxy;

  assert.throws(
    () =>
      assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity(collection),
    /cannot be Proxy-backed or otherwise uncloneable|cannot mutate during validation/,
  );
});

test("Planner 66 retains its captured clone primitive against caller traps", () => {
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
    recordProxy as unknown as InteriorFernCanyonNextStepsFarEndpointTopologyAuthority,
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
        assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity(
          outerProxy,
        ),
      /cannot be Proxy-backed or otherwise uncloneable/,
    );
  } finally {
    globalThis.structuredClone = originalStructuredClone;
  }
});

test("Planner 66 assessment is isolated from Object.prototype pollution", () => {
  Object.defineProperty(Object.prototype, "routeNodeId", {
    configurable: true,
    value: "polluted",
  });
  Object.defineProperty(Object.prototype, "distanceMeters", {
    configurable: true,
    value: 999,
  });

  try {
    const assessment =
      assessInteriorFernCanyonNextStepsFarEndpointTopology();
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


test("Planner 66 rejects inherited names on the unnamed continuation", () => {
  Object.defineProperty(Object.prototype, "sourceName", {
    configurable: true,
    value: "Polluted Trail",
  });

  try {
    const forged = mutableClone();
    assert.throws(
      () =>
        assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
      /continuation connection drifted/,
    );
  } finally {
    delete (Object.prototype as Record<string, unknown>).sourceName;
  }
});


test("Planner 66 exact node-sequence checks ignore Array.prototype.some pollution", () => {
  const originalSome = Array.prototype.some;
  Array.prototype.some = (() => false) as typeof Array.prototype.some;

  try {
    const forged = mutableClone();
    (
      forged.connectedWays[1].orderedNodeIds as unknown as string[]
    )[1] = "forged-continuation-node";

    assert.throws(
      () =>
        assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
      /continuation connection drifted/,
    );
  } finally {
    Array.prototype.some = originalSome;
  }
});


test("Planner 66 array-shape checks reject extras despite Array.prototype.some pollution", () => {
  const originalSome = Array.prototype.some;
  Array.prototype.some = (() => false) as typeof Array.prototype.some;

  try {
    const forged = mutableClone();
    (
      forged.connectedWays as unknown as unknown[] & { extra?: string }
    ).extra = "forged";

    assert.throws(
      () =>
        assertInteriorFernCanyonNextStepsFarEndpointTopologyIntegrity([forged]),
      /connected way collection cannot contain extra own properties/,
    );
  } finally {
    Array.prototype.some = originalSome;
  }
});
