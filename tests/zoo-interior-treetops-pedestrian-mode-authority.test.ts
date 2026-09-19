import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY,
  INTERIOR_TREETOPS_PEDESTRIAN_MODE_POLICY,
  assessInteriorTreetopsPedestrianMode,
  assertInteriorTreetopsPedestrianModeAuthorityIntegrity,
  assertInteriorTreetopsPedestrianModePolicyIntegrity,
  interiorTreetopsPedestrianModeForObjective,
  type InteriorTreetopsPedestrianModeAuthority,
  type InteriorTreetopsPedestrianModePolicy,
} from "../src/data/zooInteriorTreetopsPedestrianModeAuthority.ts";
import { INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY } from "../src/data/zooInteriorTreetopsV7GeometryAuthority.ts";
import { INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY } from "../src/data/zooInteriorTreetopsHistoricalTopologyAuthority.ts";

function mutablePolicy(): InteriorTreetopsPedestrianModePolicy {
  return { ...INTERIOR_TREETOPS_PEDESTRIAN_MODE_POLICY };
}

function mutableAuthority(): InteriorTreetopsPedestrianModeAuthority {
  return { ...INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0] };
}

test("Planner 45 qualifies walk mode from the exact Treetops v7 footway source", () => {
  const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
  const mode = INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0];

  assert.equal(geometry.sourceWayId, "148910139");
  assert.equal(geometry.sourceWayVersion, 7);
  assert.equal(geometry.sourceWayTimestamp, "2026-02-21T20:28:40Z");
  assert.equal(geometry.sourceHighway, "footway");
  assert.equal(mode.mode, "walk");
  assert.equal(mode.resolutionBasis, "osm-highway-footway");
  assert.equal(mode.sourceHighwayTag, "footway");
});

test("Planner 45 is attached to the exact Planner 44 anchor-to-junction segment", () => {
  const topology = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
  const mode = INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0];

  assert.equal(mode.topologyAuthorityId, topology.id);
  assert.equal(mode.sourceWayId, topology.segmentProvenance.sourceWayId);
  assert.equal(mode.sourceWayVersion, topology.segmentProvenance.sourceWayVersion);
  assert.equal(mode.sourceFromNodeId, topology.segmentProvenance.fromNodeId);
  assert.equal(mode.sourceToNodeId, topology.segmentProvenance.toNodeId);
  assert.equal(mode.sourceFromTreetopsIndex, topology.segmentProvenance.fromTreetopsIndex);
  assert.equal(mode.sourceToTreetopsIndex, topology.segmentProvenance.toTreetopsIndex);
  assert.equal(topology.segmentProvenance.provenanceStatus, "captured");
});

test("Planner 45 policy keeps footway mode separate from operational eligibility", () => {
  assert.deepEqual(
    {
      scope: INTERIOR_TREETOPS_PEDESTRIAN_MODE_POLICY.scope,
      modeAuthority: INTERIOR_TREETOPS_PEDESTRIAN_MODE_POLICY.modeAuthority,
      supportedMode: INTERIOR_TREETOPS_PEDESTRIAN_MODE_POLICY.supportedMode,
      sourceMeaning: INTERIOR_TREETOPS_PEDESTRIAN_MODE_POLICY.sourceMeaning,
      accessRole: INTERIOR_TREETOPS_PEDESTRIAN_MODE_POLICY.accessRole,
    },
    {
      scope: "version-pinned-highway-footway-exact-segments",
      modeAuthority: "osm-highway-footway",
      supportedMode: "walk",
      sourceMeaning: "mainly-or-exclusively-pedestrians",
      accessRole: "mode-classification-not-operational-eligibility",
    },
  );
  assert.equal(INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0].operationalEligibility, "unresolved");
});

test("Planner 45 clears pedestrian mode only", () => {
  assert.deepEqual(assessInteriorTreetopsPedestrianMode("sdz-tiger-trail"), {
    status: "mode-ready",
    authorityId: "sdz-interior-treetops-anchor-to-fern-canyon-mode",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceWayId: "148910139",
    sourceWayVersion: 7,
    sourceFromNodeId: "1619736626",
    sourceToNodeId: "13588159626",
    mode: "walk",
    operationalEligibility: "unresolved",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_DISTANCE_NOT_QUALIFIED",
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

test("Planner 45 does not leak the Treetops mode to other objectives", () => {
  for (const objective of ["sdz-koala-outback", "sdz-gorilla-tropics", "unknown-objective"]) {
    assert.equal(interiorTreetopsPedestrianModeForObjective(objective), undefined);
    assert.deepEqual(assessInteriorTreetopsPedestrianMode(objective), {
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_PEDESTRIAN_MODE_NOT_SOURCED",
      objectiveSourceRecordId: objective,
    });
  }
});

test("Planner 45 authority rejects route semantics outside mode ownership", () => {
  for (const field of [
    "distanceMeters",
    "durationMinutes",
    "oneWay",
    "difficulty",
    "stairs",
    "accessible",
    "stroller",
    "status",
    "routeNodeId",
    "routeEdgeId",
  ]) {
    const forged = mutableAuthority() as unknown as Record<string, unknown>;
    forged[field] = field === "distanceMeters" ? 25 : "forged";
    assert.throws(
      () =>
        assertInteriorTreetopsPedestrianModeAuthorityIntegrity([
          forged as unknown as InteriorTreetopsPedestrianModeAuthority,
        ]),
      new RegExp(`unknown field ${field}`),
    );
  }
});

test("Planner 45 policy and authority reject drift", () => {
  const policy = mutablePolicy() as unknown as Record<string, unknown>;
  policy.supportedMode = "tram";
  assert.throws(
    () =>
      assertInteriorTreetopsPedestrianModePolicyIntegrity(
        policy as unknown as InteriorTreetopsPedestrianModePolicy,
      ),
    /supportedMode drifted/,
  );

  const authority = mutableAuthority() as unknown as Record<string, unknown>;
  authority.sourceWayVersion = 8;
  assert.throws(
    () =>
      assertInteriorTreetopsPedestrianModeAuthorityIntegrity([
        authority as unknown as InteriorTreetopsPedestrianModeAuthority,
      ]),
    /sourceWayVersion drifted/,
  );
});

test("Planner 45 rejects accessors without executing them", () => {
  const authority = mutableAuthority() as unknown as Record<string, unknown>;
  let reads = 0;
  Object.defineProperty(authority, "mode", {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return "walk";
    },
  });
  assert.throws(
    () =>
      assertInteriorTreetopsPedestrianModeAuthorityIntegrity([
        authority as unknown as InteriorTreetopsPedestrianModeAuthority,
      ]),
    /requires enumerable own data field mode/,
  );
  assert.equal(reads, 0);
});

test("Planner 45 rejects Proxy-backed policy and authority records without get traps", () => {
  let policyReads = 0;
  const policy = new Proxy(mutablePolicy(), {
    get(target, property, receiver) {
      policyReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => assertInteriorTreetopsPedestrianModePolicyIntegrity(policy),
    /Proxy-backed/,
  );
  assert.equal(policyReads, 0);

  let authorityReads = 0;
  const authority = new Proxy(mutableAuthority(), {
    get(target, property, receiver) {
      authorityReads += 1;
      return Reflect.get(target, property, receiver);
    },
  });
  assert.throws(
    () => assertInteriorTreetopsPedestrianModeAuthorityIntegrity([authority]),
    /Proxy-backed/,
  );
  assert.equal(authorityReads, 0);
});

test("Planner 45 rejects branded exotic records after prototype reassignment", () => {
  const branded = new Date(0) as unknown as Record<string, unknown>;
  Object.setPrototypeOf(branded, Object.prototype);
  for (const [key, value] of Object.entries(mutableAuthority() as unknown as Record<string, unknown>)) {
    branded[key] = value;
  }

  assert.throws(
    () =>
      assertInteriorTreetopsPedestrianModeAuthorityIntegrity([
        branded as unknown as InteriorTreetopsPedestrianModeAuthority,
      ]),
    /structured clone must be a plain object/,
  );
});

test("Planner 45 exports and assessments are deeply immutable", () => {
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_PEDESTRIAN_MODE_POLICY), true);
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0]), true);

  const assessment = assessInteriorTreetopsPedestrianMode("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "mode-ready") {
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion), true);
    assert.equal(Object.isFrozen(assessment.routeGraphExpansion.reasons), true);
  }
});
