const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z";
const NODE_ID = 13588159625;

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

const history = await fetchJson(
  `https://api.openstreetmap.org/api/0.6/node/${NODE_ID}/history.json`,
  { headers: { "user-agent": "sandiegozoo-planner60-capture/1.0" } },
  "OSM node history"
);

const nodeVersions = (history.elements ?? [])
  .filter(element => element.type === "node" && element.id === NODE_ID && element.visible !== false)
  .filter(element => Date.parse(element.timestamp) <= Date.parse(TARGET_TIMESTAMP))
  .sort((a, b) => a.version - b.version);

if (nodeVersions.length === 0) {
  throw new Error("No visible endpoint node version exists at or before the Fern Canyon way timestamp.");
}

const node = nodeVersions[nodeVersions.length - 1];
const nodeVersionUrl =
  `https://api.openstreetmap.org/api/0.6/node/${NODE_ID}/${node.version}.json`;
const nodeExact = await fetchJson(
  nodeVersionUrl,
  { headers: { "user-agent": "sandiegozoo-planner60-capture/1.0" } },
  `OSM node ${NODE_ID} v${node.version}`
);
const exactNode = nodeExact.elements?.find(
  element => element.type === "node" && element.id === NODE_ID
);
if (!exactNode) throw new Error("Missing exact endpoint node payload.");
if (
  exactNode.version !== node.version ||
  exactNode.timestamp !== node.timestamp ||
  exactNode.changeset !== node.changeset ||
  exactNode.lat !== node.lat ||
  exactNode.lon !== node.lon
) {
  throw new Error("Exact endpoint node payload does not match node history selection.");
}

const query = `[out:json][timeout:60][date:"${TARGET_TIMESTAMP}"];
node(id:${NODE_ID});
way(bn);
out meta;`;
const body = new URLSearchParams({ data: query }).toString();
const overpass = await fetchJson(
  "https://overpass-api.de/api/interpreter",
  {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": "sandiegozoo-planner60-capture/1.0",
    },
    body,
  },
  "historical Overpass endpoint topology"
);

const candidates = (overpass.elements ?? [])
  .filter(element => element.type === "way" && element.visible !== false)
  .sort((a, b) => a.id - b.id);

const verifiedWays = [];
for (const candidate of candidates) {
  const versionUrl =
    `https://api.openstreetmap.org/api/0.6/way/${candidate.id}/${candidate.version}.json`;
  const payload = await fetchJson(
    versionUrl,
    { headers: { "user-agent": "sandiegozoo-planner60-capture/1.0" } },
    `OSM way ${candidate.id} v${candidate.version}`
  );
  const way = payload.elements?.find(
    element => element.type === "way" && element.id === candidate.id
  );
  if (!way) throw new Error(`Missing way ${candidate.id} exact-version payload`);
  if (
    way.version !== candidate.version ||
    way.timestamp !== candidate.timestamp ||
    way.changeset !== candidate.changeset
  ) {
    throw new Error(`Historical metadata mismatch for way ${candidate.id}`);
  }
  if (!(way.nodes ?? []).includes(NODE_ID)) {
    throw new Error(`Way ${candidate.id} lost endpoint node ${NODE_ID}`);
  }
  verifiedWays.push({
    sourceWayId: String(way.id),
    sourceWayVersion: way.version,
    sourceWayTimestamp: way.timestamp,
    sourceWayChangeset: way.changeset,
    sourceWayVersionUrl: versionUrl.replace(".json", ""),
    sourceWayUrl: `https://www.openstreetmap.org/way/${way.id}`,
    tags: way.tags ?? {},
    orderedNodeIds: (way.nodes ?? []).map(String),
    sharedNodeIndex: (way.nodes ?? []).indexOf(NODE_ID),
  });
}

console.log("PLANNER60_CAPTURE_BEGIN");
console.log(JSON.stringify({
  targetTimestamp: TARGET_TIMESTAMP,
  endpointNode: {
    sourceObjectId: String(NODE_ID),
    sourceVersion: node.version,
    sourceTimestamp: node.timestamp,
    sourceChangeset: node.changeset,
    lat: node.lat,
    lng: node.lon,
    sourceVersionUrl: nodeVersionUrl.replace(".json", ""),
    sourceUrl: `https://www.openstreetmap.org/node/${NODE_ID}`,
  },
  historicalConnectedWayCount: verifiedWays.length,
  connectedWays: verifiedWays,
}, null, 2));
console.log("PLANNER60_CAPTURE_END");
