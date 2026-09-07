export type Confidence = "verified" | "provisional" | "unknown";

export type SourceProvenance = {
  sourceUrl: string;
  sourceLabel: string;
  lastVerified: string;
  confidence: Confidence;
  effectiveFrom?: string;
  effectiveTo?: string;
};

export type NavigationPoint = {
  lat: number;
  lng: number;
  confidence: Confidence;
};

export type ZoneRecord = {
  id: string;
  name: string;
  provenance: SourceProvenance;
};

export type PlaceKind =
  | "animal"
  | "experience"
  | "dining"
  | "restroom"
  | "entrance"
  | "transport"
  | "elevator"
  | "service";

export type PlaceRecord = {
  id: string;
  kind: PlaceKind;
  name: string;
  zoneId: string;
  routeNodeId: string;
  navigationPoint: NavigationPoint;
  appleMapsLabel?: string;
  applePlaceId?: string;
  provenance: SourceProvenance;
};

export type RouteNodeKind =
  | "junction"
  | "destination"
  | "entrance"
  | "transport"
  | "elevator";

export type RouteNode = {
  id: string;
  kind: RouteNodeKind;
  zoneId: string;
  lat: number;
  lng: number;
  provenance: SourceProvenance;
};

export type RouteMode =
  | "walk"
  | "skyfari"
  | "bus"
  | "elevator"
  | "ada-shuttle";

export type RouteDifficulty = "easy" | "moderate" | "steep";
export type RouteStatus = "open" | "closed" | "conditional";

export type RouteEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  mode: RouteMode;
  distanceMeters: number;
  durationMinutes: number;
  difficulty: RouteDifficulty;
  stairs: boolean;
  accessible: boolean;
  stroller: boolean;
  oneWay: boolean;
  status: RouteStatus;
  provenance: SourceProvenance;
};

export type ScheduleEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime?: string;
  recommendedArrivalMinutes: number;
  placeId: string;
  provenance: SourceProvenance;
};

export type WildRouteDataPackage = {
  schemaVersion: "1";
  zones: ZoneRecord[];
  places: PlaceRecord[];
  routeNodes: RouteNode[];
  routeEdges: RouteEdge[];
  scheduleEvents: ScheduleEvent[];
};
