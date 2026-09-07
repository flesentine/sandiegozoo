import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertValidWildRouteData,
  validateWildRouteData,
} from "../src/planner/validation.ts";
import type { WildRouteDataPackage } from "../src/planner/contracts.ts";

async function fixture(): Promise<WildRouteDataPackage> {
  const url = new URL("./fixtures/wildroute-data.valid.json", import.meta.url);
  return JSON.parse(await readFile(url, "utf8")) as WildRouteDataPackage;
}

function codes(value: WildRouteDataPackage) {
  return validateWildRouteData(value).map((issue) => issue.code);
}

test("synthetic planner package satisfies the full contract", async () => {
  const value = await fixture();
  const issues = assertValidWildRouteData(value);
  assert.deepEqual(issues, []);
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
});
