import type { SourceProvenance } from "../planner/contracts.ts";
import {
  INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY,
} from "./zooInteriorFrontStreetGeometryAuthority.ts";
import {
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY,
} from "./zooInteriorObjectiveBranchSelectionAuthority.ts";
import {
  INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY,
} from "./zooInteriorObjectiveSegmentDistanceAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY,
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT,
} from "./zooInteriorPedestrianDirectionAuthority.ts";
import {
  INTERIOR_PEDESTRIAN_MODE_AUTHORITY,
} from "./zooInteriorPedestrianModeAuthority.ts";
import {
  INTERIOR_WALKING_DURATION_AUTHORITY,
} from "./zooInteriorWalkingDurationAuthority.ts";
import {
  INTERIOR_DIFFICULTY_AUTHORITY,
} from "./zooInteriorDifficultyAuthority.ts";
import {
  INTERIOR_ACCESSIBILITY_AUTHORITY,
} from "./zooInteriorAccessibilityAuthority.ts";
import {
  INTERIOR_OPERATIONAL_STATUS_AUTHORITY,
} from "./zooInteriorOperationalStatusAuthority.ts";
import {
  INTERIOR_STAIRS_EVIDENCE_AUDIT,
} from "./zooInteriorStairsAuthority.ts";
import {
  INTERIOR_STROLLER_EVIDENCE_AUDIT,
} from "./zooInteriorStrollerAuthority.ts";

const AUTHORITY_ID =
  "sdz-interior-tiger-trail-front-street-provenance" as const;
const OBJECTIVE_SOURCE_RECORD_ID = "sdz-tiger-trail" as const;
const SOURCE_WAY_ID = "1481425058" as const;
const SOURCE_WAY_VERSION = 1 as const;
const SOURCE_WAY_VERSION_URL =
  "https://api.openstreetmap.org/api/0.6/way/1481425058/1" as const;
const SOURCE_WAY_TIMESTAMP = "2026-02-21T14:47:49Z" as const;
const SOURCE_WAY_CHANGESET = 178862584 as const;
const SOURCE_OBSERVED_AT = "2026-09-10T23:02:16-07:00" as const;
const FROM_NODE_ID = "7053320515" as const;
const TO_NODE_ID = "1619736626" as const;
const EFFECTIVE_FROM = "2026-09-10" as const;

export type InteriorProvenanceLineage = {
  geometryAuthorityId: string;
  branchSelectionAuthorityId: string;
  distanceAuthorityId: string;
  directionSourceSnapshotId: string;
  directionAuthorityId: string;
  modeAuthorityId: string;
  durationAuthorityId: string;
  difficultyAuthorityId: string;
  accessibilityAuthorityId: string;
  operationalStatusAuthorityId: string;
  stairsEvidenceAuditId: string;
  strollerEvidenceAuditId: string;
};

export type InteriorProvenanceAuthority = {
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
  lineage: InteriorProvenanceLineage;
  provenance: SourceProvenance;
  provenanceScope:
    "primary-version-pinned-geometry-source-plus-qualified-semantic-lineage";
  confidenceRationale:
    "provenance-complete-while-stairs-and-stroller-remain-unresolved";
  semanticCompletion: "blocked";
  unresolvedSemanticBlockers: readonly [
    "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
    "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
  ];
  selectionScope: "objective-only";
  globalEndpointSelection: "unresolved";
  plannerMaterialization: "provenance-only";
};

export type InteriorProvenanceAssessment =
  | {
      status: "provenance-ready";
      objectiveSourceRecordId: string;
      sourceFromNodeId: string;
      sourceToNodeId: string;
      provenance: SourceProvenance;
      confidenceRationale:
        "provenance-complete-while-stairs-and-stroller-remain-unresolved";
      selectionScope: "objective-only";
      globalEndpointSelection: "unresolved";
      exactSegmentMaterialization: {
        status: "blocked";
        reasons: readonly [
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
        ];
      };
    }
  | {
      status: "blocked";
      reason: "OBJECTIVE_PROVENANCE_NOT_SOURCED";
      objectiveSourceRecordId: string;
      globalEndpointSelection: "unresolved";
    };

const REMAINING_BLOCK_REASONS = Object.freeze([
  "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
  "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
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

function assertObjectiveSourceRecordId(
  value: unknown,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value !== value.trim()
  ) {
    throw new Error(
      "Planner 37 objectiveSourceRecordId must be a primitive stable string.",
    );
  }
}

function assertExactSegmentIdentity(
  label: string,
  record: {
    objectiveSourceRecordId: string;
    sourceWayId: string;
    sourceFromNodeId: string;
    sourceToNodeId: string;
  },
) {
  if (
    record.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    record.sourceWayId !== SOURCE_WAY_ID ||
    record.sourceFromNodeId !== FROM_NODE_ID ||
    record.sourceToNodeId !== TO_NODE_ID
  ) {
    throw new Error(
      `Planner 37 ${label} detached from the qualified exact segment.`,
    );
  }
}

const geometry = INTERIOR_FRONT_STREET_GEOMETRY_AUTHORITY[0];
const branchSelection =
  INTERIOR_OBJECTIVE_BRANCH_SELECTION_AUTHORITY[0];
const distance = INTERIOR_OBJECTIVE_SEGMENT_DISTANCE_AUTHORITY[0];
const directionSnapshot =
  INTERIOR_PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOT;
const direction = INTERIOR_PEDESTRIAN_DIRECTION_AUTHORITY[0];
const mode = INTERIOR_PEDESTRIAN_MODE_AUTHORITY[0];
const duration = INTERIOR_WALKING_DURATION_AUTHORITY[0];
const difficulty = INTERIOR_DIFFICULTY_AUTHORITY[0];
const accessibility = INTERIOR_ACCESSIBILITY_AUTHORITY[0];
const operationalStatus = INTERIOR_OPERATIONAL_STATUS_AUTHORITY[0];
const stairsAudit = INTERIOR_STAIRS_EVIDENCE_AUDIT[0];
const strollerAudit = INTERIOR_STROLLER_EVIDENCE_AUDIT[0];

if (
  !geometry ||
  !branchSelection ||
  !distance ||
  !directionSnapshot ||
  !direction ||
  !mode ||
  !duration ||
  !difficulty ||
  !accessibility ||
  !operationalStatus ||
  !stairsAudit ||
  !strollerAudit
) {
  throw new Error(
    "Planner 37 requires the complete qualified Planner 26-36 interior lineage.",
  );
}

const RAW_LINEAGE: InteriorProvenanceLineage = {
  geometryAuthorityId: geometry.id,
  branchSelectionAuthorityId: branchSelection.id,
  distanceAuthorityId: distance.id,
  directionSourceSnapshotId: directionSnapshot.id,
  directionAuthorityId: direction.id,
  modeAuthorityId: mode.id,
  durationAuthorityId: duration.id,
  difficultyAuthorityId: difficulty.id,
  accessibilityAuthorityId: accessibility.id,
  operationalStatusAuthorityId: operationalStatus.id,
  stairsEvidenceAuditId: stairsAudit.id,
  strollerEvidenceAuditId: strollerAudit.id,
};

const RAW_PROVENANCE: SourceProvenance = {
  sourceUrl: SOURCE_WAY_VERSION_URL,
  sourceLabel:
    "OpenStreetMap way 1481425058 v1 with WildRoute exact-segment semantic lineage",
  lastVerified: SOURCE_OBSERVED_AT,
  confidence: "provisional",
  effectiveFrom: EFFECTIVE_FROM,
};

const RAW_AUTHORITY: InteriorProvenanceAuthority = {
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
    "primary-version-pinned-geometry-source-plus-qualified-semantic-lineage",
  confidenceRationale:
    "provenance-complete-while-stairs-and-stroller-remain-unresolved",
  semanticCompletion: "blocked",
  unresolvedSemanticBlockers: REMAINING_BLOCK_REASONS,
  selectionScope: "objective-only",
  globalEndpointSelection: "unresolved",
  plannerMaterialization: "provenance-only",
};

export function assertInteriorProvenanceAuthorityIntegrity() {
  if (
    directionSnapshot.id !==
      "sdz-interior-front-street-direction-source-v1" ||
    directionSnapshot.sourceWayId !== SOURCE_WAY_ID ||
    directionSnapshot.sourceWayVersion !== SOURCE_WAY_VERSION ||
    directionSnapshot.sourceWayVersionUrl !== SOURCE_WAY_VERSION_URL ||
    directionSnapshot.sourceWayTimestamp !== SOURCE_WAY_TIMESTAMP ||
    directionSnapshot.sourceWayChangeset !== SOURCE_WAY_CHANGESET ||
    directionSnapshot.observedAt !== SOURCE_OBSERVED_AT ||
    directionSnapshot.sourceState !== "exact-version-complete-tag-set"
  ) {
    throw new Error(
      "Planner 37 version-pinned OpenStreetMap provenance drifted from the Planner 29 source snapshot.",
    );
  }

  if (
    geometry.id !== "sdz-interior-front-street-adjacent-geometry" ||
    geometry.sourceWayId !== SOURCE_WAY_ID ||
    branchSelection.id !==
      "sdz-interior-front-street-objective-branch-selection" ||
    branchSelection.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    branchSelection.geometryConnectionNodeId !== FROM_NODE_ID ||
    branchSelection.selectedCandidateNodeId !== TO_NODE_ID
  ) {
    throw new Error(
      "Planner 37 geometry or objective-branch lineage drifted from the selected exact segment.",
    );
  }

  assertExactSegmentIdentity("distance authority", distance);
  assertExactSegmentIdentity("direction authority", direction);
  assertExactSegmentIdentity("mode authority", mode);
  assertExactSegmentIdentity("duration authority", duration);
  assertExactSegmentIdentity("difficulty authority", difficulty);
  assertExactSegmentIdentity("accessibility authority", accessibility);
  assertExactSegmentIdentity(
    "operational-status authority",
    operationalStatus,
  );
  assertExactSegmentIdentity("stairs evidence audit", stairsAudit);
  assertExactSegmentIdentity("stroller evidence audit", strollerAudit);

  if (
    stairsAudit.result !== "blocked" ||
    stairsAudit.blocker !== "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    strollerAudit.result !== "blocked" ||
    strollerAudit.blocker !== "EXACT_SEGMENT_STROLLER_NOT_SOURCED"
  ) {
    throw new Error(
      "Planner 37 cannot complete provenance after stairs or stroller semantics change without requalification.",
    );
  }

  if (
    RAW_AUTHORITY.id !== AUTHORITY_ID ||
    RAW_AUTHORITY.objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID ||
    RAW_AUTHORITY.sourceWayId !== SOURCE_WAY_ID ||
    RAW_AUTHORITY.sourceFromNodeId !== FROM_NODE_ID ||
    RAW_AUTHORITY.sourceToNodeId !== TO_NODE_ID ||
    RAW_AUTHORITY.provenance.sourceUrl !== SOURCE_WAY_VERSION_URL ||
    RAW_AUTHORITY.provenance.lastVerified !== SOURCE_OBSERVED_AT ||
    RAW_AUTHORITY.provenance.confidence !== "provisional" ||
    RAW_AUTHORITY.provenance.effectiveFrom !== EFFECTIVE_FROM ||
    RAW_AUTHORITY.provenanceScope !==
      "primary-version-pinned-geometry-source-plus-qualified-semantic-lineage" ||
    RAW_AUTHORITY.confidenceRationale !==
      "provenance-complete-while-stairs-and-stroller-remain-unresolved" ||
    RAW_AUTHORITY.semanticCompletion !== "blocked" ||
    RAW_AUTHORITY.unresolvedSemanticBlockers.length !== 2 ||
    RAW_AUTHORITY.unresolvedSemanticBlockers[0] !==
      "EXACT_SEGMENT_STAIRS_NOT_SOURCED" ||
    RAW_AUTHORITY.unresolvedSemanticBlockers[1] !==
      "EXACT_SEGMENT_STROLLER_NOT_SOURCED" ||
    RAW_AUTHORITY.selectionScope !== "objective-only" ||
    RAW_AUTHORITY.globalEndpointSelection !== "unresolved" ||
    RAW_AUTHORITY.plannerMaterialization !== "provenance-only"
  ) {
    throw new Error(
      "Planner 37 provenance authority drifted from its provisional exact-segment boundary.",
    );
  }

  const expectedLineage = [
    geometry.id,
    branchSelection.id,
    distance.id,
    directionSnapshot.id,
    direction.id,
    mode.id,
    duration.id,
    difficulty.id,
    accessibility.id,
    operationalStatus.id,
    stairsAudit.id,
    strollerAudit.id,
  ];
  const actualLineage = [
    RAW_LINEAGE.geometryAuthorityId,
    RAW_LINEAGE.branchSelectionAuthorityId,
    RAW_LINEAGE.distanceAuthorityId,
    RAW_LINEAGE.directionSourceSnapshotId,
    RAW_LINEAGE.directionAuthorityId,
    RAW_LINEAGE.modeAuthorityId,
    RAW_LINEAGE.durationAuthorityId,
    RAW_LINEAGE.difficultyAuthorityId,
    RAW_LINEAGE.accessibilityAuthorityId,
    RAW_LINEAGE.operationalStatusAuthorityId,
    RAW_LINEAGE.stairsEvidenceAuditId,
    RAW_LINEAGE.strollerEvidenceAuditId,
  ];

  if (JSON.stringify(actualLineage) !== JSON.stringify(expectedLineage)) {
    throw new Error(
      "Planner 37 semantic lineage detached from a qualified predecessor authority.",
    );
  }

  for (const forbidden of [
    "routeEdgeId",
    "routeNodeId",
    "fromNodeId",
    "toNodeId",
    "stairs",
    "stroller",
  ]) {
    if (Object.hasOwn(RAW_AUTHORITY, forbidden)) {
      throw new Error(
        `Planner 37 provenance authority must not materialize ${forbidden}.`,
      );
    }
  }
}

assertInteriorProvenanceAuthorityIntegrity();

export const INTERIOR_PROVENANCE_AUTHORITY:
  InteriorProvenanceAuthority = deepFreeze(RAW_AUTHORITY);

export function assessInteriorProvenance(
  objectiveSourceRecordId: string,
): InteriorProvenanceAssessment {
  assertObjectiveSourceRecordId(objectiveSourceRecordId);

  if (objectiveSourceRecordId !== OBJECTIVE_SOURCE_RECORD_ID) {
    return deepFreeze({
      status: "blocked",
      reason: "OBJECTIVE_PROVENANCE_NOT_SOURCED",
      objectiveSourceRecordId,
      globalEndpointSelection: "unresolved",
    });
  }

  return deepFreeze({
    status: "provenance-ready",
    objectiveSourceRecordId,
    sourceFromNodeId: FROM_NODE_ID,
    sourceToNodeId: TO_NODE_ID,
    provenance: {
      ...INTERIOR_PROVENANCE_AUTHORITY.provenance,
    },
    confidenceRationale:
      "provenance-complete-while-stairs-and-stroller-remain-unresolved",
    selectionScope: "objective-only",
    globalEndpointSelection: "unresolved",
    exactSegmentMaterialization: {
      status: "blocked",
      reasons: [...REMAINING_BLOCK_REASONS] as [
        "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
        "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
      ],
    },
  });
}
