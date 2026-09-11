import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY,
  INTERIOR_PEDESTRIAN_DIRECTION_POLICY,
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
  assessInteriorPedestrianDirection,
  assertInteriorPedestrianDirectionAuthorityIntegrity,
  assertInteriorPedestrianDirectionPolicyIntegrity,
  assertInteriorPedestrianDirectionSourceSnapshotIntegrity,
  interiorPedestrianDirectionForObjective,
  type InteriorPedestrianDirectionAuthority,
  type InteriorPedestrianDirectionPolicy,
  type InteriorPedestrianDirectionSourceSnapshot,
} from "../src/data/zooInteriorPedestrianDirectionAuthority.ts";
import {
  PEDESTRIAN_DIRECTION_RESOLUTION_POLICY,
} from "../src/data/zooIngressPedestrianDirectionResolution.ts";
import {
  INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY,
} from "../src/data/zooInteriorObjectiveSegmentDistanceAuthority.ts";

function mutableSnapshot() {
  const source = INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
  return {
    ...source,
    sourceTagKeys: [...source.sourceTagKeys],
    sourceTags: { ...source.sourceTags },
  } as unknown as InteriorPedestrianDirectionSourceSnapshot;
}

function mutablePolicy() {
  const source = INTERIOR_PEDESTRIAN_DIRECTION_POLICY;
  return {
    ...source,
    semanticReferenceUrls: [...source.semanticReferenceUrls],
  } as unknown as InteriorPedestrianDirectionPolicy;
}

function mutableAuthority() {
  return {
    ...INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY[0],
  } as unknown as InteriorPedestrianDirectionAuthority;
}

test("Planner 29 freezes the complete exact Front Street v1 tag snapshot", () => {
  const snapshot = INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;

  assert.equal(snapshot.sourceWayId, "1481425058");
  assert.equal(snapshot.sourceWayVersion, 1);
  assert.equal(
    snapshot.sourceWayVersionUrl,
    "https://api.openstreetmap.org/api/0.6/way/1481425058/1",
  );
  assert.equal(snapshot.sourceWayTimestamp, "2026-02-21T14:47:49Z");
  assert.equal(snapshot.sourceWayChangeset, 178862584);
  assert.deepEqual(snapshot.sourceTagKeys, [
    "fee",
    "foot",
    "highway",
    "name",
    "surface",
    "tiger:cfcc",
    "tiger:county",
  ]);
  assert.deepEqual(snapshot.sourceTags, {
    fee: "yes",
    foot: "customers",
    highway: "pedestrian",
    name: "Front Street",
    surface: "asphalt",
    "tiger:cfcc": "A51",
    "tiger:county": "San Diego, CA",
  });
});

test("Planner 29 records explicit absence of generic and pedestrian one-way tags", () => {
  const snapshot = INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;

  assert.equal(snapshot.onewayTag, null);
  assert.equal(snapshot.onewayFootTag, null);
  assert.equal("oneway" in snapshot.sourceTags, false);
  assert.equal("oneway:foot" in snapshot.sourceTags, false);
});

test("Planner 29 creates a new interior scope instead of widening Planner 21", () => {
  assert.equal(
    PEDESTRIAN_DIRECTION_RESOLUTION_POLICY.scope,
    "highway-pedestrian-ingress-ways",
  );
  assert.equal(
    INTERIOR_PEDESTRIAN_DIRECTION_POLICY.scope,
    "highway-pedestrian-interior-exact-segments",
  );
  assert.notEqual(
    INTERIOR_PEDESTRIAN_DIRECTION_POLICY.id,
    PEDESTRIAN_DIRECTION_RESOLUTION_POLICY.id,
  );
  assert.equal(
    INTERIOR_PEDESTRIAN_DIRECTION_POLICY.pedestrianOneWayAuthority,
    "explicit-oneway-foot-only",
  );
  assert.equal(
    INTERIOR_PEDESTRIAN_DIRECTION_POLICY.absentExplicitPedestrianRestriction,
    "bidirectional-by-default",
  );
});

test("Planner 29 resolves the exact Tiger Trail segment as static baseline bidirectional", () => {
  const direction = INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY[0];
  const distance = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0];

  assert.equal(direction.objectiveSourceRecordId, "sdz-tiger-trail");
  assert.equal(direction.distanceAuthorityId, distance.id);
  assert.equal(direction.sourceWayId, distance.sourceWayId);
  assert.equal(direction.sourceFromNodeId, distance.sourceFromNodeId);
  assert.equal(direction.sourceToNodeId, distance.sourceToNodeId);
  assert.equal(direction.oneWay, false);
  assert.equal(direction.direction, "bidirectional");
  assert.equal(direction.directionScope, "static-osm-baseline");
  assert.equal(direction.sourceWayOrderRole, "geometry-only-not-direction-authority");
  assert.equal(direction.selectionScope, "objective-only");
  assert.equal(direction.globalEndpointSelection, "unresolved");
});

test("Planner 29 clears pedestrian direction only", () => {
  assert.deepEqual(assessInteriorPedestrianDirection("sdz-tiger-trail"), {
    status: "direction-ready",
    objectiveSourceRecordId: "sdz-tiger-trail",
    sourceFromNodeId: "7053320515",
    sourceToNodeId: "1619736626",
    oneWay: false,
    direction: "bidirectional",
    directionScope: "static-osm-baseline",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [
        "EXACT_SEGMENT_MODE_NOT_SOURCED",
        "EXACT_SEGMENT_DURATION_NOT_SOURCED",
        "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
        "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
      ],
    },
  });
});

test("other objectives cannot inherit Tiger Trail pedestrian direction authority", () => {
  for (const objectiveSourceRecordId of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(
      interiorPedestrianDirectionForObjective(objectiveSourceRecordId),
      undefined,
    );
    assert.deepEqual(assessInteriorPedestrianDirection(objectiveSourceRecordId), {
      status: "blocked",
      reason: "OBJECTIVE_PEDESTRIAN_DIRECTION_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }
});

test("Planner 29 rejects invented one-way tags that were absent from exact OSM v1", () => {
  const generic = mutableSnapshot() as unknown as {
    onewayTag: string | null;
  };
  generic.onewayTag = "yes";
  assert.throws(
    () =>
      assertInteriorPedestrianDirectionSourceSnapshotIntegrity(
        generic as unknown as InteriorPedestrianDirectionSourceSnapshot,
      ),
    /direction source snapshot drifted from exact OSM way v1 evidence/,
  );

  const foot = mutableSnapshot() as unknown as {
    onewayFootTag: string | null;
  };
  foot.onewayFootTag = "yes";
  assert.throws(
    () =>
      assertInteriorPedestrianDirectionSourceSnapshotIntegrity(
        foot as unknown as InteriorPedestrianDirectionSourceSnapshot,
      ),
    /direction source snapshot drifted from exact OSM way v1 evidence/,
  );
});

test("Planner 29 rejects one-way tags smuggled into the supposedly complete source tag set", () => {
  const forged = mutableSnapshot();
  (forged.sourceTags as unknown as Record<string, string>)["oneway:foot"] = "yes";

  assert.throws(
    () => assertInteriorPedestrianDirectionSourceSnapshotIntegrity(forged),
    /complete source tag set cannot contain unknown field oneway:foot/,
  );
});

test("Planner 29 rejects source tag-key and metadata drift", () => {
  const keys = mutableSnapshot();
  (keys.sourceTagKeys as unknown as string[])[0] = "access";
  assert.throws(
    () => assertInteriorPedestrianDirectionSourceSnapshotIntegrity(keys),
    /source tag-key list drifted from the complete OSM tag set/,
  );

  const changeset = mutableSnapshot() as unknown as {
    sourceWayChangeset: number;
  };
  changeset.sourceWayChangeset = 1;
  assert.throws(
    () =>
      assertInteriorPedestrianDirectionSourceSnapshotIntegrity(
        changeset as unknown as InteriorPedestrianDirectionSourceSnapshot,
      ),
    /direction source snapshot drifted from exact OSM way v1 evidence/,
  );
});

test("Planner 29 policy integrity rejects ingress-scope or semantic-rule drift", () => {
  const scope = mutablePolicy() as unknown as { scope: string };
  scope.scope = "highway-pedestrian-ingress-ways";
  assert.throws(
    () =>
      assertInteriorPedestrianDirectionPolicyIntegrity(
        scope as unknown as InteriorPedestrianDirectionPolicy,
      ),
    /policy drifted from the frozen policy boundary|must not silently reuse/,
  );

  const rule = mutablePolicy() as unknown as {
    absentExplicitPedestrianRestriction: string;
  };
  rule.absentExplicitPedestrianRestriction = "one-way-by-source-order";
  assert.throws(
    () =>
      assertInteriorPedestrianDirectionPolicyIntegrity(
        rule as unknown as InteriorPedestrianDirectionPolicy,
      ),
    /policy drifted from the frozen policy boundary/,
  );
});

test("Planner 29 direction authority rejects source-order and endpoint drift", () => {
  const order = mutableAuthority() as unknown as { sourceWayOrderRole: string };
  order.sourceWayOrderRole = "with-source-way-order";
  assert.throws(
    () =>
      assertInteriorPedestrianDirectionAuthorityIntegrity([
        order as unknown as InteriorPedestrianDirectionAuthority,
      ]),
    /direction authority drifted from the frozen exact-segment contract/,
  );

  const endpoint = mutableAuthority() as unknown as { sourceToNodeId: string };
  endpoint.sourceToNodeId = "6239154982";
  assert.throws(
    () =>
      assertInteriorPedestrianDirectionAuthorityIntegrity([
        endpoint as unknown as InteriorPedestrianDirectionAuthority,
      ]),
    /direction authority drifted from the frozen exact-segment contract|detached from Planner 28/,
  );
});

test("Planner 29 runtime boundaries reject hidden aliases and unrelated RouteEdge semantics", () => {
  const hiddenSnapshot = mutableSnapshot() as InteriorPedestrianDirectionSourceSnapshot & {
    durationMinutes?: number;
  };
  Object.defineProperty(hiddenSnapshot, "durationMinutes", {
    value: 1,
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorPedestrianDirectionSourceSnapshotIntegrity(hiddenSnapshot),
    /direction source snapshot cannot contain unknown field durationMinutes/,
  );

  const routeField = {
    ...mutableAuthority(),
    distanceMeters: 7.157,
  } as unknown as InteriorPedestrianDirectionAuthority;
  assert.throws(
    () => assertInteriorPedestrianDirectionAuthorityIntegrity([routeField]),
    /cannot contain unknown field distanceMeters|cannot materialize routing field distanceMeters/,
  );
});

test("Planner 29 exact arrays reject symbol and named aliases", () => {
  const snapshot = mutableSnapshot();
  Object.defineProperty(
    snapshot.sourceTagKeys as unknown as object,
    Symbol("oneway"),
    { value: "yes" },
  );
  assert.throws(
    () => assertInteriorPedestrianDirectionSourceSnapshotIntegrity(snapshot),
    /source tag-key list cannot contain extra own properties/,
  );

  const policy = mutablePolicy();
  (policy.semanticReferenceUrls as unknown as string[] & { mode?: string }).mode =
    "walk";
  assert.throws(
    () => assertInteriorPedestrianDirectionPolicyIntegrity(policy),
    /semantic-reference list cannot contain extra own properties/,
  );
});

test("Planner 29 authority collection is exact and all exports are deeply immutable", () => {
  const decorated = [mutableAuthority()] as unknown as InteriorPedestrianDirectionAuthority[] & {
    mode?: string;
  };
  Object.defineProperty(decorated, "mode", {
    value: "walk",
    enumerable: false,
  });
  assert.throws(
    () => assertInteriorPedestrianDirectionAuthorityIntegrity(decorated),
    /direction authority collection cannot contain extra own properties/,
  );

  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT), true);
  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTagKeys), true);
  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT.sourceTags), true);
  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_DIRECTION_POLICY), true);
  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_DIRECTION_POLICY.semanticReferenceUrls), true);
  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY), true);
  assert.equal(Object.isFrozen(INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY[0]), true);

  const assessment = assessInteriorPedestrianDirection("sdz-tiger-trail");
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "direction-ready") {
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization), true);
    assert.equal(Object.isFrozen(assessment.exactSegmentMaterialization.reasons), true);
  }
});
