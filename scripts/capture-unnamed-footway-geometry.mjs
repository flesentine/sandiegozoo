const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z";
const SOURCE_WAY_ID = 1481578625;
const SOURCE_WAY_VERSION = 1;
const NODE_IDS = [13588159634, 1619736694];
const FAR_ENDPOINT_NODE_ID = 1619736694;

async function fetchJson(url, init, label) {
  let last;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      last = error;
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error(`${label} failed: ${last}`);
}

const wayVersionUrl =
  `https://api.openstreetmap.org/api/0.6/way/${SOURCE_WAY_ID}/${SOURCE_WAY_VERSION}.json`;
const wayPayload = await fetchJson(
  wayVersionUrl,
  { headers: { "user-agent": "sandiegozoo-planner67-capture/1.0" } },
  "exact unnamed footway"
);
const way = wayPayload.elements?.find(
  element => element.type === "way" && element.id === SOURCE_WAY_ID
);
if (!way) throw new Error("Missing exact unnamed footway.");
if (
  way.version !== SOURCE_WAY_VERSION ||
  way.timestamp !== TARGET_TIMESTAMP ||
  JSON.stringify(way.nodes ?? []) !== JSON.stringify(NODE_IDS)
) {
  throw new Error("Unnamed footway identity drifted.");
}

const selectedNodes = [];
for (const nodeId of NODE_IDS) {
  const history = await fetchJson(
    `https://api.openstreetmap.org/api/0.6/node/${nodeId}/history.json`,
    { headers: { "user-agent": "sandiegozoo-planner67-capture/1.0" } },
    `OSM node ${nodeId} history`
  );
  const versions = (history.elements ?? [])
    .filter(element => element.type === "node" && element.id === nodeId && element.visible !== false)
    .filter(element => Date.parse(element.timestamp) <= Date.parse(TARGET_TIMESTAMP))
    .sort((a, b) => a.version - b.version);
  if (versions.length === 0) {
    throw new Error(`No visible version for node ${nodeId} at or before target timestamp`);
  }
  const node = versions[versions.length - 1];
  const versionUrl =
    `https://api.openstreetmap.org/api/0.6/node/${nodeId}/${node.version}.json`;
  const exactPayload = await fetchJson(
    versionUrl,
    { headers: { "user-agent": "sandiegozoo-planner67-capture/1.0" } },
    `OSM node ${nodeId} v${node.version}`
  );
  const exact = exactPayload.elements?.find(
    element => element.type === "node" && element.id === nodeId
  );
  if (!exact) throw new Error(`Missing exact node ${nodeId}`);
  if (
    exact.version !== node.version ||
    exact.timestamp !== node.timestamp ||
    exact.changeset !== node.changeset ||
    exact.lat !== node.lat ||
    exact.lon !== node.lon
  ) {
    throw new Error(`Exact node mismatch for ${nodeId}`);
  }
  selectedNodes.push({
    sourceObjectId: String(nodeId),
    sourceVersion: node.version,
    sourceTimestamp: node.timestamp,
    sourceChangeset: node.changeset,
    lat: node.lat,
    lng: node.lon,
    sourceVersionUrl: versionUrl.replace(".json", ""),
    sourceUrl: `https://www.openstreetmap.org/node/${nodeId}`,
  });
}

const query = `[out:json][timeout:60][date:"${TARGET_TIMESTAMP}"];
node(id:${FAR_ENDPOINT_NODE_ID});
way(bn);
out meta;`;
const body = new URLSearchParams({ data: query }).toString();
const overpass = await fetchJson(
  "https://overpass-api.de/api/interpreter",
  {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": "sandiegozoo-planner67-capture/1.0",
    },
    body,
  },
  "historical Overpass unnamed-footway endpoint topology"
);

const connectedWays = [];
for (const candidate of (overpass.elements ?? [])
  .filter(element => element.type === "way" && element.visible !== false)
  .sort((a, b) => a.id - b.id)) {
  const versionUrl =
    `https://api.openstreetmap.org/api/0.6/way/${candidate.id}/${candidate.version}.json`;
  const payload = await fetchJson(
    versionUrl,
    { headers: { "user-agent": "sandiegozoo-planner67-capture/1.0" } },
    `OSM way ${candidate.id} v${candidate.version}`
  );
  const exactWay = payload.elements?.find(
    element => element.type === "way" && element.id === candidate.id
  );
  if (!exactWay) throw new Error(`Missing exact way ${candidate.id}`);
  if (
    exactWay.version !== candidate.version ||
    exactWay.timestamp !== candidate.timestamp ||
    exactWay.changeset !== candidate.changeset ||
    !(exactWay.nodes ?? []).includes(FAR_ENDPOINT_NODE_ID)
  ) {
    throw new Error(`Exact historical way mismatch for ${candidate.id}`);
  }
  connectedWays.push({
    sourceWayId: String(exactWay.id),
    sourceWayVersion: exactWay.version,
    sourceWayTimestamp: exactWay.timestamp,
    sourceWayChangeset: exactWay.changeset,
    sourceWayVersionUrl: versionUrl.replace(".json", ""),
    sourceWayUrl: `https://www.openstreetmap.org/way/${exactWay.id}`,
    tags: exactWay.tags ?? {},
    orderedNodeIds: (exactWay.nodes ?? []).map(String),
    sharedNodeIndex: (exactWay.nodes ?? []).indexOf(FAR_ENDPOINT_NODE_ID),
  });
}

console.log("PLANNER67_CAPTURE_BEGIN");
console.log(JSON.stringify({
  targetTimestamp: TARGET_TIMESTAMP,
  sourceWay: {
    sourceWayId: String(way.id),
    sourceWayVersion: way.version,
    sourceWayTimestamp: way.timestamp,
    sourceWayChangeset: way.changeset,
    sourceWayVersionUrl: wayVersionUrl.replace(".json", ""),
    sourceWayUrl: `https://www.openstreetmap.org/way/${way.id}`,
    tags: way.tags ?? {},
    orderedNodeIds: (way.nodes ?? []).map(String),
  },
  nodes: selectedNodes,
  farEndpointNodeId: String(FAR_ENDPOINT_NODE_ID),
  farEndpointHistoricalConnectedWayCount: connectedWays.length,
  farEndpointConnectedWays: connectedWays,
}, null, 2));
console.log("PLANNER67_CAPTURE_END");
