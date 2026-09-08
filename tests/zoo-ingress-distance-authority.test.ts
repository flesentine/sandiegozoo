import assert from "node:assert/strict";
import test from "node:test";
import {
  DERIVED_INGRESS_DISTANCES,
  INGRESS_GEOMETRY_NODES,
  INGRESS_GEOMETRY_WAYS,
  assessIngressDistanceAuthority,
  assertIngressDistanceAuthorityIntegrity,
  derivePolylineDistanceMeters,
  type DerivedIngressDistance,
  type IngressGeometryNode,
  type IngressGeometryWay,
} from "../src/data/zooIngressDistanceAuthority.ts";

test("main entrance ingress geometry derives deterministic pedestrian distances", () => {
  assert.deepEqual(
    DERIVED_INGRESS_DISTANCES.map((distance) => ({
      id: distance.id,
      sourceWayId: distance.sourceWayId,
      distanceMeters: distance.distanceMeters,
    })),
    [
      {
        id: "sdz-ingress-way-controlled-passage-distance",
        sourceWayId: "755054695",
        distanceMeters: 16.836,
      },
      {
        id: "sdz-ingress-way-front-street-connection-distance",
        sourceWayId: "755054694",
        distanceMeters: 25.376,
      },
    ],
  );

  assert.deepEqual(
    assessIngressDistanceAuthority(
      "sdz-geo-main-entrance",
    ),
    {
      status: "distance-ready",
      targetId: "sdz-geo-main-entrance",
      segmentIds: [
        "sdz-ingress-way-controlled-passage-distance",
        "sdz-ingress-way-front-street-connection-distance",
      ],
      totalDistanceMeters: 42.212,
      derivationMethod: "haversine-segment-sum",
      routeEdge: {
        status: "blocked",
        reason: "ROUTE_EDGE_SEMANTICS_NOT_SOURCED",
      },
    },
  );
});

test("source node coordinates and way order stay frozen to OSM geometry", () => {
  assert.deepEqual(
    INGRESS_GEOMETRY_NODES.map((node) => [
      node.sourceObjectId,
      node.lat,
      node.lng,
    ]),
    [
      ["7053320514", 32.735256, -117.149182],
      ["7053320517", 32.7352359, -117.1492666],
      ["7053320516", 32.7352145, -117.1493551],
      ["13587192693", 32.7351734, -117.1494973],
      ["7053320515", 32.7351404, -117.1496117],
    ],
  );

  assert.deepEqual(
    INGRESS_GEOMETRY_WAYS.map((way) => ({
      sourceObjectId: way.sourceObjectId,
      nodeIds: way.nodeIds,
      geometryRole: way.geometryRole,
    })),
    [
      {
        sourceObjectId: "755054695",
        nodeIds: [
          "7053320514",
          "7053320517",
          "7053320516",
        ],
        geometryRole: "controlled-entrance-passage",
      },
      {
        sourceObjectId: "755054694",
        nodeIds: [
          "7053320516",
          "13587192693",
          "7053320515",
        ],
        geometryRole:
          "interior-front-street-connection",
      },
    ],
  );
});

test("distance derivation is reproducible from source node coordinates", () => {
  assert.equal(
    derivePolylineDistanceMeters([
      "7053320514",
      "7053320517",
      "7053320516",
    ]),
    16.836,
  );
  assert.equal(
    derivePolylineDistanceMeters([
      "7053320516",
      "13587192693",
      "7053320515",
    ]),
    25.376,
  );
});

test("derived distance explicitly makes no survey-accuracy claim", () => {
  for (const distance of DERIVED_INGRESS_DISTANCES) {
    assert.equal(
      distance.derivationMethod,
      "haversine-segment-sum",
    );
    assert.equal(distance.earthRadiusMeters, 6371000);
    assert.equal(distance.roundingDecimals, 3);
    assert.equal(
      distance.accuracyClaim,
      "no-survey-accuracy-claim",
    );
    assert.equal(
      distance.plannerMaterialization,
      "distance-only",
    );
  }
});

test("Planner 13 still refuses unsupported RouteEdge semantics", () => {
  for (const record of [
    ...INGRESS_GEOMETRY_NODES,
    ...INGRESS_GEOMETRY_WAYS,
    ...DERIVED_INGRESS_DISTANCES,
  ]) {
    assert.equal("durationMinutes" in record, false);
    assert.equal("difficulty" in record, false);
    assert.equal("stairs" in record, false);
    assert.equal("accessible" in record, false);
    assert.equal("stroller" in record, false);
    assert.equal("oneWay" in record, false);
    assert.equal("routeNodeId" in record, false);
  }

  assert.deepEqual(
    assessIngressDistanceAuthority(
      "sdz-geo-wegeforth-bowl",
    ),
    {
      status: "blocked",
      reason: "INGRESS_GEOMETRY_NOT_SOURCED",
      targetId: "sdz-geo-wegeforth-bowl",
    },
  );

  assert.deepEqual(
    assessIngressDistanceAuthority("unknown-target"),
    {
      status: "blocked",
      reason: "TARGET_UNKNOWN",
      targetId: "unknown-target",
    },
  );
});

test("ingress distance authority is deeply immutable", () => {
  assert.equal(Object.isFrozen(INGRESS_GEOMETRY_NODES), true);
  assert.equal(
    Object.isFrozen(INGRESS_GEOMETRY_NODES[0]),
    true,
  );
  assert.equal(Object.isFrozen(INGRESS_GEOMETRY_WAYS), true);
  assert.equal(
    Object.isFrozen(INGRESS_GEOMETRY_WAYS[0].nodeIds),
    true,
  );
  assert.equal(
    Object.isFrozen(DERIVED_INGRESS_DISTANCES),
    true,
  );
  assert.equal(
    Object.isFrozen(DERIVED_INGRESS_DISTANCES[0].nodeIds),
    true,
  );
});

test("integrity rejects coordinate drift from qualified Planner 12 authority", () => {
  const badNodes: IngressGeometryNode[] =
    INGRESS_GEOMETRY_NODES.map((node) =>
      node.sourceObjectId === "7053320514"
        ? { ...node, lat: node.lat + 0.0001 }
        : { ...node },
    );

  assert.throws(
    () =>
      assertIngressDistanceAuthorityIntegrity(
        badNodes,
        INGRESS_GEOMETRY_WAYS,
        DERIVED_INGRESS_DISTANCES,
      ),
    /do not preserve Planner 12 entrance\/access authority/,
  );
});

test("integrity rejects a reordered controlled entrance passage", () => {
  const badWays: IngressGeometryWay[] =
    INGRESS_GEOMETRY_WAYS.map((way) =>
      way.sourceObjectId === "755054695"
        ? {
            ...way,
            nodeIds: [
              "7053320514",
              "7053320516",
              "7053320517",
            ],
          }
        : { ...way },
    );

  assert.throws(
    () =>
      assertIngressDistanceAuthorityIntegrity(
        INGRESS_GEOMETRY_NODES,
        badWays,
        DERIVED_INGRESS_DISTANCES,
      ),
    /does not preserve the sourced entrance-turnstile-interior node order/,
  );
});

test("integrity rejects tampered derived distance values", () => {
  const badDistances: DerivedIngressDistance[] =
    DERIVED_INGRESS_DISTANCES.map((distance, index) =>
      index === 0
        ? {
            ...distance,
            distanceMeters:
              distance.distanceMeters + 1,
          }
        : { ...distance },
    );

  assert.throws(
    () =>
      assertIngressDistanceAuthorityIntegrity(
        INGRESS_GEOMETRY_NODES,
        INGRESS_GEOMETRY_WAYS,
        badDistances,
      ),
    /is not reproducible from source coordinates/,
  );
});

test("integrity rejects unsupported RouteEdge fields hidden by casts", () => {
  const leakedWay = {
    ...INGRESS_GEOMETRY_WAYS[0],
    durationMinutes: 1,
  } as unknown as IngressGeometryWay;

  assert.throws(
    () =>
      assertIngressDistanceAuthorityIntegrity(
        INGRESS_GEOMETRY_NODES,
        [leakedWay, INGRESS_GEOMETRY_WAYS[1]],
        DERIVED_INGRESS_DISTANCES,
      ),
    /cannot contain unsupported Planner RouteEdge field durationMinutes/,
  );

  const leakedDistance = {
    ...DERIVED_INGRESS_DISTANCES[0],
    accessible: true,
  } as unknown as DerivedIngressDistance;

  assert.throws(
    () =>
      assertIngressDistanceAuthorityIntegrity(
        INGRESS_GEOMETRY_NODES,
        INGRESS_GEOMETRY_WAYS,
        [
          leakedDistance,
          DERIVED_INGRESS_DISTANCES[1],
        ],
      ),
    /cannot contain unsupported Planner RouteEdge field accessible/,
  );
});

test("polyline derivation fails closed on unknown or incomplete geometry", () => {
  assert.throws(
    () => derivePolylineDistanceMeters(["7053320514"]),
    /requires at least two source nodes/,
  );

  assert.throws(
    () =>
      derivePolylineDistanceMeters([
        "7053320514",
        "missing-node",
      ]),
    /references unknown source node/,
  );
});
