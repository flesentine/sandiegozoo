import {
  OFFICIAL_ZOO_MAP_ARTIFACTS,
  PUBLISHED_WALKING_CORRIDORS,
} from "./zooMapAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_POLICY,
  classifyNamedCorridorAccessibility,
} from "./zooInteriorAccessibilityAuthority.ts";
import {
  INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY,
} from "./zooInteriorTreetopsDifficultyAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-accessibility" as const;
const EVIDENCE_ID =
  "sdz-accessibility-treetops-way-wheelchair-indicator" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const DIFFICULTY_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-difficulty" as const;
const POLICY_ID = "sdz-interior-accessibility-policy-v1" as const;
const ACCESSIBILITY_MAP_ID =
  "sdz-map-2026-01-05-accessibility" as const;
const CORRIDOR_ID = "sdz-corridor-treetops-way" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;

export type InteriorTreetopsAccessibilityEvidence = {
  id: typeof EVIDENCE_ID;
  artifactId: typeof ACCESSIBILITY_MAP_ID;
  corridorId: typeof CORRIDOR_ID;
  corridorName: "Treetops Way";
  sourceUrl:
    "https://zoo.sandiegozoo.org/sites/default/files/2026-01/Zoo_ADA_Map_01-05-26_web.pdf";
  observedAt: "2026-09-07T21:53:00-07:00";
  wheelchairIndicator: "shown";
  mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE";
  walkingGuideLabel: "TREETOPS WAY";
  publishedWalkMinutes: 7;
  publishedTerrain: "mild";
  scope: "named-corridor";
  plannerMaterialization: "corridor-accessibility-evidence-only";
};

export type InteriorTreetopsAccessibilityAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  difficultyAuthorityId: typeof DIFFICULTY_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  corridorAccessibilityEvidenceId: typeof EVIDENCE_ID;
  corridorId: typeof CORRIDOR_ID;
  corridorName: "Treetops Way";
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayName: "Treetops Way";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  wheelchairIndicator: "shown";
  mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE";
  accessible: true;
  resolutionBasis:
    "official-wheelchair-indicator-on-exact-name-matched-ada-corridor";
  stairsAuthorityState: "independent-unresolved";
  strollerAuthorityState:
    "facility-permission-not-route-suitability";
  operationalEligibility: "unresolved";
  plannerMaterialization: "accessibility-only";
};

export type InteriorTreetopsAccessibilityAssessment =
  | {
      status: "accessibility-ready";
      authorityId: typeof AUTHORITY_ID;
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      accessible: true;
      stairsAuthorityState: "independent-unresolved";
      strollerAuthorityState:
        "facility-permission-not-route-suitability";
      operationalEligibility: "unresolved";
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
          "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
          "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_ACCESSIBILITY_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
  "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
  "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
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

const RAW_EVIDENCE: InteriorTreetopsAccessibilityEvidence = {
  id: EVIDENCE_ID,
  artifactId: ACCESSIBILITY_MAP_ID,
  corridorId: CORRIDOR_ID,
  corridorName: "Treetops Way",
  sourceUrl:
    "https://zoo.sandiegozoo.org/sites/default/files/2026-01/Zoo_ADA_Map_01-05-26_web.pdf",
  observedAt: "2026-09-07T21:53:00-07:00",
  wheelchairIndicator: "shown",
  mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
  walkingGuideLabel: "TREETOPS WAY",
  publishedWalkMinutes: 7,
  publishedTerrain: "mild",
  scope: "named-corridor",
  plannerMaterialization: "corridor-accessibility-evidence-only",
};

const RAW_AUTHORITY: InteriorTreetopsAccessibilityAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    difficultyAuthorityId: DIFFICULTY_AUTHORITY_ID,
    policyId: POLICY_ID,
    corridorAccessibilityEvidenceId: EVIDENCE_ID,
    corridorId: CORRIDOR_ID,
    corridorName: "Treetops Way",
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayName: "Treetops Way",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    wheelchairIndicator: "shown",
    mapRouteLegend: "ADA MOST ACCESSIBLE ROUTE",
    accessible: true,
    resolutionBasis:
      "official-wheelchair-indicator-on-exact-name-matched-ada-corridor",
    stairsAuthorityState: "independent-unresolved",
    strollerAuthorityState:
      "facility-permission-not-route-suitability",
    operationalEligibility: "unresolved",
    plannerMaterialization: "accessibility-only",
  },
];

function assertCanonicalInteriorTreetopsAccessibilityIntegrity(): void {
  const mapArtifact = OFFICIAL_ZOO_MAP_ARTIFACTS.find(
    (entry) => entry.id === ACCESSIBILITY_MAP_ID,
  );
  const corridor = PUBLISHED_WALKING_CORRIDORS.find(
    (entry) => entry.id === CORRIDOR_ID,
  );
  const difficulty = INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY[0];
  const policy = INTERIOR_ACCESSIBILITY_POLICY;
  const evidence = RAW_EVIDENCE;
  const authority = RAW_AUTHORITY[0];

  if (
    !mapArtifact ||
    mapArtifact.kind !== "accessibility-map" ||
    mapArtifact.sourceUrl !== evidence.sourceUrl ||
    mapArtifact.observedAt !== evidence.observedAt ||
    mapArtifact.authority !== "official"
  ) {
    throw new Error(
      "Planner 50 Treetops accessibility evidence detached from the official accessibility map.",
    );
  }

  if (
    !corridor ||
    corridor.name !== "Treetops Way" ||
    corridor.artifactId !== ACCESSIBILITY_MAP_ID ||
    corridor.publishedWalkMinutes !== 7 ||
    corridor.terrain !== "mild" ||
    corridor.sourceRecordRelations?.some(
      (relation) =>
        relation.sourceRecordId === OBJECTIVE_SOURCE_RECORD_ID &&
        relation.relation === "access",
    ) !== true
  ) {
    throw new Error(
      "Planner 50 Treetops accessibility evidence detached from the official walking-corridor authority.",
    );
  }

  if (
    evidence.id !== EVIDENCE_ID ||
    evidence.artifactId !== ACCESSIBILITY_MAP_ID ||
    evidence.corridorId !== CORRIDOR_ID ||
    evidence.corridorName !== "Treetops Way" ||
    evidence.wheelchairIndicator !== "shown" ||
    evidence.mapRouteLegend !== "ADA MOST ACCESSIBLE ROUTE" ||
    evidence.walkingGuideLabel !== "TREETOPS WAY" ||
    evidence.publishedWalkMinutes !== 7 ||
    evidence.publishedTerrain !== "mild" ||
    evidence.scope !== "named-corridor" ||
    evidence.plannerMaterialization !==
      "corridor-accessibility-evidence-only"
  ) {
    throw new Error(
      "Planner 50 Treetops accessibility evidence drifted from the frozen map capture.",
    );
  }

  if (
    difficulty.id !== DIFFICULTY_AUTHORITY_ID ||
    difficulty.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    difficulty.corridorId !== CORRIDOR_ID ||
    difficulty.corridorName !== "Treetops Way" ||
    difficulty.sourceWayId !== SOURCE_WAY_ID ||
    difficulty.sourceWayVersion !== SOURCE_WAY_VERSION ||
    difficulty.sourceWayName !== "Treetops Way" ||
    difficulty.sourceFromNodeId !== FROM_NODE_ID ||
    difficulty.sourceToNodeId !== TO_NODE_ID ||
    difficulty.difficulty !== "easy" ||
    difficulty.stairsAuthorityState !== "independent-unresolved" ||
    difficulty.operationalEligibility !== "unresolved"
  ) {
    throw new Error(
      "Planner 50 accessibility authority detached from Planner 49 exact difficulty segment.",
    );
  }

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.scope !==
      "exact-segments-with-exact-named-accessibility-corridor-match" ||
    policy.supportedWheelchairIndicator !== "shown" ||
    policy.supportedMapRouteLegend !== "ADA MOST ACCESSIBLE ROUTE" ||
    policy.plannerAccessible !== true ||
    policy.corridorProjectionRequirement !==
      "exact-source-way-name-must-equal-official-corridor-name" ||
    policy.exactSegmentRequirement !==
      "qualified-endpoints-must-remain-on-that-source-way" ||
    policy.strollerSemantics !==
      "independent-facility-permission-does-not-establish-route-suitability" ||
    policy.stairsSemantics !== "independent-unresolved" ||
    policy.authority !== "prospective-product-semantic-policy"
  ) {
    throw new Error(
      "Planner 50 requires the unchanged shared interior accessibility policy.",
    );
  }

  const classification = classifyNamedCorridorAccessibility({
    corridorName: evidence.corridorName,
    exactSourceWayName: difficulty.sourceWayName,
    wheelchairIndicator: evidence.wheelchairIndicator,
    mapRouteLegend: evidence.mapRouteLegend,
  });

  if (
    classification.status !== "supported" ||
    classification.accessible !== true ||
    classification.basis !==
      "official-wheelchair-indicator-on-exact-name-matched-ada-corridor"
  ) {
    throw new Error(
      "Planner 50 accessibility does not reproduce from the shared exact-name policy.",
    );
  }

  if (
    authority.id !== AUTHORITY_ID ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.difficultyAuthorityId !== DIFFICULTY_AUTHORITY_ID ||
    authority.policyId !== POLICY_ID ||
    authority.corridorAccessibilityEvidenceId !== EVIDENCE_ID ||
    authority.corridorId !== CORRIDOR_ID ||
    authority.corridorName !== "Treetops Way" ||
    authority.sourceWayId !== SOURCE_WAY_ID ||
    authority.sourceWayVersion !== SOURCE_WAY_VERSION ||
    authority.sourceWayName !== "Treetops Way" ||
    authority.sourceFromNodeId !== FROM_NODE_ID ||
    authority.sourceToNodeId !== TO_NODE_ID ||
    authority.wheelchairIndicator !== "shown" ||
    authority.mapRouteLegend !== "ADA MOST ACCESSIBLE ROUTE" ||
    authority.accessible !== true ||
    authority.resolutionBasis !== classification.basis ||
    authority.stairsAuthorityState !== "independent-unresolved" ||
    authority.strollerAuthorityState !==
      "facility-permission-not-route-suitability" ||
    authority.operationalEligibility !== "unresolved" ||
    authority.plannerMaterialization !== "accessibility-only"
  ) {
    throw new Error(
      "Planner 50 Treetops accessibility authority drifted from the frozen exact-segment contract.",
    );
  }

  for (const field of [
    "mode",
    "distanceMeters",
    "durationMinutes",
    "oneWay",
    "direction",
    "difficulty",
    "stairs",
    "stroller",
    "status",
    "routeNodeId",
    "routeEdgeId",
  ] as const) {
    if (Object.hasOwn(authority, field)) {
      throw new Error(
        `Planner 50 accessibility authority cannot own downstream field ${field}.`,
      );
    }
  }
}

assertCanonicalInteriorTreetopsAccessibilityIntegrity();

export const INTERIOR_TREETOPS_ACCESSIBILITY_EVIDENCE:
  InteriorTreetopsAccessibilityEvidence = deepFreeze(RAW_EVIDENCE);

export const INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY:
  readonly InteriorTreetopsAccessibilityAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function interiorTreetopsAccessibilityForObjective(
  objectiveSourceRecordId: string,
): InteriorTreetopsAccessibilityAuthority | undefined {
  return INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorTreetopsAccessibility(
  objectiveSourceRecordId: string,
): InteriorTreetopsAccessibilityAssessment {
  const accessibility =
    interiorTreetopsAccessibilityForObjective(objectiveSourceRecordId);

  if (!accessibility) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_ACCESSIBILITY_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "accessibility-ready",
    authorityId: accessibility.id,
    objectiveSourceRecordId: accessibility.objectiveSourceRecordId,
    sourceWayId: accessibility.sourceWayId,
    sourceWayVersion: accessibility.sourceWayVersion,
    sourceFromNodeId: accessibility.sourceFromNodeId,
    sourceToNodeId: accessibility.sourceToNodeId,
    accessible: accessibility.accessible,
    stairsAuthorityState: accessibility.stairsAuthorityState,
    strollerAuthorityState: accessibility.strollerAuthorityState,
    operationalEligibility: accessibility.operationalEligibility,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
