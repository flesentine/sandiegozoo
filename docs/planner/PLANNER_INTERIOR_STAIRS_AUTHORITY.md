# Planner 35 — Interior Stairs Evidence Audit

## Outcome

Planner 35 does **not** clear stairs for the Tiger Trail objective-selected Front Street segment:

`7053320515 ↔ 1619736626`

The exact result remains:

- `stairs: unknown`
- blocker: `EXACT_SEGMENT_STAIRS_NOT_SOURCED`

This is intentional. Three increasingly strict candidate policies were reviewed, and each exposed the same fundamental source gap: no current source positively proves that this exact traversal is stair-free or explicitly binds it to ADA §402.

## Evidence audited

### Exact OSM source snapshot

The version-pinned Front Street snapshot identifies the exact way as:

- way `1481425058`
- `highway=pedestrian`
- `surface=asphalt`
- `name=Front Street`

Planner 18 already established the correct boundary: absence of `highway=steps` is not positive `stairs:false` authority. Pedestrian/asphalt classification remains identity context only.

### Planner 33 accessibility

Planner 33 qualifies this exact segment as `accessible:true` using exact-name-matched official wheelchair / `ADA MOST ACCESSIBLE ROUTE` evidence.

But Planner 33 explicitly keeps:

- `stairsAuthorityState: independent-unresolved`

Planner 35 preserves that independence. Wheelchair accessibility does not automatically establish `stairs:false`.

### Official 2026 Zoo Accessibility Guide

The current official guide is useful context:

`https://sdzwa.org/sdzwa-accessibility-guide`

It states ADA and California access-law compliance context, describes the Zoo accessibility map as providing information on accessible routes, identifies the blue dotted line as the best path of travel, and directs mobility-device users to consult the accessibility map/app/signage.

That is meaningful accessibility guidance, but it does **not** explicitly state that this exact Front Street traversal is an ADA §402 Accessible Route.

### DOJ 2010 ADA Standards §402.2

The federal standard remains useful semantic context:

`https://www.ada.gov/assets/pdfs/2010-design-standards.pdf`

Section 402.2 defines the components of an already-established Accessible Route. It cannot supply the missing applicability premise by itself.

## Review history

Planner 35 deliberately stopped instead of forcing a conclusion.

### Candidate 1

Tried to combine OSM pedestrian/asphalt classification, Planner 33 accessibility, and the Zoo map's explicit stairs vocabulary.

Rejected because non-publication of stairs is still absence evidence; one corridor labeled with stairs does not prove exhaustive labeling.

### Candidate 2

Removed the non-publication inference and combined Planner 33 `accessible:true` with ADA §402.2.

Rejected because Planner 33's product accessibility result did not itself establish formal §402 applicability.

### Candidate 3

Added the official 2026 Zoo Accessibility Guide as a separate accessible-route applicability source.

Rejected because the guide still does not explicitly bind this mapped Front Street traversal to §402. A general ADA compliance statement plus accessible-route guidance is not the same as exact-route certification.

## Frozen conservative policy

Planner 35 now records the evidence standard required to revisit this field:

`stairs:false` requires either:

1. an explicit source binding this exact traversal to ADA §402 / equivalent no-stairs route semantics; or
2. direct exact-segment evidence that the traversal is stair-free.

Until one of those exists, `stairs` stays `unknown`.

The audit freezes these guardrails:

- missing `highway=steps` is insufficient;
- `highway=pedestrian` / asphalt are identity context only;
- wheelchair accessibility remains independent of stairs;
- general Zoo accessible-route guidance does not bind this exact segment to §402;
- §402 semantics require explicit exact-route applicability before use;
- no direct stair-free evidence is currently sourced.

## Exact-segment materialization state

After Planner 35, the exact Tiger Trail Front Street segment remains blocked by:

1. `EXACT_SEGMENT_STAIRS_NOT_SOURCED`
2. `EXACT_SEGMENT_STROLLER_NOT_SOURCED`
3. `EXACT_SEGMENT_PROVENANCE_NOT_COMPLETE`

No RouteEdge or RouteNode is materialized.

## Why this milestone still matters

Planner 35 closes a real evidence question instead of leaving it ambiguous. Future work cannot quietly turn accessibility, asphalt, or missing tags into `stairs:false`; the required positive evidence is now explicit and regression-tested.

This also lets the next independent semantic investigation continue without weakening the stairs boundary.

## Next boundary

Planner 36 can investigate stroller suitability independently.

The 2026 Zoo Accessibility Guide provides promising stroller-specific evidence: a child using a stroller as an accessibility device can request a wheelchair tag, and mobility-device users are directed to the accessibility map. Facility-level stroller permission alone remains insufficient, and Planner 36 must not depend on `stairs:false` because Planner 35 correctly leaves stairs unresolved.
