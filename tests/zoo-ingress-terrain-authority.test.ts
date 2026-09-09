import assert from "node:assert/strict";
import test from "node:test";
import {
  CORRIDOR_TERRAIN_EVIDENCE,
  TERRAIN_SEMANTIC_REFERENCES,
  assessIngressTerrainAuthority,
  assessPlannerDifficultyForPublishedTerrain,
  assertCorridorTerrainAuthorityIntegrity,
  classifyExactStairsAuthority,
  corridorTerrainEvidenceForId,
  type CorridorTerrainEvidence,
} from "../src/data/zooIngressTerrainAuthority.ts";

test("Planner 18 preserves all published corridor terrain classes one-to-one", () => {
  assert.deepEqual(
    CORRIDOR_TERRAIN_EVIDENCE.map(
      (record) => [
        record.corridorId,
        record.publishedTerrain,
        record.stairsEvidence,
      ],
    ),
    [
      [
        "sdz-corridor-front-street",
        "mild",
        "not-explicitly-published",
      ],
      [
        "sdz-corridor-park-way",
        "mild-to-steep",
        "not-explicitly-published",
      ],
      [
        "sdz-corridor-center-street",
        "steep",
        "not-explicitly-published",
      ],
      [
        "sdz-corridor-treetops-way",
        "mild",
        "not-explicitly-published",
      ],
      [
        "sdz-corridor-fern-canyon-trail",
        "steep-and-stairs",
        "explicitly-published",
      ],
      [
        "sdz-corridor-monkey-trail",
        "mild",
        "not-explicitly-published",
      ],
      [
        "sdz-corridor-tiger-trail",
        "mild-to-steep",
        "not-explicitly-published",
      ],
    ],
  );
});

test("Fern Canyon Trail carries explicit corridor-level stairs evidence only", () => {
  assert.deepEqual(
    corridorTerrainEvidenceForId(
      "sdz-corridor-fern-canyon-trail",
    ),
    {
      id:
        "sdz-corridor-fern-canyon-trail-terrain-evidence",
      artifactId:
        "sdz-map-2026-01-05-accessibility",
      corridorId:
        "sdz-corridor-fern-canyon-trail",
      corridorName: "Fern Canyon Trail",
      sourceUrl:
        "https://zoo.sandiegozoo.org/sites/default/files/2026-01/Zoo_ADA_Map_01-05-26_web.pdf",
      observedAt:
        "2026-09-07T21:53:00-07:00",
      publishedTerrain:
        "steep-and-stairs",
      stairsEvidence:
        "explicitly-published",
      plannerDifficultyAuthority:
        "source-terrain-only",
      plannerStairsAuthority:
        "corridor-only",
      scope: "named-corridor",
      plannerMaterialization:
        "corridor-terrain-evidence-only",
    },
  );
});

test("Front Street mild terrain remains corridor evidence rather than Planner difficulty", () => {
  const frontStreet =
    corridorTerrainEvidenceForId(
      "sdz-corridor-front-street",
    );
  assert.ok(frontStreet);
  assert.equal(
    frontStreet.publishedTerrain,
    "mild",
  );
  assert.deepEqual(
    assessPlannerDifficultyForPublishedTerrain(
      frontStreet.publishedTerrain,
    ),
    {
      status: "blocked",
      reason:
        "DIFFICULTY_POLICY_NOT_DEFINED",
    },
  );
});

test("every published terrain value fails closed until difficulty policy exists", () => {
  for (const terrain of [
    "mild",
    "mild-to-steep",
    "steep",
    "steep-and-stairs",
  ] as const) {
    assert.deepEqual(
      assessPlannerDifficultyForPublishedTerrain(
        terrain,
      ),
      {
        status: "blocked",
        reason:
          "DIFFICULTY_POLICY_NOT_DEFINED",
      },
    );
  }
});

test("controlled entrance passage has no exact difficulty or stairs authority", () => {
  assert.deepEqual(
    assessIngressTerrainAuthority("755054695"),
    {
      sourceWayId: "755054695",
      difficultyAuthority: {
        status: "blocked",
        reason:
          "EXACT_EDGE_DIFFICULTY_NOT_SOURCED",
        basis:
          "Planner 18 difficulty authority",
        sourceSnapshotId:
          "sdz-pedestrian-direction-way-755054695",
      },
      stairsAuthority: {
        status: "blocked",
        reason:
          "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
        basis:
          "Planner 18 stairs authority",
        sourceSnapshotId:
          "sdz-pedestrian-direction-way-755054695",
      },
    },
  );
});

test("Front Street connection retains mild corridor evidence without exact-edge promotion", () => {
  assert.deepEqual(
    assessIngressTerrainAuthority("755054694"),
    {
      sourceWayId: "755054694",
      difficultyAuthority: {
        status: "blocked",
        reason:
          "CORRIDOR_TERRAIN_NOT_EXACT_EDGE_AUTHORITY",
        basis:
          "Planner 18 difficulty authority",
        sourceSnapshotId:
          "sdz-pedestrian-direction-way-755054694",
        corridorTerrainEvidenceId:
          "sdz-corridor-front-street-terrain-evidence",
      },
      stairsAuthority: {
        status: "blocked",
        reason:
          "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
        basis:
          "Planner 18 stairs authority",
        sourceSnapshotId:
          "sdz-pedestrian-direction-way-755054694",
        corridorTerrainEvidenceId:
          "sdz-corridor-front-street-terrain-evidence",
      },
    },
  );
});

test("unknown ingress way fails closed", () => {
  assert.deepEqual(
    assessIngressTerrainAuthority("unknown-way"),
    {
      sourceWayId: "unknown-way",
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
    },
  );
});

test("exact OSM highway=steps would support stairs=true prospectively", () => {
  assert.deepEqual(
    classifyExactStairsAuthority({
      id: "synthetic-steps",
      sourceTags: {
        highway: "steps",
        incline: "up",
      },
    }),
    {
      status: "supported",
      value: true,
      basis: "OSM highway=steps",
      sourceSnapshotId:
        "synthetic-steps",
    },
  );
});

test("absence of highway=steps does not support stairs=false", () => {
  assert.deepEqual(
    classifyExactStairsAuthority({
      id: "synthetic-footway",
      sourceTags: {
        highway: "pedestrian",
      },
    }),
    {
      status: "blocked",
      reason:
        "EXACT_EDGE_STAIRS_NOT_EXPLICITLY_SOURCED",
      basis: "Planner 18 stairs authority",
      sourceSnapshotId:
        "synthetic-footway",
    },
  );
});

test("terrain semantic references are exact and frozen", () => {
  assert.deepEqual(
    [...TERRAIN_SEMANTIC_REFERENCES],
    [
      "https://wiki.openstreetmap.org/wiki/Tag:highway%3Dsteps",
      "https://wiki.openstreetmap.org/wiki/Key:incline",
    ],
  );
  assert.equal(
    Object.isFrozen(
      TERRAIN_SEMANTIC_REFERENCES,
    ),
    true,
  );
});

test("Planner 18 terrain evidence is deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      CORRIDOR_TERRAIN_EVIDENCE,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      CORRIDOR_TERRAIN_EVIDENCE[0],
    ),
    true,
  );
});

test("integrity rejects terrain wording drift from Planner 10", () => {
  const badEvidence:
    CorridorTerrainEvidence[] =
    CORRIDOR_TERRAIN_EVIDENCE.map(
      (record) =>
        record.corridorId ===
        "sdz-corridor-front-street"
          ? {
              ...record,
              publishedTerrain:
                "steep",
            }
          : { ...record },
    );

  assert.throws(
    () =>
      assertCorridorTerrainAuthorityIntegrity(
        badEvidence,
      ),
    /drifted from Planner 10 map authority/,
  );
});

test("integrity rejects invented stairs evidence on a corridor that does not publish stairs", () => {
  const badEvidence:
    CorridorTerrainEvidence[] =
    CORRIDOR_TERRAIN_EVIDENCE.map(
      (record) =>
        record.corridorId ===
        "sdz-corridor-front-street"
          ? {
              ...record,
              stairsEvidence:
                "explicitly-published",
            }
          : { ...record },
    );

  assert.throws(
    () =>
      assertCorridorTerrainAuthorityIntegrity(
        badEvidence,
      ),
    /drifted from Planner 10 map authority/,
  );
});

test("integrity rejects weakening Fern Canyon explicit stairs evidence", () => {
  const badEvidence:
    CorridorTerrainEvidence[] =
    CORRIDOR_TERRAIN_EVIDENCE.map(
      (record) =>
        record.corridorId ===
        "sdz-corridor-fern-canyon-trail"
          ? {
              ...record,
              stairsEvidence:
                "not-explicitly-published",
            }
          : { ...record },
    );

  assert.throws(
    () =>
      assertCorridorTerrainAuthorityIntegrity(
        badEvidence,
      ),
    /drifted from Planner 10 map authority/,
  );
});
