import assert from "node:assert/strict";
import test from "node:test";
import type {
  RouteEdge,
  RouteNode,
  SourceProvenance,
  WildRouteDataPackage,
} from "../src/planner/contracts.ts";
import {
  buildRoutingGraph,
  findShortestRoute,
} from "../src/planner/routing.ts";
import {
  bonusPolicy,
  compareCandidateScores,
  decideCandidateOmission,
  easierPathPenaltyPoints,
  getPacePolicy,
  lockedPolicy,
  paceAdjustedDwellMinutes,
  partitionCandidates,
  policyFromAnimalPriority,
  policyFromExperiencePriority,
  rankCandidates,
  scoreCandidate,
  type ScoringCandidate,
} from "../src/planner/scoring.ts";

const provenance: SourceProvenance = {
  sourceUrl: "https://example.invalid/scoring-fixture",
  sourceLabel: "Synthetic scoring fixture",
  lastVerified: "2026-09-06T21:00:00-07:00",
  confidence: "verified",
};

function node(id: string): RouteNode {
  return {
    id,
    kind: id === "a" ? "entrance" : "destination",
    zoneId: "fixture-zone",
    lat: 0,
    lng: 0,
    provenance: { ...provenance },
  };
}

function edge(
  id: string,
  fromNodeId: string,
  toNodeId: string,
  durationMinutes: number,
  difficulty: RouteEdge["difficulty"],
): RouteEdge {
  return {
    id,
    fromNodeId,
    toNodeId,
    mode: "walk",
    distanceMeters: durationMinutes * 80,
    durationMinutes,
    difficulty,
    stairs: false,
    accessible: true,
    stroller: true,
    oneWay: false,
    status: "open",
    provenance: { ...provenance },
  };
}

function routeFor(edges: RouteEdge[]) {
  const data: WildRouteDataPackage = {
    schemaVersion: "1",
    zones: [
      {
        id: "fixture-zone",
        name: "Fixture Zone",
        provenance: { ...provenance },
      },
    ],
    places: [],
    routeNodes: ["a", "b", "c"].map(node),
    routeEdges: edges,
    scheduleEvents: [],
  };

  const result = findShortestRoute(
    buildRoutingGraph(data),
    {
      fromNodeId: "a",
      toNodeId: "c",
    },
  );

  assert.equal(result.status, "found");
  if (result.status !== "found") throw new Error("expected route");
  return result;
}

function candidate(
  id: string,
  overrides: Partial<ScoringCandidate> = {},
): ScoringCandidate {
  return {
    id,
    authority: "optional",
    timing: "flexible",
    priority: "bonus",
    baseDwellMinutes: 20,
    ...overrides,
  };
}

test("UI animal priorities map to protected Must-Sees and optional Favorites", () => {
  assert.deepEqual(policyFromAnimalPriority("must"), {
    authority: "protected",
    timing: "flexible",
    priority: "must",
  });
  assert.deepEqual(policyFromAnimalPriority("favorite"), {
    authority: "optional",
    timing: "flexible",
    priority: "favorite",
  });
  assert.equal(policyFromAnimalPriority("none"), null);
});

test("UI experience priorities keep timing separate from authority", () => {
  assert.deepEqual(policyFromExperiencePriority("must"), {
    authority: "required",
    timing: "windowed",
    priority: "must",
  });
  assert.deepEqual(policyFromExperiencePriority("interested"), {
    authority: "optional",
    timing: "windowed",
    priority: "favorite",
  });
  assert.equal(policyFromExperiencePriority("none"), null);
});

test("locked and bonus policies are explicit", () => {
  assert.deepEqual(lockedPolicy(), {
    authority: "locked",
    timing: "fixed",
    priority: "must",
  });
  assert.deepEqual(bonusPolicy(), {
    authority: "optional",
    timing: "flexible",
    priority: "bonus",
  });
});

test("pace policy freezes dwell and buffer behavior", () => {
  assert.deepEqual(getPacePolicy("relaxed"), {
    pace: "relaxed",
    dwellMultiplier: 1.15,
    betweenStopBufferMinutes: 10,
  });
  assert.deepEqual(getPacePolicy("balanced"), {
    pace: "balanced",
    dwellMultiplier: 1,
    betweenStopBufferMinutes: 5,
  });
  assert.deepEqual(getPacePolicy("maximize"), {
    pace: "maximize",
    dwellMultiplier: 0.9,
    betweenStopBufferMinutes: 2,
  });

  assert.equal(paceAdjustedDwellMinutes(20, "relaxed"), 23);
  assert.equal(paceAdjustedDwellMinutes(20, "balanced"), 20);
  assert.equal(paceAdjustedDwellMinutes(20, "maximize"), 18);
});

test("pace adjustment rejects invalid dwell input", () => {
  assert.throws(
    () => paceAdjustedDwellMinutes(0, "balanced"),
    /positive integer/,
  );
  assert.throws(
    () => paceAdjustedDwellMinutes(2.5, "balanced"),
    /positive integer/,
  );
});

test("easier paths preference adds deterministic soft route penalties", () => {
  const route = routeFor([
    edge("a-b", "a", "b", 4, "moderate"),
    edge("b-c", "b", "c", 3, "steep"),
  ]);

  assert.equal(easierPathPenaltyPoints(route, false), 0);
  assert.equal(easierPathPenaltyPoints(route, true), 5);
});

test("easy-path penalty never turns into a hard route rejection", () => {
  const route = routeFor([
    edge("a-b", "a", "b", 2, "steep"),
    edge("b-c", "b", "c", 2, "steep"),
  ]);

  const scored = scoreCandidate(
    candidate("panda", {
      authority: "protected",
      priority: "must",
    }),
    { pace: "balanced", preferEasyPaths: true },
    route,
  );

  assert.equal(scored.authority, "protected");
  assert.equal(scored.canAutoDrop, false);
  assert.ok(scored.easierPathPenaltyPoints > 0);
  assert.ok(scored.netPreferencePoints > 0);
});

test("priority points are frozen and route penalty is separate", () => {
  const must = scoreCandidate(
    candidate("must", {
      authority: "protected",
      priority: "must",
    }),
    { pace: "balanced", preferEasyPaths: false },
  );
  const favorite = scoreCandidate(
    candidate("favorite", {
      priority: "favorite",
    }),
    { pace: "balanced", preferEasyPaths: false },
  );
  const bonus = scoreCandidate(
    candidate("bonus"),
    { pace: "balanced", preferEasyPaths: false },
  );

  assert.equal(must.preferencePoints, 1000);
  assert.equal(favorite.preferencePoints, 100);
  assert.equal(bonus.preferencePoints, 10);
});

test("authority outranks preference score instead of being encoded into points", () => {
  const requiredFavorite = scoreCandidate(
    candidate("required-favorite", {
      authority: "required",
      priority: "favorite",
    }),
    { pace: "balanced", preferEasyPaths: false },
  );
  const optionalMust = scoreCandidate(
    candidate("optional-must", {
      authority: "optional",
      priority: "must",
    }),
    { pace: "balanced", preferEasyPaths: false },
  );

  assert.equal(requiredFavorite.preferencePoints, 100);
  assert.equal(optionalMust.preferencePoints, 1000);
  assert.ok(compareCandidateScores(requiredFavorite, optionalMust) < 0);
});

test("candidate ranking is deterministic by authority score dwell then ID", () => {
  const ranked = rankCandidates(
    [
      candidate("z", { priority: "favorite", baseDwellMinutes: 20 }),
      candidate("a", { priority: "favorite", baseDwellMinutes: 20 }),
      candidate("short", { priority: "favorite", baseDwellMinutes: 10 }),
      candidate("protected", {
        authority: "protected",
        priority: "must",
        baseDwellMinutes: 30,
      }),
    ],
    { pace: "balanced", preferEasyPaths: false },
  );

  assert.deepEqual(
    ranked.map((item) => item.id),
    ["protected", "short", "a", "z"],
  );
});

test("ranking does not depend on candidate insertion order", () => {
  const values = [
    candidate("z", { priority: "favorite" }),
    candidate("a", { priority: "favorite" }),
    candidate("m", { priority: "favorite" }),
  ];
  const context = { pace: "balanced" as const, preferEasyPaths: false };

  const forward = rankCandidates(values, context);
  const reverse = rankCandidates([...values].reverse(), context);

  assert.deepEqual(reverse, forward);
});

test("candidate buckets keep protected work outside optional competition", () => {
  const buckets = partitionCandidates([
    candidate("bonus"),
    candidate("favorite", { priority: "favorite" }),
    candidate("must-see", {
      authority: "protected",
      priority: "must",
    }),
    candidate("must-show", {
      authority: "required",
      timing: "windowed",
      priority: "must",
    }),
    candidate("reservation", {
      authority: "locked",
      timing: "fixed",
      priority: "must",
    }),
  ]);

  assert.deepEqual(buckets.locked.map((item) => item.id), ["reservation"]);
  assert.deepEqual(buckets.required.map((item) => item.id), ["must-show"]);
  assert.deepEqual(buckets.protected.map((item) => item.id), ["must-see"]);
  assert.deepEqual(buckets.optional.map((item) => item.id), [
    "bonus",
    "favorite",
  ]);
});

test("optional items can be dropped only with an explicit reason", () => {
  assert.deepEqual(
    decideCandidateOmission(
      candidate("bonus"),
      "INSUFFICIENT_TIME",
    ),
    {
      action: "drop",
      candidateId: "bonus",
      reason: "INSUFFICIENT_TIME",
      authority: "optional",
      requiresUserTradeoff: false,
    },
  );
});

test("Must-Sees are never silently dropped by the scoring layer", () => {
  const mustSee = candidate("panda", {
    authority: "protected",
    priority: "must",
  });

  assert.deepEqual(
    decideCandidateOmission(mustSee, "INSUFFICIENT_TIME"),
    {
      action: "tradeoff-required",
      candidateId: "panda",
      reason: "INSUFFICIENT_TIME",
      authority: "protected",
      requiresUserTradeoff: true,
    },
  );

  assert.equal(
    scoreCandidate(
      mustSee,
      { pace: "balanced", preferEasyPaths: false },
    ).canAutoDrop,
    false,
  );
});

test("locked and required candidates also demand explicit tradeoffs", () => {
  for (const authority of ["locked", "required"] as const) {
    const decision = decideCandidateOmission(
      candidate(authority, {
        authority,
        priority: "must",
      }),
      "ANCHOR_CONFLICT",
    );

    assert.equal(decision.action, "tradeoff-required");
    assert.equal(decision.requiresUserTradeoff, true);
  }
});

test("invalid candidates are rejected before scoring partition or omission", () => {
  const invalid = candidate("", { baseDwellMinutes: 0 });

  assert.throws(
    () =>
      scoreCandidate(
        invalid,
        { pace: "balanced", preferEasyPaths: false },
      ),
    /stable ID/,
  );
  assert.throws(() => partitionCandidates([invalid]), /invalid scoring/);
  assert.throws(
    () => decideCandidateOmission(invalid, "DATA_UNAVAILABLE"),
    /invalid scoring/,
  );
});
