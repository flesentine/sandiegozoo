import assert from "node:assert/strict";
import test from "node:test";
import {
  PEDESTRIAN_DIRECTION_RESOLUTION_POLICY,
  assertIngressPedestrianDirectionResolutionIntegrity,
  assertPedestrianDirectionResolutionPolicyIntegrity,
  resolveIngressPedestrianDirection,
  resolvePedestrianDirectionWithPolicy,
  type PedestrianDirectionResolutionPolicy,
} from "../src/data/zooIngressPedestrianDirectionResolution.ts";

test("Planner 21 freezes the pedestrian direction interpretation policy", () => {
  assert.deepEqual(
    PEDESTRIAN_DIRECTION_RESOLUTION_POLICY,
    {
      id:
        "sdz-pedestrian-direction-resolution-policy-v1",
      policyVersion: "1",
      adoptedAt:
        "2026-09-09T09:04:00-07:00",
      scope:
        "highway-pedestrian-ingress-ways",
      genericOnewayOnPedestrianWay:
        "vehicle-only-unless-explicit-foot-direction",
      noPedestrianDirectionRestriction:
        "bidirectional-by-default",
      explicitPedestrianDirection:
        "planner-16-authoritative",
      authority:
        "prospective-osm-interpretation-policy",
      semanticReferenceUrls: [
        "https://wiki.openstreetmap.org/wiki/Key:oneway",
        "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
      ],
    },
  );
});

test("generic oneway=yes on current highway=pedestrian passage resolves to pedestrian bidirectional", () => {
  assert.deepEqual(
    resolveIngressPedestrianDirection(
      "755054695",
    ),
    {
      status: "supported",
      sourceWayId: "755054695",
      sourceSnapshotId:
        "sdz-pedestrian-direction-way-755054695",
      oneWay: false,
      direction: "bidirectional",
      basis:
        "Planner 21 generic oneway on highway=pedestrian is vehicle-only",
      policyId:
        "sdz-pedestrian-direction-resolution-policy-v1",
      resolutionCase:
        "generic-oneway-vehicle-only",
    },
  );
});

test("current highway=pedestrian continuation without explicit direction resolves bidirectional", () => {
  assert.deepEqual(
    resolveIngressPedestrianDirection(
      "755054694",
    ),
    {
      status: "supported",
      sourceWayId: "755054694",
      sourceSnapshotId:
        "sdz-pedestrian-direction-way-755054694",
      oneWay: false,
      direction: "bidirectional",
      basis:
        "Planner 21 default pedestrian bidirectionality absent explicit restriction",
      policyId:
        "sdz-pedestrian-direction-resolution-policy-v1",
      resolutionCase:
        "no-explicit-pedestrian-restriction",
    },
  );
});

test("explicit Planner 16 direction remains authoritative inside Planner 21 scope", () => {
  const resolved =
    resolvePedestrianDirectionWithPolicy(
      "pedestrian",
      {
        id: "synthetic-explicit",
        targetId:
          "sdz-geo-main-entrance",
        sourceWayId:
          "synthetic-way",
        sourceUrl:
          "https://www.openstreetmap.org/way/synthetic-way",
        observedAt:
          "2026-09-09T09:04:00-07:00",
        sourceTags: {
          highway: "pedestrian",
          "oneway:foot": "yes",
        },
        plannerMaterialization:
          "pedestrian-direction-authority-only",
      },
      {
        status: "supported",
        sourceWayId:
          "synthetic-way",
        sourceSnapshotId:
          "synthetic-explicit",
        oneWay: true,
        direction:
          "with-source-way-order",
        basis:
          "OSM oneway:foot=yes",
      },
    );

  assert.deepEqual(resolved, {
    status: "supported",
    sourceWayId:
      "synthetic-way",
    sourceSnapshotId:
      "synthetic-explicit",
    oneWay: true,
    direction:
      "with-source-way-order",
    basis:
      "Planner 16 explicit pedestrian-direction authority",
    policyId:
      "sdz-pedestrian-direction-resolution-policy-v1",
    resolutionCase:
      "explicit-planner-16",
  });
});

test("explicit Planner 16 direction cannot expand Planner 21 beyond highway=pedestrian", () => {
  const resolved =
    resolvePedestrianDirectionWithPolicy(
      "path",
      {
        id: "synthetic-path",
        targetId:
          "sdz-geo-main-entrance",
        sourceWayId:
          "synthetic-path-way",
        sourceUrl:
          "https://www.openstreetmap.org/way/synthetic-path-way",
        observedAt:
          "2026-09-09T09:04:00-07:00",
        sourceTags: {
          highway: "path",
          "oneway:foot": "yes",
        },
        plannerMaterialization:
          "pedestrian-direction-authority-only",
      },
      {
        status: "supported",
        sourceWayId:
          "synthetic-path-way",
        sourceSnapshotId:
          "synthetic-path",
        oneWay: true,
        direction:
          "with-source-way-order",
        basis:
          "OSM oneway:foot=yes",
      },
    );

  assert.deepEqual(resolved, {
    status: "blocked",
    sourceWayId:
      "synthetic-path-way",
    reason:
      "POLICY_SCOPE_NOT_APPLICABLE",
    sourceSnapshotId:
      "synthetic-path",
  });
});

test("generic oneway=no does not block pedestrian bidirectionality inside Planner 21 scope", () => {
  const resolved =
    resolvePedestrianDirectionWithPolicy(
      "pedestrian",
      {
        id: "synthetic-generic-no",
        targetId:
          "sdz-geo-main-entrance",
        sourceWayId:
          "synthetic-generic-no-way",
        sourceUrl:
          "https://www.openstreetmap.org/way/synthetic-generic-no-way",
        observedAt:
          "2026-09-09T09:04:00-07:00",
        sourceTags: {
          highway: "pedestrian",
          oneway: "no",
        },
        plannerMaterialization:
          "pedestrian-direction-authority-only",
      },
      {
        status: "blocked",
        reason:
          "PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED",
        sourceWayId:
          "synthetic-generic-no-way",
        sourceSnapshotId:
          "synthetic-generic-no",
      },
    );

  assert.deepEqual(resolved, {
    status: "supported",
    sourceWayId:
      "synthetic-generic-no-way",
    sourceSnapshotId:
      "synthetic-generic-no",
    oneWay: false,
    direction: "bidirectional",
    basis:
      "Planner 21 default pedestrian bidirectionality absent explicit restriction",
    policyId:
      "sdz-pedestrian-direction-resolution-policy-v1",
    resolutionCase:
      "no-explicit-pedestrian-restriction",
  });
});

test("unknown ingress way still fails closed", () => {
  assert.deepEqual(
    resolveIngressPedestrianDirection(
      "unknown-way",
    ),
    {
      status: "blocked",
      sourceWayId: "unknown-way",
      reason: "SOURCE_WAY_UNKNOWN",
    },
  );
});

test("Planner 21 policy is deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      PEDESTRIAN_DIRECTION_RESOLUTION_POLICY,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      PEDESTRIAN_DIRECTION_RESOLUTION_POLICY
        .semanticReferenceUrls,
    ),
    true,
  );
});

test("policy integrity rejects treating generic oneway as pedestrian one-way", () => {
  const bad = {
    ...PEDESTRIAN_DIRECTION_RESOLUTION_POLICY,
    genericOnewayOnPedestrianWay:
      "pedestrian-oneway",
  } as unknown as PedestrianDirectionResolutionPolicy;

  assert.throws(
    () =>
      assertPedestrianDirectionResolutionPolicyIntegrity(
        bad,
      ),
    /resolution policy drifted from the prospective freeze/,
  );
});

test("policy integrity rejects changing the no-restriction default", () => {
  const bad = {
    ...PEDESTRIAN_DIRECTION_RESOLUTION_POLICY,
    noPedestrianDirectionRestriction:
      "blocked",
  } as unknown as PedestrianDirectionResolutionPolicy;

  assert.throws(
    () =>
      assertPedestrianDirectionResolutionPolicyIntegrity(
        bad,
      ),
    /resolution policy drifted from the prospective freeze/,
  );
});

test("policy integrity rejects weakening Planner 16 explicit direction precedence", () => {
  const bad = {
    ...PEDESTRIAN_DIRECTION_RESOLUTION_POLICY,
    explicitPedestrianDirection:
      "planner-21-overrides",
  } as unknown as PedestrianDirectionResolutionPolicy;

  assert.throws(
    () =>
      assertPedestrianDirectionResolutionPolicyIntegrity(
        bad,
      ),
    /resolution policy drifted from the prospective freeze/,
  );
});

test("ingress resolution integrity requires exact one-to-one current way coverage", () => {
  assert.throws(
    () =>
      assertIngressPedestrianDirectionResolutionIntegrity(
        ["755054695"],
      ),
    /requires exactly one current ingress way binding/,
  );

  assert.throws(
    () =>
      assertIngressPedestrianDirectionResolutionIntegrity(
        [
          "755054695",
          "755054695",
        ],
      ),
    /requires exactly one current ingress way binding/,
  );
});
