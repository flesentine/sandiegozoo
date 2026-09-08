import assert from "node:assert/strict";
import test from "node:test";
import {
  INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE,
  INGRESS_STROLLER_FACILITY_POLICY,
  accessibilityCorridorEvidenceForId,
  assessIngressMobilityAuthority,
  assertIngressMobilityAuthorityIntegrity,
  type AccessibilityCorridorEvidence,
  type StrollerFacilityPolicyEvidence,
} from "../src/data/zooIngressMobilityAuthority.ts";

test("Front Street preserves official corridor-level wheelchair evidence without exact-edge promotion", () => {
  assert.deepEqual(
    INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE,
    [
      {
        id: "sdz-accessibility-front-street-wheelchair-indicator",
        artifactId:
          "sdz-map-2026-01-05-accessibility",
        corridorId:
          "sdz-corridor-front-street",
        corridorName: "Front Street",
        sourceUrl:
          "https://zoo.sandiegozoo.org/sites/default/files/2026-01/Zoo_ADA_Map_01-05-26_web.pdf",
        observedAt:
          "2026-09-07T21:53:00-07:00",
        wheelchairIndicator: "shown",
        mapRouteLegend:
          "ADA MOST ACCESSIBLE ROUTE",
        scope: "named-corridor",
        plannerMaterialization:
          "corridor-accessibility-evidence-only",
      },
    ],
  );
});

test("current official stroller policy is facility permission only", () => {
  assert.deepEqual(
    INGRESS_STROLLER_FACILITY_POLICY,
    {
      id: "sdz-stroller-facility-policy-2026-09-08",
      sourceUrl:
        "https://zoo.sandiegozoo.org/visit/guests-with-disabilities",
      sourceLabel:
        "San Diego Zoo — Guests with Disabilities",
      observedAt:
        "2026-09-08T15:54:00-07:00",
      scope: "facility-policy",
      strollerPolicy: "allowed",
      routeSuitabilityAuthority:
        "not-established",
      plannerMaterialization:
        "facility-stroller-policy-only",
    },
  );
});

test("controlled entrance passage remains accessibility-blocked and stroller-blocked", () => {
  assert.deepEqual(
    assessIngressMobilityAuthority("755054695"),
    {
      sourceWayId: "755054695",
      accessibilityAuthority: {
        status: "blocked",
        reason:
          "EXACT_EDGE_ACCESSIBILITY_NOT_SOURCED",
        basis:
          "Planner 17 accessibility authority",
      },
      strollerAuthority: {
        status: "blocked",
        reason:
          "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY",
        basis: "Planner 17 stroller authority",
        policyEvidenceId:
          "sdz-stroller-facility-policy-2026-09-08",
      },
    },
  );
});

test("Front Street connection retains corridor evidence but refuses exact-edge accessibility promotion", () => {
  assert.deepEqual(
    assessIngressMobilityAuthority("755054694"),
    {
      sourceWayId: "755054694",
      accessibilityAuthority: {
        status: "blocked",
        reason:
          "CORRIDOR_ACCESSIBILITY_NOT_EXACT_EDGE_AUTHORITY",
        basis:
          "Planner 17 accessibility authority",
        corridorEvidenceId:
          "sdz-accessibility-front-street-wheelchair-indicator",
      },
      strollerAuthority: {
        status: "blocked",
        reason:
          "FACILITY_STROLLER_PERMISSION_NOT_EDGE_SUITABILITY",
        basis: "Planner 17 stroller authority",
        policyEvidenceId:
          "sdz-stroller-facility-policy-2026-09-08",
      },
    },
  );
});

test("unknown ingress way fails closed", () => {
  assert.deepEqual(
    assessIngressMobilityAuthority("unknown-way"),
    {
      sourceWayId: "unknown-way",
      status: "blocked",
      reason: "SOURCE_WAY_UNKNOWN",
    },
  );
});

test("corridor evidence lookup is exact and non-fuzzy", () => {
  assert.equal(
    accessibilityCorridorEvidenceForId(
      "sdz-corridor-front-street",
    )?.id,
    "sdz-accessibility-front-street-wheelchair-indicator",
  );
  assert.equal(
    accessibilityCorridorEvidenceForId(
      "Front Street",
    ),
    undefined,
  );
});

test("Planner 17 authority exports are deeply immutable", () => {
  assert.equal(
    Object.isFrozen(
      INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE,
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE[0],
    ),
    true,
  );
  assert.equal(
    Object.isFrozen(
      INGRESS_STROLLER_FACILITY_POLICY,
    ),
    true,
  );
});

test("integrity rejects corridor evidence detached from official map observation", () => {
  const badEvidence:
    AccessibilityCorridorEvidence[] =
    INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE.map(
      (evidence) => ({
        ...evidence,
        observedAt:
          "2026-09-08T15:54:00-07:00",
      }),
    );

  assert.throws(
    () =>
      assertIngressMobilityAuthorityIntegrity(
        badEvidence,
        INGRESS_STROLLER_FACILITY_POLICY,
      ),
    /drifted from qualified map authority/,
  );
});

test("integrity rejects invented exact-edge or stronger accessibility semantics", () => {
  const badEvidence = [
    {
      ...INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE[0],
      scope: "exact-edge",
    },
  ] as unknown as AccessibilityCorridorEvidence[];

  assert.throws(
    () =>
      assertIngressMobilityAuthorityIntegrity(
        badEvidence,
        INGRESS_STROLLER_FACILITY_POLICY,
      ),
    /drifted from qualified map authority/,
  );
});

test("integrity rejects stroller policy promoted into route suitability", () => {
  const badPolicy = {
    ...INGRESS_STROLLER_FACILITY_POLICY,
    routeSuitabilityAuthority:
      "established",
  } as unknown as StrollerFacilityPolicyEvidence;

  assert.throws(
    () =>
      assertIngressMobilityAuthorityIntegrity(
        INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE,
        badPolicy,
      ),
    /stroller facility-policy evidence is malformed/,
  );
});

test("integrity rejects non-official stroller source", () => {
  const badPolicy: StrollerFacilityPolicyEvidence = {
    ...INGRESS_STROLLER_FACILITY_POLICY,
    sourceUrl:
      "https://example.com/strollers",
  };

  assert.throws(
    () =>
      assertIngressMobilityAuthorityIntegrity(
        INGRESS_ACCESSIBILITY_CORRIDOR_EVIDENCE,
        badPolicy,
      ),
    /stroller facility-policy evidence is malformed/,
  );
});
