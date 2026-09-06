# WildRoute

Unofficial smart day planner for visits to the San Diego Zoo.

WildRoute plans around must-see wildlife, timed presentations, dining preferences, walking effort, accessibility needs, transportation, and the visitor's actual location, then continuously recommends what to do next.

> Unofficial project. Not affiliated with San Diego Zoo Wildlife Alliance.

## UX baseline

The frozen UX foundation lives in:

- [UX foundation](docs/ux/UX_FOUNDATION.md)
- [Screen and state contract](docs/ux/SCREEN_STATE_CONTRACT.md)
- [Design system](docs/design/DESIGN_SYSTEM.md)
- [Visual reference manifest](docs/design/REFERENCE_MANIFEST.md)

The approved live navigation is **Next / Map / My Day**. The generated map artwork is a visual reference only; production geography must come from verified Zoo coordinates and the real route graph.

## Development

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

The UI shell uses React + TypeScript + Vite. Planner and routing logic will remain deterministic and independently testable.
