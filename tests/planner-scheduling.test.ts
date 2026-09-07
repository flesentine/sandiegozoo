import assert from "node:assert/strict";
import test from "node:test";
import type {
  PlaceRecord,
  RouteEdge,
  RouteNode,
  ScheduleEvent,
  SourceProvenance,
  WildRouteDataPackage,
} from "../src/planner/contracts.ts";
import { buildRoutingGraph } from "../src/planner/routing.ts";
import {
  buildShowCandidateSets,
  createDwellTarget,
  createLockedAnchor,
  createPlanningHorizon,
  evaluateAnchorSequence,
  parseClockMinute,
  type PlanningHorizon,
  type ScheduleAnchor,
} from "../src/planner/scheduling.ts";

const provenance: SourceProvenance = {
  sourceUrl: "https://example.invalid/schedule-fixture",
  sourceLabel: "Synthetic schedule fixture",
  lastVerified: "2026-09-06T20:00:00-07:00",
  confidence: "verified",
};

function node(id: string): RouteNode {
  return {
    id,
    kind: id === "entry" ? "entrance" : "destination",
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
  distanceMeters = durationMinutes * 80,
): RouteEdge {
  return {
    id,
    fromNodeId,
    toNodeId,
    mode: "walk",
    distanceMeters,
    durationMinutes,
    difficulty: "easy",
    stairs: false,
    accessible: true,
    stroller: true,
    oneWay: false,
    status: "open",
    provenance: { ...provenance },
  };
}

function place(id: string, routeNodeId: string): PlaceRecord {
  return {
    id,
    kind: "experience",
    name: id,
    zoneId: "fixture-zone",
    routeNodeId,
    navigationPoint: {
      lat: 0,
      lng: 0,
      confidence: "verified",
    },
    provenance: { ...provenance },
  };
}

function event(
  id: string,
  activityId: string,
  placeId: string,
  startTime: string,
  overrides: Partial<ScheduleEvent> = {},
): ScheduleEvent {
  return {
    id,
    activityId,
    title: activityId,
    date: "2026-09-19",
    startTime,
    endTime: "10:30",
    recommendedArrivalMinutes: 10,
    placeId,
    provenance: {
      ...provenance,
      effectiveFrom: "2026-09-19",
      effectiveTo: "2026-09-19",
    },
    ...overrides,
  };
}

function dataPackage(
  scheduleEvents: ScheduleEvent[] = [],
): WildRouteDataPackage {
  return {
    schemaVersion: "1",
    zones: [
      {
        id: "fixture-zone",
        name: "Fixture Zone",
        provenance: { ...provenance },
      },
    ],
    places: [
      place("stage-a", "a"),
      place("stage-b", "b"),
    ],
    routeNodes: ["entry", "a", "b", "c"].map(node),
    routeEdges: [
      edge("entry-a", "entry", "a", 10),
      edge("a-b", "a", "b", 12),
      edge("b-c", "b", "c", 8),
      edge("entry-c", "entry", "c", 40),
    ],
    scheduleEvents,
  };
}

function horizon(): PlanningHorizon {
  const result = createPlanningHorizon(
    "2026-09-19",
    "09:00",
    "17:00",
  );
  assert.equal(result.status, "valid");
  if (result.status !== "valid") throw new Error("expected valid horizon");
  return result.horizon;
}

function locked(
  id: string,
  nodeId: string,
  startTime: string,
  durationMinutes: number,
): ScheduleAnchor {
  const result = createLockedAnchor({
    id,
    title: id,
    nodeId,
    startTime,
    durationMinutes,
  });
  assert.equal(result.status, "valid");
  if (result.status !== "valid") throw new Error("expected valid anchor");
  return result.anchor;
}

test("parses valid clock times deterministically", () => {
  assert.equal(parseClockMinute("00:00"), 0);
  assert.equal(parseClockMinute("09:15"), 555);
  assert.equal(parseClockMinute("23:59"), 1439);
  assert.equal(parseClockMinute("9:15"), null);
  assert.equal(parseClockMinute("24:00"), null);
});

test("creates same-day planning horizons and rejects invalid windows", () => {
  assert.deepEqual(
    createPlanningHorizon("2026-09-19", "09:00", "17:00"),
    {
      status: "valid",
      horizon: {
        date: "2026-09-19",
        startMinute: 540,
        endMinute: 1020,
        durationMinutes: 480,
      },
    },
  );

  assert.deepEqual(
    createPlanningHorizon("2026-02-30", "09:00", "17:00"),
    { status: "invalid", reason: "DATE_INVALID" },
  );
  assert.deepEqual(
    createPlanningHorizon("2026-09-19", "17:00", "09:00"),
    { status: "invalid", reason: "NON_POSITIVE_HORIZON" },
  );
});

test("dwell targets require stable IDs nodes and positive integer duration", () => {
  assert.deepEqual(createDwellTarget("panda", "a", 20), {
    status: "valid",
    target: {
      id: "panda",
      nodeId: "a",
      durationMinutes: 20,
    },
  });
  assert.equal(createDwellTarget("", "a", 20).status, "invalid");
  assert.equal(createDwellTarget("panda", "", 20).status, "invalid");
  assert.equal(createDwellTarget("panda", "a", 0).status, "invalid");
  assert.equal(createDwellTarget("panda", "a", 2.5).status, "invalid");
});

test("locked anchors are immovable fixed service intervals", () => {
  assert.deepEqual(
    createLockedAnchor({
      id: "tour",
      title: "Tour",
      nodeId: "a",
      startTime: "11:30",
      durationMinutes: 45,
    }),
    {
      status: "valid",
      anchor: {
        id: "tour",
        kind: "locked",
        title: "Tour",
        nodeId: "a",
        arrivalWindowStartMinute: 690,
        arrivalWindowEndMinute: 690,
        serviceStartMinute: 690,
        serviceEndMinute: 735,
      },
    },
  );
});

test("builds deterministic show candidate sets with recommended-arrival windows", () => {
  const data = dataPackage([
    event("wonder-1400", "wildlife-wonders", "stage-a", "14:00", {
      endTime: "14:25",
      recommendedArrivalMinutes: 10,
    }),
    event("wonder-1200", "wildlife-wonders", "stage-a", "12:00", {
      endTime: "12:25",
      recommendedArrivalMinutes: 15,
    }),
    event("ambassador-1300", "ambassadors", "stage-b", "13:00", {
      endTime: "13:20",
      recommendedArrivalMinutes: 5,
    }),
  ]);

  const built = buildShowCandidateSets(data, "2026-09-19");

  assert.deepEqual(built.issues, []);
  assert.deepEqual(
    built.sets.map((set) => [
      set.activityId,
      set.candidates.map((candidate) => candidate.eventId),
    ]),
    [
      ["ambassadors", ["ambassador-1300"]],
      ["wildlife-wonders", ["wonder-1200", "wonder-1400"]],
    ],
  );

  const noon = built.sets[1].candidates[0];
  assert.equal(noon.recommendedArrivalMinute, 705);
  assert.equal(noon.arrivalWindowStartMinute, 705);
  assert.equal(noon.arrivalWindowEndMinute, 720);
  assert.equal(noon.serviceStartMinute, 720);
  assert.equal(noon.serviceEndMinute, 745);
});

test("uses explicit dwell duration when a show end time is unavailable", () => {
  const data = dataPackage([
    event("open-ended", "open-ended-show", "stage-a", "10:00", {
      endTime: undefined,
    }),
  ]);

  const missing = buildShowCandidateSets(data, "2026-09-19");
  assert.equal(missing.sets.length, 0);
  assert.deepEqual(missing.issues.map((issue) => issue.code), [
    "SHOW_DURATION_REQUIRED",
  ]);

  const withDwell = buildShowCandidateSets(data, "2026-09-19", {
    "open-ended-show": 25,
  });
  assert.equal(withDwell.issues.length, 0);
  assert.equal(withDwell.sets[0].candidates[0].serviceEndMinute, 625);
});

test("ignores performances from other visit dates", () => {
  const data = dataPackage([
    event("today", "show", "stage-a", "10:00"),
    event("tomorrow", "show", "stage-a", "11:00", {
      date: "2026-09-20",
      endTime: "11:30",
      provenance: {
        ...provenance,
        effectiveFrom: "2026-09-20",
        effectiveTo: "2026-09-20",
      },
    }),
  ]);

  const built = buildShowCandidateSets(data, "2026-09-19");
  assert.deepEqual(
    built.sets[0].candidates.map((candidate) => candidate.eventId),
    ["today"],
  );
});

test("feasible anchor sequence accounts for travel and waiting", () => {
  const graph = buildRoutingGraph(dataPackage());
  const result = evaluateAnchorSequence(
    graph,
    horizon(),
    "entry",
    [
      locked("tour-a", "a", "10:00", 30),
      locked("tour-b", "b", "11:00", 20),
    ],
  );

  assert.equal(result.status, "feasible");
  if (result.status !== "feasible") throw new Error("expected feasible");

  assert.equal(result.steps[0].rawArrivalMinute, 550);
  assert.equal(result.steps[0].plannedArrivalMinute, 600);
  assert.equal(result.steps[0].waitForArrivalWindowMinutes, 50);
  assert.equal(result.steps[0].waitForServiceMinutes, 0);

  assert.equal(result.steps[1].departMinute, 630);
  assert.equal(result.steps[1].rawArrivalMinute, 642);
  assert.equal(result.steps[1].plannedArrivalMinute, 660);
  assert.equal(result.totalTravelMinutes, 22);
  assert.equal(result.totalTravelMeters, 1760);
  assert.equal(result.finishMinute, 680);
  assert.equal(result.remainingMinutes, 340);
});

test("show candidate may be reached after recommended arrival but before start", () => {
  const data = dataPackage([
    event("show-1000", "show", "stage-a", "10:00", {
      endTime: "10:20",
      recommendedArrivalMinutes: 15,
    }),
  ]);
  data.routeEdges[0].durationMinutes = 52;

  const graph = buildRoutingGraph(data);
  const candidate = buildShowCandidateSets(
    data,
    "2026-09-19",
  ).sets[0].candidates[0];

  const result = evaluateAnchorSequence(
    graph,
    horizon(),
    "entry",
    [candidate],
  );

  assert.equal(result.status, "feasible");
  if (result.status !== "feasible") throw new Error("expected feasible");
  assert.equal(result.steps[0].rawArrivalMinute, 592);
  assert.equal(result.steps[0].plannedArrivalMinute, 592);
  assert.equal(result.steps[0].waitForServiceMinutes, 8);
});

test("missed arrival window fails explicitly", () => {
  const data = dataPackage();
  data.routeEdges[0].durationMinutes = 70;
  const graph = buildRoutingGraph(data);

  const result = evaluateAnchorSequence(
    graph,
    horizon(),
    "entry",
    [locked("tour", "a", "10:00", 30)],
  );

  assert.deepEqual(result, {
    status: "infeasible",
    horizon: horizon(),
    reason: "ARRIVAL_WINDOW_MISSED",
    anchorId: "tour",
  });
});

test("unreachable anchor returns the routing failure instead of moving the anchor", () => {
  const data = dataPackage();
  data.routeEdges = data.routeEdges.filter((item) => item.id !== "a-b");
  const graph = buildRoutingGraph(data);

  const result = evaluateAnchorSequence(
    graph,
    horizon(),
    "entry",
    [
      locked("first", "a", "10:00", 30),
      locked("second", "b", "11:00", 30),
    ],
    { allowedModes: [] },
  );

  assert.equal(result.status, "infeasible");
  if (result.status !== "infeasible") throw new Error("expected infeasible");
  assert.equal(result.reason, "NO_ROUTE_TO_ANCHOR");
  assert.equal(result.anchorId, "first");
  assert.equal(result.routeReason, "NO_ROUTE");
});

test("rejects overlapping anchor ordering before attempting routes", () => {
  const graph = buildRoutingGraph(dataPackage());

  const result = evaluateAnchorSequence(
    graph,
    horizon(),
    "entry",
    [
      locked("first", "a", "10:00", 60),
      locked("second", "b", "10:30", 30),
    ],
  );

  assert.equal(result.status, "infeasible");
  if (result.status !== "infeasible") throw new Error("expected infeasible");
  assert.equal(result.reason, "ANCHOR_ORDER_CONFLICT");
  assert.equal(result.anchorId, "second");
});

test("rejects anchors outside the visit horizon", () => {
  const graph = buildRoutingGraph(dataPackage());

  const result = evaluateAnchorSequence(
    graph,
    horizon(),
    "entry",
    [locked("late", "a", "16:45", 30)],
  );

  assert.equal(result.status, "infeasible");
  if (result.status !== "infeasible") throw new Error("expected infeasible");
  assert.equal(result.reason, "ANCHOR_OUTSIDE_HORIZON");
});

test("duplicate anchor IDs fail deterministically", () => {
  const graph = buildRoutingGraph(dataPackage());
  const anchor = locked("same", "a", "10:00", 20);

  const result = evaluateAnchorSequence(
    graph,
    horizon(),
    "entry",
    [anchor, { ...anchor, serviceStartMinute: 660, serviceEndMinute: 680 }],
  );

  assert.equal(result.status, "infeasible");
  if (result.status !== "infeasible") throw new Error("expected infeasible");
  assert.equal(result.reason, "DUPLICATE_ANCHOR_ID");
});

test("route constraints flow through anchor feasibility", () => {
  const data = dataPackage();
  data.routeEdges[0].accessible = false;
  const graph = buildRoutingGraph(data);

  const result = evaluateAnchorSequence(
    graph,
    horizon(),
    "entry",
    [locked("tour", "a", "10:00", 20)],
    { requireAccessible: true },
  );

  assert.equal(result.status, "infeasible");
  if (result.status !== "infeasible") throw new Error("expected infeasible");
  assert.equal(result.reason, "NO_ROUTE_TO_ANCHOR");
});
