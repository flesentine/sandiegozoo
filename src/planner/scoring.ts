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

function validCandidate(candidate: ScoringCandidate) {
  return (
    candidate.id.trim().length > 0 &&
    Number.isInteger(candidate.baseDwellMinutes) &&
    candidate.baseDwellMinutes > 0
  );
}

export function getPacePolicy(pace: Pace): PacePolicy {
  return { ...PACE_POLICY[pace] };
}

export function paceAdjustedDwellMinutes(
  baseDwellMinutes: number,
  pace: Pace,
) {
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
  if (!route || !preferEasyPaths) return 0;

  let penalty = 0;

  for (const edge of route.edges) {
    if (edge.difficulty === "moderate") {
      penalty += edge.durationMinutes * 0.25;
    } else if (edge.difficulty === "steep") {
      penalty += edge.durationMinutes;
    }

    if (edge.mode === "walk" && edge.difficulty !== "easy") {
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
  if (!validCandidate(candidate)) {
    throw new Error(
      "ScoringCandidate requires a stable ID and positive integer base dwell.",
    );
  }

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
    paceAdjustedDwellMinutes: paceAdjustedDwellMinutes(
      candidate.baseDwellMinutes,
      context.pace,
    ),
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

  if (a.netPreferencePoints !== b.netPreferencePoints) {
    return b.netPreferencePoints - a.netPreferencePoints;
  }

  if (a.preferencePoints !== b.preferencePoints) {
    return b.preferencePoints - a.preferencePoints;
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
  return candidates
    .map((candidate) =>
      scoreCandidate(candidate, context, routesByCandidateId[candidate.id]),
    )
    .sort(compareCandidateScores);
}

export function partitionCandidates(
  candidates: readonly ScoringCandidate[],
): CandidateBuckets {
  const buckets: CandidateBuckets = {
    locked: [],
    required: [],
    protected: [],
    optional: [],
  };

  for (const candidate of candidates) {
    if (!validCandidate(candidate)) {
      throw new Error(
        "Cannot partition an invalid scoring candidate.",
      );
    }
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
  if (!validCandidate(candidate)) {
    throw new Error(
      "Cannot record omission for an invalid scoring candidate.",
    );
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
  if (priority === "none") return null;

  if (priority === "must") {
    return {
      authority: "protected",
      timing: "flexible",
      priority: "must",
    };
  }

  return {
    authority: "optional",
    timing: "flexible",
    priority: "favorite",
  };
}

export function policyFromExperiencePriority(
  priority: ExperiencePriority,
): CandidatePolicy | null {
  if (priority === "none") return null;

  if (priority === "must") {
    return {
      authority: "required",
      timing: "windowed",
      priority: "must",
    };
  }

  return {
    authority: "optional",
    timing: "windowed",
    priority: "favorite",
  };
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
