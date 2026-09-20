import {
  INTERIOR_OPERATIONAL_STATUS_POLICY,
} from "./zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorTreetopsAccessibilityAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-operational-status" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const ACCESSIBILITY_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-accessibility" as const;
const POLICY_ID = "sdz-interior-operational-status-policy-v1" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;

const ACTIVATION_REQUIREMENTS = [
  "VISIT_WITHIN_CURRENT_ZOO_HOURS",
  "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY",
] as const;

export type InteriorTreetopsOperationalStatusAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  accessibilityAuthorityId: typeof ACCESSIBILITY_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayName: "Treetops Way";
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
  strollerAuthorityState:
    "facility-permission-not-route-suitability";
  plannerMaterialization: "operational-status-only";
};

export type InteriorTreetopsOperationalStatusAssessment =
  | {
      status: "operational-status-ready";
      authorityId: typeof AUTHORITY_ID;
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
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
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
          "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_OPERATIONAL_STATUS_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
  "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
] as const;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

const RAW_AUTHORITY: InteriorTreetopsOperationalStatusAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    accessibilityAuthorityId: ACCESSIBILITY_AUTHORITY_ID,
    policyId: POLICY_ID,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayName: "Treetops Way",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    status: "conditional",
    activation: "runtime-check-required",
    runtimeRequirements: [...ACTIVATION_REQUIREMENTS],
    ingressClosureAdvisementApplicability:
      "not-interior-segment-authority",
    stairsAuthorityState: "independent-unresolved",
    strollerAuthorityState:
      "facility-permission-not-route-suitability",
    plannerMaterialization: "operational-status-only",
  },
];

function assertCanonicalInteriorTreetopsOperationalStatusIntegrity(): void {
  const policy = INTERIOR_OPERATIONAL_STATUS_POLICY;
  const accessibility = INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0];
  const authority = RAW_AUTHORITY[0];

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.scope !== "objective-selected-exact-interior-segments" ||
    policy.plannerStatus !== "conditional" ||
    policy.facilityScheduleAuthority !== "open-every-day" ||
    policy.hoursPolicyAuthority !== "vary-through-year" ||
    policy.closurePolicyAuthority !==
      "changes-or-closures-may-occur-without-notice" ||
    policy.ingressClosureAdvisementSource !== "main-entrance" ||
    policy.ingressClosureAdvisementApplicability !==
      "not-interior-segment-authority" ||
    policy.runtimeRequirements.length !== 2 ||
    policy.runtimeRequirements[0] !==
      "VISIT_WITHIN_CURRENT_ZOO_HOURS" ||
    policy.runtimeRequirements[1] !==
      "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY" ||
    policy.runtimeClockAuthority !==
      "resolver-owned-current-instant-and-zoo-local-date" ||
    policy.authority !== "prospective-product-operational-policy"
  ) {
    throw new Error(
      "Planner 51 requires the unchanged shared interior operational-status policy.",
    );
  }

  if (
    accessibility.id !== ACCESSIBILITY_AUTHORITY_ID ||
    accessibility.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    accessibility.sourceWayId !== SOURCE_WAY_ID ||
    accessibility.sourceWayVersion !== SOURCE_WAY_VERSION ||
    accessibility.sourceWayName !== "Treetops Way" ||
    accessibility.sourceFromNodeId !== FROM_NODE_ID ||
    accessibility.sourceToNodeId !== TO_NODE_ID ||
    accessibility.accessible !== true ||
    accessibility.stairsAuthorityState !== "independent-unresolved" ||
    accessibility.strollerAuthorityState !==
      "facility-permission-not-route-suitability" ||
    accessibility.operationalEligibility !== "unresolved"
  ) {
    throw new Error(
      "Planner 51 operational status detached from Planner 50 exact accessibility segment.",
    );
  }

  if (
    authority.id !== AUTHORITY_ID ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.accessibilityAuthorityId !== ACCESSIBILITY_AUTHORITY_ID ||
    authority.policyId !== POLICY_ID ||
    authority.sourceWayId !== SOURCE_WAY_ID ||
    authority.sourceWayVersion !== SOURCE_WAY_VERSION ||
    authority.sourceWayName !== "Treetops Way" ||
    authority.sourceFromNodeId !== FROM_NODE_ID ||
    authority.sourceToNodeId !== TO_NODE_ID ||
    authority.status !== "conditional" ||
    authority.activation !== "runtime-check-required" ||
    authority.runtimeRequirements.length !== 2 ||
    authority.runtimeRequirements[0] !==
      "VISIT_WITHIN_CURRENT_ZOO_HOURS" ||
    authority.runtimeRequirements[1] !==
      "AFFIRMATIVE_CURRENT_EXACT_SEGMENT_AVAILABILITY" ||
    authority.ingressClosureAdvisementApplicability !==
      "not-interior-segment-authority" ||
    authority.stairsAuthorityState !== "independent-unresolved" ||
    authority.strollerAuthorityState !==
      "facility-permission-not-route-suitability" ||
    authority.plannerMaterialization !== "operational-status-only"
  ) {
    throw new Error(
      "Planner 51 Treetops operational-status authority drifted from the frozen exact-segment contract.",
    );
  }

  if (
    JSON.stringify(authority.runtimeRequirements) !==
    JSON.stringify(policy.runtimeRequirements)
  ) {
    throw new Error(
      "Planner 51 runtime requirements detached from the shared operational policy.",
    );
  }

  for (const field of [
    "mode",
    "distanceMeters",
    "durationMinutes",
    "oneWay",
    "direction",
    "difficulty",
    "accessible",
    "stairs",
    "stroller",
    "provenance",
    "routeNodeId",
    "routeEdgeId",
  ] as const) {
    if (Object.hasOwn(authority, field)) {
      throw new Error(
        `Planner 51 operational-status authority cannot own downstream field ${field}.`,
      );
    }
  }
}

assertCanonicalInteriorTreetopsOperationalStatusIntegrity();

export const INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY:
  readonly InteriorTreetopsOperationalStatusAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function interiorTreetopsOperationalStatusForObjective(
  objectiveSourceRecordId: string,
): InteriorTreetopsOperationalStatusAuthority | undefined {
  return INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorTreetopsOperationalStatus(
  objectiveSourceRecordId: string,
): InteriorTreetopsOperationalStatusAssessment {
  const record =
    interiorTreetopsOperationalStatusForObjective(objectiveSourceRecordId);

  if (!record) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_OPERATIONAL_STATUS_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "operational-status-ready",
    authorityId: record.id,
    objectiveSourceRecordId: record.objectiveSourceRecordId,
    sourceWayId: record.sourceWayId,
    sourceWayVersion: record.sourceWayVersion,
    sourceFromNodeId: record.sourceFromNodeId,
    sourceToNodeId: record.sourceToNodeId,
    routeStatus: record.status,
    activation: record.activation,
    runtimeRequirements: [...record.runtimeRequirements],
    ingressClosureAdvisementApplicability:
      record.ingressClosureAdvisementApplicability,
    stairsAuthorityState: record.stairsAuthorityState,
    strollerAuthorityState: record.strollerAuthorityState,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
