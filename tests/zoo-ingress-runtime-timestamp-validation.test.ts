import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveIngressRuntimeActivation,
  zooOperationalDateAt,
  type IngressRuntimeOperationalSnapshot,
} from "../src/data/zooIngressRuntimeActivation.ts";

const NOW = Date.now();
const TODAY = zooOperationalDateAt(NOW);

function isoOffset(minutes: number) {
  return new Date(
    NOW + minutes * 60_000,
  ).toISOString();
}

function validSnapshot(): IngressRuntimeOperationalSnapshot {
  return {
    visitDate: TODAY,
    zooHours: {
      evidenceId: "strict-ts-hours",
      status: "inside",
      validForDate: TODAY,
      observedAt: isoOffset(-60),
      expiresAt: isoOffset(120),
    },
    closureAdvisement: {
      evidenceId: "strict-ts-closure",
      status: "clear",
      validForDate: TODAY,
      observedAt: isoOffset(-15),
      expiresAt: isoOffset(45),
    },
    exactEdgeAvailability: [
      {
        evidenceId: "strict-ts-edge-755054695",
        sourceWayId: "755054695",
        status: "available",
        validForDate: TODAY,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
      },
      {
        evidenceId: "strict-ts-edge-755054694",
        sourceWayId: "755054694",
        status: "available",
        validForDate: TODAY,
        observedAt: isoOffset(-10),
        expiresAt: isoOffset(30),
      },
    ],
  };
}

const impossibleTimestamps = [
  "2026-02-30T00:00:00Z",
  "2025-02-29T00:00:00Z",
  "2026-04-31T00:00:00Z",
  "2026-13-01T00:00:00Z",
  "2026-00-10T00:00:00Z",
  "2026-01-00T00:00:00Z",
  "2026-01-01T24:00:00Z",
  "2026-01-01T23:60:00Z",
  "2026-01-01T23:59:60Z",
  "2026-01-01T00:00:00+14:01",
  "2026-01-01T00:00:00+15:00",
] as const;

test("Planner 24 rejects calendar timestamps that Date.parse would normalize", () => {
  for (const timestamp of impossibleTimestamps) {
    const base = validSnapshot();
    assert.throws(
      () =>
        resolveIngressRuntimeActivation({
          ...base,
          closureAdvisement: {
            ...base.closureAdvisement,
            observedAt: timestamp,
          },
        }),
      /observedAt\/expiresAt must be ISO timestamps with timezone/,
      timestamp,
    );
  }
});

test("Planner 24 accepts a real leap day timestamp structurally", () => {
  const base = validSnapshot();

  assert.doesNotThrow(() =>
    resolveIngressRuntimeActivation({
      ...base,
      closureAdvisement: {
        ...base.closureAdvisement,
        observedAt: "2024-02-29T12:34:56.789Z",
        expiresAt: "2024-02-29T12:35:56.789Z",
      },
    }),
  );
});

test("Planner 24 accepts valid timezone-offset syntax without relying on normalization", () => {
  const base = validSnapshot();

  assert.doesNotThrow(() =>
    resolveIngressRuntimeActivation({
      ...base,
      closureAdvisement: {
        ...base.closureAdvisement,
        observedAt: "2024-02-29T12:34:56.123456789-08:00",
        expiresAt: "2024-02-29T12:35:56.123456789-08:00",
      },
    }),
  );
});
