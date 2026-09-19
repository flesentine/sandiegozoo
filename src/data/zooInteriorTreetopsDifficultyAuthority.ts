import {
  CORRIDOR_TERRAIN_EVIDENCE,
} from "./zooIngressTerrainAuthority.ts";
import {
  INTERIOR_DIFFICULTY_POLICY,
  classifyNamedCorridorDifficulty,
} from "./zooInteriorDifficultyAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "./zooInteriorTreetopsPedestrianDirectionAuthority.ts";
import {
  INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY,
} from "./zooInteriorTreetopsWalkingDurationAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-difficulty" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const DURATION_AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-walking-duration" as const;
const POLICY_ID = "sdz-interior-difficulty-policy-v1" as const;
const CORRIDOR_TERRAIN_EVIDENCE_ID =
  "sdz-corridor-treetops-way-terrain-evidence" as const;
const CORRIDOR_ID = "sdz-corridor-treetops-way" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;

export type InteriorTreetopsDifficultyAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  durationAuthorityId: typeof DURATION_AUTHORITY_ID;
  policyId: typeof POLICY_ID;
  corridorTerrainEvidenceId: typeof CORRIDOR_TERRAIN_EVIDENCE_ID;
  corridorId: typeof CORRIDOR_ID;
  corridorName: "Treetops Way";
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayName: "Treetops Way";
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  publishedTerrain: "mild";
  difficulty: "easy";
  resolutionBasis:
    "official-mild-terrain-on-exact-name-matched-corridor";
  stairsAuthorityState: "independent-unresolved";
  operationalEligibility: "unresolved";
  plannerMaterialization: "difficulty-only";
};

export type InteriorTreetopsDifficultyAssessment =
  | {
      status: "difficulty-ready";
      authorityId: typeof AUTHORITY_ID;
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      difficulty: "easy";
      stairsAuthorityState: "independent-unresolved";
      operationalEligibility: "unresolved";
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
          "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
          "EXACT_SEGMENT_STROLLER_NOT_QUALIFIED",
          "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_QUALIFIED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_DIFFICULTY_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_STAIRS_NOT_QUALIFIED",
  "EXACT_SEGMENT_ACCESSIBILITY_NOT_QUALIFIED",
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

const RAW_AUTHORITY: InteriorTreetopsDifficultyAuthority[] = [
  {
    id: AUTHORITY_ID,
    objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
    durationAuthorityId: DURATION_AUTHORITY_ID,
    policyId: POLICY_ID,
    corridorTerrainEvidenceId: CORRIDOR_TERRAIN_EVIDENCE_ID,
    corridorId: CORRIDOR_ID,
    corridorName: "Treetops Way",
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceWayName: "Treetops Way",
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    publishedTerrain: "mild",
    difficulty: "easy",
    resolutionBasis:
      "official-mild-terrain-on-exact-name-matched-corridor",
    stairsAuthorityState: "independent-unresolved",
    operationalEligibility: "unresolved",
    plannerMaterialization: "difficulty-only",
  },
];

function assertCanonicalInteriorTreetopsDifficultyIntegrity(): void {
  const policy = INTERIOR_DIFFICULTY_POLICY;
  const duration = INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0];
  const sourceSnapshot =
    INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
  const corridor = CORRIDOR_TERRAIN_EVIDENCE.find(
    (entry) => entry.id === CORRIDOR_TERRAIN_EVIDENCE_ID,
  );
  const authority = RAW_AUTHORITY[0];

  if (
    policy.id !== POLICY_ID ||
    policy.policyVersion !== "1" ||
    policy.scope !== "exact-segments-with-exact-named-corridor-match" ||
    policy.supportedPublishedTerrain !== "mild" ||
    policy.plannerDifficulty !== "easy" ||
    policy.corridorProjectionRequirement !==
      "exact-source-way-name-must-equal-official-corridor-name" ||
    policy.exactSegmentRequirement !==
      "qualified-endpoints-must-remain-on-that-source-way" ||
    policy.stairsSemantics !== "independent-not-inferred-from-mild" ||
    policy.authority !== "prospective-product-semantic-policy"
  ) {
    throw new Error(
      "Planner 49 requires the unchanged shared interior difficulty policy.",
    );
  }

  if (
    duration.id !== DURATION_AUTHORITY_ID ||
    duration.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    duration.sourceWayId !== SOURCE_WAY_ID ||
    duration.sourceWayVersion !== SOURCE_WAY_VERSION ||
    duration.sourceFromNodeId !== FROM_NODE_ID ||
    duration.sourceToNodeId !== TO_NODE_ID ||
    duration.durationMinutes !== 0.675 ||
    duration.durationScope !== "neutral-free-flow" ||
    duration.operationalEligibility !== "unresolved"
  ) {
    throw new Error(
      "Planner 49 difficulty authority detached from Planner 48 exact duration segment.",
    );
  }

  if (
    !corridor ||
    corridor.id !== CORRIDOR_TERRAIN_EVIDENCE_ID ||
    corridor.corridorId !== CORRIDOR_ID ||
    corridor.corridorName !== "Treetops Way" ||
    corridor.publishedTerrain !== "mild" ||
    corridor.stairsEvidence !== "not-explicitly-published" ||
    corridor.plannerDifficultyAuthority !== "source-terrain-only" ||
    corridor.plannerStairsAuthority !== "corridor-only" ||
    corridor.scope !== "named-corridor"
  ) {
    throw new Error(
      "Planner 49 difficulty authority detached from official Treetops Way terrain evidence.",
    );
  }

  if (
    sourceSnapshot.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    sourceSnapshot.sourceWayId !== SOURCE_WAY_ID ||
    sourceSnapshot.sourceWayVersion !== SOURCE_WAY_VERSION ||
    sourceSnapshot.sourceTags.name !== "Treetops Way" ||
    sourceSnapshot.sourceState !== "exact-version-complete-tag-set"
  ) {
    throw new Error(
      "Planner 49 requires Planner 47 exact source-way identity and name evidence.",
    );
  }

  const classification = classifyNamedCorridorDifficulty({
    publishedTerrain: corridor.publishedTerrain,
    corridorName: corridor.corridorName,
    exactSourceWayName: sourceSnapshot.sourceTags.name,
  });

  if (
    classification.status !== "supported" ||
    classification.difficulty !== "easy" ||
    classification.basis !==
      "official-mild-terrain-on-exact-name-matched-corridor"
  ) {
    throw new Error(
      "Planner 49 difficulty does not reproduce from the shared exact-name policy.",
    );
  }

  if (
    authority.id !== AUTHORITY_ID ||
    authority.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    authority.durationAuthorityId !== DURATION_AUTHORITY_ID ||
    authority.policyId !== POLICY_ID ||
    authority.corridorTerrainEvidenceId !== CORRIDOR_TERRAIN_EVIDENCE_ID ||
    authority.corridorId !== CORRIDOR_ID ||
    authority.corridorName !== "Treetops Way" ||
    authority.sourceWayId !== SOURCE_WAY_ID ||
    authority.sourceWayVersion !== SOURCE_WAY_VERSION ||
    authority.sourceWayName !== "Treetops Way" ||
    authority.sourceFromNodeId !== FROM_NODE_ID ||
    authority.sourceToNodeId !== TO_NODE_ID ||
    authority.publishedTerrain !== "mild" ||
    authority.difficulty !== "easy" ||
    authority.resolutionBasis !== classification.basis ||
    authority.stairsAuthorityState !== "independent-unresolved" ||
    authority.operationalEligibility !== "unresolved" ||
    authority.plannerMaterialization !== "difficulty-only"
  ) {
    throw new Error(
      "Planner 49 difficulty authority drifted from the frozen exact-segment contract.",
    );
  }

  for (const field of [
    "mode",
    "distanceMeters",
    "durationMinutes",
    "oneWay",
    "direction",
    "stairs",
    "accessible",
    "stroller",
    "status",
    "routeNodeId",
    "routeEdgeId",
  ] as const) {
    if (Object.hasOwn(authority, field)) {
      throw new Error(
        `Planner 49 difficulty authority cannot own downstream field ${field}.`,
      );
    }
  }
}

assertCanonicalInteriorTreetopsDifficultyIntegrity();

export const INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY:
  readonly InteriorTreetopsDifficultyAuthority[] =
    deepFreeze(RAW_AUTHORITY);

export function interiorTreetopsDifficultyForObjective(
  objectiveSourceRecordId: string,
): InteriorTreetopsDifficultyAuthority | undefined {
  return INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY.find(
    (record) => record.objectiveSourceRecordId === objectiveSourceRecordId,
  );
}

export function assessInteriorTreetopsDifficulty(
  objectiveSourceRecordId: string,
): InteriorTreetopsDifficultyAssessment {
  const difficulty =
    interiorTreetopsDifficultyForObjective(objectiveSourceRecordId);

  if (!difficulty) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_DIFFICULTY_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "difficulty-ready",
    authorityId: difficulty.id,
    objectiveSourceRecordId: difficulty.objectiveSourceRecordId,
    sourceWayId: difficulty.sourceWayId,
    sourceWayVersion: difficulty.sourceWayVersion,
    sourceFromNodeId: difficulty.sourceFromNodeId,
    sourceToNodeId: difficulty.sourceToNodeId,
    difficulty: difficulty.difficulty,
    stairsAuthorityState: difficulty.stairsAuthorityState,
    operationalEligibility: difficulty.operationalEligibility,
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
