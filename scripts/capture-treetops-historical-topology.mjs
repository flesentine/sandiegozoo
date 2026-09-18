const TARGET_TIMESTAMP = "2026-02-21T20:28:40Z";
const TREETOPS_WAY_ID = 148910139;
const NODE_IDS = [
  1619736626,1619736622,1619736623,10303552086,1619736627,1619736634,13588159626,2596192926,
  13588159615,2596192924,2596192927,13588159620,2596192928,2596192929,13588159624,1619736615,
  1619736612,1619736607,1619736597,1619736585,1619736582,13588248406,1619736579,1619736575,
  1619736581,1619736580,1619736571,1619736567,1619736562,1619736557,1619736548,1619736539,
  1619736522,1619736499
];

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

const query = `[out:json][timeout:60][date:"${TARGET_TIMESTAMP}"];
node(id:${NODE_IDS.join(",")});
way(bn);
out meta;`;

const body = new URLSearchParams({ data: query }).toString();
const overpass = await fetchJson(
  "https://overpass-api.de/api/interpreter",
  { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "sandiegozoo-planner44-capture/1.0" }, body },
  "historical Overpass topology"
);

const nodeSet = new Set(NODE_IDS);
const indexByNode = new Map(NODE_IDS.map((id, index) => [id, index]));
const candidates = overpass.elements
  .filter(element => element.type === "way" && element.id !== TREETOPS_WAY_ID)
  .map(element => ({
    id: element.id,
    version: element.version,
    timestamp: element.timestamp,
    changeset: element.changeset,
    visible: element.visible !== false,
    tags: element.tags ?? {},
    nodeIds: element.nodes ?? [],
    sharedNodeIds: (element.nodes ?? []).filter(id => nodeSet.has(id)),
  }))
  .filter(candidate => candidate.visible && candidate.sharedNodeIds.length > 0)
  .sort((a,b) => Math.min(...a.sharedNodeIds.map(id => indexByNode.get(id))) - Math.min(...b.sharedNodeIds.map(id => indexByNode.get(id))) || a.id - b.id);

const verified = [];
for (const candidate of candidates) {
  const versionUrl = `https://api.openstreetmap.org/api/0.6/way/${candidate.id}/${candidate.version}.json`;
  const payload = await fetchJson(versionUrl, { headers: { "user-agent": "sandiegozoo-planner44-capture/1.0" } }, `OSM way ${candidate.id} v${candidate.version}`);
  const way = payload.elements?.find(element => element.type === "way" && element.id === candidate.id);
  if (!way) throw new Error(`Missing way ${candidate.id} in exact-version payload`);
  if (way.version !== candidate.version || way.timestamp !== candidate.timestamp || way.changeset !== candidate.changeset) {
    throw new Error(`Historical metadata mismatch for way ${candidate.id}`);
  }
  const exactShared = (way.nodes ?? []).filter(id => nodeSet.has(id));
  if (JSON.stringify(exactShared) !== JSON.stringify(candidate.sharedNodeIds)) {
    throw new Error(`Historical node sequence mismatch for way ${candidate.id}`);
  }
  verified.push({
    sourceWayId: String(candidate.id),
    sourceWayVersion: candidate.version,
    sourceWayTimestamp: candidate.timestamp,
    sourceWayChangeset: candidate.changeset,
    sourceWayVersionUrl: versionUrl.replace(".json", ""),
    sourceWayUrl: `https://www.openstreetmap.org/way/${candidate.id}`,
    sharedNodeIds: exactShared.map(String),
    firstSharedTreetopsIndex: Math.min(...exactShared.map(id => indexByNode.get(id))),
    tags: way.tags ?? {},
    orderedNodeIds: (way.nodes ?? []).map(String),
  });
}

const sharedByTreetopsNode = NODE_IDS.map((nodeId, treetopsIndex) => ({
  nodeId: String(nodeId),
  treetopsIndex,
  connectedWays: verified.filter(way => way.sharedNodeIds.includes(String(nodeId))).map(way => way.sourceWayId)
})).filter(entry => entry.connectedWays.length > 0);

console.log("PLANNER44_CAPTURE_BEGIN");
console.log(JSON.stringify({
  targetTimestamp: TARGET_TIMESTAMP,
  sourceTreetopsWayId: String(TREETOPS_WAY_ID),
  sourceTreetopsNodeCount: NODE_IDS.length,
  historicalCandidateWayCount: verified.length,
  sharedByTreetopsNode,
  connectedWays: verified,
}, null, 2));
console.log("PLANNER44_CAPTURE_END");
