# WildRoute Design System

The source-of-truth implementation tokens live in:

- `src/styles/tokens.css`
- `src/design/tokens.ts`

## Semantic colors

| Meaning | Token / family |
|---|---|
| Primary brand / primary action | forest |
| Base background | surface |
| Raised cards | surface-raised |
| Must-See | clay |
| Favorite | favorite |
| Timed event | timed |
| Reservation / locked | locked |
| Warning / unavailable | warning |
| Bonus opportunity | bonus |

Status meaning must include words and/or icons. Color is supplemental.

## Typography

### Display

Use the display serif family for:

- page titles
- destination names
- major section headings

### Body

Use the sans-serif family for:

- buttons
- times
- distances
- control labels
- body copy
- helper text

### Handwritten treatment

Decorative only. Never use for essential information.

## Control contract

- minimum interactive target: 44 px
- primary button: 56 px minimum height
- primary CTA uses forest background and high-contrast text
- disabled controls retain readable labels
- focus-visible ring is mandatory on keyboard-capable surfaces

## Shape language

- cards: large rounded corners
- primary actions: pill shape
- badges: pill shape
- avoid excessive glass/translucency because the product is primarily used outdoors

## Motion

Motion should explain state change, not decorate.

Respect `prefers-reduced-motion`.

## Live navigation

The live bottom navigation is frozen to:

1. Next
2. Map
3. My Day

The active state must include more than a subtle color shift.

## Priority badge vocabulary

Canonical labels:

- 🔥 Must-See
- ♥ Favorite
- ◷ Timed
- ▣ Reservation

Do not invent alternate names casually across screens.

## Responsive behavior

The reference artwork represents a modern large iPhone, not a fixed canvas.

Production layouts must support:

- 320 px wide minimum
- small and large phones
- text zoom / larger text
- safe-area insets
- PWA browser chrome

No essential control may depend on absolute coordinates from the reference images.
