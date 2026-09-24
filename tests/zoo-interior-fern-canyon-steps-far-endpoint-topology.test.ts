import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY,
  assessInteriorFernCanyonStepsFarEndpointTopology,
  assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity,
  type InteriorFernCanyonStepsFarEndpointTopologyAuthority,
} from "../src/data/zooInteriorFernCanyonStepsFarEndpointTopology.ts";

function mutableClone() {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  return {
    ...authority,
    endpointCoordinate: { ...authority.endpointCoordinate },
    connectedWays: authority.connectedWays.map((way) => ({
      ...way,
      orderedNodeIds: [...way.orderedNodeIds],
    })),
  } as unknown as InteriorFernCanyonStepsFarEndpointTopologyAuthority;
}

test("Planner 62 freezes the exact far endpoint from Planner 61 geometry", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.endpointNodeId, "13588159627");
  assert.equal(authority.endpointCoordinate.lat, 32.7357192);
  assert.equal(authority.endpointCoordinate.lng, -117.1500664);
});

test("Planner 62 proves exactly two historical ways at the far endpoint", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  assert.equal(authority.connectedWays.length, 2);
  assert.equal(authority.connectedWays[0].sourceWayId, "1481578622");
  assert.equal(authority.connectedWays[1].sourceWayId, "1481578623");
});

test("Planner 62 selects the unique onward Fern Canyon bridge footway", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  const continuation = authority.connectedWays[1];

  assert.equal(authority.selectedContinuationWayId, "1481578623");
  assert.equal(authority.selectedContinuationHighway, "footway");
  assert.equal(continuation.sourceHighway, "footway");
  assert.equal(continuation.sourceBridge, "yes");
  assert.equal(continuation.sourceLayer, "1");
  assert.equal(continuation.sourceName, "Fern Canyon Trail");
  assert.deepEqual(continuation.orderedNodeIds, [
    "13588159627",
    "13588159632",
    "13588159633",
  ]);
});

test("Planner 62 keeps continuation geometry fail-closed until node coordinates are captured", () => {
  const assessment = assessInteriorFernCanyonStepsFarEndpointTopology();
  assert.deepEqual(
    {
      ...assessment,
      routeGraphExpansion: {
        ...assessment.routeGraphExpansion,
      },
    },
    {
    status: "endpoint-topology-sourced",
    authorityId: "sdz-interior-fern-canyon-steps-far-endpoint-topology",
    objectiveSourceRecordId: "sdz-tiger-trail",
    endpointNodeId: "13588159627",
    historicalConnectedWayCount: 2,
    selectedContinuationWayId: "1481578623",
    selectedContinuationHighway: "footway",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "VERSION_PINNED_FERN_CANYON_FOOTWAY_NODE_COORDINATES_NOT_CAPTURED",
        "EXACT_FERN_CANYON_FOOTWAY_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
    },
  );
});

test("Planner 62 does not materialize route semantics", () => {
  const authority =
    INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0] as unknown as Record<
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

test("Planner 62 rejects endpoint coordinate drift", () => {
  const forged = mutableClone();
  (forged.endpointCoordinate as unknown as { lat: number }).lat = 0;
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([forged]),
    /far-end topology drifted/,
  );
});

test("Planner 62 rejects continuation identity drift", () => {
  const forged = mutableClone();
  (
    forged.connectedWays[1] as unknown as { sourceWayId: string }
  ).sourceWayId = "1481579999";
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([forged]),
    /continuation connection drifted/,
  );
});

test("Planner 62 rejects decorated connected-way arrays", () => {
  const forged = mutableClone();
  (
    forged.connectedWays as unknown as unknown[] & { extra?: boolean }
  ).extra = true;
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([forged]),
    /connected way collection cannot contain extra own properties/,
  );
});

test("Planner 62 rejects hidden route fields", () => {
  const forged = mutableClone() as unknown as Record<string, unknown>;
  Object.defineProperty(forged, "distanceMeters", {
    configurable: true,
    enumerable: false,
    value: 1,
  });
  assert.throws(
    () =>
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([
        forged as unknown as InteriorFernCanyonStepsFarEndpointTopologyAuthority,
      ]),
    /cannot contain unknown field distanceMeters|cannot materialize route field distanceMeters/,
  );
});

test("Planner 62 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY[0];
  const assessment = assessInteriorFernCanyonStepsFarEndpointTopology();
  assert.equal(
    Object.isFrozen(INTERIOR_FERN_CANYON_STEPS_FAR_ENDPOINT_TOPOLOGY),
    true,
  );
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.endpointCoordinate), true);
  assert.equal(Object.isFrozen(authority.connectedWays), true);
  assert.equal(Object.isFrozen(authority.connectedWays[1].orderedNodeIds), true);
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});


test("Planner 62 rejects drift in every inbound node position", () => {
  for (const index of [1, 2, 3, 4]) {
    const forged = mutableClone();
    const inbound =
      forged.connectedWays[0] as unknown as {
        orderedNodeIds: string[];
      };
    inbound.orderedNodeIds[index] = `forged-${index}`;

    assert.throws(
      () =>
        assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([forged]),
      /inbound steps connection drifted/,
    );
  }
});

test("Planner 62 rejects complete inbound provenance drift", () => {
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
    (inbound) => {
      inbound.sourceName = "Forged Trail";
    },
  ];

  for (const mutate of mutations) {
    const forged = mutableClone();
    const inbound =
      forged.connectedWays[0] as unknown as Record<string, unknown>;
    mutate(inbound);

    assert.throws(
      () =>
        assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([forged]),
      /inbound steps connection drifted/,
    );
  }
});

test("Planner 62 rejects continuation provenance URL drift", () => {
  for (const field of ["sourceWayVersionUrl", "sourceWayUrl"] as const) {
    const forged = mutableClone();
    const continuation =
      forged.connectedWays[1] as unknown as Record<string, unknown>;
    continuation[field] = "https://example.com/forged";

    assert.throws(
      () =>
        assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([forged]),
      /continuation connection drifted/,
    );
  }
});

test("Planner 62 rejects Proxy-backed authority and nested topology input", () => {
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
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([
        authorityProxy as unknown as InteriorFernCanyonStepsFarEndpointTopologyAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );

  const nestedWays = mutableClone() as unknown as {
    connectedWays: readonly unknown[];
  };
  nestedWays.connectedWays = new Proxy([...nestedWays.connectedWays], {});

  assert.throws(
    () =>
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([
        nestedWays as unknown as InteriorFernCanyonStepsFarEndpointTopologyAuthority,
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
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity([
        nestedSequence as unknown as InteriorFernCanyonStepsFarEndpointTopologyAuthority,
      ]),
    /cannot be Proxy-backed or otherwise uncloneable/,
  );
});

test("Planner 62 rejects mutation during nested reflective validation", () => {
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
      assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity(collection),
    /cannot be Proxy-backed or otherwise uncloneable|cannot mutate during validation/,
  );
});

test("Planner 62 retains its captured clone primitive against caller traps", () => {
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
    recordProxy as unknown as InteriorFernCanyonStepsFarEndpointTopologyAuthority,
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
        assertInteriorFernCanyonStepsFarEndpointTopologyIntegrity(outerProxy),
      /cannot be Proxy-backed or otherwise uncloneable/,
    );
  } finally {
    globalThis.structuredClone = originalStructuredClone;
  }
});

test("Planner 62 assessment is isolated from Object.prototype pollution", () => {
  Object.defineProperty(Object.prototype, "routeNodeId", {
    configurable: true,
    value: "polluted",
  });
  Object.defineProperty(Object.prototype, "distanceMeters", {
    configurable: true,
    value: 999,
  });

  try {
    const assessment = assessInteriorFernCanyonStepsFarEndpointTopology();
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
