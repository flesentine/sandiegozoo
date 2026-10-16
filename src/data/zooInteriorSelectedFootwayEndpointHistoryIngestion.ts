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
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
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

export function parseSelectedFootwayEndpointHistoryXml(
  xml: string,
): SelectedFootwayEndpointHistoricalNodeVersion[] {
  if (typeof xml !== "string" || xml.length === 0) {
    throw new Error("Planner 74 requires non-empty OSM history XML.");
  }
  if (xml.length > 2_000_000) {
    throw new Error("Planner 74 history XML exceeds the ingestion size limit.");
  }
  if (!/<osm(?:\s|>)/.test(xml)) {
    throw new Error("Planner 74 requires an OSM XML document.");
  }

  const candidates: SelectedFootwayEndpointHistoricalNodeVersion[] = [];
  const seenVersions = new Set<number>();
  const nodePattern = /<node\b([^>]*)\/?\s*>/g;
  let match: RegExpExecArray | null;

  while ((match = nodePattern.exec(xml)) !== null) {
    const attributes = parseAttributes(match[1]);
    const label = "Planner 74 historical node " + candidates.length;

    if (attributes.id !== ENDPOINT_NODE_ID) {
      throw new Error(label + " must target node " + ENDPOINT_NODE_ID + ".");
    }

    const sourceVersion = requireIntegerAttribute(attributes, "version", label);
    if (seenVersions.has(sourceVersion)) {
      throw new Error("Planner 74 history contains duplicate version " + sourceVersion + ".");
    }
    seenVersions.add(sourceVersion);

    const sourceChangeset = requireIntegerAttribute(attributes, "changeset", label);
    const sourceTimestamp = assertTimestamp(attributes.timestamp, label);
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
      continue;
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
  }

  if (candidates.length === 0) {
    throw new Error("Planner 74 history XML contains no endpoint node versions.");
  }
  if (candidates.length > 10000) {
    throw new Error("Planner 74 history contains too many node versions.");
  }

  return candidates;
}

export function ingestSelectedFootwayEndpointHistoryXml(
  xml: string,
): SelectedFootwayEndpointHistoryIngestionResult {
  const candidates = parseSelectedFootwayEndpointHistoryXml(xml);
  const selected = selectLatestVisibleEndpointVersion(candidates);
  if (selected !== null) {
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
