const WAY_ID = 148910139;
const WAY_VERSION = 7;
const API = "https://api.openstreetmap.org/api/0.6";

async function getJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "WildRoute-Planner43-geometry-capture/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

const wayUrl = `${API}/way/${WAY_ID}/${WAY_VERSION}.json`;
const wayPayload = await getJson(wayUrl);
const way = wayPayload.elements?.find(
  (element) => element.type === "way" && element.id === WAY_ID,
);

if (!way || way.version !== WAY_VERSION || !Array.isArray(way.nodes)) {
  throw new Error("Exact Treetops Way v7 payload was not returned as expected.");
}

const wayTimestamp = Date.parse(way.timestamp);
if (!Number.isFinite(wayTimestamp)) {
  throw new Error(`Invalid way timestamp ${way.timestamp}`);
}

const nodes = [];
for (const nodeId of way.nodes) {
  const historyUrl = `${API}/node/${nodeId}/history.json`;
  const history = await getJson(historyUrl);
  const candidates = (history.elements ?? [])
    .filter((element) =>
      element.type === "node" &&
      element.id === nodeId &&
      element.visible !== false &&
      Number.isFinite(Date.parse(element.timestamp)) &&
      Date.parse(element.timestamp) <= wayTimestamp &&
      Number.isFinite(element.lat) &&
      Number.isFinite(element.lon)
    )
    .sort((a, b) => a.version - b.version);

  const selected = candidates.at(-1);
  if (!selected) {
    throw new Error(
      `No visible historical node version found for ${nodeId} at ${way.timestamp}`,
    );
  }

  nodes.push({
    id: nodeId,
    version: selected.version,
    timestamp: selected.timestamp,
    changeset: selected.changeset,
    lat: selected.lat,
    lon: selected.lon,
    versionUrl: `${API}/node/${nodeId}/${selected.version}`,
  });
}

const capture = {
  source: {
    provider: "OpenStreetMap",
    wayId: WAY_ID,
    wayVersion: WAY_VERSION,
    wayTimestamp: way.timestamp,
    changeset: way.changeset,
    wayVersionUrl: `${API}/way/${WAY_ID}/${WAY_VERSION}`,
    tags: way.tags ?? {},
  },
  orderedNodeIds: [...way.nodes],
  nodes,
};

console.log("PLANNER43_OSM_CAPTURE_BEGIN");
console.log(JSON.stringify(capture));
console.log("PLANNER43_OSM_CAPTURE_END");
