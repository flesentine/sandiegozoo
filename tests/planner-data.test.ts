import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertValidWildRouteData,
  isValidWildRouteData,
  validateWildRouteData,
} from "../src/planner/validation.ts";
import type { WildRouteDataPackage } from "../src/planner/contracts.ts";

async function fixture(): Promise<WildRouteDataPackage> {
  const url = new URL("./fixtures/wildroute-data.valid.json", import.meta.url);
  return JSON.parse(await readFile(url, "utf8")) as WildRouteDataPackage;
}

function codes(value: unknown) {
  return validateWildRouteData(value).map((issue) => issue.code);
}

test("synthetic planner package satisfies the full contract", async () => {
  const value = await fixture();
  assert.deepEqual(validateWildRouteData(value), []);
  assert.doesNotThrow(() => assertValidWildRouteData(value));
  assert.equal(isValidWildRouteData(value), true);
});

test("rejects duplicate stable IDs", async () => {
  const value = await fixture();
  value.places.push(structuredClone(value.places[0]));
  assert.ok(codes(value).includes("DUPLICATE_ID"));
});

test("rejects dangling route edges", async () => {
  const value = await fixture();
  value.routeEdges[0].toNodeId = "missing-node";
  assert.ok(codes(value).includes("EDGE_TO_NODE_UNKNOWN"));
});

test("rejects inaccessible stairs contradictions", async () => {
  const value = await fixture();
  value.routeEdges[0].stairs = true;
  assert.ok(codes(value).includes("EDGE_ACCESSIBILITY_CONFLICT"));
  assert.ok(codes(value).includes("EDGE_STROLLER_CONFLICT"));
});

test("rejects places without a valid route node", async () => {
  const value = await fixture();
  value.places[0].routeNodeId = "missing-node";
  assert.ok(codes(value).includes("PLACE_ROUTE_NODE_UNKNOWN"));
});

test("rejects place and route-node zone mismatches", async () => {
  const value = await fixture();
  value.zones.push({
    ...structuredClone(value.zones[0]),
    id: "fixture-east",
    name: "Fixture East",
  });
  value.routeNodes[1].zoneId = "fixture-east";

  assert.ok(codes(value).includes("PLACE_ROUTE_NODE_ZONE_MISMATCH"));
});

test("rejects invalid event windows", async () => {
  const value = await fixture();
  value.scheduleEvents[0].endTime = "09:45";
  assert.ok(codes(value).includes("EVENT_TIME_RANGE_INVALID"));
});

test("rejects invalid provenance ranges", async () => {
  const value = await fixture();
  value.scheduleEvents[0].provenance.effectiveFrom = "2026-09-20";
  value.scheduleEvents[0].provenance.effectiveTo = "2026-09-19";
  assert.ok(codes(value).includes("EFFECTIVE_RANGE_INVALID"));
});

test("rejects events outside their source effective range", async () => {
  const value = await fixture();
  value.scheduleEvents[0].provenance.effectiveFrom = "2026-09-20";
  value.scheduleEvents[0].provenance.effectiveTo = "2026-09-21";

  assert.ok(codes(value).includes("EVENT_OUTSIDE_EFFECTIVE_RANGE"));
});

test("rejects loose timestamps without an explicit timezone", async () => {
  const value = await fixture();
  value.zones[0].provenance.lastVerified = "September 6, 2026 7:00 PM";

  assert.ok(codes(value).includes("LAST_VERIFIED_INVALID"));
});

test("runtime enum validation rejects values TypeScript cannot protect in JSON", async () => {
  const value = await fixture();
  const runtime = value as unknown as {
    places: Array<Record<string, unknown>>;
    routeNodes: Array<Record<string, unknown>>;
    routeEdges: Array<Record<string, unknown>>;
  };

  runtime.places[0].kind = "teleport";
  runtime.routeNodes[0].kind = "portal";
  runtime.routeEdges[0].mode = "monorail";
  runtime.routeEdges[0].difficulty = "vertical";
  runtime.routeEdges[0].status = "maybe";

  const result = codes(value);
  assert.ok(result.includes("PLACE_KIND_INVALID"));
  assert.ok(result.includes("NODE_KIND_INVALID"));
  assert.ok(result.includes("EDGE_MODE_INVALID"));
  assert.ok(result.includes("EDGE_DIFFICULTY_INVALID"));
  assert.ok(result.includes("EDGE_STATUS_INVALID"));
});

test("explicit unknown RouteEdge semantics validate without inventing facts", async () => {
  const value = await fixture();
  value.routeEdges[0].difficulty =
    "unknown";
  value.routeEdges[0].stairs =
    "unknown";
  value.routeEdges[0].accessible =
    "unknown";
  value.routeEdges[0].stroller =
    "unknown";

  assert.deepEqual(
    validateWildRouteData(value),
    [],
  );
  assert.doesNotThrow(() =>
    assertValidWildRouteData(value),
  );
});

test("unknown stairs does not create accessibility or stroller contradictions", async () => {
  const value = await fixture();
  value.routeEdges[0].stairs =
    "unknown";
  value.routeEdges[0].accessible =
    true;
  value.routeEdges[0].stroller =
    true;

  const result = codes(value);
  assert.equal(
    result.includes(
      "EDGE_ACCESSIBILITY_CONFLICT",
    ),
    false,
  );
  assert.equal(
    result.includes(
      "EDGE_STROLLER_CONFLICT",
    ),
    false,
  );
});

test("runtime boolean validation rejects truthy strings", async () => {
  const value = await fixture();
  const edge = value.routeEdges[0] as unknown as Record<string, unknown>;

  edge.stairs = "false";
  edge.accessible = "true";
  edge.stroller = 1;
  edge.oneWay = "no";

  const result = codes(value);
  assert.ok(result.includes("EDGE_STAIRS_INVALID"));
  assert.ok(result.includes("EDGE_ACCESSIBLE_INVALID"));
  assert.ok(result.includes("EDGE_STROLLER_INVALID"));
  assert.ok(result.includes("EDGE_ONE_WAY_INVALID"));
});

test("malformed collection entries return issues instead of throwing", async () => {
  const value = await fixture();
  const runtime = value as unknown as {
    zones: unknown[];
    places: unknown[];
    routeNodes: unknown[];
    routeEdges: unknown[];
    scheduleEvents: unknown[];
  };

  runtime.zones[0] = null;
  runtime.places[0] = "not-an-object";
  runtime.routeNodes[0] = 42;
  runtime.routeEdges[0] = [];
  runtime.scheduleEvents[0] = false;

  let issues: ReturnType<typeof validateWildRouteData> = [];
  assert.doesNotThrow(() => {
    issues = validateWildRouteData(value);
  });

  const result = issues.map((issue) => issue.code);
  assert.ok(result.includes("ZONE_RECORD_INVALID"));
  assert.ok(result.includes("PLACE_RECORD_INVALID"));
  assert.ok(result.includes("ROUTE_NODE_RECORD_INVALID"));
  assert.ok(result.includes("ROUTE_EDGE_RECORD_INVALID"));
  assert.ok(result.includes("SCHEDULE_EVENT_RECORD_INVALID"));
  assert.equal(isValidWildRouteData(value), false);
});

test("malformed scalar fields return issues instead of throwing", async () => {
  const value = await fixture();
  const runtime = value as unknown as {
    zones: Array<Record<string, unknown>>;
    places: Array<Record<string, unknown>>;
  };

  runtime.zones[0].name = 123;
  runtime.zones[0].provenance = {
    sourceUrl: 99,
    sourceLabel: {},
    lastVerified: [],
    confidence: true,
  };
  runtime.places[0].navigationPoint = "somewhere";

  let result: string[] = [];
  assert.doesNotThrow(() => {
    result = codes(value);
  });

  assert.ok(result.includes("ZONE_NAME_REQUIRED"));
  assert.ok(result.includes("SOURCE_URL_INVALID"));
  assert.ok(result.includes("SOURCE_LABEL_REQUIRED"));
  assert.ok(result.includes("LAST_VERIFIED_INVALID"));
  assert.ok(result.includes("CONFIDENCE_INVALID"));
  assert.ok(result.includes("NAVIGATION_POINT_REQUIRED"));
});

test("validation issue ordering is deterministic for audit output", async () => {
  const value = await fixture();
  const runtime = value as unknown as {
    routeEdges: Array<Record<string, unknown>>;
  };

  runtime.routeEdges[0].mode = "teleport";
  runtime.routeEdges[0].distanceMeters = -1;
  runtime.routeEdges[0].oneWay = "sometimes";

  const first = validateWildRouteData(value);
  const second = validateWildRouteData(structuredClone(value));

  assert.deepEqual(second, first);
  assert.throws(
    () => assertValidWildRouteData(value),
    /EDGE_MODE_INVALID.*EDGE_DISTANCE_INVALID.*EDGE_ONE_WAY_INVALID/s,
  );
});

test("warns instead of failing for an orphan route node", async () => {
  const value = await fixture();
  value.routeNodes.push({
    ...structuredClone(value.routeNodes[0]),
    id: "fixture-orphan",
  });

  const issues = validateWildRouteData(value);
  assert.ok(
    issues.some(
      (issue) =>
        issue.code === "ORPHAN_ROUTE_NODE" && issue.severity === "warning",
    ),
  );

  assert.doesNotThrow(() => assertValidWildRouteData(value));
  assert.equal(isValidWildRouteData(value), true);
});


test("requires a stable activity ID for schedule grouping", async () => {
  const value = await fixture();
  const runtime = value.scheduleEvents[0] as unknown as Record<string, unknown>;
  runtime.activityId = "";

  assert.ok(codes(value).includes("EVENT_ACTIVITY_ID_REQUIRED"));
});


test("rejects recommended arrival that crosses into the prior day", async () => {
  const value = await fixture();
  value.scheduleEvents[0].startTime = "00:05";
  value.scheduleEvents[0].endTime = "00:20";
  value.scheduleEvents[0].recommendedArrivalMinutes = 10;

  assert.ok(codes(value).includes("EVENT_ARRIVAL_CROSSES_DAY"));
});
