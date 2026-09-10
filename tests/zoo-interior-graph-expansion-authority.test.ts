import assert from "node:assert/strict";
import test from "node:test";
import {
  INTERIOR_GRAPH_EXPANSION_SEEDS,
  assessInteriorGraphExpansion,
  assertInteriorGraphExpansionAuthorityIntegrity,
  interiorGraphExpansionSeedForWay,
  type InteriorGraphExpansionSeed,
} from "../src/data/zooInteriorGraphExpansionAuthority.ts";
import {
  ENTRANCE_PEDESTRIAN_TOPOLOGY,
} from "../src/data/zooGuestNavigationAuthority.ts";
import {
  PUBLISHED_WALKING_CORRIDORS,
} from "../src/data/zooMapAuthority.ts";

const ROUTE_EDGE_FIELDS = [
  "fromNodeId",
  "toNodeId",
  "mode",
  "distanceMeters",
  "durationMinutes",
  "difficulty",
  "stairs",
  "accessible",
  "stroller",
  "oneWay",
  "status",
  "provenance",
] as const;

test("Planner 25 seeds graph expansion from the exact Front Street topology boundary", () => {
  assert.equal(INTERIOR_GRAPH_EXPANSION_SEEDS.length, 1);

  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];
  assert.deepEqual(
    [
      seed.id,
      seed.provider,
      seed.sourceWayId,
      seed.connectionNodeId,
      seed.ingressTopologyId,
      seed.sourceState,
      seed.plannerMaterialization,
    ],
    [
      "sdz-interior-expansion-front-street",
      "OpenStreetMap",
      "1481425058",
      "7053320515",
      "sdz-guest-entrance-main-ingress-topology",
      "way-identified-geometry-not-sourced",
      "graph-expansion-seed-only",
    ],
  );

  assert.equal(
    seed.sourceUrl,
    "https://www.openstreetmap.org/way/1481425058",
  );
  assert.equal(
    seed.connectionNodeSourceUrl,
    "https://www.openstreetmap.org/node/7053320515",
  );
});

test("Planner 25 derives the seed from existing qualified ingress topology rather than a second topology claim", () => {
  const topology = ENTRANCE_PEDESTRIAN_TOPOLOGY.find(
    (candidate) =>
      candidate.connectsToDescriptor === "Front Street",
  );
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];

  assert.ok(topology);
  assert.equal(seed.sourceWayId, topology.frontStreetWayId);
  assert.equal(
    seed.connectionNodeId,
    topology.frontStreetConnectionNodeId,
  );
  assert.equal(seed.ingressTopologyId, topology.id);
  assert.equal(
    topology.waySourceUrls.filter(
      (sourceUrl) => sourceUrl === seed.sourceUrl,
    ).length,
    1,
  );
  assert.equal(
    topology.connectionNodeSourceUrls.filter(
      (sourceUrl) =>
        sourceUrl === seed.connectionNodeSourceUrl,
    ).length,
    1,
  );
});

test("official Front Street corridor metadata is preserved without becoming exact segment weight authority", () => {
  const corridor = PUBLISHED_WALKING_CORRIDORS.find(
    (candidate) =>
      candidate.id === "sdz-corridor-front-street",
  );
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];

  assert.ok(corridor);
  assert.equal(seed.officialCorridorId, corridor.id);
  assert.equal(
    seed.officialMapArtifactId,
    corridor.artifactId,
  );
  assert.equal(seed.officialPublishedWalkMinutes, 20);
  assert.equal(seed.officialCorridorTerrain, "mild");
  assert.deepEqual(seed.officialCorridorAccessLabels, [
    "Wildlife Explorers Basecamp",
    "Lost Forest",
    "Outback",
    "Urban Jungle",
    "Africa Rocks",
  ]);

  assert.equal("terrain" in seed, false);
  assert.equal("accessLabels" in seed, false);

  for (const field of ROUTE_EDGE_FIELDS) {
    assert.equal(field in seed, false);
  }
});

test("Front Street way lookup exposes only the qualified expansion seed", () => {
  assert.equal(
    interiorGraphExpansionSeedForWay("1481425058")?.id,
    "sdz-interior-expansion-front-street",
  );
  assert.equal(
    interiorGraphExpansionSeedForWay("755054694"),
    undefined,
  );
  assert.equal(
    interiorGraphExpansionSeedForWay("not-a-way"),
    undefined,
  );
});

test("route graph expansion stays explicitly blocked until every independent RouteEdge semantic is sourced", () => {
  assert.deepEqual(
    assessInteriorGraphExpansion(),
    {
      status: "expansion-seed-ready",
      seedId: "sdz-interior-expansion-front-street",
      sourceWayId: "1481425058",
      connectionNodeId: "7053320515",
      officialCorridorId: "sdz-corridor-front-street",
      routeGraphExpansion: {
        status: "blocked",
        reasons: [
          "FRONT_STREET_WAY_GEOMETRY_NOT_CAPTURED",
          "EXPANSION_ENDPOINT_NODE_NOT_SOURCED",
          "EXACT_SEGMENT_MODE_NOT_SOURCED",
          "EXACT_SEGMENT_DISTANCE_NOT_SOURCED",
          "EXACT_SEGMENT_DURATION_NOT_SOURCED",
          "EXACT_SEGMENT_DIFFICULTY_NOT_SOURCED",
          "EXACT_SEGMENT_STAIRS_NOT_SOURCED",
          "EXACT_SEGMENT_ACCESSIBILITY_NOT_SOURCED",
          "EXACT_SEGMENT_STROLLER_NOT_SOURCED",
          "EXACT_SEGMENT_PEDESTRIAN_DIRECTION_NOT_SOURCED",
          "EXACT_SEGMENT_OPERATIONAL_STATUS_NOT_SOURCED",
          "EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE",
        ],
      },
    },
  );
});

test("the published 20-minute Front Street summary cannot be smuggled in as RouteEdge duration", () => {
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];
  const forged = {
    ...seed,
    durationMinutes: seed.officialPublishedWalkMinutes,
  } as InteriorGraphExpansionSeed & {
    durationMinutes: number;
  };

  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        forged,
      ]),
    /cannot materialize Planner RouteEdge field durationMinutes/,
  );
});

test("retired bare corridor field names are rejected at the runtime authority boundary", () => {
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];

  const staleTerrain = {
    ...seed,
    terrain: seed.officialCorridorTerrain,
  } as InteriorGraphExpansionSeed & {
    terrain: "mild";
  };
  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        staleTerrain,
      ]),
    /cannot contain unknown field terrain/,
  );

  const staleAccessLabels = {
    ...seed,
    accessLabels: seed.officialCorridorAccessLabels,
  } as InteriorGraphExpansionSeed & {
    accessLabels: readonly string[];
  };
  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        staleAccessLabels,
      ]),
    /cannot contain unknown field accessLabels/,
  );
});

test("unknown runtime fields cannot smuggle exact segment authority under aliases", () => {
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];
  const forged = {
    ...seed,
    exactSegmentDurationMinutes:
      seed.officialPublishedWalkMinutes,
  } as InteriorGraphExpansionSeed & {
    exactSegmentDurationMinutes: number;
  };

  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        forged,
      ]),
    /cannot contain unknown field exactSegmentDurationMinutes/,
  );
});

test("prototype and non-enumerable field tricks cannot bypass the runtime schema", () => {
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];

  const inherited = Object.create({
    ...seed,
    terrain: seed.officialCorridorTerrain,
  }) as InteriorGraphExpansionSeed;
  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        inherited,
      ]),
    /must be a plain object with Object\.prototype/,
  );

  const hiddenAlias = {
    ...seed,
  } as InteriorGraphExpansionSeed & {
    exactSegmentDurationMinutes?: number;
  };
  Object.defineProperty(
    hiddenAlias,
    "exactSegmentDurationMinutes",
    {
      value: seed.officialPublishedWalkMinutes,
      enumerable: false,
    },
  );
  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        hiddenAlias,
      ]),
    /cannot contain unknown field exactSegmentDurationMinutes/,
  );

  const hiddenKnownField = { ...seed };
  Object.defineProperty(hiddenKnownField, "id", {
    value: seed.id,
    enumerable: false,
  });
  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        hiddenKnownField,
      ]),
    /requires enumerable own data field id/,
  );
});

test("the canonical Planner 25 expansion seed ID is part of the integrity contract", () => {
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];
  const renamed = {
    ...seed,
    id: "renamed-seed",
  } as unknown as InteriorGraphExpansionSeed;

  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        renamed,
      ]),
    /drifted from qualified ingress topology/,
  );
});

test("malformed runtime seed entries fail closed before field inspection", () => {
  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        null as unknown as InteriorGraphExpansionSeed,
      ]),
    /must be a plain object/,
  );

  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        [] as unknown as InteriorGraphExpansionSeed,
      ]),
    /must be a plain object/,
  );
});

test("authority integrity rejects topology drift", () => {
  const seed = INTERIOR_GRAPH_EXPANSION_SEEDS[0];
  const drifted = {
    ...seed,
    sourceWayId: "999999999",
    sourceUrl:
      "https://www.openstreetmap.org/way/999999999",
  } as InteriorGraphExpansionSeed;

  assert.throws(
    () =>
      assertInteriorGraphExpansionAuthorityIntegrity([
        drifted,
      ]),
    /drifted from qualified ingress topology/,
  );
});

test("Planner 25 expansion authority is deeply immutable and unknown seeds fail closed", () => {
  assert.equal(
    Object.isFrozen(INTERIOR_GRAPH_EXPANSION_SEEDS),
    true,
  );
  assert.equal(
    Object.isFrozen(INTERIOR_GRAPH_EXPANSION_SEEDS[0]),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INTERIOR_GRAPH_EXPANSION_SEEDS[0]
        .officialCorridorAccessLabels,
    ),
    true,
  );

  const assessment = assessInteriorGraphExpansion();
  assert.equal(Object.isFrozen(assessment), true);
  assert.equal(
    Object.isFrozen(assessment.routeGraphExpansion),
    true,
  );
  assert.equal(
    Object.isFrozen(
      assessment.routeGraphExpansion.reasons,
    ),
    true,
  );

  assert.throws(
    () =>
      assessInteriorGraphExpansion("not-a-seed"),
    /Unknown Planner 25 interior graph expansion seed/,
  );
});
