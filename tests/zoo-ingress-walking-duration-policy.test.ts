import assert from "node:assert/strict";
import test from "node:test";
import {
  DERIVED_INGRESS_WALKING_DURATIONS,
  INGRESS_WALKING_DURATION_POLICY,
  assessIngressWalkingDurationAuthority,
  assertIngressWalkingDurationPolicyIntegrity,
  deriveWalkingDurationMinutes,
  walkingDurationForSourceWay,
  type DerivedIngressWalkingDuration,
  type WalkingDurationPolicy,
} from "../src/data/zooIngressWalkingDurationPolicy.ts";

test("Planner 19 freezes a neutral free-flow walking-duration policy", () => {
  assert.deepEqual(
    INGRESS_WALKING_DURATION_POLICY,
    {
      id: "sdz-walking-duration-policy-v1",
      policyVersion: "1",
      adoptedAt:
        "2026-09-08T18:11:00-07:00",
      scope: "free-flow-walk-edges",
      speedMetersPerSecond: 1.2,
      roundingDecimals: 3,
      minimumDurationMinutes: null,
      paceAdjustment: "none",
      terrainAdjustment: "none",
      queueAdjustment: "none",
      accessControlDelayAdjustment:
        "none",
      crowdAdjustment: "none",
      authority:
        "prospective-product-policy",
    },
  );
});

test("exact ingress durations derive reproducibly from Planner 13 distances", () => {
  assert.deepEqual(
    DERIVED_INGRESS_WALKING_DURATIONS,
    [
      {
        id:
          "sdz-ingress-way-controlled-passage-distance-walking-duration-v1",
        targetId:
          "sdz-geo-main-entrance",
        sourceWayId: "755054695",
        sourceDistanceId:
          "sdz-ingress-way-controlled-passage-distance",
        distanceMeters: 16.836,
        durationMinutes: 0.234,
        derivationMethod:
          "distance-over-fixed-walk-speed",
        speedMetersPerSecond: 1.2,
        roundingDecimals: 3,
        policyId:
          "sdz-walking-duration-policy-v1",
        policyVersion: "1",
        plannerMaterialization:
          "duration-only",
      },
      {
        id:
          "sdz-ingress-way-front-street-connection-distance-walking-duration-v1",
        targetId:
          "sdz-geo-main-entrance",
        sourceWayId: "755054694",
        sourceDistanceId:
          "sdz-ingress-way-front-street-connection-distance",
        distanceMeters: 25.376,
        durationMinutes: 0.352,
        derivationMethod:
          "distance-over-fixed-walk-speed",
        speedMetersPerSecond: 1.2,
        roundingDecimals: 3,
        policyId:
          "sdz-walking-duration-policy-v1",
        policyVersion: "1",
        plannerMaterialization:
          "duration-only",
      },
    ],
  );
});

test("walking-duration derivation has no fake one-minute floor", () => {
  assert.equal(
    deriveWalkingDurationMinutes(
      16.836,
    ),
    0.234,
  );
  assert.equal(
    deriveWalkingDurationMinutes(
      25.376,
    ),
    0.352,
  );
  assert.ok(
    deriveWalkingDurationMinutes(1) <
      1,
  );
});

test("walking-duration derivation rejects non-positive and non-finite distances", () => {
  for (const value of [
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ]) {
    assert.throws(
      () =>
        deriveWalkingDurationMinutes(
          value,
        ),
      /finite positive distance/,
    );
  }
});

test("source-way lookup is exact and non-fuzzy", () => {
  assert.equal(
    walkingDurationForSourceWay(
      "755054695",
    )?.durationMinutes,
    0.234,
  );
  assert.equal(
    walkingDurationForSourceWay(
      "controlled passage",
    ),
    undefined,
  );
});

test("main entrance duration authority is ready with deterministic aggregate duration", () => {
  assert.deepEqual(
    assessIngressWalkingDurationAuthority(
      "sdz-geo-main-entrance",
    ),
    {
      status: "duration-ready",
      targetId:
        "sdz-geo-main-entrance",
      durationIds: [
        "sdz-ingress-way-controlled-passage-distance-walking-duration-v1",
        "sdz-ingress-way-front-street-connection-distance-walking-duration-v1",
      ],
      totalDurationMinutes: 0.586,
      policyId:
        "sdz-walking-duration-policy-v1",
      policyVersion: "1",
    },
  );
});

test("known target without ingress distance stays distinct from unknown target", () => {
  assert.deepEqual(
    assessIngressWalkingDurationAuthority(
      "sdz-geo-wegeforth-bowl",
    ),
    {
      status: "blocked",
      reason: "NO_DISTANCE_SEGMENTS",
      targetId:
        "sdz-geo-wegeforth-bowl",
    },
  );

  assert.deepEqual(
    assessIngressWalkingDurationAuthority(
      "unknown-target",
    ),
    {
      status: "blocked",
      reason: "TARGET_UNKNOWN",
      targetId: "unknown-target",
    },
  );
});

test("Planner 19 policy and duration exports are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      INGRESS_WALKING_DURATION_POLICY,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      DERIVED_INGRESS_WALKING_DURATIONS,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      DERIVED_INGRESS_WALKING_DURATIONS[0],
    ),
    true,
  );
});

test("integrity rejects walking-speed drift", () => {
  const badPolicy = {
    ...INGRESS_WALKING_DURATION_POLICY,
    speedMetersPerSecond: 1.4,
  } as unknown as WalkingDurationPolicy;

  assert.throws(
    () =>
      assertIngressWalkingDurationPolicyIntegrity(
        badPolicy,
        DERIVED_INGRESS_WALKING_DURATIONS,
      ),
    /policy drifted from the prospective freeze/,
  );
});

test("integrity rejects hidden minimum-duration floors", () => {
  const badPolicy = {
    ...INGRESS_WALKING_DURATION_POLICY,
    minimumDurationMinutes: 1,
  } as unknown as WalkingDurationPolicy;

  assert.throws(
    () =>
      assertIngressWalkingDurationPolicyIntegrity(
        badPolicy,
        DERIVED_INGRESS_WALKING_DURATIONS,
      ),
    /policy drifted from the prospective freeze/,
  );
});

test("integrity rejects pace/crowd/terrain/queue adjustments being smuggled into base duration", () => {
  for (const patch of [
    {
      paceAdjustment: "relaxed",
    },
    {
      terrainAdjustment:
        "difficulty-weighted",
    },
    {
      queueAdjustment: "estimated",
    },
    {
      accessControlDelayAdjustment:
        "turnstile-delay",
    },
    {
      crowdAdjustment: "peak-hour",
    },
  ]) {
    const badPolicy = {
      ...INGRESS_WALKING_DURATION_POLICY,
      ...patch,
    } as unknown as WalkingDurationPolicy;

    assert.throws(
      () =>
        assertIngressWalkingDurationPolicyIntegrity(
          badPolicy,
          DERIVED_INGRESS_WALKING_DURATIONS,
        ),
      /policy drifted from the prospective freeze/,
    );
  }
});

test("integrity rejects duration drift from the frozen distance formula", () => {
  const badDurations:
    DerivedIngressWalkingDuration[] =
    DERIVED_INGRESS_WALKING_DURATIONS.map(
      (duration, index) =>
        index === 0
          ? {
              ...duration,
              durationMinutes:
                duration.durationMinutes +
                0.001,
            }
          : { ...duration },
    );

  assert.throws(
    () =>
      assertIngressWalkingDurationPolicyIntegrity(
        INGRESS_WALKING_DURATION_POLICY,
        badDurations,
      ),
    /does not match its frozen distance\/policy authority/,
  );
});

test("integrity rejects detached source-distance linkage", () => {
  const badDurations:
    DerivedIngressWalkingDuration[] =
    DERIVED_INGRESS_WALKING_DURATIONS.map(
      (duration, index) =>
        index === 0
          ? {
              ...duration,
              sourceDistanceId:
                DERIVED_INGRESS_WALKING_DURATIONS[1]
                  .sourceDistanceId,
            }
          : { ...duration },
    );

  assert.throws(
    () =>
      assertIngressWalkingDurationPolicyIntegrity(
        INGRESS_WALKING_DURATION_POLICY,
        badDurations,
      ),
    /does not match its frozen distance\/policy authority/,
  );
});
