import {
  ZOO_OPERATIONAL_POLICY,
} from "./zooIngressOperationalStatusAuthority.ts";
import {
  zooOperationalDateAt,
} from "./zooIngressRuntimeActivation.ts";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorAccessibilityAuthority.ts";

const POLICY_ID =
  "sdz-interior-operational-status-policy-v1" as const;
const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-operational-status" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const ACCESSIBILITY_AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-accessibility" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const ADOPTED_AT = "2026-09-12T15:45:00-07:00" as const;

export type InteriorOperationalActivationRequirement =
  | "VISIT_WITHIN_CURRENT_ZOO_HOURS"
  | "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY";

const ACTIVATION_REQUIREMENTS = Object.freeze([
  "VISIT_WITHIN_CURRENT_ZOO_HOURS",
  "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
] as const satisfies readonly InteriorOperationalActivationRequirement[]);

export type InteriorOperationalStatusPolicy = {
  id: typeof POLICY_ID;
  policyVersion: "1";
  adoptedAt: typeof ADOPTED_AT;
  scope: "objective-selected-exact-interior-segments";
  plannerStatus: "conditional";
  zooOperationalPolicyId: typeof ZOO_OPERATIONAL_POLICY.id;
  facilityScheduleAuthority: "open-every-day";
  hoursPolicyAuthority: "vary-through-year";
  closurePolicyAuthority:
    "changes-or-closures-may-occur-without-notice";
  ingressClosureAdvisementSource: "main-entrance";
  ingressClosureAdvisementApplicability:
    "not-interior-segment-authority";
  runtimeRequirements: readonly [
    "VISIT_WITHIN_CURRENT_ZOO_HOURS",
    "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
  ];
  runtimeClockAuthority:
    "resolver-owned-current-instant-and-zoo-local-date";
  authority: "prospective-product-operational-policy";
};

export type InteriorOperationalStatusAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  accessibilityAuthorityId: typeof ACCESSIBILITY_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  zooOperationalPolicyId: typeof ZOO_OPERATIONAL_POLICY.id;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayName: "Front Street";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  status: "conditional";
  activation: "runtime-check-required";
  runtimeRequirements: readonly [
    "VISIT_WITHIN_CURRENT_ZOO_HOURS",
    "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
  ];
  ingressClosureAdvisementApplicability:
    "not-interior-segment-authority";
  stairsAuthorityState: "independent-unresolved";
  strollerAuthorityState: "facility-permission-not-route-suitability";
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "operational-status-only";
};

export type InteriorOperationalStatusAssessment =
  | {
      status: "operational-status-ready";
      objectiveSourceRecordId: string;
      sourceFromNodeId: string;
      sourceToNodeId: string;
      routeStatus: "conditional";
      activation: "runtime-check-required";
      runtimeRequirements: readonly [
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
        "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
      ];
      ingressClosureAdvisementApplicability:
        "not-interior-segment-authority";
      stairsAuthorityState: "independent-unresolved";
      strollerAuthorityState:
        "facility-permission-not-route-suitability";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
          "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_OPERATIONAL_STATUS_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

export type InteriorHoursStatus =
  | "inside"
  | "outside"
  | "unknown";

export type InteriorExactSegmentAvailabilityStatus =
  | "available"
  | "unavailable"
  | "unknown";

export type InteriorTimedRuntimeEvidence<
  TStatus extends string,
> = {
  evidenceId: string;
  status: TStatus;
  validForDate: string;
  observedAt: string;
  expiresAt: string;
};

export type InteriorExactSegmentAvailabilityEvidence =
  InteriorTimedRuntimeEvidence<
    InteriorExactSegmentAvailabilityStatus
  > & {
    objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
    sourceWayId: typeof SOURCE_WAY_ID;
    sourceFromNodeId: typeof FROM_NODE_ID;
    sourceToNodeId: typeof TO_NODE_ID;
  };

export type InteriorRuntimeOperationalSnapshot = {
  visitDate: string;
  zooHours: InteriorTimedRuntimeEvidence<InteriorHoursStatus>;
  exactSegmentAvailability:
    readonly InteriorExactSegmentAvailabilityEvidence[];
};

export type InteriorRuntimeActivationReason =
  | "ENABLED"
  | "VISIT_DATE_NOT_CURRENT_ZOO_DATE"
  | "HOURS_NOT_CONFIRMED"
  | "HOURS_EVIDENCE_NOT_CURRENT"
  | "SEGMENT_AVAILABILITY_MISSING"
  | "SEGMENT_AVAILABILITY_NOT_CONFIRMED"
  | "SEGMENT_AVAILABILITY_NOT_CURRENT";

export type InteriorRuntimeActivationDecision = {
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  status: "enabled" | "disabled";
  reason: InteriorRuntimeActivationReason;
  evidenceIds: readonly string[];
  effectiveExpiresAt?: string;
};

export type InteriorRuntimeActivationResult =
  | {
      status: "evaluated";
      visitDate: string;
      evaluatedAt: string;
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      decision: InteriorRuntimeActivationDecision;
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_OPERATIONAL_STATUS_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const POLICY_FIELDS = [
  "id",
  "policyVersion",
  "adoptedAt",
  "scope",
  "plannerStatus",
  "zooOperationalPolicyId",
  "facilityScheduleAuthority",
  "hoursPolicyAuthority",
  "closurePolicyAuthority",
  "ingressClosureAdvisementSource",
  "ingressClosureAdvisementApplicability",
  "runtimeRequirements",
  "runtimeClockAuthority",
  "authority",
] as const;

const AUTHORITY_FIELDS = [
  "id",
  "objectiveSourceRecordId",
  "accessibilityAuthorityId",
  "policyId",
  "zooOperationalPolicyId",
  "sourceWayId",
  "sourceWayName",
  "sourceFromNodeId",
  "sourceToNodeId",
  "status",
  "activation",
  "runtimeRequirements",
  "ingressClosureAdvisementApplicability",
  "stairsAuthorityState",
  "strollerAuthorityState",
  "selectionScope",
  "globalEndpointSelection",
  "plannerMaterialization",
] as const;

const SNAPSHOT_FIELDS = [
  "visitDate",
  "zooHours",
  "exactSegmentAvailability",
] as const;

const TIMED_EVIDENCE_FIELDS = [
  "evidenceId",
  "status",
  "validForDate",
  "observedAt",
  "expiresAt",
] as const;

const SEGMENT_EVIDENCE_FIELDS = [
  ...TIMED_EVIDENCE_FIELDS,
  "objectiveSourceRecordId",
  "sourceWayId",
  "sourceFromNodeId",
  "sourceToNodeId",
] as const;

const FORBIDDEN_UNOWNED_FIELDS = [
  "distanceMeters",
  "durationMinutes",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "mode",
  "oneWay",
  "provenance",
  "routeNodeId",
  "routeEdgeId",
  "globalEndpointNodeId",
] as const;

const REMAINING_BLOCK_REASONS = Object.freeze([
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
] as const);

function deepFreeze<T>(value: T): T {
  if (
    value &&
    typeof value === "object" &&
    !Object.isFrozen(value)
  ) {
    for (const child of Object.values(
      value as Record<string, unknown>,
    )) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

function assertExactPlainObject(
  value: unknown,
  allowedFields: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(
      `${label} must be a plain object with Object.prototype.`,
    );
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.some((key) => typeof key === "symbol")) {
    throw new Error(`${label} cannot contain symbol fields.`);
  }

  const expected = new Set(allowedFields);
  const stringKeys = ownKeys as string[];
  const unknown = stringKeys
    .filter((key) => !expected.has(key))
    .sort();
  const missing = allowedFields.filter(
    (key) => !Object.hasOwn(value, key),
  );

  if (unknown.length > 0) {
    throw new Error(
      `${label} cannot contain unknown field ${unknown.join(", ")}.`,
    );
  }
  if (missing.length > 0) {
    throw new Error(
      `${label} is missing required field ${missing.join(", ")}.`,
    );
  }

  for (const field of allowedFields) {
    const descriptor =
      Object.getOwnPropertyDescriptor(value, field);
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `${label} requires enumerable own data field ${field}.`,
      );
    }
  }
}

function assertOrdinaryDenseArray(
  value: unknown,
  label: string,
): asserts value is unknown[] {
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype
  ) {
    throw new Error(`${label} must be an ordinary array.`);
  }

  const allowedOwnKeys = new Set([
    ...Array.from(
      { length: value.length },
      (_, index) => String(index),
    ),
    "length",
  ]);
  if (
    Reflect.ownKeys(value).some(
      (key) =>
        typeof key !== "string" ||
        !allowedOwnKeys.has(key),
    )
  ) {
    throw new Error(`${label} cannot contain extra own properties.`);
  }

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    const descriptor = Object.getOwnPropertyDescriptor(
      value,
      String(index),
    );
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `${label} requires enumerable own data element ${index}.`,
      );
    }
  }
}

function assertExactOrdinaryArray(
  value: unknown,
  expectedLength: number,
  label: string,
): asserts value is unknown[] {
  assertOrdinaryDenseArray(value, label);
  if (value.length !== expectedLength) {
    throw new Error(
      `${label} must contain exactly ${expectedLength} element(s).`,
    );
  }
}

function validDate(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function validTimestamp(value: unknown) {
  if (typeof value !== "string") return false;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(
      value,
    );
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour =
    match[10] === undefined ? 0 : Number(match[10]);
  const offsetMinute =
    match[11] === undefined ? 0 : Number(match[11]);

  if (
    month < 1 ||
    month > 12 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59 ||
    offsetHour < 0 ||
    offsetHour > 14 ||
    offsetMinute < 0 ||
    offsetMinute > 59 ||
    (offsetHour === 14 && offsetMinute !== 0)
  ) {
    return false;
  }

  const leapYear =
    year % 4 === 0 &&
    (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];

  if (
    day < 1 ||
    day > daysInMonth
  ) {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

function stableId(value: unknown) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function assertTimedEvidence(
  label: string,
  evidence: InteriorTimedRuntimeEvidence<string>,
) {
  if (!stableId(evidence.evidenceId)) {
    throw new Error(
      `${label} evidenceId must be a stable non-empty string.`,
    );
  }
  if (!validDate(evidence.validForDate)) {
    throw new Error(
      `${label} validForDate must be a real YYYY-MM-DD date.`,
    );
  }
  if (
    !validTimestamp(evidence.observedAt) ||
    !validTimestamp(evidence.expiresAt)
  ) {
    throw new Error(
      `${label} observedAt/expiresAt must be ISO timestamps with timezone.`,
    );
  }
  if (
    Date.parse(evidence.expiresAt) <=
    Date.parse(evidence.observedAt)
  ) {
    throw new Error(
      `${label} expiresAt must be later than observedAt.`,
    );
  }
}

function evidenceCurrent(
  evidence: InteriorTimedRuntimeEvidence<string>,
  visitDate: string,
  nowMs: number,
) {
  return (
    evidence.validForDate === visitDate &&
    Date.parse(evidence.observedAt) <= nowMs &&
    nowMs <= Date.parse(evidence.expiresAt)
  );
}

function earliestExpiry(
  evidence: readonly InteriorTimedRuntimeEvidence<string>[],
) {
  return evidence
    .map((item) => item.expiresAt)
    .sort(
      (a, b) => Date.parse(a) - Date.parse(b),
    )[0];
}

const RAW_POLICY: InteriorOperationalStatusPolicy = {
  id: POLICY_ID,
  policyVersion: "1",
  adoptedAt: ADOPTED_AT,
  scope: "objective-selected-exact-interior-segments",
  plannerStatus: "conditional",
  zooOperationalPolicyId: ZOO_OPERATIONAL_POLICY.id,
  facilityScheduleAuthority: "open-every-day",
  hoursPolicyAuthority: "vary-through-year",
  closurePolicyAuthority:
    "changes-or-closures-may-occur-without-notice",
  ingressClosureAdvisementSource: "main-entrance",
  ingressClosureAdvisementApplicability:
    "not-interior-segment-authority",
  runtimeRequirements: ACTIVATION_REQUIREMENTS,
  runtimeClockAuthority:
    "resolver-owned-current-instant-and-zoo-local-date",
  authority: "prospective-product-operational-policy",
};

const RAW_AUTHORITY: InteriorOperationalStatusAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    accessibilityAuthorityId: ACCESSIBILITY_AUTHORITY_ID,
    policyId: POLICY_ID,
    zooOperationalPolicyId: ZOO_OPERATIONAL_POLICY.id,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayName: "Front Street",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    status: "conditional",
    activation: "runtime-check-required",
    runtimeRequirements: ACTIVATION_REQUIREMENTS,
    ingressClosureAdvisementApplicability:
      "not-interior-segment-authority",
    stairsAuthorityState: "independent-unresolved",
    strollerAuthorityState:
      "facility-permission-not-route-suitability",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    plannerMaterialization: "operational-status-only",
  },
];

export function assertInteriorOperationalStatusPolicyIntegrity(
  policy: InteriorOperationalStatusPolicy,
) {
  assertExactPlainObject(
    policy,
    POLICY_FIELDS,
    "Planner 34 operational-status policy",
  );
  assertExactOrdinaryArray(
    policy.runtimeRequirements,
    2,
    "Planner 34 operational-status policy runtime requirements",
  );

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.adoptedAt !== ADOPTED_AT ||
    !validTimestamp(policy.adoptedAt) ||
    policy.scope !==
      "objective-selected-exact-interior-segments" ||
    policy.plannerStatus !== "conditional" ||
    policy.zooOperationalPolicyId !==
      ZOO_OPERATIONAL_POLICY.id ||
    policy.facilityScheduleAuthority !==
      ZOO_OPERATIONAL_POLICY.facilitySchedule ||
    policy.hoursPolicyAuthority !==
      ZOO_OPERATIONAL_POLICY.hoursPolicy ||
    policy.closurePolicyAuthority !==
      ZOO_OPERATIONAL_POLICY.closurePolicy ||
    policy.ingressClosureAdvisementSource !==
      ZOO_OPERATIONAL_POLICY.dailyClosureAdvisement ||
    policy.ingressClosureAdvisementApplicability !==
      "not-interior-segment-authority" ||
    JSON.stringify(policy.runtimeRequirements) !==
      JSON.stringify(ACTIVATION_REQUIREMENTS) ||
    policy.runtimeClockAuthority !==
      "resolver-owned-current-instant-and-zoo-local-date" ||
    policy.authority !==
      "prospective-product-operational-policy"
  ) {
    throw new Error(
      "Planner 34 operational-status policy drifted from the frozen interior runtime boundary.",
    );
  }
}

export function assertInteriorOperationalStatusAuthorityIntegrity(
  authorities: readonly InteriorOperationalStatusAuthority[],
) {
  assertInteriorOperationalStatusPolicyIntegrity(RAW_POLICY);
  assertExactOrdinaryArray(
    authorities,
    1,
    "Planner 34 operational-status authority collection",
  );
  const candidate: unknown = authorities[0];
  assertExactPlainObject(
    candidate,
    AUTHORITY_FIELDS,
    "Planner 34 operational-status authority",
  );

  for (const field of FORBIDDEN_UNOWNED_FIELDS) {
    if (field in candidate) {
      throw new Error(
        `Planner 34 operational-status authority cannot own field ${field}.`,
      );
    }
  }

  const record =
    candidate as unknown as InteriorOperationalStatusAuthority;
  assertExactOrdinaryArray(
    record.runtimeRequirements,
    2,
    "Planner 34 operational-status authority runtime requirements",
  );

  const accessibility =
    INTERIOR_ACCESSIBILITY_AUTHORITY.find(
      (entry) =>
        entry.id === record.accessibilityAuthorityId,
    );

  if (
    record.id !== AUTHORITY_ID ||
    record.objectiveSourceRecordId !==
      OBJECTIVE_SOURCE_RECORD_ID ||
    record.accessibilityAuthorityId !==
      ACCESSIBILITY_AUTHORITY_ID ||
    record.policyId !== POLICY_ID ||
    record.zooOperationalPolicyId !==
      ZOO_OPERATIONAL_POLICY.id ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceWayName !== "Front Street" ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID ||
    record.status !== "conditional" ||
    record.activation !== "runtime-check-required" ||
    JSON.stringify(record.runtimeRequirements) !==
      JSON.stringify(ACTIVATION_REQUIREMENTS) ||
    record.ingressClosureAdvisementApplicability !==
      "not-interior-segment-authority" ||
    record.stairsAuthorityState !==
      "independent-unresolved" ||
    record.strollerAuthorityState !==
      "facility-permission-not-route-suitability" ||
    record.selectionScope !== "objective-only" ||
    record.globalEndpointSelection !== "unresolved" ||
    record.plannerMaterialization !==
      "operational-status-only"
  ) {
    throw new Error(
      "Planner 34 operational-status authority drifted from the frozen exact-segment contract.",
    );
  }

  if (
    !accessibility ||
    accessibility.objectiveSourceRecordId !==
      record.objectiveSourceRecordId ||
    accessibility.sourceWayId !== record.sourceWayId ||
    accessibility.sourceWayName !== record.sourceWayName ||
    accessibility.sourceFromNodeId !==
      record.sourceFromNodeId ||
    accessibility.sourceToNodeId !==
      record.sourceToNodeId ||
    accessibility.accessible !== true ||
    accessibility.operationalEligibility !== "unresolved"
  ) {
    throw new Error(
      "Planner 34 operational-status authority detached from the exact Planner 33 accessibility segment.",
    );
  }
}

function assertRuntimeSnapshot(
  snapshot: InteriorRuntimeOperationalSnapshot,
) {
  assertExactPlainObject(
    snapshot,
    SNAPSHOT_FIELDS,
    "Planner 34 runtime snapshot",
  );

  if (!validDate(snapshot.visitDate)) {
    throw new Error(
      "Planner 34 visitDate must be a real YYYY-MM-DD date.",
    );
  }

  assertExactPlainObject(
    snapshot.zooHours,
    TIMED_EVIDENCE_FIELDS,
    "Planner 34 Zoo-hours evidence",
  );
  if (
    !["inside", "outside", "unknown"].includes(
      snapshot.zooHours.status,
    )
  ) {
    throw new Error(
      "Planner 34 Zoo-hours status is invalid.",
    );
  }
  assertTimedEvidence(
    "Planner 34 Zoo-hours",
    snapshot.zooHours,
  );

  assertOrdinaryDenseArray(
    snapshot.exactSegmentAvailability,
    "Planner 34 exact-segment availability evidence",
  );

  let matchedSegmentCount = 0;
  const seenEvidenceIds = new Set<string>();

  for (
    const evidence of snapshot.exactSegmentAvailability
  ) {
    assertExactPlainObject(
      evidence,
      SEGMENT_EVIDENCE_FIELDS,
      "Planner 34 exact-segment availability record",
    );
    if (
      ![
        "available",
        "unavailable",
        "unknown",
      ].includes(evidence.status)
    ) {
      throw new Error(
        "Planner 34 exact-segment availability status is invalid.",
      );
    }
    assertTimedEvidence(
      "Planner 34 exact-segment availability",
      evidence,
    );

    if (seenEvidenceIds.has(evidence.evidenceId)) {
      throw new Error(
        `Planner 34 exact-segment availability duplicates evidenceId ${evidence.evidenceId}.`,
      );
    }
    seenEvidenceIds.add(evidence.evidenceId);

    if (
      evidence.objectiveSourceRecordId !==
        OBJECTIVE_SOURCE_RECORD_ID ||
      evidence.sourceWayId !== SOURCE_WAY_ID ||
      evidence.sourceFromNodeId !== FROM_NODE_ID ||
      evidence.sourceToNodeId !== TO_NODE_ID
    ) {
      throw new Error(
        "Planner 34 exact-segment availability references an unknown interior segment.",
      );
    }

    matchedSegmentCount += 1;
  }

  if (matchedSegmentCount > 1) {
    throw new Error(
      "Planner 34 exact-segment availability cannot duplicate the qualified interior segment.",
    );
  }
}

assertInteriorOperationalStatusPolicyIntegrity(
  RAW_POLICY,
);
assertInteriorOperationalStatusAuthorityIntegrity(
  RAW_AUTHORITY,
);

export const INTERIOR_OPERATIONAL_STATUS_POLICY:
  InteriorOperationalStatusPolicy =
  deepFreeze(RAW_POLICY);

export const INTERIOR_OPERATIONAL_STATUS_AUTHORITY:
  readonly InteriorOperationalStatusAuthority[] =
  deepFreeze(RAW_AUTHORITY);

export function interiorOperationalStatusForObjective(
  objectiveSourceRecordId: string,
) {
  return INTERIOR_OPERATIONAL_STATUS_AUTHORITY.find(
    (record) =>
      record.objectiveSourceRecordId ===
      objectiveSourceRecordId,
  );
}

export function assessInteriorOperationalStatus(
  objectiveSourceRecordId: string,
): InteriorOperationalStatusAssessment {
  const record =
    interiorOperationalStatusForObjective(
      objectiveSourceRecordId,
    );

  if (!record) {
    return deepFreeze({
      status: "blocked",
      reason:
        "OBJECTIVE_OPERATIONAL_STATUS_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }

  return deepFreeze({
    status: "operational-status-ready",
    objectiveSourceRecordId,
    sourceFromNodeId: record.sourceFromNodeId,
    sourceToNodeId: record.sourceToNodeId,
    routeStatus: record.status,
    activation: record.activation,
    runtimeRequirements: [
      ...record.runtimeRequirements,
    ] as const,
    ingressClosureAdvisementApplicability:
      record.ingressClosureAdvisementApplicability,
    stairsAuthorityState:
      record.stairsAuthorityState,
    strollerAuthorityState:
      record.strollerAuthorityState,
    selectionScope: record.selectionScope,
    globalEndpointSelection:
      record.globalEndpointSelection,
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS] as const,
    },
  });
}

export function resolveInteriorRuntimeActivation(
  objectiveSourceRecordId: string,
  snapshot: InteriorRuntimeOperationalSnapshot,
): InteriorRuntimeActivationResult {
  const record =
    interiorOperationalStatusForObjective(
      objectiveSourceRecordId,
    );

  if (!record) {
    return deepFreeze({
      status: "blocked",
      reason:
        "OBJECTIVE_OPERATIONAL_STATUS_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  assertRuntimeSnapshot(snapshot);

  const nowMs = Date.now();
  const evaluatedAt = new Date(nowMs).toISOString();
  const currentZooDate = zooOperationalDateAt(nowMs);
  const visitDateCurrent =
    snapshot.visitDate === currentZooDate;
  const hoursCurrent = evidenceCurrent(
    snapshot.zooHours,
    snapshot.visitDate,
    nowMs,
  );
  const segmentEvidence =
    snapshot.exactSegmentAvailability[0];

  let reason: InteriorRuntimeActivationReason;

  if (!visitDateCurrent) {
    reason = "VISIT_DATE_NOT_CURRENT_ZOO_DATE";
  } else if (snapshot.zooHours.status !== "inside") {
    reason = "HOURS_NOT_CONFIRMED";
  } else if (!hoursCurrent) {
    reason = "HOURS_EVIDENCE_NOT_CURRENT";
  } else if (!segmentEvidence) {
    reason = "SEGMENT_AVAILABILITY_MISSING";
  } else if (segmentEvidence.status !== "available") {
    reason = "SEGMENT_AVAILABILITY_NOT_CONFIRMED";
  } else if (
    !evidenceCurrent(
      segmentEvidence,
      snapshot.visitDate,
      nowMs,
    )
  ) {
    reason = "SEGMENT_AVAILABILITY_NOT_CURRENT";
  } else {
    reason = "ENABLED";
  }

  const enabled = reason === "ENABLED";
  const evidenceIds = [
    snapshot.zooHours.evidenceId,
    ...(segmentEvidence
      ? [segmentEvidence.evidenceId]
      : []),
  ];

  const decision: InteriorRuntimeActivationDecision = {
    objectiveSourceRecordId:
      OBJECTIVE_SOURCE_RECORD_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    status: enabled ? "enabled" : "disabled",
    reason,
    evidenceIds,
    ...(enabled && segmentEvidence
      ? {
          effectiveExpiresAt: earliestExpiry([
            snapshot.zooHours,
            segmentEvidence,
          ]),
        }
      : {}),
  };

  return deepFreeze({
    status: "evaluated",
    visitDate: snapshot.visitDate,
    evaluatedAt,
    objectiveSourceRecordId:
      OBJECTIVE_SOURCE_RECORD_ID,
    decision,
  });
}
