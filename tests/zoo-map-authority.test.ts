import assert from "node:assert/strict";
import test from "node:test";
import {
  OFFICIAL_MAP_ANCHORS,
  OFFICIAL_ZOO_MAP_ARTIFACTS,
  PUBLISHED_WALKING_CORRIDORS,
  assessPlannerNavigationMaterialization,
  assertOfficialMapAuthorityIntegrity,
  officialMapAnchorsForSourceRecord,
  publishedWalkingCorridorsForSourceRecord,
  type OfficialMapAnchor,
  type OfficialZooMapArtifact,
  type PublishedWalkingCorridor,
} from "../src/data/zooMapAuthority.ts";

test("official map artifacts are current frozen Zoo-hosted V01.05.26 authority", () => {
  assert.equal(
    Object.isFrozen(OFFICIAL_ZOO_MAP_ARTIFACTS),
    true,
  );

  assert.deepEqual(
    OFFICIAL_ZOO_MAP_ARTIFACTS.map((artifact) => [
      artifact.id,
      artifact.kind,
      artifact.revisionDate,
      artifact.authority,
    ]),
    [
      [
        "sdz-map-2026-01-05-classic",
        "classic-map",
        "2026-01-05",
        "official",
      ],
      [
        "sdz-map-2026-01-05-accessibility",
        "accessibility-map",
        "2026-01-05",
        "official",
      ],
    ],
  );

  for (const artifact of OFFICIAL_ZOO_MAP_ARTIFACTS) {
    const url = new URL(artifact.sourceUrl);
    assert.equal(url.protocol, "https:");
    assert.equal(
      url.hostname,
      "zoo.sandiegozoo.org",
    );
    assert.equal(
      artifact.observedAt,
      "2026-09-07T21:53:00-07:00",
    );
  }
});

test("official map anchors cover the first source-backed navigation slice", () => {
  assert.deepEqual(
    OFFICIAL_MAP_ANCHORS.map((anchor) => [
      anchor.id,
      anchor.mapLabel,
      anchor.sourceRecordId,
      anchor.role,
    ]),
    [
      [
        "sdz-map-anchor-entrance",
        "ENTRANCE",
        undefined,
        "entrance",
      ],
      [
        "sdz-map-anchor-panda-ridge",
        "PANDA RIDGE",
        "sdz-panda-ridge",
        "destination",
      ],
      [
        "sdz-map-anchor-tiger-trail",
        "TIGER TRAIL",
        "sdz-tiger-trail",
        "destination",
      ],
      [
        "sdz-map-anchor-wegeforth-bowl",
        "WEGEFORTH BOWL",
        "sdz-wildlife-wonders",
        "presentation-venue",
      ],
      [
        "sdz-map-anchor-rady-ambassador",
        "RADY AMBASSADOR PRESENTATION AREA",
        "sdz-rady-ambassador-presentation",
        "presentation-venue",
      ],
      [
        "sdz-map-anchor-skyfari-east",
        "ALASKA AIRLINES SKYFARI EAST",
        "sdz-skyfari",
        "transport-station",
      ],
      [
        "sdz-map-anchor-skyfari-west",
        "ALASKA AIRLINES SKYFARI WEST",
        "sdz-skyfari",
        "transport-station",
      ],
      [
        "sdz-map-anchor-lost-forest",
        "LOST FOREST",
        undefined,
        "area",
      ],
      [
        "sdz-map-anchor-outback",
        "OUTBACK",
        undefined,
        "area",
      ],
    ],
  );
});

test("Skyfari correctly has two official station map anchors", () => {
  assert.deepEqual(
    officialMapAnchorsForSourceRecord("sdz-skyfari").map(
      (anchor) => anchor.id,
    ),
    [
      "sdz-map-anchor-skyfari-east",
      "sdz-map-anchor-skyfari-west",
    ],
  );
});

test("published walking corridors preserve map-level minutes and terrain without becoming edges", () => {
  const expected = new Map([
    [
      "sdz-corridor-front-street",
      [20, "mild"],
    ],
    [
      "sdz-corridor-park-way",
      [30, "mild-to-steep"],
    ],
    [
      "sdz-corridor-center-street",
      [15, "steep"],
    ],
    [
      "sdz-corridor-treetops-way",
      [7, "mild"],
    ],
    [
      "sdz-corridor-fern-canyon-trail",
      [7, "steep-and-stairs"],
    ],
    [
      "sdz-corridor-monkey-trail",
      [15, "mild"],
    ],
    [
      "sdz-corridor-tiger-trail",
      [20, "mild-to-steep"],
    ],
  ]);

  assert.equal(
    PUBLISHED_WALKING_CORRIDORS.length,
    expected.size,
  );

  for (const corridor of PUBLISHED_WALKING_CORRIDORS) {
    assert.deepEqual(
      [
        corridor.publishedWalkMinutes,
        corridor.terrain,
      ],
      expected.get(corridor.id),
    );
    assert.equal(
      corridor.plannerMaterialization,
      "corridor-authority-only",
    );

    assert.equal("fromNodeId" in corridor, false);
    assert.equal("toNodeId" in corridor, false);
    assert.equal("distanceMeters" in corridor, false);
    assert.equal("durationMinutes" in corridor, false);
    assert.equal("accessible" in corridor, false);
    assert.equal("stroller" in corridor, false);
  }
});

test("direct corridor authority can be queried without pretending it is an exact route edge", () => {
  assert.deepEqual(
    publishedWalkingCorridorsForSourceRecord(
      "sdz-tiger-trail",
    ).map((corridor) => [
      corridor.id,
      corridor.publishedWalkMinutes,
      corridor.fromDescriptor,
      corridor.toDescriptor,
    ]),
    [
      [
        "sdz-corridor-treetops-way",
        7,
        undefined,
        undefined,
      ],
      [
        "sdz-corridor-tiger-trail",
        20,
        "Entrance",
        "Tigers",
      ],
    ],
  );

  assert.deepEqual(
    publishedWalkingCorridorsForSourceRecord(
      "sdz-gorilla-tropics",
    ).map((corridor) => [
      corridor.id,
      corridor.publishedWalkMinutes,
      corridor.fromDescriptor,
      corridor.toDescriptor,
    ]),
    [
      [
        "sdz-corridor-monkey-trail",
        15,
        "Entrance",
        "Gorillas",
      ],
    ],
  );
});

test("map anchors never masquerade as geospatial NavigationPoint or RouteNode data", () => {
  for (const anchor of OFFICIAL_MAP_ANCHORS) {
    assert.equal(
      anchor.plannerMaterialization,
      "map-anchor-only",
    );
    assert.equal("lat" in anchor, false);
    assert.equal("lng" in anchor, false);
    assert.equal("routeNodeId" in anchor, false);
    assert.equal("navigationPoint" in anchor, false);
  }
});

test("planner navigation materialization stays blocked until coordinates are independently sourced", () => {
  assert.deepEqual(
    assessPlannerNavigationMaterialization(
      "sdz-panda-ridge",
    ),
    {
      status: "blocked",
      reason: "COORDINATES_NOT_SOURCED",
      sourceRecordId: "sdz-panda-ridge",
      mapAnchorIds: [
        "sdz-map-anchor-panda-ridge",
      ],
    },
  );

  assert.deepEqual(
    assessPlannerNavigationMaterialization(
      "sdz-skyfari",
    ),
    {
      status: "blocked",
      reason: "COORDINATES_NOT_SOURCED",
      sourceRecordId: "sdz-skyfari",
      mapAnchorIds: [
        "sdz-map-anchor-skyfari-east",
        "sdz-map-anchor-skyfari-west",
      ],
    },
  );

  assert.deepEqual(
    assessPlannerNavigationMaterialization(
      "sdz-gorilla-tropics",
    ),
    {
      status: "blocked",
      reason: "SOURCE_RECORD_HAS_NO_MAP_ANCHOR",
      sourceRecordId: "sdz-gorilla-tropics",
      mapAnchorIds: [],
    },
  );
});

test("official map authority is deeply immutable", () => {
  assert.equal(Object.isFrozen(OFFICIAL_MAP_ANCHORS), true);
  assert.equal(
    Object.isFrozen(PUBLISHED_WALKING_CORRIDORS),
    true,
  );
  assert.equal(Object.isFrozen(OFFICIAL_MAP_ANCHORS[0]), true);
  assert.equal(
    Object.isFrozen(
      PUBLISHED_WALKING_CORRIDORS[0].accessLabels,
    ),
    true,
  );

  assert.throws(
    () => {
      (
        OFFICIAL_MAP_ANCHORS[0] as unknown as {
          mapLabel: string;
        }
      ).mapLabel = "MUTATED";
    },
    TypeError,
  );
});

test("map authority integrity rejects unknown artifacts and unknown source records", () => {
  const artifact: OfficialZooMapArtifact = {
    ...OFFICIAL_ZOO_MAP_ARTIFACTS[0],
    id: "test-map",
  };

  const badArtifactAnchor: OfficialMapAnchor = {
    ...OFFICIAL_MAP_ANCHORS[0],
    id: "bad-artifact-anchor",
    artifactId: "missing-map",
  };

  assert.throws(
    () =>
      assertOfficialMapAuthorityIntegrity(
        [artifact],
        [badArtifactAnchor],
        [],
      ),
    /unknown artifact/,
  );

  const badSourceAnchor: OfficialMapAnchor = {
    ...OFFICIAL_MAP_ANCHORS[0],
    id: "bad-source-anchor",
    artifactId: "test-map",
    sourceRecordId: "missing-source-record",
  };

  assert.throws(
    () =>
      assertOfficialMapAuthorityIntegrity(
        [artifact],
        [badSourceAnchor],
        [],
      ),
    /unknown source record/,
  );
});

test("walking corridor integrity rejects synthetic exactness and malformed minutes at the authority boundary", () => {
  const artifact: OfficialZooMapArtifact = {
    ...OFFICIAL_ZOO_MAP_ARTIFACTS[0],
    id: "test-map",
  };

  const invalid: PublishedWalkingCorridor = {
    ...PUBLISHED_WALKING_CORRIDORS[0],
    id: "invalid-minutes",
    artifactId: "test-map",
    publishedWalkMinutes: 0,
  };

  assert.throws(
    () =>
      assertOfficialMapAuthorityIntegrity(
        [artifact],
        [],
        [invalid],
      ),
    /positive integer publishedWalkMinutes/,
  );
});
