import type { SourceProvenance } from "../planner/contracts.ts";
import {
  INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY,
} from "./zooInteriorTreetopsV7GeometryAuthority.ts";
import {
  INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY,
} from "./zooInteriorTreetopsHistoricalTopologyAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY,
} from "./zooInteriorTreetopsPedestrianModeAuthority.ts";
import {
  INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY,
} from "./zooInteriorTreetopsSegmentDistanceAuthority.ts";
import {
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY,
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "./zooInteriorTreetopsPedestrianDirectionAuthority.ts";
import {
  INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY,
} from "./zooInteriorTreetopsWalkingDurationAuthority.ts";
import {
  INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY,
} from "./zooInteriorTreetopsDifficultyAuthority.ts";
import {
  INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorTreetopsAccessibilityAuthority.ts";
import {
  INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY,
} from "./zooInteriorTreetopsOperationalStatusAuthority.ts";
import {
  INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT,
} from "./zooInteriorTreetopsStairsAuthority.ts";
import {
  INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT,
} from "./zooInteriorTreetopsStrollerAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-treetops-anchor-to-fern-canyon-provenance" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const SOURCE_WAY_ID = "148910139" as const;
const SOURCE_WAY_VERSION = 7 as const;
const SOURCE_WAY_VERSION_URL =
  "https://api.openstreetmap.org/api/0.6/way/148910139/7" as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T20:28:40Z" as const;
const SOURCE_WAY_CHANGESET = 178875711 as const;
const SOURCE_OBSERVED_AT = "2026-09-19T11:08:15-07:00" as const;
const FROM_NODE_ID = "1619736626" as const;
const TO_NODE_ID = "13588159626" as const;
const EFFECTIVE_FROM = "2026-09-19" as const;

export type InteriorTreetopsProvenanceLineage = {
  geometryAuthorityId: string;
  topologyAuthorityId: string;
  modeAuthorityId: string;
  distanceAuthorityId: string;
  directionSourceSnapshotId: string;
  directionAuthorityId: string;
  durationAuthorityId: string;
  difficultyAuthorityId: string;
  accessibilityAuthorityId: string;
  operationalStatusAuthorityId: string;
  stairsEvidenceAuditId: string;
  strollerEvidenceAuditId: string;
};

export type InteriorTreetopsProvenanceAuthority = {
  id: typeof AUTHORITY_ID;
  objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
  sourceWayId: typeof SOURCE_WAY_ID;
  sourceWayVersion: typeof SOURCE_WAY_VERSION;
  sourceWayVersionUrl: typeof SOURCE_WAY_VERSION_URL;
  sourceWayTimestamp: typeof SOURCE_WAY_TIMESTAMP;
  sourceWayChangeset: typeof SOURCE_WAY_CHANGESET;
  sourceObservedAt: typeof SOURCE_OBSERVED_AT;
  sourceFromNodeId: typeof FROM_NODE_ID;
  sourceToNodeId: typeof TO_NODE_ID;
  lineage: InteriorTreetopsProvenanceLineage;
  provenance: SourceProvenance;
  provenanceScope:
    "version-pinned-treetops-source-plus-qualified-semantic-lineage";
  confidenceRationale:
    "provenance-complete-while-stairs-and-stroller-remain-unresolved";
  semanticCompletion: "blocked";
  unresolvedSemanticBlockers: readonly [
    "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  ];
  plannerMaterialization: "provenance-only";
};

export type InteriorTreetopsProvenanceAssessment =
  | {
      status: "provenance-ready";
      authorityId: typeof AUTHORITY_ID;
      objectiveSourceRecordId: typeof OBJECTIVE_SOURCE_RECORD_ID;
      sourceWayId: typeof SOURCE_WAY_ID;
      sourceWayVersion: typeof SOURCE_WAY_VERSION;
      sourceFromNodeId: typeof FROM_NODE_ID;
      sourceToNodeId: typeof TO_NODE_ID;
      provenance: SourceProvenance;
      confidenceRationale:
        "provenance-complete-while-stairs-and-stroller-remain-unresolved";
      routeGraphExpansion: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_TREETOPS_PROVENANCE_NOT_SOURCED";
      objectiveSourceRecordId: string;
    };

const REMAINING_BLOCK_REASONS = [
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
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

const geometry = INTERIOR_TREETOPS_V7_GEOMETRY_AUTHORITY[0];
const topology = INTERIOR_TREETOPS_HISTORICAL_TOPOLOGY_AUTHORITY[0];
const mode = INTERIOR_TREETOPS_PEDESTRIAN_MODE_AUTHORITY[0];
const distance = INTERIOR_TREETOPS_SEGMENT_DISTANCE_AUTHORITY[0];
const directionSnapshot =
  INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
const direction = INTERIOR_TREETOPS_PEDESTRIAN_DIRECTION_AUTHORITY[0];
const duration = INTERIOR_TREETOPS_WALKING_DURATION_AUTHORITY[0];
const difficulty = INTERIOR_TREETOPS_DIFFICULTY_AUTHORITY[0];
const accessibility = INTERIOR_TREETOPS_ACCESSIBILITY_AUTHORITY[0];
const operational =
  INTERIOR_TREETOPS_OPERATIONAL_STATUS_AUTHORITY[0];
const stairs = INTERIOR_TREETOPS_STAIRS_EVIDENCE_AUDIT[0];
const stroller = INTERIOR_TREETOPS_STROLLER_EVIDENCE_AUDIT[0];

const RAW_LINEAGE: InteriorTreetopsProvenanceLineage = {
  geometryAuthorityId: geometry.id,
  topologyAuthorityId: topology.id,
  modeAuthorityId: mode.id,
  distanceAuthorityId: distance.id,
  directionSourceSnapshotId: directionSnapshot.id,
  directionAuthorityId: direction.id,
  durationAuthorityId: duration.id,
  difficultyAuthorityId: difficulty.id,
  accessibilityAuthorityId: accessibility.id,
  operationalStatusAuthorityId: operational.id,
  stairsEvidenceAuditId: stairs.id,
  strollerEvidenceAuditId: stroller.id,
};

const RAW_PROVENANCE: SourceProvenance = {
  sourceUrl: SOURCE_WAY_VERSION_URL,
  sourceLabel:
    "OpenStreetMap way 148910139 v7 with WildRoute Treetops exact-segment semantic lineage",
  lastVerified: SOURCE_OBSERVED_AT,
  confidence: "provisional",
  effectiveFrom: EFFECTIVE_FROM,
};

const RAW_AUTHORITY: InteriorTreetopsProvenanceAuthority = {
  id: AUTHORITY_ID,
  objectiveSourceRecordId: OBJECTIVE_SOURCE_RECORD_ID,
  sourceWayId: SOURCE_WAY_ID,
  sourceWayVersion: SOURCE_WAY_VERSION,
  sourceWayVersionUrl: SOURCE_WAY_VERSION_URL,
  sourceWayTimestamp: SOURCE_WAY_TIMESTAMP,
  sourceWayChangeset: SOURCE_WAY_CHANGESET,
  sourceObservedAt: SOURCE_OBSERVED_AT,
  sourceFromNodeId: FROM_NODE_ID,
  sourceToNodeId: TO_NODE_ID,
  lineage: RAW_LINEAGE,
  provenance: RAW_PROVENANCE,
  provenanceScope:
    "version-pinned-treetops-source-plus-qualified-semantic-lineage",
  confidenceRationale:
    "provenance-complete-while-stairs-and-stroller-remain-unresolved",
  semanticCompletion: "blocked",
  unresolvedSemanticBlockers: [...REMAINING_BLOCK_REASONS],
  plannerMaterialization: "provenance-only",
};

function assertExactSegment(
  label: string,
  record: {
    objectiveSourceRecordId: string;
    sourceWayId: string;
    sourceFromNodeId: string;
    sourceToNodeId: string;
  },
): void {
  if (
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID
  ) {
    throw new Error(
      `Planner 54 ${label} detached from the exact Treetops segment.`,
    );
  }
}

function assertCanonicalInteriorTreetopsProvenanceIntegrity(): void {
  if (
    directionSnapshot.sourceWayId !== SOURCE_WAY_ID ||
    directionSnapshot.sourceWayVersion !== SOURCE_WAY_VERSION ||
    directionSnapshot.sourceWayVersionUrl !== SOURCE_WAY_VERSION_URL ||
    directionSnapshot.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    directionSnapshot.sourceWayChangeset !== SOURCE_WAY_CHANGESET ||
    directionSnapshot.observedAt !== SOURCE_OBSERVED_AT ||
    directionSnapshot.sourceState !== "exact-version-complete-tag-set"
  ) {
    throw new Error(
      "Planner 54 provenance detached from the exact OSM v7 source snapshot.",
    );
  }

  if (
    geometry.sourceWayId !== SOURCE_WAY_ID ||
    geometry.sourceWayVersion !== SOURCE_WAY_VERSION ||
    topology.sourceWayId !== SOURCE_WAY_ID ||
    topology.sourceWayVersion !== SOURCE_WAY_VERSION
  ) {
    throw new Error(
      "Planner 54 geometry/topology lineage detached from Treetops v7.",
    );
  }

  for (const [label, record] of [
    ["mode authority", mode],
    ["distance authority", distance],
    ["direction authority", direction],
    ["duration authority", duration],
    ["difficulty authority", difficulty],
    ["accessibility authority", accessibility],
    ["operational-status authority", operational],
    ["stairs evidence audit", stairs],
    ["stroller evidence audit", stroller],
  ] as const) {
    assertExactSegment(label, record);
  }

  if (
    stairs.result !== "blocked" ||
    stairs.blocker !== "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    stairs.stairs !== "unknown" ||
    stroller.result !== "blocked" ||
    stroller.blocker !== "EXACT_SEGMENT_STROLLER_NOT_SOURCED" ||
    stroller.stroller !== "unknown"
  ) {
    throw new Error(
      "Planner 54 provenance requires stairs and stroller to remain explicitly unresolved.",
    );
  }

  const expectedLineage = [
    geometry.id,
    topology.id,
    mode.id,
    distance.id,
    directionSnapshot.id,
    direction.id,
    duration.id,
    difficulty.id,
    accessibility.id,
    operational.id,
    stairs.id,
    stroller.id,
  ];
  const actualLineage = [
    RAW_LINEAGE.geometryAuthorityId,
    RAW_LINEAGE.topologyAuthorityId,
    RAW_LINEAGE.modeAuthorityId,
    RAW_LINEAGE.distanceAuthorityId,
    RAW_LINEAGE.directionSourceSnapshotId,
    RAW_LINEAGE.directionAuthorityId,
    RAW_LINEAGE.durationAuthorityId,
    RAW_LINEAGE.difficultyAuthorityId,
    RAW_LINEAGE.accessibilityAuthorityId,
    RAW_LINEAGE.operationalStatusAuthorityId,
    RAW_LINEAGE.stairsEvidenceAuditId,
    RAW_LINEAGE.strollerEvidenceAuditId,
  ];

  if (JSON.stringify(actualLineage) !== JSON.stringify(expectedLineage)) {
    throw new Error(
      "Planner 54 semantic lineage detached from a qualified predecessor.",
    );
  }

  if (
    RAW_AUTHORITY.id !== AUTHORITY_ID ||
    RAW_AUTHORITY.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    RAW_AUTHORITY.sourceWayId !== SOURCE_WAY_ID ||
    RAW_AUTHORITY.sourceWayVersion !== SOURCE_WAY_VERSION ||
    RAW_AUTHORITY.sourceWayVersionUrl !== SOURCE_WAY_VERSION_URL ||
    RAW_AUTHORITY.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    RAW_AUTHORITY.sourceWayChangeset !== SOURCE_WAY_CHANGESET ||
    RAW_AUTHORITY.sourceObservedAt !== SOURCE_OBSERVED_AT ||
    RAW_AUTHORITY.sourceFromNodeId !== FROM_NODE_ID ||
    RAW_AUTHORITY.sourceToNodeId !== TO_NODE_ID ||
    RAW_AUTHORITY.provenance.sourceUrl !== SOURCE_WAY_VERSION_URL ||
    RAW_AUTHORITY.provenance.lastVerified !== SOURCE_OBSERVED_AT ||
    RAW_AUTHORITY.provenance.confidence !== "provisional" ||
    RAW_AUTHORITY.provenance.effectiveFrom !== EFFECTIVE_FROM ||
    RAW_AUTHORITY.provenanceScope !==
      "version-pinned-treetops-source-plus-qualified-semantic-lineage" ||
    RAW_AUTHORITY.confidenceRationale !==
      "provenance-complete-while-stairs-and-stroller-remain-unresolved" ||
    RAW_AUTHORITY.semanticCompletion !== "blocked" ||
    RAW_AUTHORITY.unresolvedSemanticBlockers.length !== 2 ||
    RAW_AUTHORITY.unresolvedSemanticBlockers[0] !==
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    RAW_AUTHORITY.unresolvedSemanticBlockers[1] !==
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED" ||
    RAW_AUTHORITY.plannerMaterialization !== "provenance-only"
  ) {
    throw new Error(
      "Planner 54 Treetops provenance authority drifted from its frozen boundary.",
    );
  }

  for (const field of [
    "routeNodeId",
    "routeEdgeId",
    "fromNodeId",
    "toNodeId",
    "stairs",
    "stroller",
  ] as const) {
    if (Object.hasOwn(RAW_AUTHORITY, field)) {
      throw new Error(
        `Planner 54 provenance authority cannot materialize ${field}.`,
      );
    }
  }
}

assertCanonicalInteriorTreetopsProvenanceIntegrity();

export const INTERIOR_TREETOPS_PROVENANCE_AUTHORITY:
  InteriorTreetopsProvenanceAuthority =
    deepFreeze(RAW_AUTHORITY);

export function assessInteriorTreetopsProvenance(
  objectiveSourceRecordId: string,
): InteriorTreetopsProvenanceAssessment {
  if (objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_TREETOPS_PROVENANCE_NOT_SOURCED",
      objectiveSourceRecordId,
    });
  }

  return deepFreeze({
    status: "provenance-ready",
    authorityId: INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.id,
    objectiveSourceRecordId,
    sourceWayId: SOURCE_WAY_ID,
    sourceWayVersion: SOURCE_WAY_VERSION,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    provenance: {
      ...INTERIOR_TREETOPS_PROVENANCE_AUTHORITY.provenance,
    },
    confidenceRationale:
      "provenance-complete-while-stairs-and-stroller-remain-unresolved",
    routeGraphExpansion: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS],
    },
  });
}
