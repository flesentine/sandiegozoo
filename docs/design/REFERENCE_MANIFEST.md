# WildRoute Visual Reference Manifest

**Status:** Approved visual direction  
**Rule:** References define hierarchy, art direction, density, and visual language. They do **not** define production text metrics, exact geometry, accessibility behavior, or Zoo geography.

The approved second-pass ImageGen set is:

| Screen | Canonical reference | ImageGen generation id | Notes |
|---|---|---|---|
| Welcome | `01-welcome-v2.png` | `e0938358-ee16-4dba-8f0b-d7a5c95a4708` | Simplified three-action welcome |
| Your Visit | `02-your-visit-v2.png` | `ec8a797d-d962-4996-850e-96a2be30aeea` | Reservation/accessibility are detail flows |
| Priorities | `03-priorities-v2.png` | `149be416-2d71-40a1-bfe1-80c7763d3931` | High-contrast animal labels/badges |
| Your Day | `04-your-day-v2.png` | `26ee6e70-8aa6-4246-9d30-38ba6e7f06d4` | Scrollable food choices |
| Day Summary | `05-day-summary-v2.png` | `e7ee8925-7c08-419b-a5e6-30454a487744` | Functional summary dominates hero art |
| NEXT | `06-next-v2.png` | `f08c9294-48dc-4a87-9e15-7556c300b577` | Primary North Star screen |
| Map | `07-map-v2.png` | `06b6d64a-b854-4ad8-8218-520dfa1342dd` | **STYLE ONLY — NOT GEOGRAPHIC TRUTH** |
| Change Plans | `08-change-plans-v2.png` | `67e401ac-1a0e-47f2-b92e-77544b7a6535` | Includes unavailable-state recovery |

## Implementation priority

If tradeoffs are required, preserve the hierarchy of the **NEXT** reference first.

The NEXT screen should communicate in roughly one second:

1. where to go
2. how long it takes
3. why it is a good choice
4. how to start

## Asset note

The reference PNGs were created during the product design session. Their canonical filenames are reserved above so they can be added to `docs/design/references/` without changing downstream documentation.

## Production corrections already frozen

Do not reproduce these concept-art artifacts in production:

- NEXT label on planning screens
- generic four-tab bottom navigation
- fictional map geography
- excessive repeated marketing slogans
- ImageGen-generated exact text spacing
