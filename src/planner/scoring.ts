import type { RouteFound } from "./routing.ts";
import type {
  AnimalPriority,
  ExperiencePriority,
} from "../planning/priorityPreferences.ts";
import type { Pace } from "../planning/dayPreferences.ts";

export type CandidateAuthority =
  | "locked"
  | "required"
  | "protected"
  | "optional";

export type CandidateTiming = "fixed" | "windowed" | "flexible";
export type PreferencePriority = "must" | "favorite" | "bonus";

export type ScoringCandidate = {
  id: string;
  authority: CandidateAuthority;
  timing: CandidateTiming;
  priority: PreferencePriority;
  baseDwellMinutes: number;
};

export type CandidatePolicy = {
  authority: CandidateAuthority;
  timing: CandidateTiming;
  priority: PreferencePriority;
};

export type PacePolicy = {
  pace: Pace;
  dwellMultiplier: number;
  betweenStopBufferMinutes: number;
};

export type ScoreContext = {
  pace: Pace;
  preferEasyPaths: boolean;
};

export type CandidateScore = {
  id: string;
  authority: CandidateAuthority;
  authorityRank: number;
  timing: CandidateTiming;
  priority: PreferencePriority;
  preferencePoints: number;
  paceAdjustedDwellMinutes: number;
  betweenStopBufferMinutes: number;
  easierPathPenaltyPoints: number;
  netPreferencePoints: number;
  canAutoDrop: boolean;
};

export type OptionalDropReason =
  | "OUTSIDE_HORIZON"
  | "NO_ROUTE"
  | "ANCHOR_CONFLICT"
  | "INSUFFICIENT_TIME"
  | "LOWER_PRIORITY_ALTERNATIVE"
  | "DATA_UNAVAILABLE"
  | "USER_REMOVED";

export type OmissionDecision =
  | {
      action: "drop";
      candidateId: string;
      reason: OptionalDropReason;
      authority: "optional";
      requiresUserTradeoff: false;
    }
  | {
      action: "tradeoff-required";
      candidateId: string;
      reason: OptionalDropReason;
      authority: Exclude<CandidateAuthority, "optional">;
      requiresUserTradeoff: true;
    };

export type CandidateBuckets = {
  locked: ScoringCandidate[];
  required: ScoringCandidate[];
  protected: ScoringCandidate[];
  optional: ScoringCandidate[];
};

export type PreferenceUtilityVector = {
  must: { count: number; netPoints: number };
  favorite: { count: number; netPoints: number };
  bonus: { count: number; netPoints: number };
};

const AUTHORITIES: readonly CandidateAuthority[] = [
  "locked",
  "required",
  "protected",
  "optional",
];
const TIMINGS: readonly CandidateTiming[] = [
  "fixed",
  "windowed",
  "flexible",
];
const PRIORITIES: readonly PreferencePriority[] = [
  "must",
  "favorite",
  "bonus",
];
const PACES: readonly Pace[] = ["relaxed", "balanced", "maximize"];
const DROP_REASONS: readonly OptionalDropReason[] = [
  "OUTSIDE_HORIZON",
  "NO_ROUTE",
  "ANCHOR_CONFLICT",
  "INSUFFICIENT_TIME",
  "LOWER_PRIORITY_ALTERNATIVE",
  "DATA_UNAVAILABLE",
  "USER_REMOVED",
];

const AUTHORITY_RANK: Record<CandidateAuthority, number> = {
  locked: 4,
  required: 3,
  protected: 2,
  optional: 1,
};

const PRIORITY_POINTS: Record<PreferencePriority, number> = {
  must: 1000,
  favorite: 100,
  bonus: 10,
};

const PACE_POLICY: Record<Pace, PacePolicy> = {
  relaxed: {
    pace: "relaxed",
    dwellMultiplier: 1.15,
    betweenStopBufferMinutes: 10,
  },
  balanced: {
    pace: "balanced",
    dwellMultiplier: 1,
    betweenStopBufferMinutes: 5,
  },
  maximize: {
    pace: "maximize",
    dwellMultiplier: 0.9,
    betweenStopBufferMinutes: 2,
  },
};

const COST_PRECISION = 1_000_000_000;

function normalize(value: number) {
  return Math.round(value * COST_PRECISION) / COST_PRECISION;
}

function compareText(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertPace(value: unknown): asserts value is Pace {
  if (typeof value !== "string" || !PACES.includes(value as Pace)) {
    throw new Error("Pace must be relaxed, balanced, or maximize.");
  }
}

export function assertValidScoreContext(
  value: unknown,
): asserts value is ScoreContext {
  if (!isRecord(value)) {
    throw new Error("ScoreContext must be an object.");
  }

  assertPace(value.pace);

  if (typeof value.preferEasyPaths !== "boolean") {
    throw new Error("ScoreContext preferEasyPaths must be boolean.");
  }
}

export function assertValidScoringCandidate(
  value: unknown,
): asserts value is ScoringCandidate {
  if (!isRecord(value)) {
    throw new Error("ScoringCandidate must be an object.");
  }

  if (
    typeof value.id !== "string" ||
    value.id.trim().length === 0 ||
    value.id !== value.id.trim()
  ) {
    throw new Error(
      "ScoringCandidate requires a stable non-empty ID without surrounding whitespace.",
    );
  }

  if (
    typeof value.authority !== "string" ||
    !AUTHORITIES.includes(value.authority as CandidateAuthority)
  ) {
    throw new Error("ScoringCandidate authority is invalid.");
  }

  if (
    typeof value.timing !== "string" ||
    !TIMINGS.includes(value.timing as CandidateTiming)
  ) {
    throw new Error("ScoringCandidate timing is invalid.");
  }

  if (
    typeof value.priority !== "string" ||
    !PRIORITIES.includes(value.priority as PreferencePriority)
  ) {
    throw new Error("ScoringCandidate priority is invalid.");
  }

  if (
    typeof value.baseDwellMinutes !== "number" ||
    !Number.isInteger(value.baseDwellMinutes) ||
    value.baseDwellMinutes <= 0
  ) {
    throw new Error(
      "ScoringCandidate baseDwellMinutes must be a positive integer.",
    );
  }
}

function assertUniqueCandidateIds(
  candidates: readonly ScoringCandidate[],
) {
  const seen = new Set<string>();

  for (const candidate of candidates) {
    assertValidScoringCandidate(candidate);

    if (seen.has(candidate.id)) {
      throw new Error(`Duplicate scoring candidate ID: ${candidate.id}`);
    }

    seen.add(candidate.id);
  }
}

export function getPacePolicy(pace: Pace): PacePolicy {
  assertPace(pace);
  return { ...PACE_POLICY[pace] };
}

export function paceAdjustedDwellMinutes(
  baseDwellMinutes: number,
  pace: Pace,
) {
  assertPace(pace);

  if (!Number.isInteger(baseDwellMinutes) || baseDwellMinutes <= 0) {
    throw new Error(
      "baseDwellMinutes must be a positive integer before pace adjustment.",
    );
  }

  return Math.max(
    1,
    Math.ceil(baseDwellMinutes * PACE_POLICY[pace].dwellMultiplier),
  );
}

export function easierPathPenaltyPoints(
  route: RouteFound | undefined,
  preferEasyPaths: boolean,
) {
  if (typeof preferEasyPaths !== "boolean") {
    throw new Error("preferEasyPaths must be boolean.");
  }

  if (!route || !preferEasyPaths) return 0;

  let penalty = 0;

  for (const edge of route.edges) {
    if (edge.difficulty === "moderate") {
      penalty += edge.durationMinutes * 0.25;
    } else if (edge.difficulty === "steep") {
      penalty += edge.durationMinutes;
    }

    if (
      edge.mode === "walk" &&
      (edge.difficulty === "moderate" ||
        edge.difficulty === "steep")
    ) {
      penalty += 0.5;
    }
  }

  return normalize(penalty);
}

export function scoreCandidate(
  candidate: ScoringCandidate,
  context: ScoreContext,
  route?: RouteFound,
): CandidateScore {
  assertValidScoringCandidate(candidate);
  assertValidScoreContext(context);

  const preferencePoints = PRIORITY_POINTS[candidate.priority];
  const routePenalty = easierPathPenaltyPoints(
    route,
    context.preferEasyPaths,
  );

  return {
    id: candidate.id,
    authority: candidate.authority,
    authorityRank: AUTHORITY_RANK[candidate.authority],
    timing: candidate.timing,
    priority: candidate.priority,
    preferencePoints,
    paceAdjustedDwellMinutes:
      candidate.timing === "flexible"
        ? paceAdjustedDwellMinutes(
            candidate.baseDwellMinutes,
            context.pace,
          )
        : candidate.baseDwellMinutes,
    betweenStopBufferMinutes:
      PACE_POLICY[context.pace].betweenStopBufferMinutes,
    easierPathPenaltyPoints: routePenalty,
    netPreferencePoints: normalize(preferencePoints - routePenalty),
    canAutoDrop: candidate.authority === "optional",
  };
}

export function compareCandidateScores(
  a: CandidateScore,
  b: CandidateScore,
) {
  if (a.authorityRank !== b.authorityRank) {
    return b.authorityRank - a.authorityRank;
  }

  if (a.preferencePoints !== b.preferencePoints) {
    return b.preferencePoints - a.preferencePoints;
  }

  if (a.netPreferencePoints !== b.netPreferencePoints) {
    return b.netPreferencePoints - a.netPreferencePoints;
  }

  if (a.paceAdjustedDwellMinutes !== b.paceAdjustedDwellMinutes) {
    return a.paceAdjustedDwellMinutes - b.paceAdjustedDwellMinutes;
  }

  return compareText(a.id, b.id);
}

export function rankCandidates(
  candidates: readonly ScoringCandidate[],
  context: ScoreContext,
  routesByCandidateId: Readonly<Record<string, RouteFound | undefined>> = {},
) {
  assertValidScoreContext(context);
  assertUniqueCandidateIds(candidates);

  return candidates
    .map((candidate) =>
      scoreCandidate(candidate, context, routesByCandidateId[candidate.id]),
    )
    .sort(compareCandidateScores);
}

export function partitionCandidates(
  candidates: readonly ScoringCandidate[],
): CandidateBuckets {
  assertUniqueCandidateIds(candidates);

  const buckets: CandidateBuckets = {
    locked: [],
    required: [],
    protected: [],
    optional: [],
  };

  for (const candidate of candidates) {
    buckets[candidate.authority].push({ ...candidate });
  }

  for (const values of Object.values(buckets)) {
    values.sort((a, b) => compareText(a.id, b.id));
  }

  return buckets;
}

export function decideCandidateOmission(
  candidate: ScoringCandidate,
  reason: OptionalDropReason,
): OmissionDecision {
  assertValidScoringCandidate(candidate);

  if (
    typeof reason !== "string" ||
    !DROP_REASONS.includes(reason as OptionalDropReason)
  ) {
    throw new Error("Optional drop reason is invalid.");
  }

  if (candidate.authority === "optional") {
    return {
      action: "drop",
      candidateId: candidate.id,
      reason,
      authority: "optional",
      requiresUserTradeoff: false,
    };
  }

  return {
    action: "tradeoff-required",
    candidateId: candidate.id,
    reason,
    authority: candidate.authority,
    requiresUserTradeoff: true,
  };
}

export function policyFromAnimalPriority(
  priority: AnimalPriority,
): CandidatePolicy | null {
  switch (priority) {
    case "none":
      return null;
    case "must":
      return {
        authority: "protected",
        timing: "flexible",
        priority: "must",
      };
    case "favorite":
      return {
        authority: "optional",
        timing: "flexible",
        priority: "favorite",
      };
    default:
      throw new Error("Animal priority is invalid.");
  }
}

export function policyFromExperiencePriority(
  priority: ExperiencePriority,
): CandidatePolicy | null {
  switch (priority) {
    case "none":
      return null;
    case "must":
      return {
        authority: "required",
        timing: "windowed",
        priority: "must",
      };
    case "interested":
      return {
        authority: "optional",
        timing: "windowed",
        priority: "favorite",
      };
    default:
      throw new Error("Experience priority is invalid.");
  }
}

export function lockedPolicy(): CandidatePolicy {
  return {
    authority: "locked",
    timing: "fixed",
    priority: "must",
  };
}

export function bonusPolicy(): CandidatePolicy {
  return {
    authority: "optional",
    timing: "flexible",
    priority: "bonus",
  };
}


export function buildPreferenceUtilityVector(
  scores: readonly CandidateScore[],
): PreferenceUtilityVector {
  const seen = new Set<string>();
  const vector: PreferenceUtilityVector = {
    must: { count: 0, netPoints: 0 },
    favorite: { count: 0, netPoints: 0 },
    bonus: { count: 0, netPoints: 0 },
  };

  for (const score of scores) {
    if (!score || typeof score.id !== "string" || score.id.trim().length === 0) {
      throw new Error("Preference utility requires valid candidate scores.");
    }

    if (seen.has(score.id)) {
      throw new Error(`Duplicate candidate score ID: ${score.id}`);
    }
    seen.add(score.id);

    if (!PRIORITIES.includes(score.priority)) {
      throw new Error("Candidate score priority is invalid.");
    }

    if (!Number.isFinite(score.netPreferencePoints)) {
      throw new Error("Candidate score netPreferencePoints must be finite.");
    }

    const tier = vector[score.priority];
    tier.count += 1;
    tier.netPoints = normalize(tier.netPoints + score.netPreferencePoints);
  }

  return vector;
}

export function comparePreferenceUtilityVectors(
  a: PreferenceUtilityVector,
  b: PreferenceUtilityVector,
) {
  for (const priority of PRIORITIES) {
    if (a[priority].count !== b[priority].count) {
      return b[priority].count - a[priority].count;
    }

    if (a[priority].netPoints !== b[priority].netPoints) {
      return b[priority].netPoints - a[priority].netPoints;
    }
  }

  return 0;
}
