import assert from "node:assert/strict";
import test from "node:test";
import {
  ENTRANCE_ACCESS_CONTROL_OBSERVATIONS,
  ENTRANCE_PEDESTRIAN_TOPOLOGY,
  EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS,
  GUEST_NAVIGATION_SEMANTIC_CONTEXT_URLS,
  assessGuestNavigationAuthority,
  assertGuestNavigationAuthorityIntegrity,
  entranceAccessControlForTarget,
  entrancePedestrianTopologyForTarget,
  explicitGuestEntranceForTarget,
  type EntranceAccessControlObservation,
  type EntrancePedestrianTopology,
  type ExplicitGuestEntranceObservation,
} from "../src/data/zooGuestNavigationAuthority.ts";

test("main Zoo entrance now has an explicit verified guest navigation point", () => {
  assert.deepEqual(
    assessGuestNavigationAuthority(
      "sdz-geo-main-entrance",
    ),
    {
      status: "navigation-point-ready",
      targetId: "sdz-geo-main-entrance",
      observationId:
        "sdz-guest-entrance-main-osm-node-7053320514",
      navigationPoint: {
        lat: 32.735256,
        lng: -117.149182,
        confidence: "verified",
      },
      mapAnchorId: "sdz-map-anchor-entrance",
      topologyId:
        "sdz-guest-entrance-main-ingress-topology",
      routeGraph: {
        status: "blocked",
        reason: "ROUTE_EDGE_WEIGHTS_NOT_SOURCED",
      },
    },
  );
});

test("explicit entrance authority preserves the exact OSM entrance=main node", () => {
  assert.deepEqual(
    explicitGuestEntranceForTarget(
      "sdz-geo-main-entrance",
    ),
    {
      id: "sdz-guest-entrance-main-osm-node-7053320514",
      targetId: "sdz-geo-main-entrance",
      provider: "OpenStreetMap",
      sourceUrl:
        "https://www.openstreetmap.org/node/7053320514",
      sourceObjectType: "node",
      sourceObjectId: "7053320514",
      lat: 32.735256,
      lng: -117.149182,
      observedAt: "2026-09-07T22:55:00-07:00",
      entranceTag: "main",
      buildingWayId: "79293454",
      connectedPedestrianWayIds: [
        "1126804580",
        "755054695",
      ],
      coordinateSemantics:
        "explicit-guest-entrance-node",
    },
  );
});

test("guest access-control and ingress topology are source facts, not route-edge weights", () => {
  assert.deepEqual(
    entranceAccessControlForTarget(
      "sdz-geo-main-entrance",
    ),
    {
      id: "sdz-guest-entrance-turnstile-osm-node-7053320517",
      targetId: "sdz-geo-main-entrance",
      provider: "OpenStreetMap",
      sourceUrl:
        "https://www.openstreetmap.org/node/7053320517",
      sourceObjectType: "node",
      sourceObjectId: "7053320517",
      lat: 32.7352359,
      lng: -117.1492666,
      observedAt: "2026-09-07T22:55:00-07:00",
      barrier: "turnstile",
      access: "customers",
      pedestrianWayId: "755054695",
      coordinateSemantics: "guest-access-control-node",
    },
  );

  assert.deepEqual(
    entrancePedestrianTopologyForTarget(
      "sdz-geo-main-entrance",
    ),
    {
      id: "sdz-guest-entrance-main-ingress-topology",
      targetId: "sdz-geo-main-entrance",
      provider: "OpenStreetMap",
      entryPlazaWayId: "1126804580",
      controlledPassageWayId: "755054695",
      interiorContinuationWayId: "755054694",
      connectsToDescriptor: "Front Street",
      sourceUrls: [
        "https://www.openstreetmap.org/way/1126804580",
        "https://www.openstreetmap.org/way/755054695",
        "https://www.openstreetmap.org/way/755054694",
      ],
      plannerMaterialization: "topology-only",
    },
  );

  for (const record of [
    ...EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS,
    ...ENTRANCE_ACCESS_CONTROL_OBSERVATIONS,
    ...ENTRANCE_PEDESTRIAN_TOPOLOGY,
  ]) {
    assert.equal("distanceMeters" in record, false);
    assert.equal("durationMinutes" in record, false);
    assert.equal("accessible" in record, false);
    assert.equal("stroller" in record, false);
    assert.equal("stairs" in record, false);
    assert.equal("routeNodeId" in record, false);
  }
});

test("Wegeforth Bowl remains blocked because no explicit guest entrance node is sourced", () => {
  assert.deepEqual(
    assessGuestNavigationAuthority(
      "sdz-geo-wegeforth-bowl",
    ),
    {
      status: "blocked",
      reason: "EXPLICIT_ENTRANCE_NODE_NOT_SOURCED",
      targetId: "sdz-geo-wegeforth-bowl",
      observationIds: [],
    },
  );

  assert.deepEqual(
    assessGuestNavigationAuthority("unknown-target"),
    {
      status: "blocked",
      reason: "TARGET_UNKNOWN",
      targetId: "unknown-target",
      observationIds: [],
    },
  );
});

test("official semantic context is kept separate from coordinate authority", () => {
  assert.deepEqual(
    [...GUEST_NAVIGATION_SEMANTIC_CONTEXT_URLS],
    [
      "https://zoo.sandiegozoo.org/plan-your-visit",
      "https://www.sandiego.gov/blog/zoo-balboa-park-traffic-information",
    ],
  );

  for (const url of GUEST_NAVIGATION_SEMANTIC_CONTEXT_URLS) {
    assert.equal(
      url.startsWith("https://www.openstreetmap.org/"),
      false,
    );
  }

  assert.equal(
    EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS[0].sourceUrl,
    "https://www.openstreetmap.org/node/7053320514",
  );
});

test("guest navigation authority is deeply immutable", () => {
  assert.equal(
    Object.isFrozen(EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS),
    true,
  );
  assert.equal(
    Object.isFrozen(EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS[0]),
    true,
  );
  assert.equal(
    Object.isFrozen(
      EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS[0]
        .connectedPedestrianWayIds,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(ENTRANCE_PEDESTRIAN_TOPOLOGY[0]),
    true,
  );

  const assessment = assessGuestNavigationAuthority(
    "sdz-geo-main-entrance",
  );
  assert.equal(assessment.status, "navigation-point-ready");
  if (assessment.status !== "navigation-point-ready") {
    throw new Error("expected navigation-point-ready");
  }
  assert.equal(
    Object.isFrozen(assessment.navigationPoint),
    true,
  );
});

test("integrity rejects feature geometry masquerading as an explicit entrance node", () => {
  const badEntrance = {
    ...EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS[0],
    sourceObjectType: "way",
  } as unknown as ExplicitGuestEntranceObservation;

  assert.throws(
    () =>
      assertGuestNavigationAuthorityIntegrity(
        [badEntrance],
        ENTRANCE_ACCESS_CONTROL_OBSERVATIONS,
        ENTRANCE_PEDESTRIAN_TOPOLOGY,
      ),
    /unsupported entrance authority semantics/,
  );
});

test("integrity requires the entrance node to match the previously sourced entrance building", () => {
  const badEntrance: ExplicitGuestEntranceObservation = {
    ...EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS[0],
    buildingWayId: "999999999",
  };

  assert.throws(
    () =>
      assertGuestNavigationAuthorityIntegrity(
        [badEntrance],
        ENTRANCE_ACCESS_CONTROL_OBSERVATIONS,
        ENTRANCE_PEDESTRIAN_TOPOLOGY,
      ),
    /does not match the target's sourced feature way/,
  );
});

test("integrity requires the turnstile to lie on a pedestrian way connected to the entrance", () => {
  const badControl: EntranceAccessControlObservation = {
    ...ENTRANCE_ACCESS_CONTROL_OBSERVATIONS[0],
    pedestrianWayId: "999999999",
  };

  assert.throws(
    () =>
      assertGuestNavigationAuthorityIntegrity(
        EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS,
        [badControl],
        ENTRANCE_PEDESTRIAN_TOPOLOGY,
      ),
    /not on a pedestrian way connected/,
  );
});

test("integrity rejects topology that does not preserve the sourced ingress chain", () => {
  const badTopology: EntrancePedestrianTopology = {
    ...ENTRANCE_PEDESTRIAN_TOPOLOGY[0],
    controlledPassageWayId: "999999999",
  };

  assert.throws(
    () =>
      assertGuestNavigationAuthorityIntegrity(
        EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS,
        ENTRANCE_ACCESS_CONTROL_OBSERVATIONS,
        [badTopology],
      ),
    /does not preserve the sourced ingress chain/,
  );
});

test("integrity rejects malformed OSM object URLs", () => {
  const badEntrance: ExplicitGuestEntranceObservation = {
    ...EXPLICIT_GUEST_ENTRANCE_OBSERVATIONS[0],
    sourceUrl:
      "https://www.openstreetmap.org/node/999999999",
  };

  assert.throws(
    () =>
      assertGuestNavigationAuthorityIntegrity(
        [badEntrance],
        ENTRANCE_ACCESS_CONTROL_OBSERVATIONS,
        ENTRANCE_PEDESTRIAN_TOPOLOGY,
      ),
    /is malformed/,
  );
});
