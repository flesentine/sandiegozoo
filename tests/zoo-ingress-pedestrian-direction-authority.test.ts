import assert from "node:assert/strict";
import test from "node:test";
import {
  PEDESTRIAN_DIRECTION_SEMANTIC_REFERENCES,
  PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOTS,
  assessPedestrianDirectionAuthority,
  assertPedestrianDirectionAuthorityIntegrity,
  classifyPedestrianDirectionSnapshot,
  type PedestrianDirectionSourceSnapshot,
} from "../src/data/zooIngressPedestrianDirectionAuthority.ts";

test("current ingress direction snapshots preserve only sourced OSM direction tags", () => {
  assert.deepEqual(
    PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOTS,
    [
      {
        id: "sdz-pedestrian-direction-way-755054695",
        targetId: "sdz-geo-main-entrance",
        sourceWayId: "755054695",
        sourceUrl:
          "https://www.openstreetmap.org/way/755054695",
        highwayTag: "pedestrian",
        genericOnewayTag: "yes",
        onewayFootTag: "absent",
        accessControlObservationId:
          "sdz-guest-entrance-turnstile-osm-node-7053320517",
        plannerMaterialization:
          "pedestrian-direction-authority-only",
      },
      {
        id: "sdz-pedestrian-direction-way-755054694",
        targetId: "sdz-geo-main-entrance",
        sourceWayId: "755054694",
        sourceUrl:
          "https://www.openstreetmap.org/way/755054694",
        highwayTag: "pedestrian",
        genericOnewayTag: "absent",
        onewayFootTag: "absent",
        plannerMaterialization:
          "pedestrian-direction-authority-only",
      },
    ],
  );
});

test("generic oneway remains blocked for pedestrian direction", () => {
  assert.deepEqual(
    assessPedestrianDirectionAuthority("755054695"),
    {
      status: "blocked",
      reason:
        "GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT",
      sourceWayId: "755054695",
      sourceSnapshotId:
        "sdz-pedestrian-direction-way-755054695",
    },
  );
});

test("absence of pedestrian direction tags remains blocked", () => {
  assert.deepEqual(
    assessPedestrianDirectionAuthority("755054694"),
    {
      status: "blocked",
      reason:
        "PEDESTRIAN_DIRECTION_NOT_EXPLICITLY_SOURCED",
      sourceWayId: "755054694",
      sourceSnapshotId:
        "sdz-pedestrian-direction-way-755054694",
    },
  );
});

test("unknown ingress way fails closed", () => {
  assert.deepEqual(
    assessPedestrianDirectionAuthority("unknown-way"),
    {
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
      sourceWayId: "unknown-way",
    },
  );
});

function syntheticSnapshot(
  onewayFootTag:
    PedestrianDirectionSourceSnapshot["onewayFootTag"],
): PedestrianDirectionSourceSnapshot {
  return {
    id: `synthetic-${onewayFootTag}`,
    targetId: "sdz-geo-main-entrance",
    sourceWayId: "synthetic-way",
    sourceUrl:
      "https://www.openstreetmap.org/way/synthetic-way",
    highwayTag: "pedestrian",
    genericOnewayTag: "absent",
    onewayFootTag,
    plannerMaterialization:
      "pedestrian-direction-authority-only",
  };
}

test("explicit oneway:foot=yes maps to one-way with source order", () => {
  assert.deepEqual(
    classifyPedestrianDirectionSnapshot(
      syntheticSnapshot("yes"),
    ),
    {
      status: "supported",
      sourceWayId: "synthetic-way",
      sourceSnapshotId: "synthetic-yes",
      oneWay: true,
      direction: "with-source-way-order",
      basis: "OSM oneway:foot=yes",
    },
  );
});

test("explicit oneway:foot=-1 maps to one-way against source order", () => {
  assert.deepEqual(
    classifyPedestrianDirectionSnapshot(
      syntheticSnapshot("-1"),
    ),
    {
      status: "supported",
      sourceWayId: "synthetic-way",
      sourceSnapshotId: "synthetic--1",
      oneWay: true,
      direction: "against-source-way-order",
      basis: "OSM oneway:foot=-1",
    },
  );
});

test("explicit oneway:foot=no maps to bidirectional foot travel", () => {
  assert.deepEqual(
    classifyPedestrianDirectionSnapshot(
      syntheticSnapshot("no"),
    ),
    {
      status: "supported",
      sourceWayId: "synthetic-way",
      sourceSnapshotId: "synthetic-no",
      oneWay: false,
      direction: "bidirectional",
      basis: "OSM oneway:foot=no",
    },
  );
});

test("generic oneway cannot override absent oneway:foot", () => {
  const snapshot = {
    ...syntheticSnapshot("absent"),
    genericOnewayTag: "yes" as const,
  };

  assert.deepEqual(
    classifyPedestrianDirectionSnapshot(snapshot),
    {
      status: "blocked",
      reason:
        "GENERIC_ONEWAY_AMBIGUOUS_FOR_FOOT",
      sourceWayId: "synthetic-way",
      sourceSnapshotId: "synthetic-absent",
    },
  );
});

test("semantic references are frozen and limited to OSM direction definitions", () => {
  assert.equal(
    Object.isFrozen(
      PEDESTRIAN_DIRECTION_SEMANTIC_REFERENCES,
    ),
    true,
  );
  assert.deepEqual(
    [...PEDESTRIAN_DIRECTION_SEMANTIC_REFERENCES],
    [
      "https://wiki.openstreetmap.org/wiki/Key:oneway:foot",
      "https://wiki.openstreetmap.org/wiki/Key:oneway",
    ],
  );
});

test("direction authority exports are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOTS,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOTS[0],
    ),
    true,
  );
});

test("integrity rejects generic oneway drift on controlled passage", () => {
  const badSnapshots:
    PedestrianDirectionSourceSnapshot[] =
    PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOTS.map(
      (snapshot) =>
        snapshot.sourceWayId === "755054695"
          ? {
              ...snapshot,
              genericOnewayTag: "absent",
            }
          : { ...snapshot },
    );

  assert.throws(
    () =>
      assertPedestrianDirectionAuthorityIntegrity(
        badSnapshots,
      ),
    /Controlled entrance passage direction tags drifted/,
  );
});

test("integrity rejects invented oneway:foot authority", () => {
  const badSnapshots:
    PedestrianDirectionSourceSnapshot[] =
    PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOTS.map(
      (snapshot) =>
        snapshot.sourceWayId === "755054694"
          ? {
              ...snapshot,
              onewayFootTag: "yes",
            }
          : { ...snapshot },
    );

  assert.throws(
    () =>
      assertPedestrianDirectionAuthorityIntegrity(
        badSnapshots,
      ),
    /Interior Front Street connection direction tags drifted/,
  );
});

test("integrity rejects turnstile context attached to the wrong way", () => {
  const badSnapshots:
    PedestrianDirectionSourceSnapshot[] =
    PEDESTRIAN_DIRECTION_SOURCE_SNAPSHOTS.map(
      (snapshot) =>
        snapshot.sourceWayId === "755054694"
          ? {
              ...snapshot,
              accessControlObservationId:
                "sdz-guest-entrance-turnstile-osm-node-7053320517",
            }
          : { ...snapshot },
    );

  assert.throws(
    () =>
      assertPedestrianDirectionAuthorityIntegrity(
        badSnapshots,
      ),
    /claims unrelated access-control context/,
  );
});
