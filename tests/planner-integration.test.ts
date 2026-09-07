import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { WildRouteDataPackage } from "../src/planner/contracts.ts";
import {
  buildCandidateIntegration,
  qualifyCandidateIntegration,
  type CandidateIntegrationInput,
} from "../src/planner/integration.ts";
import type { DayPreferences } from "../src/planning/dayPreferences.ts";
import type { PriorityPreferences } from "../src/planning/priorityPreferences.ts";
import type { VisitPreferences } from "../src/planning/visitPreferences.ts";

function fixture(): WildRouteDataPackage {
  return JSON.parse(
    readFileSync(
      new URL("./fixtures/wildroute-data.valid.json", import.meta.url),
      "utf8",
    ),
  ) as WildRouteDataPackage;
}

function visit(
  overrides: Partial<VisitPreferences> = {},
): VisitPreferences {
  return {
    date: "2026-09-19",
    arrival: "09:00",
    departure: "17:00",
    party: { adults: 2, kids: 1 },
    stroller: false,
    easyPaths: false,
    wheelchair: false,
    reservation: { name: "", time: "" },
    ...overrides,
  };
}

function day(
  overrides: Partial<DayPreferences> = {},
): DayPreferences {
  return {
    foodCategories: ["anything"],
    lunchStyle: "balanced",
    pace: "balanced",
    useSkyfari: true,
    ...overrides,
  };
}

function priorities(
  overrides: Partial<PriorityPreferences> = {},
): PriorityPreferences {
  return {
    animals: {},
    experiences: {},
    ...overrides,
  };
}

function input(
  overrides: Partial<CandidateIntegrationInput> = {},
): CandidateIntegrationInput {
  return {
    data: fixture(),
    visit: visit(),
    day: day(),
    priorities: priorities({
      animals: { panda: "must" },
      experiences: { "wildlife-wonders": "interested" },
    }),
    initialNodeId: "fixture-entry-node",
    endNodeId: "fixture-entry-node",
    bindings: {
      animals: {
        panda: {
          placeId: "fixture-animal",
          dwellMinutes: 20,
        },
      },
      experiences: {
        "wildlife-wonders": {
          activityId: "fixture-show",
        },
      },
    },
    ...overrides,
  };
}

test("explicit UI bindings build deterministic optimizer candidates", () => {
  const result = buildCandidateIntegration(input());

  assert.equal(result.status, "ready");
  if (result.status !== "ready") throw new Error("expected ready");

  assert.deepEqual(
    result.candidates.map((candidate) => [
      candidate.id,
      candidate.selectionKey,
      candidate.nodeId,
      candidate.authority,
      candidate.timing,
      candidate.priority,
    ]),
    [
      [
        "animal:panda",
        "animal:panda",
        "fixture-animal-node",
        "protected",
        "flexible",
        "must",
      ],
      [
        "experience:wildlife-wonders:fixture-show-1000",
        "experience:wildlife-wonders",
        "fixture-stage-node",
        "optional",
        "windowed",
        "favorite",
      ],
    ],
  );

  assert.equal(result.request.horizon.date, "2026-09-19");
  assert.equal(result.request.initialNodeId, "fixture-entry-node");
  assert.equal(result.request.endNodeId, "fixture-entry-node");
});

test("visit/day preferences map to hard route policy and soft score context", () => {
  const result = buildCandidateIntegration(
    input({
      visit: visit({
        wheelchair: true,
        stroller: true,
        easyPaths: true,
      }),
      day: day({
        pace: "relaxed",
        useSkyfari: false,
      }),
      enabledConditionalEdgeIds: ["conditional-1"],
    }),
  );

  assert.equal(result.status, "ready");
  if (result.status !== "ready") throw new Error("expected ready");

  assert.deepEqual(result.request.scoreContext, {
    pace: "relaxed",
    preferEasyPaths: true,
  });
  assert.deepEqual(result.request.routePolicy, {
    allowedModes: ["walk", "bus", "elevator", "ada-shuttle"],
    requireAccessible: true,
    requireStroller: true,
    enabledConditionalEdgeIds: ["conditional-1"],
  });
});

test("missing Must-See binding blocks while missing Favorite binding is explicit warning", () => {
  const must = buildCandidateIntegration(
    input({
      priorities: priorities({
        animals: { panda: "must" },
      }),
      bindings: {
        animals: {},
        experiences: {},
      },
    }),
  );

  assert.equal(must.status, "blocked");
  assert.ok(
    must.issues.some(
      (issue) =>
        issue.code === "ANIMAL_BINDING_REQUIRED" &&
        issue.severity === "error",
    ),
  );

  const favorite = buildCandidateIntegration(
    input({
      priorities: priorities({
        animals: { panda: "favorite" },
      }),
      bindings: {
        animals: {},
        experiences: {},
      },
    }),
  );

  assert.equal(favorite.status, "ready");
  if (favorite.status !== "ready") throw new Error("expected ready");
  assert.deepEqual(favorite.candidates, []);
  assert.deepEqual(favorite.excludedSelectionKeys, ["animal:panda"]);
  assert.ok(
    favorite.issues.some(
      (issue) =>
        issue.code === "ANIMAL_BINDING_REQUIRED" &&
        issue.severity === "warning",
    ),
  );
});

test("unverified selected place is never converted into a candidate", () => {
  const data = fixture();
  data.places[0].navigationPoint.confidence = "provisional";

  const result = buildCandidateIntegration(
    input({
      data,
      priorities: priorities({
        animals: { panda: "must" },
      }),
      bindings: {
        animals: {
          panda: {
            placeId: "fixture-animal",
            dwellMinutes: 20,
          },
        },
        experiences: {},
      },
    }),
  );

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.candidates, []);
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "ANIMAL_PLACE_UNVERIFIED",
    ),
  );
});

test("unverified show performance is excluded and a required experience blocks if none remain", () => {
  const data = fixture();
  data.scheduleEvents[0].provenance.confidence = "provisional";

  const result = buildCandidateIntegration(
    input({
      data,
      priorities: priorities({
        experiences: { "wildlife-wonders": "must" },
      }),
      bindings: {
        animals: {},
        experiences: {
          "wildlife-wonders": {
            activityId: "fixture-show",
          },
        },
      },
    }),
  );

  assert.equal(result.status, "blocked");
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code === "EXPERIENCE_PERFORMANCE_UNVERIFIED",
    ),
  );
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code === "EXPERIENCE_NO_TRUSTED_PERFORMANCE" &&
        issue.severity === "error",
    ),
  );
});

test("route edges with unverified authority are planner-disabled and reported", () => {
  const data = fixture();
  data.routeEdges[0].provenance.confidence = "provisional";

  const result = buildCandidateIntegration(
    input({
      data,
      priorities: priorities({
        animals: { panda: "favorite" },
      }),
      bindings: {
        animals: {
          panda: {
            placeId: "fixture-animal",
            dwellMinutes: 20,
          },
        },
        experiences: {},
      },
    }),
  );

  assert.equal(result.status, "ready");
  assert.deepEqual(result.routingGate.disabledUnverifiedEdgeIds, [
    "fixture-edge-entry-animal",
  ]);
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "ROUTING_DATA_GATED",
    ),
  );
});

test("reservation requires explicit binding and becomes a locked fixed candidate", () => {
  const noBinding = buildCandidateIntegration(
    input({
      priorities: priorities(),
      visit: visit({
        reservation: {
          name: "Behind-the-scenes tour",
          time: "11:00",
        },
      }),
      bindings: {
        animals: {},
        experiences: {},
      },
    }),
  );

  assert.equal(noBinding.status, "blocked");
  assert.ok(
    noBinding.issues.some(
      (issue) => issue.code === "RESERVATION_BINDING_REQUIRED",
    ),
  );

  const bound = buildCandidateIntegration(
    input({
      priorities: priorities(),
      visit: visit({
        reservation: {
          name: "Behind-the-scenes tour",
          time: "11:00",
        },
      }),
      bindings: {
        animals: {},
        experiences: {},
        reservation: {
          placeId: "fixture-stage",
          durationMinutes: 30,
        },
      },
    }),
  );

  assert.equal(bound.status, "ready");
  if (bound.status !== "ready") throw new Error("expected ready");

  assert.deepEqual(
    bound.candidates.map((candidate) => [
      candidate.id,
      candidate.authority,
      candidate.timing,
      candidate.priority,
      candidate.baseDwellMinutes,
      candidate.anchor?.serviceStartMinute,
      candidate.anchor?.serviceEndMinute,
    ]),
    [
      [
        "reservation:visit",
        "locked",
        "fixed",
        "must",
        30,
        660,
        690,
      ],
    ],
  );
});

test("missing source show duration is never invented by the adapter", () => {
  const data = fixture();
  delete data.scheduleEvents[0].endTime;

  const blocked = buildCandidateIntegration(
    input({
      data,
      priorities: priorities({
        experiences: { "wildlife-wonders": "must" },
      }),
      bindings: {
        animals: {},
        experiences: {
          "wildlife-wonders": {
            activityId: "fixture-show",
          },
        },
      },
    }),
  );

  assert.equal(blocked.status, "blocked");
  assert.ok(
    blocked.issues.some(
      (issue) => issue.code === "EXPERIENCE_SCHEDULE_MISSING",
    ),
  );

  const explicit = buildCandidateIntegration(
    input({
      data,
      priorities: priorities({
        experiences: { "wildlife-wonders": "must" },
      }),
      bindings: {
        animals: {},
        experiences: {
          "wildlife-wonders": {
            activityId: "fixture-show",
            dwellMinutes: 25,
          },
        },
      },
    }),
  );

  assert.equal(explicit.status, "ready");
  if (explicit.status !== "ready") throw new Error("expected ready");
  assert.equal(explicit.candidates[0].baseDwellMinutes, 25);
});

test("duplicate selected experience activity bindings fail closed", () => {
  const result = buildCandidateIntegration(
    input({
      priorities: priorities({
        experiences: {
          "wildlife-wonders": "must",
          alias: "interested",
        },
      }),
      bindings: {
        animals: {},
        experiences: {
          "wildlife-wonders": {
            activityId: "fixture-show",
          },
          alias: {
            activityId: "fixture-show",
          },
        },
      },
    }),
  );

  assert.equal(result.status, "blocked");
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "EXPERIENCE_ACTIVITY_COLLISION",
    ),
  );
});

test("candidate construction is independent of preference insertion order", () => {
  const forward = buildCandidateIntegration(input());
  const reverse = buildCandidateIntegration(
    input({
      priorities: {
        animals: Object.fromEntries(
          Object.entries(input().priorities.animals).reverse(),
        ),
        experiences: Object.fromEntries(
          Object.entries(input().priorities.experiences).reverse(),
        ),
      },
    }),
  );

  assert.deepEqual(reverse, forward);
});

test("malformed runtime preferences and bindings fail closed", () => {
  assert.throws(
    () =>
      buildCandidateIntegration(
        input({
          priorities: {
            animals: {
              panda: "critical",
            },
            experiences: {},
          } as unknown as PriorityPreferences,
        }),
      ),
    /Animal priority is invalid/,
  );

  assert.throws(
    () =>
      buildCandidateIntegration(
        input({
          bindings: {
            animals: {
              panda: {
                placeId: "fixture-animal",
                dwellMinutes: 0,
              },
            },
            experiences: {},
          },
        }),
      ),
    /positive integer dwellMinutes/,
  );
});

test("ready integration must pass through Planner 7 qualification before trust", () => {
  const integration = buildCandidateIntegration(input());
  assert.equal(integration.status, "ready");

  const qualified = qualifyCandidateIntegration(
    integration,
    "planner-8-fixture",
    500_000,
    {
      expectedStatus: "complete",
      maxEvaluatedStates: 50_000,
      requireOracleParity: true,
    },
  );

  assert.equal(qualified.status, "qualified");
  if (qualified.status !== "qualified") {
    throw new Error("expected qualified");
  }
  assert.equal(qualified.report.passed, true);
  assert.equal(qualified.report.oracleParityMatched, true);
});

test("blocked integration never enters the optimizer qualification harness", () => {
  const integration = buildCandidateIntegration(
    input({
      priorities: priorities({
        animals: { panda: "must" },
      }),
      bindings: {
        animals: {},
        experiences: {},
      },
    }),
  );

  const qualified = qualifyCandidateIntegration(
    integration,
    "blocked-fixture",
    500_000,
    {
      expectedStatus: "complete",
      maxEvaluatedStates: 50_000,
    },
  );

  assert.deepEqual(qualified, {
    status: "integration-blocked",
    integration,
  });
});
