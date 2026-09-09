import {
  INGRESS_GEOMETRY_WAYS,
} from "./zooIngressDistanceAuthority.ts";

export type ZooOperationalPolicyEvidence = {
  id: "sdz-operational-policy-2026-09-08";
  observedAt: string;
  sourceUrls: readonly [
    "https://zoo.sandiegozoo.org/help-center",
    "https://zoo.sandiegozoo.org/plan-your-visit",
  ];
  facilitySchedule: "open-every-day";
  hoursPolicy: "vary-through-year";
  closurePolicy:
    "changes-or-closures-may-occur-without-notice";
  dailyClosureAdvisement:
    "main-entrance";
  plannerStatusPolicy:
    "conditional-until-runtime-activation";
  plannerMaterialization:
    "operational-policy-only";
};

export type OperationalActivationRequirement =
  | "VISIT_WITHIN_CURRENT_ZOO_HOURS"
  | "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT";

export type IngressOperationalStatusAuthority = {
  sourceWayId: string;
  statusAuthority: {
    status: "supported";
    value: "conditional";
    basis:
      "Planner 20 operational-status policy";
    policyEvidenceId:
      ZooOperationalPolicyEvidence["id"];
    activation: {
      status: "runtime-check-required";
      requirements: readonly [
        "VISIT_WITHIN_CURRENT_ZOO_HOURS",
        "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
      ];
    };
  };
};

export type UnknownIngressOperationalStatusAuthority = {
  sourceWayId: string;
  status: "blocked";
  reason: "SOURCE_WAY_UNKNOWN";
};

const OBSERVED_AT =
  "2026-09-08T19:24:00-07:00";

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

function validTimestamp(value: string) {
  return (
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  );
}

function validOfficialOperationalUrl(
  value: string,
) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname ===
        "zoo.sandiegozoo.org" &&
      (url.pathname ===
        "/help-center" ||
        url.pathname ===
          "/plan-your-visit")
    );
  } catch {
    return false;
  }
}

const RAW_OPERATIONAL_POLICY:
  ZooOperationalPolicyEvidence = {
  id: "sdz-operational-policy-2026-09-08",
  observedAt: OBSERVED_AT,
  sourceUrls: [
    "https://zoo.sandiegozoo.org/help-center",
    "https://zoo.sandiegozoo.org/plan-your-visit",
  ],
  facilitySchedule: "open-every-day",
  hoursPolicy: "vary-through-year",
  closurePolicy:
    "changes-or-closures-may-occur-without-notice",
  dailyClosureAdvisement:
    "main-entrance",
  plannerStatusPolicy:
    "conditional-until-runtime-activation",
  plannerMaterialization:
    "operational-policy-only",
};

export function assertZooOperationalPolicyIntegrity(
  policy: ZooOperationalPolicyEvidence,
) {
  if (
    policy.id !==
      "sdz-operational-policy-2026-09-08" ||
    !validTimestamp(policy.observedAt) ||
    policy.observedAt !== OBSERVED_AT ||
    policy.sourceUrls.length !== 2 ||
    policy.sourceUrls[0] !==
      "https://zoo.sandiegozoo.org/help-center" ||
    policy.sourceUrls[1] !==
      "https://zoo.sandiegozoo.org/plan-your-visit" ||
    policy.sourceUrls.some(
      (url) =>
        !validOfficialOperationalUrl(url),
    ) ||
    policy.facilitySchedule !==
      "open-every-day" ||
    policy.hoursPolicy !==
      "vary-through-year" ||
    policy.closurePolicy !==
      "changes-or-closures-may-occur-without-notice" ||
    policy.dailyClosureAdvisement !==
      "main-entrance" ||
    policy.plannerStatusPolicy !==
      "conditional-until-runtime-activation" ||
    policy.plannerMaterialization !==
      "operational-policy-only"
  ) {
    throw new Error(
      "Planner 20 operational policy drifted from the prospective freeze.",
    );
  }
}

assertZooOperationalPolicyIntegrity(
  RAW_OPERATIONAL_POLICY,
);

export const ZOO_OPERATIONAL_POLICY:
  ZooOperationalPolicyEvidence =
  deepFreeze(RAW_OPERATIONAL_POLICY);

const ACTIVATION_REQUIREMENTS =
  Object.freeze([
    "VISIT_WITHIN_CURRENT_ZOO_HOURS",
    "NO_CURRENT_INGRESS_CLOSURE_ADVISEMENT",
  ] as const satisfies readonly OperationalActivationRequirement[]);

export function operationalStatusForIngressWay(
  sourceWayId: string,
):
  | IngressOperationalStatusAuthority
  | UnknownIngressOperationalStatusAuthority {
  const way = INGRESS_GEOMETRY_WAYS.find(
    (candidate) =>
      candidate.sourceObjectId ===
      sourceWayId,
  );

  if (!way) {
    return {
      sourceWayId,
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
    };
  }

  return {
    sourceWayId,
    statusAuthority: {
      status: "supported",
      value: "conditional",
      basis:
        "Planner 20 operational-status policy",
      policyEvidenceId:
        ZOO_OPERATIONAL_POLICY.id,
      activation: {
        status:
          "runtime-check-required",
        requirements:
          ACTIVATION_REQUIREMENTS,
      },
    },
  };
}

export function assertIngressOperationalStatusIntegrity(
  sourceWayIds: readonly string[],
) {
  if (
    sourceWayIds.length !==
    INGRESS_GEOMETRY_WAYS.length ||
    new Set(sourceWayIds).size !==
      sourceWayIds.length
  ) {
    throw new Error(
      "Planner 20 operational status requires exactly one current ingress way binding.",
    );
  }

  for (const sourceWayId of sourceWayIds) {
    const authority =
      operationalStatusForIngressWay(
        sourceWayId,
      );
    if (
      "status" in authority ||
      authority.statusAuthority.status !==
        "supported" ||
      authority.statusAuthority.value !==
        "conditional" ||
      authority.statusAuthority.basis !==
        "Planner 20 operational-status policy" ||
      authority.statusAuthority
        .policyEvidenceId !==
        ZOO_OPERATIONAL_POLICY.id ||
      authority.statusAuthority.activation
        .status !==
        "runtime-check-required" ||
      JSON.stringify(
        authority.statusAuthority.activation
          .requirements,
      ) !==
        JSON.stringify(
          ACTIVATION_REQUIREMENTS,
        )
    ) {
      throw new Error(
        `Planner 20 operational status authority drifted for ingress way ${sourceWayId}.`,
      );
    }
  }
}

assertIngressOperationalStatusIntegrity(
  INGRESS_GEOMETRY_WAYS.map(
    (way) => way.sourceObjectId,
  ),
);
