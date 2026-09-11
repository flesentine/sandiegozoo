import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
  assessInteriorFrontStreetGeometry,
  assertInteriorFrontStreetGeometryAuthorityIntegrity,
  type InteriorFrontStreetGeometryAuthority,
} from "../src/data/zooInteriorFrontStreetGeometryAuthority.ts";
import {
  INTERIOR_GRAPH_EXPANSION_SEEDS,
} from "../src/data/zooInteriorGraphExpansionAuthority.ts";
import {
  INGRESS_GEOMETRY_NODES,
} from "../src/data/zooIngressDistanceAuthority.ts";

const ROUTE_EDGE_FIELDS = [
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
] as const;

function mutableClone() {
  const source = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  return {
    ...source,
    connectionNode: { ...source.connectionNode },
    sourceWayNeighborhoodNodeIds: [
      ...source.sourceWayNeighborhoodNodeIds,
    ],
    adjacentJunctionCandidates: source.adjacentJunctionCandidates.map(
      (candidate) => ({
        ...candidate,
        node: { ...candidate.node },
      }),
    ),
  } as unknown as InteriorFrontStreetGeometryAuthority;
}

test("Planner 26 captures the exact Front Street neighborhood from the Planner 25 seed", () => {
  const authority = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];

  assert.equal(INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY.length, 1);
  assert.equal(authority.sourceWayId, "1481425058");
  assert.equal(authority.sourceWayId, seed.sourceWayId);
  assert.equal(authority.connectionNode.sourceObjectId, "7053320515");
  assert.equal(authority.connectionNode.sourceObjectId, seed.connectionNodeId);
  assert.equal(authority.sourceWayVersion, 1);
  assert.equal(authority.sourceWayTimestamp, "2026-02-21T14:47:49Z");
  assert.equal(authority.sourceWayNodeCount, 17);
  assert.equal(authority.connectionNodeIndex, 4);
  assert.deepEqual(authority.sourceWayNeighborhoodNodeIds, [
    "1619736626",
    "7053320515",
    "6239154982",
  ]);
});

test("Planner 26 pins versioned OSM provenance for every coordinate used in the geometry boundary", () => {
  const authority = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const [previous, next] = authority.adjacentJunctionCandidates;

  assert.deepEqual(
    [
      authority.connectionNode.sourceObjectId,
      authority.connectionNode.sourceVersion,
      authority.connectionNode.sourceTimestamp,
      authority.connectionNode.sourceChangeset,
      authority.connectionNode.sourceVersionUrl,
    ],
    [
      "7053320515",
      1,
      "2019-12-13T00:23:10Z",
      78341336,
      "https://api.openstreetmap.org/api/0.6/node/7053320515/1",
    ],
  );
  assert.deepEqual(
    [
      previous.node.sourceObjectId,
      previous.node.sourceVersion,
      previous.node.sourceTimestamp,
      previous.node.sourceChangeset,
      previous.node.sourceVersionUrl,
    ],
    [
      "1619736626",
      2,
      "2013-12-23T19:47:46Z",
      19606502,
      "https://api.openstreetmap.org/api/0.6/node/1619736626/2",
    ],
  );
  assert.deepEqual(
    [
      next.node.sourceObjectId,
      next.node.sourceVersion,
      next.node.sourceTimestamp,
      next.node.sourceChangeset,
      next.node.sourceVersionUrl,
    ],
    [
      "6239154982",
      1,
      "2019-01-27T06:49:41Z",
      66670306,
      "https://api.openstreetmap.org/api/0.6/node/6239154982/1",
    ],
  );
});

test("Planner 26 preserves the qualified ingress connection coordinate exactly", () => {
  const authority = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const ingressNode = INGRESS_GEOMETRY_NODES.find(
    (node) => node.sourceObjectId === "7053320515",
  );

  assert.ok(ingressNode);
  assert.deepEqual(
    [authority.connectionNode.lat, authority.connectionNode.lng],
    [ingressNode.lat, ingressNode.lng],
  );
});

test("Planner 26 preserves both adjacent pedestrian branch candidates without selecting an endpoint", () => {
  const authority = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const [previous, next] = authority.adjacentJunctionCandidates;

  assert.equal(authority.endpointSelection, "unresolved");
  assert.deepEqual(
    [
      previous.node.sourceObjectId,
      previous.relativePosition,
      previous.connectorWayId,
      previous.connectorName,
    ],
    ["1619736626", "previous-adjacent", "148910139", "Treetops Way"],
  );
  assert.deepEqual(
    [
      next.node.sourceObjectId,
      next.relativePosition,
      next.connectorWayId,
      next.connectorName,
    ],
    ["6239154982", "next-adjacent", "666404421", null],
  );
});

test("a connector name is retained only as source context and cannot choose the expansion endpoint", () => {
  const assessment = assessInteriorFrontStreetGeometry();

  assert.deepEqual(assessment.candidateEndpointNodeIds, [
    "1619736626",
    "6239154982",
  ]);
  assert.equal(
    assessment.routeGraphExpansion.reasons.includes(
      "EXPANSION_ENDPOINT_NODE_NOT_SOURCED",
    ),
    true,
  );
});

test("Planner 26 source tags remain geometry context rather than RouteEdge semantics", () => {
  const authority = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];

  assert.deepEqual(
    [authority.highwayTag, authority.name, authority.footTag, authority.feeTag, authority.surfaceTag],
    ["pedestrian", "Front Street", "customers", "yes", "asphalt"],
  );
  assert.equal(authority.plannerMaterialization, "geometry-candidates-only");
  for (const field of ROUTE_EDGE_FIELDS) {
    assert.equal(field in authority, false);
  }
});

test("Planner 26 clears only the geometry blocker and keeps endpoint plus every RouteEdge semantic blocked", () => {
  assert.deepEqual(assessInteriorFrontStreetGeometry(), {
    status: "geometry-candidates-ready",
    authorityId: "sdz-interior-front-street-adjacent-geometry",
    sourceWayId: "1481425058",
    connectionNodeId: "7053320515",
    candidateEndpointNodeIds: ["1619736626", "6239154982"],
    sourceWayNeighborhoodNodeIds: [
      "1619736626",
      "7053320515",
      "6239154982",
    ],
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "EXPANSION_ENDPOINT_NODE_NOT_SOURCED",
        "EXACT_SEGMENT_MODE_NOT_SOURCED",
        "EXACT_SEGMENT_DISTANCE_NOT_SOURCED",
        "EXACT_SEGMENT_DURATION_NOT_SOURCED",
        "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        "EXACT_SEGMENT_PEDESTRIAN_DIRECTION_NOT_SOURCED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("Planner 26 rejects connection-coordinate drift from the qualified ingress graph", () => {
  const forged = mutableClone();
  (forged.connectionNode as { lat: number }).lat += 0.0001;

  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([forged]),
    /connection node drifted from versioned OSM node provenance/,
  );
});

test("Planner 26 rejects exact source-way neighborhood drift", () => {
  const forged = mutableClone();
  (forged.sourceWayNeighborhoodNodeIds as unknown as string[]).reverse();

  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([forged]),
    /exact Front Street source-way neighborhood drifted/,
  );
});

test("Planner 26 rejects candidate node-version drift even when the live node URL still matches", () => {
  const forged = mutableClone();
  const previous = forged.adjacentJunctionCandidates[0] as unknown as {
    node: { sourceVersion: number; sourceVersionUrl: string };
  };
  previous.node.sourceVersion = 3;
  previous.node.sourceVersionUrl =
    "https://api.openstreetmap.org/api/0.6/node/1619736626/3";

  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([forged]),
    /previous adjacent node drifted from versioned OSM node provenance/,
  );
});

test("Planner 26 rejects adjacent connector evidence drift without turning names into selection policy", () => {
  const forged = mutableClone();
  const previous = forged.adjacentJunctionCandidates[0] as unknown as {
    connectorName: string | null;
  };
  previous.connectorName = "Renamed Path";

  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([forged]),
    /previous adjacent junction evidence drifted/,
  );
});

test("Planner 26 runtime boundary rejects hidden aliases and RouteEdge field smuggling", () => {
  const hiddenAlias = mutableClone() as InteriorFrontStreetGeometryAuthority & {
    exactSegmentDistanceMeters?: number;
  };
  Object.defineProperty(hiddenAlias, "exactSegmentDistanceMeters", {
    value: 7,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([hiddenAlias]),
    /cannot contain unknown field exactSegmentDistanceMeters/,
  );

  const routeField = {
    ...mutableClone(),
    distanceMeters: 7,
  } as unknown as InteriorFrontStreetGeometryAuthority;
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([routeField]),
    /cannot contain unknown field distanceMeters|cannot materialize Planner RouteEdge field distanceMeters/,
  );
});

test("Planner 26 validates the outer authority collection as an exact ordinary array", () => {
  const decorated = [mutableClone()] as unknown as InteriorFrontStreetGeometryAuthority[] & {
    distanceMeters?: number;
  };
  Object.defineProperty(decorated, "distanceMeters", {
    value: 7,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity(decorated),
    /geometry authority collection cannot contain extra own properties/,
  );

  const symbolDecorated = [mutableClone()];
  Object.defineProperty(symbolDecorated, Symbol("distanceMeters"), {
    value: 7,
    enumerable: false,
  });
  assert.throws(
    () =>
      assertInteriorFrontStreetGeometryAuthorityIntegrity(
        symbolDecorated,
      ),
    /geometry authority collection cannot contain extra own properties/,
  );

  const arrayLike = {
    0: mutableClone(),
    length: 1,
  } as unknown as readonly InteriorFrontStreetGeometryAuthority[];
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity(arrayLike),
    /geometry authority collection must be an ordinary array of length 1/,
  );
});

test("Planner 26 nested arrays reject extra named or symbol properties", () => {
  const extraArrayField = mutableClone();
  const neighborhood = extraArrayField.sourceWayNeighborhoodNodeIds as unknown as string[] & {
    distanceMeters?: number;
  };
  neighborhood.distanceMeters = 7;
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([extraArrayField]),
    /source-way neighborhood cannot contain extra own properties/,
  );

  const symbolField = mutableClone();
  const candidates = symbolField.adjacentJunctionCandidates as unknown as object;
  Object.defineProperty(candidates, Symbol("routeEdge"), {
    value: true,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([symbolField]),
    /adjacent-junction candidates cannot contain extra own properties/,
  );
});

test("Planner 26 requires complete canonical OSM provenance URLs", () => {
  const wayQuery = mutableClone();
  (wayQuery as { sourceWayVersionUrl: string }).sourceWayVersionUrl += "?download=1";
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([wayQuery]),
    /Front Street source-way provenance is malformed/,
  );

  const nodeCredentials = mutableClone();
  (nodeCredentials.connectionNode as { sourceVersionUrl: string }).sourceVersionUrl =
    "https://user@api.openstreetmap.org/api/0.6/node/7053320515/1";
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([nodeCredentials]),
    /connection node drifted from versioned OSM node provenance/,
  );

  const nodePort = mutableClone();
  const previousNode = nodePort.adjacentJunctionCandidates[0].node as {
    sourceVersionUrl: string;
  };
  previousNode.sourceVersionUrl =
    "https://api.openstreetmap.org:444/api/0.6/node/1619736626/2";
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([nodePort]),
    /previous adjacent node drifted from versioned OSM node provenance/,
  );

  const connectorFragment = mutableClone();
  const previousConnector = connectorFragment.adjacentJunctionCandidates[0] as {
    connectorWayVersionUrl: string;
  };
  previousConnector.connectorWayVersionUrl += "#fragment";
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([connectorFragment]),
    /previous adjacent junction evidence drifted/,
  );
});

test("Planner 26 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  assert.equal(Object.isFrozen(INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.connectionNode), true);
  assert.equal(Object.isFrozen(authority.sourceWayNeighborhoodNodeIds), true);
  assert.equal(Object.isFrozen(authority.adjacentJunctionCandidates), true);
  assert.equal(Object.isFrozen(authority.adjacentJunctionCandidates[0]), true);
  assert.equal(Object.isFrozen(authority.adjacentJunctionCandidates[0].node), true);

  const assessment = assessInteriorFrontStreetGeometry();
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.candidateEndpointNodeIds), true);
  assert.equal(Object.isFrozen(assessment.sourceWayNeighborhoodNodeIds), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
