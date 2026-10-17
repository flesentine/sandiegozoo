import {
  assertSelectedEndpointCoordinatePromotable,
  selectLatestVisibleEndpointVersion,
  type SelectedFootwayEndpointHistoricalNodeVersion,
} from "./zooInteriorSelectedFootwayEndpointCoordinateSelector.ts";

const ENDPOINT_NODE_ID = "48920902" as const;
const HISTORY_URL =
  "https://api.openstreetmap.org/api/0.6/node/48920902/history" as const;
const TARGET_TIMESTAMP = "2026-02-21T20:08:08Z" as const;

export type SelectedFootwayEndpointHistoryIngestionResult = {
  sourceUrl: typeof HISTORY_URL;
  sourceObjectId: typeof ENDPOINT_NODE_ID;
  targetTimestamp: typeof TARGET_TIMESTAMP;
  candidateCount: number;
  selected: SelectedFootwayEndpointHistoricalNodeVersion | null;
};

function decodeXmlAttribute(value: string): string {
  return value.replace(
    /&(?:quot|apos|lt|gt|amp|#\d+|#x[0-9A-Fa-f]+);/g,
    (entity) => {
      if (entity === "&quot;") return '"';
      if (entity === "&apos;") return "'";
      if (entity === "&lt;") return "<";
      if (entity === "&gt;") return ">";
      if (entity === "&amp;") return "&";
      const numeric = entity.startsWith("&#x")
        ? Number.parseInt(entity.slice(3, -1), 16)
        : Number.parseInt(entity.slice(2, -1), 10);
      if (!Number.isSafeInteger(numeric) || numeric < 0 || numeric > 0x10ffff) {
        throw new Error("Planner 74 contains invalid XML entity.");
      }
      return String.fromCodePoint(numeric);
    },
  );
}

function parseAttributes(fragment: string): Record<string, string> {
  const attributes: Record<string, string> = Object.create(null);
  const pattern = /([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(["'])(.*?)\2/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(fragment)) !== null) {
    if (Object.hasOwn(attributes, match[1])) {
      throw new Error("Planner 74 node contains duplicate XML attribute " + match[1] + ".");
    }
    attributes[match[1]] = decodeXmlAttribute(match[3]);
  }
  return attributes;
}

function requireIntegerAttribute(
  attributes: Record<string, string>,
  name: string,
  label: string,
): number {
  const raw = attributes[name];
  if (!/^[1-9]\d*$/.test(raw ?? "")) {
    throw new Error(label + " requires positive integer " + name + ".");
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    throw new Error(label + " requires safely representable " + name + ".");
  }
  return value;
}

function parseBooleanAttribute(
  attributes: Record<string, string>,
  name: string,
  defaultValue: boolean,
  label: string,
): boolean {
  const raw = attributes[name];
  if (raw === undefined) return defaultValue;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new Error(label + " requires boolean " + name + ".");
}

function parseCoordinate(
  attributes: Record<string, string>,
  name: "lat" | "lon",
  min: number,
  max: number,
  label: string,
): number {
  const raw = attributes[name];
  if (raw === undefined || raw.trim() === "") {
    throw new Error(label + " visible version requires " + name + ".");
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(label + " " + name + " must be a finite coordinate in range.");
  }
  return value;
}

function assertTimestamp(raw: string | undefined, label: string): string {
  if (
    !raw ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(raw)
  ) {
    throw new Error(label + " requires canonical UTC timestamp.");
  }
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(label + " requires canonical UTC timestamp.");
  }
  const normalized = raw.includes(".") ? raw : raw.replace("Z", ".000Z");
  if (new Date(parsed).toISOString() !== normalized) {
    throw new Error(label + " requires real UTC calendar timestamp.");
  }
  return raw;
}

type XmlStartToken = {
  name: string;
  attributes: Record<string, string>;
  selfClosing: boolean;
  depth: number;
};

function tokenizeWellFormedXml(
  xml: string,
  onStart: (token: XmlStartToken) => void,
): void {
  const stack: string[] = [];
  let rootSeen = false;
  let rootClosed = false;
  let index = 0;

  while (index < xml.length) {
    const lt = xml.indexOf("<", index);
    if (lt < 0) {
      if (xml.slice(index).trim() !== "") {
        throw new Error("Planner 74 XML contains text outside elements.");
      }
      break;
    }
    if (xml.slice(index, lt).trim() !== "") {
      throw new Error("Planner 74 XML contains unsupported element text.");
    }

    if (xml.startsWith("<!--", lt)) {
      const end = xml.indexOf("-->", lt + 4);
      if (end < 0) throw new Error("Planner 74 XML contains an unterminated comment.");
      index = end + 3;
      continue;
    }
    if (xml.startsWith("<?", lt)) {
      const end = xml.indexOf("?>", lt + 2);
      if (end < 0) throw new Error("Planner 74 XML contains an unterminated declaration.");
      index = end + 2;
      continue;
    }
    if (xml.startsWith("<![CDATA[", lt) || xml.startsWith("<!DOCTYPE", lt)) {
      throw new Error("Planner 74 XML contains unsupported markup.");
    }

    const gt = xml.indexOf(">", lt + 1);
    if (gt < 0) throw new Error("Planner 74 XML is truncated.");
    const raw = xml.slice(lt + 1, gt).trim();
    if (raw === "") throw new Error("Planner 74 XML contains an empty tag.");

    if (raw.startsWith("/")) {
      const name = raw.slice(1).trim();
      if (!/^[A-Za-z_:][A-Za-z0-9_.:-]*$/.test(name)) {
        throw new Error("Planner 74 XML contains a malformed closing tag.");
      }
      const expected = stack.pop();
      if (expected !== name) {
        throw new Error("Planner 74 XML contains mismatched closing tags.");
      }
      if (stack.length === 0) rootClosed = true;
      index = gt + 1;
      continue;
    }

    const selfClosing = /\/\s*$/.test(raw);
    const body = selfClosing ? raw.replace(/\/\s*$/, "").trim() : raw;
    const nameMatch = /^([A-Za-z_:][A-Za-z0-9_.:-]*)(?:\s+([\s\S]*))?$/.exec(body);
    if (!nameMatch) throw new Error("Planner 74 XML contains a malformed start tag.");
    const name = nameMatch[1];
    const attrText = nameMatch[2] ?? "";

    if (!rootSeen) {
      if (name !== "osm") throw new Error("Planner 74 requires osm as the document root.");
      rootSeen = true;
    } else if (rootClosed) {
      throw new Error("Planner 74 XML contains content after the root element.");
    }

    const attributes = parseAttributes(attrText);
    const scrubbed = attrText.replace(
      /([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(["'])(.*?)\2/g,
      "",
    );
    if (scrubbed.trim() !== "") {
      throw new Error("Planner 74 XML contains malformed attributes.");
    }

    onStart({ name, attributes, selfClosing, depth: stack.length });
    if (!selfClosing) stack.push(name);
    else if (stack.length === 0 && name === "osm") rootClosed = true;
    index = gt + 1;
  }

  if (!rootSeen || !rootClosed || stack.length !== 0) {
    throw new Error("Planner 74 XML is not a complete well-formed document.");
  }
}

export function parseSelectedFootwayEndpointHistoryXml(
  xml: string,
): SelectedFootwayEndpointHistoricalNodeVersion[] {
  if (typeof xml !== "string" || xml.length === 0) {
    throw new Error("Planner 74 requires non-empty OSM history XML.");
  }
  if (xml.length > 2_000_000) {
    throw new Error("Planner 74 history XML exceeds the ingestion size limit.");
  }

  const candidates: SelectedFootwayEndpointHistoricalNodeVersion[] = [];
  const seenVersions = new Set<number>();
  let previousVersion = 0;
  let previousTimestampMillis = Number.NEGATIVE_INFINITY;
  tokenizeWellFormedXml(xml, ({ name, attributes, selfClosing, depth }) => {
    if (name === "osm") {
      if (depth !== 0 || selfClosing) {
        throw new Error("Planner 74 requires a non-empty osm root.");
      }
      return;
    }

    if (name !== "node") {
      if (depth < 1) throw new Error("Planner 74 XML element is outside osm.");
      return;
    }

    if (depth !== 1) {
      throw new Error("Planner 74 node records must be direct children of osm.");
    }

    const label = "Planner 74 historical node " + candidates.length;
    if (attributes.id !== ENDPOINT_NODE_ID) {
      throw new Error(label + " must target node " + ENDPOINT_NODE_ID + ".");
    }

    const sourceVersion = requireIntegerAttribute(attributes, "version", label);
    if (seenVersions.has(sourceVersion)) {
      throw new Error("Planner 74 history contains duplicate version " + sourceVersion + ".");
    }
    if (sourceVersion !== previousVersion + 1) {
      throw new Error(
        "Planner 74 history must contain a contiguous version chain starting at 1.",
      );
    }
    seenVersions.add(sourceVersion);

    const sourceChangeset = requireIntegerAttribute(attributes, "changeset", label);
    const sourceTimestamp = assertTimestamp(attributes.timestamp, label);
    const timestampMillis = Date.parse(sourceTimestamp);
    if (timestampMillis <= previousTimestampMillis) {
      throw new Error("Planner 74 history timestamps must increase with versions.");
    }
    previousVersion = sourceVersion;
    previousTimestampMillis = timestampMillis;

    const visible = parseBooleanAttribute(attributes, "visible", true, label);
    if (!visible) {
      if (attributes.lat !== undefined || attributes.lon !== undefined) {
        throw new Error(label + " deleted version cannot expose coordinates.");
      }
      candidates.push({
        sourceObjectId: ENDPOINT_NODE_ID,
        sourceVersion,
        sourceTimestamp,
        sourceChangeset,
        sourceVersionUrl:
          "https://api.openstreetmap.org/api/0.6/node/" +
          ENDPOINT_NODE_ID +
          "/" +
          sourceVersion,
        visible: false,
      });
      return;
    }

    const lat = parseCoordinate(attributes, "lat", -90, 90, label);
    const lng = parseCoordinate(attributes, "lon", -180, 180, label);
    candidates.push({
      sourceObjectId: ENDPOINT_NODE_ID,
      sourceVersion,
      sourceTimestamp,
      sourceChangeset,
      sourceVersionUrl:
        "https://api.openstreetmap.org/api/0.6/node/" +
        ENDPOINT_NODE_ID +
        "/" +
        sourceVersion,
      visible: true,
      lat,
      lng,
    });
  });

  if (candidates.length === 0) {
    throw new Error("Planner 74 history XML contains no endpoint node versions.");
  }
  if (candidates.length > 10000) {
    throw new Error("Planner 74 history contains too many node versions.");
  }
  return candidates;
}

function latestVersionAtTarget(
  candidates: readonly SelectedFootwayEndpointHistoricalNodeVersion[],
): SelectedFootwayEndpointHistoricalNodeVersion | null {
  const targetMillis = Date.parse(TARGET_TIMESTAMP);
  let latest: SelectedFootwayEndpointHistoricalNodeVersion | null = null;
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (Date.parse(candidate.sourceTimestamp) <= targetMillis) latest = candidate;
    else break;
  }
  return latest;
}

export function ingestSelectedFootwayEndpointHistoryXml(
  xml: string,
): SelectedFootwayEndpointHistoryIngestionResult {
  const candidates = parseSelectedFootwayEndpointHistoryXml(xml);
  const active = latestVersionAtTarget(candidates);
  let selected: SelectedFootwayEndpointHistoricalNodeVersion | null = null;
  if (active?.visible) {
    selected = selectLatestVisibleEndpointVersion(candidates);
    if (!selected || selected.sourceVersion !== active.sourceVersion) {
      throw new Error("Planner 74 selection disagrees with the active historical version.");
    }
    assertSelectedEndpointCoordinatePromotable(selected);
  }
  return Object.freeze({
    sourceUrl: HISTORY_URL,
    sourceObjectId: ENDPOINT_NODE_ID,
    targetTimestamp: TARGET_TIMESTAMP,
    candidateCount: candidates.length,
    selected,
  });
}
