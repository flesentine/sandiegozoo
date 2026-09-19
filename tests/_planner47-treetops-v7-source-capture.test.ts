import assert from "node:assert/strict";
import test from "node:test";

test("Planner 47 temporary capture of exact Treetops v7 tags", async () => {
  const response = await fetch(
    "https://api.openstreetmap.org/api/0.6/way/148910139/7.json",
    {
      headers: {
        "user-agent": "WildRoute-Planner47-source-capture/1.0",
        accept: "application/json",
      },
    },
  );
  assert.equal(response.status, 200);
  const payload = await response.json() as {
    elements?: Array<{
      type?: string;
      id?: number;
      version?: number;
      timestamp?: string;
      changeset?: number;
      tags?: Record<string, string>;
    }>;
  };
  const way = payload.elements?.find(
    (entry) => entry.type === "way" && entry.id === 148910139 && entry.version === 7,
  );
  assert.ok(way);
  console.log("PLANNER47_TREETOPS_V7_TIMESTAMP=" + way.timestamp);
  console.log("PLANNER47_TREETOPS_V7_CHANGESET=" + way.changeset);
  console.log("PLANNER47_TREETOPS_V7_TAGS=" + JSON.stringify(way.tags ?? {}));
});
