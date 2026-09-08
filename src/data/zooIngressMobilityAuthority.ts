import {
  OFFICIAL_ZOO_MAP_ARTIFACTS,
  PUBLISHED_WALKING_CORRIDORS,
} from "./zooMapAuthority.ts";
import {
  INGRESS_GEOMETRY_WAYS,
} from "./zooIngressDistanceAuthority.ts";

export type AccessibilityCorridorEvidence = {
  id: string;
  artifactId: string;
  corridorId: string;
  corridorName: string;
  sourceUrl: string;
  observedAt: string;
  wheelchairIndicator: "shown";
  mapRouteLegend:
    "ADA MOST ACCESSIBLE ROUTE";
  scope: "named-corridor";
  plannerMaterialization:
    "corridor-accessibility-evidence-only";
};

export type StrollerFacilityPolicyEvidence = {
  id: string;
  sourceUrl: string;
  sourceLabel: string;
  observedAt: string;
  scope: "facility-policy";
  strollerPolicy: "allowed";
  routeSuitabilityAuthority: "not-established";
  plannerMaterialization:
    "facility-stroller-policy-only";
};

export type IngressMobilityAssessment = {
  sourceWayId: string;
  accessibilityAuthority: {
    status: "blocked";
    reason:
      | "EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED"
      | "CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY";
    basis: "Planner 17 accessibility authority";
    corridorEvidenceId?: string;
  };
  strollerAuthority: {
    status: "blocked";
    reason:
      "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY";
    basis: "Planner 17 stroller authority";
    policyEvidenceId: string;
  };
};

const ACCESSIBILITY_MAP_ID =
  "sdz-map-2026-01-05-accessibility";
const FRONT_STREET_CORRIDOR_ID =
  "sdz-corridor-front-street";
const CURRENT_OBSERVED_AT =
  "2026-09-08T15:54:00-07:00";

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

function stableId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function validTimestamp(value: string) {
  return (
    Number.isFinite(Date.parse(value)) &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  );
}

function validZooUrl(
  value: string,
  path:
    | "accessibility-map"
    | "guests-with-disabilities",
) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "zoo.sandiegozoo.org"
    ) {
      return false;
    }

    return path === "accessibility-map"
      ? url.pathname ===
          "/sites/default/files/2026-01/Zoo_ADA_Map_01-05-26_web.pdf"
      : url.pathname ===
          "/visit/guests-with-disabilities";
  } catch {
    return false;
  }
}

const RAW_CORRIDOR_EVIDENCE:
  AccessibilityCorridorEvidence[] = [
  {
    id: "sdz-accessibility-front-street-wheelchair-indicator",
    artifactId: ACCESSIBILITY_MAP_ID,
    corridorId: FRONT_STREET_CORRIDOR_ID,
    corridorName: "Front Street",
    sourceUrl:
      "https://zoo.sandiegozoo.org/sites/default/files/2026-01/Zoo_ADA_Map_01-05-26_web.pdf",
    observedAt: "2026-09-07T21:53:00-07:00",
    wheelchairIndicator: "shown",
    mapRouteLegend:
      "ADA MOST ACCESSIBLE ROUTE",
    scope: "named-corridor",
    plannerMaterialization:
      "corridor-accessibility-evidence-only",
  },
];

const RAW_STROLLER_POLICY:
  StrollerFacilityPolicyEvidence = {
  id: "sdz-stroller-facility-policy-2026-09-08",
  sourceUrl:
    "https://zoo.sandiegozoo.org/visit/guests-with-disabilities",
  sourceLabel:
    "San Diego Zoo — Guests with Disabilities",
  observedAt: CURRENT_OBSERVED_AT,
  scope: "facility-policy",
  strollerPolicy: "allowed",
  routeSuitabilityAuthority: "not-established",
  plannerMaterialization:
    "facility-stroller-policy-only",
};

export function assertIngressMobilityAuthorityIntegrity(
  corridorEvidence:
    readonly AccessibilityCorridorEvidence[],
  strollerPolicy: StrollerFacilityPolicyEvidence,
) {
  const accessibilityMap =
    OFFICIAL_ZOO_MAP_ARTIFACTS.find(
      (artifact) =>
        artifact.id === ACCESSIBILITY_MAP_ID,
    );
  const frontStreet =
    PUBLISHED_WALKING_CORRIDORS.find(
      (corridor) =>
        corridor.id === FRONT_STREET_CORRIDOR_ID,
    );

  if (
    !accessibilityMap ||
    accessibilityMap.kind !== "accessibility-map" ||
    !frontStreet ||
    frontStreet.name !== "Front Street" ||
    frontStreet.artifactId !== accessibilityMap.id
  ) {
    throw new Error(
      "Planner 17 requires the qualified official Front Street accessibility-map corridor authority.",
    );
  }

  if (corridorEvidence.length !== 1) {
    throw new Error(
      "Planner 17 currently requires exactly one qualified corridor accessibility evidence record.",
    );
  }

  const evidence = corridorEvidence[0];
  if (
    !stableId(evidence.id) ||
    evidence.artifactId !== accessibilityMap.id ||
    evidence.corridorId !== frontStreet.id ||
    evidence.corridorName !== frontStreet.name ||
    evidence.sourceUrl !==
      accessibilityMap.sourceUrl ||
    evidence.observedAt !==
      accessibilityMap.observedAt ||
    !validZooUrl(
      evidence.sourceUrl,
      "accessibility-map",
    ) ||
    evidence.wheelchairIndicator !== "shown" ||
    evidence.mapRouteLegend !==
      "ADA MOST ACCESSIBLE ROUTE" ||
    evidence.scope !== "named-corridor" ||
    evidence.plannerMaterialization !==
      "corridor-accessibility-evidence-only"
  ) {
    throw new Error(
      "Planner 17 Front Street accessibility evidence drifted from qualified map authority.",
    );
  }

  if (
    !stableId(strollerPolicy.id) ||
    !stableId(strollerPolicy.sourceLabel) ||
    !validZooUrl(
      strollerPolicy.sourceUrl,
      "guests-with-disabilities",
    ) ||
    !validTimestamp(
      strollerPolicy.observedAt,
    ) ||
    strollerPolicy.scope !==
      "facility-policy" ||
    strollerPolicy.strollerPolicy !==
      "allowed" ||
    strollerPolicy.routeSuitabilityAuthority !==
      "not-established" ||
    strollerPolicy.plannerMaterialization !==
      "facility-stroller-policy-only"
  ) {
    throw new Error(
      "Planner 17 stroller facility-policy evidence is malformed.",
    );
  }

  if (
    Date.parse(strollerPolicy.observedAt) <
    Date.parse(accessibilityMap.observedAt)
  ) {
    throw new Error(
      "Planner 17 stroller policy observation cannot predate the qualified accessibility-map observation.",
    );
  }
}

assertIngressMobilityAuthorityIntegrity(
  RAW_CORRIDOR_EVIDENCE,
  RAW_STROLLER_POLICY,
);

export const INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE:
  readonly AccessibilityCorridorEvidence[] =
  deepFreeze(RAW_CORRIDOR_EVIDENCE);

export const INGRESS_STROLLER_FACILITY_POLICY:
  StrollerFacilityPolicyEvidence =
  deepFreeze(RAW_STROLLER_POLICY);

export function accessibilityCorridorEvidenceForId(
  corridorId: string,
) {
  return INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE.find(
    (evidence) =>
      evidence.corridorId === corridorId,
  );
}

export function assessIngressMobilityAuthority(
  sourceWayId: string,
): IngressMobilityAssessment | {
  sourceWayId: string;
  status: "blocked";
  reason: "SOURCE_WAY_UNKNOWN";
} {
  const way = INGRESS_GEOMETRY_WAYS.find(
    (candidate) =>
      candidate.sourceObjectId === sourceWayId,
  );

  if (!way) {
    return {
      sourceWayId,
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
    };
  }

  const frontStreetEvidence =
    accessibilityCorridorEvidenceForId(
      FRONT_STREET_CORRIDOR_ID,
    );

  if (!frontStreetEvidence) {
    throw new Error(
      "Planner 17 qualified Front Street accessibility evidence is unavailable.",
    );
  }

  const touchesFrontStreet =
    sourceWayId === "755054694";

  return {
    sourceWayId,
    accessibilityAuthority: {
      status: "blocked",
      reason: touchesFrontStreet
        ? "CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY"
        : "EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED",
      basis:
        "Planner 17 accessibility authority",
      ...(touchesFrontStreet
        ? {
            corridorEvidenceId:
              frontStreetEvidence.id,
          }
        : {}),
    },
    strollerAuthority: {
      status: "blocked",
      reason:
        "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY",
      basis:
        "Planner 17 stroller authority",
      policyEvidenceId:
        INGRESS_STROLLER_FACILITY_POLICY.id,
    },
  };
}
