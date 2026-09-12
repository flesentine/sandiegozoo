import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_OPERATIONAL_STATUS_AUTHORITY,
  INTERIOR_OPERATIONAL_STATUS_POLICY,
  assessInteriorOperationalStatus,
  assertInteriorOperationalStatusAuthorityIntegrity,
  assertInteriorOperationalStatusPolicyIntegrity,
  interiorOperationalStatusForObjective,
  resolveInteriorRuntimeActivation,
  type InteriorOperationalStatusAuthority,
  type InteriorOperationalStatusPolicy,
  type InteriorRuntimeOperationalSnapshot,
} from "../src/data/zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
} from "../src/data/zooInteriorAccessibilityAuthority.ts";
import {
  ZOO_OPERATIONAL_POLICY,
} from "../src/data/zooIngressOperationalStatusAuthority.ts";
import {
  zooOperationalDateAt,
} from "../src/data/zooOperationalClock.ts";

const TEST_NOW = Date.now();
const TEST_DATE = zooOperationalDateAt(TEST_NOW);

function isoOffset(minutes: number) {
  return new Date(
    TEST_NOW + minutes * 60_000,
  ).toISOString();
}

function snapshot(
  overrides: Partial<InteriorRuntimeOperationalSnapshot> = {},
): InteriorRuntimeOperationalSnapshot {
  return {
    visitDate: TEST_DATE,
    zooHours: {
      evidenceId: `hours-${TEST_DATE}`,
      status: "inside",
      validForDate: TEST_DATE,
      observedAt: isoOffset(-120),
      expiresAt: isoOffset(240),
    },
    exactSegmentAvailability: [
      {
        evidenceId:
          "segment-front-street-tiger-availability",
        status: "available",
        validForDate: TEST_DATE,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
        objectiveSourceRecordId:
          "sdz-tiger-trail",
        sourceWayId: "1481425058",
        sourceFromNodeId: "7053320515",
        sourceToNodeId: "1619736626",
      },
    ],
    ...overrides,
  };
}

function mutablePolicy() {
  return {
    ...INTERIOR_OPERATIONAL_STATUS_POLICY,
    runtimeRequirements: [
      ...INTERIOR_OPERATIONAL_STATUS_POLICY.runtimeRequirements,
    ],
  } as unknown as InteriorOperationalStatusPolicy;
}

function mutableAuthority() {
  const source =
    INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0];
  return {
    ...source,
    runtimeRequirements: [
      ...source.runtimeRequirements,
    ],
  } as unknown as InteriorOperationalStatusAuthority;
}

test("Planner 34 qualifies only conditional status for the exact Tiger Trail Front Street segment", () => {
  const record =
    INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0];

  assert.equal(
    record.objectiveSourceRecordId,
    "sdz-tiger-trail",
  );
  assert.equal(record.sourceWayId, "1481425058");
  assert.equal(
    record.sourceFromNodeId,
    "7053320515",
  );
  assert.equal(
    record.sourceToNodeId,
    "1619736626",
  );
  assert.equal(record.status, "conditional");
  assert.equal(
    record.activation,
    "runtime-check-required",
  );
  assert.deepEqual(record.runtimeRequirements, [
    "VISIT_WITHIN_CURRENT_ZOO_HOURS",
    "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
  ]);
});

test("Planner 34 reuses Zoo-wide hours policy while refusing ingress closure advisement as interior authority", () => {
  assert.equal(
    INTERIOR_OPERATIONAL_STATUS_POLICY.zooOperationalPolicyId,
    ZOO_OPERATIONAL_POLICY.id,
  );
  assert.equal(
    INTERIOR_OPERATIONAL_STATUS_POLICY.facilityScheduleAuthority,
    ZOO_OPERATIONAL_POLICY.facilitySchedule,
  );
  assert.equal(
    INTERIOR_OPERATIONAL_STATUS_POLICY.hoursPolicyAuthority,
    ZOO_OPERATIONAL_POLICY.hoursPolicy,
  );
  assert.equal(
    INTERIOR_OPERATIONAL_STATUS_POLICY.closurePolicyAuthority,
    ZOO_OPERATIONAL_POLICY.closurePolicy,
  );
  assert.equal(
    INTERIOR_OPERATIONAL_STATUS_POLICY.ingressClosureAdvisementSource,
    "main-entrance",
  );
  assert.equal(
    INTERIOR_OPERATIONAL_STATUS_POLICY.ingressClosureAdvisementApplicability,
    "not-interior-segment-authority",
  );
  assert.equal(
    INTERIOR_OPERATIONAL_STATUS_POLICY.runtimeRequirements.includes(
      "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT" as never,
    ),
    false,
  );
});

test("Planner 34 stays attached to the exact Planner 33 accessibility segment", () => {
  const operational =
    INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0];
  const accessibility =
    INTERIOR_ACCESSIBILITY_AUTHORITY[0];

  assert.equal(
    operational.accessibilityAuthorityId,
    accessibility.id,
  );
  assert.equal(
    operational.objectiveSourceRecordId,
    accessibility.objectiveSourceRecordId,
  );
  assert.equal(
    operational.sourceWayId,
    accessibility.sourceWayId,
  );
  assert.equal(
    operational.sourceWayName,
    accessibility.sourceWayName,
  );
  assert.equal(
    operational.sourceFromNodeId,
    accessibility.sourceFromNodeId,
  );
  assert.equal(
    operational.sourceToNodeId,
    accessibility.sourceToNodeId,
  );
});

test("Planner 34 clears only operational status while stairs, stroller, and provenance remain blocked", () => {
  assert.deepEqual(
    assessInteriorOperationalStatus(
      "sdz-tiger-trail",
    ),
    {
      status: "operational-status-ready",
      objectiveSourceRecordId:
        "sdz-tiger-trail",
      sourceFromNodeId: "7053320515",
      sourceToNodeId: "1619736626",
      routeStatus: "conditional",
      activation: "runtime-check-required",
      runtimeRequirements: [
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
        "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
      ],
      ingressClosureAdvisementApplicability:
        "not-interior-segment-authority",
      stairsAuthorityState:
        "independent-unresolved",
      strollerAuthorityState:
        "facility-permission-not-route-suitability",
      selectionScope: "objective-only",
      globalEndpointSelection: "unresolved",
      exactSegmentMaterialization: {
        status: "blocked",
        reasons: [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
          "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
        ],
      },
    },
  );
});

test("other objectives cannot inherit the Tiger Trail operational result", () => {
  for (const objective of [
    "sdz-koala-outback",
    "sdz-gorilla-tropics",
    "unknown-objective",
  ]) {
    assert.equal(
      interiorOperationalStatusForObjective(objective),
      undefined,
    );
    assert.deepEqual(
      assessInteriorOperationalStatus(objective),
      {
        status: "blocked",
        reason:
          "OBJECTIVE_OPERATIONAL_STATUS_NOT_SOURCED",
        objectiveSourceRecordId: objective,
        globalEndpointSelection: "unresolved",
      },
    );
    assert.deepEqual(
      resolveInteriorRuntimeActivation(
        objective,
        snapshot(),
      ),
      {
        status: "blocked",
        reason:
          "OBJECTIVE_OPERATIONAL_STATUS_NOT_SOURCED",
        objectiveSourceRecordId: objective,
      },
    );
  }
});

test("fresh current Zoo-local hours plus affirmative exact-segment evidence enables the conditional segment", () => {
  const before = Date.now();
  const result = resolveInteriorRuntimeActivation(
    "sdz-tiger-trail",
    snapshot(),
  );
  const after = Date.now();

  assert.equal(result.status, "evaluated");
  if (result.status !== "evaluated") {
    throw new Error("expected evaluated result");
  }

  assert.equal(result.visitDate, TEST_DATE);
  assert.ok(
    Date.parse(result.evaluatedAt) >= before,
  );
  assert.ok(
    Date.parse(result.evaluatedAt) <= after,
  );
  assert.deepEqual(result.decision, {
    objectiveSourceRecordId:
      "sdz-tiger-trail",
    sourceWayId: "1481425058",
    sourceFromNodeId: "7053320515",
    sourceToNodeId: "1619736626",
    status: "enabled",
    reason: "ENABLED",
    evidenceIds: [
      `hours-${TEST_DATE}`,
      "segment-front-street-tiger-availability",
    ],
    effectiveExpiresAt: isoOffset(30),
  });
});

test("future or historical visit labels cannot activate current evidence", () => {
  for (const visitDate of [
    "2099-01-01",
    "2000-01-01",
  ]) {
    const base = snapshot();
    const result = resolveInteriorRuntimeActivation(
      "sdz-tiger-trail",
      {
        ...base,
        visitDate,
        zooHours: {
          ...base.zooHours,
          validForDate: visitDate,
        },
        exactSegmentAvailability:
          base.exactSegmentAvailability.map(
            (evidence) => ({
              ...evidence,
              validForDate: visitDate,
            })),
      },
    );

    assert.equal(result.status, "evaluated");
    if (result.status !== "evaluated") continue;
    assert.equal(
      result.decision.status,
      "disabled",
    );
    assert.equal(
      result.decision.reason,
      "VISIT_DATE_NOT_CURRENT_ZOO_DATE",
    );
  }
});

test("outside or unknown Zoo-hours status disables the segment", () => {
  for (const status of [
    "outside",
    "unknown",
  ] as const) {
    const base = snapshot();
    const result = resolveInteriorRuntimeActivation(
      "sdz-tiger-trail",
      {
        ...base,
        zooHours: {
          ...base.zooHours,
          status,
        },
      },
    );

    assert.equal(result.status, "evaluated");
    if (result.status !== "evaluated") continue;
    assert.equal(
      result.decision.reason,
      "HOURS_NOT_CONFIRMED",
    );
    assert.equal(result.decision.status, "disabled");
  }
});

test("expired, future, or wrong-date Zoo-hours evidence cannot activate the segment", () => {
  const base = snapshot();
  const cases: InteriorRuntimeOperationalSnapshot[] = [
    {
      ...base,
      zooHours: {
        ...base.zooHours,
        observedAt: isoOffset(-60),
        expiresAt: isoOffset(-1),
      },
    },
    {
      ...base,
      zooHours: {
        ...base.zooHours,
        observedAt: isoOffset(1),
        expiresAt: isoOffset(60),
      },
    },
    {
      ...base,
      zooHours: {
        ...base.zooHours,
        validForDate: "2099-01-01",
      },
    },
  ];

  for (const candidate of cases) {
    const result = resolveInteriorRuntimeActivation(
      "sdz-tiger-trail",
      candidate,
    );
    assert.equal(result.status, "evaluated");
    if (result.status !== "evaluated") continue;
    assert.equal(
      result.decision.reason,
      "HOURS_EVIDENCE_NOT_CURRENT",
    );
    assert.equal(result.decision.status, "disabled");
  }
});

test("missing, unavailable, or unknown exact-segment availability cannot activate the segment", () => {
  const base = snapshot();

  const missing = resolveInteriorRuntimeActivation(
    "sdz-tiger-trail",
    {
      ...base,
      exactSegmentAvailability: [],
    },
  );
  assert.equal(missing.status, "evaluated");
  if (missing.status === "evaluated") {
    assert.equal(
      missing.decision.reason,
      "SEGMENT_AVAILABILITY_MISSING",
    );
  }

  for (const status of [
    "unavailable",
    "unknown",
  ] as const) {
    const result = resolveInteriorRuntimeActivation(
      "sdz-tiger-trail",
      {
        ...base,
        exactSegmentAvailability:
          base.exactSegmentAvailability.map(
            (evidence) => ({
              ...evidence,
              status,
            })),
      },
    );
    assert.equal(result.status, "evaluated");
    if (result.status !== "evaluated") continue;
    assert.equal(
      result.decision.reason,
      "SEGMENT_AVAILABILITY_NOT_CONFIRMED",
    );
    assert.equal(result.decision.status, "disabled");
  }
});

test("expired, future, or wrong-date exact-segment availability cannot activate the segment", () => {
  const base = snapshot();
  const replacements = [
    {
      observedAt: isoOffset(-60),
      expiresAt: isoOffset(-1),
      validForDate: TEST_DATE,
    },
    {
      observedAt: isoOffset(1),
      expiresAt: isoOffset(60),
      validForDate: TEST_DATE,
    },
    {
      observedAt: isoOffset(-10),
      expiresAt: isoOffset(30),
      validForDate: "2099-01-01",
    },
  ];

  for (const replacement of replacements) {
    const result = resolveInteriorRuntimeActivation(
      "sdz-tiger-trail",
      {
        ...base,
        exactSegmentAvailability:
          base.exactSegmentAvailability.map(
            (evidence) => ({
              ...evidence,
              ...replacement,
            })),
      },
    );
    assert.equal(result.status, "evaluated");
    if (result.status !== "evaluated") continue;
    assert.equal(
      result.decision.reason,
      "SEGMENT_AVAILABILITY_NOT_CURRENT",
    );
    assert.equal(result.decision.status, "disabled");
  }
});

test("runtime evidence cannot reference another segment or duplicate the qualified segment", () => {
  const base = snapshot();
  const foreign = {
    ...base.exactSegmentAvailability[0],
    sourceToNodeId: "6239154982",
  } as never;

  assert.throws(
    () =>
      resolveInteriorRuntimeActivation(
        "sdz-tiger-trail",
        {
          ...base,
          exactSegmentAvailability: [foreign],
        },
      ),
    /unknown interior segment/,
  );

  assert.throws(
    () =>
      resolveInteriorRuntimeActivation(
        "sdz-tiger-trail",
        {
          ...base,
          exactSegmentAvailability: [
            base.exactSegmentAvailability[0],
            {
              ...base.exactSegmentAvailability[0],
              evidenceId:
                "duplicate-segment-evidence",
            },
          ],
        },
      ),
    /cannot duplicate the qualified interior segment/,
  );
});

test("caller cannot smuggle entrance closure clearance or a replay evaluatedAt into the interior runtime snapshot", () => {
  const base = snapshot();

  const withIngressClosure = {
    ...base,
    closureAdvisement: {
      evidenceId: "forged-ingress-clearance",
      status: "clear",
      validForDate: TEST_DATE,
      observedAt: isoOffset(-10),
      expiresAt: isoOffset(30),
    },
  } as never;
  assert.throws(
    () =>
      resolveInteriorRuntimeActivation(
        "sdz-tiger-trail",
        withIngressClosure,
      ),
    /cannot contain unknown field closureAdvisement/,
  );

  const withEvaluatedAt = {
    ...base,
    evaluatedAt: isoOffset(-120),
  } as never;
  assert.throws(
    () =>
      resolveInteriorRuntimeActivation(
        "sdz-tiger-trail",
        withEvaluatedAt,
      ),
    /cannot contain unknown field evaluatedAt/,
  );
});

test("Planner 34 policy and authority reject promotion to open or ownership of unrelated RouteEdge semantics", () => {
  const policy = mutablePolicy() as unknown as {
    plannerStatus: string;
  };
  policy.plannerStatus = "open";
  assert.throws(
    () =>
      assertInteriorOperationalStatusPolicyIntegrity(
        policy as unknown as InteriorOperationalStatusPolicy,
      ),
    /operational-status policy drifted/,
  );

  const authority = mutableAuthority() as unknown as {
    status: string;
  };
  authority.status = "open";
  assert.throws(
    () =>
      assertInteriorOperationalStatusAuthorityIntegrity([
        authority as unknown as InteriorOperationalStatusAuthority,
      ]),
    /operational-status authority drifted/,
  );

  const smuggled = {
    ...mutableAuthority(),
    stroller: true,
  } as unknown as InteriorOperationalStatusAuthority;
  assert.throws(
    () =>
      assertInteriorOperationalStatusAuthorityIntegrity([
        smuggled,
      ]),
    /cannot contain unknown field stroller|cannot own field stroller/,
  );
});

test("Planner 34 rejects hidden fields, symbols, accessors, and decorated arrays", () => {
  const hidden = mutableAuthority();
  Object.defineProperty(hidden, "routeEdgeId", {
    value: "forged-edge",
    enumerable: false,
  });
  assert.throws(
    () =>
      assertInteriorOperationalStatusAuthorityIntegrity([
        hidden,
      ]),
    /cannot contain unknown field routeEdgeId/,
  );

  const symbol = mutableAuthority() as unknown as Record<PropertyKey, unknown>;
  symbol[Symbol("status")] = "open";
  assert.throws(
    () =>
      assertInteriorOperationalStatusAuthorityIntegrity([
        symbol as unknown as InteriorOperationalStatusAuthority,
      ]),
    /cannot contain symbol fields/,
  );

  const accessor = mutableAuthority();
  Object.defineProperty(accessor, "status", {
    get: () => "conditional",
    enumerable: true,
  });
  assert.throws(
    () =>
      assertInteriorOperationalStatusAuthorityIntegrity([
        accessor,
      ]),
    /requires enumerable own data field status/,
  );

  const decorated = [
    mutableAuthority(),
  ] as unknown as InteriorOperationalStatusAuthority[] & {
    open?: boolean;
  };
  Object.defineProperty(decorated, "open", {
    value: true,
    enumerable: false,
  });
  assert.throws(
    () =>
      assertInteriorOperationalStatusAuthorityIntegrity(
        decorated,
      ),
    /cannot contain extra own properties/,
  );
});

test("Planner 34 authority, policy, assessments, and runtime decisions are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      INTERIOR_OPERATIONAL_STATUS_POLICY,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_OPERATIONAL_STATUS_POLICY.runtimeRequirements,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_OPERATIONAL_STATUS_AUTHORITY,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0],
    ),
    true,
  );

  const assessment =
    assessInteriorOperationalStatus(
      "sdz-tiger-trail",
    );
  assert.equal(Object.isFrozen(assessment), true);
  if (assessment.status === "operational-status-ready") {
    assert.equal(
      Object.isFrozen(assessment.runtimeRequirements),
      true,
    );
    assert.equal(
      Object.isFrozen(
        assessment.exactSegmentMaterialization,
      ),
      true,
    );
    assert.equal(
      Object.isFrozen(
        assessment.exactSegmentMaterialization.reasons,
      ),
      true,
    );
  }

  const result = resolveInteriorRuntimeActivation(
    "sdz-tiger-trail",
    snapshot(),
  );
  assert.equal(Object.isFrozen(result), true);
  if (result.status === "evaluated") {
    assert.equal(
      Object.isFrozen(result.decision),
      true,
    );
    assert.equal(
      Object.isFrozen(result.decision.evidenceIds),
      true,
    );
  }
});
