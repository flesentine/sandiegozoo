import assert from "node:assert/strict";
import test from "node:test";
import {
  ZOO_OPERATIONAL_POLICY,
  assertIngressOperationalStatusIntegrity,
  assertZooOperationalPolicyIntegrity,
  operationalStatusForIngressWay,
  type ZooOperationalPolicyEvidence,
} from "../src/data/zooIngressOperationalStatusAuthority.ts";

test("Planner 20 freezes official operating and closure-policy evidence", () => {
  assert.deepEqual(
    ZOO_OPERATIONAL_POLICY,
    {
      id: "sdz-operational-policy-2026-09-08",
      observedAt:
        "2026-09-08T19:24:00-07:00",
      sourceUrls: [
        "https://zoo.sandiegozoo.org/help-center",
        "https://zoo.sandiegozoo.org/plan-your-visit",
      ],
      facilitySchedule:
        "open-every-day",
      hoursPolicy:
        "vary-through-year",
      closurePolicy:
        "changes-or-closures-may-occur-without-notice",
      dailyClosureAdvisement:
        "main-entrance",
      plannerStatusPolicy:
        "conditional-until-runtime-activation",
      plannerMaterialization:
        "operational-policy-only",
    },
  );
});

test("both current exact ingress ways are conditionally available rather than guessed open", () => {
  for (const sourceWayId of [
    "755054695",
    "755054694",
  ]) {
    assert.deepEqual(
      operationalStatusForIngressWay(
        sourceWayId,
      ),
      {
        sourceWayId,
        statusAuthority: {
          status: "supported",
          value: "conditional",
          basis:
            "Planner 20 operational-status policy",
          policyEvidenceId:
            "sdz-operational-policy-2026-09-08",
          activation: {
            status:
              "runtime-check-required",
            requirements: [
              "VISIT_WITHIN_CURRENT_ZOO_HOURS",
              "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
            ],
          },
        },
      },
    );
  }
});

test("unknown ingress way fails closed", () => {
  assert.deepEqual(
    operationalStatusForIngressWay(
      "unknown-way",
    ),
    {
      sourceWayId: "unknown-way",
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
    },
  );
});

test("Planner 20 operational policy is deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      ZOO_OPERATIONAL_POLICY,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      ZOO_OPERATIONAL_POLICY.sourceUrls,
    ),
    true,
  );
});

test("policy integrity rejects replacing conditional status with always-open semantics", () => {
  const badPolicy = {
    ...ZOO_OPERATIONAL_POLICY,
    plannerStatusPolicy:
      "always-open",
  } as unknown as ZooOperationalPolicyEvidence;

  assert.throws(
    () =>
      assertZooOperationalPolicyIntegrity(
        badPolicy,
      ),
    /operational policy drifted from the prospective freeze/,
  );
});

test("policy integrity rejects removal of without-notice closure semantics", () => {
  const badPolicy = {
    ...ZOO_OPERATIONAL_POLICY,
    closurePolicy:
      "always-known-in-advance",
  } as unknown as ZooOperationalPolicyEvidence;

  assert.throws(
    () =>
      assertZooOperationalPolicyIntegrity(
        badPolicy,
      ),
    /operational policy drifted from the prospective freeze/,
  );
});

test("policy integrity rejects source or observation drift", () => {
  const badSource = {
    ...ZOO_OPERATIONAL_POLICY,
    sourceUrls: [
      "https://example.com/help-center",
      ZOO_OPERATIONAL_POLICY.sourceUrls[1],
    ],
  } as unknown as ZooOperationalPolicyEvidence;

  assert.throws(
    () =>
      assertZooOperationalPolicyIntegrity(
        badSource,
      ),
    /operational policy drifted from the prospective freeze/,
  );

  const badObservedAt = {
    ...ZOO_OPERATIONAL_POLICY,
    observedAt:
      "2026-09-08T19:25:00-07:00",
  } as ZooOperationalPolicyEvidence;

  assert.throws(
    () =>
      assertZooOperationalPolicyIntegrity(
        badObservedAt,
      ),
    /operational policy drifted from the prospective freeze/,
  );
});

test("ingress status integrity requires exact one-to-one current way coverage", () => {
  assert.throws(
    () =>
      assertIngressOperationalStatusIntegrity(
        ["755054695"],
      ),
    /requires exactly one current ingress way binding/,
  );

  assert.throws(
    () =>
      assertIngressOperationalStatusIntegrity(
        [
          "755054695",
          "755054695",
        ],
      ),
    /requires exactly one current ingress way binding/,
  );
});
