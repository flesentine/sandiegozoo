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
  const data = fixture();
  data.routeEdges[0].status = "conditional";

  const result = buildCandidateIntegration(
    input({
      data,
      visit: visit({
        wheelchair: true,
        stroller: true,
        easyPaths: true,
      }),
      day: day({
        pace: "relaxed",
        useSkyfari: false,
      }),
      enabledConditionalEdgeIds: [
        "fixture-edge-entry-animal",
      ],
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
    enabledConditionalEdgeIds: [
      "fixture-edge-entry-animal",
    ],
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

  assert.equal(forward.status, "ready");
  assert.equal(reverse.status, "ready");
  if (
    forward.status !== "ready" ||
    reverse.status !== "ready"
  ) {
    throw new Error("expected ready");
  }

  assert.deepEqual(reverse.candidates, forward.candidates);
  assert.deepEqual(reverse.issues, forward.issues);
  assert.deepEqual(
    reverse.excludedSelectionKeys,
    forward.excludedSelectionKeys,
  );
  assert.deepEqual(reverse.routingGate, forward.routingGate);
  assert.deepEqual(reverse.request.horizon, forward.request.horizon);
  assert.deepEqual(
    reverse.request.scoreContext,
    forward.request.scoreContext,
  );
  assert.deepEqual(
    reverse.request.routePolicy,
    forward.request.routePolicy,
  );
  assert.equal(
    reverse.request.initialNodeId,
    forward.request.initialNodeId,
  );
  assert.equal(
    reverse.request.endNodeId,
    forward.request.endNodeId,
  );
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


test("verified confidence outside effective range is not trusted for selected places", () => {
  const data = fixture();
  data.places[0].provenance.effectiveTo = "2026-09-18";

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
      (issue) =>
        issue.code === "ANIMAL_PLACE_OUTSIDE_EFFECTIVE_RANGE",
    ),
  );
});

test("initial and end nodes must be effective on the visit date", () => {
  const data = fixture();
  data.routeNodes[0].provenance.effectiveFrom = "2026-09-20";

  const result = buildCandidateIntegration(
    input({
      data,
      priorities: priorities(),
      bindings: {
        animals: {},
        experiences: {},
      },
    }),
  );

  assert.equal(result.status, "blocked");
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code === "INITIAL_NODE_OUTSIDE_EFFECTIVE_RANGE",
    ),
  );
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code === "END_NODE_OUTSIDE_EFFECTIVE_RANGE",
    ),
  );
});

test("route edges outside effective range are planner-disabled", () => {
  const data = fixture();
  data.routeEdges[0].provenance.effectiveTo = "2026-09-18";

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
});

test("conditional edge enabling rejects unknown, non-conditional, and untrusted IDs", () => {
  const unknown = buildCandidateIntegration(
    input({
      priorities: priorities(),
      bindings: {
        animals: {},
        experiences: {},
      },
      enabledConditionalEdgeIds: ["missing-edge"],
    }),
  );
  assert.equal(unknown.status, "blocked");
  assert.ok(
    unknown.issues.some(
      (issue) => issue.code === "CONDITIONAL_EDGE_UNKNOWN",
    ),
  );

  const nonConditional = buildCandidateIntegration(
    input({
      priorities: priorities(),
      bindings: {
        animals: {},
        experiences: {},
      },
      enabledConditionalEdgeIds: ["fixture-edge-entry-animal"],
    }),
  );
  assert.equal(nonConditional.status, "blocked");
  assert.ok(
    nonConditional.issues.some(
      (issue) =>
        issue.code === "CONDITIONAL_EDGE_NOT_CONDITIONAL",
    ),
  );

  const data = fixture();
  data.routeEdges[0].status = "conditional";
  data.routeEdges[0].provenance.confidence = "provisional";

  const untrusted = buildCandidateIntegration(
    input({
      data,
      priorities: priorities(),
      bindings: {
        animals: {},
        experiences: {},
      },
      enabledConditionalEdgeIds: ["fixture-edge-entry-animal"],
    }),
  );
  assert.equal(untrusted.status, "blocked");
  assert.ok(
    untrusted.issues.some(
      (issue) => issue.code === "CONDITIONAL_EDGE_UNTRUSTED",
    ),
  );
});

test("verified conditional edges may be enabled and IDs are canonicalized", () => {
  const data = fixture();
  data.routeEdges[0].status = "conditional";
  data.routeEdges[1].status = "conditional";

  const result = buildCandidateIntegration(
    input({
      data,
      priorities: priorities(),
      bindings: {
        animals: {},
        experiences: {},
      },
      enabledConditionalEdgeIds: [
        "fixture-edge-entry-animal",
        "fixture-edge-animal-stage",
      ].reverse(),
    }),
  );

  assert.equal(result.status, "ready");
  if (result.status !== "ready") throw new Error("expected ready");
  assert.deepEqual(
    result.request.routePolicy?.enabledConditionalEdgeIds,
    [
      "fixture-edge-animal-stage",
      "fixture-edge-entry-animal",
    ],
  );
});

test("two selected animal UX IDs cannot double-count the same planner place", () => {
  const result = buildCandidateIntegration(
    input({
      priorities: priorities({
        animals: {
          panda: "must",
          pandaAlias: "favorite",
        },
      }),
      bindings: {
        animals: {
          panda: {
            placeId: "fixture-animal",
            dwellMinutes: 20,
          },
          pandaAlias: {
            placeId: "fixture-animal",
            dwellMinutes: 30,
          },
        },
        experiences: {},
      },
    }),
  );

  assert.equal(result.status, "blocked");
  assert.deepEqual(result.candidates, []);
  assert.deepEqual(result.excludedSelectionKeys, [
    "animal:panda",
    "animal:pandaAlias",
  ]);
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "ANIMAL_PLACE_COLLISION",
    ),
  );
});

test("unselected experience aliases cannot overwrite selected show dwell fallback", () => {
  const data = fixture();
  delete data.scheduleEvents[0].endTime;

  const result = buildCandidateIntegration(
    input({
      data,
      priorities: priorities({
        experiences: {
          selected: "must",
          alias: "none",
        },
      }),
      bindings: {
        animals: {},
        experiences: {
          selected: {
            activityId: "fixture-show",
            dwellMinutes: 20,
          },
          alias: {
            activityId: "fixture-show",
            dwellMinutes: 99,
          },
        },
      },
    }),
  );

  assert.equal(result.status, "ready");
  if (result.status !== "ready") throw new Error("expected ready");
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].baseDwellMinutes, 20);
});

test("performance place/node effective range is enforced independently of event confidence", () => {
  const data = fixture();
  data.places[1].provenance.effectiveFrom = "2026-09-20";

  const result = buildCandidateIntegration(
    input({
      data,
      priorities: priorities({
        experiences: {
          "wildlife-wonders": "must",
        },
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
        issue.code ===
        "EXPERIENCE_PERFORMANCE_OUTSIDE_EFFECTIVE_RANGE",
    ),
  );
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code === "EXPERIENCE_NO_TRUSTED_PERFORMANCE",
    ),
  );
});

test("reservation place must be effective on visit date", () => {
  const data = fixture();
  data.places[1].provenance.effectiveTo = "2026-09-18";

  const result = buildCandidateIntegration(
    input({
      data,
      priorities: priorities(),
      visit: visit({
        reservation: {
          name: "Tour",
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

  assert.equal(result.status, "blocked");
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.code ===
        "RESERVATION_PLACE_OUTSIDE_EFFECTIVE_RANGE",
    ),
  );
});

test("candidate integration does not mutate source data or preference/binding inputs", () => {
  const value = input();
  const before = JSON.stringify({
    data: value.data,
    visit: value.visit,
    day: value.day,
    priorities: value.priorities,
    bindings: value.bindings,
    enabledConditionalEdgeIds: value.enabledConditionalEdgeIds,
  });

  buildCandidateIntegration(value);
  buildCandidateIntegration(value);

  assert.equal(
    JSON.stringify({
      data: value.data,
      visit: value.visit,
      day: value.day,
      priorities: value.priorities,
      bindings: value.bindings,
      enabledConditionalEdgeIds: value.enabledConditionalEdgeIds,
    }),
    before,
  );
});

test("issue ordering is deterministic across source schedule insertion order", () => {
  const dataA = fixture();
  const second = {
    ...dataA.scheduleEvents[0],
    id: "fixture-show-1100",
    startTime: "11:00",
    endTime: "11:20",
    provenance: {
      ...dataA.scheduleEvents[0].provenance,
      confidence: "provisional" as const,
    },
  };
  dataA.scheduleEvents[0].provenance.confidence = "provisional";
  dataA.scheduleEvents.push(second);

  const dataB = JSON.parse(
    JSON.stringify(dataA),
  ) as WildRouteDataPackage;
  dataB.scheduleEvents.reverse();

  const build = (data: WildRouteDataPackage) =>
    buildCandidateIntegration(
      input({
        data,
        priorities: priorities({
          experiences: {
            "wildlife-wonders": "must",
          },
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

  const a = build(dataA);
  const b = build(dataB);

  assert.deepEqual(a.issues, b.issues);
  assert.deepEqual(
    a.excludedSelectionKeys,
    b.excludedSelectionKeys,
  );
});
