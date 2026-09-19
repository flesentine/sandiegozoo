import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY,
  assessInteriorTreetopsSegmentDistance,
  sanitizeInteriorTreetopsSegmentDistanceAuthorities,
  deriveInteriorTreetopsSegmentDistanceMeters,
  interiorTreetopsSegmentDistanceForObjective,
  type InteriorTreetopsSegmentDistanceAuthority,
} from "../src/data/zooInteriorTreetopsSegmentDistanceAuthority.ts";
import { INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY } from "../src/data/zooInteriorTreetopsV7GeometryAuthority.ts";
import { INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY } from "../src/data/zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import { INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY } from "../src/data/zooInteriorTreetopsPedestrianModeAuthority.ts";

function mutableAuthority(): InteriorTreetopsSegmentDistanceAuthority {
  const record = INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0];
  return {
    ...record,
    sourceNodeIds: [...record.sourceNodeIds],
  };
}

test("Planner 46 derives the exact six-leg Treetops polyline distance", () => {
  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  const nodeIds = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0].segmentProvenance.orderedNodeIds;
  const nodes = nodeIds.map((id) => {
    const node = geometry.nodes.find((candidate) => candidate.sourceObjectId === id);
    assert.ok(node);
    return node;
  });

  assert.equal(nodeIds.length, 7);
  assert.equal(deriveInteriorTreetopsSegmentDistanceMeters(nodes), 48.615);
  assert.equal(INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0].distanceMeters, 48.615);
});

test("Planner 46 uses the ordered polyline rather than an endpoint shortcut", () => {
  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  const nodeIds = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0].segmentProvenance.orderedNodeIds;
  const nodes = nodeIds.map((id) => {
    const node = geometry.nodes.find((candidate) => candidate.sourceObjectId === id);
    assert.ok(node);
    return node;
  });
  const endpointOnly = deriveInteriorTreetopsSegmentDistanceMeters([nodes[0], nodes[nodes.length - 1]]);
  assert.notEqual(endpointOnly, 48.615);
  assert.ok(endpointOnly < 48.615);
});

test("Planner 46 remains attached to Planner 43 geometry, Planner 44 provenance, and Planner 45 mode", () => {
  const distance = INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0];
  const topology = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  const mode = INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0];

  assert.equal(distance.geometryAuthorityId, INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0].id);
  assert.equal(distance.topologyAuthorityId, topology.id);
  assert.equal(distance.modeAuthorityId, mode.id);
  assert.deepEqual(distance.sourceNodeIds, topology.segmentProvenance.orderedNodeIds);
  assert.equal(distance.sourceFromNodeId, mode.sourceFromNodeId);
  assert.equal(distance.sourceToNodeId, mode.sourceToNodeId);
  assert.equal(mode.mode, "walk");
});

test("Planner 46 clears distance only", () => {
  assert.deepEqual(assessInteriorTreetopsSegmentDistance("sdz-tiger-trail"), {
    status: "distance-ready",
    authorityId: "sdz-interior-treetops-anchor-to-fern-canyon-distance",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "148910139",
    sourceWayVersion: 7,
    sourceFromNodeId: "1619736626",
    sourceToNodeId: "13588159626",
    sourceNodeCount: 7,
    distanceMeters: 48.615,
    derivationMethod: "haversine-polyline-segment-sum",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "PEDESTRIAN_DIRECTION_NOT_QUALIFIED",
        "EXACT_SEGMENT_DURATION_NOT_QUALIFIED",
        "EXACT_SEGMENT_DIFFICULTY_NOT_QUALIFIED",
        "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
        "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
      ],
    },
  });
});

test("Planner 46 does not leak the Treetops distance to other objectives", () => {
  for (const objective of ["sdz-koala-outback", "sdz-gorilla-tropics", "unknown-objective"]) {
    assert.equal(interiorTreetopsSegmentDistanceForObjective(objective), undefined);
    assert.deepEqual(assessInteriorTreetopsSegmentDistance(objective), {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_SEGMENT_DISTANCE_NOT_SOURCED",
      objectiveSourceRecordId: objective,
    });
  }
});

test("Planner 46 rejects route semantics outside distance ownership", () => {
  for (const field of [
    "mode",
    "durationMinutes",
    "oneWay",
    "direction",
    "difficulty",
    "stairs",
    "accessible",
    "stroller",
    "status",
    "routeNodeId",
    "routeEdgeId",
  ]) {
    const forged = mutableAuthority() as unknown as Record<string, unknown>;
    forged[field] = "forged";
    assert.throws(
      () =>
        sanitizeInteriorTreetopsSegmentDistanceAuthorities([
          forged as unknown as InteriorTreetopsSegmentDistanceAuthority,
        ]),
      new RegExp(`unknown field ${field}|cannot own routing field ${field}`),
    );
  }
});

test("Planner 46 rejects frozen provenance and distance drift", () => {
  const nodeDrift = mutableAuthority();
  (nodeDrift.sourceNodeIds as string[])[3] = "forged-node";
  assert.throws(
    () => sanitizeInteriorTreetopsSegmentDistanceAuthorities([nodeDrift]),
    /source-node sequence drifted/,
  );

  const distanceDrift = mutableAuthority() as unknown as Record<string, unknown>;
  distanceDrift.distanceMeters = 48.616;
  assert.throws(
    () =>
      sanitizeInteriorTreetopsSegmentDistanceAuthorities([
        distanceDrift as unknown as InteriorTreetopsSegmentDistanceAuthority,
      ]),
    /distanceMeters drifted|distance drifted/,
  );
});

test("Planner 46 distance derivation rejects invalid coordinate sets", () => {
  assert.throws(
    () => deriveInteriorTreetopsSegmentDistanceMeters([]),
    /at least two coordinates/,
  );
  assert.throws(
    () =>
      deriveInteriorTreetopsSegmentDistanceMeters([
        { lat: 32.7, lng: -117.1 },
        { lat: Number.NaN, lng: -117.2 },
      ]),
    /valid finite coordinates/,
  );
  assert.throws(
    () =>
      deriveInteriorTreetopsSegmentDistanceMeters([
        { lat: 32.7, lng: -117.1 },
        { lat: 91, lng: -117.2 },
      ]),
    /valid finite coordinates/,
  );
});

test("Planner 46 rejects accessors without executing them", () => {
  const authority = mutableAuthority() as unknown as Record<string, unknown>;
  let reads = 0;
  Object.defineProperty(authority, "distanceMeters", {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return 48.615;
    },
  });
  assert.throws(
    () =>
      sanitizeInteriorTreetopsSegmentDistanceAuthorities([
        authority as unknown as InteriorTreetopsSegmentDistanceAuthority,
      ]),
    /requires enumerable own data field distanceMeters/,
  );
  assert.equal(reads, 0);
});

test("Planner 46 rejects Proxy-backed records and source-node arrays without get traps", () => {
  let recordReads = 0;
  const recordProxy = new Proxy(mutableAuthority(), {
    get(target, property, receiver) {
      recordReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => sanitizeInteriorTreetopsSegmentDistanceAuthorities([recordProxy]),
    /Proxy-backed/,
  );
  assert.equal(recordReads, 0);

  const nested = mutableAuthority();
  let nodeReads = 0;
  nested.sourceNodeIds = new Proxy([...nested.sourceNodeIds], {
    get(target, property, receiver) {
      nodeReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => sanitizeInteriorTreetopsSegmentDistanceAuthorities([nested]),
    /source-node (?:input )?sequence cannot be Proxy-backed/,
  );
  assert.equal(nodeReads, 0);
});

test("Planner 46 sanitizes branded exotics that structuredClone normalizes", () => {
  const branded = new AbortController() as unknown as Record<string, unknown>;
  Object.setPrototypeOf(branded, Object.prototype);
  for (const [key, value] of Object.entries(mutableAuthority() as unknown as Record<string, unknown>)) {
    branded[key] = key === "sourceNodeIds" ? [...(value as readonly string[])] : value;
  }

  const sanitized = sanitizeInteriorTreetopsSegmentDistanceAuthorities([
    branded as unknown as InteriorTreetopsSegmentDistanceAuthority,
  ]);

  assert.notEqual(sanitized[0], branded);
  assert.equal(Object.getPrototypeOf(sanitized[0]), Object.prototype);
  assert.deepEqual(sanitized[0], INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0]);
  assert.equal(Object.isFrozen(sanitized), true);
  assert.equal(Object.isFrozen(sanitized[0]), true);
  assert.equal(Object.isFrozen(sanitized[0].sourceNodeIds), true);
});

test("Planner 46 still rejects branded exotics that structuredClone preserves", () => {
  const branded = new Date(0) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(branded, Object.prototype);
  for (const [key, value] of Object.entries(mutableAuthority() as unknown as Record<string, unknown>)) {
    branded[key] = value;
  }
  assert.throws(
    () =>
      sanitizeInteriorTreetopsSegmentDistanceAuthorities([
        branded as unknown as InteriorTreetopsSegmentDistanceAuthority,
      ]),
    /must be a plain object/,
  );
});

test("Planner 46 exports and assessments are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0]), true);
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0].sourceNodeIds), true);

  const assessment = assessInteriorTreetopsSegmentDistance("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "distance-ready") {
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
  }
});
