import assert from "node:assert/strict";
import test from "node:test";
import {
  INDEPENDENT_GEOSPATIAL_OBSERVATIONS,
  INDEPENDENT_GEOSPATIAL_TARGETS,
  assessFeatureGeospatialAuthority,
  assessGuestNavigationPointAuthority,
  assertIndependentGeospatialAuthorityIntegrity,
  classifyFeatureObservationAgreement,
  geospatialObservationsForTarget,
  type GeospatialTarget,
  type IndependentGeospatialObservation,
} from "../src/data/zooGeospatialAuthority.ts";

test("first geospatial targets stay feature-geometry-only", () => {
  assert.deepEqual(
    INDEPENDENT_GEOSPATIAL_TARGETS.map((target) => [
      target.id,
      target.canonicalName,
      target.targetKind,
      target.sourceRecordId,
      target.mapAnchorId,
      target.plannerMaterialization,
    ]),
    [
      [
        "sdz-geo-wegeforth-bowl",
        "Wegeforth Bowl",
        "source-record",
        "sdz-wildlife-wonders",
        "sdz-map-anchor-wegeforth-bowl",
        "feature-geometry-only",
      ],
      [
        "sdz-geo-main-entrance",
        "San Diego Zoo Main Entrance",
        "map-anchor",
        undefined,
        "sdz-map-anchor-entrance",
        "feature-geometry-only",
      ],
    ],
  );
});

test("Wegeforth Bowl feature location is independently corroborated without averaging", () => {
  const assessment =
    assessFeatureGeospatialAuthority(
      "sdz-geo-wegeforth-bowl",
    );

  assert.deepEqual(assessment, {
    status: "corroborated-feature-location",
    targetId: "sdz-geo-wegeforth-bowl",
    observationIds: [
      "sdz-geoobs-wegeforth-geonames-5407722",
      "sdz-geoobs-wegeforth-osm-way-79135720",
    ],
    maximumSourceSeparationMeters: 3.903,
  });

  const observations =
    geospatialObservationsForTarget(
      "sdz-geo-wegeforth-bowl",
    );

  assert.deepEqual(
    observations.map((observation) => [
      observation.provider,
      observation.sourceObjectType,
      observation.sourceObjectId,
      observation.lat,
      observation.lng,
    ]),
    [
      [
        "GeoNames",
        "feature",
        "5407722",
        32.73366,
        -117.14976,
      ],
      [
        "OpenStreetMap",
        "way",
        "79135720",
        32.73367,
        -117.14972,
      ],
    ],
  );

  assert.equal(
    observations.some(
      (observation) =>
        observation.lat ===
          (32.73366 + 32.73367) / 2 ||
        observation.lng ===
          (-117.14976 + -117.14972) / 2,
    ),
    false,
  );
});

test("main entrance building is single-source feature geometry, not a guest gate", () => {
  assert.deepEqual(
    assessFeatureGeospatialAuthority(
      "sdz-geo-main-entrance",
    ),
    {
      status: "single-source-feature-location",
      targetId: "sdz-geo-main-entrance",
      observationIds: [
        "sdz-geoobs-main-entrance-osm-way-79293454",
      ],
    },
  );

  assert.deepEqual(
    geospatialObservationsForTarget(
      "sdz-geo-main-entrance",
    ).map((observation) => [
      observation.provider,
      observation.sourceObjectType,
      observation.sourceObjectId,
      observation.lat,
      observation.lng,
      observation.featureClass,
    ]),
    [
      [
        "OpenStreetMap",
        "way",
        "79293454",
        32.73513,
        -117.1493,
        "entrance-building",
      ],
    ],
  );
});

test("guest navigation materialization remains blocked even for corroborated feature geometry", () => {
  assert.deepEqual(
    assessGuestNavigationPointAuthority(
      "sdz-geo-wegeforth-bowl",
    ),
    {
      status: "blocked",
      reason: "GUEST_ENTRANCE_POINT_NOT_SOURCED",
      targetId: "sdz-geo-wegeforth-bowl",
      observationIds: [
        "sdz-geoobs-wegeforth-geonames-5407722",
        "sdz-geoobs-wegeforth-osm-way-79135720",
      ],
    },
  );

  assert.deepEqual(
    assessGuestNavigationPointAuthority(
      "sdz-geo-main-entrance",
    ),
    {
      status: "blocked",
      reason: "GUEST_ENTRANCE_POINT_NOT_SOURCED",
      targetId: "sdz-geo-main-entrance",
      observationIds: [
        "sdz-geoobs-main-entrance-osm-way-79293454",
      ],
    },
  );

  assert.deepEqual(
    assessGuestNavigationPointAuthority(
      "unknown-target",
    ),
    {
      status: "blocked",
      reason: "TARGET_UNKNOWN",
      targetId: "unknown-target",
      observationIds: [],
    },
  );
});

test("geospatial observations cannot masquerade as planner navigation or routing records", () => {
  for (const observation of
    INDEPENDENT_GEOSPATIAL_OBSERVATIONS) {
    assert.equal(
      observation.coordinateSemantics,
      "mapped-feature-representative-point",
    );

    assert.equal("routeNodeId" in observation, false);
    assert.equal("navigationPoint" in observation, false);
    assert.equal("distanceMeters" in observation, false);
    assert.equal("durationMinutes" in observation, false);
    assert.equal("accessible" in observation, false);
    assert.equal("stroller" in observation, false);
  }

  for (const target of INDEPENDENT_GEOSPATIAL_TARGETS) {
    assert.equal("lat" in target, false);
    assert.equal("lng" in target, false);
    assert.equal("routeNodeId" in target, false);
  }
});

test("independent geospatial authority is deeply immutable", () => {
  assert.equal(
    Object.isFrozen(INDEPENDENT_GEOSPATIAL_TARGETS),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INDEPENDENT_GEOSPATIAL_OBSERVATIONS,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INDEPENDENT_GEOSPATIAL_OBSERVATIONS[0],
    ),
    true,
  );

  assert.throws(
    () => {
      (
        INDEPENDENT_GEOSPATIAL_OBSERVATIONS[0] as unknown as {
          lat: number;
        }
      ).lat = 0;
    },
    TypeError,
  );
});

test("geospatial authority integrity rejects unknown map anchors and mismatched source-record identity", () => {
  const base = INDEPENDENT_GEOSPATIAL_TARGETS[0];

  const unknownAnchor: GeospatialTarget = {
    ...base,
    id: "unknown-anchor-target",
    mapAnchorId: "missing-map-anchor",
  };

  assert.throws(
    () =>
      assertIndependentGeospatialAuthorityIntegrity(
        [unknownAnchor],
        [],
      ),
    /unknown map anchor/,
  );

  const mismatchedRecord: GeospatialTarget = {
    ...base,
    id: "mismatched-record-target",
    sourceRecordId: "sdz-panda-ridge",
  };

  assert.throws(
    () =>
      assertIndependentGeospatialAuthorityIntegrity(
        [mismatchedRecord],
        [],
      ),
    /does not match map-anchor authority/,
  );
});

test("geospatial authority integrity rejects duplicate provider objects and malformed coordinates", () => {
  const target = INDEPENDENT_GEOSPATIAL_TARGETS[0];
  const observation =
    INDEPENDENT_GEOSPATIAL_OBSERVATIONS[0];

  const duplicate: IndependentGeospatialObservation = {
    ...observation,
    id: "duplicate-provider-object",
  };

  assert.throws(
    () =>
      assertIndependentGeospatialAuthorityIntegrity(
        [target],
        [observation, duplicate],
      ),
    /Duplicate geospatial provider object/,
  );

  const badCoordinate: IndependentGeospatialObservation = {
    ...observation,
    id: "bad-coordinate",
    lat: 100,
  };

  assert.throws(
    () =>
      assertIndependentGeospatialAuthorityIntegrity(
        [target],
        [badCoordinate],
      ),
    /is malformed/,
  );
});

test("divergent independent observations are reported as conflicting rather than corroborated", () => {
  const target = INDEPENDENT_GEOSPATIAL_TARGETS[0];

  const observations: IndependentGeospatialObservation[] = [
    {
      ...INDEPENDENT_GEOSPATIAL_OBSERVATIONS[0],
      id: "conflict-a",
      targetId: target.id,
    },
    {
      ...INDEPENDENT_GEOSPATIAL_OBSERVATIONS[2],
      id: "conflict-b",
      targetId: target.id,
      sourceObjectId: "conflict-source",
    },
  ];

  assert.doesNotThrow(() =>
    assertIndependentGeospatialAuthorityIntegrity(
      [target],
      observations,
    ),
  );

  const assessment =
    classifyFeatureObservationAgreement(
      target.id,
      observations,
    );

  assert.equal(
    assessment.status,
    "conflicting-feature-location",
  );
  if (
    assessment.status !==
    "conflicting-feature-location"
  ) {
    throw new Error("expected conflict");
  }
  assert.ok(
    assessment.maximumSourceSeparationMeters > 25,
  );
});

test("unknown feature target is explicit", () => {
  assert.deepEqual(
    assessFeatureGeospatialAuthority(
      "unknown-target",
    ),
    {
      status: "unknown-target",
      targetId: "unknown-target",
    },
  );
});


test("geospatial targets cannot exist without observations", () => {
  const target = INDEPENDENT_GEOSPATIAL_TARGETS[0];

  assert.throws(
    () =>
      assertIndependentGeospatialAuthorityIntegrity(
        [target],
        [],
      ),
    /has no observations/,
  );
});

test("official context URLs are restricted to official government or Zoo authority", () => {
  const target: GeospatialTarget = {
    ...INDEPENDENT_GEOSPATIAL_TARGETS[1],
    id: "bad-context",
    officialContextUrl:
      "https://example.com/not-official",
  };
  const observation: IndependentGeospatialObservation = {
    ...INDEPENDENT_GEOSPATIAL_OBSERVATIONS[2],
    id: "bad-context-observation",
    targetId: target.id,
    sourceObjectId: "999999999",
  };

  assert.throws(
    () =>
      assertIndependentGeospatialAuthorityIntegrity(
        [target],
        [observation],
      ),
    /invalid official context URL/,
  );
});
