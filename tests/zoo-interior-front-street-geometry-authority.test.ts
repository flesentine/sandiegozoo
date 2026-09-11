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
    endpointNode: { ...source.endpointNode },
    sourceWaySliceNodeIds: [...source.sourceWaySliceNodeIds],
    adjacentJunctionCandidates: source.adjacentJunctionCandidates.map(
      (candidate) => ({ ...candidate }),
    ),
  } as unknown as InteriorFrontStreetGeometryAuthority;
}

test("Planner 26 captures the exact Front Street geometry boundary from the Planner 25 seed", () => {
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
  assert.deepEqual(authority.sourceWaySliceNodeIds, [
    "1619736626",
    "7053320515",
  ]);
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
  assert.deepEqual(
    [authority.endpointNode.sourceObjectId, authority.endpointNode.lat, authority.endpointNode.lng],
    ["1619736626", 32.735201, -117.1496375],
  );
});

test("Planner 26 selects the nearest adjacent named pedestrian junction without hiding the unnamed alternative", () => {
  const authority = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  const [named, unnamed] = authority.adjacentJunctionCandidates;

  assert.equal(
    authority.endpointSelectionRule,
    "nearest-adjacent-node-with-distinct-named-pedestrian-connector",
  );
  assert.deepEqual(
    [named.nodeId, named.connectorWayId, named.connectorName, named.namedPedestrianConnector],
    ["1619736626", "148910139", "Treetops Way", true],
  );
  assert.deepEqual(
    [unnamed.nodeId, unnamed.connectorWayId, unnamed.connectorName, unnamed.namedPedestrianConnector],
    ["6239154982", "666404421", null, false],
  );
});

test("Planner 26 source tags remain geometry context rather than RouteEdge semantics", () => {
  const authority = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];

  assert.deepEqual(
    [authority.highwayTag, authority.name, authority.footTag, authority.feeTag, authority.surfaceTag],
    ["pedestrian", "Front Street", "customers", "yes", "asphalt"],
  );
  assert.equal(authority.plannerMaterialization, "geometry-only");
  for (const field of ROUTE_EDGE_FIELDS) {
    assert.equal(field in authority, false);
  }
});

test("Planner 26 clears only geometry and endpoint blockers and keeps every remaining RouteEdge semantic blocked", () => {
  assert.deepEqual(assessInteriorFrontStreetGeometry(), {
    status: "geometry-ready",
    authorityId: "sdz-interior-front-street-first-junction-geometry",
    sourceWayId: "1481425058",
    connectionNodeId: "7053320515",
    endpointNodeId: "1619736626",
    endpointConnectorWayId: "148910139",
    sourceWaySliceNodeIds: ["1619736626", "7053320515"],
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
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
    /connection-node coordinates drifted from qualified ingress geometry/,
  );
});

test("Planner 26 rejects endpoint or exact source-way-slice drift", () => {
  const endpointDrift = mutableClone();
  (endpointDrift.endpointNode as { sourceObjectId: string }).sourceObjectId = "6239154982";
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([endpointDrift]),
    /selected endpoint or exact Front Street source-way slice drifted/,
  );

  const sliceDrift = mutableClone();
  (sliceDrift.sourceWaySliceNodeIds as unknown as string[]).reverse();
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([sliceDrift]),
    /selected endpoint or exact Front Street source-way slice drifted/,
  );
});

test("Planner 26 rejects loss of the named Treetops Way junction evidence", () => {
  const forged = mutableClone();
  const named = forged.adjacentJunctionCandidates[0] as {
    connectorName: string | null;
    namedPedestrianConnector: boolean;
  };
  named.connectorName = null;
  named.namedPedestrianConnector = false;

  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([forged]),
    /named Treetops Way junction evidence drifted/,
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

test("Planner 26 nested arrays reject extra named or symbol properties", () => {
  const extraArrayField = mutableClone();
  const slice = extraArrayField.sourceWaySliceNodeIds as unknown as string[] & {
    distanceMeters?: number;
  };
  slice.distanceMeters = 7;
  assert.throws(
    () => assertInteriorFrontStreetGeometryAuthorityIntegrity([extraArrayField]),
    /source-way slice cannot contain extra own properties/,
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

test("Planner 26 authority and assessment are deeply immutable", () => {
  const authority = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
  assert.equal(Object.isFrozen(INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY), true);
  assert.equal(Object.isFrozen(authority), true);
  assert.equal(Object.isFrozen(authority.connectionNode), true);
  assert.equal(Object.isFrozen(authority.endpointNode), true);
  assert.equal(Object.isFrozen(authority.sourceWaySliceNodeIds), true);
  assert.equal(Object.isFrozen(authority.adjacentJunctionCandidates), true);
  assert.equal(Object.isFrozen(authority.adjacentJunctionCandidates[0]), true);

  const assessment = assessInteriorFrontStreetGeometry();
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(Object.isFrozen(assessment.sourceWaySliceNodeIds), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
  assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
});
