const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z";
const SOURCE_WAY_ID = 1481578622;
const NODE_IDS = [
  13588159627,
  13588159628,
  13588159629,
  13588159630,
  13588159631,
  13588159625,
];
const FAR_ENDPOINT_NODE_ID = 13588159627;

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

const selectedNodes = [];
for (const nodeId of NODE_IDS) {
  const history = await fetchJson(
    `https://api.openstreetmap.org/api/0.6/node/${nodeId}/history.json`,
    { headers: { "user-agent": "sandiegozoo-planner61-capture/1.0" } },
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
    { headers: { "user-agent": "sandiegozoo-planner61-capture/1.0" } },
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
      "user-agent": "sandiegozoo-planner61-capture/1.0",
    },
    body,
  },
  "historical Overpass far-end topology"
);

const connectedWays = [];
for (const candidate of (overpass.elements ?? [])
  .filter(element => element.type === "way" && element.visible !== false)
  .sort((a, b) => a.id - b.id)) {
  const versionUrl =
    `https://api.openstreetmap.org/api/0.6/way/${candidate.id}/${candidate.version}.json`;
  const payload = await fetchJson(
    versionUrl,
    { headers: { "user-agent": "sandiegozoo-planner61-capture/1.0" } },
    `OSM way ${candidate.id} v${candidate.version}`
  );
  const way = payload.elements?.find(
    element => element.type === "way" && element.id === candidate.id
  );
  if (!way) throw new Error(`Missing exact way ${candidate.id}`);
  if (
    way.version !== candidate.version ||
    way.timestamp !== candidate.timestamp ||
    way.changeset !== candidate.changeset ||
    !(way.nodes ?? []).includes(FAR_ENDPOINT_NODE_ID)
  ) {
    throw new Error(`Exact historical way mismatch for ${candidate.id}`);
  }

  connectedWays.push({
    sourceWayId: String(way.id),
    sourceWayVersion: way.version,
    sourceWayTimestamp: way.timestamp,
    sourceWayChangeset: way.changeset,
    sourceWayVersionUrl: versionUrl.replace(".json", ""),
    sourceWayUrl: `https://www.openstreetmap.org/way/${way.id}`,
    tags: way.tags ?? {},
    orderedNodeIds: (way.nodes ?? []).map(String),
    sharedNodeIndex: (way.nodes ?? []).indexOf(FAR_ENDPOINT_NODE_ID),
  });
}

console.log("PLANNER61_CAPTURE_BEGIN");
console.log(JSON.stringify({
  targetTimestamp: TARGET_TIMESTAMP,
  sourceWayId: String(SOURCE_WAY_ID),
  orderedNodeIds: NODE_IDS.map(String),
  nodes: selectedNodes,
  farEndpointNodeId: String(FAR_ENDPOINT_NODE_ID),
  farEndpointHistoricalConnectedWayCount: connectedWays.length,
  farEndpointConnectedWays: connectedWays,
}, null, 2));
console.log("PLANNER61_CAPTURE_END");
